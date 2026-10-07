import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './phil5Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, telePodBack, telePodFront, telePodPad, recycleLid, labConsole, consoleDesk, balanceStand,
  balanceBeam, balancePan, porthole, labMonitor, corridorHatch, moonDome, moonModule,
  RECYCLE_PLATE, BALANCE_PIVOT, MONITOR_DISPLAY, MONITOR_STRIP, DESK_BUTTONS,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// philosophy-foundations-5, "What Makes You You?" — AN ORBITING SPACE LAB.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. An engineer (the bun) has warmed up the lab's
// teleporter; a volunteer (the plain one) cannot wait to be the first man beamed to the
// Moon, until he hears what the pod does with the old him; the philosopher (the top hat)
// floats in through the hatch from the corridor to ask what makes a person the same
// person. Then the recycler jams, and there are two of him.
//
//   b0   the engineer presses the console's two buttons and the pod's ring lights up;
//        she turns to the volunteer and sweeps a hand up the pod as she says it.
//   b1   the volunteer strides to the pod's step and strikes a pose for history, one
//        fist in the air, the other on his hip.
//   b2   the engineer pats the recycler's lid twice; it drops open on "breaks the old
//        you down", the grinder glowing inside, and clanks shut. The volunteer, one
//        foot lifted to step in, stops with it in the air.
//   b3   he puts the foot down, turns and steps back off the step, then turns round;
//        the philosopher floats in from the corridor hatch, feet off the floor, arms
//        out, and settles to the floor as he talks.
//   b4   the philosopher holds one hand toward the pod ("your body … you end here"),
//        then raises the other to the Moon on the screen above him ("your memories").
//   b5   Q1, FOLLOW HIM: the Moon screen, the empty pod and the recycler's hatch.
//   b6   the volunteer walks up into the pod and throws a hand up; the engineer
//        presses the button, the door slides down, a flash and a column of light,
//        and on the screen he appears in the Moon pod and steps out onto the dust.
//   b7   the engineer bangs the console twice; the door jolts up, and he is still in
//        the pod looking about him — with his double on the Moon doing the same.
//   b8   he lays a hand on his chest, then points at the screen; on the Moon, his
//        double lays a hand on his chest and points back, at the same moments.
//   b9   the philosopher, between them, holds one hand to the pod and raises the
//        other to the screen.
//   b10  Q2, WEIGH THE CLAIMS: him in the pod, his double on the screen, the balance.
//   b11  everyone at ease under the quotation, the Earth turning past the porthole.
//
// COMPOSITION, in stage units. The lab's off-white WALL fills 224–500 under a grey
// CEILING (224–240) with its light strip. Left, high, the PORTHOLE (16–100 × 258–342):
// space, a few stars, and the Earth's limb turning past. The POD (83–165 × 362–466) stands
// on its PAD (71–178 × 466–500) with the STEP (50–71, top 483) at its left; in the pad's
// front, under the pod, the RECYCLER's hatch (119–175 × 469–497). The volunteer waits at
// 22, poses on the step at 60, stands in the pod at 124 on the pad's top (466). The
// engineer stands at 190 by the CONSOLE (204–264 × 456–500, its control panel 204–234 ×
// 440–456, the brass BALANCE 229–259 × 420–456 on its top). The MONITOR (270–394 ×
// 262–358) shows the Moon base live; the CORRIDOR HATCH (350–404 × 386–494) is under it,
// and the philosopher settles at 300, below the screen and between it and the pod.
// Band [224, 518]: 78 units of figure in 294, 27%.
//
// SIMPLE ON PURPOSE (AP7): never more than two figures moving, everyone faces whom he
// talks to, listeners nod along with still hands (AP18), and every hand that moves is
// pressing, patting, banging, pointing, sweeping or holding a pose.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('philosophy');
const { RULE } = TONE;
const TR = 0.85;
const K = K_FIG * 0.76;
/** The double on the screen: the same man, drawn at the screen's scale. */
const KD = K * 0.46;
const KR = KD / K;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts, philosophy-foundations-5). */
const LINES = [5.61, 3.29, 5.01, 4.52, 6.11, 0, 2.99, 4.74, 3.39, 7.26, 0, 0, 0];

const TALK = 167;
const EXPLAIN = 259;
const NOD = 263;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_WARM = is('warm');
const A_VOL = is('volunteer');
const A_RECYCLE = is('recycle');
const A_HESITATE = is('hesitate');
const A_VIEWS = is('views');
const A_BEAM = is('beam');
const A_JAM = is('jam');
const A_CLAIM = is('claim');
const A_TIE = is('tie');
const SAGE = BEATS.map((b) => (b.sage ? 1 : 0));
const Q1 = BEATS.map((b) => (b.where ? 1 : 0));
const Q2 = BEATS.map((b) => (b.claim ? 1 : 0));
const BEAM_AT = A_BEAM.indexOf(1);
const JAM_AT = A_JAM.indexOf(1);
const Q2_AT = Q2.indexOf(1);
/** The EQUAL CLAIM plate is on the console from the second question on. */
const PLATE = BEATS.map((_, n) => (n >= Q2_AT ? 1 : 0));

type Track = readonly (readonly number[])[];
/** The volunteer: up to the step, back off it, then up into the pod (a leg is [share of line, x]). */
const VO_START = 22;
const VO_LEGS: Track[] = [
  [[0, 22]], [[0.04, 60]], [[0, 60]], [[0.2, 26]], [[0, 26]], [[0, 26]],
  [[0.04, 124]], [[0, 124]], [[0, 124]], [[0, 124]], [[0, 124]], [[0, 124]], [[0, 124]],
];
/** He faces the pod; turns to step back off the step, and round again. */
const VO_TURN: Track[] = BEATS.map((_, n) => (A_HESITATE[n] ? [[0, 1], [0.14, -1], [0.62, 1]]
  : A_VOL[n] ? [[0, 1], [0.34, -1], [0.88, 1]] : [[0, 1]]));
const VO_P = [NOD, TALK, NOD, NOD, NOD, NOD, TALK, NOD, TALK, NOD, NOD, NOD, NOD];
/** The engineer stays by her console, turning between it and the people. */
const BN_X = 190;
const BN_TURN: Track[] = [
  [[0, 1], [0.55, -1]], [[0, -1]], [[0, -1]], [[0, -1], [0.45, 1]], [[0, 1]], [[0, 1]],
  [[0, -1], [0.55, 1]], [[0, 1], [0.5, -1]], [[0, -1]], [[0, 1]], [[0, 1]], [[0, 1]], [[0, 1]],
];
const BN_P = [TALK, NOD, TALK, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, NOD];
/** The philosopher floats in on b3 and settles under the screen. */
const PH_X = 300;
const PH_OFF = 432;
const PH_P = [NOD, NOD, NOD, TALK, EXPLAIN, NOD, NOD, NOD, NOD, EXPLAIN, NOD, NOD, NOD];
/** He faces the people; turns to the screen behind him to raise a hand to the Moon, and back. */
const PH_TURN: Track[] = BEATS.map((_, n) => (A_VIEWS[n] ? [[0, -1], [0.47, 1], [0.7, -1]] : A_TIE[n] ? [[0, 1], [0.36, -1]] : [[0, -1]]));
/**
 * The double, in the display's own units: out of the Moon pod at the screen's right and
 * onto the dust, walking toward the lab — so he faces the people in it all along.
 */
const DB_POD = 88;
const DB_OUT = 60;
const DB_LEGS: Track[] = BEATS.map((_, n) => (n < BEAM_AT ? [[0, DB_POD]] : n === BEAM_AT ? [[0.95, DB_OUT]] : [[0, DB_OUT]]));
const DB_TURN: Track[] = BEATS.map(() => [[0, -1]]);
const DB_P = BEATS.map(() => NOD);

// ── the lab ─────────────────────────────────────────────────────────────────
const POD = { x: 124, y: 414, w: 82, h: 104 };
const OPEN = { left: 92, top: 386, w: 64, h: 74 };              // between the pillars, under the cap
const RING = { left: 89, top: 381, w: 70, h: 6 };
const PAD = { x: 114, y: 483, w: 128, h: 34 };
const PAD_TOP = 466;
const STEP_TOP = 483;
const LID = { x: 147, y: 483, w: 56, h: 28 };
const LID_PLATE = {
  left: LID.x - LID.w / 2 + RECYCLE_PLATE.x - RECYCLE_PLATE.w / 2,
  top: LID.y - LID.h / 2 + RECYCLE_PLATE.y - RECYCLE_PLATE.h / 2,
  w: RECYCLE_PLATE.w, h: RECYCLE_PLATE.h,
};
const CONSOLE = { x: 234, y: 478, w: 60, h: 44 };
const DESK = { x: 219, y: 448, w: 30, h: 16 };
const BUTTON = {
  x: DESK.x - DESK.w / 2 + DESK_BUTTONS.x,
  red: DESK.y - DESK.h / 2 + DESK_BUTTONS.red,
  green: DESK.y - DESK.h / 2 + DESK_BUTTONS.green,
};
const STAND = { x: 244, y: 438, w: 30, h: 36 };
const PIVOT = { x: STAND.x - STAND.w / 2 + BALANCE_PIVOT.x, y: STAND.y - STAND.h / 2 + BALANCE_PIVOT.y };
const ARM = 20.2;                                               // pivot → the end a pan hangs from
const EQUAL_PLATE = { left: 212, top: 468, w: 40, h: 22 };
const WINDOW = { x: 58, y: 300, r: 32 };
const MONITOR = { x: 332, y: 310, w: 124, h: 96 };
const DISPLAY = {
  left: MONITOR.x - MONITOR.w / 2 + MONITOR_DISPLAY.x - MONITOR_DISPLAY.w / 2,
  top: MONITOR.y - MONITOR.h / 2 + MONITOR_DISPLAY.y - MONITOR_DISPLAY.h / 2,
  w: MONITOR_DISPLAY.w, h: MONITOR_DISPLAY.h,
};
const STRIP = {
  left: MONITOR.x - MONITOR.w / 2 + MONITOR_STRIP.x - MONITOR_STRIP.w / 2,
  top: MONITOR.y - MONITOR.h / 2 + MONITOR_STRIP.y - MONITOR_STRIP.h / 2,
  w: MONITOR_STRIP.w, h: MONITOR_STRIP.h,
};
/** The Moon's ground on the screen, in the display's own units, and its pod. */
const MOON_GROUND = 62;
const MPOD = { x: DB_POD, y: 42, w: 30, h: 40 };
/** Where the Moon pod is on the STAGE, which the trail of light flies to. */
const MPOD_STAGE = { x: DISPLAY.left + MPOD.x, y: DISPLAY.top + MPOD.y };

const POD_BACK_ART = telePodBack(POD.x, POD.y, POD.w, POD.h);
const POD_FRONT_ART = telePodFront(POD.x, POD.y, POD.w, POD.h);
const PAD_ART = telePodPad(PAD.x, PAD.y, PAD.w, PAD.h);
const LID_ART = recycleLid(LID.x, LID.y, LID.w, LID.h);
const CONSOLE_ART = labConsole(CONSOLE.x, CONSOLE.y, CONSOLE.w, CONSOLE.h);
const DESK_ART = consoleDesk(DESK.x, DESK.y, DESK.w, DESK.h);
const STAND_ART = balanceStand(STAND.x, STAND.y, STAND.w, STAND.h);
const BEAM_ART = balanceBeam(0, 0, 44, 6);
const PAN_ART = balancePan(0, 8, 18, 16);
const PORTHOLE_ART = porthole(WINDOW.x, WINDOW.y, 84, 84);
const MONITOR_ART = labMonitor(MONITOR.x, MONITOR.y, MONITOR.w, MONITOR.h);
const HATCH_ART = corridorHatch(377, 440, 54, 108);
const MPOD_BACK = telePodBack(MPOD_STAGE.x, MPOD_STAGE.y, MPOD.w, MPOD.h);
const MPOD_FRONT = telePodFront(MPOD_STAGE.x, MPOD_STAGE.y, MPOD.w, MPOD.h);
const DOME_ART = moonDome(22, MOON_GROUND - 1, 34, 34);
const MODULE_ART = moonModule(46, 57, 24, 10);

/** The trail of light Q1's right answer draws, pod to Moon pod: a gentle arc. */
const TRAIL = Array.from({ length: 7 }, (_, k) => {
  const u = (k + 1) / 8;
  const x0 = POD.x;
  const y0 = POD.y - POD.h / 2;
  const cx = 200;
  const cy = 236;
  const x1 = MPOD_STAGE.x;
  const y1 = MPOD_STAGE.y - 6;
  return {
    x: (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * x1,
    y: (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y1,
  };
});

/** The volunteer's floor: the lab's, the step's, the pad's — eased over each riser. */
function smooth01(u: number): number {
  'worklet';
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
function floorAt(x: number): number {
  'worklet';
  if (x < 56) return lerp(GROUND, STEP_TOP, smooth01((x - 45) / 7));
  return lerp(STEP_TOP, PAD_TOP, smooth01((x - 65) / 7));
}
function hHold(code: number, t: number, phase?: number): Stance {
  'worklet';
  return emoteStill(code, t, phase);
}
function hLive(code: number, t: number, bt: number, phase?: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt, phase);
}
function hand(s: Stance, x: number, g: number, k: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A look: the head up (negative) or down (positive). */
function look(s: Stance, v: number): Stance {
  'worklet';
  return v === 0 ? s : { ...s, neck: s.neck + v };
}
/** One foot lifted forward and up, as onto a step: `w` of the way there. */
function footUp(s: Stance, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  return { ...s, footR: { x: lerp(s.footR.x, 15, w), y: lerp(s.footR.y, -24, w) } };
}
/** Floating: the feet together and hanging a little, the toes down. */
function floating(s: Stance, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  return {
    ...s,
    footL: { x: lerp(s.footL.x, -2, w), y: lerp(s.footL.y, -3, w) },
    footR: { x: lerp(s.footR.x, 3, w), y: lerp(s.footR.y, 0, w) },
  };
}

/** Where a walking figure stands at time `b` of a beat (from where he is on screen). */
function legsOf(src: number, legs: Track, b: number, L: number, speed: number) {
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
    const dur = d > 1 ? moveTr(from * speed, to * speed, TR) : 0;
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
/** One figure's body: walking its legs (in full-size units, so the stride fits), or holding its pose. */
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number, speed: number, phase?: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0 * speed, w.x1 * speed, hHold(codes[n], t, phase), hHold(codes[n], t, phase), hLive(codes[n], t, b, phase), w.u, WALK, 0)
    : hLive(codes[n], t, b, phase);
}

const CAM = followMoves(VO_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('philosophy'));

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { moon: 1, pod: 2, hatch: 3, equal: 4, mine: 5, double: 6 };

export default function Phil5Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldV = useHeld();
  const heldB = useHeld();
  const heldP = useHeld();
  const heldD = useHeld();
  const cv = useCarry(24);
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
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };
    /** Up over [a, m], held, and back down over [z0, z1]. */
    const hd = (a: number, m: number, z0: number, z1: number) => {
      'worklet';
      return stage(b, L, a, m) * (1 - stage(b, L, z0, z1));
    };
    // ── the reader's answer, on a graded beat (0 elsewhere), carried off after ──
    const q = qv.value;
    const pc = pk.value;
    const ans = (code: number, Q: readonly number[]) => {
      'worklet';
      return Q[n] && pc === code ? q : 0;
    };
    const rMoon = carry(cv, 13, n, 0, ans(1, Q1), tr);
    const rPod = carry(cv, 14, n, 0, ans(2, Q1), tr);
    const rHatch = carry(cv, 15, n, 0, ans(3, Q1), tr);
    const rEqual = carry(cv, 16, n, 0, ans(4, Q2), tr);
    const rMine = carry(cv, 17, n, 0, ans(5, Q2), tr);
    const rDouble = carry(cv, 18, n, 0, ans(6, Q2), tr);
    const palm = Math.sin(Math.PI * Math.min(1, rEqual * 1.4));

    // ── the volunteer ───────────────────────────────────────────────────────
    const wv = legsOf(carrySource(cv, 0, n, VO_START), VO_LEGS[n], b, L, 1);
    const xV = carry(cv, 0, n, wv.x, wv.x, 1);
    const dV = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), VO_TURN[n], b, L), 1);
    const gV = floorAt(xV);
    let sv = bodyOf(wv, VO_P, n, t, b, 1, 0);
    if (A_VOL[n]) {
      // up on the step, he turns out to face his public and strikes the pose for history: an
      // arm flung up and out (clear of his head, so it reads), the other fist on his hip
      const pose1 = hd(0.42, 0.52, 0.8, 0.88);
      sv = hand(sv, xV, gV, K, dV, 1, xV + 48 * dV, gV - 64, pose1);
      sv = hand(sv, xV, gV, K, dV, -1, xV + 6 * dV, gV - 27, pose1);
      sv = look(sv, -0.18 * pose1);
    }
    if (A_RECYCLE[n]) sv = footUp(sv, st(0.12, 0.26));               // a foot lifted to step in …
    if (A_HESITATE[n]) {
      sv = footUp(sv, 1 - st(0.02, 0.12));                           // … and put down again
      sv = look(sv, 0.1 * bp(0, 0.06, 0.16));
    }
    if (A_BEAM[n]) {
      // in the pod, chin up, a hand thrown up on "Beam them up"
      const up = hd(0.66, 0.74, 0.98, 1.1);
      sv = hand(sv, xV, gV, K, dV, 1, xV + 48 * dV, gV - 64, up);
      sv = look(sv, -0.16 * up);
    }
    if (A_JAM[n]) sv = look(sv, 0.18 * bp(0.4, 0.5, 0.62) - 0.14 * bp(0.62, 0.72, 0.86)); // looking about
    if (A_CLAIM[n]) {
      // a hand on his chest — "I'm the real one" — then pointing at the screen
      sv = hand(sv, xV, gV, K, dV, 1, xV + 6 * dV, gV - 46, hd(0.02, 0.1, 0.26, 0.34));
      sv = hand(sv, xV, gV, K, dV, 1, xV + 60 * dV, gV - 84, hd(0.34, 0.44, 0.84, 0.96));
    }
    // Q2: chin up while the balance tips his way; a palm up, with his double's, on the right answer
    sv = look(sv, -0.2 * Math.sin(Math.PI * rMine));
    sv = hand(sv, xV, gV, K, dV, 1, xV + 15 * dV, gV - 40, palm);
    const prevV = carryFrom(heldV, n, hHold(VO_P[p], t, 0));
    const figV = keepHeld(heldV, wv.walking ? mixKeepLegs(prevV, sv, tr) : mixStance(prevV, sv, tr));

    // ── the engineer ────────────────────────────────────────────────────────
    const dB = carry(cv, 2, n, 0, faceOf(carrySource(cv, 2, n, 1), BN_TURN[n], b, L), 1);
    let sb = hLive(BN_P[n], t, b, 1);
    if (A_WARM[n]) {
      // the red button, then the green, then a sweep of the hand up the pod
      // one press on each: the hand rests on the red, then moves down onto the green
      const by = lerp(BUTTON.red, BUTTON.green, st(0.2, 0.27));
      sb = hand(sb, BN_X, GROUND, K, dB, 1, BUTTON.x, by + 1.5 * bp(0.08, 0.12, 0.17), hd(0.03, 0.08, 0.4, 0.46));
      const sweep = st(0.66, 0.9);
      sb = hand(sb, BN_X, GROUND, K, dB, 1, lerp(172, 168, sweep), lerp(462, 414, sweep), hd(0.6, 0.66, 0.94, 1));
    }
    if (A_RECYCLE[n]) {
      // two pats on the recycler's lid, then the hand comes up again
      const pat = 5 * bp(0.12, 0.15, 0.19) + 5 * bp(0.19, 0.22, 0.26);
      const at = hd(0.03, 0.11, 0.3, 0.38);
      sb = hand(sb, BN_X, GROUND, K, dB, 1, 173, 467 + pat, at);
      sb = look(sb, 0.16 * at);
    }
    if (A_BEAM[n]) sb = hand(sb, BN_X, GROUND, K, dB, 1, BUTTON.x, BUTTON.red + 2 * bp(0.7, 0.74, 0.8), hd(0.6, 0.68, 0.9, 0.98));
    if (A_JAM[n]) {
      // two bangs on the panel, then she turns to look
      const bang = 6 * bp(0.06, 0.1, 0.15) + 6 * bp(0.18, 0.22, 0.28);
      sb = hand(sb, BN_X, GROUND, K, dB, 1, BUTTON.x + 1, 436 + bang, hd(0, 0.05, 0.32, 0.4));
    }
    const prevB = carryFrom(heldB, n, hHold(BN_P[p], t, 1));
    const figB = keepHeld(heldB, mixStance(prevB, sb, tr));

    // ── the philosopher ─────────────────────────────────────────────────────
    let xNow = SAGE[n] ? PH_X : PH_OFF;
    let lift = 0;
    let fl = 0;
    if (A_HESITATE[n]) {
      // a slow drift in from the corridor, feet off the floor, then he settles
      xNow = lerp(carrySource(cv, 3, n, PH_OFF), PH_X, st(0, 0.62));
      lift = 34 * (1 - st(0.46, 0.82));
      fl = 1 - st(0.6, 0.84);
    }
    const xP = carry(cv, 3, n, xNow, xNow, A_HESITATE[n] ? 1 : tr);
    const liftP = carry(cv, 19, n, 0, lift, tr);
    const flP = carry(cv, 20, n, 0, fl, tr);
    const dP = carry(cv, 23, n, 0, faceOf(carrySource(cv, 23, n, -1), PH_TURN[n], b, L), 1);
    const gP = GROUND - liftP;
    let sp = hLive(PH_P[n], t, b, 2);
    if (flP > 0) {
      // arms out in front for balance, feet together
      sp = floating(sp, flP);
      sp = hand(sp, xP, gP, K, dP, 1, xP - 20, gP - 44, flP);
      sp = hand(sp, xP, gP, K, dP, -1, xP - 14, gP - 36, flP);
    }
    // a hand toward the pod ("your body … you end here"), facing it; then he turns to the
    // screen behind him and raises a hand to the Moon on it ("your memories … the Moon")
    const toPod = A_VIEWS[n] ? hd(0.04, 0.12, 0.4, 0.46) : A_TIE[n] ? hd(0.44, 0.52, 0.9, 0.97) : 0;
    const toMoon = A_VIEWS[n] ? hd(0.52, 0.58, 0.64, 0.69) : A_TIE[n] ? hd(0.04, 0.12, 0.3, 0.36) : 0;
    sp = hand(sp, xP, gP, K, dP, 1, xP + 40 * dP, gP - 50, toPod);
    sp = hand(sp, xP, gP, K, dP, 1, xP + 56 * dP, gP - 60, toMoon);
    sp = look(sp, -0.22 * toMoon);
    const prevP = carryFrom(heldP, n, hHold(PH_P[p], t, 2));
    const figP = keepHeld(heldP, mixStance(prevP, sp, tr));
    const sage = carry(cv, 5, n, SAGE[p], SAGE[n], tr);

    // ── the double, on the Moon ─────────────────────────────────────────────
    const SPD = 1 / KR;
    const wd = legsOf(carrySource(cv, 6, n, DB_POD), DB_LEGS[n], b, L, SPD);
    const xD = carry(cv, 6, n, wd.x, wd.x, 1);
    const dD = carry(cv, 7, n, 0, faceOf(carrySource(cv, 7, n, -1), DB_TURN[n], b, L), 1);
    // drawn on the stage, standing on the screen's Moon: the display's corner plus his place on it
    const xDs = DISPLAY.left + xD;
    const gD = DISPLAY.top + MOON_GROUND;
    let sd = bodyOf(wd, DB_P, n, t, b, SPD, 3);
    if (A_JAM[n]) sd = look(sd, 0.18 * bp(0.4, 0.5, 0.62) - 0.14 * bp(0.62, 0.72, 0.86));
    if (A_CLAIM[n]) {
      // the same hand on the chest and the same point, at the same moments, back at the pod
      sd = hand(sd, xDs, gD, KD, dD, 1, xDs + 6 * KR * dD, gD - 46 * KR, hd(0.02, 0.1, 0.26, 0.34));
      sd = hand(sd, xDs, gD, KD, dD, 1, xDs + 60 * KR * dD, gD - 84 * KR, hd(0.34, 0.44, 0.84, 0.96));
    }
    sd = look(sd, -0.2 * Math.sin(Math.PI * rDouble));
    sd = hand(sd, xDs, gD, KD, dD, 1, xDs + 15 * KR * dD, gD - 40 * KR, palm);
    const prevD = carryFrom(heldD, n, hHold(NOD, t, 3));
    const figD = keepHeld(heldD, wd.walking ? mixKeepLegs(prevD, sd, tr) : mixStance(prevD, sd, tr));
    const dblNow = n === BEAM_AT ? st(0.84, 0.9) : n > BEAM_AT ? 1 : 0;
    const dbl = carry(cv, 8, n, dblNow, dblNow, tr);

    // ── the machine ─────────────────────────────────────────────────────────
    const warmNow = A_WARM[n] ? st(0.3, 0.5) : n > 0 ? 1 : 0;
    const warm = carry(cv, 9, n, warmNow, warmNow, tr);
    const doorNow = n === BEAM_AT ? st(0.62, 0.74) : n === JAM_AT ? 1 - st(0.24, 0.32) : 0;
    const door = carry(cv, 10, n, doorNow, doorNow, tr);
    const lidNow = A_RECYCLE[n] ? hd(0.25, 0.3, 0.52, 0.56) : 0;
    const lid = carry(cv, 21, n, 0, lidNow, tr);
    const flashNow = A_BEAM[n] ? bp(0.76, 0.8, 0.92) : 0;
    const flash = carry(cv, 22, n, 0, flashNow, tr);
    const moonFlash = A_BEAM[n] ? bp(0.8, 0.84, 0.96) : 0;
    // the door jolts as it is banged loose
    const jolt = A_JAM[n] ? 2 * bp(0.08, 0.1, 0.13) + 2 * bp(0.2, 0.22, 0.25) : 0;
    // Q1: the pod's light dies if the reader leaves him in it; the hatch rattles shut
    const ringDim = Math.min(1, rPod * 1.6) * (0.8 + 0.2 * Math.sin(rPod * 28));
    // a wrong pick on the pod shakes its door in its frame, and dies away
    const shudder = 3 * Math.sin(rPod * Math.PI * 9) * (1 - rPod) + 2.4 * Math.sin(rMine * Math.PI * 9) * (1 - rMine);
    const rattle = 2.6 * Math.sin(rHatch * Math.PI * 7) * (1 - rHatch);
    // Q2: the beam tips toward a claimant and will not stay; on the balance, it settles level
    const beamDeg = -15 * Math.sin(Math.PI * rMine) + 15 * Math.sin(Math.PI * rDouble)
      + 5 * Math.sin(rEqual * Math.PI * 3) * (1 - rEqual);
    const glint = Math.sin(Math.PI * clamp01((rEqual - 0.55) / 0.45));
    // the plate is stamped down: it lands big, squashes and settles
    const platePop = 1 + 0.22 * Math.sin(Math.PI * clamp01(rEqual * 2.2)) * (1 - clamp01((rEqual - 0.45) / 0.55));

    const vo = pose(figV, xV, gV, K, dV, 1);
    const bn = pose(figB, BN_X, GROUND, K, dB, 1);
    const ph = pose(figP, xP, gP, K, dP, sage);
    const db = pose(figD, xDs, gD, KD, dD, dbl);

    return {
      vo, bn, ph, db,
      ring: warm * (1 - ringDim) * (0.86 + 0.14 * Math.sin(t * 2.6)),
      door, jolt: jolt + shudder, lid, rattle, flash, glint, beamDeg, platePop,
      trail: rMoon,
      moonPod: Math.max(clamp01(rMoon * 1.5 - 0.5), moonFlash),
      plate: carry(cv, 4, n, PLATE[p], PLATE[n], tr),
      q1: carry(cv, 11, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 12, n, Q2[p], Q2[n], tr),
      t,
    };
  });

  const DV = useDerivedValue<Bundle>(() => SCENE.value.vo);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.ph);
  const DD = useDerivedValue<Bundle>(() => SCENE.value.db);

  return (
    <View style={styles.scene}>
      <View style={styles.wall} pointerEvents="none" />
      <View style={styles.seamA} pointerEvents="none" />
      <View style={styles.seamB} pointerEvents="none" />
      <View style={styles.stowage} pointerEvents="none">
        <View style={styles.sheet} />
        <View style={[styles.sheetLine, { top: 8 }]} />
        <View style={[styles.sheetLine, { top: 13 }]} />
        <View style={[styles.sheetLine, { top: 18, width: 12 }]} />
        <View style={[styles.led, { left: 44, backgroundColor: W.p5Phosphor.base }]} />
        <View style={[styles.led, { left: 52, backgroundColor: W.p5Red.base }]} />
        <View style={styles.strap} />
      </View>
      <View style={styles.ceiling} pointerEvents="none" />
      <View style={styles.ceilingLight} pointerEvents="none" />
      <View style={styles.rail} pointerEvents="none" />
      <View style={styles.railFootA} pointerEvents="none" />
      <View style={styles.railFootB} pointerEvents="none" />
      <View style={styles.kick} pointerEvents="none" />
      <ObjectArt parts={PORTHOLE_ART} tone={TONE} />
      <Space S={SCENE} />
      <ObjectArt parts={MONITOR_ART} tone={TONE} />
      <MoonScreen S={SCENE} />
      <MoonPod D={DD} />
      <View style={styles.strip} pointerEvents="none">
        <LiveDot S={SCENE} />
        <Text style={styles.stripText}>MOON BASE</Text>
      </View>
      <ObjectArt parts={HATCH_ART} tone={TONE} />
      <View style={styles.floor} pointerEvents="none" />
      <Beam S={SCENE} />
      <ObjectArt parts={POD_BACK_ART} tone={TONE} />
      <ObjectArt parts={PAD_ART} tone={TONE} />
      <Lid S={SCENE} />
      <ObjectArt parts={CONSOLE_ART} tone={TONE} />
      <ObjectArt parts={DESK_ART} tone={TONE} />
      <Balance S={SCENE} />
      <EqualPlate S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: plain */}
      <Stickman D={DV} k={K} role="lead" wear={[]} />
      <Door S={SCENE} />
      <ObjectArt parts={POD_FRONT_ART} tone={TONE} />
      <Ring S={SCENE} />
      <Flash S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="second" wear={BY_ID.bun.pieces} />
      {/* cast: tophat */}
      <Stickman D={DP} k={K} role="crowd" wear={BY_ID.magistrate.pieces} />
      <Trail S={SCENE} />
      {on(Q1) ? <WhereTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <ClaimTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the far layer: space through the porthole, the Moon on the screen ───────

/** Stars, and the Earth's limb turning past: two copies of one strip, so the loop has no seam. */
const STARS = [[6, 8], [20, 3], [33, 13], [47, 6], [58, 18], [12, 24]];
const EARTH_P = 100;
const LAND: [number, number, number, number][] = [[10, 26, 34, 16], [48, 46, 26, 20], [80, 20, 28, 12]];
const CLOUD: [number, number, number, number][] = [[28, 36, 26, 6], [64, 16, 34, 5], [92, 52, 28, 7], [6, 58, 24, 5]];
function Space({ S }: { S: SharedValue<any> }) {
  const stars = useAnimatedStyle(() => ({ transform: [{ translateX: -((S.value.t * 1.4) % 64) }] }));
  const earth = useAnimatedStyle(() => ({ transform: [{ translateX: -((S.value.t * 3.2) % EARTH_P) }] }));
  return (
    <View style={styles.window} pointerEvents="none">
      <Animated.View style={[styles.starStrip, stars]}>
        {[0, 64].map((o) => STARS.map(([x, y], k) => (
          <View key={`${o}-${k}`} style={[styles.star, { left: o + x, top: y }]} />
        )))}
      </Animated.View>
      <View style={styles.air} />
      <View style={styles.earth}>
        <Animated.View style={[styles.earthStrip, earth]}>
          {[0, EARTH_P].map((o) => LAND.map(([x, y, w, h], k) => (
            <View key={`l${o}-${k}`} style={[styles.land, { left: o + x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: h / 2 }]} />
          )))}
          {[0, EARTH_P].map((o) => CLOUD.map(([x, y, w, h], k) => (
            <View key={`c${o}-${k}`} style={[styles.cloud, { left: o + x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: h / 2 }]} />
          )))}
        </Animated.View>
        <View style={styles.night} />
      </View>
      <View style={styles.glassGlint} />
    </View>
  );
}

const MOON_STARS = [[8, 6], [22, 16], [40, 4], [55, 22], [70, 9], [88, 18], [104, 6], [97, 30], [30, 30]];
function MoonScreen({ S }: { S: SharedValue<any> }) {
  const tw = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.sin(S.value.t * 1.7) }));
  const glow = useAnimatedStyle(() => ({ opacity: S.value.moonPod }));
  return (
    <View style={styles.display} pointerEvents="none">
      {MOON_STARS.map(([x, y], k) => (
        <Animated.View key={k} style={[styles.moonStar, { left: x, top: y }, k % 3 === 0 ? tw : null]} />
      ))}
      <ObjectArt parts={DOME_ART} tone={TONE} />
      <View style={styles.moonGround} />
      <View style={[styles.crater, { left: 6, top: 66, width: 16, height: 4 }]} />
      <View style={[styles.crater, { left: 84, top: 68, width: 20, height: 4 }]} />
      <ObjectArt parts={MODULE_ART} tone={TONE} />
      <Animated.View style={[styles.mpodGlow, glow]} />
    </View>
  );
}
/** The Moon pod and the man stepping out of it, on the stage, inside the display's rectangle. */
function MoonPod({ D }: { D: SharedValue<Bundle> }) {
  return (
    <>
      <ObjectArt parts={MPOD_BACK} tone={TONE} />
      {/* cast: plain — the same volunteer, on the Moon screen */}
      <Stickman D={D} k={KD} role="lead" wear={[]} />
      <ObjectArt parts={MPOD_FRONT} tone={TONE} />
    </>
  );
}

function LiveDot({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(S.value.t * 3.1)) }));
  return <Animated.View style={[styles.liveDot, st]} />;
}

// ── the machine's moving parts ──────────────────────────────────────────────

/** The column of light the pod fires up through the ceiling as it beams him. */
function Beam({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.flash }));
  return <Animated.View style={[styles.beam, st]} pointerEvents="none" />;
}
/** The pod's ring light: off, warming, humming. */
function Ring({ S }: { S: SharedValue<any> }) {
  const core = useAnimatedStyle(() => ({ opacity: S.value.ring }));
  const halo = useAnimatedStyle(() => ({ opacity: 0.35 * S.value.ring }));
  return (
    <>
      <Animated.View style={[styles.ringHalo, halo]} pointerEvents="none" />
      <Animated.View style={[styles.ringCore, core]} pointerEvents="none" />
    </>
  );
}
/** The flash inside the chamber, round the door. */
function Flash({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.flash }));
  return <Animated.View style={[styles.flash, st]} pointerEvents="none" />;
}
/** The door: a shutter that slides down out of the cap, between the pillars. */
function Door({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: -OPEN.h * (1 - S.value.door) - S.value.jolt }] }));
  return (
    <View style={styles.doorWell} pointerEvents="none">
      <Animated.View style={[styles.door, st]}>
        <View style={styles.doorSeam} />
        <View style={styles.doorPort} />
        <View style={styles.doorGlint} />
      </Animated.View>
    </View>
  );
}
/** The recycler's lid: swings down open about its foot, and rattles. */
function Lid({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.rattle }, { scaleY: 1 - 0.72 * S.value.lid }],
  }));
  return (
    <Animated.View style={[styles.lidRider, st]} pointerEvents="none">
      <ObjectArt parts={LID_ART} tone={TONE} />
      <View style={styles.lidPlate}>
        <Text style={styles.plateText}>RECYCLE</Text>
      </View>
    </Animated.View>
  );
}
/** Where a pan hangs: the end of the beam, turned by `deg`. */
function panAt(deg: number, side: number) {
  'worklet';
  const a = (deg * Math.PI) / 180;
  return { x: PIVOT.x + side * ARM * Math.cos(a), y: PIVOT.y + side * ARM * Math.sin(a) };
}
/** The brass balance: the beam turns on its pivot, the pans hang plumb from its ends. */
function Balance({ S }: { S: SharedValue<any> }) {
  const beam = useAnimatedStyle(() => ({
    transform: [{ translateX: PIVOT.x }, { translateY: PIVOT.y }, { rotate: `${S.value.beamDeg}deg` }],
  }));
  const left = useAnimatedStyle(() => {
    const at = panAt(S.value.beamDeg, -1);
    return { transform: [{ translateX: at.x }, { translateY: at.y }] };
  });
  const right = useAnimatedStyle(() => {
    const at = panAt(S.value.beamDeg, 1);
    return { transform: [{ translateX: at.x }, { translateY: at.y }] };
  });
  const glint = useAnimatedStyle(() => ({
    opacity: S.value.glint,
    transform: [{ translateX: PIVOT.x }, { translateY: PIVOT.y - 7 }, { scale: 0.4 + 0.8 * S.value.glint }, { rotate: '45deg' }],
  }));
  return (
    <>
      <ObjectArt parts={STAND_ART} tone={TONE} />
      <Animated.View style={[styles.rider, left]} pointerEvents="none"><ObjectArt parts={PAN_ART} tone={TONE} /></Animated.View>
      <Animated.View style={[styles.rider, right]} pointerEvents="none"><ObjectArt parts={PAN_ART} tone={TONE} /></Animated.View>
      <Animated.View style={[styles.rider, beam]} pointerEvents="none"><ObjectArt parts={BEAM_ART} tone={TONE} /></Animated.View>
      <Animated.View style={[styles.rider, glint]} pointerEvents="none">
        <View style={styles.glintA} />
        <View style={styles.glintB} />
      </Animated.View>
    </>
  );
}
/** EQUAL CLAIM, on the console's front, from the second question on. */
function EqualPlate({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.plate, transform: [{ scale: S.value.platePop }] }));
  return (
    <Animated.View style={[styles.equalPlate, st]} pointerEvents="none">
      <Text style={styles.plateText}>EQUAL</Text>
      <Text style={styles.plateText}>CLAIM</Text>
    </Animated.View>
  );
}
/** Q1's right answer: light flies from the pod to the Moon, dot after dot. */
function Trail({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {TRAIL.map((d, k) => <TrailDot key={k} S={S} k={k} x={d.x} y={d.y} />)}
    </>
  );
}
function TrailDot({ S, k, x, y }: { S: SharedValue<any>; k: number; x: number; y: number }) {
  const st = useAnimatedStyle(() => {
    const u = clamp01((S.value.trail * 1.3 - k / 9) * 6);
    return { opacity: u, transform: [{ translateX: x }, { translateY: y }, { scale: 0.5 + 0.5 * u }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.trailDot} /></Animated.View>;
}

// ── the two questions ────────────────────────────────────────────────────────

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
const SCREEN_Q = { left: MONITOR.x - MONITOR.w / 2, top: MONITOR.y - MONITOR.h / 2, w: MONITOR.w, h: MONITOR.h, r: 5 };
const POD_Q = { left: POD.x - POD.w / 2, top: POD.y - POD.h / 2, w: POD.w, h: 102, r: 6 };
/** FOLLOW HIM: on the memory view, he will be on the Moon. */
const WHERE_Q: Q[] = [
  { id: 'moon', ...SCREEN_Q, correct: true },
  { id: 'pod', ...POD_Q, correct: false },
  { id: 'hatch', left: 117, top: 468, w: 60, h: 48, r: 3, correct: false },
];
/** WEIGH THE CLAIMS: neither has the better claim — the balance. */
const CLAIM_Q: Q[] = [
  { id: 'mine', ...POD_Q, correct: false },
  { id: 'double', ...SCREEN_Q, correct: false },
  { id: 'equal', left: 210, top: 406, w: 64, h: 88, r: 4, correct: true },
];
function WhereTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={WHERE_Q} k="q1" />;
}
function ClaimTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={CLAIM_Q} k="q2" />;
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

const W = NATURAL;
const EARTH_R = 50;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  wall: { position: 'absolute', left: 0, right: 0, top: 224, height: GROUND - 224, backgroundColor: W.p5Wall.base },
  seamA: { position: 'absolute', left: 178, top: 240, width: 1.4, height: GROUND - 240, backgroundColor: W.p5Wall.shade },
  seamB: { position: 'absolute', left: 266, top: 240, width: 1.4, height: GROUND - 240, backgroundColor: W.p5Wall.shade },
  ceiling: {
    position: 'absolute', left: 0, right: 0, top: 224, height: 16, backgroundColor: W.p5Trim.base,
    borderBottomWidth: 1.5, borderBottomColor: W.p5Trim.shade,
  },
  ceilingLight: { position: 'absolute', left: 120, width: 140, top: 241.5, height: 3, borderRadius: 1.5, backgroundColor: W.p5Lamp.base },
  rail: { position: 'absolute', left: 168, width: 104, top: 398, height: 4, borderRadius: 2, backgroundColor: W.p5Rail.base },
  railFootA: { position: 'absolute', left: 176, width: 3, top: 400, height: 6, backgroundColor: W.p5Rail.shade },
  railFootB: { position: 'absolute', left: 260, width: 3, top: 400, height: 6, backgroundColor: W.p5Rail.shade },
  stowage: {
    position: 'absolute', left: 190, top: 262, width: 66, height: 64, borderRadius: 6,
    backgroundColor: W.p5Wall.base, borderWidth: 1.4, borderColor: W.p5Wall.shade,
  },
  sheet: { position: 'absolute', left: 8, top: 4, width: 26, height: 30, backgroundColor: W.p5Dome.base, borderWidth: 1, borderColor: W.p5Trim.base },
  sheetLine: { position: 'absolute', left: 12, width: 18, height: 1.2, backgroundColor: W.p5Trim.shade },
  led: { position: 'absolute', top: 8, width: 4, height: 4, borderRadius: 2 },
  strap: { position: 'absolute', left: 6, right: 6, top: 44, height: 5, borderRadius: 2.5, backgroundColor: W.p5Rail.base },
  kick: { position: 'absolute', left: 0, right: 0, top: GROUND - 8, height: 8, backgroundColor: W.p5Trim.shade },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },

  window: {
    position: 'absolute', left: WINDOW.x - WINDOW.r, top: WINDOW.y - WINDOW.r, width: 2 * WINDOW.r, height: 2 * WINDOW.r,
    borderRadius: WINDOW.r, overflow: 'hidden', backgroundColor: W.p5Space.base,
  },
  starStrip: { position: 'absolute', left: 0, top: 0, width: 128, height: 40 },
  star: { position: 'absolute', width: 1.8, height: 1.8, borderRadius: 0.9, backgroundColor: W.cloudWhite.base },
  air: {
    position: 'absolute', left: 22 - 3, top: 30 - 3, width: 2 * EARTH_R + 6, height: 2 * EARTH_R + 6,
    borderRadius: EARTH_R + 3, backgroundColor: W.p5Air.base,
  },
  earth: {
    position: 'absolute', left: 22, top: 30, width: 2 * EARTH_R, height: 2 * EARTH_R,
    borderRadius: EARTH_R, overflow: 'hidden', backgroundColor: W.p5Sea.base,
  },
  earthStrip: { position: 'absolute', left: 0, top: 0, width: 2 * EARTH_P, height: 2 * EARTH_R },
  land: { position: 'absolute', backgroundColor: W.p5Land.base },
  cloud: { position: 'absolute', backgroundColor: W.cloudWhite.base, opacity: 0.92 },
  night: {
    position: 'absolute', left: 2 * EARTH_R - 26, top: 0, width: 26, height: 2 * EARTH_R,
    backgroundColor: W.p5Space.base, opacity: 0.32,
  },
  glassGlint: {
    position: 'absolute', left: 10, top: 12, width: 14, height: 3, borderRadius: 1.5,
    backgroundColor: W.cloudWhite.base, opacity: 0.35, transform: [{ rotate: '-35deg' }],
  },

  display: {
    position: 'absolute', left: DISPLAY.left, top: DISPLAY.top, width: DISPLAY.w, height: DISPLAY.h,
    overflow: 'hidden', borderRadius: 2,
  },
  moonStar: { position: 'absolute', width: 1.6, height: 1.6, borderRadius: 0.8, backgroundColor: W.cloudWhite.base },
  moonGround: {
    position: 'absolute', left: -90, top: MOON_GROUND - 6, width: DISPLAY.w + 180, height: 140,
    borderRadius: 140, backgroundColor: W.p5Dust.base,
  },
  crater: { position: 'absolute', borderRadius: 4, backgroundColor: W.p5Dust.shade },
  mpodGlow: {
    position: 'absolute', left: MPOD.x - 18, top: MPOD.y - 22, width: 36, height: 44, borderRadius: 18,
    backgroundColor: W.p5Glow.base, opacity: 0,
  },
  strip: {
    position: 'absolute', left: STRIP.left, top: STRIP.top, width: STRIP.w, height: STRIP.h,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
  },
  liveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: W.p5Red.base, marginRight: 4 },
  stripText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.8, color: W.p5Bezel.label, includeFontPadding: false,
  },

  beam: {
    position: 'absolute', left: POD.x - 9, top: 224, width: 18, height: POD.y - POD.h / 2 - 224 + 6,
    borderRadius: 9, backgroundColor: W.p5Glow.base,
  },
  ringHalo: {
    position: 'absolute', left: RING.left - 4, top: RING.top - 4, width: RING.w + 8, height: RING.h + 8,
    borderRadius: (RING.h + 8) / 2, backgroundColor: W.p5Glow.base,
  },
  ringCore: {
    position: 'absolute', left: RING.left, top: RING.top + 1.5, width: RING.w, height: 3,
    borderRadius: 1.5, backgroundColor: W.p5Glow.base,
  },
  flash: {
    position: 'absolute', left: OPEN.left - 6, top: OPEN.top - 4, width: OPEN.w + 12, height: OPEN.h + 6,
    borderRadius: 8, backgroundColor: W.p5Glow.base,
  },
  doorWell: { position: 'absolute', left: OPEN.left, top: OPEN.top, width: OPEN.w, height: OPEN.h, overflow: 'hidden' },
  door: {
    position: 'absolute', left: 0, top: 0, width: OPEN.w, height: OPEN.h,
    backgroundColor: W.p5Shell.base, borderWidth: 1.4, borderColor: W.p5Shell.shade,
  },
  doorSeam: { position: 'absolute', left: OPEN.w / 2 - 0.7, top: 0, width: 1.4, height: OPEN.h, backgroundColor: W.p5Shell.shade },
  doorPort: {
    position: 'absolute', left: OPEN.w / 2 - 9, top: 14, width: 18, height: 18, borderRadius: 9,
    backgroundColor: W.p5Inside.base, borderWidth: 2, borderColor: W.p5Trim.base,
  },
  doorGlint: {
    position: 'absolute', left: OPEN.w / 2 - 4, top: 18, width: 5, height: 2, borderRadius: 1,
    backgroundColor: W.cloudWhite.base, opacity: 0.6,
  },

  lidRider: {
    position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H,
    transformOrigin: `${LID.x}px ${LID.y + LID.h / 2}px`,
  },
  lidPlate: {
    position: 'absolute', left: LID_PLATE.left, top: LID_PLATE.top, width: LID_PLATE.w, height: LID_PLATE.h,
    alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: W.p5Trim.label, includeFontPadding: false,
  },
  equalPlate: {
    position: 'absolute', left: EQUAL_PLATE.left, top: EQUAL_PLATE.top, width: EQUAL_PLATE.w, height: EQUAL_PLATE.h,
    borderRadius: 2, backgroundColor: W.brass.base, alignItems: 'center', justifyContent: 'center',
  },
  glintA: { position: 'absolute', left: -6, top: -1, width: 12, height: 2, borderRadius: 1, backgroundColor: W.cloudWhite.base },
  glintB: { position: 'absolute', left: -1, top: -6, width: 2, height: 12, borderRadius: 1, backgroundColor: W.cloudWhite.base },
  trailDot: {
    position: 'absolute', left: -3.5, top: -3.5, width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: W.p5Glow.base, borderWidth: 1.2, borderColor: W.cloudWhite.base,
  },
  clear: { flexGrow: 1 },
});

export function Phil5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Phil5Scene} band={[224, 518]} camera={CAM} />;
}
