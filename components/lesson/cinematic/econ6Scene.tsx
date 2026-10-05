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
import { BEATS } from './econ6Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { lipOf } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf } from './pace';
import {
  NATURAL, ec6Chest, ec6Lid, ec6LidIn, ec6Heap, ec6Coin, ec6Coconut, ec6Nuts, ec6Stall, ec6Trunk, ec6Frond,
  ec6Bunch, ec6Wreck, ec6Jetty, ec6Crate, ec6CrateLid, ec6Fish, ec6Cannon, ec6Ship, ec6Basket,
} from './objects';
import { BY_ID } from './wardrobe';

// ─────────────────────────────────────────────────────────────────────────────
// economics-foundations-6, "Too Much Treasure" — A PIRATE ISLAND BEACH AT GOLDEN HOUR.
//
// A DIALOGUE lesson (LESSON_RULES group AP), built the way economics-foundations-1 is:
// three people talk and nobody narrates. The captain (the plain one) shoves a treasure
// chest up the sand and flings it open; the island's only coconut seller (the bun) keeps a
// stall with twelve coconuts and a chalk slate; an economist (the top hat), marooned here,
// stands by the palm and explains why a pile of gold made nobody richer.
//
//   b0   the captain shoves the chest in from the left, straightens, flings the lid open:
//        gold, and five doubloons tumble out onto the sand.
//   b1   she walks to her slate, kneels, rubs out 1 COIN and chalks 2 COINS.
//   b2   the economist points at the coconuts, at the spilled gold, at the coconuts; she
//        walks back to her end of the stall.
//   b3   Q1, CHALK THE PRICE: 1 COIN, 2 COINS and 4 COINS chalked across the slate.
//        Right (4 COINS): the word jumps and a chalk line is struck under it; she nods.
//        Wrong: the word shudders in a puff of chalk dust and she shrugs.
//   b4   the other two prices blow away in chalk dust and 4 COINS is underlined; he walks
//        to the spilled gold, kneels, picks up a doubloon, holds it up and turns it over.
//   b5   the captain steps up and plants a boot on his chest, a hand on his knee.
//   b6   the economist walks to the stall, takes a coconut off the heap and sets his
//        doubloon on the counter for it.
//   b7   she lifts her empty basket off the counter and holds it up, hopeful.
//   b8   Q2, LOAD THE SHIP: a ship sails in on the horizon toward the jetty, where three
//        crates wait: MORE GOLD, COCONUTS AND FISH, A BIGGER CANNON. Right (fish): the lid
//        lifts off, a snapper leaps out and two coconuts poke up. Wrong: the gold crate's
//        lid hops, coins jump and the crate sinks into the planks; the cannon crate's lid
//        flies, the barrel rises and fires a puff of smoke, and the crate kicks back.
//   b9   the captain takes his boot down, slams the lid and drags the chest back down the
//        beach by its handle.
//   b10  at ease under the quotation; the sun goes down into the sea.
//
// COMPOSITION, in stage units. THE FAR LAYER: a golden-hour sky (250–352) in three
// bands with long lit clouds, the sun at (116, 328 → 346) sinking behind the palm's left
// fronds; the horizon at y 352; the sea down to the shoreline at 446, silvered at the
// horizon, with the sun's glitter under it and foam lapping on the sand. A WRECK on its
// rocks in the shallows at the left (−4…116 × 337…407): a tipped hull, bare ribs at the
// bow, a snapped mast and a rag of sail. A JETTY on posts runs out to the right (deck top
// 412, x 228…400), three crates on it (228–282, 286–340, 344–398, tops 372). THE MIDDLE:
// a coconut PALM, its foot at (136, 502) and its crown at (178, 296), seven fronds that
// sway. THE FLOOR: sand from 446, wet at the waterline; the cast on GROUND 500. On it the
// CHEST (front 58…102, its lid's hinge at 478), the five doubloons in the sand (110…163),
// the STALL 214…368 (top board 464, the slate 219–355 × 473–495 in three slots), eleven
// coconuts heaped on its left end and the twelfth on top, the basket on its right end.
// The captain at −20 → 40 → 44 → 16; the economist at 188 → 160 → 216; the seller at
// 380 → 318 → 380. Band [250, 524].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, the listeners keep their hands still (AP18) and their heads alive (N21).
// About 600 Views; nothing big moves under a camera (AT7).
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('economics');
const TR = 0.85;
/** 78 units of figure in a 274-unit band: 28%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, economics-foundations-6). A question or the quotation
 * paces over the fallback.
 */
const LINES = [6.13, 5.2, 5.27, 0, 5.7, 4.77, 6.29, 5.11, 0, 4.26, 0, 0];

// The held poses (moves.ts act + 99): talking with the hands, nodding along, kneeling;
// and the shrug, played once (299 + act).
const TALK = 167;
const NOD = 263;
const KNEEL = 280;
const SHRUG = 378;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_CHEST = is('chest');
const A_SLATE = is('slate');
const A_CHASE = is('chasing');
const A_INFL = is('inflation');
const A_HERO = is('hero');
const A_WORTH = is('worth');
const A_OLD = is('old');
const A_BURY = is('bury');
const Q1 = BEATS.map((b) => (b.predict ? 1 : 0));
const Q2 = BEATS.map((b) => (b.cargo ? 1 : 0));
const SLATE_N = A_SLATE.indexOf(1);
const INFL_N = A_INFL.indexOf(1);
const HERO_N = A_HERO.indexOf(1);
const WORTH_N = A_WORTH.indexOf(1);
const OLD_N = A_OLD.indexOf(1);
const BURY_N = A_BURY.indexOf(1);
const Q1_N = Q1.indexOf(1);
const Q2_N = Q2.indexOf(1);
const NB = BEATS.length;
const each = (f: (n: number) => Track): Track[] => BEATS.map((_, n) => f(n));

// ── where each of them walks, and which way each faces, beat by beat ─────────
// A leg is [fraction of the line it starts at, x]; it runs at the walk's own speed
// (rig.moveTr) from wherever the last one ended, and an empty list stands still where
// he is. A turn is [fraction, facing]; it eases through a profile over 0.36s.
type Track = readonly (readonly number[])[];
/** The captain shoves the chest in on b0 and drags it out on b9: both are worked by hand below. */
const CP_START = -20;
const CP_HOME = 40;
const CP_HERO = 44;
const CP_END = 16;
/** The chest's middle sits this far in front of him while he shoves it… */
const PUSH_GAP = 40;
/** …and this far behind him, his hand on its handle, while he drags it away. */
const DRAG_GAP = 36;
const CHEST_HOME = CP_HOME + PUSH_GAP;
/** b9: he turns to drag the chest away, and turns back to the others once it has stopped. */
const CP_TURN: Track[] = each((n) => (n === BURY_N ? [[0, 1], [0.34, -1], [0.9, 1]] : [[0, 1]]));
const CP_P = [TALK, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, TALK, NOD, NOD];

const BN_HOME = 380;
const BN_KNEEL = 318;
// Every beat names where each of them stands, so a reader who taps through a walk finds
// the walk finished on the next beat rather than the figure stranded where the tap caught it.
const BN_LEGS: Track[] = each((n) => (n === SLATE_N ? [[0.06, BN_KNEEL]] : [[0, BN_HOME]]));
const BN_TURN: Track[] = each((n) => (n === SLATE_N + 1 ? [[0, 1], [0.24, -1]] : [[0, -1]]));
const BN_P = [NOD, TALK, NOD, NOD, NOD, NOD, NOD, TALK, NOD, NOD, NOD, NOD];

const TH_HOME = 188;
const TH_COIN = 178;
const TH_STALL = 214;
const TH_LEGS: Track[] = each((n) => (n < INFL_N ? [[0, TH_HOME]] : n === INFL_N ? [[0.04, TH_COIN]] : n < WORTH_N ? [[0, TH_COIN]] : [[0, TH_STALL]]));
const TH_TURN: Track[] = each((n) => (
  n === 0 ? [[0, -1]]
    : n === SLATE_N ? [[0, -1], [0.05, 1]]
      : A_CHASE[n] ? [[0, 1], [0.37, -1], [0.66, 1]]
        : n === Q1_N ? [[0, 1]]
          : n === INFL_N || n === HERO_N ? [[0, -1]]
            : n === WORTH_N ? [[0, 1], [0.9, -1]]
              : n === OLD_N || n === Q2_N ? [[0, 1]]
                : [[0, -1]]
));
const TH_P = [NOD, NOD, TALK, NOD, TALK, NOD, TALK, NOD, NOD, NOD, NOD, NOD];

// ── the chest ────────────────────────────────────────────────────────────────
/** The chest's front is 44 wide, its body 22 tall (478–500); the lid hinges at 478. */
const HINGE = 478;
const CHEST_ART = ec6Chest(4, 489, 52, 22);
/** The dome's box is 23 tall with the hinge 12 down it; the half below hides behind the box. */
const LID_ART = ec6Lid(26, 11.5, 52, 23);
const LID_IN_ART = ec6LidIn(26, 9.5, 52, 19);
const HEAP_ART = ec6Heap(0, HINGE + 1, 44, 20);
/** Where the doubloons land in the sand, and where they fly from. */
const SPILL = [[110, 507], [119, 512], [128, 505], [143, 511], [160, 508]];
const MOUTH = { dx: 12, y: 468 };
/** The doubloon he buys a coconut with, which is the last to land, and where it ends up. */
const BUY = 4;
const COUNTER_COIN = { x: 240, y: 462.4 };
const COIN_ART = ec6Coin(0, 0, 6, 6);

// ── the stall ────────────────────────────────────────────────────────────────
const STALL_ART = ec6Stall(292, 482, 156, 36);
const TOP = 464;
/** The slate, in three slots across the stall's front. */
const SLATE = { left: 219.5, top: 473.1, w: 135, h: 21.4 };
const SLOT_W = SLATE.w / 3;
const SLOT_X = [0, 1, 2].map((k) => SLATE.left + SLOT_W * (k + 0.5));
const PRICE_WORDS = ['1 COIN', '2 COINS', '4 COINS'];
const PRICE_IDS = ['one-coin', 'two-coins', 'four-coins'];
const RIGHT_PRICE = 2;
const NUTS_ART = ec6Nuts(247, TOP - 15.5, 62, 31);
/** The twelfth coconut, on top of the heap, and its art drawn about its middle. */
const NUT_HOME = { x: 235, y: TOP - 31 + 6.5 };
const NUT_ART = ec6Coconut(0, 0, 12, 13);
/** The basket, drawn about its grip (the top of the hoop); it sits on the counter's right end. */
const BASKET_ART = ec6Basket(0, 7.6, 18, 18);
const BASKET_HOME = { x: 350, y: TOP - 16.6 };

// ── the palm ─────────────────────────────────────────────────────────────────
const TRUNK_ART = ec6Trunk(156, 397, 60, 214);
const CROWN = { x: 178, y: 296 };
const FROND_ART = ec6Frond(35, 7, 74, 38);
/** Each frond: its angle (degrees, clockwise), mirrored or not, its size, its sway phase. */
const FRONDS: readonly (readonly [number, number, number, number])[] = [
  [-34, 0, 0.88, 0.3], [-2, 0, 1.05, 1.4], [32, 0, 0.95, 2.6],
  [-30, 1, 0.86, 4.1], [2, 1, 1.05, 0.9], [36, 1, 0.9, 2.2],
];
const BUNCH_ART = ec6Bunch(180, 306, 20, 12);

// ── the far layer ────────────────────────────────────────────────────────────
const HORIZON = 352;
const SHORE = 446;
const WRECK_ART = ec6Wreck(56, 372, 120, 70);
const JETTY_ART = ec6Jetty(314, 428, 172, 32);
const DECK = 412;
const SUN_X = 116;

// ── the cargo ────────────────────────────────────────────────────────────────
const CRATE_X = [255, 313, 371];
const CRATE_W = 54;
const CRATE_H = 40;
const CRATE_ART = ec6Crate(0, 0, CRATE_W, CRATE_H);
const CRATE_LID_ART = ec6CrateLid(0, 0, CRATE_W + 1, 5);
const CRATE_IDS = ['more-gold', 'coconuts-and-fish', 'bigger-cannon'];
/** Each crate's painted tag, a line at a time. */
const CRATE_LINES = [['MORE', 'GOLD'], ['COCONUTS', 'AND FISH'], ['A BIGGER', 'CANNON']];
const RIGHT_CRATE = 1;
/** Where each doubloon out of the gold crate lands on the deck's edge, from the crate's middle. */
const GOLD_OUT = [-19, -7, 7, 19];
const FISH_ART = ec6Fish(0, 0, 22, 10);
const CANNON_ART = ec6Cannon(0, 0, 26, 26);
/** The tags a word sits on are plates in the stage's own tone (AR1, T7). */
const STONE = TONE.STONE;
const SHIP_ART = ec6Ship(0, 0, 40, 34);
/** The front face of a crate is the left 49 of its 54: the tag is centred on that. */
const FRONT_DX = -2.4;

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
 * left him, so a tap mid-walk cannot put him anywhere in one frame (group L). `slow`
 * stretches a walk that is hard work (a chest shoved or dragged).
 */
function legsOf(src: number, legs: Track, b: number, L: number, slow: number) {
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
    const dur = d > 1 ? moveTr(from, to, TR) * slow : 0;
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

/** A smooth 0 → 1 over [a, z] of a running value. */
function ramp(v: number, a: number, z: number): number {
  'worklet';
  const u = clamp01((v - a) / (z - a));
  return u * u * (3 - 2 * u);
}
/** Up over [a, m] and back down over [m, z] of a running value. */
function hump(v: number, a: number, m: number, z: number): number {
  'worklet';
  return ramp(v, a, m) * (1 - ramp(v, m, z));
}

const CAM = followMoves(BEATS.map(() => 200), BEATS.map(kindOf), seedOf('economics'));

export default function Econ6Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldC = useHeld();
  const heldB = useHeld();
  const heldT = useHeld();
  const cv = useCarry(32);
  const on = useLinger(i);
  // THE GAMES ANSWER BACK: which of the three was tapped on each graded beat, and how
  // many seconds ago. Each game's choice is kept for the rest of the lesson, so what it
  // left on the stage (an open crate, an underlined price) stays where it was (AH4).
  const pick1 = useSharedValue(-1);
  const pick2 = useSharedValue(-1);
  const since = useSharedValue(0);
  useEffect(() => {
    const ids = Q1[i] ? PRICE_IDS : Q2[i] ? CRATE_IDS : null;
    if (!ids) return;
    const k = picked === null ? -1 : ids.indexOf(picked);
    if (Q1[i]) pick1.value = k;
    else pick2.value = k;
    since.value = 0;
    if (k >= 0) since.value = withTiming(8, { duration: 8000, easing: Easing.linear });
  }, [picked, i, pick1, pick2, since]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    const L = lineOf(LINES, n);
    const rs = since.value;
    const k1 = pick1.value;
    const k2 = pick2.value;
    // in SECONDS into the beat
    const sAt = (a: number, z: number) => {
      'worklet';
      return ramp(b, a, z);
    };
    const bAt = (a: number, m: number, z: number) => {
      'worklet';
      return hump(b, a, m, z);
    };
    const q1 = Q1[n] === 1 && k1 >= 0;

    // ── the captain ─────────────────────────────────────────────────────────
    const srcC = carrySource(cv, 0, n, CP_START);
    const homeC = n < HERO_N ? CP_HOME : n < BURY_N ? CP_HERO : CP_END;
    let wc = legsOf(srcC, [[0, homeC]], b, L, 1);
    let pushing = 0;
    if (A_CHEST[n]) {
      // b0: the chest shoved in from the left, slower than a walk
      wc = legsOf(srcC, [[0, CP_HOME]], b, L, 1.5);
      pushing = 1 - sAt(1.95, 2.35);
    } else if (A_HERO[n]) {
      wc = legsOf(srcC, [[0, CP_HOME], [2.0 / L, CP_HERO]], b, L, 1);
    } else if (A_BURY[n]) {
      // b9: the boot down, the lid slammed, a turn, and the chest dragged off by its handle
      wc = legsOf(srcC, [[0, CP_HERO], [2.05 / L, CP_END]], b, L, 1.6);
    }
    const xC = carry(cv, 0, n, wc.x, wc.x, 1);
    const dC = carry(cv, 1, n, 0, faceOf(carrySource(cv, 1, n, 1), CP_TURN[n], b, L), 1);
    let sc = bodyOf(wc, CP_P[n], t, b);
    // the chest: in front of his hands while he shoves it, behind his hand on b9
    const chestNow = A_CHEST[n] ? (pushing > 0.5 ? xC + PUSH_GAP : CHEST_HOME)
      : A_BURY[n] ? Math.min(CHEST_HOME, xC + DRAG_GAP)
        : n > BURY_N ? CP_END + DRAG_GAP : CHEST_HOME;
    const chestX = carry(cv, 2, n, chestNow, chestNow, A_CHEST[n] || A_BURY[n] ? 1 : tr);
    // the lid: 0 shut · 1 flung open
    const lidNow = A_CHEST[n] ? sAt(2.85, 3.2) + 0.08 * bAt(3.1, 3.25, 3.5)
      : A_BURY[n] ? 1 - sAt(1.05, 1.35)
        : n > 0 && n < BURY_N ? 1 : 0;
    const lid = carry(cv, 3, n, lidNow, lidNow, A_CHEST[n] || A_BURY[n] ? 1 : tr);
    if (A_CHEST[n]) {
      // bent to it, both hands on the chest's end
      sc = { ...sc, tilt: sc.tilt - 0.42 * pushing };
      sc = hand(sc, xC, GROUND, dC, 1, chestX - 22, 485, pushing);
      sc = hand(sc, xC, GROUND, dC, -1, chestX - 22, 489, pushing);
      // then a hand under the lid's front edge, and up with it as it flies open
      const lidHand = sAt(2.4, 2.8) * (1 - sAt(3.45, 3.85));
      sc = hand(sc, xC, GROUND, dC, 1, CHEST_HOME - 14, HINGE - 6 - 18 * sAt(2.85, 3.2), lidHand);
    }
    // the hero: a boot planted on the chest's top, a hand on that knee, chin up
    const bootNow = A_HERO[n] ? sAt(2.35, 2.9) : n > HERO_N && n < BURY_N ? 1 : A_BURY[n] ? 1 - sAt(0.1, 0.5) : 0;
    if (bootNow > 0) {
      const foot = { x: (CHEST_HOME - 18 - xC) / K, y: -(GROUND - HINGE) / K };
      sc = { ...sc, footR: { x: lerp(sc.footR.x, foot.x, bootNow), y: lerp(sc.footR.y, foot.y, bootNow) } };
      sc = { ...sc, tilt: sc.tilt + 0.05 * bootNow, neck: sc.neck + 0.1 * bootNow };
      sc = hand(sc, xC, GROUND, dC, 1, xC + 16, GROUND - 28, bootNow);
      sc = holdAt(sc, -1, 3, -1, bootNow);
    }
    // b9: the lid slammed down from above, then a hand back to the chest's handle
    if (A_BURY[n]) {
      sc = hand(sc, xC, GROUND, dC, 1, CHEST_HOME - 6, HINGE - 16 + 10 * sAt(1.05, 1.35), sAt(0.6, 0.95) * (1 - sAt(1.45, 1.75)));
      sc = hand(sc, xC, GROUND, dC, -1, chestX - 22, 489, sAt(1.75, 2.05));
    }
    if (n > BURY_N) sc = hand(sc, xC, GROUND, dC, -1, chestX - 22, 489, 1 - sAt(0.05, 0.45));
    const prevC = carryFrom(heldC, n, hHold(CP_P[p], t));
    const figC = keepHeld(heldC, wc.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ── the seller ──────────────────────────────────────────────────────────
    const wb = legsOf(carrySource(cv, 4, n, BN_HOME), BN_LEGS[n], b, L, 1);
    const xB = carry(cv, 4, n, wb.x, wb.x, 1);
    const dB = carry(cv, 5, n, 0, faceOf(carrySource(cv, 5, n, -1), BN_TURN[n], b, L), 1);
    let sb = bodyOf(wb, BN_P[n], t, b);
    // b1: down on one knee at her slate, one wipe of the old price right to left, and the
    // new one chalked left to right — one path, turning back once (AR5)
    if (A_SLATE[n]) {
      sb = mixStance(sb, hHold(KNEEL, t), sAt(1.4, 1.8) * (1 - sAt(4.6, 5.05)));
      const wipe = sAt(1.95, 2.15) * (1 - sAt(4.4, 4.6));
      const wx = SLOT_X[1] + 14 - 28 * sAt(2.15, 2.85) + 30 * sAt(3.15, 4.4);
      sb = hand(sb, xB, GROUND, dB, 1, wx, 483, wipe);
    }
    // Q1: a nod for the right price, a shrug for a wrong one
    if (q1) {
      if (k1 === RIGHT_PRICE) sb = { ...sb, neck: sb.neck - 0.16 * hump(rs, 0.2, 0.4, 0.7) };
      else sb = mixStance(sb, hLive(SHRUG, t, Math.max(0, rs - 0.3)), ramp(rs, 0.25, 0.45) * (1 - ramp(rs, 2.1, 2.5)));
    }
    // b7: the empty basket off the counter by its hoop, held up, hopeful; then at her chest
    const basketHeld = A_OLD[n] ? sAt(0.9, 1.0) : n > OLD_N ? 1 : 0;
    if (A_OLD[n]) {
      sb = hand(sb, xB, GROUND, dB, 1, BASKET_HOME.x, BASKET_HOME.y, sAt(0.45, 0.85) * (1 - sAt(1.0, 1.4)));
      sb = holdAt(sb, 1, 13, -32, sAt(1.0, 1.5) * (1 - sAt(3.9, 4.5)));
      sb = { ...sb, neck: sb.neck + 0.08 * sAt(1.2, 1.8) * (1 - sAt(3.9, 4.5)) };
    }
    sb = holdAt(sb, 1, 9, -8, n > OLD_N ? 1 : A_OLD[n] ? sAt(3.9, 4.5) : 0);
    const prevB = carryFrom(heldB, n, hHold(BN_P[p], t));
    const figB = keepHeld(heldB, wb.walking ? mixKeepLegs(prevB, sb, tr) : mixStance(prevB, sb, tr));

    // ── the economist ───────────────────────────────────────────────────────
    const wt = legsOf(carrySource(cv, 6, n, TH_HOME), TH_LEGS[n], b, L, 1);
    const xT = carry(cv, 6, n, wt.x, wt.x, 1);
    const dT = carry(cv, 7, n, 0, faceOf(carrySource(cv, 7, n, -1), TH_TURN[n], b, L), 1);
    let stt = bodyOf(wt, TH_P[n], t, b);
    // b2: a point at the coconuts, at the gold in the sand, and back at the coconuts — a
    // path between three things, with a turn to each
    if (A_CHASE[n]) {
      stt = hand(stt, xT, GROUND, dT, 1, 250, 436, sAt(0.35, 0.7) * (1 - sAt(1.55, 1.85)));
      stt = hand(stt, xT, GROUND, dT, 1, 132, 500, sAt(2.15, 2.45) * (1 - sAt(3.15, 3.45)));
      stt = hand(stt, xT, GROUND, dT, 1, 250, 436, sAt(3.75, 4.05) * (1 - sAt(4.85, 5.15)));
    }
    // b4: down on one knee by the spilled gold, a doubloon picked up, held up and turned
    if (A_INFL[n]) {
      stt = mixStance(stt, hHold(KNEEL, t), sAt(0.9, 1.25) * (1 - sAt(1.95, 2.35)));
      stt = hand(stt, xT, GROUND, dT, 1, SPILL[BUY][0], SPILL[BUY][1] - 1, sAt(1.15, 1.45) * (1 - sAt(1.6, 1.9)));
      stt = holdAt(stt, 1, 13, -40, sAt(2.3, 2.75) * (1 - sAt(4.6, 5.1)));
      stt = holdAt(stt, 1, 9, -10, sAt(4.6, 5.1));
    }
    stt = holdAt(stt, 1, 9, -10, n > INFL_N && n < WORTH_N ? 1 : 0);
    // b6: a coconut off the top of the heap in his left hand, his doubloon set on the
    // counter with his right, and the coconut held close
    if (A_WORTH[n]) {
      stt = holdAt(stt, 1, 9, -10, 1 - sAt(3.85, 4.05));
      stt = hand(stt, xT, GROUND, dT, -1, NUT_HOME.x, NUT_HOME.y + 4, sAt(1.25, 1.65) * (1 - sAt(1.8, 2.1)));
      stt = holdAt(stt, -1, 13, -28, sAt(1.8, 2.3) * (1 - sAt(5.2, 5.7)));
      stt = hand(stt, xT, GROUND, dT, 1, COUNTER_COIN.x, COUNTER_COIN.y - 1, sAt(3.85, 4.25) * (1 - sAt(4.55, 4.95)));
    }
    stt = holdAt(stt, -1, 8, -9, A_WORTH[n] ? sAt(5.2, 5.7) : n > WORTH_N ? 1 : 0);
    const prevT = carryFrom(heldT, n, hHold(TH_P[p], t));
    const figT = keepHeld(heldT, wt.walking ? mixKeepLegs(prevT, stt, tr) : mixStance(prevT, stt, tr));

    // ── the three people, posed ─────────────────────────────────────────────
    const cp = pose(figC, xC, GROUND, K, dC, 1);
    const bn = pose(figB, xB, GROUND, K, dB, 1);
    const th = pose(figT, xT, GROUND, K, dT, 1);
    const bR = wristOf(bn, 'wrR');
    const tR = wristOf(th, 'wrR');
    const tL = wristOf(th, 'wrL');

    // ── the gold ────────────────────────────────────────────────────────────
    // each doubloon: 0 in the chest · 1 flown out and lying in the sand; the one he buys
    // with goes on: 2 in his right hand · 3 on the counter
    const spillOf = (k: number) => {
      'worklet';
      const a0 = 3.15 + 0.17 * k;
      if (A_CHEST[n]) return sAt(a0, a0 + 0.5);
      if (k !== BUY) return 1;
      if (A_INFL[n]) return 1 + sAt(1.45, 1.55);
      if (A_WORTH[n]) return 2 + sAt(4.1, 4.3);
      return n > WORTH_N ? 3 : n > INFL_N ? 2 : 1;
    };
    // a doubloon's mode: 0 unseen · 1 flying · 2 lying in the sand · 3 in his hand · 4 on the counter
    const flip = A_INFL[n] ? Math.cos(2 * Math.PI * sAt(3.1, 3.9)) : 1;
    const cTr = A_CHEST[n] ? 1 : tr;
    const fs = [
      carry(cv, 8, n, spillOf(0), spillOf(0), cTr), carry(cv, 9, n, spillOf(1), spillOf(1), cTr),
      carry(cv, 10, n, spillOf(2), spillOf(2), cTr), carry(cv, 11, n, spillOf(3), spillOf(3), cTr),
      carry(cv, 12, n, spillOf(4), spillOf(4), cTr),
    ];
    const coins = fs.map((f, k) => {
      const mx = CHEST_HOME + MOUTH.dx;
      const lx = SPILL[k][0];
      const ly = SPILL[k][1];
      if (f <= 1) {
        const u = clamp01(f);
        return {
          x: lerp(mx, lx, u), y: lerp(MOUTH.y, ly, u) - 22 * Math.sin(Math.PI * u),
          mode: f < 0.005 ? 0 : u > 0.995 ? 2 : 1, sx: Math.cos(4 * Math.PI * u),
        };
      }
      if (f <= 2) {
        const u = f - 1;
        return { x: lerp(lx, tR.x + 1.6 * dT, u), y: lerp(ly, tR.y - 2, u), mode: 3, sx: flip };
      }
      const u = clamp01(f - 2);
      return {
        x: lerp(tR.x + 1.6 * dT, COUNTER_COIN.x, u), y: lerp(tR.y - 2, COUNTER_COIN.y, u),
        mode: u < 0.6 ? 3 : 4, sx: 1,
      };
    });

    // ── the twelfth coconut: 0 on the heap · 1 in his left hand ─────────────
    const nutNow = A_WORTH[n] ? sAt(1.75, 1.85) : n > WORTH_N ? 1 : 0;
    const nutS = carry(cv, 13, n, nutNow, nutNow, tr);
    const nut = { x: lerp(NUT_HOME.x, tL.x, nutS), y: lerp(NUT_HOME.y, tL.y - 6, nutS), s: nutS };
    // ── the basket: 0 on the counter · 1 in her right hand ──────────────────
    const bkS = carry(cv, 14, n, basketHeld, basketHeld, tr);
    const basket = { x: lerp(BASKET_HOME.x, bR.x, bkS), y: lerp(BASKET_HOME.y, bR.y, bkS) };

    // ── the slate ───────────────────────────────────────────────────────────
    // the words: 1 COIN (b0, rubbed out on b1), 2 COINS chalked on b1, and the two other
    // prices chalked either side for the question; on b4 the losers blow away in dust
    const oneNow = A_CHEST[n] ? 1 : A_SLATE[n] ? 1 - sAt(2.15, 2.85) : 0;
    const twoNow = A_SLATE[n] ? sAt(3.15, 4.4) : n > SLATE_N && n < INFL_N ? 1 : A_INFL[n] ? 1 - sAt(0.4, 1.2) : 0;
    const sideNow = (k: number) => {
      'worklet';
      if (Q1[n]) return sAt(0.1 + 0.2 * k, 0.5 + 0.2 * k);
      if (A_INFL[n]) return k === RIGHT_PRICE ? 1 : 1 - sAt(0.4, 1.2);
      return k === RIGHT_PRICE && n > Q1_N ? 1 : 0;
    };
    const one = carry(cv, 15, n, oneNow, oneNow, A_SLATE[n] ? 1 : tr);
    const two = carry(cv, 16, n, twoNow, twoNow, A_SLATE[n] || A_INFL[n] ? 1 : tr);
    const sideA = carry(cv, 17, n, sideNow(0), sideNow(0), Q1[n] || A_INFL[n] ? 1 : tr);
    const sideC = carry(cv, 18, n, sideNow(2), sideNow(2), Q1[n] || A_INFL[n] ? 1 : tr);
    // the right price is underlined, by the reader's tap or at the start of b4
    const ulNow = Q1[n] ? (q1 && k1 === RIGHT_PRICE ? ramp(rs, 0.15, 0.6) : 0) : n > Q1_N ? 1 : 0;
    const ul = carry(cv, 19, n, ulNow, ulNow, A_INFL[n] ? sAt(1.1, 1.6) : 1);
    // the game's answer: 0 → 1 over the seconds after the tap, per slot, and kept
    const p1Now = (k: number) => {
      'worklet';
      return Q1[n] ? (q1 && k1 === k ? ramp(rs, 0, 1.4) : 0) : n > Q1_N && k1 === k ? 1 : 0;
    };
    const p1Tr = Q1[n] ? 1 : tr;
    const pQ1 = [
      carry(cv, 20, n, p1Now(0), p1Now(0), p1Tr), carry(cv, 21, n, p1Now(1), p1Now(1), p1Tr),
      carry(cv, 22, n, p1Now(2), p1Now(2), p1Tr),
    ];
    // b4's dust off the two prices rubbed away
    const dustNow = A_INFL[n] ? sAt(0.4, 1.4) : n > INFL_N ? 1 : 0;
    const dust = carry(cv, 23, n, dustNow, dustNow, A_INFL[n] ? 1 : tr);

    // ── the sun goes down, slowly, across the whole lesson ──────────────────
    const sunNow = 328 + (n / (NB - 1)) * 10 + (n === NB - 2 ? 8 * sAt(0.5, 3.5) : n === NB - 1 ? 8 : 0);
    const sunY = carry(cv, 24, n, sunNow, sunNow, n === NB - 2 ? 1 : tr);

    // ── the ship sails in on Q2 and stays ───────────────────────────────────
    const shipNow = Q2[n] ? lerp(440, 300, sAt(0.1, 3.2)) : n > Q2_N ? 300 : 440;
    const shipX = carry(cv, 25, n, shipNow, shipNow, Q2[n] ? 1 : tr);
    // the crates' tags, written out for the question
    const tagNow = n >= Q2_N ? (Q2[n] ? sAt(0.1, 0.5) : 1) : 0;
    const tags = carry(cv, 26, n, tagNow, tagNow, Q2[n] ? 1 : tr);
    const q2 = Q2[n] === 1 && k2 >= 0;
    const p2Now = (k: number) => {
      'worklet';
      return Q2[n] ? (q2 && k2 === k ? ramp(rs, 0, 2.2) : 0) : n > Q2_N && k2 === k ? 1 : 0;
    };
    const p2Tr = Q2[n] ? 1 : tr;
    const pQ2 = [
      carry(cv, 27, n, p2Now(0), p2Now(0), p2Tr), carry(cv, 28, n, p2Now(1), p2Now(1), p2Tr),
      carry(cv, 29, n, p2Now(2), p2Now(2), p2Tr),
    ];

    return {
      cp, bn, th, t,
      chestX, lid, coins, nut, basket,
      one, two, sideA, sideC, ul, pQ1, dust, sunY, shipX, tags, pQ2,
      q1: carry(cv, 30, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 31, n, Q2[p], Q2[n], tr),
    };
  });

  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.bn);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);

  return (
    <View style={styles.scene}>
      <Sky S={SCENE} />
      <Sea S={SCENE} />
      <ObjectArt parts={WRECK_ART} tone={TONE} />
      <RockFoam S={SCENE} />
      {i >= Q2_N - 1 ? <Ship S={SCENE} /> : null}
      <ObjectArt parts={JETTY_ART} tone={TONE} />
      <Cargo S={SCENE} q={i >= Q2_N - 1} />
      <Beach S={SCENE} />
      <ObjectArt parts={TRUNK_ART} tone={TONE} />
      <Fronds S={SCENE} />
      <ObjectArt parts={BUNCH_ART} tone={TONE} />
      <Chest S={SCENE} />
      <Doubloons S={SCENE} />
      {/* cast: plain */}
      <Stickman D={DC} k={K} role="second" wear={[]} />
      <NutRider S={SCENE} layer="heap" />
      <ObjectArt parts={STALL_ART} tone={TONE} />
      <ObjectArt parts={NUTS_ART} tone={TONE} />
      <Slate S={SCENE} q={i >= Q1_N - 1 && i <= Q1_N + 1} />
      <CoinRider S={SCENE} mode={4} />
      <Basket S={SCENE} />
      {/* cast: bun */}
      <Stickman D={DB} k={K} role="lead" wear={BY_ID.bun.pieces} />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="crowd" wear={BY_ID.magistrate.pieces} />
      <CoinRider S={SCENE} mode={3} />
      <NutRider S={SCENE} layer="held" />
      {on(Q1) ? <PriceTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <CrateTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the sky and the sea ──────────────────────────────────────────────────────

function Sky({ S }: { S: SharedValue<any> }) {
  const sun = useAnimatedStyle(() => ({ transform: [{ translateY: S.value.sunY - 330 }] }));
  return (
    <>
      <View style={styles.skyHigh} pointerEvents="none" />
      <View style={styles.skyMid} pointerEvents="none" />
      <View style={styles.skyLow} pointerEvents="none" />
      <View style={[styles.cloud, { left: 196, top: 274, width: 84 }]} pointerEvents="none" />
      <View style={[styles.cloud, { left: 236, top: 281, width: 50 }]} pointerEvents="none" />
      <View style={[styles.cloud, { left: 300, top: 300, width: 70 }]} pointerEvents="none" />
      <View style={[styles.cloud, { left: 20, top: 296, width: 58 }]} pointerEvents="none" />
      <Animated.View style={[styles.sun, sun]} pointerEvents="none" />
    </>
  );
}

/** The sea, silvered at the horizon, with the sun's glitter and a slow shimmer on it. */
function Sea({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <View style={styles.sea} pointerEvents="none" />
      <View style={styles.seaFar} pointerEvents="none" />
      {[0, 1, 2, 3, 4].map((k) => <Glint key={k} S={S} k={k} />)}
      {[0, 1, 2, 3].map((k) => <Shimmer key={k} S={S} k={k} />)}
    </>
  );
}
/** One bar of the sun's glitter on the water under it, flickering on the clock. */
function Glint({ S, k }: { S: SharedValue<any>; k: number }) {
  const y = HORIZON + 4 + k * 9;
  const w = 16 - k * 1.6;
  const st = useAnimatedStyle(() => ({
    opacity: 0.5 + 0.45 * Math.sin(S.value.t * (2.1 + k * 0.37) + k * 1.9),
    transform: [{ translateX: 1.5 * Math.sin(S.value.t * 0.7 + k) }],
  }));
  return <Animated.View style={[styles.glint, { left: SUN_X - w / 2, top: y, width: w }, st]} pointerEvents="none" />;
}
/** A long ripple of light drifting across the sea. */
function Shimmer({ S, k }: { S: SharedValue<any>; k: number }) {
  const y = HORIZON + 22 + k * 17;
  const st = useAnimatedStyle(() => {
    const f = (((S.value.t * (0.018 + k * 0.004) + k * 0.31) % 1) + 1) % 1;
    return { opacity: Math.sin(Math.PI * f) * 0.55, transform: [{ translateX: -40 + 480 * f }] };
  });
  return <Animated.View style={[styles.shimmer, { top: y, width: 26 + k * 6 }, st]} pointerEvents="none" />;
}

/** Foam lifting and falling round the wreck's rocks. */
function RockFoam({ S }: { S: SharedValue<any> }) {
  const a = useAnimatedStyle(() => ({
    opacity: 0.7 + 0.25 * Math.sin(S.value.t * 1.1 + 1),
    transform: [{ scaleX: 1 + 0.06 * Math.sin(S.value.t * 1.1) }],
  }));
  return <Animated.View style={[styles.rockFoam, a]} pointerEvents="none" />;
}

/** The sand, wet at the waterline, and the waves running up it and back. */
function Beach({ S }: { S: SharedValue<any> }) {
  const wash = useAnimatedStyle(() => {
    const w = Math.sin(S.value.t * 0.8);
    return { opacity: 0.85 + 0.15 * w, transform: [{ translateY: 2.4 * w }] };
  });
  const wash2 = useAnimatedStyle(() => {
    const w = Math.sin(S.value.t * 0.8 + 2.2);
    return { opacity: 0.55 + 0.35 * w, transform: [{ translateY: 3 * w }, { translateX: 6 * Math.sin(S.value.t * 0.31) }] };
  });
  return (
    <>
      <View style={styles.sand} pointerEvents="none" />
      <View style={styles.wetSand} pointerEvents="none" />
      <Animated.View style={[styles.foam, wash]} pointerEvents="none" />
      <Animated.View style={[styles.foam2, wash2]} pointerEvents="none" />
      {[[30, 520, 18], [190, 532, 26], [292, 516, 14], [356, 538, 22], [96, 546, 20]].map(([x, y, w], k) => (
        <View key={k} style={[styles.ripple, { left: x, top: y, width: w }]} pointerEvents="none" />
      ))}
    </>
  );
}

/** The palm's fronds, each swaying a degree or two about the crown on the clock. */
function Fronds({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {FRONDS.map(([deg, mirror, size, ph], k) => <Frond key={k} S={S} deg={deg} mirror={mirror} size={size} ph={ph} />)}
    </>
  );
}
function Frond({ S, deg, mirror, size, ph }: { S: SharedValue<any>; deg: number; mirror: number; size: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const sway = 1.8 * Math.sin(S.value.t * 0.9 + ph) + 0.8 * Math.sin(S.value.t * 2.3 + ph * 2);
    return {
      transform: [
        { translateX: CROWN.x }, { translateY: CROWN.y },
        { scaleX: mirror ? -size : size }, { scaleY: size }, { rotate: `${deg + sway}deg` },
      ],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={FROND_ART} tone={TONE} />
    </Animated.View>
  );
}

// ── the chest ────────────────────────────────────────────────────────────────

/**
 * The chest, drawn about its own middle and slid by `chestX`: the lid's inside standing
 * up on the hinge (behind), the gold heap in its mouth, the shut dome over it, and the
 * box. Turning one lid into the other about the hinge line is what reads as flinging it
 * open; two gold glints twinkle on the clock once it is.
 */
function Chest({ S }: { S: SharedValue<any> }) {
  const at = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.chestX }] }));
  const shut = useAnimatedStyle(() => {
    const s = clamp01(1 - S.value.lid * 2);
    return { opacity: s > 0.02 ? 1 : 0, transform: [{ scaleY: Math.max(0.02, s) }] };
  });
  const open = useAnimatedStyle(() => {
    const s = clamp01((S.value.lid - 0.5) * 2);
    return { opacity: s > 0.02 ? 1 : 0, transform: [{ scaleY: Math.max(0.02, s) }] };
  });
  const sparkA = useAnimatedStyle(() => {
    const w = Math.max(0, Math.sin(S.value.t * 2.7));
    return { opacity: clamp01(S.value.lid * 2 - 1) * w, transform: [{ rotate: '45deg' }, { scale: 0.6 + 0.5 * w }] };
  });
  const sparkB = useAnimatedStyle(() => {
    const w = Math.max(0, Math.sin(S.value.t * 2.3 + 2));
    return { opacity: clamp01(S.value.lid * 2 - 1) * w, transform: [{ rotate: '45deg' }, { scale: 0.6 + 0.5 * w }] };
  });
  return (
    <Animated.View style={[styles.rider, at]} pointerEvents="none">
      <Animated.View style={[styles.lidInBox, open]}>
        <ObjectArt parts={LID_IN_ART} tone={TONE} />
      </Animated.View>
      <ObjectArt parts={HEAP_ART} tone={TONE} />
      <Animated.View style={[styles.spark, { left: -9, top: HINGE - 8 }, sparkA]} />
      <Animated.View style={[styles.spark, { left: 9, top: HINGE - 6 }, sparkB]} />
      <Animated.View style={[styles.lidBox, shut]}>
        <ObjectArt parts={LID_ART} tone={TONE} />
      </Animated.View>
      <ObjectArt parts={CHEST_ART} tone={TONE} />
    </Animated.View>
  );
}

// ── the gold, the coconut and the basket ────────────────────────────────────

type At = { x: number; y: number; o: number; sx: number; sy: number };
function Rider({ at, art }: { at: SharedValue<At>; art: ReturnType<typeof ec6Coin> }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }, { scaleX: at.value.sx }, { scaleY: at.value.sy }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={TONE} />
    </Animated.View>
  );
}

/** One doubloon flying out of the chest and lying in the sand, behind the cast. A coin lying flat is the same coin squashed. */
function SandCoin({ S, k }: { S: SharedValue<any>; k: number }) {
  const a = useDerivedValue<At>(() => {
    const c = S.value.coins[k];
    const lying = c.mode === 2;
    return { x: c.x, y: c.y + (lying ? 1.6 : 0), o: c.mode === 1 || lying ? 1 : 0, sx: lying ? 1 : c.sx, sy: lying ? 0.42 : 1 };
  });
  return <Rider at={a} art={COIN_ART} />;
}
function Doubloons({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <SandCoin S={S} k={0} />
      <SandCoin S={S} k={1} />
      <SandCoin S={S} k={2} />
      <SandCoin S={S} k={3} />
      <SandCoin S={S} k={4} />
    </>
  );
}
/** The doubloon he buys with: in his hand (mode 3, in front of him) or lying on the counter (mode 4). */
function CoinRider({ S, mode }: { S: SharedValue<any>; mode: 3 | 4 }) {
  const a = useDerivedValue<At>(() => {
    const c = S.value.coins[BUY];
    const flat = mode === 4;
    return { x: c.x, y: c.y + (flat ? 1.2 : 0), o: c.mode === mode ? 1 : 0, sx: flat ? 1 : c.sx, sy: flat ? 0.42 : 1 };
  });
  return <Rider at={a} art={COIN_ART} />;
}

/** The twelfth coconut: on the heap (behind the heap's front rows), then in his hand. */
function NutRider({ S, layer }: { S: SharedValue<any>; layer: 'heap' | 'held' }) {
  const a = useDerivedValue<At>(() => {
    const v = S.value.nut;
    const lifted = v.s > 0.02;
    return { x: v.x, y: v.y, o: (layer === 'held') === lifted ? 1 : 0, sx: 1, sy: 1 };
  });
  return <Rider at={a} art={NUT_ART} />;
}

function Basket({ S }: { S: SharedValue<any> }) {
  const a = useDerivedValue<At>(() => ({ x: S.value.basket.x, y: S.value.basket.y, o: 1, sx: 1, sy: 1 }));
  return <Rider at={a} art={BASKET_ART} />;
}

// ── the slate ────────────────────────────────────────────────────────────────

/**
 * One price in chalk. `shown` reveals it left to right as the chalk goes along and takes
 * it away again as it is rubbed; a wrong pick shudders it in a puff of dust, the right
 * one jumps, and a chalk line is struck under the right one.
 */
function Price({ S, k, shown, under }: { S: SharedValue<any>; k: number; shown: 'two' | 'sideA' | 'sideC'; under?: boolean }) {
  const clip = useAnimatedStyle(() => {
    const u = clamp01(S.value[shown]);
    return { width: SLOT_W * u, opacity: u > 0.02 ? 1 : 0 };
  });
  const word = useAnimatedStyle(() => {
    const g = S.value.pQ1[k];
    const wrong = k !== RIGHT_PRICE;
    const shake = wrong ? 2.4 * Math.sin(g * 34) * (1 - g) : 0;
    const pop = wrong ? 0 : 0.14 * hump(g, 0, 0.18, 0.5);
    return { transform: [{ translateX: shake }, { scale: 1 + pop }] };
  });
  const puff = useAnimatedStyle(() => {
    const g = S.value.pQ1[k];
    const u = k === RIGHT_PRICE ? 0 : Math.max(g, S.value.dust);
    return { opacity: u > 0.01 && u < 0.99 ? 0.75 * (1 - u) : 0, transform: [{ translateY: -10 * u }, { scale: 0.5 + 1.1 * u }] };
  });
  const line = useAnimatedStyle(() => ({ width: 32 * clamp01(S.value.ul), opacity: S.value.ul > 0.02 ? 1 : 0 }));
  return (
    <View style={[styles.slot, { left: SLOT_X[k] - SLOT_W / 2 }]} pointerEvents="none">
      <Animated.View style={[styles.clip, clip]}>
        <Animated.View style={[styles.slotIn, word]}>
          <Text style={styles.chalk}>{PRICE_WORDS[k]}</Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.dust, puff]} />
      {under ? <Animated.View style={[styles.underline, line]} /> : null}
    </View>
  );
}

function Slate({ S, q }: { S: SharedValue<any>; q: boolean }) {
  // the middle slot holds the price she writes: 1 COIN, and then 2 COINS where it was
  const one = useAnimatedStyle(() => ({ opacity: S.value.one }));
  return (
    <>
      <Animated.View style={[styles.slot, { left: SLOT_X[1] - SLOT_W / 2 }, one]} pointerEvents="none">
        <View style={styles.slotIn}>
          <Text style={styles.chalk}>{PRICE_WORDS[0]}</Text>
        </View>
      </Animated.View>
      <Price S={S} k={1} shown="two" />
      {q ? <Price S={S} k={0} shown="sideA" /> : null}
      <Price S={S} k={2} shown="sideC" under />
    </>
  );
}

// ── the ship and the cargo ───────────────────────────────────────────────────

function Ship({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [
      { translateX: S.value.shipX }, { translateY: HORIZON - 15 + 0.8 * Math.sin(S.value.t * 1.3) },
      { rotate: `${1.2 * Math.sin(S.value.t * 1.3 + 0.6)}deg` },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={SHIP_ART} tone={TONE} />
    </Animated.View>
  );
}

/**
 * The three crates on the jetty, each answering its own way once it is picked (and
 * keeping what it did): the fish crate's lid lifts off, a snapper leaps and two coconuts
 * poke up; the gold crate's lid hops, coins jump and it sinks into the planks; the
 * cannon crate's lid flies, the barrel rises and fires a puff of smoke, and it kicks back.
 */
function Cargo({ S, q }: { S: SharedValue<any>; q: boolean }) {
  return (
    <>
      <Crate S={S} k={0} q={q} />
      <Crate S={S} k={1} q={q} />
      <Crate S={S} k={2} q={q} />
    </>
  );
}
function Crate({ S, k, q }: { S: SharedValue<any>; k: number; q: boolean }) {
  const x = CRATE_X[k];
  const top = DECK - CRATE_H;
  const body = useAnimatedStyle(() => {
    const g = S.value.pQ2[k];
    const sink = k === 0 ? 5 * ramp(g, 0.4, 0.55) : 0;
    const kick = k === 2 ? 4 * hump(g, 0.2, 0.26, 0.55) : 0;
    const tilt = k === 0 ? -5 * ramp(g, 0.4, 0.55) : 0;
    return { transform: [{ translateX: x + kick }, { translateY: DECK - CRATE_H / 2 + sink }, { rotate: `${tilt}deg` }] };
  });
  const lid = useAnimatedStyle(() => {
    const g = S.value.pQ2[k];
    let dy = 0;
    let dx = 0;
    let rot = 0;
    if (k === 1) {
      dy = -10 * ramp(g, 0, 0.15) + 4 * ramp(g, 0.15, 0.35);
      dx = 9 * ramp(g, 0.08, 0.35);
      rot = 16 * ramp(g, 0.08, 0.35);
    }
    if (k === 0) {
      dy = -12 * hump(g, 0.04, 0.12, 0.26);
      dx = -5 * ramp(g, 0.12, 0.26);
      rot = -9 * ramp(g, 0.12, 0.26);
    }
    if (k === 2) {
      dy = -14 * hump(g, 0.02, 0.12, 0.3);
      rot = 22 * hump(g, 0.02, 0.12, 0.3);
    }
    const sink = k === 0 ? 5 * ramp(g, 0.4, 0.55) : 0;
    const kick = k === 2 ? 4 * hump(g, 0.2, 0.26, 0.55) : 0;
    return { transform: [{ translateX: x + dx + kick }, { translateY: top - 1.5 + dy + sink }, { rotate: `${rot}deg` }] };
  });
  const tag = useAnimatedStyle(() => ({ opacity: S.value.tags }));
  return (
    <>
      {q && k === 1 ? <FishCrate S={S} x={x} /> : null}
      {q && k === 0 ? <GoldCrate S={S} x={x} /> : null}
      {q && k === 2 ? <CannonCrate S={S} x={x} /> : null}
      <Animated.View style={[styles.rider, body]} pointerEvents="none">
        <ObjectArt parts={CRATE_ART} tone={TONE} />
        {q ? (
          <Animated.View style={[styles.tag, tag]}>
            <Text style={styles.tagText}>{CRATE_LINES[k][0]}</Text>
            <Text style={styles.tagText}>{CRATE_LINES[k][1]}</Text>
          </Animated.View>
        ) : null}
      </Animated.View>
      <Animated.View style={[styles.rider, lid]} pointerEvents="none">
        <ObjectArt parts={CRATE_LID_ART} tone={TONE} />
      </Animated.View>
    </>
  );
}
function FishCrate({ S, x }: { S: SharedValue<any>; x: number }) {
  const top = DECK - CRATE_H;
  const fish = useAnimatedStyle(() => {
    const g = S.value.pQ2[1];
    const leap = ramp(g, 0.14, 0.62);
    const up = 30 * Math.sin(Math.PI * leap) + 7 * ramp(g, 0.5, 0.62);
    return {
      opacity: g > 0.1 ? 1 : 0,
      transform: [{ translateX: x - 6 + 10 * leap }, { translateY: top + 6 - up }, { rotate: `${-50 + 100 * leap - 30 * ramp(g, 0.62, 0.8)}deg` }],
    };
  });
  const nuts = useAnimatedStyle(() => ({ transform: [{ translateY: top + 6 - 9 * ramp(S.value.pQ2[1], 0.1, 0.35) }] }));
  return (
    <>
      <Animated.View style={[styles.rider, nuts]} pointerEvents="none">
        <View style={[styles.rider, { left: x - 12 }]}><ObjectArt parts={NUT_ART} tone={TONE} /></View>
        <View style={[styles.rider, { left: x + 4, top: 1 }]}><ObjectArt parts={NUT_ART} tone={TONE} /></View>
      </Animated.View>
      <Animated.View style={[styles.rider, fish]} pointerEvents="none">
        <ObjectArt parts={FISH_ART} tone={TONE} />
      </Animated.View>
    </>
  );
}
function GoldHop({ S, x, j }: { S: SharedValue<any>; x: number; j: number }) {
  const top = DECK - CRATE_H;
  // a fountain of doubloons out of the gold crate, each landing on the planks beside it
  // and lying there flat
  const st = useAnimatedStyle(() => {
    const g = S.value.pQ2[0];
    const u = ramp(g, 0.08 + 0.05 * j, 0.42 + 0.05 * j);
    const out = GOLD_OUT[j];
    const land = DECK + 3 - top;
    const y = top + 6 + land * u - (26 + 4 * j) * Math.sin(Math.PI * u);
    const flat = u > 0.99;
    return {
      opacity: g > 0.06 ? 1 : 0,
      transform: [{ translateX: x + out * u }, { translateY: y + (flat ? 1.2 : 0) }, { scaleX: flat ? 1 : Math.cos(5 * u) }, { scaleY: flat ? 0.42 : 1 }],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={COIN_ART} tone={TONE} />
    </Animated.View>
  );
}
function GoldCrate({ S, x }: { S: SharedValue<any>; x: number }) {
  return (
    <>
      <GoldHop S={S} x={x} j={0} />
      <GoldHop S={S} x={x} j={1} />
      <GoldHop S={S} x={x} j={2} />
      <GoldHop S={S} x={x} j={3} />
    </>
  );
}
function Smoke({ S, x, j }: { S: SharedValue<any>; x: number; j: number }) {
  const top = DECK - CRATE_H;
  const st = useAnimatedStyle(() => {
    const g = S.value.pQ2[2];
    const u = ramp(g, 0.2 + 0.06 * j, 0.75 + 0.06 * j);
    return {
      opacity: u > 0.01 && u < 0.99 ? Math.min(1, 1.6 * (1 - u)) : 0,
      transform: [{ translateX: x + 14 + 6 * u - 7 * j }, { translateY: top - 16 - 14 * u + 5 * j }, { scale: 0.6 + 1.3 * u }],
    };
  });
  return <Animated.View style={[styles.smoke, st]} pointerEvents="none" />;
}
function CannonCrate({ S, x }: { S: SharedValue<any>; x: number }) {
  const top = DECK - CRATE_H;
  const barrel = useAnimatedStyle(() => {
    const g = S.value.pQ2[2];
    const kick = 4 * hump(g, 0.2, 0.26, 0.55);
    return { opacity: g > 0.02 ? 1 : 0, transform: [{ translateX: x - 2 + kick }, { translateY: top + 8 - 10 * ramp(g, 0.04, 0.2) }, { rotate: '-28deg' }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, barrel]} pointerEvents="none">
        <ObjectArt parts={CANNON_ART} tone={TONE} />
      </Animated.View>
      <Smoke S={S} x={x} j={0} />
      <Smoke S={S} x={x} j={1} />
    </>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/**
 * Both are tapped ON THE STAGE (AP6), on the things themselves. No two live targets touch
 * (AN4). Q1, CHALK THE PRICE: the three prices on the slate. Q2, LOAD THE SHIP: the three
 * crates on the jetty.
 */
type Q = { id: string; left: number; top: number; w: number; h: number; correct: boolean };
const PRICE_Q: Q[] = SLOT_X.map((x, k) => ({ id: PRICE_IDS[k], left: x - 22, top: 451, w: 44, h: 52, correct: k === RIGHT_PRICE }));
const CRATE_Q: Q[] = CRATE_X.map((x, k) => ({ id: CRATE_IDS[k], left: x - 27, top: DECK - CRATE_H - 16, w: 54, h: 58, correct: k === RIGHT_CRATE }));
type TP = { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> };
function PriceTargets(p: TP) {
  return <StageTargets {...p} qs={PRICE_Q} k="q1" />;
}
function CrateTargets(p: TP) {
  return <StageTargets {...p} qs={CRATE_Q} k="q2" />;
}
/** The verdict's seal goes where it covers no word and none of the game's answer: over
 *  the coconuts for a price, in the sky over a crate (each crate's box reaches up for it). */
function StageTargets({ picked, onPick, live, S, qs, k, seal = 'tr' }: TP & { qs: Q[]; k: 'q1' | 'q2'; seal?: 'tr' | 'br' }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt={seal}
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

const N = NATURAL;
const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  skyHigh: { position: 'absolute', left: 0, top: 200, width: 400, height: 92, backgroundColor: N.ec6SkyHigh.base },
  skyMid: { position: 'absolute', left: 0, top: 292, width: 400, height: 30, backgroundColor: N.ec6SkyMid.base },
  skyLow: { position: 'absolute', left: 0, top: 322, width: 400, height: 30, backgroundColor: N.ec6SkyLow.base },
  cloud: { position: 'absolute', height: 5, borderRadius: 2.5, backgroundColor: N.ec6Sun.base, opacity: 0.85 },
  sun: { position: 'absolute', left: SUN_X - 15, top: 315, width: 30, height: 30, borderRadius: 15, backgroundColor: N.ec6Sun.base },
  sea: { position: 'absolute', left: 0, top: HORIZON, width: 400, height: SHORE - HORIZON + 4, backgroundColor: N.ec6Sea.base },
  seaFar: { position: 'absolute', left: 0, top: HORIZON, width: 400, height: 14, backgroundColor: N.ec6SeaFar.base },
  glint: { position: 'absolute', height: 2, borderRadius: 1, backgroundColor: N.ec6Glint.base },
  shimmer: { position: 'absolute', left: 0, height: 1.4, borderRadius: 0.7, backgroundColor: N.ec6Foam.base },
  rockFoam: { position: 'absolute', left: 0, top: 401, width: 118, height: 3, borderRadius: 1.5, backgroundColor: N.ec6Foam.base },
  sand: {
    position: 'absolute', left: 0, top: SHORE, width: 400, height: STAGE_H - SHORE, backgroundColor: N.sand.base,
    borderTopWidth: 1, borderTopColor: N.ec6WetSand.shade,
  },
  wetSand: { position: 'absolute', left: 0, top: SHORE, width: 400, height: 9, backgroundColor: N.ec6WetSand.base },
  foam: { position: 'absolute', left: -10, top: SHORE + 1, width: 420, height: 3, borderRadius: 1.5, backgroundColor: N.ec6Foam.base },
  foam2: { position: 'absolute', left: 30, top: SHORE + 6, width: 300, height: 1.6, borderRadius: 0.8, backgroundColor: N.ec6Foam.base },
  ripple: { position: 'absolute', height: 1.2, borderRadius: 0.6, backgroundColor: N.sand.shade },
  lidBox: { position: 'absolute', left: -26, top: HINGE - 12, width: 52, height: 23, transformOrigin: '50% 52.17%' },
  lidInBox: { position: 'absolute', left: -26, top: HINGE - 19, width: 52, height: 19, transformOrigin: '50% 100%' },
  spark: { position: 'absolute', width: 4, height: 4, backgroundColor: N.ec6Glint.base },
  slot: { position: 'absolute', top: SLATE.top, width: SLOT_W, height: SLATE.h },
  clip: { position: 'absolute', left: 0, top: 0, height: SLATE.h, overflow: 'hidden' },
  slotIn: { position: 'absolute', left: 0, top: 0, width: SLOT_W, height: SLATE.h - 4, alignItems: 'center', justifyContent: 'center' },
  chalk: { fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 13, color: N.slate.label, includeFontPadding: false },
  // the dust rises off the TOP of the word, never across it
  dust: { position: 'absolute', left: SLOT_W / 2 - 9, top: -9, width: 18, height: 10, borderRadius: 5, backgroundColor: N.ec6Foam.shade },
  underline: { position: 'absolute', left: SLOT_W / 2 - 16, top: SLATE.h - 4.4, height: 1.6, borderRadius: 0.8, backgroundColor: N.slate.label },
  tag: {
    position: 'absolute', left: FRONT_DX - 24.5, top: -13.5, width: 49, height: 25, borderRadius: 3, borderWidth: 0.8, borderColor: INK,
    backgroundColor: STONE, boxShadow: lipOf(TONE), alignItems: 'center', justifyContent: 'center',
  },
  tagText: { fontFamily: 'Caveat_700Bold', fontSize: 10.5, lineHeight: 10.5, color: INK, textAlign: 'center', includeFontPadding: false },
  smoke: { position: 'absolute', left: -7, top: -7, width: 14, height: 14, borderRadius: 7, backgroundColor: N.ec6Smoke.base },
  clear: { flexGrow: 1 },
});

export function Econ6Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Econ6Scene} band={[250, 524]} camera={CAM} />;
}
