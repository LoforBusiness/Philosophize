import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics32Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE APP'S FIRST ORBIT, and the answer targets are three NUMBERS — the reader answers
// by counting what is in front of them (E33). Nothing in the frame ever breaks the
// symmetry, which is the argument: the picture refuses to hand over a way of telling
// the two apart, and no sentence has to say so (H64).
//
// · the universe is a RULE-coloured rim centred (232, 405) with r 95 — x 137…327,
//   y 310…500, resting on the ground line. It is the boundary of the stipulation, not
//   a third object, which is why it is the only shape here not drawn in INK (A5).
// · the two spheres are r 28 on an orbit of r 58 about that centre, so their furthest
//   ink is 86 from it — nine clear of the rim at every angle.
// · the tether is a RULE bar 116 long (2 × 58) through the centre, turning with them.
// · three counts sit in a row above at y 240…278: x 30 / 148 / 266, each 104 wide.
// · the kicker is at y 288…304, in the gap between the counts and the universe.
// · the figure stands OUTSIDE at x 56 facing right — its widest ink is a fist at
//   x 89, forty-eight clear of the rim. It has to be outside: a figure in shot would
//   be a third thing in a universe stipulated to contain two (A1).
//
// The orbit is 0.28 rad/s — one turn every 22 seconds, so a reader who sits on a beat
// watches something move without anything happening (H67).

const UNI_CX = 232;
const UNI_CY = 405;
const UNI_R = 95;

const ORB_R = 58;
const SPH_R = 28;

const PLATE_T = 240;
const PLATE_H = 38;
const PLATE_W = 104;
const PLATE_X = [30, 148, 266];

const FIG_X = 56;

const COUNTS = [
  { id: 'one', label: 'ONE THING', correct: false },
  { id: 'two', label: 'TWO THINGS', correct: true },
  { id: 'nofact', label: 'NO FACT OF\nTHE MATTER', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const ORBS = BEATS.map((b) => b.orbs ?? 0);
const TETHER = BEATS.map((b) => b.tether ?? 0);
const TAG = BEATS.map((b) => b.tag ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics32'));

export default function Metaphysics32Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const s = mixStance(emoteHold(G[p], t), emoteLive(G[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      theta: t * 0.28,
      orbs: lerp(ORBS[p], ORBS[n], grow),
      tether: lerp(TETHER[p], TETHER[n], grow),
      tag: lerp(TAG[p], TAG[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const orbA = useAnimatedStyle(() => {
    const a = SCENE.value.orbs;
    return {
      opacity: a,
      transform: [
        { translateX: Math.cos(SCENE.value.theta) * ORB_R },
        { translateY: Math.sin(SCENE.value.theta) * ORB_R },
        { scale: 0.6 + 0.4 * a },
      ],
    };
  });
  const orbB = useAnimatedStyle(() => {
    const a = SCENE.value.orbs;
    return {
      opacity: a,
      transform: [
        { translateX: -Math.cos(SCENE.value.theta) * ORB_R },
        { translateY: -Math.sin(SCENE.value.theta) * ORB_R },
        { scale: 0.6 + 0.4 * a },
      ],
    };
  });
  const tetherStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.tether * 0.9,
    transform: [{ rotate: `${SCENE.value.theta}rad` }],
  }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tag }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.kicker} numberOfLines={1}>A UNIVERSE, AND NOTHING ELSE IN IT</Text>
      <View style={styles.universe} pointerEvents="none" />

      <Animated.View style={[styles.tether, tetherStyle]} pointerEvents="none" />

      <Animated.View style={[styles.orb, orbA]} pointerEvents="none">
        <Animated.Text style={[styles.tag, tagStyle]} numberOfLines={1}>A</Animated.Text>
      </Animated.View>
      <Animated.View style={[styles.orb, orbB]} pointerEvents="none" />

      {COUNTS.map((c, k) => (
        <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.plate, { left: PLATE_X[k] }]} disabled={!live || answered}>
          <View
            style={[
              styles.plateInner,
              answered && c.correct && styles.pickRight,
              answered && picked === c.id && !c.correct && styles.pickWrong,
            ]}
          >
            <Text
              style={[styles.plateText, answered && c.correct && styles.onInk]}
              numberOfLines={2}
            >
              {c.label}
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
    position: 'absolute', left: 20, top: 288, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  universe: {
    position: 'absolute',
    left: UNI_CX - UNI_R, top: UNI_CY - UNI_R, width: UNI_R * 2, height: UNI_R * 2,
    borderRadius: UNI_R, borderWidth: 1.5, borderColor: RULE, backgroundColor: PAPER,
  },
  tether: {
    position: 'absolute',
    left: UNI_CX - ORB_R, top: UNI_CY - 1, width: ORB_R * 2, height: 2,
    backgroundColor: RULE,
  },
  orb: {
    position: 'absolute',
    left: UNI_CX - SPH_R, top: UNI_CY - SPH_R, width: SPH_R * 2, height: SPH_R * 2,
    borderRadius: SPH_R, borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  tag: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: INK,
    includeFontPadding: false,
  },

  plate: { position: 'absolute', top: PLATE_T, width: PLATE_W, height: PLATE_H },
  plateInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.5, lineHeight: 11, letterSpacing: 0.4, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the counts (240) to the ground line (500). Band 234…512 = 278 (H59).
export function Metaphysics32Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics32Scene} band={[234, 512]} camera={CAM} />;
}
