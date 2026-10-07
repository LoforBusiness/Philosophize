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
import LessonPicture from './LessonPicture';
import { BEATS } from './econ1Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteStill, emoteStillLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import { NATURAL } from './objects';
import { BY_ID } from './wardrobe';
import { EMBER, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// economics-foundations-1, "What Is Economics?" — A SATURDAY MARKET STALL.
//
// The first DIALOGUE lesson (LESSON_RULES group AP): three people talk and nobody
// narrates. Each figure wears his own costume and speaks in his own voice (cast.ts).
//
//   b0   the shopper walks up to the counter, his ten-pound note held out.
//   b1   the stall-holder lifts the pie to show it, sets it down, points at the book.
//   b2   the economist walks in from the left and tips his hat; the shopper turns.
//   b3   the stall-holder steps to the bread and holds up the last loaf as the
//        economist names it; the shopper listens.
//   b4   the stall-holder comes to the shopper's end. Note across the counter, laid
//        down; he turns to his own side and lays two coins of change there; turns
//        back, and the book is lifted and handed over. The shopper holds it in front
//        of him from here on.
//   b5   Q1: the note, the change and the pie lie on the counter — tap one.
//   b6   the stall-holder turns to pick the change up and carries it across as he
//        turns back; it goes into the shopper's hand and pocket, the note into the
//        stall-holder's.
//   b7   the stall-holder steps back to the last loaf; both customers reach for it;
//        he puts a hand to his chin.
//   b8   Q2: the pavement A-board is wiped to three chalk choices — tap one.
//   b9   the board is chalked with the new price, under the quotation.
//
// COMPOSITION, in stage units: the stall's canopy on two posts 200–380 × 340–500,
// its counter 200–380 × 476–500 with the stall-holder BEHIND it; the book 222, the
// laid note 234, the change 258, the pie 292, the loaf 340 on its top (477). The
// counter is at his HIP, not a person's waist: a stickman's legs are a third of him,
// and at a real waist height the counter hid everything of him but his cap. The shopper stands at the counter's end at 192, the economist at 48, and
// the pavement A-board between them, 66–170 × 414–500. Every hand-off happens within
// an arm's reach of both hands (the rig's SAFE reach at this scale is ~23 units from
// the shoulder), which is why the stall-holder walks to the shopper's end to trade.
// Band [306, 514].
//
// SIMPLE ON PURPOSE (AP7): at most two figures move at once, everyone faces whom he
// talks to, and the listeners hold listening poses that are alive but still.
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('economics');
const { RULE } = TONE;
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, economics-foundations-1), except b4, whose line is 1.3s
 * and whose trade needs about six and a half — the stall-holder's walk to the
 * shopper's end, and then each hand-off with a pause after it (AR5: a trade is a
 * sequence of separate reaches, not a hand sawing the air).
 */
const LINES = [3.66, 3.65, 6.88, 7.36, 6.6, 0, 6.73, 4.76, 0, 0, 0];

// The held poses (moves.ts act + 99): talking with the hands, listening, nodding along,
// leaning in to listen. EXPLAINING (259) is not used: its resting far hand sits at the
// chest a little behind the spine, and as his weight moves it reads as an arm held back
// (AR4) — the economist explains with TALK, both hands in front of him.
const TALK = 167;
const LISTEN = 159;
const NOD = 263;
const LEAN = 177;

const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_ENTER = is('enter');
const A_OFFER = is('offer');
const A_ARRIVE = is('arrive');
const A_SCARCE = is('scarce');
const A_BUY = is('buy');
const A_SETTLE = is('settle');
const A_LOAF = is('lastloaf');
const BOARD_V = BEATS.map((b) => b.board ?? 0);
const Q1 = BEATS.map((b) => (b.q1 ? 1 : 0));
const Q2 = BEATS.map((b) => (b.q2 ? 1 : 0));

/** Where each of them stands, beat by beat. The economist is off the stage until b2. */
const PL_X = BEATS.map(() => 192);
const TH_X = BEATS.map((b) => (b.th ? 48 : -40));
const CP_X = [300, 300, 300, 356, 240, 240, 240, 356, 356, 356, 356];
/** Which way each faces: the shopper turns to the economist while he first speaks. */
const PL_D = [1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1];
const TH_D = BEATS.map(() => 1);
const CP_D = BEATS.map(() => -1);
/** What each is doing with his body: talking while he speaks, listening while he does not. */
const PL_P = [TALK, LISTEN, LISTEN, NOD, TALK, LISTEN, NOD, LEAN, LISTEN, NOD, LISTEN];
const TH_P = [LISTEN, LISTEN, TALK, TALK, LISTEN, NOD, TALK, LEAN, LISTEN, NOD, LISTEN];
const CP_P = [LISTEN, TALK, LISTEN, NOD, LISTEN, LEAN, NOD, TALK, NOD, NOD, LISTEN];

// ── the stall and what is on it ──────────────────────────────────────────────
const STALL_X = 290;
const STALL_W = 180;
const TOP = 477;                                   // the counter's top, at his hip
/** The book, the pie and the loaf are placed by their FOOT (AR2): the edge they stand on,
 *  which is where a hand goes under them to lift them. The note and the coins by their middle. */
const BOOK_AT = { x: 222, y: TOP };
const NOTE_AT = { x: 234, y: TOP - 5.5 };
const COINS_AT = { x: 258, y: TOP - 5 };
const PIE_AT = { x: 292, y: TOP };
const LOAF_AT = { x: 340, y: TOP };
/** Where a thing passes across the counter from one hand to the other. */
const PASS = { x: 216, y: 462 };
/** The pavement A-board, and the slate inside its frame. */
const BOARD = { x: 118, w: 104, h: 86 };
const SLATE = { left: 82, top: 423, w: 72, h: 51 };

// Every object in its own colours (AR1), and every one of them DRAWN against a reference
// (LESSON_RULES AM13; scripts/lib/lessonart/lessons/econ1.mjs): the striped awning on its
// posts, the trestle counter under its green cloth, the pavement A-board, the bunting, a
// cherry pie with a lattice top in its dish, a bloomer, an orange paperback, a ten-pound
// note and two pound coins. Each picture takes the box the shape-built object had, so
// every hand-off lands where it always did. The things that move ride a zero-size View
// placed at their FOOT (the book, the pie, the loaf) or their middle (the note, the coins).
/** When the trade on b4 starts: the moment the stall-holder reaches the shopper's end. */
const T_TRADE = moveTr(356, 240, TR);

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteStill(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteStillLive(code, t, bt);
}
function hand(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}
/**
 * One figure's walk and facing for a beat. He walks from WHERE HE IS ON SCREEN — `src`,
 * read out of the carry — not from where the script says the last beat left him: a
 * tap mid-walk, or a step back, would otherwise put him there in one frame (group L;
 * the final review found 100-unit jumps). He faces the way he goes (C18), then turns
 * to whom the beat has him face.
 */
function walkOf(src: number, xs: readonly number[], ds: readonly number[], codes: readonly number[], n: number, t: number, b: number) {
  'worklet';
  const p = n > 0 ? n - 1 : 0;
  const xp = src;
  const xn = xs[n];
  const walking = Math.abs(xn - xp) > 1;
  const walkDur = walking ? moveTr(xp, xn, TR) : 0;
  const walkU = walking ? ease01(clamp01(b / walkDur)) : 1;
  const dp = n > 0 ? ds[p] : ds[n];
  const way = xn > xp ? 1 : -1;
  const dirV = walking
    ? lerp(facing(dp, way, b), ds[n], clamp01((b - walkDur) / 0.3))
    : facing(dp, ds[n], b);
  const s = walking
    ? travelStance(xp, xn, hHold(codes[p], t), hHold(codes[n], t), hLive(codes[n], t, b), walkU, WALK, 0)
    : hLive(codes[n], t, b);
  return { xp, xn, walking, walkU, walkDur, dirV, s };
}

const CAM = followMoves(PL_X, BEATS.map(kindOf), seedOf('economics'));

export default function Econ1Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldPl = useHeld();
  const heldTh = useHeld();
  const heldCp = useHeld();
  const cv = useCarry(14);
  const on = useLinger(i);
  // THE ANSWERS ANSWER BACK: which of the three was tapped on each graded beat, and how
  // many seconds ago (the econ6 construction). The right pick hops and lands; a wrong one
  // shudders, then is still.
  const pick1 = useSharedValue(-1);
  const pick2 = useSharedValue(-1);
  const since1 = useSharedValue(0);
  const since2 = useSharedValue(0);
  useEffect(() => {
    const ids = Q1[i] ? COST_IDS : Q2[i] ? PRICE_IDS : null;
    if (!ids) return;
    const k = picked === null ? -1 : ids.indexOf(picked);
    const pk = Q1[i] ? pick1 : pick2;
    const since = Q1[i] ? since1 : since2;
    pk.value = k;
    since.value = 0;
    if (k >= 0) since.value = withTiming(8, { duration: 8000, easing: Easing.linear });
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
    // the same two, in SECONDS into the beat rather than fractions of its line
    const sAt = (a: number, z: number) => {
      'worklet';
      return stage(b, L, a / L, z / L);
    };
    const bAt = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a / L, m / L, z / L);
    };
    const T = T_TRADE;

    // ── the shopper ─────────────────────────────────────────────────────────
    // where he stands on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src0 = carrySource(cv, 0, n, -24);
    const wp = walkOf(src0, PL_X, PL_D, PL_P, n, t, b);
    const xPl = carry(cv, 0, n, wp.xp, wp.xn, wp.walking ? wp.walkU : tr);
    let sp = wp.s;
    // b0: the note held out as he arrives
    if (A_ENTER[n]) sp = hand(sp, xPl, wp.dirV, 1, xPl + 16, GROUND - 58, st(0.7, 0.9));
    // b4: the note held across the counter until the stall-holder takes it
    if (A_BUY[n]) sp = hand(sp, xPl, wp.dirV, 1, PASS.x, PASS.y, bAt(T - 0.5, T + 0.35, T + 1.05));
    // b4 on: his left hand takes the book at the counter's end, then holds it close in
    // front of him, below the chest, for the rest of the lesson (AR6) — never at his side
    // or behind him, where the listening pose would leave it
    const bookIn = A_BUY[n] ? sAt(T + 3.1, T + 3.5) : n > 4 ? 1 : 0;
    if (bookIn > 0) {
      const home = A_BUY[n] ? sAt(T + 3.75, T + 4.35) : 1;
      sp = hand(sp, xPl, wp.dirV, -1, lerp(PASS.x, xPl + 9 * wp.dirV, home), lerp(PASS.y + 2, 470, home), bookIn);
    }
    // b6: the change into his hand, and into his pocket
    if (A_SETTLE[n]) {
      sp = hand(sp, xPl, wp.dirV, 1, PASS.x, PASS.y, bAt(1.3, 1.95, 2.6));
      sp = hand(sp, xPl, wp.dirV, 1, xPl + 2, GROUND - 30, bAt(2.6, 3.1, 3.7));
    }
    // b7: he reaches for the last loaf
    if (A_LOAF[n]) sp = hand(sp, xPl, wp.dirV, 1, LOAF_AT.x, LOAF_AT.y, st(0.34, 0.46) * (1 - st(0.86, 0.96)));
    const prevPl = carryFrom(heldPl, n, hHold(PL_P[p], t));
    const figPl = keepHeld(heldPl, wp.walking ? mixKeepLegs(prevPl, sp, tr) : mixStance(prevPl, sp, tr));

    // ── the economist ───────────────────────────────────────────────────────
    // where he stands on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src1 = carrySource(cv, 1, n, -40);
    const wt = walkOf(src1, TH_X, TH_D, TH_P, n, t, b);
    const xTh = carry(cv, 1, n, wt.xp, wt.xn, wt.walking ? wt.walkU : tr);
    let stp = wt.s;
    // b2: he tips his hat once he has arrived
    if (A_ARRIVE[n]) {
      const after = wt.walkDur / L;
      stp = hand(stp, xTh, wt.dirV, 1, xTh + 5, GROUND - 76, bp(after + 0.04, after + 0.12, after + 0.24));
    }
    // b3: his hand goes out to the bread on the stall as he names it
    if (A_SCARCE[n]) stp = hand(stp, xTh, wt.dirV, 1, LOAF_AT.x, LOAF_AT.y, bp(0.34, 0.46, 0.72));
    // b7: and he wants that loaf too
    if (A_LOAF[n]) stp = hand(stp, xTh, wt.dirV, 1, LOAF_AT.x, LOAF_AT.y, st(0.4, 0.52) * (1 - st(0.86, 0.96)));
    const prevTh = carryFrom(heldTh, n, hHold(TH_P[p], t));
    const figTh = keepHeld(heldTh, wt.walking ? mixKeepLegs(prevTh, stp, tr) : mixStance(prevTh, stp, tr));

    // ── the stall-holder, behind his counter ────────────────────────────────
    // where he stands on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src2 = carrySource(cv, 2, n, CP_X[0]);
    const wc = walkOf(src2, CP_X, CP_D, CP_P, n, t, b);
    const xCp = carry(cv, 2, n, wc.xp, wc.xn, wc.walking ? wc.walkU : tr);
    // He faces the shopper's end of the counter, and TURNS to his own side of it to lay
    // the change down (b4) and to pick it up again (b6): the coins lie at 258, behind
    // him as he faces the shopper, and an arm thrown back to them is AR4's fault.
    const dCpNow = A_BUY[n]
      ? (b < T + 1.4 ? wc.dirV : b < T + 2.65 ? facing(-1, 1, b - (T + 1.4)) : facing(1, -1, b - (T + 2.65)))
      : A_SETTLE[n] ? (b < 1.05 ? facing(-1, 1, b) : facing(1, -1, b - 1.05)) : wc.dirV;
    const dC = carry(cv, 11, n, dCpNow, dCpNow, ease01(b / 0.3));
    let sc = wc.s;
    // b0: a hand resting on his counter, squaring the goods
    if (A_ENTER[n]) sc = hand(sc, xCp, dC, 1, xCp - 14, TOP - 4, 0.75);
    // b1: he lifts the pie by its dish to show it, sets it down, then points along to the book
    const pieLift = A_OFFER[n] ? bp(0.1, 0.3, 0.52) : 0;
    if (A_OFFER[n]) {
      sc = hand(sc, xCp, dC, 1, PIE_AT.x, PIE_AT.y - 22 * pieLift, bp(0.02, 0.1, 0.58));
      sc = hand(sc, xCp, dC, -1, BOOK_AT.x, BOOK_AT.y, bp(0.6, 0.7, 0.92));
    }
    // b3: he holds up the last loaf, his hand under it, as the economist names the bread
    const loafLift = A_SCARCE[n] ? bp(0.3, 0.46, 0.78) : 0;
    // and each is set down with a little weight: it squashes onto the counter as it lands
    const pieSq = A_OFFER[n] ? bp(0.5, 0.54, 0.64) : 0;
    const loafSq = A_SCARCE[n] ? bp(0.76, 0.8, 0.9) : 0;
    if (A_SCARCE[n]) sc = hand(sc, xCp, dC, 1, LOAF_AT.x, LOAF_AT.y - 26 * loafLift, bp(0.2, 0.3, 0.86));
    // b4: the trade, one hand-off at a time, each ONE stroke of the hand (AR5) — the note
    // taken at the counter's end and carried straight to where it is laid; a turn to his
    // own side, the change out of his apron pocket (it comes into his hand at his hip)
    // and laid there; a turn back, and the book lifted and carried straight across
    if (A_BUY[n]) {
      const noteGo = sAt(T + 0.45, T + 0.95);
      sc = hand(sc, xCp, dC, 1, lerp(PASS.x, NOTE_AT.x, noteGo), lerp(PASS.y, NOTE_AT.y, noteGo),
        sAt(T, T + 0.4) * (1 - sAt(T + 1.0, T + 1.4)));
      sc = hand(sc, xCp, dC, 1, COINS_AT.x, COINS_AT.y, bAt(T + 1.75, T + 2.2, T + 2.65));
      const bookGo = sAt(T + 3.3, T + 3.75);
      sc = hand(sc, xCp, dC, -1, lerp(BOOK_AT.x, PASS.x, bookGo), lerp(BOOK_AT.y, PASS.y + 2, bookGo),
        sAt(T + 2.9, T + 3.25) * (1 - sAt(T + 3.85, T + 4.35)));
    }
    // b6: turned to his side, the change picked up and, as he turns back, carried in the
    // one stroke across to the shopper; then the note taken into his own pocket
    if (A_SETTLE[n]) {
      const coinGo = sAt(1.0, 1.85);
      sc = hand(sc, xCp, dC, 1, lerp(COINS_AT.x, PASS.x, coinGo), lerp(COINS_AT.y, PASS.y, coinGo),
        sAt(0.4, 0.8) * (1 - sAt(2.0, 2.6)));
      sc = hand(sc, xCp, dC, 1, NOTE_AT.x, NOTE_AT.y, bp(0.54, 0.62, 0.7));
      sc = hand(sc, xCp, dC, 1, xCp + 2 * dC, GROUND - 32, bp(0.68, 0.76, 0.86));
    }
    // b7: a hand to his chin — thinking about the price
    if (A_LOAF[n]) {
      const after = wc.walkDur / L;
      sc = hand(sc, xCp, dC, 1, xCp - 5, GROUND - 52, st(after + 0.34, after + 0.44));
    }
    const prevCp = carryFrom(heldCp, n, hHold(CP_P[p], t));
    const figCp = keepHeld(heldCp, wc.walking ? mixKeepLegs(prevCp, sc, tr) : mixStance(prevCp, sc, tr));

    // ── the things that change hands ────────────────────────────────────────
    // noteT  0 his hand · 1 hers (the stall-holder's) · 2 on the counter · 3 back in
    //        the stall-holder's hand · 4 pocketed
    // coinT  0 not yet · 1 in the stall-holder's hand · 2 on the counter · 3 his hand
    //        again · 4 the shopper's · 5 pocketed
    // bookT  0 on the counter · 1 the stall-holder's left hand · 2 the shopper's
    const noteNow = A_BUY[n] ? sAt(T + 0.3, T + 0.45) + sAt(T + 0.95, T + 1.1)
      : A_SETTLE[n] ? 2 + st(0.58, 0.63) + st(0.72, 0.8)
        : n > 6 ? 4 : n > 4 ? 2 : 0;
    const coinNow = A_BUY[n] ? sAt(T + 1.7, T + 1.85) + sAt(T + 2.15, T + 2.3)
      : A_SETTLE[n] ? 2 + sAt(0.75, 0.95) + sAt(1.8, 2.0) + sAt(2.95, 3.45)
        : n > 6 ? 5 : n > 4 ? 2 : 0;
    const bookNow = A_BUY[n] ? sAt(T + 3.15, T + 3.3) + sAt(T + 3.75, T + 3.9) : n > 4 ? 2 : 0;

    return {
      pl: pose(figPl, xPl, GROUND, K, wp.dirV, 1),
      th: pose(figTh, xTh, GROUND, K, wt.dirV, 1),
      cp: pose(figCp, xCp, GROUND, K, dC, 1),
      noteT: carry(cv, 3, n, noteNow, noteNow, tr),
      coinT: carry(cv, 4, n, coinNow, coinNow, tr),
      bookT: carry(cv, 5, n, bookNow, bookNow, tr),
      pieLift: carry(cv, 6, n, 0, pieLift, tr),
      loafLift: carry(cv, 7, n, 0, loafLift, tr),
      pieSq: carry(cv, 12, n, 0, pieSq, tr),
      loafSq: carry(cv, 13, n, 0, loafSq, tr),
      board: carry(cv, 8, n, BOARD_V[p], BOARD_V[n], tr),
      q1: carry(cv, 9, n, Q1[p], Q1[n], tr),
      q2: carry(cv, 10, n, Q2[p], Q2[n], tr),
    };
  });

  const DP = useDerivedValue<Bundle>(() => SCENE.value.pl);
  const DT = useDerivedValue<Bundle>(() => SCENE.value.th);
  const DC = useDerivedValue<Bundle>(() => SCENE.value.cp);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Bunting />
      <LessonPicture name="econ1-stall" />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <LessonPicture name="econ1-counter" />
      <LessonPicture name="econ1-aboard" />
      <Board S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="lead" wear={[]} />
      <Goods S={SCENE} DP={DP} DC={DC} pick={pick1} since={since1} />
      {on(Q1) ? <CostTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <PriceTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} pick={pick2} since={since2} /> : null}
    </View>
  );
}

// ── the market's bunting, strung from the edge of the stage to the stall's post ─
//
// Cotton pennants in their own colours (AR1), each hanging by its top edge from a string
// that SAGS between its ends, as bunting does — drawn (econ1.mjs, `bunting`).
function Bunting() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LessonPicture name="econ1-bunting" />
    </View>
  );
}

// ── the things on the counter, and the ones in people's hands ────────────────

type At = { x: number; y: number; o: number; sx?: number; sy?: number };
/** A thing that moves: a zero-size View at its foot (or middle), so a squash on landing
 *  squashes it down onto the counter rather than about its own middle. */
function Rider({ at, lift, children }: { at: { value: At }; lift?: boolean; children: React.ReactNode }) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [
      { translateX: at.value.x }, { translateY: at.value.y },
      { scaleX: at.value.sx ?? 1 }, { scaleY: at.value.sy ?? 1 },
    ],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}

/** Up over [a, m] and back down over [m, z] of a running value. */
function hump(v: number, a: number, m: number, z: number): number {
  'worklet';
  const r = (p: number, q: number) => {
    'worklet';
    const u = clamp01((v - p) / (q - p));
    return u * u * (3 - 2 * u);
  };
  return r(a, m) * (1 - r(m, z));
}
/** A wrong pick's shudder: a quick shake that dies away inside half a second. */
function shudder(v: number): number {
  'worklet';
  return v > 0 && v < 0.55 ? 1.6 * Math.sin(v * 44) * (1 - v / 0.55) : 0;
}

function Goods({ S, DP, DC, pick, since }: {
  S: SharedValue<any>; DP: SharedValue<Bundle>; DC: SharedValue<Bundle>; pick: SharedValue<number>; since: SharedValue<number>;
}) {
  const at = (w: SharedValue<Bundle>, k: 'wrR' | 'wrL') => {
    'worklet';
    const v = w.value[k];
    return { x: v[0].translateX as number, y: v[1].translateY as number };
  };
  const noteP = useDerivedValue(() => {
    const u = S.value.noteT;
    const pl = at(DP, 'wrR');
    const cp = at(DC, 'wrR');
    if (u <= 1) return { x: lerp(pl.x, cp.x, u), y: lerp(pl.y, cp.y, u), o: 1 };
    if (u <= 2) return { x: lerp(cp.x, NOTE_AT.x, u - 1) + (pick.value === 0 ? shudder(since.value) : 0), y: lerp(cp.y, NOTE_AT.y, u - 1), o: 1 };
    if (u <= 3) return { x: lerp(NOTE_AT.x, cp.x, u - 2), y: lerp(NOTE_AT.y, cp.y, u - 2), o: 1 };
    return { x: cp.x, y: cp.y, o: 1 - clamp01(u - 3) };
  });
  const coinP = useDerivedValue(() => {
    const u = S.value.coinT;
    const pl = at(DP, 'wrR');
    const cp = at(DC, 'wrR');
    if (u <= 1) return { x: cp.x, y: cp.y, o: clamp01(u) };
    if (u <= 2) return { x: lerp(cp.x, COINS_AT.x, u - 1) + (pick.value === 1 ? shudder(since.value) : 0), y: lerp(cp.y, COINS_AT.y, u - 1), o: 1 };
    if (u <= 3) return { x: lerp(COINS_AT.x, cp.x, u - 2), y: lerp(COINS_AT.y, cp.y, u - 2), o: 1 };
    if (u <= 4) return { x: lerp(cp.x, pl.x, u - 3), y: lerp(cp.y, pl.y, u - 3), o: 1 };
    return { x: pl.x, y: pl.y, o: 1 - clamp01(u - 4) };
  });
  const bookP = useDerivedValue(() => {
    const u = S.value.bookT;
    const cp = at(DC, 'wrL');
    const pl = at(DP, 'wrL');
    if (u <= 1) return { x: lerp(BOOK_AT.x, cp.x, u), y: lerp(BOOK_AT.y, cp.y, u), o: 1 };
    return { x: lerp(cp.x, pl.x, u - 1), y: lerp(cp.y, pl.y, u - 1), o: 1 };
  });
  // Q1 answered: the pie (the right answer) hops off the counter and lands with a squash;
  // the note or the change, picked wrongly, shudders where it lies
  const pieP = useDerivedValue(() => {
    const v = pick.value === 2 ? since.value : 0;
    const hop = 7 * hump(v, 0.04, 0.22, 0.46);
    const sq = Math.max(S.value.pieSq, hump(v, 0.44, 0.5, 0.64));
    return { x: PIE_AT.x, y: PIE_AT.y - 22 * S.value.pieLift - hop, o: 1, sx: 1 + 0.07 * sq, sy: 1 - 0.11 * sq };
  });
  const loafP = useDerivedValue(() => {
    const sq = S.value.loafSq;
    return { x: LOAF_AT.x, y: LOAF_AT.y - 26 * S.value.loafLift, o: 1, sx: 1 + 0.06 * sq, sy: 1 - 0.1 * sq };
  });
  return (
    <>
      <Rider at={pieP}><LessonPicture name="econ1-pie" /></Rider>
      <Rider at={loafP}><LessonPicture name="econ1-loaf" /></Rider>
      <Rider at={bookP}><LessonPicture name="econ1-book" /></Rider>
      <Rider at={coinP}><LessonPicture name="econ1-coins" /></Rider>
      <Rider at={noteP} lift><LessonPicture name="econ1-note" /></Rider>
    </>
  );
}

// ── the pavement A-board: the price, the three choices, the new price ────────

function Board({ S }: { S: SharedValue<any> }) {
  const price = useAnimatedStyle(() => ({ opacity: clamp01(1 - Math.abs(S.value.board - 0)) + clamp01(S.value.board - 1) }));
  const old = useAnimatedStyle(() => ({ opacity: clamp01(1 - S.value.board) + clamp01(S.value.board - 1) }));
  const strike = useAnimatedStyle(() => ({ transform: [{ scaleX: clamp01(S.value.board - 1) }] }));
  const fresh = useAnimatedStyle(() => ({ opacity: clamp01(S.value.board - 1) }));
  return (
    <View style={styles.slate} pointerEvents="none">
      <Animated.View style={[styles.priceBlock, price]}>
        <Text style={styles.chalkHead}>BREAD</Text>
        <View style={styles.priceRow}>
          <Animated.View style={old}>
            <Text style={styles.chalkPrice}>£2</Text>
            <Animated.View nativeID="strike" style={[styles.chalkStrike, strike]} />
          </Animated.View>
          <Animated.Text style={[styles.chalkPrice, styles.chalkNew, fresh]}>£4</Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the three things on the counter. The pie is what the book cost him. */
const COST_IDS = ['note', 'change', 'pie'];
const COST_Q = [
  { id: 'note', left: NOTE_AT.x - 14, top: TOP - 17, w: 28, h: 20, r: 4, correct: false },
  { id: 'change', left: COINS_AT.x - 9, top: TOP - 15, w: 18, h: 18, r: 9, correct: false },
  { id: 'pie', left: PIE_AT.x - 18, top: TOP - 23, w: 36, h: 26, r: 12, correct: true },
];
function CostTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {COST_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={q.r}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: q.left, top: q.top, width: q.w, height: q.h }}
        >
          <View style={styles.clear} />
        </Target>
      ))}
    </Animated.View>
  );
}

/** Q2: the A-board's three chalk choices. Raising the price is the right one. */
const PRICE_Q = [
  { id: 'raise', arrow: '↑', label: 'RAISE IT', correct: true },
  { id: 'keep', arrow: '→', label: 'KEEP IT', correct: false },
  { id: 'lower', arrow: '↓', label: 'LOWER IT', correct: false },
];
const PRICE_IDS = PRICE_Q.map((q) => q.id);
const ROW_H = SLATE.h / 3;
/**
 * One chalk choice, struck as a BUTTON on the slate (group AG): a white face with a lit top
 * edge on a hard ledge of the lesson's shade, its arrow in a round chip. Answered, the
 * right one's chip jumps and lands; a wrong one shudders on its ledge.
 */
function PriceChoice({ q, k, pick, since }: { q: (typeof PRICE_Q)[number]; k: number; pick: SharedValue<number>; since: SharedValue<number> }) {
  const body = useAnimatedStyle(() => ({
    transform: [{ translateX: pick.value === k && !q.correct ? shudder(since.value) : 0 }],
  }));
  const chip = useAnimatedStyle(() => {
    const v = pick.value === k && q.correct ? since.value : 0;
    return { transform: [{ translateY: -3 * hump(v, 0.02, 0.16, 0.36) }, { scale: 1 + 0.28 * hump(v, 0.02, 0.16, 0.42) }] };
  });
  return (
    <Animated.View style={[styles.choice, body]}>
      <Animated.View style={[styles.chip, chip]}>
        <Text style={styles.choiceArrow}>{q.arrow}</Text>
      </Animated.View>
      <Text style={styles.choiceText}>{q.label}</Text>
    </Animated.View>
  );
}
function PriceTargets({ picked, onPick, live, S, pick, since }: {
  picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any>;
  pick: SharedValue<number>; since: SharedValue<number>;
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {PRICE_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLATE.left + 3, top: SLATE.top + k * ROW_H + 0.5, width: SLATE.w - 6, height: ROW_H - 1 }}
        >
          <PriceChoice q={q} k={k} pick={pick} since={since} />
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  stringL: {
    position: 'absolute', left: -1, top: 347.5, width: 108, height: 1.2, backgroundColor: INK,
    transform: [{ rotate: '1.6deg' }],
  },
  stringR: {
    position: 'absolute', left: 105, top: 347.5, width: 108, height: 1.2, backgroundColor: INK,
    transform: [{ rotate: '-1.6deg' }],
  },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  onTop: { zIndex: 2 },
  slate: {
    position: 'absolute', left: SLATE.left, top: SLATE.top, width: SLATE.w, height: SLATE.h, borderRadius: 2,
    backgroundColor: NATURAL.slate.base, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  priceBlock: { alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  // AQ2: Caveat's letters draw up to a quarter of an em past their advance, and a phone
  // clips a Text to its content box — so every chalk word has a box wider than its ink
  chalkHead: {
    width: 64, textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 15, lineHeight: 17, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkPrice: {
    width: 28, textAlign: 'center',
    fontFamily: 'Caveat_700Bold', fontSize: 20, lineHeight: 22, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkNew: { color: PAPER_LIT },
  chalkStrike: {
    position: 'absolute', left: 4, right: 4, top: 11, height: 2, borderRadius: 1, backgroundColor: EMBER,
    transformOrigin: '0% 50%',
  },
  clear: { flexGrow: 1 },
  // a struck button on the slate: a white face, a lit top edge, a hard ledge of the
  // lesson's shade under it and the faint drop it casts (stageSkin's lipOf, sized down)
  choice: {
    flexGrow: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 3, marginBottom: 2.5,
    backgroundColor: PLATE_FACE, borderRadius: 4, borderWidth: 1, borderColor: INK,
    boxShadow: `inset 0px 1px 0px rgba(255, 255, 255, 0.9), 0px 2px 0px ${TONE.SHADE}, 0px 3px 0px rgba(26, 26, 26, 0.25)`,
  },
  chip: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: NATURAL.slate.base,
    alignItems: 'center', justifyContent: 'center',
  },
  choiceArrow: {
    width: 12, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 12, color: PAPER_LIT, includeFontPadding: false,
  },
  choiceText: {
    width: 46, marginLeft: 2, textAlign: 'left',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Econ1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Econ1Scene} band={[306, 514]} camera={CAM} />;
}
