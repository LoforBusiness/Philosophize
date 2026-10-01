import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './econ1Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, pose, travelStance, mixKeepLegs,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, carrySource, facing,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import { stall, counter, pie, loaf, note, chalkboard, book, coin } from './objects';
import { BY_ID } from './wardrobe';
import { DEEP, EMBER, OLIVE, PAPER_LIT } from '@/components/shared/tone';

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
//        down; two coins of change laid beside it; the book lifted and handed over.
//   b5   Q1: the note, the change and the pie lie on the counter — tap one.
//   b6   the change goes into the shopper's hand and pocket, the note into the
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
const WOOD = stageToneOf(OLIVE);
const TR = 0.85;
/** 78 units of figure in a 208-unit band: 37.5%, under check:scale's 38%. */
const K = K_FIG * 0.76;

/**
 * Seconds each beat's action is paced over: the voiced line from the manifest
 * (lib/narration/manifest.ts, economics-foundations-1), except b4, whose line is 1.3s
 * and whose trade needs about five — the hand-offs run on after the line ends.
 */
const LINES = [4.07, 4.31, 7.03, 7.74, 5, 0, 7.46, 5.7, 0, 0, 0];

// The held poses (moves.ts act + 99): talking, explaining, listening, nodding along,
// leaning in to listen.
const TALK = 167;
const EXPLAIN = 259;
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
const TH_P = [LISTEN, LISTEN, EXPLAIN, EXPLAIN, LISTEN, NOD, EXPLAIN, LEAN, LISTEN, NOD, LISTEN];
const CP_P = [LISTEN, TALK, LISTEN, NOD, LISTEN, LEAN, NOD, TALK, EXPLAIN, NOD, LISTEN];

// ── the stall and what is on it ──────────────────────────────────────────────
const STALL_X = 290;
const STALL_W = 180;
const TOP = 477;                                   // the counter's top, at his hip
const BOOK_AT = { x: 222, y: TOP - 10 };
const NOTE_AT = { x: 234, y: TOP - 5.5 };
const COINS_AT = { x: 258, y: TOP - 5 };
const PIE_AT = { x: 292, y: TOP - 11 };
const LOAF_AT = { x: 340, y: TOP - 10.5 };
/** Where a thing passes across the counter from one hand to the other. */
const PASS = { x: 216, y: 462 };
/** The pavement A-board, and the slate inside its frame. */
const BOARD = { x: 118, w: 104, h: 86 };
const SLATE = { left: 82, top: 423, w: 72, h: 51 };

const STALL_ART = stall(STALL_X, 420, STALL_W, 160);
const COUNTER_ART = counter(STALL_X, 488, STALL_W, 24);
const BOARD_ART = chalkboard(BOARD.x, 500 - BOARD.h / 2, BOARD.w, BOARD.h).filter((p) => p.role === 'mass' || p.role === 'line');
// The things that move are drawn about their own centre and carried by a rider.
const NOTE_ART = note(0, 0, 20, 11);
const COIN_ART = coin(0, 0, 9, 9);
const BOOK_ART = book(0, 0, 30, 20);
const PIE_ART = pie(0, 0, 34, 22);
const LOAF_ART = loaf(0, 0, 32, 21);

function hHold(code: number, t: number): Stance {
  'worklet';
  return emoteAny(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  return emoteAnyLive(code, t, bt);
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
  const cv = useCarry(11);
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
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the shopper ─────────────────────────────────────────────────────────
    // where he stands on screen at this beat's first frame (from the start when nothing is drawn yet)
    const src0 = carrySource(cv, 0, n, -24);
    const wp = walkOf(src0, PL_X, PL_D, PL_P, n, t, b);
    const xPl = carry(cv, 0, n, wp.xp, wp.xn, wp.walking ? wp.walkU : tr);
    let sp = wp.s;
    // b0: the note held out as he arrives
    if (A_ENTER[n]) sp = hand(sp, xPl, wp.dirV, 1, xPl + 16, GROUND - 58, st(0.7, 0.9));
    // b4: the note across the counter, then his other hand takes the book
    if (A_BUY[n]) {
      sp = hand(sp, xPl, wp.dirV, 1, PASS.x, PASS.y, bp(0.36, 0.46, 0.58));
      sp = hand(sp, xPl, wp.dirV, -1, PASS.x, PASS.y + 2, bp(0.84, 0.9, 0.99));
    }
    // b6: the change into his hand, and into his pocket
    if (A_SETTLE[n]) {
      sp = hand(sp, xPl, wp.dirV, 1, PASS.x, PASS.y, bp(0.2, 0.3, 0.4));
      sp = hand(sp, xPl, wp.dirV, 1, xPl - 3, GROUND - 30, bp(0.4, 0.48, 0.58));
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
    let sc = wc.s;
    // b0: a hand resting on his counter, squaring the goods
    if (A_ENTER[n]) sc = hand(sc, xCp, wc.dirV, 1, xCp - 14, TOP - 4, 0.75);
    // b1: he lifts the pie to show it, sets it down, then points along to the book
    const pieLift = A_OFFER[n] ? bp(0.1, 0.3, 0.52) : 0;
    if (A_OFFER[n]) {
      sc = hand(sc, xCp, wc.dirV, 1, PIE_AT.x, PIE_AT.y - 22 * pieLift, bp(0.02, 0.1, 0.58));
      sc = hand(sc, xCp, wc.dirV, -1, BOOK_AT.x, BOOK_AT.y, bp(0.6, 0.7, 0.92));
    }
    // b3: he holds up the last loaf as the economist names the bread
    const loafLift = A_SCARCE[n] ? bp(0.3, 0.46, 0.78) : 0;
    if (A_SCARCE[n]) sc = hand(sc, xCp, wc.dirV, 1, LOAF_AT.x, LOAF_AT.y - 26 * loafLift, bp(0.2, 0.3, 0.86));
    // b4: the trade — the note taken and laid down, the change laid by it, the book
    // lifted and handed over
    if (A_BUY[n]) {
      sc = hand(sc, xCp, wc.dirV, 1, PASS.x, PASS.y, bp(0.42, 0.47, 0.54));
      sc = hand(sc, xCp, wc.dirV, 1, NOTE_AT.x, NOTE_AT.y, bp(0.5, 0.56, 0.63));
      sc = hand(sc, xCp, wc.dirV, 1, COINS_AT.x, COINS_AT.y, bp(0.63, 0.7, 0.78));
      sc = hand(sc, xCp, wc.dirV, -1, BOOK_AT.x, BOOK_AT.y, bp(0.77, 0.81, 0.86));
      sc = hand(sc, xCp, wc.dirV, -1, PASS.x, PASS.y, bp(0.83, 0.9, 0.99));
    }
    // b6: the change handed across, then the note taken into his own pocket
    if (A_SETTLE[n]) {
      sc = hand(sc, xCp, wc.dirV, 1, COINS_AT.x, COINS_AT.y, bp(0.06, 0.14, 0.22));
      sc = hand(sc, xCp, wc.dirV, 1, PASS.x, PASS.y, bp(0.2, 0.3, 0.4));
      sc = hand(sc, xCp, wc.dirV, 1, NOTE_AT.x, NOTE_AT.y, bp(0.54, 0.62, 0.7));
      sc = hand(sc, xCp, wc.dirV, 1, xCp + 2, GROUND - 32, bp(0.68, 0.76, 0.86));
    }
    // b7: a hand to his chin — thinking about the price
    if (A_LOAF[n]) {
      const after = wc.walkDur / L;
      sc = hand(sc, xCp, wc.dirV, 1, xCp - 5, GROUND - 52, st(after + 0.34, after + 0.44));
    }
    const prevCp = carryFrom(heldCp, n, hHold(CP_P[p], t));
    const figCp = keepHeld(heldCp, wc.walking ? mixKeepLegs(prevCp, sc, tr) : mixStance(prevCp, sc, tr));

    // ── the things that change hands ────────────────────────────────────────
    // noteT  0 his hand · 1 hers (the stall-holder's) · 2 on the counter · 3 back in
    //        the stall-holder's hand · 4 pocketed
    // coinT  0 not yet · 1 in the stall-holder's hand · 2 on the counter · 3 his hand
    //        again · 4 the shopper's · 5 pocketed
    // bookT  0 on the counter · 1 the stall-holder's left hand · 2 the shopper's
    const noteNow = A_BUY[n] ? st(0.44, 0.48) + st(0.53, 0.58)
      : A_SETTLE[n] ? 2 + st(0.58, 0.63) + st(0.72, 0.8)
        : n > 6 ? 4 : n > 4 ? 2 : 0;
    const coinNow = A_BUY[n] ? st(0.6, 0.63) + st(0.66, 0.72)
      : A_SETTLE[n] ? 2 + st(0.1, 0.15) + st(0.26, 0.31) + st(0.46, 0.54)
        : n > 6 ? 5 : n > 4 ? 2 : 0;
    const bookNow = A_BUY[n] ? st(0.79, 0.83) + st(0.87, 0.92) : n > 4 ? 2 : 0;

    return {
      pl: pose(figPl, xPl, GROUND, K, wp.dirV, 1),
      th: pose(figTh, xTh, GROUND, K, wt.dirV, 1),
      cp: pose(figCp, xCp, GROUND, K, wc.dirV, 1),
      noteT: carry(cv, 3, n, noteNow, noteNow, tr),
      coinT: carry(cv, 4, n, coinNow, coinNow, tr),
      bookT: carry(cv, 5, n, bookNow, bookNow, tr),
      pieLift: carry(cv, 6, n, 0, pieLift, tr),
      loafLift: carry(cv, 7, n, 0, loafLift, tr),
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
      <ObjectArt parts={STALL_ART} tone={TONE} />
      {/* cast: cap */}
      <Stickman D={DC} k={K} role="crowd" wear={BY_ID.stroller.pieces} />
      <ObjectArt parts={COUNTER_ART} tone={WOOD} />
      <ObjectArt parts={BOARD_ART} tone={WOOD} />
      <Board S={SCENE} />
      <View style={styles.ground} pointerEvents="none" />
      {/* cast: tophat */}
      <Stickman D={DT} k={K} role="second" wear={BY_ID.magistrate.pieces} />
      {/* cast: plain */}
      <Stickman D={DP} k={K} role="lead" wear={[]} />
      <Goods S={SCENE} DP={DP} DC={DC} />
      {on(Q1) ? <CostTargets picked={picked} onPick={onPick} live={Q1[i] === 1} S={SCENE} /> : null}
      {on(Q2) ? <PriceTargets picked={picked} onPick={onPick} live={Q2[i] === 1} S={SCENE} /> : null}
    </View>
  );
}

// ── the market's bunting, strung from the stall's post to the edge of the stage ─

const FLAGS = [0, 1, 2, 3, 4, 5, 6, 7];
function Bunting() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* the string SAGS between its ends, as bunting does: two runs meeting low in the middle */}
      <View style={styles.stringL} />
      <View style={styles.stringR} />
      {FLAGS.map((k) => (
        <View
          key={k}
          style={[styles.flag, { left: 14 + k * 23, top: 347 + 3 * Math.sin((k / 7) * Math.PI) },
            k % 2 ? styles.flagPale : null, k === 5 ? styles.flagSpark : null]}
        />
      ))}
    </View>
  );
}

// ── the things on the counter, and the ones in people's hands ────────────────

function Rider({ at, art, tone, lift }: {
  at: SharedValue<{ x: number; y: number; o: number }>; art: ReturnType<typeof note>;
  tone: ReturnType<typeof stageTone>; lift?: boolean;
}) {
  const st = useAnimatedStyle(() => ({
    opacity: at.value.o,
    transform: [{ translateX: at.value.x }, { translateY: at.value.y }],
  }));
  return (
    <Animated.View style={[styles.rider, lift ? styles.onTop : null, st]} pointerEvents="none">
      <ObjectArt parts={art} tone={tone} />
    </Animated.View>
  );
}

function Goods({ S, DP, DC }: { S: SharedValue<any>; DP: SharedValue<Bundle>; DC: SharedValue<Bundle> }) {
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
    if (u <= 2) return { x: lerp(cp.x, NOTE_AT.x, u - 1), y: lerp(cp.y, NOTE_AT.y, u - 1), o: 1 };
    if (u <= 3) return { x: lerp(NOTE_AT.x, cp.x, u - 2), y: lerp(NOTE_AT.y, cp.y, u - 2), o: 1 };
    return { x: cp.x, y: cp.y, o: 1 - clamp01(u - 3) };
  });
  const coinP = useDerivedValue(() => {
    const u = S.value.coinT;
    const pl = at(DP, 'wrR');
    const cp = at(DC, 'wrR');
    if (u <= 1) return { x: cp.x, y: cp.y, o: clamp01(u) };
    if (u <= 2) return { x: lerp(cp.x, COINS_AT.x, u - 1), y: lerp(cp.y, COINS_AT.y, u - 1), o: 1 };
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
  const pieP = useDerivedValue(() => ({ x: PIE_AT.x, y: PIE_AT.y - 22 * S.value.pieLift, o: 1 }));
  const loafP = useDerivedValue(() => ({ x: LOAF_AT.x, y: LOAF_AT.y - 26 * S.value.loafLift, o: 1 }));
  return (
    <>
      <Rider at={pieP} art={PIE_ART} tone={WOOD} />
      <Rider at={loafP} art={LOAF_ART} tone={WOOD} />
      <Rider at={bookP} art={BOOK_ART} tone={TONE} />
      <Rider at={coinP} art={COIN_ART} tone={WOOD} />
      <Rider at={noteP} art={NOTE_ART} tone={TONE} lift />
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
            <Animated.View style={[styles.chalkStrike, strike]} />
          </Animated.View>
          <Animated.Text style={[styles.chalkPrice, styles.chalkNew, fresh]}>£4</Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ── the two questions ────────────────────────────────────────────────────────

/** Q1: the three things on the counter. The pie is what the book cost him. */
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
const ROW_H = SLATE.h / 3;
function PriceTargets({ picked, onPick, live, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; live: boolean; S: SharedValue<any> }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {PRICE_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={{ position: 'absolute', left: SLATE.left + 3, top: SLATE.top + k * ROW_H + 1, width: SLATE.w - 6, height: ROW_H - 2 }}
        >
          <View style={styles.choice}>
            <Text style={styles.choiceArrow}>{q.arrow}</Text>
            <Text style={styles.choiceText}>{q.label}</Text>
          </View>
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
  flag: {
    position: 'absolute', width: 9, height: 9, borderWidth: 1, borderColor: INK, backgroundColor: TONE.STONE,
    transform: [{ rotate: '45deg' }],
  },
  flagPale: { backgroundColor: PAPER_LIT },
  flagSpark: { backgroundColor: EMBER },
  rider: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  onTop: { zIndex: 2 },
  slate: {
    position: 'absolute', left: SLATE.left, top: SLATE.top, width: SLATE.w, height: SLATE.h, borderRadius: 2,
    backgroundColor: DEEP, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  priceBlock: { alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chalkHead: {
    fontFamily: 'Caveat_700Bold', fontSize: 15, lineHeight: 17, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkPrice: {
    fontFamily: 'Caveat_700Bold', fontSize: 20, lineHeight: 22, color: PAPER_LIT, includeFontPadding: false,
  },
  chalkNew: { color: PAPER_LIT },
  chalkStrike: {
    position: 'absolute', left: -2, right: -2, top: 11, height: 2, borderRadius: 1, backgroundColor: EMBER,
    transformOrigin: '0% 50%',
  },
  clear: { flexGrow: 1 },
  choice: {
    flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: PLATE_FACE, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
  },
  choiceArrow: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, color: INK, includeFontPadding: false,
  },
  choiceText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Econ1Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Econ1Scene} band={[306, 514]} camera={CAM} />;
}
