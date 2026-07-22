import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './epistemologyScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand,
  type Bundle, type Stance,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A seeker at the door of KNOWLEDGE, held by three locks: true, belief, reasons.

const SEEKER_X = 264;
const DOOR_X = 150;
const DOOR_TOP = 338;
const DOOR_W = 98;
const DOOR_H = 156;
const LOCK_X = DOOR_X - 22;
const LOCK_Y = [376, 416, 456];
const LOCK_LABEL = ['TRUE', 'BELIEF', 'REASONS'];

const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const LOCKS = BEATS.map((b) => b.locks ?? [0, 0, 0]);
const Q1 = BEATS.map((b) => (b.qkey === 'q1' ? 1 : 0));
const Q2 = BEATS.map((b) => (b.qkey === 'q2' ? 1 : 0));

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({ s: b.summary ? 1 : 1.13, cx: 196, cy: 424, tr: 0.8 }));

function reachKey(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.06, neck: 0.04, fistR: { x: 34, y: -8 }, fistL: { x: -4, y: -4 } };
}
function hHold(code: number, t: number): Stance {
  'worklet';
  if (code === 5) return reachKey(t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code === 5) return reachKey(t);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}

export default function EpistemologyScene({ clock, bt, bi, qv }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const q = clamp01(qv.value);

    const seekerS = mixStance(hHold(HPOSE[p], t), hLive(HPOSE[n], t, bt.value), tr);

    let l1 = L(LOCKS[p][0], LOCKS[n][0]);
    let l2 = L(LOCKS[p][1], LOCKS[n][1]);
    let l3 = L(LOCKS[p][2], LOCKS[n][2]);
    if (Q1[n]) l3 = lerp(l3, 1, ease01(q));           // the reasons key turns → door opens
    const min3 = Math.min(l1, l2, l3);
    const open = clamp01((min3 - 0.72) / 0.28);
    const shake = Q2[n] ? Math.sin(q * 40) * (1 - q) * 3 : 0;   // rattles but holds

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      seeker: pose(seekerS, SEEKER_X, GROUND, K_FIG, -1, 1),
      l1, l2, l3, open, shake,
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.seeker);
  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        <Door S={SCENE} />
        <Stickman D={DS} k={K_FIG} />
      </Animated.View>
    </Animated.View>
  );
}

function Lock({ S, idx }: { S: SharedValue<any>; idx: number }) {
  const fill = useAnimatedStyle(() => ({ opacity: idx === 0 ? S.value.l1 : idx === 1 ? S.value.l2 : S.value.l3 }));
  return (
    <View style={{ position: 'absolute', left: LOCK_X - 11, top: LOCK_Y[idx] - 11, flexDirection: 'row', alignItems: 'center' }}>
      <View style={styles.lockRing}>
        <Animated.View style={[styles.lockFill, fill]} />
      </View>
      <Text style={styles.lockLabel}>{LOCK_LABEL[idx]}</Text>
    </View>
  );
}

function Door({ S }: { S: SharedValue<any> }) {
  const body = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.shake }] }));
  const glow = useAnimatedStyle(() => ({ opacity: S.value.open * 0.5 }));
  const light = useAnimatedStyle(() => ({ opacity: S.value.open }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* glow behind the door once every lock has turned */}
      <Animated.View style={[{ position: 'absolute', left: DOOR_X - DOOR_W / 2 - 12, top: DOOR_TOP - 12, width: DOOR_W + 24, height: DOOR_H + 12, borderRadius: DOOR_W / 2 + 12, backgroundColor: INK }, glow]} />
      <Animated.View style={[{ position: 'absolute', left: DOOR_X - DOOR_W / 2, top: DOOR_TOP, width: DOOR_W, height: DOOR_H }, body]}>
        {/* door slab */}
        <View style={styles.doorSlab} />
        {/* light spilling from the opening edge */}
        <Animated.View style={[styles.doorLight, light]} />
        <Text style={styles.doorLabel}>KNOWLEDGE</Text>
      </Animated.View>
      <Lock S={S} idx={0} />
      <Lock S={S} idx={1} />
      <Lock S={S} idx={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  doorSlab: {
    position: 'absolute', left: 0, top: 0, width: DOOR_W, height: DOOR_H,
    borderTopLeftRadius: DOOR_W / 2, borderTopRightRadius: DOOR_W / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  doorLight: {
    position: 'absolute', right: 6, top: 14, width: 4, bottom: 8, backgroundColor: INK, borderRadius: 2,
  },
  doorLabel: {
    position: 'absolute', top: 16, left: 0, right: 0, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.4, color: SOFT,
  },
  lockRing: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: INK,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  lockFill: { width: 12, height: 12, borderRadius: 6, backgroundColor: INK },
  lockLabel: {
    marginLeft: 6, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1, color: INK,
  },
});

export function EpistemologyLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={EpistemologyScene} />;
}
