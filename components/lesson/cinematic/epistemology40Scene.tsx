import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology40Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FOUR DEFENDANTS IN ONE DOCK, UNDER ONE BENCH, ROPED TOGETHER.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the BENCH is 248×32 at x 138, y 264…296 — a filled STONE mass carrying the
//   word EXPERIENCE in ink, so the white plates below have something to be read
//   against (T2).
// · FOUR PLATES of 56×32 at x 138 · 202 · 266 · 330 (so 138…386), y 326…358. One
//   style draws all four: the argument is that they are the same kind of thing in
//   the eyes of the evidence, and a plate that looked different would settle it.
// · the ROPE is 252×3 at x 136, y 366 — behind all four and past both ends, which
//   is the whole of "not individually but as a corporate body".
// · the VERDICT is one bar of height 7 at y 306, between bench and dock. At rest
//   it spans the dock exactly, 138…386. Driven by the sort it narrows to 56 and
//   travels to the chosen plate's own x, so blaming a part IS the bar moving.
// · THREE PLATES of 74×26 at x 148 · 232 · 316 (148…390), top y 462 — below the
//   rope and above the ground, each carrying its own words (S11).
// · the figure stands at x 44 and walks to 108. At the answer plates' height he is
//   legs only, x ≈ 100…116 at the walked mark, so the nearest plate at 148 clears
//   him by thirty-two units; at head height his span is x ≈ 83…133, still left of
//   the bench at 138.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const BENCH_X = 138;
const BENCH_Y = 264;
const BENCH_W = 248;
const BENCH_H = 32;

const DOCK_X = [138, 202, 266, 330];
const DOCK_Y = 326;
const DOCK_W = 56;
const DOCK_H = 32;
const DOCK_N = 4;
const DOCK_CAP = ['THE LAW', 'THE ORBIT', 'THE LENS', 'THE SUMS'];
/** Left edge and full span of the dock, which is the verdict's resting shape. */
const DOCK_L = DOCK_X[0];
const DOCK_SPAN = DOCK_X[3] + DOCK_W - DOCK_X[0];

const ROPE_Y = 366;
const VERDICT_Y = 306;
const VERDICT_H = 7;

const PLATE_X = [148, 232, 316];
const PLATE_Y = 462;
const PLATE_W = 74;
const PLATE_H = 26;
const PLATE_CAP = ['THE LAW', 'ALL OF IT', 'NOTHING'];
const PLATE_ID = ['law', 'all', 'none'];
/** What the bar is actually lying across. The other two are the two tidy stories. */
const ALL = 1;

const CAP_T = 244;
const FIG_X = 44;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const DOCKV = BEATS.map((b) => b.dock ?? 0);
const ROPE = BEATS.map((b) => (b.rope ? 1 : 0));
const VERDICT = BEATS.map((b) => (b.verdict ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN BIN ORDER, never the shuffled row (X3): 0 the law · 1 the orbit
// · 2 the lens. Each entry is that bin's own defendant, so the bar lands on the
// plate whose words the reader just chose — and the three are authored in the
// dock's own left-to-right order so the travel between them is monotone.
const AIM_AT = [DOCK_X[0], DOCK_X[1], DOCK_X[2]];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology40'));

export default function Epistemology40Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      dock: carry(cv, 1, n, DOCKV[p], DOCKV[n], tr),
      ropeOn: carry(cv, 2, n, ROPE[p], ROPE[n], tr),
      verdictOn: carry(cv, 3, n, VERDICT[p], VERDICT[n], tr),
      platesOn: carry(cv, 4, n, PLATES[p], PLATES[n], tr),
      // How far the charge has been narrowed from the whole dock onto one plate,
      // and which plate it is narrowing onto.
      narrow: carry(cv, 5, n, 0, reacting ? 1 : 0, tr),
      aim: carry(cv, 6, n, DOCK_L, reacting ? pickAt(AIM_AT, pickPos.value) : DOCK_L, tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const ropeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ropeOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const verdictStyle = useAnimatedStyle(() => {
    const k = SCENE.value.narrow;
    return {
      opacity: SCENE.value.verdictOn,
      left: DOCK_L + (SCENE.value.aim - DOCK_L) * k,
      width: DOCK_SPAN + (DOCK_W - DOCK_SPAN) * k,
    };
  });

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">THE TRIBUNAL OF EXPERIENCE</Text>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.bench} />
        <Text style={styles.benchText}>EXPERIENCE</Text>
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, ropeStyle]} pointerEvents="none">
        <View style={styles.rope} />
      </Animated.View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {DOCK_X.map((dx, k) => <Defendant key={dx} S={SCENE} left={dx} index={k} />)}
      </View>

      <Animated.View style={[styles.verdict, verdictStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
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

/** One of the four things that went into the prediction, standing in the dock. */
function Defendant({ S, left, index }: { S: SharedValue<any>; left: number; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.dock * DOCK_N - index) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <View style={[styles.defendant, { left }]} />
      <Text style={[styles.defendantText, { left }]}>{DOCK_CAP[index]}</Text>
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
    position: 'absolute', left: BENCH_X, top: CAP_T, width: BENCH_W,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  bench: {
    position: 'absolute', left: BENCH_X, top: BENCH_Y, width: BENCH_W, height: BENCH_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  benchText: {
    position: 'absolute', left: BENCH_X, top: BENCH_Y + 11, width: BENCH_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: INK, includeFontPadding: false,
  },

  defendant: {
    position: 'absolute', top: DOCK_Y, width: DOCK_W, height: DOCK_H,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  defendantText: {
    position: 'absolute', top: DOCK_Y + 11, width: DOCK_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  // ONE ROPE BEHIND ALL FOUR, running past both ends of the dock — they are tied
  // to each other rather than each tied to the bench.
  rope: { position: 'absolute', left: 136, top: ROPE_Y, width: 252, height: 3, backgroundColor: INK },

  // THE CHARGE. Its left and width are animated, so narrowing it onto one
  // defendant is a movement rather than a second object appearing.
  verdict: { position: 'absolute', top: VERDICT_Y, height: VERDICT_H, backgroundColor: INK },

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

export function Epistemology40Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology40Scene} band={[240, 512]} camera={CAM} />;
}
