import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics6Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// The Ship of Theseus drawn as INFORMATION, not just mood.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · A step CHART owns the top strip, y 238–346, x 14–380: "ORIGINAL WOOD IN THE
//     HULL", falling 100% → 0% as the centuries of repairs pass. It is the lesson's
//     premise stated as a measurement, and it never dips below y = 346.
//   · The shipwright stands at x = 60 on GROUND = 500, so it spans about x 12–110
//     and y 361–500 — clear of the chart above and of both hulls to its right.
//   · SHIP ONE (the hull that never stopped sailing) is centred at x = 186 and
//     SHIP TWO (rebuilt from the hoarded old planks, last question only) at x = 330.
//     Each hull is 112 wide; the gap between them holds the "?" that is the whole
//     second question.
//   · The "SO DO YOUR CELLS" tag (x 124–240, y 331–349) turns the chart on the
//     reader for one beat; it sits in the tick row's gap and under the plot, so it
//     never touches the axis labels or the masts (which start at y 356).
//   · Nothing is drawn above y = 238 or below the ankle joints at 507.4, which is
//     what lets the player crop to band [232, 512] and render ~2.3× instead of 1.15×.

const FIG_X = 60;
const SHIP_X = 186;                 // the repaired ship — never stopped sailing
const SHIP2_X = 330;                // the ship rebuilt from the old planks

// ── the chart ────────────────────────────────────────────────────────────────
const AX_X = 60;                    // y-axis rule
const PLOT_L = 62;
const PLOT_R = 372;
const PLOT_T = 268;                 // 100%
const PLOT_B = 326;                 // 0%
const STEPS = 8;
const STEP_W = (PLOT_R - PLOT_L) / STEPS;
// Each step is one refit: a stretch of years at a level, then a drop.
const FRAC = [1, 0.93, 0.82, 0.68, 0.52, 0.36, 0.19, 0];
const STEP_Y = FRAC.map((f) => PLOT_B - f * (PLOT_B - PLOT_T));

// ── the hull ─────────────────────────────────────────────────────────────────
const PLANKS = [0, 1, 2, 3];
const PLANK_W = [112, 100, 82, 54];        // courses taper toward the keel
const PLANK_Y = [428, 440, 452, 464];
const PLANK_H = 12;
const SEAMS = [0.26, 0.52, 0.78];          // where one board ends and the next starts

const P_CODE = BEATS.map((b) => b.p ?? 0);
const SWAP = BEATS.map((b) => b.swap ?? 0);
const TWO = BEATS.map((b) => b.two ?? 0);
const ORIG = BEATS.map((b) => b.orig ?? 0);
const YOU = BEATS.map((b) => b.you ?? 0);

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
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics6'));

export default function Metaphysics6Scene({ clock, bt, bi, i, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(4);
  const orig = ORIG[i];
  const changed = i > 0 && ORIG[i - 1] !== orig;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    const remaining = carry(cv, 0, n, ORIG[p], ORIG[n], tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      prog: 1 - remaining,                 // how much of the hull is new wood
      swap: carry(cv, 1, n, SWAP[p], SWAP[n], tr),
      // R7b — the seam builds the second ship. Slide toward THE ORIGINAL PLANKS and
      // the rival hull assembles out of the discarded wood; slide the other way and it
      // goes, leaving only the one that never stopped sailing.
      two: carry(cv, 2, n, TWO[p], reacting ? 1 - dragPos.value : TWO[n], tr),
      you: carry(cv, 3, n, YOU[p], YOU[n], tr),
      worked: clamp01((1 - remaining) * 3),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const two = useAnimatedStyle(() => ({
    opacity: SCENE.value.two,
    transform: [{ translateX: (1 - SCENE.value.two) * 22 }],
  }));
  const askStyle = useAnimatedStyle(() => {
    const u = ease01(SCENE.value.two);
    return { opacity: u, transform: [{ scale: 0.55 + 0.45 * u }, { rotate: `${(1 - u) * -14}deg` }] };
  });
  const labelStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.worked }));
  // The reader's own curve: the tag writes itself in from the left under the plot.
  const youStyle = useAnimatedStyle(() => {
    const u = ease01(SCENE.value.you);
    return { opacity: u, transform: [{ translateX: (1 - u) * -16 }] };
  });
  // The readout pops once, only on the beat whose number actually changed.
  const readStyle = useAnimatedStyle(() => {
    if (!changed) return { transform: [{ scale: 1 }] };
    const u = Math.min(bt.value, 0.5) / 0.5;
    return { transform: [{ scale: 1 + 0.14 * Math.sin(Math.PI * u) }] };
  });
  const nowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: clamp01(SCENE.value.prog) * (PLOT_R - PLOT_L) }],
  }));
  const markStyle = useAnimatedStyle(() => {
    const p = clamp01(SCENE.value.prog);
    const u = p * (STEPS - 1);
    const i0 = Math.floor(u);
    const i1 = i0 + 1 > STEPS - 1 ? STEPS - 1 : i0 + 1;
    const y = lerp(STEP_Y[i0], STEP_Y[i1], u - i0);
    return { transform: [{ translateX: p * (PLOT_R - PLOT_L) }, { translateY: y - STEP_Y[0] }] };
  });

  return (
    <Animated.View style={styles.scene}>
      {/* ── the chart: original wood, century by century ──────────────────────── */}
      <Text style={styles.chTitle}>ORIGINAL WOOD IN THE HULL</Text>
      <Animated.View style={[styles.readWrap, readStyle]} pointerEvents="none">
        <Text style={styles.readNum}>{Math.round(orig * 100)}%</Text>
      </Animated.View>

      <View style={styles.axisY} pointerEvents="none" />
      <View style={styles.axisX} pointerEvents="none" />
      <Text style={[styles.tickY, { top: PLOT_T - 6 }]}>100%</Text>
      <Text style={[styles.tickY, { top: PLOT_B - 6 }]}>0%</Text>
      <Text style={styles.tickL}>LAUNCHED</Text>
      <Text style={styles.tickR}>300 YEARS ON</Text>

      {/* the whole path, faint — then the ink line drawing itself over it */}
      {STEP_Y.map((_, k) => <GhostStep key={`g${k}`} k={k} />)}
      {STEP_Y.map((_, k) => <Step key={`s${k}`} S={SCENE} k={k} />)}

      <Animated.View style={[styles.nowLine, nowStyle]} pointerEvents="none" />
      <Animated.View style={[styles.mark, markStyle]} pointerEvents="none" />

      {/* the same curve, turned on the reader */}
      <Animated.View style={[styles.youTag, youStyle]} pointerEvents="none">
        <Text style={styles.youT}>SO DO YOUR CELLS</Text>
      </Animated.View>

      {/* ── the ship that kept sailing ────────────────────────────────────────── */}
      <Ship S={SCENE} x={SHIP_X} live />
      <Animated.View style={[styles.shipLabel, { left: SHIP_X - 58 }, labelStyle]} pointerEvents="none">
        <Text style={styles.shipLabelT}>REPAIRED</Text>
      </Animated.View>

      {/* ── the ship rebuilt from the hoarded planks, and the question it forces ─ */}
      <Animated.View style={[StyleSheet.absoluteFill, two]} pointerEvents="none">
        <Ship S={SCENE} x={SHIP2_X} live={false} />
        <View style={[styles.shipLabel, { left: SHIP2_X - 58 }]}>
          <Text style={styles.shipLabelT}>REBUILT</Text>
        </View>
      </Animated.View>
      <Animated.View style={[styles.ask, askStyle]} pointerEvents="none">
        <Text style={styles.askT}>?</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** The faint future of the line — every step the refits will eventually take. */
function GhostStep({ k }: { k: number }) {
  const dy = k < STEPS - 1 ? STEP_Y[k + 1] - STEP_Y[k] : 0;
  return (
    <>
      <View
        style={[styles.ghostBar, { left: PLOT_L + STEP_W * k, top: STEP_Y[k] - 1, width: STEP_W }]}
        pointerEvents="none"
      />
      {k < STEPS - 1 ? (
        <View
          style={[styles.ghostBar, { left: PLOT_L + STEP_W * (k + 1) - 1, top: STEP_Y[k], width: 2, height: dy }]}
          pointerEvents="none"
        />
      ) : null}
    </>
  );
}

/** One refit, inked in as the centuries reach it: a level stretch, then a drop. */
function Step({ S, k }: { S: SharedValue<any>; k: number }) {
  const dy = k < STEPS - 1 ? STEP_Y[k + 1] - STEP_Y[k] : 0;
  const bar = useAnimatedStyle(() => ({
    transform: [{ scaleX: ease01(clamp01(S.value.prog * STEPS - k)) }],
  }));
  // The drop runs three times faster than the tread, so the line falls first and
  // then walks along — the way a hand would draw it.
  const drop = useAnimatedStyle(() => ({
    transform: [{ scaleY: ease01(clamp01((S.value.prog * STEPS - k - 1) * 3)) }],
  }));
  return (
    <>
      <Animated.View
        style={[styles.inkBar, { left: PLOT_L + STEP_W * k, top: STEP_Y[k] - 1.25, width: STEP_W }, bar]}
        pointerEvents="none"
      />
      {k < STEPS - 1 ? (
        <Animated.View
          style={[styles.inkDrop, { left: PLOT_L + STEP_W * (k + 1) - 1.25, top: STEP_Y[k], height: dy }, drop]}
          pointerEvents="none"
        />
      ) : null}
    </>
  );
}

function Ship({ S, x, live }: { S: SharedValue<any>; x: number; live: boolean }) {
  return (
    <View style={styles.shipWrap} pointerEvents="none">
      {/* mast, yard and sail */}
      <View style={[styles.mast, { left: x - 2 }]} />
      <View style={[styles.yard, { left: x - 2 }]} />
      <View style={[styles.sail, { left: x + 4 }]} />
      <View style={[styles.reef, { left: x + 6, top: 380, width: 23 }]} />
      <View style={[styles.reef, { left: x + 6, top: 398, width: 11 }]} />
      {/* stern post, deck, raised prow */}
      <View style={[styles.stern, { left: x - 60 }]} />
      <View style={[styles.deck, { left: x - 58 }]} />
      <View style={[styles.prow, { left: x + 52 }]} />
      {/* the hull: tapering courses, each re-planked end to end */}
      {PLANKS.map((k) => <Plank key={k} S={S} x={x} k={k} live={live} />)}
    </View>
  );
}

/**
 * One hull course. The OLD board is drawn first in SOFT; the new one grows across
 * it from the stern, so the replacement reads as work being done rather than a
 * colour flip. `swap` rides a PAPER joint along the seam being fitted.
 */
function Plank({ S, x, k, live }: { S: SharedValue<any>; x: number; k: number; live: boolean }) {
  const w = PLANK_W[k];
  const bottom = k === PLANKS.length - 1;
  const fresh = useAnimatedStyle(() => {
    const rep = live ? clamp01(S.value.prog * 4 - k) : 0;
    return { transform: [{ scaleX: rep }] };
  });
  const joint = useAnimatedStyle(() => {
    const rep = live ? clamp01(S.value.prog * 4 - k) : 0;
    const bump = 4 * rep * (1 - rep);                    // brightest mid-course
    const shimmer = 0.55 + 0.45 * Math.sin(S.value.t * 3 + k * 1.3);
    return { opacity: S.value.swap * bump * shimmer, transform: [{ translateX: w * rep }] };
  });
  return (
    <>
      <View style={[styles.plankOld, bottom && styles.plankBottom, { left: x - w / 2, top: PLANK_Y[k], width: w }]} />
      <Animated.View
        style={[styles.plankNew, bottom && styles.plankBottom, { left: x - w / 2, top: PLANK_Y[k], width: w }, fresh]}
      />
      {SEAMS.map((f) => (
        <View key={f} style={[styles.seam, { left: x - w / 2 + w * f, top: PLANK_Y[k] + 1 }]} />
      ))}
      <Animated.View style={[styles.joint, { left: x - w / 2 - 1.25, top: PLANK_Y[k] }, joint]} />
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  chTitle: {
    position: 'absolute', left: 20, top: 243, width: 218,
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  readWrap: { position: 'absolute', left: 244, top: 238, width: 136, alignItems: 'flex-end' },
  readNum: {
    fontFamily: 'Inter_700Bold', fontSize: 19, lineHeight: 23, letterSpacing: 0.4,
    color: INK, includeFontPadding: false,
  },

  axisY: { position: 'absolute', left: AX_X, top: PLOT_T - 8, width: 1.5, height: PLOT_B - PLOT_T + 12, backgroundColor: RULE },
  axisX: { position: 'absolute', left: AX_X, top: PLOT_B + 2, width: PLOT_R - AX_X + 2, height: 1.5, backgroundColor: RULE },
  tickY: {
    position: 'absolute', left: 12, width: 44, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },
  tickL: {
    position: 'absolute', left: AX_X, top: 334,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  tickR: {
    position: 'absolute', left: 240, top: 334, width: 134, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },

  ghostBar: { position: 'absolute', height: 2, backgroundColor: RULE },
  inkBar: { position: 'absolute', height: 2.5, backgroundColor: INK, borderRadius: 1.5, transformOrigin: '0% 50%' },
  inkDrop: { position: 'absolute', width: 2.5, backgroundColor: INK, borderRadius: 1.5, transformOrigin: '50% 0%' },
  nowLine: { position: 'absolute', left: PLOT_L - 0.75, top: PLOT_T - 8, width: 1.5, height: PLOT_B - PLOT_T + 14, backgroundColor: SOFT, opacity: 0.4 },
  mark: {
    position: 'absolute', left: PLOT_L - 5, top: STEP_Y[0] - 5, width: 10, height: 10, borderRadius: 5,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },

  shipWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  mast: { position: 'absolute', top: 356, width: 4, height: 70, backgroundColor: INK, borderRadius: 2 },
  yard: { position: 'absolute', top: 362, width: 44, height: 3, backgroundColor: INK, borderRadius: 2 },
  sail: {
    position: 'absolute', top: 366, width: 0, height: 0,
    borderTopWidth: 0, borderBottomWidth: 54, borderLeftWidth: 38,
    borderBottomColor: 'transparent', borderLeftColor: SOFT,
  },
  reef: { position: 'absolute', height: 1.5, backgroundColor: PAPER },
  stern: { position: 'absolute', top: 406, width: 4, height: 20, backgroundColor: INK, borderRadius: 2 },
  deck: { position: 'absolute', top: 424, width: 116, height: 5, backgroundColor: INK, borderRadius: 2 },
  prow: {
    position: 'absolute', top: 406, width: 0, height: 0,
    borderBottomWidth: 18, borderRightWidth: 12,
    borderBottomColor: INK, borderRightColor: 'transparent',
  },

  plankOld: { position: 'absolute', height: PLANK_H, backgroundColor: SOFT },
  plankNew: { position: 'absolute', height: PLANK_H, backgroundColor: INK, transformOrigin: '0% 50%' },
  plankBottom: { borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  seam: { position: 'absolute', width: 1.5, height: PLANK_H - 2, backgroundColor: PAPER },
  joint: { position: 'absolute', width: 2.5, height: PLANK_H, backgroundColor: PAPER },

  shipLabel: { position: 'absolute', top: 482, width: 116, alignItems: 'center' },
  shipLabelT: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT, includeFontPadding: false,
  },

  // The whole second question in one mark, so it reads at a glance between the two
  // hulls. Sits at y 364–404: clear of the plot's tick row above (ends 349) and of
  // ship one's prow / ship two's stern post below (both start at 406).
  ask: {
    position: 'absolute', left: 243, top: 364, width: 40, height: 40, borderRadius: 20,
    borderWidth: 2.5, borderColor: INK, backgroundColor: STONE, alignItems: 'center', justifyContent: 'center',
  },
  askT: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, lineHeight: 29, color: INK, includeFontPadding: false },

  // Slides in under the plot on the "you are the living proof" beat — the one beat
  // whose stage was otherwise inert, and the moment the chart stops being about
  // a boat. x 124–240 keeps it clear of the LAUNCHED tick (ends ≈ 110) and of the
  // right-aligned 300-YEARS-ON tick (whose glyphs start ≈ 300).
  youTag: {
    position: 'absolute', left: 124, top: 331, width: 116, height: 18,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  youT: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8, color: INK, includeFontPadding: false },
});

// BAND. No camera transform here, so design y IS screen y. Measured extremes across
// every beat, top to bottom:
//   chart readout      238   (the highest thing drawn; chart title 243)
//   figure crown       361   (x 60 on GROUND 500 → 500 − 103·1.35)
//   "?" disc           364 … 404
//   the two ship labels     482 … 494
//   ground rule        500 … 501.5
//   ankle joints       507.4 (the ankle CIRCLE hangs limb/2·k ≈ 7.4 below GROUND)
// so [232, 512] holds every pixel with 6 units of margin above and 4.6 below. The
// band is 280 tall, which is still WIDTH-limited on a phone stage (923/400 = 2.31 <
// 647/280 = 2.31), so the extra bottom margin costs nothing and the scene renders
// about 2.3× instead of the 1.15× a full-height fit would give.
export function Metaphysics6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics6Scene} band={[232, 512]} camera={CAM} />;
}
