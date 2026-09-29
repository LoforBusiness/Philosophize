import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import SetArt from './SetArt';
import { BEATS } from './metaphysicsScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, stand, type Bundle,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { handsOnDesk, handOn, type Desk } from './solid';
import { useLinger } from './useLinger';
import { attendAt } from './attend';
import {
  projector, controlDesk, dominoBox, skyline, leverPivot, leverDeg, CONSOLE, LENS, LEVER,
} from './metaphysicsSet';
import { DEEP, EMBER, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// metaphysics-being-1, "Why Does Anything Exist?" — IN A PLANETARIUM AT NIGHT.
//
// Redrawn 2026-09-25, one of five first lessons the owner asked for after the logic
// debate studio: *"completely redesign them … and be unique on how the information is
// displayed."* Here the information is PROJECTED: every idea is a slide of light the
// projector throws onto the dome among the stars.
//
//   b0–1   the dome full of stars; WHY ANYTHING AT ALL? projected, then Leibniz's
//          name for it — the first question.
//   b2–4   the principle of sufficient reason as a slide; NEEDS A REASON tags the sky.
//   b5–6   Parmenides' slide, NOTHING struck through; then the operator turns the
//          master dimmer down and the stars go out right to left — and the empty dome is still
//          there: STILL SOMETHING.
//   b7–10  a row of dominoes on the floor falls, each knocked by the one before, from
//          a box nobody explains; the slide says EACH STATE ← AN EARLIER STATE, then
//          asks BUT WHY ANY STATES AT ALL? The first question is asked ON THE STAGE:
//          tap the last domino, the first push, or the box.
//
// WHAT IS NOT CHANGED: every word of narration (metaphysicsScript.ts beats 0–11 keep
// their text and order; the voice is keyed by index).
//
// THE LESSONS OF THE LOGIC REDESIGN, APPLIED:
//   · his hands are ON the console (solid.ts, LESSON_RULES Y7): the back hand rests at
//     the low edge of its sloped top, the front hand by the dimmer, and a presenting
//     hand lands on the top rather than going into it;
//   · a prop, a slide or a card is mounted on its own beats and on the next only while
//     it fades (useLinger), so nothing pops out and nothing haunts the must-boxes;
//   · everything that moves reads the shared beat and clock together.
//
// COMPOSITION, in stage units: the dome is a half-ellipse, centre x 200, spring line
// 376, radii 186 × 144, so its crown is at 232; its cove ledge runs 374–382. Below it
// the wall: the projector (a Zeiss dumbbell, hub 50 · 426) throws its beam from its
// upper ball across the dome, the console (centre 298, top 450) stands before the
// operator at x 338, who faces left. On b6 his front hand takes the master dimmer
// (pivot x 311) and pulls it toward him as the stars go out; on b7 it takes it back
// up while they return, then lets go (2026-09-28, the owner: a hand that turns
// something visibly meets it). A skyline silhouette runs round the dome's base.
// The dominoes stand at x 128–237 and their box at 92, with the first push — a "?" —
// between them. The question plates hang at y 386–410.
// Nothing dark stands at his head's height (crown ~397): the dome ends at 382.
// Band [224, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);
const TR = 0.85;

const DOME = { cx: 200, base: 376, rx: 186, ry: 144 };
const FIG_X = CONSOLE.cx + 40; // the console's near edge (half 24) and a stride
const DESK: Desk = { cx: CONSOLE.cx, top: CONSOLE.top, half: CONSOLE.half, tilt: CONSOLE.tilt, side: 1 };
/** The master dimmer he pulls to take the sky down: its pivot on the console top. */
const PIVOT = leverPivot();
const SKYLINE = skyline(376);
const PROJECTOR = projector();
const DESK_ART = controlDesk();
const BOX_X = 92;
const BOX = dominoBox(BOX_X);
const DOM_X = [128, 148, 168, 188, 208, 228];
const DOM_W = 9;
const DOM_H = 32;
/** How far each domino ends up tipped: the last lies nearly flat, the rest lean on their neighbour. */
const DOM_REST = DOM_X.map((_, k) => (k === DOM_X.length - 1 ? 84 : 62));

// Stars on the dome, kept OFF the slide area (x 70…330, y 262…334) so no projected
// word ever sits on a dot. `th` is the dial setting at which a star goes out: the
// right-hand stars (nearest the console) first, so the sky goes out as a sweep.
const STAR_XY: [number, number, number][] = [
  [140, 252, 3], [170, 256, 2], [200, 244, 3], [228, 248, 2], [258, 254, 2.5],
  [48, 318, 2.5], [62, 292, 2], [76, 304, 2], [330, 292, 2.5], [342, 312, 2], [352, 330, 3],
  [150, 350, 2.5], [176, 340, 2],
  [226, 362, 2], [246, 348, 2.5], [282, 356, 2], [300, 340, 2.5], [332, 350, 2], [360, 346, 2.5],
];
const STARS = STAR_XY.map(([x, y, r], k) => ({
  x, y, r, th: 0.06 + 0.56 * ((384 - x) / 370), ph: (k * 1.37) % 6.28,
}));

// the beam from the lamp window to the slide in the middle of the dome
const SLIDE_C = { x: 200, y: 300 };
const BEAM_W = 158;
const BEAM_L = Math.hypot(SLIDE_C.x - LENS.x, SLIDE_C.y - LENS.y);
const BEAM_ROT = (Math.atan2(SLIDE_C.x - LENS.x, LENS.y - SLIDE_C.y) * 180) / Math.PI;

// the question on the stage: three plates, each on a leader to the thing it names
const PLATE_Y = 386;
const PLATE_H = 24;
const PLATE_W = 96;
const PICKS = [
  { id: 'box', label: 'WHY ANY EXIST', cx: 52, to: { x: BOX_X, y: 480 }, correct: true },
  { id: 'first', label: 'HOW IT BEGAN', cx: 151, to: { x: DOM_X[0] + 5, y: 474 }, correct: false },
  { id: 'last', label: 'WHY IT FELL', cx: 250, to: { x: DOM_X[5] + 22, y: 490 }, correct: false },
];

// ── per-beat tracks, read off the script ─────────────────────────────────────
const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const ERASE = BEATS.map((b) => b.erase ?? 0);
const CHAIN = BEATS.map((b) => (b.chain ? 1 : 0));
/** Only the beat that BRINGS the dominoes knocks them down; after that they lie fallen. */
const CHAIN_IN = CHAIN.map((v, k) => (v === 1 && (k === 0 || CHAIN[k - 1] === 0) ? 1 : 0));
const FIRST = BEATS.map((b) => (b.first ? 1 : 0));
const NEEDS = BEATS.map((b) => (b.needs ? 1 : 0));
const PARM = BEATS.map((b) => (b.parm ? 1 : 0));
const OPEN_LIT = BEATS.map((b) => ((b.open ?? 0) > 0 ? 1 : 0));
const PICK = BEATS.map((b) => (b.pick ? 1 : 0));
/** Which slide the projector shows: 1 the question, 2 the rule, 3 Parmenides, 4 the chain. */
const SLIDE = BEATS.map((b) => (b.chain ? 4 : b.parm ? 3 : b.rule ? 2 : 1));
const S1 = SLIDE.map((v) => (v === 1 ? 1 : 0));
const S2 = SLIDE.map((v) => (v === 2 ? 1 : 0));
const S3 = SLIDE.map((v) => (v === 3 ? 1 : 0));
const S4 = SLIDE.map((v) => (v === 4 ? 1 : 0));
/** Only the beat that raises a slide writes it; a slide that stays up holds finished. */
const RULE_IN = S2.map((v, k) => (v === 1 && (k === 0 || S2[k - 1] === 0) ? 1 : 0));
const PARM_IN = S3.map((v, k) => (v === 1 && (k === 0 || S3[k - 1] === 0) ? 1 : 0));
/** A presenting or star-gazing hand is off the console; otherwise both rest on it. */
const FREE = HPOSE.map((c) => (c === 2 || c === 6 ? 1 : 0));
const ERASED = ERASE.map((v) => (v > 0 ? 1 : 0));

function hHold(code: number, t: number) {
  'worklet';
  if (code >= 100) return emoteAny(code, t);
  return code === 0 ? stand(t) : narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number) {
  'worklet';
  if (code >= 100) return emoteAnyLive(code, t, bt);
  return code === 0 ? stand(t) : narratorLive(code, t, bt);
}

// The camera: `followMoves` gives each beat its own shot (H60b).
const X = BEATS.map((b) => b.x ?? FIG_X);
// R7b — the stage follows the order control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.order ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics'));

export default function MetaphysicsScene({
  clock, bt, bi, pickPos, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFigS = useHeld();
  const cv = useCarry(14);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;

    const figS = keepHeld(heldFigS, mixStance(carryFrom(heldFigS, n, hHold(HPOSE[p], t)), hLive(HPOSE[n], t, bt.value), tr));
    const free = carry(cv, 9, n, FREE[p], FREE[n], tr);
    // The dimmer goes down slowly: a hand taking the sky off, not a light switched off.
    // It starts once his hand is on it (0.35 s), and on the beat after, his hand takes
    // it back up while the stars return, then lets go.
    const erase = carry(cv, 0, n, ERASE[p], ERASE[n], ease01((bt.value - (ERASED[n] ? 0.35 : 0)) / 1.4));
    const grip = ERASED[n] ? ease01(bt.value / 0.35) : ERASED[p] ? 1 - ease01((bt.value - 1.4) / 0.4) : 0;
    const la = (leverDeg(erase) * Math.PI) / 180;
    const knobX = PIVOT.x + Math.sin(la) * LEVER.len;
    const knobY = PIVOT.y - Math.cos(la) * LEVER.len;
    // his front hand on the lever's knob, so the hand is what pulls the sky down (Y7)
    const atDesk = handOn(handsOnDesk(figS, FIG_X, DESK, free * (1 - grip), 6, 12), FIG_X, -1, knobX, knobY, grip, 1);

    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // At the slide as the projector throws it, the dimmer as he pulls it, the stars as
    // they go out, the dominoes as they fall — and at nothing (weight 0, his pose's
    // own head) once the thing is done. The generated gaze aimed every beat at the
    // middle of the picture, which on this set is the empty dome over his head.
    // Times are seconds into the beat, read off the voiced line (manifest) and the
    // scene's own event timings below. Slide rows are offsets from SLIDE_C measured
    // off the slide styles: title −9, caption +16, rule kicker −28, rule lines −13 and
    // +9, NOTHING −1, the chain line −19 and its ask +8, STILL SOMETHING +2.
    const b = bt.value;
    // where the dial has got to in putting the stars out, right to left: STARS' own
    // threshold (th = 0.06 + 0.56 · (384 − x) / 370) read backwards
    const sweepX = Math.max(48, Math.min(360, 384 - (370 * (erase - 0.06)) / 0.56));
    // the domino falling now: each tips 0.2 s after the last and takes 0.26 s (Domino)
    const fallX = DOM_X[0] + (DOM_X[DOM_X.length - 1] - DOM_X[0]) * clamp01((b - 0.7) / ((DOM_X.length - 1) * 0.2 + 0.26));
    const LK = n === 0
      // the question thrown up, then "everything that exists" — across the stars
      ? [0.3, SLIDE_C.x, SLIDE_C.y - 9, 1, 2.8, lerp(330, 70, clamp01((b - 2.8) / 3.0)), 250, 0.9, 5.9, 0, 0, 0]
      : n === 1
      // Leibniz's caption as it fades in (0.25–0.85 s), then "the first question"
      ? [0.25, SLIDE_C.x, SLIDE_C.y + 16, 1, 2.9, SLIDE_C.x, SLIDE_C.y - 9, 1, 5.4, 0, 0, 0]
      : RULE_IN[n]
      // the rule writing itself line by line (0.2–0.7, 0.55–1.05 s), back to it on
      // "nothing is true without a reason", then the whole sky for "the whole world"
      ? [0.2, SLIDE_C.x, SLIDE_C.y - 13, 1, 0.6, SLIDE_C.x, SLIDE_C.y + 9, 1, 2.6, SLIDE_C.x, SLIDE_C.y - 13, 0.9, 5.2, lerp(70, 330, clamp01((b - 5.2) / 2.5)), 250, 0.9, 8.4, 0, 0, 0]
      : NEEDS[n] && !NEEDS[p]
      // NEEDS A REASON tagging the sky (0.45–0.95 s; the tag's centre, 82 · 352),
      // the rule on "simpler than something", the stars on "a universe that
      // exists", and the tag again on "needs a reason"
      ? [0.4, 82, 352, 1, 1.8, SLIDE_C.x, SLIDE_C.y - 2, 0.9, 4.8, lerp(330, 90, clamp01((b - 4.8) / 1.8)), 252, 0.9, 7.3, 82, 352, 1, 8.0, 0, 0, 0]
      : PARM_IN[n]
      // NOTHING, and the strike drawn across it (1.2–1.8 s); then he thinks it over
      ? [0.3, SLIDE_C.x, SLIDE_C.y - 1, 1, 4.0, 0, 0, 0]
      : ERASED[n]
      // his hand on the dimmer, the stars going out right to left after it, STILL
      // SOMETHING as it is stamped (~1.0 s), the empty dome on "space and time",
      // the plate again on "even the dark void … is still something"
      ? [0, knobX, knobY, 1, 0.6, sweepX, 300, 1, 1.3, SLIDE_C.x, SLIDE_C.y + 2, 1, 2.2, DOME.cx, DOME.base - DOME.ry + 20, 0.8, 4.3, SLIDE_C.x, SLIDE_C.y + 2, 1, 7.6, 0, 0, 0]
      : CHAIN_IN[n]
      // the box the dominoes come out of, the chain falling left to right
      // (0.7–1.96 s), then EACH STATE ← AN EARLIER STATE on the slide
      ? [0.2, BOX_X, GROUND - 12, 1, 0.6, fallX, GROUND - 20, 1, 2.3, SLIDE_C.x, SLIDE_C.y - 19, 0.9, 4.9, 0, 0, 0]
      : OPEN_LIT[n] && !OPEN_LIT[p]
      // the fallen chain, the box on "states and laws already exist", the ask
      // as it lights, and the lit "?" (qMark's centre, 118 · 451) on "at all"
      ? [0.2, DOM_X[3], GROUND - 10, 0.8, 2.9, BOX_X, GROUND - 12, 1, 4.9, SLIDE_C.x, SLIDE_C.y + 8, 1, 6.0, 118, 451, 1]
      : PICK[n]
      // the first question, on the stage: softly, at the chain it is about
      ? [0.3, DOM_X[2], GROUND - 16, 0.7]
      : REACT[n]
      // the order question: softly, at the lit end of the chain as it reaches back
      ? [0.3, lerp(DOM_X[DOM_X.length - 1], DOM_X[0], clamp01(pickPos.value * 1.2)), GROUND - 16, 0.7]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    return {
      fig: lookPose(atDesk, FIG_X, GROUND, K_FIG, -1, 1, carry(cv, 11, n, lk.x, lk.x, tr), carry(cv, 12, n, lk.y, lk.y, tr), carry(cv, 13, n, 0, lk.w, tr)),
      erase,
      lever: leverDeg(erase),
      twinkle: t,
      stamp: clamp01((erase - 0.55) / 0.25),
      s1: carry(cv, 2, n, S1[p], S1[n], tr),
      s2: carry(cv, 3, n, S2[p], S2[n], tr),
      s3: carry(cv, 4, n, S3[p], S3[n], tr),
      s4: carry(cv, 5, n, S4[p], S4[n], tr),
      first: carry(cv, 6, n, FIRST[p], FIRST[n], ease01((bt.value - 0.25) / 0.6)),
      needs: carry(cv, 7, n, NEEDS[p], NEEDS[n], ease01((bt.value - 0.45) / 0.5)),
      // The rule writes itself line by line on the beat that raises it.
      ruleA: RULE_IN[n] === 1 ? ease01((bt.value - 0.2) / 0.5) : 1,
      ruleB: RULE_IN[n] === 1 ? ease01((bt.value - 0.55) / 0.5) : 1,
      // Parmenides: NOTHING, then the strike drawn across it, on the beat it arrives.
      parmStrike: PARM_IN[n] === 1 ? ease01((bt.value - 1.2) / 0.6) : 1,
      chainOn: carry(cv, 1, n, CHAIN[p], CHAIN[n], tr),
      chainIn: CHAIN_IN[n],
      bt: bt.value,
      headLit: carry(cv, 8, n, OPEN_LIT[p], OPEN_LIT[n], tr),
      // R7b — how far back the explanation reaches, on the order question's own beat.
      reach: carry(cv, 10, n, 0, reacting ? pickPos.value : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Dome S={SCENE} on={on} />
      <View style={styles.ledge} pointerEvents="none" />
      <View style={styles.cove} pointerEvents="none" />
      <SetArt parts={PROJECTOR} tone={TONE} />
      <Lever S={SCENE} />
      <SetArt parts={DESK_ART} tone={TONE} />
      <DialLights S={SCENE} />
      {on(CHAIN) ? <Dominoes S={SCENE} tags={!PICK[i]} /> : null}
      {PICK[i] ? <Picks picked={picked} onPick={onPick} /> : null}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

// ── the dome: the stars, the slides, and what is left when they are gone ────────

function Star({ S, star }: { S: SharedValue<any>; star: (typeof STARS)[number] }) {
  const st = useAnimatedStyle(() => {
    const gone = clamp01((S.value.erase - star.th) / 0.12);
    const tw = 0.6 + 0.4 * Math.sin(S.value.twinkle * 1.6 + star.ph);
    return { opacity: (1 - gone) * tw, transform: [{ scale: 0.5 + 0.5 * (1 - gone) }] };
  });
  // the brightest stars carry a four-point glint, which is what a star on a dome looks like
  const g = star.r * 3.4;
  return (
    <Animated.View
      style={[
        styles.star,
        { left: star.x - star.r, top: star.y - star.r, width: star.r * 2, height: star.r * 2, borderRadius: star.r },
        st,
      ]}
    >
      {star.r >= 3 ? (
        <>
          <View style={[styles.glint, { left: star.r - 0.5, top: star.r - g / 2, width: 1, height: g }]} />
          <View style={[styles.glint, { left: star.r - g / 2, top: star.r - 0.5, width: g, height: 1 }]} />
        </>
      ) : null}
    </Animated.View>
  );
}

/** A slide's opacity: its own track, and it dies with the stars when the dial goes down. */
function useSlide(S: SharedValue<any>, k: 's1' | 's2' | 's3' | 's4') {
  return useAnimatedStyle(() => ({ opacity: S.value[k] * (1 - clamp01((S.value.erase - 0.2) / 0.4)) }));
}

function Dome({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  // The beam is the projector at work: it shows while a slide does, and dies with the dial.
  const beam = useAnimatedStyle(() => {
    const v = S.value;
    const slide = Math.max(v.s1, v.s2, v.s3, v.s4);
    return { opacity: 0.13 * slide * (1 - clamp01((v.erase - 0.2) / 0.5)) };
  });
  const s1 = useSlide(S, 's1');
  const s2 = useSlide(S, 's2');
  const s3 = useSlide(S, 's3');
  const s4 = useSlide(S, 's4');
  const first = useAnimatedStyle(() => ({ opacity: S.value.first, transform: [{ translateY: (1 - S.value.first) * -4 }] }));
  const lineA = useAnimatedStyle(() => ({ opacity: S.value.ruleA, transform: [{ translateY: (1 - S.value.ruleA) * 5 }] }));
  const lineB = useAnimatedStyle(() => ({ opacity: S.value.ruleB, transform: [{ translateY: (1 - S.value.ruleB) * 5 }] }));
  const strike = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.parmStrike }] }));
  const why = useAnimatedStyle(() => ({ opacity: S.value.headLit, transform: [{ translateY: (1 - S.value.headLit) * 5 }] }));
  const needs = useAnimatedStyle(() => ({
    opacity: S.value.needs * (1 - clamp01((S.value.erase - 0.2) / 0.4)),
    transform: [{ scale: lerp(1.12, 1, S.value.needs) }],
  }));
  const still = useAnimatedStyle(() => ({
    opacity: S.value.stamp,
    transform: [{ scale: lerp(1.16, 1, S.value.stamp) }],
  }));
  return (
    <View style={styles.domeClip} pointerEvents="none">
      <View style={styles.domeRim} />
      <View style={styles.dome} />
      <View style={styles.domeShade} />
      <Animated.View style={[styles.beam, beam]} />
      {STARS.map((s, k) => <Star key={k} S={S} star={s} />)}
      <SetArt parts={SKYLINE} tone={TONE} />

      {on(S1) ? (
        <Animated.View style={[styles.slide, s1]}>
          <Text style={styles.slideTitle} numberOfLines={1}>WHY ANYTHING AT ALL?</Text>
          <Animated.Text style={[styles.slideCap, first]} numberOfLines={1}>THE FIRST QUESTION · LEIBNIZ, 1714</Animated.Text>
        </Animated.View>
      ) : null}
      {on(S2) ? (
        <Animated.View style={[styles.slide, s2]}>
          <Text style={styles.slideKicker} numberOfLines={1}>SUFFICIENT REASON</Text>
          <Animated.Text style={[styles.slideLine, lineA]} numberOfLines={1}>NOTHING IS TRUE</Animated.Text>
          <Animated.Text style={[styles.slideLine, lineB]} numberOfLines={1}>WITHOUT A REASON WHY</Animated.Text>
        </Animated.View>
      ) : null}
      {on(S3) ? (
        <Animated.View style={[styles.slide, s3]}>
          <Text style={styles.slideKicker} numberOfLines={1}>CAN IT BE THOUGHT?</Text>
          <View style={styles.nothWrap}>
            <Text style={styles.nothWord} numberOfLines={1}>NOTHING</Text>
            <Animated.View nativeID="strike-nothing" style={[styles.nothStrike, strike]} />
          </View>
        </Animated.View>
      ) : null}
      {on(S4) ? (
        <Animated.View style={[styles.slide, s4]}>
          <Text style={styles.slideLine} numberOfLines={1}>EACH STATE ← AN EARLIER STATE</Text>
          <Animated.Text style={[styles.slideAsk, why]} numberOfLines={1}>BUT WHY ANY STATES AT ALL?</Animated.Text>
        </Animated.View>
      ) : null}

      {on(NEEDS) ? (
        <Animated.View style={[styles.needsTag, needs]}>
          <Text style={styles.needsText} numberOfLines={1}>NEEDS A REASON</Text>
        </Animated.View>
      ) : null}
      {on(ERASED) ? (
        <Animated.View style={[styles.stillPlate, still]}>
          <Text style={styles.stillText} numberOfLines={1}>STILL SOMETHING</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── the console's level lights: they go out with the stars as the dial turns ──
const LIGHTS = [0, 1, 2, 3, 4];
function DialLight({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    // the right-hand light is the last to go, as the dial turns all the way down
    const gone = clamp01((S.value.erase - (0.1 + 0.14 * (4 - k))) / 0.1);
    return { opacity: 1 - 0.8 * gone };
  });
  return <Animated.View style={[styles.light, { left: CONSOLE.cx - 8.5 + k * 4 }, st]} />;
}
function DialLights({ S }: { S: SharedValue<any> }) {
  return <>{LIGHTS.map((k) => <DialLight key={k} S={S} k={k} />)}</>;
}

/** The master dimmer: a lever on the console top, pulled toward him as the sky goes down. */
function Lever({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.lever}deg` }] }));
  return (
    <Animated.View style={[styles.lever, st]} pointerEvents="none">
      <View style={styles.leverShaft} />
      <View style={styles.leverKnob}>
        <View style={styles.leverGlint} />
      </View>
    </Animated.View>
  );
}

// ── the dominoes: each knocked by the one before, back to a box nobody explains ──

function Domino({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    // Falling ACCELERATES — a thing tipping over is slow to start and quick to land.
    const u = v.chainIn === 1 ? clamp01((v.bt - 0.7 - 0.2 * k) / 0.26) : 1;
    // how far back the explanation reaches on the order question: lit dominoes
    const lit = clamp01((v.reach * 1.2 - (DOM_X.length - 1 - k) / DOM_X.length) * 4);
    return {
      backgroundColor: lit > 0.5 ? SHADE : PLATE_FACE,
      transform: [{ rotate: `${DOM_REST[k] * u * u}deg` }],
    };
  });
  return (
    <Animated.View style={[styles.domino, { left: DOM_X[k] }, st]}>
      <View style={styles.dominoRule} />
      <View style={[styles.pip, { top: 6 }]} />
      <View style={[styles.pip, { top: 21 }]} />
    </Animated.View>
  );
}

function Dominoes({ S, tags }: { S: SharedValue<any>; tags: boolean }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.chainOn }));
  // the first push: a question mark the chain never reaches, lit once the slide asks it
  const qLit = useAnimatedStyle(() => ({
    opacity: S.value.headLit * (0.8 + 0.2 * Math.sin(S.value.twinkle * 3)),
  }));
  const qShake = useAnimatedStyle(() => {
    const over = clamp01((S.value.reach - 0.55) / 0.3);
    return { transform: [{ translateX: Math.sin(S.value.twinkle * 30) * 2 * over }] };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]} pointerEvents="none">
      <SetArt parts={BOX} tone={TONE} />
      {DOM_X.map((_, k) => <Domino key={k} S={S} k={k} />)}
      <Animated.View style={[styles.qMark, qShake]}>
        <Animated.View style={[styles.qMarkLit, qLit]} />
        <Text style={styles.qMarkText}>?</Text>
      </Animated.View>
      {/* The tags step aside while the question's own plates name the same things. */}
      {tags ? (
        <>
          <View style={[styles.tag, { left: DOM_X[0] - 16 }]}>
            <Text style={styles.tagText} numberOfLines={1}>EARLIER</Text>
          </View>
          <View style={[styles.tag, { left: DOM_X[5] - 18, width: 44 }]}>
            <Text style={styles.tagText} numberOfLines={1}>NOW</Text>
          </View>
        </>
      ) : null}
    </Animated.View>
  );
}

// ── the question on the stage ────────────────────────────────────────────────

function Picks({ picked, onPick }: { picked: string | null; onPick: (id: string, ok: boolean) => void }) {
  const answered = picked !== null;
  return (
    <>
      {PICKS.map((q) => {
        const x0 = q.cx;
        const y0 = PLATE_Y + PLATE_H;
        const len = Math.hypot(q.to.x - x0, q.to.y - y0);
        const ang = (Math.atan2(q.to.x - x0, q.to.y - y0) * 180) / Math.PI;
        return (
          <View
            key={`l-${q.id}`}
            pointerEvents="none"
            style={[styles.leader, { left: x0 - 0.75, top: y0, height: len, transform: [{ rotate: `${-ang}deg` }] }]}
          />
        );
      })}
      {PICKS.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={6}
          disabled={answered}
          style={[styles.pick, { left: q.cx - PLATE_W / 2 }]}
        >
          <View style={[styles.pickFace, answered && q.correct && styles.pickRight]}>
            <Text style={[styles.pickText, answered && q.correct && styles.pickTextOnInk]} numberOfLines={1}>
              {q.label}
            </Text>
          </View>
        </Target>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },

  // THE DOME: a circle SCALED into an ellipse (a corner radius cannot make one), cut
  // off at its spring line by the clip, with a rim of the lesson's own shade.
  domeClip: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: DOME.base, overflow: 'hidden' },
  domeRim: {
    position: 'absolute', left: DOME.cx - DOME.ry - 3, top: DOME.base - DOME.ry - 3,
    width: (DOME.ry + 3) * 2, height: (DOME.ry + 3) * 2, borderRadius: DOME.ry + 3,
    backgroundColor: INK, transform: [{ scaleX: (DOME.rx + 3) / (DOME.ry + 3) }],
  },
  dome: {
    position: 'absolute', left: DOME.cx - DOME.ry, top: DOME.base - DOME.ry,
    width: DOME.ry * 2, height: DOME.ry * 2, borderRadius: DOME.ry,
    backgroundColor: DEEP, transform: [{ scaleX: DOME.rx / DOME.ry }],
  },
  star: { position: 'absolute', backgroundColor: PAPER_LIT },
  glint: { position: 'absolute', backgroundColor: PAPER_LIT, opacity: 0.8 },
  // the dome's curve: the same ellipse's edge falls into shadow toward the spring line
  domeShade: {
    position: 'absolute', left: DOME.cx - DOME.ry, top: DOME.base - DOME.ry,
    width: DOME.ry * 2, height: DOME.ry * 2, borderRadius: DOME.ry,
    borderWidth: 11, borderColor: INK, opacity: 0.28, transform: [{ scaleX: DOME.rx / DOME.ry }],
  },
  // A CSS triangle has a zero-size box, so its pivot is stated in px (§13).
  beam: {
    position: 'absolute', left: LENS.x - BEAM_W / 2, top: LENS.y - BEAM_L, width: 0, height: 0,
    borderLeftWidth: BEAM_W / 2, borderRightWidth: BEAM_W / 2, borderTopWidth: BEAM_L,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: PAPER_LIT,
    transformOrigin: `${BEAM_W / 2}px ${BEAM_L}px`, transform: [{ rotate: `${BEAM_ROT}deg` }],
  },

  // THE SLIDES: light projected on the dark dome, one idea at a time, all centred on
  // the same place so one slide replaces the last rather than adding a column.
  slide: { position: 'absolute', left: 60, width: 280, top: 266, height: 70, alignItems: 'center' },
  slideTitle: {
    marginTop: 14, fontFamily: 'Inter_700Bold', fontSize: 18, letterSpacing: 1.1, color: PAPER_LIT,
    includeFontPadding: false,
  },
  slideCap: {
    marginTop: 8, fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.3, color: PAPER_LIT,
    includeFontPadding: false,
  },
  slideKicker: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.6, color: PAPER_LIT, includeFontPadding: false,
  },
  slideLine: {
    marginTop: 6, fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.6, color: PAPER_LIT,
    includeFontPadding: false,
  },
  slideAsk: {
    marginTop: 12, fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.8, color: PAPER_LIT,
    includeFontPadding: false,
  },
  nothWrap: { marginTop: 4, alignItems: 'center', justifyContent: 'center' },
  nothWord: {
    fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: 6, color: PAPER_LIT, includeFontPadding: false,
  },
  nothStrike: {
    position: 'absolute', left: -6, right: -2, top: '50%', height: 3, marginTop: -1.5,
    backgroundColor: PAPER_LIT, borderRadius: 1.5, transformOrigin: '0% 50%',
  },
  needsTag: {
    position: 'absolute', left: 30, top: 342, width: 104, height: 20,
    borderWidth: 1.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER_LIT,
    alignItems: 'center', justifyContent: 'center',
  },
  needsText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  stillPlate: {
    position: 'absolute', left: DOME.cx - 88, top: 284, width: 176, height: 36,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER_LIT, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  stillText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1.4, color: INK, includeFontPadding: false,
  },

  // the cove: the ledge the dome stands on, with the warm strip of light along it
  ledge: {
    position: 'absolute', left: 8, right: 8, top: DOME.base - 2, height: 8,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: INK, borderRadius: 3, boxShadow: LIP,
  },
  cove: { position: 'absolute', left: 14, right: 14, top: DOME.base - 3, height: 1.5, backgroundColor: EMBER },

  // the console's level lights
  light: {
    position: 'absolute', top: CONSOLE.top + 20, width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: PAPER_LIT,
  },
  // the lever: a box as tall as the shaft plus its knob, turning about the pivot at its foot
  lever: {
    position: 'absolute', left: PIVOT.x - 4.5, top: PIVOT.y - LEVER.len - 4.5, width: 9, height: LEVER.len + 4.5,
    transformOrigin: '50% 100%', alignItems: 'center',
  },
  leverShaft: {
    position: 'absolute', left: 2.75, top: 4.5, width: 3.5, height: LEVER.len,
    borderRadius: 1.75, backgroundColor: SHADE, borderWidth: 1.2, borderColor: INK,
  },
  leverKnob: {
    position: 'absolute', left: 0, top: 0, width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: STONE, borderWidth: 1.8, borderColor: INK,
  },
  leverGlint: { position: 'absolute', left: 1.5, top: 1.2, width: 2.6, height: 2.6, borderRadius: 1.3, backgroundColor: PAPER_LIT },

  domino: {
    position: 'absolute', top: GROUND - DOM_H, width: DOM_W, height: DOM_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, transformOrigin: '100% 100%',
    alignItems: 'center',
  },
  dominoRule: { position: 'absolute', left: 1, right: 1, top: DOM_H / 2 - 1.5, height: 1.2, backgroundColor: INK },
  pip: { position: 'absolute', width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: INK },
  qMark: {
    position: 'absolute', left: 110, top: 440, width: 16, height: 22, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  qMarkLit: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 4, backgroundColor: SHADE },
  qMarkText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: INK, includeFontPadding: false },
  tag: {
    position: 'absolute', top: 440, width: 58, height: 17,
    borderWidth: 1.5, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center',
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  leader: { position: 'absolute', width: 1.5, backgroundColor: INK, transformOrigin: '50% 0%' },
  pick: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  pickFace: {
    flexGrow: 1, borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  pickRight: { backgroundColor: INK },
  pickText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  pickTextOnInk: { color: PAPER_LIT },
});

export function MetaphysicsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={MetaphysicsScene} band={[224, 514]} camera={CAM} />;
}
