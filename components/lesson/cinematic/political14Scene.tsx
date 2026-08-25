import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political14Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE WILT CHAMBERLAIN CASE AS THREE STAGES, and the answer targets are the stages —
// the reader answers by pointing at a MOMENT in a process rather than at a claim
// (E33). Laying the story out as three rows is what makes Nozick's move visible: you
// cannot object to a start you chose or to a result that is only where the trades
// led, so the middle row is the only thing left to reach into (H64).
//
// · three rows 288 × 44 at x 96, tops y 300 / 356 / 412. Inside each: its name in the
//   left 74, then the art from rel x 82 to rel x 280.
// · THE START is fourteen equal bars 8 wide on a 14 pitch. THE RESULT is the same
//   fourteen with thirteen cut to a stub and the last one tall — the same bars, so
//   the row reads as the first one after the trades rather than as a new chart (A1).
// · THE TRADES is six coins drifting right on a 40-unit wrap, running off the
//   monotonic clock so tapping through a beat never restarts them (H67).
// · a correct pick fills its row INK and turns its bars PAPER, which is how a target
//   this big keeps the standard answer state (H61).
// · the figure is at x 46 facing right; measured across its poses it reaches x 85,
//   eleven clear of the rows.

const ROW_L = 96;
const ROW_W = 288;
const ROW_H = 44;
const ROW_T = [300, 356, 412];

const ART_L = 82;
const ART_W = 198;
const BAR_N = 14;
const BAR_W = 8;
const BAR_PITCH = 14;
const COIN_N = 6;
const COIN_WRAP = 40;

const FIG_X = 46;

const STAGES = [
  { id: 'start', label: 'THE START', correct: false },
  { id: 'trades', label: 'THE TRADES', correct: true },
  { id: 'result', label: 'THE RESULT', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const ROWS = BEATS.map((b) => b.rows ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political14'));

export default function Political14Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(1);
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 1.0);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      rows: carry(cv, 0, n, ROWS[p], ROWS[n], grow),
      coins: (t * 26) % COIN_WRAP,
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {STAGES.map((s, k) => (
        <Stage
          key={s.id}
          k={k}
          SCENE={SCENE}
          live={live}
          answered={answered}
          picked={picked}
          onPick={onPick}
        />
      ))}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One stage of the story. */
function Stage({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { rows: number; coins: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const s = STAGES[k];
  const on = answered && s.correct;

  const wrap = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.rows - k);
    return { opacity: a, transform: [{ translateY: (1 - a) * 8 }] };
  });

  return (
    <Animated.View style={[styles.row, { top: ROW_T[k] }, wrap]}>
      <Target id={s.id} correct={s.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View
          style={[
            styles.rowInner,
            on && styles.pickRight,
            answered && picked === s.id && !s.correct && styles.pickWrong,
          ]}
        >
          <Text style={[styles.name, on && styles.onInk]} numberOfLines={1}>{s.label}</Text>

          {k !== 1
            ? Array.from({ length: BAR_N }, (_, j) => {
                // THE RESULT is the START's own bars after the trades: thirteen cut
                // to a stub, the last one tall.
                const h = k === 0 ? 20 : j === BAR_N - 1 ? 26 : 5;
                return (
                  <View
                    key={j}
                    style={[
                      styles.bar,
                      on && styles.barOnInk,
                      { left: ART_L + j * BAR_PITCH, height: h },
                    ]}
                    pointerEvents="none"
                  />
                );
              })
            : Array.from({ length: COIN_N }, (_, j) => (
                <Coin key={j} j={j} onInk={on} SCENE={SCENE} />
              ))}
        </View>
      </Target>
    </Animated.View>
  );
}

/** One dollar, on its way across. */
function Coin({ j, onInk, SCENE }: { j: number; onInk: boolean; SCENE: { value: { coins: number } } }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: (j * COIN_WRAP / COIN_N + SCENE.value.coins) % COIN_WRAP }],
  }));
  return (
    <Animated.View style={[styles.coinSlot, { left: ART_L + j * 34 }, st]} pointerEvents="none">
      <View style={[styles.coin, onInk && styles.coinOnInk]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  row: { position: 'absolute', left: ROW_L, width: ROW_W, height: ROW_H },
  rowInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  name: {
    position: 'absolute', left: 10, top: 17, width: 70,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  bar: { position: 'absolute', bottom: 8, width: BAR_W, backgroundColor: INK },
  barOnInk: { backgroundColor: PAPER },
  coinSlot: { position: 'absolute', top: 17, width: 8, height: 8 },
  coin: { width: 8, height: 8, borderRadius: 4, backgroundColor: INK },
  coinOnInk: { backgroundColor: PAPER },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the first row (300) to the ground line (500). Band 294…512 = 218 (H59).
export function Political14Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political14Scene} band={[294, 512]} camera={CAM} />;
}
