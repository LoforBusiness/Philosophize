// ─────────────────────────────────────────────────────────────────────────────
// THE ONE STAGE EVERY UNIT REVIEW IS DRAWN ON.
//
// A lesson's scene is hand-staged for the one thing that lesson is about. A review
// is about a UNIT — four ideas that were met a lesson at a time — and the shape of
// that is the same every time: the table fills up, the figure walks to whichever
// idea is being talked about, it lights, and a question is asked about it.
//
// So this is one scene driven by data (`data/unitReviews.ts`) rather than
// twenty-eight scenes drawn by hand, and it is written to every rule a hand-drawn
// one is: `carry` on every track so nothing pops at a beat change (L1, AH4), the
// gait from `travelStance` so the feet never skate (C18/AF9), `lookPose` so the
// figure turns to what the beat is about and answers the reader back (AA5), the
// branch hue from `stageTones` (R18), the depth kit from `stageSkin` (AG), and a
// tonal mass floor of three (T1).
//
// ── WHY IT IS A SCENE AND NOT A NEW PLAYER ──────────────────────────────────
//
// The owner asked for *"all the animations, all the things a lesson has"*. The
// cheapest way to be sure of that is not to reimplement any of it: a review is
// handed to `CinematicPlayer` as a lesson, so the deck, the camera, the six answer
// controls, the verdict, the XP coin, the back-and-forward navigation, the guide and
// the reward hand-off are the same code paths, not lookalikes of them.
// ─────────────────────────────────────────────────────────────────────────────
import { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Stickman from '../Stickman';
import {
  GROUND, INK, K_FIG,
  carry, carryFrom, keepHeld, lookPose, useCarry, useHeld,
} from '../cinematicKit';
import type { SceneApi } from '../CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, travelStance, WALK } from '../rig';
import { emoteAny, emoteAnyLive } from '../moves';
import { stageTone, type StageTone } from '../stageTones';
import { floorStyle, lipOf, PLATE_FACE, PLATE_RADIUS } from '../stageSkin';
import type { ReviewStep } from '@/data/unitReviews';

/** Where the plates sit, and where the figure stands under each of them. */
const SLOT_X = [88, 176, 264, 344];
const PLATE_Y = 300;
const PLATE_W = 78;
const PLATE_H = 54;
const STAND_Y = GROUND;

/** A neutral open hold, and the one he uses while a plate is being discussed. */
const POSE_WALK = 25;
const POSE_SHOW = 1;

export interface ReviewSceneProps extends SceneApi {
  plates: string[];
  steps: ReviewStep[];
  branch: string;
}

export default function ReviewScene({
  clock, bt, bi, plates, steps, branch, gazeX, gazeY, gazeOn, picked, pickedOk,
}: ReviewSceneProps) {
  const tone = stageTone(branch as never);
  const lip = lipOf(tone);
  const held = useHeld();
  const cv = useCarry(6);

  // THE TRACKS, DERIVED FROM THE STEPS RATHER THAN DECLARED. A review's beats are
  // generated, so the scene builds its own per-beat arrays the way a hand-written
  // scene declares them — `upto` latches (the table only ever fills) and `at` is the
  // plate under discussion.
  let seen = 0;
  const UPTO = steps.map((s) => {
    seen = Math.max(seen, s.upto ?? seen);
    return Math.min(seen, plates.length);
  });
  const AT = steps.map((s) => (s.at === undefined ? -1 : s.at));
  const X = steps.map((s, i) => (AT[i] >= 0 ? SLOT_X[Math.min(AT[i], SLOT_X.length - 1)] - 44 : 54));
  const DIRS = X.map((x, i) => (i === 0 ? 1 : x > X[i - 1] + 1 ? 1 : x < X[i - 1] - 1 ? -1 : 0));
  for (let i = 1; i < DIRS.length; i += 1) if (DIRS[i] === 0) DIRS[i] = DIRS[i - 1];
  if (DIRS.length) DIRS[0] = DIRS[0] || 1;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const t = clock.value;
    // The walk takes as long as its distance needs, at the walk's own speed — a fixed
    // duration sprints a long step and strands the feet (§17, the 54 scenes).
    const tr = ease01(bt.value / moveTr(X[p] ?? 54, X[n] ?? 54, 0.85));
    const soft = ease01(bt.value / 0.7);

    const code = AT[n] >= 0 ? POSE_SHOW : POSE_WALK;
    const hold = emoteAny(code, t);
    const live = emoteAnyLive(code, t, bt.value);
    const s = keepHeld(held, travelStance(X[p] ?? 54, X[n] ?? 54, carryFrom(held, n, hold), hold, live, tr, WALK));
    const x = lerp(X[p] ?? 54, X[n] ?? 54, tr);

    return {
      fig: lookPose(s, x, STAND_Y, K_FIG, DIRS[n] ?? 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      // How many plates are on the table, and which one is lit. Both carried, so a tap
      // mid-arrival glides from what is on screen rather than from where it was going.
      up: carry(cv, 0, n, UPTO[p] ?? 0, UPTO[n] ?? 0, soft),
      lit: carry(cv, 1, n, AT[p] ?? -1, AT[n] ?? -1, soft),
      // The verdict tint, so the whole table reacts to an answer rather than only the card.
      said: carry(cv, 2, n, 0, picked ? 1 : 0, soft),
    };
  }, [plates.length, steps.length]);

  const figStyle = useDerivedValue(() => SCENE.value.fig);

  return (
    <>
      <View style={floorStyle(tone, GROUND)} pointerEvents="none" />
      {plates.map((label, k) => (
        <ReviewPlate
          key={label + String(k)}
          label={label}
          slot={k}
          tone={tone}
          lip={lip}
          state={SCENE}
        />
      ))}
      <Stickman D={figStyle as never} k={K_FIG} />
    </>
  );
}

/**
 * ONE IDEA ON THE TABLE.
 *
 * It arrives when the table reaches it and lifts when it is the one being discussed —
 * both off the carried tracks, so a reader tapping through fast sees a glide rather
 * than a pop, and a reader going BACK sees it settle again (group AI).
 */
function ReviewPlate({
  label, slot, tone, lip, state,
}: {
  label: string;
  slot: number;
  tone: StageTone;
  lip: string;
  state: { value: { up: number; lit: number; said: number } };
}) {
  const style = useAnimatedStyle(() => {
    const up = state.value.up;
    const lit = state.value.lit;
    // It arrives as the table reaches it: 0 before, 1 once it is fully on.
    const inAt = clamp01(up - slot);
    // How much this one is the subject, 0…1, from the carried `lit` track — a
    // fraction, so two plates share it while the figure walks between them.
    const near = clamp01(1 - Math.abs(lit - slot));
    return {
      opacity: inAt,
      transform: [
        { translateY: (1 - inAt) * 16 - near * 10 },
        { scale: 0.94 + inAt * 0.06 + near * 0.06 },
      ],
    };
  });
  const capStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + clamp01(1 - Math.abs(state.value.lit - slot)) * 0.45,
  }));
  return (
    <Animated.View style={[styles.slot, { left: SLOT_X[slot] - PLATE_W / 2 }, style]} pointerEvents="none">
      <View style={[styles.plate, { boxShadow: lip }]}>
        <Animated.Text style={[styles.cap, capStyle]} numberOfLines={3}>{label}</Animated.Text>
      </View>
      <View style={[styles.foot, { backgroundColor: tone.SHADE }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  slot: { position: 'absolute', top: PLATE_Y, width: PLATE_W, alignItems: 'center' },
  plate: {
    width: PLATE_W, minHeight: PLATE_H, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 5, paddingVertical: 6,
    backgroundColor: PLATE_FACE, borderWidth: 1.5, borderColor: INK, borderRadius: PLATE_RADIUS,
  },
  cap: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.3,
    color: INK, textAlign: 'center',
  },
  foot: { width: PLATE_W - 14, height: 5, marginTop: 4, borderRadius: 2 },
});
