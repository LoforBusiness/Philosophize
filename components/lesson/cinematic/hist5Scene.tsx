import { View, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import ObjectArt from './ObjectArt';
import SetArt, { type SetPart } from './SetArt';
import { oPoly } from './setShapes';
import { BEATS } from './hist5Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { emoteStill, emoteStillLive, postureStill } from './moves';
import { reachHandTo } from './interact';
import { lineOf, stage, bump } from './pace';
import {
  NATURAL, tint, oEll, oBar, table, roomPoster, bedsideLamp, pendant, klepsydraPot, clockBlock,
  ballotUrn, woodUrn, ballotDisc, type NaturalKey,
} from './objects';

// ─────────────────────────────────────────────────────────────────────────────
// history-foundations-5, "On Trial in Athens" — A BEDROOM OF TODAY, AND A LAW COURT
// IN ATHENS, SEEN THROUGH THE EYES OF THE MAN IN THE CAP.
//
// AT1: first person: cap. The reader IS the cap (cast.ts: kind, Australian). Nothing on
// the stage is him but what he would see of himself: his two arms, which come up from
// the foot of the frame when he uses them, and his body and legs when he looks down.
// The STAGE is his head: it turns, tips and walks, and the world moves the other way.
//
//   b0   black; his eyelids flicker open on the bedroom ceiling and its lamp; he sits
//        up and the room tips down into view: the door ahead, a poster, a lamp.
//   b1   he looks at the lamp, at the poster, then down at his hands, turns them over,
//        and looks back up at the door. A crowd murmurs, muffled, behind it.
//   b2   he gets out of bed (the duvet drops away), walks to the door and puts his hand
//        on its handle, and calls through it.
//   b3   the door swings in; sunlight; a law court is out there. He walks through it
//        into the court, where the plain one stands centre stage and throws his arms
//        wide at him. The jurors laugh.
//   b4   his hands come up, open; he looks down at himself; up again.
//   b5   the plain one paces in front of him, hands behind his back.
//   b6   the plain one sweeps a hand along the jurors on the left, then the right, and
//        his head follows it.
//   b7   he looks along the benches himself, left and right.
//   b8   the plain one walks right up to him and leans in.
//   b9   Q1, said as a reply (AT4): the plain one waits, leaning in.
//   b10  his hand comes up, palm open, as he answers (the right reply) ·
//   b11  the same, for the wrong reply.
//   b12  the plain one straightens, sour, and walks back; the jurors murmur ·
//   b13  the plain one throws his head back and laughs and points at him; the jurors laugh.
//   b14  the plain one walks to the water clock and pulls its plug; water runs.
//   b15  his hand goes toward the clock.
//   b16  the plain one walks back to him and folds his arms.
//   b17  Q2, said as a reply; b18–b21 as b10–b13.
//   b22  he turns to the jurors left and right, both hands open. The clock runs dry.
//   b23  the plain one walks to the bronze urn and holds up two discs; the jurors put up
//        their hands, and the votes clatter into the urn.
//   b24–26  the verdict, chosen by the reader's answers (AT5): the plain one reads the
//        urn and slumps (free), throws up his hands (a tie), or opens his arms (guilty);
//        the jurors cheer or gasp.
//   b27  his eyelids close.
//   b28  black, under the quotation.
//
// THE COURT, in one-point perspective about (200, 300): a point X across, Y down and z
// deep stands at (200 + X·s, 300 + Y·s) with s = 1/(1 + z). The floor is Y 230 and
// the timber soffit Y −210; the hall runs 260 either side of centre and opens at its
// far end (z 3) onto sunlight. The left side is a wall with engaged columns, the right
// a colonnade open to the light. Jurors sit on two stone tiers down each side: the front
// tier at X ±172 on the floor (z 1.0, 1.45, 2.0, 2.6), the back tier at X ±250 on a
// step 100 up (z 1.2, 1.75, 2.35) — fourteen men, faced across the hall. People watch
// from outside the colonnade. The plain one stands at X 0, z 1.0; the water clock on its
// stone block at X 95, z 0.7; the bronze urn at X −85, z 0.75, the wooden one beside it.
// A figure is 270 high in X units, so K_FIG · 2.62 · s draws one at depth z. The plain
// one is drawn at z 1.0's size (K_FIG × 1.31, 135 of the 400-unit band, 34%) inside a
// wrapper that scales him about his feet as he comes nearer or goes back.
//
// THE BEDROOM is a box about the same centre: the far wall 60–340 × 170–470 with the
// door (160–240 × 280–470, handle at 228, 385) in it, a poster on the left, a lamp on a
// table on the right, a pendant lamp on the ceiling, and the duvet over his legs at the
// foot of the frame. Walking to the door is the room scaled about the door's centre
// (200, 375); walking through it is the court seen through the doorway, scaled the same.
//
// Band [118, 518]: a 400-unit square, whose ground is wherever his eyes are.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('history');
const TR = 0.85;
/** The plain one, drawn at the size a man is at z 1.0 (and scaled about his feet). */
const K = K_FIG * 1.31;
/** A figure's height in X units over its height in rig units: K_FIG · DEPTH_K · s is a man at depth z. */
const DEPTH_K = 2.62;

/**
 * Seconds each beat's line runs (lib/narration/manifest.ts, history-foundations-5); 0
 * for a beat with no voice. A beat whose voice waits (`voiceAfter`) is paced over the
 * wait and the line together, in SPAN.
 */
const LINES = [4.6, 5.11, 4.38, 4.62, 4.72, 6.91, 7.54, 3.35, 3.94, 0, 5.37, 4.99, 4.59, 5.72, 6.3, 3.21, 3.39, 0, 4.83, 4.44, 3.31, 5.49, 6.13, 5.92, 3.44, 5.61, 4.13, 4.34, 0, 0];
const VA = BEATS.map((b) => b.voiceAfter ?? 0);
const SPAN = BEATS.map((_, n) => VA[n] + lineOf(LINES, n));
/** When a beat's line has been said, and its after-sound starts (CinematicPlayer's TAIL_AFTER_S). */
const TAIL = BEATS.map((_, n) => VA[n] + (LINES[n] || 0) + 0.3);

// ── what each beat is ────────────────────────────────────────────────────────
const ACTS = ['wake', 'room', 'door', 'open', 'what', 'charge', 'jury', 'straws', 'why', 'ask', 'reply', 'sour', 'gloat',
  'clock', 'asks', 'prove', 'defend', 'vote', 'verdict', 'sleep', 'rest', 'summary'] as const;
const A = Object.fromEntries(ACTS.map((a, i) => [a, i])) as Record<(typeof ACTS)[number], number>;
const ACT = BEATS.map((b) => A[(b.act ?? (b.summary ? 'summary' : 'ask')) as (typeof ACTS)[number]]);
const ASK2 = BEATS.findIndex((b) => b.fair);
/** 1 on a beat after the second question has been asked. */
const LATE = BEATS.map((_, n) => (n > ASK2 ? 1 : 0));
const VERDICT = BEATS.map((b) => (b.verdict === 'free' ? 1 : b.verdict === 'tie' ? 2 : b.verdict === 'guilty' ? 3 : 0));
/** When each beat's crowd sound starts, from its own cue list, or −1. */
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

// ── the court, in perspective ────────────────────────────────────────────────
const VP = { x: 200, y: 300 };
const EYE = 230;
const ROOF = -250;
const HALL = 300;
const BACK = 4;
const NEAR = -0.6;
function sAt(z: number) {
  'worklet';
  return 1 / (1 + z);
}
function pX(X: number, z: number) {
  'worklet';
  return VP.x + X * sAt(z);
}
function pY(Y: number, z: number) {
  'worklet';
  return VP.y + Y * sAt(z);
}
const poly = (nat: NaturalKey, pts: number[], role: 'mass' | 'face' | 'dark' = 'mass') =>
  ({ ...oPoly(role, pts), nat }) as unknown as SetPart;
/** A level quad: across Xa…Xb, deep za…zb, at height Y (a floor, a soffit, a bench top). */
const level = (nat: NaturalKey, Xa: number, Xb: number, za: number, zb: number, Y: number, role: 'mass' | 'face' | 'dark' = 'mass') =>
  poly(nat, [pX(Xa, za), pY(Y, za), pX(Xb, za), pY(Y, za), pX(Xb, zb), pY(Y, zb), pX(Xa, zb), pY(Y, zb)], role);
/** A side quad facing the middle of the hall: at X, from Ya down to Yb, deep za…zb. */
const side = (nat: NaturalKey, X: number, Ya: number, Yb: number, za: number, zb: number, role: 'mass' | 'face' | 'dark' = 'mass') =>
  poly(nat, [pX(X, za), pY(Ya, za), pX(X, zb), pY(Ya, zb), pX(X, zb), pY(Yb, zb), pX(X, za), pY(Yb, za)], role);
/** A face square to the eye: across Xa…Xb, from Ya down to Yb, at depth z. */
const front = (nat: NaturalKey, Xa: number, Xb: number, Ya: number, Yb: number, z: number, role: 'mass' | 'face' | 'dark' = 'mass') =>
  poly(nat, [pX(Xa, z), pY(Ya, z), pX(Xb, z), pY(Ya, z), pX(Xb, z), pY(Yb, z), pX(Xa, z), pY(Yb, z)], role);

const COURT_SHELL: SetPart[] = [
  // through the far end: sunlight, and the hills beyond the city
  front('skyGlow', -HALL, HALL, ROOF, EYE, BACK),
  poly('khaki', [pX(-HALL, BACK), pY(EYE, BACK), pX(-HALL, BACK), pY(170, BACK), pX(-140, BACK), pY(146, BACK),
    pX(-20, BACK), pY(168, BACK), pX(110, BACK), pY(132, BACK), pX(HALL, BACK), pY(158, BACK), pX(HALL, BACK), pY(EYE, BACK)]),
  // the right side is open to the light; a low stylobate runs along it
  side('skyGlow', HALL, ROOF, EYE, NEAR, BACK),
  side('stoaStone', HALL, EYE - 18, EYE, NEAR, BACK, 'face'),
  // the left side is a wall, darker, with a painted frieze and a dado
  side('stoaShade', -HALL, ROOF, EYE, NEAR, BACK),
  side('stoaBeam', -HALL, ROOF + 40, ROOF + 62, NEAR, BACK, 'face'),
  side('stoaShade', -HALL, EYE - 46, EYE, NEAR, BACK, 'face'),
  // the timber soffit and its beams
  level('stoaShade', -HALL, HALL, NEAR, BACK, ROOF),
  ...[[-0.45, -0.32], [0.15, 0.25], [0.85, 0.95], [1.6, 1.7], [2.45, 2.55], [3.35, 3.45]].map(([a, b]) => level('stoaBeam', -HALL, HALL, a, b, ROOF)),
  // the floor, barred with the colonnade's shadows
  level('stoaFloor', -HALL, HALL, NEAR, BACK, EYE),
  ...[[-0.32, -0.14], [0.38, 0.52], [1.08, 1.22], [1.88, 2.0], [2.78, 2.9], [3.68, 3.78]].map(([a, b]) => level('floorShade', -HALL, HALL, a, b, EYE)),
  // the speaker's floor, marble inlaid in the stone
  level('marble', -118, 118, 0.42, 1.5, EYE, 'face'),
  level('marble', -104, 104, 0.47, 1.4, EYE),
  // the architrave, over each row of columns
  side('stoaStone', -HALL + 22, ROOF, ROOF + 36, NEAR, BACK),
  side('stoaStone', HALL - 22, ROOF, ROOF + 36, NEAR, BACK),
];

/** The columns, engaged in the wall on the left and standing against the light on the right. */
const COL_Z = [-0.4, 0.3, 1.0, 1.8, 2.7, 3.6];
const COLUMNS: SetPart[] = COL_Z.flatMap((z) => [-1, 1].flatMap((side) => {
  const X = side * (HALL - 22);
  // the left ones are lit from across the hall; the right ones stand against the sun
  const nat: NaturalKey = side < 0 ? 'stoaStone' : 'stoaShade';
  return [
    front(nat, X - 17, X + 17, ROOF + 52, EYE - 14, z),
    front(nat, X + side * 6, X + side * 17, ROOF + 52, EYE - 14, z, 'face'),
    front(nat, X - 24, X + 24, ROOF + 36, ROOF + 52, z),
    front(nat, X - 22, X + 22, EYE - 14, EYE, z),
    ...[-9, 0, 9].map((d) => front(nat, X + d - 1, X + d + 1, ROOF + 58, EYE - 20, z, 'dark')),
  ];
}));

/** The two stone tiers down each side: the front bench, and the step with its bench. */
const BENCH_Z: [number, number] = [0.7, 3.95];
const BENCHES: SetPart[] = [-1, 1].flatMap((sd) => {
  const [za, zb] = BENCH_Z;
  const x = (X: number) => sd * X;
  return [
    // the step the back tier sits on, behind the front bench
    side('stoaShade', x(232), 130, EYE, za, zb, 'face'),
    level('stoaStone', x(232), x(HALL - 6), za, zb, 130),
    front('stoaShade', x(232), x(HALL - 6), 130, EYE, za, 'face'),
    // the back bench, on the step
    side('stoaShade', x(268), 75, 130, za, zb, 'face'),
    level('stoaStone', x(268), x(HALL - 6), za, zb, 75),
    front('stoaShade', x(268), x(HALL - 6), 75, 130, za, 'face'),
    // the front bench, on the floor
    side('stoaShade', x(166), 175, EYE, za, zb, 'face'),
    level('stoaStone', x(166), x(226), za, zb, 175),
    front('stoaShade', x(166), x(226), 175, EYE, za, 'face'),
  ];
});

/**
 * The five hundred: beyond the nearest jurors the benches are full, painted rather than
 * posed — a head and shoulders for each man, smaller and browner with distance.
 */
function sitter(X: number, Y: number, z: number): SetPart[] {
  const k = DEPTH_K * sAt(z);
  const x = pX(X, z);
  const g = pY(Y, z);
  return tint([
    oBar('mass', x, g - 20 * k, x, g - 54 * k, 13 * k),
    oEll('mass', x, g - 66 * k, 26 * k, 26 * k),
  ], 'stoaBeam') as unknown as SetPart[];
}
const CROWD: SetPart[] = [-1, 1].flatMap((sd) => [
  ...[3.0, 3.25, 3.5, 3.75].flatMap((z) => sitter(sd * 196, EYE - 55, z)),
  ...[3.1, 3.35, 3.6, 3.85].flatMap((z) => sitter(sd * 284, 75, z)),
]);

// ── the jurors ───────────────────────────────────────────────────────────────
type Juror = { x: number; g: number; k: number; dir: number; ph: number; z: number; amp: number; ink: string };
const JURORS: Juror[] = [-1, 1].flatMap((sd) => [
  ...[1.1, 2.2].map((z, i) => ({ X: sd * 196, Y: EYE, z, i })),
  ...[1.7, 2.75].map((z, i) => ({ X: sd * 284, Y: 130, z, i: i + 4 })),
].map(({ X, Y, z, i }) => ({
  x: pX(X, z), g: pY(Y, z), k: K_FIG * DEPTH_K * sAt(z), dir: -sd, z,
  ph: (i * 1.37 + (sd > 0 ? 0.6 : 0)) % 3,
  amp: 0.75 + ((i * 7 + (sd > 0 ? 3 : 0)) % 5) * 0.06,
  // nearer men in ink, further ones browner: the room's own air between them
  ink: z < 1.3 ? INK : z < 2 ? NATURAL.stoaBeam.shade : NATURAL.stoaBeam.base,
}))).sort((a, b) => b.z - a.z);
/** The jurors nearer than the plain one at his usual place are drawn in front of him. */
const NEAR_FROM = JURORS.length;

// ── the props ────────────────────────────────────────────────────────────────
const CLOCK_Z = 0.55;
const CLOCK_X = pX(78, CLOCK_Z);
const BLOCK = { x: CLOCK_X, top: pY(120, CLOCK_Z), bot: pY(EYE, CLOCK_Z), w: 70 * sAt(CLOCK_Z) };
const BLOCK_ART = clockBlock(BLOCK.x, (BLOCK.top + BLOCK.bot) / 2, BLOCK.w, BLOCK.bot - BLOCK.top);
const POT = { w: 70 * sAt(CLOCK_Z), h: 52 * sAt(CLOCK_Z) };
const POT_ART = klepsydraPot(CLOCK_X, BLOCK.top - POT.h / 2, POT.w, POT.h);
/** The spout at the foot of the upper bowl (the drawing's (19, 41.6) of 60 × 44). */
const SPOUT = { x: CLOCK_X - POT.w / 2 + (19 / 60) * POT.w, y: BLOCK.top - POT.h + (41.6 / 44) * POT.h };
const LOW_Z = 0.47;
const LOW = { w: 46 * sAt(LOW_Z), h: 34 * sAt(LOW_Z) };
const LOW_ART = klepsydraPot(SPOUT.x + 2, pY(EYE, LOW_Z) - LOW.h / 2, LOW.w, LOW.h);
const LOW_MOUTH = pY(EYE, LOW_Z) - LOW.h + 2;
const URN_Z = 0.6;
const URN = { x: pX(-76, URN_Z), bot: pY(EYE, URN_Z), w: 44 * sAt(URN_Z), h: 62 * sAt(URN_Z) };
const URN_ART = ballotUrn(URN.x, URN.bot - URN.h / 2, URN.w, URN.h);
const URN_MOUTH = { x: URN.x, y: URN.bot - URN.h + 3 };
const WOOD_ART = woodUrn(pX(-118, URN_Z), pY(EYE, URN_Z) - (42 * sAt(URN_Z)) / 2, 34 * sAt(URN_Z), 42 * sAt(URN_Z));
const DISC_ART = ballotDisc(0, 0, 9, 9);
const VOTE_DISC_ART = ballotDisc(0, 0, 6, 6);

// ── the bedroom ──────────────────────────────────────────────────────────────
const DOOR = { x: 200, y: 375 };
const HANDLE = { x: 228, y: 385 };
const RM = { l: 60, r: 340, t: 170, b: 470 };
const NEAR_K = 3.2;
const nx = (x: number) => 200 + (x - 200) * NEAR_K;
const ny = (y: number) => 318 + (y - 318) * NEAR_K;
const box = (nat: NaturalKey, x0: number, y0: number, x1: number, y1: number, role: 'mass' | 'face' | 'dark' = 'mass') =>
  poly(nat, [x0, y0, x1, y0, x1, y1, x0, y1], role);
const ROOM_SET: SetPart[] = [
  poly('sashWhite', [nx(RM.l), ny(RM.t), nx(RM.r), ny(RM.t), RM.r, RM.t, RM.l, RM.t]),
  poly('bedWall', [nx(RM.l), ny(RM.t), RM.l, RM.t, RM.l, RM.b, nx(RM.l), ny(RM.b)], 'face'),
  poly('bedWall', [RM.r, RM.t, nx(RM.r), ny(RM.t), nx(RM.r), ny(RM.b), RM.r, RM.b]),
  poly('oak', [RM.l, RM.b, RM.r, RM.b, nx(RM.r), ny(RM.b), nx(RM.l), ny(RM.b)]),
  ...[100, 140, 180, 220, 260, 300].map((x) => poly('oak', [x - 0.6, RM.b, x + 0.6, RM.b, nx(x) + 2, ny(RM.b), nx(x) - 2, ny(RM.b)], 'dark')),
  // the far wall, round the doorway
  box('bedWall', RM.l, RM.t, 152, RM.b),
  box('bedWall', 248, RM.t, RM.r, RM.b),
  box('bedWall', 152, RM.t, 248, 272),
  // skirting, and the door's casing
  box('sashWhite', RM.l, RM.b - 8, 152, RM.b),
  box('sashWhite', 248, RM.b - 8, RM.r, RM.b),
  poly('sashWhite', [nx(RM.l), ny(RM.b) - 24, RM.l, RM.b - 8, RM.l, RM.b, nx(RM.l), ny(RM.b)], 'face'),
  poly('sashWhite', [RM.r, RM.b - 8, nx(RM.r), ny(RM.b) - 24, nx(RM.r), ny(RM.b), RM.r, RM.b]),
  box('sashWhite', 152, 272, 160, RM.b),
  box('sashWhite', 240, 272, 248, RM.b),
  box('sashWhite', 152, 272, 248, 280),
];
const POSTER_ART = roomPoster(105, 250, 50, 68);
const TABLE_ART = tint(table(300, 449, 62, 44), 'oak');
const LAMP_ART = bedsideLamp(300, 417, 26, 38);
const PENDANT_ART = pendant(200, 112, 26, 44);
const DOOR_LEAF: SetPart[] = [
  box('doorPaint', 160, 280, 240, 470),
  box('doorPaint', 171, 294, 229, 366, 'dark'),
  box('doorPaint', 171, 384, 229, 456, 'dark'),
  tint([oEll('mass', HANDLE.x, HANDLE.y, 8, 8)], 'brass') as unknown as SetPart,
];
/** The daylight the open door lays on the bedroom floor. */
const DOOR_LIGHT: SetPart[] = [poly('skyGlow', [160, 470, 240, 470, 330, 600, 70, 600])];
/** The duvet over his legs, at the foot of the frame: two knees under it. */
const DUVET: SetPart[] = [
  poly('duvet', [-260, 840, -260, 474, -140, 468, 20, 466, 110, 460, 140, 450, 166, 446, 190, 452, 206, 452,
    226, 444, 254, 448, 286, 460, 380, 464, 660, 472, 660, 840]),
  poly('duvet', [150, 452, 170, 448, 150, 560, 122, 560], 'face'),
  poly('duvet', [236, 446, 256, 450, 290, 560, 262, 560], 'face'),
  poly('duvet', [40, 470, 60, 469, -10, 560, -40, 560], 'face'),
]

// ── his own body, seen from his eyes ────────────────────────────────────────
/** Where his arms come from, off the foot of the frame. */
const SH_R = { x: 330, y: 700 };
const SH_L = { x: 70, y: 700 };
const UPPER = 150;
const FORE = 140;
/** A hand put away, below the frame. */
const HID_R = [300, 690];
const HID_L = [100, 690];
const H = [HID_R[0], HID_R[1], HID_L[0], HID_L[1]];

/**
 * His two hands through each act: [fraction of the beat, right x, right y, left x, left y],
 * on the screen. A hand at y 690 is down by his side, out of sight.
 */
const ARM_KEYS: Record<number, number[][]> = {
  [A.room]: [[0, ...H], [0.33, ...H], [0.45, 262, 452, 138, 452], [0.5, 270, 446, 130, 458], [0.55, 256, 454, 144, 446],
    [0.6, 262, 450, 138, 450], [0.75, ...H]],
  [A.what]: [[0, ...H], [0.04, ...H], [0.16, 292, 402, 108, 402], [0.28, 292, 402, 108, 402], [0.4, 254, 482, 146, 482],
    [0.6, 254, 482, 146, 482], [0.72, 290, 406, 110, 406], [0.88, 290, 406, 110, 406], [1, ...H]],
  [A.reply]: [[0, ...H], [0.08, ...H], [0.24, 268, 432, ...HID_L], [0.85, 268, 432, ...HID_L], [1, ...H]],
  [A.asks]: [[0, ...H], [0.1, ...H], [0.3, 292, 404, ...HID_L], [0.85, 292, 404, ...HID_L], [1, ...H]],
  [A.defend]: [[0, ...H], [0.04, ...H], [0.18, 246, 420, 116, 420], [0.36, 246, 420, 116, 420], [0.5, 284, 420, 154, 420],
    [0.7, 284, 420, 154, 420], [0.9, ...H]],
};
/** Where his head turns (yaw, + right) and tips (pitch, + up), in screen units, through each act. */
const CAM_KEYS: Record<number, number[][]> = {
  [A.wake]: [[0, 0, 250], [0.46, 0, 250], [0.8, 0, 10], [0.95, 40, 0]],
  [A.room]: [[0, 40, 0], [0.12, 100, 0], [0.18, 100, 0], [0.3, -95, 35], [0.33, -95, 35], [0.45, 0, -120], [0.62, 0, -120], [0.75, 0, 0]],
  [A.what]: [[0, 0, 0], [0.28, 0, 0], [0.4, 0, -190], [0.6, 0, -190], [0.72, 0, 0]],
  [A.jury]: [[0, 0, 0], [0.25, 0, 0], [0.4, -85, 0], [0.52, -85, 0], [0.66, 85, 0], [0.8, 85, 0], [0.92, 0, 0]],
  [A.straws]: [[0, 0, 0], [0.05, 0, 0], [0.28, -100, 10], [0.36, -100, 10], [0.6, 100, 10], [0.68, 100, 10], [0.88, 0, 0]],
  [A.defend]: [[0, 0, 0], [0.04, 0, 0], [0.2, -85, 0], [0.36, -85, 0], [0.52, 85, 0], [0.68, 85, 0], [0.88, 0, 0]],
  [A.sleep]: [[0, 0, 0], [0.6, 0, 0], [0.95, 0, -40]],
  [A.rest]: [[0, 0, -40]],
  [A.summary]: [[0, 0, -40]],
};
/** Acts in which his head follows the plain one across the court. */
const FOLLOWS = new Set([A.open, A.charge, A.why, A.ask, A.reply, A.sour, A.gloat, A.clock, A.asks, A.prove, A.vote, A.verdict]);
const FOLLOW = ACT.map((a) => (FOLLOWS.has(a) ? 1 : 0));
const CAMS = ACT.map((a) => CAM_KEYS[a] ?? [[0, 0, 0]]);
const ARMS = ACT.map((a) => ARM_KEYS[a] ?? [[0, ...H]]);

// ── the plain one: where he walks, which way he faces, and what he holds ─────
/** Centre stage, where he stands when he is not going anywhere. */
const STAND = 0.8;
type Track = readonly (readonly number[])[];
const P_LEGS: Track[] = BEATS.map((_, n) => {
  const a = ACT[n];
  if (a === A.charge) return [[0.05, -60, STAND], [0.4, 60, STAND], [0.75, 0, STAND]];
  if (a === A.why) return [[0.05, -10, 0.3]];
  if (a === A.sour && !LATE[n]) return [[0.36, 0, STAND]];
  if (a === A.gloat && !LATE[n]) return [[0.74, 0, STAND]];
  if (a === A.clock) return [[0.05, 34, CLOCK_Z]];
  if (a === A.prove) return [[0.08, 0, STAND]];
  if (a === A.vote) return [[0.05, -34, URN_Z]];
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
  if (a === A.what || a === A.straws || a === A.ask || a === A.reply || a === A.asks || a === A.sleep || a === A.rest) return NOD;
  return TALK;
});

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
/**
 * A hand of the plain one. He is posed at K where he stands and drawn scaled about his
 * feet for his depth, so a target is given as an offset from his feet in K units.
 */
function pHand(s: Stance, x: number, g: number, dir: number, which: 1 | -1, ox: number, oy: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: g, k: K, dir: dir < 0 ? -1 : 1 }, which, x + ox, g + oy, w);
}
/** A body leant (+ forward) and a head tipped (+ down). */
function leanOf(s: Stance, tilt: number, neck: number): Stance {
  'worklet';
  return { ...s, tilt: s.tilt + tilt, neck: s.neck + neck };
}
/**
 * Where the plain one stands at time `b` of a beat, walking his legs in turn across the
 * floor and in depth. He starts from where he is on screen (`srcX`, `srcZ`, out of the
 * carry), so a tap mid-walk cannot move him in one frame (group L). Distance is counted
 * in his own drawn units (a z of 1 is 400 X units deep; at z 1.0 an X unit is half of
 * one of his).
 */
function legsOf(srcX: number, srcZ: number, legs: Track, b: number, L: number) {
  'worklet';
  let fx = srcX;
  let fz = srcZ;
  let free = 0;
  let X = srcX;
  let z = srcZ;
  let u = 1;
  let dist = 0;
  let walking = false;
  let dx = 0;
  for (let k = 0; k < legs.length; k += 1) {
    const tx = legs[k][1];
    const tz = legs[k][2];
    const d = Math.hypot(tx - fx, (tz - fz) * 400) * 0.5;
    const dur = d > 1 ? moveTr(0, d, TR) : 0;
    const start = Math.max(legs[k][0] * L, free);
    if (b < start) break;
    u = dur > 0 ? clamp01((b - start) / dur) : 1;
    const e = ease01(u);
    X = lerp(fx, tx, e);
    z = lerp(fz, tz, e);
    dist = d;
    dx = tx - fx;
    walking = d > 1 && u < 1;
    free = start + dur;
    fx = tx;
    fz = tz;
  }
  return { X, z, u: ease01(u), dist, dx, walking };
}
/** Which way he faces at time `b`, turning through a profile. */
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
/** A wrist's place in a bundle. */
function wristOf(w: Bundle, k: 'wrR' | 'wrL') {
  'worklet';
  const v = w[k];
  return { x: v[0].translateX as number, y: v[1].translateY as number };
}
/**
 * A juror: seated, turned to the hall, and moved by the crowd's sounds. Between the
 * sounds he LISTENS (N21): on every beat, at his own moment in it, he leans in to hear,
 * puts his chin in his hand, or shifts a hand to his knee and back — one of the three,
 * by who he is and which beat it is, so no two neighbours do the same thing at once.
 */
function jurorOf(j: Juror, n: number, f: number, t: number, laugh: number, murmur: number, cheer: number, gasp: number, raise: number): Bundle {
  'worklet';
  let s = postureStill(4, t * 0.9 + j.ph);
  const at = { x: j.x, groundY: j.g, k: j.k, dir: j.dir < 0 ? -1 : 1 };
  const kk = j.k;
  const a0 = 0.08 + (j.ph / 3) * 0.3;
  const u = clamp01((f - a0) / 0.14) * (1 - clamp01((f - a0 - 0.42) / 0.16));
  const kind = (n + Math.round(j.ph * 3)) % 3;
  if (kind === 0) s = leanOf(s, 0.14 * u, 0.1 * u);
  if (kind === 1) s = reachHandTo(s, at, 1, j.x + j.dir * 19 * kk, j.g - 50 * kk, u);
  if (kind === 2) s = reachHandTo(s, at, -1, j.x + j.dir * 24 * kk, j.g - 9 * kk, u);
  // a laugh rocks him back; a murmur leans him to his neighbour; a gasp pulls him upright
  const rock = Math.sin(t * 9 + j.ph * 2.1);
  s = leanOf(s, -0.15 * laugh * j.amp + 0.04 * laugh * rock + 0.09 * murmur * (j.ph > 1.5 ? 1 : -0.6) - 0.1 * gasp,
    -0.12 * laugh * j.amp + 0.1 * murmur - 0.08 * gasp);
  // hands go up for a cheer, up in front for a gasp, and one up with his vote
  const up = Math.max(cheer * j.amp, gasp * 0.8);
  if (up > 0.01) {
    s = reachHandTo(s, at, 1, j.x + j.dir * (cheer >= gasp ? 10 : 20) * kk, j.g - (cheer >= gasp ? 74 : 54) * kk, up);
    s = reachHandTo(s, at, -1, j.x + j.dir * (cheer >= gasp ? 2 : 16) * kk, j.g - (cheer >= gasp ? 76 : 50) * kk, up);
  }
  if (raise > 0.01) s = reachHandTo(s, at, 1, j.x + j.dir * 14 * kk, j.g - 72 * kk, raise * clamp01(j.amp * 1.3));
  return pose(s, j.x, j.g, kk, j.dir, 1);
}
/** His arm from off the frame to a hand at (wx, wy), bent at the elbow away from the middle. */
function armOf(sx: number, sy: number, wx: number, wy: number, out: number) {
  'worklet';
  const dx = wx - sx;
  const dy = wy - sy;
  const d = Math.min(Math.hypot(dx, dy), UPPER + FORE - 2);
  const a = Math.atan2(dy, dx);
  const c = clamp01((UPPER * UPPER + d * d - FORE * FORE) / (2 * UPPER * d));
  const bend = Math.acos(c) * out;
  const ex = sx + Math.cos(a + bend) * UPPER;
  const ey = sy + Math.sin(a + bend) * UPPER;
  return { ex, ey };
}

export default function Hist5Scene({ clock, bt, bi }: SceneApi) {
  const heldP = useHeld();
  const cv = useCarry(25);
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

    // ── the plain one ──────────────────────────────────────────────────────
    const w = legsOf(carrySource(cv, 0, n, 0), carrySource(cv, 1, n, STAND), P_LEGS[n], b, L);
    const X = carry(cv, 0, n, w.X, w.X, 1);
    const z = carry(cv, 1, n, w.z, w.z, 1);
    const d = carry(cv, 2, n, 0, faceOf(carrySource(cv, 2, n, -1), P_TURN[n], b, L), 1);
    const code = P_CODE[n];
    let sp = w.walking
      ? travelStance(0, w.dist, hHold(code, t), hHold(code, t), hLive(code, t, b), w.u, WALK, 0)
      : hLive(code, t, b);
    const ps = sAt(z);
    const px = pX(X, z);
    const pg = pY(EYE, z);
    const pk = 2 * ps;
    const hand = (s: Stance, which: 1 | -1, ox: number, oy: number, wt: number) => {
      'worklet';
      return pHand(s, px, pg, d, which, ox, oy, wt);
    };
    if (a === A.open) {
      // both arms up in front of him as he announces the defendant (never thrown back, AR4)
      const wide = st(0.38, 0.48) * (1 - st(0.86, 1));
      sp = hand(sp, 1, d * 24 * K, -80 * K, wide);
      sp = hand(sp, -1, d * 14 * K, -84 * K, wide);
      sp = leanOf(sp, -0.06 * wide, -0.1 * wide);
    }
    if (a === A.jury) {
      // a hand along the left benches, then (turned) along the right
      sp = hand(sp, 1, d * 28 * K, -66 * K, bp(0.24, 0.32, 0.5) + bp(0.56, 0.64, 0.82));
    }
    // leaning in on "why", and held there while he waits for the reply
    const leanNow = a === A.why ? st(0.55, 0.72) : !LATE[n] && (a === A.ask || a === A.reply) ? 1
      : !LATE[n] && a === A.sour ? 1 - st(0, 0.18) : !LATE[n] && a === A.gloat ? 1 - st(0, 0.1) : 0;
    const lean = carry(cv, 3, n, leanNow, leanNow, tr);
    sp = leanOf(sp, 0.24 * lean, 0.12 * lean);
    if (a === A.sour) {
      // straightened, chin up, sour
      sp = leanOf(sp, -0.04, -0.16 * st(0.08, 0.24));
    }
    if (a === A.gloat) {
      // head back, laughing; then a finger at the defendant
      const ha = bp(0.06, 0.16, 0.36);
      sp = leanOf(sp, -0.16 * ha + 0.04 * ha * Math.sin(t * 12), -0.3 * ha);
      sp = hand(sp, 1, d * 30 * K, -62 * K, bp(0.36, 0.46, 0.72));
    }
    if (a === A.clock) {
      // the plug at the spout, pulled as the line ends
      sp = hand(sp, 1, (SPOUT.x - px) / pk, (SPOUT.y - pg) / pk, bp(0.78, 0.9, 1.15));
    }
    // two discs held up at the urn: one hollow, one solid
    const discsNow = a === A.vote ? st(0.4, 0.5) * (1 - clamp01((b - VOTES_AT[n]) / 0.4)) : 0;
    const discs = carry(cv, 4, n, discsNow, discsNow, tr);
    if (discs > 0.01) {
      sp = hand(sp, 1, d * 24 * K, -80 * K, discs);
      sp = hand(sp, -1, d * 12 * K, -84 * K, discs);
    }
    if (a === A.verdict) {
      // he looks into the urn, and then takes the count
      const look = bp(0.02, 0.12, 0.34);
      sp = leanOf(sp, 0.2 * look, 0.24 * look);
      const v = VERDICT[n];
      const r = st(0.42, 0.6);
      if (v === 1) sp = leanOf(sp, 0.3 * r, 0.3 * r);
      if (v === 2) {
        sp = hand(sp, 1, d * 20 * K, -88 * K, r);
        sp = hand(sp, -1, d * 6 * K, -90 * K, r);
      }
      if (v === 3) {
        sp = hand(sp, 1, d * 26 * K, -78 * K, r);
        sp = hand(sp, -1, d * 20 * K, -82 * K, r);
        sp = leanOf(sp, -0.05 * r, -0.24 * r);
      }
    }
    if (BEATS[n].speaker === 'cap') {
      // he listens to the defendant the way he does everything: impatiently — a sigh
      // that drops his head and lifts it again, once a line (N21)
      const sigh = bp(0.18, 0.4, 0.72);
      sp = leanOf(sp, 0.1 * sigh, 0.2 * sigh);
    }
    const prevP = carryFrom(heldP, n, hHold(code, t));
    const figP = keepHeld(heldP, w.walking ? mixKeepLegs(prevP, sp, tr) : mixStance(prevP, sp, tr));
    const plain = pose(figP, px, pg, K, d, 1);
    const wR = wristOf(plain, 'wrR');
    const wL = wristOf(plain, 'wrL');

    // ── the crowd ──────────────────────────────────────────────────────────
    const laugh = carry(cv, 5, n, 0, react(b, LAUGH_AT[n], 1.7), tr);
    const murmur = carry(cv, 6, n, 0, react(b, MURMUR_AT[n], 1.6), tr);
    const cheer = carry(cv, 7, n, 0, react(b, CHEER_AT[n], 2.4), tr);
    const gasp = carry(cv, 8, n, 0, react(b, GASP_AT[n], 2.0), tr);
    const raiseNow = a === A.vote ? st(0.6, 0.78) * (1 - clamp01((b - VOTES_AT[n] - 0.6) / 0.6)) : 0;
    const raise = carry(cv, 9, n, raiseNow, raiseNow, tr);
    const jur: Bundle[] = [];
    for (let i = 0; i < JURORS.length; i += 1) jur.push(jurorOf(JURORS[i], n, f, t, laugh, murmur, cheer, gasp, raise));

    // ── the water clock, and the votes ─────────────────────────────────────
    const runs = n < POUR_N ? 0 : n === POUR_N ? clamp01((b - POUR_AT[n]) / 0.3)
      : n < DRIP_N ? 1 : n === DRIP_N ? 1 - clamp01((b - DRIP_AT[n]) / 0.6) : 0;
    const water = carry(cv, 10, n, runs, runs, tr);
    const fallNow = a === A.vote ? clamp01((b - VOTES_AT[n]) / 1.6) : a > A.vote ? 1 : 0;
    const fallen = carry(cv, 24, n, fallNow, fallNow, tr);

    // ── his head: where it turns, how it tips, and where he walks ──────────
    const fol = FOLLOW[n] * (px - 200) * 0.6;
    const yawNow = keyAt(CAMS[n], f, 1) + fol;
    let pitchNow = keyAt(CAMS[n], f, 2) + (FOLLOW[n] && z < 0.6 ? 18 * (1 - z / 0.6) : 0);
    const rNow = a < A.door ? 1 : a === A.door ? 1 + 1.2 * st(0.12, 0.6) : a === A.open ? 2.2 + 3.2 * st(0.24, 0.4) : 5.4;
    // a walk bobs the head, a step at a time, by the distance walked (AL)
    const walkU = a === A.door ? clamp01((f - 0.12) / 0.48) : a === A.open ? clamp01((f - 0.24) / 0.16) : 0;
    const steps = a === A.door ? 5 : 2;
    pitchNow -= walkU > 0 && walkU < 1 ? 5 * Math.abs(Math.sin(Math.PI * steps * walkU)) : 0;
    const yaw = carry(cv, 11, n, yawNow, yawNow, tr);
    const pitch = carry(cv, 12, n, pitchNow, pitchNow, tr);
    const R = carry(cv, 13, n, rNow, rNow, tr);
    const lidNow = a === A.wake ? 1 - Math.max(bp(0.06, 0.12, 0.2) * 0.55, st(0.28, 0.42))
      : a === A.sleep ? st(0.72, 0.95) : a === A.rest || a === A.summary ? 1 : 0;
    const lid = carry(cv, 14, n, lidNow, lidNow, tr);
    const doorNow = n < A.open ? 0 : a === A.open ? st(0.02, 0.2) : 1;
    const door = carry(cv, 15, n, doorNow, doorNow, tr);
    const bedNow = n < A.door ? 0 : a === A.door ? st(0, 0.22) : 1;
    const bed = carry(cv, 16, n, bedNow, bedNow, tr);
    const roomNow = n < A.open ? 1 : a === A.open ? 1 - st(0.38, 0.42) : 0;
    const room = carry(cv, 17, n, roomNow, roomNow, tr);
    const flashNow = a === A.open ? 0.4 * bp(0.05, 0.18, 0.5) : 0;
    const flash = carry(cv, 18, n, flashNow, flashNow, tr);
    const courtNow = n < A.open ? 0 : a === A.open ? st(0.01, 0.05) : 1;
    const court = carry(cv, 19, n, courtNow, courtNow, tr);
    const cz = Math.min(1, 0.2 * R);
    const cu = clamp01((cz - 0.44) / 0.56);
    const ax = DOOR.x;
    const ay = lerp(DOOR.y, 318, cu);

    // ── his hands ──────────────────────────────────────────────────────────
    let rx = keyAt(ARMS[n], f, 1);
    let ry = keyAt(ARMS[n], f, 2);
    const lxh = keyAt(ARMS[n], f, 3);
    const lyh = keyAt(ARMS[n], f, 4);
    // the door handle, where it is on the screen; it swings in with the door
    const hx = DOOR.x + (HANDLE.x - (HANDLE.x - 160) * 2 * door * 0.44 - DOOR.x) * R - yaw;
    const hy = DOOR.y + (HANDLE.y - DOOR.y) * R + pitch;
    const onHandle = a === A.door ? st(0.58, 0.72) : a === A.open ? 1 - st(0.16, 0.26) : 0;
    rx = lerp(rx, hx, onHandle);
    ry = lerp(ry, hy, onHandle);
    const RX = carry(cv, 20, n, rx, rx, tr);
    const RY = carry(cv, 21, n, ry, ry, tr);
    const LX = carry(cv, 22, n, lxh, lxh, tr);
    const LY = carry(cv, 23, n, lyh, lyh, tr);
    const armR = armOf(SH_R.x, SH_R.y, RX, RY, 1);
    const armL = armOf(SH_L.x, SH_L.y, LX, LY, -1);

    return {
      plain, jur, t,
      pw: { x: px, y: pg, s: pk },
      held: { r: wR, l: wL, o: discs },
      water, fallen,
      head: { yaw, pitch, R, cz, ax, ay, room, court, door, bed, flash, lid },
      arms: { rx: RX, ry: RY, lx: LX, ly: LY, rex: armR.ex, rey: armR.ey, lex: armL.ex, ley: armL.ey },
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.plain);

  // the head: the bedroom scaled about its door, the court about the doorway
  const roomT = useAnimatedStyle(() => {
    const h = SCENE.value.head;
    return {
      opacity: h.room,
      transform: [{ translateX: DOOR.x * (1 - h.R) - h.yaw }, { translateY: DOOR.y * (1 - h.R) + h.pitch }, { scale: h.R }],
    };
  });
  const courtT = useAnimatedStyle(() => {
    const h = SCENE.value.head;
    return {
      opacity: h.court,
      transform: [{ translateX: h.ax - 200 * h.cz - h.yaw }, { translateY: h.ay - 318 * h.cz + h.pitch }, { scale: h.cz }],
    };
  });
  const bodyT = useAnimatedStyle(() => {
    const h = SCENE.value.head;
    return { opacity: h.court, transform: [{ translateX: -0.4 * h.yaw }, { translateY: h.pitch }] };
  });
  const leafT = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 0.88 * SCENE.value.head.door }] }));
  const lightT = useAnimatedStyle(() => ({ opacity: SCENE.value.head.door }));
  const duvetT = useAnimatedStyle(() => ({ transform: [{ translateY: 340 * SCENE.value.head.bed }] }));
  const flashT = useAnimatedStyle(() => ({ opacity: SCENE.value.head.flash }));
  const plainT = useAnimatedStyle(() => {
    const p = SCENE.value.pw;
    return { transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.s }, { translateX: -p.x }, { translateY: -p.y }] };
  });
  const streamT = useAnimatedStyle(() => ({ opacity: SCENE.value.water }));
  // the eyelids: a curved lid down from the top and up from the bottom, and black once shut
  const lidTop = useAnimatedStyle(() => ({ transform: [{ translateY: 214 * SCENE.value.head.lid }] }));
  const lidBot = useAnimatedStyle(() => ({ transform: [{ translateY: -214 * SCENE.value.head.lid }] }));
  const shut = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.head.lid - 0.8) / 0.2) }));

  return (
    <View style={styles.scene}>
      {/* the court */}
      <Animated.View style={[styles.layer, courtT]} pointerEvents="none">
        <SetArt parts={COURT_SHELL} tone={TONE} line={0.6} />
        <SetArt parts={COLUMNS} tone={TONE} line={1.2} />
        <SetArt parts={BENCHES} tone={TONE} line={1} />
        <SetArt parts={CROWD} tone={TONE} line={0.5} />
        {JURORS.slice(0, NEAR_FROM).map((j, i) => <JurorFig key={i} i={i} k={j.k} ink={j.ink} S={SCENE} />)}
        <ObjectArt parts={BLOCK_ART} tone={TONE} />
        <ObjectArt parts={POT_ART} tone={TONE} />
        <ObjectArt parts={WOOD_ART} tone={TONE} />
        <ObjectArt parts={URN_ART} tone={TONE} />
        <Votes S={SCENE} />
        <Animated.View style={[styles.plain, plainT]} pointerEvents="none">
          {/* cast: plain */}
          <Stickman D={DP} k={K} role="lead" wear={[]} />
          <Held S={SCENE} which="r" />
          <Held S={SCENE} which="l" />
        </Animated.View>
        <Animated.View style={[styles.stream, streamT]} pointerEvents="none" />
        <ObjectArt parts={LOW_ART} tone={TONE} />
        {JURORS.slice(NEAR_FROM).map((j, i) => <JurorFig key={i} i={NEAR_FROM + i} k={j.k} ink={j.ink} S={SCENE} />)}
      </Animated.View>
      {/* the bedroom */}
      <Animated.View style={[styles.layer, roomT]} pointerEvents="none">
        <SetArt parts={ROOM_SET} tone={TONE} line={0.8} />
        <Animated.View style={[styles.layer, lightT]} pointerEvents="none">
          <SetArt parts={DOOR_LIGHT} tone={TONE} line={0} />
        </Animated.View>
        <Animated.View style={[styles.leaf, leafT]} pointerEvents="none">
          <SetArt parts={DOOR_LEAF} tone={TONE} line={1} />
        </Animated.View>
        <ObjectArt parts={POSTER_ART} tone={TONE} />
        <ObjectArt parts={TABLE_ART} tone={TONE} />
        <ObjectArt parts={LAMP_ART} tone={TONE} />
        <ObjectArt parts={PENDANT_ART} tone={TONE} />
        <Animated.View style={[styles.layer, duvetT]} pointerEvents="none">
          <SetArt parts={DUVET} tone={TONE} line={1} />
        </Animated.View>
      </Animated.View>
      {/* his body, when he looks down at it */}
      <Animated.View style={[styles.layer, bodyT]} pointerEvents="none">
        <View style={[styles.bone, styles.torso]} />
        <View style={[styles.bone, styles.legL]} />
        <View style={[styles.bone, styles.legR]} />
        <View style={[styles.bone, styles.footL]} />
        <View style={[styles.bone, styles.footR]} />
      </Animated.View>
      <Arms S={SCENE} />
      <Animated.View style={[styles.flash, flashT]} pointerEvents="none" />
      {/* his eyelids */}
      <Animated.View style={[styles.lidTop, lidTop]} pointerEvents="none" />
      <Animated.View style={[styles.lidBot, lidBot]} pointerEvents="none" />
      <Animated.View style={[styles.shut, shut]} pointerEvents="none" />
    </View>
  );
}

// ── the pieces that move ─────────────────────────────────────────────────────

type SceneValue = SharedValue<any>;

function JurorFig({ i, k, ink, S }: { i: number; k: number; ink: string; S: SceneValue }) {
  const D = useDerivedValue<Bundle>(() => S.value.jur[i]);
  return (
    <>
      {/* extra: juror */}
      <Stickman D={D} k={k} color={ink} role="crowd" wear={[]} />
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
    const on = u > 0 && u < 1 ? 1 : 0;
    return {
      opacity: on,
      transform: [{ translateX: URN_MOUTH.x + (v % 3 - 1) * 3 }, { translateY: URN_MOUTH.y - 46 + 46 * u * u }],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]} pointerEvents="none">
      <ObjectArt parts={VOTE_DISC_ART} tone={TONE} />
    </Animated.View>
  );
}

/** His two arms, from off the foot of the frame: an upper arm, a forearm and a hand. */
function Arms({ S }: { S: SceneValue }) {
  return (
    <>
      <Bone S={S} from="r" part="upper" />
      <Bone S={S} from="r" part="fore" />
      <Bone S={S} from="l" part="upper" />
      <Bone S={S} from="l" part="fore" />
      <Hand S={S} from="r" />
      <Hand S={S} from="l" />
    </>
  );
}
const ARM_T = 17;
function Bone({ S, from, part }: { S: SceneValue; from: 'r' | 'l'; part: 'upper' | 'fore' }) {
  const st = useAnimatedStyle(() => {
    const m = S.value.arms;
    const sx = from === 'r' ? SH_R.x : SH_L.x;
    const sy = from === 'r' ? SH_R.y : SH_L.y;
    const ex = from === 'r' ? m.rex : m.lex;
    const ey = from === 'r' ? m.rey : m.ley;
    const wx = from === 'r' ? m.rx : m.lx;
    const wy = from === 'r' ? m.ry : m.ly;
    const x0 = part === 'upper' ? sx : ex;
    const y0 = part === 'upper' ? sy : ey;
    const x1 = part === 'upper' ? ex : wx;
    const y1 = part === 'upper' ? ey : wy;
    const len = Math.hypot(x1 - x0, y1 - y0);
    return {
      width: len + ARM_T,
      transform: [{ translateX: x0 - ARM_T / 2 }, { translateY: y0 - ARM_T / 2 },
        { rotate: `${Math.atan2(y1 - y0, x1 - x0)}rad` }],
    };
  });
  return <Animated.View style={[styles.arm, st]} pointerEvents="none" />;
}
function Hand({ S, from }: { S: SceneValue; from: 'r' | 'l' }) {
  const st = useAnimatedStyle(() => {
    const m = S.value.arms;
    return { transform: [{ translateX: (from === 'r' ? m.rx : m.lx) - 13 }, { translateY: (from === 'r' ? m.ry : m.ly) - 13 }] };
  });
  return <Animated.View style={[styles.hand, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%', overflow: 'hidden' },
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  leaf: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '160px 375px' },
  plain: { position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  stream: {
    position: 'absolute', left: SPOUT.x - 1.2, top: SPOUT.y, width: 2.4, height: LOW_MOUTH - SPOUT.y,
    backgroundColor: NATURAL.water.base, borderRadius: 1.2,
  },
  bone: { position: 'absolute', backgroundColor: INK, borderRadius: 12 },
  // his body seen from his eyes: the chest at the foot of the frame, the pelvis, two legs to the floor
  torso: { left: 188, top: 640, width: 24, height: 200 },
  legL: { left: 176, top: 560, width: 18, height: 96, transform: [{ rotate: '-14deg' }] },
  legR: { left: 208, top: 558, width: 18, height: 96, transform: [{ rotate: '14deg' }] },
  footL: { left: 156, top: 554, width: 30, height: 16 },
  footR: { left: 222, top: 552, width: 30, height: 16 },
  arm: { position: 'absolute', left: 0, top: 0, height: ARM_T, borderRadius: ARM_T / 2, backgroundColor: INK, transformOrigin: `${ARM_T / 2}px ${ARM_T / 2}px` },
  hand: { position: 'absolute', left: 0, top: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: INK },
  flash: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: NATURAL.skyGlow.base },
  lidTop: { position: 'absolute', left: -160, top: -604, width: 720, height: 720, borderRadius: 360, backgroundColor: INK },
  lidBot: { position: 'absolute', left: -160, top: 520, width: 720, height: 720, borderRadius: 360, backgroundColor: INK },
  shut: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, backgroundColor: INK },
});

export function Hist5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Hist5Scene} band={[118, 518]} />;
}
