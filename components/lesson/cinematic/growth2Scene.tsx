import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withSequence, withTiming, withSpring, Easing, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './growth2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, seated, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE, PLATE_RADIUS, lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo, sipHandAt, sipTilt, sipHead, lipsAt } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, tint, kitchenWindow, kitchenUnit, splashback, wallClock, kettle, mug, jarLid, biscuit,
  fruitBowl, fruitBowlFront, chocolateBar, apple, notepad, pencil, LID_HINGE,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// personal-growth-foundations-2, "How Habits Work" — A KITCHEN AT THREE O'CLOCK.
//
// A DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody narrates.
// The man in the newsboy cap reaches for "just the one biscuit" every afternoon at
// three; his housemate (plain) has been keeping a tally; the coach (the top hat) walks
// in with a bowl of fruit and shows him the loop the habit runs on.
//
//   b0   the clock's minute hand reaches twelve; the cap lifts his mug of tea off the
//        worktop, turns, flips open the biscuit jar and takes one out.
//   b1   his housemate lifts the notepad off the table, adds a fifth stroke to the
//        tally on it and lays it down again; the cap nibbles his biscuit.
//   b2   the coach walks in from the left with a bowl of fruit, tips his hat, waves a
//        hand at the cap and then at the clock; the cap finishes the biscuit, turns to
//        him and steps back from the jar.
//   b3   the coach points at the clock, then the jar, then the mug in the cap's hand;
//        the cap raises his mug on "reward".
//   b4   Q1: the clock, the jar and his empty chair, each named on a plate — tap one.
//   b5   the cap carries his tea to his chair, sits, sets it down and leans back.
//   b6   the coach points at the clock and at the tea, walks to the worktop, closes
//        the jar's lid under his hand and sets the bowl down beside it.
//   b7   the coach walks back; the housemate leans back and folds his arms.
//   b8   the coach braces both hands against something heavy, strains, and lets go.
//   b9   Q2: the apple in the bowl, the chocolate bar on the table and the jar — tap one.
//   b10  the cap gets up, walks to the bowl, takes the apple and sits back down.
//   b11  the quotation; the cap sips his tea, the housemate taps his pencil.
//
// COMPOSITION, in stage units: the wall clock 113–143 × 357–387 over the tiled
// splashback 60–196 × 436–476 and the worktop 60–196, its top at 476 (his hip, AP10).
// On the worktop: the mug's place at 70, the clip-top biscuit jar 97–119 with its lid
// hinged at the back of its neck (119, 452), the bowl's place 139–173 (from b6) and the
// kettle 174–194. The window 258–322 × 363–421 over the table 248–332 × 464–500; the
// cap's chair 223–253 (seat at 486, he sits at 235) and the housemate's 327–357 (he
// sits at 345); the chocolate bar on the table at 298, his notepad at 324. The cap
// works the worktop at 86 and waits at 78; the coach stands at 22, closes the jar from
// 96 and sets the bowl from 132. Everything a hand takes is within the rig's safe reach
// (~23 units from the shoulder at K 0.76). Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still — a sip
// of tea, a pencil tapped on the table.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('personal-growth');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, personal-growth-foundations-2), except where the action
 * needs longer than the line and runs on after it — b6 (the walk to the worktop and
 * the lid), b7 (the walk back) and b10 (to the bowl and back to his chair).
 */
const LINES = [4.27, 4.45, 6.59, 6.25, 0, 5.6, 6.4, 4.2, 6.98, 0, 6.4, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
/** Waiting, alive: a listener on the quote beat, where 159 is nearly still (N21). */
const WAIT = 161;
const NOD = 263;
/** The chairs' seat, as the rig's pelvis height. */
const SEAT_H = 24;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_CHIME = is('chime');
const A_COUNT = is('count');
const A_ARRIVE = is('arrive');
const A_LOOP = is('loop');
const A_REWARD = is('reward');
const A_RULE = is('rule');
const A_JAB = is('jab');
const A_WILL = is('will');
const A_SWAP = is('swap');
const Q1 = BEATS.map((b) => (b.cue ? 1 : 0));
const Q2 = BEATS.map((b) => (b.reach ? 1 : 0));
/** The cap is sitting, beat by beat (b5 sits him down; b10 stands him up and back). */
const SITS = BEATS.map((_, n) => (n >= 6 ? 1 : 0));
/**
 * When he takes a sip of tea, in seconds into the beat (-1: not on this beat). A sip is
 * an EVENT, once in a line, at a pause in the talk (AR3, AR5) and never a clock: on b7
 * just after the housemate's "Willpower, I believe it's called.", and once on the
 * quotation.
 */
const SIP_AT = BEATS.map((b, n) => (n === 7 ? 2.9 : b.act === 'rest' ? 1.0 : -1));
/** The housemate nods along on every beat that is not his own line. */
const PL_NODS = BEATS.map((b) => (b.speaker === 'plain' ? 0 : 1));
/** And so does the cap, once he is in his chair, on every beat that is not his line. */
const CAP_NODS = BEATS.map((b, n) => (n >= 6 && b.speaker !== 'cap' ? 1 : 0));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended, and never before that. A turn is
// [fraction, facing]; it eases through a profile over 0.36s (cinematicKit.facing).
type Track = readonly (readonly number[])[];
const CAP_LEGS: Track[] = [
  [[0, 86]], [[0, 86]], [[0.3, 78]], [[0, 78]], [[0, 78]], [[0.04, 235]], [[0, 235]],
  [[0, 235]], [[0, 235]], [[0, 235]], [[0.08, 168], [0.38, 235]], [[0, 235]], [[0, 235]],
];
const CAP_TURN: Track[] = [
  [[0, -1], [0.48, 1]], [[0, 1]], [[0, 1], [0.3, -1]], [[0, -1]], [[0, -1]], [[0, 1]], [[0, 1]],
  [[0, 1]], [[0, 1]], [[0, 1]], [[0.06, -1], [0.34, 1]], [[0, 1]], [[0, 1]],
];
/** The coach is off the stage, left, until he walks in on b2. */
const TH_LEGS: Track[] = [
  [[0, -70]], [[0, -70]], [[0, 22]], [[0, 22]], [[0, 22]], [[0, 22]], [[0.42, 96], [0.76, 132]],
  [[0.1, 22]], [[0, 22]], [[0, 22]], [[0, 22]], [[0, 22]], [[0, 22]],
];
const TH_TURN: Track[] = [
  [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
  [[0.08, -1], [0.62, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
];
/** The housemate stays in his chair, facing the cap across the table. */
const PL_X = 345;
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const CAP_P = [TALK, LISTEN, LISTEN, NOD, LISTEN, TALK, LISTEN, NOD, LISTEN, LISTEN, TALK, WAIT, LISTEN];
const TH_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, LISTEN, NOD, EXPLAIN, LISTEN, EXPLAIN, LISTEN, NOD, WAIT, LISTEN];

// ── the kitchen ──────────────────────────────────────────────────────────────
const TOP = 476;                                      // the worktop, at his hip
const WORKTOP = { x: 128, w: 136 };
const CLOCK = { x: 128, y: 372, d: 30 };
/** The mug, drawn about its HANDLE so it can hang from a hand. */
const MUG_W = 11;
const MUG_H = 12;
const MUG_GRIP = (0.4 * MUG_W);                       // the handle, right of the mug's middle
const MUG_TOP = { x: 70, y: TOP - MUG_H / 2 };        // its place on the worktop
const MUG_TABLE = { x: 260, y: 474 - MUG_H / 2 };     // and on the table, by his chair
/** Where his hand holds the mug standing: at his chest, in front (pelvis-local units). */
const MUG_HOLD = { x: 11.8, y: -17.3 };
/** Where he holds his biscuit between bites: at his chest, below the shoulder (AR6). */
const BISCUIT_Y = 461;
/** The jar, and its lid hinged at the back of its neck. */
const JAR = { x: 108, y: 462, w: 22, h: 26 };
const LID = { w: 24, h: 9 };
const LID_X = JAR.x;                                  // the closed lid sits square on the neck
const LID_Y = 449.85;
const HINGE = {
  x: LID_X + ((LID_HINGE.x - 50) * LID.w) / 100,
  y: LID_Y + ((LID_HINGE.y - 50) * LID.h) / 100,
};
/** How far the lid swings open. */
const LID_OPEN = 80;
/** The bowl's place on the worktop, and the two apples in it, relative to the bowl. */
const BOWL = { x: 156, y: TOP - 9, w: 34, h: 18 };
const APPLE_IN = { x: -6, y: -8 };
const GREEN_IN = { x: 7, y: -7 };
/** The chocolate bar, lying on the table between his tea and the notepad. */
const CHOC = { x: 298, y: 471 };
/** The housemate's notepad, lying flat on the table, and the pencil he taps. */
const PAD = { x: 324, y: 474, w: 16, h: 20 };
const TAP = { x: 329, y: 473 };
/** The chairs and the table. */
const CHAIR_W = 30;
const CHAIR_H = 34;
const CAP_CHAIR = 238;
const PL_CHAIR = 342;

const WINDOW_ART = kitchenWindow(290, 392, 64, 58);
const SPLASH_ART = splashback(WORKTOP.x, 456, WORKTOP.w, 40);
const UNIT_ART = kitchenUnit(WORKTOP.x, 488, WORKTOP.w, 24);
const CLOCK_ART = wallClock(CLOCK.x, CLOCK.y, CLOCK.d, CLOCK.d);
const KETTLE_ART = kettle(184, TOP - 11, 20, 22);
const CHOC_ART = chocolateBar(CHOC.x, CHOC.y, 20, 7);
// The things that move are drawn about the point they are held or turned by.
const MUG_ART = mug(-MUG_GRIP, 0, MUG_W, MUG_H);
const LID_ART = jarLid(LID_X - HINGE.x, LID_Y - HINGE.y, LID.w, LID.h);
const BISCUIT_ART = biscuit(0, 0, 9, 9);
const BOWL_ART = fruitBowl(0, 0, BOWL.w, BOWL.h);
const BOWL_FRONT_ART = fruitBowlFront(0, 0, BOWL.w, BOWL.h);
const APPLE_ART = tint(apple(0, 0, 11, 11), 'apple');
const GREEN_ART = tint(apple(0, 0, 10, 10), 'appleGreen');
const PAD_ART = notepad(0, 0, PAD.w, PAD.h);
const PENCIL_ART = pencil(0, 0, 13, 3);

/**
 * AR4: the explaining pose (259) rests its FAR hand raised and 13 units behind the
 * spine, which side-on is an arm thrown back. A person explaining holds both hands in
 * front of him, so the far one comes forward to sit beside the near one.
 */
function inFront(code: number, s: Stance): Stance {
  'worklet';
  return code === EXPLAIN ? { ...s, fistL: { x: 8, y: -3 } } : s;
}
function hHold(code: number, t: number): Stance {
  'worklet';
  return inFront(code, emoteStill(code, t));
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return inFront(code, emoteStillLive(code, t, bt));
}
/**
 * A hand holding something against the body, in the figure's own frame (pelvis-local
 * units, +x forward, -y up): the thing rides WITH him as he walks and sits rather than
 * hanging at a fixed point on the stage while his body moves under it (AR6).
 */
function holdAt(s: Stance, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const cur = which > 0 ? s.fistR : s.fistL;
  const m = { x: lerp(cur.x, lx, w), y: lerp(cur.y, ly, w) };
  return which > 0 ? { ...s, fistR: m } : { ...s, fistL: m };
}
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A seated figure, leaning back by `lean`. Still (AL1): its life is in its hands. */
function sitting(t: number, lean: number): Stance {
  'worklet';
  const s = seated(SEAT_H, t, 18);
  return { ...s, tilt: s.tilt + 0.12 * lean, neck: s.neck - 0.06 * lean };
}
/**
 * One sip, `b` seconds into a beat whose sip starts at `s0`: `g` his hand going to the
 * mug's handle on the table (and, at the end, off it again), `u` the mug up at his lips:
 * up in 0.45s, held there about half a second, and back down onto the table (AR3).
 */
function sipPhase(b: number, s0: number) {
  'worklet';
  if (s0 < 0) return { g: 0, u: 0 };
  const k = (a: number, z: number) => {
    'worklet';
    const v = clamp01((b - s0 - a) / (z - a));
    return v * v * (3 - 2 * v);
  };
  return { g: k(0, 0.35) * (1 - k(1.85, 2.15)), u: k(0.35, 0.8) * (1 - k(1.35, 1.8)) };
}
/** The lid's front edge, swung `deg` open about its hinge. */
function lidEdge(deg: number, r: number) {
  'worklet';
  const a = (deg * Math.PI) / 180;
  return { x: HINGE.x - r * Math.cos(a), y: HINGE.y - r * Math.sin(a) };
}

/**
 * Where a figure stands at time `b` of a beat, walking its legs in turn. He starts
 * from WHERE HE IS ON SCREEN (`src`, out of the carry), never from where the script
 * left him, so a tap mid-walk or a step back cannot put him anywhere in one frame
 * (group L). A leg starts at its time or when the leg before it has finished,
 * whichever is later, so a longer first leg can never make the second one jump.
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
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(codes[n], t), hHold(codes[n], t), hLive(codes[n], t, b), w.u, WALK, 0)
    : hLive(codes[n], t, b);
}

/** A wrist's place on the stage, out of a figure's bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}

const CAM = followMoves(CAP_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('personal-growth'));

export default function Growth2Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldC = useHeld();
  const heldP = useHeld();
  const heldT = useHeld();
  const cv = useCarry(21);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the things whose state the hands follow ─────────────────────────────
    const lidNow = A_CHIME[n] ? LID_OPEN * st(0.6, 0.74)
      : A_RULE[n] ? LID_OPEN * (1 - st(0.64, 0.74))
        : n > 6 ? 0 : LID_OPEN;
    const lid = carry(cv, 0, n, lidNow, lidNow, tr);
    // the cap's seat: 0 standing · 1 sitting
    const seatNow = A_REWARD[n] ? st(0.55, 0.66)
      : A_SWAP[n] ? 1 - st(0, 0.08) + st(0.6, 0.72) : SITS[n];
    const seat = carry(cv, 1, n, seatNow, seatNow, tr);
    const leanNow = A_REWARD[n] ? st(0.86, 0.96) : n > 5 ? 1 : 0;
    const lean = carry(cv, 2, n, leanNow, leanNow, tr);
    const sp0 = sipPhase(b, SIP_AT[n]);
    const sipG = carry(cv, 3, n, sp0.g, sp0.g, tr);
    const sip = carry(cv, 19, n, sp0.u, sp0.u, tr);

    // ── the man in the cap ──────────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 4, n, CAP_LEGS[0][0][1]), CAP_LEGS[n], b, L);
    const xC = carry(cv, 4, n, wc.x, wc.x, 1);
    const dC = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, -1), CAP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CAP_P, n, t, b);
    if (seat > 0) sc = mixStance(sc, sitting(t, lean), seat);
    // seated and listening, his life is his head: a nod along, out of step with his
    // housemate's (N21); his hands stay put (AP18)
    const nodC = carry(cv, 20, n, CAP_NODS[n], CAP_NODS[n], tr) * seat * Math.max(0, Math.sin(t * 1.3 + 1.7));
    sc = { ...sc, neck: sc.neck + 0.22 * nodC, tilt: sc.tilt + 0.04 * nodC };
    // his right hand: the mug. Off the worktop on b0, held through b4, set on the table
    // on b5; seated, it rests by the mug and lifts it for a sip.
    if (A_CHIME[n]) {
      sc = hand(sc, xC, dC, 1, MUG_TOP.x + MUG_GRIP, MUG_TOP.y, st(0.22, 0.3));
      sc = holdAt(sc, 1, MUG_HOLD.x, MUG_HOLD.y, st(0.36, 0.46));
    } else if (n <= 4) {
      // held by its handle at his chest, upright (AR2, AR6); lifted once on "reward"
      const raise = A_LOOP[n] ? bp(0.66, 0.74, 0.92) : 0;
      sc = holdAt(sc, 1, MUG_HOLD.x, MUG_HOLD.y - 11 * raise, 1);
    } else if (A_REWARD[n]) {
      // carried to his chair against his chest, and set down on the table once he sits
      sc = holdAt(sc, 1, MUG_HOLD.x, MUG_HOLD.y, 1 - st(0.68, 0.74));
      sc = hand(sc, xC, dC, 1, MUG_TABLE.x - MUG_GRIP, MUG_TABLE.y, bp(0.68, 0.76, 0.86));
    } else if (!A_SWAP[n]) {
      // resting on the table by the mug, still (AP18). For a sip he takes it by the
      // handle, lifts it to his lips (interact.ts: sipHandAt) with his head dipping to
      // meet it, and puts it back where it stood (AR3).
      const rest = { x: MUG_TABLE.x - MUG_GRIP - 5, y: 472 };
      const grip = { x: MUG_TABLE.x - MUG_GRIP, y: MUG_TABLE.y };
      const cupHand = sipHandAt(sc, { x: xC, groundY: GROUND, k: K, dir: dC < 0 ? -1 : 1 });
      const gx = lerp(rest.x, grip.x, sipG);
      const gy = lerp(rest.y, grip.y, sipG);
      sc = hand(sc, xC, dC, 1, lerp(gx, cupHand.x, sip), lerp(gy, cupHand.y, sip), 1);
      sc = sipHead(sc, sip);
    }
    // his left hand: the jar's lid flicked open, a biscuit out, and eaten
    if (A_CHIME[n]) {
      const ang = Math.min(lid, 32);
      const edge = lidEdge(ang, 21);
      sc = hand(sc, xC, dC, -1, edge.x, edge.y, bp(0.58, 0.64, 0.74));
      sc = hand(sc, xC, dC, -1, JAR.x - 5, JAR.y - 9, bp(0.74, 0.8, 0.88));
      sc = hand(sc, xC, dC, -1, xC + 11 * dC, BISCUIT_Y, st(0.86, 0.96));
    }
    // two bites on b1 and the last on b2: the biscuit up to his lips, the head dipping to
    // it, and back down to his chest (AR5: twice in a line, then it rests)
    const lips = lipsAt(sc, { x: xC, groundY: GROUND, k: K, dir: dC < 0 ? -1 : 1 });
    const biteAt = { x: lips.x + 4 * K * (dC < 0 ? -1 : 1), y: lips.y + 1 };
    if (A_COUNT[n]) {
      const bite = bp(0.48, 0.56, 0.64) + bp(0.78, 0.86, 0.94);
      sc = hand(sc, xC, dC, -1, lerp(xC + 11 * dC, biteAt.x, bite), lerp(BISCUIT_Y, biteAt.y, bite), 1);
      sc = sipHead(sc, bite * 0.6);
    }
    if (A_ARRIVE[n]) {
      const bite = bp(0, 0.08, 0.2);
      sc = hand(sc, xC, dC, -1, biteAt.x, biteAt.y, bite);
      sc = sipHead(sc, bite * 0.6);
    }
    // b10: up, over to the bowl for the apple, and back to his chair with it
    if (A_SWAP[n]) {
      sc = hand(sc, xC, dC, -1, BOWL.x + APPLE_IN.x, BOWL.y + APPLE_IN.y, bp(0.24, 0.3, 0.38));
      sc = holdAt(sc, -1, 13, -16, st(0.32, 0.4));
      sc = hand(sc, xC, dC, 1, MUG_TABLE.x - MUG_GRIP - 5, 472, st(0.66, 0.76));
    }
    // the apple held at his chest, close and still, while he listens (AR6)
    if (n > 10) sc = holdAt(sc, -1, 13, -16, 1);
    const prevC = carryFrom(heldC, n, seat >= 0.99 ? sitting(t, lean) : hHold(CAP_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── his housemate, at the table with his notepad ────────────────────────
    const dP = -1;
    let sp = sitting(t, A_JAB[n] ? st(0.1, 0.3) : n > 7 ? 1 : 0);
    // while somebody else talks he nods along (N21); his hands stay put (AP18)
    const nodP = carry(cv, 18, n, PL_NODS[n], PL_NODS[n], tr) * Math.max(0, Math.sin(t * 1.45));
    sp = { ...sp, neck: sp.neck + 0.2 * nodP, tilt: sp.tilt + 0.03 * nodP };
    // the pencil hand rests on the table (AP18: no tapping on a clock)
    const padNow = A_COUNT[n] ? st(0.06, 0.2) * (1 - st(0.66, 0.8)) : 0;
    const padUp = carry(cv, 6, n, padNow, padNow, tr);
    const folded = A_JAB[n] ? st(0.1, 0.28) : 0;
    const fold = carry(cv, 7, n, folded, folded, tr);
    sp = hand(sp, PL_X, dP, 1, TAP.x, TAP.y, 1 - fold);
    sp = hand(sp, PL_X, dP, -1, PAD.x + 3, PAD.y - 2, (1 - padUp) * (1 - fold));
    // b1: the pad lifted to show, the fifth stroke, and the pad laid down again
    if (A_COUNT[n]) {
      sp = hand(sp, PL_X, dP, -1, PL_X - 16, 466, padUp);
      sp = hand(sp, PL_X, dP, 1, PL_X - 23, 458, bp(0.3, 0.38, 0.56));
    }
    // b7: he sits back and folds his arms
    if (fold > 0) {
      sp = hand(sp, PL_X, dP, 1, PL_X - 9, 462, fold);
      sp = hand(sp, PL_X, dP, -1, PL_X - 11, 459, fold);
    }
    const prevP = carryFrom(heldP, n, sitting(t, n > 8 ? 1 : 0));
    const figP = keepHeld(heldP, mixStance(prevP, sp, tr));

    // ── the coach ───────────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 8, n, -70), TH_LEGS[n], b, L);
    const xT = carry(cv, 8, n, wt.x, wt.x, 1);
    const dT = carry(cv, 9, n, 0, faceOf(carrySource(cv, 9, n, 1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b);
    // his left hand carries the bowl in, until he sets it down on b6
    const bowlNow = A_RULE[n] ? st(0.9, 0.93) : n > 6 ? 1 : 0;
    const bowlDown = carry(cv, 10, n, bowlNow, bowlNow, tr);
    if (n <= 6) {
      stt = holdAt(stt, -1, 8, -16, 1 - bowlDown);
      if (A_RULE[n]) stt = hand(stt, xT, dT, -1, BOWL.x - 10, BOWL.y, bp(0.86, 0.91, 0.98));
    }
    if (A_ARRIVE[n]) {
      // the hat tipped once he has arrived; a hand at the cap, then at the clock
      const after = moveTr(-70, 18, TR) / L;
      stt = hand(stt, xT, dT, 1, xT + 5 * dT, GROUND - 76, bp(after + 0.02, after + 0.08, after + 0.18));
      stt = hand(stt, xT, dT, 1, 100, 446, bp(0.36, 0.44, 0.58));
      stt = hand(stt, xT, dT, 1, CLOCK.x, CLOCK.y, bp(0.7, 0.8, 0.98));
    }
    // b3: the loop — the clock, the jar, the mug, each as it is named
    if (A_LOOP[n]) {
      stt = hand(stt, xT, dT, 1, CLOCK.x, CLOCK.y, bp(0.02, 0.08, 0.3));
      stt = hand(stt, xT, dT, 1, JAR.x, JAR.y, bp(0.3, 0.38, 0.6));
      stt = hand(stt, xT, dT, 1, 121, 454, bp(0.6, 0.68, 0.94));
    }
    // b6: the clock and the tea; then, at the worktop, the lid closed under his hand
    if (A_RULE[n]) {
      stt = hand(stt, xT, dT, 1, CLOCK.x, CLOCK.y, bp(0.02, 0.08, 0.22));
      stt = hand(stt, xT, dT, 1, MUG_TABLE.x, MUG_TABLE.y, bp(0.22, 0.28, 0.42));
      const mid = lidEdge(lid, 11);
      stt = hand(stt, xT, dT, 1, mid.x, mid.y - 2, st(0.6, 0.64) * (1 - st(0.8, 0.86)));
    }
    if (A_JAB[n]) stt = hand(stt, xT, dT, 1, JAR.x, JAR.y - 15, 1 - st(0, 0.1));
    // b8: pushing against something heavy that will not move, and letting it go
    if (A_WILL[n]) {
      // one shove that gets nowhere (a lean in, and the hands give back), not a tremble
      // on the clock (AR5)
      const push = st(0.06, 0.16) * (1 - st(0.5, 0.6));
      const heave = 2 * bp(0.18, 0.3, 0.44);
      stt = { ...stt, tilt: stt.tilt - 0.16 * push - 0.04 * heave };
      stt = hand(stt, xT, dT, 1, xT + (30 + heave) * dT, 452, push);
      stt = hand(stt, xT, dT, -1, xT + (29 + heave) * dT, 457, push);
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the things that move ───────────────────────────────────────────────
    const cap = pose(figC, xC, GROUND, K, dC, 1);
    const pl = pose(figP, PL_X, GROUND, K, dP, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    // mugT  0 on the worktop · 1 in his hand · 2 on the table (and lifted for a sip)
    const mugNow = A_CHIME[n] ? st(0.28, 0.32) : n < 5 ? 1 : A_REWARD[n] ? 1 + st(0.75, 0.79) : 2;
    const mugT = carry(cv, 11, n, mugNow, mugNow, tr);
    // biscuit 0 in the jar · 1 in his hand, whole · 2 a bite gone · 3 two · 4 eaten
    const bisNow = A_CHIME[n] ? st(0.78, 0.82)
      : A_COUNT[n] ? 1 + st(0.54, 0.58) + st(0.84, 0.88)
        : A_ARRIVE[n] ? 3 + st(0.06, 0.1) : n > 2 ? 4 : 0;
    const bis = carry(cv, 12, n, bisNow, bisNow, tr);
    // appleT 0 in the bowl · 1 in his hand
    const appleNow = A_SWAP[n] ? st(0.28, 0.32) : n > 10 ? 1 : 0;
    const appleT = carry(cv, 13, n, appleNow, appleNow, tr);
    const strokeNow = A_COUNT[n] ? st(0.34, 0.44) : n > 1 ? 1 : 0;
    const minNow = A_CHIME[n] ? st(0.02, 0.2) : 1;

    const wC = wristOf(cap, 'wrR');
    const wCL = wristOf(cap, 'wrL');
    const wT = wristOf(th, 'wrL');
    const wPL = wristOf(pl, 'wrL');
    const wPR = wristOf(pl, 'wrR');
    // On the worktop and the table its handle is toward him; at his lips it is turned
    // body to the face, handle out (AR3), so it turns in his hand as it comes up.
    const mugSx = mugT < 1.5 ? (mugT < 0.5 ? 1 : -dC) : lerp(-1, 1, sip);
    let mugAt: { x: number; y: number };
    if (mugT <= 1) mugAt = { x: lerp(MUG_TOP.x + MUG_GRIP, wC.x, mugT), y: lerp(MUG_TOP.y, wC.y, mugT) };
    else {
      const tbl = { x: MUG_TABLE.x - MUG_GRIP, y: MUG_TABLE.y };
      const lift = clamp01((sipG - 0.85) / 0.15);
      const base = { x: lerp(wC.x, tbl.x, mugT - 1), y: lerp(wC.y, tbl.y, mugT - 1) };
      mugAt = { x: lerp(base.x, wC.x, lift), y: lerp(base.y, wC.y, lift) };
    }
    const bowlAt = { x: lerp(wT.x + 10 * dT, BOWL.x, bowlDown), y: lerp(wT.y, BOWL.y, bowlDown) };
    const appleAt = { x: lerp(bowlAt.x + APPLE_IN.x, wCL.x, appleT), y: lerp(bowlAt.y + APPLE_IN.y, wCL.y, appleT) };
    const padAt = { x: lerp(PAD.x, wPL.x - 8, padUp), y: lerp(PAD.y, wPL.y - 6, padUp) };

    return {
      cap, pl, th, t,
      hour: carry(cv, 14, n, minNow, minNow, tr),
      lid,
      mug: { x: mugAt.x, y: mugAt.y, o: 1, sx: mugSx, r: sipTilt(sip, dC) },
      bis: { x: wCL.x, y: wCL.y, o: bis >= 0.6 && bis < 3.9 ? 1 : 0, s: bis < 1 ? 1 : 1 - 0.28 * (bis - 1) },
      bowl: { x: bowlAt.x, y: bowlAt.y, o: 1 },
      apple: { x: appleAt.x, y: appleAt.y, o: appleT < 0.5 ? 1 : 0 },
      appleHeld: { x: appleAt.x, y: appleAt.y, o: appleT < 0.5 ? 0 : 1 },
      pad: { x: padAt.x, y: padAt.y, o: 1, sy: lerp(0.32, 1, padUp) },
      pencil: { x: wPR.x - 4, y: wPR.y, o: 1, r: -24 },
      stroke: carry(cv, 15, n, strokeNow, strokeNow, tr),
      steamMug: mugAt,
      q1: carry(cv, 16, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 17, n, Q2[p], Q2[n], tr),
    };
  });

  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <ObjectArt parts={WINDOW_ART} tone={TONE} />
      <ObjectArt parts={SPLASH_ART} tone={TONE} />
      <ObjectArt parts={CLOCK_ART} tone={TONE} />
      <ClockHands S={SCENE} />
      <ObjectArt parts={UNIT_ART} tone={TONE} />
      <ObjectArt parts={KETTLE_ART} tone={TONE} />
      <Steam S={SCENE} from="kettle" />
      <LessonPicture name="growth2-jar" />
      <Lid S={SCENE} />
      <Bowl S={SCENE} />
      <LessonPicture name="growth2-table" />
      <ObjectArt parts={CHOC_ART} tone={TONE} />
      <LessonPicture name="growth2-chair-cap" />
      <LessonPicture name="growth2-chair-pl" />
      <View style={styles.ground} pointerEvents="none" />
      <Pad S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="crowd" wear={[]} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="lead" wear={BY_ID.stroller.pieces} />
      <Held S={SCENE} />
      {on(Q1) ? <CueTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <ReachTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── riders: a thing drawn about the point it is held by ─────────────────────

type At = { x: number; y: number; o: number; r?: number; sx?: number; sy?: number; s?: number };
function Rider({ at, art, lift }: { at: SharedValue<At>; art: ReturnType<typeof mug>; lift?: boolean }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r ?? 0}deg` },
      { scaleX: (at.value.sx ?? 1) * (at.value.s ?? 1) }, { scaleY: (at.value.sy ?? 1) * (at.value.s ?? 1) },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

function Held({ S }: { S: SharedValue<any> }) {
  const mugP = useDerivedValue<At>(() => S.value.mug);
  const bisP = useDerivedValue<At>(() => S.value.bis);
  const pencilP = useDerivedValue<At>(() => S.value.pencil);
  const appleP = useDerivedValue<At>(() => S.value.appleHeld);
  return (
    <>
      <Rider at={mugP} art={MUG_ART} />
      <Steam S={S} from="mug" />
      <Rider at={bisP} art={BISCUIT_ART} />
      <Rider at={pencilP} art={PENCIL_ART} />
      <Rider at={appleP} art={APPLE_ART} />
    </>
  );
}

// ── the clock: its hands, the minute hand coming round to twelve on b0 ───────
function ClockHands({ S }: { S: SharedValue<any> }) {
  const minute = useAnimatedStyle(() => ({ transform: [{ rotate: `${-90 + 90 * S.value.hour}deg` }] }));
  const hourH = useAnimatedStyle(() => ({ transform: [{ rotate: `${82.5 + 7.5 * S.value.hour}deg` }] }));
  const second = useAnimatedStyle(() => ({ transform: [{ rotate: `${(S.value.t * 6) % 360}deg` }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View style={[styles.handHour, hourH]} />
      <Animated.View style={[styles.handMinute, minute]} />
      <Animated.View style={[styles.handSecond, second]} />
      <View style={styles.boss} />
    </View>
  );
}

// ── steam rising off the kettle and off the tea ─────────────────────────────
const PUFFS = [0, 1, 2];
function Steam({ S, from }: { S: SharedValue<any>; from: 'kettle' | 'mug' }) {
  return (
    <>
      {PUFFS.map((k) => <Puff key={k} k={k} S={S} from={from} />)}
    </>
  );
}
function Puff({ k, S, from }: { k: number; S: SharedValue<any>; from: 'kettle' | 'mug' }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const f = (v.t * 0.45 + k / PUFFS.length) % 1;
    const o = from === 'kettle' ? { x: 175, y: 456 } : { x: v.steamMug.x - MUG_GRIP * (v.mug.sx ?? 1), y: v.steamMug.y - 8 };
    const sway = Math.sin(v.t * 1.7 + k * 2) * 2.2 * f;
    return {
      opacity: (1 - f) * Math.min(1, f * 5) * 0.8,
      transform: [{ translateX: o.x - 2 + sway }, { translateY: o.y - 2 - 16 * f }, { scale: 0.7 + 0.8 * f }],
    };
  });
  return <Animated.View style={[styles.puff, st]} pointerEvents="none" />;
}

// ── the jar's lid, swung on its hinge ───────────────────────────────────────
function Lid({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => ({ x: HINGE.x, y: HINGE.y, o: 1, r: S.value.lid }));
  return <Rider at={at} art={LID_ART} />;
}

// ── the fruit bowl, carried in by the coach and set on the worktop ──────────
function Bowl({ S }: { S: SharedValue<any> }) {
  const bowlP = useDerivedValue<At>(() => S.value.bowl);
  const greenP = useDerivedValue<At>(() => ({ x: S.value.bowl.x + GREEN_IN.x, y: S.value.bowl.y + GREEN_IN.y, o: 1 }));
  const appleP = useDerivedValue<At>(() => S.value.apple);
  return (
    <>
      <Rider at={bowlP} art={BOWL_ART} />
      <Rider at={greenP} art={GREEN_ART} />
      <Rider at={appleP} art={APPLE_ART} />
      <Rider at={bowlP} art={BOWL_FRONT_ART} />
    </>
  );
}

// ── the housemate's notepad, and the tally on it ────────────────────────────
const STROKES = [-4.5, -2, 0.5, 3];
function Pad({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.pad;
    return { transform: [{ translateX: v.x }, { translateY: v.y }, { scaleY: v.sy }] };
  });
  const fifth = useAnimatedStyle(() => ({ transform: [{ rotate: '-52deg' }, { scaleX: S.value.stroke }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={PAD_ART} tone={TONE} />
      {STROKES.map((x) => <View key={x} style={[styles.tally, { left: x - 0.6 }]} />)}
      <Animated.View style={[styles.gate, fifth]} />
    </Animated.View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * The two questions are tapped ON THE STAGE (AP6), and each choice carries its name on
 * a small plate at its foot, inside its target (AN1), so the thing and the word for it
 * are one choice. No two live targets touch (AN4).
 */
type Q = { id: string; label: string; pw: number; left: number; top: number; w: number; h: number; correct: boolean };
/** Q1: the clock, the jar and his chair. The clock striking three is the cue. */
const CUE_Q: Q[] = [
  { id: 'clock', label: 'CLOCK', pw: 42, left: CLOCK.x - 22, top: 354, w: 44, h: 48, correct: true },
  { id: 'jar', label: 'JAR', pw: 29, left: JAR.x - 18, top: 441, w: 32, h: 57, correct: false },
  { id: 'chair', label: 'CHAIR', pw: 40, left: CAP_CHAIR - 21, top: 462, w: 42, h: 51, correct: false },
];
/** Q2: the apple, the chocolate bar and the jar. The apple changes only the routine. */
const REACH_Q: Q[] = [
  { id: 'apple', label: 'APPLE', pw: 40, left: BOWL.x + APPLE_IN.x - 20, top: 446, w: 40, h: 52, correct: true },
  { id: 'chocolate', label: 'CHOCOLATE', pw: 67, left: CHOC.x - 33.5, top: 459, w: 67, h: 39, correct: false },
  { id: 'jar', label: 'JAR', pw: 29, left: JAR.x - 18, top: 441, w: 32, h: 57, correct: false },
];
function CueTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={CUE_Q} k="q1" />;
}
function ReachTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={REACH_Q} k="q2" />;
}
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.place}>
            <PlateReact id={q.id} correct={q.correct} picked={picked} left={(q.w - q.pw) / 2} width={q.pw} label={q.label} />
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}


/**
 * A choice's name plate: struck white on a hard ledge. The plate the reader tapped
 * reacts on the stage: the right one pops up and settles back with a bounce, the wrong
 * one shakes side to side and drops a little, and the plate nobody tapped stays put.
 */
function PlateReact({ id, correct, picked, left, width, label }: {
  id: string; correct: boolean; picked: string | null; left: number; width: number; label: string;
}) {
  const hop = useSharedValue(0);
  const shake = useSharedValue(0);
  useEffect(() => {
    if (picked !== id) { hop.value = 0; shake.value = 0; return; }
    if (correct) {
      hop.value = withSequence(withTiming(-5, { duration: 130, easing: Easing.out(Easing.quad) }), withSpring(0, { damping: 6, stiffness: 260 }));
    } else {
      shake.value = withSequence(
        withTiming(-3, { duration: 55 }), withTiming(3, { duration: 90 }), withTiming(-2.4, { duration: 90 }),
        withTiming(1.6, { duration: 80 }), withTiming(0, { duration: 70 }),
      );
      hop.value = withSequence(withTiming(1.6, { duration: 120 }), withTiming(0.8, { duration: 200 }));
    }
  }, [picked]);
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }, { translateY: hop.value }] }));
  const won = picked === id && correct;
  const lost = picked === id && !correct;
  return (
    <Animated.View style={[styles.namePlate, { left, width }, won ? styles.plateWon : null, lost ? styles.plateLost : null, st]}>
      <Text style={[styles.nameText, won || lost ? styles.nameOn : null]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  onTop: { zIndex: 2 },
  handHour: {
    position: 'absolute', left: CLOCK.x - 1.2, top: CLOCK.y - 7, width: 2.4, height: 7, borderRadius: 1.2,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  handMinute: {
    position: 'absolute', left: CLOCK.x - 0.9, top: CLOCK.y - 10.5, width: 1.8, height: 10.5, borderRadius: 0.9,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  handSecond: {
    position: 'absolute', left: CLOCK.x - 0.4, top: CLOCK.y - 11, width: 0.8, height: 11,
    backgroundColor: NATURAL.clockRed.base, transformOrigin: '50% 100%',
  },
  boss: {
    position: 'absolute', left: CLOCK.x - 1.6, top: CLOCK.y - 1.6, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: INK,
  },
  puff: {
    position: 'absolute', left: 0, top: 0, width: 5, height: 5, borderRadius: 2.5, borderWidth: 1.1, borderColor: RULE,
    backgroundColor: PAPER_LIT,
  },
  tally: {
    position: 'absolute', top: -4, width: 1.2, height: 10, borderRadius: 0.6, backgroundColor: INK,
  },
  gate: {
    position: 'absolute', left: -7, top: 0, width: 14, height: 1.2, borderRadius: 0.6, backgroundColor: INK,
    transformOrigin: '0% 50%',
  },
  place: { flexGrow: 1 },
  namePlate: {
    position: 'absolute', bottom: 2, backgroundColor: PLATE_FACE, borderRadius: PLATE_RADIUS / 2, borderWidth: 1,
    borderColor: INK, paddingVertical: 1, boxShadow: `0 2px 0 ${lipOf(TONE)}`,
  },
  plateWon: { backgroundColor: NATURAL.leaf.base },
  plateLost: { backgroundColor: NATURAL.clockRed.base },
  nameOn: { color: PAPER_LIT },
  nameText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false, alignSelf: 'stretch', textAlign: 'center',
  },
});

export function Growth2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Growth2Scene} band={[306, 514]} camera={CAM} />;
}
