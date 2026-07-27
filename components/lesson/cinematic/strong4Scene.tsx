import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './strong4Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// An instrument panel the presenter reads from.
//
//   · THE CERTAINTY GAUGE — a 320-wide 0→100% scale with quarter ticks, an inked
//     fill and a needle that travels to the reading. A padlock guards the 100% end
//     and snaps shut only for a deduction; dice roll out for an induction; a banner
//     stamps GUARANTEED or LIKELY.
//   · THE TWO RULER CARDS — deductive vs inductive, each listing what it aims at,
//     how it is graded, and what it becomes with true premises. The card being
//     discussed inks its title strip. This pair IS "wrong ruler, wrong verdict".
//
// On the graded beat the cards clear and four VERDICT CHIPS take the column, so
// the question is answered by tapping in the scene.
//
// No camera transform: the art is authored straight into stage space, so the band
// below is exact. The presenter's widest reach ends at x ≈ 134 and the card
// column starts at x = 152, so the figure can never cover a chip.

const K = K_FIG * 1.08;            // stage units per rig unit (figure ≈ 150 tall)
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
const CARD_H = 78;                 // 324..402 and 406..484
const CHIP_H = 40;
const CHIP_STEP = 43;              // 324 · 367 · 410 · 453 → ends at 493

const CHIPS = [
  { id: 'a', title: 'STRONG', sub: 'induction’s version of valid', correct: true },
  { id: 'b', title: 'SOUND', sub: 'the premises support it', correct: false },
  { id: 'c', title: 'INVALID', sub: 'it could still be false', correct: false },
  { id: 'd', title: 'WEAK', sub: 'nothing is guaranteed', correct: false },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const FILL = BEATS.map((b) => b.fill ?? 0.5);
const LOCK = BEATS.map((b) => b.lock ?? 0);
const DICE = BEATS.map((b) => b.dice ?? 0);
const VERD = BEATS.map((b) => b.verdict ?? 0);
const LENS = BEATS.map((b) => b.lens ?? 0);
const TR = 0.85;

export default function Strong4Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const showPick = !!cur.interact;
  const leaving = !!prev?.interact && !cur.interact;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const s = mixStance(emoteHold(P_CODE[p], t), emoteLive(P_CODE[n], t, bt.value), tr);
    const dice = L(DICE[p], DICE[n]);
    const v = L(VERD[p], VERD[n]);
    const lens = L(LENS[p], LENS[n]);
    return {
      fig: pose(s, FIG_X, GROUND, K, 1, 1),
      fill: L(FILL[p], FILL[n]),
      lock: L(LOCK[p], LOCK[n]),
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
          <View style={styles.cardHead}>
            <Animated.View style={[styles.cardHeadOn, dedStyle]} />
            <Text style={styles.cardHeadT}>DEDUCTIVE</Text>
          </View>
          <Text style={styles.cardLine}>aims to  GUARANTEE</Text>
          <Text style={styles.cardLine}>graded  VALID / INVALID</Text>
          <Text style={styles.cardLine}>+ true premises → SOUND</Text>
        </View>
        <View style={[styles.card, { top: COL_TOP + CARD_H + 4 }]}>
          <View style={styles.cardHead}>
            <Animated.View style={[styles.cardHeadOn, indStyle]} />
            <Text style={styles.cardHeadT}>INDUCTIVE</Text>
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
              <Pressable
                key={c.id}
                style={[styles.chipSlot, { top: 18 + k * CHIP_STEP }]}
                disabled={answered}
                onPress={() => onPick(c.id, c.correct)}
              >
                <View
                  style={[
                    styles.chip,
                    answered && c.correct && styles.chipRight,
                    answered && chosen && !c.correct && styles.chipWrong,
                  ]}
                >
                  <Text style={[styles.chipT, answered && c.correct && styles.chipTOn]}>{c.title}</Text>
                  <Text style={[styles.chipSub, answered && c.correct && styles.chipSubOn]}>{c.sub}</Text>
                </View>
              </Pressable>
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
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
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
  cardHead: { height: 21, justifyContent: 'center', paddingHorizontal: 10, borderBottomWidth: 1.5, borderBottomColor: RULE },
  cardHeadOn: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: RULE },
  cardHeadT: {
    fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 16, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  cardLine: {
    fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 17, color: SOFT, paddingHorizontal: 10, includeFontPadding: false,
  },

  // ── ballot ────────────────────────────────────────────────────────────────
  ballot: { position: 'absolute', left: COL_L, top: 306, width: COL_W, height: 200 },
  ballotHdr: {
    position: 'absolute', left: 0, top: 0, width: COL_W,
    fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  chipSlot: { position: 'absolute', left: 0, width: COL_W, height: CHIP_H },
  chip: {
    width: COL_W, height: CHIP_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, justifyContent: 'center', paddingHorizontal: 12,
  },
  chipRight: { backgroundColor: INK, borderColor: INK },
  chipWrong: { borderColor: SOFT, opacity: 0.45 },
  chipT: { fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 17, letterSpacing: 0.6, color: INK, includeFontPadding: false },
  chipTOn: { color: PAPER },
  chipSub: { fontFamily: 'Inter_500Medium', fontSize: 10, lineHeight: 12, color: SOFT, includeFontPadding: false },
  chipSubOn: { color: RULE },
});

// Art runs from the gauge caption (210) down to the ground line (500, 2 thick) —
// the lowest chip ends at 493 and the lower ruler card at 484 — so the player
// crops to [202, 510] and the scene renders roughly twice the size of the
// letterboxed full-height fit.
export function Strong4Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Strong4Scene} band={[202, 510]} />;
}
