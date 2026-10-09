import { useEffect, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './endur1Script';
import {
  U, WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs, seated,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { UNIT2_OUTFITS, WEAR, dressed, trousers, coat, sleeves } from './garb';

// ─────────────────────────────────────────────────────────────────────────────
// personal-growth-endurance-1, "Proceed" — the first lesson of Personal Growth's second
// unit (LESSON_RULES group AW): Shackleton's Endurance, told in costume. THE PLAIN ONE IS
// SHACKLETON, "the Boss", in his gabardine smock and navy knitted cap; the top hat plays
// FRANK WORSLEY, her captain (navy jacket, peaked cap); the cap plays TOM CREAN (cream
// jumper, red knitted cap), who carries everything.
//
// A DIALOGUE lesson (group AP): people talk and nobody narrates.
// AT2: silent extras: one seaman in a green jersey on the floe (he blows on his hands,
// drives a long ice chisel into the floe, leans on it, hugs himself against the cold and
// sits down on a crate as the ship is made a winter home); he does his own thing on every
// beat, at his own moment, and stands apart from the others so no two fuse.
//
// THE PLACES are three FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/
// lessons/endur1.mjs), swapped under a veil (sea spray into Grytviken, a whiteout into the
// pack). There is no world translation: each place is laid on the same 400 × 300 band and
// figures are posed in stage space.
//
//   LONDON, 1 AUGUST 1914 — her DECK at her berth in the Thames, far → near: the summer
//   sky, the river, the far bank's brick warehouses, St Paul's dome, a Thames barge under
//   red-ochre sails (that layer turns past as she eases off); at the right the QUAY's
//   brick warehouse with its loading doors and wall crane, the quay wall, the GANGPLANK
//   down to the quay below the stage (x 352 →) — the quay slides away on `proceed`; then
//   her deck: the pale bulwark (rail 436–442), the foremast (132) with its yard, the main
//   (300), the bell, the stores by the gangway (316–346), the BITT the mooring line is
//   made fast to (341). On the deck the MAP CASE (72–120, the map of Antarctica pinned on
//   it), the MAIL SACK (176), the long SLEDGING CASE (186–326, hip high, top 469) with the
//   telegram PAD at its left end and later the telegraph boy's TRAY of three envelopes.
//   GRYTVIKEN, NOVEMBER 1914 — the same deck, but the bay walled by dark snow-streaked
//   mountains, rust-red oil tanks, red-roofed sheds, the white church, a whale catcher at
//   the jetty; the jetty and the plank at the right (they slide away as she sails); on
//   deck the dogs' KENNELS along the rail (176–320, huskies looking out), two casks: the
//   chart cask (46) and Shackleton's seat (130).
//   THE WEDDELL SEA, JANUARY–FEBRUARY 1915 — a low sun, a lilac sky, the pack to the
//   horizon with its pressure ridges; the ENDURANCE held fast (bow 190, bowsprit out to
//   136, rail 392–398, funnel 266, deckhouse 292–368, stovepipe 334, portholes); the floe
//   people stand on, the CHANNEL they cut ahead of her bow (0–184), the folding TABLE
//   (290, top 474) with the LOG on its writing slope, two crates, a pick, two ice saws.
//
//   b0   (6.0s before the line) Shackleton walks to the map and pins it (creak 0.8,
//        paper 3.6); Crean comes up the gangplank and sets a crate down by the stores
//        (crate 2.2) and goes back for another; Shackleton steps off (creak 5.0), hands
//        on hips, chin up; then his line, a hand to his chest, opened out.
//   b1   Worsley steps to the map and drags one finger across it, coast to coast; sighs.
//   b2   Crean comes up the plank with a crate, stacks it on the first, takes a folded
//        newspaper out of his jumper and holds it out.
//   b3   Shackleton waves it away, bends and pats the sack.  b4  Crean opens it wide.
//   b5   Shackleton writes on the pad, tears off the form, hands it to Crean, who runs it
//        down the gangplank.               b6  Worsley folds his arms and glares up at his
//        rigging, then at Shackleton; Crean comes back up with the telegraph boy's tray
//        and slides it along the case.     b7  Q1 OPEN THE WIRE.
//   b8   Shackleton takes the PROCEED form and holds it up high; Crean throws off the
//        mooring line; the quay slides away and the river bank turns past.
//   b9   (the spray) Grytviken: Crean points across the bay; Shackleton looks.
//   b10  Worsley unrolls a chart on the cask and pencils a new date on it.
//   b11  Shackleton sits on his cask, drums his fingers, stands as if it was his idea;
//        Crean goes down the gangplank.    b12 Crean comes up with a husky pup in his
//        arms and sets it at its kennel door; the jetty slides away as she sails.
//   b13  (the whiteout) the pack: Worsley kicks the ice at her bow, twice; nothing moves.
//   b14  Crean hands Shackleton a pick, takes up the ice saw and saws twice.
//   b15  Shackleton swings the pick twice, leans on it and poses.
//   b16  the channel glazes white; Worsley lets his saw drop and walks to the table;
//        Shackleton follows.               b17 Q2 WRITE THE ORDERS.
//   b18  Shackleton closes the log and straightens his cap.
//   b19  Crean carries a crate to her side and hands it up over the rail; smoke rises
//        from the stovepipe.               b20 Worsley watches, then a slow nod.
//   b21  dusk: lamplight in her portholes.
//
// Every figure has its own phase (N22), faces whom he talks to, turns before he walks
// (C18), and every hand that moves pins, drags, carries, holds out, pats, writes, hands,
// slides, throws, points, unrolls, drums, chops, saws, kicks or closes.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('personal-growth');
const W = NATURAL;
const { SHADE } = TONE;
const TR = 0.85;
const K = K_FIG * 0.95;
/** The hand paths are laid out for a figure 0.85 high; they grow with him. */
const KS = K / 0.85;
const G = GROUND;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.0s) and the line together. */
const LINES = [11.89, 5.68, 4.35, 5.24, 4.4, 4.84, 3.39, 0, 5.72, 4.87, 5.17, 5.0, 5.7, 5.51, 4.92, 4.81, 6.91, 0, 4.09, 4.38, 5.2, 0, 0];

const TALK = 167;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const QUAY = at('quay');
const MAP = at('map');
const CRATES = at('crates');
const LETTERS = at('letters');
const NEWS = at('news');
const WIRE = at('wire');
const GRUMBLE = at('grumble');
const PROCEED = at('proceed');
const STATION = at('station');
const BEND = at('bend');
const WAIT = at('wait');
const SAIL = at('sail');
const BESET = at('beset');
const CUT = at('cut');
const CHOP = at('chop');
const REFREEZE = at('refreeze');
const WINTER = at('winter');
const HOME = at('home');
const MOOD = at('mood');
const REST = at('rest');
const Q1 = BEATS.map((b) => (b.wires ? 1 : 0));
const Q2 = BEATS.map((b) => (b.orders ? 1 : 0));
const Q1N = Q1.indexOf(1);
const Q2N = Q2.indexOf(1);
const PLACE = BEATS.map((b) => b.place ?? 0);
/** Who speaks each beat, as a number the worklet can read: 1 Shackleton, 2 Worsley, 3 Crean. */
const SPK = BEATS.map((b) => (b.speaker === 'plain' ? 1 : b.speaker === 'tophat' ? 2 : b.speaker === 'cap' ? 3 : 0));

/** Seconds into a place change at which the place is swapped, under the veil. */
const CUT_S = 0.4;

// ── where everybody is at the START of each beat (stage x), and which way he faces ──
/** Shackleton: by the map (150), at the case (172), Grytviken (130), the floe (132), at the table (208). */
const S_X = [160, 150, 150, 150, 150, 150, 172, 150, 150, 130, 130, 130, 130, 132, 132, 132, 132, 208, 208, 208, 208, 208, 208];
const S_D = [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1];
/** Worsley: left of the map (40 → 64), by the chart cask (72), at her bow (214), right of the table (366). */
const W_X = [40, 40, 64, 64, 64, 64, 64, 64, 64, 72, 72, 72, 72, 214, 214, 214, 214, 366, 366, 366, 366, 366, 366];
const W_D = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
/** Crean: off down the gangplank (430), at the case (232), by the bitt (344), pointing (250), on the floe (76 → 172). */
const C_X = [404, 430, 430, 232, 232, 232, 430, 344, 344, 250, 250, 250, 430, 76, 76, 76, 76, 76, 76, 76, 172, 172, 172];
/** Each beat's facing: from its first frame, or — on a beat that opens with a walk — once the walk is done. */
const C_D = [-1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, 1, -1, -1, -1, 1, 1, 1, 1, 1];

// ── the things in the places ─────────────────────────────────────────────────
const MAPCASE = { x: 96 };
const SACK = { x: 176 };
const CASE = { x: 256, top: 469 };
const PAD = { x: 190, y: 467 };
const BITT = { x: 345, y: 470 };
const CRATE0 = { x: 330, y: 500 };
const SLOTS = [
  { id: 'proceed', x: 206, label: 'PROCEED' },
  { id: 'port', x: 256, label: 'RETURN\nTO PORT' },
  { id: 'fleet', x: 306, label: 'JOIN THE\nFLEET' },
] as const;
const ENV_FOOT = 464;
const CASK_A = { x: 46 };
const CASK_B = { x: 130 };
const SEAT_B = 21 / K;
const KENNEL_DOGS = [176, 248, 284];
const PUP_KENNEL = 284;
const CHANNEL = { x1: 184, y: 482, h: 9 };
const PICK0 = { x: 108, y: 497 };
const SAW_C = { x: 58 };
const SAW_W0 = { x: 198, y: 497 };
const ICE_CRATE = { x: 96 };
const SEAT_E = 20 / K;
const E_X = 24;
const E_CRATE = { x: 18 };
const TABLE = { x: 290, top: 474 };
const ROWS = [
  { id: 'keep', y: 410, label: 'KEEP CUTTING' },
  { id: 'abandon', y: 430, label: 'ABANDON SHIP' },
  { id: 'winter', y: 450, label: 'WINTER STATION' },
] as const;
const ROW_X = 246;
const STOVE = { x: 334, y: 368 };
const PORTS = [[262, 428], [292, 430], [322, 431], [352, 431], [382, 430]] as const;

/** Shackleton's, Worsley's and Crean's head pieces, for the figures and the face beside the words. */
const SHACK_HEAD = UNIT2_OUTFITS.shackleton.head;
const WORSLEY_HEAD = UNIT2_OUTFITS.captain.head;
const CREAN_HEAD = UNIT2_OUTFITS.explorer.head;
/** The seaman on the floe, composed from garb.ts's parts: a green jersey, grey trousers. */
const SEAMAN = dressed('en1seaman', 'a seaman: green jersey', [...trousers(WEAR.trouserGrey), ...coat(WEAR.sweaterGreen, 'hip'), ...sleeves(WEAR.sweaterGreen)]);

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { proceed: 1, port: 2, fleet: 3, keep: 4, abandon: 5, winter: 6 };

/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 11.89;
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
 * A walk from `src` to `to` that starts `start` SECONDS into the beat — later if he is
 * facing the wrong way and must turn first (C18: he always walks forwards). `k` < 1 is a
 * hurry (Crean running the wire down the gangplank).
 */
function walkOf(src: number, to: number, start: number, faceSrc: number, b: number, k: number) {
  'worklet';
  const d = Math.abs(to - src);
  if (d <= 1) return { x: to, x0: to, x1: to, u: 1, walking: false, ws: 0, we: 0, wd: 0 };
  const wd = to > src ? 1 : -1;
  const ws = (faceSrc < 0 ? -1 : 1) !== wd && start < TURN_S - 0.04 ? TURN_S - 0.04 : start;
  const we = ws + moveTr(src, to, TR) * k;
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
/** The ground under Crean: the deck, or the gangplank sloping down to the quay or the jetty. */
function plankG(x: number, place: number): number {
  'worklet';
  if (place === 2 || x <= 352) return G;
  return G + (x - 352) * (place === 0 ? 0.485 : 0.27);
}
/** A seated figure on a cask or a crate `h` rig units high, still (no clock). */
function seatOf(h: number, reach: number): Stance {
  'worklet';
  return seated(h, 0, reach);
}
/** Standing ↔ seated, sitting and rising the way a body does (hands to the knees). */
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
/** A kick: the right foot thrown forward at the ice and back, `f` 0 → 1 → 0. */
function kickOf(s: Stance, f: number): Stance {
  'worklet';
  if (f <= 0.001) return s;
  return { ...s, footR: { x: s.footR.x + 15 * f, y: s.footR.y - 7 * f }, tilt: s.tilt + 0.08 * f };
}
/** A plain stage object: where it is, whether it shows, its turn and its stretch. */
function ob(x: number, y: number, o: number, r: number, sx: number, sy: number) {
  'worklet';
  return { x, y, o, r, sx, sy };
}
/** A reaction's swing, 0 → 1 → held, out of the answer's 0 → 1. */
function swingOf(v: number): number {
  'worklet';
  return Math.sin(Math.PI * 0.5 * Math.min(1, v * 1.4));
}

export default function Endur1Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const heldW = useHeld();
  const heldC = useHeld();
  const heldE = useHeld();
  const cv = useCarry(9);
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
    const cutBeat = n === STATION || n === BESET;
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
    const place = PLACE[nv];
    // the veils: sea spray into Grytviken, a whiteout into the pack, a quick one on a step back
    const cut = cutBeat && !back ? stage(b0, 1, 0.06, CUT_S) * (1 - stage(b0, 1, CUT_S, CUT_S + 0.55)) : 0;
    const backVeil = back ? 1 - stage(b0, 1, 0, 0.45) : 0;
    const spray = Math.max(n === STATION ? cut : 0, backVeil);
    const snow = n === BESET ? cut : 0;
    const fresh = back || (cutBeat && !pre);
    const src = (slot: number, table: readonly number[]) => {
      'worklet';
      return fresh ? table[nv] : carrySource(cv, slot, n, table[nv]);
    };
    const sp = (who: number) => {
      'worklet';
      return SPK[nv] === who;
    };
    // the answers: right and wrong, in each game
    const okQ1 = swingOf(ans(1, Q1));
    const noQ1 = swingOf(ans(2, Q1) + ans(3, Q1));
    const okQ2 = swingOf(ans(6, Q2));
    const noQ2 = swingOf(ans(4, Q2) + ans(5, Q2));

    // ══ SHACKLETON ═══════════════════════════════════════════════════════════
    const sxs = src(1, S_X);
    const sds = src(2, S_D);
    let sw: Walk = STILL;
    let sx = sxs;
    let sTurns: (readonly number[])[] = [[0, S_D[nv]]];
    let sSeat = 0;
    if (nv === QUAY) { sw = b < 4.4 ? walkOf(sxs, 136, 0.05, -1, b, 1) : walkOf(136, 150, 4.9, -1, b, 1); sTurns = [[0, -1], [0.48, -1]]; }
    if (nv === CRATES) sTurns = [[0, -1], [0.3, 1]];
    if (nv === WIRE) { sw = walkOf(sxs, 172, 0.02 * L, sds, b, 1); sTurns = [[0, 1], [0.86, -1]]; }
    if (nv === GRUMBLE) sw = walkOf(sxs, 150, 0.04 * L, sds, b, 1);
    if (nv === Q1N) sTurns = [[0, -1], [0.05, 1]];
    if (nv === PROCEED) sw = walkOf(sxs, 182, 0.02 * L, sds, b, 1);
    if (nv === BEND) sTurns = [[0, 1], [0.04, -1]];
    if (nv === WAIT) sSeat = st(0.04, 0.18) * (1 - st(0.6, 0.76));
    if (nv === SAIL) sTurns = [[0, -1], [0.06, 1]];
    if (nv === CUT) sTurns = [[0, 1], [0.02, -1]];
    if (nv === CHOP) sTurns = [[0, -1], [0.02, 1]];
    if (nv === REFREEZE) sw = walkOf(sxs, 208, 0.62 * L, sds, b, 1);
    if (nv === HOME) sTurns = [[0, 1], [0.06, -1]];
    if (nv === MOOD) sTurns = [[0, -1], [0.06, 1]];
    if (sw.wd === 0 && !fresh && Math.abs(sxs - S_X[nv]) > 1) sw = walkOf(sxs, S_X[nv], 0, sds, b, 0.7);
    if (sw.wd !== 0) sx = sw.x;
    const sxS = carry(cv, 1, n, sx, sx, 1);
    const sd = carry(cv, 2, n, 0, faceOf(sds, sTurns, b, L, sw), 1);
    const sCode = sp(1) ? TALK : NOD;
    let ss = bodyOf(sw, sCode, t, b, 0);
    /** Hands on hips, chin up: the Boss at rest. */
    const HIPR: readonly Key[] = [[0, 3, 34, 1]];
    const HIPL: readonly Key[] = [[0, 1, 33, 1]];
    let sR: readonly Key[] | null = HIPR;
    let sL: readonly Key[] | null = HIPL;
    let sLean = 0;
    let sNeck = -0.08;
    let sFist = 0;
    if (nv === QUAY) {
      // pins the map's right-hand corners, smooths it, steps off: hands on hips; then a hand
      // to his chest at "the first", and opened out at "a lovely book"
      sR = [[S0(1.3), 8, 44, 0], [S0(1.8), 18, 48, 1], [S0(2.3), 18, 48, 1], [S0(2.7), 18, 22, 1], [S0(3.1), 18, 22, 1], [S0(3.4), 22, 36, 1], [S0(4.0), 40, 34, 1], [S0(4.4), 8, 44, 0.4],
        [S0(5.5), 3, 34, 1], [S0(7.6), 3, 34, 1], [S0(8.1), 4, 58, 1], [S0(9.4), 4, 58, 1], [S0(10.0), 24, 62, 1], [S0(11.2), 24, 60, 1], [S0(11.7), 3, 34, 1]];
      sL = [[S0(1.3), 6, 44, 0], [S0(1.9), 16, 47, 1], [S0(3.2), 16, 47, 1], [S0(3.5), 8, 44, 0.3], [S0(5.5), 1, 33, 1]];
      sNeck = -0.1 * st(S0(5.4), S0(6.0)) + 0.08 * bump(S0(1.6), S0(2.0), S0(4.0), S0(4.5));
    }
    if (nv === MAP) sNeck = -0.1 + 0.12 * bump(0.4, 0.5, 0.7, 0.8);
    if (nv === CRATES) sNeck = -0.1 + 0.06 * bump(0.5, 0.6, 0.8, 0.9);
    if (nv === LETTERS) {
      // waves the paper away, then bends and pats the bulging sack, twice
      sR = [[0, 3, 34, 1], [0.08, 22, 58, 1], [0.16, 26, 50, 1], [0.24, 14, 46, 1], [0.42, 22, 20, 1], [0.5, 22, 14, 1], [0.56, 22, 20, 1], [0.62, 22, 14, 1], [0.74, 14, 30, 1], [0.86, 3, 34, 1]];
      sLean = 0.34 * bump(0.36, 0.44, 0.66, 0.76);
      sNeck = -0.08 + 0.18 * bump(0.36, 0.44, 0.66, 0.76) - 0.08 * st(0.8, 0.9);
    }
    if (nv === NEWS) {
      sLean = 0.14 * bump(0.2, 0.34, 0.8, 0.92);
      sNeck = 0.12 * bump(0.2, 0.34, 0.8, 0.92);
    }
    if (nv === WIRE) {
      // writes on the pad, tears the form off, hands it across to Crean
      sR = [[0, 3, 34, 1], [0.14, 20, 27, 1], [0.2, 25, 27, 1], [0.24, 21, 26, 1], [0.28, 25, 27, 1], [0.34, 22, 28, 1], [0.4, 22, 44, 1], [0.48, 38, 50, 1], [0.56, 38, 50, 1], [0.7, 8, 44, 0.5]];
      sL = [[0, 1, 33, 1], [0.14, 16, 28, 1], [0.34, 16, 28, 1], [0.42, 6, 44, 0.3]];
      sLean = 0.3 * bump(0.1, 0.16, 0.34, 0.42) + 0.12 * bump(0.42, 0.48, 0.56, 0.64);
      sNeck = 0.2 * bump(0.1, 0.16, 0.34, 0.42);
    }
    if (nv === GRUMBLE) {
      sR = [[0, 8, 44, 0.5], [0.5, 3, 34, 1]];
      sL = [[0.5, 1, 33, 1]];
      sNeck = -0.04 * st(0.6, 0.7);
    }
    if (nv === Q1N) {
      // a right answer: a fist up and his chin up; a wrong one: his head drops, he slumps
      sNeck = 0.12 * st(0.04, 0.14) - 0.3 * okQ1 + 0.26 * noQ1;
      sLean = -0.08 * okQ1 + 0.18 * noQ1;
      sFist = okQ1;
    }
    if (nv === PROCEED) {
      // takes the PROCEED form out of its envelope and holds it up high
      sR = [[0, 3, 34, 1], [0.2, 20, 36, 1], [0.27, 20, 36, 1], [0.38, 16, 90, 1], [0.95, 16, 90, 1]];
      sL = [[0, 1, 33, 1], [0.28, 6, 44, 0.3], [0.38, 10, 84, 1], [0.95, 10, 84, 1]];
      sLean = 0.22 * bump(0.12, 0.2, 0.27, 0.34) - 0.06 * st(0.38, 0.48);
      sNeck = 0.14 * bump(0.12, 0.2, 0.27, 0.34) - 0.2 * st(0.38, 0.5);
    }
    if (nv === STATION && !pre) sNeck = -0.06 - 0.12 * bump(0.25, 0.35, 0.8, 0.9);
    if (nv === WAIT) {
      // seated: drums his fingers on his knee, twice; then up, a finger raised: his idea
      sR = [[0, 3, 34, 1], [0.2, 14, 26, 1], [0.27, 16, 22, 1], [0.32, 16, 26, 1], [0.5, 16, 26, 1], [0.55, 16, 22, 1], [0.6, 14, 30, 1], [0.8, 12, 78, 1], [0.95, 12, 78, 1]];
      sL = [[0, 1, 33, 1], [0.2, 12, 24, 1], [0.6, 12, 24, 1], [0.76, 1, 33, 1]];
      sNeck = 0.1 * bump(0.25, 0.32, 0.5, 0.56) - 0.16 * st(0.76, 0.84);
    }
    if (nv === BESET && !pre) sNeck = 0.08 * bump(0.3, 0.38, 0.62, 0.7);
    if (nv === CUT) {
      // takes the pick Crean holds out, by its handle, and grounds it
      sR = [[0, 3, 34, 1], [0.16, 26, 50, 1], [0.26, 26, 50, 1], [0.4, 12, 40, 1]];
    }
    if (nv === CHOP) {
      // the pick swung twice, both hands on the handle; then leaning on it, posing
      sR = [[0, 12, 40, 1], [0.08, 6, 92, 1], [0.16, 24, 26, 1], [0.24, 6, 92, 1], [0.32, 24, 26, 1], [0.42, 18, 40, 1], [0.95, 18, 40, 1]];
      sL = [[0, 6, 44, 0.4], [0.06, 4, 88, 1], [0.16, 20, 28, 1], [0.24, 4, 88, 1], [0.32, 20, 28, 1], [0.42, 1, 33, 1]];
      sLean = 0.24 * (bump(0.1, 0.16, 0.18, 0.22) + bump(0.26, 0.32, 0.34, 0.38)) + 0.1 * st(0.44, 0.52);
      sNeck = -0.2 * st(0.5, 0.6);
    }
    if (nv === REFREEZE) {
      sR = [[0, 18, 40, 1], [0.3, 18, 40, 1], [0.4, 3, 34, 1]];
      sNeck = 0.1 * bump(0.1, 0.2, 0.4, 0.5);
    }
    if (nv === Q2N) {
      // the pen raised over the log; right: chin up; wrong: his head drops
      sR = [[0, 14, 52, 1]];
      sNeck = 0.08 * st(0.04, 0.14) - 0.26 * okQ2 + 0.24 * noQ2;
      sLean = 0.16 * noQ2 - 0.06 * okQ2;
    }
    if (nv === WINTER) {
      // closes the log, then straightens his cap
      sR = [[0, 14, 52, 1], [0.12, 30, 42, 1], [0.3, 30, 38, 1], [0.42, 8, 44, 0.5], [0.52, 6, 92, 1], [0.62, 8, 94, 1], [0.74, 3, 34, 1]];
      sLean = 0.18 * bump(0.1, 0.16, 0.3, 0.38);
      sNeck = 0.1 * bump(0.1, 0.16, 0.3, 0.38) - 0.12 * st(0.6, 0.72);
    }
    ss = keyed(ss, sR, u, sxS, G, sd, 1);
    ss = keyed(ss, sL, u, sxS, G, sd, -1);
    if (sFist > 0.001) ss = hand(ss, sxS, G, sd, 1, 10, 98, sFist);
    ss = leanOf(ss, sLean, sNeck);
    if (sSeat > 0) {
      let seat = leanOf(seatOf(SEAT_B, 13), 0, sNeck);
      seat = keyed(seat, sR, u, sxS, G, sd, 1);
      seat = keyed(seat, sL, u, sxS, G, sd, -1);
      ss = seatMix(ss, seat, sSeat);
    }
    const prevS = carryFrom(heldS, n, hHold(sCode, t, 0));
    const figS = keepHeld(heldS, sw.walking ? mixKeepLegs(prevS, ss, tr) : mixStance(prevS, ss, tr));

    // ══ WORSLEY ══════════════════════════════════════════════════════════════
    const wxs = src(3, W_X);
    const wds = src(4, W_D);
    let ww: Walk = STILL;
    let wx = wxs;
    let wTurns: (readonly number[])[] = [[0, W_D[nv]]];
    if (nv === MAP) ww = walkOf(wxs, 64, 0.04 * L, wds, b, 1);
    if (nv === BEND) wTurns = [[0, 1], [0.04, -1], [0.72, 1]];
    if (nv === REFREEZE) { ww = walkOf(wxs, 366, 0.3 * L, wds, b, 1); wTurns = [[0, -1], [0.93, -1]]; }
    if (ww.wd === 0 && !fresh && Math.abs(wxs - W_X[nv]) > 1) ww = walkOf(wxs, W_X[nv], 0, wds, b, 0.7);
    if (ww.wd !== 0) wx = ww.x;
    const wxS = carry(cv, 3, n, wx, wx, 1);
    const wd = carry(cv, 4, n, 0, faceOf(wds, wTurns, b, L, ww), 1);
    const wCode = sp(2) ? TALK : NOD;
    let sW = bodyOf(ww, wCode, t, b, 1);
    /** Arms folded across his chest: the captain's patience. */
    const FOLDR: readonly Key[] = [[0, 9, 50, 1]];
    const FOLDL: readonly Key[] = [[0, 7, 47, 1]];
    let wR: readonly Key[] | null = FOLDR;
    let wL: readonly Key[] | null = FOLDL;
    let wLean = 0;
    let wNeck = 0;
    let kick = 0;
    if (nv === QUAY) wNeck = 0.06 * bump(S0(2.6), S0(3.0), S0(4.2), S0(4.6));
    if (nv === MAP) {
      // one finger dragged across the map, coast to coast; then the sigh
      wR = [[0, 9, 50, 1], [0.24, 9, 50, 1], [0.32, 14, 40, 1], [0.38, 14, 38, 1], [0.7, 42, 36, 1], [0.8, 40, 36, 1], [0.9, 9, 50, 1]];
      wL = [[0, 7, 47, 1], [0.3, 6, 44, 0.3], [0.88, 7, 47, 1]];
      wLean = 0.16 * bump(0.32, 0.4, 0.72, 0.8) + 0.1 * bump(0.82, 0.88, 0.92, 0.98);
      wNeck = 0.12 * bump(0.32, 0.4, 0.72, 0.8) + 0.16 * bump(0.82, 0.88, 0.92, 0.98);
    }
    if (nv === GRUMBLE) wNeck = -0.3 * bump(0.08, 0.2, 0.42, 0.52) + 0.1 * st(0.56, 0.66);
    if (nv === Q1N) wNeck = 0.06 * st(0.04, 0.14) - 0.2 * okQ1 + 0.14 * noQ1;
    if (nv === PROCEED) wNeck = -0.24 * bump(0.5, 0.6, 0.7, 0.78) + 0.14 * bump(0.82, 0.88, 0.92, 0.98);
    if (nv === BEND) {
      // unrolls the chart on the cask, pencils the new date, turns back
      wR = [[0, 9, 50, 1], [0.08, 18, 32, 1], [0.12, 18, 32, 1], [0.3, 18, 46, 1], [0.4, 20, 36, 1], [0.54, 28, 37, 1], [0.66, 9, 50, 1], [0.8, 20, 60, 1], [0.92, 9, 50, 1]];
      wL = [[0, 7, 47, 1], [0.08, 14, 32, 1], [0.12, 14, 32, 1], [0.3, 14, 46, 1], [0.62, 14, 46, 1], [0.68, 7, 47, 1]];
      wLean = 0.3 * bump(0.06, 0.12, 0.58, 0.66);
      wNeck = 0.22 * bump(0.06, 0.12, 0.58, 0.66);
    }
    if (nv === SAIL) wNeck = -0.1 * bump(0.4, 0.5, 0.9, 1);
    if (place === 2 && nv <= REFREEZE) { wR = [[0, 3, 34, 1]]; wL = [[0, 1, 33, 1]]; }
    if (nv === BESET && !pre) {
      // he kicks the ice at her bow, twice; it does not move
      kick = bump(0.26, 0.31, 0.32, 0.38) + bump(0.48, 0.53, 0.54, 0.6);
      wNeck = 0.18 * st(0.2, 0.3);
      wLean = -0.06 * kick;
    }
    // his saw, from the ice by the bow (b14), held upright, let drop (b16)
    if (nv === CUT) {
      wR = [[0, 3, 34, 1], [0.1, 14, 8, 1], [0.2, 14, 8, 1], [0.32, 14, 46, 1]];
      wLean = 0.42 * bump(0.06, 0.12, 0.2, 0.28);
    }
    if (nv === CHOP) wR = [[0, 14, 46, 1]];
    if (nv === REFREEZE) {
      wR = [[0, 14, 46, 1], [0.2, 14, 46, 1], [0.26, 10, 40, 0.6], [0.3, 3, 34, 1]];
      wNeck = 0.2 * bump(0.04, 0.12, 0.22, 0.3);
    }
    if (nv === Q2N) wNeck = 0.06 * st(0.04, 0.14) + 0.18 * okQ2 * (1 - st(0.6, 0.9)) - 0.2 * noQ2;
    if (nv === MOOD) wNeck = 0.06 * bump(0.1, 0.2, 0.6, 0.7) + 0.26 * bump(0.72, 0.82, 0.88, 0.98);
    sW = keyed(sW, wR, u, wxS, G, wd, 1);
    sW = keyed(sW, wL, u, wxS, G, wd, -1);
    sW = leanOf(sW, wLean, wNeck);
    sW = kickOf(sW, kick);
    const prevW = carryFrom(heldW, n, hHold(wCode, t, 1));
    const figW = keepHeld(heldW, ww.walking ? mixKeepLegs(prevW, sW, tr) : mixStance(prevW, sW, tr));

    // ══ CREAN ════════════════════════════════════════════════════════════════
    const cxs = src(5, C_X);
    const cds = src(6, C_D);
    let cw: Walk = STILL;
    let cx = cxs;
    let cTurns: (readonly number[])[] = [[0, C_D[nv]]];
    // b0: up the plank with a crate, set it down by the stores, back down for another
    if (nv === QUAY) { cw = b < 2.7 ? walkOf(404, 344, 0, -1, b, 1) : walkOf(344, 430, 3.0, -1, b, 1); cTurns = [[0, -1]]; }
    if (nv === CRATES) cw = b < 0.5 * L ? walkOf(430, 344, 0, cds, b, 0.8) : walkOf(344, 232, 0.5 * L, -1, b, 0.9);
    if (nv === WIRE) cw = walkOf(cxs, 430, 0.54 * L, cds, b, 0.6);
    if (nv === GRUMBLE) cw = walkOf(cxs, 344, 0, cds, b, 0.8);
    if (nv === PROCEED) cTurns = [[0, -1], [0.06, 1], [0.76, -1]];
    if (nv === WAIT) cw = walkOf(cxs, 430, 0.3 * L, cds, b, 1);
    if (nv === SAIL) cw = walkOf(cxs, PUP_KENNEL + 18, 0, cds, b, 1);
    if (nv === CUT) cTurns = [[0, 1], [0.3, -1]];
    if (nv === Q2N) cTurns = [[0, -1], [0.06, 1]];
    if (nv === HOME) cw = walkOf(cxs, 172, 0.18 * L, cds, b, 1);
    if (cw.wd === 0 && !fresh && Math.abs(cxs - C_X[nv]) > 1) cw = walkOf(cxs, C_X[nv], 0, cds, b, 0.7);
    if (cw.wd !== 0) cx = cw.x;
    const cxS = carry(cv, 5, n, cx, cx, 1);
    const cd = carry(cv, 6, n, 0, faceOf(cds, cTurns, b, L, cw), 1);
    const cg = plankG(cxS, place);
    const cCode = sp(3) ? TALK : NOD;
    let sc = bodyOf(cw, cCode, t, b, 2);
    let cR: readonly Key[] | null = null;
    let cL: readonly Key[] | null = null;
    let cLean = 0;
    let cNeck = 0;
    if (nv === QUAY) {
      cR = [[0, 15, 40, 1], [S0(1.7), 15, 40, 1], [S0(2.2), 16, 12, 1], [S0(2.6), 8, 44, 0.4]];
      cL = [[0, 12, 40, 1], [S0(1.7), 12, 40, 1], [S0(2.2), 13, 12, 1], [S0(2.6), 6, 44, 0.4]];
      cLean = 0.46 * hd(b, 1, 1.7, 2.2, 2.35, 2.7);
    }
    if (nv === CRATES) {
      // the crate stacked on the first; the newspaper out of his jumper, held out
      cR = [[0, 15, 40, 1], [0.38, 15, 40, 1], [0.44, 16, 28, 1], [0.5, 8, 44, 0.4], [0.62, 6, 50, 1], [0.86, 6, 50, 1], [0.94, 24, 52, 1]];
      cL = [[0, 12, 40, 1], [0.38, 12, 40, 1], [0.44, 13, 28, 1], [0.5, 6, 44, 0.4]];
      cLean = 0.24 * bump(0.38, 0.44, 0.46, 0.5);
    }
    if (nv === LETTERS) {
      cR = [[0, 24, 52, 1], [0.12, 24, 52, 1], [0.24, 10, 50, 1]];
      cNeck = 0.1 * bump(0.12, 0.2, 0.3, 0.4);
    }
    if (nv === NEWS) {
      // the newspaper opened wide in both hands
      cR = [[0, 10, 50, 1], [0.1, 20, 56, 1], [0.9, 20, 56, 1]];
      cL = [[0, 6, 44, 0.3], [0.1, 8, 56, 1], [0.9, 8, 56, 1]];
      cNeck = -0.06;
    }
    if (nv === WIRE) {
      // the paper folded away; the form taken from the Boss's hand
      cR = [[0, 20, 56, 1], [0.1, 6, 46, 1], [0.16, 8, 44, 0.4], [0.4, 8, 44, 0.4], [0.48, 16, 50, 1], [0.54, 12, 46, 1]];
      cL = [[0, 8, 56, 1], [0.12, 6, 44, 0.3]];
      cNeck = 0.12 * bump(0.12, 0.2, 0.36, 0.44);
    }
    if (nv === GRUMBLE) {
      // the telegraph boy's tray carried up, set on the case and slid along it
      cR = [[0, 16, 40, 1], [0.6, 16, 40, 1], [0.7, 18, 30, 1], [0.86, 30, 30, 1], [0.94, 8, 44, 0.4]];
      cL = [[0, 13, 40, 1], [0.6, 13, 40, 1], [0.7, 15, 30, 1], [0.86, 27, 30, 1], [0.94, 6, 44, 0.4]];
      cLean = 0.26 * bump(0.6, 0.7, 0.86, 0.96);
    }
    if (nv === Q1N) cNeck = 0.08 * st(0.04, 0.14) - 0.12 * okQ1 + 0.1 * noQ1;
    if (nv === PROCEED) {
      // lifts the mooring line's loop off the bitt and throws it down to the quay
      cR = [[0, 8, 44, 0.4], [0.16, 10, 26, 1], [0.26, 10, 28, 1], [0.36, 14, 62, 1], [0.44, 30, 56, 1], [0.6, 30, 50, 1], [0.72, 8, 44, 0.4]];
      cL = [[0, 6, 44, 0.4], [0.16, 8, 26, 1], [0.3, 8, 30, 1], [0.36, 6, 44, 0.3]];
      cLean = 0.34 * bump(0.1, 0.18, 0.26, 0.34) + 0.14 * bump(0.36, 0.44, 0.5, 0.6);
    }
    if (nv === STATION && !pre) {
      // points south across the bay
      cR = [[0.05, 8, 44, 0], [0.16, 30, 84, 1], [0.8, 30, 84, 1], [0.92, 8, 44, 0.4]];
      cNeck = -0.12 * bump(0.12, 0.2, 0.8, 0.9);
    }
    if (nv === SAIL) {
      // the pup in his arms; down to the kennel door
      cR = [[0, 13, 46, 1], [0.5, 13, 46, 1], [0.62, 20, 14, 1], [0.72, 20, 14, 1], [0.8, 8, 44, 0.4]];
      cL = [[0, 10, 44, 1], [0.5, 10, 44, 1], [0.62, 16, 14, 1], [0.72, 16, 14, 1], [0.8, 6, 44, 0.4]];
      cLean = 0.5 * bump(0.5, 0.62, 0.72, 0.82);
      cNeck = 0.2 * bump(0.5, 0.62, 0.72, 0.82);
    }
    if (nv === CUT) {
      // the pick off the ice and held out, by its handle; then the saw, two strokes
      cR = [[0, 8, 44, 0.4], [0.06, 28, 8, 1], [0.1, 28, 8, 1], [0.18, 24, 50, 1], [0.26, 24, 50, 1], [0.32, 8, 44, 0.4], [0.4, 14, 70, 1], [0.5, 14, 70, 1], [0.56, 14, 40, 1], [0.66, 14, 70, 1], [0.76, 14, 70, 1], [0.84, 14, 40, 1], [0.95, 14, 56, 1]];
      cL = [[0.36, 6, 44, 0], [0.42, 12, 66, 1], [0.5, 12, 66, 1], [0.56, 12, 36, 1], [0.66, 12, 66, 1], [0.76, 12, 66, 1], [0.84, 12, 36, 1], [0.95, 12, 52, 1]];
      cLean = 0.44 * bump(0.02, 0.06, 0.1, 0.16) + 0.16 * (bump(0.5, 0.56, 0.56, 0.62) + bump(0.78, 0.84, 0.84, 0.9));
    }
    if (nv >= CHOP && nv <= Q2N) {
      cR = [[0, 14, 56, 1]];
      cL = [[0, 12, 52, 1]];
    }
    if (nv === REFREEZE) cNeck = 0.16 * bump(0.1, 0.2, 0.5, 0.6);
    if (nv === Q2N) {
      // he lifts the saw at a right answer; shakes his head over it at a wrong one
      cR = [[0, 14, 56, 1]];
      cL = [[0, 12, 52, 1]];
      cNeck = 0.06 * st(0.04, 0.14) + 0.16 * noQ2 - 0.12 * okQ2;
      cLean = -0.06 * okQ2 + 0.1 * noQ2;
    }
    if (nv === WINTER) { cR = [[0, 14, 56, 1], [0.2, 8, 44, 0.4]]; cL = [[0, 12, 52, 1], [0.2, 6, 44, 0.3]]; }
    if (nv === HOME) {
      // picks up the crate, carries it to her side, hands it up over the rail
      cR = [[0, 8, 44, 0.4], [0.06, 18, 8, 1], [0.12, 18, 10, 1], [0.2, 15, 40, 1], [0.6, 15, 40, 1], [0.7, 20, 64, 1], [0.8, 24, 92, 1], [0.86, 24, 92, 1], [0.95, 8, 44, 0.4]];
      cL = [[0, 6, 44, 0.4], [0.06, 15, 8, 1], [0.12, 15, 10, 1], [0.2, 12, 40, 1], [0.6, 12, 40, 1], [0.7, 17, 64, 1], [0.8, 21, 92, 1], [0.86, 21, 92, 1], [0.95, 6, 44, 0.4]];
      cLean = 0.48 * bump(0.02, 0.06, 0.12, 0.18) - 0.1 * bump(0.72, 0.8, 0.86, 0.92);
      cNeck = -0.2 * bump(0.7, 0.78, 0.86, 0.94);
    }
    if (nv === MOOD) {
      // dusts his hands off, twice
      cR = [[0.2, 8, 44, 0.4], [0.3, 16, 48, 1], [0.36, 10, 50, 1], [0.42, 16, 48, 1], [0.5, 8, 44, 0.4]];
      cL = [[0.2, 6, 44, 0.4], [0.3, 12, 50, 1], [0.36, 16, 48, 1], [0.42, 12, 50, 1], [0.5, 6, 44, 0.4]];
    }
    sc = keyed(sc, cR, u, cxS, cg, cd, 1);
    sc = keyed(sc, cL, u, cxS, cg, cd, -1);
    sc = leanOf(sc, cLean, cNeck);
    const prevC = carryFrom(heldC, n, hHold(cCode, t, 2));
    const figC = keepHeld(heldC, cw.walking ? mixKeepLegs(prevC, sc, tr) : mixStance(prevC, sc, tr));
    const cOn = place === 2 || cxS < 420 ? 1 : 0;

    // ══ THE SEAMAN ON THE FLOE (silent) ══════════════════════════════════════
    let se = hLive(NOD, t, b, 3);
    let eR: readonly Key[] | null = [[0, 10, 60, 1]];
    let eL: readonly Key[] | null = [[0, 10, 44, 1]];
    let eLean = 0;
    let eNeck = 0;
    let eSeat = 0;
    if (nv === BESET) {
      // he blows into his free hand
      eL = [[0.3, 10, 44, 1], [0.4, 8, 80, 1], [0.6, 8, 80, 1], [0.7, 10, 44, 1]];
      eNeck = 0.1 * bump(0.38, 0.44, 0.58, 0.64);
    }
    if (nv === CUT || nv === CHOP) {
      // the chisel driven into the ice ahead of him, twice
      const a0 = nv === CUT ? 0.42 : 0.2;
      eR = [[a0, 10, 60, 1], [a0 + 0.06, 18, 70, 1], [a0 + 0.12, 20, 34, 1], [a0 + 0.18, 18, 70, 1], [a0 + 0.24, 20, 34, 1], [a0 + 0.32, 10, 60, 1]];
      eL = [[a0, 10, 44, 1], [a0 + 0.06, 16, 54, 1], [a0 + 0.12, 18, 22, 1], [a0 + 0.18, 16, 54, 1], [a0 + 0.24, 18, 22, 1], [a0 + 0.32, 10, 44, 1]];
      eLean = 0.2 * (bump(a0 + 0.08, a0 + 0.12, a0 + 0.12, a0 + 0.16) + bump(a0 + 0.2, a0 + 0.24, a0 + 0.24, a0 + 0.28));
    }
    if (nv === REFREEZE) {
      // he leans on the chisel and shakes his head over the channel
      eR = [[0, 10, 60, 1], [0.2, 12, 66, 1]];
      eL = [[0, 10, 44, 1], [0.2, 11, 62, 1]];
      eLean = 0.16 * st(0.2, 0.3);
      eNeck = 0.22 * bump(0.3, 0.4, 0.7, 0.8);
    }
    if (nv === Q2N) eNeck = -0.08;
    if (nv === WINTER) {
      // hugs himself against the cold
      eR = [[0.2, 10, 60, 1], [0.32, 4, 58, 1], [0.8, 4, 58, 1]];
      eL = [[0.2, 10, 44, 1], [0.32, 6, 56, 1], [0.8, 6, 56, 1]];
      eLean = 0.08 * bump(0.3, 0.4, 0.7, 0.8);
    }
    if (nv === HOME) eNeck = -0.1 * bump(0.6, 0.7, 0.86, 0.96);
    if (nv >= MOOD) { eSeat = nv === MOOD ? st(0.14, 0.34) : 1; eR = [[0, 12, 44, 1]]; eL = [[0, 10, 30, 0.8]]; }
    se = keyed(se, eR, u, E_X, G, 1, 1);
    se = keyed(se, eL, u, E_X, G, 1, -1);
    se = leanOf(se, eLean, eNeck);
    if (eSeat > 0) {
      let seat = seatOf(SEAT_E, 12);
      seat = keyed(seat, eR, u, E_X, G, 1, 1);
      seat = keyed(seat, eL, u, E_X, G, 1, -1);
      se = seatMix(se, seat, eSeat);
    }
    const figE = keepHeld(heldE, mixStance(carryFrom(heldE, n, se), se, tr));

    // ── the bundles ──────────────────────────────────────────────────────────
    const bS = pose(figS, sxS, G, K, sd, 1);
    const bW = pose(figW, wxS, G, K, wd, 1);
    const bC = pose(figC, cxS, cg, K, cd, cOn);
    const bE = pose(figE, E_X, G, K, 1, place === 2 ? 1 : 0);
    const sRw = jointOf(bS, 'wrR');
    const sLw = jointOf(bS, 'wrL');
    const wRw = jointOf(bW, 'wrR');
    const cRw = jointOf(bC, 'wrR');
    const cLw = jointOf(bC, 'wrL');
    const eRw = jointOf(bE, 'wrR');
    const mid = (a: { x: number; y: number }, c: { x: number; y: number }) => {
      'worklet';
      return { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
    };
    const cHands = mid(cRw, cLw);
    const sHands = mid(sRw, sLw);
    const NONE = ob(0, 0, 0, 0, 1, 1);

    // ══ LONDON: the river turns past, the quay slides away; the crates, the paper, the wire ══
    const easing = nv === PROCEED ? st(0.6, 1) : 0;
    const farX = 26 * easing;
    const quayX = 96 * easing;
    const quayO = place === 0 ? (nv === PROCEED ? 1 - st(0.8, 1) : 1) : 0;
    // the first crate (b0): in his arms, then set down by the stores, and it stays
    const c0set = nv === QUAY ? (b > 2.2 ? 1 : 0) : 1;
    const crate0 = place !== 0 ? NONE
      : !c0set ? ob(cHands.x, cHands.y + 10, cOn, 0, 1, 1) : ob(CRATE0.x, CRATE0.y, 1, 0, 1, 1);
    // the second crate (b2): stacked on the first
    const c2set = nv === CRATES ? (u > 0.46 ? 1 : 0) : nv > CRATES ? 1 : 0;
    const crate2 = place !== 0 || nv < CRATES ? NONE
      : !c2set ? ob(cHands.x, cHands.y + 10, cOn, 0, 1, 1) : ob(CRATE0.x, CRATE0.y - 20, 1, 0, 1, 1);
    // the newspaper: folded in his hand (b2–b3), opened wide (b4), folded away (b5)
    const paperO = nv === CRATES ? st(0.6, 0.64) : nv === LETTERS || nv === NEWS ? 1 : nv === WIRE ? 1 - st(0.12, 0.16) : 0;
    const paperOpen = nv === NEWS ? st(0.04, 0.12) : nv === WIRE ? 1 - st(0.02, 0.1) : 0;
    const wide = nv === NEWS || (nv === WIRE && u < 0.1);
    const paper = ob(wide ? cHands.x : cRw.x, (wide ? cHands.y : cRw.y) - 2, paperO, 0, 0.3 + 0.7 * paperOpen, 0.45 + 0.55 * paperOpen);
    // the telegram form: written on the pad, torn off, handed across, run down the plank
    const formHeld = nv === WIRE ? (u < 0.36 ? 0 : u < 0.5 ? 1 : 2) : 0;
    const wireForm = formHeld === 1 ? ob(sRw.x, sRw.y - 3, 1, -10, 0.5, 0.5) : formHeld === 2 ? ob(cRw.x, cRw.y - 3, cOn, -10, 0.5, 0.5) : NONE;
    const scrawl = nv === WIRE ? st(0.16, 0.32) * (1 - st(0.36, 0.38)) : 0;
    // the tray: carried up (b6), slid along the case, and there till she sails
    const traySlid = nv === GRUMBLE ? st(0.72, 0.9) : 1;
    const trayCarried = nv === GRUMBLE && u < 0.72;
    const tray = place !== 0 || nv < GRUMBLE ? NONE
      : trayCarried ? ob(cHands.x, cHands.y + 6, cOn, 0, 1, 1) : ob(lerp(cHands.x - 6, CASE.x, traySlid), CASE.top - 1, 1, 0, 1, 1);
    // the mooring line: from the bitt down to the quay; lifted and thrown off (b8)
    const ropeOff = nv === PROCEED ? st(0.42, 0.62) : nv > PROCEED ? 1 : 0;
    const ropeHeld = nv === PROCEED && u > 0.2 && u < 0.44;
    const rx = ropeHeld ? cRw.x : lerp(BITT.x, 420, ropeOff);
    const ry = ropeHeld ? cRw.y : lerp(BITT.y, 520, ropeOff);
    const rope = { x0: rx, y0: ry, x1: 412 + quayX, y1: 512, o: place === 0 ? 1 - (nv === PROCEED ? st(0.66, 0.8) : 0) : 0 };

    // ══ THE WIRE GAME: three envelopes, one opened; the PROCEED form taken (b8) ══
    const envOf = (k: number, code: number) => {
      'worklet';
      const r = ans(code, Q1);
      const ok = code === 1;
      // the form rises out; the right one stands up and waves, a wrong one wilts back down
      const rise = ok ? Math.min(1, r * 1.6) : Math.min(1, r * 1.6) - 0.25 * clamp01((r - 0.55) / 0.45);
      const taken = k === 0 && nv >= PROCEED && place === 0 && (nv > PROCEED || u >= 0.24);
      const proceedUp = k === 0 && nv === PROCEED && !taken ? 0.6 + 0.4 * st(0.1, 0.2) : 0;
      const up = Math.max(rise, proceedUp);
      const form = taken ? ob(sHands.x, sHands.y - 8, 1, sd > 0 ? -4 : 4, 1, 1)
        : ob(SLOTS[k].x, ENV_FOOT - 12 - 30 * up, up > 0.02 && place === 0 ? 1 : 0, ok ? -5 * Math.sin(r * 14) * (1 - r) : 22 * clamp01((r - 0.5) / 0.5), 0.3 + 0.7 * up, 0.3 + 0.7 * up);
      return { flap: place === 0 ? Math.min(1, up * 3) : 0, form };
    };
    const env0 = envOf(0, 1);
    const env1 = envOf(1, 2);
    const env2 = envOf(2, 3);

    // ══ GRYTVIKEN: the chart, the pup, the bay slipping past ═══════════════════
    const chartW = nv === BEND ? st(0.12, 0.3) : place === 1 && nv > BEND ? 1 : 0;
    const chartDate = nv === BEND ? st(0.4, 0.58) : place === 1 && nv > BEND ? 1 : 0;
    const bayX = nv === SAIL ? 64 * st(0.4, 1) : 0;
    const pupDown = nv === SAIL && u > 0.66;
    const pupIn = nv === SAIL ? st(0.72, 0.9) : 0;
    const pup = nv !== SAIL ? NONE
      : !pupDown ? ob(cHands.x, cHands.y - 2, cOn, 0, cd < 0 ? -1 : 1, 1)
        : ob(lerp(PUP_KENNEL + 14, PUP_KENNEL, pupIn), 482, 1 - st(0.86, 0.92), 0, -1, 1);

    // ══ THE PACK: the channel, the tools, the chips, the log, the crate, the smoke ══
    const chan = nv === CUT ? 0.55 * st(0.5, 0.86) : nv === CHOP ? 0.55 + 0.45 * st(0.16, 0.36) : nv > CHOP && place === 2 ? 1 : 0;
    const glaze = nv === REFREEZE ? st(0.08, 0.5) : nv > REFREEZE && place === 2 ? 1 : 0;
    // the pick: on the ice, in Crean's hand, handed over, swung, leant on, left standing
    const pickHeldC = nv === CUT && u > 0.08 && u < 0.24;
    const pickHeldS = (nv === CUT && u >= 0.24) || nv === CHOP || (nv === REFREEZE && u < 0.34);
    const pickStand = nv > REFREEZE || (nv === REFREEZE && u >= 0.34);
    const raised = nv === CHOP ? Math.max(st(0.04, 0.08) * (1 - st(0.08, 0.16)), st(0.2, 0.24) * (1 - st(0.24, 0.32))) : 0;
    const pick = place !== 2 ? NONE
      : pickHeldC ? ob(cRw.x, cRw.y, 1, -20, 1, 1)
        : pickHeldS ? ob(nv === CHOP ? sHands.x : sRw.x, nv === CHOP ? sHands.y : sRw.y, 1, nv === CHOP ? -70 * raised : 0, 1, 1)
          : pickStand ? ob(150, 488, 1, 0, 1, 1)
            : ob(PICK0.x, PICK0.y, 1, 90, 1, 1);
    // Crean's saw: standing in the ice, taken up, two strokes, left frozen in
    const sawHeld = (nv === CUT && u > 0.4) || nv === CHOP || nv === REFREEZE || nv === Q2N;
    const sawC = place !== 2 ? NONE : sawHeld ? ob(cHands.x, cHands.y, 1, 0, 1, 1) : ob(SAW_C.x, 458, 1, 0, 1, 1);
    // Worsley's saw: on the ice by the bow, taken up (b14), let drop (b16)
    const wsDrop = nv === REFREEZE ? st(0.24, 0.32) : nv > REFREEZE ? 1 : 0;
    const wsHeld = (nv === CUT && u > 0.16) || nv === CHOP || (nv === REFREEZE && u < 0.24);
    const sawW = place !== 2 ? NONE
      : wsHeld ? ob(wRw.x, wRw.y, 1, 0, 1, 1)
        : wsDrop > 0 && wsDrop < 1 ? ob(SAW_W0.x - 6, lerp(wRw.y, SAW_W0.y, wsDrop), 1, 90 * wsDrop, 1, 1)
          : ob(SAW_W0.x - (wsDrop >= 1 ? 6 : 0), SAW_W0.y, 1, 90, 1, 1);
    // the seaman's chisel, in his hands
    const chisel = ob(eRw.x, eRw.y, place === 2 ? 1 : 0, eSeat > 0.5 ? 60 * eSeat : 0, 1, 1);
    // chips of ice: at a saw stroke, a pick blow, a kick
    const hitAt = (a: number) => {
      'worklet';
      return clamp01((u - a) / 0.12);
    };
    const chips = {
      saw: nv === CUT ? Math.max(hitAt(0.56), hitAt(0.84)) : 0,
      pick: nv === CHOP ? Math.max(hitAt(0.16), hitAt(0.32)) : 0,
      kick: nv === BESET && !pre ? Math.max(hitAt(0.31), hitAt(0.53)) : 0,
    };
    // the crate on the ice: lifted, carried to her side, handed up over the rail
    const crateUp = nv === HOME ? st(0.84, 0.9) : nv > HOME ? 1 : 0;
    const crateCarried = nv === HOME && u > 0.1 && u < 0.86;
    const iceCrate = place !== 2 || crateUp >= 1 ? NONE
      : crateCarried ? ob(cHands.x, cHands.y + 10, 1, 0, 1, 1)
        : crateUp > 0 ? ob(206, 394 - 4 * crateUp, 1 - crateUp, 0, 1, 1) : ob(ICE_CRATE.x, G, 1, 0, 1, 1);
    // the log: shut on the table, open on its slope for the orders (b17), closed (b18)
    const logOpen = nv === Q2N ? 1 : nv === WINTER ? 1 - st(0.14, 0.3) : nv === REFREEZE ? st(0.86, 0.98) : 0;
    const sign = [ans(4, Q2), ans(5, Q2), ans(6, Q2)];
    const strike = [clamp01((sign[0] - 0.55) / 0.3), clamp01((sign[1] - 0.55) / 0.3), 0];
    const smoke = place === 2 && nv >= HOME ? (nv === HOME ? st(0.3, 0.6) : 1) : 0;
    const dusk = nv >= REST && place === 2 ? (nv === REST ? 0.42 * st(0.05, 0.6) : 0.42) : 0;

    return {
      bS, bW, bC, bE, t, spray, snow,
      p0: place === 0 ? 1 : 0, p1: place === 1 ? 1 : 0, p2: place === 2 ? 1 : 0,
      farX, quayX, quayO, bayX,
      crate0, crate2, paper, paperOpen, wireForm, scrawl, tray, rope,
      env0, env1, env2,
      chartW, chartDate, pup,
      chan, glaze, pick, sawC, sawW, chisel, chips, iceCrate,
      logOpen, sign, strike, smoke, dusk,
      q1: carry(cv, 7, n, 0, Q1[n], tr),
      q2: carry(cv, 8, n, 0, Q2[n], tr),
    };
  });

  const DS = useDerivedValue<Bundle>(() => SCENE.value.bS);
  const DW = useDerivedValue<Bundle>(() => SCENE.value.bW);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.bC);
  const DE = useDerivedValue<Bundle>(() => SCENE.value.bE);
  const p0 = useAnimatedStyle(() => ({ opacity: SCENE.value.p0 }));
  const p1 = useAnimatedStyle(() => ({ opacity: SCENE.value.p1 }));
  const p2 = useAnimatedStyle(() => ({ opacity: SCENE.value.p2 }));
  const far = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.farX }] }));
  const quay = useAnimatedStyle(() => ({ opacity: SCENE.value.quayO, transform: [{ translateX: SCENE.value.quayX }] }));
  const bay = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.bayX }] }));

  return (
    <View style={styles.scene}>
      {/* LONDON: the river and the far bank, the quay, her deck and what is on it */}
      <Animated.View style={[styles.layer, p0]} pointerEvents="none">
        <Animated.View style={[styles.layer, far]}><LessonPicture name="endur1-london-far" /></Animated.View>
        <Animated.View style={[styles.layer, quay]}><LessonPicture name="endur1-london-quay" /></Animated.View>
        <LessonPicture name="endur1-london-deck" />
        <Rope S={SCENE} />
        <View style={[styles.at, { left: MAPCASE.x, top: G }]}>
          <View style={styles.shadowCase} />
          <LessonPicture name="endur1-mapcase" />
        </View>
        <View style={[styles.at, { left: SACK.x, top: G }]}>
          <View style={styles.shadowSack} />
          <LessonPicture name="endur1-sack" />
        </View>
        <View style={[styles.at, { left: CASE.x, top: G }]}>
          <View style={styles.shadowLong} />
          <LessonPicture name="endur1-case" />
        </View>
        <Pad S={SCENE} />
        <Rider S={SCENE} k="crate0"><View style={styles.shadowCrate} /><LessonPicture name="endur1-crate" /></Rider>
        <Rider S={SCENE} k="crate2"><LessonPicture name="endur1-crate" /></Rider>
        <Rider S={SCENE} k="tray"><LessonPicture name="endur1-tray" /></Rider>
        <Envelopes S={SCENE} />
      </Animated.View>
      {/* GRYTVIKEN: the bay and the station, her deck, the kennels, the casks */}
      <Animated.View style={[styles.layer, p1]} pointerEvents="none">
        <Animated.View style={[styles.layer, bay]}><LessonPicture name="endur1-gryt" /></Animated.View>
        <LessonPicture name="endur1-gryt-deck" />
        {KENNEL_DOGS.map((x, k) => <Husky key={x} S={SCENE} x={x} k={k} />)}
        <View style={[styles.at, { left: CASK_A.x, top: G }]}>
          <View style={styles.shadowCask} />
          <LessonPicture name="endur1-barrel" />
        </View>
        <Chart S={SCENE} />
        <View style={[styles.at, { left: CASK_B.x, top: G }]}>
          <View style={styles.shadowCask} />
          <View style={styles.keg}><LessonPicture name="endur1-barrel" /></View>
        </View>
      </Animated.View>
      {/* THE PACK: the sky and the pack, the ship held fast, the floe, the channel, the table */}
      <Animated.View style={[styles.layer, p2]} pointerEvents="none">
        <LessonPicture name="endur1-ice-far" />
        <LessonPicture name="endur1-ship" />
        <Smoke S={SCENE} />
        <LessonPicture name="endur1-ice-near" />
        <Channel S={SCENE} />
        <View style={[styles.at, { left: E_CRATE.x, top: G }]}>
          <View style={styles.shadowCrate} />
          <LessonPicture name="endur1-crate" />
        </View>
        <View style={[styles.at, { left: TABLE.x, top: G }]}>
          <View style={styles.shadowTable} />
          <LessonPicture name="endur1-table" />
        </View>
        <Log S={SCENE} />
        <Rider S={SCENE} k="iceCrate"><LessonPicture name="endur1-crate" /></Rider>
        <Rider S={SCENE} k="sawC"><SawArt /></Rider>
        <Chips S={SCENE} />
      </Animated.View>
      <Dusk S={SCENE} />
      {/* extra: seaman */}
      <Stickman D={DE} k={K} role="crowd" wear={[]} garb={SEAMAN.garb?.bands} />
      <Rider S={SCENE} k="chisel"><View style={styles.chiselPole} /><View style={styles.chiselBlade} /></Rider>
      {/* cast: tophat */}
      <Stickman D={DW} k={K} role="second" wear={WORSLEY_HEAD} garb={UNIT2_OUTFITS.captain.garb?.bands} />
      <Rider S={SCENE} k="sawW"><SawArt /></Rider>
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={CREAN_HEAD} garb={UNIT2_OUTFITS.explorer.garb?.bands} />
      <Paper S={SCENE} />
      <Rider S={SCENE} k="pup"><LessonPicture name="endur1-pup" /></Rider>
      {/* cast: plain */}
      <Stickman D={DS} k={K} role="lead" wear={SHACK_HEAD} garb={UNIT2_OUTFITS.shackleton.garb?.bands} />
      <Rider S={SCENE} k="wireForm"><LessonPicture name="endur1-form" /></Rider>
      <Rider S={SCENE} k="pick"><View style={styles.pickHandle} /><View style={styles.pickHead} /></Rider>
      <Forms S={SCENE} />
      {/* the labels and the things to tap */}
      {on(Q1) ? <EnvelopeLabels S={SCENE} /> : null}
      <Veil S={SCENE} k="spray" />
      <Veil S={SCENE} k="snow" />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={WIRE_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={ORDER_Q} k="q2" /> : null}
    </View>
  );
}

// ── a thing that rides a place on the stage ─────────────────────────────────

type Ob = { x: number; y: number; o: number; r: number; sx: number; sy: number };
function Rider({ S, k, children }: { S: SharedValue<any>; k: string; children: ReactNode }) {
  const st = useAnimatedStyle(() => {
    const v: Ob = S.value[k];
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.r}deg` }, { scaleX: v.sx }, { scaleY: v.sy }] };
  });
  return <Animated.View nativeID={`e1-${k}`} style={[styles.rider, st]} pointerEvents="none">{children}</Animated.View>;
}

// ── London ───────────────────────────────────────────────────────────────────

/** The telegram pad on the case, and the pencil marks Shackleton scrawls on it. */
function Pad({ S }: { S: SharedValue<any> }) {
  const marks = useAnimatedStyle(() => ({ opacity: S.value.scrawl > 0.02 ? 1 : 0, transform: [{ scaleX: Math.max(0.05, S.value.scrawl) }] }));
  return (
    <View style={[styles.at, { left: PAD.x, top: PAD.y }]} pointerEvents="none">
      <View style={styles.pad} />
      <Animated.View style={[styles.padMarks, marks]} />
    </View>
  );
}
/** The mooring line from the bitt down to the quay; lifted, thrown off, gone with the quay. */
function Rope({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.rope;
    const len = Math.hypot(v.x1 - v.x0, v.y1 - v.y0);
    const ang = Math.atan2(v.y1 - v.y0, v.x1 - v.x0);
    return { opacity: v.o, transform: [{ translateX: (v.x0 + v.x1) / 2 }, { translateY: (v.y0 + v.y1) / 2 }, { rotate: `${(ang * 180) / Math.PI}deg` }, { scaleX: Math.max(0.02, len / 20) }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.rope} /></Animated.View>;
}
/** Crean's newspaper: folded in his hand, opened wide to its black headline. */
function Paper({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v: Ob = S.value.paper;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { scaleX: v.sx }, { scaleY: v.sy }] };
  });
  const head = useAnimatedStyle(() => ({ opacity: S.value.paperOpen }));
  return (
    <Animated.View nativeID="e1-paper" style={[styles.rider, st]} pointerEvents="none">
      <View style={styles.paper} />
      <Animated.View style={[styles.rider, head]}>
        <View style={styles.paperHead} />
        <View style={[styles.paperCol, { left: -17, top: -1 }]} />
        <View style={[styles.paperCol, { left: 2, top: -1 }]} />
        <View style={[styles.paperCol, { left: -17, top: 5 }]} />
        <View style={[styles.paperCol, { left: 2, top: 5 }]} />
      </Animated.View>
    </Animated.View>
  );
}
/** The three telegram envelopes riding the tray, each with its flap torn open when read. */
function Envelopes({ S }: { S: SharedValue<any> }) {
  return <>{SLOTS.map((s, k) => <Envelope key={s.id} S={S} k={k} />)}</>;
}
function Envelope({ S, k }: { S: SharedValue<any>; k: number }) {
  const key = k === 0 ? 'env0' : k === 1 ? 'env1' : 'env2';
  const show = useAnimatedStyle(() => {
    const tr: Ob = S.value.tray;
    return { opacity: tr.o, transform: [{ translateX: SLOTS[k].x - CASE.x + tr.x }, { translateY: tr.y - 4 }] };
  });
  const flap = useAnimatedStyle(() => ({ opacity: S.value[key].flap }));
  return (
    <Animated.View nativeID={`e1-env-${SLOTS[k].id}`} style={[styles.rider, show]} pointerEvents="none">
      <LessonPicture name="endur1-envelope" />
      <Animated.View style={[styles.envOpen, flap]} />
    </Animated.View>
  );
}
/** The forms that come out of the envelopes: risen, wilting, or held up by Shackleton. */
function Forms({ S }: { S: SharedValue<any> }) {
  return <>{SLOTS.map((s, k) => <Form key={s.id} S={S} k={k} />)}</>;
}
function Form({ S, k }: { S: SharedValue<any>; k: number }) {
  const key = k === 0 ? 'env0' : k === 1 ? 'env1' : 'env2';
  const st = useAnimatedStyle(() => {
    const v: Ob = S.value[key].form;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.r}deg` }, { scaleX: v.sx }, { scaleY: v.sy }] };
  });
  return (
    <Animated.View nativeID={`e1-form-${SLOTS[k].id}`} style={[styles.rider, st]} pointerEvents="none">
      <LessonPicture name="endur1-form" />
      <Text style={styles.formText}>{SLOTS[k].label}</Text>
    </Animated.View>
  );
}
/** The envelopes' printed labels: what each one says, so the reader can call it. */
function EnvelopeLabels({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 * S.value.p0 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="none">
      {SLOTS.map((s) => (
        <View key={s.id} style={[styles.envLabel, { left: s.x - 23, top: ENV_FOOT - 23 }]}>
          <Text style={styles.envText}>{s.label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}

// ── Grytviken ────────────────────────────────────────────────────────────────

/** A husky looking out of its kennel door, its head lifting and turning at its own moment. */
function Husky({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const st = useAnimatedStyle(() => {
    const t = S.value.t;
    const look = Math.max(0, Math.sin(t * (0.5 + 0.13 * k) + k * 1.9));
    return { transform: [{ translateX: x }, { translateY: 484 - 1.6 * look }, { scaleX: Math.sin(t * 0.21 + k * 2) > 0 ? 1 : -1 }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><LessonPicture name="endur1-husky" /></Animated.View>;
}
/** The chart on the cask, unrolled upward and held open, the new date pencilled on it. */
function Chart({ S }: { S: SharedValue<any> }) {
  const sheet = useAnimatedStyle(() => ({ opacity: S.value.chartW > 0.02 ? 1 : 0, transform: [{ scaleY: Math.max(0.05, S.value.chartW) }] }));
  const date = useAnimatedStyle(() => ({ opacity: S.value.chartDate }));
  return (
    <Animated.View nativeID="e1-chart" style={[styles.chart, sheet]} pointerEvents="none">
      <View style={styles.chartSea} />
      <View style={styles.chartLand} />
      <View style={styles.chartIsle} />
      <Animated.View style={[styles.chartDate, date]}>
        <Text style={styles.chartText}>5 DEC</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ── the pack ─────────────────────────────────────────────────────────────────

/** The channel cut ahead of her bow: black water, growing as they cut; glazing white. */
function Channel({ S }: { S: SharedValue<any> }) {
  const water = useAnimatedStyle(() => ({ opacity: S.value.chan > 0.01 ? 1 : 0, transform: [{ scaleX: Math.max(0.01, S.value.chan) }] }));
  const glaze = useAnimatedStyle(() => ({ opacity: S.value.glaze, transform: [{ scaleX: Math.max(0.01, S.value.chan) }] }));
  return (
    <>
      <Animated.View nativeID="e1-channel" style={[styles.channel, water]} pointerEvents="none" />
      <Animated.View style={[styles.channelGlaze, glaze]} pointerEvents="none" />
    </>
  );
}
/** An ice saw: a long blade under a cross handle (its own frame: the handle at 0). */
function SawArt() {
  return (
    <>
      <View style={styles.sawBlade} />
      <View style={styles.sawTeeth} />
      <View style={styles.sawHandle} />
    </>
  );
}
/** Ice chips thrown up where a saw, a pick or a boot strikes. */
const CHIP = [[-8, 18], [-3, 26], [3, 22], [8, 16], [-11, 10], [6, 30]] as const;
const CHIP_AT = { saw: SAW_C.x - 4, pick: 154, kick: 192 } as const;
function Chips({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {CHIP.map(([dx, h], k) => <Chip key={`s${k}`} S={S} dx={dx} h={h} kind="saw" />)}
      {CHIP.map(([dx, h], k) => <Chip key={`p${k}`} S={S} dx={dx} h={h} kind="pick" />)}
      {CHIP.map(([dx, h], k) => <Chip key={`k${k}`} S={S} dx={dx * 0.7} h={h * 0.5} kind="kick" />)}
    </>
  );
}
function Chip({ S, dx, h, kind }: { S: SharedValue<any>; dx: number; h: number; kind: 'saw' | 'pick' | 'kick' }) {
  const x0 = CHIP_AT[kind];
  const st = useAnimatedStyle(() => {
    const f = S.value.chips[kind] as number;
    const arc = Math.sin(Math.PI * f);
    return {
      opacity: f > 0 && f < 1 ? 1 : 0,
      transform: [{ translateX: x0 + dx * (0.3 + 0.7 * f) }, { translateY: 488 - h * arc }, { rotate: `${f * 300 + dx * 10}deg` }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.chip} /></Animated.View>;
}
/** Stove smoke from the stovepipe, once she is a home. */
function Smoke({ S }: { S: SharedValue<any> }) {
  return <>{[0, 1, 2, 3].map((k) => <Puff key={k} S={S} k={k} />)}</>;
}
function Puff({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const ph = (S.value.t * 0.28 + k / 4) % 1;
    return {
      opacity: S.value.smoke * 0.85 * Math.sin(Math.PI * ph),
      transform: [{ translateX: STOVE.x + 4 * Math.sin(ph * 5 + k) - 14 * ph }, { translateY: STOVE.y - 4 - 54 * ph }, { scale: 0.5 + 1.3 * ph }],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.puff} /></Animated.View>;
}
/** The ship's log on its writing slope on the table: three orders, one signed. */
function Log({ S }: { S: SharedValue<any> }) {
  const open = useAnimatedStyle(() => ({ opacity: S.value.logOpen > 0.02 ? 1 : 0, transform: [{ translateX: TABLE.x }, { translateY: TABLE.top }, { scaleX: Math.max(0.04, S.value.logOpen) }] }));
  const shut = useAnimatedStyle(() => ({ opacity: S.value.p2 * (S.value.logOpen > 0.02 ? 0 : 1) }));
  return (
    <>
      <Animated.View style={[styles.logShut, shut]} pointerEvents="none" />
      <Animated.View nativeID="e1-log" style={[styles.rider, open]} pointerEvents="none">
        <LessonPicture name="endur1-log" />
        <Text style={styles.logDate}>24 FEB. 1915</Text>
        {ROWS.map((r, k) => (
          <View key={r.id} style={styles.rider}>
            <Text style={[styles.logRow, { top: r.y - TABLE.top + 1 }]}>{r.label}</Text>
            <Signature S={S} k={k} y={r.y - TABLE.top + 14} />
          </View>
        ))}
      </Animated.View>
    </>
  );
}
/** Shackleton's signature inked under an order — struck through in red if it is the wrong one. */
function Signature({ S, k, y }: { S: SharedValue<any>; k: number; y: number }) {
  const ink = useAnimatedStyle(() => ({ opacity: S.value.sign[k] > 0.02 ? 1 : 0, transform: [{ scaleX: Math.max(0.05, clamp01(S.value.sign[k] * 1.8)) }] }));
  const red = useAnimatedStyle(() => ({ opacity: S.value.strike[k] > 0.02 ? 1 : 0, transform: [{ scaleX: Math.max(0.05, S.value.strike[k]) }] }));
  return (
    <>
      <Animated.View style={[styles.sign, { top: y }, ink]}>
        <View style={[styles.signStroke, { left: 0, top: 0, width: 14, transform: [{ rotate: '-14deg' }] }]} />
        <View style={[styles.signStroke, { left: 12, top: -1, width: 10, transform: [{ rotate: '22deg' }] }]} />
        <View style={[styles.signStroke, { left: 20, top: 0, width: 18, transform: [{ rotate: '-8deg' }] }]} />
        <View style={[styles.signStroke, { left: 36, top: 1, width: 12, transform: [{ rotate: '12deg' }] }]} />
      </Animated.View>
      <Animated.View style={[styles.strike, { top: y - 7 }, red]} />
    </>
  );
}
/** The polar dusk over the pack, and the lamplight in her portholes. */
function Dusk({ S }: { S: SharedValue<any> }) {
  const dark = useAnimatedStyle(() => ({ opacity: S.value.dusk }));
  const lamp = useAnimatedStyle(() => ({ opacity: clamp01(S.value.dusk * 2.4) }));
  return (
    <>
      <Animated.View style={[styles.dusk, dark]} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, lamp]} pointerEvents="none">
        {PORTS.map(([x, y]) => <View key={x} style={[styles.lamp, { left: x - 2.6, top: y - 2.6 }]} />)}
      </Animated.View>
    </>
  );
}
/** The veils: sea spray into Grytviken, and a whiteout into the pack. */
function Veil({ S, k }: { S: SharedValue<any>; k: 'spray' | 'snow' }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return <Animated.View style={[k === 'spray' ? styles.spray : styles.snow, st]} pointerEvents="none" />;
}

// ── the two games ────────────────────────────────────────────────────────────

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/**
 * OPEN THE WIRE: which telegram comes back? Each box covers its envelope and reaches up
 * over it, so the verdict seal (struck at the box's top-right) lands in the air above the
 * form that rises out of it, never on the form's words.
 */
const WIRE_Q: Q[] = SLOTS.map((s) => ({ id: s.id, left: s.x - 24, top: 372, w: 48, h: 96, r: 5, correct: s.id === 'proceed' }));
/** WRITE THE ORDERS: one row of the log each; the seal lands in the page's right margin. */
const ORDER_Q: Q[] = ROWS.map((r) => ({ id: r.id, left: ROW_X - 6, top: r.y, w: 104, h: 20, r: 3, correct: r.id === 'winter' }));
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} nativeID={`e1-q-${q.id}`} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
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
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  at: { position: 'absolute', width: 0, height: 0 },
  keg: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, transform: [{ scale: 0.7 }] },
  shadowCase: { position: 'absolute', left: -28, top: -1.8, width: 56, height: 3.6, borderRadius: 1.8, backgroundColor: SHADE, opacity: 0.45 },
  shadowSack: { position: 'absolute', left: -16, top: -1.6, width: 32, height: 3.2, borderRadius: 1.6, backgroundColor: SHADE, opacity: 0.4 },
  shadowLong: { position: 'absolute', left: -79, top: -1.8, width: 158, height: 3.6, borderRadius: 1.8, backgroundColor: SHADE, opacity: 0.45 },
  shadowCrate: { position: 'absolute', left: -15, top: -1.6, width: 30, height: 3.2, borderRadius: 1.6, backgroundColor: SHADE, opacity: 0.4 },
  shadowCask: { position: 'absolute', left: -15, top: -1.8, width: 30, height: 3.6, borderRadius: 1.8, backgroundColor: SHADE, opacity: 0.45 },
  shadowTable: { position: 'absolute', left: -56, top: -1.8, width: 112, height: 3.6, borderRadius: 1.8, backgroundColor: SHADE, opacity: 0.4 },
  spray: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.endur1Haze.base },
  snow: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.endur1Snow.base },
  dusk: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: W.endur1Dusk.base },
  lamp: { position: 'absolute', width: 5.2, height: 5.2, borderRadius: 2.6, backgroundColor: W.endur1Lamp.base },
  pad: { position: 'absolute', left: -9, top: -3, width: 18, height: 3, borderRadius: 0.6, backgroundColor: W.endur1Paper.base, borderWidth: 0.5, borderColor: INK },
  padMarks: { position: 'absolute', left: -7, top: -2.2, width: 12, height: 0.8, backgroundColor: W.endur1Ink.base, transformOrigin: '0% 50%' },
  rope: { position: 'absolute', left: -10, top: -0.9, width: 20, height: 1.8, borderRadius: 0.9, backgroundColor: W.endur1Rope.base },
  paper: { position: 'absolute', left: -20, top: -13, width: 40, height: 26, borderRadius: 1, backgroundColor: W.endur1Paper.base, borderWidth: 0.7, borderColor: INK },
  paperHead: { position: 'absolute', left: -17, top: -10, width: 34, height: 6, backgroundColor: W.endur1Headline.base },
  paperCol: { position: 'absolute', width: 15, height: 3, backgroundColor: W.endur1Paper.shade },
  envOpen: { position: 'absolute', left: -20, top: -28, width: 40, height: 4, borderRadius: 1, backgroundColor: W.endur1Paper.shade, borderWidth: 0.5, borderColor: INK },
  envLabel: { position: 'absolute', width: 46, height: 20, alignItems: 'center', justifyContent: 'center' },
  envText: { width: 46, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, textAlign: 'center', includeFontPadding: false },
  formText: { position: 'absolute', left: -24, top: -6, width: 48, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, textAlign: 'center', includeFontPadding: false },
  chart: { position: 'absolute', left: CASK_A.x - 18, top: 444, width: 36, height: 24, borderRadius: 1, backgroundColor: W.endur1Chart.base, borderWidth: 0.7, borderColor: INK, transformOrigin: '50% 100%' },
  chartSea: { position: 'absolute', left: 2, top: 2, width: 31, height: 9, backgroundColor: W.endur1Chart.shade },
  chartLand: { position: 'absolute', left: 6, top: 4, width: 11, height: 5, borderRadius: 2.5, backgroundColor: W.endur1Paper.base },
  chartIsle: { position: 'absolute', left: 22, top: 6, width: 5, height: 3, borderRadius: 1.5, backgroundColor: W.endur1Paper.base },
  chartDate: { position: 'absolute', left: 0, top: 11, width: 34, height: 12, alignItems: 'center', justifyContent: 'center' },
  chartText: { width: 34, fontFamily: 'Caveat_700Bold', fontSize: 11, lineHeight: 12, color: W.endur1Ink.base, textAlign: 'center', includeFontPadding: false },
  channel: { position: 'absolute', left: 0, top: CHANNEL.y, width: CHANNEL.x1, height: CHANNEL.h, borderRadius: 3, backgroundColor: W.endur1Water.base, borderTopWidth: 1.4, borderColor: W.endur1Water.shade, transformOrigin: '100% 50%' },
  channelGlaze: { position: 'absolute', left: 0, top: CHANNEL.y, width: CHANNEL.x1, height: CHANNEL.h, borderRadius: 3, backgroundColor: W.endur1Ice.base, borderWidth: 0.6, borderColor: W.endur1Ice.shade, transformOrigin: '100% 50%' },
  sawHandle: { position: 'absolute', left: -9, top: -2, width: 18, height: 4, borderRadius: 2, backgroundColor: W.endur1Wood.base, borderWidth: 0.6, borderColor: INK },
  sawBlade: { position: 'absolute', left: -2.4, top: 1, width: 4.8, height: 40, backgroundColor: W.endur1Iron.base, borderWidth: 0.6, borderColor: INK },
  sawTeeth: { position: 'absolute', left: 1.6, top: 6, width: 1.4, height: 34, backgroundColor: W.endur1Iron.shade },
  pickHandle: { position: 'absolute', left: -1.6, top: -26, width: 3.2, height: 34, borderRadius: 1.6, backgroundColor: W.endur1Wood.base, borderWidth: 0.6, borderColor: INK },
  pickHead: { position: 'absolute', left: -11, top: -29, width: 22, height: 4, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: W.endur1Iron.base, borderWidth: 0.6, borderColor: INK },
  chiselPole: { position: 'absolute', left: -1.4, top: -30, width: 2.8, height: 62, borderRadius: 1.4, backgroundColor: W.endur1Wood.base, borderWidth: 0.5, borderColor: INK },
  chiselBlade: { position: 'absolute', left: -2.4, top: 30, width: 4.8, height: 7, borderBottomLeftRadius: 1, borderBottomRightRadius: 1, backgroundColor: W.endur1Iron.base, borderWidth: 0.5, borderColor: INK },
  chip: { position: 'absolute', left: -1.6, top: -1.6, width: 3.2, height: 3.2, borderRadius: 0.8, backgroundColor: W.endur1Chip.base, borderWidth: 0.4, borderColor: W.endur1Chip.shade },
  puff: { position: 'absolute', left: -6, top: -5, width: 12, height: 10, borderRadius: 5, backgroundColor: W.endur1Smoke.base },
  logShut: { position: 'absolute', left: TABLE.x - 30, top: TABLE.top - 5, width: 60, height: 5, borderRadius: 1, backgroundColor: W.endur1Wood.shade, borderWidth: 0.6, borderColor: INK },
  logDate: { position: 'absolute', left: -44, top: -76, width: 90, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: W.endur1Red.shade, includeFontPadding: false },
  logRow: { position: 'absolute', left: ROW_X - TABLE.x, width: 96, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false },
  sign: { position: 'absolute', left: ROW_X - TABLE.x + 4, width: 52, height: 3, transformOrigin: '0% 50%' },
  signStroke: { position: 'absolute', height: 1.3, borderRadius: 0.65, backgroundColor: W.endur1Ink.base },
  strike: { position: 'absolute', left: ROW_X - TABLE.x - 2, width: 88, height: 1.6, borderRadius: 0.8, backgroundColor: W.endur1Red.base, transformOrigin: '0% 50%' },
  clear: { flexGrow: 1 },
});

// OWN CAMERA: targets checked in shot 2026-10-09 — OPEN THE WIRE (the three envelopes in the telegraph
// boy's tray on the sledging case, their labels whole, the form rising PROCEED or drooping RETURN TO PORT /
// JOIN THE FLEET) and WRITE THE ORDERS (the log's three rows on its slope, the signature inked under WINTER
// STATION or struck through in red) read whole, answered right and wrong, on the endur1final / endur1wrong /
// endur1ice sheets.
export function Endur1Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson} beats={BEATS} Scene={Endur1Scene} band={[214, 514]}
      roles={{
        plain: { head: SHACK_HEAD, label: 'Shackleton' },
        tophat: { head: WORSLEY_HEAD, label: 'Worsley' },
        cap: { head: CREAN_HEAD, label: 'Tom Crean' },
      }}
    />
  );
}
