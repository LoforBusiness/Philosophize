import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics35Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A JOKE DRAWN AS TRACK, AND THE POINTS SWITCHING UNDER IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the SETUP track is a 2-thick rule from x 150 to x 214 at y 348, with three
//   sleepers across it.
// · the JUNCTION is at x 214, y 348. Three BRANCHES leave it: the upper rises to
//   y 300 and runs to x 384, the middle stays level at y 348, the lower drops to
//   y 396. Each is one 2-thick bar rotated about its left end, plus a level run.
// · each branch ends in a 120×26 PLATE at x 264, tops at y 288, 336 and 384 — so
//   the three plates never touch (10 units of clear paper between them) and none
//   crosses the caption at 240.
// · the TRAIN is a 22×12 block that runs the setup and then the chosen branch;
//   it is one View moved by translate, never a re-layout.
// · the SPOILED line is the middle branch redrawn dashed before the split — the
//   explained joke, and the only dashed ink in the scene.
// · the figure stands at x 56, walks to 128; crown ~397. The setup track starts
//   at x 150, so he never overlaps it.
//
// Ink runs y 240 (caption) … y 500 (ground). BAND 234…512 = 278 (H59).
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const JUNC_X = 214;
const JUNC_Y = 348;
const SETUP_L = 150;
const PLATE_X = 264;
const PLATE_W = 120;
const PLATE_TOP = [288, 336, 384];
const PLATE_TEXT = ['A HOSPITAL WARD', 'STOP GOING THERE', 'AND AN UMBRELLA'];
const PLATE_ID = ['ward', 'places', 'brolly'];
const ARM_DEG = [-28, 0, 28];

const CAP_T = 240;
const FIG_X = 56;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const TRACK = BEATS.map((b) => (b.track ? 1 : 0));
const SPLIT = BEATS.map((b) => (b.split ? 1 : 0));
const RUN = BEATS.map((b) => b.run ?? 0);
const SPOIL = BEATS.map((b) => (b.spoil ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics35'));

export default function Aesthetics35Scene({ clock, bt, bi, qv, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    // A WALKING BEAT TAKES AS LONG AS THE WALK NEEDS (rig.moveTr). A fixed length
    // here sprinted every long journey and left the footfalls — which the player
    // computes from moveTr — arriving after the figure had stopped.
    const tr = ease01(bt.value / moveTr(X[p], X[n], BASE_TR));
    const t = clock.value;
    const q = clamp01(qv.value);

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // The train runs on the beat that says it runs, and HOLDS at the far end after
    // — a train that slid back to the junction between beats would be telling the
    // reader the joke had un-happened.
    const runNow = RUN[n] > 0 && RUN[p] === 0 ? ease01((bt.value - 0.2) / 1.3) : carry(cv, 0, n, RUN[p], RUN[n], tr);

    return {
      fig: pose(figS, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      t,
      trackOn: carry(cv, 2, n, TRACK[p], TRACK[n], tr),
      splitOn: carry(cv, 3, n, SPLIT[p], SPLIT[n], tr),
      run: runNow,
      spoilOn: carry(cv, 4, n, SPOIL[p], SPOIL[n], tr),
      lit: LIVE[n] === 1 ? ease01(q) : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const trackStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.trackOn }));
  const splitStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.splitOn }));
  const spoilStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.spoilOn }));
  // The train runs the setup, then the middle branch — the reading that lands.
  const trainStyle = useAnimatedStyle(() => {
    const u = SCENE.value.run;
    return { transform: [{ translateX: (JUNC_X - SETUP_L) + (PLATE_X - JUNC_X) * u }] };
  });

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>ONE SETUP, TWO READINGS</Text>

      <Animated.View style={[StyleSheet.absoluteFill, trackStyle]} pointerEvents="none">
        <View style={styles.setup} />
        {[0, 22, 44].map((s) => <View key={s} style={[styles.sleeper, { left: SETUP_L + 6 + s }]} />)}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, splitStyle]} pointerEvents="none">
        {ARM_DEG.map((d, k) => (
          <View key={d}>
            <View style={[styles.arm, { transform: [{ rotate: `${d}deg` }] }]} />
            <View style={[styles.armRun, { top: PLATE_TOP[k] + 13 }]} />
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.spoilLine, spoilStyle]} pointerEvents="none" />

      <Animated.View style={[styles.train, trainStyle]} pointerEvents="none" />

      <Plates S={SCENE} picked={picked} onPick={onPick} answered={answered} live={live} />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

function Plates({
  S, picked, onPick, answered, live,
}: {
  S: SharedValue<any>; picked: string | null; onPick: (id: string, ok: boolean) => void;
  answered: boolean; live: boolean;
}) {
  const wrap = useAnimatedStyle(() => ({ opacity: S.value.splitOn }));
  const litStyle = useAnimatedStyle(() => ({ opacity: S.value.lit }));
  const wrong = (id: string) => answered && picked === id;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wrap]}>
      {PLATE_TOP.map((ty, k) => (
        <Target
          key={ty}
          id={PLATE_ID[k]}
          correct={k === 1}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.plate, { top: ty }]}
        >
          <View style={[styles.plateBox, wrong(PLATE_ID[k]) && styles.plateWrong]} pointerEvents="none" />
          {k === 1 ? <Animated.View style={[styles.plateLit, litStyle]} pointerEvents="none" /> : null}
          <Text style={styles.plateText}>{PLATE_TEXT[k]}</Text>
        </Target>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 150, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  setup: { position: 'absolute', left: SETUP_L, top: JUNC_Y, width: JUNC_X - SETUP_L, height: 2, backgroundColor: INK },
  sleeper: { position: 'absolute', top: JUNC_Y - 4, width: 2, height: 10, backgroundColor: SOFT },

  // Rotated about the junction, so all three arms genuinely leave the same point.
  arm: {
    position: 'absolute', left: JUNC_X, top: JUNC_Y, width: 56, height: 2,
    backgroundColor: INK, transformOrigin: '0% 50%',
  },
  armRun: { position: 'absolute', left: PLATE_X - 10, width: 10, height: 2, backgroundColor: INK },

  spoilLine: {
    position: 'absolute', left: SETUP_L, top: JUNC_Y - 12, width: PLATE_X - SETUP_L, height: 0,
    borderTopWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },

  train: { position: 'absolute', left: SETUP_L, top: JUNC_Y - 12, width: 22, height: 11, borderRadius: 2, backgroundColor: INK },

  plate: { position: 'absolute', left: PLATE_X, width: PLATE_W, height: 26 },
  plateBox: {
    position: 'absolute', left: 0, top: 0, width: PLATE_W, height: 26,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateLit: {
    position: 'absolute', left: 3, top: 3, width: PLATE_W - 6, height: 20,
    borderRadius: 3, borderWidth: 1.5, borderColor: INK, borderStyle: 'dashed',
  },
  plateWrong: { borderColor: SOFT, borderStyle: 'dashed' },
  plateText: {
    position: 'absolute', left: 2, top: 8, width: PLATE_W - 4, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
});

export function Aesthetics35Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics35Scene} band={[234, 512]} camera={CAM} />;
}
