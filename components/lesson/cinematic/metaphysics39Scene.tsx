import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics39Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A WILTING PLANT, FOUR NAMED PLATES, AND FOUR IDENTICAL DASHED RUNS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · four PLATES 100×26 at x 140, tops y 262 · 292 · 322 · 352, so their middles
//   sit at 275 · 305 · 335 · 365. Each is INSIDE its own Target (E39).
// · four RUNS of 48×2 from x 244 to x 292, one at each plate's middle, DASHED —
//   a solid arrow would say a force travelled, and the whole point is that none
//   did. All four are drawn from one style, so the picture cannot prefer one.
// · the PLANT is a POT 48×34 at x 296, y 356…390, a 3-wide STEM from y 270 up to
//   the pot, and two LEAVES of 26×10 hinged at the stem — the left one at its
//   right end, the right one at its left — each swinging 35° down with `wilt`.
//   The runs at y 274…364 all land inside the plant's own 270…390.
// · the SPLIT dims three of the four runs. `dragPos` is the LEFT side's share
//   (R7b) and the left side is THE PHYSICS, so handing the bar to the physics
//   must bring every run BACK: it cannot tell the gardener from the king, and the
//   picture says so by refusing to choose.
// · the figure stands at x 52 and walks to 98; his right edge is 124, clear of
//   the plates' 140.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 232…512 = 280 — a 103-unit
// figure at 36.8%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PL_X = 140;
const PL_W = 100;
const PL_H = 26;
const PL_Y = [262, 292, 322, 352];
const PL_CAP = ['A NEIGHBOUR', 'THE GARDENER', 'A STRANGER', 'THE KING'];
const PL_ID = ['neighbour', 'gardener', 'stranger', 'king'];
/** The one with a job. Everything else on this stage is symmetric on purpose. */
const BLAMED = 1;

const RUN_X = 244;
const RUN_W = 48;

const POT_X = 296;
const POT_Y = 356;
const POT_W = 48;
const POT_H = 34;
const STEM_X = POT_X + POT_W / 2 - 1.5;
const STEM_TOP = 270;
const LEAF_W = 26;
const LEAF_H = 10;
const LEAF_Y = [278, 300];
/** How far a leaf swings down when the plant has gone, in degrees. */
const DROOP = 35;

const CAP_T = 236;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const PLANT = BEATS.map((b) => (b.plant ? 1 : 0));
const WILT = BEATS.map((b) => b.wilt ?? 0);
const FOLK = BEATS.map((b) => (b.folk ? 1 : 0));
const ARROWS = BEATS.map((b) => (b.arrows ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics39'));

export default function Metaphysics39Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      plantOn: carry(cv, 1, n, PLANT[p], PLANT[n], tr),
      wilt: carry(cv, 2, n, WILT[p], WILT[n], tr),
      folkOn: carry(cv, 3, n, FOLK[p], FOLK[n], tr),
      arrowsOn: carry(cv, 4, n, ARROWS[p], ARROWS[n], tr),
      // R7c — how far the picture has narrowed to one absence. 1 leaves only the
      // gardener's run; 0 shows all four, which is what the physics alone can say.
      focus: carry(cv, 5, n, 0, reacting ? 1 - dragPos.value : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const plantStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plantOn }));
  const folkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.folkOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">NOBODY WATERED IT</Text>

      <Animated.View style={[StyleSheet.absoluteFill, plantStyle]} pointerEvents="none">
        <View style={styles.stem} />
        <Leaf S={SCENE} side={0} />
        <Leaf S={SCENE} side={1} />
        <View style={styles.pot} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, folkStyle]}>
        {PL_Y.map((py, k) => <Run key={py} S={SCENE} index={k} />)}

        {PL_Y.map((py, k) => (
          <Target
            key={py}
            id={PL_ID[k]}
            correct={k === BLAMED}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { top: py }]}
          >
            <View
              style={[
                styles.plate,
                answered && picked === PL_ID[k] && k !== BLAMED && styles.plateWrong,
                answered && k === BLAMED && styles.plateRight,
              ]}
              pointerEvents="none"
            >
              <Text style={[styles.plateText, answered && k === BLAMED && styles.plateTextOn]}>{PL_CAP[k]}</Text>
            </View>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One dashed run from a plate to the plant. Identical to the other three. */
function Run({ S, index }: { S: SharedValue<any>; index: number }) {
  const blamed = index === BLAMED;
  const st = useAnimatedStyle(() => ({
    opacity: S.value.arrowsOn * (blamed ? 1 : 1 - S.value.focus),
  }));
  return <Animated.View style={[styles.run, { top: PL_Y[index] + PL_H / 2 - 1 }, st]} pointerEvents="none" />;
}

/** One leaf, hinged where it meets the stem, swinging down as the plant goes. */
function Leaf({ S, side }: { S: SharedValue<any>; side: number }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(side === 0 ? -DROOP : DROOP) * S.value.wilt}deg` }],
  }));
  return (
    <Animated.View
      style={[
        styles.leaf,
        {
          left: side === 0 ? STEM_X - LEAF_W : STEM_X + 3,
          top: LEAF_Y[side],
          transformOrigin: side === 0 ? '100% 50%' : '0% 50%',
        },
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
    position: 'absolute', left: PL_X, top: CAP_T, width: 246,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  stem: { position: 'absolute', left: STEM_X, top: STEM_TOP, width: 3, height: POT_Y - STEM_TOP + 4, backgroundColor: INK },
  leaf: {
    position: 'absolute', width: LEAF_W, height: LEAF_H,
    borderTopLeftRadius: LEAF_H, borderTopRightRadius: LEAF_H,
    borderBottomLeftRadius: LEAF_H, borderBottomRightRadius: LEAF_H,
    borderWidth: 1.5, borderColor: INK, backgroundColor: STONE,
  },
  pot: {
    position: 'absolute', left: POT_X, top: POT_Y, width: POT_W, height: POT_H,
    borderWidth: 2, borderColor: INK,
    borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    backgroundColor: STONE,
  },

  // DASHED, NOT SOLID. Nothing travelled along these; each one is a question
  // about what would have happened, and a solid arrow would claim otherwise.
  run: {
    position: 'absolute', left: RUN_X, width: RUN_W, height: 0,
    borderTopWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },

  hit: { position: 'absolute', left: PL_X, width: PL_W, height: PL_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PL_W, height: PL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  plateRight: { backgroundColor: INK },
  plateWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  plateTextOn: { color: PAPER },
});

export function Metaphysics39Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics39Scene} band={[232, 512]} camera={CAM} />;
}
