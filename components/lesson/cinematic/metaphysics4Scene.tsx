import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './metaphysics4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A LEDGER of failed attempts to name nothing, and the void that keeps refuting
// them. Parmenides' trap drawn as information rather than mood.
//
// COMPOSITION / OCCLUSION CONTRACT
//   · The figure stands at x = 344 on GROUND = 500, so it spans about x 296–392
//     and y 353–500 (crown ≈ 361, a little higher on a bobbing gesture).
//   · The VOID hangs directly ABOVE that figure — centre (344, 292), rim ø84 —
//     so the reaching gestures (24, 35) read as grabbing INTO it, and it never
//     covers the body.
//   · The LEDGER owns x 14–238, well left of the figure. Its rows are the whole
//     lesson: what you SAID, and the something it BECAME.
//   · Nothing is drawn above y = 224 or below the ground line, which is what lets
//     the player crop to band [218, 508] and render ~2.23× instead of 1.15×.

const FIG_X = 344;
const VOID = { x: 344, y: 292 };
const VOID_CORE = 66;
const VOID_RIM = 84;

const LED_L = 14;
const LED_W = 224;
const CELL_A_W = 98;
const ARROW_L = LED_L + CELL_A_W + 4;      // 116
const ARROW_W = 20;
const CELL_B_L = ARROW_L + ARROW_W + 4;    // 140
const CELL_B_W = LED_L + LED_W - CELL_B_L; // 98

const ROW_H = 36;
const ROW_T = [264, 304, 344];

// Each row is one grab at nothing: the words you reached with, and the something
// they turned into the instant you used them.
const ROWS = [
  { say: '"nothing"', became: 'a thought' },
  { say: '"the void"', became: 'an object' },
  { say: '"not-being"', became: 'a topic' },
];

// The somethings that drop out of the void on their way into the ledger.
const TOKENS = [{ x: 258, y: 306 }, { x: 266, y: 350 }, { x: 254, y: 392 }];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const TOK = BEATS.map((b) => b.tokens ?? 0);
const BAR = BEATS.map((b) => b.barred ?? 0);
const FRZ = BEATS.map((b) => b.frozen ?? 0);

export default function Metaphysics4Scene({ clock, bt, bi }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, -1, 1),
      rows: lerp(TOK[p], TOK[n], tr),
      barred: lerp(BAR[p], BAR[n], tr),
      frozen: lerp(FRZ[p], FRZ[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // The void breathes so the absence never sits still — a slow, shallow pulse.
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.05 * Math.sin(SCENE.value.t * 1.8) }],
  }));
  const rimStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + 0.3 * Math.sin(SCENE.value.t * 1.8),
    transform: [{ scale: 1 + 0.05 * Math.sin(SCENE.value.t * 1.8 + 0.6) }],
  }));
  // The second way, struck through: the slash draws itself from its left end.
  const slashStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.barred * 2),
    transform: [{ rotate: '-24deg' }, { scaleX: ease01(SCENE.value.barred) }],
  }));

  // "CHANGE IS REAL" arrives, then gets crossed out — the claim Parmenides' logic
  // cannot let stand.
  const frozenStyle = useAnimatedStyle(() => ({
    opacity: clamp01(SCENE.value.frozen * 2.5),
    transform: [{ translateY: (1 - clamp01(SCENE.value.frozen * 2.5)) * 8 }],
  }));
  const strikeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: ease01(clamp01((SCENE.value.frozen - 0.45) / 0.55)) }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the ledger: every grab at nothing, and what it produced ──────────── */}
      <Text style={styles.ledTitle}>EVERY GRAB AT NOTHING</Text>
      <Text style={[styles.colHead, { left: LED_L, width: CELL_A_W }]}>YOU SAY</Text>
      <Text style={[styles.colHead, { left: CELL_B_L, width: CELL_B_W }]}>IT BECOMES</Text>
      <View style={styles.ledRule} pointerEvents="none" />

      {ROWS.map((r, k) => <Row key={r.say} S={SCENE} k={k} say={r.say} became={r.became} />)}

      {/* the tokens the void keeps handing over */}
      {TOKENS.map((tk, k) => <Token key={k} S={SCENE} tk={tk} k={k} />)}

      {/* ── the claim that cannot survive the trap ───────────────────────────── */}
      <Animated.View style={[styles.frozenBox, frozenStyle]} pointerEvents="none">
        <Text style={styles.frozenText}>CHANGE IS REAL</Text>
        <Animated.View style={[styles.strike, strikeStyle]} />
      </Animated.View>

      {/* ── the void: what-is-not, hanging over the figure's head ────────────── */}
      <Text style={styles.voidLabel}>WHAT-IS-NOT</Text>
      <Animated.View
        style={[styles.voidRim, { left: VOID.x - VOID_RIM / 2, top: VOID.y - VOID_RIM / 2 }, rimStyle]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.voidCore, { left: VOID.x - VOID_CORE / 2, top: VOID.y - VOID_CORE / 2 }, coreStyle]}
        pointerEvents="none"
      />
      <Animated.View style={[styles.slash, slashStyle]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

/** One ledger row — it slides in from the left as its token drops out of the void. */
function Row({
  S, k, say, became,
}: { S: SharedValue<any>; k: number; say: string; became: string }) {
  const st = useAnimatedStyle(() => {
    const on = ease01(clamp01(S.value.rows - k));
    return { opacity: on, transform: [{ translateX: (1 - on) * -14 }] };
  });
  return (
    <Animated.View style={[styles.row, { top: ROW_T[k] }, st]} pointerEvents="none">
      <View style={styles.cellA}><Text style={styles.cellAText} numberOfLines={1}>{say}</Text></View>
      <View style={styles.arrowShaft} />
      <View style={styles.arrowHead} />
      <View style={styles.cellB}><Text style={styles.cellBText} numberOfLines={1}>{became}</Text></View>
    </Animated.View>
  );
}

function Token({ S, tk, k }: { S: SharedValue<any>; tk: { x: number; y: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const on = clamp01(S.value.rows - k);
    const bob = Math.sin(S.value.t * 2.2 + k * 1.7) * 3;
    return { opacity: on, transform: [{ translateY: bob }, { scale: 0.4 + 0.6 * on }] };
  });
  return (
    <Animated.View style={[styles.token, { left: tk.x - 9, top: tk.y - 9 }, st]} pointerEvents="none">
      <View style={styles.tokenDot} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  ledTitle: {
    position: 'absolute', left: LED_L, top: 224, width: LED_W,
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
  },
  colHead: {
    position: 'absolute', top: 244, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.2, color: SOFT,
  },
  ledRule: { position: 'absolute', left: LED_L, top: 258, width: LED_W, height: 1.5, backgroundColor: RULE },

  row: { position: 'absolute', left: 0, width: STAGE_W, height: ROW_H },
  cellA: {
    position: 'absolute', left: LED_L, top: 0, width: CELL_A_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  cellAText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.2, color: PAPER,
    includeFontPadding: false,
  },
  arrowShaft: { position: 'absolute', left: ARROW_L, top: ROW_H / 2 - 1, width: ARROW_W - 7, height: 2, backgroundColor: INK },
  arrowHead: {
    position: 'absolute', left: ARROW_L + ARROW_W - 8, top: ROW_H / 2 - 5, width: 0, height: 0,
    borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  cellB: {
    position: 'absolute', left: CELL_B_L, top: 0, width: CELL_B_W, height: ROW_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  cellBText: {
    fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 0.2, color: INK,
    includeFontPadding: false,
  },

  token: { position: 'absolute', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  tokenDot: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, borderColor: INK, backgroundColor: PAPER },

  frozenBox: {
    position: 'absolute', left: LED_L, top: 400, width: LED_W, height: 40,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  frozenText: { fontFamily: 'Inter_700Bold', fontSize: 14.5, letterSpacing: 1, color: INK, includeFontPadding: false },
  strike: {
    position: 'absolute', left: 12, top: 18, width: LED_W - 28, height: 3.5,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '0% 50%',
  },

  voidLabel: {
    position: 'absolute', left: 288, top: 228, width: 112, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
  },
  voidCore: { position: 'absolute', width: VOID_CORE, height: VOID_CORE, borderRadius: VOID_CORE / 2, backgroundColor: INK },
  voidRim: { position: 'absolute', width: VOID_RIM, height: VOID_RIM, borderRadius: VOID_RIM / 2, borderWidth: 1.5, borderColor: SOFT },
  // Anchored at its LEFT end so the rotate and the scaleX share an origin and the
  // slash draws itself ACROSS the void instead of growing out of its middle. Its
  // length is the core's diameter and its colour is PAPER, so it reads as a stroke
  // cut through the black disc — the second way, barred.
  slash: {
    position: 'absolute', left: 315.7, top: 302.1, width: 62, height: 5,
    backgroundColor: PAPER, borderRadius: 2.5, transformOrigin: '0% 50%',
  },
});

// Art spans y 224 (the ledger title / void label) to the ground line at 501.5; the
// void's rim never rises past 248 and the struck claim bottoms out at 440, so this
// band holds every extreme with 6 units of margin at each end.
export function Metaphysics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics4Scene} band={[218, 508]} />;
}
