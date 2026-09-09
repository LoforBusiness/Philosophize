import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics27Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO BAGS OF BLUE MARBLES, IDENTICAL, AND A MACHINE OVER ONE OF THEM.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO BAGS of 84×70 at x 150 and x 246 (150…330), y 336…406 — filled STONE with
//   an ink edge, each carrying six MARBLES of 18 across in two rows at a pitch of
//   26 from the bag's own left inset. One style draws all twelve: a picture that
//   made the accidental bag look shakier would settle the question by decoration,
//   and the Humean's whole point is that nothing in the marbles tells you.
// · the MACHINE is a 60×26 hopper at x 258, y 296…322, with a 4-wide spout down to
//   the second bag's mouth at 336. It is the only thing that distinguishes them.
// · a POWER MARK is a 6-unit disc at the centre of every marble, drawn only when
//   the reader's answer puts the necessity inside the objects.
// · BAG LABELS of 84 wide sit under their own bags at y 412, in ink on paper.
// · THREE PLATES of 84×26 at x 128 · 220 · 312 (128…396), top y 462 — below the
//   bag labels and above the ground, each carrying its own words (S11).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, fifteen units clear of the nearest plate and thirty-seven clear
//   of the first bag at 150.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BAG_X = [150, 246];
const BAG_Y = 336;
const BAG_W = 84;
const BAG_H = 70;
const BAG_CAP = ['BY ACCIDENT', 'BY MACHINE'];
const BAG_LABEL_Y = 412;

const MARB_D = 18;
const MARB_PITCH = 26;
const MARB_X0 = 14;
const MARB_Y0 = 12;

const MACH_X = 258;
const MACH_Y = 296;
const MACH_W = 60;
const MACH_H = 26;

const PLATE_X = [128, 220, 312];
const PLATE_Y = 462;
const PLATE_W = 84;
const PLATE_H = 26;
const PLATE_CAP = ['A FLUKE FITS', 'LAWS CHANGE', 'NO ONE SEES IT'];
const PLATE_ID = ['fluke', 'change', 'unseen'];
/** The objection that bites. The other two are not objections to this view. */
const FLUKE = 0;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BAGS = BEATS.map((b) => b.bags ?? 0);
const MACHINE = BEATS.map((b) => (b.machine ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

// THE POLL'S OWN ORDER, never the shuffled rows (X3): 0 the pattern · 1 a law ·
// 2 a power. Each row is read off that option's own words, and each says where
// the necessity lives — which is exactly what the three answers disagree about.
//   pattern — nothing makes it so, so both bags stand bare.
//   law     — a thing above the objects, so the machine hangs over them.
//   power   — inside each object, so every marble carries its own mark.
const MACH_AT = [0, 1, 0];
const POWER_AT = [0, 0, 1];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics27'));

export default function Metaphysics27Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      bags: carry(cv, 1, n, BAGS[p], BAGS[n], tr),
      machine: carry(cv, 2, n, MACHINE[p], reacting ? pickAt(MACH_AT, pickPos.value) : MACHINE[n], tr),
      power: carry(cv, 3, n, 0, reacting ? pickAt(POWER_AT, pickPos.value) : 0, tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const machStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.machine }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">SAME MARBLES, TWICE</Text>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {BAG_X.map((bx, k) => <Bag key={bx} S={SCENE} left={bx} index={k} />)}
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, machStyle]} pointerEvents="none">
        <View style={styles.machine} />
        <View style={styles.spout} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === FLUKE}
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

/** One bag and the six marbles in it, all drawn from one style. */
function Bag({ S, left, index }: { S: SharedValue<any>; left: number; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.bags * 2 - index) }));
  const markStyle = useAnimatedStyle(() => ({ opacity: S.value.power }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <View style={[styles.bag, { left }]} />
      {[0, 1, 2, 3, 4, 5].map((m) => {
        const mx = left + MARB_X0 + (m % 3) * MARB_PITCH;
        const my = BAG_Y + MARB_Y0 + Math.floor(m / 3) * MARB_PITCH;
        return (
          <View key={m}>
            <View style={[styles.marble, { left: mx, top: my }]} />
            <Animated.View style={[styles.power, { left: mx + MARB_D / 2 - 3, top: my + MARB_D / 2 - 3 }, markStyle]} />
          </View>
        );
      })}
      <Text style={[styles.bagText, { left }]}>{BAG_CAP[index]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 136, top: CAP_T, width: 250,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  bag: {
    position: 'absolute', top: BAG_Y, width: BAG_W, height: BAG_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
  },
  marble: {
    position: 'absolute', width: MARB_D, height: MARB_D, borderRadius: MARB_D / 2,
    borderWidth: 1.5, borderColor: INK, backgroundColor: PAPER,
  },
  // THE NECESSITY, IF IT LIVES IN THE OBJECT. Drawn only when the reader says so.
  power: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: INK },
  bagText: {
    position: 'absolute', top: BAG_LABEL_Y, width: BAG_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  // THE ONLY DIFFERENCE BETWEEN THE TWO BAGS, and it stands above them rather
  // than in them, which is exactly what the necessitarian is claiming.
  machine: {
    position: 'absolute', left: MACH_X, top: MACH_Y, width: MACH_W, height: MACH_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  spout: { position: 'absolute', left: MACH_X + MACH_W / 2 - 2, top: MACH_Y + MACH_H, width: 4, height: BAG_Y - MACH_Y - MACH_H, backgroundColor: INK },

  hit: { position: 'absolute', top: PLATE_Y, width: PLATE_W, height: PLATE_H },
  plate: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: 0, top: 8, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },
});

export function Metaphysics27Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics27Scene} band={[240, 512]} camera={CAM} />;
}
