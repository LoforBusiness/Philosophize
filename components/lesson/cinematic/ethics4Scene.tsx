import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { attendAt } from './attend';
import { BEATS } from './ethics4Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, stand, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, hideLeadWhile, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, facing, pickAt,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage } from './pace';
import { PORTAL, portalAt, portalSwapAt, portalXf, portalScale, wordsAt } from './portal';
import {
  globeStand, mapFrame, desk, igloo, tent, roundHut, pagoda, cottage, signPosts,
  GLOBE, MAP, PINS, DESK, BOOK, HOME_GROUND, HOMES, SIGNS,
} from './ethics4Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// ethics-ethics-4, "Is Morality Universal or Relative?" — AN ANTHROPOLOGIST'S STUDY,
// AND A VILLAGE OF THE WORLD.
//
// Redrawn 2026-09-27: the fourth lesson of the branch in reading order, with a scene
// change (portal.ts). A grave lesson (N11): nothing in it is a gag, and nothing draws
// a harm the narration names. Every act is laid across its voiced line in stages.
//
//   b0   the pins on the wall map light up, each culture its own colour.
//   b1   he goes to the map; a question mark stands over it: is there no answer?
//   b2   DESCRIPTIVE on the map's legend.   b3  MORAL beside it.
//   b4   an arrow runs from the first to the second, and is struck out.
//   b5   at the desk he takes up Benedict's book: BENEDICT.   b7  OBJECTIVISM.
//   b8   back at the globe he spins it.
//   b9   THE CHANGE: into the globe's ocean, out of the sky over a village of five
//        homes from five parts of the world. HUMAN UNIVERSALS.
//   b10  a gift appears at every door in turn.
//   b11  under the grass, one stone foundation beneath all five: SHARED FOUNDATION.
//   b12  Q1: the foundation cracks as the claim picked gets stronger (R7c).
//   b13  Q2: two signs, IT FOLLOWS and IT DOES NOT.
//
// COMPOSITION, in stage units. The study: the globe at 80 on its stand, the map
// 150–310 × 330–404 with its legend along the bottom, the desk 300–380 with the book at
// 330. The village: homes at 48, 122, 200, 278 and 352 on a ground at 470, the signs at
// 96 and 304. He stands at 114, 170 and 312 in the study, 236 in the village.
// Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('ethics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const SKY = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, ethics-ethics-4. */
const LINES = [3.8, 5.92, 5.44, 6.72, 4.44, 6.92, 0, 6.32, 6.6, 6.52, 4.56, 4.6, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;
const MID = { x: STAGE_W / 2, y: 401 };
/** The crossover on the change beat, where he can change place or turn unseen. */
const SWAP_FROM = portalSwapAt() - PORTAL.swapFor / 2;
/** Out of the globe's ocean into the village's sky: a point of open sky. */
const SKY_AT = { x: 200, y: 336 };
/** The pins' colours: every culture its own. */
const PIN_COLOURS = [EMBER, TEAL, OLIVE, DEEP, SAGE, EMBER, DEEP, TEAL];

const X = BEATS.map((b) => b.x ?? 236);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_PINS = is('pins');
const A_STRONGER = is('stronger');
const A_DESCR = is('descr');
const A_MORAL = is('moral');
const A_ERROR = is('error');
const A_BENE = is('benedict');
const A_OBJ = is('object');
const A_GLOBE = is('globe');
const A_ENTER = is('enter');
const A_GIFTS = is('gifts');
const A_FOUND = is('found');
const flag = (f: (b: (typeof BEATS)[number]) => unknown) => BEATS.map((b) => (f(b) ? 1 : 0));
const PINNED = flag((b) => b.pins);
const DESCR = flag((b) => b.descr);
const MORAL = flag((b) => b.moral);
const ERROR = flag((b) => b.error);
const BENE = flag((b) => b.bene);
const OBJ = flag((b) => b.obj);
const VILLAGE = flag((b) => b.village);
const GIFTS = flag((b) => b.gifts);
const FOUND = flag((b) => b.found);
const Q2 = flag((b) => b.q2);
/** He holds Benedict's book from when he takes it up (b5) until he sets it down (b7). */
const BOOK_HELD = BEATS.map((b) => (b.bene && !b.obj ? 1 : 0));
/** The order control is being answered: the foundation cracks as the claim gets stronger (R7c). */
const ORDER = flag((b) => b.interact?.order);
const CRACK_AT = [0, 0.5, 1];
/** Which way he faces once each beat settles: the map and the desk on his right, the globe on his left. */
const DIR = BEATS.map((b) => (b.act === 'globe' ? -1 : 1));

const Q2_T = [
  { id: 'follows', label: 'IT FOLLOWS', x: SIGNS[0], correct: false },
  { id: 'doesnt', label: 'IT DOES NOT', x: SIGNS[1], correct: true },
];

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
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_M, dir: dir < 0 ? -1 : 1 }, 1, tx, ty, w);
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics'));

export default function Ethics4Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(22);
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

    // ── the change (b9), and which set he is in otherwise ───────────────────
    const pt = portalAt(b);
    const world = A_ENTER[n] ? pt.world : VILLAGE[n];
    const kStudy = A_ENTER[n] ? pt.out : VILLAGE[n];
    const kVillage = A_ENTER[n] ? pt.into : 1 - VILLAGE[n];

    // ── where he is ──────────────────────────────────────────────────────────
    const xp = X[p];
    const xn = X[n];
    const walking = !A_ENTER[n] && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    const swapU = pt.swapU;
    const x = n === 0 ? xn : carry(cv, 0, n, xp, xn, A_ENTER[n] ? swapU : walking ? walkU : tr);
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    const dirV = A_ENTER[n]
      ? facing(DIR[p], DIR[n], b - SWAP_FROM)
      : walking
        ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
        : facing(DIR[p], DIR[n], b);
    const dir = dirV < 0 ? -1 : 1;
    const arrive = walking ? walkDur : 0;

    // ── pointing up at the legend (b2, b3, b4) ──────────────────────────────
    const point = A_DESCR[n] ? pulse(0.8, 1.3, 4.4) : A_MORAL[n] ? pulse(0.8, 1.3, 5.6) : A_ERROR[n] ? pulse(1.6, 2.0, 3.8) : 0;
    s = handOn(s, x, dir, A_MORAL[n] ? 250 : 196, 420, point);
    // ── Benedict's book: taken up (b5), held (b6), set down (b7) ────────────
    const take = A_BENE[n] ? pulse(arrive + 0.2, arrive + 0.6, arrive + 1.0) : 0;
    s = handOn(s, x, dir, BOOK.x, BOOK.y - 2, take);
    const holding = A_BENE[n] ? sec(arrive + 0.55, arrive + 0.65) : A_OBJ[n] ? 1 - sec(0.75, 0.85) : BOOK_HELD[n];
    s = mixStance(s, { ...s, fistR: { x: 20, y: -22 }, fistL: { x: 14, y: -20 } }, holding * (1 - take));
    const put = A_OBJ[n] ? pulse(0.3, 0.8, 1.2) : 0;
    s = handOn(s, x, dir, BOOK.x, BOOK.y - 2, put);
    // ── the globe, spun (b8) ─────────────────────────────────────────────────
    const spinHand = A_GLOBE[n] ? pulse(arrive + 0.1, arrive + 0.4, arrive + 1.3) : 0;
    s = handOn(s, x, dir, GLOBE.x + GLOBE.r - 2 - 10 * sec(arrive + 0.4, arrive + 1.0), GLOBE.y - 4, spinHand);

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the study ────────────────────────────────────────────────────────────
    const pins = A_PINS[n] ? st(0.08, 0.75) : PINNED[n];
    const ask = A_STRONGER[n] ? st(0.35, 0.5) : 0;
    const descr = A_DESCR[n] ? st(0.3, 0.42) : DESCR[n];
    const moral = A_MORAL[n] ? st(0.18, 0.3) : MORAL[n];
    const arrow = A_ERROR[n] ? st(0.05, 0.25) : ERROR[n];
    const cross = A_ERROR[n] ? st(0.5, 0.62) : ERROR[n];
    const bene = A_BENE[n] ? sec(arrive + 0.8, arrive + 1.3) : BENE[n];
    const obj = A_OBJ[n] ? st(0.12, 0.24) : OBJ[n];
    const spin = A_GLOBE[n] ? sec(arrive + 0.4, arrive + 2.6) : 0;

    // ── the village ──────────────────────────────────────────────────────────
    const universals = A_ENTER[n] ? sec(PORTAL.outTo + 0.2, PORTAL.outTo + 0.6) : VILLAGE[n];
    const gifts = A_GIFTS[n] ? st(0.1, 0.8) : GIFTS[n];
    const found = A_FOUND[n] ? st(0.15, 0.65) : FOUND[n];
    const crack = ORDER[n] ? pickAt(CRACK_AT, pickPos.value) : 0;

    // ── WHERE HE LOOKS (attend.ts): at each thing as it happens ───────────────
    const door = (k: number) => HOMES[k] + 12;
    const LK = A_PINS[n] ? [0.3, 172, 350, 1, L * 0.3, 222, 346, 1, L * 0.55, 268, 352, 1, L * 0.8, 0, 0, 0]
      : A_STRONGER[n] ? [arrive + 0.1, 230, 336, 1, L * 0.9, 0, 0, 0]
      : A_DESCR[n] ? [L * 0.25, 196, 398, 1, L * 0.9, 0, 0, 0]
      : A_MORAL[n] ? [L * 0.15, 250, 398, 1, L * 0.9, 0, 0, 0]
      : A_ERROR[n] ? [0.1, 200, 398, 1, L * 0.2, 246, 398, 1, L * 0.5, 223, 398, 1, L * 0.9, 0, 0, 0]
      : A_BENE[n] ? [arrive + 0.1, BOOK.x, BOOK.y, 1, arrive + 0.7, x + 16 * dir, 452, 1]
      : ACT[n] === '' && BOOK_HELD[n] ? [0.1, x + 16 * dir, 452, 0.9]
      : A_OBJ[n] ? [0.2, BOOK.x, BOOK.y, 1, 1.4, 0, 0, 0]
      : A_GLOBE[n] ? [arrive + 0.05, GLOBE.x, GLOBE.y, 1, arrive + 2.8, 0, 0, 0]
      : A_ENTER[n] ? [PORTAL.outTo, HOMES[1], HOME_GROUND - 20, 0.9, PORTAL.outTo + 0.9, HOMES[3], HOME_GROUND - 24, 0.9]
      : A_GIFTS[n] ? [L * 0.08, door(0), HOME_GROUND - 6, 1, L * 0.24, door(1), HOME_GROUND - 6, 1, L * 0.38, door(2), HOME_GROUND - 6, 1, L * 0.52, door(3), HOME_GROUND - 6, 1, L * 0.66, door(4), HOME_GROUND - 6, 1, L * 0.9, 0, 0, 0]
      : A_FOUND[n] ? [L * 0.12, 200, 480, 1, L * 0.7, 300, 480, 0.8]
      : ORDER[n] ? [0.3, 206, 480, 0.8]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    return {
      fig: hideLeadWhile(lookPose(fig, x, GROUND, K_M, dirV, 1, carry(cv, 19, n, lk.x, lk.x, tr), carry(cv, 20, n, lk.y, lk.y, tr), carry(cv, 21, n, 0, lk.w, tr)), A_ENTER[n] === 1 && b < PORTAL.outTo + 0.2),
      world: carry(cv, 1, n, VILLAGE[p], world, A_ENTER[n] ? 1 : tr),
      kStudy: carry(cv, 2, n, VILLAGE[p], kStudy, A_ENTER[n] ? 1 : tr),
      kVillage: carry(cv, 3, n, 1 - VILLAGE[p], kVillage, A_ENTER[n] ? 1 : tr),
      holding: carry(cv, 4, n, BOOK_HELD[p], holding, tr),
      pins: carry(cv, 5, n, PINNED[p], pins, tr),
      ask: carry(cv, 6, n, 0, ask, tr),
      descr: carry(cv, 7, n, DESCR[p], descr, tr),
      moral: carry(cv, 8, n, MORAL[p], moral, tr),
      arrow: carry(cv, 9, n, ERROR[p], arrow, tr),
      cross: carry(cv, 10, n, ERROR[p], cross, tr),
      bene: carry(cv, 11, n, BENE[p], bene, tr),
      obj: carry(cv, 12, n, OBJ[p], obj, tr),
      spin: carry(cv, 13, n, 0, spin, tr),
      universals: carry(cv, 14, n, VILLAGE[p], universals, tr),
      gifts: carry(cv, 15, n, GIFTS[p], gifts, tr),
      found: carry(cv, 16, n, FOUND[p], found, tr),
      crack: carry(cv, 17, n, 0, crack, tr),
      q2: carry(cv, 18, n, Q2[p], Q2[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const studyXf = useAnimatedStyle(() => ({
    opacity: 1 - SCENE.value.world,
    ...portalXf(SCENE.value.kStudy, GLOBE.x, GLOBE.y, MID.x, MID.y),
  }));
  const villageXf = useAnimatedStyle(() => ({
    opacity: SCENE.value.world > 0.001 ? 1 : 0,
    ...portalXf(SCENE.value.kVillage, SKY_AT.x, SKY_AT.y, MID.x, MID.y),
  }));
  const figXf = useAnimatedStyle(() => {
    const inVillage = SCENE.value.world >= 0.5;
    const k = inVillage ? SCENE.value.kVillage : SCENE.value.kStudy;
    const xf = inVillage ? portalXf(k, SKY_AT.x, SKY_AT.y, MID.x, MID.y) : portalXf(k, GLOBE.x, GLOBE.y, MID.x, MID.y);
    return { opacity: 1, ...xf };
  });
  const villageWords = useDerivedValue(() => (SCENE.value.world >= 0.5 ? wordsAt(SCENE.value.kVillage) : 0));
  const studyWords = useDerivedValue(() => (1 - SCENE.value.world) * wordsAt(SCENE.value.kStudy));

  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.set, villageXf]} pointerEvents="none">
        <Village S={SCENE} />
      </Animated.View>
      <Animated.View style={[styles.set, studyXf]} pointerEvents="none">
        <View style={styles.floor} />
        <View style={styles.wall}>
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <View key={k} style={[styles.panel, { left: 6 + k * 57 }]} />)}
        </View>
        <ObjectArt parts={MAP_ART} tone={WOOD} />
        <WallMap S={SCENE} />
        <ObjectArt parts={DESK_ART} tone={WOOD} />
        <ObjectArt parts={STAND_ART} tone={WOOD} />
        <Globe S={SCENE} />
        <View style={styles.ground} />
        <Book S={SCENE} DF={DF} />
      </Animated.View>
      {/* THE WORDS ARE LAID OVER THE SETS, NOT INSIDE THEM. The must-box probe reads a
          word inside a transparent plate, and a set still nine times over on the change
          beat puts that hidden word far off the stage (check:space). A word only shows
          once its set has landed at scale 1, so over the sets is where it belongs. */}
      <VillageWords S={SCENE} words={villageWords} on={on} />
      <StudyWords S={SCENE} words={studyWords} />
      <Animated.View style={[styles.set, figXf]} pointerEvents="none">
        <Stickman D={DF} k={K_M} />
      </Animated.View>
      {Q2[i] ? <Signs picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const MAP_ART = mapFrame();
const DESK_ART = desk();
const STAND_ART = globeStand();
/** The five homes, each in its own material: snow, felt, stone and thatch, red lacquer, whitewash. */
const HOME_ART = [igloo(HOMES[0]), tent(HOMES[1]), roundHut(HOMES[2]), pagoda(HOMES[3]), cottage(HOMES[4])];
const HOME_TONE = [stageToneOf(DEEP), stageToneOf(SAGE), stageToneOf(OLIVE), stageToneOf(EMBER), stageToneOf(OLIVE)];
const POST_ART = signPosts();

// ── the study ────────────────────────────────────────────────────────────────

function WallMap({ S }: { S: SharedValue<any> }) {
  const ask = useAnimatedStyle(() => ({ opacity: S.value.ask }));
  return (
    <View style={styles.map} pointerEvents="none">
      <View style={[styles.land, { left: 12, top: 10, width: 44, height: 30 }]} />
      <View style={[styles.land, { left: 64, top: 6, width: 58, height: 40 }]} />
      <View style={[styles.land, { left: 124, top: 16, width: 28, height: 34 }]} />
      {PINS.map(([px, py], k) => <Pin key={k} S={S} k={k} x={px - MAP.x0} y={py - MAP.top} />)}
      <Animated.Text style={[styles.ask, ask]}>?</Animated.Text>
    </View>
  );
}
function Pin({ S, k, x, y }: { S: SharedValue<any>; k: number; x: number; y: number }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.pins * PINS.length - k);
    return { opacity: v, transform: [{ translateY: -4 * (1 - v) }] };
  });
  return (
    <Animated.View style={[styles.pin, { left: x - 3, top: y - 3 }, st]}>
      <View style={[styles.pinCap, { backgroundColor: PIN_COLOURS[k] }]} />
    </Animated.View>
  );
}
function Globe({ S }: { S: SharedValue<any> }) {
  // the land goes round: slowly all the time, and once more when he spins it (b8)
  const land = useAnimatedStyle(() => ({ transform: [{ translateX: -(((S.value.t * 3 + 60 * S.value.spin) % 60)) }] }));
  return (
    <View style={styles.globe} pointerEvents="none">
      <Animated.View style={[styles.globeLand, land]}>
        {[0, 1].map((r) => (
          <View key={r} style={{ position: 'absolute', left: r * 60, top: 0, width: 60, height: 2 * GLOBE.r }}>
            <View style={[styles.land, { left: 4, top: 8, width: 16, height: 14 }]} />
            <View style={[styles.land, { left: 28, top: 4, width: 20, height: 22 }]} />
            <View style={[styles.land, { left: 12, top: 28, width: 12, height: 8 }]} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}
function Book({ S, DF }: { S: SharedValue<any>; DF: SharedValue<Bundle> }) {
  const st = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const h = S.value.holding;
    return {
      opacity: 1 - S.value.world,
      transform: [
        { translateX: lerp(BOOK.x, w[0].translateX, h) },
        { translateY: lerp(BOOK.y, w[1].translateY - 3, h) },
      ],
    };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.bookCover} /></Animated.View>;
}
function StudyWords({ S, words }: { S: SharedValue<any>; words: SharedValue<number> }) {
  const descr = useAnimatedStyle(() => ({ opacity: S.value.descr * words.value }));
  const moral = useAnimatedStyle(() => ({ opacity: S.value.moral * words.value }));
  const arrow = useAnimatedStyle(() => ({ opacity: S.value.arrow * words.value, transform: [{ scaleX: S.value.arrow }] }));
  const cross = useAnimatedStyle(() => ({ opacity: S.value.cross * words.value, transform: [{ scale: 0.6 + 0.4 * S.value.cross }] }));
  const bene = useAnimatedStyle(() => ({ opacity: S.value.bene * words.value }));
  const obj = useAnimatedStyle(() => ({ opacity: S.value.obj * words.value }));
  return (
    <>
      <Animated.View style={[styles.plate, styles.descrPlate, descr]}>
        <Text style={styles.plateText} numberOfLines={1}>DESCRIPTIVE</Text>
      </Animated.View>
      <Animated.View style={[styles.plate, styles.moralPlate, moral]}>
        <Text style={styles.plateText} numberOfLines={1}>MORAL</Text>
      </Animated.View>
      <Animated.View style={[styles.arrow, arrow]} />
      <Animated.View style={[styles.cross, cross]}>
        <View style={[styles.crossBar, { transform: [{ rotate: '45deg' }] }]} />
        <View style={[styles.crossBar, { transform: [{ rotate: '-45deg' }] }]} />
      </Animated.View>
      <Animated.View style={[styles.plate, styles.benePlate, bene]}>
        <Text style={styles.plateText} numberOfLines={1}>BENEDICT</Text>
      </Animated.View>
      <Animated.View style={[styles.plate, styles.objPlate, obj]}>
        <Text style={styles.plateText} numberOfLines={1}>OBJECTIVISM</Text>
      </Animated.View>
    </>
  );
}

// ── the village ──────────────────────────────────────────────────────────────

function Village({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <View style={styles.sky} />
      <View style={styles.hillsFar} />
      <Foundation S={S} />
      {HOME_ART.map((art, k) => <SetArt key={k} parts={art} tone={HOME_TONE[k]} />)}
      {HOMES.map((hx, k) => <Gift key={hx} S={S} k={k} x={hx} />)}
      <View style={styles.villageFloor} />
    </>
  );
}
function Foundation({ S }: { S: SharedValue<any> }) {
  // the grass the homes stand on draws back, and one stone foundation runs under all five
  const grass = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 - 0.8 * S.value.found }] }));
  const stones = useAnimatedStyle(() => ({ opacity: S.value.found }));
  const crack = useAnimatedStyle(() => ({ opacity: S.value.crack }));
  const crack2 = useAnimatedStyle(() => ({ opacity: clamp01(S.value.crack * 2 - 1) }));
  return (
    <>
      <Animated.View style={[styles.stones, stones]}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <View key={k} style={[styles.joint, { left: 22 + k * 48 + (k % 2) * 12 }]} />)}
        <Animated.View style={[styles.crack, { left: 150 }, crack]} />
        <Animated.View style={[styles.crack, { left: 262, transform: [{ rotate: '24deg' }] }, crack2]} />
      </Animated.View>
      <Animated.View style={[styles.grass, grass]} />
    </>
  );
}
/** An igloo: a white half-dome of snow blocks with an arched door at its foot. */
function Igloo() {
  return (
    <View style={styles.igloo}>
      {[0, 1, 2].map((r) => <View key={r} style={[styles.course, { top: 7 + r * 7 }]} />)}
      <View style={styles.iglooDoor} />
    </View>
  );
}
function Gift({ S, k, x }: { S: SharedValue<any>; k: number; x: number }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.gifts * HOMES.length - k);
    return { opacity: v, transform: [{ translateY: -6 * (1 - v) }] };
  });
  return (
    <Animated.View style={[styles.gift, { left: x + 12 }, st]}>
      <View style={styles.ribbon} />
    </Animated.View>
  );
}
function VillageWords({ S, words, on }: { S: SharedValue<any>; words: SharedValue<number>; on: (a: readonly number[]) => boolean }) {
  const uni = useAnimatedStyle(() => ({ opacity: words.value * S.value.universals * (1 - S.value.q2) }));
  const found = useAnimatedStyle(() => ({ opacity: words.value * S.value.found * (1 - S.value.q2) }));
  return (
    <>
      {on(VILLAGE) ? (
        <Animated.View style={[styles.plate, styles.uniPlate, uni]}>
          <Text style={styles.plateText} numberOfLines={1}>HUMAN UNIVERSALS</Text>
        </Animated.View>
      ) : null}
      {on(FOUND) ? (
        <Animated.View style={[styles.plate, styles.foundPlate, found]}>
          <Text style={styles.plateText} numberOfLines={1}>SHARED FOUNDATION</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

// ── Q2: the two signs ────────────────────────────────────────────────────────

function Signs({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      <ObjectArt parts={POST_ART} tone={WOOD} />
      {Q2_T.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={6}
          disabled={answered} sealAt="tr"
          style={[styles.sign, { left: q.x - 36, top: 398 }]}
        >
          <View style={[styles.signFace, answered && q.correct && styles.tagRight]}>
            <Text style={[styles.plateText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.label}</Text>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const MAP_W = MAP.x1 - MAP.x0;
const MAP_H = MAP.bottom - MAP.top;

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  set: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0 },

  // ── the study ─────────────────────────────────────────────────────────────
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: {
    position: 'absolute', left: 0, top: 288, width: STAGE_W, height: GROUND - 288, backgroundColor: WALL.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  panel: { position: 'absolute', top: 0, bottom: 0, width: 1, borderRadius: 0.5, backgroundColor: WALL.RULE },
  map: {
    position: 'absolute', left: MAP.x0, top: MAP.top, width: MAP_W, height: MAP_H, backgroundColor: SKY.STONE,
    overflow: 'hidden', borderRadius: 1,
  },
  land: { position: 'absolute', borderRadius: 8, backgroundColor: stageToneOf(OLIVE).STONE, borderWidth: 1, borderColor: INK },
  pin: { position: 'absolute', width: 6, height: 6 },
  pinCap: { width: 6, height: 6, borderRadius: 3, borderWidth: 1, borderColor: INK },
  ask: {
    position: 'absolute', left: MAP_W / 2 - 8, top: 8, width: 16, fontFamily: 'Inter_700Bold', fontSize: 24, lineHeight: 28,
    color: INK, textAlign: 'center', includeFontPadding: false,
  },
  globe: {
    position: 'absolute', left: GLOBE.x - GLOBE.r, top: GLOBE.y - GLOBE.r, width: 2 * GLOBE.r, height: 2 * GLOBE.r,
    borderRadius: GLOBE.r, backgroundColor: SKY.STONE, borderWidth: 1.5, borderColor: INK, overflow: 'hidden',
  },
  globeLand: { position: 'absolute', left: 0, top: 0, width: 120, height: 2 * GLOBE.r },
  bookCover: {
    position: 'absolute', left: -9, top: -5, width: 18, height: 10, borderRadius: 1.5, backgroundColor: DEEP,
    borderWidth: 1.2, borderColor: INK,
  },

  // ── the village ───────────────────────────────────────────────────────────
  sky: { position: 'absolute', left: 0, right: 0, top: 288, height: GROUND - 288, backgroundColor: SKY.STONE },
  hillsFar: {
    position: 'absolute', left: -40, right: -40, top: 420, height: 80, borderTopLeftRadius: 200, borderTopRightRadius: 200,
    backgroundColor: stageToneOf(SAGE).STONE,
  },
  grass: {
    position: 'absolute', left: 0, right: 0, top: HOME_GROUND, height: GROUND - HOME_GROUND, backgroundColor: stageToneOf(SAGE).SHADE,
    transformOrigin: '50% 0%',
  },
  stones: {
    position: 'absolute', left: 0, right: 0, top: HOME_GROUND, height: GROUND - HOME_GROUND, backgroundColor: stageToneOf(OLIVE).STONE,
    borderTopWidth: 1.5, borderColor: INK, overflow: 'hidden',
  },
  joint: { position: 'absolute', top: 0, bottom: 0, width: 1.2, borderRadius: 0.6, backgroundColor: INK, opacity: 0.5 },
  crack: {
    position: 'absolute', top: 2, width: 2, height: 24, borderRadius: 1, backgroundColor: INK, transform: [{ rotate: '-18deg' }],
  },
  igloo: {
    position: 'absolute', left: HOMES[0] - 26, top: HOME_GROUND - 28, width: 52, height: 28, borderTopLeftRadius: 26,
    borderTopRightRadius: 26, backgroundColor: PAPER_LIT, borderWidth: 1.5, borderBottomWidth: 0, borderColor: INK, overflow: 'hidden',
  },
  course: { position: 'absolute', left: 0, right: 0, height: 1, borderRadius: 0.5, backgroundColor: INK, opacity: 0.35 },
  iglooDoor: {
    position: 'absolute', left: 19, bottom: 0, width: 14, height: 12, borderTopLeftRadius: 7, borderTopRightRadius: 7,
    backgroundColor: DEEP,
  },
  gift: {
    position: 'absolute', top: HOME_GROUND - 9, width: 9, height: 8, borderRadius: 1.5, backgroundColor: EMBER,
    borderWidth: 1, borderColor: INK, alignItems: 'center',
  },
  ribbon: { width: 1.6, height: '100%', borderRadius: 0.8, backgroundColor: PAPER_LIT },
  villageFloor: floorStyle(TONE, GROUND),

  // ── the words ─────────────────────────────────────────────────────────────
  plate: {
    position: 'absolute', height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  descrPlate: { left: MAP.x0 + 8, top: MAP.bottom - 20, width: 70 },
  moralPlate: { left: MAP.x1 - 60, top: MAP.bottom - 20, width: 52 },
  arrow: {
    position: 'absolute', left: MAP.x0 + 80, top: MAP.bottom - 14, width: 18, height: 2, borderRadius: 1, backgroundColor: INK,
    transformOrigin: '0% 50%',
  },
  cross: { position: 'absolute', left: MAP.x0 + 83, top: MAP.bottom - 19, width: 12, height: 12 },
  crossBar: { position: 'absolute', left: -1, top: 5, width: 14, height: 2.4, borderRadius: 1.2, backgroundColor: EMBER },
  benePlate: { left: MAP.x1 + 10, top: 380, width: 70 },
  objPlate: { left: MAP.x1 + 8, top: 362, width: 78 },
  uniPlate: { left: 140, top: 302, width: 120 },
  foundPlate: { left: 12, top: 478, width: 120 },

  sign: { position: 'absolute', width: 72, height: 22 },
  signFace: {
    flexGrow: 1, borderRadius: 3, backgroundColor: stageToneOf(OLIVE).STONE, borderWidth: 1.5, borderColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  tagRight: { backgroundColor: INK },
  onInk: { color: PAPER_LIT },
});

export function Ethics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics4Scene} band={[288, 514]} camera={CAM} />;
}
