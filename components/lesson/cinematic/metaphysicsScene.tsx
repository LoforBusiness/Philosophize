import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './metaphysicsScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand, type Bundle,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// ─────────────────────────────────────────────────────────────────────────────
// WHY IS THERE SOMETHING RATHER THAN NOTHING?
//
// Four pieces of information design carry the argument:
//   1. EVERYTHING THERE IS — a framed sky the figure wipes clean. When the last
//      star is gone a plate stamps over the void: STILL SOMETHING. That is the
//      Parmenides beat, drawn rather than narrated.
//   2. SUFFICIENT REASON — Leibniz's rule, written line by line on a card the
//      exact width of the question plate and joined to it by an arrow, so the
//      stage reads as an argument: this RULE is what FORCES that question.
//   3. THE CHAIN OF CAUSES — a labelled left-to-right flow, ? → EARLIER → BEFORE
//      → NOW, with ghost "?" boxes receding off the left edge. That is exactly
//      what science does and exactly where it stops.
//   4. WHY ANYTHING AT ALL? — the lesson's question, stamped on a plate.
//   5. CAN IT BE THOUGHT? — the Parmenides card: the word NOTHING written out and
//      then struck through, because "what is not" can be neither thought nor
//      spoken. A word animation, not a sentence in the deck.
//
// The rule card, the chain and the Parmenides card all share the same slice of the
// stage (y 354..414) — it is the ARGUMENT SLOT, and exactly one thing is ever in
// it: the rule on the two Leibniz beats, the Parmenides card on the erase beat,
// the chain on the three science beats. The Parmenides card deliberately waits
// until bt = 0.7s to fade up, by which point the rule card it replaces is at 7%,
// so two cards never read on top of each other in that one slot.
//
// CAMERA: none (the old one only translated the stage 2px, which made the band
// impossible to reason about). Design space is final space, so the figure stands
// on GROUND=500 with its crown at ~361. Art occupies y 244..508 → band [234, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.85;

// the framed sky
const SKY_L = 22;
const SKY_T = 244;
const SKY_W = 356;
const SKY_H = 100;

// Stars, positioned INSIDE the sky frame (it clips, so nothing can escape it).
//
// `th` is the erase level at which a star starts to go, and it is now dealt BY X —
// high x (nearest the figure, who stands at 340) goes first, low x last — so the
// erasure reads as a hand sweeping the sky clean from right to left instead of
// stars randomly winking out. It also fixes a real defect: the thresholds used to
// run to 0.84 while the beat only erases to 0.86 and each star needs th+0.12 to
// vanish, so three stars were still visibly on when STILL SOMETHING stamped over
// an allegedly empty void. The highest th is now 0.64, i.e. every star is gone by
// erase 0.76 — comfortably before the stamp completes at 0.80.
const STARS: { x: number; y: number; r: number; th: number; ph: number }[] = [
  { x: 18, y: 32, r: 2.5, th: 0.63, ph: 0.2 }, { x: 52, y: 60, r: 3.0, th: 0.57, ph: 1.1 },
  { x: 86, y: 26, r: 2.0, th: 0.52, ph: 2.0 }, { x: 120, y: 52, r: 3.5, th: 0.46, ph: 0.7 },
  { x: 150, y: 30, r: 2.5, th: 0.41, ph: 1.6 }, { x: 182, y: 66, r: 2.0, th: 0.35, ph: 2.5 },
  { x: 214, y: 28, r: 3.0, th: 0.30, ph: 0.9 }, { x: 244, y: 56, r: 2.5, th: 0.25, ph: 1.9 },
  { x: 276, y: 32, r: 3.5, th: 0.20, ph: 0.4 }, { x: 306, y: 62, r: 2.0, th: 0.14, ph: 2.2 },
  { x: 334, y: 34, r: 3.0, th: 0.10, ph: 1.3 }, { x: 34, y: 80, r: 2.0, th: 0.60, ph: 0.6 },
  { x: 100, y: 82, r: 2.5, th: 0.49, ph: 1.7 }, { x: 166, y: 84, r: 2.0, th: 0.38, ph: 2.4 },
  { x: 232, y: 80, r: 3.0, th: 0.27, ph: 0.3 }, { x: 296, y: 84, r: 2.5, th: 0.16, ph: 1.5 },
  { x: 66, y: 44, r: 2.0, th: 0.55, ph: 0.8 }, { x: 198, y: 44, r: 2.5, th: 0.33, ph: 2.8 },
  { x: 262, y: 70, r: 2.0, th: 0.22, ph: 1.0 }, { x: 130, y: 76, r: 2.0, th: 0.44, ph: 2.6 },
  { x: 344, y: 70, r: 2.5, th: 0.08, ph: 0.5 }, { x: 10, y: 58, r: 2.0, th: 0.64, ph: 1.4 },
];

// Leibniz's rule. Deliberately the SAME left edge and width as the question
// plate below it, so card → arrow → question reads as one stacked diagram.
const RULE_L = 24;
const RULE_T = 354;
const RULE_W = 252;
const RULE_H = 60;
const RULE_CX = RULE_L + RULE_W / 2;

// the chain of causes: a flow of labelled boxes, oldest on the left
const CH_T = 358;
const CH_H = 34;
const BOX_W = 58;
const LINK_X = [88, 164, 240];               // EARLIER · BEFORE · NOW
const LINK_LABEL = ['EARLIER', 'BEFORE', 'NOW'];
const ARROW_X = [70, 146, 222];
const QBOX_X = 38;

const FIG_X = 340;

const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const ERASE = BEATS.map((b) => b.erase ?? 0);
const CHAIN = BEATS.map((b) => (b.chain ? 1 : 0));
const QREG = BEATS.map((b) => (b.qregress ? 1 : 0));
const RULEON = BEATS.map((b) => (b.rule ? 1 : 0));
// Only the beat that RAISES the card writes it. Without this the rule re-writes
// itself on every forward tap it survives, which reads as a stutter, not a reveal.
const RULEIN = RULEON.map((v, k) => (v === 1 && (k === 0 || RULEON[k - 1] === 0) ? 1 : 0));

function hHold(code: number, t: number) { 'worklet'; return code === 0 ? stand(t) : narratorHold(code, t); }
function hLive(code: number, t: number, bt: number) { 'worklet'; return code === 0 ? stand(t) : narratorLive(code, t, bt); }

export default function MetaphysicsScene({ clock, bt, bi, qv }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const q = clamp01(qv.value);

    const figS = mixStance(hHold(HPOSE[p], t), hLive(HPOSE[n], t, bt.value), tr);
    const erase = L(ERASE[p], ERASE[n]);

    return {
      fig: pose(figS, FIG_X, GROUND, K_FIG, -1, 1),
      erase,
      // The stamp only lands once the sky is genuinely empty.
      voidStamp: clamp01((erase - 0.55) / 0.25),
      twinkle: t,
      chainOn: L(CHAIN[p], CHAIN[n]),
      regress: QREG[n] === 1 ? ease01(q) : 0,
      intro: n === 0 ? ease01(bt.value / 0.55) : 1,
      ruleOn: L(RULEON[p], RULEON[n]),
      // The rule WRITES ITSELF on the beat that raises it: first line, then
      // second, then the arrow drops into the question. Every other beat these
      // sit at 1, so the card holds finished and fades out finished rather than
      // un-writing itself on the way off stage.
      ruleA: RULEIN[n] === 1 ? ease01((bt.value - 0.14) / 0.5) : 1,
      ruleB: RULEIN[n] === 1 ? ease01((bt.value - 0.46) / 0.5) : 1,
      ruleC: RULEIN[n] === 1 ? ease01((bt.value - 0.78) / 0.45) : 1,
      // The Parmenides card runs on its own clock at BOTH ends, because it shares
      // the argument slot with the rule card before it and the chain after it. It
      // fades UP late (bt 0.7, by which point the outgoing rule card is at 7%) and
      // DOWN fast (gone by bt 0.3, while the incoming chain is still at ~34%), so
      // two cards are never both legible in the same 60 units of stage.
      noth:
        ERASE[n] > 0
          ? ease01((bt.value - 0.7) / 0.45)
          : ERASE[p] > 0 ? clamp01(1 - bt.value / 0.3) : 0,
      nothX: ERASE[n] > 0 ? ease01((bt.value - 1.7) / 0.6) : 1,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  return (
    <View style={styles.scene}>
      <Sky S={SCENE} />
      <Rule S={SCENE} />
      <Nothing S={SCENE} />
      <Chain S={SCENE} />
      <Question S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

// ── 1. the framed sky, wiped toward nothing ──────────────────────────────────

function Star({ S, star }: { S: SharedValue<any>; star: { x: number; y: number; r: number; th: number; ph: number } }) {
  const st = useAnimatedStyle(() => {
    const gone = clamp01((S.value.erase - star.th) / 0.12);
    const tw = 0.55 + 0.45 * Math.sin(S.value.twinkle * 1.6 + star.ph);
    return { opacity: (1 - gone) * tw, transform: [{ scale: 0.5 + 0.5 * (1 - gone) }] };
  });
  return (
    <Animated.View
      style={[
        styles.star,
        { left: star.x - star.r, top: star.y - star.r, width: star.r * 2, height: star.r * 2, borderRadius: star.r },
        st,
      ]}
    />
  );
}

function Sky({ S }: { S: SharedValue<any> }) {
  const dark = useAnimatedStyle(() => ({ opacity: S.value.erase * 0.55 }));
  const stamp = useAnimatedStyle(() => ({
    opacity: S.value.voidStamp,
    transform: [{ scale: lerp(1.14, 1, S.value.voidStamp) }],
  }));
  return (
    <View style={styles.sky} pointerEvents="none">
      <Animated.View style={[styles.voidDisc, dark]} />
      {STARS.map((s, k) => <Star key={k} S={S} star={s} />)}
      <Text style={styles.skyCap}>EVERYTHING THERE IS</Text>
      <Animated.View style={[styles.stillPlate, stamp]}>
        <Text style={styles.stillText}>STILL SOMETHING</Text>
      </Animated.View>
    </View>
  );
}

// ── 2. Leibniz's rule, and the arrow from it to the question ─────────────────
// A written rule plus an arrow into the question plate: the reader SEES that the
// question is not idle curiosity, it is what this rule demands once you point it
// at everything at once.

function Rule({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.ruleOn }));
  const lineA = useAnimatedStyle(() => ({
    opacity: S.value.ruleA,
    transform: [{ translateX: (1 - S.value.ruleA) * -14 }],
  }));
  const lineB = useAnimatedStyle(() => ({
    opacity: S.value.ruleB,
    transform: [{ translateX: (1 - S.value.ruleB) * -14 }],
  }));
  // Origin at the TOP, so the stem grows down out of the card toward the plate.
  const stem = useAnimatedStyle(() => ({ opacity: S.value.ruleC, transform: [{ scaleY: S.value.ruleC }] }));
  const head = useAnimatedStyle(() => ({ opacity: S.value.ruleC }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]} pointerEvents="none">
      <View style={styles.ruleCard}>
        <Text style={styles.ruleCap}>SUFFICIENT REASON</Text>
        <Animated.Text style={[styles.ruleLine, { top: 23 }, lineA]}>NOTHING IS TRUE</Animated.Text>
        <Animated.Text style={[styles.ruleLine, { top: 39 }, lineB]}>WITHOUT A REASON WHY</Animated.Text>
      </View>
      <Animated.View style={[styles.ruleStem, stem]} />
      <Animated.View style={[styles.ruleHead, head]} />
    </Animated.View>
  );
}

// ── 2b. Parmenides: the word NOTHING, written and then struck out ────────────
// Same footprint as the rule card — the argument slot — so the stage swaps one
// claim for another rather than growing a second column. The strike is a bar with
// its origin at the left edge, so it is DRAWN across the word left to right.

function Nothing({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.noth }));
  const strike = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.nothX }] }));
  return (
    <Animated.View style={[styles.nothCard, wrap]} pointerEvents="none">
      <Text style={styles.nothCap}>CAN IT BE THOUGHT?</Text>
      <View style={styles.nothWordWrap}>
        <Text style={styles.nothWord}>NOTHING</Text>
      </View>
      <Animated.View style={[styles.nothStrike, strike]} />
    </Animated.View>
  );
}

// ── 3. the chain of causes, receding without a floor ─────────────────────────

function Chain({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.chainOn }));
  const ghost1 = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.34 * S.value.regress,
    transform: [{ translateX: -S.value.regress * 9 }],
  }));
  const ghost2 = useAnimatedStyle(() => ({
    opacity: 0.14 + 0.26 * S.value.regress,
    transform: [{ translateX: -S.value.regress * 18 }],
  }));
  // The pulse rides the GLYPH, not the box — a semi-transparent box would let the
  // ghost behind it show through and read as a printing error.
  const pulse = useAnimatedStyle(() => ({
    opacity: 0.6 + 0.4 * Math.abs(Math.sin(S.value.twinkle * 1.4)),
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]} pointerEvents="none">
      {/* the regress: ghosts of the same unanswered box, receding off the edge */}
      <Animated.View style={[styles.qbox, { left: QBOX_X - 26 }, ghost2]}>
        <Text style={styles.qboxText}>?</Text>
      </Animated.View>
      <Animated.View style={[styles.qbox, { left: QBOX_X - 13 }, ghost1]}>
        <Text style={styles.qboxText}>?</Text>
      </Animated.View>
      <View style={[styles.qbox, { left: QBOX_X }]}>
        <Animated.Text style={[styles.qboxText, pulse]}>?</Animated.Text>
      </View>

      {ARROW_X.map((x, k) => (
        <Text key={`a${k}`} style={[styles.chainArrow, { left: x }]}>→</Text>
      ))}
      {LINK_X.map((x, k) => (
        <View key={`b${k}`} style={[styles.chainBox, { left: x }]}>
          <Text style={styles.chainText}>{LINK_LABEL[k]}</Text>
        </View>
      ))}
      <Text style={styles.chainCap}>EACH STATE EXPLAINED BY AN EARLIER ONE</Text>
    </Animated.View>
  );
}

// ── 4. the question itself, stamped on a plate ───────────────────────────────

function Question({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.intro,
    transform: [{ scale: lerp(1.12, 1, S.value.intro) }],
  }));
  return (
    <Animated.View style={[styles.qPlate, st]} pointerEvents="none">
      <Text style={styles.qPlateText}>WHY ANYTHING AT ALL?</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  sky: {
    position: 'absolute', left: SKY_L, top: SKY_T, width: SKY_W, height: SKY_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER, overflow: 'hidden',
  },
  skyCap: {
    position: 'absolute', left: 10, top: 5,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  voidDisc: { position: 'absolute', left: 86, top: 8, width: 180, height: 78, borderRadius: 39, backgroundColor: INK },
  star: { position: 'absolute', backgroundColor: INK },
  stillPlate: {
    position: 'absolute', left: 92, top: 26, width: 168, height: 32,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  stillText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 1.4, color: INK, includeFontPadding: false,
  },

  ruleCard: {
    position: 'absolute', left: RULE_L, top: RULE_T, width: RULE_W, height: RULE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
  },
  ruleCap: {
    position: 'absolute', left: 12, top: 7,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.3, color: SOFT, includeFontPadding: false,
  },
  ruleLine: {
    position: 'absolute', left: 12,
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.4, lineHeight: 15, color: INK,
    includeFontPadding: false,
  },
  ruleStem: {
    position: 'absolute', left: RULE_CX - 1.25, top: RULE_T + RULE_H,
    width: 2.5, height: 8, backgroundColor: INK, transformOrigin: '50% 0%',
  },
  ruleHead: {
    position: 'absolute', left: RULE_CX - 5, top: RULE_T + RULE_H + 7,
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },

  nothCard: {
    position: 'absolute', left: RULE_L, top: RULE_T, width: RULE_W, height: RULE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
  },
  nothCap: {
    position: 'absolute', left: 12, top: 7,
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.3, color: SOFT, includeFontPadding: false,
  },
  nothWordWrap: {
    position: 'absolute', left: 0, right: 0, top: 24, height: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  nothWord: {
    fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: 5, color: INK, includeFontPadding: false,
  },
  nothStrike: {
    position: 'absolute', left: 46, top: 38, width: 160, height: 3,
    backgroundColor: INK, borderRadius: 1.5, transformOrigin: '0% 50%',
  },

  qbox: {
    position: 'absolute', top: CH_T, width: 32, height: CH_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  qboxText: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: INK, includeFontPadding: false,
  },
  chainBox: {
    position: 'absolute', top: CH_T, width: BOX_W, height: CH_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  chainText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  chainArrow: {
    position: 'absolute', top: CH_T + 7, width: 18, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 15, color: SOFT, includeFontPadding: false,
  },
  chainCap: {
    position: 'absolute', left: 24, top: CH_T + 42,
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },

  qPlate: {
    position: 'absolute', left: 24, top: 428, width: 252, height: 44,
    borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  qPlateText: {
    fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
});

// Extremes: the sky frame's top edge (244) down to the figure's ankle joints
// (~507, on the ground rule at 500). The rule card and the Parmenides card share
// 354..414, the arrow into the plate runs 414..428, and the chain (358..392), its
// caption (400..411) and the question plate (428..472) sit between them. Nothing
// is drawn outside that slice: the figure's highest pixel is its crown at ~360
// (the gaze-up hand at hpose 6 clamps to its arm's reach around 367), so even the
// tallest pose stays clear of the sky frame's floor at 344.
//
// 280 units is also the tightest band that still pays: the stage region is about
// 923×647 device px, so 647/280 ≈ 923/400 — crop any harder and the WIDTH becomes
// the limit, so the art stops growing while the risk of clipping does not.
export function MetaphysicsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={MetaphysicsScene} band={[234, 514]} />;
}
