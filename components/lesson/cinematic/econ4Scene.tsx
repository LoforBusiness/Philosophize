import { useEffect, type ReactNode } from 'react';
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
import { BEATS } from './econ4Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, RIGHT, WRONG, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, stageLin, bump } from './pace';
import {
  NATURAL, raisedBed, henPeek, henHouse, coopRamp, picketFence, slatePost,
  gardenSlate, eggBox, trugBack, trugFront, TOMATO_PICK, HEN_FOOT, HEN_HIP, COOP_SILL, COOP_WINDOW, COOP_NEST_LID,
  GARDEN_SLATE_FACE,
} from './objects';
import { BY_ID } from './wardrobe';
import { PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// economics-foundations-4, "Why Do People Trade?" — TWO BACK GARDENS OVER A LOW FENCE.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The gardener (the bun) grows tomatoes and has
// taken up a hen, which eats them; her neighbour over the fence (the cap) keeps hens and
// has eggs to spare; the economist (the top hat) leans on the fence and names the trade.
//
//   b0   her hen, up on the raised bed, pecks at a tomato twice; she flaps both hands
//        at it and it hops down off the bed onto the grass.
//   b1   she turns and steps toward the fence; he lifts a box of eggs over it and holds
//        it out to her.
//   b2   the economist walks in from the right, tips his hat and rests a hand on the
//        fence; the neighbour turns to him.
//   b3   he points across at her tomato plants, and on along to the hen house.
//   b4   Q1: her tomato plants, the hen house and the fence — tap one.
//   b5   she lifts her basket off the bed by its handle, picks two tomatoes into it,
//        turns and walks to the fence (the hen trots after her), lifts the basket over;
//        he takes it, and hands her the eggs.
//   b6   the economist chalks HER, HIM and BOTH down the slate on the fence post.
//   b7   the neighbour takes a tomato out of the basket and holds it up to the light,
//        and puts it back.
//   b8   Q2: the slate's three rows — tap one.
//   b9   she kneels and picks her hen up off the grass, rises, lifts her over the
//        fence; he takes her, steps along and sets her on his hen house's ramp.
//   b10  at ease under the quotation.
//
// COMPOSITION, in stage units. At the back, a clipped privet HEDGE 0–400 × 400–500 and a
// tree over it, 65–215 × 298–404. HER GARDEN, in front, on the left: the RAISED BED
// 8–104 × 482–500 with two staked TOMATO PLANTS on it, 10–54 and 52–96, up to y 400;
// her wicker BASKET stands on the bed's right end, its handle's top at (95, 464); her
// HEN pecks on the bed at 76 and hops down onto the grass at 52, and later follows her to
// 142. She stands at 118, picks at 104 and trades at 168. THE FENCE: white pickets
// 150–400, tips at 470 — at the hip, so a thing passes over it at (190, 454), inside both
// their reaches (~23 units from a shoulder at K 0.76). HIS GARDEN, behind the fence: the
// neighbour at 212 (222 to set the hen down); his HEN HOUSE 226–310 × 397–500 on legs,
// its walls 234–290, its pop-hole sill at (242, 460) with the RAMP down to (222, 498), a
// black hen looking out of its window at (268, 434), a white hen on the nest-box lid at
// 298. The SLATE hangs on a taller post at 330, 313–347 × 422–480, its face 315.5–344.5 ×
// 432–477 in three rows of 15. The ECONOMIST stands in front of the fence at 366, a hand
// resting on the pickets at 354. Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, the listeners keep their hands still (AP18) and their heads alive (N21).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('economics');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, economics-foundations-4), except where the action needs
 * longer than the line and runs on after it — b5 (the picking, the walk and the two
 * hand-offs over the fence) and b9 (the hen picked up, handed over and set down).
 */
const LINES = [5.27, 3.62, 5.83, 6.99, 0, 6, 4.66, 4.1, 0, 5, 0, 0];

// The held poses (moves.ts act + 99): talking with the hands, nodding along, waiting.
const TALK = 167;
const NOD = 263;
const WAIT = 161;
const KNEEL = 280;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_PECK = is('peck');
const A_EGGS = is('eggs');
const A_ARRIVE = is('arrive');
const A_SPECIAL = is('special');
const A_SWAP = is('swap');
const A_GAIN = is('gain');
const A_SANDWICH = is('sandwich');
const A_HEN = is('hen');
const SWAP_N = A_SWAP.indexOf(1);
const GAIN_N = A_GAIN.indexOf(1);
const HEN_N = A_HEN.indexOf(1);
const ARRIVE_N = A_ARRIVE.indexOf(1);
const EGGS_N = A_EGGS.indexOf(1);
const FOCUS = BEATS.map((b) => (b.focus ? 1 : 0));
const GAINS = BEATS.map((b) => (b.gains ? 1 : 0));
const L_SWAP = LINES[SWAP_N];
const L_HEN = LINES[HEN_N];

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended. A turn is [fraction, facing]; it eases
// through a profile over 0.36s (cinematicKit.facing), from the facing on screen.
type Track = readonly (readonly number[])[];
const BN_LEGS: Track[] = BEATS.map((_, n) => (
  n < SWAP_N ? [[0, 118]]
    : n === SWAP_N ? [[0, 104], [3.0 / L_SWAP, 168]] : [[0, 168]]
));
const BN_TURN: Track[] = BEATS.map((_, n) => (
  n === 0 ? [[0, 1], [0.5, -1], [0.88, 1]] : n === EGGS_N ? [[0, 1]] : n < SWAP_N ? [[0, 1]]
    : n === SWAP_N ? [[0, -1], [2.9 / L_SWAP, 1]]
      : n === HEN_N ? [[0, -1], [1.4 / L_HEN, 1]] : [[0, 1]]
));
const CP_HOME = 212;
const CP_RAMP = 222;
const CP_LEGS: Track[] = BEATS.map((_, n) => (n < HEN_N ? [[0, CP_HOME]] : n === HEN_N ? [[2.8 / L_HEN, CP_RAMP]] : [[0, CP_RAMP]]));
/**
 * The neighbour faces her across the fence, and the economist while he talks to them
 * both; he turns to her for the swap and the tomato, and on b9 to his own ramp, behind
 * him, to set the hen on it — a hand is never thrown back to a thing behind him (AR4).
 */
const CP_TURN: Track[] = [
  [[0, -1]], [[0, -1]], [[0, -1], [0.25, 1]], [[0, 1]], [[0, 1]], [[0, -1]], [[0, 1]],
  [[0, -1]], [[0, -1]], [[0, -1], [2.4 / L_HEN, 1]], [[0, 1], [0.1, -1]], [[0, -1]],
];
/** The economist is off the stage, right, until he walks in on b2. */
const TH_HOME = 366;
const TH_LEGS: Track[] = BEATS.map((b) => (b.econ ? [[0, TH_HOME]] : [[0, 440]]));
const TH_TURN: Track[] = BEATS.map(() => [[0, -1]]);
/** What each is doing with his body: talking while he speaks, alive while he listens (N21). */
const BN_P = [TALK, NOD, NOD, NOD, WAIT, TALK, NOD, NOD, WAIT, TALK, NOD, WAIT];
const CP_P = [NOD, TALK, NOD, NOD, WAIT, NOD, NOD, TALK, WAIT, NOD, NOD, WAIT];
const TH_P = [WAIT, WAIT, TALK, TALK, WAIT, NOD, TALK, NOD, WAIT, NOD, NOD, WAIT];

// ── the backs of the gardens: a clipped hedge, and an apple tree over it ─────
// Both are DRAWN (LESSON_RULES AM13), against references, and baked to pictures:
// scripts/lib/lessonart/lessons/econ4.mjs — 'econ4-hedge' at 0–400 × 404–500 and
// 'econ4-tree' at 65–215 × 298–446, the boxes the shape-built ones had.

// ── her garden ───────────────────────────────────────────────────────────────
const BED = { x: 56, y: 491, w: 96, h: 18 };
const TOP = 482;                                         // the bed's top board, the soil
const PLANT = { w: 44, h: 82 };
const PLANT_A = 32;
const PLANT_B = 74;
const PLANT_Y = TOP - PLANT.h / 2;
const BED_ART = raisedBed(BED.x, BED.y, BED.w, BED.h);
// The two plants are drawn pictures too: 'econ4-plant-a' (10–54) and 'econ4-plant-b'
// (52–96, without the two ripe tomatoes she picks), both 400–482.
/** The two ripe tomatoes on plant B's right that she picks, in stage units. */
const PICK = TOMATO_PICK.map((p) => ({ x: PLANT_B - PLANT.w / 2 + p.x, y: TOP - PLANT.h + p.y }));
/** Her basket: its handle's top, standing on the bed's right end. */
const BASKET_HOME = { x: 95, y: TOP - 19 + 0.8 };
/** The pelvis's height when standing, and where her basket hangs at her side: a hand at the hip, in front. */
const PEL = GROUND - 34 * K;
const BHOLD = { x: 6, y: 472 };
/** Where a tomato sits in the basket, from the handle's top: on the rim, in front. */
const IN_BASKET = [{ x: -3.6, y: 9.2 }, { x: 2.8, y: 9.4 }];

// ── her hen ──────────────────────────────────────────────────────────────────
/** On the bed, between the plants, pecking at plant B's lowest truss. */
const HEN_BED = { x: 76, y: TOP };
/** Where she lands on the grass in front of the bed, and where she follows her to. */
const HEN_GRASS = { x: 52, y: GROUND };
const HEN_FENCE = { x: 142, y: GROUND };
/** On his ramp, feet on the plank, head at the pop-hole. */
const HEN_RAMP = { x: 236, y: 471.4 };
/** Where a hand goes under her breast, from her feet (facing right). */
const BREAST = { x: 4.8, y: -5.4 };

// ── the fence, the slate, his garden ─────────────────────────────────────────
const FENCE_ART = picketFence(275, 485, 250, 30);
/** Where the fence rattles from when a reader picks it: the middle of its run, at the ground. */
const FENCE_MID = 275;
const SLATE_X = 330;
const POST_ART = slatePost(SLATE_X, 458, 10, 84);
const SLATE_ART = gardenSlate(SLATE_X, 422 + 29, 34, 58);
const FACE = {
  left: SLATE_X - 17 + GARDEN_SLATE_FACE.x - GARDEN_SLATE_FACE.w / 2,
  top: 422 + GARDEN_SLATE_FACE.y - GARDEN_SLATE_FACE.h / 2,
  w: GARDEN_SLATE_FACE.w,
  h: GARDEN_SLATE_FACE.h,
};
const ROW_H = FACE.h / 3;
const ROWS = ['HER', 'HIM', 'BOTH'];
const COOP = { left: 226, top: 396, w: 84, h: 104 };
const COOP_ART = henHouse(COOP.left + COOP.w / 2, COOP.top + COOP.h / 2, COOP.w, COOP.h);
const SILL = { x: COOP.left + COOP_SILL.x, y: COOP.top + COOP_SILL.y };
const RAMP_ART = coopRamp(SILL.x - 22.5 + 12, SILL.y - 1 + 21, 24, 42);
const PEEK_ART = henPeek(COOP.left + COOP_WINDOW.x, COOP.top + COOP_WINDOW.y, 9, 10, 'henBlack');
const WHITE_HEN = { x: COOP.left + COOP_NEST_LID.x, y: COOP.top + COOP_NEST_LID.y };
/** Where things pass over the fence: a hand from each side meets here. */
const PASS = { x: 190, y: 454 };
/** Where the economist's hand rests on the pickets. */
const LEAN = { x: 354, y: 470 };

// The things that move are drawn about the point a hand holds them by (AR2): the hen
// about her feet, the basket about the top of its handle, the egg box about the middle
// of its tray's foot, a tomato about its middle.
// A hen is drawn as her legs, about her feet, and her body, about her HIP, so she
// pecks by tipping her body forward while her feet stay planted.
const HIP_UP = HEN_FOOT.y - HEN_HIP.y;
// The hens are drawn pictures (econ4.mjs): 'econ4-hen-legs' about her feet, and her body
// ('econ4-hen-russet', 'econ4-hen-white') about her hip, in HEN_FOOT's 26 × 22.
const HEN_W = HEN_FOOT.w;
const TRUG_B = trugBack(0, 19 / 2 - 0.8, 18, 19);
const TRUG_F = trugFront(0, 19 / 2 - 0.8, 18, 19);
/** The two tomatoes already in the basket: where 'econ4-tomato' sits, from the handle's top. */
const IN_TRUG = [{ x: -1, y: 10.8 }, { x: 4.4, y: 11.2 }];
const BOX_ART = eggBox(0, -13 / 2, 16, 13);

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
function bodyOf(w: ReturnType<typeof legsOf>, codes: readonly number[], n: number, t: number, b: number, phase?: number): Stance {
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

/** A hen's own peck now and then, on the monotonic clock: a dip and back, about a fifth of a second. */
function idlePeck(t: number, ph: number): number {
  'worklet';
  const f = ((t * 0.21 + ph) % 1 + 1) % 1;
  return f < 0.09 ? Math.sin((Math.PI * f) / 0.09) : 0;
}

const CAM = followMoves(BN_LEGS.map((l) => l[l.length - 1][1]), BEATS.map(kindOf), seedOf('economics'));

export default function Econ4Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldB = useHeld();
  const heldT = useHeld();
  const heldC = useHeld();
  const cv = useCarry(17);
  const on = useLinger(i);
  // THE QUESTIONS ANSWER BACK: which of the three was tapped on each graded beat, and how
  // many seconds ago. Each game keeps its own clock, so the second question never replays
  // the first's reaction, and what a reaction leaves (a chalk ring) stays (AH4).
  const pick1 = useSharedValue(-1);
  const pick2 = useSharedValue(-1);
  const since1 = useSharedValue(0);
  const since2 = useSharedValue(0);
  useEffect(() => {
    const qs = FOCUS[i] ? FOCUS_Q : GAINS[i] ? GAIN_Q : null;
    if (!qs) return;
    const k = picked === null ? -1 : qs.findIndex((q) => q.id === picked);
    const pick = FOCUS[i] ? pick1 : pick2;
    const since = FOCUS[i] ? since1 : since2;
    pick.value = k;
    since.value = 0;
    if (k >= 0) since.value = withTiming(4, { duration: 4000, easing: Easing.linear });
  }, [picked, i, pick1, pick2, since1, since2]);
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
    // the same, in SECONDS into the beat rather than fractions of its line
    const sAt = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a / L, z / L);
    };
    const bAt = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a / L, m / L, z / L);
    };

    // ── the gardener ────────────────────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 0, n, 118), BN_LEGS[n], b, L);
    const xB = carry(cv, 0, n, wb.x, wb.x, 1);
    const dB = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), BN_TURN[n], b, L), 1);
    let sb = bodyOf(wb, BN_P, n, t, b, 0);
    // b9: down on one knee to pick the hen up off the grass, and up again
    if (A_HEN[n]) sb = mixStance(sb, hHold(KNEEL, t), sAt(0.3, 0.7) * (1 - sAt(1.0, 1.4)));
    // b0: she tells him over the fence, turns to the hen as she names it, and shoos it
    // off the bed with both hands in ONE push (AR5), then turns back to him
    if (A_PECK[n]) {
      const out = st(0.58, 0.64) * (1 - st(0.82, 0.9));
      const push = 6 * st(0.64, 0.7);
      sb = hand(sb, xB, dB, 1, xB + (14 + push) * dB, 464, out);
      sb = hand(sb, xB, dB, -1, xB + (11 + push) * dB, 471, out);
    }
    // b5: the basket lifted off the bed by its handle and held at her side (left hand);
    // two tomatoes picked off the plant into it (right hand), one stroke each; the
    // basket lifted over the fence; the egg box taken in her right hand
    const basketB = A_SWAP[n] ? sAt(0.55, 0.95) * (1 - sAt(4.55, 4.8)) : 0;
    if (A_SWAP[n]) {
      const lift = sAt(0.95, 1.3);
      const over = sAt(4.1, 4.5);
      const hx = lerp(lerp(BASKET_HOME.x, xB + BHOLD.x * dB, lift), PASS.x, over);
      const hy = lerp(lerp(BASKET_HOME.y, BHOLD.y, lift), PASS.y - 2, over);
      sb = hand(sb, xB, dB, -1, hx, hy, basketB);
      for (let j = 0; j < 2; j += 1) {
        const a0 = 1.3 + j * 0.85;
        const into = sAt(a0 + 0.35, a0 + 0.7);
        const tx = lerp(PICK[j].x, xB + BHOLD.x * dB + IN_BASKET[j].x, into);
        const ty = lerp(PICK[j].y, BHOLD.y + IN_BASKET[j].y - 2, into);
        sb = hand(sb, xB, dB, 1, tx, ty, sAt(a0, a0 + 0.3) * (1 - sAt(a0 + 0.75, a0 + 0.95)));
      }
      sb = hand(sb, xB, dB, 1, PASS.x, PASS.y, sAt(4.95, 5.3) * (1 - sAt(5.5, 5.85)));
    }
    // the egg box, from the moment she has it: held close in front of her chest (AR6)
    const boxHold = A_SWAP[n] ? sAt(5.5, 5.85) : n > SWAP_N ? 1 : 0;
    sb = holdAt(sb, 1, 11, -12, boxHold);
    // b9: her left hand under the hen's breast on the grass, the hen held against her
    // as she rises and turns, then lifted over the fence to him
    if (A_HEN[n]) {
      const grab = sAt(0.5, 0.85) * (1 - sAt(1.0, 1.3));
      const hb = { x: HEN_FENCE.x + BREAST.x, y: HEN_FENCE.y + BREAST.y };
      sb = hand(sb, xB, dB, -1, hb.x, hb.y, grab);
      sb = holdAt(sb, -1, 10, -16, sAt(1.0, 1.3) * (1 - sAt(1.75, 2.15)));
      sb = hand(sb, xB, dB, -1, PASS.x, PASS.y + 2, sAt(1.75, 2.15) * (1 - sAt(2.5, 2.85)));
    }
    const prevB = carryFrom(heldB, n, hHold(BN_P[p], t, 0));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the economist ───────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 2, n, 440), TH_LEGS[n], b, L);
    const xT = carry(cv, 2, n, wt.x, wt.x, 1);
    const dT = carry(cv, 3, n, 0, faceOf(carrySource(cv, 3, n, -1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P, n, t, b, 1);
    // b2: he tips his hat once he has arrived; from then on a hand rests on the pickets
    const after = moveTr(440, TH_HOME, TR) / lineOf(LINES, ARRIVE_N);
    if (A_ARRIVE[n]) stt = hand(stt, xT, dT, 1, xT + 5 * dT, GROUND - 76, bp(after + 0.02, after + 0.09, after + 0.2));
    const lean = A_ARRIVE[n] ? st(after + 0.22, after + 0.32) : n > ARRIVE_N ? 1 : 0;
    stt = hand(stt, xT, dT, -1, LEAN.x, LEAN.y, lean);
    // b3: one hand across at her tomato plants, and on along to the hen house
    if (A_SPECIAL[n]) {
      const along = st(0.54, 0.62);
      stt = hand(stt, xT, dT, 1, lerp(52, 262, along), lerp(440, 430, along), st(0.33, 0.4) * (1 - st(0.84, 0.92)));
    }
    // b6: the three rows chalked down the slate, each word written left to right — the
    // chalk travels along the row once, then down to the next (AR5)
    let chalkW = 0;
    let rows = n > GAIN_N ? 3 : 0;
    if (A_GAIN[n]) {
      // ONE stroke down the slate (AR5): the chalk travels down through the three rows
      // once, and each row's word is written as it passes
      chalkW = st(0.06, 0.13) * (1 - st(0.84, 0.92));
      const down = stageLin(b, L, 0.14, 0.8);
      const cx = FACE.left + FACE.w * 0.62 - 4 * Math.sin(Math.PI * 3 * down);
      const cy = FACE.top + ROW_H * (0.5 + 2 * down);
      rows = 3 * stageLin(b, L, 0.12, 0.82);
      stt = hand(stt, xT, dT, 1, cx, cy, chalkW);
    }
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t, 1));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the neighbour, behind his fence ─────────────────────────────────────
    const wc = legsOf(carrySource(cv, 4, n, CP_HOME), CP_LEGS[n], b, L);
    const xC = carry(cv, 4, n, wc.x, wc.x, 1);
    const dC = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, -1), CP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CP_P, n, t, b, 2);
    // the egg box: at his side on b0, lifted over the fence and held out to her on b1,
    // then held close until he hands it over on b5
    const boxSide = n === 0 ? 1 : 0;
    sc = holdAt(sc, 1, 5, 4, boxSide);
    if (A_EGGS[n]) {
      const outW = st(0.14, 0.34) * (1 - st(0.86, 0.97));
      sc = holdAt(sc, 1, 5, 4, 1 - st(0.14, 0.2));
      sc = hand(sc, xC, dC, 1, PASS.x, PASS.y - 2, outW);
      sc = holdAt(sc, 1, 11, -12, st(0.86, 0.97));
    }
    const boxClose = n > EGGS_N && n < SWAP_N ? 1 : A_SWAP[n] ? 1 - sAt(4.95, 5.3) : 0;
    sc = holdAt(sc, 1, 11, -12, boxClose);
    if (A_SWAP[n]) sc = hand(sc, xC, dC, 1, PASS.x, PASS.y - 1, sAt(4.95, 5.3) * (1 - sAt(5.5, 5.85)));
    // b5 on: the basket taken over the fence in his left hand, and held close
    if (A_SWAP[n]) sc = hand(sc, xC, dC, -1, PASS.x, PASS.y - 2, sAt(4.2, 4.5) * (1 - sAt(4.6, 4.9)));
    const basketC = A_SWAP[n] ? sAt(4.6, 4.9) : n > SWAP_N ? 1 : 0;
    sc = holdAt(sc, -1, 10, -18, basketC);
    // b7: a tomato taken out of the basket and held up to the light, and put back
    if (A_SANDWICH[n]) {
      const up = st(0.26, 0.4) * (1 - st(0.74, 0.86));
      const bx = xC + 10 * K * dC;
      const by = PEL - 18 * K;
      sc = hand(sc, xC, dC, 1, lerp(bx + IN_BASKET[0].x, xC + 19 * dC, up), lerp(by + IN_BASKET[0].y - 1, 431, up),
        st(0.08, 0.2) * (1 - st(0.88, 0.97)));
    }
    // b9: the hen taken over the fence in his right hand, carried close as he turns and
    // steps to his ramp, and set down on it
    if (A_HEN[n]) {
      sc = hand(sc, xC, dC, 1, PASS.x, PASS.y + 2, sAt(2.0, 2.45) * (1 - sAt(2.55, 2.9)));
      sc = holdAt(sc, 1, 10, -16, sAt(2.55, 2.9) * (1 - sAt(3.6, 3.9)));
      sc = hand(sc, xC, dC, 1, HEN_RAMP.x + BREAST.x, HEN_RAMP.y + BREAST.y, sAt(3.6, 3.95) * (1 - sAt(4.25, 4.6)));
    }
    const prevC = carryFrom(heldC, n, hHold(CP_P[p], t, 2));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the three people, posed ─────────────────────────────────────────────
    const bn = pose(figB, xB, GROUND, K, dB, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const cp = pose(figC, xC, GROUND, K, dC, 1);
    const bR = wristOf(bn, 'wrR');
    const bL = wristOf(bn, 'wrL');
    const cR = wristOf(cp, 'wrR');
    const cL = wristOf(cp, 'wrL');
    const tR = wristOf(th, 'wrR');

    // ── the hen ─────────────────────────────────────────────────────────────
    // henS  0 on the bed · 1 on the grass · 2 by the fence · 3 her hand · 4 his hand · 5 the ramp
    const henNow = A_PECK[n] ? st(0.74, 0.9)
      : A_SWAP[n] ? 1 + sAt(3.0, 4.4)
        : A_HEN[n] ? 2 + sAt(0.8, 0.95) + sAt(2.4, 2.55) + sAt(4.1, 4.3)
          : n > HEN_N ? 5 : n > SWAP_N ? 2 : n > 0 ? 1 : 0;
    const hS = carry(cv, 6, n, henNow, henNow, tr);
    let hx: number;
    let hy: number;
    if (hS <= 1) {
      hx = lerp(HEN_BED.x, HEN_GRASS.x, hS);
      hy = lerp(HEN_BED.y, HEN_GRASS.y, hS) - 9 * Math.sin(Math.PI * hS);
    } else if (hS <= 2) {
      hx = lerp(HEN_GRASS.x, HEN_FENCE.x, hS - 1);
      hy = GROUND;
    } else {
      const carriedB = { x: bL.x - BREAST.x * dB, y: bL.y - BREAST.y };
      const carriedC = { x: cR.x - BREAST.x * dC, y: cR.y - BREAST.y };
      if (hS <= 3) {
        hx = lerp(HEN_FENCE.x, carriedB.x, hS - 2);
        hy = lerp(HEN_FENCE.y, carriedB.y, hS - 2);
      } else if (hS <= 4) {
        hx = lerp(carriedB.x, carriedC.x, hS - 3);
        hy = lerp(carriedB.y, carriedC.y, hS - 3);
      } else {
        hx = lerp(carriedC.x, HEN_RAMP.x, hS - 4);
        hy = lerp(carriedC.y, HEN_RAMP.y, hS - 4);
      }
    }
    // which way she faces: right, pecking; left once shooed; right again to follow
    // her to the fence; the way whoever carries her faces; right, up the ramp
    const henFaceNow = A_PECK[n] ? -1
      : n < SWAP_N ? -1
        : A_SWAP[n] ? -1 + 2 * sAt(2.95, 3.2)
          : A_HEN[n] ? (hS < 2 ? 1 : hS < 3 ? lerp(1, dB, hS - 2) : hS < 4 ? lerp(dB, dC, hS - 3) : lerp(dC, 1, clamp01(hS - 4)))
            : 1;
    const henFace = carry(cv, 7, n, henFaceNow, henFaceNow, tr);
    // her peck: twice into the tomato on b0; now and then at the grass; a step's rock
    // as she trots
    const still = hS > 2.05 ? 0 : clamp01(1 - Math.abs(hS - Math.round(hS)) * 25);
    const peckNow = A_PECK[n] ? bp(0.1, 0.16, 0.24) + bp(0.28, 0.34, 0.42) : 0;
    const peck = carry(cv, 8, n, peckNow, peckNow, tr);
    const trot = hS > 1.02 && hS < 1.98 ? Math.sin((hS - 1) * Math.PI * 14) * 7 : 0;
    const henRot = 55 * Math.max(peck, still * idlePeck(t, 0.3)) + trot;

    // ── the basket, the eggs, the tomatoes ──────────────────────────────────
    // basketS 0 on the bed · 1 her left hand · 2 his left hand
    const basketNow = A_SWAP[n] ? sAt(0.9, 1.0) + sAt(4.5, 4.65) : n > SWAP_N ? 2 : 0;
    const bkS = carry(cv, 9, n, basketNow, basketNow, tr);
    const basket = bkS <= 1
      ? { x: lerp(BASKET_HOME.x, bL.x, bkS), y: lerp(BASKET_HOME.y, bL.y, bkS) }
      : { x: lerp(bL.x, cL.x, bkS - 1), y: lerp(bL.y, cL.y, bkS - 1) };
    // boxS 0 his right hand · 1 hers
    const boxNow = A_SWAP[n] ? sAt(5.3, 5.45) : n > SWAP_N ? 1 : 0;
    const bxS = carry(cv, 10, n, boxNow, boxNow, tr);
    const box = { x: lerp(cR.x, bR.x, bxS), y: lerp(cR.y, bR.y, bxS) - 0.5 };
    // tomS 0 on the plant · 1 her right hand · 2 in the basket
    const tomNow = (j: number) => {
      'worklet';
      const a0 = 1.3 + j * 0.85;
      return A_SWAP[n] ? sAt(a0 + 0.25, a0 + 0.35) + sAt(a0 + 0.7, a0 + 0.8) : n > SWAP_N ? 2 : 0;
    };
    const tS = [carry(cv, 11, n, tomNow(0), tomNow(0), tr), carry(cv, 12, n, tomNow(1), tomNow(1), tr)];
    const toms = [0, 1].map((j) => {
      const s = tS[j];
      const inB = { x: basket.x + IN_BASKET[j].x, y: basket.y + IN_BASKET[j].y };
      const hnd = { x: bR.x, y: bR.y - 2.4 };
      return s <= 1
        ? { x: lerp(PICK[j].x, hnd.x, s), y: lerp(PICK[j].y, hnd.y, s) }
        : { x: lerp(hnd.x, inB.x, s - 1), y: lerp(hnd.y, inB.y, s - 1) };
    });
    // b7: the first tomato up in his right hand and back into the basket
    const upNow = A_SANDWICH[n] ? st(0.18, 0.24) * (1 - st(0.88, 0.93)) : 0;
    const up = carry(cv, 13, n, upNow, upNow, tr);
    const tom0 = { x: lerp(toms[0].x, cR.x, up), y: lerp(toms[0].y, cR.y - 2.4, up) };

    // ── the slate, the questions ────────────────────────────────────────────
    const rowsNow = carry(cv, 14, n, rows, rows, tr);
    const chalk = { x: tR.x, y: tR.y - 1, o: chalkW };

    return {
      bn, th, cp, t,
      hen: { x: hx, y: hy, r: henRot, sx: henFace },
      white: idlePeck(t, 0.75),
      basket, bkS, box, bxS,
      tom0, tom1: toms[1],
      rows: rowsNow, chalk,
      q1: carry(cv, 15, n, FOCUS[p], FOCUS[n], tr),
      q2: carry(cv, 16, n, GAINS[p], GAINS[n], tr),
      // how far through its answer each of the three is, 0 → 1 over the second after a tap
      a1: [0, 1, 2].map((k) => (pick1.value === k ? clamp01(since1.value / 1.1) : 0)),
      a2: [0, 1, 2].map((k) => (pick2.value === k ? clamp01(since2.value / 1.1) : 0)),
      ring: pick2.value >= 0 ? clamp01((since2.value - 0.15) / 0.5) : 0,
    };
  });

  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <LessonPicture name="econ4-tree" />
      <LessonPicture name="econ4-hedge" />
      {/* his garden, behind the fence */}
      <Shaker S={SCENE} k={1} ox={COOP.left + COOP.w / 2} oy={GROUND}>
        <ObjectArt parts={RAMP_ART} tone={TONE} />
        <ObjectArt parts={COOP_ART} tone={TONE} />
        <ObjectArt parts={PEEK_ART} tone={TONE} />
        <WhiteHen S={SCENE} />
      </Shaker>
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <Basket S={SCENE} layer="back" />
      <EggBox S={SCENE} layer="back" />
      <Shaker S={SCENE} k={2} ox={FENCE_MID} oy={GROUND}>
        <ObjectArt parts={FENCE_ART} tone={TONE} />
      </Shaker>
      <ObjectArt parts={POST_ART} tone={TONE} />
      <ObjectArt parts={SLATE_ART} tone={TONE} />
      <Slate S={SCENE} />
      {/* her garden, in front */}
      <ObjectArt parts={BED_ART} tone={TONE} />
      <Bouncer S={SCENE} ox={PLANT_A} oy={TOP}>
        <LessonPicture name="econ4-plant-a" />
      </Bouncer>
      <Bouncer S={SCENE} ox={PLANT_B} oy={TOP} lag={0.08}>
        <LessonPicture name="econ4-plant-b" />
      </Bouncer>
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      <Chalk S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      <Basket S={SCENE} layer="front" />
      <Tomatoes S={SCENE} />
      <EggBox S={SCENE} layer="front" />
      <Hen S={SCENE} />
      {on(FOCUS) ? <FocusTargets picked={picked} onPick={onPick} live={FOCUS[i] === 1} S={SCENE} /> : null}
      {on(GAINS) ? <GainTargets picked={picked} onPick={onPick} live={GAINS[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the moving things ────────────────────────────────────────────────────────

type At = { x: number; y: number; r?: number; sx?: number; o?: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof eggBox> }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o ?? 1,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { rotate: `${at.value.r ?? 0}deg` }, { scaleX: at.value.sx ?? 1 },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

/**
 * A hen at her feet, facing `sx`, her body tipped forward `r` degrees about her hip.
 * Her legs and her body are two drawn pictures (econ4.mjs), so the body tips to peck
 * while her feet stay where they are.
 */
function HenRider({ at, body }: { at: SharedValue<At>; body: string }) {
  const outer = useAnimatedStyle(() => ({
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { scaleX: at.value.sx ?? 1 }],
  }));
  const tip = useAnimatedStyle(() => ({ transform: [{ translateY: -HIP_UP }, { rotate: `${at.value.r ?? 0}deg` }] }));
  return (
    <Animated.View style={[styles.rider, outer]} pointerEvents="none">
      <LessonPicture name="econ4-hen-legs" />
      <Animated.View style={[styles.rider, tip]}>
        <LessonPicture name={body} />
      </Animated.View>
    </Animated.View>
  );
}

/** Her hen, wherever she is: on the bed, on the grass, in a hand, on his ramp. */
function Hen({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => S.value.hen);
  return <HenRider at={at} body="econ4-hen-russet" />;
}

/** His white hen on the nest-box lid, pecking at nothing now and then. */
function WhiteHen({ S }: { S: SharedValue<any> }) {
  const at = useDerivedValue<At>(() => ({ x: WHITE_HEN.x, y: WHITE_HEN.y, r: 40 * S.value.white, sx: -1 }));
  return <HenRider at={at} body="econ4-hen-white" />;
}

/** One drawn tomato, laid with its middle at (x, y) of whatever holds it. */
function TomatoAt({ x, y }: { x: number; y: number }) {
  return (
    <View style={[styles.rider, { transform: [{ translateX: x }, { translateY: y }] }]} pointerEvents="none">
      <LessonPicture name="econ4-tomato" />
    </View>
  );
}

/** A tomato a hand moves: the drawn tomato, riding its point. */
function TomatoRider({ at }: { at: SharedValue<At> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: at.value.x }, { translateY: at.value.y }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="econ4-tomato" />
    </Animated.View>
  );
}

// ── the answers, answered back on the stage ──────────────────────────────────

/** Up over [a, m] and back down over [m, z] of a running value, eased both ways. */
function hump(v: number, a: number, m: number, z: number): number {
  'worklet';
  const r = (q: number, w: number) => {
    const u = clamp01((v - q) / (w - q));
    return u * u * (3 - 2 * u);
  };
  return r(a, m) * (1 - r(m, z));
}

/**
 * A wrong pick in Q1 RATTLES what it names: the hen house (k 1) shudders on its legs, the
 * fence (k 2) wobbles, both dying away in under a second, and both pivoting on the ground
 * line so nothing lifts off it.
 */
function Shaker({ S, k, ox, oy, children }: { S: SharedValue<any>; k: number; ox: number; oy: number; children: ReactNode }) {
  const st = useAnimatedStyle(() => {
    const g = S.value.a1[k];
    const live = g > 0 && g < 1 ? 1 : 0;
    const shake = live * Math.sin(g * 30) * (1 - g) * (1 - g);
    return {
      transform: [
        { translateX: ox + 2.6 * shake }, { translateY: oy }, { rotate: `${1.6 * shake}deg` },
        { translateX: -ox }, { translateY: -oy },
      ],
    };
  });
  return <Animated.View style={[styles.layer, st]} pointerEvents="none">{children}</Animated.View>;
}

/**
 * The right pick in Q1: her tomato plants spring up off the soil — a squash, a stretch
 * past their height, and a settle (k 0), pivoting on the bed's soil line.
 */
function Bouncer({ S, ox, oy, lag = 0, children }: { S: SharedValue<any>; ox: number; oy: number; lag?: number; children: ReactNode }) {
  const st = useAnimatedStyle(() => {
    const g = clamp01(S.value.a1[0] - lag);
    const squash = hump(g, 0, 0.1, 0.22);
    const stretch = hump(g, 0.12, 0.3, 0.55);
    const settle = hump(g, 0.45, 0.6, 0.8);
    const sy = 1 - 0.07 * squash + 0.09 * stretch - 0.025 * settle;
    const sx = 1 + 0.05 * squash - 0.04 * stretch + 0.015 * settle;
    return {
      transform: [{ translateX: ox }, { translateY: oy }, { scaleX: sx }, { scaleY: sy }, { translateX: -ox }, { translateY: -oy }],
    };
  });
  return <Animated.View style={[styles.layer, st]} pointerEvents="none">{children}</Animated.View>;
}

/**
 * The basket, with the two tomatoes already in it, hung from the top of its handle.
 * It is drawn twice: in front of the fence while it is hers, behind it once it is his,
 * so his pickets stand in front of what he holds.
 */
function Basket({ S, layer }: { S: SharedValue<any>; layer: 'front' | 'back' }) {
  const st = useAnimatedStyle(() => {
    const mine = S.value.bkS < 1.5;
    return {
      opacity: (layer === 'front') === mine ? 1 : 0,
      transform: [{ translateX: S.value.basket.x }, { translateY: S.value.basket.y }],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={TRUG_B} tone={TONE} />
      {IN_TRUG.map((a, k) => <TomatoAt key={k} x={a.x} y={a.y} />)}
      <ObjectArt parts={TRUG_F} tone={TONE} />
    </Animated.View>
  );
}

/** The two tomatoes she picks. */
function Tomatoes({ S }: { S: SharedValue<any> }) {
  const a = useDerivedValue<At>(() => S.value.tom0);
  const c = useDerivedValue<At>(() => S.value.tom1);
  return (
    <>
      <TomatoRider at={a} />
      <TomatoRider at={c} />
    </>
  );
}

/** The box of eggs: behind his fence while it is his, in front once it is hers. */
function EggBox({ S, layer }: { S: SharedValue<any>; layer: 'front' | 'back' }) {
  const at = useDerivedValue<At>(() => {
    const mine = S.value.bxS >= 0.5;
    return { x: S.value.box.x, y: S.value.box.y, o: (layer === 'front') === mine ? 1 : 0 };
  });
  return <Rider at={at} art={BOX_ART} />;
}

/** A stick of chalk in the economist's hand while he writes. */
function Chalk({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.chalk.o,
    transform: [{ translateX: S.value.chalk.x }, { translateY: S.value.chalk.y }, { rotate: '-35deg' }],
  }));
  return <Animated.View style={[styles.chalkStick, st]} pointerEvents="none" />;
}

/**
 * The slate's three rows, chalked on b6: each word revealed as the chalk runs along it.
 * Answered (Q2), the right row JUMPS and is ringed in chalk; a wrong row SHUDDERS in a
 * puff of chalk dust and settles back.
 */
function Row({ S, r }: { S: SharedValue<any>; r: number }) {
  const st = useAnimatedStyle(() => ({ width: FACE.w * clamp01(S.value.rows - r) }));
  const word = useAnimatedStyle(() => {
    const g = S.value.a2[r];
    const right = r === RIGHT_ROW;
    const shake = !right && g > 0 && g < 1 ? 1.8 * Math.sin(g * 34) * (1 - g) : 0;
    const pop = right ? 0.16 * hump(g, 0, 0.16, 0.45) : 0;
    const lift = right ? -1.6 * hump(g, 0, 0.16, 0.45) : 0;
    return { transform: [{ translateX: shake }, { translateY: lift }, { scale: 1 + pop }] };
  });
  return (
    <Animated.View style={[styles.rowClip, { top: FACE.top + r * ROW_H }, st]}>
      <Animated.View style={[styles.rowInner, word]}>
        <Text style={styles.chalkWord}>{ROWS[r]}</Text>
      </Animated.View>
    </Animated.View>
  );
}
/** A wrong row's puff of chalk dust, lifting off the word as it shudders. */
function Dust({ S, r }: { S: SharedValue<any>; r: number }) {
  const st = useAnimatedStyle(() => {
    const u = S.value.a2[r];
    return {
      opacity: u > 0.01 && u < 0.99 ? 0.7 * (1 - u) : 0,
      transform: [{ translateY: -7 * u }, { scale: 0.5 + 1.2 * u }],
    };
  });
  return <Animated.View style={[styles.dust, { top: FACE.top + r * ROW_H + ROW_H / 2 - 5 }, st]} />;
}
function Slate({ S }: { S: SharedValue<any> }) {
  // the chalk ring drawn round BOTH once it is picked, and kept
  const ring = useAnimatedStyle(() => {
    const u = S.value.ring * (S.value.a2[RIGHT_ROW] > 0 ? 1 : 0);
    return { opacity: u > 0.02 ? 1 : 0, transform: [{ scaleX: 0.6 + 0.4 * u }, { scaleY: 0.6 + 0.4 * u }, { rotate: `${-8 + 4 * u}deg` }] };
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Row S={S} r={0} />
      <Row S={S} r={1} />
      <Row S={S} r={2} />
      <Dust S={S} r={0} />
      <Dust S={S} r={1} />
      <Animated.View style={[styles.chalkRing, { top: FACE.top + RIGHT_ROW * ROW_H + 0.5 }, ring]} />
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both are tapped ON THE STAGE (AP6). No two live targets touch (AN4).
 * Q1: what should she use her garden for? Her tomato plants: she grows them well.
 */
type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
const FOCUS_Q: Q[] = [
  { id: 'tomatoes', left: 10, top: 400, w: 92, h: 80, r: 6, correct: true },
  { id: 'henhouse', left: 230, top: 398, w: 80, h: 62, r: 4, correct: false },
  { id: 'fence', left: 156, top: 452, w: 50, h: 32, r: 3, correct: false },
];
/**
 * What each Q1 target is called, on a struck plate inside it (AN1, S11), so the three
 * choices can be told apart at a glance: a white face on a hard ledge in the stage's own
 * shade, lit along its top. Its `top` is inside the target; each word is set in a box as
 * wide as the plate, so no letter is clipped on a phone (AQ2).
 */
const FOCUS_LABEL: Record<string, { word: string; w: number; top: number }> = {
  tomatoes: { word: 'TOMATOES', w: 66, top: 30 },
  henhouse: { word: 'HENS', w: 38, top: 23 },
  fence: { word: 'FENCE', w: 42, top: 9 },
};
const RIGHT_ROW = 2;
/** Q2: who gains from the swap? Both of them. */
const GAIN_Q: Q[] = ROWS.map((w, r) => ({
  id: w.toLowerCase(), left: FACE.left, top: FACE.top + r * ROW_H + 0.5, w: FACE.w, h: ROW_H - 1, r: 1.5, correct: w === 'BOTH',
}));
function FocusTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={FOCUS_Q} k="q1" labels />;
}
function GainTargets(p: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  return <StageTargets {...p} qs={GAIN_Q} k="q2" />;
}
function StageTargets({ picked, onPick, live, S, qs, k, labels }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2'; labels?: boolean;
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
          <View style={styles.clear}>
            {labels ? (
              <View style={[styles.plate, { width: FOCUS_LABEL[q.id].w, left: (q.w - FOCUS_LABEL[q.id].w) / 2, top: FOCUS_LABEL[q.id].top }]}>
                <Text style={[styles.plateWord, { width: FOCUS_LABEL[q.id].w - 2 }]}>{FOCUS_LABEL[q.id].word}</Text>
              </View>
            ) : null}
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  chalkStick: {
    position: 'absolute', left: -2.2, top: -0.8, width: 4.4, height: 1.6, borderRadius: 0.8,
    backgroundColor: NATURAL.picket.base,
  },
  rowClip: { position: 'absolute', left: FACE.left, height: ROW_H, overflow: 'hidden' },
  rowInner: {
    position: 'absolute', left: 0, top: 0, width: FACE.w, height: ROW_H, alignItems: 'flex-start', justifyContent: 'center',
  },
  // A content box the width of the row, the word set 3 in from its left: Caveat's last
  // letter draws past its advance, and the slack to its right holds that ink (AQ2).
  chalkWord: {
    width: FACE.w - 3, marginLeft: 3, textAlign: 'left',
    fontFamily: 'Caveat_700Bold', fontSize: 11, lineHeight: 12, letterSpacing: 0, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkRing: {
    position: 'absolute', left: FACE.left + 0.5, width: FACE.w - 1, height: ROW_H - 1,
    borderRadius: (ROW_H - 1) / 2, borderWidth: 1.1, borderColor: PAPER_LIT,
  },
  dust: {
    position: 'absolute', left: FACE.left + 4, width: 14, height: 10, borderRadius: 5, backgroundColor: 'rgba(244, 242, 236, 0.75)',
  },
  plate: {
    position: 'absolute', height: 14, borderRadius: 5, backgroundColor: PLATE_FACE,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE), alignItems: 'center', justifyContent: 'center',
  },
  plateWord: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  clear: { flexGrow: 1 },
});

export function Econ4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Econ4Scene} band={[306, 514]} camera={CAM} />;
}
