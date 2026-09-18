import {
  useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01,
  WALK, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics8Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, lookPose,
  pickAt,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerSpent } from './Target';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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
/**
 * How faint the empty slot on the rack is once a pair is being worn.
 *
 * It was 0.2, which put its SHAPES / FEELING label at 1.3:1 — a box with an
 * unreadable word in it (D35). The slot still reads as vacant at 0.55, and the
 * word telling you WHICH pair is off can be read, which is the whole use of it.
 */
const GHOST_ON_RACK = 0.55;

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

// R7c — THE SORT'S BINS ARE THE CANVAS'S OWN READINGS, so the chip sets the canvas.
// In the author's bin order, each reading is what that answer claims:
//   formalism alone     → 1  the geometric FORM rendering
//   expression alone    → 2  the loose FEELING rendering (the beat's own picture, where the
//                            chip rests, so nothing moves until the reader does)
//   different questions → 3  both at once, which is also what answering this beat shows
const MODE_AT = [1, 2, 3];
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

const M0 = BEATS[0].mode ?? 0;
const L0 = BEATS[0].lens ?? 0;

// group AH — THE EIGHT STILL TAPS, AND EIGHT DIFFERENT THINGS.
//
// The first pass gave all eight one tag slot in the gap between the rack and the
// canvas and changed the word inside it. That is a subtitle track: the reader taps,
// a caption swaps, and the wall has not done anything. Each one now moves something
// the lesson already draws — the diagram's branches, the canvas itself, the gap
// between the two readings — and no two of them are the same object in the same
// place.
const SAMEV = BEATS.map((b) => ((b.sameTag ?? 0) > 0 ? 1 : 0));
const THEORYV = BEATS.map((b) => ((b.theoryTag ?? 0) > 0 ? 1 : 0));
const ATTENDV = BEATS.map((b) => ((b.attendTag ?? 0) > 0 ? 1 : 0));
const IGNOREDV = BEATS.map((b) => ((b.ignoredTag ?? 0) > 0 ? 1 : 0));
const DIFFV = BEATS.map((b) => ((b.differentTag ?? 0) > 0 ? 1 : 0));
const MOODV = BEATS.map((b) => ((b.moodTag ?? 0) > 0 ? 1 : 0));
const IRRELV = BEATS.map((b) => ((b.irrelevantTag ?? 0) > 0 ? 1 : 0));
const DISCV = BEATS.map((b) => ((b.discoveredTag ?? 0) > 0 ? 1 : 0));

export default function Aesthetics8Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(9);
  const cur = BEATS[i];
  const prevBeat = i > 0 ? BEATS[i - 1] : undefined;
  const answered = picked !== null;
  // group AH — each gap-tag fades in on the beat that names it and fades back
  // out (never cuts) the moment the beat moves on.
  const sameFade = (cur.sameTag ?? 0) !== (prevBeat?.sameTag ?? 0);
  const theoryFade = (cur.theoryTag ?? 0) !== (prevBeat?.theoryTag ?? 0);
  const attendFade = (cur.attendTag ?? 0) !== (prevBeat?.attendTag ?? 0);
  const ignoredFade = (cur.ignoredTag ?? 0) !== (prevBeat?.ignoredTag ?? 0);
  const diffFade = (cur.differentTag ?? 0) !== (prevBeat?.differentTag ?? 0);
  const moodFade = (cur.moodTag ?? 0) !== (prevBeat?.moodTag ?? 0);
  const irrelFade = (cur.irrelevantTag ?? 0) !== (prevBeat?.irrelevantTag ?? 0);
  const discFade = (cur.discoveredTag ?? 0) !== (prevBeat?.discoveredTag ?? 0);
  // The stage's own instruction, spent the moment the answer lands (S11).
  const spent = useAnswerSpent(picked);
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
  // Who sets the canvas: 0 the chip, 1 the beat's own crossfade. Eased both ways, so
  // the hand-over can never cut, and it goes back to the beat as the answer lands.
  const hand = useSharedValue(1);
  const rackF = useSharedValue(L0 === 1 ? GHOST_ON_RACK : 1);
  const rackL = useSharedValue(L0 === 2 ? GHOST_ON_RACK : 1);

  useEffect(() => {
    const cfg = { duration: 520, easing: Easing.inOut(Easing.quad) };
    op0.value = withTiming(mode === 0 ? 1 : 0, cfg);
    op1.value = withTiming(mode === 1 ? 1 : 0, cfg);
    op2.value = withTiming(mode === 2 ? 1 : 0, cfg);
    op3.value = withTiming(mode === 3 ? 1 : 0, cfg);
  }, [mode]);

  useEffect(() => {
    hand.value = withTiming(reacting && !answered ? 0 : 1, { duration: 520, easing: Easing.inOut(Easing.quad) });
  }, [reacting, answered]);

  // The four renderings' weights: the beat's crossfade, or the chip's reading.
  const W = useDerivedValue(() => {
    const m = pickAt(MODE_AT, pickPos.value);
    const h = hand.value;
    const r1 = Math.max(0, 1 - Math.abs(m - 1));
    const r2 = Math.max(0, 1 - Math.abs(m - 2));
    const r3 = Math.max(0, 1 - Math.abs(m - 3));
    return [op0.value * h, op1.value * h + r1 * (1 - h), op2.value * h + r2 * (1 - h), op3.value * h + r3 * (1 - h)];
  });

  // A pair that is off the rack fades down to a ghost, so you can see what is in
  // hand without ever drawing glasses onto the figure's head.
  useEffect(() => {
    const cfg = { duration: 380, easing: Easing.out(Easing.quad) };
    rackF.value = withTiming(lens === 1 ? GHOST_ON_RACK : 1, cfg);
    rackL.value = withTiming(lens === 2 ? GHOST_ON_RACK : 1, cfg);
  }, [lens]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    // The canonical travel body: walks the 80-unit gap when the beat moves them,
    // blends gesture-to-gesture when it doesn't. WALK is passed EXPLICITLY — a
    // Gait left to a default parameter is not captured into the worklet runtime.
    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      // group AH — named the beat the sentence names it, gone the beat it moves on.
      same: carry(cv, 1, n, SAMEV[p], SAMEV[n], sameFade ? grow : 1),
      theory: carry(cv, 2, n, THEORYV[p], THEORYV[n], theoryFade ? grow : 1),
      attend: carry(cv, 3, n, ATTENDV[p], ATTENDV[n], attendFade ? grow : 1),
      ignored: carry(cv, 4, n, IGNOREDV[p], IGNOREDV[n], ignoredFade ? grow : 1),
      diff: carry(cv, 5, n, DIFFV[p], DIFFV[n], diffFade ? grow : 1),
      mood: carry(cv, 6, n, MOODV[p], MOODV[n], moodFade ? grow : 1),
      irrel: carry(cv, 7, n, IRRELV[p], IRRELV[n], irrelFade ? grow : 1),
      disc: carry(cv, 8, n, DISCV[p], DISCV[n], discFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // Each rendering breathes very slightly as it arrives, so the swap reads as the
  // painting resolving rather than a light switch.
  const artPlain = useAnimatedStyle(() => ({ opacity: W.value[0] }));
  const artForm = useAnimatedStyle(() => {
    const o = W.value[1] + W.value[3] * 0.85;
    return { opacity: o, transform: [{ scale: 0.96 + 0.04 * Math.min(1, o) }] };
  });
  const artFeel = useAnimatedStyle(() => {
    const o = W.value[2] + W.value[3] * 0.85;
    return { opacity: o, transform: [{ scale: 0.96 + 0.04 * Math.min(1, o) }] };
  });
  const cap0 = useAnimatedStyle(() => ({ opacity: W.value[0] }));
  const cap1 = useAnimatedStyle(() => ({ opacity: W.value[1] }));
  const cap2 = useAnimatedStyle(() => ({ opacity: W.value[2] }));
  const cap3 = useAnimatedStyle(() => ({ opacity: W.value[3] }));
  const specA = useAnimatedStyle(() => ({ opacity: rackF.value }));
  const specB = useAnimatedStyle(() => ({ opacity: rackL.value }));
  // The diagram node for whichever reading is live fills INK on the same crossfade.
  const nodeFormOn = useAnimatedStyle(() => ({ opacity: Math.min(1, W.value[1] + W.value[3]) }));
  const nodeFeelOn = useAnimatedStyle(() => ({ opacity: Math.min(1, W.value[2] + W.value[3]) }));
  // group AH — the eight still-tap events, all sharing one gap-tag shape.
  // Both leaders draw at once: what the beat claims is that the two readings share
  // one object, and drawing them in turn would make it a sequence of two claims.
  const sameStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.same, transform: [{ scaleX: SCENE.value.same }],
  }));
  // The two enclosures likewise: each reason is a theory, said of both at once.
  const theoryStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.theory, transform: [{ scale: 0.96 + 0.04 * SCENE.value.theory }],
  }));
  // The viewfinder comes DOWN onto the canvas, which is what a pair of glasses
  // does to a picture: it selects a part of something already there.
  const attendStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.attend, transform: [{ translateY: (1 - SCENE.value.attend) * -14 }],
  }));
  // The strike is a stroke, so it draws across rather than fading in.
  const ignoredStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ignored }));
  const ignoredCutStyle = useAnimatedStyle(() => ({
    opacity: clamp01((SCENE.value.ignored - 0.35) / 0.65),
    transform: [{ scaleX: clamp01((SCENE.value.ignored - 0.35) / 0.65) }],
  }));
  const diffStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.diff, transform: [{ scale: 1.15 - 0.15 * SCENE.value.diff }],
  }));
  // The feeling travels OFF the canvas toward whoever is looking at it.
  const moodStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.mood, transform: [{ translateX: (1 - SCENE.value.mood) * 26 }],
  }));
  // Two measures, across and down, each drawing from its own origin.
  const irrelStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.irrel }));
  const irrelHStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.irrel }] }));
  const irrelVStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: SCENE.value.irrel }] }));
  // Found IN the act: the ring closes onto the mark rather than arriving with it.
  const discStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.disc }));
  const discRingStyle = useAnimatedStyle(() => ({
    opacity: clamp01((SCENE.value.disc - 0.3) / 0.7),
    transform: [{ scale: 1.8 - 0.8 * clamp01((SCENE.value.disc - 0.3) / 0.7) }],
  }));

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

      {/* group AH — eight still-tap events, all in the gap between rack and canvas. */}
      {/* Both readings are of the SAME canvas: a leader from each branch to it. */}
      <Animated.View style={[styles.sameLeadA, sameStyle]} pointerEvents="none" />
      <Animated.View style={[styles.sameLeadB, sameStyle]} pointerEvents="none" />

      {/* Each reason is a theory of its own: a boundary round each branch. */}
      <Animated.View style={[styles.theoryBox, { left: NODE_B_L - 5 }, theoryStyle]} pointerEvents="none" />
      <Animated.View style={[styles.theoryBox, { left: NODE_C_L - 5 }, theoryStyle]} pointerEvents="none" />

      {/* The glasses change nothing on the wall; they pick out part of it. */}
      <Animated.View style={[styles.attendFrame, attendStyle]} pointerEvents="none" />

      {/* What the picture depicts plays no part — struck out under the canvas. */}
      <Animated.View style={[styles.depictPlate, ignoredStyle]} pointerEvents="none">
        <Text style={styles.depictText} numberOfLines={1}>WHAT IT DEPICTS</Text>
        <Animated.View style={[styles.depictCut, ignoredCutStyle]} />
      </Animated.View>

      {/* Two paintings out of one canvas. */}
      <Animated.View style={[styles.diffMark, diffStyle]} pointerEvents="none">
        <Text style={styles.diffText}>≠</Text>
      </Animated.View>

      {/* The mood is handed off the canvas to whoever is standing in front of it. */}
      <Animated.View style={[styles.moodArm, moodStyle]} pointerEvents="none">
        <View style={styles.moodHead} />
      </Animated.View>

      {/* Subject matter gone, the arrangement is what is measured. */}
      <Animated.View style={[styles.irrelWrap, irrelStyle]} pointerEvents="none">
        <Animated.View style={[styles.irrelH, irrelHStyle]} />
        <Animated.View style={[styles.irrelV, irrelVStyle]} />
      </Animated.View>

      {/* And the feeling is found in the act, at the stroke that has it. */}
      <Animated.View style={[styles.discWrap, discStyle]} pointerEvents="none">
        <View style={styles.discDot} />
        <Animated.View style={[styles.discRing, discRingStyle]} />
      </Animated.View>

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
          <Animated.View style={[styles.pickLabelWrap, spent]} pointerEvents="none">
            <Text style={styles.pickLabel}>{'TAP A PAIR TO\nLOOK THROUGH IT'}</Text>
          </Animated.View>
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
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
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
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
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
    borderWidth: 3, borderColor: INK, borderRadius: 8, backgroundColor: PAPER, overflow: 'hidden',
  },
  plate: {
    position: 'absolute', left: 0, right: 0, bottom: 6, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.2, letterSpacing: 1.8, color: SOFT,
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
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10.2, letterSpacing: 1.6,
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
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10.2, letterSpacing: 1.4,
    // INK, not SOFT: this label rides a slot that ghosts to 0.55, and SOFT does
    // not survive any dimming — 5.3:1 on paper is 2.0:1 at 0.55 (D35).
    color: INK, includeFontPadding: false, lineHeight: 12,
  },

  // ── Q1 cards ────────────────────────────────────────────────────────────────
  pickLabelWrap: { position: 'absolute', left: CARD_L, top: 336, width: CARD_W },
  pickLabel: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.4,
    color: SOFT, lineHeight: 14, includeFontPadding: false,
  },
  pickCard: { position: 'absolute', left: CARD_L, width: CARD_W },
  pickInner: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PLATE_FACE, boxShadow: LIP,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12,
  },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
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

  // ── group AH: eight still-tap events, each on what the wall already draws ───
  //
  // Every one of these lives in paper the composition header already accounts for:
  // the gap between the diagram and the canvas (x 152…206), the canvas's own face
  // (x 206…392, y 162…328) and the strip under it, all above y 350 where a crown
  // never reaches.

  // From each branch node's outer edge across to the canvas, drawn together.
  sameLeadA: {
    position: 'absolute', left: NODE_B_L + NODE_W, top: NODE_T + NODE_H / 2 - 1,
    width: CANV_L - (NODE_B_L + NODE_W), height: 2,
    borderTopWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
    transformOrigin: '0% 50%',
  },
  sameLeadB: {
    position: 'absolute', left: NODE_C_L + NODE_W, top: NODE_T + NODE_H - 4,
    width: CANV_L - (NODE_C_L + NODE_W), height: 2,
    borderTopWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
    transformOrigin: '0% 50%',
  },
  // A boundary round a branch — `left` comes from the node it encloses.
  theoryBox: {
    position: 'absolute', top: NODE_T - 5, width: NODE_W + 10, height: NODE_H + 10,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 8,
  },
  // ON the canvas, over its upper-left quarter: a part of what is there.
  attendFrame: {
    position: 'absolute', left: CANV_L + 16, top: CANV_T + 18, width: 74, height: 62,
    borderWidth: 2, borderColor: INK, borderStyle: 'dashed', borderRadius: 4,
  },
  // Under the canvas, in the strip above the Q1 cards at CARD_T.
  depictPlate: {
    position: 'absolute', left: CANV_L + 24, top: CANV_T + CANV_H + 8, width: 138, height: 24,
    borderWidth: 1.5, borderColor: INK, borderRadius: 6, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  depictText: {
    fontFamily: 'Inter_700Bold', fontSize: 10.2, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },
  depictCut: {
    position: 'absolute', left: 10, right: 10, top: 11, height: 2,
    backgroundColor: INK, borderRadius: 1, transformOrigin: '0% 50%',
  },
  // Between the two branch nodes, which is where the two readings part.
  diffMark: {
    position: 'absolute', left: NODE_B_L + NODE_W + 1, top: NODE_T + 4, width: 24, height: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  diffText: {
    fontFamily: 'Inter_700Bold', fontSize: 15, lineHeight: 18, color: INK,
    includeFontPadding: false,
  },
  // Off the canvas's left edge toward the figure standing at VIEW_X.
  moodArm: {
    position: 'absolute', left: CANV_L - 44, top: 246, width: 34, height: 3,
    backgroundColor: INK, borderRadius: 1.5,
  },
  moodHead: {
    position: 'absolute', left: -9, top: -3.5, width: 9, height: 10,
    borderTopWidth: 5, borderBottomWidth: 5, borderRightWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
    borderStyle: 'solid',
  },
  // The arrangement, measured across and down the canvas's own face.
  irrelWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  irrelH: {
    position: 'absolute', left: CANV_L + 12, top: CANV_T + CANV_H / 2 - 1, width: CANV_W - 24, height: 2,
    borderTopWidth: 2, borderColor: INK, borderStyle: 'dashed', transformOrigin: '0% 50%',
  },
  irrelV: {
    position: 'absolute', left: CANV_L + CANV_W / 2 - 1, top: CANV_T + 12, width: 2, height: CANV_H - 24,
    borderLeftWidth: 2, borderColor: INK, borderStyle: 'dashed', transformOrigin: '50% 0%',
  },
  // A mark found on the canvas, with the ring closing onto it.
  discWrap: {
    position: 'absolute', left: CANV_L + CANV_W - 74, top: CANV_T + CANV_H - 68, width: 34, height: 34,
    alignItems: 'center', justifyContent: 'center',
  },
  discDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: INK },
  discRing: {
    position: 'absolute', left: 3, top: 3, width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: INK,
  },
});

// Art runs from the picture nail (y 147) down to the ground rule (y 501.5); the
// lowest Q1 card ends at y 478 and the figures' crowns sit at y ≈ 355 inside that.
// The player crops to [138, 510] and scales up, so the whole wall renders about 50%
// larger than the letterboxed full-height fit.
export function Aesthetics8Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics8Scene} band={[138, 510]} camera={CAM} />;
}
