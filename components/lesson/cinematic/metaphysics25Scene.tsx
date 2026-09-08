import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics25Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE TRUNK, A NODE, AND FOUR ROADS OF WHICH ONE WAS WALKED.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the TRUNK is 8 wide at x 196, running y 388…462 — up from the ground toward
//   the fork, so the picture is read bottom-to-top like a life.
// · the NODE is a disc of 18 at x 191, y 379, where the roads leave.
// · a SPAN of 8 tall at y 380, x 132…292, carries the four ROADS: 6-wide bars at
//   x 132, 186, 240, 292, each rising y 300…380, each topped by a PLATE of 46×24
//   at y 276. Roads rather than branches, drawn as verticals off one span, because
//   a rotated line at this size reads as a crack rather than a fork.
// · THE SECOND ROAD IS SOLID and the other three are DASHED. That is the whole
//   claim in the drawing: one of them was walked and the rest are drawn thin.
// · THREE PLATES of 90×26 at x 106, 202, 298, top y 452 — the answers, each
//   carrying its own words (S11), below the trunk's foot and above the ground.
// · the figure stands at x 44 and walks to 100; his right edge at the walked mark
//   is 125, clear of the leftmost road at 132.
//
// Ink runs y 250 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const TRUNK_X = 196;
const TRUNK_W = 8;
const TRUNK_TOP = 388;
const TRUNK_BOT = 462;

const NODE = 18;
const SPAN_Y = 380;
const SPAN_L = 132;
const SPAN_R = 298;

const ROAD_X = [132, 186, 240, 292];
const ROAD_W = 6;
const ROAD_TOP = 300;
const ROAD_N = 4;
/** The one that happened. Everything else in the scene is drawn thin. */
const WALKED = 1;

const HEAD_Y = 276;
const HEAD_W = 46;
const HEAD_H = 24;
const HEAD_CAP = ['SLEPT IN', 'CAUGHT IT', 'WALKED', 'MISSED IT'];

const PLATE_X = [106, 202, 298];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 26;
const PLATE_CAP = ['THE TRUNK', 'A ROAD EXISTS', 'NOTHING AT ALL'];
const PLATE_ID = ['trunk', 'road', 'nothing'];
/** What "could have" points at. The trunk is only what happened. */
const ROAD = 1;

const CAP_T = 250;
const FIG_X = 44;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const TRUNK = BEATS.map((b) => (b.trunk ? 1 : 0));
const ROADS = BEATS.map((b) => b.roads ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// HOW SOLID AN UNWALKED ROAD IS, in the SORT'S OWN ORDER — `pickPos` runs across
// the bins as the author wrote them, which is the only order a picture may
// follow, because the rows the reader sees are shuffled (X3).
//                    real place · story · loose talk
const SOLIDITY = [1, 0.45, 0.08];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics25'));

export default function Metaphysics25Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      trunkOn: carry(cv, 1, n, TRUNK[p], TRUNK[n], tr),
      roads: carry(cv, 2, n, ROADS[p], ROADS[n], tr),
      platesOn: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
      // R7c — how solid an unwalked road is, under the reader's own thumb. At rest
      // it is 0.45, which is the dashed state the lesson has been drawing all along.
      solid: carry(cv, 4, n, 0.45, reacting ? pickAt(SOLIDITY, pickPos.value) : 0.45, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const trunkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.trunkOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE MORNING, FOUR WAYS</Text>

      <Animated.View style={[StyleSheet.absoluteFill, trunkStyle]} pointerEvents="none">
        <View style={styles.trunk} />
        <View style={styles.node} />
        <Text style={styles.trunkCap}>WHAT HAPPENED</Text>
      </Animated.View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Span S={SCENE} />
        {ROAD_X.map((rx, k) => (
          <Road key={rx} S={SCENE} left={rx} index={k} walked={k === WALKED} label={HEAD_CAP[k]} />
        ))}
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === ROAD}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** The bar the roads leave from, drawn with them rather than before them. */
function Span({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.roads }));
  return <Animated.View style={[styles.span, st]} pointerEvents="none" />;
}

/**
 * One road and the plate at the end of it.
 *
 * The WALKED road is solid always; the other three take their solidity from the
 * reader's chip on the last question, which is the lesson's own disagreement
 * drawn as three states of one line.
 */
function Road({ S, left, index, walked, label }: {
  S: SharedValue<any>; left: number; index: number; walked: boolean; label: string;
}) {
  const bar = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.roads * ROAD_N - index) * (walked ? 1 : S.value.solid),
  }));
  const plate = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.roads * ROAD_N - index) * (walked ? 1 : Math.max(0.25, S.value.solid)),
  }));
  return (
    <>
      <Animated.View style={[styles.road, { left }, bar]} pointerEvents="none" />
      <Animated.View style={[walked ? styles.headWalked : styles.headThin, { left: left + ROAD_W / 2 - HEAD_W / 2 }, plate]} pointerEvents="none">
        <Text style={walked ? styles.headTextWalked : styles.headText}>{label}</Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — the subject stands on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 132, top: CAP_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  trunk: {
    position: 'absolute', left: TRUNK_X, top: TRUNK_TOP, width: TRUNK_W, height: TRUNK_BOT - TRUNK_TOP,
    backgroundColor: INK,
  },
  node: {
    position: 'absolute', left: TRUNK_X - (NODE - TRUNK_W) / 2, top: SPAN_Y - NODE / 2,
    width: NODE, height: NODE, borderRadius: NODE / 2, backgroundColor: INK,
  },
  trunkCap: {
    position: 'absolute', left: TRUNK_X + 18, top: TRUNK_TOP + 24, width: 110,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },

  span: { position: 'absolute', left: SPAN_L, top: SPAN_Y - 4, width: SPAN_R - SPAN_L + ROAD_W, height: 8, backgroundColor: INK },
  road: { position: 'absolute', top: ROAD_TOP, width: ROAD_W, height: SPAN_Y - ROAD_TOP, backgroundColor: INK },

  headWalked: {
    position: 'absolute', top: HEAD_Y, width: HEAD_W, height: HEAD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  // A ROAD NOBODY WALKED IS DRAWN THIN, and the dashes are the claim rather than
  // a style: a boundary with nothing inside it (§13's cheese, read the other way).
  headThin: {
    position: 'absolute', top: HEAD_Y, width: HEAD_W, height: HEAD_H,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 3,
  },
  headText: {
    position: 'absolute', left: 0, top: 7, width: HEAD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  headTextWalked: {
    position: 'absolute', left: 0, top: 7, width: HEAD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics25Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics25Scene} band={[240, 512]} camera={CAM} />;
}
