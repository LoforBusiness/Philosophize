import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics18Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE ARROWS THAT TOUCH SOMETHING, AND A FOURTH THAT DOES NOT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · FOUR PLINTHS, 76 wide and 44 tall, at y 288…332, lefts 30 · 118 · 206 · 294 —
//   the row ends at x 370. APPLE · CHAIR · STAR · THE NUMBER 3.
// · FOUR ARROWS above them at x centre, y 248…284: a 2-thick stem with a head at
//   its foot. The first three end at y 284, four units clear of their plinth,
//   which reads as touching. The FOURTH is drawn 16 shorter, ending at y 268, so
//   there is a measured 20-unit hole between its head and the plinth — and it
//   wavers ±2 on the wall clock, because a thing that has not landed does not
//   sit still.
// · the CAPTION POINT AT IT sits at y 230, above the arrows and left-aligned to
//   the row so it reads as an instruction to the whole picture.
// · SOME OTHER PLACE is a dashed 1-thick box, 164 wide, at x 206…370, y 344…368,
//   with a dashed stem from the fourth plinth's foot into it. Dashed throughout
//   and never filled: it is a proposal, not a location.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the dashed
//   box ends at y 368, so 29 units stay clear at every stop.
//
// Ink runs y 230 (the caption) … y 500. BAND 224…512 = 288, with the 103-unit
// figure at 36%.
//
// THE GAP IS GEOMETRY, NOT OPACITY. A faded fourth arrow would say the pointing
// was weak; a short one says it did not reach, which is the claim.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const PL_Y = 288;
const PL_W = 76;
const PL_H = 44;
const PL_X = [30, 118, 206, 294];
const PL_ID = ['apple', 'chair', 'star', 'three'];
const PL_CAP = ['APPLE', 'CHAIR', 'STAR', 'THE NUMBER 3'];

const ARROW_TOP = 248;
const ARROW_FULL = 36;
const ARROW_SHORT = 20;

const BEY_X = 206;
const BEY_Y = 344;
const BEY_W = 164;
const BEY_H = 24;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const SHELF = BEATS.map((b) => b.shelf ?? 0);
const AIM = BEATS.map((b) => b.aim ?? 0);
const HANG = BEATS.map((b) => b.hang ?? 0);
const BEYOND = BEATS.map((b) => b.beyond ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics18'));

export default function Metaphysics18Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      shelf: carry(cv, 1, n, SHELF[p], SHELF[n], tr),
      aim: carry(cv, 2, n, AIM[p], AIM[n], tr),
      hang: carry(cv, 3, n, HANG[p], HANG[n], tr),
      beyond: carry(cv, 4, n, BEYOND[p], BEYOND[n], tr),
      // The wall clock, so the unlanded arrow keeps hunting while the reader
      // reads. A waver that finished would be a picture of it arriving.
      waver: Math.sin(t * 2.2),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const shelfStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shelf }));
  const beyondStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.beyond }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap} pointerEvents="none">POINT AT IT</Text>

      <Animated.View style={[StyleSheet.absoluteFill, shelfStyle]}>
        {PL_X.map((px, k) => (
          <View key={`p${px}`} pointerEvents="none">
            <View style={[styles.plinth, { left: px }]} />
            <Text style={[styles.plinthCap, { left: px }]} numberOfLines={2}>{PL_CAP[k]}</Text>
          </View>
        ))}

        {PL_X.map((px, k) => <Aim key={`a${px}`} S={SCENE} index={k} />)}

        {PL_X.map((px, k) => (
          <Target
            key={PL_ID[k]}
            id={PL_ID[k]}
            correct={PL_ID[k] === 'three'}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: px }]}
          >
            <View
              style={[
                styles.hitBox,
                answered && PL_ID[k] === 'three' && styles.hitRight,
                answered && picked === PL_ID[k] && PL_ID[k] !== 'three' && styles.hitWrong,
              ]}
              pointerEvents="none"
            />
          </Target>
        ))}
      </Animated.View>

      {/* THE PROPOSAL. Dashed all the way through, because it is one. */}
      <Animated.View style={[StyleSheet.absoluteFill, beyondStyle]} pointerEvents="none">
        <View style={styles.beyStem} />
        <View style={styles.beyond} />
        <Text style={styles.beyondText}>SOME OTHER PLACE</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One arrow. The first three reach their plinth; the fourth is short by 16 and
 * hunts on the wall clock for something to land on.
 */
function Aim({ S, index }: { S: { value: { aim: number; hang: number; waver: number } }; index: number }) {
  const cx = PL_X[index] + PL_W / 2;
  const last = index === 3;
  const st = useAnimatedStyle(() => {
    const h = last ? ARROW_FULL - ARROW_SHORT * S.value.hang : ARROW_FULL;
    return {
      opacity: S.value.aim,
      height: h,
      transform: [{ translateY: last ? S.value.waver * 2 * S.value.hang : 0 }],
    };
  });
  const headStyle = useAnimatedStyle(() => {
    const h = last ? ARROW_FULL - ARROW_SHORT * S.value.hang : ARROW_FULL;
    return {
      opacity: S.value.aim,
      top: ARROW_TOP + h - 4,
      transform: [{ translateY: last ? S.value.waver * 2 * S.value.hang : 0 }, { rotate: '45deg' }],
    };
  });
  return (
    <View pointerEvents="none">
      <Animated.View style={[styles.stem, { left: cx - 1 }, st]} />
      <Animated.View style={[styles.head, { left: cx - 5 }, headStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 30, top: 230, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  stem: { position: 'absolute', top: ARROW_TOP, width: 2, backgroundColor: INK },
  head: {
    position: 'absolute', width: 10, height: 10,
    borderRightWidth: 2, borderBottomWidth: 2, borderColor: INK,
  },

  plinth: {
    position: 'absolute', top: PL_Y, width: PL_W, height: PL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  plinthCap: {
    position: 'absolute', top: PL_Y + 13, width: PL_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.7, color: INK, includeFontPadding: false,
  },

  beyStem: {
    position: 'absolute', left: PL_X[3] + PL_W / 2 - 1, top: PL_Y + PL_H, width: 2, height: BEY_Y - PL_Y - PL_H,
    borderLeftWidth: 2, borderStyle: 'dashed', borderColor: SOFT,
  },
  beyond: {
    position: 'absolute', left: BEY_X, top: BEY_Y, width: BEY_W, height: BEY_H,
    borderWidth: 1, borderStyle: 'dashed', borderColor: SOFT, borderRadius: 3,
  },
  beyondText: {
    position: 'absolute', left: BEY_X, top: BEY_Y + 8, width: BEY_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PL_Y, width: PL_W, height: PL_H },
  hitBox: { width: PL_W, height: PL_H, borderRadius: 3 },
  hitRight: { borderWidth: 3, borderColor: INK },
  hitWrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Metaphysics18Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics18Scene} band={[224, 512]} camera={CAM} />;
}
