import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology28Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO HURDLES ON ONE TRACK, FED BY ONE NUMBER.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the TRACK is a filled STONE band 268×16 at x 116 (116…384), y 384…400. Both
//   hurdles stand on it, which is the point: one standard, two applications.
// · TWO HURDLES, each a pair of 6-wide ink uprights and a 60×6 crossbar. The left
//   pair at x 150 and 204, the right at x 286 and 340. A bar sits `h` above the
//   track, where h runs 26…132, so the tallest crossbar tops out at y 252.
// · the LEAN drives both: the left bar takes h(lean) and the right h(1 − lean),
//   because a reader who drops the bar for the news they want has raised it for
//   the news they do not, whether or not they noticed doing it.
// · TWO NAMES of 92 under the track at y 406, centred on each hurdle (180, 316).
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 26 and walks to 82; his widest span at the walked mark
//   is x ≈ 57…107, nine units clear of the track at 116.
//
// Ink runs y 242 (the caption) … y 500 (ground). BAND 238…512 = 274 — a 103-unit
// figure at 37.6%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const TRACK_X = 116;
const TRACK_Y = 384;
const TRACK_W = 268;
const TRACK_H = 16;

const POST_W = 6;
const BAR_W = 60;
const BAR_H = 6;
/** [left upright, right upright] for each hurdle. */
const HUR_X = [[150, 204], [286, 340]];
const HUR_MID = [180, 316];
const H_LO = 26;
const H_HI = 132;

const NAME = ['NEWS YOU LIKE', 'NEWS YOU DO NOT'];
const NAME_W = 92;
const NAME_T = 406;

const CAP_T = 242;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['IT LOWERS THE BAR', 'IT LEVELS THE TWO BARS', 'IT RAISES BOTH BARS'];
const PLATE_ID = ['lower', 'level', 'raise'];
/** Symmetry is the whole repair: one standard, applied both ways. */
const LEVEL = 1;

const FIG_X = 26;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const TRACK = BEATS.map((b) => (b.track ? 1 : 0));
const BARS = BEATS.map((b) => (b.bars ? 1 : 0));
const LEAN = BEATS.map((b) => b.lean ?? 0.5);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology28'));

export default function Epistemology28Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      track: carry(cv, 1, n, TRACK[p], TRACK[n], tr),
      bars: carry(cv, 2, n, BARS[p], BARS[n], tr),
      // R7b — a split's seam is the LEFT side's share, and the left side here is
      // the study you were hoping to believe.
      lean: carry(cv, 3, n, LEAN[p], reacting ? dragPos.value : LEAN[n], tr),
      plates: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const trackStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.track }));
  const barsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bars }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  // TWO HURDLES OFF ONE VALUE. The uprights and the crossbar are one worklet each
  // so the bar and its legs can never disagree about where the top is.
  const leftPost = useAnimatedStyle(() => {
    const h = H_LO + clamp01(SCENE.value.lean) * (H_HI - H_LO);
    return { top: TRACK_Y - h, height: h };
  });
  const rightPost = useAnimatedStyle(() => {
    const h = H_LO + clamp01(1 - SCENE.value.lean) * (H_HI - H_LO);
    return { top: TRACK_Y - h, height: h };
  });
  const leftBar = useAnimatedStyle(() => {
    const h = H_LO + clamp01(SCENE.value.lean) * (H_HI - H_LO);
    return { top: TRACK_Y - h - BAR_H };
  });
  const rightBar = useAnimatedStyle(() => {
    const h = H_LO + clamp01(1 - SCENE.value.lean) * (H_HI - H_LO);
    return { top: TRACK_Y - h - BAR_H };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE BAR EACH STUDY MUST CLEAR</Text>

      <Animated.View style={[StyleSheet.absoluteFill, barsStyle]} pointerEvents="none">
        {HUR_X[0].map((px) => (
          <Animated.View key={px} style={[styles.post, { left: px }, leftPost]} />
        ))}
        {HUR_X[1].map((px) => (
          <Animated.View key={px} style={[styles.post, { left: px }, rightPost]} />
        ))}
        <Animated.View style={[styles.bar, { left: HUR_X[0][0] }, leftBar]} />
        <Animated.View style={[styles.bar, { left: HUR_X[1][0] }, rightBar]} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, trackStyle]} pointerEvents="none">
        <View style={styles.track} />
        {HUR_MID.map((mx, k) => (
          <Text key={mx} style={[styles.name, { left: mx - NAME_W / 2 }]}>{NAME[k]}</Text>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === LEVEL}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === LEVEL}
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
    position: 'absolute', left: TRACK_X, top: CAP_T, width: TRACK_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  track: {
    position: 'absolute', left: TRACK_X, top: TRACK_Y, width: TRACK_W, height: TRACK_H,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: RULE,
  },
  post: { position: 'absolute', width: POST_W, backgroundColor: INK },
  bar: { position: 'absolute', width: BAR_W, height: BAR_H, backgroundColor: INK },
  name: {
    position: 'absolute', top: NAME_T, width: NAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: SOFT, includeFontPadding: false,
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

export function Epistemology28Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology28Scene} band={[238, 512]} camera={CAM} />;
}
