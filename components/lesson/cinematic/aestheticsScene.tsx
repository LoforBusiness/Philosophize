import { View, Text, StyleSheet } from 'react-native';
import Animated, { makeMutable, useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import Target from './Target';
import ObjectArt from './ObjectArt';
import SpeechBox from './SpeechBox';
import { BEATS } from './aestheticsScript';
import {
  WALK, clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, moveTr, narratorHold, narratorLive,
  pose, stand, travelStance, type Bundle, type Stance,
} from './rig';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SIGH, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose, facing,
} from './cinematicKit';
import { stageTone, stageToneOf } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';
import { useLinger } from './useLinger';
import { attendAt } from './attend';
import {
  rail, boardPost, telescope, crate, ridge, trees, SKY, SUN, BOARD, APPLE, RAIL_Y, RIDGE_FAR, RIDGE_MID, RIDGE_NEAR,
} from './aestheticsSet';
import { DEEP, OLIVE, TEAL, EMBER, PAPER_LIT, mix } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// aesthetics-aesthetics-1, "Why Things Feel Beautiful" — A HILLTOP LOOKOUT AT SUNSET.
//
// Redrawn 2026-09-25, one of five first lessons the owner asked for after the logic
// debate studio, each displaying its information in a way of its own. Here it is a
// LOOKOUT: the lesson is laid out the way a viewpoint lays out a view — an info
// board, a coin telescope, a picnic on a crate, and scorecards propped on the rail.
//
//   b0–2  the sun going down behind the hills; the info board reads YOUR VERDICT:
//         BEAUTIFUL, then A JUDGEMENT OF TASTE, then its two questions.
//   b3–5  he reaches for the apple in the basket; its tag reads TO EAT. The sunset's
//         tag reads WANTS NOTHING, then FREE OF DESIRE.
//   b6–8  three scorecards on the rail — TRUE CRITICS — scattered, then flipped to
//         one score; then CRITIC and VERDICT point at each other.
//   b10   the first question, ON THE STAGE: the sunset or the apple.
//   b11–12 the board's second question is marked; he says I LIKE IT, then IT IS
//         BEAUTIFUL.
//   b13   two tourists walk up to the rail and point: everyone.
//   b14   the sort: the tourists stand in as the chip moves toward FOR EVERYONE.
//
// WHAT IS NOT CHANGED: every word of narration (aestheticsScript.ts keeps every
// beat's text and order; the voice is keyed by index).
//
// REVISED 2026-09-28: the view is three ridges in atmospheric layers with the sun
// half set into the far one (aestheticsSet, against photographs); he turns to the
// board and the scorecards on the beats they change (`face: -1`) instead of leaving
// them at his back; the apple's tag hangs from its stalk on a string.
//
// COMPOSITION, in stage units: the sky 292–466 with the sun at (322, 426); the rail
// at 460; the info board 12–172 × 300–376 on one post; the scorecards on the rail
// at x 110–202; he stands at x 250, the apple at his hand (279, 463) on a crate
// 258–298; the telescope at x 362; the tourists walk in to x 32 and 64. Band
// [290, 514].
// ─────────────────────────────────────────────────────────────────────────────

const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);
const WOOD = stageToneOf(OLIVE);
/** The sky at dusk: the palette's tame teal, never the branch's tan (no gold grounds). */
const DUSK = stageToneOf(TEAL);
/** The sky paling toward the sun, in two flat steps (no gradients on this stage). */
const HAZE_1 = mix(DUSK.STONE, PAPER_LIT, 0.3);
const HAZE_2 = mix(DUSK.STONE, PAPER_LIT, 0.55);
const TR = 0.85;

const FIG_X = 250;
const TOUR_X = [32, 64];
const TOUR_FROM = [-40, -24];
const TOUR_K = K_FIG * 0.82;

const RAIL_ART = rail();
const POST_ART = boardPost();
const SCOPE_ART = telescope();
const CRATE_ART = crate();

// the scorecards on the rail: Hume's true critics, scattered and then agreed
const CARD_X = [110, 142, 174];
const CARD_W = 28;
const CARD_H = 30;
const SCATTER = ['3', '9', '5'];
const AGREED = '8';

// the question on the stage: the sunset or the apple
const PICKS = [
  { id: 'sunset', label: 'THE SUNSET', x: SUN.x - 34, y: SUN.y - SUN.r - 20, w: 68, h: SUN.r * 2 + 24, top: true, correct: true },
  { id: 'apple', label: 'THE APPLE', x: APPLE.x - 32, y: APPLE.y - 14, w: 64, h: 34, top: false, correct: false },
];

/** The apple's tag hangs on a string from the stalk to its top-left corner (300, 474). */
const STRING = (() => {
  const x0 = APPLE.x + 2;
  const y0 = APPLE.y - APPLE.r - 3;
  const dx = 303 - x0;
  const dy = 475 - y0;
  return { x0, y0, len: Math.hypot(dx, dy), deg: (Math.atan2(dy, dx) * 180) / Math.PI };
})();
/** The sunset's tag: high in the sky, clear of the speech boxes over his head. */
const TAG_Y = 296;
// what he says, on the two beats he says it (the box sits over his mark)
const SAY_X = makeMutable(FIG_X + 22);

// ── per-beat tracks, read off the script ─────────────────────────────────────
const since = (k0: number) => BEATS.map((_, k) => (k0 >= 0 && k >= k0 ? 1 : 0));
/** A flag the script sets once, held from there to the end: nothing here is taken back. */
function held(flags: number[]): number[] {
  return since(flags.indexOf(1));
}
const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const GLOW = BEATS.map((b) => (b.glow ? 1 : 0));
const TASTE = held(BEATS.map((b) => (b.taste ? 1 : 0)));
const QUEST = held(BEATS.map((b) => (b.questions ? 1 : 0)));
const APPLE_ON = held(BEATS.map((b) => (b.apple ? 1 : 0)));
const UNW = held(BEATS.map((b) => (b.unwanted ? 1 : 0)));
const DESI = held(BEATS.map((b) => (b.desireless ? 1 : 0)));
const CRIT = held(BEATS.map((b) => (b.critics ? 1 : 0)));
const AGREE = held(BEATS.map((b) => (b.agree ? 1 : 0)));
const CIRC = held(BEATS.map((b) => (b.circular ? 1 : 0)));
const ASSENT = held(BEATS.map((b) => (b.assent ? 1 : 0)));
const CROWD = held(BEATS.map((b) => (b.crowd ? 1 : 0)));
const PICK = BEATS.map((b) => (b.pick ? 1 : 0));
const LIKE_BEAT = BEATS.findIndex((b) => !!b.assent);
const CLAIM_BEAT = BEATS.findIndex((b) => !!b.claim);
const SAYS = BEATS.map((_, k) => (k === LIKE_BEAT || k === CLAIM_BEAT ? 1 : 0));
/** He turns to the tourists once they are there: two figures on a stage face each other (N21). */
const DIR = BEATS.map((b, k) => (CROWD[k] || b.face === -1 ? -1 : 1));
/**
 * The board and the scorecards stand to his LEFT and the sun to his right, and a look
 * only tilts his head — so on the beats where the board or the cards change (b1–2,
 * b6–8, b11) the script turns him round to them (`face: -1`), and on the sun's and
 * the apple's beats he turns back. That is also simply what a person at a lookout does:
 * reads the sign, then looks at the view again.
 */
const CRIT_BEAT = BEATS.findIndex((b) => !!b.critics);
const AGREE_BEAT = BEATS.findIndex((b) => !!b.agree);
const CIRC_BEAT = BEATS.findIndex((b) => !!b.circular);
/** The board's rows, in stage units: its heading, BEAUTIFUL, and the two questions. */
const BOARD_HEAD_Y = BOARD.y + 13;
const BOARD_VERDICT_Y = BOARD.y + 30;
const BOARD_Q1_Y = BOARD.y + 51;
const BOARD_Q2_Y = BOARD.y + 66;
/** The scorecards' middle, and the CRITIC ↔ VERDICT plate over them. */
const CARDS_MID = (CARD_X[0] + CARD_X[2] + CARD_W) / 2;
const CARDS_Y = RAIL_Y - CARD_H / 2;
const LOOP_Y = RAIL_Y - CARD_H - 17;
// R7c — on the sort, the tourists stand in as the chip moves toward FOR EVERYONE.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

function reachApple(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.06, neck: 0.10, fistR: { x: 25, y: -2 }, fistL: { x: -4, y: -4 } };
}
function hHold(code: number, t: number): Stance {
  'worklet';
  if (code === 7) return reachApple(t);
  if (code === 0) return stand(t);
  if (code >= SIGH.SHRUG && code <= SIGH.TEMPLE) return emoteHold(code, t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code === 7) return reachApple(t);
  if (code === 0) return stand(t);
  if (code >= SIGH.SHRUG && code <= SIGH.TEMPLE) return emoteLive(code, t, bt);
  return narratorLive(code, t, bt);
}

const X = BEATS.map(() => FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics'));

export default function AestheticsScene({
  clock, bt, bi, pickPos, i, picked, onPick, gazeX, gazeY, gazeOn,
}: SceneApi) {
  const reacting = REACT[i] === 1;
  const held0 = useHeld();
  const cv = useCarry(17);
  const on = useLinger(i);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const late = (d: number) => {
      'worklet';
      return ease01((bt.value - d) / 0.45);
    };
    const figS = keepHeld(held0, mixStance(carryFrom(held0, n, hHold(HPOSE[p], t)), hLive(HPOSE[n], t, bt.value), tr));
    // the tourists walk up from the left edge on the beat the crowd arrives
    const arriving = CROWD[n] === 1 && CROWD[p] === 0;
    const walkT = (k: number) => {
      'worklet';
      return ease01(bt.value / moveTr(TOUR_FROM[k], TOUR_X[k], TR));
    };
    // walking in on the beat they arrive, from off the left edge; standing after it
    const tourist = (k: number) => {
      'worklet';
      const u = arriving ? walkT(k) : 1;
      const x0 = arriving ? TOUR_FROM[k] : TOUR_X[k];
      const s = travelStance(x0, TOUR_X[k], stand(t), emoteAny(183, t + k), emoteAnyLive(183, t + k, bt.value), u, WALK, k);
      return pose(s, lerp(x0, TOUR_X[k], u), GROUND, TOUR_K, 1, 1);
    };
    const crowd = carry(cv, 0, n, CROWD[p], CROWD[n], arriving ? 1 : tr);
    // on the sort: nobody at FOR YOU, one tourist at HALF AND HALF, both at FOR EVERYONE —
    // carried, so the tourists fade back as the question arrives rather than on its first frame
    const stand0 = carry(cv, 12, n, 1, reacting ? clamp01(pickPos.value * 2) : 1, tr);
    const stand1 = carry(cv, 13, n, 1, reacting ? clamp01(pickPos.value * 2 - 1) : 1, tr);
    const glowV = carry(cv, 1, n, GLOW[p], GLOW[n], tr);
    // ── WHERE HE LOOKS (attend.ts) ───────────────────────────────────────────
    // The info board (x 12–188) and the scorecards (x 110–202) stand to his LEFT, so
    // on the beats where they change he is turned round to them (DIR, above) and
    // reads them: the heading, then BEAUTIFUL; the two questions in turn; the cards
    // one by one, and the CRITIC ↔ VERDICT plate; the second question's underline.
    // Facing right he has the sun, the sunset's tag, the apple in his hand, and —
    // turned again — the tourists. Tag middle: left 290 + half its 98 = SUN.x + 17.
    // A tourist's head (TOUR_K) is about 82 units above the ground.
    const LK = PICK[n] ? [0.3, SUN.x, SUN.y, 0.6, 1.5, APPLE.x, APPLE.y, 0.6, 2.7, 0, 0, 0]
      : n === LIKE_BEAT ? [0.4, BOARD.x + 90, BOARD_Q2_Y, 1, 4.0, 0, 0, 0]
      : n === CLAIM_BEAT ? [0.2, 0, 0, 0, 1.6, SUN.x, SUN.y, 0.8, 4.4, 0, 0, 0]
      : REACT[n] ? [0.3, (TOUR_X[0] + TOUR_X[1]) / 2, GROUND - 82, 0.7]
      : arriving ? [0.3, lerp(TOUR_FROM[1], TOUR_X[1], walkT(1)), GROUND - 82, 1, 4.4, 0, 0, 0]
      : n === CRIT_BEAT ? [0.4, CARDS_MID, CARDS_Y, 1, 2.6, CARD_X[0] + CARD_W / 2, CARDS_Y, 0.9, 4.2, CARD_X[2] + CARD_W / 2, CARDS_Y, 0.9, 6.6, 0, 0, 0]
      : n === AGREE_BEAT ? [0.3, CARDS_MID, CARDS_Y, 1, 7.6, 0, 0, 0]
      : n === CIRC_BEAT ? [0.5, CARDS_MID, LOOP_Y, 1, 4.6, CARDS_MID, CARDS_Y, 0.8, 7.4, 0, 0, 0]
      : CRIT[n] ? [0.2, 0, 0, 0]
      : DESI[n] ? [0.7, SUN.x + 17, TAG_Y + 38, 0.9, 3.0, SUN.x, SUN.y, 0.8, 5.0, APPLE.x, APPLE.y, 0.8, 7.2, 0, 0, 0]
      : UNW[n] ? [0.5, SUN.x + 17, TAG_Y + 20, 0.9, 1.8, SUN.x, SUN.y, 1]
      : APPLE_ON[n] ? [0.1, APPLE.x, APPLE.y, 1, 4.8, 0, 0, 0]
      : QUEST[n] ? [0.5, BOARD.x + 80, BOARD_Q1_Y, 1, 2.4, BOARD.x + 80, BOARD_Q2_Y, 1, 4.6, 0, 0, 0]
      : TASTE[n] ? [0.4, BOARD.x + 70, BOARD_HEAD_Y, 1, 3.4, BOARD.x + 55, BOARD_VERDICT_Y, 0.9, 5.9, 0, 0, 0]
      : GLOW[n] ? [0.2, SUN.x, SUN.y, 1, 4.6, SUN.x, SUN.y, 0.7]
      : [0.2, 0, 0, 0];
    const lk = attendAt(LK, bt.value, 0, 0, 0);
    return {
      fig: lookPose(figS, FIG_X, GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, carry(cv, 14, n, lk.x, lk.x, tr), carry(cv, 15, n, lk.y, lk.y, tr), carry(cv, 16, n, 0, lk.w, tr)),
      t0: tourist(0),
      t1: tourist(1),
      crowd,
      stand0: lerp(0.25, 1, stand0),
      stand1: lerp(0.25, 1, stand1),
      glow: glowV,
      taste: carry(cv, 2, n, TASTE[p], TASTE[n], late(0.5)),
      quest: carry(cv, 3, n, QUEST[p], QUEST[n], late(0.6)),
      apple: carry(cv, 4, n, APPLE_ON[p], APPLE_ON[n], tr),
      unw: carry(cv, 5, n, UNW[p], UNW[n], late(0.6)),
      desi: carry(cv, 6, n, DESI[p], DESI[n], late(0.8)),
      crit: carry(cv, 7, n, CRIT[p], CRIT[n], late(0.5)),
      agree: carry(cv, 8, n, AGREE[p], AGREE[n], late(0.9)),
      circ: carry(cv, 9, n, CIRC[p], CIRC[n], late(0.7)),
      assent: carry(cv, 10, n, ASSENT[p], ASSENT[n], late(0.3)),
      pick: carry(cv, 11, n, PICK[p], PICK[n], tr),
      twinkle: t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const D0 = useDerivedValue<Bundle>(() => SCENE.value.t0);
  const D1 = useDerivedValue<Bundle>(() => SCENE.value.t1);
  const tour0 = useAnimatedStyle(() => ({ opacity: SCENE.value.crowd * SCENE.value.stand0 }));
  const tour1 = useAnimatedStyle(() => ({ opacity: SCENE.value.crowd * SCENE.value.stand1 }));
  const apple = useAnimatedStyle(() => ({ opacity: SCENE.value.apple, transform: [{ translateY: (1 - SCENE.value.apple) * -8 }] }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Vista S={SCENE} />
      <ObjectArt parts={RAIL_ART} tone={WOOD} />
      <ObjectArt parts={POST_ART} tone={WOOD} />
      <Board S={SCENE} on={on} />
      <Critics S={SCENE} on={on} />
      <SunTag S={SCENE} on={on} />
      <ObjectArt parts={SCOPE_ART} tone={WOOD} />
      {on(APPLE_ON) ? (
        <Animated.View style={[styles.apple, apple]} pointerEvents="none">
          <View style={styles.appleStalk} />
          <View style={styles.appleShine} />
        </Animated.View>
      ) : null}
      <ObjectArt parts={CRATE_ART} tone={WOOD} />
      <AppleTag S={SCENE} on={on} />
      <View style={styles.ground} pointerEvents="none" />
      {on(CROWD) ? (
        <>
          <Animated.View style={[StyleSheet.absoluteFill, tour0]} pointerEvents="none">
            <Stickman D={D0} k={TOUR_K} role="second" />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, tour1]} pointerEvents="none">
            <Stickman D={D1} k={TOUR_K} role="crowd" />
          </Animated.View>
        </>
      ) : null}
      <Stickman D={DF} k={K_FIG} />
      {PICK[i] ? <Picks picked={picked} onPick={onPick} /> : null}
      {LIKE_BEAT >= 0 && on(SAYS) ? (
        <SpeechBox text="I LIKE IT." beat={LIKE_BEAT} bi={bi} bt={bt} x={SAY_X} tipY={GROUND - 103 - 8} side={1} lip={EMBER} />
      ) : null}
      {CLAIM_BEAT >= 0 && on(SAYS) ? (
        <SpeechBox text="IT IS BEAUTIFUL." beat={CLAIM_BEAT} bi={bi} bt={bt} x={SAY_X} tipY={GROUND - 103 - 8} side={1} lip={EMBER} />
      ) : null}
    </View>
  );
}

// ── the view: sky, sun and hills ────────────────────────────────────────────

const FAR_ART = ridge(RIDGE_FAR, SKY.bottom);
const MID_ART = ridge(RIDGE_MID, 480);
const NEAR_ART = ridge(RIDGE_NEAR, GROUND);
const TREE_ART = trees();
/** Each layer of the view is one flat colour, lighter the farther it is (aestheticsSet). */
const HAZE = (c: string) => ({ ...DUSK, SHADE: c });
const FAR_TONE = HAZE(mix(DUSK.STONE, DUSK.SHADE, 0.38));
const MID_TONE = HAZE(mix(DUSK.SHADE, DEEP, 0.3));
const TREE_TONE = HAZE(mix(DEEP, DUSK.SHADE, 0.35));
const NEAR_TONE = HAZE(WOOD.STONE);

function Vista({ S }: { S: SharedValue<any> }) {
  const ring1 = useAnimatedStyle(() => ({
    opacity: 0.45 * S.value.glow,
    transform: [{ scale: 1 + 0.08 * Math.sin(S.value.twinkle * 1.6) }],
  }));
  const ring2 = useAnimatedStyle(() => ({
    opacity: 0.25 * S.value.glow,
    transform: [{ scale: 1 + 0.1 * Math.sin(S.value.twinkle * 1.6 + 1.2) }],
  }));
  return (
    <>
      <View style={styles.sky} pointerEvents="none">
        {/* the sky pales toward the horizon, in two flat steps */}
        <View style={[styles.haze, { top: 396 - SKY.top, backgroundColor: HAZE_1 }]} />
        <View style={[styles.haze, { top: 414 - SKY.top, backgroundColor: HAZE_2 }]} />
        <Animated.View style={[styles.ring, { width: 96, height: 96, borderRadius: 48, left: SUN.x - 48, top: SUN.y - SKY.top - 48 }, ring2]} />
        <Animated.View style={[styles.ring, { width: 64, height: 64, borderRadius: 32, left: SUN.x - 32, top: SUN.y - SKY.top - 32 }, ring1]} />
        <View style={styles.sun} />
      </View>
      {/* the ridges, farthest first: the sun sets into the far one */}
      <ObjectArt parts={FAR_ART} tone={FAR_TONE} line={0} />
      <ObjectArt parts={TREE_ART} tone={TREE_TONE} line={0} />
      <ObjectArt parts={MID_ART} tone={MID_TONE} line={0} />
      <ObjectArt parts={NEAR_ART} tone={NEAR_TONE} line={0} />
    </>
  );
}

// ── the info board: YOUR VERDICT, then what it is and the two questions ─────

function Board({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const verdict = useAnimatedStyle(() => ({ opacity: 1 - S.value.taste }));
  const taste = useAnimatedStyle(() => ({ opacity: S.value.taste }));
  const q = useAnimatedStyle(() => ({ opacity: S.value.quest, transform: [{ translateY: (1 - S.value.quest) * 4 }] }));
  const mark = useAnimatedStyle(() => ({ opacity: S.value.assent, transform: [{ scaleX: S.value.assent }] }));
  return (
    <View style={styles.board} pointerEvents="none">
      <View style={styles.boardHead}>
        <Animated.Text style={[styles.boardHeadText, verdict]} numberOfLines={1}>YOUR VERDICT</Animated.Text>
        {on(TASTE) ? (
          <Animated.Text style={[styles.boardHeadText, styles.over, taste]} numberOfLines={1}>A JUDGEMENT OF TASTE</Animated.Text>
        ) : null}
      </View>
      <Text style={styles.verdict} numberOfLines={1}>BEAUTIFUL</Text>
      {on(QUEST) ? (
        <Animated.View style={[styles.qs, q]}>
          <View style={styles.qRow}>
            <View style={styles.qNum}><Text style={styles.qNumText}>1</Text></View>
            <Text style={styles.qText} numberOfLines={1}>WHAT KIND OF PLEASURE?</Text>
          </View>
          <View style={styles.qRow}>
            <View style={styles.qNum}><Text style={styles.qNumText}>2</Text></View>
            <Text style={styles.qText} numberOfLines={1}>WHO DOES IT SPEAK FOR?</Text>
            {on(ASSENT) ? <Animated.View style={[styles.qMark, mark]} /> : null}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── the scorecards on the rail: TRUE CRITICS ────────────────────────────────

function Card({ S, k }: { S: SharedValue<any>; k: number }) {
  const card = useAnimatedStyle(() => ({
    opacity: S.value.crit,
    transform: [{ translateY: (1 - S.value.crit) * 10 }, { scaleY: Math.max(0.04, Math.abs(1 - 2 * S.value.agree)) }],
  }));
  const before = useAnimatedStyle(() => ({ opacity: S.value.agree < 0.5 ? 1 : 0 }));
  const after = useAnimatedStyle(() => ({ opacity: S.value.agree < 0.5 ? 0 : 1 }));
  return (
    <Animated.View style={[styles.card, { left: CARD_X[k] }, card]}>
      <View style={styles.cardHinge} />
      <Animated.Text style={[styles.cardNum, before]}>{SCATTER[k]}</Animated.Text>
      <Animated.Text style={[styles.cardNum, styles.over, after]}>{AGREED}</Animated.Text>
    </Animated.View>
  );
}

function Critics({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const label = useAnimatedStyle(() => ({ opacity: S.value.crit }));
  const loop = useAnimatedStyle(() => ({ opacity: S.value.circ, transform: [{ translateY: (1 - S.value.circ) * 6 }] }));
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${S.value.twinkle * 40}deg` }] }));
  if (!on(CRIT)) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CARD_X.map((_, k) => <Card key={k} S={S} k={k} />)}
      <Animated.View style={[styles.critLabel, label]}>
        <Text style={styles.plateText} numberOfLines={1}>TRUE CRITICS</Text>
      </Animated.View>
      {on(CIRC) ? (
        <Animated.View style={[styles.loopPlate, loop]}>
          <Text style={styles.plateText} numberOfLines={1}>CRITIC</Text>
          <Animated.View style={[styles.loopIcon, spin]}>
            <View style={styles.loopHead} />
          </Animated.View>
          <Text style={styles.plateText} numberOfLines={1}>VERDICT</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

// ── the two tags: what the sunset and the apple are wanted for ──────────────

function SunTag({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const tag = useAnimatedStyle(() => ({ opacity: S.value.unw, transform: [{ translateY: (1 - S.value.unw) * -6 }] }));
  const foot = useAnimatedStyle(() => ({ opacity: S.value.desi }));
  if (!on(UNW)) return null;
  return (
    <Animated.View style={[styles.sunTag, tag]} pointerEvents="none">
      <View style={styles.sunLeader} />
      <Text style={styles.tagHead} numberOfLines={1}>THE SUNSET</Text>
      <Text style={styles.tagText} numberOfLines={1}>WANTS NOTHING</Text>
      {on(DESI) ? <Animated.Text style={[styles.tagFoot, foot]} numberOfLines={1}>FREE OF DESIRE</Animated.Text> : null}
    </Animated.View>
  );
}

function AppleTag({ S, on }: { S: SharedValue<any>; on: (a: readonly number[]) => boolean }) {
  const tag = useAnimatedStyle(() => ({ opacity: S.value.apple, transform: [{ rotate: '-4deg' }] }));
  const string = useAnimatedStyle(() => ({ opacity: S.value.apple, transform: [{ rotate: `${STRING.deg}deg` }] }));
  if (!on(APPLE_ON)) return null;
  // a price tag tied to the apple's stalk on a string, so it reads as the apple's
  return (
    <>
      <Animated.View style={[styles.appleString, string]} pointerEvents="none" />
      <Animated.View style={[styles.appleTag, tag]} pointerEvents="none">
        <Text style={styles.tagHead} numberOfLines={1}>THE APPLE</Text>
        <Text style={styles.tagText} numberOfLines={1}>TO EAT</Text>
      </Animated.View>
    </>
  );
}

// ── the question on the stage: the sunset or the apple ──────────────────────

function Picks({ picked, onPick }: { picked: string | null; onPick: (id: string, ok: boolean) => void }) {
  const answered = picked !== null;
  return (
    <>
      {PICKS.map((q) => (
        <Target
          key={q.id} id={q.id} correct={q.correct} picked={picked} onPick={onPick} radius={8}
          disabled={answered} sealAt="tr"
          style={[styles.pick, { left: q.x, top: q.y, width: q.w, height: q.h }]}
        >
          <View style={[styles.pickFill, q.top && styles.pickFillTop]}>
            <View style={[styles.pickLabel, answered && q.correct && styles.pickRight]}>
              <Text style={[styles.pickText, answered && q.correct && styles.pickTextOnInk]} numberOfLines={1}>{q.label}</Text>
            </View>
          </View>
        </Target>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  floor: floorStyle(TONE, GROUND),
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },
  over: { position: 'absolute' },

  sky: {
    position: 'absolute', left: 0, top: SKY.top, width: STAGE_W, height: SKY.bottom - SKY.top,
    backgroundColor: DUSK.STONE, overflow: 'hidden',
  },
  ring: { position: 'absolute', backgroundColor: PAPER_LIT },
  sun: {
    position: 'absolute', left: SUN.x - SUN.r, top: SUN.y - SKY.top - SUN.r, width: SUN.r * 2, height: SUN.r * 2,
    borderRadius: SUN.r, backgroundColor: EMBER,
  },
  haze: { position: 'absolute', left: 0, right: 0, bottom: 0 },

  board: {
    position: 'absolute', left: BOARD.x, top: BOARD.y, width: BOARD.w, height: BOARD.h,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: lipOf(WOOD),
    paddingHorizontal: 7, paddingTop: 5,
  },
  boardHead: { height: 13 },
  boardHeadText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 12, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
  verdict: {
    fontFamily: 'Inter_700Bold', fontSize: 15, lineHeight: 18, letterSpacing: 1.5, color: INK, includeFontPadding: false,
    marginTop: 1,
  },
  qs: { marginTop: 5 },
  qRow: { flexDirection: 'row', alignItems: 'center', height: 15 },
  qNum: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: INK, alignItems: 'center', justifyContent: 'center', marginRight: 5,
  },
  qNumText: { fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, color: PAPER_LIT, includeFontPadding: false },
  qText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.2, color: INK, includeFontPadding: false,
  },
  qMark: {
    position: 'absolute', left: 17, right: 0, bottom: 0, height: 2, backgroundColor: EMBER, transformOrigin: '0% 50%',
  },

  card: {
    position: 'absolute', top: RAIL_Y - CARD_H, width: CARD_W, height: CARD_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  cardHinge: { position: 'absolute', left: 3, right: 3, top: CARD_H / 2 - 1.5, height: 1, backgroundColor: SHADE },
  cardNum: {
    fontFamily: 'Inter_700Bold', fontSize: 18, lineHeight: 22, color: INK, includeFontPadding: false, textAlign: 'center',
  },
  critLabel: {
    position: 'absolute', left: CARD_X[0] - 4, top: RAIL_Y + 16, width: CARD_X[2] + CARD_W - CARD_X[0] + 8, height: 15,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, alignItems: 'center', justifyContent: 'center',
  },
  loopPlate: {
    position: 'absolute', left: CARD_X[0] - 8, top: RAIL_Y - CARD_H - 26, width: CARD_X[2] + CARD_W - CARD_X[0] + 16, height: 18,
    borderWidth: 1.5, borderColor: INK, borderRadius: 9, backgroundColor: PLATE_FACE, boxShadow: LIP,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 7,
  },
  loopIcon: {
    width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: EMBER, borderTopColor: 'transparent',
  },
  loopHead: {
    position: 'absolute', right: -3, top: -1, width: 5, height: 5, backgroundColor: EMBER, transform: [{ rotate: '45deg' }],
  },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  sunTag: {
    position: 'absolute', left: 290, top: TAG_Y, width: 98, paddingVertical: 3,
    borderWidth: 1.5, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP, alignItems: 'center',
  },
  sunLeader: {
    position: 'absolute', left: SUN.x - 290 - 0.75, top: 44, width: 1.5, height: SUN.y - SUN.r - TAG_Y - 44, backgroundColor: INK,
  },
  appleString: {
    position: 'absolute', left: STRING.x0, top: STRING.y0 - 0.6, width: STRING.len, height: 1.2, borderRadius: 0.6,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  appleTag: {
    position: 'absolute', left: 300, top: 474, width: 64, paddingVertical: 2,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, alignItems: 'center',
  },
  tagHead: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  tagText: {
    fontFamily: 'Inter_500Medium', fontSize: 9, lineHeight: 11, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  tagFoot: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.3, color: INK, includeFontPadding: false,
    textDecorationLine: 'underline', textDecorationColor: EMBER,
  },

  apple: {
    position: 'absolute', left: APPLE.x - APPLE.r, top: APPLE.y - APPLE.r, width: APPLE.r * 2, height: APPLE.r * 2,
    borderRadius: APPLE.r, backgroundColor: EMBER, borderWidth: 1.5, borderColor: INK,
  },
  appleStalk: { position: 'absolute', left: APPLE.r - 2, top: -5, width: 2, height: 5, borderRadius: 1, backgroundColor: INK },
  appleShine: { position: 'absolute', left: 3, top: 3, width: 4, height: 3, borderRadius: 2, backgroundColor: PAPER_LIT },

  pick: { position: 'absolute' },
  pickFill: { flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 2 },
  pickFillTop: { justifyContent: 'flex-start', paddingBottom: 0, paddingTop: 2 },
  pickLabel: {
    paddingHorizontal: 4, height: 13, borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center',
  },
  pickRight: { backgroundColor: INK },
  pickText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 10, letterSpacing: 0.3, color: INK, includeFontPadding: false,
  },
  pickTextOnInk: { color: PAPER_LIT },
});

export function AestheticsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={AestheticsScene} band={[290, 514]} camera={CAM} />;
}
