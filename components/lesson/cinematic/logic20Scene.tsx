import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic20Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE BOARDS SAYING THE SAME THING, ON ONE LEG, THREE LEGS AND FIVE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · THREE BOARDS, 96 wide and 86 tall, at y 254…340, lefts 34 · 152 · 270 — the
//   row ends at x 366. Each carries the SAME sentence, set at the same size, so
//   the only visible difference between them is underneath.
// · the STRUTS are 3-thick uprights from y 340 to y 358, spread across each
//   board's width: ONE under the left board, THREE under the middle, FIVE under
//   the right. That count is the entire argument and it is drawn, not stated.
// · the STRIKE is a 100×8 bar that falls from y 214 onto the left board's top at
//   y 254 and the board rotates 14° off true as it lands. Only the left board
//   ever moves; the other two are untouched for the whole lesson, which is the
//   point being made about what was and was not answered.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the struts
//   end at y 358, so 39 units stay clear at every stop.
//
// Ink runs y 214 (the raised bar) … y 500. BAND 208…512 = 304, which is the
// tallest band in this round and puts the 103-unit figure at 34%. The extra rows
// buy the drop: a blow that starts inside the board it is about to hit is not a
// blow, it is an appearance.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const BOARD_Y = 254;
const BOARD_W = 96;
const BOARD_H = 86;
const BOARD_X = [34, 152, 270];
const BOARD_ID = ['weak', 'said', 'strong'];
/** How many legs each version was left standing on. */
const LEGS = [1, 3, 5];

const STRUT_Y = 340;
const STRUT_H = 18;

const HAMMER_TOP = 214;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const BOARDS = BEATS.map((b) => b.boards ?? 0);
const STRUTS = BEATS.map((b) => b.struts ?? 0);
const STRIKE = BEATS.map((b) => b.strike ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic20'));

export default function Logic20Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      boards: carry(cv, 1, n, BOARDS[p], BOARDS[n], tr),
      struts: carry(cv, 2, n, STRUTS[p], STRUTS[n], tr),
      strike: carry(cv, 3, n, STRIKE[p], STRIKE[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const hammerStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.strike * 3),
    transform: [{ translateY: (BOARD_Y - HAMMER_TOP - 10) * SCENE.value.strike }],
  }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap} pointerEvents="none">ONE CLAIM, THREE TELLINGS</Text>

      {BOARD_X.map((bx, k) => <Board key={BOARD_ID[k]} S={SCENE} index={k} />)}

      <Animated.View style={[styles.hammer, hammerStyle]} pointerEvents="none" />

      {BOARD_X.map((bx, k) => (
        <Target
          key={`t${BOARD_ID[k]}`}
          id={BOARD_ID[k]}
          correct={BOARD_ID[k] === 'weak'}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: bx }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && BOARD_ID[k] === 'weak' && styles.right,
              answered && picked === BOARD_ID[k] && BOARD_ID[k] !== 'weak' && styles.wrong,
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One version, its legs, and — for the flimsy one — the moment it goes over. */
function Board({ S, index }: { S: { value: { boards: number; struts: number; strike: number } }; index: number }) {
  const left = BOARD_X[index];
  const legs: number[] = [];
  for (let l = 0; l < LEGS[index]; l += 1) legs.push(l);
  const gap = BOARD_W / (LEGS[index] + 1);

  const boardStyle = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.boards * 3 - index),
    transform: index === 0
      ? [{ translateY: BOARD_H / 2 }, { rotate: `${S.value.strike * 14}deg` }, { translateY: -BOARD_H / 2 }]
      : [],
  }));
  const strutStyle = useAnimatedStyle(() => ({ opacity: S.value.struts }));

  return (
    <View pointerEvents="none">
      <Animated.View style={[styles.board, { left }, boardStyle]}>
        <Text style={styles.boardText} numberOfLines={4}>
          Screens are making us worse at paying attention
        </Text>
      </Animated.View>
      <Animated.View style={strutStyle}>
        {legs.map((l) => (
          <View key={l} style={[styles.strut, { left: left + gap * (l + 1) - 1.5 }]} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 34, top: 236, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.3, color: SOFT, includeFontPadding: false,
  },

  board: {
    position: 'absolute', top: BOARD_Y, width: BOARD_W, height: BOARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    justifyContent: 'center', paddingHorizontal: 7,
  },
  boardText: {
    fontFamily: 'Inter_500Medium', fontSize: 9, lineHeight: 12, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  strut: { position: 'absolute', top: STRUT_Y, width: 3, height: STRUT_H, backgroundColor: INK },

  hammer: {
    position: 'absolute', left: BOARD_X[0] - 2, top: HAMMER_TOP, width: 100, height: 8,
    backgroundColor: INK, borderRadius: 2,
  },

  hit: { position: 'absolute', top: BOARD_Y, width: BOARD_W, height: BOARD_H },
  hitBox: { width: BOARD_W, height: BOARD_H, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Logic20Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic20Scene} band={[208, 512]} camera={CAM} />;
}
