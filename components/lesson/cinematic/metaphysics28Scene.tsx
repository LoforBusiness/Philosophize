import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics28Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, SHADE,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';
import { Shapes, ell, bar, tri, type Part } from './Silhouette';

// ─────────────────────────────────────────────────────────────────────────────
// A DARK FIELD, FOUR THINGS STANDING IN IT, AND A LAMP IN EVERY ONE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the FIELD is a filled STONE slab 280×154 at x 112 (112…392), y 242…396. It
//   is the ground the light is read against, and it is why a lamp can be drawn
//   in PAPER at all: on bare page a pale shape is nothing.
// · FOUR BODIES stand on the rail at y 372, growing left to right, each drawn as
//   the thing it names rather than a box with its name under it (Z1): a PARTICLE
//   of 13 at x 144; an ANT, x 187…226, in profile with its three pinched segments,
//   six legs off the middle one and elbowed antennae; a MOUSE, x 233…305, with its
//   big round ear, pointed snout and a tail as long as its body; and a BRAIN,
//   x 317…380, seen from the side on its stem. Each is solid INK with a PAPER lamp
//   in its middle, and the lamp is the only thing in the picture that changes.
// · the RAIL is 260×3 of ink at x 122, y 372, and the four names sit under it in
//   ink at y 378 — inside the field, so SOFT would not clear it (T6).
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 26 and walks to 82; his widest span at the walked mark
//   is x ≈ 57…107, five units clear of the field at 112.
//
// Ink runs y 242 (the field) … y 500 (ground). BAND 238…512 = 274 — a 103-unit
// figure at 37.6%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const FIELD_X = 112;
const FIELD_Y = 242;
const FIELD_W = 280;
const FIELD_H = 154;

const BASE_Y = 372;
const NAME = ['PARTICLE', 'INSECT', 'MOUSE', 'BRAIN'];
/** Where each name centres, under its body. */
const NAME_CX = [144, 206, 269, 349];

/** The four bodies, in stage coordinates. */
const BODIES: Part[] = [
  ell(144, 364, 13, 13, INK),
  // THE ANT: head, a long thorax, a pinched node and the largest mass, the gaster —
  // with all six legs off the thorax and antennae "bent like an elbow". Legs along
  // the whole body read as a spider; no pinched waist reads as a grub.
  bar(204, 361, 200, 366, 1.3, INK), bar(200, 366, 197, 372, 1.3, INK),
  bar(208, 361, 208.5, 366, 1.3, INK), bar(208.5, 366, 207, 372, 1.3, INK),
  bar(212, 361, 216, 366, 1.3, INK), bar(216, 366, 219.5, 372, 1.3, INK),
  bar(219, 353.5, 220.5, 346.5, 1.2, INK), bar(220.5, 346.5, 226, 349.5, 1.2, INK),
  ell(194, 358, 13, 10, INK, 12), ell(201.5, 360, 3.4, 3.6, INK), ell(208, 358.5, 11.5, 6.4, INK, -8),
  ell(218, 356.5, 7.4, 6.8, INK), tri(222.6, 358.4, 3.4, 2.4, 'right', INK, 20),
  // THE MOUSE: a body highest over the hips, a pointed snout, a LARGE round ear and
  // a thin tail as long as the body. Small ears and a thick tail read as a rat.
  bar(258, 366, 246, 361, 1.7, INK), bar(246, 361, 234, 366, 1.4, INK),
  bar(268, 367, 266, 372, 3.2, INK), bar(289, 367, 291, 372, 2.8, INK),
  ell(266, 359, 24, 22, INK), ell(275, 361, 34, 20, INK, -4),
  ell(287, 351, 11, 11, INK), ell(287, 351, 6, 6, SHADE),
  ell(292, 362, 16, 13, INK, 12), tri(301.5, 364.5, 7, 7, 'right', INK, 14),
  ell(295.5, 359.5, 2.2, 2.2, PAPER),
  // THE BRAIN, from the side: a bean of lobes over the cerebellum and a short stem
  // at the back. A stem under the middle made it a tree.
  bar(361, 363, 363, 372, 5, INK),
  ell(349, 344, 58, 38, INK), ell(329, 347, 24, 30, INK), ell(369, 343, 22, 30, INK),
  ell(346, 356, 36, 15, INK), ell(368, 361, 17, 10, INK),
  bar(328, 356, 342, 351, 1.8, SHADE), bar(342, 351, 360, 350, 1.8, SHADE), bar(351, 327, 346, 347, 1.7, SHADE),
  bar(327, 338, 337, 333, 1.5, SHADE), bar(358, 333, 370, 337, 1.5, SHADE), bar(335, 344, 343, 341, 1.5, SHADE),
  bar(356, 342, 372, 347, 1.5, SHADE), bar(362, 360, 374, 362, 1.3, SHADE),
];
/** A lamp in each: the particle's centre, the ant's gaster, the mouse's body, the brain. */
const LAMPS: Part[] = [
  ell(144, 364, 5, 5, PAPER), ell(194, 358, 6, 4.4, PAPER, 12), ell(272, 360, 13, 8.5, PAPER), ell(349, 342, 18, 11, PAPER),
];
const NAME_W = 56;
const NAME_T = 378;

const RAIL_X = 122;
const RAIL_W = 260;

const CAP_T = 252;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['WHY MATTER EXISTS', 'HOW MANY MINDS MAKE ONE', 'WHETHER ROCKS THINK'];
const PLATE_ID = ['exists', 'many', 'rocks'];
/** The standing objection: a crowd of flickers is not yet one point of view. */
const MANY = 1;

const FIG_X = 26;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const FIELD = BEATS.map((b) => (b.field ? 1 : 0));
const RAIL = BEATS.map((b) => (b.rail ? 1 : 0));
const GLOW = BEATS.map((b) => b.glow ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.plot ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics28'));

export default function Metaphysics28Scene({ clock, bt, bi, i, picked, onPick, dragPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      field: carry(cv, 1, n, FIELD[p], FIELD[n], tr),
      rail: carry(cv, 2, n, RAIL[p], RAIL[n], tr),
      // THE DRAWN CURVE'S MEAN HEIGHT is what a plot reports, and how much light
      // there is in nature altogether is exactly what it means here.
      glow: carry(cv, 3, n, GLOW[p], reacting ? dragPos.value : GLOW[n], tr),
      plates: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const fieldStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.field }));
  const railStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rail }));
  // EVERY LAMP ON THE RAIL ANSWERS AT ONCE, because the value is one reading of
  // how much experience there is rather than four separate ones.
  const coreStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.glow) }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, fieldStyle]} pointerEvents="none">
        <View style={styles.field} />
        <Text style={styles.cap}>EXPERIENCE ALONG THE LADDER</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, railStyle]} pointerEvents="none">
        <View style={styles.rail} />
        <Shapes parts={BODIES} />
        {NAME.map((name, k) => (
          <Text key={name} style={[styles.name, { left: NAME_CX[k] - NAME_W / 2 }]}>{name}</Text>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, coreStyle]} pointerEvents="none">
        <Shapes parts={LAMPS} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === MANY}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === MANY}
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

  field: {
    position: 'absolute', left: FIELD_X, top: FIELD_Y, width: FIELD_W, height: FIELD_H,
    backgroundColor: STONE, borderWidth: 1.5, borderColor: RULE,
  },
  cap: {
    position: 'absolute', left: FIELD_X, top: CAP_T, width: FIELD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: INK, includeFontPadding: false,
  },

  // A LAMP IS PAPER ON AN INK BODY. It rides the raw driver, so it is either
  // alight or out rather than a smear (D35).
  rail: { position: 'absolute', left: RAIL_X, top: BASE_Y, width: RAIL_W, height: 3, backgroundColor: INK },
  name: {
    position: 'absolute', top: NAME_T, width: NAME_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
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

export function Metaphysics28Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics28Scene} band={[238, 512]} camera={CAM} />;
}
