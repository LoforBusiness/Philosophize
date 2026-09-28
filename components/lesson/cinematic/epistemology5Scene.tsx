import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './epistemology5Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, stand, travelStance,
  type Bundle, type Stance,
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
import { lineOf, stage } from './pace';
import { PORTAL, PORTAL_Z, portalAt, portalXf, portalScale, figureAt, wordsAt } from './portal';
import {
  bookcase, ladder, sideTable, windowFrame, hills, mill,
  RUNG_Y, BOOK, WINDOW, LATCH, MOON_WIN, MOON, MILL, STARS, ASK,
} from './epistemology5Set';
import { DEEP, EMBER, OLIVE, SAGE, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// epistemology-knowledge-5, "Why Are Humans Driven to Know?" — A STUDY AT NIGHT, AND
// THE HILL UNDER ITS MOON.
//
// Redrawn 2026-09-27: the fourth lesson of the branch in reading order, with a scene
// change (portal.ts). Every act is laid across its voiced line in stages.
//
//   b0   he takes Aristotle's book off the side table and reads it.   b1  pages turn.
//   b2   he sets it down; the ladder's rungs take their names, WISDOM at the top.
//   b3   at the window he lifts the latch; the window swings open and the bird on the
//        sill flies off into the night: FREE, beside WISDOM.
//   b4   hands on the sill, he looks out at the moon.   b5  SENSATION lights, at the foot.
//   b6   THE CHANGE: into the moon in the window, out of the moon over a hill. WONDER.
//   b7   the stars over him join into a question mark.
//   b8   for Bacon, the windmill on the far hill lights up: POWER.
//   b9   he turns from the moon to the mill.
//   b11  Q1: three stars rise to the shape picked.   b12  Q2: the moon, or the mill.
//
// COMPOSITION, in stage units. The study: the bookcase 10–80 with the ladder on it and
// its rung names at 116–174; the side table 178–216 with the book at 198; the window
// 280–372 × 364–444 with the moon at 344. The hill: the moon at 96, the windmill at
// 332, the question mark's stars over 176–212. He stands at 224 and 262 in the study,
// 190 on the hill. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('epistemology');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, epistemology-knowledge-5. */
const LINES = [7.28, 5.32, 7.24, 6.56, 5.96, 7.68, 7.84, 7, 8.76, 6.2, 0, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;
/** The middle of the band, where the moon ends up at the deepest point of the change. */
const MID = { x: STAGE_W / 2, y: 401 };
/** The study's moon is half the hill's, so the study is pushed in twice as deep and they meet. */
const Z_STUDY = PORTAL_Z * (MOON.r / MOON_WIN.r);
/** The ladder's rungs, bottom to top. */
const RUNGS = ['SENSATION', 'MEMORY', 'EXPERIENCE', 'SCIENCE', 'WISDOM'];

const X = BEATS.map((b) => b.x ?? 190);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_READ = is('read');
const A_PAGES = is('pages');
const A_LADDER = is('ladder');
const A_FREE = is('free');
const A_GAZE = is('gaze');
const A_SENSE = is('sense');
const A_ENTER = is('enter');
const A_ASK = is('ask');
const A_MILL = is('mill');
const flag = (f: (b: (typeof BEATS)[number]) => unknown) => BEATS.map((b) => (f(b) ? 1 : 0));
const BOOK_ON = flag((b) => b.book);
const RUNGS_ON = flag((b) => b.rungs);
const FREE = flag((b) => b.free);
const SENSE = flag((b) => b.sense);
const HILL = flag((b) => b.hill);
const ASKED = flag((b) => b.ask);
const MILL_ON = flag((b) => b.mill);
const Q2 = flag((b) => b.q2);
/** The trend pick is being answered: three stars rise to the shape picked (R7c). */
const PLOT = flag((b) => b.interact?.plot);
/** The three stars' heights for each shape, in the shapes' own order: born, taught, mixed. */
const RISE_AT = [[0.85, 0.05, 0.4], [0.86, 0.5, 0.6], [0.87, 0.95, 0.8]];
/** Which way he faces once each beat settles. */
const DIR = [-1, -1, -1, 1, 1, -1, -1, -1, 1, 1, 1, 1, 1, 1];

const Q2_T = [
  { id: 'ari', label: 'ARISTOTLE', x: 48, y: 306, w: 96, h: 64, correct: false },
  { id: 'bacon', label: 'FRANCIS BACON', x: 286, y: 370, w: 96, h: 112, correct: true },
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
function handOn(s: Stance, x: number, dir: number, which: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_M, dir: dir < 0 ? -1 : 1 }, which, tx, ty, w);
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology'));

export default function Epistemology5Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(21);
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

    // ── the change (b6), and which set he is in otherwise ───────────────────
    const pt = portalAt(b);
    const world = A_ENTER[n] ? pt.world : HILL[n];
    const kStudy = A_ENTER[n] ? pt.out : HILL[n];
    const kHill = A_ENTER[n] ? pt.into : 1 - HILL[n];

    // ── where he is ──────────────────────────────────────────────────────────
    const xp = X[p];
    const xn = X[n];
    const walking = !A_ENTER[n] && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    const swapU = clamp01((b - PORTAL.swapFrom) / (PORTAL.swapTo - PORTAL.swapFrom));
    const x = n === 0 ? xn : carry(cv, 0, n, xp, xn, A_ENTER[n] ? swapU : walking ? walkU : tr);
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    const dirV = A_ENTER[n]
      ? facing(DIR[p], DIR[n], b - PORTAL.swapFrom)
      : walking
        ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
        : facing(DIR[p], DIR[n], b);
    const dir = dirV < 0 ? -1 : 1;
    const arrive = walking ? walkDur : 0;

    // ── the book: picked up (b0), read (b0, b1), set down (b2) ──────────────
    const pick = A_READ[n] ? pulse(0.5, 0.9, 1.3) : 0;
    s = handOn(s, x, dir, 1, BOOK.x, BOOK.y - 2, pick);
    const holding = A_READ[n] ? sec(0.85, 0.95) : A_LADDER[n] ? 1 - sec(0.75, 0.85) : BOOK_ON[n];
    s = mixStance(s, { ...s, fistR: { x: 20, y: -22 }, fistL: { x: 14, y: -20 } }, holding * (1 - pick));
    const setDown = A_LADDER[n] ? pulse(0.3, 0.75, 1.1) : 0;
    s = handOn(s, x, dir, 1, BOOK.x, BOOK.y - 2, setDown);
    // ── the latch (b3), the sill (b4) ───────────────────────────────────────
    const latch = A_FREE[n] ? pulse(arrive + 0.3, arrive + 0.7, arrive + 1.4) : 0;
    s = handOn(s, x, dir, 1, LATCH.x, LATCH.y - 6 * sec(arrive + 0.7, arrive + 1.0), latch);
    const sill = A_GAZE[n] ? sec(0.3, 0.8) : A_SENSE[n] ? 1 - sec(0.6, 1.1) : 0;
    s = handOn(s, x, dir, 1, WINDOW.x0 + 6, WINDOW.sill - 1, sill);
    s = handOn(s, x, dir, -1, WINDOW.x0 + 2, WINDOW.sill - 1, sill);
    // looking up: at the moon (b4), under the question mark (b7)
    s = { ...s, neck: s.neck + 0.14 * sill + 0.2 * (A_ASK[n] ? pulse(0.4, 1.2, 6.2) : 0) };

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the study ────────────────────────────────────────────────────────────
    const page = A_PAGES[n] ? ((b * 0.8) % 1) * sec(0.3, 0.6) * (1 - sec(L - 0.3, L)) : 0;
    const rungs = A_LADDER[n] ? st(0.12, 0.6) : RUNGS_ON[n];
    const wisdom = A_LADDER[n] ? st(0.62, 0.72) : RUNGS_ON[n];
    const open = A_FREE[n] ? sec(arrive + 0.8, arrive + 1.4) : FREE[n];
    const flight = A_FREE[n] ? sec(arrive + 1.3, arrive + 3.3) : FREE[n];
    const free = A_FREE[n] ? st(0.72, 0.8) : FREE[n];
    const sense = A_SENSE[n] ? st(0.68, 0.78) : SENSE[n];
    const aris = A_READ[n] ? st(0.05, 0.14) : 1;

    // ── the hill ─────────────────────────────────────────────────────────────
    const wonder = A_ENTER[n] ? sec(PORTAL.outTo + 0.2, PORTAL.outTo + 0.6) : HILL[n];
    const ask = A_ASK[n] ? st(0.3, 0.8) : ASKED[n];
    const lit = A_MILL[n] ? st(0.35, 0.5) : MILL_ON[n];
    const rise0 = PLOT[n] ? pickAt(RISE_AT[0], pickPos.value) : 0.5;
    const rise1 = PLOT[n] ? pickAt(RISE_AT[1], pickPos.value) : 0.5;
    const rise2 = PLOT[n] ? pickAt(RISE_AT[2], pickPos.value) : 0.5;

    return {
      fig: lookPose(fig, x, GROUND, K_M, dirV, 1, gazeX.value, gazeY.value, gazeOn.value),
      world: carry(cv, 1, n, HILL[p], world, A_ENTER[n] ? 1 : tr),
      kStudy: carry(cv, 2, n, HILL[p], kStudy, A_ENTER[n] ? 1 : tr),
      kHill: carry(cv, 3, n, 1 - HILL[p], kHill, A_ENTER[n] ? 1 : tr),
      holding: carry(cv, 4, n, BOOK_ON[p], holding, tr),
      page: carry(cv, 5, n, 0, page, tr),
      rungs: carry(cv, 6, n, RUNGS_ON[p], rungs, tr),
      wisdom: carry(cv, 7, n, RUNGS_ON[p], wisdom, tr),
      open: carry(cv, 8, n, FREE[p], open, tr),
      flight: carry(cv, 9, n, FREE[p], flight, tr),
      free: carry(cv, 10, n, FREE[p], free, tr),
      sense: carry(cv, 11, n, SENSE[p], sense, tr),
      aris: carry(cv, 12, n, 1, aris, tr),
      wonder: carry(cv, 13, n, HILL[p], wonder, tr),
      ask: carry(cv, 14, n, ASKED[p], ask, tr),
      lit: carry(cv, 15, n, MILL_ON[p], lit, tr),
      plot: carry(cv, 16, n, 0, PLOT[n], tr),
      rise0: carry(cv, 17, n, 0.5, rise0, tr),
      rise1: carry(cv, 18, n, 0.5, rise1, tr),
      rise2: carry(cv, 19, n, 0.5, rise2, tr),
      q2: carry(cv, 20, n, Q2[p], Q2[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const studyXf = useAnimatedStyle(() => ({
    opacity: 1 - SCENE.value.world,
    ...portalXf(SCENE.value.kStudy, MOON_WIN.x, MOON_WIN.y, MID.x, MID.y, Z_STUDY),
  }));
  const hillXf = useAnimatedStyle(() => ({
    opacity: SCENE.value.world > 0.001 ? 1 : 0,
    ...portalXf(SCENE.value.kHill, MOON.x, MOON.y, MID.x, MID.y),
  }));
  const figXf = useAnimatedStyle(() => {
    const onHill = SCENE.value.world >= 0.5;
    const k = onHill ? SCENE.value.kHill : SCENE.value.kStudy;
    const s = onHill ? portalScale(k) : portalScale(k, Z_STUDY);
    const xf = onHill
      ? portalXf(k, MOON.x, MOON.y, MID.x, MID.y)
      : portalXf(k, MOON_WIN.x, MOON_WIN.y, MID.x, MID.y, Z_STUDY);
    return { opacity: figureAt(s), ...xf };
  });
  const hillWords = useDerivedValue(() => (SCENE.value.world >= 0.5 ? wordsAt(SCENE.value.kHill) : 0));
  const studyWords = useDerivedValue(() => (1 - SCENE.value.world) * wordsAt(SCENE.value.kStudy));

  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.set, hillXf]} pointerEvents="none">
        <Hill S={SCENE} />
      </Animated.View>
      <Animated.View style={[styles.set, studyXf]} pointerEvents="none">
        <View style={styles.floor} />
        <View style={styles.wall}>
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <View key={k} style={[styles.panel, { left: 6 + k * 57 }]} />)}
        </View>
        <Night />
        <ObjectArt parts={CASE_ART} tone={WOOD} />
        <ObjectArt parts={LADDER_ART} tone={WOOD} />
        <ObjectArt parts={TABLE_ART} tone={WOOD} />
        <Casement S={SCENE} />
        <ObjectArt parts={WINDOW_ART} tone={WOOD} />
        <Bird S={SCENE} />
        <View style={styles.ground} />
      </Animated.View>
      {/* THE WORDS ARE LAID OVER THE SETS, NOT INSIDE THEM. The must-box probe reads a
          word inside a transparent plate, and a set still nine times over on the change
          beat puts that hidden word far off the stage (check:space). A word only shows
          once its set has landed at scale 1, so over the sets is where it belongs. */}
      <HillWords S={SCENE} words={hillWords} on={on} />
      <StudyWords S={SCENE} words={studyWords} />
      <Animated.View style={[styles.set, figXf]} pointerEvents="none">
        <Book S={SCENE} DF={DF} />
        <Stickman D={DF} k={K_M} />
      </Animated.View>
      {Q2[i] ? <Answers picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const CASE_ART = bookcase();
const LADDER_ART = ladder();
const TABLE_ART = sideTable();
const WINDOW_ART = windowFrame();
const HILLS_ART = hills();
const MILL_ART = mill();

// ── the study ────────────────────────────────────────────────────────────────

/** The night in the window: the same sky and the same moon as the hill's, at half the size. */
function Night() {
  return (
    <View style={styles.windowNight}>
      <View style={styles.winMoon} />
      {[[10, 10], [44, 30], [70, 16], [22, 52], [80, 60]].map(([sx, sy]) => (
        <View key={sx} style={[styles.winStar, { left: sx, top: sy }]} />
      ))}
    </View>
  );
}
function Casement({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - 0.82 * S.value.open }] }));
  return (
    <Animated.View style={[styles.casement, st]}>
      <View style={styles.bar} />
    </Animated.View>
  );
}
function Bird({ S }: { S: SharedValue<any> }) {
  // it sits on the sill until the window opens, then flies up and away into the night
  const st = useAnimatedStyle(() => {
    const f = S.value.flight;
    return {
      opacity: 1 - clamp01((f - 0.7) / 0.3),
      transform: [
        { translateX: lerp(WINDOW.x1 - 22, WINDOW.x1 + 20, f) },
        { translateY: lerp(WINDOW.sill - 6, WINDOW.top + 6, f) - 8 * Math.sin(Math.PI * f) },
      ],
    };
  });
  const wing = useAnimatedStyle(() => ({
    transform: [{ rotate: `${S.value.flight > 0.01 && S.value.flight < 0.99 ? 35 * Math.sin(S.value.t * 22) : 0}deg` }],
  }));
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.birdBody} />
      <Animated.View style={[styles.birdWing, wing]} />
    </Animated.View>
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
  const leaf = useAnimatedStyle(() => ({
    opacity: S.value.page > 0.02 && S.value.page < 0.98 ? 1 : 0,
    transform: [{ scaleX: Math.cos(Math.PI * S.value.page) }],
  }));
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.bookBody} />
      <Animated.View style={[styles.bookLeaf, leaf]} />
    </Animated.View>
  );
}
function StudyWords({ S, words }: { S: SharedValue<any>; words: SharedValue<number> }) {
  const aris = useAnimatedStyle(() => ({ opacity: S.value.aris * words.value }));
  const free = useAnimatedStyle(() => ({ opacity: S.value.free * words.value }));
  return (
    <>
      <Animated.View style={[styles.plate, styles.arisPlate, aris]}>
        <Text style={styles.plateText} numberOfLines={1}>ARISTOTLE</Text>
      </Animated.View>
      {RUNGS.map((r, k) => <Rung key={r} S={S} k={k} label={r} words={words} />)}
      <Animated.View style={[styles.tag, styles.freeTag, free]}>
        <Text style={styles.plateText} numberOfLines={1}>FREE</Text>
      </Animated.View>
    </>
  );
}
function Rung({ S, k, label, words }: { S: SharedValue<any>; k: number; label: string; words: SharedValue<number> }) {
  // the names go up the ladder in turn; WISDOM is struck when it is reached, and SENSATION
  // is struck later, when the lesson comes back down to it
  const st = useAnimatedStyle(() => {
    const on = clamp01(S.value.rungs * RUNGS.length - k);
    return { opacity: (k === 4 ? S.value.wisdom : on) * words.value };
  });
  const lit = useAnimatedStyle(() => ({ opacity: k === 4 ? S.value.wisdom : k === 0 ? S.value.sense : 0 }));
  return (
    <Animated.View style={[styles.tag, { left: 116, top: RUNG_Y[k] - 7, width: 58 }, st]}>
      <Animated.View style={[styles.tagLit, lit]} />
      <Text style={styles.plateText} numberOfLines={1}>{label}</Text>
    </Animated.View>
  );
}

// ── the hill ─────────────────────────────────────────────────────────────────

function Hill({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <View style={styles.sky} />
      <View style={styles.moon} />
      {STARS.map(([sx, sy], k) => <Star key={k} S={S} x={sx} y={sy} k={k} />)}
      <Question S={S} />
      <PlotStars S={S} />
      <ObjectArt parts={HILLS_ART} tone={stageToneOf(SAGE)} />
      <Sails S={S} />
      <ObjectArt parts={MILL_ART} tone={WOOD} />
      <MillWindow S={S} />
      <View style={styles.hillFloor} />
    </>
  );
}
function Star({ S, x, y, k }: { S: SharedValue<any>; x: number; y: number; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.55 + 0.45 * Math.sin(S.value.t * (1.3 + (k % 3) * 0.4) + k) }));
  return <Animated.View style={[styles.star, { left: x - 1.5, top: y - 1.5 }, st]} />;
}
function Question({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {ASK.slice(0, -2).map(([x0, y0], k) => {
        const [x1, y1] = ASK[k + 1];
        return <Link key={k} S={S} k={k} x0={x0} y0={y0} x1={x1} y1={y1} />;
      })}
      {ASK.map(([ax, ay], k) => <AskStar key={k} S={S} k={k} x={ax} y={ay} />)}
    </>
  );
}
function Link({ S, k, x0, y0, x1, y1 }: { S: SharedValue<any>; k: number; x0: number; y0: number; x1: number; y1: number }) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const deg = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  // the lines draw one after another, the way the eye joins the stars
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${deg}deg` }, { scaleX: clamp01(S.value.ask * (ASK.length - 2) - k) }] }));
  return <Animated.View style={[styles.link, { left: x0, top: y0 - 0.6, width: len }, st]} />;
}
function AskStar({ S, k, x, y }: { S: SharedValue<any>; k: number; x: number; y: number }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.45 + 0.55 * S.value.ask, transform: [{ scale: 1 + 0.4 * S.value.ask * (k === ASK.length - 1 ? 1 : 0) }] }));
  return <Animated.View style={[styles.askStar, { left: x - 2, top: y - 2 }, st]} />;
}
function PlotStars({ S }: { S: SharedValue<any> }) {
  const a = useAnimatedStyle(() => ({ opacity: S.value.plot, transform: [{ translateY: -46 * S.value.rise0 }] }));
  const b = useAnimatedStyle(() => ({ opacity: S.value.plot, transform: [{ translateY: -46 * S.value.rise1 }] }));
  const c = useAnimatedStyle(() => ({ opacity: S.value.plot, transform: [{ translateY: -46 * S.value.rise2 }] }));
  return (
    <>
      <Animated.View style={[styles.plotStar, { left: 238 }, a]} />
      <Animated.View style={[styles.plotStar, { left: 262 }, b]} />
      <Animated.View style={[styles.plotStar, { left: 286 }, c]} />
    </>
  );
}
function Sails({ S }: { S: SharedValue<any> }) {
  // the wind turns the sails all night; Bacon's point is what the mill does with it
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${(S.value.t * 40) % 360}deg` }] }));
  return (
    <Animated.View style={[styles.hub, st]}>
      {[0, 90, 180, 270].map((d) => (
        <View key={d} style={[styles.sailArm, { transform: [{ rotate: `${d}deg` }, { translateX: 14 }] }]}>
          <View style={styles.sail} />
        </View>
      ))}
    </Animated.View>
  );
}
function MillWindow({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.lit * (0.85 + 0.15 * Math.sin(S.value.t * 5)) }));
  return <Animated.View style={[styles.millLight, st]} />;
}
function HillWords({ S, words, on }: { S: SharedValue<any>; words: SharedValue<number>; on: (a: readonly number[]) => boolean }) {
  const wonder = useAnimatedStyle(() => ({ opacity: words.value * S.value.wonder * (1 - S.value.q2) }));
  const power = useAnimatedStyle(() => ({ opacity: words.value * S.value.lit * (1 - S.value.q2) }));
  return (
    <>
      {on(HILL) ? (
        <Animated.View style={[styles.plate, styles.wonderPlate, wonder]}>
          <Text style={styles.plateText} numberOfLines={1}>WONDER</Text>
        </Animated.View>
      ) : null}
      {on(MILL_ON) ? (
        <Animated.View style={[styles.plate, styles.powerPlate, power]}>
          <Text style={styles.plateText} numberOfLines={1}>POWER</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

// ── Q2: the moon, or the mill ────────────────────────────────────────────────

function Answers({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q2 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {Q2_T.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={6}
          disabled={answered} sealAt="tr"
          style={[styles.answer, { left: q.x, top: q.y, width: q.w, height: q.h }]}
        >
          <View style={styles.answerFill}>
            <View style={[styles.answerTag, answered && q.correct && styles.tagRight]}>
              <Text style={[styles.plateText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const WIN_W = WINDOW.x1 - WINDOW.x0;
const WIN_H = WINDOW.sill - WINDOW.top;

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
  windowNight: {
    position: 'absolute', left: WINDOW.x0, top: WINDOW.top, width: WIN_W, height: WIN_H, backgroundColor: DEEP,
    overflow: 'hidden', borderRadius: 1,
  },
  winMoon: {
    position: 'absolute', left: MOON_WIN.x - MOON_WIN.r - WINDOW.x0, top: MOON_WIN.y - MOON_WIN.r - WINDOW.top,
    width: 2 * MOON_WIN.r, height: 2 * MOON_WIN.r, borderRadius: MOON_WIN.r, backgroundColor: PAPER_LIT,
  },
  winStar: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: PAPER_LIT },
  casement: {
    position: 'absolute', left: WINDOW.x0 + 2, top: WINDOW.top + 2, width: WIN_W - 4, height: WIN_H - 4,
    borderWidth: 2, borderColor: WOOD.SHADE, backgroundColor: 'rgba(255,255,255,0.08)', transformOrigin: '0% 50%',
    borderRadius: 1,
  },
  bar: { position: 'absolute', left: 0, right: 0, top: WIN_H / 2 - 3, height: 2, borderRadius: 1, backgroundColor: WOOD.SHADE },
  birdBody: {
    position: 'absolute', left: -6, top: -4, width: 12, height: 8, borderRadius: 4, backgroundColor: INK,
  },
  birdWing: {
    position: 'absolute', left: -3, top: -6, width: 8, height: 4, borderRadius: 2, backgroundColor: INK,
    transformOrigin: '20% 100%',
  },
  bookBody: {
    position: 'absolute', left: -9, top: -5, width: 18, height: 10, borderRadius: 1.5, backgroundColor: EMBER,
    borderWidth: 1.2, borderColor: INK,
  },
  bookLeaf: {
    position: 'absolute', left: 0, top: -4, width: 8, height: 8, borderRadius: 1, backgroundColor: PAPER_LIT,
    borderWidth: 0.8, borderColor: INK, transformOrigin: '0% 50%',
  },

  // ── the hill ──────────────────────────────────────────────────────────────
  sky: { position: 'absolute', left: 0, right: 0, top: 288, height: GROUND - 288, backgroundColor: DEEP },
  moon: {
    position: 'absolute', left: MOON.x - MOON.r, top: MOON.y - MOON.r, width: 2 * MOON.r, height: 2 * MOON.r,
    borderRadius: MOON.r, backgroundColor: PAPER_LIT,
  },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: PAPER_LIT },
  askStar: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: PAPER_LIT },
  link: { position: 'absolute', height: 1.2, borderRadius: 0.6, backgroundColor: PAPER_LIT, opacity: 0.7, transformOrigin: '0% 50%' },
  plotStar: {
    position: 'absolute', top: 360, width: 6, height: 6, borderRadius: 3, backgroundColor: EMBER,
    borderWidth: 1, borderColor: PAPER_LIT,
  },
  hub: { position: 'absolute', left: MILL.x - 2, top: MILL.hub - 2, width: 4, height: 4, borderRadius: 2, backgroundColor: INK },
  sailArm: { position: 'absolute', left: -12, top: 1, width: 28, height: 2, borderRadius: 1, backgroundColor: INK, transformOrigin: '0% 50%' },
  sail: {
    position: 'absolute', left: 6, top: -8, width: 20, height: 8, borderRadius: 1, backgroundColor: PAPER_LIT,
    borderWidth: 1, borderColor: INK,
  },
  millLight: {
    position: 'absolute', left: MILL.x - 3, top: MILL.base - 19, width: 6, height: 10, borderRadius: 1, backgroundColor: EMBER,
  },
  hillFloor: floorStyle(TONE, GROUND),

  // ── the words ─────────────────────────────────────────────────────────────
  plate: {
    position: 'absolute', height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  tag: {
    position: 'absolute', height: 13, borderRadius: 2, borderWidth: 1.2, borderColor: INK, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  tagLit: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: EMBER },
  arisPlate: { left: 222, top: 338, width: 66 },
  freeTag: { left: 178, top: RUNG_Y[4] - 7, width: 32 },
  wonderPlate: { left: 104, top: 386, width: 56 },
  powerPlate: { left: 258, top: 458, width: 50 },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },

  answer: { position: 'absolute' },
  answerFill: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 2 },
  answerTag: {
    paddingHorizontal: 3, height: 13, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
    backgroundColor: PLATE_FACE, justifyContent: 'center',
  },
  tagRight: { backgroundColor: INK },
  onInk: { color: PAPER_LIT },
});

export function Epistemology5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology5Scene} band={[288, 514]} camera={CAM} />;
}
