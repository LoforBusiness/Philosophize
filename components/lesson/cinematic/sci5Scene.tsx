import { useEffect, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, interpolateColor, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './sci5Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, seated, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE } from './stageSkin';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo, sipHandAt, sipHead, sipTilt } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, s5BoatBack, s5BoatFront, s5Jetty, s5Lantern, s5Camera, s5Flask, s5FlaskCup, s5Bottle, s5Sonar, s5SonarBack,
  S5_BOTTLE_SCROLL, S5_SONAR_SCREEN, type NaturalKey,
} from './objects';
import { BY_ID } from './wardrobe';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// science-foundations-5, "Could It Be Wrong?" — A MISTY SCOTTISH LOCH AT NIGHT.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The monster hunter (the bun) sits in the stern
// of a rowing boat with a camera on a long white lens; her friend (the cap) rows and
// minds the sonar; the scientist (the top hat) comes out along the jetty with a lamp.
//
//   b0   the friend rows the boat out from the jetty, two strokes and a glide; she aims
//        the camera at the water ahead.
//   b1   he ships the oar along the gunwale and turns the sonar round to her: its screen
//        is a flat green line under a sweeping beam.
//   b2   she flicks a hand at the water, chin up, quite sure of herself.
//   b3   the scientist walks out along the jetty with a hurricane lantern and lifts it
//        toward them; she turns to him.
//   b4   the lamp comes down; one finger up, then the hand turned palm down.
//   b5   Q1, CATCH A BOTTLE: three bottles adrift in front of the boat, each with a claim
//        rolled up inside — tap one. The right one lifts out of the water, the others sink.
//   b6   she stands up in the boat and draws her hand out along "ten metres long": a pale
//        measuring line and the ghost of a ten-metre monster appear on the loch.
//   b7   he sweeps the lamp across the loch: its light slides over the water, end to end.
//   b8   the friend turns, takes his tartan flask off the foredeck, turns back, unscrews
//        the cup and pours; steam.
//   b9   DAWN, a month later. Q2, READ THE RESULTS: a line strung over the boat between
//        two poles with three results pegged on it — tap one. The right one is read (a
//        beam runs along its flat trace); the others droop off a peg.
//   b10  she stares at the flat sonar and scratches her head; he sips his tea.
//   b11  at ease under the quotation, the mist lifting.
//
// COMPOSITION, in stage units. The sky 266–404 (stars, and a moon at (140, 300)), the
// far hills 372–404 with a ruined tower on the right-hand headland (Urquhart,
// sci5-loch-1), the far water 404–448, the near water 448–506 and the shingle shore
// 506–514. The jetty −10–128 × 410–506, its deck top at 424, its mooring post at 121;
// its piles go down into the near water. The scientist stands on it at 92 (in from −40
// on b3). The rowing boat is 176 × 34, its gunwale at 431, its waterline at 448, its
// keel at 457; it rows out on b0 from a middle of 196 (its stern alongside the jetty's
// end) to 252 (164–340), and stays. In it: the hunter on the stern seat at middle −52
// (200), the sonar on its gunwale bracket at −26 (226, its screen 216–235 × 411–424),
// the friend on the thwart at +6 (258), facing her, the rowlock at −2 and the flask on
// the foredeck at +28. Seated, their pelvises are at 434, under the gunwale, so the hull
// hides their legs. Q1's bottles float in the near water, 100 × 30 each, at 54, 158,
// 262 × 482 (tap boxes 100 × 50); Q2's line runs between pole tops at middle ± 97,
// y 290, its three cards 56 × 56 at middle −64, 0, +64, tops at 298. Band [266, 514].
//
// SIMPLE ON PURPOSE (AP7): never more than two people moving at once; the two in the
// boat face each other, and she turns to the jetty while the scientist talks. A
// listener's life is his head (N21); a hand moves only to row, hold, pour, point or
// scratch (AP18), and every stroke plays at most twice (AR5).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('science');
const TR = 0.85;
/** 78 units of figure in a 248-unit band: 31%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, science-foundations-5), except b6 (she stands, measures
 * the water and sits again) and b8 (the turn, the flask, the cup and the pour), which
 * run on a little after their lines.
 */
const LINES = [5.07, 5.31, 4.16, 5.91, 6.72, 0, 4.3, 5.43, 6.2, 0, 3.93, 0, 0];

// The held poses (moves.ts act + 99), with still hands (AP18).
const TALK = 167;
const NOD = 263;
const WAIT = 161;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_ROW = is('row');
const A_SONAR = is('sonar');
const A_SHY = is('shy');
const A_JETTY = is('jetty');
const A_RISK = is('risk');
const A_COMMIT = is('commit');
const A_LOOK = is('look');
const A_FLASK = is('flask');
const A_MONTH = is('month');
const A_REST = is('rest');
const DAWN = BEATS.map((b) => b.dawn ?? 0);
const Q1 = BEATS.map((b) => (b.bottle ? 1 : 0));
const Q2 = BEATS.map((b) => (b.result ? 1 : 0));
const JETTY_N = A_JETTY.indexOf(1);
const SONAR_N = A_SONAR.indexOf(1);
const FLASK_N = A_FLASK.indexOf(1);
const RESULT_N = Q2.indexOf(1);
/** The results line goes up at dawn and stays. */
const LINE_ON = BEATS.map((_, k) => (k >= RESULT_N ? 1 : 0));

type Track = readonly (readonly number[])[];

// ── the place ────────────────────────────────────────────────────────────────
const FAR_TOP = 404;
const WATERLINE = 448;
const SHORE = 506;
const DECK = 424;
/** The floor of the boat, which the two in it are posed on. */
const FLOOR = 440;
/** A thwart sits low in a rowing boat: seated, the pelvis is at the gunwale, and standing she rises clear of it. */
const SEAT_H = 12;

// ── the boat, and where things are in it (from its middle) ──────────────────
const BOAT = { w: 176, h: 34, top: 424 };
/** The oar's loom, its thickness. */
const LOOM_T = 2.8;
const BOAT_CY = BOAT.top + BOAT.h / 2;
const GUNWALE = 431;
const BC0 = 196;
const BC1 = 252;
const BUN_DX = -52;
const CAP_DX = 6;
const SONAR_DX = -26;
const FLASK_DX = 28;
/** The rowlock the near oar pivots in. */
const PIVOT = { dx: -2, y: 430 };

// ── the oar: in the hands it is a line from the handle through the rowlock ──
/** The blade is this many times as far out as the handle is in. */
const OAR_K = 2.6;
/** The handle's place from the rowlock: forward at the catch, home at the finish. */
const CATCH_DX = -14;
const FIN_DX = 4;
/** The hands high in the drive (the blade deep), low in the recovery (the blade clear). */
const DRIVE_Y = 419;
const REC_Y = 425;
/** Shipped: laid along the gunwale, blade to the bow (from the boat's middle). */
const SHIP_H = { dx: -4, y: 428 };
const SHIP_B = { dx: 82, y: 426 };
/** The two strokes on b0, in seconds: each 1.24 long (AR5: two, then it rests). */
const STROKES = [0.3, 1.7];

// ── the scientist ───────────────────────────────────────────────────────────
const SC_OFF = -40;
const SC_X = 92;
/** His lamp hand at rest: the lantern hanging at his side, in front. */
const LAMP_REST = { dx: 9, y: 396 };

// ── the sizes things are drawn at, and their grips (objects.ts gives the shares) ─
const FLASK = { w: 7, h: 19 };
const FLASK_GRIP_Y = (19 / 32) * FLASK.h;
/** From the flask's grip up to where the cup sits on its stopper. */
const FLASK_TOP = -(FLASK_GRIP_Y - (1.5 / 32) * FLASK.h) - 1;
const CUPS = { w: 6, h: 4.8 };
const CAM = { w: 24, h: 10 };
const LAMP = { w: 11, h: 20 };
/** From the bail's top down to the flame, in the lantern as drawn. */
const FLAME_Y = ((19.5 - 1) / 32) * LAMP.h;
const SONAR = 18;

// ── the friend's flask and cup, in his own frame (+x in front of him) ───────
const FLASK_SEAT = { lx: FLASK_DX - CAP_DX, y: GUNWALE - (FLASK.h - FLASK_GRIP_Y) };
const FLASK_LAP = { lx: 9, y: 425 };
const CUP_CHEST = { lx: 13, y: 418 };
/** Pouring: the flask held up at his chest and tipped; the cup held under its mouth. */
const POUR_FLASK = { lx: 2, y: 408 };
const POUR_CUP = { lx: 13, y: 419 };

// ── the people's poses, beat by beat ────────────────────────────────────────
const SC_P = [NOD, NOD, NOD, TALK, TALK, WAIT, NOD, TALK, NOD, WAIT, NOD, NOD, NOD];
/** Seated listeners nod along (N21): 1 nods, 0 is busy. */
const BUN_NOD = [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1];
const CAP_NOD = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1];
/** Which way she faces, and when in the line she turns: to him in the boat, or to the jetty. */
const BUN_TURN: Track[] = BEATS.map((_, n) =>
  (n === JETTY_N ? [[0.1, -1]]
    : n > JETTY_N && n < FLASK_N ? [[0, -1]]
      : n === FLASK_N ? [[0.04, 1]]
        : [[0, 1]]));
const SC_LEGS: Track[] = BEATS.map((_, n) => (n < JETTY_N ? [[0, SC_OFF]] : [[0, SC_X]]));

// ── the objects, drawn about the point they are held or hung by ─────────────
const BACK_ART = s5BoatBack(0, 0, BOAT.w, BOAT.h);
const FRONT_ART = s5BoatFront(0, 0, BOAT.w, BOAT.h);
const JETTY_ART = s5Jetty(59, 458, 138, 96);
const LANTERN_ART = s5Lantern(0, LAMP.h / 2 - LAMP.h / 32, LAMP.w, LAMP.h);
const CAMERA_ART = s5Camera(CAM.w / 2 - (7 / 40) * CAM.w, CAM.h / 2 - (9 / 16) * CAM.h, CAM.w, CAM.h);
const FLASK_ART = s5Flask(0, FLASK.h / 2 - FLASK_GRIP_Y, FLASK.w, FLASK.h);
const CUP_ART = s5FlaskCup(0, CUPS.h / 2 - (4.5 / 8) * CUPS.h, CUPS.w, CUPS.h);
const SONAR_ART = s5Sonar(0, 0, SONAR, SONAR);
const SONAR_BACK_ART = s5SonarBack(0, 0, SONAR, SONAR);

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hand(s: Stance, x: number, gy: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: gy, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** Seated on a thwart, leaning by `lean` (+ back, − forward). Still (AL1): its life is in the head. */
function sitting(t: number, lean: number): Stance {
  'worklet';
  const s = seated(SEAT_H, t, 18);
  return { ...s, tilt: s.tilt + 0.12 * lean, neck: s.neck - 0.05 * lean };
}
/** Eased 0 → 1 over [a, z] SECONDS of the beat. */
function sm(b: number, a: number, z: number): number {
  'worklet';
  const u = (b - a) / (z - a);
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/** A listener's nod: the head dips and comes back, out of step with the others. */
function nodOf(t: number, ph: number): number {
  'worklet';
  return Math.max(0, Math.sin(t * 1.3 + ph));
}
/**
 * The handle's place from the rowlock `s` seconds into one stroke: the hands go forward
 * low (the blade back, clear of the water), lift to drop the blade in, pull home through
 * the drive, and drop to take it out.
 */
function strokeAt(s: number) {
  'worklet';
  if (s <= 0) return { x: FIN_DX, y: REC_Y };
  if (s < 0.35) return { x: lerp(FIN_DX, CATCH_DX, sm(s, 0, 0.35)), y: REC_Y };
  if (s < 0.47) return { x: CATCH_DX, y: lerp(REC_Y, DRIVE_Y, sm(s, 0.35, 0.47)) };
  if (s < 1.12) return { x: lerp(CATCH_DX, FIN_DX, sm(s, 0.47, 1.12)), y: DRIVE_Y };
  if (s < 1.24) return { x: FIN_DX, y: lerp(DRIVE_Y, REC_Y, sm(s, 1.12, 1.24)) };
  return { x: FIN_DX, y: REC_Y };
}
/** How far the boat has come on b0, 0 → 1: a surge with each stroke's drive, and a glide. */
function rowProgress(b: number): number {
  'worklet';
  return 0.5 * sm(b, STROKES[0] + 0.47, STROKES[0] + 2.0) + 0.5 * sm(b, STROKES[1] + 0.47, STROKES[1] + 2.1);
}
/**
 * Where a figure stands at time `b` of a beat (seconds), walking its legs in turn. He
 * starts from WHERE HE IS ON SCREEN (`src`), so a tap mid-walk never jumps (group L).
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
  return { x, x0, x1, u: ease01(u), walking, arrive: free };
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
/** A point offset (dx, dy) from a grip, turned with the thing by `deg`. */
function turned(dx: number, dy: number, deg: number) {
  'worklet';
  const a = (deg * Math.PI) / 180;
  return { x: dx * Math.cos(a) - dy * Math.sin(a), y: dx * Math.sin(a) + dy * Math.cos(a) };
}

export default function Sci5Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldC = useHeld();
  const heldS = useHeld();
  const cv = useCarry(23);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const trq = ease01(b / 0.3);
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the light, the boat ─────────────────────────────────────────────────
    const dawn = carry(cv, 0, n, DAWN[p], DAWN[n], ease01(b / 2.6));
    const mistNow = A_REST[n] ? st(0.1, 0.9) : 0;
    const lift = carry(cv, 1, n, mistNow, mistNow, tr);
    // on b0 the boat rows from where it is on screen out to the middle of the loch
    const bc = carry(cv, 2, n, BC0, BC1, A_ROW[n] ? rowProgress(b) : tr);
    const speed = A_ROW[n] ? clamp01((rowProgress(b + 0.08) - rowProgress(b)) * 9) : 0;
    const xB = bc + BUN_DX;
    const xC = bc + CAP_DX;
    const pv = { x: bc + PIVOT.dx, y: PIVOT.y };

    // ── the friend, on the thwart ───────────────────────────────────────────
    let dCnow = -1;
    if (A_FLASK[n]) dCnow = b < 0.9 ? facing(-1, 1, b - 0.05) : facing(1, -1, b - 1.3);
    const dC = carry(cv, 4, n, -1, dCnow, 1);
    /** A point in front of him, in his own frame: it turns with him (AR7.2). */
    const fr = (lx: number) => {
      'worklet';
      return xC + dC * lx;
    };
    let sc = sitting(t, 0);
    // the oar: rowing on b0, shipped along the gunwale from b1
    let hx = pv.x + FIN_DX;
    let hy = REC_Y;
    let shipNow = n > SONAR_N ? 1 : 0;
    let grip = n < SONAR_N ? 1 : 0;
    if (A_ROW[n]) {
      const s1 = strokeAt(b - (b < STROKES[1] ? STROKES[0] : STROKES[1]));
      hx = pv.x + s1.x;
      hy = s1.y;
      // leaning into the stroke: forward at the catch, back at the finish
      const reachU = (FIN_DX - s1.x) / (FIN_DX - CATCH_DX);
      sc = sitting(t, 0.9 - 2.4 * reachU);
    }
    if (A_SONAR[n]) {
      // the handle carried in to the gunwale and let go; then the sonar turned round to her
      const go = st(0.05, 0.24);
      hx = lerp(pv.x + FIN_DX, bc + SHIP_H.dx, go);
      hy = lerp(REC_Y, SHIP_H.y, go);
      shipNow = go;
      grip = 1 - st(0.26, 0.3);
    }
    if (grip > 0) {
      sc = hand(sc, xC, FLOOR, dC, 1, hx, hy, grip);
      sc = hand(sc, xC, FLOOR, dC, -1, hx + 3, hy + 0.5, grip);
    }
    let flipNow = n >= SONAR_N ? 1 : 0;
    if (A_SONAR[n]) {
      // a hand to the sonar's near corner, turning it round, and back to his lap
      sc = hand(sc, xC, FLOOR, dC, 1, bc + SONAR_DX + 8, 418, bp(0.34, 0.44, 0.86));
      flipNow = st(0.46, 0.7);
    }
    // the flask (b8): turned to the foredeck, picked up, turned back, the cup unscrewed
    // off its top, the tea poured, the flask stood in his lap; the cup held at his chest
    let flaskOn = n > FLASK_N ? 1 : 0;
    let cupOff = n > FLASK_N ? 1 : 0;
    let pour = 0;
    let twist = 0;
    let sipU = 0;
    if (A_FLASK[n]) {
      flaskOn = sm(b, 0.95, 1.02);
      const reachF = sm(b, 0.4, 0.92);
      const hold = sm(b, 1.0, 1.25);
      const toPour = sm(b, 2.75, 3.15) * (1 - sm(b, 4.6, 5.0));
      const toLap = sm(b, 5.0, 5.5);
      let lx = lerp(lerp(FLASK_LAP.lx, FLASK_SEAT.lx, reachF), 12, hold);
      let ly = lerp(lerp(FLASK_LAP.y, FLASK_SEAT.y, reachF), 416, hold);
      lx = lerp(lerp(lx, POUR_FLASK.lx, toPour), FLASK_LAP.lx, toLap);
      ly = lerp(lerp(ly, POUR_FLASK.y, toPour), FLASK_LAP.y, toLap);
      sc = hand(sc, xC, FLOOR, dC, 1, fr(lx), ly, sm(b, 0.35, 0.55));
      // the other hand: to the flask's top, a twist back and forth, the cup off to his chest
      const cupNear = sm(b, 1.75, 2.05);
      twist = Math.sin(Math.PI * 2 * clamp01((b - 2.05) / 0.5)) * (b < 2.55 ? 1 : 0);
      cupOff = sm(b, 2.55, 2.85);
      const cx = lerp(lx - 1, lerp(CUP_CHEST.lx, POUR_CUP.lx, toPour), cupOff);
      const cy = lerp(ly + FLASK_TOP, lerp(CUP_CHEST.y, POUR_CUP.y, toPour), cupOff);
      sc = hand(sc, xC, FLOOR, dC, -1, fr(cx), cy, cupNear);
      pour = sm(b, 3.1, 3.4) * (1 - sm(b, 4.4, 4.7));
    } else if (flaskOn > 0) {
      sc = hand(sc, xC, FLOOR, dC, 1, fr(FLASK_LAP.lx), FLASK_LAP.y, 1);
      let cx = fr(CUP_CHEST.lx);
      let cy = CUP_CHEST.y;
      if (A_MONTH[n]) {
        // one sip, in the pause after "a whole month of nothing" (AR3)
        sipU = sm(b, 1.25, 1.65) * (1 - sm(b, 2.3, 2.7));
        const lips = sipHandAt(sc, { x: xC, groundY: FLOOR, k: K, dir: -1 });
        cx = lerp(cx, lips.x, sipU);
        cy = lerp(cy, lips.y, sipU);
      }
      sc = hand(sc, xC, FLOOR, dC, -1, cx, cy, 1);
      if (sipU > 0) sc = sipHead(sc, sipU);
    }
    const nodC = carry(cv, 3, n, CAP_NOD[n], CAP_NOD[n], tr) * nodOf(t, 0.4);
    sc = { ...sc, neck: sc.neck + 0.2 * nodC, tilt: sc.tilt + 0.03 * nodC };
    const prevC = carryFrom(heldC, n, sitting(t, 0));
    const figC = keepHeld(heldC, mixStance(prevC, sc, tr));
    const cap = pose(figC, xC, FLOOR, K, dC, 1);

    // ── the hunter, in the stern, with her camera ───────────────────────────
    const dB = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, 1), BUN_TURN[n], b, L), 1);
    const standNow = A_COMMIT[n] ? st(0.02, 0.2) * (1 - st(0.84, 1)) : 0;
    const stand = carry(cv, 6, n, standNow, standNow, trq);
    let sb = sitting(t, A_REST[n] ? 0.8 : 0);
    if (stand > 0) sb = mixStance(sb, hHold(TALK, t), stand);
    // her back hand keeps the camera, resting in her lap (AR6)
    let camX = xB + 9 * dB;
    let camY = 424;
    let camR = 0;
    let fx = xB + 10 * dB;
    let fy = 427;
    let fw = 0;
    let look = 0;
    if (A_ROW[n]) {
      // up to her eye, the lens on the water ahead, and down again
      const aim = st(0.08, 0.24) * (1 - st(0.82, 0.96));
      camX = lerp(camX, xB + 7 * dB, aim);
      camY = lerp(camY, 395, aim);
      camR = 10 * aim;
      fx = xB + 20 * dB;
      fy = 398;
      fw = aim;
    }
    if (A_SHY[n]) {
      // one flick of the hand at the water: up, out and down past the gunwale, and back
      const up = st(0.16, 0.3);
      const out = st(0.3, 0.48);
      const back = st(0.7, 0.86);
      fx = lerp(lerp(lerp(xB + 10 * dB, xB + 17 * dB, up), xB + 25 * dB, out), xB + 10 * dB, back);
      fy = lerp(lerp(lerp(427, 409, up), 429, out), 427, back);
      fw = st(0.1, 0.16) * (1 - st(0.86, 0.94));
      look = 0.12 * st(0.5, 0.6) * (1 - st(0.9, 1));
    }
    if (A_COMMIT[n]) {
      // standing: the camera held at her chest, her hand drawn out from it along "ten
      // metres long", then pointed down at the loch, and sat down again
      camX = lerp(camX, xB + 7 * dB, stand);
      camY = lerp(camY, 403, stand);
      const along = st(0.28, 0.52);
      const down = st(0.58, 0.7);
      fx = lerp(lerp(xB + 9 * dB, xB + 25 * dB, along), xB + 22 * dB, down);
      fy = lerp(lerp(403, 399, along), 429, down);
      fw = st(0.2, 0.28) * (1 - st(0.78, 0.86));
    }
    if (A_MONTH[n]) {
      // staring at the flat screen, and a scratch of the head, once back and forth (AR5)
      look = -0.2 * st(0.05, 0.18);
      const rub = Math.sin(Math.PI * 2 * clamp01((b / L - 0.42) / 0.3));
      fx = xB + 2 * dB + 2.2 * rub;
      fy = 386;
      fw = st(0.32, 0.42) * (1 - st(0.78, 0.9));
    }
    sb = hand(sb, xB, FLOOR, dB, -1, camX, camY, 1);
    if (fw > 0) sb = hand(sb, xB, FLOOR, dB, 1, fx, fy, fw);
    const nodB = carry(cv, 7, n, BUN_NOD[n], BUN_NOD[n], tr) * nodOf(t, 2.1);
    sb = { ...sb, neck: sb.neck + 0.2 * nodB + look, tilt: sb.tilt + 0.03 * nodB };
    const prevB = carryFrom(heldB, n, sitting(t, 0));
    const figB = keepHeld(heldB, mixStance(prevB, sb, tr));
    const bun = pose(figB, xB, FLOOR, K, dB, 1);

    // ── the scientist, out along the jetty with his lamp ────────────────────
    const ws = legsOf(carrySource(cv, 8, n, SC_OFF), SC_LEGS[n], b, L);
    const xS = carry(cv, 8, n, ws.x, ws.x, 1);
    const dS = 1;
    let ss = ws.walking
      ? travelStance(ws.x0, ws.x1, hHold(SC_P[n], t), hHold(SC_P[n], t), hLive(SC_P[n], t, b), ws.u, WALK, 0)
      : hLive(SC_P[n], t, b);
    let lx = xS + LAMP_REST.dx;
    let ly = LAMP_REST.y;
    let poolU = -1;
    if (A_JETTY[n]) {
      // arrived, the lamp lifted out toward them and held there
      const up = sm(b, ws.arrive + 0.3, ws.arrive + 1.0);
      lx = lerp(lx, xS + 21, up);
      ly = lerp(ly, 362, up);
    }
    if (A_RISK[n]) {
      // the lamp comes down; the other hand: one finger up, then turned palm down
      const fin = st(0.14, 0.26);
      const flat = st(0.42, 0.56);
      const off = st(0.86, 0.96);
      lx = lerp(xS + 21, lx, st(0, 0.12));
      ly = lerp(362, ly, st(0, 0.12));
      ss = hand(ss, xS, DECK, dS, -1, lerp(xS + 12, xS + 20, flat), lerp(360, 391, flat), fin * (1 - off));
    }
    if (A_LOOK[n]) {
      // the lamp swept once across the loch, from the near water out to the far side
      const out = st(0.08, 0.22);
      const sweep = st(0.22, 0.78);
      const home = st(0.84, 0.97);
      lx = lerp(lerp(lx, xS + 19, out), xS + LAMP_REST.dx, home);
      ly = lerp(lerp(ly, lerp(390, 368, sweep), out), LAMP_REST.y, home);
      poolU = sweep * (1 - home);
    }
    ss = hand(ss, xS, DECK, dS, 1, lx, ly, 1);
    const prevS = carryFrom(heldS, n, hHold(SC_P[p], t));
    const figS = keepHeld(heldS, ws.walking ? mixKeepLegs(prevS, ss, tr) : mixStance(prevS, ss, tr));
    const sci = pose(figS, xS, DECK, K, dS, 1);

    // ── the things in hands, on the wrists every frame (AR7.4) ──────────────
    const wBL = wristOf(bun, 'wrL');
    const wCR = wristOf(cap, 'wrR');
    const wCL = wristOf(cap, 'wrL');
    const wSR = wristOf(sci, 'wrR');
    const camRv = carry(cv, 9, n, camR, camR, trq);

    // the oar: a line from the handle through the rowlock, or laid along the gunwale
    const shipped = carry(cv, 10, n, shipNow, shipNow, trq);
    const inHand = carry(cv, 11, n, grip, grip, trq);
    const H = { x: lerp(bc + SHIP_H.dx, wCR.x, inHand), y: lerp(SHIP_H.y, wCR.y, inHand) };
    const rowB = { x: pv.x + (pv.x - H.x) * OAR_K, y: pv.y + (pv.y - H.y) * OAR_K };
    const B = { x: lerp(rowB.x, bc + SHIP_B.dx, shipped), y: lerp(rowB.y, SHIP_B.y, shipped) };

    // the flask and its cup: the flask stands on the foredeck until he takes it
    const flaskHeld = carry(cv, 12, n, flaskOn, flaskOn, trq);
    const fTilt = carry(cv, 13, n, pour, pour, trq);
    const fRot = -100 * fTilt * (dC < 0 ? 1 : -1);
    const seatX = bc + FLASK_DX;
    const flask = {
      x: lerp(seatX, wCR.x, flaskHeld), y: lerp(FLASK_SEAT.y, wCR.y, flaskHeld), o: 1, r: fRot, s: 1,
    };
    const top = turned(0, FLASK_TOP, fRot);
    const cupFree = carry(cv, 14, n, cupOff, cupOff, trq);
    const sipV = carry(cv, 15, n, sipU, sipU, trq);
    const cup = {
      x: lerp(flask.x + top.x, wCL.x, cupFree),
      y: lerp(flask.y + top.y, wCL.y, cupFree),
      o: 1,
      r: lerp(fRot + 180, sipTilt(sipV, -1) + 8 * twist, cupFree),
      s: 1,
    };
    const steamNow = n > FLASK_N ? 1 : A_FLASK[n] ? sm(b, 3.6, 4.2) : 0;

    // the sonar's screen turned round to her
    const flip = carry(cv, 16, n, flipNow, flipNow, trq);
    // the ghost of the monster she describes (b6), gone again early in b7
    const ghostNow = A_COMMIT[n] ? st(0.3, 0.55) : 0;

    return {
      t, cap, bun, sci,
      dawn, lift, bc, speed,
      oar: { hx: H.x, hy: H.y, bx: B.x, by: B.y, wet: clamp01((B.y - WATERLINE) / 6) * (1 - shipped) },
      camera: { x: wBL.x, y: wBL.y, o: 1, r: camRv, s: dB },
      lantern: { x: wSR.x, y: wSR.y, o: 1, r: 0, s: 1 },
      flask, cup,
      steam: carry(cv, 17, n, steamNow, steamNow, tr),
      flip,
      stream: carry(cv, 18, n, pour, pour, trq),
      ghost: carry(cv, 19, n, ghostNow, ghostNow, A_COMMIT[n] ? 1 : tr),
      pool: carry(cv, 20, n, poolU, poolU, A_LOOK[n] ? 1 : tr),
      scOn: clamp01((xS + 30) / 20),
      q1: carry(cv, 21, n, Q1[p], Q1[n], ease01(b / 0.45)),
      line: carry(cv, 22, n, LINE_ON[p], LINE_ON[n], ease01(b / 1.4)),
    };
  });

  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.bun);
  const DS = useDerivedValue<Bundle>(() => SCENE.value.sci);

  return (
    <View style={styles.scene}>
      <Sky S={SCENE} />
      <Band S={SCENE} night="s5Far" day="s5DawnLoch" style={styles.farWater} />
      <Mist S={SCENE} />
      <ObjectArt parts={JETTY_ART} tone={TONE} />
      {/* cast: tophat */}
      <Stickman D={DS} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      <Lantern S={SCENE} />
      <NearWater S={SCENE} />
      <Boat S={SCENE} part="back" />
      {on(LINE_ON) ? <ResultLine S={SCENE} picked={picked} live={Q2[i] === 1} /> : null}
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <Boat S={SCENE} part="front" />
      <InBoat S={SCENE} />
      <Oar S={SCENE} />
      <Lip S={SCENE} />
      <Ghost S={SCENE} />
      <View style={styles.shore} pointerEvents="none" />
      {on(Q1) ? <Bottles S={SCENE} picked={picked} onPick={onPick} live={Q1[i] === 1} /> : null}
      {on(Q2) ? <ResultTargets S={SCENE} picked={picked} onPick={onPick} live={Q2[i] === 1} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held or hung by ──────────────

type At = { x: number; y: number; o: number; r?: number; s?: number };
function Rider({ at, art, children, behind }: {
  at: SharedValue<At>; art: ReturnType<typeof s5Flask>; children?: ReactNode; behind?: ReactNode;
}) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { scaleX: at.value.s ?? 1 }, { rotate: `${at.value.r ?? 0}deg` },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      {behind}
      <ObjectArt parts={art} tone={TONE} />
      {children}
    </Animated.View>
  );
}

/** A flat band whose colour goes from its night to its dawn. */
function Band({ S, night, day, style }: { S: SharedValue<any>; night: NaturalKey; day: NaturalKey; style: object }) {
  const st = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(S.value.dawn, [0, 1], [NATURAL[night].base, NATURAL[day].base]),
  }));
  return <Animated.View style={[style, st]} pointerEvents="none" />;
}

// ── the sky, the hills and the far shore ────────────────────────────────────

const STARS = [
  [22, 296, 1.6], [58, 310, 1.2], [96, 292, 1.4], [186, 300, 1.6], [214, 318, 1.1], [246, 294, 1.3],
  [282, 312, 1.6], [318, 292, 1.2], [352, 306, 1.5], [384, 320, 1.1], [30, 334, 1.1], [260, 340, 1.2],
  [370, 344, 1.3], [200, 336, 1.0],
];
function Twinkle({ S, from, ph }: { S: SharedValue<any>; from: number; ph: number }) {
  const st = useAnimatedStyle(() => ({ opacity: (1 - S.value.dawn) * (0.55 + 0.45 * Math.sin(S.value.t * 1.7 + ph)) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      {STARS.filter((_, k) => k % 3 === from).map(([x, y, r]) => (
        <View key={`${x}-${y}`} style={[styles.star, { left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: r }]} />
      ))}
    </Animated.View>
  );
}
const HILLS: [number, number, number, number, NaturalKey][] = [
  [110, 414, 300, 84, 's5Hill'],
  [334, 418, 250, 70, 's5Hill'],
  [38, 412, 170, 44, 's5HillNear'],
  [318, 410, 190, 28, 's5HillNear'],
];
function Sky({ S }: { S: SharedValue<any> }) {
  const moon = useAnimatedStyle(() => ({ opacity: 1 - 0.75 * S.value.dawn }));
  return (
    <>
      <Band S={S} night="s5Sky" day="s5DawnHigh" style={styles.skyTop} />
      <Band S={S} night="s5SkyLow" day="dawnSky" style={styles.skyMid} />
      <Band S={S} night="s5Haze" day="dawnGlow" style={styles.skyLow} />
      <Twinkle S={S} from={0} ph={0} />
      <Twinkle S={S} from={1} ph={2.1} />
      <Twinkle S={S} from={2} ph={4.2} />
      <Animated.View style={[styles.moon, moon]} pointerEvents="none">
        <View style={styles.moonShade} />
      </Animated.View>
      {HILLS.map(([x, y, w, h, night]) => (
        <Band
          key={`${x}`} S={S} night={night} day="s5DawnHill"
          style={[styles.hill, { left: x - w / 2, top: y - w / 2, width: w, height: w, borderRadius: w / 2, transform: [{ scaleY: h / w }] }]}
        />
      ))}
      <Castle S={S} />
    </>
  );
}
/** Urquhart's ruined tower on its headland, far off on the right. */
function Castle({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(S.value.dawn, [0, 1], [NATURAL.s5Castle.base, NATURAL.s5DawnHill.shade]),
  }));
  return (
    <>
      <Animated.View style={[styles.tower, st]} pointerEvents="none" />
      <Animated.View style={[styles.towerTop, st]} pointerEvents="none" />
      <Animated.View style={[styles.wall, st]} pointerEvents="none" />
    </>
  );
}

// ── the loch: the near water, and the light on it ───────────────────────────

const GLINTS = [
  [140, 410, 16, 0], [138, 418, 22, 1.3], [142, 427, 12, 2.2], [136, 438, 26, 0.6], [143, 454, 18, 1.8],
  [134, 466, 30, 2.9], [146, 480, 14, 0.9], [138, 494, 24, 2.4],
];
function Glint({ S, x, y, w, ph }: { S: SharedValue<any>; x: number; y: number; w: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    return {
      opacity: (1 - 0.7 * S.value.dawn) * (0.35 + 0.35 * Math.sin(t * 1.9 + ph)),
      transform: [{ translateX: 3 * Math.sin(t * 0.7 + ph * 1.7) }],
    };
  });
  return <Animated.View style={[styles.glint, { left: x - w / 2, top: y, width: w }, st]} pointerEvents="none" />;
}
/** The lamp's light on the water under it, and swept across the loch on b7. */
function NearWater({ S }: { S: SharedValue<any> }) {
  const under = useAnimatedStyle(() => {
    const l = S.value.lantern;
    const t = S.value.t;
    return {
      opacity: S.value.scOn * (1 - 0.7 * S.value.dawn) * (0.7 + 0.15 * Math.sin(t * 7.3)),
      transform: [{ translateX: l.x - 6 }],
    };
  });
  const sweep = useAnimatedStyle(() => {
    const u = S.value.pool;
    return {
      opacity: u < 0 ? 0 : 0.95 * Math.sin(Math.PI * Math.min(1, u)),
      transform: [{ translateX: 120 + 270 * Math.max(0, u) }],
    };
  });
  return (
    <>
      <Band S={S} night="s5Deep" day="s5DawnDeep" style={styles.nearWater} />
      {GLINTS.map(([x, y, w, ph]) => <Glint key={`${y}`} S={S} x={x} y={y} w={w} ph={ph} />)}
      <Animated.View style={[styles.lampStreak, under]} pointerEvents="none">
        {[0, 9, 19, 31].map((y, k) => (
          <View key={y} style={[styles.lampDash, { top: y, left: 6 - (12 - 2 * k) / 2, width: 12 - 2 * k }]} />
        ))}
      </Animated.View>
      <Animated.View style={[styles.lampSweep, sweep]} pointerEvents="none">
        <View style={[styles.lampDash, { left: 0, top: 0, width: 30 }]} />
        <View style={[styles.lampDash, { left: 8, top: 5, width: 22 }]} />
        <View style={[styles.lampDash, { left: 4, top: 10, width: 14 }]} />
      </Animated.View>
    </>
  );
}
/** Mist on the water, drifting slowly; thinner at dawn, and lifting under the quotation. */
const MISTS = [
  [60, 384, 240, 12, 0.24, 0], [300, 392, 260, 10, 0.2, 1.7], [150, 404, 320, 9, 0.22, 3.1], [330, 440, 200, 8, 0.14, 4.4],
];
function MistBand({ S, x, y, w, h, a, ph }: { S: SharedValue<any>; x: number; y: number; w: number; h: number; a: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const lift = S.value.lift;
    return {
      opacity: a * (1 - 0.55 * S.value.dawn) * (1 - 0.8 * lift),
      transform: [{ translateX: 26 * Math.sin(t * 0.06 + ph) }, { translateY: -26 * lift }],
    };
  });
  return <Animated.View style={[styles.mist, { left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: h / 2 }, st]} pointerEvents="none" />;
}
function Mist({ S }: { S: SharedValue<any> }) {
  return <>{MISTS.map(([x, y, w, h, a, ph]) => <MistBand key={`${x}-${y}`} S={S} x={x} y={y} w={w} h={h} a={a} ph={ph} />)}</>;
}

// ── the lantern, its flame and its glow ─────────────────────────────────────
function Lantern({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => S.value.lantern);
  const glow = useAnimatedStyle(() => ({ opacity: (1 - 0.6 * S.value.dawn) * (0.3 + 0.06 * Math.sin(S.value.t * 9.1)) }));
  const flame = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 + 0.18 * Math.sin(S.value.t * 11.3) }] }));
  return (
    <Rider at={at} art={LANTERN_ART} behind={<Animated.View style={[styles.glow, glow]} />}>
      <Animated.View style={[styles.flame, flame]} />
    </Rider>
  );
}

// ── the boat ────────────────────────────────────────────────────────────────
function Boat({ S, part }: { S: SharedValue<any>; part: 'back' | 'front' }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.bc }, { translateY: BOAT_CY }] }));
  const wake = useAnimatedStyle(() => ({ opacity: 0.6 * S.value.speed }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      {part === 'front' ? <Animated.View style={[styles.wake, wake]} /> : null}
      <ObjectArt parts={part === 'back' ? BACK_ART : FRONT_ART} tone={TONE} />
    </Animated.View>
  );
}
/** The water's surface laid over the hull below its waterline, and over a dipped blade. */
function Lip({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(S.value.dawn, [0, 1], [NATURAL.s5Deep.base, NATURAL.s5DawnDeep.base]),
    transform: [{ translateX: S.value.bc }],
  }));
  return <Animated.View style={[styles.lip, st]} pointerEvents="none" />;
}
/** The near oar: a varnished loom from the handle through the rowlock to its blade. */
function Oar({ S }: { S: SharedValue<any> }) {
  const loom = useAnimatedStyle(() => {
    const o = S.value.oar;
    const dx = o.bx - o.hx;
    const dy = o.by - o.hy;
    return {
      width: Math.hypot(dx, dy),
      transform: [{ translateX: o.hx }, { translateY: o.hy - LOOM_T / 2 }, { rotate: `${Math.atan2(dy, dx)}rad` }],
    };
  });
  const blade = useAnimatedStyle(() => {
    const o = S.value.oar;
    const a = Math.atan2(o.by - o.hy, o.bx - o.hx);
    return {
      transform: [{ translateX: o.bx - 8 * Math.cos(a) - 8 }, { translateY: o.by - 8 * Math.sin(a) - 2.4 }, { rotate: `${a}rad` }],
    };
  });
  // where the blade is in the water, the water rings round the loom
  const ring = useAnimatedStyle(() => {
    const o = S.value.oar;
    const a = Math.atan2(o.by - o.hy, o.bx - o.hx);
    const cross = Math.abs(Math.tan(a)) > 0.05 ? o.hx + (WATERLINE - o.hy) / Math.tan(a) : o.bx;
    return { opacity: 0.75 * o.wet, transform: [{ translateX: cross - 9 }, { scaleX: 0.8 + 0.4 * o.wet }] };
  });
  return (
    <>
      <Animated.View style={[styles.ripple, ring]} pointerEvents="none" />
      <Animated.View style={[styles.loom, loom]} pointerEvents="none" />
      <Animated.View style={[styles.blade, blade]} pointerEvents="none" />
    </>
  );
}

/** What is in the boat with them: the sonar, the camera, the flask and the cup. */
/** The sonar's screen as drawn, from its case's top left. */
const SCR = {
  x0: (S5_SONAR_SCREEN.x0 / 24) * SONAR, y0: (S5_SONAR_SCREEN.y0 / 24) * SONAR,
  x1: (S5_SONAR_SCREEN.x1 / 24) * SONAR, y1: (S5_SONAR_SCREEN.y1 / 24) * SONAR,
};
const SCREEN_W = SCR.x1 - SCR.x0;
const SCREEN_H = SCR.y1 - SCR.y0;
function InBoat({ S }: { S: SharedValue<any> }) {
  const sonarAt = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.bc + SONAR_DX }, { translateY: GUNWALE - SONAR / 2 }] }));
  const back = useAnimatedStyle(() => {
    const f = S.value.flip;
    return { opacity: f < 0.5 ? 1 : 0, transform: [{ scaleX: Math.max(0.02, 1 - 2 * f) }] };
  });
  const face = useAnimatedStyle(() => {
    const f = S.value.flip;
    return { opacity: f < 0.5 ? 0 : 1, transform: [{ scaleX: Math.max(0.02, 2 * f - 1) }] };
  });
  const sweep = useAnimatedStyle(() => {
    const u = (S.value.t * 0.45) % 1;
    return { transform: [{ translateX: u * (SCREEN_W - 2.2) }] };
  });
  const cam = useDerivedValue<At>(() => S.value.camera);
  const flask = useDerivedValue<At>(() => S.value.flask);
  const cup = useDerivedValue<At>(() => S.value.cup);
  const steam = useAnimatedStyle(() => {
    const t = S.value.t;
    return { opacity: S.value.steam * (0.45 + 0.2 * Math.sin(t * 2.3)), transform: [{ translateY: -2 * ((t * 0.8) % 1) }] };
  });
  const stream = useAnimatedStyle(() => ({ opacity: S.value.stream > 0.6 ? 1 : 0 }));
  return (
    <>
      <Animated.View style={[styles.rider, sonarAt]} pointerEvents="none">
        <Animated.View style={[styles.rider, back]}>
          <ObjectArt parts={SONAR_BACK_ART} tone={TONE} />
        </Animated.View>
        <Animated.View style={[styles.rider, face]}>
          <ObjectArt parts={SONAR_ART} tone={TONE} />
          <View style={styles.screen}>
            <View style={styles.bedLine} />
            <View style={styles.bedLineLow} />
            <Animated.View style={[styles.sweep, sweep]} />
          </View>
        </Animated.View>
      </Animated.View>
      <Rider at={flask} art={FLASK_ART} />
      <Rider at={cup} art={CUP_ART}>
        <Animated.View style={[styles.pourStream, stream]} />
        <Animated.View style={[styles.steamA, steam]} />
        <Animated.View style={[styles.steamB, steam]} />
      </Rider>
      <Rider at={cam} art={CAMERA_ART} />
    </>
  );
}

// ── her claim, drawn on the water: a measuring line and the ghost of a monster ─
function Ghost({ S }: { S: SharedValue<any> }) {
  const line = useAnimatedStyle(() => ({ opacity: Math.min(1, S.value.ghost * 3), transform: [{ scaleX: S.value.ghost }] }));
  const body = useAnimatedStyle(() => ({ opacity: 0.85 * clamp01((S.value.ghost - 0.35) / 0.65) }));
  const plate = useAnimatedStyle(() => ({ opacity: clamp01((S.value.ghost - 0.6) / 0.4) }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.ghostWrap, body]}>
        <LessonPicture name="sci5-monster" />
      </Animated.View>
      <Animated.View style={[styles.measure, line]}>
        <View style={styles.measureEndL} />
        <View style={styles.measureEndR} />
      </Animated.View>
      <Animated.View style={[styles.measurePlate, plate]}>
        <Text style={styles.measureText} numberOfLines={1}>10 METRES</Text>
      </Animated.View>
    </View>
  );
}

// ── answers: the picked thing reacts first, the rest half a second after ─────

/** How far one thing's answer reaction has gone, 0 → 1. */
function phaseOf(ans: number, who: number, k: number): number {
  'worklet';
  if (who < 0) return 0;
  const start = who === k ? 0 : 0.5;
  const u = (ans * 1.8 - start) / 0.9;
  return u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
}
/** The answer, latched: once a thing is picked, the scene keeps what it did. */
function useAnswer(picked: string | null, live: boolean, ids: string[]) {
  const first = live && picked !== null ? ids.indexOf(picked) : -1;
  const ans = useSharedValue(first >= 0 ? 1 : 0);
  const who = useSharedValue(first);
  useEffect(() => {
    if (!live || picked === null) return;
    const k = ids.indexOf(picked);
    if (k < 0 || who.value >= 0) return;
    who.value = k;
    ans.value = withTiming(1, { duration: 1800, easing: Easing.linear });
  }, [picked, live]);
  return { ans, who };
}

// ── the first question: CATCH A BOTTLE ───────────────────────────────────────

const BOTTLES: { id: string; x: number; y: number; rot: number; glass: NaturalKey; l1: string; l2: string; correct: boolean }[] = [
  { id: 'invisible', x: 54, y: 482, rot: -5, glass: 's5BlueGlass', l1: 'she’s', l2: 'invisible', correct: false },
  { id: 'tenMetres', x: 158, y: 484, rot: 3, glass: 's5Amber', l1: 'she’s ten', l2: 'metres long', correct: true },
  { id: 'hides', x: 262, y: 481, rot: -3, glass: 's5SeaGlass', l1: 'she hides', l2: 'when watched', correct: false },
];
const BOTTLE_ART = BOTTLES.map((q) => s5Bottle(0, 0, 100, 30, q.glass));
/** The message inside the body: the bottle's own scroll box, opened up a little to hold two lines. */
const SCROLL = {
  left: S5_BOTTLE_SCROLL.x0 - 50 - 2.5, top: S5_BOTTLE_SCROLL.y0 - 15 - 1.6,
  w: S5_BOTTLE_SCROLL.x1 - S5_BOTTLE_SCROLL.x0 + 4, h: S5_BOTTLE_SCROLL.y1 - S5_BOTTLE_SCROLL.y0 + 3.2,
};
function Bottle({ S, k, ans, who }: { S: SharedValue<any>; k: number; ans: SharedValue<number>; who: SharedValue<number> }) {
  const q = BOTTLES[k];
  // the right one is lifted clear of the water and levels out; a wrong one sinks
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const u = phaseOf(ans.value, who.value, k);
    const bob = 2.4 * Math.sin(t * 1.6 + k * 2.1);
    const rise = q.correct ? 15 * u + 9 * Math.sin(Math.PI * u) : -26 * u;
    return {
      opacity: S.value.q1 * (q.correct ? 1 : 1 - 0.95 * u),
      transform: [
        { translateX: q.x }, { translateY: q.y + bob * (1 - u) - rise },
        { rotate: `${(q.rot + 2 * Math.sin(t * 1.1 + k)) * (q.correct ? 1 - u : 1) + (q.correct ? 0 : -38 * u)}deg` },
        { scale: q.correct ? 1 + 0.12 * Math.sin(Math.PI * u) : 1 },
      ],
    };
  });
  const drops = useAnimatedStyle(() => {
    const u = phaseOf(ans.value, who.value, k);
    return { opacity: q.correct ? Math.sin(Math.PI * u) : 0, transform: [{ translateY: 10 * u }] };
  });
  const bubbles = useAnimatedStyle(() => {
    const u = phaseOf(ans.value, who.value, k);
    return { opacity: q.correct ? 0 : S.value.q1 * Math.sin(Math.PI * u), transform: [{ translateY: -14 * u }] };
  });
  const surface = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <>
      <Animated.View style={[styles.rider, st]} pointerEvents="none">
        <ObjectArt parts={BOTTLE_ART[k]} tone={TONE} />
        <View style={[styles.scroll, { left: SCROLL.left, top: SCROLL.top, width: SCROLL.w, height: SCROLL.h }]}>
          <Text style={styles.scrollText} numberOfLines={1}>{q.l1}</Text>
          <Text style={styles.scrollText} numberOfLines={1}>{q.l2}</Text>
        </View>
        <Animated.View style={[styles.drops, drops]}>
          <View style={[styles.drop, { left: -30 }]} />
          <View style={[styles.drop, { left: 4, top: 4 }]} />
          <View style={[styles.drop, { left: 32, top: 2 }]} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.surface, { left: q.x - 54, top: q.y + 15.5 }, surface]} pointerEvents="none">
        <Band S={S} night="s5Deep" day="s5DawnDeep" style={styles.surfaceFill} />
      </Animated.View>
      <Animated.View style={[styles.bubbles, { left: q.x - 6, top: q.y + 2 }, bubbles]} pointerEvents="none">
        <View style={[styles.bubble, { left: 0, top: 6 }]} />
        <View style={[styles.bubble, { left: 8, top: 0, width: 5, height: 5 }]} />
        <View style={[styles.bubble, { left: 4, top: -8, width: 3, height: 3 }]} />
      </Animated.View>
    </>
  );
}
function Bottles({ S, picked, onPick, live }: { S: SharedValue<any>; picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean }) {
  const answered = picked !== null || !live;
  const { ans, who } = useAnswer(picked, live, BOTTLES.map((q) => q.id));
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <>
      {BOTTLES.map((q, k) => <Bottle key={q.id} S={S} k={k} ans={ans} who={who} />)}
      <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
        {BOTTLES.map((q) => (
          <Target
            key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={12}
            disabled={answered} sealAt="tr"
            style={{ position: 'absolute', left: q.x - 50, top: q.y - 25, width: 100, height: 50 }}
          >
            <View style={styles.clear} />
          </Target>
        ))}
      </Animated.View>
    </>
  );
}

// ── the second question: READ THE RESULTS ────────────────────────────────────

const CARD = { w: 56, h: 56, top: 298 };
const POLE = { half: 97, top: 290, foot: 84 };
const CARDS: { id: string; dx: number; l1: string; l2: string; correct: boolean }[] = [
  { id: 'emptySonar', dx: -64, l1: 'a month of', l2: 'empty sonar', correct: true },
  { id: 'blurryPhoto', dx: 0, l1: 'blurry', l2: 'photo', correct: false },
  { id: 'fishermansStory', dx: 64, l1: 'fisherman’s', l2: 'story', correct: false },
];
function Card({ S, k, ans, who }: { S: SharedValue<any>; k: number; ans: SharedValue<number>; who: SharedValue<number> }) {
  const q = CARDS[k];
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const u = phaseOf(ans.value, who.value, k);
    const sway = 1.4 * Math.sin(t * 0.9 + k * 1.9);
    // the right one is lifted and read; a wrong one lets go of its left peg and droops
    return {
      transform: q.correct
        ? [{ translateY: -9 * u - 5 * Math.sin(Math.PI * u) }, { rotate: `${sway * (1 - u)}deg` }, { scale: 1 + 0.16 * u }]
        : [{ translateX: 19 }, { rotate: `${sway - 34 * u}deg` }, { translateX: -19 }, { translateY: 12 * u }],
      opacity: q.correct ? 1 : 1 - 0.35 * u,
    };
  });
  const read = useAnimatedStyle(() => {
    const u = phaseOf(ans.value, who.value, k);
    return { opacity: q.correct && u > 0 && u < 1 ? 1 : 0, transform: [{ translateX: 44 * u }] };
  });
  const lit = useAnimatedStyle(() => ({ transform: [{ scaleX: q.correct ? phaseOf(ans.value, who.value, k) : 0 }] }));
  const pegL = useAnimatedStyle(() => ({ opacity: q.correct ? 1 : 1 - phaseOf(ans.value, who.value, k) }));
  return (
    <Animated.View style={[styles.card, { left: q.dx - CARD.w / 2 }, k === 2 ? styles.cardNote : null, st]}>
      <View style={[styles.pic, k === 1 ? styles.picPhoto : k === 2 ? styles.picNote : null]}>
        {k === 0 ? (
          <>
            <View style={styles.trace} />
            <Animated.View style={[styles.traceLit, lit]} />
            <Animated.View style={[styles.readBeam, read]} />
            {[0, 1, 2, 3, 4, 5].map((d) => <View key={d} style={[styles.night, { left: 3 + d * 8 }]} />)}
          </>
        ) : k === 1 ? (
          <>
            <View style={styles.blurA} />
            <View style={styles.blurB} />
            <View style={styles.blurC} />
          </>
        ) : (
          <>
            <View style={styles.sketchHumpA} />
            <View style={styles.sketchHumpB} />
            <View style={styles.sketchNeck} />
            <View style={styles.sketchWater} />
          </>
        )}
      </View>
      <Text style={styles.cardText} numberOfLines={1}>{q.l1}</Text>
      <Text style={styles.cardText} numberOfLines={1}>{q.l2}</Text>
      <Animated.View style={[styles.peg, { left: 7 }, pegL]} />
      <View style={[styles.peg, { left: CARD.w - 11 }]} />
    </Animated.View>
  );
}
/** The line over the boat: two poles, a sagging line, three results pegged on it. */
function ResultLine({ S, picked, live }: { S: SharedValue<any>; picked: string | null; live: boolean }) {
  const { ans, who } = useAnswer(picked, live, CARDS.map((q) => q.id));
  const at = useAnimatedStyle(() => ({ opacity: S.value.line }));
  return (
    <Animated.View style={[styles.lineAt, at]} pointerEvents="none">
      <View style={[styles.pole, { left: -POLE.foot - 1.4, transform: [{ rotate: '-5deg' }] }]} />
      <View style={[styles.pole, { left: POLE.foot - 1.4, transform: [{ rotate: '6deg' }] }]} />
      <View style={styles.lineL} />
      <View style={styles.lineR} />
      {CARDS.map((q, k) => <Card key={q.id} S={S} k={k} ans={ans} who={who} />)}
    </Animated.View>
  );
}
function ResultTargets({ S, picked, onPick, live }: { S: SharedValue<any>; picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.line }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {CARDS.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: BC1 + q.dx - CARD.w / 2, top: CARD.top, width: CARD.w, height: CARD.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  skyTop: { position: 'absolute', left: 0, right: 0, top: 200, height: 322 - 200 },
  skyMid: { position: 'absolute', left: 0, right: 0, top: 322, height: 50 },
  skyLow: { position: 'absolute', left: 0, right: 0, top: 372, height: FAR_TOP - 372 },
  star: { position: 'absolute', backgroundColor: NATURAL.s5Moon.base },
  moon: {
    position: 'absolute', left: 128, top: 298, width: 22, height: 22, borderRadius: 11,
    backgroundColor: NATURAL.s5Moon.base, overflow: 'hidden',
  },
  moonShade: { position: 'absolute', left: 12, top: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: NATURAL.s5Moon.shade },
  hill: { position: 'absolute' },
  tower: { position: 'absolute', left: 352, top: 380, width: 9, height: 22, borderTopLeftRadius: 1, borderTopRightRadius: 1 },
  towerTop: { position: 'absolute', left: 351, top: 377, width: 3, height: 4 },
  wall: { position: 'absolute', left: 340, top: 394, width: 34, height: 8, borderTopLeftRadius: 2 },
  farWater: { position: 'absolute', left: 0, right: 0, top: FAR_TOP, height: WATERLINE - FAR_TOP },
  nearWater: { position: 'absolute', left: 0, right: 0, top: WATERLINE, height: SHORE - WATERLINE + 2 },
  glint: { position: 'absolute', height: 1.6, borderRadius: 0.8, backgroundColor: NATURAL.s5Moon.base },
  mist: { position: 'absolute', backgroundColor: NATURAL.cloudWhite.base },
  lampStreak: {
    position: 'absolute', left: 0, top: WATERLINE + 3, width: 12, height: 40,
  },
  lampDash: { position: 'absolute', height: 1.8, borderRadius: 0.9, backgroundColor: NATURAL.s5Flame.base },
  lampSweep: {
    position: 'absolute', left: -15, top: 460, width: 30, height: 12,
  },
  glow: {
    position: 'absolute', left: -15, top: FLAME_Y - 15, width: 30, height: 30, borderRadius: 15,
    backgroundColor: NATURAL.s5Flame.base,
  },
  flame: {
    position: 'absolute', left: -1.2, top: FLAME_Y - 2.4, width: 2.4, height: 4, borderRadius: 1.2,
    backgroundColor: NATURAL.s5Flame.base, transformOrigin: '50% 100%',
  },
  wake: {
    position: 'absolute', left: -BOAT.w / 2 - 34, top: 6, width: 40, height: 1.6, borderRadius: 0.8,
    backgroundColor: NATURAL.s5Moon.base,
  },
  lip: { position: 'absolute', left: -BOAT.w / 2 - 6, top: WATERLINE + 0.5, width: BOAT.w + 12, height: 12, opacity: 0.86 },
  loom: {
    position: 'absolute', left: 0, top: 0, height: LOOM_T, borderRadius: LOOM_T / 2,
    backgroundColor: NATURAL.wood.base, transformOrigin: '0% 50%',
  },
  ripple: {
    position: 'absolute', left: 0, top: WATERLINE - 1.5, width: 18, height: 4, borderRadius: 2,
    borderWidth: 1, borderColor: NATURAL.s5Moon.base,
  },
  blade: {
    position: 'absolute', left: 0, top: 0, width: 16, height: 4.8, borderRadius: 2.4,
    backgroundColor: NATURAL.wood.base, borderWidth: 0.6, borderColor: INK,
  },
  screen: {
    position: 'absolute', left: SCR.x0 - SONAR / 2 + 0.4, top: SCR.y0 - SONAR / 2 + 0.4,
    width: SCREEN_W - 0.8, height: SCREEN_H - 0.8, overflow: 'hidden', borderRadius: 1,
  },
  bedLine: { position: 'absolute', left: 0, right: 0, top: SCREEN_H - 4.6, height: 1.1, backgroundColor: NATURAL.s5Trace.base },
  bedLineLow: { position: 'absolute', left: 0, right: 0, top: SCREEN_H - 3.4, height: 2, backgroundColor: NATURAL.s5Trace.shade, opacity: 0.45 },
  sweep: { position: 'absolute', left: 0, top: 0, width: 1.2, height: SCREEN_H, backgroundColor: NATURAL.s5Trace.base, opacity: 0.8 },
  pourStream: {
    position: 'absolute', left: -0.7, top: -10, width: 1.4, height: 7, borderRadius: 0.7,
    backgroundColor: NATURAL.tea.base,
  },
  steamA: {
    position: 'absolute', left: -2.5, top: -10, width: 1.4, height: 6, borderRadius: 0.7,
    backgroundColor: NATURAL.cloudWhite.base, transform: [{ rotate: '-8deg' }],
  },
  steamB: {
    position: 'absolute', left: 1.5, top: -12, width: 1.2, height: 6, borderRadius: 0.6,
    backgroundColor: NATURAL.cloudWhite.base, transform: [{ rotate: '10deg' }],
  },
  ghostWrap: { position: 'absolute', left: 0, top: 450, width: STAGE_W, height: 42, overflow: 'hidden' },
  hump: {
    position: 'absolute', borderWidth: 1.4, borderStyle: 'dashed', borderColor: NATURAL.s5Moon.base,
  },
  ghostNeck: {
    position: 'absolute', left: 282, top: 3, width: 2.4, height: 24, borderRadius: 1.2,
    backgroundColor: NATURAL.s5Moon.base, opacity: 0.8, transform: [{ rotate: '22deg' }],
  },
  ghostHead: {
    position: 'absolute', left: 284, top: 1, width: 13, height: 6, borderRadius: 3,
    borderWidth: 1.2, borderStyle: 'dashed', borderColor: NATURAL.s5Moon.base,
  },
  ghostTail: {
    position: 'absolute', left: 54, top: 22, width: 40, height: 2, borderRadius: 1,
    backgroundColor: NATURAL.s5Moon.base, opacity: 0.7, transform: [{ rotate: '-6deg' }],
  },
  measure: {
    position: 'absolute', left: 50, top: 461, width: 300, height: 1.4, backgroundColor: NATURAL.s5Moon.base,
  },
  measureEndL: { position: 'absolute', left: -0.7, top: -4, width: 1.4, height: 9.4, backgroundColor: NATURAL.s5Moon.base },
  measureEndR: { position: 'absolute', right: -0.7, top: -4, width: 1.4, height: 9.4, backgroundColor: NATURAL.s5Moon.base },
  measurePlate: {
    position: 'absolute', left: 168, top: 454, width: 64, height: 15, borderRadius: 4,
    backgroundColor: PLATE_FACE, borderWidth: 1, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  measureText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  shore: floorStyle(TONE, SHORE),
  scroll: {
    position: 'absolute', backgroundColor: NATURAL.paper.base, borderRadius: 3, paddingHorizontal: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollText: {
    fontFamily: 'Caveat_700Bold', fontSize: 10.8, lineHeight: 11.6, color: INK, includeFontPadding: false, alignSelf: 'stretch', textAlign: 'center',
  },
  drops: { position: 'absolute', left: 0, top: 15, width: 0, height: 0 },
  drop: { position: 'absolute', top: 0, width: 2.4, height: 3.4, borderRadius: 1.2, backgroundColor: NATURAL.s5Moon.base },
  surface: { position: 'absolute', width: 108, height: 16 },
  surfaceFill: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 3 },
  bubbles: { position: 'absolute', width: 0, height: 0 },
  bubble: {
    position: 'absolute', width: 4, height: 4, borderRadius: 2, borderWidth: 0.8, borderColor: NATURAL.s5Moon.base,
  },
  clear: { flexGrow: 1 },
  lineAt: { position: 'absolute', left: BC1, top: 0, width: 0, height: 0 },
  pole: {
    position: 'absolute', top: POLE.top, width: 2.8, height: GUNWALE - POLE.top, borderRadius: 1.4,
    backgroundColor: NATURAL.wood.base, transformOrigin: '50% 100%',
  },
  lineL: {
    position: 'absolute', left: -POLE.half + 3, top: POLE.top + 6, width: POLE.half, height: 1,
    backgroundColor: NATURAL.s5Rope.shade, transform: [{ rotate: '1.4deg' }], transformOrigin: '0% 50%',
  },
  lineR: {
    position: 'absolute', left: 0, top: POLE.top + 8.4, width: POLE.half - 3, height: 1,
    backgroundColor: NATURAL.s5Rope.shade, transform: [{ rotate: '-1.4deg' }], transformOrigin: '0% 50%',
  },
  card: {
    position: 'absolute', top: CARD.top, width: CARD.w, height: CARD.h, borderRadius: 2.5,
    backgroundColor: NATURAL.paper.base, borderWidth: 1, borderColor: INK, alignItems: 'center',
    paddingTop: 4, transformOrigin: '50% 0%',
  },
  cardNote: { backgroundColor: NATURAL.yellowed.base },
  pic: {
    width: CARD.w - 8, height: 24, borderRadius: 1.5, backgroundColor: NATURAL.s5Screen.base, overflow: 'hidden',
    marginBottom: 2,
  },
  picPhoto: { backgroundColor: NATURAL.s5Photo.base },
  picNote: { backgroundColor: NATURAL.yellowed.base, borderWidth: 0.6, borderColor: NATURAL.yellowed.shade },
  trace: { position: 'absolute', left: 0, right: 0, top: 17, height: 1.2, backgroundColor: NATURAL.s5Trace.shade },
  traceLit: {
    position: 'absolute', left: 0, right: 0, top: 16.6, height: 2, backgroundColor: NATURAL.s5Trace.base,
    transformOrigin: '0% 50%',
  },
  readBeam: { position: 'absolute', left: 1, top: 0, width: 2, height: 25, backgroundColor: NATURAL.s5Trace.base, opacity: 0.9 },
  night: { position: 'absolute', top: 21, width: 1, height: 3, backgroundColor: NATURAL.s5Trace.shade },
  blurA: { position: 'absolute', left: 10, top: 8, width: 26, height: 12, borderRadius: 6, backgroundColor: NATURAL.s5Photo.shade, opacity: 0.6 },
  blurB: { position: 'absolute', left: 16, top: 10, width: 14, height: 8, borderRadius: 4, backgroundColor: NATURAL.s5CamBlack.base, opacity: 0.5 },
  blurC: { position: 'absolute', left: 0, right: 0, top: 18, height: 7, backgroundColor: NATURAL.s5Deep.base, opacity: 0.7 },
  sketchHumpA: {
    position: 'absolute', left: 8, top: 12, width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: INK,
  },
  sketchHumpB: {
    position: 'absolute', left: 21, top: 13, width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: INK,
  },
  sketchNeck: {
    position: 'absolute', left: 34, top: 6, width: 1.2, height: 13, backgroundColor: INK, transform: [{ rotate: '20deg' }],
  },
  sketchWater: { position: 'absolute', left: 3, right: 3, top: 18, height: 7, backgroundColor: NATURAL.yellowed.base },
  cardText: {
    fontFamily: 'Caveat_700Bold', fontSize: 11, lineHeight: 12, color: INK, includeFontPadding: false, alignSelf: 'stretch', textAlign: 'center',
  },
  peg: {
    position: 'absolute', top: -5, width: 4, height: 9, borderRadius: 1, backgroundColor: NATURAL.beech.base,
    borderWidth: 0.6, borderColor: INK,
  },
});

// The camera: the house follow, holding on the boat (it holds or pulls back; nothing big
// sits under it). It is also what lets measure-must read the stage (#stage-cam).
const FOLLOW = followMoves(BEATS.map(() => 224), BEATS.map(kindOf), seedOf('science'));

export function Sci5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Sci5Scene} band={[286, 514]} camera={FOLLOW} />;
}
