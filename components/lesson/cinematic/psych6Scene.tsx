import { useEffect, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './psych6Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, pillStyle } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, stageLin, bump } from './pace';
import {
  NATURAL, py6CabPink, py6CabRed, py6CabTeal, py6Pile, py6BearPurple, py6BearGreen, py6Phone, py6HandsetPink, py6HandsetBlue, py6HandsetGold,
  py6Stand, py6Duster, PY6_CAB, PY6_BEAR_GRIP, PY6_PHONE_GRIP, PY6_HANDSET_SCREEN, PY6_STAND_SHELVES,
  PY6_DUSTER_GRIP, type NaturalKey,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// psychology-foundations-6, "Why One More Go?" — A NEON ARCADE ON A SEASIDE PIER AT
// NIGHT: THREE CLAW MACHINES IN A ROW UNDER THE ARCADE'S FASCIA, THE SEA AND THE PIER
// RAIL BEHIND THEM, A FERRIS WHEEL TURNING ON THE NEXT PIER, AND A PHONE KIOSK'S STAND.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates. A
// player (the bun) works the claw of the pink machine; its owner (the plain mascot)
// stands on its other side with his duster, proud of it; a psychologist (the top hat)
// leans on the red machine next door.
//
//   b0   the lesson opens on the claw lifting the purple bear — and the bear slips out
//        and drops back on the heap ("So close!"). The claw trundles home; she pops a
//        coin in the slot and steers it back out over the bear ("Again").
//   b1   the owner polishes the pink machine's glass with his duster, two wipes, and
//        tucks the duster away.
//   b2   the psychologist leans on the red machine, taps its coin slot, then its prize
//        chute ("when a reward comes").
//   b3   Q1 — PICK THE MACHINE. The three toppers stop showing their names and light up
//        their rules: PRIZE NOW AND THEN · PRIZE EVERY GO · PRIZE EVERY TENTH GO. Tap a
//        machine. Answered, NOW AND THEN's bulbs race and its claw dances; a picked
//        EVERY GO coughs a prize into its flap and its neon goes dull; a picked TENTH GO
//        switches its bulbs off one by one.
//   b4   the psychologist holds a hand up ("a reward"), then points at her hand on the
//        stick; meanwhile she drops the claw — it closes on the bear, lifts it, carries
//        it home, opens, and the bear tumbles down the chute into the prize flap.
//   b5   she crouches, takes the bear out of the flap, holds it up high ("I won!") and
//        hugs it.
//   b6   the owner folds his arms and nods, pleased with himself.
//   b7   the psychologist takes his phone from his pocket, pulls down on its screen —
//        a new post pops in — and holds it up to her.
//   b8   Q2 — FIND IT IN YOUR POCKET. The kiosk's three demo phones wake: ALARM, FEED,
//        CALCULATOR. Tap one. Answered, the FEED pulls down, its spinner turns and a new
//        post pops in; a picked ALARM buzzes and shows 7:00 as ever; a picked
//        CALCULATOR flashes its = key and dims.
//   b9   she shifts the bear to one arm, looks at her own phone ("a claw machine I carry
//        around"), pockets it, turns for home and takes two steps — stops — takes out a
//        coin, turns back and walks back to the machine holding it up.
//   b10  the quotation: the coin goes in the slot, her hand goes on the stick, and the
//        claw heads for the green bear; the psychologist pockets his phone; the neon
//        blinks.
//
// COMPOSITION, in stage units. Band [272, 514]. The arcade's fascia 272–292 with
// AMUSEMENTS in pink neon and a row of bulbs under it; the night sky 292–412, a moon at
// 20, 322, stars, and a ferris wheel 196–256 × 332–392 turning on a far pier on the
// horizon (404–412); the sea 412–474 with the moon's path on it; the white pier rail
// 450–474; the deck 474–500. Three claw machines stand on the deck, 70 × 120 each
// (topper 380–406, glass 414–460, ledge 462–470, base 469–499), centred at 76, 176 and
// 276: pink (hers), red, teal. The phone kiosk's stand 315–399 × 348–500 with its three
// phones 74 × 34 at y 368, 410 and 452. The owner at 36 facing right, the player at 114
// facing left at her stick, the psychologist at 222 facing left against the red machine.
// The figures stand IN the gaps between the machines, so the glass beside each head
// stays in view.
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, listeners nod along (N21), and no hand moves unless the scene moves it
// (AP18). The duster, the phones, the coin and the bear ride their wrists by their grips
// (AR2, AR7.4); the bear rides the claw by its head.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('psychology');
const { RULE } = TONE;
const N = NATURAL;
const TR = 0.85;
/** 78 units of figure in a 242-unit band: 32%, under check:scale's 38%. */
const K = K_FIG * 0.76;
const G = 500;

/** Seconds each beat's action is paced over: the voiced line (lib/narration/manifest.ts). */
const LINES = [4.54, 4.68, 4.53, 0, 7.84, 3.1, 4.95, 4.93, 0, 5.21, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding, arms folded.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const FOLD = 161;
const CROUCH = 13;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_POLISH = is('polish');
const A_TRAP = is('trap');
const A_REIN = is('reinforce');
const A_WIN = is('win');
const A_SMUG = is('smug');
const A_PHONE = is('phone');
const A_ONEMORE = is('onemore');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.machine ? 1 : 0));
const Q2 = BEATS.map((b) => (b.pocket ? 1 : 0));
const N_Q1 = Q1.indexOf(1);
const N_Q2 = Q2.indexOf(1);
const N_REIN = A_REIN.indexOf(1);
const N_WIN = A_WIN.indexOf(1);
const N_PHONE = A_PHONE.indexOf(1);
const N_ONE = A_ONEMORE.indexOf(1);
const N_REST = A_REST.indexOf(1);
const N_POLISH = A_POLISH.indexOf(1);

// ── the machines ──────────────────────────────────────────────────────────────
type Track = readonly (readonly number[])[];
const MX = [76, 176, 276];
const CAB_TOP = 380;
const CW = PY6_CAB.w;
const CH = PY6_CAB.h;
/** A cabinet's own units, on the stage. */
function ux(j: number, u: number) {
  'worklet';
  return MX[j] - CW / 2 + u;
}
function uy(u: number) {
  'worklet';
  return CAB_TOP + u;
}
const CABS = [
  py6CabPink(MX[0], CAB_TOP + CH / 2, CW, CH),
  py6CabRed(MX[1], CAB_TOP + CH / 2, CW, CH),
  py6CabTeal(MX[2], CAB_TOP + CH / 2, CW, CH),
];
const GLASS = { y0: uy(PY6_CAB.glass.y0), y1: uy(PY6_CAB.glass.y1) };
const SIGN = { y0: uy(PY6_CAB.sign.y0), h: PY6_CAB.sign.y1 - PY6_CAB.sign.y0, w: PY6_CAB.sign.x1 - PY6_CAB.sign.x0 };
/** The gantry the claw's carriage runs along, under the roof of the box. */
const GANTRY = GLASS.y0 + 3;
/** Each machine's name before the question, and its rule from the question on. */
const NAMES = ['LUCKY\nCLAW', 'CLAW\nKING', 'MEGA\nGRAB'];
const RULES = ['PRIZE NOW\nAND THEN', 'PRIZE\nEVERY GO', 'PRIZE EVERY\nTENTH GO'];
const NEON: NaturalKey[] = ['py6Neon', 'py6NeonGold', 'py6NeonCyan'];
/** Where each stick stands on its ledge, in a cabinet's units. */
const STICK_U = 58;
/** The pink machine: its stick, coin slot and flap; the red one's coin slot and chute. */
const STICK = { x: ux(0, STICK_U), y: uy(PY6_CAB.stick.y) };
const SLOT = { x: ux(0, PY6_CAB.slot.x), y: uy(PY6_CAB.slot.y) };
const SLOT2 = { x: ux(1, PY6_CAB.slot.x), y: uy(PY6_CAB.slot.y) };
const CHUTE2 = { x: ux(1, 54), y: uy(70) };
const FLAP = { x: ux(0, PY6_CAB.flap.x), y: uy(PY6_CAB.flap.y) };
/** Where the claw stands over: the purple bear, the chute (home), the green bear. */
const OVER_BEAR = 77;
const HOME = ux(0, (PY6_CAB.chute.x0 + PY6_CAB.chute.x1) / 2);
const OVER_GREEN = 61;
/** The claw's cable: hanging short, and let all the way down onto a bear's head. */
const UP = 1.5;
const DOWN = 8;
function tipOf(len: number) {
  'worklet';
  return GANTRY + 2 + len + 11;
}
/** A bear's size on the stage, and where its grip sits: on the heap, in the flap. */
const BW = 16;
const BH = 19;
const BS = BW / PY6_BEAR_GRIP.w;
const BEAR_SIT = { x: OVER_BEAR, y: 436 + PY6_BEAR_GRIP.y * BS };
const GREEN_SIT = { x: OVER_GREEN, y: 438 + PY6_BEAR_GRIP.y * BS };
const BEAR_FLAP = { x: FLAP.x, y: 477 + PY6_BEAR_GRIP.y * BS };
/** Held in the claw, by its head, the grip hangs this far under the claw's tip. */
const CLAW_HANG = 7.5;

// ── where each of them stands ────────────────────────────────────────────────
const P_X = 36;
const B_X = 114;
const B_DOOR = 136;
const T_X = 222;
const BUN_LEGS: Track[] = BEATS.map((_, n) => (n === N_ONE ? [[0.56, B_DOOR], [0.84, B_X]] : [[0, B_X]]));
const BUN_TURN: Track[] = BEATS.map((_, n) => (n === N_ONE ? [[0, -1], [0.52, 1], [0.76, -1]] : [[0, -1]]));
const PRO_P = [NOD, TALK, NOD, NOD, NOD, NOD, FOLD, NOD, NOD, NOD, NOD, LISTEN];
const BUN_P = [TALK, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, TALK, NOD, LISTEN];
const TOP_P = [NOD, NOD, EXPLAIN, NOD, EXPLAIN, NOD, NOD, EXPLAIN, NOD, NOD, NOD, LISTEN];

// ── the kiosk's stand and its three phones ──────────────────────────────────
const STAND = { x: 357, w: PY6_STAND_SHELVES.w, h: PY6_STAND_SHELVES.h };
const STAND_TOP = G - STAND.h;
const STAND_ART = py6Stand(STAND.x, STAND_TOP + STAND.h / 2, STAND.w, STAND.h);
const HS_W = PY6_HANDSET_SCREEN.w;
const HS_H = PY6_HANDSET_SCREEN.h;
/** The phones, top to bottom, and what each wakes up showing. */
const PHONES = [
  { id: 'alarm', words: 'ALARM', y: STAND_TOP + PY6_STAND_SHELVES.rests[0] - HS_H },
  { id: 'feed', words: 'FEED', y: STAND_TOP + PY6_STAND_SHELVES.rests[1] - HS_H },
  { id: 'calc', words: 'CALCULATOR', y: STAND_TOP + PY6_STAND_SHELVES.rests[2] - HS_H },
];
/** Each demo phone in its own coloured case. */
const CASES = [py6HandsetGold, py6HandsetPink, py6HandsetBlue];
const HANDSETS = PHONES.map((p, j) => CASES[j](STAND.x, p.y + HS_H / 2, HS_W, HS_H));
const SCREEN = {
  x: STAND.x - HS_W / 2 + PY6_HANDSET_SCREEN.x0, w: PY6_HANDSET_SCREEN.x1 - PY6_HANDSET_SCREEN.x0,
  dy: PY6_HANDSET_SCREEN.y0, h: PY6_HANDSET_SCREEN.y1 - PY6_HANDSET_SCREEN.y0,
};

// Each held thing is drawn about the point it is held by (AR2).
const BEAR_ART = py6BearPurple(0, BH / 2 - PY6_BEAR_GRIP.y * BS, BW, BH);
const GREEN_ART = py6BearGreen(GREEN_SIT.x, GREEN_SIT.y - PY6_BEAR_GRIP.y * BS + BH / 2, BW, BH);
const PHONE_W = 7;
const PS = PHONE_W / PY6_PHONE_GRIP.w;
const PHONE_H = PY6_PHONE_GRIP.h * PS;
const PHONE_ART = py6Phone(0, PHONE_H / 2 - PY6_PHONE_GRIP.y * PS, PHONE_W, PHONE_H);
const DUSTER_W = 11;
const DS = DUSTER_W / PY6_DUSTER_GRIP.w;
const DUSTER_H = PY6_DUSTER_GRIP.h * DS;
const DUSTER_ART = py6Duster(DUSTER_W / 2 - PY6_DUSTER_GRIP.x * DS, DUSTER_H / 2 - PY6_DUSTER_GRIP.y * DS, DUSTER_W, DUSTER_H);
const PILES = MX.map((x) => py6Pile(x - 6, GLASS.y1 - 6.5, 34, 13));

// ── the night ────────────────────────────────────────────────────────────────
const HORIZON = 412;
const DECK = 474;
const STARS: [number, number, number][] = [
  [62, 300, 0], [96, 318, 1], [140, 304, 0], [168, 330, 1], [280, 302, 1], [306, 326, 0], [340, 308, 1],
  [376, 322, 0], [120, 346, 1], [10, 300, 0], [44, 350, 1], [270, 352, 0], [392, 300, 1], [150, 368, 0],
];
const WHEEL = { x: 226, y: 362, r: 30 };
/** The moon's broken path on the water under it: each glint's height and width. */
const MOON_PATH: [number, number][] = [[HORIZON + 3, 18], [HORIZON + 9, 12], [HORIZON + 16, 22], [HORIZON + 24, 10], [HORIZON + 33, 16]];
const FAR_LIGHTS = [154, 166, 178, 190, 262, 274, 286, 298, 310, 322];
const RAIL_POSTS = Array.from({ length: 13 }, (_, k) => 4 + k * 33);
const FASCIA_BULBS = Array.from({ length: 20 }, (_, k) => 10 + k * 20);

function hHold(code: number, t: number, phase?: number): Stance {
  'worklet';
  return emoteStill(code, t, phase);
}
function hLive(code: number, t: number, bt: number, phase?: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt, phase);
}
/** One hand on a stage point. */
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: G, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** Both hands on (nearly) one point — a thing held in two hands. */
function hands(s: Stance, x: number, dir: number, tx: number, ty: number, w: number): Stance {
  'worklet';
  return hand(hand(s, x, dir, 1, tx + 2 * dir, ty, w), x, dir, -1, tx - 2 * dir, ty + 0.6, w);
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
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number, phase?: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(codes[n], t, phase), hHold(codes[n], t, phase), hLive(codes[n], t, b, phase), w.u, WALK, 0)
    : hLive(codes[n], t, b, phase);
}

/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

/** A beat's answer, held: before the question 0, on it the reaction's own clock, after it `after`. */
function heldAfter(n: number, q: number, now: number, after: number): number {
  'worklet';
  return n < q ? 0 : n === q ? now : after;
}

/**
 * The claw's plan for a beat: where its carriage is along the gantry, how far its cable
 * is let down, how open its prongs are, and how far the stick is pushed.
 */
function clawPlan(n: number, b: number, L: number) {
  'worklet';
  let x = OVER_BEAR;
  let len = UP;
  let open = 1;
  let lean = 0;
  if (n === 0) {
    // lifted with the bear in its prongs — which loosen, and the bear slips out; it
    // trundles home over the chute; then she steers it back out over the bear
    x = lerp(lerp(OVER_BEAR, HOME, stage(b, L, 0.3, 0.48)), OVER_BEAR, stage(b, L, 0.7, 0.92));
    open = stage(b, L, 0.08, 0.2);
    lean = -1 * bump(b, L, 0.68, 0.74, 0.94);
  } else if (n === N_REIN) {
    // a nudge to line it up, then the drop: down, shut, up with the bear, home, open
    lean = -0.5 * bump(b, L, 0.18, 0.24, 0.32) + 0.7 * bump(b, L, 0.4, 0.43, 0.48);
    len = lerp(lerp(UP, DOWN, stage(b, L, 0.42, 0.52)), UP, stage(b, L, 0.58, 0.7));
    open = 1 - stage(b, L, 0.52, 0.57) + stage(b, L, 0.86, 0.9);
    x = lerp(OVER_BEAR, HOME, stage(b, L, 0.72, 0.84));
  } else if (n > N_REIN && n < N_REST) {
    x = HOME;
  } else if (n === N_REST) {
    // one more go: the coin goes in and she steers it out over the green bear
    x = lerp(HOME, OVER_GREEN, stage(b, L, 0.42, 0.78));
    lean = -1 * bump(b, L, 0.4, 0.46, 0.82);
  } else if (n > N_REST) {
    x = OVER_GREEN;
  }
  return { x, len, open, lean };
}

/**
 * The purple bear's plan for a beat: where it lies free (`x`, `y`, `r`), and how far it
 * is held by the claw (`claw`) or by her (`held`).
 */
function bearPlan(n: number, b: number, L: number) {
  'worklet';
  let x = BEAR_SIT.x;
  let y = BEAR_SIT.y;
  let r = 0;
  let claw = 0;
  let held = 0;
  if (n === 0) {
    // it slips out of the claw at its top and drops back onto the heap, with a bounce
    const u = stageLin(b, L, 0.1, 0.2);
    y = lerp(tipOf(UP) + CLAW_HANG, BEAR_SIT.y, u * u) - 2 * bump(b, L, 0.2, 0.235, 0.28);
    r = 10 * bump(b, L, 0.1, 0.18, 0.3);
    claw = b < 0.1 * L ? 1 : 0;
  } else if (n === N_REIN) {
    // taken by the head, carried home, let go over the chute: down the chute, into the flap
    const fall = b >= 0.88 * L;
    claw = fall ? 0 : stage(b, L, 0.55, 0.6);
    if (fall) {
      const u = stageLin(b, L, 0.88, 0.97);
      x = lerp(HOME, BEAR_FLAP.x, u);
      y = lerp(tipOf(UP) + CLAW_HANG, BEAR_FLAP.y, u * u);
      r = -6 * Math.sin(Math.PI * u);
    }
  } else if (n > N_REIN) {
    x = BEAR_FLAP.x;
    y = BEAR_FLAP.y;
    held = n === N_WIN ? stage(b, L, 0.17, 0.24) : 1;
  }
  return { x, y, r, claw, held };
}

const CAM = followMoves(BEATS.map(() => B_X), BEATS.map(kindOf), seedOf('psych6'));

export default function Psych6Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldP = useHeld();
  const heldB = useHeld();
  const heldT = useHeld();
  const cv = useCarry(32);
  const on = useLinger(i);
  // Which machine and which phone the reader took: kept past the question, so a dull
  // machine stays dull and a dimmed phone stays dim.
  const pk1 = useSharedValue(-1);
  const pk2 = useSharedValue(-1);
  useEffect(() => {
    if (picked === null) return;
    if (Q1[i]) pk1.value = MACHINE_Q.findIndex((q) => q.id === picked);
    if (Q2[i]) pk2.value = PHONE_Q.findIndex((q) => q.id === picked);
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

    // ── the claw, and the stick she works it with ─────────────────────────────
    const cp = clawPlan(n, b, L);
    const clawX = carry(cv, 0, n, cp.x, cp.x, tr);
    const clawLen = carry(cv, 1, n, cp.len, cp.len, tr);
    const clawOpen = carry(cv, 2, n, cp.open, cp.open, tr);
    const lean = carry(cv, 3, n, cp.lean, cp.lean, tr);
    const knob = { x: STICK.x + 6 * Math.sin(0.5 * lean), y: STICK.y - 6 * Math.cos(0.5 * lean) + 1.4 * Math.max(0, lean) };

    // ── the owner (the plain one), left of his pink machine, with his duster ─────
    const xP = P_X;
    const dP = 1;
    let sp = hLive(PRO_P[n], t, b, 0);
    const dusterOut = n < N_POLISH ? 1 : n === N_POLISH ? 1 - st(0.86, 0.94) : 0;
    const pHip = { x: xP + 7 * dP, y: G - 25 };
    if (n <= N_POLISH) {
      // the duster held at his hip, still (AR6)
      sp = hand(sp, xP, dP, 1, pHip.x, pHip.y, n === N_POLISH ? 1 - st(0.88, 0.98) : 1);
    }
    if (A_POLISH[n]) {
      // two wipes across the bottom of the glass — a path travelled once (AR5) — then
      // the duster is tucked away in his pocket
      const w = st(0.08, 0.18) * (1 - st(0.76, 0.86));
      const a1 = st(0.18, 0.36);
      const a2 = st(0.38, 0.56);
      const a3 = st(0.58, 0.74);
      const px = lerp(lerp(lerp(ux(0, 13), ux(0, 25), a1), ux(0, 14), a2), ux(0, 26), a3);
      const py = lerp(lerp(lerp(GLASS.y1 - 16, GLASS.y1 - 18, a1), GLASS.y1 - 8, a2), GLASS.y1 - 9, a3);
      sp = hand(sp, xP, dP, 1, px, py, w);
      sp = { ...sp, neck: sp.neck + 0.12 * w };
    }
    if (A_SMUG[n]) {
      // arms folded (the pose), two slow nods, pleased with himself
      sp = { ...sp, neck: sp.neck - 0.2 * (bp(0.12, 0.22, 0.34) + bp(0.5, 0.6, 0.72)) };
    }
    const prevP = carryFrom(heldP, n, hHold(PRO_P[p], t, 0));
    const figP = keepHeld(heldP, mixStance(prevP, sp, tr));

    // ── the player (the bun), at her stick ──────────────────────────────────
    const wb = legsOf(carrySource(cv, 4, n, B_X), BUN_LEGS[n], b, L);
    const xB = carry(cv, 4, n, wb.x, wb.x, 1);
    const dB = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, -1), BUN_TURN[n], b, L), 1);
    let sb = bodyOf(wb, BUN_P, n, t, b, 1);
    const chest = { x: xB + 11 * dB, y: G - 42 };
    const cradle = { x: xB + 9 * dB, y: G - 40 };
    const raise = { x: xB + 12 * dB, y: G - 60 };
    if (n === 0) {
      // the hand on the stick; out to the coin slot and back ("Again")
      const coin = bp(0.44, 0.54, 0.66);
      sb = hand(sb, xB, dB, 1, lerp(knob.x, SLOT.x, coin), lerp(knob.y, SLOT.y - 1, coin), 1);
      sb = { ...sb, neck: sb.neck + 0.16 * (1 - st(0.24, 0.4)) - 0.12 * coin };
    }
    if (n === N_REIN) {
      // the hand back on the stick, working the drop, and off it once the bear is home
      sb = hand(sb, xB, dB, 1, knob.x, knob.y, st(0.06, 0.16) * (1 - st(0.9, 0.97)));
      sb = { ...sb, neck: sb.neck + 0.12 * st(0.4, 0.5) * (1 - st(0.88, 0.96)) };
    }
    if (A_WIN[n]) {
      // down to the flap, the bear out, up over her head ("I won!"), and a hug
      sb = mixStance(sb, postureStill(CROUCH, t, 1), st(0, 0.12) * (1 - st(0.26, 0.4)));
      const up = st(0.28, 0.46);
      const down = st(0.66, 0.82);
      const high = { x: xB + 19 * dB, y: G - 66 };
      const tx = lerp(lerp(BEAR_FLAP.x + 3, high.x, up), chest.x, down);
      const ty = lerp(lerp(BEAR_FLAP.y - 2, high.y, up), chest.y, down);
      sb = hands(sb, xB, dB, tx, ty, st(0.06, 0.18));
      sb = { ...sb, neck: sb.neck + 0.22 * up * (1 - down) - 0.14 * st(0.82, 0.92) };
    } else if (n > N_WIN && n < N_ONE) {
      sb = hands(sb, xB, dB, chest.x, chest.y, 1);
    } else if (n >= N_ONE) {
      // the bear cradled in her near arm; the other hand is free
      const toOne = n === N_ONE ? st(0.02, 0.1) : 1;
      sb = hand(sb, xB, dB, -1, lerp(chest.x - 2 * dB, cradle.x, toOne), lerp(chest.y + 0.6, cradle.y, toOne), 1);
      if (n === N_ONE) {
        sb = hand(sb, xB, dB, 1, chest.x + 2 * dB, chest.y, 1 - toOne);
        // the phone: out of her pocket, up to her face, back again; then a coin, held up
        const pocket = st(0.08, 0.16) * (1 - st(0.5, 0.56));
        const look = st(0.18, 0.28) * (1 - st(0.42, 0.5));
        const coinGrab = st(0.6, 0.66);
        const coinUp = st(0.72, 0.82);
        const pk = { x: xB + 3 * dB, y: G - 28 };
        const face = { x: xB + 14 * dB, y: G - 50 };
        const atPocket = bp(0.6, 0.65, 0.72);
        const tx = lerp(lerp(lerp(lerp(chest.x, pk.x, pocket), face.x, look), pk.x, atPocket), raise.x, coinUp);
        const ty = lerp(lerp(lerp(lerp(chest.y, pk.y, pocket), face.y, look), pk.y, atPocket), raise.y, coinUp);
        sb = hand(sb, xB, dB, 1, tx, ty, Math.max(pocket, look, coinGrab));
        sb = { ...sb, neck: sb.neck - 0.3 * st(0.2, 0.3) * (1 - st(0.42, 0.5)) + 0.1 * coinUp };
      } else if (n === N_REST) {
        // the coin in the slot, the hand on the stick
        const toSlot = st(0.06, 0.18);
        const toKnob = st(0.3, 0.4);
        const tx = lerp(lerp(raise.x, SLOT.x, toSlot), knob.x, toKnob);
        const ty = lerp(lerp(raise.y, SLOT.y - 1, toSlot), knob.y, toKnob);
        sb = hand(sb, xB, dB, 1, tx, ty, 1);
      } else {
        sb = hand(sb, xB, dB, 1, knob.x, knob.y, 1);
      }
    }
    const prevB = carryFrom(heldB, n, hHold(BUN_P[p], t, 1));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the psychologist (the top hat), leaning on the red machine ───────────
    const xT = T_X;
    const dT = -1;
    let stt = hLive(TOP_P[n], t, b, 2);
    if (A_TRAP[n]) {
      // he leans in; taps the coin slot, then the prize chute
      stt = { ...stt, tilt: stt.tilt - 0.08 * st(0.05, 0.2) * (1 - st(0.82, 0.95)) };
      stt = hand(stt, xT, dT, 1, SLOT2.x, SLOT2.y - 1, bp(0.14, 0.26, 0.4));
      stt = hand(stt, xT, dT, 1, CHUTE2.x, CHUTE2.y, bp(0.46, 0.58, 0.76));
    }
    if (A_REIN[n]) {
      // a hand held up ("a reward"), then pointing at her hand on the stick
      stt = hand(stt, xT, dT, 1, xT - 20, G - 63, bp(0.04, 0.12, 0.4));
      stt = hand(stt, xT, dT, 1, xT - 25, G - 45, bp(0.44, 0.54, 0.86));
    }
    // his phone: out of his pocket on b7, held at his chest until he pockets it at rest
    const tPocket = { x: xT + 4 * dT, y: G - 28 };
    const tChest = { x: xT + 12 * dT, y: G - 46 };
    const tShow = { x: xT + 20 * dT, y: G - 56 };
    let phoneT = 0;
    if (n === N_PHONE) {
      const outP = st(0.04, 0.14);
      const up = st(0.16, 0.3);
      const show = st(0.66, 0.78) * (1 - st(0.92, 1));
      phoneT = st(0.12, 0.14);
      stt = hand(stt, xT, dT, 1, lerp(lerp(tPocket.x, tChest.x, up), tShow.x, show), lerp(lerp(tPocket.y, tChest.y, up), tShow.y, show), outP);
      // the other hand pulls down on the screen, once
      const pull = st(0.36, 0.42) * (1 - st(0.56, 0.62));
      const drag = st(0.42, 0.52);
      stt = hand(stt, xT, dT, -1, tChest.x - 1 * dT, tChest.y - 9 + 7 * drag, pull);
    } else if (n > N_PHONE && n < N_REST) {
      phoneT = 1;
      stt = hand(stt, xT, dT, 1, tChest.x, tChest.y, 1);
    } else if (n === N_REST) {
      const back = st(0.1, 0.3);
      phoneT = 1 - st(0.3, 0.34);
      stt = hand(stt, xT, dT, 1, lerp(tChest.x, tPocket.x, back), lerp(tChest.y, tPocket.y, back), 1 - st(0.36, 0.5));
    }
    const prevT = carryFrom(heldT, n, hHold(TOP_P[p], t, 2));
    const figT = keepHeld(heldT, mixStance(prevT, stt, tr));

    // ── the figures, posed ──────────────────────────────────────────────────
    const pro = pose(figP, xP, G, K, dP, 1);
    const bun = pose(figB, xB, G, K, dB, 1);
    const top = pose(figT, xT, G, K, dT, 1);

    // ── the bear ───────────────────────────────────────────────────────────
    const plan = bearPlan(n, b, L);
    const freeX = carry(cv, 6, n, plan.x, plan.x, tr);
    const freeY = carry(cv, 7, n, plan.y, plan.y, tr);
    const inClaw = carry(cv, 8, n, plan.claw, plan.claw, tr);
    const inHand = carry(cv, 9, n, plan.held, plan.held, tr);
    const oneArmT = n < N_ONE ? 0 : n === N_ONE ? st(0.02, 0.1) : 1;
    const oneArm = carry(cv, 10, n, oneArmT, oneArmT, tr);
    const bR = wristOf(bun, 'wrR');
    const bL = wristOf(bun, 'wrL');
    const twoX = (bR.x + bL.x) / 2;
    const twoY = (bR.y + bL.y) / 2 + 1;
    const handX = lerp(twoX, bL.x - 2 * dB, oneArm);
    const handY = lerp(twoY, bL.y - 2, oneArm);
    const clawGripY = tipOf(clawLen) + CLAW_HANG;
    const bx = lerp(lerp(freeX, clawX, inClaw), handX, inHand);
    const by = lerp(lerp(freeY, clawGripY, inClaw), handY, inHand);
    const br = carry(cv, 11, n, plan.r, plan.r, tr);

    // ── the toppers: names, then rules; and the first answer ──────────────
    const rules = carry(cv, 12, n, n > N_Q1 ? 1 : 0, n >= N_Q1 ? (n === N_Q1 ? st(0.04, 0.2) : 1) : 0, tr);
    const a1 = n === N_Q1 ? qv.value : 0;
    const got1 = pk1.value;
    const answered1 = got1 >= 0;
    // the right machine's lights race and its claw dances, whichever was taken
    const jackT = answered1 && n === N_Q1 ? clamp01(a1 / 0.2) * (1 - 0.6 * clamp01((a1 - 0.7) / 0.3)) : 0;
    const jack = carry(cv, 13, n, 0, jackT, tr);
    // a picked EVERY GO coughs a prize into its flap and its neon goes dull, and stays dull
    const dullT = answered1 && got1 === 1 ? heldAfter(n, N_Q1, ease01(clamp01((a1 - 0.25) / 0.5)), 1) : 0;
    const dull = carry(cv, 14, n, 0, dullT, tr);
    const popT = answered1 && got1 === 1 ? heldAfter(n, N_Q1, ease01(clamp01(a1 / 0.3)), 1) : 0;
    const pop = carry(cv, 15, n, 0, popT, tr);
    // a picked TENTH GO switches its bulbs off one by one, and they stay off
    const outT = answered1 && got1 === 2 ? heldAfter(n, N_Q1, clamp01((a1 - 0.05) / 0.7), 1) : 0;
    const lightsOut = carry(cv, 16, n, 0, outT, tr);

    // the machine taken: a right pick hops and lands with a squash, a wrong one is shaken
    const ok1 = got1 === 0;
    const hop1T = answered1 && n === N_Q1 && ok1 ? bump(a1, 1, 0.0, 0.14, 0.36) : 0;
    const shk1T = answered1 && n === N_Q1 && !ok1 ? Math.sin(a1 * 80) * (1 - clamp01(a1 / 0.45)) * 3.2 : 0;
    const hop1 = carry(cv, 28, n, 0, hop1T, tr);
    const shk1 = carry(cv, 29, n, 0, shk1T, tr);

    // ── the phones on the stand, and the second answer ────────────────────
    const awakeT = n > N_Q2 ? 1 : n === N_Q2 ? st(0.04, 0.16) : 0;
    const awake = carry(cv, 17, n, n > N_Q2 ? 1 : 0, awakeT, tr);
    const a2 = n === N_Q2 ? qv.value : 0;
    const got2 = pk2.value;
    const answered2 = got2 >= 0;
    const refreshT = answered2 ? heldAfter(n, N_Q2, ease01(clamp01(a2 / 0.5)), 1) : 0;
    const refresh = carry(cv, 18, n, 0, refreshT, tr);
    const buzzNow = answered2 && got2 === 0 && n === N_Q2
      ? 2.4 * Math.sin(a2 * 60) * (bump(a2, 1, 0, 0.08, 0.3) + bump(a2, 1, 0.36, 0.44, 0.66)) : 0;
    const buzz = carry(cv, 19, n, 0, buzzNow, tr);
    const flashNow = answered2 && got2 === 2 && n === N_Q2 ? bump(a2, 1, 0.05, 0.14, 0.4) : 0;
    const flash = carry(cv, 20, n, 0, flashNow, tr);
    const ok2 = got2 === 1;
    const hop2T = answered2 && n === N_Q2 && ok2 ? bump(a2, 1, 0.0, 0.14, 0.36) : 0;
    const shk2T = answered2 && n === N_Q2 && !ok2 ? Math.sin(a2 * 80) * (1 - clamp01(a2 / 0.45)) * 2.4 : 0;
    const hop2 = carry(cv, 30, n, 0, hop2T, tr);
    const shk2 = carry(cv, 31, n, 0, shk2T, tr);
    const dimT = answered2 && got2 === 2 ? heldAfter(n, N_Q2, ease01(clamp01((a2 - 0.35) / 0.4)), 1) : 0;
    const dim = carry(cv, 21, n, 0, dimT, tr);

    // ── the held things ──────────────────────────────────────────────────────
    const pR = wristOf(pro, 'wrR');
    const tR = wristOf(top, 'wrR');
    // her phone in b9, her coins in b0, b9 and b10
    const bPhoneT = n === N_ONE ? st(0.15, 0.17) * (1 - st(0.5, 0.52)) : 0;
    const coinT = n === 0 ? st(0.42, 0.44) * (1 - st(0.53, 0.55))
      : n === N_ONE ? st(0.64, 0.66) : n === N_REST ? 1 - st(0.17, 0.19) : 0;
    // his phone's feed refreshes as he pulls it
    const tNew = n > N_PHONE ? 1 : n === N_PHONE ? st(0.52, 0.6) : 0;

    return {
      pro, bun, top,
      claw: { x: clawX, len: clawLen, open: clawOpen, knobX: knob.x, knobY: knob.y, jack },
      bear: { x: bx, y: by, o: 1, r: br },
      duster: { x: pR.x, y: pR.y, o: carry(cv, 22, n, dusterOut, dusterOut, tr) },
      bPhone: { x: bR.x, y: bR.y, o: bPhoneT },
      coin: { x: bR.x - 1.6 * dB, y: bR.y - 1.2, o: coinT },
      tPhone: { x: tR.x, y: tR.y, o: carry(cv, 23, n, phoneT, phoneT, tr) },
      tNew: carry(cv, 24, n, tNew, tNew, tr),
      rules, dull, pop, lightsOut, hop1, shk1, hop2, shk2, pk1v: got1, pk2v: got2,
      awake, refresh, buzz, flash, dim,
      blink: carry(cv, 25, n, A_REST[p] ? 1 : 0, A_REST[n] ? 1 : 0, tr),
      q1: carry(cv, 26, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 27, n, Q2[p], Q2[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pro);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.bun);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.top);
  const bearP = useDerivedValue<At>(() => SCENE.value.bear);
  const dusterP = useDerivedValue<At>(() => SCENE.value.duster);
  const bPhoneP = useDerivedValue<At>(() => SCENE.value.bPhone);
  const tPhoneP = useDerivedValue<At>(() => SCENE.value.tPhone);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Night clock={clock} />
      <Rail />
      <Fascia clock={clock} S={SCENE} />
      {[0, 1, 2].map((j) => <Machine key={j} j={j} clock={clock} S={SCENE} />)}
      <ObjectArt parts={STAND_ART} tone={TONE} />
      <View style={styles.standHead} pointerEvents="none">
        <Text style={styles.standText}>PHONES</Text>
      </View>
      {PHONES.map((ph, j) => <Handset key={ph.id} j={j} S={SCENE} lit={i >= N_Q2} />)}
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="second" wear={[]} />
      <Rider at={dusterP} art={DUSTER_ART} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Rider at={bearP} art={BEAR_ART} />
      <Rider at={bPhoneP} art={PHONE_ART} />
      <Coin S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="crowd" wear={BY_ID.magistrate.pieces} />
      <TopPhone at={tPhoneP} S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={MACHINE_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={PHONE_Q} k="q2" /> : null}
    </View>
  );
}

// ── the night: sky, moon, stars, a ferris wheel on the next pier, the sea ──────

function Night({ clock }: { clock: SharedValue<number> }) {
  const tw0 = useAnimatedStyle(() => ({ opacity: 0.5 + 0.5 * Math.sin(clock.value * 1.2) }));
  const tw1 = useAnimatedStyle(() => ({ opacity: 0.5 + 0.5 * Math.sin(clock.value * 0.8 + 2.4) }));
  // the wheel turns slowly, all night
  const wheel = useAnimatedStyle(() => ({ transform: [{ rotate: `${clock.value * 9}deg` }] }));
  const lightsA = useAnimatedStyle(() => ({ opacity: 0.65 + 0.35 * Math.sin(clock.value * 2.6) }));
  const lightsB = useAnimatedStyle(() => ({ opacity: 0.65 - 0.35 * Math.sin(clock.value * 2.6) }));
  // the sea's light runs along and comes round again
  const glintA = useAnimatedStyle(() => ({ transform: [{ translateX: ((clock.value * 6) % 440) - 40 }] }));
  const glintB = useAnimatedStyle(() => ({ transform: [{ translateX: ((clock.value * 4.2 + 220) % 440) - 40 }] }));
  const path = useAnimatedStyle(() => ({ opacity: 0.55 + 0.3 * Math.sin(clock.value * 1.9) }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.sky} />
      <View style={styles.skyLow} />
      <View style={styles.haze} />
      <Animated.View style={[StyleSheet.absoluteFill, tw0]}>
        {STARS.filter((s) => s[2] === 0).map(([x, y], k) => <View key={k} style={[styles.star, { left: x - 1.2, top: y - 1.2 }]} />)}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, tw1]}>
        {STARS.filter((s) => s[2] === 1).map(([x, y], k) => <View key={k} style={[styles.star, { left: x - 1.2, top: y - 1.2 }]} />)}
      </Animated.View>
      <View style={styles.moon} />
      <View style={styles.farPier} />
      <View style={styles.wheelLegL} />
      <View style={styles.wheelLegR} />
      <Animated.View style={[styles.wheel, wheel]}>
        <View style={styles.wheelRim} />
        {[0, 30, 60, 90, 120, 150].map((a) => (
          <View key={a} style={[styles.spoke, { transform: [{ rotate: `${a}deg` }] }]} />
        ))}
        <Animated.View style={[StyleSheet.absoluteFill, lightsA]}>
          {[0, 60, 120, 180, 240, 300].map((a) => <WheelLight key={a} a={a} c={N.py6Neon.base} />)}
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, lightsB]}>
          {[30, 90, 150, 210, 270, 330].map((a) => <WheelLight key={a} a={a} c={N.py6NeonGold.base} />)}
        </Animated.View>
      </Animated.View>
      <View style={styles.wheelHub} />
      <Animated.View style={[StyleSheet.absoluteFill, lightsA]}>
        {FAR_LIGHTS.map((x) => <View key={x} style={[styles.farLight, { left: x - 1 }]} />)}
      </Animated.View>
      <View style={styles.seaFar} />
      <View style={styles.sea} />
      <Animated.View style={[StyleSheet.absoluteFill, path]}>
        {MOON_PATH.map(([y, w], k) => <View key={k} style={[styles.moonGlint, { top: y, left: 20 - w / 2, width: w }]} />)}
      </Animated.View>
      <Animated.View style={[styles.glintA, glintA]} />
      <Animated.View style={[styles.glintB, glintB]} />
      <View style={styles.deck} />
      <View style={styles.deckLineA} />
      <View style={styles.deckLineB} />
    </View>
  );
}

function WheelLight({ a, c }: { a: number; c: string }) {
  const r = WHEEL.r;
  const x = r + r * Math.sin((a * Math.PI) / 180) - 2;
  const y = r - r * Math.cos((a * Math.PI) / 180) - 2;
  return <View style={[styles.wheelLight, { left: x, top: y, backgroundColor: c }]} />;
}

function Rail() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {RAIL_POSTS.map((x) => <View key={x} style={[styles.post, { left: x - 1.2 }]} />)}
      <View style={styles.railTop} />
      <View style={styles.railMid} />
    </View>
  );
}

/** The arcade's fascia: AMUSEMENTS in pink neon, and a row of bulbs chasing under it. */
function Fascia({ clock, S }: { clock: SharedValue<number>; S: SharedValue<any> }) {
  const neon = useAnimatedStyle(() => {
    const t = clock.value;
    // a steady glow with the odd flutter, and a blink under the quotation. The words stay
    // readable through both (check:readable FAINT): the bulbs carry the real blinking.
    const flutter = Math.sin(t * 13) > 0.97 ? 0.9 : 1;
    const blink = S.value.blink * (Math.sin(t * 3.4) > 0 ? 0.1 : 0);
    return { opacity: flutter * (1 - blink) };
  });
  const odd = useAnimatedStyle(() => ({ opacity: Math.sin(clock.value * (2.4 + 2.6 * S.value.blink)) > 0 ? 1 : 0.3 }));
  const even = useAnimatedStyle(() => ({ opacity: Math.sin(clock.value * (2.4 + 2.6 * S.value.blink)) > 0 ? 0.3 : 1 }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.fascia}>
        <Animated.Text style={[styles.amuse, neon]}>AMUSEMENTS</Animated.Text>
      </View>
      <View style={styles.fasciaLip} />
      <Animated.View style={[StyleSheet.absoluteFill, odd]}>
        {FASCIA_BULBS.filter((_, k) => k % 2 === 0).map((x) => <View key={x} style={[styles.bulb, { left: x - 2 }]} />)}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, even]}>
        {FASCIA_BULBS.filter((_, k) => k % 2 === 1).map((x) => <View key={x} style={[styles.bulb, { left: x - 2 }]} />)}
      </Animated.View>
    </View>
  );
}

// ── one claw machine: cabinet, heap, claw, chute, stick, topper and its bulbs ──

function Machine({ j, clock, S }: { j: number; clock: SharedValue<number>; S: SharedValue<any> }) {
  const cx = MX[j];
  const mine = j === 0;
  // the claw: the pink machine's is worked; the other two hang still
  const carriage = useAnimatedStyle(() => {
    const c = S.value.claw;
    const dance = mine ? 3 * c.jack * Math.sin(clock.value * 9) : 0;
    const x = mine ? c.x + dance : cx + (j === 1 ? -6 : 4);
    return { transform: [{ translateX: x }] };
  });
  const cable = useAnimatedStyle(() => ({ height: (mine ? S.value.claw.len : UP) + 2 }));
  const head = useAnimatedStyle(() => ({ transform: [{ translateY: mine ? S.value.claw.len : UP }] }));
  const prongL = useAnimatedStyle(() => ({ transform: [{ rotate: `${10 + 26 * (mine ? S.value.claw.open : 1)}deg` }] }));
  const prongR = useAnimatedStyle(() => ({ transform: [{ rotate: `${-10 - 26 * (mine ? S.value.claw.open : 1)}deg` }] }));
  const knobAt = useAnimatedStyle(() => {
    const c = S.value.claw;
    const kx = mine ? c.knobX : ux(j, STICK_U);
    const ky = mine ? c.knobY : uy(PY6_CAB.stick.y) - 6;
    return { transform: [{ translateX: kx }, { translateY: ky }] };
  });
  const shaft = useAnimatedStyle(() => {
    const c = S.value.claw;
    const kx = mine ? c.knobX : ux(j, STICK_U);
    const ky = mine ? c.knobY : uy(PY6_CAB.stick.y) - 6;
    const bx = ux(j, STICK_U);
    const by = uy(PY6_CAB.stick.y);
    const len = Math.hypot(kx - bx, ky - by);
    const ang = Math.atan2(kx - bx, by - ky);
    return { height: len, transform: [{ rotate: `${(ang * 180) / Math.PI}deg` }] };
  });
  // the words: the machine's name, then its rule
  const nameO = useAnimatedStyle(() => ({ opacity: 1 - S.value.rules }));
  const ruleO = useAnimatedStyle(() => ({ opacity: S.value.rules * (j === 1 ? 1 - 0.6 * S.value.dull : 1) }));
  // a prize coughed into the red machine's flap
  const prize = useAnimatedStyle(() => ({ opacity: j === 1 ? S.value.pop : 0, transform: [{ translateY: -10 * (1 - S.value.pop) }] }));
  const react = useAnimatedStyle(() => {
    const me = S.value.pk1v === j;
    const h = me ? S.value.hop1 : 0;
    return {
      transform: [{ translateX: me ? S.value.shk1 : 0 }, { translateY: -6 * h }, { scaleY: 1 - 0.06 * h }],
      transformOrigin: `${cx}px ${CAB_TOP + CH}px`,
    };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, react]} pointerEvents="none">
      <View style={[styles.pill, { left: cx - 34, top: CAB_TOP + CH - 2 }]} />
      <ObjectArt parts={CABS[j]} tone={TONE} />
      <ObjectArt parts={PILES[j]} tone={TONE} />
      {mine ? <ObjectArt parts={GREEN_ART} tone={TONE} /> : null}
      <View style={[styles.gantry, { left: cx - 22 }]} pointerEvents="none" />
      <Animated.View style={[styles.carriage, carriage]} pointerEvents="none">
        <View style={styles.carBox} />
        <Animated.View style={[styles.cable, cable]} />
        <Animated.View style={[styles.clawHead, head]}>
          <Animated.View style={[styles.prongPin, styles.prongPinL, prongL]}><View style={styles.prong} /></Animated.View>
          <Animated.View style={[styles.prongPin, styles.prongPinR, prongR]}><View style={styles.prong} /></Animated.View>
          <View style={styles.prongMid} />
          <View style={styles.headBox} />
        </Animated.View>
      </Animated.View>
      <View style={[styles.chute, { left: ux(j, PY6_CAB.chute.x0) }]} pointerEvents="none" />
      <View style={[styles.chuteRim, { left: ux(j, PY6_CAB.chute.x0) }]} pointerEvents="none" />
      {j === 1 ? <Animated.View style={[styles.prize, { left: ux(1, PY6_CAB.flap.x) - 6 }, prize]} pointerEvents="none" /> : null}
      <View style={[styles.shaftPin, { left: ux(j, STICK_U), top: uy(PY6_CAB.stick.y) }]} pointerEvents="none">
        <Animated.View style={[styles.shaft, shaft]} />
      </View>
      <Animated.View style={[styles.knobPin, knobAt]} pointerEvents="none">
        <View style={styles.knob} />
      </Animated.View>
      <View style={[styles.signPlate, { left: cx - SIGN.w / 2 }]} pointerEvents="none">
        <Animated.Text style={[styles.signText, { color: N[NEON[j]].base }, nameO]}>{NAMES[j]}</Animated.Text>
      </View>
      <View style={[styles.signPlate, { left: cx - SIGN.w / 2 }]} pointerEvents="none">
        <Animated.Text style={[styles.signText, { color: N[NEON[j]].base }, ruleO]}>{RULES[j]}</Animated.Text>
      </View>
      {[0, 1, 2, 3, 4, 5, 6].map((c) => <BulbCol key={c} j={j} c={c} clock={clock} S={S} />)}
    </Animated.View>
  );
}

/** One column of a topper's bulbs, top and bottom of its rim, chasing. */
function BulbCol({ j, c, clock, S }: { j: number; c: number; clock: SharedValue<number>; S: SharedValue<any> }) {
  const x = MX[j] - 30 + c * 10;
  const st = useAnimatedStyle(() => {
    const s = S.value;
    const jack = j === 0 ? s.claw.jack : 0;
    const speed = 3 + 9 * jack + 3 * s.blink;
    const chase = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(clock.value * speed - c * 0.9));
    // the dull machine's bulbs go dim; the TENTH GO's go out one by one
    const dull = j === 1 ? s.dull : 0;
    const out = j === 2 ? clamp01((s.lightsOut * 7 - c) / 0.6) : 0;
    return { opacity: lerp(chase, 0.3, dull) * (1 - out * 0.9) };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <View style={[styles.topBulb, { left: x - 1.6, top: CAB_TOP + 0.2 }]} />
      <View style={[styles.topBulb, { left: x - 1.6, top: CAB_TOP + 22.6 }]} />
    </Animated.View>
  );
}

// ── the kiosk's phones ─────────────────────────────────────────────────────────

/** A demo phone; its screen is only built from the beat it wakes on (a View budget, not a look). */
function Handset({ j, S, lit: on }: { j: number; S: SharedValue<any>; lit: boolean }) {
  const ph = PHONES[j];
  const body = useAnimatedStyle(() => {
    const me = S.value.pk2v === j;
    return {
      transform: [
        { translateX: (ph.id === 'alarm' ? S.value.buzz : 0) + (me ? S.value.shk2 : 0) },
        { translateY: me ? -5 * S.value.hop2 : 0 },
      ],
    };
  });
  const lit = useAnimatedStyle(() => ({ opacity: S.value.awake * (ph.id === 'calc' ? 1 - 0.45 * S.value.dim : 1) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, body]} pointerEvents="none">
      <ObjectArt parts={HANDSETS[j]} tone={TONE} />
      {on ? (
        <Animated.View style={[styles.screen, { top: ph.y + SCREEN.dy }, lit]}>
          <Text style={ph.id === 'calc' ? styles.screenWordTight : styles.screenWord}>{ph.words}</Text>
          {ph.id === 'feed' ? <Feed S={S} /> : ph.id === 'alarm' ? <AlarmFace /> : <Keys S={S} />}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function Feed({ S }: { S: SharedValue<any> }) {
  // pulled down: the posts slide, the spinner turns, and a new post pops in
  const rows = useAnimatedStyle(() => ({ transform: [{ translateY: 7 * S.value.refresh }] }));
  const spin = useAnimatedStyle(() => ({
    opacity: Math.sin(Math.PI * clamp01(S.value.refresh * 1.4)),
    transform: [{ rotate: `${S.value.refresh * 540}deg` }],
  }));
  const fresh = useAnimatedStyle(() => {
    const u = clamp01((S.value.refresh - 0.55) / 0.3);
    return { opacity: u, transform: [{ scale: 0.6 + 0.4 * u }] };
  });
  return (
    <>
      <Animated.View style={[styles.spinner, spin]} />
      <View style={styles.pullArrow} />
      <Animated.View style={[styles.rows, rows]}>
        <View style={styles.row}><View style={[styles.avatar, { backgroundColor: N.py6PlushBlue.base }]} /><View style={styles.barLong} /></View>
        <View style={styles.row}><View style={[styles.avatar, { backgroundColor: N.py6PlushYellow.base }]} /><View style={styles.barShort} /></View>
      </Animated.View>
      <Animated.View style={[styles.newPost, fresh]}>
        <View style={[styles.thumb, { backgroundColor: N.py6Bear.base }]} />
        <View style={styles.newDot} />
      </Animated.View>
    </>
  );
}

function AlarmFace() {
  return (
    <View style={styles.dial}>
      <View style={styles.hourHand} />
      <View style={styles.minuteHand} />
    </View>
  );
}

function Keys({ S }: { S: SharedValue<any> }) {
  const eq = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * S.value.flash, transform: [{ scale: 1 + 0.35 * S.value.flash }] }));
  return (
    <View style={styles.keys}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => <View key={k} style={styles.key} />)}
      <Animated.View style={[styles.key, styles.keyEq, eq]} />
    </View>
  );
}

// ── the coin, and the psychologist's phone with its feed ─────────────────────

function Coin({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.coin.o, transform: [{ translateX: S.value.coin.x }, { translateY: S.value.coin.y }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.coin} />
    </Animated.View>
  );
}

function TopPhone({ at, S }: { at: SharedValue<At>; S: SharedValue<any> }) {
  const post = useAnimatedStyle(() => ({ opacity: S.value.tNew }));
  return (
    <Rider at={at} art={PHONE_ART}>
      <Animated.View style={[styles.tinyNew, post]} />
    </Rider>
  );
}

// ── a rider: a thing drawn about the point it is held by ───────────────────

type At = { x: number; y: number; o: number; r?: number };
function Rider({ at, art, children }: { at: SharedValue<At>; art: ReturnType<typeof py6Phone>; children?: ReactNode }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r ?? 0}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
      {children}
    </Animated.View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both are tapped ON THE STAGE (AP6): bare hit boxes over real things that carry their
 * own words (AN2) — a machine's lit topper and its glass, a phone's woken screen. No
 * two live targets come within 8 units of each other (AN4).
 */
type Q = { id: string; left: number; top: number; w: number; h: number; correct: boolean };
/** Q1 — PICK THE MACHINE: the three machines, topper and glass. NOW AND THEN keeps her longest. */
const MACHINE_Q: Q[] = [
  { id: 'nowthen', left: MX[0] - 30, top: CAB_TOP - 2, w: 60, h: GLASS.y1 - CAB_TOP + 2, correct: true },
  { id: 'everygo', left: MX[1] - 30, top: CAB_TOP - 2, w: 60, h: GLASS.y1 - CAB_TOP + 2, correct: false },
  { id: 'tenthgo', left: MX[2] - 30, top: CAB_TOP - 2, w: 60, h: GLASS.y1 - CAB_TOP + 2, correct: false },
];
/** Q2 — FIND IT IN YOUR POCKET: the three phones on the stand. The feed works like the claw. */
const PHONE_Q: Q[] = PHONES.map((ph) => ({ id: ph.id, left: STAND.x - HS_W / 2, top: ph.y, w: HS_W, h: HS_H, correct: ph.id === 'feed' }));
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
          disabled={answered} sealAt="br"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place} />
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, G),
  ground: { position: 'absolute', left: 8, right: 8, top: G, height: 1.5, backgroundColor: RULE },
  // the night over the sea
  sky: { position: 'absolute', left: 0, right: 0, top: 272, height: HORIZON - 272, backgroundColor: N.py6Sky.base },
  skyLow: { position: 'absolute', left: 0, right: 0, top: 350, height: HORIZON - 350, backgroundColor: N.py6SkyLow.base },
  haze: { position: 'absolute', left: 0, right: 0, top: 392, height: HORIZON - 392, backgroundColor: N.py6Haze.base },
  star: { position: 'absolute', width: 2.4, height: 2.4, borderRadius: 1.2, backgroundColor: N.py6Moon.base },
  moon: { position: 'absolute', left: 10, top: 312, width: 20, height: 20, borderRadius: 10, backgroundColor: N.py6Moon.base },
  farPier: { position: 'absolute', left: 146, top: 404, width: 186, height: HORIZON - 404, backgroundColor: N.py6Fascia.base },
  farLight: { position: 'absolute', top: 405, width: 2.2, height: 2.2, borderRadius: 1.1, backgroundColor: N.py6NeonGold.base },
  wheel: { position: 'absolute', left: WHEEL.x - WHEEL.r, top: WHEEL.y - WHEEL.r, width: WHEEL.r * 2, height: WHEEL.r * 2 },
  wheelRim: {
    position: 'absolute', left: 0, top: 0, width: WHEEL.r * 2, height: WHEEL.r * 2, borderRadius: WHEEL.r,
    borderWidth: 1.6, borderColor: N.py6NeonCyan.shade,
  },
  spoke: { position: 'absolute', left: WHEEL.r - 0.5, top: 0, width: 1, height: WHEEL.r * 2, backgroundColor: N.py6NeonCyan.shade, opacity: 0.7 },
  wheelLight: { position: 'absolute', width: 4, height: 4, borderRadius: 2 },
  wheelHub: {
    position: 'absolute', left: WHEEL.x - 3, top: WHEEL.y - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: N.py6NeonGold.base,
  },
  wheelLegL: {
    position: 'absolute', left: WHEEL.x - 1, top: WHEEL.y, width: 2, height: 46, backgroundColor: N.py6Haze.shade,
    transform: [{ rotate: '18deg' }], transformOrigin: '50% 0%',
  },
  wheelLegR: {
    position: 'absolute', left: WHEEL.x - 1, top: WHEEL.y, width: 2, height: 46, backgroundColor: N.py6Haze.shade,
    transform: [{ rotate: '-18deg' }], transformOrigin: '50% 0%',
  },
  seaFar: { position: 'absolute', left: 0, right: 0, top: HORIZON, height: 24, backgroundColor: N.py6SeaFar.base },
  sea: { position: 'absolute', left: 0, right: 0, top: HORIZON + 24, height: DECK - HORIZON - 24, backgroundColor: N.py6Sea.base },
  moonGlint: { position: 'absolute', height: 1.6, borderRadius: 0.8, backgroundColor: N.py6Moon.shade },
  glintA: { position: 'absolute', left: 0, top: HORIZON + 8, width: 40, height: 1.4, borderRadius: 0.7, backgroundColor: N.py6Moon.shade, opacity: 0.6 },
  glintB: { position: 'absolute', left: 0, top: HORIZON + 30, width: 56, height: 1.4, borderRadius: 0.7, backgroundColor: N.py6Moon.shade, opacity: 0.45 },
  deck: { position: 'absolute', left: 0, right: 0, top: DECK, height: G - DECK, backgroundColor: N.py6Deck.base },
  deckLineA: { position: 'absolute', left: 0, right: 0, top: DECK + 9, height: 1, backgroundColor: N.py6Deck.shade },
  deckLineB: { position: 'absolute', left: 0, right: 0, top: DECK + 19, height: 1, backgroundColor: N.py6Deck.shade },
  // the pier's white rail
  post: { position: 'absolute', top: 450, width: 2.4, height: DECK - 450, backgroundColor: N.py6Rail.base },
  railTop: { position: 'absolute', left: 0, right: 0, top: 449, height: 2.6, borderRadius: 1.3, backgroundColor: N.py6Rail.base },
  railMid: { position: 'absolute', left: 0, right: 0, top: 461, height: 1.6, backgroundColor: N.py6Rail.shade },
  // the arcade's fascia
  fascia: {
    position: 'absolute', left: 0, right: 0, top: 272, height: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: N.py6Fascia.base,
  },
  fasciaLip: { position: 'absolute', left: 0, right: 0, top: 290, height: 2, backgroundColor: N.py6Fascia.shade },
  amuse: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 13, letterSpacing: 2.6, color: N.py6Neon.base, includeFontPadding: false,
  },
  bulb: { position: 'absolute', top: 292, width: 4, height: 4, borderRadius: 2, backgroundColor: N.py6NeonGold.base },
  // a machine's inside: the gantry, the claw, the chute
  gantry: { position: 'absolute', top: GANTRY - 0.8, width: 44, height: 1.6, backgroundColor: N.py6Panel.base },
  carriage: { position: 'absolute', left: 0, top: GANTRY - 2, width: 0, height: 0 },
  carBox: {
    position: 'absolute', left: -5, top: 0, width: 10, height: 4, borderRadius: 1, backgroundColor: N.silver.shade,
    borderWidth: 0.8, borderColor: INK,
  },
  cable: { position: 'absolute', left: -0.5, top: 4, width: 1, backgroundColor: INK },
  clawHead: { position: 'absolute', left: 0, top: 6, width: 0, height: 0 },
  headBox: {
    position: 'absolute', left: -3, top: 0, width: 6, height: 5, borderRadius: 1.2, backgroundColor: N.silver.base,
    borderWidth: 0.8, borderColor: INK,
  },
  prongPin: { position: 'absolute', top: 4.4, width: 0, height: 0 },
  prongPinL: { left: -2 },
  prongPinR: { left: 2 },
  prong: {
    position: 'absolute', left: -0.8, top: 0, width: 1.6, height: 7, borderRadius: 0.8, backgroundColor: N.silver.shade,
    borderWidth: 0.4, borderColor: INK,
  },
  prongMid: { position: 'absolute', left: -0.7, top: 4.4, width: 1.4, height: 5.4, borderRadius: 0.7, backgroundColor: N.silver.shade },
  chute: {
    position: 'absolute', top: uy(PY6_CAB.chute.y0), width: PY6_CAB.chute.x1 - PY6_CAB.chute.x0,
    height: GLASS.y1 - uy(PY6_CAB.chute.y0), backgroundColor: N.py6Acrylic.base, opacity: 0.38,
  },
  chuteRim: {
    position: 'absolute', top: uy(PY6_CAB.chute.y0), width: PY6_CAB.chute.x1 - PY6_CAB.chute.x0, height: 1.6,
    backgroundColor: N.py6Acrylic.shade,
  },
  prize: {
    position: 'absolute', top: uy(PY6_CAB.flap.y) - 4, width: 12, height: 10, borderRadius: 5, backgroundColor: N.py6PlushPink.base,
  },
  shaftPin: { position: 'absolute', width: 0, height: 0 },
  shaft: { position: 'absolute', left: -0.9, bottom: 0, width: 1.8, backgroundColor: N.silver.shade, transformOrigin: '50% 100%' },
  knobPin: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  knob: {
    position: 'absolute', left: -2.6, top: -2.6, width: 5.2, height: 5.2, borderRadius: 2.6, borderWidth: 0.8, borderColor: INK,
    backgroundColor: N.apple.base,
  },
  signPlate: {
    position: 'absolute', top: SIGN.y0, width: SIGN.w, height: SIGN.h, alignItems: 'center', justifyContent: 'center',
  },
  signText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9.4, letterSpacing: 0.2, textAlign: 'center', includeFontPadding: false,
  },
  topBulb: { position: 'absolute', width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: N.py6NeonGold.base },
  // the kiosk's stand
  standHead: {
    position: 'absolute', left: STAND.x - STAND.w / 2 + PY6_STAND_SHELVES.header.x0, top: STAND_TOP + PY6_STAND_SHELVES.header.y0,
    width: PY6_STAND_SHELVES.header.x1 - PY6_STAND_SHELVES.header.x0, height: PY6_STAND_SHELVES.header.y1 - PY6_STAND_SHELVES.header.y0,
    alignItems: 'center', justifyContent: 'center',
  },
  standText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 1.2, color: N.py6NeonCyan.base, includeFontPadding: false,
  },
  screen: {
    position: 'absolute', left: SCREEN.x, width: SCREEN.w, height: SCREEN.h, borderRadius: 2.4, overflow: 'hidden',
    backgroundColor: N.py6Screen.base, paddingTop: 1.5,
  },
  screenWord: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: N.py6Screen.label,
    includeFontPadding: false, marginLeft: 3,
  },
  // the calculator's name sits along the BOTTOM of its screen, its keys above: the
  // target's pip lands on the top-right corner, and a word there is struck by it
  screenWordTight: {
    position: 'absolute', left: 0, right: 0, bottom: 1.5,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: N.py6Screen.label,
    includeFontPadding: false, textAlign: 'center',
  },
  spinner: {
    position: 'absolute', right: 4, top: 2, width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.4,
    borderColor: N.py6PlushBlue.base, borderTopColor: N.py6Screen.base,
  },
  pullArrow: {
    position: 'absolute', right: 14, top: 3.5, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 4.5,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: N.py6ScreenOff.base,
  },
  rows: { position: 'absolute', left: 3, top: 13, right: 3 },
  row: { flexDirection: 'row', alignItems: 'center', height: 7 },
  avatar: { width: 5, height: 5, borderRadius: 2.5, marginRight: 3 },
  barLong: { width: 36, height: 2.2, borderRadius: 1.1, backgroundColor: N.py6ScreenOff.shade, opacity: 0.4 },
  barShort: { width: 24, height: 2.2, borderRadius: 1.1, backgroundColor: N.py6ScreenOff.shade, opacity: 0.4 },
  newPost: {
    position: 'absolute', left: 3, top: 12.5, width: 57, height: 6.5, borderRadius: 1.4, flexDirection: 'row', alignItems: 'center',
    backgroundColor: N.py6Screen.shade, paddingLeft: 1,
  },
  thumb: { width: 8, height: 5, borderRadius: 1 },
  newDot: { position: 'absolute', right: 2, top: 1.5, width: 3.4, height: 3.4, borderRadius: 1.7, backgroundColor: N.apple.base },
  dial: {
    position: 'absolute', right: 6, top: 4.5, width: 20, height: 20, borderRadius: 10, borderWidth: 1.4, borderColor: INK,
    backgroundColor: N.py6Screen.shade,
  },
  hourHand: {
    position: 'absolute', left: 8.6, top: 8.6, width: 1.6, height: 6, borderRadius: 0.8, backgroundColor: INK,
    transform: [{ rotate: '30deg' }], transformOrigin: '50% 0%',
  },
  minuteHand: { position: 'absolute', left: 8.7, top: 2, width: 1.2, height: 7.4, borderRadius: 0.6, backgroundColor: INK },
  keys: { position: 'absolute', left: 6, top: 3, width: 52, flexDirection: 'row', flexWrap: 'wrap' },
  key: { width: 8.4, height: 5, borderRadius: 1, marginRight: 2, marginBottom: 2, backgroundColor: N.py6ScreenOff.shade, opacity: 0.5 },
  keyEq: { backgroundColor: N.orange.base },
  coin: {
    position: 'absolute', left: -2.8, top: -2.8, width: 5.6, height: 5.6, borderRadius: 2.8, backgroundColor: N.brass.base,
    borderWidth: 0.6, borderColor: INK,
  },
  tinyNew: { position: 'absolute', left: -2, top: -8, width: 3, height: 2.2, borderRadius: 0.6, backgroundColor: N.apple.base },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  place: { flexGrow: 1 },
  pill: { ...pillStyle(2.6), top: 0, left: 0 },
});

export function Psych6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Psych6Scene} band={[272, 514]} camera={CAM} />;
}
