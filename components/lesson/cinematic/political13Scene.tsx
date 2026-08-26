import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political13Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A three-step argument, stage right. The steps are the tap targets.
//
// · figure WALKS x = 70 → 168 → 124; widest span x 132…204 at 168, fist to 204.5.
//   All argument ink is at x ≥ 216.
// · header y 226…238 · steps y 250…392 on a 50 pitch · the verdict tag y 398…416.
//   A standing crown is y 397; the tag sits beside the head, never over it, because
//   it lives at x ≥ 216.
// · A5 — the argument is out of reach (hand tops out at y 411, B11b); read, not
//   handled, and no beat's text claims contact.
//
// THE STEP CARDS ARE THE ANSWER TARGETS, so there is no separate answer row to keep
// in sync with them — the thing the reader is reasoning about is the thing they tap
// (E33). A 50-unit pitch at this lesson's fit of 2.22 is 111dp centre to centre,
// well clear of the ~45dp a fingertip covers (E37b-2).

const AR_L = 216;
const AR_W = 176;

const HEAD_T = 226;

const STEP_T = 250;
const STEP_H = 42;
const STEP_PITCH = 50;
const STEP_SLOP = (STEP_PITCH - STEP_H) / 2;

const TAG_T = 398;
const TAG_H = 18;

const STEPS = [
  { id: 's1', label: '1 · THE SPEECH OFFENDS MANY', correct: false },
  { id: 's2', label: '2 · SO IT HARMS THEM', correct: true },
  { id: 's3', label: '3 · SO WE MAY STOP IT', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political13'));
const DIR = dirsFrom(X, 1);
const NSTEPS = BEATS.map((b) => b.steps ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.field ? 1 : 0));

export default function Political13Scene({ clock, bt, bi, i, picked, onPick, dragPos, dragPos2 }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(2);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const shown = cur.steps ?? 0;
  const prevShown = prev?.steps ?? 0;
  const tagOn = (cur.tag ?? 0) > 0;
  const tagFade = (cur.tag ?? 0) !== (prev?.tag ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      fill: carry(cv, 1, n, NSTEPS[p], NSTEPS[n], grow),
      // R7c — the OFFENCE IS NOT HARM tag belongs to exactly one corner of the pad:
      // a great many object (x high) and nobody is set back (y low). The reader finds
      // it by moving there rather than by being told.
      tag: reacting ? dragPos.value * (1 - dragPos2.value) * tr : tagOn ? (tagFade ? grow : 1) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const tagStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.tag,
    transform: [{ translateY: (1 - SCENE.value.tag) * -5 }],
  }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.head} numberOfLines={1} pointerEvents="none">THE TOWN&apos;S ARGUMENT</Text>

      {STEPS.map((s, k) => (
        <Step
          key={s.id}
          index={k}
          step={s}
          shown={shown}
          prevShown={prevShown}
          live={live}
          answered={answered}
          picked={picked}
          onPick={onPick}
          SCENE={SCENE}
        />
      ))}

      <Animated.View style={[styles.tag, tagStyle]} pointerEvents="none">
        <Text style={styles.tagText} numberOfLines={1}>OFFENCE IS NOT HARM</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

function Step({
  index, step, shown, prevShown, live, answered, picked, onPick, SCENE,
}: {
  index: number;
  step: { id: string; label: string; correct: boolean };
  shown: number; prevShown: number; live: boolean; answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  SCENE: { value: { fill: number } };
}) {
  const held = index < prevShown;
  const arriving = index >= prevShown && index < shown;
  const st = useAnimatedStyle(() => {
    if (held) return { opacity: 1, transform: [{ translateX: 0 }] };
    if (!arriving) return { opacity: 0, transform: [{ translateX: -8 }] };
    const a = Math.max(0, Math.min(1, SCENE.value.fill - index));
    return { opacity: a, transform: [{ translateX: (1 - a) * -8 }] };
  });
  const chosen = picked === step.id;
  return (
    <Animated.View style={[styles.stepWrap, { top: STEP_T + index * STEP_PITCH }, st]}>
      <Target id={step.id} correct={step.correct} picked={picked} onPick={onPick}
              disabled={!live || answered} hitSlop={{ top: STEP_SLOP, bottom: STEP_SLOP, left: 0, right: 0 }}>
        <View
          style={[
            styles.step,
            answered && step.correct && styles.pickRight,
            answered && chosen && !step.correct && styles.pickWrong,
          ]}
        >
          <Text
            style={[styles.stepText, answered && step.correct && styles.onInk]}
            numberOfLines={1}
          >
            {step.label}
          </Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  head: {
    position: 'absolute', left: AR_L, top: HEAD_T, width: AR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },

  stepWrap: { position: 'absolute', left: AR_L, width: AR_W },
  step: {
    height: STEP_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  stepText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },

  tag: {
    position: 'absolute', left: AR_L, top: TAG_T, width: AR_W, height: TAG_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
});

// Ink runs from the header (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Political13Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political13Scene} band={[220, 512]} camera={CAM} />;
}
