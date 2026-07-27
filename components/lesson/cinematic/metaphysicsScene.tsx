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
// Three pieces of information design carry the argument:
//   1. EVERYTHING THERE IS — a framed sky the figure wipes clean. When the last
//      star is gone a plate stamps over the void: STILL SOMETHING. That is the
//      Parmenides beat, drawn rather than narrated.
//   2. THE CHAIN OF CAUSES — a labelled left-to-right flow, ? → EARLIER → BEFORE
//      → NOW, with ghost "?" boxes receding off the left edge. That is exactly
//      what science does and exactly where it stops.
//   3. WHY ANYTHING AT ALL? — the lesson's question, stamped on a plate.
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

// stars, positioned INSIDE the sky frame (it clips, so nothing can escape it)
const STARS: { x: number; y: number; r: number; th: number; ph: number }[] = [
  { x: 18, y: 32, r: 2.5, th: 0.10, ph: 0.2 }, { x: 52, y: 60, r: 3.0, th: 0.55, ph: 1.1 },
  { x: 86, y: 26, r: 2.0, th: 0.30, ph: 2.0 }, { x: 120, y: 52, r: 3.5, th: 0.72, ph: 0.7 },
  { x: 150, y: 30, r: 2.5, th: 0.22, ph: 1.6 }, { x: 182, y: 66, r: 2.0, th: 0.62, ph: 2.5 },
  { x: 214, y: 28, r: 3.0, th: 0.80, ph: 0.9 }, { x: 244, y: 56, r: 2.5, th: 0.40, ph: 1.9 },
  { x: 276, y: 32, r: 3.5, th: 0.66, ph: 0.4 }, { x: 306, y: 62, r: 2.0, th: 0.34, ph: 2.2 },
  { x: 334, y: 34, r: 3.0, th: 0.50, ph: 1.3 }, { x: 34, y: 80, r: 2.0, th: 0.48, ph: 0.6 },
  { x: 100, y: 82, r: 2.5, th: 0.76, ph: 1.7 }, { x: 166, y: 84, r: 2.0, th: 0.26, ph: 2.4 },
  { x: 232, y: 80, r: 3.0, th: 0.58, ph: 0.3 }, { x: 296, y: 84, r: 2.5, th: 0.44, ph: 1.5 },
  { x: 66, y: 44, r: 2.0, th: 0.68, ph: 0.8 }, { x: 198, y: 44, r: 2.5, th: 0.36, ph: 2.8 },
  { x: 262, y: 70, r: 2.0, th: 0.18, ph: 1.0 }, { x: 130, y: 76, r: 2.0, th: 0.84, ph: 2.6 },
  { x: 344, y: 70, r: 2.5, th: 0.14, ph: 0.5 }, { x: 10, y: 58, r: 2.0, th: 0.64, ph: 1.4 },
];

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
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  return (
    <View style={styles.scene}>
      <Sky S={SCENE} />
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

// ── 2. the chain of causes, receding without a floor ─────────────────────────

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

// ── 3. the question itself, stamped on a plate ───────────────────────────────

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
// (~507, on the ground rule at 500). The chain, its caption and the question
// plate all sit between them, and nothing is drawn outside that slice.
export function MetaphysicsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={MetaphysicsScene} band={[234, 514]} />;
}
