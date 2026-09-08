import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology38Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE ROUNDELS, EACH WITH ONE SOLID SHOT AND SIX HOLLOW NEAR MISSES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · three ROUNDELS of 76 across, centres at x 168 · 252 · 336 and y 338, so the
//   row runs x 130…374 with the figure's 78 well clear of it. Each is a STONE
//   face, a 40 inner ring and a 14 bull, concentric.
// · THE SOLID SHOT is the belief: 10 across, on the bull for the first two and
//   26 right and 18 up for the third, which is the one that is simply wrong.
// · THE SIX HOLLOW SHOTS are the near cases, at 60° apart. Their radius is 12 on
//   the first and third roundels and 12 + 34·`wide` on the second, so the middle
//   face is the only one whose neighbours leave the rings.
// · THE ROUNDEL IS ROUND, so its Target carries `radius: 38` — a circular thing
//   answered through a square ring is `check:shape`'s own finding, and the prop
//   has existed all along for exactly this.
// · THE VERDICTS WAIT. KNOWS · LUCKY · MISTAKEN print at y 390, and not until the
//   beat after the question: a label reading LUCKY over the answer is the whole
//   reveal, printed before the pick (group O).
// · the RAIL under them is at y 382, x 124…380.
// · the figure stands at x 52 and walks to 98; his right edge is 124, which meets
//   the rail's own left end and clears the first roundel's 130.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 232…512 = 280 — a 103-unit
// figure at 36.8%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const R_OUT = 76;
const R_MID = 40;
const R_BULL = 14;
const R_CX = [168, 252, 336];
const R_CY = 338;
const R_ID = ['aim', 'luck', 'miss'];
const R_CAP = ['KNOWS', 'LUCKY', 'MISTAKEN'];

const SHOT = 10;
const NEAR = 8;
const NEAR_N = 6;
const NEAR_R0 = 12;
const NEAR_SPREAD = 34;
/** Where each roundel's own belief landed, relative to its centre. */
const HIT_DX = [0, 0, 26];
const HIT_DY = [0, 0, -18];

const RAIL_Y = 382;
const CAP_Y = 390;

const CAP_T = 236;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const ROUNDELS = BEATS.map((b) => (b.roundels ? 1 : 0));
const SHOTS = BEATS.map((b) => (b.shots ? 1 : 0));
const WIDE = BEATS.map((b) => b.wide ?? 0);
const NAMES = BEATS.map((b) => (b.names ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology38'));

export default function Epistemology38Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      roundelsOn: carry(cv, 1, n, ROUNDELS[p], ROUNDELS[n], tr),
      shotsOn: carry(cv, 2, n, SHOTS[p], SHOTS[n], tr),
      namesOn: carry(cv, 3, n, NAMES[p], NAMES[n], tr),
      // R7c — THE SCATTER IS THE SEAM. `dragPos` is the LEFT side's share (R7b)
      // and the left side is THE SHOOTER, so handing the bar to the shooter must
      // CLOSE the near shots: the wider they sit, the less of the hit was aim.
      wide: carry(cv, 4, n, WIDE[p], reacting ? 1 - dragPos.value : WIDE[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const onStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.roundelsOn }));
  const nameStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.namesOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE SHOT EACH, AND WHAT WAS NEARLY SHOT</Text>

      <Animated.View style={[StyleSheet.absoluteFill, onStyle]}>
        <View style={styles.rail} pointerEvents="none" />

        {R_CX.map((cx, k) => (
          <Target
            key={cx}
            id={R_ID[k]}
            correct={k === 1}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            radius={R_OUT / 2}
            style={[styles.hit, { left: cx - R_OUT / 2 }]}
          >
            <View
              style={[
                styles.face,
                answered && picked === R_ID[k] && k !== 1 && styles.faceWrong,
                answered && k === 1 && styles.faceRight,
              ]}
              pointerEvents="none"
            >
              <View style={styles.ringMid} />
              <View style={styles.bull} />
              {[0, 1, 2, 3, 4, 5].map((j) => <Near key={j} S={SCENE} roundel={k} index={j} />)}
              <Shot S={SCENE} roundel={k} />
            </View>
          </Target>
        ))}

        <Animated.View style={nameStyle} pointerEvents="none">
          {R_CX.map((cx, k) => (
            <Text key={cx} style={[styles.name, { left: cx - R_OUT / 2 }]}>{R_CAP[k]}</Text>
          ))}
        </Animated.View>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** The belief that was actually formed — solid, and on the bull for two of three. */
function Shot({ S, roundel }: { S: SharedValue<any>; roundel: number }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.shotsOn }));
  return (
    <Animated.View
      style={[
        styles.shot,
        { left: R_OUT / 2 + HIT_DX[roundel] - SHOT / 2, top: R_OUT / 2 + HIT_DY[roundel] - SHOT / 2 },
        st,
      ]}
    />
  );
}

/** One near case: what the same method would have given a small change away. */
function Near({ S, roundel, index }: { S: SharedValue<any>; roundel: number; index: number }) {
  const a = (index * Math.PI * 2) / NEAR_N;
  const cx = Math.cos(a);
  const sy = Math.sin(a);
  const st = useAnimatedStyle(() => {
    const r = roundel === 1 ? NEAR_R0 + NEAR_SPREAD * S.value.wide : NEAR_R0;
    return {
      opacity: clamp01(S.value.shotsOn * NEAR_N - index),
      transform: [{ translateX: cx * r }, { translateY: sy * r }],
    };
  });
  return (
    <Animated.View
      style={[
        styles.near,
        { left: R_OUT / 2 + HIT_DX[roundel] - NEAR / 2, top: R_OUT / 2 + HIT_DY[roundel] - NEAR / 2 },
        st,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand
  // their subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 128, top: CAP_T, width: 256,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  rail: { position: 'absolute', left: 124, top: RAIL_Y, width: 256, height: 1.5, backgroundColor: RULE },

  hit: { position: 'absolute', top: R_CY - R_OUT / 2, width: R_OUT, height: R_OUT },
  face: {
    position: 'absolute', left: 0, top: 0, width: R_OUT, height: R_OUT, borderRadius: R_OUT / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  faceRight: { borderWidth: 3.5 },
  faceWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  ringMid: {
    position: 'absolute', left: (R_OUT - R_MID) / 2, top: (R_OUT - R_MID) / 2, width: R_MID, height: R_MID,
    borderRadius: R_MID / 2, borderWidth: 1.5, borderColor: SOFT,
  },
  bull: {
    position: 'absolute', left: (R_OUT - R_BULL) / 2, top: (R_OUT - R_BULL) / 2, width: R_BULL, height: R_BULL,
    borderRadius: R_BULL / 2, borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },
  shot: { position: 'absolute', width: SHOT, height: SHOT, borderRadius: SHOT / 2, backgroundColor: INK },
  near: {
    position: 'absolute', width: NEAR, height: NEAR, borderRadius: NEAR / 2,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },

  name: {
    position: 'absolute', top: CAP_Y, width: R_OUT, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },
});

export function Epistemology38Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology38Scene} band={[232, 512]} camera={CAM} />;
}
