import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic27Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

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
  const cv = useCarry(8);
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
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: CARD_X, top: CAP_T, width: CARD_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  card: {
    position: 'absolute', left: CARD_X, top: CARD_Y, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
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
  lampFill: { position: 'absolute', top: LAMP_Y + 3, width: LAMP_W - 6, height: LAMP_H - 6, backgroundColor: STONE },
  lampText: {
    position: 'absolute', top: LAMP_Y + 9, width: LAMP_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Logic27Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic27Scene} band={[240, 512]} camera={CAM} />;
}
