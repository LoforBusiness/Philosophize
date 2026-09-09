import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics28Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO BLOCKS SLIDING TOWARD EACH OTHER ON ONE RAIL.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the RAIL is a filled STONE band 284×12 at x 108 (108…392), y 372…384.
// · TWO BLOCKS of 84×48 sit on it at y 324…372, each carrying its name in ink.
//   The left starts at x 112 and the right ends at x 384, and between them they
//   always close 92 units — the GIVE decides which of the two does it, never
//   whether they meet. That is reflective equilibrium drawn instead of stated.
// · a SEAM TICK of 3 wide runs y 316…392 at the midpoint of whatever gap is left,
//   so where the settlement landed is legible without a number.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 78; his widest span at the walked mark
//   is x ≈ 53…103, five units clear of the rail at 108.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const RAIL_X = 108;
const RAIL_Y = 372;
const RAIL_W = 284;
const RAIL_H = 12;

const BLOCK_Y = 324;
const BLOCK_W = 84;
const BLOCK_H = 48;
const L_HOME = 112;
const R_HOME = 300;
/** How far the pair closes, always. Only who walks it is in question. */
const TRAVEL = 92;
const BLOCK_CAP = ['THE PRINCIPLE', 'YOUR GUT'];

const TICK_T = 316;
const TICK_B = 392;

const CAP_T = 244;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['THE PRINCIPLE ALWAYS', 'YOUR GUT ALWAYS', 'NEITHER OF THEM'];
const PLATE_ID = ['rule', 'gut', 'neither'];
/** The method is two-way, and that is the only thing that makes it a method. */
const NEITHER = 2;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const RAIL = BEATS.map((b) => (b.rail ? 1 : 0));
const BLOCKS = BEATS.map((b) => (b.blocks ? 1 : 0));
const GIVE = BEATS.map((b) => b.give ?? 0.5);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics28'));

export default function Ethics28Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      rail: carry(cv, 1, n, RAIL[p], RAIL[n], tr),
      blocks: carry(cv, 2, n, BLOCKS[p], BLOCKS[n], tr),
      // R7b — a split's seam is the LEFT side's share, and the left side here is
      // the principle, so a high seam means the RULE did the bending.
      give: carry(cv, 3, n, GIVE[p], reacting ? dragPos.value : GIVE[n], tr),
      plates: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const railStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rail }));
  const blocksStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.blocks }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  const leftStyle = useAnimatedStyle(() => ({ left: L_HOME + clamp01(SCENE.value.give) * TRAVEL }));
  const rightStyle = useAnimatedStyle(() => ({ left: R_HOME - clamp01(1 - SCENE.value.give) * TRAVEL }));
  const tickStyle = useAnimatedStyle(() => {
    const g = clamp01(SCENE.value.give);
    const lEdge = L_HOME + g * TRAVEL + BLOCK_W;
    const rEdge = R_HOME - (1 - g) * TRAVEL;
    return { left: (lEdge + rEdge) / 2 - 1.5 };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHO GIVES GROUND</Text>

      <Animated.View style={[StyleSheet.absoluteFill, railStyle]} pointerEvents="none">
        <View style={styles.rail} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, blocksStyle]} pointerEvents="none">
        <Animated.View style={[styles.block, leftStyle]}>
          <Text style={styles.blockText} numberOfLines={2}>{BLOCK_CAP[0]}</Text>
        </Animated.View>
        <Animated.View style={[styles.block, rightStyle]}>
          <Text style={styles.blockText} numberOfLines={2}>{BLOCK_CAP[1]}</Text>
        </Animated.View>
        <Animated.View style={[styles.tick, tickStyle]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === NEITHER}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === NEITHER}
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

  cap: {
    position: 'absolute', left: RAIL_X, top: CAP_T, width: RAIL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  rail: {
    position: 'absolute', left: RAIL_X, top: RAIL_Y, width: RAIL_W, height: RAIL_H,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: RULE,
  },
  block: {
    position: 'absolute', top: BLOCK_Y, width: BLOCK_W, height: BLOCK_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  blockText: {
    position: 'absolute', left: 0, top: 15, width: BLOCK_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  tick: { position: 'absolute', top: TICK_T, width: 3, height: TICK_B - TICK_T, backgroundColor: INK },

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

export function Ethics28Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics28Scene} band={[240, 512]} camera={CAM} />;
}
