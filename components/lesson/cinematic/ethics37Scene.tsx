import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics37Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO POSTS, A CORD BETWEEN THEM, AND FOUR THINGS LEANING ON IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the two POSTS are 6×96 uprights at x 150 and x 350, standing on a base line
//   at y 392, so their tops are at y 296.
// · the CORD runs between the post tops at y 300, 2.5 thick. It is scaled about
//   its LEFT end when it appears, so it is drawn across rather than fading in —
//   an obligation arriving, not an obligation dissolving into view.
// · the four PLANS lean against it: 34×46 slabs at x 186, 226, 266, 306, pivoting
//   about their own bottom edge at y 392. Upright they rest at −14°; fallen they
//   are at −86°, lying flat on the base line and never below it.
// · the CURTAIN is a 60×120 panel at x 358, y 272…392, drawn only on the unseen
//   beat. It hides nothing — it is a mark meaning "nobody is looking", drawn to
//   one side precisely so the reader can still see everything.
// · the figure stands at x 54 and walks to 126; crown ~397, level with the base
//   line and left of the first post at x 150.
//
// Ink runs y 240 (caption) … y 500 (ground). BAND 234…512 = 278 (H59).
//
// THE PLANS FALL WHEN THE CORD IS CUT, AND THE CURTAIN CHANGES NOTHING. If they
// stayed up while unobserved the scene would be arguing the opposite lesson (A1).
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BASE_Y = 392;
const POST_X = [150, 350];
const POST_TOP = 296;
const CORD_Y = 300;

const PLAN_X = [186, 226, 266, 306];
const PLAN_W = 34;
const PLAN_H = 46;
const PLAN_UP = -14;
const PLAN_DOWN = -86;
const PLAN_ID = ['plans', 'cord', 'posts'];

const CAP_T = 240;
const FIG_X = 54;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const POSTS = BEATS.map((b) => (b.posts ? 1 : 0));
const CORD = BEATS.map((b) => (b.cord ? 1 : 0));
const LEAN = BEATS.map((b) => b.lean ?? 0);
const CUT = BEATS.map((b) => (b.cut ? 1 : 0));
const UNSEEN = BEATS.map((b) => (b.unseen ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics37'));

export default function Ethics37Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(6);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // The cord is DRAWN across on the beat it appears, and held after — an
    // obligation that faded in would be a picture of something gradual.
    const arriving = CORD[n] === 1 && CORD[p] === 0;
    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      t,
      postsOn: carry(cv, 1, n, POSTS[p], POSTS[n], tr),
      cord: arriving ? ease01((bt.value - 0.25) / 0.7) : carry(cv, 2, n, CORD[p], CORD[n], tr),
      lean: carry(cv, 3, n, LEAN[p], LEAN[n], tr),
      fall: carry(cv, 4, n, CUT[p], CUT[n], tr),
      unseenOn: carry(cv, 5, n, UNSEEN[p], UNSEEN[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const postsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.postsOn }));
  const cordStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.cord > 0 ? 1 : 0,
    transform: [{ scaleX: SCENE.value.cord * (1 - SCENE.value.fall) }],
  }));
  const curtainStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.unseenOn }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>AN ORDINARY TUESDAY</Text>

      <Animated.View style={[StyleSheet.absoluteFill, postsStyle]}>
        <View style={styles.base} pointerEvents="none" />
        {POST_X.map((px) => <View key={px} style={[styles.post, { left: px }]} pointerEvents="none" />)}

        <Animated.View style={[styles.cord, cordStyle]} pointerEvents="none" />

        {PLAN_X.map((qx, k) => <Plan key={qx} S={SCENE} left={qx} index={k} />)}

        <Target
          id="plans"
          correct
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={styles.hitPlans}
        >
          <View style={styles.hitBox} pointerEvents="none" />
        </Target>
        <Target
          id="cord"
          correct={false}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={styles.hitCord}
        >
          <View style={[styles.hitBox, answered && picked === 'cord' && styles.hitWrong]} pointerEvents="none" />
        </Target>
        <Target
          id="posts"
          correct={false}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={styles.hitPosts}
        >
          <View style={[styles.hitBox, answered && picked === 'posts' && styles.hitWrong]} pointerEvents="none" />
        </Target>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, curtainStyle]} pointerEvents="none">
        <View style={styles.curtain} />
        <Text style={styles.curtainLabel}>NOBODY{'\n'}LOOKING</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One thing the other person arranged around your word. It leans, then it falls. */
function Plan({ S, left, index }: { S: SharedValue<any>; left: number; index: number }) {
  const st = useAnimatedStyle(() => {
    const up = clamp01(S.value.lean * 4 - index);
    const deg = PLAN_UP + (PLAN_DOWN - PLAN_UP) * S.value.fall;
    return { opacity: up, transform: [{ rotate: `${deg}deg` }] };
  });
  return <Animated.View style={[styles.plan, { left }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 150, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  base: { position: 'absolute', left: 136, top: BASE_Y, width: 244, height: 2, backgroundColor: INK },
  post: { position: 'absolute', top: POST_TOP, width: 6, height: BASE_Y - POST_TOP, backgroundColor: INK, borderRadius: 2 },
  // Scaled about its LEFT end, so the cord is drawn across between the posts.
  cord: {
    position: 'absolute', left: POST_X[0] + 3, top: CORD_Y, width: POST_X[1] - POST_X[0], height: 2.5,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },

  // Pivots about its own bottom edge, which is where a leaning thing turns.
  plan: {
    position: 'absolute', top: BASE_Y - PLAN_H, width: PLAN_W, height: PLAN_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    transformOrigin: '50% 100%',
  },

  curtain: {
    position: 'absolute', left: 358, top: 272, width: 34, height: 120,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: PAPER,
  },
  curtainLabel: {
    position: 'absolute', left: 348, top: 396, width: 54, textAlign: 'center', lineHeight: 10.8,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },

  hitPlans: { position: 'absolute', left: 180, top: 336, width: 166, height: 58 },
  hitCord: { position: 'absolute', left: 156, top: 288, width: 188, height: 26 },
  hitPosts: { position: 'absolute', left: 142, top: 316, width: 26, height: 76 },
  hitBox: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 4 },
  hitWrong: { borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Ethics37Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics37Scene} band={[234, 512]} camera={CAM} />;
}
