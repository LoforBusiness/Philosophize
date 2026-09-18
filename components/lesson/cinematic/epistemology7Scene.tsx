import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology7Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { Shapes, Outlined, ell, bar, rect, tri, type Part } from './Silhouette';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// THE CONFIDENCE CHART. Hume's problem drawn as the picture it actually is: a bar
// chart of the chicken's confidence climbing one fed morning at a time, a trend line
// ruled straight through the tops of the bars — and then the vertical rule marked
// TOMORROW, past which there is no bar at all. Only a dashed box with a "?" sitting
// exactly where the projection says the next bar "should" be.
//
// COMPOSITION / OCCLUSION —
//   · the farmer stands at x = 58 and never moves. His widest gesture (13,
//     point-forward) reaches x ≈ 113; his head circle spans x ≈ 34…88; his crown
//     rides to y ≈ 358 and his ankles to y ≈ 508.
//   · the hen occupies x 120…201, y 419…500 — clear of the farmer's reach by 7 and
//     entirely BELOW the chart baseline (418).
//   · the chart owns x ≥ 156 above y = 440, so nothing it draws can ever touch the
//     figure or the hen.
//
// GEOMETRY — bars are pitched 42 apart and grow 28 taller each morning, so the four
// tops are exactly collinear: the trend line is one straight View and its dashed
// projection continues at the identical angle into the unknown column.

const FIG_X = 58;

const BASE = 418;                       // chart baseline
const AX_L = 156;                       // y-axis
const BAR_W = 30;
const BAR_X = [168, 210, 252, 294];     // pitch 42
const BAR_H = [34, 62, 90, 118];        // +28 per morning
const TIP = BAR_H.map((h) => BASE - h); // 384 · 356 · 328 · 300
const MID = BAR_X.map((x) => x + BAR_W / 2); // 183 · 225 · 267 · 309

const DIV_X = 330;                      // the TODAY rule, drawn as a dash stack
const DIV_Y = Array.from({ length: 12 }, (_, k) => 254 + k * 16);   // 254 … 430

const FUT_L = 334;
const FUT_W = 34;
const FUT_H = 146;                      // the height the trend PREDICTS
const FUT_T = BASE - FUT_H;             // 272

// One straight rule through all four bar tops, and its continuation past TODAY.
const TREND_LEN = Math.hypot(MID[3] - MID[0], TIP[3] - TIP[0]);     // 151.4
const PROJ_LEN = Math.hypot(42, 28);                                // 50.5
const TREND_ANG = '-33.69deg';

// group AH — the strike across the dashed TOMORROW column: two lines corner to
// corner of the same box the "?" sits in, so the mark IS the guess it crosses out.
const WRONGX_LEN = Math.hypot(FUT_W, FUT_H);
const WRONGX_ANG = (Math.atan2(FUT_H, FUT_W) * 180) / Math.PI; // ≈ 76.9°, near-vertical

const HEN_L = 120;
const HEN_T = GROUND - 76;              // 424 — the hen stands on the ground line
const FEED_X = [100, 108, 116];

// ── THE HEN, in her own 88 × 76 box, facing right (the box is flipped to face the feed)
//
// She was a paper egg with a disc on top, a pill for a comb and a head as wide as
// her body, and the whole of her bobbed up and down: a toy, not a bird. The reference
// is specific about what makes a hen and not a rooster or a duck — a heavy body,
// DEEPEST AT THE BREAST; a short tail of straight feathers rising at the top rear; a
// small head with a small comb and a wattle; a short beak; and bare shanks dropping
// from the rear half of the body with three toes forward. A tall comb or a long
// curved tail is a rooster, long legs a wader.
//
// She PECKS FROM THE BASE OF HER NECK. The head turns forward and down about that
// joint while the body holds still, which is what pecking is; moving the whole bird
// was a hop. Outlined as one union, so the neck grows out of the body with no seam.
const HEN_FEET: Part[] = [
  bar(36, 58, 36, 72, 3, INK), bar(46, 58, 46, 72, 3, INK),
  bar(36, 73, 44, 73.5, 2.4, INK), bar(46, 73, 54, 73.5, 2.4, INK),
  bar(36, 73, 32.5, 72.5, 2, INK), bar(46, 73, 42.5, 72.5, 2, INK),
];
const HEN_BODY: Part[] = [rect(22, 30, 14, 24, PAPER, -35, 4), ell(41, 46, 56, 36, PAPER, 10)];
/** In the neck's own 40 × 40 box, whose bottom centre is the pivot at (60, 36). */
const HEN_HEAD: Part[] = [bar(19, 40, 22, 24, 12, PAPER), ell(24, 18, 17, 17, PAPER)];
const HEN_COMB: Part[] = [ell(19.5, 9.5, 5, 5, INK), ell(23.5, 8, 5.5, 5.5, INK), ell(27.5, 9.5, 5, 5, INK)];
const HEN_FACE: Part[] = [tri(35.5, 19, 8, 6, 'right', INK, 6), ell(32, 26, 4, 6, INK), ell(26.5, 16, 3.4, 3.4, INK)];
/** How far the head turns down at the bottom of a peck. */
const PECK_DEG = 45;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const DAYS = BEATS.map((b) => b.days ?? 0);
const TWIST = BEATS.map((b) => b.twist ?? 0);
// group AH — one still-tap event each, plain carried 0/1 tracks
const ASK = BEATS.map((b) => b.ask ?? 0);
const ALSO = BEATS.map((b) => b.also ?? 0);
const LOOP = BEATS.map((b) => b.loop ?? 0);
const WRONGX = BEATS.map((b) => b.wrongX ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology7'));

// R7c — the chart follows the drag on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

// DOES THE READER STILL PROJECT PAST TODAY? `twist` draws the dashed projection
// past the TOMORROW rule and the column it predicts. The drag's first zone, STOP
// USING IT (0 … 0.28), "abandon it, since reason can't justify it", makes no
// inference about tomorrow, so the projection is withdrawn. Both other zones
// "rely on induction" — by custom, or calling it proved — so both draw it; and the
// column stays a dashed "?" in both, because relying on a projection, or calling it
// proved, puts no observed bar there. The past bars (`days`) never move: stopping
// induction does not un-feed a morning. The swap straddles the zone's edge.
const RELY_FROM = 0.28;
const RELY_BAND = 0.08;

export default function Epistemology7Scene({ clock, bt, bi, i, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(6);
  const reacting = REACT[i] === 1;
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    const days = carry(cv, 0, n, DAYS[p], DAYS[n], tr);
    const relies = clamp01((dragPos.value - (RELY_FROM - RELY_BAND)) / (2 * RELY_BAND));
    const twist = carry(cv, 1, n, TWIST[p], reacting ? relies : TWIST[n], tr);
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      days,
      twist,
      // The rule draws itself along with the bars: 1 morning = nothing, 4 = full.
      trend: clamp01((days - 1) / 3),
      peck: Math.max(0, Math.sin(t * 3.2)),
      ask: carry(cv, 2, n, ASK[p], ASK[n], tr),
      also: carry(cv, 3, n, ALSO[p], ALSO[n], tr),
      loop: carry(cv, 4, n, LOOP[p], LOOP[n], tr),
      wrongX: carry(cv, 5, n, WRONGX[p], WRONGX[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const trendStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.days - 1),
    transform: [{ rotate: TREND_ANG }, { scaleX: SCENE.value.trend }],
  }));
  const projStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.twist,
    transform: [{ rotate: TREND_ANG }, { scaleX: SCENE.value.twist }],
  }));
  const futStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.twist,
    transform: [{ scale: 0.82 + 0.18 * SCENE.value.twist }],
  }));
  const peckStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${SCENE.value.peck * PECK_DEG}deg` }],
  }));
  // group AH — one still-tap event each, stacked stage left where the chart leaves
  // the figure's head clear (his crown rides to y ≈ 358).
  const askStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ask }));
  const alsoStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.also }));
  const loopStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.loop }));
  // The X only strikes what is actually drawn: it rides the same opacity as the
  // dashed column, so it can never float over a box that has faded away.
  const wrongXStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.wrongX * SCENE.value.twist }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the chart frame ──────────────────────────────────────────────────── */}
      <View style={styles.layer} pointerEvents="none">
        <Text style={styles.axisTitle}>CONFIDENCE</Text>
        <Text style={styles.futTitle}>TOMORROW</Text>
        <View style={styles.axis} />
        <View style={styles.baseline} />
        <Text style={styles.pastTitle}>MORNINGS FED</Text>
        {DIV_Y.map((y) => (
          <View key={y} style={[styles.divDash, { top: y }]} />
        ))}
      </View>

      {/* ── group AH: three still-tap tags, stacked in the clear air over the
          farmer's head, and a strike across the wrong guess ─────────────────── */}
      <Animated.View style={[styles.sideTag, { top: 246 }, askStyle]} pointerEvents="none">
        <Text style={styles.sideTagT}>JUSTIFIED?</Text>
      </Animated.View>
      <Animated.View style={[styles.sideTag, { top: 270 }, alsoStyle]} pointerEvents="none">
        <Text style={styles.sideTagT}>SCIENCE, TOO</Text>
      </Animated.View>
      <Animated.View style={[styles.sideTag, { top: 294 }, loopStyle]} pointerEvents="none">
        <Text style={styles.sideTagT}>CIRCULAR</Text>
      </Animated.View>

      {/* ── one bar per morning the farmer turned up ─────────────────────────── */}
      {BAR_X.map((_, k) => (
        <Bar key={k} S={SCENE} k={k} />
      ))}

      {/* ── the rule through the tops, and the projection past TODAY ─────────── */}
      <Animated.View style={[styles.trend, trendStyle]} pointerEvents="none" />
      <Animated.View style={[styles.proj, projStyle]} pointerEvents="none" />

      {/* ── the column the projection promises, and never delivers ───────────── */}
      <Animated.View style={[styles.future, futStyle]} pointerEvents="none">
        <Text style={styles.futureQ}>?</Text>
      </Animated.View>
      {/* "its conclusion was false" — the confident guess, struck through. */}
      <Animated.View style={[styles.wrongXWrap, wrongXStyle]} pointerEvents="none">
        <View style={styles.wrongXLineA} />
        <View style={styles.wrongXLineB} />
      </Animated.View>

      {/* ── a ✓ badge riding the top of every confirmed morning ──────────────── */}
      {BAR_X.map((_, k) => (
        <Badge key={k} S={SCENE} k={k} />
      ))}

      {/* ── the yard ─────────────────────────────────────────────────────────── */}
      {FEED_X.map((x) => (
        <View key={x} style={[styles.feed, { left: x }]} pointerEvents="none" />
      ))}

      {/* Both outlines first, then both fills, so the neck and the body share ONE
          outline; the comb goes under the head's fill and the face over it. */}
      <View style={styles.hen} pointerEvents="none">
        <Shapes parts={HEN_FEET} />
        <Outlined parts={HEN_BODY} width={3} line={INK} pass="line" />
        <Animated.View style={[styles.henNeck, peckStyle]}>
          <Outlined parts={HEN_HEAD} width={3} line={INK} pass="line" />
          <Shapes parts={HEN_COMB} />
        </Animated.View>
        <Outlined parts={HEN_BODY} width={3} line={INK} pass="fill" />
        <Animated.View style={[styles.henNeck, peckStyle]}>
          <Outlined parts={HEN_HEAD} width={3} line={INK} pass="fill" />
          <Shapes parts={HEN_FACE} />
        </Animated.View>
      </View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One morning's bar, growing out of the baseline as the evidence lands. */
function Bar({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.days - k);
    return { opacity: v, transform: [{ scaleY: 0.05 + 0.95 * v }] };
  });
  return (
    <Animated.View
      style={[styles.bar, { left: BAR_X[k], top: TIP[k], height: BAR_H[k] }, st]}
      pointerEvents="none"
    />
  );
}

/** The ✓ that caps a confirmed morning — the data point on the trend line. */
function Badge({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.days - k);
    return { opacity: v, transform: [{ scale: 0.5 + 0.5 * v }] };
  });
  return (
    <Animated.View
      style={[styles.badge, { left: MID[k] - 11, top: TIP[k] - 11 }, st]}
      pointerEvents="none"
    >
      <View style={styles.checkA} />
      <View style={styles.checkB} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for the static chart furniture. Always pointerEvents="none".
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 24, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── chart furniture ─────────────────────────────────────────────────────────
  axis: { position: 'absolute', left: AX_L, top: 252, width: 2, height: BASE - 252, backgroundColor: INK },
  baseline: { position: 'absolute', left: AX_L, top: BASE, width: 238, height: 2, backgroundColor: INK },
  axisTitle: {
    position: 'absolute', left: AX_L, top: 234, width: 174,
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  // Tracking 0.3, not 1: "TOMORROW" is eight wide capitals (two of them M and W) and
  // at 1 it measured a hair over the 68-unit box, so it wrapped and left the final
  // "W" stranded on a line of its own.
  futTitle: {
    position: 'absolute', left: DIV_X, top: 234, width: 68, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.3, color: SOFT,
    includeFontPadding: false,
  },
  pastTitle: {
    position: 'absolute', left: 168, top: 426, width: 156, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  divDash: { position: 'absolute', left: DIV_X, width: 2, height: 8, backgroundColor: SOFT },

  // ── the data ────────────────────────────────────────────────────────────────
  bar: { position: 'absolute', width: BAR_W, backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 100%' },
  trend: {
    position: 'absolute', left: MID[0], top: TIP[0] - 1.5, width: TREND_LEN, height: 3,
    backgroundColor: INK, borderRadius: 1.5, transformOrigin: '0% 50%',
  },
  proj: {
    position: 'absolute', left: MID[3], top: TIP[3] - 1.25, width: PROJ_LEN, height: 2.5,
    backgroundColor: SOFT, borderRadius: 1.25, transformOrigin: '0% 50%',
  },
  badge: {
    position: 'absolute', width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  checkA: { position: 'absolute', left: 6, top: 11, width: 5, height: 2, backgroundColor: INK, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  checkB: { position: 'absolute', left: 8, top: 9, width: 10, height: 2, backgroundColor: INK, borderRadius: 1, transform: [{ rotate: '-50deg' }] },

  // borderRadius stays 0: Android silently falls back to a SOLID border when a
  // dashed one is rounded, and the whole point of this column is that it is drawn
  // in dashes — the bar that was predicted but never actually observed.
  future: {
    position: 'absolute', left: FUT_L, top: FUT_T, width: FUT_W, height: FUT_H,
    borderWidth: 2, borderColor: INK, borderStyle: 'dashed', borderRadius: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  futureQ: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 38, color: INK,
    includeFontPadding: false,
  },
  // "its conclusion was false" — an X the size of the whole dashed box, corner to
  // corner, so it reads as crossing out the guess rather than as a new mark beside it.
  wrongXWrap: { position: 'absolute', left: FUT_L, top: FUT_T, width: FUT_W, height: FUT_H },
  wrongXLineA: {
    position: 'absolute', left: FUT_W / 2 - WRONGX_LEN / 2, top: FUT_H / 2 - 1.25,
    width: WRONGX_LEN, height: 2.5, backgroundColor: INK, borderRadius: 1.25,
    transform: [{ rotate: `${WRONGX_ANG}deg` }],
  },
  wrongXLineB: {
    position: 'absolute', left: FUT_W / 2 - WRONGX_LEN / 2, top: FUT_H / 2 - 1.25,
    width: WRONGX_LEN, height: 2.5, backgroundColor: INK, borderRadius: 1.25,
    transform: [{ rotate: `${-WRONGX_ANG}deg` }],
  },

  // ── group AH: three still-tap tags stacked stage left, above the farmer's crown ──
  sideTag: {
    position: 'absolute', left: 14, width: 116, paddingVertical: 3,
    borderWidth: 1.5, borderColor: INK, borderRadius: 6, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center',
  },
  sideTagT: { fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false },

  // ── the yard ────────────────────────────────────────────────────────────────
  feed: { position: 'absolute', top: GROUND - 4, width: 4, height: 4, borderRadius: 2, backgroundColor: SOFT },
  // Flipped to face the farmer and the feed.
  hen: { position: 'absolute', left: HEN_L, top: HEN_T, width: 88, height: 76, transform: [{ scaleX: -1 }] },
  // PIVOTED AT ITS BOTTOM CENTRE, the base of her neck (Z4).
  henNeck: { position: 'absolute', left: 40, top: -4, width: 40, height: 40, transformOrigin: '50% 100%' },
});

// Art runs from the chart titles (y 234) down to the farmer's ankles (y 508). The
// player crops to that slice, so everything renders about twice the size it did when
// the full 560 was letterboxed into the stage.
export function Epistemology7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology7Scene} band={[226, 514]} camera={CAM} />;
}
