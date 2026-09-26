import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './ethics2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, pose, seated, stand, travelStance,
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
import {
  shop, steps, aBoard, cafe, STEPS, CLIMB_X, DOOR, BOARD, AWNING, TABLE, CHAIR,
} from './ethics2Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// ethics-ethics-2, "One Choice, Three Lenses" — A PAVEMENT OUTSIDE A CAFÉ.
//
// Redrawn 2026-09-26, one of six second lessons. Every act is laid across its voiced
// line in stages (pace.ts, line lengths from the narration manifest).
//
//   b0   he walks along, sees a wallet on the pavement, and picks it up.
//   b1   three glasses cases open on the café table, one after another.
//   b2   OUTCOMES is chalked on the A-board; he puts on the first pair.
//   b3   DUTY and CHARACTER are chalked under it.
//   b4   he swaps the three pairs back and forth; a bracket joins the rows: MIXED.
//   b5   he takes the wallet to the woman at the table; happiness meters rise over
//        them both as she takes it.
//   b6   the meters are marked equal.
//   b8   the second pair; a rule goes up: KEEP ANY WALLET YOU FIND.
//   b9   his own wallet slips from his pocket, she picks it up and keeps it — the rule
//        willed for everyone — and the rule is struck out.
//   b10  the third pair; he walks to the shop's front steps and looks up at HONESTY.
//   b11  he climbs them, a step at a time, each one lit as he stands on it.
//   b12  Q1: three thoughts through the outcomes glasses.
//   b13  Q2: three street signs.
//
// COMPOSITION, in stage units: the shop 0–132 with its steps rising right to a door
// at 72–122; the A-board 146–230 × 414–470; the café 258–400 under its awning, the
// table at x 318, her chair at 358; he works at x 250 and 296. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('ethics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
const BRICK = stageToneOf(SAGE);
const CANVAS = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, ethics-ethics-2. */
const LINES = [3.76, 3.68, 6.88, 5.2, 6.04, 7.24, 5.92, 0, 6.88, 8.36, 6.16, 7.72, 0, 0, 0];

/** Both of them at this scale: a lone figure at K_FIG fills 46% of this band; this is 37%. */
const K_E = K_FIG * 0.82;
/** Where the wallet lies on the pavement. */
const WALLET = { x: 214, y: GROUND - 5 };
/** Her seat height, in the rig's units. */
const SEAT_H = 30;

const X = BEATS.map((b) => b.x ?? 150);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_FIND = is('find');
const A_CASES = is('cases');
const A_LENS1 = is('lens1');
const A_ROWS = is('rows');
const A_SWAP = is('swap');
const A_MILL = is('mill');
const A_EQUAL = is('equal');
const A_KANT = is('kant');
const A_KEEP = is('keep');
const A_STEPS = is('steps');
const A_CLIMB = is('climb');
const LENS = BEATS.map((b) => b.lens ?? 0);
const ROWS = BEATS.map((b) => b.rows ?? 0);
const MIXED = BEATS.map((b) => (b.mixed ? 1 : 0));
const METERS = BEATS.map((b) => (b.meters ? 1 : 0));
const EQUAL = BEATS.map((b) => (b.equal ? 1 : 0));
const RULE_ON = BEATS.map((b) => (b.rule ? 1 : 0));
const STRUCK = BEATS.map((b) => (b.struck ? 1 : 0));
const CLIMBED = BEATS.map((b) => b.climbed ?? 0);
const THOUGHTS = BEATS.map((b) => (b.thoughts ? 1 : 0));
const SIGNS = BEATS.map((b) => (b.signs ? 1 : 0));
/** He faces the café everywhere but on the walk out to the steps. */
const DIR = BEATS.map((b) => (b.act === 'steps' ? -1 : 1));
/** Which way each beat leaves him: at the steps he turns back to look up at HONESTY. */
const END_DIR = BEATS.map(() => 1);
/** Where each beat leaves him, and at what height: on the top step after the climb. */
const END_X = BEATS.map((b) => (b.act === 'climb' ? CLIMB_X[3] : b.x ?? 150));
const END_GY = BEATS.map((b) => (b.act === 'climb' ? STEPS[2].top : GROUND));
/** The found wallet: on the pavement, in his hand, then hers. 0 ground · 1 his · 2 hers. */
const HOLDS = BEATS.map((_, k) => (k === 0 ? 0 : k < 5 ? 1 : 2));

const ROW_TEXT = ['1 OUTCOMES', '2 DUTY', '3 CHARACTER'];
const LENS_TONES = [INK, EMBER, DEEP, SAGE];

const THOUGHT_Q = [
  { id: 'happy', l1: 'WHICH ACT MAKES', l2: 'MOST HAPPINESS?', x: 150, correct: true },
  { id: 'rule', l1: 'COULD EVERYONE', l2: 'FOLLOW THE RULE?', x: 250, correct: false },
  { id: 'self', l1: 'WHAT WILL IT', l2: 'MAKE OF ME?', x: 350, correct: false },
];
const SIGN_Q = [
  { id: 'common', l1: 'IT’S COMMON,', l2: 'SO IT’S RIGHT', x: 150, correct: false },
  { id: 'legal', l1: 'IT’S LEGAL,', l2: 'SO IT’S RIGHT', x: 250, correct: false },
  { id: 'neither', l1: 'NEITHER', l2: 'SHOWS IT', x: 350, correct: true },
];
const PLATE_W = 94;

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
function handOn(s: Stance, x: number, gy: number, dir: 1 | -1, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: gy, k: K_E, dir }, 1, tx, ty, w);
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics'));

export default function Ethics2Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const held = useHeld();
  const heldHer = useHeld();
  const cv = useCarry(24);
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

    // ── where he is ────────────────────────────────────────────────────────
    const xn = X[n];
    const xp = END_X[p];
    const gp = END_GY[p];
    const walking = Math.abs(xn - xp) > 1 && !A_FIND[n] && !A_CLIMB[n];
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    let tx = xn;
    let gy = GROUND;
    let walkNow = walking;
    if (A_FIND[n]) {
      // strolling in along the pavement until he sees it
      tx = lerp(120, xn, st(0, 0.4));
      walkNow = b / L < 0.4;
    }
    // b11: across to the foot of the steps, a turn, then up them one at a time,
    // each step a stride of its own. Timed from the walk, so he is facing up the
    // steps — and the café — as soon as he gets there.
    const footDur = moveTr(xp, CLIMB_X[0], TR);
    const footU = A_CLIMB[n] ? ease01(clamp01(b / footDur)) : 1;
    const c0 = (footDur + 0.35) / L;
    const ks = A_CLIMB[n] ? [st(c0, c0 + 0.12), st(c0 + 0.16, c0 + 0.28), st(c0 + 0.32, c0 + 0.44)] : [0, 0, 0];
    let climbSeg = -1;
    if (A_CLIMB[n]) {
      tx = footU < 1 ? lerp(xp, CLIMB_X[0], footU)
        : lerp(lerp(lerp(CLIMB_X[0], CLIMB_X[1], ks[0]), CLIMB_X[2], ks[1]), CLIMB_X[3], ks[2]);
      gy = GROUND - 12 * ks[0] - 12 * ks[1] - 12 * ks[2];
      for (let k = 0; k < 3; k++) if (ks[k] > 0 && ks[k] < 1) climbSeg = k;
    }
    // off the top step and down to the pavement, with a hop off its edge
    if (walking && gp < GROUND) {
      const xNow = lerp(xp, xn, walkU);
      const off = clamp01((xNow - 128) / 16);
      gy = lerp(gp, GROUND, off) - 8 * Math.sin(Math.PI * off);
    }
    const x = carry(cv, 0, n, xp, tx, walking ? walkU : A_CLIMB[n] ? 1 : tr);
    const figGY = carry(cv, 1, n, gp, gy, A_CLIMB[n] ? 1 : tr);
    // walking away from the café he faces the way he goes, and turns back the moment he stops
    const back = A_STEPS[n] ? clamp01((b - walkDur) / 0.3) : A_CLIMB[n] ? clamp01((b - footDur) / 0.3) : 0;
    const dirV = A_STEPS[n] || A_CLIMB[n] ? lerp(facing(END_DIR[p], -1, b), 1, back) : facing(END_DIR[p], DIR[n], b);
    const dir = (dirV < 0 ? -1 : 1) as 1 | -1;

    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    if (A_FIND[n] && walkNow) s = travelStance(120, xn, stand(t), stand(t), stand(t), st(0, 0.4), WALK, 0);
    if (A_CLIMB[n] && footU < 1) s = travelStance(xp, CLIMB_X[0], hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), footU, WALK, 0);
    if (climbSeg >= 0) {
      s = travelStance(CLIMB_X[climbSeg], CLIMB_X[climbSeg + 1], hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), ks[climbSeg], WALK, 0);
    }

    // bending to the wallet and picking it up
    const bend = A_FIND[n] ? bump(b, L, 0.45, 0.65, 0.9) : 0;
    s = { ...s, tilt: s.tilt - 0.55 * bend };
    s = handOn(s, x, figGY, dir, WALLET.x, WALLET.y - 4, bend);
    // looking at the open cases
    if (A_CASES[n]) s = { ...s, neck: s.neck - 0.25 * st(0.1, 0.4) };
    // putting on glasses: a hand to the face
    const don = (A_LENS1[n] ? bump(b, L, 0.5, 0.62, 0.8) : 0) + (A_KANT[n] ? bump(b, L, 0.05, 0.15, 0.3) : 0);
    const swapHand = A_SWAP[n] ? st(0.1, 0.2) * (1 - st(0.82, 0.92)) : 0;
    s = mixStance(s, { ...s, fistR: { x: 8, y: -74 } }, clamp01(don + swapHand * (0.6 + 0.4 * Math.sin(t * 8))));
    // handing the wallet across
    const hand = A_MILL[n] ? bump(b, L, 0.35, 0.55, 0.8) : 0;
    s = handOn(s, x, figGY, dir, x + 34, figGY - 42, hand);
    // patting his pockets when his own wallet is gone, then the start
    const pat = A_KEEP[n] ? bump(b, L, 0.6, 0.66, 0.76) : 0;
    s = mixStance(s, { ...s, fistR: { x: 4, y: -30 }, fistL: { x: -6, y: -30 } }, pat);
    s = mixStance(s, emoteAnyLive(318, t, Math.max(0, b - 0.74 * L)), A_KEEP[n] ? st(0.74, 0.8) * (1 - st(0.95, 1)) : 0);
    // looking up at HONESTY
    if (A_STEPS[n]) s = { ...s, neck: s.neck + 0.3 * clamp01((b - walkDur - 0.3) / 0.6) };

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── her, at the café table ────────────────────────────────────────────
    const r0 = seated(SEAT_H, t);
    const nod = Math.max(0, Math.sin(t * 1.9 + 0.8)) ** 2;
    const shift = Math.sin(t * 0.7 + 1.3);
    let h: Stance = {
      ...r0,
      tilt: r0.tilt + 0.05 * shift,
      neck: r0.neck - 0.24 * nod,
      fistL: { x: r0.fistL.x - 2.5 * shift, y: r0.fistL.y + 2 * shift },
      fistR: { x: r0.fistR.x + 2 * shift, y: r0.fistR.y - 2 * shift },
    };
    const take = A_MILL[n] ? bump(b, L, 0.45, 0.6, 0.85) : 0;
    const stoop = A_KEEP[n] ? bump(b, L, 0.3, 0.45, 0.62) : 0;
    h = handOn(h, CHAIR.x, GROUND, -1, CHAIR.x - 28, GROUND - 40, take);
    h = { ...h, tilt: h.tilt - 0.45 * stoop };
    h = handOn(h, CHAIR.x, GROUND, -1, CHAIR.x - 38, GROUND - 6, stoop);
    const her = keepHeld(heldHer, mixStance(carryFrom(heldHer, n, seated(SEAT_H, t)), h, tr));

    // ── the wallets ────────────────────────────────────────────────────────
    const pickUp = A_FIND[n] ? st(0.62, 0.72) : 1;
    const toHer = A_MILL[n] ? st(0.5, 0.6) : HOLDS[n] === 2 ? 1 : 0;
    const drop = A_KEEP[n] ? st(0.16, 0.3) : 0;
    const kept = A_KEEP[n] ? st(0.42, 0.5) : 0;

    return {
      fig: lookPose(fig, x, figGY, K_E, dirV, 1, gazeX.value, gazeY.value, gazeOn.value),
      her: pose(her, CHAIR.x, GROUND - SEAT_H * 0, K_E, -1, 1),
      x, figGY,
      pickUp: carry(cv, 2, n, HOLDS[p] > 0 ? 1 : 0, pickUp, tr),
      toHer: carry(cv, 3, n, HOLDS[p] === 2 ? 1 : 0, toHer, tr),
      drop: carry(cv, 4, n, 0, drop * (1 - kept), tr),
      kept: carry(cv, 5, n, 0, A_KEEP[n] ? kept * (1 - st(0.55, 0.62)) : 0, tr),
      ownOn: carry(cv, 6, n, 0, A_KEEP[n] ? st(0.14, 0.16) * (1 - st(0.58, 0.62)) : 0, tr),
      query: carry(cv, 7, n, 0, A_FIND[n] ? bump(b, L, 0.3, 0.45, 0.8) : 0, tr),
      cases: carry(cv, 8, n, A_CASES[p] || n > 1 ? 1 : 0, A_CASES[n] ? st(0.1, 0.8) : n > 1 ? 1 : 0, tr),
      lens: carry(cv, 9, n, LENS[p],
        A_SWAP[n] ? 1 + 2 * (0.5 - 0.5 * Math.cos(Math.PI * 2 * st(0.15, 0.85))) : LENS[n], tr),
      specs: carry(cv, 10, n, LENS[p] > 0 ? 1 : 0, A_LENS1[n] ? st(0.58, 0.66) : LENS[n] > 0 ? 1 : 0, tr),
      rows: carry(cv, 11, n, ROWS[p], A_LENS1[n] ? st(0.05, 0.4) : A_ROWS[n] ? 1 + st(0.05, 0.4) + st(0.5, 0.85) : ROWS[n], tr),
      mixed: carry(cv, 12, n, MIXED[p], A_SWAP[n] ? st(0.4, 0.7) : MIXED[n], tr),
      meters: carry(cv, 13, n, METERS[p], A_MILL[n] ? st(0.05, 0.25) : METERS[n], tr),
      joy: carry(cv, 14, n, METERS[p], A_MILL[n] ? st(0.55, 0.9) : METERS[n], tr),
      equal: carry(cv, 15, n, EQUAL[p], A_EQUAL[n] ? st(0.2, 0.5) : EQUAL[n], tr),
      rule: carry(cv, 16, n, RULE_ON[p], A_KANT[n] ? st(0.35, 0.6) : RULE_ON[n], tr),
      struck: carry(cv, 17, n, STRUCK[p], A_KEEP[n] ? st(0.84, 0.96) : STRUCK[n], tr),
      steps: [
        carry(cv, 18, n, CLIMBED[p] >= 1 ? 1 : 0, A_CLIMB[n] ? clamp01((ks[0] - 0.7) / 0.3) : CLIMBED[n] >= 1 ? 1 : 0, tr),
        carry(cv, 19, n, CLIMBED[p] >= 2 ? 1 : 0, A_CLIMB[n] ? clamp01((ks[1] - 0.7) / 0.3) : CLIMBED[n] >= 2 ? 1 : 0, tr),
        carry(cv, 20, n, CLIMBED[p] >= 3 ? 1 : 0, A_CLIMB[n] ? clamp01((ks[2] - 0.7) / 0.3) : CLIMBED[n] >= 3 ? 1 : 0, tr),
      ],
      honesty: carry(cv, 21, n, CLIMBED[p] >= 3 ? 1 : 0, A_STEPS[n] ? clamp01((b - walkDur) / 0.6) * 0.4 : A_CLIMB[n] ? 0.4 + 0.6 * clamp01((ks[2] - 0.8) / 0.2) : CLIMBED[n] >= 3 ? 1 : 0, tr),
      thoughts: carry(cv, 22, n, THOUGHTS[p], THOUGHTS[n], tr),
      signs: carry(cv, 23, n, SIGNS[p], SIGNS[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const DH = useDerivedValue<Bundle>(() => SCENE.value.her);
  // his glasses, on his head
  const specs = useAnimatedStyle(() => {
    const h = DF.value.head;
    return { opacity: SCENE.value.specs, transform: [{ translateX: h[0].translateX }, { translateY: h[1].translateY }] };
  });
  const lensTint = useAnimatedStyle(() => {
    const l = SCENE.value.lens;
    return { borderColor: l < 1.5 ? EMBER : l < 2.5 ? DEEP : SAGE };
  });
  // the found wallet, on the pavement, in his hand, then hers
  const found = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const hw = DH.value.wrR;
    const u = SCENE.value.pickUp;
    const v = SCENE.value.toHer;
    const hx = lerp(lerp(WALLET.x, w[0].translateX, u), hw[0].translateX, v);
    const hy = lerp(lerp(WALLET.y, w[1].translateY, u), hw[1].translateY, v);
    return { transform: [{ translateX: hx }, { translateY: hy }] };
  });
  // his own wallet: out of his pocket, onto the pavement, into her hand
  const own = useAnimatedStyle(() => {
    const hw = DH.value.wrR;
    const fx = SCENE.value.x + 10;
    const fy = SCENE.value.figGY - 40;
    const d = SCENE.value.drop;
    const k = SCENE.value.kept;
    const gx = lerp(fx, fx + 22, d);
    const gy = lerp(fy, GROUND - 5, d);
    return {
      opacity: SCENE.value.ownOn,
      transform: [{ translateX: lerp(gx, hw[0].translateX, k) }, { translateY: lerp(gy, hw[1].translateY, k) }],
    };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.street} pointerEvents="none" />
      <ObjectArt parts={SHOP_ART} tone={BRICK} />
      <Honesty S={SCENE} />
      <ObjectArt parts={STEPS_ART} tone={BRICK} />
      <StepGlow S={SCENE} />
      <ObjectArt parts={CAFE_ART} tone={CANVAS} />
      <Cases S={SCENE} />
      <ObjectArt parts={BOARD_ART} tone={WOOD} />
      <Board S={SCENE} on={on} />
      <Rule S={SCENE} on={on} />
      <Query S={SCENE} on={on} />
      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DH} k={K_E} role="second" />
      <Stickman D={DF} k={K_E} />
      <Animated.View style={[styles.rider, specs]} pointerEvents="none">
        <Animated.View style={[styles.frames, lensTint]}>
          <View style={styles.bridge} />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.rider, found]} pointerEvents="none">
        <View style={styles.wallet}><View style={styles.walletFlap} /></View>
      </Animated.View>
      <Animated.View style={[styles.rider, own]} pointerEvents="none">
        <View style={[styles.wallet, styles.ownWallet]}><View style={styles.walletFlap} /></View>
      </Animated.View>
      <Meters S={SCENE} on={on} DF={DF} DH={DH} />
      {on(THOUGHTS) ? <Plates items={THOUGHT_Q} kind="thought" picked={picked} onPick={onPick} S={SCENE} live={THOUGHTS[i] === 1} /> : null}
      {on(SIGNS) ? <Plates items={SIGN_Q} kind="sign" picked={picked} onPick={onPick} S={SCENE} live={SIGNS[i] === 1} /> : null}
    </View>
  );
}

const SHOP_ART = shop();
const STEPS_ART = steps();
const CAFE_ART = cafe();
const BOARD_ART = aBoard();

// ── the shop: HONESTY over the door, and the steps lit as he stands on them ─

function Honesty({ S }: { S: SharedValue<any> }) {
  const glow = useAnimatedStyle(() => ({ opacity: 0.25 + 0.75 * S.value.honesty }));
  return (
    <View style={styles.plaque} pointerEvents="none">
      <Animated.View style={[styles.plaqueGlow, glow]} />
      <Text style={styles.plaqueText} numberOfLines={1}>HONESTY</Text>
    </View>
  );
}
function StepGlow({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {STEPS.map((s, k) => <StepLight key={k} S={S} k={k} x0={s.x0} x1={s.x1} top={s.top} />)}
    </>
  );
}
function StepLight({ S, k, x0, x1, top }: { S: SharedValue<any>; k: number; x0: number; x1: number; top: number }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.steps[k], transform: [{ scaleX: S.value.steps[k] }] }));
  return <Animated.View style={[styles.stepLight, { left: x0 + 2, width: x1 - x0 - 4, top: top - 1 }, st]} pointerEvents="none" />;
}

// ── the café table's three glasses cases ────────────────────────────────────

function Cases({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {[0, 1, 2].map((k) => <Case key={k} S={S} k={k} />)}
    </>
  );
}
function Case({ S, k }: { S: SharedValue<any>; k: number }) {
  const lid = useAnimatedStyle(() => ({ transform: [{ rotate: `${-70 * clamp01(S.value.cases * 3 - k)}deg` }] }));
  return (
    <View style={[styles.case, { left: TABLE.cx - 20 + k * 14 }]} pointerEvents="none">
      <Animated.View style={[styles.caseLid, { backgroundColor: LENS_TONES[k + 1] }, lid]} />
    </View>
  );
}

// ── the A-board ─────────────────────────────────────────────────────────────

function Board({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const bracket = useAnimatedStyle(() => ({ opacity: S.value.mixed, height: 44 * S.value.mixed }));
  const mixTag = useAnimatedStyle(() => ({ opacity: S.value.mixed }));
  return (
    <>
    <View style={styles.board} pointerEvents="none">
      {ROW_TEXT.map((r, k) => <Row key={r} S={S} k={k} text={r} />)}
      <Animated.View style={[styles.bracket, bracket]} />
    </View>
    {on(MIXED) ? (
      <Animated.View style={[styles.mixTag, mixTag]} pointerEvents="none">
        <Text style={styles.mixText} numberOfLines={1}>MIXED</Text>
      </Animated.View>
    ) : null}
    </>
  );
}
function Row({ S, k, text }: { S: SharedValue<any>; k: number; text: string }) {
  const st = useAnimatedStyle(() => ({ width: 68 * clamp01(S.value.rows - k) }));
  return (
    <Animated.View style={[styles.rowClip, { top: 5 + k * 15 }, st]}>
      <Text style={styles.chalk} numberOfLines={1}>{text}</Text>
    </Animated.View>
  );
}

// ── the rule, and the question over the wallet ──────────────────────────────

function Rule({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.rule, transform: [{ translateY: (1 - S.value.rule) * -8 }] }));
  const strike = useAnimatedStyle(() => ({ transform: [{ scaleX: S.value.struck }, { rotate: '-8deg' }] }));
  if (!on(RULE_ON)) return null;
  return (
    <Animated.View style={[styles.rule, st]} pointerEvents="none">
      <Text style={styles.ruleHead} numberOfLines={1}>THE RULE</Text>
      <Text style={styles.ruleText} numberOfLines={1}>KEEP ANY WALLET YOU FIND</Text>
      <Animated.View nativeID="strike-rule" style={[styles.ruleStrike, strike]} />
    </Animated.View>
  );
}
function Query({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.query, transform: [{ scale: 0.6 + 0.4 * S.value.query }] }));
  if (!on(A_FIND)) return null;
  return (
    <Animated.View style={[styles.query, st]} pointerEvents="none">
      <Text style={styles.queryText}>?</Text>
    </Animated.View>
  );
}

// ── the happiness meters over the two of them ───────────────────────────────

function Meters({ S, on, DF, DH }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean; DF: SharedValue<Bundle>; DH: SharedValue<Bundle> }) {
  const his = useAnimatedStyle(() => {
    const h = DF.value.head;
    return { opacity: S.value.meters, transform: [{ translateX: h[0].translateX + 20 }, { translateY: h[1].translateY - 40 }] };
  });
  const hers = useAnimatedStyle(() => {
    // on the side of her head that faces him, so its weight stays on the stage
    const h = DH.value.head;
    return { opacity: S.value.meters, transform: [{ translateX: h[0].translateX - 34 }, { translateY: h[1].translateY - 40 }] };
  });
  const fillHis = useAnimatedStyle(() => ({ height: 26 * lerp(0.35, 0.6, S.value.joy) }));
  const fillHers = useAnimatedStyle(() => ({ height: 26 * lerp(0.2, 0.95, S.value.joy) }));
  const eq = useAnimatedStyle(() => ({ opacity: S.value.equal }));
  if (!on(METERS)) return null;
  return (
    <>
      <Animated.View style={[styles.rider, his]} pointerEvents="none">
        <View style={styles.meter}><Animated.View style={[styles.meterFill, fillHis]} /></View>
        {on(EQUAL) ? <Animated.View style={[styles.weight, eq]}><Text style={styles.weightText}>×1</Text></Animated.View> : null}
      </Animated.View>
      <Animated.View style={[styles.rider, hers]} pointerEvents="none">
        <View style={styles.meter}><Animated.View style={[styles.meterFill, fillHers]} /></View>
        {on(EQUAL) ? <Animated.View style={[styles.weight, eq]}><Text style={styles.weightText}>×1</Text></Animated.View> : null}
      </Animated.View>
    </>
  );
}

// ── the two questions: thoughts through the glasses, then street signs ──────

function Plates({ items, kind, picked, onPick, S, live }: {
  items: { id: string; l1: string; l2: string; x: number; correct: boolean }[];
  kind: 'thought' | 'sign'; picked: string | null; onPick: (id: string, ok: boolean) => void;
  S: SharedValue<any>; live: boolean;
}) {
  const answered = picked !== null || !live;
  const fade = useAnimatedStyle(() => ({ opacity: kind === 'thought' ? S.value.thoughts : S.value.signs }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {items.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={kind === 'thought' ? 12 : 4}
          disabled={answered} sealAt="tr"
          style={[styles.plate, { left: q.x - PLATE_W / 2 }]}
        >
          <View style={[kind === 'thought' ? styles.thoughtFace : styles.signFace, answered && q.correct && styles.faceRight]}>
            <Text style={[kind === 'thought' ? styles.plateText : styles.signText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l1}</Text>
            <Text style={[kind === 'thought' ? styles.plateText : styles.signText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l2}</Text>
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
  street: {
    position: 'absolute', left: 0, top: 292, width: STAGE_W, height: GROUND - 292, backgroundColor: CANVAS.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },
  rider: { position: 'absolute', left: 0, top: 0 },
  frames: {
    position: 'absolute', left: -2, top: -4, width: 17, height: 6, borderRadius: 3, borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  bridge: { position: 'absolute', left: 5, top: -2, width: 3, height: 2, backgroundColor: INK },
  wallet: {
    position: 'absolute', left: -7, top: -4, width: 14, height: 9, borderRadius: 2, backgroundColor: OLIVE,
    borderWidth: 1.2, borderColor: INK,
  },
  ownWallet: { backgroundColor: DEEP },
  walletFlap: { position: 'absolute', left: 6, top: 1, width: 5, height: 3, borderRadius: 1, backgroundColor: EMBER },

  plaque: {
    position: 'absolute', left: DOOR.x - 2, top: 356, width: DOOR.w + 4, height: 16, borderRadius: 3,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  plaqueGlow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: SAGE },
  plaqueText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  stepLight: { position: 'absolute', height: 3, borderRadius: 1.5, backgroundColor: EMBER, transformOrigin: '0% 50%' },

  case: {
    position: 'absolute', top: TABLE.top - 7, width: 12, height: 7, borderRadius: 2, backgroundColor: PLATE_FACE,
    borderWidth: 1.2, borderColor: INK,
  },
  caseLid: { position: 'absolute', left: -1, top: -4, width: 12, height: 4, borderRadius: 2, transformOrigin: '0% 100%' },

  board: {
    position: 'absolute', left: BOARD.x, top: BOARD.y, width: BOARD.w, height: BOARD.h, borderRadius: 4,
    backgroundColor: DEEP, borderWidth: 2, borderColor: INK, overflow: 'hidden',
  },
  rowClip: { position: 'absolute', left: 6, height: 13, overflow: 'hidden' },
  chalk: {
    width: 68, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 12, letterSpacing: 0, color: PAPER_LIT, includeFontPadding: false,
  },
  bracket: {
    position: 'absolute', right: 3, top: 6, width: 4, borderWidth: 1.5, borderLeftWidth: 0, borderColor: EMBER,
    borderTopRightRadius: 3, borderBottomRightRadius: 3,
  },
  mixTag: {
    position: 'absolute', left: BOARD.x + BOARD.w - 38, top: BOARD.y - 16, height: 13, paddingHorizontal: 3, borderRadius: 2,
    backgroundColor: DEEP, borderWidth: 1, borderColor: INK, justifyContent: 'center',
  },
  mixText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: PAPER_LIT, includeFontPadding: false,
  },

  rule: {
    position: 'absolute', left: 166, top: 356, width: 150, paddingVertical: 3, alignItems: 'center',
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  ruleHead: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  ruleText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0, color: INK, includeFontPadding: false,
  },
  ruleStrike: {
    position: 'absolute', left: 6, right: 6, top: 15, height: 2.5, borderRadius: 1.25, backgroundColor: EMBER,
    transformOrigin: '0% 50%',
  },
  query: {
    position: 'absolute', left: WALLET.x - 9, top: WALLET.y - 42, width: 18, height: 22, borderRadius: 6,
    backgroundColor: PLATE_FACE, borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  queryText: { fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 15, color: EMBER, includeFontPadding: false },

  meter: {
    position: 'absolute', left: -5, top: -26, width: 10, height: 28, borderRadius: 3, borderWidth: 1.5, borderColor: INK,
    backgroundColor: PLATE_FACE, justifyContent: 'flex-end', overflow: 'hidden',
  },
  meterFill: { width: '100%', backgroundColor: SAGE },
  weight: {
    position: 'absolute', left: 8, top: -16, paddingHorizontal: 2, borderRadius: 2, backgroundColor: DEEP,
  },
  weightText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, color: PAPER_LIT, includeFontPadding: false,
  },

  plate: { position: 'absolute', top: 298, width: PLATE_W, height: 30 },
  thoughtFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 12, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  signFace: {
    flexGrow: 1, borderWidth: 1.5, borderColor: INK, borderRadius: 4, backgroundColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
  },
  faceRight: { backgroundColor: INK },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: -0.1, color: INK, includeFontPadding: false,
  },
  signText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: PAPER_LIT, includeFontPadding: false,
  },
  onInk: { color: PAPER_LIT },
});

export function Ethics2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics2Scene} band={[288, 514]} camera={CAM} />;
}
