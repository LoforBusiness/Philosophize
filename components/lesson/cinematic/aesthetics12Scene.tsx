import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes: codes under 100 are
// exactly rig's and mean what they always did, 100+ reach moves.ts (see emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics12Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// A poem pinned up on a public board stage right, the poet who wrote it planted
// stage left, and a small SEALED BOX riding above his head. Marks accumulate under
// the poem — every reader lands on the same word — and the box never opens.
//
// COMPOSITION / OCCLUSION —
// Every number below was measured off the rig at the poses these beats actually
// hold, swept across the whole idle, not read off the ±36 resting figure (B9a).
//   · the POET is FIXED at x = 62, facing right, and never walks (B15: he is the
//     author, and the whole point is that he will not budge). Across his eight
//     gestures his body span is x = 45.6 … 95.5 and his crown never rises above
//     y 396.1.
//   · the READER walks on ONCE, x = 456 → 224, and then holds that mark for the
//     rest of the lesson. 456 puts him entirely outside the 400-wide stage, so he
//     is at full opacity before a pixel of him is visible and needs no fade at all
//     (C20b). His track is monotonic, so he never flips facing (C18); he ends
//     facing LEFT, toward the poet he is disagreeing with, which is why no beat
//     asks him to look at the board while he stands there.
//   · his measured span across his seven gestures is x = 185.2 … 255.5, so there
//     are 20 units of clear paper before the board and 90 between the two bodies —
//     and 162 between their two MARKS, comfortably past the ~100 at which two heads
//     read as one mass (B9).
//   · THE POEM BOARD is x 276 … 392, y 224 … 360, on two short posts running down to
//     y 376. The reader's crown rides to y 394.4 on the walk-in, so he passes under
//     the posts with 18 units to spare.
//   · THE SEALED BOX is 88 × 50 and is pinned to the poet's HEAD, never to a fixed
//     offset (B10, B13). His head centre sweeps x 56.8 … 65.0 and y 416.1 … 417.4 as
//     he breathes, so the box sweeps x 12.8 … 109.0, y 326.1 … 377.4, with a tether
//     dot always 7 units clear of his crown. It is over him and over nobody else.
//   · THE TWO ANSWER CARDS (Q2) live at x 120 … 260, y 268 … 314 and 338 … 384 — a
//     column of their own between the box and the board, 11 clear of the box, 16
//     clear of the board, and 12 above the reader's crown. Neither card is ever
//     drawn on top of the object it names.
// Nothing is drawn above y 224 or below the ground line, hence band [218, 512] —
// 294 units, which renders at about 2.20×.
//
// DELIBERATE (A5): the poet can never touch his own box. The arm reaches 33 units
// from a shoulder 23 below the head centre, so nothing above the crown is reachable
// at all (B11b) — and that is exactly the lesson, so the staging leans on it rather
// than working around it. No beat asks him to open it.

const POET_X = 62;

const BOARD_L = 276;
const BOARD_W = 116;
const BOARD_T = 224;
const BOARD_B = 360;

const POEM_L = BOARD_L + 6;
const POEM_W = BOARD_W - 12;

// The tally lives in an overflow:hidden clip so the PAPER cover that uncovers it can
// slide right without ever running over the board's own border (D31). Five 4-wide
// marks on a 12 pitch = 52 units, centred in the board.
const TALLY_L = BOARD_L + (BOARD_W - 52) / 2;
const TALLY_T = 344;
const TALLY_W = 52;
const TALLY_H = 12;
const TICK_PITCH = 12;
const TICKS_MAX = 5;

// The box is placed off the head the POSE produces, so it tracks the poet's breath,
// weight rock and head drift instead of hanging at a hand-typed offset (B10).
// 88, not 96: the poet's head drifts over an 8-unit range as he breathes and rocks,
// so a box centred on it sweeps x 12.8 … 109.0. At 96 wide it reached 113 and left
// only 7 units before the answer cards' column at 120 (B9a — measure the span the
// POSE makes, across the whole idle, not the resting mark).
const BOX_W = 88;
const BOX_H = 50;
/** Head centre → box bottom. The crown is 20 above the head centre, so this clears it by 20. */
const BOX_LIFT = 40;
/** Head centre → the tether dot, halfway up that gap. */
const TETHER_LIFT = 30;

// SIZED FOR A FINGER (E37b-2). The band is 294 units, so on a 360dp phone this
// renders at fit ≈ 0.88: a 46-unit card is 40.5dp on a 70-unit pitch = 61.6dp. The
// slop below is exactly half the 24-unit gap, so each target's touch box is 70 units
// — the pitch exactly, and never a unit into its neighbour.
const CARD_L = 120;
const CARD_W = 140;
const CARD_H = 46;
const CARD_T = 268;
const CARD_GAP = 70;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const CARD_SLOP = (CARD_GAP - CARD_H) / 2;

const CARDS = [
  { id: 'poem', label: 'THE PINNED POEM', correct: true },
  { id: 'box', label: 'THE SEALED BOX', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const R = BEATS.map((b) => b.r ?? 0);
const RX = BEATS.map((b) => b.rx ?? 224);
const RDIR = dirsFrom(RX, -1);
const TICKS = BEATS.map((b) => b.ticks ?? 0);
const BOXV = BEATS.map((b) => b.box ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS the subject when a beat moves far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on.
// Beats that do not set `x` stand at POET_X.
const X = BEATS.map((b) => b.x ?? POET_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics12'));

export default function Aesthetics12Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldRMix = useHeld();
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // The box only fades in on the beat that PUTS it there; afterwards it simply
  // stays, instead of re-revealing itself every time the reader taps (C20c).
  const boxFade = (cur.box ?? 0) !== (prev?.box ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const dur = moveTr(RX[p], RX[n], 0.85);
    const tr = ease01(bt.value / dur);
    const t = clock.value;
    // A new mark lands as the reader ARRIVES, not while he is still crossing — the
    // reveal is offset past the move that causes it (C20d).
    const grow = ease01(clamp01((bt.value - dur * 0.55) / 0.9));

    const rMix = keepHeld(heldRMix, travelStance(
      RX[p], RX[n],
      carryFrom(heldRMix, n, emoteHold(R[p], t)), emoteHold(R[n], t), emoteLive(R[n], t, bt.value),
      tr, WALK, 1,
    ));
    // The poet stands on one mark all lesson, so his x never changes and nothing
    // about him goes through a walk. His CLOCK is shifted instead, because stand()
    // takes no seed and two figures breathing on the same frames read as one puppet
    // (B14).
    const pMix = travelStance(
      POET_X, POET_X,
      emoteHold(P[p], t + 4.3), emoteHold(P[n], t + 4.3), emoteLive(P[n], t + 4.3, bt.value),
      tr, WALK, 4,
    );

    const pf = pose(pMix, POET_X, GROUND, K_FIG, 1, 1);
    const hx = pf.head[0].translateX;
    const hy = pf.head[1].translateY;
    const tally = lerp(TICKS[p], TICKS[n], grow);

    return {
      poet: pf,
      reader: pose(rMix, lerp(RX[p], RX[n], tr), GROUND, K_FIG, RDIR[n], 1),
      boxX: hx - BOX_W / 2,
      boxY: hy - BOX_LIFT - BOX_H,
      tetherX: hx - 3,
      tetherY: hy - TETHER_LIFT - 3,
      box: lerp(BOXV[p], BOXV[n], tr) * (boxFade ? grow : 1),
      tally,
      // The verdict only exists once somebody has read the thing.
      verdict: clamp01(tally),
      t,
    };
  });

  const PF = useDerivedValue<Bundle>(() => SCENE.value.poet);
  const RF = useDerivedValue<Bundle>(() => SCENE.value.reader);

  const boxStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.box,
    transform: [{ translateX: SCENE.value.boxX }, { translateY: SCENE.value.boxY }],
  }));
  const tetherStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.box,
    transform: [{ translateX: SCENE.value.tetherX }, { translateY: SCENE.value.tetherY }],
  }));
  const verdictStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.verdict }));
  // A paper cover sliding off the marks, left to right — the house move for a
  // reveal, and the one thing that cannot spring or overshoot (C22b).
  const coverStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (SCENE.value.tally / TICKS_MAX) * TALLY_W }],
  }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: ease01(bt.value / 0.6) }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the poem, pinned up where anyone can read it ────────────────────── */}
      <View style={styles.board} pointerEvents="none" />
      <View style={[styles.post, styles.postL]} pointerEvents="none" />
      <View style={[styles.post, styles.postR]} pointerEvents="none" />
      <Text style={styles.boardTag} pointerEvents="none">THE POEM</Text>
      <Text style={[styles.poemLine, styles.poemL1]} pointerEvents="none">THE LAMP I LEFT</Text>
      <Text style={[styles.poemLine, styles.poemL2]} pointerEvents="none">BURNING FOR YOU</Text>
      <Text style={[styles.poemLine, styles.poemL3]} pointerEvents="none">HAS GONE OUT</Text>

      {/* what every reader who stops has made of it */}
      <Animated.View style={[styles.divider, verdictStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.verdictTag, verdictStyle]} pointerEvents="none">READERS SAY</Animated.Text>
      <Animated.Text style={[styles.verdictWord, verdictStyle]} pointerEvents="none">GRIEF</Animated.Text>
      <View style={styles.tallyClip} pointerEvents="none">
        <View style={[styles.tick, styles.tick0]} pointerEvents="none" />
        <View style={[styles.tick, styles.tick1]} pointerEvents="none" />
        <View style={[styles.tick, styles.tick2]} pointerEvents="none" />
        <View style={[styles.tick, styles.tick3]} pointerEvents="none" />
        <View style={[styles.tick, styles.tick4]} pointerEvents="none" />
        <Animated.View style={[styles.tallyCover, coverStyle]} pointerEvents="none" />
      </View>

      {/* ── what the poet says he meant, and cannot show anyone ─────────────── */}
      <Animated.View style={[styles.tether, tetherStyle]} pointerEvents="none" />
      <Animated.View style={[styles.box, boxStyle]} pointerEvents="none">
        <View style={styles.lid} pointerEvents="none" />
        <Text style={styles.boxLabel} pointerEvents="none">WHAT I MEANT</Text>
        <View style={styles.seal} pointerEvents="none">
          <Text style={styles.sealText} pointerEvents="none">SEALED</Text>
        </View>
      </Animated.View>

      {/* ── Q2: which of the two can settle the meaning? ────────────────────── */}
      {showPick &&
        CARDS.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Animated.View key={c.id} style={[styles.cardSlot, { top: CARD_T + k * CARD_GAP }, cardStyle]}>
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              hitSlop={{ top: CARD_SLOP, bottom: CARD_SLOP, left: CARD_SLOP, right: CARD_SLOP }} disabled={answered}>
                <View
                  style={[
                    styles.card,
                    answered && c.correct && styles.cardRight,
                    answered && chosen && !c.correct && styles.cardWrong,
                  ]}
                >
                  <Text style={[styles.cardText, answered && c.correct && styles.cardTextOn]}>
                    {c.label}
                  </Text>
                </View>
              </Target>
            </Animated.View>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={PF} k={K_FIG} />
      <Stickman D={RF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 12, top: GROUND, height: 1.5, backgroundColor: RULE },

  board: {
    position: 'absolute', left: BOARD_L, top: BOARD_T, width: BOARD_W, height: BOARD_B - BOARD_T,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  post: { position: 'absolute', top: BOARD_B - 2, width: 2.5, height: 18, backgroundColor: SOFT },
  postL: { left: BOARD_L + 26 },
  postR: { left: BOARD_L + BOARD_W - 29 },

  boardTag: {
    position: 'absolute', left: POEM_L, top: 232, width: POEM_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  poemLine: {
    position: 'absolute', left: POEM_L, width: POEM_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9.5, lineHeight: 14, letterSpacing: 0.2, color: INK,
    includeFontPadding: false,
  },
  poemL1: { top: 250 },
  poemL2: { top: 264 },
  poemL3: { top: 278 },

  divider: { position: 'absolute', left: POEM_L + 10, top: 302, width: POEM_W - 20, height: 1.5, backgroundColor: RULE },
  verdictTag: {
    position: 'absolute', left: POEM_L, top: 308, width: POEM_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 7.5, lineHeight: 9, letterSpacing: 1.5, color: SOFT,
    includeFontPadding: false,
  },
  verdictWord: {
    position: 'absolute', left: POEM_L, top: 321, width: POEM_W, textAlign: 'center',
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14, lineHeight: 19, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  tallyClip: {
    position: 'absolute', left: TALLY_L, top: TALLY_T, width: TALLY_W, height: TALLY_H,
    overflow: 'hidden',
  },
  tick: { position: 'absolute', top: 0, width: 4, height: TALLY_H, backgroundColor: INK },
  tick0: { left: 0 },
  tick1: { left: TICK_PITCH },
  tick2: { left: TICK_PITCH * 2 },
  tick3: { left: TICK_PITCH * 3 },
  tick4: { left: TICK_PITCH * 4 },
  tallyCover: { position: 'absolute', left: 0, top: 0, width: TALLY_W, height: TALLY_H, backgroundColor: PAPER },

  tether: { position: 'absolute', left: 0, top: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: INK },
  box: {
    position: 'absolute', left: 0, top: 0, width: BOX_W, height: BOX_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center',
  },
  lid: { width: BOX_W - 4, height: 3.5, backgroundColor: INK },
  boxLabel: {
    marginTop: 8.5, fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 11, letterSpacing: 0.6,
    color: INK, includeFontPadding: false,
  },
  seal: {
    marginTop: 4, width: 60, height: 15, borderRadius: 2, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  sealText: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, lineHeight: 9, letterSpacing: 1.4, color: PAPER,
    includeFontPadding: false,
  },

  cardSlot: { position: 'absolute', left: CARD_L, width: CARD_W },
  card: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  cardRight: { backgroundColor: INK, borderColor: INK },
  cardWrong: { borderColor: SOFT, opacity: 0.45 },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  cardTextOn: { color: PAPER },
});

// Art runs from the board's top edge (224) down to the ground line (500), and the
// reader parks off-stage at x 456, which the crop never sees. 294 units of band.
export function Aesthetics12Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Aesthetics12Scene} band={[218, 512]} camera={CAM} />;
}
