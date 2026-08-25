import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political16Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ONE WORKER, FOUR CORDS, AND THE CORDS BEING CUT (H64). Every one of them runs
// from the same trunk beside him, so the four severings are visibly four and
// visibly his.
//
// · the TRUNK is x 104…108, y 268…446 — a spine beside the figure.
// · four BRANCHES run from x 108 to x 168 at the mid-height of each card:
//   y 272 / 328 / 384 / 440. A cut branch shrinks toward the trunk and leaves a
//   severed stub at x 108…122.
// · the four CARDS are 218 × 44 at x 168…386, tops y 250 / 306 / 362 / 418. The
//   lowest ends at y 462, thirty-eight above the ground line.
// · the label sits at y 228…244, the highest ink.
// · the figure stands at x = 50 facing right. Widest ink is a fist at x ≈ 83,
//   twenty-one units clear of the trunk, and his crown is y 397 — level with the
//   third card and well left of every one of them (D23).
//
// Band 222…512 = 290, holding one figure at 36% of the frame (check:scale).

const FIG_X = 50;

const LABEL_T = 228;
const TRUNK_X = 104;
const BRANCH_L = 108;
const BRANCH_R = 168;

const CARD_L = 168;
const CARD_W = 218;
const CARD_H = 44;
const CARD_T = [250, 306, 362, 418];

const CORDS = [
  { id: 'product', text: 'THE THING YOU MADE', correct: false },
  { id: 'process', text: 'THE WORK ITSELF', correct: true },
  { id: 'self', text: 'WHAT YOU COULD HAVE BEEN', correct: false },
  { id: 'others', text: 'THE PEOPLE BESIDE YOU', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const CORDN = BEATS.map((b) => b.cords ?? 0);
const CUT = BEATS.map((b) => b.cut ?? 0);
const PICKV = BEATS.map((b) => b.pick ?? 0);

const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political16'));

export default function Political16Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];

  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);
    // Cords part one at a time rather than all together — four cuts in a fifth of
    // a second is a cut of a different kind.
    const part = ease01(bt.value / 1.5);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      cords: carry(cv, 0, n, CORDN[p], CORDN[n], grow),
      cut: carry(cv, 1, n, CUT[p], CUT[n], part),
      pick: carry(cv, 2, n, PICKV[p], PICKV[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const trunk = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.cords) }));

  return (
    <Animated.View style={styles.scene}>
      <Text style={styles.label} numberOfLines={1}>WHAT THE WORK JOINS YOU TO</Text>

      <Animated.View style={[styles.trunk, trunk]} pointerEvents="none" />

      {CORDS.map((c, k) => (
        <Cord key={c.id} k={k} SCENE={SCENE} live={live} answered={answered} picked={picked} onPick={onPick} />
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One thing the work joined you to, and the cord that did the joining. */
function Cord({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { cords: number; cut: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const c = CORDS[k];
  const on = answered && c.correct;

  const branch = useAnimatedStyle(() => {
    const there = clamp01(SCENE.value.cords - k);
    const gone = clamp01(SCENE.value.cut - k);
    // The branch retracts toward the card, leaving the trunk-side stub behind.
    return { opacity: there, transform: [{ scaleX: 1 - 0.72 * gone }] };
  });
  const stub = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.cut - k) }));
  const card = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.cords - k);
    const gone = clamp01(SCENE.value.cut - k);
    return { opacity: a * (1 - 0.42 * gone), transform: [{ translateX: (1 - a) * 14 + gone * 8 }] };
  });

  return (
    <>
      <Animated.View
        style={[styles.branch, { top: CARD_T[k] + CARD_H / 2 - 1.5 }, branch]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.stub, { top: CARD_T[k] + CARD_H / 2 - 1.5 }, stub]}
        pointerEvents="none"
      />
      <Animated.View style={[styles.card, { top: CARD_T[k] }, card]}>
        <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
                style={styles.fill} disabled={!live || answered}>
          <View style={[
            styles.cardInner,
            on && styles.pickRight,
            answered && picked === c.id && !c.correct && styles.pickWrong,
          ]}>
            <Text style={[styles.cardText, on && styles.onInk]} numberOfLines={1}>{c.text}</Text>
          </View>
        </Target>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  label: {
    position: 'absolute', left: 20, top: LABEL_T, width: 360,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  trunk: { position: 'absolute', left: TRUNK_X, top: 268, width: 4, height: 178, backgroundColor: INK },
  branch: {
    position: 'absolute', left: BRANCH_L, width: BRANCH_R - BRANCH_L, height: 3,
    backgroundColor: INK, transformOrigin: '100% 50%',
  },
  // What is left on the trunk when a cord is cut — a short frayed end.
  stub: { position: 'absolute', left: BRANCH_L, width: 14, height: 3, backgroundColor: SOFT },

  card: { position: 'absolute', left: CARD_L, width: CARD_W, height: CARD_H },
  cardInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.9, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the label (228) to the lowest card (462). Band 222…512 = 290.
export function Political16Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political16Scene} band={[222, 512]} camera={CAM} />;
}
