import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics27Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FOUR WORKS ON A WALL, AND A GAUGE OVER THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the WALL is a filled STONE slab 264×88 at x 132 (132…396), y 286…374. It is
//   the mass the frames are read against, and it never changes — the lesson is
//   that the AUDIENCE changed, so a wall whose older works looked tamer would be
//   putting the difference in the wrong place (A1).
// · FOUR FRAMES of 52×52 at x 146 · 208 · 270 · 332, y 302…354, drawn identically:
//   a 2.5 ink edge, a paper mount, and the same two marks inside every one.
//   Their dates sit under the wall at y 380 — 1900 · 1920 · 1950 · TODAY.
// · the GAUGE is a 232×18 STONE track at x 150 (150…382), y 258…276, filled from
//   the left in ink. It carries the AVERAGE shock across the four works, which is
//   what the drawn curve reports, so a line that never falls leaves the whole
//   century as startling as its first year.
// · THREE PLATES of 88×26 at x 128 · 218 · 308 (128…396), top y 458.
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate at 128.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const WALL_X = 132;
const WALL_Y = 286;
const WALL_W = 264;
const WALL_H = 88;

const FR_X = [146, 208, 270, 332];
const FR_Y = 302;
const FR_S = 52;
const FR_CAP = ['1900', '1920', '1950', 'TODAY'];
const DATE_T = 380;

const GAU_X = 150;
const GAU_Y = 258;
const GAU_W = 232;
const GAU_H = 18;

const PLATE_X = [128, 218, 308];
const PLATE_Y = 458;
const PLATE_W = 88;
const PLATE_H = 26;
const PLATE_CAP = ['TO SHOCK', 'TO WAKE YOU UP', 'TO SELL'];
const PLATE_ID = ['shock', 'wake', 'sell'];
/** Defamiliarisation: the shock is the method, and waking the reader is the aim. */
const WAKE = 1;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const WALL = BEATS.map((b) => b.wall ?? 0);
const METER = BEATS.map((b) => b.meter ?? 0);
const SHOCK = BEATS.map((b) => b.shock ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics27'));

export default function Aesthetics27Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      wall: carry(cv, 1, n, WALL[p], WALL[n], tr),
      meter: carry(cv, 2, n, METER[p], METER[n], tr),
      // THE DRAWN CURVE'S MEAN HEIGHT is what a plot reports, and the average
      // shock across four generations is exactly what it means here.
      shock: carry(cv, 3, n, SHOCK[p], reacting ? dragPos.value : SHOCK[n], tr),
      plates: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  // A WORK HANGS WHEN THE WALL REACHES ITS QUARTER, so the row fills left to
  // right in date order rather than arriving all at once.
  const f0 = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.wall * 4) }));
  const f1 = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.wall - 0.25) * 4) }));
  const f2 = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.wall - 0.5) * 4) }));
  const f3 = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.wall - 0.75) * 4) }));
  const frames = [f0, f1, f2, f3];

  const gaugeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.meter }));
  const fillStyle = useAnimatedStyle(() => ({ width: GAU_W * clamp01(SCENE.value.shock) }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">SHOCK ON THE WALL</Text>

      <Animated.View style={[styles.gaugeWrap, gaugeStyle]} pointerEvents="none">
        <View style={styles.gauge} />
        <Animated.View style={[styles.gaugeFill, fillStyle]} />
      </Animated.View>

      <View style={styles.wall} pointerEvents="none" />
      {FR_X.map((fx, k) => (
        <Animated.View key={fx} style={[StyleSheet.absoluteFill, frames[k]]} pointerEvents="none">
          <View style={[styles.frame, { left: fx }]} />
          <View style={[styles.mount, { left: fx + 8 }]} />
          <View style={[styles.markA, { left: fx + 13 }]} />
          <View style={[styles.markB, { left: fx + 15 }]} />
          <Text style={[styles.date, { left: fx }]}>{FR_CAP[k]}</Text>
        </Animated.View>
      ))}

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === WAKE}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === WAKE}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
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
    position: 'absolute', left: GAU_X, top: CAP_T, width: GAU_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  gaugeWrap: { position: 'absolute', left: GAU_X, top: GAU_Y, width: GAU_W, height: GAU_H },
  gauge: {
    position: 'absolute', left: 0, top: 0, width: GAU_W, height: GAU_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  gaugeFill: { position: 'absolute', left: 0, top: 0, height: GAU_H, backgroundColor: INK },

  wall: {
    position: 'absolute', left: WALL_X, top: WALL_Y, width: WALL_W, height: WALL_H,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: RULE,
  },
  frame: {
    position: 'absolute', top: FR_Y, width: FR_S, height: FR_S,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  mount: {
    position: 'absolute', top: FR_Y + 8, width: FR_S - 16, height: FR_S - 16,
    borderWidth: 1.2, borderColor: RULE,
  },
  markA: { position: 'absolute', top: FR_Y + 15, width: 26, height: 8, backgroundColor: INK },
  markB: { position: 'absolute', top: FR_Y + 29, width: 22, height: 5, backgroundColor: RULE },
  date: {
    position: 'absolute', top: DATE_T, width: FR_S, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Aesthetics27Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics27Scene} band={[240, 512]} camera={CAM} />;
}
