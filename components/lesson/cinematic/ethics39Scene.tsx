import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics39Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A STAIRCASE FROM KNOWS BETTER TO DOES BETTER, AND A TOKEN THAT STALLS ON IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the LOWER PLATFORM is 116×36 at x 120, y 434…470 — it meets the ground line
//   at 500 with the figure's own floor between them — and the UPPER is 92×30 at
//   x 296, y 264…294. They carry KNOWS BETTER and DOES BETTER.
// · the three STEPS are 86×30, rising to the right: x 150/218/286 at y 400/356/
//   312. JUDGE · INTEND · ACT. Each step is INSIDE its own Target (E39), so the
//   thing that lifts when the reader answers is the step they chose.
// · the TOKEN is an 18-disc walked along a five-point path — floor, step, step,
//   step, platform — by `pickAt` on TOK_X and TOK_Y, so `climb` 0.75 puts it on
//   ACT and 1 puts it on the platform above. One value, one path, and the stall
//   is a number rather than a special case.
// · IT SITS ON THE FLOOR WHILE THE READER IS CHOOSING. A token already parked
//   under ACT would answer the question the beat is asking (group O), so the
//   climb does not begin until the beat after.
// · the SORT's three bins are three climbs: all the way for a change of mind,
//   nowhere at all for a preference that was there before midnight, and the stall
//   on ACT for weakness.
// · the figure stands at x 52 and walks to 98; his right edge is 124, which
//   clears the lower platform at 120 by standing in front of it — the platform is
//   the only thing on the stage he is nearer to than the camera.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 232…512 = 280 — a 103-unit
// figure at 36.8%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const LOW_X = 120;
const LOW_Y = 434;
const LOW_W = 116;
const LOW_H = 36;

const UP_X = 296;
const UP_Y = 264;
const UP_W = 92;
const UP_H = 30;

const ST_W = 86;
const ST_H = 30;
const ST_X = [150, 218, 286];
const ST_Y = [400, 356, 312];
const ST_CAP = ['JUDGE', 'INTEND', 'ACT'];
const ST_ID = ['judge', 'intend', 'act'];

const TOK = 18;
/** The token's path: the floor, each step's face, then the platform above. */
const TOK_X = [LOW_X + 40, ST_X[0] + 34, ST_X[1] + 34, ST_X[2] + 34, UP_X + 38];
const TOK_Y = [LOW_Y - TOK - 2, ST_Y[0] - TOK - 2, ST_Y[1] - TOK - 2, ST_Y[2] - TOK - 2, UP_Y - TOK - 2];

const CAP_T = 236;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const STAIR = BEATS.map((b) => (b.stair ? 1 : 0));
const RUNGS = BEATS.map((b) => (b.rungs ? 1 : 0));
const CLIMB = BEATS.map((b) => b.climb ?? 0);
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE THREE BINS AS THREE CLIMBS, in the SORT'S OWN ORDER — `pickPos` is 0..1
// across the bins as the author wrote them, which is the only order a picture may
// follow, since the rows themselves are shuffled.
//                       mind · weak · hidden
const CLIMB_AT = [1, 0.75, 0];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics39'));

export default function Ethics39Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(4);
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
      stairOn: carry(cv, 1, n, STAIR[p], STAIR[n], tr),
      rungsOn: carry(cv, 2, n, RUNGS[p], RUNGS[n], tr),
      // R7c — the chip's bin IS the token's height. The reader watches it run to
      // the top or refuse to leave the floor as they move it.
      climb: carry(cv, 3, n, CLIMB[p], reacting ? pickAt(CLIMB_AT, pickPos.value) : CLIMB[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const stairStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stairOn }));
  const rungStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rungsOn }));
  const tokenStyle = useAnimatedStyle(() => {
    const u = SCENE.value.climb;
    return { transform: [{ translateX: pickAt(TOK_X, u) - TOK_X[0] }, { translateY: pickAt(TOK_Y, u) - TOK_Y[0] }] };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">FROM KNOWING TO DOING</Text>

      <Animated.View style={[StyleSheet.absoluteFill, stairStyle]}>
        <View style={styles.low} pointerEvents="none" />
        <Text style={styles.lowText} pointerEvents="none">KNOWS BETTER</Text>
        <View style={styles.up} pointerEvents="none" />
        <Text style={styles.upText} pointerEvents="none">DOES BETTER</Text>

        {ST_X.map((sx, k) => (
          <Target
            key={sx}
            id={ST_ID[k]}
            correct={k === 2}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: sx, top: ST_Y[k] }]}
            sealAt="tr"
          >
            <View
              style={[
                styles.step,
                answered && picked === ST_ID[k] && k !== 2 && styles.stepWrong,
                answered && k === 2 && styles.stepRight,
              ]}
              pointerEvents="none"
            >
              <Animated.View style={rungStyle}>
                <Text style={[styles.stepText, answered && k === 2 && styles.stepTextOn]}>{ST_CAP[k]}</Text>
              </Animated.View>
            </View>
          </Target>
        ))}

        <Animated.View style={[styles.token, tokenStyle]} pointerEvents="none" />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand
  // their subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 132, top: CAP_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  low: {
    position: 'absolute', left: LOW_X, top: LOW_Y, width: LOW_W, height: LOW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  lowText: {
    position: 'absolute', left: LOW_X, top: LOW_Y + 13, width: LOW_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  up: {
    position: 'absolute', left: UP_X, top: UP_Y, width: UP_W, height: UP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  upText: {
    position: 'absolute', left: UP_X, top: UP_Y + 10, width: UP_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', width: ST_W, height: ST_H },
  step: {
    position: 'absolute', left: 0, top: 0, width: ST_W, height: ST_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  stepRight: { backgroundColor: INK },
  stepWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  stepText: {
    position: 'absolute', left: 0, top: 10, width: ST_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
  stepTextOn: { color: PAPER },

  token: {
    position: 'absolute', left: TOK_X[0] - TOK / 2, top: TOK_Y[0], width: TOK, height: TOK,
    borderRadius: TOK / 2, backgroundColor: INK,
  },
});

export function Ethics39Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics39Scene} band={[232, 512]} camera={CAM} />;
}
