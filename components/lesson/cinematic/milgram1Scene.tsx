import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import LessonPicture from './LessonPicture';
import { BEATS } from './milgram1Script';
import {
  U, WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs, seated,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { lipOf } from './stageSkin';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { NATURAL } from './objects';
import { UNIT2_OUTFITS, trousers, coat, sleeves, shirtAndTie, WEAR } from './garb';

// ─────────────────────────────────────────────────────────────────────────────
// psychology-milgram-1, "The Memory Study That Wasn't" — the first lesson of Psychology's
// second unit (LESSON_RULES group AW): Stanley Milgram's obedience study at Yale, 1961, told
// in costume. THE PLAIN ONE IS MILGRAM, in a charcoal suit (a clipboard in the lab); the top
// hat plays the experimenter, John Williams (shirt sleeves in the office, then the grey lab
// coat Milgram throws him); the cap is the volunteer, the teacher, in a tweed jacket.
//
// A DIALOGUE lesson (group AP): people talk and nobody narrates.
// AT2: silent extras: Mr Wallace, the learner, an accountant hired to act (cardigan). He
// waits on a chair, gets up to say hello, draws a slip, and is strapped into the chair in
// the next room — smiling, because he is acting and nothing can hurt him. He is never shown
// hurt (AW4): his wire ends in a loose plug on the laboratory floor.
//
// THE PLACES are FULL SETTINGS in layers, baked pictures (scripts/lib/lessonart/lessons/
// milgram1.mjs) laid in ONE WORLD: Milgram's office at x 0–400, and the Interaction
// Laboratory at x 400–1230 drawn as a CUTAWAY of three rooms: the learner's room (400–620),
// a wall with a doorway (620–632), the laboratory (632–1040), a wall with the one-way mirror
// in it at face height (1040–1052), and the observation booth (1052–1230). The scene's own
// camera is the world's translation, `cam`: the office (0), the lab (−630), the learner's
// room (−400) and the generator with the booth (−810), each change a cut under a quick veil.
// Figures are posed in SCREEN space (world x + cam).
//
//   OFFICE, far → near: plaster over oak wainscot; a slate board (46–98 × 364–424), the coat
//   hook (30, 370) with the grey lab coat on it, the corkboard (117–165 × 361–411), the
//   Gothic window (178–254) with Yale's quad in October behind the leading, a clock (330,
//   284), the filing cabinet (292–334, top 456), the door (350–400); Milgram's chair (seat
//   474, at 112) and the pedestal desk (146–256, top 460) with a lamp, a telephone and a
//   typewriter.
//   LAB: the learner's armchair (480–530, seat 470, arms 452) and its wire, out through the
//   doorway along the floor to a loose plug at 826; the entrance door (646–682); the hat
//   table (686–806, top 462); the steel table (846–992, top 466) with THE SHOCK GENERATOR
//   (860–984 × 426–466; switch k at 866 + (k−1)·3.86, lamps at 449), its microphone and the
//   learner's answer box on top; a chair by the mirror (1002–1036); the booth's desk and its
//   tape recorder, the reels turning.
//
//   b0  the slow open: Milgram in his chair reading the Register while leaves fall past the
//       window; he turns a page (paper 1.0s), another (paper 3.2s), leans back (creak
//       4.6s); then his line, the paper lowered to his lap, a shake of the head.
//   b1  the experimenter walks in from the corridor with a mug of coffee and sets it on the
//       desk (mug 3.4s); he folds his arms; Milgram waves the paper at him.
//   b2  Milgram drops the paper on the desk, gets up, and chalks ORDINARY / MAN? / ORDERS?
//       on the board (chalk 1.9s).  b3  the experimenter goes and leans on the cabinet;
//       Milgram turns to him.
//   b4  Milgram pins the advert to the corkboard (pin 1.6s), walks to the hook, takes the
//       grey coat down and throws it across the room onto the experimenter's shoulder.
//   b5  the experimenter wearing it, shrugging into it, buttoning it, scowling.
//   b6  the cut to the lab: the volunteer comes in through the door turning his hat in his
//       hands; Mr Wallace gets up off his chair by the mirror (chair 1.2s) and comes over.
//   b7  the experimenter counts four dollars and two quarters into the volunteer's palm
//       (paper 0.4s, coin 1.4s, 1.9s) and holds out his hat with the slips; Wallace waves.
//   b8  Q1 RIG THE HAT.  b9  the volunteer draws (paper 0.45s), reads TEACHER, beams; the
//       experimenter turns the hat to Wallace, who draws and droops.
//   b10 the cut to the learner's room: the experimenter dabs paste on Wallace's wrist,
//       buckles the strap (tape 2.8s); Wallace smiles, shifts in the chair (chair 4.4s);
//       the volunteer winces in the doorway.
//   b11 the cut to the booth: Milgram behind the glass taps his clipboard (pencil 1.0s)
//       and points down at the plug lying loose on the lab floor.
//   b12 the experimenter pulls the cover off the generator (paper 0.8s) and sweeps a hand
//       along its thirty switches.  b13 the volunteer runs a finger along the labels to XXX.
//   b14 the experimenter comes round, straps an electrode to the volunteer's wrist, presses
//       the third switch (chalktap 3.3s): the lamp blinks and the hand jerks back.
//   b15 the volunteer rubs his wrist and reads the card into the microphone (paper 1.3s).
//   b16 the answer box lights LAMP; the experimenter points at it, then at the first switch.
//   b17 the volunteer says the voltage and flips the first switch (chalktap 1.4s).
//   b18 Milgram writes, tears off a note and sticks it to the glass: 1 IN 1,000 (pencil).
//   b19 Q2 CALL THE SWITCH.  b20 the lights go down on the generator.  b21 at rest.
//
// Every figure has its own phase (N22), faces whom he talks to, never walks backwards
// (C18), and every hand that moves holds, turns, pins, throws, counts, buckles or flips.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('psychology');
const W = NATURAL;
const { SHADE } = TONE;
const TR = 0.85;
const K = K_FIG * 0.95;
/** The hand paths are laid out for a figure 0.85 high; they grow with him. */
const KS = K / 0.85;
const G = GROUND;

/** Seconds each beat's action is paced over (lib/narration/manifest.ts); b0 is the wait (6.0s) and the line together. */
const LINES = [12.75, 4.97, 6.41, 3.88, 6.12, 4.86, 4.97, 4.5, 0, 3.63, 6.16, 5.69, 5.8, 5.61, 5.05, 5.81, 4.51, 4.02, 6.64, 0, 0, 0];

const TALK = 167;
const NOD = 263;

const ACT: string[] = BEATS.map((b) => b.act ?? '');
const at = (a: string) => ACT.indexOf(a);
const PAPER = at('paper');
const ENTER = at('enter');
const QUESTION = at('question');
const HOW = at('how');
const ADVERT = at('advert');
const COAT = at('coat');
const ARRIVE = at('arrive');
const PAY = at('pay');
const SLIP = at('slip');
const STRAP = at('strap');
const MIRROR = at('mirror');
const MACHINE = at('machine');
const LABELS = at('labels');
const SAMPLE = at('sample');
const TEST = at('test');
const LIGHT = at('light');
const FIRST = at('first');
const GUESS = at('guess');
const REST = at('rest');
const Q1 = BEATS.map((b) => (b.slips ? 1 : 0));
const Q2 = BEATS.map((b) => (b.call ? 1 : 0));
const Q1N = Q1.indexOf(1);
const Q2N = Q2.indexOf(1);
/** Who speaks each beat, as a number the worklet can read: 1 Milgram, 2 the experimenter, 3 the volunteer. */
const SPK = BEATS.map((b) => (b.speaker === 'plain' ? 1 : b.speaker === 'tophat' ? 2 : b.speaker === 'cap' ? 3 : 0));
/** The camera (the world's translation) on each beat: the office, the lab, the learner's room, the generator. */
const CAM = BEATS.map((_, n) => (n < ARRIVE ? 0 : n < STRAP ? -640 : n === STRAP ? -400 : -810));
/** Seconds into a cut at which the world is swapped, under the veil. */
const CUT_S = 0.4;

const per = <T,>(f: (n: number) => T) => BEATS.map((_, n) => f(n));
// ── where everybody is at the START of each beat (WORLD x) ─────────────────
/** Milgram: in his chair (118), at the board (106), at the hook (46); in the booth (1110, then at the glass 1076). */
const M_X = per((n) => (n <= QUESTION ? 118 : n <= ADVERT ? 106 : n === COAT ? 46 : n <= GUESS ? 1110 : 1076));
const M_D = per((n) => (n <= QUESTION ? 1 : n === HOW ? -1 : n <= COAT ? 1 : -1));
const M_SEAT = per((n) => (n <= QUESTION ? 1 : 0));
/** The experimenter: the corridor (440), by the desk (268), at the cabinet (300); the lab (836), the learner's room (556), by the generator (1016). */
const E_X = per((n) => (n <= ENTER ? 440 : n <= HOW ? 268 : n <= COAT ? 300 : n < STRAP ? 836 : n === STRAP ? 556 : n === TEST ? 896 : 1016));
const E_D = per(() => -1);
/** The volunteer: at the lab door (664), by the experimenter (780), in the doorway (668), at the generator (846). */
const V_X = per((n) => (n <= ARRIVE ? 664 : n < STRAP ? 780 : n === STRAP ? 668 : 846));
const V_D = per((n) => (n === STRAP ? -1 : 1));
/** Mr Wallace: on the chair by the mirror (1012), beside the experimenter (892), in the learner's chair (502). */
const L_X = per((n) => (n <= PAY ? 1012 : n < STRAP ? 892 : 502));
// ── and where each beat takes them, and when it sets off (a share of the line) ──
// A beat walks from wherever the last one left him — a reader may tap before a walk
// is done — so the walk is from the carried place to the beat's own END.
const M_END = per((n) => (n <= ENTER ? 118 : n <= HOW ? 106 : n <= COAT ? 46 : n < GUESS ? 1110 : 1076));
const M_WS = per((n) => (n === QUESTION ? 0.27 : n === ADVERT || n === GUESS ? 0.4 : 0.02));
const E_END = per((n) => (n === PAPER ? 440 : n <= QUESTION ? 268 : n <= COAT ? 300 : n < STRAP ? 836 : n === STRAP ? 556 : n === SAMPLE ? 896 : 1016));
const E_WS = per((n) => (n === ENTER ? 0.01 : n === HOW ? 0.12 : n === TEST ? 0.08 : 0.02));
const V_END = per((n) => (n < ARRIVE ? 664 : n < STRAP ? 780 : n === STRAP ? 668 : 846));
const V_WS = per((n) => (n === ARRIVE ? 0.12 : 0.02));
const L_END = per((n) => (n <= ARRIVE ? 1012 : n < STRAP ? 892 : 502));
const L_WS = per((n) => (n === PAY ? 0.5 : 0.02));

// ── the office ──────────────────────────────────────────────────────────────
const SEAT_M = 26 / K;      // Milgram's chair seat, rig units
const BOARD = { x: 72, y: [377, 390, 403] };
const HOOK = { x: 30, y: 374 };
const ADV = { x: 141, y: 386 };
const DESK_PAPER = { x: 186, y: 459 };
const MUG = { x: 238, y: 460 };
const CLOCK_O = { x: 330, y: 284 };
// ── the lab ─────────────────────────────────────────────────────────────────
const SEAT_LAB = 26 / K;    // the chair by the mirror
const SEAT_L = 30 / K;      // the learner's chair
const SW = (k: number) => 866 + (k - 1) * (112 / 29);
const SW_Y = 457;
const LAMP_Y = 449;
const ANSWER = [930, 945, 960, 975];
const ANSWER_WORDS = ['SKY', 'INK', 'BOX', 'LAMP'];
/** Each answer's slot on the word plate, wide enough for its word (and two units either side). */
const WORD_W = [24, 21, 25, 31];
const PLUG = { x: 826, y: 498 };
const NOTE = { x: 1046, y: 377 };
const CLOCK_L = { x: 800, y: 300 };
const REELS = [1172, 1198];
/** The three pairs of slips on the hat table (Q1). */
const PAIRS = [
  { id: 'tt', x: 698, a: 'TEACHER', b: 'TEACHER' },
  { id: 'tl', x: 750, a: 'TEACHER', b: 'LEARNER' },
  { id: 'll', x: 802, a: 'LEARNER', b: 'LEARNER' },
] as const;
/** The three switches the reader may call (Q2). */
const CALLS = [
  { id: 'v150', k: 10, label: '150 V' },
  { id: 'v300', k: 20, label: '300 V' },
  { id: 'v450', k: 30, label: '450 V' },
] as const;
/** The group under each label, as the volunteer's finger runs along them (b13). */
const GROUPS = ['SLIGHT SHOCK', 'MODERATE SHOCK', 'STRONG SHOCK', 'VERY STRONG SHOCK', 'INTENSE SHOCK', 'EXTREME INTENSITY', 'DANGER: SEVERE SHOCK', 'XXX'];

// ── costumes ────────────────────────────────────────────────────────────────
const MILGRAM = UNIT2_OUTFITS.milgram;
/** Milgram in his office: the suit, no clipboard yet. */
const MILGRAM_DESK_HEAD = MILGRAM.head.filter((p) => p.at === 'head');
/** Milgram in the booth: the clipboard in his left hand. */
const MILGRAM_HEAD = MILGRAM.head;
/** The experimenter before Milgram throws him the coat: shirt sleeves and a dark tie. */
const SHIRT_SLEEVES = [...trousers(WEAR.trouserDark), ...coat(WEAR.shirtWhite, 'hip'), ...sleeves(WEAR.shirtWhite), ...shirtAndTie(WEAR.shirtWhite, WEAR.peak)];
const EXPERIMENTER_HEAD = UNIT2_OUTFITS.experimenter.head;
const VOLUNTEER_HEAD = UNIT2_OUTFITS.volunteer.head;
const LEARNER_HEAD = UNIT2_OUTFITS.learner.head;

/** The reader's pick, as a number the worklet can read. */
const PICK: Record<string, number> = { tt: 1, tl: 2, ll: 3, v150: 4, v300: 5, v450: 6 };

/** Seconds into beat 0 as a share of its span. */
function S0(sec: number): number {
  'worklet';
  return sec / 12.75;
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
/** A hand to a point on the stage (screen units). */
function handAt(s: Stance, x: number, g: number, d: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0.001 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: d < 0 ? -1 : 1 }, which, tx, ty, w);
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
/** A walk from `src` to `to` that starts `start` seconds in — later if he must turn first (C18). */
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
/** Which way a figure faces at time `b`: the scripted turns, eased through a profile — a walk wins. */
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
function jointOf(w: Bundle, k: 'wrR' | 'wrL' | 'shRd') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/** A seated figure on a seat `h` rig units high, still, feet out by `reach`. */
function seatOf(h: number, reach: number): Stance {
  'worklet';
  return seated(h, 0, reach);
}
/** Standing ↔ seated, rising and sitting the way a body does (hands to the knees). */
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
/** Arms folded across the chest. */
function folded(s: Stance, x: number, g: number, d: number, w: number): Stance {
  'worklet';
  const r = hand(s, x, g, d, 1, 6, 58, w);
  return hand(r, x, g, d, -1, 9, 56, w);
}

export default function Milgram1Scene({ clock, bt, bi, i, qv, picked, onPick }: SceneApi) {
  const heldM = useHeld();
  const heldE = useHeld();
  const heldV = useHeld();
  const heldL = useHeld();
  const cv = useCarry(16);
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
    const cutBeat = n === ARRIVE || n === STRAP || n === MIRROR;
    // before the cut, the old place holds as the last beat left it
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
    const cam = CAM[nv];
    const cut = cutBeat && !back ? stage(b0, 1, 0.06, CUT_S) * (1 - stage(b0, 1, CUT_S, CUT_S + 0.55)) : 0;
    const backVeil = back ? 1 - stage(b0, 1, 0, 0.45) : 0;
    const veil = Math.max(cut, backVeil);
    const fresh = back || (cutBeat && !pre);
    const src = (slot: number, table: readonly number[]) => {
      'worklet';
      if (fresh) return table[nv];
      const c = carrySource(cv, slot, n, table[nv]);
      // a reader who taps through a cut before it lands carries a place from the other
      // room: no walk in this lesson is that long, so start where the beat starts
      return Math.abs(c - table[nv]) > 200 ? table[nv] : c;
    };
    const sp = (who: number) => {
      'worklet';
      return SPK[nv] === who;
    };

    // ══ MILGRAM ══════════════════════════════════════════════════════════════
    const mxs = src(1, M_X);
    const mds = src(2, M_D);
    let mw: Walk = STILL;
    let mx = mxs;
    let mTurns: (readonly number[])[] = [[0, M_D[nv]]];
    let mSeat = M_SEAT[nv];
    mw = walkOf(mxs, M_END[nv], M_WS[nv] * L, mds, b);
    if (nv === QUESTION) {
      mSeat = 1 - st(0.12, 0.26);
      mTurns = [[0, 1], [0.92, 1]];
    }
    if (nv === HOW) mTurns = [[0, -1], [0.1, 1]];
    if (nv === ADVERT) mTurns = [[0, 1], [0.72, 1]];
    if (mw.wd !== 0) mx = mw.x;
    const mxS = carry(cv, 1, n, mx, mx, 1) + cam;
    const md = carry(cv, 2, n, 0, faceOf(mds, mTurns, b, L, mw), 1);
    const mCode = sp(1) ? TALK : NOD;
    let sm0 = bodyOf(mw, mCode, t, b, 0);
    let mR: readonly Key[] | null = null;
    let mL: readonly Key[] | null = null;
    let mLean = 0;
    let mNeck = 0;
    // the lab: the clipboard held in front of the chest, a pencil in the other hand
    if (nv >= ARRIVE) {
      mL = [[0, 12, 58, 1]];
      mR = [[0, 8, 52, 0.8]];
    }
    if (nv === PAPER) {
      // reading the paper; two page turns; leaning back; then the paper down to his lap
      mR = [[0, 18, 46, 1], [S0(0.9), 18, 46, 1], [S0(1.15), 6, 50, 1], [S0(1.45), 18, 46, 1], [S0(3.1), 18, 46, 1], [S0(3.35), 6, 50, 1],
        [S0(3.65), 18, 46, 1], [S0(6.3), 18, 46, 1], [S0(6.6), 16, 50, 1], [S0(7.2), 18, 46, 1], [S0(8.6), 18, 46, 1], [S0(9.2), 16, 26, 1]];
      mL = [[0, 8, 44, 1], [S0(8.6), 8, 44, 1], [S0(9.2), 8, 24, 1]];
      mLean = -0.1 * st(S0(4.5), S0(4.9)) * (1 - st(S0(8.6), S0(9.2)));
      mNeck = 0.1 * (1 - st(S0(8.8), S0(9.3))) - 0.12 * hd(b, L, S0(10.2), S0(10.4), S0(10.6), S0(10.8)) + 0.12 * hd(b, L, S0(10.7), S0(10.9), S0(11.1), S0(11.3));
    }
    if (nv === ENTER) {
      mR = [[0, 16, 26, 1], [0.66, 16, 26, 1], [0.74, 18, 50, 1], [0.8, 14, 46, 1], [0.86, 18, 50, 1], [0.94, 16, 28, 1]];
      mL = [[0, 8, 24, 1]];
      mNeck = -0.06 * st(0.1, 0.3);
    }
    if (nv === QUESTION) {
      // the paper onto the desk; up; the chalk across three lines
      mR = [[0, 16, 28, 1], [0.06, 25, 36, 1], [0.1, 14, 30, 0.6], [0.26, 6, 44, 0.4], [0.3, 46, 110, 1], [0.48, 14, 110, 1], [0.5, 38, 98, 1],
        [0.6, 20, 98, 1], [0.66, 44, 87, 1], [0.86, 14, 87, 1], [0.94, 6, 50, 0.5]];
      mL = [[0, 8, 24, 1], [0.12, 6, 30, 0.5], [0.28, 6, 44, 0]];
      mLean = 0.14 * bump(0.28, 0.34, 0.84, 0.9);
      mNeck = -0.08 * bump(0.28, 0.34, 0.84, 0.9);
    }
    if (nv === HOW) {
      mR = [[0, 6, 50, 0.5], [0.3, 4, 44, 0.4]];
      mNeck = -0.06 * bump(0.5, 0.6, 0.7, 0.8);
    }
    if (nv === ADVERT) {
      // the advert out of his jacket, up onto the corkboard; then the coat off the hook and THROWN
      mR = [[0, 6, 50, 0.4], [0.06, 6, 60, 1], [0.12, 10, 66, 1], [0.2, 30, 102, 1], [0.3, 30, 102, 1], [0.36, 8, 50, 0.4], [0.58, 8, 50, 0.4],
        [0.62, 14, 112, 1], [0.68, 12, 92, 1], [0.72, 6, 92, 1], [0.8, -2, 100, 1], [0.85, 30, 96, 1], [0.93, 16, 60, 0.6]];
      mLean = 0.12 * bump(0.18, 0.22, 0.3, 0.34) - 0.1 * bump(0.76, 0.8, 0.82, 0.86) + 0.12 * bump(0.82, 0.86, 0.9, 0.96);
      mNeck = -0.1 * bump(0.18, 0.22, 0.3, 0.34) - 0.06 * bump(0.58, 0.62, 0.68, 0.72);
    }
    if (nv === COAT) {
      // pleased with himself: hands on his hips, a little nod
      mR = [[0, 6, 44, 1]];
      mL = [[0, 4, 44, 1]];
      mLean = -0.06;
      mNeck = -0.08 + 0.08 * bump(0.7, 0.76, 0.8, 0.86);
    }
    if (nv === MIRROR) {
      // taps the clipboard with the pencil; points down at the plug through the glass
      mR = [[0, 8, 52, 0.8], [0.14, 12, 60, 1], [0.18, 12, 56, 1], [0.22, 12, 60, 1], [0.26, 12, 56, 1], [0.34, 8, 52, 0.8], [0.52, 8, 52, 0.8],
        [0.6, 30, 46, 1], [0.86, 30, 44, 1], [0.94, 8, 52, 0.8]];
      mLean = 0.08 * bump(0.56, 0.62, 0.86, 0.92);
      mNeck = 0.14 * bump(0.56, 0.62, 0.86, 0.92) - 0.08 * bump(0.1, 0.16, 0.3, 0.36);
    }
    if (nv === MACHINE || nv === LABELS || nv === TEST || nv === LIGHT) mNeck = 0.06;
    if (nv === SAMPLE) mNeck = 0.06 - 0.06 * bump(0.6, 0.66, 0.74, 0.8);
    if (nv === FIRST) {
      mR = [[0, 8, 52, 0.8], [0.4, 8, 52, 0.8], [0.46, 12, 60, 1], [0.6, 14, 58, 1], [0.66, 8, 52, 0.8]];
      mNeck = 0.06 + 0.06 * bump(0.4, 0.46, 0.6, 0.66);
    }
    if (nv === GUESS) {
      // writes on the clipboard, tears off the note, sticks it to the glass
      mR = [[0, 8, 52, 0.8], [0.1, 11, 61, 1], [0.3, 16, 56, 1], [0.38, 18, 66, 1], [0.44, 10, 64, 1], [0.62, 28, 110, 1], [0.7, 28, 110, 1], [0.78, 8, 52, 0.8]];
      mNeck = 0.14 * bump(0.08, 0.12, 0.34, 0.4) - 0.08 * bump(0.58, 0.64, 0.7, 0.76);
    }
    if (nv === Q2N) {
      mR = [[0, 8, 52, 0.8]];
      // right: he leans back, chin up, as his own note peels off the glass; wrong: a smug little shake
      const ok = ans(6, Q2);
      const no = ans(4, Q2) + ans(5, Q2);
      mLean = -0.16 * ok;
      mNeck = -0.24 * ok + 0.12 * Math.sin(Math.PI * 4 * Math.min(1, no)) * (1 - no);
    }
    if (nv > Q2N) {
      mR = [[0, 8, 52, 0.8]];
      mNeck = 0.08;
    }
    sm0 = keyed(sm0, mR, u, mxS, G, md, 1);
    sm0 = keyed(sm0, mL, u, mxS, G, md, -1);
    sm0 = leanOf(sm0, mLean, mNeck);
    if (mSeat > 0) {
      let seat = leanOf(seatOf(SEAT_M, 14), mLean, mNeck);
      seat = keyed(seat, mR, u, mxS, G, md, 1);
      seat = keyed(seat, mL, u, mxS, G, md, -1);
      sm0 = seatMix(sm0, seat, mSeat);
    }
    const prevM = carryFrom(heldM, n, hHold(mCode, t, 0));
    const figM = keepHeld(heldM, mw.walking ? mixKeepLegs(prevM, sm0, tr) : mixStance(prevM, sm0, tr));

    // ══ THE EXPERIMENTER ══════════════════════════════════════════════════════
    const exs = src(3, E_X);
    const eds = src(4, E_D);
    let ew: Walk = STILL;
    let ex = exs;
    let eTurns: (readonly number[])[] = [[0, -1]];
    ew = walkOf(exs, E_END[nv], E_WS[nv] * L, eds, b);
    if (nv === HOW || nv === TEST) eTurns = [[0, -1], [0.62, -1]];
    if (nv === SLIP) eTurns = [[0, -1], [0.3, 1], [0.76, -1]];
    if (ew.wd !== 0) ex = ew.x;
    const exS = carry(cv, 3, n, ex, ex, 1) + cam;
    const ed = carry(cv, 4, n, 0, faceOf(eds, eTurns, b, L, ew), 1);
    const eCode = sp(2) ? TALK : NOD;
    let se = bodyOf(ew, eCode, t, b, 1);
    let eR: readonly Key[] | null = null;
    let eL: readonly Key[] | null = null;
    let eLean = 0;
    let eNeck = 0;
    let eFold = 0;
    if (nv === ENTER) {
      // the mug carried in, set down on the desk, then the arms folded
      eR = [[0, 14, 56, 1], [0.6, 14, 56, 1], [0.68, 27, 37, 1], [0.74, 27, 37, 1], [0.8, 10, 46, 0.5]];
      eFold = st(0.82, 0.92);
      eNeck = -0.08 * st(0.82, 0.92);
    }
    if (nv === QUESTION) {
      eFold = 1;
      eNeck = -0.08 + 0.12 * bump(0.4, 0.5, 0.6, 0.7);
    }
    if (nv === HOW) {
      eFold = 1 - bump(0.04, 0.08, 0.62, 0.68);
      eR = [[0.08, 8, 50, 0], [0.16, 20, 62, 1], [0.4, 22, 66, 1], [0.6, 8, 50, 0]];
      eLean = -0.1 * st(0.7, 0.84);
    }
    if (nv === ADVERT) {
      eFold = 1 - st(0.9, 0.94);
      eLean = -0.1 + 0.06 * bump(0.9, 0.94, 0.96, 1);
      eR = [[0.9, 6, 58, 0], [0.95, 2, 80, 1]];
      eNeck = -0.06;
    }
    if (nv === COAT) {
      // shrugs into the coat, buttons it, and scowls
      eLean = -0.1 * (1 - st(0, 0.1));
      eR = [[0, 2, 80, 1], [0.08, 6, 66, 1], [0.14, 4, 76, 1], [0.22, 8, 58, 1], [0.3, 10, 54, 1], [0.36, 10, 50, 1], [0.42, 10, 46, 1], [0.48, 10, 42, 1],
        [0.6, 8, 44, 0.6], [0.7, 24, 58, 1], [0.84, 26, 56, 1], [0.94, 8, 44, 0.5]];
      eL = [[0, 6, 46, 0.4], [0.08, 4, 66, 1], [0.14, 4, 76, 1], [0.22, 7, 58, 1], [0.3, 7, 54, 1], [0.48, 7, 42, 1], [0.6, 6, 44, 0.4]];
      eNeck = 0.14 * bump(0.24, 0.3, 0.5, 0.56) - 0.06 * bump(0.66, 0.72, 0.9, 0.96);
    }
    if (nv === ARRIVE) {
      // the hat in his hand at his side, the other hand held out in welcome
      eL = [[0, 10, 42, 1]];
      eR = [[0.3, 8, 44, 0], [0.4, 22, 56, 1], [0.6, 22, 56, 1], [0.7, 8, 44, 0]];
      eNeck = -0.06;
    }
    if (nv === PAY) {
      // counts four bills and two quarters into the volunteer's palm, then holds out the hat
      eL = [[0, 10, 42, 1], [0.06, 12, 56, 1], [0.7, 12, 56, 1], [0.78, 22, 50, 1]];
      eR = [[0, 8, 44, 0.5], [0.06, 14, 56, 1], [0.12, 22, 54, 1], [0.27, 27, 49, 1], [0.34, 16, 56, 1], [0.42, 27, 48, 1], [0.5, 10, 46, 0.6], [0.7, 8, 44, 0]];
      eNeck = 0.14 * bump(0.06, 0.12, 0.44, 0.5);
    }
    if (nv === Q1N) {
      eL = [[0, 22, 50, 1]];
      // a right answer: he looks down into the hat as the pair drops in; a wrong one: a frown
      eNeck = 0.12 * ans(1, Q1) - 0.1 * (ans(2, Q1) + ans(3, Q1));
    }
    if (nv === SLIP) {
      eL = [[0, 22, 50, 1], [0.24, 22, 50, 1], [0.3, 10, 50, 1], [0.38, 22, 50, 1], [0.56, 22, 50, 1], [0.7, 10, 44, 1]];
      eNeck = 0.08 * bump(0.4, 0.46, 0.56, 0.62);
    }
    if (nv === STRAP) {
      // paste on the wrist, the strap buckled, the electrode fixed; a flat hand to explain
      eL = [[0, 12, 50, 1], [0.28, 12, 50, 1], [0.34, 29, 47, 1], [0.6, 29, 47, 1], [0.66, 8, 44, 0.4]];
      eR = [[0, 14, 52, 1], [0.05, 30, 46, 1], [0.1, 28, 49, 1], [0.15, 30, 46, 1], [0.2, 28, 49, 1], [0.26, 10, 50, 1], [0.34, 30, 48, 1],
        [0.42, 32, 46, 1], [0.48, 28, 48, 1], [0.56, 32, 46, 1], [0.62, 30, 50, 1], [0.7, 8, 44, 0.4], [0.8, 8, 44, 0.4], [0.86, 22, 58, 1], [0.96, 8, 44, 0.4]];
      eLean = 0.3 * bump(0.02, 0.08, 0.6, 0.68);
      eNeck = 0.16 * bump(0.02, 0.08, 0.6, 0.68);
    }
    if (nv === MIRROR || nv === LABELS || nv === FIRST || nv === GUESS || nv >= Q2N) {
      eR = [[0, 8, 40, 0.8]];
      eL = [[0, 6, 40, 0.8]];
    }
    if (nv === MIRROR) eNeck = -0.06 + 0.1 * bump(0.3, 0.36, 0.42, 0.48);
    if (nv === MACHINE) {
      // the cover: gripped by its end, pulled up and off, gathered on his arm; then a hand along the switches
      eR = [[0, 8, 40, 0.8], [0.06, 28, 60, 1], [0.12, 28, 60, 1], [0.22, 22, 90, 1], [0.32, 12, 60, 1], [0.38, 10, 52, 1], [0.48, 12, 52, 0.6],
        [0.56, 42, 44, 1], [0.66, 70, 44, 1], [0.86, 26, 44, 1], [0.94, 8, 40, 0.8]];
      eL = [[0, 6, 40, 0.8], [0.3, 10, 54, 1], [0.92, 10, 54, 1], [0.97, 14, 30, 1]];
      eLean = 0.16 * bump(0.04, 0.08, 0.12, 0.2) + 0.1 * bump(0.54, 0.6, 0.8, 0.88);
      eNeck = 0.14 * bump(0.54, 0.6, 0.8, 0.88);
    }
    if (nv === LABELS) eNeck = 0.06 * bump(0.6, 0.66, 0.74, 0.8);
    if (nv === SAMPLE) {
      // takes the volunteer's wrist, wraps the electrode, presses the third switch
      eR = [[0.36, 8, 44, 0], [0.42, 19, 48, 1], [0.48, 17, 50, 1], [0.52, 19, 47, 1], [0.56, 17, 50, 1], [0.6, 14, 46, 1], [0.64, 20, 38, 1],
        [0.68, 20, 38, 1], [0.76, 8, 44, 0.4]];
      eL = [[0.38, 6, 44, 0], [0.44, 18, 46, 1], [0.58, 18, 46, 1], [0.62, 6, 44, 0.3]];
      eLean = 0.2 * bump(0.4, 0.46, 0.64, 0.7);
      eNeck = 0.12 * bump(0.4, 0.46, 0.7, 0.76);
    }
    if (nv === TEST) eNeck = 0.04;
    if (nv === LIGHT) {
      eR = [[0, 8, 40, 0.8], [0.12, 34, 74, 1], [0.48, 34, 74, 1], [0.56, 8, 40, 0.6], [0.66, 70, 46, 1], [0.9, 70, 46, 1], [0.97, 8, 40, 0.8]];
      eL = [[0, 6, 40, 0.8]];
      eLean = 0.1 * bump(0.6, 0.66, 0.9, 0.96);
    }
    se = keyed(se, eR, u, exS, G, ed, 1);
    se = keyed(se, eL, u, exS, G, ed, -1);
    if (eFold > 0) se = folded(se, exS, G, ed, eFold);
    se = leanOf(se, eLean, eNeck);
    const prevE = carryFrom(heldE, n, hHold(eCode, t, 1));
    const figE = keepHeld(heldE, ew.walking ? mixKeepLegs(prevE, se, tr) : mixStance(prevE, se, tr));

    // ══ THE VOLUNTEER ═════════════════════════════════════════════════════════
    const vxs = src(5, V_X);
    const vds = src(6, V_D);
    let vw: Walk = STILL;
    let vx = vxs;
    let vTurns: (readonly number[])[] = [[0, V_D[nv]]];
    vw = walkOf(vxs, V_END[nv], V_WS[nv] * L, vds, b);
    if (nv === LABELS) {
      vw = b < 0.6 * L ? walkOf(vxs, 904, 0.08 * L, vds, b) : walkOf(904, 846, 0.7 * L, 1, b);
      vTurns = [[0, 1], [0.99, 1]];
    }
    if (nv === FIRST) vTurns = [[0, 1], [0.5, -1], [0.88, 1]];
    if (vw.wd !== 0) vx = vw.x;
    const vxS = carry(cv, 5, n, vx, vx, 1) + cam;
    const vd = carry(cv, 6, n, 0, faceOf(vds, vTurns, b, L, vw), 1);
    const vCode = sp(3) ? TALK : NOD;
    let sv = bodyOf(vw, vCode, t, b, 2);
    let vR: readonly Key[] | null = null;
    let vL: readonly Key[] | null = null;
    let vLean = 0;
    let vNeck = 0;
    if (nv === ARRIVE) {
      // his hat held in both hands, turned round and round
      vR = [[0, 14, 50, 1], [0.6, 14, 52, 1], [0.7, 16, 60, 1], [0.86, 16, 60, 1], [0.94, 14, 52, 1]];
      vL = [[0, 8, 48, 1], [0.6, 8, 50, 1], [0.7, 10, 58, 1], [0.86, 10, 58, 1], [0.94, 8, 50, 1]];
      vNeck = 0.08 * bump(0.64, 0.7, 0.86, 0.92);
    }
    if (nv === PAY) {
      // the hat at his side; his palm out for the money, which goes into his jacket
      vL = [[0, 8, 50, 1], [0.04, 8, 40, 1]];
      vR = [[0, 14, 50, 0.6], [0.06, 22, 50, 1], [0.5, 22, 50, 1], [0.6, 8, 60, 1], [0.66, 8, 60, 1], [0.72, 8, 44, 0.4]];
      vNeck = 0.12 * bump(0.06, 0.12, 0.44, 0.5) - 0.08 * bump(0.5, 0.56, 0.66, 0.72);
    }
    if (nv === Q1N) vL = [[0, 8, 40, 1]];
    if (nv === SLIP) {
      // draws a slip, opens it, holds it up — TEACHER — and turns to Mr Wallace
      vL = [[0, 8, 40, 1]];
      vR = [[0, 8, 44, 0.5], [0.08, 27, 50, 1], [0.2, 12, 58, 1], [0.32, 12, 86, 1], [0.48, 12, 86, 1], [0.6, 12, 60, 1], [0.76, 12, 60, 1], [0.86, 20, 64, 1]];
      vNeck = 0.14 * bump(0.12, 0.16, 0.26, 0.3) - 0.1 * bump(0.3, 0.34, 0.44, 0.48);
      vLean = 0.08 * bump(0.52, 0.58, 0.9, 0.96);
    }
    if (nv === STRAP) {
      // in the doorway: winces at "very painful", eases at "no permanent damage"
      vR = [[0.42, 8, 44, 0], [0.5, 8, 62, 1], [0.76, 8, 62, 1], [0.84, 8, 44, 0]];
      vLean = -0.14 * bump(0.42, 0.5, 0.74, 0.84);
      vNeck = -0.1 * bump(0.42, 0.5, 0.74, 0.84);
    }
    if (nv === MIRROR) {
      vR = [[0.28, 8, 44, 0], [0.36, 4, 96, 1], [0.42, 6, 98, 1], [0.48, 4, 96, 1], [0.56, 8, 44, 0]];
      vNeck = 0.08 * bump(0.28, 0.36, 0.5, 0.58);
    }
    if (nv === MACHINE) {
      vLean = -0.14 * bump(0.14, 0.2, 0.32, 0.42);
      vNeck = -0.1 * bump(0.14, 0.2, 0.32, 0.42) + 0.08 * st(0.5, 0.6);
    }
    if (nv === SAMPLE) {
      // the wrist held out over the generator; it jerks back at the shock
      vR = [[0.08, 8, 44, 0], [0.18, 26, 48, 1], [0.66, 26, 48, 1], [0.69, 8, 58, 1], [0.84, 8, 58, 1], [0.92, 8, 44, 0.4]];
      vLean = -0.18 * bump(0.66, 0.69, 0.76, 0.86);
      vNeck = 0.06 * st(0.2, 0.3) - 0.2 * bump(0.66, 0.69, 0.76, 0.86);
    }
    if (nv === TEST) {
      // rubbing the wrist; picks up the word card; reads it into the microphone
      vR = [[0, 8, 58, 1], [0.24, 8, 58, 1], [0.3, 6, 44, 0.4]];
      vL = [[0, 10, 58, 1], [0.04, 12, 56, 1], [0.08, 10, 58, 1], [0.12, 12, 56, 1], [0.16, 10, 58, 1], [0.24, 18, 38, 1], [0.3, 18, 36, 1], [0.38, 14, 62, 1]];
      vLean = 0.14 * st(0.38, 0.46);
      vNeck = 0.1 * st(0.36, 0.44);
    }
    if (nv === LIGHT) {
      vL = [[0, 14, 62, 1], [0.2, 10, 50, 1]];
      vNeck = -0.1 * bump(0.14, 0.22, 0.6, 0.7);
    }
    if (nv >= FIRST) vL = [[0, 10, 50, 1]];
    if (nv === FIRST) {
      vR = [[0.1, 8, 44, 0], [0.24, 18, 44, 1], [0.32, 18, 41, 1], [0.37, 18, 36, 1], [0.44, 14, 44, 1], [0.5, 8, 44, 0.4]];
      vLean = 0.12 * bump(0.2, 0.26, 0.4, 0.46);
      vNeck = 0.14 * bump(0.2, 0.26, 0.4, 0.46) + 0.12 * bump(0.6, 0.66, 0.82, 0.88);
    }
    if (nv === Q2N) vNeck = 0.04;
    if (nv === LABELS) {
      // the finger runs along the labels, then taps the last two: XXX
      const fx = lerp(866, 978, st(0.1, 0.56));
      const fy = 437 + 1.2 * Math.sin(b * 18) * bump(0.1, 0.14, 0.52, 0.56);
      const w0 = bump(0.06, 0.1, 0.66, 0.72);
      const tap = 2 * bump(0.58, 0.6, 0.62, 0.64);
      sv = handAt(sv, vxS, G, vd, 1, fx + cam, fy - tap, w0);
      vLean = 0.16 * bump(0.06, 0.12, 0.64, 0.7);
      vNeck = 0.16 * bump(0.06, 0.12, 0.64, 0.7);
    }
    sv = keyed(sv, vR, u, vxS, G, vd, 1);
    sv = keyed(sv, vL, u, vxS, G, vd, -1);
    sv = leanOf(sv, vLean, vNeck);
    const prevV = carryFrom(heldV, n, hHold(vCode, t, 2));
    const figV = keepHeld(heldV, vw.walking ? mixKeepLegs(prevV, sv, tr) : mixStance(prevV, sv, tr));

    // ══ MR WALLACE (silent) ═══════════════════════════════════════════════════
    const lxs = src(7, L_X);
    let lw: Walk = STILL;
    let lx = lxs;
    let lSeat = nv < ARRIVE || nv >= STRAP ? 1 : 0;
    const ld = nv >= STRAP ? 1 : -1;
    if (nv === ARRIVE && !pre) lSeat = 1 - st(0.2, 0.3);
    if (nv >= ARRIVE && nv < STRAP) lw = walkOf(lxs, L_END[nv], L_WS[nv] * L, -1, b);
    if (lw.wd !== 0) lx = lw.x;
    const lxS = carry(cv, 7, n, lx, lx, 1) + cam;
    let sl = bodyOf(lw, NOD, t, b, 3);
    let lR: readonly Key[] | null = null;
    let lL: readonly Key[] | null = null;
    let lLean = 0;
    let lNeck = 0;
    if (nv <= ARRIVE) {
      // on his chair; up on his feet as the volunteer comes in, with a little wave hello
      lR = [[0, 12, 24, 0.6], [0.2, 12, 24, 0.6], [0.3, 8, 44, 0], [0.5, 8, 44, 0], [0.58, 14, 84, 1], [0.64, 18, 86, 1], [0.7, 14, 84, 1], [0.78, 8, 44, 0]];
      lL = [[0, 10, 24, 0.6], [0.2, 10, 24, 0.6], [0.3, 6, 44, 0]];
      if (nv === ARRIVE) lNeck = -0.08 * bump(0.12, 0.18, 0.24, 0.3) + 0.1 * bump(0.5, 0.56, 0.62, 0.68);
    }
    if (nv === PAY) lNeck = 0.12 * bump(0.86, 0.9, 0.92, 0.96);
    if (nv === Q1N) {
      lR = [[0, 8, 40, 0.6]];
      lL = [[0, 6, 40, 0.6]];
    }
    if (nv === SLIP) {
      // draws his slip, reads it, and acts the part: droops, and shrugs
      lR = [[0.4, 8, 44, 0], [0.46, 28, 50, 1], [0.5, 24, 54, 1], [0.56, 12, 58, 1], [0.7, 12, 58, 1], [0.84, 12, 62, 1], [0.92, 12, 58, 1]];
      lL = [[0.8, 6, 44, 0], [0.86, 10, 62, 1], [0.94, 6, 44, 0.3]];
      lNeck = 0.12 * bump(0.52, 0.56, 0.62, 0.66) + 0.18 * bump(0.62, 0.68, 0.84, 0.9);
      lLean = 0.1 * bump(0.62, 0.68, 0.84, 0.9);
    }
    if (nv >= STRAP) {
      // in the chair: the right forearm along its arm, the left hand on his knee
      lR = [[0, 18, 44, 1]];
      lL = [[0, 12, 26, 1]];
      if (nv === STRAP) {
        lNeck = 0.1 * bump(0.1, 0.16, 0.22, 0.28) - 0.06 * bump(0.5, 0.56, 0.64, 0.7);
        lLean = 0.08 * bump(0.7, 0.74, 0.78, 0.84) - 0.06 * bump(0.78, 0.82, 0.86, 0.9);
      }
    }
    sl = keyed(sl, lR, u, lxS, G, ld, 1);
    sl = keyed(sl, lL, u, lxS, G, ld, -1);
    sl = leanOf(sl, lLean, lNeck);
    if (lSeat > 0) {
      let seat = leanOf(seatOf(nv >= STRAP ? SEAT_L : SEAT_LAB, 14), lLean, lNeck);
      seat = keyed(seat, lR, u, lxS, G, ld, 1);
      seat = keyed(seat, lL, u, lxS, G, ld, -1);
      sl = seatMix(sl, seat, lSeat);
    }
    const prevL = carryFrom(heldL, n, hHold(NOD, t, 3));
    const figL = keepHeld(heldL, lw.walking ? mixKeepLegs(prevL, sl, tr) : mixStance(prevL, sl, tr));

    // ── the bundles ──────────────────────────────────────────────────────────
    const bM = pose(figM, mxS, G, K, md, 1);
    const bE = pose(figE, exS, G, K, ed, 1);
    const bV = pose(figV, vxS, G, K, vd, 1);
    const bL = pose(figL, lxS, G, K, ld, 1);
    const mRw = jointOf(bM, 'wrR');
    const mLw = jointOf(bM, 'wrL');
    const eRw = jointOf(bE, 'wrR');
    const eLw = jointOf(bE, 'wrL');
    const eSh = jointOf(bE, 'shRd');
    const vRw = jointOf(bV, 'wrR');
    const vLw = jointOf(bV, 'wrL');
    const lRw = jointOf(bL, 'wrR');

    // ── the office's things ──────────────────────────────────────────────────
    // the newspaper: open in his hands, turned twice, down on his lap, dropped on the desk
    const turn1 = nv === PAPER ? bump(S0(0.95), S0(1.15), S0(1.25), S0(1.45)) : 0;
    const turn2 = nv === PAPER ? bump(S0(3.15), S0(3.35), S0(3.45), S0(3.65)) : 0;
    const onDesk = nv === QUESTION ? st(0.04, 0.1) : nv > QUESTION ? 1 : 0;
    const paper = {
      x: lerp((mRw.x + mLw.x) / 2, DESK_PAPER.x + cam, onDesk),
      y: lerp((mRw.y + mLw.y) / 2 - 6, DESK_PAPER.y + 1, onDesk),
      sx: Math.max(0.06, 1 - 2 * Math.max(turn1, turn2)) * (1 - 0.35 * onDesk),
      sy: 1 - 0.75 * onDesk,
      o: nv < ARRIVE ? 1 : 0,
    };
    // the mug: in his hand, then on the desk, steaming
    const mugDown = nv === ENTER ? st(0.68, 0.7) : nv > ENTER && nv < ARRIVE ? 1 : 0;
    const mug = {
      x: mugDown > 0.5 ? MUG.x + cam : eRw.x + 2 * ed,
      y: mugDown > 0.5 ? MUG.y : eRw.y + 2,
      o: nv >= ENTER && nv < ARRIVE ? 1 : 0,
      steam: mugDown,
    };
    // the chalk: three lines, revealed as his hand crosses them
    const chalk = [
      nv === QUESTION ? st(0.3, 0.48) : nv > QUESTION ? 1 : 0,
      nv === QUESTION ? st(0.5, 0.6) : nv > QUESTION ? 1 : 0,
      nv === QUESTION ? st(0.66, 0.86) : nv > QUESTION ? 1 : 0,
    ];
    // the advert: out of his jacket into his hand, up onto the corkboard
    const advPinned = nv === ADVERT ? st(0.28, 0.3) : nv > ADVERT ? 1 : 0;
    const advert = {
      x: advPinned > 0.5 ? ADV.x + cam : mRw.x + 6 * md,
      y: advPinned > 0.5 ? ADV.y : mRw.y - 6,
      o: nv < ADVERT ? 0 : nv === ADVERT ? st(0.06, 0.08) : nv < ARRIVE ? 1 : 0,
      s: advPinned > 0.5 ? 1 : 0.6 + 0.4 * st(0.12, 0.26),
    };
    // the grey lab coat: on its hook, in his hand, flying across the room, on the experimenter's shoulder
    const lifted = nv === ADVERT ? st(0.62, 0.64) : nv > ADVERT ? 1 : 0;
    const fly = nv === ADVERT ? st(0.85, 0.95) : nv > ADVERT ? 1 : 0;
    let coatX = HOOK.x + cam;
    let coatY = HOOK.y;
    let coatR = 0;
    if (lifted > 0.5) {
      coatX = mRw.x;
      coatY = mRw.y - 2;
    }
    if (fly > 0) {
      coatX = lerp(mRw.x, eSh.x + 2, fly);
      coatY = lerp(mRw.y, eSh.y - 2, fly) - 70 * Math.sin(Math.PI * fly);
      coatR = fly < 1 ? 360 * fly : 0;
    }
    // ── the lab's things ─────────────────────────────────────────────────────
    // his own brown hat: turned in his hands, at his side, then on the hat table
    const vHatT = nv >= STRAP ? 1 : 0;
    const vHat = {
      x: vHatT ? 708 + cam : nv === ARRIVE ? (vRw.x + vLw.x) / 2 : vLw.x,
      y: vHatT ? 462 : nv === ARRIVE ? (vRw.y + vLw.y) / 2 + 2 : vLw.y + 6,
      sx: nv === ARRIVE ? lerp(Math.cos(b * 2.2), 1, st(0.8, 0.95)) : 1,
      rot: !vHatT && nv > ARRIVE ? 90 * vd * (nv === PAY ? st(0.0, 0.06) : 1) : 0,
      o: nv >= ARRIVE ? 1 : 0,
      tb: vHatT,
    };
    // the experimenter's grey hat, the slips in it: at his side, held out, then on the table
    const eHatOut = nv === PAY ? st(0.72, 0.8) : nv === Q1N || nv === SLIP ? 1 : 0;
    const eHatT = nv >= STRAP ? 1 : 0;
    const eHat = {
      x: eHatT ? 772 + cam : eLw.x,
      y: eHatT ? 462 : eLw.y + (eHatOut > 0.5 ? -4 : 4),
      up: eHatOut > 0.5 && !eHatT ? 1 : 0,
      rot: eHatOut > 0.5 || eHatT ? 0 : 90 * ed,
      o: nv >= ARRIVE ? 1 : 0,
      tb: eHatT,
    };
    // the money: four bills and two quarters counted into his palm
    const bills = nv === PAY ? Math.floor(clamp01((u - 0.06) / 0.24) * 4.99) : 0;
    const quarters = nv === PAY ? (u > 0.31 ? 1 : 0) + (u > 0.42 ? 1 : 0) : 0;
    const money = { x: vRw.x + 3 * vd, y: vRw.y - 2, bills, quarters, o: nv === PAY && u < 0.64 ? 1 : 0 };
    // the slips drawn: the volunteer's (opened, TEACHER), Mr Wallace's
    const vSlip = { x: vRw.x + 3 * vd, y: vRw.y - 4, open: nv === SLIP ? st(0.12, 0.2) : 0, o: nv === SLIP && u > 0.07 ? 1 : 0 };
    const lSlip = { x: lRw.x - 3, y: lRw.y - 4, open: nv === SLIP ? st(0.52, 0.58) : 0, o: nv === SLIP && u > 0.47 ? 1 : 0 };
    // Q1: the three pairs; the right one hops into the hat, a wrong one jumps and flops back
    const rTT = carry(cv, 8, n, 0, kept(8, 1, Q1, Q1N), keptTr(Q1));
    const rTL = carry(cv, 9, n, 0, kept(9, 2, Q1, Q1N), keptTr(Q1));
    const rLL = carry(cv, 10, n, 0, kept(10, 3, Q1, Q1N), keptTr(Q1));
    const q1 = carry(cv, 11, n, 0, Q1[n], tr);
    // the paste jar, and the strap on Wallace's forearm
    const jar = { x: eLw.x, y: eLw.y - 4, o: nv === STRAP && u < 0.3 ? 1 : 0 };
    const strapped = nv === STRAP ? st(0.42, 0.56) : nv > STRAP ? 1 : 0;
    const strap = { x: lRw.x - 6, y: lRw.y + 1, o: nv >= STRAP ? strapped : 0 };
    // the cover: on the generator, pulled off, gathered on his arm, dropped on the chair
    const pull = nv === MACHINE ? st(0.1, 0.32) : nv > MACHINE ? 1 : 0;
    const dropped = nv === MACHINE ? st(0.94, 0.98) : nv > MACHINE ? 1 : 0;
    const cover = {
      x: dropped > 0.5 ? 1018 + cam : lerp(922 + cam, eLw.x, pull),
      y: dropped > 0.5 ? 470 : lerp(444, eLw.y - 2, pull) - 18 * Math.sin(Math.PI * pull),
      s: lerp(1, 0.28, pull),
      o: nv < ARRIVE ? 0 : 1,
    };
    // the label under the volunteer's finger (b13)
    const group = nv === LABELS ? Math.min(7, Math.floor(clamp01((u - 0.1) / 0.5) * 8)) : -1;
    const labelO = nv === LABELS ? bump(0.08, 0.12, 0.7, 0.76) : 0;
    // the electrode on the volunteer's wrist, the sample lamp
    const vElectrode = { x: vRw.x, y: vRw.y, o: nv === SAMPLE ? st(0.5, 0.56) : nv > SAMPLE ? 1 : 0 };
    const sampleLamp = nv === SAMPLE ? bump(0.66, 0.67, 0.72, 0.76) : 0;
    // the card in his hand, the answer box, the word plate
    const card = {
      x: vLw.x + 2 * vd, y: vLw.y - 4,
      o: nv === TEST ? (u > 0.27 ? 1 : 0) : nv > TEST && nv < GUESS ? 1 : 0,
      onTable: (nv === TEST && u <= 0.27) || (nv >= ARRIVE && nv < TEST) ? 1 : 0,
    };
    const words = nv === TEST ? st(0.3, 0.4) : nv === LIGHT || nv === FIRST ? 1 : nv === GUESS ? 1 - st(0, 0.15) : 0;
    const lampLit = nv === LIGHT ? st(0.12, 0.16) : nv === FIRST ? 1 : nv === GUESS ? 1 - st(0, 0.15) : 0;
    // switch one down, its lamp lit
    const first = nv === FIRST ? st(0.33, 0.37) : nv > FIRST ? 1 : 0;
    // the note: torn off, stuck to the glass
    const noteStuck = nv === GUESS ? st(0.62, 0.66) : nv > GUESS ? 1 : 0;
    const noteO = nv === GUESS ? st(0.4, 0.44) : nv > GUESS ? 1 : 0;
    // Q2: the switches the reader may call; the right one lights and Milgram's note peels off
    const r150 = carry(cv, 12, n, 0, kept(12, 4, Q2, Q2N), keptTr(Q2));
    const r300 = carry(cv, 13, n, 0, kept(13, 5, Q2, Q2N), keptTr(Q2));
    const r450 = carry(cv, 14, n, 0, kept(14, 6, Q2, Q2N), keptTr(Q2));
    const q2 = carry(cv, 15, n, 0, Q2[n], tr);
    const fall = clamp01((r450 - 0.3) / 0.6);
    const wob = Math.min(1, r150 + r300);
    const note = {
      x: noteStuck > 0.5 ? NOTE.x + cam + 34 * fall : mRw.x - 4,
      y: noteStuck > 0.5 ? NOTE.y + (494 - NOTE.y) * fall * fall : mRw.y - 6,
      rot: noteStuck > 0.5 ? 176 * fall + 8 * Math.sin(Math.PI * 4 * wob) * (1 - wob) : -10,
      s: noteStuck > 0.5 ? 1 : 0.55,
      o: noteO,
    };
    // the lamps light along the row up to the called switch; a wrong call flickers out
    const called = r450 > 0 ? 30 : r300 > 0 ? 20 : r150 > 0 ? 10 : 0;
    const rr = Math.max(r150, r300, r450);
    const runTo = called * clamp01(rr / 0.5);
    const runO = called === 30 || rr < 0.6 ? 1 : (Math.sin(rr * 70) > 0 ? 1 : 0.2) * (1 - clamp01((rr - 0.6) / 0.3));
    const dim = nv === REST ? 0.5 * st(0.05, 0.4) : nv > REST ? 0.5 : 0;

    return {
      bM, bE, bV, bL, cam, t, veil, dim,
      paper, mug, chalk, advert,
      coat: { x: coatX, y: coatY, rot: coatR, o: nv <= ADVERT ? 1 : nv === COAT ? 1 - st(0, 0.05) : 0 },
      vHat, eHat, money, vSlip, lSlip, rTT, rTL, rLL, q1,
      jar, strap, cover, group, labelO,
      vElectrode, sampleLamp, card, words, lampLit, first,
      pencil: { x: mRw.x, y: mRw.y, o: nv >= ARRIVE ? 1 : 0, rot: -30 * md },
      note, r150, r300, r450, q2, runTo, runO,
    };
  });

  const DM = useDerivedValue<Bundle>(() => SCENE.value.bM);
  const DE = useDerivedValue<Bundle>(() => SCENE.value.bE);
  const DV = useDerivedValue<Bundle>(() => SCENE.value.bV);
  const DL = useDerivedValue<Bundle>(() => SCENE.value.bL);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.cam }] }));

  return (
    <View style={styles.scene}>
      {/* THE WORLD, far to near: the office (x 0–400) and the laboratory (x 400–1230) */}
      <Animated.View style={[styles.world, world]} pointerEvents="none">
        <LessonPicture name="milgram1-office-far" />
        <Leaves S={SCENE} />
        <ClockHands S={SCENE} at={CLOCK_O} r={10} />
        <Chalk S={SCENE} />
        <LessonPicture name="milgram1-lab-far-a" />
        <LessonPicture name="milgram1-lab-far-b" />
        <ClockHands S={SCENE} at={CLOCK_L} r={7.6} />
        <Reels S={SCENE} />
        <View style={styles.deskShadow} />
        <View style={styles.cabinetShadow} />
        <View style={styles.chairShadow} />
        <View style={styles.hatTableShadow} />
        <View style={styles.genTableShadow} />
        <LessonPicture name="milgram1-office-near" />
        <LessonPicture name="milgram1-lab-near-a" />
        <LessonPicture name="milgram1-lab-near-b" />
        <Switches S={SCENE} />
        <LampRun S={SCENE} />
        <AnswerBox S={SCENE} />
        <View style={styles.plugAt}><View style={styles.plug} /><View style={styles.prongA} /><View style={styles.prongB} /></View>
        <Pairs S={SCENE} />
      </Animated.View>
      <Advert S={SCENE} />
      <Cover S={SCENE} />
      <Hats S={SCENE} table={1} />
      {/* cast: tophat */}
      <Stickman D={DE} k={K} role="second" wear={EXPERIMENTER_HEAD} garb={i >= COAT ? UNIT2_OUTFITS.experimenter.garb?.bands : SHIRT_SLEEVES} />
      <Coat S={SCENE} />
      {/* extra: learner */}
      <Stickman D={DL} k={K} role="crowd" wear={LEARNER_HEAD} garb={UNIT2_OUTFITS.learner.garb?.bands} />
      <Strap S={SCENE} />
      {/* cast: cap */}
      <Stickman D={DV} k={K} role="crowd" wear={VOLUNTEER_HEAD} garb={UNIT2_OUTFITS.volunteer.garb?.bands} />
      {/* cast: plain */}
      <Stickman D={DM} k={K} role="lead" wear={i >= ARRIVE ? MILGRAM_HEAD : MILGRAM_DESK_HEAD} garb={MILGRAM.garb?.bands} />
      {/* things in hands */}
      <Newspaper S={SCENE} />
      <Mug S={SCENE} />
      <Hats S={SCENE} table={0} />
      <Money S={SCENE} />
      <Slip S={SCENE} k="vSlip" />
      <Slip S={SCENE} k="lSlip" />
      <Jar S={SCENE} />
      <Electrode S={SCENE} />
      <Card S={SCENE} />
      <Pencil S={SCENE} />
      <Note S={SCENE} />
      {/* the labels and the things to tap */}
      <LabelPlate S={SCENE} />
      <WordPlate S={SCENE} />
      {on(Q1) ? <PairPlates S={SCENE} /> : null}
      {on(Q2) ? <CallPlates S={SCENE} /> : null}
      <Veil S={SCENE} k="dim" />
      <Veil S={SCENE} k="veil" />
      {on(Q1) ? <StageTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} qs={PAIR_Q} k="q1" /> : null}
      {on(Q2) ? <StageTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} qs={CALL_Q} k="q2" /> : null}
    </View>
  );
}

// ── the living world ─────────────────────────────────────────────────────────

/** Maple leaves drifting down past the window, seen through the leading (world x). */
const LEAF = [[8, 0, 0.9, 0], [30, 0.37, 1.1, 1], [52, 0.71, 0.8, 0], [66, 0.18, 1.0, 1]] as const;
function Leaves({ S }: { S: SharedValue<any> }) {
  return (
    <View style={styles.windowClip}>
      {LEAF.map(([x, ph, sp, y], k) => <Leaf key={k} S={S} x={x} ph={ph} sp={sp} yellow={y} />)}
    </View>
  );
}
function Leaf({ S, x, ph, sp, yellow }: { S: SharedValue<any>; x: number; ph: number; sp: number; yellow: number }) {
  const st = useAnimatedStyle(() => {
    const f = (S.value.t * 0.11 * sp + ph) % 1;
    return {
      transform: [{ translateX: x + 8 * Math.sin(f * 9 + ph * 6) }, { translateY: -6 + 132 * f }, { rotate: `${f * 540 + ph * 200}deg` }, { scaleX: Math.cos(f * 14) }],
    };
  });
  return <Animated.View style={[styles.rider, st]}><View style={[styles.leaf, yellow ? styles.leafY : null]} /></Animated.View>;
}
/** A clock's hour, minute and second hands. */
function ClockHands({ S, at: c, r }: { S: SharedValue<any>; at: { x: number; y: number }; r: number }) {
  const sec = useAnimatedStyle(() => ({ transform: [{ translateX: c.x }, { translateY: c.y }, { rotate: `${Math.floor(S.value.t) * 6}deg` }] }));
  const min = useAnimatedStyle(() => ({ transform: [{ translateX: c.x }, { translateY: c.y }, { rotate: `${130 + S.value.t * 0.1}deg` }] }));
  const hr = useAnimatedStyle(() => ({ transform: [{ translateX: c.x }, { translateY: c.y }, { rotate: `${100 + S.value.t * 0.008}deg` }] }));
  return (
    <>
      <Animated.View style={[styles.rider, hr]}><View style={[styles.hand, { top: -r * 0.55, height: r * 0.55, width: 1.6, left: -0.8 }]} /></Animated.View>
      <Animated.View style={[styles.rider, min]}><View style={[styles.hand, { top: -r * 0.85, height: r * 0.85, width: 1.2, left: -0.6 }]} /></Animated.View>
      <Animated.View style={[styles.rider, sec]}><View style={[styles.secHand, { top: -r * 0.9, height: r * 0.9 }]} /></Animated.View>
    </>
  );
}
/** The tape recorder's reels turning in the booth. */
function Reels({ S }: { S: SharedValue<any> }) {
  return <>{REELS.map((x, k) => <Reel key={k} S={S} x={x} k={k} />)}</>;
}
function Reel({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: x }, { translateY: 437 }, { rotate: `${S.value.t * (k ? 70 : 52)}deg` }] }));
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.spokeA} />
      <View style={styles.spokeB} />
    </Animated.View>
  );
}

// ── the office ───────────────────────────────────────────────────────────────

const CHALK_LINES = ['ORDINARY', 'MAN?', 'ORDERS?'];
/** The chalked question on the board, line by line as his hand crosses it (world x). */
function Chalk({ S }: { S: SharedValue<any> }) {
  return <>{CHALK_LINES.map((w, k) => <ChalkLine key={k} S={S} k={k} word={w} />)}</>;
}
function ChalkLine({ S, k, word }: { S: SharedValue<any>; k: number; word: string }) {
  const st = useAnimatedStyle(() => ({ width: 52 * S.value.chalk[k], opacity: S.value.chalk[k] > 0.01 ? 1 : 0 }));
  return (
    <Animated.View style={[styles.chalkClip, { top: BOARD.y[k] - 7 }, st]}>
      <Text style={styles.chalkText}>{word}</Text>
    </Animated.View>
  );
}
/** The newspaper, opened in his hands (screen space); on the desk after he drops it. */
function Newspaper({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.paper;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { scaleX: v.sx }, { scaleY: v.sy }] };
  });
  return <Animated.View nativeID="m1-paper" style={[styles.rider, st]}><LessonPicture name="milgram1-paper" /></Animated.View>;
}
/** The mug of coffee, in his hand or on the desk, steaming. */
function Mug({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.mug;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }] };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      {[0, 1].map((k) => <Steam key={k} S={S} k={k} />)}
      <View style={styles.mugHandle} />
      <View style={styles.mugBody} />
      <View style={styles.mugCoffee} />
    </Animated.View>
  );
}
function Steam({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const ph = (S.value.t * 0.4 + k / 2) % 1;
    return { opacity: S.value.mug.steam * 0.8 * Math.sin(Math.PI * ph), transform: [{ translateX: 1.5 * Math.sin(ph * 6 + k) }, { translateY: -12 - 16 * ph }, { scale: 0.6 + ph }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.steam} /></Animated.View>;
}
/** The advert: in his hand, then pinned on the corkboard. */
function Advert({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.advert;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { scale: v.s }] };
  });
  return (
    <Animated.View nativeID="m1-advert" style={[styles.rider, st]}>
      <View style={styles.advert}>
        <Text style={styles.advertText}>STUDY OF</Text>
        <Text style={styles.advertText}>MEMORY</Text>
        <Text style={styles.advertText}>$4.00</Text>
      </View>
      <View style={styles.pin} />
    </Animated.View>
  );
}
/** The grey lab coat: on its hook, in his hand, flying, on the experimenter's shoulder. */
function Coat({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.coat;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }] };
  });
  return <Animated.View nativeID="m1-coat" style={[styles.rider, st]}><LessonPicture name="milgram1-coat" /></Animated.View>;
}

// ── the lab ──────────────────────────────────────────────────────────────────

/** The hats: the volunteer's brown one and the experimenter's grey one, held or on the table. */
function Hats({ S, table }: { S: SharedValue<any>; table: 0 | 1 }) {
  const v = useAnimatedStyle(() => {
    const h = S.value.vHat;
    return { opacity: h.o * (h.tb === table ? 1 : 0), transform: [{ translateX: h.x }, { translateY: h.y }, { rotate: `${h.rot}deg` }, { scaleX: h.sx }] };
  });
  const eUp = useAnimatedStyle(() => {
    const h = S.value.eHat;
    return { opacity: h.o * h.up * (h.tb === table ? 1 : 0), transform: [{ translateX: h.x }, { translateY: h.y }] };
  });
  const eDown = useAnimatedStyle(() => {
    const h = S.value.eHat;
    return { opacity: h.o * (1 - h.up) * (h.tb === table ? 1 : 0), transform: [{ translateX: h.x }, { translateY: h.y }, { rotate: `${h.rot}deg` }] };
  });
  return (
    <>
      <Animated.View style={[styles.rider, v]}><LessonPicture name="milgram1-hat-brown" /></Animated.View>
      <Animated.View nativeID={table ? 'm1-hat-table' : 'm1-hat'} style={[styles.rider, eUp]}><LessonPicture name="milgram1-hat-up" /></Animated.View>
      <Animated.View style={[styles.rider, eDown]}><LessonPicture name="milgram1-hat-grey" /></Animated.View>
    </>
  );
}
/** Four dollar bills and two quarters fanned in his palm. */
function Money({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {[0, 1, 2, 3].map((k) => <Bill key={k} S={S} k={k} />)}
      {[0, 1].map((k) => <Quarter key={`q${k}`} S={S} k={k} />)}
    </>
  );
}
function Bill({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.money;
    return { opacity: v.o * (v.bills > k ? 1 : 0), transform: [{ translateX: v.x }, { translateY: v.y - k * 1.2 }, { rotate: `${-14 + k * 9}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.bill} /></Animated.View>;
}
function Quarter({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.money;
    return { opacity: v.o * (v.quarters > k ? 1 : 0), transform: [{ translateX: v.x - 2 + k * 4 }, { translateY: v.y - 6 }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.quarter} /></Animated.View>;
}
/** A slip of paper drawn from the hat: folded, then opened. */
function Slip({ S, k }: { S: SharedValue<any>; k: 'vSlip' | 'lSlip' }) {
  const st = useAnimatedStyle(() => {
    const v = S.value[k];
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { scaleX: 0.45 + 0.55 * v.open }] };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.slip} />
      <View style={styles.slipLine} />
    </Animated.View>
  );
}
/** The three pairs of slips on the hat table (Q1): the right pair hops into the hat; a wrong one jumps and flops (world x). */
function Pairs({ S }: { S: SharedValue<any> }) {
  return <>{PAIRS.map((p) => <Pair key={p.id} S={S} id={p.id} x={p.x} />)}</>;
}
function Pair({ S, id, x }: { S: SharedValue<any>; id: string; x: number }) {
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const r = id === 'tt' ? v.rTT : id === 'tl' ? v.rTL : v.rLL;
    if (id === 'tt') {
      // into the hat in the experimenter's hand, held out at the table's end
      const f = clamp01(r * 1.4);
      const hx = v.eHat.x - v.cam;
      const tx = lerp(x, hx, f);
      const ty = lerp(460, v.eHat.y - 2, f) - 40 * Math.sin(Math.PI * f);
      return { opacity: v.q1 * (f < 0.98 ? 1 : 0), transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${300 * f}deg` }, { scale: 1 - 0.5 * f }] };
    }
    const hop = r > 0 && r < 1 ? Math.abs(Math.sin(r * Math.PI * 2)) * (1 - r) * 12 : 0;
    return {
      opacity: v.q1,
      transform: [{ translateX: x + (r > 0 && r < 1 ? 2 * Math.sin(r * 30) * (1 - r) : 0) }, { translateY: 460 - hop }, { scaleY: r > 0 && r < 1 ? Math.cos(r * Math.PI * 4) : 1 }],
    };
  });
  return (
    <Animated.View nativeID={`m1-pair-${id}`} style={[styles.rider, st]}>
      <View style={[styles.slipFlat, { left: -9, transform: [{ rotate: '-8deg' }] }]} />
      <View style={[styles.slipFlat, { left: 1, transform: [{ rotate: '6deg' }] }]} />
    </Animated.View>
  );
}
/** The paste jar in his hand. */
function Jar({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.jar;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.jar} /><View style={styles.jarLid} /></Animated.View>;
}
/** The leather strap buckled over Mr Wallace's forearm, the electrode beside it. */
function Strap({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.strap;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }] };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.strap} />
      <View style={styles.buckle} />
      <View style={styles.electrode} />
    </Animated.View>
  );
}
/** The electrode band on the volunteer's own wrist (the 45-volt sample). */
function Electrode({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.vElectrode;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.band} /></Animated.View>;
}
/** The grey cloth over the generator: pulled up and off, gathered on his arm, dropped on the chair. */
function Cover({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.cover;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { scale: v.s }] };
  });
  return (
    <Animated.View nativeID="m1-cover" style={[styles.rider, st]}>
      <View style={styles.coverAt}><LessonPicture name="milgram1-cover" /></View>
    </Animated.View>
  );
}
/** Switch one thrown down, its lamp lit; the sample lamp; the called switches (Q2). World x. */
function Switches({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <SwitchLamp S={S} k={1} />
      <SwitchLamp S={S} k={3} />
      {CALLS.map((c) => <SwitchLamp key={c.id} S={S} k={c.k} />)}
    </>
  );
}
function SwitchLamp({ S, k }: { S: SharedValue<any>; k: number }) {
  const x = SW(k);
  const lamp = useAnimatedStyle(() => {
    const v = S.value;
    let lit = 0;
    if (k === 1) lit = v.first;
    if (k === 3) lit = v.sampleLamp;
    if (k === 10) lit = v.r150 > 0 && v.r150 < 0.6 ? (Math.sin(v.r150 * 60) > 0 ? 1 : 0) : 0;
    if (k === 20) lit = v.r300 > 0 && v.r300 < 0.6 ? (Math.sin(v.r300 * 60) > 0 ? 1 : 0) : 0;
    if (k === 30) lit = v.r450 > 0.1 ? 1 : 0;
    return { opacity: lit };
  });
  const down = useAnimatedStyle(() => {
    const v = S.value;
    let d = 0;
    if (k === 1) d = v.first;
    if (k === 10) d = v.r150 > 0 && v.r150 < 0.7 ? 1 : 0;
    if (k === 20) d = v.r300 > 0 && v.r300 < 0.7 ? 1 : 0;
    if (k === 30) d = v.r450 > 0.05 ? 1 : 0;
    return { opacity: d };
  });
  return (
    <>
      <Animated.View style={[styles.lampLit, { left: x - 1.6, top: LAMP_Y - 1.9 }, lamp]} />
      <Animated.View style={[styles.switchDown, { left: x - 1.8, top: SW_Y - 1.8 }, down]}>
        <View style={styles.batDown} />
      </Animated.View>
    </>
  );
}
/** Q2's reaction: the lamps light one by one along the row to the switch the reader called. World x. */
const LAMPS = Array.from({ length: 30 }, (_, k) => k + 1);
function LampRun({ S }: { S: SharedValue<any> }) {
  return <>{LAMPS.map((k) => <RunLamp key={k} S={S} k={k} />)}</>;
}
function RunLamp({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.runTo >= k - 0.01 ? S.value.runO : 0 }));
  return <Animated.View style={[styles.lampLit, { left: SW(k) - 1.6, top: LAMP_Y - 1.9 }, st]} />;
}
/** The answer box on top of the generator: four lamps, the fourth lights for LAMP. World x. */
function AnswerBox({ S }: { S: SharedValue<any> }) {
  const lit = useAnimatedStyle(() => ({ opacity: S.value.lampLit }));
  const card = useAnimatedStyle(() => ({ opacity: S.value.card.onTable }));
  return (
    <>
      <View style={styles.answerBox} />
      {ANSWER.map((x, k) => <View key={k} style={[styles.answerLamp, { left: x - 2.6 }]} />)}
      <Animated.View style={[styles.answerLamp, styles.answerLit, { left: ANSWER[3] - 2.6 }, lit]} />
      <Animated.View style={[styles.cardFlat, card]} />
    </>
  );
}
/** The word card in the volunteer's hand. */
function Card({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.card;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }] };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.card} />
      <View style={[styles.cardLine, { top: -3 }]} />
      <View style={[styles.cardLine, { top: 0 }]} />
    </Animated.View>
  );
}
/** Milgram's pencil. */
function Pencil({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.pencil;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }] };
  });
  return <Animated.View style={[styles.rider, st]}><View style={styles.pencil} /><View style={styles.pencilTip} /></Animated.View>;
}
/** The note torn off the clipboard and stuck to the glass: 1 IN 1,000. */
function Note({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.note;
    return { opacity: v.o, transform: [{ translateX: v.x }, { translateY: v.y }, { rotate: `${v.rot}deg` }, { scale: v.s }] };
  });
  return (
    <Animated.View nativeID="m1-note" style={[styles.rider, st]}>
      <View style={styles.note}>
        <Text style={styles.noteText}>1 IN 1,000</Text>
      </View>
    </Animated.View>
  );
}

// ── the plates ───────────────────────────────────────────────────────────────

/** The group under the volunteer's finger, read out above the generator (b13). */
function LabelPlate({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.labelO }));
  return (
    <Animated.View style={[styles.world, fade]} pointerEvents="none">
      <View style={styles.labelPlate}>
        {GROUPS.map((g, k) => <GroupWord key={k} S={S} k={k} word={g} />)}
      </View>
    </Animated.View>
  );
}
function GroupWord({ S, k, word }: { S: SharedValue<any>; k: number; word: string }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.group === k ? 1 : 0 }));
  return <Animated.Text style={[styles.labelText, k >= 6 ? styles.danger : null, st]}>{word}</Animated.Text>;
}
/** The four answers over the answer box: SKY · INK · BOX · LAMP, the lit one struck amber. */
function WordPlate({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.words }));
  const lit = useAnimatedStyle(() => ({ opacity: S.value.lampLit }));
  return (
    <Animated.View style={[styles.world, fade]} pointerEvents="none">
      <View style={styles.wordPlate}>
        <Animated.View style={[styles.wordLit, lit]} />
        {ANSWER_WORDS.map((w, k) => <Text key={w} style={[styles.wordText, { width: WORD_W[k] }]}>{w}</Text>)}
      </View>
    </Animated.View>
  );
}
/** Q1: the words on each pair of slips, over the hat table. */
function PairPlates({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[styles.world, fade]} pointerEvents="none">
      {PAIRS.map((p) => (
        <View key={p.id} style={[styles.plate, { left: p.x - 24 - 640, top: 354, width: 48, height: 30 }]}>
          <Text style={styles.plateText}>{p.a}</Text>
          <Text style={styles.plateText}>{p.b}</Text>
        </View>
      ))}
    </Animated.View>
  );
}
/** Q2: the three voltages, on the table's apron under their switches. */
function CallPlates({ S }: { S: SharedValue<any> }) {
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[styles.world, fade]} pointerEvents="none">
      {CALLS.map((c) => (
        <View key={c.id} style={[styles.plate, { left: SW(c.k) - 16 - 810, top: 472, width: 32, height: 14 }]}>
          <Text style={[styles.plateText, { width: 30 }]}>{c.label}</Text>
        </View>
      ))}
    </Animated.View>
  );
}
/** The veil over a cut, and the lights going down at the end. */
function Veil({ S, k }: { S: SharedValue<any>; k: 'veil' | 'dim' }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return <Animated.View style={[styles.veil, st]} pointerEvents="none" />;
}

type Q = { id: string; left: number; top: number; w: number; h: number; r: number; correct: boolean };
/** RIG THE HAT: each box covers a pair of slips and its plate; the seal lands in the air above it. */
const PAIR_Q: Q[] = PAIRS.map((p) => ({ id: p.id, left: p.x - 24 - 640, top: 322, w: 48, h: 144, r: 5, correct: p.id === 'tt' }));
/** CALL THE SWITCH: each box covers a switch, its lamp and its voltage plate (screen x, the generator shot). */
const CALL_Q: Q[] = CALLS.map((c) => ({ id: c.id, left: SW(c.k) - 17 - 810, top: 380, w: 34, h: 108, r: 5, correct: c.id === 'v450' }));
function StageTargets({ picked, onPick, live, S, qs, k }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>; qs: Q[]; k: 'q1' | 'q2';
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value[k] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {qs.map((q) => (
        <Target
          key={q.id} id={q.id} nativeID={`m1-q-${q.id}`} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
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
  veil: { position: 'absolute', left: 0, top: 214, width: STAGE_W, height: 300, backgroundColor: W.milgram1Dim.base },
  windowClip: { position: 'absolute', left: 180, top: 300, width: 72, height: 124, overflow: 'hidden' },
  leaf: { position: 'absolute', left: -2.6, top: -1.6, width: 5.2, height: 3.2, borderRadius: 1.6, backgroundColor: W.milgram1Leaf.base, borderWidth: 0.4, borderColor: W.milgram1Leaf.shade },
  leafY: { backgroundColor: W.milgram1LeafY.base, borderColor: W.milgram1LeafY.shade },
  hand: { position: 'absolute', borderRadius: 0.8, backgroundColor: W.milgram1Hand.base },
  secHand: { position: 'absolute', left: -0.35, width: 0.7, backgroundColor: W.milgram1Lamp.shade },
  spokeA: { position: 'absolute', left: -4, top: -0.6, width: 8, height: 1.2, backgroundColor: W.milgram1Chrome.shade },
  spokeB: { position: 'absolute', left: -0.6, top: -4, width: 1.2, height: 8, backgroundColor: W.milgram1Chrome.shade },
  chalkClip: { position: 'absolute', left: 46, height: 14, overflow: 'hidden' },
  chalkText: { width: 52, fontFamily: 'Caveat_700Bold', fontSize: 11, lineHeight: 14, color: W.milgram1Chalk.base, textAlign: 'center', includeFontPadding: false },
  mugBody: { position: 'absolute', left: -4, top: -10, width: 8, height: 10, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: W.milgram1Mug.base, borderWidth: 0.7, borderColor: INK },
  mugCoffee: { position: 'absolute', left: -3.2, top: -9.4, width: 6.4, height: 1.6, borderRadius: 0.8, backgroundColor: W.milgram1Coffee.base },
  mugHandle: { position: 'absolute', left: 2.6, top: -8, width: 4.4, height: 5, borderRadius: 2.2, borderWidth: 1.2, borderColor: W.milgram1Mug.shade },
  steam: { position: 'absolute', left: -1.6, top: -2, width: 3.2, height: 4, borderRadius: 1.6, backgroundColor: W.milgram1Steam.base },
  advert: {
    position: 'absolute', left: -24, top: -19, width: 48, height: 38, backgroundColor: W.milgram1Paper.base, borderWidth: 0.7, borderColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  advertText: { width: 46, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, color: INK, textAlign: 'center', includeFontPadding: false },
  pin: { position: 'absolute', left: -1.6, top: -20.6, width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: W.milgram1Lamp.shade },
  bill: { position: 'absolute', left: -6, top: -2.6, width: 12, height: 5.2, borderRadius: 0.6, backgroundColor: W.milgram1Dollar.base, borderWidth: 0.5, borderColor: W.milgram1Dollar.shade },
  quarter: { position: 'absolute', left: -2, top: -2, width: 4, height: 4, borderRadius: 2, backgroundColor: W.milgram1Quarter.base, borderWidth: 0.5, borderColor: W.milgram1Quarter.shade },
  slip: { position: 'absolute', left: -6, top: -4, width: 12, height: 8, borderRadius: 0.6, backgroundColor: W.milgram1Paper.base, borderWidth: 0.5, borderColor: INK },
  slipLine: { position: 'absolute', left: -4, top: -0.5, width: 8, height: 1, backgroundColor: W.milgram1Paper.shade },
  slipFlat: { position: 'absolute', top: -3, width: 8, height: 3, borderRadius: 0.5, backgroundColor: W.milgram1Paper.base, borderWidth: 0.4, borderColor: INK },
  jar: { position: 'absolute', left: -3, top: -6, width: 6, height: 7, borderRadius: 1.4, backgroundColor: W.milgram1Paste.base, borderWidth: 0.6, borderColor: INK },
  jarLid: { position: 'absolute', left: -3.4, top: -7.4, width: 6.8, height: 2, borderRadius: 0.6, backgroundColor: W.milgram1Chrome.shade },
  strap: { position: 'absolute', left: -2, top: -4, width: 4, height: 8, borderRadius: 1, backgroundColor: W.milgram1Strap.base, borderWidth: 0.5, borderColor: INK },
  buckle: { position: 'absolute', left: -1.6, top: -1.4, width: 3.2, height: 2.8, borderWidth: 0.7, borderColor: W.milgram1Chrome.shade },
  electrode: { position: 'absolute', left: 2, top: -1.5, width: 3, height: 3, borderRadius: 1.5, backgroundColor: W.milgram1Chrome.base, borderWidth: 0.4, borderColor: INK },
  band: { position: 'absolute', left: -2.4, top: -2.6, width: 4.8, height: 5.2, borderRadius: 1.2, backgroundColor: W.milgram1Strap.base, borderWidth: 0.5, borderColor: INK },
  coverAt: { position: 'absolute', left: -922, top: -444, width: 0, height: 0 },
  lampLit: { position: 'absolute', width: 3.2, height: 3.2, borderRadius: 0.6, backgroundColor: W.milgram1Lamp.base, borderWidth: 0.4, borderColor: INK },
  switchDown: { position: 'absolute', width: 3.6, height: 3.6, borderRadius: 1.8, backgroundColor: W.milgram1Chrome.shade },
  batDown: { position: 'absolute', left: 1.25, top: 1.8, width: 1.1, height: 4.4, borderRadius: 0.5, backgroundColor: W.milgram1Chrome.base, borderWidth: 0.25, borderColor: INK },
  answerBox: { position: 'absolute', left: 922, top: 412, width: 60, height: 9, borderRadius: 1.4, backgroundColor: W.milgram1Cable.base, borderWidth: 0.6, borderColor: INK },
  answerLamp: { position: 'absolute', top: 413.6, width: 5.2, height: 5.2, borderRadius: 2.6, backgroundColor: W.milgram1LampOff.base, borderWidth: 0.4, borderColor: INK },
  answerLit: { backgroundColor: W.milgram1Amber.base },
  cardFlat: { position: 'absolute', left: 848, top: 463.6, width: 10, height: 2.4, backgroundColor: W.milgram1Paper.base, borderWidth: 0.4, borderColor: INK },
  card: { position: 'absolute', left: -5, top: -6, width: 10, height: 12, borderRadius: 0.6, backgroundColor: W.milgram1Paper.base, borderWidth: 0.5, borderColor: INK },
  cardLine: { position: 'absolute', left: -3.4, width: 6.8, height: 0.8, backgroundColor: W.milgram1Paper.shade },
  pencil: { position: 'absolute', left: -0.8, top: -9, width: 1.6, height: 9, backgroundColor: W.milgram1Note.shade, borderWidth: 0.3, borderColor: INK },
  pencilTip: { position: 'absolute', left: -0.5, top: -10.6, width: 1, height: 1.8, backgroundColor: W.milgram1Hand.base },
  note: { position: 'absolute', left: -25, top: -7.5, width: 50, height: 15, backgroundColor: W.milgram1Note.base, borderWidth: 0.6, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  noteText: { width: 48, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, textAlign: 'center', includeFontPadding: false },
  plugAt: { position: 'absolute', left: PLUG.x, top: PLUG.y, width: 0, height: 0 },
  plug: { position: 'absolute', left: -1, top: -2.6, width: 6, height: 4.4, borderRadius: 1, backgroundColor: W.milgram1Cable.base },
  prongA: { position: 'absolute', left: 5, top: -2, width: 3, height: 0.9, backgroundColor: W.milgram1Chrome.base },
  prongB: { position: 'absolute', left: 5, top: 0, width: 3, height: 0.9, backgroundColor: W.milgram1Chrome.base },
  labelPlate: {
    position: 'absolute', left: 863 - 810, top: 376, width: 118, height: 16, backgroundColor: W.milgram1Paper.base, borderRadius: 3, borderWidth: 1, borderColor: INK,
    boxShadow: lipOf(TONE),
  },
  labelText: { position: 'absolute', left: 0, top: 3, width: 116, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, textAlign: 'center', includeFontPadding: false },
  danger: { color: W.milgram1Lamp.shade },
  wordPlate: {
    position: 'absolute', left: 900 - 810, top: 376, width: 104, height: 16, flexDirection: 'row', backgroundColor: W.milgram1Paper.base, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  wordLit: { position: 'absolute', left: 70.5, top: 1, width: 30, height: 12, borderRadius: 2, backgroundColor: W.milgram1Amber.base },
  wordText: { paddingTop: 3, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, textAlign: 'center', includeFontPadding: false },
  plate: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: W.milgram1Paper.base, borderRadius: 3,
    borderWidth: 1, borderColor: INK, boxShadow: lipOf(TONE),
  },
  plateText: { width: 46, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, color: INK, includeFontPadding: false, textAlign: 'center' },
  clear: { flexGrow: 1 },
  deskShadow: { position: 'absolute', left: 140, top: 498, width: 122, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  cabinetShadow: { position: 'absolute', left: 288, top: 498, width: 50, height: 3.6, borderRadius: 1.8, backgroundColor: SHADE, opacity: 0.4 },
  chairShadow: { position: 'absolute', left: 474, top: 498, width: 58, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  hatTableShadow: { position: 'absolute', left: 682, top: 498, width: 128, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
  genTableShadow: { position: 'absolute', left: 842, top: 498, width: 154, height: 4, borderRadius: 2, backgroundColor: SHADE, opacity: 0.4 },
});

// OWN CAMERA: targets checked in shot 2026-10-09 — RIG THE HAT (the three pairs of slips and their
// plates over the hat table, in the lab shot) and CALL THE SWITCH (the 150, 300 and 450 volt switches
// and their plates, in the generator shot) read whole, answered right and wrong, on the m1dbg / m1wrong sheets.
export function Milgram1Lesson({ lesson }: { lesson: Lesson }) {
  return (
    <CinematicPlayer
      lesson={lesson} beats={BEATS} Scene={Milgram1Scene} band={[214, 514]}
      roles={{
        plain: { head: MILGRAM_DESK_HEAD, label: 'Stanley Milgram' },
        tophat: { head: EXPERIMENTER_HEAD, label: 'The experimenter' },
        cap: { head: VOLUNTEER_HEAD, label: 'The volunteer' },
      }}
    />
  );
}
