import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic25Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A positive test result and the two bars underneath it, stage right.
//
// · figure WALKS x = 70 → 168 → 124; widest body span x 132…204 at 168, fist to
//   204.5 at gesture 41. All chart ink is at x ≥ 216.
// · result card y 226…262 · the two bars y 284…350 · answer row y 366…398.
//   Crown is y 397 and the answer row is level with it, at an x the figure never has.
// · A5 — the chart is out of reach (hand tops out at y 411, B11b); it is read, not
//   handled, and no beat claims contact.
//
// THE BARS ARE DRAWN FROM THE SAME UNIT. `BAR_UNIT` is one person, and both widths
// are a count times that unit — so "one against a hundred" is a fact about the
// arithmetic rather than two numbers I picked to look right. It is the whole lesson,
// so it must not be possible to nudge one bar without the other.

const CH_L = 216;
const CH_W = 176;

const RES_T = 226;
const RES_H = 36;

const REAL_N = 1;
const FAKE_N = 100;
/** One person, in stage units. 100 of them is the full chart width. */
const BAR_UNIT = CH_W / FAKE_N;
/** A one-unit bar is 1.76 wide and would vanish at a stroke weight of 2. This is
 *  the minimum ink that still renders as a bar — and the caption states the true
 *  ratio, so the picture rounds UP against its own argument rather than for it. */
const BAR_MIN = 3;

const ROW1_T = 284;
const ROW2_T = 322;
const BAR_H = 18;
const LAB_DY = -12;

const ANS_T = 366;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (CH_W - 2 * ANS_GAP) / 3;

const ANSWERS = [
  { id: 'few', label: '1 IN 101', correct: true },
  { id: 'most', label: '99 IN 100', correct: false },
  { id: 'half', label: '1 IN 2', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic25'));
const DIR = dirsFrom(X, 1);
const RES = BEATS.map((b) => b.result ?? 0);
const REAL = BEATS.map((b) => b.real ?? 0);
const FAKE = BEATS.map((b) => b.fake ?? 0);

export default function Logic25Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const resFade = (cur.result ?? 0) !== (prev?.result ?? 0);
  const realFade = (cur.real ?? 0) !== (prev?.real ?? 0);
  const fakeFade = (cur.fake ?? 0) !== (prev?.fake ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      result: lerp(RES[p], RES[n], tr) * (resFade ? grow : 1),
      real: lerp(REAL[p], REAL[n], realFade ? grow : tr),
      fake: lerp(FAKE[p], FAKE[n], fakeFade ? grow : tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const resStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.result }));
  // Each bar GROWS from the left rather than fading, so the reader watches the
  // hundred run away from the one.
  const realStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.real,
    width: Math.max(BAR_MIN, REAL_N * BAR_UNIT) * SCENE.value.real,
  }));
  const fakeStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.fake,
    width: FAKE_N * BAR_UNIT * SCENE.value.fake,
  }));
  const realLab = useAnimatedStyle(() => ({ opacity: SCENE.value.real }));
  const fakeLab = useAnimatedStyle(() => ({ opacity: SCENE.value.fake }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[styles.result, resStyle]} pointerEvents="none">
        <Text style={styles.resultText} numberOfLines={1}>THE TEST SAYS POSITIVE</Text>
      </Animated.View>

      <Animated.Text style={[styles.barLab, { top: ROW1_T + LAB_DY }, realLab]} numberOfLines={1} pointerEvents="none">
        ACTUALLY ILL  ·  1
      </Animated.Text>
      <Animated.View style={[styles.bar, { top: ROW1_T }, realStyle]} pointerEvents="none" />

      <Animated.Text style={[styles.barLab, { top: ROW2_T + LAB_DY }, fakeLab]} numberOfLines={1} pointerEvents="none">
        FALSE ALARM  ·  100
      </Animated.Text>
      <Animated.View style={[styles.bar, { top: ROW2_T }, fakeStyle]} pointerEvents="none" />

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { left: CH_L + k * (ANS_W + ANS_GAP) }]} hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }} disabled={answered}>
              <View
                style={[
                  styles.ansInner,
                  answered && a.correct && styles.pickRight,
                  answered && chosen && !a.correct && styles.pickWrong,
                ]}
              >
                <Text
                  style={[styles.ansText, answered && a.correct && styles.onInk]}
                  numberOfLines={1}
                >
                  {a.label}
                </Text>
              </View>
            </Target>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  result: {
    position: 'absolute', left: CH_L, top: RES_T, width: CH_W, height: RES_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  resultText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 0.6, color: PAPER,
    includeFontPadding: false,
  },

  barLab: {
    position: 'absolute', left: CH_L, width: CH_W,
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1, color: SOFT,
    includeFontPadding: false,
  },
  bar: { position: 'absolute', left: CH_L, height: BAR_H, backgroundColor: INK, borderRadius: 1 },

  ans: { position: 'absolute', top: ANS_T, width: ANS_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the result card (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Logic25Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic25Scene} band={[220, 512]} camera={CAM} />;
}
