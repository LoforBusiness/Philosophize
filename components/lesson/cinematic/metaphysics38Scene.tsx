import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics38Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE DAYS ON THREE PLINTHS, AND TWO LIFELINES OF DIFFERENT LENGTHS.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · three COLUMNS of 76 at x 138 · 224 · 310, so the row runs 138…386. Each is a
//   day name at y 268, the clay at y 288…330, and a PLINTH 76×16 at y 330.
// · MONDAY and WEDNESDAY draw a LUMP — 48×32, four different corner radii, so it
//   is a blob rather than a rounded rectangle. TUESDAY draws a VASE: a 40×28 bowl
//   with a deep bottom radius, a 14×10 neck, a 24×4 rim. Both are STONE inside
//   INK, because they are the same clay.
// · the two LIFELINES are bars 20 tall at y 356 and y 384. THE CLAY spans the
//   whole 248 from 138 to 386. THE VASE is drawn at that same full width and
//   SCALED IN X to 0.306, which is exactly the middle column's share — the two
//   bars share the centre 262, so scaling about it lands the short bar on
//   Tuesday's column with no second set of coordinates to keep in step.
// · THE LABEL IS NOT INSIDE THE SCALED BAR. A word in a view being scaled in x is
//   a squashed word; the names ride separately, centred on 262.
// · the SORT's three bins are three spans of that bar: 1 for the clay itself,
//   0.306 for a second thing, 0 for no thing at all — so the reader watches the
//   vase's life stretch or vanish as their chip travels.
// · the figure stands at x 52 and walks to 98; his right edge is 124, clear of
//   the first column's 138.
//
// Ink runs y 236 (the caption) … y 500 (ground). BAND 230…512 = 282 — a 103-unit
// figure at 36.5%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const COL_X = [138, 224, 310];
const COL_W = 76;
const DAY_Y = 268;
const OBJ_Y = 288;
const OBJ_H = 42;
const PLINTH_Y = 330;
const PLINTH_H = 16;
const DAY_CAP = ['MONDAY', 'TUESDAY', 'WEDNESDAY'];
const DAY_ID = ['mon', 'tue', 'wed'];

const BAR_X = COL_X[0];
const BAR_W = COL_X[2] + COL_W - COL_X[0];
const CLAY_Y = 356;
const VASE_Y = 384;
const BAR_H = 20;
/** The middle column's share of the full bar — the vase's own life, to scale. */
const NAT = COL_W / BAR_W;

const CAP_T = 236;
const FIG_X = 52;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const DAYS = BEATS.map((b) => (b.days ? 1 : 0));
const OBJECTS = BEATS.map((b) => (b.objects ? 1 : 0));
const LINES = BEATS.map((b) => (b.lines ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE THREE BINS AS THREE LIVES, in the SORT'S OWN ORDER — `pickPos` is 0..1
// across the bins as the author wrote them, and that is the only order a picture
// may follow, because the rows the reader sees are shuffled.
//                    the clay itself · a second thing · no thing at all
const SPAN_AT = [1, NAT, 0];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics38'));

export default function Metaphysics38Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      daysOn: carry(cv, 1, n, DAYS[p], DAYS[n], tr),
      objectsOn: carry(cv, 2, n, OBJECTS[p], OBJECTS[n], tr),
      linesOn: carry(cv, 3, n, LINES[p], LINES[n], tr),
      // R7c — THE CHIP IS THE VASE'S LIFE. Everywhere but the graded beat this is
      // the bar's own natural span; there it is wherever the reader has the chip.
      span: carry(cv, 4, n, LINES[p] * NAT, reacting ? pickAt(SPAN_AT, pickPos.value) : LINES[n] * NAT, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const daysStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.daysOn }));
  const objStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.objectsOn }));
  const linesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.linesOn }));
  const vaseBarStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: SCENE.value.span }] }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">ONE PIECE OF CLAY, THREE DAYS</Text>

      <Animated.View style={[StyleSheet.absoluteFill, daysStyle]}>
        {COL_X.map((cx, k) => (
          <Target
            key={cx}
            id={DAY_ID[k]}
            correct={k === 1}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: cx }]}
          >
            <Text style={styles.dayText} pointerEvents="none">{DAY_CAP[k]}</Text>
            <Animated.View style={[styles.objBox, objStyle]} pointerEvents="none">
              {k === 1 ? (
                <>
                  <View style={styles.vaseRim} />
                  <View style={styles.vaseNeck} />
                  <View style={styles.vaseBowl} />
                </>
              ) : (
                <View style={styles.lump} />
              )}
            </Animated.View>
            <View
              style={[
                styles.plinth,
                answered && picked === DAY_ID[k] && k !== 1 && styles.plinthWrong,
                answered && k === 1 && styles.plinthRight,
              ]}
              pointerEvents="none"
            />
          </Target>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, linesStyle]} pointerEvents="none">
        <View style={styles.clayBar} />
        <Text style={[styles.barText, { top: CLAY_Y + 6 }]}>THE CLAY</Text>
        <Animated.View style={[styles.vaseBar, vaseBarStyle]} />
        <Text style={[styles.barText, { top: VASE_Y + 6 }]}>THE VASE</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — political7 and political8 both stand
  // their subject on a filled mass rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: BAR_X, top: CAP_T, width: BAR_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: DAY_Y, width: COL_W, height: PLINTH_Y + PLINTH_H - DAY_Y },
  dayText: {
    position: 'absolute', left: 0, top: 0, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  objBox: { position: 'absolute', left: 0, top: OBJ_Y - DAY_Y, width: COL_W, height: OBJ_H },

  lump: {
    position: 'absolute', left: (COL_W - 48) / 2, top: OBJ_H - 32, width: 48, height: 32,
    borderTopLeftRadius: 22, borderTopRightRadius: 15, borderBottomLeftRadius: 9, borderBottomRightRadius: 14,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  vaseBowl: {
    position: 'absolute', left: (COL_W - 40) / 2, top: OBJ_H - 28, width: 40, height: 28,
    borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  vaseNeck: {
    position: 'absolute', left: (COL_W - 14) / 2, top: OBJ_H - 38, width: 14, height: 12,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  vaseRim: {
    position: 'absolute', left: (COL_W - 24) / 2, top: OBJ_H - 42, width: 24, height: 5,
    borderRadius: 2, borderWidth: 1.5, borderColor: INK, backgroundColor: STONE,
  },

  plinth: {
    position: 'absolute', left: 0, top: PLINTH_Y - DAY_Y, width: COL_W, height: PLINTH_H,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: STONE,
  },
  plinthRight: { backgroundColor: INK },
  plinthWrong: { borderColor: SOFT, borderStyle: 'dashed' },

  clayBar: {
    position: 'absolute', left: BAR_X, top: CLAY_Y, width: BAR_W, height: BAR_H,
    borderRadius: 3, backgroundColor: STONE, borderWidth: 1.5, borderColor: INK,
  },
  // BOTH BARS ARE THE SAME MATERIAL, because they are the same clay. What
  // separates them is length, and a second fill would say something the argument
  // does not — and would put an INK ground under a label that has to survive the
  // bar shrinking out from under it.
  vaseBar: {
    position: 'absolute', left: BAR_X, top: VASE_Y, width: BAR_W, height: BAR_H,
    borderRadius: 3, backgroundColor: STONE, borderWidth: 1.5, borderColor: INK,
    transformOrigin: '50% 50%',
  },
  barText: {
    position: 'absolute', left: BAR_X, width: BAR_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics38Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics38Scene} band={[230, 512]} camera={CAM} />;
}
