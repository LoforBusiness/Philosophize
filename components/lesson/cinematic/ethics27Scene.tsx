import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics27Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE SENTENCE ON A STAND, AND THE OBJECT HANGING UNDER IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the SENTENCE is a 210×44 filled STONE card at x 150 (150…360), y 280…324,
//   with its words across the middle in ink (T3). It never changes: metaethics is
//   a question about the utterance, not about cruelty.
// · a STEM of 4×30 at x 253 hangs from it to the reading slot at y 354.
// · the READING SLOT is 150×44 at x 180 (180…330), y 354…398, and holds ONE of
//   three forms at a time — a solid plate with a tick, a dashed border, or a plate
//   with four rays. They share the slot on purpose: drawn side by side they would
//   read as three claims a person could hold together, and they are three accounts
//   of what one claim already is.
// · THREE PLATES of 88×26 at x 124 · 216 · 308 (124…396), top y 462.
// · the figure stands at x 24 and walks to 84; his widest span at the walked mark
//   is x ≈ 59…109, fifteen units clear of the nearest plate at 124.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const SAID_X = 150;
const SAID_Y = 280;
const SAID_W = 210;
const SAID_H = 44;

const SLOT_X = 180;
const SLOT_Y = 354;
const SLOT_W = 150;
const SLOT_H = 44;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 462;
const PLATE_W = 88;
const PLATE_H = 26;
const PLATE_CAP = ['IT IS UNIVERSAL', 'REALISM WINS', 'CULTURES DIFFER'];
const PLATE_ID = ['universal', 'realism', 'differ'];
/** The shape critics call self-undermining. */
const UNIVERSAL = 0;

const CAP_T = 244;
const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SAID = BEATS.map((b) => (b.said ? 1 : 0));
const READING = BEATS.map((b) => b.reading ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE POLL'S OWN ORDER, never the shuffled rows (X3): 0 a fact · 1 a border ·
// 2 an attitude. Each row is read off that option's own words, and the reading
// slot shows whichever object the reader's answer says the sentence is.
const READ_AT = [1, 2, 3];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics27'));

export default function Ethics27Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(4);
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
      saidOn: carry(cv, 1, n, SAID[p], SAID[n], tr),
      reading: carry(cv, 2, n, READING[p], reacting ? pickAt(READ_AT, pickPos.value) : READING[n], tr),
      platesOn: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const saidStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.saidOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  // A READING IS SHOWN ONLY WHILE THE VALUE IS ON IT, so two words never share
  // the slot at readable strength (D35).
  const factStyle = useAnimatedStyle(() => ({ opacity: clamp01(1 - Math.abs(SCENE.value.reading - 1) * 1.6) }));
  const borderStyle = useAnimatedStyle(() => ({ opacity: clamp01(1 - Math.abs(SCENE.value.reading - 2) * 1.6) }));
  const feelStyle = useAnimatedStyle(() => ({ opacity: clamp01(1 - Math.abs(SCENE.value.reading - 3) * 1.6) }));
  const stemStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.reading) }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE SENTENCE, THREE READINGS</Text>

      <Animated.View style={[StyleSheet.absoluteFill, saidStyle]} pointerEvents="none">
        <View style={styles.said} />
        <Text style={styles.saidText}>CRUELTY IS WRONG</Text>
      </Animated.View>
      <Animated.View style={[styles.stem, stemStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, factStyle]} pointerEvents="none">
        <View style={styles.slotSolid} />
        <Text style={styles.slotText}>A FACT</Text>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, borderStyle]} pointerEvents="none">
        <View style={styles.slotDashed} />
        <Text style={styles.slotText}>TRUE IN HERE</Text>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, feelStyle]} pointerEvents="none">
        <View style={styles.slotSolid} />
        <View style={[styles.ray, { left: SLOT_X - 12, top: SLOT_Y + 20 }]} />
        <View style={[styles.ray, { left: SLOT_X + SLOT_W + 2, top: SLOT_Y + 20 }]} />
        <View style={[styles.rayUp, { left: SLOT_X + SLOT_W / 2 - 2, top: SLOT_Y - 12 }]} />
        <Text style={styles.slotText}>A FEELING</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === UNIVERSAL}
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
    position: 'absolute', left: SAID_X, top: CAP_T, width: SAID_W + 26,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  said: {
    position: 'absolute', left: SAID_X, top: SAID_Y, width: SAID_W, height: SAID_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  saidText: {
    position: 'absolute', left: SAID_X, top: SAID_Y + 17, width: SAID_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },
  stem: { position: 'absolute', left: 253, top: SAID_Y + SAID_H, width: 4, height: SLOT_Y - SAID_Y - SAID_H, backgroundColor: INK },

  slotSolid: {
    position: 'absolute', left: SLOT_X, top: SLOT_Y, width: SLOT_W, height: SLOT_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  slotDashed: {
    position: 'absolute', left: SLOT_X, top: SLOT_Y, width: SLOT_W, height: SLOT_H,
    borderWidth: 2, borderColor: INK, borderStyle: 'dashed', backgroundColor: PAPER,
  },
  slotText: {
    position: 'absolute', left: SLOT_X, top: SLOT_Y + 17, width: SLOT_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  ray: { position: 'absolute', width: 10, height: 4, backgroundColor: INK },
  rayUp: { position: 'absolute', width: 4, height: 10, backgroundColor: INK },

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

export function Ethics27Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics27Scene} band={[240, 512]} camera={CAM} />;
}
