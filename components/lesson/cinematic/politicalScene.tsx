import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { BEATS } from './politicalScript';
import {
  WALK, boxMove, clamp01, ease01, lerp, mixStance, moveTr, pose, stand, travelStance, type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, hideLeadWhile,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { useLinger } from './useLinger';
import { emoteAny, gazeAt } from './moves';
import { reachHandTo } from './interact';
import { lineOf, stage, bump } from './pace';
import { attendAt } from './attend';
import {
  shop, lightPole, soapbox, newsLegs, farHouses, pavements, road, lampHoods, STREET, SHOPS, SHUTTER, LIGHT, LAMP_R, BOX, NEWS,
} from './politicalSet';
import { DEEP, EMBER, SAGE, TEAL, OLIVE, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// political-political-1, "Why Societies Need Rules" — A TOWN CROSSROADS WHOSE
// LIGHTS HAVE DIED.
//
// Redrawn 2026-09-25, one of five first lessons the owner asked for after the logic
// debate studio, each displaying its information in a way of its own. Here the
// information is THE STREET ITSELF: a banner, a street-name plate, shop shutters, a
// newsboard and a notice on the light pole, and the traffic light is the gauge —
// green while there is order, dark and then red in the war of all.
//
//   b0–1  four neighbours chatting in pairs at a crossroads, the lights green; they
//         turn to look up as a banner goes up across the street: WHAT GIVES A STATE
//         THE RIGHT TO RULE?
//   b2    they turn round to the light as it dies; the shutters start to come down;
//         the street plate reads STATE OF NATURE.
//   b3    the shutters are down, sprayed SOLITARY · POOR / NASTY · BRUTISH · SHORT as
//         the words are quoted; they read them, and square up in pairs.
//   b4    the brawl; the light burns red; the newsboard: WAR OF EVERY MAN AGAINST
//         EVERY MAN.
//   b5    an officer comes down the road out of the far end of the street, growing
//         as he nears; the fighting stops as they turn to watch him; the banner gains
//         its answer: A COVENANT — ONE POWER KEEPS THE PEACE.
//
// Every event is laid across its beat's voiced line (pace.ts), not a fixed delay.
// The officer is the lead: `lookPose` with authored attention (attend.ts); the
// neighbours carry their own looks and turns (TURNS, CIT_LOOK).
//   b7    the first question: answered, he steps onto the box; the light goes
//         green, the shutters go up, the fighting stops.
//   b8    the contract posted on the light pole: NO SIGNATURES — A TEST, NOT A
//         DOCUMENT.
//   b9    the neighbours bow; a poster in the shop window: LOCKE — A PEOPLE MAY
//         RESIST.
//   b10   the order question: he steps down as the answer moves toward the most
//         right to rebel.
//
// WHAT IS NOT CHANGED: every word of narration (politicalScript.ts keeps every
// beat's text and order; the voice is keyed by index).
//
// COMPOSITION, in stage units: the banner 64–336 × 298–330; shops 44–150 and
// 250–392 from their awnings at 330, shutters 338–440; the light pole at x 24 with
// its head 320–370; neighbours at x 84, 130, 278, 320; the soapbox at x 200; the
// newsboard 336–398 from 440; a dusk sky over a road receding between the shops,
// kerbs and dashes in perspective, rooftops closing its far end. Band
// [290, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('political');
const { RULE, SHADE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
const WALL = stageToneOf(SAGE);
/** The sky between the shops, and the road under it: the palette's tame teal. */
const DUSK = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, political-political-1. */
const LINES = [6.76, 4.2, 7.0, 9.44, 8.96, 6.8, 0, 0, 6.52, 8.84, 0, 0];

const CIT_X = [84, 130, 278, 320];
const CIT_K = K_FIG * 0.82;
/** A neighbour's head centre, and the officer's, at their scales. */
const CIT_HEAD = GROUND - 75;
const OFF_HEAD = GROUND - 92;

// ── WHICH WAY EACH NEIGHBOUR FACES, AND WHEN (fractions of the beat's line) ──
//
// `[at, d0, d1, d2, d3, at, …]`: from `at` of the line, each neighbour turns to its
// `d`. They chat in pairs, turn to the banner as it goes up, round to the light as it
// dies, back on each other as the shutters come down, and to the officer when he
// comes. Every beat SETTLES facing a person (N21): pairs face each other, and facing
// the middle faces the neighbour in front.
const PAIRS = [1, -1, 1, -1];
const MIDDLE = [1, 1, -1, -1];
const TURNS: number[][] = [
  [0.06, ...PAIRS],
  [0.1, ...MIDDLE],
  [0.34, -1, -1, -1, -1, 0.6, ...PAIRS],
  [],
  [],
  [0.08, 1, 1, -1, 1, 0.4, ...MIDDLE],
  [],
  [],
  [0.16, -1, 1, -1, -1, 0.55, ...MIDDLE],
  [0.6, 1, 1, 1, -1],
  [],
  [],
];
/** Where each neighbour ends each beat — what the next beat starts from. */
const TURN_END: number[][] = [];
{
  let d = MIDDLE.slice();
  for (const keys of TURNS) {
    for (let j = 0; j + 4 < keys.length; j += 5) d = [keys[j + 1], keys[j + 2], keys[j + 3], keys[j + 4]];
    TURN_END.push(d.slice());
  }
}
/**
 * WHERE THE NEIGHBOURS LOOK — attend.ts's keys, with two stand-ins for a moving
 * target: x −1 is the neighbour's own partner (0↔1, 2↔3), x −2 the officer, and y
 * is then ignored. The banner is 64–336 × 298–330, the light's head 320–370 at x 24,
 * the street plate at 10–68 × 376–400, the shutters' words about y 400 over each
 * shop, the contract 0–68 × 414–458 and Locke's poster 268–354 × 352–382.
 */
const SHOP_MID = [(SHOPS[0].x0 + SHOPS[0].x1) / 2, (SHOPS[1].x0 + SHOPS[1].x1) / 2];
const CIT_LOOK: number[][] = [
  [0.1, -1, 0, 0.8],
  [0.14, 200, 314, 1, 0.86, -1, 0, 0.6],
  [0.36, LIGHT.x, LIGHT.headTop + 30, 1, 0.62, -1, 0, 0.9, 0.78, 38, 388, 0.8, 0.94, -1, 0, 0.7],
  [0.04, -3, 400, 1, 0.5, -1, 0, 1],
  [0.02, -1, 0, 1],
  [0.06, -2, 0, 1],
  [0.1, -2, 0, 0.9],
  [0.1, -2, 0, 1],
  [0.18, 34, 436, 1, 0.55, -2, 0, 0.9],
  [0.06, -2, 0, 0.8, 0.6, 311, 367, 1],
  [0.2, -2, 0, 0.9],
  [0.1, 0, 0, 0],
];
/**
 * The officer: he comes DOWN THE ROAD, out of the far end of the street, growing as
 * he nears — so the road is a road he walks on, and he never crosses a neighbour. His
 * feet ride the right-hand lane: at scale s they are at x `LANE_X + LANE_W·s`, y
 * `STREET.far + (GROUND − STREET.far)·s`, which puts them on the carriageway at every
 * depth. He waits at the lane's near end and steps left onto the box.
 */
const LANE_X = 198;
const LANE_W = 28;
const OFF_S0 = 0.14;
const OFF_WAIT = LANE_X + LANE_W;
const OFF_BOX = BOX.cx;
/** The stride he walks the street with, in his own units (the gait's distance, not the stage's). */
const OFF_STRIDE = 190;

const SHOP_ART = [shop(0), shop(1)];
/** Where the road begins, between the shops. */
const ROAD_Y = STREET.far;
const FAR_ART = farHouses();
const PAVE_ART = pavements();
const ROAD_ART = road();
const HOOD_ART = lampHoods();
const POLE_ART = lightPole();
const BOX_ART = soapbox();
const NEWS_ART = newsLegs();

// ── per-beat tracks, read off the script ─────────────────────────────────────
const since = (k0: number) => BEATS.map((_, k) => (k0 >= 0 && k >= k0 ? 1 : 0));
const AUTH = BEATS.map((b) => b.auth ?? 0);
const NATURE = BEATS.map((b) => b.nature ?? 0);
const REVEAL = BEATS.map((b) => b.reveal ?? 0);
const at = (r: number) => REVEAL.map((v) => (v >= r ? 1 : 0));
const BANNER = at(1);
const LEDGER = at(2);
/**
 * The sprayed words exist while the shutters are down. Once the officer is up they
 * roll away with the shutters and are unmounted: a word hidden only by the shutter's
 * clip is still a word to the must-box probe, above the band.
 */
const SPRAY_ON = LEDGER.map((v, k) => (v && (k === 0 || AUTH[k - 1] === 0) ? 1 : 0));
const NEWS_ON = at(3);
const COVENANT = at(4);
/** The street plate goes up the first time the state of nature is named, and stays. */
const PLATE = since(NATURE.findIndex((v) => v > 0));
const PAPER_ON = since(BEATS.findIndex((b) => (b.paper ?? 0) > 0));
const BOW = BEATS.map((b) => b.bow ?? 0);
const LOCKE = since(BOW.findIndex((v) => v > 0));
/** He walks up to the box on the beat the covenant is named, and is there after it. */
const OFFICER = COVENANT;
const Q1 = BEATS.map((b) => (b.weigh === 'q1' ? 1 : 0));
// R7c — he steps down as the order answer moves toward the most right to rebel.
const REACT = BEATS.map((b) => (b.interact?.order ? 1 : 0));

// Each neighbour runs an out-of-phase loop of blows — no two in sync, the brawl.
const MELEE: number[][] = [
  [1, 3, 2, 0, 5, 1, 6],
  [14, 1, 12, 2, 0, 10, 5],
  [5, 11, 0, 13, 1, 3, 12],
  [15, 2, 6, 1, 16, 0, 4],
];
function melee(t: number, k: number): Stance {
  'worklet';
  const codes = MELEE[k % MELEE.length];
  const period = 0.66 + (k % 3) * 0.07;
  const local = t * 1.1 + k * 1.9;
  const idx = Math.floor(local / period) % codes.length;
  const u = (local / period) % 1;
  return boxMove(codes[idx], t, u, k + 1);
}
/** A neighbour at peace: weight shifting and nodding, each on their own phase; bowing on cue. */
function calm(t: number, k: number, bow: number): Stance {
  'worklet';
  const s = stand(t + k * 1.7);
  const shift = Math.sin(t * (0.55 + k * 0.08) + k * 2.1);
  const nod = Math.max(0, Math.sin(t * (1.9 + k * 0.23) + k * 1.3)) ** 2;
  return {
    ...s,
    tilt: s.tilt + shift * 0.05 - bow * 0.16,
    neck: s.neck + shift * 0.05 - nod * 0.24 + bow * 0.32,
    footL: { x: s.footL.x - shift * 1.8, y: s.footL.y },
    footR: { x: s.footR.x - shift * 1.8, y: s.footR.y },
    fistL: { x: -13 - shift * 2.6, y: 4 + shift * 2.4 + bow * 2 },
    fistR: { x: 13 - shift * 2.6, y: 4 - shift * 2.4 + bow * 2 },
  };
}
/**
 * The officer: baton held out in front, tapped into his free palm while he listens.
 * A living hold under it, so he is never a statue while a neighbour is talked to
 * (N21); the tap is his own tempo.
 */
function officerPose(t: number): Stance {
  'worklet';
  const s = emoteAny(263, t);
  const tap = Math.max(0, Math.sin(t * 2.4)) ** 2;
  return {
    ...s,
    fistR: { x: 24 - tap * 6, y: -16 + tap * 7 },
    fistL: { x: 12 + tap * 2, y: -4 - tap * 2 },
  };
}

/**
 * A neighbour's facing `b` seconds into a beat: from where the last beat left him,
 * through each of this beat's turns in order, each eased over 0.4 s.
 */
function turnNow(keys: readonly number[], from: number, k: number, b: number, L: number): number {
  'worklet';
  let d = from;
  for (let j = 0; j + 4 < keys.length; j += 5) {
    const u = clamp01((b - keys[j] * L) / 0.4);
    d = d + (keys[j + 1 + k] - d) * (u * u * (3 - 2 * u));
  }
  return d;
}

const X = BEATS.map(() => 200);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political'));

export default function PoliticalScene({ clock, bt, bi, qv, pickPos, i }: SceneApi) {
  const reacting = REACT[i] === 1;
  const held0 = useHeld();
  const held1 = useHeld();
  const held2 = useHeld();
  const held3 = useHeld();
  const cv = useCarry(23);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const tr = ease01(b / TR);
    const t = clock.value;
    const q = clamp01(qv.value);
    const L = lineOf(LINES, n);
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── THE STREET, ACT BY ACT, ACROSS THE VOICED LINE ────────────────────────
    // b1 the banner goes up · b2 the lights die after "law, court or ruler", the
    // shutters start down, the plate on "the state of nature" · b3 the shutters come
    // the rest of the way and the words are sprayed as they are quoted · b4 the brawl
    // builds to "strike first", the headline on "every man against every man" · b5
    // the officer walks up, the fighting falters, the banner's answer on "one
    // sovereign" · b8 the contract, then its stamp · b9 the bow, then Locke.
    const nWin = n === 2 ? [0.45, 0.85] : n === 3 ? [0, 0.35] : n === 4 ? [0.1, 0.42] : n === 5 ? [0.22, 0.6] : [0, 0.12];
    const nature = carry(cv, 1, n, NATURE[p], NATURE[n], st(nWin[0], nWin[1]));
    // up on the box: the first answer puts him there, the order answer takes him down
    const auth = Q1[n] === 1 ? ease01(q) : carry(cv, 0, n, AUTH[p], reacting ? 1 - pickPos.value : AUTH[n], tr);
    // once he is on the street they stop fighting each other and watch him
    const watching = OFFICER[n] ? (!OFFICER[p] ? st(0.3, 0.55) : 1) : 0;
    const fight = nature * (1 - auth) * (1 - watching);
    // the subjects bow to the sovereign they authorised, and straighten again
    const bow = carry(cv, 2, n, 0, BOW[n] && !BOW[p] ? bp(0.06, 0.18, 0.46) : 0, tr);

    const banner = carry(cv, 3, n, BANNER[p], n === 1 ? st(0.06, 0.4) : BANNER[n], tr);
    const plate = carry(cv, 4, n, PLATE[p], n === 2 ? st(0.76, 0.86) : PLATE[n], tr);
    const spray0 = carry(cv, 5, n, LEDGER[p], n === 3 ? st(0.56, 0.64) : LEDGER[n], tr);
    const spray1 = carry(cv, 11, n, LEDGER[p], n === 3 ? st(0.7, 0.82) : LEDGER[n], tr);
    const news = carry(cv, 6, n, NEWS_ON[p], n === 4 ? st(0.7, 0.8) : NEWS_ON[n], tr);
    const cov = carry(cv, 7, n, COVENANT[p], COVENANT[n] && !COVENANT[p] ? st(0.5, 0.62) : COVENANT[n], tr);
    const paperNew = PAPER_ON[n] && !PAPER_ON[p];
    const paper = carry(cv, 8, n, PAPER_ON[p], paperNew ? st(0.08, 0.2) : PAPER_ON[n], tr);
    const stamp = carry(cv, 12, n, PAPER_ON[p], paperNew ? st(0.62, 0.7) : PAPER_ON[n], tr);
    const locke = carry(cv, 9, n, LOCKE[p], LOCKE[n] && !LOCKE[p] ? st(0.56, 0.68) : LOCKE[n], tr);
    // the lights: green while there is order, dark once it goes, red in the war of all
    const dead = carry(cv, 10, n, NATURE[p] > 0 ? 1 : 0, n === 2 ? st(0.32, 0.4) : NATURE[n] > 0 ? 1 : 0, tr);

    // ── the officer comes down the road on the covenant beat ────────────────
    // He is posed where he will stand, and the whole figure is carried along the
    // lane and scaled for its depth (`osc`, drawn by the wrapper in the render):
    // a figure far down the street is small and high, and grows as he walks up it.
    const arriving = OFFICER[n] === 1 && OFFICER[p] === 0;
    const walkDur = moveTr(0, OFF_STRIDE, TR);
    const walkU = arriving ? clamp01(b / walkDur) : 1;
    // perspective: his size is the inverse of his distance down the street, so he
    // stays small a long way and then looms; the distance is eased out a little, or
    // the last few steps would have to cover half his growth and read as a sprint
    const nearU = 1 - (1 - walkU) * (1 - walkU);
    const osc = arriving ? 1 / lerp(1 / OFF_S0, 1, nearU) : 1;
    let offS = travelStance(arriving ? 0 : OFF_STRIDE, OFF_STRIDE, stand(t), officerPose(t), officerPose(t), ease01(walkU), WALK, 3);
    const offX = lerp(OFF_WAIT, OFF_BOX, auth);
    const offGY = GROUND - BOX.h * auth;
    const feetX = LANE_X + LANE_W * osc;
    const feetY = STREET.far + (GROUND - STREET.far) * osc;
    const offHeadX = arriving ? feetX : offX;
    const offHeadY = arriving ? feetY - 92 * osc : offGY - 92;
    // He faces the street, and turns round to Locke's poster when it goes up in the
    // window behind him (b9); he stays turned to it for the question after.
    const lockeTurn = n === 9 ? st(0.54, 0.62) : n > 9 ? 1 : 0;
    // walking up the lane he faces the way he walks (C18), then turns to the street
    const walkDir = arriving ? (b < walkDur ? 1 : 1 - 2 * ease01(clamp01((b - walkDur) / 0.36))) : -1;
    const offDir = carry(cv, 13, n, n > 9 ? 1 : -1, walkDir + 2 * lockeTurn, tr);
    // the baton pointed at the contract's stamp as it goes on (b8)
    const pointStamp = carry(cv, 21, n, 0, paperNew ? bp(0.6, 0.68, 0.88) : 0, tr);
    offS = pointStamp > 0
      ? reachHandTo(offS, { x: offX, groundY: offGY, k: K_FIG, dir: -1 }, 1, 22, 452, pointStamp)
      : offS;
    // a nod to the subjects as they bow (b9)
    offS = { ...offS, neck: offS.neck - 0.3 * carry(cv, 22, n, 0, BOW[n] && !BOW[p] ? bp(0.12, 0.22, 0.4) : 0, tr) };

    // ── WHERE THE OFFICER LOOKS (attend.ts) ───────────────────────────────────
    // At the brawl as he walks up to it, at the banner's new line as it is named, at
    // the box he will stand on; at the contract going up on the light pole and its
    // stamp; at the subjects as they bow, and round at Locke's poster — and at nothing
    // (weight 0) once each is over. Before b5 he is not on the street at all.
    const brawlX = (CIT_X[1] + CIT_X[2]) / 2;
    const LK = arriving ? [0.05, brawlX, CIT_HEAD + 10, 1, L * 0.5, 200, 324, 0.9, L * 0.78, BOX.cx, GROUND - BOX.h, 0.9, L * 0.96, 0, 0, 0]
      : n === 6 ? [0.1, (CIT_X[0] + CIT_X[1]) / 2, CIT_HEAD, 0.7, 2.6, 0, 0, 0]
      : Q1[n] ? [0.1, BOX.cx, GROUND - BOX.h, 0.6, 1.6, 0, 0, 0]
      : paperNew ? [L * 0.1, 34, 436, 1, L * 0.62, 22, 452, 1, L * 0.92, 0, 0, 0]
      : n === 9 ? [L * 0.08, CIT_X[1], CIT_HEAD + 20, 0.9, L * 0.56, 311, 367, 1, L * 0.95, 0, 0, 0]
      : reacting ? [0.3, BOX.cx, GROUND - BOX.h, 0.5]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);
    const offB = lookPose(
      offS, offX, offGY, K_FIG, offDir, 1,
      carry(cv, 14, n, lk.x, lk.x, tr), carry(cv, 15, n, lk.y, lk.y, tr), carry(cv, 16, n, 0, lk.w, tr),
    );
    // before he is on the street, and while he is far down it, his head is not where
    // his pose says, so no thought is hung on it
    const off = hideLeadWhile(offB, !OFFICER[n] || osc < 0.98);

    // ── the neighbours ────────────────────────────────────────────────────────
    const lookKeys = CIT_LOOK[n];
    const from = (k: number) => {
      'worklet';
      return n > 0 ? TURN_END[p][k] : MIDDLE[k];
    };
    const dv0 = carry(cv, 17, n, from(0), turnNow(TURNS[n], from(0), 0, b, L), tr);
    const dv1 = carry(cv, 18, n, from(1), turnNow(TURNS[n], from(1), 1, b, L), tr);
    const dv2 = carry(cv, 19, n, from(2), turnNow(TURNS[n], from(2), 2, b, L), tr);
    const dv3 = carry(cv, 20, n, from(3), turnNow(TURNS[n], from(3), 3, b, L), tr);
    const cit = (k: number, held: typeof held0, dv: number): Bundle => {
      'worklet';
      const dir = dv < 0 ? -1 : 1;
      let live = mixStance(melee(t, k), calm(t, k, bow), 1 - fight);
      // squared up in pairs: each steps back from his partner as the fight builds, and
      // only lunges a third as far, so two fighters never run into one body
      const x = CIT_X[k] + ((live.adv ?? 0) * 0.35 - 7) * dir * fight;
      // what he is looking at — a point, his partner's head, the officer's, or his
      // shop's words — resolved into attend.ts keys and eased between like the lead's
      const keys: number[] = [];
      for (let j = 0; j + 3 < lookKeys.length; j += 4) {
        const code = lookKeys[j + 1];
        keys.push(
          lookKeys[j] * L,
          code === -1 ? CIT_X[k + (k % 2 === 0 ? 1 : -1)] : code === -2 ? offHeadX : code === -3 ? SHOP_MID[k < 2 ? 0 : 1] : code,
          code === -1 ? CIT_HEAD : code === -2 ? offHeadY : lookKeys[j + 2],
          lookKeys[j + 3] * (code === -2 && !OFFICER[n] ? 0 : 1),
        );
      }
      // the look is laid on the living stance BEFORE the hold, so a tap mid-look is
      // blended out of what was on screen like everything else he is doing
      const lkN = attendAt(keys, b, 0, 0, 0);
      const gw = lkN.w * (1 - bow * 0.9);
      if (gw > 0.01) {
        const g = gazeAt(live, x, GROUND, CIT_K, dir, lkN.x, lkN.y, gw);
        live = { ...g, tilt: g.tilt + (g.neck - live.neck) * 0.5 };
      }
      const s = keepHeld(held, mixStance(carryFrom(held, n, live), live, tr));
      return pose(s, x, GROUND, CIT_K, dv, 1);
    };

    return {
      c0: cit(0, held0, dv0), c1: cit(1, held1, dv1), c2: cit(2, held2, dv2), c3: cit(3, held3, dv3),
      off, osc, feetX, feetY,
      auth, nature, fight,
      banner, plate, spray0, spray1, news, cov, paper, stamp, locke, dead,
      t,
    };
  });

  const DC0 = useDerivedValue<Bundle>(() => SCENE.value.c0);
  const DC1 = useDerivedValue<Bundle>(() => SCENE.value.c1);
  const DC2 = useDerivedValue<Bundle>(() => SCENE.value.c2);
  const DC3 = useDerivedValue<Bundle>(() => SCENE.value.c3);
  const DOff = useDerivedValue<Bundle>(() => SCENE.value.off);
  // the officer's depth on the road: his standing spot is carried to his feet on the
  // lane and scaled about them, figure and baton together
  const depth = useAnimatedStyle(() => {
    const sc = SCENE.value.osc;
    return {
      transform: [
        { translateX: SCENE.value.feetX }, { translateY: SCENE.value.feetY },
        { scale: sc },
        { translateX: -OFF_WAIT }, { translateY: -GROUND },
      ],
    };
  });
  const baton = useAnimatedStyle(() => {
    const w = DOff.value.wrR;
    return { transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }] };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.street} pointerEvents="none" />
      <SetArt parts={FAR_ART} tone={WALL} />
      <SetArt parts={PAVE_ART} tone={WALL} />
      <SetArt parts={ROAD_ART} tone={DUSK} />
      <ObjectArt parts={SHOP_ART[0]} tone={WALL} />
      <ObjectArt parts={SHOP_ART[1]} tone={WALL} />
      <Shutters S={SCENE} on={on} />
      <Locke S={SCENE} on={on} />
      <Banner S={SCENE} on={on} />
      <ObjectArt parts={POLE_ART} tone={WOOD} />
      <Lamps S={SCENE} />
      <ObjectArt parts={HOOD_ART} tone={WOOD} />
      <Plate S={SCENE} on={on} />
      <Contract S={SCENE} on={on} />
      <ObjectArt parts={NEWS_ART} tone={WOOD} />
      <News S={SCENE} on={on} />
      <View style={styles.ground} pointerEvents="none" />
      <ObjectArt parts={BOX_ART} tone={WOOD} />
      <Stickman role="crowd" D={DC0} k={CIT_K} />
      <Stickman role="crowd" D={DC1} k={CIT_K} />
      <Stickman role="crowd" D={DC2} k={CIT_K} />
      <Stickman role="crowd" D={DC3} k={CIT_K} />
      {on(OFFICER) ? (
        <Animated.View style={[styles.depth, depth]} pointerEvents="none">
          <Stickman D={DOff} k={K_FIG} />
          <Animated.View style={[styles.rider, baton]} pointerEvents="none">
            <View style={styles.baton} />
            <View style={styles.batonGrip} />
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── the banner across the street ────────────────────────────────────────────

function Banner({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.banner, transform: [{ scaleX: 0.6 + 0.4 * S.value.banner }] }));
  const cov = useAnimatedStyle(() => ({ opacity: S.value.cov, transform: [{ translateY: (1 - S.value.cov) * -4 }] }));
  if (!on(BANNER)) return null;
  return (
    <Animated.View style={[styles.bannerWrap, st]} pointerEvents="none">
      <View style={[styles.bannerCord, { left: -20, transform: [{ rotate: '-14deg' }] }]} />
      <View style={[styles.bannerCord, { right: -20, transform: [{ rotate: '14deg' }] }]} />
      <View style={styles.banner}>
        <Text style={styles.bannerText} numberOfLines={1}>WHAT GIVES A STATE THE RIGHT TO RULE?</Text>
        {on(COVENANT) ? (
          <Animated.Text style={[styles.bannerSub, cov]} numberOfLines={1}>A COVENANT: ONE POWER KEEPS THE PEACE</Animated.Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

// ── the shutters, and what is sprayed on them ───────────────────────────────

const SPRAY = [['SOLITARY', 'POOR'], ['NASTY', 'BRUTISH', 'SHORT']];

function Shutters({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const h = SHUTTER.bottom - SHUTTER.top;
  const drop = useAnimatedStyle(() => ({ height: h * clamp01(S.value.nature * 1.4) * (1 - S.value.auth) }));
  const spray0 = useAnimatedStyle(() => ({ opacity: S.value.spray0 }));
  const spray1 = useAnimatedStyle(() => ({ opacity: S.value.spray1 }));
  return (
    <>
      {SHOPS.map((sh, k) => (
        <View key={k} style={[styles.shutterClip, { left: sh.x0 + 4, width: sh.x1 - sh.x0 - 8 }]} pointerEvents="none">
          <Animated.View style={[styles.shutter, drop]}>
            {/* the words ride the shutter, anchored to its foot, so rolling it up takes them away */}
            {[0, 1, 2, 3, 4, 5].map((r) => <View key={r} style={[styles.slat, { bottom: 6 + r * 16 }]} />)}
            {on(SPRAY_ON) ? (
              <Animated.View style={[styles.sprayBox, k === 0 ? spray0 : spray1]}>
                {SPRAY[k].map((w) => <Text key={w} style={styles.spray} numberOfLines={1}>{w}</Text>)}
              </Animated.View>
            ) : null}
          </Animated.View>
        </View>
      ))}
    </>
  );
}

// ── the traffic light: the gauge ────────────────────────────────────────────

function Lamps({ S }: { S: SharedValue<any> }) {
  const red = useAnimatedStyle(() => ({ opacity: 0.18 + 0.82 * S.value.fight * S.value.dead }));
  const amber = useAnimatedStyle(() => {
    const blink = S.value.dead * (1 - S.value.fight) * (1 - S.value.auth) * (Math.sin(S.value.t * 5) > 0 ? 1 : 0);
    return { opacity: 0.18 + 0.7 * blink };
  });
  const green = useAnimatedStyle(() => ({ opacity: 0.18 + 0.82 * Math.max(1 - S.value.dead, S.value.auth) }));
  const cx = LIGHT.x - LAMP_R;
  const y0 = LIGHT.headTop + 6;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[0, 1, 2].map((k) => <View key={k} style={[styles.lampOff, { left: cx, top: y0 + k * 14 }]} />)}
      <Animated.View style={[styles.lamp, { left: cx, top: y0, backgroundColor: EMBER }, red]} />
      <Animated.View style={[styles.lamp, { left: cx, top: y0 + 14, backgroundColor: PAPER_LIT }, amber]} />
      <Animated.View style={[styles.lamp, { left: cx, top: y0 + 28, backgroundColor: SAGE }, green]} />
    </View>
  );
}

// ── the street-name plate and the notice on the light pole ─────────────────

function Plate({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.plate, transform: [{ scaleX: S.value.plate }] }));
  if (!on(PLATE)) return null;
  return (
    <Animated.View style={[styles.plate, st]} pointerEvents="none">
      <Text style={styles.plateText} numberOfLines={1}>STATE OF</Text>
      <Text style={styles.plateText} numberOfLines={1}>NATURE</Text>
    </Animated.View>
  );
}

function Contract({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.paper, transform: [{ rotate: '-3deg' }, { translateY: (1 - S.value.paper) * -6 }] }));
  // the stamp comes down on it a beat later, struck rather than faded (the baton points at it)
  const stamp = useAnimatedStyle(() => ({ opacity: S.value.stamp, transform: [{ rotate: '-8deg' }, { scale: 1.5 - 0.5 * S.value.stamp }] }));
  if (!on(PAPER_ON)) return null;
  return (
    <Animated.View style={[styles.contract, st]} pointerEvents="none">
      <Text style={styles.contractHead} numberOfLines={1}>CONTRACT</Text>
      <View style={styles.signLine} />
      <View style={styles.signLine} />
      <Animated.View style={[styles.contractStamp, stamp]}>
        <Text style={styles.stampText} numberOfLines={1}>A TEST</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── the newsboard on the right pavement ─────────────────────────────────────

function News({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.news, transform: [{ translateY: (1 - S.value.news) * 6 }] }));
  return (
    <View style={styles.newsBoard} pointerEvents="none">
      <Text style={styles.newsHead} numberOfLines={1}>DAILY NEWS</Text>
      {on(NEWS_ON) ? (
        <Animated.View style={st}>
          <Text style={styles.newsText} numberOfLines={1}>WAR OF</Text>
          <Text style={styles.newsText} numberOfLines={1}>EVERY MAN</Text>
          <Text style={styles.newsText} numberOfLines={1}>AGAINST</Text>
          <Text style={styles.newsText} numberOfLines={1}>EVERY MAN</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── Locke's poster in the shop window ───────────────────────────────────────

function Locke({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.locke, transform: [{ rotate: '2deg' }, { scale: 0.9 + 0.1 * S.value.locke }] }));
  if (!on(LOCKE)) return null;
  return (
    <Animated.View style={[styles.locke, st]} pointerEvents="none">
      <Text style={styles.lockeHead} numberOfLines={1}>LOCKE</Text>
      <Text style={styles.lockeText} numberOfLines={1}>A PEOPLE</Text>
      <Text style={styles.lockeText} numberOfLines={1}>MAY RESIST</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  street: {
    position: 'absolute', left: SHOPS[0].x1, top: 330, width: SHOPS[1].x0 - SHOPS[0].x1, height: ROAD_Y - 330,
    backgroundColor: DUSK.STONE,
  },

  bannerWrap: { position: 'absolute', left: 64, top: 298, width: 272 },
  bannerCord: { position: 'absolute', top: 8, width: 26, height: 1.5, backgroundColor: INK },
  banner: {
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', paddingVertical: 3,
  },
  bannerText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  bannerSub: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.4, color: INK, includeFontPadding: false,
    textDecorationLine: 'underline', textDecorationColor: EMBER, marginTop: 1,
  },

  shutterClip: { position: 'absolute', top: SHUTTER.top, height: SHUTTER.bottom - SHUTTER.top, overflow: 'hidden' },
  shutter: {
    position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: PLATE_FACE,
    borderWidth: 1.5, borderColor: INK, borderTopWidth: 0, borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
    overflow: 'hidden', alignItems: 'center',
  },
  slat: { position: 'absolute', left: 3, right: 3, height: 1, backgroundColor: SHADE },
  sprayBox: { position: 'absolute', bottom: 22, alignItems: 'center', paddingHorizontal: 4, backgroundColor: PLATE_FACE },
  spray: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 13, letterSpacing: 0.6, color: DEEP, includeFontPadding: false,
  },

  lampOff: {
    position: 'absolute', width: LAMP_R * 2, height: LAMP_R * 2, borderRadius: LAMP_R, backgroundColor: DEEP,
  },
  lamp: { position: 'absolute', width: LAMP_R * 2, height: LAMP_R * 2, borderRadius: LAMP_R },

  plate: {
    position: 'absolute', left: LIGHT.x - 14, top: LIGHT.headTop + LIGHT.headH + 6, width: 58, paddingVertical: 2,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: TEAL, alignItems: 'center', transformOrigin: '0% 50%',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.5, color: PAPER_LIT, includeFontPadding: false,
  },
  contract: {
    position: 'absolute', left: 0, top: 414, width: 68, height: 44, paddingTop: 3, paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  contractHead: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  signLine: { height: 1.5, backgroundColor: SHADE, marginTop: 5 },
  contractStamp: {
    position: 'absolute', left: 6, bottom: 3, paddingHorizontal: 3, borderWidth: 1.5, borderColor: EMBER, borderRadius: 2,
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  newsBoard: {
    position: 'absolute', left: NEWS.x, top: NEWS.y, width: NEWS.w, height: 58, paddingTop: 2,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP, alignItems: 'center',
  },
  newsHead: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.6, color: INK, includeFontPadding: false,
    borderBottomWidth: 1, borderBottomColor: INK, marginBottom: 1,
  },
  newsText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.1, color: INK, includeFontPadding: false,
    textAlign: 'center',
  },

  locke: {
    position: 'absolute', left: 268, top: 352, width: 86, paddingVertical: 3,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, alignItems: 'center',
  },
  lockeHead: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 11, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
  lockeText: {
    fontFamily: 'Inter_500Medium', fontSize: 9, lineHeight: 11, color: INK, includeFontPadding: false,
  },

  rider: { position: 'absolute', left: 0, top: 0 },
  depth: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  baton: { position: 'absolute', left: -2, top: -26, width: 4, height: 26, borderRadius: 2, backgroundColor: INK },
  batonGrip: { position: 'absolute', left: -4, top: -3, width: 8, height: 3, borderRadius: 1.5, backgroundColor: EMBER },
});

export function PoliticalLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={PoliticalScene} band={[290, 514]} camera={CAM} />;
}
