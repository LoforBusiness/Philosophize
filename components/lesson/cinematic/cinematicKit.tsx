import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
export const K_FIG = 1.35;                 // stage units per rig unit
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

/** Every lesson's Beat extends this; the shell reads only these common fields. */
export interface BaseBeat {
  text?: string;
  cite?: string;
  say?: Say[];
  quote?: QuoteBlock;
  tap?: QBlock;                            // ungraded teaching tap
  mc?: QBlock;                             // graded question
  summary?: SummaryBlock;
  dur: number;
}

/** Beats that hold the reader until they answer, rather than until they tap. */
export function gates(b: BaseBeat) { return Boolean(b.tap || b.mc); }

// ── beat-to-beat transition (SEQUENTIAL) ──────────────────────────────────────
// Fade the deck fully out, swap content while invisible, fade back in. `render`
// (not children) produces content only when it changes: a beat change (`trigger`)
// fades; an in-beat change (answering, saving a quote) swaps live via `revision`.
export function Fade({
  trigger, revision, duration, render,
}: { trigger: number; revision: string; duration: number; render: () => React.ReactNode }) {
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
  const swap = useCallback(() => setContent(renderRef.current()), []);

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
export function Bubble({
  bt, text, side, top, shout,
}: { bt: SharedValue<number>; text: string; side: 'left' | 'right'; top: number; shout?: boolean }) {
  const left = side === 'left';
  const st = useAnimatedStyle(() => {
    const u = seg(bt.value, 0.1, 0.5);
    const s = 0.6 + 0.4 * ease01(u) + Math.sin(Math.PI * ease01(u)) * 0.08;
    return { opacity: ease01(u), transform: [{ scale: s }] };
  });
  return (
    <Animated.View
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
  track: { flex: 1, height: 2, backgroundColor: RULE },
  fill: { height: 2, backgroundColor: INK },
  count: { fontFamily: 'Inter_500Medium', fontSize: 11, color: SOFT, letterSpacing: 1 },

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
