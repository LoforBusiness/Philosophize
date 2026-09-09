import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics28Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A DARK FIELD, FOUR THINGS STANDING IN IT, AND A LAMP IN EVERY ONE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the FIELD is a filled STONE slab 280×154 at x 112 (112…392), y 242…396. It
//   is the ground the light is read against, and it is why a lamp can be drawn
//   in PAPER at all: on bare page a pale shape is nothing.
// · FOUR BODIES stand on the rail, bottoms on y 372, growing left to right —
//   16×16 at x 136, 28×26 at x 192, 44×40 at x 252, 62×56 at x 318. Each is a
//   STONE box with a 1.5 ink edge and a PAPER core inset 5, and the core is the
//   only thing in the picture that changes.
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
const BODY_X = [136, 192, 252, 318];
const BODY_W = [16, 28, 44, 62];
const BODY_H = [16, 26, 40, 56];
const CORE = 5;
const NAME = ['PARTICLE', 'INSECT', 'MOUSE', 'BRAIN'];
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
        {BODY_X.map((bx, k) => (
          <View
            key={bx}
            style={[styles.body, { left: bx, top: BASE_Y - BODY_H[k], width: BODY_W[k], height: BODY_H[k] }]}
          />
        ))}
        {BODY_X.map((bx, k) => (
          <Text key={bx} style={[styles.name, { left: bx + BODY_W[k] / 2 - NAME_W / 2 }]}>{NAME[k]}</Text>
        ))}
      </Animated.View>

      {BODY_X.map((bx, k) => (
        <Animated.View
          key={bx}
          style={[
            styles.core,
            { left: bx + CORE, top: BASE_Y - BODY_H[k] + CORE, width: BODY_W[k] - CORE * 2, height: BODY_H[k] - CORE * 2 },
            coreStyle,
          ]}
          pointerEvents="none"
        />
      ))}

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

  rail: { position: 'absolute', left: RAIL_X, top: BASE_Y, width: RAIL_W, height: 3, backgroundColor: INK },
  body: { position: 'absolute', borderWidth: 1.5, borderColor: INK, backgroundColor: STONE },
  // A LAMP IS PAPER ON A TONED GROUND. It rides the raw driver, so it is either
  // alight or out rather than a smear (D35).
  core: { position: 'absolute', backgroundColor: PAPER },
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
