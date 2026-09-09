import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology29Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// NINE TILES THAT NEVER MOVE, AND THE WIRES BETWEEN THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the BOARD is a filled STONE slab 236×136 at x 132 (132…368), y 262…398.
// · NINE TILES of 22×22 sit on it in three rows of three, at x 156 · 232 · 308
//   and y 286 · 320 · 354, each a PAPER square with a 1.5 ink edge. Nothing about
//   them ever changes, which is the argument: another tile would not help.
// · TWELVE WIRES of 2 thick join the neighbours — six horizontal runs of 54 and
//   six vertical runs of 12 — and they arrive in order as `wired` climbs, so the
//   heap becomes a structure while the contents stand still.
// · the NEW CASE is a 78×26 PAPER plate at x 264, y 234…260, with a 3-wide stem
//   down to the board. It fills in as `solved` climbs.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 26 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, twenty-seven units clear of the board at 132.
//
// Ink runs y 234 (the new case) … y 500 (ground). BAND 230…512 = 282 — a 103-unit
// figure at 36.5%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BOARD_X = 132;
const BOARD_Y = 262;
const BOARD_W = 236;
const BOARD_H = 136;

const COL = [156, 232, 308];
const ROW = [286, 320, 354];
const TILE = 22;

const FRESH_X = 264;
const FRESH_Y = 234;
const FRESH_W = 78;
const FRESH_H = 26;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['WHICH FACTS ARE TRUE', 'WHETHER THE PIECES CONNECT', 'HOW LONG SHE STUDIED'];
const PLATE_ID = ['true', 'connect', 'hours'];
/** A score measures recall; understanding shows up where recall runs out. */
const CONNECT = 1;

const FIG_X = 26;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const TILES = BEATS.map((b) => (b.tiles ? 1 : 0));
const WIRED = BEATS.map((b) => b.wired ?? 0);
const FRESH = BEATS.map((b) => (b.fresh ? 1 : 0));
const SOLVED = BEATS.map((b) => b.solved ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE POLL'S OWN ORDER, never the shuffled rows (X3): 0 more facts · 1 the links ·
// 2 nothing at all. Each row is read off that option's own words, so the wires
// arrive only where the reader says the missing thing is a connection.
const WIRED_AT = [0, 1, 0];
const SOLVED_AT = [0, 1, 0];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology29'));

export default function Epistemology29Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      tiles: carry(cv, 1, n, TILES[p], TILES[n], tr),
      wired: carry(cv, 2, n, WIRED[p], reacting ? pickAt(WIRED_AT, u) : WIRED[n], tr),
      fresh: carry(cv, 3, n, FRESH[p], FRESH[n], tr),
      solved: carry(cv, 4, n, SOLVED[p], reacting ? pickAt(SOLVED_AT, u) : SOLVED[n], tr),
      plates: carry(cv, 5, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const tilesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tiles }));
  const freshStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.fresh }));
  const solvedStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.solved) }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));


  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, freshStyle]} pointerEvents="none">
        <View style={styles.freshStem} />
        <View style={styles.fresh} />
        <Animated.View style={[styles.freshFill, solvedStyle]} />
        <Text style={styles.freshText}>A NEW CASE</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, tilesStyle]} pointerEvents="none">
        <View style={styles.board} />
        {ROW.map((ry, r) => COL.map((cx, c) => (
          <View key={`${r}-${c}`} style={[styles.tile, { left: cx, top: ry }]} />
        )))}
      </Animated.View>

      {ROW.map((ry, r) => [0, 1].map((c) => (
        <Wire key={`a${r}-${c}`} S={SCENE} k={r * 2 + c} kind="across" left={COL[c] + TILE} top={ry + TILE / 2 - 1} />
      )))}
      {COL.map((cx, c) => [0, 1].map((r) => (
        <Wire key={`d${c}-${r}`} S={SCENE} k={6 + c * 2 + r} kind="down" left={cx + TILE / 2 - 1} top={ROW[r] + TILE} />
      )))}

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === CONNECT}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === CONNECT}
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

// A WIRE ARRIVES WHEN THE VALUE REACHES ITS SHARE, so the structure builds
// rather than switching on. Its own component, because twelve of them is twelve
// hooks and a hook inside a loop is a hook whose order can change.
function Wire({ S, k, kind, left, top }: { S: { value: { wired: number } }; k: number; kind: 'across' | 'down'; left: number; top: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.wired * 12 - k) }));
  return <Animated.View style={[kind === 'across' ? styles.across : styles.down, { left, top }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  board: {
    position: 'absolute', left: BOARD_X, top: BOARD_Y, width: BOARD_W, height: BOARD_H,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: RULE,
  },
  tile: {
    position: 'absolute', width: TILE, height: TILE,
    backgroundColor: PAPER, borderWidth: 1.5, borderColor: INK,
  },
  across: { position: 'absolute', width: 54, height: 2, backgroundColor: INK },
  down: { position: 'absolute', width: 2, height: 12, backgroundColor: INK },

  freshStem: { position: 'absolute', left: FRESH_X + FRESH_W / 2 - 1.5, top: FRESH_Y + FRESH_H, width: 3, height: BOARD_Y - FRESH_Y - FRESH_H, backgroundColor: INK },
  fresh: {
    position: 'absolute', left: FRESH_X, top: FRESH_Y, width: FRESH_W, height: FRESH_H,
    backgroundColor: PAPER, borderWidth: 2, borderColor: INK,
  },
  freshFill: { position: 'absolute', left: FRESH_X + 2, top: FRESH_Y + 2, width: FRESH_W - 4, height: FRESH_H - 4, backgroundColor: STONE },
  freshText: {
    position: 'absolute', left: FRESH_X, top: FRESH_Y + 9, width: FRESH_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
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

export function Epistemology29Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology29Scene} band={[230, 512]} camera={CAM} />;
}
