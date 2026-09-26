import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { ship } from './objects';
import { BEATS } from './political2Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, pose, stand, travelStance,
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
  booth, tollBox, quayWall, lighthouse, bollard, BOOTH, BRACKET, TOLL, WATER, POLES, POLE_TOP, BOLLARDS,
} from './political2Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// political-political-2, "Where Political Power Comes From" — A HARBOUR.
//
// Redrawn 2026-09-26, one of six second lessons. Every act is laid across its voiced
// line in stages (pace.ts, line lengths from the narration manifest).
//
//   b0   a mugger walks up to a merchant on the quay, raises a fist, and the
//        merchant hands over his purse; the harbourmaster watches from his office.
//   b1   the mugger jabs, the merchant cowers — bodies; then the harbourmaster
//        waves his signal flag and a boat out on the water turns in and berths.
//   b2   POWER drops over the mugger; the merchant grabs for the purse, they tug,
//        and the mugger yanks it free — his will, despite resistance.
//   b3   AUTHORITY drops over the harbourmaster; the merchant walks over and pays
//        his dues into the toll box of his own accord, and they nod to each other.
//   b4   the two leave the quay; a lone pirate ship sails in — ROBBER — and then a
//        whole fleet round it, and the plate turns over: EMPEROR.
//   b5   it turns again, ROBBERS; every ship fires; and LEGITIMATE is stamped under
//        the harbourmaster's AUTHORITY, the one thing that tells them apart.
//   b7   the fleet sails out, three flagpoles rise, and the crown goes up the first.
//   b8   the portrait, then the law; he hangs his signal flag on the harbour office,
//        which keeps it when the holder goes.
//   b9   Q1: the three flags.   b10  Q2: three bollards.
//
// COMPOSITION, in stage units: the booth 6–62 with its bracket at x 66; the
// harbourmaster at x 96; the toll box at 138; the water 420–486 behind the quay; the
// poles at 206 · 262 · 318, a flag's top at 320; the flagship at x 246, its plate at
// 342–358; the lighthouse at 384. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('political');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const STONE_T = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const SEA = stageToneOf(TEAL);
const NIGHT = stageToneOf(DEEP);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, political-political-2. */
const LINES = [5.44, 8.56, 7.24, 7.12, 8.32, 7.96, 0, 6.56, 7.56, 0, 0, 0];

/** Everyone at this scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_H = K_FIG * 0.82;

/** The harbourmaster stands by his office. */
const HX = 96;
/** The mugger, the merchant, and where each goes. */
const MUG_IN = 236;
const MUG_X = 290;
const MER_X = 340;
const MER_PAY = 166;
const OFF_R = 470;
const OFF_L = -60;
/** The boat that obeys the signal, and where it berths. */
const BOAT_X = 236;
/** The flagship and the fleet round it. */
const FLAG_X = 246;
const FLEET = [142, 322, 366];
const FLEET_IN = 300;

const H = BEATS.map((b) => b.h ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_MUG = is('mug');
const A_WAVE = is('wave');
const A_POWER = is('power');
const A_AUTH = is('authority');
const A_PIRATE = is('pirate');
const A_FLEET = is('fleet');
const A_CROWN = is('crown');
const A_OFFICE = is('office');
const TAG_P = BEATS.map((b) => (b.tags === 1 || (b.tags === 2 && b.act === 'authority') ? 1 : 0));
const TAG_A = BEATS.map((b) => ((b.tags ?? 0) >= 2 ? 1 : 0));
const SHIPS = BEATS.map((b) => (b.ships ? 1 : 0));
const LEGIT = BEATS.map((b) => (b.legit ? 1 : 0));
const FLAGS = BEATS.map((b) => b.flags ?? 0);
const HUNG = BEATS.map((b) => (b.hung ? 1 : 0));
const POLES_Q = BEATS.map((b) => (b.poles ? 1 : 0));
const BOLL_ON = BEATS.map((b) => (b.bollards ? 1 : 0));
/** Who is on the quay: the mugger and the merchant until they leave on b4. */
const MOB = BEATS.map((_, k) => (k <= 4 ? 1 : 0));
const BOAT = BEATS.map((_, k) => (k >= 1 && k <= 4 ? 1 : 0));
const SHIPS_ON = BEATS.map((_, k) => (SHIPS[k] || A_CROWN[k] ? 1 : 0));
const PLATE = SHIPS;
const POLES_ON = BEATS.map((b) => ((b.flags ?? 0) > 0 ? 1 : 0));
const LABEL_1 = BEATS.map((b) => ((b.flags ?? 0) >= 1 ? 1 : 0));
const LABEL_3 = BEATS.map((b) => ((b.flags ?? 0) >= 3 ? 1 : 0));
const COIN = A_AUTH;
/** The purse: 0 in the merchant's hand, 1 in the mugger's. */
const PURSE = BEATS.map((_, k) => (k >= 1 ? 1 : 0));
/** Which way the mugger and the merchant face: at each other, then the merchant at the harbourmaster. */
const MUG_DIR = [1, 1, 1, -1, 1, 1, 1, 1, 1, 1, 1, 1];
const MER_DIR = BEATS.map(() => -1);
/** The mugger's and the merchant's holds, beat by beat — living, so neither is ever still. */
const MUG_H = [163, 163, 163, 161, 158, 158, 158, 158, 158, 158, 158, 158];
const MER_H = [158, 279, 158, 263, 158, 158, 158, 158, 158, 158, 158, 158];

const FLAG_Q = [
  { id: 'custom', label: 'CUSTOM', correct: false },
  { id: 'devotion', label: 'DEVOTION', correct: false },
  { id: 'law', label: 'THE LAW', correct: true },
];
const BOLL_Q = [
  { id: 'charm', l1: 'HIS', l2: 'CHARM', correct: false },
  { id: 'custom', l1: 'OLD', l2: 'CUSTOM', correct: false },
  { id: 'office', l1: 'THE', l2: 'OFFICE', correct: true },
];
const FLAG_W = 44;
const FLAG_H = 26;
const TAG_W = 60;

function hold(code: number, t: number): Stance {
  'worklet';
  if (code >= 100) return emoteAny(code, t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function live(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code >= 100) return emoteAnyLive(code, t, bt);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}
/** A hand on a stage point, at this lesson's scale. */
function handOn(s: Stance, x: number, dir: number, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_H, dir: dir < 0 ? -1 : 1 }, 1, tx, ty, w);
}
/** A walker between two points of the quay, strides and all. */
function walker(x0: number, x1: number, from: number, to: number, t: number, bt: number, u: number): Stance {
  'worklet';
  return travelStance(x0, x1, hold(from, t), hold(to, t), live(to, t, bt), u, WALK, 0);
}
const wx = (B: Bundle) => {
  'worklet';
  return B.wrR[0].translateX as number;
};
const wy = (B: Bundle) => {
  'worklet';
  return B.wrR[1].translateY as number;
};

const CAM = followMoves(BEATS.map(() => HX), BEATS.map(kindOf), seedOf('political'));

export default function Political2Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const hH = useHeld();
  const hM = useHeld();
  const hR = useHeld();
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
    const bp = (a: number, m: number, z: number) => {
      'worklet';
      return bump(b, L, a, m, z);
    };

    // ── the mugger ─────────────────────────────────────────────────────────
    let mx = MUG_X;
    let ms: Stance = live(MUG_H[n], t, b);
    if (A_MUG[n]) {
      const u = st(0, 0.24);
      mx = lerp(MUG_IN, MUG_X, u);
      ms = u < 1 ? walker(MUG_IN, MUG_X, MUG_H[n], MUG_H[n], t, b, u) : ms;
    } else if (A_PIRATE[n]) {
      const u = ease01(clamp01(b / moveTr(MUG_X, OFF_R, TR)));
      mx = lerp(MUG_X, OFF_R, u);
      ms = walker(MUG_X, OFF_R, MUG_H[p], MUG_H[n], t, b, u);
    } else if (n > 4) {
      mx = OFF_R;
    }
    const mxC = carry(cv, 0, n, n > 4 ? OFF_R : MUG_X, mx, A_MUG[n] || A_PIRATE[n] ? 1 : tr);
    // the threat: a raised fist (b0) and a jab (b1)
    const fist = A_MUG[n] ? bp(0.28, 0.4, 0.62) : A_WAVE[n] ? bp(0.04, 0.14, 0.4) : 0;
    ms = mixStance(ms, { ...ms, fistR: { x: 16, y: -84 + 6 * Math.sin(t * 7) } }, fist);
    // holding the purse up and away while they tug (b2), and the yank
    const keep = A_POWER[n] ? st(0.3, 0.4) * (1 - st(0.9, 1)) : 0;
    ms = mixStance(ms, { ...ms, fistR: { x: 22, y: -58 } }, keep);
    const yank = A_POWER[n] ? bp(0.7, 0.76, 0.9) : 0;
    ms = { ...ms, tilt: ms.tilt + 0.25 * yank, fistR: { x: ms.fistR.x - 10 * yank, y: ms.fistR.y - 6 * yank } };

    // ── the merchant ───────────────────────────────────────────────────────
    let rx = MER_X;
    let rs: Stance = live(MER_H[n], t, b);
    if (A_AUTH[n]) {
      const u = st(0.26, 0.62);
      rx = lerp(MER_X, MER_PAY, u);
      rs = u > 0 && u < 1 ? walker(MER_X, MER_PAY, MER_H[p], MER_H[n], t, b, u) : u >= 1 ? rs : live(MER_H[p], t, b);
    } else if (A_PIRATE[n]) {
      const u = ease01(clamp01(b / moveTr(MER_PAY, OFF_L, TR)));
      rx = lerp(MER_PAY, OFF_L, u);
      rs = walker(MER_PAY, OFF_L, MER_H[p], MER_H[n], t, b, u);
    } else if (n > 4) {
      rx = OFF_L;
    }
    const rxC = carry(cv, 1, n, n > 4 ? OFF_L : n === 4 ? MER_PAY : MER_X, rx, A_AUTH[n] || A_PIRATE[n] ? 1 : tr);
    // cowering from the fist (b0), hands up and leaning away (b1)
    const cower = A_MUG[n] ? st(0.34, 0.46) : A_WAVE[n] ? 1 - st(0.8, 1) : 0;
    rs = mixStance(rs, emoteAny(279, t), cower * 0.85);
    // the stumble after the yank (b2)
    rs = { ...rs, tilt: rs.tilt - 0.3 * yank };

    // poses and hands: the purse passes, then the tug
    // he turns through a profile, never mirrors between two frames
    const md = facing(MUG_DIR[p], MUG_DIR[n], b);
    const handOver = A_MUG[n] ? bp(0.48, 0.6, 0.76) : 0;
    ms = handOn(ms, mxC, md, rxC - 14, 448, handOver);
    const tug = A_POWER[n] ? st(0.34, 0.42) * (1 - st(0.74, 0.8)) : 0;
    ms = { ...ms, fistR: { x: ms.fistR.x - 4 * tug * Math.sin(t * 13), y: ms.fistR.y } };
    const Bm = pose(keepHeld(hM, mixStance(carryFrom(hM, n, hold(MUG_H[p], t)), ms, tr)), mxC, GROUND, K_H, md, 1);
    rs = handOn(rs, rxC, -1, A_MUG[n] ? mxC + 14 : wx(Bm), A_MUG[n] ? 448 : wy(Bm), Math.max(handOver, tug));
    const pay = A_AUTH[n] ? bp(0.64, 0.72, 0.84) : 0;
    rs = handOn(rs, rxC, -1, TOLL.x + 2, TOLL.top + 2, pay);
    const nod = A_AUTH[n] ? bp(0.82, 0.88, 0.96) : 0;
    rs = { ...rs, neck: rs.neck - 0.35 * nod };
    const Br = pose(keepHeld(hR, mixStance(carryFrom(hR, n, hold(MER_H[p], t)), rs, tr)), rxC, GROUND, K_H, -1, 1);

    // ── the harbourmaster ──────────────────────────────────────────────────
    let hs: Stance = live(H[n], t, b);
    // the signal flag, raised and waved: the boat in (b1), the boats again (b3)
    const wave = A_WAVE[n] ? bp(0.4, 0.5, 0.86) : A_AUTH[n] ? bp(0.08, 0.2, 0.34) : 0;
    hs = mixStance(hs, { ...hs, fistR: { x: 12 + 7 * Math.sin(t * 8), y: -90 + 5 * Math.cos(t * 8) } }, wave);
    // pointing: at the pirate as it sails in, and at each flag as it goes up
    const shipAt = A_PIRATE[n] ? lerp(OFF_R, FLAG_X, st(0.1, 0.4)) : FLAG_X;
    const pointShip = A_PIRATE[n] ? st(0.2, 0.3) * (1 - st(0.92, 1)) : 0;
    hs = handOn(hs, HX, 1, shipAt, 396, pointShip);
    const pointFlag = A_CROWN[n] ? bp(0.5, 0.6, 0.94) : A_OFFICE[n] ? bp(0, 0.08, 0.58) : 0;
    const flagAim = A_OFFICE[n] ? lerp(POLES[1], POLES[2], st(0.3, 0.4)) : POLES[0];
    hs = handOn(hs, HX, 1, flagAim + 20, 340, pointFlag);
    // nodding back to the merchant, and talking the fleet through (b3, b5)
    const hnod = A_AUTH[n] ? bp(0.84, 0.9, 0.98) : 0;
    hs = { ...hs, neck: hs.neck - 0.3 * hnod };
    // turning to his office, hanging the signal flag on its bracket, turning back (b8)
    const turn = A_OFFICE[n] ? st(0.62, 0.7) * (1 - st(0.92, 0.99)) : 0;
    const hdir = carry(cv, 2, n, 1, 1 - 2 * turn, tr);
    const hang = A_OFFICE[n] ? bp(0.68, 0.8, 0.9) : 0;
    hs = handOn(hs, HX, hdir, BRACKET.x + 2, BRACKET.y + 4, hang);
    const hung = carry(cv, 3, n, HUNG[p], A_OFFICE[n] ? st(0.79, 0.82) : HUNG[n], tr);
    const hFig = keepHeld(hH, mixStance(carryFrom(hH, n, hold(H[p], t)), hs, tr));
    const DH = lookPose(hFig, HX, GROUND, K_H, hdir, 1, gazeX.value, gazeY.value, gazeOn.value);

    // ── the water: the boat that obeys, the pirate, the fleet ──────────────
    const boatT = A_WAVE[n] ? lerp(OFF_R, BOAT_X, st(0.52, 0.94)) : A_PIRATE[n] ? lerp(BOAT_X, OFF_L - 30, st(0, 0.3)) : n < 1 ? OFF_R : n > 4 ? OFF_L - 30 : BOAT_X;
    const flagT = A_PIRATE[n] ? lerp(OFF_R + 20, FLAG_X, st(0.1, 0.4)) : A_CROWN[n] ? lerp(FLAG_X, 540, st(0, 0.4)) : SHIPS[n] ? FLAG_X : n < 4 ? OFF_R + 20 : 540;
    const fleetT = A_PIRATE[n] ? lerp(FLEET_IN, 0, st(0.62, 0.9)) : A_CROWN[n] ? lerp(0, FLEET_IN, st(0.04, 0.44)) : SHIPS[n] ? 0 : FLEET_IN;
    // the plate: 0 ROBBER · 1 EMPEROR · 2 ROBBERS
    const plateT = A_PIRATE[n] ? st(0.86, 0.94) : A_FLEET[n] ? 1 + st(0.16, 0.28) : A_CROWN[n] || n > 5 ? 2 : 0;
    const plateOp = A_PIRATE[n] ? st(0.42, 0.5) : A_CROWN[n] ? 1 - st(0, 0.06) : PLATE[n];

    // ── the flags ──────────────────────────────────────────────────────────
    const f0 = A_CROWN[n] ? st(0.56, 0.88) : FLAGS[n] >= 1 ? 1 : 0;
    const f1 = A_OFFICE[n] ? st(0.06, 0.3) : FLAGS[n] >= 3 ? 1 : 0;
    const f2 = A_OFFICE[n] ? st(0.36, 0.58) : FLAGS[n] >= 3 ? 1 : 0;

    return {
      DH, Bm, Br,
      boat: carry(cv, 4, n, n <= 1 ? OFF_R : n >= 5 ? OFF_L - 30 : BOAT_X, boatT, A_WAVE[n] || A_PIRATE[n] ? 1 : tr),
      flagX: carry(cv, 5, n, n <= 4 ? OFF_R + 20 : n === 7 ? FLAG_X : n > 7 ? 540 : FLAG_X, flagT, A_PIRATE[n] || A_CROWN[n] ? 1 : tr),
      fleet: carry(cv, 6, n, n <= 4 ? FLEET_IN : n === 7 ? 0 : n > 7 ? FLEET_IN : 0, fleetT, A_PIRATE[n] || A_CROWN[n] ? 1 : tr),
      plate: carry(cv, 7, n, n === 4 ? 0 : n === 5 ? 1 : 2, plateT, tr),
      plateOp: carry(cv, 8, n, n === 4 ? 0 : PLATE[p], plateOp, tr),
      smoke: carry(cv, 9, n, 0, A_FLEET[n] ? bp(0.44, 0.5, 0.7) : 0, tr),
      tagP: carry(cv, 10, n, TAG_P[p], A_POWER[n] ? st(0.06, 0.22) : A_PIRATE[n] ? 1 - st(0, 0.06) : TAG_P[n], tr),
      tagA: carry(cv, 11, n, TAG_A[p], A_AUTH[n] ? st(0.04, 0.2) : TAG_A[n], tr),
      legit: carry(cv, 12, n, LEGIT[p], A_FLEET[n] ? st(0.72, 0.8) : LEGIT[n], tr),
      poles: carry(cv, 13, n, POLES_ON[p], A_CROWN[n] ? st(0.24, 0.46) : POLES_ON[n], tr),
      f0: carry(cv, 14, n, FLAGS[p] >= 1 ? 1 : 0, f0, tr),
      f1: carry(cv, 15, n, FLAGS[p] >= 3 ? 1 : 0, f1, tr),
      f2: carry(cv, 16, n, FLAGS[p] >= 3 ? 1 : 0, f2, tr),
      hung,
      purse: carry(cv, 17, n, PURSE[p], A_MUG[n] ? st(0.58, 0.62) : PURSE[n], tr),
      coin: carry(cv, 18, n, 0, A_AUTH[n] ? st(0.56, 0.6) * (1 - st(0.78, 0.8)) : 0, tr),
      drop: carry(cv, 19, n, 0, A_AUTH[n] ? st(0.72, 0.78) : 0, tr),
      sign: carry(cv, 20, n, HUNG[p], A_OFFICE[n] ? bp(0.8, 0.86, 1) + st(0.8, 0.86) * 0 : 0, tr),
      q1: carry(cv, 21, n, POLES_Q[p], POLES_Q[n], tr),
      q2: carry(cv, 22, n, BOLL_ON[p], BOLL_ON[n], tr),
      mobOp: carry(cv, 23, n, MOB[p], MOB[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.DH);
  const DM = useDerivedValue<Bundle>(() => SCENE.value.Bm);
  const DR = useDerivedValue<Bundle>(() => SCENE.value.Br);

  const purse = useAnimatedStyle(() => {
    const u = SCENE.value.purse;
    const m = DM.value.wrR;
    const r = DR.value.wrR;
    const x = lerp(r[0].translateX, m[0].translateX, u);
    const y = lerp(r[1].translateY, m[1].translateY, u);
    return { opacity: SCENE.value.mobOp, transform: [{ translateX: x }, { translateY: y }] };
  });
  const coin = useAnimatedStyle(() => {
    const r = DR.value.wrR;
    const d = SCENE.value.drop;
    return {
      opacity: SCENE.value.coin,
      transform: [
        { translateX: lerp(r[0].translateX, TOLL.x, d) },
        { translateY: lerp(r[1].translateY, TOLL.top + 5, d) },
      ],
    };
  });
  const signal = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    return {
      opacity: 1 - SCENE.value.hung,
      transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }, { scaleX: DF.value.dir < 0 ? -1 : 1 }],
    };
  });
  const hungFlag = useAnimatedStyle(() => ({ opacity: SCENE.value.hung }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Gulls S={SCENE} />
      <Water S={SCENE} />
      <ObjectArt parts={LIGHT_ART} tone={STONE_T} />
      {on(BOAT) ? <Boat S={SCENE} /> : null}
      {on(SHIPS_ON) ? <Fleet S={SCENE} on={on} /> : null}
      <ObjectArt parts={WALL_ART} tone={STONE_T} />
      <ObjectArt parts={BOOTH_ART} tone={WOOD} />
      <Sign S={SCENE} />
      <Animated.View style={[styles.hungFlag, hungFlag]} pointerEvents="none">
        <View style={styles.hungPole} />
        <View style={styles.hungCloth} />
      </Animated.View>
      <ObjectArt parts={TOLL_ART} tone={NIGHT} />
      {on(POLES_ON) ? <Flags S={SCENE} on={on} /> : null}
      {on(BOLL_ON) ? BOLLARDS.map((x) => <ObjectArt key={x} parts={bollard(x)} tone={NIGHT} />) : null}
      <View style={styles.ground} pointerEvents="none" />
      {on(MOB) ? <Stickman D={DR} k={K_H} role="crowd" /> : null}
      {on(MOB) ? <Stickman D={DM} k={K_H} role="second" /> : null}
      <Stickman D={DF} k={K_H} />
      {on(MOB) ? (
        <Animated.View style={[styles.rider, purse]} pointerEvents="none">
          <View style={styles.purse} />
        </Animated.View>
      ) : null}
      {on(COIN) ? (
        <Animated.View style={[styles.rider, coin]} pointerEvents="none">
          <View style={styles.coin} />
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.rider, signal]} pointerEvents="none">
        <View style={styles.signalPole} />
        <View style={styles.signalCloth} />
      </Animated.View>
      <Tags S={SCENE} on={on} DM={DM} />
      {POLES_Q[i] ? <FlagTargets picked={picked} onPick={onPick} S={SCENE} /> : null}
      {BOLL_ON[i] ? <Bollards picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const BOOTH_ART = booth();
const TOLL_ART = tollBox();
const WALL_ART = quayWall();
const LIGHT_ART = lighthouse();
const BOAT_ART = ship(0, 434, 46, 42);
const FLAGSHIP_ART = ship(0, 398, 90, 84);
const FLEET_ART = ship(0, 404, 56, 54);

// ── the sky and the water ───────────────────────────────────────────────────

function Gulls({ S }: { S: SharedValue<any> }) {
  return (
    <>
      <Gull S={S} k={0} />
      <Gull S={S} k={1} />
    </>
  );
}
function Gull({ S, k }: { S: SharedValue<any>; k: number }) {
  const body = useAnimatedStyle(() => {
    const u = ((S.value.t * 0.05 + k * 0.47) % 1 + 1) % 1;
    return { transform: [{ translateX: lerp(430, -30, u) }, { translateY: 304 + 5 * k + 3 * Math.sin(S.value.t * 0.8 + k) }] };
  });
  const wl = useAnimatedStyle(() => ({ transform: [{ rotate: `${-18 - 16 * Math.sin(S.value.t * 5 + k * 2)}deg` }] }));
  const wr = useAnimatedStyle(() => ({ transform: [{ rotate: `${18 + 16 * Math.sin(S.value.t * 5 + k * 2)}deg` }] }));
  return (
    <Animated.View style={[styles.rider, body]} pointerEvents="none">
      <Animated.View style={[styles.wing, { left: -8, transformOrigin: '100% 50%' }, wl]} />
      <Animated.View style={[styles.wing, { left: 0, transformOrigin: '0% 50%' }, wr]} />
    </Animated.View>
  );
}

function Water({ S }: { S: SharedValue<any> }) {
  return (
    <View style={styles.water} pointerEvents="none">
      {[0, 1, 2, 3].map((k) => <Wave key={k} S={S} k={k} />)}
    </View>
  );
}
function Wave({ S, k }: { S: SharedValue<any>; k: number }) {
  const st = useAnimatedStyle(() => ({ transform: [{ translateX: 14 * Math.sin(S.value.t * 0.8 + k * 1.9) }] }));
  return <Animated.View style={[styles.wave, { top: 12 + k * 14, left: 20 + k * 86 }, st]} />;
}

// ── the boat that obeys ─────────────────────────────────────────────────────

function Boat({ S }: { S: SharedValue<any> }) {
  // it sails in from the right, bow first — the drawing faces right, so it is turned
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.boat }, { translateY: 1.5 * Math.sin(S.value.t * 1.3) }, { scaleX: -1 }],
  }));
  return (
    <Animated.View style={[styles.origin, st]} pointerEvents="none">
      <ObjectArt parts={BOAT_ART} tone={STONE_T} />
    </Animated.View>
  );
}

// ── the pirate and the fleet ────────────────────────────────────────────────

function Fleet({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  return (
    <>
      {FLEET.map((x, k) => <FleetShip key={x} S={S} x={x} k={k} />)}
      <Flagship S={S} on={on} />
    </>
  );
}
function FleetShip({ S, x, k }: { S: SharedValue<any>; x: number; k: number }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: x + S.value.fleet }, { translateY: 1.5 * Math.sin(S.value.t * 1.1 + k * 1.7) }, { scaleX: -1 }],
  }));
  const smoke = useAnimatedStyle(() => ({
    opacity: S.value.smoke,
    transform: [{ scale: 0.4 + 0.9 * S.value.smoke }],
  }));
  return (
    <Animated.View style={[styles.origin, st]} pointerEvents="none">
      <ObjectArt parts={FLEET_ART} tone={SEA} />
      <Animated.View style={[styles.puff, { left: -26, top: 408 }, smoke]} />
    </Animated.View>
  );
}
function Flagship({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({
    transform: [{ translateX: S.value.flagX }, { translateY: 1.5 * Math.sin(S.value.t * 1.2) }],
  }));
  const hull = useAnimatedStyle(() => ({ transform: [{ scaleX: -1 }] }));
  const smoke = useAnimatedStyle(() => ({ opacity: S.value.smoke, transform: [{ scale: 0.4 + 1.1 * S.value.smoke }] }));
  // the plate turns over, edge-on at each change of word
  const plate = useAnimatedStyle(() => ({
    opacity: S.value.plateOp,
    transform: [{ scaleX: Math.max(0.02, Math.abs(Math.cos(Math.PI * S.value.plate))) }],
  }));
  const w0 = useAnimatedStyle(() => ({ opacity: Math.round(S.value.plate) === 0 ? 1 : 0 }));
  const w1 = useAnimatedStyle(() => ({ opacity: Math.round(S.value.plate) === 1 ? 1 : 0 }));
  const w2 = useAnimatedStyle(() => ({ opacity: Math.round(S.value.plate) === 2 ? 1 : 0 }));
  return (
    <Animated.View style={[styles.origin, st]} pointerEvents="none">
      <Animated.View style={[styles.origin, hull]}>
        <ObjectArt parts={FLAGSHIP_ART} tone={NIGHT} />
      </Animated.View>
      <Animated.View style={[styles.puff, styles.bigPuff, smoke]} />
      {on(PLATE) ? (
        <Animated.View style={[styles.shipPlate, plate]}>
          <Animated.Text style={[styles.plateText, w0]} numberOfLines={1}>ROBBER</Animated.Text>
          <Animated.Text style={[styles.plateText, styles.stacked, w1]} numberOfLines={1}>EMPEROR</Animated.Text>
          <Animated.Text style={[styles.plateText, styles.stacked, w2]} numberOfLines={1}>ROBBERS</Animated.Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

// ── the harbour office's sign ───────────────────────────────────────────────

function Sign({ S }: { S: SharedValue<any> }) {
  const glow = useAnimatedStyle(() => ({ opacity: S.value.sign }));
  return (
    <>
      <Animated.View style={[styles.signGlow, glow]} pointerEvents="none" />
      <View style={styles.sign} pointerEvents="none">
        <Text style={styles.signText} numberOfLines={1}>HARBOUR</Text>
        <Text style={styles.signText} numberOfLines={1}>OFFICE</Text>
      </View>
    </>
  );
}

// ── POWER over the mugger; AUTHORITY, then LEGITIMATE, over the harbourmaster ─

function Tags({ S, on, DM }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean; DM: SharedValue<Bundle> }) {
  const power = useAnimatedStyle(() => ({
    opacity: S.value.tagP * S.value.mobOp,
    transform: [{ translateX: DM.value.pel[0].translateX - TAG_W / 2 }, { translateY: -14 * (1 - S.value.tagP) }],
  }));
  const auth = useAnimatedStyle(() => ({
    opacity: S.value.tagA,
    transform: [{ translateY: -14 * (1 - S.value.tagA) }],
  }));
  const legit = useAnimatedStyle(() => ({
    opacity: S.value.legit,
    transform: [{ scale: 1.8 - 0.8 * S.value.legit }, { rotate: '-5deg' }],
  }));
  return (
    <>
      {on(TAG_P) ? (
        <Animated.View style={[styles.tag, power]} pointerEvents="none">
          <View style={styles.tagString} />
          <View style={styles.tagFace}>
            <Text style={styles.tagText} numberOfLines={1}>POWER</Text>
          </View>
        </Animated.View>
      ) : null}
      {on(TAG_A) ? (
        <Animated.View style={[styles.tag, { left: HX - TAG_W / 2 - 8, width: TAG_W + 16 }, auth]} pointerEvents="none">
          <View style={styles.tagString} />
          <View style={styles.tagFace}>
            <Text style={styles.tagText} numberOfLines={1}>AUTHORITY</Text>
          </View>
        </Animated.View>
      ) : null}
      {on(LEGIT) ? (
        <Animated.View style={[styles.stamp, legit]} pointerEvents="none">
          <Text style={styles.stampText} numberOfLines={1}>LEGITIMATE</Text>
        </Animated.View>
      ) : null}
    </>
  );
}

// ── three poles and the flags that go up them ───────────────────────────────

function Flags({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  return (
    <>
      {POLES.map((x, k) => <Pole key={x} S={S} x={x} k={k} on={on} />)}
    </>
  );
}
function Pole({ S, x, k, on }: { S: SharedValue<any>; x: number; k: number; on: (a: readonly number[]) => boolean }) {
  const pole = useAnimatedStyle(() => ({ transform: [{ scaleY: Math.max(0.01, S.value.poles) }] }));
  const flag = useAnimatedStyle(() => {
    const f = k === 0 ? S.value.f0 : k === 1 ? S.value.f1 : S.value.f2;
    return { opacity: clamp01(f * 5), transform: [{ translateY: lerp(470 - POLE_TOP, 0, f) }] };
  });
  const cloth = useAnimatedStyle(() => ({ transform: [{ scaleX: 0.93 + 0.07 * Math.sin(S.value.t * 3 + k * 1.3) }] }));
  const label = k === 0 ? LABEL_1 : LABEL_3;
  return (
    <>
      <Animated.View style={[styles.pole, { left: x - 1.5 }, pole]} pointerEvents="none">
        <View style={styles.finial} />
      </Animated.View>
      <Animated.View style={[styles.flag, { left: x + 1 }, flag]} pointerEvents="none">
        <Animated.View style={[styles.cloth, { backgroundColor: [NIGHT.SHADE, WOOD.SHADE, SEA.SHADE][k] }, cloth]}>
          <View style={styles.fold} />
          {k === 0 ? <Crown /> : k === 1 ? <Emblem /> : <Scales />}
        </Animated.View>
        {on(label) ? (
          <View style={styles.flagLabel}>
            <Text style={styles.labelText} numberOfLines={1}>{FLAG_Q[k].label}</Text>
          </View>
        ) : null}
      </Animated.View>
    </>
  );
}
function Crown() {
  return (
    <View style={styles.icon}>
      <View style={[styles.spike, { left: 0 }]} />
      <View style={[styles.spike, { left: 6 }]} />
      <View style={[styles.spike, { left: 12 }]} />
      <View style={styles.crownBand} />
    </View>
  );
}
function Emblem() {
  return (
    <View style={styles.icon}>
      <View style={styles.emblemDisc} />
      <View style={styles.emblemShoulders} />
    </View>
  );
}
function Scales() {
  return (
    <View style={styles.icon}>
      <View style={styles.scalePost} />
      <View style={styles.scaleBeam} />
      <View style={[styles.pan, { left: 0 }]} />
      <View style={[styles.pan, { right: 0 }]} />
    </View>
  );
}

// ── Q1: which flag ───────────────────────────────────────────────────────────

function FlagTargets({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.q1 }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {FLAG_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={[styles.flagTarget, { left: POLES[k] - 2 }]}
        >
          <View style={styles.fill} />
        </Target>
      ))}
    </Animated.View>
  );
}

// ── Q2: three bollards, a tag on each rope ──────────────────────────────────

function Bollards({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const rise = useAnimatedStyle(() => ({ opacity: S.value.q2, transform: [{ translateY: (1 - S.value.q2) * 10 }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, rise]} pointerEvents="box-none">
      {BOLL_Q.map((q, k) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={4}
          disabled={answered} sealAt="tr"
          style={[styles.bollTarget, { left: BOLLARDS[k] - TAG_W / 2 }]}
        >
          <View style={styles.bollFill}>
            <View style={[styles.bollPlate, answered && q.correct && styles.plateRight]}>
              <Text style={[styles.labelText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l1}</Text>
              <Text style={[styles.labelText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.l2}</Text>
            </View>
            <View style={styles.rope} />
          </View>
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  rider: { position: 'absolute', left: 0, top: 0 },
  origin: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  wing: { position: 'absolute', top: 0, width: 8, height: 1.8, borderRadius: 1, backgroundColor: INK },

  water: {
    position: 'absolute', left: 0, top: WATER.top, width: STAGE_W, height: WATER.bottom - WATER.top,
    backgroundColor: SEA.SHADE, overflow: 'hidden', borderTopLeftRadius: 2, borderTopRightRadius: 2,
  },
  wave: { position: 'absolute', width: 60, height: 2, borderRadius: 1, backgroundColor: PAPER_LIT, opacity: 0.5 },

  puff: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: PAPER_LIT,
    borderWidth: 1.2, borderColor: RULE,
  },
  bigPuff: { left: -48, top: 400, width: 18, height: 18, borderRadius: 9 },
  shipPlate: {
    position: 'absolute', left: -32, top: 340, width: 64, height: 18, borderRadius: 3,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  stacked: { position: 'absolute', top: 2.5 },

  signGlow: {
    position: 'absolute', left: BOOTH.x0 - 1, top: 440, width: BOOTH.x1 - BOOTH.x0 + 2, height: 30, borderRadius: 6,
    backgroundColor: SAGE,
  },
  sign: {
    position: 'absolute', left: BOOTH.x0 + 3, top: 443, width: BOOTH.x1 - BOOTH.x0 - 6, height: 24, borderRadius: 3,
    borderWidth: 1.2, borderColor: INK, backgroundColor: PLATE_FACE, alignItems: 'center', justifyContent: 'center',
  },
  signText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  hungFlag: { position: 'absolute', left: BRACKET.x - 1, top: BRACKET.y - 6 },
  hungPole: { position: 'absolute', left: 0, top: 0, width: 2, height: 30, borderRadius: 1, backgroundColor: INK },
  hungCloth: {
    position: 'absolute', left: 2, top: 0, width: 14, height: 10, borderRadius: 1.5, backgroundColor: EMBER,
    borderWidth: 1, borderColor: INK,
  },
  signalPole: { position: 'absolute', left: -1, top: -26, width: 2, height: 30, borderRadius: 1, backgroundColor: INK },
  signalCloth: {
    position: 'absolute', left: 1, top: -26, width: 14, height: 10, borderRadius: 1.5, backgroundColor: EMBER,
    borderWidth: 1, borderColor: INK,
  },
  purse: {
    position: 'absolute', left: -6, top: -4, width: 12, height: 12, borderRadius: 5, backgroundColor: WOOD.SHADE,
    borderWidth: 1.5, borderColor: INK,
  },
  coin: {
    position: 'absolute', left: -3.5, top: -3.5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: EMBER,
    borderWidth: 1, borderColor: INK,
  },

  tag: { position: 'absolute', left: 0, top: 364, width: TAG_W, alignItems: 'center' },
  tagString: { width: 1.2, height: 6, backgroundColor: INK },
  tagFace: {
    height: 16, paddingHorizontal: 6, borderRadius: 3, borderWidth: 1.5, borderColor: INK,
    backgroundColor: PLATE_FACE, boxShadow: LIP, justifyContent: 'center',
  },
  tagText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  stamp: {
    position: 'absolute', left: HX - 34, top: 389, width: 68, height: 15, borderRadius: 3,
    backgroundColor: DEEP, alignItems: 'center', justifyContent: 'center',
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: PAPER_LIT, includeFontPadding: false,
  },

  pole: {
    position: 'absolute', top: POLE_TOP, width: 3, height: GROUND - POLE_TOP, borderRadius: 1.5,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  finial: { position: 'absolute', left: -2, top: -4, width: 7, height: 7, borderRadius: 3.5, backgroundColor: INK },
  flag: { position: 'absolute', top: POLE_TOP + 2, width: FLAG_W + 8 },
  cloth: {
    width: FLAG_W, height: FLAG_H, borderRadius: 2, borderWidth: 1.5, borderColor: INK, transformOrigin: '0% 50%',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  fold: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 12, backgroundColor: INK, opacity: 0.18 },
  icon: { width: 18, height: 14 },
  spike: {
    position: 'absolute', top: 0, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderBottomWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: PAPER_LIT,
  },
  crownBand: { position: 'absolute', left: 0, right: 0, top: 8, height: 5, borderRadius: 1, backgroundColor: PAPER_LIT },
  emblemDisc: { position: 'absolute', left: 5, top: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: PAPER_LIT },
  emblemShoulders: {
    position: 'absolute', left: 2, top: 8, width: 14, height: 7, borderTopLeftRadius: 7, borderTopRightRadius: 7,
    backgroundColor: PAPER_LIT,
  },
  scalePost: { position: 'absolute', left: 8, top: 0, width: 2, height: 14, borderRadius: 1, backgroundColor: PAPER_LIT },
  scaleBeam: { position: 'absolute', left: 1, top: 2, width: 16, height: 2, borderRadius: 1, backgroundColor: PAPER_LIT },
  pan: {
    position: 'absolute', top: 7, width: 7, height: 4, borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
    backgroundColor: PAPER_LIT,
  },
  flagLabel: {
    marginTop: 3, width: FLAG_W + 8, height: 14, borderRadius: 3, borderWidth: 1.2, borderColor: INK,
    backgroundColor: PLATE_FACE, alignItems: 'center', justifyContent: 'center',
  },
  labelText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0, color: INK, includeFontPadding: false,
  },

  flagTarget: { position: 'absolute', top: POLE_TOP - 2, width: FLAG_W + 10, height: FLAG_H + 24 },
  fill: { flexGrow: 1 },
  bollTarget: { position: 'absolute', top: 436, width: TAG_W, height: 50 },
  bollFill: { flexGrow: 1, alignItems: 'center' },
  bollPlate: {
    width: TAG_W, height: 26, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  plateRight: { backgroundColor: INK },
  onInk: { color: PAPER_LIT },
  rope: { width: 1.5, height: 22, borderRadius: 0.75, backgroundColor: INK },
});

export function Political2Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political2Scene} band={[288, 514]} camera={CAM} />;
}
