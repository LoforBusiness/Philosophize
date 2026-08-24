import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics21Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE COLUMNS OF STOCK, EMPTIED, AND ONE VERDICT THAT DIFFERS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · THREE COLUMNS, 104 wide, at x 30 · 148 · 266 — the row ends at x 370. Each is
//   headed at y 234 (A NOVEL · A SYMPHONY · A PAINTING) and holds its stock as
//   slabs between y 252 and y 344.
// · the STOCK is drawn to scale and never abstracted: SIX 104×12 slabs stepping
//   14 for the novel, FOUR for the symphony, and ONE 104×92 slab for the
//   painting. The painting's single object filling the whole column height is
//   the picture's first argument, made before a word about it.
// · DESTRUCTION runs left to right across all three columns on one track, so no
//   column is treated more gently than another. A destroyed slab collapses to
//   0 height rather than fading: a faint slab would read as a damaged copy.
// · the VERDICT PLATES are 104×22 at y 352…374, one under each column: STILL
//   EXISTS, STILL EXISTS, GONE. They are the only ink below the stock.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, plates end at
//   374, so 23 units stay clear — tight, and the reason the plates are two words.
//
// Ink runs y 234 (the headings) … y 500. BAND 228…512 = 284, with the 103-unit
// figure at 36%.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const COL_X = [30, 148, 266];
const COL_W = 104;
const COL_ID = ['novel', 'symphony', 'painting'];
const COL_CAP = ['A NOVEL', 'A SYMPHONY', 'A PAINTING'];
const COL_VERDICT = ['STILL EXISTS', 'STILL EXISTS', 'GONE'];
/** How many objects each work has, and how tall each one is drawn. */
const STOCK = [6, 4, 1];
const SLAB_H = [12, 12, 92];
const SLAB_STEP = [14, 14, 0];

const STOCK_TOP = 252;
const PLATE_Y = 352;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const WORKS = BEATS.map((b) => b.works ?? 0);
const BURN = BEATS.map((b) => b.burn ?? 0);
const GONE = BEATS.map((b) => b.gone ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics21'));

export default function Aesthetics21Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
      works: carry(cv, 1, n, WORKS[p], WORKS[n], tr),
      burn: carry(cv, 2, n, BURN[p], BURN[n], tr),
      gone: carry(cv, 3, n, GONE[p], GONE[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const goneStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gone }));

  return (
    <View style={styles.scene}>
      {COL_X.map((cx, k) => (
        <Text key={`c${k}`} style={[styles.cap, { left: cx }]} numberOfLines={1}>{COL_CAP[k]}</Text>
      ))}

      {COL_X.map((cx, k) => <Column key={COL_ID[k]} S={SCENE} col={k} />)}

      <Animated.View style={[StyleSheet.absoluteFill, goneStyle]} pointerEvents="none">
        {COL_X.map((cx, k) => (
          <View key={`v${k}`}>
            <View style={[styles.plate, { left: cx }, k === 2 && styles.plateGone]} />
            <Text style={[styles.plateText, { left: cx }, k === 2 && styles.plateTextGone]}>
              {COL_VERDICT[k]}
            </Text>
          </View>
        ))}
      </Animated.View>

      {COL_X.map((cx, k) => (
        <Target
          key={`t${COL_ID[k]}`}
          id={COL_ID[k]}
          correct={COL_ID[k] === 'painting'}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: cx }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && COL_ID[k] === 'painting' && styles.right,
              answered && picked === COL_ID[k] && COL_ID[k] !== 'painting' && styles.wrong,
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

/** One work's stock, emptied left to right on the shared destruction track. */
function Column({ S, col }: { S: { value: { works: number; burn: number } }; col: number }) {
  const left = COL_X[col];
  const slabs: number[] = [];
  for (let s = 0; s < STOCK[col]; s++) slabs.push(s);
  return (
    <View pointerEvents="none">
      {slabs.map((s) => <Slab key={s} S={S} col={col} index={s} left={left} />)}
    </View>
  );
}

function Slab({
  S, col, index, left,
}: { S: { value: { works: number; burn: number } }; col: number; index: number; left: number }) {
  const top = STOCK_TOP + index * SLAB_STEP[col];
  const full = SLAB_H[col];
  const st = useAnimatedStyle(() => {
    // Each column empties over the same 0…1, so a six-deep stock and a one-deep
    // one finish together and the comparison is about what is LEFT, not speed.
    const u = clamp01(S.value.burn * STOCK[col] - index);
    return {
      opacity: clamp01(S.value.works * 3 - col),
      height: full * (1 - u),
    };
  });
  return <Animated.View style={[styles.slab, { left, top }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', top: 234, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
  slab: {
    position: 'absolute', width: COL_W,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },

  plate: {
    position: 'absolute', top: PLATE_Y, width: COL_W, height: 22,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: PAPER,
  },
  plateGone: { borderColor: INK, borderWidth: 2, backgroundColor: INK },
  plateText: {
    position: 'absolute', top: PLATE_Y + 7, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
  plateTextGone: { color: PAPER },

  hit: { position: 'absolute', top: STOCK_TOP, width: COL_W, height: 92 },
  hitBox: { width: COL_W, height: 92, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Aesthetics21Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics21Scene} band={[228, 512]} camera={CAM} />;
}
