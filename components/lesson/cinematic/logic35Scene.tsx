import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic35Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO COLUMNS, ONE WRONG ARROW, AND THE BOX UNDERNEATH.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the two COLUMNS stand on a base line at y 392. Each is 54 wide, at x 168 and
//   x 264, and grows UPWARD to a full height of 120 — so their tops reach y 272
//   and they never enter the caption band.
// · their labels sit at y 396…408, directly under each column.
// · the FALSE ARROW runs between the column tops at y 250: a 2-thick bar from
//   x 190 to x 274 with a 10-unit head. It is cut by a 3-thick stroke drawn
//   across its middle at x 232, which is the only mark in the scene that means
//   "no" — and it is a stroke, not a colour (§19).
// · the THIRD CAUSE box is 96×32 at x 190, y 430…462, below the base line, with
//   two 2-thick arrows rising from its top corners to each column's foot.
// · the THREE CANDIDATES are 100×26 boxes at x 150, stacked at y 286, 318, 350 —
//   they occupy the same air the arrow does, so they only ever appear on the beat
//   the arrow is being questioned, and the arrow's own beat is over by then.
// · the figure stands at x 62 and walks to 130; crown ~397, clear of the columns
//   which start at x 168.
//
// Ink runs y 240 (caption) … y 500 (ground). BAND 234…512 = 278 (H59).
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BASE_Y = 392;
const COL_W = 54;
const COL_H = 120;
const COL_X = [168, 264];
const COL_LABEL = ['CONES', 'DROWNINGS'];

const ARROW_Y = 250;
const CAND_X = 150;
const CAND_Y = [286, 318, 350];
const CAND_TEXT = ['SWIMMING LESSONS', 'SUMMER HEAT', 'HOLIDAY PAY'];
const CAND_ID = ['lessons', 'heat', 'pay'];

const THIRD_X = 190;
const THIRD_Y = 430;

const CAP_T = 240;
const FIG_X = 62;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const RISE = BEATS.map((b) => b.rise ?? 0);
const ARROW = BEATS.map((b) => (b.arrow ? 1 : 0));
const PICKS = BEATS.map((b) => (b.picks ? 1 : 0));
const UNDER = BEATS.map((b) => (b.under ? 1 : 0));
const CUT = BEATS.map((b) => (b.cut ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
// The columns only GROW on the beat that raises them; on every later beat they
// hold their height, so they never re-climb behind the reader's back (the prop
// rule that aesthetics-1's apple taught).
const CLIMB = RISE.map((v, k) => (v > 0 && (k === 0 || RISE[k - 1] === 0) ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic35'));

export default function Logic35Scene({ clock, bt, bi, qv, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const q = clamp01(qv.value);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      t,
      // Climbing on their own beat, held everywhere after it.
      grow: CLIMB[n] === 1 ? ease01((bt.value - 0.2) / 1.5) : carry(cv, 1, n, RISE[p], RISE[n], tr),
      arrowOn: carry(cv, 2, n, ARROW[p], ARROW[n], tr),
      picksOn: carry(cv, 3, n, PICKS[p], PICKS[n], tr),
      underOn: carry(cv, 4, n, UNDER[p], UNDER[n], tr),
      cut: CUT[n] === 1 ? ease01((bt.value - 0.25) / 0.5) : 0,
      // The right candidate fills as the answer lands.
      lit: LIVE[n] === 1 ? ease01(q) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const arrowStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.arrowOn }));
  const underStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.underOn }));
  const cutStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.cut, transform: [{ scaleY: SCENE.value.cut }] }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>MEASURED ALL SUMMER</Text>

      <View style={styles.baseLine} pointerEvents="none" />
      {COL_X.map((cx, k) => <Column key={cx} S={SCENE} left={cx} label={COL_LABEL[k]} />)}

      <Animated.View style={[StyleSheet.absoluteFill, arrowStyle]} pointerEvents="none">
        <View style={styles.arrowBar} />
        <View style={styles.arrowHead} />
        <Text style={styles.arrowLabel}>CAUSES?</Text>
      </Animated.View>
      <Animated.View style={[styles.cutMark, cutStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, underStyle]} pointerEvents="none">
        <View style={styles.thirdBox} />
        <Text style={styles.thirdText}>SUMMER HEAT</Text>
        <View style={[styles.feedArm, { left: THIRD_X + 6, transform: [{ rotate: '-38deg' }] }]} />
        <View style={[styles.feedArm, { left: THIRD_X + 86, transform: [{ rotate: '38deg' }] }]} />
      </Animated.View>

      <Candidates S={SCENE} picked={picked} onPick={onPick} answered={answered} live={live} />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

function Column({ S, left, label }: { S: SharedValue<any>; left: number; label: string }) {
  // Grown from the BASE LINE upward: height is animated and `bottom` is pinned, so
  // the column cannot appear to slide down as it grows.
  const st = useAnimatedStyle(() => ({ height: COL_H * S.value.grow }));
  return (
    <View style={{ position: 'absolute', left, top: BASE_Y - COL_H, width: COL_W, height: COL_H, justifyContent: 'flex-end' }} pointerEvents="none">
      <Animated.View style={[styles.column, st]} />
      <Text style={styles.colLabel}>{label}</Text>
    </View>
  );
}

function Candidates({
  S, picked, onPick, answered, live,
}: {
  S: SharedValue<any>; picked: string | null; onPick: (id: string, ok: boolean) => void;
  answered: boolean; live: boolean;
}) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.picksOn }));
  const litStyle = useAnimatedStyle(() => ({ opacity: S.value.lit }));
  const wrong = (id: string) => answered && picked === id;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]}>
      {CAND_Y.map((cy, k) => (
        <Target
          key={cy}
          id={CAND_ID[k]}
          correct={k === 1}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.cand, { top: cy }]}
        >
          <View style={[styles.candBox, wrong(CAND_ID[k]) && styles.candWrong]} pointerEvents="none" />
          {k === 1 ? <Animated.View style={[styles.candLit, litStyle]} pointerEvents="none" /> : null}
          <Text style={styles.candText}>{CAND_TEXT[k]}</Text>
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 150, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  baseLine: { position: 'absolute', left: 150, top: BASE_Y, width: 232, height: 2, backgroundColor: INK },
  column: { width: COL_W, borderWidth: 2, borderColor: INK, backgroundColor: INK, borderRadius: 2 },
  colLabel: {
    position: 'absolute', left: -12, top: COL_H + 6, width: COL_W + 24, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },

  arrowBar: { position: 'absolute', left: 190, top: ARROW_Y, width: 84, height: 2, backgroundColor: INK },
  arrowHead: {
    position: 'absolute', left: 268, top: ARROW_Y - 4, width: 10, height: 10,
    borderRightWidth: 2, borderTopWidth: 2, borderColor: INK, transform: [{ rotate: '45deg' }],
  },
  arrowLabel: {
    position: 'absolute', left: 178, top: ARROW_Y - 18, width: 108, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },
  // The one mark in the scene that means "no": a stroke, never a colour.
  cutMark: { position: 'absolute', left: 231, top: ARROW_Y - 12, width: 3, height: 26, backgroundColor: INK, borderRadius: 2 },

  cand: { position: 'absolute', left: CAND_X, width: 100, height: 26 },
  candBox: {
    position: 'absolute', left: 0, top: 0, width: 100, height: 26,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  candLit: {
    position: 'absolute', left: 3, top: 3, width: 94, height: 20,
    borderRadius: 3, borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed',
  },
  candWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  candText: {
    position: 'absolute', left: 2, top: 8, width: 96, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  thirdBox: {
    position: 'absolute', left: THIRD_X, top: THIRD_Y, width: 96, height: 32,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  thirdText: {
    position: 'absolute', left: THIRD_X, top: THIRD_Y + 11, width: 96, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  feedArm: { position: 'absolute', top: BASE_Y + 4, width: 2, height: 34, backgroundColor: INK, transformOrigin: '50% 100%' },
});

export function Logic35Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic35Scene} band={[234, 512]} camera={CAM} />;
}
