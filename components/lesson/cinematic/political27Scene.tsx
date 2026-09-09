import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political27Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO GATES ON ONE ROAD, AND WHICHEVER OF THEM IS STANDING OPEN.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO BOARDS of 96×22 in STONE at x 166 and x 276, y 244…266, naming the gate
//   under each in ink. They are struck plates rather than floating captions, so
//   the top of the stage carries mass instead of two loose words.
// · TWO GATES, each a pair of 7×110 ink posts and a 56×14 lintel. Gate one: posts
//   at x 186 and 235, lintel at x 186; gate two: posts at x 296 and 345, lintel
//   at x 296. Lintels run y 288…302, posts y 302…412. A gate is OPEN when its
//   lintel is filled — the only thing in the picture that ever moves.
// · the ROAD is a filled STONE band 250×48 at x 136 (136…386), y 368…416, and
//   both gates stand on it. It never changes: the tests do not move, only whether
//   a particular war gets through them.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 450, each holding
//   two lines.
// · the figure stands at x 26 and walks to 82; his widest span at the walked mark
//   is x ≈ 57…107, seventeen units clear of the nearest plate at 124.
//
// Ink runs y 244 (the boards) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BOARD_X = [166, 276];
const BOARD_Y = 244;
const BOARD_W = 96;
const BOARD_H = 22;
const BOARD_CAP = ['GOING TO WAR', 'FIGHTING IT'];

const LINT_X = [186, 296];
const LINT_Y = 288;
const LINT_W = 56;
const LINT_H = 14;
const POST_X = [186, 235, 296, 345];
const POST_Y = 302;
const POST_W = 7;
const POST_H = 110;

const ROAD_X = 136;
const ROAD_Y = 368;
const ROAD_W = 250;
const ROAD_H = 48;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 450;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['ONE VERDICT ON THE WAR', 'TWO SEPARATE VERDICTS', 'A SCORE OUT OF TWO'];
const PLATE_ID = ['one', 'two', 'score'];
/** Ad bellum and in bello are judged apart, and that is the whole theory. */
const SEPARATE = 1;

const FIG_X = 26;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const ROAD = BEATS.map((b) => (b.road ? 1 : 0));
const ENTRY = BEATS.map((b) => b.entry ?? 0);
const CONDUCT = BEATS.map((b) => b.conduct ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN ORDER, never the shuffled rows (X3): 0 passes both · 1 passes
// the first · 2 fails both. Each row is read off that bin's own words, so the
// gates open and shut as the chip travels between the verdicts.
const ENTRY_AT = [1, 1, 0];
const CONDUCT_AT = [1, 0, 0];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political27'));

export default function Political27Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
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
      road: carry(cv, 1, n, ROAD[p], ROAD[n], tr),
      entry: carry(cv, 2, n, ENTRY[p], reacting ? pickAt(ENTRY_AT, u) : ENTRY[n], tr),
      conduct: carry(cv, 3, n, CONDUCT[p], reacting ? pickAt(CONDUCT_AT, u) : CONDUCT[n], tr),
      plates: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const roadStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.road }));
  const entryStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.entry }));
  const conductStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.conduct }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, roadStyle]} pointerEvents="none">
        <View style={styles.road} />
        {POST_X.map((px) => <View key={px} style={[styles.post, { left: px }]} />)}
        {LINT_X.map((lx) => <View key={lx} style={[styles.lintel, { left: lx }]} />)}
        {BOARD_X.map((bx, k) => (
          <View key={bx}>
            <View style={[styles.board, { left: bx }]} />
            <Text style={[styles.boardText, { left: bx }]}>{BOARD_CAP[k]}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.fill, { left: LINT_X[0] }, entryStyle]} pointerEvents="none" />
      <Animated.View style={[styles.fill, { left: LINT_X[1] }, conductStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === SEPARATE}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === SEPARATE}
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

  road: {
    position: 'absolute', left: ROAD_X, top: ROAD_Y, width: ROAD_W, height: ROAD_H,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: RULE,
  },
  post: { position: 'absolute', top: POST_Y, width: POST_W, height: POST_H, backgroundColor: INK },
  lintel: {
    position: 'absolute', top: LINT_Y, width: LINT_W, height: LINT_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  // A GATE IS OPEN WHEN ITS LINTEL IS STRUCK, and the fill rides the raw driver
  // so it is either there or absent rather than a smear (D35).
  fill: { position: 'absolute', top: LINT_Y, width: LINT_W, height: LINT_H, backgroundColor: INK },

  board: {
    position: 'absolute', top: BOARD_Y, width: BOARD_W, height: BOARD_H,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: INK,
  },
  boardText: {
    position: 'absolute', top: BOARD_Y + 7, width: BOARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
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

export function Political27Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political27Scene} band={[240, 512]} camera={CAM} />;
}
