import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { attendAt } from './attend';
import { BEATS } from './political4Script';
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
import { PORTAL, PORTAL_Z, portalAt, portalSwapAt, portalXf, portalScale, wordsAt } from './portal';
import {
  fence, soapbox, gardenTable, well, desks, doorway, bookshelf, wainscot,
  FENCE, SOAPBOX, CAKE, PRIMER, WELL, CHART, CHART_A, PAGE_A_H, DOOR, DESKS, HOOK,
} from './political4Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// political-political-4, "Freedom vs. Control" — A FENCED GARDEN, AND A SCHOOLROOM.
//
// Redrawn 2026-09-27: the fourth lesson of the branch in reading order, with a scene
// change (portal.ts). Every act is laid across its voiced line in stages.
//
//   b0   he walks into his own garden past the end of its fence.
//   b1   NEGATIVE LIBERTY: the garden inside the fence is his.
//   b2   HARM PRINCIPLE: the top of the fence lights along its whole line.
//   b3   his own business: he eats the slice of cake off the table, then gets up on
//        the soapbox and speaks.
//   b4   he steps down and goes to the gate; the well is outside it: HARM TO OTHERS.
//   b5   on the quote he takes the reading primer off the table and opens it.
//   b6   THE CHANGE: into the big A on the primer's page, out of the big A on a
//        schoolroom's wall chart. POSITIVE LIBERTY.
//   b7   PUBLIC SCHOOL lights over the door.
//   b9   Q2: a ring finds the open door, the newspaper, the satchel, the chart (R7c).
//
// COMPOSITION, in stage units. The garden: the fence 34–300 from 452, the soapbox at
// 120, the table 196–240 with the cake at 230 and the primer at 212, the well at 354.
// The schoolroom: the open door 16–56, the satchel on its hook at 76, desks at 104 and
// 166, the wall chart 272–344 × 336–404, the bookshelf 356–396. He stands at 250, 120
// (on the soapbox), 262 and 236 in the garden, and 250 in the schoolroom.
// Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('political');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const STONE = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, political-political-4. */
const LINES = [7.56, 6.72, 7.24, 9.08, 8, 0, 10.36, 5.52, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;
const MID = { x: STAGE_W / 2, y: 401 };
/** The page's A is smaller than the chart's by this, so the garden is pushed in that much deeper. */
const Z_GARDEN = PORTAL_Z * (CHART_A.h / PAGE_A_H);
/**
 * How long the camera holds before it pushes in on the change beat: time for him to
 * step clear of the thing it goes into, so he leaves the frame at his own size
 * rather than being faded out while he is large (portal.ts, STAND CLEAR).
 */
const DELAY = 1.3;
/** Where he stands the open primer on the garden table — the camera goes into its A there. */
const PRIMER_REST = { x: 224, y: 464 };
/** Where he steps back to before the push: toward the gate, clear of the primer. */
const GARDEN_BACK = 302;
/** When he steps back: once the primer is standing, before the camera moves. */
const BACK_AT = 0.6;
/** The crossover on the change beat, where he can change place or turn unseen. */
const SWAP_FROM = portalSwapAt(Z_GARDEN, undefined, DELAY) - PORTAL.swapFor / 2;
/** The primer, held open: where the page's A sits from his hand. */
const A_FROM_HAND = { x: -8, y: -9 };
/** b0: in from outside the fence. b3: across to the soapbox. b4: across to the gate. */
const IN_FROM = 318;
const TO_BOX = 2.6;
const TO_GATE = 0.8;
const BOX_RISE = (GROUND - SOAPBOX.top);

const X = BEATS.map((b) => b.x ?? 250);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_ENTER = is('enter');
const A_NEG = is('negative');
const A_HARM = is('harm');
const A_OWN = is('own');
const A_OTHERS = is('others');
const A_PRIMER = is('primer');
const A_SCHOOL = is('school');
const A_STATE = is('state');
const flag = (f: (b: (typeof BEATS)[number]) => unknown) => BEATS.map((b) => (f(b) ? 1 : 0));
const NEG = flag((b) => b.neg);
const HARM = flag((b) => b.harm);
const CAKE_GONE = flag((b) => b.cake);
const OTHERS = flag((b) => b.others);
const HOLDING = BEATS.map((b) => (b.primer && !b.school ? 1 : 0));
const SCHOOL = flag((b) => b.school);
const STATE = flag((b) => b.state);
/** The odd-one-out is being answered: a ring finds each tile's thing in the schoolroom (R7c). */
const ODD = flag((b) => b.interact?.odd);
/** In the tiles' own order: not imprisoned (the open door), not censored (the newspaper), not searched (the satchel), taught to read (the chart). */
const PICK_X = [(DOOR.x0 + DOOR.x1) / 2, DESKS[0], HOOK.x, (CHART.x0 + CHART.x1) / 2];
const PICK_Y = [446, 458, HOOK.y + 8, (CHART.top + CHART.bottom) / 2];
const PICK_R = [30, 16, 14, 40];
/** Which way he faces once each beat settles. */
const DIR = [-1, -1, -1, 1, 1, -1, 1, 1, 1, 1, 1];

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
function handOn(s: Stance, x: number, gy: number, dir: number, tx: number, ty: number, w: number): Stance {
  'worklet';
  return w <= 0 ? s : reachHandTo(s, { x, groundY: gy, k: K_M, dir: dir < 0 ? -1 : 1 }, 1, tx, ty, w);
}
function legAt(b: number, from: number, to: number, start: number): { x: number; u: number } {
  'worklet';
  const dur = moveTr(from, to, TR);
  const u = ease01(clamp01((b - start) / dur));
  return { x: lerp(from, to, u), u };
}

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political'));

export default function Political4Scene({
  clock, bt, bi, i, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(17);
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
    const pt = portalAt(b, Z_GARDEN, undefined, DELAY);
    const world = A_SCHOOL[n] ? pt.world : SCHOOL[n];
    const kGarden = A_SCHOOL[n] ? pt.out : SCHOOL[n];
    const kSchool = A_SCHOOL[n] ? pt.into : 1 - SCHOOL[n];

    // ── where he is, and what he stands on ───────────────────────────────────
    const xp = X[p];
    const xn = X[n];
    const leg = A_ENTER[n] ? legAt(b, IN_FROM, xn, 0.6) : A_OWN[n] ? legAt(b, xp, xn, TO_BOX) : A_OTHERS[n] ? legAt(b, xp, xn, TO_GATE) : null;
    const walking = !leg && !A_SCHOOL[n] && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    const swapU = pt.swapU;
    // THE CHANGE, STAGED (portal.ts, STAND CLEAR): he stands the primer open on the table,
    // steps back toward the gate, and only then does the camera push into its A — so the
    // push carries him out of frame at his own size instead of fading him out.
    const backDur = moveTr(xp, GARDEN_BACK, TR);
    const backU = A_SCHOOL[n] ? ease01(clamp01((b - BACK_AT) / backDur)) : 0;
    const backWalk = A_SCHOOL[n] && world < 0.5 && backU > 0 && backU < 1;
    const target = A_SCHOOL[n] ? (world < 0.5 ? lerp(xp, GARDEN_BACK, backU) : xn) : leg ? leg.x : xn;
    const x = n === 0 ? target : carry(cv, 0, n, xp, target, A_SCHOOL[n] ? 1 : leg ? 1 : walking ? walkU : tr);
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    if (backWalk) s = travelStance(xp, GARDEN_BACK, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), backU, WALK, 0);
    if (leg && leg.u > 0 && leg.u < 1) {
      const from = A_ENTER[n] ? IN_FROM : xp;
      s = travelStance(from, xn, hHold(P[n], t), hHold(P[n], t), hLive(P[n], t, b), leg.u, WALK, 0);
    }
    // up onto the soapbox at the end of b3, down off it at the start of b4
    const arriveBox = TO_BOX + moveTr(250, SOAPBOX.x, TR);
    const onBox = A_OWN[n] ? sec(arriveBox + 0.15, arriveBox + 0.55) : A_OTHERS[n] ? 1 - sec(0.15, 0.55) : 0;
    const gy = GROUND - BOX_RISE * onBox;
    const stepLift = A_OWN[n] ? pulse(arriveBox + 0.15, arriveBox + 0.35, arriveBox + 0.55) : A_OTHERS[n] ? pulse(0.15, 0.35, 0.55) : 0;
    s = { ...s, footR: { x: s.footR.x + 4 * stepLift, y: s.footR.y - 10 * stepLift } };
    const was = facing(DIR[p], DIR[p], b);
    // stepping back toward the gate he turns the way he walks, and keeps facing it
    let dirV = A_SCHOOL[n]
      ? facing(DIR[p], DIR[n], b - BACK_AT)
      : walking
        ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
        : facing(DIR[p], DIR[n], b);
    // b3 eats facing the table, walks left to the box, and turns to speak from it
    if (A_OWN[n]) dirV = lerp(lerp(was, -1, sec(TO_BOX - 0.3, TO_BOX)), 1, sec(arriveBox + 0.6, arriveBox + 0.9));
    const dir = dirV < 0 ? -1 : 1;

    // ── the cake (b3): off the table, eaten ─────────────────────────────────
    const take = A_OWN[n] ? pulse(0.4, 0.8, 1.2) : 0;
    s = handOn(s, x, gy, dir, CAKE.x, CAKE.y - 2, take);
    const eat = A_OWN[n] ? pulse(1.1, 1.6, 2.3) : 0;
    s = mixStance(s, { ...s, fistR: { x: 10, y: -52 } }, eat);
    // ── speaking from the soapbox (b3), pointing to the well (b4) ───────────
    const speak = A_OWN[n] ? pulse(arriveBox + 0.9, arriveBox + 1.4, arriveBox + 3.6) : 0;
    s = mixStance(s, { ...s, fistR: { x: 14, y: -74 } }, speak);
    const point = A_OTHERS[n] ? pulse(TO_GATE + 2.7, TO_GATE + 3.1, TO_GATE + 5.4) : 0;
    s = handOn(s, x, gy, dir, WELL.x - 14, WELL.top + 10, point);
    // ── the primer (b5): off the table, held open ───────────────────────────
    const pick = A_PRIMER[n] ? pulse(1.0, 1.4, 1.8) : 0;
    s = handOn(s, x, gy, dir, PRIMER.x, PRIMER.y - 2, pick);
    const setDown = A_SCHOOL[n] ? pulse(0.05, 0.35, 0.6) : 0;
    const placed = A_SCHOOL[n] ? sec(0.3, 0.38) : 0;
    const holding = A_PRIMER[n] ? sec(1.7, 2.2) : A_SCHOOL[n] ? 1 - placed : HOLDING[n];
    s = mixStance(s, { ...s, fistR: { x: 18, y: -32 }, fistL: { x: 12, y: -30 } }, holding * (1 - pick) * (1 - setDown));
    // on the change beat he stands it open on the table and lets go
    s = handOn(s, x, gy, dir, PRIMER_REST.x, PRIMER_REST.y - 6, setDown);
    // ── at the chart in the schoolroom (b7) ─────────────────────────────────
    const chart = A_STATE[n] ? pulse(1.2, 1.7, 4.6) : 0;
    s = handOn(s, x, gy, dir, CHART.x0 + 6, 396, chart);

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the garden ───────────────────────────────────────────────────────────
    const neg = A_NEG[n] ? st(0.18, 0.3) : NEG[n];
    const line = A_HARM[n] ? st(0.3, 0.5) : HARM[n];
    const harm = A_HARM[n] ? st(0.28, 0.38) : HARM[n];
    const eaten = A_OWN[n] ? sec(0.75, 0.85) : CAKE_GONE[n];
    const inHand = A_OWN[n] ? sec(0.75, 0.85) * (1 - sec(2.1, 2.2)) : 0;
    const others = A_OTHERS[n] ? st(0.42, 0.52) : OTHERS[n];
    const primerHeld = A_PRIMER[n] ? sec(1.35, 1.45) : HOLDING[n] || A_SCHOOL[n] ? 1 : 0;

    // ── the schoolroom ───────────────────────────────────────────────────────
    const positive = A_SCHOOL[n] ? sec((PORTAL.outTo + DELAY) + 0.2, (PORTAL.outTo + DELAY) + 0.6) : SCHOOL[n];
    const state = A_STATE[n] ? st(0.28, 0.4) : STATE[n];

    // ── WHERE HE LOOKS (attend.ts): at the thing in hand, the thing lighting up ──
    const page = x + 14 * dir;
    const LK = A_ENTER[n] ? [1.0, 180, 462, 0.7, 3.0, 0, 0, 0]
      : A_NEG[n] ? [L * 0.15, 150, 452, 1, L * 0.8, 0, 0, 0]
      : A_HARM[n] ? [L * 0.26, 60, 452, 1, L * 0.36, 180, 452, 1, L * 0.48, 290, 452, 1, L * 0.85, 0, 0, 0]
      : A_OWN[n] ? [0.2, CAKE.x, CAKE.y, 1, 1.0, 0, 0, 0, arriveBox + 0.6, 200, 440, 0.5, arriveBox + 3.4, 0, 0, 0]
      : A_OTHERS[n] ? [TO_GATE + 1.0, WELL.x, WELL.top + 16, 1, L * 0.9, WELL.x, WELL.top + 16, 0.6]
      : A_PRIMER[n] ? [0.6, PRIMER.x, PRIMER.y, 1, 1.8, page, gy - 38, 1]
      : A_SCHOOL[n] ? [(PORTAL.outTo + DELAY), CHART_A.x, CHART_A.y, 1]
      : A_STATE[n] ? [0.4, CHART_A.x, CHART_A.y, 1, L * 0.26, (DOOR.x0 + DOOR.x1) / 2, DOOR.top - 12, 1, L * 0.8, 0, 0, 0]
      : ODD[n] ? [0.3, 160, 430, 0.6]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    return {
      fig: hideLeadWhile(lookPose(fig, x, gy, K_M, dirV, 1, carry(cv, 14, n, lk.x, lk.x, tr), carry(cv, 15, n, lk.y, lk.y, tr), carry(cv, 16, n, 0, lk.w, tr)), A_SCHOOL[n] === 1 && b < (PORTAL.outTo + DELAY) + 0.2),
      world: carry(cv, 1, n, SCHOOL[p], world, A_SCHOOL[n] ? 1 : tr),
      kGarden: carry(cv, 2, n, SCHOOL[p], kGarden, A_SCHOOL[n] ? 1 : tr),
      kSchool: carry(cv, 3, n, 1 - SCHOOL[p], kSchool, A_SCHOOL[n] ? 1 : tr),
      neg: carry(cv, 4, n, NEG[p], neg, tr),
      line: carry(cv, 5, n, HARM[p], line, tr),
      harm: carry(cv, 6, n, HARM[p], harm, tr),
      eaten: carry(cv, 7, n, CAKE_GONE[p], eaten, tr),
      inHand: carry(cv, 8, n, 0, inHand, tr),
      others: carry(cv, 9, n, OTHERS[p], others, tr),
      primerHeld: carry(cv, 10, n, HOLDING[p], primerHeld, tr),
      placed: A_SCHOOL[n] && world < 0.5 ? placed : 0,
      positive: carry(cv, 11, n, SCHOOL[p], positive, tr),
      state: carry(cv, 12, n, STATE[p], state, tr),
      ring: carry(cv, 13, n, 0, ODD[n], tr),
      ringX: ODD[n] ? pickAt(PICK_X, pickPos.value) : PICK_X[0],
      ringY: ODD[n] ? pickAt(PICK_Y, pickPos.value) : PICK_Y[0],
      ringR: ODD[n] ? pickAt(PICK_R, pickPos.value) : PICK_R[0],
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  // the garden goes in towards the A on the page he holds open
  const gardenXf = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    return {
      opacity: 1 - SCENE.value.world,
      ...portalXf(SCENE.value.kGarden, lerp(w[0].translateX, PRIMER_REST.x, SCENE.value.placed) + A_FROM_HAND.x, lerp(w[1].translateY, PRIMER_REST.y, SCENE.value.placed) + A_FROM_HAND.y, MID.x, MID.y, Z_GARDEN),
    };
  });
  const schoolXf = useAnimatedStyle(() => ({
    opacity: SCENE.value.world > 0.001 ? 1 : 0,
    ...portalXf(SCENE.value.kSchool, CHART_A.x, CHART_A.y, MID.x, MID.y),
  }));
  const figXf = useAnimatedStyle(() => {
    const inSchool = SCENE.value.world >= 0.5;
    const k = inSchool ? SCENE.value.kSchool : SCENE.value.kGarden;
    const w = DF.value.wrR;
    const s = inSchool ? portalScale(k) : portalScale(k, Z_GARDEN);
    const xf = inSchool
      ? portalXf(k, CHART_A.x, CHART_A.y, MID.x, MID.y)
      : portalXf(k, lerp(w[0].translateX, PRIMER_REST.x, SCENE.value.placed) + A_FROM_HAND.x, lerp(w[1].translateY, PRIMER_REST.y, SCENE.value.placed) + A_FROM_HAND.y, MID.x, MID.y, Z_GARDEN);
    return { opacity: 1, ...xf };
  });
  const schoolWords = useDerivedValue(() => (SCENE.value.world >= 0.5 ? wordsAt(SCENE.value.kSchool) : 0));
  const gardenWords = useDerivedValue(() => (1 - SCENE.value.world) * wordsAt(SCENE.value.kGarden));

  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.set, schoolXf]} pointerEvents="none">
        <School S={SCENE} />
      </Animated.View>
      <Animated.View style={[styles.set, gardenXf]} pointerEvents="none">
        <Garden S={SCENE} />
        <Held S={SCENE} DF={DF} />
      </Animated.View>
      {/* THE WORDS ARE LAID OVER THE SETS, NOT INSIDE THEM. The must-box probe reads a
          word inside a transparent plate, and a set still nine times over on the change
          beat puts that hidden word far off the stage (check:space). A word only shows
          once its set has landed at scale 1, so over the sets is where it belongs. */}
      <SchoolWords S={SCENE} words={schoolWords} on={on} />
      <GardenWords S={SCENE} words={gardenWords} />
      <Animated.View style={[styles.set, figXf]} pointerEvents="none">
        <Stickman D={DF} k={K_M} />
      </Animated.View>
      {on(ODD) ? <PickRing S={SCENE} /> : null}
    </View>
  );
}

const FENCE_ART = fence();
const BOX_ART = soapbox();
const TABLE_ART = gardenTable();
const WELL_ART = well();
const DESK_ART = desks();
const DOOR_ART = doorway();
const SHELF_ART = bookshelf();
const WAINSCOT_ART = wainscot();
/** The wainscot is painted wood, a shade deeper than the wall above it. */
const PANEL = { ...stageToneOf(TEAL), STONE: stageToneOf(TEAL).STONE };

/** A capital A drawn in strokes, not type, so a zoom through it is a picture, not a word. */
function LetterA({ h, x, y, color }: { h: number; x: number; y: number; color: string }) {
  const w = h * 0.84;
  const len = Math.hypot(w / 2, h);
  const deg = (Math.atan2(h, w / 2) * 180) / Math.PI;
  const t = Math.max(1.4, h * 0.13);
  return (
    <View style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h }}>
      <View style={{ position: 'absolute', left: w / 2 - len / 2, top: h / 2 - t / 2, width: len, height: t, borderRadius: t / 2, backgroundColor: color, transform: [{ translateX: -w / 4 }, { rotate: `${-deg}deg` }] }} />
      <View style={{ position: 'absolute', left: w / 2 - len / 2, top: h / 2 - t / 2, width: len, height: t, borderRadius: t / 2, backgroundColor: color, transform: [{ translateX: w / 4 }, { rotate: `${deg}deg` }] }} />
      <View style={{ position: 'absolute', left: w * 0.27, top: h * 0.6, width: w * 0.46, height: t, borderRadius: t / 2, backgroundColor: color }} />
    </View>
  );
}

// ── the garden ───────────────────────────────────────────────────────────────

function Garden({ S }: { S: SharedValue<any> }) {
  const plot = useAnimatedStyle(() => ({ opacity: 0.45 * S.value.neg }));
  const line = useAnimatedStyle(() => ({ opacity: S.value.line, transform: [{ scaleX: S.value.line }] }));
  const cake = useAnimatedStyle(() => ({ opacity: 1 - S.value.eaten }));
  const primer = useAnimatedStyle(() => ({ opacity: 1 - S.value.primerHeld }));
  return (
    <>
      <View style={styles.sky} />
      <View style={styles.grass} />
      <Animated.View style={[styles.plot, plot]} />
      <ObjectArt parts={FENCE_ART} tone={WOOD} />
      <Animated.View style={[styles.fenceLine, line]} />
      <ObjectArt parts={WELL_ART} tone={STONE} />
      <Bucket S={S} />
      <ObjectArt parts={BOX_ART} tone={WOOD} />
      <ObjectArt parts={TABLE_ART} tone={WOOD} />
      <Animated.View style={[styles.cake, { left: CAKE.x - 6, top: CAKE.y - 6 }, cake]}>
        <View style={styles.icing} />
      </Animated.View>
      <Animated.View style={[styles.primerShut, primer]} />
      <View style={styles.gardenFloor} />
    </>
  );
}
/** The garden's words. */
function GardenWords({ S, words }: { S: SharedValue<any>; words: SharedValue<number> }) {
  const neg = useAnimatedStyle(() => ({ opacity: S.value.neg * words.value }));
  const harm = useAnimatedStyle(() => ({ opacity: S.value.harm * words.value }));
  const others = useAnimatedStyle(() => ({ opacity: S.value.others * words.value }));
  return (
    <>
      <Animated.View style={[styles.plate, styles.negPlate, neg]}>
        <Text style={styles.plateText} numberOfLines={1}>NEGATIVE LIBERTY</Text>
      </Animated.View>
      <Animated.View style={[styles.plate, styles.harmPlate, harm]}>
        <Text style={styles.plateText} numberOfLines={1}>HARM PRINCIPLE</Text>
      </Animated.View>
      <Animated.View style={[styles.plate, styles.othersPlate, others]}>
        <Text style={styles.plateText} numberOfLines={1}>HARM TO OTHERS</Text>
      </Animated.View>
    </>
  );
}
function Bucket({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${6 * Math.sin(S.value.t * 1.4)}deg` }] }));
  return (
    <Animated.View style={[styles.bucketRope, st]}>
      <View style={styles.bucket} />
    </Animated.View>
  );
}
function Held({ S, DF }: { S: SharedValue<any>; DF: SharedValue<Bundle> }) {
  // the slice of cake on its way to his mouth (b3), and the primer held open (b5, b6)
  const cake = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    return { opacity: S.value.inHand, transform: [{ translateX: w[0].translateX - 5 }, { translateY: w[1].translateY - 6 }] };
  });
  const primer = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const u = S.value.placed;
    return {
      opacity: S.value.primerHeld,
      transform: [{ translateX: lerp(w[0].translateX, PRIMER_REST.x, u) }, { translateY: lerp(w[1].translateY, PRIMER_REST.y, u) }],
    };
  });
  return (
    <>
      <Animated.View style={[styles.rider, cake]}>
        <View style={styles.cakeSlice} />
      </Animated.View>
      <Animated.View style={[styles.rider, primer]}>
        <View style={styles.pageL} />
        <View style={styles.pageR}>
          {[0, 1, 2].map((k) => <View key={k} style={[styles.pageRule, { top: 4 + k * 4 }]} />)}
        </View>
        <LetterA h={PAGE_A_H} x={A_FROM_HAND.x} y={A_FROM_HAND.y} color={INK} />
      </Animated.View>
    </>
  );
}

// ── the schoolroom ───────────────────────────────────────────────────────────

function School({ S }: { S: SharedValue<any> }) {
  const lamp = useAnimatedStyle(() => ({ opacity: 0.4 + 0.6 * S.value.state }));
  return (
    <>
      <View style={styles.schoolWall} />
      <SetArt parts={WAINSCOT_ART} tone={PANEL} />
      <View style={styles.outside} />
      <SetArt parts={DOOR_ART} tone={WOOD} />
      <View style={styles.hook} />
      <View style={styles.satchel} />
      <View style={styles.chart}>
        {[0, 1, 2, 3].map((k) => <View key={k} style={[styles.chartRule, { top: 14 + k * 11 }]} />)}
      </View>
      <LetterA h={CHART_A.h} x={CHART_A.x} y={CHART_A.y} color={INK} />
      <SetArt parts={DESK_ART} tone={WOOD} />
      <View style={styles.paper} />
      <SetArt parts={SHELF_ART} tone={WOOD} />
      <View style={styles.books}>
        {[0, 1, 2, 3, 4].map((k) => <View key={k} style={[styles.bookSpine, { left: 3 + k * 6, height: 14 + (k % 3) * 3 }]} />)}
      </View>
      <View style={styles.cord} />
      <View style={styles.globe} />
      <Animated.View style={[styles.glow, lamp]} />
      <View style={styles.schoolFloor} />
    </>
  );
}
/** The schoolroom's words. */
function SchoolWords({ S, words, on }: { S: SharedValue<any>; words: SharedValue<number>; on: (a: readonly number[]) => boolean }) {
  const positive = useAnimatedStyle(() => ({ opacity: S.value.positive * words.value }));
  const sign = useAnimatedStyle(() => ({ opacity: S.value.state * words.value }));
  return (
    <>
      {on(SCHOOL) ? (
        <Animated.View style={[styles.plate, styles.posPlate, positive]}>
          <Text style={styles.plateText} numberOfLines={1}>POSITIVE LIBERTY</Text>
        </Animated.View>
      ) : null}
      {on(STATE) ? (
        <Animated.View style={[styles.plate, styles.signPlate, sign]}>
          <Text style={styles.plateText} numberOfLines={1}>PUBLIC SCHOOL</Text>
        </Animated.View>
      ) : null}
    </>
  );
}
function PickRing({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => {
    const r = S.value.ringR;
    return {
      opacity: S.value.ring * (0.75 + 0.25 * Math.sin(S.value.t * 4)),
      width: 2 * r, height: 2 * r, borderRadius: r,
      transform: [{ translateX: S.value.ringX - r }, { translateY: S.value.ringY - r }],
    };
  });
  return <Animated.View style={[styles.pickRing, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  set: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0 },

  // ── the garden ────────────────────────────────────────────────────────────
  sky: { position: 'absolute', left: 0, right: 0, top: 288, height: 170, backgroundColor: stageToneOf(TEAL).STONE },
  grass: { position: 'absolute', left: 0, right: 0, top: 452, height: 48, backgroundColor: stageToneOf(SAGE).SHADE },
  plot: { position: 'absolute', left: FENCE.x0, top: 452, width: FENCE.x1 - FENCE.x0, height: 48, backgroundColor: PAPER_LIT },
  fenceLine: {
    position: 'absolute', left: FENCE.x0 - 4, top: FENCE.top - 6, width: FENCE.x1 - FENCE.x0 + 8, height: 3, borderRadius: 1.5,
    backgroundColor: EMBER, transformOrigin: '0% 50%',
  },
  bucketRope: { position: 'absolute', left: WELL.x - 0.6, top: WELL.top - 16, width: 1.2, height: 18, backgroundColor: INK, transformOrigin: '50% 0%' },
  bucket: { position: 'absolute', left: -4, top: 16, width: 9, height: 7, borderRadius: 1.5, backgroundColor: WOOD.SHADE, borderWidth: 1, borderColor: INK },
  cake: {
    position: 'absolute', width: 12, height: 8, borderRadius: 1.5, backgroundColor: stageToneOf(OLIVE).STONE,
    borderWidth: 1, borderColor: INK, overflow: 'hidden',
  },
  icing: { position: 'absolute', left: 0, right: 0, top: 0, height: 3, backgroundColor: EMBER },
  cakeSlice: {
    position: 'absolute', left: 0, top: 0, width: 10, height: 7, borderRadius: 1.5, backgroundColor: stageToneOf(OLIVE).STONE,
    borderTopWidth: 3, borderTopColor: EMBER, borderWidth: 1, borderColor: INK,
  },
  primerShut: {
    position: 'absolute', left: PRIMER.x - 9, top: PRIMER.y - 1, width: 18, height: 5, borderRadius: 1, backgroundColor: DEEP,
    borderWidth: 1, borderColor: INK,
  },
  pageL: {
    position: 'absolute', left: A_FROM_HAND.x - 10, top: A_FROM_HAND.y - 11, width: 18, height: 22, borderRadius: 1.5,
    backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK,
  },
  pageR: {
    position: 'absolute', left: A_FROM_HAND.x + 8, top: A_FROM_HAND.y - 11, width: 16, height: 22, borderRadius: 1.5,
    backgroundColor: PAPER_LIT, borderWidth: 1, borderColor: INK,
  },
  pageRule: { position: 'absolute', left: 3, width: 9, height: 1, borderRadius: 0.5, backgroundColor: INK, opacity: 0.4 },
  gardenFloor: floorStyle(TONE, GROUND),

  // ── the schoolroom ────────────────────────────────────────────────────────
  schoolWall: { position: 'absolute', left: 0, right: 0, top: 288, height: GROUND - 288, backgroundColor: WALL.STONE },
  outside: {
    position: 'absolute', left: DOOR.x0, top: DOOR.top, width: DOOR.x1 - DOOR.x0, height: GROUND - DOOR.top, borderRadius: 1,
    backgroundColor: PAPER_LIT,
  },
  hook: { position: 'absolute', left: HOOK.x - 1.5, top: HOOK.y - 4, width: 3, height: 5, borderRadius: 1, backgroundColor: INK },
  satchel: {
    position: 'absolute', left: HOOK.x - 7, top: HOOK.y, width: 14, height: 14, borderRadius: 3, backgroundColor: WOOD.SHADE,
    borderWidth: 1.2, borderColor: INK,
  },
  chart: {
    position: 'absolute', left: CHART.x0, top: CHART.top, width: CHART.x1 - CHART.x0, height: CHART.bottom - CHART.top,
    borderRadius: 1.5, backgroundColor: PAPER_LIT, borderWidth: 1.5, borderColor: INK, overflow: 'hidden',
  },
  chartRule: { position: 'absolute', left: 52, width: 14, height: 1.2, borderRadius: 0.6, backgroundColor: INK, opacity: 0.4 },
  paper: {
    position: 'absolute', left: DESKS[0] - 10, top: 456, width: 16, height: 6, borderRadius: 1, backgroundColor: PAPER_LIT,
    borderWidth: 1, borderColor: INK, transform: [{ rotate: '-6deg' }],
  },
  books: { position: 'absolute', left: 360, top: 424, width: 34, height: 22 },
  bookSpine: { position: 'absolute', bottom: 0, width: 5, borderRadius: 1, backgroundColor: EMBER, borderWidth: 0.8, borderColor: INK },
  cord: { position: 'absolute', left: 196.4, top: 288, width: 1.2, height: 18, backgroundColor: INK },
  globe: {
    position: 'absolute', left: 190, top: 305, width: 14, height: 14, borderRadius: 7, backgroundColor: PAPER_LIT,
    borderWidth: 1.4, borderColor: INK,
  },
  glow: { position: 'absolute', left: 193, top: 308, width: 8, height: 8, borderRadius: 4, backgroundColor: EMBER },
  schoolFloor: floorStyle(TONE, GROUND),
  pickRing: { position: 'absolute', left: 0, top: 0, borderWidth: 2.5, borderColor: EMBER },

  // ── the words ─────────────────────────────────────────────────────────────
  plate: {
    position: 'absolute', height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  // high in the sky over the fence: on the soapbox his head stands where they used to be
  negPlate: { left: 18, top: 358, width: 106 },
  harmPlate: { left: 18, top: 340, width: 98 },
  othersPlate: { left: 306, top: 404, width: 92 },
  posPlate: { left: 96, top: 330, width: 104 },
  signPlate: { left: 4, top: 378, width: 88 },
});

export function Political4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political4Scene} band={[288, 514]} camera={CAM} />;
}
