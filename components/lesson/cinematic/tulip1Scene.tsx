import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './tulip1Script';
import {
  U, WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { UNIT2_OUTFITS, WEAR, breeches, coat, sleeves, front, knitCap, dressed } from './garb';

// ─────────────────────────────────────────────────────────────────────────────
// economics-tulips-1, "The Flower That Broke" — the first lesson of Economics' second unit
// (LESSON_RULES group AW): one true story, told in costume. THE PLAIN ONE IS CAROLUS
// CLUSIUS, in a plum doublet and ruff; the top hat plays Dirck Cluyt the apothecary (black
// doublet, ruff, tall hat), who digs; the cap a garden boy in a work smock and a soft cap.
//
// A DIALOGUE lesson (group AP): people talk and nobody narrates.
// AT2: silent extras: two Leiden merchants in tall hats who peer over the garden wall, the
// crowd at the gate who want to buy. Each bobs up on tiptoe at his own moment, one waves a
// purse; they sink out of sight when Clusius refuses, and rise again for the striped one.
// They stand apart so no two fuse.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// tulip1.mjs) laid in ONE WORLD 800 wide: the garden beds at x 0–400, the potting corner by
// the street gate at x 400–800. The scene's own camera is the world's translation, `cam`:
// 0 among the beds, −400 in the corner, cut under a pale haze at the start of `broken`. The
// seasons turn under a haze at `bloom` (autumn into spring: the tree leafs, the beds flower)
// and the night is the same garden drawn in the night's light and laid over the day, switched
// under a dark veil at `theft`. Figures and moving things are posed in SCREEN space.
//
//   THE BEDS, far → near: an autumn sky; the AMBULACRUM, the long low gallery on round
//   arches with its dormers and lantern (−4–234); a tree; the stepped gables of the town over
//   the side WALL (coping 400) with its arched GATE (302–336), which creaks open in b0; the
//   back walk and its box knots; BED 1 (8–178) and the best BED 2 (194–342), soil 470–486
//   behind a clipped box hedge; the gravel walk (feet at 500). The WHEELBARROW (wheel at
//   316) with two crates of bulbs in straw, the top one's lid on a hinge.
//   BY NIGHT: the moon, a lit window in a gable, bed 1 in flower in the dark, bed 2 pocked
//   with empty holes and heaped soil, the gate shut, the thieves' LADDER against the wall
//   (318→302 up to the coping), the boy's LANTERN and the light it lays on the gravel.
//   THE CORNER (its own x 0–400): a spring sky, the Pieterskerk's nave and tower and three
//   gables over the wall, a cherry in blossom, the STREET GATE (330–366) with a climbing rose;
//   BED F in full flower (0–158) with the BROKEN TULIP at 124 standing out red-on-white; the
//   POTTING BENCH (168–272, top 468, hip high) with the three tagged pots of Q1 (200 red, 228
//   bare, 256 striped); the PLANK on two crates by the gate (298–394, top 472) with the three
//   flowering pots of Q2 (314 red, 346 striped, 378 yellow); the brass PRICE TAG.
//
//   b0   the gate creaks open (2.2s); the boy wheels the barrow in (wheel 0.6s), sets it
//        down (crate 4.0s) and tugs the straw off the top crate (paper 5.2s); Clusius walks
//        in behind him and turns to the garden: a hand out over the beds, then on his chest.
//        Cluyt is bent over bed 1, two pushes of the spade; he looks up.
//   b1   Cluyt straightens, plants his spade and leans on it, glaring at the crates.
//   b2   Clusius lifts the crate lid (crate 0.3s), holds up a brown bulb like a jewel, turns
//        to show it to Cluyt.   b3  the boy walks to bed 2, kneels and pushes a label into it.
//   b4   Clusius taps a folded letter out of his doublet, twice, chin up.
//   b5   Cluyt drops a bulb into a hole in bed 1 (clay 1.0s) and pats the soil flat, twice.
//   b6   the haze; spring: the beds flower, the tree is in leaf; the boy runs in from the
//        gate and points back at the hats bobbing over the wall; a purse is waved.
//   b7   Clusius walks between the beds and the gate and folds his arms; the hats sink.
//   b8   the dark; night: the boy holds his lantern up by the wall (creak 0.4s), Cluyt by the
//        ladder, Clusius hurries in from the left.
//   b9   Clusius kneels by the holes and lifts a handful of loose soil; it crumbles.
//   b10  Cluyt grips the ladder (creak 0.6s), looks up over the wall toward the town, shrugs.
//   b11  the haze; the corner: the boy points at the one striped tulip in the bed.
//   b12  Clusius bends close to it and turns a leaf in his fingers.
//   b13  the boy goes to the bench; Cluyt digs the striped tulip up, two pushes (clay 0.5s),
//        and holds it high: the bulb, and its two tiny offsets; he leans his spade on the hedge.
//   b14  Q1 THE NEXT SPRING.
//   b15  the striped pot blooms striped (clay 0.3s); the boy lifts it up in both hands.
//   b16  Cluyt plucks a tiny green aphid off a leaf and holds it up to the light; the boy
//        sets the pot back on the bench.          b17  Q2 PIN THE PRICE.
//   b18  Clusius turns to the flowers, hand on heart.
//   b19  Cluyt gives a dry tilt of the head; a single striped bulb on a velvet cloth appears
//        on the bench, and he opens a hand to it.   b20  the boy counts on his fingers.
//   b21  at rest.
//
// Every figure has its own phase (N22), faces whom he talks to, never walks backwards
// (C18), and every hand that moves holds, digs, lifts, taps, points, plucks or counts.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('economics');
const W = NATURAL;
const { SHADE } = TONE;
const TR = 0.85;
const K = K_FIG * 0.95;
const KS = K / 0.85;
const G = GROUND;
/** The merchants over the wall, a little further off. */
const KE = K * 0.86;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.0s) and the line together. */
const LINES = [11.72, 3.91, 6.09, 4.03, 5.36, 4.8, 4.01, 4.01, 4.33, 4.99, 5.45, 4.37, 5.72, 4.69, 0, 3.74, 6.92, 0, 4.58, 8.97, 2.8, 0, 0];

const TALK = 167;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const ARRIVE = at('arrive');
const DIG = at('dig');
const UNPACK = at('unpack');
const LABEL = at('label');
const ENVOY = at('envoy');
const PLANT = at('plant');
const BLOOM = at('bloom');
const REFUSE = at('refuse');
const THEFT = at('theft');
const HOLES = at('holes');
const SHRUG = at('shrug');
const BROKEN = at('broken');
const INSPECT = at('inspect');
const SCARCE = at('scarce');
const REVEAL = at('reveal');
const VIRUS = at('virus');
const LEGACY = at('legacy');
const AFTER = at('after');
const WAGE = at('wage');
const Q1 = BEATS.map((b) => (b.pots ? 1 : 0));
const Q2 = BEATS.map((b) => (b.tags ? 1 : 0));
const Q1N = Q1.indexOf(1);
const Q2N = Q2.indexOf(1);
const PLACE = BEATS.map((b) => b.place ?? 0);
/** Who speaks each beat: 1 Clusius, 2 Cluyt, 3 the boy. */
const SPK = BEATS.map((b) => (b.speaker === 'plain' ? 1 : b.speaker === 'tophat' ? 2 : b.speaker === 'cap' ? 3 : 0));

const CUT_S = 0.4;
const HX = 400;

// ── where everybody is at the START of each beat (WORLD x; the corner is x + 400) ──
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));
const C_X = per((n) => (n === ARRIVE ? 450 : n < BLOOM ? 290 : n === BLOOM || n === REFUSE ? 230 : n === THEFT ? -30
  : n === HOLES ? 150 : n === SHRUG ? 206 : HX + 156));
const C_D = [-1, -1, -1, -1, -1, -1, 1, 1, 1, 1, 1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1];
const H_X = per((n) => (n < THEFT ? 56 : n <= SHRUG ? 262 : n <= SCARCE ? HX + 40 : HX + 100));
const H_D = per((n) => (n === SHRUG ? -1 : 1));
const P_X = per((n) => (n === ARRIVE ? 520 : n <= LABEL ? 378 : n < BLOOM ? 240 : n === BLOOM ? 440
  : n < BROKEN ? 352 : n <= SCARCE ? HX + 92 : n === Q1N || n === REVEAL ? HX + 286 : HX + 276));
const P_D = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 1, 1, -1, -1, -1, -1, 1, -1, -1, -1, -1];

// ── things ──────────────────────────────────────────────────────────────────
const WHEEL = 316;
const BED_TULIP = { x: HX + 124, y: 478 };
const POTS1 = [
  { id: 'pRed', x: HX + 200, tag: 'tulip1-tag-red' },
  { id: 'pBare', x: HX + 228, tag: 'tulip1-tag-bare' },
  { id: 'pStriped', x: HX + 256, tag: 'tulip1-tag-striped' },
] as const;
const POTS2 = [
  { id: 'tRed', x: HX + 314, fl: 'tulip1-fl-red' },
  { id: 'tStriped', x: HX + 346, fl: 'tulip1-fl-striped' },
  { id: 'tYellow', x: HX + 378, fl: 'tulip1-fl-yellow' },
] as const;
const BENCH_TOP = 468;
const PLANK_TOP = 472;
/** Where Cluyt leans his spade on the hedge in the corner (b13 on). */
const SPADE_REST = { gx: HX + 82, gy: 452, tx: HX + 76, ty: 499 };
/** The label the boy pushes into bed 2. */
const LABEL_AT = { x: 224, y: 486 };

const PICK: Record<string, number> = { pRed: 1, pBare: 2, pStriped: 3, tRed: 4, tStriped: 5, tYellow: 6 };

/** The garden boy: a work smock over breeches, a soft cap. */
const BOY = dressed('gardenBoy', 'a garden boy: work smock and soft cap',
  [...breeches(WEAR.breeches), ...coat(WEAR.smock, 'thigh'), ...sleeves(WEAR.smock), front(WEAR.smockShade, 3, 8)], knitCap(WEAR.hatBrown));
const CLUSIUS = UNIT2_OUTFITS.burgherBare;
const CLUYT = UNIT2_OUTFITS.burgher;
/** The second merchant: a brown doublet under the same tall hat. */
const MERCHANT2 = dressed('merchantBrown', 'a merchant: tweed doublet, tall hat',
  [...breeches(WEAR.breeches), ...coat(WEAR.tweed, 'hip'), ...sleeves(WEAR.tweed)], UNIT2_OUTFITS.burgher.head);
/** The head pieces each wears (the tall hat; the boy's soft cap). */
const CLUYT_HEAD = UNIT2_OUTFITS.burgher.head;
const BOY_HEAD = BOY.head;
const MERCHANT_HEAD = MERCHANT2.head;

function S0(sec: number): number {
  'worklet';
  return sec / 11.72;
}
function sm(u: number): number {
  'worklet';
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
type Key = readonly [number, number, number, number];
function keyAt(keys: readonly Key[], u: number) {
  'worklet';
  const first = keys[0];
  if (u <= first[0]) return { lx: first[1], ly: first[2], w: first[3] };
  for (let k = 1; k < keys.length; k += 1) {
    const z = keys[k];
    if (u <= z[0]) {
      const a = keys[k - 1];
      const s = sm((u - a[0]) / Math.max(1e-6, z[0] - a[0]));
      return { lx: lerp(a[1], z[1], s), ly: lerp(a[2], z[2], s), w: lerp(a[3], z[3], s) };
    }
  }
  const e = keys[keys.length - 1];
  return { lx: e[1], ly: e[2], w: e[3] };
}
function hand(s: Stance, x: number, g: number, d: number, which: 1 | -1, lx: number, ly: number, w: number, k: number): Stance {
  'worklet';
  const dir = d < 0 ? -1 : 1;
  const ks = k / 0.85;
  return w <= 0.001 ? s : reachHandTo(s, { x, groundY: g, k, dir }, which, x + lx * ks * dir, g - ly * ks, w);
}
function keyed(s: Stance, keys: readonly Key[] | null, u: number, x: number, g: number, d: number, which: 1 | -1, k: number): Stance {
  'worklet';
  if (!keys || keys.length === 0) return s;
  const q = keyAt(keys, u);
  return hand(s, x, g, d, which, q.lx, q.ly, q.w, k);
}
/** A body leant (+ forward) and a head tipped (+ down); the hands go where the shoulders go. */
function leanOf(s: Stance, tilt: number, neck: number): Stance {
  'worklet';
  if (tilt === 0 && neck === 0) return s;
  const t0 = s.tilt;
  const t1 = s.tilt - tilt;
  const dx = -U.spine * (Math.sin(t1) - Math.sin(t0));
  const dy = -U.spine * (Math.cos(t1) - Math.cos(t0));
  return {
    ...s, tilt: t1, neck: s.neck - neck,
    fistL: { x: s.fistL.x + dx, y: s.fistL.y + dy },
    fistR: { x: s.fistR.x + dx, y: s.fistR.y + dy },
  };
}
function hd(b: number, L: number, a: number, m: number, z0: number, z1: number): number {
  'worklet';
  return stage(b, L, a, m) * (1 - stage(b, L, z0, z1));
}
function hLive(code: number, t: number, bt: number, phase: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt, phase);
}
function hHold(code: number, t: number, phase: number): Stance {
  'worklet';
  return emoteStill(code, t, phase);
}
const TURN_S = 0.36;
function walkOf(src: number, to: number, start: number, faceSrc: number, b: number) {
  'worklet';
  const d = Math.abs(to - src);
  if (d <= 1) return { x: to, x0: to, x1: to, u: 1, walking: false, ws: 0, we: 0, wd: 0 };
  const wd = to > src ? 1 : -1;
  const ws = (faceSrc < 0 ? -1 : 1) !== wd && start < TURN_S - 0.04 ? TURN_S - 0.04 : start;
  const we = ws + moveTr(src, to, TR);
  const lin = clamp01((b - ws) / (we - ws));
  const e = ease01(lin);
  return { x: lerp(src, to, e), x0: src, x1: to, u: e, walking: b >= ws && lin < 1, ws, we, wd };
}
type Walk = ReturnType<typeof walkOf>;
function faceOf(src: number, turns: readonly (readonly number[])[], b: number, L: number, w: Walk) {
  'worklet';
  const ts: number[] = [];
  const ds: number[] = [];
  for (let k = 0; k < turns.length; k += 1) {
    let tt = turns[k][0] * L;
    const dd = turns[k][1];
    if (w.wd !== 0 && dd !== w.wd && tt >= w.ws - TURN_S - 0.05 && tt < w.we) tt = w.we;
    ts.push(tt);
    ds.push(dd);
  }
  if (w.wd !== 0) {
    ts.push(Math.max(0, w.ws - TURN_S));
    ds.push(w.wd);
  }
  for (let i = 1; i < ts.length; i += 1) {
    for (let j = i; j > 0 && ts[j] < ts[j - 1]; j -= 1) {
      const t0 = ts[j]; ts[j] = ts[j - 1]; ts[j - 1] = t0;
      const d0 = ds[j]; ds[j] = ds[j - 1]; ds[j - 1] = d0;
    }
  }
  let from = src;
  let d = src;
  for (let k = 0; k < ts.length; k += 1) {
    if (b < ts[k]) break;
    d = facing(from, ds[k], b - ts[k], TURN_S);
    from = ds[k];
  }
  return d;
}
function bodyOf(w: Walk, code: number, t: number, b: number, phase: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(code, t, phase), hHold(code, t, phase), hLive(code, t, b, phase), w.u, WALK, 0)
    : hLive(code, t, b, phase);
}
function jointOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/** Kneeling on one knee, the body leant toward the work, the hands on their keys. */
function kneelOf(s: Stance, kn: number, t: number, phase: number, R: readonly Key[] | null, L: readonly Key[] | null, u: number,
  x: number, d: number, lean: number): Stance {
  'worklet';
  if (kn <= 0.001) return s;
  let k = leanOf(postureStill(1, t, phase), lean * kn, 0.1 * kn);
  k = keyed(k, R, u, x, G, d, 1, K);
  k = keyed(k, L, u, x, G, d, -1, K);
  return mixStance(s, k, kn);
}

export default function Tulip1Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldC = useHeld();
  const heldH = useHeld();
  const heldP = useHeld();
  const heldE1 = useHeld();
  const heldE2 = useHeld();
  const cv = useCarry(15);
  const on = useLinger(i);
  const pk = useSharedValue(0);
  useEffect(() => {
    pk.value = picked ? (PICK[picked] ?? 0) : 0;
  }, [picked, pk]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const b0 = bt.value;
    const t = clock.value;
    const seenN = carrySource(cv, 0, n, n - 1);
    carry(cv, 0, n, n, n, 1);
    const back = seenN > n;
    const cutBeat = n === BLOOM || n === THEFT || n === BROKEN;
    const pre = cutBeat && !back && b0 < CUT_S;
    const nv = pre ? n - 1 : n;
    const b = pre ? 999 : b0;
    const tr = ease01(b0 / TR);
    const L = lineOf(LINES, nv);
    const u = b / L;
    const st = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a, z);
    };
    const bump = (a: number, m: number, z0: number, z1: number) => {
      'worklet';
      return hd(b, L, a, m, z0, z1);
    };
    const q = qv.value;
    const pc = pk.value;
    const ans = (code: number, Q: readonly number[]) => {
      'worklet';
      return Q[n] && pc === code ? q : 0;
    };
    const kept = (k: number, code: number, Q: readonly number[], QN: number) => {
      'worklet';
      return Q[n] ? ans(code, Q) : n > QN && carrySource(cv, k, n, 0) > 0.5 ? 1 : 0;
    };
    const keptTr = (Q: readonly number[]) => {
      'worklet';
      return Q[n] ? tr : 1;
    };
    const place = PLACE[nv];
    const cam = place === 2 ? -HX : 0;
    const night = place === 1 ? 1 : 0;
    const spring = place === 0 && nv >= BLOOM ? 1 : 0;
    const cut = cutBeat && !back ? stage(b0, 1, 0.06, CUT_S) * (1 - stage(b0, 1, CUT_S, CUT_S + 0.55)) : 0;
    const backVeil = back ? 1 - stage(b0, 1, 0, 0.45) : 0;
    const haze = n === BLOOM || n === BROKEN ? cut : 0;
    const dark = Math.max(n === THEFT ? cut : 0, backVeil);
    const fresh = back || (cutBeat && !pre);
    const src = (slot: number, table: readonly number[]) => {
      'worklet';
      return fresh ? table[nv] : carrySource(cv, slot, n, table[nv]);
    };
    const sp = (who: number) => {
      'worklet';
      return SPK[nv] === who;
    };

    // ══ CLUSIUS ══════════════════════════════════════════════════════════════
    const cxs = src(1, C_X);
    const cds = src(2, C_D);
    // a figure a quick tap left short of his mark walks the rest of the way first
    let cw: Walk = walkOf(cxs, C_X[nv], 0, cds, b);
    let cx = cxs;
    let cTurns: (readonly number[])[] = [[0, C_D[nv]]];
    let cKneel = 0;
    if (nv === ARRIVE) cw = walkOf(cxs, 290, 2.6, cds, b);
    if (nv === UNPACK) cTurns = [[0, -1], [0.04, 1], [0.6, -1]];
    if (nv === REFUSE) cw = walkOf(cxs, 300, 0.05 * L, cds, b);
    if (nv === THEFT && !pre) cw = walkOf(cxs, 150, 0.1 * L, 1, b);
    if (nv === HOLES) {
      cw = walkOf(cxs, 206, 0.04 * L, cds, b);
      cKneel = st(0.32, 0.46);
    }
    if (nv === SHRUG) cKneel = 1 - st(0.86, 0.98);
    if (nv === Q1N || nv === Q2N) cTurns = [[0, -1], [0.02, 1]];
    if (nv === VIRUS) cTurns = [[0, 1], [0.05, -1]];
    if (cw.wd !== 0) cx = cw.x;
    const cxS = carry(cv, 1, n, cx, cx, 1) + cam;
    const cd = carry(cv, 2, n, 0, faceOf(cds, cTurns, b, L, cw), 1);
    const cCode = sp(1) ? TALK : NOD;
    let sc = bodyOf(cw, cCode, t, b, 0);
    let cR: readonly Key[] | null = null;
    let cL: readonly Key[] | null = null;
    let cLean = 0;
    let cNeck = 0;
    if (nv === ARRIVE) {
      // a hand out over the garden, then to his chest
      cR = [[S0(6.4), 8, 44, 0], [S0(6.9), 26, 70, 1], [S0(9.2), 28, 72, 1], [S0(9.9), 4, 62, 1], [S0(11.4), 4, 62, 1]];
      cNeck = -0.14 * hd(b, 11.72, S0(6.6), S0(7.0), S0(9.4), S0(9.8));
    }
    if (nv === DIG) {
      cR = [[0, 4, 62, 1], [0.3, 8, 44, 0]];
      cNeck = -0.1 * bump(0.1, 0.2, 0.6, 0.8);
    }
    if (nv === UNPACK) {
      // the lid up, the bulb out, held high, turned to Cluyt
      cR = [[0, 8, 44, 0], [0.06, 32, 34, 1], [0.14, 30, 44, 1], [0.2, 30, 34, 1], [0.32, 18, 86, 1], [0.92, 20, 86, 1]];
      cLean = 0.34 * bump(0.04, 0.08, 0.16, 0.22);
      cNeck = -0.18 * bump(0.3, 0.38, 0.86, 0.96);
    }
    if (nv === LABEL) {
      cR = [[0, 20, 86, 1], [0.12, 6, 60, 1], [0.2, 8, 44, 0]];
      cNeck = 0.12 * st(0.4, 0.5);
    }
    if (nv === ENVOY) {
      // a folded letter out of his doublet, held up, tapped twice
      cL = [[0.05, 6, 44, 0], [0.12, 4, 60, 1], [0.24, 14, 66, 1], [0.86, 14, 66, 1], [0.95, 6, 44, 0]];
      cR = [[0.28, 8, 44, 0], [0.34, 14, 72, 1], [0.4, 16, 68, 1], [0.46, 14, 72, 1], [0.52, 16, 68, 1], [0.6, 8, 44, 0]];
      cNeck = -0.16 * bump(0.12, 0.22, 0.8, 0.92);
    }
    if (nv === PLANT) cNeck = 0.06 * bump(0.3, 0.4, 0.8, 0.9);
    if (nv === BLOOM && !pre) {
      cR = [[0.2, 8, 44, 0], [0.3, 4, 62, 1], [0.7, 4, 62, 1], [0.8, 8, 44, 0]];
      cNeck = -0.1 * bump(0.1, 0.2, 0.6, 0.7);
    }
    if (nv === REFUSE) {
      // arms folded across his chest, chin up
      cR = [[0.3, 8, 44, 0], [0.42, 6, 58, 1]];
      cL = [[0.3, 6, 44, 0], [0.44, 4, 56, 1]];
      cNeck = -0.18 * st(0.4, 0.5);
    }
    if (nv === HOLES) {
      // a handful of soil, lifted and let crumble
      cR = [[0.45, 10, 30, 0], [0.52, 18, 16, 1], [0.6, 18, 14, 1], [0.7, 16, 38, 1], [0.92, 16, 38, 1]];
      cNeck = 0.18 * st(0.4, 0.5) - 0.14 * bump(0.66, 0.74, 0.9, 1);
    }
    if (nv === SHRUG) {
      cR = [[0, 16, 38, 1], [0.2, 12, 30, 0.6]];
      cNeck = -0.22 * bump(0.25, 0.4, 0.75, 0.86);
    }
    if (nv === INSPECT) {
      // bent close to the broken tulip, a leaf turned in his fingers, twice
      cR = [[0.1, 8, 44, 0], [0.22, 24, 30, 1], [0.4, 26, 32, 1], [0.48, 24, 28, 1], [0.56, 26, 32, 1], [0.86, 24, 30, 1], [0.95, 8, 44, 0]];
      cLean = 0.42 * bump(0.1, 0.22, 0.86, 0.96);
      cNeck = 0.2 * bump(0.1, 0.22, 0.86, 0.96);
    }
    if (nv === SCARCE) cNeck = 0.06 * bump(0.4, 0.5, 0.8, 0.9) - 0.12 * bump(0.72, 0.8, 0.9, 1);
    if (nv === Q1N) {
      cR = [[0, 8, 44, 0], [0.1, 22, 56, 0.8]];
      cNeck = 0.14 * st(0.04, 0.14);
      const ok = ans(3, Q1);
      const no = ans(1, Q1) + ans(2, Q1);
      cNeck += -0.24 * ok - 0.14 * Math.sin(Math.PI * Math.min(1, no * 1.4));
      cLean += -0.06 * ok;
    }
    if (nv === REVEAL) cNeck = -0.12 * bump(0.3, 0.4, 0.8, 0.9);
    if (nv === VIRUS) cNeck = -0.1 * bump(0.45, 0.55, 0.85, 0.95);
    if (nv === Q2N) {
      cNeck = 0.06 * st(0.04, 0.14) - 0.18 * ans(5, Q2) + 0.1 * (ans(4, Q2) + ans(6, Q2));
    }
    if (nv === LEGACY) {
      cTurns = [[0, 1], [0.08, -1]];
      cR = [[0.3, 8, 44, 0], [0.42, 4, 62, 1], [0.95, 4, 62, 1]];
      cNeck = -0.16 * st(0.35, 0.45);
    }
    if (nv === AFTER) {
      cR = [[0, 4, 62, 1], [0.2, 8, 44, 0]];
      cNeck = 0.08 * bump(0.5, 0.6, 0.7, 0.8);
    }
    if (nv === WAGE) cNeck = -0.1 * bump(0.4, 0.5, 0.8, 0.9);
    sc = keyed(sc, cR, u, cxS, G, cd, 1, K);
    sc = keyed(sc, cL, u, cxS, G, cd, -1, K);
    sc = leanOf(sc, cLean, cNeck);
    sc = kneelOf(sc, cKneel, t, 0, cR, cL, u, cxS, cd, 0.3);
    const prevC = carryFrom(heldC, n, hHold(cCode, t, 0));
    const figC = keepHeld(heldC, cw.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ══ CLUYT ════════════════════════════════════════════════════════════════
    const hxs = src(3, H_X);
    const hds = src(4, H_D);
    let hw: Walk = walkOf(hxs, H_X[nv], 0, hds, b);
    let hx = hxs;
    let hTurns: (readonly number[])[] = [[0, H_D[nv]]];
    if (nv === HOLES) hTurns = [[0, 1], [0.3, -1]];
    if (nv === SHRUG) hw = walkOf(hxs, 292, 0.05 * L, hds, b);
    if (nv === SCARCE) hw = walkOf(hxs, HX + 100, 0.2 * L, hds, b);
    if (hw.wd !== 0) hx = hw.x;
    const hxS = carry(cv, 3, n, hx, hx, 1) + cam;
    const hd0 = carry(cv, 4, n, 0, faceOf(hds, hTurns, b, L, hw), 1);
    const hCode = sp(2) ? TALK : NOD;
    let sh = bodyOf(hw, hCode, t, b, 1);
    let hR: readonly Key[] | null = null;
    let hL: readonly Key[] | null = null;
    let hLean = 0;
    let hNeck = 0;
    // with the spade, among the beds: on the shaft, digging, leaning on it
    if (place === 0) hR = [[0, 22, 50, 1]];
    if (nv === ARRIVE) {
      const push = hd(b, 11.72, S0(0.8), S0(1.1), S0(1.3), S0(1.7)) + hd(b, 11.72, S0(3.0), S0(3.3), S0(3.5), S0(3.9));
      hR = [[0, 20, 38 - 4 * push, 1]];
      hL = [[0, 24, 26 - 4 * push, 1]];
      hLean = 0.36 + 0.08 * push;
      hNeck = 0.1 - 0.3 * hd(b, 11.72, S0(4.4), S0(4.9), S0(8.0), S0(8.6));
    }
    if (nv === DIG) {
      hR = [[0, 20, 38, 1], [0.25, 22, 52, 1]];
      hL = [[0, 24, 26, 1], [0.25, 18, 50, 1]];
      hLean = 0.36 * (1 - st(0.02, 0.25)) + 0.12 * st(0.25, 0.4);
      hNeck = 0.14 * st(0.3, 0.45);
    }
    if (nv === UNPACK || nv === LABEL || nv === ENVOY) {
      hL = [[0, 18, 50, 1]];
      hLean = 0.12;
      hNeck = nv === UNPACK ? 0.14 - 0.2 * bump(0.6, 0.7, 0.9, 1) : 0.08;
    }
    if (nv === PLANT) {
      // a bulb dropped into a hole, then the soil patted flat with the spade, twice
      hL = [[0, 18, 50, 1], [0.1, 8, 44, 0.4], [0.18, 20, 40, 1], [0.3, 28, 22, 1], [0.38, 26, 26, 1], [0.48, 8, 44, 0.3]];
      hR = [[0, 22, 50, 1], [0.44, 22, 50, 1], [0.56, 24, 40, 1], [0.66, 24, 34, 1], [0.84, 24, 34, 1], [0.92, 22, 50, 1]];
      hLean = 0.34 * bump(0.18, 0.3, 0.38, 0.48) + 0.24 * bump(0.46, 0.56, 0.84, 0.92);
      hNeck = 0.2 * bump(0.18, 0.3, 0.84, 0.92);
    }
    if (nv === BLOOM && !pre) {
      hL = [[0, 18, 50, 1]];
      hNeck = -0.12 * bump(0.3, 0.4, 0.7, 0.8);
    }
    if (nv === REFUSE) {
      hL = [[0, 18, 50, 1]];
      hNeck = 0.14 * bump(0.5, 0.6, 0.9, 1);
    }
    if (nv === THEFT && !pre) hNeck = -0.06;
    if (nv === HOLES) hNeck = 0.16 * st(0.4, 0.5);
    if (nv === SHRUG) {
      // a hand on the ladder, a look up over the wall, a shrug
      hR = [[0.3, 8, 44, 0], [0.4, 18, 46, 1], [0.7, 18, 46, 1], [0.78, 8, 44, 0.4]];
      hNeck = -0.34 * bump(0.38, 0.48, 0.7, 0.78);
      hLean = -0.06 * bump(0.38, 0.48, 0.7, 0.78);
      const shrug = bump(0.8, 0.86, 0.9, 0.97);
      hL = [[0.78, 6, 44, 0], [0.84, 12, 52 + 6 * shrug, 1], [0.97, 6, 44, 0]];
    }
    // in the corner: the spade carried in his right hand, its blade down by his foot
    if (place === 2 && nv < SCARCE) hR = [[0, 12, 44, 1]];
    if (nv === BROKEN) hNeck = 0.1 * bump(0.3, 0.4, 0.8, 0.9);
    if (nv === SCARCE) {
      const push = hd(b, L, 0.44, 0.48, 0.5, 0.54) + hd(b, L, 0.56, 0.6, 0.62, 0.66);
      hR = [[0, 12, 44, 1], [0.4, 12, 44, 1], [0.44, 20, 38 - 5 * push, 1], [0.66, 20, 38, 1], [0.74, 16, 48, 1], [0.84, 8, 44, 0]];
      hL = [[0.4, 6, 44, 0], [0.44, 24, 28 - 5 * push, 1], [0.66, 24, 26, 1], [0.7, 22, 22, 1], [0.84, 16, 88, 1], [0.97, 16, 88, 1]];
      hLean = (0.3 + 0.06 * push) * bump(0.42, 0.46, 0.66, 0.74);
      hNeck = 0.18 * bump(0.42, 0.46, 0.66, 0.74) - 0.16 * st(0.86, 0.94);
    }
    if (nv > SCARCE) hL = [[0, 16, 88, 1], [0.2, 14, 52, 1]];
    if (nv > Q1N) hL = [[0, 14, 52, 1]];
    if (nv === VIRUS) {
      // a tiny aphid plucked off a leaf of the striped tulip, held up to the light
      hR = [[0.12, 8, 44, 0], [0.24, 16, 46, 1], [0.32, 17, 44, 1], [0.48, 18, 94, 1], [0.86, 18, 94, 1], [0.95, 8, 44, 0]];
      hNeck = -0.3 * bump(0.44, 0.54, 0.84, 0.94) + 0.1 * bump(0.2, 0.26, 0.32, 0.4);
    }
    if (nv === Q2N) hNeck = 0.06 * st(0.1, 0.2) - 0.08 * ans(5, Q2);
    if (nv === AFTER) {
      hR = [[0.36, 8, 44, 0], [0.46, 26, 56, 1], [0.72, 26, 56, 1], [0.82, 8, 44, 0]];
      hNeck = 0.2 * bump(0.08, 0.16, 0.3, 0.38) + 0.14 * bump(0.84, 0.9, 0.96, 1);
    }
    if (nv === WAGE) hNeck = 0.1 * bump(0.5, 0.6, 0.8, 0.9);
    sh = keyed(sh, hR, u, hxS, G, hd0, 1, K);
    sh = keyed(sh, hL, u, hxS, G, hd0, -1, K);
    sh = leanOf(sh, hLean, hNeck);
    const prevH = carryFrom(heldH, n, hHold(hCode, t, 1));
    const figH = keepHeld(heldH, hw.walking ? mixKeepLegs(prevH, sh, tr) : mixStance(prevH, sh, tr));

    // ══ THE GARDEN BOY ═══════════════════════════════════════════════════════
    const pxs = src(5, P_X);
    const pds = src(6, P_D);
    let pw: Walk = walkOf(pxs, P_X[nv], 0, pds, b);
    let px = pxs;
    let pTurns: (readonly number[])[] = [[0, P_D[nv]]];
    let pKneel = 0;
    if (nv === ARRIVE) pw = walkOf(pxs, 378, 0.4, -1, b);
    if (nv === LABEL) {
      pw = walkOf(pxs, 240, 0.02 * L, -1, b);
      pKneel = st(0.62, 0.74);
    }
    if (nv === ENVOY) pKneel = 1 - st(0.78, 0.94);
    if (nv === BLOOM && !pre) {
      pw = walkOf(pxs, 352, 0.04 * L, -1, b);
      pTurns = [[0, -1], [0.55, 1], [0.86, -1]];
    }
    if (nv === SCARCE) {
      pw = walkOf(pxs, HX + 286, 0.04 * L, 1, b);
      pTurns = [[0, 1], [0.92, -1]];
    }
    if (nv === REVEAL) pw = walkOf(pxs, HX + 276, 0.04 * L, -1, b);
    if (nv === Q2N) pTurns = [[0, -1], [0.02, 1]];
    if (nv === LEGACY) pTurns = [[0, 1], [0.05, -1]];
    if (pw.wd !== 0) px = pw.x;
    const pxS = carry(cv, 5, n, px, px, 1) + cam;
    const pd = carry(cv, 6, n, 0, faceOf(pds, pTurns, b, L, pw), 1);
    const pCode = sp(3) ? TALK : NOD;
    let spp = bodyOf(pw, pCode, t, b, 2);
    let pR: readonly Key[] | null = null;
    let pL: readonly Key[] | null = null;
    let pLean = 0;
    let pNeck = 0;
    // the barrow: rolled in, its handles lifted, then set down (b0); where its grips are
    const barrowRot = nv === ARRIVE ? -14 * (1 - stage(b, 1, 3.7, 4.05)) : 0;
    const wheelX = nv === ARRIVE ? Math.min(WHEEL + 140, px - 62) : WHEEL;
    const ra = (barrowRot * Math.PI) / 180;
    const gripX = wheelX + 50 * Math.cos(ra) + 21 * Math.sin(ra);
    const gripY = G + 50 * Math.sin(ra) - 21 * Math.cos(ra);
    if (nv === ARRIVE) {
      const grip = 1 - stage(b, 1, 4.3, 4.6);
      const glx = (pxS - gripX) / KS;
      const gly = (G - gripY) / KS;
      const straw = hd(b, 1, 4.9, 5.2, 5.5, 5.9);
      pR = [[0, glx + 14 * straw, gly + 13 * straw, Math.max(grip, straw)]];
      pL = [[0, glx - 2, gly + 1, grip]];
      pLean = 0.22 * grip + 0.12 * hd(b, 1, 3.7, 4.0, 4.1, 4.4);
      pNeck = 0.06 - 0.1 * hd(b, 11.72, S0(6.2), S0(6.8), S0(10), S0(10.8));
    }
    if (nv === DIG) {
      pL = [[0.2, 8, 44, 0], [0.32, 6, 86, 1], [0.4, 10, 88, 1], [0.48, 8, 44, 0]];
      pNeck = 0.1 * bump(0.3, 0.36, 0.42, 0.5);
    }
    if (nv === UNPACK) pNeck = -0.12 * bump(0.3, 0.4, 0.8, 0.9);
    // the label: carried, then pushed into bed 2 kneeling
    const labelIn = nv === LABEL ? st(0.72, 0.84) : nv > LABEL ? 1 : 0;
    if (nv === LABEL) {
      pR = [[0, 12, 48, 1], [0.66, 14, 36, 1], [0.72, 14, 26, 1], [0.84, 14, 16, 1], [0.94, 10, 34, 0.4]];
      pNeck = 0.2 * st(0.6, 0.74);
    }
    if (nv === ENVOY) pNeck = 0.2 - 0.36 * bump(0.1, 0.2, 0.7, 0.8);
    if (nv === PLANT) pNeck = 0.06 * bump(0.3, 0.4, 0.8, 0.9);
    if (nv === BLOOM && !pre) {
      // he points back at the hats over the wall, then turns again
      pR = [[0.55, 8, 44, 0], [0.64, 26, 86, 1], [0.8, 26, 86, 1], [0.86, 8, 44, 0]];
      pNeck = -0.12 * bump(0.6, 0.66, 0.8, 0.86);
    }
    if (nv === REFUSE) pNeck = 0.12 * bump(0.6, 0.7, 0.9, 1);
    // by night: the lantern
    if (place === 1) {
      pL = nv === THEFT ? [[0, 14, 88, 1]] : nv === HOLES ? [[0, 14, 88, 1], [0.3, 18, 60, 1]] : [[0, 18, 58, 1], [0.4, 14, 64, 1]];
      if (nv === HOLES) pNeck = 0.16 * st(0.4, 0.5);
      if (nv === SHRUG) pNeck = -0.1 * bump(0.4, 0.5, 0.7, 0.8);
    }
    if (nv === BROKEN && !pre) {
      pR = [[0.08, 8, 44, 0], [0.18, 26, 40, 1], [0.78, 26, 40, 1], [0.86, 8, 44, 0]];
      pLean = 0.12 * bump(0.12, 0.2, 0.76, 0.86);
      pNeck = 0.16 * bump(0.12, 0.2, 0.76, 0.86);
    }
    if (nv === INSPECT) pNeck = 0.1 * bump(0.2, 0.3, 0.8, 0.9);
    if (nv === Q1N) {
      pNeck = 0.1 * st(0.04, 0.14);
      const ok = ans(3, Q1);
      const no = ans(1, Q1) + ans(2, Q1);
      const clap = Math.sin(Math.PI * Math.min(1, ok * 1.2));
      pR = [[0, 8, 44, 0], [1, 12, 62, clap]];
      pL = [[0, 6, 44, 0], [1, 10, 62, clap]];
      pNeck += -0.16 * ok + 0.18 * Math.sin(Math.PI * Math.min(1, no * 1.4));
    }
    // the striped pot: taken up in both hands (b15), held, set back on the bench (b16)
    const potLift = nv === REVEAL ? st(0.28, 0.5) : nv === VIRUS ? 1 - st(0.8, 0.95) : 0;
    const potGrip = nv === REVEAL ? st(0.16, 0.26) : nv === VIRUS ? 1 - st(0.95, 1.0) : 0;
    if (nv === REVEAL || nv === VIRUS) {
      const lx = (pxS - (POTS1[2].x + cam)) / KS;
      const ly = lerp(42, 66, potLift);
      pR = [[0, lx - 3 + 6 * potLift, ly, potGrip]];
      pL = [[0, lx + 3 + 6 * potLift, ly - 1, potGrip]];
      pLean = 0.3 * potGrip * (1 - potLift);
      pNeck = 0.2 * potGrip * (1 - potLift) - 0.1 * potLift;
    }
    // Q2: the brass tag held out on its string, and thrown
    const tagHeld = nv === Q2N ? 1 : 0;
    if (nv === Q2N) {
      const throwF = Math.min(1, q * 3) * (pc > 3 ? 1 : 0);
      pR = [[0, 8, 44, 0.5], [0.12, 18, 52, 1], [1, 18 + 8 * throwF, 52 + 6 * throwF, 1]];
      pNeck = 0.08 - 0.16 * ans(5, Q2) + 0.16 * (ans(4, Q2) + ans(6, Q2));
    }
    if (nv === WAGE) {
      // counting on his fingers: a finger pressed down, then both hands open, eyes wide
      pL = [[0, 8, 44, 0], [0.14, 14, 62, 1], [0.6, 14, 62, 1], [0.7, 20, 68, 1], [0.95, 20, 68, 1]];
      pR = [[0.14, 8, 44, 0], [0.24, 12, 66, 1], [0.32, 14, 63, 1], [0.6, 14, 63, 1], [0.7, 22, 70, 1], [0.95, 22, 70, 1]];
      pNeck = 0.1 * bump(0.14, 0.22, 0.5, 0.6) - 0.2 * bump(0.6, 0.7, 0.9, 1);
    }
    spp = keyed(spp, pR, u, pxS, G, pd, 1, K);
    spp = keyed(spp, pL, u, pxS, G, pd, -1, K);
    spp = leanOf(spp, pLean, pNeck);
    spp = kneelOf(spp, pKneel, t, 2, pR, pL, u, pxS, pd, 0.24);
    const prevP = carryFrom(heldP, n, hHold(pCode, t, 2));
    const figP = keepHeld(heldP, pw.walking ? mixKeepLegs(prevP, spp, tr) : mixStance(prevP, spp, tr));

    // ══ THE MERCHANTS OVER THE WALL (silent) ═════════════════════════════════
    const e1x = (place === 2 ? HX + 300 : 262) + cam;
    const e2x = (place === 2 ? HX + 386 : 384) + cam;
    const crowd = (place === 0 && nv >= BLOOM) || place === 2 ? 1 : 0;
    const qRight = kept(11, 5, Q2, Q2N);
    const qWrong = Math.max(kept(10, 4, Q2, Q2N), kept(12, 6, Q2, Q2N));
    const sinkA = nv === REFUSE ? st(0.6, 0.85) : 0;
    const peek1 = bump(0.1, 0.18, 0.3, 0.38) + (nv === BLOOM ? bump(0.5, 0.6, 0.85, 0.95) : 0);
    const peek2 = bump(0.42, 0.5, 0.62, 0.7);
    const e1g = 470 - 8 * peek1 + 34 * Math.max(sinkA, qWrong) - 10 * qRight;
    const e2g = 470 - 7 * peek2 + 34 * Math.max(sinkA, qWrong) - 12 * qRight;
    const purse = Math.max(nv === BLOOM ? bump(0.5, 0.6, 0.85, 0.95) : 0, qRight);
    let s1 = hLive(NOD, t, b, 3);
    s1 = hand(s1, e1x, e1g, -1, 1, 14, 96, purse, KE);
    s1 = leanOf(s1, 0, -0.1 * peek1);
    let s2 = hLive(NOD, t, b, 4);
    s2 = leanOf(s2, 0.04 * peek2, -0.12 * peek2 - 0.1 * qRight);
    const figE1 = keepHeld(heldE1, mixStance(carryFrom(heldE1, n, s1), s1, tr));
    const figE2 = keepHeld(heldE2, mixStance(carryFrom(heldE2, n, s2), s2, tr));

    // ── the bundles ──────────────────────────────────────────────────────────
    const bC = pose(figC, cxS, G, K, cd, 1);
    const bH = pose(figH, hxS, G, K, hd0, 1);
    const bP = pose(figP, pxS, G, K, pd, 1);
    const bE1 = pose(figE1, e1x, e1g, KE, -1, crowd);
    const bE2 = pose(figE2, e2x, e2g, KE, -1, crowd);
    const cRw = jointOf(bC, 'wrR');
    const cLw = jointOf(bC, 'wrL');
    const hRw = jointOf(bH, 'wrR');
    const hLw = jointOf(bH, 'wrL');
    const pRw = jointOf(bP, 'wrR');
    const pLw = jointOf(bP, 'wrL');
    const e1w = jointOf(bE1, 'wrR');

    // ── the gate, the seasons, the beds ──
    const gateOpen = place === 0 ? (nv === ARRIVE ? stage(b, 1, 2.0, 2.8) : 1) : 0;
    const grow1 = nv === BLOOM ? st(0.0, 0.3) : nv > BLOOM ? 1 : 0;
    const grow2 = nv === BLOOM ? st(0.1, 0.42) : nv > BLOOM ? 1 : 0;
    // ── the barrow and its crate lid ──
    const lid = nv === UNPACK ? st(0.05, 0.14) : nv > UNPACK ? 1 : 0;
    const barrow = { x: wheelX, rot: barrowRot, o: place === 0 && nv < BLOOM ? 1 : 0, lid: -112 * lid };
    // ── the bulb in Clusius's hand (b2), the letter (b4), the soil (b9) ──
    const cBulb = nv === UNPACK ? st(0.14, 0.18) : nv === LABEL ? 1 - st(0.12, 0.16) : 0;
    const letter = nv === ENVOY ? st(0.1, 0.14) * (1 - st(0.92, 0.96)) : 0;
    const soil = nv === HOLES ? st(0.56, 0.6) : 0;
    const crumbs = nv === HOLES ? st(0.72, 0.98) : 0;
    // ── Cluyt's bulb (b5): in his hand, dropped into the hole ──
    const hBulbIn = nv === PLANT ? st(0.14, 0.18) : 0;
    const hBulbDrop = nv === PLANT ? st(0.34, 0.42) : 0;
    const hBulb = {
      x: lerp(hLw.x, 86, hBulbDrop), y: lerp(hLw.y + 2, 480, hBulbDrop * hBulbDrop),
      o: hBulbIn * (1 - st(0.44, 0.47)),
    };
    // ── the spade: in his hands (grip at the right wrist), its blade where the work is ──
    let tipX = hRw.x + 4 * hd0;
    let tipY = 499;
    let gX = hRw.x;
    let gY = hRw.y;
    if (place === 0) {
      if (nv === ARRIVE) { tipX = 86; tipY = 484; }
      if (nv === DIG) { tipX = lerp(86, 82, st(0.05, 0.25)); tipY = lerp(484, 499, st(0.05, 0.25)); }
      if (nv > DIG) { tipX = 82; tipY = 499; }
      if (nv === PLANT) {
        const pat = bump(0.48, 0.52, 0.84, 0.9);
        tipX = lerp(82, 92, pat);
        tipY = lerp(499, 478 + 5 * st(0.58, 0.66), pat);
      }
    }
    if (place === 2) {
      tipX = hRw.x + 6 * hd0;
      tipY = Math.min(499, hRw.y + 44);
      if (nv === SCARCE) {
        const dig = bump(0.42, 0.46, 0.66, 0.74);
        const push = hd(b, L, 0.44, 0.48, 0.5, 0.54) + hd(b, L, 0.56, 0.6, 0.62, 0.66);
        tipX = lerp(tipX, BED_TULIP.x - 6 + cam, dig);
        tipY = lerp(tipY, 482 + 4 * push, dig);
      }
      const rest = nv === SCARCE ? st(0.74, 0.84) : nv > SCARCE ? 1 : 0;
      gX = lerp(gX, SPADE_REST.gx + cam, rest);
      gY = lerp(gY, SPADE_REST.gy, rest);
      tipX = lerp(tipX, SPADE_REST.tx + cam, rest);
      tipY = lerp(tipY, SPADE_REST.ty, rest);
    }
    const spade = { gx: gX, gy: gY, tx: tipX, ty: tipY, o: place === 1 ? 0 : 1 };
    // ── the lantern (night) ──
    const lantern = { x: pLw.x, y: pLw.y, o: night };
    // ── the corner: the broken tulip, dug up and held by Cluyt ──
    const dug = nv === SCARCE ? st(0.68, 0.72) : nv > SCARCE ? 1 : 0;
    const bed = {
      x: lerp(BED_TULIP.x + cam, hLw.x, dug), y: lerp(BED_TULIP.y, hLw.y + 4, dug),
      o: place === 2 ? 1 : 0, bulb: dug, rot: dug * -6 * hd0,
    };
    const aphid = nv === VIRUS ? st(0.3, 0.32) * (1 - st(0.92, 0.95)) : 0;
    // ── Q1: the three pots; the striped one blooms (right, or b15) and is lifted by the boy ──
    const rRed1 = carry(cv, 7, n, 0, kept(7, 1, Q1, Q1N), keptTr(Q1));
    const rBare1 = carry(cv, 8, n, 0, kept(8, 2, Q1, Q1N), keptTr(Q1));
    const rStr1 = carry(cv, 9, n, 0, kept(9, 3, Q1, Q1N), keptTr(Q1));
    const bloom1 = Math.max(clamp01(rStr1 * 1.4), nv === REVEAL ? st(0.0, 0.26) : nv > REVEAL ? 1 : 0);
    const handsMid = { x: (pRw.x + pLw.x) / 2, y: (pRw.y + pLw.y) / 2 };
    const sPot = {
      x: lerp(POTS1[2].x + cam, handsMid.x, potLift),
      y: lerp(BENCH_TOP, handsMid.y + 14, potLift),
    };
    // ── Q2: the brass tag in the boy's hand, flown to the pot it is pinned on ──
    const r2Red = carry(cv, 10, n, 0, kept(10, 4, Q2, Q2N), keptTr(Q2));
    const r2Str = carry(cv, 11, n, 0, kept(11, 5, Q2, Q2N), keptTr(Q2));
    const r2Yel = carry(cv, 12, n, 0, kept(12, 6, Q2, Q2N), keptTr(Q2));
    const r2 = Math.max(r2Red, r2Str, r2Yel);
    const toX = (r2Red > 0 ? POTS2[0].x : r2Yel > 0 ? POTS2[2].x : POTS2[1].x) + cam - 6;
    const fly = clamp01(r2 * 1.5);
    const tagO = place === 2 && (tagHeld || r2 > 0) ? 1 : 0;
    const price = {
      x: lerp(pRw.x, toX, fly), y: lerp(pRw.y, 456, fly) - 18 * Math.sin(Math.PI * fly),
      swing: 14 * Math.sin(b * 3.1) * (1 - fly) + 18 * Math.sin(fly * Math.PI * 3) * (1 - fly), o: tagO,
    };
    const velvet = nv === AFTER ? st(0.3, 0.42) : nv > AFTER ? 1 : 0;
    const leaves = place === 0 && nv < BLOOM ? 1 : 0;

    return {
      bC, bH, bP, bE1, bE2, cam, t, haze, dark, night, spring, place,
      gateOpen, grow1, grow2, barrow, labelIn, labelHand: pRw, labelO: place < 2 && nv >= LABEL ? 1 : 0,
      cBulb, cBulbAt: cRw, letter, letterAt: cLw, soil, crumbs, soilAt: cRw, hBulb, spade, lantern,
      bed, aphid, aphidAt: hRw, rRed1, rBare1, rStr1, bloom1, sPot, r2Red, r2Str, r2Yel, price, velvet,
      purse, purseAt: e1w, leaves,
      q1: carry(cv, 13, n, 0, Q1[n], tr),
      q2: carry(cv, 14, n, 0, Q2[n], tr),
    };
  });

  const DC = useDerivedValue<Bundle>(() => SCENE.value.bC);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.bH);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.bP);
  const DE1 = useDerivedValue<Bundle>(() => SCENE.value.bE1);
  const DE2 = useDerivedValue<Bundle>(() => SCENE.value.bE2);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));
  const nightOn = useAnimatedStyle(() => ({ opacity: SCENE.value.night }));
  const springOn = useAnimatedStyle(() => ({ opacity: SCENE.value.spring }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far: the beds (x 0–400) and the corner (x 400–800) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="tulip1-a-far" />
        <Animated.View style={[styles.world, springOn]}><LessonPicture name="tulip1-a-tree" /></Animated.View>
        <Animated.View style={[styles.world, nightOn]}><LessonPicture name="tulip1-a-far-night" /></Animated.View>
        <LessonPicture name="tulip1-b-far" />
      </Animated.View>
      {/* extra: merchant */}
      <Stickman D={DE1} k={KE} role="crowd" wear={CLUYT_HEAD} garb={CLUYT.garb?.bands} />
      <Purse S={SCENE} />
      {/* extra: merchant */}
      <Stickman D={DE2} k={KE} role="crowd" wear={MERCHANT_HEAD} garb={MERCHANT2.garb?.bands} />
      {/* THE WORLD, near: the walls, the beds, the walks, the bench and the plank */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="tulip1-a-mid" />
        <Gate S={SCENE} />
        <Rows S={SCENE} name="tulip1-rows1" k="grow1" />
        <Rows S={SCENE} name="tulip1-rows2" k="grow2" />
        <Animated.View style={[styles.world, nightOn]}><LessonPicture name="tulip1-a-mid-night" /></Animated.View>
        <LessonPicture name="tulip1-b-mid" />
        <View style={styles.benchShadow} />
        <LessonPicture name="tulip1-bench" />
        <View style={styles.plankShadow} />
        <LessonPicture name="tulip1-plank" />
      </Animated.View>
      <LightPool S={SCENE} />
      <Leaves S={SCENE} />
      <Label S={SCENE} />
      <Barrow S={SCENE} />
      <BedTulip S={SCENE} held={0} />
      <Pot1 S={SCENE} k={0} />
      <Pot1 S={SCENE} k={1} />
      <Velvet S={SCENE} />
      <Pot2 S={SCENE} k={0} />
      <Pot2 S={SCENE} k={1} />
      <Pot2 S={SCENE} k={2} />
      <Spade S={SCENE} />
      {/* cast: tophat */}
      <Stickman D={DH} k={K} role="second" wear={CLUYT_HEAD} garb={CLUYT.garb?.bands} />
      <BedTulip S={SCENE} held={1} />
      <Aphid S={SCENE} />
      <HandBulb S={SCENE} />
      {/* cast: plain */}
      <Stickman D={DC} k={K} role="lead" wear={[]} garb={CLUSIUS.garb?.bands} />
      <ClusiusThings S={SCENE} />
      {/* cast: cap */}
      <Stickman D={DP} k={K} role="crowd" wear={BOY_HEAD} garb={BOY.garb?.bands} />
      <Pot1 S={SCENE} k={2} />
      <Lantern S={SCENE} />
      <PriceTag S={SCENE} />
      <Veil S={SCENE} k="haze" />
      <Veil S={SCENE} k="dark" />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={POT_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={TAG_Q} k="q2" /> : null}
    </View>
  );
}

// ── the garden ───────────────────────────────────────────────────────────────

/** The garden gate in the side wall, swinging open on its left hinge (world x). */
function Gate({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.place === 0 ? 1 : 0,
    transform: [{ translateX: 302 }, { scaleX: 1 - 0.86 * S.value.gateOpen }, { translateX: -302 }],
  }));
  return <Animated.View style={[styles.rider, st]}><LessonPicture name="tulip1-gate" /></Animated.View>;
}
/** A bed's rows of tulips, growing up out of the soil in spring (world x). */
function Rows({ S, name, k }: { S: SharedValue<any>; name: string; k: 'grow1' | 'grow2' }) {
  const st = useAnimatedStyle(() => {
    const g = S.value[k];
    return { opacity: g > 0.01 && S.value.place === 0 ? 1 : 0, transform: [{ translateY: 486 }, { scaleY: Math.max(0.02, g) }] };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.rowsAt}><LessonPicture name={name} /></View>
    </Animated.View>
  );
}
/** Autumn leaves blowing across the beds, each on its own path and moment. */
const LEAVES = [[0, 452, 0.0, 0], [1, 470, 0.31, 1], [2, 440, 0.57, 0], [3, 462, 0.8, 1]] as const;
function Leaves({ S }: { S: SharedValue<any> }) {
  return <>{LEAVES.map(([k, y, ph, red]) => <Leaf key={k} S={S} y={y} ph={ph} red={red} />)}</>;
}
function Leaf({ S, y, ph, red }: { S: SharedValue<any>; y: number; ph: number; red: number }) {
  const st = useAnimatedStyle(() => {
    const f = (S.value.t * 0.11 + ph) % 1;
    return {
      opacity: S.value.leaves * (f < 0.92 ? 1 : 0),
      transform: [{ translateX: 420 - 460 * f }, { translateY: y + 10 * Math.sin(f * 14) + 22 * f }, { rotate: `${f * 900}deg` }],
    };
  });
  return <Animated.View style={[styles.rider, st]}><View style={red ? styles.leafRed : styles.leaf} /></Animated.View>;
}
/** The wheelbarrow, rolled in on its wheel and set down; the top crate's lid on its hinge. */
function Barrow({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.barrow;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: 500 }, { rotate: `${v.rot}deg` }] };
  });
  const lid = useAnimatedStyle(() => ({ transform: [{ translateX: 22 }, { translateY: -36 }, { rotate: `${S.value.barrow.lid}deg` }] }));
  return (
    <Animated.View nativeID="t1-barrow" style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.barrowShadow} />
      <LessonPicture name="tulip1-barrow" />
      <Animated.View style={[styles.rider, lid]}>
        <View style={styles.lid} />
        <View style={styles.lidSlat} />
      </Animated.View>
    </Animated.View>
  );
}
/** The label: in the boy's hand, then standing in bed 2. */
function Label({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const f = v.labelIn;
    const x = lerp(v.labelHand.x, LABEL_AT.x, f);
    const y = lerp(v.labelHand.y + 6, LABEL_AT.y, f);
    return { opacity: v.labelO, transform: [{ translateX: x }, { translateY: y }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.labelStick} />
      <View style={styles.labelFace} />
      <View style={styles.labelInk} />
    </Animated.View>
  );
}
/** The spade, between the grip in Cluyt's hand and the blade where the work is. */
function Spade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.spade;
    const ang = Math.atan2(v.ty - v.gy, v.tx - v.gx) - Math.PI / 2;
    return { opacity: v.o, transform: [{ translateX: v.gx }, { translateY: v.gy }, { rotate: `${(ang * 180) / Math.PI}deg` }, { translateY: -4 }] };
  });
  const shaft = useAnimatedStyle(() => {
    const v = S.value.spade;
    return { height: Math.max(4, Math.hypot(v.tx - v.gx, v.ty - v.gy) - 6) };
  });
  const blade = useAnimatedStyle(() => {
    const v = S.value.spade;
    return { transform: [{ translateY: Math.hypot(v.tx - v.gx, v.ty - v.gy) - 6 }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.spadeT} />
      <Animated.View style={[styles.spadeShaft, shaft]} />
      <Animated.View style={[styles.rider, blade]}>
        <View style={styles.spadeBlade} />
      </Animated.View>
    </Animated.View>
  );
}
/** Clusius's things: the bulb held up (b2), the letter (b4), the handful of soil (b9). */
function ClusiusThings({ S }: { S: SharedValue<any> }) {
  const bulb = useAnimatedStyle(() => ({ opacity: S.value.cBulb, transform: [{ translateX: S.value.cBulbAt.x }, { translateY: S.value.cBulbAt.y - 10 }] }));
  const letter = useAnimatedStyle(() => ({ opacity: S.value.letter, transform: [{ translateX: S.value.letterAt.x }, { translateY: S.value.letterAt.y - 3 }, { rotate: '-12deg' }] }));
  const soil = useAnimatedStyle(() => ({ opacity: S.value.soil * (1 - S.value.crumbs), transform: [{ translateX: S.value.soilAt.x }, { translateY: S.value.soilAt.y - 2 }, { scale: 1 - 0.5 * S.value.crumbs }] }));
  return (
    <>
      <Animated.View style={[styles.rider, bulb]} pointerEvents="none"><LessonPicture name="tulip1-bulb" /></Animated.View>
      <Animated.View style={[styles.rider, letter]} pointerEvents="none">
        <View style={styles.letter} />
        <View style={styles.letterSeal} />
      </Animated.View>
      <Animated.View style={[styles.rider, soil]} pointerEvents="none"><View style={styles.clump} /></Animated.View>
      <Crumb S={S} dx={-3} d={0} />
      <Crumb S={S} dx={1} d={0.15} />
      <Crumb S={S} dx={4} d={0.3} />
      <Crumb S={S} dx={-1} d={0.45} />
    </>
  );
}
function Crumb({ S, dx, d }: { S: SharedValue<any>; dx: number; d: number }) {
  const st = useAnimatedStyle(() => {
    const f = clamp01((S.value.crumbs - d) / 0.5);
    return { opacity: f > 0 && f < 1 ? 1 : 0, transform: [{ translateX: S.value.soilAt.x + dx }, { translateY: lerp(S.value.soilAt.y, 482, f * f) }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.crumb} /></Animated.View>;
}
/** Cluyt's bulb (b5): in his hand, dropped into the hole. */
function HandBulb({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.hBulb;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y - 6 }, { scale: 0.8 }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="tulip1-bulb" /></Animated.View>;
}
/** The boy's lantern, hanging from his hand by its ring, its candle flickering. */
function Lantern({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.lantern;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${3 * Math.sin(S.value.t * 1.3)}deg` }] };
  });
  const flame = useAnimatedStyle(() => ({ transform: [{ scaleY: 0.8 + 0.2 * Math.sin(S.value.t * 9) + 0.08 * Math.sin(S.value.t * 17) }] }));
  return (
    <Animated.View nativeID="t1-lantern" style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.lanternRing} />
      <View style={styles.lanternCap} />
      <View style={styles.lanternGlass} />
      <Animated.View style={[styles.lanternFlame, flame]} />
      <View style={styles.lanternBase} />
    </Animated.View>
  );
}
/** The lantern's light lying on the gravel under it (flat, one shape). */
function LightPool({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.32 * S.value.lantern.o, transform: [{ translateX: S.value.lantern.x }, { translateY: 498 }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.pool} /></Animated.View>;
}
/** The broken tulip: in bed F, or dug up in Cluyt's hand with its bulb and two offsets. */
function BedTulip({ S, held }: { S: SharedValue<any>; held: 0 | 1 }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.bed;
    const isHeld = v.bulb > 0.5 ? 1 : 0;
    return { opacity: v.o * (isHeld === held ? 1 : 0), transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }] };
  });
  return (
    <Animated.View nativeID={held ? 't1-tulip-held' : 't1-tulip-bed'} style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="tulip1-broken" />
      {held ? <LessonPicture name="tulip1-bulb" /> : null}
    </Animated.View>
  );
}
function Aphid({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.aphid, transform: [{ translateX: S.value.aphidAt.x + 1 }, { translateY: S.value.aphidAt.y - 4 }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.aphid} />
      <View style={styles.aphidLeg} />
    </Animated.View>
  );
}
/** A merchant's purse, waved over the wall. */
function Purse({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.purse > 0.3 ? 1 : 0,
    transform: [{ translateX: S.value.purseAt.x }, { translateY: S.value.purseAt.y }, { rotate: `${10 * Math.sin(S.value.t * 4)}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.purse} />
      <View style={styles.purseTie} />
    </Animated.View>
  );
}

// ── the two games ────────────────────────────────────────────────────────────

/**
 * A Q1 pot on the bench with its painted tag. PICKED RIGHT (striped): a striped tulip shoots
 * up out of it and opens, and its tag hops; PICKED WRONG: the pot jolts and its tag topples
 * over flat on the soil. The striped one is lifted by the boy in b15–16.
 */
function Pot1({ S, k }: { S: SharedValue<any>; k: number }) {
  const p = POTS1[k];
  const body = useAnimatedStyle(() => {
    const v = S.value;
    const r = k === 0 ? v.rRed1 : k === 1 ? v.rBare1 : 0;
    const jolt = r > 0 && r < 1 ? Math.abs(Math.sin(r * Math.PI * 3)) * (1 - r) * 4 : 0;
    const x = k === 2 ? v.sPot.x : p.x - HX;
    const y = k === 2 ? v.sPot.y : BENCH_TOP;
    return { opacity: v.place === 2 ? 1 : 0, transform: [{ translateX: x + (r > 0 && r < 1 ? 1.4 * Math.sin(r * 40) * (1 - r) : 0) }, { translateY: y - jolt }] };
  });
  const tag = useAnimatedStyle(() => {
    const v = S.value;
    const r = k === 0 ? v.rRed1 : k === 1 ? v.rBare1 : 0;
    const hop = k === 2 ? 4 * Math.sin(Math.PI * clamp01(v.rStr1 * 1.6)) : 0;
    return { transform: [{ translateX: 5 }, { translateY: -10 - hop }, { rotate: `${-80 * clamp01(r * 1.6)}deg` }, { scale: 1.3 }] };
  });
  const fl = useAnimatedStyle(() => ({ opacity: k === 2 && S.value.bloom1 > 0.02 ? 1 : 0, transform: [{ translateY: -15 }, { scaleY: Math.max(0.02, S.value.bloom1) }, { scaleX: 0.9 }] }));
  return (
    <Animated.View nativeID={`t1-pot-${p.id}`} style={[styles.rider, body]} pointerEvents="none">
      {k === 2 ? <Animated.View style={[styles.rider, fl]}><LessonPicture name="tulip1-fl-striped" /></Animated.View> : null}
      <Animated.View style={[styles.rider, tag]}>
        <View style={styles.tagAt}><LessonPicture name={p.tag} /></View>
      </Animated.View>
      <LessonPicture name="tulip1-pot" />
    </Animated.View>
  );
}
/** A Q2 pot on the plank, in flower; it jolts when the tag lands on a plain one. */
function Pot2({ S, k }: { S: SharedValue<any>; k: number }) {
  const p = POTS2[k];
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const r = k === 0 ? v.r2Red : k === 1 ? v.r2Str : v.r2Yel;
    const land = clamp01((r - 0.6) / 0.4);
    const jolt = k !== 1 && land > 0 && land < 1 ? Math.abs(Math.sin(land * Math.PI * 3)) * (1 - land) * 3 : 0;
    return { opacity: v.place === 2 ? 1 : 0, transform: [{ translateX: p.x - HX }, { translateY: PLANK_TOP - jolt }] };
  });
  const fl = useAnimatedStyle(() => {
    const v = S.value;
    const f = clamp01((v.r2Str - 0.6) / 0.4);
    const nod = k === 1 ? 6 * Math.sin(Math.PI * 2 * f) * (1 - f) : 0;
    return { transform: [{ translateY: -15 }, { rotate: `${nod + 1.5 * Math.sin(v.t * 0.8 + k)}deg` }] };
  });
  return (
    <Animated.View nativeID={`t1-pot2-${p.id}`} style={[styles.rider, st]} pointerEvents="none">
      <Animated.View style={[styles.rider, fl]}><LessonPicture name={p.fl} /></Animated.View>
      <LessonPicture name="tulip1-pot" />
    </Animated.View>
  );
}
/** The brass price tag on its string: held out swinging, then flown onto a pot. */
function PriceTag({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.price;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.swing}deg` }] };
  });
  return <Animated.View nativeID="t1-price" style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="tulip1-price" /></Animated.View>;
}
/** One striped bulb on a velvet cloth, on the end of the bench (b19 on). */
function Velvet({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.velvet, transform: [{ translateX: 182 }, { translateY: BENCH_TOP - 6 * (1 - S.value.velvet) }] }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="tulip1-velvet" /></Animated.View>;
}
function Veil({ S, k }: { S: SharedValue<any>; k: 'haze' | 'dark' }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return <Animated.View style={[k === 'haze' ? styles.haze : styles.dark, st]} pointerEvents="none" />;
}

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/** THE NEXT SPRING: a box over each pot and its tag, reaching up above the tag (screen x). */
const POT_Q: Q[] = POTS1.map((p) => ({ id: p.id, left: p.x - HX - 13, top: 418, w: 26, h: 52, r: 5, correct: p.id === 'pStriped' }));
/** PIN THE PRICE: a box over each flowering pot on the plank (screen x). */
const TAG_Q: Q[] = POTS2.map((p) => ({ id: p.id, left: p.x - HX - 14, top: 412, w: 28, h: 62, r: 5, correct: p.id === 'tStriped' }));
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} nativeID={`t1-q-${q.id}`} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  world: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  rowsAt: { position: 'absolute', left: 0, top: -486, width: 0, height: 0 },
  tagAt: { position: 'absolute', left: 0, top: -14, width: 0, height: 0 },
  haze: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.tulip1Haze.base },
  dark: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.tulip1Night.base },
  leaf: { position: 'absolute', left: -3, top: -1.6, width: 6, height: 3.2, borderTopLeftRadius: 3, borderBottomRightRadius: 3, borderWidth: 0.5, backgroundColor: W.tulip1Leaf.base, borderColor: W.tulip1Leaf.shade },
  leafRed: { position: 'absolute', left: -3, top: -1.6, width: 6, height: 3.2, borderTopLeftRadius: 3, borderBottomRightRadius: 3, borderWidth: 0.5, backgroundColor: W.tulip1LeafRed.base, borderColor: W.tulip1LeafRed.shade },
  barrowShadow: { position: 'absolute', left: -6, top: -1.6, width: 60, height: 3.4, borderRadius: 1.7, backgroundColor: SHADE, opacity: 0.4 },
  benchShadow: { position: 'absolute', left: HX + 164, top: 498, width: 112, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  plankShadow: { position: 'absolute', left: HX + 294, top: 498, width: 104, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  lid: { position: 'absolute', left: -20, top: -2.6, width: 20, height: 2.6, borderRadius: 0.6, backgroundColor: W.tulip1Lid.base, borderWidth: 0.6, borderColor: INK },
  lidSlat: { position: 'absolute', left: -18, top: -1.6, width: 16, height: 0.6, backgroundColor: W.tulip1Lid.shade },
  labelStick: { position: 'absolute', left: -0.8, top: -14, width: 1.6, height: 14, backgroundColor: W.tulip1Wood.base },
  labelFace: { position: 'absolute', left: -5, top: -19, width: 10, height: 6, borderRadius: 1, backgroundColor: W.tulip1Paper.base, borderWidth: 0.6, borderColor: INK },
  labelInk: { position: 'absolute', left: -3.4, top: -16.6, width: 6.8, height: 0.8, backgroundColor: W.tulip1Wood.shade },
  spadeT: { position: 'absolute', left: -4, top: -1, width: 8, height: 2.4, borderRadius: 1.2, backgroundColor: W.tulip1Wood.shade },
  spadeShaft: { position: 'absolute', left: -1.2, top: 0, width: 2.4, borderRadius: 1.2, backgroundColor: W.tulip1Wood.base },
  spadeBlade: { position: 'absolute', left: -4.4, top: 0, width: 8.8, height: 10, borderBottomLeftRadius: 2.4, borderBottomRightRadius: 2.4, backgroundColor: W.tulip1Iron.base, borderWidth: 0.6, borderColor: INK },
  letter: { position: 'absolute', left: -5, top: -3.5, width: 10, height: 7, borderRadius: 0.8, backgroundColor: W.tulip1Paper.base, borderWidth: 0.6, borderColor: INK },
  letterSeal: { position: 'absolute', left: -1.6, top: -1.4, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: W.tulip1Wax.base },
  clump: { position: 'absolute', left: -3.6, top: -2.6, width: 7.2, height: 5.2, borderRadius: 2.6, backgroundColor: W.tulip1Soil.base, borderWidth: 0.5, borderColor: W.tulip1Soil.shade },
  crumb: { position: 'absolute', left: -1, top: -1, width: 2, height: 2, borderRadius: 1, backgroundColor: W.tulip1Soil.base },
  lanternRing: { position: 'absolute', left: -1.6, top: -1.4, width: 3.2, height: 3.2, borderRadius: 1.6, borderWidth: 0.8, borderColor: W.tulip1Brass.shade },
  lanternCap: { position: 'absolute', left: -4.4, top: 1.6, width: 8.8, height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: W.tulip1Brass.base, borderWidth: 0.6, borderColor: INK },
  lanternGlass: { position: 'absolute', left: -4, top: 4.4, width: 8, height: 10, backgroundColor: W.tulip1Glass.base, borderWidth: 0.8, borderColor: W.tulip1Brass.shade },
  lanternFlame: { position: 'absolute', left: -1.4, top: 6.4, width: 2.8, height: 5, borderRadius: 1.4, backgroundColor: W.tulip1Flame.base, transformOrigin: '50% 100%' },
  lanternBase: { position: 'absolute', left: -4.8, top: 14.2, width: 9.6, height: 2.4, borderRadius: 0.8, backgroundColor: W.tulip1Brass.base, borderWidth: 0.6, borderColor: INK },
  pool: { position: 'absolute', left: -34, top: -3, width: 68, height: 6, borderRadius: 3, backgroundColor: W.tulip1Light.base },
  aphid: { position: 'absolute', left: -1.8, top: -1.4, width: 3.6, height: 2.8, borderRadius: 1.4, backgroundColor: W.tulip1Aphid.base, borderWidth: 0.4, borderColor: W.tulip1Aphid.shade },
  aphidLeg: { position: 'absolute', left: -1.6, top: 1.2, width: 3.2, height: 0.5, backgroundColor: W.tulip1Aphid.shade },
  purse: { position: 'absolute', left: -3.6, top: -1, width: 7.2, height: 8, borderBottomLeftRadius: 3.6, borderBottomRightRadius: 3.6, borderTopLeftRadius: 1.4, borderTopRightRadius: 1.4, backgroundColor: W.tulip1Purse.base, borderWidth: 0.6, borderColor: INK },
  purseTie: { position: 'absolute', left: -3, top: 1.2, width: 6, height: 1, backgroundColor: W.tulip1Straw.base },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-09 — THE NEXT SPRING (the three tagged pots on the potting bench,
// clear of Clusius and the boy) and PIN THE PRICE (the three flowering pots on the plank by the gate, the brass tag
// in the boy's hand) read whole, answered right and wrong, on the tulip1-right / tulip1-wrong sheets.
export function Tulip1Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson} beats={BEATS} Scene={Tulip1Scene} band={[214, 514]}
      roles={{
        plain: { head: [], label: 'Carolus Clusius' },
        tophat: { head: CLUYT_HEAD, label: 'Dirck Cluyt' },
        cap: { head: BOY_HEAD, label: 'A garden boy' },
      }}
    />
  );
}
