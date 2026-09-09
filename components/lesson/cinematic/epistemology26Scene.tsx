import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology26Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE RECEIPT, AND TWO COLUMNS THAT START AT EXACTLY THE SAME HEIGHT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the BILL is 104×54 at x 132 (132…236), y 262…316 — the shared evidence, drawn
//   once and never altered. Four RULES across it read as a receipt. Both of them
//   have all of it, so a picture that gave one of them more would be answering
//   the question before it was asked.
// · TWO COLUMNS of 34 wide at x 140 and x 196, standing on a floor at y 434. They
//   are level at 50 units and part only under the reader's own answer: holding
//   takes YOURS to 100 (top y 334, eighteen units clear of the bill) and HERS to
//   18. One style draws both — the claim is that nothing separates them.
// · COLUMN LABELS of 44 wide sit under their own columns at y 440, in ink on paper.
// · THREE PLATES of 140×26 in a COLUMN at x 250 (250…390), tops y 340 · 380 · 420.
//   A column rather than a row (H60b): the readings are sentences rather than
//   labels, and a row of them at this width would not fit the stage.
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, nineteen units clear of the bill at 132.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BILL_X = 132;
const BILL_Y = 262;
const BILL_W = 104;
const BILL_H = 54;
const BILL_RULES = 4;

const COL_X = [140, 196];
const COL_W = 34;
const COL_FLOOR = 434;
/** Level while nothing has been claimed, and parted only by the reader. */
const COL_LEVEL = 50;
const COL_MINE_MAX = 100;
const COL_HERS_MIN = 18;
const COL_CAP = ['YOURS', 'HERS'];
const COL_LABEL_Y = 440;

const PLATE_X = 250;
const PLATE_W = 140;
const PLATE_H = 26;
const PLATE_Y = [340, 380, 420];
const PLATE_CAP = ['SHE IS SURE TOO', 'FEELINGS NEVER COUNT', 'SHE SPOKE LAST'];
const PLATE_ID = ['symmetry', 'never', 'last'];
/** The symmetry that makes confidence useless here. The other two are not rules. */
const SYMMETRY = 0;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BILL = BEATS.map((b) => (b.bill ? 1 : 0));
const PAIR = BEATS.map((b) => (b.pair ? 1 : 0));
const HOLD = BEATS.map((b) => b.hold ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology26'));

export default function Epistemology26Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      billOn: carry(cv, 1, n, BILL[p], BILL[n], tr),
      pairOn: carry(cv, 2, n, PAIR[p], PAIR[n], tr),
      // R7c — the knob's own 0…1 IS how far the reader holds their ground, so the
      // two columns are the control's picture rather than a diagram beside it.
      hold: carry(cv, 3, n, HOLD[p], reacting ? dragPos.value : HOLD[n], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const billStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.billOn }));
  const pairStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pairOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const mineStyle = useAnimatedStyle(() => {
    const h = COL_LEVEL + (COL_MINE_MAX - COL_LEVEL) * SCENE.value.hold;
    return { height: h, top: COL_FLOOR - h };
  });
  const hersStyle = useAnimatedStyle(() => {
    const h = COL_LEVEL - (COL_LEVEL - COL_HERS_MIN) * SCENE.value.hold;
    return { height: h, top: COL_FLOOR - h };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE BILL, TWO TOTALS</Text>

      <Animated.View style={[StyleSheet.absoluteFill, billStyle]} pointerEvents="none">
        <View style={styles.bill} />
        {Array.from({ length: BILL_RULES }, (_, k) => (
          <View key={k} style={[styles.billRule, { top: BILL_Y + 14 + k * 9 }]} />
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, pairStyle]} pointerEvents="none">
        <Animated.View style={[styles.column, { left: COL_X[0] }, mineStyle]} />
        <Animated.View style={[styles.column, { left: COL_X[1] }, hersStyle]} />
        {COL_X.map((cx, k) => (
          <Text key={cx} style={[styles.columnText, { left: cx - 5 }]}>{COL_CAP[k]}</Text>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === SYMMETRY}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { top: PLATE_Y[k] }]}
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
    position: 'absolute', left: BILL_X, top: CAP_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  bill: {
    position: 'absolute', left: BILL_X, top: BILL_Y, width: BILL_W, height: BILL_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  billRule: { position: 'absolute', left: BILL_X + 10, width: BILL_W - 20, height: 2, backgroundColor: SOFT },

  // ONE STYLE FOR BOTH COLUMNS. They are level until the reader parts them, which
  // is the only thing in the lesson that can.
  column: {
    position: 'absolute', width: COL_W,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  columnText: {
    position: 'absolute', top: COL_LABEL_Y, width: 44, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', left: PLATE_X, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Epistemology26Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology26Scene} band={[240, 512]} camera={CAM} />;
}
