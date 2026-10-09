import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  Easing, useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './psych1Script';
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
import { reachHandTo, saucerHandAt, sipHandAt, sipHead, sipTilt } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, tentCard, menuBoard, cafeCounter, cafeWindow, tint, CAFE_CUP_GRIP, SAUCER_SIZE,
  type ObjPart,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// psychology-foundations-1, "What Is Psychology?" — A CAFÉ COUNTER, A TASTE TEST.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates.
// The taster (plain) is sure he can tell cheap coffee from good; the server (the
// bun) stands a label by each of two cups poured from ONE pot; the psychologist (the
// top hat) walks in and turns the mistake into the subject.
//
//   b0   the taster walks up to the end of the counter and lays a hand on it; the
//        server comes along behind the counter to serve him.
//   b1   he steps up between the two cups; she lifts two table tents from under the
//        counter, stands BARGAIN by the left cup, walks along past it, turns back
//        and stands GOLD by the right one.
//   b2   he tastes the gold one, then turns and tastes the other, each the way a
//        person drinks from a café cup (AR3): the saucer lifted with the cup on it and
//        held flat at his chest, the cup alone taken by its handle to his lips, tipped,
//        his head meeting it, and set back on the saucer, and the saucer back on the
//        counter. He slides the bargain cup away; she goes back to her pot.
//   b3   she turns to the one coffee pot, lifts it by its handle and turns to show it
//        to him, then turns back and sets it down.
//   b4   the psychologist walks in from the left, tips his hat and points at the
//        taster's head; the taster turns to him.
//   b5   Q1: the pot, the gold cup and the GOLD tent — tap one.
//   b6   the psychologist taps his own head, then opens a hand to the taster.
//   b7   the taster walks away from the counter and folds his arms, his back to it.
//   b8   behind his back the server swaps the two tents: GOLD to the left cup,
//        BARGAIN to the right.
//   b9   Q2: the menu board is wiped to three chalk choices — tap one. The taster
//        walks back to the cups; the server goes back to her pot.
//   b10  he turns to the cup now labelled GOLD, lifts it on its saucer, sips, and
//        keeps it, the saucer flat at his chest.
//   b11  he sips it once more, contentedly, under the quotation.
//
// COMPOSITION, in stage units: the café's back wall, painted, with a white-tiled dado
// under a wooden rail, a sash window on the left; the café counter 150–392 × 477–500,
// its wooden top at his HIP (AP10) and its front painted green, with the server BEHIND
// it (home 350) and her pot at its right end (376). On its top, left to right: the
// left tent 156–212, the left cup 236, the right cup 256, the right tent 268–324.
// The taster tastes standing IN FRONT of the counter at 246, between the cups. A hand
// at the counter's top can reach only ~6 (the back hand) to ~10 (the front) units
// ahead of him — the top is at his hip, 23 under his shoulder, and the arm is 25 long
// — so each saucer's near rim is within 4 of him, and he turns to face the cup he
// takes. The tents stand OUTSIDE the cups so nothing crosses a word. The hung chalk
// menu 238–388 × 316–396 is on the wall above her. The psychologist stands at 64 and
// the taster waits at 138 (b0) and 124 (b7–b8), off the counter's end, and comes back
// to 239 (b9 on), five units from the cup he slid away. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('psychology');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, psychology-foundations-1), longer where the walking and
 * the handling need it — b1 (5.36s line), b2 (3.84: two cups drunk off their saucers
 * take two and a half seconds each), b7 (4.00), b8 (6.65) and b10 (5.08) run past
 * their lines.
 */
const LINES = [4.79, 6, 7.1, 5.2, 6.45, 0, 6.89, 4.86, 9.2, 0, 4.28, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// arms folded, counting the points.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const FOLD = 161;
const COUNT = 168;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_BOAST = is('boast');
const A_POUR = is('pour');
const A_TASTE = is('taste');
const A_REVEAL = is('reveal');
const A_ARRIVE = is('arrive');
const A_DEFINE = is('define');
const A_METHOD = is('method');
const A_AGAIN = is('again');
const A_REST = is('rest');
const SWAP = BEATS.map((b) => (b.swap ? 1 : 0));
const Q1 = BEATS.map((b) => (b.q1 ? 1 : 0));
const Q2 = BEATS.map((b) => (b.q2 ? 1 : 0));

/** Where each of them stands, beat by beat. The psychologist is off the stage until b4. */
const PL_X = [138, 246, 246, 246, 246, 246, 246, 124, 124, 239, 239, 239, 239];
const TH_X = BEATS.map((b) => (b.th ? 64 : -40));
/** The server: where she walks to at a beat's start (b1 and b8 walk on within the beat, LEGS). */
const CP_X = [206, 206, 350, 350, 350, 350, 350, 350, 314, 350, 350, 350, 350];
/**
 * Which way each faces once there. The taster turns to the psychologist from b4, and
 * from b10 stays turned to the cup he keeps — and so to the psychologist again. On b2
 * he turns to each cup he takes (TURN_L, TURN_R).
 */
const PL_D = [1, 1, 1, 1, -1, -1, -1, -1, -1, 1, -1, -1, -1];
const TH_D = BEATS.map(() => 1);
const CP_D = BEATS.map(() => -1);
/**
 * The server's walks WITHIN a beat, after any walk at its start: [from, to, start s,
 * end s, facing after]. Each lasts at least its distance at WALK_SPEED (56 u/s). She
 * ends a walk FACING the spot she sets a tent on (AR4): a tent is put down in front of
 * her, never reached for behind her back.
 */
const NO_LEGS: number[][] = [];
const LEGS: number[][][] = BEATS.map((_, n) => (
  n === 1 ? [[206, 314, 2.3, 4.25, -1]]
    : n === 8 ? [[314, 202, 1.65, 3.85, -1], [202, 314, 5.1, 7.15, -1]]
      : NO_LEGS
));
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const PL_P = [TALK, LISTEN, TALK, LISTEN, LISTEN, FOLD, NOD, FOLD, LISTEN, LISTEN, LISTEN, LISTEN, LISTEN];
const TH_P = [LISTEN, LISTEN, LISTEN, LISTEN, EXPLAIN, LISTEN, EXPLAIN, LISTEN, COUNT, LISTEN, NOD, NOD, LISTEN];
const CP_P = [LISTEN, TALK, LISTEN, TALK, LISTEN, FOLD, NOD, NOD, LISTEN, LISTEN, TALK, LISTEN, LISTEN];

// ── the counter and what is on it ────────────────────────────────────────────
const TOP = 477;                                   // the counter's top, at his hip
/** Each cup's saucer, centred here on the counter; its cup's handle points away from him. */
const CUP_L = 236;
const CUP_R = 256;
/** Which side each cup's handle is on (+1 right): away from the taster between them. */
const HS_L = -1;
const HS_R = 1;
/** Where the left cup ends up after he slides it away on b2. */
const PUSHED = 228;
/** A saucer's centre on the counter, and the point of it a hand holds: its near half. */
const SAU_Y = TOP - SAUCER_SIZE.h / 2 + 0.2;
const SAU_HOLD = 6;
/** From a saucer's centre to the handle of the cup sitting in it (its foot in the well). */
const ON_X = CAFE_CUP_GRIP.x - CAFE_CUP_GRIP.body;
const ON_Y = -SAUCER_SIZE.top + 0.3 - (CAFE_CUP_GRIP.foot - CAFE_CUP_GRIP.y);
/** The cup's top, for the first question's target. */
const CUP_TOP = SAU_Y - SAUCER_SIZE.top - CAFE_CUP_GRIP.foot;
/** On b2 he turns to the left cup, and back to the server once he has slid it away. */
const TURN_L = 2.62;
const TURN_R = 6.75;
const TENT_W = 56;
const TENT_H = 24;
const TENT_Y = TOP - TENT_H / 2;
const SPOT_L = 184;
const SPOT_R = 296;
const POT_AT = { x: 376, y: TOP - 15 };
/** The pot's handle, and where the pot's centre sits from a hand holding it. */
const POT_GRIP = { x: 366, y: 460 };
const POT_OFF = { x: POT_AT.x - POT_GRIP.x, y: POT_AT.y - POT_GRIP.y };
/** A hand holding a tent holds it by its ridge. */
const TENT_OFF = 9;
/** The hung menu, and the slate inside its frame. */
const SLATE = { left: 248, top: 330, w: 130, h: 55 };
/** The tiled dado along the foot of the back wall, under its wooden rail. */
const DADO_TOP = 446;
const GROUT = [452.5, 459, 465.5, 472, 478.5, 485, 491.5];

// Deep enough to run a little below the ground line, so her feet never show under it.
const COUNTER_ART = cafeCounter(271, TOP + 13, 242, 26);
/** The café's window on the left-hand wall. */
const WINDOW_ART = cafeWindow(92, 354, 72, 68);
const MENU_ART = menuBoard(313, 356, 150, 80);
// The things that move are drawn about the point they are held by and carried by a
// rider: the pot about its own centre, a saucer about its centre, a cup about its
// handle (AR2).
// The pot, the cups and their saucers are DRAWN (LESSON_RULES AM13: lessonart/lessons/
// psych1.mjs, against a filter-coffee decanter and a cup on its saucer) and baked. Each
// picture takes the box its shape-built object had, about the same point: the pot about
// its centre, a cup about its handle, a saucer about its centre.
const POT_PIC = 'psych1-pot';
const CUP_PIC = 'psych1-cup';
const SAUCER_PIC = 'psych1-saucer';
const GOLD_ART = tint(tentCard(0, 0, TENT_W, TENT_H), 'brass');
const BARGAIN_ART = tint(tentCard(0, 0, TENT_W, TENT_H), 'apple');

function hHold(code: number, t: number, phase?: number): Stance {
  'worklet';
  return emoteStill(code, t, phase);
}
function hLive(code: number, t: number, bt: number, phase?: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt, phase);
}
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** Eased 0 → 1 over [a, z] SECONDS of the beat — for handling timed by the clock. */
function sm(b: number, a: number, z: number): number {
  'worklet';
  const u = (b - a) / (z - a);
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/**
 * A WRONG thing tapped shudders where it stands: a side-to-side rattle, fast at first and
 * dying away over 0.65s, as a cup does on its saucer when the counter is knocked. −1…1.
 */
function shudder(g: number): number {
  'worklet';
  if (g <= 0 || g >= 0.65) return 0;
  return Math.sin(g * 42) * (1 - g / 0.65);
}
/**
 * The RIGHT thing hops: a crouch (anticipation), a jump, a squash on landing and a
 * settle — the weight of a thing that has been chosen. `y` in units (up is negative),
 * `sy` its vertical scale, `shine` a glint that flashes at the top of the jump.
 */
function hop(g: number): { y: number; sy: number; shine: number } {
  'worklet';
  if (g <= 0 || g >= 0.72) return { y: 0, sy: 1, shine: 0 };
  if (g < 0.08) return { y: 0, sy: 1 - 0.12 * Math.sin((g / 0.08) * (Math.PI / 2)), shine: 0 };
  if (g < 0.44) {
    const u = (g - 0.08) / 0.36;
    return { y: -9 * Math.sin(u * Math.PI), sy: 1.06 - 0.06 * u, shine: Math.sin(u * Math.PI) };
  }
  const v = (g - 0.44) / 0.28;
  return { y: 0, sy: 1 - 0.14 * Math.sin(v * Math.PI) * (1 - v * 0.4), shine: 0 };
}
/** Q1's three things, and Q2's three rows, in the order of their targets. */
const TASTE_IDS = ['pot', 'cup', 'label'];
const METHOD_IDS = ['ask', 'swap', 'trust'];
const RIGHT_ROW = 1;
/**
 * One figure's walk and facing for a beat. He walks from WHERE HE IS ON SCREEN — `src`,
 * read out of the carry — and turns from the way he was facing ON SCREEN, `dSrc`: a tap
 * mid-walk or mid-turn would otherwise put him somewhere else in one frame (group L).
 * He faces the way he goes (C18), then turns to whom the beat has him face.
 */
function walkOf(src: number, dSrc: number, xs: readonly number[], ds: readonly number[], codes: readonly number[], n: number, t: number, b: number, phase?: number) {
  'worklet';
  const p = n > 0 ? n - 1 : 0;
  const xp = src;
  const xn = xs[n];
  const walking = Math.abs(xn - xp) > 1;
  const walkDur = walking ? moveTr(xp, xn, TR) : 0;
  const walkU = walking ? ease01(clamp01(b / walkDur)) : 1;
  const way = xn > xp ? 1 : -1;
  const dirV = walking
    ? lerp(facing(dSrc, way, b), ds[n], clamp01((b - walkDur) / 0.3))
    : facing(dSrc, ds[n], b);
  const s = walking
    ? travelStance(xp, xn, hHold(codes[p], t, phase), hHold(codes[n], t, phase), hLive(codes[n], t, b, phase), walkU, WALK, 0)
    : hLive(codes[n], t, b, phase);
  return { xp, xn, walking, walkU, walkDur, dirV, s };
}
/**
 * A café cup drunk off its saucer (LESSON_RULES AR3), timed in seconds from `a`. He
 * faces the cup (`d`), whose saucer sits centred at `cx` with the handle away from
 * him. His BACK hand takes the saucer by its near half — the cup on it — and lifts it
 * flat to his chest (`saucerHandAt`); his FRONT hand takes the cup alone by its
 * handle and carries it to his lips (`sipHandAt`), where it tips toward his face
 * (`sipTilt`, drawn by the rider) and his head dips to meet it (`sipHead`); it rests
 * there half a second, comes back down onto the saucer, and the hand lets go. Then —
 * unless `keep` — the saucer goes back where it came from. `inHand`: the saucer is
 * already at his chest (he kept it). It takes 2.6s, or 2.2s kept.
 *
 * Returns the stance, how far the saucer is in his back hand (`ws`), the cup in his
 * front hand (`wc`), and how far the cup is up at his lips (`up`).
 */
function sip(s: Stance, x: number, d: number, cx: number, a: number, b: number, keep: boolean, inHand: boolean) {
  'worklet';
  const t = b - a;
  const P = { x, groundY: GROUND, k: K, dir: d < 0 ? -1 : 1 };
  const reachS = inHand ? 1 : sm(t, 0, 0.28);
  const takeS = inHand ? 1 : sm(t, 0.24, 0.3);
  const lift = inHand ? 1 : sm(t, 0.3, 0.62);
  const reachC = sm(t, 0.5, 0.74);
  const takeC = sm(t, 0.72, 0.78) * (1 - sm(t, 1.86, 1.92));
  const up = sm(t, 0.78, 1.1) * (1 - sm(t, 1.56, 1.88));
  const awayC = sm(t, 1.92, 2.18);
  const down = keep ? 0 : sm(t, 1.96, 2.28);
  const dropS = keep ? 0 : sm(t, 2.28, 2.34);
  const awayS = keep ? 0 : sm(t, 2.34, 2.6);
  // the saucer: from its near half on the counter up to his chest, flat, and back
  const chest = saucerHandAt(s, P);
  const gx = cx - SAU_HOLD * d;
  const gy = SAU_Y + 0.5;
  const sd = sipHead(s, up);
  let out = hand(sd, x, d, -1, lerp(lerp(gx, chest.x, lift), gx, down), lerp(lerp(gy, chest.y, lift), gy, down),
    reachS * (1 - awayS));
  // the cup: its handle where it stands in the saucer at his chest, then up to his lips
  const hx = chest.x + (SAU_HOLD + ON_X) * d;
  const hy = chest.y - 0.5 + ON_Y;
  const lips = sipHandAt(sd, P);
  out = hand(out, x, d, 1, lerp(hx, lips.x, up), lerp(hy, lips.y, up), reachC * (1 - awayC));
  return { s: out, ws: takeS * (1 - dropS), wc: takeC, up };
}
/**
 * The server's walks inside a beat, after the walk at its start. Returns where she is,
 * which way she faces and her stance, all continuous across the leg's ends.
 */
function legsOf(legs: readonly number[][], x0: number, d0: number, s0: Stance, live: Stance, b: number) {
  'worklet';
  let x = x0;
  let d = d0;
  let s = s0;
  for (let j = 0; j < legs.length; j++) {
    const g = legs[j];
    if (b < g[2]) break;
    const way = g[1] > g[0] ? 1 : -1;
    const u = ease01(clamp01((b - g[2]) / (g[3] - g[2])));
    x = lerp(g[0], g[1], u);
    d = b < g[3] ? facing(d, way, b - g[2], 0.3) : facing(way, g[4], b - g[3]);
    s = travelStance(g[0], g[1], live, live, live, u, WALK, 0);
  }
  return { x, d, s };
}

/**
 * A track that MOVES within its beat (a cup lifted, a saucer taken). `carry` blends
 * from what was on screen to the beat's value by `tr`, which would hold a cup a step
 * behind the hand that is lifting it for the whole of the blend. This follows the
 * beat's own value exactly whenever the screen was where the beat starts (`v0`), and
 * only a tap that arrived mid-action decays out over the blend. It is the `next` a
 * `carry` is handed: `carry(cv, k, n, v0, glide(v0, v, tr), tr)`.
 */
function glide(v0: number, v: number, tr: number): number {
  'worklet';
  return tr > 1e-4 ? (v - v0 * (1 - tr)) / tr : v0;
}

const CAM = followMoves(PL_X, BEATS.map(kindOf), seedOf('psychology'));

export default function Psych1Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldPl = useHeld();
  const heldTh = useHeld();
  const heldCp = useHeld();
  const cv = useCarry(20);
  const on = useLinger(i);
  // THE QUESTIONS ANSWER BACK: which of the three things was tapped on each graded beat,
  // and how many seconds ago. A wrong thing shudders where it stands; the right one (the
  // GOLD label) hops and lands with a squash, after a wrong pick too, a beat later, so the
  // reader sees which it was. Each question keeps its own clock, so the second does not
  // replay the first.
  const pick1 = useSharedValue(-1);
  const pick2 = useSharedValue(-1);
  const since1 = useSharedValue(0);
  const since2 = useSharedValue(0);
  useEffect(() => {
    const q1 = Q1[i] === 1;
    const ids = q1 ? TASTE_IDS : Q2[i] ? METHOD_IDS : null;
    if (!ids) return;
    const k = picked === null ? -1 : ids.indexOf(picked);
    const pk = q1 ? pick1 : pick2;
    const sn = q1 ? since1 : since2;
    pk.value = k;
    sn.value = 0;
    if (k >= 0) sn.value = withTiming(4, { duration: 4000, easing: Easing.linear });
  }, [picked, i, pick1, pick2, since1, since2]);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    // each figure settles into its new pose a moment after the one before it, never in step (N22)
    const trAt = (ph: number) => { 'worklet'; return ease01(Math.max(0, b - ph * 0.2) / TR); };
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the taster ──────────────────────────────────────────────────────────
    const src0 = carrySource(cv, 0, n, -30);
    const dSrc0 = carrySource(cv, 11, n, PL_D[0]);
    const wp = walkOf(src0, dSrc0, PL_X, PL_D, PL_P, n, t, b, 3);
    const xPl = carry(cv, 0, n, wp.xp, wp.xn, wp.walking ? wp.walkU : tr);
    // b2: he turns to the left cup to take it (AR4: a thing is taken in front of him),
    // and back to the server once he has slid it away
    const dirPl = !A_TASTE[n] || b < TURN_L ? wp.dirV
      : b < TURN_R ? facing(1, -1, b - TURN_L) : facing(-1, 1, b - TURN_R);
    const dPl = carry(cv, 11, n, dirPl, dirPl, 1);
    let sp = wp.s;
    // each cup: its saucer in his back hand (sw), the cup in his front hand (cw), and
    // how far the cup is up at his lips (up)
    let swR = 0;
    let cwR = 0;
    let upR = 0;
    let swL = 0;
    let cwL = 0;
    let upL = 0;
    // b0: a hand laid on the end of the counter once he is there
    if (A_BOAST[n]) sp = hand(sp, xPl, dPl, 1, 152, 471, sm(b, wp.walkDur + 0.05, wp.walkDur + 0.4));
    // b2: the gold cup first, then — turned to it — the other, then the bargain cup
    // slid away by its side
    let pushL = 0;
    if (A_TASTE[n]) {
      const r = sip(sp, xPl, dPl, CUP_R, 0.2, b, false, false);
      sp = r.s;
      swR = r.ws;
      cwR = r.wc;
      upR = r.up;
      const l = sip(sp, xPl, dPl, CUP_L, 3.5, b, false, false);
      sp = l.s;
      swL = l.ws;
      cwL = l.wc;
      upL = l.up;
      pushL = sm(b, 6.34, 6.6);
      sp = hand(sp, xPl, dPl, 1, CUP_L + 6.5 - (CUP_L - PUSHED) * pushL, SAU_Y - 5.5,
        sm(b, 6.12, 6.34) * (1 - sm(b, 6.62, 6.85)));
    }
    // b10: turned to the one labelled GOLD, now the left: lifted, sipped, and kept
    if (A_AGAIN[n]) {
      const l = sip(sp, xPl, dPl, PUSHED, 0.5, b, true, false);
      sp = l.s;
      swL = l.ws;
      cwL = l.wc;
      upL = l.up;
    }
    // b11, b12: the saucer kept flat at his chest, and one more sip under the quotation
    if (n > 10) {
      const l = sip(sp, xPl, dPl, PUSHED, A_REST[n] ? 0.6 : 1e3, b, true, true);
      sp = l.s;
      swL = l.ws;
      cwL = l.wc;
      upL = l.up;
    }
    const prevPl = carryFrom(heldPl, n, hHold(PL_P[p], t, 3));
    const figPl = keepHeld(heldPl, wp.walking ? mixKeepLegs(prevPl, sp, trAt(0)) : mixStance(prevPl, sp, trAt(0)));

    // ── the psychologist ────────────────────────────────────────────────────
    const src1 = carrySource(cv, 1, n, -40);
    const dSrc1 = carrySource(cv, 12, n, 1);
    const wt = walkOf(src1, dSrc1, TH_X, TH_D, TH_P, n, t, b, 1);
    const xTh = carry(cv, 1, n, wt.xp, wt.xn, wt.walking ? wt.walkU : tr);
    const dTh = carry(cv, 12, n, wt.dirV, wt.dirV, 1);
    let stp = wt.s;
    // b4: he tips his hat once he has arrived, then points at the taster's head
    if (A_ARRIVE[n]) {
      const after = wt.walkDur / L;
      stp = hand(stp, xTh, dTh, 1, xTh + 5, GROUND - 76, bp(after + 0.03, after + 0.1, after + 0.2));
      stp = hand(stp, xTh, dTh, 1, xTh + 40, GROUND - 66, bp(0.58, 0.64, 0.84));
    }
    // b6: a tap on his own head, then an open hand out to the taster
    if (A_DEFINE[n]) {
      stp = hand(stp, xTh, dTh, 1, xTh + 4, GROUND - 68, bp(0.04, 0.12, 0.3));
      stp = hand(stp, xTh, dTh, 1, xTh + 40, GROUND - 48, bp(0.56, 0.66, 0.96));
    }
    // b8: a hand out toward the counter as he describes the swap
    if (A_METHOD[n]) stp = hand(stp, xTh, dTh, -1, xTh + 40, GROUND - 50, bp(0.36, 0.46, 0.66));
    const prevTh = carryFrom(heldTh, n, hHold(TH_P[p], t, 1));
    const figTh = keepHeld(heldTh, wt.walking ? mixKeepLegs(prevTh, stp, tr) : mixStance(prevTh, stp, tr));

    // ── the server, behind her counter ──────────────────────────────────────
    const src2 = carrySource(cv, 2, n, 350);
    const dSrc2 = carrySource(cv, 13, n, -1);
    const wc = walkOf(src2, dSrc2, CP_X, CP_D, CP_P, n, t, b, 9);
    // her walk starts from where she is on screen (src2), so it needs no carry of its own
    const xWalk = lerp(wc.xp, wc.xn, wc.walking ? wc.walkU : 1);
    const lg = legsOf(LEGS[n], xWalk, wc.dirV, wc.s, hLive(CP_P[n], t, b, 9), b);
    const xCp = carry(cv, 2, n, lg.x, lg.x, 1);
    // b3: she turns to the pot to take it by its handle, turns back to show it to him,
    // and turns to it again to set it down (AR4: a thing is taken in front of her)
    const dRev = !A_REVEAL[n] || b < 0.05 ? lg.d
      : b < 1.3 ? facing(-1, 1, b - 0.05)
        : b < 3.0 ? facing(1, -1, b - 1.3)
          : b < 4.1 ? facing(-1, 1, b - 3.0) : facing(1, -1, b - 4.1);
    const dCp = carry(cv, 13, n, dRev, dRev, 1);
    let sc = lg.s;
    // the tents: 0 in her hand · 1 on the counter · 2 in her other hand · 3 on the
    // counter again. BARGAIN: right hand → the left spot → left hand → the right spot.
    // GOLD: left hand → the right spot → right hand → the left spot.
    let tentB = SWAP[n] ? 3 : n >= 2 ? 1 : 0;
    let tentG = SWAP[n] ? 3 : n >= 2 ? 1 : 0;
    let tentO = n >= 2 ? 1 : 0;
    let tentOG = n >= 2 ? 1 : 0;
    // chest: where a carried thing is held, in front of her
    const cx = xCp + 7 * dCp;
    if (A_POUR[n]) {
      // BARGAIN: her right hand dips under the counter, comes up with it and stands it
      // by the left cup; then she walks along (LEGS), turned the way she walks, and the
      // same hand does the same with GOLD by the right cup — in front of her (AR4).
      // Nothing is carried, so nothing crosses her body.
      const relB = sm(b, 2.15, 2.45);
      sc = hand(sc, xCp, dCp, 1, xCp + 8 * dCp, 488, sm(b, 1.0, 1.4) * (1 - relB));
      sc = hand(sc, xCp, dCp, 1, xCp + 10 * dCp, 452, sm(b, 1.4, 1.65) * (1 - relB));
      sc = hand(sc, xCp, dCp, 1, SPOT_L, TENT_Y - TENT_OFF, sm(b, 1.7, 2.0) * (1 - relB));
      const relG = sm(b, 5.5, 5.8);
      sc = hand(sc, xCp, dCp, 1, xCp + 8 * dCp, 488, sm(b, 4.62, 4.9) * (1 - relG));
      sc = hand(sc, xCp, dCp, 1, xCp + 10 * dCp, 452, sm(b, 4.9, 5.1) * (1 - relG));
      sc = hand(sc, xCp, dCp, 1, SPOT_R, TENT_Y - TENT_OFF, sm(b, 5.12, 5.35) * (1 - relG));
      tentB = sm(b, 2.0, 2.15);
      tentG = sm(b, 5.35, 5.5);
      tentO = sm(b, 1.64, 1.74);
      tentOG = sm(b, 5.0, 5.1);
    }
    // b3: the one pot, lifted by its handle to show it, and set down again
    let potW = 0;
    let potUp = 0;
    if (A_REVEAL[n]) {
      // her front hand on the handle once she faces it (taken only once the beat's
      // blend from the last pose is done, at TR, so the hand really is on the handle
      // when the pot starts to follow it); lifted, carried round as she turns to him,
      // and back
      potW = sm(b, 0.82, 0.92) * (1 - sm(b, 3.75, 3.85));
      potUp = sm(b, 0.92, 1.32) * (1 - sm(b, 3.36, 3.75));
      sc = hand(sc, xCp, dCp, 1, xCp + (POT_GRIP.x - CP_X[3]) * dCp, lerp(POT_GRIP.y, 440, potUp),
        sm(b, 0.3, 0.78) * (1 - sm(b, 3.85, 4.15)));
    }
    // b8: the swap — GOLD taken from the right, carried along, BARGAIN lifted from the
    // left, GOLD set down in its place, BARGAIN carried back in front of her, turned the
    // way she walks, and set down on the right (AR4: nothing held behind her)
    if (A_METHOD[n]) {
      sc = hand(sc, xCp, dCp, 1, SPOT_R, TENT_Y - TENT_OFF, sm(b, 0.85, 1.25) * (1 - sm(b, 1.4, 1.7)));
      sc = hand(sc, xCp, dCp, 1, xCp + 14 * dCp, 458, sm(b, 1.4, 1.7) * (1 - sm(b, 4.5, 4.85)));
      sc = hand(sc, xCp, dCp, 1, SPOT_L, TENT_Y - TENT_OFF, sm(b, 4.5, 4.85) * (1 - sm(b, 5.0, 5.3)));
      sc = hand(sc, xCp, dCp, -1, SPOT_L, TENT_Y - TENT_OFF, sm(b, 3.85, 4.2) * (1 - sm(b, 4.35, 4.6)));
      sc = hand(sc, xCp, dCp, -1, xCp + 10 * dCp, 452, sm(b, 4.35, 4.6) * (1 - sm(b, 7.5, 7.8)));
      sc = hand(sc, xCp, dCp, -1, SPOT_R, TENT_Y - TENT_OFF, sm(b, 7.5, 7.8) * (1 - sm(b, 7.95, 8.25)));
      tentG = 1 + sm(b, 1.25, 1.4) + sm(b, 4.85, 5.0);
      tentB = 1 + sm(b, 4.2, 4.35) + sm(b, 7.8, 7.95);
    }
    // b10: she points along the counter at the GOLD tent, then a hand to her chin
    if (A_AGAIN[n]) {
      sc = hand(sc, xCp, dCp, 1, SPOT_L, TENT_Y - 12, bp(0.12, 0.22, 0.5));
      sc = hand(sc, xCp, dCp, 1, xCp + 4 * dCp, GROUND - 52, st(0.74, 0.84));
    }
    const prevCp = carryFrom(heldCp, n, hHold(CP_P[p], t, 9));
    const moving = wc.walking || LEGS[n].length > 0;
    const figCp = keepHeld(heldCp, moving ? mixKeepLegs(prevCp, sc, trAt(2)) : mixStance(prevCp, sc, trAt(2)));

    // where the left cup rests: by its tent, then slid away on b2
    const restL = n > 2 ? PUSHED : lerp(CUP_L, PUSHED, pushL);
    // what each track is at this beat's first frame: a saucer is still in his hand
    // only after he kept it (b11 on)
    const kept = n > 10 ? 1 : 0;

    // the answers' reactions (Q1 on the stage things, Q2 on the menu's rows)
    const k1 = pick1.value;
    const g1 = since1.value;
    const potShake = k1 === 0 ? shudder(g1) : 0;
    const cupRock = k1 === 1 ? shudder(g1) : 0;
    const gold = k1 < 0 ? hop(-1) : hop(g1 - (k1 === 2 ? 0.05 : 0.7));
    const k2 = pick2.value;
    const g2 = since2.value;

    return {
      pl: pose(figPl, xPl, GROUND, K, dPl, 1),
      th: pose(figTh, xTh, GROUND, K, dTh, 1),
      cp: pose(figCp, xCp, GROUND, K, dCp, 1),
      tentB: carry(cv, 3, n, tentB, tentB, tr),
      tentG: carry(cv, 4, n, tentG, tentG, tr),
      tentO: carry(cv, 5, n, tentO, tentO, tr),
      tentOG: carry(cv, 15, n, tentOG, tentOG, tr),
      dPl,
      dCp,
      swR: carry(cv, 6, n, 0, glide(0, swR, tr), tr),
      cwR: carry(cv, 7, n, 0, glide(0, cwR, tr), tr),
      upR: carry(cv, 16, n, 0, glide(0, upR, tr), tr),
      swL: carry(cv, 17, n, kept, glide(kept, swL, tr), tr),
      cwL: carry(cv, 18, n, 0, glide(0, cwL, tr), tr),
      upL: carry(cv, 19, n, 0, glide(0, upL, tr), tr),
      restL: carry(cv, 8, n, n === 2 ? CUP_L : restL, glide(n === 2 ? CUP_L : restL, restL, tr), tr),
      potW: carry(cv, 9, n, 0, glide(0, potW, tr), tr),
      q1: carry(cv, 10, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 14, n, Q2[p], Q2[n], tr),
      potShake,
      cupRock,
      goldY: gold.y,
      goldSy: gold.sy,
      goldShine: k1 === 2 ? gold.shine : 0,
      rowShake: [0, 1, 2].map((k) => (k2 === k && k !== RIGHT_ROW ? shudder(g2) : 0)),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);

  return (
    <View style={styles.scene}>
      <View style={styles.backdrop} pointerEvents="none" />
      <View style={styles.dado} pointerEvents="none" />
      {GROUT.map((y) => <View key={y} style={[styles.grout, { top: y }]} pointerEvents="none" />)}
      <View style={styles.dadoRail} pointerEvents="none" />
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={WINDOW_ART} tone={TONE} />
      <ObjectArt parts={MENU_ART} tone={TONE} />
      <Menu S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.bun.pieces} />
      <ObjectArt parts={COUNTER_ART} tone={TONE} />
      <Tents S={SCENE} DC={DC} />
      <Pot S={SCENE} DC={DC} />
      <View style={styles.ground} pointerEvents="none" />
      <Cups S={SCENE} DP={DP} held={false} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="lead" wear={[]} />
      <Cups S={SCENE} DP={DP} held />
      {on(Q1) ? <TasteTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <MethodTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the things on the counter, and the ones in people's hands ────────────────

type Place = { readonly value: { x: number; y: number; o: number; r?: number; sx?: number; sy?: number } };
function Rider({ at, art, pic, lift, children }: {
  at: Place; art?: readonly ObjPart[]; pic?: string; lift?: boolean; children?: React.ReactNode;
}) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r ?? 0}deg` }, { scaleX: at.value.sx ?? 1 }, { scaleY: at.value.sy ?? 1 },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      {pic ? <LessonPicture name={pic} /> : art ? <ObjectArt parts={art} tone={TONE} /> : null}
      {children}
    </Animated.View>
  );
}

function wristOf(w: SharedValue<Bundle>, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w.value[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

/** A tent's place for its track value: hand A · spot 1 · hand B · spot 2. */
function tentAt(u: number, a: { x: number; y: number }, s1: number, bh: { x: number; y: number }, s2: number) {
  'worklet';
  if (u <= 1) return { x: lerp(a.x, s1, u), y: lerp(a.y + TENT_OFF, TENT_Y, u) };
  if (u <= 2) return { x: lerp(s1, bh.x, u - 1), y: lerp(TENT_Y, bh.y + TENT_OFF, u - 1) };
  return { x: lerp(bh.x, s2, u - 2), y: lerp(bh.y + TENT_OFF, TENT_Y, u - 2) };
}

function Tents({ S, DC }: { S: SharedValue<any>; DC: SharedValue<Bundle> }) {
  const bargain = useDerivedValue(() => {
    const at = tentAt(S.value.tentB, wristOf(DC, 'wrR'), SPOT_L, wristOf(DC, 'wrL'), SPOT_R);
    return { ...at, o: S.value.tentO };
  });
  // both of GOLD's journeys are in her right hand: set down on b1, moved on b8
  const gold = useDerivedValue(() => {
    const at = tentAt(S.value.tentG, wristOf(DC, 'wrR'), SPOT_R, wristOf(DC, 'wrR'), SPOT_L);
    // Q1's answer: it hops and lands squashed, its foot kept on the counter
    const sy = S.value.goldSy;
    return { x: at.x, y: at.y + S.value.goldY + (TENT_H / 2) * (1 - sy), o: S.value.tentOG, sy };
  });
  const shine = useAnimatedStyle(() => {
    const u = S.value.goldShine;
    return { opacity: u, transform: [{ scale: 0.6 + 0.5 * u }] };
  });
  return (
    <>
      <Rider at={bargain} art={BARGAIN_ART}>
        <Text style={styles.tentWord}>BARGAIN</Text>
      </Rider>
      <Rider at={gold} art={GOLD_ART}>
        <Text style={styles.tentWord}>GOLD</Text>
        <Animated.View style={[styles.shine, shine]}>
          <View style={[styles.ray, { left: -1, top: -7, transform: [{ rotate: '0deg' }] }]} />
          <View style={[styles.ray, { left: -9, top: -4, transform: [{ rotate: '-40deg' }] }]} />
          <View style={[styles.ray, { left: 7, top: -4, transform: [{ rotate: '40deg' }] }]} />
        </Animated.View>
      </Rider>
    </>
  );
}

/** The pot, by its handle: turned with her as she turns to show it (its handle toward her). */
function Pot({ S, DC }: { S: SharedValue<any>; DC: SharedValue<Bundle> }) {
  const at = useDerivedValue(() => {
    const w = S.value.potW;
    const d = S.value.dCp;
    const h = wristOf(DC, 'wrR');
    return {
      // Q1's wrong answer: it rattles on the counter, the coffee in it shaken
      x: lerp(POT_AT.x, h.x + POT_OFF.x * d, w) + 1.6 * S.value.potShake,
      y: lerp(POT_AT.y, h.y + POT_OFF.y, w) - 0.9 * Math.abs(S.value.potShake),
      o: 1, sx: lerp(1, d, w), r: 3 * S.value.potShake,
    };
  });
  return <Rider at={at} pic={POT_PIC} />;
}

/**
 * The two cups on their saucers. Each is drawn twice: once BEHIND the taster, on the
 * counter he stands in front of, and once IN FRONT of him, in his hands — and the
 * copy shown changes the moment his hand takes the saucer, where the two are in one
 * place. A saucer rides his back hand, its near half on the palm; a cup rides its
 * saucer, or his front hand by its handle, tipped toward his face at his lips (AR3).
 */
function cupOf(S: SharedValue<any>, DP: SharedValue<Bundle>, left: boolean) {
  'worklet';
  const v = S.value;
  const ws = left ? v.swL : v.swR;
  const wc = left ? v.cwL : v.cwR;
  const up = left ? v.upL : v.upR;
  const rest = left ? v.restL : CUP_R;
  const hs = left ? HS_L : HS_R;
  const d = v.dPl;
  const hl = wristOf(DP, 'wrL');
  const hr = wristOf(DP, 'wrR');
  const sx = lerp(rest, hl.x + SAU_HOLD * d, ws);
  const sy = lerp(SAU_Y, hl.y - 0.5, ws);
  const cx = lerp(sx + ON_X * hs, hr.x, wc);
  const cy = lerp(sy + ON_Y, hr.y, wc);
  // Q1's wrong answer: the gold cup rocks in its saucer
  const rock = left ? 0 : v.cupRock;
  return { sx, sy, cx: cx + 0.8 * rock, cy: cy - 0.5 * Math.abs(rock), r: sipTilt(up, d) + 8 * rock, hs, held: ws > 0.02 };
}
function Cups({ S, DP, held }: { S: SharedValue<any>; DP: SharedValue<Bundle>; held: boolean }) {
  const lS = useDerivedValue(() => {
    const c = cupOf(S, DP, true);
    return { x: c.sx, y: c.sy, o: c.held === held ? 1 : 0 };
  });
  const lC = useDerivedValue(() => {
    const c = cupOf(S, DP, true);
    return { x: c.cx, y: c.cy, o: c.held === held ? 1 : 0, r: c.r, sx: c.hs };
  });
  const rS = useDerivedValue(() => {
    const c = cupOf(S, DP, false);
    return { x: c.sx, y: c.sy, o: c.held === held ? 1 : 0 };
  });
  const rC = useDerivedValue(() => {
    const c = cupOf(S, DP, false);
    return { x: c.cx, y: c.cy, o: c.held === held ? 1 : 0, r: c.r, sx: c.hs };
  });
  return (
    <>
      <Rider at={lS} pic={SAUCER_PIC} lift={held} />
      <Rider at={lC} pic={CUP_PIC} lift={held} />
      <Rider at={rS} pic={SAUCER_PIC} lift={held} />
      <Rider at={rC} pic={CUP_PIC} lift={held} />
    </>
  );
}

// ── the hung menu: the coffees and their prices, and the three choices (Q2) ──

function Menu({ S }: { S: SharedValue<any> }) {
  const menu = useAnimatedStyle(() => ({ opacity: 1 - S.value.q2 }));
  return (
    <View style={styles.slate} pointerEvents="none">
      <Animated.View style={[styles.menuBlock, menu]}>
        <Text style={styles.chalkHead}>COFFEE</Text>
        <Text style={styles.chalkRow}>GOLD  £4</Text>
        <Text style={styles.chalkRow}>BARGAIN  £1</Text>
      </Animated.View>
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the pot, the gold cup and the GOLD tent. The label is what changed the taste. */
const TASTE_Q = [
  { id: 'pot', left: POT_AT.x - 14, top: POT_AT.y - 16, w: 28, h: 31, r: 8, correct: false },
  { id: 'cup', left: CUP_R - 10, top: CUP_TOP - 1.5, w: 20, h: SAU_Y + 2 - (CUP_TOP - 1.5), r: 6, correct: false },
  { id: 'label', left: SPOT_R - TENT_W / 2 + 2, top: TENT_Y - TENT_H / 2 - 1, w: TENT_W - 4, h: TENT_H + 1, r: 4, correct: true },
];
function TasteTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {TASTE_Q.map((q) => (
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

/** Q2: the menu's three chalk choices. Swapping the labels is the test. */
const METHOD_Q = [
  { id: 'ask', label: 'ASK HIM', correct: false },
  { id: 'swap', label: 'SWAP THE LABELS', correct: true },
  { id: 'trust', label: 'TRUST HIS TASTE', correct: false },
];
const ROW_H = SLATE.h / 3;
/** One of Q2's rows: a struck plate on the slate, standing on its ledge; a wrong pick shudders. */
function Row({ S, k, label }: { S: SharedValue<any>; k: number; label: string }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 2.6 * S.value.rowShake[k] }] }));
  return (
    <Animated.View style={[styles.choice, st]}>
      <Text style={styles.choiceText}>{label}</Text>
    </Animated.View>
  );
}
function MethodTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {METHOD_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLATE.left + 5, top: SLATE.top + k * ROW_H + 1.2, width: SLATE.w - 10, height: ROW_H - 5 }}
        >
          <Row S={S} k={k} label={q.label} />
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // the café's back wall: painted, with a white-tiled dado under a wooden rail (AR1)
  backdrop: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: GROUND, backgroundColor: NATURAL.cafeWall.base },
  dado: { position: 'absolute', left: 0, top: DADO_TOP, width: STAGE_W, height: GROUND - DADO_TOP, backgroundColor: NATURAL.tile.base },
  grout: { position: 'absolute', left: 0, width: STAGE_W, height: 0.7, backgroundColor: NATURAL.tile.shade },
  dadoRail: {
    position: 'absolute', left: 0, top: DADO_TOP - 3, width: STAGE_W, height: 3.4, backgroundColor: NATURAL.wood.base,
    borderBottomWidth: 1, borderBottomColor: NATURAL.wood.shade,
  },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  onTop: { zIndex: 2 },
  tentWord: {
    position: 'absolute', left: -24.9, top: -3.6, width: 43, height: 11, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, color: INK, includeFontPadding: false,
  },
  slate: {
    position: 'absolute', left: SLATE.left, top: SLATE.top, width: SLATE.w, height: SLATE.h, borderRadius: 2,
    backgroundColor: NATURAL.slate.base, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  // AQ2: Caveat's letters draw past their advance, so each line's box is the slate's whole
  // width, centred, and the slack beside the words holds the ink (never padding)
  menuBlock: { alignSelf: 'stretch' },
  chalkHead: {
    fontFamily: 'Caveat_700Bold', fontSize: 15, lineHeight: 17, color: PAPER_LIT, includeFontPadding: false, textAlign: 'center', alignSelf: 'stretch', width: SLATE.w,
  },
  chalkRow: {
    fontFamily: 'Caveat_700Bold', fontSize: 13, lineHeight: 15, color: PAPER_LIT, includeFontPadding: false, textAlign: 'center', alignSelf: 'stretch', width: SLATE.w,
  },
  clear: { flexGrow: 1 },
  // a struck plate (group AG): a white face lit along its top, on a hard ledge of the
  // branch's shade that it casts onto the slate
  choice: {
    flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: PLATE_FACE, borderRadius: 5, borderWidth: 1.2, borderColor: INK,
    boxShadow: `inset 0px 1.2px 0px rgba(255, 255, 255, 0.85), 0px 2.4px 0px ${TONE.SHADE}, 0px 3.4px 0px rgba(10, 10, 10, 0.35)`,
  },
  // the glint over the GOLD label as it hops (Q1's right answer)
  shine: { position: 'absolute', left: 0, top: -TENT_H / 2 - 2, width: 0, height: 0 },
  ray: { position: 'absolute', width: 2, height: 5, borderRadius: 1, backgroundColor: NATURAL.brass.base, borderWidth: 0.5, borderColor: INK },
  choiceText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Psych1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Psych1Scene} band={[306, 514]} camera={CAM} />;
}
