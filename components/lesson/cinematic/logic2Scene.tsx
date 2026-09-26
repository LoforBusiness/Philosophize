import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './logic2Script';
import {
  ease01, lerp, mixStance, narratorHold, narratorLive, stand, type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { reachHandTo } from './interact';
import { useLinger } from './useLinger';
import { lineOf, stage, bump } from './pace';
import { crane, spares, CRANE, STONE, P1, P2, KEY, BASE_TOP, KEY_TOP } from './logic2Set';
import { EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// logic-arguments-2, "The Parts of an Argument" — A STONEMASON'S YARD AND A CRANE.
//
// Redrawn 2026-09-26, one of six second lessons. The crane works across every voiced
// line (pace.ts, line lengths from the narration manifest): it fetches, lowers,
// stamps and pulls, and the mason guides it in.
//
//   b0–2  the crane fetches the stones from off the yard and lowers them: the first
//         premise, the second, then the conclusion across both; he tries the top one.
//   b3    the form is traced round the three in a dashed line.
//   b4    PREMISE plates on the base; the crane's stamp prints BECAUSE and SINCE.
//   b5    the CONCLUSION plate; support arrows grow from the base into the top.
//   b6    the stamp prints THEREFORE · SO · THUS over the conclusion.
//   b7    Q1: two stamps hang from the hook.
//   b8    the stamp prints Socrates' syllogism into the three stones.
//   b9    ∴ is struck on the top stone; both premises' lamps light and the current
//         runs up the arrows and lights the conclusion.
//   b10   Q2: the crane's control box.
//   b11   the premises slide out from under, and the conclusion falls.
//   b12   the crane builds it again.
//
// COMPOSITION, in stage units: the jib across the top at 310, the mast at x 366;
// the premises 56–164 and 168–276 at 466–500, the conclusion 108–224 at 430–464;
// the mason at x 300. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('logic');
const { RULE, STONE: STONE_T, SHADE } = TONE;
const LIP = lipOf(TONE);
const IRON = stageToneOf(OLIVE);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, logic-arguments-2. */
const LINES = [5.1, 7.5, 6.7, 5.0, 8.0, 9.0, 4.8, 0, 5.1, 7.5, 0, 6.1, 0, 0];

/** The mason's scale: a lone figure at K_FIG fills 46% of this band; this is 37%. */
const K_M = K_FIG * 0.82;
/** Where the trolley parks, and where it fetches from (off the yard). */
const PARK_T = 300;
const FETCH_T = 440;
/** Where the hook grips each stone, from its centre: clear of the plates and tags on it. */
const GRIP_P1 = 26;
const GRIP_KEY = 48;
/** How far the premises slide out when they are pulled from under the conclusion. */
const OUT_P1 = 54;
const OUT_P2 = 300;
/** The hook's height when it carries a load across, and when it waits. */
const CARRY_H = 372;
const REST_H = 360;

const X = BEATS.map((b) => b.x ?? 288);
const G = BEATS.map((b) => b.g ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_L1 = is('lower1');
const A_L2 = is('lower2');
const A_LK = is('lowerKey');
const A_TRACE = is('trace');
const A_SB = is('stampBase');
const A_SUP = is('support');
const A_ST = is('stampTop');
const A_CARVE = is('carve');
const A_TUG = is('tug');
const A_PULL = is('pull');
const A_RE = is('rebuild');
const STONES = BEATS.map((b) => b.stones ?? 0);
const FORM = BEATS.map((b) => (b.form && !b.fallen ? 1 : 0));
const PREM = BEATS.map((b) => (b.premises ? 1 : 0));
const CONC = BEATS.map((b) => (b.conclusion ? 1 : 0));
const MARKS = BEATS.map((b) => (b.marks ? 1 : 0));
const CARVED = BEATS.map((b) => (b.carved ? 1 : 0));
const SIGN = BEATS.map((b) => (b.sign ? 1 : 0));
const FALLEN = BEATS.map((b) => (b.fallen ? 1 : 0));
const STAMPS = BEATS.map((b) => (b.stamps ? 1 : 0));
const CONTROLS = BEATS.map((b) => (b.controls ? 1 : 0));

const TEXT = { p1: 'ALL MEN ARE MORTAL', p2: 'SOCRATES IS A MAN', key: 'SOCRATES IS MORTAL' };
const Q1 = [
  { id: 'because', label: 'BECAUSE', x: 108, correct: false },
  { id: 'therefore', label: 'THEREFORE', x: 176, correct: true },
];
const Q2 = [
  { id: 'reasons', l1: 'STILL ITS', l2: 'REASONS', y: 380, correct: false },
  { id: 'nothing', l1: 'NOTHING', l2: 'AT ALL', y: 416, correct: true },
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
function handOn(s: Stance, x: number, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_M, dir: -1 }, 1, tx, ty, w);
}

/**
 * One trip of the crane across a stage of the line: out to fetch, back with the
 * load to `tx`, down to `ty`, let go, and up again. Returns the trolley, the hook,
 * and how far the load is still hanging (1 carried, 0 set down).
 */
function trip(b: number, L: number, a: number, z: number, tx: number, ty: number, from: number) {
  'worklet';
  const span = z - a;
  const out = stage(b, L, a, a + span * 0.22);
  const back = stage(b, L, a + span * 0.22, a + span * 0.55);
  const down = stage(b, L, a + span * 0.55, a + span * 0.82);
  const up = stage(b, L, a + span * 0.86, z);
  const T = back > 0 ? lerp(FETCH_T, tx, back) : lerp(from, FETCH_T, out);
  const H = lerp(lerp(REST_H, CARRY_H, out), ty, down) + (REST_H - ty) * up;
  return { T, H, hang: up > 0 ? 0 : back > 0 || out >= 1 ? 1 : 0 };
}
/** The stamp block pressed at a point: across to it, down, up. */
function press(b: number, L: number, a: number, z: number, tx: number, ty: number, from: number) {
  'worklet';
  const span = z - a;
  const across = stage(b, L, a, a + span * 0.45);
  const down = bump(b, L, a + span * 0.45, a + span * 0.7, z);
  return { T: lerp(from, tx, across), H: lerp(REST_H, ty, down), hit: stage(b, L, a + span * 0.62, a + span * 0.7) };
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic'));

export default function Logic2Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(30);
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
    // he follows the second premise out as he pushes it
    const x = carry(cv, 29, n, X[p], A_PULL[n] ? OUT_P2 + STONE.baseW / 2 + 22 : X[n], A_PULL[n] ? st(0.14, 0.4) : tr);

    // ── the crane ──────────────────────────────────────────────────────────
    let T = PARK_T;
    let H = REST_H + 3 * Math.sin(t * 1.3);
    let hang = 0;
    let load = 0;                                   // 1 P1 · 2 P2 · 3 KEY · 4 the stamp block · 5 the Q1 bar
    let hits = [0, 0, 0];
    if (A_L1[n]) {
      const r = trip(b, L, 0, 0.95, P1.cx, BASE_TOP - 12, PARK_T);
      T = r.T; H = r.H; hang = r.hang; load = 1;
    } else if (A_L2[n]) {
      const r = trip(b, L, 0, 0.95, P2.cx, BASE_TOP - 12, P1.cx);
      T = r.T; H = r.H; hang = r.hang; load = 2;
    } else if (A_LK[n]) {
      const r = trip(b, L, 0, 0.8, KEY.cx + GRIP_KEY, KEY_TOP - 12, P2.cx);
      T = r.T; H = r.H; hang = r.hang; load = 3;
    } else if (A_SB[n] || A_ST[n] || A_CARVE[n]) {
      // the stamp block, pressed where each word or claim goes
      load = 4;
      const spots = A_SB[n]
        ? [[P1.cx + 26, BASE_TOP - 14], [P2.cx + 26, BASE_TOP - 14]]
        : A_ST[n]
          ? [[KEY.cx - 34, KEY_TOP - 14], [KEY.cx + 6, KEY_TOP - 14], [KEY.cx + 38, KEY_TOP - 14]]
          : [[P1.cx, BASE_TOP - 14], [P2.cx, BASE_TOP - 14], [KEY.cx, KEY_TOP - 14]];
      const a0 = A_SB[n] ? 0.25 : 0.06;
      const w = (0.96 - a0) / spots.length;
      let from = PARK_T;
      for (let k = 0; k < spots.length; k++) {
        const a = a0 + k * w;
        if (b / L >= a) {
          const r = press(b, L, a, a + w, spots[k][0], spots[k][1], from);
          T = r.T; H = r.H; hits[k] = r.hit;
        }
        from = spots[k][0];
      }
    } else if (STAMPS[n]) {
      load = 5; T = KEY.cx - 24; H = lerp(REST_H, 346, ease01(b / 1.2));
    } else if (A_PULL[n]) {
      // the hook drags the first premise out; he pushes the second
      load = 1;
      T = lerp(PARK_T, P1.cx + GRIP_P1, st(0, 0.1));
      H = lerp(REST_H, BASE_TOP - 12, st(0.06, 0.14));
      T = lerp(T, OUT_P1 + GRIP_P1, st(0.14, 0.4));
      hang = st(0.06, 0.14);
    } else if (A_RE[n]) {
      load = 3;
      T = lerp(PARK_T, KEY.cx + GRIP_KEY, st(0.3, 0.5));
      H = lerp(REST_H, GROUND - STONE.h - 12, st(0.45, 0.58));
      H = lerp(H, KEY_TOP - 12, st(0.62, 0.9));
      hang = st(0.5, 0.58) * (1 - st(0.9, 0.98));
    }
    T = carry(cv, 0, n, PARK_T, T, tr);
    H = carry(cv, 1, n, REST_H, H, tr);

    // ── the stones: where each is, and whether it hangs from the hook ───────
    const hangX = T;
    const hangTop = H + 12;
    let p1x = P1.cx;
    let p1y = BASE_TOP;
    let p2x = P2.cx;
    let p2y = BASE_TOP;
    let kx = KEY.cx;
    let ky = KEY_TOP;
    let kTilt = 0;
    if (load === 1 && hang > 0 && !A_PULL[n]) { p1x = hangX; p1y = hangTop; }
    if (load === 2 && hang > 0) { p2x = hangX; p2y = hangTop; }
    if (load === 3 && hang > 0 && A_LK[n]) { kx = hangX - GRIP_KEY; ky = hangTop; }
    const slide = A_PULL[n] ? st(0.14, 0.4) : FALLEN[n] ? 1 : 0;
    const fall = A_PULL[n] ? st(0.4, 0.52) : FALLEN[n] ? 1 : 0;
    const back = A_RE[n] ? st(0, 0.36) : 0;
    if (A_PULL[n] || FALLEN[n] || A_RE[n]) {
      const out = A_RE[n] ? 1 - back : slide;
      p1x = lerp(P1.cx, OUT_P1, out);
      p2x = lerp(P2.cx, OUT_P2, out);
      const fell = A_RE[n] ? 1 - st(0.5, 0.58) : fall;
      ky = lerp(KEY_TOP, GROUND - STONE.h, fell);
      kTilt = 4 * fell;
      if (A_RE[n] && hang > 0) { kx = hangX - GRIP_KEY; ky = hangTop; kTilt = 4 * (1 - st(0.5, 0.7)); }
      if (A_RE[n] && b / L > 0.9) { ky = KEY_TOP; kTilt = 0; }
    }

    // ── the mason ──────────────────────────────────────────────────────────
    let s: Stance = hLive(G[n], t, b);
    // signalling the crane down onto each stone
    const signal = (A_L1[n] || A_L2[n] || A_LK[n]) ? bump(b, L, 0.5, 0.62, 0.84) : 0;
    s = mixStance(s, emoteAny(183, t), signal);
    // trying the top stone once it is set
    const tryIt = A_LK[n] ? bump(b, L, 0.84, 0.92, 1) : 0;
    s = handOn(s, x, KEY.cx + STONE.keyW / 2 - 4, KEY_TOP + 10, tryIt);
    // tracing the form along with the line
    const trace = A_TRACE[n] ? st(0.08, 0.86) : FORM[n] ? 1 : 0;
    s = mixStance(s, emoteAny(183, t), A_TRACE[n] ? bump(b, L, 0.1, 0.3, 0.9) : 0);
    // pointing up at the conclusion while the support grows
    s = mixStance(s, emoteAny(183, t), A_SUP[n] ? bump(b, L, 0.3, 0.45, 0.8) : 0);
    // he pushes the second premise out from under
    const push = A_PULL[n] ? bump(b, L, 0.1, 0.16, 0.42) : 0;
    s = handOn(s, x, p2x + STONE.baseW / 2 - 2, BASE_TOP + 14, push);
    s = { ...s, tilt: s.tilt - 0.15 * push };

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(G[p], t)), s, tr));

    const hitsC = [
      carry(cv, 2, n, 0, hits[0], tr), carry(cv, 3, n, 0, hits[1], tr), carry(cv, 4, n, 0, hits[2], tr),
    ];
    return {
      fig: lookPose(fig, x, GROUND, K_M, -1, 1, gazeX.value, gazeY.value, gazeOn.value),
      T, H, load,
      block: carry(cv, 24, n, 0, load === 4 ? 1 : 0, tr),
      stampsOn: carry(cv, 25, n, STAMPS[p], STAMPS[n], tr),
      controlsOn: carry(cv, 26, n, CONTROLS[p], CONTROLS[n], tr),
      p1x: carry(cv, 5, n, P1.cx, p1x, tr), p1y: carry(cv, 6, n, BASE_TOP, p1y, tr),
      p2x: carry(cv, 7, n, P2.cx, p2x, tr), p2y: carry(cv, 8, n, BASE_TOP, p2y, tr),
      kx: carry(cv, 9, n, KEY.cx, kx, tr), ky: carry(cv, 10, n, KEY_TOP, ky, tr), kTilt: carry(cv, 11, n, 0, kTilt, tr),
      s1: STONES[n] >= 1 ? 1 : 0,
      s2: STONES[n] >= 2 ? (A_L2[n] ? st(0.2, 0.3) : 1) : 0,
      s3: STONES[n] >= 3 ? (A_LK[n] ? st(0.16, 0.26) : 1) : 0,
      s1in: A_L1[n] ? st(0.18, 0.28) : 1,
      form: carry(cv, 12, n, FORM[p], FALLEN[n] ? 0 : trace, tr),
      prem: carry(cv, 13, n, PREM[p], A_SB[n] ? st(0, 0.22) : PREM[n], tr),
      because: carry(cv, 14, n, PREM[p], A_SB[n] ? hitsC[0] : PREM[n], tr),
      since: carry(cv, 15, n, PREM[p], A_SB[n] ? hitsC[1] : PREM[n], tr),
      conc: carry(cv, 16, n, CONC[p], A_SUP[n] ? st(0, 0.24) : CONC[n], tr),
      arrows: carry(cv, 17, n, CONC[p] * (1 - FALLEN[p]), A_SUP[n] ? st(0.28, 0.66) : CONC[n] * (1 - FALLEN[n]), tr),
      marks: [
        carry(cv, 18, n, MARKS[p], A_ST[n] ? hitsC[0] : MARKS[n], tr),
        carry(cv, 19, n, MARKS[p], A_ST[n] ? hitsC[1] : MARKS[n], tr),
        carry(cv, 20, n, MARKS[p], A_ST[n] ? hitsC[2] : MARKS[n], tr),
      ],
      carved: A_CARVE[n] ? hitsC : [CARVED[n], CARVED[n], CARVED[n]],
      sign: carry(cv, 21, n, SIGN[p], A_TUG[n] ? st(0.06, 0.2) : SIGN[n], tr),
      lampP: carry(cv, 27, n, 0, A_TUG[n] ? st(0.25, 0.42) : SIGN[n] && !FALLEN[n] ? 1 : 0, tr),
      flow: carry(cv, 28, n, 0, A_TUG[n] ? st(0.45, 0.72) : SIGN[n] && !FALLEN[n] ? 1 : 0, tr),
      lampK: carry(cv, 22, n, SIGN[p] * (1 - FALLEN[p]), A_TUG[n] ? st(0.7, 0.8) : SIGN[n] * (1 - FALLEN[n]), tr),
      dust: carry(cv, 23, n, 0, A_PULL[n] ? bump(b, L, 0.48, 0.55, 0.8) : 0, tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.fence} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => <View key={k} style={[styles.plank, { left: 4 + k * 40 }]} />)}
      </View>
      <ObjectArt parts={CRANE_ART} tone={IRON} />
      <ObjectArt parts={SPARE_ART} tone={TONE} />
      <View style={styles.ground} pointerEvents="none" />
      <Form S={SCENE} on={on} />
      <Arrows S={SCENE} on={on} />
      <Stone S={SCENE} k={0} on={on} />
      <Stone S={SCENE} k={1} on={on} />
      <Stone S={SCENE} k={2} on={on} />
      <Dust S={SCENE} on={on} />
      <Stickman D={DF} k={K_M} />
      <Hook S={SCENE} />
      {on(STAMPS) ? <Stamps picked={picked} onPick={onPick} S={SCENE} live={STAMPS[i] === 1} /> : null}
      {on(CONTROLS) ? <Controls picked={picked} onPick={onPick} S={SCENE} live={CONTROLS[i] === 1} /> : null}
    </View>
  );
}

const CRANE_ART = crane();
const SPARE_ART = spares();

// ── the trolley, the cable, the hook and whatever it carries ────────────────

function Hook({ S }: { S: SharedValue<any> }) {
  const trolley = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.T }] }));
  const cable = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.T }], height: S.value.H - CRANE.jib }));
  const hook = useAnimatedStyle(() => ({ transform: [{ translateX: S.value.T }, { translateY: S.value.H }] }));
  const block = useAnimatedStyle(() => ({ opacity: S.value.block }));
  return (
    <>
      <Animated.View style={[styles.cable, cable]} pointerEvents="none" />
      <Animated.View style={[styles.trolley, trolley]} pointerEvents="none">
        <View style={[styles.wheel, { left: 2 }]} />
        <View style={[styles.wheel, { right: 2 }]} />
      </Animated.View>
      <Animated.View style={[styles.rider, hook]} pointerEvents="none">
        <View style={styles.hookBlock} />
        <View style={styles.hookJ} />
        <Animated.View style={[styles.stampBlock, block]}>
          <View style={styles.stampPad} />
        </Animated.View>
      </Animated.View>
    </>
  );
}

// ── the three stones ────────────────────────────────────────────────────────

function Stone({ S, k, on }: { S: SharedValue<any>; k: 0 | 1 | 2; on: (a: readonly number[]) => boolean }) {
  const w = k === 2 ? STONE.keyW : STONE.baseW;
  const st = useAnimatedStyle(() => {
    const v = S.value;
    const x = k === 0 ? v.p1x : k === 1 ? v.p2x : v.kx;
    const y = k === 0 ? v.p1y : k === 1 ? v.p2y : v.ky;
    const vis = k === 0 ? v.s1 * v.s1in : k === 1 ? v.s2 : v.s3;
    return {
      opacity: vis,
      transform: [{ translateX: x - w / 2 }, { translateY: y }, { rotate: `${k === 2 ? v.kTilt : 0}deg` }],
    };
  });
  const plate = useAnimatedStyle(() => ({ opacity: k === 2 ? S.value.conc : S.value.prem }));
  const word = useAnimatedStyle(() => {
    const v = k === 0 ? S.value.because : k === 1 ? S.value.since : 0;
    return { opacity: v, transform: [{ scale: 1.4 - 0.4 * v }, { rotate: '-6deg' }] };
  });
  const text = useAnimatedStyle(() => ({ opacity: S.value.carved[k], transform: [{ scale: 1.15 - 0.15 * S.value.carved[k] }] }));
  const lamp = useAnimatedStyle(() => ({ opacity: 0.25 + 0.75 * (k === 2 ? S.value.lampK : S.value.lampP) }));
  const sign = useAnimatedStyle(() => ({ opacity: k === 2 ? S.value.sign : 0 }));
  return (
    <Animated.View style={[styles.stone, { width: w }, st]} pointerEvents="none">
      <View style={styles.stoneFace} />
      {on(k === 2 ? CONC : PREM) ? (
        <Animated.View style={[styles.rolePlate, plate]}>
          <Text style={styles.roleText} numberOfLines={1}>{k === 2 ? 'CONCLUSION' : 'PREMISE'}</Text>
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.lamp, lamp]} />
      {k < 2 && on(PREM) ? (
        <Animated.View style={[styles.connective, k === 0 ? { left: 3 } : { right: 3 }, word]}>
          <Text style={styles.connText} numberOfLines={1}>{k === 0 ? 'BECAUSE' : 'SINCE'}</Text>
        </Animated.View>
      ) : null}
      {k === 2 && on(SIGN) ? <Animated.Text style={[styles.therefore, sign]}>∴</Animated.Text> : null}
      {on(CARVED) ? (
        <Animated.View style={[styles.claim, text]}>
          <Text style={styles.claimText} numberOfLines={1}>{k === 0 ? TEXT.p1 : k === 1 ? TEXT.p2 : TEXT.key}</Text>
        </Animated.View>
      ) : null}
      {k === 2 && on(MARKS) ? <KeyMarks S={S} /> : null}
    </Animated.View>
  );
}

const MARK_WORDS = ['THEREFORE', 'SO', 'THUS'];
function KeyMarks({ S }: { S: SharedValue<any> }) {
  return (
    <View style={styles.marks}>
      {MARK_WORDS.map((m, j) => <Mark key={m} S={S} j={j} word={m} />)}
    </View>
  );
}
function Mark({ S, j, word }: { S: SharedValue<any>; j: number; word: string }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.marks[j], transform: [{ scale: 1.4 - 0.4 * S.value.marks[j] }] }));
  return (
    <Animated.View style={[styles.markTag, st]}>
      <Text style={styles.connText} numberOfLines={1}>{word}</Text>
    </Animated.View>
  );
}

// ── the form, the support arrows, the dust ──────────────────────────────────

function Form({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  // the silhouette's outline, drawn a side at a time as the line runs
  const sides = [
    { l: P1.cx - STONE.baseW / 2 - 4, t: GROUND + 3, w: 228, h: 0, a: 0 },
    { l: P2.cx + STONE.baseW / 2 + 4, t: BASE_TOP - 4, w: 0, h: STONE.h + 7, a: 1 },
    { l: KEY.cx + STONE.keyW / 2 + 4, t: KEY_TOP - 4, w: 0, h: STONE.h + 4, a: 2 },
    { l: KEY.cx - STONE.keyW / 2 - 4, t: KEY_TOP - 4, w: STONE.keyW + 8, h: 0, a: 3 },
    { l: KEY.cx - STONE.keyW / 2 - 4, t: KEY_TOP - 4, w: 0, h: STONE.h + 4, a: 4 },
    { l: P1.cx - STONE.baseW / 2 - 4, t: BASE_TOP - 4, w: 0, h: STONE.h + 7, a: 5 },
  ];
  if (!on(FORM)) return null;
  return (
    <>
      {sides.map((d) => <Side key={d.a} S={S} d={d} />)}
    </>
  );
}
function Side({ S, d }: { S: SharedValue<any>; d: { l: number; t: number; w: number; h: number; a: number } }) {
  const st = useAnimatedStyle(() => {
    const u = Math.max(0, Math.min(1, S.value.form * 6 - d.a));
    return d.w > 0 ? { width: d.w * u } : { height: d.h * u };
  });
  return (
    <Animated.View
      style={[styles.formSide, { left: d.l, top: d.t }, d.w > 0 ? { height: 0, borderTopWidth: 1.5 } : { width: 0, borderLeftWidth: 1.5 }, st]}
      pointerEvents="none"
    />
  );
}

function Arrows({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const grow = useAnimatedStyle(() => ({ height: 26 * S.value.arrows, opacity: S.value.arrows }));
  const pulse = useAnimatedStyle(() => ({
    opacity: S.value.flow * (0.5 + 0.5 * Math.sin(S.value.t * 8)),
    transform: [{ translateY: -((S.value.t * 30) % 20) }],
  }));
  if (!on(CONC)) return null;
  return (
    <>
      {[KEY.cx - 34, KEY.cx + 34].map((ax) => (
        <Animated.View key={ax} style={[styles.arrow, { left: ax - 1.5 }, grow]} pointerEvents="none">
          <View style={styles.arrowHead} />
          <Animated.View style={[styles.spark, pulse]} />
        </Animated.View>
      ))}
    </>
  );
}

function Dust({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.dust, transform: [{ scale: 0.5 + S.value.dust }] }));
  if (!on(FALLEN)) return null;
  return (
    <Animated.View style={[styles.dust, st]} pointerEvents="none">
      {[0, 1, 2, 3, 4].map((k) => (
        <View key={k} style={[styles.dustPuff, { left: -34 + k * 17, top: -6 + (k % 2) * 5 }]} />
      ))}
    </Animated.View>
  );
}

// ── Q1: two stamps hanging from the hook ────────────────────────────────────

function Stamps({ picked, onPick, S, live }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any>; live: boolean }) {
  const answered = picked !== null || !live;
  const drop = useAnimatedStyle(() => ({ opacity: S.value.stampsOn, transform: [{ translateY: S.value.H - 346 }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, drop]} pointerEvents="box-none">
      <View style={styles.bar} pointerEvents="none" />
      {Q1.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={[styles.stampTarget, { left: q.x }]}
        >
          <View style={styles.stampFill}>
            <View style={styles.stampHandle} />
            <View style={[styles.stampFace, answered && q.correct && styles.faceRight]}>
              <Text style={[styles.stampText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

// ── Q2: the crane's control box ─────────────────────────────────────────────

function Controls({ picked, onPick, S, live }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any>; live: boolean }) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.controlsOn }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      <View style={styles.box} pointerEvents="none" />
      {Q2.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={5}
          disabled={answered} sealAt="tr"
          style={[styles.button, { top: q.y }]}
        >
          <View style={[styles.buttonFace, answered && q.correct && styles.faceRight]}>
            <Text style={[styles.buttonText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l1}</Text>
            <Text style={[styles.buttonText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l2}</Text>
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
  fence: {
    position: 'absolute', left: 0, top: 404, width: STAGE_W, height: GROUND - 404, backgroundColor: STONE_T,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  plank: { position: 'absolute', top: 0, bottom: 0, width: 1.5, borderRadius: 0.75, backgroundColor: SHADE },
  rider: { position: 'absolute', left: 0, top: 0 },

  cable: { position: 'absolute', left: -0.75, top: CRANE.jib, width: 1.5, backgroundColor: INK },
  trolley: {
    position: 'absolute', left: -9, top: CRANE.jib - 2, width: 18, height: 8, borderRadius: 2,
    backgroundColor: EMBER, borderWidth: 1.5, borderColor: INK,
  },
  wheel: { position: 'absolute', top: -4, width: 5, height: 5, borderRadius: 2.5, backgroundColor: INK },
  hookBlock: { position: 'absolute', left: -6, top: -2, width: 12, height: 8, borderRadius: 2, backgroundColor: EMBER, borderWidth: 1.5, borderColor: INK },
  hookJ: {
    position: 'absolute', left: -4, top: 5, width: 8, height: 8, borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    borderWidth: 2, borderColor: INK, borderTopWidth: 0,
  },
  stampBlock: {
    position: 'absolute', left: -15, top: 8, width: 30, height: 12, borderRadius: 2, backgroundColor: TEAL,
    borderWidth: 1.5, borderColor: INK,
  },
  stampPad: { position: 'absolute', left: 3, right: 3, bottom: -3, height: 3, backgroundColor: INK, borderRadius: 1 },

  stone: { position: 'absolute', left: 0, top: 0, height: STONE.h },
  stoneFace: {
    position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE,
    boxShadow: LIP,
  },
  rolePlate: {
    position: 'absolute', left: 4, top: 3, height: 11, paddingHorizontal: 3, borderRadius: 2, backgroundColor: SHADE,
    justifyContent: 'center',
  },
  roleText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  lamp: {
    position: 'absolute', right: 4, top: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: SAGE,
    borderWidth: 1, borderColor: INK,
  },
  connective: {
    position: 'absolute', top: -15, paddingHorizontal: 3, height: 12, borderWidth: 1.2, borderColor: EMBER,
    borderRadius: 2, justifyContent: 'center', backgroundColor: PLATE_FACE,
  },
  connText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  therefore: {
    position: 'absolute', right: 16, top: 0, fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 15, color: EMBER,
    includeFontPadding: false,
  },
  claim: { position: 'absolute', left: 0, right: 0, bottom: 4, alignItems: 'center' },
  claimText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  marks: { position: 'absolute', left: 0, right: 0, top: -15, flexDirection: 'row', justifyContent: 'center' },
  markTag: {
    marginHorizontal: 2, paddingHorizontal: 3, height: 12, borderWidth: 1.2, borderColor: EMBER, borderRadius: 2,
    justifyContent: 'center', backgroundColor: PLATE_FACE,
  },

  formSide: { position: 'absolute', borderColor: INK, borderStyle: 'dashed' },
  arrow: {
    position: 'absolute', top: KEY_TOP + STONE.h + 2, width: 3, backgroundColor: EMBER, borderRadius: 1.5,
    transformOrigin: '50% 100%', overflow: 'visible',
  },
  arrowHead: {
    position: 'absolute', left: -4, top: -6, width: 0, height: 0, borderLeftWidth: 5.5, borderRightWidth: 5.5,
    borderBottomWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: EMBER,
  },
  spark: { position: 'absolute', left: -1.5, bottom: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: PAPER_LIT },
  dust: { position: 'absolute', left: KEY.cx, top: GROUND - 8 },
  dustPuff: { position: 'absolute', width: 16, height: 12, borderRadius: 8, backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: SHADE },

  bar: { position: 'absolute', left: Q1[0].x - 4, top: 356, width: 140, height: 4, borderRadius: 2, backgroundColor: INK },
  stampTarget: { position: 'absolute', top: 360, width: 64, height: 36 },
  stampFill: { flexGrow: 1, alignItems: 'center' },
  stampHandle: { width: 14, height: 10, borderRadius: 5, backgroundColor: TEAL, borderWidth: 1.5, borderColor: INK },
  stampFace: {
    width: 64, height: 22, borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  faceRight: { backgroundColor: INK },
  onInk: { color: PAPER_LIT },

  box: {
    position: 'absolute', left: 318, top: 372, width: 76, height: 80, borderRadius: 5, backgroundColor: IRON.SHADE,
    borderWidth: 1.5, borderColor: INK,
  },
  button: { position: 'absolute', left: 324, width: 64, height: 30 },
  buttonFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 5, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
});

export function Logic2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Logic2Scene} band={[288, 514]} camera={CAM} />;
}
