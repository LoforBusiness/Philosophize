import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './caesar1Script';
import {
  U, WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs, seated,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { lipOf } from './stageSkin';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { OUTFITS } from './garb';

// ─────────────────────────────────────────────────────────────────────────────
// history-caesar-1, "Caesar and the Pirates" — the first lesson of History's second unit
// (LESSON_RULES group AW): one true story, told in costume. THE PLAIN ONE IS CAESAR, in
// the toga with the purple stripe; the top hat plays the pirate captain (red head wrap, a
// gold hoop, a curved Cilician blade), the cap a young pirate (ochre wrap).
//
// A DIALOGUE lesson (group AP): people talk and nobody narrates.
// AT2: silent extras: two pirates round the fire in the cove (they sing, eat, warm their
// hands, laugh, and are taken with the rest), and the Milesian boatman who sculls the
// ransom in; each does his own thing on every beat, at his own moment, and they sit
// apart so no two fuse.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// caesar1.mjs) laid in ONE WORLD 800 wide: the ship at x 0–400, the cove at x 400–800.
// The scene's own camera is the world's translation, `cam`: 0 on the ship, −400 in the
// cove, cut under a quick haze at the start of `island`. The night is the same cove drawn
// in the night's light and laid over the day, switched under a dark veil at the start of
// `fleet`. Figures are posed in SCREEN space (world x + cam).
//
//   SHIP, far → near: the morning sky, the Aegean, Pharmacusa on the horizon (262–394);
//   the PIRATE GALLEY (200–436), which slides in alongside on `board`, its deck rail at
//   432 (the pirates stand on it, then jump down); our BULWARK (rail 442–447) and DECK
//   (484–514; feet at 500); the swan's-neck stern post at the left edge, the MAST at 46,
//   the yard at 236 and the SAIL (8–146 × 240–370), which fills and eases; amphorae by the
//   stern, a hatch (232–280), a rope coil (394). On the deck the three CHESTS (centres 150,
//   192, 234; 40 wide, top 470, hip high) between Caesar (110) and the captain (290), and
//   the SACK of silver (374, then 320).
//   COVE (its own x 0–400): the noon sky, the sea between two headlands, the pirates'
//   galley beached at the right, the striped AWNING (92–188) over barrels; the sand from
//   456; the DECLAIMING ROCK at 38 (top 476), the MAT (68–150), seat stones at 184 and
//   248 round the FIRE (215), the captain's low ROCK at 300 (top 482). The ransom BOAT
//   noses in at the right (288–408, waterline 462). By night: the moon, stars, the fire up,
//   the Roman WARSHIP run in bow first (bow 304, deck 430), the fleet far out, and a camp
//   TABLE (180–292, top 474) with the governor's letter, the iron key and Caesar's ring.
//
//   b0   alone at the rail, reading; walks a few steps (creak 0.8s), unrolls more of the
//        scroll (paper 2.4s), looks out at the island (creak 4.0s), rolls a little back
//        (paper 5.2s); a dark sail shows on the horizon; then his line, a hand out toward
//        Rhodes and back to his chest.
//   b1   the galley slides alongside and bumps (thud 1.4s); the captain jumps down onto
//        the deck (plank 2.2s), then the young pirate; Caesar goes on reading.
//   b2   he rolls the scroll (paper 0.4s), tucks it away, smooths his toga, a hand on his
//        chest, a hand up to heaven for Venus, then pushes the captain's blade aside.
//   b3   the captain looks him up and down and holds up two fingers, twice.
//   b4   the young pirate heaves the sack of silver onto his shoulder (coin 0.6s), staggers
//        under it, and sets it down.             b5  Q1 PICK THE CHEST.
//   b6   Caesar sweeps a hand over the chests and taps FIFTY twice; its lid flies open; he
//        turns and waves toward the coast.
//   b7   the captain's blade arm sinks; he turns and points out to the island.
//   b8   the haze; the cove: the young pirate unrolls a mat, Caesar walks onto it and lies
//        down; the captain sits on his rock; the two by the fire start to sing.
//   b9   Caesar sits up and jabs a finger at them; they stop; he lies back down.
//   b10  the captain slumps; Caesar gets up, hands the young pirate his scroll, climbs his rock.
//   b11  he declaims from the scroll the young pirate holds open (paper 0.3s).
//   b12  the young pirate claps, twice; one at the fire claps; the captain doesn't.
//   b13  Caesar wags a finger at them all.       b14  the captain throws his head back laughing.
//   b15  the ransom boat sculls in (oar 0.2s); the captain gets up and takes coins out of a
//        chest to look at them (coin 2.0s, 3.2s).
//   b16  the dark; night: the warship glides in (oar 1.6s) with Caesar on her bow; they all
//        put their hands up.
//   b17  Caesar jumps down; their hands are tied.  b18  Q2 SEAL THE ORDER.
//   b19  he looks out to sea, hands on hips, then turns and raises a finger.
//   b20  the captain gives the young pirate a dry look and a shrug.   b21  at rest.
//
// Every figure has its own phase (N22), faces whom he talks to, never walks backwards
// (C18), and every hand that moves holds, rolls, taps, points, claps, pushes or counts.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('history');
const W = NATURAL;
const { SHADE } = TONE;
const TR = 0.85;
const K = K_FIG * 0.95;
/** The hand paths were laid out for a figure 0.85 high; they grow with him. */
const KS = K / 0.85;
const G = GROUND;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.0s) and the line together. */
const LINES = [11.22, 5.08, 5.03, 3.76, 4.7, 0, 6.47, 4.0, 5.1, 3.27, 3.82, 5.83, 2.01, 2.81, 3.71, 4.09, 3.69, 3.69, 0, 4.86, 5.2, 0, 0];

const TALK = 167;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const SAIL = at('sail');
const BOARD = at('board');
const INTRO = at('intro');
const PRICE = at('price');
const TALENT = at('talent');
const FIFTY = at('fifty');
const STUNNED = at('stunned');
const ISLAND = at('island');
const SLEEP = at('sleep');
const SIGH = at('sigh');
const POEM = at('poem');
const CLAP = at('clap');
const THREAT = at('threat');
const LAUGH = at('laugh');
const RANSOM = at('ransom');
const FLEET = at('fleet');
const CAUGHT = at('caught');
const WRITE = at('write');
const AFTER = at('after');
const Q1 = BEATS.map((b) => (b.chests ? 1 : 0));
const Q2 = BEATS.map((b) => (b.order ? 1 : 0));
const Q1N = Q1.indexOf(1);
const Q2N = Q2.indexOf(1);
const PLACE = BEATS.map((b) => b.place ?? 0);
/** Who speaks each beat, as a number the worklet can read: 1 Caesar, 2 the captain, 3 the young pirate. */
const SPK = BEATS.map((b) => (b.speaker === 'plain' ? 1 : b.speaker === 'tophat' ? 2 : b.speaker === 'cap' ? 3 : 0));

/** Seconds into a place change at which the world is swapped, under the veil. */
const CUT_S = 0.4;
const HX = 400;

// ── where everybody is at the START of each beat (WORLD x; the cove is x + 400) ──
// After a place change, the start is where the beat finds them once the veil lifts.
const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));
/** Caesar: the deck (200), the cove (52 → the mat at 112 → his rock at 42, top 476), the warship's bow (330, deck 430), the sand (306). */
const C_X = per((n) => (n === SAIL ? 78 : n <= FIFTY ? 110 : n === STUNNED ? 124 : n === ISLAND ? HX + 52 : n <= SIGH ? HX + 112
  : n < FLEET ? HX + 42 : n <= CAUGHT ? HX + 344 : HX + 330));
const C_G = per((n) => (n > SIGH && n < FLEET ? 476 : n === FLEET || n === CAUGHT ? 430 : G));
const C_D = per((n) => (n >= FLEET ? -1 : 1));
const C_LIE = per((n) => (n === SLEEP || n === SIGH ? 1 : 0));
/** The captain: on the galley (262 + the galley's offset), the deck (242), his rock in the cove (300), the night (150). */
const H_X = per((n) => (n <= BOARD ? 300 : n < ISLAND ? 280 : n < FLEET ? HX + 300 : HX + 168));
const H_G = per((n) => (n <= BOARD ? 432 : G));
const H_D = per((n) => (n >= FLEET ? 1 : -1));
const H_SEAT = per((n) => (n > ISLAND && n <= RANSOM ? 1 : 0));
/** The young pirate: on the galley (330 + offset), the deck (314, then 304), the cove (172 → 156 → 84), the night (112). */
const P_X = per((n) => (n <= BOARD ? 366 : n <= TALENT ? 352 : n < ISLAND ? 344 : n === ISLAND ? HX + 172 : n <= SIGH ? HX + 156
  : n < FLEET ? HX + 100 : HX + 112));
const P_G = per((n) => (n <= BOARD ? 432 : G));
const P_D = per((n) => (n >= FLEET ? 1 : -1));
/** The pirate at the fire: on the seat stone by day (206, facing the fire), on the big rock by night (44). */
const E1_X = per((n) => (n < FLEET ? HX + 206 : HX + 44));
/** How far off the galley rides before it comes alongside, and the boat, the warship and the fleet. */
const GALLEY_OFF = 300;
const BOAT_OFF = 130;
const SHIP_OFF = 120;
const FLEET_OFF = 160;

// ── the deck's three chests and the sack ────────────────────────────────────
const CHESTS = [
  { id: 'fifty', x: 150, mark: '50' },
  { id: 'ten', x: 192, mark: '10' },
  { id: 'twenty', x: 234, mark: '20' },
] as const;
const SACK0 = { x: 384, y: 500 };
const SACK1 = { x: 330, y: 500 };
// ── the cove ────────────────────────────────────────────────────────────────
const FIRE = { x: HX + 244, y: 497 };
const MAT = { x0: HX + 68, x1: HX + 150, y: 499 };
const SEAT_A = 11.4 / K;   // the seat stones' height, rig units (11.4 stage units)
const SEAT_H = 18 / K;     // the captain's rock (18 stage units)
const SEAT_R = 24 / K;     // the big rock (24 stage units)
/** The ransom boat at rest (its waterline) and the boatman's place at her stern. */
const BOAT = { x: HX + 346, y: 462 };
const BOATMAN = { x: HX + 388, g: 444 };
// ── by night ────────────────────────────────────────────────────────────────
const SHIP_BOW = { x: HX + 318, y: 440 };
const TORCHES = [[16, -40], [150, -44]] as const;
const FLEET_AT = { x: HX + 108, y: 420 };
const FLEET_TORCHES = [[34, -14], [150, -12]] as const;
const TABLE = { x: HX + 248, y: G, top: 474 };
const ORDER = [
  { id: 'letter', x: HX + 210, label: 'LETTER' },
  { id: 'key', x: HX + 248, label: 'KEY' },
  { id: 'ring', x: HX + 286, label: 'RING' },
] as const;

/** The captain's head pieces without his blade: the Romans take it (b17 on). */
const CAPTAIN_HEAD = OUTFITS.pirateCaptain.head.filter((p) => p.at === 'head');

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { twenty: 1, ten: 2, fifty: 3, letter: 4, key: 5, ring: 6 };

/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 11.22;
}
function sm(u: number): number {
  'worklet';
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}
/** A hand's path across a line: [share of line, x in front of him (his own frame), height above his feet, weight]. */
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
function hand(s: Stance, x: number, g: number, d: number, which: 1 | -1, lx: number, ly: number, w: number): Stance {
  'worklet';
  const dir = d < 0 ? -1 : 1;
  return w <= 0.001 ? s : reachHandTo(s, { x, groundY: g, k: K, dir }, which, x + lx * KS * dir, g - ly * KS, w);
}
/** A hand on its path for this beat, in the figure's own frame (AR7.2). */
function keyed(s: Stance, keys: readonly Key[] | null, u: number, x: number, g: number, d: number, which: 1 | -1): Stance {
  'worklet';
  if (!keys || keys.length === 0) return s;
  const k = keyAt(keys, u);
  return hand(s, x, g, d, which, k.lx, k.ly, k.w);
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
/** Up over [a, m], held, and back down over [z0, z1] — of a line `L` long, at time `b`. */
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
/** How long a figure takes to turn round through a profile before he sets off. */
const TURN_S = 0.36;
/**
 * A walk from `src` to `to` that starts `start` seconds into the beat — later if he is
 * facing the wrong way and must turn first (C18: he always walks forwards).
 */
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
const STILL: Walk = { x: 0, x0: 0, x1: 0, u: 1, walking: false, ws: 0, we: 0, wd: 0 };
/**
 * Which way a figure faces at time `b`: the scripted turns (shares of the line), eased
 * through a profile — but a walk wins: he turns to where he is going just before he sets off.
 */
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
/** One figure's body: walking, or holding its pose. */
function bodyOf(w: Walk, code: number, t: number, b: number, phase: number): Stance {
  'worklet';
  return w.walking
    ? travelStance(w.x0, w.x1, hHold(code, t, phase), hHold(code, t, phase), hLive(code, t, b, phase), w.u, WALK, 0)
    : hLive(code, t, b, phase);
}
/** A joint's place on the stage, out of a figure's bundle. */
function jointOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/**
 * A jump from (x0, g0) to (x1, g1) over [s0, s1] seconds: up `hop` units and down, the
 * knees tucked in the air and a little crouch to take off and to land.
 */
function jumpOf(b: number, s0: number, s1: number, x0: number, x1: number, g0: number, g1: number, hop: number) {
  'worklet';
  const f = clamp01((b - s0) / (s1 - s0));
  const e = f * f * (3 - 2 * f);
  const landed = b >= s1 ? Math.max(0, 1 - (b - s1) / 0.3) * Math.min(1, (b - s1) / 0.06) : 0;
  const crouch = b < s0 ? clamp01((b - (s0 - 0.18)) / 0.18) : f < 0.12 ? 1 - f / 0.12 : 0;
  return {
    x: lerp(x0, x1, e), g: lerp(g0, g1, f) - hop * Math.sin(Math.PI * f),
    air: b > s0 && b < s1 ? Math.sin(Math.PI * f) : 0,
    squash: Math.max(landed, crouch),
  };
}
/** The knees drawn up in the air, and a crouch on take-off and landing. */
function tuck(s: Stance, air: number, squash: number): Stance {
  'worklet';
  if (air <= 0.001 && squash <= 0.001) return s;
  return {
    ...s,
    bob: s.bob - 7 * squash,
    tilt: s.tilt - 0.12 * squash - 0.08 * air,
    footL: { x: s.footL.x - 5 * air, y: s.footL.y - 9 * air },
    footR: { x: s.footR.x + 4 * air, y: s.footR.y - 12 * air },
  };
}
/** Sitting up on the ground, legs straight out, hands on the lap (Caesar on his mat). */
const SITG: Stance = {
  tilt: 0.06, neck: -0.04, bob: 4 - U.standH,
  footL: { x: 31, y: 0 }, footR: { x: 34, y: 0 },
  fistL: { x: 12, y: -3 }, fistR: { x: 15, y: -2 }, adv: 0,
};
/** Lying on his back on the mat, his hands on his chest. */
const LIE: Stance = {
  ...SITG, tilt: 1.5, neck: -0.5,
  fistL: { x: -9, y: -6 }, fistR: { x: -5, y: -5 },
};
/** A seated figure on a stone `h` rig units high, still (no clock), feet out by `reach`. */
function seatOf(h: number, reach: number): Stance {
  'worklet';
  return seated(h, 0, reach);
}
/** Standing ↔ sitting on the ground ↔ lying, with a lean over the feet as he goes down or up. */
function groundOf(s: Stance, sit: number, lie: number): Stance {
  'worklet';
  if (sit <= 0.001) return s;
  const down = Math.sin(Math.PI * sit);
  let r = leanOf(mixStance(s, SITG, sit), 0.4 * down, 0.1 * down);
  if (lie > 0.001) r = mixStance(r, LIE, lie);
  return r;
}
/** Standing ↔ seated on a stone, rising and sitting the way a body does (hands to the knees). */
function seatMix(s: Stance, seat: Stance, w: number): Stance {
  'worklet';
  if (w <= 0.001) return s;
  const rise = Math.sin(Math.PI * w);
  const r = leanOf(mixStance(s, seat, w), 0.42 * rise, 0.12 * rise);
  if (rise <= 0.001) return r;
  return {
    ...r,
    fistL: { x: lerp(r.fistL.x, 13, 0.8 * rise), y: lerp(r.fistL.y, 2, 0.8 * rise) },
    fistR: { x: lerp(r.fistR.x, 16, 0.8 * rise), y: lerp(r.fistR.y, 3, 0.8 * rise) },
  };
}
/** Both hands together in front at the waist, the rope round the wrists. */
function tied(s: Stance, x: number, g: number, d: number, w: number, lift: number): Stance {
  'worklet';
  const r = hand(s, x, g, d, 1, 12, 40 + lift, w);
  return hand(r, x, g, d, -1, 10, 41 + lift, w);
}
/** Both hands up, palms out, in front of him. */
function handsUp(s: Stance, x: number, g: number, d: number, w: number, hi: number): Stance {
  'worklet';
  const r = hand(s, x, g, d, 1, 12, hi, w);
  return hand(r, x, g, d, -1, 6, hi - 4, w);
}

export default function Caesar1Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldC = useHeld();
  const heldH = useHeld();
  const heldP = useHeld();
  const heldE1 = useHeld();
  const heldB = useHeld();
  const cv = useCarry(20);
  const on = useLinger(i);
  const pk = useSharedValue(0);
  useEffect(() => {
    pk.value = picked ? (PICK[picked] ?? 0) : 0;
  }, [picked, pk]);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const b0 = bt.value;
    const t = clock.value;
    // a step BACK snaps everyone to where the beat starts, under a quick veil
    const seenN = carrySource(cv, 0, n, n - 1);
    carry(cv, 0, n, n, n, 1);
    const back = seenN > n;
    const cutBeat = n === ISLAND || n === FLEET;
    // before the cut of a place change, the old place holds as the last beat left it
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
    /** A reaction carried in slot `k`: played on its question beat, left where it ended after. */
    const kept = (k: number, code: number, Q: readonly number[], QN: number) => {
      'worklet';
      return Q[n] ? ans(code, Q) : n > QN && carrySource(cv, k, n, 0) > 0.5 ? 1 : 0;
    };
    const keptTr = (Q: readonly number[]) => {
      'worklet';
      return Q[n] ? tr : 1;
    };
    const place = PLACE[nv];
    const cam = place === 0 ? 0 : -HX;
    const night = place === 2 ? 1 : 0;
    // the veils: the sea haze into the cove, the dark into the night, and a quick one on a step back
    const cut = cutBeat && !back ? stage(b0, 1, 0.06, CUT_S) * (1 - stage(b0, 1, CUT_S, CUT_S + 0.55)) : 0;
    const backVeil = back ? 1 - stage(b0, 1, 0, 0.45) : 0;
    const haze = n === ISLAND ? cut : 0;
    const dark = Math.max(n === FLEET ? cut : 0, backVeil);
    // a fresh start (after a cut, or a step back) begins from the beat's own start; otherwise from what is on screen
    const fresh = back || (cutBeat && !pre);
    const src = (slot: number, table: readonly number[]) => {
      'worklet';
      return fresh ? table[nv] : carrySource(cv, slot, n, table[nv]);
    };
    const sp = (who: number) => {
      'worklet';
      return SPK[nv] === who;
    };

    // ══ CAESAR ═══════════════════════════════════════════════════════════════
    const cxs = src(1, C_X);
    const cds = src(2, C_D);
    let cw: Walk = STILL;
    let cx = cxs;
    let cg = C_G[nv];
    let cTurns: (readonly number[])[] = [[0, C_D[nv]]];
    let sit = C_LIE[nv];
    let lie = C_LIE[nv];
    let stepUp = 0;
    let cAir = 0;
    let cSq = 0;
    if (nv === SAIL) cw = walkOf(cxs, 110, 1.0, cds, b);
    if (nv === FIFTY) cw = walkOf(cxs, 124, 0.1, cds, b);
    if (nv === ISLAND) {
      cw = walkOf(cxs, HX + 112, 0.6 * L, cds, b);
      sit = st(0.82, 0.9);
      lie = st(0.9, 0.98);
    }
    if (nv === SLEEP) {
      lie = 1 - st(0.02, 0.14) + st(0.7, 0.86);
      sit = 1;
    }
    if (nv === SIGH) {
      lie = 1 - st(0.0, 0.08);
      sit = 1 - st(0.08, 0.2);
      cTurns = [[0, 1], [0.37, -1], [0.8, 1]];
      cw = walkOf(cxs, HX + 70, 0.42 * L, 1, b);
      stepUp = st(0.68, 0.78);
    }
    if (nv === FLEET) cx = HX + 344 + SHIP_OFF * (1 - ease01((b - 0.4) / 2.6));
    if (nv === CAUGHT) {
      const j = jumpOf(b, 0.15, 0.7, HX + 344, HX + 330, 430, G, 14);
      cx = j.x; cg = j.g; cAir = j.air; cSq = j.squash;
    }
    if (nv === WRITE) cTurns = [[0, -1], [0.04, 1], [0.58, -1]];
    if (cw.wd !== 0) cx = cw.x;
    if (stepUp > 0) {
      cx = lerp(cx, HX + 42, stepUp);
      cg = lerp(G, 476, Math.min(1, stepUp * 1.3));
    }
    const cxS = carry(cv, 1, n, cx, cx, 1) + cam;
    const cd = carry(cv, 2, n, 0, faceOf(cds, cTurns, b, L, cw), 1);
    const cgS = carry(cv, 3, n, cg, cg, 1);
    const cCode = sp(1) ? TALK : NOD;
    let sc = bodyOf(cw, cCode, t, b, 0);
    let cR: readonly Key[] | null = null;
    let cL: readonly Key[] | null = null;
    let cLean = 0;
    let cNeck = 0;
    if (nv === SAIL) {
      // reading the scroll in both hands; then a hand out toward Rhodes, and to his chest
      cR = [[0, 17, 54, 1], [S0(2.3), 17, 54, 1], [S0(2.6), 19, 55, 1], [S0(6.1), 19, 55, 1], [S0(6.6), 26, 74, 1], [S0(8.2), 26, 76, 1], [S0(8.8), 6, 62, 1], [S0(10.4), 6, 62, 1]];
      cL = [[0, 4, 52, 1], [S0(2.3), 4, 52, 1], [S0(2.6), 1, 52, 1], [S0(5.0), 1, 52, 1], [S0(5.4), 6, 52, 1], [S0(6.1), 6, 52, 1], [S0(6.5), 8, 44, 1]];
      cNeck = 0.12 * (1 - st(S0(2.9), S0(3.2)) + st(S0(4.3), S0(4.6))) * (1 - st(S0(6.0), S0(6.3)))
        - 0.1 * st(S0(3.0), S0(3.4)) * (1 - st(S0(4.2), S0(4.5))) - 0.08 * st(S0(8.6), S0(9.0));
    }
    if (nv === BOARD) {
      // he goes on reading, and spares them one glance
      cR = [[0, 6, 62, 1], [0.1, 17, 54, 1]];
      cL = [[0, 8, 44, 1], [0.1, 4, 52, 1]];
      cNeck = 0.12 * (1 - bump(0.46, 0.52, 0.62, 0.7)) - 0.04 * bump(0.46, 0.52, 0.62, 0.7);
    }
    if (nv === INTRO) {
      cR = [[0, 17, 54, 1], [0.08, 10, 56, 1], [0.16, 5, 62, 1], [0.2, 8, 62, 1], [0.27, 8, 40, 1], [0.32, 4, 62, 1], [0.46, 4, 62, 1],
        [0.56, 12, 108, 1], [0.66, 12, 108, 1], [0.74, 2, 70, 1], [0.8, -2, 74, 1], [0.86, 2, 70, 1], [0.94, 8, 44, 0.6]];
      cL = [[0, 4, 52, 1], [0.08, 8, 56, 1], [0.16, 5, 62, 1], [0.24, 6, 46, 0.4]];
      cNeck = -0.1 * st(0.2, 0.3) - 0.06 * bump(0.5, 0.58, 0.66, 0.74) + 0.16 * bump(0.72, 0.78, 0.86, 0.92);
    }
    if (nv === PRICE) {
      cR = [[0, 8, 44, 0.6], [0.5, 4, 40, 1]];
      cL = [[0.5, 4, 42, 0], [0.58, 2, 40, 1]];
      cNeck = -0.1 - 0.06 * st(0.5, 0.6);
    }
    if (nv === TALENT) {
      cR = [[0, 4, 40, 1], [0.3, 4, 40, 1], [0.38, 10, 74, 1], [0.7, 10, 74, 1], [0.78, 4, 40, 1]];
      cL = [[0, 2, 40, 1]];
      cNeck = -0.06 + 0.1 * bump(0.3, 0.38, 0.7, 0.78);
    }
    if (nv === Q1N) {
      cR = [[0, 4, 40, 1], [0.1, 8, 44, 0.6]];
      cL = [[0, 2, 40, 1], [0.1, 6, 42, 0.5]];
      cNeck = 0.14 * st(0.04, 0.14);
      // a right answer: chin up, pleased; a wrong one: he turns his head from it
      const ok = ans(3, Q1);
      const no = ans(1, Q1) + ans(2, Q1);
      cNeck += -0.22 * ok - 0.16 * Math.sin(Math.PI * Math.min(1, no * 1.4));
      cLean += -0.06 * ok;
    }
    if (nv === FIFTY) {
      cR = [[0.08, 8, 44, 0.6], [0.14, 30, 66, 1], [0.24, 26, 52, 1], [0.3, 24, 40, 1], [0.34, 26, 31, 1], [0.37, 25, 37, 1], [0.41, 26, 31, 1],
        [0.47, 14, 50, 1], [0.6, 14, 56, 1], [0.66, 24, 80, 1], [0.88, 26, 82, 1], [0.96, 8, 44, 0.6]];
      cLean = 0.28 * bump(0.28, 0.33, 0.43, 0.48);
      cNeck = 0.12 * bump(0.12, 0.2, 0.44, 0.5) - 0.1 * bump(0.62, 0.7, 0.9, 0.98);
    }
    if (nv === STUNNED) {
      cR = [[0, 6, 40, 1]];
      cL = [[0, 4, 40, 1]];
      cNeck = -0.1 * bump(0.1, 0.2, 0.5, 0.6);
    }
    if (nv === ISLAND && !pre) {
      cNeck = -0.16 * bump(0.12, 0.2, 0.32, 0.4) + 0.12 * bump(0.44, 0.5, 0.56, 0.6);
      cR = [[0.12, 6, 40, 0], [0.2, 8, 44, 0.8], [0.4, 8, 44, 0.8], [0.5, 6, 40, 0]];
    }
    if (nv === SIGH) cR = [[0.18, 10, 50, 0], [0.22, 6, 62, 1], [0.27, 22, 56, 1], [0.34, 22, 56, 1], [0.4, 8, 44, 0.4]];
    if (nv === POEM) {
      cR = [[0, 6, 44, 0.6], [0.12, 22, 84, 1], [0.36, 24, 88, 1], [0.46, 8, 44, 0.6], [0.55, 26, 70, 1], [0.7, 26, 70, 1], [0.78, 4, 62, 1], [0.95, 4, 62, 1]];
      cL = [[0, 4, 40, 0.5]];
      cNeck = 0.1 * bump(0.02, 0.08, 0.1, 0.14) - 0.1 * st(0.76, 0.84);
    }
    if (nv === CLAP) {
      cR = [[0, 4, 62, 1], [0.2, 4, 62, 1], [0.3, 6, 44, 0.5]];
      cLean = 0.16 * bump(0.3, 0.42, 0.56, 0.68);
      cNeck = -0.1 + 0.12 * bump(0.3, 0.42, 0.56, 0.68);
    }
    if (nv === THREAT) {
      cR = [[0, 6, 44, 0.5], [0.1, 18, 82, 1], [0.24, 23, 84, 1], [0.38, 13, 84, 1], [0.52, 20, 82, 1], [0.62, 18, 82, 1], [0.78, 6, 44, 0.5]];
      cNeck = -0.08;
    }
    if (nv === LAUGH) {
      cR = [[0.15, 6, 44, 0], [0.24, 4, 38, 1]];
      cL = [[0.15, 4, 44, 0], [0.24, 2, 38, 1]];
      cNeck = -0.14 * st(0.2, 0.3);
    }
    if (nv === RANSOM) {
      cR = [[0, 4, 38, 1], [0.5, 4, 38, 1], [0.56, 6, 62, 1], [0.66, 8, 36, 1], [0.74, 4, 38, 1]];
      cL = [[0, 2, 38, 1]];
      cNeck = 0.1 * bump(0.1, 0.2, 0.4, 0.5);
    }
    if (nv === FLEET && !pre) {
      cR = [[0.7, 6, 44, 0], [0.8, 24, 66, 1], [0.97, 24, 66, 1]];
      cL = [[0.72, 4, 44, 0], [0.82, 20, 74, 1], [0.97, 20, 74, 1]];
      cNeck = -0.06;
    }
    if (nv === CAUGHT) {
      cR = [[0.3, 6, 44, 0], [0.4, 4, 38, 1]];
      cL = [[0.3, 4, 44, 0], [0.4, 2, 38, 1]];
      cNeck = -0.08 * st(0.4, 0.5);
    }
    if (nv === Q2N) {
      cR = [[0, 4, 38, 1]];
      cL = [[0, 2, 38, 1]];
      cNeck = 0.16 * st(0.02, 0.12) - 0.2 * ans(6, Q2);
      cLean = 0.06 * ans(6, Q2);
    }
    if (nv === WRITE) {
      cR = [[0, 4, 38, 1], [0.56, 4, 38, 1], [0.66, 14, 94, 1], [0.92, 14, 94, 1]];
      cL = [[0, 2, 38, 1]];
      cNeck = -0.14 * bump(0.1, 0.16, 0.5, 0.56) - 0.06 * st(0.64, 0.7);
    }
    if (nv === AFTER) {
      cR = [[0, 6, 44, 0.6], [0.2, 4, 38, 1]];
      cL = [[0, 2, 38, 1]];
      cNeck = -0.06 + 0.12 * bump(0.76, 0.82, 0.88, 0.94);
    }
    if (nv > AFTER) {
      cR = [[0, 4, 38, 1]];
      cL = [[0, 2, 38, 1]];
      cNeck = -0.06 + 0.1 * bump(0.3, 0.4, 0.5, 0.6);
    }
    sc = keyed(sc, cR, u, cxS, cgS, cd, 1);
    sc = keyed(sc, cL, u, cxS, cgS, cd, -1);
    sc = leanOf(sc, cLean, cNeck);
    // on the ground: sitting up, lying back; and the step up onto the rock
    sc = groundOf(sc, sit, lie);
    if (nv === SLEEP) sc = keyed(sc, [[0.12, 15, 22, 0], [0.18, 30, 40, 1], [0.24, 26, 38, 1], [0.3, 30, 40, 1], [0.52, 30, 40, 1], [0.62, 15, 22, 0]], u, cxS, cgS, cd, 1);
    if (stepUp > 0 && stepUp < 1) {
      const lift = Math.sin(Math.PI * stepUp);
      sc = { ...sc, footL: { x: sc.footL.x + 6 * lift, y: sc.footL.y - 10 * lift }, tilt: sc.tilt - 0.1 * lift };
    }
    sc = tuck(sc, cAir, cSq);
    const prevC = carryFrom(heldC, n, hHold(cCode, t, 0));
    const figC = keepHeld(heldC, cw.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));

    // ══ THE CAPTAIN ══════════════════════════════════════════════════════════
    const hxs = src(4, H_X);
    const hds = src(5, H_D);
    let hw: Walk = STILL;
    let hx = hxs;
    let hg = H_G[nv];
    let hTurns: (readonly number[])[] = [[0, H_D[nv]]];
    let hAir = 0;
    let hSq = 0;
    let hSeat = H_SEAT[nv];
    const galleyOff = nv === SAIL ? GALLEY_OFF : nv === BOARD ? GALLEY_OFF * (1 - ease01(b / 1.4)) : 0;
    if (nv <= BOARD) hx = 300 + galleyOff;
    if (nv === BOARD) {
      const j = jumpOf(b, 1.6, 2.15, 300, 280, 432, G, 16);
      if (b > 1.6) { hx = j.x; hg = j.g; }
      hAir = j.air; hSq = j.squash;
    }
    if (nv === TALENT) hTurns = [[0, -1], [0.08, 1], [0.84, -1]];
    if (nv === STUNNED) hTurns = [[0, -1], [0.34, 1]];
    if (nv === ISLAND && !pre) hSeat = st(0.62, 0.76);
    if (nv === RANSOM) { hSeat = 1 - st(0.08, 0.22); hTurns = [[0, -1], [0.24, 1], [0.9, -1]]; }
    if (nv === AFTER) hTurns = [[0, 1], [0.05, -1], [0.7, 1]];
    if (hw.wd !== 0) hx = hw.x;
    const hxS = carry(cv, 4, n, hx, hx, 1) + cam;
    const hd0 = carry(cv, 5, n, 0, faceOf(hds, hTurns, b, L, hw), 1);
    const hgS = carry(cv, 6, n, hg, hg, 1);
    const hCode = sp(2) ? TALK : NOD;
    let sh = bodyOf(hw, hCode, t, b, 1);
    let hR: readonly Key[] | null = [[0, 18, 60, 1]];
    let hL: readonly Key[] | null = null;
    let hLean = 0;
    let hNeck = 0;
    let fingers = 0;
    if (nv === SAIL) hR = [[0, 16, 56, 1]];
    if (nv === BOARD) {
      hR = [[0, 16, 58, 1], [0.1, 22, 76, 1], [0.3, 22, 76, 1], [0.48, 24, 64, 1]];
      hL = [[0.1, 6, 44, 0], [0.18, 16, 66, 1], [0.3, 16, 66, 1], [0.44, 6, 44, 0]];
    }
    if (nv === INTRO) {
      hR = [[0, 24, 64, 1], [0.5, 24, 64, 1], [0.6, 18, 52, 1]];
      hL = [[0.5, 6, 44, 0], [0.6, 6, 50, 1], [0.86, 6, 50, 1], [0.95, 6, 44, 0]];
      hNeck = 0.08 * bump(0.5, 0.6, 0.66, 0.74) - 0.12 * bump(0.8, 0.86, 0.94, 1);
    }
    if (nv === PRICE) {
      hR = [[0, 22, 68, 1], [0.4, 20, 60, 1]];
      hL = [[0.36, 6, 44, 0], [0.44, 16, 92, 1], [0.54, 16, 92, 1], [0.6, 14, 82, 1], [0.66, 16, 94, 1], [0.8, 16, 94, 1], [0.9, 6, 44, 0]];
      hNeck = 0.2 * bump(0.04, 0.12, 0.16, 0.22) - 0.04 * st(0.22, 0.3);
      fingers = bump(0.42, 0.48, 0.84, 0.9);
    }
    if (nv === TALENT) {
      hR = [[0, 18, 56, 1]];
      hL = [[0.3, 6, 44, 0], [0.4, 6, 52, 1], [0.7, 6, 52, 1], [0.78, 6, 44, 0]];
      hNeck = 0.06 * bump(0.5, 0.56, 0.66, 0.72);
    }
    if (nv === Q1N) {
      hR = [[0, 18, 56, 1]];
      hL = [[0, 6, 44, 0], [0.4, 8, 48, 0.6]];
      hNeck = 0.08 * st(0.1, 0.2);
    }
    if (nv === FIFTY) {
      hR = [[0, 18, 56, 1], [0.4, 14, 48, 1]];
      hLean = -0.08 * bump(0.36, 0.44, 0.7, 0.8);
      hNeck = -0.1 * bump(0.36, 0.44, 0.7, 0.8);
    }
    if (nv === STUNNED) {
      hR = [[0, 14, 48, 1], [0.2, 6, 34, 1], [0.4, 8, 40, 1], [0.5, 26, 80, 1], [0.86, 27, 82, 1], [0.95, 10, 44, 1]];
      hNeck = 0.12 * bump(0.02, 0.14, 0.24, 0.3);
    }
    // seated on his rock in the cove: the blade across his knees
    if (place === 1) hR = [[0, 14, 30, 0.6]];
    if (nv === ISLAND && !pre) {
      hR = [[0, 12, 44, 1], [0.6, 12, 44, 1], [0.78, 14, 30, 0.6]];
      hL = [[0, 10, 44, 1], [0.6, 10, 44, 1], [0.76, 6, 30, 0.4]];
    }
    if (nv === SLEEP) {
      hL = [[0.3, 8, 30, 0.4], [0.42, 10, 70, 1], [0.86, 10, 70, 1], [0.96, 8, 30, 0.4]];
      hNeck = 0.16 * bump(0.36, 0.44, 0.86, 0.96);
    }
    if (nv === SIGH) {
      hLean = 0.3 * st(0.04, 0.2) * (1 - 0.6 * st(0.5, 0.6));
      hNeck = 0.3 * st(0.04, 0.2) * (1 - st(0.5, 0.6));
      hR = [[0, 14, 30, 0.6], [0.55, 14, 30, 0.6], [0.62, 22, 46, 1], [0.84, 22, 46, 1], [0.92, 14, 30, 0.6]];
      hL = [[0, 6, 28, 0.6], [0.2, 16, 26, 1]];
    }
    if (nv === POEM) {
      hLean = 0.16;
      hL = [[0, 16, 26, 1], [0.2, 14, 64, 1]];
      hNeck = 0.14 * st(0.2, 0.3);
    }
    if (nv === CLAP) {
      hLean = 0.16;
      hL = [[0, 14, 64, 1], [0.14, 14, 40, 1]];
      hR = [[0, 14, 30, 0.6], [0.14, 14, 40, 0.9]];
      hNeck = 0.14 - 0.2 * bump(0.3, 0.4, 0.6, 0.7);
    }
    if (nv === THREAT) {
      hLean = 0.16 - 0.16 * st(0.1, 0.2);
      hL = [[0, 14, 40, 1], [0.2, 12, 30, 0.6]];
      hR = [[0, 14, 40, 0.9], [0.2, 14, 30, 0.6]];
      hNeck = -0.08 * st(0.1, 0.2);
    }
    if (nv === LAUGH) {
      const laugh = bump(0.06, 0.18, 0.7, 0.84);
      hLean = -0.18 * laugh + 0.06 * laugh * Math.sin(Math.PI * 2 * clamp01((u - 0.24) / 0.36));
      hNeck = -0.4 * laugh;
      hL = [[0, 12, 30, 0.6], [0.3, 14, 40, 1], [0.36, 14, 26, 1], [0.48, 14, 40, 1], [0.54, 14, 26, 1], [0.7, 12, 30, 0.6]];
    }
    if (nv === RANSOM) {
      hR = [[0, 14, 30, 0.6], [0.22, 10, 44, 0.8]];
      hL = [[0.28, 6, 44, 0], [0.42, 16, 62, 1], [0.54, 14, 84, 1], [0.72, 14, 84, 1], [0.79, 17, 64, 1], [0.92, 20, 74, 1]];
      hLean = 0.14 * bump(0.4, 0.46, 0.48, 0.52) + 0.12 * bump(0.74, 0.78, 0.8, 0.84);
      hNeck = -0.08 * bump(0.54, 0.6, 0.68, 0.74);
    }
    if (place === 2) hR = null;
    if (nv === FLEET && !pre) hNeck = -0.1 * st(0.4, 0.5);
    if (nv === AFTER) {
      hNeck = 0.18 * bump(0.08, 0.18, 0.62, 0.7);
      hLean = 0.04 * bump(0.4, 0.48, 0.54, 0.62);
    }
    sh = keyed(sh, hR, u, hxS, hgS, hd0, 1);
    sh = keyed(sh, hL, u, hxS, hgS, hd0, -1);
    // by night: hands up as the warship lands, then tied
    if (place === 2) {
      const up = nv === FLEET ? st(0.8, 0.9) : nv === CAUGHT ? 1 - st(0.05, 0.22) : 0;
      const tie = nv === CAUGHT ? st(0.05, 0.22) : nv > CAUGHT ? 1 : 0;
      const shrug = nv === CAUGHT ? 10 * bump(0.48, 0.58, 0.64, 0.74) : nv === AFTER ? 12 * bump(0.4, 0.48, 0.54, 0.62) + 10 * bump(0.76, 0.82, 0.92, 0.98) : 0;
      sh = tied(sh, hxS, hgS, hd0, tie, shrug);
      sh = handsUp(sh, hxS, hgS, hd0, up, 96);
      if (nv === CAUGHT) hNeck += -0.08 * bump(0.48, 0.56, 0.64, 0.72);
      if (nv === Q2N) hNeck += -0.18 * ans(5, Q2) + 0.12 * ans(6, Q2) - 0.06 * ans(4, Q2);
      if (nv === WRITE) hNeck += -0.12 * bump(0.3, 0.4, 0.5, 0.6);
      if (nv > AFTER) hNeck += 0.1 * bump(0.2, 0.3, 0.4, 0.5);
    }
    sh = leanOf(sh, hLean, hNeck);
    if (hSeat > 0) {
      let seat = leanOf(seatOf(SEAT_H, 13), hLean, hNeck);
      seat = keyed(seat, hR, u, hxS, hgS, hd0, 1);
      seat = keyed(seat, hL, u, hxS, hgS, hd0, -1);
      sh = seatMix(sh, seat, hSeat);
    }
    sh = tuck(sh, hAir, hSq);
    const prevH = carryFrom(heldH, n, hHold(hCode, t, 1));
    const figH = keepHeld(heldH, hw.walking ? mixKeepLegs(prevH, sh, tr) : mixStance(prevH, sh, tr));

    // ══ THE YOUNG PIRATE ═════════════════════════════════════════════════════
    const pxs = src(7, P_X);
    const pds = src(8, P_D);
    let pw: Walk = STILL;
    let px = pxs;
    let pg = P_G[nv];
    let pTurns: (readonly number[])[] = [[0, P_D[nv]]];
    let pAir = 0;
    let pSq = 0;
    let kneel = 0;
    if (nv <= BOARD) px = 366 + galleyOff;
    if (nv === BOARD) {
      const j = jumpOf(b, 1.95, 2.5, 366, 352, 432, G, 16);
      if (b > 1.95) { px = j.x; pg = j.g; }
      pAir = j.air; pSq = j.squash;
    }
    if (nv === TALENT) {
      pTurns = [[0, -1], [0.02, 1], [0.26, -1]];
      pw = walkOf(pxs, 344, 0.36 * L, -1, b);
    }
    if (nv === ISLAND && !pre) {
      pw = walkOf(pxs, HX + 156, 0.12 * L, -1, b);
      kneel = bump(0.3, 0.38, 0.74, 0.82);
    }
    if (nv === SIGH) pw = b < 0.42 * L ? walkOf(pxs, HX + 136, 0.04 * L, -1, b) : walkOf(HX + 136, HX + 100, 0.44 * L, -1, b);
    if (nv === RANSOM) pTurns = [[0, -1], [0.16, 1]];
    if (pw.wd !== 0) px = pw.x;
    const pxS = carry(cv, 7, n, px, px, 1) + cam;
    const pd = carry(cv, 8, n, 0, faceOf(pds, pTurns, b, L, pw), 1);
    const pgS = carry(cv, 9, n, pg, pg, 1);
    const pCode = sp(3) ? TALK : NOD;
    let spp = bodyOf(pw, pCode, t, b, 2);
    let pR: readonly Key[] | null = null;
    let pL: readonly Key[] | null = null;
    let pLean = 0;
    let pNeck = 0;
    if (nv === BOARD) {
      pR = [[0.5, 6, 44, 0], [0.6, 16, 58, 1]];
      pL = [[0.5, 4, 44, 0], [0.62, 12, 56, 1]];
    }
    if (nv === INTRO) {
      pR = [[0, 16, 58, 1], [0.3, 8, 46, 0.6]];
      pL = [[0, 12, 56, 1], [0.3, 6, 46, 0.4], [0.5, 4, 92, 1], [0.56, 6, 96, 1], [0.62, 4, 92, 1], [0.7, 6, 46, 0.4]];
      pNeck = 0.1 * bump(0.5, 0.56, 0.64, 0.7);
    }
    if (nv === PRICE) pLean = 0.08 * bump(0.3, 0.4, 0.46, 0.56) + 0.08 * bump(0.62, 0.7, 0.74, 0.82);
    if (nv === TALENT) {
      // bend, both hands under the sack, up onto his shoulder; a stagger; set it down
      pR = [[0.04, 8, 46, 0], [0.1, 26, 12, 1], [0.14, 26, 14, 1], [0.24, 18, 56, 1], [0.8, 18, 56, 1], [0.86, 22, 30, 1], [0.92, 22, 14, 1], [0.97, 8, 44, 0.3]];
      pL = [[0.04, 6, 46, 0], [0.1, 18, 14, 1], [0.14, 18, 16, 1], [0.24, 12, 54, 1], [0.8, 12, 54, 1], [0.86, 16, 30, 1], [0.92, 16, 14, 1], [0.97, 6, 44, 0.3]];
      pLean = 0.5 * bump(0.06, 0.1, 0.14, 0.22) + 0.16 * Math.sin(Math.PI * 2 * clamp01((u - 0.36) / 0.36)) * bump(0.34, 0.38, 0.68, 0.74)
        + 0.4 * bump(0.82, 0.88, 0.92, 0.98);
    }
    if (nv === Q1N) pNeck = 0.06 * st(0.1, 0.2);
    if (nv === FIFTY) {
      pLean = -0.12 * bump(0.36, 0.42, 0.62, 0.7);
      pR = [[0.3, 6, 44, 0], [0.38, 8, 74, 1], [0.66, 8, 74, 1], [0.72, 6, 44, 0]];
    }
    if (nv === STUNNED) pNeck = -0.08 * bump(0.55, 0.62, 0.8, 0.88);
    // the mat, rolled in his hands (b8), unrolled on his knees
    if (nv === ISLAND && !pre) {
      pR = [[0, 14, 52, 1], [0.38, 18, 30, 1], [0.48, 30, 6, 1], [0.6, 32, 6, 1], [0.72, 14, 40, 0.6], [0.8, 8, 44, 0], [0.84, 6, 44, 0], [0.9, 24, 84, 1], [0.98, 26, 84, 1]];
      pL = [[0, 10, 50, 1], [0.38, 14, 30, 1], [0.48, 28, 8, 1], [0.6, 30, 8, 1], [0.72, 10, 40, 0.4], [0.8, 6, 44, 0]];
      pLean = 0.4 * bump(0.44, 0.5, 0.62, 0.7);
    }
    if (nv === SLEEP) {
      pLean = -0.14 * bump(0.12, 0.2, 0.5, 0.62);
      pR = [[0.12, 6, 44, 0], [0.2, 16, 72, 1], [0.5, 16, 72, 1], [0.62, 6, 44, 0]];
      pL = [[0.12, 4, 44, 0], [0.2, 12, 68, 1], [0.5, 12, 68, 1], [0.62, 4, 44, 0]];
    }
    // the scroll: taken from Caesar (b10), held open for him (b11), under his arm after
    if (nv === SIGH) pL = [[0.2, 6, 44, 0], [0.3, 20, 56, 1], [0.38, 14, 52, 1]];
    if (nv === POEM) {
      pR = [[0, 8, 46, 0.6], [0.04, 24, 84, 1]];
      pL = [[0, 14, 52, 1], [0.04, 24, 58, 1]];
      pNeck = -0.1;
    }
    if (nv === CLAP) {
      pR = [[0, 24, 84, 1], [0.14, 21, 64, 1], [0.26, 14, 62, 1], [0.36, 21, 64, 1], [0.48, 14, 62, 1], [0.86, 14, 60, 1]];
      pL = [[0, 24, 58, 1], [0.1, 12, 60, 1], [0.8, 12, 56, 1]];
      pNeck = -0.08;
    }
    if (place === 1 && nv > CLAP) pL = [[0, 12, 56, 1]];
    if (nv === THREAT) pLean = -0.1 * bump(0.12, 0.2, 0.6, 0.7);
    if (nv === LAUGH) {
      const laugh = bump(0.28, 0.38, 0.76, 0.88);
      pLean = -0.12 * laugh;
      pNeck = -0.3 * laugh;
      pR = [[0.28, 6, 44, 0], [0.38, 8, 40, 1], [0.76, 8, 40, 1], [0.88, 6, 44, 0]];
    }
    if (nv === RANSOM) pNeck = 0.06 * bump(0.5, 0.56, 0.84, 0.9);
    if (place === 2) {
      const up = nv === FLEET ? st(0.84, 0.94) : nv === CAUGHT ? 1 - st(0.08, 0.26) : 0;
      const tie = nv === CAUGHT ? st(0.08, 0.26) : nv > CAUGHT ? 1 : 0;
      const shrug = nv === AFTER ? 10 * bump(0.5, 0.58, 0.66, 0.74) : 0;
      spp = tied(spp, pxS, pgS, pd, tie, shrug);
      spp = handsUp(spp, pxS, pgS, pd, up, 92);
      if (nv === CAUGHT) pNeck += 0.18 * st(0.5, 0.62);
      if (nv === Q2N) pNeck += 0.14 - 0.12 * ans(6, Q2);
      if (nv === WRITE) pNeck += 0.1 * bump(0.2, 0.3, 0.7, 0.8);
      if (nv === AFTER) pLean += 0.06 * bump(0.3, 0.36, 0.42, 0.5);
      if (nv > AFTER) pNeck += 0.08 * bump(0.5, 0.6, 0.7, 0.8);
    }
    spp = keyed(spp, pR, u, pxS, pgS, pd, 1);
    spp = keyed(spp, pL, u, pxS, pgS, pd, -1);
    spp = leanOf(spp, pLean, pNeck);
    if (kneel > 0) {
      let kn = leanOf(postureStill(1, t, 2), 0.3 * kneel, 0);
      kn = keyed(kn, pR, u, pxS, pgS, pd, 1);
      kn = keyed(kn, pL, u, pxS, pgS, pd, -1);
      spp = mixStance(spp, kn, kneel);
    }
    spp = tuck(spp, pAir, pSq);
    const prevP = carryFrom(heldP, n, hHold(pCode, t, 2));
    const figP = keepHeld(heldP, pw.walking ? mixKeepLegs(prevP, spp, tr) : mixStance(prevP, spp, tr));

    // ══ THE PIRATE AT THE FIRE (silent) ══════════════════════════════════════
    // By day he sits on the seat stone facing the fire and does his own thing, one a beat,
    // at his own moment; by night he sits on the big rock, hands up, then tied.
    const e1x = E1_X[nv] + cam;
    const e1d = 1;
    let s1 = seatOf(place === 2 ? SEAT_R : SEAT_A, place === 2 ? 14 : 12);
    let e1R: readonly Key[] | null = null;
    let e1L: readonly Key[] | null = null;
    let e1Lean = 0;
    let e1Neck = 0;
    if (place === 1) {
      // the song at the end of b8 and the start of b9: a sway
      const song = nv === ISLAND ? bump(0.84, 0.88, 0.96, 1) : nv === SLEEP ? 1 - st(0.08, 0.16) : 0;
      e1Lean += 0.08 * song * Math.sin(b * 5.2);
      e1Neck += -0.2 * song;
      if (nv === ISLAND) {
        // warming his hands at the fire
        e1R = [[0.36, 12, 30, 0], [0.44, 28, 22, 1], [0.66, 28, 22, 1], [0.74, 12, 30, 0]];
        e1L = [[0.38, 10, 30, 0], [0.46, 26, 24, 1], [0.66, 26, 24, 1], [0.74, 10, 30, 0]];
      }
      if (nv === SLEEP) {
        // he freezes and hunches at the shout
        e1Lean += 0.18 * bump(0.14, 0.22, 0.6, 0.72);
        e1Neck += 0.22 * bump(0.14, 0.22, 0.6, 0.72);
        e1R = [[0.18, 12, 30, 0], [0.26, 10, 66, 1], [0.6, 10, 66, 1], [0.72, 12, 30, 0]];
      }
      if (nv === SIGH) {
        // a shrug: what can you do
        e1R = [[0.6, 12, 30, 0], [0.68, 16, 46, 1], [0.76, 16, 46, 1], [0.84, 12, 30, 0]];
        e1L = [[0.6, 10, 30, 0], [0.68, 12, 46, 1], [0.76, 12, 46, 1], [0.84, 10, 30, 0]];
      }
      if (nv === POEM) {
        // chin in hand, then a yawn behind the other hand
        e1R = [[0.1, 12, 30, 0], [0.2, 12, 58, 1], [0.9, 12, 58, 1]];
        e1L = [[0.44, 10, 30, 0], [0.52, 6, 72, 1], [0.62, 6, 72, 1], [0.7, 10, 30, 0]];
        e1Lean += 0.12 * st(0.1, 0.2);
        e1Neck += -0.26 * bump(0.46, 0.54, 0.6, 0.68);
      }
      if (nv === CLAP) {
        // one clap
        e1R = [[0, 12, 58, 1], [0.16, 18, 46, 1], [0.34, 12, 46, 1], [0.7, 12, 46, 1]];
        e1L = [[0.1, 10, 30, 0], [0.16, 12, 46, 1], [0.6, 10, 30, 0.4]];
      }
      if (nv === THREAT) {
        e1R = [[0.3, 12, 30, 0], [0.42, 10, 60, 1], [0.7, 10, 60, 1], [0.8, 12, 30, 0]];
        e1Neck += 0.1 * bump(0.3, 0.42, 0.7, 0.8);
      }
      if (nv === LAUGH) {
        const l1 = bump(0.36, 0.46, 0.78, 0.9);
        e1Lean += -0.14 * l1;
        e1Neck += -0.32 * l1;
        e1R = [[0.36, 12, 30, 0], [0.46, 14, 36, 1], [0.78, 14, 36, 1], [0.9, 12, 30, 0]];
      }
      if (nv === RANSOM) {
        // he scratches his head at the sight of so much silver
        e1R = [[0.2, 12, 30, 0], [0.3, 4, 78, 1], [0.38, 6, 80, 1], [0.5, 12, 30, 0]];
        e1Neck += 0.12 * bump(0.2, 0.3, 0.5, 0.6);
      }
    }
    if (place === 2) {
      const up1 = nv === FLEET ? st(0.86, 0.96) : nv === CAUGHT ? 1 - st(0.4, 0.6) : 0;
      const tie1 = nv === CAUGHT ? st(0.4, 0.6) : nv > CAUGHT ? 1 : 0;
      s1 = tied(s1, e1x, G, e1d, tie1, -12);
      s1 = handsUp(s1, e1x, G, e1d, up1, 76);
      // he sits with his own thoughts: a glance at the fire, at the sky, at his hands
      e1Neck += [0, 0.18, -0.2, 0.16, -0.18, 0.2, 0.16][nv - FLEET] * bump(0.2, 0.3, 0.6, 0.7);
      e1Lean += 0.1 * bump(0.5, 0.6, 0.8, 0.9);
    }
    s1 = keyed(s1, e1R, u, e1x, G, e1d, 1);
    s1 = keyed(s1, e1L, u, e1x, G, e1d, -1);
    s1 = leanOf(s1, e1Lean, e1Neck);
    const figE1 = keepHeld(heldE1, mixStance(carryFrom(heldE1, n, s1), s1, tr));

    // ══ THE BOATMAN (silent; b15 only) ═══════════════════════════════════════
    const boatOff = nv < RANSOM ? BOAT_OFF : nv === RANSOM ? BOAT_OFF * (1 - ease01(b / 1.6)) : 0;
    const boatOn = place === 1 && nv >= RANSOM ? 1 : 0;
    const bx = BOATMAN.x + boatOff + cam;
    let sb = hLive(NOD, t, b, 3);
    // sculling: the oar's loom in both hands, worked across twice as she comes in
    const scull = nv === RANSOM ? Math.sin(Math.PI * 2 * clamp01(b / 1.6)) : 0;
    sb = hand(sb, bx, BOATMAN.g, -1, 1, -6 + 8 * scull, 52, 1);
    sb = hand(sb, bx, BOATMAN.g, -1, -1, -2 + 8 * scull, 44, 1);
    if (nv === RANSOM) sb = leanOf(sb, 0.1 * scull, 0.12 * bump(0.5, 0.58, 0.8, 0.88));
    const figB = keepHeld(heldB, mixStance(carryFrom(heldB, n, sb), sb, tr));

    // ── the bundles ──────────────────────────────────────────────────────────
    const bC = pose(figC, cxS, cgS, K, cd, 1);
    const bH = pose(figH, hxS, hgS, K, hd0, 1);
    const bP = pose(figP, pxS, pgS, K, pd, 1);
    const bE1 = pose(figE1, e1x, G, K, e1d, place === 0 ? 0 : 1);
    const bB = pose(figB, bx, BOATMAN.g, K, -1, boatOn);
    const cRw = jointOf(bC, 'wrR');
    const cLw = jointOf(bC, 'wrL');
    const hRw = jointOf(bH, 'wrR');
    const hLw = jointOf(bH, 'wrL');
    const pRw = jointOf(bP, 'wrR');
    const pLw = jointOf(bP, 'wrL');

    // ── the scroll: in Caesar's hands, tucked away, handed over, held open, rolled ──
    let scA = cLw;
    let scB = cRw;
    let scO = 1;
    let scOpen = 1;
    if (nv === INTRO) {
      scOpen = 1 - st(0.02, 0.1);
      scO = 1 - st(0.14, 0.2);
    }
    if (nv > INTRO && nv < SIGH) scO = 0;
    if (nv === SIGH) {
      scOpen = 0;
      scO = st(0.2, 0.24);
      if (u > 0.32) { scA = pLw; scB = pLw; } else { scA = cRw; scB = cRw; }
    }
    if (nv === POEM) {
      scA = pRw;
      scB = pLw;
      scOpen = st(0.0, 0.08);
    }
    if (nv === CLAP) {
      scA = pRw;
      scB = pLw;
      scOpen = 1 - st(0, 0.1);
      if (u > 0.1) { scA = pLw; scB = pLw; }
    }
    if (place === 1 && nv > CLAP) { scA = pLw; scB = pLw; scOpen = 0; }
    if (place === 2) scO = 0;
    const scroll = { ax: scA.x, ay: scA.y, bx: lerp(scA.x, scB.x, scOpen), by: lerp(scA.y, scB.y, scOpen), o: carry(cv, 10, n, 0, scO, tr) };

    // ── the ship: the ghost of the galley's sail on the horizon, the chests, the sack ──
    const ghost = nv === SAIL ? st(S0(7.0), S0(8.4)) : nv === BOARD ? 1 - stage(b, 1, 0.1, 0.6) : 0;
    const ghostK = nv === SAIL ? 0.7 + 0.3 * st(S0(7.0), S0(11)) : 1;
    const chalk = carry(cv, 11, n, 0, nv >= Q1N && nv < ISLAND ? 1 : 0, tr);
    const rTwenty = carry(cv, 12, n, 0, kept(12, 1, Q1, Q1N), keptTr(Q1));
    const rTen = carry(cv, 13, n, 0, kept(13, 2, Q1, Q1N), keptTr(Q1));
    const r50was = carrySource(cv, 14, n, 0);
    const rFifty = carry(cv, 14, n, 0, kept(14, 3, Q1, Q1N), keptTr(Q1));
    // FIFTY flies open when it is picked; it opens anyway when he taps it (b6)
    const open50 = Math.max(clamp01(rFifty * 1.6), nv === FIFTY ? st(0.34, 0.4) : nv > FIFTY ? 1 : 0);
    const spray = Math.max(Q1[n] ? rFifty : 0, nv === FIFTY && r50was <= 0.5 ? st(0.34, 0.66) : 0);
    // the sack: on the deck, on his shoulder, set down
    const grab = nv === TALENT ? st(0.12, 0.14) * (1 - st(0.9, 0.92)) : 0;
    const dropped = nv === TALENT ? st(0.9, 0.92) : nv > TALENT ? 1 : 0;
    const sackRest = dropped > 0.5 ? SACK1 : SACK0;
    const sack = {
      x: lerp(sackRest.x, (pRw.x + pLw.x) / 2, grab),
      y: lerp(sackRest.y, Math.max(pRw.y, pLw.y) + 8, grab),
      rot: grab * 8 * pd,
      held: grab > 0.5 ? 1 : 0,
    };

    // ── the cove: the mat, the boat, the coin (WORLD x: they are drawn in the world) ──
    const matOpen = nv === ISLAND ? st(0.48, 0.72) : place > 0 ? 1 : 0;
    const matHeld = nv === ISLAND && u < 0.46 ? 1 : 0;
    const matLeft = lerp(MAT.x1, MAT.x0, matOpen);
    const mat = {
      x1: MAT.x1, x0: matLeft,
      rollX: matHeld ? (pRw.x + pLw.x) / 2 - cam : matLeft,
      rollY: matHeld ? (pRw.y + pLw.y) / 2 : MAT.y - 3,
      o: place > 0 ? 1 : 0,
      held: matHeld,
    };
    const boat = { x: BOAT.x + boatOff, y: BOAT.y, o: boatOn, scull, oarX: bx, oarY: BOATMAN.g - 48 };
    const coin = nv === RANSOM ? bump(0.47, 0.49, 0.77, 0.79) : 0;
    // ── the night: the warship, the fleet, the table ──
    const shipOff = nv === FLEET ? SHIP_OFF * (1 - ease01((b - 0.4) / 2.6)) : 0;
    const fleetOff = nv === FLEET ? FLEET_OFF * (1 - ease01((b - 0.4) / 3.0)) : 0;
    const rLetter = carry(cv, 15, n, 0, kept(15, 4, Q2, Q2N), keptTr(Q2));
    const rKey = carry(cv, 16, n, 0, kept(16, 5, Q2, Q2N), keptTr(Q2));
    const rRing = carry(cv, 17, n, 0, kept(17, 6, Q2, Q2N), keptTr(Q2));
    const sealed = Math.max(clamp01((rRing - 0.45) / 0.15), nv === WRITE ? st(0, 0.1) : nv > WRITE ? 1 : 0);
    // the rope on tied wrists
    const tieO = (a: number, z: number) => {
      'worklet';
      return place === 2 && nv >= CAUGHT ? (nv === CAUGHT ? st(a, z) : 1) : 0;
    };
    const mid = (a: { x: number; y: number }, c: { x: number; y: number }, o: number) => {
      'worklet';
      return { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2, o };
    };

    return {
      bC, bH, bP, bE1, bB, cam, t, haze, dark, night,
      sail: place === 0 ? 1 : 0,
      galleyX: galleyOff, ghost, ghostK,
      chalk, rTwenty, rTen, rFifty, open50, spray,
      sack, scroll, mat, boat, coin, coinAt: hLw,
      fingers, fingerAt: hLw,
      shipX: SHIP_BOW.x + shipOff, fleetX: FLEET_AT.x + fleetOff,
      rLetter, rKey, rRing, sealed,
      ropeH: mid(hRw, hLw, tieO(0.18, 0.24)),
      ropeP: mid(pRw, pLw, tieO(0.22, 0.28)),
      ropeE1: mid(jointOf(bE1, 'wrR'), jointOf(bE1, 'wrL'), tieO(0.56, 0.62)),
      q1: carry(cv, 18, n, 0, Q1[n], tr),
      q2: carry(cv, 19, n, 0, Q2[n], tr),
      table: place === 2 ? 1 : 0,
      // the blade, falling from his hand as his hands are taken (b17), then on the sand
      blade: {
        f: nv === CAUGHT ? st(0, 0.16) : nv > CAUGHT ? 1 : 0,
        o: nv >= CAUGHT ? 1 : 0,
        x0: hRw.x, y0: hRw.y, x1: HX + 192 + cam, y1: G - 1,
      },
    };
  });

  const DC = useDerivedValue<Bundle>(() => SCENE.value.bC);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.bH);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.bP);
  const DE1 = useDerivedValue<Bundle>(() => SCENE.value.bE1);
  const DB = useDerivedValue<Bundle>(() => SCENE.value.bB);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));
  const nightOn = useAnimatedStyle(() => ({ opacity: SCENE.value.night }));
  const dayOn = useAnimatedStyle(() => ({ opacity: 1 - SCENE.value.night }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the ship (x 0–400) and the cove (x 400–800) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="caesar1-sea" />
        <Cloud S={SCENE} x={60} y={250} s={1} k={0} />
        <Cloud S={SCENE} x={250} y={236} s={0.85} k={1} />
        <Cloud S={SCENE} x={360} y={262} s={0.7} k={2} />
        <Glints S={SCENE} />
        <Ghost S={SCENE} />
        <Gull S={SCENE} k={0} base={0} />
        <Galley S={SCENE} />
        <LessonPicture name="caesar1-deck" />
        <Sail S={SCENE} />
        <Chests S={SCENE} />
        <Sack S={SCENE} held={0} />
        {/* the cove by day, and by night laid over it */}
        <LessonPicture name="caesar1-cove-far" />
        <Animated.View style={[styles.world, dayOn]}>
          <Cloud S={SCENE} x={HX + 150} y={246} s={0.9} k={3} />
          <Cloud S={SCENE} x={HX + 250} y={276} s={0.7} k={4} />
          <Gull S={SCENE} k={1} base={HX} />
        </Animated.View>
        <Animated.View style={[styles.world, nightOn]}>
          <LessonPicture name="caesar1-cove-far-night" />
          <Fleet S={SCENE} />
        </Animated.View>
        <LessonPicture name="caesar1-cove-mid" />
        <Animated.View style={[styles.world, nightOn]}>
          <LessonPicture name="caesar1-cove-mid-night" />
          <View style={styles.firelight} />
        </Animated.View>
        <Boat S={SCENE} />
        <Warship S={SCENE} />
        <Fire S={SCENE} />
        <Mat S={SCENE} />
        <Table S={SCENE} />
      </Animated.View>
      {/* extra: boatman */}
      <Stickman D={DB} k={K} role="crowd" wear={[]} />
      <BoatOar S={SCENE} />
      {/* extra: pirate */}
      <Stickman D={DE1} k={K} role="crowd" wear={[]} garb={OUTFITS.pirate.garb?.bands} />
      <Rope S={SCENE} k="ropeE1" />
      {/* cast: tophat */}
      <Stickman D={DH} k={K} role="second" wear={i > FLEET ? CAPTAIN_HEAD : OUTFITS.pirateCaptain.head} garb={OUTFITS.pirateCaptain.garb?.bands} />
      <Fingers S={SCENE} />
      <Blade S={SCENE} />
      <Coin S={SCENE} />
      <Rope S={SCENE} k="ropeH" />
      {/* cast: cap */}
      <Stickman D={DP} k={K} role="crowd" wear={OUTFITS.pirate.head} garb={OUTFITS.pirate.garb?.bands} />
      <Rope S={SCENE} k="ropeP" />
      <Sack S={SCENE} held={1} />
      {/* cast: plain */}
      <Stickman D={DC} k={K} role="lead" wear={[]} garb={OUTFITS.caesarYoung.garb?.bands} />
      <Scroll S={SCENE} />
      {/* the labels and the things to tap */}
      {on(Q2) ? <OrderPlates S={SCENE} /> : null}
      <Veil S={SCENE} k="haze" />
      <Veil S={SCENE} k="dark" />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={CHEST_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={ORDER_Q} k="q2" /> : null}
    </View>
  );
}

// ── the living world ─────────────────────────────────────────────────────────

/** A fair-weather cloud, drifting a little and back. */
function Cloud({ S, x, y, s, k }: { S: SharedValue<any>; x: number; y: number; s: number; k: number }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: x + 9 * Math.sin(S.value.t * 0.05 + k * 1.7) }, { translateY: y }, { scale: s }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.cloud, { left: -26, top: -6, width: 52, height: 12, borderRadius: 6 }]} />
      <View style={[styles.cloud, { left: -16, top: -13, width: 20, height: 16, borderRadius: 8 }]} />
      <View style={[styles.cloud, { left: -2, top: -16, width: 22, height: 18, borderRadius: 9 }]} />
      <View style={[styles.cloudFoot, { left: -24, top: 3, width: 48, height: 3, borderRadius: 1.5 }]} />
    </Animated.View>
  );
}
/** The sun on the sea: short glints that come and go. */
const GLINTS = [[40, 396, 0], [96, 412, 1.3], [180, 404, 2.1], [228, 420, 0.7], [300, 400, 2.8], [352, 428, 1.9], [130, 432, 3.3]];
function Glints({ S }: { S: SharedValue<any> }) {
  return <>{GLINTS.map(([x, y, ph], k) => <Glint key={k} S={S} x={x} y={y} ph={ph} />)}</>;
}
function Glint({ S, x, y, ph }: { S: SharedValue<any>; x: number; y: number; ph: number }) {
  const st = useAnimatedStyle(() => {
    const v = Math.sin(S.value.t * 0.9 + ph);
    return { opacity: Math.max(0, v), transform: [{ translateX: x + 4 * Math.sin(S.value.t * 0.3 + ph) }, { translateY: y }, { scaleX: 0.6 + 0.4 * v }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.glint} /></Animated.View>;
}
/** A gull gliding round, over the ship or over the cove. */
function Gull({ S, k, base }: { S: SharedValue<any>; k: number; base: number }) {
  const st = useAnimatedStyle(() => {
    const a = S.value.t * (k ? 0.21 : 0.26) + k * 2.2;
    const x = base + (k ? 220 : 250) + (k ? 70 : 80) * Math.cos(a);
    const y = (k ? 262 : 300) + 10 * Math.sin(a * 2);
    const flap = 0.75 + 0.25 * Math.sin(S.value.t * (k ? 5 : 6));
    return { transform: [{ translateX: x }, { translateY: y }, { scaleX: Math.sin(a) > 0 ? -0.8 : 0.8 }, { scaleY: 0.8 * flap }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="caesar1-gull" /></Animated.View>;
}
/** The pirates' sail, far off on the horizon at the end of b0: a dark square over a dark hull. */
function Ghost({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.ghost, transform: [{ translateX: 232 }, { translateY: 382 }, { scale: S.value.ghostK }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.ghostSail} />
      <View style={styles.ghostHull} />
    </Animated.View>
  );
}
/** The pirate galley, sliding in alongside and riding the swell. */
function Galley({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.galleyX }, { translateY: 0.9 * Math.sin(S.value.t * 0.9 + 1) }],
  }));
  return <Animated.View nativeID="c1-galley" style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="caesar1-galley" /></Animated.View>;
}
/** Our sail, filling and easing in the wind — the cloth breathes out from the mast. */
function Sail({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const w = Math.sin(S.value.t * 0.7) * 0.6 + Math.sin(S.value.t * 0.43 + 1) * 0.4;
    return { opacity: S.value.sail, transform: [{ translateX: 8 }, { scaleX: 1 + 0.035 * w }, { translateX: -8 }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="caesar1-sail" /></Animated.View>;
}

// ── the chests, the sack ─────────────────────────────────────────────────────

function Chests({ S }: { S: SharedValue<any> }) {
  return <>{CHESTS.map((c) => <Chest key={c.id} S={S} id={c.id} x={c.x} mark={c.mark} />)}</>;
}
/**
 * One iron-bound chest. PICKED RIGHT (FIFTY): the lid flies back on its hinge and the silver
 * jumps; PICKED WRONG: the chest jolts and thuds back down and its lid rattles shut.
 */
function Chest({ S, id, x, mark }: { S: SharedValue<any>; id: string; x: number; mark: string }) {
  const body = useAnimatedStyle(() => {
    const v = S.value;
    const r = id === 'twenty' ? v.rTwenty : id === 'ten' ? v.rTen : 0;
    const hop = r > 0 && r < 1 ? Math.abs(Math.sin(r * Math.PI * 2)) * (1 - r) * 7 : 0;
    return { transform: [{ translateX: x + (r > 0 && r < 1 ? 1.4 * Math.sin(r * 40) * (1 - r) : 0) }, { translateY: 500 - hop }] };
  });
  const lidOut = useAnimatedStyle(() => {
    const v = S.value;
    const o = id === 'fifty' ? v.open50 : 0;
    const r = id === 'twenty' ? v.rTwenty : id === 'ten' ? v.rTen : 0;
    const rattle = r > 0 && r < 1 ? Math.max(0, Math.sin(r * Math.PI * 4)) * (1 - r) * 3 : 0;
    return { opacity: o < 0.5 ? 1 : 0, transform: [{ translateY: -22 - rattle }, { scaleY: Math.max(0.05, 1 - 2 * o) }] };
  });
  const lidIn = useAnimatedStyle(() => {
    const o = id === 'fifty' ? S.value.open50 : 0;
    return { opacity: o > 0.5 ? 1 : 0, transform: [{ translateY: -22 }, { scaleY: Math.max(0.05, 2 * o - 1) }] };
  });
  const inside = useAnimatedStyle(() => ({ opacity: id === 'fifty' ? clamp01(S.value.open50 * 2) : 0 }));
  const chalk = useAnimatedStyle(() => ({ opacity: S.value.chalk }));
  return (
    <Animated.View nativeID={`c1-chest-${id}`} style={[styles.rider, body]} pointerEvents="none">
      <Animated.View style={[styles.rider, lidIn]}><LessonPicture name="caesar1-lid-in" /></Animated.View>
      <Animated.View style={[styles.chestInside, inside]}>
        <View style={[styles.coinHeap, { left: 4, top: 1 }]} />
        <View style={[styles.coinHeap, { left: 13, top: -1 }]} />
        <View style={[styles.coinHeap, { left: 22, top: 1 }]} />
      </Animated.View>
      <View style={styles.chestShadow} />
      <LessonPicture name="caesar1-chest" />
      <Animated.View style={[styles.rider, lidOut]}><LessonPicture name="caesar1-lid" /></Animated.View>
      <Animated.View style={[styles.slate, chalk]}>
        <Text style={styles.chalkText}>{mark}</Text>
      </Animated.View>
      {id === 'fifty' ? <Spray S={S} /> : null}
    </Animated.View>
  );
}
/** The silver jumping out of the open chest and falling back, glinting. */
const SPRAY = [[-14, 36, 0], [-6, 48, 0.08], [3, 42, 0.04], [11, 52, 0.12], [17, 34, 0.06], [-10, 28, 0.16], [7, 30, 0.2], [0, 56, 0.1], [-16, 22, 0.22]] as const;
function Spray({ S }: { S: SharedValue<any> }) {
  return <>{SPRAY.map(([dx, h, d], k) => <SprayCoin key={k} S={S} dx={dx} h={h} d={d} />)}</>;
}
function SprayCoin({ S, dx, h, d }: { S: SharedValue<any>; dx: number; h: number; d: number }) {
  const st = useAnimatedStyle(() => {
    const f = clamp01((S.value.spray - d) / 0.7);
    const arc = Math.sin(Math.PI * f);
    return {
      opacity: f > 0 && f < 1 ? 1 : 0,
      transform: [{ translateX: dx * (0.4 + 0.6 * f) }, { translateY: -24 - h * arc }, { scaleX: 0.4 + 0.6 * Math.abs(Math.cos(f * 12 + dx)) }],
    };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.sprayCoin} /></Animated.View>;
}
/** The sack of silver: on the deck, on the young pirate's shoulder, set down again. */
function Sack({ S, held }: { S: SharedValue<any>; held: 0 | 1 }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.sack;
    return { opacity: v.held === held ? 1 : 0, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }] };
  });
  return <Animated.View nativeID={held ? 'c1-sack-held' : 'c1-sack'} style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="caesar1-sack" /></Animated.View>;
}

// ── things in hands ──────────────────────────────────────────────────────────

/** The scroll between two rods: open between two hands, or rolled shut in one. */
function Scroll({ S }: { S: SharedValue<any> }) {
  const sheet = useAnimatedStyle(() => {
    const v = S.value.scroll;
    const len = Math.hypot(v.bx - v.ax, v.by - v.ay);
    const ang = Math.atan2(v.by - v.ay, v.bx - v.ax);
    return {
      opacity: v.o * (len > 2 ? 1 : 0),
      transform: [{ translateX: (v.ax + v.bx) / 2 }, { translateY: (v.ay + v.by) / 2 }, { rotate: `${(ang * 180) / Math.PI}deg` }, { scaleX: Math.max(0.02, len / 20) }],
    };
  });
  const rodA = useAnimatedStyle(() => {
    const v = S.value.scroll;
    const ang = Math.atan2(v.by - v.ay, v.bx - v.ax);
    return { opacity: v.o, transform: [{ translateX: v.ax }, { translateY: v.ay }, { rotate: `${(ang * 180) / Math.PI}deg` }] };
  });
  const rodB = useAnimatedStyle(() => {
    const v = S.value.scroll;
    const ang = Math.atan2(v.by - v.ay, v.bx - v.ax);
    return { opacity: v.o, transform: [{ translateX: v.bx }, { translateY: v.by }, { rotate: `${(ang * 180) / Math.PI}deg` }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, sheet]} pointerEvents="none">
        <View style={styles.sheet} />
        <View style={[styles.sheetLine, { top: -5 }]} />
        <View style={[styles.sheetLine, { top: -1.5 }]} />
        <View style={[styles.sheetLine, { top: 2 }]} />
        <View style={[styles.sheetLine, { top: 5.5 }]} />
      </Animated.View>
      <Animated.View style={[styles.rider, rodA]} pointerEvents="none"><View style={styles.rod} /></Animated.View>
      <Animated.View style={[styles.rider, rodB]} pointerEvents="none"><View style={styles.rod} /></Animated.View>
    </>
  );
}
/** Two fingers held up (the captain's price). */
function Fingers({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.fingers,
    transform: [{ translateX: S.value.fingerAt.x }, { translateY: S.value.fingerAt.y }, { scaleY: 0.4 + 0.6 * S.value.fingers }],
  }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={[styles.finger, { left: -4 }]} />
      <View style={[styles.finger, { left: 1.2 }]} />
    </Animated.View>
  );
}
/** The captain's blade, dropped: it falls from his hand and lies on the sand. */
function Blade({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.blade;
    const f = v.f;
    const x = lerp(v.x0, v.x1, f);
    const y = lerp(v.y0, v.y1, f * f);
    return { opacity: v.o, transform: [{ translateX: x }, { translateY: y }, { rotate: `${lerp(-78, 96, f)}deg` }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.bladeSteel} />
      <View style={styles.bladeGrip} />
    </Animated.View>
  );
}
/** The silver coin the captain holds up to look at. */
function Coin({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.coin > 0.05 ? 1 : 0,
    transform: [{ translateX: S.value.coinAt.x }, { translateY: S.value.coinAt.y - 4 }, { scaleX: 0.5 + 0.5 * Math.abs(Math.cos(S.value.t * 3)) }],
  }));
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.coin} /></Animated.View>;
}

// ── the cove ─────────────────────────────────────────────────────────────────

/** The campfire: three flame tongues and a smoke trail by day; higher at night. */
function Fire({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {[0, 1, 2].map((k) => <Smoke key={`s${k}`} S={S} k={k} />)}
      {[-6, 0, 6].map((dx, k) => <Flame key={k} S={S} dx={dx} k={k} />)}
    </>
  );
}
function Flame({ S, dx, k }: { S: SharedValue<any>; dx: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const f = 0.8 + 0.2 * Math.sin(t * (7 + k) + k * 2) + 0.1 * Math.sin(t * 13 + k);
    const big = 1 + 0.45 * S.value.night;
    return { transform: [{ translateX: FIRE.x + dx + 1.2 * Math.sin(t * 5 + k) }, { translateY: FIRE.y - 4 }, { scaleY: f * big * (k === 1 ? 1.25 : 1) }, { scaleX: big * 0.9 }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.flame} />
      <View style={styles.flameCore} />
    </Animated.View>
  );
}
function Smoke({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const ph = (S.value.t * 0.35 + k / 3) % 1;
    return {
      opacity: (1 - S.value.night) * 0.7 * Math.sin(Math.PI * ph),
      transform: [{ translateX: FIRE.x + 6 * Math.sin(ph * 4 + k) + 10 * ph }, { translateY: FIRE.y - 22 - 70 * ph }, { scale: 0.6 + 1.2 * ph }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.smoke} /></Animated.View>;
}
/** The reed mat: rolled in his hands, unrolling along the sand, lying flat (world x). */
function Mat({ S }: { S: SharedValue<any> }) {
  const flatSt = useAnimatedStyle(() => {
    const v = S.value.mat;
    const w = Math.max(0.5, v.x1 - v.x0);
    return { opacity: v.o * (v.held ? 0 : 1), transform: [{ translateX: v.x0 }, { translateY: MAT.y }, { scaleX: w / 40 }] };
  });
  const roll = useAnimatedStyle(() => {
    const v = S.value.mat;
    const left = v.x1 - v.x0;
    const r = v.held ? 1 : Math.max(0.35, 1 - (left / 82) * 0.65);
    return { opacity: v.o * (v.held || left < 80 ? 1 : 0), transform: [{ translateX: v.rollX }, { translateY: v.rollY }, { scale: r }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, flatSt]} pointerEvents="none">
        <View style={styles.matFlat} />
        <View style={styles.matWeave} />
      </Animated.View>
      <Animated.View style={[styles.rider, roll]} pointerEvents="none">
        <View style={styles.matRoll} />
        <View style={styles.matRollEnd} />
      </Animated.View>
    </>
  );
}
/** The ransom boat sculling in (world x). */
function Boat({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.boat.o,
    transform: [{ translateX: S.value.boat.x }, { translateY: S.value.boat.y + 0.8 * Math.sin(S.value.t * 1.1) }],
  }));
  return (
    <Animated.View nativeID="c1-boat" style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.boatShadow} />
      <LessonPicture name="caesar1-boat" />
    </Animated.View>
  );
}
/** The boatman's sculling oar, from his hands over the stern into the water (screen x). */
function BoatOar({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.boat;
    return { opacity: v.o, transform: [{ translateX: v.oarX - 4 + 6 * v.scull }, { translateY: v.oarY + 8 }, { rotate: `${-28 + 10 * v.scull}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.oar} /><View style={styles.oarBlade} /></Animated.View>;
}
/** The Roman warship gliding in bow first, her torches burning (world x). */
function Warship({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: S.value.night,
    transform: [{ translateX: S.value.shipX }, { translateY: SHIP_BOW.y + 0.6 * Math.sin(S.value.t * 0.8) }],
  }));
  return (
    <Animated.View nativeID="c1-warship" style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="caesar1-warship" />
      {TORCHES.map(([x, y], k) => <Torch key={k} S={S} x={x} y={y} k={k} />)}
    </Animated.View>
  );
}
function Fleet({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.fleetX }, { translateY: FLEET_AT.y + 0.5 * Math.sin(S.value.t * 0.7 + 2) }] }));
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="caesar1-fleet" />
      {FLEET_TORCHES.map(([x, y], k) => <Torch key={k} S={S} x={x} y={y} k={k + 2} small />)}
    </Animated.View>
  );
}
function Torch({ S, x, y, k, small }: { S: SharedValue<any>; x: number; y: number; k: number; small?: boolean }) {
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const f = 0.85 + 0.15 * Math.sin(t * (9 + k) + k) + 0.08 * Math.sin(t * 17 + k * 2);
    return { transform: [{ translateX: x + Math.sin(t * 6 + k) * 0.8 }, { translateY: y }, { scaleY: f * (small ? 0.55 : 0.8) }, { scaleX: small ? 0.55 : 0.8 }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.flame} />
      <View style={styles.flameCore} />
    </Animated.View>
  );
}

// ── the table at night: the letter, the key, the ring (world x) ─────────────

function Table({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.table }));
  const letter = useAnimatedStyle(() => {
    const r = S.value.rLetter;
    const lift = Math.sin(Math.PI * Math.min(1, r * 1.3));
    return { transform: [{ translateX: ORDER[0].x }, { translateY: TABLE.top - 4 - 7 * lift }, { rotate: `${8 * Math.sin(r * Math.PI * 5) * (1 - r)}deg` }] };
  });
  const keySt = useAnimatedStyle(() => {
    const f = clamp01(S.value.rKey * 1.25);
    const x = ORDER[1].x + 4 * f;
    const y = TABLE.top - 3 - 12 * Math.sin(Math.PI * Math.min(1, f * 1.6)) + (f > 0.6 ? ((f - 0.6) / 0.4) * 26 : 0);
    return { transform: [{ translateX: x }, { translateY: y }, { rotate: `${-420 * f}deg` }, { scale: 1.7 }] };
  });
  const ring = useAnimatedStyle(() => {
    const r = S.value.rRing;
    const up = r < 0.45 ? Math.sin((Math.PI * r) / 0.9) : r < 0.6 ? 1 - (r - 0.45) / 0.15 : 0;
    return { transform: [{ translateX: ORDER[2].x }, { translateY: TABLE.top - 5.5 - 18 * up }, { rotate: `${360 * clamp01(r / 0.45)}deg` }] };
  });
  const seal = useAnimatedStyle(() => ({ opacity: S.value.sealed, transform: [{ translateX: ORDER[2].x - 18 }, { translateY: TABLE.top - 2 }, { scale: 0.6 + 0.4 * S.value.sealed }] }));
  return (
    <Animated.View style={[styles.world, st]} pointerEvents="none">
      <View style={styles.tableShadow} />
      <View style={styles.tableAt}><LessonPicture name="caesar1-table" /></View>
      <Animated.View nativeID="c1-letter" style={[styles.rider, letter]}>
        <View style={styles.letter} />
        <View style={styles.letterSeal} />
      </Animated.View>
      <Animated.View style={[styles.rider, seal]}>
        <View style={styles.order} />
        <View style={styles.wax} />
        <View style={styles.waxMark} />
      </Animated.View>
      <Animated.View nativeID="c1-key" style={[styles.rider, keySt]}><LessonPicture name="caesar1-key" /></Animated.View>
      <Animated.View nativeID="c1-ring" style={[styles.rider, ring]}>
        <View style={styles.ringHoop} />
        <View style={styles.ringBezel} />
      </Animated.View>
    </Animated.View>
  );
}
/** The rope round a pair of tied wrists. */
function Rope({ S, k }: { S: SharedValue<any>; k: 'ropeH' | 'ropeP' | 'ropeE1' }) {
  const st = useAnimatedStyle(() => {
    const v = S.value[k];
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.ropeLoop} />
      <View style={styles.ropeEnd} />
    </Animated.View>
  );
}

/** The haze into the cove, and the dark into the night (and on a step back). */
function Veil({ S, k }: { S: SharedValue<any>; k: 'haze' | 'dark' }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return <Animated.View style={[k === 'haze' ? styles.haze : styles.dark, st]} pointerEvents="none" />;
}

// ── the labels and the two games ─────────────────────────────────────────────

function OrderPlates({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="none">
      {ORDER.map((g) => (
        <View key={g.id} style={[styles.plate, { left: g.x - HX - 19, top: 482, width: 38, height: 14 }]}>
          <Text style={[styles.plateText, { width: 36 }]}>{g.label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/**
 * PICK THE CHEST: which one does Caesar choose? Each box covers its chest and reaches up
 * over it, so the verdict seal (struck at the box's top-right) lands in the air above the
 * lid, never on the chalked number.
 */
const CHEST_Q: Q[] = CHESTS.map((c) => ({ id: c.id, left: c.x - 22, top: 414, w: 44, h: 88, r: 5, correct: c.id === 'fifty' }));
/** SEAL THE ORDER: the letter, the key or his ring (on the night table; screen x). */
const ORDER_Q: Q[] = ORDER.map((g) => ({ id: g.id, left: g.x - HX - 19, top: 420, w: 38, h: 78, r: 5, correct: g.id === 'ring' }));
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} nativeID={`c1-q-${q.id}`} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
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
  haze: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.caesar1Haze.base },
  dark: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.caesar1Night.base },
  cloud: { position: 'absolute', backgroundColor: W.caesar1Cloud.base },
  cloudFoot: { position: 'absolute', backgroundColor: W.caesar1Cloud.shade },
  glint: { position: 'absolute', left: -6, top: -0.6, width: 12, height: 1.2, borderRadius: 0.6, backgroundColor: W.caesar1Glint.base },
  ghostSail: { position: 'absolute', left: -6, top: -15, width: 12, height: 12, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: W.caesar1DarkSail.base },
  ghostHull: { position: 'absolute', left: -9, top: -3, width: 18, height: 3, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: W.caesar1DarkSail.shade },
  chestInside: { position: 'absolute', left: -18, top: -25, width: 36, height: 6, borderRadius: 2, backgroundColor: W.caesar1Inside.base },
  coinHeap: { position: 'absolute', width: 11, height: 5, borderTopLeftRadius: 5.5, borderTopRightRadius: 5.5, backgroundColor: W.caesar1Silver.base, borderWidth: 0.6, borderColor: W.caesar1Silver.shade },
  slate: {
    position: 'absolute', left: -12, top: -18, width: 24, height: 15, borderRadius: 1.5, backgroundColor: W.caesar1Slate.base,
    borderWidth: 0.7, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  chalkText: { width: 22, fontFamily: 'Caveat_700Bold', fontSize: 12, lineHeight: 13, color: W.caesar1Chalk.base, textAlign: 'center', includeFontPadding: false },
  sprayCoin: { position: 'absolute', left: -3.5, top: -3.5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: W.caesar1Silver.base, borderWidth: 0.8, borderColor: INK },
  coin: { position: 'absolute', left: -2.2, top: -2.2, width: 4.4, height: 4.4, borderRadius: 2.2, backgroundColor: W.caesar1Silver.base, borderWidth: 0.5, borderColor: W.caesar1Silver.shade },
  sheet: { position: 'absolute', left: -10, top: -9, width: 20, height: 18, backgroundColor: W.caesar1Paper.base, borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: W.caesar1Paper.shade },
  sheetLine: { position: 'absolute', left: -7, width: 14, height: 0.8, backgroundColor: W.caesar1Paper.shade },
  rod: { position: 'absolute', left: -2, top: -11, width: 4, height: 22, borderRadius: 2, backgroundColor: W.caesar1Rod.base, borderWidth: 0.5, borderColor: INK },
  bladeSteel: { position: 'absolute', left: 0, top: -2, width: 26, height: 3.6, borderTopRightRadius: 6, borderBottomRightRadius: 1, backgroundColor: W.caesar1Silver.shade, borderWidth: 0.6, borderColor: INK },
  bladeGrip: { position: 'absolute', left: -6, top: -2.6, width: 8, height: 4.8, borderRadius: 1.4, backgroundColor: W.caesar1Rod.base, borderWidth: 0.6, borderColor: INK },
  finger: { position: 'absolute', top: -14, width: 3, height: 12, borderRadius: 1.5, backgroundColor: INK },
  flame: {
    position: 'absolute', left: -4, top: -14, width: 8, height: 14, borderTopLeftRadius: 4, borderTopRightRadius: 4,
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4, backgroundColor: W.caesar1Flame.base,
  },
  flameCore: { position: 'absolute', left: -2, top: -8, width: 4, height: 8, borderRadius: 2, backgroundColor: W.caesar1FlameCore.base },
  smoke: { position: 'absolute', left: -5, top: -4, width: 10, height: 8, borderRadius: 4, backgroundColor: W.caesar1Smoke.base },
  firelight: { position: 'absolute', left: HX + 189, top: 488, width: 110, height: 18, borderRadius: 9, backgroundColor: W.caesar1Firelight.base, opacity: 0.22 },
  matFlat: { position: 'absolute', left: 0, top: -3, width: 40, height: 5, borderRadius: 1.4, backgroundColor: W.caesar1Reed.base, borderWidth: 0.5, borderColor: W.caesar1Reed.shade },
  matWeave: { position: 'absolute', left: 1, top: -1, width: 38, height: 0.9, backgroundColor: W.caesar1Reed.shade },
  matRoll: { position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: W.caesar1Reed.base, borderWidth: 0.7, borderColor: W.caesar1Reed.shade },
  matRollEnd: { position: 'absolute', left: -1.5, top: -1.5, width: 3, height: 3, borderRadius: 1.5, borderWidth: 0.6, borderColor: W.caesar1Reed.shade },
  oar: { position: 'absolute', left: -1, top: 0, width: 2, height: 54, borderRadius: 1, backgroundColor: W.caesar1Oar.base },
  oarBlade: { position: 'absolute', left: -2.6, top: 42, width: 5.2, height: 13, borderRadius: 2, backgroundColor: W.caesar1Oar.shade },
  chestShadow: { position: 'absolute', left: -22, top: -1.6, width: 44, height: 3.4, borderRadius: 1.7, backgroundColor: SHADE, opacity: 0.45 },
  tableShadow: { position: 'absolute', left: TABLE.x - 58, top: G - 2, width: 116, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  boatShadow: { position: 'absolute', left: -56, top: 6, width: 112, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.35 },
  tableAt: { position: 'absolute', left: TABLE.x, top: TABLE.y, width: 0, height: 0 },
  letter: { position: 'absolute', left: -14, top: -5, width: 28, height: 8, borderRadius: 1.2, backgroundColor: W.caesar1Paper.base, borderWidth: 0.6, borderColor: INK },
  letterSeal: { position: 'absolute', left: -3.5, top: -4.5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: W.caesar1Wax.base },
  order: { position: 'absolute', left: -12, top: -3, width: 24, height: 4, borderRadius: 0.8, backgroundColor: W.caesar1Paper.base, borderWidth: 0.5, borderColor: INK },
  wax: { position: 'absolute', left: -5, top: -7, width: 10, height: 7, borderRadius: 3.5, backgroundColor: W.caesar1Wax.base, borderWidth: 0.4, borderColor: W.caesar1Wax.shade },
  waxMark: { position: 'absolute', left: -2.4, top: -5.6, width: 4.8, height: 3.6, borderRadius: 1.8, borderWidth: 0.5, borderColor: W.caesar1Wax.shade },
  ringHoop: { position: 'absolute', left: -5.5, top: -5.5, width: 11, height: 11, borderRadius: 5.5, borderWidth: 2.6, borderColor: W.caesar1Gold.base },
  ringBezel: { position: 'absolute', left: -3.6, top: -8.6, width: 7.2, height: 4.4, borderRadius: 1.8, backgroundColor: W.caesar1Gold.shade, borderWidth: 0.4, borderColor: INK },
  ropeLoop: { position: 'absolute', left: -4.5, top: -2.5, width: 9, height: 5, borderRadius: 2.5, borderWidth: 1.4, borderColor: W.caesar1Rope.base },
  ropeEnd: { position: 'absolute', left: -0.8, top: 2, width: 1.6, height: 7, borderRadius: 0.8, backgroundColor: W.caesar1Rope.shade },
  plate: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: W.caesar1Paper.base, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-09 — PICK THE CHEST (the three chests and their chalked
// numbers, between Caesar and the captain) and SEAL THE ORDER (the letter, the key and the ring on the
// night table, with their plates) read whole, answered right and wrong, on the c1film / c1wrong sheets.
export function Caesar1Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson} beats={BEATS} Scene={Caesar1Scene} band={[214, 514]}
      roles={{
        plain: { head: OUTFITS.caesarYoung.head, label: 'Caesar' },
        tophat: { head: CAPTAIN_HEAD, label: 'The pirate captain' },
        cap: { head: OUTFITS.pirate.head, label: 'A young pirate' },
      }}
    />
  );
}
