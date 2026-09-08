import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics39Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FOUR COLUMNS, EACH A PLAN AND THE ROUTE TAKEN FROM IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · four COLUMNS of 58 at x 140 · 202 · 264 · 326, so the row runs 140…384. Each
//   is a NAME at y 256, a PLAN plate 46×20 at y 276, seven STEPS of 20×5 from
//   y 306 down to y 396 at a pitch of 15, and a WORK plate 46×22 at y 404.
// · THE PLAN IS A DASHED EMPTY BOX in the second column and a filled one
//   everywhere else. That is the theory stated in the drawing: the maker with no
//   plan has nothing to close a gap to.
// · THE STEPS WANDER BY `WOB` × the column's own wander — 0, 12, −9, 16, −13, 7, 0
//   — so a straight run and a wandering one are the same seven steps at different
//   offsets, and nothing about the two makers differs except the route.
// · A CHURCH is the fourth column and it is not there until the question is. Its
//   wander is the reader's own chip: 0 for craft, 1 for art, 0.5 for both, which
//   draws a route that starts straight and finds its way later.
// · the WORKS sit on a rail at y 428, and they are drawn identically. The whole
//   claim is that you cannot tell from the object, so the objects must not tell.
// · the figure stands at x 52 and walks to 98; his right edge is 124, clear of the
//   first column's 140.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 232…512 = 280 — a 103-unit
// figure at 36.8%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const COL_X = [140, 202, 264, 326];
const COL_W = 58;
const COL_CAP = ['A CHAIR', 'A POEM', 'A COPY', 'A CHURCH'];
const COL_ID = ['chair', 'poem', 'copy'];
/** The maker who had no plan. The other two were closing a gap. */
const FOUND = 1;

const NAME_Y = 256;
const PLAN_Y = 276;
const PLAN_W = 46;
const PLAN_H = 20;

const STEP_N = 7;
const STEP_Y0 = 306;
const STEP_PITCH = 15;
const STEP_W = 20;
const STEP_H = 5;
/** How far each step strays from the straight line, at wander 1. */
const WOB = [0, 12, -9, 16, -13, 7, 0];
const STEP_Y: number[] = [];
for (let j = 0; j < STEP_N; j++) STEP_Y.push(STEP_Y0 + j * STEP_PITCH);

const WORK_Y = 404;
const WORK_W = 46;
const WORK_H = 22;
const RAIL_Y = 428;

const CAP_T = 236;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const ROUTES = BEATS.map((b) => (b.routes ? 1 : 0));
const STEPS = BEATS.map((b) => b.steps ?? 0);
const WORKS = BEATS.map((b) => (b.works ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// It is also what puts the fourth column on the stage, so the church cannot be
// standing there through six beats of a lesson that has not mentioned it.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE THREE BINS AS THREE ROUTES, in the SORT'S OWN ORDER — `pickPos` runs across
// the bins as the author wrote them, and that is the only order a picture may
// follow, because the rows the reader sees are shuffled.
//                     craft · art · both
const WANDER_AT = [0, 1, 0.5];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics39'));

export default function Aesthetics39Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(6);
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
      routesOn: carry(cv, 1, n, ROUTES[p], ROUTES[n], tr),
      steps: carry(cv, 2, n, STEPS[p], STEPS[n], tr),
      worksOn: carry(cv, 3, n, WORKS[p], WORKS[n], tr),
      churchOn: carry(cv, 4, n, REACT[p], REACT[n], tr),
      // R7c — the chip draws the church's route under the reader's own thumb.
      churchWander: carry(cv, 5, n, 0, reacting ? pickAt(WANDER_AT, pickPos.value) : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const routesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.routesOn }));
  const worksStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.worksOn }));
  const churchStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.churchOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">FOUR MAKERS, FOUR ROUTES</Text>

      <Animated.View style={[StyleSheet.absoluteFill, worksStyle]} pointerEvents="none">
        <View style={styles.rail} />
        {[0, 1, 2].map((k) => (
          <View key={k} style={[styles.work, { left: COL_X[k] + (COL_W - WORK_W) / 2 }]} />
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, routesStyle]}>
        {COL_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === FOUND}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: COL_X[k] }]}
          >
            <Text style={styles.name} pointerEvents="none">{COL_CAP[k]}</Text>
            <View
              style={[
                k === FOUND ? styles.planEmpty : styles.plan,
                answered && picked === COL_ID[k] && k !== FOUND && styles.planWrong,
                answered && k === FOUND && styles.planRight,
              ]}
              pointerEvents="none"
            />
            {STEP_Y.map((sy, j) => (
              <Step key={sy} S={SCENE} column={k} index={j} wander={k === FOUND ? 1 : 0} />
            ))}
          </Target>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, churchStyle]} pointerEvents="none">
        <Text style={[styles.nameAbs, { left: COL_X[3] }]}>{COL_CAP[3]}</Text>
        <View style={[styles.planAbs, { left: COL_X[3] + (COL_W - PLAN_W) / 2 }]} />
        {STEP_Y.map((sy, j) => <Church key={sy} S={SCENE} index={j} />)}
        <View style={[styles.work, { left: COL_X[3] + (COL_W - WORK_W) / 2 }]} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One hour of the making, inside its column's own Target (E39). */
function Step({ S, column, index, wander }: { S: SharedValue<any>; column: number; index: number; wander: number }) {
  const dx = WOB[index] * wander;
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.steps * STEP_N - index) }));
  return (
    <Animated.View
      style={[styles.step, { left: (COL_W - STEP_W) / 2 + dx, top: STEP_Y[index] - NAME_Y }, st]}
      pointerEvents="none"
    />
  );
}

/** The church's route, drawn where the reader's chip puts it. */
function Church({ S, index }: { S: SharedValue<any>; index: number }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: WOB[index] * S.value.churchWander }],
  }));
  return (
    <Animated.View
      style={[styles.step, { left: COL_X[3] + (COL_W - STEP_W) / 2, top: STEP_Y[index] }, st]}
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
    position: 'absolute', left: 140, top: CAP_T, width: 246,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: NAME_Y, width: COL_W, height: STEP_Y0 + STEP_N * STEP_PITCH - NAME_Y },
  name: {
    position: 'absolute', left: 0, top: 0, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  nameAbs: {
    position: 'absolute', top: NAME_Y, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  plan: {
    position: 'absolute', left: (COL_W - PLAN_W) / 2, top: PLAN_Y - NAME_Y, width: PLAN_W, height: PLAN_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  // NO PLAN, AND THE BOX SAYS SO. A dashed empty outline is a boundary with
  // nothing inside it, which is exactly the claim being made about this maker.
  planEmpty: {
    position: 'absolute', left: (COL_W - PLAN_W) / 2, top: PLAN_Y - NAME_Y, width: PLAN_W, height: PLAN_H,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 3,
  },
  planAbs: {
    position: 'absolute', top: PLAN_Y, width: PLAN_W, height: PLAN_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  // THE CORRECT PLAN STAYS DASHED AND EMPTY. Filling it in on a right answer
  // would delete the reason it was the right answer.
  planRight: { borderWidth: 2.5, borderColor: INK },
  planWrong: { borderColor: SOFT, borderStyle: 'dashed' },

  step: { position: 'absolute', width: STEP_W, height: STEP_H, borderRadius: 2, backgroundColor: INK },

  rail: { position: 'absolute', left: 138, top: RAIL_Y, width: 248, height: 1.5, backgroundColor: RULE },
  work: {
    position: 'absolute', top: WORK_Y, width: WORK_W, height: WORK_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
});

export function Aesthetics39Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics39Scene} band={[232, 512]} camera={CAM} />;
}
