import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { BEATS } from './epistemology4Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, stand, travelStance,
  type Bundle, type Stance, mixKeepLegs,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, facing, pickAt,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { attendAt } from './attend';
import { lineOf, stage } from './pace';
import {
  appleTrunk, appleCrown, imageTrunk, imageCrown, outsideGround, wall, desk, paperRail, sun,
  OUTSIDE, TREE, WALL_X, HOLE, PAPER, DESK, SHEET, CORD,
} from './epistemology4Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// epistemology-knowledge-4, "Where Does Knowledge Come From?" — A DARK CLOSET WITH
// ONE OPENING, which is Locke's own picture of the understanding.
//
// Redrawn 2026-09-26: the third lesson of the branch in reading order. Every act is
// laid across its voiced line in stages (pace.ts, line lengths from the manifest).
//
//   b0   he stands before a blank sheet of white paper; EXPERIENCE and REASON go up.
//   b1   he points at the blank paper, goes to the shutter in the wall and opens it:
//        the tree outside falls onto the paper, upside down; then he taps his head.
//   b3   the red apple outside lands on the paper as a red mark; he feels the warmth
//        of the beam with his hand; a red mark, a round and a stem slide together
//        into an apple.
//   b5   he closes the shutter and goes to his desk.
//   b6   with a compass he draws a perfect circle.
//   b7   from the other end of the desk he lays four triangles into the doubled
//        square, a question mark rising at each.
//   b8   the outline of the doubled square was there before he began; it glows.
//   b9   Q1: four names pinned on the white paper.
//   b10  he goes back and opens the shutter again: the image returns.
//   b11  he pulls the cord by the paper and a grid comes down over the image:
//        SPACE · TIME · CAUSE.
//
// COMPOSITION, in stage units: outside 0–62; the wall 62–76, its opening at (76, 440);
// the paper 282–392 × 356–438; the desk 176–244 with its sheet at 180–240; the cord at
// 268. He stands at 96 at the shutter, 112 in the room, 164 and 270 at the ends of
// the desk, 250 at the cord. Band [288, 514].
//
// RESTAGED 2026-09-28 — the owner: "if something's happening on scene, the stick man
// should be looking at it." Twice the payoff of opening the shutter (b1, b10) happened
// at his back: he faced the opening while the image landed on the paper behind him.
// Now he opens it and TURNS (eased, through a profile) to watch the image arrive. He
// starts the lesson at 112, under EXPERIENCE, so both plates go up in front of him;
// the plates hang lower (top 340, not 316), over the opening and the desk they name
// rather than in the sky over the room; and the tree outside is redrawn against a
// photograph (epistemology4Set.ts) — it read as a mushroom.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('epistemology');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const LEAF = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, epistemology-knowledge-4. */
const LINES = [7.72, 8.16, 5.64, 9.2, 0, 6.44, 7.96, 10.76, 5.4, 0, 5.88, 6.88, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_E = K_FIG * 0.82;

const X = BEATS.map((b) => b.x ?? 250);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_BLANK = is('blank');
const A_OPEN = is('open');
const A_FED = is('fed');
const A_SIMPLE = is('simple');
const A_SHUT = is('shut');
const A_COMPASS = is('compass');
const A_MENO = is('meno');
const A_RECALL = is('recall');
const A_KANT = is('kant');
const A_FORMS = is('forms');
const flag = (k: keyof (typeof BEATS)[number]) => BEATS.map((b) => (b[k] ? 1 : 0));
const LIT = flag('lit');
const APPLE = flag('apple');
const CIRCLE = flag('circle');
const TILES = flag('tiles');
const GRID = flag('grid');
const NAMES = flag('names');
const EXP_ON = BEATS.map((b) => ((b.plates ?? 0) >= 1 ? 1 : 0));
/** The sort is being answered: the paper shows how much of it reason supplies (R7c). */
const SORT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));
/** How much of the paper reason's grid claims, in the bins' own order: none, some, all. */
const REASON_SHARE = [0, 0.5, 1];
/** Which way he faces once a beat settles. */
// Where a beat ENDS facing. b1 (open) and b10 (kant) work the shutter facing left and
// then turn to the paper, so both end facing right; the scene turns them in the beat.
const DIR = BEATS.map((b) => (b.act === 'meno' || b.act === 'recall' ? -1 : 1));
/** When b1 and b10 turn from the shutter to the paper, as the image starts to land. */
const TURN_OPEN = 3.0;
const TURN_KANT = 4.1;
/** The plates' top, and their centre line — the look targets read it. */
const PLATE_TOP = 340;
const PLATE_Y = PLATE_TOP + 7;
/** The image on the paper: the same tree, small, laid out in the paper's own units. */
const IMG = { x: 30, y: 44 };
/** The red apple in the image, in STAGE units: flipped about IMG.y inside a view 6 down the paper. */
const IMG_APPLE = { x: PAPER.x0 + IMG.x + 6.5, y: PAPER.top + 6 + 2 * IMG.y - (IMG.y - 18 + 3.5) };

const NAME_Q = [
  { id: 'locke', label: 'LOCKE', x: 309, y: 366, correct: true },
  { id: 'descartes', label: 'DESCARTES', x: 365, y: 366, correct: false },
  { id: 'plato', label: 'PLATO', x: 309, y: 402, correct: false },
  { id: 'leibniz', label: 'LEIBNIZ', x: 365, y: 402, correct: false },
];
const CARD_W = 54;
const CARD_H = 24;
/** The compass circle and the doubled square, on the desk's sheet. */
const CIRC = { x: 192, y: 439, r: 8 };
const SQ = { x: 229, y: 439, r: 10 };

function hHold(code: number, t: number): Stance {
  'worklet';
  if (code >= 100) return emoteAny(code, t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code >= 100) return emoteAnyLive(code, t, bt);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}
function handOn(s: Stance, x: number, dir: number, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_E, dir: dir < 0 ? -1 : 1 }, 1, tx, ty, w);
}
/**
 * A walk between stops inside one beat: each leg is [to, start-seconds], walked at the
 * pace its distance needs. Returns where he is and how far into the current leg.
 */
function legAt(b: number, x0: number, legs: readonly (readonly number[])[]): { x: number; from: number; to: number; u: number } {
  'worklet';
  let from = x0;
  for (let k = 0; k < legs.length; k++) {
    const to = legs[k][0];
    const start = legs[k][1];
    const dur = moveTr(from, to, TR);
    if (b < start) return { x: from, from, to: from, u: 1 };
    if (b < start + dur) {
      const u = ease01((b - start) / dur);
      return { x: lerp(from, to, u), from, to, u };
    }
    from = to;
  }
  return { x: from, from, to: from, u: 1 };
}
/** b5: close the shutter, then to the desk. */
const SHUT_LEGS = [[164, 0.9]];
/** b7: round to the far end of the desk. */
const MENO_LEGS = [[270, 0.3]];
/** b10: back to the shutter. */
const KANT_LEGS = [[96, 0.2]];
/** b11: across to the cord by the paper. */
const FORMS_LEGS = [[250, 0.2]];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology'));

export default function Epistemology4Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(27);
  const on = useLinger(i);
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
    const sec = (a: number, z: number) => {
      'worklet';
      return ease01(clamp01((b - a) / (z - a)));
    };
    const pulse = (a: number, m: number, z: number) => {
      'worklet';
      return sec(a, m) * (1 - sec(m, z));
    };

    // ── where he is ──────────────────────────────────────────────────────────
    const xp = X[p];
    const xn = X[n];
    const legs = A_SHUT[n] ? SHUT_LEGS : A_MENO[n] ? MENO_LEGS : A_KANT[n] ? KANT_LEGS : A_FORMS[n] ? FORMS_LEGS : null;
    const leg = legs ? legAt(b, xp, legs) : null;
    const walking = !leg && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    const tx = leg ? leg.x : xn;
    const x = n === 0 ? tx : carry(cv, 0, n, xp, tx, walking ? walkU : leg ? 1 : tr);
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    const moving = leg ? leg.u < 1 && leg.to !== leg.from : false;
    if (leg && moving) s = travelStance(leg.from, leg.to, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), leg.u, WALK, 0);

    // facing: the way he walks, then what the beat is about
    let dirV = walking
      ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
      : facing(DIR[p], DIR[n], b);
    // b1: walk to the shutter facing it, open it, then turn to the paper for the image
    if (A_OPEN[n]) dirV = b < TURN_OPEN ? facing(DIR[p], -1, b) : facing(-1, 1, b - TURN_OPEN);
    if (A_SIMPLE[n]) dirV = 1 - 2 * sec(2.7, 2.95) + 2 * sec(4.9, 5.15);
    if (A_SHUT[n]) dirV = lerp(facing(DIR[p], -1, b), 1, sec(0.8, 1.0));
    if (leg && !A_SHUT[n]) {
      const tv = leg.to !== leg.from ? (leg.to > leg.from ? 1 : -1) : DIR[n];
      dirV = moving ? tv : lerp(tv, DIR[n], sec(0.0, 0.01));
      if (A_MENO[n]) dirV = lerp(facing(DIR[p], 1, b), -1, sec(2.05, 2.35));
      if (A_KANT[n]) dirV = b < TURN_KANT ? facing(DIR[p], -1, b) : facing(-1, 1, b - TURN_KANT);
      if (A_FORMS[n]) dirV = facing(DIR[p], 1, b);
    }
    // what is on screen at a tap is where the facing starts, so a tap mid-turn eases on
    // from it instead of mirroring him (the carry, over the first third of a second)
    const du = clamp01(b / 0.36);
    dirV = carry(cv, 26, n, DIR[p], dirV, du * du * (3 - 2 * du));
    const dir = dirV < 0 ? -1 : 1;

    // ── b1: pointing at the blank paper, the shutter, a tap to his head ─────
    const pointPaper = A_OPEN[n] ? 0 : A_BLANK[n] ? pulse(1.0, 1.6, 3.4) : 0;
    s = handOn(s, x, dir, PAPER.x0 + 20, 420, pointPaper);
    const shutterHand = (A_OPEN[n] ? pulse(2.2, 2.6, 3.2) : 0) + (A_SHUT[n] ? pulse(0.05, 0.35, 0.75) : 0) + (A_KANT[n] ? pulse(3.2, 3.55, 4.1) : 0);
    s = handOn(s, x, dir, HOLE.x + 4, HOLE.y - 2, shutterHand);
    const tapHead = A_OPEN[n] ? pulse(6.3, 6.7, 7.8) : 0;
    s = mixStance(s, { ...s, fistR: { x: 4, y: -70 } }, tapHead);
    // ── b3: the hand held into the warm beam, and pulled back ───────────────
    const warm = A_SIMPLE[n] ? pulse(3.0, 3.35, 4.7) : 0;
    s = handOn(s, x, dir, HOLE.x + 12, HOLE.y, warm);
    const flinch = A_SIMPLE[n] ? pulse(4.0, 4.2, 4.7) : 0;
    s = { ...s, tilt: s.tilt + 0.1 * flinch };
    // ── b6: the compass round the circle ────────────────────────────────────
    const drawing = A_COMPASS[n] ? sec(0.8, 1.2) * (1 - sec(6.2, 6.6)) : 0;
    const ang = A_COMPASS[n] ? 2 * Math.PI * sec(1.4, 5.6) : 0;
    s = handOn(s, x, dir, CIRC.x + CIRC.r * Math.cos(ang), CIRC.y - 8 + CIRC.r * 0.5 * Math.sin(ang), drawing);
    // ── b7: four triangles laid, one after another ─────────────────────────
    const layAt = [3.0, 4.6, 6.2, 7.8];
    let lay = 0;
    for (let k = 0; k < 4; k++) lay += A_MENO[n] ? pulse(layAt[k] - 0.5, layAt[k], layAt[k] + 0.4) : 0;
    s = handOn(s, x, dir, SQ.x + 4, SQ.y - 2, lay);
    // ── b11: the cord pulled ────────────────────────────────────────────────
    const cordHand = A_FORMS[n] ? pulse(3.2, 3.5, 4.6) : 0;
    s = handOn(s, x, dir, CORD.x, CORD.handle + 6 * sec(3.5, 4.0), cordHand);

    // on a walking beat the feet are the walk's own (rig.mixKeepLegs): blending them from
    // the last beat's standing feet dragged the planted foot along the floor
    const prevPose = carryFrom(held, n, hHold(P[p], t));
    const fig = keepHeld(held, (walking ? mixKeepLegs(prevPose, s, tr) : mixStance(prevPose, s, tr)));

    // ── the room ─────────────────────────────────────────────────────────────
    const lit = A_OPEN[n] ? sec(2.6, 3.2) : A_SHUT[n] ? 1 - sec(0.35, 0.75) : A_KANT[n] ? sec(3.55, 4.1) : LIT[n];
    const image = A_OPEN[n] ? sec(2.9, 4.2) : A_SHUT[n] ? 1 - sec(0.4, 1.0) : A_KANT[n] ? sec(3.8, 4.8) : LIT[n];
    const red = A_SIMPLE[n] ? sec(0.6, 1.4) : APPLE[n] || A_FED[n] ? 0 : 0;
    const join = A_SIMPLE[n] ? sec(5.6, 7.6) : APPLE[n];
    const exp = A_BLANK[n] ? sec(5.2, 5.8) : EXP_ON[n];
    const reason = A_BLANK[n] ? sec(5.9, 6.5) : EXP_ON[n];
    const glowExp = A_FED[n] ? pulse(0.4, 1.0, 5.0) : 0;
    const glowReason = A_SHUT[n] ? pulse(1.0, 1.6, 5.5) : 0;
    const circle = A_COMPASS[n] ? sec(1.4, 5.6) : CIRCLE[n];
    const tiles = A_MENO[n] ? layAt.map((a) => sec(a - 0.1, a + 0.2)) : [TILES[n], TILES[n], TILES[n], TILES[n]];
    const asks = A_MENO[n] ? layAt.map((a) => pulse(a - 0.3, a + 0.2, a + 1.3)) : [0, 0, 0, 0];
    const outline = A_MENO[n] ? 0.35 : A_RECALL[n] ? 0.35 + 0.65 * pulse(0.6, 1.6, 4.8) : TILES[n] ? 0.35 : 0;
    const grid = A_FORMS[n] ? sec(3.5, 4.8) : GRID[n];
    const share = SORT[n] ? pickAt(REASON_SHARE, pickPos.value) : 1;

    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // At what is happening, when it happens, and at nothing (weight 0, his pose's own
    // head) when nothing is: the paper, the opening as he opens it, the image as it
    // lands, the apple outside, his own hand in the beam, the compass point, the
    // doubled square, the cord and the grid coming down. The image on the paper sits
    // about IMG (30, 44) into it; the apple assembles about (84, 40); the plates are
    // EXPERIENCE at x 120 and REASON at x 209, both at PLATE_Y. The apple in the image
    // on the paper (upside down) is IMG_APPLE.
    const paperMid = { x: (PAPER.x0 + PAPER.x1) / 2, y: (PAPER.top + PAPER.bottom) / 2 };
    const LK = A_BLANK[n] ? [0.3, paperMid.x, paperMid.y, 1, 4.9, 120, PLATE_Y, 0.9, 5.8, 209, PLATE_Y, 0.9, L * 0.95, 0, 0, 0]
      // b1: the opening as he opens it; he turns (3.0s) and watches the image land; the
      // red apple in it ("from sensation"); nothing as he taps his head
      : A_OPEN[n] ? [0.2, HOLE.x, HOLE.y - 2, 1, 3.2, PAPER.x0 + 30, PAPER.top + 44, 0.9,
        4.8, IMG_APPLE.x, IMG_APPLE.y, 0.9, 6.1, 0, 0, 0]
      : A_FED[n] ? [0.3, 120, PLATE_Y, 0.8, 2.4, PAPER.x0 + 30, PAPER.top + 44, 1, L * 0.92, 0, 0, 0]
      : A_SIMPLE[n] ? [0.4, PAPER.x0 + 30, PAPER.top + 44, 1, 2.8, HOLE.x + 12, HOLE.y, 1,
        4.9, PAPER.x0 + 84, PAPER.top + 40, 1, L * 0.93, 0, 0, 0]
      : A_SHUT[n] ? [0.05, HOLE.x, HOLE.y - 2, 1, 1.0, 0, 0, 0, 2.4, 209, PLATE_Y, 0.8, 5.6, 0, 0, 0]
      // b6: he follows the compass point round the circle
      : A_COMPASS[n] ? [0.6, CIRC.x + CIRC.r * Math.cos(ang), CIRC.y + CIRC.r * 0.5 * Math.sin(ang), 1, 6.7, 0, 0, 0]
      : A_MENO[n] ? [0.3, 0, 0, 0, 2.2, SQ.x, SQ.y, 1, 8.4, SQ.x, SQ.y - 14, 0.8, L * 0.94, 0, 0, 0]
      : A_RECALL[n] ? [0.3, SQ.x, SQ.y, 1, 4.9, 0, 0, 0]
      : NAMES[n] ? [0.3, paperMid.x, paperMid.y, 0.7]
      : A_KANT[n] ? [0.2, 0, 0, 0, 1.8, HOLE.x, HOLE.y - 2, 1, 4.3, PAPER.x0 + 30, PAPER.top + 44, 0.9]
      : A_FORMS[n] ? [0.2, 0, 0, 0, 2.4, CORD.x, CORD.handle, 1,
        3.6, paperMid.x, lerp(PAPER.top, paperMid.y, grid), 1, L * 0.93, 0, 0, 0]
      : SORT[n] ? [0.3, paperMid.x, paperMid.y, 0.6]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    return {
      fig: lookPose(fig, x, GROUND, K_E, dirV, 1, carry(cv, 23, n, lk.x, lk.x, tr), carry(cv, 24, n, lk.y, lk.y, tr), carry(cv, 25, n, 0, lk.w, tr)),
      lit: carry(cv, 1, n, LIT[p], lit, tr),
      image: carry(cv, 2, n, LIT[p], image, tr),
      red: carry(cv, 3, n, 0, red, tr),
      join: carry(cv, 4, n, APPLE[p], join, tr),
      exp: carry(cv, 5, n, EXP_ON[p], exp, tr),
      reason: carry(cv, 6, n, EXP_ON[p], reason, tr),
      glowExp: carry(cv, 7, n, 0, glowExp, tr),
      glowReason: carry(cv, 8, n, 0, glowReason, tr),
      circle: carry(cv, 9, n, CIRCLE[p], circle, tr),
      tiles: [carry(cv, 10, n, TILES[p], tiles[0], tr), carry(cv, 16, n, TILES[p], tiles[1], tr),
        carry(cv, 17, n, TILES[p], tiles[2], tr), carry(cv, 18, n, TILES[p], tiles[3], tr)],
      asks: [carry(cv, 19, n, 0, asks[0], tr), carry(cv, 20, n, 0, asks[1], tr), carry(cv, 21, n, 0, asks[2], tr), carry(cv, 22, n, 0, asks[3], tr)],
      outline: carry(cv, 11, n, TILES[p] ? 0.35 : 0, outline, tr),
      grid: carry(cv, 12, n, GRID[p], grid, tr),
      names: carry(cv, 13, n, NAMES[p], NAMES[n], tr),
      share: carry(cv, 14, n, 1, share, tr),
      compass: carry(cv, 15, n, 0, drawing, tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const compass = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    return { opacity: SCENE.value.compass, transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }] };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.room} pointerEvents="none" />
      <View style={styles.sky} pointerEvents="none" />
      <ObjectArt parts={SUN_ART} tone={WOOD} />
      <ObjectArt parts={GROUND_ART} tone={LEAF} />
      <SetArt parts={TRUNK_ART} tone={WOOD} />
      <SetArt parts={CROWN_ART} tone={LEAF} />
      <View style={styles.treeApple} pointerEvents="none" />
      <ObjectArt parts={WALL_ART} tone={WALL} />
      <Shutter S={SCENE} />
      <Plates S={SCENE} on={on} />
      <Beam S={SCENE} />
      <ObjectArt parts={RAIL_ART} tone={WOOD} />
      <Paper S={SCENE} on={on} />
      <Cord />
      <ObjectArt parts={DESK_ART} tone={WOOD} />
      <Sheet S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_E} />
      <Animated.View style={[styles.rider, compass]} pointerEvents="none">
        <View style={[styles.compassLeg, { transform: [{ rotate: '18deg' }] }]} />
        <View style={[styles.compassLeg, { transform: [{ rotate: '-18deg' }] }]} />
      </Animated.View>
      {NAMES[i] ? <Names picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const TRUNK_ART = appleTrunk();
const CROWN_ART = appleCrown();
const GROUND_ART = outsideGround();
/** The image's crown is centred a little above IMG, so the flipped tree stays on the paper. */
const IMG_S = 0.62;
const IMG_TRUNK = imageTrunk(IMG.x, IMG.y - 10, IMG_S);
const IMG_CROWN = imageCrown(IMG.x, IMG.y - 10, IMG_S);
const WALL_ART = wall();
const DESK_ART = desk();
const RAIL_ART = paperRail();
const SUN_ART = sun();

// ── the shutter over the opening ────────────────────────────────────────────

function Shutter({ S }: { S: SharedValue<any> }) {
  // hinged at its top edge, it swings up and out of the way
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${-80 * S.value.lit}deg` }] }));
  return <Animated.View style={[styles.shutter, st]} pointerEvents="none" />;
}

// ── EXPERIENCE over the opening, REASON over the desk ───────────────────────

function Plates({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const exp = useAnimatedStyle(() => ({ opacity: S.value.exp, transform: [{ scale: 1 + 0.1 * S.value.glowExp }] }));
  const reason = useAnimatedStyle(() => ({ opacity: S.value.reason, transform: [{ scale: 1 + 0.1 * S.value.glowReason }] }));
  const expFill = useAnimatedStyle(() => ({ opacity: S.value.glowExp }));
  const reasonFill = useAnimatedStyle(() => ({ opacity: S.value.glowReason }));
  if (!on(EXP_ON)) return null;
  return (
    <>
      <Animated.View style={[styles.plate, { left: 82, width: 76 }, exp]} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFill, styles.plateGlow, expFill]} />
        <Text style={styles.plateText} numberOfLines={1}>EXPERIENCE</Text>
      </Animated.View>
      <Animated.View style={[styles.plate, { left: 178, width: 62 }, reason]} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFill, styles.plateGlow, reasonFill]} />
        <Text style={styles.plateText} numberOfLines={1}>REASON</Text>
      </Animated.View>
    </>
  );
}

// ── the beam through the opening ─────────────────────────────────────────────

const BEAM_UP = { len: Math.hypot(PAPER.x0 - HOLE.x, PAPER.top - HOLE.y + 4), deg: (Math.atan2(PAPER.top - HOLE.y + 4, PAPER.x0 - HOLE.x) * 180) / Math.PI };
const BEAM_DN = { len: Math.hypot(PAPER.x0 - HOLE.x, PAPER.bottom - HOLE.y - 4), deg: (Math.atan2(PAPER.bottom - HOLE.y - 4, PAPER.x0 - HOLE.x) * 180) / Math.PI };
function Beam({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.55 * S.value.lit }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <View style={[styles.beam, { width: BEAM_UP.len, top: HOLE.y - 4, transform: [{ rotate: `${BEAM_UP.deg}deg` }] }]} />
      <View style={[styles.beam, { width: BEAM_DN.len, top: HOLE.y + 4, transform: [{ rotate: `${BEAM_DN.deg}deg` }] }]} />
    </Animated.View>
  );
}

// ── the white paper, the image on it, and the grid that comes down over it ──

function Paper({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const image = useAnimatedStyle(() => ({ opacity: S.value.image }));
  const red = useAnimatedStyle(() => ({ opacity: S.value.red * (1 - S.value.join) }));
  const parts = useAnimatedStyle(() => ({ opacity: (1 - S.value.join) * S.value.red }));
  const whole = useAnimatedStyle(() => ({ opacity: S.value.join, transform: [{ scale: 0.6 + 0.4 * S.value.join }] }));
  const slideL = useAnimatedStyle(() => ({ transform: [{ translateX: 22 * S.value.join }] }));
  const slideR = useAnimatedStyle(() => ({ transform: [{ translateX: -22 * S.value.join }] }));
  const grid = useAnimatedStyle(() => ({
    opacity: Math.min(1, S.value.grid * 3),
    transform: [{ translateY: -(1 - S.value.grid) * 70 }],
  }));
  const share = useAnimatedStyle(() => ({ width: (PAPER.x1 - PAPER.x0) * S.value.share }));
  return (
    <View style={styles.paper} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, image]}>
        {/* the tree outside, upside down, as a camera obscura throws it */}
        <View style={styles.imgGround} />
        <View style={styles.flip}>
          <SetArt parts={IMG_TRUNK} tone={WOOD} line={1.4} />
          <SetArt parts={IMG_CROWN} tone={LEAF} line={1.4} />
          <Animated.View style={[styles.imgRed, red]} />
        </View>
      </Animated.View>
      <Animated.View style={[styles.partsRow, parts]}>
        <Animated.View style={[styles.redMark, slideL]} />
        <View style={styles.roundMark} />
        <Animated.View style={[styles.stemMark, slideR]} />
      </Animated.View>
      <Animated.View style={[styles.wholeApple, whole]}>
        <View style={styles.wholeBody} />
        <View style={styles.wholeStem} />
      </Animated.View>
      {on(GRID) ? (
        <Animated.View style={[styles.grid, grid]}>
          <Animated.View style={[styles.gridClip, share]}>
            {[1, 2].map((k) => <View key={`v${k}`} style={[styles.gridV, { left: (k * (PAPER.x1 - PAPER.x0)) / 3 }]} />)}
            {[1, 2].map((k) => <View key={`h${k}`} style={[styles.gridH, { top: 14 + (k * (PAPER.bottom - PAPER.top - 14)) / 3 }]} />)}
          </Animated.View>
          <View style={styles.gridLabel}>
            <Text style={styles.gridText} numberOfLines={1}>SPACE · TIME · CAUSE</Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
function Cord() {
  return (
    <>
      <View style={styles.cord} pointerEvents="none" />
      <View style={styles.cordHandle} pointerEvents="none" />
    </>
  );
}

// ── the drafting sheet: the compass circle and the doubled square ───────────

function Sheet({ S }: { S: SharedValue<any> }) {
  const circle = useAnimatedStyle(() => ({ opacity: S.value.circle, transform: [{ scale: 0.4 + 0.6 * S.value.circle }] }));
  const outline = useAnimatedStyle(() => ({ opacity: S.value.outline }));
  return (
    <View style={styles.sheet} pointerEvents="none">
      <Animated.View style={[styles.circle, circle]} />
      <Animated.View style={[styles.outline, outline]} />
      {[0, 1, 2, 3].map((k) => <Tile key={k} S={S} k={k} />)}
      {[0, 1, 2, 3].map((k) => <Ask key={k} S={S} k={k} />)}
    </View>
  );
}
function Tile({ S, k }: { S: SharedValue<any>; k: number }) {
  // four right triangles, each laid with its long side on the doubled square's edge
  const st = useAnimatedStyle(() => ({ opacity: S.value.tiles[k], transform: [{ rotate: `${45 + 90 * k}deg` }, { scale: 0.7 + 0.3 * S.value.tiles[k] }] }));
  return (
    <Animated.View style={[styles.tileWrap, st]}>
      <View style={styles.tile} />
    </Animated.View>
  );
}
function Ask({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.asks[k], transform: [{ translateY: -14 * S.value.asks[k] }] }));
  return <Animated.Text style={[styles.ask, { left: SQ.x - SHEET.x0 - 3 + (k - 1.5) * 6 }, st]}>?</Animated.Text>;
}

// ── Q1: four names pinned on the white paper ────────────────────────────────

function Names({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.names, transform: [{ translateY: (1 - S.value.names) * -8 }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {NAME_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={[styles.card, { left: q.x - CARD_W / 2, top: q.y }]}
        >
          <View style={[styles.cardFace, answered && q.correct && styles.cardRight]}>
            <Text style={[styles.cardText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.label}</Text>
            <View style={styles.pin} />
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const PW = PAPER.x1 - PAPER.x0;
const PH = PAPER.bottom - PAPER.top;

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  room: {
    position: 'absolute', left: WALL_X.x1, top: 292, right: 0, height: GROUND - 292, backgroundColor: WALL.STONE,
    borderTopRightRadius: 2,
  },
  sky: {
    position: 'absolute', left: 0, top: 292, width: OUTSIDE.x1, height: GROUND - 292, backgroundColor: PAPER_LIT,
    borderTopLeftRadius: 2,
  },
  treeApple: {
    position: 'absolute', left: TREE.x + 4, top: TREE.y - 18, width: 8, height: 8, borderRadius: 4,
    backgroundColor: EMBER, borderWidth: 1, borderColor: INK,
  },
  rider: { position: 'absolute', left: 0, top: 0 },

  shutter: {
    position: 'absolute', left: HOLE.x, top: HOLE.y - 11, width: 7, height: 22, borderRadius: 1.5,
    backgroundColor: WOOD.SHADE, borderWidth: 1.2, borderColor: INK, transformOrigin: '50% 0%',
  },
  plate: {
    position: 'absolute', top: PLATE_TOP, height: 15, borderRadius: 3, borderWidth: 1.5, borderColor: INK,
    backgroundColor: PLATE_FACE, boxShadow: LIP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  plateGlow: { backgroundColor: SAGE },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  beam: {
    position: 'absolute', left: HOLE.x, height: 1.6, borderRadius: 0.8, backgroundColor: PAPER_LIT,
    transformOrigin: '0% 50%',
  },

  paper: {
    position: 'absolute', left: PAPER.x0, top: PAPER.top, width: PW, height: PH, borderRadius: 2,
    backgroundColor: PAPER_LIT, borderWidth: 1.2, borderColor: WALL.SHADE, overflow: 'hidden',
  },
  imgGround: { position: 'absolute', left: 0, right: 0, top: 0, height: 6, backgroundColor: LEAF.STONE },
  flip: {
    position: 'absolute', left: 0, top: 6, width: 64, height: 76, transformOrigin: `${IMG.x}px ${IMG.y}px`,
    transform: [{ scaleY: -1 }],
  },
  imgRed: {
    position: 'absolute', left: IMG.x + 3, top: IMG.y - 18, width: 7, height: 7, borderRadius: 3.5, backgroundColor: EMBER,
    borderWidth: 1, borderColor: INK,
  },
  partsRow: { position: 'absolute', left: 58, top: 30, width: 50, height: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  redMark: { width: 9, height: 9, borderRadius: 2, backgroundColor: EMBER },
  roundMark: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: INK },
  stemMark: { width: 2, height: 9, borderRadius: 1, backgroundColor: INK },
  wholeApple: { position: 'absolute', left: 74, top: 28, width: 20, height: 22 },
  wholeBody: { position: 'absolute', left: 3, top: 6, width: 14, height: 14, borderRadius: 7, backgroundColor: EMBER, borderWidth: 1.2, borderColor: INK },
  wholeStem: { position: 'absolute', left: 9, top: 0, width: 2, height: 7, borderRadius: 1, backgroundColor: INK },
  grid: {
    position: 'absolute', left: 0, top: 0, width: PW, height: PH, borderWidth: 1.5, borderColor: DEEP, borderRadius: 2,
  },
  gridClip: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  gridV: { position: 'absolute', top: 14, bottom: 0, width: 1, backgroundColor: DEEP, opacity: 0.6 },
  gridH: { position: 'absolute', left: 0, width: PW, height: 1, backgroundColor: DEEP, opacity: 0.6 },
  gridLabel: {
    position: 'absolute', left: 0, right: 0, top: 0, height: 13, backgroundColor: DEEP, alignItems: 'center',
    justifyContent: 'center',
  },
  gridText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: PAPER_LIT, includeFontPadding: false,
  },
  cord: { position: 'absolute', left: CORD.x - 0.7, top: CORD.top + 8, width: 1.4, height: CORD.handle - CORD.top - 8, borderRadius: 0.7, backgroundColor: INK },
  cordHandle: {
    position: 'absolute', left: CORD.x - 3, top: CORD.handle - 2, width: 6, height: 10, borderRadius: 3,
    backgroundColor: WOOD.SHADE, borderWidth: 1, borderColor: INK,
  },

  sheet: {
    position: 'absolute', left: SHEET.x0, top: SHEET.top, width: SHEET.x1 - SHEET.x0, height: SHEET.bottom - SHEET.top,
    borderRadius: 1.5, backgroundColor: PLATE_FACE, borderWidth: 1, borderColor: INK, overflow: 'visible',
  },
  circle: {
    position: 'absolute', left: CIRC.x - SHEET.x0 - CIRC.r, top: CIRC.y - SHEET.top - CIRC.r, width: 2 * CIRC.r,
    height: 2 * CIRC.r, borderRadius: CIRC.r, borderWidth: 1.5, borderColor: INK,
  },
  outline: {
    position: 'absolute', left: SQ.x - SHEET.x0 - SQ.r, top: SQ.y - SHEET.top - SQ.r, width: 2 * SQ.r, height: 2 * SQ.r,
    borderWidth: 1, borderColor: DEEP, borderStyle: 'dashed', transform: [{ rotate: '45deg' }],
  },
  tileWrap: {
    position: 'absolute', left: SQ.x - SHEET.x0 - 7, top: SQ.y - SHEET.top - 7, width: 14, height: 14,
  },
  tile: {
    position: 'absolute', left: 0, top: 0, width: 0, height: 0, borderRightWidth: 7, borderTopWidth: 7,
    borderRightColor: 'transparent', borderTopColor: TEAL,
  },
  ask: {
    position: 'absolute', top: -12, fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, color: INK, includeFontPadding: false,
  },
  compassLeg: {
    position: 'absolute', left: -0.8, top: -2, width: 1.6, height: 12, borderRadius: 0.8, backgroundColor: INK,
    transformOrigin: '50% 0%',
  },

  card: { position: 'absolute', width: CARD_W, height: CARD_H },
  cardFace: {
    flexGrow: 1, borderRadius: 2, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  cardRight: { backgroundColor: INK },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  pin: { position: 'absolute', top: -3, width: 6, height: 6, borderRadius: 3, backgroundColor: EMBER, borderWidth: 1, borderColor: INK },
  onInk: { color: PAPER_LIT },
});

export function Epistemology4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology4Scene} band={[288, 514]} camera={CAM} />;
}
