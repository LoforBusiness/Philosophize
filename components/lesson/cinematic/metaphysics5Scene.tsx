import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics5Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// THE TWO PANELS. The lesson's question drawn as the comparison it literally is: two
// frames of exactly the same size, side by side. On the left, NOTHING — a dashed,
// empty frame with the empty-set glyph ruled through it. On the right, SOMETHING —
// the same frame packed with a cosmos. Between them, at full height, the "?".
// Underneath, Leibniz's principle is ruled in as a labelled arrow. The figure stands
// stage left and, on the Dasein beat, is tagged as one of the somethings.
//
// COMPOSITION / OCCLUSION —
//   · the figure stands at x = 62 and never moves; its widest pose (24, both arms
//     up) spans x ≈ 30…94 and its crown rides to y ≈ 355.
//   · every panel, label and rule lives at x ≥ 124, so nothing can ever cover it.
//   · the DASEIN tag sits at x 4…118, y 296…340 — above the crown, left of panel A.

const FIG_X = 62;
// The head's own radius is 20·K_FIG; 26 leaves a ring of air around it rather than
// tracing the skull exactly.
const AURA_R = 26;

const PAN_T = 254;
const PAN_H = 166;
const PAN_W = 104;
const PAN_A = 124;                        // NOTHING   124 … 228
const PAN_B = 278;                        // SOMETHING 278 … 382
const GAP_L = 228;                        // the "?" column, 50 wide
const GAP_W = 50;

const PSR_L = 124;
const PSR_W = 258;                        // spans both panels

// Decorrelated sin-hash so the cosmos scatters instead of marching in a diagonal
// line (a plain `k*137 % 320` steps x and y together — a visible streak).
const hash = (n: number) => { const v = Math.sin(n) * 43758.5453; return v - Math.floor(v); };
// Kept clear of the frame by a star's own diameter, so overflow:hidden never slices
// one in half — a half-star reads as a rendering bug, not as a cosmos.
const STARS = Array.from({ length: 34 }, (_, k) => ({
  x: 4 + hash(k * 1.7 + 0.3) * 88,        // panel-local, 99 usable
  y: 4 + hash(k * 2.9 + 1.1) * 150,       // panel-local, 161 usable
  r: 0.9 + hash(k * 3.7 + 0.5) * 2.0,
}));
const SPARKS = [{ x: 22, y: 34 }, { x: 78, y: 96 }];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const STARB = BEATS.map((b) => b.stars ?? 0);
const QB = BEATS.map((b) => b.q ?? 0);
const DAS = BEATS.map((b) => b.dasein ?? 0);
const PSR = BEATS.map((b) => b.psr ?? 0);

export default function Metaphysics5Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      stars: L(STARB[p], STARB[n]),
      q: L(QB[p], QB[n]),
      dasein: L(DAS[p], DAS[n]),
      psr: L(PSR[p], PSR[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const qStyle = useAnimatedStyle(() => {
    const pulse = 0.92 + 0.08 * Math.sin(SCENE.value.t * 2.2);
    return { opacity: SCENE.value.q, transform: [{ scale: (0.72 + 0.28 * SCENE.value.q) * pulse }] };
  });
  const starStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stars }));
  const psrStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.psr,
    transform: [{ translateX: (1 - SCENE.value.psr) * -22 }],
  }));
  // The tag STAMPS in — it comes down oversized and settles to true size.
  const tagStyle = useAnimatedStyle(() => {
    const d = SCENE.value.dasein;
    // 1.18 max: any bigger and the oversized box clips panel A on the way down.
    return { opacity: d, transform: [{ scale: 1.18 - 0.18 * d }] };
  });
  const auraStyle = useAnimatedStyle(() => {
    const pulse = 0.7 + 0.3 * Math.sin(SCENE.value.t * 2.6);
    return { opacity: SCENE.value.dasein * pulse, transform: [{ scale: 0.9 + 0.15 * pulse }] };
  });

  return (
    <Animated.View style={styles.scene}>
      {/* ── the two frames ───────────────────────────────────────────────────── */}
      <View style={styles.layer} pointerEvents="none">
        <Text style={[styles.panLabel, { left: PAN_A }]}>NOTHING</Text>
        <Text style={[styles.panLabel, { left: PAN_B }]}>SOMETHING</Text>

        {/* NOTHING — dashed, and deliberately, visibly empty. */}
        <View style={[styles.panelEmpty, { left: PAN_A }]}>
          <View style={styles.nilRing} />
          <View style={styles.nilSlash} />
        </View>
      </View>

      {/* SOMETHING — the same frame, packed. overflow hidden crops the cosmos to it. */}
      <View style={[styles.panelFull, { left: PAN_B }]} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFill, starStyle]}>
          {STARS.map((s, k) => (
            <View
              key={k}
              style={[styles.star, { left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, borderRadius: s.r }]}
            />
          ))}
          {SPARKS.map((s, k) => (
            <View key={`sp${k}`} style={[styles.spark, { left: s.x - 8, top: s.y - 8 }]}>
              <View style={styles.sparkH} />
              <View style={styles.sparkV} />
            </View>
          ))}
          {/* a ringed world and a small moon, so the cosmos has scale in it */}
          <View style={styles.ringWorld} />
          <View style={styles.ring} />
          <View style={styles.moon} />
        </Animated.View>
      </View>

      {/* ── the question standing between them ───────────────────────────────── */}
      <Animated.View style={[styles.qWrap, qStyle]} pointerEvents="none">
        <Text style={styles.qGlyph}>?</Text>
      </Animated.View>

      {/* ── Leibniz, ruled in underneath ─────────────────────────────────────── */}
      <Animated.View style={[styles.layer, psrStyle]} pointerEvents="none">
        <Text style={styles.psrLabel}>EVERY FACT NEEDS A REASON</Text>
        <View style={styles.psrRule} />
        <View style={styles.psrHead} />
      </Animated.View>

      {/* ── the being for whom being is a question ───────────────────────────── */}
      <Animated.View style={[styles.tag, tagStyle]} pointerEvents="none">
        <Text style={styles.tagWord}>DASEIN</Text>
        <Text style={styles.tagSub}>BEING-THERE</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Animated.View style={[styles.aura, auraStyle]} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for props that fade together. Always pointerEvents="none".
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 20, right: 12, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the panels ──────────────────────────────────────────────────────────────
  panLabel: {
    position: 'absolute', top: 236, width: PAN_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2, color: SOFT,
    includeFontPadding: false,
  },
  // borderRadius stays 0 on the dashed frame: Android silently falls back to a
  // SOLID border when a dashed one is rounded, and the dashes are the whole point.
  panelEmpty: {
    position: 'absolute', top: PAN_T, width: PAN_W, height: PAN_H,
    borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 0,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  nilRing: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: SOFT },
  nilSlash: { position: 'absolute', width: 44, height: 2, backgroundColor: SOFT, transform: [{ rotate: '-45deg' }] },

  panelFull: {
    position: 'absolute', top: PAN_T, width: PAN_W, height: PAN_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3,
    backgroundColor: PAPER, overflow: 'hidden',
  },
  star: { position: 'absolute', backgroundColor: INK },
  spark: { position: 'absolute', width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  sparkH: { position: 'absolute', width: 16, height: 1.6, backgroundColor: INK },
  sparkV: { position: 'absolute', width: 1.6, height: 16, backgroundColor: INK },
  ringWorld: {
    position: 'absolute', left: 16, top: 108, width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  ring: {
    position: 'absolute', left: 6, top: 113, width: 44, height: 14, borderRadius: 7,
    borderWidth: 1.5, borderColor: SOFT, transform: [{ rotate: '-18deg' }],
  },
  moon: { position: 'absolute', left: 68, top: 36, width: 13, height: 13, borderRadius: 6.5, backgroundColor: INK },

  // ── the question between the frames ─────────────────────────────────────────
  qWrap: {
    position: 'absolute', left: GAP_L, top: PAN_T + 46, width: GAP_W, height: 74,
    alignItems: 'center', justifyContent: 'center',
  },
  qGlyph: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 58, color: INK,
    includeFontPadding: false,
  },

  // ── Leibniz's principle ─────────────────────────────────────────────────────
  psrLabel: {
    position: 'absolute', left: PSR_L, top: 430, width: PSR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.4, color: INK,
    includeFontPadding: false,
  },
  psrRule: { position: 'absolute', left: PSR_L, top: 452, width: PSR_W - 12, height: 2, backgroundColor: INK },
  psrHead: {
    position: 'absolute', left: PSR_L + PSR_W - 12, top: 446, width: 0, height: 0,
    borderTopWidth: 7, borderBottomWidth: 7, borderLeftWidth: 12,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },

  // ── the Dasein tag ──────────────────────────────────────────────────────────
  tag: {
    position: 'absolute', left: 4, top: 296, width: 114, height: 44,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  tagWord: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 2, color: INK, includeFontPadding: false },
  tagSub: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: SOFT, marginTop: 3, includeFontPadding: false },

  // Derived from the figure, not hand-placed: the head's centre sits (standH 34 +
  // 49) rig units above the ground and its radius is 20, both scaled by K_FIG. The
  // old literals (a 34-radius ring at GROUND − 150) were measured against the 1.35
  // figure; at 1.0 the head dropped to y 417 while the ring stayed at 384, so the
  // halo floated above the skull instead of around it. Writing it in terms of
  // K_FIG means it tracks the figure the next time that number moves.
  aura: {
    position: 'absolute',
    left: FIG_X - AURA_R, top: GROUND - 83 * K_FIG - AURA_R,
    width: AURA_R * 2, height: AURA_R * 2,
    borderRadius: AURA_R, borderWidth: 2, borderColor: INK,
  },
});

// Art runs from the panel labels (y 236) down to the figure's ankles (y 508); the
// player crops to that slice, so the whole scene renders about twice the size it did
// when the full 560 was letterboxed into the stage.
export function Metaphysics5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics5Scene} band={[228, 514]} />;
}
