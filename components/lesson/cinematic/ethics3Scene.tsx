import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle, type Stance } from './rig';
import { BEATS } from './ethics3Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

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

const K = K_FIG * 1.08;            // stage units per rig unit (figure ≈ 111 tall)
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
//
// ── AND A SCHEMATIC IS NOT A LOLLIPOP ───────────────────────────────────────
//
// Making them 72 tall did not make them people. They were still `Peg`: a circle,
// a rectangle and two rectangles rotated ±7°, drawn as plain Views. No arms at
// all, no joints, and — the part that really shows — NO MOTION, standing beside a
// fully articulated figure that breathes. That is why they "don't even look like
// stickmen": they aren't. They are bollards with heads.
//
// They are solved by the rig now, at k = 0.70, in a bound stance: ankles together,
// both fists behind the back, and a slow uneven struggle so five people roped to a
// rail are not five statues (rule A6 — everything alive stays alive). Each gets
// its own seed, because the rig's own note is that figures sharing a motion read
// as one figure duplicated rather than as a crowd.
const PEG_K = 0.70;                // 103 × 0.70 ≈ 72, the height the row was already using
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
      {FIVE.map((x, i) => <Bound key={x} x={x} y={GROUND} seed={i * 1.7 + 0.4} clock={clock} />)}
      <Bound x={ONE.x} y={ONE.y} seed={4.9} clock={clock} />
      <Text style={styles.fiveLab}>FIVE</Text>
      <Text style={styles.oneLab}>ONE</Text>

      {/* the trolley, rolling toward the junction */}
      <Animated.View style={[styles.trolley, trolleyStyle]} pointerEvents="none">
        <View style={styles.roof} />
        <View style={styles.car} />
        <View style={[styles.window, { left: 12 }]} />
        <View style={[styles.window, { left: 51 }]} />
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
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.plateSlot, { top: 20 + k * 62 }]} disabled={answered}>
                <View
                  style={[
                    styles.plate,
                    answered && c.correct && styles.plateRight,
                    answered && chosen && !c.correct && styles.plateWrong,
                  ]}
                >
                  <Text style={[styles.plateT, answered && c.correct && styles.plateTOn]}>{c.title}</Text>
                </View>
              </Target>
            );
          })}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

/** One waiting figure — head, body, two legs — planted with its feet at (x, y). */
/**
 * Someone roped to the rail: ankles together, both hands behind the back, and a
 * struggle that never repeats — two incommensurable sines, the same trick the rig
 * uses for idle, so five of these side by side never fall into step.
 */
function boundStance(t: number, seed: number): Stance {
  'worklet';
  const w = Math.sin(t * 1.6 + seed) * 0.58 + Math.sin(t * 1.03 + seed * 2.7) * 0.42;
  const v = Math.sin(t * 2.2 + seed * 1.9) * 0.6 + Math.sin(t * 1.4 + seed) * 0.4;
  return {
    tilt: 0.03 + w * 0.06,
    neck: -0.03 + v * 0.16,                 // head turning to look for the trolley
    bob: v * 0.9,
    // Bound at the ankles: the feet stay together and shift weight rather than step.
    footL: { x: -3.4 + w * 0.5, y: 0 },
    footR: { x: 3.4 + w * 0.5, y: 0 },
    // Both fists BEHIND the pelvis (the figure faces +x), which is what reads as
    // "hands tied" from a silhouette with no rope drawn.
    fistL: { x: -11 - v * 0.8, y: 5 + w * 1.4 },
    fistR: { x: -13 + v * 0.8, y: 6 - w * 1.4 },
    adv: 0,
  };
}

function Bound({ x, y, seed, clock }: { x: number; y: number; seed: number; clock: SharedValue<number> }) {
  const D = useDerivedValue<Bundle>(() => pose(boundStance(clock.value, seed), x, y, PEG_K, 1, 1));
  return <Stickman D={D} k={PEG_K} />;
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

  // A TRAM IS TALLER THAN THE PEOPLE IT IS ABOUT TO HIT. It was 54×48, which left it
  // shorter than the five once they were drawn at a readable 72 — a runaway tram you
  // could step over. The ordering that has to hold is people (72) < tram (74) <
  // decider (111), so the thing bearing down reads as heavy without upstaging him.
  // It can afford the room now: `left` is only the base, and `translateX` parks it at
  // x 118 and up, well clear of the decider's x 20–96.
  trolley: { position: 'absolute', left: 0, top: GROUND - 74, width: 84, height: 74 },
  roof: { position: 'absolute', left: 9, top: 6, width: 65, height: 9, backgroundColor: INK, borderRadius: 3 },
  car: {
    position: 'absolute', left: 0, top: 16, width: 84, height: 47,
    borderWidth: 3, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
  },
  window: {
    position: 'absolute', top: 25, width: 20, height: 17,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  wheel: {
    position: 'absolute', bottom: -5, width: 25, height: 25, borderRadius: 13,
    borderWidth: 3.5, borderColor: INK, backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  spoke: { width: 3.5, height: 15, backgroundColor: INK },

  // ── verdict board ─────────────────────────────────────────────────────────
  board: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  card: {
    position: 'absolute', top: CARD_TOP, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    paddingHorizontal: 7, paddingTop: 8, overflow: 'hidden',
  },
  cardOn: { position: 'absolute', left: 0, top: 0, right: 0, height: 4, backgroundColor: INK },
  who: { fontFamily: 'Inter_700Bold', fontSize: 14.5, lineHeight: 17, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  // D30 — CONSEQUENCES is the longest word on the board, in 100 units of inner width
  // (CARD_W 118, less two 2-unit borders and two 7 of padding).
  //
  // The previous note here put it at "~88 in 100, which nothing can wrap". It actually
  // measured 98 — a 2% margin. The missing 9.6 is exactly its twelve characters of 0.8
  // tracking: TRACKING IS CHARGED PER CHARACTER, including after the last one, and an
  // estimate that forgets it under-counts by the whole of it, which here was the whole
  // of the margin. 88.4 is the glyphs alone.
  //
  // At 0.2 the word measures 90.8 in 100 — 9.2% — and numberOfLines={1} on the label
  // means it cannot break even if Android's metrics run wider than the browser's.
  lens: { fontFamily: 'Inter_700Bold', fontSize: 10.5, lineHeight: 15, letterSpacing: 0.2, color: SOFT, includeFontPadding: false },
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
