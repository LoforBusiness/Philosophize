import type { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic24Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE IDENTICAL ENGINES, ONE TOKEN EACH, AND THREE DIFFERENT THINGS OUT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · THREE ENGINES of 74×56 at x 140 · 226 · 312 (140…386), y 320…376 — filled
//   STONE with an ink edge, and the reader's tap targets on the graded beat. All
//   three are drawn from one style: nothing about a housing says how far its
//   answer can be trusted, and a flimsier-looking box would argue the lesson's
//   point in the furniture.
// · the FEED is a 14×14 square above each engine at y 296, centred on it — the
//   same token into all three.
// · what COMES OUT sits at y 386, centred under each: deduction returns the same
//   14×14 square, induction a 28×14 bar, abduction a 18-unit DISC. A shape nothing
//   fed in is the whole of Peirce's claim, drawn rather than asserted.
// · the LIT RING is 82×64 and rides to the chosen engine on the sort, sitting four
//   units outside whichever box it is on.
// · a CAPTION of 246 wide at x 140, y 408 names the row below — the only words the
//   lower half carries, so nothing is ever printed across a token (S9).
// · the figure stands at x 28 and walks to 88; his widest span at the walked mark
//   is x ≈ 63…113, twenty-seven units clear of the first engine at 140.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const ENG_X = [140, 226, 312];
const ENG_Y = 320;
const ENG_W = 74;
const ENG_H = 56;
const ENG_N = 3;
const ENG_CAP = ['DEDUCTION', 'INDUCTION', 'ABDUCTION'];
const ENG_ID = ['ded', 'ind', 'abd'];
/** The engine that named the burst pipe. */
const ABD = 2;

const FEED_Y = 296;
const OUT_Y = 386;
const ROW_CAP_Y = 408;

const CAP_T = 244;
const FIG_X = 28;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const BENCH = BEATS.map((b) => b.bench ?? 0);
const FEED = BEATS.map((b) => (b.feed ? 1 : 0));
const OUT = BEATS.map((b) => (b.out ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

// R7c — the stage follows the control on its own graded beat, and only there.
// Derived from the beat so it cannot fall out of step with the control.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// THE SORT'S OWN BIN ORDER, never the shuffled row (X3): 0 deduction · 1 induction
// · 2 abduction, which is the bench's own left-to-right order, so the ring travels
// along the row rather than jumping across it.
const RING_AT = [ENG_X[0] - 4, ENG_X[1] - 4, ENG_X[2] - 4];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic24'));

export default function Logic24Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
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
      bench: carry(cv, 1, n, BENCH[p], BENCH[n], tr),
      feedOn: carry(cv, 2, n, FEED[p], FEED[n], tr),
      outOn: carry(cv, 3, n, OUT[p], OUT[n], tr),
      ringAt: carry(cv, 4, n, RING_AT[0], reacting ? pickAt(RING_AT, pickPos.value) : RING_AT[0], tr),
      ringOn: reacting ? 1 : 0,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const feedStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.feedOn }));
  const outStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.outOn }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ringOn, left: SCENE.value.ringAt }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">WHAT GOES IN, WHAT COMES OUT</Text>

      <Animated.View style={[StyleSheet.absoluteFill, feedStyle]} pointerEvents="none">
        {ENG_X.map((ex) => (
          <View key={ex} style={[styles.feed, { left: ex + ENG_W / 2 - 7 }]} />
        ))}
      </Animated.View>

      <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />

      <View style={StyleSheet.absoluteFill}>
        {ENG_ID.map((id, k) => (
          <Engine key={id} S={SCENE} index={k}>
            <Target
              id={id}
              correct={k === ABD}
              picked={picked}
              onPick={onPick}
              disabled={!live || answered}
              style={[styles.hit, { left: ENG_X[k] }]}
              radius={4}
            >
              <View style={styles.engine} pointerEvents="none" />
              <Text style={styles.engineText} pointerEvents="none">{ENG_CAP[k]}</Text>
            </Target>
          </Engine>
        ))}
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, outStyle]} pointerEvents="none">
        {/* DEDUCTION returns its own token; INDUCTION a longer bar; ABDUCTION a
            disc, which is a shape nothing was fed. */}
        <View style={[styles.outSame, { left: ENG_X[0] + ENG_W / 2 - 7 }]} />
        <View style={[styles.outBar, { left: ENG_X[1] + ENG_W / 2 - 14 }]} />
        <View style={[styles.outNew, { left: ENG_X[2] + ENG_W / 2 - 9 }]} />
        <Text style={styles.rowCap}>WHAT COMES OUT</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One engine, arriving in bench order. */
function Engine({ S, index, children }: { S: SharedValue<any>; index: number; children: ReactNode }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.bench * ENG_N - index) }));
  return <Animated.View style={[StyleSheet.absoluteFill, st]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON — a subject standing on a filled mass
  // rather than on bare page.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 140, top: CAP_T, width: 246,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: ENG_Y, width: ENG_W, height: ENG_H },
  engine: {
    position: 'absolute', left: 0, top: 0, width: ENG_W, height: ENG_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  engineText: {
    position: 'absolute', left: 0, top: ENG_H / 2 - 5, width: ENG_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK, includeFontPadding: false,
  },

  feed: { position: 'absolute', top: FEED_Y, width: 14, height: 14, backgroundColor: INK },
  outSame: { position: 'absolute', top: OUT_Y, width: 14, height: 14, backgroundColor: INK },
  outBar: { position: 'absolute', top: OUT_Y, width: 28, height: 14, backgroundColor: INK },
  outNew: { position: 'absolute', top: OUT_Y - 2, width: 18, height: 18, borderRadius: 9, backgroundColor: INK },
  rowCap: {
    position: 'absolute', left: 140, top: ROW_CAP_Y, width: 246, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  // A LIT SURROUND, four units outside whichever engine the chip has reached.
  ring: {
    position: 'absolute', top: ENG_Y - 4, width: ENG_W + 8, height: ENG_H + 8,
    borderWidth: 2.5, borderColor: INK,
  },
});

export function Logic24Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic24Scene} band={[240, 512]} camera={CAM} />;
}
