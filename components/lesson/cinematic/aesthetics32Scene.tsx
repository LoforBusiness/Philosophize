import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, lerp, mixStance, pose, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics32Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THREE CHARTS WITH THE SAME AREA UNDER THEM, and the answer targets are the charts —
// the largest target in the app, because here the thing being chosen IS the argument
// (E33). A correct pick inverts the whole chart: the box fills INK and its bars turn
// PAPER, so the ordinary answer state survives at this size (H61).
//
// · each chart is 220 × 68 at x 140, tops y 280 / 356 / 432. The bottom one's bottom
//   edge IS the ground line at 500, so the stack stands on the floor.
// · inside a chart: the kicker at rel y 4…16, then nine bars 17 wide on a 23 pitch
//   from rel x 10, growing UP off rel y 62. The tallest is 44, which stops two clear
//   of the kicker.
// · the first two charts are THE SAME NINE NUMBERS in opposite orders and the third
//   is nine copies of their mean, so all three come to 216 — and the mean line sits
//   at rel y 38 in every one of them, which is the proof made visible (A1).
// · the badge sits above the stack at y 258…274, the highest ink here.
// · the figure is at x 60 facing right; its widest ink is a fist at x 93, forty-seven
//   clear of the charts. Its crown is y 397, level with the middle chart.

const ROW_L = 140;
const ROW_W = 220;
const ROW_H = 68;
const ROW_T = [280, 356, 432];

const BAR_W = 17;
const BAR_PITCH = 23;
const BAR_L = 10;
const BAR_FOOT = 6;                       // bars sit this far off the chart's bottom
const MEAN = 24;

const RISING = [4, 9, 14, 19, 24, 29, 34, 39, 44];
const CHARTS = [
  { id: 'rising', kicker: 'GETTING BETTER', bars: RISING, correct: true },
  { id: 'falling', kicker: 'GETTING WORSE', bars: [...RISING].reverse(), correct: false },
  { id: 'flat', kicker: 'THE SAME ALL ALONG', bars: RISING.map(() => MEAN), correct: false },
];

const FIG_X = 60;

const G = BEATS.map((b) => b.g ?? 0);
const ROWS = BEATS.map((b) => b.rows ?? 0);
const MEANS = BEATS.map((b) => b.mean ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics32'));

export default function Aesthetics32Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    // A chart takes 1.0s to rise, so its nine bars read as a sequence.
    const grow = ease01(bt.value / 1.0);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      rows: carry(cv, 0, n, ROWS[p], ROWS[n], grow),
      mean: carry(cv, 1, n, MEANS[p], MEANS[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.badge} numberOfLines={1}>ALL THREE ADD UP TO THE SAME</Text>

      {CHARTS.map((c, k) => (
        <Chart
          key={c.id}
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

/** One life. Rises bar by bar, then holds (C20c). */
function Chart({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { rows: number; mean: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const c = CHARTS[k];
  const on = answered && c.correct;

  const wrap = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.rows - k);
    return { opacity: a, transform: [{ translateY: (1 - a) * 10 }] };
  });
  const meanLine = useAnimatedStyle(() => ({
    opacity: SCENE.value.mean,
    transform: [{ scaleX: SCENE.value.mean }],
  }));

  return (
    <Animated.View style={[styles.row, { top: ROW_T[k] }, wrap]}>
      <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
        <View
          style={[
            styles.rowInner,
            on && styles.pickRight,
            answered && picked === c.id && !c.correct && styles.pickWrong,
          ]}
        >
          <Text style={[styles.kicker, on && styles.onInk]} numberOfLines={1}>{c.kicker}</Text>
          {c.bars.map((h, j) => (
            <Bar key={j} k={k} j={j} h={h} onInk={on} SCENE={SCENE} />
          ))}
          <Animated.View style={[styles.mean, on && styles.meanOnInk, meanLine]} />
        </View>
      </Target>
    </Animated.View>
  );
}

/** One year. */
function Bar({
  k, j, h, onInk, SCENE,
}: {
  k: number; j: number; h: number; onInk: boolean;
  SCENE: { value: { rows: number } };
}) {
  const st = useAnimatedStyle(() => ({
    transform: [{ scaleY: clamp01(clamp01(SCENE.value.rows - k) * 9 - j) }],
  }));
  return (
    <Animated.View
      style={[styles.bar, { left: BAR_L + j * BAR_PITCH, height: h }, onInk && styles.barOnInk, st]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  badge: {
    position: 'absolute', left: 20, top: 258, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  row: { position: 'absolute', left: ROW_L, width: ROW_W, height: ROW_H },
  rowInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
  },
  kicker: {
    position: 'absolute', left: 10, top: 4,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },
  bar: {
    position: 'absolute', bottom: BAR_FOOT, width: BAR_W, backgroundColor: INK,
    transformOrigin: '50% 100%',
  },
  barOnInk: { backgroundColor: PAPER },
  mean: {
    position: 'absolute', left: 8, right: 8, bottom: BAR_FOOT + MEAN, height: 1.5,
    backgroundColor: SOFT, transformOrigin: '0% 50%',
  },
  meanOnInk: { backgroundColor: RULE },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the badge (258) to the ground line (500). Band 252…512 = 260 (H59).
export function Aesthetics32Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics32Scene} band={[252, 512]} camera={CAM} />;
}
