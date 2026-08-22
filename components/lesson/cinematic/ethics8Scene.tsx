import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics8Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import type { Shot } from './camera';
import Target from './Target';

// A room with two halves. Up top, a rigid grid of empty rule-boxes — impartial,
// tidy, nobody's name in them. Down on the floor, stage right, a second figure
// slumped beside a small bed. The narrator walks across, gets down beside them,
// and a THREAD draws between the two heads while the grid dims behind it.
//
// COMPOSITION / OCCLUSION —
//   · the narrator WALKS in x = 80 → 146 → 208, then back to 112, then to 190.
//     Widest body span is therefore x ≈ 32 … 256.
//   · the slumped figure is FIXED at x = 284 (head centre 298, so it reaches
//     x ≈ 271 … 325). At least 76 units of clear paper between the two figures.
//   · the bed lives at x = 328 … 394 — right of everything either figure occupies.
//   · the rule grid (y 46–114) and the three question cards (y 176–308) sit well
//     above every body: a standing crown is at y = 397, kneeling 415, and the
//     friend seated on the floor 423. The thread at y 384 is the one thing that
//     deliberately meets a head, which is the whole point of it.

const OTH_X = 284;          // the slumped figure, fixed
const OTH_HEAD = 298;       // where their head centre lands (thread anchor)

const GRID_T = 70;
const GRID_S = 44;
const GRID_X = [94, 150, 206, 262];

const CARD_L = 44;
const CARD_W = 312;
// SIZED FOR A FINGER. This lesson's band is 470 units, so it renders at fit 0.63
// and a 40-unit card became 25dp on a 29dp pitch — barely half a fingertip. The
// stack now runs 176 → 386, stopping clear of the figure's crown at 397.
const CARD_H = 50;
const CARD_T = 176;
const CARD_GAP = 80;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const CARD_SLOP = (CARD_GAP - CARD_H) / 2;

// Everything the reader must READ lives above y = 350. A walking figure's crown
// rides up to y ≈ 357 on the gait's bob, so the thread and its stems are cut off
// well short of that — at rest the crown sits at 361, but the bob is what bites.
// 384, not 336. The thread is a bond drawn between the two HEADS, tethered down to
// each by a short stem — so it has to sit just above them. 336 was measured against
// the old K_FIG 1.35 figure whose crown reached 361; at 1.0 the standing crown is
// 397 and the seated friend's is 423, which left the thread hanging in clear paper
// 60 units above anyone. The near stem now meets the narrator's crown and the far
// stem runs further down to the friend on the floor, so the drop reads as the
// height difference between someone standing and someone sitting.
const THREAD_Y = 384;

const CARDS = [
  { id: 'rule', label: 'WHICH RULE APPLIES?', correct: false },
  { id: 'who', label: 'WHO NEEDS ME, AND HOW?', correct: true },
  { id: 'most', label: 'WHAT HELPS THE MOST PEOPLE?', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 208);
const DIR = dirsFrom(X, 1);
const GRIDV = BEATS.map((b) => b.grid ?? 0);
const OTHV = BEATS.map((b) => b.oth ?? 0);
const THRV = BEATS.map((b) => b.thread ?? 0);

export default function Ethics8Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;

    // The canonical travel body: walks the gap when the beat moves them, blends
    // gesture-to-gesture when it doesn't. WALK is passed EXPLICITLY — a Gait left
    // to a default parameter is not captured into the worklet runtime.
    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    const fx = carry(cv, 0, n, X[p], X[n], tr);
    const oth = carry(cv, 1, n, OTHV[p], OTHV[n], tr);
    const thread = carry(cv, 2, n, THRV[p], THRV[n], tr);

    return {
      fig: pose(s, fx, GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      // The cared-for figure never moves and never re-animates: a settled slump
      // with only stand()'s breath under it, so they read as present, not busy.
      // 48, not 46: the script says they are ON THE FLOOR by their bed. 46 is a
      // standing slump, which put them upright on the ground line — the picture
      // flatly contradicting the sentence.
      other: pose(emoteHold(48, t), OTH_X, GROUND, K_FIG, -1, oth),
      fx,
      oth,
      thread,
      grid: carry(cv, 3, n, GRIDV[p], GRIDV[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const DO = useDerivedValue<Bundle>(() => SCENE.value.other);

  const gridStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.grid }));
  const bedStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.oth }));
  // The thread is anchored to the narrator's LIVE x and grows toward the other
  // head, so it stays a line between two people even when he steps back.
  const threadStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.thread,
    transform: [
      { translateX: SCENE.value.fx },
      { scaleX: Math.max(0, OTH_HEAD - SCENE.value.fx) * SCENE.value.thread },
    ],
  }));
  const anchorStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.thread,
    transform: [{ translateX: SCENE.value.fx }],
  }));
  // The far end only lights up once the thread has actually reached it.
  const farStyle = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.thread - 0.7) / 0.3) }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the rigid grid of rule-boxes, high above everyone ───────────────── */}
      <Animated.View style={[styles.layer, gridStyle]} pointerEvents="none">
        <Text style={styles.gridLabel}>RULES  ·  RIGHTS  ·  TOTALS</Text>
        {GRID_X.map((gx) => (
          <View key={gx} style={[styles.gridBox, { left: gx }]}>
            <View style={styles.gridSlot} />
          </View>
        ))}
      </Animated.View>

      {/* ── the thread of connection between the two figures ────────────────── */}
      <Animated.View style={[styles.threadLine, threadStyle]} pointerEvents="none" />
      <Animated.View style={[styles.anchor, anchorStyle]} pointerEvents="none">
        <View style={styles.dot} />
        <View style={styles.stem} />
      </Animated.View>
      <Animated.View style={[styles.farAnchor, farStyle]} pointerEvents="none">
        <View style={styles.dot} />
        <View style={styles.stemFar} />
      </Animated.View>
      <Animated.View style={[styles.threadLabelWrap, farStyle]} pointerEvents="none">
        <Text style={styles.threadLabel}>A BOND, NOT A BOX</Text>
      </Animated.View>

      {/* ── Q1: the three opening questions, well clear of both figures ─────── */}
      {showPick ? (
        <>
          <View style={styles.pickLabelWrap} pointerEvents="none">
            <Text style={styles.pickLabel}>TAP THE FIRST QUESTION</Text>
          </View>
          {CARDS.map((c, k) => {
            const chosen = picked === c.id;
            return (
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.pickCard, { top: CARD_T + k * CARD_GAP }]} hitSlop={{ top: CARD_SLOP, bottom: CARD_SLOP, left: CARD_SLOP, right: CARD_SLOP }} disabled={answered}>
                <View
                  style={[
                    styles.pickInner,
                    answered && c.correct && styles.pickRight,
                    answered && chosen && !c.correct && styles.pickWrong,
                  ]}
                >
                  <Text style={[styles.pickText, answered && c.correct && styles.pickTextOn]}>
                    {c.label}
                  </Text>
                </View>
              </Target>
            );
          })}
        </>
      ) : null}

      {/* ── the small bed, far stage right of every walk band ───────────────── */}
      <Animated.View style={[styles.layer, bedStyle]} pointerEvents="none">
        <View style={styles.bedLegL} />
        <View style={styles.bedLegR} />
        <View style={styles.mattress} />
        <View style={styles.blanketFold} />
        <View style={styles.pillow} />
        <View style={styles.headboard} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DO} k={K_FIG} />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for a group of props that fade together. Explicitly
  // positioned so its children never depend on flex flow above them.
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the rule grid ───────────────────────────────────────────────────────────
  gridLabel: {
    position: 'absolute', left: 0, top: 46, width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8, color: SOFT,
    includeFontPadding: false,
  },
  gridBox: {
    position: 'absolute', top: GRID_T, width: GRID_S, height: GRID_S,
    borderWidth: 2, borderColor: SOFT, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  gridSlot: { width: 20, height: 2, backgroundColor: SOFT, borderRadius: 1 },

  // ── the thread ──────────────────────────────────────────────────────────────
  // A 1-wide bar stretched by scaleX from its left edge, exactly like a rig bone.
  threadLine: {
    position: 'absolute', left: 0, top: THREAD_Y - 1.25, width: 1, height: 2.5,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  // Both anchors are real 9-wide boxes centred on the thread's end point, so no
  // child is ever drawn outside its parent's bounds.
  anchor: { position: 'absolute', left: -4.5, top: THREAD_Y - 4.5, width: 9, height: 16 },
  farAnchor: { position: 'absolute', left: OTH_HEAD - 4.5, top: THREAD_Y - 4.5, width: 9, height: 44 },
  dot: { position: 'absolute', left: 0, top: 0, width: 9, height: 9, borderRadius: 4.5, backgroundColor: INK },
  stem: { position: 'absolute', left: 3.5, top: 7.5, width: 2, height: 8, backgroundColor: INK, borderRadius: 1 },
  stemFar: { position: 'absolute', left: 3.5, top: 7.5, width: 2, height: 36, backgroundColor: INK, borderRadius: 1 },
  threadLabelWrap: { position: 'absolute', left: 150, top: 352, width: 200 },
  threadLabel: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.8, color: SOFT,
    includeFontPadding: false,
  },

  // ── Q1 cards ────────────────────────────────────────────────────────────────
  pickLabelWrap: { position: 'absolute', left: 0, top: 152, width: STAGE_W },
  pickLabel: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, color: SOFT,
    includeFontPadding: false,
  },
  pickCard: { position: 'absolute', left: CARD_L, width: CARD_W },
  pickInner: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
  pickText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  pickTextOn: { color: PAPER },

  // ── the bed ─────────────────────────────────────────────────────────────────
  mattress: {
    position: 'absolute', left: 328, top: 452, width: 66, height: 14,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  blanketFold: { position: 'absolute', left: 336, top: 460, width: 38, height: 1.5, backgroundColor: SOFT },
  pillow: {
    position: 'absolute', left: 368, top: 439, width: 24, height: 13,
    borderWidth: 1.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
  },
  headboard: { position: 'absolute', left: 388, top: 418, width: 6, height: 44, backgroundColor: INK, borderRadius: 3 },
  bedLegL: { position: 'absolute', left: 332, top: 464, width: 3, height: 36, backgroundColor: SOFT },
  bedLegR: { position: 'absolute', left: 386, top: 464, width: 3, height: 36, backgroundColor: SOFT },
});

// ── THE CAMERA ───────────────────────────────────────────────────────────────
//
// The first lesson with one, and the reason it is this lesson: the script already
// walks a figure across a room to someone on the floor, so there is somewhere for
// the camera to GO. A shot list on a lesson whose staging never moves is just
// motion for its own sake.
//
// The arc is close → wide → follow → close → wide:
//
//   0  a portrait of one person, alone in the room — nothing else established
//   1  pull all the way back as the tidy boxes appear; the widest thing said
//   2  drift right on "then you look up", finding the person on the floor
//   3  travel with the walk and tighten as they arrive — the move IS the sentence
//   4  full frame for Q1, because three cards have to be read and tapped
//   5  a two-shot of the pair on the floor for Gilligan's different voice
//   6  ease off a little to hold the quote
//   7  the closest push of the lesson, across the thread between the two heads
//   8  widen as the method is laid out
//   9  full frame for the critics — the objection is about the whole picture
//  10  neutral; the stage is hidden on a summary beat anyway
//
// EVERY NUMBER BELOW IS CHECKED, not judged by eye. `checkShots` in ./camera.ts
// takes the list, this band and the ground line and reports any shot that would
// show paper nobody drew. Four of the first draft's eleven failed it: two ran off
// the bottom of the design space, one off the right edge, and one had the camera
// beside the friend on a beat where the narrator has walked back across the room.
// Re-run it after touching anything here.
//
// Q1 IS DELIBERATELY AT SCALE 1, which is the identity transform — the three
// cards are Pressables, and a tap must not have to survive a camera offset to
// land. The move into that beat finishes before the cards matter.
const SHOTS: Shot[] = [
  { cx: 132, cy: 404, s: 1.62, tr: 0 },
  { cx: 200, cy: 280, s: 1.0, tr: 1.5 },
  { cx: 236, cy: 352, s: 1.24, tr: 1.2 },
  { cx: 236, cy: 392, s: 1.42, tr: 1.6 },
  { cx: 200, cy: 280, s: 1.0, tr: 0.9 },
  { cx: 238, cy: 384, s: 1.34, tr: 1.0 },
  { cx: 224, cy: 358, s: 1.18, tr: 0.9 },
  { cx: 205, cy: 380, s: 1.45, tr: 1.0 },
  { cx: 200, cy: 340, s: 1.12, tr: 1.2 },
  { cx: 200, cy: 280, s: 1.0, tr: 0.9 },
  { cx: 200, cy: 280, s: 1.0, tr: 0.6 },
];

// The section header "RULES · RIGHTS · TOTALS" sits at y = 46, above the old band
// top of 56, so it was 91% clipped — the row of boxes had no title. Lowest ink is
// the figure's shadow at 506.
export function Ethics8Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics8Scene} band={[42, 512]} shots={SHOTS} />;
}
