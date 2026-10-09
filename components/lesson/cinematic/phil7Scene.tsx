import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import ObjectArt from './ObjectArt';
import { BEATS } from './phil7Script';
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
import { NATURAL, crate, tint } from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-7, "Philosophy Recap: Back to Athens" — THE ATHENIAN AGORA ON A
// SUNNY MORNING, THEN THE HARBOUR AT PIRAEUS. The recap of the road's six lessons.
//
// A DIALOGUE lesson (LESSON_RULES group AP): two people talk and nobody narrates. The
// philosopher (the top hat) works at his stone table in a stoa; the plain one, who was
// at the centre of four of the six lessons, arrives sure he remembers them all.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// phil7.mjs) laid in ONE WORLD that is 800 wide: the agora at x 0–400, the harbour at
// x 400–800. The scene's own camera is the world's translation, `cam`: 0 in the agora,
// −400 at the harbour, and on the walk down (b14) it is tied to the plain one's own walk,
// so the place pans under the two of them as they go. Figures are posed in SCREEN space
// (world x + cam), so their feet stay planted on the moving paving.
//
//   AGORA, far → near: the morning sky in bands, Hymettos in haze, the Acropolis on its
//   rock with the Parthenon (centre-left, 98–172 × 296–320), the city at its foot; then
//   the terrace wall and paving (443–514), the FOUNTAIN HOUSE 0–80 × 344–469 (lion spout
//   38, 420; the rim 444), the OFFICIAL'S TABLE 82–116 × 454–484, the market crowd, the
//   MERCHANT'S STALL 110–224 (awning 384–404, the balance hung at 166, 397; counter
//   449–488), and the STOA 222–400 (roof 262–280, columns at 238, 282, 326, 370 from 289
//   to 450). The philosopher stands at 250, at the LEFT END of his stone TABLE 258–372
//   (top 466, hip high; feet 495), which stands BEHIND the people so it hides nobody (the
//   recap fix, 2026-10-08: it used to be drawn over his legs). On it, left to right, a dish
//   of figs (260), the wax tablet (269), the shards (312) and the herald's horn (346).
//   The plain one leans on the column at 370 from 378, so the two face each other across
//   the table's length.
//   HARBOUR (its own x 0–400): sky, the sea to Salamis, Mounichia's hill and houses; the
//   shipsheds 0–140; the OLD SHIP 146–392 (mast 252, 218–420), her planks a patchwork of
//   new and old; the quay 440–514; the SUNDIAL at 66 (dial 437–448, pedestal to 494).
//
//   b0   alone in the stoa: a fig from the dish, writes a line (pencil 1.2s), a second
//        (2.6s), taps his chin, rubs the second out (paper 4.1s), writes it again
//        (5.3s), rests the stylus, looks up at the Acropolis and murmurs his line.
//   b1   the plain one strolls in from the stoa's far end, chin up, and leans on a column.
//   b2   the philosopher draws a wheel on the tablet (pencil 1.4s) and taps it twice.
//   b3   the plain one spreads his hands.          b4   the philosopher holds the tablet up, then stands it on the table.
//   b5   the plain one waves at the market crowd over the philosopher's head (murmur 0.3s).
//   b6   Q1 CAST YOUR VOTE: the shards, the tablet or the horn.
//   b7   he peers at the tablet and sniffs.        b8   the philosopher lays it flat, writes two short lines (1.0s), stands it up; the plain one wanders off toward the fountain.
//   b9   he finds the purse on the fountain's rim, picks it up and jingles it (2.1s).
//   b10  the philosopher weighs with both hands.   b11  Q2 LOAD THE SCALES.
//   b12  the plain one sets the purse on the official's table (coin 1.6s).
//   b13  the philosopher nods at him, then at the purse; he strolls back.
//   b14  both walk down to the harbour, the place panning under them; he points at the sky.
//   b15  the philosopher points at the sundial.    b16  Q3 READ THE HOUR.
//   b17  he walks to the ship and pats her hull (plank 1.2s).
//   b18  the philosopher taps his chest, then his own temple.
//   b19  he spreads his hands.  b20  two fingers held up side by side.  b21 at ease.
//
// SIMPLE ON PURPOSE (AP7): two figures, each its own phase (N22), everyone faces whom he
// talks to, and every hand that moves writes, eats, holds, waves, points or taps.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('philosophy');
const { SHADE } = TONE;
const W = NATURAL;
const TR = 0.85;
const K = K_FIG * 0.78;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.2s) and the line together. */
const LINES = [8.48, 4.2, 5.17, 4.53, 6.53, 3.78, 0, 2.4, 6.96, 3.18, 7.33, 0, 4.17, 5.91, 5.89, 6, 0, 4.07, 4.03, 3.31, 4.99, 0, 0];

const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const WORK = at('work');
const ARRIVE = at('arrive');
const BIKE = at('bike');
const BOAST = at('boast');
const REASONS = at('reasons');
const CROWD = at('crowd');
const INSULT = at('insult');
const ARGUE = at('argue');
const PURSE = at('purse');
const WEIGH = at('weigh');
const HANDIN = at('handin');
const FREE = at('free');
const HARBOUR = at('harbour');
const KNOW = at('know');
const SHIP = at('ship');
const SELF = at('self');
const BOAST2 = ACT.lastIndexOf('boast');
const COPY = at('copy');
const Q1 = BEATS.map((b) => (b.vote ? 1 : 0));
const Q2 = BEATS.map((b) => (b.scales ? 1 : 0));
const Q3 = BEATS.map((b) => (b.hour ? 1 : 0));
const Q2_AT = Q2.indexOf(1);
const Q3_AT = Q3.indexOf(1);
/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 8.48;
}

type Track = readonly (readonly number[])[];
/** A hand's path across a line: [share of line, x in front of him (his own frame), stage y, weight]. */
type Key = readonly [number, number, number, number];
const NONE: readonly Key[] = [];
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));

// ── where everybody stands (WORLD x; the harbour is x + 400) ──────────────────
const HX = 400;
const TH_DESK = 250;
const TH_QUAY = HX + 128;
const TH_SHIP = HX + 182;
/** The walk down (b14): out of the agora to the right, a fade through at CUT, in from the harbour's left. */
const CUT = 2.4;
const TH_EXIT = 410;
const TH_ENTER = HX - 30;
const PL_EXIT = 430;
const PL_ENTER = HX + 10;
const PL_OFF = 432;
const PL_COL = 378;
const PL_DRIFT = 200;
const PL_FOUNT = 72;
/** Where he strolls back to after handing the purse in, on his way down to the harbour. */
const PL_BACK = 290;
const PL_QUAY = HX + 175;
const PL_HULL = HX + 236;

const TH_LEGS: Track[] = per((n) => (n < HARBOUR ? [[0, TH_DESK]] : n === HARBOUR ? [[0.32, TH_QUAY]]
  : n < SELF ? [[0, TH_QUAY]] : [[0, TH_SHIP]]));
const PL_LEGS: Track[] = per((n) => (n < ARRIVE ? [[0, PL_OFF]] : n === ARRIVE ? [[0.02, PL_COL]]
  : n < ARGUE ? [[0, PL_COL]] : n === ARGUE ? [[0.12, PL_DRIFT]]
    : n < FREE ? [[0, PL_FOUNT]] : n === FREE ? [[0.05, PL_BACK]]
      : n === HARBOUR ? [[0, PL_QUAY]] : n < SHIP ? [[0, PL_QUAY]] : [[0, PL_HULL]]));
const TH_TURN: Track[] = per((n) => (n < ARGUE ? [[0, 1]] : n === ARGUE ? [[0, 1], [0.5, -1]]
  : n < FREE ? [[0, -1]] : n === FREE ? [[0, -1], [0.62, 1]] : n === HARBOUR ? [[0, 1]]
    : n === KNOW ? [[0.02, -1], [0.58, 1]] : [[0, 1]]));
const PL_TURN: Track[] = per((n) => (n < ARGUE ? [[0, -1]]
  : n === ARGUE ? [[0, -1], [0.6, 1]]
    : n === PURSE ? [[0, 1], [0.01, -1], [0.76, 1]]
      : n === HARBOUR ? [[0, 1], [1.02, -1]]
      : n === KNOW || n === Q3_AT ? [[0.02, -1]]
        : n === SHIP ? [[0, 1], [0.6, -1]]
          : n > SHIP ? [[0, -1]] : n === FREE ? [[0, 1], [0.7, -1]] : [[0, 1]]));
const TH_P = per((n) => (BEATS[n].speaker === 'tophat' ? (n % 2 ? TALK : EXPLAIN) : NOD));
const PL_P = per((n) => (BEATS[n].speaker === 'plain' ? TALK : NOD));

// ── the wax tablet: lying on the table, held up, stood on the table ───────────
const TAB = { x: 269, w: 22, h: 15, flatY: 468.5, flatSy: 0.28, propY: 462.5 };
/**
 * A stylus tip on the lying tablet, as the wrist that holds it. `lxTip` runs along a line as
 * it is written, -9 to 7; he stands LEFT of the tablet facing right and writes each line toward
 * himself, so the line is laid mirrored (see the scratches, which grow from their right end).
 */
const tip = (share: number, lxTip: number, w = 1): Key => [share, TAB.x - lxTip - 2 - TH_DESK - 5, 465, w];
/** The wheel: eight points round it, drawn over [a, b] of the line. */
const wheelKeys = (a: number, b: number): Key[] => Array.from({ length: 9 }, (_, k) => {
  const ang = (k / 8) * Math.PI * 2;
  return [a + ((b - a) * k) / 8, TAB.x + 6 + 3 * Math.cos(ang) - TH_DESK - 5, 465 + 0.8 * Math.sin(ang), 1] as Key;
});

/** His right hand, the stylus hand. */
const TH_R: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    return [[0, 12, 468, 1], [S0(0.95), 24, 465, 1], tip(S0(1.1), -9), tip(S0(1.9), 7),
      [S0(2.2), 9, 437, 1], tip(S0(2.45), -9), tip(S0(3.3), 2),
      [S0(3.55), 6, 433, 1], [S0(3.85), 6, 434.5, 1],
      tip(S0(4.05), 2), tip(S0(4.75), -8),
      [S0(5.0), 11, 467, 1], tip(S0(5.2), -9), tip(S0(6.0), 3), [S0(6.3), 3, 469, 1]];
  }
  if (n === BIKE) {
    return [[0, 3, 469, 1], [0.22, 14, 463, 1], ...wheelKeys(0.27, 0.45),
      [0.52, 9, 462, 1], [0.56, 9, 465.4, 1], [0.6, 9, 462, 1], [0.64, 9, 465.4, 1], [0.76, 3, 469, 1]];
  }
  if (n === ARGUE) {
    return [[0, 3, 469, 1], [0.12, 24, 464, 1], tip(0.14, -9), tip(0.24, -3.5), tip(0.27, -2), tip(0.35, 1.5), [0.42, 3, 469, 1]];
  }
  if (n === WEIGH) {
    return [[0, 3, 469, 1], [0.08, 18, 448, 1], [0.3, 18, 443, 1], [0.5, 18, 452, 1], [0.7, 18, 448, 1], [0.86, 3, 469, 1]];
  }
  if (n === KNOW) return [[0.08, 10, 452, 0], [0.16, 22, 445, 1], [0.48, 22, 445, 1], [0.58, 10, 452, 0]];
  if (n === SELF) return [[0.46, 12, 456, 0], [0.54, 24, 455, 1], [0.6, 20, 456, 1], [0.66, 24, 455, 1], [0.74, 8, 424, 1], [0.9, 8, 424, 1], [1, 8, 450, 0]];
  if (n === COPY) return [[0.06, 8, 452, 0], [0.16, 12, 429, 1], [0.8, 12, 429, 1], [0.92, 8, 452, 0]];
  if (n < HARBOUR) return [[0, 3, 469, 1]];
  return NONE;
});
/** His left hand: a fig; the tablet up and down; weighing; nothing at the harbour. */
const TH_L: (readonly Key[])[] = per((n) => {
  if (n === WORK) {
    return [[S0(0.08), 10, 470, 0], [S0(0.2), 10, 468, 1], [S0(0.38), 10, 468, 1], [S0(0.7), 7, 433, 1], [S0(0.95), 7, 433, 1], [S0(1.25), 7, 470, 0]];
  }
  if (n === BIKE) return [[0.02, 16, 470, 0], [0.08, 19, 469, 1], [0.86, 19, 469, 1], [0.94, 16, 470, 0]];
  if (n === REASONS) return [[0.04, 16, 470, 0], [0.1, 18, 469, 1], [0.24, 18, 438, 1], [0.74, 18, 438, 1], [0.86, 19, 467, 1], [0.94, 16, 470, 0]];
  if (n === ARGUE) return [[0, 16, 470, 0], [0.03, 19, 462, 1], [0.1, 19, 468, 1], [0.13, 16, 470, 0], [0.5, 16, 470, 0], [0.53, 19, 468, 1], [0.62, 19, 462, 1], [0.66, 16, 470, 0]];
  if (n === WEIGH) return [[0.06, 8, 452, 0], [0.12, 12, 448, 1], [0.3, 12, 452, 1], [0.5, 12, 443, 1], [0.7, 12, 448, 1], [0.86, 8, 452, 0]];
  return NONE;
});
/** The plain one's right hand: the column, his boast, the wave, the purse, the sky, his heart, the hull. */
const PL_R: (readonly Key[])[] = per((n) => {
  if (n === ARRIVE) return [[0.5, 8, 452, 0], [0.62, 12, 441, 1]];
  if (n === BIKE) return [[0, 12, 441, 1]];
  if (n === BOAST || n === BOAST2) return [[0, 12, 441, n === BOAST ? 1 : 0], [0.08, 18, 441, 1], [0.84, 18, 441, 1], [0.94, 8, 452, 0]];
  if (n === CROWD) return [[0.14, 8, 452, 0], [0.22, 14, 424, 1], [0.34, 9, 427, 1], [0.46, 14, 424, 1], [0.6, 8, 452, 0]];
  if (n === PURSE) return [[0.44, 8, 452, 0], [0.52, 16, 443, 1], [0.58, 16, 443, 1], [0.64, 10, 437, 1], [0.69, 10, 433, 1], [0.74, 10, 437, 1], [0.82, 8, 447, 1]];
  if (n === WEIGH || n === Q2_AT) return [[0, 8, 447, 1]];
  if (n === HANDIN) return [[0, 8, 447, 1], [0.3, 19, 455, 1], [0.39, 19, 455, 1], [0.47, 10, 452, 0]];
  if (n === HARBOUR) return [[0.5, 8, 452, 0], [0.58, 12, 408, 1], [0.8, 12, 408, 1], [0.9, 8, 452, 0]];
  if (n === Q3_AT) return [[0.02, 6, 452, 0], [0.1, 3, 455, 1]];
  if (n === SHIP) return [[0, 3, 455, 0], [0.24, 10, 450, 0], [0.29, 14, 437, 1], [0.32, 13, 433, 1], [0.36, 14, 437, 1], [0.46, 14, 437, 1], [0.56, 9, 450, 0]];
  return NONE;
});
/** His left hand: only for the boast, spread with the right. */
const PL_L: (readonly Key[])[] = per((n) => (n === BOAST || n === BOAST2 ? [[0.08, 8, 452, 0], [0.16, 14, 446, 1], [0.84, 14, 446, 1], [0.94, 8, 452, 0]] : NONE));

// ── Q1, the table's three things (world = screen in the agora) ───────────────
const SHARDS = { x: 312, y: 469 };
const SHARD_BITS = [[-8, 0, 20], [-3, -2.6, -15], [2.5, 0.2, 35], [7, -1.4, -30], [0, -4.2, 10]] as const;
const HORN = { x: 346, y: 467 };
const DISH = { x: 260, y: 468.5 };
// ── Q2, the merchant's balance and three weights ────────────────────────────
const BAL = { x: 166, y: 406, arm: 26, drop: 34 };
const WEIGHTS = [
  { id: 'law', x: 116, lines: ['THE LAW SAYS', 'RETURN IT'] },
  { id: 'sandals', x: 188, lines: ['IT MATCHES', 'MY SANDALS'] },
  { id: 'hungry', x: 318, lines: ['ITS OWNER WILL', 'GO HUNGRY'] },
] as const;
const WEIGHT_Y = 487;
/** Q1's boxes and the tablet's plate: see VOTE_Q. */
const Q1_TOP = 428;
const Q1_TAB_C = 274;
const PLATE2 = { y: 489, w: 74, h: 23 };
// ── Q3, the quay (harbour x) ────────────────────────────────────────────────
const DIAL = { x: HX + 66, y: 445.4, len: 17 };
const GULL_Q = { x: HX + 318, y: 322 };
// ── the purse ──────────────────────────────────────────────────────────────
const PURSE_RIM = { x: 56, y: 441 };
const PURSE_DESK = { x: 91, y: 454 };
// ── cargo on the quay, waiting to be loaded ─────────────────────────────────
const CRATE_LOW = tint(crate(HX + 330, 474, 24, 20), 'wood');
const CRATE_TOP = tint(crate(HX + 331, 457, 18, 15), 'wood');

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { shards: 1, horn: 2, tablet: 3, law: 4, sandals: 5, hungry: 6, dial: 7, heart: 8, gull: 9 };

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
/** The beat's own walk: its one leg, from where he is. */
function legsOf(src: number, legs: Track, b: number, L: number, faceSrc: number): Walk {
  'worklet';
  const leg = legs[legs.length - 1];
  return walkOf(src, leg[1], legs[0][0] * L, faceSrc, b);
}
/** The same walk, begun `off` seconds into the beat (the harbour half of the walk down). */
function shifted(w: Walk, off: number): Walk {
  'worklet';
  return { ...w, ws: w.ws + off, we: w.we + off };
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
  // in time order (a handful of turns at most)
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
/** Where a pan hangs from: the beam's end at this tilt. */
function panAt(tilt: number, side: -1 | 1) {
  'worklet';
  return { x: BAL.x + side * BAL.arm * Math.cos(tilt), y: BAL.y - side * BAL.arm * Math.sin(tilt) };
}

export default function Phil7Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldT = useHeld();
  const heldP = useHeld();
  const cv = useCarry(27);
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

    // ── the plain one (his walk drives the camera on the way down) ──────────
    // a tap past the walk down before the fade lands them at the harbour under a fade
    const late = n > HARBOUR && carrySource(cv, 1, n, 0) > -HX + 1;
    const legsP = PL_LEGS[n];
    let srcP = carrySource(cv, 0, n, PL_OFF);
    if (late) srcP = legsP[legsP.length - 1][1];
    const fP = carrySource(cv, 2, n, 1);
    let wP = legsOf(srcP, legsP, b, L, fP);
    if (n === HARBOUR) wP = b < CUT ? walkOf(srcP, PL_EXIT, 0, fP, b) : shifted(walkOf(PL_ENTER, PL_QUAY, 0, 1, b - CUT), CUT);
    const xPw = carry(cv, 0, n, wP.x, wP.x, 1);
    // ── the camera: the agora, then (cut under the fade) the harbour ────────
    const camNow = n < HARBOUR ? 0 : n === HARBOUR ? (b < CUT ? 0 : -HX) : -HX;
    const cam = carry(cv, 1, n, 0, camNow, 1);
    const fade = n === HARBOUR ? stage(b, 1, CUT - 0.35, CUT) * (1 - stage(b, 1, CUT, CUT + 0.45)) : late ? 1 - stage(b, 1, 0, 0.45) : 0;
    const xP = xPw + cam;
    const dP = carry(cv, 2, n, 0, faceOf(fP, PL_TURN[n], b, L, wP), 1);
    let sp = bodyOf(wP, PL_P, n, t, b, 1);
    sp = keyed(sp, PL_R[n], u, xP, dP, 1);
    sp = keyed(sp, PL_L[n], u, xP, dP, -1);
    if (n === ARRIVE) sp = look(sp, -0.1);
    if (n === BOAST || n === BOAST2) sp = look(sp, -0.13 * hd(0.04, 0.14, 0.86, 0.96));
    if (n === INSULT) sp = look(sp, 0.14 * hd(0.08, 0.2, 0.42, 0.52) - 0.16 * hd(0.56, 0.66, 0.9, 1));
    if (n === HARBOUR) sp = look(sp, -0.18 * hd(0.56, 0.64, 0.8, 0.88));
    if (n === SHIP) sp = look(sp, -0.08 * hd(0.24, 0.3, 0.5, 0.58));
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t, 1));
    const figP = keepHeld(heldP, wP.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the philosopher ─────────────────────────────────────────────────────
    const legsT = TH_LEGS[n];
    let srcT = carrySource(cv, 3, n, TH_DESK);
    if (late) srcT = legsT[legsT.length - 1][1];
    const fT = carrySource(cv, 4, n, -1);
    let wT = legsOf(srcT, legsT, b, L, fT);
    if (n === HARBOUR) wT = b < CUT ? walkOf(srcT, TH_EXIT, 0.1 * L, fT, b) : shifted(walkOf(TH_ENTER, TH_QUAY, 0.24, 1, b - CUT), CUT);
    const xTw = carry(cv, 3, n, wT.x, wT.x, 1);
    const xT = xTw + cam;
    const dT = carry(cv, 4, n, 0, faceOf(fT, TH_TURN[n], b, L, wT), 1);
    let sh = bodyOf(wT, TH_P, n, t, b, 0);
    sh = keyed(sh, TH_R[n], u, xT, dT, 1);
    sh = keyed(sh, TH_L[n], u, xT, dT, -1);
    if (n === WORK) {
      const writing = 0.12 * (1 - stage(b, L, S0(6.0), S0(6.4)));
      const chin = stage(b, L, S0(3.45), S0(3.6)) * (1 - stage(b, L, S0(3.85), S0(4.0)));
      sh = look(sh, writing * (1 - 0.6 * chin) - 0.22 * stage(b, L, S0(6.15), S0(6.6)));
    }
    if (n === BIKE) sh = look(sh, 0.1 * hd(0.2, 0.26, 0.66, 0.74));
    if (n === ARGUE) sh = look(sh, 0.1 * hd(0.1, 0.14, 0.38, 0.44));
    if (n === FREE) sh = look(sh, 0.12 * (hd(0.08, 0.16, 0.2, 0.28) + hd(0.46, 0.54, 0.6, 0.68)));
    if (n === KNOW) sh = look(sh, 0.08 * hd(0.12, 0.2, 0.46, 0.56));
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t, 0));
    const figT = keepHeld(heldT, wT.walking ? mixKeepLegs(prevT, sh, tr) : mixStance(prevT, sh, tr));

    const pl = pose(figP, xP, GROUND, K, dP, 1);
    const ph = pose(figT, xT, GROUND, K, dT, 1);
    const tR = wristOf(ph, 'wrR');
    const tL = wristOf(ph, 'wrL');
    const pR = wristOf(pl, 'wrR');
    const sT = dT < 0 ? -1 : 1;

    // ── the tablet: lying, held up, stood up ────────────────────────────────
    let held = 0;
    let propped = n > REASONS ? 1 : 0;
    if (n === REASONS) {
      held = hd(0.1, 0.2, 0.84, 0.92);
      propped = st(0.84, 0.92);
    }
    if (n === ARGUE) propped = 1 - hd(0.03, 0.1, 0.53, 0.62);
    const heldX = tL.x + 2 * sT;
    const heldY = tL.y - 8;
    const restY = lerp(TAB.flatY, TAB.propY, propped);
    const tabX = lerp(TAB.x + cam, heldX, held);
    const tabY = lerp(restY, heldY, held);
    const tabSy = lerp(lerp(TAB.flatSy, 0.94, propped), 1, held);
    const tabK = 1 + 0.32 * Math.max(propped, held);
    // the lines on it, each scratched in as the stylus crosses it
    const lA = carry(cv, 5, n, 0, n > WORK ? 1 : stage(b, L, S0(1.1), S0(1.9)), tr);
    const lB = carry(cv, 6, n, 0, n > WORK ? 0 : stage(b, L, S0(2.45), S0(3.3)) * (1 - stage(b, L, S0(4.05), S0(4.75))), tr);
    const lB2 = carry(cv, 7, n, 0, n > WORK ? 1 : stage(b, L, S0(5.2), S0(6.0)), tr);
    const lW = carry(cv, 8, n, 0, n > BIKE ? 1 : n === BIKE ? clamp01((u - 0.27) / 0.18) : 0, tr);
    const lC = carry(cv, 9, n, 0, n > ARGUE ? 1 : n === ARGUE ? st(0.14, 0.24) : 0, tr);
    const lD = carry(cv, 10, n, 0, n > ARGUE ? 1 : n === ARGUE ? st(0.27, 0.35) : 0, tr);
    const tapW = n === BIKE ? hd(0.52, 0.55, 0.57, 0.6) + hd(0.6, 0.63, 0.65, 0.68) : 0;

    // ── the fig: in the dish, in his hand, eaten ────────────────────────────
    const figIn = n === WORK ? st(S0(0.36), S0(0.4)) : 1;
    const figGone = n === WORK ? st(S0(0.8), S0(0.92)) : 1;
    const fig = {
      x: lerp(DISH.x + 2 + cam, tL.x + sT * 1.5, figIn),
      y: lerp(DISH.y - 1.6, tL.y - 1.5, figIn),
      o: carry(cv, 11, n, 0, 1 - figGone, tr),
    };

    // ── the purse: on the rim, in his hand, on the official's table ─────────
    const grab = n === PURSE ? st(0.55, 0.58) : n > PURSE && n < HANDIN ? 1 : n === HANDIN ? 1 - st(0.37, 0.4) : 0;
    const onDesk = n > HANDIN || (n === HANDIN && u > 0.38) ? 1 : 0;
    const sP = dP < 0 ? -1 : 1;
    const jingle = n === PURSE ? hd(0.64, 0.67, 0.72, 0.76) : 0;
    const restPurse = onDesk ? PURSE_DESK : PURSE_RIM;
    const purse = {
      x: lerp(restPurse.x + cam, pR.x + sP * 1.2, grab),
      y: lerp(restPurse.y, pR.y + 2, grab),
      rot: 14 * jingle * Math.sin(t * 40),
    };

    // ── Q1: the shards, the horn, the tablet ────────────────────────────────
    const rShards = carry(cv, 12, n, 0, ans(1, Q1), tr);
    const rHorn = carry(cv, 13, n, 0, ans(2, Q1), tr);
    const rTab = carry(cv, 14, n, 0, ans(3, Q1), tr);
    // ── Q2: the weights and the balance ─────────────────────────────────────
    const rLaw = carry(cv, 15, n, 0, ans(4, Q2), tr);
    const rSandals = carry(cv, 16, n, 0, ans(5, Q2), tr);
    const rHungry = carry(cv, 17, n, 0, ans(6, Q2), tr);
    const land = clamp01((rHungry - 0.55) / 0.45);
    const tilt = 0.3 * (land < 1 ? Math.sin(land * Math.PI * 0.5) * (1 + 0.35 * Math.sin(land * Math.PI * 3) * (1 - land)) : 1)
      + 0.05 * Math.sin(rLaw * Math.PI * 3) * (1 - rLaw);
    // ── Q3: the dial, his heart, the gull ───────────────────────────────────
    const rDial = carry(cv, 18, n, 0, ans(7, Q3), tr);
    const rHeart = carry(cv, 19, n, 0, ans(8, Q3), tr);
    const rGull = carry(cv, 20, n, 0, ans(9, Q3), tr);

    // the stylus is put away when they leave the agora; two fingers for the copy
    const stylusO = carry(cv, 21, n, 0, n < HARBOUR ? 1 : 0, tr);
    const fingers = carry(cv, 22, n, 0, n === COPY ? hd(0.14, 0.2, 0.8, 0.86) : 0, tr);
    // the labels on the pans, while he talks of the two ways and during Q2
    const pans = carry(cv, 23, n, 0, n === WEIGH ? st(0.3, 0.45) : n === Q2_AT ? 1 : 0, tr);

    return {
      pl, ph, cam, t, sT, fade,
      tab: { x: tabX, y: tabY - 3 * Math.max(propped, held) * (1 - held), sy: tabSy, k: tabK, pop: rTab, h: held },
      lines: { a: lA, b: lB, b2: lB2, w: lW, c: lC, d: lD, tap: tapW },
      tR, fig, purse,
      rShards, rHorn, rTab, rLaw, rSandals, rHungry, tilt, rDial, rHeart, rGull,
      heart: pR,
      stylusO, fingers, pans,
      q1: carry(cv, 24, n, 0, Q1[n], tr),
      q2: carry(cv, 25, n, 0, Q2[n], tr),
      q3: carry(cv, 26, n, 0, Q3[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.ph);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the agora (x 0–400) and the harbour (x 400–800) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="phil7-agora-far" />
        <Cloud S={SCENE} x={46} y={234} s={1} k={0} />
        <Cloud S={SCENE} x={226} y={246} s={0.8} k={1} />
        <Cloud S={SCENE} x={350} y={224} s={0.9} k={2} />
        <LessonPicture name="phil7-agora-mid" />
        <View style={styles.tableShadow} />
        <Fountain S={SCENE} />
        <Balance S={SCENE} />
        {/* his stone table: behind the people, so it hides nobody; he works at its left end */}
        <LessonPicture name="phil7-agora-table" />
        <Shards S={SCENE} />
        <Horn S={SCENE} />
        <View style={styles.dish} />
        <View style={[styles.figBit, { left: DISH.x - 4.5, top: DISH.y - 3.4 }]} />
        <View style={[styles.figBit, { left: DISH.x - 1.5, top: DISH.y - 3.8 }]} />
        <LessonPicture name="phil7-harbour-far" />
        <Cloud S={SCENE} x={HX + 60} y={236} s={0.9} k={3} />
        <Cloud S={SCENE} x={HX + 200} y={226} s={1} k={4} />
        <Cloud S={SCENE} x={HX + 344} y={250} s={0.75} k={5} />
        <Sparkles S={SCENE} />
        <Ship S={SCENE} />
        <LessonPicture name="phil7-harbour-mid" />
        <ObjectArt parts={CRATE_LOW} tone={TONE} />
        <ObjectArt parts={CRATE_TOP} tone={TONE} />
        <DialShadow S={SCENE} />
        <Gull S={SCENE} k={0} />
        <Gull S={SCENE} k={1} />
        <QuayGull S={SCENE} />
        <Weights S={SCENE} />
      </Animated.View>
      {/* the tablet and the fig sit on the table behind him, so a hand that rests by them,
          holds them or writes on them is in front of them */}
      <Tablet S={SCENE} front={false} />
      <Fig S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="lead" wear={BY_ID.magistrate.pieces} />
      <Tablet S={SCENE} front />
      <Stylus S={SCENE} />
      <Fingers S={SCENE} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="second" wear={[]} />
      <Purse S={SCENE} />
      {on(Q3) ? <Heart S={SCENE} /> : null}
      {/* the labels and the things to tap */}
      {on(Q1) ? <Plates S={SCENE} k="q1" items={Q1_PLATES} /> : null}
      <Plates S={SCENE} k="pans" items={PAN_PLATES} />
      {on(Q2) ? <Plates S={SCENE} k="q2" items={Q2_PLATES} /> : null}
      {on(Q3) ? <Plates S={SCENE} k="q3" items={Q3_PLATES} /> : null}
      <Fade S={SCENE} />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={VOTE_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={SCALE_Q} k="q2" /> : null}
      {on(Q3) ? <StageTargets picked={picked} onPick={onPick} live={Q3[i] === 1} S={SCENE} qs={HOUR_Q} k="q3" /> : null}
    </View>
  );
}

// ── the living world ─────────────────────────────────────────────────────────

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
/** The fountain: the stream out of the lion's mouth, a drop, a splash, a ring in the basin. */
function Fountain({ S }: { S: SharedValue<any> }) {
  const stream = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 + 0.18 * Math.sin(S.value.t * 9) }] }));
  const drop = useAnimatedStyle(() => {
    const ph = (S.value.t * 1.6) % 1;
    return { opacity: 1 - ph, transform: [{ translateY: 427 + 17 * ph }] };
  });
  const splash = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 + 0.25 * Math.sin(S.value.t * 7) }, { scaleY: 1 + 0.3 * Math.sin(S.value.t * 7 + 1) }] }));
  const ring = useAnimatedStyle(() => {
    const ph = (S.value.t * 0.7) % 1;
    return { opacity: 0.8 * (1 - ph), transform: [{ scaleX: 0.4 + 1.6 * ph }] };
  });
  return (
    <>
      <Animated.View style={[styles.stream, stream]} pointerEvents="none" />
      <Animated.View style={[styles.rider, drop]} pointerEvents="none"><View style={styles.drop} /></Animated.View>
      <Animated.View style={[styles.splash, splash]} pointerEvents="none" />
      <Animated.View style={[styles.ripple, ring]} pointerEvents="none" />
    </>
  );
}
/** The sun on the sea: short glints that come and go. */
const GLINTS = [[HX + 150, 398, 0], [HX + 190, 412, 1.3], [HX + 236, 404, 2.1], [HX + 290, 420, 0.7], [HX + 340, 400, 2.8], [HX + 372, 428, 1.9], [HX + 165, 432, 3.3]];
function Sparkles({ S }: { S: SharedValue<any> }) {
  return <>{GLINTS.map(([x, y, ph], k) => <Glint key={k} S={S} x={x} y={y} ph={ph} />)}</>;
}
function Glint({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const v = Math.sin(S.value.t * 0.9 + ph);
    return { opacity: Math.max(0, v), transform: [{ translateX: x + 4 * Math.sin(S.value.t * 0.3 + ph) }, { translateY: y }, { scaleX: 0.6 + 0.4 * v }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.glint} /></Animated.View>;
}
/** The old ship riding at her mooring. */
function Ship({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: HX + 160 }, { translateY: 0.8 * Math.sin(S.value.t * 0.8) }, { rotate: `${0.25 * Math.sin(S.value.t * 0.8 + 0.6)}deg` }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="phil7-ship" /></Animated.View>;
}
/** The gnomon's shadow on the dial: near the noon line, and onto it when the dial is read. */
function DialShadow({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rDial;
    const pop = Math.sin(Math.PI * Math.min(1, r * 1.4));
    const deg = -14 * (1 - Math.min(1, r * 1.6)) + 3 * Math.sin(r * Math.PI * 2) * (1 - r);
    return { transform: [{ translateX: DIAL.x }, { translateY: DIAL.y }, { rotate: `${deg}deg` }, { scale: 1 + 0.18 * pop }] };
  });
  return (
    <Animated.View nativeID="ph7-dial" style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.shadow} />
    </Animated.View>
  );
}
/** A gull gliding round over the harbour. */
function Gull({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.t * (k ? 0.21 : 0.26) + k * 2.2;
    const x = HX + (k ? 250 : 120) + (k ? 60 : 80) * Math.cos(a);
    const y = (k ? 268 : 246) + 10 * Math.sin(a * 2);
    const flap = 0.75 + 0.25 * Math.sin(S.value.t * (k ? 5 : 6));
    return { transform: [{ translateX: x }, { translateY: y }, { scaleX: Math.sin(a) > 0 ? -0.8 : 0.8 }, { scaleY: 0.8 * flap }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="phil7-gull" /></Animated.View>;
}
/** The gull for Q3: hanging on the wind over the quay; picked, it flaps off up the sky. */
function QuayGull({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rGull;
    const flap = r > 0 ? 0.55 + 0.45 * Math.sin(S.value.t * 16) : 0.85 + 0.15 * Math.sin(S.value.t * 2.4);
    return {
      transform: [
        { translateX: GULL_Q.x + 130 * r * r }, { translateY: GULL_Q.y + 2 * Math.sin(S.value.t * 1.3) - 120 * r },
        { rotate: `${-18 * r}deg` }, { scale: 1.3 }, { scaleY: flap },
      ],
    };
  });
  return <Animated.View nativeID="ph7-quaygull" style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="phil7-gull" /></Animated.View>;
}

// ── the stoa's table ─────────────────────────────────────────────────────────

/** The heap of clay voting shards: picked, they scatter and fall flat. */
function Shards({ S }: { S: SharedValue<any> }) {
  return <>{SHARD_BITS.map((g, k) => <Shard key={k} S={S} k={k} dx={g[0]} dy={g[1]} deg={g[2]} />)}</>;
}
function Shard({ S, k, dx, dy, deg }: { S: SharedValue<any>; k: number; dx: number; dy: number; deg: number }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rShards;
    const out = (k - 2) * 6 * r;
    return {
      transform: [
        { translateX: SHARDS.x + dx + out }, { translateY: SHARDS.y + dy - 9 * Math.sin(Math.PI * r) + (k === 4 ? 4 * r : 0) },
        { rotate: `${deg + 160 * r * (k % 2 ? 1 : -1)}deg` },
      ],
    };
  });
  return <Animated.View nativeID="ph7-shards" style={[styles.rider, st]} pointerEvents="none"><View style={styles.shard} /></Animated.View>;
}
/** The herald's bronze horn: picked, it blares — it jumps and shudders and its noise goes up. */
function Horn({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rHorn;
    const buzz = r > 0 && r < 1 ? Math.sin(r * 70) * (1 - r) * 2.2 : 0;
    return { transform: [{ translateX: HORN.x + buzz }, { translateY: HORN.y - 5 * Math.sin(Math.PI * r) }, { rotate: `${-10 * Math.sin(Math.PI * r)}deg` }, { scale: 1.35 }] };
  });
  const blast = useAnimatedStyle(() => {
    const r = S.value.rHorn;
    return { opacity: Math.sin(Math.PI * Math.min(1, r)), transform: [{ translateX: HORN.x - 16 - 6 * r }, { translateY: HORN.y - 4 }, { scale: 0.6 + 0.6 * r }] };
  });
  return (
    <>
      <Animated.View nativeID="ph7-horn" style={[styles.rider, st]} pointerEvents="none">
        <View style={styles.hornTube} />
        <View style={styles.hornBell} />
        <View style={styles.hornMouth} />
      </Animated.View>
      <Animated.View style={[styles.rider, blast]} pointerEvents="none">
        <View style={[styles.blastArc, { left: -4, top: -6, width: 8, height: 12 }]} />
        <View style={[styles.blastArc, { left: -9, top: -9, width: 12, height: 18 }]} />
      </Animated.View>
    </>
  );
}
/** The wax tablet: a frame of boxwood round dark wax, and what has been scratched in it. */
function Tablet({ S, front }: { S: SharedValue<any>; front: boolean }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.tab;
    const pop = Math.sin(Math.PI * Math.min(1, v.pop * 1.5));
    return {
      // on the table it is behind him; held up, it is in front of him (two copies, one shown)
      opacity: (v.h > 0.02) === front ? 1 : 0,
      transform: [{ translateX: v.x }, { translateY: v.y - 7 * pop }, { scale: v.k * (1 + 0.16 * pop) }, { scaleY: Math.max(0.05, v.sy) }],
    };
  });
  const A = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, S.value.lines.a) }] }));
  const B = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, S.value.lines.b) }] }));
  const B2 = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, S.value.lines.b2) }] }));
  const C = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, S.value.lines.c) }] }));
  const D = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, S.value.lines.d) }] }));
  const wheel = useAnimatedStyle(() => ({ opacity: S.value.lines.w, transform: [{ scale: 1 + 0.15 * S.value.lines.tap }] }));
  return (
    <Animated.View nativeID="ph7-tablet" style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.tabFrame} />
      <View style={styles.tabWax} />
      <Animated.View style={[styles.scratch, { left: -9, top: -4.5, width: 16 }, A]} />
      <Animated.View style={[styles.scratch, { left: -4, top: -1, width: 11 }, B]} />
      <Animated.View style={[styles.scratch, { left: -5, top: -1, width: 12 }, B2]} />
      <Animated.View style={[styles.scratch, { left: 1.5, top: 3.5, width: 5.5 }, C]} />
      <Animated.View style={[styles.scratch, { left: -3.5, top: 3.5, width: 3.5 }, D]} />
      <Animated.View style={[styles.wheel, wheel]}>
        <View style={styles.wheelRim} />
        <View style={styles.spokeH} />
        <View style={styles.spokeV} />
      </Animated.View>
    </Animated.View>
  );
}
/** The stylus in his right hand, its point forward and down. */
function Stylus({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.stylusO,
    transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y }, { scaleX: S.value.sT }, { rotate: `${S.value.sT * 31}deg` }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.stylus} /></Animated.View>;
}
/** Two fingers held up side by side: one of you, and a copy. */
function Fingers({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.fingers,
    transform: [{ translateX: S.value.tR.x }, { translateY: S.value.tR.y }, { scaleY: 0.4 + 0.6 * S.value.fingers }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.finger, { left: -2.4 }]} />
      <View style={[styles.finger, { left: 0.6 }]} />
    </Animated.View>
  );
}
function Fig({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.fig.o, transform: [{ translateX: S.value.fig.x }, { translateY: S.value.fig.y }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.fig} /></Animated.View>;
}
/** The leather purse, tied at the neck. */
function Purse({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.purse.x }, { translateY: S.value.purse.y }, { rotate: `${S.value.purse.rot}deg` }],
  }));
  return (
    <Animated.View nativeID="ph7-purse" style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.purseBody} />
      <View style={styles.purseNeck} />
      <View style={styles.purseTie} />
    </Animated.View>
  );
}

// ── the merchant's balance and the three weights ─────────────────────────────

function Balance({ S }: { S: SharedValue<any> }) {
  const beam = useAnimatedStyle(() => ({ transform: [{ rotate: `${(-S.value.tilt * 180) / Math.PI}deg` }] }));
  return (
    <>
      <Animated.View style={[styles.beam, beam]} pointerEvents="none" />
      <View style={styles.pivot} pointerEvents="none" />
      <Pan S={S} side={-1} />
      <Pan S={S} side={1} />
    </>
  );
}
function Pan({ S, side }: { S: SharedValue<any>; side: -1 | 1 }) {
  const st = useAnimatedStyle(() => {
    const e = panAt(S.value.tilt, side);
    return { transform: [{ translateX: e.x }, { translateY: e.y }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.chain, { transform: [{ rotate: '14deg' }] }]} />
      <View style={styles.chain} />
      <View style={[styles.chain, { transform: [{ rotate: '-14deg' }] }]} />
      <View style={styles.pan} />
    </Animated.View>
  );
}
/** A bronze weight: a squat dome with a ring on top. */
function WeightBody() {
  return (
    <>
      <View style={styles.weightRing} />
      <View style={styles.weightBody} />
      <View style={styles.weightShade} />
    </>
  );
}
function Weights({ S }: { S: SharedValue<any> }) {
  return <>{WEIGHTS.map((g) => <Weight key={g.id} S={S} id={g.id} x={g.x} />)}</>;
}
function Weight({ S, id, x }: { S: SharedValue<any>; id: string; x: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const show = Math.max(v.q2, id === 'hungry' && v.rHungry > 0 ? 1 : 0);
    let tx = x;
    let ty = WEIGHT_Y;
    let deg = 0;
    if (id === 'hungry') {
      const f = clamp01(v.rHungry / 0.55);
      const e = panAt(v.tilt, -1);
      tx = lerp(x, e.x, f);
      ty = lerp(WEIGHT_Y, e.y + BAL.drop - 1, f) - 112 * Math.sin(Math.PI * f);
      deg = -360 * f;
    } else if (id === 'law') {
      const r = v.rLaw;
      tx = x + 10 * Math.sin(Math.PI * r);
      ty = WEIGHT_Y - 14 * Math.sin(Math.PI * Math.min(1, r * 1.3));
      deg = 10 * Math.sin(r * Math.PI * 5) * (1 - r);
    } else {
      const r = v.rSandals;
      ty = WEIGHT_Y - 8 * Math.sin(Math.PI * Math.min(1, r * 1.8));
      deg = 90 * clamp01(r * 1.4 - 0.2);
    }
    return { opacity: show, transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${deg}deg` }] };
  });
  return <Animated.View nativeID={`ph7-weight-${id}`} style={[styles.rider, st]} pointerEvents="none"><WeightBody /></Animated.View>;
}

/** The fade through on the walk down to the harbour. */
function Fade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.fade }));
  return <Animated.View style={[styles.fade, st]} pointerEvents="none" />;
}
/** His feeling: a heart that swells out of his chest, then cracks and sinks. */
function Heart({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.rHeart;
    const grow = Math.min(1, r * 2.2);
    const sag = clamp01(r * 2 - 1);
    return {
      opacity: Math.max(grow * (1 - 0.6 * sag), S.value.q3 * (1 - sag)),
      transform: [
        { translateX: S.value.heart.x + 3 * Math.sin(sag * Math.PI * 5) * (1 - sag) }, { translateY: S.value.heart.y - 14 * grow + 10 * sag },
        { scale: 0.75 + 0.65 * grow - 0.45 * sag },
      ],
    };
  });
  return (
    <Animated.View nativeID="ph7-heart" style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.heartLobe, { left: -6.5 }]} />
      <View style={[styles.heartLobe, { left: -0.5 }]} />
      <View style={styles.heartPoint} />
      <View style={styles.heartCrack} />
    </Animated.View>
  );
}

// ── the labels and the three games ───────────────────────────────────────────

type Plate = { x: number; y: number; w: number; lines: readonly string[] };
const Q1_PLATES: Plate[] = [
  { x: Q1_TAB_C, y: 477, w: 42, lines: ['REASON'] },
  { x: SHARDS.x, y: 477, w: 34, lines: ['VOTES'] },
  { x: HORN.x + 2, y: 477, w: 40, lines: ['A HORN'] },
];
const PAN_PLATES: Plate[] = [
  { x: 142, y: 446, w: 80, lines: ['CONSEQUENCES'] },
  { x: 201, y: 446, w: 34, lines: ['RULE'] },
];
const Q2_PLATES: Plate[] = WEIGHTS.map((g) => ({ x: g.x, y: PLATE2.y, w: g.id === 'hungry' ? 80 : PLATE2.w, lines: g.lines }));
const Q3_PLATES: Plate[] = [
  { x: 61, y: 496, w: 68, lines: ['THE SUNDIAL'] },
  { x: 175, y: 402, w: 72, lines: ['HIS FEELING'] },
  { x: 318, y: 337, w: 46, lines: ['A GULL'] },
];
function Plates({ S, k, items }: { S: SharedValue<any>; k: 'q1' | 'q2' | 'q3' | 'pans'; items: Plate[] }) {
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
/**
 * CAST YOUR VOTE: which of the three could settle the bicycle question? Each box reaches up
 * above its thing, so the verdict seal (struck at the box's top-right) lands in the air over
 * the table, never on the tablet, the shards, the horn or their plates; the tablet's box sits
 * a little right of the tablet, clear of the philosopher at its end.
 */
const VOTE_Q: Q[] = [
  { id: 'tablet', left: Q1_TAB_C - 19, top: Q1_TOP, w: 38, h: 500 - Q1_TOP, r: 4, correct: true },
  { id: 'shards', left: SHARDS.x - 16, top: Q1_TOP, w: 32, h: 500 - Q1_TOP, r: 4, correct: false },
  { id: 'horn', left: HORN.x - 18, top: Q1_TOP, w: 32, h: 500 - Q1_TOP, r: 4, correct: false },
];
/** LOAD THE SCALES: which weight belongs on the consequences pan? */
const SCALE_Q: Q[] = WEIGHTS.map((g) => {
  const w = g.id === 'hungry' ? 80 : PLATE2.w;
  return { id: g.id, left: g.x - w / 2, top: WEIGHT_Y - 16, w, h: PLATE2.y + PLATE2.h - WEIGHT_Y + 17, r: 4, correct: g.id === 'hungry' };
});
/**
 * READ THE HOUR: which gives him a good reason to think it is noon? (the harbour, on screen)
 * The heart's box reaches right of him and the gull's up above it, so each verdict seal (the
 * box's top-right) lands in the air beside the thing, not on it or on its plate.
 */
const HOUR_Q: Q[] = [
  { id: 'dial', left: 26, top: 428, w: 70, h: 86, r: 5, correct: true },
  { id: 'heart', left: 159, top: 440, w: 60, h: 30, r: 6, correct: false },
  { id: 'gull', left: 292, top: 294, w: 52, h: 58, r: 6, correct: false },
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
  fade: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.cloudWhite.base },
  tableShadow: { position: 'absolute', left: 260, top: 493, width: 114, height: 4, borderRadius: 2.5, backgroundColor: SHADE, opacity: 0.45 },
  cloud: { position: 'absolute', backgroundColor: W.cloudWhite.base },
  cloudFoot: { position: 'absolute', backgroundColor: W.cloudWhite.shade },
  stream: { position: 'absolute', left: 36.9, top: 425.6, width: 2.2, height: 19.4, borderRadius: 1.1, backgroundColor: W.ph7Water.base },
  drop: { position: 'absolute', left: 39.6, top: 0, width: 1.6, height: 2.4, borderRadius: 0.8, backgroundColor: W.ph7Foam.shade },
  splash: { position: 'absolute', left: 33, top: 442.6, width: 10, height: 3, borderRadius: 1.5, backgroundColor: W.ph7Foam.base },
  ripple: { position: 'absolute', left: 26, top: 444.6, width: 24, height: 1.4, borderRadius: 0.7, backgroundColor: W.ph7Foam.base },
  glint: { position: 'absolute', left: -6, top: -0.6, width: 12, height: 1.2, borderRadius: 0.6, backgroundColor: W.ph7Foam.base },
  shadow: {
    position: 'absolute', left: -0.8, top: 0, width: 1.6, height: DIAL.len * 0.42, borderRadius: 0.8,
    backgroundColor: W.ph7Shadow.base, transformOrigin: '50% 0%',
  },
  shard: {
    position: 'absolute', left: -4, top: -2, width: 8, height: 4.4, borderRadius: 1.4, backgroundColor: W.ph7Clay.base,
    borderWidth: 0.6, borderColor: INK,
  },
  hornTube: { position: 'absolute', left: -12, top: -1.2, width: 22, height: 2.4, borderRadius: 1.2, backgroundColor: W.ph7Bronze.base, borderWidth: 0.6, borderColor: INK },
  hornBell: { position: 'absolute', left: -16, top: -4, width: 6, height: 8, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, backgroundColor: W.ph7Bronze.base, borderWidth: 0.7, borderColor: INK },
  hornMouth: { position: 'absolute', left: 9, top: -1.8, width: 3, height: 3.6, borderRadius: 1, backgroundColor: W.ph7Bronze.shade, borderWidth: 0.5, borderColor: INK },
  blastArc: { position: 'absolute', borderLeftWidth: 1.2, borderColor: INK, borderRadius: 9 },
  dish: {
    position: 'absolute', left: DISH.x - 6, top: DISH.y - 1.4, width: 12, height: 3, borderRadius: 1.5,
    backgroundColor: W.ph7Clay.base, borderWidth: 0.6, borderColor: INK,
  },
  figBit: { position: 'absolute', width: 3.4, height: 3.6, borderRadius: 1.7, backgroundColor: W.ph7Fig.base, borderWidth: 0.4, borderColor: INK },
  fig: { position: 'absolute', left: -1.7, top: -1.8, width: 3.4, height: 3.6, borderRadius: 1.7, backgroundColor: W.ph7Fig.base, borderWidth: 0.4, borderColor: INK },
  tabFrame: {
    position: 'absolute', left: -TAB.w / 2, top: -TAB.h / 2, width: TAB.w, height: TAB.h, borderRadius: 1.2,
    backgroundColor: W.ph7Frame.base, borderWidth: 0.8, borderColor: INK,
  },
  tabWax: { position: 'absolute', left: -TAB.w / 2 + 1.8, top: -TAB.h / 2 + 1.8, width: TAB.w - 3.6, height: TAB.h - 3.6, backgroundColor: W.ph7Wax.base },
  scratch: { position: 'absolute', height: 0.9, borderRadius: 0.45, backgroundColor: W.ph7Scratch.base, transformOrigin: '100% 50%' },
  wheel: { position: 'absolute', left: 3, top: -0.5, width: 6, height: 6 },
  wheelRim: { position: 'absolute', left: 0, top: 0, width: 6, height: 6, borderRadius: 3, borderWidth: 0.8, borderColor: W.ph7Scratch.base },
  spokeH: { position: 'absolute', left: 0.6, top: 2.7, width: 4.8, height: 0.6, backgroundColor: W.ph7Scratch.base },
  spokeV: { position: 'absolute', left: 2.7, top: 0.6, width: 0.6, height: 4.8, backgroundColor: W.ph7Scratch.base },
  stylus: { position: 'absolute', left: -1, top: -0.5, width: 8, height: 1.1, borderRadius: 0.55, backgroundColor: W.ph7Stylus.base, borderWidth: 0.35, borderColor: INK },
  finger: { position: 'absolute', top: -9, width: 1.8, height: 8, borderRadius: 0.9, backgroundColor: INK },
  purseBody: { position: 'absolute', left: -4, top: -3, width: 8, height: 7.4, borderRadius: 3.6, backgroundColor: W.ph7Leather.base, borderWidth: 0.7, borderColor: INK },
  purseNeck: { position: 'absolute', left: -2, top: -5, width: 4, height: 3, borderRadius: 1, backgroundColor: W.ph7Leather.shade, borderWidth: 0.5, borderColor: INK },
  purseTie: { position: 'absolute', left: -2.6, top: -3.4, width: 5.2, height: 1, backgroundColor: W.ph7Stylus.base },
  beam: {
    position: 'absolute', left: BAL.x - BAL.arm - 1, top: BAL.y - 1, width: 2 * BAL.arm + 2, height: 2, borderRadius: 1,
    backgroundColor: W.ph7Bronze.base, borderWidth: 0.5, borderColor: INK,
  },
  pivot: { position: 'absolute', left: BAL.x - 2, top: BAL.y - 2, width: 4, height: 4, borderRadius: 2, backgroundColor: W.ph7Bronze.shade, borderWidth: 0.5, borderColor: INK },
  chain: { position: 'absolute', left: -0.4, top: 0, width: 0.8, height: BAL.drop, backgroundColor: W.ph7Chain.base, transformOrigin: '50% 0%' },
  pan: {
    position: 'absolute', left: -10, top: BAL.drop - 1, width: 20, height: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: W.ph7Bronze.base, borderWidth: 0.7, borderColor: INK,
  },
  weightRing: { position: 'absolute', left: -2.5, top: -17, width: 5, height: 5, borderRadius: 2.5, borderWidth: 1.2, borderColor: W.ph7Bronze.shade },
  weightBody: {
    position: 'absolute', left: -8, top: -13, width: 16, height: 13, borderTopLeftRadius: 8, borderTopRightRadius: 8,
    borderBottomLeftRadius: 1.5, borderBottomRightRadius: 1.5, backgroundColor: W.ph7Bronze.base, borderWidth: 0.8, borderColor: INK,
  },
  weightShade: { position: 'absolute', left: 2, top: -11.4, width: 5, height: 10.6, borderTopRightRadius: 5, backgroundColor: W.ph7Bronze.shade },
  heartLobe: { position: 'absolute', top: -5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: W.ph7Heart.base },
  heartPoint: { position: 'absolute', left: -3.6, top: -3.2, width: 7.2, height: 7.2, backgroundColor: W.ph7Heart.base, transform: [{ rotate: '45deg' }] },
  heartCrack: { position: 'absolute', left: -0.4, top: -4, width: 0.9, height: 7, backgroundColor: W.ph7Heart.shade, transform: [{ rotate: '18deg' }] },
  plate: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-07 — the three question beats (VOTES/REASON/A HORN,
// the three weights and both pans, THE SUNDIAL/HIS FEELING/A GULL) read whole on the phil7-v3 sheet.
export function Phil7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Phil7Scene} band={[214, 514]} />;
}
