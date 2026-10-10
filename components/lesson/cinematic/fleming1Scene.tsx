import { useEffect, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './fleming1Script';
import {
  U, WALK, BLANK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs, seated,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { lipOf } from './stageSkin';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { UNIT2_OUTFITS, WEAR, trousers, coat, sleeves, shirtAndTie, type Band } from './garb';

// ─────────────────────────────────────────────────────────────────────────────
// science-penicillin-1, "The Mould on the Plate" — the first lesson of Science's second unit
// (LESSON_RULES group AW): one true story, told in costume. THE PLAIN ONE IS ALEXANDER
// FLEMING, in his white lab coat; the cap plays Merlin Pryce, his former assistant, and the
// top hat Stuart Craddock, the young colleague who grows the broth (both in lab coats with a
// blue tie; never on the stage together). At the club Fleming and Craddock wear suits.
//
// A DIALOGUE lesson (group AP): people talk and nobody narrates.
// AT2: silent extras: three members of the Medical Research Club in the row of chairs —
// one checks his pocket watch, one dozes and jerks awake, one shifts and creaks his chair;
// not one of them raises a hand, and they get up and go before Craddock's last word. They
// sit a chair apart, so no two fuse.
//
// THE SCIENCE IS DRAWN, not said twice: a round LENS (a magnifier's brass ring on a leader
// line) opens over the thing a line is about and shows it large — a dish of agar cut
// through, colonies coming up on it one by one, Staphylococcus under the microscope in its
// grape-like clusters, three dishes side by side for the question, THE plate with its mould,
// its clear ring and the dissolved colonies at the ring's edge, a flask of broth cut away to
// show the felt of mould on the juice, and the trench plate, whose three streaks GROW toward
// the juice and one of them stops short.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// fleming1.mjs) laid in ONE WORLD 1200 wide: the lab at x 0–400, the back room at 400–800,
// the club at 800–1200. The scene's own camera is the world's translation, `cam`, cut under a
// veil at the start of `flasks` (a pale winter haze), `talk` and `rest` (the dark).
//
//   LAB, far → near: Praed Street through the tall steel window (170–324 × 238–444), the
//   brick terrace opposite and an omnibus going by; the room: cream walls, a grey-green dado,
//   the door at 14–60 onto the corridor and the stairs down to the mould lab, a shelf of
//   bottles, a framed portrait, the BENCH (72–398, top 458, hip high) with its drawers, a
//   Bunsen burner, the brass MICROSCOPE (eyepiece 347, 396), the tied MANUSCRIPT (276–306), a
//   rack of cotton-plugged tubes. On the bench the scene draws the enamel TRAY of Lysol (107),
//   two TOWERS of dishes (186: 12, 216: 8) and the three dishes of the first question (160,
//   176, 192).
//   BACK ROOM: tall shelves of broth flasks each with a white felt of mould (6–134), a copper
//   incubator, a frosty window, the bench (136–318, top 456) with the filter funnel (587
//   world) over its collecting flask, the trench plate (636), the dilution rack; the rabbit
//   hutch on the floor (730–800) with a white rabbit, a mouse in a jar on its roof; a wall
//   calendar (762) high on the wall.
//   CLUB: green paper over oak panelling, a founder's portrait, the white SCREEN (918–1102)
//   with the lantern slide of the trench plate, the LANTERN on a low table at the back and its
//   beam, four chairs (864, 910, 956, 1002), a tall window with curtains, the reading desk
//   (1112) drawn over Fleming.
//
//   b0   the door opens (door 0.35s) and Fleming is there IN the doorway, framed by its near
//        jamb; he steps out of it, sets his suitcase down by the door (crate 2.6s), and the
//        door swings shut behind him (doorshut 3.3s); he walks along the bench and brushes the
//        tall tower, which wobbles and clinks (4.4s); he turns and pats the other (5.6s); then
//        his line. After it the door opens again (b0's tail) and Pryce is in the doorway.
//   b1   Pryce leans in from the doorway, steps out of it, walks to the bench and lifts the
//        top dish off the tall tower (glasslid 3.8s); the door shuts behind him (b1's tail).
//   b2   Fleming takes a dish off the short tower, holds it up to the window light and tilts
//        it; the LENS shows a dish cut through, the agar a thin layer on the glass.
//   b3   Pryce points his pencil at his dish; the LENS shows one germ becoming a colony, then
//        colonies coming up all over the jelly.
//   b4   Fleming walks to the manuscript and taps it twice (paper 2.0s); the LENS on the
//        microscope shows Staphylococcus in its clusters.
//   b5   Pryce scoops the tall tower, turns to the tray and slides the dishes in, twice (drip
//        2.1s, glass 2.7s); three stay dry on top of the heap.
//   b6   Q1 SPOT THE PLATE: Pryce lays the three dry dishes out; three lenses open on them.
//        Right: the ring dish's lens swells and Fleming leans in; wrong: Pryce flicks that dish
//        back into the tray and Fleming shakes his head.
//   b7   Fleming takes the ring dish up to his eye and freezes; the big LENS: the mould.
//   b8   Pryce leans in with his pencil; a dashed ring is drawn round the clear zone and the
//        mould's juice spreads out through it, twice.
//   b9   Fleming taps his nose, twice, pleased, and waves a hand over the untidy bench.
//   b10  a draught pushes the door ajar (creak 0.2s); Pryce looks down at the floorboards and
//        points his pencil at the stairwell; spores drift up through the open door toward the dish.
//   b11  the haze; the back room: Craddock takes a flask off the shelf, carries it to the
//        filter and pours it through (pour 2.7s); the LENS shows the felt of mould on the juice.
//   b12  he sets the flask down, lifts the trench plate and lays it back down (plate 3.1s); its
//        LENS: the trench of juice, and three streaks planted toward it.
//   b13  Q2 CALL THE STREAK: right, the Staphylococcus streak grows and stops short and
//        Craddock gives one grudging nod; wrong, that streak grows right up to the juice and
//        Craddock shakes his head and points at it.
//   b14  every streak grows: the boil germ stops short, the other two reach the trench.
//   b15  Fleming takes the syringe and pushes the plunger once; the rabbit twitches and hops,
//        the mouse washes its face; a plate marks the tubes DILUTED ×800.
//   b16  Craddock holds the flask up to the light and the juice goes pale while the calendar's
//        pages turn (glass 0.7s); he shakes his head.
//   b17  the dark; the club: Fleming squares his notes (paper 0.3s), points at the slide on
//        the screen and opens his hands to the room.
//   b18  silence: a watch is checked, a member dozes and jerks awake, a chair creaks (1.8s);
//        Craddock looks along the row.
//   b19  Fleming folds his notes and writes PENICILLIN on them (pencil 1.4s); the members
//        get up and go.
//   b20  Craddock turns to the empty chairs and gives them a dry look.
//   b21  the dark; the lab at evening, the plate under a bell jar on the bench.
//
// Every figure has its own phase (N22), faces whom he talks to, never walks backwards
// (C18), and every hand that moves holds, lifts, pours, taps, points or writes.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('science');
const W = NATURAL;
const { SHADE } = TONE;
const TR = 0.85;
const K = K_FIG * 0.95;
/** The hand paths were laid out for a figure 0.85 high; they grow with him. */
const KS = K / 0.85;
const G = GROUND;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.0s) and the line together. */
const LINES = [11.2, 4.22, 7.08, 5.45, 5.8, 3.92, 0, 4.79, 4.4, 5.57, 4.46, 6.31, 6.23, 0, 5.66, 7.98, 6.17, 5.03, 4.44, 5.77, 3.04, 0, 0];

const TALK = 167;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const RETURN = at('return');
const HELP = at('help');
const AGAR = at('agar');
const COLONY = at('colony');
const STAPH = at('staph');
const DUNK = at('dunk');
const FUNNY = at('funny');
const RING = at('ring');
const NOSE = at('nose');
const SPORE = at('spore');
const FLASKS = at('flasks');
const TRENCH = at('trench');
const RESULT = at('result');
const MICE = at('mice');
const FADES = at('fades');
const TALKB = at('talk');
const SILENCE = at('silence');
const PAPER = at('paper');
const AFTER = at('after');
const REST = at('rest');
const Q1 = BEATS.map((b) => (b.plates ? 1 : 0));
const Q2 = BEATS.map((b) => (b.streaks ? 1 : 0));
const Q1N = Q1.indexOf(1);
const Q2N = Q2.indexOf(1);
const PLACE = BEATS.map((b) => b.place ?? 0);
/** Who speaks each beat, as a number the worklet can read: 1 Fleming, 2 Craddock, 3 Pryce. */
const SPK = BEATS.map((b) => (b.speaker === 'plain' ? 1 : b.speaker === 'tophat' ? 2 : b.speaker === 'cap' ? 3 : 0));

/**
 * THE LAB DOOR (AW8): the opening is x 14–60 (its centre 37), the near jamb x 60–66. A
 * figure coming in stands IN the opening first, a touch smaller and up on the sill (back in
 * the corridor), drawn behind a copy of the near jamb; he steps forward out of it (growing
 * to full size over his first DOOR_STEP units) and walks on into the room.
 */
const DOOR_X = 37;
const DOOR_STEP = 16;
/** How far into the doorway a figure at world x stands: 1 in the opening, 0 out in the room. */
function inDoor(x: number): number {
  'worklet';
  const u = (x - DOOR_X) / DOOR_STEP;
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return 1 - c * c * (3 - 2 * c);
}

/** Seconds into a place change at which the world is swapped, under the veil. */
const CUT_S = 0.4;
const HX = 400;

const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));
// ── where everybody is at the START of each beat (WORLD x) ──────────────────
/** Fleming: in the doorway (24), by the short tower (232), at the manuscript (262), by the ring dish (200); the back room (716); behind the desk (1126); the lab at evening (232). */
const F_X = per((n) => (n === RETURN ? DOOR_X : n <= STAPH ? 232 : n <= FUNNY ? 262 : n < FLASKS ? 200 : n < TALKB ? HX + 316 : n < REST ? 2 * HX + 326 : 232));
const F_D = per((n) => (n === RETURN ? 1 : -1));
/** Pryce: at the door (40), the bench (156), the tray (134), then at Fleming's shoulder (142). */
const P_X = per((n) => (n <= HELP ? DOOR_X : n <= DUNK ? 156 : n <= RING ? 134 : 142));
const P_D = per(() => 1);
/** Craddock: at the shelves (520), the filter (556), the trench plate (606); seated in the front row (1002). */
const C_X = per((n) => (n <= FLASKS ? HX + 120 : n === TRENCH ? HX + 156 : n < TALKB ? HX + 206 : 2 * HX + 202));
const C_D = per((n) => (n === FLASKS ? -1 : 1));
/** The club members' chairs (the fourth is Craddock's). */
const CHAIRS = [864, 910, 956, 1002];
const SEAT_TOP = 482;
const SEAT_H = (G - SEAT_TOP) / K;

// ── the lab's things ────────────────────────────────────────────────────────
const BENCH_TOP = 458;
const TRAY = { x: 107, y: BENCH_TOP };
const TOWERS = [{ x: 186, n: 12 }, { x: 216, n: 8 }];
const DISH_H = 3.2;
/** The three dishes of the first question on the bench (x), and where each one's lens opens. */
const QD = [
  { id: 'upto', x: 160, lens: 100 },
  { id: 'ring', x: 176, lens: 190 },
  { id: 'full', x: 192, lens: 280 },
] as const;
const SPORES = [[30, 0], [44, 0.11], [52, 0.2], [36, 0.3], [58, 0.38], [26, 0.46], [48, 0.55]] as const;
// ── the back room's things (WORLD x) ────────────────────────────────────────
const SHELF_FLASK = { x: HX + 102, y: 438 };
const FUNNEL = { x: HX + 187, y: 412 };
const CATCH = { x: HX + 188, y: 456 };
const SET_FLASK = { x: HX + 222, y: 456 };
const PLATE = { x: HX + 236, y: 456 };
const RACK = { x: HX + 282, y: 424 };
const RABBIT = { x: HX + 362, y: 492 };
const MOUSE = { x: HX + 384, y: 440 };
const CAL = { x: HX + 362, y: 226 };
// ── the club's things (WORLD x) ─────────────────────────────────────────────
const DESK = { x: 2 * HX + 312, y: G };
const SLIDE = { x: 2 * HX + 210, y: 308 };
/** Screen x of the desk at the club (cam −800). */
const DESK_S = DESK.x - 2 * HX;

// ── the costumes ────────────────────────────────────────────────────────────
/** Nothing on their heads (Fleming's dish is the scene's, so it can be any dish he picks up). */
const FLEMING_HEAD: never[] = [];
const PRYCE_HEAD: never[] = [];
const CRADDOCK_HEAD: never[] = [];
const FLEMING_LAB = UNIT2_OUTFITS.fleming.garb?.bands;
const COLLEAGUE_LAB = UNIT2_OUTFITS.labColleague.garb?.bands;
/** At the club, in their suits: Fleming in light grey with his red tie (it reads on the dark oak), Craddock in brown tweed. */
const FLEMING_SUIT: Band[] = [...trousers(WEAR.suitCharcoal), ...coat(WEAR.greyCoat, 'hip'), ...sleeves(WEAR.greyCoat), ...shirtAndTie(WEAR.shirtWhite, WEAR.tieRed)];
const CRADDOCK_SUIT: Band[] = [...trousers(WEAR.trouserGrey), ...coat(WEAR.tweed, 'hip'), ...sleeves(WEAR.tweed), ...shirtAndTie(WEAR.shirtWhite, WEAR.tieBlue)];
/** The three members: a navy suit, a black frock coat, a cardigan. */
const MEMBER_SUITS: Band[][] = [
  [...trousers(WEAR.suitNavy), ...coat(WEAR.suitNavy, 'hip'), ...sleeves(WEAR.suitNavy), ...shirtAndTie(WEAR.shirtWhite, WEAR.tieBlue)],
  [...trousers(WEAR.trouserDark), ...coat(WEAR.doubletBlack, 'thigh'), ...sleeves(WEAR.doubletBlack), ...shirtAndTie(WEAR.shirtWhite, WEAR.peak)],
  [...trousers(WEAR.suitCharcoal), ...coat(WEAR.cardigan, 'hip'), ...sleeves(WEAR.cardigan), ...shirtAndTie(WEAR.shirtBlue, WEAR.tieRed)],
];

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { upto: 1, ring: 2, full: 3, staph: 4, typhoid: 5, coli: 6 };

/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 11.2;
}
function sm(u: number): number {
  'worklet';
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/** A hand's path across a line: [share of line, x in front of him (his own frame), height above his feet, weight]. */
type Key = readonly [number, number, number, number];
function keyAt(keys: readonly Key[], u: number) {
  'worklet';
  const first = keys[0];
  if (u <= first[0]) return { lx: first[1], ly: first[2], w: first[3] };
  for (let k = 1; k < keys.length; k += 1) {
    const z = keys[k];
    if (u <= z[0]) {
      const a = keys[k - 1];
      const s = sm((u - a[0]) / Math.max(1e-6, z[0] - a[0]));
      return { lx: lerp(a[1], z[1], s), ly: lerp(a[2], z[2], s), w: lerp(a[3], z[3], s) };
    }
  }
  const e = keys[keys.length - 1];
  return { lx: e[1], ly: e[2], w: e[3] };
}
function hand(s: Stance, x: number, g: number, d: number, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  const dir = d < 0 ? -1 : 1;
  return w <= 0.001 ? s : reachHandTo(s, { x, groundY: g, k: K, dir }, which, x + lx * KS * dir, g - ly * KS, w);
}
/** A hand on its path for this beat, in the figure's own frame (AR7.2). */
function keyed(s: Stance, keys: readonly Key[] | null, u: number, x: number, g: number, d: number, which: 1 | -1): Stance {
  'worklet';
  if (!keys || keys.length === 0) return s;
  const k = keyAt(keys, u);
  return hand(s, x, g, d, which, k.lx, k.ly, k.w);
}
/** A hand on its path to points ON THE STAGE ([share, x, y, weight], screen units): it reaches a fixed thing wherever he stands. */
function keyedAt(s: Stance, keys: readonly Key[] | null, u: number, x: number, g: number, d: number, which: 1 | -1): Stance {
  'worklet';
  if (!keys || keys.length === 0) return s;
  const k = keyAt(keys, u);
  const dir = d < 0 ? -1 : 1;
  return k.w <= 0.001 ? s : reachHandTo(s, { x, groundY: g, k: K, dir }, which, k.lx, k.ly, k.w);
}
/** A body leant (+ forward) and a head tipped (+ down); the hands go where the shoulders go. */
function leanOf(s: Stance, tilt: number, neck: number): Stance {
  'worklet';
  if (tilt === 0 && neck === 0) return s;
  const t0 = s.tilt;
  const t1 = s.tilt - tilt;
  const dx = -U.spine * (Math.sin(t1) - Math.sin(t0));
  const dy = -U.spine * (Math.cos(t1) - Math.cos(t0));
  return {
    ...s, tilt: t1, neck: s.neck - neck,
    fistL: { x: s.fistL.x + dx, y: s.fistL.y + dy },
    fistR: { x: s.fistR.x + dx, y: s.fistR.y + dy },
  };
}
/** Up over [a, m], held, and back down over [z0, z1] — of a line `L` long, at time `b`. */
function hd(b: number, L: number, a: number, m: number, z0: number, z1: number): number {
  'worklet';
  return stage(b, L, a, m) * (1 - stage(b, L, z0, z1));
}
function hLive(code: number, t: number, bt: number, phase: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt, phase);
}
function hHold(code: number, t: number, phase: number): Stance {
  'worklet';
  return emoteStill(code, t, phase);
}
/** How long a figure takes to turn round through a profile before he sets off. */
const TURN_S = 0.36;
/**
 * A walk from `src` to `to` that starts `start` seconds into the beat — later if he is
 * facing the wrong way and must turn first (C18: he always walks forwards).
 */
function walkOf(src: number, to: number, start: number, faceSrc: number, b: number) {
  'worklet';
  const d = Math.abs(to - src);
  if (d <= 1) return { x: to, x0: to, x1: to, u: 1, walking: false, ws: 0, we: 0, wd: 0 };
  const wd = to > src ? 1 : -1;
  const ws = (faceSrc < 0 ? -1 : 1) !== wd && start < TURN_S - 0.04 ? TURN_S - 0.04 : start;
  const we = ws + moveTr(src, to, TR);
  const lin = clamp01((b - ws) / (we - ws));
  const e = ease01(lin);
  return { x: lerp(src, to, e), x0: src, x1: to, u: e, walking: b >= ws && lin < 1, ws, we, wd };
}
type Walk = ReturnType<typeof walkOf>;
const STILL: Walk = { x: 0, x0: 0, x1: 0, u: 1, walking: false, ws: 0, we: 0, wd: 0 };
/** Two walks in one beat, the second from where the first ends, starting no sooner than `s2`. */
function walk2(src: number, a: number, s1: number, to: number, s2: number, face: number, b: number): Walk {
  'worklet';
  const w1 = walkOf(src, a, s1, face, b);
  if (b < Math.max(w1.we, s2)) return w1;
  return walkOf(a, to, s2, w1.wd !== 0 ? w1.wd : face, b);
}
/**
 * Which way a figure faces at time `b`: the scripted turns (shares of the line), eased
 * through a profile — but a walk wins: he turns to where he is going just before he sets off.
 */
function faceOf(src: number, turns: readonly (readonly number[])[], b: number, L: number, w: Walk) {
  'worklet';
  const ts: number[] = [];
  const ds: number[] = [];
  for (let k = 0; k < turns.length; k += 1) {
    let tt = turns[k][0] * L;
    const dd = turns[k][1];
    if (w.wd !== 0 && dd !== w.wd && tt >= w.ws - TURN_S - 0.05 && tt < w.we) tt = w.we;
    ts.push(tt);
    ds.push(dd);
  }
  if (w.wd !== 0) {
    ts.push(Math.max(0, w.ws - TURN_S));
    ds.push(w.wd);
  }
  for (let i = 1; i < ts.length; i += 1) {
    for (let j = i; j > 0 && ts[j] < ts[j - 1]; j -= 1) {
      const t0 = ts[j]; ts[j] = ts[j - 1]; ts[j - 1] = t0;
      const d0 = ds[j]; ds[j] = ds[j - 1]; ds[j - 1] = d0;
    }
  }
  let from = src;
  let d = src;
  for (let k = 0; k < ts.length; k += 1) {
    if (b < ts[k]) break;
    d = facing(from, ds[k], b - ts[k], TURN_S);
    from = ds[k];
  }
  return d;
}
/** One figure's body: walking, or holding its pose. */
function bodyOf(w: Walk, code: number, t: number, b: number, phase: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(code, t, phase), hHold(code, t, phase), hLive(code, t, b, phase), w.u, WALK, 0)
    : hLive(code, t, b, phase);
}
/** A joint's place on the stage, out of a figure's bundle. */
function jointOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/** A seated figure on a chair, still (no clock), feet out by `reach`. */
function seatOf(h: number, reach: number): Stance {
  'worklet';
  return seated(h, 0, reach);
}
/** Standing ↔ seated, rising and sitting the way a body does (hands to the knees). */
function seatMix(s: Stance, seat: Stance, w: number): Stance {
  'worklet';
  if (w <= 0.001) return s;
  if (w >= 0.999) return seat;
  const rise = Math.sin(Math.PI * w);
  const r = leanOf(mixStance(s, seat, w), 0.42 * rise, 0.12 * rise);
  return {
    ...r,
    fistL: { x: lerp(r.fistL.x, 13, 0.8 * rise), y: lerp(r.fistL.y, 2, 0.8 * rise) },
    fistR: { x: lerp(r.fistR.x, 16, 0.8 * rise), y: lerp(r.fistR.y, 3, 0.8 * rise) },
  };
}
/** Where a thing held in a hand at `w` sits: `ox` forward, `oy` down. */
function heldAt(w: { x: number; y: number }, d: number, ox: number, oy: number) {
  'worklet';
  return { x: w.x + ox * (d < 0 ? -1 : 1), y: w.y + oy };
}
/** A lens's state: open by `o`, centred at (x, y), radius r, pointing at (tx, ty). */
function lensOf(o: number, x: number, y: number, r: number, tx: number, ty: number) {
  'worklet';
  return { o, x, y, r, tx, ty };
}

/**
 * SMOOTHNESS (AW9): the scene hands every prop its own PART, a derived value per key of
 * SCENE, and a part whose value is the same as last frame is handed back as the very same
 * object, so its setter sees no change and nothing that reads it runs. A thing at opacity 0
 * is the same thing whatever else about it moved. The figures' bundles are left alone
 * (Stickman compares them itself).
 */
function sameFlat(a: any, b: any): boolean {
  'worklet';
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (a.o === 0 && b.o === 0) return true;
  for (const key in b) if (a[key] !== b[key]) return false;
  return true;
}
function steady(prev: Record<string, any> | null, keep: SharedValue<Record<string, any> | null>, next: Record<string, any>) {
  'worklet';
  if (prev) {
    for (const key in next) {
      const v = next[key];
      if (v === null || typeof v !== 'object' || v.opacity !== undefined) continue;
      if (sameFlat(prev[key], v)) next[key] = prev[key];
    }
  }
  keep.value = next;
  return next;
}
/** Every key SCENE hands the props and the stage (the figures read their own bundles). */
const PART_KEYS = [
  'cam', 'haze', 'dark', 'eve', 'lantern', 'watch', 'tBack', 'tSpore', 'jamb',
  'door', 'suit', 'towers', 'stack', 'heapDry', 'splash', 'dUpto', 'dFull', 'ringDish', 'fDish', 'pDish', 'pencil', 'pencilF', 'spores', 'bus',
  'shelfFlask', 'flask', 'pale', 'stream', 'pourLevel', 'plate', 'planted', 'grow', 'syringe', 'hop', 'calPage', 'calFlip',
  'card', 'notes',
  'lensAgar', 'lensCol', 'colGrow', 'colOne', 'lensStaph',
  'lensQ0', 'lensQ1', 'lensQ2',
  'lensRing', 'ringTrace', 'pulse', 'lensFlask', 'lensTrench', 'dil',
  'q1', 'q2',
] as const;
type Parts = Record<string, SharedValue<any>>;
function usePart(S: SharedValue<any>, key: string) {
  return useDerivedValue(() => S.value[key]);
}
function useParts(S: SharedValue<any>): Parts {
  const out: Parts = {};
  // PART_KEYS is a module constant, so this is the same list of hooks on every render
  for (const key of PART_KEYS) out[key] = usePart(S, key); // eslint-disable-line react-hooks/rules-of-hooks
  return out;
}

export default function Fleming1Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldF = useHeld();
  const heldP = useHeld();
  const heldC = useHeld();
  const heldE0 = useHeld();
  const heldE1 = useHeld();
  const heldE2 = useHeld();
  const cv = useCarry(39);
  const on = useLinger(i);
  const pk = useSharedValue(0);
  const last = useSharedValue<Record<string, any> | null>(null);
  useEffect(() => {
    pk.value = picked ? (PICK[picked] ?? 0) : 0;
  }, [picked, pk]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const b0 = bt.value;
    const t = clock.value;
    // a step BACK snaps everyone to where the beat starts, under a quick veil
    const seenN = carrySource(cv, 0, n, n - 1);
    carry(cv, 0, n, n, n, 1);
    const back = seenN > n;
    const cutBeat = n === FLASKS || n === TALKB || n === REST;
    // before the cut of a place change, the old place holds as the last beat left it
    const pre = cutBeat && !back && b0 < CUT_S;
    const nv = pre ? n - 1 : n;
    const b = pre ? 999 : b0;
    const tr = ease01(b0 / TR);
    const L = lineOf(LINES, nv);
    const u = b / L;
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bump = (a: number, m: number, z0: number, z1: number) => {
      'worklet';
      return hd(b, L, a, m, z0, z1);
    };
    /** A stage in SECONDS of this beat (b0's wait and line are one long timeline). */
    const sec = (a: number, z: number) => {
      'worklet';
      return stage(b, 1, a, z);
    };
    const q = qv.value;
    const pc = pk.value;
    const ans = (code: number, Q: readonly number[]) => {
      'worklet';
      return Q[n] && pc === code ? q : 0;
    };
    /** A reaction carried in slot `k`: played on its question beat, left where it ended after. */
    const kept = (k: number, code: number, Q: readonly number[], QN: number) => {
      'worklet';
      return Q[n] ? ans(code, Q) : n > QN && carrySource(cv, k, n, 0) > 0.5 ? 1 : 0;
    };
    const keptTr = (Q: readonly number[]) => {
      'worklet';
      return Q[n] ? tr : 1;
    };
    const place = PLACE[nv];
    const cam = -HX * place;
    const eve = nv >= REST ? 1 : 0;
    // the veils: a pale winter haze into the back room, the dark into the club and the evening, a quick one on a step back
    const cut = cutBeat && !back ? stage(b0, 1, 0.06, CUT_S) * (1 - stage(b0, 1, CUT_S, CUT_S + 0.55)) : 0;
    const backVeil = back ? 1 - stage(b0, 1, 0, 0.45) : 0;
    const haze = n === FLASKS ? cut : 0;
    const dark = Math.max(n === TALKB || n === REST ? cut : 0, backVeil);
    const fresh = back || (cutBeat && !pre);
    const src = (slot: number, table: readonly number[]) => {
      'worklet';
      return fresh ? table[nv] : carrySource(cv, slot, n, table[nv]);
    };
    const sp = (who: number) => {
      'worklet';
      return SPK[nv] === who;
    };

    // ══ FLEMING ══════════════════════════════════════════════════════════════
    const fxs = src(1, F_X);
    const fds = src(2, F_D);
    let fw: Walk = STILL;
    let fx = fxs;
    let fTurns: (readonly number[])[] = [[0, F_D[nv]]];
    let fOn = 1;
    if (nv === RETURN) {
      // the door opens (0.7–1.5s) and he is there IN it, out of the dark corridor; he steps
      // out of the doorway, sets the suitcase down, and walks on along the bench past the towers
      fOn = clamp01((b - 0.95) / 0.25);
      fw = walk2(fxs, 96, 1.3, 232, 2.9, 1, b);
      fTurns = [[0, 1], [S0(5.35), -1]];
    }
    if (nv === STAPH) { fw = walkOf(fxs, 262, 0.1 * L, fds, b); fTurns = [[0, -1], [0.58, -1]]; }
    if (nv === FUNNY) fw = walkOf(fxs, 200, 0.02 * L, fds, b);
    if (nv === MICE) fTurns = [[0, -1], [0.56, 1], [0.88, -1]];
    // a tap that came before he got there: he walks on to where this beat begins
    if (fw.wd === 0 && nv !== RETURN && Math.abs(fxs - F_X[nv]) > 2) fw = walkOf(fxs, F_X[nv], 0, fds, b);
    if (fw.wd !== 0) fx = fw.x;
    const fxS = carry(cv, 1, n, fx, fx, 1) + cam;
    const fd = carry(cv, 2, n, 0, faceOf(fds, fTurns, b, L, fw), 1);
    const fCode = sp(1) ? TALK : NOD;
    let sf = bodyOf(fw, fCode, t, b, 0);
    let fR: readonly Key[] | null = null;
    let fL: readonly Key[] | null = null;
    let fRa: readonly Key[] | null = null;
    let fLa: readonly Key[] | null = null;
    let fLean = 0;
    let fNeck = 0;
    const agarTop = BENCH_TOP - TOWERS[1].n * DISH_H;
    if (nv === RETURN) {
      // the suitcase by its handle, arm down; set down by the door; a pat on the short tower;
      // then a hand on his chest, and a hand over the bench
      fL = [[0, 2, 34, 1], [S0(2.35), 2, 34, 1], [S0(2.6), 8, 22, 1], [S0(2.77), 6, 30, 0]];
      fLean = 0.34 * hd(b, 11.2, S0(2.35), S0(2.55), S0(2.65), S0(2.85));
      fRa = [[S0(5.4), 220, 440, 0], [S0(5.62), 216, agarTop - 1, 1], [S0(5.74), 216, agarTop - 2, 1], [S0(5.92), 216, agarTop - 1, 1], [S0(6.15), 222, 440, 0]];
      fR = [[S0(6.4), 6, 40, 0], [S0(6.8), 4, 62, 1], [S0(8.0), 4, 62, 1], [S0(8.7), 22, 56, 1], [S0(10.3), 26, 54, 1], [S0(11.0), 8, 44, 0.5]];
      fNeck = 0.18 * hd(b, 11.2, S0(5.4), S0(5.65), S0(6.2), S0(6.6)) - 0.12 * hd(b, 11.2, S0(6.8), S0(7.2), S0(8.0), S0(8.5));
    }
    if (nv === HELP) {
      fR = [[0, 8, 44, 0.5], [0.3, 6, 62, 1], [0.45, 6, 62, 1], [0.6, 8, 44, 0.4]];
      fNeck = -0.06 * bump(0.25, 0.35, 0.5, 0.6) + 0.08 * st(0.75, 0.9);
    }
    // the agar dish: taken off the short tower, held up to the window light, tilted, put back
    if (nv === AGAR) {
      const putBack = st(0.84, 0.94);
      if (putBack <= 0.001) {
        fRa = [[0.02, 224, 440, 0], [0.08, 216, agarTop - 1, 1], [0.12, 216, agarTop - 1, 1], [0.16, 220, agarTop - 6, 0]];
        fR = [[0.12, 22, 62, 1], [0.24, 16, 92, 1], [0.8, 16, 92, 1]];
      } else {
        fR = [[0, 16, 92, 1 - putBack]];
        fRa = [[0, 216, agarTop - 1, putBack * (1 - st(0.95, 1))]];
      }
      fL = [[0.3, 6, 44, 0], [0.4, 10, 88, 0.8], [0.8, 10, 88, 0.8], [0.88, 6, 44, 0]];
      fNeck = -0.22 * bump(0.2, 0.3, 0.78, 0.86);
    }
    if (nv === COLONY) {
      fNeck = 0.1 * bump(0.1, 0.2, 0.6, 0.7);
      fLean = 0.08 * bump(0.1, 0.2, 0.6, 0.7);
    }
    if (nv === STAPH) {
      // two taps on the manuscript, then chin up
      fRa = [[0.22, 270, 440, 0], [0.3, 292, 431, 1], [0.35, 292, 437, 1], [0.44, 292, 436, 1], [0.52, 280, 440, 0]];
      fR = [[0.6, 6, 44, 0], [0.7, 4, 62, 1], [0.9, 4, 62, 1]];
      fNeck = -0.16 * st(0.5, 0.6);
      fLean = 0.1 * bump(0.24, 0.3, 0.44, 0.5);
    }
    if (nv === DUNK) fNeck = 0.1 * bump(0.3, 0.4, 0.8, 0.9);
    if (nv === Q1N) {
      // a right answer: he leans in to the ring dish; a wrong one: he shakes his head
      const ok = ans(2, Q1);
      const no = ans(1, Q1) + ans(3, Q1);
      fLean = 0.12 * st(0.05, 0.15) + 0.22 * ok;
      fNeck = 0.1 * st(0.05, 0.15) + 0.14 * ok - 0.1 * Math.sin(Math.PI * 4 * Math.min(1, no)) * (no > 0 ? 1 : 0);
    }
    // the ring dish, up to his eye
    if (nv === FUNNY) {
      fRa = [[0.2, 190, 440, 0], [0.26, 176, 450, 1], [0.32, 176, 450, 1], [0.36, 182, 446, 0]];
      fR = [[0.32, 22, 46, 1], [0.44, 16, 76, 1]];
      fNeck = 0.12 * st(0.4, 0.5);
      fLean = 0.1 * st(0.4, 0.5);
    }
    if (nv === RING) {
      fR = [[0, 16, 76, 1]];
      fNeck = 0.14;
      fLean = 0.04;
    }
    if (nv === NOSE) {
      fR = [[0, 16, 76, 1], [0.7, 16, 76, 1], [0.8, 18, 60, 1]];
      // a finger to his nose, twice, and a hand waved over the untidy bench
      fL = [[0.06, 6, 44, 0], [0.16, 4, 82, 1], [0.22, 6, 84, 1], [0.27, 4, 82, 1], [0.32, 6, 84, 1], [0.42, 6, 44, 0.3], [0.74, 6, 44, 0.3], [0.82, 26, 50, 1], [0.94, 28, 52, 1], [1, 10, 44, 0.4]];
      fNeck = -0.16 * bump(0.1, 0.2, 0.5, 0.6) + 0.08 * bump(0.7, 0.78, 0.9, 1);
      fLean = -0.08 * bump(0.4, 0.5, 0.62, 0.7);
    }
    if (nv === SPORE) {
      fR = [[0, 18, 60, 1], [0.3, 18, 60, 1], [0.5, 20, 52, 1]];
      fNeck = 0.18 * bump(0.2, 0.3, 0.55, 0.65) + 0.1 * st(0.7, 0.8);
    }
    // the back room: he watches Craddock work
    if (nv === FLASKS) fNeck = 0.08 * bump(0.4, 0.5, 0.8, 0.9);
    if (nv === TRENCH) {
      fNeck = 0.1 * st(0.5, 0.6) - 0.08 * bump(0.14, 0.2, 0.3, 0.36) + 0.06 * bump(0.8, 0.86, 0.92, 0.98);
      fLean = 0.06 * st(0.5, 0.6);
      fL = [[0.56, 6, 44, 0], [0.66, 8, 70, 1], [0.96, 8, 70, 1]];
    }
    if (nv === Q2N) {
      fNeck = 0.1 - 0.16 * ans(4, Q2);
      fLean = 0.06 - 0.1 * ans(4, Q2);
    }
    if (nv === RESULT) { fLean = 0.14 * bump(0.1, 0.2, 0.7, 0.8); fNeck = 0.14 * bump(0.1, 0.2, 0.7, 0.8); }
    if (nv === MICE) {
      // the syringe off the bench, held up, the plunger pushed once; turned to the hutch
      fRa = [[0.02, 300, 440, 0], [0.08, 296, 452, 1], [0.12, 296, 452, 1], [0.16, 300, 446, 0]];
      fR = [[0.12, 22, 48, 1], [0.24, 16, 84, 1], [0.5, 16, 84, 1], [0.54, 10, 50, 0], [0.63, 10, 50, 0], [0.68, 20, 62, 1], [0.8, 20, 62, 1], [0.86, 12, 50, 0.4]];
      fL = [[0.28, 6, 44, 0], [0.34, 13, 86, 1], [0.38, 14, 88, 1], [0.42, 13, 86, 1], [0.48, 6, 44, 0]];
      fNeck = -0.12 * bump(0.24, 0.3, 0.46, 0.54) + 0.16 * bump(0.6, 0.66, 0.82, 0.88);
    }
    if (nv === FADES) {
      fL = [[0.5, 6, 44, 0], [0.6, 6, 72, 1], [0.92, 6, 72, 1]];
      fNeck = 0.16 * st(0.4, 0.5);
    }
    // the club, behind the desk
    if (nv === TALKB) {
      fRa = [[0, 316, 448, 0], [0.04, DESK_S - 6, 452, 1], [0.1, DESK_S + 2, 452, 1], [0.16, DESK_S - 6, 452, 1], [0.22, 316, 448, 0]];
      fLa = [[0, 316, 448, 0], [0.04, DESK_S - 2, 454, 1], [0.1, DESK_S + 6, 454, 1], [0.16, DESK_S - 2, 454, 1], [0.22, 316, 448, 0]];
      fR = [[0.3, 8, 44, 0], [0.4, 20, 96, 1], [0.6, 22, 98, 1], [0.7, 8, 44, 0.4]];
      fL = [[0.74, 6, 44, 0], [0.84, 20, 62, 1], [1, 22, 62, 1]];
      fNeck = -0.16 * bump(0.36, 0.44, 0.58, 0.66);
    }
    if (nv === SILENCE) {
      fR = [[0, 22, 62, 1], [0.3, 22, 62, 1], [0.5, 8, 44, 0.4]];
      fL = [[0, 20, 62, 1], [0.3, 20, 62, 1], [0.5, 6, 44, 0.4]];
      fNeck = -0.06 * bump(0.1, 0.2, 0.3, 0.4) + 0.08 * bump(0.5, 0.6, 0.75, 0.85);
    }
    if (nv === PAPER) {
      // the notes folded, and PENICILLIN written on them
      fRa = [[0, 316, 448, 0], [0.06, DESK_S - 10, 452, 1], [0.16, DESK_S + 2, 450, 1], [0.22, DESK_S - 4, 452, 1],
        [0.26, DESK_S - 12, 452, 1], [0.7, DESK_S + 6, 451, 1], [0.78, DESK_S + 6, 451, 1], [0.84, 316, 448, 0]];
      fLa = [[0, 316, 448, 0], [0.06, DESK_S + 8, 454, 1], [0.16, DESK_S - 2, 452, 1], [0.84, DESK_S - 2, 452, 1], [0.9, 316, 448, 0]];
      fNeck = 0.18 * bump(0.04, 0.12, 0.72, 0.82) - 0.1 * bump(0.84, 0.9, 0.95, 1);
      fLean = 0.12 * bump(0.04, 0.12, 0.72, 0.82);
    }
    if (nv === AFTER) {
      fRa = [[0.2, 316, 448, 0], [0.3, DESK_S - 6, 452, 1], [0.5, DESK_S - 6, 452, 1], [0.6, 316, 448, 0]];
      fNeck = 0.1 * bump(0.2, 0.3, 0.5, 0.6);
    }
    if (nv >= REST) fNeck = 0.14 + 0.06 * bump(0.3, 0.45, 0.6, 0.75);
    sf = keyed(sf, fR, u, fxS, G, fd, 1);
    sf = keyed(sf, fL, u, fxS, G, fd, -1);
    sf = keyedAt(sf, fRa, u, fxS, G, fd, 1);
    sf = keyedAt(sf, fLa, u, fxS, G, fd, -1);
    sf = leanOf(sf, fLean, fNeck);
    const prevF = carryFrom(heldF, n, hHold(fCode, t, 0));
    const figF = keepHeld(heldF, fw.walking ? mixKeepLegs(prevF, sf, tr) : mixStance(prevF, sf, tr));
    const inSuitF = place === 2 ? 1 : 0;

    // ══ PRYCE ════════════════════════════════════════════════════════════════
    const pxs = src(3, P_X);
    const pds = src(4, P_D);
    let pw: Walk = STILL;
    let px = pxs;
    let pTurns: (readonly number[])[] = [[0, P_D[nv]]];
    if (nv === HELP) pw = walkOf(pxs, 156, 0.3 * L, 1, b);
    if (nv === DUNK) {
      pTurns = [[0, 1], [0.16, -1], [0.84, 1]];
      pw = walkOf(pxs, 134, 0.24 * L, -1, b);
    }
    if (nv === Q1N) {
      pTurns = [[0, 1], [0.01, -1], [0.2, 1]];
    }
    if (nv === RING) pw = walkOf(pxs, 142, 0.06 * L, 1, b);
    if (nv === SPORE) pTurns = [[0, 1], [0.12, -1], [0.82, 1]];
    if (pw.wd === 0 && Math.abs(pxs - P_X[nv]) > 2) pw = walkOf(pxs, P_X[nv], 0, pds, b);
    if (pw.wd !== 0) px = pw.x;
    const pxS = carry(cv, 3, n, px, px, 1) + cam;
    const pd = carry(cv, 4, n, 0, faceOf(pds, pTurns, b, L, pw), 1);
    // he opens the door after Fleming's line (b0's tail) and is there in the doorway; on b1
    // he is there whichever way the reader came (a quick fade if they tapped on first)
    const pOnT = nv === RETURN ? sec(12.45, 12.75) : place === 0 && nv < REST ? 1 : 0;
    const pOn = carry(cv, 38, n, pOnT, pOnT, nv === HELP && !back ? tr : 1);
    let bP: Bundle = BLANK;
    // a figure nobody can see is not posed at all (AW9): BLANK never changes, so nothing redraws
    if (pOn > 0.001) {
      const pCode = sp(3) ? TALK : NOD;
      let spp = bodyOf(pw, pCode, t, b, 1);
      let pR: readonly Key[] | null = null;
      let pL: readonly Key[] | null = null;
      let pRa: readonly Key[] | null = null;
      let pLa: readonly Key[] | null = null;
      let pLean = 0;
      let pNeck = 0;
      const towerTop0 = BENCH_TOP - TOWERS[0].n * DISH_H;
      if (nv === RETURN) pLean = 0.12 * sec(12.55, 13.0);
      if (nv === HELP) {
        // he leans in at the door; at the bench, the top dish lifted off the tall tower
        pLean = 0.12 * (1 - st(0.18, 0.28));
        if (u <= 0.95) {
          pRa = [[0.82, 170, 446, 0], [0.88, 189, towerTop0 - 1, 1], [0.94, 186, towerTop0 - 4, 1]];
          pLa = [[0.84, 170, 446, 0], [0.9, 182, towerTop0, 1], [0.94, 182, towerTop0 - 3, 1]];
        } else {
          pR = [[0, 12, 56, 1]];
          pL = [[0, 10, 54, 1]];
        }
      }
      // his dish, held at his chest (b2–b4); the pencil in his right hand (b3)
      if (nv === AGAR || nv === STAPH) { pR = [[0, 12, 56, 1]]; pL = [[0, 10, 54, 1]]; pNeck = 0.08; }
      if (nv === COLONY) {
        pL = [[0, 10, 54, 1], [0.1, 14, 58, 1]];
        pR = [[0, 12, 56, 1], [0.12, 6, 50, 1], [0.2, 16, 62, 1], [0.26, 14, 60, 1], [0.32, 16, 62, 1], [0.38, 14, 60, 1], [0.6, 14, 60, 1], [0.7, 10, 52, 1]];
        pNeck = 0.18 * st(0.1, 0.2);
      }
      if (nv === DUNK) {
        // the tall tower scooped up in both hands, carried to the tray, slid in twice
        if (u <= 0.12) {
          pRa = [[0, 180, 446, 0.6], [0.08, 192, 450, 1], [0.12, 192, 450, 1]];
          pLa = [[0, 176, 446, 0.6], [0.08, 180, 452, 1], [0.12, 180, 452, 1]];
        } else {
          pR = [[0.12, 14, 52, 1], [0.24, 14, 52, 1], [0.4, 16, 48, 1], [0.54, 24, 40, 1], [0.7, 28, 36, 1], [0.8, 8, 44, 0]];
          pL = [[0.12, 10, 50, 1], [0.24, 10, 50, 1], [0.4, 12, 46, 1], [0.54, 20, 38, 1], [0.7, 24, 34, 1], [0.8, 6, 44, 0]];
        }
        pNeck = 0.14 * st(0.3, 0.4);
      }
      if (nv === Q1N) {
        // the three dry dishes lifted off the heap and laid out on the bench
        if (u <= 0.17) {
          pRa = [[0.06, TRAY.x + 10, 446, 0], [0.11, TRAY.x + 6, 444, 1], [0.13, TRAY.x + 6, 444, 1], [0.17, TRAY.x + 8, 440, 1]];
          pLa = [[0.06, TRAY.x, 446, 0], [0.11, TRAY.x - 4, 446, 1], [0.13, TRAY.x - 4, 446, 1], [0.17, TRAY.x - 2, 442, 1]];
        } else {
          pR = [[0.17, 14, 52, 1], [0.36, 14, 52, 1], [0.42, 26, 40, 1], [0.48, 26, 40, 1], [0.56, 8, 44, 0.4]];
          pL = [[0.17, 10, 52, 1], [0.36, 10, 52, 1], [0.42, 14, 40, 1], [0.5, 8, 44, 0.3]];
        }
        // a wrong pick: he flicks that dish back into the tray
        const no = ans(1, Q1) + ans(3, Q1);
        if (no > 0) {
          pLean = 0.1 * Math.sin(Math.PI * Math.min(1, no * 1.2));
          pNeck = 0.12 * Math.sin(Math.PI * Math.min(1, no * 1.2));
        }
        pNeck += 0.06 * ans(2, Q1);
      }
      if (nv === FUNNY) pNeck = 0.1 * st(0.4, 0.5);
      if (nv === RING) {
        // he leans in and points his pencil at the clear ring
        pLean = 0.08 * st(0.12, 0.22);
        pNeck = 0.14 * st(0.12, 0.22);
        pR = [[0.12, 8, 44, 0], [0.22, 22, 70, 1], [0.86, 22, 70, 1], [0.94, 10, 50, 0.6]];
      }
      if (nv === NOSE) {
        pLean = -0.12 * bump(0.36, 0.44, 0.6, 0.7);
        pNeck = -0.14 * bump(0.36, 0.44, 0.6, 0.7);
      }
      if (nv === SPORE) {
        // he looks down at the floorboards, and points his pencil at the stairs
        pNeck = 0.3 * bump(0.12, 0.22, 0.7, 0.8);
        pR = [[0.22, 8, 44, 0], [0.32, 24, 40, 1], [0.66, 24, 40, 1], [0.76, 8, 44, 0.3]];
      }
      spp = keyed(spp, pR, u, pxS, G, pd, 1);
      spp = keyed(spp, pL, u, pxS, G, pd, -1);
      spp = keyedAt(spp, pRa, u, pxS, G, pd, 1);
      spp = keyedAt(spp, pLa, u, pxS, G, pd, -1);
      spp = leanOf(spp, pLean, pNeck);
      const prevP = carryFrom(heldP, n, hHold(pCode, t, 1));
      const figP = keepHeld(heldP, pw.walking ? mixKeepLegs(prevP, spp, tr) : mixStance(prevP, spp, tr));
      const dP = inDoor(px);
      bP = pose(figP, pxS, G - 3 * dP, K * (1 - 0.08 * dP), pd, pOn);
    }

    // ══ CRADDOCK ═════════════════════════════════════════════════════════════
    const cxs = src(5, C_X);
    const cds = src(6, C_D);
    let cw: Walk = STILL;
    let cx = cxs;
    let cTurns: (readonly number[])[] = [[0, C_D[nv]]];
    const cSeat = place === 2 ? 1 : 0;
    if (nv === FLASKS) cw = walkOf(cxs, HX + 156, 0.2 * L, -1, b);
    if (nv === TRENCH) cw = walkOf(cxs, HX + 206, 0.14 * L, 1, b);
    if (nv === SILENCE) cTurns = [[0, 1], [0.14, -1], [0.62, 1]];
    if (nv === AFTER) cTurns = [[0, 1], [0.12, -1], [0.8, 1]];
    if (nv === PAPER) cTurns = [[0, 1], [0.3, -1], [0.72, 1]];
    if (cw.wd === 0 && Math.abs(cxs - C_X[nv]) > 2) cw = walkOf(cxs, C_X[nv], 0, cds, b);
    if (cw.wd !== 0) cx = cw.x;
    const cxS = carry(cv, 5, n, cx, cx, 1) + cam;
    const cd = carry(cv, 6, n, 0, faceOf(cds, cTurns, b, L, cw), 1);
    const shelfS = SHELF_FLASK.x + cam;
    const setS = SET_FLASK.x + cam;
    const plateS = PLATE.x + cam;
    // posed only where he can be seen: the back room (bC, his lab coat) or the club (bC2, his suit)
    let bC: Bundle = BLANK;
    let bC2: Bundle = BLANK;
    if (place > 0) {
      const cCode = sp(2) ? TALK : NOD;
      let sc = bodyOf(cw, cCode, t, b, 2);
      let cR: readonly Key[] | null = null;
      let cL: readonly Key[] | null = null;
      let cRa: readonly Key[] | null = null;
      let cLa: readonly Key[] | null = null;
      let cLean = 0;
      let cNeck = 0;
      if (nv === FLASKS) {
        // the flask off the bottom shelf, carried to the filter in both hands, poured through it
        if (u <= 0.14) {
          cRa = [[0, shelfS + 6, 436, 0], [0.06, shelfS + 6, 430, 1], [0.14, shelfS + 6, 426, 1]];
          cLa = [[0, shelfS - 6, 436, 0], [0.06, shelfS - 6, 430, 1], [0.14, shelfS - 6, 426, 1]];
        } else {
          cR = [[0.14, 16, 62, 1], [0.34, 16, 62, 1], [0.42, 26, 86, 1], [0.86, 26, 86, 1], [0.94, 18, 64, 1]];
          cL = [[0.14, 12, 60, 1], [0.34, 12, 60, 1], [0.42, 22, 80, 1], [0.86, 22, 80, 1], [0.94, 14, 62, 1]];
        }
        cNeck = 0.1 * st(0.4, 0.5) + 0.04;
      }
      if (nv === TRENCH) {
        // the flask set down; the plate lifted, shown, laid down again
        if (u <= 0.2) {
          cR = [[0, 18, 64, 1], [0.08, 18, 64, 1]];
          cL = [[0, 14, 62, 1], [0.08, 14, 62, 1]];
          cRa = [[0.08, setS + 6, 446, 0], [0.12, setS + 6, 446, 1], [0.16, setS + 6, 446, 1], [0.2, setS + 6, 446, 0]];
          cLa = [[0.08, setS - 6, 446, 0], [0.12, setS - 6, 446, 1], [0.16, setS - 6, 446, 1], [0.2, setS - 6, 446, 0]];
        } else {
          cRa = [[0.3, plateS + 12, 452, 0], [0.34, plateS + 12, 452, 1], [0.4, plateS + 6, 432, 1], [0.44, plateS + 6, 432, 1], [0.5, plateS + 12, 452, 1], [0.56, plateS + 12, 452, 0]];
          cLa = [[0.3, plateS - 12, 452, 0], [0.34, plateS - 12, 452, 1], [0.4, plateS - 6, 432, 1], [0.44, plateS - 6, 432, 1], [0.5, plateS - 12, 452, 1], [0.56, plateS - 12, 452, 0]];
        }
        cNeck = 0.12 * st(0.3, 0.4);
      }
      if (nv === Q2N) {
        // right: one grudging nod and a finger at the gap; wrong: a shake of the head, a finger at the streak
        const ok = ans(4, Q2);
        const no = ans(5, Q2) + ans(6, Q2);
        cNeck = 0.1 + 0.16 * Math.sin(Math.PI * Math.min(1, ok * 1.5)) - 0.12 * Math.sin(Math.PI * 4 * Math.min(1, no)) * (no > 0 ? 1 : 0);
        const pt = Math.max(ok, no);
        if (pt > 0) cR = [[0, 26, 58, Math.min(1, pt * 3)]];
      }
      if (nv === RESULT) {
        cR = [[0.06, 8, 44, 0], [0.16, 26, 58, 1], [0.7, 26, 58, 1], [0.8, 8, 44, 0.3]];
        cNeck = 0.1;
      }
      if (nv === MICE) {
        // arms folded, watching
        cR = [[0.1, 8, 44, 0], [0.2, 8, 50, 1]];
        cL = [[0.1, 6, 44, 0], [0.2, 10, 52, 1]];
        cNeck = 0.06 * bump(0.6, 0.7, 0.85, 0.95);
      }
      if (nv === FADES) {
        // the filtered flask held up to the light, then a shake of the head
        if (u <= 0.12) {
          cRa = [[0, setS + 6, 446, 0], [0.06, setS + 6, 446, 1], [0.12, setS + 6, 446, 1]];
          cLa = [[0, setS - 6, 446, 0], [0.06, setS - 6, 446, 1], [0.12, setS - 6, 446, 1]];
        } else {
          cR = [[0.12, 14, 52, 1], [0.24, 14, 84, 1], [0.92, 14, 84, 1]];
          cL = [[0.12, 10, 50, 1], [0.24, 10, 82, 1], [0.92, 10, 82, 1]];
        }
        cNeck = -0.14 * st(0.2, 0.3) + 0.1 * Math.sin(Math.PI * 4 * clamp01((u - 0.74) / 0.18)) * bump(0.72, 0.74, 0.9, 0.92);
      }
      if (nv === SILENCE) cNeck = 0.06 * bump(0.2, 0.3, 0.5, 0.6);
      if (nv === PAPER) cNeck = -0.1 * bump(0.34, 0.42, 0.62, 0.7) + 0.08 * bump(0.76, 0.82, 0.9, 0.96);
      if (nv === AFTER) {
        cNeck = -0.16 * bump(0.2, 0.3, 0.8, 0.9);
        cLean = -0.1 * bump(0.2, 0.3, 0.8, 0.9);
      }
      sc = keyed(sc, cR, u, cxS, G, cd, 1);
      sc = keyed(sc, cL, u, cxS, G, cd, -1);
      sc = keyedAt(sc, cRa, u, cxS, G, cd, 1);
      sc = keyedAt(sc, cLa, u, cxS, G, cd, -1);
      sc = leanOf(sc, cLean, cNeck);
      if (cSeat > 0) sc = seatMix(sc, leanOf(seatOf(SEAT_H, 13), cLean, cNeck), cSeat);
      const prevC = carryFrom(heldC, n, hHold(cCode, t, 2));
      const figC = keepHeld(heldC, cw.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));
      if (place === 1) bC = pose(figC, cxS, G, K, cd, 1);
      else bC2 = pose(figC, cxS, G, K, cd, 1);

    }

    // ══ THE THREE MEMBERS (silent) ═══════════════════════════════════════════
    // Each sits facing the speaker and does his own thing, one a beat, at his own moment;
    // they rise and go on b19, and are gone on b20.
    const mHeld = [heldE0, heldE1, heldE2];
    const mB: Bundle[] = [];
    let watch = 0;
    for (let k = 0; k < 3; k += 1) {
      // only the club ever shows them: anywhere else they are BLANK and cost nothing
      if (place !== 2 || nv > AFTER) { mB.push(BLANK); continue; }
      const home = CHAIRS[k];
      const away = home - 230;
      const xs0 = nv === AFTER && !fresh ? carrySource(cv, 7 + 2 * k, n, away) : nv === AFTER ? away : home;
      let w: Walk = STILL;
      let x = nv === AFTER ? xs0 : home;
      let rise = 0;
      const go = 0.04 + 0.04 * k;
      if (nv === PAPER) {
        rise = st(go, go + 0.08);
        w = walkOf(home, away, (go + 0.1) * L, 1, b);
      }
      if (nv === AFTER) { rise = 1; w = walkOf(xs0, away, 0, -1, b); }
      if (w.wd !== 0) x = w.x;
      const xS = (k === 0 ? carry(cv, 7, n, x, x, 1) : k === 1 ? carry(cv, 9, n, x, x, 1) : carry(cv, 11, n, x, x, 1)) + cam;
      const dd = nv === PAPER ? faceOf(1, [], b, L, w) : nv === AFTER ? -1 : 1;
      const d = k === 0 ? carry(cv, 8, n, 0, dd, 1) : k === 1 ? carry(cv, 10, n, 0, dd, 1) : carry(cv, 12, n, 0, dd, 1);
      let s = bodyOf(w, NOD, t, b, 3 + k);
      let mR: readonly Key[] | null = null;
      let mL: readonly Key[] | null = null;
      let lean = 0;
      let neck = 0;
      if (k === 0) {
        if (nv === TALKB) { mR = [[0.2, 10, 30, 0], [0.3, 10, 40, 1]]; mL = [[0.2, 8, 30, 0], [0.3, 12, 42, 1]]; }
        if (nv === SILENCE) {
          // the pocket watch out, looked at, put back
          mR = [[0.14, 12, 30, 0], [0.24, 14, 56, 1], [0.56, 14, 56, 1], [0.66, 12, 30, 0]];
          neck = 0.22 * bump(0.24, 0.32, 0.56, 0.64);
          watch = bump(0.22, 0.26, 0.6, 0.64);
        }
      }
      if (k === 1) {
        if (nv === TALKB) neck = 0.1 * bump(0.5, 0.6, 0.9, 1);
        if (nv === SILENCE) {
          // he dozes off, and jerks awake
          const doze = st(0.08, 0.42) * (1 - st(0.52, 0.56));
          neck = 0.34 * doze - 0.1 * bump(0.52, 0.56, 0.62, 0.72);
          lean = 0.12 * doze - 0.12 * bump(0.52, 0.56, 0.62, 0.72);
        }
      }
      if (k === 2) {
        if (nv === TALKB) { lean = 0.14 * st(0.3, 0.4); mR = [[0.3, 12, 30, 0], [0.4, 14, 40, 0.8]]; }
        if (nv === SILENCE) {
          // he shifts in his chair, and it creaks
          lean = 0.14 - 0.24 * bump(0.34, 0.42, 0.46, 0.56);
          mR = [[0, 14, 40, 0.8], [0.34, 14, 40, 0.8], [0.42, 12, 30, 0]];
        }
      }
      s = keyed(s, mR, u, xS, G, d, 1);
      s = keyed(s, mL, u, xS, G, d, -1);
      s = leanOf(s, lean, neck);
      let seat = seatOf(SEAT_H, 12 + k);
      seat = keyed(seat, mR, u, xS, G, d, 1);
      seat = keyed(seat, mL, u, xS, G, d, -1);
      seat = leanOf(seat, lean, neck);
      s = seatMix(s, seat, 1 - rise);
      const prev = carryFrom(mHeld[k], n, s);
      const fig = keepHeld(mHeld[k], w.walking ? mixKeepLegs(prev, s, tr) : mixStance(prev, s, tr));
      const gone = nv > AFTER || ((nv === AFTER || nv === PAPER) && w.wd !== 0 && w.u >= 1) ? 1 : 0;
      mB.push(gone ? BLANK : pose(fig, xS, G, K, d, 1));
    }

    // ── the bundles ──────────────────────────────────────────────────────────
    // one of his two coats is posed, the other is BLANK (it never changes, so it never redraws)
    const dF = inDoor(fx);
    const bFv = fOn > 0.001 ? pose(figF, fxS, G - 3 * dF, K * (1 - 0.08 * dF), fd, fOn) : BLANK;
    const bF = inSuitF ? BLANK : bFv;
    const bF2 = inSuitF ? bFv : BLANK;
    const fRw = jointOf(bFv, 'wrR');
    const fLw = jointOf(bFv, 'wrL');
    const pRw = jointOf(bP, 'wrR');
    const pLw = jointOf(bP, 'wrL');
    const cRw = jointOf(place === 2 ? bC2 : bC, 'wrR');
    const cLw = jointOf(place === 2 ? bC2 : bC, 'wrL');

    // ── the lab: the door, the suitcase, the towers, the tray, the dishes in hands ──
    // the door (AW8): open for Fleming (0.7–1.5s), swung shut behind him (3.0–3.35s, doorshut),
    // opened again after his line for Pryce (b0's tail, 11.85s); shut behind Pryce after HIS line
    // (b1's tail); pushed ajar by a draught on b10, so the spores have a way up from the stairs
    const doorT = nv === RETURN
      ? sec(0.7, 1.5) * (1 - sec(3.0, 3.35)) + sec(11.85, 12.55)
      : nv === HELP ? 1 - st(0.985, 1.07)
        : nv === SPORE ? 0.5 * st(0.03, 0.2) : 0;
    const door = carry(cv, 37, n, doorT, doorT, nv === RETURN || back || cutBeat ? 1 : tr);
    // the near jamb is drawn over whoever is still IN the opening
    const jamb = Math.max(fOn * inDoor(fx), pOn * inDoor(px));
    const setDown = nv === RETURN ? st(S0(2.55), S0(2.65)) : 1;
    const suitOn = place === 0 && nv < REST ? 1 : 0;
    const suit = setDown < 1 ? { x: fLw.x, y: fLw.y + 22, o: fOn, rot: 0 } : { x: 78, y: G, o: suitOn, rot: 0 };
    // the towers: brushed on b0 (the tall one wobbles), a dish off each, the tall one scooped up on b5
    const wob1 = nv === RETURN && b > 4.4 ? Math.sin((b - 4.4) * 16) * Math.max(0, 1 - (b - 4.4) / 1.2) : 0;
    const wob2 = nv === RETURN && b > 5.65 ? 0.5 * Math.sin((b - 5.65) * 18) * Math.max(0, 1 - (b - 5.65) / 0.6) : 0;
    const t1Taken = nv === HELP ? (u > 0.9 ? 1 : 0) : nv > HELP ? 1 : 0;
    const scooped = nv === DUNK ? (u > 0.1 ? 1 : 0) : nv > DUNK ? 1 : 0;
    const t2Off = nv === AGAR && u > 0.09 && u < 0.93 ? 1 : 0;
    const towers = {
      n1: scooped ? 0 : TOWERS[0].n - t1Taken, n2: TOWERS[1].n - t2Off,
      w1: 2.5 * wob1, w2: 2 * wob2,
      o: place === 0 && nv < REST ? 1 : 0,
    };
    // the scooped stack in his arms (b5), slid into the tray in two goes
    const slid1 = nv === DUNK ? (u > 0.52 ? 1 : 0) : nv > DUNK ? 1 : 0;
    const slid2 = nv === DUNK ? (u > 0.68 ? 1 : 0) : nv > DUNK ? 1 : 0;
    const stackN = nv === DUNK && scooped ? (slid2 ? 0 : slid1 ? 6 : 12) : 0;
    const stack = { x: (pRw.x + pLw.x) / 2, y: Math.max(pRw.y, pLw.y) + 4, n: stackN, o: stackN > 0 ? pOn : 0 };
    // the dry heap in the tray: three dishes sticking up after the dunk; lifted out on Q1
    const heapDry = (nv === DUNK ? st(0.66, 0.7) : nv > DUNK ? 1 : 0) * (nv === Q1N ? (u > 0.14 ? 0 : 1) : nv > Q1N ? 0 : 1) * (place === 0 ? 1 : 0);
    const splash = nv === DUNK ? Math.max(bump(0.5, 0.53, 0.56, 0.66), bump(0.66, 0.69, 0.72, 0.82)) : 0;
    // the three Q1 dishes: in his hands, then laid out on the bench; a wrong one flicked into the tray
    const qLay = nv === Q1N ? (u > 0.45 ? 1 : 0) : nv > Q1N ? 1 : 0;
    const qHeld = nv === Q1N && u > 0.14 && !qLay ? 1 : 0;
    const rUpto = carry(cv, 13, n, 0, kept(13, 1, Q1, Q1N), keptTr(Q1));
    const rRing = carry(cv, 14, n, 0, kept(14, 2, Q1, Q1N), keptTr(Q1));
    const rFull = carry(cv, 15, n, 0, kept(15, 3, Q1, Q1N), keptTr(Q1));
    const ringTaken = nv === FUNNY ? (u > 0.27 ? 1 : 0) : nv > FUNNY ? 1 : 0;
    const qOn = place === 0 && nv >= Q1N && nv < REST && (qHeld || qLay) ? 1 : 0;
    const qDish = (k: number, r: number) => {
      'worklet';
      const d0 = QD[k];
      // a wrong pick flies in an arc back into the tray
      const f = clamp01(r * 1.4);
      const x = qHeld ? (pRw.x + pLw.x) / 2 + (k - 1) * 3 : lerp(d0.x, TRAY.x + 4, f);
      const y = qHeld ? Math.max(pRw.y, pLw.y) + 2 - k * DISH_H : lerp(BENCH_TOP, TRAY.y - 6, f) - 26 * Math.sin(Math.PI * f);
      return { x, y, o: qOn, rot: 300 * f };
    };
    const dUpto = qDish(0, rUpto);
    const dFull = qDish(2, rFull);
    const dRing = qDish(1, 0);
    // Fleming's dish in his right hand: the agar dish (b2), the ring dish (b7–b10)
    const fHas = (t2Off && nv === AGAR) || ringTaken && nv >= FUNNY && nv <= SPORE ? 1 : 0;
    const fDishAt = { x: fRw.x + 5 * (fd < 0 ? -1 : 1), y: fRw.y - 1 };
    const tilt = nv === AGAR ? 26 * bump(0.3, 0.4, 0.7, 0.8) * (fd < 0 ? -1 : 1) : -12 * (fd < 0 ? -1 : 1);
    const fDish = { x: fDishAt.x, y: fDishAt.y, o: fHas, rot: tilt };
    const ringDish = { x: dRing.x, y: dRing.y, o: dRing.o * (1 - ringTaken) };
    // Pryce's dish (b1–b4) and his pencil (b3, b8, b10)
    const pDishOn = (nv === HELP && u > 0.94) || (nv > HELP && nv < DUNK) ? 1 : 0;
    const pDish = { x: pLw.x + 4 * (pd < 0 ? -1 : 1), y: pLw.y - 2, o: carry(cv, 34, n, 0, pDishOn * pOn, tr), rot: -10 * (pd < 0 ? -1 : 1) };
    const pencilOn = nv === COLONY ? st(0.12, 0.16) : nv === RING || nv === SPORE ? st(0.1, 0.18) : 0;
    const pencil = { x: pRw.x, y: pRw.y, o: carry(cv, 31, n, 0, pencilOn * pOn, tr), rot: nv === SPORE ? 130 * (pd < 0 ? -1 : 1) : 60 * (pd < 0 ? -1 : 1) };
    // the spores drifting up from the stairwell (b10)
    const spores = carry(cv, 35, n, 0, nv === SPORE ? stage(b, L, 0.18, 1) : nv > SPORE ? 1 : 0, nv === SPORE ? 1 : tr);
    // the clocks of things that only live in one place stop where the camera cannot see them
    const tLab = place === 0 && nv < REST ? t : 0;
    const tBack = place === 1 ? t : 0;
    const tSpore = nv === SPORE ? t : 0;
    // the omnibus going by outside
    const bus = { x: ((tLab * 15) % 520) + 60, y: 432 + 0.6 * Math.sin(tLab * 7) };

    // ── the back room ──
    const fTook = nv === FLASKS ? (u > 0.08 ? 1 : 0) : nv > FLASKS ? 1 : 0;
    const shelfFlask = { x: SHELF_FLASK.x, y: SHELF_FLASK.y, o: fTook ? 0 : 1 };
    const pour = nv === FLASKS ? st(0.42, 0.5) * (1 - st(0.82, 0.88)) : 0;
    const pourLevel = nv === FLASKS ? st(0.46, 0.86) : nv > FLASKS ? 1 : 0;
    // the flask: in Craddock's hands (b11), set on the bench (b12), held up again and gone pale (b16)
    const cFlaskHeld = (nv === FLASKS && fTook) || (nv === TRENCH && u < 0.15) || (nv === FADES && u > 0.08);
    const flaskRot = nv === FLASKS ? -64 * pour * (cd < 0 ? -1 : 1) : 0;
    const flask = cFlaskHeld
      ? { x: (cRw.x + cLw.x) / 2, y: Math.max(cRw.y, cLw.y) + 6, o: 1, rot: flaskRot }
      : { x: setS, y: SET_FLASK.y, o: place === 1 && nv >= TRENCH ? 1 : 0, rot: 0 };
    const pale = nv === FADES ? st(0.22, 0.72) : nv > FADES ? 1 : 0;
    const stream = { o: pour > 0.2 ? 1 : 0, x: flask.x + 11 * (cd < 0 ? -1 : 1), y: flask.y - 13, tx: FUNNEL.x + cam, ty: FUNNEL.y + 2 };
    // the trench plate: on the bench, lifted and laid down (b12)
    const plateLift = nv === TRENCH ? bump(0.34, 0.4, 0.46, 0.5) : 0;
    const plate = { x: plateS, y: PLATE.y - 22 * plateLift, o: place === 1 ? 1 : 0 };
    // the streaks: planted (b12), grown on a pick (Q2), all grown (b14)
    const planted = nv === TRENCH ? st(0.7, 0.92) : nv > TRENCH ? 1 : 0;
    const rStaph = carry(cv, 16, n, 0, kept(16, 4, Q2, Q2N), keptTr(Q2));
    const rTyph = carry(cv, 17, n, 0, kept(17, 5, Q2, Q2N), keptTr(Q2));
    const rColi = carry(cv, 18, n, 0, kept(18, 6, Q2, Q2N), keptTr(Q2));
    const allGrow = nv === RESULT ? st(0.04, 0.4) : nv > RESULT ? 1 : 0;
    const grow = [Math.max(clamp01(rStaph * 1.3), allGrow), Math.max(clamp01(rTyph * 1.3), allGrow), Math.max(clamp01(rColi * 1.3), allGrow)];
    // the syringe (b15), the plunger pushed once
    const syringe = { x: fRw.x, y: fRw.y, o: carry(cv, 30, n, 0, nv === MICE && u > 0.09 ? 1 : 0, tr), push: nv === MICE ? st(0.36, 0.42) : 1, rot: -70 * (fd < 0 ? -1 : 1) };
    const hop = nv === MICE ? bump(0.72, 0.76, 0.78, 0.84) : 0;
    const calPage = nv === FADES ? Math.min(3, Math.floor(clamp01((u - 0.2) / 0.5) * 3.999)) : nv > FADES ? 3 : 0;
    const calFlip = nv === FADES && u > 0.2 && u < 0.7 ? ((u - 0.2) / 0.5 * 4) % 1 : 1;

    // ── the club ──
    const lantern = place === 2 ? 1 : 0;
    const write = nv === PAPER ? stage(b, L, 0.28, 0.7) : nv > PAPER ? 1 : 0;
    const card = { o: carry(cv, 29, n, 0, nv === PAPER ? st(0.24, 0.3) : 0, tr), write };
    const pencilF = { x: fRw.x, y: fRw.y, o: carry(cv, 32, n, 0, nv === PAPER ? st(0.22, 0.26) * (1 - st(0.8, 0.84)) : 0, tr), rot: 40 * (fd < 0 ? -1 : 1) };
    const notes = { x: DESK_S, y: 452, o: place === 2 ? 1 : 0, fold: nv === PAPER ? st(0.06, 0.18) : nv > PAPER ? 1 : 0, shuffle: nv === TALKB ? bump(0.04, 0.1, 0.12, 0.18) : 0 };

    // ── the lenses ──
    const lensAgar = lensOf(carry(cv, 21, n, 0, nv === AGAR ? st(0.4, 0.5) * (1 - st(0.82, 0.88)) : 0, tr), 316, 290, 42, fDish.x, fDish.y);
    const lensCol = lensOf(carry(cv, 22, n, 0, nv === COLONY ? st(0.16, 0.26) : 0, tr), 98, 294, 42, pDish.x, pDish.y);
    const colGrow = nv === COLONY ? stage(b, L, 0.3, 0.9) : nv > COLONY ? 1 : 0;
    const colOne = nv === COLONY ? st(0.2, 0.32) : nv > COLONY ? 1 : 0;
    const lensStaph = lensOf(carry(cv, 23, n, 0, nv === STAPH ? st(0.5, 0.6) : 0, tr), 328, 290, 42, 347, 398);
    const qLens = carry(cv, 24, n, 0, nv === Q1N ? st(0.48, 0.58) : 0, tr);
    const qL = (k: number, r0: number, dd: { x: number; y: number }) => {
      'worklet';
      const grown = k === 1 ? 1 + 0.12 * Math.sin(Math.PI * Math.min(1, r0 * 1.4)) + 0.04 * clamp01(r0 * 2) : 1;
      // a wrong pick: its lens dims and shrinks, its leader following the dish into the tray
      const dim = k === 1 ? 1 : 1 - 0.55 * clamp01(r0 * 1.4 - 0.2);
      const shrink = k === 1 ? 1 : 1 - 0.15 * clamp01(r0 * 1.4 - 0.2);
      return lensOf(qLens * dim, QD[k].lens, 296, 34 * grown * shrink, dd.x, dd.y - 3);
    };
    const ringO = carry(cv, 25, n, 0, nv === FUNNY ? st(0.32, 0.44) : nv === RING || nv === NOSE ? 1 : 0, tr);
    const lensRing = lensOf(ringO, 178, 298, 52, fDish.x, fDish.y);
    const ringTrace = nv === RING ? st(0.16, 0.5) : nv > RING ? 1 : 0;
    const pulse = carry(cv, 36, n, 0, nv === RING ? clamp01((u - 0.56) / 0.4) : 1, nv === RING ? 1 : tr);
    const lensFlask = lensOf(carry(cv, 26, n, 0, nv === FLASKS ? st(0.56, 0.66) : 0, tr), 84, 294, 42, CATCH.x + cam, CATCH.y - 10);
    const trO = carry(cv, 27, n, 0, nv === TRENCH ? st(0.52, 0.62) : nv === Q2N || nv === RESULT ? 1 : 0, tr);
    const lensTrench = lensOf(trO, 206, 300, 52, plate.x, plate.y - 4);
    const dil = carry(cv, 28, n, 0, nv === MICE ? st(0.04, 0.12) : 0, tr);

    const watchO = carry(cv, 33, n, 0, watch, tr);
    const watchAt = watchO > 0.001 ? { ...jointOf(mB[0], 'wrR'), o: watchO } : { x: 0, y: 0, o: 0 };
    return steady(last.value, last, {
      bF, bF2, bP, bC, bC2, bM0: mB[0], bM1: mB[1], bM2: mB[2], cam, haze, dark, eve, lantern, watch: watchAt,
      tBack, tSpore, jamb,
      door, suit, towers, stack, heapDry, splash, dUpto, dFull, ringDish, fDish, pDish, pencil, pencilF, spores, bus,
      shelfFlask, flask, pale, stream, pourLevel, plate, planted, grow, syringe, hop, calPage, calFlip,
      card, notes,
      lensAgar, lensCol, colGrow, colOne, lensStaph,
      lensQ0: qL(0, rUpto, dUpto), lensQ1: qL(1, rRing, dRing), lensQ2: qL(2, rFull, dFull),
      lensRing, ringTrace, pulse, lensFlask, lensTrench, dil,
      q1: carry(cv, 19, n, 0, Q1[n], tr),
      q2: carry(cv, 20, n, 0, Q2[n], tr),
    });
  });
  const P = useParts(SCENE);

  const DF = useDerivedValue<Bundle>(() => SCENE.value.bF);
  const DF2 = useDerivedValue<Bundle>(() => SCENE.value.bF2);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.bP);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.bC);
  const DC2 = useDerivedValue<Bundle>(() => SCENE.value.bC2);
  const DM0 = useDerivedValue<Bundle>(() => SCENE.value.bM0);
  const DM1 = useDerivedValue<Bundle>(() => SCENE.value.bM1);
  const DM2 = useDerivedValue<Bundle>(() => SCENE.value.bM2);
  const camP = P.cam;
  const eveP = P.eve;
  const lanternP = P.lantern;
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: camP.value }] }));
  const eveOn = useAnimatedStyle(() => ({ opacity: eveP.value }));
  const lanternOn = useAnimatedStyle(() => ({ opacity: lanternP.value }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the lab (x 0–400), the back room (400–800), the club (800–1200) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="fleming1-street" />
        <Bus P={P} />
        <Animated.View style={[styles.world, eveOn]}><LessonPicture name="fleming1-street-eve" /></Animated.View>
        <LessonPicture name="fleming1-lab" />
        <Animated.View style={[styles.world, eveOn]}><View style={styles.evening} /></Animated.View>
        <Door P={P} />
        <Towers P={P} />
        <TrayHeap P={P} />
        <BellJar P={P} />
        <LessonPicture name="fleming1-back" />
        <Thing P={P} k="shelfFlask"><LessonPicture name="fleming1-flask" /></Thing>
        <Catch P={P} />
        <Calendar P={P} />
        <Rabbit P={P} />
        <LessonPicture name="fleming1-hutch-front" />
        <Mouse P={P} />
        <LessonPicture name="fleming1-club" />
        <Animated.View style={[styles.world, lanternOn]}>
          <View style={[styles.rider, { transform: [{ translateX: SLIDE.x }, { translateY: SLIDE.y }] }]}><LessonPicture name="fleming1-slide" /></View>
          <View style={styles.beam}><LessonPicture name="fleming1-beam" /></View>
        </Animated.View>
      </Animated.View>
      {/* things on the bench and in hands (screen space) */}
      <Thing P={P} k="suit"><View style={styles.suitShadow} /><LessonPicture name="fleming1-suitcase" /></Thing>
      <Thing P={P} k="dUpto"><DishSide /></Thing>
      <Thing P={P} k="ringDish"><DishSide /></Thing>
      <Thing P={P} k="dFull"><DishSide /></Thing>
      <Thing P={P} k="plate"><View style={styles.plateShadow} /><LessonPicture name="fleming1-bench-plate" /></Thing>
      <Thing P={P} k="notes"><Notes P={P} /></Thing>
      {/* extra: member */}
      <Stickman D={DM0} k={K} role="crowd" wear={[]} garb={MEMBER_SUITS[0]} />
      {/* extra: member */}
      <Stickman D={DM1} k={K} role="crowd" wear={[]} garb={MEMBER_SUITS[1]} />
      {/* extra: member */}
      <Stickman D={DM2} k={K} role="crowd" wear={[]} garb={MEMBER_SUITS[2]} />
      <Watch P={P} />
      {/* cast: tophat */}
      <Stickman D={DC} k={K} role="second" wear={CRADDOCK_HEAD} garb={COLLEAGUE_LAB} />
      {/* cast: tophat */}
      <Stickman D={DC2} k={K} role="second" wear={CRADDOCK_HEAD} garb={CRADDOCK_SUIT} />
      <Stream P={P} />
      <Thing P={P} k="flask"><FlaskHeld P={P} /></Thing>
      {/* cast: cap */}
      <Stickman D={DP} k={K} role="crowd" wear={PRYCE_HEAD} garb={COLLEAGUE_LAB} />
      <Thing P={P} k="pDish"><DishSide /></Thing>
      <Stack P={P} />
      <Pencil P={P} k="pencil" />
      {/* cast: plain */}
      <Stickman D={DF} k={K} role="lead" wear={FLEMING_HEAD} garb={FLEMING_LAB} />
      {/* cast: plain */}
      <Stickman D={DF2} k={K} role="lead" wear={FLEMING_HEAD} garb={FLEMING_SUIT} />
      <Thing P={P} k="fDish"><DishSide /></Thing>
      {/* the lab door's near jamb, over whoever is still standing IN the doorway (AW8) */}
      <Jamb P={P} />
      <Syringe P={P} />
      <Pencil P={P} k="pencilF" />
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <View style={[styles.rider, { transform: [{ translateX: DESK.x }, { translateY: DESK.y }] }]}><View style={styles.deskShadow} /><LessonPicture name="fleming1-desk" /></View>
      </Animated.View>
      <Spores P={P} />
      {/* the lenses, the labels and the things to tap */}
      <Lens P={P} k="lensAgar"><LessonPicture name="fleming1-dish-section" /></Lens>
      <Plate P={P} k="lensAgar" dx={0} dy={56} w={124} text="AGAR: SEAWEED JELLY" />
      <Lens P={P} k="lensCol"><LessonPicture name="fleming1-dish-empty" /><Colonies P={P} /></Lens>
      <ColonyLabels P={P} />
      <Lens P={P} k="lensStaph"><LessonPicture name="fleming1-staph-field" /></Lens>
      <Plate P={P} k="lensStaph" dx={0} dy={56} w={96} text="STAPHYLOCOCCUS" />
      {on(Q1) || i === FUNNY ? (
        <>
          <Lens P={P} k="lensQ0"><LessonPicture name="fleming1-dish-upto" /></Lens>
          <Lens P={P} k="lensQ1"><LessonPicture name="fleming1-dish-ring" /></Lens>
          <Lens P={P} k="lensQ2"><LessonPicture name="fleming1-dish-full" /></Lens>
        </>
      ) : null}
      <Lens P={P} k="lensRing"><LessonPicture name="fleming1-dish-ring" /><RingTrace P={P} /></Lens>
      <Plate P={P} k="lensRing" dx={-74} dy={-40} w={42} text="MOULD" />
      <Plate P={P} k="lensRing" dx={86} dy={-40} w={72} text="CLEAR RING" gate="ringTrace" />
      <Lens P={P} k="lensFlask"><LessonPicture name="fleming1-flask-section" /></Lens>
      <Plate P={P} k="lensFlask" dx={80} dy={-14} w={66} text="THE MOULD" />
      <Plate P={P} k="lensFlask" dx={86} dy={18} w={78} text="MOULD JUICE" />
      <Lens P={P} k="lensTrench"><LessonPicture name="fleming1-trench-plate" /><Streaks P={P} /></Lens>
      <Plate P={P} k="lensTrench" dx={-98} dy={-42} w={100} text="TRENCH OF JUICE" />
      {on(Q2) || i === RESULT ? <StreakLabels P={P} /> : null}
      <Dilution P={P} />
      <Card P={P} />
      <Veil P={P} k="haze" />
      <Veil P={P} k="dark" />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} P={P} qs={DISH_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} P={P} qs={STREAK_Q} k="q2" /> : null}
    </View>
  );
}

// ── things ───────────────────────────────────────────────────────────────────

/** Anything placed by the scene: `{ x, y, o, rot }`. */
function Thing({ P, k, children }: { P: Parts; k: string; children: ReactNode }) {
  const kP = P[k];
  const st = useAnimatedStyle(() => {
    const v = kP.value;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot ?? 0}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none">{children}</Animated.View>;
}
/** A Petri dish seen side-on (its foot at y 0, centred): the glass base, the jelly line, the lid. */
function DishSide() {
  return (
    <>
      <View style={styles.dishBase} />
      <View style={styles.dishAgar} />
      <View style={styles.dishLid} />
    </>
  );
}
/** The omnibus going by in the street. */
function Bus({ P }: { P: Parts }) {
  const busP = P.bus;
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: busP.value.x }, { translateY: busP.value.y }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="fleming1-bus" /></Animated.View>;
}
/** The door, swinging open on its hinge (14, 500). */
/**
 * The near jamb of the lab door (x 60–66), cut from the lab's own picture and laid over a
 * figure still standing IN the doorway, so he is framed by the opening (AW8).
 */
function Jamb({ P }: { P: Parts }) {
  const jambP = P.jamb;
  const st = useAnimatedStyle(() => ({ opacity: jambP.value > 0.01 ? 1 : 0 }));
  return (
    <Animated.View style={[styles.jamb, st]} pointerEvents="none">
      <View style={styles.jambArt}><LessonPicture name="fleming1-lab" /></View>
    </Animated.View>
  );
}
function Door({ P }: { P: Parts }) {
  const doorP = P.door;
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 14 }, { translateY: 500 }, { scaleX: 1 - 0.78 * doorP.value }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="fleming1-door" /></Animated.View>;
}
/** The two towers of dishes on the bench. */
function Towers({ P }: { P: Parts }) {
  return (
    <>
      {TOWERS.map((tw, k) => Array.from({ length: tw.n }, (_, j) => <TowerDish key={`${k}-${j}`} P={P} k={k} j={j} x={tw.x} />))}
    </>
  );
}
function TowerDish({ P, k, j, x }: { P: Parts; k: number; j: number; x: number }) {
  const towersP = P.towers;
  const st = useAnimatedStyle(() => {
    const v = towersP.value;
    const n = k === 0 ? v.n1 : v.n2;
    const w = k === 0 ? v.w1 : v.w2;
    const sway = w * (j / 12) * (j / 12);
    return { opacity: v.o * (j < n ? 1 : 0), transform: [{ translateX: x + sway * 3 }, { translateY: BENCH_TOP - j * DISH_H }, { rotate: `${sway * 2}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><DishSide /></Animated.View>;
}
/** The stack of dishes in Pryce's arms (b5). */
function Stack({ P }: { P: Parts }) {
  return <>{Array.from({ length: 12 }, (_, j) => <StackDish key={j} P={P} j={j} />)}</>;
}
function StackDish({ P, j }: { P: Parts; j: number }) {
  const stackP = P.stack;
  const st = useAnimatedStyle(() => {
    const v = stackP.value;
    return { opacity: v.o * (j < v.n ? 1 : 0), transform: [{ translateX: v.x }, { translateY: v.y - j * DISH_H }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><DishSide /></Animated.View>;
}
/** The tray of Lysol: the heap of old dishes in it, the three dry ones on top, the splash. */
const HEAP = [[-11, -9, -18], [2, -10, 14], [10, -9, -8]] as const;
function TrayHeap({ P }: { P: Parts }) {
  const splashP = P.splash;
  const splash = useAnimatedStyle(() => ({ opacity: splashP.value, transform: [{ translateX: TRAY.x }, { translateY: TRAY.y - 11 - 6 * splashP.value }, { scaleX: 0.6 + 0.6 * splashP.value }] }));
  return (
    <>
      <View style={[styles.rider, { transform: [{ translateX: TRAY.x }, { translateY: TRAY.y }] }]}><LessonPicture name="fleming1-tray" /></View>
      {HEAP.map(([dx, dy, r], k) => <HeapDish key={k} P={P} dx={dx} dy={dy} r={r} />)}
      <View style={[styles.rider, { transform: [{ translateX: TRAY.x }, { translateY: TRAY.y }] }]}><LessonPicture name="fleming1-tray-front" /></View>
      <Animated.View style={[styles.rider, splash]} pointerEvents="none">
        <View style={[styles.drop, { left: -9, top: -2 }]} />
        <View style={[styles.drop, { left: -2, top: -5 }]} />
        <View style={[styles.drop, { left: 5, top: -2 }]} />
      </Animated.View>
    </>
  );
}
function HeapDish({ P, dx, dy, r }: { P: Parts; dx: number; dy: number; r: number }) {
  const heapDryP = P.heapDry;
  const st = useAnimatedStyle(() => ({ opacity: heapDryP.value, transform: [{ translateX: TRAY.x + dx }, { translateY: TRAY.y + dy }, { rotate: `${r}deg` }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><DishSide /></Animated.View>;
}
/** The plate under its bell jar on the bench, at evening (b21). */
function BellJar({ P }: { P: Parts }) {
  const eveP = P.eve;
  const st = useAnimatedStyle(() => ({ opacity: eveP.value }));
  return (
    <Animated.View style={[styles.rider, st, { transform: [{ translateX: 190 }, { translateY: BENCH_TOP }] }]} pointerEvents="none">
      <LessonPicture name="fleming1-bell-jar" />
    </Animated.View>
  );
}
/** A pencil in a hand (screen space). */
function Pencil({ P, k }: { P: Parts; k: 'pencil' | 'pencilF' }) {
  const kP = P[k];
  const st = useAnimatedStyle(() => {
    const v = kP.value;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.pencil} />
      <View style={styles.pencilTip} />
    </Animated.View>
  );
}
/** The spores drifting up out of the stairwell and toward the bench (b10). */
function Spores({ P }: { P: Parts }) {
  return <>{SPORES.map(([x, d], k) => <Spore key={k} P={P} x={x} d={d} k={k} />)}</>;
}
function Spore({ P, x, d, k }: { P: Parts; x: number; d: number; k: number }) {
  const sporesP = P.spores;
  const tP = P.tSpore;
  const st = useAnimatedStyle(() => {
    const f = clamp01((sporesP.value - d) / 0.45);
    const t = tP.value;
    return {
      opacity: f > 0 && f < 1 ? Math.sin(Math.PI * f) : 0,
      transform: [
        { translateX: x + 120 * f + 6 * Math.sin(t * 2 + k) },
        { translateY: 486 - 96 * f + 4 * Math.sin(t * 1.4 + k * 2) },
      ],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.spore} /></Animated.View>;
}
/** The collecting flask under the filter, filling with juice (world). */
function Catch({ P }: { P: Parts }) {
  const pourLevelP = P.pourLevel;
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: CATCH.x }, { translateY: CATCH.y - 1 }, { scaleY: Math.max(0.02, pourLevelP.value) }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.catchJuice} /></Animated.View>;
}
/** The stream of juice from the flask's lip into the funnel (screen). */
function Stream({ P }: { P: Parts }) {
  const streamP = P.stream;
  const st = useAnimatedStyle(() => {
    const v = streamP.value;
    const dx = v.tx - v.x;
    const dy = v.ty - v.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI - 90}deg` }, { scaleY: len / 10 }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.stream} /></Animated.View>;
}
/** The flask in Craddock's hands: its juice goes pale as the weeks pass (b16). */
function FlaskHeld({ P }: { P: Parts }) {
  const paleP = P.pale;
  const fresh = useAnimatedStyle(() => ({ opacity: 1 - paleP.value }));
  const pale = useAnimatedStyle(() => ({ opacity: paleP.value }));
  return (
    <>
      <Animated.View style={[styles.rider, fresh]}><LessonPicture name="fleming1-flask" /></Animated.View>
      <Animated.View style={[styles.rider, pale]}><LessonPicture name="fleming1-flask-pale" /></Animated.View>
    </>
  );
}
/** The wall calendar, its pages turning over the weeks (b16; world). */
const CAL_DAYS = ['3', '10', '17', '24'];
function Calendar({ P }: { P: Parts }) {
  const calFlipP = P.calFlip;
  const flip = useAnimatedStyle(() => {
    const f = calFlipP.value;
    return { opacity: f < 1 && f > 0 ? 1 - f : 0, transform: [{ translateY: -14 * f }, { scaleY: Math.max(0.05, 1 - f) }] };
  });
  return (
    <View style={[styles.rider, { transform: [{ translateX: CAL.x }, { translateY: CAL.y }] }]} pointerEvents="none">
      <View style={styles.calNail} />
      <View style={styles.calBody}>
        <View style={styles.calHead}><Text style={styles.calHeadText}>DEC</Text></View>
        {CAL_DAYS.map((d, k) => <CalDay key={k} P={P} k={k} d={d} />)}
      </View>
      <Animated.View style={[styles.calPage, flip]} />
    </View>
  );
}
function CalDay({ P, k, d }: { P: Parts; k: number; d: string }) {
  const calPageP = P.calPage;
  const st = useAnimatedStyle(() => ({ opacity: calPageP.value === k ? 1 : 0 }));
  return <Animated.View style={[styles.calDayBox, st]}><Text style={styles.calDay}>{d}</Text></Animated.View>;
}
/** The white rabbit in its hutch: nose and ears twitch, and he hops once on b15 (world). */
function Rabbit({ P }: { P: Parts }) {
  const hopP = P.hop;
  const tP = P.tBack;
  const body = useAnimatedStyle(() => ({ transform: [{ translateX: RABBIT.x + 6 * hopP.value }, { translateY: RABBIT.y - 9 * Math.sin(Math.PI * hopP.value) }] }));
  const ears = useAnimatedStyle(() => {
    const flick = Math.max(0, Math.sin(tP.value * 1.3)) ** 12;
    return { transform: [{ translateX: -12 }, { translateY: -23 }, { rotate: `${-14 + 18 * flick}deg` }] };
  });
  const nose = useAnimatedStyle(() => ({ transform: [{ translateX: -20 }, { translateY: -19 }, { scale: 0.8 + 0.3 * Math.max(0, Math.sin(tP.value * 11)) }] }));
  return (
    <Animated.View style={[styles.rider, body]} pointerEvents="none">
      <Animated.View style={[styles.rider, ears]}><LessonPicture name="fleming1-rabbit-ears" /></Animated.View>
      <LessonPicture name="fleming1-rabbit" />
      <Animated.View style={[styles.rider, nose]}><View style={styles.nose} /></Animated.View>
    </Animated.View>
  );
}
/** The white mouse in his jar, washing his face (world). */
function Mouse({ P }: { P: Parts }) {
  const tP = P.tBack;
  const st = useAnimatedStyle(() => {
    const t = tP.value;
    const wash = Math.max(0, Math.sin(t * 0.8)) ** 4;
    return { transform: [{ translateX: MOUSE.x }, { translateY: MOUSE.y - 1.2 * wash * Math.abs(Math.sin(t * 9)) }, { rotate: `${-6 * wash}deg` }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="fleming1-mouse" /></Animated.View>
      <View style={[styles.rider, { transform: [{ translateX: MOUSE.x }, { translateY: MOUSE.y + 2 }] }]} pointerEvents="none"><LessonPicture name="fleming1-jar" /></View>
    </>
  );
}
/** The glass syringe in Fleming's hand, the plunger pushed once (b15). */
function Syringe({ P }: { P: Parts }) {
  const syringeP = P.syringe;
  const st = useAnimatedStyle(() => {
    const v = syringeP.value;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }] };
  });
  const plunger = useAnimatedStyle(() => ({ transform: [{ translateX: 5 * syringeP.value.push }] }));
  const squirt = useAnimatedStyle(() => ({ opacity: syringeP.value.push > 0.6 ? 1 : 0 }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.rider, plunger]}><View style={styles.plunger} /></Animated.View>
      <View style={styles.barrel} />
      <View style={styles.barrelJuice} />
      <View style={styles.needle} />
      <Animated.View style={[styles.squirt, squirt]} />
    </Animated.View>
  );
}
/** The pocket watch in the first member's hand (b18). */
function Watch({ P }: { P: Parts }) {
  const watchP = P.watch;
  const st = useAnimatedStyle(() => {
    const v = watchP.value;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.watch} /></Animated.View>;
}
/** Fleming's notes on the desk: squared, folded (screen). */
function Notes({ P }: { P: Parts }) {
  const notesP = P.notes;
  const st = useAnimatedStyle(() => {
    const v = notesP.value;
    return { transform: [{ translateX: 2 * v.shuffle }, { scaleX: 1 - 0.45 * v.fold }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.notes} /><View style={styles.notesLine} /></Animated.View>;
}

// ── the lenses ───────────────────────────────────────────────────────────────

/**
 * A MAGNIFIER'S LENS: a brass-rimmed circle opened over the thing a line is about, on a
 * leader to it, showing it large. Its contents are drawn on a 100-unit frame centred on 0
 * and scaled to the lens's radius.
 */
function Lens({ P, k, children }: { P: Parts; k: string; children: ReactNode }) {
  const kP = P[k];
  const lead = useAnimatedStyle(() => {
    const v = kP.value;
    const dx = v.tx - v.x;
    const dy = v.ty - v.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    const len = Math.max(0, d - v.r - 2);
    return {
      opacity: v.o,
      width: len * clamp01(v.o * 1.4),
      transform: [{ translateX: v.x + (dx / d) * v.r }, { translateY: v.y + (dy / d) * v.r }, { rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` }],
    };
  });
  const dotSt = useAnimatedStyle(() => {
    const v = kP.value;
    return { opacity: v.o, transform: [{ translateX: v.tx }, { translateY: v.ty }] };
  });
  const body = useAnimatedStyle(() => {
    const v = kP.value;
    const pop = 0.6 + 0.4 * clamp01(v.o * 1.2);
    return { opacity: clamp01(v.o * 1.5), transform: [{ translateX: v.x }, { translateY: v.y }, { scale: (v.r / 50) * pop }] };
  });
  return (
    <>
      <Animated.View style={[styles.leader, lead]} pointerEvents="none" />
      <Animated.View style={[styles.rider, dotSt]} pointerEvents="none"><View style={styles.leadDot} /></Animated.View>
      <Animated.View style={[styles.rider, body]} pointerEvents="none">
        <View style={styles.lensShadow} />
        <View style={styles.lensRim} />
        {children}
        <View style={styles.lensRing} />
      </Animated.View>
    </>
  );
}
/** A label plate beside a lens, at (dx, dy) from its centre; with `gate`, it waits for that value too. */
function Plate({ P, k, dx, dy, w, text, gate }: { P: Parts; k: string; dx: number; dy: number; w: number; text: string; gate?: string }) {
  const gateP = gate ? P[gate] : null;
  const kP = P[k];
  const st = useAnimatedStyle(() => {
    const v = kP.value;
    const g = gateP ? clamp01(gateP.value * 2 - 0.4) : 1;
    return { opacity: clamp01(v.o * 1.6 - 0.6) * g, transform: [{ translateX: v.x + dx - w / 2 }, { translateY: v.y + dy - 7 }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.plate, { width: w, height: 14 }]}><Text style={[styles.plateText, { width: w - 2 }]}>{text}</Text></View>
    </Animated.View>
  );
}
/** The colonies coming up on the jelly, one first, then the rest (b3; lens frame). */
const COLS = [[-6, 4, 3.2], [-24, -10, 2.6], [16, -18, 2.8], [22, 12, 3], [-14, 20, 2.4], [6, -30, 2.2], [-30, 6, 2.6], [30, -4, 2.4], [-2, 28, 2.8], [10, 20, 2.2], [-20, -24, 2.2], [26, -22, 2], [-34, -8, 2], [4, -12, 2.6], [-10, -16, 2.2], [14, 32, 2]] as const;
function Colonies({ P }: { P: Parts }) {
  return <>{COLS.map(([x, y, r], k) => <Colony key={k} P={P} x={x} y={y} r={r} k={k} />)}</>;
}
function Colony({ P, x, y, r, k }: { P: Parts; x: number; y: number; r: number; k: number }) {
  const colGrowP = P.colGrow;
  const colOneP = P.colOne;
  const st = useAnimatedStyle(() => {
    const g = k === 0 ? colOneP.value : clamp01((colGrowP.value - (k / COLS.length) * 0.7) / 0.3);
    return { opacity: g > 0.02 ? 1 : 0, transform: [{ translateX: x }, { translateY: y }, { scale: (Math.max(0.05, g) * r) / 3 }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.colony} /><View style={styles.colonyLit} /></Animated.View>;
}
function ColonyLabels({ P }: { P: Parts }) {
  const colGrowP = P.colGrow;
  const colOneP = P.colOne;
  const lensColP = P.lensCol;
  const one = useAnimatedStyle(() => {
    const v = lensColP.value;
    return { opacity: clamp01(colOneP.value * 2 - 0.6) * (1 - clamp01(colGrowP.value * 4 - 0.4)), transform: [{ translateX: v.x + 34 }, { translateY: v.y - 6 }] };
  });
  const many = useAnimatedStyle(() => {
    const v = lensColP.value;
    return { opacity: clamp01(colGrowP.value * 4 - 0.6) * clamp01(v.o * 2 - 1), transform: [{ translateX: v.x - 60 }, { translateY: v.y + 49 }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, one]} pointerEvents="none">
        <View style={[styles.plate, { width: 60, height: 14 }]}><Text style={[styles.plateText, { width: 58 }]}>ONE GERM</Text></View>
      </Animated.View>
      <Animated.View style={[styles.rider, many]} pointerEvents="none">
        <View style={[styles.plate, { width: 120, height: 14 }]}><Text style={[styles.plateText, { width: 118 }]}>A COLONY: MILLIONS</Text></View>
      </Animated.View>
    </>
  );
}
/** The clear ring traced round the mould, and its juice spreading out through it, twice (b8; lens frame). */
function RingTrace({ P }: { P: Parts }) {
  const ringTraceP = P.ringTrace;
  const trace = useAnimatedStyle(() => {
    const f = ringTraceP.value;
    return { opacity: f > 0.02 ? 1 : 0, transform: [{ translateX: -22 }, { translateY: -24 }, { rotate: `${-90 + 360 * f}deg` }, { scale: 0.7 + 0.3 * f }] };
  });
  return (
    <View style={styles.agarClip}>
      <View style={styles.agarCentre}>
        <Animated.View style={[styles.rider, trace]}><View style={styles.ringDash} /></Animated.View>
        <Pulse P={P} d={0} />
        <Pulse P={P} d={0.5} />
      </View>
    </View>
  );
}
function Pulse({ P, d }: { P: Parts; d: number }) {
  const pulseP = P.pulse;
  const st = useAnimatedStyle(() => {
    const f = clamp01((pulseP.value - d) / 0.5);
    return { opacity: f > 0 && f < 1 ? 0.9 * (1 - f) : 0, transform: [{ translateX: -22 }, { translateY: -24 }, { scale: 0.45 + 0.55 * f }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.pulse} /></Animated.View>;
}
/** The three streaks on the trench plate, growing from the rim toward the juice (lens frame). */
const STREAKS = [
  { id: 'staph', y: -18, stop: -6, big: 1 },
  { id: 'typhoid', y: 0, stop: -20, big: 0 },
  { id: 'coli', y: 18, stop: -20, big: 0 },
] as const;
function Streaks({ P }: { P: Parts }) {
  return <>{STREAKS.map((s, k) => <Streak key={s.id} P={P} k={k} y={s.y} stop={s.stop} big={s.big} />)}</>;
}
function Streak({ P, k, y, stop, big }: { P: Parts; k: number; y: number; stop: number; big: number }) {
  const growP = P.grow;
  const plantedP = P.planted;
  const seed = useAnimatedStyle(() => ({ opacity: plantedP.value * (growP.value[k] > 0.05 ? 0.35 : 0.85), transform: [{ translateX: -20 }, { translateY: y }, { scaleX: plantedP.value }] }));
  const grown = useAnimatedStyle(() => {
    const g = growP.value[k];
    const len = (38 - stop) * g;
    return { opacity: g > 0.02 ? 1 : 0, width: len, transform: [{ translateX: 38 - len }, { translateY: y - 3 }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, seed]}><View style={styles.streakSeed} /></Animated.View>
      <Animated.View style={[styles.streakBox, grown]}>
        <View style={[styles.streak, big ? styles.streakStaph : styles.streakPale]} />
      </Animated.View>
    </>
  );
}
const STREAK_LABELS = [
  { id: 'staph', y: 281, w: 96, text: 'STAPHYLOCOCCUS' },
  { id: 'typhoid', y: 300, w: 54, text: 'TYPHOID' },
  { id: 'coli', y: 319, w: 60, text: 'GUT GERM' },
] as const;
function StreakLabels({ P }: { P: Parts }) {
  const lensTrenchP = P.lensTrench;
  const st = useAnimatedStyle(() => ({ opacity: clamp01(lensTrenchP.value.o * 2 - 1) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      {STREAK_LABELS.map((l) => (
        <View key={l.id} style={[styles.plate, { left: 266, top: l.y - 7, width: l.w, height: 14 }]}>
          <Text style={[styles.plateText, { width: l.w - 2 }]}>{l.text}</Text>
        </View>
      ))}
    </Animated.View>
  );
}
/** DILUTED ×800: a plate over the rack of tubes (b15). */
function Dilution({ P }: { P: Parts }) {
  const dilP = P.dil;
  const st = useAnimatedStyle(() => ({ opacity: dilP.value, transform: [{ translateX: RACK.x - HX - 42 }, { translateY: 374 }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.plate, { width: 84, height: 14 }]}><Text style={[styles.plateText, { width: 82 }]}>DILUTED ×800</Text></View>
      <View style={styles.dilLead} />
    </Animated.View>
  );
}
/** The note card over the desk, PENICILLIN written on it letter by letter (b19). */
function Card({ P }: { P: Parts }) {
  const cardP = P.card;
  const st = useAnimatedStyle(() => ({ opacity: cardP.value.o, transform: [{ translateX: 282 }, { translateY: 262 }, { scale: 0.8 + 0.2 * cardP.value.o }] }));
  const ink = useAnimatedStyle(() => ({ width: 104 * cardP.value.write }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.card}>
        <View style={styles.cardRule} />
        <Animated.View style={[styles.cardInk, ink]}>
          <Text style={styles.cardText}>PENICILLIN</Text>
        </Animated.View>
      </View>
      <View style={styles.cardLead} />
    </Animated.View>
  );
}

/** The haze into the back room, and the dark into the club and the evening (and on a step back). */
function Veil({ P, k }: { P: Parts; k: 'haze' | 'dark' }) {
  const kP = P[k];
  const st = useAnimatedStyle(() => ({ opacity: kP.value }));
  return <Animated.View style={[k === 'haze' ? styles.haze : styles.dark, st]} pointerEvents="none" />;
}

// ── the two games ────────────────────────────────────────────────────────────

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/**
 * SPOT THE PLATE: the three dishes' lenses. Each box covers its lens; the verdict seal
 * (struck at its top-right) lands on the lens's brass rim, never on the colonies.
 */
const DISH_Q: Q[] = QD.map((d) => ({ id: d.id, left: d.lens - 38, top: 258, w: 76, h: 76, r: 38, correct: d.id === 'ring' }));
/** CALL THE STREAK: a row each, from the streak in the lens across to its name. */
const STREAK_Q: Q[] = STREAK_LABELS.map((l) => ({ id: l.id, left: 214, top: l.y - 9, w: 174, h: 18, r: 4, correct: l.id === 'staph' }));
function StageTargets({ picked, onPick, live, P, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; P: Parts; qs: Q[]; k: 'q1' | 'q2';
}) {
  const kP = P[k];
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: kP.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} nativeID={`fl1-q-${q.id}`} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  world: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  jamb: { position: 'absolute', left: 59.2, top: 311, width: 7.6, height: 192, overflow: 'hidden' },
  jambArt: { position: 'absolute', left: -59.2, top: -311, width: 0, height: 0 },
  haze: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.fleming1Haze.base },
  dark: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.fleming1Night.base },
  evening: { position: 'absolute', left: 0, top: 214, width: 400, height: 300, backgroundColor: W.fleming1Evening.base, opacity: 0.28 },
  beam: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, opacity: 0.3 },
  dishBase: { position: 'absolute', left: -8.5, top: -2.6, width: 17, height: 2.6, borderRadius: 1, backgroundColor: W.fleming1Glass.base, borderWidth: 0.5, borderColor: INK },
  dishAgar: { position: 'absolute', left: -7.4, top: -2.3, width: 14.8, height: 1.2, backgroundColor: W.fleming1Agar.base },
  dishLid: { position: 'absolute', left: -9, top: -3.3, width: 18, height: 1, borderRadius: 0.5, backgroundColor: W.fleming1Glass.shade },
  drop: { position: 'absolute', width: 2.4, height: 3.4, borderRadius: 1.2, backgroundColor: W.fleming1Lysol.base },
  pencil: { position: 'absolute', left: -1.2, top: -16, width: 2.4, height: 18, borderRadius: 0.8, backgroundColor: W.fleming1Pencil.base, borderWidth: 0.4, borderColor: INK },
  pencilTip: { position: 'absolute', left: -0.8, top: -19, width: 1.6, height: 3.4, borderRadius: 0.8, backgroundColor: INK },
  spore: { position: 'absolute', left: -2.6, top: -2.6, width: 5.2, height: 5.2, borderRadius: 2.6, backgroundColor: W.fleming1Spore.base, borderWidth: 0.4, borderColor: W.fleming1Spore.shade },
  catchJuice: { position: 'absolute', left: -12, top: -9, width: 24, height: 9, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: W.fleming1Broth.base },
  stream: { position: 'absolute', left: -1, top: 0, width: 2, height: 10, borderRadius: 1, backgroundColor: W.fleming1Broth.base },
  calNail: { position: 'absolute', left: -1.5, top: -2, width: 3, height: 3, borderRadius: 1.5, backgroundColor: INK },
  calBody: { position: 'absolute', left: -15, top: 0, width: 30, height: 38, borderRadius: 1.5, backgroundColor: W.fleming1Card.base, borderWidth: 0.8, borderColor: INK, overflow: 'hidden' },
  calHead: { position: 'absolute', left: 0, top: 0, width: 28.4, height: 10, backgroundColor: W.fleming1Red.base, alignItems: 'center', justifyContent: 'center' },
  calHeadText: { width: 26, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: W.fleming1Red.label, textAlign: 'center', includeFontPadding: false },
  calDayBox: { position: 'absolute', left: 0, top: 11, width: 28.4, height: 24, alignItems: 'center', justifyContent: 'center' },
  calDay: { width: 26, fontFamily: 'Inter_700Bold', fontSize: 15, lineHeight: 18, color: INK, textAlign: 'center', includeFontPadding: false },
  calPage: { position: 'absolute', left: -15, top: 10, width: 30, height: 28, backgroundColor: W.fleming1Card.base, borderWidth: 0.6, borderColor: W.fleming1Card.shade },
  nose: { position: 'absolute', left: -1, top: -1, width: 2, height: 2, borderRadius: 1, backgroundColor: W.fleming1Pink.base },
  plunger: { position: 'absolute', left: -16, top: -1, width: 12, height: 2, borderRadius: 1, backgroundColor: W.fleming1Steel.base, borderWidth: 0.3, borderColor: INK },
  barrel: { position: 'absolute', left: -6, top: -2.4, width: 16, height: 4.8, borderRadius: 1.4, backgroundColor: W.fleming1Glass.base, borderWidth: 0.6, borderColor: INK },
  barrelJuice: { position: 'absolute', left: 2, top: -1.4, width: 7, height: 2.8, backgroundColor: W.fleming1Broth.base },
  needle: { position: 'absolute', left: 10, top: -0.4, width: 9, height: 0.8, backgroundColor: W.fleming1Steel.shade },
  squirt: { position: 'absolute', left: 19, top: -1, width: 2, height: 2, borderRadius: 1, backgroundColor: W.fleming1Broth.base },
  watch: { position: 'absolute', left: -3, top: -3, width: 6, height: 6, borderRadius: 3, backgroundColor: W.fleming1Gold.base, borderWidth: 0.6, borderColor: INK },
  notes: { position: 'absolute', left: -10, top: -2, width: 20, height: 3, borderRadius: 0.6, backgroundColor: W.fleming1Card.base, borderWidth: 0.5, borderColor: INK },
  notesLine: { position: 'absolute', left: -7, top: -0.8, width: 14, height: 0.6, backgroundColor: W.fleming1Card.shade },
  leader: { position: 'absolute', left: 0, top: -0.6, height: 1.2, backgroundColor: W.fleming1Brass.shade, transformOrigin: '0% 50%' },
  leadDot: { position: 'absolute', left: -2.2, top: -2.2, width: 4.4, height: 4.4, borderRadius: 2.2, backgroundColor: W.fleming1Brass.base, borderWidth: 0.6, borderColor: INK },
  suitShadow: { position: 'absolute', left: -16, top: -1.6, width: 32, height: 3.2, borderRadius: 1.6, backgroundColor: SHADE, opacity: 0.4 },
  plateShadow: { position: 'absolute', left: -15, top: -1.2, width: 30, height: 2.4, borderRadius: 1.2, backgroundColor: SHADE, opacity: 0.4 },
  deskShadow: { position: 'absolute', left: -30, top: -1.8, width: 60, height: 3.6, borderRadius: 1.8, backgroundColor: SHADE, opacity: 0.45 },
  lensShadow: { position: 'absolute', left: -51, top: -47, width: 106, height: 106, borderRadius: 53, backgroundColor: SHADE, opacity: 0.35 },
  lensRim: { position: 'absolute', left: -54, top: -54, width: 108, height: 108, borderRadius: 54, backgroundColor: W.fleming1Brass.base, borderWidth: 1.4, borderColor: INK },
  lensRing: { position: 'absolute', left: -50, top: -50, width: 100, height: 100, borderRadius: 50, borderWidth: 1.2, borderColor: W.fleming1Brass.shade },
  colony: { position: 'absolute', left: -3, top: -3, width: 6, height: 6, borderRadius: 3, backgroundColor: W.fleming1Staph.base, borderWidth: 0.4, borderColor: W.fleming1Staph.shade },
  colonyLit: { position: 'absolute', left: -2, top: -2, width: 2.4, height: 2.4, borderRadius: 1.2, backgroundColor: W.fleming1StaphLit.base },
  agarClip: { position: 'absolute', left: -43, top: -43, width: 86, height: 86, borderRadius: 43, overflow: 'hidden' },
  agarCentre: { position: 'absolute', left: 43, top: 43, width: 0, height: 0 },
  ringDash: { position: 'absolute', left: -31, top: -31, width: 62, height: 62, borderRadius: 31, borderWidth: 1.4, borderColor: W.fleming1Trace.base, borderStyle: 'dashed' },
  pulse: { position: 'absolute', left: -31, top: -31, width: 62, height: 62, borderRadius: 31, borderWidth: 1.6, borderColor: W.fleming1Mould.base },
  streakSeed: { position: 'absolute', left: 0, top: -1, width: 58, height: 2, borderRadius: 1, backgroundColor: W.fleming1Staph.shade },
  streakBox: { position: 'absolute', left: 0, top: -0.5, height: 7, overflow: 'hidden' },
  streak: { position: 'absolute', right: 0, top: 0, width: 60, height: 7, borderRadius: 3.5, borderWidth: 0.8 },
  streakStaph: { backgroundColor: W.fleming1Staph.base, borderColor: W.fleming1Staph.shade },
  streakPale: { backgroundColor: W.fleming1Cream.base, borderColor: W.fleming1Cream.shade },
  dilLead: { position: 'absolute', left: 41, top: 14, width: 1, height: 34, backgroundColor: W.fleming1Brass.shade },
  card: { position: 'absolute', left: 0, top: 0, width: 114, height: 40, borderRadius: 2, backgroundColor: W.fleming1Card.base, borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE) },
  cardRule: { position: 'absolute', left: 6, top: 30, width: 100, height: 0.8, backgroundColor: W.fleming1Card.shade },
  cardInk: { position: 'absolute', left: 4, top: 6, height: 26, overflow: 'hidden' },
  cardText: { width: 104, fontFamily: 'Caveat_700Bold', fontSize: 18, lineHeight: 22, paddingLeft: 3, color: W.fleming1Ink.base, includeFontPadding: false },
  cardLead: { position: 'absolute', left: 4, top: 40, width: 1, height: 146, backgroundColor: W.fleming1Brass.shade },
  plate: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: W.fleming1Card.base, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-09 — SPOT THE PLATE (three lenses over the window, each on a
// leader to its dish on the bench) and CALL THE STREAK (three rows across the trench plate's lens to the
// germs' names) read whole, answered right and wrong, on the fl1film / fl1A / fl1B / fl1C sheets.
export function Fleming1Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson} beats={BEATS} Scene={Fleming1Scene} band={[214, 514]}
      roles={{
        plain: { head: FLEMING_HEAD, label: 'Alexander Fleming' },
        cap: { head: PRYCE_HEAD, label: 'Merlin Pryce' },
        tophat: { head: CRADDOCK_HEAD, label: 'Stuart Craddock' },
      }}
    />
  );
}
