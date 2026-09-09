import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic28Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO PIERS A FIXED DISTANCE APART, AND A PLANK RUNNING OUT FROM THE FIRST.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO PIERS of 78×56 in STONE at x 116 (116…194) and x 296 (296…374), y 330…386,
//   each carrying its case in ink across the middle. They never move: the two
//   cases are exactly as far apart as they were before anybody compared them.
// · the GAP between them is 194…296, 102 units, and it is empty paper.
// · the PLANK is a 12-tall ink-edged STONE bar sitting on the pier tops at y 318,
//   running from x 194 to 194 + 102 × span. At full span it lands on the second
//   pier; anywhere short of that it ends in mid-air, which is the argument.
// · a SILL of 3 under each pier at y 386 gives them something to stand on.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, eleven units clear of the first pier at 116.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PIER_X = [116, 296];
const PIER_Y = 330;
const PIER_W = 78;
const PIER_H = 56;
const PIER_CAP = ['SHOUTING FIRE', 'HATE SPEECH'];

const GAP_X = 194;
const GAP_W = 102;
const PLANK_Y = 318;
const PLANK_H = 12;

const CAP_T = 244;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['MANY SHARED FEATURES', 'FEATURES THAT MATTER', 'A VIVID COMPARISON'];
const PLATE_ID = ['many', 'matter', 'vivid'];
/** Relevance, not count: a hundred traits that bear on nothing prove nothing. */
const MATTER = 1;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const PIERS = BEATS.map((b) => (b.piers ? 1 : 0));
const SPAN = BEATS.map((b) => b.span ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic28'));

export default function Logic28Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      piers: carry(cv, 1, n, PIERS[p], PIERS[n], tr),
      // HOW FAR THE ARGUMENT ACTUALLY ARRIVES, which is what the knob measures.
      span: carry(cv, 2, n, SPAN[p], reacting ? dragPos.value : SPAN[n], tr),
      plates: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const piersStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.piers }));
  const plankStyle = useAnimatedStyle(() => ({ width: GAP_W * clamp01(SCENE.value.span) }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">HOW FAR THE LIKENESS REACHES</Text>

      <Animated.View style={[StyleSheet.absoluteFill, piersStyle]} pointerEvents="none">
        {PIER_X.map((px, k) => (
          <View key={px}>
            <View style={[styles.pier, { left: px }]} />
            <View style={[styles.sill, { left: px - 6 }]} />
            <Text style={[styles.pierText, { left: px }]}>{PIER_CAP[k]}</Text>
          </View>
        ))}
        <View style={styles.stub} />
        <Animated.View style={[styles.plank, plankStyle]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === MATTER}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === MATTER}
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
    position: 'absolute', left: PIER_X[0], top: CAP_T, width: 258, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  pier: {
    position: 'absolute', top: PIER_Y, width: PIER_W, height: PIER_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  sill: { position: 'absolute', top: PIER_Y + PIER_H, width: PIER_W + 12, height: 4, backgroundColor: INK },
  pierText: {
    position: 'absolute', top: PIER_Y + 24, width: PIER_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
  // THE STUB IS THE PART ALREADY LAID — a plank of zero reach still has a root on
  // the pier it starts from, and a bar that vanishes entirely reads as a fault.
  stub: {
    position: 'absolute', left: GAP_X - 20, top: PLANK_Y, width: 20, height: PLANK_H,
    backgroundColor: STONE, borderWidth: 2, borderColor: INK,
  },
  plank: {
    position: 'absolute', left: GAP_X, top: PLANK_Y, height: PLANK_H,
    backgroundColor: STONE, borderTopWidth: 2, borderBottomWidth: 2, borderRightWidth: 2, borderColor: INK,
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

export function Logic28Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic28Scene} band={[240, 512]} camera={CAM} />;
}
