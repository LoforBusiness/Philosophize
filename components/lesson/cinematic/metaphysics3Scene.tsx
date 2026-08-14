import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics3Script';
import {
  K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// PLATO'S LADDER OF REALITY, drawn as a labelled three-tier chart, stage right.
//
//   BEING · you can know it        (caption, y 250)
//   ┌ THE FORMS ─────────┐          tier 1, y 268–320   a steady disc, meter FULL
//   ══════════════════════          THE LINE, y 328     one heavy rule: the split
//   ┌ THINGS YOU SENSE ──┐          tier 2, y 340–392   the apple wobbles, meter HALF
//   ┌ SHADOWS ───────────┐          tier 3, y 396–448   blobs flicker, meter FAINT
//   BECOMING · you can only guess   (caption, y 454)
//
// Each tier carries a HOW-REAL meter, because the lesson's first line is that the
// apple is "only half-real" — degrees of being are the idea, so the chart measures
// them instead of merely naming them.
//
// Stage left (x 18–88) is the literal cave wall, drawn as a framed surface with the
// shadows flickering ON it, still going behind the prisoner now that he has turned
// away toward the chart. The figure holds the middle (x 100–183) and never touches
// either side. On Q1 the three tiers give way to four tap cards in the same column.
// Identity camera, so these constants ARE the final stage coordinates the band is
// measured in.
// ─────────────────────────────────────────────────────────────────────────────

const FIG_X = 132;

// ── stage left: the cave wall, framed so the shadows read as ON it ──────────
// Kept to x ≤ 88: the figure's furthest-left reach across every beat is its raised
// left elbow at x ≈ 98, so the wall and the prisoner never touch.
const CAVE_L = 18;
const CAVE_T = 336;
const CAVE_W = 70;
const CAVE_H = 160;

const COL_L = 200;
const COL_W = 184;
const TIER_H = 52;
const TIER = { form: 268, thing: 340, shade: 396 };
const LINE_Y = 328;

// ── the scene-answered question (Q1): four cards, 184 × 40 each ─────────────
// Each card names one rung of the chart above (Form · thing · shadow) plus the
// painting, Plato's stock example of an image at a third remove. Only the Form is
// unchanging, so exactly one card can be the answer.
const CARDS = [
  { id: 'form', label: 'THE ETERNAL FORM', y: 268, correct: true },
  { id: 'apple', label: 'THE APPLE ITSELF', y: 314, correct: false },
  { id: 'shadow', label: 'ITS SHADOW', y: 360, correct: false },
  { id: 'paint', label: 'A PAINTING OF IT', y: 406, correct: false },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const SHADOW = BEATS.map((b) => b.shadow ?? 0);
const FORMB = BEATS.map((b) => b.form ?? 0);
const APPLEB = BEATS.map((b) => b.apple ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics3'));

export default function Metaphysics3Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cur = BEATS[i];
  const answered = picked !== null;
  const asking = !!cur.interact;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, 500, K_FIG, 1, 1),
      shadow: L(SHADOW[p], SHADOW[n]),
      form: L(FORMB[p], FORMB[n]),
      apple: L(APPLEB[p], APPLEB[n]),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // The cave wall's shadows: two blobs on two unrelated frequencies, so the flicker
  // never settles into a beat.
  const wall1 = useAnimatedStyle(() => ({ opacity: SCENE.value.shadow * (0.45 + 0.55 * Math.abs(Math.sin(SCENE.value.t * 3.1))) }));
  const wall2 = useAnimatedStyle(() => ({ opacity: SCENE.value.shadow * (0.45 + 0.55 * Math.abs(Math.sin(SCENE.value.t * 2.3 + 1))) }));

  // Tier frames light with the value they carry: the Forms come up, the shadows recede.
  const formTier = useAnimatedStyle(() => ({ opacity: 0.3 + 0.7 * SCENE.value.form }));
  const shadeTier = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * SCENE.value.shadow }));
  const thingTier = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * SCENE.value.apple }));

  const formDisc = useAnimatedStyle(() => {
    const pulse = 0.9 + 0.1 * Math.sin(SCENE.value.t * 2.2);
    return { opacity: 0.25 + 0.75 * SCENE.value.form, transform: [{ scale: (0.7 + 0.3 * SCENE.value.form) * pulse }] };
  });
  const formRing = useAnimatedStyle(() => {
    const pulse = 0.7 + 0.3 * Math.sin(SCENE.value.t * 1.9);
    return { opacity: SCENE.value.form * 0.5 * pulse, transform: [{ scale: 1 + 0.16 * pulse }] };
  });
  // A real thing is never quite steady: it breathes and lists.
  const appleStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: 1 + 0.09 * Math.sin(SCENE.value.t * 2.6) },
      { scaleY: 1 + 0.09 * Math.sin(SCENE.value.t * 2.6 + 1.6) },
      { rotate: `${Math.sin(SCENE.value.t * 1.4) * 6}deg` },
    ],
  }));
  const blobA = useAnimatedStyle(() => ({ opacity: 0.4 + 0.6 * Math.abs(Math.sin(SCENE.value.t * 3.4)) }));
  const blobB = useAnimatedStyle(() => ({ opacity: 0.4 + 0.6 * Math.abs(Math.sin(SCENE.value.t * 2.1 + 0.8)) }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── stage left: the cave wall he has been staring at ──────────────── */}
      <Text style={styles.caveCap}>THE CAVE WALL</Text>
      <View style={styles.cave} pointerEvents="none" />
      <Animated.View
        style={[styles.wallShade, { left: CAVE_L + 11, top: 366, width: 44, height: 52 }, wall1]}
        pointerEvents="none"
      />
      <Animated.View
        style={[styles.wallShade, { left: CAVE_L + 20, top: 428, width: 30, height: 40 }, wall2]}
        pointerEvents="none"
      />

      {/* ── stage right: the ladder of reality ────────────────────────────── */}
      {!asking && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Text style={styles.capTop}>BEING · YOU CAN KNOW IT</Text>

          <Animated.View style={[styles.tier, { top: TIER.form }, formTier]}>
            <View style={styles.iconCell}>
              <Animated.View style={[styles.formRing, formRing]} />
              <Animated.View style={[styles.formDisc, formDisc]} />
            </View>
            <View style={styles.tierText}>
              <Text style={styles.tierT}>THE FORMS</Text>
              <Text style={styles.tierSub}>never change</Text>
              <Meter frac={1} word="FULL" />
            </View>
          </Animated.View>

          <View style={styles.divide} />

          <Animated.View style={[styles.tier, { top: TIER.thing }, thingTier]}>
            <View style={styles.iconCell}>
              <Animated.View style={[styles.apple, appleStyle]}><View style={styles.stem} /></Animated.View>
            </View>
            <View style={styles.tierText}>
              <Text style={styles.tierT}>THINGS YOU SENSE</Text>
              <Text style={styles.tierSub}>they bruise and rot</Text>
              <Meter frac={0.5} word="HALF" />
            </View>
          </Animated.View>

          <Animated.View style={[styles.tier, { top: TIER.shade }, shadeTier]}>
            <View style={styles.iconCell}>
              <Animated.View style={[styles.blob, blobA]} />
              <Animated.View style={[styles.blob, { left: 16, top: 20, width: 12, height: 14 }, blobB]} />
            </View>
            <View style={styles.tierText}>
              <Text style={styles.tierT}>SHADOWS</Text>
              <Text style={styles.tierSub}>images of copies</Text>
              <Meter frac={0.14} word="FAINT" />
            </View>
          </Animated.View>

          <Text style={styles.capBot}>BECOMING · YOU CAN ONLY GUESS</Text>
        </View>
      )}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />

      {/* ── Q1 answered in the scene: tap the most real thing ─────────────── */}
      {asking && (
        <>
          <Text style={styles.askLabel}>TAP THE MOST REAL</Text>
          {CARDS.map((c) => (
            <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.cardHit, { top: c.y }]} disabled={answered}>
              <View
                style={[
                  styles.card,
                  answered && c.correct && styles.cardRight,
                  answered && picked === c.id && !c.correct && styles.cardWrong,
                ]}
              >
                <Text style={[styles.cardT, answered && c.correct && styles.cardTOn]}>{c.label}</Text>
              </View>
            </Target>
          ))}
        </>
      )}
    </Animated.View>
  );
}

/**
 * How much BEING a tier has, drawn rather than asserted: a track that fills to the
 * tier's share and the word for it. Static geometry — the tier's own opacity is what
 * animates — so the meter never relayouts.
 */
function Meter({ frac, word }: { frac: number; word: string }) {
  return (
    <View style={styles.meterRow}>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { transform: [{ scaleX: frac }] }]} />
      </View>
      <Text style={styles.meterWord}>{word}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 16, top: 500, height: 1.5, backgroundColor: RULE },

  // The wall is a FRAMED surface, not a bare slab: the shadows fall inside it, so
  // they read as cast ON the wall instead of floating beside it.
  cave: {
    position: 'absolute', left: CAVE_L, top: CAVE_T, width: CAVE_W, height: CAVE_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  caveCap: {
    position: 'absolute', left: CAVE_L - 6, top: 310, width: CAVE_W + 12, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, lineHeight: 11, letterSpacing: 1.1,
    color: SOFT, includeFontPadding: false,
  },
  wallShade: { position: 'absolute', borderRadius: 12, backgroundColor: SOFT },

  capTop: {
    position: 'absolute', left: COL_L, top: 250, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  capBot: {
    position: 'absolute', left: COL_L, top: 454, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  tier: {
    position: 'absolute', left: COL_L, width: COL_W, height: TIER_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    flexDirection: 'row', alignItems: 'center', paddingLeft: 8, gap: 8,
  },
  iconCell: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  tierText: { flex: 1 },
  tierT: { fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 14, letterSpacing: 0.5, color: INK, includeFontPadding: false },
  tierSub: { fontFamily: 'Inter_400Regular', fontSize: 8.5, lineHeight: 11, letterSpacing: 0.2, color: SOFT, includeFontPadding: false },

  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  meterTrack: {
    width: 56, height: 6, borderWidth: 1, borderColor: RULE,
    backgroundColor: PAPER, overflow: 'hidden',
  },
  meterFill: {
    position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  meterWord: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.8,
    color: SOFT, includeFontPadding: false,
  },

  formDisc: { position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: INK },
  formRing: { position: 'absolute', width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: INK },
  apple: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: INK, backgroundColor: PAPER, alignItems: 'center' },
  stem: { width: 2.5, height: 7, backgroundColor: INK, marginTop: -5 },
  blob: { position: 'absolute', left: 4, top: 6, width: 16, height: 18, borderRadius: 5, backgroundColor: SOFT },

  // The one heavy rule that splits the chart. It overhangs the tiers on both sides so
  // it reads as a divide across the whole ladder, not as another tier's border.
  divide: { position: 'absolute', left: COL_L - 6, top: LINE_Y, width: COL_W + 12, height: 3.5, backgroundColor: INK },

  askLabel: {
    position: 'absolute', left: COL_L, top: 248, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  cardHit: { position: 'absolute', left: COL_L, width: COL_W },
  card: {
    height: 40, borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  cardRight: { backgroundColor: INK, borderColor: INK },
  cardWrong: { borderColor: SOFT, opacity: 0.45 },
  cardT: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.3, color: INK, includeFontPadding: false },
  cardTOn: { color: PAPER },
});

// The band. Highest ink is the ask label at y 248 (the BEING caption sits at 250);
// lowest is the ground rule at 500 plus the figure's ankle joints, whose 7.4-unit
// radius reaches ≈ 507. The tier column runs 268–448, the four tap cards 268–446, the
// cave caption + framed wall 310–496, and the figure's crown sits at y ≈ 355 — all
// inside. 274 units instead of 560 puts the scene at the stage's WIDTH limit, about
// 2.3×: double the letterboxed fit, and the old 0.92 camera is gone too.
export function Metaphysics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics3Scene} band={[240, 514]} camera={CAM} />;
}
