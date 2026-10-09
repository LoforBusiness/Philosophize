import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './amazon1Script';
import {
  U, WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs, seated,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { UNIT2_OUTFITS } from './garb';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// business-amazon-1, "Cadabra in the Garage" — the first lesson of Business's second unit
// (LESSON_RULES group AW): the start of Amazon, told in costume. THE PLAIN ONE IS JEFF
// BEZOS (blue oxford shirt, khakis); the top hat plays DAVID SHAW, his boss (navy suit, red
// tie), the bun MACKENZIE BEZOS (green sweater, jeans), the cap SHEL KAPHAN, the first
// employee (red t-shirt, jeans, a backpack).
//
// A DIALOGUE lesson (group AP): people talk and nobody narrates. No silent extras: the life
// round them is the city's lights and a plane crossing, the prairie going by, the rain.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// amazon1.mjs), each laid at x 0–400 and shown one at a time, cut under a quick dark. The
// scene's OWN CAMERA is one transform over the pictures and the people together, `cam`
// (scale and centre): it pushes in and pulls back, clamped so it never shows past the band.
//
//   OFFICE (b0–b8), D. E. Shaw, Midtown, a night in 1994. Far: the sky, the Empire State
//   Building (132) and the Chrysler crown (262) among lit towers. Mid: the frosted partition
//   with its glass DOOR (x 6–58, a rider that swings), the window wall (62–328), the walnut
//   wall with the clock (ten to eleven) and the CORK BOARD (336–398 × 392–440, the typed list
//   of twenty pinned on its right half), the carpet. Near: the DESK (150–318, top 466, hip
//   high) with the banker's lamp (164), a pen cup, the beige CRT (258–290), the dot-matrix
//   PRINTER (293–318) and its fan-fold pile on the floor; the empty BOOKCASE (340–404, top
//   466; rows stand on 484 and 500). On the desk the three things of Q1: the SOFTWARE box
//   (186), the CD (214) and the BOOK (242). The cardboard BOX of his things is on the floor
//   at 196.
//   ROAD (b9–b14), the interstate across the prairie at dusk, July 1994. Far: the dusk, the
//   sun low ahead, the buttes; the poles and the fence go by (a strip, 40 units a second),
//   the centre dashes faster. The BLAZER faces right (into the west): its inside (seat,
//   wheel, dash, the boxes in the back), then the two of them, then its near flank with the
//   windows open (door window 128–252), the wheels turning. MacKenzie drives (162); Bezos
//   sits turned toward her (236) with the laptop on his knees. Ahead, once the city is
//   Seattle, the Cascades and Mount Rainier rise over the Sound.
//   ATLAS (b11, Q2): the close-up of the road atlas on the dash, the road through the
//   windscreen; the three pins.
//   GARAGE (b15–b22), Bellevue, autumn. Far: taped drywall, the closed sectional garage door
//   (124–290) with an orange maple in its windows, the BACK DOOR (62–102, a rider Kaphan
//   comes in by), a shelf and a pegboard. Mid: the pot-bellied STOVE (29) and its flue, the
//   SAWHORSES (150, 242; top 462), the STACK of doors (300–340; the front one is a rider),
//   the STEPLADDER (362), the extension cords. The DOOR DESK lies across the sawhorses
//   (126–266, top 464); the CADABRA sign hangs at 331–393 × 352–372.
//
//   b0   (the slow open, 6 s) the printer chatters (paper 0.8s); he tears the printout off
//        (tear 2.2s), holds it up to look (paper 3.6s), circles the line with a pencil
//        (pencil 5.0s); the camera pulls back off him to the whole office; his line, grinning.
//   b1   the glass door swings (door 0.2s); Shaw steps in, his coat over his arm, and walks
//        to the desk's end; Bezos holds the printout out to him.
//   b2   Bezos turns, pins the printout on the cork board (pin 0.4s), taps it with the pencil
//        (pencil 1.6s); Shaw lays his coat over the desk's corner; Bezos runs the pencil down
//        the list, line by line, and turns back.
//   b3   Shaw folds his arms and nods at the three things on the desk.
//   b4   Q1 STOCK THE SHELF.
//   b5   Bezos crosses to the desk, picks up the book (book 2.4s), holds it high and sweeps
//        his other hand at the window, while the shelf fills and fills past the frame.
//   b6   Shaw sits on the desk's corner and taps the book Bezos holds out, twice.
//   b7   Bezos sets the book down and plays himself at eighty: bent, a hand on his knee;
//        then straight again, a fist to his chest.
//   b8   Shaw gets up, crosses to the door, swings it open and points through it; Bezos
//        picks up his box (crate 1.0s) and walks out past him.
//   b9   the cut to the road: MacKenzie at the wheel pats it, then glances at him.
//   b10  Bezos turns to the dash and taps the atlas twice without looking up (paper 0.5s),
//        then turns back to her, pleased with himself.
//   b11  Q2 PIN THE MAP (the atlas close-up).
//   b12  Bezos takes the atlas up (paper 0.4s), folds it to Seattle and points ahead; the
//        mountains rise; he turns back to her.
//   b13  she glances at the laptop; he types; the spreadsheet fills.
//   b14  he pats the laptop twice, chin up.
//   b15  the cut to the garage: the back door opens (door 0.2s); Kaphan steps in and waves;
//        MacKenzie on the ladder's step letters the sign; Bezos welcomes him.
//   b16  Bezos lifts the front door off the stack (plank 1.3s), turns, carries it across and
//        lays it on the sawhorses (thud 4.0s).
//   b17  Kaphan holds the far end; Bezos crouches at the near corner and drills a leg on
//        (creak 0.8s, plank 2.4s).
//   b18  MacKenzie climbs the ladder and hangs the sign (pin 1.7s), then looks down at him.
//   b19  she comes down; Bezos throws his arms up under it; a book appears in his hand.
//   b20  Kaphan crosses, takes Bezos's raised arm gently down and points at the sign.
//   b21  night: the desk finished, the workstation on it, the stove alight, under the quote.
//
// Every figure has its own phase (N22), faces whom he talks to, never walks backwards
// (C18), and every hand that moves tears, holds, pins, taps, folds, carries, drills or
// points. Furniture stands at hip height or below.
// ─────────────────────────────────────────────────────────────────────────────

const W = NATURAL;
const { SHADE } = stageTone('business');
const TR = 0.85;
const K = K_FIG * 0.95;
/** The hand paths are laid out for a figure 0.85 high; they grow with him. */
const KS = K / 0.85;
const G = GROUND;

/**
 * Seconds each beat's action is paced over (lib/narration/manifest.ts); b0, b1 and b15 are the
 * wait (`voiceAfter`: 6.0, 1.9, 1.9 s — the door is heard before the line, not under it) and the line together.
 */
const LINES = [10.69, 5.86, 6.43, 4.25, 0, 5.48, 5.23, 4.34, 4.69, 3.96, 6.13, 0, 4.9, 5.9, 5.92, 6.77, 4.6, 3.25, 3.05, 5.56, 4.36, 0, 0];

const TALK = 167;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const CHART = at('chart');
const BOSS = at('boss');
const LIST = at('list');
const PICK = at('pick');
const BOOKS = at('books');
const WARN = at('warn');
const REGRET = at('regret');
const LEAVE = at('leave');
const DRIVE = at('drive');
const PLAN = at('plan');
const SEATTLE = at('seattle');
const TYPING = at('typing');
const DRAFT = at('draft');
const ARRIVE = at('arrive');
const DOORS = at('doors');
const DRILL = at('drill');
const NAME = at('name');
const CADABRA = at('cadabra');
const CADAVER = at('cadaver');
const REST = at('rest');
const Q1 = BEATS.map((b) => (b.shelf ? 1 : 0));
const Q2 = BEATS.map((b) => (b.map ? 1 : 0));
const Q1N = Q1.indexOf(1);
const Q2N = Q2.indexOf(1);
/** Where each beat is: 0 the office, 1 the road, 2 the garage, 3 the atlas close-up. */
const PLACE = BEATS.map((b) => (b.map ? 3 : b.place ?? 0));
/** Who speaks each beat, as a number the worklet can read: 1 Bezos, 2 Shaw, 3 MacKenzie, 4 Kaphan. */
const SPK = BEATS.map((b) => (b.speaker === 'plain' ? 1 : b.speaker === 'tophat' ? 2 : b.speaker === 'bun' ? 3 : b.speaker === 'cap' ? 4 : 0));
/** The beats that open on a cut: a new place, into the atlas and out again, the night. */
const CUTS = BEATS.map((_, n) => (n === DRIVE || n === Q2N || n === SEATTLE || n === ARRIVE || n === REST ? 1 : 0));

/** Seconds into a cut at which the picture is swapped, under the dark. */
const CUT_S = 0.4;

// ── the office ──────────────────────────────────────────────────────────────
const DESK_TOP = 466;
const ITEMS = [
  { id: 'software', x: 186, pic: 'amazon1-softbox' },
  { id: 'music', x: 214, pic: 'amazon1-cd' },
  { id: 'books', x: 242, pic: 'amazon1-book' },
] as const;
const BOOK_REST = 200;
const SHELF = { x: 344, top: 484, low: 500 };
const BOARD = { x: 356, y: 414 };
const BOX_AT = 196;
const DOOR = { x: 6, y: 238 };
// ── the road ────────────────────────────────────────────────────────────────
const CAR_FLOOR = 476;
const MAC_X = 162;
const BEZ_CAR_X = 236;
const ATLAS_DASH = { x: 248, y: 424 };
const SEAT_CAR = 18;
// ── the atlas close-up: the pins (scripts/lib/lessonart/lessons/amazon1.mjs MAP_PINS) ──
const MX = (x: number) => 66 + (x - 10) * 0.29;
const MY = (y: number) => 341 + (y - 5) * 0.29;
const PINS = [
  { id: 'seattle', x: MX(72), y: MY(40) },
  { id: 'sf', x: MX(28), y: MY(240) },
  { id: 'boulder', x: MX(305), y: MY(245) },
] as const;
const HERE = { x: MX(290), y: MY(160) };
// ── the garage ──────────────────────────────────────────────────────────────
const STEPS = [{ x: 344, g: 484 }, { x: 349, g: 468 }, { x: 354, g: 452 }];
const SIGN = { x: 362, y: 362 };
const DESK2 = { x: 196, y: 474 };
const STACK_DOOR = { x: 324, y: 420 };
const STOVE = { x: 29, y: 420 };

/** Shaw and Kaphan are dressed in role and wear nothing on the head (AW3). */
const SHAW_HEAD = UNIT2_OUTFITS.bossSuit.head;
const KAPHAN_HEAD = UNIT2_OUTFITS.tshirt.head;

/** The reader's pick, as a number the worklet can read. */
const PICKN: Record<string, number> = { software: 1, music: 2, books: 3, seattle: 4, sf: 5, boulder: 6 };

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
function jointOf(w: Bundle, k: 'wrR' | 'wrL' | 'kneeL' | 'kneeR' | 'shB') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/** A seated figure on a seat `h` rig units high, still (no clock), feet out by `reach`. */
function seatOf(h: number, reach: number): Stance {
  'worklet';
  return seated(h, 0, reach);
}
/** Standing ↔ seated, rising and sitting the way a body does (hands to the knees). */
function seatMix(s: Stance, seat: Stance, w: number): Stance {
  'worklet';
  if (w <= 0.001) return s;
  const rise = Math.sin(Math.PI * w);
  const r = leanOf(mixStance(s, seat, w), 0.36 * rise, 0.1 * rise);
  if (rise <= 0.001) return r;
  return {
    ...r,
    fistL: { x: lerp(r.fistL.x, 13, 0.7 * rise), y: lerp(r.fistL.y, 2, 0.7 * rise) },
    fistR: { x: lerp(r.fistR.x, 16, 0.7 * rise), y: lerp(r.fistR.y, 3, 0.7 * rise) },
  };
}
/** A crouch (posture 0) mixed in by `w`, the hands left where the keys put them. */
function crouchMix(s: Stance, w: number, t: number, phase: number): Stance {
  'worklet';
  if (w <= 0.001) return s;
  const c = postureStill(0, t, phase);
  return { ...mixStance(s, c, w), fistL: s.fistL, fistR: s.fistR };
}
/** Bent like an old man: the back over, the knees a little gone (posture 7, part way). */
function oldMan(s: Stance, w: number, t: number, phase: number): Stance {
  'worklet';
  if (w <= 0.001) return s;
  const c = postureStill(7, t, phase);
  return { ...mixStance(s, c, 0.75 * w), fistL: s.fistL, fistR: s.fistR };
}
/** A step up or down onto a tread: the knee lifts as the foot goes. */
function stepLift(s: Stance, f: number): Stance {
  'worklet';
  if (f <= 0.001 || f >= 0.999) return s;
  const lift = Math.sin(Math.PI * f);
  return { ...s, footL: { x: s.footL.x + 5 * lift, y: s.footL.y - 9 * lift }, tilt: s.tilt - 0.08 * lift };
}

/** Where the camera looks, clamped so it never shows past the band (centre in stage units). */
function camClamp(s: number, cx: number, cy: number) {
  'worklet';
  const hx = 200 / s;
  const hy = 150 / s;
  return { s, cx: Math.min(400 - hx, Math.max(hx, cx)), cy: Math.min(514 - hy, Math.max(214 + hy, cy)) };
}
/** The shot each beat ends on: [scale, centre x, centre y]. */
const SHOTS: readonly (readonly number[])[] = BEATS.map((_, n) => {
  if (n === Q1N) return [1.5, 236, 414];
  if (n === WARN || n === REGRET) return [1.15, 220, 384];
  if (n === DRIVE || n === PLAN || n === TYPING || n === DRAFT) return [1.4, 210, 407];
  if (n === SEATTLE) return [1.2, 233, 389];
  if (n === DRILL) return [1.2, 196, 389];
  if (n === CADABRA || n === CADAVER) return [1.15, 226, 384];
  return [1, 200, 364];
});

export default function Amazon1Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldS = useHeld();
  const heldM = useHeld();
  const heldK = useHeld();
  const cv = useCarry(25);
  const on = useLinger(i);
  const pk = useSharedValue(0);
  useEffect(() => {
    pk.value = picked ? (PICKN[picked] ?? 0) : 0;
  }, [picked, pk]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const b0 = bt.value;
    const t = clock.value;
    // a step BACK snaps everyone to where the beat starts, under a quick dark
    const seenN = carrySource(cv, 0, n, n - 1);
    carry(cv, 0, n, n, n, 1);
    const back = seenN > n;
    const cutBeat = CUTS[n] === 1;
    // before the cut, the old picture holds as the last beat left it
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
    /** Seconds, not shares: a stage between two moments of the line. */
    const ss = (a: number, z: number) => {
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
    // the dark under every cut, and a quick one on a step back
    const cut = cutBeat && !back ? stage(b0, 1, 0.04, CUT_S) * (1 - stage(b0, 1, CUT_S, CUT_S + 0.5)) : 0;
    const backVeil = back ? 1 - stage(b0, 1, 0, 0.45) : 0;
    const dark = Math.max(cut, backVeil);
    // a fresh start (after a cut, or a step back, or when what is on screen is still another
    // place because a cut was tapped through before it swapped) begins from the beat's own
    // start; otherwise from what is on screen
    const lastPlace = carrySource(cv, 24, n, place);
    carry(cv, 24, n, place, place, 1);
    const fresh = back || (cutBeat && !pre) || lastPlace !== place;
    const sp = (who: number) => {
      'worklet';
      return SPK[nv] === who;
    };

    // ══ THE CAMERA ═══════════════════════════════════════════════════════════
    let shot = camClamp(SHOTS[nv][0], SHOTS[nv][1], SHOTS[nv][2]);
    if (nv === CHART) {
      // the slow open: the whole office and the city at night, then in on him at the printer
      const o = ss(0.4, 3.4);
      shot = camClamp(lerp(1, 1.55, o), lerp(200, 271, o), lerp(364, 417, o));
    }
    if (nv === DRIVE) {
      // the road wide, then in to the two of them
      const o = ss(0.6, 2.6);
      shot = camClamp(lerp(1, 1.4, o), lerp(200, 210, o), lerp(364, 407, o));
    }
    const camFresh = fresh || nv === CHART || nv === DRIVE;
    const cs = carry(cv, 21, n, shot.s, shot.s, camFresh ? 1 : tr);
    const ccx = carry(cv, 22, n, shot.cx, shot.cx, camFresh ? 1 : tr);
    const ccy = carry(cv, 23, n, shot.cy, shot.cy, camFresh ? 1 : tr);

    // ══ BEZOS ════════════════════════════════════════════════════════════════
    // the office (b0–b8), the car (b9–b14), the garage (b15–b21)
    const B_X = [326, 326, 326, 326, 326, 326, 256, 230, 230, BEZ_CAR_X, BEZ_CAR_X, BEZ_CAR_X, BEZ_CAR_X, BEZ_CAR_X, BEZ_CAR_X,
      220, 220, 210, 272, 272, 300, 226, 226];
    const B_D = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1];
    const bxs = fresh ? B_X[nv] : carrySource(cv, 1, n, B_X[nv]);
    const bds = fresh ? B_D[nv] : carrySource(cv, 2, n, B_D[nv]);
    let bw: Walk = STILL;
    let bx = bxs;
    let bg = place === 1 ? CAR_FLOOR : G;
    let bTurns: (readonly number[])[] = [[0, B_D[nv]]];
    let bTurnWalk = true;
    let bo = place === 3 ? 0 : 1;
    let bR: readonly Key[] | null = null;
    let bL: readonly Key[] | null = null;
    let bLean = 0;
    let bNeck = 0;
    let bCrouch = 0;
    let bOld = 0;
    const bSeat = place === 1;
    // the pencil, from b0 at 5.0s to the end of b2
    const pencil = nv === CHART ? ss(4.74, 4.84) : nv === BOSS ? 1 : nv === LIST ? 1 - st(0.94, 0.99) : 0;
    if (nv === CHART) {
      // (in seconds) leaning in to watch it print; the tear (2.2); the sheet held out to read
      // (3.6); a hand up for the pencil behind his ear, a ring round the line (5.0); then his
      // line: two taps on the figure, the pencil swept at the city, a hand to his chest
      const S0 = (sec: number) => sec / 10.69;
      bR = [[0, 8, 40, 0.5], [S0(1.6), 16, 54, 1], [S0(2.0), 16, 54, 1], [S0(2.3), 18, 66, 1], [S0(3.3), 18, 66, 1], [S0(3.7), 24, 64, 1],
        [S0(4.5), 24, 64, 1], [S0(4.8), 8, 88, 1], [S0(5.3), 8, 88, 1], [S0(5.7), 22, 66, 1], [S0(6.5), 22, 66, 1], [S0(6.7), 24, 61, 1],
        [S0(6.9), 22, 66, 1], [S0(8.0), 22, 66, 1], [S0(8.2), 24, 61, 1], [S0(8.4), 22, 66, 1], [S0(8.9), 22, 66, 1],
        [S0(9.3), 32, 84, 1], [S0(9.8), 32, 84, 1], [S0(10.3), 6, 62, 1], [S0(10.69), 6, 62, 1]];
      bL = [[0, 6, 40, 0.5], [S0(1.6), 10, 56, 1], [S0(2.0), 10, 56, 1], [S0(2.3), 12, 66, 1], [S0(3.3), 12, 66, 1], [S0(3.7), 18, 64, 1],
        [S0(10.69), 18, 64, 1]];
      bLean = 0.18 * bump(S0(0.2), S0(0.8), S0(1.6), S0(2.1));
      bNeck = 0.26 * bump(S0(0.2), S0(0.8), S0(1.8), S0(2.2)) + 0.16 * bump(S0(2.4), S0(2.8), S0(4.3), S0(4.6))
        + 0.14 * bump(S0(5.6), S0(5.8), S0(6.1), S0(6.4)) - 0.16 * bump(S0(8.9), S0(9.3), S0(9.8), S0(10.1)) - 0.08 * st(S0(10.1), S0(10.5));
    }
    if (nv === BOSS) {
      bR = [[0, 22, 70, 1], [0.4, 22, 70, 1], [0.52, 26, 62, 1], [0.9, 26, 62, 1]];
      bL = [[0, 10, 72, 1], [0.4, 10, 72, 1], [0.52, 18, 62, 1], [0.9, 18, 62, 1]];
      bNeck = -0.12 + 0.12 * st(0.05, 0.2) - 0.1 * bump(0.6, 0.7, 0.8, 0.9);
    }
    if (nv === LIST) {
      // pin the printout, tap it, run the pencil down the list; then turn back to Shaw
      bTurns = [[0, 1], [0.86, -1]];
      bR = [[0, 26, 62, 1], [0.04, 18, 72, 1], [0.08, 20, 80, 1], [0.12, 20, 80, 1], [0.2, 16, 70, 1], [0.25, 20, 78, 1], [0.29, 18, 74, 1],
        [0.62, 22, 84, 1], [0.66, 23, 84, 1], [0.84, 23, 66, 1], [0.9, 10, 46, 0.6], [1, 8, 40, 0.4]];
      bL = [[0, 18, 62, 1], [0.06, 18, 76, 1], [0.1, 10, 50, 0.6], [0.2, 8, 42, 0.4]];
      bLean = 0.1 * bump(0.02, 0.08, 0.84, 0.9);
      bNeck = -0.1 * bump(0.02, 0.08, 0.6, 0.66) + 0.14 * bump(0.64, 0.7, 0.82, 0.86);
    }
    if (nv === PICK) {
      bR = [[0, 8, 40, 0.4], [0.4, 10, 44, 0.6], [0.5, 4, 70, 1], [0.8, 4, 70, 1], [0.9, 8, 42, 0.4]];
      bNeck = 0.14 * bump(0.1, 0.2, 0.4, 0.5) - 0.08 * bump(0.5, 0.6, 0.8, 0.9);
    }
    if (nv === Q1N) {
      bR = [[0, 8, 40, 0.4]];
      bNeck = 0.12 * st(0.04, 0.14);
      // right: chin up, pleased with himself; wrong: a shake of the head
      const ok = ans(3, Q1);
      const no = ans(1, Q1) + ans(2, Q1);
      bNeck += -0.3 * ok + 0.14 * Math.sin(Math.PI * 4 * Math.min(1, no)) * (1 - no);
      bLean += -0.08 * ok;
    }
    if (nv === BOOKS) {
      bw = walkOf(bxs, 256, 0.05, bds, b);
      // down to the book, up high with it, the other hand swept at the window
      bR = [[0.36, 8, 40, 0.4], [0.42, 14, 32, 1], [0.46, 14, 34, 1], [0.56, 12, 84, 1], [0.95, 12, 86, 1]];
      bL = [[0.6, 6, 40, 0.3], [0.7, 26, 66, 1], [0.86, 30, 78, 1], [0.96, 12, 52, 0.6]];
      bLean = 0.36 * bump(0.38, 0.43, 0.46, 0.52) - 0.06 * st(0.56, 0.66);
      bNeck = 0.2 * bump(0.38, 0.43, 0.46, 0.52) - 0.18 * st(0.55, 0.66);
    }
    if (nv === WARN) {
      bw = walkOf(bxs, 230, 0.05, bds, b);
      bR = [[0, 12, 86, 1], [0.14, 26, 54, 1], [0.95, 26, 54, 1]];
      bL = [[0, 12, 52, 0.6], [0.14, 8, 40, 0.4]];
      bNeck = 0.1 * bump(0.28, 0.34, 0.4, 0.46) + 0.1 * bump(0.76, 0.82, 0.88, 0.94) - 0.06 * st(0.5, 0.6);
    }
    if (nv === REGRET) {
      // the book down; himself at eighty, bent, a hand on his knee; then straight, a fist to his chest
      bTurns = [[0, -1], [0.16, 1], [0.6, -1]];
      bR = [[0, 26, 54, 1], [0.1, 26, 40, 1], [0.14, 8, 40, 0.4], [0.2, 14, 22, 1], [0.48, 14, 24, 1], [0.58, 8, 40, 0.5], [0.66, 12, 46, 1], [0.76, 22, 56, 1], [0.86, 6, 58, 1], [1, 6, 58, 1]];
      bL = [[0.16, 6, 40, 0.3], [0.24, 18, 30, 1], [0.48, 18, 30, 1], [0.56, 6, 40, 0.3]];
      bOld = bump(0.16, 0.24, 0.48, 0.58);
      bNeck = 0.2 * bOld - 0.08 * st(0.62, 0.72) * (1 - st(0.92, 1));
    }
    if (nv === LEAVE) {
      // down for the box, up with it, and out past Shaw through the door
      bCrouch = bump(0.04, 0.16, 0.2, 0.3);
      bw = walkOf(bxs, 34, 0.28 * L, bds, b);
      bR = [[0.04, 8, 40, 0.4], [0.14, 16, 16, 1], [0.24, 14, 46, 1], [1, 14, 46, 1]];
      bL = [[0.04, 6, 40, 0.4], [0.14, 10, 18, 1], [0.24, 8, 48, 1], [1, 8, 48, 1]];
      bo = 1 - st(0.88, 0.99);
      if (bw.wd !== 0) bg = lerp(G, 488, clamp01((80 - bw.x) / 40));
    }
    // ── in the car: sat turned toward her, the laptop on his knees ──
    if (bSeat) {
      bR = [[0, 18, 37, 1]];
      bL = [[0, 12, 36, 1]];
    }
    if (nv === DRIVE) {
      bR = [[0, 18, 37, 1], [0.3, 18, 39, 1], [0.34, 18, 37, 1]];
      bNeck = 0.24 - 0.3 * st(0.55, 0.7);
    }
    if (nv === PLAN) {
      // turned to the dash, a tap, a tap, without looking up from the screen; back to her
      bTurns = [[0, 1], [0.8, -1]];
      bR = [[0, 18, 37, 1], [0.06, 14, 44, 1], [0.1, 12, 48, 1], [0.13, 12, 45, 1], [0.17, 12, 48, 1], [0.21, 12, 45, 1], [0.27, 18, 37, 1]];
      bNeck = 0.26 * st(0.02, 0.1) * (1 - st(0.76, 0.84)) - 0.14 * st(0.84, 0.92);
      bLean = 0.12 * bump(0.06, 0.1, 0.22, 0.27);
    }
    if (nv === SEATTLE) {
      // the atlas up off the dash, folded to Seattle, a point ahead; back to her
      bTurns = [[0, 1], [0.66, -1]];
      bR = [[0, 18, 37, 1], [0.05, 12, 46, 1], [0.1, 20, 52, 1], [0.24, 18, 52, 1], [0.3, 30, 62, 1], [0.56, 31, 64, 1], [0.64, 18, 37, 1]];
      bL = [[0, 12, 36, 1], [0.08, 8, 50, 1], [0.24, 10, 52, 1], [0.3, 12, 42, 0.6], [0.64, 12, 36, 1]];
      bNeck = -0.08 * bump(0.28, 0.34, 0.56, 0.64) - 0.1 * st(0.7, 0.8);
      bLean = 0.1 * bump(0.02, 0.06, 0.1, 0.14);
    }
    if (nv === TYPING) {
      bR = [[0, 18, 37, 1], [0.5, 18, 39, 1], [0.54, 18, 37, 1], [0.58, 18, 39, 1], [0.62, 18, 37, 1]];
      bL = [[0, 12, 36, 1], [0.3, 12, 38, 1], [0.34, 12, 36, 1]];
      bNeck = 0.22 - 0.24 * bump(0.66, 0.74, 0.86, 0.94);
    }
    if (nv === DRAFT) {
      // two pats on the lid, then back to the keys, chin up
      bL = [[0, 12, 36, 1], [0.08, 26, 58, 1], [0.12, 26, 55, 1], [0.16, 26, 58, 1], [0.2, 26, 55, 1], [0.28, 12, 36, 1]];
      bNeck = 0.2 * st(0, 0.08) * (1 - st(0.5, 0.6)) - 0.22 * st(0.6, 0.7);
      bLean = -0.06 * st(0.6, 0.7);
    }
    // ── the garage ──
    if (nv === ARRIVE) {
      bR = [[0, 8, 40, 0.4], [0.56, 8, 40, 0.4], [0.66, 22, 52, 1], [0.86, 22, 52, 1], [0.94, 8, 40, 0.4]];
      bNeck = 0.08 * bump(0.2, 0.3, 0.44, 0.52);
    }
    let doorHold = 0;
    if (nv === DOORS) {
      // to the stack, the front door up and turned flat, across, down on the sawhorses
      const w1 = walkOf(bxs, 290, 0.0, bds, b);
      const w2 = walkOf(290, 210, 2.32, 1, b);
      bw = b < 2.0 ? w1 : w2;
      bTurns = [[0, 1], [1.95 / L, -1]];
      bTurnWalk = false;
      bR = [[0, 8, 40, 0.4], [0.26, 14, 46, 1], [0.3, 24, 62, 1], [0.42, 16, 40, 1], [0.84, 16, 40, 1], [0.9, 20, 30, 1], [0.97, 10, 40, 0.4]];
      bL = [[0, 6, 40, 0.4], [0.26, 10, 46, 1], [0.3, 18, 58, 1], [0.42, 10, 40, 1], [0.84, 10, 40, 1], [0.9, 14, 30, 1], [0.97, 6, 40, 0.4]];
      bLean = 0.12 * bump(0.26, 0.3, 0.38, 0.42) + 0.22 * bump(0.84, 0.88, 0.9, 0.95);
      doorHold = b < 1.3 ? 0 : 1;
    }
    if (nv === DRILL) {
      // to the near corner, round, down; the drill up under the corner
      bw = walkOf(bxs, 272, 0.0, bds, b);
      bTurns = [[0, 1], [0.4, -1]];
      bCrouch = st(0.44, 0.56);
      bR = [[0.44, 8, 40, 0.4], [0.56, 14, 30, 1], [0.6, 14, 30, 1], [0.66, 14, 33, 1], [0.76, 14, 31, 1], [0.86, 14, 33, 1]];
      bL = [[0.44, 6, 40, 0.4], [0.58, 12, 26, 1]];
      bNeck = 0.18 * st(0.5, 0.6);
    }
    if (nv === NAME) {
      bCrouch = 1 - st(0.0, 0.14);
      bTurns = [[0, -1], [0.16, 1]];
      bR = [[0, 14, 30, 1], [0.14, 8, 40, 0.4], [0.7, 8, 40, 0.4], [0.78, 16, 60, 1], [0.95, 16, 60, 1]];
      bNeck = -0.16 * st(0.3, 0.42) + 0.1 * bump(0.8, 0.86, 0.92, 1);
    }
    let magic = 0;
    if (nv === CADABRA) {
      // a few steps along, round to them, both arms up like a magician; a book appears
      bw = walkOf(bxs, 300, 0.0, bds, b);
      bTurns = [[0, 1], [0.12, -1]];
      bR = [[0, 16, 60, 1], [0.12, 10, 44, 0.6], [0.22, 30, 72, 1], [0.32, 36, 80, 1], [0.6, 36, 80, 1], [0.66, 34, 76, 1], [0.72, 36, 80, 1], [1, 36, 80, 1]];
      bL = [[0.12, 6, 40, 0.4], [0.22, 20, 88, 1], [0.32, 24, 100, 1], [0.62, 24, 100, 1], [0.7, 26, 96, 1], [1, 26, 98, 1]];
      bNeck = -0.18 * st(0.24, 0.34) + 0.06 * bump(0.6, 0.66, 0.72, 0.78);
      bLean = -0.08 * st(0.24, 0.34);
      magic = st(0.76, 0.84);
    }
    if (nv === CADAVER) {
      // the arm Kaphan takes goes down with his; the other comes down after; the head drops
      bR = [[0, 36, 80, 1], [0.66, 34, 74, 1], [0.84, 28, 46, 1], [1, 24, 44, 1]];
      bL = [[0, 26, 98, 1], [0.86, 26, 98, 1], [0.96, 12, 50, 1]];
      bNeck = -0.18 * (1 - st(0.6, 0.75)) + 0.22 * st(0.86, 0.96);
      bLean = -0.08 * (1 - st(0.6, 0.75));
      magic = 1;
    }
    if (nv >= REST) {
      bR = [[0, 18, 36, 1], [0.3, 18, 38, 1], [0.34, 18, 36, 1]];
      bL = [[0, 14, 35, 1], [0.6, 14, 37, 1], [0.64, 14, 35, 1]];
      bNeck = 0.16;
      bLean = 0.12;
    }
    // a walk the last beat was tapped through before it finished is finished now (C18)
    if (bw.wd === 0 && !bSeat && Math.abs(bxs - B_X[nv]) > 2) bw = walkOf(bxs, B_X[nv], 0, bds, b);
    if (bw.wd !== 0) bx = bw.x;
    const bxS = carry(cv, 1, n, bx, bx, 1);
    const bd = carry(cv, 2, n, 0, faceOf(bds, bTurns, b, L, bTurnWalk ? bw : STILL), 1);
    const bgS = bSeat ? CAR_FLOOR : carry(cv, 3, n, bg, bg, tr);
    const bCode = sp(1) ? TALK : NOD;
    let sb = bSeat ? seatOf(SEAT_CAR, 13) : bodyOf(bw, bCode, t, b, 0);
    sb = keyed(sb, bR, u, bxS, bgS, bd, 1);
    sb = keyed(sb, bL, u, bxS, bgS, bd, -1);
    sb = leanOf(sb, bLean, bNeck);
    sb = crouchMix(sb, bCrouch, t, 0);
    sb = oldMan(sb, bOld, t, 0);
    const prevB = carryFrom(heldB, n, hHold(bCode, t, 0));
    const figB = keepHeld(heldB, bw.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ══ SHAW (the office) ════════════════════════════════════════════════════
    const S_X = [32, 32, 138, 138, 138, 138, 138, 156, 156];
    const sIdx = nv < S_X.length ? nv : S_X.length - 1;
    const sxs = fresh ? S_X[sIdx] : carrySource(cv, 4, n, S_X[sIdx]);
    const sds = fresh ? 1 : carrySource(cv, 5, n, 1);
    let sw: Walk = STILL;
    let sx = sxs;
    let sg = G;
    let so = place === 0 && nv >= BOSS ? 1 : 0;
    let sR: readonly Key[] | null = null;
    let sL: readonly Key[] | null = null;
    let sLean = 0;
    let sNeck = 0;
    let sPerch = nv === REGRET ? 1 : 0;
    let coatOn = nv === BOSS ? 1 : 0;
    let doorOpen = nv === BOSS ? bump(0.04, 0.12, 0.6, 0.75) : 0;
    if (nv === BOSS) {
      // in through the door, the coat over his arm, to the desk's end
      sw = walkOf(sxs, 138, 0.42, 1, b);
      so = ss(0.2, 0.5);
      sg = lerp(486, G, clamp01((sw.x - 32) / 34));
      sR = [[0, 6, 40, 0.4], [0.7, 6, 40, 0.4], [0.8, 10, 52, 0.8], [0.92, 6, 40, 0.4]];
      sL = [[0, 10, 44, 1]];
      sNeck = 0.06 * bump(0.66, 0.74, 0.86, 0.94);
    }
    if (nv === LIST) {
      // the coat laid over the desk's corner; a hand in his pocket
      sR = [[0, 6, 40, 0.4], [0.5, 4, 36, 0.8]];
      sL = [[0, 10, 44, 1], [0.08, 16, 34, 1], [0.16, 16, 32, 1], [0.24, 6, 38, 0.5]];
      sLean = 0.12 * bump(0.06, 0.12, 0.16, 0.22);
      sNeck = -0.08 * bump(0.3, 0.4, 0.56, 0.66) + 0.08 * st(0.7, 0.8);
      coatOn = 1 - st(0.12, 0.16);
    }
    if (nv === PICK) {
      // the arms folded, a nod at the three things on the desk
      sR = [[0, 4, 36, 0.8], [0.1, 8, 52, 1]];
      sL = [[0, 6, 38, 0.5], [0.12, 6, 50, 1]];
      sNeck = 0.24 * bump(0.3, 0.42, 0.62, 0.74) + 0.18 * bump(0.78, 0.84, 0.9, 0.96);
    }
    if (nv === Q1N) {
      sR = [[0, 8, 52, 1]];
      sL = [[0, 6, 50, 1]];
      sNeck = 0.1 * st(0.1, 0.2) - 0.22 * ans(3, Q1) + 0.16 * (ans(1, Q1) + ans(2, Q1));
      sLean = -0.06 * ans(3, Q1);
    }
    if (nv === BOOKS) {
      sR = [[0, 8, 52, 1], [0.5, 8, 52, 1], [0.6, 6, 40, 0.5]];
      sL = [[0, 6, 50, 1], [0.5, 6, 50, 1], [0.62, 4, 40, 0.4]];
      sNeck = -0.16 * st(0.56, 0.7);
    }
    if (nv === WARN) {
      // across to the desk's corner, sat on it; one finger on the book, twice
      sw = walkOf(sxs, 156, 0.0, sds, b);
      sPerch = st(0.12, 0.22);
      sR = [[0, 6, 40, 0.4], [0.24, 10, 40, 0.6], [0.3, 30, 52, 1], [0.34, 32, 52, 1], [0.4, 14, 40, 0.6], [0.72, 14, 40, 0.6], [0.78, 30, 52, 1], [0.82, 32, 52, 1], [0.9, 12, 40, 0.6]];
      sL = [[0, 4, 40, 0.4], [0.22, 4, 22, 0.8]];
      sLean = 0.14 * (bump(0.26, 0.3, 0.36, 0.42) + bump(0.74, 0.78, 0.84, 0.9));
      sNeck = 0.12 * st(0.2, 0.3);
    }
    if (nv === REGRET) {
      sR = [[0, 12, 40, 0.6], [0.3, 8, 34, 0.8], [0.7, 8, 34, 0.8], [0.8, 10, 50, 1]];
      sL = [[0, 4, 22, 0.8]];
      sNeck = 0.1 - 0.16 * bump(0.18, 0.28, 0.44, 0.54) + 0.1 * bump(0.7, 0.8, 0.9, 1);
      sLean = -0.1 * bump(0.18, 0.28, 0.44, 0.54);
    }
    if (nv === LEAVE) {
      // up off the desk, across to the door, the door swung open, a point through it
      sPerch = 1 - st(0.0, 0.06);
      sw = walkOf(sxs, 84, 0.3, sds, b);
      sg = lerp(G, 494, clamp01((140 - sw.x) / 50));
      doorOpen = st(0.4, 0.52);
      sR = [[0, 8, 40, 0.4], [0.5, 10, 46, 0.6], [0.58, 28, 66, 1], [1, 28, 66, 1]];
      sL = [[0, 4, 40, 0.4], [0.38, 6, 40, 0.4], [0.44, 20, 46, 1], [0.54, 16, 46, 1], [1, 16, 46, 1]];
      sNeck = -0.06 * st(0.58, 0.66);
    }
    if (sw.wd === 0 && Math.abs(sxs - S_X[sIdx]) > 2 && nv > BOSS) sw = walkOf(sxs, S_X[sIdx], 0, sds, b);
    if (sw.wd !== 0) sx = sw.x;
    const sxS = carry(cv, 4, n, sx, sx, 1);
    const sd = carry(cv, 5, n, 0, faceOf(sds, [[0, 1]], b, L, sw), 1);
    const sgS = carry(cv, 6, n, sg, sg, tr);
    const sCode = sp(2) ? TALK : NOD;
    let ss0 = bodyOf(sw, sCode, t, b, 1);
    ss0 = keyed(ss0, sR, u, sxS, sgS, sd, 1);
    ss0 = keyed(ss0, sL, u, sxS, sgS, sd, -1);
    ss0 = leanOf(ss0, sLean, sNeck);
    if (sPerch > 0) {
      let seat = leanOf(seatOf(31, 16), sLean, sNeck);
      seat = keyed(seat, sR, u, sxS, sgS, sd, 1);
      seat = keyed(seat, sL, u, sxS, sgS, sd, -1);
      ss0 = seatMix(ss0, seat, sPerch);
    }
    const prevS = carryFrom(heldS, n, hHold(sCode, t, 1));
    const figS = keepHeld(heldS, sw.walking ? mixKeepLegs(prevS, ss0, tr) : mixStance(prevS, ss0, tr));

    // ══ MACKENZIE (the road and the garage) ══════════════════════════════════
    const M_X = [MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X, MAC_X,
      346, 346, 346, 346, 354, 348, 348, 348];
    const M_D = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1];
    const mxs = fresh ? M_X[nv] : carrySource(cv, 7, n, M_X[nv]);
    const mds = fresh ? M_D[nv] : carrySource(cv, 8, n, M_D[nv]);
    let mx = mxs;
    let mg = place === 1 ? CAR_FLOOR : G;
    let mTurns: (readonly number[])[] = [[0, M_D[nv]]];
    const mo = place === 1 || place === 2 ? 1 : 0;
    let mR: readonly Key[] | null = null;
    let mL: readonly Key[] | null = null;
    let mLean = 0;
    let mNeck = 0;
    let mSit = place === 2 ? 1 : 0;
    let mStep = 0;
    let signHeld = 0;
    let brush = 0;
    if (place === 1) {
      // both hands on the wheel
      mR = [[0, 24, 54, 1]];
      mL = [[0, 22, 38, 1]];
    }
    if (nv === DRIVE) {
      mR = [[0, 24, 54, 1], [0.16, 30, 48, 1], [0.2, 28, 46, 1], [0.24, 30, 48, 1], [0.3, 24, 54, 1]];
      mNeck = -0.06 * bump(0.1, 0.2, 0.3, 0.4) + 0.12 * bump(0.5, 0.6, 0.86, 0.96);
    }
    if (nv === PLAN) {
      // a glance at him as he taps, a shake of the head at "like a genius", a hand eased on the wheel
      mNeck = 0.2 * bump(0.1, 0.2, 0.42, 0.52) - 0.16 * bump(0.84, 0.88, 0.94, 1);
      mL = [[0, 22, 38, 1], [0.5, 22, 38, 1], [0.6, 26, 44, 1], [0.7, 22, 38, 1]];
    }
    if (nv === SEATTLE) mNeck = -0.1 * bump(0.3, 0.4, 0.5, 0.6) + 0.06 * bump(0.7, 0.8, 0.9, 1);
    if (nv === TYPING) {
      mNeck = 0.24 * bump(0.08, 0.18, 0.36, 0.46) - 0.04 * st(0.6, 0.7);
      mLean = 0.06 * bump(0.08, 0.18, 0.36, 0.46);
    }
    if (nv === DRAFT) {
      // a look at him patting it, and a raised chin at "people will study this"
      mNeck = 0.2 * bump(0.08, 0.18, 0.3, 0.4) - 0.2 * bump(0.6, 0.7, 0.86, 0.96);
      mR = [[0, 24, 54, 1], [0.6, 24, 54, 1], [0.7, 28, 50, 1], [0.8, 24, 54, 1]];
    }
    // the garage: sat on the ladder's bottom step, lettering the sign on her knees
    if (place === 2) {
      mR = [[0, 18, 26, 1]];
      mL = [[0, 12, 25, 1]];
    }
    if (nv === ARRIVE) {
      mR = [[0, 18, 26, 1], [0.2, 22, 27, 1], [0.3, 14, 27, 1], [0.4, 18, 26, 1], [0.6, 18, 26, 1]];
      mNeck = 0.22 - 0.24 * bump(0.5, 0.6, 0.86, 0.96);
      brush = 1;
    }
    if (nv === DOORS) {
      mR = [[0, 18, 26, 1], [0.6, 18, 26, 1], [0.66, 22, 27, 1], [0.72, 14, 27, 1], [0.8, 18, 26, 1]];
      mNeck = 0.22 - 0.3 * bump(0.3, 0.4, 0.56, 0.66);
      brush = 1;
    }
    if (nv === DRILL) {
      mR = [[0, 18, 26, 1], [0.5, 14, 30, 1]];
      mNeck = 0.1 - 0.16 * bump(0.6, 0.7, 0.86, 0.96);
      brush = 1 - st(0.4, 0.5);
    }
    if (nv === NAME) {
      // up, round to the ladder, three treads, the sign hung, a look down at him
      mSit = 1 - st(0.0, 0.1);
      mTurns = [[0, -1], [0.1, 1], [0.66, -1]];
      const s1 = st(0.2, 0.28);
      const s2 = st(0.3, 0.38);
      const s3 = st(0.4, 0.48);
      mx = lerp(lerp(lerp(346, STEPS[0].x, s1), STEPS[1].x, s2), STEPS[2].x, s3);
      mg = lerp(lerp(lerp(G, STEPS[0].g, s1), STEPS[1].g, s2), STEPS[2].g, s3);
      mStep = s1 > 0 && s1 < 1 ? s1 : s2 > 0 && s2 < 1 ? s2 : s3;
      signHeld = 1 - st(0.56, 0.58);
      mR = [[0, 18, 26, 1], [0.1, 16, 40, 1], [0.44, 16, 46, 1], [0.5, 14, 80, 1], [0.6, 14, 80, 1], [0.66, 8, 46, 0.6]];
      mL = [[0, 12, 25, 1], [0.1, 10, 40, 1], [0.44, 10, 46, 1], [0.5, 4, 80, 1], [0.6, 4, 80, 1], [0.66, 6, 46, 0.6]];
      mNeck = -0.2 * bump(0.46, 0.52, 0.6, 0.66) + 0.24 * st(0.72, 0.82);
    }
    if (nv === CADABRA) {
      // down the treads again, and sat on the bottom one
      const d1 = st(0.04, 0.12);
      const d2 = st(0.12, 0.2);
      const d3 = st(0.2, 0.28);
      mx = lerp(lerp(lerp(354, STEPS[1].x, d1), STEPS[0].x, d2), 348, d3);
      mg = lerp(lerp(lerp(STEPS[2].g, STEPS[1].g, d1), STEPS[0].g, d2), G, d3);
      mStep = d1 > 0 && d1 < 1 ? d1 : d2 > 0 && d2 < 1 ? d2 : d3 < 1 ? d3 : 0;
      mSit = st(0.32, 0.42);
      mR = [[0, 8, 46, 0.6], [0.42, 12, 40, 0.6]];
      mL = [[0, 6, 46, 0.6], [0.42, 10, 30, 0.6]];
      mNeck = 0.2 * bump(0.06, 0.16, 0.24, 0.3) - 0.14 * st(0.5, 0.6);
    }
    if (nv === CADAVER) {
      mR = [[0, 12, 40, 0.6], [0.8, 12, 40, 0.6], [0.9, 6, 64, 1]];
      mL = [[0, 10, 30, 0.6]];
      mNeck = -0.14 + 0.2 * st(0.86, 0.94);
    }
    if (nv >= REST) {
      mR = [[0, 10, 56, 1]];
      mL = [[0, 10, 30, 0.6]];
      mNeck = -0.16 + 0.08 * bump(0.3, 0.4, 0.6, 0.7);
    }
    const mxS = carry(cv, 7, n, mx, mx, 1);
    const md = carry(cv, 8, n, 0, faceOf(mds, mTurns, b, L, STILL), 1);
    const mgS = place === 1 ? CAR_FLOOR : carry(cv, 9, n, mg, mg, 1);
    const mCode = sp(3) ? TALK : NOD;
    let sm0 = place === 1 ? seatOf(SEAT_CAR, 12) : hLive(mCode, t, b, 2);
    sm0 = keyed(sm0, mR, u, mxS, mgS, md, 1);
    sm0 = keyed(sm0, mL, u, mxS, mgS, md, -1);
    sm0 = leanOf(sm0, mLean, mNeck);
    if (place === 2 && mSit > 0) {
      let seat = leanOf(seatOf(16, 14), mLean, mNeck);
      seat = keyed(seat, mR, u, mxS, mgS, md, 1);
      seat = keyed(seat, mL, u, mxS, mgS, md, -1);
      sm0 = mixStance(sm0, seat, mSit);
    }
    sm0 = stepLift(sm0, mStep);
    const prevM = carryFrom(heldM, n, hHold(mCode, t, 2));
    const figM = keepHeld(heldM, mixStance(prevM, sm0, tr));

    // ══ KAPHAN (the garage) ══════════════════════════════════════════════════
    const kxs = fresh ? (nv <= ARRIVE ? 82 : nv >= REST ? 64 : 112) : carrySource(cv, 10, n, 82);
    const kds = fresh ? 1 : carrySource(cv, 11, n, 1);
    let kw: Walk = STILL;
    let kx = kxs;
    let kg = G;
    let ko = place === 2 ? 1 : 0;
    let kR: readonly Key[] | null = [[0, 6, 40, 0.4]];
    let kL: readonly Key[] | null = [[0, 4, 52, 0.8]];
    let kLean = 0;
    let kNeck = 0;
    if (nv === ARRIVE) {
      // the door swings, he steps out of the dark, comes in, waves; a hand to his chest
      kw = walkOf(kxs, 112, 0.62, 1, b);
      ko = ss(0.24, 0.56);
      kg = lerp(486, G, clamp01((kw.x - 82) / 26));
      kR = [[0, 6, 40, 0.4], [0.24, 6, 40, 0.4], [0.3, 16, 84, 1], [0.34, 22, 86, 1], [0.38, 14, 86, 1], [0.42, 20, 86, 1], [0.48, 12, 52, 1], [0.62, 6, 48, 0.6], [0.7, 4, 56, 1], [1, 4, 56, 1]];
      kNeck = -0.08 * bump(0.28, 0.34, 0.44, 0.5) + 0.1 * bump(0.72, 0.78, 0.9, 0.96);
    }
    if (nv === DOORS) {
      kR = [[0, 4, 56, 1], [0.2, 6, 40, 0.4]];
      kNeck = -0.1 * bump(0.3, 0.4, 0.5, 0.6) + 0.08 * bump(0.7, 0.8, 0.9, 1);
    }
    if (nv === DRILL) {
      // both hands on the door's far end, holding it still
      kR = [[0, 6, 40, 0.4], [0.1, 16, 34, 1], [1, 16, 34, 1]];
      kL = [[0, 4, 52, 0.8], [0.12, 12, 33, 1], [1, 12, 33, 1]];
      kLean = 0.2 * st(0.1, 0.2);
      kNeck = 0.1 * st(0.1, 0.2) - 0.08 * bump(0.6, 0.7, 0.8, 0.9);
    }
    if (nv === NAME) {
      kR = [[0, 16, 34, 1], [0.12, 6, 40, 0.4]];
      kL = [[0, 12, 33, 1], [0.14, 4, 52, 0.8]];
      kLean = 0.2 * (1 - st(0.08, 0.18));
      kNeck = -0.2 * st(0.3, 0.44);
    }
    if (nv === CADABRA) {
      kNeck = -0.12 + 0.12 * st(0.3, 0.4) - 0.1 * bump(0.76, 0.82, 0.9, 0.96);
      kR = [[0, 6, 40, 0.4], [0.5, 8, 50, 0.8], [0.7, 6, 40, 0.4]];
    }
    if (nv === CADAVER) {
      // across to him; Bezos's raised arm taken and brought gently down; a point at the sign
      kw = walkOf(kxs, 232, 0.0, kds, b);
      kR = [[0, 6, 40, 0.4], [0.56, 10, 50, 0.5], [0.64, 30, 74, 1], [0.66, 30, 74, 1], [0.84, 32, 46, 1], [0.92, 12, 42, 0.5]];
      kL = [[0, 4, 52, 0.8], [0.84, 4, 52, 0.8], [0.92, 26, 88, 1], [1, 27, 90, 1]];
      kNeck = -0.16 * st(0.88, 0.96);
    }
    if (nv >= REST) {
      kR = [[0, 4, 38, 0.8]];
      kL = [[0, 4, 52, 0.8]];
      kNeck = 0.06 + 0.08 * bump(0.2, 0.3, 0.5, 0.6);
    }
    const kStart = nv <= ARRIVE ? 82 : nv < CADAVER ? 112 : nv === CADAVER ? 112 : nv >= REST ? 64 : 232;
    if (kw.wd === 0 && Math.abs(kxs - kStart) > 2 && nv > ARRIVE) kw = walkOf(kxs, kStart, 0, kds, b);
    if (kw.wd !== 0) kx = kw.x;
    const kxS = carry(cv, 10, n, kx, kx, 1);
    const kd = carry(cv, 11, n, 0, faceOf(kds, [[0, 1]], b, L, kw), 1);
    const kgS = carry(cv, 12, n, kg, kg, tr);
    const kCode = sp(4) ? TALK : NOD;
    let sk = bodyOf(kw, kCode, t, b, 3);
    sk = keyed(sk, kR, u, kxS, kgS, kd, 1);
    sk = keyed(sk, kL, u, kxS, kgS, kd, -1);
    sk = leanOf(sk, kLean, kNeck);
    const prevK = carryFrom(heldK, n, hHold(kCode, t, 3));
    const figK = keepHeld(heldK, kw.walking ? mixKeepLegs(prevK, sk, tr) : mixStance(prevK, sk, tr));

    // ── the car's ride: a little bounce ──
    const bounce = place === 1 ? 0.7 * Math.sin(t * 7.1) + 0.45 * Math.sin(t * 3.3 + 1) : 0;

    // ── the bundles ──────────────────────────────────────────────────────────
    const BB = pose(figB, bxS, bgS + bounce, K, bd, place === 3 ? 0 : bo);
    const BS = pose(figS, sxS, sgS, K, sd, place === 0 ? so : 0);
    const BM = pose(figM, mxS, mgS + bounce, K, md, mo);
    const BK = pose(figK, kxS, kgS, K, kd, place === 2 ? ko : 0);
    const bRw = jointOf(BB, 'wrR');
    const bLw = jointOf(BB, 'wrL');
    const sLw = jointOf(BS, 'wrL');
    const mRw = jointOf(BM, 'wrR');
    const mLw = jointOf(BM, 'wrL');

    // ── the printout: torn off, held up, held out, pinned on the board ──
    let pr = { x: bLw.x + 7 * bd, y: bLw.y + 4, s: 1, o: 0 };
    if (nv === CHART) pr.o = ss(2.1, 2.3);
    if (nv === BOSS) pr.o = 1;
    if (nv === LIST) {
      const pin = st(0.04, 0.08);
      pr = { x: lerp(bRw.x, BOARD.x, pin), y: lerp(bRw.y + 4, BOARD.y, pin), s: lerp(1, 0.8, pin), o: 1 };
    }
    if (place === 0 && nv > LIST) pr = { x: BOARD.x, y: BOARD.y, s: 0.8, o: 1 };
    // the printer's head running while it prints (b0, until the tear)
    const head = nv === CHART && b < 2.1 ? 1 : 0;
    const pen = { x: bRw.x, y: bRw.y, o: place === 0 ? pencil * bo : 0, d: bd };
    // ── the three things on the desk, the book, the shelf ──
    const rSoft = carry(cv, 13, n, 0, kept(13, 1, Q1, Q1N), keptTr(Q1));
    const rCd = carry(cv, 14, n, 0, kept(14, 2, Q1, Q1N), keptTr(Q1));
    const rBook = carry(cv, 15, n, 0, kept(15, 3, Q1, Q1N), keptTr(Q1));
    const fillQ = Q1[n] ? clamp01((rBook - 0.4) / 0.6) : n > Q1N && rBook > 0.5 ? 1 : 0;
    const shelf = place === 0 ? Math.max(fillQ, nv === BOOKS ? st(0.56, 0.96) : nv > BOOKS ? 1 : 0) : 0;
    // the book: on the desk, in his hand (b5–b6), put down at BOOK_REST (b7 on)
    let bk = { x: 242, y: DESK_TOP, held: 0, o: place === 0 ? 1 : 0 };
    if (nv === BOOKS && u > 0.44) bk = { x: bRw.x, y: bRw.y + 10, held: 1, o: 1 };
    if (nv === WARN) bk = { x: bRw.x, y: bRw.y + 10, held: 1, o: 1 };
    if (nv === REGRET) {
      const down = st(0.08, 0.14);
      bk = { x: lerp(bRw.x, BOOK_REST, down), y: lerp(bRw.y + 10, DESK_TOP, down), held: down < 1 ? 1 : 0, o: 1 };
    }
    if (nv === LEAVE) bk = { x: BOOK_REST, y: DESK_TOP, held: 0, o: 1 };
    // the box: on the floor, then in his arms
    const lift = nv === LEAVE ? st(0.16, 0.22) : 0;
    const box = {
      x: lerp(BOX_AT, (bRw.x + bLw.x) / 2, lift), y: lerp(G, (bRw.y + bLw.y) / 2 + 12, lift),
      o: place === 0 ? (nv === LEAVE ? bo : 1) : 0,
    };
    // Shaw's coat: over his arm, then over the desk's corner
    const coat = { x: lerp(152, sLw.x, coatOn), y: lerp(DESK_TOP - 2, sLw.y, coatOn), o: place === 0 && nv >= BOSS ? so : 0 };

    // ── the road ──
    const scrollX = place === 1 ? (t * 40) % 400 : 0;
    const dashX = place === 1 ? (t * 160) % 400 : 0;
    const spin = place === 1 ? (t * 160 * 180) / (23 * Math.PI) : 0;
    // the laptop on his knees, the keys under his right hand (it stays put while a hand leaves it)
    const lap = { x: BEZ_CAR_X + 22 * bd * KS, y: CAR_FLOOR - 36 * KS + bounce + 2, d: bd, o: bSeat ? 1 : 0 };
    // the atlas: on the dash, up in his hands and folded (b12), back on the dash
    const atlasUp = nv === SEATTLE ? st(0.04, 0.1) * (1 - st(0.62, 0.68)) : 0;
    const atlas = {
      x: lerp(ATLAS_DASH.x, (bRw.x + bLw.x) / 2, atlasUp), y: lerp(ATLAS_DASH.y + bounce, (bRw.y + bLw.y) / 2 - 6, atlasUp),
      up: atlasUp, fold: nv === SEATTLE ? st(0.12, 0.22) : nv > SEATTLE ? 1 : 0, o: place === 1 ? 1 : 0,
    };
    const rSea = carry(cv, 16, n, 0, kept(16, 4, Q2, Q2N), keptTr(Q2));
    const rSf = carry(cv, 17, n, 0, kept(17, 5, Q2, Q2N), keptTr(Q2));
    const rBoul = carry(cv, 18, n, 0, kept(18, 6, Q2, Q2N), keptTr(Q2));
    const ahead = place === 1 ? Math.max(rSea > 0.5 ? 1 : 0, nv === SEATTLE ? st(0.02, 0.3) : nv > SEATTLE ? 1 : 0) : 0;
    const wrong2 = Math.min(1, rSf + rBoul);
    const jolt = Q2[n] ? Math.sin(Math.PI * 6 * Math.min(1, wrong2 * 1.6)) * (1 - wrong2) : 0;
    // the spreadsheet's highlighted row, stepping down as he types
    const cellRow = nv === TYPING ? Math.floor(st(0.1, 0.9) * 5) : nv === DRAFT ? 5 : nv > DRAFT ? 5 : 1;

    // ── the garage ──
    const backDoor = nv === ARRIVE ? bump(0.0, 0.1, 0.6, 0.76) : 0;
    // the door off the stack: leaning, lifted and turned flat, carried, laid down
    let dr = { x: STACK_DOOR.x, y: STACK_DOOR.y, r: -87, sy: 1, o: place === 2 ? 1 : 0, flat: 0 };
    if (nv === DOORS && doorHold > 0) {
      const lift2 = ss(1.3, 1.95);
      const mid = { x: (bRw.x + bLw.x) / 2, y: (bRw.y + bLw.y) / 2 + 2 };
      const down = ss(3.75, 4.05);
      const heldAt = { x: lerp(STACK_DOOR.x, mid.x, lift2), y: lerp(STACK_DOOR.y, mid.y, lift2) };
      dr = { x: lerp(heldAt.x, DESK2.x, down), y: lerp(heldAt.y, DESK2.y - 6, down), r: lerp(-87, 0, lift2), sy: lerp(1, 0.32, lift2), o: 1, flat: ss(3.9, 4.05) };
    }
    if (place === 2 && nv > DOORS) dr = { x: DESK2.x, y: DESK2.y - 6, r: 0, sy: 0.32, o: 1, flat: 1 };
    const leg1 = nv === DRILL ? st(0.72, 0.76) : nv > DRILL && place === 2 ? 1 : 0;
    const leg2 = place === 2 && nv >= REST ? 1 : 0;
    const drill = { x: bRw.x, y: bRw.y, o: nv === DRILL ? st(0.5, 0.56) : nv === NAME ? 1 - st(0.04, 0.14) : 0, spin: nv === DRILL ? bump(0.6, 0.62, 0.72, 0.74) : 0 };
    // the sign: on her knees, up in her hands, hung on its nail
    let sign = { x: (mRw.x + mLw.x) / 2, y: (mRw.y + mLw.y) / 2 - 2, o: place === 2 ? 1 : 0 };
    if (nv === NAME) {
      sign = signHeld > 0.5 ? { x: (mRw.x + mLw.x) / 2, y: (mRw.y + mLw.y) / 2 + 4, o: 1 } : { x: SIGN.x, y: SIGN.y, o: 1 };
    }
    if (place === 2 && nv > NAME) sign = { x: SIGN.x, y: SIGN.y, o: 1 };
    const brushAt = { x: mRw.x, y: mRw.y, o: place === 2 ? brush : 0 };
    // the magic book in his left hand, the backpack on Kaphan's back
    const book2 = { x: bLw.x, y: bLw.y - 2, s: magic, o: place === 2 && nv >= CADABRA && nv < REST ? 1 : 0 };
    const kShB = jointOf(BK, 'shB');
    const pack = { x: kShB.x, y: kShB.y + 2, d: kd, o: place === 2 && nv < REST ? ko : 0 };
    const night = place === 2 && nv >= REST ? 1 : 0;

    return {
      BB, BS, BM, BK, t, dark, place, night,
      cam: { s: cs, x: 200 - ccx * cs, y: 364 - ccy * cs },
      pr, head, pen, rSoft, rCd, rBook, shelf, bk, box, coat, door: doorOpen,
      scrollX, dashX, spin, lap, atlas, rSea, rSf, rBoul, ahead, jolt, cellRow,
      q1: carry(cv, 19, n, 0, Q1[n], tr), q2: carry(cv, 20, n, 0, Q2[n], tr),
      backDoor, dr, leg1, leg2, drill, sign, brushAt, book2, pack,
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.BB);
  const DS = useDerivedValue<Bundle>(() => SCENE.value.BS);
  const DM = useDerivedValue<Bundle>(() => SCENE.value.BM);
  const DK = useDerivedValue<Bundle>(() => SCENE.value.BK);
  const camSt = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: c.x }, { translateY: c.y }, { scale: c.s }] };
  });
  const officeOn = useAnimatedStyle(() => ({ opacity: SCENE.value.place === 0 ? 1 : 0 }));
  const roadOn = useAnimatedStyle(() => ({ opacity: SCENE.value.place === 1 ? 1 : 0 }));
  const atlasOn = useAnimatedStyle(() => ({ opacity: SCENE.value.place === 3 ? 1 : 0 }));
  const garageOn = useAnimatedStyle(() => ({ opacity: SCENE.value.place === 2 ? 1 : 0 }));
  const nightOn = useAnimatedStyle(() => ({ opacity: SCENE.value.night }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.world, camSt]} pointerEvents="none">
        {/* ── THE OFFICE ── */}
        <Animated.View style={[styles.world, officeOn]}>
          <LessonPicture name="amazon1-city" />
          <Beacon S={SCENE} x={132} y={226} k={0} />
          <Beacon S={SCENE} x={262} y={268} k={1} />
          <Plane S={SCENE} />
          <LessonPicture name="amazon1-office" />
          <GlassDoor S={SCENE} />
          <View style={styles.deskShadow} />
          <LessonPicture name="amazon1-desk" />
          <Printhead S={SCENE} />
          <ShelfBooks S={SCENE} />
          <FlyingBooks S={SCENE} />
          <DeskItems S={SCENE} />
          <Printout S={SCENE} held={0} />
          <Coat S={SCENE} />
        </Animated.View>
        {/* ── THE ROAD ── */}
        <Animated.View style={[styles.world, roadOn]}>
          <LessonPicture name="amazon1-dusk" />
          <Ahead S={SCENE} />
          <Strip S={SCENE} k="scrollX" pic="amazon1-plains" />
          <LessonPicture name="amazon1-road" />
          <Strip S={SCENE} k="dashX" pic="amazon1-dashes" />
          <View style={styles.carShadow} />
          <Car S={SCENE} part="in" />
          <AtlasDash S={SCENE} />
        </Animated.View>
        {/* ── THE GARAGE ── */}
        <Animated.View style={[styles.world, garageOn]}>
          <LessonPicture name="amazon1-garage-far" />
          <Rain S={SCENE} />
          <Animated.View style={[styles.world, nightOn]}><LessonPicture name="amazon1-garage-night" /></Animated.View>
          <BackDoor S={SCENE} />
          <View style={styles.benchShadow} />
          <LessonPicture name="amazon1-garage-mid" />
          <Animated.View style={[styles.world, nightOn]}><View style={styles.nightVeil} /></Animated.View>
          <StoveFire S={SCENE} />
          <Sign S={SCENE} />
          <DoorPlank S={SCENE} />
          <Legs S={SCENE} />
          <Workstation S={SCENE} />
        </Animated.View>
        {/* ── THE PEOPLE ── */}
        {/* cast: tophat */}
        <Stickman D={DS} k={K} role="second" wear={SHAW_HEAD} garb={UNIT2_OUTFITS.bossSuit.garb?.bands} />
        {/* cast: bun */}
        <Stickman D={DM} k={K} role="second" wear={BY_ID.bun.pieces} garb={UNIT2_OUTFITS.sweater.garb?.bands} />
        <Brush S={SCENE} />
        {/* cast: cap */}
        <Stickman D={DK} k={K} role="crowd" wear={KAPHAN_HEAD} garb={UNIT2_OUTFITS.tshirt.garb?.bands} />
        <Pack S={SCENE} />
        <CardBox S={SCENE} />
        <Laptop S={SCENE} />
        {/* cast: plain */}
        <Stickman D={DB} k={K} role="lead" wear={[]} garb={UNIT2_OUTFITS.bezos.garb?.bands} />
        <HeldBook S={SCENE} />
        <Printout S={SCENE} held={1} />
        <Pencil S={SCENE} />
        <HeldAtlas S={SCENE} />
        <Drill S={SCENE} />
        <MagicBook S={SCENE} />
        <Animated.View style={[styles.world, roadOn]}>
          <Wheel S={SCENE} x={112} />
          <Wheel S={SCENE} x={300} />
          <Car S={SCENE} part="out" />
        </Animated.View>
        {/* ── THE ATLAS, CLOSE UP ── */}
        <Animated.View style={[styles.world, atlasOn]}>
          <AtlasClose S={SCENE} />
        </Animated.View>
      </Animated.View>
      <Veil S={SCENE} />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={ITEM_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={PIN_Q} k="q2" /> : null}
    </View>
  );
}

// ── the office ───────────────────────────────────────────────────────────────

/** A red beacon on a mast, blinking. */
function Beacon({ S, x, y, k }: { S: SharedValue<any>; x: number; y: number; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: Math.sin(S.value.t * 2.2 + k * 1.3) > 0.3 ? 1 : 0.15, transform: [{ translateX: x }, { translateY: y }] }));
  return <Animated.View style={[styles.rider, st]}><View style={styles.beacon} /></Animated.View>;
}
/** A plane's light crossing the sky, slowly. */
function Plane({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const p = (S.value.t * 0.022) % 1;
    return { opacity: Math.sin(S.value.t * 5) > 0 ? 1 : 0.4, transform: [{ translateX: 40 + 320 * p }, { translateY: 262 - 18 * p }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.plane} /></Animated.View>;
}
/** The glass door, swinging open on its hinge (the left edge). */
function GlassDoor({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: DOOR.x }, { translateY: DOOR.y }, { scaleX: 1 - 0.78 * S.value.door }] }));
  return <Animated.View style={[styles.hinge, st]}><LessonPicture name="amazon1-door" /></Animated.View>;
}
/** The printer's head running back and forth across the slot while it prints. */
function Printhead({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.head, transform: [{ translateX: 298 + 7 * (1 - Math.cos(S.value.t * 9)) }, { translateY: DESK_TOP - 12.5 }] }));
  return <Animated.View style={[styles.rider, st]}><View style={styles.printhead} /></Animated.View>;
}
/** The shelf's two rows of books, revealed from the left as it fills, on past the frame. */
function ShelfBooks({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ width: 1 + 151 * S.value.shelf }));
  return (
    <Animated.View style={[styles.shelfClip, st]}>
      <View style={[styles.rider, { top: SHELF.top - 470 }]}><LessonPicture name="amazon1-books-top" /></View>
      <View style={[styles.rider, { top: SHELF.low - 470 }]}><LessonPicture name="amazon1-books-low" /></View>
    </Animated.View>
  );
}
/** Copies flying off the book onto the shelf when the book is the answer. */
const FLY = [0, 0.1, 0.2, 0.3, 0.4];
function FlyingBooks({ S }: { S: SharedValue<any> }) {
  return <>{FLY.map((d, k) => <FlyBook key={k} S={S} d={d} k={k} />)}</>;
}
function FlyBook({ S, d, k }: { S: SharedValue<any>; d: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const f = clamp01((S.value.rBook - d) / 0.42);
    const tx = lerp(242, SHELF.x + 6 + k * 9, f);
    const ty = lerp(DESK_TOP - 2, k % 2 ? SHELF.low - 1 : SHELF.top - 1, f) - 34 * Math.sin(Math.PI * f);
    return { opacity: f > 0 && f < 1 ? 1 : 0, transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${360 * f}deg` }, { scale: 0.8 }] };
  });
  return <Animated.View style={[styles.rider, st]}><LessonPicture name="amazon1-book" /></Animated.View>;
}
/** The software box, the CD and the book on the desk. A wrong pick jumps and tips over; the book hops. */
function DeskItems({ S }: { S: SharedValue<any> }) {
  return <>{ITEMS.map((it) => <DeskItem key={it.id} S={S} id={it.id} x={it.x} pic={it.pic} />)}</>;
}
function DeskItem({ S, id, x, pic }: { S: SharedValue<any>; id: string; x: number; pic: string }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    if (id === 'books') {
      const b = v.bk;
      const hop = v.rBook > 0 && v.rBook < 1 ? Math.abs(Math.sin(v.rBook * Math.PI * 3)) * (1 - v.rBook) * 6 : 0;
      return { opacity: b.o * (b.held ? 0 : 1), transform: [{ translateX: b.x }, { translateY: b.y - hop }] };
    }
    const r = id === 'software' ? v.rSoft : v.rCd;
    const tip = clamp01(r * 1.6);
    const hop = r > 0 && r < 0.4 ? Math.sin((r / 0.4) * Math.PI) * 6 : 0;
    // a wrong pick: up, a wobble, and over on its back
    return {
      opacity: v.place === 0 ? 1 : 0,
      transform: [{ translateX: x + 6 * tip }, { translateY: DESK_TOP - hop }, { rotate: `${92 * sm(tip) + 6 * Math.sin(r * 30) * (1 - tip)}deg` }],
    };
  });
  return <Animated.View nativeID={`am1-${id}`} style={[styles.rider, st]}><LessonPicture name={pic} /></Animated.View>;
}
/** The book in his hand (b5–b7), drawn over him. */
function HeldBook({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const b = S.value.bk;
    return { opacity: b.o * b.held, transform: [{ translateX: b.x }, { translateY: b.y }, { rotate: '-8deg' }] };
  });
  return <Animated.View nativeID="am1-heldbook" style={[styles.rider, st]}><LessonPicture name="amazon1-book" /></Animated.View>;
}
/** The printout: torn off, held, pinned on the cork board. */
function Printout({ S, held }: { S: SharedValue<any>; held: 0 | 1 }) {
  const st = useAnimatedStyle(() => {
    const p = S.value.pr;
    const pinned = p.s < 0.99 ? 1 : 0;
    return { opacity: p.o * (pinned === 1 - held ? 1 : 0), transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.s }] };
  });
  return (
    <Animated.View nativeID={held ? 'am1-printout-held' : 'am1-printout'} style={[styles.rider, st]}>
      <LessonPicture name="amazon1-printout" />
      <View style={styles.pushpin} />
    </Animated.View>
  );
}
/** Shaw's overcoat: over his forearm, then hung over the desk's corner. */
function Coat({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const c = S.value.coat;
    return { opacity: c.o, transform: [{ translateX: c.x }, { translateY: c.y }] };
  });
  return <Animated.View style={[styles.rider, st]}><LessonPicture name="amazon1-coat" /></Animated.View>;
}
/** The cardboard box of his things: on the floor, then in his arms. */
function CardBox({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.box;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }] };
  });
  return <Animated.View nativeID="am1-box" style={[styles.rider, st]}><LessonPicture name="amazon1-box" /></Animated.View>;
}
/** The yellow pencil in his right hand. */
function Pencil({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const p = S.value.pen;
    return { opacity: p.o, transform: [{ translateX: p.x }, { translateY: p.y }, { rotate: `${p.d < 0 ? -128 : -52}deg` }] };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.pencil} />
      <View style={styles.pencilTip} />
    </Animated.View>
  );
}

// ── the road ─────────────────────────────────────────────────────────────────

/** A long strip that scrolls left as the car goes on (it wraps at 400). */
function Strip({ S, k, pic }: { S: SharedValue<any>; k: 'scrollX' | 'dashX'; pic: string }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: -S.value[k] }] }));
  return <Animated.View style={[styles.world, st]}><LessonPicture name={pic} /></Animated.View>;
}
/** The Cascades and Rainier over the Sound, rising ahead once the city is Seattle. */
function Ahead({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.ahead, transform: [{ translateY: 14 * (1 - S.value.ahead) }] }));
  return <Animated.View style={[styles.world, st]}><LessonPicture name="amazon1-cascades" /></Animated.View>;
}
/** The Blazer: its inside (behind the people) or its near flank (in front), riding the bounce. */
function Car({ S, part }: { S: SharedValue<any>; part: 'in' | 'out' }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: 0.7 * Math.sin(S.value.t * 7.1) + 0.45 * Math.sin(S.value.t * 3.3 + 1) }] }));
  return <Animated.View style={[styles.world, st]}><LessonPicture name={part === 'in' ? 'amazon1-car-in' : 'amazon1-car-out'} /></Animated.View>;
}
function Wheel({ S, x }: { S: SharedValue<any>; x: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x }, { translateY: 477 }, { rotate: `${S.value.spin}deg` }] }));
  return <Animated.View style={[styles.rider, st]}><LessonPicture name="amazon1-wheel" /></Animated.View>;
}
/** The atlas lying open on the dashboard (not while it is up in his hands). */
function AtlasDash({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.atlas;
    return { opacity: a.o * (a.up > 0.5 ? 0 : 1), transform: [{ translateX: ATLAS_DASH.x }, { translateY: a.y }, { scaleX: 1 - 0.5 * a.fold }] };
  });
  return <Animated.View style={[styles.rider, st]}><LessonPicture name="amazon1-atlas-dash" /></Animated.View>;
}
/** The atlas up in his hands, folding shut on the Seattle page. */
function HeldAtlas({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.atlas;
    return { opacity: a.o * (a.up > 0.5 ? 1 : 0), transform: [{ translateX: a.x }, { translateY: a.y }, { scaleX: 1 - 0.5 * a.fold }] };
  });
  return <Animated.View nativeID="am1-atlas" style={[styles.rider, st]}><LessonPicture name="amazon1-atlas-held" /></Animated.View>;
}
/** The laptop on his knees, turned with him; the spreadsheet's live row. */
function Laptop({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const l = S.value.lap;
    return { opacity: l.o, transform: [{ translateX: l.x }, { translateY: l.y }, { scaleX: l.d < 0 ? 1 : -1 }, { translateX: -16 }] };
  });
  const row = useAnimatedStyle(() => ({ transform: [{ translateY: -17.4 + 2.4 * S.value.cellRow }] }));
  return (
    <Animated.View nativeID="am1-laptop" style={[styles.rider, st]}>
      <LessonPicture name="amazon1-laptop" />
      <Animated.View style={[styles.cell, row]} />
    </Animated.View>
  );
}

// ── the atlas, close up ──────────────────────────────────────────────────────

function AtlasClose({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 6 * S.value.jolt }, { rotate: `${0.8 * S.value.jolt}deg` }] }));
  const dest = useAnimatedStyle(() => ({ opacity: clamp01(S.value.rSea * 1.4 - 0.3) }));
  return (
    <Animated.View style={[styles.world, st]}>
      <LessonPicture name="amazon1-insert" />
      <Animated.View style={[styles.world, dest]}><LessonPicture name="amazon1-insert-dest" /></Animated.View>
      <Route S={S} />
      {PINS.map((p) => <MapPin key={p.id} S={S} id={p.id} x={p.x} y={p.y} />)}
    </Animated.View>
  );
}
/** The pencil route drawn on from where they are to Seattle, dot by dot. */
const ROUTE = Array.from({ length: 9 }, (_, k) => {
  const f = (k + 1) / 10;
  return { f, x: lerp(HERE.x, PINS[0].x, f) - 10 * Math.sin(Math.PI * f), y: lerp(HERE.y, PINS[0].y, f) - 6 * Math.sin(Math.PI * f) };
});
function Route({ S }: { S: SharedValue<any> }) {
  return <>{ROUTE.map((r, k) => <RouteDot key={k} S={S} f={r.f} x={r.x} y={r.y} />)}</>;
}
function RouteDot({ S, f, x, y }: { S: SharedValue<any>; f: number; x: number; y: number }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.rSea > f * 0.8 ? 1 : 0, transform: [{ translateX: x }, { translateY: y }] }));
  return <Animated.View style={[styles.rider, st]}><View style={styles.routeDot} /></Animated.View>;
}
/** A map pin: Seattle lifts a little flag when it is right; a wrong one jumps out and falls. */
function MapPin({ S, id, x, y }: { S: SharedValue<any>; id: string; x: number; y: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    if (id === 'seattle') {
      const r = v.rSea;
      const pop = r > 0 && r < 0.5 ? Math.sin((r / 0.5) * Math.PI) * 6 : 0;
      return { opacity: 1, transform: [{ translateX: x }, { translateY: y - pop }, { scale: 1 + 0.25 * Math.sin(Math.PI * Math.min(1, r * 2)) }] };
    }
    const r = id === 'sf' ? v.rSf : v.rBoul;
    // out of the paper with a jump, then a tumble off the page and down the dash
    const up = r < 0.25 ? Math.sin((r / 0.25) * (Math.PI / 2)) * 22 : 22 - 900 * (r - 0.25) * (r - 0.25);
    return {
      opacity: r < 0.97 ? 1 : 0,
      transform: [{ translateX: x - 70 * Math.max(0, r - 0.25) }, { translateY: y - up }, { rotate: `${-420 * Math.max(0, r - 0.15)}deg` }],
    };
  });
  const flag = useAnimatedStyle(() => ({ opacity: id === 'seattle' ? clamp01(S.value.rSea * 2 - 0.4) : 0, transform: [{ scaleX: clamp01(S.value.rSea * 2 - 0.4) }] }));
  return (
    <Animated.View nativeID={`am1-pin-${id}`} style={[styles.rider, st]}>
      <Animated.View style={[styles.flag, flag]} />
      <LessonPicture name="amazon1-pin" />
    </Animated.View>
  );
}

// ── the garage ───────────────────────────────────────────────────────────────

/** Rain running down the garage door's windows. */
const DROPS = [[134, 0], [152, 0.4], [176, 0.8], [196, 0.2], [214, 0.6], [236, 0.9], [258, 0.3], [276, 0.7]] as const;
function Rain({ S }: { S: SharedValue<any> }) {
  return <>{DROPS.map(([x, ph], k) => <Drop key={k} S={S} x={x} ph={ph} />)}</>;
}
function Drop({ S, x, ph }: { S: SharedValue<any>; x: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const f = (S.value.t * 0.7 + ph) % 1;
    return { opacity: Math.sin(Math.PI * f), transform: [{ translateX: x - 2 * f }, { translateY: 304 + 12 * f }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.drop} /></Animated.View>;
}
/** The back door swinging open and shut as Kaphan comes in. */
function BackDoor({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 62 }, { translateY: 336 }, { scaleX: 1 - 0.8 * S.value.backDoor }] }));
  return <Animated.View style={[styles.hinge, st]}><LessonPicture name="amazon1-backdoor" /></Animated.View>;
}
/** The fire through the stove's round draught, flickering. */
function StoveFire({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const f = 0.82 + 0.12 * Math.sin(t * 8.3) + 0.08 * Math.sin(t * 13.1 + 1);
    return { transform: [{ translateX: STOVE.x }, { translateY: STOVE.y }, { scale: f * (1 + 0.25 * S.value.night) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.fire} />
      <View style={styles.fireCore} />
    </Animated.View>
  );
}
/** The CADABRA sign: on her knees, up in her hands, on its nail. */
function Sign({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const g = S.value.sign;
    return { opacity: g.o, transform: [{ translateX: g.x }, { translateY: g.y }] };
  });
  const str = useAnimatedStyle(() => ({ opacity: Math.abs(S.value.sign.y - SIGN.y) < 0.5 ? 1 : 0 }));
  return (
    <Animated.View nativeID="am1-sign" style={[styles.rider, st]}>
      <Animated.View style={[styles.signString, str]} />
      <View style={styles.signCard}>
        <Text style={styles.signText}>CADABRA</Text>
      </View>
    </Animated.View>
  );
}
/** Her paintbrush, lettering the sign. */
function Brush({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const p = S.value.brushAt;
    return { opacity: p.o, transform: [{ translateX: p.x }, { translateY: p.y }, { rotate: '-40deg' }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.brush} /><View style={styles.brushTip} /></Animated.View>;
}
/** The door: leaning on the stack, lifted and turned flat, carried, laid on the sawhorses. */
function DoorPlank({ S }: { S: SharedValue<any> }) {
  const face = useAnimatedStyle(() => {
    const d = S.value.dr;
    return { opacity: d.o * (1 - d.flat), transform: [{ translateX: d.x }, { translateY: d.y }, { rotate: `${d.r}deg` }, { scaleY: d.sy }] };
  });
  const top = useAnimatedStyle(() => {
    const d = S.value.dr;
    return { opacity: d.o * d.flat, transform: [{ translateX: DESK2.x }, { translateY: DESK2.y }] };
  });
  return (
    <>
      <Animated.View nativeID="am1-doorplank" style={[styles.rider, face]}><LessonPicture name="amazon1-door-face" /></Animated.View>
      <Animated.View style={[styles.rider, top]}><LessonPicture name="amazon1-door-top" /></Animated.View>
    </>
  );
}
/** The door desk's legs: the near one drilled on (b17), the far one by night. */
function Legs({ S }: { S: SharedValue<any> }) {
  const a = useAnimatedStyle(() => ({ opacity: S.value.leg1, transform: [{ translateX: 262 }, { translateY: DESK2.y }] }));
  const z = useAnimatedStyle(() => ({ opacity: S.value.leg2, transform: [{ translateX: 130 }, { translateY: DESK2.y }] }));
  return (
    <>
      <Animated.View style={[styles.rider, a]}><LessonPicture name="amazon1-leg" /></Animated.View>
      <Animated.View style={[styles.rider, z]}><LessonPicture name="amazon1-leg" /></Animated.View>
    </>
  );
}
/** The workstation on the finished desk, by night. */
function Workstation({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.night, transform: [{ translateX: DESK2.x - 18 }, { translateY: DESK2.y - 10 }] }));
  return <Animated.View style={[styles.rider, st]}><LessonPicture name="amazon1-workstation" /></Animated.View>;
}
/** The drill in his hand, its sawdust while it bites. */
function Drill({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const d = S.value.drill;
    return { opacity: d.o, transform: [{ translateX: d.x }, { translateY: d.y + 3 }, { rotate: `${2 * Math.sin(S.value.t * 60) * d.spin}deg` }] };
  });
  const dust = useAnimatedStyle(() => ({ opacity: S.value.drill.spin, transform: [{ translateY: -18 - 3 * Math.abs(Math.sin(S.value.t * 20)) }] }));
  return (
    <Animated.View style={[styles.rider, st]}>
      <LessonPicture name="amazon1-drill" />
      <Animated.View style={[styles.dust, dust]} />
    </Animated.View>
  );
}
/** The book that appears in his raised hand, like magic. */
function MagicBook({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const m = S.value.book2;
    const pop = m.s > 0 && m.s < 1 ? 1 + 0.4 * Math.sin(Math.PI * m.s) : 1;
    return { opacity: m.o * (m.s > 0.02 ? 1 : 0), transform: [{ translateX: m.x }, { translateY: m.y }, { scale: 0.9 * m.s * pop }] };
  });
  return <Animated.View nativeID="am1-magicbook" style={[styles.rider, st]}><LessonPicture name="amazon1-book" /></Animated.View>;
}
/** Kaphan's backpack, on his back. */
function Pack({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const p = S.value.pack;
    return { opacity: p.o, transform: [{ translateX: p.x }, { translateY: p.y }, { scaleX: p.d < 0 ? -1 : 1 }] };
  });
  return <Animated.View style={[styles.rider, st]}><LessonPicture name="amazon1-backpack" /></Animated.View>;
}

/** The dark under a cut, and on a step back. */
function Veil({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.dark }));
  return <Animated.View style={[styles.veil, st]} pointerEvents="none" />;
}

// ── the two games ────────────────────────────────────────────────────────────

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/** Stage (screen) x and y of a world point in a beat's shot. */
function inShot(shot: readonly number[], x: number, y: number) {
  const s = shot[0];
  const hx = 200 / s;
  const hy = 150 / s;
  const cx = Math.min(400 - hx, Math.max(hx, shot[1]));
  const cy = Math.min(514 - hy, Math.max(214 + hy, shot[2]));
  return { x: 200 + (x - cx) * s, y: 364 + (y - cy) * s };
}
/**
 * STOCK THE SHELF: the software box, the CD or the book. Each box covers its thing and
 * reaches up over it, so the verdict seal (top right) lands in the air, never on the thing.
 */
const ITEM_Q: Q[] = ITEMS.map((it) => {
  const p = inShot(SHOTS[Q1N], it.x, DESK_TOP);
  return { id: it.id, left: p.x - 19, top: p.y - 64, w: 38, h: 70, r: 6, correct: it.id === 'books' };
});
/** PIN THE MAP: Seattle, San Francisco or Boulder (the close-up fills the band). */
const PIN_Q: Q[] = PINS.map((p) => ({ id: p.id, left: p.x - 14, top: p.y - 34, w: 40, h: 40, r: 8, correct: p.id === 'seattle' }));
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} nativeID={`am1-q-${q.id}`} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
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
  world: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  hinge: { position: 'absolute', left: 0, top: 0, width: 52, height: 0, transformOrigin: '0% 0%' },
  veil: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.amazon1Veil.base },
  nightVeil: { position: 'absolute', left: 0, top: 214, width: STAGE_W, height: 300, backgroundColor: W.amazon1Veil.base, opacity: 0.3 },
  beacon: { position: 'absolute', left: -1.4, top: -1.4, width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: W.amazon1Beacon.base },
  plane: { position: 'absolute', left: -1, top: -1, width: 2, height: 2, borderRadius: 1, backgroundColor: W.amazon1Plane.base },
  printhead: { position: 'absolute', left: -2, top: -1.2, width: 4, height: 2.4, borderRadius: 0.6, backgroundColor: W.amazon1Printhead.base },
  shelfClip: { position: 'absolute', left: SHELF.x, top: 470, height: 31, overflow: 'hidden' },
  pushpin: { position: 'absolute', left: -1.8, top: -21.6, width: 3.6, height: 3.6, borderRadius: 1.8, backgroundColor: W.amazon1Beacon.shade, borderWidth: 0.5, borderColor: INK },
  pencil: { position: 'absolute', left: -1, top: -14, width: 2.2, height: 13, borderRadius: 0.6, backgroundColor: W.amazon1Pencil.base, borderWidth: 0.4, borderColor: W.amazon1Pencil.shade },
  pencilTip: { position: 'absolute', left: -0.5, top: -16.4, width: 1.2, height: 2.6, borderRadius: 0.6, backgroundColor: W.amazon1Lead.base },
  cell: { position: 'absolute', left: 6.4, top: 0, width: 13.6, height: 1.6, backgroundColor: W.amazon1Cell.base, opacity: 0.85 },
  routeDot: { position: 'absolute', left: -1.4, top: -1.4, width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: W.amazon1Route.base },
  flag: { position: 'absolute', left: 5, top: -24, width: 11, height: 7, backgroundColor: W.amazon1Flag.base, borderWidth: 0.6, borderColor: INK, transformOrigin: '0% 50%' },
  drop: { position: 'absolute', left: -0.4, top: -2.5, width: 0.8, height: 5, borderRadius: 0.4, backgroundColor: W.amazon1Rain.base },
  fire: { position: 'absolute', left: -4, top: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: W.amazon1Flame.base },
  fireCore: { position: 'absolute', left: -2.2, top: -2.2, width: 4.4, height: 4.4, borderRadius: 2.2, backgroundColor: W.amazon1FlameCore.base },
  signString: { position: 'absolute', left: -1, top: -10, width: 2, height: 1, backgroundColor: W.amazon1String.base },
  signCard: {
    position: 'absolute', left: -31, top: -10, width: 62, height: 20, borderRadius: 2, backgroundColor: W.amazon1Card.base,
    borderWidth: 1, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  signText: { width: 60, fontFamily: 'Caveat_700Bold', fontSize: 15, lineHeight: 17, color: W.amazon1Card.label, textAlign: 'center', includeFontPadding: false },
  brush: { position: 'absolute', left: -1, top: -12, width: 2, height: 12, borderRadius: 1, backgroundColor: W.amazon1Brush.base },
  brushTip: { position: 'absolute', left: -1.4, top: -15, width: 2.8, height: 3.6, borderRadius: 1.2, backgroundColor: W.amazon1Card.label },
  dust: { position: 'absolute', left: 12, top: 0, width: 5, height: 3, borderRadius: 1.5, backgroundColor: W.amazon1Dust.base },
  deskShadow: { position: 'absolute', left: 146, top: 497, width: 176, height: 6, borderRadius: 3, backgroundColor: SHADE, opacity: 0.5 },
  carShadow: { position: 'absolute', left: 48, top: 497, width: 330, height: 7, borderRadius: 3.5, backgroundColor: SHADE, opacity: 0.55 },
  benchShadow: { position: 'absolute', left: 120, top: 497, width: 152, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.45 },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-09 — STOCK THE SHELF (the software box, the CD and the book on
// the desk, pushed in at 1.5 with the bookcase at the frame's edge) and PIN THE MAP (the three pins on the
// atlas close-up) read whole, answered right and wrong, on the q1wrong / q2wrong / all sheets.
export function Amazon1Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson} beats={BEATS} Scene={Amazon1Scene} band={[214, 514]}
      roles={{
        plain: { head: [], label: 'Jeff Bezos' },
        tophat: { head: SHAW_HEAD, label: 'David Shaw' },
        bun: { head: BY_ID.bun.pieces, label: 'MacKenzie Bezos' },
        cap: { head: KAPHAN_HEAD, label: 'Shel Kaphan' },
      }}
    />
  );
}
