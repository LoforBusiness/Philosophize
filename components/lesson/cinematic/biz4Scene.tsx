import { useEffect, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './biz4Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, truckCounter, cashBoxBack, cashBoxFront, cashBoxLid, b4Note, receiptSlip,
  receiptSpike, pocketCalc, vanBoard, roadway, type NaturalKey,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// business-foundations-4, "What Is Profit?" — A FOOD TRUCK AT CLOSING TIME.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The van's owner (plain, vain) counts the
// day's takings in the serving hatch and feels rich; his cook (the cap, kind and
// helpful) did the shopping and has the receipts; the accountant (the top hat) walks up
// the pavement and works out what the owner actually keeps.
//
//   b0   the owner, inside, lifts the lid of the cash box, takes the notes out and holds
//        them up fanned on "business genius", then puts them back.
//   b1   the cook turns to the spike, pulls the three receipts up its rod and off its
//        point, turns back to the owner and holds them up, fanned.
//   b2   the accountant walks in along the pavement carrying his calculator, sets it
//        down on the counter's end, tips his hat and opens a hand to the cash box; the
//        owner turns to him.
//   b3   the cook lays the receipts out on the counter beside the box as the accountant
//        names them — the bread, the fuel, the pitch — and the accountant opens a hand
//        to them.
//   b4   Q1: the cash box, the fuel receipt and the menu board — tap one.
//   b5   the owner leans on the counter, arms folded.
//   b6   the accountant turns to the van's little board, steps to it, takes the chalk off
//        its ledge and chalks the sum — £300, less £220, a rule, £80 — puts the chalk back,
//        turns and steps back.
//   b7   the owner turns to the cash box and shuts its lid, slowly.
//   b8   the cook turns, points across the road to the bakery, and turns back.
//   b9   Q2: the sum is wiped and three amounts are chalked in its place, £80, £100 and
//        £300 — tap one.
//   b10  at ease under the quotation, the van's lights off; b11 the summary.
//
// (A person TURNS to what he works at, and every hand works IN FRONT of the body —
// LESSON_RULES AR4. A turn is eased through a profile.)
//
// COMPOSITION, in stage units. The road runs behind everything, 466–500, its far kerb at
// 466–470. The food truck is parked on it, 2–302 × 334–500, facing left: the cab 14–60,
// the box body 58–302 with the serving hatch cut in it at 140–288 × 404–466, its red flap
// propped up over it at 392–404, festoon bulbs strung under the flap, and the menu board
// screwed on above at 160–268 × 352–384. The fold-down steel counter runs 134–294 at 466,
// at the HIP of the two people inside (AP10), who stand on the van's floor at 494 and are
// seen through the hatch from the hip up: the owner at 178, the cook at 250. On the
// counter: the calculator's place at 140, the cash box 185–207, the three receipts laid
// at 225, 239.5 and 254, and the receipt spike at 270. The van's little chalk board hangs
// on its side left of the hatch, 57–101 × 405–478 (its slate 60–98 × 418–472, a ledge
// for the chalk under it). The accountant stands on the pavement at the counter's left
// end, 129, his hat's brim clear of the board, and steps to 103 to chalk. Across the road on the right, the bakery, 308–398
// × 318–466, with bread in its lit window. Every hand meets what it holds inside the
// rig's safe reach (~23 units from the shoulder at K 0.76). Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners nod along with their hands still (AP18).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('business');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;
/** The van's floor: the two inside stand on it, seen from the hip up through the hatch. */
const FLOOR = 494;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, business-foundations-4). 0 for a beat with no voice.
 */
const LINES = [4.02, 4.12, 5.4, 6.36, 0, 3.44, 6.94, 3.61, 4.81, 0, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// and arms folded (act 62).
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const FOLD = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_COUNT = is('count');
const A_RECEIPTS = is('receipts');
const A_ARRIVE = is('arrive');
const A_COSTS = is('costs');
const A_KEEP = is('keep');
const A_SUM = is('sum');
const A_SHRINK = is('shrink');
const A_BAKERY = is('bakery');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.spend ? 1 : 0));
const Q2 = BEATS.map((b) => (b.left ? 1 : 0));
const BOARD = BEATS.map((b) => b.board ?? 0);
const RECEIPTS_N = A_RECEIPTS.indexOf(1);
const ARRIVE_N = A_ARRIVE.indexOf(1);
const COSTS_N = A_COSTS.indexOf(1);
const SUM_N = A_SUM.indexOf(1);
const SHRINK_N = A_SHRINK.indexOf(1);
const REST_N = A_REST.indexOf(1);

// ── where each of them stands, and which way each faces, beat by beat ────────
// A leg is [fraction of the line it starts at, x]; a turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const PL_LEGS: Track[] = BEATS.map(() => [[0, 178]]);
// The owner: to the cash box on his right; to the accountant once he walks up on his
// left; back to the box to shut it; to the cook while the cook talks.
const PL_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0, 1], [0.3, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, 1]], [[0, 1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
const CP_LEGS: Track[] = BEATS.map(() => [[0, 250]]);
// The cook TURNS to the spike on his right to pull the receipts off it, and to the
// bakery across the road to point at it (AR4), and back to the owner each time.
const CP_TURN: Track[] = [
  [[0, -1]], [[0, 1], [0.34, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
  [[0, -1]], [[0, 1], [0.56, -1]], [[0, -1]], [[0, -1]], [[0, -1]],
];
/** The accountant is off the stage, left, until he walks in on b2; b6 he steps to the board. */
const TH_LEGS: Track[] = BEATS.map((b, n) => (A_SUM[n]
  ? [[0.02, 103], [0.88, 129]]
  : [[0, b.sums ? 129 : -30]]));
const TH_TURN: Track[] = BEATS.map((_, n) => (A_SUM[n] ? [[0, -1], [0.86, 1]] : [[0, 1]]));
/** What each is doing with his body: talking while he speaks, nodding along while he does not. */
const PL_P = [TALK, NOD, NOD, NOD, NOD, TALK, NOD, TALK, NOD, NOD, NOD, LISTEN];
const CP_P = [NOD, TALK, NOD, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD, LISTEN];
const TH_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, NOD, NOD, EXPLAIN, NOD, NOD, NOD, NOD, LISTEN];

// ── the van and what is on its counter ───────────────────────────────────────
const TOP = 466;                                      // the counter's top, at their hip
const HATCH = { left: 140, top: 404, w: 148, h: 62 };
// The truck (2–302 × 334–500) and the bakery (308–398 × 318–466) are PICTURES now
// (LESSON_RULES AM13): biz4-truck and biz4-bakery, drawn in scripts/lib/lessonart/lessons/biz4.mjs
// against photographs of real step-van food trucks and an old bakery front, each in the box
// of the shape-built object it replaced. The menu slate is painted on the truck's picture.
const COUNTER_ART = truckCounter(214, 476, 160, 20);
const MENU = { x: 214, y: 368, w: 108, h: 32 };
const ROAD_ART = roadway(200, 483, 420, 34);
/** The bakery's fascia, where its name is painted. */
const FASCIA = { left: 308, top: 371, w: 90, h: 14 };

/** The cash box: its front 185–207 × 452–466, and a lid that stands 16 up when open. */
const BOX = { x: 196, top: 452, w: 22 };
const LID_H = 16;
/** The lid's top edge for how far it is open: a band on the box shut, upright open. */
function lidTop(open: number) {
  'worklet';
  return BOX.top - LID_H * lerp(0.18, 1, open);
}
const BOX_BACK_ART = cashBoxBack(BOX.x, BOX.top - 2, BOX.w, 4);
const BOX_FRONT_ART = cashBoxFront(BOX.x, BOX.top + 7, BOX.w, 14);
const LID_ART = cashBoxLid(BOX.w / 2, LID_H / 2, BOX.w, LID_H);
/** The notes' foot when they stand in the box, hidden behind its front. */
const NOTES_IN = { x: BOX.x, y: 465.5 };
/** Where the owner's hand takes them. */
const NOTES_GRIP = { x: BOX.x, y: 462 };
const NOTE_KEYS: NaturalKey[] = ['note20', 'note10', 'note5'];
// Each note is drawn about its foot, so three of them fan from one point in the hand.
const NOTE_ART = NOTE_KEYS.map((k) => b4Note(0, -9, 10, 18, k));

/** The spike on the counter's right end, and the slips on it, by their tops. */
const SPIKE = { x: 270, y: 451 };
const SPIKE_ART = receiptSpike(SPIKE.x, SPIKE.y, 12, 30);
const ON_SPIKE = [{ x: 268.6, y: 450.5, r: -8 }, { x: 270, y: 449.5, r: 2 }, { x: 271.4, y: 451, r: 9 }];
/** Where the cook lays them, by their tops — the bread, the fuel, the pitch. */
const LAID = [{ x: 225, y: 452, r: -3 }, { x: 239.5, y: 452, r: 2 }, { x: 254, y: 452, r: -1 }];
// The shop's name on each is printed in its colour: the baker's brown, the petrol
// station's green, the council's blue. Each is drawn about its TOP, where it is held.
const SLIP_ART = (['crust', 'leaf', 'doorPaint'] as NaturalKey[]).map((k) => receiptSlip(0, 7, 10, 14, k));

/** The calculator's place on the counter's left end, by its centre. */
const CALC_AT = { x: 140, y: 459.5 };
const CALC_ART = pocketCalc(0, 0, 9, 13);

/** The van's little board, its slate, and the chalk lying on its ledge. */
const BOARD_ART = vanBoard(79, 441.5, 44, 73);
const SLATE = { left: 60, top: 418, w: 38, h: 54 };
const CHALK_AT = { x: 91, y: 474.1 };
/** The sum, chalked in three rows: what came in, what went out, and under a rule what is left. */
const SUM_ROWS = [
  { text: '£300', top: 430, h: 14, rule: false },
  { text: '−£220', top: 444, h: 14, rule: false },
  { text: '£80', top: 456, h: 16, rule: true },
];
/** Where the chalk travels to write each row: its start and its end. */
const ROW_PATH = [
  [{ x: 68, y: 437 }, { x: 90, y: 437 }],
  [{ x: 66, y: 451 }, { x: 92, y: 451 }],
  [{ x: 67, y: 458 }, { x: 88, y: 465 }],
];
/** The second question's three amounts, in rows down the slate. */
const PICK_ROW_H = SLATE.h / 3;
const MASK_PAD = 3;

/** The festoon under the flap: a wire from jamb to jamb, sagging, a bulb every 13.6. */
const FESTOON = { x0: 140, x1: 288, y: 405, sag: 3 };
const BULBS = Array.from({ length: 11 }, (_, k) => {
  const x = 146 + k * 13.6;
  return { x, y: FESTOON.y + FESTOON.sag * (1 - Math.abs(x - 214) / 74) + 2.6 };
});

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A point moved along a chain of stops by the stage values that carry it between them. */
function via(pts: readonly { x: number; y: number }[], us: readonly number[]) {
  'worklet';
  let x = pts[0].x;
  let y = pts[0].y;
  for (let k = 0; k < us.length; k++) {
    x = lerp(x, pts[k + 1].x, us[k]);
    y = lerp(y, pts[k + 1].y, us[k]);
  }
  return { x, y };
}
/**
 * Leaning on the counter with his arms folded on it: act 62's fold, the body tipped
 * forward and the folded forearms brought down onto the counter in front of him.
 */
function leanFold(t: number): Stance {
  'worklet';
  const s = emoteStill(FOLD, t);
  return { ...s, tilt: s.tilt - 0.26, neck: s.neck + 0.14, fistL: { x: 19, y: -10 }, fistR: { x: 14, y: -7.5 } };
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn. He starts
 * from WHERE HE IS ON SCREEN (`src`, out of the carry), never from where the script
 * left him, so a tap mid-walk cannot put him anywhere in one frame (group L).
 */
function legsOf(src: number, legs: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let free = 0;
  let x = src;
  let x0 = src;
  let x1 = src;
  let u = 1;
  for (let k = 0; k < legs.length; k += 1) {
    const to = legs[k][1];
    const d = Math.abs(to - from);
    const dur = d > 1 ? moveTr(from, to, TR) : 0;
    const start = Math.max(legs[k][0] * L, free);
    if (b < start) break;
    x0 = from;
    x1 = to;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    x = d > 1 ? lerp(from, to, ease01(u)) : to;
    free = start + dur;
    from = to;
  }
  const walking = Math.abs(x1 - x0) > 1 && u < 1;
  return { x, x0, x1, u: ease01(u), walking, end: free };
}

/** Which way a figure faces at time `b`, turning through a profile from its screen facing. */
function faceOf(src: number, turns: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let d = src;
  for (let k = 0; k < turns.length; k += 1) {
    const at = turns[k][0] * L;
    if (b < at) break;
    d = facing(from, turns[k][1], b - at);
    from = turns[k][1];
  }
  return d;
}

/** One figure's body for a beat: walking its legs, or holding its pose live. */
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(codes[n], t), hHold(codes[n], t), hLive(codes[n], t, b), w.u, WALK, 0)
    : hLive(codes[n], t, b);
}

/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

const CAM = followMoves(PL_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('business'));

export default function Biz4Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldP = useHeld();
  const heldC = useHeld();
  const heldT = useHeld();
  const cv = useCarry(23);
  const on = useLinger(i);
  // THE GAMES ANSWER BACK: which of the three was tapped on each graded beat, and how many
  // seconds ago (one clock a question, so answering the second never replays the first).
  // The cash box rattles, the menu shakes its head, the fuel receipt hops off the counter;
  // on the board a wrong amount is struck through in red chalk and the right one ringed.
  const pick1 = useSharedValue(-1);
  const pick2 = useSharedValue(-1);
  const since1 = useSharedValue(0);
  const since2 = useSharedValue(0);
  useEffect(() => {
    const ids = Q1[i] ? COST_Q.map((q) => q.id) : Q2[i] ? PROFIT_Q.map((q) => q.id) : null;
    if (!ids) return;
    const k = picked === null ? -1 : ids.indexOf(picked);
    const pk = Q1[i] ? pick1 : pick2;
    const sc = Q1[i] ? since1 : since2;
    pk.value = k;
    sc.value = 0;
    if (k >= 0) sc.value = withTiming(8, { duration: 8000, easing: Easing.linear });
  }, [picked, i, pick1, pick2, since1, since2]);
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
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the owner, inside the van ───────────────────────────────────────────
    const wp = legsOf(carrySource(cv, 0, n, PL_LEGS[0][0][1]), PL_LEGS[n], b, L);
    const xP = carry(cv, 0, n, wp.x, wp.x, 1);
    const dP = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), PL_TURN[n], b, L), 1);
    let sp = bodyOf(wp, PL_P, n, t, b);
    // the lid, how far open: lifted on b0 and left open, shut slowly on b7
    const lidNow = A_COUNT[n] ? st(0.12, 0.24) : A_SHRINK[n] ? 1 - st(0.2, 0.8) : n > SHRINK_N ? 0 : 1;
    const lid = carry(cv, 2, n, lidNow, lidNow, tr);
    // b0: the lid lifted by its edge; the notes taken out, held up and fanned on
    // "business genius", and put back
    if (A_COUNT[n]) {
      sp = hand(sp, xP, FLOOR, dP, 1, BOX.x, lidTop(lid), st(0.03, 0.12) * (1 - st(0.24, 0.3)));
      const up = st(0.4, 0.5) * (1 - st(0.86, 0.95));
      sp = hand(sp, xP, FLOOR, dP, 1, lerp(NOTES_GRIP.x, xP + dP * 12, up), lerp(NOTES_GRIP.y, 426, up),
        st(0.3, 0.38) * (1 - st(0.96, 1)));
    }
    // b5: leaning on the counter, arms folded on it
    if (A_KEEP[n]) sp = mixStance(sp, leanFold(t), st(0.06, 0.3));
    // b7: turned to the box, its lid taken by the edge and brought down slowly
    if (A_SHRINK[n]) {
      sp = hand(sp, xP, FLOOR, dP, 1, BOX.x, lidTop(lid), st(0.06, 0.18) * (1 - st(0.82, 0.92)));
    }
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t));
    const figP = keepHeld(heldP, mixStance(prevP, sp, tr));

    // ── the cook, inside the van ────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 3, n, CP_LEGS[0][0][1]), CP_LEGS[n], b, L);
    const xC = carry(cv, 3, n, wc.x, wc.x, 1);
    const dC = carry(cv, 4, n, 0, faceOf(carrySource(cv, 4, n, -1), CP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CP_P, n, t, b);
    // b1: turned to the spike, the receipts taken at their tops, pulled up the rod and
    // off its point; turned back, held up to the owner, then brought in close
    if (A_RECEIPTS[n]) {
      const k = via([
        { x: SPIKE.x, y: SPIKE.y }, { x: SPIKE.x, y: 431 }, { x: SPIKE.x - 6, y: 427 },
        { x: xC + dC * 13, y: 438 }, { x: xC + dC * 9, y: 452 },
      ], [st(0.16, 0.24), st(0.24, 0.3), st(0.36, 0.48), st(0.86, 0.96)]);
      sc = hand(sc, xC, FLOOR, dC, 1, k.x, k.y, st(0.05, 0.15));
    }
    // b2: held close, in front of him (AR6)
    if (n > RECEIPTS_N && n < COSTS_N) sc = hand(sc, xC, FLOOR, dC, 1, xC + dC * 9, 452, 1);
    // b3: laid out one by one along the counter as they are named — a path the hand
    // travels once, pausing at each (AR7.5) — then the hand back to rest
    if (A_COSTS[n]) {
      const k = via([{ x: xC + dC * 9, y: 452 }, { x: LAID[0].x, y: 451 }, { x: LAID[1].x, y: 451 }, { x: LAID[2].x, y: 451 }],
        [st(0.33, 0.41), st(0.45, 0.51), st(0.55, 0.61)]);
      sc = hand(sc, xC, FLOOR, dC, 1, k.x, k.y, 1 - st(0.66, 0.78));
    }
    // b8: a hand raised to the bakery across the road, while he is turned to it
    if (A_BAKERY[n]) sc = hand(sc, xC, FLOOR, dC, 1, xC + dC * 22, 426, bp(0.08, 0.18, 0.5));
    const prevC = carryFrom(heldC, n, hHold(CP_P[p], t));
    const figC = keepHeld(heldC, mixStance(prevC, sc, tr));

    // ── the accountant, on the pavement ─────────────────────────────────────
    const wt = legsOf(carrySource(cv, 5, n, -30), TH_LEGS[n], b, L);
    const xT = carry(cv, 5, n, wt.x, wt.x, 1);
    const dT = carry(cv, 6, n, 0, faceOf(carrySource(cv, 6, n, 1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b);
    // the calculator: carried in, in his right hand and in front (AR6), until it is
    // set down on the counter's end on b2
    const after = A_ARRIVE[n] ? wt.end / L : 0;
    if (n < ARRIVE_N) stt = hand(stt, xT, GROUND, dT, 1, xT + dT * 8, 462, 1);
    // b2: the calculator set down, and from it one path for the hand: up to tip the hat,
    // a moment there, then out to the cash box, open, and back down (AR5: no stroke twice)
    if (A_ARRIVE[n]) {
      const k = via([
        { x: xT + dT * 8, y: 462 }, CALC_AT, { x: xT + 5 * dT, y: GROUND - 76 }, { x: xT + dT * 21, y: 447 },
      ], [st(after + 0.01, after + 0.07), st(after + 0.08, after + 0.15), st(0.74, 0.82)]);
      stt = hand(stt, xT, GROUND, dT, 1, k.x, k.y, 1 - st(0.9, 0.98));
    }
    // b3: an open hand to the receipts as they are named
    if (A_COSTS[n]) stt = hand(stt, xT, GROUND, dT, 1, xT + dT * 22, 448, bp(0.36, 0.44, 0.74));
    // b6: turned to the board and stepped up to it, the chalk off its ledge, the sum
    // written row by row — each row a path the chalk travels once, with a pause at the
    // end of each (AR5, AR7.5) — and the chalk put back
    if (A_SUM[n]) {
      const k = via([
        CHALK_AT, ROW_PATH[0][0], ROW_PATH[0][1], ROW_PATH[1][0], ROW_PATH[1][1], ROW_PATH[2][0], ROW_PATH[2][1], CHALK_AT,
      ], [st(0.22, 0.25), st(0.25, 0.34), st(0.4, 0.44), st(0.44, 0.54), st(0.62, 0.66), st(0.66, 0.76), st(0.78, 0.82)]);
      stt = hand(stt, xT, GROUND, dT, 1, k.x, k.y, st(0.16, 0.21) * (1 - st(0.84, 0.88)));
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the things that move ───────────────────────────────────────────────
    const pl = pose(figP, xP, FLOOR, K, dP, 1);
    const cp = pose(figC, xC, FLOOR, K, dC, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const wPR = wristOf(pl, 'wrR');
    const wCR = wristOf(cp, 'wrR');
    const wTR = wristOf(th, 'wrR');

    // the notes: 0 standing in the box · 1 in the owner's hand; and how far fanned
    const notesNow = A_COUNT[n] ? st(0.37, 0.39) * (1 - st(0.94, 0.96)) : 0;
    const notesIn = carry(cv, 7, n, notesNow, notesNow, tr);
    const fanNow = A_COUNT[n] ? st(0.5, 0.6) * (1 - st(0.82, 0.88)) : 0;
    const fan = carry(cv, 8, n, fanNow, fanNow, tr);

    // the receipts: 0 on the spike · 1 in the cook's hand · 2 laid on the counter
    const slipNow = (k: number) => {
      'worklet';
      if (A_RECEIPTS[n]) return st(0.14, 0.16);
      if (A_COSTS[n]) return 1 + st(0.41 + k * 0.1, 0.43 + k * 0.1);
      return n > COSTS_N ? 2 : n > RECEIPTS_N ? 1 : 0;
    };
    const s0 = carry(cv, 9, n, slipNow(0), slipNow(0), tr);
    const s1 = carry(cv, 10, n, slipNow(1), slipNow(1), tr);
    const s2 = carry(cv, 11, n, slipNow(2), slipNow(2), tr);
    const spreadNow = A_RECEIPTS[n] ? st(0.48, 0.56)
      : n > RECEIPTS_N && n < COSTS_N ? 1 : A_COSTS[n] ? 1 - st(0.3, 0.36) : 0;
    const spread = carry(cv, 12, n, spreadNow, spreadNow, tr);
    const slipAt = (k: number, s: number) => {
      'worklet';
      const h = { x: wCR.x, y: wCR.y + 1, r: (k - 1) * 10 * spread };
      const a = s <= 1 ? ON_SPIKE[k] : h;
      const z = s <= 1 ? h : LAID[k];
      const u = s <= 1 ? s : s - 1;
      return { x: lerp(a.x, z.x, u), y: lerp(a.y, z.y, u), r: lerp(a.r, z.r, u), o: 1 };
    };

    // the calculator: 0 in the accountant's hand · 1 on the counter
    const calcNow = A_ARRIVE[n] ? st(after + 0.065, after + 0.075) : n > ARRIVE_N ? 1 : 0;
    const calc = carry(cv, 13, n, calcNow, calcNow, tr);
    // the chalk: 0 on the ledge · 1 in his hand
    const chalkNow = A_SUM[n] ? st(0.21, 0.22) * (1 - st(0.83, 0.84)) : 0;
    const chalk = carry(cv, 14, n, chalkNow, chalkNow, tr);
    // the sum, row by row as it is chalked; wiped for the second question
    const wNow = (a: number, z: number) => {
      'worklet';
      return A_SUM[n] ? st(a, z) : n > SUM_N ? 1 : 0;
    };
    const sumNow = BOARD[n] === 2 ? 0 : 1;
    const pickNow = BOARD[n] === 2 ? 1 : 0;
    // the van's lights, switched off at closing
    const lightsNow = A_REST[n] ? 1 - st(0.1, 0.4) : n > REST_N ? 0 : 1;

    // ── the answers, answered back ─────────────────────────────────────────
    const r1 = since1.value;
    const r2 = since2.value;
    const k1 = pick1.value;
    const k2 = pick2.value;
    const g1 = clamp01(r1 / 0.9);
    const g2 = clamp01(r2 / 0.9);
    // a wrong thing shudders, quick and then dying away
    const shudder = (r: number, g: number) => {
      'worklet';
      return 2.2 * Math.sin(r * 36) * (1 - g) * (1 - g);
    };
    // the fuel receipt hops: a dip, up and over, a small bounce on landing
    const hopUp = k1 === 1
      ? 1.2 * Math.sin(Math.PI * clamp01(r1 / 0.08)) * (r1 < 0.08 ? 1 : 0)
        - 9 * Math.sin(Math.PI * clamp01((r1 - 0.08) / 0.42))
        - 2 * Math.sin(Math.PI * clamp01((r1 - 0.5) / 0.18))
      : 0;
    const hopTurn = k1 === 1 ? 14 * Math.sin(2 * Math.PI * clamp01((r1 - 0.08) / 0.42)) * (1 - clamp01((r1 - 0.5) / 0.3)) : 0;
    // the right amount is ringed in chalk; after a wrong one, a beat later
    const ringU = k2 === 1 ? clamp01(r2 / 0.35) : k2 >= 0 ? clamp01((r2 - 0.75) / 0.35) : 0;

    return {
      pl, cp, th, t,
      lid,
      // in the box they show only while its lid is up: shut, the lid is over them
      notes: { x: lerp(NOTES_IN.x, wPR.x, notesIn), y: lerp(NOTES_IN.y, wPR.y + 6, notesIn), o: Math.max(notesIn, clamp01(lid * 3)) },
      fan,
      slip0: slipAt(0, s0),
      slip1: (() => {
        const a = slipAt(1, s1);
        return { ...a, y: a.y + hopUp, r: a.r + hopTurn };
      })(),
      slip2: slipAt(2, s2),
      calc: { x: lerp(wTR.x + dT * 1.5, CALC_AT.x, calc), y: lerp(wTR.y - 2.5, CALC_AT.y, calc), o: 1 },
      // the chalk held by one end, its point forward and down to the slate (AR2)
      chalk: { x: lerp(CHALK_AT.x, wTR.x + 2.2 * dT, chalk), y: lerp(CHALK_AT.y, wTR.y + 0.5, chalk), r: 14 * chalk },
      w1: carry(cv, 15, n, wNow(0.25, 0.34), wNow(0.25, 0.34), tr),
      w2: carry(cv, 16, n, wNow(0.44, 0.54), wNow(0.44, 0.54), tr),
      w3: carry(cv, 17, n, wNow(0.64, 0.76), wNow(0.64, 0.76), tr),
      sumO: carry(cv, 18, n, sumNow, sumNow, tr),
      pickO: carry(cv, 19, n, pickNow, pickNow, tr),
      lights: carry(cv, 20, n, lightsNow, lightsNow, tr),
      q1: carry(cv, 21, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 22, n, Q2[p], Q2[n], tr),
      boxJig: k1 === 0 ? shudder(r1, g1) : 0,
      lidJig: k1 === 0 ? 0.16 * Math.abs(Math.sin(r1 * 30)) * (1 - g1) : 0,
      jig1: [0, 1, 2].map((k) => (k === k1 && k !== 1 ? shudder(r1, g1) : 0)),
      jig2: [0, 1, 2].map((k) => (k === k2 && k !== 1 ? shudder(r2, g2) : 0)),
      strike: [0, 1, 2].map((k) => (k === k2 && k !== 1 ? clamp01(r2 / 0.28) : 0)),
      ring: ringU,
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={ROAD_ART} tone={TONE} />
      <LessonPicture name="biz4-bakery" />
      <View style={styles.fascia} pointerEvents="none">
        <Text style={styles.fasciaText}>BAKERY</Text>
      </View>
      <LessonPicture name="biz4-truck" />
      <Glow S={SCENE} />
      <Festoon S={SCENE} />
      <View style={styles.hatch} pointerEvents="none">
        <View style={styles.hatchStage}>
          {/* cast: plain */}
          <Stickman D={DP} k={K} role="lead" wear={[]} />
          {/* cast: cap */}
          <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
        </View>
      </View>
      <ObjectArt parts={COUNTER_ART} tone={TONE} />
      <ObjectArt parts={BOARD_ART} tone={TONE} />
      <Chalked S={SCENE} />
      <ObjectArt parts={SPIKE_ART} tone={TONE} />
      <CashBox S={SCENE} />
      <Slips S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      <Hands S={SCENE} />
      {on(Q1) ? <CostTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <ProfitTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the van's lights: the lamp in the kitchen and the festoon under the flap ──

function Glow({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.5 * S.value.lights }));
  return <Animated.View style={[styles.glow, st]} pointerEvents="none" />;
}

const SAG_DEG = (Math.atan2(FESTOON.sag, 74) * 180) / Math.PI;
const SAG_LEN = Math.hypot(74, FESTOON.sag);
function Festoon({ S }: { S: SharedValue<any> }) {
  const lit = useAnimatedStyle(() => ({ opacity: S.value.lights }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.wire, { left: FESTOON.x0 + 37 - SAG_LEN / 2, top: FESTOON.y + FESTOON.sag / 2, transform: [{ rotate: `${SAG_DEG}deg` }] }]} />
      <View style={[styles.wire, { left: FESTOON.x0 + 111 - SAG_LEN / 2, top: FESTOON.y + FESTOON.sag / 2, transform: [{ rotate: `${-SAG_DEG}deg` }] }]} />
      {BULBS.map((u, k) => (
        <View key={k} style={[styles.bulb, { left: u.x - 2, top: u.y - 2.4 }]}>
          <Animated.View style={[styles.bulbLit, lit]} />
        </View>
      ))}
    </View>
  );
}

// ── the cash box, its lid and the notes in it ────────────────────────────────

function CashBox({ S }: { S: SharedValue<any> }) {
  const lid = useAnimatedStyle(() => ({ transform: [{ scaleY: lerp(0.18, 1, S.value.lid) - S.value.lidJig }] }));
  const jig = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.boxJig }] }));
  const notes = useAnimatedStyle(() => ({
    opacity: S.value.notes.o,
    transform: [{ translateX: S.value.notes.x }, { translateY: S.value.notes.y }],
  }));
  const fanL = useAnimatedStyle(() => ({ transform: [{ rotate: `${-30 * S.value.fan}deg` }] }));
  const fanR = useAnimatedStyle(() => ({ transform: [{ rotate: `${30 * S.value.fan}deg` }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, jig]} pointerEvents="none">
      <ObjectArt parts={BOX_BACK_ART} tone={TONE} />
      <Animated.View style={[styles.lid, lid]} pointerEvents="none">
        <ObjectArt parts={LID_ART} tone={TONE} />
      </Animated.View>
      <Animated.View style={[styles.rider, notes]} pointerEvents="none">
        <Animated.View style={[styles.rider, fanL]}><ObjectArt parts={NOTE_ART[0]} tone={TONE} /></Animated.View>
        <View style={styles.rider}><ObjectArt parts={NOTE_ART[1]} tone={TONE} /></View>
        <Animated.View style={[styles.rider, fanR]}><ObjectArt parts={NOTE_ART[2]} tone={TONE} /></Animated.View>
      </Animated.View>
      <ObjectArt parts={BOX_FRONT_ART} tone={TONE} />
    </Animated.View>
  );
}

// ── riders: a thing drawn about the point it is held by ─────────────────────

type At = { x: number; y: number; o: number; r?: number };
function Rider({ at, art }: { at: { readonly value: At }; art: ReturnType<typeof receiptSlip> }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r ?? 0}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

/** The three receipts: on the spike, in the cook's hand, laid on the counter. The bread on top. */
function Slips({ S }: { S: SharedValue<any> }) {
  const a = useDerivedValue<At>(() => S.value.slip0);
  const f = useDerivedValue<At>(() => S.value.slip1);
  const c = useDerivedValue<At>(() => S.value.slip2);
  return (
    <>
      <Rider at={c} art={SLIP_ART[2]} />
      <Rider at={f} art={SLIP_ART[1]} />
      <Rider at={a} art={SLIP_ART[0]} />
    </>
  );
}

/** What the accountant carries: the calculator, and the chalk. */
function Hands({ S }: { S: SharedValue<any> }) {
  const calcP = useDerivedValue<At>(() => S.value.calc);
  const chalkSt = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.chalk.x }, { translateY: S.value.chalk.y }, { rotate: `${S.value.chalk.r}deg` }],
  }));
  return (
    <>
      <Rider at={calcP} art={CALC_ART} />
      <Animated.View style={[styles.chalk, chalkSt]} pointerEvents="none" />
    </>
  );
}

// ── the chalk on the van's little board ──────────────────────────────────────

/** Q2: three amounts chalked down the slate. Three hundred in, two hundred out: £100. */
const PROFIT_Q = [
  { id: 'eighty-pounds', label: '£80', correct: false },
  { id: 'hundred-pounds', label: '£100', correct: true },
  { id: 'three-hundred-pounds', label: '£300', correct: false },
];

/** One of Q2's chalked amounts: it shudders if it was the wrong pick, and is struck through in red chalk. */
function PickRow({ S, k, label }: { S: SharedValue<any>; k: number; label: string }) {
  const row = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.jig2[k] }] }));
  const strike = useAnimatedStyle(() => ({ width: STRIKE_W * S.value.strike[k], opacity: S.value.strike[k] > 0.02 ? 1 : 0 }));
  const ring = useAnimatedStyle(() => {
    const u = S.value.ring;
    // drawn round in one go, overshooting a little and settling (an ease-out-back)
    const c = 1.9;
    const back = 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
    return { opacity: u > 0.02 ? 1 : 0, transform: [{ rotate: '-2deg' }, { scaleX: 0.3 + 0.7 * back }] };
  });
  return (
    <Animated.View style={[styles.pickRow, { top: k * PICK_ROW_H }, row]}>
      <Text style={styles.pickText}>{label}</Text>
      <Animated.View style={[styles.strike, strike]} />
      {k === 1 ? <Animated.View style={[styles.ring, ring]} /> : null}
    </Animated.View>
  );
}
const STRIKE_W = 26;

function Chalked({ S }: { S: SharedValue<any> }) {
  const r1 = useAnimatedStyle(() => ({ width: SLATE.w * S.value.w1, opacity: S.value.sumO }));
  const r2 = useAnimatedStyle(() => ({ width: SLATE.w * S.value.w2, opacity: S.value.sumO }));
  const r3 = useAnimatedStyle(() => ({ width: SLATE.w * S.value.w3, opacity: S.value.sumO }));
  const picks = useAnimatedStyle(() => ({ opacity: S.value.pickO }));
  const masks = [r1, r2, r3];
  return (
    <>
      {SUM_ROWS.map((row, k) => (
        <Animated.View key={k} style={[styles.rowMask, { top: row.top - MASK_PAD, height: row.h + 2 * MASK_PAD }, masks[k]]} pointerEvents="none">
          <View style={[styles.rowPlate, { height: row.h }]}>
            {row.rule ? <View style={styles.rule} /> : null}
            <Text style={[styles.chalkText, row.rule ? styles.underRule : null]}>{row.text}</Text>
          </View>
        </Animated.View>
      ))}
      <Animated.View style={[styles.picks, picks]} pointerEvents="none">
        {PROFIT_Q.map((q, k) => <PickRow key={q.id} S={S} k={k} label={q.label} />)}
      </Animated.View>
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both questions are tapped ON THE STAGE (AP6). Q1's cash box and menu board carry
 * their names on a small plate inside the target (AN1); the fuel receipt is one of
 * three laid close together, so its ring keeps to the slip and its name hangs on a
 * plate just under the counter below it, lined up with it (AN2). Q2's three are the
 * amounts chalked on the board, and the chalk is their name.
 */
type Q = { id: string; label: string; pw: number; left: number; top: number; w: number; h: number; correct: boolean; under?: boolean };
/** Q1: the cash box, the fuel receipt and the menu board. Fuel is money paid out. */
const COST_Q: Q[] = [
  { id: 'cash-box', label: 'CASH', pw: 38, left: 176, top: 434, w: 40, h: 48, correct: false },
  { id: 'fuel-receipt', label: 'FUEL', pw: 34, left: 232.5, top: 446, w: 14, h: 21, correct: true, under: true },
  { id: 'menu-board', label: 'MENU', pw: 38, left: MENU.x - MENU.w / 2, top: MENU.y - MENU.h / 2, w: MENU.w, h: MENU.h, correct: false },
];
function CostTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {COST_Q.map((q) => (q.under ? (
        <View key={`${q.id}-name`} style={[styles.namePlate, { left: q.left + q.w / 2 - q.pw / 2, top: TOP + 3, width: q.pw }]} pointerEvents="none">
          <Text style={styles.nameText}>{q.label}</Text>
        </View>
      ) : null))}
      {COST_Q.map((q, k) => (
        <Jig key={q.id} S={S} q="jig1" k={k}>
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={q.under ? 2 : 4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place}>
            {q.under ? null : (
              <View style={[styles.namePlate, { left: (q.w - q.pw) / 2, bottom: 1, width: q.pw }]}>
                <Text style={styles.nameText}>{q.label}</Text>
              </View>
            )}
          </View>
        </Target>
        </Jig>
      ))}
    </Animated.View>
  );
}

/** A tapped thing that was wrong shakes its head: the target, its ring and its seal together. */
function Jig({ S, q, k, children }: { S: SharedValue<any>; q: 'jig1' | 'jig2'; k: number; children: ReactNode }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value[q][k] }] }));
  return <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="box-none">{children}</Animated.View>;
}

function ProfitTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {PROFIT_Q.map((q, k) => (
        <Jig key={q.id} S={S} q="jig2" k={k}>
        <Target id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLATE.left + 1, top: SLATE.top + k * PICK_ROW_H + 1, width: SLATE.w - 2, height: PICK_ROW_H - 2 }}
        >
          <View style={styles.place} />
        </Target>
        </Jig>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  fascia: {
    position: 'absolute', left: FASCIA.left, top: FASCIA.top, width: FASCIA.w, height: FASCIA.h,
    alignItems: 'center', justifyContent: 'center',
  },
  fasciaText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 1.4, color: NATURAL.bakeryBlue.label,
    includeFontPadding: false,
  },
  glow: {
    position: 'absolute', left: HATCH.left, top: HATCH.top, width: HATCH.w, height: HATCH.h,
    backgroundColor: NATURAL.truckGlow.base,
  },
  // The two inside are seen only through the hatch: everything of them outside it — the
  // legs below the counter — is behind the van's side.
  hatch: { position: 'absolute', left: HATCH.left, top: HATCH.top, width: HATCH.w, height: HATCH.h, overflow: 'hidden' },
  hatchStage: { position: 'absolute', left: -HATCH.left, top: -HATCH.top, width: STAGE_W, height: STAGE_H },
  wire: { position: 'absolute', width: SAG_LEN, height: 0.8, borderRadius: 0.4, backgroundColor: INK },
  bulb: {
    position: 'absolute', width: 4, height: 5, borderRadius: 2, borderWidth: 0.6, borderColor: INK,
    backgroundColor: NATURAL.bulbOff.base, overflow: 'hidden',
  },
  bulbLit: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: NATURAL.bulbLit.base },
  lid: {
    position: 'absolute', left: BOX.x - BOX.w / 2, top: BOX.top - LID_H, width: BOX.w, height: LID_H, transformOrigin: '50% 100%',
  },
  chalk: {
    position: 'absolute', left: -2.6, top: -0.9, width: 5.2, height: 1.8, borderRadius: 0.6,
    backgroundColor: PAPER_LIT, borderWidth: 0.5, borderColor: INK,
  },
  // A row's mask reveals it ACROSS as it is chalked, reaching MASK_PAD above and below so
  // it never clips the handwriting face's tall line box.
  rowMask: { position: 'absolute', left: SLATE.left, overflow: 'hidden' },
  rowPlate: {
    position: 'absolute', left: 0, top: MASK_PAD, width: SLATE.w, alignItems: 'center', justifyContent: 'center',
  },
  rule: { position: 'absolute', left: 7, right: 7, top: 1, height: 1.2, borderRadius: 0.6, backgroundColor: PAPER_LIT },
  underRule: { marginTop: 3 },
  // AQ2: stretched across the slate and centred, so Caveat's ink past its last advance
  // lands inside the Text's own box (a phone clips at the content box).
  chalkText: {
    alignSelf: 'stretch', textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 12.5, lineHeight: 14, color: PAPER_LIT, includeFontPadding: false,
  },
  picks: { position: 'absolute', left: SLATE.left, top: SLATE.top, width: SLATE.w, height: SLATE.h },
  pickRow: {
    position: 'absolute', left: 0, width: SLATE.w, height: PICK_ROW_H, alignItems: 'center', justifyContent: 'center',
  },
  pickText: {
    alignSelf: 'stretch', textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 13, lineHeight: 15, color: PAPER_LIT, includeFontPadding: false,
  },
  place: { flexGrow: 1 },
  strike: {
    position: 'absolute', left: (SLATE.w - STRIKE_W) / 2, top: PICK_ROW_H / 2 - 0.8, height: 1.7, borderRadius: 0.9,
    backgroundColor: NATURAL.tomato.base, transform: [{ rotate: '-9deg' }],
  },
  ring: {
    position: 'absolute', left: (SLATE.w - 28) / 2, top: PICK_ROW_H - 2.4, width: 28, height: 1.8, borderRadius: 1,
    backgroundColor: NATURAL.lemon.base,
  },
  // a struck name plate: a white face with its lit top edge, standing on a hard ledge
  namePlate: {
    position: 'absolute', alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: 4, borderWidth: 1.2,
    borderColor: INK, paddingHorizontal: 3,
    boxShadow: `inset 0px 1px 0px rgba(255, 255, 255, 0.9), 0px 2px 0px ${TONE.SHADE}`,
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
});

export function Biz4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Biz4Scene} band={[306, 514]} camera={CAM} />;
}
