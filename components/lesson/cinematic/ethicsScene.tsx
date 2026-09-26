import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './ethicsScript';
import {
  ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand, type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { useLinger } from './useLinger';
import {
  windowFrame, pot, hallTable, mirrorFrame, bookcase,
  WIN, GLASS, SILL_Y, POT, DIARY, MGLASS, CASE, SHELF_Y,
} from './ethicsSet';
import { DEEP, EMBER, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// ethics-ethics-1, "Why Humans Care About Right and Wrong" — A HALLWAY AT NIGHT.
//
// Redrawn 2026-09-25, one of five first lessons the owner asked for after the logic
// debate studio, each displaying its information in a way of its own. Here the
// information is a REFLECTION: conscience is the figure in the mirror, who copies you
// until the moment it stops copying and starts weighing what you did.
//
//   b0–1  he picks a found wallet up off the hall floor; WAS IT RIGHT? clouds the
//         mirror, then ABOUT YOUR OWN CONDUCT.
//   b2    the diary on the hall table: what ANIMALS share — SYMPATHY, FAIRNESS.
//   b3–4  the reflection stops copying him and holds up a balance; FOR and AGAINST
//         drop into its pans.
//   b5–6  the bookcase behind him: DARWIN, FREUD, KANT, under WHERE FROM?; then
//         DISPUTED, and each book's answer — INSTINCT, SOCIETY, REASON.
//   b7–9  the reflection keeps its balance; the window: WHAT MAKES A LIFE GO WELL?; the diary's YOU page reads REASON;
//         a seedling in the pot on the sill.
//   b11   the first question, ON THE STAGE: three notes stuck to the mirror.
//   b12   the order question: the balance tips as the answer moves.
//   b13–14 the plant grows, EUDAIMONIA on its tag; it flowers, FLOURISHING.
//
// WHAT IS NOT CHANGED: every word of narration (ethicsScript.ts keeps every beat's
// text and order; the voice is keyed by index).
//
// COMPOSITION, in stage units: the window 14–140 × 296–362 over a hall table (top
// 440) with the diary 14–142 × 400–440; the mirror 150–262 × 298–488, its glass
// 158–254 × 306–480; the reader at x 298 facing it; the bookcase 326–394 from 384,
// its plate 320–398 × 362–378. Band [290, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(TEAL);
const TR = 0.85;

const LEAD_X = 298;
/** The reflection stands a little further off, inside the glass. */
const K_REF = K_FIG * 0.8;
const REF_X = MGLASS.w / 2;
const REF_GROUND = MGLASS.h - 4;

const WINDOW_ART = windowFrame();
const POT_ART = pot();
const TABLE_ART = hallTable();
const MIRROR_ART = mirrorFrame();
const CASE_ART = bookcase();

// the balance the reflection holds up, in the glass's own units
const BEAM_Y = 24;
const BEAM_W = 88;
const PAN_OFF = 23;
const PAN_W = 44;

const BOOKS = [
  { name: 'DARWIN', from: 'INSTINCT' },
  { name: 'FREUD', from: 'SOCIETY' },
  { name: 'KANT', from: 'REASON' },
];
const BOOK_W = 60;
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
  const cv = useCarry(15);
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
    const leadS = keepHeld(held, mixStance(carryFrom(held, n, hHold(HPOSE[p], t)), hLive(HPOSE[n], t, bt.value), tr));
    const judge = carry(cv, 5, n, JUDGE[p], JUDGE[n], tr);
    // the reflection copies him, until conscience steps out and weighs the deed
    const refS = mixStance(leadS, emoteAnyLive(257, t, bt.value), judge);
    return {
      lead: lookPose(leadS, LEAD_X, GROUND, K_FIG, -1, 1, gazeX.value, gazeY.value, gazeOn.value),
      ref: pose(refS, REF_X, REF_GROUND, K_REF, 1, 1),
      // picked up: the wallet rises to his hand and is pocketed
      wallet: n === 0 ? ease01((bt.value - 0.7) / 0.6) : 1,
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
  const wallet = useAnimatedStyle(() => ({
    opacity: SCENE.value.walletOn * (1 - SCENE.value.wallet),
    transform: [{ translateY: -34 * SCENE.value.wallet }, { rotate: `${-20 * SCENE.value.wallet}deg` }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={WINDOW_ART} tone={WOOD} />
      <View style={styles.glass} pointerEvents="none" />
      <NightWords S={SCENE} on={on} />
      <Plant S={SCENE} on={on} />
      <ObjectArt parts={POT_ART} tone={TONE} />
      <ObjectArt parts={TABLE_ART} tone={WOOD} />
      <Diary S={SCENE} on={on} />
      <ObjectArt parts={CASE_ART} tone={WOOD} />
      <Books S={SCENE} on={on} />
      <ObjectArt parts={MIRROR_ART} tone={WOOD} />
      <Mirror S={SCENE} DR={DR} on={on} />
      {PICK[i] ? <Notes picked={picked} onPick={onPick} /> : null}
      <View style={styles.ground} pointerEvents="none" />
      {on(WALLET) ? (
        <Animated.View style={[styles.wallet, wallet]} pointerEvents="none">
          <View style={styles.walletFlap} />
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

function Plant({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const stem = useAnimatedStyle(() => ({
    height: 7 * S.value.seed + 13 * S.value.plant + 5 * S.value.bloom,
  }));
  const leaves = useAnimatedStyle(() => ({
    opacity: S.value.seed,
    transform: [{ translateY: -(4 * S.value.seed + 8 * S.value.plant) }, { scale: 0.6 + 0.4 * S.value.plant }],
  }));
  const flower = useAnimatedStyle(() => ({
    opacity: S.value.bloom,
    transform: [{ scale: 0.3 + 0.7 * S.value.bloom }],
  }));
  const tag = useAnimatedStyle(() => ({ opacity: S.value.plant }));
  const line2 = useAnimatedStyle(() => ({ opacity: S.value.bloom }));
  return (
    <>
      {on(SEED) ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View style={[styles.stem, stem]} />
          <Animated.View style={[styles.leaves, leaves]}>
            <View style={[styles.leaf, { left: 0, transform: [{ rotate: '-30deg' }] }]} />
            <View style={[styles.leaf, { left: 10, transform: [{ rotate: '30deg' }] }]} />
          </Animated.View>
          <Animated.View style={[styles.flower, flower]}>
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

// ── the bookcase behind him: where conscience comes from ────────────────────

function Books({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const names = useAnimatedStyle(() => ({ opacity: S.value.orig }));
  const plate = useAnimatedStyle(() => ({ opacity: S.value.orig, transform: [{ translateY: (1 - S.value.orig) * -5 }] }));
  const ask = useAnimatedStyle(() => ({ opacity: 1 - S.value.disp }));
  const disputed = useAnimatedStyle(() => ({ opacity: S.value.disp }));
  const tags = useAnimatedStyle(() => ({ opacity: S.value.disp, transform: [{ translateY: (1 - S.value.disp) * 3 }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {BOOKS.map((b, k) => (
        <View key={b.name} style={[styles.book, { top: SHELF_Y[k] - BOOK_H }]}>
          <View style={styles.bookBand} />
          {on(ORIG) ? <Animated.Text style={[styles.bookText, names]} numberOfLines={1}>{b.name}</Animated.Text> : null}
          {on(DISP) ? <Animated.Text style={[styles.bookFrom, tags]} numberOfLines={1}>{b.from}</Animated.Text> : null}
        </View>
      ))}
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
  const balance = useAnimatedStyle(() => ({ opacity: S.value.judge, transform: [{ translateY: (1 - S.value.judge) * -10 }] }));
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
      {on(JUDGE) ? (
        <Animated.View style={[StyleSheet.absoluteFill, balance]}>
          <View style={styles.cord} />
          <Animated.View style={[styles.pan, { left: MGLASS.w / 2 - PAN_OFF - PAN_W / 2 }, panL]}>
            <View style={styles.panString} />
            <View style={styles.panTray} />
            {on(REAS) ? (
              <Animated.View style={[styles.chip, chip]}><Text style={styles.chipText} numberOfLines={1}>FOR</Text></Animated.View>
            ) : null}
          </Animated.View>
          <Animated.View style={[styles.pan, { left: MGLASS.w / 2 + PAN_OFF - PAN_W / 2 }, panR]}>
            <View style={styles.panString} />
            <View style={styles.panTray} />
            {on(REAS) ? (
              <Animated.View style={[styles.chip, chip]}><Text style={styles.chipText} numberOfLines={1}>AGAINST</Text></Animated.View>
            ) : null}
          </Animated.View>
          <Animated.View style={[styles.beam, beam]} />
          <View style={styles.pivot} />
        </Animated.View>
      ) : null}
    </View>
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
    position: 'absolute', left: POT.cx - 1.25, bottom: STAGE_H - POT.top, width: 2.5, borderRadius: 1.25,
    backgroundColor: INK,
  },
  leaves: { position: 'absolute', left: POT.cx - 10, top: POT.top - 8, width: 20, height: 8 },
  leaf: { position: 'absolute', top: 0, width: 10, height: 6, borderRadius: 5, backgroundColor: INK },
  flower: {
    position: 'absolute', left: POT.cx - 6, top: POT.top - 30, width: 12, height: 12, borderRadius: 6,
    backgroundColor: EMBER, borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  flowerEye: { width: 4, height: 4, borderRadius: 2, backgroundColor: PAPER_LIT },
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
  cord: { position: 'absolute', left: MGLASS.w / 2 - 0.75, top: 0, width: 1.5, height: BEAM_Y, borderRadius: 0.75, backgroundColor: INK },
  beam: {
    position: 'absolute', left: (MGLASS.w - BEAM_W) / 2 + 12, top: BEAM_Y - 1.5, width: BEAM_W - 24, height: 3,
    borderRadius: 1.5, backgroundColor: INK,
  },
  pivot: {
    position: 'absolute', left: MGLASS.w / 2 - 3, top: BEAM_Y - 3, width: 6, height: 6, borderRadius: 3,
    backgroundColor: EMBER, borderWidth: 1, borderColor: INK,
  },
  pan: { position: 'absolute', top: BEAM_Y, width: PAN_W, height: 32, alignItems: 'center' },
  panString: { width: 1.5, height: 12, backgroundColor: INK },
  panTray: { width: PAN_W - 8, height: 5, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, backgroundColor: INK },
  chip: {
    position: 'absolute', top: 1, height: 12, paddingHorizontal: 2, borderWidth: 1, borderColor: INK, borderRadius: 2,
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

  wallet: {
    position: 'absolute', left: LEAD_X - 36, top: GROUND - 9, width: 18, height: 9, borderRadius: 2,
    borderWidth: 1.5, borderColor: INK, backgroundColor: SHADE,
  },
  walletFlap: { position: 'absolute', left: 8, top: 1, width: 7, height: 4, borderRadius: 1, backgroundColor: EMBER },
});

export function EthicsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={EthicsScene} band={[290, 514]} camera={CAM} />;
}
