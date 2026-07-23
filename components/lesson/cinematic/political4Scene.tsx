import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './political4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A figure between two walls of interference. Negative liberty slides the walls
// outward (freedom from); the harm-principle boundary and a second person mark the
// one line power may cross; positive liberty stands the figure tall. Walls flank the
// figure and only ever move away from it, so they never cover the body.

const FIG_X = 196;
const WALL_L = 150;
const WALL_R = 242;
const HARM_X = 332;

const P_CODE = BEATS.map((b) => b.p ?? 0);
const WALLS = BEATS.map((b) => b.walls ?? 0);
const HARM = BEATS.map((b) => b.harm ?? 0);

export default function Political4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const isSummary = !!BEATS[n].summary;

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      cam: { s: isSummary ? 1 : 0.95, cx: 202, cy: 406 },
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      walls: L(WALLS[p], WALLS[n]),
      harm: L(HARM[p], HARM[n]),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });
  // walls slide OUTWARD (away from the figure) and fade as liberty grows
  const wallLStyle = useAnimatedStyle(() => ({ opacity: 0.25 + 0.75 * SCENE.value.walls, transform: [{ translateX: -(1 - SCENE.value.walls) * 44 }] }));
  const wallRStyle = useAnimatedStyle(() => ({ opacity: 0.25 + 0.75 * SCENE.value.walls, transform: [{ translateX: (1 - SCENE.value.walls) * 44 }] }));
  const harmStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.harm }));

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />

        {/* the walls of interference */}
        <Animated.View style={[styles.wall, { left: WALL_L }, wallLStyle]} />
        <Animated.View style={[styles.wall, { left: WALL_R }, wallRStyle]} />

        {/* the harm-principle boundary + the other person it protects */}
        <Animated.View style={[styles.boundary, harmStyle]} />
        <Animated.View style={[styles.other, { left: HARM_X + 12 }, harmStyle]}>
          <View style={styles.otherHead} />
          <View style={styles.otherBody} />
        </Animated.View>

        <Stickman D={DF} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: { position: 'absolute', top: GROUND - 128, width: 8, height: 128, backgroundColor: INK, borderRadius: 3 },
  boundary: { position: 'absolute', left: HARM_X, top: GROUND - 120, width: 2, height: 120, backgroundColor: SOFT, borderRadius: 2, opacity: 0.6 },
  other: { position: 'absolute', top: GROUND - 30, width: 8, alignItems: 'center' },
  otherHead: { width: 10, height: 10, borderRadius: 5, backgroundColor: SOFT },
  otherBody: { width: 5, height: 20, backgroundColor: SOFT, marginTop: -1, borderRadius: 2 },
});

export function Political4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political4Scene} />;
}
