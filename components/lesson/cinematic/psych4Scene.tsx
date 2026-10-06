import { useEffect, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './psych4Script';
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
import { reachHandTo, sipHandAt, sipTilt, sipHead } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, shelterFrame, shelterGlass, timetable, stopNotice, takeawayCup, TAKEAWAY_GRIP,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// psychology-foundations-4, "Why We Follow the Crowd" — A BUS STOP ON A HIGH STREET:
// A GLASS SHELTER, A YELLOW NOTICE TIED ROUND THE POST, AND A TIMETABLE.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates. A
// commuter (the bun) waits at her usual stop with her morning coffee; a passer-by (the
// cap) joins her because somebody is waiting; the psychologist (the top hat) reads the
// notice neither of them read, and names what they did.
//
//   b0   the commuter, alone under the shelter, leans out to look down the road for the
//        bus, then glances at her watch, her coffee held at her chest.
//   b1   the passer-by walks in from the left and stops beside her; on "the right stop"
//        he opens a hand to her. She nods along.
//   b2   the psychologist walks in from the right to the post and the two of them turn
//        to him; he tips his hat and taps the yellow notice on "closed all week".
//   b3   the passer-by puts a hand to his chest ("I'm sorry"), then opens it to her
//        ("I saw her waiting").
//   b4   the psychologist points at the passer-by, then at the commuter, then opens a
//        hand on "social proof".
//   b5   Q1: the woman waiting, the yellow notice and the timetable — tap one. Everyone
//        stands still.
//   b6   he turns to the café up the street and opens a hand to it; on "coffee" she
//        lifts her cup an inch.
//   b7   she turns to the passer-by, steps up to him and nudges his arm; he rocks back.
//   b8   the psychologist taps the notice twice, firmly, on "nobody checks", and opens a
//        hand to the two of them; she turns back to him and steps back a pace.
//   b9   Q2: the yellow notice, the timetable and the advert — tap one.
//   b10  the passer-by turns, points round the corner, walks a few steps left and turns
//        back to wave them on; the commuter turns and follows him.
//   b11  the quotation; she sips her coffee, everyone at ease.
//
// COMPOSITION, in stage units. The shelter 10–250 × 366–500: a roof slab 366–378, posts
// at 12 · 72 · 132 · 192 · 248, four bays of 60. The first bay is the lit advert case
// 14–70 × 384–488; the last bay holds the timetable frame 203–241 × 418–466 at eye
// level. The stop pole stands at 284 (its flag out to the right, 287–319 × 354–378) with
// the yellow notice tied round it 262–306 × 420–452, its word in the upper half and its
// foot at the psychologist's reach (his shoulder at 326, 454: the tap at 305, 449 is 21
// away). The café's white front 344–400 × 330–500 runs off the stage on the right, its
// red awning at 386–418. The passer-by
// stands at 98 and the commuter at 158 — 134 when she steps up to nudge him, 150 after — (60 apart, the advert and the timetable both clear
// of them); the psychologist at 328, clear of the notice's word. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, listeners nod along (N21), and no hand moves unless the scene moves it
// (AP18). The coffee rides her wrist by its sleeve (AR2, AR7.4).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('psychology');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, psychology-foundations-4), except b10, whose walk and
 * wave run on a little after the line.
 */
const LINES = [4.51, 3.49, 4.52, 4.2, 6.12, 0, 6.02, 5.02, 7.16, 0, 4.24, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_WAIT = is('wait');
const A_JOIN = is('join');
const A_NOTICE = is('notice');
const A_COPIED = is('copied');
const A_PROOF = is('proof');
const A_USEFUL = is('useful');
const A_TEAM = is('team');
const A_WRONG = is('wrong');
const A_WALK = is('walk');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.copy ? 1 : 0));
const Q2 = BEATS.map((b) => (b.sure ? 1 : 0));
const N_TEAM = A_TEAM.indexOf(1);
const N_WALK = A_WALK.indexOf(1);

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const C_X0 = -24;
const C_X = 98;
const C_OUT = 40;
const B_X = 158;
const B_NUDGE = 134;
/** …and a step back toward the psychologist as she turns to him on b8. */
const B_BACK = 150;
const B_OUT = 88;
const P_X0 = 430;
const P_X = 328;
const CAP_LEGS: Track[] = BEATS.map((_, n) => (
  n === 0 ? [[0, C_X0]] : n < N_WALK ? [[0, C_X]] : n === N_WALK ? [[0.42, C_OUT]] : [[0, C_OUT]]
));
/** He faces her and the post; on b10 he turns to the corner to point and walk, and back to wave them on. */
const CAP_TURN: Track[] = BEATS.map((_, n) => (n === N_WALK ? [[0, 1], [0.06, -1], [0.76, 1]] : [[0, 1]]));
const BUN_LEGS: Track[] = BEATS.map((_, n) => (
  n < N_TEAM ? [[0, B_X]] : n === N_TEAM ? [[0.08, B_NUDGE]] : n === N_TEAM + 1 ? [[0.12, B_BACK]]
    : n < N_WALK ? [[0, B_BACK]] : n === N_WALK ? [[0.62, B_OUT]] : [[0, B_OUT]]
));
/**
 * She looks down the road (left) for the bus, and at the passer-by as he walks up from
 * there; she turns to the psychologist when he arrives, to the passer-by for the nudge
 * and back, and to the corner to follow him.
 */
const BUN_TURN: Track[] = BEATS.map((_, n) => (
  n < 2 ? [[0, -1]] : n === 2 ? [[0, -1], [0.3, 1]] : n < N_TEAM ? [[0, 1]]
    : n === N_TEAM ? [[0, 1], [0.03, -1]] : n === N_TEAM + 1 ? [[0, -1], [0.1, 1]]
      : n < N_WALK ? [[0, 1]] : n === N_WALK ? [[0, 1], [0.55, -1]] : [[0, -1]]
));
const PSY_LEGS: Track[] = BEATS.map((_, n) => (n < 2 ? [[0, P_X0]] : [[0, P_X]]));
/** He faces the two of them; on b6 he turns to the café behind him, and back. */
const PSY_TURN: Track[] = BEATS.map((_, n) => (A_USEFUL[n] ? [[0, -1], [0.2, 1], [0.84, -1]] : [[0, -1]]));
/** What each is doing with his body: talking while he speaks, nodding while he listens. */
const BUN_P = [TALK, NOD, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, LISTEN];
const CAP_P = [LISTEN, TALK, NOD, TALK, NOD, NOD, NOD, NOD, NOD, NOD, TALK, NOD, LISTEN];
const PSY_P = [LISTEN, LISTEN, EXPLAIN, NOD, EXPLAIN, NOD, EXPLAIN, NOD, EXPLAIN, NOD, NOD, NOD, LISTEN];

// ── the street ───────────────────────────────────────────────────────────────
const NOTICE = { left: 262, top: 420, w: 44, h: 32 };
/** Where his finger meets the notice: its near edge, at his reach. */
const NOTICE_TAP = { x: 305, y: 449 };
const CAFE_WINDOW = { x: 372, y: 448 };
/** The coffee, held round its sleeve at her chest (her own frame: forward, up). */
const CUP_HOLD = { x: 10, y: -15 };

const FRAME_ART = shelterFrame(130, 433, 240, 134);
const GLASS_ART = shelterGlass(130, 433, 240, 134);
// The advert, the café and the stop pole are DRAWINGS (LESSON_RULES AM13), baked from
// scripts/lib/lessonart/lessons/psych4.mjs at the boxes their shapes used to take:
// psych4-advert 14–70 × 384–488, psych4-cafe 343–402 × 330–500, psych4-pole 278–320 × 352–500.
const TIMES_ART = timetable(222, 442, 38, 48);
const NOTICE_ART = stopNotice(NOTICE.left + NOTICE.w / 2, NOTICE.top + NOTICE.h / 2, NOTICE.w, NOTICE.h);
// The cup is drawn about the point it is held by, its sleeve.
const CUP_ART = takeawayCup(
  TAKEAWAY_GRIP.w / 2 - TAKEAWAY_GRIP.x, TAKEAWAY_GRIP.h / 2 - TAKEAWAY_GRIP.y, TAKEAWAY_GRIP.w, TAKEAWAY_GRIP.h,
);

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
/** A hand held in the figure's own frame (forward, up), so it turns with her (AR7.2). */
function holdAt(s: Stance, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const cur = which > 0 ? s.fistR : s.fistL;
  const m = { x: lerp(cur.x, lx, w), y: lerp(cur.y, ly, w) };
  return which > 0 ? { ...s, fistR: m } : { ...s, fistL: m };
}

/**
 * THE THINGS ANSWER BACK. When a question is answered the object itself replies, on the
 * answer clock (`qv`, 0→1 over 780ms): the true one POPS — a lift and a swell that
 * overshoots and settles — and a wrong one the reader took SHAKES, a damped rattle that
 * dies away. Both end at rest, so nothing is left moved when the beat changes.
 */
function popOf(a: number) {
  'worklet';
  const up = Math.sin(Math.PI * clamp01(a / 0.42));
  const settle = Math.sin(Math.PI * clamp01((a - 0.42) / 0.36));
  return { s: 1 + 0.12 * up - 0.035 * settle, y: -4 * up };
}
function shakeOf(a: number) {
  'worklet';
  const u = clamp01(a / 0.8);
  return Math.sin(u * Math.PI * 6) * (1 - u) * (1 - u);
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn, from WHERE HE
 * IS ON SCREEN (`src`, out of the carry), so a tap mid-walk cannot put him anywhere in
 * one frame (group L).
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
  return { x, x0, x1, u: ease01(u), walking };
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

const CAM = followMoves(BUN_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('psychology'));

export default function Psych4Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldC = useHeld();
  const heldP = useHeld();
  const cv = useCarry(11);
  const on = useLinger(i);
  // Which thing the reader took on each question: kept, so the reply can be played on it.
  const pk1 = useSharedValue('');
  const pk2 = useSharedValue('');
  useEffect(() => {
    if (picked === null) return;
    if (Q1[i]) pk1.value = picked;
    if (Q2[i]) pk2.value = picked;
  }, [picked, i, pk1, pk2]);
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

    // ── the commuter (the bun) ──────────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 0, n, B_X), BUN_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, -1), BUN_TURN[n], b, L), 1);
    // b0: she leans out to look down the road, and straightens to glance at her watch
    const leanNow = A_WAIT[n] ? st(0.04, 0.2) * (1 - st(0.46, 0.56)) : 0;
    const lean = carry(cv, 2, n, leanNow, leanNow, tr);
    // b11: a sip of her coffee, in the quiet under the quotation (AR3)
    const sipNow = A_REST[n] ? st(0.16, 0.3) * (1 - st(0.46, 0.6)) : 0;
    const sip = carry(cv, 3, n, sipNow, sipNow, tr);
    let sb = bodyOf(wb, BUN_P, n, t, b);
    sb = { ...sb, tilt: sb.tilt - 0.24 * lean, neck: sb.neck + 0.12 * lean };
    // the coffee, in her left hand at her chest the whole lesson (AR6), lifted an inch on
    // "coffee" (b6) and to her lips for one sip (b11)
    const lift = A_USEFUL[n] ? bp(0.74, 0.82, 0.96) : 0;
    sb = holdAt(sb, -1, CUP_HOLD.x, CUP_HOLD.y - 7 * lift, 1);
    if (sip > 0) {
      const cupHand = sipHandAt(sb, { x: xB, groundY: GROUND, k: K, dir: dB < 0 ? -1 : 1 });
      sb = hand(sb, xB, dB, -1, cupHand.x, cupHand.y, sip);
      sb = sipHead(sb, sip);
    }
    // b0: a glance at her watch on "Everyone must be on holiday" — the wrist raised in
    // front of her and her head bowed to it
    const watch = A_WAIT[n] ? bp(0.5, 0.58, 0.9) : 0;
    if (watch > 0) {
      sb = hand(sb, xB, dB, 1, xB + 13 * dB, 446, watch);
      sb = { ...sb, neck: sb.neck - 0.22 * watch };
    }
    // b7: up to him and a nudge at his arm on "teamwork"
    if (A_TEAM[n]) sb = hand(sb, xB, dB, 1, C_X + 8, 456, bp(0.6, 0.68, 0.84));
    const prevB = carryFrom(heldB, n, hHold(BUN_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the passer-by (the cap) ─────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 4, n, C_X0), CAP_LEGS[n], b, L);
    const xC = carry(cv, 4, n, wc.x, wc.x, 1);
    const dC = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, 1), CAP_TURN[n], b, L), 1);
    // b7: he rocks back a little at her nudge
    const rockNow = A_TEAM[n] ? bp(0.66, 0.72, 0.9) : 0;
    const rock = carry(cv, 6, n, rockNow, rockNow, tr);
    let sc = bodyOf(wc, CAP_P, n, t, b);
    sc = { ...sc, tilt: sc.tilt + 0.14 * rock };
    // b1: once he has stopped beside her, a hand opened to her on "the right stop"
    if (A_JOIN[n]) sc = hand(sc, xC, dC, 1, xC + 20 * dC, 452, bp(0.72, 0.8, 0.98));
    // b3: a hand to his chest on "I'm sorry", then opened to her on "saw her waiting"
    if (A_COPIED[n]) {
      sc = hand(sc, xC, dC, 1, xC + 6 * dC, 450, bp(0.02, 0.1, 0.34));
      sc = hand(sc, xC, dC, 1, xC + 21 * dC, 452, bp(0.66, 0.76, 0.97));
    }
    // b10: turned to the corner, a point down the street; then, turned back, a hand
    // opened to the two of them ("I'll walk you both there")
    if (A_WALK[n]) {
      sc = hand(sc, xC, dC, 1, xC - 34, 444, bp(0.14, 0.22, 0.4));
      sc = hand(sc, xC, dC, 1, xC + 20 * dC, 452, bp(0.8, 0.88, 1));
    }
    const prevC = carryFrom(heldC, n, hHold(CAP_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the psychologist (the top hat) ──────────────────────────────────────
    const wp = legsOf(carrySource(cv, 7, n, P_X0), PSY_LEGS[n], b, L);
    const xP = carry(cv, 7, n, wp.x, wp.x, 1);
    const dP = carry(cv, 8, n, 0, faceOf(carrySource(cv, 8, n, -1), PSY_TURN[n], b, L), 1);
    let sp = bodyOf(wp, PSY_P, n, t, b);
    if (A_NOTICE[n]) {
      // the hat tipped once he has arrived, then the notice, on "closed all week"
      const after = moveTr(P_X0, P_X, TR) / L;
      sp = hand(sp, xP, dP, 1, xP + 5 * dP, GROUND - 76, bp(after + 0.02, after + 0.06, after + 0.17));
      sp = hand(sp, xP, dP, 1, NOTICE_TAP.x, NOTICE_TAP.y, bp(0.76, 0.82, 0.96));
    }
    // b4: the passer-by ("they copy"), the commuter ("what others are doing"), and an
    // open hand on "social proof"
    if (A_PROOF[n]) {
      sp = hand(sp, xP, dP, 1, C_X, 452, bp(0.28, 0.34, 0.46));
      sp = hand(sp, xP, dP, 1, B_X, 452, bp(0.46, 0.52, 0.64));
      sp = hand(sp, xP, dP, 1, xP + 17 * dP, 452, bp(0.72, 0.8, 0.97));
    }
    // b6: turned to the café up the street, a hand opened to it on "café"
    if (A_USEFUL[n]) sp = hand(sp, xP, dP, 1, CAFE_WINDOW.x, CAFE_WINDOW.y, bp(0.38, 0.5, 0.78));
    // b8: two firm taps on the notice on "nobody checks", then a hand opened to them
    if (A_WRONG[n]) {
      const tap = bp(0.37, 0.41, 0.46) + bp(0.48, 0.52, 0.58);
      sp = hand(sp, xP, dP, 1, NOTICE_TAP.x, NOTICE_TAP.y, tap);
      sp = hand(sp, xP, dP, 1, xP + 22 * dP, 452, bp(0.72, 0.8, 0.96));
    }
    const prevP = carryFrom(heldP, n, hHold(PSY_P[p], t));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the things that move ───────────────────────────────────────────────
    const bun = pose(figB, xB, GROUND, K, dB, 1);
    const cap = pose(figC, xC, GROUND, K, dC, 1);
    const psy = pose(figP, xP, GROUND, K, dP, 1);
    const wB = wristOf(bun, 'wrL');

    // ── the replies: the notice swings out on its ties when it is the answer; a wrong
    // thing the reader took rattles in place ──────────────────────────────────
    const a = Q1[n] || Q2[n] ? qv.value : 0;
    const got = Q1[n] ? pk1.value : Q2[n] ? pk2.value : '';
    const rattle = (id: string) => {
      'worklet';
      return got === id && a > 0 ? shakeOf(a) : 0;
    };
    const pop = Q2[n] && got !== '' ? popOf(a) : { s: 1, y: 0 };
    const swing = Q2[n] && got !== '' ? Math.sin(Math.PI * 3 * clamp01(a / 0.9)) * (1 - clamp01(a / 0.9)) : 0;

    return {
      bun, cap, psy,
      // the coffee rides her wrist by its sleeve, and tips toward her face as she drinks
      cup: { x: wB.x, y: wB.y, o: 1, r: sipTilt(sip, dB) },
      notice: { s: pop.s, y: pop.y, r: 9 * swing + 7 * rattle('notice') },
      times: { x: 2.6 * rattle('timetable') },
      advert: { x: 2.2 * rattle('advert') },
      q1: carry(cv, 9, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 10, n, Q2[p], Q2[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bun);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.psy);
  const cupP = useDerivedValue<At>(() => SCENE.value.cup);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <LessonPicture name="psych4-cafe" />
      <View style={styles.cafeSign} pointerEvents="none">
        <Text style={styles.cafeText}>CAFÉ</Text>
      </View>
      <ObjectArt parts={GLASS_ART} tone={TONE} style={styles.glass} />
      <Shake S={SCENE} k="advert" origin="42px 436px">
        <LessonPicture name="psych4-advert" />
      </Shake>
      <Shake S={SCENE} k="times" origin="222px 442px">
        <ObjectArt parts={TIMES_ART} tone={TONE} />
      </Shake>
      <ObjectArt parts={FRAME_ART} tone={TONE} />
      <LessonPicture name="psych4-pole" />
      <Notice S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="lead" wear={BY_ID.stroller.pieces} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="crowd" wear={BY_ID.bun.pieces} />
      <Rider at={cupP} art={CUP_ART} />
      {/* cast: tophat */}
      <Stickman D={DP} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {on(Q1) ? <CopyTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <SureTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the things that reply to an answer ──────────────────────────────────────

/** A thing that rattles sideways when the reader takes it and it is wrong. */
function Shake({ S, k, origin, children }: { S: SharedValue<any>; k: 'advert' | 'times'; origin: string; children: ReactNode }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value[k].x }, { rotate: `${0.8 * S.value[k].x}deg` }] }));
  return <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: origin }, st]} pointerEvents="none">{children}</Animated.View>;
}

/** The yellow notice and its word: it swings on its ties and swells when it is the answer. */
function Notice({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.notice;
    return { transform: [{ translateY: v.y }, { rotate: `${v.r}deg` }, { scale: v.s }] };
  });
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { transformOrigin: `${NOTICE.left + NOTICE.w / 2}px ${NOTICE.top}px` }, st]}
      pointerEvents="none"
    >
      <ObjectArt parts={NOTICE_ART} tone={TONE} />
      <View style={styles.notice} pointerEvents="none">
        <Text style={styles.noticeText}>CLOSED</Text>
      </View>
    </Animated.View>
  );
}

// ── a rider: a thing drawn about the point it is held by ───────────────────

type At = { x: number; y: number; o: number; r?: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof takeawayCup> }) {
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

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both questions are tapped ON THE STAGE (AP6), and each choice carries its name on a
 * small plate inside its target (AN1). No two live targets touch (AN4). The commuter's
 * and the notice's plates sit at the TOP of their targets — over her head, over the bare
 * pole above the notice — so neither covers her or the notice's word.
 */
type Q = {
  id: string; label: string; pw: number; left: number; top: number; w: number; h: number; correct: boolean; head?: boolean;
};
/** Q1: the woman waiting, the notice and the timetable. He copied the woman. */
const COPY_Q: Q[] = [
  { id: 'woman', label: 'WOMAN', pw: 48, left: 133, top: 395, w: 50, h: 105, correct: true, head: true },
  { id: 'notice', label: 'NOTICE', pw: 46, left: 260, top: 395, w: 50, h: 60, correct: false, head: true },
  { id: 'timetable', label: 'TIMETABLE', pw: 62, left: 190, top: 412, w: 64, h: 68, correct: false },
];
/** Q2: the notice, the timetable and the advert. The notice is the one that is up to date. */
const SURE_Q: Q[] = [
  { id: 'notice', label: 'NOTICE', pw: 46, left: 260, top: 395, w: 50, h: 60, correct: true, head: true },
  { id: 'timetable', label: 'TIMETABLE', pw: 62, left: 190, top: 412, w: 64, h: 68, correct: false },
  { id: 'advert', label: 'ADVERT', pw: 48, left: 10, top: 380, w: 64, h: 112, correct: false },
];
function CopyTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={COPY_Q} k="q1" />;
}
function SureTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={SURE_Q} k="q2" />;
}
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
          disabled={answered} sealAt={q.head ? 'br' : 'tr'}
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place}>
            <View style={[q.head ? styles.namePlateTop : styles.namePlate, { left: (q.w - q.pw) / 2, width: q.pw }]}>
              <Text style={styles.nameText}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/** A small plate's ledge: the house lip (stageSkin.lipOf) in proportion to a 12-unit plate. */
const PLATE_LIP = `inset 0px 1px 0px rgba(255, 255, 255, 0.9), 0px 2.2px 0px ${TONE.SHADE}, 0px 3.4px 0px rgba(26, 26, 26, 0.12)`;

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  glass: { opacity: 0.55 },
  // the café's name, in the awning's light lettering on its red fascia
  cafeSign: {
    position: 'absolute', left: 344, top: 386.5, width: 56, height: 13, alignItems: 'center', justifyContent: 'center',
  },
  cafeText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 10, letterSpacing: 1, color: NATURAL.awning.label,
    includeFontPadding: false,
  },
  // the notice's word, on its yellow face under the red band
  notice: {
    position: 'absolute', left: NOTICE.left, top: NOTICE.top + 6, width: NOTICE.w, height: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  noticeText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 10, letterSpacing: 0.3, color: NATURAL.noticeYellow.label,
    includeFontPadding: false,
  },
  place: { flexGrow: 1 },
  // a name plate is STRUCK, like every plate in the app (group AG): a white face with a
  // lit top edge, standing on a hard ledge of the lesson's shade
  namePlate: {
    position: 'absolute', bottom: 4, alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: 4.5, borderWidth: 1.2,
    borderColor: INK, paddingHorizontal: 3, boxShadow: PLATE_LIP,
  },
  namePlateTop: {
    position: 'absolute', top: 10, alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: 4.5, borderWidth: 1.2,
    borderColor: INK, paddingHorizontal: 3, boxShadow: PLATE_LIP,
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
});

export function Psych4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Psych4Scene} band={[306, 514]} camera={CAM} />;
}
