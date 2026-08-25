import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics18Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO CONTOURS DRAWN FROM ONE ARRAY, AND A PANEL WITH NOTHING IN IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · THREE PANELS, y 250…342 (92 tall): THE MUSIC at x 30…160 (130), A PERSON at
//   x 172…302 (130), and WHO IS SAD at x 314…372 (58). The third is narrow on
//   purpose — it is the one with nothing to show.
// · the CONTOUR is `FALL`, nine values from 0.86 down to 0.06. It is plotted
//   TWICE: as nine 8-wide bars in the music panel, tops at 250 + (1 − v) × 74,
//   and as an eight-segment line in the person panel over the same rows. ONE
//   ARRAY, so A1 holds by construction — there is no second set of numbers that
//   could drift out of agreement with the first.
// · the TIE-LINES are eight 1-thick dashes from each bar's top to the matching
//   point on the body line, crossing the 12-unit gutter at x 160…172.
// · WHO IS SAD holds a 20pt question mark at its centre and never gains anything
//   else. It is not dimmed, greyed or crossed out: it is drawn at full strength
//   and stays empty, which is the claim.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, the panels end
//   at 342, so 55 units stay clear.
//
// Ink runs y 236 (the panel captions) … y 500. BAND 230…512 = 282, with the
// 103-unit figure at 37%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

/** The shape, once. Both contours are drawn from this and nothing else. */
const FALL = [0.86, 0.8, 0.66, 0.62, 0.44, 0.34, 0.3, 0.16, 0.06];

const PAN_Y = 250;
const PAN_H = 92;
const MUS_X = 30;
const MUS_W = 130;
const BOD_X = 172;
const BOD_W = 130;
const ASK_X = 314;
const ASK_W = 58;

const BAR_W = 8;
const BAR_STEP = 14;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const CURVE = BEATS.map((b) => b.curve ?? 0);
const BODY = BEATS.map((b) => b.body ?? 0);
const MATCH = BEATS.map((b) => b.match ?? 0);
const EMPTY = BEATS.map((b) => b.empty ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics18'));

/** y of value v inside a panel. */
const rowY = (v: number) => PAN_Y + 9 + (1 - v) * (PAN_H - 26);

export default function Aesthetics18Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      curve: carry(cv, 1, n, CURVE[p], CURVE[n], tr),
      body: carry(cv, 2, n, BODY[p], BODY[n], tr),
      match: carry(cv, 3, n, MATCH[p], MATCH[n], tr),
      empty: carry(cv, 4, n, EMPTY[p], EMPTY[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const curveStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.curve }));
  const bodyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.body }));
  const matchStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.match }));
  const emptyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.empty }));

  const steps = FALL.map((_, k) => k);

  return (
    <View style={styles.scene}>
      {/* THE MUSIC. Nine bars, one per value. */}
      <Animated.View style={[StyleSheet.absoluteFill, curveStyle]} pointerEvents="none">
        <Text style={[styles.cap, { left: MUS_X, width: MUS_W }]}>THE MUSIC</Text>
        <View style={[styles.panel, { left: MUS_X, width: MUS_W }]} />
        {steps.map((k) => (
          <View
            key={`m${k}`}
            style={[styles.bar, {
              left: MUS_X + 9 + k * BAR_STEP,
              top: rowY(FALL[k]),
              height: PAN_Y + PAN_H - 8 - rowY(FALL[k]),
            }]}
          />
        ))}
      </Animated.View>

      {/* THE PERSON. The same nine values as a line. */}
      <Animated.View style={[StyleSheet.absoluteFill, bodyStyle]} pointerEvents="none">
        <Text style={[styles.cap, { left: BOD_X, width: BOD_W }]}>A PERSON</Text>
        <View style={[styles.panel, { left: BOD_X, width: BOD_W }]} />
        {steps.slice(0, -1).map((k) => {
          const x1 = BOD_X + 9 + k * BAR_STEP;
          const y1 = rowY(FALL[k]);
          const y2 = rowY(FALL[k + 1]);
          const len = Math.hypot(BAR_STEP, y2 - y1);
          const ang = (Math.atan2(y2 - y1, BAR_STEP) * 180) / Math.PI;
          return (
            <View
              key={`b${k}`}
              style={[styles.seg, {
                left: x1, top: y1, width: len,
                transform: [{ rotate: `${ang}deg` }],
              }]}
            />
          );
        })}
      </Animated.View>

      {/* THE TIES. Same row, both panels. */}
      <Animated.View style={[StyleSheet.absoluteFill, matchStyle]} pointerEvents="none">
        {steps.map((k) => (
          <View key={`t${k}`} style={[styles.tie, { top: rowY(FALL[k]) }]} />
        ))}
      </Animated.View>

      {/* THE PANEL THAT STAYS EMPTY. */}
      <Animated.View style={[StyleSheet.absoluteFill, emptyStyle]}>
        <Text style={[styles.cap, { left: ASK_X, width: ASK_W }]}>WHO IS SAD</Text>
        <View style={[styles.panel, { left: ASK_X, width: ASK_W }]} pointerEvents="none" />
        <Text style={styles.askMark}>?</Text>
      </Animated.View>

      {/* THE THREE ANSWERS. */}
      <Target
        id="shape" correct picked={picked} onPick={onPick}
        disabled={!live || answered} style={[styles.hit, { left: MUS_X, width: MUS_W }]}
      >
        <View style={[styles.hitBox, { width: MUS_W }, answered && styles.right]} pointerEvents="none" />
      </Target>
      <Target
        id="person" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered} style={[styles.hit, { left: BOD_X, width: BOD_W }]}
      >
        <View style={[styles.hitBox, { width: BOD_W }, answered && picked === 'person' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="feeling" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered} style={[styles.hit, { left: ASK_X, width: ASK_W }]}
      >
        <View style={[styles.hitBox, { width: ASK_W }, answered && picked === 'feeling' && styles.wrong]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', top: 236, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  panel: {
    position: 'absolute', top: PAN_Y, height: PAN_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: PAPER,
  },
  bar: { position: 'absolute', width: BAR_W, backgroundColor: INK, borderRadius: 1 },
  seg: {
    position: 'absolute', height: 2.5, backgroundColor: INK, borderRadius: 1.5,
    transformOrigin: '0% 50%',
  },
  tie: { position: 'absolute', left: MUS_X + MUS_W, width: BOD_X - MUS_X - MUS_W, height: 1, backgroundColor: RULE },

  askMark: {
    position: 'absolute', left: ASK_X, top: PAN_Y + 30, width: ASK_W, textAlign: 'center',
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PAN_Y, height: PAN_H },
  hitBox: { height: PAN_H, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Aesthetics18Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics18Scene} band={[230, 512]} camera={CAM} />;
}
