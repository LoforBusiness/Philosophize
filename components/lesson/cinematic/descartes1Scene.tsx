import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './descartes1Script';
import {
  U, WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs, seated,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import {
  UNIT2_OUTFITS, WEAR, GARB_LINE, breeches, coat, sleeves, front, knitCap, type HeadPiece,
} from './garb';

// ─────────────────────────────────────────────────────────────────────────────
// philosophy-descartes-1, "The Stove-Heated Room" — the first lesson of Philosophy's second
// unit (LESSON_RULES group AW): one true story, told in costume. THE PLAIN ONE IS RENÉ
// DESCARTES, twenty-three, a gentleman soldier in a buff coat, a red sash and a plumed hat;
// the top hat plays THE LANDLORD (a smock, an apron, a brown knitted cap, a nightcap by
// night), the cap A FELLOW SOLDIER in a dark buff coat.
//
// A DIALOGUE lesson (group AP): people talk and nobody narrates.
// AT2: silent extras: a sentry at the army's winter camp in the town, who warms his hands
// at a brazier, blows into them and watches the two of them go by; he stands apart from
// the cast once they have passed, and is only in the town.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// descartes1.mjs) laid in ONE WORLD 800 wide: the town at x 0–400, the room at x 400–800.
// The scene's own camera is the world's translation, `cam`: 0 in the town, −400 in the
// room, cut under a flurry of snow at the start of `stove`. The night is the same room drawn
// in the night's light and laid over the day, switched under a dark veil at the start of
// `enthuse`; the first dream's bang is a white flash at the start of `spark`.
//
//   TOWN, far → near: an overcast winter sky, white hills with firs, the far bank's spires
//   hazed, the Danube with ice along its banks; the town wall and gate tower, the church
//   with its onion dome, gables packed behind the wall, THE QUARTERS (290–396), a tall
//   half-timbered inn whose chimney (352, 282) smokes; at the left the army's camp: two
//   ridge tents under snow, the Bavarian banner on its pole (85), a bronze cannon on its
//   carriage, a brazier; the trodden street (feet at 500), a woodpile, drifts. Snow falls.
//   ROOM (its own x): a whitewashed Stube under a dark beamed ceiling, a wainscot bench
//   round the walls, broad floorboards; the plank DOOR (8–56) at the left, the leaded
//   WINDOW (70–150, sill 412) in its deep niche, frosted, with the crooked old town outside;
//   the COT under it (66–170, top 482); the STOOL (dragged 156 → 170), the oak TABLE
//   (185–289, top 464); the log BIN (305); the green-tiled STOVE (320–396, fire door
//   344–376 × 444–474). By night: the window dark with snow, the stove's fire throwing its
//   light on the floor, a candle on the table. The candle stands on the table rather than
//   in his hand, so that the hand can hold the notebook he writes in as he paces.
//
//   b0   snow; Descartes trudges in from the left, the soldier behind with the logs on his
//        back (he hitches them at 2.6s and 5.2s); the sentry warms his hands; then the line,
//        a hand to his chest and flung out: what a waste.
//   b1   the soldier hitches the logs (0.6s) and points up the street at the smoking inn.
//   b2   the flurry; the room: the landlord opens the fire door (0.4s), takes two logs from
//        the soldier's bundle, pushes them in (1.4s); the glow comes up; a wag of the finger.
//   b3   Descartes drags the stool to the table (0.3s), sits, lifts off his hat and lays it
//        down, and holds up a hand: no talking. The soldier puts the bundle in the bin and
//        crosses to the window.
//   b4   the landlord, arms folded, shakes his head twice.
//   b5   Descartes takes the schoolbooks out of the pack at his feet and drops them on the
//        table (1.5s), flicks the top one open and shut (2.6s).
//   b6   the soldier rubs a clear patch in the frosted window: the crooked old town outside.
//   b7   Descartes unrolls a sheet (0.3s), rules two strokes of straight streets with ruler
//        and pencil (1.0s), turns and holds the plan up beside the window.
//   b8   he taps his head, twice; then sweeps the books and the plan off into his pack (2.4s).
//   b9   the soldier picks up the basket of apples and sets it on the table (3.9s).
//   b10  Q1 TIP THE BASKET: Descartes takes an apple out and holds it up.
//   b11  he stands, steps up to the table, tips the basket (thuds), rolls them out; two
//        sweeps put the sound ones back; the soft one is set aside; one rolls off the end.
//   b12  the landlord stoops for the apple on the floor, and sighs.
//   b13  the dark; night: Descartes writes as he paces, drops the notebook on the table as
//        he passes, and sits up on his cot.
//   b14  he lies down; the room goes blue; he rises in the dream, bent over, and is pushed
//        round in a circle by wind lines.
//   b15  the flash; sparks fly from the stove; he sits bolt upright on the cot, the blanket
//        clutched to him; the soldier, dozing by the bin, starts.
//   b16  Q2 OPEN THE BOOK: the dream table, a dictionary, the book of poems and its three
//        paper ribbons.
//   b17  the dream fades; he gets up, crosses to the real table and lays a hand on the
//        closed book of poems, chin up (2.3s).
//   b18  the door creaks open (0.3s): the landlord in his nightcap leans in with a lantern
//        and flaps a hand, twice: sleep.
//   b19  the landlord withdraws and shuts the door; the soldier gets up, takes the notebook
//        off the table (2.6s), holds it up, sets it down.     b20  at rest.
//
// Every figure has its own phase (N22), faces whom he talks to, never walks backwards
// (C18), and every hand that moves drags, lifts, rubs, rules, taps, tips, sweeps or points.
// ─────────────────────────────────────────────────────────────────────────────

const W = NATURAL;
const { SHADE } = stageTone('philosophy');
const TR = 0.85;
const K = K_FIG * 0.95;
const KS = K / 0.85;
const G = GROUND;
const HX = 400;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.0s) and the line together. */
const LINES = [11.16, 4.3, 3.62, 4.84, 4.41, 4.67, 4.35, 5.31, 5.12, 3.89, 0, 5.26, 5.74, 6.2, 5.17, 5.29, 0, 4.2, 4.64, 5.29, 0, 0];

const TALK = 167;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const MARCH = at('march');
const QUARTERS = at('quarters');
const STOVE = at('stove');
const SIT = at('sit');
const SCOFF = at('scoff');
const BOOKS = at('books');
const WINDOW = at('window');
const PLAN = at('plan');
const HOUSE = at('house');
const APPLES = at('apples');
const SORT = at('sort');
const GRUMBLE = at('grumble');
const ENTHUSE = at('enthuse');
const WIND = at('wind');
const SPARK = at('spark');
const ANSWER = at('answer');
const VOW = at('vow');
const AFTER = at('after');
const Q1 = BEATS.map((b) => (b.basket ? 1 : 0));
const Q2 = BEATS.map((b) => (b.book ? 1 : 0));
const Q1N = Q1.indexOf(1);
const Q2N = Q2.indexOf(1);
const PLACE = BEATS.map((b) => b.place ?? 0);
/** Who speaks each beat, as a number the worklet can read: 1 Descartes, 2 the landlord, 3 the soldier. */
const SPK = BEATS.map((b) => (b.speaker === 'plain' ? 1 : b.speaker === 'tophat' ? 2 : b.speaker === 'cap' ? 3 : 0));

/** Seconds into a place change at which the world is swapped, under the veil. */
const CUT_S = 0.4;

// ── the room (world x = its own x + 400) ─────────────────────────────────────
const TABLE_X = HX + 237;
const TOP = 464;                 // the table top
const STOOL0 = HX + 156;
const STOOL1 = HX + 170;
const STOOL_H = 22 / K;          // the stool's seat, rig units
const SEAT_X = HX + 166;         // Descartes's pelvis on the stool
const COT_G = 482;               // the cot's top: he sits and lies on it
const COT_X = HX + 118;
const BIN_X = HX + 305;
const FIRE = { x: HX + 360, y: 459 };
const PACK_X = HX + 192;
const BASKET_X = HX + 214;
const BASKET_FLOOR = HX + 112;
const NOTE_REST = { x: HX + 226, y: TOP - 1 };
const POEMS_X = HX + 208;
const HAT_REST = { x: HX + 272, y: TOP };
const CANDLE_X = HX + 256;
const BOOK_REST = HX + 232;
const STRAY = { x: HX + 326, y: 496 };
const DOOR_X = HX + 8;
const DOOR_TOP = 336;
const CHIMNEY = { x: 352, y: 282 };

/** The apples: [dx, dy] in the basket (from its foot), where each rolls to on the table; k 6 rolls off the end. */
const IN: readonly (readonly [number, number])[] = [[0, -21], [-7, -19], [7, -19], [-3, -18], [4, -18], [-9, -18], [9, -18]];
const OUT_X = [HX + 224, HX + 229, HX + 233, HX + 237, HX + 241, HX + 246, HX + 289];
const APPLE_R = 3.6;

// ── where everybody is at the START of each beat (WORLD x) ─────────────────────
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));
/** Descartes: the street, the room by the stool, on the stool, the night (pacing, the cot, the table). */
const C_X = per((n) => (n === MARCH ? -36 : n === QUARTERS ? 170 : n === STOVE ? HX + 120 : n === SIT ? HX + 144
  : n <= Q1N ? SEAT_X : n === SORT || n === GRUMBLE ? HX + 196 : n === ENTHUSE ? HX + 214 : n <= ANSWER ? COT_X : HX + 190));
const C_D = per((n) => (n === PLAN || n === QUARTERS ? -1 : 1));
const C_SEAT = per((n) => (n > SIT && n <= Q1N ? 1 : 0));
const C_COT = per((n) => (n === WIND || n === Q2N || n === SPARK || n === ANSWER ? 1 : 0));
/** The landlord: by the stove, at the door by night. */
const H_X = per((n) => (n <= SIT ? HX + 326 : n <= GRUMBLE ? HX + 346 : n < VOW ? HX - 30 : HX + 34));
const H_D = per((n) => (n === STOVE ? 1 : n === VOW ? 1 : -1));
const H_ON = per((n) => (PLACE[n] === 1 || n === VOW || n === AFTER ? 1 : 0));
/** The soldier: the street, the stove, the window, the table, dozing by the bin, the table. */
const P_X = per((n) => (n === MARCH ? -90 : n === QUARTERS ? 118 : n <= SIT ? HX + 284 : n <= APPLES ? HX + 84
  : n === Q1N ? HX + 248 : n <= GRUMBLE ? HX + 272 : n <= AFTER ? HX + 300 : HX + 252));
const P_D = per((n) => (n < Q1N ? 1 : -1));
const P_SIT = per((n) => (n >= ENTHUSE && n <= AFTER ? 1 : 0));
/** Where each figure means to be when a beat ends (the next beat's start, in the same place). */
const nextOf = (T: readonly number[]) => T.map((x, n) => (n + 1 < T.length && PLACE[n + 1] === PLACE[n] ? T[n + 1] : x));
const C_NEXT = nextOf(C_X);
const H_NEXT = nextOf(H_X);
const P_NEXT = nextOf(P_X);
const SENTRY_X = 40;
const BRAZIER = { x: 62, y: 500 };

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { basket: 1, hand: 2, bin: 3, path: 4, love: 5, seize: 6 };

// The costumes the script names, composed here from garb.ts parts (AW3).
const DESCARTES = UNIT2_OUTFITS.descartes;
const SOLDIER = UNIT2_OUTFITS.soldier;
const LANDLORD_GARB = [...breeches(WEAR.breeches), ...coat(WEAR.smock, 'hip'), ...sleeves(WEAR.smock), front(WEAR.knitCream, 6)];
const LANDLORD_HEAD = knitCap(WEAR.hatBrown);
/** A nightcap: the same knitted cap in cream, its tip drooping, a tassel. */
const NIGHTCAP_HEAD: HeadPiece[] = [
  { at: 'head', x: 0, y: -13, w: 41, h: 18, r: 9, fill: WEAR.knitCream },
  { at: 'head', x: 0, y: -7, w: 42, h: 5, r: 2.5, fill: WEAR.knitCream },
  { at: 'head', x: -14, y: -22, w: 18, h: 9, r: 4.5, rot: -30, fill: WEAR.knitCream },
  { at: 'head', x: -23, y: -16, w: 7, h: 7, r: 3.5, fill: WEAR.sashRed },
];
const DESCARTES_HEAD = DESCARTES.head;
const SOLDIER_HEAD = SOLDIER.head;

/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 11.16;
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
/** A walk from `src` to `to` starting `start` seconds in — later if he must turn first (C18). */
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
/** Which way a figure faces at time `b`: the scripted turns, eased through a profile; a walk wins. */
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
function jointOf(w: Bundle, k: 'wrR' | 'wrL' | 'head' | 'shB') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/** Sitting up on the ground (or the cot), legs straight out, hands on the lap. */
const SITG: Stance = {
  tilt: 0.06, neck: -0.04, bob: 4 - U.standH,
  footL: { x: 31, y: 0 }, footR: { x: 34, y: 0 },
  fistL: { x: 12, y: -3 }, fistR: { x: 15, y: -2 }, adv: 0,
};
/** Lying on his back, his hands on his chest. */
const LIE: Stance = {
  ...SITG, tilt: 1.5, neck: -0.5,
  fistL: { x: -9, y: -6 }, fistR: { x: -5, y: -5 },
};
/** Standing ↔ sitting on the ground ↔ lying, with a lean over the feet as he goes down or up. */
function groundOf(s: Stance, sit: number, lie: number): Stance {
  'worklet';
  if (sit <= 0.001) return s;
  const down = Math.sin(Math.PI * sit);
  let r = leanOf(mixStance(s, SITG, sit), 0.4 * down, 0.1 * down);
  if (lie > 0.001) r = mixStance(r, LIE, lie);
  return r;
}
/** Standing ↔ seated on the stool, sitting the way a body does (hands to the knees on the way). */
function seatMix(s: Stance, seat: Stance, w: number): Stance {
  'worklet';
  if (w <= 0.001) return s;
  const rise = Math.sin(Math.PI * w);
  const r = leanOf(mixStance(s, seat, w), 0.42 * rise, 0.12 * rise);
  if (rise <= 0.001) return r;
  return {
    ...r,
    fistL: { x: lerp(r.fistL.x, 13, 0.8 * rise), y: lerp(r.fistL.y, 2, 0.8 * rise) },
    fistR: { x: lerp(r.fistR.x, 16, 0.8 * rise), y: lerp(r.fistR.y, 3, 0.8 * rise) },
  };
}
type Pt = { x: number; y: number; o: number; r: number; sx: number; sy: number };
/** A thing at the given place, opacity, rotation (degrees) and scale. */
function P(x: number, y: number, o = 1, r = 0, sx = 1, sy = 1): Pt {
  'worklet';
  return { x, y, o, r, sx, sy };
}
const HIDE: Pt = { x: -999, y: -999, o: 0, r: 0, sx: 1, sy: 1 };

export default function Descartes1Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldC = useHeld();
  const heldH = useHeld();
  const heldP = useHeld();
  const heldE = useHeld();
  const cv = useCarry(17);
  const on = useLinger(i);
  const pk = useSharedValue(0);
  useEffect(() => {
    pk.value = picked ? (PICK[picked] ?? 0) : 0;
  }, [picked, pk]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const b0 = bt.value;
    const t = clock.value;
    const seenN = carrySource(cv, 0, n, n - 1);
    carry(cv, 0, n, n, n, 1);
    const back = seenN > n;
    const cutBeat = n === STOVE || n === ENTHUSE || n === SPARK;
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
    /** A stage by seconds rather than by share of the line. */
    const ss = (a: number, z: number) => {
      'worklet';
      return sm((b - a) / (z - a));
    };
    const q = qv.value;
    const pc = pk.value;
    const ans = (code: number, Q: readonly number[]) => {
      'worklet';
      return Q[n] && pc === code ? q : 0;
    };
    const kept = (k: number, code: number, Q: readonly number[], QN: number) => {
      'worklet';
      return Q[n] ? ans(code, Q) : n > QN && carrySource(cv, k, n, 0) > 0.5 ? 1 : 0;
    };
    const keptTr = (Q: readonly number[]) => {
      'worklet';
      return Q[n] ? tr : 1;
    };
    const place = PLACE[nv];
    const cam = place === 0 ? 0 : -HX;
    const night = place === 2 ? 1 : 0;
    // the veils: the snow flurry into the room, the dark into the night, the dream's flash, a step back
    const cut = cutBeat && !back ? stage(b0, 1, 0.06, CUT_S) * (1 - stage(b0, 1, CUT_S, CUT_S + 0.55)) : 0;
    const backVeil = back ? 1 - stage(b0, 1, 0, 0.45) : 0;
    const haze = n === STOVE ? cut : 0;
    const dark = Math.max(n === ENTHUSE ? cut : 0, backVeil);
    const flash = n === SPARK ? cut : 0;
    const fresh = back || (cutBeat && !pre);
    const src = (slot: number, table: readonly number[]) => {
      'worklet';
      return fresh ? table[nv] : carrySource(cv, slot, n, table[nv]);
    };
    const sp = (who: number) => {
      'worklet';
      return SPK[nv] === who;
    };
    const room = (x: number) => {
      'worklet';
      return x + cam;
    };
    // the reactions to the two questions, kept after their beats
    const rBasket = carry(cv, 9, n, 0, kept(9, 1, Q1, Q1N), keptTr(Q1));
    const rHand = carry(cv, 10, n, 0, kept(10, 2, Q1, Q1N), keptTr(Q1));
    const rBin = carry(cv, 11, n, 0, kept(11, 3, Q1, Q1N), keptTr(Q1));
    const rPath = carry(cv, 12, n, 0, kept(12, 4, Q2, Q2N), keptTr(Q2));
    const rLove = carry(cv, 13, n, 0, kept(13, 5, Q2, Q2N), keptTr(Q2));
    const rSeize = carry(cv, 14, n, 0, kept(14, 6, Q2, Q2N), keptTr(Q2));
    const wrongBin = Q1[n] ? rBin : 0;
    const handNow = Q1[n] ? rHand : 0;

    // ══ DESCARTES ════════════════════════════════════════════════════════════
    const cxs = src(1, C_X);
    const cds = src(2, C_D);
    let cw: Walk = STILL;
    let cx = cxs;
    let cTurns: (readonly number[])[] = [[0, C_D[nv]]];
    let seat = C_SEAT[nv];
    let cot = C_COT[nv];
    let lie = 0;
    let cLean = 0;
    let cNeck = 0;
    let cR: readonly Key[] | null = null;
    let cL: readonly Key[] | null = null;
    if (nv === MARCH) {
      cw = walkOf(cxs, 170, 0.5, cds, b);
      cTurns = [[0, 1], [4.5 / L, -1]];
    }
    if (nv === QUARTERS) cTurns = [[0, -1], [0.36, 1], [0.86, -1]];
    if (nv === STOVE && !pre) cw = walkOf(cxs, HX + 144, 0.5, 1, b);
    if (nv === SIT) {
      cw = walkOf(cxs, HX + 156, 0.3, 1, b);
      seat = ss(1.0, 1.55);
      if (cw.wd !== 0) cx = cw.x;
      cx = lerp(cx, SEAT_X, seat);
      cw = { ...cw, wd: 0 };
    }
    if (nv === WINDOW) cTurns = [[0, 1], [0.34, -1]];
    if (nv === PLAN) cTurns = [[0, -1], [0.02, 1], [0.5, -1]];
    if (nv === HOUSE) cTurns = [[0, -1], [0.04, 1]];
    if (nv === SORT) {
      seat = 1 - ss(0, 0.45);
      cw = walkOf(cxs, HX + 196, 0.45, 1, b);
    }
    if (nv === ENTHUSE && !pre) {
      // writing where he stands, a pace toward the stove, then back the length of the room to the cot
      cw = b < 2.3 ? walkOf(cxs, HX + 256, 1.2, 1, b) : walkOf(HX + 256, COT_X, 2.45, 1, b);
      cTurns = [[0, 1], [5.0 / L, 1]];
      cot = ss(5.35, 5.95);
    }
    if (nv === WIND) {
      lie = ss(0, 0.6) * (1 - ss(1.55, 2.05));
      cot = 1 - ss(1.6, 2.15);
      // the dream: bent over, shoved out and round and back
      cw = b < 3.3 ? walkOf(COT_X, HX + 172, 2.2, 1, b) : walkOf(HX + 172, HX + 136, 3.55, 1, b);
      cLean = 0.42 * ss(2.0, 2.4);
      cNeck = 0.18 * ss(2.0, 2.4);
      cTurns = [[0, 1], [4.5 / L, 1]];
    }
    if (nv === SPARK && !pre) {
      cot = 1;
      cLean = -0.12 * ss(0.4, 0.7);
      cNeck = -0.16 * ss(0.4, 0.7);
    }
    if (nv === Q2N) {
      cLean = 0.1 * st(0.05, 0.2) + 0.08 * ans(4, Q2);
      cNeck = 0.05 - 0.18 * ans(4, Q2) - 0.14 * Math.sin(Math.PI * Math.min(1, (ans(5, Q2) + ans(6, Q2)) * 1.4));
    }
    if (nv === ANSWER) {
      cot = 1 - ss(0, 0.6);
      cw = walkOf(COT_X, HX + 190, 0.65, 1, b);
      cNeck = -0.14 * ss(2.4, 2.8);
    }
    if (nv === VOW) cTurns = [[0, 1], [0.08, -1], [0.92, 1]];
    if (cw.wd === 0 && seat < 0.001 && cot < 0.001 && Math.abs(cxs - C_NEXT[nv]) > 1 && nv !== SIT) cw = walkOf(cxs, C_NEXT[nv], 0.05, cds, b);
    // seated, a short way off the stool: he shifts onto it
    if (seat > 0.999 && Math.abs(cxs - SEAT_X) > 0.5) cx = lerp(cxs, SEAT_X, tr);
    if (cw.wd !== 0) cx = cw.x;
    const cxS = carry(cv, 1, n, cx, cx, 1) + cam;
    const cd = carry(cv, 2, n, 0, faceOf(cds, cTurns, b, L, cw), 1);
    const cg = lerp(G, COT_G, Math.min(1, cot * 1.2));
    const cgS = carry(cv, 3, n, cg, cg, 1);
    const cCode = sp(1) ? TALK : NOD;
    let sc = bodyOf(cw, cCode, t, b, 0);
    if (nv === MARCH) {
      // he looks round at the town, then: what a waste — a hand to his chest, flung out
      cNeck = -0.12 * bump(S0(4.3), S0(4.7), S0(5.2), S0(5.6)) + 0.06 * bump(S0(5.4), S0(5.7), S0(5.9), S0(6.1));
      cR = [[S0(6.6), 8, 46, 0], [S0(7.0), 6, 62, 1], [S0(8.4), 6, 62, 1], [S0(8.9), 30, 64, 1], [S0(10.3), 30, 64, 1], [S0(10.8), 8, 46, 0]];
    }
    if (nv === QUARTERS) cNeck = -0.16 * bump(0.25, 0.4, 0.8, 0.95);
    if (nv === STOVE && !pre) cNeck = -0.14 * bump(0.1, 0.25, 0.5, 0.65) + 0.08 * bump(0.66, 0.74, 0.9, 1);
    if (nv === SIT) {
      // a hand to the stool to drag it; then the hat off and down on the table; then a hand up: no talking
      cL = [[0, 6, 44, 0], [0.04, 14, 18, 1], [0.2, 14, 18, 1], [0.24, 6, 44, 0]];
      cR = [[0.34, 15, 30, 0], [0.38, 8, 84, 1], [0.46, 10, 92, 1], [0.6, 40, 36, 1], [0.66, 40, 36, 1], [0.72, 20, 40, 0.6], [0.8, 22, 70, 1], [0.95, 22, 70, 1]];
      cLean = 0.4 * bump(0.02, 0.06, 0.18, 0.22) + 0.22 * bump(0.54, 0.6, 0.64, 0.7);
      cNeck = 0.1 * bump(0.02, 0.06, 0.18, 0.22) - 0.08 * st(0.76, 0.84);
    }
    if (nv === SCOFF) {
      cR = [[0, 22, 70, 1], [0.12, 20, 34, 1]];
      cL = [[0.06, 14, 30, 0], [0.16, 18, 34, 1]];
      cNeck = -0.12 * st(0.2, 0.3);
    }
    if (nv === BOOKS) {
      // the books out of the pack at his feet, up onto the table; the top one flicked open and shut
      cR = [[0, 20, 34, 1], [0.08, 22, 8, 1], [0.18, 22, 8, 1], [0.32, 50, 36, 1], [0.38, 46, 38, 1], [0.5, 40, 38, 1], [0.56, 44, 44, 1], [0.62, 40, 38, 1], [0.7, 20, 34, 1]];
      cL = [[0, 18, 34, 1], [0.08, 18, 10, 1], [0.18, 18, 10, 1], [0.32, 44, 36, 1], [0.36, 18, 34, 1]];
      cLean = 0.62 * bump(0.04, 0.1, 0.2, 0.3) + 0.28 * bump(0.28, 0.34, 0.62, 0.7);
      cNeck = 0.16 * bump(0.04, 0.1, 0.2, 0.3) + 0.12 * bump(0.5, 0.56, 0.62, 0.7);
    }
    if (nv === WINDOW) {
      cR = [[0, 20, 34, 1]];
      cL = [[0, 18, 34, 1], [0.34, 14, 30, 0]];
      cNeck = -0.06 * st(0.5, 0.6);
    }
    if (nv === PLAN) {
      // unroll the sheet, two strokes of the pencil along the ruler, then the plan held up by the window
      cR = [[0, 20, 34, 1], [0.04, 46, 36, 1], [0.12, 46, 36, 1], [0.18, 36, 36, 1], [0.32, 52, 36, 1], [0.36, 40, 38, 1], [0.48, 52, 36, 1],
        [0.56, 20, 64, 1], [0.95, 20, 64, 1]];
      cL = [[0, 18, 34, 1], [0.04, 30, 36, 1], [0.12, 30, 36, 1], [0.48, 30, 36, 1], [0.56, 24, 58, 1], [0.95, 24, 58, 1]];
      cLean = 0.26 * bump(0.02, 0.06, 0.48, 0.54);
      cNeck = 0.14 * bump(0.02, 0.06, 0.48, 0.54) - 0.08 * st(0.6, 0.7);
    }
    if (nv === HOUSE) {
      // two taps on his own head, then the arm sweeps the table clear into the pack
      cR = [[0, 20, 64, 1], [0.06, 8, 92, 1], [0.1, 9, 98, 1], [0.14, 8, 92, 1], [0.18, 9, 98, 1], [0.24, 20, 44, 0.8],
        [0.34, 50, 36, 1], [0.48, 22, 32, 1], [0.54, 20, 34, 1]];
      cL = [[0, 24, 58, 1], [0.06, 18, 34, 1]];
      cLean = 0.3 * bump(0.3, 0.36, 0.46, 0.52);
      cNeck = -0.06 * bump(0.06, 0.1, 0.16, 0.2) + 0.12 * bump(0.3, 0.36, 0.46, 0.52) - 0.1 * st(0.7, 0.8);
    }
    if (nv === APPLES) {
      // he watches the basket come, rubs his hands, and reaches to make room for it
      cR = [[0, 20, 34, 1], [0.3, 16, 52, 1], [0.42, 18, 50, 1], [0.6, 22, 40, 1], [0.8, 28, 36, 1]];
      cL = [[0, 18, 34, 1], [0.3, 14, 50, 1], [0.6, 16, 34, 1]];
      cLean = 0.12 * bump(0.6, 0.72, 0.9, 1);
      cNeck = -0.08 * bump(0.1, 0.2, 0.4, 0.5) + 0.1 * bump(0.6, 0.7, 0.9, 1);
    }
    if (nv === Q1N) {
      // he takes the top red apple and holds it up; a right answer: chin up; wrong: a recoil
      cR = [[0, 20, 34, 1], [0.12, 42, 40, 1], [0.22, 42, 40, 1], [0.36, 16, 56, 1]];
      cL = [[0, 18, 34, 1]];
      cLean = 0.3 * bump(0.04, 0.12, 0.22, 0.32) - 0.08 * handNow;
      cNeck = 0.06 * st(0.3, 0.4) - 0.18 * ans(1, Q1) - 0.12 * Math.sin(Math.PI * Math.min(1, (ans(2, Q1) + ans(3, Q1)) * 1.4));
    }
    if (nv === SORT) {
      // up off the stool, a step to the table: the basket tipped, two sweeps back in, the soft one aside
      cR = [[0, 16, 40, 1], [0.08, 16, 40, 0], [0.18, 14, 40, 0], [0.22, 18, 36, 1], [0.3, 24, 46, 1], [0.38, 34, 36, 0.9], [0.46, 34, 34, 1],
        [0.6, 18, 40, 1], [0.7, 26, 36, 1], [0.8, 6, 36, 1], [0.9, 10, 44, 0.4]];
      cL = [[0.18, 10, 40, 0], [0.22, 14, 34, 1], [0.3, 20, 30, 1], [0.36, 12, 36, 0.4]];
      cLean = 0.34 * bump(0.2, 0.26, 0.84, 0.9);
      cNeck = 0.14 * bump(0.2, 0.26, 0.84, 0.9) - 0.1 * st(0.9, 0.96);
    }
    if (nv === GRUMBLE) {
      cR = [[0, 10, 44, 0.4], [0.2, 16, 36, 1]];
      cNeck = -0.1 + 0.08 * bump(0.2, 0.3, 0.5, 0.6);
    }
    if (nv === ENTHUSE && !pre) {
      // the notebook open in his left hand, the pencil in his right — writing, then on the table as he passes
      cL = [[0, 14, 56, 1], [2.8 / L, 14, 56, 1], [3.0 / L, 22, 38, 1], [3.3 / L, 10, 44, 0]];
      cR = [[0, 18, 60, 1], [0.08, 20, 62, 1], [0.12, 18, 59, 1], [0.16, 20, 62, 1], [2.8 / L, 18, 60, 1], [3.1 / L, 10, 44, 0]];
      cNeck = 0.16 * (1 - ss(1.1, 1.3));
    }
    if (nv === WIND) {
      cR = [[2.2 / L, 10, 44, 0], [2.5 / L, 18, 70, 1], [3.1 / L, 24, 76, 1], [3.6 / L, 12, 82, 1], [4.4 / L, 16, 70, 1]];
      cL = [[2.2 / L, 10, 44, 0], [2.5 / L, 4, 84, 1], [4.4 / L, 6, 80, 1]];
    }
    if ((nv === SPARK && !pre) || nv === Q2N) {
      // the blanket clutched up to his chest
      cR = [[0, 14, 24, 1]];
      cL = [[0, 12, 26, 1]];
    }
    if (nv === ANSWER) {
      cR = [[0, 14, 24, 1], [0.14, 10, 44, 0], [2.0 / L, 10, 44, 0], [2.3 / L, 16, 36, 1]];
      cL = [[0, 12, 26, 1], [0.14, 10, 44, 0]];
    }
    if (nv === VOW) {
      cR = [[0, 16, 36, 1], [0.06, 16, 36, 0]];
      cNeck = -0.08 * bump(0.5, 0.6, 0.8, 0.9);
    }
    if (nv === AFTER) {
      cR = [[0, 10, 44, 0], [0.9, 16, 36, 0], [0.96, 16, 36, 1]];
      cNeck = 0.06 * bump(0.5, 0.6, 0.8, 0.9);
    }
    if (nv > AFTER) {
      cR = [[0, 16, 36, 1]];
      cNeck = -0.06;
    }
    // seated on the stool: the hands are laid out against the seated body
    if (seat > 0.001) {
      let s2 = leanOf(seated(STOOL_H, 0, 16), cLean, cNeck);
      s2 = keyed(s2, cR, u, cxS, cgS, cd, 1);
      s2 = keyed(s2, cL, u, cxS, cgS, cd, -1);
      if (seat >= 0.999) sc = s2;
      else {
        sc = keyed(sc, cR, u, cxS, cgS, cd, 1);
        sc = keyed(sc, cL, u, cxS, cgS, cd, -1);
        sc = seatMix(leanOf(sc, cLean, cNeck), s2, seat);
      }
    } else {
      sc = keyed(sc, cR, u, cxS, cgS, cd, 1);
      sc = keyed(sc, cL, u, cxS, cgS, cd, -1);
      sc = leanOf(sc, cLean, cNeck);
    }
    sc = groundOf(sc, cot, lie);
    if (cot > 0.001 && lie < 0.5) {
      // on the cot: the hands work against the sitting body
      sc = keyed(sc, cR, u, cxS, cgS, cd, 1);
      sc = keyed(sc, cL, u, cxS, cgS, cd, -1);
      sc = leanOf(sc, cLean * cot, cNeck * cot);
    }
    const prevC = carryFrom(heldC, n, hHold(cCode, t, 0));
    const figC = keepHeld(heldC, cw.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ══ THE LANDLORD ═════════════════════════════════════════════════════════
    // out of sight he is wherever the beat needs him: he comes in at the door, never across the room
    const hxs = H_ON[Math.max(0, n - 1)] === 0 ? H_X[nv] : src(4, H_X);
    const hds = src(5, H_D);
    let hw: Walk = STILL;
    let hx = hxs;
    let hTurns: (readonly number[])[] = [[0, H_D[nv]]];
    let hO = H_ON[nv];
    let hR: readonly Key[] | null = null;
    let hL: readonly Key[] | null = null;
    let hLean = 0;
    let hNeck = 0;
    if (nv === STOVE && !pre) {
      // open the fire door; turn; two logs off the soldier's bundle; turn; in they go; a wagging finger
      hTurns = [[0, 1], [0.13, -1], [0.29, 1], [0.6, -1]];
      hR = [[0, 8, 44, 0], [0.05, 26, 36, 1], [0.11, 30, 34, 1], [0.15, 10, 44, 0], [0.2, 22, 50, 1], [0.27, 22, 50, 1], [0.36, 18, 40, 1],
        [0.42, 30, 36, 1], [0.48, 10, 44, 0], [0.66, 18, 82, 1], [0.74, 22, 86, 1], [0.82, 18, 82, 1], [0.9, 22, 86, 1], [0.97, 10, 44, 0.3]];
      hL = [[0.15, 6, 44, 0], [0.2, 20, 48, 1], [0.27, 20, 48, 1], [0.36, 16, 40, 1], [0.42, 28, 34, 1], [0.48, 6, 44, 0]];
      hLean = 0.2 * bump(0.38, 0.42, 0.44, 0.5);
    }
    if (nv === SIT) {
      hTurns = [[0, -1], [0.26, 1], [0.84, -1]];
      hw = walkOf(hxs, HX + 346, 0.3 * L, -1, b);
      hR = [[0, 6, 44, 0.3], [0.1, 2, 46, 1]];
      hL = [[0, 6, 44, 0.3], [0.1, 0, 46, 1]];
      hNeck = 0.1 * bump(0.66, 0.76, 0.86, 0.96);
    }
    if (nv === SCOFF) {
      // arms folded; two slow shakes of the head
      hR = [[0, 6, 44, 0.4], [0.1, 10, 60, 1]];
      hL = [[0, 6, 44, 0.4], [0.1, 8, 56, 1]];
      hNeck = 0.12 * Math.sin(Math.PI * 2 * clamp01((u - 0.3) / 0.5)) * bump(0.28, 0.32, 0.76, 0.82);
      hLean = -0.04 * st(0.1, 0.2);
    }
    if (nv === BOOKS) {
      // he warms his hands at the open fire door
      hTurns = [[0, -1], [0.04, 1], [0.86, -1]];
      hR = [[0.1, 8, 44, 0], [0.18, 16, 34, 1], [0.78, 16, 34, 1], [0.86, 8, 44, 0]];
      hL = [[0.1, 6, 44, 0], [0.2, 14, 36, 1], [0.78, 14, 36, 1], [0.86, 6, 44, 0]];
      hLean = 0.16 * bump(0.1, 0.2, 0.76, 0.86);
    }
    if (nv === WINDOW) {
      // he polishes a tile with the corner of his apron, twice
      hTurns = [[0, -1], [0.04, 1], [0.8, -1]];
      hR = [[0.1, 8, 44, 0], [0.18, 18, 70, 1], [0.3, 20, 76, 1], [0.42, 18, 70, 1], [0.54, 20, 76, 1], [0.7, 18, 70, 1], [0.78, 8, 44, 0]];
      hL = [[0, 6, 44, 0], [0.18, 6, 46, 1], [0.72, 6, 46, 1], [0.78, 6, 44, 0]];
    }
    if (nv === PLAN) {
      // he leans to look at the plan, and rubs his chin
      hLean = 0.12 * st(0.6, 0.7);
      hR = [[0.6, 8, 44, 0], [0.7, 8, 88, 1], [0.92, 8, 88, 1]];
      hNeck = 0.08 * st(0.62, 0.72);
    }
    if (nv === HOUSE) {
      hR = [[0, 8, 88, 1], [0.1, 2, 46, 1]];
      hL = [[0.06, 6, 44, 0], [0.14, 0, 46, 1]];
      hNeck = 0.1 * Math.sin(Math.PI * 2 * clamp01((u - 0.5) / 0.4)) * bump(0.48, 0.52, 0.86, 0.9);
    }
    if (nv === APPLES || nv === Q1N || nv === SORT) {
      hR = [[0, 10, 60, 1]];
      hL = [[0, 8, 56, 1]];
      if (nv === APPLES) hNeck = 0.06 * bump(0.7, 0.8, 0.9, 1);
      if (nv === Q1N) {
        // the wood bin: his firewood jolts — a lean back, and both hands up (below)
        hLean = -0.14 * wrongBin;
        hNeck = -0.16 * wrongBin;
      }
      if (nv === SORT) {
        hR = [[0, 10, 60, 1], [0.72, 10, 60, 1], [0.8, 8, 88, 1], [0.95, 8, 88, 1]];
        hNeck = 0.1 * bump(0.66, 0.74, 0.84, 0.92);
      }
    }
    if (nv === GRUMBLE) {
      // he stoops for the apple on the floor, comes up with it, and sighs
      hR = [[0, 10, 60, 1], [0.08, 8, 44, 0.4], [0.18, 18, 4, 1], [0.3, 18, 4, 1], [0.44, 12, 56, 1], [0.95, 12, 56, 1]];
      hL = [[0, 8, 56, 1], [0.1, 6, 44, 0], [0.18, 6, 30, 1], [0.32, 6, 44, 0]];
      hLean = 0.78 * bump(0.08, 0.2, 0.3, 0.42) - 0.06 * bump(0.6, 0.68, 0.78, 0.86);
      hNeck = 0.3 * bump(0.08, 0.2, 0.3, 0.42) - 0.12 * bump(0.6, 0.68, 0.78, 0.86);
    }
    if (nv === VOW) {
      // in at the door with the lantern up; two flaps of the hand toward the cot: sleep
      hO = st(0.06, 0.2);
      hR = [[0, 12, 80, 1]];
      hL = [[0.5, 6, 44, 0], [0.6, 24, 62, 1], [0.72, 24, 50, 1], [0.84, 6, 44, 0]];
      hLean = 0.22 * st(0.08, 0.24);
      hNeck = 0.06 * st(0.08, 0.24);
    }
    if (nv === AFTER) {
      hTurns = [[0, 1], [0.02, -1]];
      hw = walkOf(hxs, HX - 30, 0.2, 1, b);
      hO = 1 - ss(0.75, 1.0);
      hR = [[0, 12, 80, 1], [0.2, 12, 70, 1]];
    }
    if (hw.wd === 0 && hO > 0.5 && Math.abs(hxs - H_NEXT[nv]) > 1) hw = walkOf(hxs, H_NEXT[nv], 0.05, hds, b);
    if (hw.wd !== 0) hx = hw.x;
    const hxS = carry(cv, 4, n, hx, hx, 1) + cam;
    const hd0 = carry(cv, 5, n, 0, faceOf(hds, hTurns, b, L, hw), 1);
    const hCode = sp(2) ? TALK : NOD;
    let sh = bodyOf(hw, hCode, t, b, 1);
    sh = keyed(sh, hR, u, hxS, G, hd0, 1);
    sh = keyed(sh, hL, u, hxS, G, hd0, -1);
    sh = leanOf(sh, hLean, hNeck);
    if (nv === Q1N && wrongBin > 0) {
      const up = Math.sin(Math.PI * Math.min(1, wrongBin * 1.2));
      sh = hand(sh, hxS, G, hd0, 1, 14, 92, up);
      sh = hand(sh, hxS, G, hd0, -1, 8, 88, up);
    }
    const prevH = carryFrom(heldH, n, hHold(hCode, t, 1));
    const figH = keepHeld(heldH, hw.walking ? mixKeepLegs(prevH, sh, tr) : mixStance(prevH, sh, tr));
    const hOn = carry(cv, 6, n, hO, hO, tr);

    // ══ THE SOLDIER ══════════════════════════════════════════════════════════
    const pxs = src(7, P_X);
    const pds = src(8, P_D);
    let pw: Walk = STILL;
    let px = pxs;
    let pTurns: (readonly number[])[] = [[0, P_D[nv]]];
    let pSit = P_SIT[nv];
    let pR: readonly Key[] | null = null;
    let pL: readonly Key[] | null = null;
    let pLean = 0;
    let pNeck = 0;
    if (nv === MARCH) {
      pw = walkOf(pxs, 118, 0.9, 1, b);
      // both hands on the straps; the bundle hitched at 2.6s and 5.2s
      pR = [[0, 8, 66, 1]];
      pL = [[0, 6, 64, 1]];
      pLean = 0.12 - 0.08 * (bump(S0(2.45), S0(2.6), S0(2.7), S0(2.95)) + bump(S0(5.05), S0(5.2), S0(5.3), S0(5.55)));
    }
    if (nv === QUARTERS) {
      pR = [[0, 8, 66, 1], [0.24, 8, 66, 1], [0.34, 30, 100, 1], [0.8, 30, 100, 1], [0.9, 8, 66, 1]];
      pL = [[0, 6, 64, 1]];
      pLean = 0.12 - 0.08 * bump(0.08, 0.14, 0.16, 0.22);
      pNeck = -0.12 * bump(0.3, 0.38, 0.8, 0.88);
    }
    if (nv === STOVE && !pre) {
      pR = [[0, 14, 52, 1], [0.16, 20, 50, 1], [0.32, 20, 50, 1], [0.4, 14, 52, 1]];
      pL = [[0, 12, 50, 1], [0.16, 18, 48, 1], [0.32, 18, 48, 1], [0.4, 12, 50, 1]];
      pNeck = 0.06 * bump(0.5, 0.6, 0.8, 0.9);
    }
    if (nv === SIT) {
      // the bundle into the bin, then across to the window
      pR = [[0, 14, 52, 1], [0.08, 22, 26, 1], [0.18, 22, 26, 1], [0.24, 10, 44, 0]];
      pL = [[0, 12, 50, 1], [0.08, 20, 24, 1], [0.18, 20, 24, 1], [0.24, 6, 44, 0]];
      pLean = 0.5 * bump(0.04, 0.1, 0.16, 0.24);
      pw = walkOf(pxs, HX + 84, 0.26 * L, 1, b);
      pTurns = [[0, 1], [0.93, 1]];
    }
    if (nv === BOOKS) pNeck = 0.08 * bump(0.3, 0.4, 0.7, 0.8);
    if (nv === WINDOW) {
      // two rubs at the frost with the heel of his hand; then he turns to them
      pR = [[0.06, 8, 44, 0], [0.14, 14, 88, 1], [0.32, 26, 96, 1], [0.4, 26, 96, 0.6], [0.48, 8, 44, 0]];
      pLean = 0.08 * bump(0.1, 0.16, 0.42, 0.5);
    }
    if (nv === PLAN) pNeck = 0.08 * bump(0.6, 0.66, 0.84, 0.9);
    if (nv === HOUSE) pR = [[0, 8, 44, 0], [0.5, 8, 44, 0], [0.56, 8, 88, 1], [0.86, 8, 88, 1], [0.92, 8, 44, 0]];
    if (nv === APPLES) {
      // the basket off the floor, carried over, set on the table
      pR = [[0, 8, 44, 0], [0.05, 22, 22, 1], [0.15, 22, 22, 1], [0.2, 16, 46, 1], [3.5 / L, 16, 46, 1], [3.75 / L, 28, 40, 1], [3.95 / L, 28, 40, 1], [4.2 / L, 8, 44, 0]];
      pL = [[0, 6, 44, 0], [0.05, 20, 20, 1], [0.15, 20, 20, 1], [0.2, 14, 44, 1], [3.5 / L, 14, 44, 1], [3.75 / L, 26, 38, 1], [3.95 / L, 26, 38, 1], [4.2 / L, 6, 44, 0]];
      pLean = 0.5 * bump(0.02, 0.08, 0.14, 0.2) + 0.12 * bump(3.5 / L, 3.7 / L, 3.95 / L, 4.15 / L);
      if (b >= 0.7) pw = walkOf(pxs, HX + 248, 0.7, 1, b);
      pTurns = [[0, 1], [3.4 / L, -1]];
    }
    if (nv === Q1N) {
      // a step back from the table, so the basket and the bin are clear; he turns to watch
      pw = walkOf(pxs, HX + 272, 0.06, -1, b);
      pTurns = [[0, -1], [Math.min(0.95, (pw.we + 0.02) / L), -1]];
      pNeck = -0.1 * ans(1, Q1);
    }
    if (nv === SORT) {
      pLean = -0.1 * bump(0.86, 0.9, 0.96, 1);
      pNeck = -0.18 * bump(0.86, 0.9, 0.96, 1);
    }
    if (nv === GRUMBLE) pNeck = -0.1 * bump(0.5, 0.6, 0.8, 0.9);
    if (nv >= ENTHUSE && nv < AFTER) {
      // dozing by the bin; the bang wakes him
      pNeck = 0.26 - (nv === SPARK && !pre ? 0.36 * bump(0.04, 0.1, 0.5, 0.7) : 0) - (nv === Q2N ? 0.2 : 0);
      if (nv === VOW) pNeck = 0.1;
      // he stirs in his sleep, a different way each time: a scratch, a start, his eyes, the lantern
      if (nv === ENTHUSE) pR = [[0.5, 8, 30, 0], [0.6, 12, 58, 1], [0.7, 12, 58, 1], [0.8, 8, 30, 0]];
      if (nv === WIND) pR = [[0.3, 8, 30, 0], [0.4, 10, 62, 1], [0.5, 12, 64, 1], [0.6, 8, 30, 0]];
      if (nv === SPARK) { pR = [[0.05, 8, 30, 0], [0.12, 16, 56, 1], [0.5, 16, 56, 1], [0.7, 8, 30, 0]]; pL = [[0.05, 6, 30, 0], [0.12, 12, 52, 1], [0.5, 12, 52, 1], [0.7, 6, 30, 0]]; }
      if (nv === Q2N) { pLean = 0.12 * st(0.1, 0.3); pL = [[0.1, 6, 30, 0], [0.25, 18, 34, 1]]; }
      if (nv === ANSWER) pR = [[0.2, 8, 30, 0], [0.3, 6, 60, 1], [0.6, 6, 60, 1], [0.7, 8, 30, 0]];
      if (nv === VOW) { pL = [[0.1, 6, 30, 0], [0.2, 10, 64, 1], [0.8, 10, 64, 1], [0.9, 6, 30, 0]]; pLean = -0.08 * st(0.1, 0.2); }
    }
    if (nv === AFTER) {
      pSit = 1 - ss(0, 0.6);
      if (b >= 0.7) pw = walkOf(pxs, HX + 252, 0.7, -1, b);
      pR = [[2.3 / L, 8, 44, 0], [2.5 / L, 28, 32, 1], [2.65 / L, 28, 32, 1], [2.9 / L, 18, 96, 1], [3.9 / L, 18, 96, 1], [4.3 / L, 28, 32, 1], [4.6 / L, 8, 44, 0]];
      pLean = 0.2 * bump(2.3 / L, 2.5 / L, 2.65 / L, 2.85 / L) + 0.2 * bump(4.1 / L, 4.3 / L, 4.4 / L, 4.6 / L);
    }
    // a beat tapped through early leaves him short of his mark: he walks on to it (never a slide)
    if (pw.wd === 0 && pSit < 0.001 && Math.abs(pxs - P_NEXT[nv]) > 1) pw = walkOf(pxs, P_NEXT[nv], 0.05, pds, b);
    if (pw.wd !== 0) px = pw.x;
    const pxS = carry(cv, 7, n, px, px, 1) + cam;
    const pd = carry(cv, 8, n, 0, faceOf(pds, pTurns, b, L, pw), 1);
    const pCode = sp(3) ? TALK : NOD;
    let spp = bodyOf(pw, pCode, t, b, 2);
    spp = keyed(spp, pR, u, pxS, G, pd, 1);
    spp = keyed(spp, pL, u, pxS, G, pd, -1);
    spp = leanOf(spp, pLean, pNeck);
    spp = groundOf(spp, pSit, 0);
    if (pSit > 0.001) {
      // sitting on the floor: the hands work against the sitting body
      spp = keyed(spp, pR, u, pxS, G, pd, 1);
      spp = keyed(spp, pL, u, pxS, G, pd, -1);
      spp = leanOf(spp, pLean * pSit, pNeck * pSit);
    }
    const prevP = carryFrom(heldP, n, hHold(pCode, t, 2));
    const figP = keepHeld(heldP, pw.walking ? mixKeepLegs(prevP, spp, tr) : mixStance(prevP, spp, tr));

    // ══ THE SENTRY (silent; the town only) ═══════════════════════════════════
    let se = hLive(NOD, t, b, 3);
    let seR: readonly Key[] = [[0, 22, 40, 1]];
    let seL: readonly Key[] = [[0, 20, 42, 1]];
    let seNeck = 0;
    if (nv === MARCH) {
      // hands at the brazier; he looks up as they pass; then blows into his hands
      seR = [[0, 22, 40, 1], [S0(6.5), 22, 40, 1], [S0(7.0), 6, 86, 1], [S0(8.2), 6, 86, 1], [S0(8.7), 22, 40, 1]];
      seL = [[0, 20, 42, 1], [S0(6.5), 20, 42, 1], [S0(7.0), 4, 84, 1], [S0(8.2), 4, 84, 1], [S0(8.7), 20, 42, 1]];
      seNeck = -0.1 * bump(S0(1.2), S0(1.8), S0(3.2), S0(3.8)) + 0.12 * bump(S0(6.5), S0(7.0), S0(8.2), S0(8.7));
    }
    if (nv === QUARTERS) {
      // he rubs his hands together over the coals, once
      seR = [[0, 22, 40, 1], [0.3, 24, 44, 1], [0.5, 20, 40, 1], [0.7, 22, 40, 1]];
      seNeck = 0.08 * bump(0.2, 0.3, 0.7, 0.8);
    }
    se = keyed(se, seR, u, SENTRY_X + cam, G, 1, 1);
    se = keyed(se, seL, u, SENTRY_X + cam, G, 1, -1);
    se = leanOf(se, 0.1, seNeck);
    const figE = keepHeld(heldE, mixStance(carryFrom(heldE, n, se), se, tr));

    // ── the bundles ──────────────────────────────────────────────────────────
    const bC = pose(figC, cxS, cgS, K, cd, 1);
    const bH = pose(figH, hxS, G, K, hd0, hOn);
    const bP = pose(figP, pxS, G, K, pd, 1);
    const bE = pose(figE, SENTRY_X + cam, G, K, 1, place === 0 ? 1 : 0);
    const cRw = jointOf(bC, 'wrR');
    const cLw = jointOf(bC, 'wrL');
    const hRw = jointOf(bH, 'wrR');
    const hLw = jointOf(bH, 'wrL');
    const pRw = jointOf(bP, 'wrR');
    const pLw = jointOf(bP, 'wrL');
    const pShB = jointOf(bP, 'shB');
    const mid = (a: { x: number; y: number }, c: { x: number; y: number }) => {
      'worklet';
      return { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
    };

    // ── the night's dream (needed early: the table's things hide while it is up) ──
    const dreamIn = nv === Q2N ? st(0, 0.14) : nv === ANSWER ? 1 - st(0, 0.16) : 0;
    const tableOn = 1 - dreamIn;

    // ── the hat: on his head until he lifts it off (b3), then on the table ──
    let hat = HIDE;
    if (nv >= SIT) {
      const hd2 = jointOf(bC, 'head');
      const sb = jointOf(bC, 'shB');
      const neckA = Math.atan2(hd2.y - sb.y, hd2.x - sb.x) + Math.PI / 2;
      const lift = nv === SIT ? st(0.42, 0.48) : 1;
      const down = nv === SIT ? st(0.58, 0.64) : 1;
      const ax = lerp(lerp(hd2.x, cRw.x, lift), room(HAT_REST.x), down);
      const ay = lerp(lerp(hd2.y, cRw.y - 4, lift), HAT_REST.y + 11.5 * K, down);
      const rot = lerp(neckA, 0, Math.max(lift, down));
      hat = P(ax, ay, tableOn, (rot * 180) / Math.PI);
    }

    // ── the logs: on his back, in his arms, two into the fire, the rest into the bin ──
    let bundle = HIDE;
    if (nv <= QUARTERS) {
      const hitch = nv === MARCH ? 3 * (bump(S0(2.45), S0(2.6), S0(2.7), S0(2.95)) + bump(S0(5.05), S0(5.2), S0(5.3), S0(5.55))) : 3 * bump(0.08, 0.14, 0.16, 0.22);
      bundle = P(pShB.x - 12 * pd, pShB.y + 8 - hitch, 1, 78 * pd);
    } else if (nv === STOVE || nv === SIT) {
      const into = nv === SIT ? st(0.08, 0.2) : 0;
      const m = mid(pRw, pLw);
      bundle = P(m.x, lerp(m.y - 4, m.y + 8, into), 1 - (nv === SIT ? st(0.18, 0.24) : 0));
    }
    const logIn = nv === STOVE ? st(0.36, 0.44) : 1;
    const logHeld = nv === STOVE ? st(0.2, 0.24) : 0;
    const log1 = nv === STOVE && !pre && logHeld > 0.5 && logIn < 1
      ? P(lerp(hRw.x, room(FIRE.x), logIn), lerp(hRw.y, FIRE.y, logIn), 1 - st(0.42, 0.46)) : HIDE;
    const log2 = nv === STOVE && !pre && logHeld > 0.5 && logIn < 1
      ? P(lerp(hLw.x, room(FIRE.x - 4), logIn), lerp(hLw.y + 3, FIRE.y + 4, logIn), 1 - st(0.42, 0.46)) : HIDE;
    // the stove: its fire door opened (b2) and left open, the glow up on the tiles
    const fireOpen = nv < STOVE ? 0 : nv === STOVE ? (pre ? 0 : st(0.05, 0.11)) : 1;
    const glow = nv < STOVE ? 0 : nv === STOVE ? st(0.46, 0.8) : 1;
    const stoolX = nv < SIT ? STOOL0 : nv === SIT ? lerp(STOOL0, STOOL1, st(0.06, 0.2)) : STOOL1;

    // ── the schoolbooks, the plan, the pack ──────────────────────────────────
    const books: Pt[] = [];
    const flick = nv === BOOKS ? bump(0.54, 0.58, 0.6, 0.66) : 0;
    for (let k = 0; k < 3; k += 1) {
      const restX = room(BOOK_REST + k * 2 - 2);
      const restY = TOP - 3 - k * 5;
      let x = restX;
      let y = restY;
      let o = 0;
      if (nv === BOOKS) {
        const up = st(0.18, 0.32);
        const set = st(0.32, 0.36);
        o = st(0.1, 0.14);
        x = lerp(lerp(room(PACK_X), cRw.x, up), restX, set);
        y = lerp(lerp(500 - 12, cRw.y - k * 5, up), restY, set);
      }
      if (nv === WINDOW || nv === PLAN) o = 1;
      if (nv === HOUSE) {
        // swept off the left end of the table, into the pack below
        const sw = st(0.3, 0.44);
        const fall = st(0.44, 0.5);
        o = 1 - st(0.5, 0.54);
        x = lerp(lerp(restX, room(HX + 186 - k * 3), sw), room(PACK_X), fall);
        y = lerp(restY, 500 - 14, fall);
      }
      books.push(P(x, y, o, k === 2 ? -6 * flick : 0, 1, k === 2 ? 1 - 1.6 * flick : 1));
    }
    const pack = place === 1 && nv >= STOVE ? 1 : 0;
    let plan = HIDE;
    let planLines = 0;
    let planLinesV = 0;
    if (nv === PLAN) {
      const lifted = st(0.52, 0.6);
      const m = mid(cRw, cLw);
      const unroll = st(0.03, 0.1);
      plan = P(lerp(room(HX + 240), m.x, lifted), lerp(TOP - 1, m.y - 14, lifted), 1, 0, Math.max(0.08, unroll), lerp(0.2, 1, lifted));
      planLines = st(0.18, 0.32);
      planLinesV = st(0.34, 0.48);
    }
    if (nv === HOUSE) {
      const sw = st(0.3, 0.44);
      const fall = st(0.44, 0.5);
      plan = P(lerp(lerp(room(HX + 240), room(HX + 188), sw), room(PACK_X), fall), lerp(TOP - 1, 500 - 14, fall), 1 - st(0.48, 0.52), 0, 1, 0.2);
      planLines = 1;
      planLinesV = 1;
    }
    const pencil = nv === PLAN && u < 0.52 ? P(cRw.x, cRw.y, 1, -30) : nv === ENTHUSE && !pre && b < 3.1 ? P(cRw.x, cRw.y, 1, -40) : HIDE;
    const ruler = nv === PLAN ? 1 - st(0.48, 0.52) : 0;

    // ── the basket and the apples ────────────────────────────────────────────
    const carried = nv === APPLES && b > 0.25 && b <= 3.95;
    let bas = HIDE;
    let tilt = 0;
    if (place === 1 && nv >= STOVE) {
      if (nv < APPLES || (nv === APPLES && b <= 0.25)) bas = P(room(BASKET_FLOOR), 500, 1);
      else if (carried) { const m = mid(pRw, pLw); bas = P(m.x - 2, m.y + 26, 1); }
      else bas = P(room(BASKET_X), TOP, 1);
      // tipped: on a right answer (a little), and in the sort; set upright again for the sweeps
      tilt = nv === Q1N ? 30 * rBasket : nv === SORT ? Math.max(30 * rBasket, 72 * st(0.22, 0.3)) * (1 - st(0.36, 0.4)) : 0;
    }
    if (tilt !== 0) {
      // tipped over the foot of its right side
      const a = (tilt * Math.PI) / 180;
      const px0 = 15;
      bas = { ...bas, x: bas.x + px0 - px0 * Math.cos(a), y: bas.y - px0 * Math.sin(a), r: tilt };
    }
    const spill = nv === Q1N ? 0.32 * rBasket : nv === SORT ? Math.max(0.32 * rBasket, st(0.24, 0.38)) : nv > SORT ? 1 : 0;
    const apples: Pt[] = [];
    for (let k = 0; k < 7; k += 1) {
      const inX = bas.x + IN[k][0];
      const inY = bas.y + IN[k][1] + 3;
      let x = inX;
      let y = inY;
      let o = place === 1 && (nv > APPLES || (nv === APPLES && b > 0.25)) ? 1 : nv === APPLES ? 1 : 0;
      // the one he takes out and holds up (k 3)
      if (k === 3 && nv === Q1N) {
        const out = st(0.18, 0.22);
        x = lerp(inX, cRw.x + 2 * cd, out);
        y = lerp(inY, cRw.y - 4, out);
        if (handNow > 0.55) {
          const f = clamp01((handNow - 0.55) / 0.45);
          x = lerp(x, room(HX + 196), f);
          y = lerp(y, TOP - APPLE_R, f * f) - 12 * Math.sin(Math.PI * f);
        }
      }
      // tumbling out along the table, k 6 off the end onto the floor
      const sk = clamp01((spill - k * 0.1) / 0.4);
      if (sk > 0 && !(k === 3 && nv === Q1N)) {
        if (k === 6) {
          const along = clamp01(sk * 1.4);
          const fall = clamp01((sk - 0.7) / 0.3);
          x = lerp(lerp(inX, room(OUT_X[6]), along), room(STRAY.x), fall);
          y = lerp(lerp(inY, TOP - APPLE_R, along), STRAY.y, fall * fall) - 10 * Math.sin(Math.PI * fall);
        } else {
          x = lerp(inX, room(OUT_X[k]), sk);
          y = lerp(inY, TOP - APPLE_R - (k % 2) * 2.4, sk) - 6 * Math.sin(Math.PI * sk);
        }
      }
      // back in: two sweeps (k 1–3, then k 4–5), the soft one aside
      if (nv === SORT && k !== 6) {
        const backIn = k === 0 ? 0 : k <= 3 ? st(0.46, 0.55) : st(0.5, 0.6);
        x = lerp(x, inX, backIn);
        y = lerp(y, inY, backIn) - 6 * Math.sin(Math.PI * backIn);
        if (k === 0) {
          const aside = st(0.7, 0.8);
          x = lerp(x, room(HX + 200), aside);
          y = lerp(y, TOP - APPLE_R, aside) - 8 * Math.sin(Math.PI * aside);
        }
      }
      if (nv > SORT && k !== 6) {
        x = k === 0 ? room(HX + 200) : inX;
        y = k === 0 ? TOP - APPLE_R : inY;
      }
      if (k === 6 && nv === GRUMBLE) {
        const grab = st(0.26, 0.3);
        x = lerp(room(STRAY.x), hRw.x, grab);
        y = lerp(STRAY.y, hRw.y - 3, grab);
      }
      if (place !== 1 || nv < APPLES) o = 0;
      // the wrong pick of the apple in his hand: it turns, and shows its hidden brown side
      const sx = k === 3 && nv === Q1N && handNow > 0 ? Math.abs(Math.cos(Math.PI * Math.min(1, handNow * 1.8))) : 1;
      apples.push(P(x, y, o, 0, Math.max(0.15, sx), 1));
    }
    const appleFlip = nv === Q1N && handNow > 0.28 ? 1 : 0;
    // the wood bin: jolts on a wrong pick, a hop and a rattle
    const binHop = wrongBin > 0 ? Math.abs(Math.sin(wrongBin * Math.PI * 2)) * (1 - wrongBin) * 6 : 0;

    // ── the night: the candle, the notebook, the cot's blanket, the dream ────
    const dropT = 2.95;
    let note = HIDE;
    if (nv === ENTHUSE && !pre) {
      const f = clamp01((b - dropT) / 0.3);
      note = b < dropT ? P(cLw.x, cLw.y - 2, 1) : P(lerp(cLw.x, room(NOTE_REST.x), f), lerp(cLw.y, NOTE_REST.y, f * f), 1);
    } else if (place === 2 && nv !== AFTER) note = P(room(NOTE_REST.x), NOTE_REST.y, tableOn);
    if (nv === AFTER) {
      const up = clamp01((b - 2.6) / 0.2) * (1 - clamp01((b - 4.4) / 0.2));
      note = up > 0.5 ? P(pRw.x, pRw.y - 3, 1) : P(room(NOTE_REST.x), NOTE_REST.y, 1);
    }
    const wash = nv === WIND ? ss(0.7, 1.6) : nv === SPARK || nv === Q2N ? 1 : nv === ANSWER ? 1 - st(0, 0.2) : 0;
    const wind = nv === WIND ? ss(1.2, 2.0) * (1 - ss(4.6, 5.17)) : 0;
    const sparks = nv === SPARK && !pre ? clamp01((b - 0.9) / 1.6) : 0;
    const poems = nv === ANSWER ? st(0.1, 0.3) : nv > ANSWER ? 1 : 0;
    const blanket = (nv === SPARK && !pre) || nv === Q2N ? mid(cRw, cLw) : null;
    const candle = place === 2 ? tableOn : 0;
    // the door: open on the vow, shut again after
    const doorOpen = nv === VOW ? st(0, 0.14) : nv === AFTER ? 1 - st(0.24, 0.34) : 0;
    const lantern = nv === VOW || (nv === AFTER && hOn > 0.05) ? P(hRw.x, hRw.y, hOn) : HIDE;
    // the window's frost: rubbed clear in b6, and frosted over again by night
    const frostPane = nv < WINDOW ? 1 : nv === WINDOW ? 1 - st(0.12, 0.46) * 0.92 : place === 1 ? 0.08 : 0.6;

    return {
      bC, bH, bP, bE, cam, t, haze, dark, flash, night,
      town: place === 0 ? 1 : 0,
      hat, bundle, log1, log2, fireOpen, glow, stoolX,
      books, pack, plan, planLines, planLinesV, pencil, ruler,
      bas, apples, appleFlip, binHop,
      note, dreamIn, wash, wind, sparks, poems, tableOn, candle, doorOpen, lantern, frostPane,
      blanket: blanket ? P(blanket.x, blanket.y + 6, 1) : HIDE,
      windAt: cxS,
      rPath, rLove, rSeize, pageFlip: Q2[n] ? rPath : 0,
      q1: carry(cv, 15, n, 0, Q1[n], tr),
      q2: carry(cv, 16, n, 0, Q2[n], tr),
    };
  });

  const DC = useDerivedValue<Bundle>(() => SCENE.value.bC);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.bH);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.bP);
  const DE = useDerivedValue<Bundle>(() => SCENE.value.bE);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));
  const nightOn = useAnimatedStyle(() => ({ opacity: SCENE.value.night }));
  const tableSt = useAnimatedStyle(() => ({ opacity: SCENE.value.tableOn }));
  const tint = useAnimatedStyle(() => ({ opacity: 0.3 * SCENE.value.night }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the town (x 0–400) and the room (x 400–800) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="descartes1-town-far" />
        <LessonPicture name="descartes1-town-mid" />
        <Smoke S={SCENE} />
        <Banner S={SCENE} />
        <View style={styles.cannonShadow} />
        <Brazier S={SCENE} />
        {/* the room by day, and by night laid over it */}
        <LessonPicture name="descartes1-room" />
        <Animated.View style={[styles.world, nightOn]}>
          <LessonPicture name="descartes1-room-night" />
        </Animated.View>
        <Frost S={SCENE} />
        <Door S={SCENE} />
        <Animated.View style={[styles.world, tableSt]}>
          <View style={styles.tableShadow} />
          <View style={[styles.at, { left: TABLE_X, top: G }]}><LessonPicture name="descartes1-table" /></View>
        </Animated.View>
        <Stool S={SCENE} />
        <View style={styles.binShadow} />
        <Bin S={SCENE} />
        <View style={[styles.at, { left: PACK_X, top: G }]}><Pack S={SCENE} /></View>
        {/* by night the day-lit furniture and the door go into the room's dark */}
        <Animated.View style={[styles.nightTint, tint]} />
        <StoveFire S={SCENE} />
        <Candle S={SCENE} />
        <Poems S={SCENE} />
        <DreamTable S={SCENE} />
      </Animated.View>
      <Basket S={SCENE} />
      <Books S={SCENE} />
      <Plan S={SCENE} />
      <Prop S={SCENE} k="note"><View style={styles.notebook} /><View style={styles.notebookPage} /></Prop>
      {/* the hat lies on the table behind whoever stands in front of it */}
      <Hat S={SCENE} />
      {/* extra: sentry */}
      <Stickman D={DE} k={K} role="crowd" wear={[]} garb={SOLDIER.garb?.bands} />
      {/* cast: tophat */}
      <Stickman D={DH} k={K} role="second" wear={i >= ENTHUSE ? NIGHTCAP_HEAD : LANDLORD_HEAD} garb={LANDLORD_GARB} />
      <Prop S={SCENE} k="log1"><LessonPicture name="descartes1-log" /></Prop>
      <Prop S={SCENE} k="log2"><LessonPicture name="descartes1-log" /></Prop>
      <Prop S={SCENE} k="lantern"><LessonPicture name="descartes1-lantern" /></Prop>
      {/* cast: cap */}
      <Stickman D={DP} k={K} role="crowd" wear={SOLDIER_HEAD} garb={SOLDIER.garb?.bands} />
      <Prop S={SCENE} k="bundle"><LessonPicture name="descartes1-logs" /></Prop>
      <Apples S={SCENE} />
      {/* cast: plain */}
      <Stickman D={DC} k={K} role="lead" wear={i < SIT ? DESCARTES_HEAD : []} garb={DESCARTES.garb?.bands} />
      <Prop S={SCENE} k="blanket"><View style={styles.blanket} /><View style={styles.blanketFold} /></Prop>
      <Prop S={SCENE} k="pencil"><View style={styles.pencil} /><View style={styles.pencilTip} /></Prop>
      <Snow S={SCENE} />
      <Wash S={SCENE} />
      <Wind S={SCENE} />
      <Sparks S={SCENE} />
      {on(Q2) ? <Ribbons S={SCENE} /> : null}
      <Veil S={SCENE} k="haze" />
      <Veil S={SCENE} k="dark" />
      <Veil S={SCENE} k="flash" />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={BASKET_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={RIBBON_Q} k="q2" /> : null}
    </View>
  );
}

// ── generic things ───────────────────────────────────────────────────────────

type PropKey = 'note' | 'log1' | 'log2' | 'lantern' | 'bundle' | 'blanket' | 'pencil' | 'hat';
/** A thing placed, turned and scaled where the scene says this frame (screen x). */
function Prop({ S, k, children }: { S: SharedValue<any>; k: PropKey; children: React.ReactNode }) {
  const st = useAnimatedStyle(() => {
    const v = S.value[k];
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.r}deg` }, { scaleX: v.sx }, { scaleY: v.sy }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none">{children}</Animated.View>;
}

// ── the town ─────────────────────────────────────────────────────────────────

/** Woodsmoke from the inn's chimney, three puffs rising and spreading. */
function Smoke({ S }: { S: SharedValue<any> }) {
  return <>{[0, 1, 2].map((k) => <Puff key={k} S={S} k={k} />)}</>;
}
function Puff({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const ph = (S.value.t * 0.22 + k / 3) % 1;
    return {
      opacity: 0.75 * Math.sin(Math.PI * ph),
      transform: [{ translateX: CHIMNEY.x + 8 * ph + 4 * Math.sin(ph * 5 + k) }, { translateY: CHIMNEY.y - 6 - 46 * ph }, { scale: 0.7 + 1.4 * ph }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.smoke} /></Animated.View>;
}
/** The Bavarian banner on its pole, stirring in the wind. */
function Banner({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const w = Math.sin(S.value.t * 1.3) * 0.6 + Math.sin(S.value.t * 0.7 + 1) * 0.4;
    return { transform: [{ translateX: 86.3 }, { translateY: 381 }, { scaleX: 0.9 + 0.08 * w }, { skewY: `${3 * w}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="descartes1-banner" /></Animated.View>;
}
/** The sentry's brazier: an iron basket on legs, its coals flickering. */
function Brazier({ S }: { S: SharedValue<any> }) {
  return (
    <View style={[styles.at, { left: BRAZIER.x, top: BRAZIER.y }]} pointerEvents="none">
      <View style={styles.brazierLegs} />
      <View style={styles.brazierBowl} />
      {[-4, 0, 4].map((dx, k) => <Flame key={k} S={S} x={dx} y={-19} k={k} s={0.7} />)}
    </View>
  );
}
function Flame({ S, x, y, k, s }: { S: SharedValue<any>; x: number; y: number; k: number; s: number }) {
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const f = 0.8 + 0.2 * Math.sin(t * (7 + k) + k * 2) + 0.1 * Math.sin(t * 13 + k);
    return { transform: [{ translateX: x + Math.sin(t * 5 + k) }, { translateY: y }, { scaleY: f * s }, { scaleX: s }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.flame} />
      <View style={styles.flameCore} />
    </Animated.View>
  );
}
/** Snow falling over the town: each flake at its own speed and drift. */
const FLAKES = Array.from({ length: 26 }, (_, k) => {
  const r = (m: number) => { const s = Math.sin(k * 91.7 + m * 12.9) * 43758.5; return s - Math.floor(s); };
  return { x: r(1) * 400, ph: r(2), v: 18 + r(3) * 18, s: 1.2 + r(4) * 1.6 };
});
function Snow({ S }: { S: SharedValue<any> }) {
  return <>{FLAKES.map((f, k) => <Flake key={k} S={S} f={f} k={k} />)}</>;
}
function Flake({ S, f, k }: { S: SharedValue<any>; f: { x: number; ph: number; v: number; s: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const y = (f.ph * 300 + S.value.t * f.v) % 300;
    return {
      opacity: S.value.town,
      transform: [{ translateX: f.x + 7 * Math.sin(S.value.t * 0.8 + k) }, { translateY: 214 + y }, { scale: f.s }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.flake} /></Animated.View>;
}

// ── the room ─────────────────────────────────────────────────────────────────

/** The frost on the window: its edge always, its middle rubbed clear in b6. */
function Frost({ S }: { S: SharedValue<any> }) {
  const pane = useAnimatedStyle(() => ({ opacity: S.value.frostPane }));
  return (
    <>
      <LessonPicture name="descartes1-frost" />
      <Animated.View style={[styles.world, pane]}><LessonPicture name="descartes1-frost-pane" /></Animated.View>
    </>
  );
}
/** The plank door, swinging back on its hinge (left edge) on the vow. */
function Door({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: DOOR_X }, { translateY: DOOR_TOP }, { scaleX: 1 - 0.78 * S.value.doorOpen }] }));
  return <Animated.View nativeID="d1-door" style={[styles.rider, st, { transformOrigin: '0% 0%' }]} pointerEvents="none"><LessonPicture name="descartes1-door" /></Animated.View>;
}
/** The stove: the fire door opened on its fire, flames moving in it, the glow on the tiles. */
function StoveFire({ S }: { S: SharedValue<any> }) {
  const open = useAnimatedStyle(() => ({ opacity: S.value.fireOpen }));
  const glow = useAnimatedStyle(() => ({ opacity: 0.2 * S.value.glow * (1 - 0.4 * S.value.night) }));
  return (
    <>
      <Animated.View style={[styles.glowTiles, glow]} pointerEvents="none" />
      <Animated.View style={[styles.world, open]} pointerEvents="none">
        <LessonPicture name="descartes1-stove-open" />
        {[-6, 0, 6].map((dx, k) => <Flame key={k} S={S} x={FIRE.x + dx} y={471} k={k} s={0.75} />)}
      </Animated.View>
    </>
  );
}
function Stool({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.tableOn, transform: [{ translateX: S.value.stoolX }, { translateY: G }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="descartes1-stool" /></Animated.View>;
}
function Bin({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: BIN_X + 0.8 * Math.sin(S.value.binHop * 3) }, { translateY: G - S.value.binHop }] }));
  return <Animated.View nativeID="d1-bin" style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="descartes1-bin" /></Animated.View>;
}
function Pack({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.pack }));
  return <Animated.View style={[styles.rider, st]}><LessonPicture name="descartes1-pack" /></Animated.View>;
}
function Candle({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.candle, transform: [{ translateX: CANDLE_X }, { translateY: TOP }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="descartes1-candle" />
      <Flame S={S} x={0} y={-19} k={4} s={0.5} />
    </Animated.View>
  );
}
function Poems({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.poems, transform: [{ translateX: POEMS_X }, { translateY: TOP }] }));
  return (
    <Animated.View nativeID="d1-poems" style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.poemsBook} />
      <View style={styles.poemsBand} />
    </Animated.View>
  );
}
/** The third dream's table: the dictionary and the book of poems open on it. */
function DreamTable({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.dreamIn, transform: [{ translateX: TABLE_X }, { translateY: G - 2 * Math.sin(S.value.t * 1.1) }] }));
  const page = useAnimatedStyle(() => ({
    opacity: S.value.pageFlip > 0.05 && S.value.pageFlip < 0.95 ? 1 : 0,
    transform: [{ translateX: -12 }, { translateY: -40 }, { scaleX: Math.cos(Math.PI * S.value.pageFlip) }],
  }));
  return (
    <Animated.View nativeID="d1-dream-table" style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="descartes1-dream-table" />
      <Animated.View style={[styles.rider, page]}><View style={styles.leaf} /></Animated.View>
    </Animated.View>
  );
}
function Basket({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.bas;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.r}deg` }] };
  });
  return <Animated.View nativeID="d1-basket" style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="descartes1-basket" /></Animated.View>;
}
function Apples({ S }: { S: SharedValue<any> }) {
  return <>{[0, 1, 2, 3, 4, 5, 6].map((k) => <Apple key={k} S={S} k={k} />)}</>;
}
/** An apple: red, a stalk; k 0 with its soft brown patch, k 3 with a hidden one (the wrong pick). */
function Apple({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.apples[k];
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { scaleX: v.sx }] };
  });
  const hidden = useAnimatedStyle(() => ({ opacity: k === 3 ? S.value.appleFlip : 0 }));
  return (
    <Animated.View nativeID={k === 3 ? 'd1-held-apple' : undefined} style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.apple} />
      <View style={styles.appleLit} />
      {k === 0 ? <View style={styles.appleBad} /> : null}
      <Animated.View style={[styles.appleBad, hidden]} />
      <View style={styles.appleStalk} />
    </Animated.View>
  );
}
function Books({ S }: { S: SharedValue<any> }) {
  return <>{[0, 1, 2].map((k) => <Book key={k} S={S} k={k} />)}</>;
}
function Book({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.books[k];
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.r}deg` }] };
  });
  const cover = useAnimatedStyle(() => ({ transform: [{ scaleY: S.value.books[k].sy }] }));
  const tone = k === 0 ? styles.bookA : k === 1 ? styles.bookB : styles.bookC;
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.bookBlock, tone]} />
      <View style={styles.bookPages} />
      <Animated.View style={[styles.bookCover, tone, cover]} />
    </Animated.View>
  );
}
/** The town plan: a sheet with straight streets ruled across it, lying flat or held up. */
function Plan({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.plan;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { scaleX: v.sx }, { scaleY: v.sy }] };
  });
  const hl = useAnimatedStyle(() => ({ opacity: S.value.planLines, transform: [{ scaleX: Math.max(0.02, S.value.planLines) }] }));
  const vl = useAnimatedStyle(() => ({ opacity: S.value.planLinesV, transform: [{ scaleY: Math.max(0.02, S.value.planLinesV) }] }));
  const ru = useAnimatedStyle(() => ({ opacity: S.value.ruler }));
  return (
    <Animated.View nativeID="d1-plan" style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.planSheet} />
      <Animated.View style={[styles.rider, hl]}>
        {[-8, 0, 8].map((y) => <View key={y} style={[styles.planH, { top: y - 0.6 }]} />)}
      </Animated.View>
      <Animated.View style={[styles.rider, vl]}>
        {[-13, -4, 5, 14].map((x) => <View key={x} style={[styles.planV, { left: x - 0.6 }]} />)}
      </Animated.View>
      <Animated.View style={[styles.ruler, ru]} />
    </Animated.View>
  );
}
/** His plumed hat, drawn piece for piece as Stickman draws it on his head. */
function Hat({ S }: { S: SharedValue<any> }) {
  const e = GARB_LINE * 0.75 * K;
  return (
    <Prop S={S} k="hat">
      {DESCARTES_HEAD.map((p, j) => {
        const w = p.w * K;
        const h = p.h * K;
        return (
          <View
            key={j}
            style={{
              position: 'absolute', left: p.x * K - w / 2 - e, top: p.y * K - h / 2 - e, width: w + 2 * e, height: h + 2 * e,
              borderRadius: (p.r ?? 0) * K + e, borderWidth: e, borderColor: INK, backgroundColor: p.fill,
              transform: [{ rotate: `${p.rot ?? 0}deg` }],
            }}
          />
        );
      })}
    </Prop>
  );
}

// ── the dreams ───────────────────────────────────────────────────────────────

function Wash({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.34 * S.value.wash }));
  return <Animated.View style={[styles.wash, st]} pointerEvents="none" />;
}
/** The whirlwind: arcs wheeling round him. */
const ARCS = [[26, 0, 1.6], [38, 1.2, -1.3], [50, 2.4, 1.1], [62, 0.6, -0.9], [34, 3.3, 1.9], [72, 4.1, 0.8]] as const;
function Wind({ S }: { S: SharedValue<any> }) {
  return <>{ARCS.map(([r, ph, v], k) => <Arc key={k} S={S} r={r} ph={ph} v={v} />)}</>;
}
function Arc({ S, r, ph, v }: { S: SharedValue<any>; r: number; ph: number; v: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.wind,
    transform: [{ translateX: S.value.windAt }, { translateY: 444 }, { scaleY: 0.62 }, { rotate: `${(S.value.t * v * 140 + ph * 57) % 360}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.arc, { left: -r, top: -r, width: 2 * r, height: 2 * r, borderRadius: r }]} />
    </Animated.View>
  );
}
/** The sparks out of the stove after the bang: each on its own arc, falling. */
const SPARKS = Array.from({ length: 16 }, (_, k) => {
  const r = (m: number) => { const s = Math.sin(k * 37.3 + m * 7.7) * 43758.5; return s - Math.floor(s); };
  return { a: Math.PI * (0.95 + r(1) * 1.0), v: 70 + r(2) * 140, d: r(3) * 0.25 };
});
function Sparks({ S }: { S: SharedValue<any> }) {
  return <>{SPARKS.map((s, k) => <Spark key={k} S={S} s={s} />)}</>;
}
function Spark({ S, s }: { S: SharedValue<any>; s: { a: number; v: number; d: number } }) {
  const st = useAnimatedStyle(() => {
    const f = clamp01((S.value.sparks - s.d) / 0.75);
    const x = FIRE.x - HX + Math.cos(s.a) * s.v * f;
    const y = FIRE.y + Math.sin(s.a) * s.v * 0.55 * f + 60 * f * f;
    return { opacity: f > 0 && f < 1 ? 1 - f * 0.6 : 0, transform: [{ translateX: x }, { translateY: y }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.spark} /></Animated.View>;
}

// ── the veils ────────────────────────────────────────────────────────────────

function Veil({ S, k }: { S: SharedValue<any>; k: 'haze' | 'dark' | 'flash' }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return <Animated.View style={[k === 'haze' ? styles.haze : k === 'dark' ? styles.dark : styles.flashV, st]} pointerEvents="none" />;
}

// ── the two games ────────────────────────────────────────────────────────────

/** The three paper ribbons out of the book of poems (screen x). */
const RIBBONS = [
  { id: 'seize', text: 'Seize the day.', x: 176, y: 330, w: 84, code: 'rSeize' },
  { id: 'path', text: 'Which path in life shall I follow?', x: 176, y: 364, w: 172, code: 'rPath' },
  { id: 'love', text: 'Love conquers all.', x: 176, y: 398, w: 108, code: 'rLove' },
] as const;
const ROOT = { x: TABLE_X - HX - 12, y: 424 };
function Ribbons({ S }: { S: SharedValue<any> }) {
  return <>{RIBBONS.map((r) => <Ribbon key={r.id} S={S} r={r} />)}</>;
}
/**
 * One paper ribbon on its streamer from the book. PICKED RIGHT: it lifts and draws taut
 * and the book's leaf turns over; PICKED WRONG: it tears loose, turns and drops to the floor.
 */
function Ribbon({ S, r }: { S: SharedValue<any>; r: (typeof RIBBONS)[number] }) {
  const tag = useAnimatedStyle(() => {
    const v = S.value;
    const f = v[r.code] as number;
    const ok = r.id === 'path';
    const flutter = 1.5 * Math.sin(v.t * 2.4 + r.y);
    const fall = ok ? 0 : f;
    return {
      opacity: v.q2 * (1 - 0.75 * fall),
      transform: [
        { translateX: r.x + 18 * fall }, { translateY: r.y + flutter - (ok ? 8 * Math.sin(Math.PI * Math.min(1, f * 1.3)) + 4 * f : 0) + 36 * fall * fall },
        { rotate: `${(ok ? 0 : 28 * fall) + 1.2 * Math.sin(v.t * 1.7 + r.y)}deg` }, { scale: ok ? 1 + 0.06 * f : 1 },
      ],
    };
  });
  const streamer = useAnimatedStyle(() => {
    const v = S.value;
    const f = v[r.code] as number;
    const ex = r.x + 4;
    const ey = r.y + 16 + 1.5 * Math.sin(v.t * 2.4 + r.y);
    const dx = ex - ROOT.x;
    const dy = ey - ROOT.y;
    const len = Math.hypot(dx, dy);
    return {
      opacity: v.q2 * (r.id === 'path' ? 1 : 1 - f),
      transform: [{ translateX: (ROOT.x + ex) / 2 }, { translateY: (ROOT.y + ey) / 2 }, { rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` }, { scaleX: len / 20 }],
    };
  });
  return (
    <>
      <Animated.View style={[styles.rider, streamer]} pointerEvents="none"><View style={styles.streamer} /></Animated.View>
      <Animated.View nativeID={`d1-ribbon-${r.id}`} style={[styles.rider, tag]} pointerEvents="none">
        <View style={[styles.tag, { width: r.w }]}>
          <Text style={[styles.tagText, { width: r.w - 6 }]}>{r.text}</Text>
        </View>
      </Animated.View>
    </>
  );
}

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/**
 * TIP THE BASKET: the basket on the table, the apple in his raised hand, the wood bin by
 * the stove. Each box reaches up over its thing, so the verdict seal (struck at the box's
 * top-right) lands in the air above it, never on the picked object.
 */
const BASKET_Q: Q[] = [
  { id: 'basket', left: BASKET_X - HX - 18, top: 398, w: 36, h: 68, r: 5, correct: true },
  { id: 'hand', left: 172, top: 404, w: 22, h: 52, r: 5, correct: false },
  { id: 'bin', left: BIN_X - HX - 17, top: 436, w: 34, h: 64, r: 5, correct: false },
];
/** OPEN THE BOOK: the ribbon he reads; each box runs past its ribbon's end, so the seal is in the air. */
const RIBBON_Q: Q[] = [RIBBONS[1], RIBBONS[2], RIBBONS[0]].map((r) => ({ id: r.id, left: r.x - 2, top: r.y - 2, w: r.w + 30, h: 22, r: 4, correct: r.id === 'path' }));
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} nativeID={`d1-q-${q.id}`} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
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
  at: { position: 'absolute', width: 0, height: 0 },
  haze: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.descartes1Snow.base },
  dark: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.descartes1Night.base },
  flashV: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.descartes1Flash.base },
  wash: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.descartes1Dream.base },
  flake: { position: 'absolute', left: -1, top: -1, width: 2, height: 2, borderRadius: 1, backgroundColor: W.descartes1Snow.base },
  smoke: { position: 'absolute', left: -5, top: -4, width: 10, height: 8, borderRadius: 4, backgroundColor: W.descartes1Smoke.base },
  brazierLegs: { position: 'absolute', left: -7, top: -14, width: 14, height: 14, borderLeftWidth: 1.6, borderRightWidth: 1.6, borderColor: W.descartes1Iron.base },
  brazierBowl: { position: 'absolute', left: -9, top: -20, width: 18, height: 7, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: W.descartes1Iron.base, borderWidth: 0.6, borderColor: INK },
  flame: {
    position: 'absolute', left: -4, top: -14, width: 8, height: 14, borderTopLeftRadius: 4, borderTopRightRadius: 4,
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4, backgroundColor: W.descartes1Flame.base,
  },
  flameCore: { position: 'absolute', left: -2, top: -8, width: 4, height: 8, borderRadius: 2, backgroundColor: W.descartes1FlameCore.base },
  glowTiles: { position: 'absolute', left: HX + 322, top: 440, width: 72, height: 46, backgroundColor: W.descartes1Flame.base },
  notebook: { position: 'absolute', left: -6, top: -4, width: 12, height: 8, borderRadius: 1, backgroundColor: W.descartes1Leather.base, borderWidth: 0.6, borderColor: INK },
  notebookPage: { position: 'absolute', left: -4.5, top: -2.6, width: 9, height: 2, backgroundColor: W.descartes1Paper.base },
  blanket: { position: 'absolute', left: -14, top: -8, width: 28, height: 20, borderRadius: 4, backgroundColor: W.descartes1Blanket.base, borderWidth: 0.8, borderColor: INK },
  blanketFold: { position: 'absolute', left: -13, top: -6, width: 26, height: 3, borderRadius: 1.5, backgroundColor: W.descartes1Blanket.shade },
  pencil: { position: 'absolute', left: -1, top: -10, width: 2, height: 11, borderRadius: 1, backgroundColor: W.descartes1Pencil.base, borderWidth: 0.4, borderColor: INK },
  pencilTip: { position: 'absolute', left: -0.6, top: 0, width: 1.2, height: 2, backgroundColor: INK },
  poemsBook: { position: 'absolute', left: -9, top: -5, width: 18, height: 5, borderRadius: 1, backgroundColor: W.descartes1Poems.base, borderWidth: 0.7, borderColor: INK },
  poemsBand: { position: 'absolute', left: -9, top: -2.2, width: 18, height: 1.2, backgroundColor: W.descartes1Paper.base },
  leaf: { position: 'absolute', left: 0, top: -2, width: 11, height: 4, backgroundColor: W.descartes1Paper.base, borderWidth: 0.5, borderColor: INK },
  apple: { position: 'absolute', left: -APPLE_R, top: -APPLE_R, width: 2 * APPLE_R, height: 2 * APPLE_R, borderRadius: APPLE_R, backgroundColor: W.descartes1Apple.base, borderWidth: 0.6, borderColor: INK },
  appleLit: { position: 'absolute', left: -2, top: -2.4, width: 1.6, height: 1.6, borderRadius: 0.8, backgroundColor: W.descartes1AppleLit.base },
  appleBad: { position: 'absolute', left: -0.6, top: -1.6, width: 3.6, height: 3, borderRadius: 1.5, backgroundColor: W.descartes1Rot.base },
  appleStalk: { position: 'absolute', left: -0.4, top: -APPLE_R - 1.8, width: 0.9, height: 2.2, backgroundColor: W.descartes1Pencil.shade },
  bookBlock: { position: 'absolute', left: -12, top: -2.5, width: 24, height: 5, borderRadius: 0.8, borderWidth: 0.6, borderColor: INK },
  bookA: { backgroundColor: W.descartes1BookA.base },
  bookB: { backgroundColor: W.descartes1BookB.base },
  bookC: { backgroundColor: W.descartes1BookC.base },
  bookPages: { position: 'absolute', left: -11, top: -1.4, width: 21, height: 2.6, backgroundColor: W.descartes1Paper.base },
  bookCover: { position: 'absolute', left: -12, top: -2.8, width: 24, height: 1.6, borderRadius: 0.6, borderWidth: 0.5, borderColor: INK },
  planSheet: { position: 'absolute', left: -22, top: -15, width: 44, height: 30, borderRadius: 1, backgroundColor: W.descartes1Paper.base, borderWidth: 0.8, borderColor: INK },
  planH: { position: 'absolute', left: -19, width: 38, height: 1.2, backgroundColor: W.descartes1Ink.base },
  planV: { position: 'absolute', top: -12, width: 1.2, height: 24, backgroundColor: W.descartes1Ink.base },
  ruler: { position: 'absolute', left: -20, top: 9, width: 40, height: 3, backgroundColor: W.descartes1Rule.base, borderWidth: 0.4, borderColor: INK },
  arc: { position: 'absolute', borderTopWidth: 2, borderRightWidth: 2, borderColor: W.descartes1Wind.base },
  spark: { position: 'absolute', left: -1.6, top: -1.6, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: W.descartes1Flame.base },
  streamer: { position: 'absolute', left: -10, top: -1, width: 20, height: 2, backgroundColor: W.descartes1Paper.shade },
  tag: {
    position: 'absolute', left: 0, top: 0, height: 18, borderRadius: 2, backgroundColor: W.descartes1Paper.base,
    borderWidth: 1, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center' },
  clear: { flexGrow: 1 },
  nightTint: { position: 'absolute', left: HX, top: 214, width: 400, height: 300, backgroundColor: W.descartes1Night.base },
  tableShadow: { position: 'absolute', left: TABLE_X - 56, top: G - 2, width: 112, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  binShadow: { position: 'absolute', left: BIN_X - 17, top: G - 2, width: 34, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  cannonShadow: { position: 'absolute', left: 104, top: G - 3, width: 66, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.3 },
});

// OWN CAMERA: targets checked in shot 2026-10-09 — TIP THE BASKET (the basket on the table, the apple held up,
// the wood bin by the stove) and OPEN THE BOOK (the three paper ribbons over the dream table) read whole,
// answered right and wrong, on the descartes1-right / descartes1-wrong sheets.
export function Descartes1Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson} beats={BEATS} Scene={Descartes1Scene} band={[214, 514]}
      roles={{
        plain: { head: DESCARTES_HEAD, label: 'Descartes' },
        tophat: { head: LANDLORD_HEAD, label: 'The landlord' },
        cap: { head: SOLDIER_HEAD, label: 'A fellow soldier' },
      }}
    />
  );
}
