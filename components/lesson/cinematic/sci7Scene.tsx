import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './sci7Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { PLATE_FACE, lipOf } from './stageSkin';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-7, "Science Recap: Lab Night" — AN OLD LABORATORY AFTER DARK, THEN
// THE OBSERVATORY DOME ON ITS ROOF. The recap of the Science road's six lessons.
//
// A DIALOGUE lesson (LESSON_RULES group AP): two people talk and nobody narrates. The
// scientist (the top hat) works alone at his bench; the woman with the bun, who was at the
// centre of four of the six lessons, arrives cheerful and remembers each one slightly wrong.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// sci7.mjs) laid in ONE WORLD 800 wide: the laboratory at x 0–400, the dome at x 400–800.
// The scene's own camera is the world's translation, `cam`: 0 in the laboratory, −400 in
// the dome, cut under a fade as the two of them go up (b15). On the two bench questions a
// LENS pushes in on what is to be tapped (Q1 the kit, Q2 the shelf) and eases back out on
// the next spoken beat. Figures are posed in SCREEN space (world x + cam).
//
//   LABORATORY, far → near: the beamed ceiling, the gaslit plaster wall, three tall
//   windows on the night (30–80, 118–168, 300–350), shelves of jars between them, the
//   panelled dado, the open door at the left edge (0–24) and the plank floor; then the
//   stone sink and its brass tap (34–98), the BLACKBOARD 254–314 × 396–458, the REAGENT
//   SHELF 300–398 at 428; then the BENCH 104–400 (top 462, hip height, on open legs), stood behind both people,
//   and on it the KIT — the small burner at 158 and the big one at 188, each under a
//   tripod (gauze 440) with a beaker of water and a thermometer — the sugar bowl (145),
//   and his own rig at 290: a lower tripod (gauze 446), the conical flask, the stock jar
//   (302) and his notebook (301–314); he works at it from 320, beside it, not over it.
//   DOME (its own x 0–400): the pale shell and its ribs, the shutter SLIT 96–236 open on
//   the night — a last sunset glow low at the left, the stars, Mars (150, 318), the town's
//   roofs and street lamps — the brick drum and its rail, the floor; the stair's rail at
//   the left, the POSTER of the planets (28–92 × 352–398), the TELESCOPE on its pier
//   (pivot 272, 436), the desk at the right with the star chart, the lamp and her DIARY.
//
//   b0   alone: lifts the stock jar and pours (pour 0.8s), sets it down (glass 2.3s), turns
//        on his burner (burner 3.1s), watches, lets one drop fall from the dropper (drip
//        4.6s), writes in his notebook (pencil 5.4s), taps his chin, murmurs his line.
//   b1   the door swings (its glass 1.4s); she walks in and waves.
//   b2   one finger up, then he points out of the window.      b3 her two fists, the heavy one first.
//   b4   both fists fall together.        b5 she stirs the small beaker from its left (stir 0.6s),
//        taps its rim (glass 2.2s), then stirs the big one from its far side (212) and
//        turns back to him; in b6 she steps back to 76 as he comes over.
//   b6   he walks over and turns the big burner down to match; she steps back.
//   b7   Q1 LEVEL THE BENCH: the thermometers, the beakers or the burners.
//   b8   she takes a stopwatch from her pocket (click 1.2s) and brings it over.
//   b9   he taps it, then chalks three timings on the board (chalk 1.2s).
//   b10  she points at the eleven and beams.   b11 he rings the eleven (chalk tap 1.0s).
//   b12  she uncorks her tonic (jar lid 0.4s), sips and strikes a pose.
//   b13  he takes the bottle, walks it to the shelf and sets it down (glass 1.6s).
//   b14  Q2 STOCK THE SHELF: the second tonic, the crate of plain bottles or the label (he steps back to 276).
//   b15  up into the dome (a fade through the night); she points at the lamps and stars. In the dome
//        he stands at the eyepiece end (310) and she by the stair (120), both clear of the tube.
//   b16  he points at the sunset's last glow, the lamps and the stars.
//   b17  she points at the telescope, then waves at the sky by Mars.    b18 he folds his arms.
//   b19  she spreads her hands.   b20 he swings the telescope onto Mars by its eyepiece end (creak 0.8s).
//   b21  Q3 CHECK THE SKY: the eyepiece, the poster or her diary.   b22 at ease.
//
// SIMPLE ON PURPOSE (AP7): two figures, each its own phase (N22) and its own blend start
// (trAt), everyone faces whom they talk to and walks the way they face (C18), and every
// hand that moves pours, stirs, writes, holds, taps, points or waves.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('science');
const { SHADE } = TONE;
const W = NATURAL;
const TR = 0.85;
const K = K_FIG * 0.9;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.2s) and the line together. */
const LINES = [8.63, 5.36, 5.56, 3.97, 6.91, 5.13, 6.86, 0, 4.67, 5.81, 6.89, 6.35, 6.65, 7.17, 0, 6, 7.95, 5.55, 5.49, 4.76, 5.25, 0, 0, 0];

const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const WORK = at('work');
const ARRIVE = at('arrive');
const GUESS = at('guess');
const BALLS = at('balls');
const DROP = at('drop');
const SUGAR = at('sugar');
const FAIR = at('fair');
const ONCE = at('once');
const REPEAT = at('repeat');
const OUTLIER = at('outlier');
const CHECK = at('check');
const TONIC = at('tonic');
const HOPE = at('hope');
const DOME = at('dome');
const HIDDEN = at('hidden');
const PLANET = at('planet');
const FAIL = at('fail');
const COMMIT = at('commit');
const WRONG = at('wrong');
const Q1 = BEATS.map((b) => (b.bench ? 1 : 0));
const Q2 = BEATS.map((b) => (b.shelf ? 1 : 0));
const Q3 = BEATS.map((b) => (b.sky ? 1 : 0));
const Q3_AT = Q3.indexOf(1);
/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 8.63;
}

type Track = readonly (readonly number[])[];
/** A hand's path across a line: [share of line, x in front of him (his own frame), stage y, weight]. */
type Key = readonly [number, number, number, number];
const NONE: readonly Key[] = [];
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));

// ── where everybody stands (WORLD x; the dome is x + 400) ──────────────────────
const HX = 400;
const TH_WORK = 320;
const TH_KIT = 212;
const TH_BOARD = 240;
const TH_SHELF = 302;
/** On the shelf question he steps back from it, so the tonic, the crate and the label are clear of him. */
const TH_ASIDE = 276;
const TH_DOME = HX + 310;
const B_OFF = -40;
const B_KIT = 134;
const B_STIR = 212;
const B_BACK = 76;
const B_NEAR = 206;
const B_DOME = HX + 120;
/** The climb (b15): a fade through the night at CUT; they come in from the stair, mid-walk. */
const CUT = 0.45;
const TH_ENTER = HX + 150;
const B_ENTER = HX + 40;

/** Each figure's walks for a beat: [start share, to x], one after another. */
const TH_LEGS: Track[] = per((n) => (n < FAIR ? [[0, TH_WORK]] : n === FAIR ? [[0.0225, TH_KIT], [0.715, TH_BOARD]]
  : n < HOPE ? [[0, TH_BOARD]] : n === HOPE ? [[0.092, TH_SHELF]] : n < DOME ? [[0, Q2[n] ? TH_ASIDE : TH_SHELF]] : [[0, TH_DOME]]));
const B_LEGS: Track[] = per((n) => (n < ARRIVE ? [[0, B_OFF]] : n === ARRIVE ? [[0.2146, B_KIT]]
  : n < SUGAR ? [[0, B_KIT]] : n === SUGAR ? [[0.47, B_STIR]]
    : n === FAIR ? [[0, B_BACK]] : n < ONCE ? [[0, B_BACK]] : n === ONCE ? [[0.325, B_NEAR]]
      : n < DOME ? [[0, B_NEAR]] : [[0, B_DOME]]));
/** Which way each faces: [share, ±1], eased through a profile; a walk turns them first. */
const TH_TURN: Track[] = per((n) => (n < DOME ? (n === FAIR ? [[0, -1], [0.9, -1]]
  : n === REPEAT ? [[0, -1], [0.095, 1], [0.78, -1]]
    : n === CHECK ? [[0, -1], [0.02, 1], [0.36, -1]]
      : n === HOPE ? [[0, -1], [0.31, -1]] : [[0, -1]])
  : n === DOME ? [[0, 1], [0.6, -1]] : [[0, -1]]));
const B_TURN: Track[] = per((n) => (n < DOME ? (n === SUGAR ? [[0, 1], [0.757, -1], [0.95, 1]] : n === FAIR ? [[0, 1], [0.78, 1]] : [[0, 1]])
  : [[0, 1]]));
const TH_P = per((n) => (BEATS[n].speaker === 'tophat' ? (n % 2 ? TALK : EXPLAIN) : NOD));
const B_P = per((n) => (BEATS[n].speaker === 'bun' ? TALK : NOD));

// ── the laboratory's things (world x = screen x there) ───────────────────────
const KIT_S = 158;
const KIT_B = 188;
const GAUZE = 439.6;
const MY_X = 290;
const MY_GAUZE = 445.6;
const MOUTH = { x: 290, y: 426 };
const JAR = { x: 302, y: 448 };
const DROPPER = { x: 309, y: 460 };
const PENCIL = { x: 311, y: 460.4 };
const SPOON_REST = { x: 200, y: 461 };
const CORK_REST = { x: 240, y: 461 };
const SHELF_Y = 428;
const SET = { x: 320, y: SHELF_Y };
const TONIC2 = { x: 332, y: SHELF_Y };
const CRATE = { x: 356, y: SHELF_Y };
const SIGN = { x: 385, y: SHELF_Y - 10 };
const ROWS = [431.5, 442, 453];
const NUM_X = 266;
// ── the dome's things (dome frame x) ─────────────────────────────────────────
const PIV = { x: 272, y: 436 };
const AIM0 = 34;
const AIM1 = 44;
const MARS = { x: 150, y: 318 };
const POSTER = { x: 28, y: 352 };
const DIARY = { x: 364, y: 457 };

/** The lens for each beat: [scale, focus x, focus y] in screen units (it scales about the
 *  focus, so everything at the focus stays put and the window closes in round it). Every
 *  speaker is inside the window on their beat (K19). */
const LENS: readonly (readonly number[])[] = per((n) => {
  if (n === ARRIVE) return [1, 200, 470];
  if (n < FAIR) return [1.32, 226, 472];
  if (n === FAIR) return [1.32, 226, 472];
  if (Q1[n]) return [2.0, 172, 452];
  if (n === ONCE) return [1.45, 190, 472];
  if (n < HOPE) return [1.6, 262, 470];
  if (n === HOPE) return [1.5, 280, 466];
  if (Q2[n]) return [1.8, 400, 428];
  if (n === DOME || n > Q3_AT) return [1, 200, 470];
  if (Q3[n]) return [1, 200, 470];
  return [1.08, 220, 480];
});

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { thermo: 1, beakers: 2, burners: 3, tonic: 4, crate: 5, sign: 6, eyepiece: 7, poster: 8, diary: 9 };

// ── the hands ────────────────────────────────────────────────────────────────
/** His right hand: the jar, the burner, the dropper, the pencil; the finger and the window;
 *  the fists; the collar; the stopwatch and the chalk; the bottle; the sky; the arms folded. */
const TH_R: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    // (he stands at 320, just right of his notebook, so nothing on the bench is behind him)
    return [[S0(0.15), 16, 464, 0], [S0(0.45), 18, 450, 1], [S0(0.8), 24, 429, 1], [S0(1.8), 25, 428, 1], [S0(2.05), 20, 442, 1],
      [S0(2.3), 18, 450, 1], [S0(2.6), 16, 466, 0], [S0(4.9), 12, 462, 0.4],
      [S0(5.2), 7, 459.4, 1], [S0(5.45), 9, 459.4, 1], [S0(5.7), 11, 459.4, 1], [S0(5.95), 13, 459.4, 1], [S0(6.25), 10, 456, 1], [S0(6.5), 14, 466, 0]];
  }
  if (n === GUESS) return [[0.02, 8, 452, 0], [0.07, 12, 422, 1], [0.36, 12, 422, 1], [0.44, 169, 320, 1], [0.86, 169, 320, 1], [0.95, 8, 452, 0]];
  if (n === DROP) return [[0.02, 8, 452, 0], [0.08, 14, 426, 1], [0.3, 14, 426, 1], [0.36, 14, 454, 1], [0.45, 14, 454, 1], [0.52, 8, 452, 0]];
  if (n === FAIR) return [[0.27, 8, 452, 0], [0.32, 20, 457, 1], [0.35, 20, 457, 1], [0.4, 21, 455.5, 1], [0.46, 20, 457, 1], [0.5, 8, 452, 0], [0.55, 26, 444, 1], [0.64, 26, 444, 1], [0.68, 8, 452, 0]];
  if (n === REPEAT) {
    return [[0.02, 8, 452, 0], [0.05, 12, 440, 1], [0.07, 12, 443, 1], [0.1, 14, 448, 0.6],
      [0.19, 26, 433, 1], [0.26, 27.2, 433.4, 1], [0.405, 26.4, 442, 1], [0.47, 27.4, 442.4, 1],
      [0.613, 26.6, 453, 1], [0.68, 27.6, 453.4, 1], [0.74, 8, 452, 0]];
  }
  if (n === CHECK) return [[0.03, 8, 452, 0], [0.08, 25, 451, 1], [0.1, 29, 447.5, 1], [0.12, 34, 451, 1], [0.14, 30, 457, 1], [0.155, 25, 453, 1], [0.165, 30, 453.5, 1], [0.2, 8, 452, 0]];
  if (n === HOPE) return [[0, 8, 452, 0], [0.025, 12, 441, 1], [0.04, 12, 441, 1], [0.07, 8, 446, 1], [0.15, 8, 446, 1], [0.2, 18, 427, 1], [0.223, 18, 427.5, 1], [0.25, 20, 431, 0.6], [0.29, 8, 452, 0]];
  if (n === HIDDEN) return [[0.06, 8, 452, 0], [0.12, 130, 402, 1], [0.3, 130, 402, 1], [0.36, 60, 398, 1], [0.5, 60, 398, 1], [0.56, 70, 280, 1], [0.74, 70, 280, 1], [0.8, 8, 452, 0]];
  if (n === FAIL) return [[0.04, 8, 452, 0], [0.12, 4, 440, 1], [0.9, 4, 440, 1], [0.97, 8, 452, 0]];
  return NONE;
});
/** His left hand: steadying the flask, the chin, the fists, the arms folded. */
const TH_L: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    return [[S0(2.45), 8, 452, 0], [S0(2.85), 28, 457, 1], [S0(3.1), 29, 456, 1],
      [S0(3.95), 11, 459, 1], [S0(4.35), 24, 432, 1], [S0(4.75), 24, 432, 1], [S0(4.95), 11, 459, 1], [S0(5.15), 8, 452, 0],
      [S0(6.7), 8, 452, 0], [S0(6.95), 4, 420, 1], [S0(7.1), 4, 421.6, 1], [S0(7.25), 4, 420, 1], [S0(7.55), 8, 452, 0]];
  }
  if (n === DROP) return [[0.02, 8, 452, 0], [0.08, 9, 428, 1], [0.3, 9, 428, 1], [0.36, 9, 456, 1], [0.45, 9, 456, 1], [0.52, 8, 452, 0]];
  if (n === FAIL) return [[0.04, 8, 452, 0], [0.12, 6, 438, 1], [0.9, 6, 438, 1], [0.97, 8, 452, 0]];
  return NONE;
});
/** Her right hand: the wave, the fists, the spoon, the stopwatch, the tonic; the telescope. */
const B_R: (readonly Key[])[] = per((n) => {
  if (n === ARRIVE) return [[0.79, 8, 452, 0], [0.84, 10, 418, 1], [0.88, 14, 414, 1], [0.92, 9, 416, 1], [0.97, 8, 452, 0]];
  if (n === BALLS) return [[0.04, 8, 452, 0], [0.12, 14, 424, 1], [0.5, 14, 424, 1], [0.58, 14, 452, 1], [0.8, 14, 452, 1], [0.9, 8, 452, 0]];
  if (n === SUGAR) {
    // the small beaker from her side of it (134), a tap on its rim (the glass, 2.2s), then
    // round to the far side (212) to stir the big one facing back — never standing over either
    return [[0.02, 8, 452, 0], [0.06, 11, 455, 1], [0.09, 11, 457.5, 1], [0.1, 14, 440, 1], [0.124, 24, 428, 1],
      [0.15, 21, 431, 1], [0.19, 26, 431, 1], [0.23, 24, 428, 1], [0.26, 12, 446, 1],
      [0.4, 20, 427, 1], [0.43, 21, 425.4, 1], [0.455, 20, 427, 1], [0.47, 12, 446, 1],
      [0.84, 24, 428, 1], [0.88, 24, 431.5, 1], [0.92, 24, 428.5, 1], [0.95, 12, 459, 1], [0.97, 8, 452, 0]];
  }
  if (n === ONCE) return [[0.02, 8, 452, 0], [0.07, 2, 468, 1], [0.15, 10, 440, 1], [0.22, 12, 436, 1], [0.26, 12, 436.5, 1], [0.3, 9, 440, 1]];
  if (n === REPEAT) return [[0, 9, 440, 1], [0.05, 22, 440, 1], [0.16, 22, 440, 1], [0.24, 8, 444, 1]];
  if (n === OUTLIER || n === CHECK) return [[0, 8, 444, 1]];
  if (n === TONIC) {
    return [[0, 8, 444, 1], [0.03, 2, 468, 1], [0.055, 12, 440, 1], [0.07, 12, 438, 1], [0.14, 12, 438, 1], [0.2, 6, 416, 1],
      [0.26, 6, 416, 1], [0.31, 12, 440, 1], [0.37, 14, 418, 1], [0.6, 14, 418, 1], [0.7, 22, 440, 1]];
  }
  if (n === HOPE) return [[0, 22, 440, 1], [0.04, 22, 440, 1], [0.07, 8, 452, 0]];
  if (n === DOME) return [[0.38, 8, 452, 0], [0.44, 50, 398, 1], [0.56, 50, 398, 1], [0.62, 60, 290, 1], [0.78, 60, 290, 1], [0.85, 8, 452, 0]];
  if (n === PLANET) {
    return [[0.02, 8, 452, 0], [0.07, 60, 404, 1], [0.16, 60, 404, 1], [0.2, 8, 452, 0],
      [0.26, 8, 452, 0], [0.32, 30, 312, 1], [0.38, 30, 324, 1], [0.44, 30, 312, 1], [0.52, 8, 452, 0]];
  }
  if (n === COMMIT) return [[0.04, 8, 452, 0], [0.14, 20, 428, 1], [0.8, 20, 428, 1], [0.9, 8, 452, 0]];
  return NONE;
});
/** Her left hand: the fists, the eleven, the cork and the pose, the brightness. */
const B_L: (readonly Key[])[] = per((n) => {
  if (n === BALLS) return [[0.04, 8, 452, 0], [0.12, 8, 426, 1], [0.8, 8, 426, 1], [0.9, 8, 452, 0]];
  if (n === OUTLIER) return [[0.1, 8, 452, 0], [0.2, 64, 446, 1], [0.6, 64, 446, 1], [0.7, 8, 452, 0]];
  if (n === TONIC) {
    return [[0.035, 8, 452, 0], [0.05, 14, 432, 1], [0.065, 16, 427, 1], [0.09, 8, 452, 0],
      [0.37, 8, 452, 0], [0.42, 5, 418, 1], [0.6, 5, 418, 1], [0.68, 8, 452, 0]];
  }
  if (n === COMMIT) return [[0.04, 8, 452, 0], [0.14, 13, 420, 1], [0.8, 13, 420, 1], [0.9, 8, 452, 0]];
  return NONE;
});

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
function keyed(s: Stance, keys: readonly Key[], u: number, x: number, d: number, which: 1 | -1): Stance {
  'worklet';
  if (keys.length === 0) return s;
  const k = keyAt(keys, u);
  return hand(s, x, GROUND, d, which, x + k.lx * (d < 0 ? -1 : 1), k.y, k.w);
}
/** A look: the head up (negative) or down (positive). */
function look(s: Stance, v: number): Stance {
  'worklet';
  return v === 0 ? s : { ...s, neck: s.neck + v };
}
/** A lean of the whole body: back (negative) or forward (positive). */
function lean(s: Stance, v: number): Stance {
  'worklet';
  return v === 0 ? s : { ...s, tilt: s.tilt + v };
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
const STILL: Walk = { x: 0, x0: 0, x1: 0, u: 1, walking: false, ws: 0, we: 0, wd: 0 };
/**
 * The beat's walks, one after another (at most two): the first from where he stands,
 * the second from where the first ends. Returns the one in charge at `b`, and both, so
 * the facing can turn before each.
 */
function legsOf(src: number, legs: Track, b: number, L: number, faceSrc: number) {
  'worklet';
  const w1 = walkOf(src, legs[0][1], legs[0][0] * L, faceSrc, b);
  if (legs.length < 2) return { w: w1, a: w1, z: STILL };
  const f1 = w1.wd !== 0 ? w1.wd : faceSrc;
  const w2 = walkOf(legs[0][1], legs[1][1], legs[1][0] * L, f1, b);
  return { w: b < w2.ws ? w1 : w2, a: w1, z: w2 };
}
/** The same walk, begun `off` seconds into the beat (the dome half of the climb). */
function shifted(w: Walk, off: number): Walk {
  'worklet';
  return { ...w, ws: w.ws + off, we: w.we + off };
}
/**
 * Which way a figure faces at time `b`: the scripted turns, eased through a profile — but a
 * walk wins. He turns to face where he is going just before he sets off, and a scripted turn
 * the other way waits until he has arrived.
 */
function faceOf(src: number, turns: Track, b: number, L: number, wa: Walk, wz: Walk) {
  'worklet';
  const ts: number[] = [];
  const ds: number[] = [];
  for (let k = 0; k < turns.length; k += 1) {
    let tt = turns[k][0] * L;
    const dd = turns[k][1];
    if (wa.wd !== 0 && dd !== wa.wd && tt >= wa.ws - TURN_S - 0.05 && tt < wa.we) tt = wa.we;
    if (wz.wd !== 0 && dd !== wz.wd && tt >= wz.ws - TURN_S - 0.05 && tt < wz.we) tt = wz.we;
    ts.push(tt);
    ds.push(dd);
  }
  if (wa.wd !== 0) {
    ts.push(Math.max(0, wa.ws - TURN_S));
    ds.push(wa.wd);
  }
  if (wz.wd !== 0) {
    ts.push(Math.max(0, wz.ws - TURN_S));
    ds.push(wz.wd);
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
/** A point on the telescope tube, `along` units from the pivot (negative toward the front), at aim `deg`. */
function tubeAt(along: number, deg: number) {
  'worklet';
  const a = (deg * Math.PI) / 180;
  return { x: PIV.x + along * Math.cos(a), y: PIV.y + along * Math.sin(a) };
}

export default function Sci7Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldT = useHeld();
  const heldB = useHeld();
  const cv = useCarry(53);
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
    const tr = ease01(b / TR);
    /** Each figure's blend starts a little apart from the other's (N22). */
    const trAt = (rank: number) => {
      'worklet';
      return ease01(Math.max(0, b - rank * 0.2) / TR);
    };
    const L = lineOf(LINES, n);
    const u = b / L;
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    /** Up over [a, m], held, and back down over [z0, z1]. */
    const hd = (a: number, m: number, z0: number, z1: number) => {
      'worklet';
      return stage(b, L, a, m) * (1 - stage(b, L, z0, z1));
    };
    /** The same, in seconds. */
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

    // ── the camera: the laboratory, then (cut under the fade) the dome ──────
    const camDest = n < DOME ? 0 : -HX;
    const camSrc = carrySource(cv, 1, n, 0);
    // a tap that crosses between the two places without the climb lands under a fade
    const jump = n === DOME ? camSrc < -1 : Math.abs(camSrc - camDest) > 1;
    const camNow = jump ? camDest : n === DOME ? (b < CUT ? 0 : -HX) : camDest;
    const cam = carry(cv, 1, n, 0, camNow, 1);
    const fade = jump ? 1 - sec(0, 0.45) : n === DOME ? sec(0.05, CUT) * (1 - sec(CUT, CUT + 0.5)) : 0;

    // ── her ─────────────────────────────────────────────────────────────────
    const legsB = B_LEGS[n];
    let srcB = carrySource(cv, 0, n, B_OFF);
    if (jump) srcB = legsB[legsB.length - 1][1];
    const fB = carrySource(cv, 2, n, 1);
    let lB = legsOf(srcB, legsB, b, L, fB);
    if (n === DOME && !jump) {
      const w = b < CUT ? walkOf(srcB, srcB, 0, fB, b) : shifted(walkOf(B_ENTER, B_DOME, 0.1, 1, b - CUT), CUT);
      lB = { w, a: w, z: STILL };
    }
    const wB = lB.w;
    const xBw = carry(cv, 0, n, wB.x, wB.x, 1);
    const xB = xBw + cam;
    const dB = carry(cv, 2, n, 0, faceOf(n === DOME && b >= CUT ? 1 : fB, B_TURN[n], b, L, lB.a, lB.z), 1);
    let sb = bodyOf(wB, B_P, n, t, b, 1);
    sb = keyed(sb, B_R[n], u, xB, dB, 1);
    sb = keyed(sb, B_L[n], u, xB, dB, -1);
    if (n === ARRIVE) sb = look(sb, -0.1 * st(0.8, 0.86));
    if (n === BALLS) sb = look(sb, 0.16 * hd(0.5, 0.58, 0.8, 0.9));
    if (n === SUGAR) sb = look(sb, 0.14 * hd(0.04, 0.1, 0.92, 0.96));
    if (n === ONCE) sb = look(sb, -0.12 * hd(0.24, 0.3, 0.9, 1));
    if (n === OUTLIER) sb = look(sb, -0.12 * hd(0.2, 0.28, 0.6, 0.7));
    if (n === TONIC) sb = look(sb, -0.18 * hd(0.37, 0.42, 0.6, 0.66));
    if (n === DOME) sb = look(sb, -0.16 * hd(0.6, 0.66, 0.78, 0.86));
    if (n === PLANET) sb = look(sb, -0.18 * hd(0.26, 0.32, 0.48, 0.54));
    if (n === COMMIT) sb = look(sb, -0.1 * hd(0.1, 0.16, 0.8, 0.9));
    const prevB = carryFrom(heldB, n, hHold(B_P[p], t, 1));
    const figB = keepHeld(heldB, wB.walking ? mixKeepLegs(prevB, sb, trAt(1)) : mixStance(prevB, sb, trAt(1)));

    // ── the scientist ───────────────────────────────────────────────────────
    const legsT = TH_LEGS[n];
    let srcT = carrySource(cv, 3, n, TH_WORK);
    if (jump) srcT = legsT[legsT.length - 1][1];
    const fT = carrySource(cv, 4, n, -1);
    let lT = legsOf(srcT, legsT, b, L, fT);
    if (n === DOME && !jump) {
      const w = b < CUT ? walkOf(srcT, srcT, 0, fT, b) : shifted(walkOf(TH_ENTER, TH_DOME, 0.25, 1, b - CUT), CUT);
      lT = { w, a: w, z: STILL };
    }
    const wT = lT.w;
    const xTw = carry(cv, 3, n, wT.x, wT.x, 1);
    const xT = xTw + cam;
    const dT = carry(cv, 4, n, 0, faceOf(n === DOME && b >= CUT ? 1 : fT, TH_TURN[n], b, L, lT.a, lT.z), 1);
    let sh = bodyOf(wT, TH_P, n, t, b, 0);
    sh = keyed(sh, TH_R[n], u, xT, dT, 1);
    sh = keyed(sh, TH_L[n], u, xT, dT, -1);
    // the telescope's aim, and his hand on its tube while he swings it
    const aimNow = n < WRONG ? AIM0 : n === WRONG ? lerp(AIM0, AIM1, st(0.14, 0.27)) : AIM1;
    const aim = carry(cv, 5, n, AIM0, aimNow, tr);
    if (n === WRONG) {
      const g = hd(0.04, 0.12, 0.3, 0.36);
      const gp = tubeAt(12, aim);
      sh = hand(sh, xT, GROUND, dT, 1, gp.x + cam + HX, gp.y + 1, g);
      sh = lean(sh, -0.08 * st(0.34, 0.44));
    }
    if (n === WORK) {
      const down = 0.12 * (1 - stage(b, L, S0(6.3), S0(6.6)));
      const squint = 0.08 * stage(b, L, S0(3.45), S0(3.7)) * (1 - stage(b, L, S0(4.2), S0(4.4)));
      sh = look(sh, down + squint - 0.2 * stage(b, L, S0(7.6), S0(7.95)));
      sh = lean(sh, 0.05 * stage(b, L, S0(3.45), S0(3.7)) * (1 - stage(b, L, S0(4.2), S0(4.4))));
    }
    if (n === ARRIVE) sh = look(sh, -0.06 * st(0.1, 0.2));
    if (n === GUESS) sh = look(sh, -0.18 * hd(0.42, 0.5, 0.84, 0.92));
    if (n === FAIR) sh = look(sh, 0.14 * hd(0.28, 0.34, 0.6, 0.66));
    if (n === HIDDEN) sh = look(sh, 0.06 * hd(0.1, 0.16, 0.3, 0.36) - 0.18 * hd(0.54, 0.6, 0.74, 0.8));
    if (n === FAIL) sh = look(sh, 0.05 * Math.sin(Math.min(1, clamp01((u - 0.18) / 0.36)) * Math.PI * 4));
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t, 0));
    const figT = keepHeld(heldT, wT.walking ? mixKeepLegs(prevT, sh, trAt(0)) : mixStance(prevT, sh, trAt(0)));

    const pb = pose(figB, xB, GROUND, K, dB, 1);
    const ph = pose(figT, xT, GROUND, K, dT, 1);
    const tR = wristOf(ph, 'wrR');
    const tL = wristOf(ph, 'wrL');
    const bR = wristOf(pb, 'wrR');
    const sT = dT < 0 ? -1 : 1;
    const sB = dB < 0 ? -1 : 1;

    // ── the door, as she comes in ───────────────────────────────────────────
    const door = carry(cv, 6, n, 0, n === ARRIVE ? sec(1.0, 1.45) * (1 - sec(2.6, 3.4)) : 0, tr);

    // ── his rig: the jar poured, the burner lit, a drop, the notebook ────────
    const W0 = n === WORK;
    const jarHold = W0 ? hd(S0(0.4), S0(0.5), S0(2.3), S0(2.45)) : 0;
    const jarTip = W0 ? hd(S0(0.6), S0(0.85), S0(1.75), S0(2.0)) : 0;
    const jarX = carry(cv, 7, n, JAR.x, lerp(JAR.x + cam, tR.x, jarHold), tr);
    const jarY = carry(cv, 8, n, JAR.y, lerp(JAR.y, tR.y, jarHold), tr);
    const jarRot = carry(cv, 9, n, 0, -100 * jarTip, tr);
    const pour = W0 ? hd(S0(0.8), S0(0.9), S0(1.7), S0(1.8)) : 0;
    const level = carry(cv, 10, n, 0, W0 ? stage(b, L, S0(0.9), S0(1.8)) : 1, tr);
    const lit = carry(cv, 11, n, 0, W0 ? stage(b, L, S0(3.05), S0(3.2)) : 1, tr);
    const boil = carry(cv, 12, n, 0, W0 ? stage(b, L, S0(3.6), S0(4.2)) : n < DOME ? 1 : 0, tr);
    const dropHold = W0 ? hd(S0(3.9), S0(4.0), S0(4.9), S0(5.0)) : 0;
    const dropperX = carry(cv, 13, n, DROPPER.x, lerp(DROPPER.x + cam, tL.x, dropHold), tr);
    const dropperY = carry(cv, 14, n, DROPPER.y, lerp(DROPPER.y, tL.y, dropHold), tr);
    const dropperUp = carry(cv, 15, n, 0, dropHold, tr);
    const drip = W0 && b > 4.6 ? clamp01((b - 4.6) / 0.3) * (1 - sec(4.92, 5.0)) : 0;
    const penHold = W0 ? hd(S0(5.15), S0(5.25), S0(6.15), S0(6.25)) : 0;
    const penX = carry(cv, 16, n, PENCIL.x, lerp(PENCIL.x + cam, tR.x, penHold), tr);
    const penY = carry(cv, 17, n, PENCIL.y, lerp(PENCIL.y, tR.y, penHold), tr);
    const penUp = carry(cv, 18, n, 0, penHold, tr);
    const note = carry(cv, 19, n, 0, W0 ? stage(b, L, S0(5.4), S0(6.0)) : 1, tr);
    const finger = carry(cv, 20, n, 0, n === GUESS ? hd(0.05, 0.08, 0.36, 0.42) : 0, tr);

    // ── the kit: the big flame turned down, the spoon, the sugar ─────────────
    const bigNow = n < FAIR ? 1 : n === FAIR ? 1 - st(0.36, 0.46) : 0;
    const big = carry(cv, 21, n, 1, bigNow, tr);
    const spoonHold = n === SUGAR ? hd(0.07, 0.09, 0.95, 0.96) : 0;
    const spoonX = carry(cv, 22, n, SPOON_REST.x, lerp(SPOON_REST.x + cam, bR.x, spoonHold), tr);
    const spoonY = carry(cv, 23, n, SPOON_REST.y, lerp(SPOON_REST.y, bR.y, spoonHold), tr);
    const spoonO = carry(cv, 24, n, 0, n < SUGAR ? 0 : n === SUGAR ? st(0.06, 0.08) : n < DOME ? 1 : 0, tr);
    const sugarA = n === SUGAR ? hd(0.11, 0.124, 0.24, 0.26) : 0;
    const sugarB = n === SUGAR ? hd(0.84, 0.855, 0.9, 0.92) : 0;

    // ── the stopwatch: out of her pocket, held, tapped, back in her pocket ──
    const swIn = n < ONCE ? 0 : n === ONCE ? st(0.06, 0.09) : n < TONIC ? 1 : n === TONIC ? 1 - st(0.02, 0.035) : 0;
    const swX = carry(cv, 25, n, bR.x, bR.x + sB * 2, tr);
    const swY = carry(cv, 26, n, bR.y, bR.y - 2.5, tr);
    const swO = carry(cv, 27, n, 0, swIn, tr);
    const click = n === ONCE ? hd(0.25, 0.26, 0.27, 0.29) : n === REPEAT ? hd(0.055, 0.065, 0.07, 0.085) : 0;

    // ── the tonic: hers, uncorked, sipped, handed over, set on the shelf ────
    let bottleX = SET.x + cam;
    let bottleY = SET.y;
    let bottleRot = 0;
    let bottleO = n > HOPE && n < DOME ? 1 : 0;
    if (n === TONIC) {
      bottleX = bR.x + sB * 1.5;
      bottleY = bR.y;
      bottleRot = -sB * 70 * hd(0.16, 0.2, 0.26, 0.3);
      bottleO = st(0.04, 0.055);
    }
    if (n === HOPE) {
      const handed = st(0.03, 0.04);
      const set = st(0.215, 0.223);
      bottleX = lerp(lerp(bR.x + sB * 1.5, tR.x + sT * 1.5, handed), SET.x + cam, set);
      bottleY = lerp(lerp(bR.y, tR.y, handed), SET.y, set);
      bottleO = 1;
    }
    const botX = carry(cv, 28, n, bottleX, bottleX, tr);
    const botY = carry(cv, 29, n, bottleY, bottleY, tr);
    const botR = carry(cv, 30, n, 0, bottleRot, tr);
    const botO = carry(cv, 31, n, 0, bottleO, tr);
    const corkFly = n === TONIC ? clamp01((b - 0.4) / 0.55) : n > TONIC ? 1 : 0;
    const corkO = carry(cv, 32, n, 0, n === TONIC ? st(0.04, 0.055) : n > TONIC && n < DOME ? 1 : 0, tr);

    // ── the board: three timings, the eleven ringed ──────────────────────────
    const n1 = carry(cv, 33, n, 0, n < REPEAT ? 0 : n === REPEAT ? sec(1.15, 1.5) : n < DOME ? 1 : 0, tr);
    const n2 = carry(cv, 34, n, 0, n < REPEAT ? 0 : n === REPEAT ? sec(2.35, 2.7) : n < DOME ? 1 : 0, tr);
    const n3 = carry(cv, 35, n, 0, n < REPEAT ? 0 : n === REPEAT ? sec(3.55, 3.9) : n < DOME ? 1 : 0, tr);
    const ring = carry(cv, 36, n, 0, n < CHECK ? 0 : n === CHECK ? st(0.08, 0.155) : n < DOME ? 1 : 0, tr);
    const chalk = carry(cv, 37, n, 0, n === REPEAT ? hd(0.1, 0.17, 0.68, 0.74) : n === CHECK ? hd(0.04, 0.07, 0.17, 0.2) : 0, tr);

    // ── the three games ─────────────────────────────────────────────────────
    const rThermo = carry(cv, 38, n, 0, ans(1, Q1), tr);
    const rBeak = carry(cv, 39, n, 0, ans(2, Q1), tr);
    const rBurn = carry(cv, 40, n, 0, ans(3, Q1), tr);
    const rTonic = carry(cv, 41, n, 0, ans(4, Q2), tr);
    const rCrate = carry(cv, 42, n, 0, ans(5, Q2), tr);
    const rSign = carry(cv, 43, n, 0, ans(6, Q2), tr);
    const rEye = carry(cv, 44, n, 0, ans(7, Q3), tr);
    const rPoster = carry(cv, 45, n, 0, ans(8, Q3), tr);
    const rDiary = carry(cv, 46, n, 0, ans(9, Q3), tr);

    // ── the lens: wide for the room, then in on the two of them as they talk, in close
    //    on the kit (Q1) and the shelf (Q2); wide again for the dome ────────────────
    let lz = LENS[n];
    if (n === WORK) lz = [1 + 0.5 * sec(0.6, 6.0), 300, 466];
    if (n === DOME && !jump && b < CUT) lz = LENS[DOME - 1];
    const zin = ease01(b / 1.1);
    const zs = carry(cv, 47, n, 1, lz[0], zin);
    const zx = carry(cv, 48, n, 300, lz[1], zin);
    const zy = carry(cv, 49, n, 470, lz[2], zin);

    return {
      pb, ph, cam, t, sT, sB, fade, tR, bR,
      zoom: { s: zs, x: zx, y: zy },
      door, jar: { x: jarX, y: jarY, rot: jarRot }, pour, level, lit, boil,
      dropper: { x: dropperX, y: dropperY, up: dropperUp }, drip,
      pen: { x: penX, y: penY, up: penUp }, note, finger,
      big, spoon: { x: spoonX, y: spoonY, o: spoonO, held: spoonHold }, sugarA, sugarB,
      sw: { x: swX, y: swY, o: swO, click },
      bottle: { x: botX, y: botY, rot: botR, o: botO }, cork: { fly: corkFly, o: corkO },
      nums: [n1, n2, n3], ring, chalk,
      rThermo, rBeak, rBurn, rTonic, rCrate, rSign, rEye, rPoster, rDiary, aim,
      q1: carry(cv, 50, n, 0, Q1[n], tr),
      q2: carry(cv, 51, n, 0, Q2[n], tr),
      q3: carry(cv, 52, n, 0, Q3[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.pb);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.ph);
  const lens = useAnimatedStyle(() => {
    const z = SCENE.value.zoom;
    return { transform: [{ translateX: z.x * (1 - z.s) }, { translateY: z.y * (1 - z.s) }, { scale: z.s }] };
  });
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));
  const world2 = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.lens, lens]}>
        {/* THE WORLD behind them, far to near: the laboratory (x 0–400) and the dome (x 400–800) */}
        <Animated.View style={[styles.world, world]} pointerEvents="none">
          <LessonPicture name="sci7-lab-far" />
          <Twinkles S={SCENE} items={LAB_STARS} />
          <Door S={SCENE} />
          <LessonPicture name="sci7-lab-mid" />
          <GasFlame S={SCENE} x={104} y={324} k={0} />
          <GasFlame S={SCENE} x={186} y={380} k={1} />
          <GasFlame S={SCENE} x={368} y={324} k={2} />
          <Board S={SCENE} />
          <Shelf S={SCENE} />
          <LessonPicture name="sci7-dome-far" />
          <Twinkles S={SCENE} items={DOME_STARS} />
          <Mars S={SCENE} />
          <View style={styles.pierShadow} />
          <View style={styles.deskShadow} />
          <LessonPicture name="sci7-dome-mid" />
          <LampFlame S={SCENE} />
          <Scope S={SCENE} />
          <Poster S={SCENE} />
          <Diary S={SCENE} />
        </Animated.View>
        {/* the bench, BEHIND both people (they work at its near side), and the apparatus on it */}
        <Animated.View style={[styles.world, world2]} pointerEvents="none">
          <View style={styles.benchShadow} />
          <Flames S={SCENE} />
          <LessonPicture name="sci7-lab-bench" />
          <Beakers S={SCENE} />
          <Flask S={SCENE} />
          <Notes S={SCENE} />
        </Animated.View>
        {/* cast: tophat */}
        <Stickman D={DT} k={K} role="lead" wear={BY_ID.magistrate.pieces} />
        {/* cast: bun */}
        <Stickman D={DB} k={K} role="second" wear={BY_ID.bun.pieces} />
        {/* what is in their hands */}
        <Jar S={SCENE} />
        <Dropper S={SCENE} />
        <Pencil S={SCENE} />
        <Finger S={SCENE} />
        <Spoon S={SCENE} />
        <Stopwatch S={SCENE} />
        <Bottle S={SCENE} />
        <Chalk S={SCENE} />
        {on(Q3) ? <ScopeView S={SCENE} /> : null}
        {/* the labels and the things to tap */}
        {on(Q1) ? <Plates S={SCENE} k="q1" items={Q1_PLATES} /> : null}
        {on(Q2) ? <Plates S={SCENE} k="q2" items={Q2_PLATES} /> : null}
        {on(Q3) ? <Plates S={SCENE} k="q3" items={Q3_PLATES} /> : null}
        <Fade S={SCENE} />
        {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={BENCH_Q} k="q1" /> : null}
        {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={SHELF_Q} k="q2" /> : null}
        {on(Q3) ? <StageTargets picked={picked} onPick={onPick} live={Q3[i] === 1} S={SCENE} qs={SKY_Q} k="q3" /> : null}
      </Animated.View>
    </View>
  );
}

// ── the living world ─────────────────────────────────────────────────────────

/** Stars that come and go a little: in the laboratory's windows, and in the dome's slit. */
const LAB_STARS: readonly (readonly number[])[] = [[44, 282, 0], [66, 300, 1.4], [132, 312, 2.2], [160, 282, 0.7], [312, 290, 1.9], [338, 306, 3.1]];
const DOME_STARS: readonly (readonly number[])[] = [[HX + 108, 236, 0], [HX + 140, 258, 1.1], [HX + 198, 240, 2.3], [HX + 222, 286, 0.6], [HX + 120, 300, 1.7], [HX + 176, 270, 2.9], [HX + 206, 336, 0.4]];
function Twinkles({ S, items }: { S: SharedValue<any>; items: readonly (readonly number[])[] }) {
  return <>{items.map(([x, y, ph], k) => <Twinkle key={k} S={S} x={x} y={y} ph={ph} />)}</>;
}
function Twinkle({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const v = 0.5 + 0.5 * Math.sin(S.value.t * 1.3 + ph * 2.1);
    return { opacity: 0.35 + 0.65 * v, transform: [{ translateX: x }, { translateY: y }, { scale: 0.7 + 0.5 * v }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.starH} />
      <View style={styles.starV} />
    </Animated.View>
  );
}
/** The laboratory door: shut, it swings open as she comes in, and back. */
function Door({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: 300 }, { scaleX: 1 - 0.78 * S.value.door }] }));
  return <Animated.View style={[styles.doorLeaf, st]} pointerEvents="none"><LessonPicture name="sci7-door" /></Animated.View>;
}
/** A gas jet in its glass shade, wavering. */
function GasFlame({ S, x, y, k }: { S: SharedValue<any>; x: number; y: number; k: number }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: x }, { translateY: y }, { scaleY: 1 + 0.16 * Math.sin(S.value.t * 7.3 + k * 2) }, { scaleX: 1 + 0.08 * Math.sin(S.value.t * 5.1 + k) }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.gas} /></Animated.View>;
}
/** The blackboard's three timings, chalked in one after another, and the eleven ringed. */
function Board({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {['40', '42', '11'].map((s, k) => <Num key={s} S={S} k={k} s={s} />)}
      <Ring S={S} />
    </>
  );
}
function Num({ S, k, s }: { S: SharedValue<any>; k: number; s: string }) {
  const st = useAnimatedStyle(() => ({ width: 15 * S.value.nums[k] }));
  return (
    <Animated.View style={[styles.numWipe, { top: ROWS[k] - 5.5 }, st]} pointerEvents="none">
      <Text style={styles.num}>{s}</Text>
    </Animated.View>
  );
}
function Ring({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.ring, transform: [{ scale: 0.6 + 0.4 * S.value.ring }] }));
  return <Animated.View style={[styles.ring, st]} pointerEvents="none" />;
}
/** The reagent shelf's three things. */
function Shelf({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <Tonic2 S={S} />
      <Crate S={S} />
      <Sign S={S} />
    </>
  );
}
/** The second tonic: picked, it rocks, knocks against hers and settles. */
function Tonic2({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rTonic;
    const rock = r > 0 && r < 1 ? Math.sin(r * Math.PI * 4) * (1 - r) * 22 : 0;
    return { transform: [{ translateX: TONIC2.x }, { translateY: TONIC2.y }, { rotate: `${rock}deg` }] };
  });
  return <Animated.View style={[styles.rider, styles.footPivot, st]} pointerEvents="none"><BottleBody /></Animated.View>;
}
/** The crate: picked, its plain bottles hop up one after another and settle. */
function Crate({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rCrate;
    const squash = Math.sin(Math.PI * clamp01(r * 1.6)) * 0.08;
    return { transform: [{ translateX: CRATE.x }, { translateY: CRATE.y }, { scaleX: 1 + squash }, { scaleY: 1 - squash }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="sci7-crate" />
      {[0, 1, 2, 3].map((k) => <Hop key={k} S={S} k={k} />)}
    </Animated.View>
  );
}
function Hop({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rCrate;
    const f = clamp01((r - 0.12 * k) / 0.45);
    return { opacity: f > 0 && f < 1 ? 1 : 0, transform: [{ translateX: -10.5 + k * 7 }, { translateY: -9 * Math.sin(Math.PI * f) }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.hopTag} /></Animated.View>;
}
/** The MIRACLE label: picked, it wobbles on its edge and topples flat. */
function Sign({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rSign;
    const wob = r < 0.4 ? Math.sin(r * Math.PI * 7.5) * 10 : 0;
    const fall = clamp01((r - 0.35) / 0.65);
    const bounce = fall >= 1 ? 0 : Math.abs(Math.sin(fall * Math.PI * 2)) * (1 - fall) * 2;
    return {
      transform: [{ translateX: SIGN.x }, { translateY: SIGN.y + 8 * fall - bounce }, { rotate: `${wob + 80 * ease01(fall)}deg` }, { scaleY: 1 - 0.55 * ease01(fall) }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="sci7-sign" /></Animated.View>;
}
/** Mars, low in the slit, burning a steady red. */
function Mars({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: HX + MARS.x }, { translateY: MARS.y }, { scale: 1 + 0.08 * Math.sin(S.value.t * 1.7) }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.mars} />
      <View style={styles.marsShade} />
    </Animated.View>
  );
}
/** The oil lamp on the desk. */
function LampFlame({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: HX + 388 }, { translateY: 447 }, { scaleY: 1 + 0.18 * Math.sin(S.value.t * 6.1) }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.lampFlame} /></Animated.View>;
}
/** The telescope tube on its fork: swung onto Mars; picked, its eyepiece glints. */
function Scope({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: HX + PIV.x }, { translateY: PIV.y }, { rotate: `${S.value.aim}deg` }] }));
  const glint = useAnimatedStyle(() => {
    const r = S.value.rEye;
    return { opacity: Math.sin(Math.PI * Math.min(1, r * 1.5)), transform: [{ scale: 0.5 + r }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="sci7-scope" />
      <Animated.View style={[styles.glint, glint]} />
    </Animated.View>
  );
}
/** The poster: picked, its right pin pops and it swings down from the left one. */
function Poster({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rPoster;
    const f = clamp01(r * 1.2);
    const swing = f < 1 ? 62 * ease01(f) + 10 * Math.sin(f * Math.PI * 3) * (1 - f) : 62;
    return { transform: [{ translateX: HX + POSTER.x }, { translateY: POSTER.y }, { rotate: `${swing * Math.min(1, r * 4)}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="sci7-poster" /></Animated.View>;
}
/** Her diary on the desk: picked, it hops, flaps open and slaps shut with a shake. */
function Diary({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rDiary;
    const hop = Math.sin(Math.PI * clamp01(r * 2.2)) * 4;
    const shake = r > 0.5 && r < 1 ? Math.sin(r * 60) * (1 - r) * 3 : 0;
    return { transform: [{ translateX: HX + DIARY.x + shake }, { translateY: DIARY.y - hop }] };
  });
  const cover = useAnimatedStyle(() => {
    const r = S.value.rDiary;
    const open = Math.sin(Math.PI * clamp01((r - 0.1) / 0.5));
    return { transform: [{ translateY: -3.2 * open }, { scaleY: 1 - 1.8 * open }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.diaryPages} />
      <View style={styles.diaryLine} />
      <Animated.View style={[styles.diaryCover, cover]} />
    </Animated.View>
  );
}

// ── on the bench ─────────────────────────────────────────────────────────────

/** The three burners' flames: the kit's two (the big one roaring until he turns it down;
 *  picked in Q1 it roars up again to show what it was), and his own, lit at 3.1s. */
function Flames({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <Flame S={S} x={KIT_S} which="small" />
      <Flame S={S} x={KIT_B} which="big" />
      <Flame S={S} x={MY_X} which="mine" />
    </>
  );
}
function Flame({ S, x, which }: { S: SharedValue<any>; x: number; which: 'small' | 'big' | 'mine' }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const f = Math.sin(v.t * 11 + x) * 0.08 + Math.sin(v.t * 7.3 + x * 0.3) * 0.06;
    let h = 0.42;
    let o = 1;
    if (which === 'big') h = 0.42 + 0.58 * Math.max(v.big, Math.sin(Math.PI * Math.min(1, v.rBurn * 1.25)));
    if (which === 'mine') {
      h = 0.36 * v.lit;
      o = v.lit;
    }
    const top = which === 'mine' ? 454 : 450;
    return { opacity: o, transform: [{ translateX: x }, { translateY: top }, { scaleY: Math.max(0.01, h * (1 + f)) }, { scaleX: 0.85 + 0.3 * h }] };
  });
  const roar = useAnimatedStyle(() => {
    const v = S.value;
    if (which !== 'big') return { opacity: 0 };
    return { opacity: Math.max(v.big, Math.sin(Math.PI * Math.min(1, v.rBurn * 1.25))) };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.flameOuter} />
      <Animated.View style={[styles.flameRoar, roar]} />
      <View style={styles.flameInner} />
    </Animated.View>
  );
}
/** The two beakers of water on the kit's tripods, each with its thermometer. */
function Beakers({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <Beaker S={S} x={KIT_S} k={0} />
      <Beaker S={S} x={KIT_B} k={1} />
    </>
  );
}
function Beaker({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    // picked in Q1, both beakers lift together, slosh the same, and set down with a thud
    const r = v.rBeak;
    const lift = Math.sin(Math.PI * clamp01(r * 1.6)) * 5;
    const land = r > 0.6 && r < 1 ? Math.sin((r - 0.6) * 40) * (1 - r) * 0.6 : 0;
    return { transform: [{ translateX: x }, { translateY: GAUZE - lift + land }] };
  });
  const water = useAnimatedStyle(() => {
    const v = S.value;
    const slosh = Math.sin(Math.PI * clamp01(v.rBeak * 1.6)) * Math.sin(v.t * 9) * 9;
    const sugar = k === 0 ? v.sugarA : v.sugarB;
    return { transform: [{ rotate: `${slosh}deg` }], opacity: 1 - 0.15 * sugar };
  });
  const bubbles = useAnimatedStyle(() => {
    const v = S.value;
    const lit = k === 1 ? Math.max(v.big, 0.35) : 0.35;
    const ph = (v.t * (k ? 1.4 : 0.9)) % 1;
    return { opacity: lit * (1 - ph), transform: [{ translateY: -2 - 7 * ph }] };
  });
  const merc = useAnimatedStyle(() => {
    const v = S.value;
    // picked in Q1, both thermometers' spirit climbs to the same mark, then wobbles
    const r = v.rThermo;
    const rise = Math.sin(Math.PI * clamp01(r * 1.4)) * 0.5;
    return { transform: [{ scaleY: 0.45 + rise + (r > 0.7 ? Math.sin(r * 50) * (1 - r) * 0.1 : 0) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.water, water]} />
      <Animated.View style={[styles.beakBubble, bubbles]} />
      <View style={styles.beakGlass} />
      <View style={styles.beakLip} />
      <View style={styles.thermo}>
        <View style={styles.thermoBulb} />
        <Animated.View style={[styles.thermoSpirit, merc]} />
      </View>
    </Animated.View>
  );
}
/** His flask on its tripod: filled as he pours, boiling once lit, a drop falling in. */
function Flask({ S }: { S: SharedValue<any> }) {
  const fillSt = useAnimatedStyle(() => ({ height: 14.2 * S.value.level }));
  const bub = (k: number) => {
    'worklet';
    const v = S.value;
    const ph = (v.t * (0.9 + 0.3 * k) + k * 0.37) % 1;
    return { opacity: v.boil * v.level * (1 - ph), transform: [{ translateX: -4 + 4 * k }, { translateY: -1 - 10 * ph }] };
  };
  const b0 = useAnimatedStyle(() => bub(0));
  const b1 = useAnimatedStyle(() => bub(1));
  const b2 = useAnimatedStyle(() => bub(2));
  const drop = useAnimatedStyle(() => {
    const d = S.value.drip;
    return { opacity: d > 0 ? 1 : 0, transform: [{ translateY: -24 + 15 * d * d }] };
  });
  return (
    <Animated.View style={[styles.rider, styles.flaskAt]} pointerEvents="none">
      <Animated.View style={[styles.liquidClip, fillSt]}>
        <View style={styles.liquidPic}><LessonPicture name="sci7-liquid" /></View>
      </Animated.View>
      <Animated.View style={[styles.flaskBubble, b0]} />
      <Animated.View style={[styles.flaskBubble, b1]} />
      <Animated.View style={[styles.flaskBubble, b2]} />
      <LessonPicture name="sci7-flask" />
      <Animated.View style={[styles.dropBead, drop]} />
    </Animated.View>
  );
}
/** The three lines he writes in his notebook. */
function Notes({ S }: { S: SharedValue<any> }) {
  const a = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, clamp01(S.value.note * 3)) }] }));
  const b = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, clamp01(S.value.note * 3 - 1)) }] }));
  const c = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, clamp01(S.value.note * 3 - 2)) }] }));
  return (
    <>
      <Animated.View style={[styles.noteLine, { top: 461.2 }, a]} />
      <Animated.View style={[styles.noteLine, { top: 461.9, width: 4 }, b]} />
      <Animated.View style={[styles.noteLine, { left: 311.6, top: 461.2, width: 2.2 }, c]} />
    </>
  );
}

// ── what is in their hands ───────────────────────────────────────────────────

/** The stock jar of blue solution: stood on the bench, lifted, tipped to pour, set down. */
function Jar({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const j = S.value.jar;
    return { transform: [{ translateX: j.x }, { translateY: j.y }, { rotate: `${j.rot}deg` }] };
  });
  const stream = useAnimatedStyle(() => {
    const v = S.value;
    const j = v.jar;
    const dx = MOUTH.x + v.cam - (j.x - 1);
    const dy = MOUTH.y + 2 - j.y;
    const len = Math.max(0.1, Math.hypot(dx, dy));
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI - 90;
    return { opacity: v.pour, height: len, transform: [{ translateX: j.x - 1 }, { translateY: j.y }, { rotate: `${ang}deg` }] };
  });
  return (
    <>
      <Animated.View style={[styles.streamAt, stream]} pointerEvents="none" />
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <View style={styles.jarGlass} />
        <View style={styles.jarFill} />
        <View style={styles.jarLabel} />
        <View style={styles.jarNeck} />
      </Animated.View>
    </>
  );
}
function Dropper({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const d = S.value.dropper;
    return { transform: [{ translateX: d.x }, { translateY: d.y }, { rotate: `${90 * (1 - d.up)}deg` }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.dropBulb} />
      <View style={styles.dropTube} />
    </Animated.View>
  );
}
function Pencil({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const d = S.value.pen;
    return { transform: [{ translateX: d.x }, { translateY: d.y }, { rotate: `${lerp(-88, -30 * S.value.sT, d.up)}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.pencil} /><View style={styles.pencilTip} /></Animated.View>;
}
/** One finger held up. */
function Finger({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.finger,
    transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y }, { scaleY: 0.4 + 0.6 * S.value.finger }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.finger} /></Animated.View>;
}
/** Her spoon, and the sugar off it. */
function Spoon({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.spoon;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${lerp(90, 0, v.held)}deg` }] };
  });
  const grains = useAnimatedStyle(() => {
    const v = S.value;
    const g = Math.max(v.sugarA, v.sugarB);
    const ph = (v.t * 2.2) % 1;
    return { opacity: g * (1 - ph), transform: [{ translateY: 6 + 7 * ph }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.spoonStem} />
      <View style={styles.spoonBowl} />
      <Animated.View style={[styles.grains, grains]} />
    </Animated.View>
  );
}
/** Her stopwatch: a nickel case on a ring, its crown pressed to start it. */
function Stopwatch({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.sw;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { scale: 1 + 0.12 * v.click }] };
  });
  const hand = useAnimatedStyle(() => ({ transform: [{ rotate: `${(S.value.t * 120) % 360}deg` }] }));
  const crown = useAnimatedStyle(() => ({ transform: [{ translateY: 1.2 * S.value.sw.click }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.swCrown, crown]} />
      <View style={styles.swCase} />
      <View style={styles.swFace} />
      <Animated.View style={[styles.swHandWrap, hand]}><View style={styles.swHand} /></Animated.View>
    </Animated.View>
  );
}
/** A green tonic bottle: a body, a shoulder, a neck and its paper label. */
function BottleBody() {
  return (
    <>
      <View style={styles.botNeck} />
      <View style={styles.botBody} />
      <View style={styles.botShade} />
      <View style={styles.botLabel} />
    </>
  );
}
/** Her tonic: out of her pocket, uncorked (the cork flies), sipped, handed over, set on the shelf. */
function Bottle({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.bottle;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y + 6 }, { rotate: `${v.rot}deg` }] };
  });
  const cork = useAnimatedStyle(() => {
    const v = S.value;
    const f = v.cork.fly;
    const bo = v.bottle;
    const x = lerp(bo.x, CORK_REST.x + v.cam, f) + 10 * Math.sin(Math.PI * f);
    const y = lerp(bo.y - 9, CORK_REST.y, f) - 18 * Math.sin(Math.PI * Math.min(1, f * 1.2));
    return { opacity: v.cork.o, transform: [{ translateX: x }, { translateY: y }, { rotate: `${540 * f}deg` }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, st]} pointerEvents="none"><BottleBody /></Animated.View>
      <Animated.View style={[styles.rider, cork]} pointerEvents="none"><View style={styles.cork} /></Animated.View>
    </>
  );
}
function Chalk({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.chalk, transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y }, { rotate: `${S.value.sT * 40}deg` }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.chalk} /></Animated.View>;
}

// ── Q3's answer: the view through the eyepiece ───────────────────────────────

/** Picked, the eyepiece's view pops up over the slit: Mars, and an empty patch beside it. */
function ScopeView({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rEye;
    const g = clamp01(r * 1.4);
    const pop = g < 1 ? ease01(g) * (1 + 0.18 * Math.sin(g * Math.PI)) : 1;
    return { opacity: g > 0 ? 1 : 0, transform: [{ translateX: 166 }, { translateY: 300 }, { scale: Math.max(0.01, pop) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.viewRim} />
      <View style={styles.viewSky} />
      <View style={styles.viewMars} />
      <View style={styles.viewEmpty} />
      <View style={[styles.viewStar, { left: -16, top: -14 }]} />
      <View style={[styles.viewStar, { left: 14, top: 12 }]} />
      <View style={[styles.viewStar, { left: -4, top: 18 }]} />
    </Animated.View>
  );
}

/** The fade through the night on the way up to the dome. */
function Fade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.fade }));
  return <Animated.View style={[styles.fade, st]} pointerEvents="none" />;
}

// ── the labels and the three games ───────────────────────────────────────────

type Plate = { x: number; y: number; w: number; lines: readonly string[] };
const Q1_PLATES: Plate[] = [
  { x: 173, y: 389, w: 78, lines: ['THERMOMETERS'] },
  { x: 124, y: 425, w: 48, lines: ['BEAKERS'] },
  { x: 173, y: 465, w: 50, lines: ['BURNERS'] },
];
const Q2_PLATES: Plate[] = [
  { x: TONIC2.x, y: 437, w: 36, lines: ['TONIC'] },
  { x: CRATE.x, y: 382, w: 46, lines: ['BOTTLES'] },
  { x: SIGN.x - 3, y: 437, w: 34, lines: ['LABEL'] },
];
const Q3_PLATES: Plate[] = [
  { x: POSTER.x + 32, y: 401, w: 46, lines: ['POSTER'] },
  { x: 268, y: 452, w: 54, lines: ['EYEPIECE'] },
  { x: DIARY.x, y: 466, w: 40, lines: ['DIARY'] },
];
function Plates({ S, k, items }: { S: SharedValue<any>; k: 'q1' | 'q2' | 'q3'; items: Plate[] }) {
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
/** LEVEL THE BENCH: which pair makes her race unfair? */
const BENCH_Q: Q[] = [
  { id: 'thermo', left: 134, top: 386, w: 86, h: 38, r: 5, correct: false },
  { id: 'beakers', left: 146, top: 424, w: 54, h: 18, r: 4, correct: false },
  { id: 'burners', left: 146, top: 442, w: 54, h: 42, r: 5, correct: true },
];
/** STOCK THE SHELF: which would let them test her tonic fairly? */
const SHELF_Q: Q[] = [
  { id: 'tonic', left: TONIC2.x - 16, top: 410, w: 24, h: 42, r: 4, correct: false },
  { id: 'crate', left: CRATE.x - 14, top: 398, w: 28, h: 32, r: 4, correct: true },
  { id: 'sign', left: SIGN.x - 15, top: 404, w: 30, h: 48, r: 4, correct: false },
];
/** CHECK THE SKY: which could prove her bright planet wrong? (the dome, on screen) */
const SKY_Q: Q[] = [
  { id: 'poster', left: POSTER.x - 2, top: 348, w: 68, h: 68, r: 5, correct: false },
  { id: 'eyepiece', left: 252, top: 430, w: 40, h: 38, r: 6, correct: true },
  { id: 'diary', left: DIARY.x - 22, top: 446, w: 44, h: 36, r: 5, correct: false },
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
  lens: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  world: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  footPivot: { transformOrigin: '50% 100%' },
  benchShadow: { position: 'absolute', left: 104, top: 500, width: 296, height: 6, borderRadius: 3, backgroundColor: SHADE, opacity: 0.4 },
  pierShadow: { position: 'absolute', left: HX + 248, top: 499, width: 52, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.4 },
  deskShadow: { position: 'absolute', left: HX + 338, top: 498, width: 62, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.4 },
  fade: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.sc7Night.shade },
  starH: { position: 'absolute', left: -1.6, top: -0.35, width: 3.2, height: 0.7, borderRadius: 0.35, backgroundColor: W.sc7Star.base },
  starV: { position: 'absolute', left: -0.35, top: -1.6, width: 0.7, height: 3.2, borderRadius: 0.35, backgroundColor: W.sc7Star.base },
  doorLeaf: { position: 'absolute', left: 0, top: 0, width: 24, height: 0, transformOrigin: '0% 0%' },
  gas: { position: 'absolute', left: -1.6, top: -4.6, width: 3.2, height: 4.6, borderTopLeftRadius: 1.6, borderTopRightRadius: 1.6, borderBottomLeftRadius: 1, borderBottomRightRadius: 1, backgroundColor: W.sc7Roar.base, transformOrigin: '50% 100%' },
  numWipe: { position: 'absolute', left: NUM_X, height: 11, overflow: 'hidden' },
  num: { width: 15, fontFamily: 'Inter_700Bold', fontSize: 9.2, lineHeight: 11, color: W.sc7Chalk.base, includeFontPadding: false },
  ring: {
    position: 'absolute', left: NUM_X - 3, top: ROWS[2] - 5.6, width: 17, height: 11.4, borderRadius: 6, borderWidth: 1, borderColor: W.sc7Chalk.base,
  },
  hopTag: { position: 'absolute', left: -2.2, top: -23, width: 4.4, height: 12, borderRadius: 1.2, backgroundColor: W.sc7Glass.base, borderWidth: 0.55, borderColor: INK },
  mars: { position: 'absolute', left: -3.2, top: -3.2, width: 6.4, height: 6.4, borderRadius: 3.2, backgroundColor: W.sc7Mars.base },
  marsShade: { position: 'absolute', left: 0, top: -2.6, width: 2.8, height: 5.2, borderTopRightRadius: 2.6, borderBottomRightRadius: 2.6, backgroundColor: W.sc7Mars.shade },
  lampFlame: { position: 'absolute', left: -1.4, top: -5, width: 2.8, height: 5, borderTopLeftRadius: 1.4, borderTopRightRadius: 1.4, borderBottomLeftRadius: 1, borderBottomRightRadius: 1, backgroundColor: W.sc7Roar.base, transformOrigin: '50% 100%' },
  glint: { position: 'absolute', left: 9, top: -4, width: 8, height: 8, borderRadius: 4, borderWidth: 1.2, borderColor: W.sc7Star.base },
  diaryPages: { position: 'absolute', left: -9, top: -3.6, width: 18, height: 3.6, borderRadius: 0.8, backgroundColor: W.sc7Label.base, borderWidth: 0.6, borderColor: INK },
  diaryLine: { position: 'absolute', left: -7, top: -2, width: 12, height: 0.5, backgroundColor: W.sc7Label.shade },
  diaryCover: { position: 'absolute', left: -9.6, top: -5.4, width: 19.2, height: 2.4, borderRadius: 0.8, backgroundColor: W.sc7Diary.base, borderWidth: 0.6, borderColor: INK, transformOrigin: '50% 100%' },
  flameOuter: { position: 'absolute', left: -2.6, top: -16, width: 5.2, height: 16, borderTopLeftRadius: 2.6, borderTopRightRadius: 2.6, borderBottomLeftRadius: 1.4, borderBottomRightRadius: 1.4, backgroundColor: W.sc7Flame.base },
  flameRoar: { position: 'absolute', left: -2.6, top: -16, width: 5.2, height: 12, borderTopLeftRadius: 2.6, borderTopRightRadius: 2.6, backgroundColor: W.sc7Roar.base },
  flameInner: { position: 'absolute', left: -1.2, top: -6.5, width: 2.4, height: 6.5, borderTopLeftRadius: 1.2, borderTopRightRadius: 1.2, backgroundColor: W.sc7Flame.shade },
  water: { position: 'absolute', left: -6, top: -11, width: 12, height: 10.6, borderBottomLeftRadius: 1.4, borderBottomRightRadius: 1.4, backgroundColor: W.sc7Water.base },
  beakBubble: { position: 'absolute', left: -1, top: -1, width: 2, height: 2, borderRadius: 1, backgroundColor: W.sc7Glass.base },
  beakGlass: { position: 'absolute', left: -6.6, top: -15, width: 13.2, height: 15, borderBottomLeftRadius: 1.6, borderBottomRightRadius: 1.6, borderWidth: 0.8, borderColor: INK },
  beakLip: { position: 'absolute', left: -7.6, top: -15.4, width: 2.4, height: 1, backgroundColor: W.sc7Glass.shade },
  thermo: { position: 'absolute', left: 1.4, top: -36, width: 2.4, height: 32, borderRadius: 1.2, backgroundColor: W.sc7Glass.base, borderWidth: 0.6, borderColor: INK, transform: [{ rotate: '6deg' }] },
  thermoBulb: { position: 'absolute', left: -0.6, top: 27.6, width: 2.4, height: 3.6, borderRadius: 1.2, backgroundColor: W.sc7Mercury.base },
  thermoSpirit: { position: 'absolute', left: 0.3, top: 4, width: 0.6, height: 25, backgroundColor: W.sc7Mercury.base, transformOrigin: '50% 100%' },
  flaskAt: { transform: [{ translateX: MY_X }, { translateY: MY_GAUZE }, { scale: 0.86 }] },
  liquidClip: { position: 'absolute', left: -10, bottom: -1.5, width: 20, overflow: 'hidden' },
  liquidPic: { position: 'absolute', left: 10, bottom: -0.4, width: 0, height: 0 },
  flaskBubble: { position: 'absolute', left: -0.9, top: -0.9, width: 1.8, height: 1.8, borderRadius: 0.9, backgroundColor: W.sc7Glass.base },
  dropBead: { position: 'absolute', left: -0.8, top: 0, width: 1.6, height: 2.2, borderRadius: 0.8, backgroundColor: W.sc7Blue.base },
  noteLine: { position: 'absolute', left: 306.8, width: 4.6, height: 0.4, backgroundColor: W.sc7Iron.base, transformOrigin: '0% 50%' },
  streamAt: { position: 'absolute', left: -0.7, top: 0, width: 1.4, borderRadius: 0.7, backgroundColor: W.sc7Blue.base, transformOrigin: '50% 0%' },
  jarGlass: { position: 'absolute', left: -4.6, top: 1, width: 9.2, height: 13, borderRadius: 1.6, backgroundColor: W.sc7Glass.base, borderWidth: 0.8, borderColor: INK },
  jarFill: { position: 'absolute', left: -3.8, top: 5, width: 7.6, height: 8.2, borderBottomLeftRadius: 1.2, borderBottomRightRadius: 1.2, backgroundColor: W.sc7Blue.base },
  jarLabel: { position: 'absolute', left: -3, top: 6.6, width: 6, height: 3.4, backgroundColor: W.sc7Label.base },
  jarNeck: { position: 'absolute', left: -2.6, top: -1.4, width: 5.2, height: 2.8, borderRadius: 0.8, backgroundColor: W.sc7Cork.base, borderWidth: 0.6, borderColor: INK },
  dropBulb: { position: 'absolute', left: -1.6, top: -5, width: 3.2, height: 4.4, borderRadius: 1.6, backgroundColor: W.sc7Iron.base },
  dropTube: { position: 'absolute', left: -0.7, top: -1, width: 1.4, height: 9, borderRadius: 0.5, backgroundColor: W.sc7Glass.base, borderWidth: 0.4, borderColor: INK },
  pencil: { position: 'absolute', left: -0.7, top: -6, width: 1.4, height: 10, borderRadius: 0.4, backgroundColor: W.sc7Pencil.base, borderWidth: 0.35, borderColor: INK },
  pencilTip: { position: 'absolute', left: -0.4, top: 3.6, width: 0.8, height: 1.6, backgroundColor: W.sc7Iron.base },
  finger: { position: 'absolute', left: -1, top: -9, width: 2, height: 8.5, borderRadius: 1, backgroundColor: INK },
  spoonStem: { position: 'absolute', left: -0.5, top: -1, width: 1, height: 9, borderRadius: 0.5, backgroundColor: W.sc7Steel.base, borderWidth: 0.3, borderColor: INK },
  spoonBowl: { position: 'absolute', left: -1.7, top: 6.6, width: 3.4, height: 2.4, borderRadius: 1.2, backgroundColor: W.sc7Steel.base, borderWidth: 0.4, borderColor: INK },
  grains: { position: 'absolute', left: -1, top: 0, width: 2, height: 2, borderRadius: 0.6, backgroundColor: W.sc7Chalk.base },
  swCrown: { position: 'absolute', left: -1.2, top: -6.8, width: 2.4, height: 2.2, borderRadius: 0.6, backgroundColor: W.sc7Brass.base, borderWidth: 0.4, borderColor: INK },
  swCase: { position: 'absolute', left: -4.6, top: -4.6, width: 9.2, height: 9.2, borderRadius: 4.6, backgroundColor: W.sc7Steel.base, borderWidth: 0.8, borderColor: INK },
  swFace: { position: 'absolute', left: -3.2, top: -3.2, width: 6.4, height: 6.4, borderRadius: 3.2, backgroundColor: W.sc7Label.base },
  swHandWrap: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  swHand: { position: 'absolute', left: -0.25, top: -2.8, width: 0.5, height: 2.8, backgroundColor: W.sc7Mercury.base },
  botNeck: { position: 'absolute', left: -1.3, top: -15, width: 2.6, height: 5, borderRadius: 0.6, backgroundColor: W.sc7Tonic.base, borderWidth: 0.5, borderColor: INK },
  botBody: { position: 'absolute', left: -3.6, top: -11, width: 7.2, height: 11, borderTopLeftRadius: 2.8, borderTopRightRadius: 2.8, borderBottomLeftRadius: 1, borderBottomRightRadius: 1, backgroundColor: W.sc7Tonic.base, borderWidth: 0.7, borderColor: INK },
  botShade: { position: 'absolute', left: 1, top: -9.6, width: 2, height: 8.6, borderRadius: 1, backgroundColor: W.sc7Tonic.shade },
  botLabel: { position: 'absolute', left: -2.8, top: -7, width: 5.6, height: 3.8, backgroundColor: W.sc7Label.base },
  cork: { position: 'absolute', left: -1.2, top: -1.4, width: 2.4, height: 2.8, borderRadius: 0.6, backgroundColor: W.sc7Cork.base, borderWidth: 0.4, borderColor: INK },
  chalk: { position: 'absolute', left: -0.6, top: -4, width: 1.2, height: 5, borderRadius: 0.4, backgroundColor: W.sc7Chalk.base, borderWidth: 0.3, borderColor: INK },
  viewRim: { position: 'absolute', left: -36, top: -36, width: 72, height: 72, borderRadius: 36, backgroundColor: W.sc7Brass.base, borderWidth: 1.2, borderColor: INK },
  viewSky: { position: 'absolute', left: -31, top: -31, width: 62, height: 62, borderRadius: 31, backgroundColor: W.sc7Night.base },
  viewMars: { position: 'absolute', left: -20, top: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: W.sc7Mars.base },
  viewEmpty: { position: 'absolute', left: 4, top: -16, width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderStyle: 'dashed', borderColor: W.sc7Star.base },
  viewStar: { position: 'absolute', width: 1.6, height: 1.6, borderRadius: 0.8, backgroundColor: W.sc7Star.base },
  plate: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-08 — the three question beats (THERMOMETERS/BEAKERS/BURNERS
// under the lens on the kit, TONIC/BOTTLES/LABEL under the lens on the shelf, POSTER/EYEPIECE/DIARY in the
// dome) read whole, answered right and wrong, on the sc7 shots qR and qW.
export function Sci7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Sci7Scene} band={[214, 514]} />;
}
