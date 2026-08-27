import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political4Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
  useCarry, carry, STONE,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A figure walled in by interference, drawn as an information graphic rather than a
// mood piece:
//
//   · TWO COMPARISON CARDS up top — NEGATIVE LIBERTY / POSITIVE LIBERTY — one of
//     which STAMPS (an ink wipe left-to-right, labels flipping to paper) on the beat
//     that is about it. That is the lesson's spine, always on screen.
//   · A DIMENSION LINE between the walls, capped and captioned "ROOM TO MOVE", which
//     literally measures negative liberty: it is invisible when the walls press in and
//     grows to full width as they retreat.
//   · MILL'S TEST — a four-cell tally that occupies the same strip as the dimension
//     line and cross-fades with it: three acts marked YOUR CALL, one stamped in solid
//     ink as the case where POWER MAY ACT. That is the harm principle, tallied.
//   · The HARM LINE — a dashed boundary with another person standing beyond it — the
//     single line Mill says power may cross.
//
// The camera is IDENTITY, so design coordinates are final stage coordinates and the
// band below can be read straight off these constants. Everything the scene can ever
// draw lives between y=222 (card tops) and y=501.5 (the ground rule).

const FIG_X = 196;

// ── the walls of interference ────────────────────────────────────────────────
// 16 units wide, not 10: at 10 they read as bars rather than masonry. They grow
// OUTWARD from the same inner faces, so the gap the figure stands in is unchanged.
const WALL_W = 16;
const WALL_L = 144;                       // left wall's left edge  (inner face 160)
const WALL_R = 242;                       // right wall's left edge (inner face 242)
const WALL_T = 336;
const WALL_H = GROUND - WALL_T;           // 164 — taller than the figure, so it looms
const WALL_OUT = 44;                      // how far each wall retreats at walls = 0
const COURSES = [26, 52, 78, 104, 130, 156];
const JOINTS = [0, 26, 52, 78, 104, 130, 156];   // staggered vertical brick joints

// ── Mill's test: the tally that shares the dimension line's strip ────────────
const TEST_T = 298;
const TEST_H = 36;
const TESTS = [
  { act: 'EAT BADLY', verdict: 'YOUR CALL', left: 20, w: 78, harm: false },
  { act: 'TAKE RISKS', verdict: 'YOUR CALL', left: 104, w: 78, harm: false },
  { act: 'SPEAK OUT', verdict: 'YOUR CALL', left: 188, w: 78, harm: false },
  { act: 'THROW A PUNCH', verdict: 'POWER MAY ACT', left: 272, w: 108, harm: true },
];

// ── the comparison cards ─────────────────────────────────────────────────────
const CARD_T = 222;
const CARD_H = 64;
const CARD_W = 176;
const CARD_AL = 20;
const CARD_BL = 204;

// ── the dimension line that measures the gap ─────────────────────────────────
const MEAS_LABEL_T = 298;
const MEAS_Y = 324;
const MEAS_L = WALL_L + WALL_W;                    // 160, the left wall's inner face
const MEAS_W = WALL_R - MEAS_L;                    // 82 at full squeeze
const MEAS_MAX = MEAS_W + WALL_OUT * 2;            // 170 once both walls retreat

// ── the harm boundary ────────────────────────────────────────────────────────
const HARM_X = 326;
const DASH_T = WALL_T;                    // the boundary runs the walls' full height
const DASHES = [0, 16, 32, 48, 64, 80, 96, 112, 128, 144, 152];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const WALLS = BEATS.map((b) => b.walls ?? 0);
const HARM = BEATS.map((b) => b.harm ?? 0);
const TEST = BEATS.map((b) => b.test ?? 0);
const NEG = BEATS.map((b) => ((b.panel ?? 0) === 1 ? 1 : 0));
const POS = BEATS.map((b) => ((b.panel ?? 0) === 2 ? 1 : 0));

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political4'));

export default function Political4Scene({ clock, bt, bi, dragPos, i }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      walls: carry(cv, 0, n, WALLS[p], WALLS[n], tr),
      harm: carry(cv, 1, n, HARM[p], HARM[n], tr),
      test: carry(cv, 2, n, TEST[p], TEST[n], tr),
      // R7b — the seam trades the two liberties against each other. Give the bar to
      // A CORE OF NEGATIVE LIBERTY and the space nobody may enter grows…
      neg: carry(cv, 3, n, NEG[p], reacting ? dragPos.value : NEG[n], tr),
      // …and positive liberty takes what is left. Berlin's warning is that the second
      // one eats the first when a state is holding it, and the bar is the only place
      // in the lesson where the reader can watch that happen to them.
      pos: carry(cv, 4, n, POS[p], reacting ? 1 - dragPos.value : POS[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // Walls slide OUTWARD (away from the figure) and fade as liberty grows, so they
  // never cover the body.
  const wallLStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.75 * SCENE.value.walls,
    transform: [{ translateX: -(1 - SCENE.value.walls) * WALL_OUT }],
  }));
  const wallRStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.75 * SCENE.value.walls,
    transform: [{ translateX: (1 - SCENE.value.walls) * WALL_OUT }],
  }));

  // The measure: zero when the walls press in, full when they are gone — and it
  // yields the strip entirely to Mill's tally on the beats that tally.
  const measStyle = useAnimatedStyle(() => ({ opacity: (1 - SCENE.value.walls) * (1 - SCENE.value.test) }));
  const measBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: (MEAS_W + (1 - SCENE.value.walls) * WALL_OUT * 2) / MEAS_W }],
  }));
  const capLStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -(1 - SCENE.value.walls) * WALL_OUT }] }));
  const capRStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (1 - SCENE.value.walls) * WALL_OUT }] }));

  const harmStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.harm }));

  return (
    <View style={styles.scene}>
      {/* ── the two liberty cards, one of which stamps ─────────────────────── */}
      <Card left={CARD_AL} title="NEGATIVE LIBERTY" sub="no one blocks you" S={SCENE} which="neg" />
      <Card left={CARD_BL} title="POSITIVE LIBERTY" sub="you can actually act" S={SCENE} which="pos" />

      {/* ── the dimension line measuring the gap between the walls ─────────── */}
      <Animated.View style={[styles.measWrap, measStyle]} pointerEvents="none">
        <Text style={styles.measLabel}>ROOM TO MOVE</Text>
        <Animated.View style={[styles.measBar, measBarStyle]} />
        <Animated.View style={[styles.measCap, { left: MEAS_L - 1 }, capLStyle]} />
        <Animated.View style={[styles.measCap, { left: WALL_R - 1 }, capRStyle]} />
      </Animated.View>

      {/* ── Mill's test, tallied in the same strip as the measure ──────────── */}
      {TESTS.map((c, k) => <TestCell key={c.act} c={c} k={k} S={SCENE} />)}

      {/* ── the walls of interference, coursed like brick ──────────────────── */}
      <Animated.View style={[styles.wall, { left: WALL_L }, wallLStyle]} pointerEvents="none">
        {COURSES.map((c) => <View key={`c${c}`} style={[styles.course, { top: c }]} />)}
        {JOINTS.map((j, k) => <View key={`j${j}`} style={[styles.joint, { top: j, left: k % 2 ? 4 : 10 }]} />)}
      </Animated.View>
      <Animated.View style={[styles.wall, { left: WALL_R }, wallRStyle]} pointerEvents="none">
        {COURSES.map((c) => <View key={`c${c}`} style={[styles.course, { top: c }]} />)}
        {JOINTS.map((j, k) => <View key={`j${j}`} style={[styles.joint, { top: j, left: k % 2 ? 10 : 4 }]} />)}
      </Animated.View>

      {/* ── the harm boundary + the person it protects ─────────────────────── */}
      <Animated.View style={[styles.harmWrap, harmStyle]} pointerEvents="none">
        {DASHES.map((d) => <View key={d} style={[styles.dash, { top: DASH_T + d }]} />)}
        <Text style={styles.harmLabel}>HARM LINE</Text>
        <View style={styles.otherHead} />
        <View style={styles.otherSpine} />
        <View style={[styles.otherArm, styles.otherArmL]} />
        <View style={[styles.otherArm, styles.otherArmR]} />
        <View style={[styles.otherLeg, styles.otherLegL]} />
        <View style={[styles.otherLeg, styles.otherLegR]} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One comparison card. The ink fill wipes in from the left and the ink-coloured label
 * cross-fades to a paper one, so the card reads as being STAMPED on its beat.
 */
function Card({
  left, title, sub, S, which,
}: {
  left: number; title: string; sub: string;
  S: SharedValue<any>; which: 'neg' | 'pos';
}) {
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: which === 'neg' ? S.value.neg : S.value.pos }] }));
  const offStyle = useAnimatedStyle(() => ({ opacity: 1 - (which === 'neg' ? S.value.neg : S.value.pos) }));
  const onStyle = useAnimatedStyle(() => ({ opacity: which === 'neg' ? S.value.neg : S.value.pos }));
  return (
    <View style={[styles.card, { left }]} pointerEvents="none">
      <Animated.View style={[styles.cardFill, fillStyle]} />
      <Animated.View style={[styles.cardText, offStyle]}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </Animated.View>
      <Animated.View style={[styles.cardText, onStyle]}>
        <Text style={[styles.cardTitle, styles.onPaper]}>{title}</Text>
        <Text style={[styles.cardSub, styles.onPaper]}>{sub}</Text>
      </Animated.View>
    </View>
  );
}

/**
 * One cell of Mill's test. The four deal in one after another (a staggered fade and
 * rise) so the tally reads as being counted out rather than appearing at once.
 */
function TestCell({
  c, k, S,
}: {
  c: { act: string; verdict: string; left: number; w: number; harm: boolean };
  k: number; S: SharedValue<any>;
}) {
  const st = useAnimatedStyle(() => {
    const u = clamp01(S.value.test * 1.6 - k * 0.16);
    return { opacity: u, transform: [{ translateY: (1 - u) * 9 }] };
  });
  return (
    <Animated.View
      style={[styles.testCell, c.harm && styles.testHarm, { left: c.left, width: c.w }, st]}
      pointerEvents="none"
    >
      <Text style={[styles.testAct, c.harm && styles.onPaper]}>{c.act}</Text>
      <Text style={[styles.testVerdict, c.harm && styles.onPaper]}>{c.verdict}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── comparison cards ───────────────────────────────────────────────────────
  card: {
    position: 'absolute', top: CARD_T, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: STONE, overflow: 'hidden',
  },
  cardFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: INK, transformOrigin: '0% 50%' },
  cardText: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.6, color: INK, includeFontPadding: false },
  cardSub: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: SOFT, marginTop: 4, includeFontPadding: false },
  onPaper: { color: PAPER },

  // ── the measure ────────────────────────────────────────────────────────────
  measWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  measLabel: {
    position: 'absolute', left: 0, right: 0, top: MEAS_LABEL_T, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  measBar: {
    position: 'absolute', left: MEAS_L, top: MEAS_Y, width: MEAS_W, height: 2,
    backgroundColor: INK, transformOrigin: '50% 50%',
  },
  measCap: { position: 'absolute', top: MEAS_Y - 8, width: 2, height: 18, backgroundColor: INK },

  // ── Mill's test ────────────────────────────────────────────────────────────
  // TONE, NOT WHITE. This scene drew every prop as an outline on paper — two
  // values and no depth, which is the flat case `check:shade` exists to find.
  // The structural mass takes STONE, a secondary surface takes RULE, and what
  // carries the message stays PAPER, so the picture has things at different
  // values rather than everything a shade darker. See cinematicKit's ramp.
  testCell: {
    position: 'absolute', top: TEST_T, height: TEST_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: RULE,
    alignItems: 'center', justifyContent: 'center',
  },
  testHarm: { backgroundColor: INK },
  testAct: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.2, color: INK, includeFontPadding: false },
  testVerdict: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT,
    marginTop: 3, includeFontPadding: false,
  },

  // ── the walls ──────────────────────────────────────────────────────────────
  wall: {
    position: 'absolute', top: WALL_T, width: WALL_W, height: WALL_H,
    backgroundColor: INK, borderRadius: 2, overflow: 'hidden',
  },
  course: { position: 'absolute', left: 0, width: WALL_W, height: 1.5, backgroundColor: STONE, opacity: 0.55 },
  joint: { position: 'absolute', width: 1.5, height: 26, backgroundColor: PAPER, opacity: 0.4 },

  // ── the harm boundary + the other person ───────────────────────────────────
  harmWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  dash: { position: 'absolute', left: HARM_X, width: 2, height: 9, backgroundColor: SOFT },
  harmLabel: {
    position: 'absolute', left: 296, top: 340, width: 108, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  // Drawn at roughly three-quarters of the main figure's height with the same
  // limb weight, so the person beyond the line reads as a PERSON rather than the
  // lollipop of head-plus-sticks it was.
  otherHead: { position: 'absolute', left: 346, top: 396, width: 25, height: 25, borderRadius: 13, backgroundColor: INK },
  otherSpine: { position: 'absolute', left: 356, top: 420, width: 5, height: 44, backgroundColor: INK, borderRadius: 3 },
  otherArm: { position: 'absolute', top: 430, width: 22, height: 4.5, backgroundColor: INK, borderRadius: 3 },
  otherArmL: { left: 336, transformOrigin: '100% 50%', transform: [{ rotate: '-20deg' }] },
  otherArmR: { left: 359, transformOrigin: '0% 50%', transform: [{ rotate: '20deg' }] },
  otherLeg: { position: 'absolute', top: 462, width: 5, height: 38, backgroundColor: INK, borderRadius: 3 },
  otherLegL: { left: 352, transformOrigin: '50% 0%', transform: [{ rotate: '6deg' }] },
  otherLegR: { left: 361, transformOrigin: '50% 0%', transform: [{ rotate: '-6deg' }] },
});

// Everything this scene can draw sits between the card tops (222) and the ground rule
// (501.5): cards 222–286, the measure / Mill's tally sharing the strip at 298–334,
// walls 336–500, the harm dashes 336–497, the person beyond the line 396–500, and the
// figure's crown ≈357 down to its feet at 500. Nothing moves vertically — the walls
// and the tally only translate sideways or fade — so those are the true extremes, and
// cropping to [214, 510] renders the stage at ~2.19× instead of the letterboxed 1.15×.
export function Political4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political4Scene} band={[214, 510]} camera={CAM} />;
}
