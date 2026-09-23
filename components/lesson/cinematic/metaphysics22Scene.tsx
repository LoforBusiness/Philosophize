import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics22Script';
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
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// A SET OF POINTS, AND THREE RUNS THAT ALL TAKE THE SAME BRANCH.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the RUN-UP is a 3-thick rail at y 299, x 34…181, with EVERYTHING BEFORE set
//   under it at y 310. It is the widest single object on the stage at 147 units,
//   which is deliberate: the answer to the first question is the biggest thing
//   in the picture and readers still tap the junction.
// · the JUNCTION is 18×18 at x 181…199, y 291…309, filled — the only solid black
//   mass above the ground line, so the eye goes to it first.
// · TWO BRANCHES leave it as right angles rather than diagonals: a 3-wide riser
//   at x 188…191 from y 261 down to the rail and from the rail down to y 340,
//   then 3-thick rails at y 261 and y 337 running out to x 286.
// · the END PLATES are 86×34 at x 286…372, tops 244 and 322.
// · THREE REPLAY TOKENS, 11-discs, sit on the upper rail at x 208 · 234 · 260,
//   y 250…261. Three, because two reads as a coincidence and four needs room.
// · the untaken branch does not vanish, it goes to 0.22 — an option drawn faintly
//   is a picture of an option that was never live; an option that is deleted is a
//   picture of one that never existed, which is a different claim (A1).
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest furniture is the lower plate at y 356, so 41 units stay clear.
//
// Ink runs y 244 (the upper plate) … y 500. BAND 238…512 = 274, with the
// 103-unit figure at 37.6%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const RAIL_Y = 299;
const RAIL_L = 34;
const J_X = 181;
const J_W = 18;
const J_Y = 291;

const UP_Y = 261;
const DN_Y = 337;
const BR_R = 286;

/** The junction's box, widened to hold its own name (AN1) — 176…276, four units
 *  clear of the lower branch plate's halo at 283. */
const JUNC_W = 100;
const PL_X = 286;
const PL_W = 86;
const PL_H = 34;
const PL_UP = 244;
const PL_DN = 322;

const TOK_X = [208, 234, 260];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const TRACK = BEATS.map((b) => b.track ?? 0);
const RUNS = BEATS.map((b) => b.runs ?? 0);
const OPEN = BEATS.map((b) => b.open ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);
const TRAVEL = BEATS.map((b) => b.travel ?? 0);
const SPLIT = BEATS.map((b) => b.split ?? 0);
// Where the tokens converge — just short of the plate's own left edge, so
// they read as arriving rather than sitting inside its text (D31).
const TOK_TARGET = [280, 285, 290];
const SPLIT_DY = DN_Y - UP_Y;   // the third token drops to the lower rail's height

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics22'));

export default function Metaphysics22Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
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

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      track: carry(cv, 1, n, TRACK[p], TRACK[n], tr),
      runs: carry(cv, 2, n, RUNS[p], RUNS[n], tr),
      // R7b — the arm fades the untaken branch. Each setting is a different account of
      // what could have happened, and the road nobody went down grows fainter or
      // firmer as the reader travels between them.
      open: carry(cv, 3, n, OPEN[p], reacting ? pickPos.value : OPEN[n], tr),
      t,
      travel: carry(cv, 4, n, TRAVEL[p], TRAVEL[n], tr),
      split: carry(cv, 5, n, SPLIT[p], SPLIT[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const trackStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.track }));
  const runStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.runs }));
  // An option that was never live is drawn faint, never deleted (A1).
  const dimStyle = useAnimatedStyle(() => ({
    // The floor was 0.22, which put STAYED QUIET at 1.6:1 — visible as a box and
    // not as a word (D35). 0.55 still reads as the branch not taken.
    opacity: SCENE.value.track * (1 - 0.45 * SCENE.value.open),
  }));

  // EVERYTHING BEFORE IS THE ANSWER — the run-up and its name (E39).
  const beforeRise = useAnswerRise(picked, 'before', true);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, trackStyle]} pointerEvents="none">
        <Animated.View style={beforeRise} pointerEvents="none">
          <View style={styles.runup} />
          <Text style={styles.before}>EVERYTHING BEFORE</Text>
        </Animated.View>

        <View style={[styles.riser, { top: UP_Y, height: RAIL_Y - UP_Y }]} />
        <View style={[styles.branch, { top: UP_Y }]} />
        <View style={[styles.plate, { top: PL_UP }]} />
        <Text style={[styles.plateText, { top: PL_UP + 12 }]}>SAID IT</Text>

        <View style={styles.junction} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, dimStyle]} pointerEvents="none">
        <View style={[styles.riser, { top: RAIL_Y, height: DN_Y - RAIL_Y + 3 }]} />
        <View style={[styles.branch, { top: DN_Y }]} />
        <View style={[styles.plate, { top: PL_DN }]} />
        <Text style={[styles.plateText, { top: PL_DN + 12 }]}>STAYED QUIET</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, runStyle]} pointerEvents="none">
        {TOK_X.map((tx, k) => <Token key={tx} tx={tx} k={k} SCENE={SCENE} />)}
      </Animated.View>

      <Target
        id="before" correct picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: RAIL_L, top: 286, width: 134, height: 40 }]}
      >
        {/* AN4 — two live targets may not touch. This box ended at 174 and the
            junction's began at 176, so with `Target`'s halo three units outside each
            of them the two outlines ran into one another. Six units narrower; the
            plate's own words end at 143 and are untouched. */}
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: 134, height: 40 }, answered && styles.right]} pointerEvents="none" />
      </Target>
      <Target
        id="junction" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: 176, top: 286, width: JUNC_W, height: 28 }]}
      >
        {/* AN1 — THE JUNCTION IS NAMED. Its two rivals are captioned plates and this
            was a bare 28-unit diamond, so one of the three choices had nothing to
            choose it by. The name goes to the RIGHT of it, on paper every beat leaves
            clear: above is the rail's own stem and below is the lower branch, and a
            word with a three-unit rule through it is worse than no word (D31). Two
            lines because the slot is 68 wide and the phrase sets at 79. */}
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: JUNC_W, height: 28 }, answered && picked === 'junction' && styles.wrong]} pointerEvents="none" />
        <Text style={styles.juncName} pointerEvents="none">{`THE${'\n'}JUNCTION`}</Text>
      </Target>
      <Target
        id="other" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: PL_X, top: PL_DN, width: PL_W, height: PL_H }]}
      >
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: PL_W, height: PL_H }, answered && picked === 'other' && styles.wrong]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One replay token. All three slide toward the taken branch's plate as
 * `travel` rises; the third one instead peels down toward the OTHER branch
 * as `split` rises — the same replay landing somewhere else (A1).
 */
function Token({ tx, k, SCENE }: { tx: number; k: number; SCENE: { value: { travel: number; split: number } } }) {
  const st = useAnimatedStyle(() => {
    const toward = TOK_TARGET[k] - tx;
    if (k === 2) {
      const dx = toward * (1 - SCENE.value.split) + (TOK_TARGET[0] - tx) * SCENE.value.split;
      return { transform: [{ translateX: SCENE.value.travel * dx }, { translateY: SCENE.value.split * SPLIT_DY }] };
    }
    return { transform: [{ translateX: SCENE.value.travel * toward }, { translateY: 0 }] };
  });
  return <Animated.View style={[styles.token, { left: tx }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  runup: { position: 'absolute', left: RAIL_L, top: RAIL_Y, width: J_X - RAIL_L, height: 3, backgroundColor: INK },
  before: {
    position: 'absolute', left: RAIL_L, top: 310, width: 150,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },

  junction: {
    position: 'absolute', left: J_X, top: J_Y, width: J_W, height: J_W,
    backgroundColor: INK, borderRadius: 3,
  },
  riser: { position: 'absolute', left: 188, width: 3, backgroundColor: INK },
  branch: { position: 'absolute', left: 188, width: BR_R - 188, height: 3, backgroundColor: INK },

  plate: {
    position: 'absolute', left: PL_X, width: PL_W, height: PL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },
  plateText: {
    position: 'absolute', left: PL_X, width: PL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  token: {
    position: 'absolute', top: 250, width: 11, height: 11, borderRadius: 6,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },

  hit: { position: 'absolute' },
  juncName: {
    position: 'absolute', left: 32, width: 68, top: 3, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 11, letterSpacing: 1,
    color: SOFT, includeFontPadding: false,
  },
  hitBox: { borderRadius: 4 },
  /** WHAT "TAP ONE OF THESE" LOOKS LIKE WHILE THE QUESTION IS OPEN.
   *
   * These hit boxes took a border only once the answer was IN, so up to that moment
   * the reader was choosing between regions with no edges — the complaint exactly:
   * "blank boxes that you cannot read so it is a guess for which one to press". The
   * outline says where the choices are; the picture under each one says what it is.
   */
  hitLive: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Metaphysics22Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics22Scene} band={[238, 512]} camera={CAM} />;
}
