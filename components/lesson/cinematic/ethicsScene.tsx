import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './ethicsScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand, type Bundle, type Stance, } from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import { emoteAny, emoteAnyLive } from './moves';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const { RULE, STONE, SHADE } = stageTone('ethics');
const LIP = `0px 3px 0px ${SHADE}`;   // the shaded lip a toned plate stands on (scripts/lip-stage.mjs)

// The conscience that steps out of a figure and weighs the deed on a balance.
//
// The hero visual is THE MORAL LEDGER — a two-column tally (ANIMAL · YOU) whose
// rows fill in as the lesson builds: both columns tick for feeling and fairness,
// and only YOU ticks for "judges itself". That single row is the whole lesson and
// the answer to both graded questions, carried visually rather than said twice.
// The ledger's ANIMAL column is the only animal in the lesson now: a dog stood at
// the left edge until 11 Sep 2026, and it came out at the reader's request because
// it never looked right.
//
// COMPOSITION / BAND. Everything is drawn inside one camera (scale 1.14 about
// (196, 430), transform-origin CENTRE), so design y maps to screen y as
//   y' = 1.14·y − 249.4      and     x' = 1.14·x − 51.4.
// Measured extremes across every beat, top to bottom:
//   ledger top      y 260  →  47   (the opening headline shares this exact box)
//   ledger bottom   y 348  → 147
//   figure crown    y 359  → 160
//   ORIGIN? card    y 366  → 168   … bottom y 486 → 305
//   ask caption     y 398  → 205
//   balance beam    y 424  → 234
//   ground rule     y 501  → 322
//   ankle joints    y 507  → 329   (the ankle CIRCLE hangs ~7 below GROUND)
// so the band below is [40, 338] — everything the scene can draw, with margin.
// Anything added later must be re-measured through the same map before it ships.
//
// ── EVERY TAP OF THE OPENING CHANGES THE PICTURE ────────────────────────────
// The first lesson of the branch had five taps that held one frame. Each now makes
// the thing it says: "your own conduct" writes under the headline, the reasons FOR
// and AGAINST drop into the balance's pans, the origin card's question turns to
// DISPUTED as the narration disputes it, the ledger's YOU column lights when reason
// is named as what sets humans apart, and a seedling appears on "living well …
// over a complete life", to grow into FLOURISHING when the word arrives.
//
// ACROSS. The balance stands under the ledger's left edge and clear of the figure:
// its pans span design x 58…190 (screen 15…165), the figure's own ink starts near
// screen 194, and his reaching hand stops at design 220. The left pan cannot go much
// further left without coming within a few pixels of the frame.

const HUMAN_X = 250;
/**
 * Where the balance pivots. 124, not the 158 it was.
 *
 * At 158 the right pan reached design x 224, a hand's width from a figure who stands
 * at 250 and reaches left, and the reader said the scale sat too close to him. With
 * the dog gone the left of the stage is free, so the whole balance moved 34 units
 * left: the right pan now stops at 190, and the left pan at 58 lines up under the
 * ledger's left edge.
 */
const PIVOT_X = 124;
const PIVOT_Y = 430;

// ── the moral ledger (design space, inside the camera) ────────────────────────
// Outer box 294×88 at (58, 260); the 2px border means the INNER box is 290×84 and
// every column/row offset below is measured inside that.
const LED_X = 58;
const LED_W = 294;
const LED_T = 260;
const LED_H = 88;
const LED_HEAD_H = 19;
const LED_ROW_H = 21;
const COL_A = 158;                      // ANIMAL column, inner-relative
const COL_Y = 224;                      // YOU column, inner-relative
const COL_W = 66;

const ROWS = [
  { label: 'FEELS FOR OTHERS', animal: true },
  { label: 'SENSE OF FAIRNESS', animal: true },
  { label: 'JUDGES ITSELF', animal: false },
] as const;

// ── the opening headline ──────────────────────────────────────────────────────
// The first beat is a lone figure on bare paper — the thinnest shot in the lesson —
// and the line it carries ("a question arrives on its own") is a word animation
// waiting to happen. The three words assemble one at a time, then a rule sweeps in
// under them. It occupies the LEDGER'S EXACT FOOTPRINT and retires the moment the
// ledger is first written, so it costs the band nothing and can never overlap.
const ASK_WORDS = ['WAS', 'THAT', 'RIGHT?'] as const;

// ── where conscience comes from ───────────────────────────────────────────────
// The Darwin/Freud/Kant beat used to be pixel-for-pixel the beat before it. Their
// three answers are a three-row table, so it gets one, filled in a row at a time.
// It stands in the clear column right of the figure: design x 298…390 (screen
// 288…393) and y 366…486 (screen 168…305), clear of the ledger above (which ends at
// design 348), the ground below, and the figure, whose gestures all swing LEFT
// because it faces left.
const ORIGIN_ROWS = [
  { who: 'DARWIN', from: 'INSTINCT' },
  { who: 'FREUD', from: 'SOCIETY' },
  { who: 'KANT', from: 'REASON' },
] as const;

// ── per-beat cues, precomputed for the worklet ────────────────────────────────
/**
 * A PROP DOES NOT LEAVE THE ROOM AND COME BACK.
 *
 * The script names a cue per beat, and the scene fades the prop with it — which
 * is right for something that arrives, does its job and goes, and wrong the
 * moment a cue reads 0100000100. That is what it read: the dog was here for beat
 * 1, gone for beats 2-6 and back for beat 7, and the balance blinked 0011001100.
 * Both are the subject of the lesson, and both flickered in and out of existence
 * while the reader watched.
 *
 * This fills the gaps between a cue's FIRST and LAST beat, and nothing beyond
 * them. The prop still arrives when the script says and still leaves when the
 * script is done with it; it simply stops teleporting out of the room in between.
 * `npm run check:props` fails the build if any script grows a new one.
 */
function held(flags: number[]): number[] {
  const first = flags.indexOf(1);
  if (first < 0) return flags;
  const last = flags.lastIndexOf(1);
  return flags.map((_, i) => (i >= first && i <= last ? 1 : 0));
}

const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const JUDGE = held(BEATS.map((b) => (b.judge ? 1 : 0)));
const PLANT = BEATS.map((b) => (b.plant ? 1 : 0));
const SEED = BEATS.map((b) => (b.seed || b.plant ? 1 : 0));
/** How grown the sprout is: a seedling before it has a name, full once it does. */
const GROW = BEATS.map((b) => (b.plant ? 1 : b.seed ? 0.32 : 0));
const OWN = BEATS.map((b) => (b.own ? 1 : 0));
/** The weights land on the beat that names reasons and stay while the balance does. */
const FIRST_REASONS = BEATS.findIndex((b) => b.reasons);
const REASONS = BEATS.map((_, k) => (FIRST_REASONS >= 0 && k >= FIRST_REASONS && JUDGE[k] ? 1 : 0));
const DISPUTED = BEATS.map((b) => (b.disputed ? 1 : 0));
const YOU = BEATS.map((b) => (b.you ? 1 : 0));
/** The first graded beat — the balance settles level while it is considered. */
const Q1_AT = BEATS.findIndex((b) => b.weigh === 'q1');

// R7c — on the drag, the reader fills in the ledger's ANIMAL column themselves:
// NONE OF IT empties the column, the middle zone ticks the two feelings, and ALL OF IT
// ticks JUDGES ITSELF as well. The edges are the script's own zone boundaries.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const FEELINGS_FROM = 0.26;
const JUDGING_FROM = 0.72;
/** 0 below the edge, 1 above it, over a short ramp so the dot fills as the knob crosses. */
function past(x: number, edge: number): number {
  'worklet';
  return clamp01((x - edge) / 0.05 + 0.5);
}
const ORIGINS = BEATS.map((b) => (b.origins ? 1 : 0));

// How many ledger rows are written by each beat. Derived from the script's own
// cues rather than hard beat numbers: the shared instincts appear on the beat that
// opens the animal comparison, and the third row — the one only we can tick — with
// the conscience.
const FIRST_CRIT = BEATS.findIndex((b) => b.critter);
const FIRST_JUDGE = BEATS.findIndex((b) => b.judge);
const LEDGER = BEATS.map((_, i) =>
  FIRST_JUDGE >= 0 && i >= FIRST_JUDGE ? 3 : FIRST_CRIT >= 0 && i >= FIRST_CRIT ? 2 : 0
);

interface Shot { s: number; cx: number; cy: number; tr: number }
const SHOTS: Shot[] = BEATS.map((b) => ({
  s: b.summary ? 1 : 1.14, cx: 196, cy: 430, tr: 0.8,
}));

// ── extra human poses (the rig covers gestures 0/2/3/4) ───────────────────────
function actPose(t: number): Stance {
  'worklet';
  const s = stand(t);
  return { ...s, tilt: s.tilt - 0.11, neck: 0.10, fistR: { x: 30, y: 9 }, fistL: { x: -4, y: -3 } };
}
function hHold(code: number, t: number): Stance {
  'worklet';
  if (code >= 100) return emoteAny(code, t);     // the movement catalogue's living holds
  if (code === 1) return actPose(t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code >= 100) return emoteAnyLive(code, t, bt);
  if (code === 1) return actPose(t);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Beats that do not set `x` stand at HUMAN_X.
const X = BEATS.map((b) => b.x ?? HUMAN_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics'));

export default function EthicsScene({ clock, bt, bi, qv, i, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldHumanS = useHeld();
  const cv = useCarry(10);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const t = clock.value;
    const q = clamp01(qv.value);

    const humanS = keepHeld(heldHumanS, mixStance(carryFrom(heldHumanS, n,hHold(HPOSE[p], t)), hLive(HPOSE[n], t, bt.value), tr));
    const conOn = carry(cv, 0, n, JUDGE[p], JUDGE[n], tr);

    // Ledger: a row that was already written stays solid; a row this beat ADDS
    // slides in over the beat's opening, so the tally reads as being filled out.
    const write = ease01(bt.value / 0.75);
    const cnt = LEDGER[n], was = LEDGER[p];
    const row = (k: number) => { 'worklet'; return k < was ? 1 : k < cnt ? write : 0; };

    // Cards that come and go between beats: a card LEAVES quickly (0.25s, so it is
    // gone before whatever replaces it has drawn anything) and ARRIVES unhurried.
    const away = 1 - ease01(bt.value / 0.25);
    const here = ease01(bt.value / 0.6);
    const askHere = cnt === 0 ? 1 : 0;      // the headline lives where the ledger will
    const askWas = was === 0 ? 1 : 0;
    // ONLY WHAT CHANGED MOVES (C20c). The headline writes itself, the origin card
    // fills row by row and the sprout grows on the beat each ARRIVES — the lesson's
    // first, or the first after a beat without it — and each holds finished after,
    // fading out finished too. Keyed to `bt` alone, all three played again on every
    // tap they were still on stage for.
    const askWrites = askHere === 1 && (n === 0 || askWas === 0);
    const origWrites = ORIGINS[n] === 1 && (n === 0 || ORIGINS[p] === 0);
    const plants = PLANT[n] === 1 && (n === 0 || PLANT[p] === 0);

    return {
      cam: { s: lerp(prv.s, cur.s, tr), cx: lerp(prv.cx, cur.cx, tr), cy: lerp(prv.cy, cur.cy, tr) },
      human: lookPose(humanS, HUMAN_X, GROUND, K_FIG, -1, 1, gazeX.value, gazeY.value, gazeOn.value),
      scaleOn: conOn,
      tip: Math.sin(t * 1.2) * 4 * conOn * (1 - (n === Q1_AT ? q : 0)),  // settles level on a considered Q1
      a0: carry(cv, 7, n, 1, reacting ? past(dragPos.value, FEELINGS_FROM) : 1, tr),
      a1: carry(cv, 8, n, 1, reacting ? past(dragPos.value, FEELINGS_FROM) : 1, tr),
      a2: carry(cv, 9, n, 0, reacting ? past(dragPos.value, JUDGING_FROM) : 0, tr),
      ledOn: cnt > 0 ? (was > 0 ? 1 : write) : 0,
      r0: row(0), r1: row(1), r2: row(2),
      plant: carry(cv, 1, n, PLANT[p], PLANT[n], tr),
      seed: carry(cv, 2, n, SEED[p], SEED[n], tr),
      grow: carry(cv, 3, n, GROW[p], GROW[n], plants ? ease01(bt.value / 1.1) : tr),
      own: carry(cv, 4, n, OWN[p], OWN[n], tr),
      reasons: carry(cv, 5, n, REASONS[p], REASONS[n], ease01(bt.value / 0.9)),
      disputed: DISPUTED[n] ? (DISPUTED[p] ? 1 : here) : DISPUTED[p] ? away : 0,
      you: carry(cv, 6, n, YOU[p], YOU[n], tr),
      // the opening headline, assembling word by word
      askOn: askHere ? (askWas ? 1 : here) : askWas ? away : 0,
      w0: askWrites ? ease01((bt.value - 0.15) / 0.4) : 1,
      w1: askWrites ? ease01((bt.value - 0.45) / 0.4) : 1,
      w2: askWrites ? ease01((bt.value - 0.75) / 0.4) : 1,
      wRule: askWrites ? ease01((bt.value - 1.15) / 0.5) : 1,
      // the three-source card, one row at a time
      origOn: ORIGINS[n] ? (ORIGINS[p] ? 1 : here) : ORIGINS[p] ? away : 0,
      o0: origWrites ? ease01((bt.value - 0.25) / 0.45) : 1,
      o1: origWrites ? ease01((bt.value - 0.6) / 0.45) : 1,
      o2: origWrites ? ease01((bt.value - 0.95) / 0.45) : 1,
    };
  });

  const DH = useDerivedValue<Bundle>(() => SCENE.value.human);

  const camStyle = useAnimatedStyle(() => {
    const c = SCENE.value.cam;
    return { transform: [{ translateX: STAGE_W / 2 - c.cx * c.s }, { translateY: STAGE_H / 2 - c.cy * c.s }, { scale: c.s }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, camStyle]}>
        <View style={styles.ground} />
        <Ledger S={SCENE} />
        <AskBanner S={SCENE} />
        <Origins S={SCENE} />
        <Sprout S={SCENE} />
        <Stickman D={DH} k={K_FIG} />
        <Scale S={SCENE} />
      </Animated.View>
    </Animated.View>
  );
}

// ── the moral ledger ──────────────────────────────────────────────────────────
// A plain two-column tally, the way a naturalist would keep score: what the animal
// has, what you have. The first two rows tick twice. The third ticks once.
function Ledger({ S }: { S: SharedValue<any> }) {
  const card = useAnimatedStyle(() => ({ opacity: S.value.ledOn }));
  const you = useAnimatedStyle(() => ({ opacity: S.value.you * 0.9 }));
  const animal = [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.a0 })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.a1 })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.a2 })),
  ];
  const youHead = useAnimatedStyle(() => ({ opacity: S.value.you }));
  const rowStyles = [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.r0, transform: [{ translateX: (1 - S.value.r0) * -10 }] })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.r1, transform: [{ translateX: (1 - S.value.r1) * -10 }] })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.r2, transform: [{ translateX: (1 - S.value.r2) * -10 }] })),
  ];

  return (
    <Animated.View style={[styles.ledger, card]} pointerEvents="none">
      {/* column rules + the header underline */}
      <Animated.View style={[styles.youWash, you]} />
      <View style={[styles.vRule, { left: COL_A }]} />
      <View style={[styles.vRule, { left: COL_Y }]} />
      <View style={styles.hRule} />

      <Text style={[styles.colHead, { left: COL_A, width: COL_W }]}>ANIMAL</Text>
      <Text style={[styles.colHead, { left: COL_Y, width: COL_W }]}>YOU</Text>
      <Animated.View style={[styles.youHead, youHead]}>
        <Text style={styles.youHeadText}>YOU</Text>
      </Animated.View>

      {ROWS.map((r, k) => (
        <Animated.View key={r.label} style={[styles.row, { top: LED_HEAD_H + k * LED_ROW_H }, rowStyles[k]]}>
          <Text style={styles.rowLabel} numberOfLines={1}>{r.label}</Text>
          <View style={[styles.mark, { left: COL_A + COL_W / 2 - 7 }]}>
            {/* the authored tick is the ANIMAL column's resting state (a0–a2), which the
                drag can rewrite; the hollow ring under it is always there */}
            <View style={styles.dotOff} />
            <Animated.View style={[styles.dotOn, styles.dotLayer, animal[k]]} />
          </View>
          <View style={[styles.mark, { left: COL_Y + COL_W / 2 - 7 }]}>
            <View style={styles.dotOn} />
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

// ── the opening headline ──────────────────────────────────────────────────────
// Three words that assemble, then a rule that sweeps under them. Nothing here is
// tappable (pointerEvents="none"), so the tap that advances the beat still lands.
function AskBanner({ S }: { S: SharedValue<any> }) {
  const card = useAnimatedStyle(() => ({ opacity: S.value.askOn }));
  const words = [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.w0, transform: [{ translateY: (1 - S.value.w0) * 12 }] })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.w1, transform: [{ translateY: (1 - S.value.w1) * 12 }] })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.w2, transform: [{ translateY: (1 - S.value.w2) * 12 }] })),
  ];
  const rule = useAnimatedStyle(() => ({
    opacity: S.value.wRule, transform: [{ scaleX: S.value.wRule }],
  }));
  const own = useAnimatedStyle(() => ({ opacity: S.value.own, transform: [{ translateY: (1 - S.value.own) * 5 }] }));
  return (
    <Animated.View style={[styles.ask, card]} pointerEvents="none">
      <View style={styles.askTopRule} />
      <Text style={styles.askEyebrow} numberOfLines={1}>AND THEN, UNASKED —</Text>
      <View style={styles.askRow}>
        {ASK_WORDS.map((w, k) => (
          <Animated.View key={w} style={words[k]}>
            <Text style={styles.askWord}>{w}</Text>
          </Animated.View>
        ))}
      </View>
      <Animated.View style={[styles.askUnder, rule]} />
      <Animated.Text style={[styles.askOwn, own]} numberOfLines={1}>ABOUT YOUR OWN CONDUCT</Animated.Text>
    </Animated.View>
  );
}

// ── where conscience comes from ───────────────────────────────────────────────
function Origins({ S }: { S: SharedValue<any> }) {
  const card = useAnimatedStyle(() => ({ opacity: S.value.origOn }));
  const ask = useAnimatedStyle(() => ({ opacity: 1 - S.value.disputed }));
  const disputed = useAnimatedStyle(() => ({
    opacity: S.value.disputed, transform: [{ scale: 1.25 - 0.25 * S.value.disputed }],
  }));
  const rows = [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.o0, transform: [{ translateX: (1 - S.value.o0) * 10 }] })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.o1, transform: [{ translateX: (1 - S.value.o1) * 10 }] })),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: S.value.o2, transform: [{ translateX: (1 - S.value.o2) * 10 }] })),
  ];
  return (
    <Animated.View style={[styles.orig, card]} pointerEvents="none">
      <Animated.Text style={[styles.origHead, ask]} numberOfLines={1}>ORIGIN?</Animated.Text>
      <Animated.Text style={[styles.origHead, styles.origDisputed, disputed]} numberOfLines={1}>DISPUTED</Animated.Text>
      <View style={styles.origRule} />
      {ORIGIN_ROWS.map((r, k) => (
        <Animated.View key={r.who} style={[styles.origRow, { top: 20 + k * 33 }, rows[k]]}>
          <Text style={styles.origWho} numberOfLines={1}>{r.who}</Text>
          <Text style={styles.origFrom} numberOfLines={1}>{r.from}</Text>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

// ── the balance ───────────────────────────────────────────────────────────────
function Scale({ S }: { S: SharedValue<any> }) {
  const beam = useAnimatedStyle(() => ({
    opacity: S.value.scaleOn,
    transform: [{ translateX: PIVOT_X }, { translateY: PIVOT_Y }, { rotate: `${S.value.tip}deg` }],
  }));
  const post = useAnimatedStyle(() => ({ opacity: S.value.scaleOn }));
  // A weight FALLS into each pan and lands; the two land a beat apart, the way two
  // considerations are put down one after the other.
  const dropL = useAnimatedStyle(() => {
    const u = clamp01(S.value.reasons * 1.25);
    return { opacity: clamp01(u * 3), transform: [{ translateY: (1 - u) * -34 }] };
  });
  const dropR = useAnimatedStyle(() => {
    const u = clamp01(S.value.reasons * 1.25 - 0.25);
    return { opacity: clamp01(u * 3), transform: [{ translateY: (1 - u) * -34 }] };
  });
  const tags = useAnimatedStyle(() => ({ opacity: clamp01(S.value.reasons * 2 - 1) }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* the question the balance exists to answer, stamped above it */}
      <Animated.View style={[styles.askWrap, post]}>
        <Text style={styles.askText}>WAS THAT RIGHT?</Text>
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', left: PIVOT_X - 1.75, top: PIVOT_Y, width: 3.5, height: 68, backgroundColor: INK }, post]} />
      <Animated.View style={[{ position: 'absolute', left: PIVOT_X - 32, top: PIVOT_Y + 68, width: 64, height: 3.5, backgroundColor: INK, borderRadius: 2 }, post]} />
      {/* beam + pans, rotating about the pivot */}
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, transformOrigin: '0% 0%' }, beam]}>
        <View style={{ position: 'absolute', left: -58, top: -1.75, width: 116, height: 3.5, backgroundColor: INK, borderRadius: 2 }} />
        <View style={styles.pan} />
        <View style={[styles.pan, { left: 50 }]} />
        <View style={{ position: 'absolute', left: -58, top: 0, width: 1.5, height: 14, backgroundColor: SOFT }} />
        <View style={{ position: 'absolute', left: 56.5, top: 0, width: 1.5, height: 14, backgroundColor: SOFT }} />
        <Animated.View style={[styles.weight, { left: -63 }, dropL]} />
        <Animated.View style={[styles.weight, { left: 53 }, dropR]} />
        <Animated.Text style={[styles.reasonTag, { left: -88 }, tags]}>FOR</Animated.Text>
        <Animated.Text style={[styles.reasonTag, { left: 28 }, tags]}>AGAINST</Animated.Text>
      </Animated.View>
    </View>
  );
}

// ── the sprout — Aristotle's flourishing, growing as the line lands ───────────
function Sprout({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.seed }));
  const label = useAnimatedStyle(() => ({ opacity: S.value.plant }));
  const stem = useAnimatedStyle(() => ({ transform: [{ scaleY: 0.15 + 0.85 * S.value.grow }] }));
  // Each leaf is hinged at the stem (transformOrigin on its inner edge), so it
  // unfurls outward rather than inflating from its own middle.
  // A seedling's leaves are small, not faint: opacity follows the first third of
  // the growth only, so at seedling size they are already solid ink.
  const leafL = useAnimatedStyle(() => ({ opacity: clamp01(S.value.grow * 3), transform: [{ rotate: '34deg' }, { scaleX: S.value.grow }] }));
  const leafR = useAnimatedStyle(() => ({ opacity: clamp01(S.value.grow * 3), transform: [{ rotate: '-34deg' }, { scaleX: S.value.grow }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]} pointerEvents="none">
      <Animated.Text style={[styles.sproutLabel, label]}>FLOURISHING</Animated.Text>
      <Animated.View style={[styles.stem, stem]} />
      <Animated.View style={[styles.leaf, { left: 316, top: 470, transformOrigin: '100% 50%' }, leafL]} />
      <Animated.View style={[styles.leaf, { left: 336, top: 462, transformOrigin: '0% 50%' }, leafR]} />
    </Animated.View>
  );
}


// The band is measured AFTER the camera (scale 1.14 about (196, 430)): the ledger's
// top edge lands at 247 and the ankle joints at 329, so [40, 338] holds every pixel
// the scene can draw on any beat and renders it about 1.9× larger than a full-height
// fit would.
export function EthicsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={EthicsScene} band={[40, 338]} camera={CAM} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  pan: {
    position: 'absolute', left: -66, top: 13, width: 16, height: 10,
    borderColor: INK, borderWidth: 1.5, borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: PAPER,
  },

  // Centred on the pivot, so the caption moves with the balance.
  askWrap: { position: 'absolute', left: PIVOT_X - 58, top: 398, width: 116, alignItems: 'center' },
  askText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },

  // The two weights sit INSIDE the pans (a pan is 16 wide at beam x ±58); their
  // captions hang under the pans, clear of the post at the pivot and the base.
  weight: { position: 'absolute', top: 15, width: 10, height: 7, borderRadius: 1.5, backgroundColor: INK },
  reasonTag: {
    position: 'absolute', top: 27, width: 60, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.8, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  // ── ledger ──────────────────────────────────────────────────────────────────
  youWash: {
    position: 'absolute', left: COL_Y, top: 0, bottom: 0, width: COL_W, backgroundColor: SHADE,
  },
  youHead: {
    position: 'absolute', left: COL_Y + 8, top: 3, width: COL_W - 16, height: 14, borderRadius: 3,
    backgroundColor: INK, alignItems: 'center', justifyContent: 'center',
  },
  youHeadText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.3, color: PAPER, includeFontPadding: false,
  },
  ledger: {
    position: 'absolute', left: LED_X, top: LED_T, width: LED_W, height: LED_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE, boxShadow: LIP,
  },
  vRule: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: RULE },
  hRule: { position: 'absolute', left: 0, right: 0, top: LED_HEAD_H, height: 1, backgroundColor: RULE },
  colHead: {
    position: 'absolute', top: 6, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.3, color: INK,
    includeFontPadding: false,
  },
  row: { position: 'absolute', left: 0, right: 0, height: LED_ROW_H, justifyContent: 'center' },
  rowLabel: {
    position: 'absolute', left: 11, width: COL_A - 17,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 0.5, color: INK,
    includeFontPadding: false,
  },
  mark: { position: 'absolute', top: LED_ROW_H / 2 - 7, width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  dotOn: { width: 13, height: 13, borderRadius: 7, backgroundColor: INK },
  dotOff: { width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: SOFT },
  dotLayer: { position: 'absolute', left: 0.5, top: 0.5 },

  // ── the opening headline ────────────────────────────────────────────────────
  // Exactly the ledger's box (58…352 × 260…348), so the band is unchanged and the
  // two can never be on stage together — the headline leaves as the ledger arrives.
  ask: { position: 'absolute', left: LED_X, top: LED_T, width: LED_W, height: LED_H },
  askTopRule: { position: 'absolute', left: 0, right: 0, top: 0, height: 1.5, backgroundColor: RULE },
  askEyebrow: {
    position: 'absolute', left: 0, right: 0, top: 10, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  askRow: {
    position: 'absolute', left: 0, right: 0, top: 28,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10,
  },
  askWord: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 23, lineHeight: 30, color: INK,
    includeFontPadding: false,
  },
  askUnder: {
    position: 'absolute', left: (LED_W - 180) / 2, top: 68, width: 180, height: 2,
    backgroundColor: INK,
  },

  // The second line of the headline, under its rule (68) and inside its box (88).
  askOwn: {
    position: 'absolute', left: 0, right: 0, top: 74, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.5, color: INK, includeFontPadding: false,
  },

  // ── where conscience comes from ─────────────────────────────────────────────
  orig: {
    position: 'absolute', left: 298, top: 366, width: 92, height: 120,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  origHead: {
    position: 'absolute', left: 0, right: 0, top: 5, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.3, color: SOFT,
    includeFontPadding: false,
  },
  origRule: { position: 'absolute', left: 0, right: 0, top: 19, height: 1, backgroundColor: RULE },
  origDisputed: { color: INK, letterSpacing: 1.5 },
  origRow: { position: 'absolute', left: 0, right: 0, height: 33, alignItems: 'center', justifyContent: 'center' },
  origWho: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  origFrom: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.3, color: INK,
    includeFontPadding: false, marginTop: 2,
  },

  // ── sprout ──────────────────────────────────────────────────────────────────
  stem: {
    position: 'absolute', left: 334.5, top: 452, width: 3, height: 48,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  leaf: {
    position: 'absolute', width: 20, height: 9, borderRadius: 6,
    backgroundColor: INK, transformOrigin: '50% 50%',
  },
  sproutLabel: {
    position: 'absolute', left: 288, top: 430, width: 96, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.3, color: SOFT,
    includeFontPadding: false,
  },
});
