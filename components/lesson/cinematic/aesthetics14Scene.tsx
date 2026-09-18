import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics14Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ONE CASK AND THREE VERDICTS, and the cask empties (H64). The verdict cards are
// the Q1 targets, so the thing tapped is the thing the whole lesson is about (E33).
//
// · the figure stands at x = 46 facing right. Widest ink is a fist at x ≈ 79, so
//   there are 29 clear units before the cask begins (B9).
// · the CASK is x 108…218, y 320…500 — 110 × 180, standing on the ground line.
//   Its two hoops are at y 366 and y 452; the wine fills from the inside floor
//   (y 492) upward to y 328 at the brim, so a full cask stops 8 below its own rim.
// · the KEY lies on the inside floor at x 128…198, y 462…486 — inside the cask on
//   every axis, and only ever drawn once the wine is below it.
// · the BOARD is x 240…390, three cards 150 × 48 at tops y 226 / 292 / 358. The
//   lowest ends at 406, clear of the ground line by 94.
// · highest ink in the scene is the first card at y 226; lowest is the ground at
//   500. The figure's crown is y 397 — level with the cask's lower hoop, and 29
//   units left of the cask, so nothing overlaps anything (D23).
//
// The band is 292 rather than the 218 the ink alone needs, and that is deliberate:
// at 218 one figure owns 47% of the frame and IS the composition (check:scale's
// 38% line). 292 is the library median, and the cost is 4% of on-screen size.

const FIG_X = 46;

const CASK_L = 108;
const CASK_W = 110;
const CASK_T = 320;
const CASK_H = 180;
const CASK_WALL = 2.5;
/** The inside of the barrel — where wine, and a key, are allowed to be. */
const IN_L = CASK_L + CASK_WALL;
const IN_T = CASK_T + 8;
const IN_H = CASK_H - 16;

const BOARD_L = 240;
const BOARD_W = 150;
const CARD_H = 48;
const CARD_T = [226, 292, 358];

const VERDICTS = [
  { id: 'room', text: 'NOTHING WRONG WITH IT', correct: false },
  { id: 'iron', text: 'A FAINT TASTE OF IRON', correct: true },
  { id: 'sweet', text: 'TOO SWEET FOR ME', correct: false },
];

const G = BEATS.map((b) => b.g ?? 0);
const BOARD = BEATS.map((b) => b.board ?? 0);
const LEVEL = BEATS.map((b) => b.level ?? 0);
const KEY = BEATS.map((b) => b.key ?? 0);
const TICKV = BEATS.map((b) => (b.unanimousTick ? 1 : 0));
const DIFFV = BEATS.map((b) => (b.diffType ? 1 : 0));
const ESSAYV = BEATS.map((b) => (b.essayTag ? 1 : 0));
const EQUALV = BEATS.map((b) => (b.noEqual ? 1 : 0));

// The camera, from the staging (H60b): the figure never moves, so `followMoves`
// gives the still-lesson rhythm — a push on the quote, a pull back to the whole
// band on both graded beats and the summary, and a rest otherwise.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics14'));

export default function Aesthetics14Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(7);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // Only what CHANGED this beat re-draws itself; everything else holds (C20c/H58).
  const keyFade = (cur.key ?? 0) !== (prev?.key ?? 0);
  // The four tap events (group AH).
  const tickFade = !!cur.unanimousTick !== !!prev?.unanimousTick;
  const diffFade = !!cur.diffType !== !!prev?.diffType;
  const essayFade = !!cur.essayTag !== !!prev?.essayTag;
  const equalFade = !!cur.noEqual !== !!prev?.noEqual;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);          // nobody walks; this is a pose blend
    const t = clock.value;
    // Draining is the slowest thing on the stage on purpose — a cask that empties
    // in a fifth of a second is a cut, and the reader is meant to watch it go.
    const drain = ease01(bt.value / 1.6);
    const grow = ease01(bt.value / 0.9);

    const s = keepHeld(heldS, mixStance(
      carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr,
    ));
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      // R7c — how many verdicts still stand IS the question. Every verdict equal and
      // all three stay pinned; one right answer and two come down.
      board: carry(cv, 0, n, BOARD[p], reacting ? 3 - dragPos.value * 2 : BOARD[n], grow),
      level: carry(cv, 1, n, LEVEL[p], LEVEL[n], drain),
      key: carry(cv, 2, n, KEY[p], KEY[n], tr, keyFade ? grow : 1),
      // The four tap events (group AH) — each carried so it fades OUT as well as in.
      tick: carry(cv, 3, n, TICKV[p], TICKV[n], tickFade ? grow : 1),
      diff: carry(cv, 4, n, DIFFV[p], DIFFV[n], diffFade ? grow : 1),
      essay: carry(cv, 5, n, ESSAYV[p], ESSAYV[n], essayFade ? grow : 1),
      equal: carry(cv, 6, n, EQUALV[p], EQUALV[n], equalFade ? grow : 1),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;

  // The wine: a column pinned to the inside floor, scaled from its own bottom, so
  // the surface is the only edge that moves.
  const wine = useAnimatedStyle(() => ({ transform: [{ scaleY: SCENE.value.level }] }));
  const keyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.key }));
  const tickStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.tick,
    transform: [{ scale: 0.6 + SCENE.value.tick * 0.4 }],
  }));
  const diffStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.diff }));
  const essayStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.essay,
    transform: [{ translateY: (1 - SCENE.value.essay) * 6 }],
  }));
  const equalStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.equal }));

  return (
    <Animated.View style={styles.scene}>
      {/* A small plaque above the figure: the essay just named. */}
      <Animated.View style={[styles.essayTag, essayStyle]} pointerEvents="none">
        <Text style={styles.essayText}>HUME, 1757</Text>
      </Animated.View>

      {/* ── THE CASK ─────────────────────────────────────────────────────── */}
      <View style={styles.cask} pointerEvents="none">
        <Animated.View style={[styles.wine, wine]} pointerEvents="none" />
        {/* The key, drawn as three parts: bow, shaft, teeth — plus the thong that
            is the other half of what the two palates found. */}
        <Animated.View style={[styles.keyWrap, keyStyle]} pointerEvents="none">
          <View style={styles.thong} />
          <View style={styles.keyBow} />
          <View style={styles.keyShaft} />
          <View style={styles.keyTooth1} />
          <View style={styles.keyTooth2} />
        </Animated.View>
      </View>
      {/* Hoops sit OUTSIDE the cask box so they read as bands round it rather than
          as lines drawn in the wine. */}
      <View style={[styles.hoop, { top: 366 }]} pointerEvents="none" />
      <View style={[styles.hoop, { top: 452 }]} pointerEvents="none" />

      {/* ── THE BOARD ────────────────────────────────────────────────────── */}
      {VERDICTS.map((v, k) => (
        <Verdict
          key={v.id}
          k={k}
          SCENE={SCENE}
          live={live}
          answered={answered}
          picked={picked}
          onPick={onPick}
        />
      ))}

      {/* A tick badges the room's own card: the verdict was unanimous. */}
      <Animated.View style={[styles.tickBadge, tickStyle]} pointerEvents="none">
        <Text style={styles.tickText}>✓</Text>
      </Animated.View>

      {/* A “≠” sits between the two dissents — a complaint of a different type. */}
      <Animated.Text style={[styles.diffMark, diffStyle]} pointerEvents="none">≠</Animated.Text>

      {/* A struck brace runs down the board: Hume denies the three are equally good. */}
      <Animated.View style={[styles.equalBrace, equalStyle]} pointerEvents="none" />
      <Animated.View style={[styles.equalStrike, equalStyle]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One verdict, pinned to the board — and one of the Q1 targets. */
function Verdict({
  k, SCENE, live, answered, picked, onPick,
}: {
  k: number;
  SCENE: { value: { board: number } };
  live: boolean;
  answered: boolean;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const v = VERDICTS[k];
  const on = answered && v.correct;

  const wrap = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.board - k);
    return { opacity: a, transform: [{ translateX: (1 - a) * 12 }] };
  });

  return (
    <Animated.View style={[styles.card, { top: CARD_T[k] }, wrap]}>
      <Target
        id={v.id}
        correct={v.correct}
        picked={picked}
        onPick={onPick}
        style={styles.fill}
        disabled={!live || answered}
      >
        <View
          style={[
            styles.cardInner,
            on && styles.pickRight,
            answered && picked === v.id && !v.correct && styles.pickWrong,
          ]}
        >
          <Text style={[styles.cardText, on && styles.onInk]} numberOfLines={2}>{v.text}</Text>
        </View>
      </Target>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  cask: {
    position: 'absolute', left: CASK_L, top: CASK_T, width: CASK_W, height: CASK_H,
    borderWidth: CASK_WALL, borderColor: INK, borderRadius: 12,
    backgroundColor: STONE, boxShadow: LIP, overflow: 'hidden',
  },
  wine: {
    position: 'absolute', left: 0, right: 0, bottom: 0, top: IN_T - CASK_T,
    backgroundColor: INK, transformOrigin: '50% 100%',
  },
  hoop: {
    position: 'absolute', left: CASK_L - 5, width: CASK_W + 10, height: 4,
    backgroundColor: SOFT, borderRadius: 2,
  },

  // The key lies flat on the inside floor of the cask, shaft running right.
  keyWrap: {
    position: 'absolute', left: IN_L - CASK_L + 12, top: IN_T + IN_H - CASK_T - 30,
    width: 70, height: 24,
  },
  thong: {
    position: 'absolute', left: 0, top: 4, width: 26, height: 2,
    backgroundColor: SOFT, transform: [{ rotate: '-16deg' }],
  },
  keyBow: {
    position: 'absolute', left: 18, top: 6, width: 16, height: 16, borderRadius: 8,
    borderWidth: 3, borderColor: INK,
  },
  keyShaft: { position: 'absolute', left: 33, top: 12, width: 32, height: 3, backgroundColor: INK },
  keyTooth1: { position: 'absolute', left: 55, top: 12, width: 3, height: 8, backgroundColor: INK },
  keyTooth2: { position: 'absolute', left: 62, top: 12, width: 3, height: 6, backgroundColor: INK },

  card: { position: 'absolute', left: BOARD_L, width: BOARD_W, height: CARD_H },
  cardInner: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },

  // ── the four tap events (group AH) ───────────────────────────────────────
  // A plaque above the figure: the essay just named.
  essayTag: {
    position: 'absolute', left: 18, top: 362, paddingHorizontal: 5, paddingVertical: 1.5,
    borderWidth: 1.5, borderColor: INK, borderRadius: 5, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  essayText: { fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  // A tick on the room's own card — the room's verdict was unanimous.
  tickBadge: {
    position: 'absolute', left: 372, top: 256, width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  tickText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: INK, includeFontPadding: false },

  // The gap between the iron and sweet cards — two different kinds of complaint.
  diffMark: {
    position: 'absolute', left: BOARD_L, top: 341, width: BOARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13, color: INK, includeFontPadding: false,
  },

  // A struck brace down the board's left edge: Hume denies the three are equal.
  equalBrace: { position: 'absolute', left: 232, top: 226, width: 2, height: 180, backgroundColor: SHADE },
  equalStrike: {
    position: 'absolute', left: 224, top: 308, width: 18, height: 2, backgroundColor: INK,
    transform: [{ rotate: '45deg' }],
  },
});

// Ink runs from the top verdict card (226) to the ground line (500). Band 220…512
// = 292 — the library median, and the smallest band that keeps one figure under
// check:scale's 38% share (103 / 292 = 35%).
export function Aesthetics14Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics14Scene} band={[220, 512]} camera={CAM} />;
}
