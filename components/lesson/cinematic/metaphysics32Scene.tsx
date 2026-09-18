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
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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
const UNIVERSE_RING = BEATS.map((b) => (b.universeRing ? 1 : 0));
const ALIKE_RING = BEATS.map((b) => (b.alikeRing ? 1 : 0));
const TETHER_MARK = BEATS.map((b) => (b.tetherMark ? 1 : 0));
const TAG_RING = BEATS.map((b) => (b.tagRing ? 1 : 0));

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// WHAT THE MACHINE READS AT EACH OPTION, in the order the BALLOT DECLARES them
// (never the shuffled row order — see SceneApi.pickPos). This question used to
// be a pad, and its options are still that pad's corners written out as
// sentences, so each row below is read straight off one option's own words.
// two spheres stand apart only where the option says DIFFERENT PLACES
const POLL_ORBS = [0, 1, 1, 0];
// the label sticks only where the option says they are DIFFERENT
const POLL_TAG = [0, 0, 1, 1];
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics32'));

export default function Metaphysics32Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(7);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const universeRingFade = (cur.universeRing ?? 0) !== (prev?.universeRing ?? 0);
  const alikeRingFade = (cur.alikeRing ?? 0) !== (prev?.alikeRing ?? 0);
  const tetherMarkFade = (cur.tetherMark ?? 0) !== (prev?.tetherMark ?? 0);
  const tagRingFade = (cur.tagRing ?? 0) !== (prev?.tagRing ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      theta: t * 0.28,
      // R7b — the pad puts the second sphere in the universe. Up the y axis, from one
      // place to two, the pair appears.
      orbs: carry(cv, 0, n, ORBS[p], reacting ? pickAt(POLL_ORBS, pickPos.value) : ORBS[n], grow),
      tether: carry(cv, 1, n, TETHER[p], TETHER[n], grow),
      // And across: drag left, toward they differ somehow, and a label goes on one of
      // them — which is the move the case forbids. Both axes, and the interesting
      // corner is the one where the tag is gone and there are still two.
      tag: carry(cv, 2, n, TAG[p], reacting ? pickAt(POLL_TAG, pickPos.value) : TAG[n], grow),
      // A ring settles round the universe's own rim — this is the test case.
      universeRing: carry(cv, 3, n, UNIVERSE_RING[p], UNIVERSE_RING[n], universeRingFade ? grow : 1),
      // A ring settles round both spheres AT ONCE, never one alone — alike in
      // every way, so nothing here may favour one over the other.
      alikeRing: carry(cv, 4, n, ALIKE_RING[p], ALIKE_RING[n], alikeRingFade ? grow : 1),
      // End-caps mark both ends of the tether: what is true of one end is true
      // of the other.
      tetherMark: carry(cv, 5, n, TETHER_MARK[p], TETHER_MARK[n], tetherMarkFade ? grow : 1),
      // A dashed ring settles round the label — it is already on its way out.
      tagRing: carry(cv, 6, n, TAG_RING[p], TAG_RING[n], tagRingFade ? grow : 1),
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
  const universeRingStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.universeRing }));
  const alikeRingStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.alikeRing }));
  const tetherMarkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tetherMark }));
  const tagRingStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tagRing }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={1}>A UNIVERSE, AND NOTHING ELSE IN IT</Text>
      <View style={styles.universe} pointerEvents="none" />

      {/* group AH — a ring settles round the universe's own rim: this is the test case. */}
      <Animated.View style={[styles.universeRing, universeRingStyle]} pointerEvents="none" />

      <Animated.View style={[styles.tether, tetherStyle]} pointerEvents="none">
        {/* group AH — end-caps at both ends: what is true of one end is true of the other. */}
        <Animated.View style={[styles.tetherCap, { left: -1 }, tetherMarkStyle]} />
        <Animated.View style={[styles.tetherCap, { left: ORB_R * 2 - 1 }, tetherMarkStyle]} />
      </Animated.View>

      <Animated.View style={[styles.orb, orbA]} pointerEvents="none">
        <Animated.Text style={[styles.tag, tagStyle]} numberOfLines={1}>A</Animated.Text>
        {/* group AH — a dashed ring round the label: already on its way out. */}
        <Animated.View style={[styles.tagRing, tagRingStyle]} pointerEvents="none" />
        {/* group AH — a ring settles here too, matched on orbB: alike in every way. */}
        <Animated.View style={[styles.alikeRing, alikeRingStyle]} pointerEvents="none" />
      </Animated.View>
      <Animated.View style={[styles.orb, orbB]} pointerEvents="none">
        <Animated.View style={[styles.alikeRing, alikeRingStyle]} pointerEvents="none" />
      </Animated.View>

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
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  kicker: {
    position: 'absolute', left: 20, top: 288, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
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
    borderRadius: SPH_R, borderWidth: 2.5, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  tag: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: INK,
    includeFontPadding: false,
  },

  // ── the four tap events (group AH) ─────────────────────────────────────────
  // A ring on the universe's own rim: this is the test case.
  universeRing: {
    position: 'absolute', left: UNI_CX - UNI_R - 4, top: UNI_CY - UNI_R - 4, width: (UNI_R + 4) * 2, height: (UNI_R + 4) * 2,
    borderRadius: UNI_R + 4, borderWidth: 2, borderColor: INK,
  },
  // A ring drawn identically inside both orbs — a matched pair, never favouring
  // one sphere over the other.
  alikeRing: {
    position: 'absolute', left: -4, top: -4, width: SPH_R * 2 + 8, height: SPH_R * 2 + 8,
    borderRadius: SPH_R + 4, borderWidth: 2, borderColor: INK,
  },
  // A short end-cap at each end of the tether, inside its own rotating wrapper.
  tetherCap: { position: 'absolute', top: -3, width: 1.5, height: 8, backgroundColor: INK },
  // A dashed ring round the label, inside the orb it sits on: already leaving.
  tagRing: {
    position: 'absolute', left: SPH_R - 15, top: SPH_R - 15, width: 30, height: 30,
    borderRadius: 15, borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed',
  },

  plate: { position: 'absolute', top: PLATE_T, width: PLATE_W, height: PLATE_H },
  plateInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.4, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the counts (240) to the ground line (500). Band 234…512 = 278 (H59).
export function Metaphysics32Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics32Scene} band={[234, 512]} camera={CAM} />;
}
