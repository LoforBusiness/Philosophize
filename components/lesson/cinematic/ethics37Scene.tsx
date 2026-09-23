import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics37Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerRise } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('ethics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const POSTS = BEATS.map((b) => (b.posts ? 1 : 0));
const CORD = BEATS.map((b) => (b.cord ? 1 : 0));
const LEAN = BEATS.map((b) => b.lean ?? 0);
const CUT = BEATS.map((b) => (b.cut ? 1 : 0));
const UNSEEN = BEATS.map((b) => (b.unseen ? 1 : 0));
const WHO = BEATS.map((b) => (b.who ? 1 : 0));
const NOTHING = BEATS.map((b) => (b.nothing ? 1 : 0));
const NAMED = BEATS.map((b) => (b.named ? 1 : 0));
const THIS_PLAN = BEATS.map((b) => (b.thisPlan ? 1 : 0));
const ANOTHER_PLAN = BEATS.map((b) => (b.anotherPlan ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics37'));

export default function Ethics37Scene({ clock, bt, bi, i, picked, onPick, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(11);
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
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      postsOn: carry(cv, 1, n, POSTS[p], POSTS[n], tr),
      // Through the carry while it is drawn too, or the beat after draws it again
      // (C20c).
      cord: carry(cv, 2, n, CORD[p], CORD[n], arriving ? ease01((bt.value - 0.25) / 0.7) : tr),
      // R7b — the seam leans the week on the promise. Slide toward ON YOUR FRIEND and
      // the four plans tip onto the cord; slide to the practice and they stand up on
      // their own, with nobody in particular relying on you.
      lean: carry(cv, 3, n, LEAN[p], reacting ? pickPos.value : LEAN[n], tr),
      fall: carry(cv, 4, n, CUT[p], CUT[n], tr),
      unseenOn: carry(cv, 5, n, UNSEEN[p], UNSEEN[n], tr),
      // "Binds the speaker to the other person" — labels find the two posts.
      who: carry(cv, 6, n, WHO[p], WHO[n], tr),
      // "Nothing else changes" — a circle-slash holds low between the posts.
      nothing: carry(cv, 7, n, NOTHING[p], NOTHING[n], tr),
      // "Only a human convention could explain the change" — a plate names it.
      named: carry(cv, 8, n, NAMED[p], NAMED[n], tr),
      // "Has cancelled a plan" — a dashed ring finds the first leaning plan.
      thisPlan: carry(cv, 9, n, THIS_PLAN[p], THIS_PLAN[n], tr),
      // "Told a friend and stopped looking" — a dashed ring finds the second.
      anotherPlan: carry(cv, 10, n, ANOTHER_PLAN[p], ANOTHER_PLAN[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const postsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.postsOn }));
  const whoStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.who }));
  const nothingStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.nothing }));
  const namedStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.named }));
  const thisPlanStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.thisPlan }));
  const anotherPlanStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.anotherPlan }));
  const cordStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.cord > 0 ? 1 : 0,
    transform: [{ scaleX: SCENE.value.cord * (1 - SCENE.value.fall) }],
  }));
  const curtainStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.unseenOn }));
  // Hung from its top edge, the cloth breathes a little; the label under it stays put.
  const clothStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.sin(SCENE.value.t * 0.8) * 1.2 },
      { scaleX: 1 + Math.sin(SCENE.value.t * 1.05 + 0.7) * 0.05 },
    ],
  }));

  // THE PLANS ARE THE ANSWER, so all four rise together (E39). A pure translate:
  // each is placed individually, so scaling them about their own centres would
  // spread them apart.
  const planRise = useAnswerRise(picked, 'plans', true);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap}>AN ORDINARY TUESDAY</Text>

      <Animated.View style={[StyleSheet.absoluteFill, postsStyle]}>
        <View style={styles.base} pointerEvents="none" />
        {POST_X.map((px) => <View key={px} style={[styles.post, { left: px }]} pointerEvents="none" />)}

        <Animated.View style={[styles.cord, cordStyle]} pointerEvents="none" />

        <Animated.View style={planRise} pointerEvents="none">
          {PLAN_X.map((qx, k) => <Plan key={qx} S={SCENE} left={qx} index={k} />)}
        </Animated.View>

        <Target
          id="plans"
          correct
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={styles.hitPlans}
        >
          <Text style={[styles.hitName]}>THEIR PLANS</Text>
          <View style={[styles.hitBox, live && !answered && styles.hitLive]} pointerEvents="none" />
        </Target>
        <Target
          id="cord"
          correct={false}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={styles.hitCord}
        >
          <Text style={[styles.hitName]}>THE PROMISE</Text>
          <View style={[styles.hitBox, live && !answered && styles.hitLive, answered && picked === 'cord' && styles.hitWrong]} pointerEvents="none" />
        </Target>
        <Target
          id="posts"
          correct={false}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={styles.hitPosts}
        >
          <Text style={[styles.hitName, styles.hitNameL]}>THE TWO</Text>
          <View style={[styles.hitBox, live && !answered && styles.hitLive, answered && picked === 'posts' && styles.hitWrong]} pointerEvents="none" />
        </Target>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, curtainStyle]} pointerEvents="none">
        <Animated.View style={[styles.curtain, clothStyle]} />
        <Text style={styles.curtainLabel}>NOBODY{'\n'}LOOKING</Text>
      </Animated.View>

      {/* "Binds the speaker to the other person" — labels find the two posts. */}
      <Animated.Text style={[styles.whoTag, whoStyle, { left: POST_X[0] - 29 }]} numberOfLines={1}>SPEAKER</Animated.Text>
      <Animated.Text style={[styles.whoTag, whoStyle, { left: POST_X[1] - 29 }]} numberOfLines={1}>PROMISED</Animated.Text>

      {/* "Nothing else changes" — a circle-slash holds low between the posts. */}
      <Animated.View style={[styles.nothingMark, nothingStyle]} pointerEvents="none">
        <View style={styles.nothingRing} />
        <View style={styles.nothingSlash} />
      </Animated.View>

      {/* "Only a human convention could explain the change" — named above the cord. */}
      <Animated.View style={[styles.namedTag, namedStyle]} pointerEvents="none">
        <Text style={styles.namedText} numberOfLines={1}>CONVENTION</Text>
      </Animated.View>

      {/* "Has cancelled a plan" — a dashed ring finds the first leaning plan. */}
      <Animated.View style={[styles.planRing, thisPlanStyle, { left: PLAN_X[0] - 6 }]} pointerEvents="none" />

      {/* "Told a friend and stopped looking" — a dashed ring finds the second. */}
      <Animated.View style={[styles.planRing, anotherPlanStyle, { left: PLAN_X[1] - 6 }]} pointerEvents="none" />

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
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

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
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
    transformOrigin: '50% 100%',
  },

  curtain: {
    position: 'absolute', left: 358, top: 272, width: 34, height: 120,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE, boxShadow: LIP,
    transformOrigin: '50% 0%',
  },
  curtainLabel: {
    position: 'absolute', left: 348, top: 396, width: 54, textAlign: 'center', lineHeight: 10.8,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },

  // THE THREE CHOICES, EACH WITH ITS NAME IN IT (S11).
  //
  // They were three bare regions 26 to 188 units wide with nothing written in any of
  // them, sitting edge to edge: the cord's box ended at 314 and the posts' began at
  // 316, and `Target` draws its halo three units outside, so the two outlines met.
  // Each box now holds its own label in the clear band above the art it covers, and
  // the three stand apart.
  hitCord: { position: 'absolute', left: 152, top: 282, width: 196, height: 34 },
  hitPosts: { position: 'absolute', left: 96, top: 320, width: 72, height: 78 },
  hitPlans: { position: 'absolute', left: 172, top: 320, width: 176, height: 78 },
  /** The name of the thing the box is over, at the top of it, clear of the art. */
  hitName: {
    position: 'absolute', left: 0, right: 0, top: 3,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8,
    color: SOFT, textAlign: 'center', includeFontPadding: false,
  },
  /** The posts stand at 150, so their name is set LEFT of them rather than over. */
  hitNameL: { textAlign: 'left', left: 4 },
  hitBox: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderRadius: 4 },
  /** WHAT "TAP ONE OF THESE" LOOKS LIKE WHILE THE QUESTION IS OPEN.
   *
   * These hit boxes took a border only once the answer was IN, so up to that moment
   * the reader was choosing between regions with no edges — the complaint exactly:
   * "blank boxes that you cannot read so it is a guess for which one to press". The
   * outline says where the choices are; the picture under each one says what it is.
   */
  hitLive: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
  hitWrong: { borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed' },

  // "BINDS THE SPEAKER TO THE OTHER PERSON" — labels under the two posts.
  whoTag: {
    position: 'absolute', top: 398, width: 58, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },
  // "NOTHING ELSE CHANGES" — a circle-slash held low between the posts.
  nothingMark: { position: 'absolute', left: 240, top: 340, width: 22, height: 22 },
  nothingRing: {
    position: 'absolute', left: 0, top: 0, width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: INK,
  },
  nothingSlash: {
    position: 'absolute', left: 2, top: 10, width: 18, height: 2, backgroundColor: INK, transform: [{ rotate: '45deg' }],
  },
  // "ONLY A HUMAN CONVENTION COULD EXPLAIN THE CHANGE" — named above the cord.
  namedTag: {
    position: 'absolute', left: 198, top: 268, width: 108, height: 16,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  namedText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  // "HAS CANCELLED A PLAN" / "TOLD A FRIEND" — a dashed ring finds one plan.
  planRing: {
    position: 'absolute', top: 336, width: 46, height: 58,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 6,
  },
});

export function Ethics37Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics37Scene} band={[234, 512]} camera={CAM} />;
}
