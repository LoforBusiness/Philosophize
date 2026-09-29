import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { BEATS } from './ethicsScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand, type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { reachHandTo, handAt } from './interact';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { actStance, emoteAny, emoteAnyLive } from './moves';
import { useLinger } from './useLinger';
import { attendAt } from './attend';
import {
  windowFrame, pot, hallTable, mirrorFrame, bookcase,
  WIN, GLASS, SILL_Y, POT, DIARY, MGLASS, CASE, SHELF_Y,
} from './ethicsSet';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// ethics-ethics-1, "Why Humans Care About Right and Wrong" — A HALLWAY AT NIGHT.
//
// Redrawn 2026-09-25, one of five first lessons the owner asked for after the logic
// debate studio, each displaying its information in a way of its own. Here the
// information is a REFLECTION: conscience is the figure in the mirror, who copies you
// until the moment it stops copying and starts weighing what you did.
//
//   b0–1  he bends, picks a found wallet up off the hall floor, looks at it and
//         pockets it; WAS IT RIGHT? clouds the mirror, then ABOUT YOUR OWN CONDUCT.
//   b2    the diary on the hall table: what ANIMALS share — SYMPATHY, FAIRNESS.
//   b3–4  the reflection stops copying him, steps to a balance standing in the glass
//         and takes hold of its pillar; FOR and AGAINST drop into its pans.
//   b5–6  the bookcase at the far end of the hall: DARWIN, FREUD, KANT, under WHERE
//         FROM?; then DISPUTED, and each book's answer — INSTINCT, SOCIETY, REASON.
//   b7–9  the reflection keeps its balance; the window: WHAT MAKES A LIFE GO WELL?; the diary's YOU page reads REASON;
//         a seedling in the pot on the sill.
//   b11   the first question, ON THE STAGE: three notes stuck to the mirror.
//   b12   the order question: the balance tips as the answer moves.
//   b13–14 the plant grows, EUDAIMONIA on its tag; it flowers, FLOURISHING.
//
// WHAT IS NOT CHANGED: every word of narration (ethicsScript.ts keeps every beat's
// text and order; the voice is keyed by index).
//
// COMPOSITION, in stage units, RE-HUNG 2026-09-28 so that everything in the hall is
// in front of him: the bookcase 6–70 from 368, its plate 0–76 × 346–363; the window
// 82–208 × 296–362 over a hall table (top 440) with the diary 86–206 × 400–440; the
// mirror 220–320 × 298–488, its glass 228–312 × 306–480; the reader at x 364 facing
// it, LEFT, all lesson — the bookcase used to stand behind him, so the whole
// where-does-conscience-come-from part happened at his back. Band [290, 514].
//
// REAL THINGS, 2026-09-28: the wallet is a leather bifold with a note showing, and
// his hand takes it off the floor (actStance 4) — it rides his wrist, he looks at
// it, and it goes into his pocket behind him, never fading in the open. The balance
// in the glass stands on a pillar and a foot, and the reflection holds the pillar;
// it used to hang from the mirror's frame with nothing holding it. The plant is a
// seedling in a terracotta pot — two seed leaves, then two pairs of true leaves,
// then a five-petalled flower — where it was a stick with two ink ovals.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(TEAL);
const TR = 0.85;

const LEAD_X = 364;
/** The reflection stands a little further off, inside the glass, at its left. */
const K_REF = K_FIG * 0.8;
const REF_X = 22;
const REF_GROUND = MGLASS.h - 4;

const WINDOW_ART = windowFrame();
const POT_ART = pot();
const POT_TONE = stageToneOf(EMBER);
const TABLE_ART = hallTable();
const MIRROR_ART = mirrorFrame();
const CASE_ART = bookcase();

// the balance in the glass, in the glass's own units: a pillar on a foot, standing
// on the glass's floor, with the beam across its top. The reflection holds the
// pillar at shoulder height (REF_HOLD) once conscience has stepped out.
const BAL_X = 46;
const BEAM_Y = 52;
const PAN_OFF = 18;
const BEAM_W = 2 * PAN_OFF + 8;
const PAN_W = 44;
const TRAY_W = 30;
const REF_HOLD = { x: BAL_X - 2, y: REF_GROUND - 60 * K_REF + 2 };

/**
 * Where the wallet lies on the hall floor: exactly where his right hand reaches at
 * the bottom of the pick-up (actStance 4, at the moment `down` peaks), so the hand
 * that bends for it meets it rather than the wallet jumping up to the hand.
 */
const REACH_DOWN = handAt(actStance(4, 0, 0.48), { x: LEAD_X, groundY: GROUND, k: K_FIG, dir: -1 }, 1);
const FLOOR = { x: REACH_DOWN.x, y: GROUND - 5.5 };

const BOOKS = [
  { name: 'DARWIN', from: 'INSTINCT' },
  { name: 'FREUD', from: 'SOCIETY' },
  { name: 'KANT', from: 'REASON' },
];
const BOOK_W = 56;
const BOOK_H = 26;

// the question on the stage: three notes stuck to the mirror
const NOTE_W = 80;
const NOTE_H = 22;
const NOTES = [
  { id: 'sympathy', l1: 'FEELING', l2: 'SYMPATHY', correct: false },
  { id: 'fair', l1: 'PLAYING', l2: 'FAIR', correct: false },
  { id: 'judge', l1: 'JUDGING OWN', l2: 'ACTS', correct: true },
];

// ── per-beat tracks, read off the script ─────────────────────────────────────
const firstOf = (f: (b: (typeof BEATS)[number]) => unknown) => {
  const k = BEATS.findIndex((b) => !!f(b));
  return k < 0 ? BEATS.length : k;
};
const since = (k0: number) => BEATS.map((_, k) => (k >= k0 ? 1 : 0));
/**
 * A flag the script sets on some beats, held from its first beat to the end: a prop
 * that leaves and comes back blinks (check:props). The balance and the window's
 * question are both things that stay once they have arrived.
 */
function held(flags: number[]): number[] {
  const k0 = flags.indexOf(1);
  return k0 < 0 ? flags : since(k0);
}

const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const FIRST_JUDGE = firstOf((b) => b.judge);
const PICK = BEATS.map((b) => (b.pick ? 1 : 0));
/** Picked up on the first beat, gone after it. */
const WALLET = BEATS.map((_, k) => (k === 0 ? 1 : 0));
/** The mirror clouds with the question until the reflection starts to weigh. */
const HEAD = BEATS.map((_, k) => (k < FIRST_JUDGE ? 1 : 0));
const OWN = BEATS.map((_, k) => (k < FIRST_JUDGE && k >= firstOf((b) => b.own) ? 1 : 0));
const ANIM = since(firstOf((b) => b.critter));
const YOU = since(firstOf((b) => b.you));
/** Once conscience has stepped out it keeps weighing — except under the notes. */
const JUDGE_ON = held(BEATS.map((b) => (b.judge ? 1 : 0)));
const JUDGE = JUDGE_ON.map((v, k) => (v && !BEATS[k].pick ? 1 : 0));
const REAS = since(firstOf((b) => b.reasons));
const ORIG = since(firstOf((b) => b.origins));
const DISP = since(firstOf((b) => b.disputed));
const GOOD = held(BEATS.map((b) => (b.good ? 1 : 0)));
const SEED = since(firstOf((b) => b.seed || b.plant));
const PLANT = since(firstOf((b) => b.plant));
const BLOOM = since(firstOf((b) => b.bloom));
/** The pans hang level until reasons are weighed; then AGAINST is the heavier. */
const TILT = BEATS.map((_, k) => (REAS[k] ? 7 : 0));

function actPose(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.11, neck: 0.10, fistR: { x: 30, y: 9 }, fistL: { x: -4, y: -3 } };
}
function hHold(code: number, t: number): Stance {
  'worklet';
  if (code >= 100) return emoteAny(code, t);
  if (code === 1) return actPose(t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code >= 100) return emoteAnyLive(code, t, bt);
  if (code === 1) return actPose(t);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}

const X = BEATS.map(() => LEAD_X);
// R7c — the balance follows the order control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.order ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics'));

export default function EthicsScene({
  clock, bt, bi, pickPos, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const reacting = REACT[i] === 1;
  const held = useHeld();
  const cv = useCarry(18);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const late = (d: number) => {
      'worklet';
      return ease01((bt.value - d) / 0.45);
    };
    const sec = (a: number, z: number) => {
      'worklet';
      return ease01(clamp01((bt.value - a) / (z - a)));
    };
    // b0 — THE DEED, done with his own hand: he bends and takes the wallet off the
    // floor (actStance 4 over 1.7s), holds it up in front of him and looks at it,
    // puts it in his pocket, and by "Afterwards" (2.9s) has settled into thinking.
    let live = hLive(HPOSE[n], t, bt.value);
    const pickU = clamp01((bt.value - 0.15) / 1.7);
    if (n === 0) {
      let s0 = actStance(4, t, pickU);
      s0 = mixStance(s0, { ...s0, fistR: { x: 16, y: -22 }, neck: s0.neck + 0.12 }, sec(1.85, 2.15) * (1 - sec(2.45, 2.75)));
      s0 = mixStance(s0, { ...s0, fistR: { x: 3, y: 3 } }, sec(2.45, 2.75) * (1 - sec(3.0, 3.5)));
      live = mixStance(s0, hLive(257, t, bt.value), sec(3.0, 3.7));
    }
    const leadS = keepHeld(held, mixStance(carryFrom(held, n, hHold(HPOSE[p], t)), live, tr));
    const judge = carry(cv, 5, n, JUDGE[p], JUDGE[n], tr);
    // the reflection copies him, until conscience steps out and weighs the deed —
    // and then its hand is on the balance's pillar, holding it.
    let refS = mixStance(leadS, emoteAnyLive(257, t, bt.value), judge);
    refS = reachHandTo(refS, { x: REF_X, groundY: REF_GROUND, k: K_REF, dir: 1 }, 1, REF_HOLD.x, REF_HOLD.y, judge);
    // the wallet: on the floor, then in his hand (b0), then in his pocket
    const wHeld = n === 0 ? clamp01((pickU - 0.5) / 0.3) : 1;
    const inHand = handAt(leadS, { x: LEAD_X, groundY: GROUND, k: K_FIG, dir: -1 }, 1);
    const wX = lerp(FLOOR.x, inHand.x, wHeld);
    const wY = lerp(FLOOR.y, inHand.y, wHeld);

    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // At what is happening in the hall, when it happens — keyed on the voiced line
    // (ethics-ethics-1 in lib/narration/manifest.ts) and on the scene's own `late()`
    // entrances — and at nothing (weight 0, his pose's own head) once it is done.
    // He faces the mirror, so between events his eyes rest on his reflection rather
    // than on the ceiling. Since the re-hang everything he looks at is in front of
    // him, the bookcase at the far end included.
    // Beats are by index because the voice is keyed by index and cannot reorder.
    const mX = MGLASS.x + MGLASS.w / 2;                 // the mirror's middle
    const refY = MGLASS.y + REF_GROUND - 83 * K_REF;     // the reflection's head (pelvis 34 + head 49, rig units)
    const askY = MGLASS.y + 27;                         // WAS IT / RIGHT? in the glass
    const ownY = MGLASS.y + 55;                         // YOUR OWN / CONDUCT under it
    const beamY = MGLASS.y + BEAM_Y;                    // the balance's beam
    const leftX = DIARY.x + DIARY.w / 4;                // the diary's ANIMALS page
    const rightX = DIARY.x + (3 * DIARY.w) / 4;         // the diary's YOU page
    const caseX = CASE.x + CASE.w / 2;
    const tagX = WIN.x + WIN.w - 39;                    // the pot's tag
    const LK = n === 0 ? [0.1, FLOOR.x, FLOOR.y, 1, 0.8, wX, wY, 1, 2.75, 0, 0, 0, 2.9, mX, refY, 0.8, 4.9, mX, askY, 1, 7.0, 0, 0, 0]
      : n === 1 ? [0.1, mX, askY, 1, 2.9, mX, ownY, 1, 4.2, mX, refY, 0.6, 5.2, 0, 0, 0]
      : n === 2 ? [0.5, leftX, DIARY.y + 20, 1, 2.7, leftX, DIARY.y + 31, 1, 4.6, 0, 0, 0]
      : n === 3 ? [0.2, mX, refY, 1, 1.2, mX, beamY + 8, 1, 3.5, mX, refY, 0.8, 6.4, 0, 0, 0]
      : n === 4 ? [0.6, mX - PAN_OFF, beamY + 7, 1, 2.6, mX + PAN_OFF, beamY + 9, 1, 3.6, mX, beamY, 0.8, 7.0, 0, 0, 0]
      : n === 5 ? [0.3, caseX, CASE.top - 14, 0.7, 1.2, mX, beamY + 8, 1, 2.5, mX, refY, 0.9, 6.0, 0, 0, 0]
      : n === 6 ? [0.5, caseX, CASE.top - 14, 0.8, 2.4, caseX, SHELF_Y[0] - BOOK_H / 2, 0.8, 4.4, caseX, SHELF_Y[1] - BOOK_H / 2, 0.8, 6.6, caseX, SHELF_Y[2] - BOOK_H / 2, 0.8, 8.4, 0, 0, 0]
      : n === 7 ? [0.4, GLASS.x + 40, GLASS.y + 32, 1, 7.3, 0, 0, 0]
      : n === 8 ? [0.4, rightX, DIARY.y + 20, 1, 3.9, leftX, DIARY.y + 20, 0.9, 5.6, 0, 0, 0]
      : n === 9 ? [0.4, POT.cx, POT.top - 8, 1, 3.4, rightX, DIARY.y + 20, 0.8, 5.2, POT.cx, POT.top - 8, 0.9, 6.6, 0, 0, 0]
      : n === 11 ? [0.3, mX, MGLASS.y + 6 + (3 * NOTE_H + 10) / 2, 0.7]
      : n === 12 ? [0.3, mX, beamY + 8, 0.7]
      : n === 13 ? [0.2, POT.cx, POT.top - 16, 1, 2.0, tagX, SILL_Y + 16, 1, 5.6, POT.cx, POT.top - 16, 0.8, 7.5, 0, 0, 0]
      : n === 14 ? [0.5, POT.cx, POT.top - 24, 1, 1.8, tagX, SILL_Y + 26, 1, 4.5, POT.cx, POT.top - 24, 0.8, 7.9, 0, 0, 0]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, bt.value, 0, 0, 0);

    return {
      lead: lookPose(leadS, LEAD_X, GROUND, K_FIG, -1, 1, carry(cv, 15, n, lk.x, lk.x, tr), carry(cv, 16, n, lk.y, lk.y, tr), carry(cv, 17, n, 0, lk.w, tr)),
      ref: pose(refS, REF_X, REF_GROUND, K_REF, 1, 1),
      // picked up: the wallet rides his hand, then goes into his pocket (behind him)
      wHeld,
      wShow: n === 0 ? 1 - sec(2.8, 2.95) : 0,
      walletOn: carry(cv, 0, n, WALLET[p], WALLET[n], tr),
      head: carry(cv, 1, n, HEAD[p], HEAD[n], n === 0 ? late(1.1) : tr),
      own: carry(cv, 2, n, OWN[p], OWN[n], late(0.8)),
      anim: carry(cv, 3, n, ANIM[p], ANIM[n], late(0.6)),
      you: carry(cv, 4, n, YOU[p], YOU[n], late(0.5)),
      judge,
      reas: carry(cv, 6, n, REAS[p], REAS[n], late(0.7)),
      orig: carry(cv, 7, n, ORIG[p], ORIG[n], late(0.4)),
      disp: carry(cv, 8, n, DISP[p], DISP[n], late(0.6)),
      good: carry(cv, 9, n, GOOD[p], GOOD[n], late(0.4)),
      seed: carry(cv, 10, n, SEED[p], SEED[n], late(0.5)),
      plant: carry(cv, 11, n, PLANT[p], PLANT[n], late(0.3)),
      bloom: carry(cv, 12, n, BLOOM[p], BLOOM[n], late(0.6)),
      pick: carry(cv, 13, n, PICK[p], PICK[n], tr),
      tilt: carry(cv, 14, n, TILT[p], reacting ? lerp(0, 14, pickPos.value) : TILT[n], tr),
    };
  });

  const DL = useDerivedValue<Bundle>(() => SCENE.value.lead);
  const DR = useDerivedValue<Bundle>(() => SCENE.value.ref);
  // the wallet on the floor, then at his wrist as drawn (so it stays in his hand
  // whatever the movement layer does with him), then gone into his pocket
  const wallet = useAnimatedStyle(() => {
    const w = DL.value.wrR;
    const h = SCENE.value.wHeld;
    return {
      opacity: SCENE.value.walletOn * SCENE.value.wShow,
      transform: [
        { translateX: lerp(FLOOR.x, w[0].translateX, h) },
        { translateY: lerp(FLOOR.y, w[1].translateY + 2, h) },
        { rotate: `${-12 * h}deg` },
      ],
    };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={WINDOW_ART} tone={WOOD} />
      <View style={styles.glass} pointerEvents="none" />
      <NightWords S={SCENE} on={on} />
      <Plant S={SCENE} on={on} />
      <SetArt parts={POT_ART} tone={POT_TONE} line={1.6} />
      <ObjectArt parts={TABLE_ART} tone={WOOD} />
      <Diary S={SCENE} on={on} />
      <ObjectArt parts={CASE_ART} tone={WOOD} />
      <Books S={SCENE} on={on} />
      <ObjectArt parts={MIRROR_ART} tone={WOOD} />
      <Mirror S={SCENE} DR={DR} on={on} />
      {PICK[i] ? <Notes picked={picked} onPick={onPick} /> : null}
      <View style={styles.ground} pointerEvents="none" />
      {on(WALLET) ? (
        <Animated.View style={[styles.rider, wallet]} pointerEvents="none">
          <View style={styles.walletNote} />
          <View style={styles.wallet}>
            <View style={styles.walletFold} />
            <View style={styles.walletStitch} />
          </View>
        </Animated.View>
      ) : null}
      <Stickman D={DL} k={K_FIG} />
    </View>
  );
}

// ── the window: the moon, and the question about a life ─────────────────────

function NightWords({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.good, transform: [{ translateY: (1 - S.value.good) * 4 }] }));
  return (
    <>
      <View style={styles.moon} pointerEvents="none" />
      <View style={[styles.star, { left: GLASS.x + 18, top: GLASS.y + 8 }]} pointerEvents="none" />
      <View style={[styles.star, { left: GLASS.x + 84, top: GLASS.y + 12 }]} pointerEvents="none" />
      <View style={[styles.star, { left: GLASS.x + 30, top: GLASS.y + 44 }]} pointerEvents="none" />
      {on(GOOD) ? (
        <Animated.View style={[styles.nightWords, st]} pointerEvents="none">
          <Text style={styles.nightText} numberOfLines={1}>WHAT MAKES A</Text>
          <Text style={styles.nightText} numberOfLines={1}>LIFE GO WELL?</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

// A SEEDLING, THEN A PLANT, THEN A FLOWER — drawn against a photograph of a seedling
// in a pot (Wikimedia Commons, "Adenium seedling"): a green stem out of the soil, two
// round SEED LEAVES low on it first, then pairs of pointed TRUE LEAVES up the stem as
// it lengthens, and at the tip a five-petalled flower. Green on the night glass with
// an ink edge, so it reads against the dark; it used to be an ink stick with two ink
// ovals, which on dark glass read as a lollipop.
const STEM_MAX = 30;
/** Where each pair of leaves sits up the stem, and how big it grows. */
const LEAF_PAIRS = [
  { h: 7, w: 9, key: 'seed' as const, round: true },
  { h: 15, w: 12, key: 'plant' as const, round: false },
  { h: 22, w: 10, key: 'plant' as const, round: false },
];

function LeafPair({ S, h, w, keyName, round, k }: { S: SharedValue<any>; h: number; w: number; keyName: 'seed' | 'plant'; round: boolean; k: number }) {
  const st = useAnimatedStyle(() => {
    // the second true pair opens a little after the first
    const g = keyName === 'seed' ? S.value.seed : clamp01(S.value.plant * 1.6 - (k - 1) * 0.6);
    return { opacity: g > 0.02 ? 1 : 0, transform: [{ scale: 0.2 + 0.8 * g }] };
  });
  const lh = round ? w * 0.62 : w * 0.46;
  return (
    <Animated.View style={[styles.leafPair, { top: POT.top - h - lh / 2, height: lh }, st]}>
      <View style={[round ? styles.seedLeaf : styles.leafL, { width: w, height: lh, right: 1.2, transform: [{ rotate: round ? '-14deg' : '-26deg' }] }]} />
      <View style={[round ? styles.seedLeaf : styles.leafR, { width: w, height: lh, left: 1.2, transform: [{ rotate: round ? '14deg' : '26deg' }] }]} />
    </Animated.View>
  );
}

function Plant({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const stem = useAnimatedStyle(() => ({
    height: 9 * S.value.seed + 15 * S.value.plant + 6 * S.value.bloom,
  }));
  const flower = useAnimatedStyle(() => ({
    opacity: S.value.bloom > 0.02 ? 1 : 0,
    transform: [{ translateY: -STEM_MAX + 6 * (1 - S.value.bloom) }, { scale: 0.2 + 0.8 * S.value.bloom }, { rotate: `${40 * (1 - S.value.bloom)}deg` }],
  }));
  const tag = useAnimatedStyle(() => ({ opacity: S.value.plant }));
  const line2 = useAnimatedStyle(() => ({ opacity: S.value.bloom }));
  return (
    <>
      {on(SEED) ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View style={[styles.stem, stem]} />
          {LEAF_PAIRS.map((l, k) => <LeafPair key={k} S={S} h={l.h} w={l.w} keyName={l.key} round={l.round} k={k} />)}
          <Animated.View style={[styles.flower, flower]}>
            {[0, 1, 2, 3, 4].map((k) => (
              <View
                key={k}
                style={[styles.petal, {
                  left: 5 + 4 * Math.sin((k * 2 * Math.PI) / 5) - 3.4,
                  top: 5 - 4 * Math.cos((k * 2 * Math.PI) / 5) - 3.4,
                }]}
              />
            ))}
            <View style={styles.flowerEye} />
          </Animated.View>
        </View>
      ) : null}
      {on(PLANT) ? (
        <Animated.View style={[styles.potTag, tag]} pointerEvents="none">
          <Text style={styles.tagText} numberOfLines={1}>EUDAIMONIA</Text>
          <Animated.Text style={[styles.tagText, line2]} numberOfLines={1}>FLOURISHING</Animated.Text>
        </Animated.View>
      ) : null}
    </>
  );
}

// ── the diary on the hall table: ANIMALS · YOU ──────────────────────────────

function Diary({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const anim = useAnimatedStyle(() => ({ opacity: S.value.anim }));
  const you = useAnimatedStyle(() => ({ opacity: S.value.you, transform: [{ translateX: (1 - S.value.you) * -4 }] }));
  return (
    <View style={styles.diary} pointerEvents="none">
      <View style={[styles.page, { left: 0 }]} />
      <View style={[styles.page, { right: 0 }]} />
      <View style={styles.gutter} />
      {on(ANIM) ? (
        <Animated.View style={[styles.col, { left: 4 }, anim]}>
          <Text style={styles.pageHead} numberOfLines={1}>ANIMALS</Text>
          <Text style={styles.pageRow} numberOfLines={1}>SYMPATHY</Text>
          <Text style={styles.pageRow} numberOfLines={1}>FAIRNESS</Text>
        </Animated.View>
      ) : null}
      {on(ANIM) ? (
        <Animated.View style={[styles.col, { left: DIARY.w / 2 + 4 }, anim]}>
          <Text style={styles.pageHead} numberOfLines={1}>YOU</Text>
          {on(YOU) ? (
            <Animated.Text style={[styles.pageRow, styles.pageYou, you]} numberOfLines={1}>REASON</Animated.Text>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── the bookcase at the far end: where conscience comes from ───────────────
// Its shelves are full of spines (the set); on b5 one book on each shelf is turned
// face-out in front of them, and it carries the name.

function Books({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const names = useAnimatedStyle(() => ({ opacity: S.value.orig }));
  const out = useAnimatedStyle(() => ({ opacity: S.value.orig, transform: [{ scale: 0.86 + 0.14 * S.value.orig }] }));
  const plate = useAnimatedStyle(() => ({ opacity: S.value.orig, transform: [{ translateY: (1 - S.value.orig) * -5 }] }));
  const ask = useAnimatedStyle(() => ({ opacity: 1 - S.value.disp }));
  const disputed = useAnimatedStyle(() => ({ opacity: S.value.disp }));
  const tags = useAnimatedStyle(() => ({ opacity: S.value.disp, transform: [{ translateY: (1 - S.value.disp) * 3 }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {on(ORIG) ? BOOKS.map((b, k) => (
        <Animated.View key={b.name} style={[styles.book, { top: SHELF_Y[k] - BOOK_H }, out]}>
          <View style={styles.bookBand} />
          {on(ORIG) ? <Animated.Text style={[styles.bookText, names]} numberOfLines={1}>{b.name}</Animated.Text> : null}
          {on(DISP) ? <Animated.Text style={[styles.bookFrom, tags]} numberOfLines={1}>{b.from}</Animated.Text> : null}
        </Animated.View>
      )) : null}
      {on(ORIG) ? (
        <Animated.View style={[styles.casePlate, plate]}>
          <Animated.Text style={[styles.plateText, ask]} numberOfLines={1}>WHERE FROM?</Animated.Text>
          {on(DISP) ? (
            <Animated.Text style={[styles.plateText, styles.plateOver, disputed]} numberOfLines={1}>DISPUTED</Animated.Text>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── the mirror: the question in the glass, and the reflection that weighs it ─

function Mirror({ S, DR, on }: { S: SharedValue<any>; DR: SharedValue<Bundle>; on: (a: readonly number[]) => boolean }) {
  const head = useAnimatedStyle(() => ({ opacity: S.value.head }));
  const own = useAnimatedStyle(() => ({ opacity: S.value.own, transform: [{ translateY: (1 - S.value.own) * 4 }] }));
  const balance = useAnimatedStyle(() => ({ opacity: S.value.judge }));
  const beam = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.tilt}deg` }] }));
  const panL = useAnimatedStyle(() => ({
    transform: [{ translateY: -PAN_OFF * Math.sin((S.value.tilt * Math.PI) / 180) }],
  }));
  const panR = useAnimatedStyle(() => ({
    transform: [{ translateY: PAN_OFF * Math.sin((S.value.tilt * Math.PI) / 180) }],
  }));
  const chip = useAnimatedStyle(() => ({ opacity: S.value.reas, transform: [{ translateY: (1 - S.value.reas) * -12 }] }));
  const ghost = useAnimatedStyle(() => ({ opacity: 0.55 + 0.25 * S.value.judge }));
  return (
    <>
    <View style={styles.mglass} pointerEvents="none">
      <View style={styles.sheen} />
      <Animated.View style={[StyleSheet.absoluteFill, ghost]}>
        <Stickman D={DR} k={K_REF} />
      </Animated.View>
      {on(HEAD) ? (
        <Animated.View style={[styles.headWords, head]}>
          <Text style={styles.headText} numberOfLines={1}>WAS IT</Text>
          <Text style={styles.headText} numberOfLines={1}>RIGHT?</Text>
          {on(OWN) ? (
            <Animated.View style={own}>
              <Text style={styles.ownText} numberOfLines={1}>YOUR OWN</Text>
              <Text style={styles.ownText} numberOfLines={1}>CONDUCT</Text>
            </Animated.View>
          ) : null}
        </Animated.View>
      ) : null}
    </View>
      {/* The balance stands IN the glass on its own foot, and the reflection holds its
          pillar. Drawn outside the glass's clip so a pan's word is never cut by the
          frame's inner edge; everything else of it is inside the glass. */}
      {on(JUDGE) ? (
        <Animated.View style={[styles.balanceLayer, balance]} pointerEvents="none">
          <View style={styles.balFoot} />
          <View style={styles.pillar} />
          <Animated.View style={[styles.pan, { left: BAL_X - PAN_OFF - PAN_W / 2 }, panL]}>
            <View style={styles.panString} />
            <View style={styles.panTray} />
            {on(REAS) ? (
              <Animated.View style={[styles.chipRow, chip]}><View style={styles.chip}><Text style={styles.chipText} numberOfLines={1}>FOR</Text></View></Animated.View>
            ) : null}
          </Animated.View>
          <Animated.View style={[styles.pan, { left: BAL_X + PAN_OFF - PAN_W / 2 }, panR]}>
            <View style={styles.panString} />
            <View style={styles.panTray} />
            {on(REAS) ? (
              <Animated.View style={[styles.chipRow, chip]}><View style={styles.chip}><Text style={styles.chipText} numberOfLines={1}>AGAINST</Text></View></Animated.View>
            ) : null}
          </Animated.View>
          <Animated.View style={[styles.beam, beam]} />
          <View style={styles.pivot} />
        </Animated.View>
      ) : null}
    </>
  );
}

// ── the question on the stage: notes stuck to the mirror ────────────────────

function Notes({ picked, onPick }: { picked: string | null; onPick: (id: string, ok: boolean) => void }) {
  const answered = picked !== null;
  return (
    <>
      {NOTES.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={[styles.note, { top: MGLASS.y + 6 + k * (NOTE_H + 5) }]}
        >
          <View style={[styles.noteFace, answered && q.correct && styles.noteRight]}>
            <Text style={[styles.noteText, answered && q.correct && styles.noteTextOnInk]} numberOfLines={1}>{q.l1}</Text>
            <Text style={[styles.noteText, answered && q.correct && styles.noteTextOnInk]} numberOfLines={1}>{q.l2}</Text>
          </View>
        </Target>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },

  glass: {
    position: 'absolute', left: GLASS.x, top: GLASS.y, width: GLASS.w, height: GLASS.h,
    backgroundColor: DEEP, borderRadius: 1,
  },
  moon: {
    position: 'absolute', left: GLASS.x + 56, top: GLASS.y + 4, width: 11, height: 11, borderRadius: 5.5,
    backgroundColor: PAPER_LIT,
  },
  star: { position: 'absolute', width: 2.5, height: 2.5, borderRadius: 1.25, backgroundColor: PAPER_LIT },
  nightWords: { position: 'absolute', left: GLASS.x + 6, top: GLASS.y + 20 },
  nightText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, letterSpacing: 0.4, color: PAPER_LIT, includeFontPadding: false,
  },

  stem: {
    position: 'absolute', left: POT.cx - 1.6, bottom: STAGE_H - POT.top, width: 3.2, borderRadius: 1.6,
    backgroundColor: OLIVE, borderWidth: 0.8, borderColor: INK,
  },
  leafPair: { position: 'absolute', left: POT.cx - 14, width: 28, flexDirection: 'row', justifyContent: 'center' },
  seedLeaf: {
    position: 'absolute', top: 0, borderRadius: 4, backgroundColor: SAGE, borderWidth: 0.9, borderColor: INK,
  },
  // a pointed leaf: two opposite corners rounded right round, the other two nearly square
  leafL: {
    position: 'absolute', top: 0, backgroundColor: SAGE, borderWidth: 0.9, borderColor: INK,
    borderTopLeftRadius: 8, borderBottomRightRadius: 8, borderTopRightRadius: 0.5, borderBottomLeftRadius: 0.5,
    transformOrigin: '100% 50%',
  },
  leafR: {
    position: 'absolute', top: 0, backgroundColor: SAGE, borderWidth: 0.9, borderColor: INK,
    borderTopRightRadius: 8, borderBottomLeftRadius: 8, borderTopLeftRadius: 0.5, borderBottomRightRadius: 0.5,
    transformOrigin: '0% 50%',
  },
  flower: { position: 'absolute', left: POT.cx - 5, top: POT.top - 5, width: 10, height: 10 },
  petal: {
    position: 'absolute', width: 6.8, height: 6.8, borderRadius: 3.4, backgroundColor: EMBER, borderWidth: 0.9, borderColor: INK,
  },
  flowerEye: {
    position: 'absolute', left: 2.6, top: 2.6, width: 4.8, height: 4.8, borderRadius: 2.4, backgroundColor: PAPER_LIT,
    borderWidth: 0.9, borderColor: INK,
  },
  potTag: {
    position: 'absolute', left: WIN.x + WIN.w - 76, top: SILL_Y + 9, width: 74, paddingVertical: 2,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center',
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },

  diary: { position: 'absolute', left: DIARY.x, top: DIARY.y, width: DIARY.w, height: DIARY.h },
  page: {
    position: 'absolute', top: 0, bottom: 0, width: DIARY.w / 2, borderWidth: 1.5, borderColor: INK,
    borderRadius: 2, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  gutter: { position: 'absolute', left: DIARY.w / 2 - 1, top: 0, bottom: 0, width: 2, backgroundColor: SHADE },
  col: { position: 'absolute', top: 4 },
  pageHead: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  pageRow: {
    fontFamily: 'Inter_500Medium', fontSize: 9, lineHeight: 11, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  pageYou: { fontFamily: 'Inter_700Bold', textDecorationLine: 'underline', textDecorationColor: EMBER },

  book: {
    position: 'absolute', left: CASE.x + (CASE.w - BOOK_W) / 2, width: BOOK_W, height: BOOK_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 1.5, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingLeft: 7,
  },
  bookBand: { position: 'absolute', left: 2, top: 0, bottom: 0, width: 4, backgroundColor: SHADE },
  bookText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  bookFrom: {
    fontFamily: 'Inter_500Medium', fontSize: 9, lineHeight: 11, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  casePlate: {
    position: 'absolute', left: CASE.x - 6, top: CASE.top - 22, width: CASE.w + 12, height: 17,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  plateOver: { position: 'absolute' },

  mglass: {
    position: 'absolute', left: MGLASS.x, top: MGLASS.y, width: MGLASS.w, height: MGLASS.h,
    backgroundColor: STONE, borderRadius: 3, overflow: 'hidden',
  },
  sheen: {
    position: 'absolute', left: MGLASS.w - 30, top: -20, width: 10, height: MGLASS.h + 40,
    backgroundColor: PAPER_LIT, opacity: 0.35, transform: [{ rotate: '18deg' }],
  },
  headWords: { position: 'absolute', left: 0, right: 0, top: 12, alignItems: 'center' },
  headText: {
    fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 15, letterSpacing: 1, color: INK, includeFontPadding: false,
    textAlign: 'center',
  },
  ownText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false,
    textAlign: 'center', marginTop: 1,
  },
  balanceLayer: { position: 'absolute', left: MGLASS.x, top: MGLASS.y, width: MGLASS.w, height: MGLASS.h },
  balFoot: {
    position: 'absolute', left: BAL_X - 13, top: REF_GROUND - 6, width: 26, height: 6, borderRadius: 2,
    backgroundColor: SHADE, borderWidth: 1.2, borderColor: INK,
  },
  pillar: {
    position: 'absolute', left: BAL_X - 1.9, top: BEAM_Y, width: 3.8, height: REF_GROUND - 6 - BEAM_Y, borderRadius: 1,
    backgroundColor: SHADE, borderWidth: 1, borderColor: INK,
  },
  beam: {
    position: 'absolute', left: BAL_X - BEAM_W / 2, top: BEAM_Y - 1.5, width: BEAM_W, height: 3,
    borderRadius: 1.5, backgroundColor: INK,
  },
  pivot: {
    position: 'absolute', left: BAL_X - 3, top: BEAM_Y - 3, width: 6, height: 6, borderRadius: 3,
    backgroundColor: EMBER, borderWidth: 1, borderColor: INK,
  },
  pan: { position: 'absolute', top: BEAM_Y, width: PAN_W, height: 32, alignItems: 'center' },
  panString: { width: 1.5, height: 22, backgroundColor: INK },
  panTray: { width: TRAY_W, height: 5, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, backgroundColor: INK },
  chipRow: { position: 'absolute', left: 0, right: 0, top: 9, alignItems: 'center' },
  chip: {
    height: 12, paddingHorizontal: 2, borderWidth: 1, borderColor: INK, borderRadius: 2,
    backgroundColor: PLATE_FACE, alignItems: 'center', justifyContent: 'center',
  },
  chipText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.8, lineHeight: 10, letterSpacing: -0.2, color: INK, includeFontPadding: false,
  },

  note: { position: 'absolute', left: MGLASS.x + (MGLASS.w - NOTE_W) / 2, width: NOTE_W, height: NOTE_H },
  noteFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  noteRight: { backgroundColor: INK },
  noteText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 9.5, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  noteTextOnInk: { color: PAPER_LIT },

  rider: { position: 'absolute', left: 0, top: 0 },
  // a leather bifold wallet, closed: the fold down one end, a stitched edge, and a
  // banknote's corner showing over the top
  walletNote: {
    position: 'absolute', left: -5, top: -8.5, width: 10, height: 5, borderRadius: 0.8,
    backgroundColor: SAGE, borderWidth: 0.9, borderColor: INK, transform: [{ rotate: '-6deg' }],
  },
  wallet: {
    position: 'absolute', left: -8.5, top: -5.5, width: 17, height: 11, borderRadius: 2.5,
    borderWidth: 1.3, borderColor: INK, backgroundColor: OLIVE, overflow: 'hidden',
  },
  walletFold: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3.5, backgroundColor: DEEP },
  walletStitch: {
    position: 'absolute', left: 5.5, top: 1.8, right: 1.8, bottom: 1.8, borderRadius: 1.2,
    borderWidth: 0.7, borderColor: PAPER_LIT, borderStyle: 'dashed',
  },
});

export function EthicsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={EthicsScene} band={[290, 514]} camera={CAM} />;
}
