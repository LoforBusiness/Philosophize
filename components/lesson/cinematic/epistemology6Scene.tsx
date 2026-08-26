import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology6Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// Skepticism drawn as METHOD, not mood.
//
//   · Across the top runs THE SKEPTIC'S ROUTE: three boxes and two arrows —
//     EQUAL REASONS → EPOCHE → ATARAXIA — written one at a time as the narration
//     reaches each step. It is Pyrrhonism's whole procedure in one line of ink.
//   · Under it stands a real weighing BALANCE. Both pans carry three identical
//     tally blocks, so "an equal argument is opposed" is something you can COUNT
//     rather than something you are told; the beam quivers and never commits.
//   · Beneath the balance, the boast NOTHING IS KNOWN cracks, and the question that
//     breaks it (…INCLUDING THAT?) is printed inside the same box.
//
// NO CAMERA. The old version wrapped everything in a translate-only camera that
// shifted the stage up by 92 units inside a full-height letterbox, so the art
// rendered at 1.15×. Design y is now screen y and the band below crops to the slice
// that holds art, which renders it at about 2.3×.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · The FIGURE stands at x = 64 on GROUND = 500: crown ≈ 361, head circle x 37–91,
//     and its widest gesture (hands at ±26 rig) reaches x ≈ 106.
//   · The balance's LEFT PAN starts at x 135, so the figure never touches it.
//   · The claim card owns x 240–392, y 402–462 — below the pans (which end at 384)
//     and right of the figure. The balance's post passes behind it.
//   · Nothing is drawn above y = 240 or below the ankle joints at 507.4.

const FIG_X = 64;
const BAL_X = 258;

// ── the balance ───────────────────────────────────────────────────────────────
const BEAM_Y = 322;
const BEAM_HW = 92;                       // half the beam, so it spans x 166–350
const PAN_W = 66;
const PAN_T = 348;
const PAN_H = 36;
const PAN_L = 168 - PAN_W / 2;            // 135
const PAN_R = 348 - PAN_W / 2;            // 315
const TALLY = [0, 1, 2];

// ── the route ─────────────────────────────────────────────────────────────────
// Three 106-wide boxes with 20-unit gaps centre the flow in the 400-wide stage.
const BOX_W = 106;
const BOX_T = 256;
const BOX_H = 40;
const BOX_X = [21, 147, 273];
const STEPS = [
  { head: 'EQUAL REASONS', sub: 'NEITHER WINS' },
  { head: 'EPOCHE', sub: 'SUSPEND' },
  { head: 'ATARAXIA', sub: 'PEACE OF MIND' },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const BAL = BEATS.map((b) => b.bal ?? 0);
const CRACK = BEATS.map((b) => b.crack ?? 0);
const ROUTE = BEATS.map((b) => b.route ?? 0);

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
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology6'));

export default function Epistemology6Scene({ clock, bt, bi, dragPos, i }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      bal: carry(cv, 0, n, BAL[p], BAL[n], tr),
      // R7b — the arm cracks the block. The far setting says the claim asserts what
      // it denies, and the block carrying that claim splits as the reader arrives at
      // it: the sentence coming apart is the argument.
      crack: carry(cv, 1, n, CRACK[p], reacting ? dragPos.value : CRACK[n], tr),
      route: carry(cv, 2, n, ROUTE[p], ROUTE[n], tr),
      // the beam quivers a hair but never commits — suspended judgment
      tilt: Math.sin(t * 1.1) * 2,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // Twice the rate on the fade: one beat rests `bal` at 0.3, and FOR / AGAINST
  // were reaching the reader at 1.9:1 there — a scale you can see with words you
  // cannot read (D35). Everything else still runs on the raw track.
  const balStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.bal * 2) }));
  const beamStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.tilt}deg` }] }));
  // A 2° tilt lifts a 92-long arm by 92·sin(2°) ≈ 3.2, so the pans ride that exact
  // amount and stay hung off the beam ends instead of drifting away from them.
  const panL = useAnimatedStyle(() => ({ transform: [{ translateY: SCENE.value.tilt * 1.6 }] }));
  const panR = useAnimatedStyle(() => ({ transform: [{ translateY: -SCENE.value.tilt * 1.6 }] }));
  const routeStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.route * 2) }));
  const crackStyle = useAnimatedStyle(() => ({
    // A STEEP RAMP ON THE OPACITY, the raw value everywhere else (D35). The box
    // rests part-arrived on the beat that questions it, and …INCLUDING THAT? — the
    // line the whole lesson turns on — reached the reader at 1.4:1. The rise and
    // the wobble still run the full range; only the legibility comes off the
    // bottom of it.
    opacity: clamp01(SCENE.value.crack * 3),
    transform: [
      { translateY: (1 - SCENE.value.crack) * -8 },
      { rotate: `${Math.sin(SCENE.value.t * 9) * SCENE.value.crack * 1.2}deg` },
    ],
  }));
  const crackLine = useAnimatedStyle(() => ({ opacity: SCENE.value.crack }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── the skeptic's route, written across the top ───────────────────────── */}
      <Animated.View style={[styles.routeTitleWrap, routeStyle]} pointerEvents="none">
        <Text style={styles.routeTitle}>THE SKEPTIC’S ROUTE</Text>
      </Animated.View>
      {STEPS.map((s, k) => <Step key={s.head} S={SCENE} k={k} head={s.head} sub={s.sub} />)}
      <Arrow S={SCENE} k={1} left={127} />
      <Arrow S={SCENE} k={2} left={253} />

      {/* ── the balance that never tips ───────────────────────────────────────── */}
      <Animated.View style={balStyle} pointerEvents="none">
        <View style={styles.post} />
        <View style={styles.base} />
        <View style={styles.fulcrum} />
        <Animated.View style={[styles.beam, beamStyle]}>
          <View style={[styles.hang, { left: 2 }]} />
          <View style={[styles.hang, { right: 2 }]} />
        </Animated.View>

        <Animated.View style={[styles.pan, { left: PAN_L }, panL]}>
          <Text style={styles.panT}>FOR</Text>
          <View style={styles.tallyRow}>
            {TALLY.map((n) => <View key={n} style={styles.tally} />)}
          </View>
        </Animated.View>
        <Animated.View style={[styles.pan, { left: PAN_R }, panR]}>
          <Text style={styles.panT}>AGAINST</Text>
          <View style={styles.tallyRow}>
            {TALLY.map((n) => <View key={n} style={styles.tally} />)}
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── the boast that breaks itself ──────────────────────────────────────── */}
      <Animated.View style={[styles.claim, crackStyle]} pointerEvents="none">
        <Text style={styles.claimT}>NOTHING IS KNOWN</Text>
        <Text style={styles.claimSub}>…INCLUDING THAT?</Text>
        <Animated.View style={[styles.crackA, crackLine]} />
        <Animated.View style={[styles.crackB, crackLine]} />
        <Animated.View style={[styles.crackC, crackLine]} />
      </Animated.View>

      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One box of the route: it writes itself in when the narration reaches that step. */
function Step({ S, k, head, sub }: { S: SharedValue<any>; k: number; head: string; sub: string }) {
  const st = useAnimatedStyle(() => {
    const on = ease01(clamp01(S.value.route - k));
    return { opacity: on, transform: [{ translateX: (1 - on) * -14 }] };
  });
  return (
    <Animated.View style={[styles.box, { left: BOX_X[k] }, st]} pointerEvents="none">
      <Text style={styles.boxHead}>{head}</Text>
      <Text style={styles.boxSub}>{sub}</Text>
    </Animated.View>
  );
}

/** The connector between two boxes: a shaft and a head, revealed with the box it feeds. */
function Arrow({ S, k, left }: { S: SharedValue<any>; k: number; left: number }) {
  const st = useAnimatedStyle(() => ({ opacity: ease01(clamp01(S.value.route - k)) }));
  return (
    <Animated.View style={[styles.arrowWrap, { left }, st]} pointerEvents="none">
      <View style={styles.arrowShaft} />
      <View style={styles.arrowHead} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the route ───────────────────────────────────────────────────────────────
  routeTitleWrap: { position: 'absolute', left: 0, top: 240, width: STAGE_W },
  routeTitle: {
    textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  box: {
    position: 'absolute', top: BOX_T, width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  boxHead: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.6, color: INK,
    includeFontPadding: false, lineHeight: 13,
  },
  boxSub: {
    marginTop: 2,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT,
    includeFontPadding: false, lineHeight: 11,
  },
  arrowWrap: { position: 'absolute', top: BOX_T + BOX_H / 2 - 5, width: 20, height: 10, flexDirection: 'row', alignItems: 'center' },
  arrowShaft: { width: 13, height: 2, backgroundColor: INK },
  arrowHead: {
    width: 0, height: 0, borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 7,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },

  // ── the balance ─────────────────────────────────────────────────────────────
  post: { position: 'absolute', left: BAL_X - 3, top: BEAM_Y, width: 6, height: GROUND - BEAM_Y, backgroundColor: INK },
  base: { position: 'absolute', left: BAL_X - 28, top: GROUND - 7, width: 56, height: 7, backgroundColor: INK, borderRadius: 2 },
  fulcrum: {
    position: 'absolute', left: BAL_X - 10, top: BEAM_Y - 14, width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  beam: {
    position: 'absolute', left: BAL_X - BEAM_HW, top: BEAM_Y, width: BEAM_HW * 2, height: 4.5,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 50%',
  },
  hang: { position: 'absolute', top: 0, width: 2, height: 26, backgroundColor: SOFT },
  // A pan is 66×36: big enough to hold a word AND its three tally blocks, which is
  // what turns "an equal argument is opposed" into something you can count.
  pan: {
    position: 'absolute', top: PAN_T, width: PAN_W, height: PAN_H,
    borderWidth: 2.5, borderColor: INK, borderTopWidth: 0,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  panT: {
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  tallyRow: { flexDirection: 'row', marginTop: 4 },
  tally: { width: 10, height: 7, backgroundColor: INK, borderRadius: 1, marginHorizontal: 2 },

  // ── the boast that breaks itself ────────────────────────────────────────────
  claim: {
    position: 'absolute', left: 240, top: 402, width: 152, height: 60,
    borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  claimT: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.3, color: INK,
    includeFontPadding: false, lineHeight: 16,
  },
  claimSub: {
    marginTop: 4,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false, lineHeight: 12,
  },
  crackA: { position: 'absolute', left: 52, top: -1, width: 2, height: 26, backgroundColor: INK, transform: [{ rotate: '20deg' }] },
  crackB: { position: 'absolute', left: 60, top: 24, width: 2, height: 22, backgroundColor: INK, transform: [{ rotate: '-26deg' }] },
  crackC: { position: 'absolute', left: 52, top: 42, width: 2, height: 16, backgroundColor: INK, transform: [{ rotate: '16deg' }] },
});

// BAND. There is no camera any more, so design y IS screen y. Measured extremes
// across every beat, top to bottom:
//   route title            240 … 253
//   route boxes            256 … 296
//   fulcrum apex           308
//   beam                   322 … 326.5 (±3.2 as it quivers → 318.8 at worst)
//   pans + tallies         348 … 387   (the pans ride ±3.2 with the beam)
//   figure crown           361   (x 64 on GROUND 500 → 500 − 103·1.35)
//   claim card             402 … 462
//   base plate / ground    493 … 501.5
//   ankle joints           507.4 (the ankle CIRCLE hangs limb/2·k ≈ 7.4 below GROUND)
// so [234, 514] holds every pixel with 6 units of margin above and 6.6 below. The
// band is 280 tall, which is still WIDTH-limited on a phone stage (923/400 = 2.31 ≈
// 647/280 = 2.31), so the scene renders about 2.3× instead of 1.15×.
export function Epistemology6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology6Scene} band={[234, 514]} camera={CAM} />;
}
