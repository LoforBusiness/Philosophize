// ─────────────────────────────────────────────────────────────────────────────
// THE CLOSING ENCOUNTER FOR `ethics-ethics-23`, "The Child In The Pond".
//
// MECHANIC: THE READER MOVES THE FIGURE HIMSELF. There is no button anywhere. He is
// on his way home along the path; someone is face-down in the water; you drag HIM,
// and where you leave him is the answer. That is the closest the app gets to the
// owner's *"I want the stickman to be like a free person"* — for these few seconds
// he is not being played, he is being walked.
//
// WHY THE DRAG AND NOT A PICK. Singer's argument is not a claim you agree with, it
// is a thing you find you cannot refuse once you are standing next to it. Making the
// reader physically carry him past the pond is the argument; a button marked "walk
// on" is a survey. And the figure ARGUES BACK — as he nears the path home he drags
// his heels and leans against the pull, so the reader feels the thing the lesson
// spent seven beats saying.
//
// N11 — THIS LESSON IS GRAVE AND THE CODA IS TOO. No gag, no comic shelf. The
// nearest the app gets to a joke here is the shoes, which are Singer's own detail.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming,
} from 'react-native-reanimated';
import { GROUND, INK, K_FIG, SHADE, SOFT, STAGE_W, STONE } from '../cinematicKit';
import { clamp01, ease01, lerp, mixStance, pose, strideStance, WALK, type Bundle } from '../rig';
import { emoteAny, emoteAnyLive } from '../moves';
import {
  type CodaWindow,
  CodaFigure, CodaFloor, CodaLand, CodaLine, CodaStage, CodaTouch, codaX, useCodaRun,
} from './codaKit';
import type { CodaProps } from './types';

/** Where the path runs out, where the water starts, and where the child is. */
const HOME_X = 330;
const START_X = 92;
const BANK_X = 196;
const CHILD_X = 262;
/** How close the reader is: the walk spans 92…330, so the sides can go. */
const WIN: CodaWindow = [56, 344, 368, 548];
/** Past this he is in the water; past the bank he is committed. */
const WET = BANK_X + 10;

const POSE_WALK = 25;        // an open, unhurried stand — the walk home
const POSE_SEE = 34;         // shield the eyes: he has spotted something
const POSE_REACH = 29;       // push out — both arms forward, hauling
const POSE_LOOK = 65;        // gazing up, arms forgotten — he turns to the reader

export default function PondCoda({ onDone }: CodaProps) {
  const { t, phase, tries, resolve, again } = useCodaRun(2100);
  /** Where the reader has put him, in stage units. */
  const x = useSharedValue(START_X);
  /** 0 the child is up … 1 the child has gone under. */
  const sink = useSharedValue(0);
  /** 0 the child is where they were … 1 on the bank beside him. */
  const saved = useSharedValue(0);
  /** How much he is leaning AGAINST the pull, 0…1 — the resistance the reader feels. */
  const dig = useSharedValue(0);

  const land = phase === 'land';
  /** The phase, on the UI thread, so the follow reaction can be gated without React. */
  const asking = useSharedValue(0);
  asking.value = phase === 'ask' ? 1 : 0;

  // ── HE WALKS IN, AND THEN HE IS THE READER'S ──────────────────────────────
  useEffect(() => {
    if (phase !== 'arrive') return;
    x.value = withTiming(START_X, { duration: 10 });
  }, [phase, x]);

  // The child goes under while the reader is deciding, and comes back up when they
  // start moving him. Nothing is on a timer the reader can lose.
  useEffect(() => {
    if (phase === 'ask') sink.value = withTiming(0.55, { duration: 2600, easing: Easing.inOut(Easing.quad) });
  }, [phase, sink]);

  const decide = useCallback((wentIn: boolean) => {
    resolve(wentIn, wentIn ? 2600 : 2000);
  }, [resolve]);

  /** The finger, 0…1 across the surface — written on the UI thread by CodaTouch. */
  const u = useSharedValue(START_X / STAGE_W);

  // THE FIGURE FOLLOWS THE FINGER, AND DRAGS HIS HEELS ON THE WAY HOME.
  //
  // A reaction rather than arithmetic inside the gesture, so the same expression runs
  // whether the reader is dragging now or the run is settling an animation: `x` is
  // always a function of `u`, and `u` is the only thing a finger writes.
  useAnimatedReaction(() => (asking.value ? u.value : -1), (uu) => {
    'worklet';
    if (uu < 0) return;
    const want = Math.max(70, Math.min(HOME_X, codaX(uu, WIN)));
    const past = clamp01((want - CHILD_X) / (HOME_X - CHILD_X));
    dig.value = past;
    x.value = want - past * 26;
  });

  const drop = useCallback(() => {
    const inWater = x.value > WET && x.value < CHILD_X + 26;
    if (inWater) {
      x.value = withTiming(CHILD_X - 24, { duration: 260 });
      sink.value = withTiming(0, { duration: 700 });
      saved.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) });
    } else {
      x.value = withTiming(HOME_X, { duration: 900, easing: Easing.inOut(Easing.quad) });
      sink.value = withTiming(1, { duration: 1500 });
    }
    dig.value = withTiming(0, { duration: 300 });
    decide(inWater);
  }, [x, sink, saved, dig, decide]);

  // Coming back for another go: he walks out of the water's edge and the child
  // surfaces again. Nothing is undone by a cut.
  useEffect(() => {
    if (phase !== 'again') return;
    x.value = withTiming(START_X + 46, { duration: 900, easing: Easing.inOut(Easing.quad) });
    sink.value = withTiming(0.4, { duration: 900 });
  }, [phase, x, sink]);

  const D = useDerivedValue<Bundle>(() => {
    const now = t.value;
    const handled = phase === 'ask' || phase === 'again';
    // Arriving: he walks the first stretch on the gait every other walk in the app
    // uses, so the feet are driven by the distance and never skate.
    const tr = phase === 'arrive' ? ease01(Math.min(now / 1.5, 1)) : 1;
    const from = phase === 'arrive' ? -40 : x.value;
    const to = phase === 'arrive' ? START_X : x.value;

    const code = phase === 'land' ? POSE_LOOK
      : phase === 'again' ? POSE_LOOK
        : phase === 'play' && saved.value > 0.2 ? POSE_REACH
          : handled && dig.value > 0.25 ? POSE_REACH
            : phase === 'arrive' && now > 1.2 ? POSE_SEE
              : POSE_WALK;
    const hold = emoteAny(code, now + 3);
    const live = emoteAnyLive(code, now + 3, now);
    let s = phase === 'arrive'
      ? strideStance(from, to, mixStance(hold, live, 0.5), tr, WALK)
      : mixStance(hold, live, 0.6);

    // LEANING BACK AGAINST THE PULL. The spine carries it, not the neck (N12) — and
    // the feet stay where they are, so it reads as someone being dragged rather than
    // someone walking backwards.
    if (dig.value > 0.01) {
      const d = dig.value;
      s = {
        ...s,
        tilt: s.tilt + 0.26 * d,
        bob: s.bob + 3 * d,
        footL: { x: s.footL.x - 7 * d, y: s.footL.y },
        footR: { x: s.footR.x + 3 * d, y: s.footR.y },
      };
    }
    // WADING IS A FUNCTION OF WHERE HE IS. Written only by the drag, it stayed at
    // whatever the finger last left it, so the walk into the water after the drop
    // put him on TOP of it.
    const here = phase === 'arrive' ? lerp(from, to, tr) : x.value;
    const sunk = clamp01((here - WET) / 30) * (1 - clamp01((here - BANK_X - 130) / 30)) * 11;
    const st = { ...s, bob: s.bob - sunk };
    const px = here;
    // He faces the way he is going, and turns to the reader when he is waiting.
    const dir = phase === 'again' || phase === 'land' ? -1 : 1;
    return pose(st, px, GROUND, K_FIG, dir, 1);
  }, [phase]);

  // The child: a small figure in the water, going under and coming back.
  const childStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: CHILD_X + saved.value * (BANK_X - 34 - CHILD_X) },
      { translateY: GROUND - 14 - saved.value * 20 + sink.value * 12 },
      { scale: 0.62 },
    ],
    opacity: 1 - sink.value * 0.25,
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + sink.value * 0.5 - saved.value * 0.6,
    transform: [{ scaleX: 1 + sink.value * 0.5 }],
  }));

  const line = phase === 'arrive' ? 'On your way home. Good shoes.'
    : phase === 'ask' ? (tries ? 'Try again — walk him wherever you like.' : 'Walk him.')
      : phase === 'play' ? ''
        : phase === 'again' ? 'He stops. He is waiting for you.'
          : '';

  return (
    <>
      {phase === 'land' ? null : <CodaLine text={line} />}
      <CodaStage win={WIN}>
        <CodaFloor />
        {/* THE POND — a filled mass with a lit near edge, the stage kit's own
            construction, so it reads as water rather than as a labelled rectangle. */}
        <View style={styles.pond} pointerEvents="none" />
        <View style={styles.pondLip} pointerEvents="none" />
        <Animated.View style={[styles.ripple, rippleStyle]} pointerEvents="none" />
        {/* The child, drawn small and simply: this is a silhouette in water, and a
            rigged second figure at this scale would read as an adult. */}
        <Animated.View style={[styles.child, childStyle]} pointerEvents="none">
          <View style={styles.childHead} />
          <View style={styles.childBody} />
          <View style={styles.childArm} />
        </Animated.View>
        <CodaFigure D={D} />
      </CodaStage>
      {/* THE WHOLE SCREEN IS THE HANDLE. He is the control, so aiming at him would
          make the reader's first problem "where exactly is he" rather than "where
          should he be". */}
      {phase === 'ask' ? <CodaTouch enabled u={u} onDrop={drop} id="coda-drag" /> : null}
      {land
        ? (
          <CodaLand
            idea="Distance is not a discount."
            note="You waded in. Singer's point is that the pond is the only thing that changes when the child is far away — and a pond is not a reason."
            onDone={onDone}
          />
        )
        : null}
    </>
  );
}

const styles = StyleSheet.create({
  // A CUT-IN, NOT A TUB. Drawn as a filled box sitting on the floor it read as a
  // bath: the surface is AT the ground line now, with the dark of the water below it
  // and a lit near lip, which is the same construction every other recess in the app
  // uses (StruckNiche, and the stage kit's own floor).
  pond: {
    position: 'absolute', left: BANK_X, width: 140, top: GROUND, height: 30,
    backgroundColor: SOFT, borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
  },
  pondLip: {
    position: 'absolute', left: BANK_X, width: 140, top: GROUND - 2, height: 3,
    backgroundColor: STONE, borderRadius: 2,
  },
  ripple: {
    position: 'absolute', left: CHILD_X - 26, width: 56, top: GROUND + 3, height: 2,
    backgroundColor: STONE, borderRadius: 1,
  },
  child: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  childHead: {
    position: 'absolute', left: -9, top: -20, width: 18, height: 18, borderRadius: 9, backgroundColor: INK,
  },
  childBody: {
    position: 'absolute', left: -4, top: -4, width: 26, height: 8, borderRadius: 4, backgroundColor: INK,
  },
  childArm: {
    position: 'absolute', left: -16, top: -34, width: 7, height: 22, borderRadius: 4,
    backgroundColor: INK, transform: [{ rotate: '-18deg' }],
  },
});
