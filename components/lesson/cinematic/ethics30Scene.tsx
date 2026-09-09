import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics30Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE CHOICE ON A TABLE, AND THREE LENSES HANGING OVER IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the CHOICE is a filled STONE card 200×46 at x 118 (118…318), y 360…406, with
//   its case in ink across the middle. It never changes: whatever the reader
//   decides about the theories, the case in front of them is the same case.
// · THREE LENSES of 54×30 hang above it on 3-wide stems, centred on x 155 · 223 ·
//   291. Each lens and its stem live in one 54×98 wrapper pivoted at the CARD end
//   (`transformOrigin` in px), so a lens and its own stem can never disagree.
// · the CLASH swings the outer two by ±16°, which is the disagreement drawn: three
//   instruments aimed at one object and no longer pointing at the same place.
// · THREE NAMES of 64 sit ABOVE the wrappers at y 244, so nothing that carries a
//   word ever rotates (D35).
// · THREE PLATES of 90×34 at x 124 · 216 · 308 (124…398), top y 452, two lines.
// · the figure stands at x 24 and walks to 80; his widest span at the walked mark
//   is x ≈ 55…105, thirteen units clear of the card at 118.
//
// Ink runs y 244 (the names) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CARD_X = 118;
const CARD_Y = 360;
const CARD_W = 200;
const CARD_H = 46;

const LENS_MID = [155, 223, 291];
const LENS_W = 54;
const LENS_H = 30;
const ARM_TOP = 262;
const ARM_H = CARD_Y - ARM_TOP;
const LENS_CAP = ['OUTCOMES', 'DUTIES', 'CHARACTER'];
const CAP_W = 64;
const CAP_T = 244;
/** How far a lens on the outside swings when the three come apart. */
const SPREAD = 16;

const PLATE_X = [124, 216, 308];
const PLATE_Y = 452;
const PLATE_W = 90;
const PLATE_H = 34;
const PLATE_CAP = ['PICK ONE AND COMMIT', 'ASK ALL THREE', 'USE WHICHEVER SUITS'];
const PLATE_ID = ['pick', 'all', 'suits'];
/** Each lens shows something the others miss, so all three get asked. */
const ALL = 1;

const FIG_X = 24;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const CARD = BEATS.map((b) => (b.card ? 1 : 0));
const LENSES = BEATS.map((b) => b.lenses ?? 0);
const CLASH = BEATS.map((b) => b.clash ?? 0);
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics30'));

/** One lens on its arm. Three of these is three hooks, so each gets a component. */
function Lens({ S, k }: { S: { value: { lenses: number; clash: number } }; k: number }) {
  const st = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.lenses * 3 - k),
    transform: [{ rotate: `${(k - 1) * SPREAD * clamp01(S.value.clash)}deg` }],
  }));
  return (
    <Animated.View style={[styles.arm, { left: LENS_MID[k] - LENS_W / 2 }, st]} pointerEvents="none">
      <View style={styles.lens} />
      <View style={styles.stem} />
    </Animated.View>
  );
}

export default function Ethics30Scene({ clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn }: SceneApi) {
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
      card: carry(cv, 1, n, CARD[p], CARD[n], tr),
      lenses: carry(cv, 2, n, LENSES[p], LENSES[n], tr),
      clash: carry(cv, 3, n, CLASH[p], CLASH[n], tr),
      plates: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const cardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.card }));
  const namesStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.lenses * 1.6) }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, namesStyle]} pointerEvents="none">
        {LENS_MID.map((mx, k) => (
          <Text key={mx} style={[styles.capText, { left: mx - CAP_W / 2 }]}>{LENS_CAP[k]}</Text>
        ))}
      </Animated.View>

      {LENS_MID.map((mx, k) => <Lens key={mx} S={SCENE} k={k} />)}

      <Animated.View style={[StyleSheet.absoluteFill, cardStyle]} pointerEvents="none">
        <View style={styles.card} />
        <Text style={styles.cardText}>SPEAK OR STAY SILENT</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <AnswerLift key={id} id={id} picked={picked} correct={k === ALL}>
            <View style={[styles.plate, { left: PLATE_X[k] }]} />
          </AnswerLift>
        ))}
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === ALL}
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

  capText: {
    position: 'absolute', top: CAP_T, width: CAP_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },

  // A BARE ROTATE ON AN absoluteFill SWINGS ABOUT THE MIDDLE OF THE DESIGN SPACE,
  // so the origin is stated in px at the arm's foot, where it meets the card.
  arm: {
    position: 'absolute', top: ARM_TOP, width: LENS_W, height: ARM_H,
    transformOrigin: `${LENS_W / 2}px ${ARM_H}px`,
  },
  lens: {
    position: 'absolute', left: 0, top: 0, width: LENS_W, height: LENS_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 15, backgroundColor: PAPER,
  },
  stem: { position: 'absolute', left: LENS_W / 2 - 1.5, top: LENS_H, width: 3, height: ARM_H - LENS_H, backgroundColor: INK },

  card: {
    position: 'absolute', left: CARD_X, top: CARD_Y, width: CARD_W, height: CARD_H,
    backgroundColor: STONE, borderWidth: 2.5, borderColor: INK,
  },
  cardText: {
    position: 'absolute', left: CARD_X, top: CARD_Y + 18, width: CARD_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: INK, includeFontPadding: false,
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

export function Ethics30Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics30Scene} band={[240, 512]} camera={CAM} />;
}
