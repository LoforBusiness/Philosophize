import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics22Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// TWO INSTRUMENTS ON ONE VIEWER, AND ONLY ONE OF THEM MOVES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the SCREEN is 208×94 at x 28…236, y 246…340, 2.5 thick — the largest object
//   on the stage, because the whole question is why something that size can do
//   anything to you at all.
// · THREE SLIME LOBES rise from the screen floor at x 44 · 110 · 176, each 58
//   wide, to heights 34 · 52 · 40 at full advance. Three, and uneven, so it
//   reads as something creeping rather than a bar chart in a box.
// · TWO METER ROWS at x 252…380: tracks 128×30 with tops 256 and 312, each with
//   an 8pt label 12 above it at y 244 and y 300. Two, not three — a third flat
//   reading would make the first question ambiguous, and the picture only has
//   one thing to say.
// · the HEART fill runs the full 124 inner units. the BELIEF fill is drawn and
//   never given a value: an instrument reading zero is a measurement, and an
//   absent instrument is not (A1).
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the belief track at y 342, so 55 units stay clear.
//
// Ink runs y 244 (the first label) … y 500. BAND 238…512 = 274, with the
// 103-unit figure at 37.6%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const SC_X = 28;
const SC_Y = 246;
const SC_W = 208;
const SC_H = 94;

const LOBE_X = [44, 110, 176];
const LOBE_W = 58;
const LOBE_H = [34, 52, 40];
const FLOOR = SC_Y + SC_H - 4;

const M_X = 252;
const M_W = 128;
const M_H = 30;
const HEART_Y = 256;
/** How far the heart target reaches up to take in its own HEART RATE label (AN3). */
const LAB_RISE = 14;
/** The row under the screen that carries its name, on paper every beat leaves clear. */
const CAP_H = 22;
const BELIEF_Y = 312;

// The gap between the heart track (bottom 286) and the belief label (top 300).
const GAP_Y = 289;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SCREEN = BEATS.map((b) => b.screen ?? 0);
const SLIME = BEATS.map((b) => b.slime ?? 0);
const METERS = BEATS.map((b) => b.meters ?? 0);
const HEART = BEATS.map((b) => b.heart ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);
// GROUP AH — three still taps, each moving a new mass rather than a caption.
const EMPTY_RING = BEATS.map((b) => ((b.emptyRing ?? 0) > 0 ? 1 : 0));
const CONTRAST = BEATS.map((b) => ((b.contrast ?? 0) > 0 ? 1 : 0));
const THOUGHT_TAG = BEATS.map((b) => ((b.thoughtTag ?? 0) > 0 ? 1 : 0));

// On its own split beat the seam drives the instrument (R7). Giving the left
// side more empties the heart meter, so a reader who says it was all a game is
// watching themselves erase the reading the lesson opened with — which is the
// price of that answer, and a sentence could only assert it.
const PULL = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics22'));

export default function Aesthetics22Scene({
  clock, bt, bi, i, picked, onPick, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(8);
  const pulling = PULL[i] === 1;
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const emptyRingFade = (cur.emptyRing ?? 0) !== (prev?.emptyRing ?? 0);
  const contrastFade = (cur.contrast ?? 0) !== (prev?.contrast ?? 0);
  const thoughtTagFade = (cur.thoughtTag ?? 0) !== (prev?.thoughtTag ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      screen: carry(cv, 1, n, SCREEN[p], SCREEN[n], tr),
      slime: carry(cv, 2, n, SLIME[p], SLIME[n], tr),
      meters: carry(cv, 3, n, METERS[p], METERS[n], tr),
      // A heart under a thing that is still coming — a slow live sway, so the
      // reading is a reading and not a filled bar somebody printed.
      // Through `carry` so the seam takes over across the transition rather than
      // on one frame — see metaphysics21Scene for why that matters.
      heart: carry(cv, 4, n, HEART[p], pulling ? 1 - pickPos.value : HEART[n], tr)
        * (0.86 + 0.07 * Math.sin(t * 3.1)),
      // A ring on the belief track — drawing attention to the zero, never filling it.
      emptyRing: carry(cv, 5, n, EMPTY_RING[p], EMPTY_RING[n], emptyRingFade ? grow : 1),
      // What sits between the two readings when they disagree.
      contrast: carry(cv, 6, n, CONTRAST[p], CONTRAST[n], contrastFade ? grow : 1),
      // The thought theory's own claim, attached to the reading it explains.
      thoughtTag: carry(cv, 7, n, THOUGHT_TAG[p], THOUGHT_TAG[n], thoughtTagFade ? grow : 1),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const scStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.screen }));
  const slimeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.slime }));
  const mStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.meters }));
  const heartStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.meters, width: (M_W - 8) * SCENE.value.heart,
  }));
  const emptyRingStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.emptyRing }));
  const contrastStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.contrast }));
  const thoughtTagStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.thoughtTag }));

  const lobes = [0, 1, 2];

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, scStyle]} pointerEvents="none">
        <View style={styles.screen} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, slimeStyle]} pointerEvents="none">
        {lobes.map((k) => <Lobe key={k} S={SCENE} k={k} />)}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, mStyle]} pointerEvents="none">
        <Text style={[styles.mLabel, { top: HEART_Y - 12 }]}>HEART RATE</Text>
        <View style={[styles.track, { top: HEART_Y }]} />
      </Animated.View>
      <Animated.View style={[styles.fill, { top: HEART_Y + 4 }, heartStyle]} pointerEvents="none" />

      {/* a ring on the belief track — the zero, pointed at rather than filled */}
      <Animated.View style={[styles.emptyRing, emptyRingStyle]} pointerEvents="none" />
      {/* what sits between the two readings when they disagree */}
      <Animated.Text style={[styles.contrast, contrastStyle]} pointerEvents="none">≠</Animated.Text>
      {/* the thought theory's own claim, attached to the reading it explains */}
      <Animated.View style={[styles.thoughtTag, thoughtTagStyle]} pointerEvents="none">
        <Text style={styles.thoughtText} numberOfLines={1}>IMAGINING</Text>
      </Animated.View>

      <Target
        id="screen" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: SC_X, top: SC_Y, width: SC_W, height: SC_H + CAP_H }]}
      >
        {/* AN1 — THE ONLY CHOICE WITH NOTHING TO CALL IT. The other two are meters
            and wear their readings; this one was the screen and a dashed outline,
            so a reader picking it was picking a rectangle. The name sits UNDER the
            picture, on the paper the beats leave clear there, because the slime
            comes down the screen and a word on it would be covered (D31). */}
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: SC_W, height: SC_H + CAP_H }, answered && picked === 'screen' && styles.wrong]} pointerEvents="none" />
        <Text style={styles.hitName} pointerEvents="none">SEEING IT HAPPEN</Text>
      </Target>
      <Target
        id="heart" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: M_X, top: HEART_Y - LAB_RISE, width: M_W, height: M_H + LAB_RISE }]}
      >
        {/* AN3 — the name it already has is just outside the box. HEART RATE is set
            twelve units above the track, so the target reaches up to hold it rather
            than a second copy being written inside. */}
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: M_W, height: M_H + LAB_RISE }, answered && picked === 'heart' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="belief" correct picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: M_X, top: BELIEF_Y, width: M_W, height: M_H }]}
      >
        {/* THE BELIEF METER IS THE ANSWER, so the whole meter lifts (E39) — its
            label, its track and the reading of nothing that is the point of it.
            These were siblings and the Target held an empty box, so answering
            slid an outline up off the words. */}
        <Animated.View style={[StyleSheet.absoluteFill, mStyle]} pointerEvents="none">
          <Text style={styles.mLabelIn}>BELIEF IT IS REAL</Text>
          <View style={styles.trackIn} />
          {/* Drawn at zero rather than left out: a reading of nothing is still a
              reading, and an absent instrument would be a different claim (A1). */}
          <View style={[styles.fillIn, { width: 3 }]} />
        </Animated.View>
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: M_W, height: M_H }, answered && styles.right]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One lobe of the thing coming down the screen. Uneven on purpose. */
function Lobe({ S, k }: { S: { value: { slime: number } }; k: number }) {
  const st = useAnimatedStyle(() => {
    const h = LOBE_H[k] * S.value.slime;
    return { height: h, top: FLOOR - h };
  });
  return <Animated.View pointerEvents="none" style={[styles.lobe, { left: LOBE_X[k] }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  screen: {
    position: 'absolute', left: SC_X, top: SC_Y, width: SC_W, height: SC_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 8, backgroundColor: STONE, boxShadow: LIP,
  },
  lobe: {
    position: 'absolute', width: LOBE_W, backgroundColor: SOFT,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
  },

  // A RING, NOT A FILL — it names the reading without claiming one.
  emptyRing: {
    position: 'absolute', left: M_X - 3, top: BELIEF_Y - 3, width: M_W + 6, height: M_H + 6,
    borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed', borderRadius: 10,
  },
  contrast: {
    position: 'absolute', left: M_X, top: GAP_Y, width: M_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11, color: INK, includeFontPadding: false,
  },
  thoughtTag: {
    position: 'absolute', left: M_X, top: GAP_Y, width: M_W, height: 14,
    borderWidth: 1.5, borderColor: INK, borderRadius: 3, backgroundColor: PLATE_FACE, boxShadow: LIP,
    alignItems: 'center', justifyContent: 'center',
  },
  thoughtText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  // The screen's own name, set to match the meters' labels (AN1).
  hitName: {
    position: 'absolute', left: 0, right: 0, top: SC_H + 6, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },
  mLabel: {
    position: 'absolute', left: M_X, width: M_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },
  track: {
    position: 'absolute', left: M_X, width: M_W, height: M_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  fill: {
    position: 'absolute', left: M_X + 4, height: M_H - 8, backgroundColor: INK, borderRadius: 2,
  },

  // POSITIONED INSIDE THE BELIEF TARGET, whose box is exactly the track: the
  // label rides 12 above it, the reading 4 in from its left edge.
  mLabelIn: {
    position: 'absolute', left: 0, top: -12, width: M_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: SOFT, includeFontPadding: false,
  },
  trackIn: {
    position: 'absolute', left: 0, top: 0, width: M_W, height: M_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  fillIn: {
    position: 'absolute', left: 4, top: 4, height: M_H - 8, backgroundColor: INK, borderRadius: 2,
  },

  hit: { position: 'absolute' },
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

export function Aesthetics22Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics22Scene} band={[238, 512]} camera={CAM} />;
}
