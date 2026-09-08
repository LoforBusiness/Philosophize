import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic23Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A TRUTH TABLE, DRAWN AS LAMPS RATHER THAN AS LETTERS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · four ROWS at y 296 · 332 · 368 · 404, each 26 tall, spanning x 150…378.
// · three LAMP columns at x 166, 226 and 316 — P, Q and the RESULT — each a disc
//   of 20 across. FILLED is true and HOLLOW is false, which is the only notation
//   in the scene: a reader who can see a lit lamp can read the table without
//   being taught a convention.
// · HEADINGS at y 272: P at 166, Q at 226, and the connective at 300. The
//   connective heading swaps between P OR Q and IF P THEN Q, because the same
//   four rows answer both questions and redrawing them would say otherwise.
// · a RULE under the headings at y 288, x 150…378, so the table has a head.
// · the SEAM on the last question is a 3-wide bar the reader drives across the
//   rows: rows above it are KEPT and rows below are BROKEN, and each row's result
//   lamp follows. R7b — the seam's position is the LEFT side's share, and here the
//   left side is "kept", read top-down.
// · the figure stands at x 44 and walks to 100; his right edge at the walked mark
//   is 125, clear of the table's left edge at 150.
//
// Ink runs y 254 (the caption) … y 500 (ground). BAND 250…512 = 262. The figure is
// 103 units, which is 39.3% — over H58's 38% — so the band opens at 240 instead,
// giving 272 and 37.9%, with the extra units of paper above the caption.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const ROW_Y = [296, 332, 368, 404];
const ROW_N = 4;
const ROW_H = 26;
const TAB_L = 150;
const TAB_R = 378;

const LAMP = 20;
const COL_P = 166;
const COL_Q = 226;
const COL_R = 316;

/** The four rows, in the order a table is always written. */
const P_TRUE = [true, true, false, false];
const Q_TRUE = [true, false, true, false];
/** P or Q — false in one row only, which is the first question. */
const OR = P_TRUE.map((p, k) => p || Q_TRUE[k]);
/** If P then Q — broken in one row only, which is the second. */
const IF = P_TRUE.map((p, k) => !p || Q_TRUE[k]);
const ROW_ID = ['tt', 'tf', 'ft', 'ff'];
/** The only row where OR fails. */
const OR_FALSE = 3;

const HEAD_Y = 272;
const RULE_Y = 288;

const CAP_T = 248;
const FIG_X = 44;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const ROWS = BEATS.map((b) => b.rows ?? 0);
const OR_ON = BEATS.map((b) => (b.orCol ? 1 : 0));
const IF_ON = BEATS.map((b) => (b.ifCol ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic23'));

export default function Logic23Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      rows: carry(cv, 1, n, ROWS[p], ROWS[n], tr),
      orOn: carry(cv, 2, n, OR_ON[p], OR_ON[n], tr),
      ifOn: carry(cv, 3, n, IF_ON[p], IF_ON[n], tr),
      // R7c — the seam IS the reader's answer. `split` reads dragPos, whose 0…1 is
      // the left side's share, so nothing has to be mapped.
      seam: carry(cv, 4, n, 0, reacting ? dragPos.value : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const rowsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rows }));
  const orStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.orOn }));
  const ifStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ifOn }));
  const seamStyle = useAnimatedStyle(() => ({
    opacity: reacting ? 1 : 0,
    top: ROW_Y[0] - 6 + SCENE.value.seam * (ROW_Y[ROW_N - 1] + ROW_H + 6 - (ROW_Y[0] - 6)),
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">EVERY WAY TWO THINGS CAN GO</Text>

      <Animated.View style={[StyleSheet.absoluteFill, rowsStyle]} pointerEvents="none">
        <Text style={[styles.head, { left: COL_P - 20 }]}>P</Text>
        <Text style={[styles.head, { left: COL_Q - 20 }]}>Q</Text>
        <View style={styles.headRule} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, orStyle]} pointerEvents="none">
        <Text style={[styles.head, { left: COL_R - 44, width: 88 }]}>P OR Q</Text>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, ifStyle]} pointerEvents="none">
        <Text style={[styles.head, { left: COL_R - 52, width: 104 }]}>IF P THEN Q</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, rowsStyle]}>
        {ROW_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === OR_FALSE}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { top: ROW_Y[k] }]}
            radius={4}
          >
            <View style={styles.rowRule} pointerEvents="none" />
            <Lamp lit={P_TRUE[k]} left={COL_P - TAB_L} />
            <Lamp lit={Q_TRUE[k]} left={COL_Q - TAB_L} />
            <Result S={SCENE} index={k} orLit={OR[k]} ifLit={IF[k]} />
          </Target>
        ))}
      </Animated.View>

      <Animated.View style={[styles.seam, seamStyle]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One input: filled for true, hollow for false, and nothing else to learn. */
function Lamp({ lit, left }: { lit: boolean; left: number }) {
  return <View style={[lit ? styles.lampOn : styles.lampOff, { left }]} pointerEvents="none" />;
}

/**
 * The result lamp. It reads the OR column until the IF column arrives, and on the
 * last question the SEAM decides it — rows above the seam are kept, rows below it
 * are broken, so the reader's own thumb sorts the table (R7c).
 */
function Result({ S, index, orLit, ifLit }: { S: SharedValue<any>; index: number; orLit: boolean; ifLit: boolean }) {
  const st = useAnimatedStyle(() => {
    const seamRow = S.value.seam * ROW_N;
    const kept = S.value.seam > 0.02 ? index < seamRow : ifLit;
    const on = S.value.ifOn > 0.5 ? kept : orLit;
    return {
      backgroundColor: on ? INK : PAPER,
      opacity: clamp01(S.value.orOn + S.value.ifOn),
    };
  });
  return <Animated.View style={[styles.lampBase, { left: COL_R - TAB_L }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — the subject stands on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 150, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  head: {
    position: 'absolute', top: HEAD_Y, width: 40, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  headRule: { position: 'absolute', left: TAB_L, top: RULE_Y, width: TAB_R - TAB_L, height: 1.5, backgroundColor: RULE },

  hit: { position: 'absolute', left: TAB_L, width: TAB_R - TAB_L, height: ROW_H },
  rowRule: {
    position: 'absolute', left: 0, top: ROW_H - 1, width: TAB_R - TAB_L, height: 1,
    backgroundColor: RULE,
  },

  lampBase: {
    position: 'absolute', top: (ROW_H - LAMP) / 2, width: LAMP, height: LAMP, borderRadius: LAMP / 2,
    borderWidth: 2, borderColor: INK,
  },
  lampOn: {
    position: 'absolute', top: (ROW_H - LAMP) / 2, width: LAMP, height: LAMP, borderRadius: LAMP / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: INK,
  },
  lampOff: {
    position: 'absolute', top: (ROW_H - LAMP) / 2, width: LAMP, height: LAMP, borderRadius: LAMP / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },

  // THE SEAM RUNS ACROSS THE ROWS rather than down them, because what is being
  // divided is the table itself.
  seam: { position: 'absolute', left: TAB_L - 8, width: TAB_R - TAB_L + 16, height: 3, backgroundColor: INK },
});

export function Logic23Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic23Scene} band={[240, 512]} camera={CAM} />;
}
