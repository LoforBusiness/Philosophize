import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics17Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A TERROR, A METER, AND WHAT HAPPENS NEXT — and a frame that changes exactly one
// of the three (H64). All three are the Q1 targets, so the question is whether the
// reader watched the right thing.
//
// · the figure walks x = 74 → 160, facing right throughout. At 160 his widest ink
//   is a fist at x ≈ 193, sixty-one units clear of the frame at 254 (B9).
// · the CONSEQUENCE strip is x 30…240, y 240…276 — 210 × 36.
// · the FEAR meter is x 30…240, y 296…332 — the same 210 × 36, deliberately, so
//   the two readings read as a pair rather than as a caption and a gauge.
// · the FRAME is x 254…396, y 292…500 and the SHAPE stands inside it at
//   x 274…376, y 316…500, its three spikes topping out at y 298. The frame is
//   fourteen units clear of the strips' column and the shape twenty inside the
//   frame, so nothing touches anything (D23).
// · highest ink is the consequence strip at y 240; lowest is the ground at 500.
//   The figure's crown is y 397 — below every strip and left of the frame.
//
// Band 230…512 = 282: the smallest that keeps one figure under check:scale's 38%
// share of the frame (103 / 282 = 37%).

const CONSEQ_T = 240;
const FEAR_T = 296;
const PANEL_L = 30;
const PANEL_W = 210;
const PANEL_H = 36;

const FRAME_L = 254;
const FRAME_W = 142;
const FRAME_T = 292;

const SHAPE_L = 274;
const SHAPE_W = 102;
const SHAPE_T = 316;

const G = BEATS.map((b) => b.g ?? 0);
const X = BEATS.map((b) => b.x ?? 160);
const SHAPE = BEATS.map((b) => b.shape ?? 0);
const FEAR = BEATS.map((b) => b.fear ?? 0);
const FRAME = BEATS.map((b) => b.frame ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics17'));

export default function Aesthetics17Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // The transition is as long as the walk is far (C17) — he comes back toward the
    // frame on beat 1 and stays there.
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.9);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteHold(G[n], t), emoteLive(G[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      shape: carry(cv, 1, n, SHAPE[p], SHAPE[n], grow),
      fear: carry(cv, 2, n, FEAR[p], FEAR[n], grow),
      frame: carry(cv, 3, n, FRAME[p], FRAME[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  // The consequence rewrites itself once the answer is in — the reveal IS the
  // explanation, and it cannot be read before the pick (group O).
  const framed = answered;

  const shapeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shape }));
  const frameStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.frame,
    transform: [{ scale: 0.9 + 0.1 * SCENE.value.frame }],
  }));
  const fearFill = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.fear }] }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── WHAT HAPPENS NEXT ────────────────────────────────────────────── */}
      <Panel
        id="follows" correct top={CONSEQ_T}
        label={framed ? 'AND THEN THE LIGHTS COME UP' : 'AND THEN IT REACHES YOU'}
        live={live} answered={answered} picked={picked} onPick={onPick}
      />

      {/* ── THE FEAR, WHICH DOES NOT MOVE ────────────────────────────────── */}
      <Panel
        id="fear" correct={false} top={FEAR_T} label="FEAR"
        live={live} answered={answered} picked={picked} onPick={onPick}
      >
        <View style={styles.fearTrack} pointerEvents="none">
          <Animated.View style={[styles.fearFill, fearFill]} pointerEvents="none" />
        </View>
      </Panel>

      {/* ── THE FRAME AND THE SHAPE ──────────────────────────────────────── */}
      <Animated.View style={[styles.frame, frameStyle]} pointerEvents="none" />
      <Animated.View style={[styles.shapeWrap, shapeStyle]}>
        <Target
          id="shape" correct={false} picked={picked} onPick={onPick}
          style={styles.fill} disabled={!live || answered}
        >
          <View
            style={[
              styles.shapeBody,
              answered && picked === 'shape' && styles.pickWrong,
            ]}
          >
            <View style={[styles.spike, { left: 10 }]} pointerEvents="none" />
            <View style={[styles.spike, { left: 44, height: 26 }]} pointerEvents="none" />
            <View style={[styles.spike, { left: 78 }]} pointerEvents="none" />
            <View style={[styles.eye, { left: 26 }]} pointerEvents="none" />
            <View style={[styles.eye, { left: 62 }]} pointerEvents="none" />
          </View>
        </Target>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One of the two readings, and one of the Q1 targets. */
function Panel({
  id, correct, top, label, live, answered, picked, onPick, children,
}: {
  id: string; correct: boolean; top: number; label: string;
  live: boolean; answered: boolean; picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  children?: React.ReactNode;
}) {
  const on = answered && correct;
  return (
    <View style={[styles.panel, { top }]}>
      <Target
        id={id} correct={correct} picked={picked} onPick={onPick}
        style={styles.fill} disabled={!live || answered}
      >
        <View
          style={[
            styles.panelInner,
            on && styles.pickRight,
            answered && picked === id && !correct && styles.pickWrong,
          ]}
        >
          <Text style={[styles.panelText, on && styles.onInk]} numberOfLines={1}>{label}</Text>
          {children}
        </View>
      </Target>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  panel: { position: 'absolute', left: PANEL_L, width: PANEL_W, height: PANEL_H },
  panelInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, gap: 8,
  },
  panelText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  fearTrack: {
    flex: 1, height: 12, borderRadius: 6, backgroundColor: RULE, overflow: 'hidden',
  },
  fearFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, right: 0,
    backgroundColor: INK, borderRadius: 6, transformOrigin: '0% 50%',
  },

  frame: {
    position: 'absolute', left: FRAME_L, top: FRAME_T, width: FRAME_W, height: 500 - FRAME_T,
    borderWidth: 3, borderColor: SOFT, borderRadius: 3,
  },
  shapeWrap: {
    position: 'absolute', left: SHAPE_L, top: SHAPE_T, width: SHAPE_W, height: 500 - SHAPE_T,
  },
  shapeBody: {
    flex: 1, borderWidth: 2.5, borderColor: INK, borderTopLeftRadius: 6, borderTopRightRadius: 6,
    backgroundColor: PAPER,
  },
  spike: {
    position: 'absolute', top: -18, width: 14, height: 20,
    borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 20,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  eye: { position: 'absolute', top: 34, width: 10, height: 10, borderRadius: 5, backgroundColor: INK },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the consequence strip (240) to the ground line (500). The spikes
// sit at y 298, above the shape's own box and below the frame. Band 230…512 = 282.
export function Aesthetics17Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics17Scene} band={[230, 512]} camera={CAM} />;
}
