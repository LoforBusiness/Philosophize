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
import { BEATS } from './econ5Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, ratTail, tailBasket, coinSack, silverCoin, handLantern, candlestick, sealMatrix,
  waxSeal, decreeSeal, rolledDraft, draftRoller, cabbageHead, hallBeam, townBanner, wallTorch,
  stoneArch, bakeHouse, bakeDoor, townWell, wellLid,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// economics-foundations-5, "The Rat-Tail Reward" — A MEDIEVAL TOWN HALL AT DUSK.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The mayor (the plain one) stands on his dais
// behind a heavy oak table with a sack of silver; the town's best rat catcher (the bun)
// brings him a basket of tails; the economist (the top hat) comes in from the street with
// a lantern and finds out why there are more rats than ever.
//
//   b0   the mayor taps his sack of coins twice; she waits with her basket of tails.
//   b1   she lifts the basket onto his table; he picks the sack up by its neck, steps
//        along, counts two coins out of it into her palm, and sets it down again; she
//        pockets them.
//   b2   she steps aside to the right; a rat runs out from behind the cabbage crate and
//        under the dais; the economist walks in from the street door on the left with a
//        lantern, turns to the mayor and tips his hat.
//   b3   Q1, LOOK BEHIND A DOOR: the cellar hatch, the bakery door and the well's lid.
//        Right: the hatch lifts an inch on its own and three rats peep out from under it.
//        Wrong: the bakery door rattles in its frame and stays shut; the well's lid hops
//        and drops back with a splash.
//   b4   she kneels at the hatch, takes its ring and lifts it right up; the rats pop up.
//   b5   the economist takes a coin out of his waistcoat and holds it up.
//   b6   he sets his lantern on the table, takes a tail out of her basket, holds it up,
//        then turns to the hatch and nods at it.
//   b7   the mayor folds his arms and sniffs.
//   b8   the economist drops the tail back, pockets the coin, steps right and points out
//        through the arch at the street; the mayor walks along behind his table tipping
//        three draft decrees over its edge, each unrolling down the front, and picks up
//        his seal.
//   b9   Q2, SEAL A DECREE: the three drafts hanging from the table. Right: the mayor walks
//        to A COIN PER RAT-FREE STREET and presses his seal on it — red wax. Wrong: that
//        draft rolls itself back up with a snap and the mayor shrugs.
//   b10  she pushes the hatch shut (the rats duck), walks to the crate by the door and
//        picks up a cabbage; the two wrong drafts roll up and the right one is sealed.
//   b11  at ease under the quotation.
//
// COMPOSITION, in stage units. THE FAR LAYER: through a stone ARCH (opening x 284–384,
// springing 406, apex 356, its voussoirs 270–398) the street at dusk — a navy sky with a
// band of sunset over the rooftops, three stars, a half-timbered BAKERY across the way
// (284–384 × 386–458, its door 296–324 × 416–458 under a BAKERY board, a lit window with
// loaves), smoke drifting from its chimney at (314, 374), and a stone WELL with a little
// roof and a wooden lid (336–380 × 404–462). THE MIDDLE: the hall's limestone wall up to
// y 470 under a dark oak tie beam (300–330), a red BANNER with a gold tower (196–240 ×
// 316–400), two iron TORCHES with flames at (178, 362) and (258, 362), and the mayor's
// sealed PROCLAMATION (22–90 × 330–398). THE FLOOR: flagstones from 470 to 560. On it, the
// mayor's DAIS 2–170 × 478–500 (he stands at y 482) and his TABLE 10–164 × 452–482 — top at
// his hip — with a candle at 22, his seal at 40, the sack at 98 and three rolled drafts
// along its front edge at 34, 86 and 138; the CELLAR HATCH in the floor 190–240 × 480–495
// under a CELLAR plaque (196–236 × 452–464); the CABBAGE CRATE by the door 298–334 ×
// 478–500. The mayor at 80 → 116 → 44; the catcher at 156 → 266 → 244 → 286; the
// economist from off the left to 166 → 186. Band [300, 524].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, the listeners keep their hands still (AP18) and their heads alive (N21).
// About 560 Views, nothing under a moving camera (AT7).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('economics');
const TR = 0.85;
/** 78 units of figure in a 224-unit band: 35%, under check:scale's 38%. */
const K = K_FIG * 0.76;
/** The top of the mayor's dais, where he stands. */
const DAIS = 482;


/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, economics-foundations-5), except where the action needs
 * longer than the line and runs on after it — b1 (the coins and the sack set down), b8
 * (three drafts let down and the seal picked up) and b10 (the hatch, the walk, the cabbage).
 */
const LINES = [4.92, 5.51, 5.26, 0, 6.07, 5.69, 6.83, 4.2, 6, 0, 5.6, 0, 0];

// The held poses (moves.ts act + 99): talking with the hands, nodding along, arms folded,
// kneeling; and the shrug, played once (299 + act).
const TALK = 167;
const NOD = 263;
const FOLD = 161;
const KNEEL = 280;
const SHRUG = 378;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_DECREE = is('decree');
const A_BASKET = is('basket');
const A_LANTERN = is('lantern');
const A_FARM = is('farm');
const A_INCENTIVE = is('incentive');
const A_SUPPLY = is('supply');
const A_BLAME = is('blame');
const A_WANT = is('want');
const A_CABBAGES = is('cabbages');
const Q1 = BEATS.map((b) => (b.peek ? 1 : 0));
const Q2 = BEATS.map((b) => (b.decree ? 1 : 0));
const BASKET_N = A_BASKET.indexOf(1);
const LANTERN_N = A_LANTERN.indexOf(1);
const FARM_N = A_FARM.indexOf(1);
const INCENTIVE_N = A_INCENTIVE.indexOf(1);
const SUPPLY_N = A_SUPPLY.indexOf(1);
const WANT_N = A_WANT.indexOf(1);
const Q2_N = Q2.indexOf(1);
const Q1_N = Q1.indexOf(1);
const CAB_N = A_CABBAGES.indexOf(1);
const L_BASKET = LINES[BASKET_N];
const L_LANTERN = LINES[LANTERN_N];
const L_SUPPLY = LINES[SUPPLY_N];
const L_WANT = LINES[WANT_N];
const L_CAB = LINES[CAB_N];
const L_FARM = LINES[FARM_N];
const NB = BEATS.length;
const each = (f: (n: number) => Track): Track[] => BEATS.map((_, n) => f(n));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended, and an empty list stands still where
// he is. A turn is [fraction, facing]; it eases through a profile over 0.36s.
type Track = readonly (readonly number[])[];
const MY_LEGS: Track[] = each((n) => (
  n === 0 ? [[0, 80]] : n === BASKET_N ? [[0.4 / L_BASKET, 116]]
    : n === WANT_N ? [[0, 124], [2.25 / L_WANT, 96], [3.3 / L_WANT, 44]]
      : n > WANT_N ? [] : n > BASKET_N ? [[0, 116]] : [[0, 80]]
));
const MY_TURN: Track[] = each((n) => (
  n === BASKET_N ? [[0, 1]]
    : n === LANTERN_N ? [[0, -1], [3.2 / L_LANTERN, 1]]
      : n === WANT_N ? [[0, 1], [2.1 / L_WANT, -1], [5.7 / L_WANT, 1]]
        : n === Q2_N || n === CAB_N ? [] : [[0, 1]]
));
const BN_LEGS: Track[] = each((n) => (
  n <= BASKET_N ? [[0, 156]] : n === LANTERN_N ? [[0.02, 266]] : n < FARM_N ? [[0, 266]]
    : n < FARM_N + 1 ? [[0, 244], [2.95 / L_FARM, 256]] : n < CAB_N ? [[0, 256]] : n === CAB_N ? [[1.5 / L_CAB, 286]] : [[0, 286]]
));
const BN_TURN: Track[] = each((n) => (
  n === LANTERN_N ? [[0, 1], [2.2 / L_LANTERN, -1]] : n === CAB_N ? [[0, -1], [1.35 / L_CAB, 1], [4.4 / L_CAB, -1]] : [[0, -1]]
));
const TH_OFF = -60;
const TH_HOME = 166;
const TH_POINT = 186;
const TH_LEGS: Track[] = each((n) => (
  n < LANTERN_N ? [[0, TH_OFF]] : n === LANTERN_N ? [[0.04, TH_HOME]]
    : n < WANT_N ? [[0, TH_HOME]] : n === WANT_N ? [[1.25 / L_WANT, TH_POINT]] : [[0, TH_POINT]]
));
const TH_TURN: Track[] = each((n) => (
  n === LANTERN_N ? [[0, 1], [4.4 / L_LANTERN, -1]]
    : n === FARM_N || n === CAB_N ? [[0, 1]]
      : n === SUPPLY_N ? [[0, -1], [4.5 / L_SUPPLY, 1]]
        : n === WANT_N ? [[0, -1], [1.2 / L_WANT, 1], [0.93, -1]] : [[0, -1]]
));
/** What each is doing with his body: talking while he speaks, alive while he listens (N21). */
const MY_P = [TALK, NOD, NOD, NOD, NOD, NOD, NOD, FOLD, NOD, NOD, NOD, NOD, NOD];
const BN_P = [NOD, TALK, NOD, NOD, TALK, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD];
const TH_P = [NOD, NOD, TALK, NOD, NOD, TALK, TALK, NOD, TALK, NOD, NOD, NOD, NOD];

// ── the things, and the point each is held by (AR2) ──────────────────────────
// Each moving thing is drawn about its GRIP, so the grip rides the wrist (AR7.4).
const SACK = { w: 20, h: 22, dy: 6.42 };
const BASKET = { w: 18, h: 16, dy: 6.22 };
const LANTERN = { w: 11, h: 18, dy: 8.28 };
const STAMP = { w: 7, h: 13, dy: 5.81 };
const TAIL = { w: 4.5, h: 18, dy: 8.35 };
const SACK_ART = coinSack(0, SACK.dy, SACK.w, SACK.h);
const BASKET_ART = tailBasket(0, BASKET.dy, BASKET.w, BASKET.h);
const LANTERN_ART = handLantern(0, LANTERN.dy, LANTERN.w, LANTERN.h);
const STAMP_ART = sealMatrix(0, STAMP.dy, STAMP.w, STAMP.h);
const TAIL_ART = ratTail(0.1, TAIL.dy, TAIL.h, TAIL.h);
const COIN_ART = silverCoin(0, 0, 5, 5);
const CABBAGE_ART = cabbageHead(0, 0, 13, 12);
const SEAL_ART = waxSeal(0, 0, 11, 11);
/** The table's top surface, where things stand, and the grips of what stands on it. */
const TOP = 452;
const SACK_HOME = { x: 98, y: TOP - SACK.h / 2 - SACK.dy };
const SACK_BACK = { x: 124, y: TOP - SACK.h / 2 - SACK.dy };
const BASKET_HOME = { x: 144, y: TOP - BASKET.h / 2 - BASKET.dy };
const LANTERN_HOME = { x: 157, y: TOP - LANTERN.h / 2 - LANTERN.dy };
const STAMP_HOME = { x: 40, y: TOP - STAMP.h / 2 - STAMP.dy };
/** Where the catcher holds out her palm for the coins, over the table's end. */
const PALM = { x: 140, y: 446 };
/** Where a tail comes out of the basket. */
const TAILS = { x: 148, y: 441 };

// ── the draft decrees ────────────────────────────────────────────────────────
const DRAFT_X = [34, 86, 138];
const DRAFT_WORDS = ['Two coins a tail', 'A coin per rat-free street', 'A coin per dead rat'];
const DRAFT_IDS = ['twocoins', 'street', 'deadrat'];
/** The right draft (the beat's `explain` names it): a coin per rat-free street. */
const RIGHT_DRAFT = 1;
const PAPER_TOP = 457;
const PAPER_H = 40;
/** When the mayor tips each draft over the table's edge on b8, in seconds: right to left. */
const FLIP_AT = [4.35, 2.85, 1.6];
/** Where he stands to seal the right one, facing it. */
const SEAL_STAND = DRAFT_X[RIGHT_DRAFT] - 10;

// ── the cellar hatch ─────────────────────────────────────────────────────────
// Hinged along its far edge at y 480: shut, it lies foreshortened 15 deep; standing up it
// shows its true 34. Its near edge's screen y at an opening `o` (0 shut · 1 upright).
const HINGE = 480;
const HATCH_X = 190;
function frontOf(o: number): number {
  'worklet';
  const a = (o * Math.PI) / 2;
  return HINGE + 15 * Math.cos(a) - 34 * Math.sin(a);
}
/** The ring on the hatch's near edge. */
const RING_X = 232;
const PEEK_IDS = ['cellar', 'bakery', 'well'];
const RAT_AT = [199, 215, 231];
/** The rats are clipped at the hole's near rim, so a rat lower than it is out of sight. */
const RAT_CLIP = { left: HATCH_X - 4, top: 440 };

// ── the street through the arch ──────────────────────────────────────────────
const ARCH = { left: 284, top: 356, w: 100, h: 114 };
const DOOR_AT = { x: 310, y: 437 };
const WELL_LID_AT = { x: 358, y: 442.5 };

// ── the cabbages ─────────────────────────────────────────────────────────────
const CAB_BACK = [cabbageHead(328, 472.5, 13, 12), cabbageHead(318, 471, 13, 12)];
const CAB_HOME = { x: 306, y: 472 };

// ── the static set ───────────────────────────────────────────────────────────
const BEAM_ART = hallBeam(200, 315, 400, 30);
const BANNER_ART = townBanner(218, 358, 44, 84);
const TORCHES = [178, 258];
const TORCH_ART = TORCHES.map((x) => wallTorch(x - 2.6, 383, 16, 42));
const PROCLAIM_SEAL = decreeSeal(56, 392, 15, 17);
const ARCH_ART = stoneArch(334, 406, 128, 128);
const HOUSE_ART = bakeHouse(50, 50, 100, 104);
const WELL_ART = townWell(74, 77, 44, 58);
const CANDLE_ART = candlestick(22, TOP - 13, 10, 26);
const ROLL_ART = rolledDraft(0, 0, 48, 6);
const ROLLER_ART = draftRoller(0, 0, 50, 5);
const DOOR_ART = bakeDoor(0, 0, 28, 42);
const WELL_LID_ART = wellLid(0, 0, 42, 5.4);

/** The hall's courses of stone: a joint every 20 units, the vertical joints staggered. */
const COURSES = [334, 354, 374, 394, 414, 434, 454];
// A few vertical joints only, where the wall is bare (left of the banner, and over the
// hatch) — a joint behind a thing is a View nobody sees (AT7).
const PERPS = COURSES.flatMap((y, r) => [0, 1, 2].map((c) => ({ x: (r % 2 ? 58 : 18) + c * 82, y: y - 20 })))
  .filter((p) => p.x < 266 && p.y >= 300);
/** The floor's flagstone joints, running away to a point behind the hall. */
const FLOOR_ROWS = [479, 490, 505, 526];
const FLOOR_RAYS = [30, 110, 190, 270, 350].map((x) => {
  const xb = 200 + (x - 200) * 1.64;
  const dx = xb - x;
  const dy = 90;
  const len = Math.hypot(dx, dy);
  return { x: (x + xb) / 2 - len / 2, y: 470 + dy / 2, len, rot: (Math.atan2(dy, dx) * 180) / Math.PI };
});

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
/** One hand on a stage point, for a figure standing on `g`. */
function hand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/** A hand held in the figure's own frame (rig units, +x forward, +y down from the pelvis). */
function holdAt(s: Stance, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  if (w <= 0) return s;
  const cur = which > 0 ? s.fistR : s.fistL;
  const m = { x: lerp(cur.x, lx, w), y: lerp(cur.y, ly, w) };
  return which > 0 ? { ...s, fistR: m } : { ...s, fistL: m };
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

const CAM = followMoves(BN_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('economics'));

export default function Econ5Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldM = useHeld();
  const heldB = useHeld();
  const heldT = useHeld();
  const cv = useCarry(30);
  const on = useLinger(i);
  // THE GAMES ANSWER BACK: which of the three was tapped on this graded beat, and how
  // many seconds ago. The scene reads them only on that beat; everything they move is
  // carried, so the next beat takes it from wherever it is on screen (AH4).
  const pick = useSharedValue(-1);
  const since = useSharedValue(0);
  useEffect(() => {
    const ids = Q1[i] ? PEEK_IDS : Q2[i] ? DRAFT_IDS : null;
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
    // the same, in SECONDS into the beat rather than fractions of its line
    const sAt = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a / L, z / L);
    };
    const bAt = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a / L, m / L, z / L);
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

    // ── the mayor, on his dais behind the table ─────────────────────────────
    const srcM = carrySource(cv, 0, n, 80);
    let wm = legsOf(srcM, MY_LEGS[n], b, L);
    const sealRight = q2 && pk === RIGHT_DRAFT;
    if (Q2[n] === 1) {
      // Q2 answered right: he walks along to the right draft to seal it
      const u = sealRight ? clamp01((rs - 0.25) / (Math.abs(SEAL_STAND - srcM) / 56 + 0.01)) : 0;
      wm = { x: lerp(srcM, SEAL_STAND, ease01(u)), x0: srcM, x1: SEAL_STAND, u: ease01(u), walking: sealRight && u > 0 && u < 1 };
    }
    const xM = carry(cv, 0, n, wm.x, wm.x, 1);
    const srcDM = carrySource(cv, 1, n, 1);
    const dMNow = Q2[n] === 1 && sealRight ? facing(srcDM, 1, rs) : faceOf(srcDM, MY_TURN[n], b, L);
    const dM = carry(cv, 1, n, 0, dMNow, 1);
    let sm = bodyOf(wm, MY_P[n], t, b);
    // b7: the sniff — his nose goes up, and comes down again
    if (A_BLAME[n]) sm = { ...sm, neck: sm.neck + 0.32 * bp(0.12, 0.28, 0.6) };
    // Q2 answered wrong: he shrugs, once
    if (q2 && pk !== RIGHT_DRAFT) sm = mixStance(sm, hLive(SHRUG, t, Math.max(0, rs - 0.35)), rAt(0.3, 0.5) * (1 - rAt(2.2, 2.6)));
    const pelM = DAIS - 34 * K;
    // b0: two taps on the top of the sack, and the hand back
    if (A_DECREE[n]) {
      const tap = 4 * (bAt(1.05, 1.2, 1.35) + bAt(1.5, 1.65, 1.8));
      sm = hand(sm, xM, DAIS, dM, 1, SACK_HOME.x, SACK_HOME.y - 1 - tap, sAt(0.75, 1.05) * (1 - sAt(2.0, 2.35)));
    }
    // b1: the sack lifted by its neck in his left hand and held at his chest; two coins
    // out of it into her palm with his right, one stroke each (AR5); the sack set down
    let mouth = { x: xM + 9 * K * dM, y: pelM - 13 * K };
    if (A_BASKET[n]) {
      sm = hand(sm, xM, DAIS, dM, -1, SACK_HOME.x, SACK_HOME.y, sAt(0.05, 0.25) * (1 - sAt(0.3, 0.45)));
      sm = holdAt(sm, -1, 9, -10, sAt(0.3, 0.45) * (1 - sAt(4.3, 4.55)));
      sm = hand(sm, xM, DAIS, dM, -1, SACK_BACK.x, SACK_BACK.y, sAt(4.3, 4.55) * (1 - sAt(4.85, 5.1)));
      for (let k = 0; k < 2; k += 1) {
        const a0 = 1.2 + k * 1.6;
        sm = hand(sm, xM, DAIS, dM, 1, mouth.x, mouth.y, sAt(a0, a0 + 0.25) * (1 - sAt(a0 + 0.3, a0 + 0.5)));
        sm = hand(sm, xM, DAIS, dM, 1, PALM.x, PALM.y - 2, sAt(a0 + 0.35, a0 + 0.6) * (1 - sAt(a0 + 0.75, a0 + 0.95)));
      }
    }
    // b8: three drafts tipped over the table's front edge as he goes along it, right to
    // left — a path with a stop at each (AR7.5) — and then the seal picked up
    if (A_WANT[n]) {
      for (let j = 2; j >= 0; j -= 1) {
        const a0 = FLIP_AT[j];
        sm = hand(sm, xM, DAIS, dM, 1, DRAFT_X[j], TOP - 2 + 3 * sAt(a0 + 0.2, a0 + 0.35), sAt(a0, a0 + 0.2) * (1 - sAt(a0 + 0.4, a0 + 0.6)));
      }
      sm = hand(sm, xM, DAIS, dM, 1, STAMP_HOME.x, STAMP_HOME.y, sAt(5.1, 5.4) * (1 - sAt(5.5, 5.8)));
    }
    // the seal, once he has it: held at his chest
    const stampHeld = A_WANT[n] ? sAt(5.5, 5.8) : n > WANT_N ? 1 : 0;
    sm = holdAt(sm, 1, 9, -10, stampHeld);
    // Q2 answered right: the seal raised over the draft and pressed down on it
    if (sealRight) {
      const press = 3.2 * rBump(1.2, 1.38, 1.65);
      sm = hand(sm, xM, DAIS, dM, 1, DRAFT_X[RIGHT_DRAFT], TOP - 8 + press, rAt(0.9, 1.15) * (1 - rAt(2.1, 2.45)));
    }
    const prevM = carryFrom(heldM, n, hHold(MY_P[p], t));
    const figM = keepHeld(heldM, wm.walking ? mixKeepLegs(prevM, sm, tr) : mixStance(prevM, sm, tr));

    // ── the catcher ─────────────────────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 2, n, 156), BN_LEGS[n], b, L);
    const xB = carry(cv, 2, n, wb.x, wb.x, 1);
    const dB = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, -1), BN_TURN[n], b, L), 1);
    let sb = bodyOf(wb, BN_P[n], t, b);
    // the hatch: how far open (0 shut · 1 standing up). b4 she lifts it from wherever it
    // is on screen; b10 she pushes it over and it falls shut
    const srcLid = carrySource(cv, 4, n, 0);
    let lidNow = 0;
    if (Q1[n]) lidNow = q1 && pk === 0 ? 0.3 * rAt(0.12, 0.5) + 0.06 * rBump(0.5, 0.62, 0.85) : 0;
    else if (A_FARM[n]) lidNow = lerp(srcLid, 1, sAt(1.25, 2.2));
    else if (A_CABBAGES[n]) {
      const fall = clamp01((b - 0.95) / 0.3);
      lidNow = b < 0.95 ? lerp(srcLid, 0.55, sAt(0.4, 0.9)) : 0.55 * (1 - fall * fall);
    } else if (n > FARM_N && n < CAB_N) lidNow = 1;
    const lid = carry(cv, 4, n, lidNow, lidNow, A_FARM[n] || A_CABBAGES[n] ? 1 : tr);
    const lidFront = frontOf(lid);
    // b0: her basket hangs from her left hand; b1 she lifts it onto his table
    if (n === 0) sb = holdAt(sb, -1, 8, 2, 1);
    if (A_BASKET[n]) {
      sb = holdAt(sb, -1, 8, 2, 1 - sAt(0.1, 0.5));
      sb = hand(sb, xB, GROUND, dB, -1, BASKET_HOME.x, BASKET_HOME.y, sAt(0.1, 0.5) * (1 - sAt(0.65, 0.85)));
      // her palm held out for the coins, and the coins into her apron pocket
      sb = hand(sb, xB, GROUND, dB, 1, PALM.x, PALM.y, sAt(0.9, 1.2) * (1 - sAt(4.0, 4.3)));
      sb = holdAt(sb, 1, 4, 5, sAt(4.1, 4.4) * (1 - sAt(4.6, 4.9)));
    }
    // b4: down on one knee at the hatch, a hand on its ring, and up it comes; then up
    // she gets to show it off
    if (A_FARM[n]) {
      sb = mixStance(sb, hHold(KNEEL, t), sAt(0.75, 1.05) * (1 - sAt(2.45, 2.85)));
      sb = hand(sb, xB, GROUND, dB, 1, RING_X, lidFront + 1, sAt(0.95, 1.2) * (1 - sAt(2.25, 2.5)));
    }
    // b10: the hatch pushed over by its top edge; then a cabbage from the crate, held up
    if (A_CABBAGES[n]) {
      sb = hand(sb, xB, GROUND, dB, 1, RING_X, lidFront + 1, sAt(0.1, 0.4) * (1 - sAt(0.85, 1.05)));
      sb = hand(sb, xB, GROUND, dB, 1, CAB_HOME.x, CAB_HOME.y - 3, sAt(2.4, 2.75) * (1 - sAt(2.85, 3.1)));
      sb = holdAt(sb, 1, 10, -16, sAt(2.85, 3.2) * (1 - sAt(3.4, 3.8)));
      sb = holdAt(sb, 1, 13, -36, sAt(3.4, 3.8) * (1 - sAt(4.6, 5.0)));
      sb = holdAt(sb, 1, 10, -14, sAt(4.6, 5.0));
    }
    if (n > CAB_N) sb = holdAt(sb, 1, 10, -14, 1);
    const prevB = carryFrom(heldB, n, hHold(BN_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the economist ───────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 5, n, TH_OFF), TH_LEGS[n], b, L);
    const xT = carry(cv, 5, n, wt.x, wt.x, 1);
    const dT = carry(cv, 6, n, 0, faceOf(carrySource(cv, 6, n, 1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P[n], t, b);
    // the lantern hangs from his left hand until b6, when he sets it on the table's end
    const lanternHeld = n < SUPPLY_N ? 1 : n === SUPPLY_N ? 1 - sAt(0.15, 0.5) : 0;
    stt = holdAt(stt, -1, 8, 4, lanternHeld);
    // b2: his hat tipped once he has arrived and turned to the mayor
    if (A_LANTERN[n]) stt = hand(stt, xT, GROUND, dT, 1, xT + 5 * dT, GROUND - 76, bAt(4.6, 4.8, 5.15));
    // b5: a coin out of his waistcoat pocket, held up between finger and thumb
    if (A_INCENTIVE[n]) {
      stt = holdAt(stt, 1, 5, -14, sAt(0.4, 0.75) * (1 - sAt(0.9, 1.2)));
      stt = holdAt(stt, 1, 13, -40, sAt(0.95, 1.5) * (1 - st(0.86, 0.95)));
      stt = holdAt(stt, 1, 9, -12, st(0.86, 0.95));
    }
    // b6: the lantern set down, a tail taken out of her basket and held up, and then
    // both held close while he turns to nod at the hatch
    if (A_SUPPLY[n]) {
      stt = holdAt(stt, 1, 9, -12, 1);
      stt = hand(stt, xT, GROUND, dT, -1, LANTERN_HOME.x, LANTERN_HOME.y, sAt(0.15, 0.5) * (1 - sAt(0.65, 0.85)));
      stt = hand(stt, xT, GROUND, dT, -1, TAILS.x, TAILS.y, sAt(0.9, 1.15) * (1 - sAt(1.25, 1.6)));
      stt = holdAt(stt, -1, 12, -38, sAt(1.3, 1.7) * (1 - st(0.62, 0.72)));
      stt = holdAt(stt, -1, 9, -10, st(0.62, 0.72));
      stt = { ...stt, neck: stt.neck - 0.22 * bp(0.8, 0.86, 0.95) };
    }
    if (A_BLAME[n]) {
      stt = holdAt(stt, 1, 9, -12, 1);
      stt = holdAt(stt, -1, 9, -10, 1);
    }
    // b8: the tail back in the basket, the coin back in his pocket, a step toward the
    // arch and a finger pointing out through it at the street
    if (A_WANT[n]) {
      stt = holdAt(stt, 1, 9, -12, 1 - sAt(0.7, 0.95));
      stt = holdAt(stt, -1, 9, -10, 1 - sAt(0.2, 0.5));
      stt = hand(stt, xT, GROUND, dT, -1, TAILS.x, TAILS.y, sAt(0.2, 0.5) * (1 - sAt(0.65, 0.9)));
      stt = holdAt(stt, 1, 5, -14, sAt(0.7, 0.95) * (1 - sAt(1.1, 1.3)));
      stt = hand(stt, xT, GROUND, dT, 1, 330, 418, sAt(1.9, 2.3) * (1 - sAt(5.0, 5.4)));
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the three people, posed ─────────────────────────────────────────────
    const my = pose(figM, xM, DAIS, K, dM, 1);
    const bn = pose(figB, xB, GROUND, K, dB, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const mR = wristOf(my, 'wrR');
    const mL = wristOf(my, 'wrL');
    const bR = wristOf(bn, 'wrR');
    const bL = wristOf(bn, 'wrL');
    const tR = wristOf(th, 'wrR');
    const tL = wristOf(th, 'wrL');
    mouth = { x: mL.x, y: mL.y - 3 };

    // ── what they carry ─────────────────────────────────────────────────────
    // sack: 0 on the table · 1 his left hand · 2 set down again
    const sackNow = A_BASKET[n] ? sAt(0.25, 0.32) + sAt(4.55, 4.62) : n > BASKET_N ? 2 : 0;
    const skS = carry(cv, 7, n, sackNow, sackNow, tr);
    const sack = skS <= 1
      ? { x: lerp(SACK_HOME.x, mL.x, skS), y: lerp(SACK_HOME.y, mL.y, skS) }
      : { x: lerp(mL.x, SACK_BACK.x, skS - 1), y: lerp(mL.y, SACK_BACK.y, skS - 1) };
    // coins: 0 in the sack · 1 his right hand · 2 her palm · 3 her pocket
    const coinNow = (k: number) => {
      'worklet';
      const a0 = 1.2 + k * 1.6;
      return A_BASKET[n] ? sAt(a0 + 0.22, a0 + 0.3) + sAt(a0 + 0.6, a0 + 0.68) + sAt(4.35, 4.45) : n > BASKET_N ? 3 : 0;
    };
    const coinS = [carry(cv, 8, n, coinNow(0), coinNow(0), tr), carry(cv, 9, n, coinNow(1), coinNow(1), tr)];
    const coins = [0, 1].map((k) => {
      const c = coinS[k];
      const palm = { x: bR.x - 2 * dB + k * 2.4 * dB, y: bR.y - 2 - k * 0.6 };
      const at = c <= 1 ? { x: mouth.x, y: mouth.y } : c <= 2
        ? { x: lerp(mR.x + 1.5 * dM, palm.x, c - 1), y: lerp(mR.y - 1, palm.y, c - 1) }
        : palm;
      const x = c < 1 ? lerp(mouth.x, mR.x + 1.5 * dM, c) : at.x;
      const y = c < 1 ? lerp(mouth.y, mR.y - 1, c) : at.y;
      return { x, y, o: clamp01(c * 3) * (1 - clamp01((c - 2.5) * 2)) };
    });
    // basket: 0 her left hand · 1 on the table's end
    const basketNow = A_BASKET[n] ? sAt(0.5, 0.6) : n > BASKET_N ? 1 : 0;
    const bkS = carry(cv, 10, n, basketNow, basketNow, tr);
    const basket = { x: lerp(bL.x, BASKET_HOME.x, bkS), y: lerp(bL.y, BASKET_HOME.y, bkS) };
    // lantern: 0 his left hand · 1 on the table
    const lanNow = A_SUPPLY[n] ? sAt(0.5, 0.58) : n > SUPPLY_N ? 1 : 0;
    const lnS = carry(cv, 11, n, lanNow, lanNow, tr);
    const lantern = { x: lerp(tL.x, LANTERN_HOME.x, lnS), y: lerp(tL.y, LANTERN_HOME.y, lnS), s: lnS };
    // his coin: shown from b5 to the start of b8
    const tcoinNow = A_INCENTIVE[n] ? sAt(0.75, 0.85) : n > INCENTIVE_N && n < WANT_N ? 1 : A_WANT[n] ? 1 - sAt(0.9, 1.0) : 0;
    const tcoin = { x: tR.x + 1.5 * dT, y: tR.y - 1.6, o: carry(cv, 12, n, tcoinNow, tcoinNow, tr) };
    // the tail: 0 in the basket · 1 his left hand · 2 back in the basket
    const tailNow = A_SUPPLY[n] ? sAt(1.1, 1.2) : A_BLAME[n] ? 1 : A_WANT[n] ? 1 + sAt(0.5, 0.6) : n > WANT_N ? 2 : 0;
    const tlS = carry(cv, 13, n, tailNow, tailNow, tr);
    const tail = { x: tL.x, y: tL.y - 0.5, o: clamp01(tlS * 6) * (1 - clamp01((tlS - 1) * 6)) };
    // the seal: 0 on the table · 1 his right hand
    const stampNow = A_WANT[n] ? sAt(5.4, 5.5) : n > WANT_N ? 1 : 0;
    const stS = carry(cv, 14, n, stampNow, stampNow, tr);
    const stamp = { x: lerp(STAMP_HOME.x, mR.x, stS), y: lerp(STAMP_HOME.y, mR.y, stS) };
    // the cabbage: 0 in the crate · 1 her right hand
    const cabNow = A_CABBAGES[n] ? sAt(2.7, 2.8) : n > CAB_N ? 1 : 0;
    const cbS = carry(cv, 15, n, cabNow, cabNow, tr);
    const cab = { x: lerp(CAB_HOME.x, bR.x + 2 * dB, cbS), y: lerp(CAB_HOME.y, bR.y + 3, cbS) };

    // ── the hatch and its rats ──────────────────────────────────────────────
    const srcPeek = carrySource(cv, 16, n, 0);
    const peekOf = (r: number) => {
      'worklet';
      if (Q1[n]) return q1 && pk === 0 ? 0.8 * rAt(0.35 + 0.12 * r, 0.8 + 0.12 * r) : 0;
      if (A_FARM[n]) return lerp(srcPeek, 1, sAt(1.5 + 0.25 * r, 2.1 + 0.25 * r));
      if (A_CABBAGES[n]) return 1 - sAt(0.2 + 0.05 * r, 0.6 + 0.05 * r);
      return n > FARM_N && n < CAB_N ? 1 : 0;
    };
    const pTr = A_FARM[n] ? 1 : tr;
    const peeks = [
      carry(cv, 16, n, peekOf(0), peekOf(0), pTr), carry(cv, 17, n, peekOf(1), peekOf(1), pTr), carry(cv, 18, n, peekOf(2), peekOf(2), pTr),
    ];

    // ── the street: the bakery door and the well's lid, answering Q1 wrong ────
    const rattleNow = q1 && pk === 1 ? Math.sin(rs * 38) * rAt(0, 0.08) * (1 - rAt(0.55, 0.9)) : 0;
    const rattle = carry(cv, 19, n, rattleNow, rattleNow, tr);
    const hopNow = q1 && pk === 2 ? rBump(0.08, 0.2, 0.42) : 0;
    const hop = carry(cv, 20, n, hopNow, hopNow, tr);
    const splashNow = q1 && pk === 2 ? clamp01((rs - 0.32) / 0.5) : 0;
    const splash = carry(cv, 21, n, splashNow, splashNow, tr);

    // ── the drafts: how far each has unrolled, and the seal ─────────────────
    const draftOf = (j: number) => {
      'worklet';
      if (A_WANT[n]) {
        const a = FLIP_AT[j] + 0.35;
        return sAt(a, a + 0.4) + 0.07 * bAt(a + 0.3, a + 0.42, a + 0.6);
      }
      if (Q2[n]) return q2 && pk === j && j !== RIGHT_DRAFT ? 1 - rAt(0.1, 0.42) + 0.08 * rBump(0.42, 0.5, 0.65) : 1;
      if (A_CABBAGES[n]) return j === RIGHT_DRAFT ? 1 : 1 - sAt(0.25, 0.65);
      return n > CAB_N ? (j === RIGHT_DRAFT ? 1 : 0) : 0;
    };
    const drafts = [
      carry(cv, 22, n, draftOf(0), draftOf(0), tr), carry(cv, 23, n, draftOf(1), draftOf(1), tr), carry(cv, 24, n, draftOf(2), draftOf(2), tr),
    ];
    const sealNow = Q2[n] ? (sealRight ? rAt(1.32, 1.42) : 0) : A_CABBAGES[n] ? sAt(0.6, 1.1) : n > CAB_N ? 1 : 0;
    const seal = carry(cv, 25, n, sealNow, sealNow, Q2[n] ? 1 : tr);

    // ── the rat that runs across the floor on b2 ────────────────────────────
    const runU = A_LANTERN[n] ? sAt(1.0, 2.8) : 0;
    const ratX = carry(cv, 26, n, lerp(312, 150, runU), lerp(312, 150, runU), 1);
    const ratOn = carry(cv, 27, n, 0, runU > 0 && runU < 1 ? 1 : 0, tr);

    return {
      my, bn, th, t,
      sack, coins, basket, lantern, tcoin, tail, stamp, cab,
      lid, peeks, rattle, hop, splash, drafts, seal, rat: { x: ratX, o: ratOn },
      q1: carry(cv, 28, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 29, n, Q2[p], Q2[n], tr),
    };
  });

  const DM = useDerivedValue<Bundle>(() => SCENE.value.my);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <Backdrop />
      <Flames S={SCENE} />
      <StreetView S={SCENE} />
      <ObjectArt parts={ARCH_ART} tone={TONE} />
      <View style={styles.skirtL} pointerEvents="none" />
      <View style={styles.skirtR} pointerEvents="none" />
      <CellarPlaque S={SCENE} />
      <FloorView />
      <Hatch S={SCENE} rats={i >= Q1_N && i <= CAB_N + 1} />
      {i >= LANTERN_N && i <= LANTERN_N + 1 ? <RunningRat S={SCENE} /> : null}
      <LessonPicture name="econ5-crate" />
      {CAB_BACK.map((a, k) => <ObjectArt key={k} parts={a} tone={TONE} />)}
      <LessonPicture name="econ5-dais" />
      {/* cast: plain */}
      <Stickman D={DM} k={K} role="second" wear={[]} />
      <LessonPicture name="econ5-table" />
      <ObjectArt parts={CANDLE_ART} tone={TONE} />
      <Flame S={SCENE} x={22} y={430.5} s={0.55} ph={4.2} />
      <Drafts S={SCENE} open={i >= WANT_N - 1} />
      <Riders S={SCENE} layer="table" i={i} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="crowd" wear={BY_ID.magistrate.pieces} />
      <Riders S={SCENE} layer="econ" i={i} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Riders S={SCENE} layer="front" i={i} />
      {on(Q1) ? <PeekTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <DecreeTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the hall ─────────────────────────────────────────────────────────────────

/** The wall, its courses, the beam, the banner, the torches and the proclamation. */
function Backdrop() {
  return (
    <>
      <View style={styles.masonry} pointerEvents="none" />
      {COURSES.map((y) => <View key={`c${y}`} style={[styles.joint, { top: y }]} pointerEvents="none" />)}
      {PERPS.map((q) => <View key={`p${q.x}-${q.y}`} style={[styles.perp, { left: q.x, top: q.y }]} pointerEvents="none" />)}
      {TORCHES.map((x) => <View key={`g${x}`} style={[styles.glow, { left: x - 30, top: 332 }]} pointerEvents="none" />)}
      <ObjectArt parts={BEAM_ART} tone={TONE} />
      <ObjectArt parts={BANNER_ART} tone={TONE} />
      {TORCH_ART.map((a, k) => <ObjectArt key={k} parts={a} tone={TONE} />)}
      <View style={styles.proclaim} pointerEvents="none">
        <Text style={styles.proclaimHead}>DECREE</Text>
        <Text style={styles.proclaimText}>{'One silver coin\nper rat tail'}</Text>
      </View>
      <ObjectArt parts={PROCLAIM_SEAL} tone={TONE} />
    </>
  );
}

/** A flame, flickering on the clock (never on `bt`): two torches and the mayor's candle. */
function Flame({ S, x, y, s, ph }: { S: SharedValue<any>; x: number; y: number; s: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const f = flick(S.value.t, ph);
    return { transform: [{ translateX: x }, { translateY: y }, { scaleX: s * (1 - f * 0.5) }, { scaleY: s * (1 + f) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.flameOuter} />
      <View style={styles.flameInner} />
    </Animated.View>
  );
}
function Flames({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <Flame S={S} x={TORCHES[0]} y={364} s={1} ph={0} />
      <Flame S={S} x={TORCHES[1]} y={364} s={1} ph={2.1} />
    </>
  );
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

/** Through the arch: the dusk sky, the bakery across the street, its door, the well. */
function StreetView({ S }: { S: SharedValue<any> }) {
  const door = useAnimatedStyle(() => ({
    transform: [{ translateX: DOOR_AT.x + 2 * S.value.rattle }, { translateY: DOOR_AT.y }, { rotate: `${2.2 * S.value.rattle}deg` }],
  }));
  const lid = useAnimatedStyle(() => ({
    transform: [
      { translateX: WELL_LID_AT.x }, { translateY: WELL_LID_AT.y - 4.5 * S.value.hop },
      { rotate: `${-7 * S.value.hop}deg` },
    ],
  }));
  return (
    <View style={styles.arch} pointerEvents="none">
      <View style={styles.glowHigh} />
      <View style={styles.glowLow} />
      {[[36, 6], [64, 10], [22, 17], [80, 15]].map(([x, y], k) => <Star key={k} S={S} x={x} y={y} ph={k * 1.7} />)}
      {[0, 1, 2].map((k) => <Smoke key={k} S={S} k={k} />)}
      <View style={styles.inArch} pointerEvents="none">
        <ObjectArt parts={HOUSE_ART} tone={TONE} />
      </View>
      <View style={styles.cobbles} />
      <View style={styles.plqBakery}>
        <Text style={styles.plqTextLight}>BAKERY</Text>
      </View>
      <View style={styles.inArchAbs} pointerEvents="none">
        <Animated.View style={[styles.rider, door]}>
          <ObjectArt parts={DOOR_ART} tone={TONE} />
        </Animated.View>
        <View style={styles.wellBox} pointerEvents="none">
          <ObjectArt parts={WELL_ART} tone={TONE} />
        </View>
        <Animated.View style={[styles.rider, lid]}>
          <ObjectArt parts={WELL_LID_ART} tone={TONE} />
        </Animated.View>
        <Splash S={S} />
        <View style={styles.plqWell}>
          <Text style={styles.plqText}>WELL</Text>
        </View>
      </View>
    </View>
  );
}

function Star({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.sin(S.value.t * 1.3 + ph) }));
  return <Animated.View style={[styles.star, { left: x, top: y }, st]} />;
}

/** A puff of chimney smoke, rising and thinning, on the clock. */
function Smoke({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const f = (((S.value.t * 0.16 + k / 3) % 1) + 1) % 1;
    return {
      opacity: Math.sin(Math.PI * f) * 0.55,
      transform: [
        { translateX: 30 + 7 * f + 1.5 * Math.sin(S.value.t * 0.9 + k) }, { translateY: 18 - 18 * f },
        { scale: 0.6 + 0.9 * f },
      ],
    };
  });
  return <Animated.View style={[styles.puff, st]} />;
}

/** Two drops of well water thrown up by the lid as it drops (Q1, the well, wrong). */
function Splash({ S }: { S: SharedValue<any> }) {
  const a = useAnimatedStyle(() => {
    const u = S.value.splash;
    return { opacity: u > 0 && u < 1 ? 1 - u : 0, transform: [{ translateX: 350 - 8 * u }, { translateY: 445 - 10 * Math.sin(Math.PI * u) }] };
  });
  const c = useAnimatedStyle(() => {
    const u = S.value.splash;
    return { opacity: u > 0 && u < 1 ? 1 - u : 0, transform: [{ translateX: 366 + 7 * u }, { translateY: 445 - 8 * Math.sin(Math.PI * u) }] };
  });
  return (
    <>
      <Animated.View style={[styles.drop, a]} />
      <Animated.View style={[styles.drop, c]} />
    </>
  );
}

// ── the cellar hatch ─────────────────────────────────────────────────────────

/**
 * The hole, the lid's underside (seen once it is up), the rats, the lid's top (seen while
 * it is down), and a strip of floor along the near edge that the rats duck behind. The
 * lid is one flat thing turning on its far hinge: its top face shrinks toward the hinge as
 * it rises and its underside grows up from it, so they are drawn on either side of the rats.
 */
/** The CELLAR plaque sits behind where the lid stands when it is open, so it goes out of
 *  view as the lid rises in front of it (check:readable, UNDER), and comes back as it shuts. */
function CellarPlaque({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 1 - clamp01((HINGE - frontOf(S.value.lid)) / 12) }));
  return (
    <Animated.View style={[styles.plqCellar, st]} pointerEvents="none">
      <Text style={styles.plqText}>CELLAR</Text>
    </Animated.View>
  );
}

function Hatch({ S, rats }: { S: SharedValue<any>; rats: boolean }) {
  const top = useAnimatedStyle(() => {
    const f = frontOf(S.value.lid);
    const s = (f - HINGE) / 15;
    return { opacity: s > 0.02 ? 1 : 0, transform: [{ scaleY: Math.max(0.02, s) }] };
  });
  const under = useAnimatedStyle(() => {
    const f = frontOf(S.value.lid);
    const s = (HINGE - f) / 34;
    return { opacity: s > 0.02 ? 1 : 0, transform: [{ scaleY: Math.max(0.02, s) }] };
  });
  return (
    <>
      <View style={styles.holeBox} pointerEvents="none">
        <LessonPicture name="econ5-hole" />
      </View>
      <Animated.View style={[styles.lidUnder, under]} pointerEvents="none">
        <LessonPicture name="econ5-lid-under" />
      </Animated.View>
      <View style={styles.ratClip} pointerEvents="none">
        {rats ? RAT_AT.map((x, r) => <PeekRat key={r} S={S} x={x} r={r} />) : null}
      </View>
      <Animated.View style={[styles.lidTop, top]} pointerEvents="none">
        <LessonPicture name="econ5-lid-top" />
      </Animated.View>
    </>
  );
}

/** One rat looking up out of the cellar, nose going, head turning now and then. */
function PeekRat({ S, x, r }: { S: SharedValue<any>; x: number; r: number }) {
  const st = useAnimatedStyle(() => {
    const p = S.value.peeks[r];
    const t = S.value.t;
    return {
      opacity: p > 0.02 ? 1 : 0,
      transform: [
        { translateX: x - RAT_CLIP.left }, { translateY: 510 - 14 * p - RAT_CLIP.top },
        { rotate: `${p * (5 * Math.sin(t * 1.7 + r * 2) + 2 * Math.sin(t * 9 + r))}deg` },
      ],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="econ5-rat-peek" />
    </Animated.View>
  );
}

/** The rat that runs out from behind the crate and under the dais on b2. */
function RunningRat({ S }: { S: SharedValue<any> }) {
  // the legs change with the distance run, never with the clock
  const a = useAnimatedStyle(() => {
    const x = S.value.rat.x;
    return { opacity: S.value.rat.o * (Math.floor(x / 5) % 2 === 0 ? 1 : 0), transform: [{ translateX: x }, { translateY: 489 }] };
  });
  const c = useAnimatedStyle(() => {
    const x = S.value.rat.x;
    return { opacity: S.value.rat.o * (Math.floor(x / 5) % 2 === 1 ? 1 : 0), transform: [{ translateX: x }, { translateY: 489 }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, a]} pointerEvents="none"><LessonPicture name="econ5-rat-a" /></Animated.View>
      <Animated.View style={[styles.rider, c]} pointerEvents="none"><LessonPicture name="econ5-rat-b" /></Animated.View>
    </>
  );
}

// ── the draft decrees ────────────────────────────────────────────────────────

/** One draft: rolled on the table's edge, then hanging from its roller, unrolled. */
function Draft({ S, j, open }: { S: SharedValue<any>; j: number; open: boolean }) {
  const x = DRAFT_X[j];
  const clip = useAnimatedStyle(() => ({ height: PAPER_H * clamp01(S.value.drafts[j]) }));
  const roller = useAnimatedStyle(() => ({ opacity: clamp01(S.value.drafts[j] * 5) }));
  const roll = useAnimatedStyle(() => ({ transform: [{ translateX: x }, { translateY: TOP + 0.2 + 45 * S.value.drafts[j] }] }));
  const seal = useAnimatedStyle(() => {
    const s = j === RIGHT_DRAFT ? S.value.seal : 0;
    return { opacity: s, transform: [{ translateX: x }, { translateY: TOP + 5 }, { scale: 0.5 + 0.5 * s }] };
  });
  return (
    <>
      {open ? <Animated.View style={[styles.rider, { transform: [{ translateX: x }, { translateY: TOP + 3 }] }, roller]} pointerEvents="none">
        <ObjectArt parts={ROLLER_ART} tone={TONE} />
      </Animated.View> : null}
      {open ? <Animated.View style={[styles.draftClip, { left: x - 22 }, clip]} pointerEvents="none">
        <View style={styles.draftPaper}>
          <Text style={styles.draftText}>{DRAFT_WORDS[j]}</Text>
        </View>
      </Animated.View> : null}
      <Animated.View style={[styles.rider, roll]} pointerEvents="none">
        <ObjectArt parts={ROLL_ART} tone={TONE} />
      </Animated.View>
      {open && j === RIGHT_DRAFT ? <Animated.View style={[styles.rider, seal]} pointerEvents="none">
        <ObjectArt parts={SEAL_ART} tone={TONE} />
      </Animated.View> : null}
    </>
  );
}
function Drafts({ S, open }: { S: SharedValue<any>; open: boolean }) {
  return (
    <>
      <Draft S={S} j={0} open={open} />
      <Draft S={S} j={1} open={open} />
      <Draft S={S} j={2} open={open} />
    </>
  );
}

// ── the things that move ─────────────────────────────────────────────────────

type At = { x: number; y: number; o?: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof silverCoin> }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o ?? 1,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

/**
 * What they carry, in three layers: on the table (behind the economist and the catcher,
 * in front of the mayor), in the economist's hands, and in hers. The lantern is in two:
 * in his hand in front of him, on the table behind him.
 */
function Riders({ S, layer, i }: { S: SharedValue<any>; layer: 'table' | 'econ' | 'front'; i: number }) {
  const sack = useDerivedValue<At>(() => ({ x: S.value.sack.x, y: S.value.sack.y, o: layer === 'table' ? 1 : 0 }));
  const stamp = useDerivedValue<At>(() => ({ x: S.value.stamp.x, y: S.value.stamp.y, o: layer === 'table' ? 1 : 0 }));
  const basket = useDerivedValue<At>(() => ({ x: S.value.basket.x, y: S.value.basket.y, o: layer === 'table' ? 1 : 0 }));
  const lantern = useDerivedValue<At>(() => {
    const onTable = S.value.lantern.s >= 0.5;
    return { x: S.value.lantern.x, y: S.value.lantern.y, o: (layer === 'table') === onTable && layer !== 'front' ? 1 : 0 };
  });
  const tcoin = useDerivedValue<At>(() => ({ x: S.value.tcoin.x, y: S.value.tcoin.y, o: layer === 'econ' ? S.value.tcoin.o : 0 }));
  const tail = useDerivedValue<At>(() => ({ x: S.value.tail.x, y: S.value.tail.y, o: layer === 'econ' ? S.value.tail.o : 0 }));
  const cab = useDerivedValue<At>(() => ({ x: S.value.cab.x, y: S.value.cab.y, o: layer === 'front' ? 1 : 0 }));
  const c0 = useDerivedValue<At>(() => ({ ...S.value.coins[0], o: layer === 'front' ? S.value.coins[0].o : 0 }));
  const c1 = useDerivedValue<At>(() => ({ ...S.value.coins[1], o: layer === 'front' ? S.value.coins[1].o : 0 }));
  if (layer === 'table') {
    return (
      <>
        <Rider at={stamp} art={STAMP_ART} />
        <Rider at={sack} art={SACK_ART} />
        <Rider at={basket} art={BASKET_ART} />
        {i >= SUPPLY_N - 1 ? <Rider at={lantern} art={LANTERN_ART} /> : null}
      </>
    );
  }
  if (layer === 'econ') {
    return (
      <>
        {i <= SUPPLY_N + 1 ? <Rider at={lantern} art={LANTERN_ART} /> : null}
        {i >= INCENTIVE_N - 1 && i <= WANT_N + 1 ? <Rider at={tcoin} art={COIN_ART} /> : null}
        {i >= SUPPLY_N - 1 && i <= WANT_N + 1 ? <Rider at={tail} art={TAIL_ART} /> : null}
      </>
    );
  }
  return (
    <>
      <Rider at={cab} art={CABBAGE_ART} />
        {i <= LANTERN_N ? <Rider at={c0} art={COIN_ART} /> : null}
        {i <= LANTERN_N ? <Rider at={c1} art={COIN_ART} /> : null}
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both are tapped ON THE STAGE (AP6), on the things themselves. No two live targets touch
 * (AN4). Q1, LOOK BEHIND A DOOR: the cellar hatch (with its plaque), the bakery's door
 * (with its board) and the well (with its lid). Q2, SEAL A DECREE: the three drafts.
 */
type Q = { id: string; left: number; top: number; w: number; h: number; correct: boolean };
const PEEK_Q: Q[] = [
  { id: 'cellar', left: 188, top: 432, w: 54, h: 68, correct: true },
  { id: 'bakery', left: 286, top: 388, w: 44, h: 74, correct: false },
  { id: 'well', left: 336, top: 404, w: 44, h: 60, correct: false },
];
const DECREE_Q: Q[] = DRAFT_X.map((x, j) => ({ id: DRAFT_IDS[j], left: x - 24, top: TOP - 16, w: 48, h: 65, correct: j === RIGHT_DRAFT }));
type TP = { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> };
function PeekTargets(p: TP) {
  return <StageTargets {...p} qs={PEEK_Q} k="q1" />;
}
function DecreeTargets(p: TP) {
  return <StageTargets {...p} qs={DECREE_Q} k="q2" />;
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
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

const STONE = NATURAL.e5Stone;
const FLOOR = NATURAL.e5Floor;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  masonry: { position: 'absolute', left: 0, top: 290, width: 400, height: 180, backgroundColor: STONE.base },
  joint: { position: 'absolute', left: 0, width: 400, height: 0.9, backgroundColor: STONE.shade },
  perp: { position: 'absolute', width: 0.9, height: 20, backgroundColor: STONE.shade },
  glow: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: NATURAL.e5Flame.base, opacity: 0.16 },
  skirtL: { position: 'absolute', left: 0, top: 462, width: 272, height: 8, borderRadius: 0.5, backgroundColor: STONE.shade },
  skirtR: { position: 'absolute', left: 397, top: 462, width: 3, height: 8, borderRadius: 0.5, backgroundColor: STONE.shade },
  flags: { position: 'absolute', left: 0, top: 470, width: 400, height: 90, backgroundColor: FLOOR.base, borderTopWidth: 1.2, borderTopColor: INK },
  flagRow: { position: 'absolute', left: 0, width: 400, height: 1, backgroundColor: FLOOR.shade },
  flagRay: { position: 'absolute', height: 1, backgroundColor: FLOOR.shade },
  flameOuter: {
    position: 'absolute', left: -4, top: -12, width: 8, height: 14, borderRadius: 4, backgroundColor: NATURAL.e5Flame.shade,
  },
  flameInner: {
    position: 'absolute', left: -2.2, top: -7.5, width: 4.4, height: 8, borderRadius: 2.2, backgroundColor: NATURAL.e5Flame.base,
  },
  proclaim: {
    position: 'absolute', left: 22, top: 330, width: 68, height: 58, borderRadius: 1.5, borderWidth: 1, borderColor: INK,
    backgroundColor: NATURAL.e5Parch.base, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2, boxShadow: `0 2px 0 ${NATURAL.e5Parch.shade}`,
  },
  proclaimHead: { width: 64, textAlign: 'center', fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 13, color: NATURAL.e5Red.base, includeFontPadding: false },
  proclaimText: {
    fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 13, color: NATURAL.e5Parch.label, textAlign: 'center', includeFontPadding: false,
  },
  arch: {
    position: 'absolute', left: ARCH.left, top: ARCH.top, width: ARCH.w, height: ARCH.h, overflow: 'hidden',
    borderTopLeftRadius: 50, borderTopRightRadius: 50, backgroundColor: NATURAL.e5Dusk.base,
  },
  glowHigh: { position: 'absolute', left: 0, top: 14, width: 100, height: 8, backgroundColor: NATURAL.e5Glow.shade, opacity: 0.7 },
  glowLow: { position: 'absolute', left: 0, top: 21, width: 100, height: 20, backgroundColor: NATURAL.e5Glow.base },
  star: { position: 'absolute', width: 1.8, height: 1.8, borderRadius: 0.9, backgroundColor: NATURAL.cloudWhite.base },
  puff: { position: 'absolute', left: -3.5, top: -3.5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: NATURAL.cloudWhite.shade },
  inArch: { position: 'absolute', left: 0, top: 0, width: 100, height: 104 },
  inArchAbs: { position: 'absolute', left: -ARCH.left, top: -ARCH.top, width: STAGE_W, height: STAGE_H },
  wellBox: { position: 'absolute', left: 284, top: 356, width: 100, height: 114 },
  cobbles: { position: 'absolute', left: 0, top: 102, width: 100, height: 12, borderRadius: 0.5, backgroundColor: NATURAL.e5Cobble.base },
  drop: { position: 'absolute', left: -1.2, top: -1.6, width: 2.4, height: 3.2, borderRadius: 1.2, backgroundColor: NATURAL.water.base },
  plqBakery: {
    position: 'absolute', left: 5, top: 49, width: 42, height: 11, borderRadius: 1, borderWidth: 0.8, borderColor: INK,
    backgroundColor: NATURAL.wood.base, alignItems: 'center', justifyContent: 'center', boxShadow: `0 1.4px 0 ${NATURAL.wood.shade}`,
  },
  plqWell: {
    position: 'absolute', left: 343, top: 450, width: 30, height: 11, borderRadius: 1, borderWidth: 0.8, borderColor: INK,
    backgroundColor: NATURAL.oak.base, alignItems: 'center', justifyContent: 'center', boxShadow: `0 1.4px 0 ${NATURAL.wood.shade}`,
  },
  plqCellar: {
    position: 'absolute', left: 196, top: 452, width: 40, height: 12, borderRadius: 1, borderWidth: 0.8, borderColor: INK,
    backgroundColor: NATURAL.oak.base, alignItems: 'center', justifyContent: 'center', boxShadow: `0 1.4px 0 ${NATURAL.wood.shade}`,
  },
  plqText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: NATURAL.oak.label, includeFontPadding: false },
  plqTextLight: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: NATURAL.wood.label, includeFontPadding: false },
  holeBox: { position: 'absolute', left: HATCH_X, top: HINGE, width: 50, height: 15 },
  lidTop: { position: 'absolute', left: HATCH_X, top: HINGE, width: 50, height: 15, transformOrigin: '50% 0%' },
  lidUnder: { position: 'absolute', left: HATCH_X, top: HINGE - 34, width: 50, height: 34, transformOrigin: '50% 100%' },
  ratClip: { position: 'absolute', left: RAT_CLIP.left, top: RAT_CLIP.top, width: 58, height: 496.2 - RAT_CLIP.top, overflow: 'hidden' },
  draftClip: { position: 'absolute', top: PAPER_TOP, width: 44, overflow: 'hidden' },
  draftPaper: {
    position: 'absolute', left: 0, top: 0, width: 44, height: PAPER_H, backgroundColor: NATURAL.e5Parch.base,
    borderLeftWidth: 0.8, borderRightWidth: 0.8, borderColor: INK, alignItems: 'center', paddingTop: 2.5,
  },
  // Three lines must end above the roll that hangs at the paper's foot (check:readable,
  // STRIKE): 2.5 + 3 × 10.5 = 34 of the paper's 40.
  draftText: {
    fontFamily: 'Caveat_700Bold', fontSize: 11, lineHeight: 10.5, color: NATURAL.e5Parch.label, textAlign: 'center', width: 42, includeFontPadding: false,
  },
  clear: { flexGrow: 1 },
});

export function Econ5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Econ5Scene} band={[300, 524]} camera={CAM} />;
}
