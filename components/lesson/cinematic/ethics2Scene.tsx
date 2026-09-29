import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './ethics2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, pose, seated, stand, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, facing,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import { attendAt } from './attend';
import {
  shop, steps, aBoard, cafe, STEPS, CLIMB_X, DOOR, BOARD, AWNING, TABLE, CHAIR, CASES, CASE_W, railY,
} from './ethics2Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// ethics-ethics-2, "One Choice, Three Lenses" — A PAVEMENT OUTSIDE A CAFÉ.
//
// Redrawn 2026-09-26, one of six second lessons. Every act is laid across its voiced
// line in stages (pace.ts, line lengths from the narration manifest).
//
//   b0   he walks in along the pavement, sees a wallet, and picks it up.
//   b1   three glasses cases open on the café table, one after another: he lifts the
//        lids of the two nearest him, and she lifts the third.
//   b2   he goes to the A-board and chalks OUTCOMES on it; he puts on the first pair.
//   b3   he chalks DUTY and CHARACTER under it.
//   b4   he swaps the three pairs back and forth; a bracket joins the rows: MIXED.
//   b5   he takes the wallet to the woman at the table; happiness gauges, hung from
//        the awning over each of them, rise as she takes it.
//   b6   the gauges are marked equal.
//   b8   the second pair; a sign is let down on its chains under the awning:
//        KEEP ANY WALLET YOU FIND.
//   b9   his own wallet slips from his pocket, she picks it up and keeps it — the rule
//        willed for everyone — and the rule is struck out.
//   b10  the third pair; he walks to the shop's front steps and looks up at HONESTY.
//   b11  he climbs them, a step at a time, each one lit as he stands on it.
//   b12  Q1: three thoughts through the outcomes glasses.
//   b13  Q2: three street signs.
//
// COMPOSITION, in stage units: the shop 0–132 with its steps rising right to a door
// at 72–122; the A-board 186–270 × 430–480 on its frame; the café front 264–400
// under its awning, the table 286–350 at x 318, her chair at 358; he finds the
// wallet at 146, opens the cases at 282, chalks the board from 176 and hands the
// wallet back at 296. Band [288, 514].
//
// RESTAGED 2026-09-28 so that what happens is IN FRONT of him. He chalks the A-board
// from its LEFT (b2–b4), facing it with the café and her beyond it — so he faces
// both the thing he works and the person he is with (N21); the board and THE RULE
// used to be behind him the whole time he faced the café. THE RULE hangs on
// two chains from the awning now, where it used to float in mid-air, and so do the
// happiness gauges, which hung over the two heads with nothing holding them. The
// wallets are leather bifolds with a note showing and the cases are real clamshell
// glasses cases, each with its pair lying inside; they were 14×9 and 12×7 boxes.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('ethics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
const BRICK = stageToneOf(SAGE);
const CANVAS = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, ethics-ethics-2. */
const LINES = [3.76, 3.68, 6.88, 5.2, 6.04, 7.24, 5.92, 0, 6.88, 8.36, 6.16, 7.72, 0, 0, 0];

/** Both of them at this scale: a lone figure at K_FIG fills 46% of this band; this is 37%. */
const K_E = K_FIG * 0.82;
/** Where the wallet lies on the pavement. */
const WALLET = { x: 160, y: GROUND - 5.5 };
/** Where his own wallet lands when it slips from his pocket: at her feet. */
const OWN_AT = { x: 330, y: GROUND - 5 };
/** Her seat height, in the rig's units. */
const SEAT_H = 30;

const X = BEATS.map((b) => b.x ?? 150);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_FIND = is('find');
const A_CASES = is('cases');
const A_LENS1 = is('lens1');
const A_ROWS = is('rows');
const A_SWAP = is('swap');
const A_MILL = is('mill');
const A_EQUAL = is('equal');
const A_KANT = is('kant');
const A_KEEP = is('keep');
const A_STEPS = is('steps');
const A_CLIMB = is('climb');
const LENS = BEATS.map((b) => b.lens ?? 0);
const ROWS = BEATS.map((b) => b.rows ?? 0);
const MIXED = BEATS.map((b) => (b.mixed ? 1 : 0));
const METERS = BEATS.map((b) => (b.meters ? 1 : 0));
const EQUAL = BEATS.map((b) => (b.equal ? 1 : 0));
const RULE_ON = BEATS.map((b) => (b.rule ? 1 : 0));
const STRUCK = BEATS.map((b) => (b.struck ? 1 : 0));
const CLIMBED = BEATS.map((b) => b.climbed ?? 0);
const THOUGHTS = BEATS.map((b) => (b.thoughts ? 1 : 0));
const SIGNS = BEATS.map((b) => (b.signs ? 1 : 0));
/** He faces the café — and the A-board in front of it — everywhere but on the walk out to the steps. */
const DIR = BEATS.map((b) => (b.act === 'steps' ? -1 : 1));
/** Which way each beat leaves him: at the steps he turns back to look up at HONESTY. */
const END_DIR = BEATS.map(() => 1);
/** The chalked rows: where row k's first letter is, and its middle. */
function ROW_Y(k: number): number {
  'worklet';
  return BOARD.y + 5 + 15 * k + 7;
}
const ROW_X0 = BOARD.x + 6;
const ROW_W = 60;
/** The happiness gauges, hung from the awning over each of them, and THE RULE's sign. */
const AWNING_FOOT = AWNING.y + 20.5;
const METER_HIS = 300;
const METER_HERS = 346;
const METER_TOP = 360;
const RULE_X = 262;
const RULE_W = 134;
const RULE_TOP = 357;
/** Where each beat leaves him, and at what height: on the top step after the climb. */
const END_X = BEATS.map((b) => (b.act === 'climb' ? CLIMB_X[3] : b.x ?? 150));
const END_GY = BEATS.map((b) => ((b.climbed ?? 0) >= 3 ? STEPS[2].top : GROUND));
/** One stair's rise, in the rig's own units at his scale. */
const RISE = 12 / (K_FIG * 0.82);
/** The found wallet: on the pavement, in his hand, then hers. 0 ground · 1 his · 2 hers. */
const HOLDS = BEATS.map((_, k) => (k === 0 ? 0 : k < 5 ? 1 : 2));

const ROW_TEXT = ['1 OUTCOMES', '2 DUTY', '3 CHARACTER'];
/** Each pair's rim, and its case's lid: outcomes · duty · character. */
const LENS_TONES = [INK, EMBER, TEAL, OLIVE];

const THOUGHT_Q = [
  { id: 'happy', l1: 'WHICH ACT MAKES', l2: 'MOST HAPPINESS?', x: 150, correct: true },
  { id: 'rule', l1: 'COULD EVERYONE', l2: 'FOLLOW THE RULE?', x: 250, correct: false },
  { id: 'self', l1: 'WHAT WILL IT', l2: 'MAKE OF ME?', x: 350, correct: false },
];
const SIGN_Q = [
  { id: 'common', l1: 'IT’S COMMON,', l2: 'SO IT’S RIGHT', x: 150, correct: false },
  { id: 'legal', l1: 'IT’S LEGAL,', l2: 'SO IT’S RIGHT', x: 250, correct: false },
  { id: 'neither', l1: 'NEITHER', l2: 'SHOWS IT', x: 350, correct: true },
];
const PLATE_W = 94;

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
/**
 * One stair, climbed the way a person climbs one: the lead foot lifts and lands on
 * the tread above, the weight rises onto it, and only then does the back foot leave
 * the tread below. Everything is in the rig's units against the LOWER tread, so at
 * u = 1 both feet stand at -RISE with the pelvis RISE higher — which is exactly
 * standing on the upper tread, and the next stair starts from there without a seam.
 * The legs take turns: the right leads on the first and third stair.
 */
function climbStair(base: Stance, k: number, u: number, x0: number, x1: number, dir: number): { s: Stance; x: number } {
  'worklet';
  const e1 = ease01(clamp01(u / 0.42));
  const ex = ease01(clamp01((u - 0.22) / 0.56));
  const eb = ease01(clamp01((u - 0.3) / 0.45));
  const e2 = ease01(clamp01((u - 0.62) / 0.38));
  const x = lerp(x0, x1, ex);
  const k1 = K_FIG * 0.82;
  const f = dir < 0 ? -1 : 1;
  const lead = { x: ((lerp(x0 + 3 * f, x1 + 3 * f, e1) - x) * f) / k1, y: -RISE * e1 - 9 * Math.sin(Math.PI * e1) };
  const trail = { x: ((lerp(x0 - 3 * f, x1 - 3 * f, e2) - x) * f) / k1, y: -RISE * e2 - 9 * Math.sin(Math.PI * e2) };
  const lean = Math.sin(Math.PI * u);
  const s = {
    ...base,
    tilt: base.tilt - 0.14 * lean,
    bob: base.bob + RISE * eb,
    footR: k % 2 === 0 ? lead : trail,
    footL: k % 2 === 0 ? trail : lead,
    // the arms swing against the legs
    fistR: { x: base.fistR.x + (k % 2 === 0 ? -6 : 6) * lean, y: base.fistR.y },
    fistL: { x: base.fistL.x + (k % 2 === 0 ? 6 : -6) * lean, y: base.fistL.y },
  };
  return { s, x };
}
function handOn(s: Stance, x: number, gy: number, dir: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: gy, k: K_E, dir }, 1, tx, ty, w);
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics'));

export default function Ethics2Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const held = useHeld();
  const heldHer = useHeld();
  const cv = useCarry(27);
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

    // ── where he is ────────────────────────────────────────────────────────
    const xn = X[n];
    const xp = END_X[p];
    const gp = END_GY[p];
    const walking = Math.abs(xn - xp) > 1 && !A_FIND[n] && !A_CLIMB[n];
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    let tx = xn;
    let gy = GROUND;
    let walkNow = walking;
    if (A_FIND[n]) {
      // strolling in along the pavement until he sees it
      tx = lerp(30, xn, st(0, 0.4));
      walkNow = b / L < 0.4;
    }
    // b11: across to the foot of the steps, a turn, then up them one at a time,
    // each step a stride of its own. Timed from the walk, so he is facing up the
    // steps — and the café — as soon as he gets there.
    const footDur = Math.abs(xp - CLIMB_X[0]) > 1 ? moveTr(xp, CLIMB_X[0], TR) : 0;
    const footU = A_CLIMB[n] ? ease01(clamp01(b / footDur)) : 1;
    const c0 = (footDur + 0.55) / L;
    const climbEnd = (c0 + 0.44) * L;
    const ks = A_CLIMB[n] ? [st(c0, c0 + 0.12), st(c0 + 0.16, c0 + 0.28), st(c0 + 0.32, c0 + 0.44)] : [0, 0, 0];
    let climbSeg = -1;
    let done = 0;
    if (A_CLIMB[n]) {
      for (let k = 0; k < 3; k++) {
        if (ks[k] >= 1) done = k + 1;
        else if (ks[k] > 0) climbSeg = k;
      }
      tx = footU < 1 ? lerp(xp, CLIMB_X[0], footU) : CLIMB_X[done];
      // he stands on the tread below the stair he is climbing; the pose does the rise
      gy = GROUND - 12 * done;
    } else if (END_GY[n] < GROUND) {
      // after the climb he stays up on the top step
      gy = END_GY[n];
    }
    const climbing = climbSeg >= 0
      ? climbStair(hLive(P[n], t, b), climbSeg, ks[climbSeg], CLIMB_X[climbSeg], CLIMB_X[climbSeg + 1], -1)
      : null;
    if (climbing) tx = climbing.x;
    // the first beat is not blended from anywhere: he enters from where the beat puts him
    const x = n === 0 ? tx : carry(cv, 0, n, xp, tx, walking ? walkU : A_CLIMB[n] ? 1 : tr);
    const figGY = n === 0 ? gy : carry(cv, 1, n, gp, gy, A_CLIMB[n] ? 1 : tr);
    // walking away from the café he faces the way he goes, and turns back the moment he stops
    const back = A_STEPS[n] ? clamp01((b - walkDur - 1.5) / 0.35) : A_CLIMB[n] ? clamp01((b - climbEnd - 0.1) / 0.35) : 0;
    const dirV = A_STEPS[n] || A_CLIMB[n] ? lerp(facing(END_DIR[p], -1, b), 1, back) : facing(END_DIR[p], DIR[n], b);
    const dir = (dirV < 0 ? -1 : 1) as 1 | -1;

    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    if (A_FIND[n] && walkNow) s = travelStance(30, xn, stand(t), stand(t), stand(t), st(0, 0.4), WALK, 0);
    if (A_CLIMB[n] && footU < 1) s = travelStance(xp, CLIMB_X[0], hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), footU, WALK, 0);
    if (climbing) {
      s = climbing.s;
      // a hand on the rail, a little ahead of him, all the way up
      const hx = climbing.x - 5;
      s = handOn(s, climbing.x, figGY, -1, hx, railY(hx), 1);
    }

    // bending to the wallet and picking it up
    const bend = A_FIND[n] ? bump(b, L, 0.45, 0.65, 0.9) : 0;
    s = {
      ...s,
      tilt: s.tilt - 0.45 * bend,
      bob: s.bob - 15 * bend,
      footR: { x: s.footR.x + 6 * bend, y: s.footR.y },
      footL: { x: s.footL.x - 4 * bend, y: s.footL.y },
    };
    s = handOn(s, x, figGY, dir, WALLET.x, WALLET.y - 4, bend);
    // opening the cases: his hand lifts the lids of the two nearest him, one after the other
    if (A_CASES[n]) {
      s = { ...s, neck: s.neck - 0.25 * st(0.1, 0.4) };
      s = handOn(s, x, figGY, dir, CASES[0] - 6, TABLE.top - 9 - 5 * st(0.1, 0.3), bump(b, L, 0.04, 0.12, 0.34));
      s = handOn(s, x, figGY, dir, CASES[1] - 7, TABLE.top - 9 - 5 * st(0.35, 0.55), bump(b, L, 0.29, 0.37, 0.6));
    }
    // CHALKING the A-board (b2, b3): he leans in and looks down at it, and his left
    // hand (the right still has the wallet in it) rides the chalk's leading edge as each row is written — as far along as his arm
    // reaches from where he stands, and there it keeps writing.
    const chalkK = A_LENS1[n] ? 0 : A_ROWS[n] ? (b / L < 0.47 ? 1 : 2) : -1;
    const chalkF = A_LENS1[n] ? st(0.32, 0.6) : A_ROWS[n] ? (chalkK === 1 ? st(0.05, 0.4) : st(0.5, 0.85)) : 0;
    const writing = A_LENS1[n] ? bump(b, L, 0.28, 0.33, 0.64)
      : A_ROWS[n] ? bump(b, L, 0, 0.05, 0.45) + bump(b, L, 0.44, 0.5, 0.91) : 0;
    if (writing > 0) {
      const ty = ROW_Y(chalkK < 0 ? 0 : chalkK) + 1.2 * Math.sin(t * 17);
      const tx2 = ROW_X0 + ROW_W * chalkF;
      s = { ...s, tilt: s.tilt - 0.32 * writing, neck: s.neck + 0.14 * writing };
      const pelY = figGY - (34 + s.bob) * K_E;
      s = mixStance(s, { ...s, fistL: { x: (tx2 - x) / (K_E * dir), y: (ty - pelY) / K_E } }, writing);
    }
    // while he works the A-board the found wallet is held back at his hip, so it is never
    // in front of the rows he is writing (it covered the "3" of 3 CHARACTER)
    const tuck = HOLDS[n] === 1 ? clamp01(1 - Math.abs(x - (BOARD.x - 10)) / 24) : 0;
    s = mixStance(s, { ...s, fistR: { x: -6, y: -38 } }, tuck);
    // putting on glasses: a hand to the face
    const don =(A_LENS1[n] ? bump(b, L, 0.66, 0.76, 0.9) : 0) + (A_KANT[n] ? bump(b, L, 0.05, 0.15, 0.3) : 0);
    const swapHand = A_SWAP[n] ? st(0.1, 0.2) * (1 - st(0.82, 0.92)) : 0;
    s = mixStance(s, { ...s, fistR: { x: 8, y: -74 } }, clamp01(don + swapHand * (0.6 + 0.4 * Math.sin(t * 8))));
    // handing the wallet across
    const hand = A_MILL[n] ? bump(b, L, 0.35, 0.55, 0.8) : 0;
    s = handOn(s, x, figGY, dir, x + 34, figGY - 42, hand);
    // patting his pockets when his own wallet is gone, then the start
    const pat = A_KEEP[n] ? bump(b, L, 0.6, 0.66, 0.76) : 0;
    s = mixStance(s, { ...s, fistR: { x: 4, y: -30 }, fistL: { x: -6, y: -30 } }, pat);
    s = mixStance(s, emoteAnyLive(318, t, Math.max(0, b - 0.74 * L)), A_KEEP[n] ? st(0.74, 0.8) * (1 - st(0.95, 1)) : 0);
    // looking up at HONESTY
    if (A_STEPS[n]) s = { ...s, neck: s.neck + 0.3 * clamp01((b - walkDur - 0.1) / 0.5) * (1 - clamp01((b - walkDur - 1.4) / 0.4)) };

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── her, at the café table ────────────────────────────────────────────
    const r0 = seated(SEAT_H, t);
    const nod = Math.max(0, Math.sin(t * 1.9 + 0.8)) ** 2;
    const shift = Math.sin(t * 0.7 + 1.3);
    let h: Stance = {
      ...r0,
      tilt: r0.tilt + 0.05 * shift,
      neck: r0.neck - 0.24 * nod,
      fistL: { x: r0.fistL.x - 2.5 * shift, y: r0.fistL.y + 2 * shift },
      fistR: { x: r0.fistR.x + 2 * shift, y: r0.fistR.y - 2 * shift },
    };
    if (A_CASES[n]) h = handOn(h, CHAIR.x, GROUND, -1, CASES[2] + 6, TABLE.top - 9 - 5 * st(0.6, 0.8), bump(b, L, 0.54, 0.62, 0.86));
    const take = A_MILL[n] ? bump(b, L, 0.45, 0.6, 0.85) : 0;
    const stoop = A_KEEP[n] ? bump(b, L, 0.3, 0.45, 0.62) : 0;
    h = handOn(h, CHAIR.x, GROUND, -1, CHAIR.x - 28, GROUND - 40, take);
    h = { ...h, tilt: h.tilt - 0.9 * stoop };
    h = handOn(h, CHAIR.x, GROUND, -1, OWN_AT.x, OWN_AT.y - 3, stoop);
    const her = keepHeld(heldHer, mixStance(carryFrom(heldHer, n, seated(SEAT_H, t)), h, tr));

    // ── the wallets ────────────────────────────────────────────────────────
    const pickUp = A_FIND[n] ? st(0.62, 0.72) : 1;
    const toHer = A_MILL[n] ? st(0.5, 0.6) : HOLDS[n] === 2 ? 1 : 0;
    const drop = A_KEEP[n] ? st(0.16, 0.3) : 0;
    const kept = A_KEEP[n] ? st(0.42, 0.5) : 0;

    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // At what is happening on the pavement, when it happens — keyed on the same
    // stages (fractions of the voiced line L) and seconds the scene already acts on —
    // and at nothing (weight 0, his pose's own head) once it is done.
    // Since the restaging the A-board is in front of him while he works it (facing
    // left, b2–b4) and THE RULE hangs in front of him at the café (b8–b9).
    const herY = GROUND - 65;                   // her head, seated: (seat 30 + head 49) × K_E
    const meterY = METER_TOP + 14;              // the happiness gauges, hung from the awning
    const rowX = BOARD.x + 40;                  // the chalked rows; row k at ROW_Y(k)
    const ruleX = RULE_X + RULE_W / 2;          // THE RULE, hung on its chains
    const ruleY = RULE_TOP + 12;
    const honX = DOOR.x + DOOR.w / 2;           // HONESTY over the door
    const honY = 364;                           //   styles.plaque top 356 + half its 16
    const plateY = 313;                         // the question plates: styles.plate top 298 + half its 30
    const LK = A_FIND[n] ? [L * 0.2, WALLET.x, WALLET.y, 1, L * 0.72, x + 12 * dir, figGY - 44, 0.9, L + 0.6, 0, 0, 0]
      : A_CASES[n] ? [L * 0.1, CASES[0], TABLE.top - 6, 1, L * 0.35, CASES[1], TABLE.top - 6, 1, L * 0.6, CASES[2], TABLE.top - 6, 1, L + 0.6, 0, 0, 0]
      : A_LENS1[n] ? [0.2, 0, 0, 0, L * 0.3, ROW_X0 + ROW_W * chalkF, ROW_Y(0), 1, L * 0.64, 0, 0, 0, L * 0.9, rowX, ROW_Y(0), 0.8, L + 0.5, 0, 0, 0]
      : A_ROWS[n] ? [L * 0.05, ROW_X0 + ROW_W * chalkF, ROW_Y(chalkK), 1, L + 0.5, 0, 0, 0]
      : A_SWAP[n] ? [0.2, 0, 0, 0, L * 0.4, BOARD.x + BOARD.w - 22, BOARD.y - 10, 1, L * 0.72, rowX, ROW_Y(1), 0.8, L + 0.5, 0, 0, 0]
      : A_MILL[n] ? [0.2, CHAIR.x - 2, herY, 0.9, L * 0.35, x + 34, figGY - 42, 1, L * 0.6, METER_HERS, meterY, 1, L * 0.85, CHAIR.x - 2, herY, 0.8, L + 0.5, 0, 0, 0]
      : A_EQUAL[n] ? [L * 0.2, METER_HERS, meterY, 1, L * 0.45, METER_HIS, meterY, 0.8, L * 0.72, CHAIR.x - 2, herY, 0.8, L + 0.5, 0, 0, 0]
      : A_KANT[n] ? [0.2, 0, 0, 0, L * 0.35, ruleX, ruleY, 1, L + 0.5, 0, 0, 0]
      : A_KEEP[n] ? [L * 0.14, lerp(x + 10, OWN_AT.x, st(0.16, 0.3)), lerp(figGY - 40, OWN_AT.y, st(0.16, 0.3)), 1, L * 0.32, OWN_AT.x, OWN_AT.y - 6, 1, L * 0.5, CHAIR.x - 2, herY, 0.9, L * 0.6, x + 4 * dir, figGY - 30, 0.9, L * 0.76, CHAIR.x - 2, herY, 1, L * 0.84, ruleX, ruleY + 3, 1, L + 0.5, 0, 0, 0]
      : A_STEPS[n] ? [0.2, 0, 0, 0, walkDur + 0.1, honX, honY, 1, walkDur + 1.5, 0, 0, 0]
      : A_CLIMB[n] ? [c0 * L - 0.2, x - 16, figGY - 4, 0.9, climbEnd - 0.6, honX, honY, 1, climbEnd + 0.1, 0, 0, 0]
      : THOUGHTS[n] ? [0.3, THOUGHT_Q[1].x, plateY, 0.7]
      : SIGNS[n] ? [0.3, SIGN_Q[1].x, plateY, 0.7]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    return {
      fig: lookPose(fig, x, figGY, K_E, dirV, 1, carry(cv, 24, n, lk.x, lk.x, tr), carry(cv, 25, n, lk.y, lk.y, tr), carry(cv, 26, n, 0, lk.w, tr)),
      her: pose(her, CHAIR.x, GROUND - SEAT_H * 0, K_E, -1, 1),
      x, figGY,
      pickUp: carry(cv, 2, n, HOLDS[p] > 0 ? 1 : 0, pickUp, tr),
      toHer: carry(cv, 3, n, HOLDS[p] === 2 ? 1 : 0, toHer, tr),
      drop: carry(cv, 4, n, 0, drop * (1 - kept), tr),
      kept: carry(cv, 5, n, 0, A_KEEP[n] ? kept * (1 - st(0.55, 0.62)) : 0, tr),
      ownOn: carry(cv, 6, n, 0, A_KEEP[n] ? st(0.14, 0.16) * (1 - st(0.58, 0.62)) : 0, tr),
      query: carry(cv, 7, n, 0, A_FIND[n] ? bump(b, L, 0.3, 0.45, 0.8) : 0, tr),
      cases: carry(cv, 8, n, A_CASES[p] || n > 1 ? 3 : 0, A_CASES[n] ? st(0.1, 0.3) + st(0.35, 0.55) + st(0.6, 0.8) : n > 1 ? 3 : 0, tr),
      chalk: writing,
      lens: carry(cv, 9, n, LENS[p],
        A_SWAP[n] ? 1 + 2 * (0.5 - 0.5 * Math.cos(Math.PI * 2 * st(0.15, 0.85))) : LENS[n], tr),
      specs: carry(cv, 10, n, LENS[p] > 0 ? 1 : 0, A_LENS1[n] ? st(0.74, 0.82) : LENS[n] > 0 ? 1 : 0, tr),
      rows: carry(cv, 11, n, ROWS[p], A_LENS1[n] ? st(0.32, 0.6) : A_ROWS[n] ? 1 + st(0.05, 0.4) + st(0.5, 0.85) : ROWS[n], tr),
      mixed: carry(cv, 12, n, MIXED[p], A_SWAP[n] ? st(0.4, 0.7) : MIXED[n], tr),
      meters: carry(cv, 13, n, METERS[p], A_MILL[n] ? st(0.05, 0.25) : METERS[n], tr),
      joy: carry(cv, 14, n, METERS[p], A_MILL[n] ? st(0.55, 0.9) : METERS[n], tr),
      equal: carry(cv, 15, n, EQUAL[p], A_EQUAL[n] ? st(0.2, 0.5) : EQUAL[n], tr),
      rule: carry(cv, 16, n, RULE_ON[p], A_KANT[n] ? st(0.35, 0.6) : RULE_ON[n], tr),
      struck: carry(cv, 17, n, STRUCK[p], A_KEEP[n] ? st(0.84, 0.96) : STRUCK[n], tr),
      steps: [
        carry(cv, 18, n, CLIMBED[p] >= 1 ? 1 : 0, A_CLIMB[n] ? clamp01((ks[0] - 0.7) / 0.3) : CLIMBED[n] >= 1 ? 1 : 0, tr),
        carry(cv, 19, n, CLIMBED[p] >= 2 ? 1 : 0, A_CLIMB[n] ? clamp01((ks[1] - 0.7) / 0.3) : CLIMBED[n] >= 2 ? 1 : 0, tr),
        carry(cv, 20, n, CLIMBED[p] >= 3 ? 1 : 0, A_CLIMB[n] ? clamp01((ks[2] - 0.7) / 0.3) : CLIMBED[n] >= 3 ? 1 : 0, tr),
      ],
      honesty: carry(cv, 21, n, CLIMBED[p] >= 3 ? 1 : 0, A_STEPS[n] ? clamp01((b - walkDur) / 0.6) * 0.4 : A_CLIMB[n] ? 0.4 + 0.6 * clamp01((ks[2] - 0.8) / 0.2) : CLIMBED[n] >= 3 ? 1 : 0, tr),
      thoughts: carry(cv, 22, n, THOUGHTS[p], THOUGHTS[n], tr),
      signs: carry(cv, 23, n, SIGNS[p], SIGNS[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.her);
  // his glasses, on his head
  // the glasses ride his head and turn with him: a lens at the front of the face,
  // standing proud of it so it reads against the ink, and the arm back to the ear
  const specs = useAnimatedStyle(() => {
    const h = DF.value.head;
    return {
      opacity: SCENE.value.specs,
      transform: [{ translateX: h[0].translateX }, { translateY: h[1].translateY }, { scaleX: DF.value.dir < 0 ? -1 : 1 }],
    };
  });
  const lensTint = useAnimatedStyle(() => {
    const l = SCENE.value.lens;
    return { borderColor: l < 1.5 ? LENS_TONES[1] : l < 2.5 ? LENS_TONES[2] : LENS_TONES[3] };
  });
  const armTint = useAnimatedStyle(() => {
    const l = SCENE.value.lens;
    return { backgroundColor: l < 1.5 ? LENS_TONES[1] : l < 2.5 ? LENS_TONES[2] : LENS_TONES[3] };
  });
  // a stick of chalk in his hand while he writes on the A-board
  const chalkStick = useAnimatedStyle(() => {
    const w = DF.value.wrL;
    return { opacity: SCENE.value.chalk > 0.05 ? 1 : 0, transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }, { rotate: '-30deg' }] };
  });
  // the found wallet, on the pavement, in his hand, then hers
  const found = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const hw = DH.value.wrR;
    const u = SCENE.value.pickUp;
    const v = SCENE.value.toHer;
    const hx = lerp(lerp(WALLET.x, w[0].translateX, u), hw[0].translateX, v);
    const hy = lerp(lerp(WALLET.y, w[1].translateY, u), hw[1].translateY, v);
    return { transform: [{ translateX: hx }, { translateY: hy }] };
  });
  // his own wallet: out of his pocket, onto the pavement, into her hand
  const own = useAnimatedStyle(() => {
    const hw = DH.value.wrR;
    const fx = SCENE.value.x + 10;
    const fy = SCENE.value.figGY - 40;
    const d = SCENE.value.drop;
    const k = SCENE.value.kept;
    const gx = lerp(fx, OWN_AT.x, d);
    const gy = lerp(fy, OWN_AT.y, d) - 14 * Math.sin(Math.PI * d);
    return {
      opacity: SCENE.value.ownOn,
      transform: [{ translateX: lerp(gx, hw[0].translateX, k) }, { translateY: lerp(gy, hw[1].translateY, k) }],
    };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.street} pointerEvents="none" />
      <ObjectArt parts={SHOP_ART} tone={BRICK} />
      <Honesty S={SCENE} />
      <ObjectArt parts={STEPS_ART} tone={BRICK} />
      <StepGlow S={SCENE} />
      <ObjectArt parts={CAFE_ART} tone={CANVAS} />
      <Cases S={SCENE} />
      <ObjectArt parts={BOARD_ART} tone={WOOD} />
      <Board S={SCENE} on={on} />
      <Rule S={SCENE} on={on} />
      <Query S={SCENE} on={on} />
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DH} k={K_E} role="second" />
      <Stickman D={DF} k={K_E} />
      <Animated.View style={[styles.rider, specs]} pointerEvents="none">
        <Animated.View style={[styles.specArm, armTint]} />
        <Animated.View style={[styles.lens, lensTint]}>
          <View style={styles.glint} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.rider, chalkStick]} pointerEvents="none">
        <View style={styles.chalkNub} />
      </Animated.View>
      <Animated.View style={[styles.rider, found]} pointerEvents="none">
        <Wallet />
      </Animated.View>
      <Animated.View style={[styles.rider, own]} pointerEvents="none">
        <Wallet own />
      </Animated.View>
      <Meters S={SCENE} on={on} />
      {on(THOUGHTS) ? <Plates items={THOUGHT_Q} kind="thought" picked={picked} onPick={onPick} S={SCENE} live={THOUGHTS[i] === 1} /> : null}
      {on(SIGNS) ? <Plates items={SIGN_Q} kind="sign" picked={picked} onPick={onPick} S={SCENE} live={SIGNS[i] === 1} /> : null}
    </View>
  );
}

const SHOP_ART = shop();
const STEPS_ART = steps();
const CAFE_ART = cafe();
const BOARD_ART = aBoard();

// ── the shop: HONESTY over the door, and the steps lit as he stands on them ─

function Honesty({ S }: { S: SharedValue<any> }) {
  const glow = useAnimatedStyle(() => ({ opacity: 0.25 + 0.75 * S.value.honesty }));
  return (
    <View style={styles.plaque} pointerEvents="none">
      <Animated.View style={[styles.plaqueGlow, glow]} />
      <Text style={styles.plaqueText} numberOfLines={1}>HONESTY</Text>
    </View>
  );
}
function StepGlow({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {STEPS.map((s, k) => <StepLight key={k} S={S} k={k} x0={s.x0} x1={s.x1} top={s.top} />)}
    </>
  );
}
function StepLight({ S, k, x0, x1, top }: { S: SharedValue<any>; k: number; x0: number; x1: number; top: number }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.steps[k], transform: [{ scaleX: S.value.steps[k] }] }));
  return <Animated.View style={[styles.stepLight, { left: x0 + 2, width: x1 - x0 - 4, top: top - 1 }, st]} pointerEvents="none" />;
}

// ── the café table's three glasses cases ────────────────────────────────────

function Cases({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {[0, 1, 2].map((k) => <Case key={k} S={S} k={k} />)}
    </>
  );
}
/**
 * A clamshell glasses case, drawn against a photograph of one open (Wikimedia
 * Commons, "Okulary korekcyjne w etui"): a rounded shell in its lens's colour, a
 * pale lining, and the pair of glasses lying in it once the lid is lifted — the lid
 * hinged at the back, swinging up and over. They were 12×7 boxes with a coloured lid.
 */
function Case({ S, k }: { S: SharedValue<any>; k: number }) {
  const lid = useAnimatedStyle(() => ({ transform: [{ rotate: `${-105 * clamp01(S.value.cases - k)}deg` }] }));
  const inside = useAnimatedStyle(() => ({ opacity: clamp01((S.value.cases - k) * 2.5) }));
  const tone = LENS_TONES[k + 1];
  return (
    <View style={[styles.case, { left: CASES[k] - CASE_W / 2 }]} pointerEvents="none">
      <View style={[styles.caseShell, { backgroundColor: tone }]} />
      <Animated.View style={[styles.caseLining, inside]}>
        <View style={[styles.specRing, { left: 2 }]} />
        <View style={styles.specBridge} />
        <View style={[styles.specRing, { left: 8.5 }]} />
      </Animated.View>
      <Animated.View style={[styles.caseLid, { backgroundColor: tone }, lid]} />
    </View>
  );
}

/** A short chain of links, hanging from the awning's foot: what the sign and the gauges hang by. */
function Chain({ x, top, len }: { x: number; top: number; len: number }) {
  const n = Math.max(2, Math.round(len / 3.2));
  const step = len / n;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => (
        <View key={k} style={[styles.chainLink, { left: x - 1.5, top: top + k * step, height: step + 0.9 }]} />
      ))}
    </>
  );
}

/** A leather bifold wallet, closed: the fold down one end, a stitched edge, and a note's corner showing over the top. */
function Wallet({ own }: { own?: boolean }) {
  return (
    <>
      <View style={styles.walletNote} />
      <View style={[styles.wallet, own && styles.ownWallet]}>
        <View style={styles.walletFold} />
        <View style={styles.walletStitch} />
      </View>
    </>
  );
}

// ── the A-board ─────────────────────────────────────────────────────────────

function Board({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const bracket = useAnimatedStyle(() => ({ opacity: S.value.mixed, height: 44 * S.value.mixed }));
  const mixTag = useAnimatedStyle(() => ({ opacity: S.value.mixed }));
  return (
    <>
    <View style={styles.board} pointerEvents="none">
      {ROW_TEXT.map((r, k) => <Row key={r} S={S} k={k} text={r} />)}
      <Animated.View style={[styles.bracket, bracket]} />
    </View>
    {on(MIXED) ? (
      <Animated.View style={[styles.mixTag, mixTag]} pointerEvents="none">
        <Text style={styles.mixText} numberOfLines={1}>MIXED</Text>
      </Animated.View>
    ) : null}
    </>
  );
}
function Row({ S, k, text }: { S: SharedValue<any>; k: number; text: string }) {
  const st = useAnimatedStyle(() => ({ width: 68 * clamp01(S.value.rows - k) }));
  return (
    <Animated.View style={[styles.rowClip, { top: 5 + k * 15 }, st]}>
      <Text style={styles.chalk} numberOfLines={1}>{text}</Text>
    </Animated.View>
  );
}

// ── the rule, and the question over the wallet ──────────────────────────────

function Rule({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  // let down on its chains from the awning: it drops the last few units into place
  const st = useAnimatedStyle(() => ({ opacity: S.value.rule, transform: [{ translateY: (1 - S.value.rule) * -8 }] }));
  const strike = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.struck }, { rotate: '-8deg' }] }));
  if (!on(RULE_ON)) return null;
  return (
    <Animated.View style={[styles.rule, st]} pointerEvents="none">
      <Chain x={14} top={AWNING_FOOT - RULE_TOP - 1.5} len={RULE_TOP - AWNING_FOOT + 1.5} />
      <Chain x={RULE_W - 14} top={AWNING_FOOT - RULE_TOP - 1.5} len={RULE_TOP - AWNING_FOOT + 1.5} />
      <Text style={styles.ruleHead} numberOfLines={1}>THE RULE</Text>
      <Text style={styles.ruleText} numberOfLines={1}>KEEP ANY WALLET YOU FIND</Text>
      <Animated.View nativeID="strike-rule" style={[styles.ruleStrike, strike]} />
    </Animated.View>
  );
}
function Query({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.query, transform: [{ scale: 0.6 + 0.4 * S.value.query }] }));
  if (!on(A_FIND)) return null;
  return (
    <Animated.View style={[styles.query, st]} pointerEvents="none">
      <Text style={styles.queryText}>?</Text>
    </Animated.View>
  );
}

// ── the happiness meters over the two of them ───────────────────────────────

/**
 * The happiness gauges: a glass tube in a frame, each HUNG on a cord from the
 * awning over the person it measures, let down when Mill's lens goes on. They used
 * to float over the two heads with nothing holding them.
 */
function Meters({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const drop = useAnimatedStyle(() => ({ opacity: S.value.meters, transform: [{ translateY: (1 - S.value.meters) * -14 }] }));
  const fillHis = useAnimatedStyle(() => ({ height: 26 * lerp(0.35, 0.6, S.value.joy) }));
  const fillHers = useAnimatedStyle(() => ({ height: 26 * lerp(0.2, 0.95, S.value.joy) }));
  const eq = useAnimatedStyle(() => ({ opacity: S.value.equal }));
  if (!on(METERS)) return null;
  return (
    <>
      {[METER_HIS, METER_HERS].map((mx, k) => (
        <Animated.View key={mx} style={[styles.gauge, { left: mx - 5 }, drop]} pointerEvents="none">
          <Chain x={5} top={AWNING_FOOT - METER_TOP - 1} len={METER_TOP - AWNING_FOOT + 1} />
          <View style={styles.meter}><Animated.View style={[styles.meterFill, k === 0 ? fillHis : fillHers]} /></View>
          <View style={styles.meterBulb} />
          {on(EQUAL) ? <Animated.View style={[styles.weight, k === 0 ? styles.weightL : null, eq]}><Text style={styles.weightText}>×1</Text></Animated.View> : null}
        </Animated.View>
      ))}
    </>
  );
}

// ── the two questions: thoughts through the glasses, then street signs ──────

function Plates({ items, kind, picked, onPick, S, live }: {
  items: { id: string; l1: string; l2: string; x: number; correct: boolean }[];
  kind: 'thought' | 'sign'; picked: string | null; onPick: (id: string, ok: boolean) => void;
  S: SharedValue<any>; live: boolean;
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: kind === 'thought' ? S.value.thoughts : S.value.signs }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {items.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={kind === 'thought' ? 12 : 4}
          disabled={answered} sealAt="tr"
          style={[styles.plate, { left: q.x - PLATE_W / 2 }]}
        >
          <View style={[kind === 'thought' ? styles.thoughtFace : styles.signFace, answered && q.correct && styles.faceRight]}>
            <Text style={[kind === 'thought' ? styles.plateText : styles.signText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l1}</Text>
            <Text style={[kind === 'thought' ? styles.plateText : styles.signText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l2}</Text>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  street: {
    position: 'absolute', left: 0, top: 292, width: STAGE_W, height: GROUND - 292, backgroundColor: CANVAS.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },
  rider: { position: 'absolute', left: 0, top: 0 },
  lens: {
    position: 'absolute', left: 9, top: -8, width: 12, height: 11, borderRadius: 6, borderWidth: 2.2,
    backgroundColor: PAPER_LIT,
  },
  glint: { position: 'absolute', left: 2, top: 1.5, width: 3, height: 3, borderRadius: 1.5, backgroundColor: SAGE },
  specArm: { position: 'absolute', left: -10, top: -4, width: 21, height: 2.2, borderRadius: 1.1 },
  walletNote: {
    position: 'absolute', left: -4.5, top: -8, width: 9, height: 4.5, borderRadius: 0.8,
    backgroundColor: SAGE, borderWidth: 0.8, borderColor: INK, transform: [{ rotate: '-6deg' }],
  },
  wallet: {
    position: 'absolute', left: -8, top: -5, width: 16, height: 10, borderRadius: 2.4,
    borderWidth: 1.2, borderColor: INK, backgroundColor: OLIVE, overflow: 'hidden',
  },
  ownWallet: { backgroundColor: TEAL },
  walletFold: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3.2, backgroundColor: DEEP },
  walletStitch: {
    position: 'absolute', left: 5, top: 1.6, right: 1.6, bottom: 1.6, borderRadius: 1.1,
    borderWidth: 0.6, borderColor: PAPER_LIT, borderStyle: 'dashed',
  },
  chalkNub: {
    position: 'absolute', left: -1.2, top: -5, width: 2.4, height: 6, borderRadius: 1, backgroundColor: PAPER_LIT,
    borderWidth: 0.6, borderColor: INK,
  },

  plaque: {
    position: 'absolute', left: DOOR.x - 2, top: 356, width: DOOR.w + 4, height: 16, borderRadius: 3,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  plaqueGlow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: SAGE },
  plaqueText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  stepLight: { position: 'absolute', height: 3, borderRadius: 1.5, backgroundColor: EMBER, transformOrigin: '0% 50%' },

  case: { position: 'absolute', top: TABLE.top - 7, width: CASE_W, height: 7 },
  caseShell: {
    position: 'absolute', left: 0, top: 1, width: CASE_W, height: 6, borderRadius: 3,
    borderWidth: 1.1, borderColor: INK,
  },
  caseLining: {
    position: 'absolute', left: 2, top: -1.5, width: CASE_W - 4, height: 3.5, borderRadius: 1.5,
    backgroundColor: PAPER_LIT, borderWidth: 0.8, borderColor: INK,
  },
  specRing: { position: 'absolute', top: -1.5, width: 5.5, height: 4, borderRadius: 2, borderWidth: 1, borderColor: INK },
  specBridge: { position: 'absolute', left: 7, top: -0.6, width: 2, height: 1, backgroundColor: INK },
  caseLid: {
    position: 'absolute', left: 0, top: -2, width: CASE_W, height: 4, borderTopLeftRadius: 3, borderTopRightRadius: 3,
    borderBottomLeftRadius: 1, borderBottomRightRadius: 1, borderWidth: 1.1, borderColor: INK, transformOrigin: '100% 100%',
  },

  board: {
    position: 'absolute', left: BOARD.x, top: BOARD.y, width: BOARD.w, height: BOARD.h, borderRadius: 4,
    backgroundColor: DEEP, borderWidth: 2, borderColor: INK, overflow: 'hidden',
  },
  rowClip: { position: 'absolute', left: 6, height: 13, overflow: 'hidden' },
  chalk: {
    width: 68, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 12, letterSpacing: 0, color: PAPER_LIT, includeFontPadding: false,
  },
  bracket: {
    position: 'absolute', right: 3, top: 6, width: 4, borderWidth: 1.5, borderLeftWidth: 0, borderColor: EMBER,
    borderTopRightRadius: 3, borderBottomRightRadius: 3,
  },
  mixTag: {
    position: 'absolute', left: BOARD.x + BOARD.w - 38, top: BOARD.y - 16, height: 13, paddingHorizontal: 3, borderRadius: 2,
    backgroundColor: DEEP, borderWidth: 1, borderColor: INK, justifyContent: 'center',
  },
  mixText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: PAPER_LIT, includeFontPadding: false,
  },

  rule: {
    position: 'absolute', left: RULE_X, top: RULE_TOP, width: RULE_W, paddingVertical: 3, alignItems: 'center',
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  chainLink: { position: 'absolute', width: 3, borderRadius: 1.5, borderWidth: 0.9, borderColor: INK },
  ruleHead: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  ruleText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  ruleStrike: {
    position: 'absolute', left: 6, right: 6, top: 15, height: 2.5, borderRadius: 1.25, backgroundColor: EMBER,
    transformOrigin: '0% 50%',
  },
  query: {
    position: 'absolute', left: WALLET.x - 9, top: WALLET.y - 42, width: 18, height: 22, borderRadius: 6,
    backgroundColor: PLATE_FACE, borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  queryText: { fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 15, color: EMBER, includeFontPadding: false },

  gauge: { position: 'absolute', top: METER_TOP, width: 10, height: 34 },
  meter: {
    position: 'absolute', left: 0, top: 0, width: 10, height: 28, borderRadius: 3, borderWidth: 1.5, borderColor: INK,
    backgroundColor: PLATE_FACE, justifyContent: 'flex-end', overflow: 'hidden',
  },
  meterFill: { width: '100%', backgroundColor: SAGE },
  meterBulb: {
    position: 'absolute', left: -1, top: 25, width: 12, height: 8, borderRadius: 4, backgroundColor: SAGE,
    borderWidth: 1.5, borderColor: INK,
  },
  weightL: { left: -22 },
  weight: {
    position: 'absolute', left: 14, top: 4, paddingHorizontal: 2, borderRadius: 2, backgroundColor: DEEP,
  },
  weightText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: PAPER_LIT, includeFontPadding: false,
  },

  plate: { position: 'absolute', top: 298, width: PLATE_W, height: 30 },
  thoughtFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 12, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  signFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 4, backgroundColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
  },
  faceRight: { backgroundColor: INK },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: -0.1, color: INK, includeFontPadding: false,
  },
  signText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: PAPER_LIT, includeFontPadding: false,
  },
  onInk: { color: PAPER_LIT },
});

export function Ethics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics2Scene} band={[288, 514]} camera={CAM} />;
}
