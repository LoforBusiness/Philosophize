import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './strong4Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// An instrument panel the presenter reads from.
//
//   · THE CERTAINTY GAUGE — a 320-wide 0→100% scale with quarter ticks, an inked
//     fill and a needle that travels to the reading. A padlock guards the 100% end
//     and snaps shut only for a deduction; dice roll out for an induction; a banner
//     stamps GUARANTEED or LIKELY.
//   · THE TWO RULER CARDS — deductive vs inductive, each listing what it aims at,
//     how it is graded, and what it becomes with true premises. The card being
//     discussed inks its title strip SOLID and reverses the word out in paper, so
//     which yardstick is in play reads at a glance. This pair IS "wrong ruler,
//     wrong verdict".
//
// On the graded beat the cards clear and four one-word VERDICT CHIPS take the
// column, so the question is answered by tapping in the scene.
//
// No camera transform: the art is authored straight into stage space, so the band
// below is exact. The presenter's widest reach ends at x ≈ 134 and the card
// column starts at x = 152, so the figure can never cover a chip.

const K = K_FIG * 1.08;            // stage units per rig unit (figure ≈ 111 tall)
const FIG_X = 76;

// ── gauge ────────────────────────────────────────────────────────────────────
const G_L = 40;
const G_W = 320;
const G_Y = 226;
const G_H = 26;

// ── column: the ruler cards, and the ballot that replaces them ───────────────
const COL_L = 152;
const COL_W = 234;
const COL_TOP = 324;
// The card holds a 23-tall title strip over THREE 17.5-tall lines = 75.5, plus a
// 2 border top and bottom = 79.5. At 78 that overflowed its own `overflow: hidden`
// box and Android shaved the bottom off the third line; 84 leaves 4.5 of slack.
const CARD_H = 84;                 // 324..408 and 412..496
const CHIP_H = 40;
const CHIP_STEP = 43;              // 324 · 367 · 410 · 453 → ends at 493

// One word per chip, deliberately. A gloss line under each ("induction's version of
// valid") handed the answer straight to the reader; a bare verdict makes them read
// the two ruler cards they were just shown, which is the point of the lesson. It
// also buys the type room to sit at 16px instead of 10.
const CHIPS = [
  { id: 'a', title: 'STRONG', correct: true },
  { id: 'b', title: 'SOUND', correct: false },
  { id: 'c', title: 'INVALID', correct: false },
  { id: 'd', title: 'WEAK', correct: false },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const FILL = BEATS.map((b) => b.fill ?? 0.5);
const LOCK = BEATS.map((b) => b.lock ?? 0);
const DICE = BEATS.map((b) => b.dice ?? 0);
const VERD = BEATS.map((b) => b.verdict ?? 0);
const LENS = BEATS.map((b) => b.lens ?? 0);
const TR = 0.85;

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.lever ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('strong4'));

export default function Strong4Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const showPick = !!cur.interact;
  const leaving = !!prev?.interact && !cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    const dice = carry(cv, 0, n, DICE[p], DICE[n], tr);
    const v = carry(cv, 1, n, VERD[p], VERD[n], tr);
    const lens = carry(cv, 2, n, LENS[p], LENS[n], tr);
    return {
      fig: pose(s, FIG_X, GROUND, K, 1, 1),
      fill: carry(cv, 3, n, FILL[p], FILL[n], tr),
      // R7b — the arm asks for a guarantee, and the lock answers. At the first
      // setting the verdict demands certainty and the lock is shut; move away and it
      // opens, because likelihood was never trying to lock anything.
      lock: carry(cv, 4, n, LOCK[p], reacting ? 1 - dragPos.value : LOCK[n], tr),
      dice,
      banner: clamp01(v),
      likely: clamp01(v) - clamp01(v - 1),
      sure: clamp01(v - 1),
      deduct: clamp01(lens) - clamp01(lens - 1),
      induct: clamp01(lens - 1),
      // The ruler cards and the chips cross-fade, so neither ever pops.
      cards: showPick ? 1 - grow : leaving ? grow : 1,
      ballot: showPick ? grow : 0,
      // dice jitter only while they are out
      wob: Math.sin(t * 6.0) * 5 * dice,
      wob2: Math.sin(t * 5.1 + 1.3) * 5 * dice,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: Math.max(0.001, SCENE.value.fill) }] }));
  const needleStyle = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.fill * G_W }] }));
  const lockStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lock, transform: [{ scale: 0.6 + 0.4 * SCENE.value.lock }] }));
  const die1Style = useAnimatedStyle(() => ({ opacity: SCENE.value.dice, transform: [{ rotate: `${SCENE.value.wob}deg` }] }));
  const die2Style = useAnimatedStyle(() => ({ opacity: SCENE.value.dice, transform: [{ rotate: `${SCENE.value.wob2}deg` }] }));
  const bannerStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.banner }));
  const likelyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.likely }));
  const sureStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.sure }));
  const cardsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cards }));
  const dedStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.deduct }));
  const indStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.induct }));
  const ballotStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.ballot,
    transform: [{ translateY: (1 - SCENE.value.ballot) * 10 }],
  }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── the certainty gauge ─────────────────────────────────────────────── */}
      <View style={styles.gaugeLab} pointerEvents="none">
        <Text style={styles.gaugeLabT}>HOW SURE IS THE CONCLUSION?</Text>
      </View>
      <View style={styles.track} pointerEvents="none">
        <View style={[styles.tick, { left: G_W * 0.25 }]} />
        <View style={[styles.tick, { left: G_W * 0.5 }]} />
        <View style={[styles.tick, { left: G_W * 0.75 }]} />
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <Animated.View style={[styles.needle, needleStyle]} pointerEvents="none" />
      <Text style={[styles.scaleT, { left: G_L }]}>0%</Text>
      <Text style={[styles.scaleT, { left: G_L + G_W / 2 - 14, width: 28, textAlign: 'center' }]}>50%</Text>
      <Text style={[styles.scaleT, { left: G_L + G_W - 30, width: 30, textAlign: 'right' }]}>100%</Text>

      {/* the guarantee lock, standing at the 100% end */}
      <Animated.View style={[styles.lock, lockStyle]} pointerEvents="none">
        <View style={styles.shackle} />
        <View style={styles.lockBody} />
      </Animated.View>

      {/* the verdict banner */}
      <Animated.View style={[styles.banner, bannerStyle]} pointerEvents="none">
        <Animated.Text style={[styles.bannerT, likelyStyle]}>LIKELY</Animated.Text>
        <Animated.Text style={[styles.bannerT, sureStyle]}>GUARANTEED</Animated.Text>
      </Animated.View>

      {/* the dice — only out for an induction */}
      <Animated.View style={[styles.die, { left: 200 }, die1Style]} pointerEvents="none">
        <View style={[styles.pip, { top: 5, left: 5 }]} />
        <View style={[styles.pip, { bottom: 5, right: 5 }]} />
      </Animated.View>
      <Animated.View style={[styles.die, { left: 240 }, die2Style]} pointerEvents="none">
        <View style={[styles.pip, { top: 5, left: 5 }]} />
        <View style={[styles.pip, { top: 13.5, left: 13.5 }]} />
        <View style={[styles.pip, { bottom: 5, right: 5 }]} />
      </Animated.View>

      <Stickman D={DF} k={K} />

      {/* ── the two ruler cards ─────────────────────────────────────────────── */}
      <Animated.View style={[styles.cards, cardsStyle]} pointerEvents="none">
        <View style={[styles.card, { top: COL_TOP }]}>
          {/* the active ruler's title strip inks SOLID, with the word reversed out —
              a RULE-grey wash was too quiet to say "this is the one in play" */}
          <View style={styles.cardHead}>
            <Animated.View style={[styles.cardHeadOn, dedStyle]} />
            <Text style={styles.cardHeadT}>DEDUCTIVE</Text>
            <Animated.Text style={[styles.cardHeadT, styles.cardHeadTOn, dedStyle]}>DEDUCTIVE</Animated.Text>
          </View>
          <Text style={styles.cardLine}>aims to  GUARANTEE</Text>
          <Text style={styles.cardLine}>graded  VALID / INVALID</Text>
          <Text style={styles.cardLine}>+ true premises → SOUND</Text>
        </View>
        <View style={[styles.card, { top: COL_TOP + CARD_H + 4 }]}>
          <View style={styles.cardHead}>
            <Animated.View style={[styles.cardHeadOn, indStyle]} />
            <Text style={styles.cardHeadT}>INDUCTIVE</Text>
            <Animated.Text style={[styles.cardHeadT, styles.cardHeadTOn, indStyle]}>INDUCTIVE</Animated.Text>
          </View>
          <Text style={styles.cardLine}>aims to make  LIKELY</Text>
          <Text style={styles.cardLine}>graded  STRONG / WEAK</Text>
          <Text style={styles.cardLine}>+ true premises → COGENT</Text>
        </View>
      </Animated.View>

      {/* ── the verdict chips: the question is answered here ────────────────── */}
      {showPick ? (
        <Animated.View style={[styles.ballot, ballotStyle]} pointerEvents="box-none">
          <Text style={styles.ballotHdr}>TAP THE RIGHT VERDICT</Text>
          {CHIPS.map((c, k) => {
            const chosen = picked === c.id;
            return (
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.chipSlot, { top: 18 + k * CHIP_STEP }]} disabled={answered}>
                <View
                  style={[
                    styles.chip,
                    answered && c.correct && styles.chipRight,
                    answered && chosen && !c.correct && styles.chipWrong,
                  ]}
                >
                  <Text style={[styles.chipT, answered && c.correct && styles.chipTOn]}>{c.title}</Text>
                </View>
              </Target>
            );
          })}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 12, width: 140, top: GROUND, height: 2, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  // ── gauge ─────────────────────────────────────────────────────────────────
  gaugeLab: { position: 'absolute', left: G_L, top: 210, width: G_W },
  gaugeLabT: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT, includeFontPadding: false },
  track: {
    position: 'absolute', left: G_L, top: G_Y, width: G_W, height: G_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER, overflow: 'hidden',
  },
  tick: { position: 'absolute', top: 0, bottom: 0, width: 1.5, backgroundColor: RULE },
  fill: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%',
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  // needle spans 218..256; lock 222..265; scale labels 256..269
  needle: { position: 'absolute', left: G_L - 1.5, top: G_Y - 6, width: 3, height: G_H + 12, backgroundColor: INK, borderRadius: 2 },
  scaleT: {
    position: 'absolute', top: G_Y + G_H + 6,
    fontFamily: 'Inter_500Medium', fontSize: 10, color: SOFT, includeFontPadding: false,
  },

  lock: { position: 'absolute', left: 366, top: 222, width: 32, alignItems: 'center', transformOrigin: '50% 50%' },
  shackle: { width: 20, height: 16, borderWidth: 3, borderColor: INK, borderBottomWidth: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  lockBody: { width: 30, height: 28, borderWidth: 2.5, borderColor: INK, backgroundColor: INK, borderRadius: 3, marginTop: -1 },

  banner: {
    position: 'absolute', left: 36, top: 274, width: 140, height: 28,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  bannerT: {
    position: 'absolute', top: 5, width: 140, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 17, letterSpacing: 1.6, color: INK, includeFontPadding: false,
  },

  die: {
    position: 'absolute', top: 272, width: 32, height: 32, borderWidth: 2.5, borderColor: INK,
    borderRadius: 5, backgroundColor: PAPER, transformOrigin: '50% 50%',
  },
  pip: { position: 'absolute', width: 5, height: 5, borderRadius: 2.5, backgroundColor: INK },

  // ── ruler cards ───────────────────────────────────────────────────────────
  cards: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  card: {
    position: 'absolute', left: COL_L, width: COL_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER, overflow: 'hidden',
  },
  cardHead: { height: 23, justifyContent: 'center', paddingHorizontal: 10, borderBottomWidth: 1.5, borderBottomColor: RULE },
  cardHeadOn: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: INK },
  cardHeadT: {
    fontFamily: 'Inter_700Bold', fontSize: 13.5, lineHeight: 17, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  // The head box is 23 tall with a 1.5 border inside it, so a 17-tall line centres
  // at (23 − 1.5 − 17) / 2 = 2.25 — the reversed copy must sit exactly on the base.
  cardHeadTOn: { position: 'absolute', left: 10, top: 2.25, color: PAPER },
  cardLine: {
    fontFamily: 'Inter_500Medium', fontSize: 11.5, lineHeight: 17.5, color: SOFT, paddingHorizontal: 10, includeFontPadding: false,
  },

  // ── ballot ────────────────────────────────────────────────────────────────
  ballot: { position: 'absolute', left: COL_L, top: 306, width: COL_W, height: 200 },
  ballotHdr: {
    position: 'absolute', left: 0, top: 0, width: COL_W,
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  // Tap target: 234 × 40 stage units carrying one 16px word — a verdict plate.
  chipSlot: { position: 'absolute', left: 0, width: COL_W, height: CHIP_H },
  chip: {
    width: COL_W, height: CHIP_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12,
  },
  chipRight: { backgroundColor: INK, borderColor: INK },
  chipWrong: { borderColor: SOFT, opacity: 0.45 },
  chipT: { fontFamily: 'Inter_700Bold', fontSize: 16, lineHeight: 21, letterSpacing: 2.2, color: INK, includeFontPadding: false },
  chipTOn: { color: PAPER },
});

// BAND. Topmost ink is the gauge caption at 210 (the needle starts at 220, the lock
// at 222); the lowest is the ground line at 500 + 2 thick. In between, every extreme
// is accounted for: the scale labels end at 270, the wobbling dice at 305, the lower
// ruler card at 496, the last verdict chip at 493, the figure's crown at 350. So
// [202, 510] holds the lot with 8 units of margin at each end — and since the art
// genuinely spans 292 units there is no tighter honest crop.
export function Strong4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Strong4Scene} band={[202, 510]} camera={CAM} />;
}
