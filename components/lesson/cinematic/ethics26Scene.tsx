import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics26Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FIVE BEINGS IN A ROW, AND ONE GATE STANDING SOMEWHERE ALONG IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the RAIL is 250×46 at x 136 (136…386), y 336…382 — the scene's filled STONE
//   mass, and the ground the whole argument stands on.
// · FIVE BEINGS of 42×26 at a pitch of 50 from x 140 (140…382), y 346…372, in the
//   order the candidate criteria actually rank them. A circle is the usual picture
//   for this and it hides exactly that: circles have no order, so nothing in one
//   shows which beings are near the line.
// · the GATE is 5 wide, y 320…398, and stands at x 236 · 286 · 336 — between plant
//   and fish, between fish and chimp, or between chimp and person. ONE gate at
//   every setting: the three criteria are one line in three places, and drawing
//   three lines would lose that.
// · INSIDE THE CIRCLE is a caption of 136 wide at x 250, y 306, right-aligned over
//   empty paper above the rail, so the gate never travels through a word (S9).
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462 — below the
//   rail and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, twenty-three units clear of the rail at 136.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const RAIL_X = 136;
const RAIL_Y = 336;
const RAIL_W = 250;
const RAIL_H = 46;

const BEING_X0 = 140;
const BEING_PITCH = 50;
const BEING_W = 42;
const BEING_H = 26;
const BEING_Y = 346;
const BEING_N = 5;
const BEING_CAP = ['ROCK', 'PLANT', 'FISH', 'CHIMP', 'PERSON'];

const LINE_W = 5;
const LINE_Y = 320;
const LINE_H = 78;
/** Between plant and fish, between fish and chimp, between chimp and person. */
const LINE_AT = [236, 286, 336];

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['SPECIESISM', 'A PLAIN FACT', 'THE HARM RULE'];
const PLATE_ID = ['speciesism', 'fact', 'harm'];
/** The charge against drawing the line at our own species. */
const SPECIESISM = 0;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const RAIL = BEATS.map((b) => b.rail ?? 0);
const LINE = BEATS.map((b) => (b.line ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN BIN ORDER, never the shuffled row (X3): 0 can suffer · 1 can plan
// · 2 is human. Each row is that bin's own gate, and the three are authored widest
// circle first so the gate walks along the rail rather than jumping over it.
//   suffer — anything with a stake gets in, so the gate stands before the fish.
//   plan   — only beings who know they have a future, so it moves to the chimp.
//   human  — our own species, so it closes just before the person.
const SORT_GATE = [LINE_AT[0], LINE_AT[1], LINE_AT[2]];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics26'));

export default function Ethics26Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      rail: carry(cv, 1, n, RAIL[p], RAIL[n], tr),
      lineOn: carry(cv, 2, n, LINE[p], LINE[n], tr),
      // The gate rests at the species setting, which is where the narration puts
      // it, and travels only under the reader's own answer.
      lineAt: carry(cv, 3, n, LINE_AT[2], reacting ? pickAt(SORT_GATE, pickPos.value) : LINE_AT[2], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const railStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.rail * 4) }));
  const lineStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.lineOn,
    left: SCENE.value.lineAt,
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHO IS INSIDE THE LINE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, railStyle]} pointerEvents="none">
        <View style={styles.rail} />
      </Animated.View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {BEING_CAP.map((c, k) => <Being key={c} S={SCENE} index={k} />)}
      </View>

      <Animated.View style={[styles.line, lineStyle]} pointerEvents="none" />
      <Text style={styles.inside} pointerEvents="none">INSIDE THE CIRCLE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === SPECIESISM}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One being on the rail, arriving in order. */
function Being({ S, index }: { S: SharedValue<any>; index: number }) {
  const left = BEING_X0 + index * BEING_PITCH;
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.rail * BEING_N - index) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <View style={[styles.being, { left }]} />
      <Text style={[styles.beingText, { left }]}>{BEING_CAP[index]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: RAIL_X, top: CAP_T, width: RAIL_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  rail: {
    position: 'absolute', left: RAIL_X, top: RAIL_Y, width: RAIL_W, height: RAIL_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  being: {
    position: 'absolute', top: BEING_Y, width: BEING_W, height: BEING_H, borderRadius: 3,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },
  beingText: {
    position: 'absolute', top: BEING_Y + 9, width: BEING_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },

  // ONE GATE. The criteria are one line in three places, not three kinds of line.
  line: { position: 'absolute', top: LINE_Y, width: LINE_W, height: LINE_H, backgroundColor: INK },
  inside: {
    position: 'absolute', left: 250, top: 306, width: 136, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Ethics26Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics26Scene} band={[240, 512]} camera={CAM} />;
}
