import { useEffect, type ReactNode } from 'react';
import LessonPicture from './LessonPicture';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './hist2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE, lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import { NATURAL, atticRoof, atticGable, atticBeams, atticWindow, atticDoorway } from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-2, "How Historians Know" — AN ATTIC UNDER THE ROOF.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The great-granddaughter (the bun, oblivious)
// has a glossy history book that makes her great-grandad a castle-taking hero; the
// plain mascot (passive-aggressive) has found the man's own letter in a hatbox; the
// historian (the top hat) comes up the stairs and shows how two sources are weighed,
// and what settles it.
//
//   b0   she holds the book open at its castle picture, lifts it proudly, and shuts it.
//   b1   he steps to the hatbox, crouches, draws a yellowed letter out of it, stands,
//        turns to her and unfolds it, reading.
//   b2   the historian comes in through the attic door, walks behind the trunk, tips
//        his hat, and turns to the book, then to the letter, a hand out to each.
//   b3   "primary source": a hand to the letter, which is held up; then "secondary":
//        a hand to the book, which is held up.
//   b4   Q1: the book (1985), the museum leaflet on the trunk (2010) and the letter
//        (1916) — tap one.
//   b5   she taps the book's glossy cover twice — a shine runs over it — and holds it
//        high, chin up.
//   b6   he takes the book across the trunk and sets it down, then the letter, either
//        side of the leaflet, and looks up at the shelf.
//   b7   Q2: the newspaper's corner in the hatbox, the second copy of the book on the
//        shelf, and the portrait — tap one.
//   b8   he crouches to the hatbox again, draws out the folded newspaper in a puff of
//        dust, stands and opens it: 1916, and a heap of potatoes.
//   b9   she leans in to peer at it, claps once and keeps her hands clasped, and lifts
//        her chin, proud.
//   b10  at ease under the quotation.
//
// COMPOSITION, in stage units. The gable end of an attic: the rafters climb from the
// walls (395) to the ridge (290, above the band) at 0.525 a unit, a collar beam ties
// them at 348, and a four-pane window sits under it at 200 (359–385). The door down
// to the stairs stands open on the left, 6–54 × 416–500. The STEAMER TRUNK is the
// table, 151–217 × 470–500, its lid at a figure's hip; the HISTORIAN stands behind it
// at 184, so what he sets on it lies in his reach (~23 units from the shoulder at K
// 0.76, the shoulder at y 454). The GREAT-GRANDDAUGHTER stands at its left end, 140;
// the PLAIN MAN at its right end, 232 — 44 and 48 units from him, so a book or a letter
// passes across the trunk's corner within both arms. The museum leaflet stands on the
// lid at 184; the book is laid at 168 and the letter at 200. To the right: the HATBOX
// on the floor, 249–275 × 478–500 (he takes things from it crouched at 242), its lid
// leaning at 285; a SHELF of books, 290–354 at 413, the second copy face-out at 338;
// and the PORTRAIT of great-grandad leaning on the floor against the eaves, 360–390.
// Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('history');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, history-foundations-2). 0 for a beat with no voice.
 */
const LINES = [5.38, 4.78, 6.83, 8.14, 0, 6.05, 7.55, 0, 6.79, 3.4, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// leaning in, and waiting for an answer; and, at the hatbox, a crouch.
const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const LEAN = 177;
const WAIT = 161;
/** Posture 13: down on the haunches, peering at the floor. */
const CROUCH = 13;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_BOAST = is('boast');
const A_LETTER = is('letter');
const A_ARRIVE = is('arrive');
const A_KINDS = is('kinds');
const A_PRINTED = is('printed');
const A_CHECK = is('check');
const A_PAPER = is('paper');
const A_HERO = is('hero');
const A_REST = is('rest');
const FIRST = BEATS.map((b) => (b.first ? 1 : 0));
const SETTLE = BEATS.map((b) => (b.settle ? 1 : 0));
const LETTER_N = A_LETTER.indexOf(1);
const CHECK_N = A_CHECK.indexOf(1);
const PAPER_N = A_PAPER.indexOf(1);

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const BN = 115;
const TH = 190;
const PL = 265;
/** Where the plain man crouches to reach into the hatbox. */
const PL_BOX = 277;
/** Where each giver steps in to, at the trunk's corner, to hand a thing across on b6. */
const BN_IN = 142;
const PL_IN = 238;
const TH_X0 = -40;
const BN_LEGS: Track[] = BEATS.map((_, n) => (n === CHECK_N ? [[0.02, BN_IN], [0.26, BN]] : [[0, BN]]));
const BN_TURN: Track[] = BEATS.map((_, n) => (n === CHECK_N ? [[0, 1], [0.26, -1], [0.38, 1]] : [[0, 1]]));
const PL_LEGS: Track[] = BEATS.map((_, n) => (n === LETTER_N ? [[0.04, PL_BOX], [0.5, PL]]
  : n === PAPER_N ? [[0.03, PL_BOX], [0.42, PL]] : n === CHECK_N ? [[0.38, PL_IN], [0.66, PL]] : [[0, PL]]));
const PL_TURN: Track[] = BEATS.map((_, n) => (n === LETTER_N ? [[0, 1], [0.48, -1]]
  : n === PAPER_N ? [[0, 1], [0.4, -1]] : n === CHECK_N ? [[0, -1], [0.66, 1], [0.78, -1]] : [[0, -1]]));
const TH_LEGS: Track[] = BEATS.map((b) => (b.th ? [[0, TH]] : [[0, TH_X0]]));
const TH_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0, 1], [0.69, -1], [0.85, 1]], [[0, 1], [0.55, -1]], [[0, -1]], [[0, -1]],
  [[0, -1], [0.38, 1]], [[0, 1]], [[0, 1]], [[0.05, -1]], [[0, -1]], [[0, -1]],
];
/**
 * What each is doing with his body: talking while he speaks, listening — alive,
 * nodding or leaning in — while he does not (N21), and waiting while the reader answers.
 */
const BN_P = [TALK, NOD, LEAN, NOD, WAIT, TALK, NOD, WAIT, LEAN, TALK, NOD, WAIT];
const PL_P = [NOD, TALK, NOD, NOD, WAIT, LEAN, NOD, WAIT, TALK, NOD, NOD, WAIT];
const TH_P = [WAIT, WAIT, EXPLAIN, EXPLAIN, WAIT, NOD, EXPLAIN, WAIT, NOD, NOD, NOD, WAIT];

// ── the attic and what is in it ──────────────────────────────────────────────
const ROOF_ART = atticRoof(200, 395, 400, 210);
const GABLE_ART = atticGable(200, 395, 400, 210);
const BEAMS_ART = atticBeams(200, 395, 400, 210);
const WINDOW_ART = atticWindow(200, 372, 30, 26);
const DOOR_ART = atticDoorway(30, 458, 48, 84);
const TRUNK = { x: TH, top: 470 };
const BOX = { x: 297, rim: 478 };
const CORNER = { x: BOX.x + 9, y: 476 };
const LEAFLET = { x: TH, y: 462 };
const COPY = { x: 348, y: 403 };
const PORTRAIT = { x: 375, y: 481 };

// Where the things are held, passed and laid down.
/**
 * Her hand on the book's near edge, 7 units in front of her; the book's centre 7 units on.
 * Held at her CHEST, below the shoulder (y ~456), never up in front of her face (AR6).
 */
const BN_HOLD = { dx: 7, y: 463 };
/** The plain man's hand on the letter's near edge, 12 in front of him; the letter 6 units on. */
const PL_HOLD = { x: PL - 12, y: 463 };
/**
 * Across the trunk's corners, each giver stepped in: the book (her hand 160, his 174,
 * the book's centre 167), the letter (his 206, the plain man's 218, its centre 212).
 */
const BOOK_PASS = { bn: 160, th: 174, y: 461 };
const LETTER_PASS = { th: 206, pl: 218, y: 461 };
/** Laid on the lid: the book at 174, the letter at 206, either side of the leaflet. */
const BOOK_LID = { x: 174, y: 460 };
const LETTER_LID = { x: 206, y: 461 };
/** The newspaper held open in both his hands, in front of his chest. */
const NEWS_HANDS = { front: PL - 24, back: PL + 2, y: 462 };

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A head turned up (negative) or down (positive), the spine going with it (N12). */
function lookOf(s: Stance, neck: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  return { ...s, neck: lerp(s.neck, neck, w), tilt: s.tilt + (neck < 0 ? -0.06 : 0.08) * w };
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn. He starts
 * from WHERE HE IS ON SCREEN (`src`, out of the carry), never from where the script
 * left him, so a tap mid-walk or a step back cannot put him anywhere in one frame
 * (group L). A leg starts at its time or when the leg before it has finished.
 */
function legsOf(src: number, legs: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let free = 0;
  let x = src;
  let x0 = src;
  let x1 = src;
  let u = 1;
  let arrive = 0;
  for (let k = 0; k < legs.length; k += 1) {
    const to = legs[k][1];
    const d = Math.abs(to - from);
    const dur = d > 1 ? moveTr(from, to, TR) : 0;
    const start = Math.max(legs[k][0] * L, free);
    arrive = start + dur;
    if (b < start) break;
    x0 = from;
    x1 = to;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    x = d > 1 ? lerp(from, to, ease01(u)) : to;
    free = start + dur;
    from = to;
  }
  const walking = Math.abs(x1 - x0) > 1 && u < 1;
  return { x, x0, x1, u: ease01(u), walking, arrive };
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

const CAM = followMoves(TH_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('history'));

export default function Hist2Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldP = useHeld();
  const heldH = useHeld();
  const cv = useCarry(18);
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
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the great-granddaughter, at the trunk's left end ────────────────────
    const wb = legsOf(carrySource(cv, 0, n, BN), BN_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), BN_TURN[n], b, L), 1);
    let sb = bodyOf(wb, BN_P, n, t, b);
    // how much of the book she holds: until he takes it across the trunk on b6
    const bnHolds = n < CHECK_N ? 1 : n === CHECK_N ? 1 - st(0.2, 0.26) : 0;
    if (A_BOAST[n]) {
      // the book held open at her chest in both hands, lifted proudly at "right here
      // in this book", then shut — the back hand lets go
      const lift = 6 * bp(0.5, 0.62, 0.84);
      const both = 1 - st(0.86, 0.96);
      sb = hand(sb, xB, dB, 1, xB + lerp(BN_HOLD.dx, 23, both), lerp(BN_HOLD.y, 458 - lift, both), 1);
      sb = hand(sb, xB, dB, -1, xB + 5, 458 - lift, both);
      sb = lookOf(sb, -0.2, bp(0.5, 0.62, 0.86));
    } else if (bnHolds > 0) {
      let hx = xB + BN_HOLD.dx;
      let hy = BN_HOLD.y;
      // b3: the book held up as it is named a secondary source
      if (A_KINDS[n]) hy -= 7 * bp(0.6, 0.7, 0.96);
      // b5: held high, chin up, at "printed things are true, aren't they?"
      if (A_PRINTED[n]) hy -= 8 * bp(0.6, 0.72, 0.98);
      // b6: out across the trunk's corner, into his hand
      if (A_CHECK[n]) {
        const out = st(0.1, 0.16);
        hx = lerp(hx, BOOK_PASS.bn, out);
        hy = lerp(hy, BOOK_PASS.y, out);
      }
      sb = hand(sb, xB, dB, 1, hx, hy, bnHolds);
    }
    if (A_PRINTED[n]) {
      // two taps on the glossy cover with her other hand, then chin up
      sb = hand(sb, xB, dB, -1, xB + 15, 457, bp(0.06, 0.13, 0.2) + bp(0.2, 0.27, 0.34));
      sb = lookOf(sb, -0.24, bp(0.6, 0.72, 0.98));
    }
    if (A_HERO[n]) {
      // she leans in to peer at the newspaper; one delighted clap, her hands staying
      // clasped together at her chest (AR5: a clap, not a run of them); then chin up,
      // proud
      const peer = st(0.0, 0.18) * (1 - st(0.28, 0.36));
      sb = lookOf({ ...sb, tilt: sb.tilt + 0.1 * peer }, 0.2, peer);
      const clap = st(0.42, 0.5);
      const up = st(0.32, 0.4) * (1 - st(0.74, 0.8));
      sb = hand(sb, xB, dB, 1, xB + lerp(19, 13, clap), 452, up);
      sb = hand(sb, xB, dB, -1, xB + lerp(5, 11, clap), 452, up);
      const proud = st(0.8, 0.9);
      sb = hand(sb, xB, dB, 1, xB + 6, 461, proud);
      sb = hand(sb, xB, dB, -1, xB + 3, 463, proud);
      sb = lookOf(sb, -0.26, proud);
    }
    if (A_REST[n]) {
      // under the quotation her hands stay folded in front of her, where "proud" left
      // them, and only her head nods along: a hand never swings back through her (AR4)
      sb = hand(sb, xB, dB, 1, xB + 6, 461, 1);
      sb = hand(sb, xB, dB, -1, xB + 3, 463, 1);
    }
    const prevB = carryFrom(heldB, n, hHold(BN_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the plain man, at the trunk's right end ─────────────────────────────
    const wp = legsOf(carrySource(cv, 2, n, PL), PL_LEGS[n], b, L);
    const xP = carry(cv, 2, n, wp.x, wp.x, 1);
    const dP = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, -1), PL_TURN[n], b, L), 1);
    let sp = bodyOf(wp, PL_P, n, t, b);
    // how much of the letter he holds: from b1 until the historian takes it on b6
    const plHolds = n > LETTER_N && n < CHECK_N ? 1 : n === CHECK_N ? 1 - st(0.56, 0.62) : 0;
    if (A_LETTER[n]) {
      // down to the hatbox, a letter drawn out of it, up again, turned to her and read
      sp = mixStance(sp, postureStill(CROUCH, t), st(0.17, 0.26) * (1 - st(0.4, 0.5)));
      const inBox = st(0.2, 0.28);
      const tx = lerp(lerp(BOX.x - 6, PL_BOX + 8, st(0.3, 0.4)), PL_HOLD.x, st(0.5, 0.62));
      const ty = lerp(lerp(BOX.rim, 462, st(0.3, 0.4)), PL_HOLD.y, st(0.5, 0.62));
      sp = hand(sp, xP, dP, 1, tx, ty, inBox);
      sp = lookOf(sp, 0.2, st(0.64, 0.74));
    } else if (plHolds > 0) {
      let hx = xP - 12;
      let hy = PL_HOLD.y;
      // b3: the letter held up as it is named a primary source
      if (A_KINDS[n]) hy -= 7 * bp(0.12, 0.22, 0.48);
      // b6: out across the trunk's corner, into the historian's hand
      if (A_CHECK[n]) {
        const out = st(0.46, 0.52);
        hx = lerp(hx, LETTER_PASS.pl, out);
        hy = lerp(hy, LETTER_PASS.y, out);
      }
      sp = hand(sp, xP, dP, 1, hx, hy, plHolds);
    }
    // the newspaper: down to the hatbox again, drawn out, up, turned, opened in both hands
    const paperHeld = n > PAPER_N ? 1 : 0;
    if (A_PAPER[n]) {
      sp = mixStance(sp, postureStill(CROUCH, t), st(0.12, 0.2) * (1 - st(0.32, 0.4)));
      const grip = st(0.46, 0.56);
      const tx = lerp(lerp(BOX.x - 2, PL_BOX + 8, st(0.26, 0.34)), NEWS_HANDS.front, grip);
      const ty = lerp(lerp(BOX.rim, 462, st(0.26, 0.34)), NEWS_HANDS.y, grip);
      sp = hand(sp, xP, dP, 1, tx, ty, st(0.15, 0.23));
      sp = hand(sp, xP, dP, -1, NEWS_HANDS.back, NEWS_HANDS.y, grip);
      sp = lookOf(sp, 0.18, st(0.6, 0.7) * (1 - st(0.82, 0.92)));
    } else if (paperHeld) {
      // held open; lowered a little at ease under the quotation
      const low = A_REST[n] ? 4 * st(0.05, 0.3) : 0;
      sp = hand(sp, xP, dP, 1, NEWS_HANDS.front, NEWS_HANDS.y + low, 1);
      sp = hand(sp, xP, dP, -1, NEWS_HANDS.back, NEWS_HANDS.y + low, 1);
    }
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the historian, behind the trunk ─────────────────────────────────────
    const wh = legsOf(carrySource(cv, 4, n, TH_X0), TH_LEGS[n], b, L);
    const xH = carry(cv, 4, n, wh.x, wh.x, 1);
    const dH = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, 1), TH_TURN[n], b, L), 1);
    let sh = bodyOf(wh, TH_P, n, t, b);
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived; then a hand out to the book, and — turned —
      // to the letter: two sources
      const after = wh.arrive / L;
      sh = hand(sh, xH, dH, 1, xH + 5 * dH, GROUND - 76, bp(after + 0.01, after + 0.06, after + 0.12));
      // from the book straight across to the letter, not dropped between them (AR5)
      sh = hand(sh, xH, dH, 1, lerp(xH - 20, xH + 20, st(0.83, 0.89)), 446, st(0.72, 0.77) * (1 - st(0.93, 0.99)));
    }
    if (A_KINDS[n]) {
      // "primary": a hand open to the letter; "secondary": turned, a hand to the book
      sh = hand(sh, xH, dH, 1, xH + 21, 444, bp(0.1, 0.2, 0.47));
      sh = hand(sh, xH, dH, 1, xH - 21, 444, bp(0.6, 0.7, 0.96));
    }
    if (A_CHECK[n]) {
      // the book taken across the trunk's left corner and set on the lid; turned, the
      // letter taken across the right corner and set down on the leaflet's other side;
      // and then he looks up to the shelf
      const book = st(0.1, 0.16) * (1 - st(0.28, 0.34));
      const down = st(0.2, 0.27);
      sh = hand(sh, xH, dH, 1, lerp(BOOK_PASS.th, BOOK_LID.x + 7, down), lerp(BOOK_PASS.y, BOOK_LID.y + 1, down), book);
      const letter = st(0.46, 0.52) * (1 - st(0.64, 0.7));
      const set = st(0.56, 0.63);
      sh = hand(sh, xH, dH, 1, lerp(LETTER_PASS.th, LETTER_LID.x - 6, set), lerp(LETTER_PASS.y, LETTER_LID.y + 1, set), letter);
      sh = lookOf(sh, -0.24, st(0.74, 0.84));
      sh = hand(sh, xH, dH, 1, xH + 20, 434, bp(0.76, 0.86, 0.98));
    }
    const prevH = carryFrom(heldH, n, hHold(TH_P[p], t));
    const figH = keepHeld(heldH, wh.walking ? mixKeepLegs(prevH, sh, tr) : mixStance(prevH, sh, tr));

    // ── the things that change hands ────────────────────────────────────────
    // bookT    0 hers · 1 his · 2 on the lid
    // letterT  0 in the hatbox · 1 the plain man's · 2 the historian's · 3 on the lid
    // newsT    0 in the hatbox · 1 in the plain man's hands
    const bookNow = n < CHECK_N ? 0 : n === CHECK_N ? st(0.16, 0.19) + st(0.26, 0.29) : 2;
    const openNow = A_BOAST[n] ? 1 - st(0.86, 0.96) : 0;
    const letterNow = n < LETTER_N ? 0 : n === LETTER_N ? st(0.27, 0.3)
      : n < CHECK_N ? 1 : n === CHECK_N ? 1 + st(0.52, 0.55) + st(0.62, 0.65) : 3;
    const letterO = n < LETTER_N ? 0 : n === LETTER_N ? st(0.29, 0.36) : 1;
    const unfoldNow = n < LETTER_N ? 0 : n === LETTER_N ? st(0.56, 0.66) : 1;
    const newsNow = n < PAPER_N ? 0 : n === PAPER_N ? st(0.23, 0.26) : 1;
    const newsO = n < PAPER_N ? 0 : n === PAPER_N ? st(0.25, 0.31) : 1;
    const gripNow = n < PAPER_N ? 0 : n === PAPER_N ? st(0.46, 0.56) : 1;
    const openNews = n < PAPER_N ? 0 : n === PAPER_N ? st(0.5, 0.6) : 1;
    const cornerNow = n < PAPER_N ? 1 : n === PAPER_N ? 1 - st(0.22, 0.28) : 0;
    const dustNow = A_LETTER[n] ? bp(0.28, 0.33, 0.6) : A_PAPER[n] ? bp(0.24, 0.3, 0.58) : 0;
    const glintNow = A_PRINTED[n] ? st(0.08, 0.36) : 0;

    return {
      bn: pose(figB, xB, GROUND, K, dB, 1),
      pl: pose(figP, xP, GROUND, K, dP, 1),
      th: pose(figH, xH, GROUND, K, dH, 1),
      dB, dP, dH,
      bookT: carry(cv, 6, n, bookNow, bookNow, tr),
      open: carry(cv, 7, n, openNow, openNow, tr),
      letterT: carry(cv, 8, n, letterNow, letterNow, tr),
      letterO: carry(cv, 9, n, letterO, letterO, tr),
      unfold: carry(cv, 10, n, unfoldNow, unfoldNow, tr),
      newsT: carry(cv, 11, n, newsNow, newsNow, tr),
      newsO: carry(cv, 12, n, newsO, newsO, tr),
      grip: carry(cv, 13, n, gripNow, gripNow, tr),
      openNews: carry(cv, 14, n, openNews, openNews, tr),
      corner: carry(cv, 15, n, cornerNow, cornerNow, tr),
      dust: dustNow,
      glint: glintNow,
      q1: carry(cv, 16, n, FIRST[p], FIRST[n], tr),
      q2: carry(cv, 17, n, SETTLE[p], SETTLE[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={ROOF_ART} tone={TONE} />
      <ObjectArt parts={GABLE_ART} tone={TONE} />
      <ObjectArt parts={WINDOW_ART} tone={TONE} />
      <ObjectArt parts={BEAMS_ART} tone={TONE} />
      <ObjectArt parts={DOOR_ART} tone={TONE} />
      {/* drawn in lessonart/lessons/hist2.mjs */}
      <LessonPicture name="hist2-shelf" />
      <Reactor kind="shake" on={picked === 'copy'} cx={COPY.x} cy={COPY.y}>
        <LessonPicture name="hist2-copy" />
      </Reactor>
      <Reactor kind="swing" on={picked === 'portrait'} cx={PORTRAIT.x} cy={PORTRAIT.y - 18}>
        <LessonPicture name="hist2-portrait" />
      </Reactor>
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DH} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      <LessonPicture name="hist2-trunk" />
      <LessonPicture name="hist2-leaflet" />
      <LessonPicture name="hist2-hatback" />
      <LessonPicture name="hist2-bundle" />
      <Corner S={SCENE} popped={picked === 'newspaper'} />
      <LessonPicture name="hist2-hatfront" />
      <LessonPicture name="hist2-hatlid" />
      <Dust S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="crowd" wear={[]} />
      <Goods S={SCENE} DB={DB} DP={DP} DH={DH} />
      {on(FIRST) ? <SourceTargets picked={picked} onPick={onPick} live={FIRST[i] === 1} S={SCENE} /> : null}
      {on(SETTLE) ? <SettleTargets picked={picked} onPick={onPick} live={SETTLE[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the newspaper's corner in the hatbox, and the dust when something comes out ─

function Corner({ S, popped }: { S: SharedValue<any>; popped: boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.corner }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <Reactor kind="rise" on={popped} cx={CORNER.x} cy={CORNER.y}>
        <LessonPicture name="hist2-corner" />
      </Reactor>
    </Animated.View>
  );
}

const MOTES = [[-8, -4, 3.4], [-2, -9, 2.6], [5, -6, 3], [10, -11, 2.2], [0, -14, 2]] as const;
function Dust({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: 0.85 * S.value.dust,
    transform: [{ translateY: -8 * S.value.dust }, { scale: 0.7 + 0.5 * S.value.dust }],
  }));
  return (
    <Animated.View style={[styles.dust, st]} pointerEvents="none">
      {MOTES.map(([x, y, r], k) => (
        <View key={k} style={[styles.mote, { left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r }]} />
      ))}
    </Animated.View>
  );
}

// ── the book, the letter and the newspaper, in hands and on the lid ──────────

type Pt = { x: number; y: number; o: number; sx: number; sy: number };
function Rider({ at, children, lift }: { at: SharedValue<Pt>; children: ReactNode; lift?: boolean }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { scaleX: at.value.sx }, { scaleY: at.value.sy }],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}

const wrist = (w: SharedValue<Bundle>, k: 'wrR' | 'wrL') => {
  'worklet';
  const v = w.value[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
};

function Goods({ S, DB, DP, DH }: {
  S: SharedValue<any>; DB: SharedValue<Bundle>; DP: SharedValue<Bundle>; DH: SharedValue<Bundle>;
}) {
  // The book: held by its near edge (7 units on, the way the holder faces), or open in
  // both her hands, or standing on the lid.
  const bookP = useDerivedValue<Pt>(() => {
    const u = S.value.bookT;
    const bh = wrist(DB, 'wrR');
    const bl = wrist(DB, 'wrL');
    const hh = wrist(DH, 'wrR');
    const op = S.value.open;
    const hers = { x: lerp(bh.x + 7 * S.value.dB, (bh.x + bl.x) / 2, op), y: lerp(bh.y - 1, (bh.y + bl.y) / 2 - 1, op) };
    const his = { x: hh.x + 7 * S.value.dH, y: hh.y - 1 };
    if (u <= 1) return { x: lerp(hers.x, his.x, u), y: lerp(hers.y, his.y, u), o: 1, sx: 1, sy: 1 };
    return { x: lerp(his.x, BOOK_LID.x, u - 1), y: lerp(his.y, BOOK_LID.y, u - 1), o: 1, sx: 1, sy: 1 };
  });
  const shut = useDerivedValue<Pt>(() => ({ ...bookP.value, o: 1 - S.value.open }));
  const opened = useDerivedValue<Pt>(() => ({ ...bookP.value, o: S.value.open }));
  const glint = useAnimatedStyle(() => ({
    opacity: S.value.glint > 0.01 && S.value.glint < 0.99 ? 0.9 : 0,
    transform: [{ translateX: -14 + 28 * S.value.glint }, { rotate: '28deg' }],
  }));
  // The letter: out of the hatbox in the plain man's hand, across into the historian's,
  // and down on the lid. Folded small until he opens it.
  const letterP = useDerivedValue<Pt>(() => {
    const u = S.value.letterT;
    const ph = wrist(DP, 'wrR');
    const hh = wrist(DH, 'wrR');
    const his = { x: hh.x + 6 * S.value.dH, y: hh.y - 1 };
    const pl = { x: ph.x + 6 * S.value.dP, y: ph.y - 1 };
    const sy = 0.4 + 0.6 * S.value.unfold;
    if (u <= 1) return { x: lerp(BOX.x, pl.x, u), y: lerp(BOX.rim + 4, pl.y, u), o: S.value.letterO, sx: 1, sy };
    if (u <= 2) return { x: lerp(pl.x, his.x, u - 1), y: lerp(pl.y, his.y, u - 1), o: 1, sx: 1, sy };
    return { x: lerp(his.x, LETTER_LID.x, u - 2), y: lerp(his.y, LETTER_LID.y, u - 2), o: 1, sx: 1, sy };
  });
  // The newspaper: out of the hatbox folded in his front hand, then opened between both.
  const newsP = useDerivedValue<Pt>(() => {
    const ph = wrist(DP, 'wrR');
    const pb = wrist(DP, 'wrL');
    const g = S.value.grip;
    const one = { x: ph.x + 5 * S.value.dP, y: ph.y - 2 };
    const two = { x: (ph.x + pb.x) / 2, y: (ph.y + pb.y) / 2 - 2 };
    const u = S.value.newsT;
    const held = { x: lerp(one.x, two.x, g), y: lerp(one.y, two.y, g) };
    return {
      x: lerp(CORNER.x, held.x, u), y: lerp(CORNER.y + 4, held.y, u), o: S.value.newsO,
      sx: 0.4 + 0.6 * S.value.openNews, sy: 1,
    };
  });
  const words = useAnimatedStyle(() => ({ opacity: clamp01((S.value.openNews - 0.7) / 0.3) }));
  return (
    <>
      <Rider at={shut}>
        <LessonPicture name="hist2-book" />
        <View style={styles.glintClip}>
          <Animated.View style={[styles.glint, glint]} />
        </View>
      </Rider>
      <Rider at={opened}>
        <LessonPicture name="hist2-bookopen" />
      </Rider>
      <Rider at={letterP} lift>
        <LessonPicture name="hist2-letter" />
      </Rider>
      <Rider at={newsP} lift>
        <LessonPicture name="hist2-news" />
        <Animated.View style={[styles.mastBox, words]}>
          <Text style={styles.mast}>1916</Text>
        </Animated.View>
      </Rider>
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the book, the leaflet and the letter, each with the year it was made. The letter is the primary source. */
const SOURCE_Q = [
  { id: 'book', year: '1985', left: BN + 14 - 14, top: 446, w: 28, h: 38, correct: false },
  { id: 'leaflet', year: '2010', left: LEAFLET.x - 14, top: 450, w: 28, h: 36, correct: false },
  { id: 'letter', year: '1916', left: PL - 18 - 14, top: 446, w: 28, h: 38, correct: true },
];
function SourceTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {SOURCE_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.yearCell}>
            <Tag kind={q.correct ? 'hop' : 'shake'} on={picked === q.id}>
              <View style={styles.year}>
                <Text style={styles.yearText}>{q.year}</Text>
              </View>
            </Tag>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/** Q2: the newspaper's corner, the second copy of the book, the portrait. A third source from the time settles it. */
const SETTLE_Q = [
  { id: 'newspaper', left: CORNER.x - 10, top: CORNER.y - 9, w: 20, h: 16, r: 6, correct: true },
  { id: 'copy', left: COPY.x - 11, top: COPY.y - 13, w: 22, h: 25, r: 3, correct: false },
  { id: 'portrait', left: PORTRAIT.x - 18, top: PORTRAIT.y - 22, w: 36, h: 42, r: 3, correct: false },
];
function SettleTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {SETTLE_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

// ── things that answer PHYSICALLY when picked: the right one pops up or bounces and
// settles with a squash, a wrong one shudders or swings on its nail and comes to rest ──
type Kind = 'shake' | 'swing' | 'rise' | 'hop';
function physical(kind: Kind, v: number) {
  'worklet';
  const k = 1 - v;
  if (v <= 0 || v >= 1) return { x: 0, y: 0, r: 0, sx: 1, sy: 1 };
  if (kind === 'shake') return { x: 3 * Math.sin(v * Math.PI * 8) * k, y: 0, r: 0.12 * Math.sin(v * Math.PI * 8) * k, sx: 1, sy: 1 };
  if (kind === 'swing') return { x: 0, y: 0, r: 0.3 * Math.sin(v * Math.PI * 5) * k * k, sx: 1, sy: 1 };
  if (kind === 'rise') {
    // slides up out of the box, overshoots a little and stays proud of it
    const e = 1 - Math.pow(1 - Math.min(1, v * 1.5), 2);
    return { x: 0, y: -7 * e - 2 * Math.sin(v * Math.PI) * k, r: 0, sx: 1, sy: 1 };
  }
  // hop: two bounces, each lower than the last, a squash on every landing
  const h = Math.abs(Math.sin(v * Math.PI * 2)) * 7 * k * k;
  const sq = 1 - 0.2 * Math.max(0, 1 - h / 1.5) * k;
  return { x: 0, y: -h, r: 0, sx: 2 - sq, sy: sq };
}
function usePlay(on: boolean, kind: Kind) {
  const u = useSharedValue(0);
  useEffect(() => {
    u.value = 0;
    if (on) u.value = withTiming(1, { duration: kind === 'hop' ? 900 : kind === 'rise' ? 700 : 750, easing: Easing.linear });
  }, [on, kind, u]);
  return u;
}
/** A scene-sized layer turning about (cx, cy): the picture inside keeps its scene coordinates. */
function Reactor({ kind, on, cx, cy, children }: { kind: Kind; on: boolean; cx: number; cy: number; children: ReactNode }) {
  const u = usePlay(on, kind);
  const st = useAnimatedStyle(() => {
    const p = physical(kind, u.value);
    return { transform: [{ translateX: p.x }, { translateY: p.y }, { rotate: `${p.r}rad` }, { scaleX: p.sx }, { scaleY: p.sy }] };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: `${cx}px ${cy}px` }, st]}
      pointerEvents="none"
    >
      {children}
    </Animated.View>
  );
}
/** A year tag on its target: it hops when it is the right one, shudders when it is not. */
function Tag({ kind, on, children }: { kind: Kind; on: boolean; children: ReactNode }) {
  const u = usePlay(on, kind);
  const st = useAnimatedStyle(() => {
    const p = physical(kind, u.value);
    return { transform: [{ translateX: p.x }, { translateY: p.y }, { rotate: `${p.r}rad` }, { scaleX: p.sx }, { scaleY: p.sy }] };
  });
  return <Animated.View style={st}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  onTop: { zIndex: 2 },
  glintClip: { position: 'absolute', left: -7, top: -10, width: 14, height: 20, overflow: 'hidden' },
  glint: { position: 'absolute', left: 4, top: -6, width: 2.4, height: 32, backgroundColor: PLATE_FACE },
  mastBox: { position: 'absolute', left: -15, top: -12.4, width: 30, height: 10, alignItems: 'center', justifyContent: 'center' },
  mast: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false,
  },
  dust: { position: 'absolute', left: BOX.x, top: BOX.rim - 4, width: 0, height: 0 },
  mote: { position: 'absolute', backgroundColor: NATURAL.newsprint.base, borderWidth: 0.6, borderColor: NATURAL.newsprint.shade },
  clear: { flexGrow: 1 },
  yearCell: { flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 1 },
  year: {
    width: 26, height: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 4, borderWidth: 1, borderColor: INK,
    boxShadow: '0 2px 0 ' + lipOf(TONE),
  },
  yearText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false,
  },
});

export function Hist2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Hist2Scene} band={[306, 514]} camera={CAM} />;
}
