import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, dirsFrom, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics26Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';
import ObjectArt from './ObjectArt';
import { plinth } from './objects';
import { Shapes, Outlined, ell, bar, type Part } from './Silhouette';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('aesthetics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// ─────────────────────────────────────────────────────────────────────────────
// A LAWN FLAMINGO THAT NEVER MOVES, AND AN EYE BESIDE IT THAT DOES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the PLINTH is 160×26 at x 214 (214…374), y 400…426 — the filled STONE mass the
//   bird stands on.
// · the FLAMINGO is the 1957 lawn ornament, head erect, taken from its reference
//   rather than from memory: two straight METAL RODS with no joint and no feet
//   (x 262 and 274, y 347…403 — a real flamingo's ankle bends halfway up, the toy's
//   never does); a TEARDROP body, x 213…295, y 319…350, tapering back to a point;
//   an S-CURVED neck of three bars rising off its breast; a small head at y 267…281;
//   and a bill that turns sharply DOWN with a dark tip — the one mark that makes the
//   bird a flamingo rather than a heron. One outline round the whole bird, so the neck
//   grows out of the body instead of being laid across it.
// · NOTHING IN THAT LIST RESPONDS TO THE READER. The lesson's claim is that the
//   object barely changes and the attitude does, so a scene that made the bird
//   tackier as the reader slid toward camp would be saying the opposite of the
//   lesson while looking like an illustration of it.
// · the EYE is a 60×34 lens at x 140 (140…200), y 300…334, with a 16-unit pupil at
//   its centre and a LID that comes down inside it — clipped by the lens, so the
//   wink cannot spill onto the paper. It carries HOW YOU LOOK at x 130, y 342.
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462 — below the
//   plinth and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate and twenty-seven clear
//   of the eye at 140.
//
// Ink runs y 266 (the beak) … y 500 (ground), with the caption at 244.
// BAND 240…512 = 272 — a 103-unit figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PLINTH_X = 214;
const PLINTH_Y = 400;
const PLINTH_W = 160;
const PLINTH_H = 26;

/** The two rods the ornament is pushed into the lawn on. */
const FLAMINGO_RODS: Part[] = [bar(262, 349, 262, 403, 2.2, INK), bar(274, 347, 274, 403, 2.2, INK)];
/** The moulded bird: body, tail, the three bars of the neck, the head and the bill's base. */
const FLAMINGO: Part[] = [
  ell(268, 334, 50, 27, STONE, -4), bar(250, 334, 231, 331, 12, STONE), bar(231, 331, 219, 328, 6, STONE),
  bar(283, 327, 277, 309, 7, STONE), bar(277, 309, 283, 292, 6.5, STONE), bar(283, 292, 279, 278, 6, STONE),
  ell(282, 274, 13, 10.5, STONE, 12), bar(287, 273, 293, 277, 5, STONE),
];
/** The dark tip of the down-turned bill, the raised eye, and the moulded wing edge. */
const FLAMINGO_MARKS: Part[] = [
  bar(293, 277, 292.2, 285.5, 3.4, INK), ell(282.5, 272.5, 2.6, 2.6, INK),
  bar(249, 331, 263, 338, 1.6, INK), bar(263, 338, 280, 336, 1.6, INK),
];

const EYE_X = 140;
const EYE_Y = 300;
const EYE_W = 60;
const EYE_H = 34;
/** How far the lid comes down at a full wink — never the whole lens. */
const LID_MAX = 21;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['BAD TASTE', 'KNOWING LOVE', 'A MASTERPIECE'];
const PLATE_ID = ['bad', 'knowing', 'great'];
/** Camp. The other two are the sincere mistake and the way out of the joke. */
const KNOWING = 1;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BIRD = BEATS.map((b) => (b.bird ? 1 : 0));
const EYE = BEATS.map((b) => (b.eye ? 1 : 0));
const WINK = BEATS.map((b) => b.wink ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
// GROUP AH — three still taps, both away from the bird itself (A1's header rule):
// TEARS counts up 0…2 as Kundera's two tears are named; PAIR flanks the eye with
// a tear and a grin, the same object read two ways.
const TEARS = BEATS.map((b) => b.tears ?? 0);
const PAIR = BEATS.map((b) => (b.pair ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.drag ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics26'));

export default function Aesthetics26Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(7);
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
      birdOn: carry(cv, 1, n, BIRD[p], BIRD[n], tr),
      eyeOn: carry(cv, 2, n, EYE[p], EYE[n], tr),
      // R7c — the knob's own 0…1 IS how far the difference has been handed to the
      // beholder, and the only thing in the picture that answers to it is the eye.
      wink: carry(cv, 3, n, WINK[p], reacting ? dragPos.value : WINK[n], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
      tearsV: carry(cv, 5, n, TEARS[p], TEARS[n], tr),
      pairOn: carry(cv, 6, n, PAIR[p], PAIR[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const birdStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.birdOn }));
  const eyeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.eyeOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const lidStyle = useAnimatedStyle(() => ({ height: LID_MAX * SCENE.value.wink }));
  const tearAStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.tearsV) }));
  const tearBStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.tearsV - 1) }));
  const pairStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pairOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE SAME BIRD, TWICE</Text>

      <Animated.View style={[styles.tear, styles.tearA, tearAStyle]} pointerEvents="none" />
      <Animated.View style={[styles.tear, styles.tearB, tearBStyle]} pointerEvents="none" />
      <Animated.View style={[styles.tearMini, pairStyle]} pointerEvents="none" />
      <Animated.View style={[styles.grin, pairStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, birdStyle]} pointerEvents="none">
        <ObjectArt parts={plinth(PLINTH_X + PLINTH_W / 2, PLINTH_Y + PLINTH_H / 2, PLINTH_W, PLINTH_H)} tone={TONE} />
        <Shapes parts={FLAMINGO_RODS} />
        <Outlined parts={FLAMINGO} width={2} line={INK} />
        {/* THE DOWNTURNED BILL — the one mark that makes it a flamingo and not a
            heron, which is why it is drawn rather than implied. */}
        <Shapes parts={FLAMINGO_MARKS} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, eyeStyle]} pointerEvents="none">
        <View style={styles.lens}>
          <View style={styles.pupil} />
          <Animated.View style={[styles.lid, lidStyle]} />
        </View>
        <Text style={styles.eyeText}>HOW YOU LOOK</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === KNOWING}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: PLATE_X[k] }]}
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
  floor: floorStyle(TONE, GROUND),

  cap: {
    position: 'absolute', left: 140, top: CAP_T, width: 246,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },


  // THE ONE THING THE READER MOVES. Clipped, so a closing lid stays in its lens.
  lens: {
    position: 'absolute', left: EYE_X, top: EYE_Y, width: EYE_W, height: EYE_H, borderRadius: EYE_H / 2,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER, overflow: 'hidden',
  },
  pupil: {
    position: 'absolute', left: EYE_W / 2 - 10, top: EYE_H / 2 - 10, width: 16, height: 16, borderRadius: 8,
    backgroundColor: INK,
  },
  lid: { position: 'absolute', left: 0, top: 0, width: EYE_W, backgroundColor: STONE, boxShadow: LIP },
  eyeText: {
    position: 'absolute', left: 130, top: 342, width: 80, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  // A TEAR ARRIVING WHOLE (beats 1–2) — kitsch's ready-made emotion, never built
  // up in pieces. Never on the bird itself (A1's own header rule for this lesson).
  tear: {
    position: 'absolute', width: 16, height: 16, backgroundColor: INK,
    borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomRightRadius: 8,
    transform: [{ rotate: '-45deg' }],
  },
  tearA: { left: 165, top: 326 },
  tearB: { left: 180, top: 342 },
  // A TEAR AND A GRIN FLANKING THE EYE (beat 7) — the same bird, admired sincerely
  // by one neighbour and enjoyed as absurd by another.
  tearMini: {
    position: 'absolute', left: 148, top: 278, width: 10, height: 10, backgroundColor: INK,
    borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomRightRadius: 5,
    transform: [{ rotate: '-45deg' }],
  },
  grin: {
    position: 'absolute', left: 176, top: 280, width: 14, height: 7,
    borderBottomLeftRadius: 7, borderBottomRightRadius: 7, borderWidth: 1.6, borderTopWidth: 0, borderColor: INK,
  },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Aesthetics26Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics26Scene} band={[240, 512]} camera={CAM} />;
}
