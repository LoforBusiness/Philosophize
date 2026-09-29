import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { oEll, oRect, oTri, oBar } from './objects';
import { BEATS } from './political3Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, stand, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, facing, pickAt,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { attendAt } from './attend';
import {
  doorway, plinth, cushion, charter, declFrame, ballotStand, crownCap, crownMetal, crownErmine, gunmanShadow, CROWN_K,
  DOORWAY, SHADOW, CUSHION, HOOK, CHARTER, INKPOT, SIGN, LINE2, DECL, BOX, SLOT,
  AT_PLINTH, AT_CHARTER,
} from './political3Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// political-political-3, "What Makes a Government Legitimate?" — A COUNCIL ROOM.
//
// Redrawn 2026-09-26: the third lesson of the branch in reading order. Every act is
// laid across its voiced line in stages (pace.ts, line lengths from the manifest). The
// gunman is only ever a shadow on the wall, and nobody is hurt in it (N11).
//
//   b0   a gunman's shadow falls through the doorway; he puts his hands up.
//   b1   the shadow goes; POWER on the doorway's plate, LEGITIMACY on the plinth's.
//   b2   he lifts the crown off its cushion; the shadow comes back: STATE OF WAR.
//   b3   he signs the charter with the quill, walks back and sets the crown down again.
//   b4   he takes the keys from his pocket and hangs them on the plinth: IN TRUST.
//   b5   he walks under the Declaration and it lights: 1776.
//   b7   at the ballot box he drops his slip in: GENERAL WILL, WILL OF ALL.
//   b8   back at the charter he adds a line, a law he gives himself.
//   b9   Q1 on the stage: the keys or the ballot box.
//   b10  Q2: the order control strings the ballot box to the charter as it moves (R7c).
//
// COMPOSITION, in stage units: the doorway 10–50 from 404; the plinth at 110 with the
// crown on its cushion at 446 and the hook at 124; the charter 170–226 × 390–452 with
// the inkpot at 178; the Declaration 250–296 × 336–386; the ballot box 322–358 ×
// 440–470. He stands at 144, 160, 232 and 310. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('political');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const METAL = stageToneOf(EMBER);
const IRON = stageToneOf(DEEP);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, political-political-3. */
const LINES = [4.52, 7.04, 8.76, 5.24, 8.96, 6.56, 0, 7.72, 7.08, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;

const X = BEATS.map((b) => b.x ?? AT_CHARTER);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_GUNMAN = is('gunman');
const A_POWER = is('power');
const A_NATURE = is('nature');
const A_COVENANT = is('covenant');
const A_TRUST = is('trust');
const A_DECL = is('decl');
const A_ROUSSEAU = is('rousseau');
const A_OWN = is('own');
const flag = (f: (b: (typeof BEATS)[number]) => unknown) => BEATS.map((b) => (f(b) ? 1 : 0));
const NAMED = flag((b) => b.named);
const WAR = flag((b) => b.war);
const SIGNED = flag((b) => b.signed);
const KEYS = flag((b) => b.keys);
const DECL_ON = flag((b) => b.decl);
const BALLOT = flag((b) => b.ballot);
const LINE2_ON = flag((b) => b.line2);
const Q1 = flag((b) => b.q1);
/** The order control is being answered: a cord runs from the box to the charter as it moves (R7c). */
const ORDER = flag((b) => b.interact?.order);
const LINK_AT = [0.15, 0.6, 1];
/** He holds the crown from the moment he lifts it (b2) until he sets it back (b3). */
const CROWN_HELD = BEATS.map((b) => (b.act === 'nature' ? 1 : 0));
/** Which way he faces once each beat settles: the doorway and the plinth to his left, then right. */
const DIR = BEATS.map((_, k) => (k <= 4 ? -1 : 1));

/** b3: over to the charter to sign, and back to set the crown down. */
const COV_LEGS = [[AT_CHARTER, 0.2], [AT_PLINTH, 3.4]];
const COV_KEYS = [[0, 1], [3.1, -1]];

const Q1_T = [
  { id: 'rights', label: 'RIGHTS\nBREACHED', x: 88, y: 404, w: 54, h: 88, correct: true },
  { id: 'election', label: 'ELECTION\nLOST', x: 314, y: 400, w: 52, h: 74, correct: false },
];

/** The crown, the keys and the quill, each drawn about its own origin so it can ride a hand. */
const CROWN_CAP = crownCap();
const CROWN_METAL = crownMetal();
const CROWN_ERMINE = crownErmine();
/** Where the crown's origin (the middle of its circlet) sits on the cushion, and above his hands. */
const CROWN_REST = { x: CUSHION.x, y: CUSHION.y - 11 * CROWN_K };
const CROWN_ON_HAND = 7 * CROWN_K;
const KEYS_ART = [
  oEll('line', 0, 0, 7, 7),
  oBar('mass', 1, 3, 3, 13, 2.2),
  oBar('mass', -2, 3, -4, 11, 2.2),
  oRect('mass', 4, 12, 4, 2, 0, 0.5),
  oRect('mass', -5, 10, 4, 2, 0, 0.5),
];
const QUILL_ART = [oEll('lit', 0, -9, 4, 16, 18), oBar('line', 1, -2, 2, 4, 1.2)];

function hHold(code: number, t: number): Stance {
  'worklet';
  if (code >= 100) return emoteAny(code, t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code >= 100) return emoteAnyLive(code, t, bt);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}
function handOn(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_M, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
function legAt(b: number, x0: number, legs: readonly (readonly number[])[]): { x: number; from: number; to: number; u: number } {
  'worklet';
  let from = x0;
  for (let k = 0; k < legs.length; k++) {
    const to = legs[k][0];
    const start = legs[k][1];
    const dur = moveTr(from, to, TR);
    if (b < start) return { x: from, from, to: from, u: 1 };
    if (b < start + dur) {
      const u = ease01((b - start) / dur);
      return { x: lerp(from, to, u), from, to, u };
    }
    from = to;
  }
  return { x: from, from, to: from, u: 1 };
}
function turnAt(b: number, d0: number, keys: readonly (readonly number[])[]): number {
  'worklet';
  let d = d0;
  for (let k = 0; k < keys.length; k++) d = lerp(d, keys[k][1], ease01(clamp01((b - keys[k][0]) / 0.3)));
  return d;
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political'));

export default function Political3Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(25);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const sec = (a: number, z: number) => {
      'worklet';
      return ease01(clamp01((b - a) / (z - a)));
    };
    const pulse = (a: number, m: number, z: number) => {
      'worklet';
      return sec(a, m) * (1 - sec(m, z));
    };

    // ── where he is ──────────────────────────────────────────────────────────
    const xp = X[p];
    const xn = X[n];
    const leg = A_COVENANT[n] ? legAt(b, xp, COV_LEGS) : null;
    const walking = !leg && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    const tx = leg ? leg.x : xn;
    const x = n === 0 ? tx : carry(cv, 0, n, xp, tx, walking ? walkU : leg ? 1 : tr);
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    if (leg && leg.u < 1 && leg.to !== leg.from) {
      s = travelStance(leg.from, leg.to, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), leg.u, WALK, 0);
    }
    const was = facing(DIR[p], DIR[p], b);
    let dirV = walking
      ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
      : facing(DIR[p], DIR[n], b);
    if (A_COVENANT[n]) dirV = turnAt(b, was, COV_KEYS);
    const dir = dirV < 0 ? -1 : 1;
    const arrive = walking ? walkDur : 0;

    // ── hands up to the shadow (b0), and down again (b1) ─────────────────────
    const up = A_GUNMAN[n] ? sec(0.6, 1.1) : A_POWER[n] ? 1 - sec(0.4, 1.0) : 0;
    s = mixStance(s, { ...s, fistR: { x: 14, y: -76 }, fistL: { x: -8, y: -76 } }, up);

    // ── the crown: lifted in BOTH hands and raised high over his head (b2), then
    // carried out in front of him, level, in both hands (b3) — the left alone while
    // the right signs — and set back with both ──
    // Reference: a crown is held by its band, level, in two hands, and raised to be
    // looked at — never swung at the hip like a bag. Held at the face it would hide
    // his head, so it goes up above it, or out at arm's length below it.
    const lift = A_NATURE[n] ? pulse(0.8, 1.2, 1.6) : 0;
    const liftY = CROWN_REST.y + CROWN_ON_HAND - 12 * sec(1.2, 1.5);
    s = handOn(s, x, dir, -1, CUSHION.x + 6, liftY, lift);
    s = handOn(s, x, dir, 1, CUSHION.x - 6, liftY, lift);
    const setDown = A_COVENANT[n] ? pulse(4.35, 4.75, 5.1) : 0;
    const holdCrown = A_NATURE[n] ? sec(1.2, 1.3) : A_COVENANT[n] ? 1 - sec(4.75, 4.85) : 0;
    // raised high over his head and looked up at, then brought down in front of him
    const raise = A_NATURE[n] ? sec(1.3, 1.9) * (1 - sec(3.2, 3.9)) : 0;
    s = mixStance(s, {
      ...s,
      fistL: { x: lerp(30, 12, raise), y: lerp(-28, -86, raise) },
      fistR: { x: lerp(35, 18, raise), y: lerp(-29, -87, raise) },
    }, holdCrown * (1 - lift) * (1 - setDown));
    s = handOn(s, x, dir, -1, CUSHION.x + 6, CROWN_REST.y + CROWN_ON_HAND, setDown);
    s = handOn(s, x, dir, 1, CUSHION.x - 6, CROWN_REST.y + CROWN_ON_HAND, setDown);

    // ── the quill: taken from the inkpot, a signature (b3) or a line (b8), put back ──
    const penAt = A_COVENANT[n] ? 1.1 : A_OWN[n] ? arrive + 0.2 : 99;
    const penLine = A_COVENANT[n] ? SIGN : LINE2;
    const writeU = sec(penAt + 0.4, penAt + 1.3);
    const writing = sec(penAt + 0.35, penAt + 0.45) * (1 - sec(penAt + 1.3, penAt + 1.4));
    const penX = lerp(INKPOT.x, lerp(penLine.x0, penLine.x1, writeU), writing);
    const penY = lerp(INKPOT.top - 4, penLine.y + 1.5 * Math.sin(b * 24) * writing, writing);
    const pen = sec(penAt, penAt + 0.25) * (1 - sec(penAt + 1.5, penAt + 1.75));
    s = handOn(s, x, dir, 1, penX, penY, pen);
    // while he signs, the crown is drawn back to his side, off the charter's page
    const aside = A_COVENANT[n] ? pen : 0;
    s = { ...s, fistL: { x: lerp(s.fistL.x, -4, aside), y: lerp(s.fistL.y, -30, aside) } };
    const quillHeld = sec(penAt + 0.2, penAt + 0.3) * (1 - sec(penAt + 1.5, penAt + 1.6));
    // the crown rides both hands, or the left alone while the right has the quill
    const both = A_NATURE[n] || A_COVENANT[n] ? 1 - pen : 0;

    // ── the keys: out of his pocket, onto the plinth's hook (b4) ────────────
    const pocket = A_TRUST[n] ? pulse(0.5, 0.8, 1.1) : 0;
    s = mixStance(s, { ...s, fistR: { x: 4, y: -6 } }, pocket);
    const hang = A_TRUST[n] ? pulse(1.2, 1.7, 2.4) : 0;
    s = handOn(s, x, dir, 1, HOOK.x, HOOK.y - 2, hang);
    const keysHeld = A_TRUST[n] ? sec(0.75, 0.85) * (1 - sec(1.65, 1.75)) : 0;

    // ── a slip into the ballot box (b7) ─────────────────────────────────────
    const vote = A_ROUSSEAU[n] ? pulse(arrive + 0.3, arrive + 0.8, arrive + 1.4) : 0;
    s = handOn(s, x, dir, 1, SLOT.x, SLOT.y - 3 + 4 * sec(arrive + 0.8, arrive + 1.0), vote);
    const slipHeld = A_ROUSSEAU[n] ? sec(arrive + 0.2, arrive + 0.3) * (1 - sec(arrive + 0.95, arrive + 1.05)) : 0;

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the room ─────────────────────────────────────────────────────────────
    // the shadow comes back for the state of war, and is gone again once the line is over
    const shadow = A_GUNMAN[n] ? sec(0.1, 0.7) : A_POWER[n] ? 1 - sec(0.3, 1.1) : A_NATURE[n] ? st(0.72, 0.8) * (1 - sec(L + 0.6, L + 1.2)) : 0;
    const power = A_POWER[n] ? sec(0.8, 1.3) : NAMED[n];
    const legit = A_POWER[n] ? st(0.5, 0.58) : NAMED[n];
    const warRow = A_NATURE[n] ? st(0.78, 0.86) : WAR[n];
    const crownOff = A_NATURE[n] ? sec(1.2, 1.3) : A_COVENANT[n] ? 1 - sec(4.75, 4.85) : 0;
    const sign = A_COVENANT[n] ? sec(penAt + 0.4, penAt + 1.3) : SIGNED[n];
    const cov = A_COVENANT[n] ? sec(2.5, 3.0) : SIGNED[n];
    const keysOn = A_TRUST[n] ? sec(1.65, 1.75) : KEYS[n];
    const trust = A_TRUST[n] ? st(0.6, 0.68) : KEYS[n];
    const glint = A_TRUST[n] ? pulse(L * 0.88, L * 0.92, L * 0.98) : 0;
    const decl = A_DECL[n] ? sec(arrive + 0.2, arrive + 1.0) : DECL_ON[n];
    const slips = A_ROUSSEAU[n] ? sec(arrive + 0.95, arrive + 1.3) : BALLOT[n];
    const general = A_ROUSSEAU[n] ? st(0.3, 0.38) : BALLOT[n];
    const allRow = A_ROUSSEAU[n] ? st(0.8, 0.88) : BALLOT[n];
    const line2 = A_OWN[n] ? sec(penAt + 0.4, penAt + 1.3) : LINE2_ON[n];
    const link = ORDER[n] ? pickAt(LINK_AT, pickPos.value) : 0;

    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // At what is happening, when it happens: the shadow in the doorway, each word as
    // it comes up on its plate, the crown in his hand, the quill's point as it writes,
    // the keys onto their hook, the Declaration as it lights, the slip into the box —
    // and at nothing (weight 0, his pose's own head) once it is over. The generated
    // gaze aimed every beat at the middle of the picture, which on this set is the
    // blank wall above the plinth.
    // The plates are drawn by styles, not the set, so their rows are placed from
    // there: the doorway's at x 44 (POWER 376, STATE OF WAR 388), the plinth's over
    // CUSHION.x (LEGITIMACY 312, IN TRUST 324), the charter's at 199 (COVENANT 366,
    // GENERAL WILL 378), the box's at 363 × 415. 430 is a wall shadow's chest, and
    // x − 10 / 390 the crown held up over his head, x - 3 / 468 his pocket.
    const LK = A_GUNMAN[n] ? [0.15, SHADOW.x, 430, 1]
      : A_POWER[n] ? [0, SHADOW.x, 430, 1, 0.9, 44, 376, 1, L * 0.5, CUSHION.x, 312, 0.7, L * 0.85, 0, 0, 0]
      : A_NATURE[n] ? [0.4, CUSHION.x, CUSHION.y, 1, 1.4, x - 10, 390, 1, 3.5, 0, 0, 0, L * 0.72, SHADOW.x, 430, 1, L * 0.8, 44, 388, 0.9, L + 0.8, 0, 0, 0]
      : A_COVENANT[n] ? [0.2, (CHARTER.x0 + CHARTER.x1) / 2, 424, 0.8, 1.0, penX, penY, 1, 2.6, 199, 366, 0.85, 3.2, CUSHION.x, CUSHION.y, 1, 5.1, 0, 0, 0]
      : A_TRUST[n] ? [0.4, x - 3, 468, 0.8, 1.1, HOOK.x, HOOK.y, 1, 2.6, 0, 0, 0, L * 0.6, CUSHION.x, 324, 0.8, L * 0.74, 0, 0, 0, L * 0.86, HOOK.x, HOOK.y, 0.9, L, 0, 0, 0]
      : A_DECL[n] ? [arrive - 0.3, (DECL.x0 + DECL.x1) / 2, (DECL.top + DECL.bottom) / 2, 1, arrive + 2.6, 0, 0, 0]
      : A_ROUSSEAU[n] ? [arrive - 0.4, SLOT.x, SLOT.y, 1, arrive + 1.3, (BOX.x0 + BOX.x1) / 2, 460, 0.9, L * 0.45, 199, 378, 0.6, L * 0.62, 0, 0, 0, L * 0.8, 363, 415, 1, L * 0.97, 0, 0, 0]
      : A_OWN[n] ? [arrive, penX, penY, 1, penAt + 1.8, 0, 0, 0]
      // Q1 stays eyes-front: its right answer is the plinth he stands beside, and a
      // look at it would give it away. Q2 follows the cord as the order control draws it.
      : ORDER[n] ? [0.3, lerp(CHARTER.x1 + 4, BOX.x0 - 2, link), lerp(424, BOX.top + 4, link), 0.7]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    return {
      fig: lookPose(fig, x, GROUND, K_M, dirV, 1, carry(cv, 21, n, lk.x, lk.x, tr), carry(cv, 22, n, lk.y, lk.y, tr), carry(cv, 23, n, 0, lk.w, tr)),
      shadow: carry(cv, 1, n, 0, shadow, tr),
      power: carry(cv, 2, n, NAMED[p], power, tr),
      legit: carry(cv, 3, n, NAMED[p], legit, tr),
      warRow: carry(cv, 4, n, WAR[p], warRow, tr),
      crownOff: carry(cv, 5, n, CROWN_HELD[p], crownOff, tr),
      crownBoth: carry(cv, 24, n, CROWN_HELD[p], both, tr),
      sign: carry(cv, 6, n, SIGNED[p], sign, tr),
      cov: carry(cv, 7, n, SIGNED[p], cov, tr),
      keysOn: carry(cv, 8, n, KEYS[p], keysOn, tr),
      keysHeld: carry(cv, 9, n, 0, keysHeld, tr),
      trust: carry(cv, 10, n, KEYS[p], trust, tr),
      glint: carry(cv, 11, n, 0, glint, tr),
      decl: carry(cv, 12, n, DECL_ON[p], decl, tr),
      slips: carry(cv, 13, n, BALLOT[p], slips, tr),
      slipHeld: carry(cv, 14, n, 0, slipHeld, tr),
      general: carry(cv, 15, n, BALLOT[p], general, tr),
      allRow: carry(cv, 16, n, BALLOT[p], allRow, tr),
      line2: carry(cv, 17, n, LINE2_ON[p], line2, tr),
      quillHeld: carry(cv, 18, n, 0, quillHeld, tr),
      q1: carry(cv, 19, n, Q1[p], Q1[n], tr),
      link: carry(cv, 20, n, 0, link, tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.wall} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <View key={k} style={[styles.panel, { left: 6 + k * 57 }]} />)}
      </View>
      <View style={styles.dayOutside} pointerEvents="none" />
      <Shadows S={SCENE} />
      <ObjectArt parts={DOORWAY_ART} tone={WOOD} />
      <Charter S={SCENE} />
      <ObjectArt parts={CHARTER_ART} tone={WOOD} />
      <ObjectArt parts={DECL_ART} tone={WOOD} />
      <Declaration S={SCENE} />
      <ObjectArt parts={PLINTH_ART} tone={IRON} />
      <ObjectArt parts={CUSHION_ART} tone={stageToneOf(TEAL)} />
      <Ballot S={SCENE} />
      <ObjectArt parts={STAND_ART} tone={WOOD} />
      {on(ORDER) ? <Link S={SCENE} /> : null}
      <Plates S={SCENE} on={on} />
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_M} />
      <Held S={SCENE} DF={DF} />
      {Q1[i] ? <Answers picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const DOORWAY_ART = doorway();
const SHADOW_ART = gunmanShadow();
const PLINTH_ART = plinth();
const CUSHION_ART = cushion();
const CHARTER_ART = charter();
const DECL_ART = declFrame();
const STAND_ART = ballotStand();

// ── the gunman's shadow on the wall, thrown in through the doorway ────────────

function Shadows({ S }: { S: SharedValue<any> }) {
  // one flat tone, laid on the wall at a fraction of ink: it slides in from the
  // doorway as he steps up to it, and back out as he goes
  const one = useAnimatedStyle(() => ({ opacity: 0.26 * S.value.shadow, transform: [{ translateX: -14 * (1 - S.value.shadow) }] }));
  return (
    <Animated.View style={[styles.shadowLayer, one]} pointerEvents="none">
      <SetArt parts={SHADOW_ART} tone={IRON} line={0} />
    </Animated.View>
  );
}

// ── the charter on the wall, the signature and the added line ────────────────

function Charter({ S }: { S: SharedValue<any> }) {
  const sig = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.sign }] }));
  const line2 = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.line2 }] }));
  return (
    <View style={styles.sheet} pointerEvents="none">
      {[0, 1, 2, 3].map((k) => <View key={k} style={[styles.rule, { top: 8 + k * 7, width: k === 3 ? 28 : 40 }]} />)}
      <Animated.View style={[styles.ink, { top: SIGN.y - CHARTER.top - 2, left: SIGN.x0 - CHARTER.x0 - 2, width: SIGN.x1 - SIGN.x0 }, sig]} />
      <Animated.View style={[styles.ink, { top: LINE2.y - CHARTER.top - 2, left: LINE2.x0 - CHARTER.x0 - 2, width: LINE2.x1 - LINE2.x0 }, line2]} />
    </View>
  );
}

// ── the Declaration, lit when it is named ───────────────────────────────────

function Declaration({ S }: { S: SharedValue<any> }) {
  // the paper is there all along, dim; its date is legible or absent, never a smear (D35)
  const lit = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * S.value.decl }));
  const date = useAnimatedStyle(() => ({ opacity: S.value.decl > 0.5 ? S.value.decl : 0 }));
  return (
    <>
      <Animated.View style={[styles.declPaper, lit]} pointerEvents="none">
        {[0, 1, 2].map((k) => <View key={k} style={[styles.rule, { top: 22 + k * 6, left: 6, width: 26 }]} />)}
      </Animated.View>
      <Animated.View style={[styles.declPaper, styles.declClear, date]} pointerEvents="none">
        <Text style={styles.declText} numberOfLines={1}>1776</Text>
      </Animated.View>
    </>
  );
}

// ── the glass ballot box and the slips in it ─────────────────────────────────

function Ballot({ S }: { S: SharedValue<any> }) {
  const mine = useAnimatedStyle(() => ({ opacity: S.value.slips, transform: [{ translateY: -12 * (1 - S.value.slips) }] }));
  return (
    <View style={styles.glass} pointerEvents="none">
      {[0, 1, 2, 3, 4].map((k) => (
        <View key={k} style={[styles.slip, { left: 3 + k * 6, bottom: 1 + (k % 2) * 2, transform: [{ rotate: `${(k % 3) * 12 - 12}deg` }] }]} />
      ))}
      <Animated.View style={[styles.slip, { left: 14, bottom: 6 }, mine]} />
    </View>
  );
}

// ── what he holds: the crown, the quill, the keys, a slip ────────────────────

function Held({ S, DF }: { S: SharedValue<any>; DF: SharedValue<Bundle> }) {
  // on the cushion, or on his hands: between both of them while he holds it up (b2),
  // on the left one alone while he walks and signs (b3)
  const crown = useAnimatedStyle(() => {
    const l = DF.value.wrL;
    const r = DF.value.wrR;
    const h = S.value.crownOff;
    const two = S.value.crownBoth;
    const hx = lerp(l[0].translateX, (l[0].translateX + r[0].translateX) / 2, two);
    const hy = lerp(l[1].translateY, (l[1].translateY + r[1].translateY) / 2, two) - CROWN_ON_HAND;
    return {
      transform: [
        { translateX: lerp(CROWN_REST.x, hx, h) },
        { translateY: lerp(CROWN_REST.y, hy, h) },
      ],
    };
  });
  const quill = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const h = S.value.quillHeld;
    return {
      transform: [
        { translateX: lerp(INKPOT.x + 1, w[0].translateX, h) },
        { translateY: lerp(INKPOT.top - 2, w[1].translateY, h) },
      ],
    };
  });
  const keys = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const h = S.value.keysHeld;
    return {
      opacity: Math.max(h, S.value.keysOn),
      transform: [
        { translateX: lerp(HOOK.x + 1, w[0].translateX, h) },
        { translateY: lerp(HOOK.y + 2, w[1].translateY + 1, h) },
        { rotate: `${6 * S.value.glint * Math.sin(S.value.t * 9)}deg` },
      ],
    };
  });
  const slip = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    return { opacity: S.value.slipHeld, transform: [{ translateX: w[0].translateX - 3 }, { translateY: w[1].translateY - 8 }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, crown]} pointerEvents="none">
        <ObjectArt parts={CROWN_CAP} tone={IRON} />
        <ObjectArt parts={CROWN_METAL} tone={METAL} />
        <ObjectArt parts={CROWN_ERMINE} tone={METAL} />
      </Animated.View>
      <Animated.View style={[styles.rider, quill]} pointerEvents="none">
        <ObjectArt parts={QUILL_ART} tone={WOOD} />
      </Animated.View>
      <Animated.View style={[styles.rider, keys]} pointerEvents="none">
        <ObjectArt parts={KEYS_ART} tone={METAL} />
      </Animated.View>
      <Animated.View style={[styles.rider, slip]} pointerEvents="none">
        <View style={[styles.slip, { left: 0, top: 0 }]} />
      </Animated.View>
    </>
  );
}

// ── the plates: POWER and STATE OF WAR by the doorway, LEGITIMACY and IN TRUST over
// the crown, COVENANT and GENERAL WILL over the charter, WILL OF ALL by the box ──

function Row({ v, text, first }: { v: SharedValue<number>; text: string; first?: boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: v.value }));
  return <Animated.Text style={[styles.plateText, first ? null : styles.second, st]} numberOfLines={1}>{text}</Animated.Text>;
}
function Plates({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const power = useDerivedValue(() => S.value.power);
  const war = useDerivedValue(() => S.value.warRow);
  const legit = useDerivedValue(() => S.value.legit);
  const trust = useDerivedValue(() => S.value.trust);
  const cov = useDerivedValue(() => S.value.cov);
  const general = useDerivedValue(() => S.value.general);
  const all = useDerivedValue(() => S.value.allRow * (1 - S.value.q1));
  const doorPlate = useAnimatedStyle(() => ({ opacity: S.value.power }));
  const crownPlate = useAnimatedStyle(() => ({ opacity: S.value.legit }));
  const charterPlate = useAnimatedStyle(() => ({ opacity: S.value.cov }));
  const boxPlate = useAnimatedStyle(() => ({ opacity: S.value.allRow * (1 - S.value.q1) }));
  return (
    <>
      {on(NAMED) ? (
        <>
          <Animated.View style={[styles.plate, styles.doorPlate, doorPlate]} pointerEvents="none">
            <Row v={power} text="POWER" first />
            <Row v={war} text="STATE OF WAR" />
          </Animated.View>
          <Animated.View style={[styles.plate, styles.crownPlate, crownPlate]} pointerEvents="none">
            <Row v={legit} text="LEGITIMACY" first />
            <Row v={trust} text="IN TRUST" />
          </Animated.View>
        </>
      ) : null}
      {on(SIGNED) ? (
        <Animated.View style={[styles.plate, styles.charterPlate, charterPlate]} pointerEvents="none">
          <Row v={cov} text="COVENANT" first />
          <Row v={general} text="GENERAL WILL" />
        </Animated.View>
      ) : null}
      {on(BALLOT) ? (
        <Animated.View style={[styles.plate, styles.boxPlate, boxPlate]} pointerEvents="none">
          <Row v={all} text="WILL OF ALL" first />
        </Animated.View>
      ) : null}
    </>
  );
}

// ── Q2: a cord from the ballot box to the charter, as far as the answer trusts a vote ──

function Link({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6].map((k) => <Dash key={k} S={S} k={k} />)}
    </>
  );
}
const LINK_FROM = { x: CHARTER.x1 + 4, y: 424 };
const LINK_TO = { x: BOX.x0 - 2, y: BOX.top + 4 };
function Dash({ S, k }: { S: SharedValue<any>; k: number }) {
  const u = (k + 0.5) / 7;
  const x = lerp(LINK_FROM.x, LINK_TO.x, u);
  const y = lerp(LINK_FROM.y, LINK_TO.y, u);
  const deg = (Math.atan2(LINK_TO.y - LINK_FROM.y, LINK_TO.x - LINK_FROM.x) * 180) / Math.PI;
  const st = useAnimatedStyle(() => ({ opacity: clamp01((S.value.link - u * 0.85) * 6) }));
  return <Animated.View style={[styles.dash, { left: x - 5, top: y - 1, transform: [{ rotate: `${deg}deg` }] }, st]} pointerEvents="none" />;
}

// ── Q1: the keys held in trust, or the ballot box ───────────────────────────

function Answers({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {Q1_T.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={6}
          disabled={answered} sealAt="tr"
          style={[styles.answer, { left: q.x, top: q.y, width: q.w, height: q.h }]}
        >
          <View style={styles.answerFill}>
            <View style={[styles.answerTag, answered && q.correct && styles.tagRight]}>
              <Text style={[styles.answerText, answered && q.correct && styles.onInk]} numberOfLines={2}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const DOOR_W = DOORWAY.x1 - DOORWAY.x0;

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: {
    position: 'absolute', left: 0, top: 292, width: STAGE_W, height: GROUND - 292, backgroundColor: WALL.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  panel: { position: 'absolute', top: 0, bottom: 0, width: 1, borderRadius: 0.5, backgroundColor: WALL.RULE },
  rider: { position: 'absolute', left: 0, top: 0 },
  dayOutside: {
    position: 'absolute', left: DOORWAY.x0, top: DOORWAY.top, width: DOOR_W, height: GROUND - DOORWAY.top, borderRadius: 1,
    backgroundColor: PAPER_LIT,
  },

  shadowLayer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },

  sheet: {
    position: 'absolute', left: CHARTER.x0, top: CHARTER.top + 4, width: CHARTER.x1 - CHARTER.x0, height: CHARTER.bottom - CHARTER.top - 8,
    borderRadius: 1, backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK,
  },
  rule: { position: 'absolute', left: 7, height: 1.2, borderRadius: 0.6, backgroundColor: INK, opacity: 0.35 },
  ink: { position: 'absolute', height: 2, borderRadius: 1, backgroundColor: DEEP, transformOrigin: '0% 50%' },

  declPaper: {
    position: 'absolute', left: DECL.x0 + 4, top: DECL.top + 4, width: DECL.x1 - DECL.x0 - 8, height: DECL.bottom - DECL.top - 8,
    borderRadius: 1, backgroundColor: PAPER_LIT, alignItems: 'center',
  },
  declClear: { backgroundColor: 'transparent' },
  declText: {
    marginTop: 5, fontFamily: 'Inter_700Bold', fontSize: 9.6, lineHeight: 11, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  glass: {
    position: 'absolute', left: BOX.x0, top: BOX.top + 1, width: BOX.x1 - BOX.x0, height: BOX.bottom - BOX.top - 1,
    borderRadius: 2, borderWidth: 1.5, borderColor: INK, backgroundColor: stageToneOf(TEAL).STONE, overflow: 'hidden',
  },
  slip: { position: 'absolute', width: 8, height: 5, borderRadius: 1, backgroundColor: PAPER_LIT, borderWidth: 0.8, borderColor: INK },
  dash: { position: 'absolute', width: 10, height: 2, borderRadius: 1, backgroundColor: EMBER },

  plate: {
    position: 'absolute', height: 26, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', paddingTop: 3,
  },
  doorPlate: { left: 4, top: 368, width: 80 },
  // high over the plinth, clear of his head: a thought needs the air between them
  crownPlate: { left: 74, top: 304, width: 72 },
  charterPlate: { left: 160, top: 360, width: 78 },
  boxPlate: { left: 330, top: 408, width: 66, height: 15, paddingTop: 2 },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  second: { marginTop: 0 },

  answer: { position: 'absolute' },
  answerFill: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 },
  answerTag: {
    paddingHorizontal: 3, paddingVertical: 1, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
    backgroundColor: PLATE_FACE, justifyContent: 'center',
  },
  tagRight: { backgroundColor: INK },
  answerText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
    textAlign: 'center',
  },
  onInk: { color: PAPER_LIT },
});

export function Political3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political3Scene} band={[288, 514]} camera={CAM} />;
}
