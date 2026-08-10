import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle, type Stance } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics6Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// The footbridge — and, written up beside it, the SPLIT drawn as a chart: two bars
// for the same trade, landing at opposite heights over one shared footing that
// reads "SAME MATH — 1 FOR 5". That single panel is the whole lesson: the numbers
// do not move, our verdict does.
//
// NO CAMERA. The old version wrapped everything in a 0.9× camera about (222, 452),
// which SHRANK the stage by 10% before the player letterboxed it — the two effects
// together rendered this scene at ~1.04×. Design y is now screen y, and the band
// below crops to the slice that actually holds art, so it renders at ~2.3×.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · The CHART owns the right column, x 264–392, y 240–426. Nothing else is ever
//     drawn there: the stranger's rightmost pixel is his head circle at x ≈ 247.
//   · The STAMP owns the left column, x 12–104, y 292–352. The decider stands at
//     x = 150 facing right; its head circle reaches x ≈ 117 and its widest far-side
//     hand (the "weigh it up" gesture) x ≈ 107.5, so the box is never brushed.
//   · The BRIDGE spans x 104–262 with its deck at y 411; the decider stands at
//     x = 150 (crown ≈ 271) and the larger stranger at x = 216 (crown ≈ 247).
//   · The TRACK runs the full width at y 500; the five stand on it at x 300–380 and
//     the trolley bears down from the left, its wheels reaching y 502.
//   · Nothing is drawn above y = 240 or below y = 506.

const BRIDGE_Y = 410;
const DEC_X = 150;
const STR_X = 216;
const PEG_K = 0.64;                // 103 x 0.64 = 66, the height the row already used
const MAIN5 = [300, 320, 340, 360, 380];

// ── the WOULD YOU DO IT? chart ────────────────────────────────────────────────
// A two-bar comparison is the most honest picture of "most who would pull the lever
// refuse to push": the axis is labelled MOST / FEW rather than with invented survey
// percentages, so the shape carries the claim without fabricating a statistic.
const CH_L = 264;
const CH_W = 128;
// The chart sits 34 units higher than it first did. Its footing ("SAME MATH: 1 FOR
// 5") used to land at 404 … 426, straight on top of the five's tally at 396 … 423 —
// so "THE FIVE" was sliced in half by the footing's border and the tally bracket was
// hidden behind it completely. The column between the bars' baseline and the five's
// heads (434) has to hold four things in order: bar labels, the footing, the tally
// label and the tally bracket. At 380 it could not; at 346 it can.
const BASE_Y = 346;                 // the bars' baseline
const BAR_W = 40;
const BAR_A = 280;                  // SWITCH
const BAR_B = 336;                  // SHOVE
const BAR_A_H = 110;
const BAR_B_H = 20;

const D_CODE = BEATS.map((b) => b.d ?? 0);
const S_CODE = BEATS.map((b) => b.str ?? 0);
const TX = BEATS.map((b) => b.tx ?? 60);
const SHOVE = BEATS.map((b) => b.shove ?? 0);
const CARD = BEATS.map((b) => b.card ?? 0);
const STAMP = BEATS.map((b) => b.stamp ?? 0);

// Sleepers under the rail: cheap, and the difference between "a line" and "a track".
const SLEEPERS = Array.from({ length: 14 }, (_, k) => 34 + k * 26);
// Rail-side balusters, so the handrail reads as a footbridge and not a floating bar.
const BALUSTERS = [110, 138, 166, 194, 222, 250];

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Two figures at 150 and 216, so the track is the point BETWEEN them (183) — following
// either one alone would frame the other out, and here the pair is the subject.
const X = BEATS.map((b) => b.x ?? 183);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics6'));

export default function Ethics6Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const d = mixStance(emoteHold(D_CODE[p], t), emoteLive(D_CODE[n], t, bt.value), tr);
    const str = mixStance(emoteHold(S_CODE[p], t), emoteLive(S_CODE[n], t, bt.value), tr);
    return {
      dec: pose(d, DEC_X, BRIDGE_Y, K_FIG, 1, 1),
      str: pose(str, STR_X, BRIDGE_Y, K_FIG * 1.16, -1, 1),
      tx: L(TX[p], TX[n]),
      shove: L(SHOVE[p], SHOVE[n]),
      card: L(CARD[p], CARD[n]),
      stamp: L(STAMP[p], STAMP[n]),
      wheel: (t * 220) % 360,
      t,
    };
  });

  const DD = useDerivedValue<Bundle>(() => SCENE.value.dec);
  const DS = useDerivedValue<Bundle>(() => SCENE.value.str);
  const trolleyStyle = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.tx }] }));
  const wheelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.wheel}deg` }] }));
  const chartStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.card) }));
  // The stamp lands: it drops the last few units and settles slightly off-square,
  // the way a rubber stamp does — one beat, then it just stays up.
  const stampStyle = useAnimatedStyle(() => {
    const u = ease01(SCENE.value.stamp);
    return {
      opacity: u,
      transform: [{ translateY: (1 - u) * -14 }, { scale: 0.82 + 0.18 * u }, { rotate: `${-5 * u}deg` }],
    };
  });
  const shoveStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shove }));
  const fallStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.shove,
    transform: [{ scaleY: ease01(SCENE.value.shove) }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the track: a rail on sleepers, the full width of the stage ────────── */}
      {SLEEPERS.map((x) => <View key={x} style={[styles.sleeper, { left: x }]} pointerEvents="none" />)}
      <View style={styles.rail} pointerEvents="none" />

      {/* the five, with the tally that says how many */}
      <View style={styles.fiveBar} pointerEvents="none" />
      <View style={[styles.fiveTick, { left: 298 }]} pointerEvents="none" />
      <View style={[styles.fiveTick, { left: 382 }]} pointerEvents="none" />
      <Text style={styles.fiveT}>THE FIVE</Text>
      {MAIN5.map((x, i) => <Peg key={x} x={x} seed={i * 1.7 + 0.4} clock={clock} />)}

      {/* ── the trolley bearing down, streaks trailing behind it ──────────────── */}
      <Animated.View style={[styles.trolleyWrap, trolleyStyle]} pointerEvents="none">
        <View style={[styles.streak, { top: 16, left: -40, width: 32 }]} />
        <View style={[styles.streak, { top: 32, left: -32, width: 24 }]} />
        <View style={[styles.streak, { top: 48, left: -37, width: 29 }]} />
        <View style={styles.car} />
        <View style={styles.carRoof} />
        <View style={[styles.window, { left: 15 }]} />
        <View style={[styles.window, { left: 45 }]} />
        <View style={[styles.window, { left: 75 }]} />
        <Animated.View style={[styles.wheel, { left: 13 }, wheelStyle]}><View style={styles.spoke} /></Animated.View>
        <Animated.View style={[styles.wheel, { left: 67 }, wheelStyle]}><View style={styles.spoke} /></Animated.View>
      </Animated.View>

      {/* ── the bridge ────────────────────────────────────────────────────────── */}
      <View style={styles.bridgePost1} pointerEvents="none" />
      <View style={styles.bridgePost2} pointerEvents="none" />
      {BALUSTERS.map((x) => <View key={x} style={[styles.baluster, { left: x }]} pointerEvents="none" />)}
      <View style={styles.bridgeRail} pointerEvents="none" />
      <View style={styles.bridgeDeck} pointerEvents="none" />

      {/* the fall line the shove would draw, and where it lands */}
      <Animated.View style={[styles.fallLine, fallStyle]} pointerEvents="none" />
      <Animated.View style={[styles.fallHead, shoveStyle]} pointerEvents="none" />

      {/* ── the crux, stamped into the clear column stage left ────────────────── */}
      <Animated.View style={[styles.stamp, stampStyle]} pointerEvents="none">
        <Text style={styles.stampT}>USED AS</Text>
        <Text style={styles.stampT}>A MEANS</Text>
      </Animated.View>

      {/* ── the split, drawn as two bars over one shared footing ──────────────── */}
      <Animated.View style={[styles.chart, chartStyle]} pointerEvents="none">
        <Text style={styles.chTitle}>WOULD YOU?</Text>
        <View style={styles.chAxis} />
        <Bar S={SCENE} at={1} left={BAR_A} h={BAR_A_H} cap="MOST" label="SWITCH" />
        <Bar S={SCENE} at={2} left={BAR_B} h={BAR_B_H} cap="FEW" label="SHOVE" />
        <View style={styles.chFoot}>
          <Text style={styles.chFootT}>SAME MATH: 1 FOR 5</Text>
        </View>
      </Animated.View>

      {/* the decider + the larger stranger, on the bridge */}
      <Stickman D={DD} k={K_FIG} />
      <Stickman D={DS} k={K_FIG * 1.16} />
    </Animated.View>
  );
}

/** One column of the chart: it grows out of the baseline when its row is reached. */
function Bar({
  S, at, left, h, cap, label,
}: { S: SharedValue<any>; at: number; left: number; h: number; cap: string; label: string }) {
  const grow = useAnimatedStyle(() => ({ transform: [{ scaleY: ease01(clamp01(S.value.card - at + 1)) }] }));
  const capStyle = useAnimatedStyle(() => ({ opacity: ease01(clamp01((S.value.card - at + 1) * 2 - 1)) }));
  return (
    <>
      <Animated.View
        style={[styles.bar, { left, width: BAR_W, top: BASE_Y - h, height: h }, grow]}
        pointerEvents="none"
      />
      <Animated.View style={[capStyle, { position: 'absolute', left: left - 8, top: BASE_Y - h - 15, width: BAR_W + 16 }]} pointerEvents="none">
        <Text style={styles.barCap}>{cap}</Text>
      </Animated.View>
      <Text style={[styles.barLabel, { left: left - 8, width: BAR_W + 16 }]}>{label}</Text>
    </>
  );
}

/**
 * One of the five on the line — solved by the rig, not built out of Views.
 *
 * `Peg` here was a disc on a bar. Not even legs, let alone arms or motion, while
 * two fully articulated figures argued on the bridge above it. Five of those read
 * as bollards however tall you make them, which is the whole of "they don't look
 * like stickmen". Bound at the ankles, hands behind the back, each on its own
 * pair of incommensurable sines so the row never falls into step (rule A6).
 */
function boundStance(t: number, seed: number): Stance {
  'worklet';
  const w = Math.sin(t * 1.6 + seed) * 0.58 + Math.sin(t * 1.03 + seed * 2.7) * 0.42;
  const v = Math.sin(t * 2.2 + seed * 1.9) * 0.6 + Math.sin(t * 1.4 + seed) * 0.4;
  return {
    tilt: 0.03 + w * 0.06,
    neck: -0.03 + v * 0.16,
    bob: v * 0.9,
    footL: { x: -3.4 + w * 0.5, y: 0 },
    footR: { x: 3.4 + w * 0.5, y: 0 },
    fistL: { x: -11 - v * 0.8, y: 5 + w * 1.4 },
    fistR: { x: -13 + v * 0.8, y: 6 - w * 1.4 },
    adv: 0,
  };
}

function Peg({ x, seed, clock }: { x: number; seed: number; clock: SharedValue<number> }) {
  const D = useDerivedValue<Bundle>(() => pose(boundStance(clock.value, seed), x, GROUND, PEG_K, 1, 1));
  return <Stickman D={D} k={PEG_K} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },

  // ── track ───────────────────────────────────────────────────────────────────
  rail: { position: 'absolute', left: 20, right: 8, top: GROUND, height: 2.5, backgroundColor: INK },
  sleeper: { position: 'absolute', top: 502, width: 3, height: 4, backgroundColor: SOFT },

  // ── the five ────────────────────────────────────────────────────────────────
  // 66 tall, not 30. Against figures of 139 and 161 on the bridge these were a fifth
  // of a person — specks, when they are the five lives the whole dilemma weighs.
  // 18 + 49 − 1 = 66. Five at true scale cannot fit (they would need ~500 units of
  // width and have 90), so this stays a schematic — but one that reads as people.
  // The tally moves up clear of the taller figures, which now reach y 434.
  fiveBar: { position: 'absolute', left: 298, top: 416, width: 86, height: 1.5, backgroundColor: SOFT },
  fiveTick: { position: 'absolute', top: 416, width: 1.5, height: 7, backgroundColor: SOFT },
  fiveT: {
    position: 'absolute', left: 288, top: 396, width: 106, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT, includeFontPadding: false,
  },

  // ── the trolley ─────────────────────────────────────────────────────────────
  // 104×78. It was 62×40, which made the tram SHORTER than a person — and once the
  // five were drawn at a readable 66 it would have been shorter than its victims,
  // which is both wrong and unreadable. A tram is taller than the people it bears
  // down on. The ceiling is the bridge: at 78 its roof sits at y 422, four units
  // under the deck it has to pass beneath.
  trolleyWrap: { position: 'absolute', left: 0, top: GROUND - 78, width: 104, height: 78 },
  car: {
    position: 'absolute', left: 0, top: 12, width: 104, height: 50,
    borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
  },
  carRoof: { position: 'absolute', left: 13, top: 0, width: 78, height: 10, backgroundColor: INK, borderRadius: 3 },
  window: { position: 'absolute', top: 22, width: 14, height: 16, backgroundColor: INK, borderRadius: 2 },
  wheel: {
    position: 'absolute', top: 54, width: 24, height: 24, borderRadius: 12,
    borderWidth: 3, borderColor: INK, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  spoke: { width: 3, height: 16, backgroundColor: INK },
  streak: { position: 'absolute', height: 1.5, backgroundColor: SOFT, borderRadius: 1 },

  // ── the bridge ──────────────────────────────────────────────────────────────
  bridgePost1: { position: 'absolute', left: 116, top: BRIDGE_Y + 8, width: 6, height: GROUND - BRIDGE_Y - 8, backgroundColor: SOFT },
  bridgePost2: { position: 'absolute', left: 250, top: BRIDGE_Y + 8, width: 6, height: GROUND - BRIDGE_Y - 8, backgroundColor: SOFT },
  bridgeDeck: { position: 'absolute', left: 104, top: BRIDGE_Y + 1, width: 158, height: 7, backgroundColor: INK, borderRadius: 2 },
  bridgeRail: { position: 'absolute', left: 104, top: BRIDGE_Y - 30, width: 158, height: 3.5, backgroundColor: SOFT, borderRadius: 2 },
  baluster: { position: 'absolute', top: BRIDGE_Y - 27, width: 2, height: 28, backgroundColor: RULE },

  // ── the shove, as a drawn consequence rather than an animation of a body ────
  fallLine: {
    position: 'absolute', left: STR_X - 1, top: 424, width: 2, height: 58,
    backgroundColor: SOFT, transformOrigin: '50% 0%',
  },
  fallHead: {
    position: 'absolute', left: STR_X - 6, top: 482, width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 11,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },

  // ── the crux, stamped ───────────────────────────────────────────────────────
  // Width 92 at x 12 is measured, not chosen: the decider's far-side fist on the
  // "weigh it up" gesture (code 21, fistL x = −26 rig) reaches x ≈ 107.5, so a
  // wider box would be brushed by a hand on the last question beat.
  stamp: {
    position: 'absolute', left: 12, top: 292, width: 92, height: 60,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  stampT: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, lineHeight: 17, letterSpacing: 0.8,
    color: INK, includeFontPadding: false,
  },

  // ── the chart ───────────────────────────────────────────────────────────────
  chart: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  // Centred in a 128-wide column, "WOULD YOU?" renders about 80 wide, so its first
  // glyph starts near x 288 — well clear of the stranger's head circle, whose right
  // edge reaches x ≈ 266 on his most-leaning beat.
  chTitle: {
    position: 'absolute', left: CH_L, top: 206, width: CH_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  chAxis: { position: 'absolute', left: CH_L + 4, top: BASE_Y, width: CH_W - 8, height: 1.5, backgroundColor: RULE },
  bar: { position: 'absolute', backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 100%' },
  barCap: {
    textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  barLabel: {
    position: 'absolute', top: 351, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  chFoot: {
    position: 'absolute', left: CH_L, top: 370, width: CH_W, height: 22,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  chFootT: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.6, color: INK, includeFontPadding: false },
});

// BAND. There is no camera any more, so design y IS screen y. Measured extremes
// across every beat, top to bottom:
//   chart title            240 … 253
//   chart title            206 … 219  (the chart moved up 34 — see BASE_Y)
//   "MOST" bar cap         221 … 234
//   stranger's crown       247   (x 216 on BRIDGE_Y 410 → 410 − 103·1.566)
//   decider's crown        271   (x 150 on BRIDGE_Y 410 → 410 − 103·1.35)
//   stamp                  292 … 352
//   bridge handrail        380
//   chart footing          370 … 392
//   bridge deck            411 … 418
//   bridge figures' ankle joints  417   (they stand ON the deck, not the ground)
//   THE FIVE tally         396 … 423
//   fall arrowhead         482 … 493
//   the five               434 … 500
//   trolley roof           422 … 500  (roof must clear the deck at 411 … 418)
//   rail                   500 … 502.5
//   sleepers               502 … 506
// so [200, 512] holds every pixel with 6 units of margin above and 6 below. Raising
// the top from 234 to 200 to take in the lifted chart title costs NOTHING on screen:
// at 312 tall the band is still WIDTH-limited on a phone stage (360/400 = 0.90 <
// 314/312 = 1.01), so the scene renders at exactly the same 0.90 it did at 278 tall.
export function Ethics6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics6Scene} band={[200, 512]} camera={CAM} />;
}
