import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics21Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE LINE, AND WHICH HALVES OF IT ARE FURNISHED.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the TIMELINE is a 1.5-thick rule at y 300, x 34…366, drawn once and never
//   moved. Nothing in this lesson slides along it, because the question is not
//   about time passing and a sliding line would be a picture of a different
//   argument.
// · EIGHT MOMENT BOXES, 34×36, at y 262…298. Four to the left of now at
//   x 40 · 80 · 120 · 160, four to the right at x 206 · 246 · 286 · 326.
//   Each box is an outline that is always drawn plus a fill that is not: the
//   OUTLINE is where a moment would be, the FILL is whether it is there.
// · the NOW COLUMN is 28×56 at x 186…214, y 252…308, 2.5 thick, and it is the
//   only thing on the stage that is never emptied. It straddles the rule by 8
//   units each way so it reads as a place rather than a ninth box.
// · the two LABELS sit at y 238, 8pt, hard against the ends of the line.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest furniture is the now column at y 308, so 89 units stay clear. He is
//   standing ON the line's now, which is the whole conceit.
//
// Ink runs y 238 (the labels) … y 500. BAND 232…512 = 280, with the 103-unit
// figure at 36.8%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const LINE_Y = 300;
const LINE_L = 34;
const LINE_R = 366;

const BOX_Y = 262;
const BOX_W = 34;
const BOX_H = 36;
const PAST_X = [40, 80, 120, 160];
const FUT_X = [206, 246, 286, 326];

const NOW_X = 186;
const NOW_W = 28;
const NOW_Y = 252;
const NOW_H = 56;

const LABEL_Y = 238;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const LINE = BEATS.map((b) => b.line ?? 0);
const PAST = BEATS.map((b) => b.past ?? 0);
const FUT = BEATS.map((b) => b.future ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// On its own field beat the reader is not placing a token beside a picture,
// they are FURNISHING THE LINE: x is the past half, y is the future half, and
// the two axes were chosen so that the pad and the stage are the same two
// questions (R7). Everywhere else the script's own track is in charge.
const PULL = BEATS.map((b) => (b.interact?.field ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics21'));

export default function Metaphysics21Scene({
  clock, bt, bi, i, picked, onPick, dragPos, dragPos2,
}: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
  const pulling = PULL[i] === 1;
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
      line: carry(cv, 1, n, LINE[p], LINE[n], tr),
      // Through `carry`, not around it: a bare `pulling ? drag : carry` swaps the
      // value on the single frame the beat changes, which is the same pop L1/L5
      // exist to stop and which no checker measures on a non-limb track.
      past: carry(cv, 2, n, PAST[p], pulling ? dragPos.value : PAST[n], tr),
      future: carry(cv, 3, n, FUT[p], pulling ? dragPos2.value : FUT[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const lineStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.line }));
  const pastFill = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.past) }));
  const futFill = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.future) }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, lineStyle]} pointerEvents="none">
        <View style={styles.rule} />
        <Text style={[styles.label, { left: LINE_L + 4 }]}>THE PAST</Text>
        {/* NOW IS NAMED TOO. The timeline labelled its two ends and left the present
            moment blank — and the present moment is the answer, so the reader was
            asked to tap the one part of the picture with nothing written on it. */}
        <Text style={[styles.label, styles.labelNow]}>NOW</Text>
        <Text style={[styles.label, styles.labelR]}>THE FUTURE</Text>

        {/* Where a moment WOULD be — always drawn. */}
        {PAST_X.map((bx) => <View key={`po${bx}`} style={[styles.box, { left: bx }]} />)}
        {FUT_X.map((bx) => <View key={`fo${bx}`} style={[styles.box, { left: bx }]} />)}
      </Animated.View>

      {/* Whether it is THERE — the only thing that changes. */}
      <Animated.View style={[StyleSheet.absoluteFill, pastFill]} pointerEvents="none">
        {PAST_X.map((bx) => <View key={`pf${bx}`} style={[styles.fill, { left: bx + 4 }]} />)}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, futFill]} pointerEvents="none">
        {FUT_X.map((bx) => <View key={`ff${bx}`} style={[styles.fill, { left: bx + 4 }]} />)}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, lineStyle]} pointerEvents="none">
        <View style={styles.now} />
        <Text style={styles.nowText}>NOW</Text>
      </Animated.View>

      <Target
        id="past" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: LINE_L, width: 144 }]}
      >
        <View style={[styles.hitBox, { width: 144 }, answered && picked === 'past' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="now" correct picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: NOW_X - 2, top: NOW_Y, width: NOW_W + 4, height: NOW_H }]}
      >
        <View style={[styles.hitBox, { width: NOW_W + 4, height: NOW_H }, answered && styles.right]} pointerEvents="none" />
      </Target>
      <Target
        id="future" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: 222, width: 144 }]}
      >
        <View style={[styles.hitBox, { width: 144 }, answered && picked === 'future' && styles.wrong]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
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

  rule: {
    position: 'absolute', left: LINE_L, top: LINE_Y, width: LINE_R - LINE_L, height: 1.5, backgroundColor: INK,
  },
  label: {
    position: 'absolute', top: LABEL_Y,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
  labelR: { left: LINE_R - 60, width: 56, textAlign: 'right' },
  labelNow: { left: NOW_X - 12, width: NOW_W + 24, textAlign: 'center' },

  box: {
    position: 'absolute', top: BOX_Y, width: BOX_W, height: BOX_H,
    borderWidth: 1.2, borderColor: SOFT, borderRadius: 2, backgroundColor: STONE,
  },
  fill: {
    position: 'absolute', top: BOX_Y + 4, width: BOX_W - 8, height: BOX_H - 8,
    backgroundColor: INK, borderRadius: 1.5,
  },

  now: {
    position: 'absolute', left: NOW_X, top: NOW_Y, width: NOW_W, height: NOW_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  nowText: {
    position: 'absolute', left: NOW_X, top: NOW_Y + 23, width: NOW_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: BOX_Y, height: BOX_H },
  hitBox: { height: BOX_H, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Metaphysics21Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics21Scene} band={[232, 512]} camera={CAM} />;
}
