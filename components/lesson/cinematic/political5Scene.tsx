import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political5Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
  useCarry, carry, STONE,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THREE PIECES OF INK INFORMATION DESIGN, one per idea in the lesson:
//
//   · THE CITY (stage right) — Plato's three parts drawn as a stepped, labelled
//     pyramid: RULERS who know the good, GUARDIANS who defend it, PRODUCERS who feed
//     and supply it, under the caption EACH PART ITS OWN WORK. The tiers build from
//     the base up as `city` rises, so "justice is harmony between the parts" is a
//     picture rather than a claim.
//   · THE VEIL (over the figure) — a curtain on a rod that draws down and, one after
//     another, STRIKES OUT the four facts about you it hides: CLASS · TALENT ·
//     WEALTH · LUCK. That staggered strike is the thought experiment, animated.
//   · THE TIMELINE (top) — the beat that says the questions link up gets the ruled
//     line that links them: HOBBES → LOCKE → MILL → RAWLS, each with its question.
//
// Q2 is answered IN the scene: four definition cards take the stage where the city
// stood, so the reader picks what Plato meant by justice.
//
// There is NO camera transform — every number here is a final stage coordinate, so
// the band is measurable. (The old version shifted the whole stage up by 92 and let
// the player letterbox the full 560, which is why it read tiny.)
//
// COMPOSITION / OCCLUSION —
//   · the figure stands at x = 78 and never moves; its widest gesture (13,
//     point-forward) reaches x ≈ 132 and its head circle spans x 51…105.
//   · the city and the cards live at x ≥ 150, so neither can ever cover the figure.
//   · the veil is deliberately ON TOP of the figure — hiding it is the whole point —
//     and spans x 14…142, well clear of both.

const FIG_X = 78;

// ── the timeline ─────────────────────────────────────────────────────────────
const TL_NAME_T = 238;                 // 238 … 253
const TL_TICK_T = 258;                 // 258 … 272
const TL_RULE_T = 264;
const TL_SUB_T = 276;                  // 276 … 290
const STOPS = [
  { x: 68, name: 'HOBBES', q: 'why obey?' },
  { x: 158, name: 'LOCKE', q: 'legitimate?' },
  { x: 248, name: 'MILL', q: 'how far?' },
  { x: 338, name: 'RAWLS', q: 'what is fair?' },
];
const STOP_W = 92;

// ── Plato's three parts ──────────────────────────────────────────────────────
const CITY_CX = 268;
const CITY_CAP_T = 288;                // 288 … 302
const TIER_H = 42;
const TIERS = [
  { w: 140, top: 306, title: 'RULERS', sub: 'who know the good' },
  { w: 172, top: 352, title: 'GUARDIANS', sub: 'who defend the city' },
  { w: 204, top: 398, title: 'PRODUCERS', sub: 'who feed and supply it' },
];

// ── the veil of ignorance ────────────────────────────────────────────────────
const VEIL_L = 14, VEIL_T = 312, VEIL_W = 128, VEIL_H = 136;   // 312 … 448
const VEIL_DROP = 50;                  // how far above its home it starts
const HIDDEN = ['CLASS', 'TALENT', 'WEALTH', 'LUCK'];
const HID_T = 62, HID_STEP = 16;       // veil-local: rows at 374 · 390 · 406 · 422

// ── the four definitions (the scene-answered question) ───────────────────────
// 236 × 42 stage units per target, two lines of 14 / 12 px — far over the readable
// minimum once the band scales the stage by ~2.28×.
const CARD_L = 150, CARD_W = 236, CARD_H = 42, CARD_STEP = 45, CARD_T = 300;
const CARD_LAB_T = 282;
const DEFS = [
  { id: 'a', title: 'EQUAL WEALTH', sub: 'the same share for everyone', correct: false },
  { id: 'b', title: 'EACH ITS OWN WORK', sub: 'harmony between the parts', correct: true },
  { id: 'c', title: 'MAJORITY VOTE', sub: 'the many decide the rest', correct: false },
  { id: 'd', title: 'NO RULERS AT ALL', sub: 'freedom from government', correct: false },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
// The question beat hands its half of the stage to the tap targets, so the city
// steps aside there however the script has it set.
const CITY = BEATS.map((b) => (b.interact ? 0 : b.city ?? 0));
const VEIL = BEATS.map((b) => (b.interact ? 0 : b.veil ?? 0));
const LINK = BEATS.map((b) => b.link ?? 0);

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
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political5'));

export default function Political5Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const showPick = !!cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      city: carry(cv, 0, n, CITY[p], CITY[n], tr),
      // R7b — the arm draws the veil. Only the far setting is what the veil is for,
      // and it comes down over the figure as the reader reaches it: the device appears
      // when its reason does.
      veil: carry(cv, 1, n, VEIL[p], reacting ? dragPos.value : VEIL[n], tr),
      link: carry(cv, 2, n, LINK[p], LINK[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const capStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.city }));
  // THE CITY RECEDES, ITS CAPTION DOES NOT (D35). `city` rests at 0.6 on the beats
  // that push the tiers into the background, and EACH PART ITS OWN WORK went with
  // them at 2.4:1. Dimming cannot be tuned here — the caption's paper fades at the
  // same rate as its ink — so the words ride their own track and are legible or
  // absent.
  // × 2.5 WAS TUNED FOR `city` RESTING AT 0.6, AND IT GOES LOWER THAN THAT. On the
  // beat the veil comes down the city sits at 0.14, which × 2.5 is 0.35 and reaches
  // the eye at 1.6:1 — the same smear the note above is about, one rest value
  // further down. Shifted and steepened instead of scaled: absent below 0.15, whole
  // by 0.35, so there is no value the caption can rest at and be unreadable.
  const capTextStyle = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.city - 0.15) * 5) }));
  // AND ITS WORDS RIDE THEIR OWN TRACK, for the reason two lines above. `link`
  // rests at 0.26 while the timeline sits behind the city, which reaches the eye
  // at 1.7:1 — a smear in the shape of four names, and worse now the tiers behind
  // them are a tone rather than paper. Same fix as the caption: legible or absent.
  const linkTextStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.link * 2.5) }));
  const linkStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.link,
    transform: [{ translateY: (1 - SCENE.value.link) * -8 }],
  }));
  const veilStyle = useAnimatedStyle(() => ({
    // Twice the rate on the fade, for the reason Tier gives: one beat rests the
    // veil at 0.3 and the words under it were reaching the reader at 1.5:1. The
    // DROP still runs on the raw track, and so does the strike-through inside
    // `Hidden`, so nothing about how much the veil has covered changes.
    opacity: clamp01(SCENE.value.veil * 2),
    transform: [{ translateY: (1 - SCENE.value.veil) * -VEIL_DROP }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── ONE LONG CONVERSATION, ruled as a timeline ───────────────────────── */}
      <Animated.View style={[styles.layer, linkStyle]} pointerEvents="none">
        <View style={styles.tlRule} />
        <View style={styles.tlHead} />
        {STOPS.map((s) => (
          <View key={s.name} style={styles.layer}>
            <View style={[styles.tlTick, { left: s.x - 1 }]} />
          </View>
        ))}
      </Animated.View>
      <Animated.View style={[styles.layer, linkTextStyle]} pointerEvents="none">
        {STOPS.map((s) => (
          <View key={s.name} style={styles.layer}>
            <Text style={[styles.tlName, { left: s.x - STOP_W / 2 }]}>{s.name}</Text>
            <Text style={[styles.tlSub, { left: s.x - STOP_W / 2 }]}>{s.q}</Text>
          </View>
        ))}
      </Animated.View>

      {/* ── PLATO'S CITY: three parts, each doing its own work ───────────────── */}
      <Animated.View style={[styles.layer, capTextStyle]} pointerEvents="none">
        <Text style={styles.cityCap}>EACH PART ITS OWN WORK</Text>
      </Animated.View>
      <Animated.View style={[styles.layer, capStyle]} pointerEvents="none">
      </Animated.View>
      {TIERS.map((tier, k) => (
        <Tier key={tier.title} S={SCENE} k={k} />
      ))}

      <Stickman D={DF} k={K_FIG} />

      {/* ── RAWLS'S VEIL, drawn down over whoever you happen to be ───────────── */}
      <Animated.View style={[styles.veil, veilStyle]} pointerEvents="none">
        <View style={styles.veilRod} />
        <Text style={styles.veilQ}>?</Text>
        {HIDDEN.map((w, k) => (
          <Hidden key={w} S={SCENE} k={k} word={w} />
        ))}
      </Animated.View>

      {/* ── Q2: tap what Plato meant by justice ──────────────────────────────── */}
      {showPick && (
        <>
          {/* The "what do I do?" label. Never a Pressable — it must not eat a tap. */}
          <View style={styles.layer} pointerEvents="none">
            <Text style={styles.cardLab}>TAP WHAT JUSTICE MEANT</Text>
          </View>
          {DEFS.map((d, k) => {
            const chosen = picked === d.id;
            const right = answered && d.correct;
            const wrong = answered && chosen && !d.correct;
            return (
              <Target id={d.id} correct={d.correct} picked={picked} onPick={onPick}
              key={d.id} style={[styles.cardSlot, { top: CARD_T + k * CARD_STEP }]} disabled={answered}>
                <View style={[styles.card, right && styles.cardRight, wrong && styles.cardWrong]}>
                  <Text style={[styles.cardTitle, right && styles.cardTitleOn]}>{d.title}</Text>
                  <Text style={[styles.cardSub, right && styles.cardSubOn]}>{d.sub}</Text>
                </View>
              </Target>
            );
          })}
        </>
      )}
    </Animated.View>
  );
}

/** One tier of the city. Builds from the base up, so the pyramid assembles. */
function Tier({ S, k }: { S: SharedValue<any>; k: number }) {
  const tier = TIERS[k];
  // Base first (k = 2), crown last (k = 0) — a city is built from the bottom.
  const order = 2 - k;
  const st = useAnimatedStyle(() => {
    const v = clamp01((S.value.city - order * 0.18) / 0.46);
    // The SLIDE keeps the stagger; the FADE runs at twice the rate and is done by
    // halfway. A tier resting mid-build at v = 0.30 was drawing its words at 1.5:1
    // — a box you can see with a word you cannot (D35) — and the stagger is worth
    // keeping, so only the opacity is steepened.
    return { opacity: clamp01(v * 2), transform: [{ translateY: (1 - v) * 10 }] };
  });
  return (
    <Animated.View
      style={[styles.tier, { left: CITY_CX - tier.w / 2, top: tier.top, width: tier.w }, st]}
      pointerEvents="none"
    >
      <Text style={styles.tierTitle}>{tier.title}</Text>
      <Text style={styles.tierSub}>{tier.sub}</Text>
    </Animated.View>
  );
}

/** One fact the veil hides, struck through as the curtain settles. */
function Hidden({ S, k, word }: { S: SharedValue<any>; k: number; word: string }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ scaleX: clamp01((S.value.veil - 0.3 - k * 0.13) / 0.34) }],
  }));
  return (
    <View style={[styles.hidRow, { top: HID_T + k * HID_STEP }]} pointerEvents="none">
      <Text style={styles.hidWord}>{word}</Text>
      {/* Declared, not decorative: check-cover treats ink across a word as a
          defect unless the scene says the mark is deliberate (D33). This one is
          the thought experiment — the veil striking out what it hides — and it
          runs the width of the card rather than the width of the word, so the
          geometry alone cannot tell it from a stray rule. */}
      <Animated.View nativeID={`strike-hidden-${k}`} style={[styles.hidStrike, st]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for props that fade together. Always pointerEvents="none".
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 20, right: 12, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the timeline ────────────────────────────────────────────────────────────
  tlRule: { position: 'absolute', left: 32, top: TL_RULE_T, width: 330, height: 2, backgroundColor: INK },
  tlHead: {
    position: 'absolute', left: 362, top: TL_RULE_T - 5, width: 0, height: 0,
    borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 12,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: INK,
  },
  tlTick: { position: 'absolute', top: TL_TICK_T, width: 2.5, height: 14, backgroundColor: INK },
  tlName: {
    position: 'absolute', top: TL_NAME_T, width: STOP_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 15, letterSpacing: 1.2, color: INK,
    includeFontPadding: false,
  },
  tlSub: {
    position: 'absolute', top: TL_SUB_T, width: STOP_W, textAlign: 'center',
    fontFamily: 'Inter_500Medium', fontSize: 10, lineHeight: 13, color: SOFT,
    includeFontPadding: false,
  },

  // ── the city ────────────────────────────────────────────────────────────────
  cityCap: {
    position: 'absolute', left: CITY_CX - 110, top: CITY_CAP_T, width: 220, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  // TONE, NOT WHITE. This scene drew every prop as an outline on paper — two
  // values and no depth, which is the flat case `check:shade` exists to find.
  // The structural mass takes STONE, a secondary surface takes RULE, and what
  // carries the message stays PAPER, so the picture has things at different
  // values rather than everything a shade darker. See cinematicKit's ramp.
  tier: {
    position: 'absolute', height: TIER_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  tierTitle: {
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 17, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  tierSub: { fontFamily: 'Inter_500Medium', fontSize: 10.5, lineHeight: 13, color: INK, includeFontPadding: false },

  // ── the veil ────────────────────────────────────────────────────────────────
  veil: {
    position: 'absolute', left: VEIL_L, top: VEIL_T, width: VEIL_W, height: VEIL_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: RULE,
    alignItems: 'center',
  },
  veilRod: { position: 'absolute', top: -4, left: -10, right: -10, height: 6, backgroundColor: INK, borderRadius: 3 },
  veilQ: {
    marginTop: 4, fontFamily: 'PlayfairDisplay_700Bold', fontSize: 50, lineHeight: 56, color: SOFT,
    includeFontPadding: false,
  },
  hidRow: { position: 'absolute', left: 8, width: VEIL_W - 16, height: 14, alignItems: 'center', justifyContent: 'center' },
  hidWord: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.6, color: INK,
    includeFontPadding: false,
  },
  hidStrike: {
    position: 'absolute', left: 12, top: 6, width: VEIL_W - 40, height: 2,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },

  // ── the four definitions ────────────────────────────────────────────────────
  cardLab: {
    position: 'absolute', left: CARD_L, top: CARD_LAB_T, width: CARD_W,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 14, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  cardSlot: { position: 'absolute', left: CARD_L, width: CARD_W, height: CARD_H },
  card: {
    width: CARD_W, height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: STONE, justifyContent: 'center', paddingHorizontal: 10,
  },
  cardRight: { backgroundColor: INK, borderColor: INK },
  cardWrong: { borderColor: SOFT, opacity: 0.45 },
  cardTitle: {
    fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 17, letterSpacing: 0.3, color: INK,
    includeFontPadding: false,
  },
  cardTitleOn: { color: PAPER },
  cardSub: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 15, color: INK, includeFontPadding: false },
  cardSubOn: { color: RULE },
});

// BAND. Topmost ink is the timeline's name row at 238; the lowest is the figure's
// ankle joint, whose circle reaches ≈ 507 (feet on GROUND = 500, joint radius
// 11 × 1.35 / 2). Every extreme in between sits inside that: the timeline ends at
// 290, the city caption at 302 and its base tier at 440, the four cards at 300…477,
// and the veil spans 312…448 at rest — at its highest, mid-drop, its rod tops out at
// 308 − 50 = 258. So [230, 514] holds the lot with 8 units of margin above and 7
// below, and the scene renders about 2.28× instead of the 1.15× a full-height fit
// letterboxes it to.
export function Political5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political5Scene} band={[230, 514]} camera={CAM} />;
}
