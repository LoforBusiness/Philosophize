import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics3Script';
import { K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
  stageAnswered,
} from './cinematicKit';
import { stageTone } from './stageTones';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerSpent } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const { RULE, STONE, SHADE } = stageTone('metaphysics');
const LIP = `0px 3px 0px ${SHADE}`;   // the shaded lip a toned plate stands on (scripts/lip-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// PLATO'S LADDER OF REALITY, drawn as a labelled three-tier chart, stage right.
//
//   BEING · unchanging             (caption, y 250)
//   ┌ THE FORMS ─────────┐          tier 1, y 268–320   a steady disc, meter FULL
//   ══ KNOWLEDGE ↑ ↓ OPINION ══     THE LINE, y 328     one heavy rule: the split
//   ┌ THINGS YOU SENSE ──┐          tier 2, y 340–392   the apple wobbles, meter HALF
//   ┌ SHADOWS ───────────┐          tier 3, y 396–448   blobs flicker, meter FAINT
//   BECOMING · always changing      (caption, y 454)
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
//
// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// The chart used to arrive whole, captions and dividing rule included, before the
// narration had divided anything. It is built as it is said now: "Plato divided
// reality in two" draws the heavy rule across and captions the top BEING ·
// UNCHANGING (`divide`); "Becoming is always changing" captions the bottom
// (`becoming`); "the cave is the world of the senses … lit by the sun" labels the
// wall = THE SENSES and raises a sun over the middle of the stage (`outside`,
// x 130…170, y 252…292, clear of the column at 200 and of his skull at ~396); and
// "knowledge is possible only of the unchanging Forms … of changing things only
// opinion" labels the rule itself, KNOWLEDGE above it and OPINION below (`legend`,
// a plate in the 17-unit gap between the first two tiers).
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
const DIVIDE = BEATS.map((b) => b.divide ?? 0);
const BECOMING = BEATS.map((b) => b.becoming ?? 0);
const OUTSIDE = BEATS.map((b) => b.outside ?? 0);
const LEGEND = BEATS.map((b) => b.legend ?? 0);

// ── the sun outside the cave ────────────────────────────────────────────────
// Over the middle of the stage, above the prisoner and left of the chart: a disc
// of radius 9 inside eight rays that turn slowly. Its box is 40 × 40.
const SUN_X = 150;
const SUN_Y = 272;
const SUN_BOX = 40;
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics3'));

export default function Metaphysics3Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(7);
  const cur = BEATS[i];
  const answered = picked !== null;
  // ONLY THE QUESTION ASKED ON THE STAGE mounts its targets (E41). It was
  // `!!cur.interact`, so on the second question — a control answered below the
  // figure — the stage swapped its diagram for the first question's cards, and the
  // diagram the control moves (R7c) could not be seen at all.
  const asking = stageAnswered(cur);
  // The instruction retires once answered: the chosen card lifts into its line.
  const spent = useAnswerSpent(picked);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    return {
      fig: lookPose(s, FIG_X, 500, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      shadow: carry(cv, 0, n, SHADOW[p], SHADOW[n], tr),
      // R7b — the seam trades brightness between the two. Slide toward THE FORM and
      // it burns overhead…
      form: carry(cv, 1, n, FORMB[p], reacting ? dragPos.value : FORMB[n], tr),
      // …and the apple on the table fades in step. One bar, two things, and the
      // reader watching reality move from the one they can touch to the one they
      // cannot: Plato's ranking, done rather than asserted.
      apple: carry(cv, 2, n, APPLEB[p], reacting ? 1 - dragPos.value : APPLEB[n], tr),
      // The chart is built as it is said. Each of these writes in over the first
      // second of the beat that names it and then holds.
      divide: carry(cv, 3, n, DIVIDE[p], DIVIDE[n], ease01((bt.value - 0.2) / 0.8)),
      becoming: carry(cv, 4, n, BECOMING[p], BECOMING[n], ease01((bt.value - 0.2) / 0.6)),
      outside: carry(cv, 5, n, OUTSIDE[p], OUTSIDE[n], ease01((bt.value - 0.2) / 1.2)),
      legend: carry(cv, 6, n, LEGEND[p], LEGEND[n], ease01((bt.value - 0.3) / 0.6)),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // The cave wall's shadows: two blobs on two unrelated frequencies, so the flicker
  // never settles into a beat.
  const wall1 = useAnimatedStyle(() => ({ opacity: SCENE.value.shadow * (0.45 + 0.55 * Math.abs(Math.sin(SCENE.value.t * 3.1))) }));
  const wall2 = useAnimatedStyle(() => ({ opacity: SCENE.value.shadow * (0.45 + 0.55 * Math.abs(Math.sin(SCENE.value.t * 2.3 + 1))) }));

  // Tier frames light with the value they carry: the Forms come up, the shadows recede.
  const formTier = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * SCENE.value.form }));
  const shadeTier = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * SCENE.value.shadow }));
  const thingTier = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * SCENE.value.apple }));

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

  // The rule is DRAWN across, left to right; its caption follows it in.
  const divideRule = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.divide }] }));
  const beingCap = useAnimatedStyle(() => {
    const u = clamp01(SCENE.value.divide * 2 - 1);
    return { opacity: u, transform: [{ translateY: (1 - u) * 5 }] };
  });
  const becomingCap = useAnimatedStyle(() => ({
    opacity: SCENE.value.becoming,
    transform: [{ translateY: (1 - SCENE.value.becoming) * -5 }],
  }));
  // The wall is named first, then the sun comes up over the middle of the stage —
  // the order the sentence gives them in.
  const sensesCap = useAnimatedStyle(() => {
    const u = clamp01(SCENE.value.outside * 2);
    return { opacity: u, transform: [{ translateY: (1 - u) * -4 }] };
  });
  const sun = useAnimatedStyle(() => {
    const u = clamp01(SCENE.value.outside * 2 - 1);
    return { opacity: u, transform: [{ translateY: (1 - u) * 14 }, { scale: 0.7 + 0.3 * u }] };
  });
  const sunRays = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.t * 9}deg` }] }));
  const legend = useAnimatedStyle(() => ({
    opacity: SCENE.value.legend,
    transform: [{ scaleX: 0.85 + 0.15 * SCENE.value.legend }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── stage left: the cave wall he has been staring at ──────────────── */}
      <Text style={styles.caveCap} numberOfLines={1}>THE CAVE WALL</Text>
      <Animated.Text style={[styles.caveCap, styles.caveSenses, sensesCap]} numberOfLines={1}>= THE SENSES</Animated.Text>
      <View style={styles.cave} pointerEvents="none" />

      {/* ── the sun outside the cave, over the middle of the stage ────────── */}
      <Animated.View style={[styles.sunBox, sun]} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFill, sunRays]}>
          {RAYS.map((deg) => (
            <View key={deg} style={[styles.sunRay, { transform: [{ rotate: `${deg}deg` }] }]} />
          ))}
        </Animated.View>
        <View style={styles.sunDisc} />
      </Animated.View>
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
          <Animated.Text style={[styles.capTop, beingCap]}>BEING · UNCHANGING</Animated.Text>

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

          <Animated.View style={[styles.divide, divideRule]} />
          {/* the rule, labelled: what can be known above it, only opinion below */}
          <Animated.View style={[styles.legend, legend]}>
            <Text style={styles.legendText}>KNOWLEDGE ↑</Text>
            <Text style={styles.legendText}>↓ OPINION</Text>
          </Animated.View>

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

          <Animated.Text style={[styles.capBot, becomingCap]}>BECOMING · ALWAYS CHANGING</Animated.Text>
        </View>
      )}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />

      {/* ── Q1 answered in the scene: tap the most real thing ─────────────── */}
      {asking && (
        <>
          <Animated.Text style={[styles.askLabel, spent]}>TAP THE MOST REAL</Animated.Text>
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
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE, boxShadow: LIP,
  },
  // ONE line now (85 units of type in 94 of box — at 82 it wrapped to two, and the
  // second caption line needs the row under it). Both lines end above the wall's
  // frame at 336.
  caveCap: {
    position: 'absolute', left: CAVE_L - 12, top: 308, width: CAVE_W + 24, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 1.1,
    color: SOFT, includeFontPadding: false,
  },
  caveSenses: { top: 320, color: INK },

  sunBox: {
    position: 'absolute', left: SUN_X - SUN_BOX / 2, top: SUN_Y - SUN_BOX / 2, width: SUN_BOX, height: SUN_BOX,
    alignItems: 'center', justifyContent: 'center',
  },
  sunDisc: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  // Each ray is 12…18 units out from the centre, turned about that centre: its box
  // top is at 2, so the centre (20) is 18 below it — 300% of its own height.
  sunRay: {
    position: 'absolute', left: SUN_BOX / 2 - 1, top: 2, width: 2, height: 6, borderRadius: 1,
    backgroundColor: INK, transformOrigin: '50% 300%',
  },
  wallShade: { position: 'absolute', borderRadius: 12, backgroundColor: SOFT },

  capTop: {
    position: 'absolute', left: COL_L, top: 250, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  // 0.6 tracking, not 1.4: the caption is 173 units of type in the column's 184, so
  // it stays on one line (the old one wrapped to two).
  capBot: {
    position: 'absolute', left: COL_L, top: 454, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },

  tier: {
    position: 'absolute', left: COL_L, width: COL_W, height: TIER_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE, boxShadow: LIP,
    flexDirection: 'row', alignItems: 'center', paddingLeft: 8, gap: 8,
  },
  iconCell: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  tierText: { flex: 1 },
  tierT: { fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 14, letterSpacing: 0.5, color: INK, includeFontPadding: false },
  tierSub: { fontFamily: 'Inter_400Regular', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.2, color: INK, includeFontPadding: false },

  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  meterTrack: {
    width: 56, height: 6, borderWidth: 1, borderColor: RULE,
    backgroundColor: STONE, boxShadow: LIP, overflow: 'hidden',
  },
  meterFill: {
    position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  meterWord: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8,
    // INK, not SOFT: this word rides a tier that dims to 0.55 while it waits its
    // turn, and SOFT survives no dimming at all — 5.3:1 on paper becomes 2.0:1 at
    // 0.55, which is D35's smear. Ink holds 3.8:1 there. Size and weight carry
    // the hierarchy instead of tone.
    color: INK, includeFontPadding: false,
  },

  formDisc: { position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: INK },
  formRing: { position: 'absolute', width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: INK },
  apple: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: INK, backgroundColor: PAPER, alignItems: 'center' },
  stem: { width: 2.5, height: 7, backgroundColor: INK, marginTop: -5 },
  blob: { position: 'absolute', left: 4, top: 6, width: 16, height: 18, borderRadius: 5, backgroundColor: SOFT },

  // The one heavy rule that splits the chart. It overhangs the tiers on both sides so
  // it reads as a divide across the whole ladder, not as another tier's border.
  divide: {
    position: 'absolute', left: COL_L - 6, top: LINE_Y, width: COL_W + 12, height: 3.5, backgroundColor: INK,
    transformOrigin: '0% 50%',
  },
  // Laid over the rule in the 17 units between the first tier's lip (323) and the
  // second tier (340). Two labels at its ends: 134 units of type in 152 of plate.
  legend: {
    position: 'absolute', left: COL_L + 6, top: 323, width: COL_W - 12, height: 15,
    borderRadius: 2, backgroundColor: INK, paddingHorizontal: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  legendText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 1.1, color: PAPER,
    includeFontPadding: false,
  },

  askLabel: {
    position: 'absolute', left: COL_L, top: 248, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  cardHit: { position: 'absolute', left: COL_L, width: COL_W },
  card: {
    height: 40, borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: STONE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  cardRight: { backgroundColor: INK, borderColor: INK },
  cardWrong: { borderColor: SOFT },
  cardT: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.3, color: INK, includeFontPadding: false },
  cardTOn: { color: PAPER },
});

// The band. Highest ink is the ask label at y 248 (the BEING caption sits at 250);
// lowest is the ground rule at 500 plus the figure's ankle joints, whose 7.4-unit
// radius reaches ≈ 507. The tier column runs 268–448, the four tap cards 268–446, the
// two cave caption lines + framed wall 308–496, the sun 252–292, and the figure's
// skull tops out at y ≈ 396 — all inside. 274 units instead of 560 puts the scene at the stage's WIDTH limit, about
// 2.3×: double the letterboxed fit, and the old 0.92 camera is gone too.
export function Metaphysics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics3Scene} band={[240, 514]} camera={CAM} />;
}
