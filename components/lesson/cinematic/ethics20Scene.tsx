import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics20Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// SEVEN HARMS ON A HORIZON, AND A DIAL THAT ONLY CHANGES THE DRAWING.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the HORIZON is a 1.5-thick rule at y 348, x 30…374, and every block stands on
//   it. It is the only baseline in the picture, so a shorter block is obviously
//   shorter rather than merely lower.
// · SEVEN BLOCKS, 34 wide, lefts 40 · 88 · 136 · 184 · 232 · 280 · 328 — the run
//   ends at x 362. Full height is 96, so a block at full size runs y 252…348.
// · the YEAR LABELS sit under the horizon at y 352…362: NOW · +10 · +25 · +50 ·
//   +100 · +200 · +500. They are the only numbers on the stage.
// · the TRUE SIZE is a 1-thick dashed outline at the full 96, drawn over whatever
//   the discount has left. It is never a second colour and never a fill: it is
//   the same rectangle the block would have been.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397 and the year
//   labels end at 362, so 35 units stay clear.
//
// Ink runs y 236 (the caption) … y 500. BAND 230…512 = 282, with the 103-unit
// figure at 37%.
//
// THE DISCOUNT IS APPLIED TO HEIGHT, NOT OPACITY, and that is the argument rather
// than a style choice: a faded block still looks like a whole harm seen dimly,
// which is exactly the thing being denied. A short one has been made smaller.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const HORIZON = 348;
const BLOCK_W = 34;
const BLOCK_FULL = 96;
const BLOCK_X = [40, 88, 136, 184, 232, 280, 328];
const YEARS = ['NOW', '+10', '+25', '+50', '+100', '+200', '+500'];
/** How far into the future each block stands, 0…1 — what the rate is applied to. */
const FAR = [0, 0.08, 0.18, 0.34, 0.58, 0.8, 1];

const CAP_Y = 236;
const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BLOCKS = BEATS.map((b) => b.blocks ?? 0);
const RATE = BEATS.map((b) => b.rate ?? 0);
const TRUTH = BEATS.map((b) => b.truth ?? 0);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics20'));

export default function Ethics20Scene({ clock, bt, bi, dragPos }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
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

    const scripted = carry(cv, 1, n, RATE[p], RATE[n], tr);
    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      blocks: carry(cv, 2, n, BLOCKS[p], BLOCKS[n], tr),
      // One value, two sources, and the picture never disagrees with whichever
      // is in charge: the reader's thumb on its own beat, the script's track
      // everywhere else.
      rate: LIVE_D[n] === 1 ? clamp01(dragPos.value) : scripted,
      truth: carry(cv, 3, n, TRUTH[p], TRUTH[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const blocks = [0, 1, 2, 3, 4, 5, 6];

  return (
    <View style={styles.scene}>
      <Text style={styles.cap} pointerEvents="none">THE SAME HARM, SEVEN TIMES</Text>
      <View style={styles.horizon} pointerEvents="none" />
      {blocks.map((k) => <Harm key={k} S={SCENE} index={k} />)}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One harm. Its drawn height is the full height less whatever the rate takes off
 * for how far away it is — so the NOW block never moves however hard the dial is
 * turned, which is the control the picture needs to be honest.
 */
function Harm({ S, index }: { S: { value: { blocks: number; rate: number; truth: number } }; index: number }) {
  const left = BLOCK_X[index];
  const far = FAR[index];
  const bodyStyle = useAnimatedStyle(() => {
    const shown = BLOCK_FULL * (1 - S.value.rate * far);
    return { height: shown, top: HORIZON - shown, opacity: clamp01(S.value.blocks * 7 - index) };
  });
  const trueStyle = useAnimatedStyle(() => ({ opacity: S.value.truth }));
  return (
    <View pointerEvents="none">
      <Animated.View style={[styles.block, { left }, bodyStyle]} />
      <Animated.View style={[styles.trueBox, { left }, trueStyle]} />
      <Text style={[styles.year, { left }]} pointerEvents="none">{YEARS[index]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 40, top: CAP_Y, width: 260,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  horizon: { position: 'absolute', left: 30, top: HORIZON, width: 344, height: 1.5, backgroundColor: INK },

  block: {
    position: 'absolute', width: BLOCK_W,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: STONE,
  },
  trueBox: {
    position: 'absolute', top: HORIZON - BLOCK_FULL, width: BLOCK_W, height: BLOCK_FULL,
    borderWidth: 1, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 2,
  },
  year: {
    position: 'absolute', top: HORIZON + 6, width: BLOCK_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },
});

export function Ethics20Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics20Scene} band={[230, 512]} camera={CAM} />;
}
