import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political19Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO PANELS OVER ONE AXIS. THE TOP LINE IS FLAT AND THE BOTTOM ONE IS NOT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO PANELS, 320 wide at x 40…360, stacked: WHAT IT COSTS YOU at y 240…292 and
//   WHAT YOU FEEL YOU MUST DO at y 300…352. Same width, same left edge, same
//   x scale — they have to be read against each other, so nothing about the
//   frames may differ.
// · the AXIS is shared and sits once, under the lower panel at y 356: AT YOUR
//   FEET at x 40 and 8,000 MILES ending at x 360. One axis for both panels is the
//   claim that it is one variable.
// · the LINES are eight segments each, plotted across x 52…348.
//   COST is `[.72,.72,.71,.72,.71,.72,.71,.72]` — flat to within a pixel, and
//   deliberately not perfectly flat, because a ruler-straight line reads as a
//   drawn rule rather than as data.
//   PULL is `[.86,.72,.5,.3,.18,.1,.06,.04]`.
// · the MARKER is a 2-thick vertical at x 96 through BOTH panels, labelled YOU —
//   one mark crossing both, so the reader's position is a single fact.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, the axis
//   labels end at y 366, so 31 units stay clear.
//
// Ink runs y 228 (the panel captions) … y 500. BAND 222…512 = 290, with the
// 103-unit figure at 35%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PAN_X = 40;
const PAN_W = 320;
const PAN_H = 44;
const PAN_TOP = [240, 300];
const PAN_CAP = ['WHAT IT COSTS YOU', 'WHAT YOU FEEL YOU MUST DO'];
const PAN_ID = ['cost', 'pull'];

const COST = [0.72, 0.72, 0.71, 0.72, 0.71, 0.72, 0.71, 0.72];
const PULL = [0.86, 0.72, 0.5, 0.3, 0.18, 0.1, 0.06, 0.04];

const PLOT_X = 52;
const PLOT_W = 296;
const AXIS_Y = 356;
const MARK_X = 96;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const AXIS = BEATS.map((b) => b.axis ?? 0);
const COSTV = BEATS.map((b) => b.cost ?? 0);
const PULLV = BEATS.map((b) => b.pull ?? 0);
const MARK = BEATS.map((b) => b.mark ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political19'));

export default function Political19Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
      axis: carry(cv, 1, n, AXIS[p], AXIS[n], tr),
      cost: carry(cv, 2, n, COSTV[p], COSTV[n], tr),
      pull: carry(cv, 3, n, PULLV[p], PULLV[n], tr),
      mark: carry(cv, 4, n, MARK[p], MARK[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const axisStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.axis }));
  const markStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.mark }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, axisStyle]} pointerEvents="none">
        {/* EACH PANEL RIDES WITH ITS OWN TARGET (E39). */}
        {PAN_TOP.map((ty, k) => (
          <AnswerLift key={`p${k}`} id={PAN_ID[k]} picked={picked} correct={PAN_ID[k] === 'pull'}>
            <Text style={[styles.cap, { top: ty - 12 }]}>{PAN_CAP[k]}</Text>
            <View style={[styles.panel, { top: ty }]} />
          </AnswerLift>
        ))}
        <View style={styles.axis} />
        <Text style={[styles.axisLab, { left: PAN_X }]}>AT YOUR FEET</Text>
        <Text style={[styles.axisLab, { left: 260, textAlign: 'right', width: 100 }]}>8,000 MILES</Text>
      </Animated.View>

      {/* THE LINE IS THE PANEL'S OWN DATA, so it rides with it (E39b). Wrapping
          the panel and leaving its plot behind is the exact leak E39b is about:
          seven plotted segments stayed while the frame rose off them. */}
      <AnswerLift id={PAN_ID[0]} picked={picked} correct={false}>
        <Plot S={SCENE} row={0} values={COST} field="cost" />
      </AnswerLift>
      <AnswerLift id={PAN_ID[1]} picked={picked} correct>
        <Plot S={SCENE} row={1} values={PULL} field="pull" />
      </AnswerLift>

      {/* ONE MARK THROUGH BOTH PANELS — the reader stands at one distance. */}
      <Animated.View style={[StyleSheet.absoluteFill, markStyle]} pointerEvents="none">
        {/* TWO SEGMENTS, NOT ONE. A single line from the first panel to the axis
            crossed the gap between them — which is where the lower panel's caption
            lives — and struck straight through WHAT YOU|FEEL. The mark marks the
            PANELS; the gap between them is not part of the claim (D31). */}
        <View style={styles.markLine} />
        <View style={styles.markLineB} />
        <Text style={styles.markCap}>YOU</Text>
      </Animated.View>

      {PAN_TOP.map((ty, k) => (
        <Target
          key={PAN_ID[k]}
          id={PAN_ID[k]}
          correct={PAN_ID[k] === 'pull'}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { top: ty }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && PAN_ID[k] === 'pull' && styles.right,
              answered && picked === PAN_ID[k] && PAN_ID[k] !== 'pull' && styles.wrong,
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

/** One plotted line, drawn left to right as its own track fills. */
function Plot({
  S, row, values, field,
}: {
  S: SharedValue<any>;
  row: number;
  values: readonly number[];
  field: 'cost' | 'pull';
}) {
  const top = PAN_TOP[row];
  const step = PLOT_W / (values.length - 1);
  const yOf = (v: number) => top + 8 + (1 - v) * (PAN_H - 18);
  const segs = values.slice(0, -1).map((_, k) => k);
  return (
    <View pointerEvents="none">
      {segs.map((k) => <Seg key={k} S={S} field={field} index={k} n={segs.length}
        x1={PLOT_X + k * step} y1={yOf(values[k])} y2={yOf(values[k + 1])} step={step} />)}
    </View>
  );
}

function Seg({
  S, field, index, n, x1, y1, y2, step,
}: {
  S: SharedValue<any>;
  field: 'cost' | 'pull';
  index: number; n: number; x1: number; y1: number; y2: number; step: number;
}) {
  const len = Math.hypot(step, y2 - y1);
  const ang = (Math.atan2(y2 - y1, step) * 180) / Math.PI;
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value[field] * n - index) }));
  return (
    <Animated.View
      style={[styles.seg, { left: x1, top: y1, width: len, transform: [{ rotate: `${ang}deg` }] }, st]}
    />
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
    position: 'absolute', left: PAN_X, width: PAN_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  panel: {
    position: 'absolute', left: PAN_X, width: PAN_W, height: PAN_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE,
  },
  seg: {
    position: 'absolute', height: 2.5, backgroundColor: INK, borderRadius: 1.5,
    transformOrigin: '0% 50%',
  },

  axis: { position: 'absolute', left: PAN_X, top: AXIS_Y, width: PAN_W, height: 1.5, backgroundColor: INK },
  axisLab: {
    position: 'absolute', top: AXIS_Y + 5, width: 100,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.7, color: SOFT, includeFontPadding: false,
  },

  markLine: {
    position: 'absolute', left: MARK_X, top: PAN_TOP[0], width: 2, height: PAN_H,
    backgroundColor: INK,
  },
  markLineB: {
    position: 'absolute', left: MARK_X, top: PAN_TOP[1], width: 2, height: AXIS_Y - PAN_TOP[1],
    backgroundColor: INK,
  },
  markCap: {
    position: 'absolute', left: MARK_X + 4, top: PAN_TOP[0] + 4, width: 30, textAlign: 'left',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', left: PAN_X, width: PAN_W, height: PAN_H },
  hitBox: { width: PAN_W, height: PAN_H, borderRadius: 3 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Political19Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political19Scene} band={[222, 512]} camera={CAM} />;
}
