import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics34Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// A CROWD THAT GROWS WHILE EVERY LIFE IN IT SHRINKS.
//
// Forty tallies in a five-row grid. Each is a plain bar whose HEIGHT is that life's
// quality, and the count that is visible rises with the drag while the heights fall.
// Forty Views is well inside the §17 budget and it is the whole picture: the reader
// sees more and smaller at the same instant, which is the trade Parfit is making.
//
// · the grid is x 150…342, five rows of eight on a 24 pitch across and 40 down,
//   rows based at y 282 / 322 / 362 / 402 / 442 — so the tallest tally (34) in the
//   top row reaches y 248.
// · the total-good bar runs along the bottom at y 484…492, x 150…342, and only
//   ever grows to the right, so it cannot leave the grid's span.
// · the average line, when drawn, crosses the grid at y 276.
// · the caption sits at y 350…364.
// · the figure stands at x 46 and reaches x 79, seventy-one clear of the grid.
//
// Ink runs from the caption (232) to the total bar (492). Band 226…512 = 286 (H59).

const GRID_L = 150;
const COLS = 8;
const ROWS = 5;
const PITCH_X = 24;
const PITCH_Y = 40;
const ROW_BASE = 282;
const TALLY_W = 9;
const TALL_MAX = 34;
const TALL_MIN = 4;
const BAR_T = 484;
const BAR_L = 150;
const BAR_W = 192;
const AVG_Y = 276;
const CAP_T = 232;
const FIG_X = 46;

const POP = BEATS.map((b) => b.pop ?? 0);
const AVG = BEATS.map((b) => b.avg ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics34'));

export default function Ethics34Scene({ clock, bt, bi, i, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const live = (BEATS[i].live ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const grow = ease01(bt.value / 1.1);
    const u = live ? dragPos.value : carry(cv, 0, n, POP[p], POP[n], grow);
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      pop: u,
      // TOTAL = count × quality, and it has to RISE across the whole drag or the
      // lesson's claim is false. 10→40 lives against quality 1→0.30 gives 10→12,
      // which climbs the whole way and climbs slowly, exactly as it should.
      total: ((10 + u * 30) * (1 - u * 0.70)) / 12,
      avg: carry(cv, 1, n, AVG[p], AVG[n], tr),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const barStyle = useAnimatedStyle(() => ({ width: BAR_W * SCENE.value.total }));
  const avgStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.avg }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={1}>EACH BAR IS ONE LIFE</Text>

      {Array.from({ length: COLS * ROWS }, (_, k) => <Tally key={k} k={k} SCENE={SCENE} />)}

      <Animated.View style={[styles.avg, avgStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.avgLabel, avgStyle]} numberOfLines={1}>AVERAGE</Animated.Text>

      <View style={styles.barTrack} pointerEvents="none" />
      <Animated.View style={[styles.bar, barStyle]} pointerEvents="none" />
      <Text style={styles.barLabel} numberOfLines={1}>TOTAL GOOD</Text>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One life. Own component — a hook cannot be called inside `.map()`. */
function Tally({ k, SCENE }: { k: number; SCENE: { value: { pop: number } } }) {
  const col = k % COLS;
  const row = Math.floor(k / COLS);
  const base = ROW_BASE + row * PITCH_Y;
  const style = useAnimatedStyle(() => {
    const u = SCENE.value.pop;
    // Ten lives at the start, forty at the end. A tally fades in as the count
    // reaches it, so the crowd fills rather than flickering.
    const alive = 10 + u * 30;
    const t = alive - k;
    const a = t <= 0 ? 0 : t >= 1 ? 1 : t;
    const h = TALL_MAX - (TALL_MAX - TALL_MIN) * u;
    return { opacity: a, height: h, top: base - h, transform: [{ scaleX: 0.5 + 0.5 * a }] };
  });
  return (
    <Animated.View
      style={[styles.tally, { left: GRID_L + col * PITCH_X }, style]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: GRID_L - 8, top: CAP_T, width: 220,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  tally: { position: 'absolute', width: TALLY_W, backgroundColor: INK, borderRadius: 1.5 },

  avg: {
    position: 'absolute', left: GRID_L - 6, top: AVG_Y, width: BAR_W + 12, height: 0,
    borderTopWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },
  avgLabel: {
    position: 'absolute', left: GRID_L + BAR_W - 40, top: AVG_Y - 11, width: 60,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT,
    textAlign: 'right', includeFontPadding: false,
  },

  barTrack: { position: 'absolute', left: BAR_L, top: BAR_T, width: BAR_W, height: 8, borderRadius: 4, backgroundColor: RULE },
  bar: { position: 'absolute', left: BAR_L, top: BAR_T, height: 8, borderRadius: 4, backgroundColor: INK },
  barLabel: {
    position: 'absolute', left: BAR_L, top: BAR_T - 12, width: BAR_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT,
    includeFontPadding: false,
  },
});

export function Ethics34Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics34Scene} band={[226, 512]} camera={CAM} />;
}
