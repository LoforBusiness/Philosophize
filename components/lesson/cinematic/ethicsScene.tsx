import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { BEATS } from './ethicsScript';
import {
  clamp01, ease01, lerp, mixStance, narratorHold, narratorLive, pose, stand,
  type Bundle, type Stance,
} from './rig';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The conscience that steps out of a figure and weighs the deed on a balance,
// beside an animal that shares the instincts but never judges itself.
//
// The hero visual is THE MORAL LEDGER — a two-column tally (ANIMAL · YOU) whose
// rows fill in as the lesson builds: both columns tick for feeling and fairness,
// and only YOU ticks for "judges itself". That single row is the whole lesson and
// the answer to both graded questions, carried visually rather than said twice.
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

const HUMAN_X = 250;
const CRIT_X = 86;
const PIVOT_X = 158;
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
const HPOSE = BEATS.map((b) => b.hpose ?? 0);
const JUDGE = BEATS.map((b) => (b.judge ? 1 : 0));
const CRITTER = BEATS.map((b) => (b.critter ? 1 : 0));
const PLANT = BEATS.map((b) => (b.plant ? 1 : 0));
const Q2 = BEATS.map((b) => (b.weigh === 'q2' ? 1 : 0));
const ORIGINS = BEATS.map((b) => (b.origins ? 1 : 0));

// How many ledger rows are written by each beat. Derived from the script's own
// cues rather than hard beat numbers: the shared instincts appear with the animal,
// and the third row — the one only we can tick — with the conscience.
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
  if (code === 1) return actPose(t);
  if (code === 0) return stand(t);
  return narratorHold(code, t);
}
function hLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code === 1) return actPose(t);
  if (code === 0) return stand(t);
  return narratorLive(code, t, bt);
}

export default function EthicsScene({ clock, bt, bi, qv }: SceneApi) {
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const cur = SHOTS[n], prv = SHOTS[p];
    const tr = ease01(bt.value / cur.tr);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const q = clamp01(qv.value);

    const humanS = mixStance(hHold(HPOSE[p], t), hLive(HPOSE[n], t, bt.value), tr);
    const conOn = L(JUDGE[p], JUDGE[n]);
    const critOn = L(CRITTER[p], CRITTER[n]);

    // On Q2 the animal ambles off — the point that only the human stops to judge.
    const critX = CRIT_X - (Q2[n] ? q * 70 : 0);

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

    return {
      cam: { s: L(prv.s, cur.s), cx: L(prv.cx, cur.cx), cy: L(prv.cy, cur.cy) },
      human: pose(humanS, HUMAN_X, GROUND, K_FIG, -1, 1),
      scaleOn: conOn,
      tip: Math.sin(t * 1.2) * 4 * conOn * (1 - (n === 6 ? q : 0)),  // settles level on a considered Q1
      critOn,
      critX,
      ledOn: cnt > 0 ? (was > 0 ? 1 : write) : 0,
      r0: row(0), r1: row(1), r2: row(2),
      plant: L(PLANT[p], PLANT[n]),
      grow: ease01(bt.value / 1.1),
      // the opening headline, assembling word by word
      askOn: askHere ? (askWas ? 1 : here) : askWas ? away : 0,
      w0: ease01((bt.value - 0.15) / 0.4),
      w1: ease01((bt.value - 0.45) / 0.4),
      w2: ease01((bt.value - 0.75) / 0.4),
      wRule: ease01((bt.value - 1.15) / 0.5),
      // the three-source card, one row at a time
      origOn: ORIGINS[n] ? (ORIGINS[p] ? 1 : here) : ORIGINS[p] ? away : 0,
      o0: ease01((bt.value - 0.25) / 0.45),
      o1: ease01((bt.value - 0.6) / 0.45),
      o2: ease01((bt.value - 0.95) / 0.45),
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
        <Critter S={SCENE} />
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
      <View style={[styles.vRule, { left: COL_A }]} />
      <View style={[styles.vRule, { left: COL_Y }]} />
      <View style={styles.hRule} />

      <Text style={[styles.colHead, { left: COL_A, width: COL_W }]}>ANIMAL</Text>
      <Text style={[styles.colHead, { left: COL_Y, width: COL_W }]}>YOU</Text>

      {ROWS.map((r, k) => (
        <Animated.View key={r.label} style={[styles.row, { top: LED_HEAD_H + k * LED_ROW_H }, rowStyles[k]]}>
          <Text style={styles.rowLabel} numberOfLines={1}>{r.label}</Text>
          <View style={[styles.mark, { left: COL_A + COL_W / 2 - 7 }]}>
            {r.animal ? <View style={styles.dotOn} /> : <View style={styles.dotOff} />}
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
    </Animated.View>
  );
}

// ── where conscience comes from ───────────────────────────────────────────────
function Origins({ S }: { S: SharedValue<any> }) {
  const card = useAnimatedStyle(() => ({ opacity: S.value.origOn }));
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
      <Text style={styles.origHead} numberOfLines={1}>ORIGIN?</Text>
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
      </Animated.View>
    </View>
  );
}

// ── the sprout — Aristotle's flourishing, growing as the line lands ───────────
function Sprout({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.plant }));
  const stem = useAnimatedStyle(() => ({ transform: [{ scaleY: 0.15 + 0.85 * S.value.grow }] }));
  // Each leaf is hinged at the stem (transformOrigin on its inner edge), so it
  // unfurls outward rather than inflating from its own middle.
  const leafL = useAnimatedStyle(() => ({ opacity: S.value.grow, transform: [{ rotate: '34deg' }, { scaleX: S.value.grow }] }));
  const leafR = useAnimatedStyle(() => ({ opacity: S.value.grow, transform: [{ rotate: '-34deg' }, { scaleX: S.value.grow }] }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]} pointerEvents="none">
      <Text style={styles.sproutLabel}>FLOURISHING</Text>
      <Animated.View style={[styles.stem, stem]} />
      <Animated.View style={[styles.leaf, { left: 316, top: 470, transformOrigin: '100% 50%' }, leafL]} />
      <Animated.View style={[styles.leaf, { left: 336, top: 462, transformOrigin: '0% 50%' }, leafR]} />
    </Animated.View>
  );
}

// ── the animal (shares the instincts, never steps out) ────────────────────────
function Critter({ S }: { S: SharedValue<any> }) {
  const wrap = useAnimatedStyle(() => ({
    opacity: S.value.critOn,
    transform: [{ translateX: S.value.critX }, { translateY: GROUND - 22 }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, wrap]} pointerEvents="none">
      {/* body */}
      <View style={{ position: 'absolute', left: -24, top: -10, width: 48, height: 20, borderRadius: 10, backgroundColor: INK }} />
      {/* head (front / left) */}
      <View style={{ position: 'absolute', left: -34, top: -16, width: 17, height: 17, borderRadius: 9, backgroundColor: INK }} />
      {/* ear */}
      <View style={{ position: 'absolute', left: -33, top: -22, width: 7, height: 8, borderRadius: 3, backgroundColor: INK }} />
      {/* legs */}
      <View style={{ position: 'absolute', left: -20, top: 6, width: 3.5, height: 16, backgroundColor: INK }} />
      <View style={{ position: 'absolute', left: -8, top: 8, width: 3.5, height: 14, backgroundColor: INK }} />
      <View style={{ position: 'absolute', left: 10, top: 8, width: 3.5, height: 14, backgroundColor: INK }} />
      <View style={{ position: 'absolute', left: 18, top: 6, width: 3.5, height: 16, backgroundColor: INK }} />
      {/* tail */}
      <View style={{ position: 'absolute', left: 22, top: -8, width: 12, height: 2.5, backgroundColor: INK, borderRadius: 2, transform: [{ rotate: '-25deg' }] }} />
    </Animated.View>
  );
}

// The band is measured AFTER the camera (scale 1.14 about (196, 430)): the ledger's
// top edge lands at 247 and the ankle joints at 329, so [40, 338] holds every pixel
// the scene can draw on any beat and renders it about 1.9× larger than a full-height
// fit would.
export function EthicsLesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={EthicsScene} band={[40, 338]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 40, right: 40, top: GROUND, height: 1.5, backgroundColor: RULE },
  pan: {
    position: 'absolute', left: -66, top: 13, width: 16, height: 10,
    borderColor: INK, borderWidth: 1.5, borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: PAPER,
  },

  askWrap: { position: 'absolute', left: 96, top: 398, width: 116, alignItems: 'center' },
  askText: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT },

  // ── ledger ──────────────────────────────────────────────────────────────────
  ledger: {
    position: 'absolute', left: LED_X, top: LED_T, width: LED_W, height: LED_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  vRule: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: RULE },
  hRule: { position: 'absolute', left: 0, right: 0, top: LED_HEAD_H, height: 1, backgroundColor: RULE },
  colHead: {
    position: 'absolute', top: 6, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.3, color: SOFT,
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

  // ── where conscience comes from ─────────────────────────────────────────────
  orig: {
    position: 'absolute', left: 298, top: 366, width: 92, height: 120,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  origHead: {
    position: 'absolute', left: 0, right: 0, top: 5, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.3, color: SOFT,
    includeFontPadding: false,
  },
  origRule: { position: 'absolute', left: 0, right: 0, top: 19, height: 1, backgroundColor: RULE },
  origRow: { position: 'absolute', left: 0, right: 0, height: 33, alignItems: 'center', justifyContent: 'center' },
  origWho: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.2, color: SOFT,
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
  },
});
