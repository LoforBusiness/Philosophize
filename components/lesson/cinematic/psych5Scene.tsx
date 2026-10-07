import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './psych5Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, stageLin, bump } from './pace';
import {
  NATURAL, ps5Lantern, ps5Clock, ps5Gorse, ps5Cake, notepad, pencil,
  PS5_GLOBE, PS5_DIAL, PS5_CAKE_GRIP,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// psychology-foundations-5, "When the Saucer Doesn't Come" — A HILLTOP AT MIDNIGHT:
// A LANTERN-LIT LANDING FIELD UNDER THE STARS, A STREET CLOCK ON A POST, A FRUIT CRATE
// FOR A PULPIT, AND THREE PACKED SUITCASES.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates. A
// prophet (the plain mascot) preaches from a crate that a saucer lands at midnight; a
// believer (the cap) stands behind his packed suitcase with a lemon cake for the
// visitors; a psychologist (the top hat) watches from behind a gorse bush, notebook up.
//
//   b0   the prophet, on his crate, throws both arms up to the sky ("lands on this
//        hill"), then pats his chest on "told me personally". The clock reads 11:56.
//   b1   the believer reaches down to the cake on his suitcase, lifts it, holds it up
//        to the stars on "lemon cake", and brings it back to his chest. 11:57.
//   b2   the psychologist, only his head and notebook over the gorse, writes two lines
//        in the notebook, head bowed to it. 11:58.
//   b3   Q1 — CALL IT BEFORE IT HAPPENS. The minute hand sweeps past twelve; nothing
//        lands; the prophet looks up at the empty sky. Tap one of the three signs
//        leaning on his crate. Answered, WE SAVED THE WORLD springs up in a flash of
//        lamplight; a wrong sign falls flat on its face in the grass.
//   b4   the prophet crouches, snatches up WE SAVED THE WORLD, hoists it over his head,
//        and lowers it to his chest on "you're welcome".
//   b5   the believer hugs his cake to his chest, head bowed in relief.
//   b6   the psychologist steps out from behind the gorse, raises a finger of each hand
//        apart and brings them together until they knock ("clashing"), then opens a
//        hand to the prophet on "cognitive dissonance".
//   b7   he taps his notebook twice ("change the story") and points at the prophet's
//        sign; the prophet hoists it proudly.
//   b8   he opens a hand on "cost you", then points at the believer's suitcase; the
//        believer looks down at it.
//   b9   Q2 — READ THE LUGGAGE TAGS. Tap one of the three cases. Answered, the tag on
//        A HOUSE AND A JOB flips over to HEAVY (and that case thuds, if it was picked);
//        a wrong case hops up, light, and its tag droops.
//   b10  the prophet turns to the clock post, steps over, turns his sign round — its back
//        reads NEXT TUES — and slaps it up on the post over his old TONIGHT poster; then
//        turns back and opens a hand to the believer ("more followers").
//   b11  the quotation; everyone at ease, the lanterns burning low.
//
// COMPOSITION, in stage units. Band [300, 514]. The sky 300–444 in three bands, navy
// overhead to a moonlit haze on the horizon, so three ink figures read against it (a
// moon at 342, 324; twenty-one stars in three twinkling sets); far hills 430–452 with a
// town's lights, mist drifting at 432–444; the hilltop grass 444–500, a mown strip
// 470–486. A lantern on a shepherd's hook at the far left (globe at 22, 439, its flame
// and pool of light flickering), three small far lanterns on the crest (140, 214, 290).
// The street clock 34–78 × 330–500, its dial at 56, 361, an old TONIGHT poster 31–81 ×
// 400–434 on its post. The fruit crate 70–162 × 474–500 with the prophet on it at 108
// (feet at 474; 102 on b10); the three signs, 62 × 28, leaning on it at
// 11–73, 85–147 and 159–221 (y 471–499). The believer at 252 behind his tan case, the
// cases 225–279 · 283–337 · 341–395 (452–500) with 52 × 34 manila tags hanging from their
// handles; the gorse 330–414 × 437–495 with the psychologist behind it at 372, who steps
// out to 314 on b6. The believer and the psychologist stand a step back (ground 494 and
// 482, on the rise behind), so the cases hide their legs.
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, listeners nod along (N21), and no hand moves unless the scene moves it
// (AP18). The cake rides the believer's two hands by its plate, the notebook and the
// pencil the psychologist's wrists, the sign the prophet's (AR2, AR7.4).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('psychology');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 214-unit band: 36.4%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/** Seconds each beat's action is paced over: the voiced line (lib/narration/manifest.ts). */
const LINES = [4.53, 4.88, 5.88, 0, 5.05, 3.06, 7.1, 5.34, 5.08, 0, 5.79, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;
const CROUCH = 13;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_PROCLAIM = is('proclaim');
const A_CAKE = is('cake');
const A_NOTEBOOK = is('notebook');
const A_SAVED = is('saved');
const A_RELIEF = is('relief');
const A_CLASH = is('clash');
const A_STORY = is('story');
const A_COST = is('cost');
const A_POSTERS = is('posters');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.next ? 1 : 0));
const Q2 = BEATS.map((b) => (b.luggage ? 1 : 0));
const N_Q1 = Q1.indexOf(1);
const N_Q2 = Q2.indexOf(1);
const N_SAVED = A_SAVED.indexOf(1);
const N_CAKE = A_CAKE.indexOf(1);
const N_RELIEF = A_RELIEF.indexOf(1);
const N_CLASH = A_CLASH.indexOf(1);
const N_POSTERS = A_POSTERS.indexOf(1);

// ── where each of them stands, and which way each faces, beat by beat ────────
type Track = readonly (readonly number[])[];
/** The prophet, on the crate; on b10 a step along it to the clock post. */
const P_X = 108;
const P_POST = 102;
/** The crate's top: the prophet's ground. */
const CRATE_TOP = 474;
const PRO_LEGS: Track[] = BEATS.map((_, n) => (n < N_POSTERS ? [[0, P_X]] : n === N_POSTERS ? [[0.05, P_POST]] : [[0, P_POST]]));
/** He faces the believer; on b10 he turns to the clock post, and back to wave him on. */
const PRO_TURN: Track[] = BEATS.map((_, n) => (n === N_POSTERS ? [[0, 1], [0.04, -1], [0.86, 1]] : [[0, 1]]));
/** The believer stands a step back, behind his case. */
const C_X = 252;
const C_GROUND = 494;
/** The psychologist, behind the gorse; on b6 he steps out to stand behind the middle case. */
const T_HIDE = 372;
const T_OUT = 314;
const T_GROUND = 482;
const TOP_LEGS: Track[] = BEATS.map((_, n) => (n < N_CLASH ? [[0, T_HIDE]] : [[0, T_OUT]]));
const PRO_P = [TALK, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, NOD, TALK, NOD, LISTEN];
const CAP_P = [NOD, TALK, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, NOD, NOD, LISTEN];
const TOP_P = [NOD, NOD, EXPLAIN, NOD, NOD, NOD, EXPLAIN, EXPLAIN, EXPLAIN, NOD, NOD, NOD, LISTEN];

// ── the hilltop ──────────────────────────────────────────────────────────────
const HORIZON = 444;
/** The clock: its box, and where its dial's centre lands on the stage. */
const CLOCK = { x: 56, y: 415, w: 44, h: 170 };
const DIAL = { x: CLOCK.x - CLOCK.w / 2 + PS5_DIAL.x, y: CLOCK.y - CLOCK.h / 2 + PS5_DIAL.y };
/** The minute on the clock at each beat, counted from eleven o'clock: 11:56 to 12:10. */
const MINUTE = [56, 57, 58, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70];
const LANTERN = { x: 15, y: 452, w: 34, h: 96 };
const GLOBE = {
  x: LANTERN.x - LANTERN.w / 2 + PS5_GLOBE.x * (LANTERN.w / PS5_GLOBE.w),
  y: LANTERN.y - LANTERN.h / 2 + PS5_GLOBE.y * (LANTERN.h / PS5_GLOBE.h),
};
const FAR_LANTERNS = [140, 214, 290];
const CRATE = { x: 116, y: 487, w: 92, h: 26 };
/** The three signs' bottom-centres as they lean on the crate, and their lean (degrees). */
const SIGN_W = 62;
const SIGN_H = 28;
const SIGNS = [
  { id: 'wrong', words: 'WE WERE\nWRONG', x: 42, y: 499, rot: -5 },
  { id: 'saved', words: 'WE SAVED\nTHE WORLD', x: 116, y: 499, rot: 0 },
  { id: 'home', words: 'LET’S GO\nHOME', x: 190, y: 499, rot: 5 },
];
/** Where the saved sign is stuck on the clock post on b10: its bottom-centre. */
const SIGN_POST = { x: CLOCK.x - 2, y: 428 };
/** The three cases: their centres, and the words on their tags. */
const CASE_W = 54;
const CASE_H = 48;
const CASES = [
  { id: 'car', pic: 'tan', words: 'A CAR', x: 252 },
  { id: 'weekend', pic: 'red', words: 'A\nWEEKEND', x: 310 },
  { id: 'house', pic: 'green', words: 'A HOUSE\nAND\nA JOB', x: 368 },
];
/** Where each tag's string is tied: the middle of its case's handle. */
const HANDLE_Y = 452 + 6.4 * (CASE_H / 46);
const TAG_W = 52;
const TAG_H = 34;
/** The cake on the believer's case: where its plate sits (its grip). */
const CAKE_REST = { x: 232, y: 452 + 6.2 * (CASE_H / 46) };
const CAKE_W = 18;
const CAKE_H = CAKE_W * (PS5_CAKE_GRIP.h / PS5_CAKE_GRIP.w);

const CLOCK_ART = ps5Clock(CLOCK.x, CLOCK.y, CLOCK.w, CLOCK.h);
const LANTERN_ART = ps5Lantern(LANTERN.x, LANTERN.y, LANTERN.w, LANTERN.h);
const GORSE_ART = ps5Gorse(372, 466, 84, 58);
// Each held thing is drawn about the point it is held by (AR2).
const CAKE_ART = ps5Cake(0, -CAKE_H / 2, CAKE_W, CAKE_H);
const NOTE_ART = notepad(0, -7, 11, 14);
const PENCIL_ART = pencil(0, 0, 12, 2.6);

const STARS: [number, number, number][] = [
  [100, 312, 0], [132, 330, 1], [170, 308, 2], [196, 342, 0], [228, 318, 1], [262, 336, 2], [292, 306, 0],
  [310, 350, 1], [372, 348, 2], [388, 314, 0], [24, 318, 1], [12, 352, 2], [94, 346, 0], [150, 362, 1],
  [214, 372, 2], [248, 382, 0], [286, 378, 1], [362, 380, 2], [178, 384, 0], [330, 366, 1], [16, 384, 2],
];
const TOWN: [number, number][] = [
  [156, 438], [163, 435], [171, 440], [182, 436], [190, 441], [198, 437], [236, 440], [244, 436], [258, 441],
  [270, 438], [322, 436], [334, 440],
];

function hHold(code: number, t: number, phase?: number): Stance {
  'worklet';
  return emoteStill(code, t, phase);
}
function hLive(code: number, t: number, bt: number, phase?: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt, phase);
}
/** One hand on a stage point, for a figure standing on ground `g`. */
function hand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** Both hands on (nearly) one point — a thing carried in two hands. */
function hands(s: Stance, x: number, g: number, dir: number, tx: number, ty: number, w: number): Stance {
  'worklet';
  return hand(hand(s, x, g, dir, 1, tx + 1.6 * dir, ty, w), x, g, dir, -1, tx - 1.6 * dir, ty + 0.6, w);
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

const CAM = followMoves(PRO_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('psych5'));

export default function Psych5Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldP = useHeld();
  const heldC = useHeld();
  const heldT = useHeld();
  const cv = useCarry(26);
  const on = useLinger(i);
  // Which sign and which case the reader took: kept past the question, so a sign that
  // fell stays down and a flipped tag stays flipped.
  const pk1 = useSharedValue(-1);
  const pk2 = useSharedValue(-1);
  useEffect(() => {
    if (picked === null) return;
    if (Q1[i]) pk1.value = SIGNS.findIndex((s) => s.id === picked);
    if (Q2[i]) pk2.value = CASES.findIndex((c) => c.id === picked);
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

    // ── the prophet (the plain one), on his crate ───────────────────────────
    const wp = legsOf(carrySource(cv, 0, n, P_X), PRO_LEGS[n], b, L);
    const xP = carry(cv, 0, n, wp.x, wp.x, 1);
    const dP = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), PRO_TURN[n], b, L), 1);
    let sp = bodyOf(wp, PRO_P, n, t, b, 0);
    const G = CRATE_TOP;
    // b0: both arms thrown up to the sky on "lands on this hill", down, and a hand
    // patted to his chest on "told me personally"; his head goes up with them
    if (A_PROCLAIM[n]) {
      const wide = st(0.05, 0.18) * (1 - st(0.58, 0.68));
      sp = { ...sp, neck: sp.neck + 0.3 * wide };
      sp = hand(sp, xP, G, dP, 1, xP + 26 * dP, G - 62, wide);
      sp = hand(sp, xP, G, dP, -1, xP + 24 * dP, G - 40, wide);
      sp = hand(sp, xP, G, dP, 1, xP + 6 * dP, G - 44, bp(0.7, 0.78, 0.97));
    }
    // b3: midnight passes, and he looks up at the empty sky
    if (Q1[n]) sp = { ...sp, neck: sp.neck + 0.26 * st(0.04, 0.3) };
    // the saved sign: grabbed on b4, at his chest after, turned round and stuck up on
    // the clock post on b10
    const chest = { x: xP + 12 * dP, y: G - 22 };
    if (A_SAVED[n]) {
      sp = mixStance(sp, postureStill(CROUCH, t), st(0.02, 0.12) * (1 - st(0.2, 0.3)));
      const grab = SIGNS[1];
      const top = { x: grab.x - 4 * dP, y: grab.y - SIGN_H - 1 };
      const high = { x: xP + 18 * dP, y: G - 64 };
      const up = st(0.2, 0.34);
      const down = st(0.76, 0.9);
      const pump = 5 * bp(0.6, 0.66, 0.74);
      const tx = lerp(lerp(top.x, high.x, up), chest.x, down);
      const ty = lerp(lerp(top.y, high.y, up), chest.y, down) - pump;
      sp = hands(sp, xP, G, dP, tx, ty, st(0.04, 0.13));
    } else if (n > N_SAVED && n < N_POSTERS) {
      // held at his chest; hoisted proudly when the psychologist points at it (b7)
      const hoist = A_STORY[n] ? 9 * bp(0.62, 0.72, 0.92) : 0;
      sp = hands(sp, xP, G, dP, chest.x, chest.y - hoist, 1);
    } else if (A_POSTERS[n]) {
      // carried to the post and pressed onto it, smoothed once with the near hand, let go
      const to = st(0.3, 0.46);
      const tx = lerp(chest.x, 80, to);
      const ty = lerp(chest.y, 418, to);
      const letGo = st(0.62, 0.74);
      sp = hand(sp, xP, G, dP, -1, tx + 1.6, ty + 0.6, 1 - st(0.5, 0.6));
      sp = hand(sp, xP, G, dP, 1, tx - 7 * st(0.52, 0.6), ty, 1 - letGo);
      // turned back to the believer, a hand opened to him ("a lot more followers")
      sp = hand(sp, xP, G, dP, 1, xP + 20 * dP, G - 30, bp(0.88, 0.94, 1));
    }
    const prevP = carryFrom(heldP, n, hHold(PRO_P[p], t, 0));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the believer (the cap), behind his suitcase ─────────────────────────
    const xC = C_X;
    const dC = carry(cv, 2, n, -1, -1, 1);
    const GC = C_GROUND;
    let sc = hLive(CAP_P[n], t, b, 1);
    const cChest = { x: xC + 19 * dC, y: GC - 43 };
    const cHug = { x: xC + 13 * dC, y: GC - 44 };
    const cHigh = { x: xC + 12 * dC, y: GC - 74 };
    if (A_CAKE[n]) {
      // down to the cake on his case, up to his chest, up to the stars on "lemon cake",
      // and back to his chest on "I hope they like lemon"
      const lift = st(0.16, 0.3);
      const up = st(0.46, 0.58);
      const down = st(0.78, 0.9);
      const tx = lerp(lerp(lerp(CAKE_REST.x, cChest.x, lift), cHigh.x, up), cChest.x, down);
      const ty = lerp(lerp(lerp(CAKE_REST.y - 1, cChest.y, lift), cHigh.y, up), cChest.y, down);
      sc = hands(sc, xC, GC, dC, tx, ty, st(0.02, 0.12));
      sc = { ...sc, neck: sc.neck + 0.26 * up * (1 - down) - 0.14 * st(0.02, 0.1) * (1 - lift) };
    } else if (n > N_CAKE) {
      // at his chest; hugged in on b5 ("thank goodness") and held close after
      const hug = n > N_RELIEF ? 1 : A_RELIEF[n] ? st(0.06, 0.22) : 0;
      sc = hands(sc, xC, GC, dC, lerp(cChest.x, cHug.x, hug), lerp(cChest.y, cHug.y, hug), 1);
      if (A_RELIEF[n]) sc = { ...sc, neck: sc.neck - 0.28 * bp(0.1, 0.3, 0.8), tilt: sc.tilt - 0.08 * bp(0.1, 0.3, 0.8) };
      // b8: he looks down at his case as it is pointed at
      if (A_COST[n]) sc = { ...sc, neck: sc.neck - 0.24 * bp(0.62, 0.72, 0.96) };
    }
    const prevC = carryFrom(heldC, n, hHold(CAP_P[p], t, 1));
    const figC = keepHeld(heldC, mixStance(prevC, sc, tr));

    // ── the psychologist (the top hat), behind the gorse, then out of it ────
    const wt = legsOf(carrySource(cv, 3, n, T_HIDE), TOP_LEGS[n], b, L);
    const xT = carry(cv, 3, n, wt.x, wt.x, 1);
    const dT = carry(cv, 4, n, -1, -1, 1);
    const GT = T_GROUND;
    let stt = bodyOf(wt, TOP_P, n, t, b, 2);
    // the notebook in his far hand: up over the gorse while he hides, at his chest after
    const out = n < N_CLASH ? 0 : n === N_CLASH ? st(0, 0.15) : 1;
    const nb = { x: xT + 9 * dT, y: lerp(GT - 60, GT - 44, out) };
    let nbx = nb.x;
    let nby = nb.y;
    if (A_CLASH[n]) {
      // the notebook hand comes up to meet the other: two fingers knock
      const meet = st(0.3, 0.42) * (1 - st(0.72, 0.8));
      nbx = lerp(nbx, xT + 10 * dT, meet);
      nby = lerp(nby, GT - 52, meet);
    }
    stt = hand(stt, xT, GT, dT, -1, nbx, nby, 1);
    // the pencil hand: beside the notebook while he hides
    if (n < N_CLASH) stt = hand(stt, xT, GT, dT, 1, xT + 13 * dT, GT - 56, 1);
    if (A_NOTEBOOK[n]) {
      // two lines written across the page, one stroke each (AR5), head bowed to it
      const l1 = stageLin(b, L, 0.2, 0.44);
      const l2 = stageLin(b, L, 0.56, 0.8);
      const second = st(0.46, 0.54);
      const px = nb.x - 4 * dT + 8 * dT * (second > 0.5 ? l2 : l1);
      const py = nb.y - 9 + 3.5 * second;
      stt = hand(stt, xT, GT, dT, 1, px, py, st(0.12, 0.2) * (1 - st(0.84, 0.94)));
      stt = { ...stt, neck: stt.neck - 0.22 * st(0.1, 0.2) * (1 - st(0.86, 0.96)) };
    }
    if (A_CLASH[n]) {
      // a finger of each hand, apart ("two thoughts") and brought together until they
      // knock ("clashing"); then a hand opened to the prophet on "cognitive dissonance"
      const apart = st(0.2, 0.3);
      const join = st(0.38, 0.48);
      const knock = 1.6 * bp(0.48, 0.51, 0.56);
      const kx = lerp(xT + 24 * dT, xT + 14 * dT + knock * dT, join);
      stt = hand(stt, xT, GT, dT, 1, kx, GT - 52, apart * (1 - st(0.72, 0.8)));
      stt = hand(stt, xT, GT, dT, 1, xT + 21 * dT, GT - 46, bp(0.8, 0.88, 1));
    }
    if (A_STORY[n]) {
      // two taps on the notebook ("change the story"), then the prophet's sign
      const tap = bp(0.1, 0.15, 0.21) + bp(0.24, 0.29, 0.35);
      stt = hand(stt, xT, GT, dT, 1, nb.x - 1 * dT, nb.y - 9, tap);
      stt = hand(stt, xT, GT, dT, 1, P_X + 12, GT - 54, bp(0.5, 0.6, 0.95));
    }
    if (A_COST[n]) {
      // an open hand on "cost you", then the believer's case ("this one")
      stt = hand(stt, xT, GT, dT, 1, xT + 20 * dT, GT - 46, bp(0.08, 0.16, 0.42));
      stt = hand(stt, xT, GT, dT, 1, CASES[0].x, GT - 30, bp(0.6, 0.7, 0.97));
    }
    const prevT = carryFrom(heldT, n, hHold(TOP_P[p], t, 2));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the figures, posed ──────────────────────────────────────────────────
    const pro = pose(figP, xP, G, K, dP, 1);
    const cap = pose(figC, xC, GC, K, dC, 1);
    const top = pose(figT, xT, GT, K, dT, 1);

    // ── the saved sign: leaning on the crate, in his hands, on the post ─────
    const pR = wristOf(pro, 'wrR');
    const pL = wristOf(pro, 'wrL');
    const grip = { x: (pR.x + pL.x) / 2, y: (pR.y + pL.y) / 2 };
    const holdT = n < N_SAVED ? 0 : n === N_SAVED ? st(0.13, 0.2) : 1;
    const hold = carry(cv, 5, n, 0, holdT, tr);
    const upT = n < N_SAVED ? 0 : n === N_SAVED ? st(0.22, 0.34) : 1;
    const flipUp = carry(cv, 6, n, 0, upT, tr);
    const swapT = n < N_POSTERS ? 0 : n === N_POSTERS ? st(0.1, 0.3) : 1;
    const swap = carry(cv, 7, n, 0, swapT, tr);
    const turnT = n < N_POSTERS ? 0 : n === N_POSTERS ? st(0.14, 0.32) : 1;
    const turn = carry(cv, 8, n, 0, turnT, tr);
    const stickT = n < N_POSTERS ? 0 : n === N_POSTERS ? st(0.46, 0.52) : 1;
    const stick = carry(cv, 9, n, 0, stickT, tr);
    // held by its top edge as it is snatched up, by its bottom edge once it is up, and
    // by its near edge as it is carried to the post
    const fwdT = A_SAVED[n] ? 18 * st(0.2, 0.34) * (1 - st(0.76, 0.9)) : 0;
    const fwd = carry(cv, 25, n, 0, fwdT, tr);
    const heldX = grip.x + 26 * dP * swap + fwd * dP;
    const heldY = grip.y + lerp(lerp(SIGN_H + 1, 1, flipUp), SIGN_H / 2, swap);

    // ── the answers ─────────────────────────────────────────────────────────
    const a1 = n === N_Q1 ? qv.value : 0;
    const got1 = pk1.value;
    const answered1 = got1 >= 0;
    // the right sign springs up in a flash of lamplight, whichever was taken
    const springNow = answered1 && n === N_Q1 ? 14 * Math.sin(Math.PI * clamp01(a1 / 0.5)) + 4 * Math.sin(Math.PI * clamp01((a1 - 0.5) / 0.3)) : 0;
    const spring = carry(cv, 10, n, 0, springNow, tr);
    const flashNow = answered1 && n === N_Q1 ? Math.sin(Math.PI * clamp01((a1 - 0.5) / 0.3)) : 0;
    const flash = carry(cv, 11, n, 0, flashNow, tr);
    // a wrong one falls flat on its face in the grass, and stays down
    const fallOf = (j: number) => {
      'worklet';
      return got1 === j ? heldAfter(n, N_Q1, ease01(clamp01((a1 - 0.12) / 0.4)), 1) : 0;
    };
    const fallL = carry(cv, 12, n, 0, fallOf(0), tr);
    const fallR = carry(cv, 13, n, 0, fallOf(2), tr);

    const a2 = n === N_Q2 ? qv.value : 0;
    const got2 = pk2.value;
    const answered2 = got2 >= 0;
    // the right tag flips over to HEAVY, whichever was taken, and stays turned
    const flipT = answered2 ? heldAfter(n, N_Q2, ease01(clamp01((a2 - 0.2) / 0.45)), 1) : 0;
    const tagFlip = carry(cv, 14, n, 0, flipT, tr);
    // the right case, picked, thuds down heavily
    const thudNow = got2 === 2 && n === N_Q2 ? Math.sin(Math.PI * clamp01((a2 - 0.04) / 0.32)) : 0;
    const thud = carry(cv, 15, n, 0, thudNow, tr);
    // a wrong case, picked, hops up — it is light — and its tag droops
    const hopOf = (j: number) => {
      'worklet';
      return got2 === j && n === N_Q2 ? 9 * Math.sin(Math.PI * clamp01((a2 - 0.04) / 0.36)) : 0;
    };
    const droopOf = (j: number) => {
      'worklet';
      return got2 === j ? heldAfter(n, N_Q2, ease01(clamp01((a2 - 0.3) / 0.45)), 1) : 0;
    };
    const hop0 = carry(cv, 16, n, 0, hopOf(0), tr);
    const hop1 = carry(cv, 17, n, 0, hopOf(1), tr);
    const droop0 = carry(cv, 18, n, 0, droopOf(0), tr);
    const droop1 = carry(cv, 19, n, 0, droopOf(1), tr);

    // ── the cake: on his case, then in his two hands by its plate ──────────
    const cR = wristOf(cap, 'wrR');
    const cL = wristOf(cap, 'wrL');
    const cakeT = n < N_CAKE ? 0 : n === N_CAKE ? st(0.12, 0.17) : 1;
    const cakeOn = carry(cv, 20, n, 0, cakeT, tr);

    const tR = wristOf(top, 'wrR');
    const tL = wristOf(top, 'wrL');

    return {
      pro, cap, top,
      sign: {
        x: lerp(lerp(SIGNS[1].x, heldX, hold), SIGN_POST.x, stick),
        y: lerp(lerp(SIGNS[1].y - spring, heldY, hold), SIGN_POST.y, stick),
        turn,
        pop: flash,
      },
      fall: [fallL, 0, fallR],
      tagFlip,
      thud,
      hop: [hop0, hop1, 0],
      droop: [droop0, droop1, 0],
      cake: {
        x: lerp(CAKE_REST.x, (cR.x + cL.x) / 2, cakeOn),
        y: lerp(CAKE_REST.y, (cR.y + cL.y) / 2 + 1, cakeOn),
        o: 1,
      },
      note: { x: tL.x, y: tL.y + 1, o: 1 },
      pen: { x: tR.x, y: tR.y, o: 1, r: -24 },
      minute: carry(cv, 21, n, MINUTE[p], MINUTE[n], tr),
      low: carry(cv, 22, n, 1, A_REST[n] || n > N_POSTERS + 1 ? 0.55 : 1, tr),
      q1: carry(cv, 23, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 24, n, Q2[p], Q2[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pro);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.top);
  const cakeP = useDerivedValue<At>(() => SCENE.value.cake);
  const noteP = useDerivedValue<At>(() => SCENE.value.note);
  const penP = useDerivedValue<At>(() => SCENE.value.pen);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Sky clock={clock} />
      <View style={styles.grass} pointerEvents="none" />
      <View style={styles.crest} pointerEvents="none" />
      <View style={styles.strip} pointerEvents="none" />
      <Lamps clock={clock} S={SCENE} />
      <ObjectArt parts={LANTERN_ART} tone={TONE} />
      <ObjectArt parts={CLOCK_ART} tone={TONE} />
      <ClockHands S={SCENE} />
      <View style={styles.poster} pointerEvents="none">
        <Text style={styles.posterText}>TONIGHT</Text>
        <View style={styles.saucerDome} />
        <View style={styles.saucerDisc} />
      </View>
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      <Rider at={noteP} art={NOTE_ART} />
      <Rider at={penP} art={PENCIL_ART} />
      <ObjectArt parts={GORSE_ART} tone={TONE} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      {CASES.map((c, j) => <Case key={c.id} j={j} S={SCENE} />)}
      <Rider at={cakeP} art={CAKE_ART} />
      <LessonPicture name="psych5-crate" />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="lead" wear={[]} />
      <Sign j={0} S={SCENE} />
      <Sign j={2} S={SCENE} />
      <Sign j={1} S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {on(Q1) ? <SignTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <CaseTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the sky: stars that twinkle, a moon, the far hills and a town, the mist ───

function Sky({ clock }: { clock: SharedValue<number> }) {
  const tw0 = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.sin(clock.value * 1.3) }));
  const tw1 = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.sin(clock.value * 0.9 + 2.1) }));
  const tw2 = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.sin(clock.value * 1.7 + 4.2) }));
  const town = useAnimatedStyle(() => ({ opacity: 0.8 + 0.2 * Math.sin(clock.value * 2.3) }));
  // the mist drifts slowly to the right, and comes round again
  const mistA = useAnimatedStyle(() => ({ transform: [{ translateX: ((clock.value * 5) % 560) - 160 }] }));
  const mistB = useAnimatedStyle(() => ({ transform: [{ translateX: ((clock.value * 3.4 + 300) % 560) - 160 }] }));
  const sets = [tw0, tw1, tw2];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.sky} />
      <View style={styles.skyMid} />
      <View style={styles.skyLow} />
      {sets.map((st, g) => (
        <Animated.View key={g} style={[StyleSheet.absoluteFill, st]}>
          {STARS.filter((s) => s[2] === g).map(([x, y], k) => (
            <View key={k} style={[styles.star, { left: x - 1.3, top: y - 1.3 }, k % 3 === 0 ? styles.starBig : null]} />
          ))}
        </Animated.View>
      ))}
      <View style={styles.moon} />
      <View style={styles.moonCut} />
      <View style={styles.hillA} />
      <View style={styles.hillB} />
      <Animated.View style={[StyleSheet.absoluteFill, town]}>
        {TOWN.map(([x, y], k) => <View key={k} style={[styles.townLight, { left: x - 1, top: y - 1 }]} />)}
      </Animated.View>
      <Animated.View style={[styles.mistA, mistA]} />
      <Animated.View style={[styles.mistB, mistB]} />
    </View>
  );
}

// ── the lanterns: a flame and a pool of light each, flickering, burning low at the end ─

function Lamps({ clock, S }: { clock: SharedValue<number>; S: SharedValue<any> }) {
  const flame = useAnimatedStyle(() => {
    const t = clock.value;
    return { transform: [{ scaleY: 1 + 0.14 * Math.sin(t * 9.1) + 0.06 * Math.sin(t * 15.7) }, { scaleX: 1 - 0.06 * Math.sin(t * 7.3) }] };
  });
  const glow = useAnimatedStyle(() => {
    const t = clock.value;
    return { opacity: (0.26 + 0.06 * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 13.1)) * S.value.low };
  });
  const far = useAnimatedStyle(() => ({ opacity: (0.7 + 0.3 * Math.sin(clock.value * 5.3)) * (0.5 + 0.5 * S.value.low) }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {FAR_LANTERNS.map((x) => <View key={x} style={[styles.farPole, { left: x - 0.7 }]} />)}
      <Animated.View style={[StyleSheet.absoluteFill, far]}>
        {FAR_LANTERNS.map((x) => (
          <View key={x}>
            <View style={[styles.farGlow, { left: x - 7 }]} />
            <View style={[styles.farLight, { left: x - 2 }]} />
          </View>
        ))}
      </Animated.View>
      <Animated.View style={[styles.glow, glow]} />
      <Animated.View style={[styles.pool, glow]} />
      <Animated.View style={[styles.flame, flame]} />
    </View>
  );
}

// ── the clock's two hands ─────────────────────────────────────────────────────

function ClockHands({ S }: { S: SharedValue<any> }) {
  const minute = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.minute * 6}deg` }] }));
  const hour = useAnimatedStyle(() => ({ transform: [{ rotate: `${330 + S.value.minute * 0.5}deg` }] }));
  return (
    <View style={styles.dialPin} pointerEvents="none">
      <Animated.View style={[styles.handBox, hour]}>
        <View style={styles.hourHand} />
      </Animated.View>
      <Animated.View style={[styles.handBox, minute]}>
        <View style={styles.minuteHand} />
      </Animated.View>
      <View style={styles.boss} />
    </View>
  );
}

// ── the signs ────────────────────────────────────────────────────────────────

/**
 * One sign, drawn about its bottom-centre. The saved one (j 1) travels — snatched up,
 * held, turned round and stuck on the post — and shows its back once turned; the other
 * two lean on the crate and may fall flat on their faces.
 */
function Sign({ j, S }: { j: number; S: SharedValue<any> }) {
  const sg = SIGNS[j];
  const st = useAnimatedStyle(() => {
    if (j === 1) {
      const s = S.value.sign;
      const c = Math.cos(Math.PI * s.turn);
      return { transform: [{ translateX: s.x }, { translateY: s.y }, { scaleX: Math.max(0.02, Math.abs(c)) * (1 + 0.07 * s.pop) }, { scaleY: 1 - 0.14 * s.pop }] };
    }
    const f = S.value.fall[j];
    return { transform: [{ translateX: sg.x }, { translateY: sg.y }, { rotate: `${sg.rot * (1 - f)}deg` }, { scaleY: 1 - 0.86 * f }] };
  });
  const front = useAnimatedStyle(() => ({ opacity: j === 1 && S.value.sign.turn > 0.5 ? 0 : 1 }));
  // a sign that falls on its face shows its blank back: its words go as it goes down
  const words = useAnimatedStyle(() => ({ opacity: j === 1 ? 1 : 1 - clamp01(S.value.fall[j] * 1.8) }));
  const back = useAnimatedStyle(() => ({ opacity: S.value.sign.turn > 0.5 ? 1 : 0 }));
  return (
    <Animated.View style={[styles.pin, st]} pointerEvents="none">
      <Animated.View style={[styles.board, front]}>
        <Animated.Text style={[styles.boardText, words]}>{sg.words}</Animated.Text>
      </Animated.View>
      {j === 1 ? (
        <Animated.View style={[styles.board, back]}>
          <Text style={styles.boardBack}>NEXT TUES</Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

// ── the cases, and their tags ────────────────────────────────────────────────

function Case({ j, S }: { j: number; S: SharedValue<any> }) {
  const c = CASES[j];
  const body = useAnimatedStyle(() => {
    const sq = j === 2 ? S.value.thud : 0;
    return { transform: [{ translateY: -S.value.hop[j] }, { scaleY: 1 - 0.08 * sq }, { scaleX: 1 + 0.04 * sq }] };
  });
  const tag = useAnimatedStyle(() => {
    const f = j === 2 ? S.value.tagFlip : 0;
    const c2 = Math.cos(Math.PI * f);
    return {
      transform: [
        { translateX: c.x }, { translateY: HANDLE_Y - S.value.hop[j] },
        { rotate: `${26 * S.value.droop[j]}deg` },
        { scaleX: Math.max(0.02, Math.abs(c2)) },
      ],
    };
  });
  const front = useAnimatedStyle(() => ({ opacity: j === 2 && S.value.tagFlip > 0.5 ? 0 : 1 }));
  const back = useAnimatedStyle(() => ({ opacity: j === 2 && S.value.tagFlip > 0.5 ? 1 : 0 }));
  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: `${c.x}px ${GROUND}px` }, body]} pointerEvents="none">
        <LessonPicture name={`psych5-case-${c.pic}`} />
      </Animated.View>
      <Animated.View style={[styles.pin, tag]} pointerEvents="none">
        <View style={styles.tagString} />
        <Animated.View style={[styles.tag, front]}>
          <Text style={styles.tagText}>{c.words}</Text>
        </Animated.View>
        {j === 2 ? (
          <Animated.View style={[styles.tag, styles.tagBack, back]}>
            <Text style={styles.tagBackText}>HEAVY</Text>
          </Animated.View>
        ) : null}
      </Animated.View>
    </>
  );
}

// ── a rider: a thing drawn about the point it is held by ───────────────────

type At = { x: number; y: number; o: number; r?: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof notepad> }) {
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
 * Both are tapped ON THE STAGE (AP6), each target a bare hit box over a real object that
 * carries its own words (AN2): the signs' painted words, the tags' written ones. No two
 * live targets come within 8 units of each other (AN4).
 */
type Q = { id: string; left: number; top: number; w: number; h: number; correct: boolean };
/** Q1 — CALL IT BEFORE IT HAPPENS: the three signs. He will say they saved the world. */
const SIGN_Q: Q[] = SIGNS.map((s) => ({ id: s.id, left: s.x - SIGN_W / 2, top: 452, w: SIGN_W, h: 58, correct: s.id === 'saved' }));
/** Q2 — READ THE LUGGAGE TAGS: the three cases. A house and a job cost the most. */
const CASE_Q: Q[] = CASES.map((c) => ({ id: c.id, left: c.x - 25, top: 446, w: 50, h: 56, correct: c.id === 'house' }));
function SignTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={SIGN_Q} k="q1" />;
}
function CaseTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={CASE_Q} k="q2" />;
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
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place} />
        </Target>
      ))}
    </Animated.View>
  );
}

const N = NATURAL;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  // the night: navy overhead, lighter toward the town on the horizon
  sky: { position: 'absolute', left: 0, right: 0, top: 280, height: HORIZON - 280, backgroundColor: N.ps5Sky.base },
  skyMid: { position: 'absolute', left: 0, right: 0, top: 352, height: HORIZON - 352, backgroundColor: N.ps5SkyMid.base },
  skyLow: { position: 'absolute', left: 0, right: 0, top: 394, height: HORIZON - 394, backgroundColor: N.ps5SkyLow.base },
  star: { position: 'absolute', width: 2.6, height: 2.6, borderRadius: 1.3, backgroundColor: N.ps5Star.base },
  starBig: { transform: [{ scale: 1.5 }] },
  moon: { position: 'absolute', left: 330, top: 312, width: 24, height: 24, borderRadius: 12, backgroundColor: N.ps5Moon.base },
  moonCut: { position: 'absolute', left: 337, top: 307, width: 22, height: 22, borderRadius: 11, backgroundColor: N.ps5Sky.base },
  hillA: { position: 'absolute', left: -60, top: 430, width: 320, height: 40, borderRadius: 20, backgroundColor: N.ps5FarHill.base },
  hillB: { position: 'absolute', left: 180, top: 435, width: 280, height: 34, borderRadius: 17, backgroundColor: N.ps5FarHill.shade },
  townLight: { position: 'absolute', width: 2.2, height: 2.2, borderRadius: 1.1, backgroundColor: N.ps5Glow.base },
  mistA: { position: 'absolute', left: 0, top: 437, width: 150, height: 7, borderRadius: 3.5, backgroundColor: N.ps5Mist.base, opacity: 0.45 },
  mistB: { position: 'absolute', left: 0, top: 432, width: 120, height: 6, borderRadius: 3, backgroundColor: N.ps5Mist.base, opacity: 0.35 },
  // the hilltop, and the mown strip the lanterns light
  grass: { position: 'absolute', left: 0, right: 0, top: HORIZON, height: GROUND - HORIZON, backgroundColor: N.ps5Grass.base },
  crest: { position: 'absolute', left: 0, right: 0, top: HORIZON, height: 1.4, backgroundColor: N.ps5Strip.base },
  strip: { position: 'absolute', left: 0, right: 0, top: 470, height: 16, backgroundColor: N.ps5Strip.base },
  farPole: { position: 'absolute', top: 436, width: 1.4, height: 14, backgroundColor: N.ps5Iron.base },
  farGlow: { position: 'absolute', top: 427, width: 14, height: 14, borderRadius: 7, backgroundColor: N.ps5Glow.base, opacity: 0.35 },
  farLight: { position: 'absolute', top: 432, width: 4, height: 5, borderRadius: 2, backgroundColor: N.ps5Flame.base },
  glow: {
    position: 'absolute', left: GLOBE.x - 18, top: GLOBE.y - 18, width: 36, height: 36, borderRadius: 18,
    backgroundColor: N.ps5Glow.base,
  },
  pool: {
    position: 'absolute', left: GLOBE.x - 30, top: GROUND - 14, width: 60, height: 14, borderRadius: 7,
    backgroundColor: N.ps5Glow.base,
  },
  flame: {
    position: 'absolute', left: GLOBE.x - 2.2, top: GLOBE.y - 4, width: 4.4, height: 7, borderRadius: 2.2,
    backgroundColor: N.ps5Flame.base, transformOrigin: '50% 100%',
  },
  dialPin: { position: 'absolute', left: DIAL.x, top: DIAL.y, width: 0, height: 0 },
  handBox: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  hourHand: { position: 'absolute', left: -1.2, top: -8, width: 2.4, height: 9.5, borderRadius: 1.2, backgroundColor: INK },
  minuteHand: { position: 'absolute', left: -0.8, top: -12, width: 1.6, height: 13.5, borderRadius: 0.8, backgroundColor: INK },
  boss: { position: 'absolute', left: -1.6, top: -1.6, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: INK },
  // the old poster on the clock post: TONIGHT, and a saucer
  poster: {
    position: 'absolute', left: CLOCK.x - 25, top: 400, width: 50, height: 34, alignItems: 'center',
    backgroundColor: N.paper.base, borderWidth: 1.2, borderColor: INK, borderRadius: 1.5, paddingHorizontal: 1, paddingTop: 3,
  },
  posterText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: N.posterRed.base, includeFontPadding: false,
  },
  saucerDome: {
    position: 'absolute', left: 19, top: 17, width: 10, height: 7, borderTopLeftRadius: 5, borderTopRightRadius: 5,
    backgroundColor: N.silver.shade,
  },
  saucerDisc: {
    position: 'absolute', left: 10, top: 22.5, width: 28, height: 5, borderRadius: 2.5, backgroundColor: N.silver.base,
    borderWidth: 0.8, borderColor: INK,
  },
  pin: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  board: {
    position: 'absolute', left: -SIGN_W / 2, top: -SIGN_H, width: SIGN_W, height: SIGN_H, alignItems: 'center', justifyContent: 'center',
    backgroundColor: N.ps5Card.base, borderWidth: 1.2, borderColor: INK, borderRadius: 2, paddingHorizontal: 1.5,
    boxShadow: `0px 3px 0px ${lipOf(TONE)}`,
  },
  boardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: N.ps5Card.label, textAlign: 'center',
    includeFontPadding: false,
  },
  // the back of the saved sign, the new date in red marker
  boardBack: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: N.posterRed.base, textAlign: 'center',
    includeFontPadding: false,
  },
  tagString: { position: 'absolute', left: -0.5, top: 0, width: 1, height: 4, backgroundColor: INK },
  tag: {
    position: 'absolute', left: -TAG_W / 2, top: 3.6, width: TAG_W, height: TAG_H, alignItems: 'center', justifyContent: 'center',
    backgroundColor: N.ps5Manila.base, borderWidth: 1.2, borderColor: INK, borderRadius: 3, paddingHorizontal: 1,
    boxShadow: `0px 2.4px 0px ${lipOf(TONE)}`,
  },
  tagBack: { backgroundColor: N.stopRed.base },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9.6, letterSpacing: 0.2, color: N.ps5Manila.label, textAlign: 'center',
    includeFontPadding: false,
  },
  tagBackText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9.6, letterSpacing: 0.6, color: N.stopRed.label, textAlign: 'center',
    includeFontPadding: false,
  },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  place: { flexGrow: 1 },
});

export function Psych5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Psych5Scene} band={[300, 514]} camera={CAM} />;
}
