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
import SetArt, { type SetPart } from './SetArt';
import { oPoly } from './setShapes';
import { BEATS } from './growth6Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, mixKeepLegs, moveTr, pose, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE, lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, stageLin, bump } from './pace';
import {
  NATURAL, gr6Pedestal, gr6Desk, gr6KeyBase, gr6KeyLever, gr6Token, gr6Coin, gr6Barometer,
  gr6Calendar, gr6CalDay, gr6Notes, gr6NotesInk, gr6Pencil, GR6_PENCIL_GRIP,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// personal-growth-foundations-6, "Why Cramming Fades" — THE LAMP ROOM AT THE TOP OF A
// LIGHTHOUSE: THE GREAT LENS, A DESK WITH A MORSE KEY, AND WINDOWS ONTO THE SEA.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates.
// The assistant (the bun) crammed the whole Morse code last night; the helper (the
// newsboy cap) has practised ten minutes a day; the keeper (the top hat) needs a ship's
// signal read in a storm, and shows why only one of them can.
//
//   b0   a calm evening, the sun going down at sea. The assistant holds up her sheet of
//        Morse notes, waves it twice, and sets a hand on her hip: "Ask me anything!"
//   b1   the helper presses the Morse key, a dot and a dash, and its little lamp lights.
//   b2   PLACE YOUR BET: the assistant, the helper or the brass A DRAW token.
//   b3   the storm rolls in: the sky goes black, rain streaks the glass, the barometer's
//        needle swings to STORMY, and out at sea a fishing boat's masthead lamp blinks.
//        The keeper peers out, points at it, then waves the two to the window.
//   b4   the assistant shades her eyes and squints at the light, looks down at her notes
//        — and the ink drains off the sheet — clutches her head, and the blank sheet
//        slips from her fingers and flutters to the floor.
//   b5   the helper reads the blinks with a raised finger, three hops along, then points
//        hard at the boat.
//   b6   the keeper steps to the lens and pushes its lower ring round: the frame bars
//        slide across, and the beam swings out through the glass to the boat, whose lamp
//        turns steady green. He points at the blank notes on the floor ("drains away"),
//        then out along the beam ("what stays").
//   b7   he winds the lamp's clockwork crank twice, at a growing gap: the light sinks,
//        flares when he winds, sinks more slowly, and flares brighter and further.
//   b8   PICK THE CALENDAR: three calendars unroll on the wall — NIGHT BEFORE, GAPS GROW
//        and DAY ONE, each with its plan marked on it.
//   b9   the assistant takes the pencil off the desk, walks to the GAPS GROW calendar,
//        reaches up and circles day one, and turns back: "I promise."
//   b10  the quotation; the rain easing, the boat's green light steady.
//
// COMPOSITION, in stage units. The band is [206, 514], 308 tall; the figure is 78 tall
// in it. The lantern's red iron roof runs 200–250 over a ring beam at 250–257. The
// LANDWARD side of the lantern is solid (x 0–146): cream iron panels with a lifebuoy at
// (44, 324) and a banjo barometer at (104, 290–352); the calendars hang there at Q2,
// their hooks at y 394 (centres x 24, 72, 120). The glazing runs x 146–400, y 257–452,
// with mullions at x 211, 273 and 335 and a transom at 318; the sky to the horizon at
// y 394, the sea below it to the cream parapet at 442 (green skirting from 486). The sun sets, and the boat later
// rides, at x 242 — in the pane between two mullions and above the heads. The desk
// stands under the glazing at x 164–260, its top at 464: the pencil at x 176, the A DRAW
// token at 206, the Morse key at 224–256. The lens (76 × 120, bullseye at 318, 391)
// stands on its green pedestal at x 318, y 330–500. The assistant stands at x 158, the
// helper at 266, the keeper at 372, then 352 from b6, by the lens's foot and its crank.
//
// ALIVE BUT NOT A PERSON: the sun's glitter, the rain, the whitecaps, the boat rolling,
// its SOS lamp (the real pattern: three short, three long, three short) and the lens's
// glow, all on the monotonic clock (L1). The storm, the beam and every reaction are
// carried (group L), so a tap anywhere never moves anything in one frame.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('personal-growth');
const TR = 0.85;
/** 78 units of figure in a 308-unit band. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, personal-growth-foundations-6).
 */
const LINES = [4.63, 4.14, 0, 4.18, 3.26, 5.09, 6.61, 5.91, 0, 3.56, 0, 0];

// The held poses (moves.ts act + 99): talking, nodding along, waiting.
const TALK = 167;
const NOD = 263;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_NOTES = is('notes');
const A_DAILY = is('daily');
const A_STORM = is('storm');
const A_FORGOT = is('forgot');
const A_SOS = is('sos');
const A_FADE = is('fade');
const A_GAPS = is('gaps');
const A_TOM = is('tomorrow');
const STORM = BEATS.map((b) => b.storm ?? 0);
const Q1 = BEATS.map((b) => (b.bet ? 1 : 0));
const Q2 = BEATS.map((b) => (b.calendar ? 1 : 0));
const Q1_AT = Q1.indexOf(1);
const Q2_AT = Q2.indexOf(1);
const FORGOT_AT = A_FORGOT.indexOf(1);
const FADE_AT = A_FADE.indexOf(1);
const GAPS_AT = A_GAPS.indexOf(1);
const TOM_AT = A_TOM.indexOf(1);
const REST_AT = ACT.indexOf('rest');

// ── the room ─────────────────────────────────────────────────────────────────
const WALL_X = 146;
const WIN_TOP = 257;
const HORIZON = 394;
const WIN_BOT = 438;
const PARAPET = 442;
/** The green skirting along the foot of every wall. */
const SKIRT = 486;
const MULLIONS = [211, 273, 335];
/** The boat (and the setting sun before it) ride in the pane between two mullions. */
const BOAT_X = 242;
const SIGNAL = { x: BOAT_X - 10, y: HORIZON - 25 };
/** The lens: its bullseye; the lower ring he pushes; the crank's hub. */
const LENS_X = 318;
const EYE = { x: LENS_X, y: 391 };
const RING = { x: 340, y: 444 };
const HUB = { x: 340, y: 468 };
const CRANK_R = 6;
/** The desk's things. */
const KEY_PIVOT = { x: 238, y: 455 };
const KNOB = { x: 250.5, y: 450.4 };
const BULB = { x: 227, y: 452 };
const TOKEN = { x: 206, y: 464 };
const PENCIL_REST = { x: 180, y: 462.2 };
/** Where each figure stands. */
const B_X = 158;
const C_X = 266;
const T_X = 372;
const T_LENS = 352;
const B_CAL = 78;
/** The calendars: centre x, and the top of the sheet (its hook). */
const CAL_XS = [24, 72, 120];
const CAL_TOP = 394;
const CAL_W = 44;
const CAL_H = 64;
/** The day she circles on the GAPS GROW calendar: day one. */
const DAY_ONE = gr6CalDay(1);
const CIRCLE_AT = { x: CAL_XS[1] - CAL_W / 2 + DAY_ONE.x, y: CAL_TOP + DAY_ONE.y };
/** Where her notes are held when they slip (pelvis-local), and where they come to rest. */
const NOTES_HOLD = { x: 15, y: -30 };
const NOTES_FLOOR = { x: 180, y: 499 };

// ── who goes where ───────────────────────────────────────────────────────────
type Track = readonly (readonly number[])[];
/** [share of the line, x]: the assistant walks to the calendars on b9; the keeper to the lens on b6. */
const B_LEGS: Track[] = BEATS.map((_, n) => (n === TOM_AT ? [[0.22, B_CAL]] : [[0, n > TOM_AT ? B_CAL : B_X]]));
const T_LEGS: Track[] = BEATS.map((_, n) => (n === FADE_AT ? [[0.02, T_LENS]] : [[0, n > FADE_AT ? T_LENS : T_X]]));
/** [share of the line, facing]. */
const B_TURN: Track[] = BEATS.map((_, n) => (n === TOM_AT ? [[0, 1], [0.11, -1], [0.9, 1]] : [[0, 1]]));
const C_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1]], [[0, -1], [0.06, 1]], [[0, 1], [0.1, -1]], [[0, -1]],
  [[0, -1], [0.08, 1]], [[0, 1]], [[0, 1]], [[0, 1], [0.1, -1]], [[0, -1]], [[0, -1]],
];
const T_TURN: Track[] = BEATS.map(() => [[0, -1]]);
/** What each is doing with the body: talking while he speaks, nodding along while he does not. */
const B_P = [TALK, NOD, WAIT, NOD, TALK, NOD, NOD, NOD, WAIT, TALK, NOD, NOD];
const C_P = [NOD, TALK, WAIT, NOD, NOD, TALK, NOD, NOD, WAIT, NOD, NOD, NOD];
const T_P = [NOD, NOD, WAIT, TALK, NOD, NOD, TALK, TALK, WAIT, NOD, NOD, NOD];

// ── things drawn about the point they are held by ────────────────────────────
const PEN_W = 18;
const PEN_H = 3.6;
const PEN_ART = gr6Pencil(-(GR6_PENCIL_GRIP.x / GR6_PENCIL_GRIP.w - 0.5) * PEN_W, 0, PEN_W, PEN_H);
const NOTES_W = 14;
const NOTES_H = 18.6;
/** The sheet is held by the middle of its bottom edge, so it stands up from the hand. */
const NOTES_ART = gr6Notes(0, -NOTES_H / 2, NOTES_W, NOTES_H);
const INK_ART = gr6NotesInk(0, -NOTES_H / 2, NOTES_W, NOTES_H);
const COIN_ART = gr6Coin(0, 0, 12, 12);
/** The A DRAW token stands on the desk; drawn about its foot so it can topple. */
const TOKEN_ART = gr6Token(0, -8.5, 14, 17);

// ── the still set ────────────────────────────────────────────────────────────
const PEDESTAL_ART = gr6Pedestal(LENS_X, 475, 46, 50);
const DESK_ART = gr6Desk(212, 482, 96, 36);
const KEY_BASE_ART = gr6KeyBase(240, 460, 32, 8);
/** The key's lever, drawn about its pivot so it can rock. */
const LEVER_ART = gr6KeyLever(240 - KEY_PIVOT.x, 453 - KEY_PIVOT.y, 32, 10);
const BARO_ART = gr6Barometer(104, 321, 22, 62);
const BARO_DIAL = { x: 104, y: 335 };
const CAL_ART = gr6Calendar(0, CAL_H / 2, CAL_W, CAL_H);
/** The lantern roof's ribs, converging on the vent far above. */
const RIBS: SetPart[] = Array.from({ length: 6 }, (_, k) => {
  const xa = -80 + k * 100;
  return { ...oPoly('dark', [200, 120, xa + 30, 252, xa, 252]), nat: 'gr6Ceiling' } as unknown as SetPart;
});
/** The lamp's beam, from the bullseye out through the glass toward the boat. */
const BEAM: SetPart[] = [
  { ...oPoly('dark', [EYE.x, EYE.y - 4, EYE.x, EYE.y + 4, WALL_X, EYE.y + 22, WALL_X, EYE.y - 24]), nat: 'gr6Signal' } as unknown as SetPart,
];
/** Rain: one tile of streaks, drawn twice and run down the glass. */
const RAIN = Array.from({ length: 22 }, (_, k) => ({ x: (k * 47 + 7) % 254, y: (k * 71 + 11) % 196 }));
/** Whitecaps: two rows, each repeating every 64 units, so a row slides without a seam. */
const CAPS = [0, 1, 2, 3, 4, 5];
/** The calm sea's glitter under the sun. */
const GLITTER = [{ y: 398, w: 18 }, { y: 404, w: 13 }, { y: 411, w: 22 }, { y: 419, w: 15 }, { y: 429, w: 24 }];
/** GAPS GROW: a little, with growing gaps — days 1, 2, 4, 8, 15 and 29. */
const GAP_DAYS = [1, 2, 4, 8, 15, 29];
/** The circle she draws, as ten short strokes round the day. */
const CIRCLE = Array.from({ length: 10 }, (_, k) => k);

// ── how a figure moves ───────────────────────────────────────────────────────
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
/** A hand held in the figure's own frame (pelvis-local, +x forward), so it rides with him (AR6, AR7.2). */
function holdAt(s: Stance, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const cur = which > 0 ? s.fistR : s.fistL;
  const m = { x: lerp(cur.x, lx, w), y: lerp(cur.y, ly, w) };
  return which > 0 ? { ...s, fistR: m } : { ...s, fistL: m };
}
/** Where a figure stands at time `b`, leg by leg, from WHERE HE IS ON SCREEN (group L). */
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
/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/** The ship's signal: S O S on the clock — three short, three long, three short — then a rest. */
function sosOn(t: number) {
  'worklet';
  const u = t % 6.2;
  const on = (a: number, z: number) => {
    'worklet';
    return clamp01((u - a) / 0.05) * clamp01((z - u) / 0.05);
  };
  return on(0, 0.18) + on(0.36, 0.54) + on(0.72, 0.9)
    + on(1.36, 1.9) + on(2.08, 2.62) + on(2.8, 3.34)
    + on(3.8, 3.98) + on(4.16, 4.34) + on(4.52, 4.7);
}
/** The lamp through the GAPS beat: it sinks, he winds, it flares; it sinks more slowly, he winds, it flares brighter. */
function gapsGlow(u: number) {
  'worklet';
  if (u < 0.06) return 1;
  if (u < 0.3) return lerp(1, 0.22, ease01((u - 0.06) / 0.24));
  if (u < 0.42) return lerp(0.22, 1.15, ease01((u - 0.31) / 0.11));
  if (u < 0.72) return lerp(1.15, 0.6, ease01((u - 0.42) / 0.3));
  if (u < 0.84) return lerp(0.6, 1.3, ease01((u - 0.72) / 0.12));
  return 1.3;
}

const CAM = followMoves(BEATS.map(() => 200), BEATS.map(kindOf), seedOf('personal-growth'));
const BET_IDS = ['assistant', 'helper', 'draw'];
const CAL_IDS = ['night', 'gaps', 'dayone'];

export default function Growth6Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldC = useHeld();
  const heldT = useHeld();
  const cv = useCarry(33);
  const on = useLinger(i);
  // Which thing the reader tapped on each question, for the stage's own answer to it.
  const pkA = useSharedValue(-1);
  const pkB = useSharedValue(-1);
  useEffect(() => {
    if (i === Q1_AT) pkA.value = picked ? BET_IDS.indexOf(picked) : -1;
    if (i === Q2_AT) pkB.value = picked ? CAL_IDS.indexOf(picked) : -1;
  }, [i, picked, pkA, pkB]);

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
    const q = qv.value;
    const qa = pkA.value;
    const qb = pkB.value;

    // ── the weather: the storm rolls in over the first quarter of b3 ───────────
    const stormNow = A_STORM[n] ? st(0, 0.28) : STORM[n];
    const storm = carry(cv, 6, n, STORM[p], stormNow, tr);
    const calm = carry(cv, 7, n, 0, n >= REST_AT ? st(0, 0.7) : 0, tr);
    const needle = carry(cv, 13, n, 0, A_STORM[n] ? st(0.06, 0.3) : n > 3 ? 1 : 0, tr);

    // ── the lens: the beam swung round on b6, the lamp wound on b7 ────────────
    const beam = carry(cv, 9, n, 0, A_FADE[n] ? st(0.14, 0.32) : n > FADE_AT ? 1 : 0, tr);
    const turn = carry(cv, 10, n, 0, A_FADE[n] ? st(0.12, 0.32) : n > FADE_AT ? 1 : 0, tr);
    const glowNow = A_GAPS[n] ? gapsGlow(b / L) : n > GAPS_AT ? 1.3 : 0.45 + 0.55 * storm;
    const glow = carry(cv, 11, n, 0.45, glowNow, tr);
    const answered = carry(cv, 12, n, 0, A_FADE[n] ? st(0.34, 0.44) : n > FADE_AT ? 1 : 0, tr);
    const crank = carry(cv, 29, n, 0, A_GAPS[n] ? st(0.31, 0.41) + st(0.71, 0.83) : n > GAPS_AT ? 2 : 0, tr);

    // ── the calendars, unrolled on the wall for the second question ────────────
    const cal = carry(cv, 8, n, 0, n >= Q2_AT ? 1 : 0, tr);

    // ── the stage's answer to PLACE YOUR BET (b2) ────────────────────────────
    // the helper holds out a palm and the brass bet drops into it and shines · the
    // assistant holds out hers, and it bounces off her palm and rolls away · the A DRAW
    // token spins on its edge and topples flat
    const onQ1 = n === Q1_AT && qa >= 0;
    const after1 = n > Q1_AT;
    const palmB = carry(cv, 25, n, 0, onQ1 && qa === 0 ? ease01(clamp01(q / 0.15)) * (1 - 0.6 * ease01(clamp01((q - 0.6) / 0.35))) : 0, tr);
    const palmC = carry(cv, 26, n, 0, onQ1 && qa === 1 ? ease01(clamp01(q / 0.15)) : 0, tr);
    const fallNow = onQ1 && qa !== 2 ? clamp01((q - 0.12) / 0.38) : 0;
    const fall = carry(cv, 20, n, 0, after1 ? carrySource(cv, 20, n, 0) : fallNow, tr);
    const offNow = onQ1 && qa === 0 ? clamp01((q - 0.5) / 0.5) : 0;
    const off = carry(cv, 21, n, 0, after1 ? carrySource(cv, 21, n, 0) : offNow, tr);
    const coinVis = carry(cv, 27, n, 0, onQ1 && qa !== 2 ? clamp01(q / 0.1) : 0, tr);
    const glint = carry(cv, 22, n, 0, onQ1 && qa === 1 ? Math.sin(Math.PI * clamp01((q - 0.5) / 0.5)) : 0, tr);
    const spinNow = onQ1 && qa === 2 ? clamp01(q / 0.6) : 0;
    const spin = carry(cv, 23, n, 0, after1 ? carrySource(cv, 23, n, 0) : spinNow, tr);
    const topNow = onQ1 && qa === 2 ? ease01(clamp01((q - 0.55) / 0.4)) : 0;
    const topple = carry(cv, 24, n, 0, after1 ? carrySource(cv, 24, n, 0) : topNow, tr);

    // ── the stage's answer to PICK THE CALENDAR (b8), left as it was after ────
    // GAPS GROW: its rings stamp in again, one after another · NIGHT BEFORE: its block
    // of ink drains down off the page, and the page sags on its hook · DAY ONE: the page
    // swings on its hook and its one ring fades
    const onQ2 = n === Q2_AT && qb >= 0;
    const after2 = n > Q2_AT;
    const pop = carry(cv, 28, n, 0, after2 ? carrySource(cv, 28, n, 0) : onQ2 && qb === 1 ? clamp01(q / 0.9) : 0, tr);
    const drain = carry(cv, 30, n, 0, after2 ? carrySource(cv, 30, n, 0) : onQ2 && qb === 0 ? ease01(clamp01((q - 0.1) / 0.75)) : 0, tr);
    const swing = carry(cv, 31, n, 0, after2 ? carrySource(cv, 31, n, 0) : onQ2 && qb === 2 ? clamp01(q) : 0, tr);
    const warm = carry(cv, 32, n, 0, onQ2 && qb === 1 ? Math.sin(Math.PI * clamp01(q / 0.95)) : 0, tr);

    // ── the assistant ─────────────────────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 0, n, B_X), B_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), B_TURN[n], b, L), 1);
    const liveB = hLive(B_P[n], t, b, 0);
    let sb = wb.walking ? travelStance(wb.x0, wb.x1, hHold(B_P[n], t, 0), hHold(B_P[n], t, 0), liveB, wb.u, WALK, 0) : liveB;
    // her notes: held in front at the chest until they slip from her fingers on b4
    const heldNow = n < FORGOT_AT ? 1 : n === FORGOT_AT ? 1 - st(0.78, 0.8) : 0;
    const notesHeld = carry(cv, 5, n, 1, heldNow, tr);
    let nx = 14;
    let ny = -16;
    let notesRot = 0;
    if (A_NOTES[n]) {
      // held up to show, waved twice, held up, and down again
      const up = st(0.04, 0.16) * (1 - st(0.62, 0.72));
      const wave = bp(0.26, 0.33, 0.4) - bp(0.4, 0.47, 0.54);
      nx = lerp(14, 17 + 3 * wave, up);
      ny = lerp(-16, -34, up);
      notesRot = 12 * wave * up;
    }
    if (A_FORGOT[n]) {
      // lifted to read, and held there until it slips
      const read = st(0.28, 0.4);
      nx = lerp(14, NOTES_HOLD.x, read);
      ny = lerp(-16, NOTES_HOLD.y, read);
    }
    sb = holdAt(sb, 1, nx, ny, notesHeld);
    // b0 "Ask me anything!": a hand on her hip
    sb = holdAt(sb, -1, 1, 3, A_NOTES[n] ? st(0.62, 0.72) : 0);
    // b4: shade the eyes and squint at the light; look down at the notes; clutch her head
    let lean = 0;
    let look = 0;
    if (A_FORGOT[n]) {
      const shade = st(0.03, 0.12) * (1 - st(0.26, 0.34));
      lean = shade;
      look = 0.22 * shade - 0.3 * st(0.3, 0.4) * (1 - st(0.62, 0.72));
      sb = holdAt(sb, -1, 15, -50, shade);
      sb = holdAt(sb, -1, 9, -54, st(0.62, 0.72));
      sb = holdAt(sb, 1, 13, -51, st(0.82, 0.92));
    }
    // b5: her hands come down off her head IN FRONT of her before they hang at her side (AR4)
    if (n === FORGOT_AT + 1) sb = holdAt(holdAt(sb, -1, 5, -2, 1 - st(0.5, 0.9)), 1, 9, -4, 1 - st(0.5, 0.9));
    sb = { ...sb, tilt: sb.tilt - 0.1 * lean, neck: sb.neck + look };
    // b2: her palm held out for the bet
    sb = holdAt(sb, -1, 17, -27, palmB);
    // b9: the pencil — taken off the desk, carried, raised to circle day one, held
    const pen = carry(cv, 16, n, 0, A_TOM[n] ? st(0.05, 0.09) : n > TOM_AT ? 1 : 0, tr);
    let aimW = 0;
    let circ = 0;
    if (A_TOM[n]) {
      const take = st(0.0, 0.05) * (1 - st(0.08, 0.12));
      sb = hand(sb, xB, dB, 1, PENCIL_REST.x, PENCIL_REST.y, take);
      aimW = st(0.6, 0.66) * (1 - st(0.86, 0.9));
      circ = stageLin(b, L, 0.66, 0.84);
    }
    sb = holdAt(sb, 1, 13, -13, pen * (1 - aimW));
    const ang = circ * Math.PI * 2 - Math.PI / 2;
    const tipX = CIRCLE_AT.x + 4.2 * Math.cos(ang);
    const tipY = CIRCLE_AT.y + 4.2 * Math.sin(ang);
    if (aimW > 0) sb = hand(sb, xB, dB, 1, tipX, tipY, aimW);
    const circle = carry(cv, 17, n, 0, A_TOM[n] ? circ : n > TOM_AT ? 1 : 0, tr);
    const prevB = carryFrom(heldB, n, hHold(B_P[p], t, 0));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, trAt(0)) : mixStance(prevB, sb, trAt(0)));

    // ── the helper ────────────────────────────────────────────────────────────
    const dC = carry(cv, 2, n, 0, faceOf(carrySource(cv, 2, n, -1), C_TURN[n], b, L), 1);
    let sc = hLive(C_P[n], t, b, 1);
    // b1: the Morse key — a dot, then a dash
    let press = 0;
    if (A_DAILY[n]) {
      const at = st(0.06, 0.14) * (1 - st(0.8, 0.88));
      press = bp(0.18, 0.21, 0.27) + st(0.42, 0.46) * (1 - st(0.62, 0.66));
      sc = hand(sc, C_X, dC, 1, KNOB.x, KNOB.y - 2 + 2.4 * press, at);
    }
    // b2: his palm held out for the bet
    sc = holdAt(sc, -1, 17, -27, palmC);
    // b5: reads the blinks with a raised finger, in three hops, then points hard at the boat
    if (A_SOS[n]) {
      const raise = st(0.04, 0.14) * (1 - st(0.9, 0.98));
      const hop = st(0.14, 0.2) + st(0.24, 0.3) + st(0.34, 0.4);
      const thrust = st(0.56, 0.64);
      const tx = SIGNAL.x - 14 + 5 * hop - 6 * thrust;
      sc = hand(sc, C_X, dC, 1, tx, SIGNAL.y + 8 - 6 * thrust, raise);
      sc = { ...sc, neck: sc.neck + 0.18 * raise };
    }
    // b3: he looks up at the light as it starts to blink
    sc = { ...sc, neck: sc.neck + (A_STORM[n] ? st(0.4, 0.6) * 0.12 : 0) };
    const prevC = carryFrom(heldC, n, hHold(C_P[p], t, 1));
    const figC = keepHeld(heldC, mixStance(prevC, sc, trAt(1)));

    // ── the keeper ────────────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 3, n, T_X), T_LEGS[n], b, L);
    const xT = carry(cv, 3, n, wt.x, wt.x, 1);
    const dT = carry(cv, 4, n, 0, faceOf(carrySource(cv, 4, n, -1), T_TURN[n], b, L), 1);
    const liveT = hLive(T_P[n], t, b, 2);
    let stt = wt.walking ? travelStance(wt.x0, wt.x1, hHold(T_P[n], t, 2), hHold(T_P[n], t, 2), liveT, wt.u, WALK, 2) : liveT;
    // b3: he peers out, points at the boat's light, then waves the two to the window
    if (A_STORM[n]) {
      const peer = st(0.0, 0.1) * (1 - st(0.42, 0.5));
      stt = { ...stt, neck: stt.neck + 0.16 * peer, tilt: stt.tilt - 0.06 * peer };
      stt = hand(stt, xT, dT, 1, SIGNAL.x, SIGNAL.y, st(0.06, 0.16) * (1 - st(0.4, 0.48)));
      const wave = st(0.5, 0.58) * (1 - st(0.82, 0.9));
      stt = holdAt(stt, -1, 17, -20 - 4 * bp(0.58, 0.64, 0.72), wave);
    }
    // b6: a hand on the lens's lower ring, pushed round; then at the notes on the floor; then along the beam
    if (A_FADE[n]) {
      const grip = st(0.09, 0.13) * (1 - st(0.32, 0.36));
      stt = hand(stt, xT, dT, 1, RING.x - 16 * st(0.12, 0.32), RING.y, grip);
      stt = hand(stt, xT, dT, 1, NOTES_FLOOR.x, NOTES_FLOOR.y, st(0.38, 0.44) * (1 - st(0.54, 0.6)));
      stt = hand(stt, xT, dT, 1, BOAT_X, SIGNAL.y, st(0.66, 0.72) * (1 - st(0.9, 0.96)));
    }
    // b7: the crank, wound once round, twice, the second after a longer gap
    const crankA = crank * Math.PI * 2 + Math.PI / 2;
    const handle = { x: HUB.x + CRANK_R * Math.cos(crankA), y: HUB.y + CRANK_R * Math.sin(crankA) };
    if (A_GAPS[n]) {
      const w1 = st(0.26, 0.31) * (1 - st(0.42, 0.46));
      const w2 = st(0.66, 0.71) * (1 - st(0.84, 0.88));
      stt = hand(stt, xT, dT, 1, handle.x, handle.y, Math.max(w1, w2));
    }
    const prevT = carryFrom(heldT, n, hHold(T_P[p], t, 2));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, trAt(2)) : mixStance(prevT, stt, trAt(2)));

    // ── the bodies, and what rides their hands ────────────────────────────────
    const bun = pose(figB, xB, GROUND, K, dB, 1);
    const cap = pose(figC, C_X, GROUND, K, dC, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const bR = wristOf(bun, 'wrR');
    const bL = wristOf(bun, 'wrL');
    const cL = wristOf(cap, 'wrL');

    // the notes: in her hand, then falling, fluttering, to the floor
    const fallF = carry(cv, 18, n, 0, A_FORGOT[n] ? stageLin(b, L, 0.79, 0.97) : n > FORGOT_AT ? 1 : 0, tr);
    const ink = carry(cv, 19, n, 1, n < FORGOT_AT ? 1 : A_FORGOT[n] ? 1 - st(0.32, 0.66) : 0, tr);
    const flut = Math.sin(fallF * Math.PI * 3) * (1 - fallF);
    const relX = xB + dB * K * NOTES_HOLD.x;
    const relY = GROUND - K * 34 + K * NOTES_HOLD.y;
    const fs = fallF * fallF * (3 - 2 * fallF);
    const sheetX = notesHeld > 0.5 ? bR.x : lerp(relX, NOTES_FLOOR.x, fallF) + 7 * flut;
    const sheetY = notesHeld > 0.5 ? bR.y : lerp(relY, NOTES_FLOOR.y, fs);
    const sheetRot = notesHeld > 0.5 ? notesRot * dB : 40 * flut;
    const flat = clamp01((fallF - 0.85) / 0.15);

    // the bet: dropped from above into the chosen palm; off hers, it bounces and rolls away
    const palm = qa === 0 ? bL : cL;
    const coinX = lerp(palm.x, palm.x + 26, off);
    const coinY = qa === 0 && off > 0
      ? lerp(palm.y - 3, 495.5, off * off) - 14 * Math.sin(Math.PI * Math.min(1, off * 1.6)) * (1 - off)
      : lerp(372, palm.y - 3, fall * fall);

    // the pencil: on the desk, then in her hand, pointed where she draws
    const aimRot = (Math.atan2(tipY - bR.y, tipX - bR.x) * 180) / Math.PI + 180;
    const penRest = dB < 0 ? 20 : 160;
    const penRot = lerp(0, lerp(penRest, aimRot, aimW), pen);

    return {
      bun, cap, th, t,
      storm, calm, needle, beam, turn, glow, answered, crankA, cal,
      notes: { x: sheetX, y: sheetY, rot: sheetRot, sy: 1 - 0.85 * flat },
      ink: ink * (1 - flat),
      press,
      coin: { x: coinX, y: coinY, rot: off * 540, o: coinVis },
      glint,
      token: { spin: spin * 3, topple },
      pen: { x: lerp(PENCIL_REST.x, bR.x, pen), y: lerp(PENCIL_REST.y, bR.y, pen), rot: penRot },
      circle,
      pop, drain, swing, warm,
      q1: carry(cv, 14, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 15, n, Q2[p], Q2[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bun);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      {/* the lantern roof and its ring beam */}
      <View style={styles.ceiling} pointerEvents="none" />
      <View style={styles.ribClip} pointerEvents="none">
        <SetArt parts={RIBS} tone={TONE} />
      </View>
      <View style={styles.ringBeam} pointerEvents="none" />
      <View style={styles.ringBrass} pointerEvents="none" />
      {/* through the glass: the evening, then the storm */}
      <View style={styles.glass} pointerEvents="none">
        <View style={[styles.band, { top: 0, height: 60, backgroundColor: N.gr6SkyTop.base }]} />
        <View style={[styles.band, { top: 60, height: 40, backgroundColor: N.gr6SkyMid.base }]} />
        <View style={[styles.band, { top: 100, height: 22, backgroundColor: N.gr6SkyMid.shade }]} />
        <View style={[styles.band, { top: 122, height: HORIZON - WIN_TOP - 122, backgroundColor: N.gr6SkyLow.base }]} />
        <View style={[styles.cloud, { left: 20, top: 112, width: 70 }]} />
        <View style={[styles.cloud, { left: 140, top: 104, width: 54 }]} />
        <View style={styles.sun} />
        <View style={[styles.band, { top: HORIZON - WIN_TOP, height: WIN_BOT - HORIZON, backgroundColor: N.gr6Sea.base }]} />
        <View style={[styles.band, { top: HORIZON - WIN_TOP, height: 4, backgroundColor: N.gr6Sea.shade }]} />
        {GLITTER.map((g, k) => <Glitter key={g.y} g={g} k={k} clock={clock} S={SCENE} />)}
        <Storm S={SCENE} clock={clock} />
      </View>
      {/* the glazing bars */}
      {MULLIONS.map((x) => <View key={x} style={[styles.mullion, { left: x - 2.5 }]} pointerEvents="none" />)}
      <View style={styles.mullionEdge} pointerEvents="none" />
      <View style={styles.transom} pointerEvents="none" />
      <View style={styles.winHead} pointerEvents="none" />
      {/* the landward wall: cream iron panels, a lifebuoy and the barometer */}
      <View style={styles.wall} pointerEvents="none" />
      <View style={[styles.seamV, { left: 48 }]} pointerEvents="none" />
      <View style={[styles.seamV, { left: 97 }]} pointerEvents="none" />
      <View style={styles.seamH} pointerEvents="none" />
      <View style={styles.cornerPost} pointerEvents="none" />
      <View style={styles.buoyRim} pointerEvents="none" />
      <View style={styles.buoy} pointerEvents="none" />
      <View style={styles.buoyHole} pointerEvents="none" />
      <ObjectArt parts={BARO_ART} tone={TONE} />
      <Needle S={SCENE} />
      {/* the parapet under the glass, the dado, the floor */}
      <View style={styles.parapet} pointerEvents="none" />
      <View style={styles.cill} pointerEvents="none" />
      {MULLIONS.map((x) => <View key={x} style={[styles.parapetSeam, { left: x - 0.6 }]} pointerEvents="none" />)}
      <View style={styles.dado} pointerEvents="none" />
      <View style={styles.dadoCap} pointerEvents="none" />
      <View style={styles.floor} pointerEvents="none" />
      {/* the desk and what is on it */}
      <ObjectArt parts={DESK_ART} tone={TONE} />
      <ObjectArt parts={KEY_BASE_ART} tone={TONE} />
      <Lever S={SCENE} />
      <KeyBulb S={SCENE} />
      <Token S={SCENE} />
      {/* night falls on the room; the lamp and the signal are lit */}
      <Night S={SCENE} />
      <SignalLamp S={SCENE} clock={clock} />
      <ObjectArt parts={PEDESTAL_ART} tone={TONE} />
      <Crank S={SCENE} />
      <Beam S={SCENE} />
      <LessonPicture name="growth6-lens" />
      <LensBars S={SCENE} />
      <LensGlow S={SCENE} clock={clock} />
      {/* the calendars, unrolled for the second question */}
      {CAL_XS.map((x, k) => <Calendar key={x} k={k} S={SCENE} />)}
      <Circle S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      <Notes S={SCENE} />
      <Pencil S={SCENE} />
      <Coin S={SCENE} />
      {on(Q1) ? <BetTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <CalendarTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

type SV = SharedValue<any>;

// ── through the glass ────────────────────────────────────────────────────────

/** The sun's glitter on a calm sea: each bar breathes on its own phase, and goes with the storm. */
function Glitter({ g, k, clock, S }: { g: { y: number; w: number }; k: number; clock: SharedValue<number>; S: SV }) {
  const st = useAnimatedStyle(() => ({
    opacity: (1 - S.value.storm) * (0.45 + 0.4 * Math.sin(clock.value * 1.6 + k * 1.9)),
  }));
  return <Animated.View style={[styles.glitter, { top: g.y - WIN_TOP, left: BOAT_X - WALL_X - g.w / 2, width: g.w }, st]} />;
}

/** The storm: a black sky and sea, whitecaps running, rain on the glass, and the boat rolling. */
function Storm({ S, clock }: { S: SV; clock: SharedValue<number> }) {
  const sky = useAnimatedStyle(() => ({ opacity: S.value.storm * (1 - 0.35 * S.value.calm) }));
  const caps1 = useAnimatedStyle(() => ({ transform: [{ translateX: -((clock.value * 9) % 64) }] }));
  const caps2 = useAnimatedStyle(() => ({ transform: [{ translateX: -((clock.value * 6 + 32) % 64) }] }));
  const rain = useAnimatedStyle(() => ({
    opacity: 0.8 * S.value.storm * (1 - 0.75 * S.value.calm),
    transform: [{ translateX: -((clock.value * 196) % 196) * 0.25 }, { translateY: (clock.value * 196) % 196 }],
  }));
  const flash = useAnimatedStyle(() => {
    const u = clock.value % 9;
    const f = (a: number, z: number) => {
      'worklet';
      return clamp01((u - a) / 0.03) * clamp01((z - u) / 0.07);
    };
    return { opacity: 0.5 * (1 - S.value.calm) * Math.min(1, f(0, 0.1) + 0.7 * f(0.2, 0.34)) };
  });
  const boat = useAnimatedStyle(() => {
    const t = clock.value;
    return {
      transform: [
        { translateX: BOAT_X - WALL_X + 3 * S.value.calm }, { translateY: HORIZON - WIN_TOP + 1.2 * Math.sin(t * 1.3) },
        { rotate: `${3.2 * Math.sin(t * 1.1)}deg` },
      ],
    };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, sky]}>
      <View style={[styles.band, { top: 0, height: 100, backgroundColor: N.gr6StormSky.base }]} />
      <View style={[styles.band, { top: 100, height: HORIZON - WIN_TOP - 100, backgroundColor: N.gr6StormLow.base }]} />
      <View style={[styles.band, { top: HORIZON - WIN_TOP, height: WIN_BOT - HORIZON, backgroundColor: N.gr6StormSea.base }]} />
      <View style={[styles.band, { top: HORIZON - WIN_TOP + 16, height: WIN_BOT - HORIZON - 16, backgroundColor: N.gr6StormSea.shade }]} />
      <Animated.View style={[styles.band, styles.flash, flash]} />
      <Animated.View style={[styles.rider, boat]}>
        <LessonPicture name="growth6-boat" />
      </Animated.View>
      <Animated.View style={[styles.capRow, { top: HORIZON - WIN_TOP + 8 }, caps1]}>
        {CAPS.map((k) => <View key={k} style={[styles.whitecap, { left: k * 64 + 8, width: 16 }]} />)}
      </Animated.View>
      <Animated.View style={[styles.capRow, { top: HORIZON - WIN_TOP + 24 }, caps2]}>
        {CAPS.map((k) => <View key={k} style={[styles.whitecap, { left: k * 64 + 30, width: 22 }]} />)}
      </Animated.View>
      <Animated.View style={[styles.rider, rain]}>
        {[0, -196].map((dy) => RAIN.map((r, k) => (
          <View key={`${dy}-${k}`} style={[styles.drop, { left: r.x + 40, top: r.y + dy }]} />
        )))}
      </Animated.View>
    </Animated.View>
  );
}

/** The boat's masthead lamp: S O S on the clock, then steady green once it has been answered. */
function SignalLamp({ S, clock }: { S: SV; clock: SharedValue<number> }) {
  const sos = useAnimatedStyle(() => {
    const t = clock.value;
    return {
      opacity: S.value.storm * (1 - S.value.answered) * sosOn(t),
      transform: [{ translateX: SIGNAL.x + 3 * S.value.calm + 1.0 * Math.sin(t * 1.1) }, { translateY: SIGNAL.y + 1.2 * Math.sin(t * 1.3) }],
    };
  });
  const green = useAnimatedStyle(() => {
    const t = clock.value;
    return {
      opacity: S.value.storm * S.value.answered,
      transform: [{ translateX: SIGNAL.x + 3 * S.value.calm + 1.0 * Math.sin(t * 1.1) }, { translateY: SIGNAL.y + 1.2 * Math.sin(t * 1.3) }],
    };
  });
  return (
    <>
      <Animated.View style={[styles.rider, sos]} pointerEvents="none">
        <View style={styles.signalHalo} />
        <View style={styles.signalCore} />
      </Animated.View>
      <Animated.View style={[styles.rider, green]} pointerEvents="none">
        <View style={[styles.signalHalo, styles.greenLight]} />
        <View style={[styles.signalCore, styles.greenLight]} />
      </Animated.View>
    </>
  );
}

/** Night in the room: the set darkens as the storm comes, and lightens a little as it passes. */
function Night({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.2 * S.value.storm * (1 - 0.4 * S.value.calm) }));
  return <Animated.View style={[styles.night, st]} pointerEvents="none" />;
}

/** The barometer's needle, from FAIR round to STORMY. */
function Needle({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.needle;
    const deg = lerp(52, -64, v) + 9 * Math.sin(v * Math.PI) * (1 - v);
    return { transform: [{ translateX: BARO_DIAL.x }, { translateY: BARO_DIAL.y }, { rotate: `${deg}deg` }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.needle} />
    </Animated.View>
  );
}

// ── the desk ─────────────────────────────────────────────────────────────────

function Lever({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: KEY_PIVOT.x }, { translateY: KEY_PIVOT.y }, { rotate: `${6 * S.value.press}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={LEVER_ART} tone={TONE} />
    </Animated.View>
  );
}
function KeyBulb({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.press }));
  return (
    <>
      <View style={styles.bulbOff} pointerEvents="none" />
      <Animated.View style={[styles.bulbOn, st]} pointerEvents="none" />
    </>
  );
}
/** The A DRAW token, on its stand: it spins on its edge and topples flat when it is chosen. */
function Token({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.token;
    const sx = Math.cos(v.spin * Math.PI * 2);
    const w = Math.abs(sx) < 0.12 ? (sx < 0 ? -0.12 : 0.12) : sx;
    return {
      transform: [
        { translateX: TOKEN.x }, { translateY: TOKEN.y }, { rotate: `${-84 * v.topple}deg` }, { scaleX: lerp(w, 1, v.topple) },
      ],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={TOKEN_ART} tone={TONE} />
    </Animated.View>
  );
}

// ── the lens ─────────────────────────────────────────────────────────────────

/** The beam, out through the glass to the boat, once he has swung the lens round. */
function Beam({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => {
    const g = S.value.glow;
    return {
      opacity: 0.24 * S.value.beam * Math.min(1.3, g),
      transform: [
        { translateX: EYE.x }, { scaleX: Math.max(0.001, S.value.beam * (0.7 + 0.3 * Math.min(1.3, g) / 1.3)) }, { translateX: -EYE.x },
      ],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <SetArt parts={BEAM} tone={TONE} />
    </Animated.View>
  );
}
/** The frame bars on the lens's drum, sliding round as the lens turns. */
const BARS = [0, 1, 2, 3, 4, 5];
function LensBars({ S }: { S: SV }) {
  return (
    <>
      {BARS.map((k) => <LensBar key={k} k={k} S={S} />)}
    </>
  );
}
function LensBar({ k, S }: { k: number; S: SV }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.turn * (Math.PI / 3) + (k * Math.PI) / 3 + Math.PI / 6;
    const c = Math.cos(a);
    return {
      opacity: c > 0 ? Math.min(1, c * 1.6) : 0,
      transform: [{ translateX: LENS_X + 35 * Math.sin(a) }],
    };
  });
  return <Animated.View style={[styles.lensBar, st]} pointerEvents="none" />;
}
/** The lamp behind the bullseye: its glow, and the halo it throws toward you until the lens is turned. */
function LensGlow({ S, clock }: { S: SV; clock: SharedValue<number> }) {
  const core = useAnimatedStyle(() => ({ opacity: Math.min(1, 0.35 + 0.5 * S.value.glow + 0.05 * Math.sin(clock.value * 3.1)) }));
  const halo = useAnimatedStyle(() => {
    const g = S.value.glow;
    return {
      opacity: Math.min(0.55, 0.32 * g * (1 - 0.4 * S.value.beam)),
      transform: [{ scale: 0.7 + 0.4 * Math.min(1.3, g) }],
    };
  });
  return (
    <>
      <Animated.View style={[styles.halo, halo]} pointerEvents="none" />
      <Animated.View style={[styles.core, core]} pointerEvents="none" />
    </>
  );
}
/** The clockwork's winding crank on the pedestal. */
function Crank({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: HUB.x }, { translateY: HUB.y }, { rotate: `${(S.value.crankA * 180) / Math.PI}deg` }],
  }));
  return (
    <>
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <View style={styles.crankArm} />
        <View style={styles.crankKnob} />
      </Animated.View>
      <View style={styles.crankHub} pointerEvents="none" />
    </>
  );
}

// ── the calendars ────────────────────────────────────────────────────────────

const CAL_LABELS = [['NIGHT', 'BEFORE'], ['GAPS', 'GROW'], ['DAY', 'ONE']];
function Calendar({ k, S }: { k: number; S: SV }) {
  const x = CAL_XS[k];
  const page = useAnimatedStyle(() => {
    const c = Math.max(0.02, S.value.cal);
    const sag = k === 0 ? 6 * S.value.drain : 0;
    const sw = k === 2 ? S.value.swing : 0;
    const swingDeg = k === 2 ? 15 * Math.sin(sw * Math.PI * 3) * (1 - sw) + 6 * ease01(sw) : 0;
    const lift = k === 1 ? -3 * S.value.warm : 0;
    return {
      opacity: S.value.cal > 0.02 ? 1 : 0,
      transform: [
        { translateX: x }, { translateY: CAL_TOP + lift }, { rotate: `${sag + swingDeg}deg` }, { scaleY: c },
      ],
    };
  });
  const glow = useAnimatedStyle(() => ({ opacity: 0.55 * S.value.warm }));
  return (
    <>
      {k === 1 ? <Animated.View style={[styles.calGlow, { left: x - CAL_W / 2 - 5 }, glow]} pointerEvents="none" /> : null}
      <Animated.View style={[styles.rider, page]} pointerEvents="none">
        <ObjectArt parts={CAL_ART} tone={TONE} />
        <View style={styles.calPlate}>
          <Text style={styles.calText}>{CAL_LABELS[k][0]}</Text>
          <Text style={styles.calText}>{CAL_LABELS[k][1]}</Text>
        </View>
        {k === 0 ? <NightMark S={S} /> : null}
        {k === 1 ? GAP_DAYS.map((d, j) => <GapRing key={d} d={d} j={j} S={S} />) : null}
        {k === 2 ? <DayOneRing S={S} /> : null}
      </Animated.View>
    </>
  );
}
/** NIGHT BEFORE: one block of ink on the last night — which drains down off the page when chosen. */
const NIGHT_DAY = gr6CalDay(30);
function NightMark({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.drain;
    return { opacity: 1 - v, transform: [{ translateY: 9 * v * v }, { scaleY: 1 + 0.8 * v }] };
  });
  return <Animated.View style={[styles.nightBlock, { left: NIGHT_DAY.x - CAL_W / 2 - 3.6, top: NIGHT_DAY.y - 3.4 }, st]} />;
}
/** GAPS GROW: a ring on each practice day; chosen, each stamps in again in turn. */
function GapRing({ d, j, S }: { d: number; j: number; S: SV }) {
  const c = gr6CalDay(d);
  const st = useAnimatedStyle(() => {
    const u = clamp01((S.value.pop - j * 0.12) / 0.3);
    return { transform: [{ scale: 1 + 0.6 * Math.sin(u * Math.PI) }] };
  });
  return <Animated.View style={[styles.ring, { left: c.x - CAL_W / 2 - 3, top: c.y - 3 }, st]} />;
}
/** DAY ONE: a single ring, which fades when chosen. */
function DayOneRing({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => ({ opacity: 1 - 0.75 * S.value.swing }));
  return <Animated.View style={[styles.ring, { left: DAY_ONE.x - CAL_W / 2 - 3, top: DAY_ONE.y - 3 }, st]} />;
}
/** The circle she draws round day one on GAPS GROW: a stroke at a time, as the pencil goes round. */
function Circle({ S }: { S: SV }) {
  return (
    <>
      {CIRCLE.map((k) => <CircleStroke key={k} k={k} S={S} />)}
    </>
  );
}
function CircleStroke({ k, S }: { k: number; S: SV }) {
  const a = ((k + 0.5) / CIRCLE.length) * Math.PI * 2 - Math.PI / 2;
  const st = useAnimatedStyle(() => ({ opacity: clamp01((S.value.circle * CIRCLE.length - k) * 2) }));
  return (
    <Animated.View
      style={[
        styles.stroke,
        {
          left: CIRCLE_AT.x + 4.8 * Math.cos(a) - 1.8, top: CIRCLE_AT.y + 4.8 * Math.sin(a) - 0.7,
          transform: [{ rotate: `${(a * 180) / Math.PI + 90}deg` }],
        },
        st,
      ]}
      pointerEvents="none"
    />
  );
}

// ── riders ───────────────────────────────────────────────────────────────────

function Notes({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.notes;
    return { transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }, { scaleY: v.sy }] };
  });
  const ink = useAnimatedStyle(() => ({ opacity: S.value.ink }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={NOTES_ART} tone={TONE} />
      <Animated.View style={[styles.rider, ink]}>
        <ObjectArt parts={INK_ART} tone={TONE} />
      </Animated.View>
    </Animated.View>
  );
}
function Pencil({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.pen;
    return { transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={PEN_ART} tone={TONE} />
    </Animated.View>
  );
}
function Coin({ S }: { S: SV }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.coin;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }] };
  });
  const shine = useAnimatedStyle(() => ({ opacity: 0.8 * S.value.glint, transform: [{ scale: 0.5 + S.value.glint }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.rider, shine]}>
        <View style={styles.shine} />
      </Animated.View>
      <ObjectArt parts={COIN_ART} tone={TONE} />
    </Animated.View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both questions are tapped ON THE STAGE (AP6): each choice is a real thing in the
 * scene, its name on a plate inside its target (AN1). No two live targets touch (AN4).
 */
type Q = {
  id: string; lines: string[]; pw: number; left: number; top: number; w: number; h: number; correct: boolean;
  plateTop: number;
};
/** PLACE YOUR BET. The helper, who practised a little every day, is the one. */
const BET_Q: Q[] = [
  { id: 'assistant', lines: ['ALL IN', 'ONE GO'], pw: 44, left: 134, top: 398, w: 46, h: 102, correct: false, plateTop: 2 },
  { id: 'draw', lines: ['A DRAW'], pw: 44, left: 184, top: 426, w: 44, h: 46, correct: false, plateTop: 3 },
  { id: 'helper', lines: ['A BIT', 'DAILY'], pw: 44, left: 243, top: 398, w: 46, h: 102, correct: true, plateTop: 2 },
];
/** PICK THE CALENDAR. A little, with growing gaps, is the one. */
const CAL_Q: Q[] = CAL_IDS.map((id, k) => ({
  id, lines: [], pw: 0, left: CAL_XS[k] - 23, top: CAL_TOP - 4, w: 46, h: CAL_H + 6, correct: id === 'gaps', plateTop: 0,
}));
type TP = { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SV };
function BetTargets(p: TP) {
  return <StageTargets {...p} qs={BET_Q} k="q1" />;
}
function CalendarTargets(p: TP) {
  return <StageTargets {...p} qs={CAL_Q} k="q2" />;
}
function StageTargets({ picked, onPick, live, S, qs, k }: TP & { qs: Q[]; k: 'q1' | 'q2' }) {
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
          <View style={styles.place}>
            {q.lines.length ? (
              <View style={[styles.namePlate, { top: q.plateTop, left: (q.w - q.pw) / 2, width: q.pw }]}>
                {q.lines.map((l) => <Text key={l} style={styles.nameText}>{l}</Text>)}
              </View>
            ) : null}
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const N = NATURAL;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  ceiling: { position: 'absolute', left: 0, top: 200, width: STAGE_W, height: 52, backgroundColor: N.gr6Ceiling.base },
  ribClip: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: 250, overflow: 'hidden' },
  ringBeam: { position: 'absolute', left: 0, top: 250, width: STAGE_W, height: 7, backgroundColor: N.gr6Frame.base },
  ringBrass: { position: 'absolute', left: 0, top: 251.5, width: STAGE_W, height: 1.4, backgroundColor: N.brass.base },
  glass: {
    position: 'absolute', left: WALL_X, top: WIN_TOP, width: STAGE_W - WALL_X, height: WIN_BOT - WIN_TOP, overflow: 'hidden',
  },
  band: { position: 'absolute', left: 0, right: 0 },
  cloud: { position: 'absolute', height: 4, borderRadius: 2, backgroundColor: N.gr6SkyMid.base },
  sun: {
    position: 'absolute', left: BOAT_X - WALL_X - 11, top: HORIZON - WIN_TOP - 10, width: 22, height: 22, borderRadius: 11,
    backgroundColor: N.gr6Sun.base,
  },
  glitter: { position: 'absolute', height: 1.8, borderRadius: 0.9, backgroundColor: N.gr6Sun.base },
  flash: { top: 0, height: HORIZON - WIN_TOP, backgroundColor: N.gr6Foam.base },
  capRow: { position: 'absolute', left: 0, width: 400, height: 4 },
  whitecap: { position: 'absolute', top: 0, height: 2.2, borderRadius: 1.1, backgroundColor: N.gr6Foam.base, opacity: 0.8 },
  drop: {
    position: 'absolute', width: 1.3, height: 16, borderRadius: 0.5, backgroundColor: N.gr6Foam.base,
    transform: [{ rotate: '14deg' }],
  },
  mullion: { position: 'absolute', top: WIN_TOP, width: 5, height: PARAPET - WIN_TOP, backgroundColor: N.gr6Frame.base },
  mullionEdge: { position: 'absolute', left: 396, top: WIN_TOP, width: 4, height: PARAPET - WIN_TOP, backgroundColor: N.gr6Frame.base },
  transom: { position: 'absolute', left: WALL_X, top: 318, width: STAGE_W - WALL_X, height: 4, backgroundColor: N.gr6Frame.base },
  winHead: { position: 'absolute', left: WALL_X, top: WIN_TOP - 1, width: STAGE_W - WALL_X, height: 4, backgroundColor: N.gr6Frame.base },
  wall: { position: 'absolute', left: 0, top: 257, width: WALL_X, height: SKIRT - 257, backgroundColor: N.gr6Wall.base },
  seamV: { position: 'absolute', top: 257, width: 1.4, height: SKIRT - 257, backgroundColor: N.gr6Wall.shade },
  seamH: { position: 'absolute', left: 0, top: 372, width: WALL_X, height: 1.4, backgroundColor: N.gr6Wall.shade },
  cornerPost: { position: 'absolute', left: WALL_X - 4, top: 257, width: 7, height: PARAPET - 257, backgroundColor: N.gr6Frame.base },
  buoyRim: {
    position: 'absolute', left: 44 - 18, top: 324 - 18, width: 36, height: 36, borderRadius: 18, backgroundColor: INK,
  },
  buoy: {
    position: 'absolute', left: 44 - 17, top: 324 - 17, width: 34, height: 34, borderRadius: 17, borderWidth: 8,
    borderTopColor: N.gr6ShipRed.base, borderBottomColor: N.gr6ShipRed.base,
    borderLeftColor: N.gr6ShipWhite.base, borderRightColor: N.gr6ShipWhite.base,
    transform: [{ rotate: '45deg' }],
  },
  buoyHole: {
    position: 'absolute', left: 44 - 9.5, top: 324 - 9.5, width: 19, height: 19, borderRadius: 9.5,
    backgroundColor: N.gr6Wall.shade, borderWidth: 1, borderColor: INK,
  },
  needle: { position: 'absolute', left: -0.6, top: -6.4, width: 1.2, height: 7, borderRadius: 0.6, backgroundColor: INK },
  parapet: { position: 'absolute', left: WALL_X, top: PARAPET, width: STAGE_W - WALL_X, height: SKIRT - PARAPET, backgroundColor: N.gr6Wall.base },
  cill: { position: 'absolute', left: WALL_X, top: WIN_BOT, width: STAGE_W - WALL_X, height: 5, backgroundColor: N.gr6Frame.base },
  parapetSeam: { position: 'absolute', top: PARAPET + 2, width: 1.4, height: SKIRT - PARAPET - 2, backgroundColor: N.gr6Wall.shade },
  dado: { position: 'absolute', left: 0, top: SKIRT, width: STAGE_W, height: GROUND - SKIRT, backgroundColor: N.gr6Dado.base },
  dadoCap: { position: 'absolute', left: 0, top: SKIRT - 2, width: STAGE_W, height: 2.4, backgroundColor: N.gr6Frame.base },
  floor: floorStyle(TONE, GROUND),
  night: { position: 'absolute', left: 0, top: 200, width: STAGE_W, height: GROUND - 200, backgroundColor: INK },
  bulbOff: {
    position: 'absolute', left: BULB.x - 2.4, top: BULB.y - 2.4, width: 4.8, height: 4.8, borderRadius: 2.4,
    backgroundColor: N.gr6GlassHi.shade, borderWidth: 0.6, borderColor: INK,
  },
  bulbOn: {
    position: 'absolute', left: BULB.x - 4, top: BULB.y - 4, width: 8, height: 8, borderRadius: 4, backgroundColor: N.gr6Signal.shade,
  },
  lensBar: {
    position: 'absolute', left: -1.2, top: 373, width: 2.4, height: 36, borderRadius: 1.2, backgroundColor: N.brass.shade,
  },
  halo: {
    position: 'absolute', left: EYE.x - 22, top: EYE.y - 22, width: 44, height: 44, borderRadius: 22, backgroundColor: N.gr6Signal.base,
  },
  core: {
    position: 'absolute', left: EYE.x - 5, top: EYE.y - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: N.gr6Signal.base,
  },
  crankArm: { position: 'absolute', left: 0, top: -1, width: CRANK_R + 1, height: 2, borderRadius: 1, backgroundColor: N.brass.shade },
  crankKnob: {
    position: 'absolute', left: CRANK_R - 1.8, top: -1.8, width: 3.6, height: 3.6, borderRadius: 1.8, backgroundColor: N.gr6Ebonite.base,
  },
  crankHub: {
    position: 'absolute', left: HUB.x - 2.4, top: HUB.y - 2.4, width: 4.8, height: 4.8, borderRadius: 2.4,
    backgroundColor: N.brass.base, borderWidth: 0.8, borderColor: INK,
  },
  signalHalo: { position: 'absolute', left: -6, top: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: N.gr6Signal.base, opacity: 0.45 },
  signalCore: { position: 'absolute', left: -2.4, top: -2.4, width: 4.8, height: 4.8, borderRadius: 2.4, backgroundColor: N.gr6Signal.base },
  greenLight: { backgroundColor: N.gr6Green.base },
  calGlow: {
    position: 'absolute', top: CAL_TOP - 5, width: CAL_W + 10, height: CAL_H + 10, borderRadius: 8, backgroundColor: N.gr6Sun.base,
  },
  calPlate: {
    position: 'absolute', left: -20, top: 5, width: 40, alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: 3.5,
    borderWidth: 1, borderColor: INK, paddingVertical: 0.4, boxShadow: lipOf(TONE),
  },
  calText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 9.4, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  nightBlock: {
    position: 'absolute', width: 7.2, height: 6.8, borderRadius: 1, backgroundColor: N.calRed.base, borderWidth: 0.6, borderColor: INK,
  },
  ring: { position: 'absolute', width: 6, height: 6, borderRadius: 3, borderWidth: 1.1, borderColor: N.calRed.base },
  stroke: { position: 'absolute', width: 3.6, height: 1.4, borderRadius: 0.7, backgroundColor: N.calRed.shade },
  shine: { position: 'absolute', left: -11, top: -11, width: 22, height: 22, borderRadius: 11, backgroundColor: N.gr6Signal.base },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', alignItems: 'center', backgroundColor: PLATE_FACE, borderRadius: 4, borderWidth: 1.2,
    borderColor: INK, paddingHorizontal: 1, boxShadow: lipOf(TONE),
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
});

export function Growth6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Growth6Scene} band={[206, 514]} camera={CAM} />;
}
