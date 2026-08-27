import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic18Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A MACHINE WITH A HOLE IN THE MIDDLE OF IT.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the COUNT is 24 TALLY MARKS, 3×14, on one row at y 232…246, from x 34
//   stepping 14 — so a full row ends at x 356. They light left to right, which is
//   what makes "how many" a length rather than a number to read.
//   MARKS, NOT LITTLE PEOPLE (H57). A disc with a caption saying it is a person
//   is the "bollards with heads" failure that rule is about, and it would be
//   standing next to a fully articulated figure. A tally is a count, which is
//   what this row actually measures.
// · the EVIDENCE LINKAGE is the upper shaft: a 96-wide box at x 34…130, y 264…292,
//   and an unbroken 3-thick rod from x 130 to x 286 at y 278.
// · the CRANK is a 44px disc centred (74, 330) with a 16-long handle that
//   ROTATES on the reader's drag — the only thing on the stage they move.
// · the BROKEN SHAFT runs from x 96 to x 286 at y 328, and it is missing
//   x 168…206. The 38-unit hole is drawn as two capped ends with paper between,
//   never as a dashed line, because a dash reads as a join.
// · the GAUGE is 96 wide at x 286…382, y 300…356: a track at y 340 with FALSE at
//   its left end and TRUE at its right, and a 10-wide needle on it.
// · the FIGURE walks x 200 → 128 → 268 on GROUND 500; crown ≈ 397, and the lowest
//   machine ink is the gauge at 356, so 41 units stay clear.
//
// Ink runs y 222 (HOW MANY SAY SO, at CROWD_Y − 14) … y 500. BAND 218…512 = 294,
// with the 103-unit figure at 35%.
//
// The band said 230 and the caption is drawn at 222, so eight units of the only
// words on the beat were outside the picture — `check:readable` measured one fifth
// of that caption reaching the reader. The old comment counted the crowd at 236 as
// the highest ink and forgot the label sitting above it, which is exactly the
// arithmetic H59 exists to make somebody redo: the band must contain every pixel a
// beat can draw, and a caption is a pixel.
//
// THE NEEDLE IS DRIVEN BY THE SCRIPT, NEVER BY THE DRAG, and that is the whole
// point of the scene rather than an implementation detail: `needle` is a track
// like any other and the reader's `dragPos` is wired only to the crank. A scene
// that let the drag touch the needle would be arguing the opposite case.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CROWD_Y = 236;
const CROWD_N = 24;
const TICK_W = 3;
const TICK_H = 14;
const CROWD_X0 = 34;
const CROWD_STEP = 14;

const EV_X = 34;
const EV_Y = 264;
const EV_W = 96;
const EV_H = 28;
const EV_ROD_Y = 278;

const CRANK_CX = 74;
const CRANK_CY = 330;
const CRANK_R = 22;

const SHAFT_Y = 328;
const SHAFT_A = [96, 168];
const SHAFT_B = [206, 286];

const G_X = 286;
const G_W = 96;
const G_TRACK_Y = 340;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const CROWD = BEATS.map((b) => b.crowd ?? 0);
const GAP = BEATS.map((b) => b.gap ?? 0);
const MESHED = BEATS.map((b) => b.meshed ?? 0);
const NEEDLE = BEATS.map((b) => b.needle ?? 0.5);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic18'));

export default function Logic18Scene({ clock, bt, bi, dragPos }: SceneApi) {
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

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // The crank takes the reader's hand on its own beat and the script's crowd
    // track everywhere else, so the handle is never in two places at once.
    const crowd = carry(cv, 1, n, CROWD[p], CROWD[n], tr);
    const turn = LIVE_D[n] === 1 ? clamp01(dragPos.value) : crowd;

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      crowd,
      turn,
      gap: carry(cv, 2, n, GAP[p], GAP[n], tr),
      meshed: carry(cv, 3, n, MESHED[p], MESHED[n], tr),
      needle: carry(cv, 4, n, NEEDLE[p], NEEDLE[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const gapStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gap }));
  const meshStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.meshed }));
  // Three full turns across the rail, so a small drag is visibly a lot of effort.
  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${SCENE.value.turn * 1080}deg` }],
  }));
  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (G_W - 22) * SCENE.value.needle }],
  }));

  const crowd: number[] = [];
  for (let c = 0; c < CROWD_N; c++) crowd.push(c);

  return (
    <View style={styles.scene}>
      <Text style={styles.cap} pointerEvents="none">HOW MANY SAY SO</Text>
      {crowd.map((c) => <Tick key={c} S={SCENE} index={c} />)}

      {/* THE LINKAGE THAT WORKS — drawn second, so it lands as the answer. */}
      <Animated.View style={[StyleSheet.absoluteFill, meshStyle]} pointerEvents="none">
        <View style={styles.evBox} />
        <Text style={styles.evText}>SOMEBODY{'\n'}TESTED IT</Text>
        <View style={styles.evRod} />
      </Animated.View>

      {/* THE LINKAGE THAT DOES NOT. */}
      <Animated.View style={[StyleSheet.absoluteFill, gapStyle]} pointerEvents="none">
        <View style={[styles.shaft, { left: SHAFT_A[0], width: SHAFT_A[1] - SHAFT_A[0] }]} />
        <View style={[styles.cap2, { left: SHAFT_A[1] - 2 }]} />
        <View style={[styles.cap2, { left: SHAFT_B[0] }]} />
        <View style={[styles.shaft, { left: SHAFT_B[0], width: SHAFT_B[1] - SHAFT_B[0] }]} />
        <Text style={styles.gapCap}>NOT CONNECTED</Text>

        <View style={styles.crank} />
        <Animated.View style={[styles.handleWrap, handleStyle]}>
          <View style={styles.handle} />
          <View style={styles.knob} />
        </Animated.View>
      </Animated.View>

      {/* THE READING. Ink, always on, because the thing the lesson is about is
          that it does not change. */}
      <View style={styles.gauge} pointerEvents="none">
        <View style={styles.track} />
        <Text style={[styles.end, { left: 0 }]}>FALSE</Text>
        <Text style={[styles.end, { left: G_W - 34 }]}>TRUE</Text>
      </View>
      <Animated.View style={[styles.needle, needleStyle]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One mark in the tally. Lights when the row has grown past it. */
function Tick({ S, index }: { S: { value: { crowd: number } }; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.crowd * CROWD_N - index) }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.tick, { left: CROWD_X0 + index * CROWD_STEP }, st]}
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 34, top: CROWD_Y - 14, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },
  tick: {
    position: 'absolute', top: CROWD_Y, width: TICK_W, height: TICK_H, backgroundColor: INK,
  },

  evBox: {
    position: 'absolute', left: EV_X, top: EV_Y, width: EV_W, height: EV_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
  },
  evText: {
    position: 'absolute', left: EV_X, top: EV_Y + 5, width: EV_W, textAlign: 'center', lineHeight: 10.8,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },
  evRod: { position: 'absolute', left: EV_X + EV_W, top: EV_ROD_Y, width: 156, height: 3, backgroundColor: INK },

  shaft: { position: 'absolute', top: SHAFT_Y, height: 3, backgroundColor: INK },
  cap2: { position: 'absolute', top: SHAFT_Y - 4, width: 2, height: 11, backgroundColor: INK },
  gapCap: {
    position: 'absolute', left: 152, top: SHAFT_Y + 12, width: 70, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },

  crank: {
    position: 'absolute', left: CRANK_CX - CRANK_R, top: CRANK_CY - CRANK_R,
    width: CRANK_R * 2, height: CRANK_R * 2, borderRadius: CRANK_R,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  handleWrap: {
    position: 'absolute', left: CRANK_CX - CRANK_R, top: CRANK_CY - CRANK_R,
    width: CRANK_R * 2, height: CRANK_R * 2, alignItems: 'center', justifyContent: 'center',
  },
  handle: { position: 'absolute', top: CRANK_R - 1.5, left: CRANK_R, width: 17, height: 3, backgroundColor: INK },
  knob: { position: 'absolute', top: CRANK_R - 4, left: CRANK_R + 15, width: 8, height: 8, borderRadius: 4, backgroundColor: INK },

  gauge: { position: 'absolute', left: G_X, top: 300, width: G_W, height: 56 },
  track: { position: 'absolute', left: 0, top: G_TRACK_Y - 300, width: G_W, height: 2, backgroundColor: SOFT },
  end: {
    position: 'absolute', top: 6, width: 34, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.7, color: SOFT, includeFontPadding: false,
  },
  needle: {
    position: 'absolute', left: G_X + 11, top: G_TRACK_Y - 9, width: 3, height: 20, backgroundColor: INK,
  },
});

export function Logic18Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic18Scene} band={[218, 512]} camera={CAM} />;
}
