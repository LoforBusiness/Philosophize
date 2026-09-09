import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political28Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE CELL, TWO BOARDS OVER IT, AND AN EYE THAT ARRIVES LAST.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO BOARDS of 100×22 at x 134 and x 256, y 242…264, each carrying its reason
//   in ink. A board is STONE when nobody is leaning on it and fills with ink when
//   somebody is, so which reason is doing the work is legible from across a room.
// · TWO STEMS of 4 wide run from each board down to the cell, x 182 and x 304,
//   y 264…300.
// · the CELL is a STONE box 180×110 at x 130 (130…310), y 300…410, with five 6-wide
//   ink bars at x 154 · 186 · 218 · 250 · 282 and a STONE occupant 26×54 at x 142.
// · the EYE is a 34×18 lens with a 10 pupil, centred on x 220 at y 274. It belongs
//   to no board because the view it stands for refuses the question both boards
//   are answering.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 78; his widest span at the walked mark
//   is x ≈ 53…103, twenty-seven units clear of the cell at 130.
//
// Ink runs y 242 (the boards) … y 500 (ground). BAND 238…512 = 274 — a 103-unit
// figure at 37.6%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BOARD_X = [134, 256];
const BOARD_Y = 242;
const BOARD_W = 100;
const BOARD_H = 22;
const BOARD_CAP = ['THE PAST ACT', 'THE FUTURE GOOD'];
const STEM_X = [182, 304];
const STEM_T = 264;
const STEM_B = 300;

const CELL_X = 130;
const CELL_Y = 300;
const CELL_W = 180;
const CELL_H = 110;
const BAR_X = [154, 186, 218, 250, 282];

const EYE_MID = 220;
const EYE_Y = 274;
const EYE_W = 34;
const EYE_H = 18;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['IT PUNISHES THE GUILTY', 'GOOD OUTCOMES CAN JUSTIFY IT', 'IT COSTS TOO MUCH'];
const PLATE_ID = ['guilty', 'outcomes', 'costs'];
/** If only results count, a useful frame-up comes out justified. */
const OUTCOMES = 1;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const CELL = BEATS.map((b) => (b.cell ? 1 : 0));
const PAST = BEATS.map((b) => b.past ?? 0);
const FUTURE = BEATS.map((b) => b.future ?? 0);
const WATCH = BEATS.map((b) => b.watch ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE POLL'S OWN ORDER, never the shuffled rows (X3): 0 the past act · 1 no
// future good · 2 the cell as a machine. Each row is read off that option's own
// words, so the boards light for the reason the reader is standing on.
const PAST_AT = [1, 0, 0];
const FUTURE_AT = [0, 1, 0];
const WATCH_AT = [0, 0, 1];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political28'));

export default function Political28Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(6);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const u = pickPos.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      cell: carry(cv, 1, n, CELL[p], CELL[n], tr),
      past: carry(cv, 2, n, PAST[p], reacting ? pickAt(PAST_AT, u) : PAST[n], tr),
      future: carry(cv, 3, n, FUTURE[p], reacting ? pickAt(FUTURE_AT, u) : FUTURE[n], tr),
      watch: carry(cv, 4, n, WATCH[p], reacting ? pickAt(WATCH_AT, u) : WATCH[n], tr),
      plates: carry(cv, 5, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const cellStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cell }));
  const pastStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.past) }));
  const futureStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.future) }));
  const watchStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.watch) }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, cellStyle]} pointerEvents="none">
        <View style={styles.cell} />
        <View style={styles.inmate} />
        {BAR_X.map((bx) => <View key={bx} style={[styles.bar, { left: bx }]} />)}
        {BOARD_X.map((bx, k) => (
          <View key={bx}>
            <View style={[styles.board, { left: bx }]} />
            <View style={[styles.stem, { left: STEM_X[k] }]} />
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.lamp, { left: BOARD_X[0] }, pastStyle]} pointerEvents="none" />
      <Animated.View style={[styles.lamp, { left: BOARD_X[1] }, futureStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, cellStyle]} pointerEvents="none">
        {BOARD_X.map((bx, k) => (
          <Text key={bx} style={[styles.boardText, { left: bx }]}>{BOARD_CAP[k]}</Text>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, watchStyle]} pointerEvents="none">
        <View style={styles.lens} />
        <View style={styles.pupil} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === OUTCOMES}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === OUTCOMES}
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

  cell: {
    position: 'absolute', left: CELL_X, top: CELL_Y, width: CELL_W, height: CELL_H,
    backgroundColor: STONE, borderWidth: 2.5, borderColor: INK,
  },
  inmate: { position: 'absolute', left: 142, top: CELL_Y + 40, width: 26, height: 54, backgroundColor: RULE },
  bar: { position: 'absolute', top: CELL_Y, width: 6, height: CELL_H, backgroundColor: INK },

  board: {
    position: 'absolute', top: BOARD_Y, width: BOARD_W, height: BOARD_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  // A REASON IS LEANED ON OR IT IS NOT. The fill rides the raw driver, so the
  // board is struck or plain rather than a smear (D35).
  lamp: { position: 'absolute', top: BOARD_Y + 2, width: BOARD_W - 4, height: BOARD_H - 4, backgroundColor: RULE },
  boardText: {
    position: 'absolute', top: BOARD_Y + 7, width: BOARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  stem: { position: 'absolute', top: STEM_T, width: 4, height: STEM_B - STEM_T, backgroundColor: INK },

  lens: {
    position: 'absolute', left: EYE_MID - EYE_W / 2, top: EYE_Y, width: EYE_W, height: EYE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 9, backgroundColor: PAPER,
  },
  pupil: {
    position: 'absolute', left: EYE_MID - 5, top: EYE_Y + 4, width: 10, height: 10,
    borderRadius: 5, backgroundColor: INK,
  },

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

export function Political28Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political28Scene} band={[238, 512]} camera={CAM} />;
}
