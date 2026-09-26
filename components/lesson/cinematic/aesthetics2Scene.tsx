import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { Outlined, ell, bar, tri } from './Silhouette';
import { BEATS } from './aesthetics2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, pose, seated, stand, travelStance,
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
import { lineOf, stage, bump } from './pace';
import { screen, tent, fireRing, chair, SCREEN, TENT, FIRE, CHAIRS, SEAT } from './aesthetics2Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// aesthetics-aesthetics-2 — A CAMPSITE AT NIGHT, WITH AN OUTDOOR SCREEN.
//
// Redrawn 2026-09-26, one of six second lessons. Every act is laid across its voiced
// line in stages (pace.ts, line lengths from the narration manifest).
//
//   b0   the screen shows an old portrait, dated 1665; the nearest camper is moved
//        and wipes an eye while the boy feeds the fire.
//   b1   a spark of feeling leaves the portrait and passes camper to camper, each
//        catching it in turn — Tolstoy's infection.
//   b2   the boy's own spark swells as he speaks, jumps to a shadow on the tent and
//        on to the listeners: ARTIST · WORK · AUDIENCE.
//   b3   his hands at the fire, a shadow wolf rises on the tent and howls; the
//        listeners shiver, and then so does he.
//   b5   Q1: three thoughts over the fire.
//   b6   the screen shows the feeling in lines, then sounds, then words.
//   b7   he goes into the tent and the flap falls; the story plays on the screen
//        in other languages, the year counting on.
//   b8   Q2: the campers cry at a film.
//
// COMPOSITION, in stage units: the screen 16–200 × 298–394 over the tent (feet 12
// and 140, peak 414); the fire at x 208; the boy at x 166; three camp chairs at 262,
// 312, 362. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('aesthetics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
const CANVAS = stageToneOf(TEAL);
const NIGHT = stageToneOf(DEEP);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, aesthetics-aesthetics-2. */
const LINES = [6.3, 8.9, 9.2, 9.5, 0, 0, 5.8, 5.2, 0, 0];

/** Everyone at this scale: a lone figure at K_FIG fills 46% of this band; this is 37%. */
const K_A = K_FIG * 0.82;
/** The chairs' seat height, in the rig's units. */
const SEAT_H = 30;

const X = BEATS.map((b) => b.x ?? 166);
const A = BEATS.map((b) => b.a ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_MOVED = is('moved');
const A_SPREAD = is('spread');
const A_CHAIN = is('chain');
const A_WOLF = is('wolf');
const A_FORMS = is('forms');
const A_LEAVE = is('leave');
const SCR = BEATS.map((b) => b.screen ?? 'portrait');
const scr = (m: string) => SCR.map((v) => (v === m ? 1 : 0));
const S_PORTRAIT = scr('portrait');
const S_FORMS = scr('forms');
const S_SUBS = scr('subtitles');
const S_FILM = scr('film');
const CHAIN = BEATS.map((b) => (b.chain ? 1 : 0));
const WOLF = BEATS.map((b) => (b.wolf ? 1 : 0));
const IN_TENT = BEATS.map((b) => (b.inTent ? 1 : 0));
const THOUGHTS = BEATS.map((b) => (b.thoughts ? 1 : 0));
const CRYING = BEATS.map((b) => (b.crying ? 1 : 0));
/** The poll is being answered: the campers' tears follow the reading taken (R7c). */
const POLLING = BEATS.map((b) => (b.interact?.poll ? 1 : 0));
/**
 * How hard the campers cry at each reading, in the poll's own order: real pity for
 * people who don't exist cries hardest; make-believe pity is a performance of it;
 * sorrow that such evils could befall you is real but turned inward; an involuntary
 * stirring barely reaches the eyes.
 */
const CRY_BY = [1, 0.35, 0.75, 0.15];
/** The boy faces the campers, except on his way into the tent. */
const DIR = BEATS.map((b) => (b.act === 'leave' ? -1 : 1));

const THOUGHT_Q = [
  { id: 'fear', l1: 'PASS ON', l2: 'HIS FEAR', y: 300, correct: true },
  { id: 'beauty', l1: 'SOUND', l2: 'BEAUTIFUL', y: 332, correct: false },
  { id: 'true', l1: 'BE A', l2: 'TRUE STORY', y: 364, correct: false },
];
const SUBS = ['WOLF', 'LOUP', 'LOBO'];
const YEARS = ['1897', '2026', '2400'];

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
function handOn(s: Stance, x: number, dir: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_A, dir }, 1, tx, ty, w);
}
/** A camper in a chair: seated, and reacting — a hand to the chest, a shiver, a hand to the eyes. */
function camper(t: number, k: number, chest: number, shiver: number, eyes: number): Stance {
  'worklet';
  const r = seated(SEAT_H, t + k * 1.7);
  const nod = Math.max(0, Math.sin(t * (1.8 + k * 0.27) + k * 1.4)) ** 2;
  const shift = Math.sin(t * (0.6 + k * 0.11) + k * 2.2);
  const s = {
    ...r,
    tilt: r.tilt + 0.05 * shift,
    neck: r.neck - 0.24 * nod,
    fistL: { x: r.fistL.x - 2.5 * shift, y: r.fistL.y + 2 * shift },
    fistR: { x: r.fistR.x + 2 * shift, y: r.fistR.y - 2 * shift },
  };
  const a = { ...s, fistR: { x: 6, y: -44 } };
  const b = { ...s, tilt: s.tilt + 0.05 * Math.sin(t * 34 + k), fistR: { x: 2, y: -40 }, fistL: { x: -2, y: -42 } };
  const c = { ...s, neck: s.neck - 0.2, fistR: { x: 8, y: -66 } };
  return mixStance(mixStance(mixStance(s, a, chest), b, shiver), c, eyes);
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics'));

export default function Aesthetics2Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const h0 = useHeld();
  const h1 = useHeld();
  const h2 = useHeld();
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

    // ── the boy ────────────────────────────────────────────────────────────
    const walking = Math.abs(X[n] - X[p]) > 1;
    const walkU = walking ? ease01(b / moveTr(X[p], X[n], TR)) : 1;
    const x = carry(cv, 0, n, X[p], X[n], walking ? walkU : tr);
    const dir = DIR[n] as 1 | -1;
    let s: Stance = walking
      ? travelStance(X[p], X[n], hHold(A[p], t), hHold(A[n], t), hLive(A[n], t, b), walkU, WALK, 0)
      : hLive(A[n], t, b);
    // feeding the fire
    const feed = A_MOVED[n] ? bump(b, L, 0.1, 0.3, 0.55) : 0;
    s = { ...s, tilt: s.tilt - 0.4 * feed };
    s = handOn(s, x, dir, FIRE.cx - 6, FIRE.top, feed);
    // the shadow-maker's hands raised to the firelight, and his own shiver
    const cast = A_WOLF[n] ? bump(b, L, 0.02, 0.18, 0.72) : 0;
    s = mixStance(s, { ...s, fistR: { x: 26, y: -52 }, fistL: { x: 20, y: -46 } }, cast);
    const hisShiver = A_WOLF[n] ? st(0.7, 0.78) * (1 - st(0.96, 1)) : 0;
    s = { ...s, tilt: s.tilt + 0.06 * hisShiver * Math.sin(t * 36) };
    // crouching into the tent
    const crouch = A_LEAVE[n] ? st(0.45, 0.6) : IN_TENT[n] ? 1 : 0;
    s = { ...s, tilt: s.tilt - 0.6 * crouch };
    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(A[p], t)), s, tr));

    // ── the campers ───────────────────────────────────────────────────────
    const arrive = [0.25, 0.5, 0.75];
    const chest = [0, 1, 2].map((k) =>
      A_SPREAD[n] ? bump(b, L, arrive[k] - 0.02, arrive[k] + 0.06, arrive[k] + 0.2) : A_CHAIN[n] ? bump(b, L, 0.68 + k * 0.06, 0.74 + k * 0.06, 0.92) : 0);
    const shiver = A_WOLF[n] ? st(0.4, 0.5) * (1 - st(0.95, 1)) : 0;
    const cryK = POLLING[n] ? pickAt(CRY_BY, pickPos.value) : CRYING[n];
    const eyes0 = (A_MOVED[n] ? bump(b, L, 0.5, 0.62, 0.85) : 0) + cryK * (0.6 + 0.4 * Math.sin(t * 1.3));
    const c0 = keepHeld(h0, mixStance(carryFrom(h0, n, seated(SEAT_H, t)), camper(t, 0, chest[0], shiver, clamp01(eyes0)), tr));
    const c1 = keepHeld(h1, mixStance(carryFrom(h1, n, seated(SEAT_H, t)), camper(t, 1, chest[1], shiver, cryK * 0.8), tr));
    const c2 = keepHeld(h2, mixStance(carryFrom(h2, n, seated(SEAT_H, t)), camper(t, 2, chest[2], shiver, cryK * (0.5 + 0.5 * Math.sin(t))), tr));

    // ── the spark of feeling ──────────────────────────────────────────────
    // b1: screen → camper 1 → 2 → 3; b2: the boy → the tent → the campers
    let sx = 0;
    let sy = 0;
    let spark = 0;
    let grow = 0;
    if (A_SPREAD[n]) {
      const u = st(0.08, 0.8);
      const pts = [[SCREEN.x + 60, SCREEN.y + 40], [CHAIRS[0], 452], [CHAIRS[1], 452], [CHAIRS[2], 452]];
      const seg = Math.min(2, Math.floor(u * 3));
      const f = u * 3 - seg;
      sx = lerp(pts[seg][0], pts[seg + 1][0], f);
      sy = lerp(pts[seg][1], pts[seg + 1][1], f) - 26 * Math.sin(Math.PI * f);
      spark = st(0.04, 0.1) * (1 - st(0.9, 1));
    } else if (A_CHAIN[n]) {
      const a = st(0.32, 0.5);
      const c = st(0.58, 0.88);
      sx = lerp(lerp(x + 4, 90, a), CHAIRS[1], c);
      sy = lerp(lerp(448, 462, a), 452, c) - 30 * Math.sin(Math.PI * a) - 30 * Math.sin(Math.PI * c);
      spark = st(0.02, 0.1) * (1 - st(0.94, 1));
      grow = st(0.05, 0.3) * (1 - a);
    } else if (A_WOLF[n]) {
      sx = x + 4;
      sy = 448;
      spark = st(0.72, 0.8) * (1 - st(0.96, 1));
    }

    return {
      fig: lookPose(fig, x, GROUND, K_A, facing(DIR[p], DIR[n], b), 1 - carry(cv, 19, n, IN_TENT[p], A_LEAVE[n] ? st(0.62, 0.72) : IN_TENT[n], tr), gazeX.value, gazeY.value, gazeOn.value),
      c0: pose(c0, CHAIRS[0], GROUND, K_A, facing(IN_TENT[p] ? 1 : -1, IN_TENT[n] ? 1 : -1, b), 1),
      c1: pose(c1, CHAIRS[1], GROUND, K_A, -1, 1),
      c2: pose(c2, CHAIRS[2], GROUND, K_A, -1, 1),
      sx: carry(cv, 1, n, SCREEN.x + 60, sx, tr), sy: carry(cv, 2, n, SCREEN.y + 40, sy, tr),
      spark: carry(cv, 3, n, 0, spark, tr), grow: carry(cv, 4, n, 0, grow, tr),
      portrait: carry(cv, 5, n, S_PORTRAIT[p], S_PORTRAIT[n], tr),
      forms: carry(cv, 6, n, S_FORMS[p], S_FORMS[n], tr),
      formStep: carry(cv, 7, n, S_FORMS[p] * 3, A_FORMS[n] ? st(0.02, 0.2) + st(0.34, 0.5) + st(0.66, 0.82) : S_FORMS[n] * 3, tr),
      subs: carry(cv, 8, n, S_SUBS[p], S_SUBS[n], tr),
      subStep: carry(cv, 21, n, S_SUBS[p] * 2, A_LEAVE[n] ? st(0.3, 0.55) + st(0.62, 0.85) : S_SUBS[n] * 2, tr),
      film: carry(cv, 9, n, S_FILM[p], S_FILM[n], tr),
      chainA: carry(cv, 10, n, CHAIN[p], A_CHAIN[n] ? st(0.08, 0.2) : CHAIN[n], tr),
      chainW: carry(cv, 11, n, CHAIN[p], A_CHAIN[n] ? st(0.44, 0.56) : CHAIN[n], tr),
      chainU: carry(cv, 12, n, CHAIN[p], A_CHAIN[n] ? st(0.74, 0.86) : CHAIN[n], tr),
      wolf: carry(cv, 13, n, WOLF[p], A_WOLF[n] ? st(0.15, 0.45) : WOLF[n], tr),
      howl: carry(cv, 14, n, 0, A_WOLF[n] ? bump(b, L, 0.48, 0.58, 0.74) : 0, tr),
      flap: carry(cv, 15, n, IN_TENT[p], A_LEAVE[n] ? st(0.58, 0.7) : IN_TENT[n], tr),
      thoughts: carry(cv, 16, n, THOUGHTS[p], THOUGHTS[n], tr),
      tears: carry(cv, 17, n, CRYING[p], cryK, tr),
      leaving: carry(cv, 20, n, IN_TENT[p], A_LEAVE[n] ? st(0, 0.18) : IN_TENT[n], tr),
      fear: carry(cv, 18, n, 0, A_WOLF[n] ? st(0.72, 0.8) * (1 - st(0.96, 1)) : 0, tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const D0 = useDerivedValue<Bundle>(() => SCENE.value.c0);
  const D1 = useDerivedValue<Bundle>(() => SCENE.value.c1);
  const D2 = useDerivedValue<Bundle>(() => SCENE.value.c2);
  const spark = useAnimatedStyle(() => ({
    opacity: SCENE.value.spark,
    transform: [{ translateX: SCENE.value.sx }, { translateY: SCENE.value.sy }, { scale: 1 + 0.6 * SCENE.value.grow + 0.12 * Math.sin(SCENE.value.t * 9) }],
  }));
  const fear = useAnimatedStyle(() => ({ opacity: SCENE.value.fear, transform: [{ translateX: SCENE.value.sx }, { translateY: SCENE.value.sy }] }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Sky S={SCENE} />
      <ObjectArt parts={SCREEN_ART} tone={WOOD} />
      <Screen S={SCENE} on={on} />
      <ObjectArt parts={TENT_ART} tone={CANVAS} />
      <Shadow S={SCENE} on={on} />
      <View style={styles.tentInside} pointerEvents="none" />
      <Stickman D={DF} k={K_A} />
      <Flap S={SCENE} />
      <ObjectArt parts={FIRE_ART} tone={WOOD} />
      <Fire S={SCENE} />
      {CHAIRS.map((c) => <ObjectArt key={c} parts={chair(c)} tone={CANVAS} />)}
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D0} k={K_A} role="crowd" />
      <Stickman D={D1} k={K_A} role="crowd" />
      <Stickman D={D2} k={K_A} role="crowd" />
      <Tears S={SCENE} on={on} D={[D0, D1, D2]} />
      <Chain S={SCENE} on={on} DF={DF} />
      <Animated.View style={[styles.rider, spark]} pointerEvents="none">
        <View style={styles.sparkHalo} />
        <View style={styles.sparkCore} />
      </Animated.View>
      {on(A_WOLF) ? (
        <Animated.View style={[styles.rider, fear]} pointerEvents="none">
          <View style={styles.fearTag}><Text style={styles.tagText} numberOfLines={1}>FEAR</Text></View>
        </Animated.View>
      ) : null}
      {on(THOUGHTS) ? <Thoughts picked={picked} onPick={onPick} S={SCENE} live={THOUGHTS[i] === 1} /> : null}
    </View>
  );
}

const SCREEN_ART = screen();
const TENT_ART = tent();
const FIRE_ART = fireRing();

// ── the night sky ───────────────────────────────────────────────────────────

const STARS = [[228, 304], [262, 318], [300, 300], [338, 326], [376, 306], [246, 350], [356, 356], [214, 380]];
function Sky({ S }: { S: SharedValue<any> }) {
  return (
    <View style={styles.sky} pointerEvents="none">
      <View style={styles.moon} />
      {STARS.map(([x, y], k) => <Star key={k} S={S} k={k} x={x} y={y} />)}
    </View>
  );
}
function Star({ S, k, x, y }: { S: SharedValue<any>; k: number; x: number; y: number }) {
  const st = useAnimatedStyle(() => ({ opacity: 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(S.value.t * 1.7 + k * 2.3)) }));
  return <Animated.View style={[styles.star, { left: x, top: y - 288 }, st]} />;
}

// ── the screen: portrait, forms, subtitles, film ────────────────────────────

const PORTRAIT = [
  ell(0, 20, 34, 22, SAGE),
  ell(0, 0, 18, 22, PAPER_LIT),
  ell(0, -6, 22, 16, OLIVE),
];
const WOLF_PARTS = [
  ell(0, 0, 44, 16, INK),
  ell(22, -8, 16, 12, INK),
  tri(30, -9, 10, 5, 'right', INK),
  tri(20, -16, 5, 8, 'up', INK),
  tri(26, -16, 5, 8, 'up', INK),
  bar(-12, 6, -14, 18, 4, INK), bar(-4, 6, -5, 18, 4, INK), bar(8, 6, 9, 18, 4, INK), bar(14, 6, 16, 18, 4, INK),
  bar(-20, -2, -30, -10, 4, INK),
];

function Screen({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const portrait = useAnimatedStyle(() => ({ opacity: S.value.portrait }));
  const forms = useAnimatedStyle(() => ({ opacity: S.value.forms }));
  const subs = useAnimatedStyle(() => ({ opacity: S.value.subs }));
  const film = useAnimatedStyle(() => ({ opacity: S.value.film }));
  return (
    <View style={styles.screen} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, portrait]}>
        <View style={styles.oval}>
          <View style={styles.bust}><Outlined parts={PORTRAIT} width={1.5} line={INK} /></View>
        </View>
        <View style={styles.date}><Text style={styles.dateText}>1665</Text></View>
      </Animated.View>
      {on(S_FORMS) ? (
        <Animated.View style={[StyleSheet.absoluteFill, forms]}>
          {[0, 1, 2].map((k) => <Form key={k} S={S} k={k} />)}
        </Animated.View>
      ) : null}
      {on(S_SUBS) ? (
        <Animated.View style={[StyleSheet.absoluteFill, subs]}>
          <View style={styles.filmWolf}><Outlined parts={WOLF_PARTS} width={1} line={PAPER_LIT} /></View>
          {SUBS.map((w, k) => <Sub key={w} S={S} k={k} word={w} year={YEARS[k]} />)}
        </Animated.View>
      ) : null}
      {on(S_FILM) ? (
        <Animated.View style={[StyleSheet.absoluteFill, film]}>
          <View style={styles.filmSky} />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <Rain key={k} S={S} k={k} />)}
          <View style={styles.filmFigure} />
          <View style={styles.filmHead} />
        </Animated.View>
      ) : null}
    </View>
  );
}
const FORM_LABEL = ['LINES', 'SOUNDS', 'WORDS'];
function Form({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const v = clamp01(S.value.formStep - k);
    return { opacity: v, transform: [{ scale: 0.7 + 0.3 * v }] };
  });
  return (
    <Animated.View style={[styles.formCell, { left: 6 + k * 60 }, st]}>
      {k === 0 ? (
        <View style={styles.formArt}>
          {[0, 1, 2, 3].map((j) => <View key={j} style={[styles.wave, { left: 4 + j * 10, transform: [{ rotate: j % 2 ? '35deg' : '-35deg' }] }]} />)}
        </View>
      ) : k === 1 ? (
        <View style={styles.formArt}>
          {[0, 1].map((j) => (
            <View key={j} style={[styles.note, { left: 10 + j * 16, top: 6 + j * 4 }]}>
              <View style={styles.noteStem} />
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.formArt}><Text style={styles.formWords} numberOfLines={2}>THE WOLF CAME</Text></View>
      )}
      <View style={styles.formSpark} />
      <Text style={styles.formLabel} numberOfLines={1}>{FORM_LABEL[k]}</Text>
    </Animated.View>
  );
}
function Sub({ S, k, word, year }: { S: SharedValue<any>; k: number; word: string; year: string }) {
  const st = useAnimatedStyle(() => {
    const v = S.value.subStep;
    const o = clamp01(1 - Math.abs(v - k) * 2);
    return { opacity: o };
  });
  return (
    <Animated.View style={[styles.subRow, st]}>
      <Text style={styles.subText} numberOfLines={1}>{word}</Text>
      <View style={styles.year}><Text style={styles.yearText} numberOfLines={1}>{year}</Text></View>
    </Animated.View>
  );
}
function Rain({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateY: ((S.value.t * 60 + k * 23) % 80) - 10 }] }));
  return <Animated.View style={[styles.rain, { left: 12 + k * 24 }, st]} />;
}

// ── the tent: the flap that closes, and the shadow on the wall ──────────────

function Flap({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.flap, transform: [{ scaleX: S.value.flap }] }));
  return <Animated.View style={[styles.flap, st]} pointerEvents="none" />;
}
function Shadow({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({
    opacity: 0.6 * S.value.wolf,
    transform: [{ scale: 0.4 + 0.4 * S.value.wolf }, { rotate: `${-18 * S.value.howl}deg` }],
  }));
  if (!on(WOLF)) return null;
  return (
    <Animated.View style={[styles.shadow, st]} pointerEvents="none">
      <Outlined parts={WOLF_PARTS} width={0} line={INK} />
    </Animated.View>
  );
}

// ── the fire ────────────────────────────────────────────────────────────────

function Fire({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {[0, 1, 2].map((k) => <Flame key={k} S={S} k={k} />)}
      {[0, 1, 2, 3].map((k) => <Ember key={k} S={S} k={k} />)}
    </>
  );
}
function Flame({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ scaleY: 0.8 + 0.25 * Math.sin(S.value.t * (7 + k) + k * 2) }] }));
  return <Animated.View style={[styles.flame, { left: FIRE.cx - 11 + k * 7, height: 22 - Math.abs(k - 1) * 6, top: FIRE.top - 18 + Math.abs(k - 1) * 6, backgroundColor: k === 1 ? EMBER : SAGE }, st]} />;
}
function Ember({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => {
    const u = (S.value.t * 0.6 + k * 0.25) % 1;
    return { opacity: 1 - u, transform: [{ translateY: -44 * u }, { translateX: 6 * Math.sin(S.value.t * 3 + k) }] };
  });
  return <Animated.View style={[styles.ember, { left: FIRE.cx - 4 + k * 3 }, st]} />;
}

// ── tears, and the chain's labels ───────────────────────────────────────────

function Tears({ S, on, D }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean; D: SharedValue<Bundle>[] }) {
  if (!on(CRYING)) return null;
  return (
    <>
      {D.map((d, k) => <Tear key={k} S={S} d={d} k={k} />)}
    </>
  );
}
function Tear({ S, d, k }: { S: SharedValue<any>; d: SharedValue<Bundle>; k: number }) {
  const st = useAnimatedStyle(() => {
    const h = d.value.head;
    const u = (S.value.t * 0.8 + k * 0.33) % 1;
    return { opacity: S.value.tears * (1 - u), transform: [{ translateX: h[0].translateX - 6 }, { translateY: h[1].translateY + 4 + 16 * u }] };
  });
  return <Animated.View style={[styles.rider, st]} pointerEvents="none"><View style={styles.tear} /></Animated.View>;
}

function Chain({ S, on, DF }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean; DF: SharedValue<Bundle> }) {
  const artist = useAnimatedStyle(() => {
    const h = DF.value.head;
    return { opacity: S.value.chainA * (1 - S.value.leaving), transform: [{ translateX: h[0].translateX - 26 }, { translateY: h[1].translateY - 44 }] };
  });
  const work = useAnimatedStyle(() => ({ opacity: S.value.chainW }));
  const audience = useAnimatedStyle(() => ({ opacity: S.value.chainU }));
  if (!on(CHAIN)) return null;
  return (
    <>
      <Animated.View style={[styles.rider, artist]} pointerEvents="none">
        <View style={styles.label}><Text style={styles.labelText} numberOfLines={1}>ARTIST</Text></View>
      </Animated.View>
      <Animated.View style={[styles.labelAt, { left: TENT.peak.x - 20, top: TENT.peak.y - 18 }, work]} pointerEvents="none">
        <View style={styles.label}><Text style={styles.labelText} numberOfLines={1}>WORK</Text></View>
      </Animated.View>
      <Animated.View style={[styles.labelAt, { left: CHAIRS[1] - 32, top: 408 }, audience]} pointerEvents="none">
        <View style={styles.label}><Text style={styles.labelText} numberOfLines={1}>AUDIENCE</Text></View>
      </Animated.View>
    </>
  );
}

// ── Q1: three thoughts over the fire ────────────────────────────────────────

function Thoughts({ picked, onPick, S, live }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any>; live: boolean }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.thoughts }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {THOUGHT_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={12}
          disabled={answered} sealAt="tr"
          style={[styles.thought, { top: q.y }]}
        >
          <View style={[styles.thoughtFace, answered && q.correct && styles.faceRight]}>
            <Text style={[styles.thoughtText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l1}</Text>
            <Text style={[styles.thoughtText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l2}</Text>
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
  sky: {
    position: 'absolute', left: 0, top: 288, width: STAGE_W, height: GROUND - 288, backgroundColor: NIGHT.SHADE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  moon: { position: 'absolute', left: 350, top: 14, width: 16, height: 16, borderRadius: 8, backgroundColor: PAPER_LIT },
  star: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: PAPER_LIT },
  rider: { position: 'absolute', left: 0, top: 0 },

  screen: {
    position: 'absolute', left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, overflow: 'hidden',
    backgroundColor: PLATE_FACE, borderRadius: 2,
  },
  oval: {
    position: 'absolute', left: SCREEN.w / 2 - 28, top: 8, width: 56, height: 72, borderRadius: 28, borderWidth: 3,
    borderColor: OLIVE, backgroundColor: TEAL, overflow: 'hidden',
  },
  bust: { position: 'absolute', left: 25, top: 34 },
  date: { position: 'absolute', right: 8, bottom: 6, paddingHorizontal: 3, borderRadius: 2, backgroundColor: DEEP },
  dateText: { fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, color: PAPER_LIT, includeFontPadding: false },
  formCell: { position: 'absolute', top: 8, width: 54, height: 80, alignItems: 'center' },
  formArt: { width: 50, height: 40, borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: SAGE, justifyContent: 'center' },
  wave: { position: 'absolute', top: 18, width: 12, height: 2, borderRadius: 1, backgroundColor: INK },
  note: { position: 'absolute', width: 8, height: 6, borderRadius: 4, backgroundColor: INK },
  noteStem: { position: 'absolute', right: 0, bottom: 3, width: 1.5, height: 16, backgroundColor: INK },
  formWords: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, textAlign: 'center', color: INK, includeFontPadding: false,
  },
  formSpark: { marginTop: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: EMBER },
  formLabel: {
    marginTop: 3, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false,
  },
  filmWolf: { position: 'absolute', left: SCREEN.w / 2, top: 38 },
  subRow: {
    position: 'absolute', left: 0, right: 0, bottom: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  subText: {
    fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 14, letterSpacing: 1, color: INK, includeFontPadding: false,
    marginRight: 6,
  },
  year: { paddingHorizontal: 3, borderRadius: 2, backgroundColor: DEEP },
  yearText: { fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, color: PAPER_LIT, includeFontPadding: false },
  filmSky: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: NIGHT.STONE },
  rain: { position: 'absolute', top: 0, width: 1.5, height: 10, borderRadius: 1, backgroundColor: DEEP },
  filmFigure: { position: 'absolute', left: SCREEN.w / 2 - 4, top: 46, width: 8, height: 34, borderRadius: 4, backgroundColor: INK },
  filmHead: { position: 'absolute', left: SCREEN.w / 2 - 7, top: 32, width: 14, height: 14, borderRadius: 7, backgroundColor: INK },

  tentInside: {
    position: 'absolute', left: TENT.peak.x - 16, top: TENT.peak.y + 30, width: 32, height: GROUND - TENT.peak.y - 30,
    backgroundColor: INK, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  flap: {
    position: 'absolute', left: TENT.peak.x - 18, top: TENT.peak.y + 26, width: 36, height: GROUND - TENT.peak.y - 26,
    backgroundColor: CANVAS.SHADE, borderWidth: 1.5, borderColor: INK, borderTopLeftRadius: 18, borderTopRightRadius: 18,
    transformOrigin: '0% 50%',
  },
  shadow: { position: 'absolute', left: TENT.peak.x - 30, top: 470, transformOrigin: '50% 100%' },
  flame: { position: 'absolute', width: 8, borderRadius: 4, transformOrigin: '50% 100%' },
  ember: { position: 'absolute', top: FIRE.top - 16, width: 3, height: 3, borderRadius: 1.5, backgroundColor: EMBER },
  tear: { width: 4, height: 6, borderRadius: 3, backgroundColor: SAGE, borderWidth: 1, borderColor: INK },

  sparkHalo: { position: 'absolute', left: -10, top: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: EMBER, opacity: 0.3 },
  sparkCore: { position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: EMBER, borderWidth: 1.5, borderColor: PAPER_LIT },
  fearTag: {
    position: 'absolute', left: 8, top: -20, paddingHorizontal: 3, height: 12, borderRadius: 2, backgroundColor: PLATE_FACE,
    borderWidth: 1.2, borderColor: EMBER, justifyContent: 'center',
  },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false },
  labelAt: { position: 'absolute' },
  label: {
    paddingHorizontal: 4, height: 13, borderRadius: 3, backgroundColor: PLATE_FACE, borderWidth: 1.2, borderColor: INK,
    justifyContent: 'center', boxShadow: LIP,
  },
  labelText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false },

  thought: { position: 'absolute', left: 250, width: 110, height: 28 },
  thoughtFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 12, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  faceRight: { backgroundColor: INK },
  thoughtText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: INK, includeFontPadding: false },
  onInk: { color: PAPER_LIT },
});

export function Aesthetics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics2Scene} band={[288, 514]} camera={CAM} />;
}
