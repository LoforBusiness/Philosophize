import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political30Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A STACK OF REAL WRONGS, AND A PERFECT SOCIETY DRAWN IN DASHES BESIDE IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · FIVE BLOCKS of 100×22 at x 140 (140…240), stacked at y 356 · 330 · 304 · 278
//   · 252, each naming a standing injustice in ink. They come off the TOP down as
//   `cleared` climbs, which is what removing the nearest wrong looks like.
// · the FOOTING is a RULE band 140×6 at x 120 (120…260), y 378…384.
// · the IDEAL is an 84×44 dashed box at x 296 (296…380), y 244…288, holding
//   PERFECT JUSTICE. It is dashed for the whole lesson and never fills: a
//   blueprint that arrived would settle the argument the wrong way round (A1).
// · a DOTTED ROAD of five 10×3 marks runs from the stack to the ideal at y 320,
//   x 254 · 274 · 294 · 314 · 334 — the distance nobody has covered.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, fifteen units clear of the footing at 120.
//
// Ink runs y 244 (the ideal) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BLK_X = 140;
const BLK_W = 100;
const BLK_H = 22;
/** Bottom of the stack first; they come off from the top. */
const BLK_Y = [356, 330, 304, 278, 252];
const BLK_CAP = ['SLAVERY', 'FAMINE', 'TORTURE', 'FORCED WORK', 'NO VOTE'];

const FOOT_X = 120;
const FOOT_Y = 378;
const FOOT_W = 140;

const IDEAL_X = 296;
const IDEAL_Y = 244;
const IDEAL_W = 84;
const IDEAL_H = 44;

const ROAD_Y = 320;
const ROAD_X = [254, 274, 294, 314, 334];

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['NO IDEAL IS NEEDED', 'ART CANNOT BE RANKED', 'IDEAL THEORY IS USELESS'];
const PLATE_ID = ['noideal', 'art', 'useless'];
/** Comparing two arrangements needs no transcendent best one. */
const NOIDEAL = 0;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const STACK = BEATS.map((b) => (b.stack ? 1 : 0));
const CLEARED = BEATS.map((b) => b.cleared ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political30'));

/** One standing wrong. Five of these is five hooks, so each gets a component. */
function Block({ S, k }: { S: { value: { stack: number; cleared: number } }; k: number }) {
  const st = useAnimatedStyle(() => ({
    // The TOP of the stack goes first, so k = 4 leaves while `cleared` is still low.
    opacity: clamp01(S.value.stack) * clamp01(1 - (S.value.cleared * 5 - (4 - k))),
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <View style={[styles.block, { top: BLK_Y[k] }]} />
      <Text style={[styles.blockText, { top: BLK_Y[k] + 7 }]}>{BLK_CAP[k]}</Text>
    </Animated.View>
  );
}

export default function Political30Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      stack: carry(cv, 1, n, STACK[p], STACK[n], tr),
      // HOW MUCH HAS COME OFF, which is what the drawn curve reports.
      cleared: carry(cv, 2, n, CLEARED[p], reacting ? dragPos.value : CLEARED[n], tr),
      plates: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const stackStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stack }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, stackStyle]} pointerEvents="none">
        <View style={styles.foot} />
        <View style={styles.ideal} />
        <Text style={styles.idealText}>PERFECT JUSTICE</Text>
        {ROAD_X.map((rx) => <View key={rx} style={[styles.road, { left: rx }]} />)}
      </Animated.View>

      {BLK_Y.map((by, k) => <Block key={by} S={SCENE} k={k} />)}

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === NOIDEAL}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === NOIDEAL}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <Text style={styles.plateText} numberOfLines={2} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  foot: { position: 'absolute', left: FOOT_X, top: FOOT_Y, width: FOOT_W, height: 6, backgroundColor: RULE },
  block: {
    position: 'absolute', left: BLK_X, width: BLK_W, height: BLK_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  blockText: {
    position: 'absolute', left: BLK_X, width: BLK_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  // A DASHED EDGE IS A BOUNDARY, not a thing. This one never fills in.
  ideal: {
    position: 'absolute', left: IDEAL_X, top: IDEAL_Y, width: IDEAL_W, height: IDEAL_H,
    borderWidth: 2, borderStyle: 'dashed', borderColor: INK,
  },
  idealText: {
    position: 'absolute', left: IDEAL_X, top: IDEAL_Y + 12, width: IDEAL_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: SOFT, includeFontPadding: false,
  },
  road: { position: 'absolute', top: ROAD_Y, width: 10, height: 3, backgroundColor: RULE },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 7, width: PLATE_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Political30Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political30Scene} band={[240, 512]} camera={CAM} />;
}
