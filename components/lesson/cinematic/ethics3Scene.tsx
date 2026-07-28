import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle } from './rig';
import { BEATS } from './ethics3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// The trolley problem, staged as a schematic.
//
//   · THE LINE — a sleepered rail running the width of the stage, a points lever
//     the decider actually stands at, and a branch that inks up when the lever is
//     thrown. Five figures wait on the main line, one on the branch, each labelled.
//   · THE VERDICT BOARD (top) — three columns, thinker · lens · ruling:
//        MILL · CONSEQUENCES · PULL      KANT · DUTY · NEVER
//        ARISTOTLE · CHARACTER · WHO AM I?
//     Each column inks as its philosopher speaks, so the three theories sit side by
//     side as one comparison instead of three paragraphs in a row.
//
// On the true/false beat the board clears and two large TRUE / FALSE plates take
// its place — the question is answered by tapping in the scene.
//
// No camera transform: the art is authored straight into stage space, so the band
// below is exact. The decider's widest reach ends at x ≈ 116 and the plates start
// at x = 128, so the figure can never cover a target.

const K = K_FIG * 1.08;            // stage units per rig unit (figure ≈ 150 tall)
const FIG_X = 58;
const LEVER_X = 112;

// ── the line ─────────────────────────────────────────────────────────────────
const JUNCTION = 256;
const BR_LEN = 88;                 // branch, 40° up-right → ends at (323, 443)
// THE PEOPLE ON THE TRACK ARE PEOPLE, AND HAVE TO READ AS PEOPLE.
//
// They were 40 units tall beside a 150-unit decider — barely a quarter his height,
// which reads as a row of bollards, not as five human beings whose lives are the
// entire moral weight of the lesson. 72 is as large as the composition allows: the
// five have to fit between the junction and the right edge, and five figures at the
// decider's true scale would need roughly 500 stage units of width where only 90
// exist. So the row stays a SCHEMATIC of five people — but a legible one.
const PEG_W = 19;
const PEG_H = 72;
const FIVE = [298, 320, 342, 364, 386];
const ONE = { x: 303.5, y: 460 };  // stands ON the branch line
const SLEEPERS = [24, 50, 76, 102, 128, 154, 180, 206, 232, 258, 284, 310, 336, 362, 388];

// ── the verdict board ────────────────────────────────────────────────────────
const CARD_TOP = 232;
const CARD_W = 118;
// 8 pad + 17 name + 15 lens + 6 gap + 24 ruling chip = 70, plus a 2 border top and
// bottom = 74. At 76 that left one unit of slack inside an `overflow: hidden` box —
// one stray unit of Android font padding and the ruling chip loses its bottom edge.
// 80 gives 6, and the column still ends at 312, well clear of the crown at 348.
const CARD_H = 80;
const CARD_X = [12, 145, 278];

const LENSES = [
  { who: 'MILL', lens: 'CONSEQUENCES', rule: 'PULL' },
  { who: 'KANT', lens: 'DUTY', rule: 'NEVER' },
  { who: 'ARISTOTLE', lens: 'CHARACTER', rule: 'WHO AM I?' },
];

// ── the true/false plates (the scene-answered question) ──────────────────────
const BAL_L = 128;
const BAL_W = 260;
const BAL_H = 54;
const PLATES = [
  { id: 't', title: 'TRUE', correct: false },
  { id: 'f', title: 'FALSE', correct: true },
];

const D_CODE = BEATS.map((b) => b.d ?? 0);
const TX = BEATS.map((b) => b.tx ?? 118);
const PULL = BEATS.map((b) => b.pull ?? 0);
const LENS = BEATS.map((b) => b.lens ?? 0);
const TR = 0.85;

export default function Ethics3Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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

    const d = mixStance(emoteHold(D_CODE[p], t), emoteLive(D_CODE[n], t, bt.value), tr);
    const lens = L(LENS[p], LENS[n]);
    return {
      fig: pose(d, FIG_X, GROUND, K, 1, 1),
      tx: L(TX[p], TX[n]),
      pull: L(PULL[p], PULL[n]),
      wheel: (t * 200) % 360,
      // The verdict board and the plates cross-fade, so neither ever pops.
      board: showPick ? 1 - grow : leaving ? grow : 1,
      ballot: showPick ? grow : 0,
      l1: clamp01(lens) - clamp01(lens - 1),
      l2: clamp01(lens - 1) - clamp01(lens - 2),
      l3: clamp01(lens - 2),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const trolleyStyle = useAnimatedStyle(() => ({ transform: [{ translateX: SCENE.value.tx }] }));
  const wheelStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${SCENE.value.wheel}deg` }] }));
  const leverStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${14 - 36 * SCENE.value.pull}deg` }] }));
  const branchOnStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pull }));
  const boardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.board }));
  const ballotStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.ballot,
    transform: [{ translateY: (1 - SCENE.value.ballot) * 10 }],
  }));
  const lens1 = useAnimatedStyle(() => ({ opacity: SCENE.value.l1 }));
  const lens2 = useAnimatedStyle(() => ({ opacity: SCENE.value.l2 }));
  const lens3 = useAnimatedStyle(() => ({ opacity: SCENE.value.l3 }));
  const lensStyles = [lens1, lens2, lens3];

  return (
    <Animated.View style={styles.scene}>
      {/* ── the line ────────────────────────────────────────────────────────── */}
      {SLEEPERS.map((x) => <View key={x} style={[styles.sleeper, { left: x }]} pointerEvents="none" />)}
      <View style={styles.rail} pointerEvents="none" />
      <View style={styles.branch} pointerEvents="none" />
      <Animated.View style={[styles.branch, styles.branchOn, branchOnStyle]} pointerEvents="none" />

      {/* the points lever the decider stands at */}
      <View style={styles.leverBase} pointerEvents="none" />
      <Animated.View style={[styles.leverArm, leverStyle]} pointerEvents="none">
        <View style={styles.leverKnob} />
      </Animated.View>

      {/* the five on the main line, the one up the branch */}
      {FIVE.map((x) => <Peg key={x} x={x} y={GROUND} />)}
      <Peg x={ONE.x} y={ONE.y} />
      <Text style={styles.fiveLab}>FIVE</Text>
      <Text style={styles.oneLab}>ONE</Text>

      {/* the trolley, rolling toward the junction */}
      <Animated.View style={[styles.trolley, trolleyStyle]} pointerEvents="none">
        <View style={styles.roof} />
        <View style={styles.car} />
        <View style={[styles.window, { left: 8 }]} />
        <View style={[styles.window, { left: 33 }]} />
        <Animated.View style={[styles.wheel, { left: 7 }, wheelStyle]}><View style={styles.spoke} /></Animated.View>
        <Animated.View style={[styles.wheel, { right: 7 }, wheelStyle]}><View style={styles.spoke} /></Animated.View>
      </Animated.View>

      <Stickman D={DF} k={K} />

      {/* ── the verdict board ───────────────────────────────────────────────── */}
      <Animated.View style={[styles.board, boardStyle]} pointerEvents="none">
        {LENSES.map((v, k) => (
          <View key={v.who} style={[styles.card, { left: CARD_X[k] }]}>
            <Animated.View style={[styles.cardOn, lensStyles[k]]} />
            {/* Both pinned to one line: a wrap here would push the ruling chip out
                of the card's clipped box and the verdict would vanish. */}
            <Text style={styles.who} numberOfLines={1}>{v.who}</Text>
            <Text style={styles.lens} numberOfLines={1}>{v.lens}</Text>
            {/* the speaking philosopher's RULING stamps solid, the word reversed out
                in paper — a grey wash read as "greyed out" rather than "this one" */}
            <View style={styles.rule}>
              <Animated.View style={[styles.ruleOn, lensStyles[k]]} />
              <Text style={styles.ruleT}>{v.rule}</Text>
              <Animated.Text style={[styles.ruleT, styles.ruleTOn, lensStyles[k]]}>{v.rule}</Animated.Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* ── the TRUE / FALSE plates: the question is answered here ──────────── */}
      {showPick ? (
        <Animated.View style={[styles.ballot, ballotStyle]} pointerEvents="box-none">
          <Text style={styles.ballotHdr}>TAP TRUE OR FALSE</Text>
          {PLATES.map((c, k) => {
            const chosen = picked === c.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.plateSlot, { top: 20 + k * 62 }]}
                disabled={answered}
                onPress={() => onPick(c.id, c.correct)}
              >
                <View
                  style={[
                    styles.plate,
                    answered && c.correct && styles.plateRight,
                    answered && chosen && !c.correct && styles.plateWrong,
                  ]}
                >
                  <Text style={[styles.plateT, answered && c.correct && styles.plateTOn]}>{c.title}</Text>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

/** One waiting figure — head, body, two legs — planted with its feet at (x, y). */
function Peg({ x, y }: { x: number; y: number }) {
  return (
    <View style={[styles.peg, { left: x - PEG_W / 2, top: y - PEG_H }]} pointerEvents="none">
      <View style={styles.pegHead} />
      <View style={styles.pegBody} />
      <View style={[styles.pegLeg, { left: 5, transform: [{ rotate: '7deg' }] }]} />
      <View style={[styles.pegLeg, { left: 10, transform: [{ rotate: '-7deg' }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },

  // ── line ──────────────────────────────────────────────────────────────────
  rail: { position: 'absolute', left: 16, right: 6, top: GROUND, height: 3, backgroundColor: INK },
  sleeper: { position: 'absolute', top: GROUND + 3, width: 3.5, height: 7, backgroundColor: SOFT, borderRadius: 1 },
  branch: {
    position: 'absolute', left: JUNCTION, top: GROUND, width: BR_LEN, height: 2.5, backgroundColor: RULE,
    transformOrigin: '0% 50%', transform: [{ rotate: '-40deg' }],
  },
  branchOn: { backgroundColor: INK },

  leverBase: {
    position: 'absolute', left: LEVER_X - 11, top: GROUND - 9, width: 22, height: 9,
    borderWidth: 2, borderColor: INK, backgroundColor: INK, borderRadius: 2,
  },
  leverArm: {
    position: 'absolute', left: LEVER_X - 2, top: GROUND - 44, width: 4, height: 36,
    backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 100%', alignItems: 'center',
  },
  leverKnob: { position: 'absolute', top: -6, width: 11, height: 11, borderRadius: 6, backgroundColor: INK },

  // head + body − 1 overlap + legs must equal PEG_H exactly, or the figure floats
  // off the rail: 19 + 33 − 1 + 21 = 72.
  peg: { position: 'absolute', width: PEG_W, height: PEG_H, alignItems: 'center' },
  pegHead: { width: 19, height: 19, borderRadius: 10, backgroundColor: INK },
  pegBody: { width: 7, height: 33, backgroundColor: INK, marginTop: -1, borderRadius: 3 },
  pegLeg: { position: 'absolute', bottom: 0, width: 4.5, height: 21, backgroundColor: INK, borderRadius: 2, transformOrigin: '50% 0%' },

  // Both labels moved UP clear of the taller figures: the five now reach y 428 and
  // the one on the branch reaches 388, so the old positions sat on top of them.
  fiveLab: {
    position: 'absolute', left: 316, top: 392, width: 72, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 15, letterSpacing: 1.6, color: SOFT, includeFontPadding: false,
  },
  oneLab: {
    position: 'absolute', left: 276, top: 348, width: 56, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 15, letterSpacing: 1.6, color: SOFT, includeFontPadding: false,
  },

  trolley: { position: 'absolute', left: 0, top: GROUND - 48, width: 54, height: 48 },
  roof: { position: 'absolute', left: 6, top: 4, width: 42, height: 6, backgroundColor: INK, borderRadius: 2 },
  car: {
    position: 'absolute', left: 0, top: 10, width: 54, height: 30,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  window: {
    position: 'absolute', top: 16, width: 13, height: 11,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  wheel: {
    position: 'absolute', bottom: -4, width: 16, height: 16, borderRadius: 8,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  spoke: { width: 2.5, height: 10, backgroundColor: INK },

  // ── verdict board ─────────────────────────────────────────────────────────
  board: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  card: {
    position: 'absolute', top: CARD_TOP, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    paddingHorizontal: 7, paddingTop: 8, overflow: 'hidden',
  },
  cardOn: { position: 'absolute', left: 0, top: 0, right: 0, height: 4, backgroundColor: INK },
  who: { fontFamily: 'Inter_700Bold', fontSize: 14.5, lineHeight: 17, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  // CONSEQUENCES is the longest word on the board. At 9 of padding and 1.2 of
  // tracking it measured within a unit of the 96 of inner width — a coin-flip wrap.
  // 7 of padding and 0.8 of tracking put it at ~88 in 100, which nothing can wrap.
  lens: { fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 15, letterSpacing: 0.8, color: SOFT, includeFontPadding: false },
  rule: {
    marginTop: 6, height: 24, borderWidth: 1.5, borderColor: INK, borderRadius: 3,
    alignItems: 'center', justifyContent: 'center', backgroundColor: PAPER, overflow: 'hidden',
  },
  ruleOn: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: INK },
  ruleT: {
    fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 15, letterSpacing: 1,
    color: INK, textAlign: 'center', includeFontPadding: false,
  },
  // The chip is 24 tall with a 1.5 border inside it, so a 15-tall line centres at
  // (24 − 3 − 15) / 2 = 3 — the reversed copy must land exactly on the base word.
  ruleTOn: { position: 'absolute', left: 0, right: 0, top: 3, color: PAPER },

  // ── plates ────────────────────────────────────────────────────────────────
  ballot: { position: 'absolute', left: BAL_L, top: CARD_TOP, width: BAL_W, height: 148 },
  ballotHdr: {
    position: 'absolute', left: 0, top: 0, width: BAL_W,
    fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  // Tap target: 260 × 54 stage units carrying one 20px word — the biggest plate in
  // any of these lessons, because a true/false call should be unmissable.
  plateSlot: { position: 'absolute', left: 0, width: BAL_W, height: BAL_H },
  plate: {
    width: BAL_W, height: BAL_H, borderWidth: 2.5, borderColor: INK, borderRadius: 5,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateWrong: { borderColor: SOFT, opacity: 0.45 },
  plateT: { fontFamily: 'Inter_700Bold', fontSize: 20, letterSpacing: 3, color: INK, includeFontPadding: false },
  plateTOn: { color: PAPER },
});

// BAND. Topmost ink is the verdict board at 232 (its columns now end at 312); the lowest is the sleeper row under
// the rail, 500 + 3 (rail) + 7 (sleeper) = 510. Everything else sits inside that: the
// TRUE/FALSE plates finish at 368, the branch line climbs to 444, the ONE peg reaches
// 388 and its label 348, the five reach 428 and their label 392, the lever knob to
// ~446, the trolley's wheels to 504, the figure's crown to
// 350. So [224, 518] holds every extreme with 8 units of margin at each end, and the
// scene renders about 90% larger than the letterboxed full-height fit.
export function Ethics3Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Ethics3Scene} band={[224, 518]} />;
}
