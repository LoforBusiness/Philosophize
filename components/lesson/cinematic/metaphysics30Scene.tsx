import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics30Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A CAVERN, THE PASSAGES CHARTED SO FAR, AND A WALL NOBODY HAS REACHED.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CAVERN is a filled STONE slab 250×140 at x 120 (120…370), y 250…390. It
//   is the dark the map is drawn against, which is what lets a charted passage be
//   PAPER and still be visible (T2).
// · TEN PASSAGES, each a 30×5 PAPER bar, are scattered across it at fixed places
//   and arrive in order as `charted` climbs. They never move once drawn: an old
//   map is corrected by later ones, not thrown away.
// · the FAR WALL is a dashed 3-wide RULE column at x 364, running the cavern's
//   full height. It is dashed for the whole lesson because a dashed edge is a
//   BOUNDARY rather than a thing, and nobody has ever touched this one.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, fifteen units clear of the cavern at 120.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 232…512 = 280 — a 103-unit
// figure at 36.8%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CAVE_X = 120;
const CAVE_Y = 250;
const CAVE_W = 250;
const CAVE_H = 140;

/** Where each charted passage lies, in cavern-relative units. */
const PASS = [
  [18, 22], [64, 40], [30, 74], [96, 18], [110, 62],
  [58, 104], [142, 36], [128, 88], [174, 66], [166, 112],
];
const PASS_W = 30;
const PASS_H = 5;

const WALL_X = 364;

const CAP_T = 236;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['IT UNDERMINES ITSELF', 'SCIENCE IS UNCERTAIN TOO', 'THE ANSWERS ARE IN'];
const PLATE_ID = ['self', 'science', 'answers'];
/** Only what science can test is meaningful is not a claim science can test. */
const SELF = 0;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const CAVE = BEATS.map((b) => (b.cave ? 1 : 0));
const CHARTED = BEATS.map((b) => b.charted ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics30'));

/** One charted passage. Ten of these is ten hooks, so each gets a component. */
function Passage({ S, k, left, top }: { S: { value: { charted: number } }; k: number; left: number; top: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.charted * 10 - k) }));
  return <Animated.View style={[styles.pass, { left, top }, st]} pointerEvents="none" />;
}

export default function Metaphysics30Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      cave: carry(cv, 1, n, CAVE[p], CAVE[n], tr),
      // HOW MUCH OF THE CAVE IS ON THE MAP, which is what the drawn curve reports.
      charted: carry(cv, 2, n, CHARTED[p], reacting ? dragPos.value : CHARTED[n], tr),
      plates: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const caveStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cave }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE MAP OF WHAT COULD BE TRUE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, caveStyle]} pointerEvents="none">
        <View style={styles.cave} />
        <View style={styles.wall} />
      </Animated.View>

      {PASS.map(([dx, dy], k) => (
        <Passage key={`${dx}-${dy}`} S={SCENE} k={k} left={CAVE_X + dx} top={CAVE_Y + dy} />
      ))}

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === SELF}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === SELF}
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
    position: 'absolute', left: CAVE_X, top: CAP_T, width: CAVE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  cave: {
    position: 'absolute', left: CAVE_X, top: CAVE_Y, width: CAVE_W, height: CAVE_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  // A DASHED EDGE IS A BOUNDARY, not a thing. Nobody has reached this one.
  wall: {
    position: 'absolute', left: WALL_X, top: CAVE_Y, width: 3, height: CAVE_H,
    borderLeftWidth: 3, borderStyle: 'dashed', borderColor: PAPER,
  },
  pass: { position: 'absolute', width: PASS_W, height: PASS_H, backgroundColor: PAPER },

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

export function Metaphysics30Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics30Scene} band={[232, 512]} camera={CAM} />;
}
