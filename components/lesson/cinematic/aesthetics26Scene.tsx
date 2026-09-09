import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics26Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A LAWN FLAMINGO THAT NEVER MOVES, AND AN EYE BESIDE IT THAT DOES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the PLINTH is 160×26 at x 214 (214…374), y 400…426 — the filled STONE mass the
//   bird stands on.
// · the FLAMINGO is built from its field marks rather than from a silhouette: two
//   LEGS of 3 wide at x 250 and x 262, y 356…400; a BODY of 52×34 at x 228
//   (228…280), y 322…356, rounded to 17 so it is an oval and not a box; a NECK of
//   8×50 at x 264, leaning 14° off vertical from its foot at y 324; a HEAD of
//   18×14 at x 258, y 266…280; and a BEAK that turns DOWN — the one mark that
//   makes the bird a flamingo rather than a heron.
// · NOTHING IN THAT LIST RESPONDS TO THE READER. The lesson's claim is that the
//   object barely changes and the attitude does, so a scene that made the bird
//   tackier as the reader slid toward camp would be saying the opposite of the
//   lesson while looking like an illustration of it.
// · the EYE is a 60×34 lens at x 140 (140…200), y 300…334, with a 16-unit pupil at
//   its centre and a LID that comes down inside it — clipped by the lens, so the
//   wink cannot spill onto the paper. It carries HOW YOU LOOK at x 130, y 342.
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462 — below the
//   plinth and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate and twenty-seven clear
//   of the eye at 140.
//
// Ink runs y 266 (the beak) … y 500 (ground), with the caption at 244.
// BAND 240…512 = 272 — a 103-unit figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PLINTH_X = 214;
const PLINTH_Y = 400;
const PLINTH_W = 160;
const PLINTH_H = 26;

const BODY_X = 228;
const BODY_Y = 322;
const BODY_W = 52;
const BODY_H = 34;
const LEG_Y = 356;
const LEG_H = 44;
const NECK_X = 264;
const NECK_Y = 274;
const NECK_H = 50;
const HEAD_X = 258;
const HEAD_Y = 266;

const EYE_X = 140;
const EYE_Y = 300;
const EYE_W = 60;
const EYE_H = 34;
/** How far the lid comes down at a full wink — never the whole lens. */
const LID_MAX = 21;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['BAD TASTE', 'KNOWING LOVE', 'A MASTERPIECE'];
const PLATE_ID = ['bad', 'knowing', 'great'];
/** Camp. The other two are the sincere mistake and the way out of the joke. */
const KNOWING = 1;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BIRD = BEATS.map((b) => (b.bird ? 1 : 0));
const EYE = BEATS.map((b) => (b.eye ? 1 : 0));
const WINK = BEATS.map((b) => b.wink ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics26'));

export default function Aesthetics26Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      birdOn: carry(cv, 1, n, BIRD[p], BIRD[n], tr),
      eyeOn: carry(cv, 2, n, EYE[p], EYE[n], tr),
      // R7c — the knob's own 0…1 IS how far the difference has been handed to the
      // beholder, and the only thing in the picture that answers to it is the eye.
      wink: carry(cv, 3, n, WINK[p], reacting ? dragPos.value : WINK[n], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const birdStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.birdOn }));
  const eyeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.eyeOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const lidStyle = useAnimatedStyle(() => ({ height: LID_MAX * SCENE.value.wink }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE SAME BIRD, TWICE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, birdStyle]} pointerEvents="none">
        <View style={styles.plinth} />
        <View style={[styles.leg, { left: 250 }]} />
        <View style={[styles.leg, { left: 262 }]} />
        <View style={styles.birdBody} />
        <View style={styles.neck} />
        <View style={styles.birdHead} />
        {/* THE DOWNTURNED BEAK — the one mark that makes it a flamingo and not a
            heron, which is why it is drawn rather than implied. */}
        <View style={styles.beak} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, eyeStyle]} pointerEvents="none">
        <View style={styles.lens}>
          <View style={styles.pupil} />
          <Animated.View style={[styles.lid, lidStyle]} />
        </View>
        <Text style={styles.eyeText}>HOW YOU LOOK</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === KNOWING}
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

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 140, top: CAP_T, width: 246,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  plinth: {
    position: 'absolute', left: PLINTH_X, top: PLINTH_Y, width: PLINTH_W, height: PLINTH_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  leg: { position: 'absolute', top: LEG_Y, width: 3, height: LEG_H, backgroundColor: INK },
  birdBody: {
    position: 'absolute', left: BODY_X, top: BODY_Y, width: BODY_W, height: BODY_H, borderRadius: 17,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  // PIVOTED AT ITS FOOT, so leaning the neck cannot lift it off the bird's body.
  neck: {
    position: 'absolute', left: NECK_X, top: NECK_Y, width: 8, height: NECK_H,
    backgroundColor: INK, transformOrigin: '50% 100%', transform: [{ rotate: '14deg' }],
  },
  birdHead: {
    position: 'absolute', left: HEAD_X, top: HEAD_Y, width: 18, height: 14, borderRadius: 7,
    backgroundColor: INK,
  },
  beak: {
    position: 'absolute', left: 250, top: 276, width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 13,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },

  // THE ONE THING THE READER MOVES. Clipped, so a closing lid stays in its lens.
  lens: {
    position: 'absolute', left: EYE_X, top: EYE_Y, width: EYE_W, height: EYE_H, borderRadius: EYE_H / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER, overflow: 'hidden',
  },
  pupil: {
    position: 'absolute', left: EYE_W / 2 - 10, top: EYE_H / 2 - 10, width: 16, height: 16, borderRadius: 8,
    backgroundColor: INK,
  },
  lid: { position: 'absolute', left: 0, top: 0, width: EYE_W, backgroundColor: STONE },
  eyeText: {
    position: 'absolute', left: 130, top: 342, width: 80, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
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

export function Aesthetics26Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics26Scene} band={[240, 512]} camera={CAM} />;
}
