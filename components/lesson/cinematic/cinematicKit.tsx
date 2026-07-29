import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, FadeInDown,
  LinearTransition, runOnJS, type SharedValue,
} from 'react-native-reanimated';
import SketchIcon from '@/components/shared/SketchIcon';
import { ease01, seg } from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// Shared kit for cinematic lessons — the parts that are identical across every
// lesson, extracted from the logic-arguments-1 / -2 players so a new lesson is
// just a SCRIPT (beats) + a SCENE (the animated stage). This module owns the deck
// (the sequential Fade, the narration, the graded/tap questions, the saveable
// quote card, the summary) and the small shared vocabulary of types and tokens.
//
// The player shell lives in CinematicPlayer.tsx; the scene is per-lesson.
// ─────────────────────────────────────────────────────────────────────────────

export const INK = '#1A1A1A';
export const PAPER = '#FAFAF7';
export const SOFT = '#6B6B6B';
export const RULE = '#E4E1D8';

export const STAGE_W = 400;
export const STAGE_H = 560;
export const GROUND = 500;

// WHY LESSONS SHOULD DECLARE A BAND.
//
// The stage REGION on a phone is wide and short (roughly 923×647 device px) while
// this design space is tall and narrow (400×560). Fitting all 560 in letterboxes
// the scene to about 1.15× and throws away half the available width — which is
// exactly why the animations read small. Most scenes leave the top third as empty
// sky, so cropping to the slice that actually holds art and scaling THAT up is free
// size: a lesson whose art lives in y 180..510 fits at ~1.96× instead of 1.15×,
// nearly doubling everything on screen.
//
// The default below is the whole space, so a lesson that declares nothing is never
// silently clipped. Every lesson should pass its own measured [top, bottom] to
// CinematicPlayer — it must contain EVERY prop the scene draws (remember a figure
// standing on GROUND=500 has its crown at about y=361), and if the scene applies a
// camera translation, measure the band AFTER that shift.
export const BAND_T = 0;
export const BAND_B = STAGE_H;
// HOW BIG THE FIGURE SHOULD BE.
//
// It was 1.35 — 103 rig units × 1.35 = 139 stage units. Against a typical declared
// band of 280–330 that is HALF the visible height, and on a phone it came out at
// 42–47% of the stage region: one character filling the frame while the props it is
// meant to be talking about sat around it like furniture in a doll's house. The
// figure was never wrong in isolation; it was wrong relative to everything else,
// which is exactly the complaint.
//
// The band crop is what surfaced it. Cropping to the art doubled the on-screen size
// of the whole scene, and the figure — already the tallest thing in most scenes —
// grew with it.
//
// 1.0 puts the figure at 103 units: about a THIRD of a typical band (31–35% of the
// stage region on a phone), which is where a character sits in an illustrated scene
// without dominating it. It is still ~230px tall on the device, so nothing is lost
// in legibility. Its crown drops from y 361 to y 397, so every band measured to
// hold the old crown still holds this one — a shorter figure cannot clip.
//
// What this DOES affect is reach: a hand that just touched a board or a lever at
// 1.35 now falls about a quarter shorter, so any scene where the figure makes
// contact with a prop needs its x (or the prop) nudged to meet again.
export const K_FIG = 1.0;                  // stage units per rig unit
export const XFADE = 420;                  // beat-to-beat deck fade (ms)
export const COMPLETION_XP = 5;            // matches LessonRunner

// ── shared beat vocabulary ─────────────────────────────────────────────────────
export interface Choice { id: string; text: string; correct: boolean }
export interface Say { who: string; text: string }
export interface QuoteBlock {
  id: string; text: string; author: string; work: string; era: string;
  philosopherId?: string; branchSlugs?: string[];
}
export interface QBlock { prompt: string; options: Choice[]; explain: string; xp?: number }
export interface SummaryBlock { title: string; points: string[]; closing: string }
/**
 * A SCENE-DRIVEN graded question: the answer UI lives IN the animated stage (tap an
 * object, choose a path, tip a balance, feed a machine) rather than as a text list.
 * The scene renders its own targets and calls `onPick(id, correct)`; the deck shows
 * only this prompt and, once answered, the explanation. Scored exactly like `mc`.
 */
export interface InteractBlock { prompt: string; explain: string; xp?: number }

/** Every lesson's Beat extends this; the shell reads only these common fields. */
export interface BaseBeat {
  text?: string;
  cite?: string;
  say?: Say[];
  quote?: QuoteBlock;
  tap?: QBlock;                            // ungraded teaching tap
  mc?: QBlock;                             // graded question (A/B/C/D in the deck)
  interact?: InteractBlock;                // graded question answered IN the scene
  summary?: SummaryBlock;
  dur: number;
}

/** Beats that hold the reader until they answer, rather than until they tap. */
export function gates(b: BaseBeat) { return Boolean(b.tap || b.mc || b.interact); }

// ── beat-to-beat transition (SEQUENTIAL) ──────────────────────────────────────
// Fade the deck fully out, swap content while invisible, fade back in. `render`
// (not children) produces content only when it changes: a beat change (`trigger`)
// fades; an in-beat change (answering, saving a quote) swaps live via `revision`.
export function Fade({
  trigger, revision, duration, render, onSwap,
}: {
  trigger: number; revision: string; duration: number; render: () => React.ReactNode;
  /**
   * Fired at the instant the content is exchanged — which is the one moment the
   * deck is fully invisible. Anything that changes the LAYOUT around the deck has
   * to happen here, or it happens while the old content is still on screen.
   */
  onSwap?: () => void;
}) {
  const OUT = Math.round(duration * 0.4);
  const IN = Math.round(duration * 0.6);
  const vis = useSharedValue(1);
  const renderRef = useRef(render);
  renderRef.current = render;
  const [content, setContent] = useState<React.ReactNode>(() => render());
  const lastTrigger = useRef(trigger);
  const lastRev = useRef(revision);
  const mounted = useRef(false);

  // Build the new content ON THE JS THREAD — a withTiming completion callback is a
  // worklet, and building React elements there crashes the screen. Always runOnJS.
  const onSwapRef = useRef(onSwap);
  onSwapRef.current = onSwap;
  const swap = useCallback(() => {
    setContent(renderRef.current());
    onSwapRef.current?.();
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      lastTrigger.current = trigger;
      lastRev.current = revision;
      return;
    }
    if (trigger !== lastTrigger.current) {
      lastTrigger.current = trigger;
      lastRev.current = revision;
      vis.value = withTiming(0, { duration: OUT, easing: Easing.in(Easing.quad) }, (fin) => {
        if (fin) runOnJS(swap)();
      });
    } else if (revision !== lastRev.current) {
      lastRev.current = revision;
      swap();
    }
  }, [trigger, revision]);

  useEffect(() => {
    if (!mounted.current) return;
    vis.value = withTiming(1, { duration: IN, easing: Easing.out(Easing.cubic) });
  }, [content]);

  const style = useAnimatedStyle(() => ({
    opacity: vis.value,
    transform: [{ translateY: (1 - vis.value) * 6 }],
  }));

  return <Animated.View style={[styles.fadeWrap, style]}>{content}</Animated.View>;
}

// ── speech bubble (positioned by the scene) ───────────────────────────────────
//
// WHY THIS GROWS FROM ITS TAIL.
//
// A View scales about its CENTRE. This bubble is anchored by one corner (left/right
// + top) and its width is whatever the text makes it — so scaling it from 0.6 walked
// the whole box diagonally into place: on a 150-wide bubble the left edge started 30
// units inboard and slid outward as it inflated, and the top edge rose 8 at the same
// time. That diagonal slide, not the scale itself, is the "glitchy" motion — a
// speech bubble that swims into position instead of popping out of the mouth.
//
// The fix is to pin the TAIL. Scaling about the centre maps a point p (measured from
// the centre) to s·p, so translating by p·(1−s) holds p exactly still. The tail's
// offset needs the measured width, hence onLayout — the alternative, transformOrigin,
// cannot express "29 from the right edge" when the width is unknown.
//
// It also LEAVES now. Every other stage graphic fades out over 0.25s; the bubbles
// alone were cut dead on the tap, which is the one inconsistency you could see.
const TAIL_C = 29;          // tail centre, in from the anchored edge (24 margin + 5 half-width)
// ...and UP from the wrapper's bottom edge. The wrapper lays out as box + (−5 margin
// + 10 tail) = boxH + 5, and the tail's centre lands at boxH — five short of the
// bottom. Treating the bottom edge as the anchor left 0.9px of vertical creep.
const TAIL_UP = 5;

export function Bubble({
  bt, text, side, top, shout, leaving,
}: {
  bt: SharedValue<number>; text: string; side: 'left' | 'right'; top: number; shout?: boolean;
  /** Rendered for the beat that just ended — holds still and fades out. */
  leaving?: boolean;
}) {
  const left = side === 'left';
  const w = useSharedValue(0);
  const h = useSharedValue(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    w.value = e.nativeEvent.layout.width;
    h.value = e.nativeEvent.layout.height;
  }, []);

  const st = useAnimatedStyle(() => {
    if (leaving) return { opacity: 1 - ease01(seg(bt.value, 0, 0.22)), transform: [{ scale: 1 }] };
    const e = ease01(seg(bt.value, 0.12, 0.46));
    // Lands with a real settle: past 1 and back, rather than the old curve that
    // only ever eased up to 1 (its "overshoot" term never took the scale over 1).
    const s = 0.78 + 0.22 * e + Math.sin(Math.PI * e) * 0.05;
    const ax = left ? TAIL_C : w.value - TAIL_C;
    return {
      // Opaque well before it stops growing — a long semi-transparent inflate is
      // what makes a pop read as a smear.
      opacity: ease01(seg(bt.value, 0.12, 0.30)),
      transform: [
        { translateX: (ax - w.value / 2) * (1 - s) },
        { translateY: (h.value / 2 - TAIL_UP) * (1 - s) },
        { scale: s },
      ],
    };
  });

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.bubble,
        left ? { left: 14, alignItems: 'flex-start' } : { right: 14, alignItems: 'flex-end' },
        { top },
        st,
      ]}
    >
      <View style={[styles.bubbleBox, shout && styles.bubbleShout]}>
        <Text style={[styles.bubbleText, shout && styles.bubbleShoutText]}>{text}</Text>
      </View>
      <View style={[styles.tail, shout && { backgroundColor: INK }, left ? { marginLeft: 24 } : { marginRight: 24 }]} />
    </Animated.View>
  );
}

// ── choices (teaching taps + graded questions) ────────────────────────────────
export function Choices({
  prompt, options, explain, picked, graded, onPick,
}: {
  prompt: string;
  options: Choice[];
  explain: string;
  picked: string | null;
  graded?: boolean;
  onPick: (id: string, correct: boolean) => void;
}) {
  const answered = picked !== null;
  const gotIt = answered && options.find((o) => o.id === picked)?.correct;
  return (
    <Animated.View style={styles.qWrap} layout={LinearTransition.duration(300)}>
      <Text style={styles.prompt}>{prompt}</Text>
      {options.map((o) => {
        const chosen = picked === o.id;
        const reveal = answered && o.correct;
        // Once answered, drop the options that are neither the pick nor the answer,
        // so a four-option question plus its explanation fits the fixed deck.
        if (answered && !chosen && !o.correct) return null;
        return (
          <Pressable
            key={o.id}
            disabled={answered}
            onPress={() => onPick(o.id, o.correct)}
            style={({ pressed }) => [
              styles.opt,
              reveal && styles.optRight,
              chosen && !o.correct && styles.optWrong,
              pressed && !answered && { opacity: 0.75 },
            ]}
          >
            <Text style={[styles.optText, reveal && styles.optRightText]}>{o.text}</Text>
          </Pressable>
        );
      })}
      {answered ? (
        <Animated.View style={styles.explain} entering={FadeInDown.duration(300)}>
          <Text style={styles.explainHead}>
            {gotIt ? (graded ? 'Correct  ·  +5 XP' : 'That’s the one') : 'Not quite'}
          </Text>
          <Text style={styles.explainText}>{explain}</Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

// ── scene-driven question (answered in the stage, not the deck) ───────────────
// The deck shows the prompt and, once answered, the Correct/Not-quite reveal. The
// tappable targets live in the SCENE, which calls onPick — so this panel has no
// buttons of its own. `answered`/`correct` are owned by the player.
export function InteractPanel({
  prompt, explain, answered, correct,
}: { prompt: string; explain: string; answered: boolean; correct: boolean }) {
  return (
    <Animated.View style={styles.qWrap} layout={LinearTransition.duration(300)}>
      <Text style={styles.prompt}>{prompt}</Text>
      {!answered ? (
        <Text style={styles.interactHint}>Answer in the scene above ↑</Text>
      ) : (
        <Animated.View style={styles.explain} entering={FadeInDown.duration(300)}>
          <Text style={styles.explainHead}>{correct ? 'Correct  ·  +5 XP' : 'Not quite'}</Text>
          <Text style={styles.explainText}>{explain}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ── quote + summary ───────────────────────────────────────────────────────────
export function QuoteCard({
  q, saved, onToggle,
}: {
  q: { text: string; author: string; work: string; era: string };
  saved: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.quoteText}>{q.text}</Text>
      <View style={styles.quoteFoot}>
        <Pressable onPress={onToggle} hitSlop={12}>
          <SketchIcon name={saved ? 'bookmark-filled' : 'bookmark'} size={18} color={saved ? INK : SOFT} />
        </Pressable>
        <Text style={styles.quoteBy}>
          {q.author.toUpperCase()}  ·  {q.work}, {q.era}
        </Text>
      </View>
    </View>
  );
}

export function SummaryCard({ s }: { s: SummaryBlock }) {
  return (
    <View style={styles.sumWrap}>
      <Text style={styles.sumTitle}>{s.title}</Text>
      {s.points.map((p) => (
        <View key={p} style={styles.sumRow}>
          <Text style={styles.sumDot}>•</Text>
          <Text style={styles.sumPoint}>{p}</Text>
        </View>
      ))}
      <Text style={styles.sumClose}>{s.closing}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },
  body: { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 4, gap: 12 },
  close: { padding: 4 },
  track: { flex: 1, height: 2, backgroundColor: RULE, overflow: 'hidden' },
  // Full-width bar scaled from the left, so a smooth scaleX reads as the fill
  // advancing (a percentage-width jump on each tap is what we're replacing).
  fill: { position: 'absolute', left: 0, top: 0, height: 2, width: '100%', backgroundColor: INK, transformOrigin: '0% 50%' },

  // Fixed proportions (content-independent) so the stage never resizes on a tap.
  // A slightly shorter stage than 46/46 so the deck holds a 3-line prompt + four
  // two-line options without clipping the last one.
  stageWrap: { flex: 42, alignItems: 'center', justifyContent: 'flex-end' },
  stageGone: { flex: 0, height: 0 },
  deckTall: { flex: 92, justifyContent: 'center' },
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },

  bubble: { position: 'absolute', maxWidth: 210 },
  bubbleBox: {
    borderWidth: 1.5, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, paddingHorizontal: 12, paddingVertical: 8,
  },
  bubbleShout: { backgroundColor: INK },
  bubbleText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: INK, lineHeight: 18 },
  bubbleShoutText: { fontFamily: 'Inter_700Bold', color: PAPER, letterSpacing: 0.4 },
  tail: { width: 10, height: 10, backgroundColor: INK, transform: [{ rotate: '45deg' }], marginTop: -5 },

  deck: { flex: 50, paddingHorizontal: 24, justifyContent: 'flex-start', overflow: 'hidden' },
  fadeWrap: { position: 'relative' },
  narr: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 18, lineHeight: 27, color: INK },
  cite: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.6, color: SOFT, marginBottom: 7 },

  qWrap: { marginTop: 2 },
  prompt: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: INK, marginBottom: 8, lineHeight: 21 },
  interactHint: { fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 0.5, color: SOFT, fontStyle: 'italic' },
  opt: {
    borderWidth: 1.5, borderColor: RULE, borderRadius: 5,
    paddingVertical: 8, paddingHorizontal: 14, marginBottom: 6, backgroundColor: PAPER,
  },
  optRight: { borderColor: INK, backgroundColor: INK },
  optRightText: { color: PAPER, fontFamily: 'Inter_700Bold' },
  optWrong: { borderColor: SOFT, opacity: 0.55 },
  optText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: INK, lineHeight: 18 },
  explain: { marginTop: 4, borderLeftWidth: 2, borderLeftColor: INK, paddingLeft: 12, paddingVertical: 2 },
  explainHead: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: INK, marginBottom: 4 },
  explainText: { fontFamily: 'Inter_400Regular', fontSize: 13.5, color: SOFT, lineHeight: 20 },

  quoteCard: { borderWidth: 1.5, borderColor: INK, borderRadius: 3, padding: 18, marginTop: 2 },
  quoteMark: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 40, color: INK, height: 26, lineHeight: 36 },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 20, lineHeight: 30, color: INK, marginTop: 8,
  },
  quoteFoot: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  quoteBy: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.4, color: SOFT, flex: 1 },

  sumWrap: { marginTop: 2 },
  sumTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: INK, marginBottom: 12 },
  sumRow: { flexDirection: 'row', gap: 10, marginBottom: 7 },
  sumDot: { fontSize: 16, lineHeight: 21, color: INK },
  sumPoint: { fontFamily: 'Inter_400Regular', fontSize: 14.5, color: INK, lineHeight: 21, flex: 1 },
  sumClose: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 16, color: SOFT, lineHeight: 24, marginTop: 12,
  },

  tapLayer: { flex: 8, alignItems: 'center', justifyContent: 'center' },
  hint: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 2, color: SOFT },
});
