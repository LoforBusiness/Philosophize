import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { BEATS } from './hist5Script';
import {
  WALK, U, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs, seated,
  type Bundle, type Stance,
} from './rig';
import {
  K_FIG, STAGE_W, STAGE_H, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, klepsydraPot, clockBlock, ballotUrn, woodUrn, ballotDisc, bedsideLamp,
} from './objects';
import { BY_ID } from './wardrobe';
import {
  FLOOR, SKY, TIERS, BED, BED_TOP, NIGHTSTAND, alarmClock, DOOR_SHUT, DOOR_FACE, DOOR_HINGE,
  DOOR_LIGHT, DUVET, DUVET_RIGHT, type Part,
} from './hist5Set';
import PlateArt from './PlateArt';

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-5, "On Trial in Athens" — A BEDROOM, AND THE LAW COURT IT OPENS
// INTO.
//
// A DIALOGUE lesson (group AP) told as a SCENE (group AT): the cap wakes in his own
// bedroom, gets up, opens the door, and steps out into an Athenian law court — his
// room is standing in it — where the plain one prosecutes him before a jury. The
// camera starts close on the room and pulls back to show the court.
//
// AT2: silent extras: the jury, and the magistrate on his dais. Twenty-five of them,
// seated on three tiers each side, every one doing his own thing on every beat and
// reacting to the crowd's sounds in his own way. None speaks.
//
//   b0   he lies asleep, sits up in bed, stretches, and leans to his alarm clock.
//   b1   he looks at his lamp, up at his poster, down at his hands, and toward the door.
//   b2   he throws the duvet back, sits on the edge, stands, walks to the door and takes
//        the handle as he calls through it.
//   b3   the door swings out; he steps through into the court and the camera pulls back
//        to the whole hall. The plain one, centre, throws up his arms. The jury laughs.
//   b4   his hands come up, open; he looks down at himself.
//   b5   the plain one paces in front of him, hands behind his back.
//   b6   the plain one points along the left benches, then the right; the camera goes too.
//   b7   he looks along the benches himself, left and right, over the whole hall.
//   b8   the plain one walks right up to him and leans in.
//   b9   Q1, said as a reply (AT4); b10/b11 his reply, palm up; b12 the plain one
//        straightens, sour, and walks back (murmur) · b13 laughs and points (laughter).
//   b14  the plain one walks to the water clock and pulls its plug; water runs.
//   b15  he points to the clock. b16 the plain one walks back and folds his arms.
//   b17  Q2; b18–b21 as b10–b13.
//   b22  he turns to the jurors on the left, then the whole hall, hands open. The clock dries.
//   b23  the plain one holds up two discs at the urn; the jurors raise their hands; the
//        votes clatter in.
//   b24–26  the verdict (AT5): the plain one reads the urn — slumps (free), throws up his
//        hands (a tie) or rejoices (guilty) — and the jury cheers or gasps.
//   b27  he walks back into his room, sits on the bed and lies down; the camera goes in.
//   b28  asleep, under the quotation.
//
// THE WORLD (hist5Set.ts), in its own units: the floor y 470, his room x 108–412, the
// court from 412 to 1262 under a colonnade with the Acropolis framed in its middle bay.
// He stands as defendant at x 652; the plain one's mark is 760, in front of the dais.
// The bronze urn is at 812, the wooden one 840, the water clock 888. The left stand
// (416–612) and the right (922–1262) seat the jury on ledges at 446, 352 and 258,
// spaced 60 apart and staggered row on row so no two figures touch.
//
// THE CAMERA is the scene's own: the world is drawn in one layer, translated and scaled
// so a world point F lands at the band's centre (200, 343) at zoom z. Its shots are
// held in CAM_KEYS per act and carried across a tap like any other track (group L),
// zoom eased in log so a pull-back looks even.
//
// Band [170, 516]: the whole band, which the camera fills; the floor sits on 470–516.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('history');
const TR = 0.85;
/** The cap and the plain one: a man is 98 world units tall. */
const K = K_FIG * 0.95;
/** A juror's size against the leads': a little smaller, as men further back. */
const JK = 0.8;

/**
 * Seconds each beat's line runs (lib/narration/manifest.ts, history-foundations-5); 0
 * for a beat with no voice. A beat whose voice waits (`voiceAfter`) is paced over the
 * wait and the line together, in SPAN; the last beat walks him home to bed, so it is
 * paced over the walk.
 */
const LINES = [4.25, 5.93, 3.34, 4.41, 5.29, 6.61, 6.94, 3.36, 4.04, 0, 4.91, 3.93, 4.02, 4.85, 6.31, 3.26, 3.68, 0, 3.89, 3.5, 3.14, 4.62, 4.66, 6.83, 3.69, 5.52, 4.99, 3.24, 0, 0];
const VA = BEATS.map((b) => b.voiceAfter ?? 0);
const ACTS = ['wake', 'room', 'door', 'open', 'what', 'charge', 'jury', 'straws', 'why', 'ask', 'reply', 'sour', 'gloat',
  'clock', 'asks', 'prove', 'defend', 'vote', 'verdict', 'sleep', 'rest', 'summary'] as const;
type Act = (typeof ACTS)[number];
const A = Object.fromEntries(ACTS.map((a, i) => [a, i])) as Record<Act, number>;
const ACT = BEATS.map((b) => A[(b.act ?? (b.summary ? 'summary' : 'ask')) as Act]);
const SPAN = BEATS.map((_, n) => Math.max(VA[n] + lineOf(LINES, n), ACT[n] === A.sleep ? 12 : 0));
/** When a beat's line has been said and its after-sound starts (CinematicPlayer's TAIL_AFTER_S). */
const TAIL = BEATS.map((_, n) => VA[n] + (LINES[n] || 0) + 0.3);
const ASK2 = BEATS.findIndex((b) => b.fair);
const LATE = BEATS.map((_, n) => (n > ASK2 ? 1 : 0));
const VERDICT = BEATS.map((b) => (b.verdict === 'free' ? 1 : b.verdict === 'tie' ? 2 : b.verdict === 'guilty' ? 3 : 0));
const CAP_TALKS = BEATS.map((b) => (b.speaker === 'cap' ? 1 : 0));
const cueAt = (id: string) => BEATS.map((b, n) => {
  const c = b.sfx?.find((q) => q.id === id);
  if (!c) return -1;
  return c.at === 'tail' ? TAIL[n] : c.at === 'lead' ? 0 : c.at;
});
const LAUGH_AT = cueAt('laugh');
const MURMUR_AT = cueAt('murmur');
const CHEER_AT = cueAt('cheer');
const GASP_AT = cueAt('gasp');
const VOTES_AT = cueAt('discs');
const POUR_AT = cueAt('pour');
const DRIP_AT = cueAt('drip');
const POUR_N = POUR_AT.findIndex((v) => v >= 0);
const DRIP_N = DRIP_AT.findIndex((v) => v >= 0);

// ── the camera ───────────────────────────────────────────────────────────────
const CX = 200;
const CY = 343;
/** A shot: the world point at the centre, and the zoom. `g` is where the floor lands on the stage. */
const shot = (x: number, z: number, g: number) => [x, FLOOR - (g - CY) / z, Math.log(z)];
const ROOM = [262, 350, Math.log(1.3)];
const WIDE = shot(800, 0.44, 470);
const TALK_S = shot(700, 0.95, 480);
const CLOSE = shot(668, 1.25, 490);
const LEFTJ = shot(540, 0.8, 470);
const RIGHTJ = shot(1090, 0.72, 470);
const CLOCK_S = shot(770, 0.9, 480);
const VOTE_S = shot(830, 0.62, 470);
const OUT = shot(500, 1.0, 480);
const BACK = shot(450, 0.9, 480);
const kf = (f: number, s: number[]) => [f, s[0], s[1], s[2]];
const CAM_KEYS: Record<number, number[][]> = {
  [A.wake]: [kf(0, ROOM)],
  [A.room]: [kf(0, ROOM)],
  [A.door]: [kf(0, ROOM)],
  [A.open]: [kf(0, ROOM), kf(0.22, ROOM), kf(0.36, OUT), kf(0.62, WIDE)],
  [A.what]: [kf(0, TALK_S)],
  [A.charge]: [kf(0, TALK_S)],
  [A.jury]: [kf(0, TALK_S), kf(0.2, LEFTJ), kf(0.46, LEFTJ), kf(0.6, RIGHTJ), kf(0.84, RIGHTJ), kf(1, WIDE)],
  [A.straws]: [kf(0, WIDE)],
  [A.why]: [kf(0, TALK_S), kf(0.5, CLOSE)],
  [A.ask]: [kf(0, CLOSE)],
  [A.reply]: [kf(0, CLOSE)],
  [A.sour]: [kf(0, CLOSE), kf(0.5, TALK_S)],
  [A.gloat]: [kf(0, CLOSE), kf(0.7, TALK_S)],
  [A.clock]: [kf(0, TALK_S), kf(0.3, CLOCK_S)],
  [A.asks]: [kf(0, CLOCK_S)],
  [A.prove]: [kf(0, CLOCK_S), kf(0.4, TALK_S)],
  [A.defend]: [kf(0, TALK_S), kf(0.12, LEFTJ), kf(0.42, LEFTJ), kf(0.56, WIDE)],
  [A.vote]: [kf(0, TALK_S), kf(0.25, VOTE_S)],
  [A.verdict]: [kf(0, VOTE_S), kf(0.45, TALK_S)],
  [A.sleep]: [kf(0, TALK_S), kf(0.12, BACK), kf(0.46, ROOM)],
  [A.rest]: [kf(0, ROOM)],
  [A.summary]: [kf(0, ROOM)],
};
/** Late in the lesson the asks and replies are at a distance, not leaning in. */
const CAMS = BEATS.map((_, n) => {
  const a = ACT[n];
  if (LATE[n] && (a === A.ask || a === A.reply || a === A.sour || a === A.gloat)) return [kf(0, TALK_S)];
  return CAM_KEYS[a] ?? [kf(0, TALK_S)];
});

// ── the cap: where he walks, which way he faces, and how he is in bed ────────
type Track = readonly (readonly number[])[];
/** His mark as defendant. */
const DOCK = 652;
/**
 * Where his pelvis is in bed, and on the bed's edge: the same x, so getting in and
 * out of bed never slides him along the mattress. Lying, his head reaches the pillow
 * (x 168); sitting up, his feet reach x 249 under the duvet; on the edge, his feet are
 * on the floor in front of the bed.
 */
const SIT_X = 216;
const C_LEGS: Track[] = BEATS.map((_, n) => {
  const a = ACT[n];
  if (a === A.door) return [[0.235, 372]];
  if (a === A.open) return [[0.18, 470], [0.32, DOCK]];
  if (a === A.sleep) return [[0.02, SIT_X]];
  return [];
});

// ── in bed: three stances, all with the pelvis at SIT_X ─────────────────────
// Lying is the sitting-up stance with the torso laid back flat (tilt ≈ π/2, which in
// the rig is BACKWARD) and the chin tucked so the head rests on the pillow, not under
// it. Sitting up is that torso rising while the legs stay flat under the duvet. On
// the edge is `seated` at the mattress's own height, so swinging the legs off the bed
// is only the knees bending down over it, and standing up is the rise from a chair.
/** Sitting up in bed, legs straight out under the duvet, hands on the lap. */
const BED_SIT: Stance = {
  tilt: 0.06, neck: -0.04, bob: 3 - U.standH,
  footL: { x: 33, y: 0 }, footR: { x: 35, y: 0 },
  fistL: { x: 12, y: -3 }, fistR: { x: 15, y: -2 }, adv: 0,
};
/** Lying on his back, head on the pillow, hands resting on his chest. */
const BED_LIE: Stance = {
  ...BED_SIT, tilt: 1.5, neck: -0.55,
  fistL: { x: -9, y: -6 }, fistR: { x: -5, y: -5 },
};
/** Where his hands push on the mattress beside his hips (sitting up, swinging round). */
const PUSH_L = { x: -7, y: 2 };
const PUSH_R = { x: -3, y: 3 };
/** His hands on his knees as he rises from the edge, or sits down on it. */
const KNEES_L = { x: 13, y: 3 };
const KNEES_R = { x: 16, y: 4 };
const C_TURN: Track[] = BEATS.map((_, n) => {
  const a = ACT[n];
  if (a === A.straws) return [[0, 1], [0.06, -1], [0.46, 1]];
  if (a === A.defend) return [[0, 1], [0.06, -1], [0.48, 1]];
  if (a === A.sleep) return [[0, -1], [0.69, 1]];
  return [[0, 1]];
});

// ── the plain one ────────────────────────────────────────────────────────────
const MARK = 760;
const P_LEGS: Track[] = BEATS.map((_, n) => {
  const a = ACT[n];
  if (a === A.charge) return [[0.05, 700], [0.4, 820], [0.75, MARK]];
  if (a === A.why) return [[0.05, 690]];
  if (a === A.sour && !LATE[n]) return [[0.36, MARK]];
  if (a === A.gloat && !LATE[n]) return [[0.74, MARK]];
  if (a === A.clock) return [[0.05, 856]];
  if (a === A.prove) return [[0.08, MARK]];
  if (a === A.vote) return [[0.05, 790]];
  return [];
});
const P_TURN: Track[] = BEATS.map((_, n) => {
  const a = ACT[n];
  if (a === A.charge) return [[0, -1], [0.38, 1], [0.73, -1]];
  if (a === A.jury) return [[0, -1], [0.5, 1], [0.84, -1]];
  if (a === A.sour && !LATE[n]) return [[0, -1], [0.3, 1], [0.86, -1]];
  if (a === A.gloat && !LATE[n]) return [[0, -1], [0.72, 1], [0.95, -1]];
  if (a === A.clock) return [[0, 1]];
  if (a === A.asks) return [[0, 1], [0.45, -1]];
  if (a === A.vote) return [[0, 1]];
  if (a === A.verdict) return [[0, 1], [0.4, -1]];
  return [[0, -1]];
});
// held poses (moves.ts act + 99): talking, nodding along, arms folded, hands behind the back
const TALK = 167;
const NOD = 263;
const FOLD = 161;
const BEHIND = 162;
const P_CODE = BEATS.map((_, n) => {
  const a = ACT[n];
  if (a === A.charge) return BEHIND;
  if (a === A.prove || a === A.defend || (LATE[n] && (a === A.ask || a === A.reply))) return FOLD;
  if (CAP_TALKS[n] || a === A.ask || a === A.rest || a === A.summary) return NOD;
  return TALK;
});
const C_CODE = BEATS.map((_, n) => (CAP_TALKS[n] ? TALK : NOD));

// ── the jury ─────────────────────────────────────────────────────────────────
type Juror = { x: number; g: number; k: number; dir: number; i: number; ph: number; amp: number; style: number };
/** Spaced 60 apart and staggered row on row, so every head stands clear of its neighbours'. */
const ROWS: [number, number[], number][] = [
  [TIERS[2], [446, 506, 566], 1], [TIERS[1], [466, 526, 586], 1], [TIERS[0], [446, 506, 566], 1],
  [TIERS[2], [962, 1024, 1086, 1148, 1210], -1], [TIERS[1], [993, 1055, 1117, 1179, 1241], -1],
  [TIERS[0], [962, 1024, 1086, 1148, 1210], -1],
];
/** Back rows first, so a man in front is drawn over the bench behind him. */
const JURORS: Juror[] = [
  // the magistrate, presiding from the dais: an extra like the rest
  { x: 768, g: 350, k: K_FIG * 0.88, dir: -1, i: 0, ph: 0.4, amp: 0.3, style: 0 },
  ...ROWS.flatMap(([g, xs, dir], r) => xs.map((x, c) => ({ x, g, dir, r, c }))).map(({ x, g, dir, r, c }, m) => {
    const i = m + 1;
    return {
      x, g, dir, i,
      k: K_FIG * JK * (0.92 + ((i * 37) % 5) * 0.04),
      ph: (i * 0.37 + r * 0.11 + c * 0.23) % 1,
      // how much each laughs, cheers and gasps: some a lot, a few not at all
      amp: [1, 0.55, 1.15, 0, 0.85, 0.7, 1.25, 0.15, 0.9][i % 9],
      style: (i * 7 + r) % 3,
    };
  }),
];
const ACTIVITIES = 12;

// ── the props, in world units ────────────────────────────────────────────────
const BLOCK_ART = clockBlock(888, 444, 36, 52);
const POT = { x: 888, y: 403, w: 40, h: 30 };
const POT_ART = klepsydraPot(POT.x, POT.y, POT.w, POT.h);
const SPOUT = { x: POT.x - POT.w / 2 + (19 / 60) * POT.w, y: POT.y - POT.h / 2 + (41.6 / 44) * POT.h };
const LOW_ART = klepsydraPot(SPOUT.x, FLOOR - 11, 30, 22);
const LOW_MOUTH = FLOOR - 20;
const URN = { x: 812, h: 36 };
const URN_ART = ballotUrn(URN.x, FLOOR - URN.h / 2, 26, URN.h);
const URN_MOUTH = { x: URN.x, y: FLOOR - URN.h + 2 };
const WOOD_ART = woodUrn(840, FLOOR - 13, 20, 26);
const DISC_ART = ballotDisc(0, 0, 8, 8);
const VOTE_DISC_ART = ballotDisc(0, 0, 6, 6);
const LAMP_ART = bedsideLamp(324, 404, 24, 36);
const CLOCK_ART = alarmClock(342, 422) as unknown as Part[];

// ── helpers, each a worklet declared before anything that calls it ───────────
function keyAt(keys: readonly (readonly number[])[], f: number, c: number): number {
  'worklet';
  if (f <= keys[0][0]) return keys[0][c];
  for (let i = 1; i < keys.length; i += 1) {
    if (f < keys[i][0]) {
      const a = keys[i - 1];
      const z = keys[i];
      const u = (f - a[0]) / (z[0] - a[0]);
      return a[c] + (z[c] - a[c]) * (u * u * (3 - 2 * u));
    }
  }
  return keys[keys.length - 1][c];
}
/** A crowd's reaction to a sound that starts at `at`: up quickly, held, and let go. */
function react(b: number, at: number, hold: number): number {
  'worklet';
  if (at < 0 || b < at) return 0;
  const u = b - at;
  return clamp01(u / 0.35) * (1 - clamp01((u - hold) / 0.9));
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
/** A hand, aimed at an offset from the feet in figure units: `a` forward, `b` up. */
function handAt(s: Stance, x: number, g: number, kk: number, dir: number, which: 1 | -1, a: number, b: number, w: number): Stance {
  'worklet';
  return w <= 0.001 ? s : reachHandTo(s, { x, groundY: g, k: kk, dir: dir < 0 ? -1 : 1 }, which, x + dir * a * kk, g - b * kk, w);
}
/** A body leant (+ forward) and a head tipped (+ down). */
function leanOf(s: Stance, tilt: number, neck: number): Stance {
  'worklet';
  // The rig's tilt is NEGATIVE forward and its neck POSITIVE up, so both are flipped.
  // The hands are pelvis-relative, so a lean that left them where they were would put
  // them behind a torso that has moved forward (AR4). Arms hang from the shoulders, so
  // the hands go where the shoulders go: by the chest's own displacement.
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
/** A point part of the way to another. */
function lerpP(p: { x: number; y: number }, q: { x: number; y: number }, w: number) {
  'worklet';
  return { x: p.x + (q.x - p.x) * w, y: p.y + (q.y - p.y) * w };
}
/** Where a figure stands at time `b`, walking its legs in turn, starting where it is on screen. */
function legsOf(src: number, legs: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let free = 0;
  let x = src;
  let x0 = src;
  let x1 = src;
  let u = 1;
  for (let i = 0; i < legs.length; i += 1) {
    const to = legs[i][1];
    const d = Math.abs(to - from);
    const dur = d > 1 ? moveTr(from, to, TR) : 0;
    const start = Math.max(legs[i][0] * L, free);
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
/** Which way a figure faces at time `b`, turning through a profile. */
function faceOf(src: number, turns: Track, b: number, L: number) {
  'worklet';
  let from = src;
  let d = src;
  for (let i = 0; i < turns.length; i += 1) {
    const at = turns[i][0] * L;
    if (b < at) break;
    d = facing(from, turns[i][1], b - at);
    from = turns[i][1];
  }
  return d;
}
function bodyOf(w: ReturnType<typeof legsOf>, code: number, t: number, b: number): Stance {
  'worklet';
  return w.walking ? travelStance(w.x0, w.x1, hHold(code, t), hHold(code, t), hLive(code, t, b), w.u, WALK, 0) : hLive(code, t, b);
}
function wristOf(w: Bundle, kk: 'wrR' | 'wrL') {
  'worklet';
  const v = w[kk];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
function pelOf(w: Bundle) {
  'worklet';
  const v = w.pel;
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/**
 * A juror on his bench. Between the sounds he gets on with his own business, one thing
 * a beat, at his own moment in it — chin in hand, arms folded, leaning in, whispering,
 * scratching his head, hands on his knees, sitting back, nodding off, counting on his
 * fingers, chin up, pointing, nodding — chosen so no two neighbours match (N21: a
 * listener is never frozen; AR5: a stroke at most twice). The crowd's sounds move him
 * too, each in his own way and by his own amount.
 */
function jurorOf(j: Juror, n: number, f: number, t: number, laugh: number, murmur: number, cheer: number, gasp: number, raise: number, op = 1): Bundle {
  'worklet';
  let s = postureStill(4, t * 0.9 + j.ph * 3);
  const kk = j.k;
  const H = (st: Stance, which: 1 | -1, a: number, b: number, w: number) => {
    'worklet';
    return handAt(st, j.x, j.g, kk, j.dir, which, a, b, w);
  };
  const a0 = 0.06 + j.ph * 0.34;
  const u = clamp01((f - a0) / 0.1) * (1 - clamp01((f - a0 - 0.42) / 0.14));
  const act = (j.i * 5 + n * 7 + (j.i >> 1)) % ACTIVITIES;
  if (act === 0) { s = H(s, 1, 16, 66, u); s = leanOf(s, 0.04 * u, 0.1 * u); }
  if (act === 1) { s = H(s, 1, 10, 44, u); s = H(s, -1, 6, 46, u); }
  if (act === 2) s = leanOf(s, 0.18 * u, 0.08 * u);
  if (act === 3) { s = leanOf(s, -0.1 * u, -0.05 * u); s = H(s, -1, 12, 70, u); }
  if (act === 4) { s = H(s, 1, 4, 96, u); s = leanOf(s, 0, 0.12 * u); }
  if (act === 5) { s = H(s, 1, 22, 24, u); s = H(s, -1, 18, 22, u); s = leanOf(s, 0.12 * u, 0.06 * u); }
  if (act === 6) { s = leanOf(s, -0.12 * u, -0.08 * u); s = H(s, 1, 2, 22, u); }
  if (act === 7) {
    // nodding off: the head goes down slowly and comes up with a jerk
    const dz = clamp01((f - a0) / 0.4) * (1 - clamp01((f - a0 - 0.48) / 0.05));
    s = leanOf(s, 0.06 * dz, 0.45 * dz);
  }
  if (act === 8) s = H(s, 1, 22, 56, u);
  if (act === 9) { s = H(s, 1, 10, 50, u); s = H(s, -1, 8, 52, u); s = leanOf(s, 0, -0.18 * u); }
  if (act === 10) s = H(s, 1, 28, 58, u * clamp01((f - a0) / 0.06));
  if (act === 11) s = leanOf(s, 0, 0.18 * Math.abs(Math.sin(Math.PI * 2 * clamp01((f - a0) / 0.5))) * u);
  // the crowd's sounds
  const rock = Math.sin(t * 8 + j.ph * 9);
  const la = laugh * j.amp;
  if (la > 0.01) {
    if (j.style === 0) s = leanOf(s, -0.16 * la + 0.04 * la * rock, -0.14 * la);
    if (j.style === 1) { s = leanOf(s, 0.14 * la + 0.03 * la * rock, -0.1 * la); s = H(s, 1, 20, 18, la); }
    if (j.style === 2) { s = leanOf(s, -0.06 * la + 0.04 * la * rock, 0.06 * la); s = H(s, -1, 12, 70, la); }
  }
  if (murmur > 0.01) {
    const m = murmur * (0.5 + j.amp * 0.5);
    s = leanOf(s, (j.i % 2 ? 0.1 : -0.08) * m, 0.08 * m);
    if (j.i % 3 === 0) s = H(s, -1, 12, 70, m);
  }
  const up = cheer * (0.4 + j.amp * 0.6);
  if (up > 0.01) {
    s = H(s, 1, 10, 94, up);
    if (j.style !== 1) s = H(s, -1, 2, 96, up);
    s = leanOf(s, -0.08 * up, -0.12 * up);
  }
  const g = gasp * (0.3 + j.amp * 0.7);
  if (g > 0.01) { s = leanOf(s, -0.14 * g, -0.08 * g); s = H(s, 1, 20, 54, g); s = H(s, -1, 14, 58, g); }
  if (raise > 0.01) {
    // each man's hand goes up with his vote at his own moment
    s = H(s, 1, 12, 92, raise * clamp01((raise - j.ph * 0.3) / 0.6));
  }
  return pose(s, j.x, j.g, kk, j.dir, op);
}
/**
 * Each juror while the camera cannot see him: one fixed pose, so it never updates a View,
 * and transparent, so Android draws nothing for him at all.
 */
const FROZEN = JURORS.map((j) => jurorOf(j, 0, 0.5, 0, 0, 0, 0, 0, 0, 0));

export default function Hist5Scene({ clock, bt, bi, picked, pickedOk }: SceneApi) {
  // THE ANSWER LANDS ON THE STAGE: a seal is struck down (green tick / red cross) and the
  // hall jolts: a short hop for right, a sideways shake for wrong. Drivers only, no beat tracks.
  const verdict = useSharedValue(0);
  const strike = useSharedValue(0);
  const shake = useSharedValue(0);
  useEffect(() => {
    if (picked === null) {
      strike.value = withTiming(0, { duration: 160 });
      shake.value = 0;
      return;
    }
    verdict.value = pickedOk ? 1 : -1;
    strike.value = 0;
    strike.value = withSpring(1, { damping: 7, stiffness: 240, mass: 0.7 });
    shake.value = 0;
    shake.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) });
  }, [picked, pickedOk]);
  const heldP = useHeld();
  const heldC = useHeld();
  const cv = useCarry(21);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const b = bt.value;
    const t = clock.value;
    const a = ACT[n];
    const L = SPAN[n];
    const f = b / L;
    const tr = ease01(b / 0.5);
    const st = (x: number, y: number) => {
      'worklet';
      return stage(b, L, x, y);
    };
    const bp = (x: number, m: number, y: number) => {
      'worklet';
      return bump(b, L, x, m, y);
    };

    // ── the cap ────────────────────────────────────────────────────────────
    // A reader who taps through the walk home reaches the rest beat with him still on the
    // way (C18): he finishes the walk facing it, then sits and lies down, instead of being
    // dragged to his bed backwards while he turns round.
    const srcC = carrySource(cv, 0, n, SIT_X);
    const away = a === A.rest && Math.abs(srcC - SIT_X) > 1;
    const awayDur = away ? moveTr(srcC, SIT_X, TR) : 0;
    const aw = b - awayDur;
    const wc = legsOf(srcC, away ? [[0, SIT_X]] : C_LEGS[n], b, L);
    const xc = carry(cv, 0, n, wc.x, wc.x, 1);
    const dc = carry(cv, 1, n, 1, away
      ? faceOf(carrySource(cv, 1, n, -1), [[0, -1], [awayDur, 1]], b, 1)
      : faceOf(carrySource(cv, 1, n, 1), C_TURN[n], b, L), 1);
    // How far into bed he is: edgeW 0 standing → 1 on the bed's edge; inW 0 legs over
    // the edge → 1 legs on the bed; lie 0 sitting up → 1 lying down. The door beat gets
    // him up (the duvet thrown off, the legs swung round, the rise) BEFORE he walks, so
    // a reader who taps early never sees it hurried; the sleep beat is the same, read
    // backwards, once he has walked home.
    const awayW = (x: number, y: number) => {
      'worklet';
      return ease01(clamp01((aw - x) / (y - x)));
    };
    const edgeNow = away ? awayW(0.3, 1.7) : a <= A.room || a >= A.rest ? 1 : a === A.door ? 1 - st(0.14, 0.235) : a === A.sleep ? st(0.715, 0.795) : 0;
    const inNow = away ? awayW(2.0, 3.0) : a <= A.room || a >= A.rest ? 1 : a === A.door ? 1 - st(0.05, 0.13) : a === A.sleep ? st(0.8, 0.86) : 0;
    const lieNow = away ? awayW(3.3, 5.0) : a === A.wake ? 1 - st(0.22, 0.46) : a >= A.rest ? 1 : a === A.sleep ? st(0.87, 0.96) : 0;
    const edgeW = carry(cv, 2, n, edgeNow, edgeNow, tr);
    const inW = carry(cv, 3, n, inNow, inNow, tr);
    const lie = carry(cv, 4, n, lieNow, lieNow, tr);
    const ccode = C_CODE[n];
    let sc = bodyOf(wc, ccode, t, b);
    const ch = (s0: Stance, which: 1 | -1, ax: number, by: number, w0: number) => {
      'worklet';
      return handAt(s0, xc, FLOOR, K, dc, which, ax, by, w0);
    };
    if (a === A.door) {
      // his hand on the handle as he calls through the door
      const hw = st(0.56, 0.61);
      if (hw > 0) sc = reachHandTo(sc, { x: xc, groundY: FLOOR, k: K, dir: 1 }, 1, 398, 404, hw);
    }
    if (a === A.open) {
      // the door pushed open by its handle, then the hand dropped as he goes through
      const push = 1 - st(0.14, 0.2);
      if (push > 0) sc = reachHandTo(sc, { x: xc, groundY: FLOOR, k: K, dir: 1 }, 1, 398 + 30 * st(0.02, 0.16), 404, push);
    }
    if (a === A.what) {
      const open = st(0.05, 0.15) * (1 - st(0.86, 0.98));
      sc = ch(sc, 1, 22, 62, open);
      sc = ch(sc, -1, 12, 64, open);
      sc = leanOf(sc, 0.06 * bp(0.28, 0.36, 0.52), 0.35 * bp(0.28, 0.36, 0.52));
    }
    if (a === A.reply) sc = ch(sc, 1, 24, 58, st(0.08, 0.18) * (1 - st(0.86, 0.98)));
    if (a === A.asks) sc = ch(sc, 1, 30, 66, st(0.1, 0.2) * (1 - st(0.86, 0.98)));
    if (a === A.defend) {
      const o = bp(0.08, 0.16, 0.42) + bp(0.5, 0.58, 0.86);
      sc = ch(sc, 1, 24, 60, o);
      sc = ch(sc, -1, 14, 62, o);
    }
    if (a === A.verdict) {
      const v = VERDICT[n];
      const r = st(0.5, 0.62);
      if (v === 1) { sc = ch(sc, 1, 30, 84, r); sc = ch(sc, -1, 20, 54, r); sc = leanOf(sc, -0.02 * r, -0.16 * r); }
      if (v === 2) { sc = ch(sc, 1, 8, 46, r); sc = leanOf(sc, -0.04 * r, -0.1 * r); }
      if (v === 3) sc = leanOf(sc, 0.22 * r, 0.3 * r);
    }
    if (!CAP_TALKS[n] && a > A.open && a < A.sleep) {
      // he listens: a nod at what is said to him (N21)
      const nod = bp(0.3, 0.4, 0.55);
      sc = leanOf(sc, 0.08 * nod, 0.2 * nod);
    }
    // ── in bed, on its edge, and getting up ──────────────────────────────
    // on the edge: seated at the mattress's own height, feet under the knees
    const se: Stance = { ...seated(33.7, t, 12), footL: { x: 8, y: 0 }, footR: { x: 12, y: 0 } };
    const bh = (s0: Stance, which: 1 | -1, ax: number, by: number, w0: number) => {
      'worklet';
      return handAt(s0, SIT_X, BED_TOP, K, 1, which, ax, by, w0);
    };
    const pushTo = (s0: Stance, w0: number) => {
      'worklet';
      return w0 <= 0.001 ? s0 : { ...s0, fistL: lerpP(s0.fistL, PUSH_L, w0), fistR: lerpP(s0.fistR, PUSH_R, w0) };
    };
    let sb: Stance = BED_SIT;
    let sl: Stance = BED_LIE;
    if (a === A.wake) {
      // asleep; his head stirs on the pillow; he sits up (below), stretches and yawns,
      // and leans to the clock: what time is it?
      sl = leanOf(sl, 0, -0.16 * bp(0.04, 0.1, 0.18));
      const yawn = bp(0.52, 0.64, 0.8);
      sb = bh(sb, 1, 10, 80, yawn);
      sb = bh(sb, -1, 4, 82, yawn);
      sb = leanOf(sb, -0.06 * yawn, -0.3 * yawn);
      sb = leanOf(sb, 0.2 * st(0.84, 0.95), 0.2 * st(0.84, 0.95));
    }
    if (a === A.room) {
      sb = leanOf(sb, 0.2 * (1 - st(0, 0.1)), 0.2 * (1 - st(0, 0.1)));
      // the lamp, the poster, his hands, and the door the crowd is behind
      sb = leanOf(sb, 0.1 * bp(0.04, 0.12, 0.22), 0.3 * bp(0.04, 0.12, 0.22));
      sb = leanOf(sb, -0.08 * bp(0.22, 0.3, 0.4), -0.4 * bp(0.22, 0.3, 0.4));
      const hands = bp(0.42, 0.5, 0.64);
      sb = bh(sb, 1, 22, 30, hands);
      sb = bh(sb, -1, 18, 32, hands);
      sb = leanOf(sb, 0.08 * hands, 0.35 * hands);
      sb = leanOf(sb, 0.16 * st(0.7, 0.86), -0.1 * st(0.7, 0.86));
    }
    if (a === A.door) {
      sb = leanOf(sb, 0.16 * (1 - st(0, 0.05)), -0.1 * (1 - st(0, 0.05)));
      // the duvet thrown off toward the foot of the bed
      sb = bh(sb, 1, 34, 14, bp(0, 0.03, 0.07));
    }
    // the duvet pulled up as he settles
    if (a === A.sleep) sb = bh(sb, 1, 30, 10, bp(0.83, 0.86, 0.9));
    // lying ↔ sitting up: the torso rises off the pillow, the legs stay where they are,
    // and his hands push on the mattress through the middle of it
    const sBed = pushTo(mixStance(sb, sl, lie), 0.9 * Math.sin(Math.PI * lie));
    // legs on the bed ↔ over its edge: the knees bend down over the side; he leans back
    // a little on his hands while they swing
    const swing = Math.sin(Math.PI * inW);
    const sEB = leanOf(pushTo(mixStance(se, sBed, inW), 0.8 * swing), -0.12 * swing, 0);
    // standing ↔ on the edge: a rise from a chair: lean forward over the feet, hands on
    // the knees, push up (and the same, read backwards, to sit down)
    const rise = Math.sin(Math.PI * edgeW);
    let s = leanOf(mixStance(sc, sEB, edgeW), 0.45 * rise, 0.15 * rise);
    if (rise > 0.001) s = { ...s, fistL: lerpP(s.fistL, KNEES_L, 0.85 * rise), fistR: lerpP(s.fistR, KNEES_R, 0.85 * rise) };
    const prevC = carryFrom(heldC, n, s);
    const figC = keepHeld(heldC, wc.walking && edgeW < 0.01 ? mixKeepLegs(prevC, s, tr) : mixStance(prevC, s, tr));
    const cx = lerp(xc, SIT_X, edgeW);
    const cg = FLOOR + (BED_TOP - FLOOR) * inW * edgeW;
    const capB = pose(figC, cx, cg, K, lerp(dc, 1, edgeW), 1);

    // ── the plain one ──────────────────────────────────────────────────────
    const w = legsOf(carrySource(cv, 5, n, MARK), P_LEGS[n], b, L);
    const xp = carry(cv, 5, n, w.x, w.x, 1);
    const d = carry(cv, 6, n, -1, faceOf(carrySource(cv, 6, n, -1), P_TURN[n], b, L), 1);
    const code = P_CODE[n];
    let sp = bodyOf(w, code, t, b);
    const ph = (s2: Stance, which: 1 | -1, ax: number, by: number, wt: number) => {
      'worklet';
      return handAt(s2, xp, FLOOR, K, d, which, ax, by, wt);
    };
    if (a === A.open) {
      // both arms up in front of him as he announces the defendant (never thrown back, AR4)
      const wide = st(0.4, 0.5) * (1 - st(0.86, 1));
      sp = ph(sp, 1, 24, 82, wide);
      sp = ph(sp, -1, 14, 86, wide);
    }
    if (a === A.jury) sp = ph(sp, 1, 30, 70, bp(0.22, 0.3, 0.48) + bp(0.56, 0.64, 0.82));
    const leanNow = a === A.why ? st(0.55, 0.72) : !LATE[n] && (a === A.ask || a === A.reply) ? 1
      : !LATE[n] && a === A.sour ? 1 - st(0, 0.18) : !LATE[n] && a === A.gloat ? 1 - st(0, 0.1) : 0;
    const lean = carry(cv, 7, n, leanNow, leanNow, tr);
    sp = leanOf(sp, 0.24 * lean, 0.12 * lean);
    if (a === A.sour) sp = leanOf(sp, -0.04, -0.16 * st(0.08, 0.24));
    if (a === A.gloat) {
      const ha = bp(0.06, 0.16, 0.36);
      sp = leanOf(sp, -0.16 * ha + 0.04 * ha * Math.sin(t * 12), -0.3 * ha);
      sp = ph(sp, 1, 32, 64, bp(0.36, 0.46, 0.72));
    }
    if (a === A.clock) {
      // the plug at the spout, pulled as the line ends
      const pw = bp(0.78, 0.9, 1.15);
      if (pw > 0) sp = reachHandTo(sp, { x: xp, groundY: FLOOR, k: K, dir: d < 0 ? -1 : 1 }, 1, SPOUT.x, SPOUT.y, pw);
    }
    const discsNow = a === A.vote ? st(0.4, 0.5) * (1 - clamp01((b - VOTES_AT[n]) / 0.4)) : 0;
    const discs = carry(cv, 8, n, discsNow, discsNow, tr);
    if (discs > 0.01) {
      sp = ph(sp, 1, 24, 82, discs);
      sp = ph(sp, -1, 12, 86, discs);
    }
    if (a === A.verdict) {
      const look = bp(0.02, 0.12, 0.34);
      sp = leanOf(sp, 0.2 * look, 0.24 * look);
      const v = VERDICT[n];
      const r = st(0.42, 0.6);
      if (v === 1) sp = leanOf(sp, 0.3 * r, 0.3 * r);
      if (v === 2) { sp = ph(sp, 1, 20, 92, r); sp = ph(sp, -1, 6, 94, r); }
      if (v === 3) { sp = ph(sp, 1, 30, 76, r); sp = ph(sp, -1, 22, 80, r); sp = leanOf(sp, -0.02 * r, -0.2 * r); }
    }
    if (CAP_TALKS[n]) {
      // he listens to the defendant the way he does everything: impatiently — a sigh
      // that drops his head and lifts it again (N21)
      const sigh = bp(0.18, 0.4, 0.72);
      sp = leanOf(sp, 0.1 * sigh, 0.2 * sigh);
    }
    const prevP = carryFrom(heldP, n, hHold(code, t));
    const figP = keepHeld(heldP, w.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));
    const plain = pose(figP, xp, FLOOR, K, d, 1);

    // ── the water clock, the votes, the door and the duvet ─────────────────
    const runs = n < POUR_N ? 0 : n === POUR_N ? clamp01((b - POUR_AT[n]) / 0.3)
      : n < DRIP_N ? 1 : n === DRIP_N ? 1 - clamp01((b - DRIP_AT[n]) / 0.6) : 0;
    const water = carry(cv, 14, n, runs, runs, tr);
    const fallNow = a === A.vote ? clamp01((b - VOTES_AT[n]) / 1.6) : a > A.vote ? 1 : 0;
    const fallen = carry(cv, 15, n, fallNow, fallNow, tr);
    const doorNow = a < A.open ? 0 : a === A.open ? st(0.02, 0.16) : a === A.sleep ? 1 - st(0.5, 0.58) : a > A.sleep ? 0 : 1;
    const door = carry(cv, 16, n, doorNow, doorNow, tr);
    // the duvet: over him lying down, over his legs sitting up, thrown to the foot of the bed
    const duvNow = a === A.wake ? lerp(1, 0.77, st(0.24, 0.46)) : a === A.room ? 0.77
      : a === A.door ? lerp(0.77, 0.25, st(0, 0.06)) : a === A.sleep ? lerp(lerp(0.25, 0.77, st(0.84, 0.89)), 1, st(0.9, 0.98))
        : a >= A.rest ? 1 : 0.25;
    const duvet = carry(cv, 17, n, duvNow, duvNow, tr);

    // ── the camera ─────────────────────────────────────────────────────────
    const keys = CAMS[n];
    const fxNow = keyAt(keys, f, 1);
    const fyNow = keyAt(keys, f, 2);
    const lzNow = keyAt(keys, f, 3);
    const ctr = ease01(b / 0.8);
    const fx = carry(cv, 18, n, fxNow, fxNow, ctr);
    const fy = carry(cv, 19, n, fyNow, fyNow, ctr);
    const z = Math.exp(carry(cv, 20, n, lzNow, lzNow, ctr));

    // ── the jury ───────────────────────────────────────────────────────────
    const laugh = carry(cv, 9, n, 0, react(b, LAUGH_AT[n], 1.8), tr);
    const murmur = carry(cv, 10, n, 0, react(b, MURMUR_AT[n], 1.6), tr);
    const cheer = carry(cv, 11, n, 0, react(b, CHEER_AT[n], 2.6), tr);
    const gasp = carry(cv, 12, n, 0, react(b, GASP_AT[n], 2.0), tr);
    const raiseNow = a === A.vote ? st(0.58, 0.8) * (1 - clamp01((b - VOTES_AT[n] - 0.6) / 0.6)) : 0;
    const raise = carry(cv, 13, n, raiseNow, raiseNow, tr);
    // A juror the camera cannot see is held in one fixed, transparent pose, which costs
    // no update and no drawing; he is live again 60 units before he comes into view,
    // so the change happens off the edge of the frame.
    const vx0 = fx - CX / z - 60;
    const vx1 = fx + (STAGE_W - CX) / z + 60;
    const jur: Bundle[] = [];
    for (let i = 0; i < JURORS.length; i += 1) {
      const j = JURORS[i];
      jur.push(j.x < vx0 || j.x > vx1 ? FROZEN[i] : jurorOf(j, n, f, t, laugh, murmur, cheer, gasp, raise));
    }

    return {
      cap: capB, plain, jur, t,
      inBed: clamp01(inW + lie),
      held: { r: wristOf(plain, 'wrR'), l: wristOf(plain, 'wrL'), o: discs },
      water, fallen, door, duvet,
      cam: { x: CX - fx * z, y: CY - fy * z, z },
    };
  });

  const DC = useDerivedValue<Bundle>(() => SCENE.value.cap);
  const DP = useDerivedValue<Bundle>(() => SCENE.value.plain);
  const worldT = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    const sh = shake.value;
    const live = sh > 0 && sh < 1 ? 1 : 0;
    const dx = verdict.value < 0 ? Math.sin(sh * 34) * (1 - sh) * 6 * live : 0;
    const dy = verdict.value > 0 ? -Math.sin(Math.min(1, sh * 2) * Math.PI) * 4 * live : 0;
    return { transform: [{ translateX: c.x + dx }, { translateY: c.y + dy }, { scale: c.z }] };
  });
  const sealT = useAnimatedStyle(() => {
    const u = strike.value;
    const wob = verdict.value < 0 ? Math.sin(shake.value * 30) * (1 - shake.value) * 6 : 0;
    return {
      opacity: Math.min(1, u * 5),
      transform: [{ scale: 1.9 - 0.9 * u }, { rotate: (verdict.value < 0 ? -8 : 6) * (1 - u) + wob + 'deg' }],
    };
  });
  const sealRight = useAnimatedStyle(() => ({ opacity: verdict.value > 0 ? 1 : 0 }));
  const sealWrong = useAnimatedStyle(() => ({ opacity: verdict.value < 0 ? 1 : 0 }));
  const duvetBack = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.duvet }] }));
  const duvetFront = useAnimatedStyle(() => ({ opacity: SCENE.value.inBed > 0.5 ? 1 : 0, transform: [{ scaleX: SCENE.value.duvet }] }));
  const shutT = useAnimatedStyle(() => ({ opacity: SCENE.value.door < 0.08 ? 1 : 0 }));
  const faceT = useAnimatedStyle(() => ({ opacity: SCENE.value.door >= 0.08 ? 1 : 0, transform: [{ scaleX: Math.max(0.08, SCENE.value.door) }] }));
  const lightT = useAnimatedStyle(() => ({ opacity: SCENE.value.door }));
  const streamT = useAnimatedStyle(() => ({ opacity: SCENE.value.water }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.world, worldT]} pointerEvents="none">
        {/* Athens beyond the hall */}
        <SetArt parts={SKY} tone={TONE} line={0} />
        {/* the hills, the city and the Acropolis: one baked picture (plates.ts) */}
        <PlateArt id="hist5-far" />
        {/* the hall: the floor (the column shadows lie on it), then the colonnade, the
            roof, the dais, the chair and the stands, each one baked picture */}
        <PlateArt id="hist5-floor" />
        <PlateArt id="hist5-mid" />
        {JURORS.map((j, i) => <JurorFig key={i} i={i} k={j.k} S={SCENE} />)}
        {/* the props */}
        <ObjectArt parts={URN_ART} tone={TONE} />
        <ObjectArt parts={WOOD_ART} tone={TONE} />
        <ObjectArt parts={BLOCK_ART} tone={TONE} />
        <ObjectArt parts={POT_ART} tone={TONE} />
        <Animated.View style={[styles.stream, streamT]} pointerEvents="none" />
        <ObjectArt parts={LOW_ART} tone={TONE} />
        <Votes S={SCENE} />
        {/* his room */}
        {/* the walls, the poster and the lamp: one baked picture */}
        <PlateArt id="hist5-room" />
        <Animated.View style={[styles.world0, lightT]} pointerEvents="none">
          <SetArt parts={DOOR_LIGHT} tone={TONE} line={0} />
        </Animated.View>
        <SetArt parts={BED} tone={TONE} line={1} />
        <Animated.View style={[styles.duvet, duvetBack]} pointerEvents="none">
          <SetArt parts={DUVET} tone={TONE} line={1} />
        </Animated.View>
        <SetArt parts={NIGHTSTAND} tone={TONE} line={1} />
        <ObjectArt parts={LAMP_ART} tone={TONE} />
        <SetArt parts={CLOCK_ART} tone={TONE} line={0.8} />
        <Animated.View style={[styles.world0, shutT]} pointerEvents="none">
          <SetArt parts={DOOR_SHUT} tone={TONE} line={1} />
        </Animated.View>
        <Animated.View style={[styles.door, faceT]} pointerEvents="none">
          <SetArt parts={DOOR_FACE} tone={TONE} line={1} />
        </Animated.View>
        {/* the plain one, and the cap */}
        {/* cast: plain */}
        <Stickman D={DP} k={K} role="second" wear={[]} />
        <Held S={SCENE} which="r" />
        <Held S={SCENE} which="l" />
        {/* cast: cap */}
        <Stickman D={DC} k={K} role="lead" wear={BY_ID.stroller.pieces} />
        <Animated.View style={[styles.duvet, duvetFront]} pointerEvents="none">
          <SetArt parts={DUVET} tone={TONE} line={1} />
        </Animated.View>
      </Animated.View>
      {/* the verdict seal: struck down in front of the hall, tick or cross */}
      <Animated.View style={[styles.seal, sealT]} pointerEvents="none">
        <Animated.View style={[styles.sealFace, styles.sealGreen, sealRight]}>
          <View style={[styles.bar, { left: 14, top: 28, width: 7, height: 17, transform: [{ rotate: '-45deg' }] }]} />
          <View style={[styles.bar, { left: 29, top: 12, width: 7, height: 34, transform: [{ rotate: '40deg' }] }]} />
        </Animated.View>
        <Animated.View style={[styles.sealFace, styles.sealRed, sealWrong]}>
          <View style={[styles.bar, { left: 21, top: 8, width: 7, height: 36, transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.bar, { left: 21, top: 8, width: 7, height: 36, transform: [{ rotate: '-45deg' }] }]} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

// ── the pieces that move ─────────────────────────────────────────────────────

type SceneValue = SharedValue<any>;

function JurorFig({ i, k: kk, S }: { i: number; k: number; S: SceneValue }) {
  const D = useDerivedValue<Bundle>(() => S.value.jur[i]);
  return (
    <>
      {/* extra: juror */}
      <Stickman D={D} k={kk} role="crowd" wear={[]} />
    </>
  );
}

/** A disc in the plain one's hand, on his wrist every frame (AR7.4). */
function Held({ S, which }: { S: SceneValue; which: 'r' | 'l' }) {
  const st = useAnimatedStyle(() => {
    const h = S.value.held;
    const p = which === 'r' ? h.r : h.l;
    return { opacity: h.o > 0.3 ? 1 : 0, transform: [{ translateX: p.x }, { translateY: p.y - 4 * K }] };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={DISC_ART} tone={TONE} />
    </Animated.View>
  );
}

/** The jurors' votes, falling into the bronze urn one after another. */
const VOTES = [0, 1, 2, 3, 4, 5];
function Votes({ S }: { S: SceneValue }) {
  return (
    <>
      {VOTES.map((v) => <Vote key={v} v={v} S={S} />)}
    </>
  );
}
function Vote({ v, S }: { v: number; S: SceneValue }) {
  const st = useAnimatedStyle(() => {
    const u = clamp01((S.value.fallen * 1.6 - v * 0.2) / 0.4);
    return {
      opacity: u > 0 && u < 1 ? 1 : 0,
      transform: [{ translateX: URN_MOUTH.x + (v % 3 - 1) * 3 }, { translateY: URN_MOUTH.y - 46 + 46 * u * u }],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={VOTE_DISC_ART} tone={TONE} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%', overflow: 'hidden' },
  world: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  world0: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  duvet: { position: 'absolute', left: 0, top: 0, width: DUVET_RIGHT, height: STAGE_H, transformOrigin: `${DUVET_RIGHT}px 0px` },
  door: { position: 'absolute', left: 0, top: 0, width: DOOR_HINGE, height: STAGE_H, transformOrigin: `${DOOR_HINGE}px 0px` },
  seal: { position: 'absolute', left: 172, top: 186, width: 56, height: 56 },
  sealFace: { position: 'absolute', left: 0, top: 0, width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: NATURAL.paper.base },
  sealGreen: { backgroundColor: NATURAL.leaf.base, boxShadow: '0 3px 0 ' + NATURAL.leaf.shade },
  sealRed: { backgroundColor: NATURAL.apple.base, boxShadow: '0 3px 0 ' + NATURAL.apple.shade },
  bar: { position: 'absolute', borderRadius: 3.5, backgroundColor: NATURAL.paper.base },
  stream: {
    position: 'absolute', left: SPOUT.x - 1.2, top: SPOUT.y, width: 2.4, height: LOW_MOUTH - SPOUT.y,
    backgroundColor: NATURAL.water.base, borderRadius: 1.2,
  },
});

export function Hist5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Hist5Scene} band={[170, 516]} />;
}
