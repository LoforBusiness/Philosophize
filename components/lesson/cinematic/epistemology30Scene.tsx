import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology30Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A LIT DISC THAT BARELY CHANGES, AND A RING THAT KEEPS OPENING ROUND IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the FIELD is a filled STONE slab 250×152 at x 120 (120…370), y 248…400. On a
//   toned ground a PAPER disc can be a light; on bare page it is nothing (T2).
// · the DISC is a 64 PAPER circle centred on (245, 324) and it does NOT grow. What
//   somebody knows is not the thing the lesson is about.
// · the RING is an open 2-thick ink circle on the same centre, 76 across at rest
//   and 140 at full. Open rather than filled, because it is a BOUNDARY: the far
//   side of what a reader has learned to ask about.
// · TWO NAMES in ink at y 300 and y 254, both inside the field, because SOFT would
//   not clear STONE (T6).
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, fifteen units clear of the field at 120.
//
// Ink runs y 234 (the caption) … y 500 (ground). BAND 230…512 = 282 — a 103-unit
// figure at 36.5%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const FIELD_X = 120;
const FIELD_Y = 248;
const FIELD_W = 250;
const FIELD_H = 152;

const MID_X = 245;
const MID_Y = 324;
const DISC = 64;
const RING_LO = 76;
const RING_HI = 140;

const CAP_T = 234;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['HOLDING THE MOST FACTS', 'KNOWING WHERE YOU STOP', 'NEVER BEING WRONG'];
const PLATE_ID = ['facts', 'stop', 'right'];
/** An accurate view of where your own knowledge runs out. */
const STOP = 1;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const DISC_ON = BEATS.map((b) => (b.disc ? 1 : 0));
const EDGE = BEATS.map((b) => b.edge ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology30'));

export default function Epistemology30Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      disc: carry(cv, 1, n, DISC_ON[p], DISC_ON[n], tr),
      // HOW FAR THE EDGE HAS OPENED, which is what the drawn curve reports.
      edge: carry(cv, 2, n, EDGE[p], reacting ? dragPos.value : EDGE[n], tr),
      plates: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const fieldStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.disc }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));
  const ringStyle = useAnimatedStyle(() => {
    const d = RING_LO + (RING_HI - RING_LO) * clamp01(SCENE.value.edge);
    return { left: MID_X - d / 2, top: MID_Y - d / 2, width: d, height: d, borderRadius: d / 2 };
  });
  // THE NAME OF THE EDGE RIDES THE EDGE, and it is either legible or absent (D35).
  const edgeCapStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.edge * 2) }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHAT YOU KNOW, AND ITS EDGE</Text>

      <Animated.View style={[StyleSheet.absoluteFill, fieldStyle]} pointerEvents="none">
        <View style={styles.field} />
        <View style={styles.disc} />
        <Text style={styles.discText}>KNOWN</Text>
      </Animated.View>

      <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, edgeCapStyle]} pointerEvents="none">
        <Text style={styles.edgeText}>QUESTIONS IN VIEW</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === STOP}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === STOP}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
            radius={4}
          >
            <Text style={styles.plateText} numberOfLines={2} pointerEvents="none">{PLATE_CAP[k]}</Text>
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
    position: 'absolute', left: FIELD_X, top: CAP_T, width: FIELD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  field: {
    position: 'absolute', left: FIELD_X, top: FIELD_Y, width: FIELD_W, height: FIELD_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  disc: {
    position: 'absolute', left: MID_X - DISC / 2, top: MID_Y - DISC / 2, width: DISC, height: DISC,
    borderRadius: DISC / 2, backgroundColor: PAPER,
  },
  discText: {
    position: 'absolute', left: MID_X - DISC / 2, top: MID_Y - 5, width: DISC, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  // AN OPEN OUTLINE, because this is the far side of what a reader can ask about
  // rather than a stock of anything.
  ring: { position: 'absolute', borderWidth: 2, borderColor: PAPER },
  edgeText: {
    position: 'absolute', left: FIELD_X, top: FIELD_Y + 8, width: FIELD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 7, width: PLATE_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Epistemology30Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology30Scene} band={[230, 512]} camera={CAM} />;
}
