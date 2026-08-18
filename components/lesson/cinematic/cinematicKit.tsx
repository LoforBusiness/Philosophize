import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, FadeInDown,
  LinearTransition, runOnJS, type SharedValue,
} from 'react-native-reanimated';
import SketchIcon from '@/components/shared/SketchIcon';
import { XP_PER_CORRECT_ANSWER } from '@/constants/xp';
import { ease01, seg, type Stance } from './rig';

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

// What the reader is TOLD a right answer is worth. Derived, never typed: this line
// read "+5 XP" for a while after the model went to 10 per correct answer, so every
// cinematic lesson quietly promised the reader less than half of what it paid.
export const CORRECT_LABEL = `Correct  ·  +${XP_PER_CORRECT_ANSWER} XP`;

// ── the narrator's manner (group M) ───────────────────────────────────────────
// The figure below the words is the one saying them, so his body has to agree
// with their tone (A1). These are the four poses that read as *put upon* — codes
// into the wide emote library in `rig.ts`, named so a scene asks for an attitude
// rather than for a number.
//
// They are the smallest half of the character. The voice is in the writing rules
// (group M of docs/LESSON_RULES.md); this is what stops the picture undercutting
// it by standing there explaining cheerfully.
export const SIGH = {
  FOLDED: 10,   // arms crossed — waiting, visibly, for the point to land
  SHRUG: 8,     // 'well, that is what the man said'
  HIP: 9,       // a hand on the hip — patience, and you can see it
  TEMPLE: 11,   // a hand to the head — he has explained this before
} as const;

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
/**
 * One of the two short choices a `cards` question puts on the picture.
 *
 * `text` is held to a few words by `validate-cinematic`, which is the whole
 * point of the format: the A/B/C/D deck it replaces asked a reader to get
 * through four sentences to answer one question, and three of them were wrong.
 */
export interface ChoiceCard { text: string; correct: boolean }

/**
 * One region of a `drag` question's line (see ./DragScale).
 *
 * `reads` is the word shown above the knob while it is in here, and it is the part
 * that TEACHES: the reader hunts the boundary by watching "a hunch" give way to "a
 * good bet" give way to "knowledge". It is lesson copy under group J, not scoring
 * furniture — keep it to a few plain words.
 */
export interface ScaleZone {
  id: string;
  /** This zone's right-hand edge as a fraction of the rail. The last must be 1. */
  upto: number;
  /** The reading shown while the knob is inside this zone. */
  reads: string;
  correct?: boolean;
}

/**
 * A graded question whose answer is a POSITION on a line rather than a choice.
 *
 * For the "how much" questions — how much may a society tolerate, how simple should
 * an explanation be, how sure are you — where offering two cards would answer the
 * interesting half of the question for the reader.
 */
export interface DragBlock {
  /** Label under the left end of the rail. */ lo: string;
  /** Label under the right end. */ hi: string;
  /** Where the knob starts, 0..1. Keep it OUT of the correct zone. */ start: number;
  /** Left to right, each `upto` greater than the last, the final one exactly 1. */
  zones: ScaleZone[];
}

export interface InteractBlock {
  prompt: string; explain: string; xp?: number;
  /**
   * Two short choices the PLAYER draws on the stage (see ./ChoiceCards).
   *
   * Omit it and the scene draws its own answer targets, exactly as the original
   * 82 interact lessons do — this is an addition to that mechanic, not a
   * replacement for it. Having both behind ONE block type is deliberate: the
   * scoring path, the deck panel and the XP are already right for `interact`,
   * and a third question type would have been a third thing to keep in step.
   */
  cards?: [ChoiceCard, ChoiceCard];
  /**
   * A line the reader drags a knob along (see ./DragScale). Mutually exclusive with
   * `cards` in practice — a question is either "which of these" or "how much".
   */
  drag?: DragBlock;
}

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
  /**
   * Where the figure stands on this beat, in stage x — the camera's x track.
   *
   * It lives on the BASE beat rather than on each lesson's own beat type because
   * `validate-cinematic` can only check a camera it can READ: the 45 converted
   * scenes all declare `const X = BEATS.map((b) => b.x ?? N)`, and a scene whose
   * beat type had no `x` compiled, ran, and was reported as "camera went
   * unchecked" — a shot nothing verifies against its band, which is the one thing
   * H60 exists to prevent. Declaring it once here is what makes the remaining
   * conversions checkable instead of merely working.
   *
   * Optional, and omitting it is normal: a scene whose figure does not move reads
   * `b.x ?? <its standing x>` and gets a constant track, which is the honest
   * input — `followMoves` then gives it the still-figure rhythm rather than
   * inventing travel that is not in the picture.
   */
  x?: number;
  /**
   * A rectangle in scene coordinates the camera MUST contain on this beat (H60c).
   *
   * Almost never written by hand: the measured union of each beat's on-stage words
   * lives in ./mustBoxes.ts, generated from the real render, and CinematicPlayer
   * reads it automatically. This is the override for the case measurement cannot
   * see — art with no text in it that the beat is nonetheless about, a prop the
   * narration points at, a diagram made of lines. Set it and it wins over the
   * measured box.
   *
   * It can only ever make the shot WIDER (see `containShot`), so declaring one is
   * safe: a beat whose camera already showed the rectangle is left exactly alone.
   */
  must?: readonly [x: number, y: number, w: number, h: number];
  dur: number;
}

/** Beats that hold the reader until they answer, rather than until they tap. */
export function gates(b: BaseBeat) { return Boolean(b.tap || b.mc || b.interact); }

// ── NOTHING MAY TELEPORT (group L) ────────────────────────────────────────────
//
// CinematicPlayer rewinds the beat clock during render — `bt.value = 0` — and
// every scene then builds its figure from
//
//     const n = bi.value, p = n - 1;
//     const tr = ease01(bt.value / 0.7);
//     mixStance(emoteHold(P[p], t), emoteLive(P[n], t, bt.value), tr)
//
// which hides two discontinuities, and a reader found both: "it looks as if there
// is a glitch on screen, or a frame miss."
//
//   1. THE SOURCE IS THE WRONG POSE. The new blend starts from `P[p]`, the pose
//      the last beat was heading TOWARD — not the pose actually on screen. Tap
//      before the blend finished and the figure covers the whole remaining
//      distance in one frame. The jump is (1 − tr_reached) × the gap, which is
//      exactly why it worsens the faster the reader taps.
//   2. THE GESTURE'S OWN CLOCK RESTARTS. `emoteLive(code, t, bt)` uses `bt` as the
//      gesture's local phase, so a hand halfway through a swing snaps back to the
//      beginning of that swing even when the blend fraction was already done.
//
// Measured over all 112 scenes with `npm run check:smooth`: the worst limb moved
// 3.0 units a frame when the reader waited and 24.9 when they did not, with a
// worst case of 40.5 — a hand crossing a tenth of the stage between two frames.
//
// THE FIX IS TO REMEMBER WHAT WAS ON SCREEN. `held` keeps the last stance the
// scene actually emitted; at a beat change that becomes the new blend's source,
// so the first frame of the new beat is identical to the last frame of the old
// one and the motion continues from there. It cannot pop, whatever the tap rate,
// because the two frames either side of the change are the same picture.

/** The three shared values `carryFrom` needs. One call per figure in a scene. */
export function useHeld() {
  return {
    last: useSharedValue<Stance | null>(null),
    from: useSharedValue<Stance | null>(null),
    seen: useSharedValue(-1),
  };
}
export type Held = ReturnType<typeof useHeld>;

/**
 * The pose a blend should start from: whatever was last drawn.
 *
 * `fallback` is used only on the very first frame of a lesson, when nothing has
 * been drawn yet — pass the scene's usual `emoteHold(P[p], t)` for that.
 */
export function carryFrom(held: Held, n: number, fallback: Stance): Stance {
  'worklet';
  if (held.seen.value !== n) {
    held.seen.value = n;
    held.from.value = held.last.value;
  }
  return held.from.value ?? fallback;
}

/** Record what was drawn, so the next beat change can start from it. */
export function keepHeld(held: Held, s: Stance): Stance {
  'worklet';
  held.last.value = s;
  return s;
}

/**
 * A facing that turns instead of mirroring.
 *
 * `pose()` takes `dir` as a raw ±1, so a scene that turns the figure round flips
 * the sign between two frames and the whole man inverts at once — measured at 31
 * units, and unlike the blend defect it happens however patiently the reader
 * taps. Easing the sign through zero turns him through a profile instead, which
 * is what a body does. Feed it `bt` and the beat's own facing.
 */
export function facing(from: number, to: number, t: number, dur = 0.36): number {
  'worklet';
  if (from === to) return to;
  const u = t <= 0 ? 0 : t >= dur ? 1 : t / dur;
  return from + (to - from) * (u * u * (3 - 2 * u));
}

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
// ...and how far the tail's centre sits UP from the wrapper's bottom edge. The
// wrapper lays out as box + (−6 margin + 12 tail) + 20 leader, and treating the
// bottom edge as the anchor left visible vertical creep.
const TAIL_UP = 26;
const LEADER_H = 20;        // the line that runs from the tail down toward the head
const EDGE = 10;            // keep the box this far inside the stage

export function Bubble({
  bt, text, x, top, shout, leaving,
}: {
  bt: SharedValue<number>;
  text: string;
  /** SCREEN x of the speaker, in stage units — the bubble centres over it. */
  x: SharedValue<number>;
  top: number;
  shout?: boolean;
  /** Rendered for the beat that just ended — holds still and fades out. */
  leaving?: boolean;
}) {
  const w = useSharedValue(0);
  const h = useSharedValue(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    w.value = e.nativeEvent.layout.width;
    h.value = e.nativeEvent.layout.height;
  }, []);

  // WHERE IT SITS. Over the speaker's head, not at a fixed stage edge — which is the
  // whole point: with two figures talking in turn, a box pinned to the left margin
  // says nothing about who said it. It tracks the figure (the speakers move: the
  // boxers close and open range all round), and clamps so a long line never walks
  // off the stage.
  const wrap = useAnimatedStyle(() => {
    const half = w.value / 2;
    const lo = half + EDGE, hi = STAGE_W - half - EDGE;
    const cx = Math.max(lo, Math.min(hi, x.value));
    return { transform: [{ translateX: cx - STAGE_W / 2 }] };
  });

  // The pointer leans back toward the speaker when the box has been clamped, so it
  // still says "this one" even when the box could not sit directly overhead.
  const point = useAnimatedStyle(() => {
    const half = w.value / 2;
    const lo = half + EDGE, hi = STAGE_W - half - EDGE;
    const cx = Math.max(lo, Math.min(hi, x.value));
    const off = Math.max(-(half - 20), Math.min(half - 20, x.value - cx));
    return { transform: [{ translateX: off }] };
  });

  const st = useAnimatedStyle(() => {
    if (leaving) {
      // Out FIRST, and fully, before the next one starts at 0.22 — the two used to
      // overlap for a tenth of a second and the swap read as a flicker.
      return { opacity: 1 - ease01(seg(bt.value, 0, 0.18)), transform: [{ scale: 1 }] };
    }
    const e = ease01(seg(bt.value, 0.22, 0.52));
    const s = 0.86 + 0.14 * e + Math.sin(Math.PI * e) * 0.035;
    return {
      opacity: ease01(seg(bt.value, 0.22, 0.38)),
      transform: [
        { translateY: (h.value / 2 - TAIL_UP) * (1 - s) },
        { scale: s },
      ],
    };
  });

  return (
    <Animated.View style={[styles.bubbleWrap, { top }, wrap]} pointerEvents="none">
      <Animated.View onLayout={onLayout} style={[styles.bubble, st]}>
        <View style={[styles.bubbleBox, shout && styles.bubbleShout]}>
          <Text style={[styles.bubbleText, shout && styles.bubbleShoutText]}>{text}</Text>
        </View>
        <Animated.View style={[styles.point, point]}>
          <View style={[styles.tail, shout && styles.tailShout]} />
          <View style={styles.leader} />
        </Animated.View>
      </Animated.View>
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
            {gotIt ? (graded ? CORRECT_LABEL : 'That’s the one') : 'Not quite'}
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
  prompt, explain, answered, correct, targets = 0,
}: { prompt: string; explain: string; answered: boolean; correct: boolean; targets?: number }) {
  // "Answer in the scene above ↑" was the entire instruction, and it tells the
  // reader nothing they did not already know. What they could not tell was WHICH
  // things were answerable — so the hint now names the number of marked things,
  // which Target.tsx counts for itself. No lesson declares it and none can get it
  // wrong. If the count is somehow zero the old wording still stands, because a
  // hint that says "tap one of the 0 marked parts" is worse than a vague one.
  const hint = targets >= 2
    ? `Tap one of the ${targets} outlined parts above ↑`
    : targets === 1
      ? 'Tap the outlined part above ↑'
      : 'Answer in the scene above ↑';
  return (
    <Animated.View style={styles.qWrap} layout={LinearTransition.duration(300)}>
      <Text style={styles.prompt}>{prompt}</Text>
      {!answered ? (
        <Text style={styles.interactHint}>{hint}</Text>
      ) : (
        <Animated.View style={styles.explain} entering={FadeInDown.duration(300)}>
          <Text style={styles.explainHead}>{correct ? CORRECT_LABEL : 'Not quite'}</Text>
          <Text style={styles.explainText}>{explain}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// The narration line is a plain paragraph, and that is the whole of it.
//
export const NARR_SIZE = 18;
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

  // A full-stage-width strip the bubble is centred in, so one translateX puts it
  // over whichever figure is speaking.
  bubbleWrap: { position: 'absolute', left: 0, width: STAGE_W, alignItems: 'center' },
  bubble: { maxWidth: 216, alignItems: 'center' },
  bubbleBox: {
    borderWidth: 2, borderColor: INK, borderRadius: 5,
    backgroundColor: PAPER, paddingHorizontal: 13, paddingVertical: 9,
  },
  bubbleShout: { backgroundColor: INK },
  bubbleText: {
    fontFamily: 'Inter_500Medium', fontSize: 13.5, color: INK, lineHeight: 18.5,
    textAlign: 'center',
  },
  bubbleShoutText: { fontFamily: 'Inter_700Bold', color: PAPER, letterSpacing: 0.5 },
  // The pointer: a triangle that reads as part of the box, then a line running on
  // down toward the head, so there is no doubt which figure is speaking.
  point: { alignItems: 'center', marginTop: -6 },
  tail: { width: 12, height: 12, backgroundColor: INK, transform: [{ rotate: '45deg' }] },
  tailShout: { backgroundColor: INK },
  leader: { width: 2, height: LEADER_H, backgroundColor: INK, marginTop: -2, opacity: 0.55 },

  deck: { flex: 50, paddingHorizontal: 24, justifyContent: 'flex-start', overflow: 'hidden' },
  fadeWrap: { position: 'relative' },
  narr: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: NARR_SIZE, lineHeight: 27, color: INK },
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
