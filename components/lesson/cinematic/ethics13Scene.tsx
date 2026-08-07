import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle,
} from './rig';
import { BEATS } from './ethics13Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// ONE RAIL FROM TOO LITTLE TO TOO MUCH, and the answer targets are POSITIONS on it —
// the reader answers with a place rather than a proposition (E33). Answering slides
// the marker to the mean and wears a GROOVE under it, which is the part of Aristotle
// the card deck could only assert: the mean is habituated, not recomputed (H64).
//
// · the rail is x 108…372 at y 380…386, floating rather than standing — it is a
//   measuring scale, not furniture, so it gets no legs (A5).
// · five positions on a 58 pitch at x 124 / 182 / 240 / 298 / 356. Each is a target
//   92 tall at y 352…444: a tick crossing the rail at y 372…392, then a plate at
//   y 398…430 carrying the name and the answer state (H61).
// · the marker is a 12-unit diamond above the rail at y 356…368, clear of the ticks.
// · the groove is under the mean at x 214…266, y 388 down to at most y 398, which
//   stops exactly where the middle plate begins.
// · the figure is at x 40 facing right; measured across its poses it reaches x 73,
//   twenty-four clear of the first target.
// · the kicker is at y 330…346 across the rail — the highest ink in the scene.

const RAIL_L = 108;
const RAIL_R = 372;
const RAIL_T = 380;

const POS_X = [124, 182, 240, 298, 356];
const MEAN = 2;
const HIT_W = 54;
const HIT_T = 352;
const HIT_H = 92;

const MARK_T = 356;
const MARK = 12;

const FIG_X = 40;
const KICK_T = 330;

const NAMES = ['COWARD', 'TIMID', 'COURAGE', 'RASH', 'RECKLESS'];

const G = BEATS.map((b) => b.g ?? 0);
const POS = BEATS.map((b) => b.pos ?? 0);
const HABIT = BEATS.map((b) => b.habit ?? 0);

export default function Ethics13Scene({ clock, bt, bi, qv, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const revealing = (cur.pick ?? 0) > 0;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    // The marker crosses up to four positions, which is 232 units — 1.2s, so it
    // travels at a readable rate rather than teleporting (C17).
    const slide = ease01(bt.value / 1.2);
    const s = mixStance(emoteHold(G[p], t), emoteLive(G[n], t, bt.value), tr);
    const base = lerp(POS[p], POS[n], slide);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      // On the question beat the marker waits at the far end and only travels to the
      // mean once the reader has answered — so the picture never gives it away.
      pos: revealing ? lerp(base, MEAN, qv.value) : base,
      habit: revealing ? qv.value : lerp(HABIT[p], HABIT[n], slide),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const markStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: lerp(POS_X[0], POS_X[4], SCENE.value.pos / 4) - POS_X[0] },
      { rotate: '45deg' },
    ],
  }));
  const grooveStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.habit,
    transform: [{ scaleY: 0.2 + 0.8 * SCENE.value.habit }],
  }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>HOW MUCH FEAR?</Text>

      <View style={styles.rail} pointerEvents="none" />
      <Animated.View style={[styles.groove, grooveStyle]} pointerEvents="none" />
      <Animated.View style={[styles.marker, markStyle]} pointerEvents="none" />

      {NAMES.map((name, k) => (
        <Target id={name.toLowerCase()} correct={k === MEAN} picked={picked} onPick={onPick}
              key={name} style={[styles.hit, { left: POS_X[k] - HIT_W / 2 }]} disabled={!live || answered}>
          <View style={styles.tick} pointerEvents="none" />
          <View
            style={[
              styles.plate,
              answered && k === MEAN && styles.pickRight,
              answered && picked === name.toLowerCase() && k !== MEAN && styles.pickWrong,
            ]}
          >
            <Text
              style={[styles.plateText, answered && k === MEAN && styles.onInk]}
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>
        </Target>
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  kicker: {
    position: 'absolute', left: RAIL_L, top: KICK_T, width: RAIL_R - RAIL_L,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  rail: { position: 'absolute', left: RAIL_L, top: RAIL_T, width: RAIL_R - RAIL_L, height: 6, backgroundColor: INK },
  // Worn in under the mean, and grows DOWNWARD off the rail's underside.
  groove: {
    position: 'absolute', left: POS_X[MEAN] - 26, top: RAIL_T + 8, width: 52, height: 10,
    borderBottomLeftRadius: 26, borderBottomRightRadius: 26, backgroundColor: SOFT,
    transformOrigin: '50% 0%',
  },
  marker: {
    position: 'absolute', left: POS_X[0] - MARK / 2, top: MARK_T, width: MARK, height: MARK,
    backgroundColor: INK,
  },

  hit: { position: 'absolute', top: HIT_T, width: HIT_W, height: HIT_H, alignItems: 'center' },
  tick: { position: 'absolute', top: 20, width: 3, height: 20, backgroundColor: INK },
  plate: {
    position: 'absolute', left: 0, right: 0, top: 46, height: 32,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the kicker (330) to the ground line (500). Band 324…512 = 188 (H59).
export function Ethics13Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics13Scene} band={[324, 512]} />;
}
