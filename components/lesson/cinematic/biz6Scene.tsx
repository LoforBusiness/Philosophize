import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useDerivedValue, useAnimatedStyle, useSharedValue, withTiming, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import LessonPicture from './LessonPicture';
import { BEATS } from './biz6Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { actStance, emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, tint, coin, bz6BoothBack, bz6BoothFront, bz6Popcorn, bz6Glow, bz6Lantern,
  bz6LanternR, bz6Torch, bz6TorchPlate, bz6Bell, bz6Counter, bz6Board, bz6Pumpkin, BZ6_HUB, BZ6_SLOT, BZ6_KNOB,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// business-foundations-6, "When Do You Break Even?" — A HAUNTED CASTLE ON OPENING NIGHT.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The owner of Castle Fright (plain, vain) throws
// the gate open sure he is rich after one ticket; the ticket seller (the cap, kind) sells
// from a purple booth beside a pay turnstile, whose guests are, this being a haunted
// castle, invisible — the turnstile turns by itself and the big counter over the gate
// rolls; the accountant (the top hat) splits the costs into fixed and variable, and pulls
// a torch on the wall that spins a secret panel round to show a chalkboard where the two
// lines cross.
//
//   b0   the owner pulls the left leaf of the iron gate open and walks with it, throws his
//        arms up at the guests ("Welcome to Castle Fright!"), then points up at the
//        cobweb in the arch ("a fortune on cobwebs").
//   b1   the seller lifts a ticket from under the ledge and holds it out — it floats out of
//        his hand to the turnstile, which turns by itself (an invisible guest: the counter
//        rolls to 1); he lifts a popcorn tub onto the ledge, then a glow stick in its tin
//        cup, and their price tags swing out on "five pounds each". The accountant walks
//        in from the right.
//   b2   the accountant points up at the castle, at the lit window where a ghost's shadow
//        drifts past ("the actors"), at the lanterns (they flare), at the rent bill on the
//        gate (it flutters) and at the counter ("however many people come").
//   b3   he holds one hand out flat and still ("fixed"), and raises the other in three
//        steps, higher and higher ("grow with every guest").
//   b4   Q1 TAG THE COST: the rent bill on the gate, the popcorn tub and the glow stick.
//   b5   the turnstile turns again (guest two); the owner walks to it, takes a coin from
//        his pocket and taps it into the coin box on top, turns and throws his arms up.
//   b6   the owner walks back; the accountant takes three coins from his waistcoat, one
//        at a time, and stacks them on the barrel beside the bill.
//   b7   the seller steps to the end of the booth and presses the turnstile's click lever
//        twice — the turnstile spins on its own as a crowd of invisible guests streams
//        through and the counter rolls up to 40; he steps back and looks up at the
//        accountant.
//   b8   the accountant pulls the torch on the wall down like a lever; the stone panel
//        beside it spins round to show a chalkboard with SALES and COSTS crossing; he
//        takes the chalk and draws a line down from the crossing, and rings it.
//   b9   Q2 STOP THE COUNTER: three flags pop up over the counter, 50, 100 and 1,000.
//   b10  the turnstile turns, the counter clicks over to 101, PAID is stamped on the rent
//        bill and the owner leaps in the air; bats burst out of the keep.
//   b11  everyone at ease under the quotation, a bat crossing the moon; b12 summary.
//
// COMPOSITION, in stage units. A night sky over the band's top (252); the moon at
// (84, 304); the keep behind the gatehouse 214–372 × 266–382, with lit windows. The
// gatehouse: a left tower 150–190 and a right tower 280–326 rising to 312 (merlons to
// 304), the wall between them to 330, a round arch 192–278 with its crown at 389 and its
// springing at 432, a torchlit passage behind it, and an iron gate of two leaves
// (192–235 and 235–278, 432–500). The counter hangs over the arch, 162–308 × 342–382. The
// ticket booth stands at the left, 2–114 × 352–500, its ledge at 462 (the hip, AP10),
// the seller inside it at 62; the turnstile at 120–166, its hub at hip height (455).
// The owner stands at 216 in the open gateway, the accountant at 314 by the barrel
// (286–306), the torch at 330 and the secret panel 338–398 × 398–480 on the right wall.
// Band [252, 514]: 78 units of figure in 262, 30%.
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners nod along with their hands still (AP18). The haunting is
// the scene's own: no figure is on the stage who does not speak (AU5).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('business');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 262-unit band: 30%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, business-foundations-6). 0 for a beat with no voice.
 */
const LINES = [4.87, 5.71, 4.66, 5.99, 0, 3.56, 6.23, 4.22, 3.91, 0, 3.66, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along.
const TALK = 167;
const EXPLAIN = 259;
const LISTEN = 159;
const NOD = 263;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_WELCOME = is('welcome');
const A_BOOTH = is('booth');
const A_FIXED = is('fixed');
const A_SPLIT = is('split');
const A_RICH = is('rich');
const A_TENS = is('tens');
const A_LATER = is('later');
const A_POINT = is('point');
const A_SCREAM = is('scream');
const A_REST = is('rest');
const Q1 = BEATS.map((b) => (b.costs ? 1 : 0));
const Q2 = BEATS.map((b) => (b.counter ? 1 : 0));
const GUESTS = BEATS.map((b) => b.guests ?? 0);
const BOOTH_N = A_BOOTH.indexOf(1);
const FIXED_N = A_FIXED.indexOf(1);
const RICH_N = A_RICH.indexOf(1);
const TENS_N = A_TENS.indexOf(1);
const LATER_N = A_LATER.indexOf(1);
const POINT_N = A_POINT.indexOf(1);
const Q2_N = Q2.indexOf(1);
const SCREAM_N = A_SCREAM.indexOf(1);
const REST_N = A_REST.indexOf(1);
/** Beats from (or up to) a given one: what is mounted only when it can be seen. */
const from = (k: number) => BEATS.map((_, n) => (n >= k ? 1 : 0));
const FROM_BOOTH = from(BOOTH_N);
const FROM_TENS = from(TENS_N);
const FROM_POINT = from(POINT_N);
const UPTO_POINT = BEATS.map((_, n) => (n <= POINT_N ? 1 : 0));
const FROM_SCREAM = from(SCREAM_N);
const FROM_REST = from(REST_N);

// ── where each of them stands, and which way each faces, beat by beat ────────
// A leg is [fraction of the line it starts at, x]; a turn is [fraction, facing].
type Track = readonly (readonly number[])[];
/** The owner: in the open gateway, once he has walked the gate open on b0. */
const PL_HOME = 216;
const PL_START = 228;
/** By the turnstile, to drop his coin in its box (b5). */
const PL_COIN = 168;
const PL_LEGS: Track[] = BEATS.map((_, n) => {
  if (A_WELCOME[n]) return [[0, PL_START], [0.12, PL_HOME]];
  if (A_RICH[n]) return [[0, PL_HOME], [0.02, PL_COIN]];
  return [[0, PL_HOME]];
});
const PL_TURN: Track[] = BEATS.map((_, n) => {
  if (n <= BOOTH_N || A_LATER[n]) return [[0, -1]];
  if (A_RICH[n]) return [[0, -1], [0.55, 1]];
  return [[0, 1]];
});
/** The seller, inside the booth: he steps along it to the things he lifts. */
const CP_HOME = 62;
const CP_LEGS: Track[] = BEATS.map((_, n) => {
  if (A_BOOTH[n]) return [[0, CP_HOME], [0.26, 50], [0.5, 66], [0.76, CP_HOME]];
  if (A_LATER[n]) return [[0, CP_HOME], [0.02, 100], [0.52, CP_HOME]];
  return [[0, CP_HOME]];
});
const CP_TURN: Track[] = BEATS.map((_, n) => (A_BOOTH[n] ? [[0, 1], [0.26, -1], [0.49, 1]] : [[0, 1]]));
/** The accountant: off the stage, right, until he walks in on b1; at the board from b8. */
const TH_OFF = 440;
const TH_HOME = 314;
const TH_BOARD = 344;
const TH_LEGS: Track[] = BEATS.map((_, n) => {
  if (n < BOOTH_N) return [[0, TH_OFF]];
  if (A_BOOTH[n]) return [[0, TH_OFF], [0.42, TH_HOME]];
  if (A_POINT[n]) return [[0, TH_HOME], [0.34, TH_BOARD]];
  return [[0, n > POINT_N ? TH_BOARD : TH_HOME]];
});
const TH_TURN: Track[] = BEATS.map((_, n) => (A_POINT[n] ? [[0, 1], [0.95, -1]] : [[0, -1]]));
/** What each is doing with his body: talking while he speaks, nodding along while he does not. */
const PL_P = [TALK, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, TALK, NOD, LISTEN];
const CP_P = [NOD, TALK, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD, LISTEN];
const TH_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, NOD, NOD, EXPLAIN, NOD, EXPLAIN, NOD, NOD, NOD, LISTEN];

// ── the gatehouse ───────────────────────────────────────────────────────────
const ARCH = { x0: 192, x1: 278, cx: 235, spring: 432, r: 43 };
const LEAF_W = 43;
/** The cobweb strung in the corner over the arch, where the owner points on b0. */
const WEB_AT = { x: 192, y: 384 };
/** The rent bill pinned to the right leaf, and the barrel beside it. */
const BILL = { left: 238, top: 428, w: 40, h: 52 };
const BARREL = { x: 296, y: 484 };
const STACK_Y = 467;
/** Where his hand hangs over the barrel to let the coins fall, and when each one goes. */
const DROP_AT = { x: 296, y: 452 };
const DROPS = [0.38, 0.54, 0.7];
/** The two wall lanterns flanking the arch, and where their flames burn. */
const LAMP_L = { x: 177, y: 414.5 };
const LAMP_R = { x: 293, y: 414.5 };
const FLAME_L = { x: 182, y: 414 };
const FLAME_R = { x: 288, y: 414 };
/** The torch-lever on the wall left of the secret panel, about its pivot. */
const TORCH = { x: 331, y: 446 };
/** Where the accountant grips the torch, on its shaft just above the pivot. */
const TORCH_GRIP = -7;
/** The secret panel: a stone slab that spins round to show the chalkboard. */
const PANEL = { left: 338, top: 398, w: 60, h: 82 };
/** The chart on the board, in the panel's own units. */
const AXIS = { x: 8, top: 8, y: 63.2, right: 55 };
const COSTS = { x1: 8, y1: 52, x2: 54, y2: 46 };
const SALES = { x1: 8, y1: 64, x2: 54, y2: 26 };
const CROSS = (() => {
  const c = (COSTS.y1 - COSTS.y2) / (COSTS.x2 - COSTS.x1);
  const s = (SALES.y1 - SALES.y2) / (SALES.x2 - SALES.x1);
  const u = (SALES.y1 - COSTS.y1) / (s - c);
  return { x: COSTS.x1 + u, y: COSTS.y1 - c * u };
})();
const CROSS_AT = { x: PANEL.left + CROSS.x, y: PANEL.top + CROSS.y };
const AXIS_AT = { x: PANEL.left + CROSS.x, y: PANEL.top + AXIS.y };
const TRAY_AT = { x: PANEL.left + 12, y: PANEL.top + 75.5 };

// ── the counter over the arch ───────────────────────────────────────────────
const COUNTER = { x: 235, y: 362, w: 146, h: 40 };
const DRUM = { w: 16, h: 18, gap: 5, top: 359.5 };
const DRUM_X = [0, 1, 2, 3].map((k) => 195.5 + k * (DRUM.w + DRUM.gap));
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
/** The bell on its bracket off the counter's right end. */
const BELL_AT = { x: 318, y: 347 };

// ── the booth, and what crosses its ledge ───────────────────────────────────
const LEDGE = 462;
/** Under the ledge (hidden by the booth's front), and where each thing is set down. */
const TICKET_UNDER = { x: 70, y: 476 };
const TICKET_OUT = { x: 84, y: 448 };
const TICKET_GONE = { x: 144, y: 436 };
const POP_UNDER = { x: 46, y: 480 };
const POP_AT = { x: 32, y: LEDGE };
const GLOW_UNDER = { x: 76, y: 482 };
const GLOW_AT = { x: 86, y: LEDGE };
/** The price tags hang from the ledge's lip under each thing. */
const TAG_Y = 467;

// ── the turnstile ───────────────────────────────────────────────────────────
const TURN = { x: 143, y: 472, w: 46, h: 56 };
const HUB = { x: TURN.x - TURN.w / 2 + BZ6_HUB.x, y: TURN.y - TURN.h / 2 + BZ6_HUB.y + 2 };
const SLOT_AT = { x: TURN.x - TURN.w / 2 + BZ6_SLOT.x, y: TURN.y - TURN.h / 2 + BZ6_SLOT.y };
const KNOB_AT = { x: TURN.x - TURN.w / 2 + BZ6_KNOB.x, y: TURN.y - TURN.h / 2 + BZ6_KNOB.y };
const ARM_LEN = 24;
const ARM_TILT = 6;

// ── object drawings, laid 1:1 ───────────────────────────────────────────────
const BOOTH_BACK_ART = bz6BoothBack(58, 426, 112, 148);
const BOOTH_FRONT_ART = bz6BoothFront(58, 481, 116, 38);
const COUNTER_ART = bz6Counter(COUNTER.x, COUNTER.y, COUNTER.w, COUNTER.h);
const LAMP_L_ART = bz6Lantern(LAMP_L.x, LAMP_L.y, 22, 33);
const LAMP_R_ART = bz6LanternR(LAMP_R.x, LAMP_R.y, 22, 33);
const PUMPKIN_ARTS = [bz6Pumpkin(178, 492, 20, 16), bz6Pumpkin(386, 492, 20, 16)];
const PLATE_ART = bz6TorchPlate(TORCH.x - 1, TORCH.y, 6, 14);
/** Drawn about its pivot (the ring, 3 units below the drawing's middle). */
const TORCH_ART = bz6Torch(0, -3, 12, 30);
/** Drawn about the middle of its foot. */
const POP_ART = bz6Popcorn(0, -14, 20, 28);
const GLOW_ART = bz6Glow(0, -17, 12, 34);
const BELL_ART = bz6Bell(0, 6.5, 10, 13);
const BOARD_ART = bz6Board(30, 41, 60, 82);
const COIN_ART = tint(coin(0, 0, 7, 7), 'brass');

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A point moved along a chain of stops by the stage values that carry it between them. */
function via(pts: readonly { x: number; y: number }[], us: readonly number[]) {
  'worklet';
  let x = pts[0].x;
  let y = pts[0].y;
  for (let k = 0; k < us.length; k++) {
    x = lerp(x, pts[k + 1].x, us[k]);
    y = lerp(y, pts[k + 1].y, us[k]);
  }
  return { x, y };
}
/** Looking up: the head lifted on the neck, the chest a touch back. */
function lookUp(s: Stance, u: number): Stance {
  'worklet';
  return { ...s, neck: s.neck + 0.34 * u, tilt: s.tilt + 0.05 * u };
}
/** How far along a window a value is, 0 outside it and 1 at its far end. */
function within(v: number, a: number, z: number) {
  'worklet';
  return clamp01((v - a) / (z - a));
}
/** A counter drum's place, 0–10 (10 is the 0 at the foot of the drum), odometer-style. */
function drum(g: number, k: number) {
  'worklet';
  const p = Math.pow(10, k);
  const whole = Math.floor(g / p);
  const rem = g - whole * p;
  return (whole % 10) + clamp01(rem - (p - 1));
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
  return { x, x0, x1, u: ease01(u), walking, end: free };
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
function bodyOf(w: { walking: boolean; x0: number; x1: number; u: number }, codes: readonly number[], n: number, t: number, b: number): Stance {
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

const CAM = followMoves(PL_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('business'));

/** Q1 TAG THE COST — the rent is right: it is the same however many come. */
const COST_Q = [
  { id: 'castle-rent', correct: true, box: { left: 235, top: 424, w: 46, h: 72 }, seal: 'tr' as const },
  // the ledge's seals go at the foot, on the booth's panel, not across the seller's face
  { id: 'popcorn-tub', correct: false, box: { left: 9, top: 426, w: 46, h: 60 }, seal: 'br' as const },
  { id: 'glow-stick', correct: false, box: { left: 63, top: 426, w: 46, h: 60 }, seal: 'br' as const },
];
/** Q2 STOP THE COUNTER — 100 is right: a hundred tens cover the thousand. */
const STOP_Q = [
  { id: 'fifty-guests', label: '50', stop: 50, x: 188, correct: false },
  { id: 'hundred-guests', label: '100', stop: 100, x: 235, correct: true },
  { id: 'thousand-guests', label: '1,000', stop: 1000, x: 282, correct: false },
];
const FLAG = { w: 40, h: 22, top: 302, stalk: 344 };

export default function Biz6Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldP = useHeld();
  const heldC = useHeld();
  const heldT = useHeld();
  const cv = useCarry(47);
  const on = useLinger(i);
  // Which thing was tapped on each question, and how far its reaction has run: the scene
  // answers in the game's own way (a FIXED tag swings onto the bill; a wrong tub or stick
  // multiplies; the counter rolls to the flag picked and stops, or jams).
  const pk1 = useSharedValue(-1);
  const pu1 = useSharedValue(0);
  const pk2 = useSharedValue(-1);
  const pu2 = useSharedValue(0);
  useEffect(() => {
    if (picked === null) return;
    if (Q1[i]) {
      pk1.value = COST_Q.findIndex((q) => q.id === picked);
      pu1.value = 0;
      pu1.value = withTiming(1, { duration: 1400, easing: Easing.linear });
    }
    if (Q2[i]) {
      pk2.value = STOP_Q.findIndex((q) => q.id === picked);
      pu2.value = 0;
      pu2.value = withTiming(1, { duration: 2400, easing: Easing.linear });
    }
  }, [picked, i, pk1, pu1, pk2, pu2]);

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

    // ── the guests: the counter's number and the turnstile's turns ──────────
    // the turnstile turns a third for each guest it lets through; on b7 it spins six
    // times round on its own while a crowd of invisible guests streams in
    let gNow = GUESTS[n];
    let rotNow = n < BOOTH_N ? 0 : n < RICH_N ? 1 : n < LATER_N ? 2 : n < SCREAM_N ? 20 : 21;
    if (A_BOOTH[n]) {
      gNow = st(0.32, 0.42);
      rotNow = ease01(st(0.3, 0.42));
    }
    if (A_RICH[n]) {
      gNow = 1 + st(0.04, 0.14);
      rotNow = 1 + ease01(st(0.0, 0.12));
    }
    if (A_LATER[n]) {
      const spin = ease01(st(0.3, 0.75));
      gNow = lerp(2, 40, spin);
      rotNow = 2 + 18 * spin;
    }
    const pick2 = Q2[n] ? pk2.value : -1;
    const u2 = pu2.value;
    if (Q2[n]) {
      gNow = 40;
      if (pick2 === 0) gNow = lerp(40, 50, ease01(within(u2, 0, 0.35)));
      if (pick2 === 1) gNow = lerp(40, 100, ease01(within(u2, 0, 0.55)));
      if (pick2 === 2) gNow = lerp(40, 1000, ease01(within(u2, 0, 0.62)));
    }
    if (A_SCREAM[n]) {
      gNow = 100 + st(0.06, 0.14);
      rotNow = 20 + ease01(st(0.04, 0.16));
    }
    const g = carry(cv, 7, n, gNow, gNow, tr);
    const rot = carry(cv, 8, n, rotNow, rotNow, tr);

    // ── the owner ───────────────────────────────────────────────────────────
    const srcP = carrySource(cv, 0, n, PL_START);
    const wp = legsOf(srcP, PL_LEGS[n], b, L);
    const xP = carry(cv, 0, n, wp.x, wp.x, 1);
    const dP = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, -1), PL_TURN[n], b, L), 1);
    let sp = bodyOf(wp, PL_P, n, t, b);
    // b0: from inside the gateway, behind the bars, he pushes the left leaf and it swings
    // out and open; then he steps out through it
    const leafNow = A_WELCOME[n] ? st(0.04, 0.2) : 1;
    const leaf = carry(cv, 6, n, leafNow, leafNow, tr);
    const leafScale = lerp(1, 0.21, ease01(leaf));
    if (A_WELCOME[n]) {
      sp = hand(sp, xP, GROUND, dP, 1, ARCH.x0 + LEAF_W * leafScale * 0.7, 462, st(0.0, 0.04) * (1 - st(0.2, 0.26)));
      // "Welcome to Castle Fright!": both arms thrown up and out, in front of him
      const up = bp(0.3, 0.38, 0.5);
      sp = hand(sp, xP, GROUND, dP, 1, xP + dP * 26, 438, up);
      sp = hand(sp, xP, GROUND, dP, -1, xP + dP * 22, 462, up);
      // "a fortune on cobwebs": a finger up at the web in the arch's corner
      sp = hand(sp, xP, GROUND, dP, 1, xP + dP * 24, 428, bp(0.6, 0.68, 0.94));
    }
    // b5: a coin out of his pocket, tapped into the turnstile's coin box; then, turned to
    // the accountant, both arms up — "I'm rich already!"
    let coinO = 0;
    if (A_RICH[n]) {
      const k = via([{ x: xP + dP * 3, y: 471 }, { x: SLOT_AT.x + 1, y: SLOT_AT.y - 2 }], [st(0.31, 0.41)]);
      sp = hand(sp, xP, GROUND, dP, 1, k.x, k.y, st(0.23, 0.29) * (1 - st(0.47, 0.54)));
      coinO = st(0.28, 0.3) * (1 - st(0.43, 0.45));
      const up = st(0.64, 0.74);
      sp = hand(sp, xP, GROUND, dP, 1, xP + dP * 24, 432, up);
      sp = hand(sp, xP, GROUND, dP, -1, xP + dP * 20, 448, up);
    }
    // b10: the counter clicks over, and he LEAPS (a played jump, timed to the line)
    let jumpW = 0;
    if (A_SCREAM[n]) {
      jumpW = st(0.1, 0.16) * (1 - st(0.66, 0.72));
      sp = mixStance(sp, actStance(3, t, st(0.16, 0.66)), jumpW);
      // the jump's own arms fling out behind him (AR4): his go up in front, a cheer
      // (held in his own frame, so they ride the jump rather than chase it)
      sp = {
        ...sp,
        fistR: { x: lerp(sp.fistR.x, 22, jumpW), y: lerp(sp.fistR.y, -38, jumpW) },
        fistL: { x: lerp(sp.fistL.x, 16, jumpW), y: lerp(sp.fistL.y, -24, jumpW) },
      };
    }
    const prevP = carryFrom(heldP, n, hHold(PL_P[p], t));
    const figP = keepHeld(heldP, wp.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));

    // ── the seller, in the booth ────────────────────────────────────────────
    const wc = legsOf(carrySource(cv, 2, n, CP_HOME), CP_LEGS[n], b, L);
    const xC = carry(cv, 2, n, wc.x, wc.x, 1);
    const dC = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, 1), CP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CP_P, n, t, b);
    // b1: the ticket lifted from under the ledge and held out; it floats away to the
    // turnstile (an invisible guest takes it)
    const tkUNow = A_BOOTH[n] ? st(0.06, 0.14) : n > BOOTH_N ? 1 : 0;
    const tkFNow = A_BOOTH[n] ? st(0.22, 0.38) : n > BOOTH_N ? 1 : 0;
    const tkU = carry(cv, 12, n, tkUNow, tkUNow, tr);
    const tkF = carry(cv, 13, n, tkFNow, tkFNow, tr);
    const tkHeld = via([TICKET_UNDER, TICKET_OUT], [tkU]);
    // the popcorn and the glow stick, each lifted from under the ledge and set on it
    const popUNow = A_BOOTH[n] ? st(0.36, 0.46) : n > BOOTH_N ? 1 : 0;
    const popONow = A_BOOTH[n] ? st(0.33, 0.36) : n > BOOTH_N ? 1 : 0;
    const glowUNow = A_BOOTH[n] ? st(0.6, 0.68) : n > BOOTH_N ? 1 : 0;
    const glowONow = A_BOOTH[n] ? st(0.57, 0.6) : n > BOOTH_N ? 1 : 0;
    const popU = carry(cv, 14, n, popUNow, popUNow, tr);
    const popO = carry(cv, 15, n, popONow, popONow, tr);
    const glowU = carry(cv, 16, n, glowUNow, glowUNow, tr);
    const glowO = carry(cv, 17, n, glowONow, glowONow, tr);
    const popAt = via([POP_UNDER, POP_AT], [ease01(popU)]);
    const glowAt = via([GLOW_UNDER, GLOW_AT], [ease01(glowU)]);
    if (A_BOOTH[n]) {
      sc = hand(sc, xC, GROUND, dC, 1, tkHeld.x, tkHeld.y - 1, st(0.0, 0.05) * (1 - st(0.24, 0.3)));
      sc = hand(sc, xC, GROUND, dC, 1, popAt.x + dC * -5, popAt.y - 7, st(0.3, 0.35) * (1 - st(0.47, 0.52)));
      sc = hand(sc, xC, GROUND, dC, 1, glowAt.x - 5, glowAt.y - 5, st(0.53, 0.57) * (1 - st(0.69, 0.74)));
    }
    // b7: at the end of the booth, the turnstile's click lever pressed twice (AR5)
    if (A_LATER[n]) {
      const press = 3 * (bp(0.22, 0.25, 0.28) + bp(0.32, 0.35, 0.38));
      sc = hand(sc, xC, GROUND, dC, 1, KNOB_AT.x - 1, KNOB_AT.y + press, st(0.14, 0.2) * (1 - st(0.44, 0.5)));
      sc = lookUp(sc, st(0.62, 0.74));
    }
    const prevC = carryFrom(heldC, n, hHold(CP_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the accountant ──────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 4, n, TH_OFF), TH_LEGS[n], b, L);
    const xT = carry(cv, 4, n, wt.x, wt.x, 1);
    const dT = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, -1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b);
    // b2: a pointing finger, a path from one thing to the next: the castle, the lit
    // window ("the actors"), the lantern, the bill, the counter
    if (A_FIXED[n]) {
      const k = via([
        { x: 255, y: 282 }, { x: 292, y: 304 }, { x: LAMP_R.x - 2, y: 412 }, { x: BILL.left + 20, y: 446 },
        { x: COUNTER.x + 30, y: 366 },
      ], [st(0.13, 0.19), st(0.26, 0.31), st(0.37, 0.43), st(0.7, 0.76)]);
      stt = hand(stt, xT, GROUND, dT, 1, k.x, k.y, st(0.0, 0.07) * (1 - st(0.9, 0.97)));
    }
    // b3: one hand out flat and still; the other raised in three steps
    if (A_SPLIT[n]) {
      stt = hand(stt, xT, GROUND, dT, -1, xT + dT * 17, 454, st(0.04, 0.12));
      const k = via([
        { x: xT + dT * 13, y: 466 }, { x: xT + dT * 15, y: 452 }, { x: xT + dT * 16, y: 440 }, { x: xT + dT * 15, y: 428 },
      ], [st(0.5, 0.55), st(0.62, 0.67), st(0.74, 0.79)]);
      stt = hand(stt, xT, GROUND, dT, 1, k.x, k.y, st(0.44, 0.5));
    }
    // b6: three coins out of the waistcoat in one go; the hand held over the barrel lets
    // them fall one at a time, a ten at a time, onto a stack (a path, then still: AR5)
    let thCoinO = 0;
    if (A_TENS[n]) {
      const k = via([{ x: xT + dT * 5, y: 452 }, DROP_AT], [st(0.22, 0.3)]);
      stt = hand(stt, xT, GROUND, dT, 1, k.x, k.y, st(0.12, 0.2) * (1 - st(0.82, 0.9)));
      thCoinO = within(b / L, 0.19, 0.2) * (1 - within(b / L, DROPS[2], DROPS[2] + 0.005));
    }
    // b8: the torch pulled down like a lever, the panel spins; the chalk off the tray, a
    // line down from where the two lines cross, a ring round it, the chalk back
    const torchNow = A_POINT[n] ? -38 * bp(0.12, 0.2, 0.3) : 0;
    const torch = carry(cv, 23, n, torchNow, torchNow, tr);
    const panelNow = A_POINT[n] ? st(0.18, 0.38) : n > POINT_N ? 1 : 0;
    const panel = carry(cv, 24, n, panelNow, panelNow, tr);
    const chalkNow = A_POINT[n]
      ? via([TRAY_AT, CROSS_AT, AXIS_AT, TRAY_AT], [st(0.56, 0.62), st(0.66, 0.8), st(0.84, 0.92)])
      : TRAY_AT;
    const chalkX = carry(cv, 27, n, chalkNow.x, chalkNow.x, tr);
    const chalkY = carry(cv, 19, n, chalkNow.y, chalkNow.y, tr);
    const lineNow = A_POINT[n] ? st(0.66, 0.8) : n > POINT_N ? 1 : 0;
    const ringNow = A_POINT[n] ? st(0.62, 0.67) : n > POINT_N ? 1 : 0;
    if (A_POINT[n]) {
      const r = (torch * Math.PI) / 180;
      const gx = TORCH.x - Math.sin(r) * TORCH_GRIP;
      const gy = TORCH.y + Math.cos(r) * TORCH_GRIP;
      stt = hand(stt, xT, GROUND, dT, 1, gx, gy, st(0.04, 0.11) * (1 - st(0.22, 0.27)));
      stt = hand(stt, xT, GROUND, dT, 1, chalkX, chalkY - 1, st(0.5, 0.56) * (1 - st(0.92, 0.97)));
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── posed, and what rides the hands ────────────────────────────────────
    const pl = pose(figP, xP, GROUND, K, dP, 1);
    const cp = pose(figC, xC, GROUND, K, dC, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const wPR = wristOf(pl, 'wrR');
    const wTR = wristOf(th, 'wrR');

    // the castle comes alive on b2: a ghost's shadow crosses the lit window, the lanterns
    // flare, the bill flutters on its pin
    const ghostNow = A_FIXED[n] ? st(0.12, 0.34) : n > FIXED_N ? 1 : 0;
    const flareNow = A_FIXED[n] ? bp(0.27, 0.32, 0.44) : 0;
    const flutterNow = A_FIXED[n] ? Math.sin(st(0.38, 0.58) * Math.PI * 3) * (1 - st(0.38, 0.58)) : 0;
    // the price tags swing out on "five pounds each"
    const tagsNow = A_BOOTH[n] ? st(0.74, 0.92) : n > BOOTH_N ? 1 : 0;
    // the accountant's stack: one coin, two, three
    const stackNow = (a: number) => {
      'worklet';
      return A_TENS[n] ? st(a, a + 0.05) : n > TENS_N ? 1 : 0;
    };

    // ── Q1 TAG THE COST: the reaction ───────────────────────────────────────
    const pick1 = Q1[n] ? pk1.value : -1;
    const u1 = pu1.value;
    const fixNow = pick1 === 0 ? within(u1, 0, 0.9) : 0;
    const copiesNow = pick1 === 1 ? ease01(within(u1, 0, 0.45)) : 0;
    const fanNow = pick1 === 2 ? ease01(within(u1, 0, 0.45)) : 0;
    const droopPNow = pick1 === 1 ? ease01(within(u1, 0.5, 0.8)) : 0;
    const droopGNow = pick1 === 2 ? ease01(within(u1, 0.5, 0.8)) : 0;

    // ── Q2 STOP THE COUNTER: the reaction ───────────────────────────────────
    const popNow = (k: number) => {
      'worklet';
      return pick2 === k ? ease01(within(u2, 0, 0.18)) : 0;
    };
    const droopNow = (k: number) => {
      'worklet';
      return pick2 === k && !STOP_Q[k].correct ? ease01(within(u2, k === 0 ? 0.42 : 0.82, k === 0 ? 0.62 : 0.97)) : 0;
    };
    const bellNow = pick2 === 1 ? within(u2, 0.56, 1) : 0;
    const stampNow = Q2[n]
      ? (pick2 === 1 ? ease01(within(u2, 0.58, 0.68)) : 0)
      : A_SCREAM[n] ? Math.max(carrySource(cv, 42, n, 0), ease01(st(0.12, 0.2))) : n > SCREAM_N ? 1 : 0;
    const jamNow = pick2 === 2 ? within(u2, 0.62, 0.9) : pick2 === 0 ? within(u2, 0.36, 0.46) * 0.6 : 0;
    const smokeNow = pick2 === 2 ? within(u2, 0.62, 1) : 0;
    // b10: bats burst out of the keep; b11: one bat crosses the moon
    const burstNow = A_SCREAM[n] ? st(0.58, 1) : n > SCREAM_N ? 1 : 0;
    const crossNow = A_REST[n] ? st(0.1, 0.9) : n > REST_N ? 1 : 0;

    return {
      pl, cp, th,
      g, rot,
      leaf: leafScale,
      ghost: carry(cv, 9, n, ghostNow, ghostNow, tr),
      flare: carry(cv, 10, n, flareNow, flareNow, tr),
      flutter: carry(cv, 11, n, flutterNow, flutterNow, tr),
      tk: { x: lerp(tkHeld.x, TICKET_GONE.x, tkF), y: lerp(tkHeld.y, TICKET_GONE.y, tkF) - 14 * Math.sin(Math.PI * tkF), o: clamp01(tkU * 6) * (1 - within(tkF, 0.6, 1)), r: 40 * tkF },
      pop: { x: popAt.x, y: popAt.y, o: popO },
      glow: { x: glowAt.x, y: glowAt.y, o: glowO },
      tags: carry(cv, 18, n, tagsNow, tagsNow, tr),
      coinP: { x: wPR.x, y: wPR.y, o: coinO },
      stack: [
        carry(cv, 20, n, stackNow(DROPS[0]), stackNow(DROPS[0]), tr),
        carry(cv, 21, n, stackNow(DROPS[1]), stackNow(DROPS[1]), tr),
        carry(cv, 22, n, stackNow(DROPS[2]), stackNow(DROPS[2]), tr),
      ],
      thCoin: { x: wTR.x, y: wTR.y, o: thCoinO },
      torch,
      panel,
      chalk: { x: chalkX, y: chalkY },
      line: carry(cv, 25, n, lineNow, lineNow, tr),
      ring: carry(cv, 26, n, ringNow, ringNow, tr),
      q1: carry(cv, 28, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 29, n, Q2[p], Q2[n], tr),
      copies: carry(cv, 30, n, copiesNow, copiesNow, tr),
      fan: carry(cv, 31, n, fanNow, fanNow, tr),
      fix: carry(cv, 32, n, fixNow, fixNow, tr),
      droopP: carry(cv, 33, n, droopPNow, droopPNow, tr),
      droopG: carry(cv, 34, n, droopGNow, droopGNow, tr),
      flagPop: [carry(cv, 35, n, popNow(0), popNow(0), tr), carry(cv, 36, n, popNow(1), popNow(1), tr), carry(cv, 37, n, popNow(2), popNow(2), tr)],
      flagDroop: [carry(cv, 38, n, droopNow(0), droopNow(0), tr), carry(cv, 39, n, droopNow(1), droopNow(1), tr), carry(cv, 40, n, droopNow(2), droopNow(2), tr)],
      bell: carry(cv, 41, n, bellNow, bellNow, tr),
      stamp: carry(cv, 42, n, stampNow, stampNow, tr),
      jam: carry(cv, 43, n, jamNow, jamNow, tr),
      jamU: u2,
      smoke: carry(cv, 44, n, smokeNow, smokeNow, tr),
      burst: carry(cv, 45, n, burstNow, burstNow, tr),
      cross: carry(cv, 46, n, crossNow, crossNow, tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Night clock={clock} S={SCENE} />
      <Gatehouse />
      {on(Q2) ? <Flags S={SCENE} /> : null}
      <CounterBoard S={SCENE} smoke={on(Q2)} />
      <Archway />
      <Lamps clock={clock} S={SCENE} />
      <Web x={WEB_AT.x} y={WEB_AT.y} r={22} a0={0} />
      {/* the owner stands in the gateway: in front of the passage, behind the gate's leaves */}
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="lead" wear={[]} />
      <GateFront S={SCENE} fixTag={on(Q1)} />
      <TorchLever clock={clock} S={SCENE} />
      <SecretPanel S={SCENE} front={on(UPTO_POINT)} back={on(FROM_POINT)} />
      <LessonPicture name="biz6-barrel" />
      {on(FROM_TENS) ? <Stack S={SCENE} /> : null}
      <ObjectArt parts={BOOTH_BACK_ART} tone={TONE} />
      <Web x={12} y={409} r={15} a0={0} />
      <View style={styles.signBoard} pointerEvents="none"><Text style={styles.signText}>TICKETS £15</Text></View>
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="second" wear={BY_ID.stroller.pieces} />
      {on(Q1) ? <Multiplied S={SCENE} /> : null}
      {on(FROM_BOOTH) ? <LedgeThings S={SCENE} ticket={on(A_BOOTH)} /> : null}
      <ObjectArt parts={BOOTH_FRONT_ART} tone={TONE} />
      {on(FROM_BOOTH) ? <PriceTags S={SCENE} /> : null}
      <Turnstile S={SCENE} />
      {PUMPKIN_ARTS.map((a, k) => <ObjectArt key={k} parts={a} tone={TONE} />)}
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="crowd" wear={BY_ID.magistrate.pieces} />
      <Hands S={SCENE} ownerCoin={on(A_RICH)} tens={on(A_TENS)} chalk={on(FROM_POINT)} />
      <Fog clock={clock} />
      <Bats clock={clock} S={SCENE} burst={on(FROM_SCREAM)} cross={on(FROM_REST)} />
      {on(Q1) ? <CostTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <StopTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

type SV = SharedValue<any>;

// ── the night: sky, stars, the moon, the keep and its windows ───────────────

const STARS = [
  [26, 270, 0], [62, 262, 1.3], [128, 276, 2.1], [168, 262, 0.7], [206, 286, 3.2], [140, 316, 1.8],
  [316, 268, 2.6], [384, 290, 0.4], [30, 346, 2.9], [380, 340, 1.1],
] as const;
function Star({ clock, x, y, ph }: { clock: SharedValue<number>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(clock.value * 1.3 + ph * 2.4)) }));
  return <Animated.View style={[styles.star, { left: x - 1.2, top: y - 1.2 }, st]} pointerEvents="none" />;
}

function Night({ clock, S }: { clock: SharedValue<number>; S: SV }) {
  // a lit window flickers with the torch behind it; the actor's ghostly shadow drifts
  // across it once, on b2
  const flick = useAnimatedStyle(() => ({ opacity: 0.82 + 0.18 * Math.sin(clock.value * 5.3) * Math.sin(clock.value * 2.1) }));
  const ghost = useAnimatedStyle(() => ({ transform: [{ translateX: lerp(-10, 14, S.value.ghost) }] }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.skyBand, { top: 0, height: 336, backgroundColor: NATURAL.bz6Sky.base }]} />
      <View style={[styles.skyBand, { top: 336, height: 64, backgroundColor: NATURAL.bz6SkyLow.base }]} />
      {STARS.map(([x, y, ph]) => <Star key={`${x}-${y}`} clock={clock} x={x} y={y} ph={ph} />)}
      <View style={styles.lunaHalo} />
      <View style={styles.luna} />
      <View style={[styles.lunaSea, { left: 74, top: 296, width: 8, height: 6 }]} />
      <View style={[styles.lunaSea, { left: 88, top: 306, width: 6, height: 5 }]} />
      {/* the keep, set back behind the gatehouse */}
      <View style={[styles.keep, { left: 214, top: 292, width: 160, height: 92 }]} />
      <View style={[styles.keep, { left: 238, top: 266, width: 36, height: 40 }]} />
      <View style={[styles.keep, { left: 344, top: 276, width: 24, height: 40 }]} />
      <View style={styles.cone} />
      {[238, 252, 266].map((x) => <View key={x} style={[styles.keepCren, { left: x, top: 259 }]} />)}
      {[214, 232, 300, 318, 374 - 8].map((x) => <View key={x} style={[styles.keepCren, { left: x, top: 285 }]} />)}
      <Animated.View style={[styles.lit, { left: 252, top: 274, width: 8, height: 12 }, flick]} />
      <Animated.View style={[styles.lit, { left: 352, top: 288, width: 7, height: 11 }, flick]} />
      <Animated.View style={[styles.lit, { left: 324, top: 300, width: 8, height: 12 }, flick]} />
      <View style={[styles.lit, styles.ghostPane, { left: 287, top: 298, width: 11, height: 15 }]}>
        <Animated.View style={[styles.ghostShape, ghost]} />
      </View>
    </View>
  );
}

// ── the gatehouse: two towers, the wall between, the curtain walls ──────────

const COURSES_T = [352, 404, 456];
function Gatehouse() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* the curtain walls, left and right */}
      <View style={[styles.rampart, { left: 0, top: 386, width: 152, height: 114 }]} />
      {[118, 134].map((x) => <View key={x} style={[styles.merlon, { left: x, top: 378 }]} />)}
      <View style={[styles.rampart, { left: 324, top: 380, width: 76, height: 120 }]} />
      {[330, 348, 366, 384].map((x) => <View key={x} style={[styles.merlon, { left: x, top: 372 }]} />)}
      {[404, 430, 456].map((y) => <View key={y} style={[styles.course, { left: 326, top: y, width: 74 }]} />)}
      {/* the wall over the arch */}
      <View style={[styles.rampart, { left: 188, top: 330, width: 94, height: 170 }]} />
      {[198, 216, 234, 252, 270].map((x) => <View key={x} style={[styles.merlon, { left: x - 2, top: 322 }]} />)}
      {/* the two round towers: lit on the left, shaded on the right, the lamp being top-left */}
      <View style={[styles.turret, { left: 150, width: 40 }]} />
      <View style={[styles.turretShade, { left: 176, width: 14 }]} />
      <View style={[styles.turret, { left: 280, width: 46 }]} />
      <View style={[styles.turretShade, { left: 310, width: 16 }]} />
      {[150, 166, 181].map((x) => <View key={x} style={[styles.merlon, { left: x, top: 304 }]} />)}
      {[280, 298, 316].map((x) => <View key={x} style={[styles.merlon, { left: x, top: 304 }]} />)}
      <View style={[styles.stringCourse, { left: 148, width: 44 }]} />
      <View style={[styles.stringCourse, { left: 278, width: 50 }]} />
      {COURSES_T.map((y) => <View key={y} style={[styles.course, { left: 150, top: y, width: 40 }]} />)}
      {COURSES_T.map((y) => <View key={`r${y}`} style={[styles.course, { left: 280, top: y, width: 46 }]} />)}
      <View style={[styles.slit, { left: 166, top: 352 }]} />
      <View style={[styles.slit, { left: 300, top: 352 }]} />
    </View>
  );
}

// ── the counter over the arch: its rolling drums, its bell ──────────────────

function Drum({ S, k }: { S: SV; k: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: -drum(Math.max(0, S.value.g), 3 - k) * DRUM.h }] }));
  return (
    <View style={[styles.drumWin, { left: DRUM_X[k] }]}>
      <Animated.View style={[styles.drumCol, st]}>
        {DIGITS.map((d, j) => <Text key={j} style={styles.digit}>{d}</Text>)}
      </Animated.View>
      <View style={styles.drumRim} />
    </View>
  );
}

function CounterBoard({ S, smoke: puffs }: { S: SV; smoke: boolean }) {
  // a jam (the 1,000 flag) shakes the whole case; the 50 flag gives it a clunk
  const shake = useAnimatedStyle(() => ({
    transform: [{ translateX: 1.6 * Math.sin(S.value.jamU * 90) * S.value.jam * (1 - S.value.jam) * 4 }],
  }));
  const bell = useAnimatedStyle(() => {
    const u = S.value.bell;
    return { transform: [{ rotate: `${24 * Math.sin(u * Math.PI * 5) * (1 - u)}deg` }] };
  });
  const smoke = useAnimatedStyle(() => ({ opacity: 0.7 * Math.sin(Math.PI * S.value.smoke) }));
  const puff = (k: number) => ({ left: 286 + k * 7, top: 338 - k * 5 });
  const smokeRise = useAnimatedStyle(() => ({ transform: [{ translateY: -16 * S.value.smoke }] }));
  return (
    <>
      <View style={styles.bracket} pointerEvents="none" />
      <Animated.View style={[styles.rider, { left: BELL_AT.x, top: BELL_AT.y }, bell]} pointerEvents="none">
        <View style={styles.bellIn}><ObjectArt parts={BELL_ART} tone={TONE} /></View>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, shake]} pointerEvents="none">
        <ObjectArt parts={COUNTER_ART} tone={TONE} />
        <View style={styles.counterHead}><Text style={styles.counterHeadText}>GUESTS TONIGHT</Text></View>
        {[0, 1, 2, 3].map((k) => <Drum key={k} S={S} k={k} />)}
      </Animated.View>
      {puffs ? (
        <Animated.View style={[StyleSheet.absoluteFill, smoke, smokeRise]} pointerEvents="none">
          {[0, 1, 2].map((k) => <View key={k} style={[styles.puff, puff(k)]} />)}
        </Animated.View>
      ) : null}
    </>
  );
}

// ── the arch: its ring, the torchlit passage, the gate and the bill ─────────

const FAN = [30, 60, 90, 120, 150];
function Archway() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* the ring of the arch, and its jambs */}
      <View style={styles.ringClip}><View style={styles.ringDisc} /></View>
      <View style={[styles.jamb, { left: 184 }]} />
      <View style={[styles.jamb, { left: 278 }]} />
      <View style={styles.keystone} />
      {/* the passage, lit by torches inside, and the far courtyard door */}
      <View style={styles.passClip}><View style={styles.passDisc} /></View>
      <View style={styles.pass} />
      <View style={[styles.passShade, { left: ARCH.x0 }]} />
      <View style={[styles.passShade, { left: ARCH.x1 - 7 }]} />
      <View style={styles.farDoor} />
      {/* the fanlight's iron over the gate */}
      {FAN.map((a) => (
        <View key={a} style={[styles.fanBar, { transform: [{ rotate: `${-a}deg` }] }]} />
      ))}
      <View style={styles.transom} />
    </View>
  );
}
/** The gate's leaves, in front of the owner, and the bill pinned to the right one. */
function GateFront({ S, fixTag }: { S: SV; fixTag: boolean }) {
  const leaf = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.leaf }] }));
  const bill = useAnimatedStyle(() => ({ transform: [{ rotate: `${4 * S.value.flutter}deg` }] }));
  const stamp = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.stamp * 3),
    transform: [{ scale: lerp(1.8, 1, S.value.stamp) }, { rotate: '-8deg' }],
  }));
  const fix = useAnimatedStyle(() => {
    const u = S.value.fix;
    const swing = 30 * Math.exp(-3.2 * u) * Math.cos(11 * u);
    return {
      opacity: clamp01(u * 5),
      transform: [{ translateY: -14 * (1 - ease01(clamp01(u * 3))) }, { rotate: `${swing}deg` }],
    };
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* the gate's two leaves: the left swings open on b0 */}
      <Animated.View style={[styles.leaf, { left: ARCH.x0 }, leaf]}><Leaf ring="r" /></Animated.View>
      <View style={[styles.leaf, { left: ARCH.cx }]}><Leaf ring="l" /></View>
      {/* the rent bill, pinned to the right leaf */}
      <Animated.View style={[styles.bill, bill]}>
        <View style={styles.pin} />
        <Text style={[styles.billWord, { top: 5 }]}>RENT</Text>
        <Text style={[styles.billSum, { top: 15 }]}>£1,000</Text>
        <Text style={[styles.billHand, { top: 26 }]}>a night</Text>
        <Animated.View style={[styles.stamp, stamp]}><Text style={styles.stampText}>PAID</Text></Animated.View>
      </Animated.View>
      {/* Q1's answer: a FIXED tag swings onto the bill's foot */}
      {fixTag ? (
        <Animated.View style={[styles.fixTag, fix]}>
          <View style={styles.fixString} />
          <View style={styles.fixPlate}><Text style={styles.fixText}>FIXED</Text></View>
        </Animated.View>
      ) : null}
    </View>
  );
}
function Leaf({ ring }: { ring: 'l' | 'r' }) {
  return (
    <>
      {[10.5, 21, 31.5].map((x) => <View key={x} style={[styles.leafBar, { left: x - 1 }]} />)}
      <View style={styles.leafRail} />
      <View style={styles.leafFrame} />
      <View style={[styles.leafRing, ring === 'r' ? { left: 34 } : { left: 3 }]} />
    </>
  );
}

// ── the lanterns, with live flames ──────────────────────────────────────────

function Flame({ clock, S, x, y, ph }: { clock: SharedValue<number>; S: SV; x: number; y: number; ph: number }) {
  const halo = useAnimatedStyle(() => ({
    opacity: 0.16 + 0.05 * Math.sin(clock.value * 7.1 + ph) + 0.3 * S.value.flare,
    transform: [{ scale: 1 + 0.4 * S.value.flare }],
  }));
  const flame = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.86 + 0.16 * Math.sin(clock.value * 11.3 + ph) + 0.1 * Math.sin(clock.value * 6.7 + ph * 2) + 0.4 * S.value.flare }],
  }));
  return (
    <>
      <Animated.View style={[styles.halo, { left: x - 17, top: y - 17 }, halo]} pointerEvents="none" />
      <Animated.View style={[styles.flame, { left: x - 2.2, top: y - 4 }, flame]} pointerEvents="none" />
    </>
  );
}
function Lamps({ clock, S }: { clock: SharedValue<number>; S: SV }) {
  return (
    <>
      <ObjectArt parts={LAMP_L_ART} tone={TONE} />
      <ObjectArt parts={LAMP_R_ART} tone={TONE} />
      <Flame clock={clock} S={S} x={FLAME_L.x} y={FLAME_L.y} ph={0} />
      <Flame clock={clock} S={S} x={FLAME_R.x} y={FLAME_R.y} ph={1.7} />
    </>
  );
}

// ── a cobweb: threads out from a corner, and rings across them ──────────────

function Web({ x, y, r, a0 }: { x: number; y: number; r: number; a0: number }) {
  const spokes = [0, 22.5, 45, 67.5, 90].map((d) => ((d + a0) * Math.PI) / 180);
  const rings = [0.45, 0.92];
  const segs: { x: number; y: number; len: number; deg: number }[] = [];
  for (const f of rings) {
    for (let k = 0; k < spokes.length - 1; k += 1) {
      const ax = x + Math.cos(spokes[k]) * r * f;
      const ay = y + Math.sin(spokes[k]) * r * f;
      const bx = x + Math.cos(spokes[k + 1]) * r * f * 0.92;
      const by = y + Math.sin(spokes[k + 1]) * r * f * 0.92;
      segs.push({ x: ax, y: ay, len: Math.hypot(bx - ax, by - ay), deg: (Math.atan2(by - ay, bx - ax) * 180) / Math.PI });
    }
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {spokes.map((a, k) => (
        <View key={`s${k}`} style={[styles.gossamer, { left: x, top: y, width: r, transform: [{ rotate: `${(a * 180) / Math.PI}deg` }] }]} />
      ))}
      {segs.map((s, k) => (
        <View key={`r${k}`} style={[styles.gossamer, { left: s.x, top: s.y, width: s.len, transform: [{ rotate: `${s.deg}deg` }] }]} />
      ))}
    </View>
  );
}

// ── the torch that is a lever, and the panel it turns ───────────────────────

function TorchLever({ clock, S }: { clock: SharedValue<number>; S: SV }) {
  const turn = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.torch}deg` }] }));
  const flame = useAnimatedStyle(() => ({
    transform: [{ scaleY: 0.85 + 0.18 * Math.sin(clock.value * 9.7) + 0.08 * Math.sin(clock.value * 15.1) }],
  }));
  const halo = useAnimatedStyle(() => ({ opacity: 0.16 + 0.05 * Math.sin(clock.value * 6.3) }));
  return (
    <>
      <ObjectArt parts={PLATE_ART} tone={TONE} />
      <Animated.View style={[styles.rider, { left: TORCH.x, top: TORCH.y }, turn]} pointerEvents="none">
        <Animated.View style={[styles.halo, { left: -17, top: -40 }, halo]} />
        <Animated.View style={[styles.torchFlame, flame]} />
        <View style={[styles.torchCore]} />
        <ObjectArt parts={TORCH_ART} tone={TONE} />
      </Animated.View>
    </>
  );
}

function SecretPanel({ S, front: showFront, back: showBack }: { S: SV; front: boolean; back: boolean }) {
  // the panel spins about its middle: the stone face turns away, the board turns to us
  const spin = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.04, Math.abs(Math.cos(Math.PI * S.value.panel))) }] }));
  const front = useAnimatedStyle(() => ({ opacity: S.value.panel < 0.5 ? 1 : 0 }));
  const back = useAnimatedStyle(() => ({ opacity: S.value.panel < 0.5 ? 0 : 1 }));
  const line = useAnimatedStyle(() => ({ height: (AXIS.y - CROSS.y) * S.value.line }));
  const ring = useAnimatedStyle(() => ({ opacity: clamp01(S.value.ring * 2), transform: [{ scale: lerp(0.3, 1, S.value.ring) }] }));
  return (
    <Animated.View style={[styles.panel, spin]} pointerEvents="none">
      {showFront ? (
        <Animated.View style={[StyleSheet.absoluteFill, front]}>
          <View style={styles.slab} />
          {[20, 41, 62].map((y) => <View key={y} style={[styles.slabJoint, { top: y }]} />)}
          <View style={[styles.slabJointV, { left: 30, top: 0 }]} />
          <View style={[styles.slabJointV, { left: 18, top: 41 }]} />
        </Animated.View>
      ) : null}
      {showBack ? (
      <Animated.View style={[StyleSheet.absoluteFill, back]}>
        <ObjectArt parts={BOARD_ART} tone={TONE} />
        <View style={[styles.chalkBar, { left: AXIS.x - 0.8, top: AXIS.top, width: 1.6, height: AXIS.y - AXIS.top }]} />
        <View style={[styles.chalkBar, { left: AXIS.x, top: AXIS.y - 0.8, width: AXIS.right - AXIS.x, height: 1.6 }]} />
        <Seg a={COSTS} color={NATURAL.bz6Chalk.base} />
        <Seg a={SALES} color={NATURAL.bz6Glow.base} />
        <Text style={[styles.legend, { top: 4, color: NATURAL.bz6Glow.base }]}>SALES</Text>
        <Text style={[styles.legend, { top: 14, color: NATURAL.bz6Chalk.base }]}>COSTS</Text>
        <Animated.View style={[styles.chalkBar, { left: CROSS.x - 0.8, top: CROSS.y, width: 1.6 }, line]} />
        <Animated.View style={[styles.chalkRing, { left: CROSS.x - 4.5, top: CROSS.y - 4.5 }, ring]} />
      </Animated.View>
      ) : null}
    </Animated.View>
  );
}
function Seg({ a, color }: { a: { x1: number; y1: number; x2: number; y2: number }; color: string }) {
  const len = Math.hypot(a.x2 - a.x1, a.y2 - a.y1);
  const deg = (Math.atan2(a.y2 - a.y1, a.x2 - a.x1) * 180) / Math.PI;
  return <View style={[styles.chalkLine, { left: a.x1, top: a.y1 - 0.9, width: len, backgroundColor: color, transform: [{ rotate: `${deg}deg` }] }]} />;
}

// ── the barrel's stack of tens ──────────────────────────────────────────────

function StackCoin({ S, k }: { S: SV; k: number }) {
  // it leaves the hand over the barrel and falls, gathering speed, onto the stack
  const st = useAnimatedStyle(() => {
    const u = S.value.stack[k];
    const fall = DROP_AT.y + 2 - (STACK_Y - 3 - k * 2.6);
    return { opacity: u > 0 ? 1 : 0, transform: [{ translateY: fall * (1 - u * u) }] };
  });
  return <Animated.View style={[styles.stackCoin, { top: STACK_Y - 3 - k * 2.6 }, st]} pointerEvents="none" />;
}
function Stack({ S }: { S: SV }) {
  return <>{[0, 1, 2].map((k) => <StackCoin key={k} S={S} k={k} />)}</>;
}

// ── what crosses the ledge: the ticket, the popcorn, the glow stick ─────────

function LedgeThings({ S, ticket }: { S: SV; ticket: boolean }) {
  const tk = useAnimatedStyle(() => ({
    opacity: S.value.tk.o,
    transform: [{ translateX: S.value.tk.x }, { translateY: S.value.tk.y }, { rotate: `${S.value.tk.r}deg` }],
  }));
  const pop = useAnimatedStyle(() => ({ opacity: S.value.pop.o, transform: [{ translateX: S.value.pop.x }, { translateY: S.value.pop.y }] }));
  const glow = useAnimatedStyle(() => ({ opacity: S.value.glow.o, transform: [{ translateX: S.value.glow.x }, { translateY: S.value.glow.y }] }));
  return (
    <>
      <Animated.View style={[styles.rider, pop]} pointerEvents="none"><ObjectArt parts={POP_ART} tone={TONE} /></Animated.View>
      <Animated.View style={[styles.rider, glow]} pointerEvents="none">
        <ObjectArt parts={GLOW_ART} tone={TONE} />
      </Animated.View>
      {ticket ? <Animated.View style={[styles.ticket, tk]} pointerEvents="none"><View style={styles.ticketStub} /></Animated.View> : null}
    </>
  );
}

/**
 * Q1, a wrong pick: the thing has company. Two more tubs rise up behind the popcorn (one
 * per guest), or the glow stick fans out into five — a cost that grows with every guest.
 */
const FAN_DEG = [-28, -14, 14, 28];
function FanStick({ S, d }: { S: SV; d: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.fan * 3),
    transform: [{ rotate: `${d * S.value.fan}deg` }, { scaleY: lerp(0.3, 1, S.value.fan) }],
  }));
  return <Animated.View style={[styles.fanStick, st]}><View style={styles.fanStickIn} /></Animated.View>;
}
function Multiplied({ S }: { S: SV }) {
  const copyL = useAnimatedStyle(() => ({ opacity: clamp01(S.value.copies * 3), transform: [{ translateX: POP_AT.x - 14 }, { translateY: POP_AT.y + 26 * (1 - S.value.copies) }] }));
  const copyR = useAnimatedStyle(() => ({ opacity: clamp01(S.value.copies * 3 - 0.5), transform: [{ translateX: POP_AT.x + 14 }, { translateY: POP_AT.y + 26 * (1 - clamp01(S.value.copies * 1.3 - 0.3)) }] }));
  return (
    <>
      <Animated.View style={[styles.rider, copyL]} pointerEvents="none"><ObjectArt parts={POP_ART} tone={TONE} /></Animated.View>
      <Animated.View style={[styles.rider, copyR]} pointerEvents="none"><ObjectArt parts={POP_ART} tone={TONE} /></Animated.View>
      <View style={[styles.rider, { left: GLOW_AT.x, top: GLOW_AT.y }]} pointerEvents="none">
        {FAN_DEG.map((d) => <FanStick key={d} S={S} d={d} />)}
      </View>
    </>
  );
}

/** The two price tags, hanging from the ledge's lip on strings; a wrong pick droops its own. */
function PriceTag({ S, x, label, k }: { S: SV; x: number; label: string; k: 'droopP' | 'droopG' }) {
  const st = useAnimatedStyle(() => {
    const u = S.value.tags;
    const swing = 34 * Math.exp(-3 * u) * Math.cos(10 * u) * (u > 0 ? 1 : 0);
    const d = S.value[k];
    return {
      opacity: clamp01(u * 4),
      transform: [{ translateY: 3 * d }, { rotate: `${(u >= 1 ? 0 : swing) + 32 * d}deg` }],
    };
  });
  return (
    <Animated.View style={[styles.priceTag, { left: x - 11 }, st]} pointerEvents="none">
      <View style={styles.priceString} />
      <View style={styles.pricePlate}><Text style={styles.priceText}>{label}</Text></View>
    </Animated.View>
  );
}
function PriceTags({ S }: { S: SV }) {
  return (
    <>
      <PriceTag S={S} x={POP_AT.x} label="£3" k="droopP" />
      <PriceTag S={S} x={GLOW_AT.x} label="£2" k="droopG" />
    </>
  );
}

// ── the turnstile: its post (drawn), and its arms turning flat about the hub ─

function Arm({ S, k }: { S: SV; k: number }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.rot * ((2 * Math.PI) / 3) + k * ((2 * Math.PI) / 3) + Math.PI / 6;
    const dx = Math.cos(a) * ARM_LEN;
    const dy = Math.sin(a) * ARM_TILT;
    return {
      width: Math.max(1, Math.hypot(dx, dy)),
      transform: [{ rotate: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg` }],
    };
  });
  return <Animated.View style={[styles.arm, st]} pointerEvents="none" />;
}
function Turnstile({ S }: { S: SV }) {
  return (
    <>
      <LessonPicture name="biz6-turnstile" />
      {[0, 1, 2].map((k) => <Arm key={k} S={S} k={k} />)}
      <View style={styles.hubCap} pointerEvents="none" />
    </>
  );
}

// ── what rides the hands ─────────────────────────────────────────────────────

function Hands({ S, ownerCoin, tens, chalk: chalkOn }: { S: SV; ownerCoin: boolean; tens: boolean; chalk: boolean }) {
  const pc = useAnimatedStyle(() => ({ opacity: S.value.coinP.o, transform: [{ translateX: S.value.coinP.x }, { translateY: S.value.coinP.y }] }));
  const tc = useAnimatedStyle(() => ({ opacity: S.value.thCoin.o, transform: [{ translateX: S.value.thCoin.x }, { translateY: S.value.thCoin.y }] }));
  // the chalk lies on the board's tray, so it is there only once the board has turned to us
  const chalk = useAnimatedStyle(() => ({
    opacity: S.value.panel < 0.5 ? 0 : 1,
    transform: [{ translateX: S.value.chalk.x }, { translateY: S.value.chalk.y }, { rotate: '-60deg' }],
  }));
  return (
    <>
      {ownerCoin ? <Animated.View style={[styles.rider, pc]} pointerEvents="none"><ObjectArt parts={COIN_ART} tone={TONE} /></Animated.View> : null}
      {tens ? <Animated.View style={[styles.rider, tc]} pointerEvents="none"><ObjectArt parts={COIN_ART} tone={TONE} /></Animated.View> : null}
      {chalkOn ? <Animated.View style={[styles.chalkStick, chalk]} pointerEvents="none" /> : null}
    </>
  );
}

// ── fog on the ground, and the bats ─────────────────────────────────────────

function Fog({ clock }: { clock: SharedValue<number> }) {
  const a = useAnimatedStyle(() => ({ transform: [{ translateX: 22 * Math.sin(clock.value * 0.11) }] }));
  const b = useAnimatedStyle(() => ({ transform: [{ translateX: 18 * Math.sin(clock.value * 0.09 + 2) }] }));
  const c = useAnimatedStyle(() => ({ transform: [{ translateX: 20 * Math.sin(clock.value * 0.13 + 4) }] }));
  return (
    <>
      <Animated.View style={[styles.fog, { left: -20, top: 488, width: 150 }, a]} pointerEvents="none" />
      <Animated.View style={[styles.fog, { left: 170, top: 492, width: 140 }, b]} pointerEvents="none" />
      <Animated.View style={[styles.fog, { left: 300, top: 486, width: 120 }, c]} pointerEvents="none" />
    </>
  );
}

/** A bat: a body and two wings that flap (on the clock — a bat's wings never stop). */
function Bat({ clock, at, s = 1, ph = 0 }: { clock: SharedValue<number>; at: { readonly value: { x: number; y: number; o: number } }; s?: number; ph?: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { scale: s }],
  }));
  const wing = useAnimatedStyle(() => ({ transform: [{ scaleY: 0.35 + 0.65 * Math.abs(Math.sin(clock.value * 8 + ph)) }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.wings, wing]}>
        <View style={[styles.wingL]} />
        <View style={[styles.wingR]} />
      </Animated.View>
      <View style={styles.batBody} />
      <View style={[styles.batEar, { left: -2.4 }]} />
      <View style={[styles.batEar, { left: 0.6 }]} />
    </Animated.View>
  );
}
function Bats({ clock, S, burst: showBurst, cross: showCross }: { clock: SharedValue<number>; S: SV; burst: boolean; cross: boolean }) {
  // one bat loops lazily round the moon all night (alive); on b10 three burst from the
  // keep and fly out of the frame; on the quotation one crosses the moon
  const idle = useDerivedValue(() => ({
    x: 70 + 46 * Math.sin(clock.value * 0.31),
    y: 300 + 16 * Math.sin(clock.value * 0.62),
    o: 1 - S.value.cross,
  }));
  const burst = (k: number) => useDerivedValue(() => {
    const u = S.value.burst;
    const dx = [-1, 0.2, 1][k];
    return { x: 256 + dx * 110 * u, y: 270 - 90 * u - 12 * k * u, o: u > 0 && u < 1 ? 1 : 0 };
  });
  const b0 = burst(0);
  const b1 = burst(1);
  const b2 = burst(2);
  const cross = useDerivedValue(() => {
    const u = S.value.cross;
    return { x: lerp(-10, 196, u), y: 306 - 22 * Math.sin(Math.PI * u), o: u > 0 && u < 1 ? 1 : 0 };
  });
  return (
    <>
      <Bat clock={clock} at={idle} s={0.9} />
      {showBurst ? <Bat clock={clock} at={b0} ph={0.6} /> : null}
      {showBurst ? <Bat clock={clock} at={b1} ph={1.9} s={0.8} /> : null}
      {showBurst ? <Bat clock={clock} at={b2} ph={3.1} /> : null}
      {showCross ? <Bat clock={clock} at={cross} s={1.15} ph={2.2} /> : null}
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

type Pick = { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SV };

/** Q1 TAG THE COST: the rent bill on the gate, the popcorn tub, the glow stick. */
function CostTargets({ picked, onPick, live, S }: Pick) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {COST_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt={q.seal}
          style={{ position: 'absolute', left: q.box.left, top: q.box.top, width: q.box.w, height: q.box.h }}
        >
          <View style={styles.place} />
        </Target>
      ))}
    </Animated.View>
  );
}

/** One of Q2's flags over the counter: up on its stalk on the question, popped when picked. */
function Flag({ S, k }: { S: SV; k: number }) {
  const q = STOP_Q[k];
  const st = useAnimatedStyle(() => ({
    transform: [
      { translateY: 46 * (1 - S.value.q2) - 6 * S.value.flagPop[k] + 6 * S.value.flagDroop[k] },
      { rotate: `${(k === 2 ? 1 : -1) * 64 * S.value.flagDroop[k]}deg` },
    ],
  }));
  return (
    <Animated.View style={[styles.flag, { left: q.x - FLAG.w / 2 }, st]} pointerEvents="none">
      <View style={styles.flagStalk} />
      <View style={styles.flagPlate}><Text style={styles.flagText}>{q.label}</Text></View>
    </Animated.View>
  );
}
function Flags({ S }: { S: SV }) {
  return <>{[0, 1, 2].map((k) => <Flag key={k} S={S} k={k} />)}</>;
}

/** Q2 STOP THE COUNTER: the three flags, 50, 100 and 1,000. */
function StopTargets({ picked, onPick, live, S }: Pick) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {STOP_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.x - 23, top: FLAG.top - 14, width: 46, height: 58 }}
        >
          <View style={styles.place} />
        </Target>
      ))}
    </Animated.View>
  );
}

const STN = NATURAL.bz6Stone;
const IRON = NATURAL.bz6Iron.base;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  place: { flexGrow: 1 },
  // the night
  skyBand: { position: 'absolute', left: 0, width: STAGE_W },
  star: { position: 'absolute', width: 2.4, height: 2.4, borderRadius: 1.2, backgroundColor: NATURAL.bz6Moon.base },
  luna: { position: 'absolute', left: 64, top: 284, width: 40, height: 40, borderRadius: 20, backgroundColor: NATURAL.bz6Moon.base },
  lunaHalo: { position: 'absolute', left: 50, top: 270, width: 68, height: 68, borderRadius: 34, backgroundColor: NATURAL.bz6Moon.base, opacity: 0.14 },
  lunaSea: { position: 'absolute', borderRadius: 4, backgroundColor: NATURAL.bz6Moon.shade },
  keep: { position: 'absolute', backgroundColor: NATURAL.bz6Keep.base, borderTopLeftRadius: 1, borderTopRightRadius: 1 },
  keepCren: { position: 'absolute', width: 8, height: 8, borderTopLeftRadius: 1, borderTopRightRadius: 1, backgroundColor: NATURAL.bz6Keep.base },
  cone: {
    position: 'absolute', left: 341, top: 254, width: 0, height: 0, borderLeftWidth: 15, borderRightWidth: 15, borderBottomWidth: 23,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: NATURAL.bz6Keep.shade,
  },
  lit: { position: 'absolute', backgroundColor: NATURAL.bz6KeepLit.base, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  ghostPane: { overflow: 'hidden' },
  ghostShape: {
    position: 'absolute', left: 0, top: 3, width: 7, height: 14, borderTopLeftRadius: 3.5, borderTopRightRadius: 3.5,
    backgroundColor: NATURAL.bz6Keep.shade,
  },
  // the gatehouse
  rampart: { position: 'absolute', backgroundColor: STN.base, borderTopLeftRadius: 0.5, borderTopRightRadius: 0.5 },
  merlon: { position: 'absolute', width: 9, height: 9, borderTopLeftRadius: 1, borderTopRightRadius: 1, backgroundColor: STN.base },
  turret: { position: 'absolute', top: 312, height: 188, backgroundColor: STN.base, borderTopLeftRadius: 1, borderTopRightRadius: 1 },
  turretShade: { position: 'absolute', top: 312, height: 188, backgroundColor: STN.shade, opacity: 0.55, borderTopRightRadius: 1 },
  stringCourse: { position: 'absolute', top: 338, height: 3, borderRadius: 1, backgroundColor: STN.shade },
  course: { position: 'absolute', height: 1, backgroundColor: STN.shade, opacity: 0.55 },
  slit: { position: 'absolute', width: 4, height: 15, borderRadius: 2, backgroundColor: NATURAL.bz6StoneFar.shade },
  // the counter
  bracket: { position: 'absolute', left: 306, top: 345, width: 13, height: 2.2, borderRadius: 1, backgroundColor: IRON },
  bellIn: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  counterHead: { position: 'absolute', left: 191, top: 345, width: 88, height: 11, alignItems: 'center', justifyContent: 'center' },
  counterHeadText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.6, color: NATURAL.g5Gold.base, includeFontPadding: false,
  },
  drumWin: {
    position: 'absolute', top: DRUM.top, width: DRUM.w, height: DRUM.h, overflow: 'hidden', borderRadius: 2,
  },
  drumRim: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 2, borderWidth: 0.8, borderColor: NATURAL.g5Gold.shade },
  // the DRUM carries the paint, so its numbers move with the surface they are printed on (S12)
  drumCol: { position: 'absolute', left: 0, top: 0, width: DRUM.w, backgroundColor: INK },
  digit: {
    width: DRUM.w, height: DRUM.h, fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: DRUM.h, textAlign: 'center',
    color: PAPER_LIT, includeFontPadding: false,
  },
  puff: { position: 'absolute', width: 9, height: 9, borderRadius: 4.5, backgroundColor: NATURAL.bz6Fog.shade },
  // the arch
  ringClip: { position: 'absolute', left: ARCH.cx - 51, top: ARCH.spring - 51, width: 102, height: 51, overflow: 'hidden' },
  ringDisc: { position: 'absolute', left: 0, top: 0, width: 102, height: 102, borderRadius: 51, backgroundColor: STN.shade },
  jamb: { position: 'absolute', top: ARCH.spring, width: 8, height: GROUND - ARCH.spring, backgroundColor: STN.shade, borderRadius: 0.5 },
  keystone: { position: 'absolute', left: ARCH.cx - 5, top: ARCH.spring - 52, width: 10, height: 11, borderRadius: 1, backgroundColor: STN.base, borderWidth: 0.8, borderColor: STN.shade },
  passClip: { position: 'absolute', left: ARCH.x0, top: ARCH.spring - ARCH.r, width: ARCH.x1 - ARCH.x0, height: ARCH.r, overflow: 'hidden' },
  passDisc: { position: 'absolute', left: 0, top: 0, width: 2 * ARCH.r, height: 2 * ARCH.r, borderRadius: ARCH.r, backgroundColor: NATURAL.bz6Passage.base },
  pass: { position: 'absolute', left: ARCH.x0, top: ARCH.spring, width: ARCH.x1 - ARCH.x0, height: GROUND - ARCH.spring, backgroundColor: NATURAL.bz6Passage.base },
  passShade: { position: 'absolute', top: 420, width: 7, height: GROUND - 420, backgroundColor: NATURAL.bz6Passage.shade, borderRadius: 1 },
  farDoor: { position: 'absolute', left: ARCH.cx - 13, top: 446, width: 26, height: GROUND - 446, borderTopLeftRadius: 13, borderTopRightRadius: 13, backgroundColor: NATURAL.bz6KeepLit.base },
  fanBar: { position: 'absolute', left: ARCH.cx, top: ARCH.spring - 1, width: ARCH.r, height: 2, borderRadius: 1, backgroundColor: IRON, transformOrigin: '0% 50%' },
  transom: { position: 'absolute', left: ARCH.x0, top: ARCH.spring - 1.5, width: ARCH.x1 - ARCH.x0, height: 3, borderRadius: 1, backgroundColor: IRON },
  leaf: { position: 'absolute', top: ARCH.spring, width: LEAF_W, height: GROUND - ARCH.spring, transformOrigin: '0% 50%' },
  leafFrame: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth: 2.2, borderColor: IRON, borderRadius: 1 },
  leafBar: { position: 'absolute', top: 0, bottom: 0, width: 2, borderRadius: 1, backgroundColor: IRON },
  leafRail: { position: 'absolute', left: 0, right: 0, top: 30, height: 2.2, borderRadius: 1, backgroundColor: IRON },
  leafRing: { position: 'absolute', top: 33, width: 6, height: 6, borderRadius: 3, borderWidth: 1.4, borderColor: IRON },
  bill: {
    position: 'absolute', left: BILL.left, top: BILL.top, width: BILL.w, height: BILL.h, borderRadius: 1.5,
    backgroundColor: NATURAL.paper.base, borderWidth: 1, borderColor: INK, transformOrigin: '50% 0%',
  },
  pin: { position: 'absolute', left: BILL.w / 2 - 2.2, top: 0.6, width: 4.4, height: 4.4, borderRadius: 2.2, backgroundColor: NATURAL.bz6PopRed.base },
  billWord: { position: 'absolute', left: 0, right: 0, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.6, textAlign: 'center', color: INK, includeFontPadding: false },
  billSum: { position: 'absolute', left: 0, right: 0, fontFamily: 'Inter_700Bold', fontSize: 9.4, lineHeight: 11, textAlign: 'center', color: INK, includeFontPadding: false },
  billHand: { position: 'absolute', left: 0, right: 0, fontFamily: 'Caveat_700Bold', fontSize: 11, lineHeight: 11, textAlign: 'center', color: INK, includeFontPadding: false },
  stamp: {
    position: 'absolute', left: 4, top: 38, width: 30, height: 12, borderRadius: 2, borderWidth: 1.4,
    borderColor: NATURAL.e5Wax.base, alignItems: 'center', justifyContent: 'center',
  },
  stampText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.8, color: NATURAL.e5Wax.base, includeFontPadding: false },
  fixTag: { position: 'absolute', left: BILL.left + BILL.w / 2 - 17, top: BILL.top + BILL.h, width: 34, height: 18, transformOrigin: '50% 0%' },
  fixString: { position: 'absolute', left: 16.4, top: 0, width: 1.2, height: 4, backgroundColor: INK },
  fixPlate: {
    position: 'absolute', left: 0, top: 4, width: 34, height: 13, borderRadius: 2.5, borderWidth: 1, borderColor: INK,
    backgroundColor: NATURAL.g5Gold.base, alignItems: 'center', justifyContent: 'center',
  },
  fixText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.6, color: INK, includeFontPadding: false },
  // the lamps and the torch
  halo: { position: 'absolute', width: 34, height: 34, borderRadius: 17, backgroundColor: NATURAL.bz6LampGlass.base },
  flame: { position: 'absolute', width: 4.4, height: 8, borderRadius: 2.2, backgroundColor: NATURAL.b5Flame.base, transformOrigin: '50% 100%' },
  torchFlame: { position: 'absolute', left: -3.6, top: -32, width: 7.2, height: 12, borderRadius: 3.6, backgroundColor: NATURAL.b5Flame.base, transformOrigin: '50% 100%' },
  torchCore: { position: 'absolute', left: -1.8, top: -26, width: 3.6, height: 6, borderRadius: 1.8, backgroundColor: NATURAL.b5FlameCore.base },
  gossamer: { position: 'absolute', height: 0.7, backgroundColor: NATURAL.bz6Web.base, opacity: 0.8, transformOrigin: '0% 50%' },
  // the panel and the board
  panel: { position: 'absolute', left: PANEL.left, top: PANEL.top, width: PANEL.w, height: PANEL.h },
  slab: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 1.5, backgroundColor: STN.base, borderWidth: 1.4, borderColor: STN.shade },
  slabJoint: { position: 'absolute', left: 2, right: 2, height: 1, backgroundColor: STN.shade },
  slabJointV: { position: 'absolute', width: 1, height: 20, backgroundColor: STN.shade },
  chalkBar: { position: 'absolute', backgroundColor: PAPER_LIT, borderRadius: 0.8 },
  chalkLine: { position: 'absolute', height: 1.8, borderRadius: 0.9, transformOrigin: '0% 50%' },
  chalkRing: { position: 'absolute', width: 9, height: 9, borderRadius: 4.5, borderWidth: 1.3, borderColor: PAPER_LIT },
  legend: {
    position: 'absolute', left: 24, width: 32, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, textAlign: 'center',
    includeFontPadding: false,
  },
  chalkStick: { position: 'absolute', left: -2.6, top: -0.9, width: 5.2, height: 1.8, borderRadius: 0.6, backgroundColor: PAPER_LIT, borderWidth: 0.5, borderColor: INK },
  // the barrel's stack
  stackCoin: {
    position: 'absolute', left: BARREL.x - 5, width: 10, height: 3, borderRadius: 1.5, backgroundColor: NATURAL.brass.base,
    borderWidth: 0.6, borderColor: NATURAL.brass.shade,
  },
  // the booth
  signBoard: {
    position: 'absolute', left: 21, top: 377, width: 74, height: 14, borderRadius: 2, borderWidth: 1, borderColor: INK,
    backgroundColor: NATURAL.bz6Lime.base, alignItems: 'center', justifyContent: 'center',
  },
  signText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  ticket: {
    position: 'absolute', left: -5, top: -3, width: 10, height: 6, borderRadius: 1, backgroundColor: NATURAL.ticketOrange.base,
    borderWidth: 0.6, borderColor: INK,
  },
  ticketStub: { position: 'absolute', left: 6.4, top: 0, width: 0.6, height: 4.8, backgroundColor: INK },
  fanStick: { position: 'absolute', left: -1.8, top: -27, width: 3.6, height: 22, transformOrigin: '50% 100%' },
  fanStickIn: { flex: 1, borderRadius: 1.8, backgroundColor: NATURAL.bz6Glow.base, borderWidth: 0.7, borderColor: INK },
  priceTag: { position: 'absolute', top: TAG_Y, width: 22, height: 17, transformOrigin: '50% 0%' },
  priceString: { position: 'absolute', left: 10.4, top: 0, width: 1.2, height: 4, backgroundColor: INK },
  pricePlate: {
    position: 'absolute', left: 0, top: 4, width: 22, height: 13, borderRadius: 2.5, borderWidth: 1, borderColor: INK,
    backgroundColor: NATURAL.ps5Manila.base, alignItems: 'center', justifyContent: 'center',
  },
  priceText: { fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, color: INK, includeFontPadding: false },
  // the turnstile
  arm: {
    position: 'absolute', left: HUB.x, top: HUB.y - 1.6, height: 3.2, borderRadius: 1.6, backgroundColor: IRON,
    transformOrigin: '0% 50%', borderWidth: 0.6, borderColor: INK,
  },
  hubCap: { position: 'absolute', left: HUB.x - 3, top: HUB.y - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: NATURAL.g5Gold.base, borderWidth: 0.8, borderColor: INK },
  // fog and bats
  fog: { position: 'absolute', height: 9, borderRadius: 4.5, backgroundColor: NATURAL.bz6Fog.base, opacity: 0.32 },
  wings: { position: 'absolute', left: -11, top: -4, width: 22, height: 8 },
  wingL: {
    position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderTopWidth: 8, borderRightWidth: 10,
    borderTopColor: NATURAL.bz6Bat.base, borderRightColor: 'transparent',
  },
  wingR: {
    position: 'absolute', left: 12, top: 0, width: 0, height: 0, borderTopWidth: 8, borderLeftWidth: 10,
    borderTopColor: NATURAL.bz6Bat.base, borderLeftColor: 'transparent',
  },
  batBody: { position: 'absolute', left: -2.5, top: -3.5, width: 5, height: 7, borderRadius: 2.5, backgroundColor: NATURAL.bz6Bat.base },
  batEar: {
    position: 'absolute', top: -6, width: 0, height: 0, borderLeftWidth: 0.9, borderRightWidth: 0.9, borderBottomWidth: 3,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: NATURAL.bz6Bat.base,
  },
  // Q2's flags
  flag: { position: 'absolute', top: FLAG.top, width: FLAG.w, height: FLAG.stalk - FLAG.top, transformOrigin: '50% 100%' },
  flagStalk: { position: 'absolute', left: FLAG.w / 2 - 1, top: FLAG.h - 1, width: 2, height: FLAG.stalk - FLAG.top - FLAG.h + 1, backgroundColor: IRON },
  flagPlate: {
    position: 'absolute', left: 0, top: 0, width: FLAG.w, height: FLAG.h, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
    backgroundColor: NATURAL.paper.base, alignItems: 'center', justifyContent: 'center',
  },
  flagText: { fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 13, color: INK, includeFontPadding: false },
});

export function Biz6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Biz6Scene} band={[252, 514]} camera={CAM} />;
}
