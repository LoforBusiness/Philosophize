import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './hist6Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, tint, bodyOf as bodyParts, handLantern, hi6Osiris,
  hi6WallTorch, hi6Torch, hi6Tablet, hi6Brush, hi6Trestle, hi6TrayBack, hi6TrayFront, hi6Fragment, hi6Treaty,
  hi6Postcard, hi6Chip,
} from './objects';
import { BY_ID } from './wardrobe';
import { LESSON_ART } from './lessonArt';

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-6, "Who Really Won?" — INSIDE THE GREAT TEMPLE AT ABU SIMBEL, BY
// TORCHLIGHT.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. A visitor (the bun) holds her torch up to the
// carving of Ramesses winning Kadesh on his own; an archaeologist (the cap) kneels at his
// finds tray with a clay tablet from the Hittite capital that says the opposite; the
// historian (the top hat) walks in with a lantern and shows how to weigh two boasts.
//
//   b0   she lifts her torch up to the giant king and gazes up at him; the archaeologist
//        kneels at his tray, head down over the tablet in his hands.
//   b1   he brushes the tablet twice, lays the brush in the sand, turns to her (still on
//        one knee) and holds the tablet up; she turns to him.
//   b2   she flicks a hand at the tablet and puts her chin up.
//   b3   the historian walks in from the left with his lantern; the archaeologist gets up
//        off his knee; she turns to the historian, who lifts the lantern to the king —
//        and the lamplight comes up on the carving.
//   b4   Q1, SPOT THE BOAST: the king in his chariot, the horse, the hieroglyphs. Right:
//        a gold copy of the king lifts off the wall and shrinks to the soldiers' size,
//        landing among them on the carving's ground line. Wrong: a flake of stone breaks
//        off the horse and falls (the horse), or the panel of signs goes into shadow (the
//        hieroglyphs).
//   b5   the historian holds the lantern out toward the tablet, which the archaeologist
//        holds out to him, and then lifts it back to the carving.
//   b6   the archaeologist laughs, head back, and then shrugs.
//   b7   the historian brings his two hands together, the lantern hanging from them.
//   b8   she looks up at the king again and clasps her hands round the torch.
//   b9   Q2, CHOOSE THE FIND: the three finds standing in the tray's sand. Right: the
//        treaty rises out of the sand into the light. Wrong: the carving rocks heavily and
//        settles; the postcard droops and slumps into the sand.
//   b10  the archaeologist steps to the tray, turns to it, stands the tablet in the sand
//        at its end, pats it once and turns back.
//   b11  at ease under the quotation, the torches flickering on the stone.
//
// COMPOSITION, in stage units. THE WALL: the ceiling's painted night (256–264) with its
// stars, a frieze of painted blocks (264–272), a gold band, and the sandstone wall from
// 274 to the floor at 476, a red dado stripe at 444. THE CARVING fills 24–304 × 272–418,
// standing on its own ground line at 418: the chariot's wheel (r 20) at (84, 397), the
// KING striding in the car, 52–136 × 272–390 — 118 units tall, half again as tall as a
// living person here — the car's side over his legs, 66–118 × 360–392, the HORSE
// prancing, 122–234 × 278–418, three tiny Hittites tumbling under the
// hooves, 140–232 × 400–418, each 12 tall, and the INSCRIPTION, 236–304 × 272–418, three
// columns of signs under a blue cartouche. Two WALL TORCHES at (12, 330) and (314, 330).
// The OSIRIDE PILLAR, 324–400 × 262–476. THE FLOOR from 476. The FINDS TRAY on its
// trestle, 204–398 × 452–496: the end slot 202–226, the carving 232–276, the treaty
// 291–331, the postcard 350–387, each standing in the sand to y 463 behind the tray's
// front board (460–474), its name on the board under it. The HISTORIAN from off the left
// to 40; the VISITOR at 112; the ARCHAEOLOGIST on one knee at 186, standing from b3, and
// at 198 on b10. Band [256, 516]: the ceiling at 256, the floor shows 40.
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he talks
// to, the listeners keep their hands still (AP18) and their heads alive (N21). About 650
// Views at rest and under 700 at the busiest answer, the biggest flat things single Views, nothing under a moving camera (AT7).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('history');
const TR = 0.85;
/** 78 units of figure in a 260-unit band: 30%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, history-foundations-6), except b10, where stepping to the
 * tray, standing the tablet in it and patting it needs longer than the line and runs on.
 */
const LINES = [4.88, 4.63, 2.59, 7.23, 0, 5.26, 4.05, 7.18, 4.33, 0, 3.6, 0, 0];

// The held poses (moves.ts act + 99): talking, nodding along, waiting, explaining, the
// kneel, the laugh; and the shrug, played once (299 + act).
const TALK = 167;
const NOD = 263;
const WAIT = 161;
const EXPLAIN = 259;
const KNEEL = 280;
const LAUGH = 154;
const SHRUG = 378;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_AWE = is('awe');
const A_TABLET = is('tablet');
const A_MUD = is('mud');
const A_REASON = is('reason');
const A_BOAST = is('boast');
const A_CARDS = is('cards');
const A_AGREE = is('agree');
const A_LOVELY = is('lovely');
const A_NIL = is('nil');
const Q1 = BEATS.map((b) => (b.boast ? 1 : 0));
const Q2 = BEATS.map((b) => (b.find ? 1 : 0));
const TABLET_N = A_TABLET.indexOf(1);
const REASON_N = A_REASON.indexOf(1);
const NIL_N = A_NIL.indexOf(1);
const Q1_N = Q1.indexOf(1);
const Q2_N = Q2.indexOf(1);
const each = (f: (n: number) => Track): Track[] => BEATS.map((_, n) => f(n));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing].
type Track = readonly (readonly number[])[];
const H_OFF = -40;
const H_X = 40;
const B_X = 104;
const C_X = 186;
const C_TRAY = 202;
const H_LEGS: Track[] = each((n) => (n < REASON_N ? [[0, H_OFF]] : [[0, H_X]]));
const H_TURN: Track[] = each(() => [[0, 1]]);
const B_LEGS: Track[] = each(() => [[0, B_X]]);
/**
 * She faces whoever speaks: the carving and the historian are to her left, the
 * archaeologist and his tray to her right.
 */
const B_TURN: Track[] = [
  [[0, 1]],                  // b0  toward him, the king right over her head
  [[0, 1]],                  // b1  the archaeologist
  [[0, 1]],                  // b2  at him and his tablet
  [[0, 1], [0.24, -1]],      // b3  round to the historian coming in
  [[0, -1]],                 // b4  Q1
  [[0, -1]],                 // b5  the historian
  [[0, -1], [0.04, 1]],      // b6  the archaeologist
  [[0, 1], [0.04, -1]],      // b7  the historian
  [[0, -1]],                 // b8  up at the king
  [[0, -1], [0, 1]],         // b9  Q2, round to the tray
  [[0, 1]],                  // b10 the archaeologist
  [[0, 1]],                  // b11
  [[0, 1]],                  // b12
];
const C_LEGS: Track[] = each((n) => (n < NIL_N ? [[0, C_X]] : n === NIL_N ? [[0.02, C_TRAY]] : [[0, C_TRAY]]));
/**
 * He kneels facing her with the tablet in his hands; on b1 he turns to the tray only to
 * lay the brush in it, and on b10 to stand the tablet in it — turned first, never
 * reaching behind himself (AR4).
 */
const C_TURN: Track[] = each((n) => (
  n === TABLET_N ? [[0, -1], [0.29, 1], [0.5, -1]]
    : n === NIL_N ? [[0, -1], [0.0, 1], [0.9, -1]] : [[0, -1]]
));
/** What each is doing with his body: talking while he speaks, alive while he listens (N21). */
const B_P = [TALK, NOD, TALK, NOD, WAIT, NOD, NOD, NOD, TALK, WAIT, NOD, NOD, WAIT];
const C_P = [KNEEL, KNEEL, KNEEL, NOD, NOD, NOD, TALK, NOD, NOD, NOD, TALK, NOD, NOD];
const H_P = [NOD, NOD, NOD, EXPLAIN, WAIT, EXPLAIN, NOD, EXPLAIN, NOD, WAIT, NOD, NOD, WAIT];

// ── the carving ──────────────────────────────────────────────────────────────
// The Kadesh carving is one carved-relief picture (scripts/lib/lessonart/hist6Carving.mjs,
// npm run make:lesson-art), drawn against photographs of the real relief at Abu Simbel:
// the king in his chariot, the horse in the flying gallop, enemies under its hooves.
const CARVING = LESSON_ART['hist6-carving'];
/** The king alone in gold leaf, for the copy that lifts off the wall (Q1). */
const KING_GOLD = LESSON_ART['hist6-king-gold'];
const OSIRIS_ART = hi6Osiris(362, 369, 76, 214);
const TORCHES = [{ x: 12, y: 330 }, { x: 314, y: 330 }];
const WALL_TORCH_ART = TORCHES.map((p) => hi6WallTorch(p.x, p.y, 16, 36));
/** Where each wall torch's flame sits: the top of its wrapped head. */
const WALL_FLAME = TORCHES.map((p) => ({ x: p.x + 2, y: p.y - 17 }));
/** The king's feet on the car's floor, and where his gold copy lands among the soldiers. */
const KING_FEET = { x: 90, y: 390 };
const TRUE_SIZE = { x: 166, y: 418, s: 0.11 };
/** A gold copy of the king's outline: his body only, no detail, so it reads as a shape lifted off the wall. */
/** The flake of stone that breaks off the horse's chest (Q1, the horse, wrong). */
const FLAKE_FROM = { x: 212, y: 344 }; // the horse's chest in the carving
const FLAKE_ART = hi6Chip(0, 0, 12, 9);

// ── the tray and its finds ───────────────────────────────────────────────────
const TRESTLE_ART = hi6Trestle(301, 484, 194, 194);
const TRAY_BACK_ART = hi6TrayBack(301, 458, 194, 12);
const TRAY_FRONT_ART = hi6TrayFront(301, 467, 194, 14);
/** The sand's surface, where a find stands. */
const SAND = 463;
const FINDS = [
  { id: 'carving', x: 254, label: 'CARVING', art: hi6Fragment(0, -18, 44, 36) },
  { id: 'treaty', x: 311, label: 'TREATY', art: hi6Treaty(0, -18, 40, 36) },
  { id: 'postcard', x: 368, label: 'POSTCARD', art: hi6Postcard(0, -14, 37, 28) },
];
/** The right find (the beat's `explain` names it): the treaty, found in both capitals. */
const RIGHT_FIND = 1;
const KING_Q = 0;

// ── what they carry, each drawn about its GRIP (AR2, AR7.4) ──────────────────
const TORCH_ART = hi6Torch(0, -10.67, 40, 40);
/** From the torch's grip up to the middle of its flame. */
const TORCH_FLAME = 31;
const LAMP_ART = handLantern(0, 8.28, 11, 18);
const TABLET_ART = hi6Tablet(0.6, -5.9, 16, 12);
const BRUSH_ART = hi6Brush(0, -4.5, 16, 16);
/** Where he lays the brush in the sand, and where he stands the tablet, at the tray's end. */
const BRUSH_DOWN = { x: 206, y: 459 };
const SLOT = { x: 218, y: 462 };

// ── the painted top of the wall ──────────────────────────────────────────────
const FRIEZE = Array.from({ length: 14 }, (_, k) => k);
const BLOCK_W = 400 / 14;
const FRIEZE_TONE = [NATURAL.hi6Blue.base, NATURAL.hi6Plume.base, NATURAL.hi6Green.base, NATURAL.hi6Gold.base];
const STARS = [[30, 259], [118, 261], [204, 258.5], [286, 260.5], [372, 259]];
const FLOOR_ROWS = [486, 498, 512];
const FLOOR_RAYS = [40, 120, 200, 280, 360].map((x) => {
  const xb = 200 + (x - 200) * 1.5;
  const dx = xb - x;
  const dy = 84;
  const len = Math.hypot(dx, dy);
  return { x: (x + xb) / 2 - len / 2, y: 476 + dy / 2, len, rot: (Math.atan2(dy, dx) * 180) / Math.PI };
});

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
/** One hand on a stage point. */
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A hand held in the figure's own frame (rig units, +x forward, +y down from the pelvis). */
function holdAt(s: Stance, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const cur = which > 0 ? s.fistR : s.fistL;
  const m = { x: lerp(cur.x, lx, w), y: lerp(cur.y, ly, w) };
  return which > 0 ? { ...s, fistR: m } : { ...s, fistL: m };
}
/** A raised hand kept in front of the body, never thrown back behind it (AR4). */
function inFront(s: Stance): Stance {
  'worklet';
  const f = (p: { x: number; y: number }) => {
    'worklet';
    return p.y < 4 && p.x < -2 ? { x: -2, y: p.y } : p;
  };
  return { ...s, fistL: f(s.fistL), fistR: f(s.fistR) };
}
/**
 * A look up (positive) or down (negative), ADDED to the pose's own head so a listener's
 * nod goes on underneath it (N21). In the rig a positive neck tips the head back and a
 * positive tilt leans the body back (AR8's note), so the spine goes with the eyes.
 */
function lookOf(s: Stance, up: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  return { ...s, neck: s.neck + up * w, tilt: s.tilt + (up > 0 ? 0.05 : -0.06) * w };
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn. He starts
 * from WHERE HE IS ON SCREEN (`src`, out of the carry), never from where the script
 * left him, so a tap mid-walk cannot put him anywhere in one frame (group L).
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
function bodyOf(w: { x0: number; x1: number; u: number; walking: boolean }, code: number, t: number, b: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(code, t), hHold(code, t), hLive(code, t, b), w.u, WALK, 0)
    : hLive(code, t, b);
}

/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

/** A flame's flicker on the monotonic clock: two beating sines, never on `bt` (L1). */
function flick(t: number, ph: number): number {
  'worklet';
  return 0.12 * Math.sin(t * 9.3 + ph) + 0.07 * Math.sin(t * 23.1 + ph * 2.3);
}

const CAM = followMoves(H_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('history'));

export default function Hist6Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldC = useHeld();
  const heldH = useHeld();
  const cv = useCarry(18);
  const on = useLinger(i);
  // THE GAMES ANSWER BACK: which of the three was tapped on this graded beat, and how
  // many seconds ago. The scene reads them only on that beat; everything they move is
  // carried, so the next beat takes it from wherever it is on screen (AH4).
  const pick = useSharedValue(-1);
  const since = useSharedValue(0);
  useEffect(() => {
    const ids = Q1[i] ? Q1_IDS : Q2[i] ? FINDS.map((f) => f.id) : null;
    if (!ids) return;
    const k = picked === null ? -1 : ids.indexOf(picked);
    pick.value = k;
    since.value = 0;
    if (k >= 0) since.value = withTiming(8, { duration: 8000, easing: Easing.linear });
  }, [picked, i, pick, since]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const L = lineOf(LINES, n);
    const pk = pick.value;
    const rs = since.value;
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };
    // the same, in seconds since the reader's tap on a graded beat
    const rAt = (a: number, z: number) => {
      'worklet';
      const u = clamp01((rs - a) / (z - a));
      return u * u * (3 - 2 * u);
    };
    const rBump = (a: number, m: number, z: number) => {
      'worklet';
      return rAt(a, m) * (1 - rAt(m, z));
    };
    const q1 = Q1[n] === 1 && pk >= 0;
    const q2 = Q2[n] === 1 && pk >= 0;

    // ── the visitor, with her torch ─────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 0, n, B_X), B_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, -1), B_TURN[n], b, L), 1);
    let sb = bodyOf(wb, B_P[n], t, b);
    // her free hand hangs at her side unless the beat gives it something to do
    if (!wb.walking) sb = holdAt(sb, -1, 3, 9, 1);
    // the torch in her right hand, upright, held close at her chest (AR2, AR6)
    let tx = 20;
    let ty = -4;
    if (A_AWE[n]) {
      // held up toward the carving, and her eyes up to the king
      const up = st(0.08, 0.3);
      tx = lerp(20, 15, up);
      ty = lerp(-4, -58, up);
      sb = lookOf(sb, 0.3, st(0.04, 0.26));
    }
    if (n === TABLET_N) {
      // and down again as she turns to him
      const dn = st(0.0, 0.22);
      tx = lerp(15, 20, dn);
      ty = lerp(-58, -4, dn);
    }
    if (A_MUD[n]) {
      // a flick of the free hand at his tablet, and the chin up
      sb = holdAt(sb, -1, 17, -20, bp(0.14, 0.32, 0.66));
      sb = lookOf(sb, 0.2, st(0.42, 0.62));
    }
    if (A_LOVELY[n]) {
      // up at the king again, both hands round the torch
      sb = lookOf(sb, 0.3, st(0.04, 0.24));
      const c = st(0.3, 0.5);
      tx = lerp(20, 14, c);
      ty = lerp(-4, -12, c);
      sb = holdAt(sb, -1, 14, -22, c);
    }
    if (n > 8 && n < 12) sb = holdAt(sb, -1, 14, -22, n === Q2_N ? 1 - st(0, 0.2) : 0);
    sb = holdAt(sb, 1, tx, ty, 1);
    const prevB = carryFrom(heldB, n, hHold(B_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the archaeologist, at his tray ──────────────────────────────────────
    const wc = legsOf(carrySource(cv, 2, n, C_X), C_LEGS[n], b, L);
    const xC = carry(cv, 2, n, wc.x, wc.x, 1);
    const dC = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, 1), C_TURN[n], b, L), 1);
    let sc = bodyOf(wc, C_P[n], t, b);
    // b3: up off his knee
    if (n === REASON_N) sc = mixStance(hHold(KNEEL, t), sc, st(0.04, 0.22));
    // the tablet in his left hand: low over his knee while he works, held up to show her,
    // then at his chest once he is up
    let ax = 16;
    let ay = -10;
    // the brush in his right hand over the tablet until he lays it down
    if (n <= TABLET_N) sc = holdAt(sc, 1, 13, -14, 1);
    if (n === 0) sc = lookOf(sc, -0.3, 1);
    if (n === TABLET_N) {
      sc = lookOf(sc, -0.3, 1 - st(0.5, 0.6));
      const up = st(0.6, 0.76);
      ax = lerp(16, 18, up);
      ay = lerp(-10, -40, up);
      // two strokes of the brush across its face — out, back, out — then he turns to
      // the tray, lays the brush in the sand and turns back to her (AR5: a path, once)
      const sweep = bp(0.04, 0.12, 0.19) + st(0.21, 0.28);
      const strokes = 1 - st(0.31, 0.36);
      sc = holdAt(sc, 1, 12 + 9 * sweep, -21 + 2 * sweep, strokes);
      sc = hand(sc, xC, dC, 1, BRUSH_DOWN.x, BRUSH_DOWN.y - 1, bp(0.34, 0.42, 0.5));
    }
    if (A_MUD[n]) {
      ax = 18;
      ay = -40;
    }
    if (n >= REASON_N && n < NIL_N) {
      const dn = n === REASON_N ? st(0.0, 0.16) : 1;
      ax = lerp(18, 12, dn);
      ay = lerp(-40, -14, dn);
    }
    // b5: held out to the historian's light, and back
    if (A_BOAST[n]) {
      const o = bp(0.08, 0.2, 0.55);
      ax = lerp(12, 19, o);
      ay = lerp(-14, -22, o);
    }
    // b6: a laugh, head back, then a shrug — the tablet rides his hand through it
    let shrugW = 0;
    if (A_CARDS[n]) {
      sc = mixStance(sc, hHold(LAUGH, t), st(0.02, 0.1) * (1 - st(0.4, 0.5)));
      shrugW = st(0.42, 0.52) * (1 - st(0.9, 1));
      sc = inFront(mixStance(sc, hLive(SHRUG, t, Math.max(0, b - 0.46 * L)), shrugW));
    }
    // b10: stepped to the tray, the tablet stood in the sand at its end, one pat
    let tabHeld = 1;
    if (A_NIL[n]) {
      const set = st(0.28, 0.48);
      tabHeld = 1 - st(0.48, 0.54);
      sc = hand(sc, xC, dC, -1, SLOT.x, SLOT.y - 8, set * (1 - st(0.5, 0.58)));
      sc = hand(sc, xC, dC, 1, SLOT.x, SLOT.y - 14, bp(0.58, 0.67, 0.78));
    }
    if (n > NIL_N) tabHeld = 0;
    sc = holdAt(sc, -1, ax, ay, tabHeld * (A_NIL[n] ? 1 - st(0.28, 0.48) : 1));
    const prevC = carryFrom(heldC, n, hHold(C_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the historian, with his lantern ─────────────────────────────────────
    const wh = legsOf(carrySource(cv, 4, n, H_OFF), H_LEGS[n], b, L);
    const xH = carry(cv, 4, n, wh.x, wh.x, 1);
    const dH = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, 1), H_TURN[n], b, L), 1);
    let sh = bodyOf(wh, H_P[n], t, b);
    // the lantern hangs from his left hand (AR2: by its ring) — lifted to the king on b3,
    // held out toward the tablet and back up on b5, between his joined hands on b7
    let lx = 8;
    let ly = 4;
    let lamp = 0;
    if (A_REASON[n]) {
      const up = st(0.42, 0.56) * (1 - st(0.9, 0.99));
      lx = lerp(8, 13, up);
      ly = lerp(4, -60, up);
      lamp = up;
      sh = lookOf(sh, 0.28, up);
    }
    if (A_BOAST[n]) {
      const out = bp(0.06, 0.18, 0.5);
      const up = st(0.55, 0.7) * (1 - st(0.92, 1));
      lx = lerp(lerp(8, 20, out), 13, up);
      ly = lerp(lerp(4, -22, out), -60, up);
      lamp = up;
      sh = lookOf(sh, 0.28, up);
    }
    if (A_AGREE[n]) {
      const j = st(0.14, 0.3) * (1 - st(0.82, 0.96));
      lx = lerp(8, 12, j);
      ly = lerp(4, -16, j);
      sh = holdAt(sh, 1, 13, -18, j);
    }
    sh = holdAt(sh, -1, lx, ly, 1);
    const prevH = carryFrom(heldH, n, hHold(H_P[p], t));
    const figH = keepHeld(heldH, wh.walking ? mixKeepLegs(prevH, sh, tr) : mixStance(prevH, sh, tr));

    // ── the three people, posed ─────────────────────────────────────────────
    const vis = pose(figB, xB, GROUND, K, dB, 1);
    const arc = pose(figC, xC, GROUND, K, dC, 1);
    const his = pose(figH, xH, GROUND, K, dH, 1);
    const bR = wristOf(vis, 'wrR');
    const cR = wristOf(arc, 'wrR');
    const cL = wristOf(arc, 'wrL');
    const hL = wristOf(his, 'wrL');

    // ── what they carry, on the wrist every frame (AR7.4) ───────────────────
    const torch = { x: bR.x, y: bR.y };
    const lantern = { x: hL.x, y: hL.y };
    // the tablet: 0 in his hand · 1 stood in the sand at the tray's end
    const tabNow = A_NIL[n] ? st(0.48, 0.52) : n > NIL_N ? 1 : 0;
    const tb = carry(cv, 6, n, tabNow, tabNow, tr);
    const tablet = { x: lerp(cL.x, SLOT.x, tb), y: lerp(cL.y, SLOT.y, tb), down: tb > 0.5 ? 1 : 0 };
    // the brush: 0 in his hand, bristles to the tablet · 1 laid flat in the sand
    const brNow = n === 0 ? 0 : n === TABLET_N ? st(0.43, 0.47) : 1;
    const br = carry(cv, 7, n, brNow, brNow, tr);
    const brush = { x: lerp(cR.x, BRUSH_DOWN.x, br), y: lerp(cR.y, BRUSH_DOWN.y, br), r: lerp(dC < 0 ? -135 : 135, 90, br), down: br > 0.5 ? 1 : 0 };
    // the light on the king: the lantern lifted to him, or the right answer to Q1
    const shine = Math.max(lamp, q1 && pk === KING_Q ? rAt(0, 0.4) : 0);
    const glow = carry(cv, 8, n, shine, shine, tr);

    // ── Q1: the true size, the flake, the shadow ────────────────────────────
    // right: a gold copy lifts off the king and shrinks onto the carving's ground line;
    // after the question it stays where it got to and fades with the targets (q1)
    const gT = Q1[n] ? (q1 && pk === KING_Q ? rAt(0.3, 1.9) : 0) : carrySource(cv, 9, n, 0);
    const ghostU = carry(cv, 9, n, gT, gT, Q1[n] ? 1 : tr);
    const gOn = q1 && pk === KING_Q ? rAt(0.25, 0.55) : 0;
    const ghostO = carry(cv, 10, n, gOn, gOn, tr);
    const fT = Q1[n] ? (q1 && pk === 1 ? clamp01((rs - 0.15) / 0.75) : 0) : carrySource(cv, 11, n, 0);
    const flake = carry(cv, 11, n, fT, fT, Q1[n] ? 1 : tr);
    const shadeNow = q1 && pk === 2 ? 0.34 * rAt(0.05, 0.4) * (1 - rAt(1.6, 2.4)) : 0;
    const shade = carry(cv, 12, n, shadeNow, shadeNow, tr);

    // ── Q2: the finds answer ────────────────────────────────────────────────
    const riseNow = q2 && pk === RIGHT_FIND ? rAt(0.1, 0.8) : n > Q2_N ? 1 : 0;
    const rise = carry(cv, 13, n, riseNow, riseNow, tr);
    const rockNow = q2 && pk === 0 ? Math.sin(rs * 11) * Math.exp(-rs * 2.6) * rAt(0, 0.06) : 0;
    const rock = carry(cv, 14, n, rockNow, rockNow, tr);
    const dT = Q2[n] ? (q2 && pk === 2 ? rAt(0.08, 0.7) : 0) : n > Q2_N ? carrySource(cv, 15, n, 0) : 0;
    const droop = carry(cv, 15, n, dT, dT, tr);

    return {
      vis, arc, his, t,
      torch, lantern, tablet, brush, glow,
      ghost: { u: ghostU, o: ghostO }, flake, shade,
      rise, rock, droop,
      q1: carry(cv, 16, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 17, n, Q2[p], Q2[n], tr),
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.vis);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.arc);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.his);

  return (
    <View style={styles.scene}>
      <Hall S={SCENE} />
      <ObjectArt parts={OSIRIS_ART} tone={TONE} line={1.4} />
      <Carving S={SCENE} i={i} picked={picked} />
      {WALL_TORCH_ART.map((a, k) => <ObjectArt key={k} parts={a} tone={TONE} line={1.2} />)}
      {WALL_FLAME.map((f, k) => <Flame key={k} S={SCENE} x={f.x} y={f.y} s={1} ph={k * 2.1} />)}
      <FloorView />
      <ObjectArt parts={TRESTLE_ART} tone={TONE} line={1.4} />
      <ObjectArt parts={TRAY_BACK_ART} tone={TONE} line={1.2} />
      <Finds S={SCENE} />
      <Carried S={SCENE} layer="tray" i={i} />
      <ObjectArt parts={TRAY_FRONT_ART} tone={TONE} line={1.2} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="second" wear={BY_ID.stroller.pieces} />
      <Carried S={SCENE} layer="cap" i={i} />
      {/* cast: tophat */}
      <Stickman D={DH} k={K} role="crowd" wear={BY_ID.magistrate.pieces} />
      <Carried S={SCENE} layer="tophat" i={i} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Carried S={SCENE} layer="bun" i={i} />
      {on(Q1) ? <BoastTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <FindTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the hall ─────────────────────────────────────────────────────────────────

/** The painted ceiling, its stars, the frieze, the wall and the light the torches throw. */
function Hall({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <View style={styles.masonry} pointerEvents="none" />
      {TORCHES.map((p, k) => <Pool key={k} S={S} x={p.x + 2} y={p.y - 14} ph={k * 2.1} />)}
      <View style={styles.night} pointerEvents="none" />
      {STARS.map(([x, y], k) => <Star key={k} S={S} x={x} y={y} ph={k * 1.9} />)}
      {FRIEZE.map((k) => (
        <View key={k} style={[styles.block, { left: k * BLOCK_W, backgroundColor: FRIEZE_TONE[k % 4] }]} pointerEvents="none" />
      ))}
      <View style={styles.band} pointerEvents="none" />
      <View style={styles.groundLine} pointerEvents="none" />
      <View style={styles.dado} pointerEvents="none" />
      <View style={styles.dadoRule} pointerEvents="none" />
    </>
  );
}

/**
 * A pool of torchlight on the wall, breathing with the flame (never on `bt`): three rings,
 * fainter as they widen, so the light falls off rather than ending at an edge.
 */
function Pool({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => ({ opacity: 1 + 1.4 * flick(S.value.t, ph) }));
  return (
    <Animated.View style={[styles.rider, { left: x, top: y }, st]} pointerEvents="none">
      <View style={[styles.pool, { left: -44, top: -44, width: 88, height: 88, borderRadius: 44, opacity: 0.07 }]} />
      <View style={[styles.pool, { left: -27, top: -27, width: 54, height: 54, borderRadius: 27, opacity: 0.1 }]} />
      <View style={[styles.pool, { left: -14, top: -14, width: 28, height: 28, borderRadius: 14, opacity: 0.16 }]} />
    </Animated.View>
  );
}

function Star({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.6 + 0.4 * Math.sin(S.value.t * 1.1 + ph) }));
  return <Animated.View style={[styles.star, { left: x - 1.1, top: y - 1.1 }, st]} pointerEvents="none" />;
}

/** A flame, flickering on the clock: the wall torches' and her torch's. */
function Flame({ S, x, y, s, ph, follow }: { S: SharedValue<any>; x: number; y: number; s: number; ph: number; follow?: boolean }) {
  const st = useAnimatedStyle(() => {
    const f = flick(S.value.t, ph);
    const fx = follow ? S.value.torch.x : x;
    const fy = follow ? S.value.torch.y - TORCH_FLAME : y;
    return { transform: [{ translateX: fx }, { translateY: fy }, { scaleX: s * (1 - f * 0.5) }, { scaleY: s * (1 + f) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.flameOuter} />
      <View style={styles.flameInner} />
    </Animated.View>
  );
}

/** Embers going up off her torch and fading, on the clock. */
function Ember({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const f = (((S.value.t * 0.55 + k / 3) % 1) + 1) % 1;
    return {
      opacity: Math.sin(Math.PI * f) * 0.9,
      transform: [
        { translateX: S.value.torch.x + 3 * Math.sin(S.value.t * 2.1 + k * 2) + (k - 1) * 1.5 },
        { translateY: S.value.torch.y - TORCH_FLAME - 6 - 22 * f },
      ],
    };
  });
  return <Animated.View style={[styles.ember, st]} pointerEvents="none" />;
}

/** The flagstones, running away to the back of the hall. */
function FloorView() {
  return (
    <>
      <View style={styles.flags} pointerEvents="none" />
      {FLOOR_ROWS.map((y) => <View key={`r${y}`} style={[styles.flagRow, { top: y }]} pointerEvents="none" />)}
      {FLOOR_RAYS.map((r, k) => (
        <View key={`f${k}`} style={[styles.flagRay, { left: r.x, top: r.y, width: r.len, transform: [{ rotate: `${r.rot}deg` }] }]} pointerEvents="none" />
      ))}
    </>
  );
}

// ── the carving ──────────────────────────────────────────────────────────────

/**
 * The relief: the wheel, the king, the car over his legs, the horse, the soldiers and the
 * overturned chariot under it, and the inscription; then the light that comes up on the
 * king, and Q1's three answers — the gold copy, the falling flake, the panel's shadow.
 */
function Carving({ S, i, picked }: { S: SharedValue<any>; i: number; picked: string | null }) {
  // each answer is mounted only once it is picked, and for the beat after, while it fades
  const after = i === Q1_N + 1;
  const glow = useAnimatedStyle(() => ({ opacity: S.value.glow * (1 + 0.6 * flick(S.value.t, 1.3)) }));
  const shadow = useAnimatedStyle(() => ({ opacity: S.value.shade }));
  return (
    <>
      <Image source={CARVING.source} fadeDuration={0} style={{ position: 'absolute', left: CARVING.x, top: CARVING.y, width: CARVING.w, height: CARVING.h }} />
      {/* the light comes up on the king only from b3 to b5, so it is mounted only then */}
      {i >= REASON_N - 1 && i <= Q1_N + 2 ? (
        <Animated.View style={[styles.kingGlow, glow]} pointerEvents="none">
          <View style={[styles.pool, { left: 0, top: 0, width: 120, height: 150, borderRadius: 60, opacity: 0.08 }]} />
          <View style={[styles.pool, { left: 18, top: 22, width: 84, height: 106, borderRadius: 42, opacity: 0.1 }]} />
          <View style={[styles.pool, { left: 36, top: 44, width: 48, height: 62, borderRadius: 24, opacity: 0.12 }]} />
        </Animated.View>
      ) : null}
      {(i === Q1_N && picked === 'glyphs') || after ? <Animated.View style={[styles.signShadow, shadow]} pointerEvents="none" /> : null}
      {(i === Q1_N && picked === 'king') || after ? <Ghost S={S} /> : null}
      {(i === Q1_N && picked === 'horses') || after ? <Flake S={S} /> : null}
    </>
  );
}

/** The king at his true size: a gold copy that lifts off the wall and shrinks to a soldier's. */
function Ghost({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const u = S.value.ghost.u;
    const e = u * u * (3 - 2 * u);
    const sc = lerp(1, TRUE_SIZE.s, e);
    return {
      opacity: 0.88 * S.value.ghost.o,
      transform: [
        { translateX: lerp(KING_FEET.x, TRUE_SIZE.x, e) },
        { translateY: lerp(KING_FEET.y, TRUE_SIZE.y, e) - 18 * Math.sin(Math.PI * e) },
        { scale: sc },
      ],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Image
        source={KING_GOLD.source}
        fadeDuration={0}
        style={{ position: 'absolute', left: KING_GOLD.x - KING_FEET.x, top: KING_GOLD.y - KING_FEET.y, width: KING_GOLD.w, height: KING_GOLD.h }}
      />
    </Animated.View>
  );
}

/** A flake of stone off the horse's chest, falling to the carving's foot, and its dust. */
function Flake({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const u = S.value.flake;
    return {
      // it lands on the carving's ground line and lies there until the targets fade
      opacity: u > 0 ? S.value.q1 : 0,
      transform: [
        { translateX: FLAKE_FROM.x + 6 * u }, { translateY: FLAKE_FROM.y + 62 * u * u }, { rotate: `${240 * u}deg` },
      ],
    };
  });
  const dust = useAnimatedStyle(() => {
    const u = S.value.flake;
    return {
      opacity: u > 0.05 && u < 1 ? 0.8 * (1 - u) : 0,
      transform: [{ translateX: FLAKE_FROM.x }, { translateY: FLAKE_FROM.y + 6 + 26 * u }, { scaleY: 0.6 + 3 * u }, { scaleX: 1 + u }],
    };
  });
  // the pale scar the flake leaves in the horse's chest
  const scar = useAnimatedStyle(() => ({ opacity: S.value.flake > 0 ? S.value.q1 : 0 }));
  return (
    <>
      <Animated.View style={[styles.scar, scar]} pointerEvents="none" />
      <Animated.View style={[styles.dust, dust]} pointerEvents="none" />
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <ObjectArt parts={FLAKE_ART} tone={TONE} line={0.7} />
      </Animated.View>
    </>
  );
}

// ── the finds, standing in the sand ──────────────────────────────────────────

/** The carving rocks (wrong), the treaty rises into the light (right), the postcard droops (wrong). */
function Finds({ S }: { S: SharedValue<any> }) {
  const carving = useAnimatedStyle(() => ({
    transform: [{ translateX: FINDS[0].x }, { translateY: SAND }, { rotate: `${7 * S.value.rock}deg` }],
  }));
  const treaty = useAnimatedStyle(() => {
    const r = S.value.rise;
    return { transform: [{ translateX: FINDS[1].x }, { translateY: SAND - 13 * r }, { scale: 1 + 0.12 * r }] };
  });
  const halo = useAnimatedStyle(() => ({
    opacity: S.value.rise * (1 + 0.4 * flick(S.value.t, 0.7)),
    transform: [{ translateX: FINDS[1].x }, { translateY: SAND - 18 - 13 * S.value.rise }],
  }));
  const card = useAnimatedStyle(() => {
    const d = S.value.droop;
    return { transform: [{ translateX: FINDS[2].x - 8 * d }, { translateY: SAND + 5 * d }, { rotate: `${-24 * d}deg` }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, halo]} pointerEvents="none">
        <View style={[styles.pool, { left: -34, top: -30, width: 68, height: 60, borderRadius: 34, opacity: 0.12 }]} />
        <View style={[styles.pool, { left: -23, top: -20, width: 46, height: 40, borderRadius: 23, opacity: 0.16 }]} />
        <View style={[styles.pool, { left: -12, top: -10, width: 24, height: 20, borderRadius: 12, opacity: 0.2 }]} />
      </Animated.View>
      <Animated.View style={[styles.rider, carving]} pointerEvents="none">
        <ObjectArt parts={FINDS[0].art} tone={TONE} line={1.2} />
      </Animated.View>
      <Animated.View style={[styles.rider, treaty]} pointerEvents="none">
        <ObjectArt parts={FINDS[1].art} tone={TONE} line={1.2} />
      </Animated.View>
      <Animated.View style={[styles.rider, card]} pointerEvents="none">
        <ObjectArt parts={FINDS[2].art} tone={TONE} line={1.2} />
      </Animated.View>
    </>
  );
}

// ── what they carry ──────────────────────────────────────────────────────────

type At = { x: number; y: number; o?: number; r?: number };
function Rider({ at, art, line }: { at: SharedValue<At>; art: ReturnType<typeof hi6Tablet>; line?: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o ?? 1,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { rotate: `${at.value.r ?? 0}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} line={line} />
    </Animated.View>
  );
}

/**
 * Each in the layer of the hand that holds it: the tablet and brush with the
 * archaeologist (or in the tray once he has set them down), the lantern with the
 * historian, the torch and its flame and embers with the visitor.
 */
function Carried({ S, layer, i }: { S: SharedValue<any>; layer: 'tray' | 'cap' | 'tophat' | 'bun'; i: number }) {
  const tablet = useDerivedValue<At>(() => ({
    x: S.value.tablet.x, y: S.value.tablet.y, o: (layer === 'tray') === (S.value.tablet.down === 1) ? 1 : 0,
  }));
  const brush = useDerivedValue<At>(() => ({
    x: S.value.brush.x, y: S.value.brush.y, r: S.value.brush.r, o: (layer === 'tray') === (S.value.brush.down === 1) ? 1 : 0,
  }));
  const lantern = useDerivedValue<At>(() => ({ x: S.value.lantern.x, y: S.value.lantern.y }));
  const torch = useDerivedValue<At>(() => ({ x: S.value.torch.x, y: S.value.torch.y }));
  if (layer === 'tray' || layer === 'cap') {
    return (
      <>
        {(layer === 'tray' ? i >= NIL_N - 1 : i <= NIL_N + 1) ? <Rider at={tablet} art={TABLET_ART} line={0.8} /> : null}
        {i <= TABLET_N + 1 || layer === 'tray' ? <Rider at={brush} art={BRUSH_ART} line={0.6} /> : null}
      </>
    );
  }
  if (layer === 'tophat') return i >= REASON_N - 1 ? <Rider at={lantern} art={LAMP_ART} line={0.9} /> : null;
  return (
    <>
      <Rider at={torch} art={TORCH_ART} line={0.9} />
      <Flame S={S} x={0} y={0} s={0.8} ph={0.6} follow />
      {[0, 1].map((k) => <Ember key={k} S={S} k={k} />)}
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both are tapped ON THE STAGE (AP6), on the things themselves, each choice's name on a
 * plate inside its target (AN1). No two live targets touch (AN4). Q1, SPOT THE BOAST: the
 * king in his chariot, the horse, the panel of hieroglyphs. Q2, CHOOSE THE FIND: the three
 * finds in the tray, their names on the tray's front board under them.
 */
type Q = {
  id: string; label: string; left: number; top: number; w: number; h: number; correct: boolean;
  px: number; py: number; pw: number;
};
const Q1_IDS = ['king', 'horses', 'glyphs'];
const BOAST_Q: Q[] = [
  { id: 'king', label: 'KING', left: 40, top: 272, w: 84, h: 146, correct: true, px: 4, py: 6, pw: 30 },
  { id: 'horses', label: 'HORSES', left: 128, top: 276, w: 104, h: 142, correct: false, px: 4, py: 6, pw: 44 },
  { id: 'glyphs', label: 'HIEROGLYPHS', left: 236, top: 272, w: 68, h: 146, correct: false, px: 1, py: 130, pw: 66 },
];
const FIND_Q: Q[] = FINDS.map((f, k) => ({
  id: f.id, label: f.label, left: f.x - 27, top: 424, w: 54, h: 50, correct: k === RIGHT_FIND, px: 0, py: 36, pw: 54,
}));
type TP = { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> };
function BoastTargets(p: TP) {
  return <StageTargets {...p} qs={BOAST_Q} k="q1" />;
}
function FindTargets(p: TP) {
  return <StageTargets {...p} qs={FIND_Q} k="q2" />;
}
function StageTargets({ picked, onPick, live, S, qs, k }: TP & { qs: Q[]; k: 'q1' | 'q2' }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place}>
            <View style={[styles.namePlate, { left: q.px, top: q.py, width: q.pw }]}>
              <Text style={styles.nameText}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

/** The hall's sandstone: the wall, and the floor's flags. */
const STONE = NATURAL.hi6Wall;
const FLAGS = NATURAL.hi6Floor;

const FLAME = NATURAL.hi6Flame;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  masonry: { position: 'absolute', left: 0, top: 250, width: 400, height: 226, backgroundColor: STONE.base },
  night: { position: 'absolute', left: 0, top: 250, width: 400, height: 14, backgroundColor: NATURAL.hi6Ceiling.base },
  star: { position: 'absolute', width: 2.2, height: 2.2, borderRadius: 1.1, backgroundColor: NATURAL.hi6Star.base },
  block: { position: 'absolute', top: 264, width: BLOCK_W, height: 8, borderRightWidth: 0.6, borderColor: INK },
  band: { position: 'absolute', left: 0, top: 272, width: 400, height: 2, backgroundColor: NATURAL.hi6Gold.shade },
  groundLine: { position: 'absolute', left: 24, top: 418, width: 212, height: 1.4, borderRadius: 0.7, backgroundColor: STONE.shade },
  dado: { position: 'absolute', left: 0, top: 444, width: 324, height: 3, backgroundColor: NATURAL.hi6Plume.base },
  dadoRule: { position: 'absolute', left: 0, top: 448.5, width: 324, height: 1, backgroundColor: STONE.shade },
  pool: { position: 'absolute', backgroundColor: FLAME.base },
  flameOuter: { position: 'absolute', left: -4, top: -12, width: 8, height: 14, borderRadius: 4, backgroundColor: FLAME.shade },
  flameInner: { position: 'absolute', left: -2.2, top: -7.5, width: 4.4, height: 8, borderRadius: 2.2, backgroundColor: FLAME.base },
  ember: { position: 'absolute', left: -0.9, top: -0.9, width: 1.8, height: 1.8, borderRadius: 0.9, backgroundColor: FLAME.base },
  flags: { position: 'absolute', left: 0, top: 476, width: 400, height: 90, backgroundColor: FLAGS.base, borderTopWidth: 1.2, borderTopColor: INK },
  flagRow: { position: 'absolute', left: 0, width: 400, height: 1, backgroundColor: FLAGS.shade },
  flagRay: { position: 'absolute', height: 1, backgroundColor: FLAGS.shade },
  kingGlow: { position: 'absolute', left: 40, top: 262, width: 120, height: 150 },
  signShadow: { position: 'absolute', left: 236, top: 272, width: 68, height: 146, borderRadius: 1, backgroundColor: INK },
  dust: { position: 'absolute', left: -5, top: -3, width: 10, height: 6, borderRadius: 3, backgroundColor: NATURAL.hi6Carve.shade },
  scar: { position: 'absolute', left: FLAKE_FROM.x - 6, top: FLAKE_FROM.y - 4, width: 12, height: 9, borderRadius: 3, backgroundColor: NATURAL.hi6Recess.base, borderWidth: 0.6, borderColor: NATURAL.hi6Carve.shade },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', height: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: PLATE_FACE,
    borderRadius: 3, borderWidth: 1.1, borderColor: INK,
  },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
    textAlign: 'center',
  },
});

export function Hist6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Hist6Scene} band={[256, 516]} camera={CAM} />;
}
