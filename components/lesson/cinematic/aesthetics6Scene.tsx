import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './aesthetics6Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A tiny figure at the foot of a vast range — and, written up beside it, the TABLE
// Burke actually drew: two columns that are two different responses, not two doses
// of the same one.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · The main peak's apex is (250, 246) and its base runs the full width at the
//     ground line, so the sky wedge to its LEFT is free: the table owns x 14–186,
//     y 244–344, and the peak's left slope is at x ≈ 191 by the time it reaches
//     the table's bottom edge.
//   · The figure stands at x = 70 on GROUND = 500 — crown ≈ 361, hands never past
//     x ≈ 107 — so it sits under the table and left of every card.
//   · The flower (beauty, the foil) blooms at x ≈ 172 with its tag box at y 414–436,
//     clear of the figure's widest gesture.
//   · KANT'S CARD is pinned over the peak's right flank at x 244–384, y 302–366.
//   · Snow falls from y 250 to 496 and is drawn BEHIND every card, so nothing ever
//     drifts across a label.
//   · Nothing is drawn above y = 244 or below the ground line, which is what lets
//     the player crop to band [238, 510] and render ~2.3× instead of 1.15×.

const FIG_X = 70;
const PEAK_X = 250;
const PEAK_T = 246;

// ── Burke's two columns ──────────────────────────────────────────────────────
const TB_L = 14;
const TB_W = 172;
const COL_W = 82;
const COL_B_L = TB_L + TB_W - COL_W;        // 104
const ROW_T = [288, 308, 328];
const ROWS = [
  { a: 'SMALL', b: 'VAST' },
  { a: 'SMOOTH', b: 'RUGGED' },
  { a: 'PLEASES', b: 'OVERWHELMS' },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const VAST = BEATS.map((b) => b.vast ?? 0);
const FLOWER = BEATS.map((b) => b.flower ?? 0);
const SPLIT = BEATS.map((b) => b.split ?? 0);
const MIND = BEATS.map((b) => b.mind ?? 0);
const FLAKES = Array.from({ length: 16 }, (_, k) => ({
  x: 78 + (k * 311) % 300, ph: (k * 0.17) % 1, sp: 0.14 + (k % 4) * 0.03,
}));

export default function Aesthetics6Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      vast: L(VAST[p], VAST[n]),
      flower: L(FLOWER[p], FLOWER[n]),
      split: L(SPLIT[p], SPLIT[n]),
      mind: L(MIND[p], MIND[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const vastStyle = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * SCENE.value.vast }));
  const flowerStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.flower,
    transform: [{ scale: 0.7 + 0.3 * SCENE.value.flower }],
  }));
  const tagStyle = useAnimatedStyle(() => {
    const u = ease01(SCENE.value.flower);
    return { opacity: u, transform: [{ translateY: (1 - u) * 8 }] };
  });
  const tableStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.split * 2) }));
  const mindStyle = useAnimatedStyle(() => {
    const u = ease01(SCENE.value.mind);
    return { opacity: u, transform: [{ scale: 0.86 + 0.14 * u }] };
  });
  // The two rings breathe against each other — reason turning the endless over.
  const ringA = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.07 * Math.sin(SCENE.value.t * 1.7) }] }));
  const ringB = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.07 * Math.sin(SCENE.value.t * 1.7 + Math.PI) }] }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the range ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, vastStyle]} pointerEvents="none">
        <View style={styles.peakFarL} />
        <View style={styles.peakFarR} />
        <View style={styles.peakMain} />
        <View style={styles.ridgeA} />
        <View style={styles.ridgeB} />
        <View style={styles.snowCap} />
        <View style={[styles.mist, { top: 372, left: 128, width: 250 }]} />
        <View style={[styles.mist, { top: 408, left: 96, width: 300 }]} />
      </Animated.View>

      {/* snow, behind every card so it never drifts across a label */}
      {FLAKES.map((s, k) => <Flake key={k} S={SCENE} s={s} k={k} />)}
      <View style={styles.ground} pointerEvents="none" />

      {/* ── the merely beautiful ──────────────────────────────────────────────── */}
      <Animated.View style={[styles.flower, flowerStyle]} pointerEvents="none">
        <View style={styles.stem} />
        <View style={styles.leaf} />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <View key={a} style={[styles.petal, { transform: [{ rotate: `${a}deg` }, { translateY: -10 }] }]} />
        ))}
        <View style={styles.flowerCore} />
      </Animated.View>
      <Animated.View style={[styles.tagWrap, tagStyle]} pointerEvents="none">
        <View style={styles.tagBox}><Text style={styles.tagT}>BEAUTY</Text></View>
        <View style={styles.tagStem} />
      </Animated.View>

      {/* ── Burke's split, written up in the sky beside the peak ──────────────── */}
      <Animated.View style={[StyleSheet.absoluteFill, tableStyle]} pointerEvents="none">
        <Text style={styles.tbTitle}>BURKE’S SPLIT</Text>
        <Text style={[styles.head, { left: TB_L, width: COL_W }]}>BEAUTY</Text>
        <Text style={[styles.head, { left: COL_B_L, width: COL_W }]}>SUBLIME</Text>
        <View style={styles.headRule} />
        <View style={styles.colRule} />
      </Animated.View>
      {ROWS.map((r, k) => <Row key={r.a} S={SCENE} k={k} a={r.a} b={r.b} />)}

      {/* ── Kant: the awe moves inside ────────────────────────────────────────── */}
      <Animated.View style={[styles.mindCard, mindStyle]} pointerEvents="none">
        <Animated.View style={[styles.ring, { left: 48 }, ringA]} />
        <Animated.View style={[styles.ring, { left: 66 }, ringB]} />
        <Text style={styles.mindT}>REASON HOLDS IT</Text>
      </Animated.View>

      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One line of the table — it writes itself in from the left, one row at a time. */
function Row({ S, k, a, b }: { S: SharedValue<any>; k: number; a: string; b: string }) {
  const st = useAnimatedStyle(() => {
    const on = ease01(clamp01(S.value.split - k));
    return { opacity: on, transform: [{ translateX: (1 - on) * -16 }] };
  });
  return (
    <Animated.View style={[styles.row, { top: ROW_T[k] }, st]} pointerEvents="none">
      <Text style={[styles.cell, styles.cellSoft, { left: TB_L, width: COL_W }]}>{a}</Text>
      <Text style={[styles.cell, { left: COL_B_L, width: COL_W }]}>{b}</Text>
    </Animated.View>
  );
}

function Flake({ S, s, k }: { S: SharedValue<any>; s: { x: number; ph: number; sp: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const f = ((S.value.t * s.sp + s.ph) % 1 + 1) % 1;
    const y = lerp(250, GROUND - 4, f);
    const sway = Math.sin(S.value.t * 1.2 + k) * 12;
    return {
      opacity: (0.4 + 0.4 * Math.sin(f * Math.PI)) * S.value.vast,
      transform: [{ translateX: sway }, { translateY: y - 250 }],
    };
  });
  return <Animated.View style={[styles.flake, { left: s.x, top: 250 }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 24, top: GROUND, height: 1.5, backgroundColor: RULE },

  // border-triangles: base at the ground, apex up
  peakMain: {
    position: 'absolute', left: 96, top: PEAK_T, width: 0, height: 0,
    borderLeftWidth: 154, borderRightWidth: 154, borderBottomWidth: 254,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: SOFT,
  },
  peakFarR: {
    position: 'absolute', left: 258, top: 312, width: 0, height: 0,
    borderLeftWidth: 92, borderRightWidth: 92, borderBottomWidth: 188,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: RULE,
  },
  peakFarL: {
    position: 'absolute', left: 8, top: 372, width: 0, height: 0,
    borderLeftWidth: 68, borderRightWidth: 68, borderBottomWidth: 128,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: RULE,
  },
  snowCap: {
    position: 'absolute', left: PEAK_X - 22, top: PEAK_T, width: 0, height: 0,
    borderLeftWidth: 22, borderRightWidth: 22, borderBottomWidth: 38,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: PAPER,
  },
  // two crevasses cut down the face, so the mass is not one flat grey wedge
  ridgeA: {
    position: 'absolute', left: 236, top: 300, width: 2, height: 170,
    backgroundColor: RULE, transformOrigin: '50% 0%', transform: [{ rotate: '13deg' }],
  },
  ridgeB: {
    position: 'absolute', left: 268, top: 314, width: 2, height: 150,
    backgroundColor: RULE, transformOrigin: '50% 0%', transform: [{ rotate: '-11deg' }],
  },
  mist: { position: 'absolute', height: 2, backgroundColor: PAPER, opacity: 0.55, borderRadius: 1 },
  flake: {
    position: 'absolute', width: 5.5, height: 5.5, borderRadius: 3,
    backgroundColor: PAPER, borderWidth: 1, borderColor: SOFT,
  },

  flower: { position: 'absolute', left: 154, top: 434, width: 36, height: 66, alignItems: 'center' },
  stem: { position: 'absolute', bottom: 0, width: 2.5, height: 34, backgroundColor: SOFT },
  leaf: {
    position: 'absolute', bottom: 10, left: 20, width: 12, height: 6, borderRadius: 6,
    backgroundColor: SOFT, transform: [{ rotate: '-18deg' }],
  },
  petal: { position: 'absolute', top: 12, width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER },
  flowerCore: { position: 'absolute', top: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: INK },

  tagWrap: { position: 'absolute', left: 132, top: 400, width: 80, alignItems: 'center' },
  tagBox: {
    width: 80, height: 22, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  tagT: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, color: INK, includeFontPadding: false },
  tagStem: { width: 1.5, height: 12, backgroundColor: INK },

  tbTitle: {
    position: 'absolute', left: TB_L, top: 244, width: TB_W,
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  head: {
    position: 'absolute', top: 264, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  headRule: { position: 'absolute', left: TB_L, top: 282, width: TB_W, height: 1.5, backgroundColor: RULE },
  colRule: { position: 'absolute', left: TB_L + COL_W + 4, top: 262, width: 1.5, height: 84, backgroundColor: RULE },

  row: { position: 'absolute', left: 0, width: STAGE_W, height: 18 },
  cell: {
    position: 'absolute', top: 0, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  cellSoft: { color: SOFT },

  mindCard: {
    position: 'absolute', left: 244, top: 302, width: 140, height: 64,
    borderWidth: 2.5, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
  },
  ring: { position: 'absolute', top: 8, width: 24, height: 24, borderRadius: 12, borderWidth: 2.5, borderColor: INK },
  mindT: {
    position: 'absolute', left: 0, top: 40, width: 140, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
});

// Art runs from the peak's apex and the table title at y 244 down to the ground
// line at 501.5. Snow falls between 250 and 496, the flower's tag box tops out at
// 414 and Kant's card bottoms at 366, so this band holds every extreme with 6
// units of margin at the top and 8 at the bottom.
export function Aesthetics6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics6Scene} band={[238, 510]} />;
}
