import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political17Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A WELL AND A ROTA, AND ONE ROW WITH NOBODY ON IT (H64). The rota is where the
// argument lives: the well is what everybody agrees about.
//
// · the WELL is x 120…230, y 384…470 — a 110 × 86 drum on the ground, with a
//   headstock post at x 170…176 running up to y 344 and a crossbeam x 132…218 at
//   y 344…350. His CUP stands on the rim at x 196…222, y 362…384.
// · the ROTA is x 250…390, y 306…458 — five rows 28 tall on a 30 pitch from
//   y 310, each a name band with a tick box on its right. The fifth row is blank.
// · the three BOARDS are 116 × 44 at x 20 / 142 / 264, y 246…290, on stage only
//   for the graded beat.
// · the label sits at y 228…244, the highest ink; the lowest is the well at 470.
// · the figure stands at x = 52 facing right. Widest ink is a fist at x ≈ 85,
//   thirty-five units clear of the well, and his crown is y 397 — level with the
//   drum and well left of it (D23).
//
// Band 222…512 = 290, holding one figure at 36% of the frame (check:scale).

const FIG_X = 52;

const LABEL_T = 228;
const BOARD_T = 246;
const BOARD_H = 44;
const BOARD_W = 116;
const BOARD_X = [20, 142, 264];

const WELL_L = 120;
const WELL_W = 110;
const WELL_T = 384;

const ROTA_L = 250;
const ROTA_W = 140;
const ROW_H = 28;
const ROW_PITCH = 30;
const ROTA_T = 310;
const NAMES = ['AGDA', 'BÖRJE', 'CILLA', 'DAG', '—'];

const BOARDS = [
  { id: 'signature', text: 'A SIGNATURE', correct: false },
  { id: 'water', text: 'THE WATER HE DRANK', correct: true },
  { id: 'vote', text: 'THE VILLAGE VOTE', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const WELL = BEATS.map((b) => b.well ?? 0);
const TURNS = BEATS.map((b) => b.turns ?? 0);
const BLANK = BEATS.map((b) => b.blank ?? 0);
const TAKEN = BEATS.map((b) => b.taken ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political17'));

export default function Political17Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const slow = ease01(bt.value / 1.4);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      well: carry(cv, 0, n, WELL[p], WELL[n], grow),
      turns: carry(cv, 1, n, TURNS[p], TURNS[n], slow),
      blank: carry(cv, 2, n, BLANK[p], BLANK[n], grow),
      // R7b — the arm fills his cup. The far setting says taking the benefit is what
      // binds you, and the cup fills as the reader reaches it: the duty and the
      // drinking arrive together, with no signature anywhere.
      taken: carry(cv, 3, n, TAKEN[p], reacting ? dragPos.value : TAKEN[n], slow),
      boards: carry(cv, 4, n, PICKV[p], PICKV[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const well = useAnimatedStyle(() => ({ opacity: SCENE.value.well }));
  const cup = useAnimatedStyle(() => ({ opacity: SCENE.value.taken }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.label} numberOfLines={1}>THE VILLAGE WELL, AND WHO HAULS</Text>

      {BOARDS.map((b, k) => (
        <Board key={b.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      {/* ── THE WELL ─────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.wellWrap, well]} pointerEvents="none">
        <View style={styles.post} />
        <View style={styles.beam} />
        <View style={styles.drum} />
        <View style={styles.rim} />
      </Animated.View>
      <Animated.View style={[styles.cup, cup]} pointerEvents="none" />

      {/* ── THE ROTA ─────────────────────────────────────────────────────── */}
      {NAMES.map((nm, k) => <Row key={nm} k={k} SCENE={SCENE} />)}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One row of the rota. The last has no name and no tick. */
function Row({ k, SCENE }: { k: number; SCENE: { value: { turns: number; blank: number } } }) {
  const last = k === NAMES.length - 1;
  const st = useAnimatedStyle(() => ({
    opacity: last ? SCENE.value.blank : clamp01(SCENE.value.turns - k + 1),
  }));
  const tick = useAnimatedStyle(() => ({ opacity: last ? 0 : clamp01(SCENE.value.turns - k) }));
  return (
    <Animated.View style={[styles.row, { top: ROTA_T + k * ROW_PITCH }, st]} pointerEvents="none">
      <Text style={[styles.rowName, last && styles.rowNameBlank]} numberOfLines={1}>{NAMES[k]}</Text>
      <View style={styles.tickBox}>
        <Animated.View style={[styles.tick, tick]} />
      </View>
    </Animated.View>
  );
}

/** One answer board — a Q1 target. */
function Board({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { boards: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const b = BOARDS[k];
  const on = answered && b.correct;
  const st = useAnimatedStyle(() => {
    const a = SCENE.value.boards;
    return { opacity: a, transform: [{ translateY: (1 - a) * -10 }] };
  });
  return (
    <Animated.View style={[styles.board, { left: BOARD_X[k] }, st]}>
      <Target id={b.id} correct={b.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View style={[
          styles.boardInner,
          on && styles.pickRight,
          answered && picked === b.id && !b.correct && styles.pickWrong,
        ]}>
          <Text style={[styles.boardText, on && styles.onInk]} numberOfLines={2}>{b.text}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  label: {
    position: 'absolute', left: 20, top: LABEL_T, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  board: { position: 'absolute', top: BOARD_T, width: BOARD_W, height: BOARD_H },
  boardInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  wellWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  post: { position: 'absolute', left: 170, top: 344, width: 6, height: 46, backgroundColor: INK },
  beam: { position: 'absolute', left: 132, top: 344, width: 86, height: 6, backgroundColor: INK, borderRadius: 3 },
  drum: {
    position: 'absolute', left: WELL_L, top: WELL_T, width: WELL_W, height: 470 - WELL_T,
    borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
  },
  rim: {
    position: 'absolute', left: WELL_L - 6, top: WELL_T - 4, width: WELL_W + 12, height: 10,
    borderRadius: 5, backgroundColor: SOFT,
  },
  cup: {
    position: 'absolute', left: 196, top: 362, width: 26, height: 22,
    borderWidth: 2, borderColor: INK, borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    backgroundColor: INK,
  },

  row: { position: 'absolute', left: ROTA_L, width: ROTA_W, height: ROW_H, flexDirection: 'row', alignItems: 'center' },
  rowName: {
    flex: 1, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  rowNameBlank: { color: RULE },
  tickBox: {
    width: 22, height: 22, borderWidth: 2, borderColor: INK, borderRadius: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  tick: { width: 12, height: 12, borderRadius: 2, backgroundColor: INK },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the label (228) to the well's drum (470). Band 222…512 = 290.
export function Political17Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political17Scene} band={[222, 512]} camera={CAM} />;
}
