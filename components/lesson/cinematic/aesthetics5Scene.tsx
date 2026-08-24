import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics5Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE ATTENTION METER AND THE FRAME. Murdoch's argument drawn instead of asserted:
//
//   · THE METER (top) — one stacked bar labelled SELF · WORLD. While the figure
//     broods it is inked almost end to end by the self; the moment the kestrel
//     arrives the ink retreats to a sliver and the world takes the bar. That IS
//     "unselfing", as a quantity you can watch move.
//   · THE FRAME (below) — a window with a sill, and it holds whatever attention is
//     on: the hovering kestrel (Murdoch), then Ruskin's leaf. On the Ruskin beat the
//     word the mind swaps in — LEAF — is stamped beside the drawing and STRUCK OUT,
//     which is the whole of "the innocence of the eye" in one animation.
//   · The self-cloud sits over the figure's head and pops when the kestrel lands.
//
// Q2 is answered IN the frame: three GOAL cards replace the struck word.
//
// There is NO camera transform — every number below is a final stage coordinate, so
// the band is measurable. (The old version translated the whole stage up by 92 and
// then let the player letterbox the full 560, which is why it read tiny.)
//
// COMPOSITION / OCCLUSION —
//   · the figure stands at x = 62 and never moves. Its widest gesture (13,
//     point-forward) puts the fist at x ≈ 115; its head circle spans x 35…89; the
//     crown rides to y ≈ 359 and the ankles to y ≈ 507.
//   · every chart, frame and card lives at x ≥ 132, so nothing can cover the figure
//     and the figure can never cover a tap target.
//   · the self-cloud owns x 8…124 above y = 356, clear of the crown by 3.

const FIG_X = 62;

// ── the attention meter ──────────────────────────────────────────────────────
const MET_L = 132;
const MET_W = 254;                    // x 132 … 386
const MET_TITLE_T = 236;              // 236 … 251
const MET_BAR_T = 254;
const MET_BAR_H = 34;                 // 254 … 288
const MET_LEG_T = 292;                // 292 … 308

// ── the frame ────────────────────────────────────────────────────────────────
const FR_L = 146;
const FR_T = 312;
const FR_W = 240;                     // x 146 … 386
const FR_H = 164;                     // y 312 … 476
const IN_L = FR_L + 4;                // 150
const IN_T = FR_T + 4;                // 316
const CAP_T = IN_T + 2;               // 318 … 333 — the caption / tap-me row

// ── what the frame holds ─────────────────────────────────────────────────────
const BIRD_L = 232, BIRD_T = 348, BIRD_W = 108, BIRD_H = 78;   // hover ±7 → 341 … 433
const LEAF_L = 158, LEAF_T = 338, LEAF_W = 58, LEAF_H = 120;   // 338 … 458
const WORD_L = 236, WORD_T = 356, WORD_W = 136, WORD_H = 62;   // 356 … 418

// ── the self-cloud ───────────────────────────────────────────────────────────
const EGO_L = 8, EGO_T = 286, EGO_W = 116, EGO_H = 70;         // bubble 46 + two tails

// ── the three goals (the scene-answered question) ────────────────────────────
// 152 × 48 stage units per target, two lines of 14 / 12 px — comfortably over the
// readable minimum once the band scales the stage.
// 48, not 42: every one of the three subtitles is a shade too long for the 130 units
// of inner width, so each wrapped onto a second line and the card clipped its own
// last line by 5 units — "a picture worth framing" lost "framing". The card has to
// be tall enough for the two-line case, and the step has to clear the taller card.
// The card holds a title AND a caption, and the caption wraps: "a picture worth
// framing" is two lines at 152 wide, so 17 + 30 = 47 units of text sat in a 48-unit
// box and the words touched the rule top and bottom (measured −1.6dp). Padding
// cannot fix a box that is shorter than its own contents.
//
// Taller, and lifted rather than extended — the stack already ended 12 units below
// the frame it sits in, so growing downward would have doubled that. Starting at
// 318 instead of 336 keeps the bottom exactly where it was.
const CARD_L = 226, CARD_W = 152, CARD_H = 54, CARD_STEP = 58, CARD_T = 318;
const GOALS = [
  { id: 'a', title: 'A FINE DRAWING', sub: 'a picture worth framing', correct: false },
  { id: 'b', title: 'RETRAIN THE EYE', sub: 'see colour, not the idea', correct: true },
  { id: 'c', title: 'PRACTICE FIRST', sub: 'leaves before whole trees', correct: false },
];

const VEIN_Y = [16, 32, 48, 64];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const BIRD = BEATS.map((b) => b.bird ?? 0);
const EGO = BEATS.map((b) => b.ego ?? 0);
const LEAF = BEATS.map((b) => b.leaf ?? 0);
const SELF = BEATS.map((b) => b.self ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics5'));

export default function Aesthetics5Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(4);
  const cur = BEATS[i];
  const showPick = !!cur.interact;
  const showWord = (cur.leaf ?? 0) > 0 && !cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    const leaf = carry(cv, 0, n, LEAF[p], LEAF[n], tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      bird: carry(cv, 1, n, BIRD[p], BIRD[n], tr),
      ego: carry(cv, 2, n, EGO[p], EGO[n], tr),
      leaf,
      // The mind's label is struck out AFTER the drawing has arrived, never with it.
      strike: clamp01((leaf - 0.3) / 0.6),
      self: carry(cv, 3, n, SELF[p], SELF[n], tr),
      hover: Math.sin(t * 2.4) * 7,
      flap: Math.sin(t * 9) * 16,
      sway: Math.sin(t * 1.25) * 4,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // The bar never collapses to literally zero: a hairline of self is the honest
  // reading of Murdoch (the ego quiets, it does not die).
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.012, SCENE.value.self) }] }));
  const egoStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.ego,
    transform: [{ scale: 0.72 + 0.28 * SCENE.value.ego }, { translateY: (1 - SCENE.value.ego) * -12 }],
  }));
  const birdStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.bird,
    transform: [{ translateY: SCENE.value.hover }],
  }));
  const wingL = useAnimatedStyle(() => ({ transform: [{ rotate: `${-18 - SCENE.value.flap}deg` }] }));
  const wingR = useAnimatedStyle(() => ({ transform: [{ rotate: `${18 + SCENE.value.flap}deg` }] }));
  const leafStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.leaf,
    transform: [{ rotate: `${SCENE.value.sway}deg` }],
  }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.leaf,
    transform: [{ translateX: (1 - SCENE.value.leaf) * 16 }],
  }));
  const strikeStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.strike }] }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── THE ATTENTION METER ─────────────────────────────────────────────── */}
      <View style={styles.layer} pointerEvents="none">
        <Text style={styles.metTitle}>ATTENTION</Text>

        <View style={styles.metBar}>
          <View style={[styles.metTick, { left: MET_W * 0.25 }]} />
          <View style={[styles.metTick, { left: MET_W * 0.5 }]} />
          <View style={[styles.metTick, { left: MET_W * 0.75 }]} />
          <Animated.View style={[styles.metFill, fillStyle]} />
        </View>

        <View style={styles.metLegend}>
          <View style={styles.legItem}>
            <View style={styles.swInk} />
            <Text style={styles.legText}>SELF</Text>
          </View>
          <View style={styles.legItem}>
            <Text style={styles.legText}>WORLD</Text>
            <View style={styles.swPaper} />
          </View>
        </View>

        {/* ── THE FRAME: a window with a sill ──────────────────────────────── */}
        <View style={styles.frame} />
        <View style={styles.sill} />
      </View>

      {/* ── the brooding self-cloud ──────────────────────────────────────────── */}
      <Animated.View style={[styles.ego, egoStyle]} pointerEvents="none">
        <View style={styles.egoBubble}>
          <Text style={styles.egoText}>me · me · me</Text>
        </View>
        <View style={styles.egoTail1} />
        <View style={styles.egoTail2} />
      </Animated.View>

      {/* ── the hovering kestrel ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.bird, birdStyle]} pointerEvents="none">
        <Animated.View style={[styles.wing, styles.wingLeft, wingL]} />
        <Animated.View style={[styles.wing, styles.wingRight, wingR]} />
        <View style={styles.birdTail} />
        <View style={styles.birdBody} />
        <View style={styles.birdHead} />
        <View style={styles.birdBeak} />
        <View style={styles.birdEye} />
      </Animated.View>

      {/* ── Ruskin's single leaf ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.leaf, leafStyle]} pointerEvents="none">
        <View style={styles.leafBlade} />
        <View style={styles.leafRib} />
        {VEIN_Y.map((y) => (
          <View key={`l${y}`} style={[styles.veinL, { top: y + 12 }]} />
        ))}
        {VEIN_Y.map((y) => (
          <View key={`r${y}`} style={[styles.veinR, { top: y + 12 }]} />
        ))}
        <View style={styles.leafStem} />
      </Animated.View>

      {/* ── the word the mind swaps in, struck out ───────────────────────────── */}
      {showWord && (
        <>
          <View style={styles.layer} pointerEvents="none">
            <Text style={[styles.capText, { left: IN_L, width: 84 }]}>THE EYE</Text>
            <Text style={[styles.capText, { left: WORD_L, width: WORD_W }]}>THE MIND</Text>
          </View>
          <Animated.View style={[styles.wordBox, wordStyle]} pointerEvents="none">
            <Text style={styles.wordText}>LEAF</Text>
            <Animated.View style={[styles.strike, strikeStyle]} />
          </Animated.View>
        </>
      )}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />

      {/* ── Q2: tap the goal Ruskin was really after ─────────────────────────── */}
      {showPick && (
        <>
          {/* The "what do I do?" label. Never a Pressable — it must not eat a tap. */}
          <View style={styles.layer} pointerEvents="none">
            <Text style={[styles.capText, { left: CARD_L, width: CARD_W }]}>TAP THE REAL GOAL</Text>
          </View>
          {GOALS.map((g, k) => {
            const chosen = picked === g.id;
            const right = answered && g.correct;
            const wrong = answered && chosen && !g.correct;
            return (
              <Target id={g.id} correct={g.correct} picked={picked} onPick={onPick}
              key={g.id} style={[styles.cardSlot, { top: CARD_T + k * CARD_STEP }]} disabled={answered}>
                <View style={[styles.card, right && styles.cardRight, wrong && styles.cardWrong]}>
                  <Text style={[styles.cardTitle, right && styles.cardTitleOn]}>{g.title}</Text>
                  <Text style={[styles.cardSub, right && styles.cardSubOn]}>{g.sub}</Text>
                </View>
              </Target>
            );
          })}
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for the static furniture. Always pointerEvents="none".
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 22, right: 10, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the meter ───────────────────────────────────────────────────────────────
  metTitle: {
    position: 'absolute', left: MET_L, top: MET_TITLE_T, width: MET_W,
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 15, letterSpacing: 2, color: SOFT,
    includeFontPadding: false,
  },
  metBar: {
    position: 'absolute', left: MET_L, top: MET_BAR_T, width: MET_W, height: MET_BAR_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER, overflow: 'hidden',
  },
  metTick: { position: 'absolute', top: 0, bottom: 0, width: 1.5, backgroundColor: RULE },
  metFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%',
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  metLegend: {
    position: 'absolute', left: MET_L, top: MET_LEG_T, width: MET_W, height: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  legItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 15, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },
  swInk: { width: 13, height: 13, backgroundColor: INK, borderRadius: 2 },
  swPaper: { width: 13, height: 13, backgroundColor: PAPER, borderWidth: 1.5, borderColor: INK, borderRadius: 2 },

  // ── the frame ───────────────────────────────────────────────────────────────
  frame: {
    position: 'absolute', left: FR_L, top: FR_T, width: FR_W, height: FR_H,
    borderWidth: 3, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  sill: {
    position: 'absolute', left: FR_L - 10, top: FR_T + FR_H, width: FR_W + 20, height: 8,
    backgroundColor: INK, borderRadius: 2,
  },
  capText: {
    position: 'absolute', top: CAP_T,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },

  // ── the self-cloud ──────────────────────────────────────────────────────────
  ego: { position: 'absolute', left: EGO_L, top: EGO_T, width: EGO_W, height: EGO_H },
  egoBubble: {
    position: 'absolute', left: 0, top: 0, width: EGO_W, height: 46,
    borderWidth: 2, borderColor: SOFT, borderRadius: 23, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  egoText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 17, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },
  egoTail1: {
    position: 'absolute', left: 56, top: 50, width: 11, height: 11, borderRadius: 5.5,
    borderWidth: 2, borderColor: SOFT, backgroundColor: PAPER,
  },
  egoTail2: {
    position: 'absolute', left: 48, top: 62, width: 7, height: 7, borderRadius: 3.5,
    borderWidth: 2, borderColor: SOFT, backgroundColor: PAPER,
  },

  // ── the kestrel ─────────────────────────────────────────────────────────────
  bird: { position: 'absolute', left: BIRD_L, top: BIRD_T, width: BIRD_W, height: BIRD_H },
  birdBody: { position: 'absolute', left: 42, top: 20, width: 24, height: 36, borderRadius: 12, backgroundColor: INK },
  birdHead: { position: 'absolute', left: 43, top: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: INK },
  birdEye: { position: 'absolute', left: 47, top: 9, width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: PAPER },
  birdBeak: {
    position: 'absolute', left: 34, top: 10, width: 0, height: 0,
    borderTopWidth: 4.5, borderBottomWidth: 4.5, borderRightWidth: 9,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: INK,
  },
  birdTail: {
    position: 'absolute', left: 48, top: 52, width: 12, height: 24, backgroundColor: INK,
    borderBottomLeftRadius: 5, borderBottomRightRadius: 5,
  },
  // Wings pivot at the body, so the flap sweeps the tips instead of sliding the bar.
  wing: { position: 'absolute', top: 24, width: 42, height: 11, borderRadius: 5.5, backgroundColor: INK },
  wingLeft: { left: 2, transformOrigin: '100% 50%' },
  wingRight: { left: 64, transformOrigin: '0% 50%' },

  // ── Ruskin's leaf ───────────────────────────────────────────────────────────
  leaf: { position: 'absolute', left: LEAF_L, top: LEAF_T, width: LEAF_W, height: LEAF_H, transformOrigin: '50% 100%' },
  leafBlade: {
    position: 'absolute', left: 8, top: 0, width: 42, height: 88,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    borderTopLeftRadius: 21, borderTopRightRadius: 21, borderBottomLeftRadius: 6, borderBottomRightRadius: 26,
  },
  leafRib: { position: 'absolute', left: 28, top: 8, width: 2, height: 76, backgroundColor: SOFT },
  veinL: { position: 'absolute', left: 14, width: 15, height: 1.6, backgroundColor: SOFT, transformOrigin: '100% 50%', transform: [{ rotate: '-32deg' }] },
  veinR: { position: 'absolute', left: 30, width: 15, height: 1.6, backgroundColor: SOFT, transformOrigin: '0% 50%', transform: [{ rotate: '32deg' }] },
  leafStem: { position: 'absolute', left: 27.5, top: 86, width: 3, height: 32, backgroundColor: INK, borderRadius: 1.5 },

  // ── the mind's label, struck out ────────────────────────────────────────────
  wordBox: {
    position: 'absolute', left: WORD_L, top: WORD_T, width: WORD_W, height: WORD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  wordText: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, lineHeight: 38, color: INK,
    letterSpacing: 3, includeFontPadding: false,
  },
  strike: {
    position: 'absolute', left: 14, top: WORD_H / 2 - 2, width: WORD_W - 28, height: 3.5,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '0% 50%',
  },

  // ── the three goals ─────────────────────────────────────────────────────────
  cardSlot: { position: 'absolute', left: CARD_L, width: CARD_W, height: CARD_H },
  card: {
    width: CARD_W, height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, justifyContent: 'center', paddingHorizontal: 9,
  },
  cardRight: { backgroundColor: INK, borderColor: INK },
  cardWrong: { borderColor: SOFT, opacity: 0.45 },
  cardTitle: {
    fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 17, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  cardTitleOn: { color: PAPER },
  // lineHeight 14, not 15: the caption is two lines in this width, so every unit
  // of leading is doubled. 17 (title) + 28 (caption) = 45 in a 54-unit box leaves
  // 4.5 units — about 4dp — clear of the rule top and bottom.
  cardSub: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 14, color: SOFT, includeFontPadding: false },
  cardSubOn: { color: RULE },
});

// BAND. Topmost ink is the meter's title at 236; the lowest is the figure's ankle
// joint, whose circle reaches ≈ 507 (feet on GROUND = 500, joint radius 11 × 1.35 / 2).
// Every extreme in between sits inside that: the meter ends at 308, the self-cloud
// spans 286…356, the frame 312…476 with its sill to 484, the kestrel 341…433 at the
// top and bottom of its hover, the leaf 338…458 and the goal cards 336…468. So
// [228, 514] holds the lot with 8 units of margin above and 7 below, and the scene
// renders about 2.26× instead of the 1.15× a full-height fit letterboxes it to.
export function Aesthetics5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics5Scene} band={[228, 514]} camera={CAM} />;
}
