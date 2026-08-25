import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics20Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A FRAME WITH A GRID OF FRAMES IN IT, AND A CENSUS AT THE FOOT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the OUTER FRAME is 320×112 at x 40…360, y 240…352, 2.5 thick — the heaviest
//   line on the stage, because it is the one thing the argument concedes.
// · the GRID inside is 8 × 3 cells, each 32×26, starting at x 56, y 254, with a
//   6 gap — so the block runs x 56…350 and y 254…338 and stays 10 inside the
//   frame on every edge. They light in reading order as `nest` rises.
// · the TALLY sits under the frame at y 360…372: REAL 1 on the left at x 40, and
//   SIMULATED 24 on the right at x 250, both left of the count they name.
// · the TOKEN is a 12px ring. It falls from y 228 to its resting place at
//   (x 232, y 300) — the middle of the grid, which is where a randomly placed
//   mind lands when almost every mind is in there. It is a RING, not a disc, so
//   it reads as the reader's marker and not as another cell.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the tally
//   ends at 372, so 25 units stay clear — the tightest gap in these eighteen, and
//   the reason the tally is two short words rather than a row.
//
// Ink runs y 228 (the falling token) … y 500. BAND 222…512 = 290, with the
// 103-unit figure at 35%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const OUT_X = 40;
const OUT_Y = 240;
const OUT_W = 320;
const OUT_H = 112;

const CELL_W = 32;
const CELL_H = 26;
const CELL_GAP = 6;
const COLS = 8;
const ROWS = 3;
const GRID_X = 56;
const GRID_Y = 254;

const TALLY_Y = 360;
const TOKEN_D = 12;
const TOKEN_X = 232;
const TOKEN_TOP = 228;
const TOKEN_REST = 300;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const OUTER = BEATS.map((b) => b.outer ?? 0);
const NEST = BEATS.map((b) => b.nest ?? 0);
const TALLY = BEATS.map((b) => b.tally ?? 0);
const TOKEN = BEATS.map((b) => b.token ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics20'));

export default function Metaphysics20Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      outer: carry(cv, 1, n, OUTER[p], OUTER[n], tr),
      nest: carry(cv, 2, n, NEST[p], NEST[n], tr),
      tally: carry(cv, 3, n, TALLY[p], TALLY[n], tr),
      token: carry(cv, 4, n, TOKEN[p], TOKEN[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const outStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.outer }));
  const tallyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tally }));
  const tokenStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.token,
    transform: [{ translateY: (TOKEN_REST - TOKEN_TOP) * SCENE.value.token }],
  }));

  const cells: number[] = [];
  for (let c = 0; c < COLS * ROWS; c++) cells.push(c);

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, outStyle]}>
        <View style={styles.outer} pointerEvents="none" />
        <Text style={styles.outCap}>BASE REALITY</Text>
        {cells.map((c) => <Cell key={c} S={SCENE} index={c} />)}

        {/* The outer frame is a target too, and it is the one most readers reach
            for. Its hit box is the MARGIN of the frame, not its whole area, or it
            would sit on top of the grid and swallow the other answer. */}
        <Target
          id="real" correct={false} picked={picked} onPick={onPick}
          disabled={!live || answered} style={styles.realHit}
        >
          <View style={[styles.realHitBox, answered && picked === 'real' && styles.wrong]} pointerEvents="none" />
        </Target>
        <Target
          id="sim" correct picked={picked} onPick={onPick}
          disabled={!live || answered} style={styles.simHit}
        >
          <View style={[styles.simHitBox, answered && styles.right]} pointerEvents="none" />
        </Target>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, tallyStyle]} pointerEvents="none">
        <Text style={[styles.tally, { left: OUT_X }]}>REAL  1</Text>
        <Text style={[styles.tally, { left: 250 }]}>SIMULATED  24</Text>
      </Animated.View>

      <Animated.View style={[styles.token, tokenStyle]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One simulated world. They light in reading order, so the count is watchable. */
function Cell({ S, index }: { S: { value: { nest: number } }; index: number }) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const left = GRID_X + col * (CELL_W + CELL_GAP);
  const top = GRID_Y + row * (CELL_H + CELL_GAP);
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.nest * (COLS * ROWS) - index) }));
  return <Animated.View pointerEvents="none" style={[styles.cell, { left, top }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  outer: {
    position: 'absolute', left: OUT_X, top: OUT_Y, width: OUT_W, height: OUT_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  outCap: {
    position: 'absolute', left: OUT_X + 6, top: OUT_Y - 12, width: 140,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.3, color: SOFT, includeFontPadding: false,
  },
  cell: {
    position: 'absolute', width: CELL_W, height: CELL_H,
    borderWidth: 1, borderColor: SOFT, borderRadius: 2, backgroundColor: PAPER,
  },

  tally: {
    position: 'absolute', top: TALLY_Y, width: 130,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1, color: INK, includeFontPadding: false,
  },

  token: {
    position: 'absolute', left: TOKEN_X, top: TOKEN_TOP, width: TOKEN_D, height: TOKEN_D,
    borderRadius: TOKEN_D / 2, borderWidth: 2.5, borderColor: INK,
  },

  realHit: { position: 'absolute', left: OUT_X, top: OUT_Y, width: OUT_W, height: 14 },
  realHitBox: { width: OUT_W, height: 14, borderRadius: 3 },
  simHit: { position: 'absolute', left: GRID_X, top: GRID_Y, width: 294, height: 84 },
  simHitBox: { width: 294, height: 84, borderRadius: 3 },

  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Metaphysics20Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics20Scene} band={[222, 512]} camera={CAM} />;
}
