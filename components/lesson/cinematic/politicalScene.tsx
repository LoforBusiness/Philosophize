import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import ObjectArt from './ObjectArt';
import { BEATS } from './politicalScript';
import {
  WALK, boxMove, clamp01, ease01, lerp, mixStance, moveTr, pose, stand, travelStance, type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, useHeld, carryFrom, keepHeld, useCarry, carry, reactPose,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { useLinger } from './useLinger';
import { emoteAny } from './moves';
import {
  shop, lightPole, soapbox, newsLegs, SHOPS, SHUTTER, LIGHT, LAMP_R, BOX, NEWS,
} from './politicalSet';
import { DEEP, EMBER, SAGE, TEAL, OLIVE, PAPER_LIT } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// political-political-1, "Why Societies Need Rules" — A TOWN CROSSROADS WHOSE
// LIGHTS HAVE DIED.
//
// Redrawn 2026-09-25, one of five first lessons the owner asked for after the logic
// debate studio, each displaying its information in a way of its own. Here the
// information is THE STREET ITSELF: a banner, a street-name plate, shop shutters, a
// newsboard and a notice on the light pole, and the traffic light is the gauge —
// green while there is order, dark and then red in the war of all.
//
//   b0–1  four neighbours at a crossroads, the lights green; a banner goes up across
//         the street: WHAT GIVES A STATE THE RIGHT TO RULE?
//   b2    the lights die; the shutters start to come down; the street plate reads
//         STATE OF NATURE.
//   b3    the shutters are down, sprayed SOLITARY · POOR / NASTY · BRUTISH · SHORT;
//         the neighbours square up.
//   b4    the brawl; the light burns red; the newsboard: WAR OF EVERY MAN AGAINST
//         EVERY MAN.
//   b5    an officer walks up to the soapbox; the banner gains its answer: A
//         COVENANT — ONE POWER KEEPS THE PEACE.
//   b7    the first question: answered, he steps onto the box; the light goes
//         green, the shutters go up, the fighting stops.
//   b8    the contract posted on the light pole: NO SIGNATURES — A TEST, NOT A
//         DOCUMENT.
//   b9    the neighbours bow; a poster in the shop window: LOCKE — A PEOPLE MAY
//         RESIST.
//   b10   the order question: he steps down as the answer moves toward the most
//         right to rebel.
//
// WHAT IS NOT CHANGED: every word of narration (politicalScript.ts keeps every
// beat's text and order; the voice is keyed by index).
//
// COMPOSITION, in stage units: the banner 64–336 × 298–330; shops 44–150 and
// 250–392 from their awnings at 330, shutters 338–440; the light pole at x 24 with
// its head 320–370; neighbours at x 84, 130, 270, 314; the soapbox at x 200; the
// newsboard 336–398 from 440; a dusk sky over the road between the shops. Band
// [290, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('political');
const { RULE, SHADE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
const WALL = stageToneOf(SAGE);
/** The sky between the shops, and the road under it: the palette's tame teal. */
const DUSK = stageToneOf(TEAL);
const TR = 0.85;

const CIT_X = [84, 130, 270, 314];
const CIT_DIR = [1, 1, -1, -1];              // all face the soapbox
const CIT_K = K_FIG * 0.82;
/** The officer: where he walks in from, where he waits, and where he stands on the box. */
const OFF_FROM = 440;
const OFF_WAIT = 228;
const OFF_BOX = BOX.cx;

const SHOP_ART = [shop(0), shop(1)];
/** Where the road begins, between the shops. */
const ROAD_Y = 432;
const POLE_ART = lightPole();
const BOX_ART = soapbox();
const NEWS_ART = newsLegs();

// ── per-beat tracks, read off the script ─────────────────────────────────────
const since = (k0: number) => BEATS.map((_, k) => (k0 >= 0 && k >= k0 ? 1 : 0));
const AUTH = BEATS.map((b) => b.auth ?? 0);
const NATURE = BEATS.map((b) => b.nature ?? 0);
const REVEAL = BEATS.map((b) => b.reveal ?? 0);
const at = (r: number) => REVEAL.map((v) => (v >= r ? 1 : 0));
const BANNER = at(1);
const LEDGER = at(2);
/**
 * The sprayed words exist while the shutters are down. Once the officer is up they
 * roll away with the shutters and are unmounted: a word hidden only by the shutter's
 * clip is still a word to the must-box probe, above the band.
 */
const SPRAY_ON = LEDGER.map((v, k) => (v && (k === 0 || AUTH[k - 1] === 0) ? 1 : 0));
const NEWS_ON = at(3);
const COVENANT = at(4);
/** The street plate goes up the first time the state of nature is named, and stays. */
const PLATE = since(NATURE.findIndex((v) => v > 0));
const PAPER_ON = since(BEATS.findIndex((b) => (b.paper ?? 0) > 0));
const BOW = BEATS.map((b) => b.bow ?? 0);
const LOCKE = since(BOW.findIndex((v) => v > 0));
/** He walks up to the box on the beat the covenant is named, and is there after it. */
const OFFICER = COVENANT;
const Q1 = BEATS.map((b) => (b.weigh === 'q1' ? 1 : 0));
// R7c — he steps down as the order answer moves toward the most right to rebel.
const REACT = BEATS.map((b) => (b.interact?.order ? 1 : 0));

// Each neighbour runs an out-of-phase loop of blows — no two in sync, the brawl.
const MELEE: number[][] = [
  [1, 3, 2, 0, 5, 1, 6],
  [14, 1, 12, 2, 0, 10, 5],
  [5, 11, 0, 13, 1, 3, 12],
  [15, 2, 6, 1, 16, 0, 4],
];
function melee(t: number, k: number): Stance {
  'worklet';
  const codes = MELEE[k % MELEE.length];
  const period = 0.66 + (k % 3) * 0.07;
  const local = t * 1.1 + k * 1.9;
  const idx = Math.floor(local / period) % codes.length;
  const u = (local / period) % 1;
  return boxMove(codes[idx], t, u, k + 1);
}
/** A neighbour at peace: weight shifting and nodding, each on their own phase; bowing on cue. */
function calm(t: number, k: number, bow: number): Stance {
  'worklet';
  const s = stand(t + k * 1.7);
  const shift = Math.sin(t * (0.55 + k * 0.08) + k * 2.1);
  const nod = Math.max(0, Math.sin(t * (1.9 + k * 0.23) + k * 1.3)) ** 2;
  return {
    ...s,
    tilt: s.tilt + shift * 0.05 - bow * 0.16,
    neck: s.neck + shift * 0.05 - nod * 0.24 + bow * 0.32,
    footL: { x: s.footL.x - shift * 1.8, y: s.footL.y },
    footR: { x: s.footR.x - shift * 1.8, y: s.footR.y },
    fistL: { x: -13 - shift * 2.6, y: 4 + shift * 2.4 + bow * 2 },
    fistR: { x: 13 - shift * 2.6, y: 4 - shift * 2.4 + bow * 2 },
  };
}
/**
 * The officer: baton held out in front, tapped into his free palm while he listens.
 * A living hold under it, so he is never a statue while a neighbour is talked to
 * (N21); the tap is his own tempo.
 */
function officerPose(t: number): Stance {
  'worklet';
  const s = emoteAny(263, t);
  const tap = Math.max(0, Math.sin(t * 2.4)) ** 2;
  return {
    ...s,
    fistR: { x: 24 - tap * 6, y: -16 + tap * 7 },
    fistL: { x: 12 + tap * 2, y: -4 - tap * 2 },
  };
}

const X = BEATS.map(() => 200);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political'));

export default function PoliticalScene({ clock, bt, bi, qv, pickPos, i }: SceneApi) {
  const reacting = REACT[i] === 1;
  const held0 = useHeld();
  const held1 = useHeld();
  const held2 = useHeld();
  const held3 = useHeld();
  const cv = useCarry(11);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const q = clamp01(qv.value);
    const late = (d: number) => {
      'worklet';
      return ease01((bt.value - d) / 0.45);
    };

    // up on the box: the first answer puts him there, the order answer takes him down
    const auth = Q1[n] === 1 ? ease01(q) : carry(cv, 0, n, AUTH[p], reacting ? 1 - pickPos.value : AUTH[n], tr);
    const nature = carry(cv, 1, n, NATURE[p], NATURE[n], tr);
    const fight = nature * (1 - auth);
    const bow = carry(cv, 2, n, BOW[p], BOW[n], tr);

    const cit = (k: number, held: typeof held0): Bundle => {
      'worklet';
      const dir = CIT_DIR[k];
      const live = mixStance(melee(t, k), calm(t, k, bow), 1 - fight);
      const s = keepHeld(held, mixStance(carryFrom(held, n, live), live, tr));
      const x = CIT_X[k] + (s.adv ?? 0) * dir * fight;
      return pose(s, x, GROUND, CIT_K, dir, 1);
    };

    // the officer walks up from off the right edge on the covenant beat
    const arriving = OFFICER[n] === 1 && OFFICER[p] === 0;
    const walkU = arriving ? ease01(bt.value / moveTr(OFF_FROM, OFF_WAIT, TR)) : 1;
    const baseX = arriving ? lerp(OFF_FROM, OFF_WAIT, walkU) : OFF_WAIT;
    const offS = travelStance(arriving ? OFF_FROM : OFF_WAIT, OFF_WAIT, stand(t), officerPose(t), officerPose(t), walkU, WALK, 3);
    const offX = lerp(baseX, OFF_BOX, auth);
    const offGY = GROUND - BOX.h * auth;

    return {
      c0: cit(0, held0), c1: cit(1, held1), c2: cit(2, held2), c3: cit(3, held3),
      off: reactPose(offS, offX, offGY, K_FIG, -1, 1),
      auth, nature, fight,
      banner: carry(cv, 3, n, BANNER[p], BANNER[n], late(0.3)),
      plate: carry(cv, 4, n, PLATE[p], PLATE[n], late(0.8)),
      ledger: carry(cv, 5, n, LEDGER[p], LEDGER[n], late(0.6)),
      news: carry(cv, 6, n, NEWS_ON[p], NEWS_ON[n], late(0.5)),
      cov: carry(cv, 7, n, COVENANT[p], COVENANT[n], late(1.2)),
      paper: carry(cv, 8, n, PAPER_ON[p], PAPER_ON[n], late(0.4)),
      locke: carry(cv, 9, n, LOCKE[p], LOCKE[n], late(1.6)),
      // the lights: green while there is order, dark once it goes, red in the war of all
      dead: carry(cv, 10, n, NATURE[p] > 0 ? 1 : 0, NATURE[n] > 0 ? 1 : 0, late(0.2)),
      t,
    };
  });

  const DC0 = useDerivedValue<Bundle>(() => SCENE.value.c0);
  const DC1 = useDerivedValue<Bundle>(() => SCENE.value.c1);
  const DC2 = useDerivedValue<Bundle>(() => SCENE.value.c2);
  const DC3 = useDerivedValue<Bundle>(() => SCENE.value.c3);
  const DOff = useDerivedValue<Bundle>(() => SCENE.value.off);
  const baton = useAnimatedStyle(() => {
    const w = DOff.value.wrR;
    return { transform: [{ translateX: w[0].translateX }, { translateY: w[1].translateY }] };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <View style={styles.street} pointerEvents="none" />
      <View style={styles.road} pointerEvents="none" />
      {[0, 1, 2].map((k) => <View key={k} style={[styles.dash, { top: ROAD_Y + 12 + k * 18, height: 8 + k * 3 }]} pointerEvents="none" />)}
      <ObjectArt parts={SHOP_ART[0]} tone={WALL} />
      <ObjectArt parts={SHOP_ART[1]} tone={WALL} />
      <Shutters S={SCENE} on={on} />
      <Locke S={SCENE} on={on} />
      <Banner S={SCENE} on={on} />
      <ObjectArt parts={POLE_ART} tone={WOOD} />
      <Lamps S={SCENE} />
      <Plate S={SCENE} on={on} />
      <Contract S={SCENE} on={on} />
      <ObjectArt parts={NEWS_ART} tone={WOOD} />
      <News S={SCENE} on={on} />
      <View style={styles.ground} pointerEvents="none" />
      <ObjectArt parts={BOX_ART} tone={WOOD} />
      <Stickman role="crowd" D={DC0} k={CIT_K} />
      <Stickman role="crowd" D={DC1} k={CIT_K} />
      <Stickman role="crowd" D={DC2} k={CIT_K} />
      <Stickman role="crowd" D={DC3} k={CIT_K} />
      {on(OFFICER) ? (
        <>
          <Stickman D={DOff} k={K_FIG} />
          <Animated.View style={[styles.rider, baton]} pointerEvents="none">
            <View style={styles.baton} />
            <View style={styles.batonGrip} />
          </Animated.View>
        </>
      ) : null}
    </View>
  );
}

// ── the banner across the street ────────────────────────────────────────────

function Banner({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.banner, transform: [{ scaleX: 0.6 + 0.4 * S.value.banner }] }));
  const cov = useAnimatedStyle(() => ({ opacity: S.value.cov, transform: [{ translateY: (1 - S.value.cov) * -4 }] }));
  if (!on(BANNER)) return null;
  return (
    <Animated.View style={[styles.bannerWrap, st]} pointerEvents="none">
      <View style={[styles.bannerCord, { left: -20, transform: [{ rotate: '-14deg' }] }]} />
      <View style={[styles.bannerCord, { right: -20, transform: [{ rotate: '14deg' }] }]} />
      <View style={styles.banner}>
        <Text style={styles.bannerText} numberOfLines={1}>WHAT GIVES A STATE THE RIGHT TO RULE?</Text>
        {on(COVENANT) ? (
          <Animated.Text style={[styles.bannerSub, cov]} numberOfLines={1}>A COVENANT: ONE POWER KEEPS THE PEACE</Animated.Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

// ── the shutters, and what is sprayed on them ───────────────────────────────

const SPRAY = [['SOLITARY', 'POOR'], ['NASTY', 'BRUTISH', 'SHORT']];

function Shutters({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const h = SHUTTER.bottom - SHUTTER.top;
  const drop = useAnimatedStyle(() => ({ height: h * clamp01(S.value.nature * 1.4) * (1 - S.value.auth) }));
  const spray = useAnimatedStyle(() => ({ opacity: S.value.ledger }));
  return (
    <>
      {SHOPS.map((sh, k) => (
        <View key={k} style={[styles.shutterClip, { left: sh.x0 + 4, width: sh.x1 - sh.x0 - 8 }]} pointerEvents="none">
          <Animated.View style={[styles.shutter, drop]}>
            {/* the words ride the shutter, anchored to its foot, so rolling it up takes them away */}
            {[0, 1, 2, 3, 4, 5].map((r) => <View key={r} style={[styles.slat, { bottom: 6 + r * 16 }]} />)}
            {on(SPRAY_ON) ? (
              <Animated.View style={[styles.sprayBox, spray]}>
                {SPRAY[k].map((w) => <Text key={w} style={styles.spray} numberOfLines={1}>{w}</Text>)}
              </Animated.View>
            ) : null}
          </Animated.View>
        </View>
      ))}
    </>
  );
}

// ── the traffic light: the gauge ────────────────────────────────────────────

function Lamps({ S }: { S: SharedValue<any> }) {
  const red = useAnimatedStyle(() => ({ opacity: 0.18 + 0.82 * S.value.fight * S.value.dead }));
  const amber = useAnimatedStyle(() => {
    const blink = S.value.dead * (1 - S.value.fight) * (1 - S.value.auth) * (Math.sin(S.value.t * 5) > 0 ? 1 : 0);
    return { opacity: 0.18 + 0.7 * blink };
  });
  const green = useAnimatedStyle(() => ({ opacity: 0.18 + 0.82 * Math.max(1 - S.value.dead, S.value.auth) }));
  const cx = LIGHT.x - LAMP_R;
  const y0 = LIGHT.headTop + 6;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[0, 1, 2].map((k) => <View key={k} style={[styles.lampOff, { left: cx, top: y0 + k * 14 }]} />)}
      <Animated.View style={[styles.lamp, { left: cx, top: y0, backgroundColor: EMBER }, red]} />
      <Animated.View style={[styles.lamp, { left: cx, top: y0 + 14, backgroundColor: PAPER_LIT }, amber]} />
      <Animated.View style={[styles.lamp, { left: cx, top: y0 + 28, backgroundColor: SAGE }, green]} />
    </View>
  );
}

// ── the street-name plate and the notice on the light pole ─────────────────

function Plate({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.plate, transform: [{ scaleX: S.value.plate }] }));
  if (!on(PLATE)) return null;
  return (
    <Animated.View style={[styles.plate, st]} pointerEvents="none">
      <Text style={styles.plateText} numberOfLines={1}>STATE OF</Text>
      <Text style={styles.plateText} numberOfLines={1}>NATURE</Text>
    </Animated.View>
  );
}

function Contract({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.paper, transform: [{ rotate: '-3deg' }, { translateY: (1 - S.value.paper) * -6 }] }));
  if (!on(PAPER_ON)) return null;
  return (
    <Animated.View style={[styles.contract, st]} pointerEvents="none">
      <Text style={styles.contractHead} numberOfLines={1}>CONTRACT</Text>
      <View style={styles.signLine} />
      <View style={styles.signLine} />
      <View style={styles.contractStamp}>
        <Text style={styles.stampText} numberOfLines={1}>A TEST</Text>
      </View>
    </Animated.View>
  );
}

// ── the newsboard on the right pavement ─────────────────────────────────────

function News({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.news, transform: [{ translateY: (1 - S.value.news) * 6 }] }));
  return (
    <View style={styles.newsBoard} pointerEvents="none">
      <Text style={styles.newsHead} numberOfLines={1}>DAILY NEWS</Text>
      {on(NEWS_ON) ? (
        <Animated.View style={st}>
          <Text style={styles.newsText} numberOfLines={1}>WAR OF</Text>
          <Text style={styles.newsText} numberOfLines={1}>EVERY MAN</Text>
          <Text style={styles.newsText} numberOfLines={1}>AGAINST</Text>
          <Text style={styles.newsText} numberOfLines={1}>EVERY MAN</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── Locke's poster in the shop window ───────────────────────────────────────

function Locke({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const st = useAnimatedStyle(() => ({ opacity: S.value.locke, transform: [{ rotate: '2deg' }, { scale: 0.9 + 0.1 * S.value.locke }] }));
  if (!on(LOCKE)) return null;
  return (
    <Animated.View style={[styles.locke, st]} pointerEvents="none">
      <Text style={styles.lockeHead} numberOfLines={1}>LOCKE</Text>
      <Text style={styles.lockeText} numberOfLines={1}>A PEOPLE</Text>
      <Text style={styles.lockeText} numberOfLines={1}>MAY RESIST</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  street: {
    position: 'absolute', left: SHOPS[0].x1, top: 330, width: SHOPS[1].x0 - SHOPS[0].x1, height: ROAD_Y - 330,
    backgroundColor: DUSK.STONE,
  },
  road: {
    position: 'absolute', left: SHOPS[0].x1, top: ROAD_Y, width: SHOPS[1].x0 - SHOPS[0].x1, height: GROUND - ROAD_Y,
    backgroundColor: DUSK.SHADE,
  },
  dash: { position: 'absolute', left: BOX.cx - 1.5, width: 3, borderRadius: 1.5, backgroundColor: PAPER_LIT },

  bannerWrap: { position: 'absolute', left: 64, top: 298, width: 272 },
  bannerCord: { position: 'absolute', top: 8, width: 26, height: 1.5, backgroundColor: INK },
  banner: {
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', paddingVertical: 3,
  },
  bannerText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, lineHeight: 12, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
  bannerSub: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.4, color: INK, includeFontPadding: false,
    textDecorationLine: 'underline', textDecorationColor: EMBER, marginTop: 1,
  },

  shutterClip: { position: 'absolute', top: SHUTTER.top, height: SHUTTER.bottom - SHUTTER.top, overflow: 'hidden' },
  shutter: {
    position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: PLATE_FACE,
    borderWidth: 1.5, borderColor: INK, borderTopWidth: 0, borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
    overflow: 'hidden', alignItems: 'center',
  },
  slat: { position: 'absolute', left: 3, right: 3, height: 1, backgroundColor: SHADE },
  sprayBox: { position: 'absolute', bottom: 22, alignItems: 'center', paddingHorizontal: 4, backgroundColor: PLATE_FACE },
  spray: {
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 13, letterSpacing: 0.6, color: DEEP, includeFontPadding: false,
  },

  lampOff: {
    position: 'absolute', width: LAMP_R * 2, height: LAMP_R * 2, borderRadius: LAMP_R, backgroundColor: DEEP,
  },
  lamp: { position: 'absolute', width: LAMP_R * 2, height: LAMP_R * 2, borderRadius: LAMP_R },

  plate: {
    position: 'absolute', left: LIGHT.x - 14, top: LIGHT.headTop + LIGHT.headH + 6, width: 58, paddingVertical: 2,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: TEAL, alignItems: 'center', transformOrigin: '0% 50%',
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.5, color: PAPER_LIT, includeFontPadding: false,
  },
  contract: {
    position: 'absolute', left: 0, top: 414, width: 68, height: 44, paddingTop: 3, paddingHorizontal: 4,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  contractHead: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  signLine: { height: 1.5, backgroundColor: SHADE, marginTop: 5 },
  contractStamp: {
    position: 'absolute', left: 6, bottom: 3, paddingHorizontal: 3, borderWidth: 1.5, borderColor: EMBER, borderRadius: 2,
    transform: [{ rotate: '-8deg' }],
  },
  stampText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  newsBoard: {
    position: 'absolute', left: NEWS.x, top: NEWS.y, width: NEWS.w, height: 58, paddingTop: 2,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP, alignItems: 'center',
  },
  newsHead: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 0.6, color: INK, includeFontPadding: false,
    borderBottomWidth: 1, borderBottomColor: INK, marginBottom: 1,
  },
  newsText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.1, color: INK, includeFontPadding: false,
    textAlign: 'center',
  },

  locke: {
    position: 'absolute', left: 268, top: 352, width: 86, paddingVertical: 3,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, alignItems: 'center',
  },
  lockeHead: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 11, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
  lockeText: {
    fontFamily: 'Inter_500Medium', fontSize: 9, lineHeight: 11, color: INK, includeFontPadding: false,
  },

  rider: { position: 'absolute', left: 0, top: 0 },
  baton: { position: 'absolute', left: -2, top: -26, width: 4, height: 26, borderRadius: 2, backgroundColor: INK },
  batonGrip: { position: 'absolute', left: -4, top: -3, width: 8, height: 3, borderRadius: 1.5, backgroundColor: EMBER },
});

export function PoliticalLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={PoliticalScene} band={[290, 514]} camera={CAM} />;
}
