import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import ObjectArt from './ObjectArt';
import SetArt from './SetArt';
import { attendAt } from './attend';
import { BEATS } from './aesthetics4Script';
import {
  WALK, clamp01, ease01, lerp, mixStance, moveTr, narratorHold, narratorLive, stand, travelStance,
  type Bundle, type Stance, mixKeepLegs,
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
import PortalIris from './PortalIris';
import {
  workTable, easel, plinth, frames, ropePosts, rope, windows, rails,
  PIECE_TABLE, EASELS, CANVAS_Y, PLINTH, PIECE_PLINTH, FRAMES, WINDOWS,
} from './aesthetics4Set';
import { DEEP, EMBER, OLIVE, SAGE, TEAL, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// aesthetics-aesthetics-4, "Can Anything Be Art?" — A STUDIO, AND THE EXHIBITION HALL
// OF 1917.
//
// Redrawn 2026-09-27: the fourth lesson of the branch in reading order, with a scene
// change (portal.ts). Every act is laid across its voiced line in stages.
//
//   b0   he pulls the cloth off a factory-made urinal on the work table.
//   b1   ART? stands over it.
//   b2   MIMESIS over the first easel: a painted apple beside a real one.
//   b3   EXPRESSION over the second: a painting of a feeling.
//   b4   he turns the urinal onto its back and signs it: R. MUTT 1917.
//   b5   THE CHANGE: into the signed urinal, out of the same urinal on a plinth in an
//        exhibition hall. A screen slides in front of it: REFUSED.
//   b6   the screen goes, a spotlight comes on, and its plate reads FOUNTAIN.
//   b8   a banner unrolls over the hall: THE ARTWORLD.
//   b11  Q2: a ring finds the title plate, a painting, or the banner, bin by bin (R7c).
//
// COMPOSITION, in stage units. The studio: the work table 130–214 with the urinal at
// 194, the easels at 44 and 98. The hall: the plinth at 196, the paintings 20–76 and
// 318–380, arched windows at 120 and 272, the rope's posts at 158 and 234. He stands
// at 232 in the studio and 250 in the hall. Band [288, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('aesthetics');
const { RULE } = TONE;
const LIP = lipOf(TONE);
const WALL = stageToneOf(SAGE);
const WOOD = stageToneOf(OLIVE);
const MARBLE = stageToneOf(TEAL);
const TR = 0.85;

/** Seconds each beat's line is voiced for — lib/narration/manifest.ts, aesthetics-aesthetics-4. */
const LINES = [7.68, 4.8, 7.68, 8, 7.24, 7.6, 7, 0, 9.08, 5.88, 0, 0, 0];

/** His scale: a lone figure at K_FIG fills 45% of this band; this is 37%. */
const K_M = K_FIG * 0.82;
const MID = { x: STAGE_W / 2, y: 401 };
/**
 * How long the camera holds before it pushes in on the change beat: time for him to
 * step clear of the thing it goes into, so he leaves the frame at his own size
 * rather than being faded out while he is large (portal.ts, STAND CLEAR).
 */
const DELAY = 1.2;
/**
 * THE CHANGE GOES THROUGH ONE FLAT COLOUR (portal.ts): into the basin of the urinal on
 * the table, out of the basin of the same urinal on the plinth. Both go 14 deep and the
 * basin's glaze grows out from its middle over the last of the push (PortalIris), so at
 * the swap the band is nothing but that glaze. The disc starts 3 across the middle,
 * clear of the drain (3.35 away) and of the basin's rim.
 */
const Z_PIECE = 14;
const SWAP_FROM = portalSwapAt(Z_PIECE, Z_PIECE, DELAY) - PORTAL.swapFor / 2;
/** The urinal's box, upright; on its back it is the same box turned a quarter. */
const PIECE = { w: 26, h: 30 };
/** Into the signed urinal on the table, out of it on the plinth: its middle, lying down. */
const FOCUS_STUDIO = { x: PIECE_TABLE.x, y: PIECE_TABLE.base - PIECE.w / 2 };
const FOCUS_HALL = { x: PIECE_PLINTH.x, y: PIECE_PLINTH.base - PIECE.w / 2 };

const X = BEATS.map((b) => b.x ?? 250);
const P = BEATS.map((b) => b.p ?? 0);
const ACT = BEATS.map((b) => b.act ?? '');
const is = (a: string) => ACT.map((v) => (v === a ? 1 : 0));
const A_UNVEIL = is('unveil');
const A_ASK = is('ask');
const A_MIM = is('mimesis');
const A_EXP = is('express');
const A_SIGN = is('sign');
const A_ENTER = is('enter');
const A_TITLE = is('title');
const A_ART = is('artworld');
const flag = (f: (b: (typeof BEATS)[number]) => unknown) => BEATS.map((b) => (f(b) ? 1 : 0));
const BARE = flag((b) => b.bare);
const ASKED = flag((b) => b.ask);
const MIM = flag((b) => b.mim);
const EXP = flag((b) => b.exp);
const SIGNED = flag((b) => b.signed);
const HALL = flag((b) => b.hall);
const TITLED = flag((b) => b.titled);
const ART = flag((b) => b.art);
/** The sort is being answered: a ring finds each bin's thing in the hall (R7c). */
const SORT = flag((b) => b.interact?.sort);
/** Each bin's thing, in the bins' own order: saying so (the title plate), skilled craft (a painting), the artworld (the banner). */
const PICK_X = [PLINTH.x, (FRAMES[0].x0 + FRAMES[0].x1) / 2, 196];
const PICK_Y = [PLINTH.top + 26, (FRAMES[0].top + FRAMES[0].bottom) / 2, 308];
const PICK_R = [30, 34, 34];
/** Which way he faces once each beat settles: the table, the plinth and the easels are on his left. */
const DIR = BEATS.map(() => -1);

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

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics'));

export default function Aesthetics4Scene({
  clock, bt, bi, i, gazeX, gazeY, gazeOn, pickPos,
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

    // ── the change (b5), and which set he is in otherwise ───────────────────
    const pt = portalAt(b, Z_PIECE, Z_PIECE, DELAY);
    const world = A_ENTER[n] ? pt.world : HALL[n];
    const kStudio = A_ENTER[n] ? pt.out : HALL[n];
    const kHall = A_ENTER[n] ? pt.into : 1 - HALL[n];

    // ── where he is ──────────────────────────────────────────────────────────
    const xp = X[p];
    const xn = X[n];
    // on the change beat he walks clear of the piece BEFORE the camera moves (DELAY), so
    // the push carries him out of frame at his own size — he is never faded (portal.ts)
    const walking = Math.abs(xn - xp) > 1;
    const walkDur = moveTr(xp, xn, TR);
    const walkU = walking ? ease01(b / walkDur) : 1;
    const swapU = pt.swapU;
    const x = n === 0 ? xn : carry(cv, 0, n, xp, xn, walking ? walkU : A_ENTER[n] ? swapU : tr);
    let s: Stance = walking
      ? travelStance(xp, xn, hHold(P[p], t), hHold(P[n], t), hLive(P[n], t, b), walkU, WALK, 0)
      : hLive(P[n], t, b);
    const dirV = walking
      ? lerp(facing(DIR[p], xn > xp ? 1 : -1, b), DIR[n], clamp01((b - walkDur) / 0.3))
      : facing(DIR[p], DIR[n], b);
    const dir = dirV < 0 ? -1 : 1;

    // ── the cloth pulled off (b0) ────────────────────────────────────────────
    const pull = A_UNVEIL[n] ? pulse(1.0, 1.4, 2.6) : 0;
    s = handOn(s, x, dir, 1, PIECE_TABLE.x + 12 + 8 * sec(1.4, 2.2), PIECE_TABLE.base - 20 + 6 * sec(1.4, 2.2), pull);
    // pointing to the easels (b2, b3)
    const point = A_MIM[n] ? pulse(2.6, 3.2, 6.4) : A_EXP[n] ? pulse(0.6, 1.2, 5.2) : 0;
    s = handOn(s, x, dir, 1, A_EXP[n] ? EASELS[1].x : EASELS[0].x, CANVAS_Y.top + 10, point);
    // ── turned onto its back, and signed (b4) ───────────────────────────────
    const turnHands = A_SIGN[n] ? pulse(0.5, 0.9, 2.4) : 0;
    s = handOn(s, x, dir, 1, PIECE_TABLE.x + 12, PIECE_TABLE.base - 18, turnHands);
    s = handOn(s, x, dir, -1, PIECE_TABLE.x + 10, PIECE_TABLE.base - 8, turnHands);
    // THE SIGNING IS WRITING (owner: *"if he grabs something to write on, he needs to
    // look down, visibly write on it"*). The brush comes up in his hand, he leans over the
    // piece, and the hand travels down the mark at the pace the paint goes on — a small
    // stroke-by-stroke wobble, not a wave.
    const signing = A_SIGN[n] ? pulse(3.0, 3.4, 5.4) : 0;
    const wrote = A_SIGN[n] ? sec(3.4, 5.0) : 0;
    s = handOn(s, x, dir, 1, PIECE_TABLE.x + 11 + 1.6 * Math.sin(b * 16) * signing, PIECE_TABLE.base - 19 + 12 * wrote, signing);
    s = { ...s, tilt: s.tilt - 0.12 * signing };

    const brush = A_SIGN[n] ? sec(2.6, 3.0) * (1 - sec(5.4, 5.9)) : 0;

    // on a walking beat the feet are the walk's own (rig.mixKeepLegs): blending them from
    // the last beat's standing feet dragged the planted foot along the floor
    const prevPose = carryFrom(held, n, hHold(P[p], t));
    const fig = keepHeld(held, (walking ? mixKeepLegs(prevPose, s, tr) : mixStance(prevPose, s, tr)));

    // ── the studio ───────────────────────────────────────────────────────────
    const bare = A_UNVEIL[n] ? sec(1.4, 2.4) : BARE[n];
    const ask = A_ASK[n] ? st(0.3, 0.45) : ASKED[n];
    const mim = A_MIM[n] ? st(0.4, 0.52) : MIM[n];
    const exp = A_EXP[n] ? st(0.12, 0.25) : EXP[n];
    const back = A_SIGN[n] ? sec(0.9, 2.0) : SIGNED[n];
    const sig = A_SIGN[n] ? sec(3.4, 5.0) : SIGNED[n];

    // ── the hall ─────────────────────────────────────────────────────────────
    const screen = A_ENTER[n] ? sec((PORTAL.outTo + DELAY) + 0.4, (PORTAL.outTo + DELAY) + 1.6) : A_TITLE[n] ? 1 - sec(0.4, 1.6) : 0;
    const refused = A_ENTER[n] ? sec((PORTAL.outTo + DELAY) + 1.8, (PORTAL.outTo + DELAY) + 2.1) : 0;
    const spot = A_TITLE[n] ? sec(1.4, 2.4) : TITLED[n];
    const title = A_TITLE[n] ? st(0.62, 0.72) : TITLED[n];
    const banner = A_ART[n] ? st(0.62, 0.8) : ART[n];

    // ── WHERE HE LOOKS (attend.ts): at what he handles and what appears ───────
    const LK = A_UNVEIL[n] ? [0.6, PIECE_TABLE.x, PIECE_TABLE.base - 16, 1, L * 0.85, PIECE_TABLE.x, PIECE_TABLE.base - 16, 0.6]
      : A_ASK[n] ? [0.2, PIECE_TABLE.x, PIECE_TABLE.base - 20, 1, L * 0.3, PIECE_TABLE.x, PIECE_TABLE.base - 44, 1, L * 0.9, 0, 0, 0]
      : A_MIM[n] ? [0.3, PIECE_TABLE.x, PIECE_TABLE.base - 16, 0.6, 2.4, EASELS[0].x, CANVAS_Y.top + 16, 1, L * 0.9, 0, 0, 0]
      : A_EXP[n] ? [0.4, EASELS[1].x, CANVAS_Y.top + 16, 1, L * 0.9, 0, 0, 0]
      : A_SIGN[n] ? [0.3, PIECE_TABLE.x + 10, PIECE_TABLE.base - 14, 1, 3.3, PIECE_TABLE.x + 11, PIECE_TABLE.base - 16, 1, 4.2, PIECE_TABLE.x + 11, PIECE_TABLE.base - 9, 1, 5.6, PIECE_TABLE.x - 20, 424, 0.8]
      : A_ENTER[n] ? [(PORTAL.outTo + DELAY), PLINTH.x, PLINTH.top - 8, 1]
      : A_TITLE[n] ? [0.4, PLINTH.x, PLINTH.top - 4, 1, L * 0.6, PLINTH.x, PLINTH.top + 26, 1]
      : A_ART[n] ? [L * 0.2, 196, 310, 1, L * 0.9, 0, 0, 0]
      : SORT[n] ? [0.3, 200, 380, 0.6]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, b, 0, 0, 0);

    return {
      brush: carry(cv, 16, n, 0, brush, tr),
      fig: hideLeadWhile(lookPose(fig, x, GROUND, K_M, dirV, 1, carry(cv, 17, n, lk.x, lk.x, tr), carry(cv, 18, n, lk.y, lk.y, tr), carry(cv, 19, n, 0, lk.w, tr)), A_ENTER[n] === 1 && b < (PORTAL.outTo + DELAY) + 0.2),
      world: carry(cv, 1, n, HALL[p], world, A_ENTER[n] ? 1 : tr),
      kStudio: carry(cv, 2, n, HALL[p], kStudio, A_ENTER[n] ? 1 : tr),
      kHall: carry(cv, 3, n, 1 - HALL[p], kHall, A_ENTER[n] ? 1 : tr),
      bare: carry(cv, 4, n, BARE[p], bare, tr),
      ask: carry(cv, 5, n, ASKED[p], ask, tr),
      mim: carry(cv, 6, n, MIM[p], mim, tr),
      exp: carry(cv, 7, n, EXP[p], exp, tr),
      back: carry(cv, 8, n, SIGNED[p], back, tr),
      sig: carry(cv, 9, n, SIGNED[p], sig, tr),
      screen: carry(cv, 10, n, 0, screen, tr),
      refused: carry(cv, 11, n, 0, refused, tr),
      spot: carry(cv, 12, n, TITLED[p], spot, tr),
      title: carry(cv, 13, n, TITLED[p], title, tr),
      banner: carry(cv, 14, n, ART[p], banner, tr),
      ring: carry(cv, 15, n, 0, SORT[n], tr),
      ringX: SORT[n] ? pickAt(PICK_X, pickPos.value) : PICK_X[0],
      ringY: SORT[n] ? pickAt(PICK_Y, pickPos.value) : PICK_Y[0],
      ringR: SORT[n] ? pickAt(PICK_R, pickPos.value) : PICK_R[0],
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const studioXf = useAnimatedStyle(() => ({
    opacity: 1 - SCENE.value.world,
    ...portalXf(SCENE.value.kStudio, FOCUS_STUDIO.x, FOCUS_STUDIO.y, MID.x, MID.y, Z_PIECE),
  }));
  const hallXf = useAnimatedStyle(() => ({
    opacity: SCENE.value.world > 0.001 ? 1 : 0,
    ...portalXf(SCENE.value.kHall, FOCUS_HALL.x, FOCUS_HALL.y, MID.x, MID.y, Z_PIECE),
  }));
  const figXf = useAnimatedStyle(() => {
    const inHall = SCENE.value.world >= 0.5;
    const k = inHall ? SCENE.value.kHall : SCENE.value.kStudio;
    const f = inHall ? FOCUS_HALL : FOCUS_STUDIO;
    return { opacity: 1, ...portalXf(k, f.x, f.y, MID.x, MID.y, Z_PIECE) };
  });
  const hallWords = useDerivedValue(() => (SCENE.value.world >= 0.5 ? wordsAt(SCENE.value.kHall) : 0));
  const studioWords = useDerivedValue(() => (1 - SCENE.value.world) * wordsAt(SCENE.value.kStudio));

  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.set, hallXf]} pointerEvents="none">
        <Hall S={SCENE} />
        <PortalIris S={SCENE} field="kHall" x={FOCUS_HALL.x} y={FOCUS_HALL.y} r0={3} z={Z_PIECE} color={MARBLE.STONE} />
      </Animated.View>
      <Animated.View style={[styles.set, studioXf]} pointerEvents="none">
        <View style={styles.floor} />
        <View style={styles.wall}>
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <View key={k} style={[styles.panel, { left: 6 + k * 57 }]} />)}
        </View>
        {EASEL_ART.map((art, k) => <ObjectArt key={k} parts={art} tone={WOOD} />)}
        <Canvases />
        <ObjectArt parts={TABLE_ART} tone={WOOD} />
        <Piece x={PIECE_TABLE.x} base={PIECE_TABLE.base} back={SCENE} />
        <Cloth S={SCENE} />
        <View style={styles.ground} />
        <PortalIris S={SCENE} field="kStudio" x={FOCUS_STUDIO.x} y={FOCUS_STUDIO.y} r0={3} z={Z_PIECE} color={MARBLE.STONE} />
      </Animated.View>
      {/* THE WORDS ARE LAID OVER THE SETS, NOT INSIDE THEM. The must-box probe reads a
          word inside a transparent plate, and a set still nine times over on the change
          beat puts that hidden word far off the stage (check:space). A word only shows
          once its set has landed at scale 1, so over the sets is where it belongs. */}
      <HallWords S={SCENE} words={hallWords} on={on} />
      <StudioWords S={SCENE} words={studioWords} />
      <Animated.View style={[styles.set, figXf]} pointerEvents="none">
        <Brush S={SCENE} DF={DF} />
        <Stickman D={DF} k={K_M} />
      </Animated.View>
      {on(SORT) ? <PickRing S={SCENE} /> : null}
    </View>
  );
}

const TABLE_ART = workTable();
const EASEL_ART = EASELS.map((e) => easel(e.x));
const PLINTH_ART = plinth();
const FRAME_ART = frames();
const ROPE_ART = ropePosts();
const VELVET_ART = rope();
const WINDOW_ART = windows();
const RAIL_ART = rails();
/** Gilt is the olive at its deepest; the rope is velvet, the ember's shade. */
const GILT = stageToneOf(OLIVE);
const VELVET = { ...stageToneOf(EMBER), SHADE: EMBER };

// ── the urinal: upright in the studio until it is turned onto its back ───────

function Piece({ x, base, back, lying }: { x: number; base: number; back?: SharedValue<any>; lying?: boolean }) {
  const st = useAnimatedStyle(() => {
    const u = lying ? 1 : back ? back.value.back : 0;
    return {
      transform: [
        { translateX: x - PIECE.w / 2 },
        { translateY: base - PIECE.h + lerp(0, (PIECE.h - PIECE.w) / 2, u) - 5 * Math.sin(Math.PI * u) },
        { rotate: `${-90 * u}deg` },
      ],
    };
  });
  const sig = useAnimatedStyle(() => {
    const v = lying ? 1 : back ? back.value.sig : 0;
    return { opacity: v > 0.01 ? 1 : 0, transform: [{ scaleX: v }] };
  });
  return (
    <Animated.View style={[styles.piece, st]}>
      <View style={styles.pieceRim} />
      <View style={styles.basin} />
      <View style={styles.drain} />
      <Animated.View style={[styles.paint, sig]} />
    </Animated.View>
  );
}
/** The brush, in his right hand while he signs, pointing down at the piece. */
function Brush({ S, DF }: { S: SharedValue<any>; DF: SharedValue<Bundle> }) {
  const st = useAnimatedStyle(() => {
    const w = DF.value.wrR;
    return {
      opacity: S.value.brush,
      transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }, { rotate: `${-24 * DF.value.dir}deg` }],
    };
  });
  return (
    <Animated.View style={[styles.rider, st]}>
      <View style={styles.brush} />
      <View style={styles.bristle} />
    </Animated.View>
  );
}
function Cloth({ S }: { S: SharedValue<any> }) {
  const st = useAnimatedStyle(() => ({
    opacity: 1 - S.value.bare,
    transform: [{ translateX: 14 * S.value.bare }, { translateY: 10 * S.value.bare }, { rotate: `${12 * S.value.bare}deg` }],
  }));
  return <Animated.View style={[styles.cloth, st]} />;
}
function Canvases() {
  return (
    <>
      <View style={[styles.canvas, { left: EASELS[0].x - 17 }]}>
        <View style={styles.paintedApple} />
        <View style={styles.paintedLeaf} />
      </View>
      <View style={styles.realApple} />
      <View style={[styles.canvas, { left: EASELS[1].x - 17 }]}>
        <View style={styles.wave1} />
        <View style={styles.wave2} />
        <View style={styles.tearSun} />
      </View>
    </>
  );
}
function StudioWords({ S, words }: { S: SharedValue<any>; words: SharedValue<number> }) {
  const ask = useAnimatedStyle(() => ({ opacity: S.value.ask * words.value * (1 - S.value.sig) }));
  const mim = useAnimatedStyle(() => ({ opacity: S.value.mim * words.value }));
  const exp = useAnimatedStyle(() => ({ opacity: S.value.exp * words.value }));
  const sig = useAnimatedStyle(() => ({ opacity: S.value.sig * words.value }));
  return (
    <>
      <Animated.View style={[styles.plate, styles.askPlate, ask]}>
        <Text style={styles.plateText} numberOfLines={1}>ART?</Text>
      </Animated.View>
      <Animated.View style={[styles.plate, styles.mimPlate, mim]}>
        <Text style={styles.plateText} numberOfLines={1}>MIMESIS</Text>
      </Animated.View>
      <Animated.View style={[styles.plate, styles.expPlate, exp]}>
        <Text style={styles.plateText} numberOfLines={1}>EXPRESSION</Text>
      </Animated.View>
      <Animated.View style={[styles.plate, styles.sigPlate, sig]}>
        <Text style={styles.plateText} numberOfLines={1}>R. MUTT 1917</Text>
      </Animated.View>
    </>
  );
}

// ── the hall ─────────────────────────────────────────────────────────────────

function Hall({ S }: { S: SharedValue<any> }) {
  const screen = useAnimatedStyle(() => ({ transform: [{ translateX: lerp(-240, 0, S.value.screen) }] }));
  const spot = useAnimatedStyle(() => ({ opacity: 0.3 * S.value.spot }));
  return (
    <>
      <View style={styles.hallWall} />
      <SetArt parts={RAIL_ART} tone={MARBLE} line={1.4} />
      <SetArt parts={WINDOW_ART} tone={WOOD} />
      <SetArt parts={FRAME_ART} tone={GILT} />
      <View style={[styles.painting, { left: FRAMES[0].x0 + 4, top: FRAMES[0].top + 4, width: FRAMES[0].x1 - FRAMES[0].x0 - 8, height: FRAMES[0].bottom - FRAMES[0].top - 8 }]}>
        <View style={styles.paintSea} />
        <View style={styles.paintSun} />
      </View>
      <View style={[styles.painting, { left: FRAMES[1].x0 + 4, top: FRAMES[1].top + 4, width: FRAMES[1].x1 - FRAMES[1].x0 - 8, height: FRAMES[1].bottom - FRAMES[1].top - 8 }]}>
        <View style={styles.sitterCrown} />
        <View style={styles.sitterCoat} />
      </View>
      <View style={styles.marble} />
      <Animated.View style={[styles.spot, spot]} />
      <SetArt parts={PLINTH_ART} tone={MARBLE} />
      <Piece x={PIECE_PLINTH.x} base={PIECE_PLINTH.base} lying />
      <SetArt parts={ROPE_ART} tone={GILT} />
      <SetArt parts={VELVET_ART} tone={VELVET} />
      <Animated.View style={[styles.screen, screen]}>
        {[0, 1, 2].map((k) => <View key={k} style={[styles.screenPanel, { left: k * 22 }]} />)}
      </Animated.View>
      <View style={styles.hallFloor} />
    </>
  );
}
/** The hall's words: the stamp on the screen (it rides the screen), the title, the banner. */
function HallWords({ S, words, on }: { S: SharedValue<any>; words: SharedValue<number>; on: (a: readonly number[]) => boolean }) {
  const stamp = useAnimatedStyle(() => ({
    opacity: S.value.refused * words.value,
    transform: [{ translateX: lerp(-120, 0, S.value.screen) }, { scale: 1.3 - 0.3 * S.value.refused }, { rotate: '-8deg' }],
  }));
  const title = useAnimatedStyle(() => ({ opacity: S.value.title * words.value }));
  const banner = useAnimatedStyle(() => ({ transform: [{ scaleY: Math.max(0.02, S.value.banner) }], opacity: S.value.banner > 0.01 ? 1 : 0 }));
  const bannerText = useAnimatedStyle(() => ({ opacity: clamp01(S.value.banner * 2 - 1) * words.value }));
  return (
    <>
      {on(ART) ? (
        <Animated.View style={[styles.banner, banner]}>
          <Animated.Text style={[styles.plateText, bannerText]} numberOfLines={1}>THE ARTWORLD</Animated.Text>
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.stamp, stamp]}>
        <Text style={styles.stampText} numberOfLines={1}>REFUSED</Text>
      </Animated.View>
      {on(TITLED) ? (
        <Animated.View style={[styles.plate, styles.titlePlate, title]}>
          <Text style={styles.plateText} numberOfLines={1}>FOUNTAIN</Text>
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

const CANVAS_H = CANVAS_Y.bottom - CANVAS_Y.top;

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  set: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },

  // ── the studio ────────────────────────────────────────────────────────────
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 0, right: 0, top: GROUND, height: 1.5, backgroundColor: RULE },
  wall: {
    position: 'absolute', left: 0, top: 288, width: STAGE_W, height: GROUND - 288, backgroundColor: WALL.STONE,
    borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden',
  },
  panel: { position: 'absolute', top: 0, bottom: 0, width: 1, borderRadius: 0.5, backgroundColor: WALL.RULE },
  canvas: {
    position: 'absolute', top: CANVAS_Y.top, width: 34, height: CANVAS_H, borderRadius: 1, backgroundColor: PAPER_LIT,
    borderWidth: 1.5, borderColor: WOOD.SHADE, overflow: 'hidden',
  },
  paintedApple: { position: 'absolute', left: 9, top: 12, width: 14, height: 13, borderRadius: 7, backgroundColor: EMBER },
  paintedLeaf: { position: 'absolute', left: 16, top: 8, width: 7, height: 4, borderRadius: 2, backgroundColor: OLIVE },
  realApple: {
    position: 'absolute', left: EASELS[0].x - 6, top: CANVAS_Y.bottom - 11, width: 11, height: 10, borderRadius: 5.5,
    backgroundColor: EMBER, borderWidth: 1, borderColor: INK,
  },
  wave1: { position: 'absolute', left: -4, top: 18, width: 42, height: 10, borderRadius: 5, backgroundColor: DEEP },
  wave2: { position: 'absolute', left: -4, top: 26, width: 42, height: 12, borderRadius: 6, backgroundColor: TEAL },
  tearSun: { position: 'absolute', left: 18, top: 5, width: 9, height: 9, borderRadius: 4.5, backgroundColor: EMBER },
  piece: {
    position: 'absolute', left: 0, top: 0, width: PIECE.w, height: PIECE.h, borderRadius: 6, borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13, backgroundColor: PAPER_LIT, borderWidth: 1.5, borderColor: INK, transformOrigin: '50% 50%',
  },
  pieceRim: { position: 'absolute', left: 3, top: 3, right: 3, height: 3, borderRadius: 1.5, backgroundColor: MARBLE.SHADE },
  basin: {
    position: 'absolute', left: 5, top: 10, width: PIECE.w - 13, height: 14, borderRadius: 7, backgroundColor: MARBLE.STONE,
    borderWidth: 1, borderColor: INK,
  },
  drain: { position: 'absolute', left: PIECE.w / 2 - 4.5, top: 18, width: 3, height: 3, borderRadius: 1.5, backgroundColor: INK },
  paint: { position: 'absolute', left: 4, bottom: 3, width: 12, height: 2, borderRadius: 1, backgroundColor: INK, transformOrigin: '0% 50%' },
  rider: { position: 'absolute', left: 0, top: 0 },
  brush: { position: 'absolute', left: -0.9, top: -1, width: 1.8, height: 11, borderRadius: 0.9, backgroundColor: INK, transformOrigin: '50% 0%' },
  bristle: { position: 'absolute', left: -1.6, top: 9, width: 3.2, height: 4, borderRadius: 1.6, backgroundColor: INK },
  cloth: {
    position: 'absolute', left: PIECE_TABLE.x - 17, top: PIECE_TABLE.base - PIECE.h - 4, width: 34, height: PIECE.h + 4,
    borderTopLeftRadius: 14, borderTopRightRadius: 14, borderRadius: 3, backgroundColor: OLIVE, borderWidth: 1.2, borderColor: INK,
  },

  // ── the hall ──────────────────────────────────────────────────────────────
  hallWall: { position: 'absolute', left: 0, right: 0, top: 288, height: GROUND - 288, backgroundColor: MARBLE.STONE },
  window: {
    position: 'absolute', top: 322, width: 40, height: 96, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    backgroundColor: PAPER_LIT, borderWidth: 1.5, borderColor: INK,
  },
  painting: { position: 'absolute', backgroundColor: PAPER_LIT, overflow: 'hidden', borderRadius: 1 },
  paintSea: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 18, backgroundColor: TEAL },
  paintSun: { position: 'absolute', left: 30, top: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: EMBER },
  sitterCrown: { position: 'absolute', left: 20, top: 8, width: 14, height: 16, borderRadius: 7, backgroundColor: OLIVE },
  sitterCoat: { position: 'absolute', left: 12, top: 24, width: 30, height: 30, borderRadius: 12, backgroundColor: DEEP },
  marble: { position: 'absolute', left: 0, right: 0, top: 452, height: 48, backgroundColor: MARBLE.SHADE },
  spot: {
    position: 'absolute', left: PLINTH.x - 44, top: 288, width: 88, height: PLINTH.top - 288, borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44, backgroundColor: PAPER_LIT,
  },
  rope: { position: 'absolute', left: 158, top: 476, width: 76, height: 3, borderRadius: 1.5, backgroundColor: EMBER },
  banner: {
    position: 'absolute', left: 120, top: 298, width: 152, height: 20, borderRadius: 2, backgroundColor: PLATE_FACE,
    borderWidth: 1.5, borderColor: INK, alignItems: 'center', justifyContent: 'center', transformOrigin: '50% 0%',
  },
  screen: { position: 'absolute', left: PLINTH.x - 33, top: 396, width: 66, height: 60 },
  screenPanel: {
    position: 'absolute', top: 0, width: 22, height: 60, borderRadius: 2, backgroundColor: WOOD.SHADE, borderWidth: 1.2, borderColor: INK,
  },
  stamp: {
    position: 'absolute', left: PLINTH.x - 27, top: 418, width: 54, height: 15, borderRadius: 2, borderWidth: 1.5, borderColor: EMBER,
    backgroundColor: PLATE_FACE, alignItems: 'center', justifyContent: 'center',
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  hallFloor: floorStyle(TONE, GROUND),
  pickRing: { position: 'absolute', left: 0, top: 0, borderWidth: 2.5, borderColor: EMBER },

  // ── the words ─────────────────────────────────────────────────────────────
  plate: {
    position: 'absolute', height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  askPlate: { left: PIECE_TABLE.x - 58, top: 414, width: 36 },
  mimPlate: { left: EASELS[0].x - 26, top: 360, width: 52 },
  expPlate: { left: EASELS[1].x - 32, top: 342, width: 64 },
  sigPlate: { left: PIECE_TABLE.x - 70, top: 420, width: 72 },
  titlePlate: { left: PLINTH.x - 28, top: PLINTH.top + 20, width: 56 },
});

export function Aesthetics4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics4Scene} band={[288, 514]} camera={CAM} />;
}
