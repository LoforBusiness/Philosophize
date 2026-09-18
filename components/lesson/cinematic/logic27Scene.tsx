import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic27Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('logic');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// A CARD, A BRACKET LEAVING IT AND RETURNING TO IT, AND TWO LAMPS THAT FLIP.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CARD is 216×54 at x 142 (142…358), y 292…346 — a filled STONE mass, with
//   the sentence set across it in ink (T3).
// · the BRACKET is a 100×3 bar at x 200 (200…300), y 264, with a down-tick at each
//   end reaching the card's top at 292 and a head on the right one. It leaves the
//   card and returns to the SAME card: there is no second sentence for it to be
//   about, and drawing a second copy would quietly dissolve the paradox.
// · TWO LAMPS of 80×28 at x 180 and x 276 (180…356), y 368…396, carrying TRUE and
//   FALSE. Their fills ALTERNATE on the scene clock and go on alternating between
//   taps (Z7) — a paradox is a thing that will not come to rest, and a still frame
//   of two options is an ordinary diagram of a choice.
// · the CUT is a 22-wide gap of paper laid over the middle of the bracket, drawn
//   only when the reader's answer forbids the self-reference.
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462.
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, twenty-nine units clear of the card at 142.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CARD_X = 142;
const CARD_Y = 292;
const CARD_W = 216;
const CARD_H = 54;

const LOOP_X = 200;
const LOOP_W = 100;
const LOOP_Y = 264;

const LAMP_X = [180, 276];
const LAMP_Y = 368;
const LAMP_W = 80;
const LAMP_H = 28;
const LAMP_CAP = ['TRUE', 'FALSE'];
/** How fast the two lamps trade places, in radians a second. */
const FLIP_RATE = 1.5;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['IT IS FALSE', 'IT IS TRUE', 'NOTHING AT ALL'];
const PLATE_ID = ['false', 'true', 'nothing'];
/** What follows from supposing the card true. */
const FALSE = 0;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const CARD = BEATS.map((b) => (b.card ? 1 : 0));
const LOOP = BEATS.map((b) => (b.loop ? 1 : 0));
const LAMPS = BEATS.map((b) => (b.lamps ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
// group AH — two still-beat events, each derived from its own beat's sentence.
const TESTFALSE_ON = BEATS.map((b) => ((b.testFalse ?? 0) > 0 ? 1 : 0));
const ELSEWHERE_ON = BEATS.map((b) => ((b.elsewhere ?? 0) > 0 ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE POLL'S OWN ORDER, never the shuffled rows (X3): 0 no value · 1 forbid the
// self-reference · 2 both at once. Each row is read off that option's own words,
// and each one does something different to the picture rather than to a label.
//   gap  — neither lamp is lit, and the flipping stops for want of a value.
//   ban  — the bracket is cut, so the sentence cannot reach itself.
//   both — the two lamps are lit together, which is what the position says.
const FLIP_AT = [0, 1, 0];
const BOTH_AT = [0, 0, 1];
const CUT_AT = [0, 1, 0];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic27'));

export default function Logic27Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(10);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const testFalseFade = (cur.testFalse ?? 0) !== (prev?.testFalse ?? 0);
  const elsewhereFade = (cur.elsewhere ?? 0) !== (prev?.elsewhere ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      cardOn: carry(cv, 1, n, CARD[p], CARD[n], tr),
      loopOn: carry(cv, 2, n, LOOP[p], LOOP[n], tr),
      lampsOn: carry(cv, 3, n, LAMPS[p], LAMPS[n], tr),
      // THE FLIP RUNS ON THE SCENE CLOCK, so it never stops between taps.
      flip: (Math.sin(t * FLIP_RATE) + 1) / 2,
      alternating: carry(cv, 4, n, 1, reacting ? pickAt(FLIP_AT, pickPos.value) : 1, tr),
      both: carry(cv, 5, n, 0, reacting ? pickAt(BOTH_AT, pickPos.value) : 0, tr),
      cut: carry(cv, 6, n, 0, reacting ? pickAt(CUT_AT, pickPos.value) : 0, tr),
      platesOn: carry(cv, 7, n, PLATES[p], PLATES[n], tr),
      // A ring on the FALSE lamp — the supposition this beat is testing.
      testFalse: carry(cv, 8, n, TESTFALSE_ON[p], TESTFALSE_ON[n], testFalseFade ? tr : 1),
      // A tag below the lamps — the shape recurs beyond this one sentence.
      elsewhere: carry(cv, 9, n, ELSEWHERE_ON[p], ELSEWHERE_ON[n], elsewhereFade ? tr : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const cardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cardOn }));
  const loopStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.loopOn }));
  const cutStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.loopOn * SCENE.value.cut }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const trueFill = useAnimatedStyle(() => ({
    opacity: SCENE.value.lampsOn * Math.max(SCENE.value.alternating * SCENE.value.flip, SCENE.value.both),
  }));
  const falseFill = useAnimatedStyle(() => ({
    opacity: SCENE.value.lampsOn * Math.max(SCENE.value.alternating * (1 - SCENE.value.flip), SCENE.value.both),
  }));
  const lampsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.lampsOn }));
  // A breathing ring on the FALSE lamp — the supposition this beat tests.
  const testFalseStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.testFalse * (0.55 + 0.45 * Math.sin(SCENE.value.t * 3.2)),
  }));
  const elsewhereStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.elsewhere,
    transform: [{ translateY: (1 - SCENE.value.elsewhere) * 6 }],
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">A SENTENCE ABOUT ITSELF</Text>

      <Animated.View style={[StyleSheet.absoluteFill, loopStyle]} pointerEvents="none">
        <View style={styles.loopBar} />
        <View style={[styles.loopTick, { left: LOOP_X }]} />
        <View style={[styles.loopTick, { left: LOOP_X + LOOP_W - 3 }]} />
      </Animated.View>
      {/* THE CUT — drawn in the ground's own colour, so forbidding the reference
          takes a piece out of the bracket rather than adding a mark to it. */}
      <Animated.View style={[styles.cut, cutStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, cardStyle]} pointerEvents="none">
        <View style={styles.card} />
        <Text style={styles.cardText}>THIS SENTENCE IS FALSE</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, lampsStyle]} pointerEvents="none">
        <View style={[styles.lamp, { left: LAMP_X[0] }]} />
        <View style={[styles.lamp, { left: LAMP_X[1] }]} />
        <Animated.View style={[styles.lampFill, { left: LAMP_X[0] + 3 }, trueFill]} />
        <Animated.View style={[styles.lampFill, { left: LAMP_X[1] + 3 }, falseFill]} />
        {LAMP_X.map((lx, k) => (
          <Text key={lx} style={[styles.lampText, { left: lx }]}>{LAMP_CAP[k]}</Text>
        ))}
      </Animated.View>

      {/* the ring on the FALSE lamp — the supposition this beat tests */}
      <Animated.View style={[styles.lampRing, { left: LAMP_X[1] - 4 }, testFalseStyle]} pointerEvents="none" />

      {/* the shape recurs beyond this one sentence */}
      <Animated.View style={[styles.elsewhere, elsewhereStyle]} pointerEvents="none">
        <Text style={styles.elsewhereText} numberOfLines={1}>SAME SHAPE, ELSEWHERE</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === FALSE}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <View style={styles.plate} pointerEvents="none" />
            <Text style={styles.plateText} pointerEvents="none">{PLATE_CAP[k]}</Text>
          </Target>
        ))}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: CARD_X, top: CAP_T, width: CARD_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  card: {
    position: 'absolute', left: CARD_X, top: CARD_Y, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  cardText: {
    position: 'absolute', left: CARD_X, top: CARD_Y + 22, width: CARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },

  // ONE BRACKET, LEAVING THE CARD AND RETURNING TO IT.
  loopBar: { position: 'absolute', left: LOOP_X, top: LOOP_Y, width: LOOP_W, height: 3, backgroundColor: INK },
  loopTick: { position: 'absolute', top: LOOP_Y, width: 3, height: CARD_Y - LOOP_Y, backgroundColor: INK },
  cut: { position: 'absolute', left: LOOP_X + LOOP_W / 2 - 11, top: LOOP_Y - 2, width: 22, height: 7, backgroundColor: PAPER },

  lamp: {
    position: 'absolute', top: LAMP_Y, width: LAMP_W, height: LAMP_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  lampFill: { position: 'absolute', top: LAMP_Y + 3, width: LAMP_W - 6, height: LAMP_H - 6, backgroundColor: STONE, boxShadow: LIP },
  lampText: {
    position: 'absolute', top: LAMP_Y + 9, width: LAMP_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  // ── the two tap events (group AH) ──────────────────────────────────────────
  // A breathing ring, like the ones that mark a row or a link elsewhere in
  // this branch — an outline only, never a fill.
  lampRing: {
    position: 'absolute', top: LAMP_Y - 4, width: LAMP_W + 8, height: LAMP_H + 8,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8,
  },
  // The tag: the plates' own row is empty at this beat, so it lands there.
  elsewhere: {
    position: 'absolute', left: CARD_X, top: PLATE_Y, width: CARD_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  elsewhereText: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },
});

export function Logic27Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic27Scene} band={[240, 512]} camera={CAM} />;
}
