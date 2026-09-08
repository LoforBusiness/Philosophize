import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics25Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A BRIDGE WITH A PLANK MISSING, AND THE THREE THINGS ANYONE CAN DO ABOUT IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the DECK is 240×9 at x 140, top y 334, so it runs 140…380. The GAP is drawn
//   by leaving it out: two deck spans, 140…250 and 286…380, with 36 units of
//   paper between them. A hole is an absence, not a lighter fill (§13's cheese).
// · two PIERS of 9×88 at x 148 and x 363, y 343…431, so the deck stands on
//   something rather than floating.
// · the SIGN is a post of 3×44 at x 168, y 290…334, and a board of 58×22 at
//   x 141, y 268…290. It carries one word, UNSAFE, because a sign nobody can read
//   at a glance is not a warning.
// · the GATE is 7 wide at x 214 and grows DOWNWARD from y 294 to the deck at 334 —
//   40 units at full height. It is the reader's own thumb on the last question,
//   and it is drawn at the near side of the gap so that shutting it stops anyone
//   reaching the hole at all.
// · THREE PLATES of 88×26 at x 118, 214, 310, top y 452 — the answers, each
//   carrying its own words (S11), below the piers and above the ground.
// · the figure stands at x 40 and walks to 96; his right edge at the walked mark
//   is 121, clear of the plates and under the deck's left end.
//
// Ink runs y 248 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const DECK_Y = 334;
const DECK_H = 9;
const DECK_L = 140;
const DECK_R = 380;
const GAP_L = 250;
const GAP_R = 286;

const PIER_W = 9;
const PIER_Y = DECK_Y + DECK_H;
const PIER_H = 88;

const SIGN_X = 168;
const SIGN_TOP = 268;
const BOARD_W = 58;
const BOARD_H = 22;

const GATE_X = 214;
const GATE_W = 7;
const GATE_TOP = 294;
const GATE_H = DECK_Y - GATE_TOP;

const PLATE_X = [118, 214, 310];
const PLATE_Y = 452;
const PLATE_W = 88;
const PLATE_H = 26;
const PLATE_CAP = ['HARM TO OTHERS', 'THEIR OWN GOOD', 'NOT YET TOLD'];
const PLATE_ID = ['others', 'own', 'untold'];
/** The only warrant Mill accepts. The other two are the two he argues against. */
const OTHERS = 0;

const CAP_T = 248;
const FIG_X = 40;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BRIDGE = BEATS.map((b) => (b.bridge ? 1 : 0));
const SIGN = BEATS.map((b) => (b.sign ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics25'));

export default function Ethics25Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(5);
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
      bridgeOn: carry(cv, 1, n, BRIDGE[p], BRIDGE[n], tr),
      signOn: carry(cv, 2, n, SIGN[p], SIGN[n], tr),
      platesOn: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
      // R7c — the gate IS the reader's position. `drag` reads dragPos, whose own
      // 0…1 is the answer, so nothing has to be mapped.
      gate: carry(cv, 4, n, 0, reacting ? dragPos.value : 0, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const bridgeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bridgeOn }));
  const signStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.signOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const gateStyle = useAnimatedStyle(() => ({
    height: GATE_H * SCENE.value.gate,
    opacity: SCENE.value.gate > 0.02 ? 1 : 0,
  }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">A PLANK IS MISSING</Text>

      <Animated.View style={[StyleSheet.absoluteFill, bridgeStyle]} pointerEvents="none">
        <View style={[styles.deck, { left: DECK_L, width: GAP_L - DECK_L }]} />
        <View style={[styles.deck, { left: GAP_R, width: DECK_R - GAP_R }]} />
        <View style={[styles.pier, { left: 148 }]} />
        <View style={[styles.pier, { left: 363 }]} />
        <Text style={styles.gapCap}>THE GAP</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, signStyle]} pointerEvents="none">
        <View style={styles.post} />
        <View style={styles.board} />
        <Text style={styles.boardText}>UNSAFE</Text>
      </Animated.View>

      <Animated.View style={[styles.gate, gateStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === OTHERS}
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
  // THE FLOOR THE GROUND LINE SITS ON — the subject stands on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 140, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  deck: {
    position: 'absolute', top: DECK_Y, height: DECK_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  pier: { position: 'absolute', top: PIER_Y, width: PIER_W, height: PIER_H, backgroundColor: INK },
  gapCap: {
    position: 'absolute', left: GAP_L - 12, top: DECK_Y + 16, width: 60, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },

  post: { position: 'absolute', left: SIGN_X, top: SIGN_TOP + BOARD_H, width: 3, height: 44, backgroundColor: INK },
  board: {
    position: 'absolute', left: 141, top: SIGN_TOP, width: BOARD_W, height: BOARD_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  boardText: {
    position: 'absolute', left: 141, top: SIGN_TOP + 6, width: BOARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  // GROWN DOWNWARD FROM THE TOP so a half-built gate reads as a barrier coming
  // down rather than one rising out of the deck.
  gate: { position: 'absolute', left: GATE_X, top: GATE_TOP, width: GATE_W, backgroundColor: INK },

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

export function Ethics25Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics25Scene} band={[240, 512]} camera={CAM} />;
}
