import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { BEATS } from './metaphysics4Script';
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
import { attendAt } from './attend';
import { PORTAL, PORTAL_Z, portalAt, portalSwapAt, portalXf, portalScale, wordsAt } from './portal';
import {
  desk, box, bust, frame, range, hill, meadow, road, roadNot, ruts, gate, cliff, water, post, onCanvas,
  DESK, BOX, BUST, CANVAS, MINI, ARM_IS, ARM_NOT, LANTERN, GATE, FALL, ACORN, FOCUS_ROAD, POST,
} from './metaphysics4Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// metaphysics-being-4, "Can Nothing Truly Exist?" — A STUDY, AND THE ROAD IN ITS
// PAINTING.
//
// Redrawn 2026-09-27: the fourth lesson of the branch in reading order, and the first
// with a scene change (portal.ts). Every act is laid across its voiced line in stages.
//
//   b0   in the study he lifts the lid of an empty box: NOTHING. PARMENIDES.
//   b1   thinking of nothing, the thought rises out of the empty box, glowing.
//   b2   he takes it, and in his hand it is a solid thing: SOMETHING.
//   b3   THE CHANGE: the camera pushes into the painting on the wall and comes out in
//        it — a crossroads at dusk. The signpost reads IT IS and IT IS NOT.
//   b4   he takes the road up to the lit gate; the other road goes into the fog.
//   b6   change is ruled out: the waterfall and a falling leaf stop dead. NO CHANGE.
//   b7   by an acorn on the path; for Aristotle it grows into a sapling and the water
//        runs again: POTENTIAL, ACTUAL.
//   b9   Q2: the lantern on the signpost is full, emptied, and gone as the order moves.
//
// THE PAINTING IS THE ROAD, drawn by the same component at a quarter size, so the push
// into it is four times as deep as the pull out of the road and the two meet exactly.
//
// COMPOSITION, in stage units. The study: the desk 56–146 at 466 with the box at 126
// and the bust at 76; the painting 238–350 × 340–408. The road: the signpost at 250
// with its arms over 212–306 at 386–412, the gate on its hill at 64, the waterfall at
// 360, the acorn at 186. He stands at 150 in the study and lands at 150 on the road (clear of the fork the camera pulls back from), then 110 and 146.
// Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('metaphysics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const STONEWARE = stageToneOf(DEEP);
const GRASS = stageToneOf(SAGE);
/** Rock is olive-grey, not the pale teal — drawn in the sky's tone the cliff read as a block of ice. */
const ROCK = { RULE: WOOD.RULE, STONE: WOOD.STONE, SHADE: WOOD.SHADE, EDGE: WOOD.EDGE };
const SKY = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, metaphysics-being-4. */
const LINES = [8.04, 6, 4.84, 6.28, 7.36, 0, 8.28, 11.04, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;
/** The middle of the band, where the object a change goes into ends up. */
const MID = { x: STAGE_W / 2, y: 401 };
/** Into the painting: where the fork is on the canvas, and how deep the push goes. */
const FOCUS_STUDY = onCanvas(FOCUS_ROAD.x, FOCUS_ROAD.y);
const Z_STUDY = PORTAL_Z / MINI;
/** The crossover on the change beat, where he can change place or turn unseen. */
const SWAP_FROM = portalSwapAt(Z_STUDY) - PORTAL.swapFor / 2;

const X = BEATS.map((b) => b.x ?? 146);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_BOX = is('box');
const A_THINK = is('think');
const A_TAKE = is('take');
const A_ENTER = is('enter');
const A_REJECT = is('reject');
const A_FREEZE = is('freeze');
const A_GROW = is('grow');
const flag = (f: (b: (typeof BEATS)[number]) => unknown) => BEATS.map((b) => (f(b) ? 1 : 0));
const OPEN = flag((b) => b.open);
const ORB = flag((b) => b.orb);
const ROAD = flag((b) => b.road);
const CHOSEN = flag((b) => b.chosen);
const FROZEN = flag((b) => b.frozen);
const GROWN = flag((b) => b.grown);
/** In the study he holds the thing the thought became; on the road his hands are free. */
const HELD = BEATS.map((b) => (b.orb && !b.road ? 1 : 0));
/** The order control is being answered: the lantern is full, emptied, gone (R7c). */
const ORDER = flag((b) => b.interact?.order);
const LIT_AT = [1, 0, 0];
const FIELD_AT = [0, 1, 0];
const GONE_AT = [0, 0, 1];
/** Which way he faces once each beat settles: the box on his left; on the road, the fork's sign, the gate, the water. */
const DIR = BEATS.map((b) => (!b.road ? -1 : b.act === 'reject' || (b.x === 110 && !b.frozen) ? -1 : 1));

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

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics'));

export default function Metaphysics4Scene({
  clock, bt, bi, i, gazeX, gazeY, gazeOn, pickPos,
}: SceneApi) {
  const held = useHeld();
  const cv = useCarry(23);
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

    // ── the change (b3), and which set he is in otherwise ───────────────────
    const pt = portalAt(b, Z_STUDY);
    const world = A_ENTER[n] ? pt.world : ROAD[n];
    const kStudy = A_ENTER[n] ? pt.out : ROAD[n];
    const kRoad = A_ENTER[n] ? pt.into : 1 - ROAD[n];

    // ── where he is ──────────────────────────────────────────────────────────
    const xp = X[p];
    const xn = X[n];
    const walking = !A_ENTER[n] && Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    // across the change he is moved while he cannot be seen, and turned the same way
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

    // ── the box's lid (b0), the thought (b1), the thing in his hand (b2) ────
    const lidHand = A_BOX[n] ? pulse(0.8, 1.2, 2.0) : 0;
    s = handOn(s, x, dir, BOX.x + 6, DESK.top - BOX.h - 2 - 10 * sec(1.2, 1.6), lidHand);
    const take = A_TAKE[n] ? pulse(0.4, 0.9, 1.3) : 0;
    s = handOn(s, x, dir, BOX.x, 440, take);
    const holding = A_TAKE[n] ? sec(0.85, 0.95) : HELD[n] * (1 - world);
    s = mixStance(s, { ...s, fistR: { x: 22, y: -22 } }, holding * (1 - take));
    // looking up at the thought as it rises (b1), and down at the acorn (b7)
    s = { ...s, neck: s.neck + 0.16 * (A_THINK[n] ? pulse(1.0, 2.0, 5.2) : 0) - 0.22 * (A_GROW[n] ? sec(arrive + 0.2, arrive + 0.8) : 0) };

    const fig = keepHeld(held, mixStance(carryFrom(held, n, hHold(P[p], t)), s, tr));

    // ── the study ────────────────────────────────────────────────────────────
    const lid = A_BOX[n] ? sec(1.1, 1.6) : OPEN[n];
    const rise = A_THINK[n] ? sec(1.0, 2.6) : ORB[n] || A_TAKE[n] ? 1 : 0;
    const solid = A_TAKE[n] ? sec(0.9, 1.5) : ORB[n];
    const parm = A_BOX[n] ? st(0.6, 0.7) : 1;
    const nothing = A_BOX[n] ? sec(1.6, 2.1) : OPEN[n];
    const thing = A_TAKE[n] ? sec(1.6, 2.1) : ORB[n];

    // ── the road ─────────────────────────────────────────────────────────────
    const dark = A_REJECT[n] ? st(0.45, 0.7) : CHOSEN[n];
    const frozen = A_FREEZE[n] ? st(0.08, 0.22) : A_GROW[n] ? 1 - st(0.62, 0.72) : FROZEN[n] && !GROWN[n] ? 1 : 0;
    const grown = A_GROW[n] ? st(0.55, 0.9) : GROWN[n];
    const noChange = A_FREEZE[n] ? st(0.3, 0.38) : FROZEN[n];
    const pot = A_GROW[n] ? st(0.62, 0.7) : GROWN[n];
    const act = A_GROW[n] ? st(0.86, 0.93) : GROWN[n];
    const litV = ORDER[n] ? pickAt(LIT_AT, pickPos.value) : 1;
    const fieldV = ORDER[n] ? pickAt(FIELD_AT, pickPos.value) : 0;
    const goneV = ORDER[n] ? pickAt(GONE_AT, pickPos.value) : 0;

    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // At what is happening, when it happens — and at nothing (weight 0, his pose's
    // own head) when nothing is. The generated gaze aimed every beat at the middle of
    // the picture, which on this set is the sky over the mountains.
    const LK = A_BOX[n] ? [0.3, BOX.x, DESK.top - 10, 1, L * 0.55, BUST.x, 440, 0.85, L * 0.85, 0, 0, 0]
      : A_THINK[n] ? [0.6, BOX.x, DESK.top - 8, 1, 1.0, BOX.x, lerp(DESK.top - 6, 440, rise), 1, 4.2, BOX.x, 440, 0.7, 6.0, 0, 0, 0]
      : A_TAKE[n] ? [0.1, BOX.x, 440, 1, 1.3, x - 22, 446, 1, 2.4, 110, 392, 0.8, 4.0, x - 22, 446, 0.8]
      : A_ENTER[n] ? [PORTAL.outTo, POST.x, ARM_IS.y, 1, PORTAL.outTo + 1.2, 0, 0, 0]
      : A_REJECT[n] ? [0.2, GATE.x + 8, 408, 1, L * 0.42, 330, 460, 0.9, L * 0.62, GATE.x + 8, 408, 1, L * 0.95, 0, 0, 0]
      : A_FREEZE[n] ? [L * 0.06, FALL.x, 452, 1, L * 0.3, 166, 428, 0.9, L * 0.55, FALL.x, 452, 0.8, L * 0.9, 0, 0, 0]
      : A_GROW[n] ? [arrive + 0.1, ACORN.x, GROUND - 6, 1, L * 0.55, ACORN.x, 470, 1, L * 0.8, ACORN.x, 452, 1, L * 0.95, FALL.x, 452, 0.6]
      : ORDER[n] ? [0.3, LANTERN.x, LANTERN.y, 1]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    return {
      fig: hideLeadWhile(lookPose(fig, x, GROUND, K_M, dirV, 1, carry(cv, 20, n, lk.x, lk.x, tr), carry(cv, 21, n, lk.y, lk.y, tr), carry(cv, 22, n, 0, lk.w, tr)), A_ENTER[n] === 1 && b < PORTAL.outTo + 0.2),
      world: carry(cv, 1, n, ROAD[p], world, A_ENTER[n] ? 1 : tr),
      kStudy: carry(cv, 2, n, ROAD[p], kStudy, A_ENTER[n] ? 1 : tr),
      kRoad: carry(cv, 3, n, 1 - ROAD[p], kRoad, A_ENTER[n] ? 1 : tr),
      lid: carry(cv, 4, n, OPEN[p], lid, tr),
      rise: carry(cv, 5, n, ORB[p], rise, tr),
      holding: carry(cv, 6, n, HELD[p], holding, tr),
      solid: carry(cv, 7, n, ORB[p], solid, tr),
      parm: carry(cv, 8, n, 1, parm, tr),
      nothing: carry(cv, 9, n, OPEN[p], nothing, tr),
      thing: carry(cv, 10, n, ORB[p], thing, tr),
      dark: carry(cv, 11, n, CHOSEN[p], dark, tr),
      frozen: carry(cv, 12, n, FROZEN[p] && !GROWN[p] ? 1 : 0, frozen, tr),
      grown: carry(cv, 13, n, GROWN[p], grown, tr),
      noChange: carry(cv, 14, n, FROZEN[p], noChange, tr),
      pot: carry(cv, 15, n, GROWN[p], pot, tr),
      act: carry(cv, 16, n, GROWN[p], act, tr),
      lit: carry(cv, 17, n, 1, litV, tr),
      field: carry(cv, 18, n, 0, fieldV, tr),
      gone: carry(cv, 19, n, 0, goneV, tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const studyXf = useAnimatedStyle(() => ({
    opacity: 1 - SCENE.value.world,
    ...portalXf(SCENE.value.kStudy, FOCUS_STUDY.x, FOCUS_STUDY.y, MID.x, MID.y, Z_STUDY),
  }));
  const roadXf = useAnimatedStyle(() => ({
    // the road is drawn whole beneath the study the moment the change starts, so the
    // dissolve at the deepest point never shows the paper through the middle of it
    opacity: SCENE.value.world > 0.001 ? 1 : 0,
    ...portalXf(SCENE.value.kRoad, FOCUS_ROAD.x, FOCUS_ROAD.y, MID.x, MID.y),
  }));
  const figXf = useAnimatedStyle(() => {
    const inRoad = SCENE.value.world >= 0.5;
    const k = inRoad ? SCENE.value.kRoad : SCENE.value.kStudy;
    const s = inRoad ? portalScale(k) : portalScale(k, Z_STUDY);
    const xf = inRoad
      ? portalXf(k, FOCUS_ROAD.x, FOCUS_ROAD.y, MID.x, MID.y)
      : portalXf(k, FOCUS_STUDY.x, FOCUS_STUDY.y, MID.x, MID.y, Z_STUDY);
    return { opacity: 1, ...xf };
  });
  const roadWords = useDerivedValue(() => (SCENE.value.world >= 0.5 ? wordsAt(SCENE.value.kRoad) : 0));
  const studyWords = useDerivedValue(() => (1 - SCENE.value.world) * wordsAt(SCENE.value.kStudy));

  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.set, roadXf]} pointerEvents="none">
        <Road S={SCENE} />
      </Animated.View>
      <Animated.View style={[styles.set, studyXf]} pointerEvents="none">
        <View style={styles.floor} />
        <View style={styles.wall}>
          {[0, 1, 2, 3, 4, 5].map((k) => <View key={k} style={[styles.course, { top: 18 + k * 30 }]} />)}
        </View>
        <ObjectArt parts={FRAME_ART} tone={WOOD} />
        <View style={styles.canvas}>
          <View style={styles.mini}>
            <Road S={SCENE} />
          </View>
        </View>
        <ObjectArt parts={DESK_ART} tone={WOOD} />
        <ObjectArt parts={BUST_ART} tone={STONEWARE} />
        <ObjectArt parts={BOX_ART} tone={WOOD} />
        <Lid S={SCENE} />
        <View style={styles.ground} />
      </Animated.View>
      {/* THE WORDS ARE LAID OVER THE SETS, NOT INSIDE THEM. The must-box probe reads a
          word inside a transparent plate, and a set still nine times over on the change
          beat puts that hidden word far off the stage (check:space). A word only shows
          once its set has landed at scale 1, so over the sets is where it belongs. */}
      <RoadWords S={SCENE} words={roadWords} on={on} />
      <StudyWords S={SCENE} words={studyWords} />
      <Animated.View style={[styles.set, figXf]} pointerEvents="none">
        <Thought S={SCENE} DF={DF} />
        <Stickman D={DF} k={K_M} />
      </Animated.View>
    </View>
  );
}

const DESK_ART = desk();
const BOX_ART = box();
const BUST_ART = bust();
const FRAME_ART = frame();
const RANGE_ART = range();
const HILL_ART = hill();
const MEADOW_ART = meadow();
const ROAD_ART = road();
const ROAD_NOT_ART = roadNot();
const RUT_ART = ruts();
const GATE_ART = gate();
const CLIFF_ART = cliff();
const WATER_ART = water();
const POST_ART = post();
/** The road is dirt: the olive's palest tone for the surface, its shade for the ruts. */
const DIRT = { RULE: WOOD.RULE, STONE: WOOD.RULE, SHADE: WOOD.SHADE, EDGE: WOOD.EDGE };

// ── the study: the box's lid, and the thought that becomes a thing ───────────

function Lid({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({ transform: [{ rotate: `${-115 * S.value.lid}deg` }] }));
  return <Animated.View style={[styles.lid, st]} />;
}
function Thought({ S, DF }: { S: SharedValue<any>; DF: SharedValue<Bundle> }) {
  const st = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    const h = S.value.holding;
    const inBox = { x: BOX.x, y: lerp(DESK.top - 6, 440, S.value.rise) };
    return {
      // it is in the study; on the road his hands are empty
      opacity: S.value.rise * (1 - S.value.world),
      transform: [
        { translateX: lerp(inBox.x, w[0].translateX, h) },
        { translateY: lerp(inBox.y, w[1].translateY - 2, h) + 1.5 * Math.sin(S.value.t * 2.2) * (1 - S.value.solid) },
      ],
    };
  });
  const glow = useAnimatedStyle(() => ({ opacity: (1 - S.value.solid) * (0.55 + 0.25 * Math.sin(S.value.t * 3)) }));
  const body = useAnimatedStyle(() => ({ opacity: 0.35 + 0.65 * S.value.solid }));
  return (
    <Animated.View style={[styles.rider, st]}>
      <Animated.View style={[styles.orbGlow, glow]} />
      <Animated.View style={[styles.orb, body]} />
    </Animated.View>
  );
}
function StudyWords({ S, words }: { S: SharedValue<any>; words: SharedValue<number> }) {
  const parm = useAnimatedStyle(() => ({ opacity: S.value.parm * words.value }));
  const nothing = useAnimatedStyle(() => ({ opacity: S.value.nothing * words.value }));
  const thing = useAnimatedStyle(() => ({ opacity: S.value.thing * words.value, transform: [{ translateY: (1 - S.value.thing) * -5 }] }));
  return (
    <>
      <Animated.View style={[styles.plate, styles.parmPlate, parm]}>
        <Text style={styles.plateText} numberOfLines={1}>PARMENIDES</Text>
      </Animated.View>
      <Animated.View style={[styles.tag, styles.nothingTag, nothing]}>
        <Text style={styles.plateText} numberOfLines={1}>NOTHING</Text>
      </Animated.View>
      <Animated.View style={[styles.plate, styles.thingPlate, thing]}>
        <Text style={styles.plateText} numberOfLines={1}>SOMETHING</Text>
      </Animated.View>
    </>
  );
}

// ── the road: drawn full size as the place, and at a quarter size as the painting ──

function Road({ S }: { S: SharedValue<any> }) {
  const fog = useAnimatedStyle(() => ({
    opacity: 0.45 + 0.4 * S.value.dark,
    transform: [{ translateX: 6 * Math.sin(S.value.t * 0.5) }],
  }));
  const notRoad = useAnimatedStyle(() => ({ opacity: 1 - 0.55 * S.value.dark }));
  const sun = useAnimatedStyle(() => ({ opacity: 0.55 + 0.35 * S.value.dark }));
  return (
    <>
      <View style={styles.sky} />
      <View style={styles.haze} />
      <Animated.View style={[styles.sun, sun]} />
      <SetArt parts={RANGE_ART} tone={SKY} line={1.6} />
      <SetArt parts={HILL_ART} tone={GRASS} />
      <SetArt parts={MEADOW_ART} tone={GRASS} />
      <View style={styles.roadFloor} />
      <SetArt parts={ROAD_ART} tone={DIRT} line={1.6} />
      <Animated.View style={[StyleSheet.absoluteFill, notRoad]}>
        <SetArt parts={ROAD_NOT_ART} tone={DIRT} line={1.6} />
      </Animated.View>
      <SetArt parts={RUT_ART} tone={DIRT} line={0} />
      <SetArt parts={GATE_ART} tone={WOOD} line={1.6} />
      <Animated.View style={[styles.fog, fog]} />
      <SetArt parts={CLIFF_ART} tone={ROCK} />
      <SetArt parts={WATER_ART} tone={SKY} line={1.6} />
      <Water S={S} />
      <Leaf S={S} />
      <Sapling S={S} />
      <SetArt parts={POST_ART} tone={WOOD} />
      <Lantern S={S} />
    </>
  );
}
function Water({ S }: { S: SharedValue<any> }) {
  return (
    <>
      {[0, 1, 2].map((k) => <Streak key={k} S={S} k={k} />)}
    </>
  );
}
function Streak({ S, k }: { S: SharedValue<any>; k: number }) {
  // the water runs down the fall; when change is ruled out it stands where it was
  const st = useAnimatedStyle(() => {
    const live = ((S.value.t * 0.9 + k / 3) % 1) * (FALL.bottom - FALL.top - 14);
    const still = ((k + 0.5) / 3) * (FALL.bottom - FALL.top - 14);
    return { transform: [{ translateY: lerp(live, still, S.value.frozen) }] };
  });
  return <Animated.View style={[styles.streak, { left: FALL.x - 4 + k * 4 }, st]} />;
}
function Leaf({ S }: { S: SharedValue<any> }) {
  // a leaf coming down from the hill's tree line; when change is ruled out it hangs
  const st = useAnimatedStyle(() => {
    const u = (S.value.t * 0.18) % 1;
    const lx = 150 + 26 * Math.sin(u * 9);
    const ly = 380 + 108 * u;
    return {
      opacity: Math.sin(Math.PI * lerp(u, 0.45, S.value.frozen)),
      transform: [
        { translateX: lerp(lx, 166, S.value.frozen) },
        { translateY: lerp(ly, 428, S.value.frozen) },
        { rotate: `${lerp(u * 540, 30, S.value.frozen)}deg` },
      ],
    };
  });
  return <Animated.View style={[styles.leaf, st]} />;
}
function Sapling({ S }: { S: SharedValue<any> }) {
  const acorn = useAnimatedStyle(() => ({ opacity: 1 - S.value.grown }));
  const stem = useAnimatedStyle(() => ({ transform: [{ scaleY: S.value.grown }] }));
  const leaves = useAnimatedStyle(() => ({ opacity: clamp01(S.value.grown * 2 - 1), transform: [{ scale: 0.4 + 0.6 * S.value.grown }] }));
  return (
    <>
      <Animated.View style={[styles.acorn, acorn]}>
        <View style={styles.acornCap} />
      </Animated.View>
      <Animated.View style={[styles.stem, stem]} />
      <Animated.View style={[styles.crown, leaves]} />
    </>
  );
}
function Lantern({ S }: { S: SharedValue<any> }) {
  const body = useAnimatedStyle(() => ({ opacity: 1 - 0.8 * S.value.gone }));
  const light = useAnimatedStyle(() => ({ opacity: S.value.lit * (0.75 + 0.2 * Math.sin(S.value.t * 7)) }));
  const field = useAnimatedStyle(() => ({ opacity: S.value.field }));
  return (
    <Animated.View style={[styles.lantern, body]}>
      <Animated.View style={[styles.lanternLight, light]} />
      <Animated.View style={[styles.lanternField, field]} />
      <Animated.View style={[styles.lanternField, styles.lanternField2, field]} />
    </Animated.View>
  );
}
function RoadWords({ S, words, on }: { S: SharedValue<any>; words: SharedValue<number>; on: (a: readonly number[]) => boolean }) {
  const signs = useAnimatedStyle(() => ({ opacity: words.value }));
  const noChange = useAnimatedStyle(() => ({ opacity: words.value * S.value.noChange * (1 - S.value.act) }));
  const pot = useAnimatedStyle(() => ({ opacity: words.value * S.value.pot }));
  const act = useAnimatedStyle(() => ({ opacity: S.value.act }));
  return (
    <>
      <Animated.Text style={[styles.armText, { left: ARM_IS.x0 + 6, top: ARM_IS.y - 5, width: ARM_IS.x1 - ARM_IS.x0 - 8 }, signs]} numberOfLines={1}>IT IS</Animated.Text>
      <Animated.Text style={[styles.armText, { left: ARM_NOT.x0 + 2, top: ARM_NOT.y - 5, width: ARM_NOT.x1 - ARM_NOT.x0 - 8 }, signs]} numberOfLines={1}>IT IS NOT</Animated.Text>
      {on(FROZEN) ? (
        <Animated.View style={[styles.plate, styles.changePlate, noChange]}>
          <Text style={styles.plateText} numberOfLines={1}>NO CHANGE</Text>
        </Animated.View>
      ) : null}
      {on(GROWN) ? (
        <Animated.View style={[styles.plate, styles.potPlate, pot]}>
          <Text style={styles.plateText} numberOfLines={1}>POTENTIAL</Text>
          <Animated.Text style={[styles.plateText, act]} numberOfLines={1}>ACTUAL</Animated.Text>
        </Animated.View>
      ) : null}
    </>
  );
}

const CANVAS_H = CANVAS.h;
const ROAD_TOP = 288;

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  set: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  rider: { position: 'absolute', left: 0, top: 0 },

  // ── the study ─────────────────────────────────────────────────────────────
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: {
    position: 'absolute', left: 0, top: ROAD_TOP, width: STAGE_W, height: GROUND - ROAD_TOP, backgroundColor: WALL.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  course: { position: 'absolute', left: 0, right: 0, height: 1, borderRadius: 0.5, backgroundColor: WALL.RULE },
  canvas: {
    position: 'absolute', left: CANVAS.x0, top: CANVAS.top, width: CANVAS.w, height: CANVAS_H, overflow: 'hidden',
    borderRadius: 1,
  },
  mini: {
    position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%',
    transform: [{ translateY: -ROAD_TOP * MINI }, { scale: MINI }],
  },
  lid: {
    position: 'absolute', left: BOX.x - BOX.w / 2, top: DESK.top - BOX.h - 3, width: BOX.w, height: 4, borderRadius: 1.5,
    backgroundColor: WOOD.SHADE, borderWidth: 1.2, borderColor: INK, transformOrigin: '0% 50%',
  },
  orbGlow: { position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: PAPER_LIT },
  orb: {
    position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: DEEP,
    borderWidth: 1.2, borderColor: INK,
  },

  // ── the road ──────────────────────────────────────────────────────────────
  sky: { position: 'absolute', left: 0, right: 0, top: ROAD_TOP, height: 170, backgroundColor: SKY.STONE },
  sun: { position: 'absolute', left: GATE.x - 13, top: 344, width: 26, height: 26, borderRadius: 13, backgroundColor: EMBER },
  haze: { position: 'absolute', left: 0, right: 0, top: 392, height: 70, backgroundColor: SKY.RULE, opacity: 0.7 },
  fog: {
    position: 'absolute', left: 280, top: 438, width: 150, height: 44, borderRadius: 22, backgroundColor: PAPER_LIT,
  },
  streak: { position: 'absolute', top: FALL.top + 4, width: 1.6, height: 10, borderRadius: 0.8, backgroundColor: SKY.SHADE },
  leaf: {
    position: 'absolute', left: -4, top: -2.5, width: 8, height: 5, borderRadius: 2.5, backgroundColor: OLIVE,
    borderWidth: 0.8, borderColor: INK,
  },
  acorn: {
    position: 'absolute', left: ACORN.x - 3.5, top: GROUND - 8, width: 7, height: 8, borderRadius: 3.5,
    backgroundColor: WOOD.SHADE, borderWidth: 1, borderColor: INK,
  },
  acornCap: { position: 'absolute', left: -1.5, top: -2.5, width: 8, height: 4, borderRadius: 2, backgroundColor: INK },
  stem: {
    position: 'absolute', left: ACORN.x - 1.5, top: 462, width: 3, height: GROUND - 462, borderRadius: 1.5,
    backgroundColor: WOOD.SHADE, transformOrigin: '50% 100%',
  },
  crown: {
    position: 'absolute', left: ACORN.x - 12, top: 446, width: 24, height: 20, borderRadius: 10, backgroundColor: OLIVE,
    borderWidth: 1.2, borderColor: INK,
  },
  lantern: {
    position: 'absolute', left: LANTERN.x - 6, top: LANTERN.y - 8, width: 12, height: 16, borderRadius: 3,
    borderWidth: 1.5, borderColor: INK, backgroundColor: SKY.SHADE, overflow: 'hidden',
  },
  lanternLight: { position: 'absolute', left: 2, top: 3, width: 5, height: 7, borderRadius: 2.5, backgroundColor: EMBER },
  lanternField: {
    position: 'absolute', left: 1, top: 2, width: 7, height: 9, borderRadius: 4.5, borderWidth: 0.8, borderColor: PAPER_LIT,
  },
  lanternField2: { left: 2.5, top: 4, width: 4, height: 5 },
  roadFloor: floorStyle(TONE, GROUND),

  // ── the words ─────────────────────────────────────────────────────────────
  plate: {
    position: 'absolute', borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  tag: {
    position: 'absolute', borderRadius: 2, borderWidth: 1.2, borderColor: INK, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center',
  },
  parmPlate: { left: BUST.x - 34, top: 404, width: 68, height: 14 },
  nothingTag: { left: BOX.x - 44, top: DESK.top + 4, width: 46, height: 13 },
  thingPlate: { left: 96, top: 386, width: 62, height: 14 },
  changePlate: { left: 322, top: 404, width: 70, height: 14 },
  potPlate: { left: 68, top: 374, width: 60, height: 26 },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  armText: {
    position: 'absolute', fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK,
    includeFontPadding: false, textAlign: 'center',
  },
});

export function Metaphysics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Metaphysics4Scene} band={[288, 514]} camera={CAM} />;
}
