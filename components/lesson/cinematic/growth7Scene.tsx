import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './growth7Script';
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
// personal-growth-foundations-7, "Personal Growth Recap: The Mountain Hut" — A TIMBER HUT
// AT DAWN, THEN THE SWITCHBACK TRAIL HIGH ABOVE A VALLEY. The recap of the road's six lessons.
//
// A DIALOGUE lesson (LESSON_RULES group AP): two people talk and nobody narrates. The
// mountain guide (the top hat) plans a climb alone in his hut; the woman with the bun, who
// was the beginner in four of this road's lessons, bursts in meaning to reach the summit
// today and gets every lesson a little wrong. He sets each one straight.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// growth7.mjs) laid in ONE WORLD 800 wide: the hut at x 0–400, the trail at x 400–800. The
// scene's own camera is the world's translation, `cam`: 0 in the hut, −400 on the trail. The
// change of place is a fade through white at the start of b12 (CUT), the two of them already
// out on the trail when it clears. Figures are posed in SCREEN space (world x + cam).
//
//   HUT, far → near: the dawn over pink peaks, seen through the WINDOW (290–384 × 290–376)
//   and the doorway (8–56 × 362–472); then the room — a ceiling of planks and a great beam,
//   log walls, a plank floor and a rag rug, the DOOR (its leaf live, hinged at 8), crossed
//   snowshoes, the hooks with a rope and an ice axe, the CHAIR 60–98, the CORK BOARD 102–152 ×
//   402–444 over the BENCH 98–192 (seat 464), the STOVE 193–249 (hob 440, the pipe up at 201),
//   a basket of logs, a shelf; then, near, the TABLE 256–402 (top 448–462, legs down to 498, so it stands BEHIND the guide at its near end) and the trail MAP
//   on it 258–304 × 447–462. The guide stands at 256, the bun at 132.
//   TRAIL (its own x 0–400): the morning sky, the snowy range, the valley far below with its
//   turquoise LAKE (92–232 × 410–434) and the little LAKE HUT (222–234, 406–419), forest; then
//   the mountainside — the drop and the valley path on the left, the trail across the front,
//   the SCREE with the ZIGZAG (first leg 242,501 → 292,467, the landing 292–326 at 467) and
//   its fixed rope, the CLIFF from 300 up the right edge, a rock at the foot of the zigzag
//   (226) and one at the bend (306), the SIGNPOST's pole at 196 (its arms are live).
//
//   b0   alone at dawn: a pencil line on the map (pencil 1.1), presses its curled edge flat
//        (paper 2.5), turns and fills the kettle from the jug (pourcup 3.9), a second line (pencil
//        5.2), looks out at the peaks, kneels to lace his boot as he murmurs his line.
//   b1   the door bangs open; the bun staggers in hugging an enormous rucksack, drops it by the
//        chair and waves.                       b2   he taps one step of the trail, then the next.
//   b3   she lifts her arms to the window.      b4   he pushes three pins into the map.
//   b5   Q1 MARK THE MAP: three pins and their flags.
//   b6   he takes a card from his pocket and holds it out; she comes for it; he points at the
//        cork board.                            b7   she pins it (pin 0.9); the kettle boils;
//        she takes the cake (plate 2.4).        b8   he points: the kettle, the cake, the chair.
//   b9   she puts the cake back and flicks through the logbook (book 1.5); he walks over.
//   b10  he turns its pages one at a time (paper 1.0, 2.6).   b11  Q2 PICK THE PAGE.
//   b12  the trail: she has slid back down the scree and sits up.   b13  he points at her
//        laces.   b14  she stands, kneels and ties a bow, pats it.   b15  hands on hips.
//   b16  she points straight up the cliff.      b17  he plants his pole and shakes his head.
//   b18  Q3 CHOOSE THE ROUTE: the signpost's three arms.
//   b19  she climbs the zigzag, wobbles twice, holds the rope post at the bend and points down
//        at the lake hut.                       b20–21 both at ease on the rocks.
//
// SIMPLE ON PURPOSE (AP7): two figures, each its own phase (N22), each beat's blend staggered
// (trAt), everyone faces whom they talk to and walks the way they face (C18), and every hand
// that moves writes, presses, pours, laces, carries, pins, points, turns a page or ties.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('personal-growth');
const { SHADE } = TONE;
const W = NATURAL;
const TR = 0.85;
const K = K_FIG * 0.84;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.2s) and the line together. */
const LINES = [8.97, 4.4, 5.84, 5.01, 5.17, 0, 3.75, 5.81, 5.85, 5.18, 6.6, 0, 3.53, 6.93, 4.34, 6.99, 3.76, 4.17, 0, 4.33, 0, 0];

const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;
const KNEEL = 1;
const SIT_GROUND = 3;
const PERCH = 4;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const WORK = at('work');
const ARRIVE = at('arrive');
const MAP = at('map');
const WISH = at('wish');
const GOAL = at('goal');
const PIN = at('pin');
const KETTLE = at('kettle');
const LOOP = at('loop');
const CRAM = at('cram');
const SPREAD = at('spread');
const TRAIL = at('trail');
const LACES = at('laces');
const RETRY = at('retry');
const RETRY2 = ACT.lastIndexOf('retry');
const CLIFF = at('cliff');
const EDGE = at('edge');
const VIEW = at('view');
const REST = at('rest');
const Q1 = BEATS.map((b) => (b.map ? 1 : 0));
const Q2 = BEATS.map((b) => (b.page ? 1 : 0));
const Q3 = BEATS.map((b) => (b.route ? 1 : 0));
/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 8.97;
}

type Track = readonly (readonly number[])[];
/** A hand's path across a line: [share of line, x in front of the figure (its own frame), stage y, weight]. */
type Key = readonly [number, number, number, number];
const NONE: readonly Key[] = [];
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));

// ── where everybody stands (WORLD x; the trail is x + 400) ───────────────────
const HX = 400;
const TH_MAP = 256;
const TH_BOOK = 176;
/** Where he steps back to at Q1, off the map's end, so the whole map and its three pins are in view. */
const TH_ASIDE = 234;
const BU_OFF = -42;
const BU_IN = 132;
const BU_CARD = 204;
const TH_T = HX + 160;
const TH_REST = HX + 226;
const BU_T = HX + 236;
const BU_BEND = HX + 304;
/** The fade through to the trail: up over [0, CUT], the cut, down over [CUT, CUT + 0.45]. */
const CUT = 0.34;
/** The bun's ground on the trail: the trail, the zigzag's first leg, the landing at the bend. */
function groundOf(x: number): number {
  'worklet';
  const l = x - HX;
  if (l < 246) return GROUND;
  if (l < 294) return lerp(GROUND, 469, (l - 246) / 48);
  return 469;
}

const TH_LEGS: Track[] = per((n) => (Q1[n] ? [[0.02, TH_ASIDE]] : n < CRAM ? [[0, TH_MAP]] : n === CRAM ? [[0.36, TH_BOOK]]
  : n < TRAIL ? [[0, TH_BOOK]] : n < REST ? [[0, TH_T]] : n === REST ? [[0.04, TH_REST]] : [[0, TH_REST]]));
const BU_LEGS: Track[] = per((n) => (n < ARRIVE ? [[0, BU_OFF]] : n === ARRIVE ? [[0.02, BU_IN]]
  : n < TRAIL ? [[0, BU_IN]] : n < VIEW ? [[0, BU_T]] : n === VIEW ? [[0.02, BU_BEND]] : [[0, BU_BEND]]));
const TH_TURN: Track[] = per((n) => {
  if (n === WORK) return [[0, 1], [S0(2.75), -1], [S0(4.75), 1], [S0(6.6), -1]];
  if (n === MAP) return [[0, 1], [0.45, -1]];
  if (n === GOAL) return [[0, 1], [0.97, -1]];
  if (n < TRAIL) return [[0, -1]];
  return [[0, 1]];
});
const BU_TURN: Track[] = per((n) => {
  if (n === KETTLE) return [[0, -1], [0.48, 1]];
  if (n === CRAM) return [[0, 1], [0.02, -1], [0.17, 1]];
  if (n === CLIFF) return [[0, -1], [0.04, 1], [0.84, -1]];
  if (n >= TRAIL) return [[0, -1]];
  return [[0, 1]];
});
const TH_P = per((n) => (BEATS[n].speaker === 'tophat' ? (n % 2 ? TALK : EXPLAIN) : NOD));
const BU_P = per((n) => (BEATS[n].speaker === 'bun' ? TALK : NOD));

// ── the hut's things (world = screen in the hut) ─────────────────────────────
const P_LAKE = { x: 270.5, y: 456.3 };
const P_PERSON = { x: 278, y: 454 };
const P_SUMMIT = { x: 290, y: 450 };
const KET = { x: 222, y: 440 };
const JUG = { x: 241, y: 440 };
const BOARD_PIN = { x: 122, y: 424 };
const PLATE = { x: 112, y: 461 };
const BOOK = { x: 154, y: 461 };
const RUCK_X = 84;
const RUCK_REST = 476;
const RUCK_HUG = 448;
// ── the trail's things (world) ───────────────────────────────────────────────
const SIGN = { x: HX + 196 };
const DASHES = [[252, 494], [266, 485], [280, 476], [296, 469], [312, 469], [316, 458], [302, 451]] as const;
const FALLS = [[HX + 330, 296, 0], [HX + 344, 318, 0.18], [HX + 322, 330, 0.34]] as const;

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { lake: 1, person: 2, summit: 3, stepups: 4, friday: 5, feel: 6, zigzag: 7, cliff: 8, valley: 9 };

// ── hands (their own frame: + is in front of whichever way the figure faces) ──
/** The guide's right hand: the pencil, the map, the laces, the pointing, the pages. */
const TH_R: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    return [[0, 10, 466, 1], [S0(0.85), 16, 454, 1], [S0(1.0), 16, 455.4, 1], [S0(1.6), 21, 454, 1],
      [S0(2.2), 24, 452, 1], [S0(2.6), 28, 451.5, 1], [S0(2.75), 10, 466, 1], [S0(4.8), 10, 466, 1],
      [S0(5.1), 24, 453, 1], [S0(5.2), 25, 452.4, 1], [S0(5.8), 31, 451, 1], [S0(6.05), 10, 466, 1], [S0(6.95), 10, 466, 1],
      [S0(7.3), 16, 478, 1], [S0(7.95), 18, 467, 1], [S0(8.7), 15, 478, 1]];
  }
  if (n === ARRIVE) return [[0, 14, 479, 1], [0.2, 10, 466, 1]];
  if (n === MAP) {
    return [[0, 10, 466, 1], [0.08, 16, 457, 1], [0.12, 18, 455.6, 1], [0.15, 18, 456.8, 1], [0.18, 24, 452, 1],
      [0.223, 24.5, 453.4, 1], [0.26, 24, 451, 1], [0.36, 10, 466, 1]];
  }
  if (n === GOAL) {
    return [[0, 10, 466, 1], [0.16, 14.5, 449, 1], [0.232, 14.5, 456, 1], [0.396, 22, 448, 1], [0.56, 22, 454, 1],
      [0.725, 33, 445, 1], [0.89, 33, 450, 1], [0.97, 10, 466, 1]];
  }
  if (n === PIN) return [[0, 10, 466, 1], [0.42, 10, 466, 1], [0.5, 134, 424, 1], [0.78, 134, 424, 1], [0.86, 10, 466, 1]];
  if (n === LOOP) {
    return [[0, 10, 466, 1], [0.12, 10, 466, 1], [0.18, 32, 426, 1], [0.32, 32, 426, 1], [0.38, 110, 446, 1], [0.52, 110, 446, 1],
      [0.58, 178, 456, 1], [0.76, 178, 456, 1], [0.84, 10, 466, 1]];
  }
  if (n === SPREAD) {
    return [[0, 10, 466, 1], [0.08, 10, 466, 1], [0.13, 14, 458, 1], [0.152, 14, 458, 1], [0.2, 28, 456, 1], [0.24, 14, 458, 1],
      [0.39, 14, 458, 1], [0.44, 28, 456, 1], [0.5, 12, 464, 1], [0.56, 10, 466, 1]];
  }
  if (n < TRAIL) return [[0, 10, 466, 1]];
  if (n === LACES) return [[0.28, 10, 466, 0], [0.36, 46, 496, 1], [0.64, 46, 496, 1], [0.72, 10, 466, 0]];
  return NONE;
});
/** The guide's left hand: the curl, the jug, the laces, the card; the walking pole on the trail. */
const TH_L: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    return [[S0(2.05), 8, 466, 0], [S0(2.3), 18, 452, 1], [S0(2.6), 20, 452, 1], [S0(2.75), 8, 466, 0],
      [S0(3.0), 8, 466, 0], [S0(3.25), 10, 436, 1], [S0(3.6), 14, 424, 1], [S0(3.9), 15, 423, 1], [S0(4.52), 15, 423, 1],
      [S0(4.64), 10, 434, 1], [S0(4.72), 10, 436, 0], [S0(7.0), 8, 470, 0], [S0(7.3), 10, 479, 1], [S0(8.7), 10, 480, 1]];
  }
  if (n === ARRIVE) return [[0, 10, 480, 1], [0.2, 8, 466, 0]];
  if (n === PIN) return [[0.12, 8, 466, 0], [0.18, 6, 450, 1], [0.22, 6, 450, 1], [0.3, 26, 448, 1], [0.38, 28, 448, 1], [0.44, 8, 466, 0]];
  if (n >= TRAIL && n < REST) {
    if (n === EDGE) return [[0, 6, 470, 1], [0.14, 7, 460, 1], [0.24, 7, 471, 1]];
    return [[0, 6, 470, 1]];
  }
  if (n >= REST) return [[0, 6, 470, 1], [0.6, 6, 476, 1]];
  return NONE;
});
/** The bun's right hand: the wave, the window, the card, the cake, the book, the laces, the cliff, the post. */
const BU_R: (readonly Key[])[] = per((n) => {
  if (n === ARRIVE) return [[0.7, 8, 452, 0], [0.76, 12, 412, 1], [0.81, 16, 414, 1], [0.86, 10, 412, 1], [0.91, 14, 414, 1], [0.98, 8, 452, 0]];
  if (n === WISH) return [[0.08, 8, 452, 0], [0.18, 22, 414, 1], [0.8, 22, 414, 1], [0.92, 8, 452, 0]];
  if (n === PIN) return [[0.3, 8, 452, 0], [0.36, 24, 448, 1], [0.42, 12, 452, 1]];
  if (n === KETTLE) return [[0, 12, 452, 1], [0.08, 10, 430, 1], [0.155, 10, 425, 1], [0.2, 8, 452, 0], [0.34, 8, 452, 0], [0.39, 20, 461, 1], [0.413, 20, 462, 1], [0.46, 12, 446, 1]];
  if (n === LOOP) return [[0, 12, 446, 1]];
  if (n === CRAM) {
    return [[0, 12, 446, 1], [0.08, 20, 460, 1], [0.13, 20, 461, 1], [0.16, 8, 452, 0], [0.22, 8, 452, 0], [0.26, 18, 459, 1],
      [0.32, 27, 457, 1], [0.42, 8, 452, 0]];
  }
  if (n === TRAIL) return [[0, 14, 488, 1]];
  if (n === LACES) return [[0, 14, 488, 1], [0.3, 10, 494, 1], [0.6, 10, 494, 1], [0.8, 14, 488, 1]];
  if (n === RETRY) {
    return [[0, 14, 488, 1], [0.12, 8, 456, 0], [0.3, 8, 456, 0], [0.36, 8, 491, 1], [0.6, 13, 488, 1], [0.72, 10, 485, 1],
      [0.8, 10, 490, 1], [0.9, 8, 456, 0]];
  }
  if (n === RETRY2) return [[0.05, 8, 456, 0], [0.14, 5, 472, 1], [0.86, 5, 472, 1], [0.95, 8, 456, 0]];
  if (n === CLIFF) return [[0.08, 8, 452, 0], [0.16, 104, 300, 1], [0.76, 104, 300, 1], [0.84, 8, 452, 0]];
  if (n === VIEW) return [[0.08, 8, 452, 0], [0.12, 20, 440, 1], [0.16, 8, 452, 0.3], [0.2, 20, 440, 1], [0.25, 8, 452, 0], [0.38, 8, 452, 0], [0.44, 8, 444, 1]];
  if (n > VIEW) return [[0, 8, 444, 1], [0.3, 12, 456, 1]];
  return NONE;
});
/** The bun's left hand: the window, the laces, the hips, the valley. */
const BU_L: (readonly Key[])[] = per((n) => {
  if (n === WISH) return [[0.1, 6, 452, 0], [0.2, 14, 420, 1], [0.8, 14, 420, 1], [0.92, 6, 452, 0]];
  if (n === TRAIL || n === LACES) return [[0, 8, 490, 1]];
  if (n === RETRY) return [[0, 8, 490, 1], [0.12, 6, 456, 0], [0.3, 6, 456, 0], [0.36, 6, 492, 1], [0.6, 1, 489, 1], [0.7, 6, 456, 0]];
  if (n === RETRY2) return [[0.05, 6, 456, 0], [0.14, 0, 472, 1], [0.86, 0, 472, 1], [0.95, 6, 456, 0]];
  if (n === VIEW) return [[0.48, 6, 452, 0], [0.56, 76, 414, 1], [0.9, 76, 414, 1], [0.98, 6, 452, 0.3]];
  if (n > VIEW) return [[0, 6, 456, 0.3], [0.3, 4, 458, 1]];
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
function keyed(s: Stance, keys: readonly Key[], u: number, x: number, g: number, d: number, which: 1 | -1): Stance {
  'worklet';
  if (keys.length === 0) return s;
  const k = keyAt(keys, u);
  return hand(s, x, g, d, which, x + k.lx * (d < 0 ? -1 : 1), k.y, k.w);
}
/** A look: the head up (negative) or down (positive). */
function look(s: Stance, v: number): Stance {
  'worklet';
  return v === 0 ? s : { ...s, neck: s.neck + v };
}
/** How long a figure takes to turn round through a profile before it sets off. */
const TURN_S = 0.36;
/**
 * A walk from `src` to `to` that starts `start` seconds into the beat — later if the figure
 * faces the wrong way and must turn first (C18: nobody walks backwards). Eased in and out, and
 * the gait is driven by the same eased distance, so the feet stay planted.
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
/** The beat's own walk: its one leg, from where the figure is. */
function legsOf(src: number, legs: Track, b: number, L: number, faceSrc: number): Walk {
  'worklet';
  const leg = legs[legs.length - 1];
  return walkOf(src, leg[1], legs[0][0] * L, faceSrc, b);
}
/** The same walk begun `off` seconds into the beat. */
function shifted(w: Walk, off: number): Walk {
  'worklet';
  return { ...w, ws: w.ws + off, we: w.we + off };
}
/**
 * Which way a figure faces at time `b`: the scripted turns, eased through a profile — but a
 * walk wins. It turns to face where it is going just before it sets off, and a scripted turn
 * the other way waits until it has arrived.
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
/** A joint's place on the stage, out of a figure's bundle. */
function jointOf(w: Bundle, k: 'wrR' | 'wrL' | 'ankR' | 'ankL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

export default function Growth7Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldT = useHeld();
  const heldB = useHeld();
  const cv = useCarry(33);
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
    /** Each figure's beat-change blend, a little apart, so the two never move as one (N22). */
    const trAt = (ph: number) => {
      'worklet';
      return ease01(Math.max(0, b - ph * 0.2) / TR);
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
    const q = qv.value;
    const pc = pk.value;
    const ans = (code: number, Q: readonly number[]) => {
      'worklet';
      return Q[n] && pc === code ? q : 0;
    };

    // ── the place: the hut, then (cut under the fade) the trail ─────────────
    const camSrc = carrySource(cv, 1, n, 0);
    // a tap past the cut before it landed puts them on the trail under a fade; a step back
    // from the trail puts them in the hut under one
    const late = n > TRAIL && camSrc > -HX + 1;
    const early = n < TRAIL && camSrc < -1;
    const cutting = n === TRAIL && b < CUT && camSrc > -HX + 1;
    const camNow = n < TRAIL ? 0 : cutting ? camSrc : -HX;
    const cam = carry(cv, 1, n, 0, camNow, 1);
    const fade = n === TRAIL
      ? (camSrc < -HX + 1 ? 0 : stage(b, 1, 0, CUT) * (1 - stage(b, 1, CUT, CUT + 0.45)))
      : late || early ? 1 - stage(b, 1, 0, 0.45) : 0;
    const snap = late || early || (n === TRAIL && !cutting);

    // ── the bun ─────────────────────────────────────────────────────────────
    const legsB = BU_LEGS[n];
    let srcB = carrySource(cv, 0, n, BU_OFF);
    if (snap) srcB = legsB[legsB.length - 1][1];
    const fB0 = carrySource(cv, 2, n, 1);
    const fB = snap ? BU_TURN[n][0][1] : fB0;
    let wB = cutting ? walkOf(srcB, srcB, 0, fB, b) : legsOf(srcB, legsB, b, L, fB);
    let dirB = faceOf(fB, BU_TURN[n], b, L, wB);
    if (n === PIN) {
      // up to the guide for the card, then back to her place by the bench
      const hand0 = 0.4 * L + 0.12;
      if (b < hand0) {
        wB = walkOf(srcB, BU_CARD, 0, fB, b);
        dirB = faceOf(fB, [[0, 1]], b, L, wB);
      } else {
        const back = walkOf(BU_CARD, BU_IN, 0, 1, b - hand0);
        wB = shifted(back, hand0);
        dirB = faceOf(1, [[0, -1], [0, 1]], b - hand0, L, back);
      }
    }
    const xB = carry(cv, 0, n, wB.x, wB.x, 1);
    const dB = carry(cv, 2, n, 0, dirB, 1);
    const gB = groundOf(xB);
    const xBs = xB + cam;
    let sb = bodyOf(wB, BU_P, n, t, b, 1);
    // seated on the gravel, standing to kneel and tie, sitting at the bend
    let sitB = 0;
    let kneelB = 0;
    let perchB = 0;
    if (n === TRAIL || n === LACES) sitB = 1;
    if (n === RETRY) {
      sitB = 1 - st(0.02, 0.14);
      kneelB = st(0.18, 0.3) * (1 - st(0.88, 0.98));
    }
    if (n === REST) perchB = st(0.1, 0.35);
    if (n > REST) perchB = 1;
    if (sitB > 0) sb = mixStance(sb, postureStill(SIT_GROUND, t, 1), sitB);
    if (kneelB > 0) sb = mixStance(sb, postureStill(KNEEL, t, 1), kneelB);
    if (perchB > 0) sb = mixStance(sb, postureStill(PERCH, t, 1), perchB);
    // the rucksack, hugged in both arms until it is dropped by the chair
    const ruckOff = n === ARRIVE ? clamp01((xB + 17 - RUCK_X) / 22) : n > ARRIVE ? 1 : 0;
    const hug = n <= ARRIVE ? 1 - smooth01(ruckOff * 4) : 0;
    if (hug > 0) {
      sb = hand(sb, xBs, gB, dB, 1, xBs + 22 * (dB < 0 ? -1 : 1), 450, hug);
      sb = hand(sb, xBs, gB, dB, -1, xBs + 10 * (dB < 0 ? -1 : 1), 441, hug);
    }
    sb = keyed(sb, BU_R[n], u, xBs, gB, dB, 1);
    sb = keyed(sb, BU_L[n], u, xBs, gB, dB, -1);
    if (n === ARRIVE) sb = look(sb, -0.08 * hd(0.66, 0.74, 0.94, 1));
    if (n === WISH) sb = look(sb, -0.16 * hd(0.08, 0.18, 0.8, 0.92));
    if (n === LACES) sb = look(sb, 0.14 * hd(0.3, 0.4, 0.66, 0.76) - 0.05 * hd(0.78, 0.86, 0.94, 1));
    if (n === RETRY) sb = look(sb, 0.12 * hd(0.3, 0.36, 0.88, 0.96));
    if (n === CLIFF) sb = look(sb, -0.2 * hd(0.12, 0.2, 0.74, 0.84));
    if (n === VIEW) sb = look(sb, 0.1 * hd(0.5, 0.58, 0.88, 0.96));
    const prevB = carryFrom(heldB, n, hHold(BU_P[p], t, 1));
    const figB = keepHeld(heldB, wB.walking ? mixKeepLegs(prevB, sb, trAt(1)) : mixStance(prevB, sb, trAt(1)));

    // ── the guide ───────────────────────────────────────────────────────────
    const legsT = TH_LEGS[n];
    let srcT = carrySource(cv, 3, n, TH_MAP);
    if (snap) srcT = legsT[legsT.length - 1][1];
    const fT0 = carrySource(cv, 4, n, 1);
    const fT = snap ? TH_TURN[n][0][1] : fT0;
    const wT = cutting ? walkOf(srcT, srcT, 0, fT, b) : legsOf(srcT, legsT, b, L, fT);
    let dirT = faceOf(fT, TH_TURN[n], b, L, wT);
    // the head shaken at the cliff: a turn away and back, twice
    if (n === EDGE) dirT *= 1 - 0.32 * Math.abs(Math.sin(stage(b, L, 0.34, 0.62) * Math.PI * 2));
    const xT = carry(cv, 3, n, wT.x, wT.x, 1);
    const dT = carry(cv, 4, n, 0, dirT, 1);
    const xTs = xT + cam;
    let sh = bodyOf(wT, TH_P, n, t, b, 0);
    let kneelT = 0;
    if (n === WORK) kneelT = st(S0(6.95), S0(7.3));
    if (n === ARRIVE) kneelT = 1 - st(0.02, 0.2);
    let perchT = 0;
    if (n === REST) perchT = st(0.62, 0.85);
    if (n > REST) perchT = 1;
    if (kneelT > 0) sh = mixStance(sh, postureStill(KNEEL, t, 0), kneelT);
    if (perchT > 0) sh = mixStance(sh, postureStill(PERCH, t, 0), perchT);
    sh = keyed(sh, TH_R[n], u, xTs, GROUND, dT, 1);
    sh = keyed(sh, TH_L[n], u, xTs, GROUND, dT, -1);
    if (n === WORK) {
      const down = 0.12 * (1 - stage(b, L, S0(2.75), S0(3.0)) + stage(b, L, S0(4.75), S0(5.0))) * (1 - stage(b, L, S0(5.85), S0(6.05)));
      sh = look(sh, down - 0.24 * hd(S0(5.9), S0(6.2), S0(6.6), S0(6.9)) + 0.1 * st(S0(7.1), S0(7.4)));
    }
    if (n === MAP || n === GOAL) sh = look(sh, 0.12 * hd(0.04, 0.1, 0.56, 0.64));
    if (n === SPREAD) sh = look(sh, 0.1 * hd(0.08, 0.14, 0.5, 0.58));
    if (n === LACES) sh = look(sh, 0.12 * hd(0.3, 0.38, 0.66, 0.74));
    if (n === RETRY2) sh = look(sh, 0.12 * hd(0.2, 0.26, 0.32, 0.38));
    if (n === VIEW) sh = look(sh, -0.1 * hd(0.1, 0.3, 0.8, 0.95));
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t, 0));
    const figT = keepHeld(heldT, wT.walking ? mixKeepLegs(prevT, sh, trAt(0)) : mixStance(prevT, sh, trAt(0)));

    const bu = pose(figB, xBs, gB, K, dB, 1);
    const th = pose(figT, xTs, GROUND, K, dT, 1);
    const tR = jointOf(th, 'wrR');
    const tL = jointOf(th, 'wrL');
    const bR = jointOf(bu, 'wrR');
    const bAnk = jointOf(bu, 'ankR');
    const sT = dT < 0 ? -1 : 1;
    const sB = dB < 0 ? -1 : 1;

    // ── the map: two pencil lines, the curl pressed flat, two ticks, three pins ──
    const mk1 = carry(cv, 5, n, 0, n > WORK ? 1 : st(S0(1.0), S0(1.6)), tr);
    const mk2 = carry(cv, 6, n, 0, n > WORK ? 1 : st(S0(5.2), S0(5.8)), tr);
    const curl = carry(cv, 7, n, 1, n > WORK ? 0 : 1 - st(S0(2.3), S0(2.6)), tr);
    const tk1 = carry(cv, 8, n, 0, n > MAP ? 1 : n === MAP ? st(0.13, 0.16) : 0, tr);
    const tk2 = carry(cv, 9, n, 0, n > MAP ? 1 : n === MAP ? st(0.21, 0.24) : 0, tr);
    const pinA = carry(cv, 10, n, 0, n > GOAL ? 1 : n === GOAL ? st(0.2, 0.232) : 0, tr);
    const pinB = carry(cv, 11, n, 0, n > GOAL ? 1 : n === GOAL ? st(0.53, 0.56) : 0, tr);
    const pinC = carry(cv, 12, n, 0, n > GOAL ? 1 : n === GOAL ? st(0.86, 0.89) : 0, tr);
    // ── Q1, Q2, Q3: the reaction to the reader's pick ───────────────────────
    const rLake = carry(cv, 13, n, 0, ans(1, Q1), tr);
    const rPerson = carry(cv, 14, n, 0, ans(2, Q1), tr);
    const rSummit = carry(cv, 15, n, 0, ans(3, Q1), tr);
    const rSteps = carry(cv, 16, n, 0, ans(4, Q2), tr);
    const rFriday = carry(cv, 17, n, 0, ans(5, Q2), tr);
    const rFeel = carry(cv, 18, n, 0, ans(6, Q2), tr);
    const rZig = carry(cv, 19, n, 0, ans(7, Q3), tr);
    const rCliff = carry(cv, 20, n, 0, ans(8, Q3), tr);
    const rValley = carry(cv, 21, n, 0, ans(9, Q3), tr);

    // ── the kettle: warming, nearly boiled, boiling at b7 — and a big puff for the right page ──
    const steamNow = n === WORK ? 0.15 + 0.5 * st(0.3, 0.95) : n < KETTLE ? 0.7 : n === KETTLE ? 0.7 + 0.3 * st(0.02, 0.12) : n < TRAIL ? 0.85 + 0.15 * rSteps : 0;
    const steam = carry(cv, 22, n, 0, steamNow, tr);
    const rattle = n === KETTLE ? hd(0.04, 0.1, 0.4, 0.5) : Q2[n] ? Math.sin(Math.PI * Math.min(1, rSteps * 1.3)) : 0;

    // ── the jug: on the hob, in his hand, tipped over the kettle ────────────
    const jugHeld = n === WORK ? hd(S0(3.2), S0(3.3), S0(4.66), S0(4.74)) : 0;
    const jugTip = n === WORK ? hd(S0(3.75), S0(3.95), S0(4.5), S0(4.6)) : 0;
    const pour = n === WORK ? hd(S0(3.9), S0(3.98), S0(4.48), S0(4.56)) : 0;
    const jug = { x: lerp(JUG.x + cam, tL.x - 4 * sT, jugHeld), y: lerp(JUG.y, tL.y + 6, jugHeld), rot: -55 * jugTip * sT };

    // ── the pencil, the card, the cake ───────────────────────────────────────
    const pencilO = carry(cv, 23, n, 1, n < TRAIL ? 1 : 0, tr);
    let cardAt = 0; // 0 hidden · 1 his hand · 2 her hand · 3 on the board
    if (n === PIN) cardAt = u < 0.205 ? 0 : u < 0.385 ? 1 : 2;
    if (n === KETTLE) cardAt = u < 0.155 ? 2 : 3;
    if (n > KETTLE) cardAt = 3;
    // the card rides in the world layer: a hand's screen x less the camera
    const card = cardAt === 1 ? { x: tL.x - cam, y: tL.y - 2, o: 1 } : cardAt === 2 ? { x: bR.x + 2 * sB - cam, y: bR.y - 2, o: 1 }
      : cardAt === 3 ? { x: BOARD_PIN.x, y: BOARD_PIN.y, o: 1 } : { x: BOARD_PIN.x, y: BOARD_PIN.y, o: 0 };
    const cakeHeld = (n === KETTLE && u >= 0.413) || n === LOOP || (n === CRAM && u < 0.13);
    const cake = cakeHeld ? { x: bR.x + 2 * sB, y: bR.y - 1.5 } : { x: PLATE.x + cam, y: PLATE.y - 2.4 };

    // ── the logbook: flicked through, two pages turned ──────────────────────
    const riffle = n === CRAM ? hd(0.26, 0.29, 0.31, 0.34) : 0;
    const leaf1 = carry(cv, 24, n, 0, n > SPREAD ? 1 : n === SPREAD ? st(0.152, 0.22) : 0, tr);
    const leaf2 = carry(cv, 25, n, 0, n > SPREAD ? 1 : n === SPREAD ? st(0.394, 0.46) : 0, tr);

    // ── the rucksack: hugged, dropped, slumped by the chair ─────────────────
    const fall = clamp01(ruckOff * 1.25);
    const land = clamp01((ruckOff - 0.8) / 0.2);
    const ruck = ruckOff <= 0
      ? { x: xBs + 17 * sB, y: RUCK_HUG, sq: 0, o: n < ARRIVE ? 0 : 1 }
      : { x: RUCK_X + cam, y: lerp(RUCK_HUG, RUCK_REST, fall * fall), sq: Math.sin(Math.PI * land) * (1 - land * 0.4), o: 1 };

    // ── the door: bursts open as she comes, swings to behind her ────────────
    const door = carry(cv, 26, n, 0, n === ARRIVE ? hd(0.0, 0.05, 0.42, 0.5) : 0, tr);

    // ── her laces: trailing, then a bow; the gravel that slid down with her ──
    const bow = carry(cv, 27, n, 0, n > RETRY ? 1 : n === RETRY ? st(0.45, 0.62) : 0, tr);
    const trickle = n === TRAIL ? clamp01((b - CUT) / 1.4) : 1;

    // ── the guide's walking pole on the trail ───────────────────────────────
    const poleO = carry(cv, 28, n, 0, n >= TRAIL ? 1 : 0, 1);

    return {
      bu, th, cam, t, fade, sT, sB,
      tR, tL, bR, bAnk,
      mk1, mk2, curl, tk1, tk2, pinA, pinB, pinC,
      rLake, rPerson, rSummit, rSteps, rFriday, rFeel, rZig, rCliff, rValley,
      steam, rattle, jug, pour, pencilO, card, cake, riffle, leaf1, leaf2, ruck, door,
      bow, lacesO: n >= TRAIL ? 1 : 0, trickle, poleO,
      q1: carry(cv, 29, n, 0, Q1[n], tr),
      q2: carry(cv, 30, n, 0, Q2[n], tr),
      q3: carry(cv, 31, n, 0, Q3[n], tr),
      hut: carry(cv, 32, n, 1, n < TRAIL ? 1 : 0, 1),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bu);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));
  const world2 = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the hut (x 0–400) and the trail (x 400–800) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="growth7-hut-far" />
        <LessonPicture name="growth7-hut-room" />
        <View style={styles.stoveShadow} />
        <RuckShadow S={SCENE} />
        <Door S={SCENE} />
        <Fire S={SCENE} />
        <Lantern S={SCENE} />
        <LessonPicture name="growth7-boots" />
        <Laces />
        <Kettle S={SCENE} />
        <Steam S={SCENE} />
        <Book S={SCENE} />
        <View style={styles.plate} />
        <Card S={SCENE} />
        <LessonPicture name="growth7-trail-far" />
        <Cloud S={SCENE} x={HX + 60} y={238} s={1} k={0} />
        <Cloud S={SCENE} x={HX + 206} y={226} s={0.8} k={1} />
        <Cloud S={SCENE} x={HX + 330} y={250} s={0.9} k={2} />
        <Glints S={SCENE} />
        <Chough S={SCENE} />
        <LessonPicture name="growth7-trail-mid" />
        <View style={styles.signShadow} />
        <Rocks S={SCENE} />
        <Dashes S={SCENE} />
        <Pebbles S={SCENE} />
        <Arm S={SCENE} id="cliff" />
        <Arm S={SCENE} id="zigzag" />
        <Arm S={SCENE} id="valley" />
      </Animated.View>
      {/* the table, BEHIND the guide (he stands at its near end, its top below his hip), and what is on it */}
      <Animated.View style={[styles.world, world2]} pointerEvents="none">
        <View style={styles.tableShadow} />
        <LessonPicture name="growth7-hut-table" />
        <LessonPicture name="growth7-map" />
        <MapMarks S={SCENE} />
        <Pins S={SCENE} />
      </Animated.View>
      {/* on the hob and the bench, behind whoever stands in front of them */}
      <Jug S={SCENE} />
      <Cake S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="lead" wear={BY_ID.magistrate.pieces} />
      <Pencil S={SCENE} />
      <Pole S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="second" wear={BY_ID.bun.pieces} />
      <BunLaces S={SCENE} />
      <Rucksack S={SCENE} />
      {/* the labels and the things to tap */}
      {on(Q1) ? <Leaders S={SCENE} /> : null}
      {on(Q1) ? <Plates S={SCENE} /> : null}
      {on(Q2) ? <Pages S={SCENE} /> : null}
      {on(Q2) ? <PaperBall S={SCENE} /> : null}
      <Fade S={SCENE} />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={MAP_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={PAGE_Q} k="q2" /> : null}
      {on(Q3) ? <StageTargets picked={picked} onPick={onPick} live={Q3[i] === 1} S={SCENE} qs={ROUTE_Q} k="q3" /> : null}
    </View>
  );
}

// ── the hut's living things ──────────────────────────────────────────────────

/** The door leaf on its hinge at the left: flung open, then swung to. */
function Door({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 0.86 * S.value.door }] }));
  return (
    <Animated.View style={[styles.doorLeaf, st]} pointerEvents="none">
      <View style={styles.doorPic}><LessonPicture name="growth7-hut-door" /></View>
    </Animated.View>
  );
}
/** The fire behind the stove's little window. */
function Fire({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.72 + 0.28 * Math.sin(S.value.t * 7.3) * Math.sin(S.value.t * 3.1) }));
  return <Animated.View style={[styles.fire, st]} pointerEvents="none" />;
}
/** The lantern hung from the beam, its glass flickering a little. */
function Lantern({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.8 + 0.2 * Math.sin(S.value.t * 5.1 + 1) }));
  return (
    <>
      <View style={styles.lanternChain} pointerEvents="none" />
      <View style={styles.lanternTop} pointerEvents="none" />
      <View style={styles.lanternBody} pointerEvents="none" />
      <Animated.View style={[styles.lanternGlass, st]} pointerEvents="none" />
      <View style={styles.lanternBase} pointerEvents="none" />
    </>
  );
}
/** The red kettle on the hob; its lid rattles when it boils. */
function Kettle({ S }: { S: SharedValue<any> }) {
  const lid = useAnimatedStyle(() => ({ transform: [{ translateY: -1.4 * S.value.rattle * Math.abs(Math.sin(S.value.t * 26)) }] }));
  return (
    <>
      <View style={styles.kettleHandle} pointerEvents="none" />
      <View style={styles.kettleSpout} pointerEvents="none" />
      <View style={styles.kettleBody} pointerEvents="none" />
      <View style={styles.kettleShade} pointerEvents="none" />
      <Animated.View style={[styles.kettleLid, lid]} pointerEvents="none" />
    </>
  );
}
/** Steam from the spout: puffs that rise, swell and fade, more of them as it comes to the boil. */
function Steam({ S }: { S: SharedValue<any> }) {
  return <>{[0, 1, 2, 3].map((k) => <Puff key={k} S={S} k={k} />)}</>;
}
function Puff({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const ph = (S.value.t * 0.55 + k * 0.25) % 1;
    const s = S.value.steam;
    return {
      opacity: s * (1 - ph) * (k < 2 || s > 0.6 ? 1 : 0),
      transform: [{ translateX: KET.x - 15 - 6 * ph + 2 * Math.sin(S.value.t * 1.7 + k) }, { translateY: KET.y - 14 - 30 * ph * (0.6 + 0.4 * s) }, { scale: 0.5 + 1.1 * ph }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.puff} /></Animated.View>;
}
/** The enamel jug: on the hob, in his hand, tipped to pour. */
function Jug({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const j = S.value.jug;
    return { transform: [{ translateX: j.x }, { translateY: j.y }, { rotate: `${j.rot}deg` }] };
  });
  const stream = useAnimatedStyle(() => ({ opacity: S.value.pour, transform: [{ scaleY: Math.max(0.01, S.value.pour) }] }));
  return (
    <>
      <Animated.View style={[styles.stream, stream]} pointerEvents="none" />
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <View style={styles.jugHandle} />
        <View style={styles.jugBody} />
        <View style={styles.jugRim} />
        <View style={styles.jugLip} />
      </Animated.View>
    </>
  );
}
/** The pencil in his right hand. */
function Pencil({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.pencilO,
    transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y }, { scaleX: S.value.sT }, { rotate: `${S.value.sT * 38}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.pencil} />
      <View style={styles.pencilTip} />
    </Animated.View>
  );
}
/** The card he gives her: in his hand, in hers, pinned on the board. */
function Card({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const c = S.value.card;
    return { opacity: c.o, transform: [{ translateX: c.x }, { translateY: c.y }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.card} />
      <View style={[styles.cardLine, { top: -1.6 }]} />
      <View style={[styles.cardLine, { top: 0.6, width: 4 }]} />
      <View style={styles.cardPin} />
    </Animated.View>
  );
}
/** The slice of cake: on its plate on the bench, in her hand. */
function Cake({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.hut,
    transform: [{ translateX: S.value.cake.x }, { translateY: S.value.cake.y }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.cakeBase} />
      <View style={styles.cakeCream} />
      <View style={styles.cakeTop} />
      <View style={styles.cakeBerry} />
    </Animated.View>
  );
}
/** The logbook lying open on the bench: a riffle of pages, and two pages turned. */
function Book({ S }: { S: SharedValue<any> }) {
  const rif = useAnimatedStyle(() => ({ opacity: S.value.riffle, transform: [{ scaleX: 1 - 1.6 * S.value.riffle }] }));
  const l1 = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 2 * S.value.leaf1 }] }));
  const l2 = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 2 * S.value.leaf2 }] }));
  return (
    <>
      <View style={styles.bookCover} pointerEvents="none" />
      <View style={styles.bookLeft} pointerEvents="none" />
      <View style={styles.bookRight} pointerEvents="none" />
      <View style={[styles.bookLine, { left: BOOK.x - 9, top: BOOK.y - 3.2 }]} pointerEvents="none" />
      <View style={[styles.bookLine, { left: BOOK.x + 2, top: BOOK.y - 3.2 }]} pointerEvents="none" />
      <View style={[styles.bookLine, { left: BOOK.x + 2, top: BOOK.y - 1.4 }]} pointerEvents="none" />
      <Animated.View style={[styles.leaf, l1]} pointerEvents="none" />
      <Animated.View style={[styles.leaf, l2]} pointerEvents="none" />
      <Animated.View style={[styles.riffle, rif]} pointerEvents="none" />
    </>
  );
}
/** The bun's enormous rucksack: hugged, dropped, slumped by the chair. */
function Rucksack({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.ruck;
    return {
      opacity: r.o,
      transform: [{ translateX: r.x }, { translateY: r.y + 4 * r.sq }, { scaleX: 1 + 0.1 * r.sq }, { scaleY: 1 - 0.12 * r.sq }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="growth7-rucksack" /></Animated.View>;
}
/** The rucksack's shadow on the floor, once it has been dropped there. */
function RuckShadow({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.4 * clamp01((S.value.ruck.y - 470) / 6) * S.value.hut }));
  return <Animated.View style={[styles.ruckShadow, st]} pointerEvents="none" />;
}
/** The laces of the boot he ties, standing up out of it. */
function Laces() {
  return (
    <>
      <View style={[styles.bootLace, { left: 240, top: 471, transform: [{ rotate: '-30deg' }] }]} pointerEvents="none" />
      <View style={[styles.bootLace, { left: 244, top: 470.6, transform: [{ rotate: '24deg' }] }]} pointerEvents="none" />
    </>
  );
}

// ── the map and its pins ─────────────────────────────────────────────────────

function MapMarks({ S }: { S: SharedValue<any> }) {
  const m1 = useAnimatedStyle(() => ({ transform: [{ rotate: '-16deg' }, { scaleX: Math.max(0.001, S.value.mk1) }] }));
  const m2 = useAnimatedStyle(() => ({ transform: [{ rotate: '-13deg' }, { scaleX: Math.max(0.001, S.value.mk2) }] }));
  const curl = useAnimatedStyle(() => ({ opacity: S.value.curl, transform: [{ scaleY: Math.max(0.05, S.value.curl) }] }));
  const t1 = useAnimatedStyle(() => ({ opacity: S.value.tk1, transform: [{ rotate: '-45deg' }, { scale: 0.4 + 0.6 * S.value.tk1 }] }));
  const t2 = useAnimatedStyle(() => ({ opacity: S.value.tk2, transform: [{ rotate: '-45deg' }, { scale: 0.4 + 0.6 * S.value.tk2 }] }));
  return (
    <>
      <Animated.View style={[styles.mark, { left: 272, top: 455 }, m1]} />
      <Animated.View style={[styles.mark, { left: 281, top: 452 }, m2]} />
      <Animated.View style={[styles.curl, curl]} />
      <Animated.View style={[styles.tick, { left: 273.6, top: 453.4 }, t1]} />
      <Animated.View style={[styles.tick, { left: 279.6, top: 451.2 }, t2]} />
    </>
  );
}
function Pins({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <MapPin S={S} k="lake" x={P_LAKE.x} y={P_LAKE.y} />
      <MapPin S={S} k="person" x={P_PERSON.x} y={P_PERSON.y} />
      <MapPin S={S} k="summit" x={P_SUMMIT.x} y={P_SUMMIT.y} />
    </>
  );
}
/** A map pin: pushed in, then — picked — driven home with a flag (right) or popped out (wrong). */
function MapPin({ S, k, x, y }: { S: SharedValue<any>; k: 'lake' | 'person' | 'summit'; x: number; y: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const inn = k === 'lake' ? v.pinA : k === 'person' ? v.pinB : v.pinC;
    let tx = x;
    let ty = y - 6 * (1 - inn);
    let deg = 0;
    let sc = 1;
    if (k === 'lake') {
      const r = v.rLake;
      ty += 1.4 * Math.sin(Math.PI * Math.min(1, r * 2.2));
      sc = 1 + 0.25 * Math.sin(Math.PI * Math.min(1, r * 1.6));
    } else if (k === 'person') {
      const r = v.rPerson;
      tx += 16 * r;
      ty -= 12 * Math.sin(Math.PI * r) - 3 * r;
      deg = 450 * r;
    } else {
      const r = v.rSummit;
      deg = 88 * clamp01(r * 1.5) + 8 * Math.sin(r * Math.PI * 4) * (1 - r);
      ty += 2 * clamp01(r * 1.5);
    }
    return { opacity: inn, transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${deg}deg` }, { scale: sc }] };
  });
  const flag = useAnimatedStyle(() => ({ opacity: k === 'lake' ? clamp01(S.value.rLake * 2) : 0, transform: [{ scaleX: Math.max(0.01, clamp01(S.value.rLake * 2)) }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.pinNeedle} />
      <Animated.View style={[styles.pinFlag, flag]} />
      <View style={styles.pinHead} />
    </Animated.View>
  );
}

// ── the trail's living things ────────────────────────────────────────────────

/** A fair-weather cloud, drifting a little and back. */
function Cloud({ S, x, y, s, k }: { S: SharedValue<any>; x: number; y: number; s: number; k: number }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: x + 10 * Math.sin(S.value.t * 0.05 + k * 1.7) }, { translateY: y }, { scale: s }],
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
/** The sun on the lake far below: short glints that come and go. */
const GLINTS = [[HX + 118, 418, 0], [HX + 150, 423, 1.4], [HX + 182, 419, 2.3], [HX + 136, 428, 3.1]];
function Glints({ S }: { S: SharedValue<any> }) {
  return <>{GLINTS.map(([x, y, ph], k) => <Glint key={k} S={S} x={x} y={y} ph={ph} />)}</>;
}
function Glint({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const v = Math.sin(S.value.t * 0.9 + ph);
    return { opacity: Math.max(0, v), transform: [{ translateX: x + 3 * Math.sin(S.value.t * 0.3 + ph) }, { translateY: y }, { scaleX: 0.6 + 0.4 * v }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.glint} /></Animated.View>;
}
/** An alpine chough wheeling over the valley. */
function Chough({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.t * 0.22;
    const x = HX + 150 + 90 * Math.cos(a);
    const y = 300 + 14 * Math.sin(a * 2);
    const flap = 0.7 + 0.3 * Math.sin(S.value.t * 5);
    return { transform: [{ translateX: x }, { translateY: y }, { scaleX: Math.sin(a) > 0 ? -0.8 : 0.8 }, { scaleY: 0.8 * flap }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="growth7-chough" /></Animated.View>;
}
/** Stones knocked off the cliff (Q3, the cliff picked): they fall, bounce and roll to rest. */
function Rocks({ S }: { S: SharedValue<any> }) {
  return <>{FALLS.map(([x, y, d], k) => <Rock key={k} S={S} x={x} y={y} d={d} k={k} />)}</>;
}
function Rock({ S, x, y, d, k }: { S: SharedValue<any>; x: number; y: number; d: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const r = clamp01((S.value.rCliff - d) / 0.6);
    const fallU = clamp01(r / 0.7);
    const bounce = clamp01((r - 0.7) / 0.3);
    const yy = lerp(y, 492 - k, fallU * fallU) - 8 * Math.sin(Math.PI * bounce) * (1 - bounce * 0.5);
    return { opacity: r > 0 ? 1 : 0, transform: [{ translateX: x - 6 * r - 4 * bounce }, { translateY: yy }, { rotate: `${-300 * r}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={[styles.stone, k === 1 ? styles.stoneSmall : null]} /></Animated.View>;
}
/** The way up the zigzag, marked in yellow one step at a time (Q3, the zigzag picked). */
function Dashes({ S }: { S: SharedValue<any> }) {
  return <>{DASHES.map(([x, y], k) => <Dash key={k} S={S} x={HX + x} y={y} k={k} />)}</>;
}
function Dash({ S, x, y, k }: { S: SharedValue<any>; x: number; y: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const r = clamp01((S.value.rZig - k * 0.09) / 0.3);
    return { opacity: r, transform: [{ translateX: x }, { translateY: y - 3 * Math.sin(Math.PI * r) }, { scale: 0.4 + 0.6 * r }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.dash} /></Animated.View>;
}
/** The gravel that slid down with her, trickling to a stop. */
const PEBBLES = [[262, 480, 0], [270, 470, 0.2], [256, 488, 0.35], [276, 462, 0.5], [266, 476, 0.6]];
function Pebbles({ S }: { S: SharedValue<any> }) {
  return <>{PEBBLES.map(([x, y, d], k) => <Pebble key={k} S={S} x={HX + x} y={y} d={d} />)}</>;
}
function Pebble({ S, x, y, d }: { S: SharedValue<any>; x: number; y: number; d: number }) {
  const st = useAnimatedStyle(() => {
    const r = clamp01((S.value.trickle - d * 0.4) / 0.5);
    return { opacity: r < 1 ? Math.sin(Math.PI * r) : 0, transform: [{ translateX: x - 22 * r }, { translateY: y + (497 - y) * r }, { rotate: `${-200 * r}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.pebble} /></Animated.View>;
}
/** The guide's walking pole, from his hand to the ground. */
function Pole({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const h = S.value.tL;
    const top = { x: h.x, y: h.y - 8 };
    const foot = { x: h.x + 3 * S.value.sT, y: GROUND + 0.5 };
    const dx = foot.x - top.x;
    const dy = foot.y - top.y;
    return {
      opacity: S.value.poleO,
      height: Math.max(1, Math.hypot(dx, dy)),
      transform: [{ translateX: top.x - 0.9 }, { translateY: top.y }, { rotate: `${(-Math.atan2(dx, dy) * 180) / Math.PI}deg` }],
    };
  });
  return <Animated.View style={[styles.pole, st]} pointerEvents="none" />;
}
/** Her laces: two loose ends trailing on the gravel, then a bow. */
function BunLaces({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.lacesO, transform: [{ translateX: S.value.bAnk.x }, { translateY: S.value.bAnk.y }] }));
  const loose = useAnimatedStyle(() => ({ opacity: 1 - S.value.bow }));
  const bow = useAnimatedStyle(() => ({ opacity: S.value.bow, transform: [{ scale: 0.3 + 0.7 * S.value.bow }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={loose}>
        <View style={[styles.lace, styles.laceA]} />
        <View style={[styles.lace, styles.laceB]} />
      </Animated.View>
      <Animated.View style={bow}>
        <View style={[styles.bowLoop, { left: -5.4 }]} />
        <View style={[styles.bowLoop, { left: 0.4 }]} />
        <View style={styles.bowKnot} />
      </Animated.View>
    </Animated.View>
  );
}

// ── the signpost's arms (Q3) ─────────────────────────────────────────────────

type ArmId = 'cliff' | 'zigzag' | 'valley';
const ARMS: Record<ArmId, { y: number; len: number; deg: number; side: 1 | -1; label: string }> = {
  valley: { y: 334, len: 74, deg: -6, side: -1, label: 'VALLEY PATH' },
  cliff: { y: 354, len: 70, deg: -12, side: 1, label: 'THE CLIFF' },
  zigzag: { y: 376, len: 70, deg: 0, side: 1, label: 'THE ZIGZAG' },
};
const ARM_H = 15;
function Arm({ S, id }: { S: SharedValue<any>; id: ArmId }) {
  const a = ARMS[id];
  const st = useAnimatedStyle(() => {
    const v = S.value;
    let deg = a.deg;
    if (id === 'zigzag') deg += 7 * Math.sin(v.rZig * Math.PI * 3) * (1 - v.rZig);
    if (id === 'cliff') deg += 3 * Math.sin(v.rCliff * 60) * (1 - v.rCliff);
    // the valley arm sags limp: its free end (on the left) drops
    if (id === 'valley') deg -= 26 * clamp01(v.rValley * 1.4) - 6 * Math.sin(clamp01(v.rValley * 1.4 - 0.4) * Math.PI * 2) * (1 - v.rValley);
    return { transform: [{ rotate: `${deg}deg` }] };
  });
  const left = a.side > 0 ? SIGN.x + 2 : SIGN.x - 2 - a.len;
  return (
    <View style={styles.rider} pointerEvents="none">
    <Animated.View
      style={[styles.arm, { left, top: a.y - ARM_H / 2, width: a.len, transformOrigin: a.side > 0 ? '0% 50%' : '100% 50%' }, st]}
      pointerEvents="none"
    >
      <View style={[styles.armTip, a.side > 0 ? styles.armTipR : styles.armTipL]} />
      <View style={[styles.armBoard, a.side > 0 ? styles.armBoardR : styles.armBoardL]}>
        <View style={[styles.armPlate, a.side > 0 ? styles.armPlateR : styles.armPlateL]}>
          <Text style={[styles.plateText, { width: a.len - 15 }]}>{a.label}</Text>
        </View>
      </View>
    </Animated.View>
    </View>
  );
}

// ── Q1's flags and Q2's pages ────────────────────────────────────────────────

type Plate = { id: string; x: number; y: number; w: number; lines: readonly string[] };
const Q1_PLATES: Plate[] = [
  // 34 apart, so the verdict seal over each one's top-right corner lands in clear wall and on no plate
  { id: 'lake', x: 334, y: 288, w: 74, lines: ['THE LAKE HUT', 'BY SATURDAY'] },
  { id: 'person', x: 334, y: 348, w: 74, lines: ['A PROPER', 'MOUNTAIN', 'PERSON'] },
  { id: 'summit', x: 334, y: 418, w: 74, lines: ['THE SUMMIT,', 'SOMEDAY'] },
];
const PIN_OF: Record<string, { x: number; y: number }> = { lake: P_LAKE, person: P_PERSON, summit: P_SUMMIT };
function plateH(g: Plate): number {
  'worklet';
  return 4 + 10 * g.lines.length;
}
/** Each pin's hairline up to its flag on the right. */
function Leaders({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="none">
      {Q1_PLATES.map((g) => {
        const a = PIN_OF[g.id];
        const bx = g.x - g.w / 2;
        const by = g.y + plateH(g) / 2;
        const ax = a.x + 0.6;
        const ay = a.y - 7;
        const len = Math.hypot(bx - ax, by - ay);
        const deg = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
        return <View key={g.id} style={[styles.leader, { left: ax, top: ay - 0.35, width: len, transform: [{ rotate: `${deg}deg` }] }]} />;
      })}
    </Animated.View>
  );
}
function Plates({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="none">
      {Q1_PLATES.map((g) => <FlagPlate key={g.id} S={S} g={g} />)}
    </Animated.View>
  );
}
/** A flag's label: pops and settles (right) or shakes and droops (wrong). */
function FlagPlate({ S, g }: { S: SharedValue<any>; g: Plate }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    if (g.id === 'lake') return { transform: [{ scale: 1 + 0.14 * Math.sin(Math.PI * Math.min(1, v.rLake * 1.6)) }] };
    const r = g.id === 'person' ? v.rPerson : v.rSummit;
    return { transform: [{ translateX: 3 * Math.sin(r * 40) * (1 - r) }, { rotate: `${7 * clamp01(r * 1.4)}deg` }] };
  });
  return (
    <Animated.View style={[styles.plateBox, { left: g.x - g.w / 2, top: g.y, width: g.w, height: plateH(g) }, st]}>
      {g.lines.map((l) => <Text key={l} style={[styles.plateText, { width: g.w - 2 }]}>{l}</Text>)}
    </Animated.View>
  );
}
const PAGES: (Plate & { from: number })[] = [
  { id: 'stepups', x: 72, y: 360, w: 72, lines: ['TEN STEP-UPS', 'WHEN THE', 'KETTLE BOILS'], from: 0 },
  { id: 'friday', x: 156, y: 370, w: 86, lines: ['ALL THE TRAINING', 'FRIDAY NIGHT'], from: 1 },
  { id: 'feel', x: 246, y: 370, w: 72, lines: ['TRAIN WHEN I', 'FEEL LIKE IT'], from: 2 },
];
/** The logbook's three plans, flown up out of the book to be picked. */
function Pages({ S }: { S: SharedValue<any> }) {
  return <>{PAGES.map((g) => <Page key={g.id} S={S} g={g} />)}</>;
}
function Page({ S, g }: { S: SharedValue<any>; g: (typeof PAGES)[number] }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const up = clamp01((v.q2 - g.from * 0.12) / 0.64);
    const e = up * up * (3 - 2 * up);
    const h = plateH(g);
    let tx = lerp(BOOK.x - g.x, 0, e);
    let ty = lerp(BOOK.y - (g.y + h / 2), 0, e) - 10 * Math.sin(Math.PI * e);
    let sc = 0.15 + 0.85 * e;
    let deg = 0;
    let op = 1;
    if (g.id === 'stepups') {
      sc *= 1 + 0.14 * Math.sin(Math.PI * Math.min(1, v.rSteps * 1.6));
    } else if (g.id === 'friday') {
      // crumpled and dropped: squashed, spun, down to the floor with a bounce
      const r = v.rFriday;
      const f = clamp01((r - 0.25) / 0.6);
      sc *= 1 - 0.55 * clamp01(r * 3);
      deg = 200 * r;
      ty += (488 - (g.y + h / 2)) * f * f;
      // the words go as it balls up: what lands on the floor is the paper ball
      op = 1 - clamp01((r - 0.15) / 0.3);
    } else {
      // no cue: it drifts off on the draught and fades
      const r = v.rFeel;
      tx += 40 * r + 6 * Math.sin(r * Math.PI * 4);
      ty -= 30 * r;
      deg = 14 * Math.sin(r * Math.PI * 3);
      op = 1 - clamp01((r - 0.3) / 0.6);
    }
    return { opacity: op * Math.min(1, e * 3), transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${deg}deg` }, { scale: sc }] };
  });
  return (
    <Animated.View style={[styles.plateBox, { left: g.x - g.w / 2, top: g.y, width: g.w, height: plateH(g) }, st]} pointerEvents="none">
      {g.lines.map((l) => <Text key={l} style={[styles.plateText, { width: g.w - 2 }]}>{l}</Text>)}
    </Animated.View>
  );
}

/** The crumpled Friday page: a ball of paper that drops to the floor and bounces. */
function PaperBall({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rFriday;
    const f = clamp01((r - 0.2) / 0.6);
    const bounce = clamp01((r - 0.8) / 0.2);
    const g = PAGES[1];
    return {
      opacity: r > 0.12 ? 1 : 0,
      transform: [
        { translateX: g.x + 14 * f }, { translateY: lerp(g.y + 12, 494, f * f) - 7 * Math.sin(Math.PI * bounce) },
        { rotate: `${260 * r}deg` }, { scale: 0.4 + 0.6 * clamp01(r * 4) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.ball} />
      <View style={styles.ballCrease} />
    </Animated.View>
  );
}

/** The fade through on the way out to the trail. */
function Fade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.fade }));
  return <Animated.View style={[styles.fade, st]} pointerEvents="none" />;
}

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/** MARK THE MAP: which pin is a goal she could check she'd reached? */
// each box reaches up into the clear wall above its plate, so the verdict seal lands there and not on a word
const MAP_Q: Q[] = Q1_PLATES.map((g) => ({ id: g.id, left: g.x - g.w / 2 - 3, top: g.y - 22, w: g.w + 6, h: plateH(g) + 25, r: 5, correct: g.id === 'lake' }));
/** PICK THE PAGE: which plan will get her ready for Saturday? */
const PAGE_Q: Q[] = PAGES.map((g) => ({ id: g.id, left: g.x - g.w / 2 - 3, top: g.y - 18, w: g.w + 6, h: plateH(g) + 21, r: 5, correct: g.id === 'stepups' }));
/** CHOOSE THE ROUTE: which arm to climb? (the trail, on screen). The two right-hand boxes run
 *  past their arm's tip and the valley's up over its arm, so the verdict seal (top right of the
 *  box) lands in the clear and never on an arm or its word. */
const ROUTE_Q: Q[] = [
  { id: 'cliff', left: 196, top: 334, w: 100, h: 26, r: 5, correct: false },
  { id: 'zigzag', left: 196, top: 366, w: 100, h: 22, r: 5, correct: true },
  { id: 'valley', left: 116, top: 298, w: 82, h: 48, r: 5, correct: false },
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
  fade: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.gr7Cloud.base },
  stoveShadow: { position: 'absolute', left: 192, top: 485, width: 60, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  ruckShadow: { position: 'absolute', left: RUCK_X - 20, top: 497, width: 40, height: 5, borderRadius: 2.5, backgroundColor: SHADE },
  tableShadow: { position: 'absolute', left: 262, top: 495.5, width: 138, height: 5, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.4 },
  signShadow: { position: 'absolute', left: SIGN.x - 9, top: 495, width: 20, height: 3, borderRadius: 1.5, backgroundColor: SHADE, opacity: 0.45 },
  doorLeaf: { position: 'absolute', left: 7.4, top: 361.4, width: 49.2, height: 111.2, transformOrigin: '0% 50%' },
  doorPic: { position: 'absolute', left: -7.4, top: -361.4, width: 0, height: 0 },
  fire: { position: 'absolute', left: 203.5, top: 455.5, width: 11, height: 6, borderRadius: 1.5, backgroundColor: W.gr7Fire.base },
  lanternChain: { position: 'absolute', left: 159.6, top: 262, width: 0.8, height: 8, backgroundColor: W.gr7Graphite.base },
  lanternTop: {
    position: 'absolute', left: 155.5, top: 269, width: 9, height: 4, borderTopLeftRadius: 4, borderTopRightRadius: 4,
    backgroundColor: W.gr7Brass.base, borderWidth: 0.6, borderColor: INK,
  },
  lanternBody: { position: 'absolute', left: 155, top: 273, width: 10, height: 13, borderRadius: 1.5, backgroundColor: W.gr7Brass.shade, borderWidth: 0.7, borderColor: INK },
  lanternGlass: { position: 'absolute', left: 156.8, top: 274.6, width: 6.4, height: 9.8, borderRadius: 1, backgroundColor: W.gr7Lamp.base },
  lanternBase: { position: 'absolute', left: 154, top: 286, width: 12, height: 2.6, borderRadius: 1, backgroundColor: W.gr7Brass.base, borderWidth: 0.5, borderColor: INK },
  kettleHandle: {
    position: 'absolute', left: KET.x - 7, top: KET.y - 26, width: 14, height: 12, borderTopLeftRadius: 7, borderTopRightRadius: 7,
    borderWidth: 1.4, borderBottomWidth: 0, borderColor: W.gr7Graphite.base,
  },
  kettleSpout: {
    position: 'absolute', left: KET.x - 17, top: KET.y - 14, width: 9, height: 3.2, borderRadius: 1.6, backgroundColor: W.gr7Kettle.shade,
    borderWidth: 0.6, borderColor: INK, transform: [{ rotate: '-28deg' }],
  },
  kettleBody: {
    position: 'absolute', left: KET.x - 10, top: KET.y - 17, width: 20, height: 17, borderTopLeftRadius: 9, borderTopRightRadius: 9,
    borderBottomLeftRadius: 2.5, borderBottomRightRadius: 2.5, backgroundColor: W.gr7Kettle.base, borderWidth: 0.9, borderColor: INK,
  },
  kettleShade: { position: 'absolute', left: KET.x + 2, top: KET.y - 15, width: 6.6, height: 13.6, borderTopRightRadius: 7, backgroundColor: W.gr7Kettle.shade },
  kettleLid: { position: 'absolute', left: KET.x - 4, top: KET.y - 19.6, width: 8, height: 3.2, borderRadius: 1.6, backgroundColor: W.gr7Kettle.shade, borderWidth: 0.6, borderColor: INK },
  puff: { position: 'absolute', left: -4, top: -3.5, width: 8, height: 7, borderRadius: 4, backgroundColor: W.gr7Steam.base },
  stream: { position: 'absolute', left: 226.8, top: 419, width: 1.6, height: 4.6, borderRadius: 0.8, backgroundColor: W.gr7Water.base, transformOrigin: '50% 0%' },
  jugHandle: {
    position: 'absolute', left: 2.4, top: -11, width: 5, height: 7.4, borderTopRightRadius: 3.6, borderBottomRightRadius: 3.6,
    borderWidth: 1.2, borderLeftWidth: 0, borderColor: W.gr7EnamelBlue.base,
  },
  jugBody: {
    position: 'absolute', left: -4.4, top: -13, width: 8.8, height: 13, borderTopLeftRadius: 1.5, borderTopRightRadius: 1.5,
    borderBottomLeftRadius: 2.2, borderBottomRightRadius: 2.2, backgroundColor: W.gr7Enamel.base, borderWidth: 0.7, borderColor: INK,
  },
  jugRim: { position: 'absolute', left: -4.6, top: -13.4, width: 9.2, height: 2, borderRadius: 0.8, backgroundColor: W.gr7EnamelBlue.base },
  jugLip: { position: 'absolute', left: -7, top: -13.6, width: 4, height: 2.4, borderTopLeftRadius: 2, backgroundColor: W.gr7Enamel.base, borderWidth: 0.5, borderColor: INK },
  pencil: { position: 'absolute', left: -1, top: -0.75, width: 9, height: 1.5, borderRadius: 0.4, backgroundColor: W.gr7Pencil.base, borderWidth: 0.35, borderColor: INK },
  pencilTip: { position: 'absolute', left: 7.6, top: -0.45, width: 2, height: 0.9, borderRadius: 0.45, backgroundColor: W.gr7Graphite.base },
  card: { position: 'absolute', left: -5, top: -3.4, width: 10, height: 7, borderRadius: 0.8, backgroundColor: W.gr7Card.base, borderWidth: 0.6, borderColor: INK },
  cardLine: { position: 'absolute', left: -3.6, width: 6.4, height: 0.7, backgroundColor: W.gr7Graphite.base },
  cardPin: { position: 'absolute', left: -0.9, top: -3.6, width: 1.8, height: 1.8, borderRadius: 0.9, backgroundColor: W.gr7PinHead.base },
  plate: {
    position: 'absolute', left: PLATE.x - 8, top: PLATE.y - 1.4, width: 16, height: 3, borderRadius: 1.5,
    backgroundColor: W.gr7Plate.base, borderWidth: 0.6, borderColor: INK,
  },
  cakeBase: {
    position: 'absolute', left: -4.5, top: -3.2, width: 9, height: 5.4, borderTopRightRadius: 1, borderBottomLeftRadius: 0.6,
    borderBottomRightRadius: 0.6, backgroundColor: W.gr7Sponge.base, borderWidth: 0.6, borderColor: INK,
  },
  cakeCream: { position: 'absolute', left: -4.1, top: -1.2, width: 8.2, height: 1.1, backgroundColor: W.gr7Cream.base },
  cakeTop: { position: 'absolute', left: -4.5, top: -4.4, width: 9, height: 1.8, borderRadius: 0.9, backgroundColor: W.gr7Cream.base, borderWidth: 0.4, borderColor: INK },
  cakeBerry: { position: 'absolute', left: -1.2, top: -6.4, width: 2.6, height: 2.4, borderRadius: 1.2, backgroundColor: W.gr7Berry.base, borderWidth: 0.4, borderColor: INK },
  bookCover: { position: 'absolute', left: BOOK.x - 12, top: BOOK.y - 4.6, width: 24, height: 6, borderRadius: 1, backgroundColor: W.gr7Cover.base, borderWidth: 0.7, borderColor: INK },
  bookLeft: { position: 'absolute', left: BOOK.x - 11, top: BOOK.y - 5.6, width: 10.6, height: 5, borderTopLeftRadius: 3, backgroundColor: W.gr7Page.base, borderWidth: 0.5, borderColor: INK },
  bookRight: { position: 'absolute', left: BOOK.x + 0.4, top: BOOK.y - 5.6, width: 10.6, height: 5, borderTopRightRadius: 3, backgroundColor: W.gr7Page.base, borderWidth: 0.5, borderColor: INK },
  bookLine: { position: 'absolute', width: 7, height: 0.5, backgroundColor: W.gr7Graphite.base },
  leaf: {
    position: 'absolute', left: BOOK.x + 0.4, top: BOOK.y - 6.4, width: 10, height: 5, borderTopRightRadius: 3,
    backgroundColor: W.gr7Page.shade, borderWidth: 0.4, borderColor: INK, transformOrigin: '0% 50%',
  },
  riffle: {
    position: 'absolute', left: BOOK.x + 0.4, top: BOOK.y - 9, width: 10, height: 6, borderTopRightRadius: 4,
    backgroundColor: W.gr7Page.base, borderWidth: 0.4, borderColor: INK, transformOrigin: '0% 100%',
  },
  bootLace: { position: 'absolute', width: 5, height: 0.8, borderRadius: 0.4, backgroundColor: W.gr7Lace.base },
  mark: { position: 'absolute', width: 5.2, height: 0.7, borderRadius: 0.35, backgroundColor: W.gr7Graphite.base, transformOrigin: '0% 50%' },
  curl: {
    position: 'absolute', left: 280, top: 444.6, width: 22, height: 3.4, borderRadius: 1.7, backgroundColor: W.gr7Card.base,
    borderWidth: 0.5, borderColor: INK, transformOrigin: '50% 100%',
  },
  tick: { position: 'absolute', width: 2.8, height: 1.6, borderLeftWidth: 0.7, borderBottomWidth: 0.7, borderColor: W.gr7Graphite.base },
  pinNeedle: { position: 'absolute', left: -0.35, top: -6, width: 0.7, height: 6, backgroundColor: W.gr7Steel.shade },
  pinHead: { position: 'absolute', left: -1.5, top: -8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: W.gr7PinHead.base, borderWidth: 0.4, borderColor: INK },
  pinFlag: { position: 'absolute', left: 0.4, top: -14, width: 5, height: 3.6, backgroundColor: W.gr7PinHead.base, borderWidth: 0.4, borderColor: INK, transformOrigin: '0% 50%' },
  cloud: { position: 'absolute', backgroundColor: W.gr7Cloud.base },
  cloudFoot: { position: 'absolute', backgroundColor: W.gr7Cloud.shade },
  glint: { position: 'absolute', left: -5, top: -0.5, width: 10, height: 1, borderRadius: 0.5, backgroundColor: W.gr7Glint.base },
  stone: { position: 'absolute', left: -3.5, top: -3, width: 7, height: 6, borderRadius: 2.6, backgroundColor: W.gr7Rock.base, borderWidth: 0.6, borderColor: INK },
  stoneSmall: { transform: [{ scale: 0.75 }] },
  dash: { position: 'absolute', left: -4, top: -1.7, width: 8, height: 3.4, borderRadius: 1.7, backgroundColor: W.gr7Dash.base, borderWidth: 0.4, borderColor: INK },
  pebble: { position: 'absolute', left: -1.3, top: -1, width: 2.6, height: 2, borderRadius: 1, backgroundColor: W.gr7Pebble.base, borderWidth: 0.3, borderColor: INK },
  pole: { position: 'absolute', left: 0, top: 0, width: 1.8, borderRadius: 0.9, backgroundColor: W.gr7Steel.base, transformOrigin: '50% 0%' },
  lace: { position: 'absolute', height: 0.8, borderRadius: 0.4, backgroundColor: W.gr7Lace.base, transformOrigin: '0% 50%' },
  laceA: { left: -1, top: 0, width: 9, transform: [{ rotate: '160deg' }] },
  laceB: { left: 0, top: 1.4, width: 12, transform: [{ rotate: '175deg' }] },
  bowLoop: { position: 'absolute', top: -4.2, width: 5, height: 3.4, borderRadius: 1.7, borderWidth: 0.8, borderColor: W.gr7Lace.base },
  bowKnot: { position: 'absolute', left: -1, top: -3.4, width: 2, height: 2, borderRadius: 1, backgroundColor: W.gr7Lace.shade },
  arm: { position: 'absolute', height: ARM_H },
  armBoard: { position: 'absolute', top: 0, bottom: 0, borderRadius: 2, backgroundColor: W.gr7Wood.base, borderWidth: 0.9, borderColor: INK },
  armBoardR: { left: 0, right: 6 },
  armBoardL: { left: 6, right: 0 },
  armTip: {
    position: 'absolute', top: ARM_H / 2 - 5.3, width: 10.6, height: 10.6, backgroundColor: W.gr7Wood.base, borderWidth: 0.9, borderColor: INK,
    transform: [{ rotate: '45deg' }, { scale: 0.72 }],
  },
  armTipR: { right: 1.4 },
  armTipL: { left: 1.4 },
  armPlate: {
    position: 'absolute', top: 1.2, bottom: 1.2, alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 2,
    borderWidth: 0.8, borderColor: INK, boxShadow: lipOf(TONE),
  },
  armPlateR: { left: 2, right: 3 },
  armPlateL: { left: 3, right: 2 },
  ball: { position: 'absolute', left: -4.5, top: -4, width: 9, height: 8, borderRadius: 4, backgroundColor: W.gr7Page.base, borderWidth: 0.7, borderColor: INK },
  ballCrease: { position: 'absolute', left: -2.5, top: -1, width: 5, height: 0.7, backgroundColor: W.gr7Page.shade, transform: [{ rotate: '30deg' }] },
  leader: { position: 'absolute', height: 0.7, backgroundColor: INK, opacity: 0.55, transformOrigin: '0% 50%' },
  plateBox: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-08 — the three question beats (the three flags on the map,
// the three logbook pages, the signpost's three arms) read whole, answered right and wrong, on the g7m/g7r/g7v sheets.
export function Growth7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Growth7Scene} band={[214, 514]} />;
}
