import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import { BEATS } from './valid3Script';
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
import { lineOf } from './pace';
import {
  machine, panel, stand as standArt, rack,
  BODY, HOPPERS, HOPPER_MOUTH, CARD_BOX, CRANK, OUT as SLOT_OUT, LAMPS, GEAR, BOARD, STAND, RACK,
} from './valid3Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// logic-arguments-3, "Valid vs Sound" — AN ARGUMENT MACHINE IN A WORKSHOP.
//
// Redrawn 2026-09-26: the third lesson of the branch in reading order. Every act is
// laid across its voiced line in seconds (line lengths from the narration manifest).
// He works the machine from its two ends, standing in front of it: the card box and
// the first hopper from the left end, the second hopper and the crank from the right,
// so his hands meet everything they touch and the lamps between stay in full view.
//
//   b0   he turns the crank; the gear in the window turns.
//   b1   the two lamps are labelled VALID and SOUND; he points to VALID.
//   b2   he points to SOUND.
//   b3   he takes the two premise cards from the pocket and drops one in each hopper;
//        each is written on the board as it goes in.
//   b4   he turns the crank; the conclusion rises out of the slot on top, and onto the
//        board; VALID lights.
//   b5   he comes round to the stand and holds up the toaster, which is not gold:
//        FALSE is stamped on each line, and SOUND stays dark.
//   b7   Q1: three rubber stamps on the wall.
//   b8   he sets the toaster down, goes back to the machine's left end and pulls the first
//        premise out of its hopper; the conclusion is struck through.
//
// COMPOSITION, in stage units: the machine 150–262 × 454–500 with hoppers at 158 and
// 264, the crank at 270, the out-slot at 212 on top; the board 60–330 × 320–384;
// the stand at 342; the stamp rack 334–398 from 338. He stands clear of the machine, at
// 132 by its left end and 290 by its right, and at 316 by the toaster. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('logic');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const STEEL = stageToneOf(TEAL);
const WOOD = stageToneOf(OLIVE);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, logic-arguments-3. */
const LINES = [6.28, 7.64, 3.56, 6.04, 7.6, 7.8, 0, 0, 9.28, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_L = K_FIG * 0.82;

const X = BEATS.map((b) => b.x ?? 196);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_RUN = is('run');
const A_VALID = is('valid');
const A_SOUND = is('sound');
const A_LOAD = is('load');
const A_CRANK = is('crank');
const A_TOASTER = is('toaster');
const A_REJECT = is('reject');
const flag = (k: keyof (typeof BEATS)[number]) => BEATS.map((b) => (b[k] ? 1 : 0));
const LAMPS_ON = flag('lamps');
const OUT = flag('out');
const VALID = flag('valid');
const FALSIFIED = flag('falsified');
const TOASTER = flag('toaster');
const PULLED = flag('pulled');
const STAMPS = flag('stamps');
const FED = BEATS.map((b) => b.fed ?? 0);
const P1_ON = FED.map((v) => (v >= 1 ? 1 : 0));
const P2_ON = FED.map((v) => (v >= 2 ? 1 : 0));
/** The sort is being answered: the lamps show the bin being weighed (R7c). */
const SORT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));
/** Per bin, in the sort's own order: invalid · sound · valid, unsound · both faults. */
const SORT_VALID = [0, 1, 1, 0];
const SORT_SOUND = [0, 1, 0, 0];
/** Which way he faces once a beat settles: the crank and the toaster to his right, the hoppers to his left. */
/** Which way he faces once a beat settles: the machine is to his right from the left end, to his left from the right end. */
const DIR = BEATS.map((b) => ((b.x ?? 132) >= 282 && (b.x ?? 0) < 300 ? -1 : 1));

const LINES_TEXT = [
  { tag: 'P1', text: 'ALL TOASTERS ARE GOLD' },
  { tag: 'P2', text: 'ALL GOLD THINGS ARE TIME MACHINES' },
  { tag: '∴', text: 'ALL TOASTERS ARE TIME MACHINES' },
];
const STAMP_Q = [
  { id: 'sound', label: 'SOUND', y: 346, correct: true },
  { id: 'valid', label: 'VALID ONLY', y: 368, correct: false },
  { id: 'probable', label: 'PROBABLE', y: 390, correct: false },
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
  return w <= 0 ? s : reachHandTo(s, { x, groundY: GROUND, k: K_L, dir: dir < 0 ? -1 : 1 }, 1, tx, ty, w);
}
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
/** b3: to the first hopper, then to the second. */
const LOAD_LEGS = [[290, 1.2]];
/** b8: the toaster set down, then back behind the machine. */
const REJECT_LEGS = [[132, 1.0]];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic'));

export default function Valid3Scene({
  clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(20);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const b = bt.value;
    const t = clock.value;
    const tr = ease01(b / TR);
    lineOf(LINES, n);
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
    const legs = A_LOAD[n] ? LOAD_LEGS : A_REJECT[n] ? REJECT_LEGS : null;
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
    let dirV = walking
      ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
      : facing(DIR[p], DIR[n], b);
    if (legs && leg) {
      // before the walk he faces what he is doing; walking, the way he goes; then the beat's way
      const start = legs[0][1];
      const tv = xn > xp ? 1 : -1;
      const arrive = start + moveTr(xp, xn, TR);
      const was = facing(DIR[p], DIR[p], b);
      const then = facing(DIR[n], DIR[n], b);
      dirV = b < start - 0.25 ? was : b < arrive ? lerp(was, tv, sec(start - 0.25, start)) : lerp(tv, then, sec(arrive, arrive + 0.3));
    }
    const dir = dirV < 0 ? -1 : 1;

    // ── the crank (b0, b4): his hand goes round with the handle ─────────────
    const cranking = (A_RUN[n] ? sec(0.6, 0.9) * (1 - sec(4.2, 4.5)) : 0) + (A_CRANK[n] ? sec(0.9, 1.2) * (1 - sec(3.0, 3.3)) : 0);
    const turns = A_RUN[n] ? 1.6 * sec(0.8, 4.2) : A_CRANK[n] ? 1.6 * sec(1.1, 3.0) : 0;
    const ang = 2 * Math.PI * turns;
    const handle = { x: CRANK.x + CRANK.r * Math.cos(ang), y: CRANK.y + CRANK.r * Math.sin(ang) };
    s = handOn(s, x, dir, handle.x, handle.y, cranking);
    // ── pointing at the lamps (b1, b2) ──────────────────────────────────────
    const pointV = A_VALID[n] ? sec(2.4, 2.9) * (1 - sec(6.4, 6.9)) : 0;
    s = handOn(s, x, dir, LAMPS.valid, LAMPS.y - 2, pointV);
    const pointS = A_SOUND[n] ? sec(0.5, 0.9) * (1 - sec(3.0, 3.4)) : 0;
    // pointed high, over the machine, so the hand never crosses the VALID plate on its way
    s = handOn(s, x, dir, LAMPS.sound + 4, LAMPS.y - 28, pointS);
    // ── the cards (b3): from the box, into each hopper ──────────────────────
    const takeCards = A_LOAD[n] ? pulse(0.05, 0.25, 0.45) : 0;
    s = handOn(s, x, dir, CARD_BOX.x, CARD_BOX.y - 4, takeCards);
    const drop1 = A_LOAD[n] ? pulse(0.55, 0.8, 1.1) : 0;
    s = handOn(s, x, dir, HOPPERS[0] - 4, HOPPER_MOUTH - 4, drop1);
    const drop2 = A_LOAD[n] ? pulse(3.8, 4.05, 4.4) : 0;
    s = handOn(s, x, dir, HOPPERS[1] + 4, HOPPER_MOUTH - 4, drop2);
    // ── the toaster (b5): picked up off the stand and held up to look at ───
    const pickT = A_TOASTER[n] ? pulse(0.9, 1.25, 1.6) : 0;
    s = handOn(s, x, dir, STAND.x - 2, STAND.top - 8, pickT);
    const holdT = A_TOASTER[n] ? sec(1.3, 1.45) : A_REJECT[n] ? 1 - sec(0.5, 0.6) : TOASTER[n];
    // held out in front of his chest, clear of his head, to look at
    s = mixStance(s, { ...s, fistR: { x: 31, y: -12 } }, holdT * (A_TOASTER[n] ? sec(1.4, 2.0) : 1));
    const setT = A_REJECT[n] ? pulse(0.1, 0.45, 0.75) : 0;
    s = handOn(s, x, dir, STAND.x - 2, STAND.top - 8, setT);
    // ── pulling the first premise back out (b8) ─────────────────────────────
    const pull = A_REJECT[n] ? pulse(5.6, 6.0, 7.2) : 0;
    s = handOn(s, x, dir, HOPPERS[0] - 2, HOPPER_MOUTH - 4 - 14 * sec(6.0, 6.6), pull);

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the machine ──────────────────────────────────────────────────────────
    const p1 = A_LOAD[n] ? sec(0.9, 1.7) : P1_ON[n];
    const p2 = A_LOAD[n] ? sec(4.1, 4.9) : P2_ON[n];
    const concl = A_CRANK[n] ? sec(2.4, 3.2) : OUT[n];
    const card = A_CRANK[n] ? sec(2.2, 2.9) : OUT[n];
    const validLit = A_CRANK[n] ? sec(6.2, 6.6) : SORT[n] ? pickAt(SORT_VALID, pickPos.value) : VALID[n];
    const soundLit = SORT[n] ? pickAt(SORT_SOUND, pickPos.value) : 0;
    const soundNo = A_TOASTER[n] ? sec(5.4, 5.8) : FALSIFIED[n] && !SORT[n] ? 1 : 0;
    const f1 = A_TOASTER[n] ? sec(1.2, 1.4) : FALSIFIED[n];
    const f2 = A_TOASTER[n] ? sec(1.6, 1.8) : FALSIFIED[n];
    const f3 = A_TOASTER[n] ? sec(2.6, 2.8) : FALSIFIED[n];
    const struck = A_REJECT[n] ? sec(6.7, 7.3) : PULLED[n];
    const lampsOn = A_VALID[n] ? sec(0.3, 1.0) : LAMPS_ON[n];
    const gearGlow = A_VALID[n] ? sec(3.0, 3.6) * (1 - sec(6.6, 7.2)) : A_REJECT[n] ? sec(0.2, 0.8) * (1 - sec(2.2, 2.8)) : 0;
    const premGlow = A_REJECT[n] ? sec(2.4, 2.9) * (1 - sec(5.0, 5.5)) : 0;
    const carrying = A_LOAD[n] ? sec(0.25, 0.35) * (1 - sec(4.0, 4.1)) : 0;
    const cardUp = A_REJECT[n] ? sec(6.0, 6.1) : PULLED[n];

    return {
      fig: lookPose(fig, x, GROUND, K_L, dirV, 1, gazeX.value, gazeY.value, gazeOn.value),
      turns: carry(cv, 1, n, 0, turns, tr),
      p1: carry(cv, 2, n, P1_ON[p], p1, tr),
      p2: carry(cv, 3, n, P2_ON[p], p2, tr),
      concl: carry(cv, 4, n, OUT[p], concl, tr),
      card: carry(cv, 5, n, OUT[p], card, tr),
      validLit: carry(cv, 6, n, VALID[p], validLit, tr),
      soundLit: carry(cv, 7, n, 0, soundLit, tr),
      soundNo: carry(cv, 8, n, FALSIFIED[p], soundNo, tr),
      f1: carry(cv, 9, n, FALSIFIED[p], f1, tr),
      f2: carry(cv, 10, n, FALSIFIED[p], f2, tr),
      f3: carry(cv, 11, n, FALSIFIED[p], f3, tr),
      struck: carry(cv, 12, n, PULLED[p], struck, tr),
      lamps: carry(cv, 13, n, LAMPS_ON[p], lampsOn, tr),
      gearGlow: carry(cv, 14, n, 0, gearGlow, tr),
      premGlow: carry(cv, 15, n, 0, premGlow, tr),
      holdT: carry(cv, 16, n, TOASTER[p], holdT, tr),
      carrying: carry(cv, 17, n, 0, carrying, tr),
      cardUp: carry(cv, 18, n, PULLED[p], cardUp, tr),
      stamps: carry(cv, 19, n, STAMPS[p], STAMPS[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const toaster = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const h = SCENE.value.holdT;
    return {
      transform: [
        { translateX: lerp(STAND.x, w[0].translateX, h) },
        { translateY: lerp(STAND.top - 8, w[1].translateY - 6, h) },
      ],
    };
  });
  const cards = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    return { opacity: SCENE.value.carrying, transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }] };
  });
  const pulled = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    return { opacity: SCENE.value.cardUp, transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }] };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.wall} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5].map((k) => <View key={k} style={[styles.course, { top: 20 + k * 32 }]} />)}
      </View>
      <Board S={SCENE} on={on} />
      <ObjectArt parts={RACK_ART} tone={WOOD} />
      <ObjectArt parts={STAND_ART} tone={WOOD} />
      <Animated.View style={[styles.rider, toaster]} pointerEvents="none">
        <View style={styles.toaster}>
          <View style={[styles.slot, { left: 5 }]} />
          <View style={[styles.slot, { left: 15 }]} />
          <View style={styles.lever} />
        </View>
      </Animated.View>
      <View style={styles.ground} pointerEvents="none" />
      <ObjectArt parts={MACHINE_ART} tone={STEEL} />
      <ObjectArt parts={PANEL_ART} tone={STEEL} />
      <Gear S={SCENE} />
      <Lamps S={SCENE} on={on} />
      <Crank S={SCENE} />
      <OutCard S={SCENE} />
      <Stickman D={DF} k={K_L} />
      <Animated.View style={[styles.rider, cards]} pointerEvents="none">
        <View style={[styles.card, { transform: [{ rotate: '-8deg' }] }]} />
        <View style={[styles.card, { left: -3, top: -8, transform: [{ rotate: '6deg' }] }]} />
      </Animated.View>
      <Animated.View style={[styles.rider, pulled]} pointerEvents="none">
        <View style={[styles.card, { transform: [{ rotate: '-12deg' }] }]} />
      </Animated.View>
      {STAMPS[i] ? <Stamps picked={picked} onPick={onPick} S={SCENE} /> : null}
    </View>
  );
}

const MACHINE_ART = machine();
const PANEL_ART = panel();
const STAND_ART = standArt();
const RACK_ART = rack();

// ── the board: premises, conclusion, FALSE, and the strike ──────────────────

function Board({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  return (
    <View style={styles.board} pointerEvents="none">
      <BoardLine S={S} k={0} show={on(P1_ON)} />
      <BoardLine S={S} k={1} show={on(P2_ON)} />
      <BoardLine S={S} k={2} show={on(OUT)} />
    </View>
  );
}
function BoardLine({ S, k, show }: { S: SharedValue<any>; k: number; show: boolean }) {
  const line = useAnimatedStyle(() => {
    const v = k === 0 ? S.value.p1 : k === 1 ? S.value.p2 : S.value.concl;
    return { opacity: Math.min(1, v * 3), width: 214 * v };
  });
  const glow = useAnimatedStyle(() => ({ opacity: k < 2 ? S.value.premGlow : 0 }));
  const stamp = useAnimatedStyle(() => {
    const f = k === 0 ? S.value.f1 : k === 1 ? S.value.f2 : S.value.f3;
    return { opacity: f, transform: [{ scale: 1.6 - 0.6 * f }, { rotate: '-7deg' }] };
  });
  const strike = useAnimatedStyle(() => ({ width: 176 * (k === 2 ? S.value.struck : 0) }));
  if (!show) return null;
  return (
    <View style={[styles.lineRow, { top: 8 + k * 19 }]}>
      <Animated.View style={[styles.lineGlow, glow]} />
      <Text style={styles.lineTag} numberOfLines={1}>{LINES_TEXT[k].tag}</Text>
      <Animated.View style={[styles.lineClip, line]}>
        <Text style={styles.lineText} numberOfLines={1}>{LINES_TEXT[k].text}</Text>
      </Animated.View>
      <Animated.View style={[styles.falseStamp, stamp]}>
        <Text style={styles.falseText} numberOfLines={1}>FALSE</Text>
      </Animated.View>
      {k === 2 ? <Animated.View nativeID="strike-conclusion" style={[styles.strike, strike]} /> : null}
    </View>
  );
}

// ── the machine's moving parts ───────────────────────────────────────────────

function Gear({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.turns * 360}deg` }] }));
  const glow = useAnimatedStyle(() => ({ opacity: S.value.gearGlow }));
  return (
    <>
      <Animated.View style={[styles.gearGlow, glow]} pointerEvents="none" />
      <Animated.View style={[styles.gear, st]} pointerEvents="none">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <View key={k} style={[styles.tooth, { transform: [{ rotate: `${k * 30}deg` }] }]} />
        ))}
        <View style={styles.hub} />
      </Animated.View>
    </>
  );
}
function Lamps({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const valid = useAnimatedStyle(() => ({ opacity: Math.max(S.value.validLit, 0.15) }));
  const sound = useAnimatedStyle(() => ({ opacity: Math.max(S.value.soundLit, 0.15) }));
  const no = useAnimatedStyle(() => ({ opacity: S.value.soundNo }));
  const labels = useAnimatedStyle(() => ({ opacity: S.value.lamps }));
  return (
    <>
      <Animated.View style={[styles.lamp, { left: LAMPS.valid - 6 }, valid]} pointerEvents="none" />
      <Animated.View style={[styles.lamp, { left: LAMPS.sound - 6 }, sound]} pointerEvents="none" />
      <Animated.Text style={[styles.lampNo, no]} pointerEvents="none">✕</Animated.Text>
      {on(LAMPS_ON) ? (
        <Animated.View style={[StyleSheet.absoluteFill, labels]} pointerEvents="none">
          <View style={[styles.lampPlate, { left: LAMPS.valid - 19 }]}>
            <Text style={styles.lampText} numberOfLines={1}>VALID</Text>
          </View>
          <View style={[styles.lampPlate, { left: LAMPS.sound - 19 }]}>
            <Text style={styles.lampText} numberOfLines={1}>SOUND</Text>
          </View>
        </Animated.View>
      ) : null}
    </>
  );
}
function Crank({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.turns * 360}deg` }] }));
  return (
    <Animated.View style={[styles.crankArm, st]} pointerEvents="none">
      <View style={styles.crankBar} />
      <View style={styles.crankKnob} />
    </Animated.View>
  );
}
function OutCard({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: Math.min(1, S.value.card * 4),
    // the conclusion rises out of the slot on top, the way toast comes up
    transform: [{ translateY: -13 * S.value.card }],
  }));
  return <Animated.View style={[styles.outCard, st]} pointerEvents="none" />;
}

// ── Q1: three rubber stamps on the wall ─────────────────────────────────────

function Stamps({ picked, onPick, S }: { picked: string | null; onPick: (id: string, ok: boolean) => void; S: SharedValue<any> }) {
  const answered = picked !== null;
  const fade = useAnimatedStyle(() => ({ opacity: S.value.stamps, transform: [{ translateX: (1 - S.value.stamps) * 10 }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fade]} pointerEvents="box-none">
      {STAMP_Q.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={3}
          disabled={answered} sealAt="tr"
          style={[styles.stampTarget, { top: q.y }]}
        >
          <View style={styles.stampFill}>
            <View style={[styles.stampFace, answered && q.correct && styles.faceRight]}>
              <Text style={[styles.stampText, answered && q.correct && styles.onInk]} numberOfLines={1}>{q.label}</Text>
            </View>
            <View style={styles.stampKnob} />
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
  wall: {
    position: 'absolute', left: 0, top: 292, width: STAGE_W, height: GROUND - 292, backgroundColor: WALL.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  course: { position: 'absolute', left: 0, right: 0, height: 1, borderRadius: 0.5, backgroundColor: WALL.RULE },
  rider: { position: 'absolute', left: 0, top: 0 },

  board: {
    position: 'absolute', left: BOARD.x0, top: BOARD.top, width: BOARD.x1 - BOARD.x0, height: BOARD.bottom - BOARD.top,
    borderRadius: 4, borderWidth: 2, borderColor: INK, backgroundColor: DEEP, boxShadow: lipOf(WOOD),
  },
  lineRow: { position: 'absolute', left: 6, right: 6, height: 16, flexDirection: 'row', alignItems: 'center' },
  lineGlow: { position: 'absolute', left: -3, right: -3, top: 0, bottom: 0, borderRadius: 3, backgroundColor: TEAL },
  lineTag: {
    marginRight: 6, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, color: SAGE, includeFontPadding: false,
  },
  lineClip: { overflow: 'hidden', height: 12 },
  lineText: {
    width: 214, fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 12, letterSpacing: 0, color: PAPER_LIT,
    includeFontPadding: false,
  },
  falseStamp: {
    position: 'absolute', right: 0, top: 1, paddingHorizontal: 3, height: 13, borderRadius: 2, borderWidth: 1.5,
    borderColor: EMBER, backgroundColor: DEEP, justifyContent: 'center',
  },
  falseText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: PAPER_LIT, includeFontPadding: false,
  },
  strike: { position: 'absolute', left: 16, top: 6.5, height: 1.8, borderRadius: 0.9, backgroundColor: EMBER },

  toaster: {
    position: 'absolute', left: -14, top: -12, width: 28, height: 18, borderRadius: 5, backgroundColor: STEEL.STONE,
    borderWidth: 1.5, borderColor: INK,
  },
  slot: { position: 'absolute', top: 2, width: 8, height: 2.5, borderRadius: 1, backgroundColor: INK },
  lever: { position: 'absolute', right: -3, top: 6, width: 4, height: 6, borderRadius: 1, backgroundColor: INK },
  card: {
    position: 'absolute', left: -6, top: -10, width: 14, height: 10, borderRadius: 1.5, backgroundColor: PAPER_LIT,
    borderWidth: 1, borderColor: INK,
  },

  gearGlow: {
    position: 'absolute', left: GEAR.x - GEAR.r - 5, top: GEAR.y - GEAR.r - 5, width: 2 * GEAR.r + 10,
    height: 2 * GEAR.r + 10, borderRadius: GEAR.r + 5, backgroundColor: SAGE,
  },
  gear: {
    position: 'absolute', left: GEAR.x - GEAR.r, top: GEAR.y - GEAR.r, width: 2 * GEAR.r, height: 2 * GEAR.r,
    borderRadius: GEAR.r, backgroundColor: STEEL.STONE, borderWidth: 1.5, borderColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  tooth: { position: 'absolute', width: 2 * GEAR.r + 6, height: 4, borderRadius: 1, backgroundColor: STEEL.STONE, borderWidth: 1, borderColor: INK },
  hub: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: INK },
  lamp: {
    position: 'absolute', top: LAMPS.y - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: SAGE,
    borderWidth: 1.5, borderColor: INK,
  },
  lampNo: {
    position: 'absolute', left: LAMPS.sound - 5, top: LAMPS.y - 8, fontFamily: 'Inter_700Bold', fontSize: 12,
    lineHeight: 14, color: EMBER, includeFontPadding: false,
  },
  lampPlate: {
    position: 'absolute', top: LAMPS.y + 9, width: 38, height: 13, borderRadius: 2, borderWidth: 1.2, borderColor: INK,
    backgroundColor: PLATE_FACE, alignItems: 'center', justifyContent: 'center',
  },
  lampText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  crankArm: { position: 'absolute', left: CRANK.x - 1, top: CRANK.y - 1, width: 2, height: 2 },
  crankBar: {
    position: 'absolute', left: 0, top: -1.5, width: CRANK.r + 2, height: 3, borderRadius: 1.5, backgroundColor: INK,
    transformOrigin: '0% 50%',
  },
  crankKnob: {
    position: 'absolute', left: CRANK.r - 2, top: -3.5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: WOOD.SHADE,
    borderWidth: 1, borderColor: INK,
  },
  outCard: {
    position: 'absolute', left: SLOT_OUT.x - 7, top: SLOT_OUT.y - 2, width: 14, height: 12, borderRadius: 1.5,
    backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK,
  },

  stampTarget: { position: 'absolute', left: RACK.x0, width: RACK.x1 - RACK.x0, height: 20 },
  stampFill: { flexGrow: 1, flexDirection: 'row', alignItems: 'center' },
  stampFace: {
    flexGrow: 1, height: 16, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  faceRight: { backgroundColor: INK },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  stampKnob: { marginLeft: 2, width: 8, height: 12, borderRadius: 3, backgroundColor: WOOD.SHADE, borderWidth: 1, borderColor: INK },
  onInk: { color: PAPER_LIT },
});

export function Valid3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Valid3Scene} band={[288, 514]} camera={CAM} />;
}
