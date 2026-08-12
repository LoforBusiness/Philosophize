import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics8Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A gallery wall. Stage right hangs a big framed CANVAS on a picture wire; stage
// left, a RACK holding two pairs of glasses — square lenses for shapes, round
// lenses for feeling — and above the rack a small BRANCHING DIAGRAM: one canvas,
// two readings. The figure walks over, takes a pair down, walks back out front, and
// the canvas REDRAWS ITSELF: clean geometric blocks on a grid through the first
// pair, loose sweeping strokes through the second. Same canvas, both times. The
// diagram's matching node fills INK as each reading takes over, so the abstract
// claim and the picture always agree.
//
// COMPOSITION / OCCLUSION —
//   · the figure only ever stands at x = 68 (the rack) and x = 148 (out front of
//     the canvas), so its widest body span across the whole lesson is x ≈ 20 … 196.
//   · the CANVAS (x 206…392, y 162…328), its wire and nail (y 147…163), the
//     DIAGRAM (x 16…190, y 150…238) and the LENS RACK (x 24…152, y 246…316) all sit
//     ENTIRELY ABOVE y = 350 — a standing crown is at y ≈ 361 and the liveliest
//     gesture lifts it to y ≈ 355, so nothing the reader must read is ever behind
//     a body.
//   · Q1's two lens cards (y 336…478) sit below that line, so they are kept in
//     x = 206 … 392 — 10 units of clear paper right of the figure's widest reach,
//     and the figure is over at the rack (x 68) on that beat anyway.
//
// The canvas is three absolutely-stacked renderings of the SAME frame whose
// opacities swap on a 520ms timing — driven by the beat's `mode`, and on Q1 by
// which pair the reader taps. That crossfade is the whole delight of the lesson.

const RACK_X = 68;             // where the figure stands to work the rack
const VIEW_X = 148;            // where the figure stands to look at the canvas

const CANV_L = 206;
const CANV_T = 162;
const CANV_W = 186;
const CANV_H = 166;
const NAIL_X = CANV_L + CANV_W / 2;   // 299

// ── the branching diagram: one canvas → two readings ─────────────────────────
const NODE_A_L = 46;
const NODE_A_W = 114;
const NODE_A_T = 150;
const NODE_B_L = 16;
const NODE_C_L = 110;
const NODE_W = 80;
const NODE_T = 208;
const NODE_H = 30;

const RACK_L = 24;
const RACK_W = 128;
const RAIL_T = 264;
const SPEC_A = 55;             // centre x of the SHAPES pair on the rack
const SPEC_B = 121;            // centre x of the FEELING pair on the rack

const CARD_L = 206;
const CARD_W = 186;
const CARD_H = 50;
const CARD_T = 370;
const CARD_GAP = 58;

const CARDS = [
  { id: 'form', l1: 'LOOK AT THE', l2: 'SHAPES', square: true, correct: true },
  { id: 'feel', l1: 'LOOK FOR THE', l2: 'FEELING', square: false, correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? VIEW_X);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics8'));
const DIR = dirsFrom(X, 1);

const M0 = BEATS[0].mode ?? 0;
const L0 = BEATS[0].lens ?? 0;

export default function Aesthetics8Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  // What the canvas is showing right now. Normally the beat says; on Q1 the pair
  // the reader taps says; on Q2 answering fuses the two readings together.
  const mode = answered
    ? (cur.pick ? (picked === 'form' ? 1 : 2) : (cur.modeAns ?? cur.mode ?? 0))
    : (cur.mode ?? 0);
  const lens = cur.lens ?? 0;

  // One value per rendering, so a mode change is a true crossfade rather than a
  // pop — and only the beat that CHANGES the mode ever re-animates the canvas.
  const op0 = useSharedValue(M0 === 0 ? 1 : 0);   // plain
  const op1 = useSharedValue(M0 === 1 ? 1 : 0);   // form
  const op2 = useSharedValue(M0 === 2 ? 1 : 0);   // feeling
  const op3 = useSharedValue(M0 === 3 ? 1 : 0);   // both at once
  const rackF = useSharedValue(L0 === 1 ? 0.2 : 1);
  const rackL = useSharedValue(L0 === 2 ? 0.2 : 1);

  useEffect(() => {
    const cfg = { duration: 520, easing: Easing.inOut(Easing.quad) };
    op0.value = withTiming(mode === 0 ? 1 : 0, cfg);
    op1.value = withTiming(mode === 1 ? 1 : 0, cfg);
    op2.value = withTiming(mode === 2 ? 1 : 0, cfg);
    op3.value = withTiming(mode === 3 ? 1 : 0, cfg);
  }, [mode]);

  // A pair that is off the rack fades down to a ghost, so you can see what is in
  // hand without ever drawing glasses onto the figure's head.
  useEffect(() => {
    const cfg = { duration: 380, easing: Easing.out(Easing.quad) };
    rackF.value = withTiming(lens === 1 ? 0.2 : 1, cfg);
    rackL.value = withTiming(lens === 2 ? 0.2 : 1, cfg);
  }, [lens]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;

    // The canonical travel body: walks the 80-unit gap when the beat moves them,
    // blends gesture-to-gesture when it doesn't. WALK is passed EXPLICITLY — a
    // Gait left to a default parameter is not captured into the worklet runtime.
    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return { fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1) };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // Each rendering breathes very slightly as it arrives, so the swap reads as the
  // painting resolving rather than a light switch.
  const artPlain = useAnimatedStyle(() => ({ opacity: op0.value }));
  const artForm = useAnimatedStyle(() => {
    const o = op1.value + op3.value * 0.85;
    return { opacity: o, transform: [{ scale: 0.96 + 0.04 * Math.min(1, o) }] };
  });
  const artFeel = useAnimatedStyle(() => {
    const o = op2.value + op3.value * 0.85;
    return { opacity: o, transform: [{ scale: 0.96 + 0.04 * Math.min(1, o) }] };
  });
  const cap0 = useAnimatedStyle(() => ({ opacity: op0.value }));
  const cap1 = useAnimatedStyle(() => ({ opacity: op1.value }));
  const cap2 = useAnimatedStyle(() => ({ opacity: op2.value }));
  const cap3 = useAnimatedStyle(() => ({ opacity: op3.value }));
  const specA = useAnimatedStyle(() => ({ opacity: rackF.value }));
  const specB = useAnimatedStyle(() => ({ opacity: rackL.value }));
  // The diagram node for whichever reading is live fills INK on the same crossfade.
  const nodeFormOn = useAnimatedStyle(() => ({ opacity: Math.min(1, op1.value + op3.value) }));
  const nodeFeelOn = useAnimatedStyle(() => ({ opacity: Math.min(1, op2.value + op3.value) }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── one canvas, two readings — the claim as a diagram ───────────────── */}
      <View style={styles.layer} pointerEvents="none">
        <View style={styles.nodeA}>
          <Text style={styles.nodeAText}>ONE CANVAS</Text>
        </View>
        <View style={styles.stem} />
        <View style={styles.crossbar} />
        <View style={[styles.drop, { left: 55 }]} />
        <View style={[styles.drop, { left: 149 }]} />
        <View style={[styles.arrow, { left: 51 }]} />
        <View style={[styles.arrow, { left: 145 }]} />

        <View style={[styles.node, { left: NODE_B_L }]}>
          <Text style={styles.nodeText}>SHAPES</Text>
        </View>
        <Animated.View style={[styles.node, styles.nodeOn, { left: NODE_B_L }, nodeFormOn]}>
          <Text style={styles.nodeTextOn}>SHAPES</Text>
        </Animated.View>

        <View style={[styles.node, { left: NODE_C_L }]}>
          <Text style={styles.nodeText}>FEELING</Text>
        </View>
        <Animated.View style={[styles.node, styles.nodeOn, { left: NODE_C_L }, nodeFeelOn]}>
          <Text style={styles.nodeTextOn}>FEELING</Text>
        </Animated.View>
      </View>

      {/* ── the picture wire and its nail, high on the wall ─────────────────── */}
      <View style={styles.nail} pointerEvents="none" />
      <View style={[styles.wire, styles.wireL]} pointerEvents="none" />
      <View style={[styles.wire, styles.wireR]} pointerEvents="none" />

      {/* ── the canvas: one frame, three renderings ─────────────────────────── */}
      <View style={styles.canvas} pointerEvents="none">
        {/* 1 · as it simply hangs — a shape, a horizon, unresolved */}
        <Animated.View style={[StyleSheet.absoluteFill, artPlain]} pointerEvents="none">
          <View style={styles.blob} />
          <View style={styles.horizon} />
          <View style={styles.speck} />
        </Animated.View>

        {/* 2 · through the SHAPES pair — geometry on a measured grid */}
        <Animated.View style={[StyleSheet.absoluteFill, artForm]} pointerEvents="none">
          {[46, 93, 140].map((g) => <View key={`v${g}`} style={[styles.gridV, { left: g }]} />)}
          {[41, 83, 124].map((g) => <View key={`h${g}`} style={[styles.gridH, { top: g }]} />)}
          <View style={styles.blockSquare} />
          <View style={styles.blockTall} />
          <View style={styles.blockTri} />
          <View style={styles.blockRound} />
        </Animated.View>

        {/* 3 · through the FEELING pair — the same canvas as loose sweeps */}
        <Animated.View style={[StyleSheet.absoluteFill, artFeel]} pointerEvents="none">
          <View style={[styles.stroke, styles.strokeA]} />
          <View style={[styles.stroke, styles.strokeB]} />
          <View style={[styles.stroke, styles.strokeC]} />
          <View style={[styles.stroke, styles.strokeD]} />
          <View style={[styles.stroke, styles.strokeE]} />
          <View style={[styles.stroke, styles.strokeF]} />
          <View style={[styles.stroke, styles.strokeG]} />
        </Animated.View>

        {/* the little plate under the picture, naming what you are seeing */}
        <Animated.Text style={[styles.plate, cap0]} pointerEvents="none">A PAINTING</Animated.Text>
        <Animated.Text style={[styles.plate, cap1]} pointerEvents="none">ARRANGEMENT</Animated.Text>
        <Animated.Text style={[styles.plate, cap2]} pointerEvents="none">FEELING</Animated.Text>
        <Animated.Text style={[styles.plate, cap3]} pointerEvents="none">BOTH AT ONCE</Animated.Text>
      </View>

      {/* ── the lens rack on the wall, stage left ───────────────────────────── */}
      <View style={styles.rackTitleWrap} pointerEvents="none">
        <Text style={styles.rackTitle}>THE TWO PAIRS</Text>
      </View>
      <View style={styles.rail} pointerEvents="none" />
      <View style={[styles.hook, { left: SPEC_A - 1.25 }]} pointerEvents="none" />
      <View style={[styles.hook, { left: SPEC_B - 1.25 }]} pointerEvents="none" />

      <Animated.View style={[styles.specs, { left: SPEC_A - 31 }, specA]} pointerEvents="none">
        <View style={[styles.specLens, styles.specSquare]} />
        <View style={styles.specBridge} />
        <View style={[styles.specLens, styles.specSquare]} />
      </Animated.View>
      <Animated.View style={[styles.specLabelWrap, { left: SPEC_A - 39 }, specA]} pointerEvents="none">
        <Text style={styles.specLabel}>SHAPES</Text>
      </Animated.View>

      <Animated.View style={[styles.specs, { left: SPEC_B - 31 }, specB]} pointerEvents="none">
        <View style={styles.specLens} />
        <View style={styles.specBridge} />
        <View style={styles.specLens} />
      </Animated.View>
      <Animated.View style={[styles.specLabelWrap, { left: SPEC_B - 39 }, specB]} pointerEvents="none">
        <Text style={styles.specLabel}>FEELING</Text>
      </Animated.View>

      {/* ── Q1: tap a pair — the canvas redraws itself under your finger ────── */}
      {showPick ? (
        <>
          <View style={styles.pickLabelWrap} pointerEvents="none">
            <Text style={styles.pickLabel}>{'TAP A PAIR TO\nLOOK THROUGH IT'}</Text>
          </View>
          {CARDS.map((c, k) => {
            const chosen = picked === c.id;
            const on = answered && c.correct;
            return (
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.pickCard, { top: CARD_T + k * CARD_GAP }]} disabled={answered}>
                <View
                  style={[
                    styles.pickInner,
                    on && styles.pickRight,
                    answered && chosen && !c.correct && styles.pickWrong,
                  ]}
                >
                  <View style={styles.glyph} pointerEvents="none">
                    <View style={[styles.gLens, c.square && styles.gSquare, on && styles.gOn]} />
                    <View style={[styles.gBridge, on && styles.gBridgeOn]} />
                    <View style={[styles.gLens, c.square && styles.gSquare, on && styles.gOn]} />
                  </View>
                  <View style={styles.pickTextWrap} pointerEvents="none">
                    <Text style={[styles.pickText, on && styles.pickTextOn]}>{c.l1}</Text>
                    <Text style={[styles.pickText, on && styles.pickTextOn]}>{c.l2}</Text>
                  </View>
                </View>
              </Target>
            );
          })}
        </>
      ) : null}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for props that sit together. Always pointerEvents="none":
  // an overlay at opacity 0 still swallows taps and silently kills the interaction.
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 24, right: 18, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the branching diagram ───────────────────────────────────────────────────
  nodeA: {
    position: 'absolute', left: NODE_A_L, top: NODE_A_T, width: NODE_A_W, height: 28,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  nodeAText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.2, color: INK,
    includeFontPadding: false, lineHeight: 14,
  },
  stem: { position: 'absolute', left: 102, top: 178, width: 2, height: 12, backgroundColor: SOFT },
  crossbar: { position: 'absolute', left: 55, top: 190, width: 96, height: 2, backgroundColor: SOFT },
  drop: { position: 'absolute', top: 190, width: 2, height: 10, backgroundColor: SOFT },
  arrow: {
    position: 'absolute', top: 198, width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: SOFT,
  },
  node: {
    position: 'absolute', top: NODE_T, width: NODE_W, height: NODE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  nodeOn: { backgroundColor: INK, borderColor: INK },
  nodeText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.6, color: INK,
    includeFontPadding: false, lineHeight: 14,
  },
  nodeTextOn: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.6, color: PAPER,
    includeFontPadding: false, lineHeight: 14,
  },

  // ── picture wire ────────────────────────────────────────────────────────────
  nail: { position: 'absolute', left: NAIL_X - 3, top: 147, width: 6, height: 6, borderRadius: 3, backgroundColor: INK },
  // A 1.5-tall bar stretched from the nail to a top corner of the frame, rotated
  // about its LEFT edge — the same trick the rig uses for a bone.
  wire: { position: 'absolute', left: NAIL_X, top: 149, width: 94, height: 1.5, backgroundColor: SOFT, transformOrigin: '0% 50%' },
  wireL: { transform: [{ rotate: '172deg' }] },
  wireR: { transform: [{ rotate: '8deg' }] },

  // ── the canvas ──────────────────────────────────────────────────────────────
  canvas: {
    position: 'absolute', left: CANV_L, top: CANV_T, width: CANV_W, height: CANV_H,
    borderWidth: 3, borderColor: INK, borderRadius: 3, backgroundColor: PAPER, overflow: 'hidden',
  },
  plate: {
    position: 'absolute', left: 0, right: 0, bottom: 6, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: SOFT,
    includeFontPadding: false, lineHeight: 13,
  },

  // 1 · plain
  blob: { position: 'absolute', left: 40, top: 28, width: 106, height: 90, borderRadius: 46, borderWidth: 2, borderColor: SOFT },
  horizon: { position: 'absolute', left: 14, top: 114, width: 158, height: 1.5, backgroundColor: RULE },
  speck: { position: 'absolute', left: 112, top: 44, width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: SOFT },

  // 2 · form
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: RULE },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: RULE },
  blockSquare: { position: 'absolute', left: 22, top: 20, width: 56, height: 56, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },
  blockTall: { position: 'absolute', left: 108, top: 12, width: 42, height: 84, borderWidth: 2, borderColor: INK, backgroundColor: INK },
  // CSS border-triangle: base down, apex up.
  blockTri: {
    position: 'absolute', left: 26, top: 94, width: 0, height: 0,
    borderLeftWidth: 30, borderRightWidth: 30, borderBottomWidth: 46,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  blockRound: { position: 'absolute', left: 108, top: 96, width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },

  // 3 · feeling
  stroke: { position: 'absolute', backgroundColor: INK, borderRadius: 4 },
  strokeA: { left: 10, top: 32, width: 148, height: 7, transform: [{ rotate: '-13deg' }] },
  strokeB: { left: 24, top: 58, width: 124, height: 5, backgroundColor: SOFT, transform: [{ rotate: '8deg' }] },
  strokeC: { left: 8, top: 84, width: 158, height: 8, transform: [{ rotate: '-5deg' }] },
  strokeD: { left: 48, top: 14, width: 80, height: 4.5, backgroundColor: SOFT, transform: [{ rotate: '24deg' }] },
  strokeE: { left: 28, top: 110, width: 110, height: 6, transform: [{ rotate: '-18deg' }] },
  strokeF: { left: 92, top: 98, width: 66, height: 4, backgroundColor: SOFT, transform: [{ rotate: '34deg' }] },
  strokeG: { left: 14, top: 126, width: 96, height: 4.5, transform: [{ rotate: '6deg' }] },

  // ── the lens rack ───────────────────────────────────────────────────────────
  rackTitleWrap: { position: 'absolute', left: RACK_L, top: 246, width: RACK_W },
  rackTitle: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6,
    color: SOFT, includeFontPadding: false, lineHeight: 13,
  },
  rail: { position: 'absolute', left: RACK_L, top: RAIL_T, width: RACK_W, height: 3, borderRadius: 2, backgroundColor: INK },
  hook: { position: 'absolute', top: RAIL_T + 2, width: 2.5, height: 10, backgroundColor: SOFT, borderRadius: 1 },

  specs: { position: 'absolute', top: 272, width: 62, height: 28, flexDirection: 'row', alignItems: 'center' },
  specLens: { width: 28, height: 28, borderRadius: 14, borderWidth: 2.2, borderColor: INK, backgroundColor: PAPER },
  specSquare: { borderRadius: 3 },
  specBridge: { width: 6, height: 2.2, backgroundColor: INK },
  specLabelWrap: { position: 'absolute', top: 304, width: 78 },
  specLabel: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.4,
    color: SOFT, includeFontPadding: false, lineHeight: 12,
  },

  // ── Q1 cards ────────────────────────────────────────────────────────────────
  pickLabelWrap: { position: 'absolute', left: CARD_L, top: 336, width: CARD_W },
  pickLabel: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.4,
    color: SOFT, lineHeight: 14, includeFontPadding: false,
  },
  pickCard: { position: 'absolute', left: CARD_L, width: CARD_W },
  pickInner: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12,
  },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
  pickTextWrap: { flex: 1 },
  pickText: {
    fontFamily: 'Inter_700Bold', fontSize: 13.5, letterSpacing: 0.4, lineHeight: 16,
    color: INK, includeFontPadding: false,
  },
  pickTextOn: { color: PAPER },

  glyph: { flexDirection: 'row', alignItems: 'center' },
  gLens: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, borderColor: INK },
  gSquare: { borderRadius: 2 },
  gBridge: { width: 5, height: 2, backgroundColor: INK },
  gOn: { borderColor: PAPER },
  gBridgeOn: { backgroundColor: PAPER },
});

// Art runs from the picture nail (y 147) down to the ground rule (y 501.5); the
// lowest Q1 card ends at y 478 and the figures' crowns sit at y ≈ 355 inside that.
// The player crops to [138, 510] and scales up, so the whole wall renders about 50%
// larger than the letterboxed full-height fit.
export function Aesthetics8Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics8Scene} band={[138, 510]} camera={CAM} />;
}
