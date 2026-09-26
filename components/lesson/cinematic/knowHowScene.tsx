import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './knowHowScript';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, stand, travelStance,
  type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, facing,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import { pool, ladder, boardPosts, bench, POOL, BOARD, BOX, BENCH } from './knowHowSet';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// epistemology-knowledge-2, "Knowing How vs. Knowing That" — A SWIMMING POOL.
//
// Redrawn 2026-09-26, one of six second lessons. Every act below is laid across its
// voiced line in stages (pace.ts), with the line lengths copied from the narration
// manifest: the stage keeps acting for the whole line, not one second of it.
//
//   b0   he reads at the side of the pool, putting each finished manual on the pile
//        on the bench and starting the next.
//   b1   he goes to the edge and looks down at the water; the board's three slots
//        and the box under them, SWIMMING, outline in.
//   b2   KEEP THE HEAD LOW is written up; he shows it, bending; a tick — easy to check.
//   b3   an arrow runs from it down to the box; he mimes the stroke on dry land.
//   b4   two more instructions, then KNOWING THAT across the board; one more book.
//   b5   the box stays empty and is named KNOWING HOW; he dips a toe and pulls it back.
//   b7   he jumps in, flails, and swims a length; the box is ticked.
//   b8   Q1: four kickboards on the water while he swims back to the ladder.
//   b9   Q2: three buoys on the lane rope.
//
// COMPOSITION, in stage units: the board 10–194 × 298–390, the box 30–166 × 396–426;
// the bench 16–112 with the books on it; he stands at x 186 on the deck, and at 240 on the near coping; the
// pool 196–400, far coping at 436, near coping at 500, his lane's waterline at 474.
// Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('epistemology');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
const TILE = stageToneOf(SAGE);
const WATER = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, epistemology-knowledge-2. */
const LINES = [4.8, 2.9, 5.8, 6.9, 8.4, 7.2, 0, 5.4, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 46% of this band; this is 37%. */
const K_SW = K_FIG * 0.82;
/** Where his lane's water reaches him: everything below it is under the surface. */
const WATERLINE = 474;
/** Where his feet are, standing in the water — his shoulders at the surface. */
const WET_GY = 528;
/** The jump: from the edge to the lane. */
const EDGE_X = 240;
const LANE_X = 228;
const FAR_X = 370;

const X = BEATS.map((b) => b.x ?? 186);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_READ = is('read');
const A_EDGE = is('edge');
const A_DEMO = is('demo');
const A_MIME = is('mime');
const A_RECITE = is('recite');
const A_TOE = is('toe');
const A_SWIM = is('swim');
const A_BACK = is('back');
const BOOKS = BEATS.map((b) => b.books ?? 0);
const SLOTS = BEATS.map((b) => (b.slots ? 1 : 0));
const STEPS = BEATS.map((b) => b.steps ?? 0);
const LEAD = BEATS.map((b) => (b.lead ? 1 : 0));
const THAT = BEATS.map((b) => (b.that ? 1 : 0));
const HOW = BEATS.map((b) => (b.how ? 1 : 0));
const DONE = BEATS.map((b) => (b.done ? 1 : 0));
const WET = DONE;
const BOARDS = BEATS.map((b) => (b.boards ? 1 : 0));
const BUOYS = BEATS.map((b) => (b.buoys ? 1 : 0));
/** He faces the board while he reads and recites, the water otherwise. */
const DIR = BEATS.map((b) => (b.act === 'read' || b.act === 'recite' ? -1 : 1));

const STEP_TEXT = ['KEEP THE HEAD LOW', 'KICK FROM THE HIPS', 'BREATHE TO THE SIDE'];
const BOOK_TONES = [TEAL, OLIVE, DEEP, TEAL, OLIVE];

const KICKBOARDS = [
  { id: 'rules', l1: 'THE', l2: 'RULES', x: 256, y: 444, correct: false },
  { id: 'words', l1: 'THE', l2: 'TERMS', x: 330, y: 444, correct: false },
  { id: 'order', l1: 'WHAT TO', l2: 'DO FIRST', x: 256, y: 474, correct: false },
  { id: 'skill', l1: 'BEING ABLE', l2: 'TO DO IT', x: 330, y: 474, correct: true },
];
const KB_W = 68;
const KB_H = 26;
const BUOY_Q = [
  { id: 'rules', label: 'RULES', x: 262, correct: false },
  { id: 'reasons', label: 'REASONS', x: 318, correct: false },
  { id: 'doing', label: 'DOING', x: 374, correct: true },
];
const BUOY_W = 52;

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
/** A hand on a stage point, at his scale. */
function handOn(s: Stance, x: number, gy: number, dir: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: gy, k: K_SW, dir }, 1, tx, ty, w);
}
/** Swimming: the arms turning over, the body leaning into the stroke. */
function swimStance(t: number, flail: number): Stance {
  'worklet';
  const s = stand(t);
  const ph = t * 5.2;
  const stroke = {
    ...s,
    tilt: s.tilt - 0.22,
    fistR: { x: 18 * Math.cos(ph), y: -48 + 14 * Math.sin(ph) },
    fistL: { x: 18 * Math.cos(ph + Math.PI), y: -48 + 14 * Math.sin(ph + Math.PI) },
  };
  const thrash = {
    ...s,
    tilt: s.tilt + 0.1 * Math.sin(t * 7),
    fistR: { x: 10 + 8 * Math.sin(t * 9), y: -66 + 10 * Math.sin(t * 11) },
    fistL: { x: -10 + 8 * Math.sin(t * 8 + 1), y: -62 + 10 * Math.sin(t * 10 + 2) },
  };
  return mixStance(stroke, thrash, flail);
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology'));

export default function KnowHowScene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(15);
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

    // ── where he is: on the deck, in mid-air, or in the water ─────────────
    const walking = !A_SWIM[n] && !A_BACK[n] && Math.abs(X[n] - X[p]) > 1;
    const walkU = walking ? ease01(b / moveTr(X[p], X[n], TR)) : 1;
    let tx = X[n];
    let gy = WET[n] ? WET_GY : GROUND;
    let wet = WET[n];
    let flail = 0;
    let swim = A_SWIM[n] || A_BACK[n] ? 1 : 0;
    if (A_SWIM[n]) {
      // to the edge (the carry below walks him there), the jump, the flailing, then a
      // length of the pool
      const jump = st(0.12, 0.26);
      tx = lerp(EDGE_X, LANE_X, jump);
      tx = lerp(tx, FAR_X, st(0.45, 1));
      gy = lerp(GROUND, WET_GY, jump) - 26 * Math.sin(Math.PI * jump);
      wet = st(0.24, 0.27);
      flail = bump(b, L, 0.25, 0.3, 0.46);
      swim = st(0.25, 0.3);
    } else if (A_BACK[n]) {
      tx = lerp(FAR_X, LANE_X, st(0, 0.85));
    }
    // carried: every move blends from where he is on screen, a walk at the pace it needs
    const x = carry(cv, 0, n, X[p], tx, walking ? walkU : A_SWIM[n] ? st(0, 0.12) : tr);
    const figGY = carry(cv, 1, n, WET[p] ? WET_GY : GROUND, gy, tr);
    const dir = DIR[n] as 1 | -1;

    // ── his act, laid across the line ──────────────────────────────────────
    let s: Stance = walking
      ? travelStance(X[p], X[n], hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);

    // reading, and setting each finished book on the pile
    const drops = [0.22, 0.42, 0.62, 0.82];
    let dip = 0;
    if (A_READ[n]) {
      s = { ...s, neck: s.neck - 0.28, fistR: { x: 14, y: -46 }, fistL: { x: 8, y: -44 } };
      for (let k = 0; k < drops.length; k++) dip += bump(b, L, drops[k] - 0.08, drops[k], drops[k] + 0.08);
      s = handOn(s, x, figGY, dir, BENCH.x + BENCH.w - 14, BENCH.top - 40, dip);
    }
    const pile = A_READ[n] ? drops.reduce((c, d) => c + st(d - 0.02, d + 0.04), 0) : A_RECITE[n] ? 4 + st(0.88, 0.96) : BOOKS[n];
    // looking down at the water from the edge
    if (A_EDGE[n]) s = { ...s, neck: s.neck - 0.35 * st(0.2, 0.5), tilt: s.tilt - 0.08 * st(0.2, 0.5) };
    // showing the head held low
    const low = A_DEMO[n] ? bump(b, L, 0.34, 0.5, 0.74) : 0;
    s = { ...s, tilt: s.tilt - 0.5 * low, neck: s.neck - 0.4 * low };
    // miming the stroke on dry land
    const mime = A_MIME[n] ? st(0.28, 0.4) * (1 - st(0.94, 1)) : 0;
    s = mixStance(s, swimStance(t, 0), mime * 0.9);
    // a toe in the water, and back out again with a shiver
    const toe = A_TOE[n] ? bump(b, L, 0.3, 0.46, 0.64) : 0;
    const shiver = A_TOE[n] ? bump(b, L, 0.6, 0.66, 0.84) : 0;
    s = {
      ...s,
      footR: { x: s.footR.x + 18 * toe, y: s.footR.y + 5 * toe },
      tilt: s.tilt + 0.06 * toe + 0.05 * shiver * Math.sin(t * 40),
    };
    // in the water
    s = mixStance(s, swimStance(t, flail), swim);

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    return {
      fig: lookPose(fig, x, figGY, K_SW, facing(DIR[p], DIR[n], b), 1, gazeX.value, gazeY.value, gazeOn.value),
      x, wet: carry(cv, 2, n, WET[p], wet, tr),
      books: carry(cv, 3, n, BOOKS[p], pile, tr),
      slots: carry(cv, 4, n, SLOTS[p], SLOTS[n], A_EDGE[n] ? st(0.3, 0.7) : tr),
      steps: carry(cv, 5, n, STEPS[p],
        A_DEMO[n] ? st(0, 0.35) : A_RECITE[n] ? 1 + st(0.08, 0.34) + st(0.4, 0.66) : STEPS[n], tr),
      tick: carry(cv, 6, n, STEPS[p] > 0 ? 1 : 0, A_DEMO[n] ? st(0.72, 0.86) : STEPS[n] > 0 ? 1 : 0, tr),
      lead: carry(cv, 7, n, LEAD[p], A_MIME[n] ? st(0, 0.3) : LEAD[n], tr),
      that: carry(cv, 8, n, THAT[p], A_RECITE[n] ? st(0.72, 0.88) : THAT[n], tr),
      how: carry(cv, 9, n, HOW[p], A_TOE[n] ? st(0.12, 0.3) : HOW[n], tr),
      glow: carry(cv, 10, n, 0, A_TOE[n] ? st(0, 0.2) * (1 - st(0.9, 1)) : 0, tr),
      done: carry(cv, 11, n, DONE[p], A_SWIM[n] ? st(0.6, 0.78) : DONE[n], tr),
      splash: carry(cv, 12, n, 0, A_SWIM[n] ? bump(b, L, 0.23, 0.28, 0.5) : 0, tr),
      boards: carry(cv, 13, n, BOARDS[p], BOARDS[n], tr),
      buoys: carry(cv, 14, n, BUOYS[p], BUOYS[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // everything below his lane's surface is under the water
  const clip = useAnimatedStyle(() => ({ height: lerp(STAGE_H, WATERLINE, SCENE.value.wet) }));
  const ring = useAnimatedStyle(() => ({
    opacity: SCENE.value.wet,
    transform: [{ translateX: SCENE.value.x }, { scaleX: 1 + 0.12 * Math.sin(SCENE.value.t * 5.2) }],
  }));
  const splash = useAnimatedStyle(() => ({
    opacity: SCENE.value.splash,
    transform: [{ translateX: LANE_X }, { scale: 0.4 + SCENE.value.splash }],
  }));
  const book = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    return { opacity: SCENE.value.books < 4.9 && SCENE.value.wet < 0.5 ? 1 : 0, transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }] };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.wall} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <View key={k} style={[styles.wallGrout, { top: 16 + k * 20 }]} />)}
      </View>
      <Water S={SCENE} />
      <ObjectArt parts={POOL_ART} tone={TILE} />
      <ObjectArt parts={LADDER_ART} tone={TILE} />
      <ObjectArt parts={POSTS_ART} tone={WOOD} />
      <Board S={SCENE} on={on} />
      <ObjectArt parts={BENCH_ART} tone={WOOD} />
      <Books S={SCENE} />
      {BUOYS[i] ? <Buoys picked={picked} onPick={onPick} S={SCENE} /> : null}
      <View style={styles.ground} pointerEvents="none" />
      <Animated.View style={[styles.lane, clip]} pointerEvents="none">
        <Stickman D={DF} k={K_SW} />
      </Animated.View>
      <Animated.View style={[styles.rider, book]} pointerEvents="none">
        <View style={styles.heldBook} />
      </Animated.View>
      <Animated.View style={[styles.ripple, ring]} pointerEvents="none" />
      <Animated.View style={[styles.splash, splash]} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <View key={k} style={[styles.drop, { left: 18 * Math.cos(k * 0.6 + 3.3) - 3, top: 14 * Math.sin(k * 0.6 + 3.3) - 3 }]} />
        ))}
      </Animated.View>
      {BOARDS[i] ? <Kickboards picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const POOL_ART = pool();
const LADDER_ART = ladder();
const POSTS_ART = boardPosts();
const BENCH_ART = bench();

// ── the water: a plane that never stops moving ──────────────────────────────

function Water({ S }: { S: SharedValue<any> }) {
  return (
    <View style={styles.water} pointerEvents="none">
      {[0, 1, 2, 3].map((k) => <Wave key={k} S={S} k={k} />)}
    </View>
  );
}
function Wave({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 12 * Math.sin(S.value.t * 0.9 + k * 1.7) }] }));
  return <Animated.View style={[styles.wave, { top: 10 + k * 14, left: 24 + (k % 2) * 40 }, st]} />;
}

// ── the board, its instructions, and the box underneath ─────────────────────

function Board({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const slots = useAnimatedStyle(() => ({ opacity: S.value.slots }));
  const arrow = useAnimatedStyle(() => ({ height: 70 * S.value.lead, opacity: S.value.lead }));
  const that = useAnimatedStyle(() => ({ opacity: S.value.that, transform: [{ scale: 1.2 - 0.2 * S.value.that }] }));
  const how = useAnimatedStyle(() => ({ opacity: S.value.how, width: 92 * S.value.how }));
  const tick = useAnimatedStyle(() => ({ opacity: S.value.done, transform: [{ scale: 0.4 + 0.6 * S.value.done }, { rotate: '-8deg' }] }));
  const fill = useAnimatedStyle(() => ({ opacity: 0.35 * S.value.done }));
  const glow = useAnimatedStyle(() => ({ opacity: S.value.glow * (0.6 + 0.4 * Math.sin(S.value.t * 5)) }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.board}>
        <View style={styles.boardHead}>
          <Text style={styles.boardTitle} numberOfLines={1}>HOW TO SWIM</Text>
          {on(THAT) ? (
            <Animated.View style={[styles.thatTag, that]}>
              <Text style={styles.tagText} numberOfLines={1}>KNOWING THAT</Text>
            </Animated.View>
          ) : null}
        </View>
        {STEP_TEXT.map((w, k) => <Step key={w} S={S} k={k} text={w} />)}
        <Animated.View style={[StyleSheet.absoluteFill, slots]}>
          {[0, 1, 2].map((k) => <View key={k} style={[styles.slot, { top: 22 + k * 22 }]} />)}
        </Animated.View>
      </View>
      {on(LEAD) ? (
        <Animated.View style={[styles.arrow, arrow]}>
          <View style={styles.arrowHead} />
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.boxGlow, glow]} />
      <Animated.View style={[styles.box, slots]}>
        <View style={styles.check}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.checkFill, fill]} />
          <Animated.Text style={[styles.tickMark, tick]}>✓</Animated.Text>
        </View>
        <View>
          <Text style={styles.boxText} numberOfLines={1}>SWIMMING</Text>
          {on(HOW) ? (
            <Animated.View style={[styles.howClip, how]}>
              <Text style={styles.boxHow} numberOfLines={1}>= KNOWING HOW</Text>
            </Animated.View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

function Step({ S, k, text }: { S: SharedValue<any>; k: number; text: string }) {
  // each instruction is written on from its left, a stroke at a time
  const st = useAnimatedStyle(() => ({ width: 118 * clamp01(S.value.steps - k) }));
  const tick = useAnimatedStyle(() => ({ opacity: k === 0 ? S.value.tick : 0 }));
  return (
    <View style={[styles.stepRow, { top: 22 + k * 22 }]}>
      <Animated.View style={[styles.stepClip, st]}>
        <Text style={styles.stepText} numberOfLines={1}>{text}</Text>
      </Animated.View>
      <Animated.Text style={[styles.stepTick, tick]}>✓</Animated.Text>
    </View>
  );
}

// ── the books, piling up on the bench ───────────────────────────────────────

function Books({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {BOOK_TONES.map((c, k) => <Book key={k} S={S} k={k} color={c} />)}
    </>
  );
}
function Book({ S, k, color }: { S: SharedValue<any>; k: number; color: string }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.books - k);
    return { opacity: v, transform: [{ translateY: (1 - v) * -18 }] };
  });
  return (
    <Animated.View
      style={[styles.book, { top: BENCH.top - 9 * (k + 1), left: BENCH.x + 18 + (k % 2 ? 5 : -3), backgroundColor: color }, st]}
    >
      <View style={styles.bookPages} />
    </Animated.View>
  );
}

// ── Q1: four kickboards on the water ─────────────────────────────────────────

function Kickboards({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const drift = useAnimatedStyle(() => ({ opacity: S.value.boards, transform: [{ translateY: (1 - S.value.boards) * 12 }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, drift]} pointerEvents="box-none">
      {KICKBOARDS.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={9}
          disabled={answered} sealAt="tr"
          style={[styles.kick, { left: q.x - KB_W / 2, top: q.y - KB_H / 2 }]}
        >
          <View style={[styles.kickFace, answered && q.correct && styles.kickRight]}>
            <Text style={[styles.kickText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l1}</Text>
            <Text style={[styles.kickText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l2}</Text>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

// ── Q2: three buoys on the lane rope ────────────────────────────────────────

function Buoys({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const drift = useAnimatedStyle(() => ({ opacity: S.value.buoys }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, drift]} pointerEvents="box-none">
      <View style={styles.laneRope} pointerEvents="none" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
        <View key={k} style={[styles.bead, { left: POOL.x0 + 8 + k * 20 }]} pointerEvents="none" />
      ))}
      {BUOY_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={[styles.buoyTarget, { left: q.x - BUOY_W / 2 }]}
        >
          <View style={styles.buoyFill}>
            <View style={[styles.buoyPlate, answered && q.correct && styles.kickRight]}>
              <Text style={[styles.buoyText, answered && q.correct && styles.onInk]} numberOfLines={1}>THE</Text>
              <Text style={[styles.buoyText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.label}</Text>
            </View>
            <View style={styles.buoyLine} />
            <View style={styles.buoy} />
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: POOL.x1 - POOL.x0 + 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: {
    position: 'absolute', left: 0, top: 292, width: STAGE_W, height: POOL.far - 292,
    backgroundColor: TILE.STONE, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, overflow: 'hidden',
  },
  wallGrout: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: TILE.RULE },
  water: {
    position: 'absolute', left: POOL.x0, top: POOL.far, width: POOL.x1 - POOL.x0, height: POOL.near - POOL.far,
    backgroundColor: WATER.SHADE, overflow: 'hidden', borderRadius: 3,
  },
  wave: { position: 'absolute', width: 70, height: 2, borderRadius: 1, backgroundColor: PAPER_LIT, opacity: 0.55 },
  lane: { position: 'absolute', left: 0, top: 0, width: STAGE_W, overflow: 'hidden' },
  rider: { position: 'absolute', left: 0, top: 0 },
  heldBook: { position: 'absolute', left: -9, top: -8, width: 18, height: 12, borderRadius: 2, backgroundColor: TEAL, borderWidth: 1.5, borderColor: INK },
  ripple: {
    position: 'absolute', left: -20, top: WATERLINE - 4, width: 40, height: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: PAPER_LIT,
  },
  splash: { position: 'absolute', left: 0, top: WATERLINE - 10 },
  drop: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK },

  board: {
    position: 'absolute', left: BOARD.x, top: BOARD.y, width: BOARD.w, height: BOARD.h,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: lipOf(WOOD),
  },
  boardHead: { position: 'absolute', left: 8, right: 8, top: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  boardTitle: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  thatTag: { paddingHorizontal: 4, height: 13, borderRadius: 3, backgroundColor: DEEP, justifyContent: 'center' },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.3, color: PAPER_LIT, includeFontPadding: false,
  },
  slot: {
    position: 'absolute', left: 8, width: 124, height: 17, borderRadius: 2,
    borderWidth: 1.2, borderColor: WATER.SHADE, borderStyle: 'dashed',
  },
  stepRow: { position: 'absolute', left: 11, height: 17, width: 150, flexDirection: 'row', alignItems: 'center' },
  stepClip: { overflow: 'hidden', height: 13 },
  stepText: {
    width: 118, fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  stepTick: { marginLeft: 6, fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 13, color: EMBER, includeFontPadding: false },
  arrow: {
    position: 'absolute', left: BOX.x + BOX.w - 8, top: BOARD.y + 26, width: 2, backgroundColor: EMBER,
    alignItems: 'center', justifyContent: 'flex-end',
  },
  arrowHead: {
    width: 0, height: 0, marginBottom: -6, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: EMBER,
  },
  boxGlow: {
    position: 'absolute', left: BOX.x - 6, top: BOX.y - 6, width: BOX.w + 12, height: BOX.h + 12, borderRadius: 8,
    backgroundColor: SAGE,
  },
  box: {
    position: 'absolute', left: BOX.x, top: BOX.y, width: BOX.w, height: BOX.h, paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    flexDirection: 'row', alignItems: 'center',
  },
  check: {
    width: 16, height: 16, marginRight: 5, borderWidth: 1.5, borderColor: INK, borderRadius: 2,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  checkFill: { backgroundColor: SAGE },
  tickMark: { fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 15, color: EMBER, includeFontPadding: false },
  boxText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  howClip: { overflow: 'hidden', height: 11 },
  boxHow: {
    width: 92, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  book: {
    position: 'absolute', width: 62, height: 8, borderRadius: 1.5, borderWidth: 1.2, borderColor: INK,
  },
  bookPages: { position: 'absolute', right: 2, top: 1.5, width: 8, height: 3, backgroundColor: PAPER_LIT },

  kick: { position: 'absolute', width: KB_W, height: KB_H },
  kickFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 9, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  kickRight: { backgroundColor: INK },
  kickText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  onInk: { color: PAPER_LIT },

  laneRope: { position: 'absolute', left: POOL.x0 + 6, top: 466, width: POOL.x1 - POOL.x0 - 6, height: 1.5, backgroundColor: INK },
  bead: { position: 'absolute', top: 463, width: 7, height: 7, borderRadius: 3.5, backgroundColor: EMBER, borderWidth: 1, borderColor: INK },
  buoyTarget: { position: 'absolute', top: 412, width: BUOY_W, height: 62 },
  buoyFill: { flexGrow: 1, alignItems: 'center' },
  buoyPlate: {
    width: BUOY_W, height: 24, borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center',
  },
  buoyText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: -0.2, color: INK, includeFontPadding: false,
  },
  buoyLine: { width: 1.5, height: 15, backgroundColor: INK },
  buoy: { width: 18, height: 14, borderRadius: 7, backgroundColor: EMBER, borderWidth: 1.5, borderColor: INK },
});

export function KnowHowLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={KnowHowScene} band={[288, 514]} camera={CAM} />;
}
