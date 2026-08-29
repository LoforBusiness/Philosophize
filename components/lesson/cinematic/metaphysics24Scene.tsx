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
import { BEATS } from './metaphysics24Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A pile of grains and the verdict lamp above it. Stage right.
//
// · figure WALKS x = 70 → 168 → 124; widest span x 132…204 at 168, fist to 204.5.
//   All pile ink is at x ≥ 216.
// · counter y 226…252 · pile y 268…342 (three rows, widest at the bottom) ·
//   lamp y 356…392 · answer row y 406…438. A standing crown is y 397.
// · A5 — the pile is out of reach (hand tops out at y 411, B11b); it is a diagram
//   being read, and no beat's text says the figure touches a grain.
//
// THE LAMP HAS NO "OFF" STATE. There is no style, no channel and no beat in this
// lesson that can darken it — which is the argument. If a later edit wants to turn
// it off it has to add the ability first, and that is the moment to ask which grain.

const PL_L = 216;
const PL_W = 176;

const CNT_T = 226;
const CNT_H = 26;

/** Three rows, 9 / 6 / 3, drawn bottom-heavy so it reads as a pile. */
const ROWS = [9, 6, 3];
const TOTAL = 18;
const G = 14;
const G_GAP = 5;
const PILE_BOT = 342;
const ROW_H = 24;

const LAMP_T = 356;
const LAMP_H = 36;

const ANS_T = 406;
const ANS_H = 32;
const ANS_GAP = 5;
const ANS_W = (PL_W - 2 * ANS_GAP) / 3;

const ANSWERS = [
  { id: 'none', label: 'NONE', correct: true },
  { id: 'hundred', label: 'THE 100th', correct: false },
  { id: 'last', label: 'THE LAST', correct: false },
];

/** Grain k's position. Index 0 is the top of the pile, so grains leave from the top. */
function grainPos(k: number) {
  let i = k, row = 2;
  for (let r = 2; r >= 0; r--) {
    if (i < ROWS[r]) { row = r; break; }
    i -= ROWS[r];
  }
  const n = ROWS[row];
  const rowW = n * G + (n - 1) * G_GAP;
  return {
    left: PL_L + (PL_W - rowW) / 2 + i * (G + G_GAP),
    top: PILE_BOT - (row + 1) * ROW_H,
  };
}

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 124);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics24'));
const DIR = dirsFrom(X, 1);
const GRAINS = BEATS.map((b) => b.grains ?? 0);
const LAMP = BEATS.map((b) => b.lamp ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

export default function Metaphysics24Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const lampFade = (cur.lamp ?? 0) !== (prev?.lamp ?? 0);
  const shown = cur.grains ?? 0;

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
      // Fractional so grains leave one at a time across the transition rather than
      // the pile jumping between two counts.
      left: carry(cv, 1, n, GRAINS[p], GRAINS[n], grow),
      // R7b — the drawn curve lights the HEAP lamp. `pos` on a plot is the mean height
      // of the reader's line, so the verdict brightens with how much of a heap they
      // have said it is — and the vague middle is exactly where it half-glows.
      lamp: carry(cv, 2, n, LAMP[p], reacting ? dragPos.value : LAMP[n], lampFade ? grow : tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const lampStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lamp }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.counter} pointerEvents="none">
        <Text style={styles.counterText} numberOfLines={1}>GRAINS LEFT · {shown}</Text>
      </View>

      {Array.from({ length: TOTAL }, (_, k) => (
        <Grain key={k} index={k} SCENE={SCENE} />
      ))}

      <Animated.View style={[styles.lamp, lampStyle]} pointerEvents="none">
        <Text style={styles.lampText} numberOfLines={1}>STILL A HEAP</Text>
      </Animated.View>

      {showPick &&
        ANSWERS.map((a, k) => {
          const chosen = picked === a.id;
          return (
            <Target id={a.id} correct={a.correct} picked={picked} onPick={onPick}
              key={a.id} style={[styles.ans, { left: PL_L + k * (ANS_W + ANS_GAP) }]} hitSlop={{ top: 6, bottom: 6, left: ANS_GAP / 2, right: ANS_GAP / 2 }} disabled={answered}>
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

/** One grain. Present while the count is above its index; leaves upward. */
function Grain({ index, SCENE }: { index: number; SCENE: { value: { left: number } } }) {
  const pos = grainPos(index);
  const st = useAnimatedStyle(() => {
    const a = Math.max(0, Math.min(1, SCENE.value.left - index));
    return { opacity: a, transform: [{ translateY: (1 - a) * -10 }, { scale: 0.6 + 0.4 * a }] };
  });
  return <Animated.View style={[styles.grain, { left: pos.left, top: pos.top }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  counter: {
    position: 'absolute', left: PL_L, top: CNT_T, width: PL_W, height: CNT_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  counterText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },

  grain: {
    position: 'absolute', width: G, height: G, borderRadius: G / 2, backgroundColor: INK,
  },

  lamp: {
    position: 'absolute', left: PL_L, top: LAMP_T, width: PL_W, height: LAMP_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  lampText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1.4, color: PAPER,
    includeFontPadding: false,
  },

  ans: { position: 'absolute', top: ANS_T, width: ANS_W },
  ansInner: {
    height: ANS_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  ansText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0, color: INK,
    includeFontPadding: false,
  },
  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the counter (226) to the ground line (500). Band 220…512 = 292 (H59).
export function Metaphysics24Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics24Scene} band={[220, 512]} camera={CAM} />;
}
