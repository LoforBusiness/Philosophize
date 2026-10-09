import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './hist7Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { PLATE_FACE, lipOf } from './stageSkin';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-7, "History Recap: The Archive and the Dig" — A MUSEUM'S RECORD
// ROOM, THEN THE MUSEUM'S DIG AMONG THE RUINS OF AN OLD GREEK TOWN. The recap of the
// road's six lessons.
//
// A DIALOGUE lesson (LESSON_RULES group AP): two people talk and nobody narrates. The
// historian (the top hat) works alone through the boxes about a town that burned in 1890;
// the new volunteer (the bun) arrives keen to help and gets each idea a little wrong.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// hist7.mjs) laid in ONE WORLD 800 wide: the record room at x 0–400, the dig at x 400–800.
// The scene's own camera is the world's translation, `cam`: 0 in the room, −400 at the dig,
// cut under a quick fade through the colour of the dust at the start of b11. Figures are
// posed in SCREEN space (world x + cam).
//
//   ROOM, far → near: the ceiling and its beams, three high windows over the town's roofs,
//   the plaster wall and its wainscot, the door 19–57 × 377–472 (the leaf swings), a clock
//   over it at (38, 344), the CORKBOARD 96–320 × 291–389 with the old town map 106–214 (the
//   rows of wooden houses packed close at the left, the bakery at 189, 326), the steel
//   SHELVES 346–400 (an empty slot at desk height, 451), the board floor from 472, two
//   pendant lamps. The OAK DESK 148–344 × 451–500 is drawn over their legs; on it the fire's
//   BOX 186–218 (the notebook at 199 and the booklet at 192 stand in it), the green-shaded
//   lamp at 270 over the blotter (the notebook is laid open at 256), the PAINTING at 284,
//   the ink pad and stamp at 312, his own BOX at 330. The waste-paper basket 136–156.
//   DIG (its own x 0–400): the hot sky, hazy mountains, a broken temple on the left ridge,
//   the village and its church on the right hill, the olive grove; the dusty plain with
//   ruined walls, the WELL at 70 (frame 40–100 × 398–456, wellhead 49–91 × 456–486, the
//   villager at 36), the FALLEN COLUMN 120–176 × 470–490, the carved STONE 220–242 ×
//   384–474 on its base, the TICKET HUT 318–386 × 412–488, the TRENCH 168–254 × 494–514
//   (its front drawn over her knees).
//
//   b0   alone, facing his box: slides the lid aside, takes out a letter (paper 1.1s),
//        reads it through the glass, writes the label (pencil 2.5s), stamps it (stamp
//        3.9s), puts the lid back, pushes the box along into its slot (book 5.2s), turns,
//        walks back to the middle of the desk saying his line, taps his chin, looks up.
//   b1   the door swings open; she comes in waving and leans on the desk.
//   b2   he taps the papers in the open box, twice.
//   b3   she lifts the notebook out (paper 0.9s), sniffs it, turns and holds it over the basket.
//   b4   she turns back and holds it out; he takes it, turns to the lamp, lays it down and
//        opens it, and turns back.                b5   Q1 STAMP IT PRIMARY.
//   b6   she pulls the booklet out of the box (book 0.4s) and holds it up.
//   b7   she turns it round; he taps the date on its back cover.
//   b8   she puts it back and folds her arms.     b9   he points along the map.
//   b10  Q2 PIN THE SLOW CAUSE.
//   b11  the fade to the dig: she kneels at the trench and lifts the disc out (clay 0.6s), rises.
//   b12  she holds it out; he takes it and holds it up to the light.
//   b13  she turns and points at the villager lowering her bucket.
//   b14  he gestures at the well, looks down at the column, and back.   b15 Q3 TAG WHAT STAYED.
//   b16  she brushes the dust off the carving, twice.
//   b17  he taps the carving, then points away over the hills.   b18  both sit at ease.
//
// SIMPLE ON PURPOSE (AP7): two figures, each its own phase (N22), each faces whom they talk
// to, and every hand that moves lifts, reads, writes, stamps, pushes, holds, taps or points.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('history');
const { SHADE } = TONE;
const W = NATURAL;
const TR = 0.85;
const K = K_FIG * 0.78;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.2s) and the line together. */
const LINES = [8.88, 4.33, 5.88, 4.37, 6.11, 0, 6.27, 8.19, 3.76, 7.26, 0, 5.02, 7.1, 6.08, 6.83, 0, 5.53, 6.59, 0, 0];

const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const KNEEL = 13;
const SIT = 3;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const WORK = at('work');
const ARRIVE = at('arrive');
const EVIDENCE = at('evidence');
const NOTEBOOK = at('notebook');
const PRIMARY = at('primary');
const BOOKLET = at('booklet');
const COUNCIL = at('council');
const SULK = at('sulk');
const CAUSES = at('causes');
const DIG = at('dig');
const BALLOT = at('ballot');
const WELL = at('well');
const STAYS = at('stays');
const CARVING = at('carving');
const CHECK = at('check');
const REST = at('rest');
const Q1 = BEATS.map((b) => (b.stamp ? 1 : 0));
const Q2 = BEATS.map((b) => (b.cause ? 1 : 0));
const Q3 = BEATS.map((b) => (b.tag ? 1 : 0));
/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 8.88;
}

type Track = readonly (readonly number[])[];
/** A hand's path across a line: [share of line, x in front of the figure (its own frame), stage y, weight]. */
type Key = readonly [number, number, number, number];
const NONE: readonly Key[] = [];
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));

// ── where everybody stands (WORLD x; the dig is x + 400) ─────────────────────
const HX = 400;
const TH_WORK = 318;
const TH_PUSH = 350;
const TH_HOME = 222;
const BN_OFF = -30;
const BN_HOME = 164;
const BN_DIG = HX + 200;
const TH_DIG = HX + 262;
/** The cut to the dig, seconds into b11, under the fade. */
const CUT = 0.22;

/** Each figure's walks on a beat: [share of the line it starts at, where to]; several legs run in turn. */
const TH_LEGS: Track[] = per((n) => (n === WORK ? [[S0(4.35), TH_PUSH], [S0(5.75), TH_HOME]]
  : n === PRIMARY ? [[0.32, TH_HOME + 18], [0.74, TH_HOME]]
  : n < DIG ? [[0, TH_HOME]] : [[0, TH_DIG]]));
const BN_LEGS: Track[] = per((n) => (n < ARRIVE ? [[0, BN_OFF]] : n === ARRIVE ? [[0.02, BN_HOME]]
  : n < DIG ? [[0, BN_HOME]] : [[0, BN_DIG]]));
/** Scripted turns: [share, facing]. A beat that walks twice turns only with its walks. */
const TH_TURN: Track[] = per((n) => (n === WORK || n === PRIMARY ? [] : [[0, -1]]));
const BN_TURN: Track[] = per((n) => (n === NOTEBOOK ? [[0, 1], [0.4, -1], [0.86, 1]]
  : n === WELL ? [[0, 1], [0.04, -1], [0.72, 1]] : [[0, 1]]));
const TH_P = per((n) => (BEATS[n].speaker === 'tophat' ? (n % 2 ? TALK : EXPLAIN) : NOD));
const BN_P = per((n) => (BEATS[n].speaker === 'bun' ? TALK : NOD));

// ── things on the desk (world = screen in the room) ─────────────────────────
// THE DESK IS LOW (2026-10-08): its top at y 460, 40 over the floor, at their hips, and drawn
// BEHIND them; everything on it sits DESK_DY lower than when it stood at 451.
const DESK_DY = 9;
const FIREBOX = { x: 186, y: 460 };
const NB_BOX = { x: 183, y: 455 };       // the notebook standing in the box
const NB_LAID = { x: 262, y: 459 };      // laid open under the lamp
const BK_BOX = { x: 186, y: 449 };       // the booklet standing up out of the box, in full view
const PAINT = { x: 292, y: 460 };
const PAD = { x: 312, y: 456.6 };
const BOXA = { x0: 340, x1: 372, y: 460 };
// ── the corkboard ────────────────────────────────────────────────────────────
const CARD_X = 264;
const CARD_W = 88;
const CARDS = [
  { id: 'houses', y: 312, lines: ['WOODEN HOUSES', 'PACKED CLOSE'], correct: true },
  { id: 'oven', y: 340, lines: ['THE OVEN LEFT', 'BURNING'], correct: false },
  { id: 'wind', y: 368, lines: ['A STRONG WIND', 'THAT NIGHT'], correct: false },
] as const;
const HOUSES = { x: 124, y: 318 };
// ── the dig (its own x; on screen at the dig, cam = −400) ────────────────────
const SPOTS: Record<string, { x: number; y: number }> = { well: { x: 84, y: 450 }, column: { x: 146, y: 470 }, hut: { x: 346, y: 460 } };

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { booklet: 1, painting: 2, notebook: 3, houses: 4, oven: 5, wind: 6, well: 7, column: 8, hut: 9 };

function smooth01(u: number): number {
  'worklet';
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/** A hand path read at share `u` of its line. */
function keyAt(keys: readonly Key[], u: number) {
  'worklet';
  const first = keys[0];
  if (u <= first[0]) return { lx: first[1], y: first[2], w: first[3] };
  for (let k = 1; k < keys.length; k += 1) {
    const z = keys[k];
    if (u <= z[0]) {
      const a = keys[k - 1];
      const s = smooth01((u - a[0]) / Math.max(1e-6, z[0] - a[0]));
      return { lx: lerp(a[1], z[1], s), y: lerp(a[2], z[2], s), w: lerp(a[3], z[3], s) };
    }
  }
  const e = keys[keys.length - 1];
  return { lx: e[1], y: e[2], w: e[3] };
}
function hHold(code: number, t: number, phase?: number): Stance {
  'worklet';
  return emoteStill(code, t, phase);
}
function hLive(code: number, t: number, bt: number, phase?: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt, phase);
}
function hand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A hand on its path for this beat, in the figure's own frame (AR7.2). */
function keyed(s: Stance, keys: readonly Key[], u: number, x: number, d: number, which: 1 | -1, desk = false): Stance {
  'worklet';
  if (keys.length === 0) return s;
  const k = keyAt(keys, u);
  // in the room a hand working at the desk works DESK_DY lower, ramped in so a path is never cut
  const y = desk ? k.y + DESK_DY * clamp01((k.y - 428) / 10) : k.y;
  return hand(s, x, GROUND, d, which, x + k.lx * (d < 0 ? -1 : 1), y, k.w);
}
/** A look: the head up (negative) or down (positive). */
function look(s: Stance, v: number): Stance {
  'worklet';
  return v === 0 ? s : { ...s, neck: s.neck + v };
}
/** How long a figure takes to turn round through a profile before he sets off. */
const TURN_S = 0.36;
/**
 * A walk from `src` to `to` that starts `start` seconds into the beat — later if he is
 * facing the wrong way and must turn first (C18: he always walks forwards). Eased in and
 * out, and the gait is driven by the same eased distance, so the feet stay planted.
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
/** The beat's walks, one leg after another, from where he is; and which way he faced as this leg began. */
function legsOf(src: number, legs: Track, b: number, L: number, faceSrc: number) {
  'worklet';
  let x = src;
  let f = faceSrc;
  for (let k = 0; k < legs.length; k += 1) {
    const w = walkOf(x, legs[k][1], legs[k][0] * L, f, b);
    if (k === legs.length - 1 || b < w.we) return { w, f };
    if (w.wd !== 0) f = w.wd;
    x = legs[k][1];
  }
  return { w: walkOf(x, x, 0, f, b), f };
}
/**
 * Which way a figure faces at time `b`: the scripted turns, eased through a profile — but a
 * walk wins. He turns to face where he is going just before he sets off, and a scripted turn
 * the other way waits until he has arrived.
 */
function faceOf(src: number, turns: Track, b: number, L: number, w: Walk) {
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
/** One figure's body: walking its legs, or holding its pose live. */
function bodyOf(w: Walk, codes: readonly number[], n: number, t: number, b: number, phase?: number): Stance {
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
/** A damped shake: a jolt that dies away over the reaction. */
function shake(r: number, amp: number): number {
  'worklet';
  return r > 0 && r < 1 ? Math.sin(r * 46) * amp * (1 - r) : 0;
}
/** Pop and settle: up past the mark and home again. */
function popOf(r: number): number {
  'worklet';
  return r <= 0 ? 0 : Math.sin(Math.min(1, r * 1.6) * Math.PI) * (1 - 0.4 * r);
}

// ── the hands, beat by beat ──────────────────────────────────────────────────
/** His right hand: the lid, the letter, the pencil, the stamp, the push; the papers; the notebook; the taps; the map; the disc; the carving. */
const TH_R: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    return [[S0(0.3), 8, 452, 0], [S0(0.65), 20, 438, 1], [S0(0.95), 24, 437, 1], [S0(1.1), 24, 444, 1],
      [S0(1.5), 12, 432, 1], [S0(2.2), 12, 432, 1], [S0(2.42), 24, 444, 1], [S0(2.55), 24, 445.6, 1], [S0(3.2), 20, 446, 1],
      [S0(3.45), 12, 446, 1], [S0(3.64), 12, 446, 1], [S0(3.9), 22, 444, 1], [S0(4.15), 12, 446, 1], [S0(4.42), 18, 444, 1],
      [S0(5.2), 18, 444, 1], [S0(5.4), 8, 452, 0], [S0(7.75), 8, 452, 0], [S0(8.0), 5, 430, 1], [S0(8.5), 5, 430, 1], [S0(8.8), 8, 452, 0]];
  }
  if (n === EVIDENCE) return [[0.24, 8, 452, 0], [0.32, 24, 440, 1], [0.38, 24, 444, 1], [0.46, 24, 440, 1], [0.6, 8, 452, 0]];
  if (n === PRIMARY) {
    return [[0.12, 8, 452, 0], [0.19, 26, 446, 1], [0.24, 26, 446, 1], [0.3, 12, 447, 1], [0.42, 12, 447, 1],
      [0.5, 22, 443, 1], [0.58, 22, 443, 1], [0.64, 8, 452, 0]];
  }
  if (n === COUNCIL) return [[0.2, 8, 452, 0], [0.28, 30, 443, 1], [0.33, 30, 446.5, 1], [0.38, 30, 443, 1], [0.48, 8, 452, 0]];
  if (n === CAUSES) return [[0.08, 8, 452, 0], [0.18, 24, 422, 1], [0.36, 24, 422, 1], [0.72, 24, 432, 1], [0.84, 24, 432, 1], [0.95, 8, 452, 0]];
  if (n === BALLOT) return [[0.06, 8, 452, 0], [0.14, 26, 447, 1], [0.2, 22, 447, 1], [0.3, 10, 416, 1], [0.8, 10, 416, 1], [0.92, 10, 448, 1]];
  if (n > BALLOT && n < CHECK) return [[0, 10, 448, 1]];
  if (n === CHECK) return [[0, 10, 448, 1], [0.06, 24, 445, 1], [0.1, 25, 448, 1], [0.14, 24, 445, 1], [0.22, 10, 448, 1]];
  if (n > CHECK) return [[0, 10, 448, 1], [0.2, 10, 448, 0]];
  return NONE;
});
/** His left hand: the glass in b0; the well; pointing off over the hills. */
const TH_L: (readonly Key[])[] = per((n) => {
  if (n === WORK) return [[S0(1.3), 8, 452, 0], [S0(1.45), 8, 444, 1], [S0(1.7), 14, 431, 1], [S0(2.25), 14, 431, 1], [S0(2.45), 8, 444, 1], [S0(2.6), 8, 452, 0]];
  if (n === STAYS) return [[0.12, 8, 452, 0], [0.22, 22, 440, 1], [0.36, 22, 440, 1], [0.46, 8, 452, 0]];
  if (n === CHECK) return [[0.24, 8, 452, 0], [0.36, 22, 420, 1], [0.78, 22, 420, 1], [0.9, 8, 452, 0]];
  return NONE;
});
/** Her right hand: the wave, the lean, the notebook, the booklet; the disc; pointing at the well. */
const BN_R: (readonly Key[])[] = per((n) => {
  if (n === ARRIVE) return [[0.18, 8, 452, 0], [0.26, 10, 420, 1], [0.34, 15, 422, 1], [0.42, 10, 420, 1], [0.5, 15, 422, 1], [0.6, 8, 452, 0], [0.88, 8, 452, 0], [0.96, 22, 451, 1]];
  if (n === EVIDENCE) return [[0, 22, 451, 1], [0.1, 8, 452, 0]];
  if (n === NOTEBOOK) return [[0.06, 8, 452, 0], [0.16, 21, 437, 1], [0.21, 21, 437, 1], [0.33, 14, 426, 1], [0.4, 14, 428, 1], [0.54, 25, 466, 1], [0.78, 25, 466, 1], [0.86, 14, 446, 1]];
  if (n === PRIMARY) return [[0, 14, 446, 1], [0.12, 25, 446, 1], [0.24, 25, 446, 1], [0.34, 8, 452, 0]];
  if (n === BOOKLET) return [[0.02, 8, 452, 0], [0.05, 22, 432, 1], [0.08, 22, 432, 1], [0.22, 24, 422, 1]];
  if (n === COUNCIL) return [[0, 24, 422, 1], [0.1, 25, 446, 1]];
  if (n === SULK) return [[0, 25, 446, 1], [0.12, 15, 440, 1], [0.2, 15, 440, 1], [0.32, 6, 447, 1]];
  if (n === CAUSES || n === CAUSES + 1) return [[0, 6, 447, 1]];
  if (n === DIG) return [[0, 8, 452, 0], [0.04, 20, 488, 1], [0.12, 20, 488, 1], [0.24, 14, 470, 1], [0.6, 14, 470, 1], [0.86, 20, 446, 1]];
  if (n === BALLOT) return [[0, 20, 446, 1], [0.08, 25, 446, 1], [0.2, 25, 446, 1], [0.28, 8, 452, 0]];
  if (n === WELL) return [[0.1, 8, 452, 0], [0.18, 22, 432, 1], [0.6, 22, 432, 1], [0.7, 8, 452, 0]];
  return NONE;
});
/** Her left hand: folded arms; the brush on the carving. */
const BN_L: (readonly Key[])[] = per((n) => {
  if (n === SULK) return [[0.24, 8, 452, 0], [0.34, 5, 449, 1]];
  if (n === CAUSES || n === CAUSES + 1) return [[0, 5, 449, 1]];
  if (n === CARVING) return [[0.08, 8, 452, 0], [0.15, 21, 432, 1], [0.27, 22, 446, 1], [0.33, 21, 432, 1], [0.45, 22, 446, 1], [0.55, 8, 452, 0]];
  return NONE;
});

export default function Hist7Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldT = useHeld();
  const heldB = useHeld();
  const cv = useCarry(21);
  const on = useLinger(i);
  const pk = useSharedValue(0);
  useEffect(() => {
    pk.value = picked ? (PICK[picked] ?? 0) : 0;
  }, [picked, pk]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const trAt = (ph: number) => {
      'worklet';
      return ease01(Math.max(0, b - ph * 0.2) / TR);
    };
    const tr = ease01(b / TR);
    const L = lineOf(LINES, n);
    const u = b / L;
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const hd = (a: number, m: number, z0: number, z1: number) => {
      'worklet';
      return stage(b, L, a, m) * (1 - stage(b, L, z0, z1));
    };
    const q = qv.value;
    const pc = pk.value;
    const ans = (code: number, Q: readonly number[]) => {
      'worklet';
      return Q[n] && pc === code ? q : 0;
    };

    // ── the camera: the room, then (cut under the fade) the dig ─────────────
    // a tap past the cut before it lands puts them at the dig under a fade
    const late = n > DIG && carrySource(cv, 0, n, 0) > -HX + 1;
    const camNow = n < DIG ? 0 : n === DIG ? (b < CUT ? 0 : -HX) : -HX;
    const cam = carry(cv, 0, n, 0, camNow, 1);
    const fade = n === DIG ? stage(b, 1, 0, CUT) * (1 - stage(b, 1, CUT, CUT + 0.32)) : late ? 1 - stage(b, 1, 0, 0.45) : 0;
    const cutDone = n === DIG && b >= CUT;
    const atDig = n > DIG || cutDone;

    // ── the volunteer ───────────────────────────────────────────────────────
    let srcB = carrySource(cv, 1, n, BN_OFF);
    if (late || cutDone) srcB = BN_DIG;
    const fB = carrySource(cv, 2, n, 1);
    const lb = cutDone ? { w: walkOf(BN_DIG, BN_DIG, 0, 1, b), f: 1 } : legsOf(srcB, BN_LEGS[n], b, L, fB);
    const wB = lb.w;
    const xBw = carry(cv, 1, n, wB.x, wB.x, 1);
    const xB = xBw + cam;
    const dB = carry(cv, 2, n, 0, cutDone ? 1 : faceOf(lb.f, BN_TURN[n], b, L, wB), 1);
    let sb = bodyOf(wB, BN_P, n, t, b, 1);
    const kneel = cutDone ? 1 - st(0.62, 0.84) : 0;
    const sitB = n === REST ? st(0.06, 0.4) : n > REST ? 1 : 0;
    if (kneel > 0) sb = mixStance(sb, postureStill(KNEEL, t, 1), kneel);
    if (sitB > 0) sb = mixStance(sb, postureStill(SIT, t, 1), sitB);
    sb = keyed(sb, BN_R[n], u, xB, dB, 1, n < DIG);
    sb = keyed(sb, BN_L[n], u, xB, dB, -1, n < DIG);
    if (n === ARRIVE) sb = look(sb, -0.08 * hd(0.2, 0.3, 0.5, 0.6));
    if (n === NOTEBOOK) sb = look(sb, 0.12 * hd(0.3, 0.38, 0.46, 0.54));
    if (n === BOOKLET) sb = look(sb, -0.1 * hd(0.2, 0.28, 0.8, 0.9));
    if (n === SULK) sb = look(sb, 0.14 * st(0.3, 0.45));
    if (n === CAUSES) sb = look(sb, 0.14 * (1 - st(0, 0.2)) - 0.14 * hd(0.2, 0.32, 0.8, 0.9));
    if (n === DIG) sb = look(sb, 0.12 * hd(0.2, 0.28, 0.5, 0.58));
    if (n === CARVING) sb = look(sb, -0.08 * hd(0.1, 0.18, 0.5, 0.6));
    const prevB = carryFrom(heldB, n, hHold(BN_P[p], t, 1));
    const figB = keepHeld(heldB, wB.walking ? mixKeepLegs(prevB, sb, trAt(1)) : mixStance(prevB, sb, trAt(1)));

    // ── the historian ───────────────────────────────────────────────────────
    let srcT = carrySource(cv, 3, n, TH_WORK);
    if (late || cutDone) srcT = TH_DIG;
    const fT = carrySource(cv, 4, n, 1);
    const lt = cutDone ? { w: walkOf(TH_DIG, TH_DIG, 0, -1, b), f: -1 } : legsOf(srcT, TH_LEGS[n], b, L, fT);
    const wT = lt.w;
    const xTw = carry(cv, 3, n, wT.x, wT.x, 1);
    const xT = xTw + cam;
    const dT = carry(cv, 4, n, 0, cutDone ? -1 : faceOf(lt.f, TH_TURN[n], b, L, wT), 1);
    let sh = bodyOf(wT, TH_P, n, t, b, 0);
    const sitT = n === REST ? st(0.14, 0.5) : n > REST ? 1 : 0;
    if (sitT > 0) sh = mixStance(sh, postureStill(SIT, t, 0), sitT);
    sh = keyed(sh, TH_R[n], u, xT, dT, 1, n < DIG);
    sh = keyed(sh, TH_L[n], u, xT, dT, -1, n < DIG);
    if (n === WORK) {
      const reading = 0.14 * hd(S0(1.5), S0(1.7), S0(2.25), S0(2.45));
      const writing = 0.1 * (hd(S0(2.6), S0(2.75), S0(3.3), S0(3.45)) + hd(S0(3.7), S0(3.85), S0(4.05), S0(4.2)));
      sh = look(sh, reading + writing - 0.18 * stage(b, L, S0(8.25), S0(8.65)));
    }
    if (n === EVIDENCE) sh = look(sh, 0.1 * hd(0.26, 0.32, 0.5, 0.58));
    if (n === PRIMARY) sh = look(sh, 0.12 * hd(0.48, 0.54, 0.62, 0.68));
    if (n === CAUSES) sh = look(sh, -0.16 * hd(0.1, 0.2, 0.84, 0.94));
    if (n === BALLOT) sh = look(sh, -0.16 * hd(0.26, 0.34, 0.8, 0.9));
    if (n === STAYS) sh = look(sh, 0.12 * hd(0.4, 0.48, 0.6, 0.7));
    if (n === CHECK) sh = look(sh, -0.12 * hd(0.3, 0.38, 0.78, 0.88));
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t, 0));
    const figT = keepHeld(heldT, wT.walking ? mixKeepLegs(prevT, sh, trAt(0)) : mixStance(prevT, sh, trAt(0)));

    const bn = pose(figB, xB, GROUND, K, dB, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const tR = wristOf(th, 'wrR');
    const tL = wristOf(th, 'wrL');
    const bR = wristOf(bn, 'wrR');
    const bL = wristOf(bn, 'wrL');

    // ── b0: the lid, the letter, the glass, the pencil, the stamp, the box ───
    const w0 = n === WORK;
    const lidOff = w0 ? stage(b, L, S0(0.65), S0(0.95)) : 1;
    const boxW = carry(cv, 20, n, BOXA.x0, n > WORK ? BOXA.x1 : w0 && b > 4.42 ? Math.min(BOXA.x1, Math.max(BOXA.x0, tR.x - cam + 4)) : BOXA.x0, n > WORK ? tr : 1);
    const letter = w0 ? hd(S0(1.12), S0(1.18), S0(2.42), S0(2.48)) : 0;
    const glassIn = w0 ? hd(S0(1.38), S0(1.46), S0(2.47), S0(2.58)) : 0;
    const pencilIn = w0 ? hd(S0(2.5), S0(2.58), S0(3.4), S0(3.48)) : 0;
    const stampIn = w0 ? hd(S0(3.6), S0(3.64), S0(4.12), S0(4.16)) : 0;
    const labelInk = n > WORK ? 1 : w0 ? stage(b, L, S0(3.88), S0(3.92)) : 0;

    // ── the notebook: in the box, in her hand, in his, laid open ────────────
    let nbHolder = 0; // 0 at rest, 1 hers, 2 his
    if (n === NOTEBOOK) nbHolder = u > 0.2 ? 1 : 0;
    if (n === PRIMARY) nbHolder = u < 0.23 ? 1 : u < 0.58 ? 2 : 0;
    const nbLaid = n > PRIMARY || (n === PRIMARY && u >= 0.58);
    const nbOpen = n === PRIMARY ? st(0.6, 0.66) : n > PRIMARY ? 1 : 0;
    const nbRest = nbLaid ? NB_LAID : NB_BOX;
    const nb = {
      x: nbHolder === 1 ? bR.x : nbHolder === 2 ? tR.x : nbRest.x + cam,
      y: nbHolder === 1 ? bR.y + 7 : nbHolder === 2 ? tR.y + 7 : nbRest.y,
      open: nbOpen,
      tilt: carry(cv, 19, n, 0, n === NOTEBOOK ? -10 * hd(0.56, 0.64, 0.76, 0.84) : 0, tr),
    };
    // ── the booklet: in the box, held up, turned round, back in the box ─────
    const bkHeld = n === BOOKLET ? (u > 0.064 ? 1 : 0) : n === COUNCIL ? 1 : n === SULK ? (u < 0.2 ? 1 : 0) : 0;
    const flip = n === COUNCIL ? st(0.12, 0.2) : n === SULK ? 1 - st(0.06, 0.14) : 0;
    const bk = {
      x: bkHeld ? bR.x : BK_BOX.x + cam,
      y: bkHeld ? bR.y + 9 : BK_BOX.y,
      flip,
    };

    // ── Q1: the stamp flies from its pad to the thing tapped ────────────────
    const rBk = carry(cv, 5, n, 0, ans(1, Q1), tr);
    const rPt = carry(cv, 6, n, 0, ans(2, Q1), tr);
    const rNb = carry(cv, 7, n, 0, ans(3, Q1), tr);
    const rS = Math.max(rBk, rPt, rNb);
    const sTx = rBk > 0 ? BK_BOX.x : rPt > 0 ? PAINT.x : NB_LAID.x;
    const sTy = (rBk > 0 ? 428 : rPt > 0 ? 430 : 438) + DESK_DY;
    let stampX = PAD.x + cam;
    let stampY = PAD.y;
    let stampSq = 1;
    if (stampIn > 0) {
      stampX = lerp(stampX, tR.x, stampIn);
      stampY = lerp(stampY, tR.y + 9, stampIn);
      stampSq = 1 - 0.12 * Math.sin(Math.PI * clamp01((b - 3.86) / 0.16));
    }
    if (rS > 0) {
      const f1 = clamp01(rS / 0.32);
      const f2 = clamp01((rS - 0.32) / 0.12);
      const f3 = clamp01((rS - 0.56) / 0.36);
      const e1 = smooth01(f1);
      const above = sTy - 22;
      if (rS < 0.56) {
        stampX = lerp(PAD.x, sTx, e1);
        stampY = lerp(PAD.y, above, e1) - 26 * Math.sin(Math.PI * e1) + (sTy - above) * f2 * f2;
      } else {
        stampX = lerp(sTx, PAD.x, smooth01(f3));
        stampY = lerp(sTy - 2, PAD.y, smooth01(f3)) - 24 * Math.sin(Math.PI * f3);
      }
      stampSq = rS >= 0.44 && rS < 0.56 ? 1 - 0.14 * Math.sin(((rS - 0.44) / 0.12) * Math.PI) : 1;
    }
    const inked = clamp01((rS - 0.44) / 0.04);

    // ── Q2: the pin and the thread ──────────────────────────────────────────
    const rH = carry(cv, 8, n, 0, ans(4, Q2), tr);
    const rO = carry(cv, 9, n, 0, ans(5, Q2), tr);
    const rW = carry(cv, 10, n, 0, ans(6, Q2), tr);

    // ── the dig: the disc, the brush and the dust, Q3's label ───────────────
    const discHeld = n === DIG ? (b >= CUT && u > 0.12 ? 1 : 0) : n === BALLOT ? (u < 0.18 ? 1 : 2) : n > BALLOT ? 2 : 0;
    const disc = {
      x: discHeld === 1 ? bR.x : tR.x,
      y: discHeld === 1 ? bR.y - 1 : tR.y - 1,
      o: discHeld > 0 ? 1 : 0,
      spin: n === BALLOT ? 40 * hd(0.34, 0.5, 0.62, 0.78) : 0,
    };
    const dust = carry(cv, 11, n, 1, n < CARVING ? 1 : n === CARVING ? 1 - 0.45 * st(0.15, 0.27) - 0.5 * st(0.33, 0.45) : 0.05, tr);
    const puff = n === CARVING ? hd(0.2, 0.26, 0.3, 0.38) + hd(0.38, 0.44, 0.48, 0.56) : 0;
    const brushO = carry(cv, 12, n, 0, (n > DIG && n <= CARVING) || cutDone ? 1 : 0, cutDone ? 1 : tr);
    const rWell = carry(cv, 13, n, 0, ans(7, Q3), tr);
    const rCol = carry(cv, 14, n, 0, ans(8, Q3), tr);
    const rHut = carry(cv, 15, n, 0, ans(9, Q3), tr);
    const rT = Math.max(rWell, rCol, rHut);
    const spot = rWell > 0 ? SPOTS.well : rCol > 0 ? SPOTS.column : SPOTS.hut;
    const fall = clamp01(rT / 0.38);
    const off = rWell > 0 ? 0 : clamp01((rT - 0.5) / 0.5);
    const tag = {
      x: spot.x + HX + cam + 70 * off * off + 6 * (1 - fall),
      y: lerp(spot.y - 70, spot.y, fall * fall) - 60 * off * off - (off > 0 ? 8 * Math.sin(off * Math.PI) : 0),
      rot: rT <= 0 ? 0 : fall < 1 ? -24 * (1 - fall) : rWell > 0 ? 18 * Math.sin((rT - 0.38) * 20) * (1 - rT) : 300 * off,
      o: rT > 0 ? 1 - off : 0,
    };
    const splash = rWell > 0 ? clamp01((rWell - 0.4) / 0.5) : 0;
    const puffQ = rCol > 0 || rHut > 0 ? clamp01((rT - 0.36) / 0.3) : 0;

    return {
      bn, th, cam, t, fade, atDig,
      lidOff, boxX: boxW + cam, letter, glassIn, pencilIn, stampIn, labelInk,
      tR, tL, bR, bL, nb, bk, nbH: nbHolder > 0 ? 1 : 0, bkH: bkHeld,
      stamp: { x: stampX, y: stampY, sq: stampSq }, stH: stampIn > 0 || rS > 0 ? 1 : 0,
      rBk, rPt, rNb, inked,
      rH, rO, rW,
      disc, dust, puff, brushO, tag, splash, puffQ, spotX: spot.x + HX + cam, spotY: spot.y,
      door: n === ARRIVE ? hd(0.0, 0.1, 0.42, 0.56) : 0,
      q1: carry(cv, 16, n, 0, Q1[n], tr),
      q2: carry(cv, 17, n, 0, Q2[n], tr),
      q3: carry(cv, 18, n, 0, Q3[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));
  const world2 = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the record room (x 0–400) and the dig (x 400–800) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="hist7-room-far" />
        <ClockHands S={SCENE} />
        <Motes S={SCENE} />
        <Door S={SCENE} />
        <LessonPicture name="hist7-room-pendants" />
        <Cards S={SCENE} />
        <View style={styles.deskShadow} />
        {/* the desk, low and BEHIND the figures: they stand at it, not in it */}
        <LessonPicture name="hist7-room-desk" />
        <LessonPicture name="hist7-dig-far" />
        <Cloud S={SCENE} x={HX + 60} y={250} s={1} k={0} />
        <Cloud S={SCENE} x={HX + 210} y={232} s={0.8} k={1} />
        <Cloud S={SCENE} x={HX + 340} y={258} s={0.9} k={2} />
        <Swallow S={SCENE} k={0} />
        <Swallow S={SCENE} k={1} />
        <LessonPicture name="hist7-dig-mid" />
        <View style={styles.steleShadow} />
        <View style={styles.hutShadow} />
        <Well S={SCENE} />
        <SteleDust S={SCENE} />
      </Animated.View>
      {/* what lies on the desk, BEHIND the figures, who stand in front of it */}
      <DeskRest S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="lead" wear={BY_ID.magistrate.pieces} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="second" wear={BY_ID.bun.pieces} />
      {/* the trench's near edge over her knees */}
      <Animated.View style={[styles.world, world2]} pointerEvents="none">
        <LessonPicture name="hist7-dig-near" />
      </Animated.View>
      {/* what is in a hand, in FRONT of the figures */}
      <DeskHeld S={SCENE} />
      <Disc S={SCENE} />
      <Brush S={SCENE} />
      <Tag S={SCENE} />
      {/* the labels and the things to tap */}
      {on(Q1) ? <Plates S={SCENE} k="q1" items={Q1_PLATES} /> : null}
      {on(Q3) ? <Plates S={SCENE} k="q3" items={Q3_PLATES} /> : null}
      <Fade S={SCENE} />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={STAMP_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={CAUSE_Q} k="q2" /> : null}
      {on(Q3) ? <StageTargets picked={picked} onPick={onPick} live={Q3[i] === 1} S={SCENE} qs={TAG_Q} k="q3" /> : null}
    </View>
  );
}

// ── the record room ──────────────────────────────────────────────────────────

/** The clock over the door: the minute hand creeping, the second hand going round. */
function ClockHands({ S }: { S: SharedValue<any> }) {
  const sec = useAnimatedStyle(() => ({ transform: [{ rotate: `${(S.value.t * 6) % 360}deg` }] }));
  const min = useAnimatedStyle(() => ({ transform: [{ rotate: `${130 + S.value.t * 0.1}deg` }] }));
  return (
    <>
      <View style={styles.hourHand} />
      <Animated.View style={[styles.minHand, min]} />
      <Animated.View style={[styles.secHand, sec]} />
      <View style={styles.clockPin} />
    </>
  );
}
/** Dust motes turning slowly in the window light. */
const MOTES = [[150, 340, 0], [176, 392, 1.7], [214, 360, 3.1], [252, 404, 2.2], [282, 330, 4.4]];
function Motes({ S }: { S: SharedValue<any> }) {
  return <>{MOTES.map(([x, y, ph], k) => <Mote key={k} S={S} x={x} y={y} ph={ph} />)}</>;
}
function Mote({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.t * 0.22 + ph;
    return { opacity: 0.55 + 0.45 * Math.sin(a * 1.7), transform: [{ translateX: x + 7 * Math.sin(a) }, { translateY: y + 10 * Math.sin(a * 0.6 + 1) }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.mote} /></Animated.View>;
}
/** The door leaf, hinged at its left edge: it swings open as she comes in and shuts behind her. */
function Door({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 0.82 * S.value.door }] }));
  return (
    <Animated.View style={[styles.doorHinge, st]} pointerEvents="none">
      <View style={styles.doorInner}><LessonPicture name="hist7-door" /></View>
    </Animated.View>
  );
}
/** Q2's three index cards on the corkboard, the pins and the thread. */
function Cards({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="none">
      <Thread S={S} />
      <Card S={S} k={0} />
      <Card S={S} k={1} />
      <Card S={S} k={2} />
    </Animated.View>
  );
}
/** One index card: pinned right, it pops and settles; pinned wrong, it swings and hangs crooked. */
function Card({ S, k }: { S: SharedValue<any>; k: number }) {
  const c = CARDS[k];
  const right = c.correct;
  const y0 = c.y - 12;
  const st = useAnimatedStyle(() => {
    const r = k === 0 ? S.value.rH : k === 1 ? S.value.rO : S.value.rW;
    let sc = 1;
    let dx = 0;
    if (right) sc = 1 + 0.08 * popOf(clamp01((r - 0.3) / 0.5));
    else dx = shake(clamp01((r - 0.3) / 0.7), 3.5);
    return { transform: [{ translateX: CARD_X - CARD_W / 2 + dx }, { translateY: y0 }, { scale: sc }] };
  });
  const pin = useAnimatedStyle(() => {
    const r = k === 0 ? S.value.rH : k === 1 ? S.value.rO : S.value.rW;
    const f = clamp01(r / 0.3);
    // a wrong card will not take the pin: it springs back out and falls away
    const out = right ? 0 : clamp01((r - 0.34) / 0.5);
    return {
      opacity: r > 0 ? 1 - out : 0,
      transform: [{ translateX: -10 * out }, { translateY: -34 * (1 - f * f) - 16 * Math.sin(Math.PI * out) + 30 * out * out }, { rotate: `${-200 * out}deg` }],
    };
  });
  return (
    <Animated.View style={[styles.cardRider, st]} pointerEvents="none">
      <View style={[styles.plate, { left: 0, top: 0, width: CARD_W, height: 24 }]}>
        {c.lines.map((l) => <Text key={l} style={[styles.plateText, { width: CARD_W - 2 }]}>{l}</Text>)}
      </View>
      <View style={styles.tack} />
      <Animated.View style={[styles.rider, { left: 6, top: 3 }, pin]}>
        <View style={styles.pinNeedle} />
        <View style={styles.pinHead} />
      </Animated.View>
    </Animated.View>
  );
}
/** The red thread from the right card's pin to the rows of houses on the map, and a ring round them. */
const TH_FROM = { x: CARD_X - CARD_W / 2 + 6, y: CARDS[0].y - 9 };
const TH_LEN = Math.hypot(TH_FROM.x - HOUSES.x, TH_FROM.y - HOUSES.y);
const TH_ANG = (Math.atan2(HOUSES.y - TH_FROM.y, HOUSES.x - TH_FROM.x) * 180) / Math.PI;
function Thread({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, clamp01((S.value.rH - 0.4) / 0.4)) }] }));
  const ring = useAnimatedStyle(() => {
    const v = clamp01((S.value.rH - 0.75) / 0.25);
    return { opacity: v, transform: [{ scale: 0.6 + 0.4 * v }] };
  });
  return (
    <>
      <View style={[styles.rider, { left: TH_FROM.x, top: TH_FROM.y, transform: [{ rotate: `${TH_ANG}deg` }] }]}>
        <Animated.View style={[styles.thread, { width: TH_LEN }, st]} />
      </View>
      <Animated.View style={[styles.housesRing, ring]} />
    </>
  );
}

/** What is on the desk: the painting, the notebook, the booklet, the fire's box over them, his box and its lid, the glass, letter, pencil and stamp. */
// The figures stand IN FRONT of the low desk (2026-10-08), so a thing lying on it is drawn
// behind them and the same thing in a hand is drawn in front: two copies, one shown at a time.
function DeskRest({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <Painting S={S} />
      <Notebook S={S} held={false} />
      <FireBox S={S} />
      <Booklet S={S} held={false} />
      <BoxA S={S} />
      <Stamp S={S} held={false} />
    </>
  );
}
function DeskHeld({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <Notebook S={S} held />
      <Booklet S={S} held />
      <Glass S={S} />
      <Letter S={S} />
      <Pencil S={S} />
      <Stamp S={S} held />
    </>
  );
}
function Painting({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const j = clamp01((S.value.rPt - 0.44) / 0.56);
    return { transform: [{ translateX: PAINT.x + S.value.cam + shake(j, 3) }, { translateY: PAINT.y }, { rotate: `${shake(j, 5)}deg` }] };
  });
  const mark = useAnimatedStyle(() => ({ opacity: S.value.rPt > 0 ? S.value.inked * (1 - 0.6 * clamp01((S.value.rPt - 0.6) / 0.4)) : 0 }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="hist7-painting" />
      <Animated.View style={[styles.smudge, { left: -6, top: -18 }, mark]} />
    </Animated.View>
  );
}
function Notebook({ S, held }: { S: SharedValue<any>; held: boolean }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.nb;
    const j = popOf(clamp01((S.value.rNb - 0.44) / 0.56));
    return { opacity: (S.value.nbH === 1) === held ? 1 : 0, transform: [{ translateX: v.x }, { translateY: v.y - 7 * j }, { rotate: `${v.tilt}deg` }, { scale: 1 + 0.18 * j }] };
  });
  const shut = useAnimatedStyle(() => ({ opacity: S.value.nb.open < 0.5 ? 1 : 0, transform: [{ scaleX: Math.max(0.05, 1 - 2 * S.value.nb.open) }] }));
  const open = useAnimatedStyle(() => ({ opacity: S.value.nb.open >= 0.5 ? 1 : 0, transform: [{ scaleX: Math.max(0.05, 2 * S.value.nb.open - 1) }] }));
  const mark = useAnimatedStyle(() => ({ opacity: S.value.rNb > 0 ? S.value.inked : 0, transform: [{ rotate: '-8deg' }, { scale: 1 + 0.3 * (1 - S.value.inked) }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.rider, shut]}><LessonPicture name="hist7-notebook" /></Animated.View>
      <Animated.View style={[styles.rider, open]}><LessonPicture name="hist7-notebook-open" /></Animated.View>
      <Animated.View style={[styles.imprint, mark]}>
        <View style={styles.imprintLine} />
        <View style={[styles.imprintLine, { width: 4 }]} />
      </Animated.View>
    </Animated.View>
  );
}
function Booklet({ S, held }: { S: SharedValue<any>; held: boolean }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.bk;
    const j = shake(clamp01((S.value.rBk - 0.44) / 0.56), 2.5);
    return { opacity: (S.value.bkH === 1) === held ? 1 : 0, transform: [{ translateX: v.x + j }, { translateY: v.y }, { scaleX: Math.max(0.05, Math.abs(1 - 2 * v.flip)) }] };
  });
  const back = useAnimatedStyle(() => ({ opacity: S.value.bk.flip > 0.5 ? 1 : 0 }));
  const mark = useAnimatedStyle(() => ({ opacity: S.value.rBk > 0 ? S.value.inked * (1 - 0.6 * clamp01((S.value.rBk - 0.6) / 0.4)) : 0 }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="hist7-booklet" />
      <Animated.View style={[styles.bookBack, back]}>
        <View style={styles.bookDate} />
        <View style={[styles.bookLine, { top: 5 }]} />
        <View style={[styles.bookLine, { top: 8, width: 6 }]} />
      </Animated.View>
      <Animated.View style={[styles.smudge, { left: -5, top: -16 }, mark]} />
    </Animated.View>
  );
}
function FireBox({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: FIREBOX.x + S.value.cam }, { translateY: FIREBOX.y }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="hist7-firebox" /></Animated.View>;
}
function BoxA({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.boxX }, { translateY: BOXA.y }] }));
  const lid = useAnimatedStyle(() => {
    const v = S.value.lidOff;
    return { transform: [{ translateX: 9 * v }, { translateY: -15 - 2.4 * v }, { rotate: `${-9 * v}deg` }] };
  });
  const ink = useAnimatedStyle(() => ({ opacity: S.value.labelInk }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="hist7-box" />
      <Animated.View style={[styles.boxInk, ink]} />
      <Animated.View style={[styles.rider, lid]}><LessonPicture name="hist7-lid" /></Animated.View>
    </Animated.View>
  );
}
/** His magnifying glass, out of his pocket in his left hand while he reads. */
function Glass({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.glassIn,
    transform: [{ translateX: S.value.tL.x + 3 }, { translateY: S.value.tL.y - 2 }, { rotate: '-62deg' }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="hist7-glass" /></Animated.View>;
}
/** The letter he reads in b0: out of his box, into his hand, back. */
function Letter({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.letter, transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y - 2 }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.letter} />
      <View style={[styles.letterLine, { top: -5 }]} />
      <View style={[styles.letterLine, { top: -2.6 }]} />
      <View style={[styles.letterLine, { top: -0.2, width: 4 }]} />
    </Animated.View>
  );
}
/** His pencil, out of his breast pocket for the label. */
function Pencil({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.pencilIn,
    transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y }, { rotate: '58deg' }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.pencil} /></Animated.View>;
}
function Stamp({ S, held }: { S: SharedValue<any>; held: boolean }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.atDig || (S.value.stH === 1) !== held ? 0 : 1,
    transform: [{ translateX: S.value.stamp.x }, { translateY: S.value.stamp.y }, { scaleY: S.value.stamp.sq }, { scaleX: 2 - S.value.stamp.sq }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="hist7-stamp" /></Animated.View>;
}

// ── the dig ──────────────────────────────────────────────────────────────────

/** A fair-weather cloud, drifting a little and back. */
function Cloud({ S, x, y, s, k }: { S: SharedValue<any>; x: number; y: number; s: number; k: number }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: x + 9 * Math.sin(S.value.t * 0.05 + k * 1.7) }, { translateY: y }, { scale: s }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.cloud, { left: -26, top: -6, width: 52, height: 12, borderRadius: 6 }]} />
      <View style={[styles.cloud, { left: -16, top: -13, width: 20, height: 16, borderRadius: 8 }]} />
      <View style={[styles.cloud, { left: -2, top: -16, width: 22, height: 18, borderRadius: 9 }]} />
      <View style={[styles.cloudFoot, { left: -24, top: 3, width: 48, height: 3, borderRadius: 1.5 }]} />
    </Animated.View>
  );
}
/** A swallow wheeling over the dig. */
function Swallow({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.t * (k ? 0.34 : 0.27) + k * 2.4;
    const x = HX + (k ? 280 : 150) + (k ? 50 : 70) * Math.cos(a);
    const y = (k ? 300 : 280) + 12 * Math.sin(a * 2);
    const flap = 0.6 + 0.4 * Math.sin(S.value.t * (k ? 9 : 8));
    return { transform: [{ translateX: x }, { translateY: y }, { scaleX: Math.sin(a) > 0 ? -1 : 1 }, { scaleY: flap }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.wing, { left: -6, transform: [{ rotate: '-24deg' }] }]} />
      <View style={[styles.wing, { left: -0.6, transform: [{ rotate: '24deg' }] }]} />
    </Animated.View>
  );
}
/** How far down the well the villager's bucket is, 0 at the pulley and 1 deep in the water. */
function bucketDown(t: number): number {
  'worklet';
  const ph = (t * 0.12) % 1;
  return ph < 0.5 ? smooth01(ph / 0.5) : 1 - smooth01((ph - 0.5) / 0.5);
}
/** The village well: the villager lowering her bucket on its rope and hauling it up, and the splash when Q3 is answered right. */
function Well({ S }: { S: SharedValue<any> }) {
  const bucket = useAnimatedStyle(() => ({ transform: [{ translateY: 13 + 40 * bucketDown(S.value.t) }] }));
  const rope = useAnimatedStyle(() => ({ height: 4 + 40 * bucketDown(S.value.t) }));
  const wom = useAnimatedStyle(() => ({
    transform: [{ translateX: HX + 36 }, { translateY: 486 }, { rotate: `${-2.5 * bucketDown(S.value.t)}deg` }],
  }));
  return (
    <>
      <View style={styles.haulRope} />
      <Animated.View style={[styles.rider, wom]} pointerEvents="none"><LessonPicture name="hist7-villager" /></Animated.View>
      <View style={styles.wellClip} pointerEvents="none">
        <Animated.View style={[styles.wellRope, rope]} />
        <Animated.View style={[styles.rider, { left: 20 }, bucket]}><LessonPicture name="hist7-bucket" /></Animated.View>
      </View>
      <Drop S={S} dx={-10} dy={-22} />
      <Drop S={S} dx={-4} dy={-30} />
      <Drop S={S} dx={3} dy={-32} />
      <Drop S={S} dx={9} dy={-24} />
      <Drop S={S} dx={14} dy={-16} />
    </>
  );
}
function Drop({ S, dx, dy }: { S: SharedValue<any>; dx: number; dy: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.splash;
    return { opacity: v > 0 && v < 1 ? 1 - v : 0, transform: [{ translateX: HX + 70 + dx * v }, { translateY: 454 + dy * Math.sin(Math.PI * v) + 10 * v * v }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.drop} /></Animated.View>;
}
/** The dust on the carved stone, brushed away in two strokes, and the puff each stroke raises. */
function SteleDust({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.85 * S.value.dust }));
  const puff = useAnimatedStyle(() => ({ opacity: 0.8 * S.value.puff, transform: [{ translateY: -8 * S.value.puff }, { scale: 0.6 + 0.6 * S.value.puff }] }));
  return (
    <>
      <Animated.View style={[styles.dust, st]} pointerEvents="none">
        <View style={[styles.dustSpot, { left: 2, top: 8, width: 12, height: 18 }]} />
        <View style={[styles.dustSpot, { left: 6, top: 34, width: 10, height: 22 }]} />
        <View style={[styles.dustSpot, { left: 1, top: 60, width: 14, height: 14 }]} />
      </Animated.View>
      <Animated.View style={[styles.dustPuff, puff]} pointerEvents="none" />
    </>
  );
}
/** The bronze ballot: dug up, handed over, held up to the light. */
function Disc({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.disc;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.spin}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="hist7-ballot" /></Animated.View>;
}
/** Her soft brush, in her left hand at the dig. */
function Brush({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.brushO,
    transform: [{ translateX: S.value.bL.x }, { translateY: S.value.bL.y }, { rotate: '-50deg' }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.brushHandle} />
      <View style={styles.brushHead} />
    </Animated.View>
  );
}
/** Q3's brown label, SAME, dropped on the thing tapped: it stays on the well and blows off anything else. */
function Tag({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.tag;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }] };
  });
  const puff = useAnimatedStyle(() => ({
    opacity: S.value.puffQ > 0 && S.value.puffQ < 1 ? 0.8 * (1 - S.value.puffQ) : 0,
    transform: [{ translateX: S.value.spotX }, { translateY: S.value.spotY - 4 * S.value.puffQ }, { scale: 0.5 + S.value.puffQ }],
  }));
  return (
    <>
      <Animated.View style={[styles.rider, puff]} pointerEvents="none"><View style={styles.tagPuff} /></Animated.View>
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <View style={styles.tagString} />
        <LessonPicture name="hist7-tag" />
        <Text style={styles.tagText}>SAME</Text>
      </Animated.View>
    </>
  );
}

/** The fade through the colour of the dust on the way to the dig. */
function Fade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.fade }));
  return <Animated.View style={[styles.fade, st]} pointerEvents="none" />;
}

// ── the labels and the three games ───────────────────────────────────────────

type Plate = { x: number; y: number; w: number; lines: readonly string[] };
const Q1_PLATES: Plate[] = [
  { x: 196, y: 483, w: 52, lines: ['BOOKLET'] },
  { x: NB_LAID.x, y: 467, w: 60, lines: ['NOTEBOOK'] },
  { x: PAINT.x, y: 483, w: 56, lines: ['PAINTING'] },
];
const Q3_PLATES: Plate[] = [
  { x: 70, y: 492, w: 54, lines: ['OLD WELL'] },
  { x: 148, y: 492, w: 86, lines: ['FALLEN COLUMN'] },
  { x: 352, y: 492, w: 66, lines: ['TICKET HUT'] },
];
function Plates({ S, k, items }: { S: SharedValue<any>; k: 'q1' | 'q3'; items: Plate[] }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="none">
      {items.map((g) => (
        <View key={g.lines.join(' ')} style={[styles.plate, { left: g.x - g.w / 2, top: g.y, width: g.w, height: 4 + 10 * g.lines.length }]}>
          {g.lines.map((l) => <Text key={l} style={[styles.plateText, { width: g.w - 2 }]}>{l}</Text>)}
        </View>
      ))}
    </Animated.View>
  );
}

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/** STAMP IT PRIMARY: which of the three was made that night, by someone who was there? */
const STAMP_Q: Q[] = [
  { id: 'booklet', left: 166, top: 429, w: 42, h: 52, r: 4, correct: false },
  { id: 'notebook', left: 240, top: 437, w: 44, h: 44, r: 4, correct: true },
  { id: 'painting', left: 276, top: 431, w: 32, h: 66, r: 4, correct: false },
];
/** PIN THE SLOW CAUSE: which cause had been building for years? */
const CAUSE_Q: Q[] = CARDS.map((c) => ({ id: c.id, left: CARD_X - CARD_W / 2, top: c.y - 12, w: CARD_W, h: 24, r: 4, correct: c.correct }));
/** TAG WHAT STAYED: which thing at the dig shows continuity? (the dig, on screen) */
const TAG_Q: Q[] = [
  { id: 'well', left: 40, top: 396, w: 60, h: 112, r: 6, correct: true },
  { id: 'column', left: 105, top: 462, w: 88, h: 46, r: 6, correct: false },
  { id: 'hut', left: 316, top: 410, w: 72, h: 98, r: 6, correct: false },
];
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2' | 'q3';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
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

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  world: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  cardRider: { position: 'absolute', left: 0, top: 0, width: CARD_W, height: 24, transformOrigin: '50% 3px' },
  fade: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.hi7Dust.base },
  hourHand: {
    position: 'absolute', left: 37.3, top: 337, width: 1.4, height: 7.4, borderRadius: 0.7, backgroundColor: W.hi7Pencil.base,
    transformOrigin: '50% 100%', transform: [{ rotate: '-60deg' }],
  },
  minHand: { position: 'absolute', left: 37.45, top: 334.6, width: 1.1, height: 9.4, borderRadius: 0.55, backgroundColor: W.hi7Pencil.base, transformOrigin: '50% 100%' },
  secHand: { position: 'absolute', left: 37.7, top: 334.4, width: 0.6, height: 10, backgroundColor: W.hi7Ink.base, transformOrigin: '50% 96%' },
  clockPin: { position: 'absolute', left: 36.8, top: 342.8, width: 2.4, height: 2.4, borderRadius: 1.2, backgroundColor: W.hi7Pencil.base },
  mote: { position: 'absolute', left: -0.9, top: -0.9, width: 1.8, height: 1.8, borderRadius: 0.9, backgroundColor: W.hi7Mote.base },
  doorHinge: { position: 'absolute', left: 18, top: 376, width: 40, height: 97, transformOrigin: '1px 50%' },
  doorInner: { position: 'absolute', left: -18, top: -376, width: 0, height: 0 },
  plate: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  tack: { position: 'absolute', left: CARD_W / 2 - 1.6, top: -1.6, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: W.hi7Pin.base, borderWidth: 0.5, borderColor: INK },
  pinNeedle: { position: 'absolute', left: -0.4, top: -2, width: 0.8, height: 4, backgroundColor: W.hi7Pin.shade },
  pinHead: { position: 'absolute', left: -2.6, top: -5.6, width: 5.2, height: 5.2, borderRadius: 2.6, backgroundColor: W.hi7Ink.base, borderWidth: 0.6, borderColor: INK },
  thread: { position: 'absolute', left: 0, top: -0.5, height: 1, backgroundColor: W.hi7Ink.base, transformOrigin: '0% 50%' },
  housesRing: {
    position: 'absolute', left: HOUSES.x - 20, top: HOUSES.y - 18, width: 40, height: 36, borderRadius: 18,
    borderWidth: 1.4, borderColor: W.hi7Ink.base,
  },
  smudge: { position: 'absolute', width: 12, height: 6, borderRadius: 2, backgroundColor: W.hi7Smudge.base, opacity: 0.8 },
  imprint: {
    position: 'absolute', left: 1.4, top: -12.4, width: 9, height: 6, borderRadius: 1, borderWidth: 0.9, borderColor: W.hi7Ink.base,
    alignItems: 'center', justifyContent: 'center',
  },
  imprintLine: { width: 6, height: 0.8, marginVertical: 0.4, backgroundColor: W.hi7Ink.base },
  bookBack: { position: 'absolute', left: -7, top: -18, width: 14, height: 18, backgroundColor: W.hi7Back.base, borderWidth: 0.8, borderColor: INK },
  bookDate: { position: 'absolute', left: 2.4, top: 11, width: 8, height: 3.4, backgroundColor: W.hi7Ink.base },
  bookLine: { position: 'absolute', left: 2.4, width: 8, height: 0.8, backgroundColor: W.hi7Smudge.base },
  boxInk: { position: 'absolute', left: -7, top: -8.4, width: 6, height: 3.6, borderRadius: 0.6, borderWidth: 0.8, borderColor: W.hi7Ink.base, transform: [{ rotate: '-6deg' }] },
  letter: { position: 'absolute', left: -5, top: -7, width: 10, height: 8, backgroundColor: W.hi7Back.base, borderWidth: 0.6, borderColor: INK },
  letterLine: { position: 'absolute', left: -3.4, width: 6.6, height: 0.6, backgroundColor: W.hi7Smudge.base },
  pencil: { position: 'absolute', left: -1, top: -0.5, width: 9, height: 1.2, borderRadius: 0.6, backgroundColor: W.hi7Pencil.base },
  cloud: { position: 'absolute', backgroundColor: W.cloudWhite.base },
  cloudFoot: { position: 'absolute', backgroundColor: W.cloudWhite.shade },
  wing: { position: 'absolute', top: -1, width: 6.6, height: 1.6, borderRadius: 0.8, backgroundColor: W.hi7Swallow.base },
  haulRope: {
    position: 'absolute', left: HX + 46, top: 469, width: 61, height: 0.9, backgroundColor: W.hi7Rope.base,
    transformOrigin: '0% 50%', transform: [{ rotate: '-66.8deg' }],
  },
  wellClip: { position: 'absolute', left: HX + 50, top: 409, width: 40, height: 47, overflow: 'hidden' },
  wellRope: { position: 'absolute', left: 19.6, top: 4, width: 0.9, backgroundColor: W.hi7Rope.base },
  drop: { position: 'absolute', left: -1.2, top: -1.6, width: 2.4, height: 3.2, borderRadius: 1.2, backgroundColor: W.hi7Water.base },
  dust: { position: 'absolute', left: HX + 222, top: 392, width: 18, height: 80 },
  dustSpot: { position: 'absolute', borderRadius: 5, backgroundColor: W.hi7Dust.base },
  dustPuff: { position: 'absolute', left: HX + 214, top: 430, width: 14, height: 10, borderRadius: 5, backgroundColor: W.hi7Dust.shade },
  brushHandle: { position: 'absolute', left: -1, top: -0.7, width: 8, height: 1.4, borderRadius: 0.7, backgroundColor: W.hi7Rope.shade },
  brushHead: { position: 'absolute', left: 6.4, top: -1.8, width: 3.6, height: 3.6, borderRadius: 1, backgroundColor: W.hi7Dust.shade },
  tagString: { position: 'absolute', left: -17, top: -8, width: 0.8, height: 8, backgroundColor: W.hi7Rope.shade },
  tagText: {
    position: 'absolute', left: -12, top: -5, width: 30, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10,
    color: INK, includeFontPadding: false, textAlign: 'center',
  },
  tagPuff: { position: 'absolute', left: -9, top: -6, width: 18, height: 10, borderRadius: 5, backgroundColor: W.hi7Dust.shade },
  clear: { flexGrow: 1 },
  deskShadow: { position: 'absolute', left: 154, top: 498, width: 190, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.4 },
  steleShadow: { position: 'absolute', left: HX + 212, top: 481, width: 42, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.35 },
  hutShadow: { position: 'absolute', left: HX + 316, top: 486, width: 76, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.35 },
});

// OWN CAMERA: targets checked in shot 2026-10-08 — the three question beats (BOOKLET/NOTEBOOK/PAINTING on
// the desk, the three index cards on the corkboard, OLD WELL/FALLEN COLUMN/TICKET HUT at the dig) read
// whole, answered right and wrong, on the hist7-right, hist7-wrongA and hist7-wrongB sheets.
export function Hist7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Hist7Scene} band={[214, 514]} />;
}
