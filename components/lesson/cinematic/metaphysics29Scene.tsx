import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics29Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// TWO PEAKS ON A STRIP OF LAND, AND ONE EYE ABOVE THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the EYE is a 46×24 lens with a 12 pupil, centred on x 200 at y 244…268, and a
//   LID drops across it from the top. It sits clear of the peaks on purpose: a
//   mind drawn OVER the world would be arguing the idealist's case before the
//   reader had answered anything (A1).
// · TWO PEAKS, drawn as filled STONE triangles standing on the land — a 120-wide
//   90-tall one at x 140 (140…260) and an 84-wide 62-tall one at x 248 (248…332).
//   Their base is y 372, which is the land's top edge.
// · the LAND is a RULE band 250×10 at x 112 (112…362), y 372…382, and it never
//   goes anywhere. Somewhere for a world to be is not the same as a world.
// · the HAZE is a STONE block 200×92 over the peaks at x 138, y 280…372, at its
//   own value — the Kantian answer, where something remains and the ordered world
//   of mountains and moments does not.
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, seven units clear of the land at 112.
//
// Ink runs y 244 (the eye) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const EYE_MID = 200;
const EYE_Y = 244;
const EYE_W = 46;
const EYE_H = 24;

const LAND_X = 112;
const LAND_Y = 372;
const LAND_W = 250;
const LAND_H = 10;

const PEAK_A_X = 140;
const PEAK_A_HALF = 60;
const PEAK_A_H = 90;
const PEAK_B_X = 248;
const PEAK_B_HALF = 42;
const PEAK_B_H = 62;

const HAZE_X = 138;
const HAZE_Y = 280;
const HAZE_W = 200;
const HAZE_H = 92;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['IT PROVES MATTER', 'A KICK IS A PERCEPTION', 'BERKELEY DENIED THE ROCK'];
const PLATE_ID = ['matter', 'kick', 'denied'];
/** The stone-kicking trap: a vivid sensation cannot disprove a view built of them. */
const KICK = 1;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const LAND = BEATS.map((b) => (b.land ? 1 : 0));
const ROCK = BEATS.map((b) => b.rock ?? 0);
const HAZE = BEATS.map((b) => b.haze ?? 0);
const LID = BEATS.map((b) => b.lid ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
const MIND_WALL = BEATS.map((b) => (b.mindWall ? 1 : 0));
const MIND_LINK = BEATS.map((b) => (b.mindLink ? 1 : 0));
const EYE_RING = BEATS.map((b) => (b.eyeRing ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN ORDER, never the shuffled rows (X3): 0 the realist · 1 Berkeley ·
// 2 the Kantian. Each row is read off that bin's own words, so choosing a view
// draws the landscape that view leaves behind.
const ROCK_AT = [1, 0, 0.3];
const HAZE_AT = [0, 0, 1];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics29'));

export default function Metaphysics29Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(9);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  const mindWallFade = (cur.mindWall ?? 0) !== (prev?.mindWall ?? 0);
  const mindLinkFade = (cur.mindLink ?? 0) !== (prev?.mindLink ?? 0);
  const eyeRingFade = (cur.eyeRing ?? 0) !== (prev?.eyeRing ?? 0);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr).
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const u = pickPos.value;
    const grow = ease01(bt.value / 0.55);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      land: carry(cv, 1, n, LAND[p], LAND[n], tr),
      rock: carry(cv, 2, n, ROCK[p], reacting ? pickAt(ROCK_AT, u) : ROCK[n], tr),
      haze: carry(cv, 3, n, HAZE[p], reacting ? pickAt(HAZE_AT, u) : HAZE[n], tr),
      lid: carry(cv, 4, n, LID[p], LID[n], tr),
      plates: carry(cv, 5, n, PLATES[p], PLATES[n], tr),
      // A dashed wall between the eye and the peaks — realism's claim that the
      // mountains stand independent of any mind.
      mindWall: carry(cv, 6, n, MIND_WALL[p], MIND_WALL[n], mindWallFade ? grow : 1),
      // A short dashed link from the eye down to the peak — anti-realism's claim
      // that what is real depends on the mind that meets it.
      mindLink: carry(cv, 7, n, MIND_LINK[p], MIND_LINK[n], mindLinkFade ? grow : 1),
      // A ring on the eye itself — Berkeley's point that even imagining the tree
      // is a mind perceiving it.
      eyeRing: carry(cv, 8, n, EYE_RING[p], EYE_RING[n], eyeRingFade ? grow : 1),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const landStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.land }));
  const rockStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.rock) }));
  const hazeStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.haze) }));
  const lidStyle = useAnimatedStyle(() => ({ height: EYE_H * clamp01(SCENE.value.lid) }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));
  const mindWallStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.mindWall }));
  const mindLinkStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.mindLink }));
  const eyeRingStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.eyeRing }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE WORLD WITH NOBODY IN IT</Text>

      <View style={styles.lens} pointerEvents="none" />
      <View style={styles.pupil} pointerEvents="none" />
      <Animated.View style={[styles.lid, lidStyle]} pointerEvents="none" />

      {/* group AH — a ring on the eye: Berkeley's point that imagining still perceives. */}
      <Animated.View style={[styles.eyeRing, eyeRingStyle]} pointerEvents="none" />

      {/* group AH — a dashed wall between the eye and the peaks: realism's claim. */}
      <Animated.View style={[styles.mindWall, mindWallStyle]} pointerEvents="none" />

      {/* group AH — a short dashed link from the eye to a peak: anti-realism's claim. */}
      <Animated.View style={[styles.mindLink, mindLinkStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, rockStyle]} pointerEvents="none">
        <View style={styles.peakA} />
        <View style={styles.peakB} />
      </Animated.View>

      <Animated.View style={[styles.haze, hazeStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, landStyle]} pointerEvents="none">
        <View style={styles.land} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === KICK}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === KICK}
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
  // ── the three tap events (group AH) ────────────────────────────────────────
  // A ring 4 units proud of the eye: even a thought about the tree perceives it.
  eyeRing: {
    position: 'absolute', left: EYE_MID - EYE_W / 2 - 4, top: EYE_Y - 4, width: EYE_W + 8, height: EYE_H + 8,
    borderWidth: 2, borderColor: INK, borderRadius: 16,
  },
  // A dashed horizontal wall across both peaks, below the eye: they stand apart
  // from it, on the realist's view.
  mindWall: {
    position: 'absolute', left: PEAK_A_X, top: 276, width: (PEAK_B_X + PEAK_B_HALF * 2) - PEAK_A_X, height: 0,
    borderTopWidth: 1.5, borderColor: INK, borderStyle: 'dashed',
  },
  // A short dashed link straight down from the eye to the peak it meets — the
  // idealist's claim that the two are joined.
  mindLink: {
    position: 'absolute', left: EYE_MID, top: EYE_Y + EYE_H, width: 0, height: (LAND_Y - PEAK_A_H) - (EYE_Y + EYE_H),
    borderLeftWidth: 1.5, borderColor: INK, borderStyle: 'dashed',
  },
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: LAND_X, top: 396, width: LAND_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  lens: {
    position: 'absolute', left: EYE_MID - EYE_W / 2, top: EYE_Y, width: EYE_W, height: EYE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 12, backgroundColor: PAPER,
  },
  pupil: {
    position: 'absolute', left: EYE_MID - 6, top: EYE_Y + 6, width: 12, height: 12,
    borderRadius: 6, backgroundColor: INK,
  },
  // THE LID COMES DOWN FROM THE TOP, so a shut eye is a filled shape rather than
  // a missing one — an absence would read as a rendering fault.
  lid: {
    position: 'absolute', left: EYE_MID - EYE_W / 2, top: EYE_Y, width: EYE_W,
    backgroundColor: PLATE_FACE, boxShadow: LIP, borderWidth: 2, borderColor: INK, borderRadius: 12,
  },

  land: {
    position: 'absolute', left: LAND_X, top: LAND_Y, width: LAND_W, height: LAND_H,
    backgroundColor: RULE,
  },
  // A FILLED MASS RATHER THAN AN OUTLINE. A triangle built out of borders has a
  // zero-size box, so it carries no transform and needs none here.
  peakA: {
    position: 'absolute', left: PEAK_A_X, top: LAND_Y - PEAK_A_H, width: 0, height: 0,
    borderLeftWidth: PEAK_A_HALF, borderRightWidth: PEAK_A_HALF, borderBottomWidth: PEAK_A_H,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: STONE,
  },
  peakB: {
    position: 'absolute', left: PEAK_B_X, top: LAND_Y - PEAK_B_H, width: 0, height: 0,
    borderLeftWidth: PEAK_B_HALF, borderRightWidth: PEAK_B_HALF, borderBottomWidth: PEAK_B_H,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: STONE,
  },
  haze: { position: 'absolute', left: HAZE_X, top: HAZE_Y, width: HAZE_W, height: HAZE_H, backgroundColor: RULE },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 7, width: PLATE_W, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics29Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics29Scene} band={[240, 512]} camera={CAM} />;
}
