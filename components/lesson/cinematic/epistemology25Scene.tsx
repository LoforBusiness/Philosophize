import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology25Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// THREE RULERS, EACH CHECKED BY THE ONE BELOW, AND NOTHING UNDER THE LAST.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · three RULERS of 176×18 at x 148, tops y 262 · 312 · 362. Each carries seven
//   TICKS of 2×7 at a pitch of 24 from x 158, so it reads as an instrument and
//   not as a bar. They are drawn from one style: the claim is that every rung is
//   the same kind of thing, and a rung that looked different would break it.
// · between each pair a LINK of 3×32 at x 236, and the words CHECKED BY at x 246.
//   The link is what makes the picture a regress rather than a stack.
// · under the lowest, a fourth link and an EMPTY DASHED BOX of 176×26 at y 424 —
//   a boundary with nothing inside it, which is exactly Sextus's finding.
// · the FLOW arrow is one bar of 5×150 at x 132, y 268…418, with a head at
//   whichever end the beat points to. It is the only thing in the scene that
//   moves between the two ways out, because the two ways out ARE a direction.
// · THREE PLATES of 92×26 at x 100, 200, 300, top y 462 — the answers, each
//   carrying its own words (S11), between the dashed box at 450 and the ground.
// · the figure stands at x 44 and walks to 100; his right edge at the walked mark
//   is 125, clear of the flow arrow at 132.
//
// Ink runs y 244 (the caption) … y 500 (ground). BAND 240…512 = 272 — a 103-unit
// figure at 37.9%, inside H58's 38%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const RULER_X = 148;
const RULER_W = 176;
const RULER_H = 18;
const RULER_Y = [262, 312, 362];
const RULER_N = 3;
const TICK_N = 7;
const TICK_X0 = 158;
const TICK_PITCH = 24;

const LINK_X = 236;
const LINK_W = 3;
const NOTHING_Y = 424;
const NOTHING_H = 26;

const FLOW_X = 132;
const FLOW_Y = 268;
const FLOW_H = 150;

const PLATE_X = [100, 200, 300];
const PLATE_Y = 462;
const PLATE_W = 92;
const PLATE_H = 26;
const PLATE_CAP = ['WITH THE RULE', 'WITH THE CASES', 'NOT AT ALL'];
const PLATE_ID = ['rule', 'cases', 'stop'];
/** Where the particularist begins. The other two are the other two doors. */
const CASES = 1;

const CAP_T = 244;
const FIG_X = 44;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const RUNGS = BEATS.map((b) => b.rungs ?? 0);
const NOTHING = BEATS.map((b) => (b.nothing ? 1 : 0));
const PLATES = BEATS.map((b) => (b.plates ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));
const FLOW = BEATS.map((b) => b.flow ?? 0);

// R7c — the stage follows the control on its own graded beat, and only there.
const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology25'));

export default function Epistemology25Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(6);
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

    // THE POLL'S OWN ORDER, never the shuffled rows (X3): 0 rule · 1 cases · 2
    // refuse. The arrow points DOWN for the rule, UP for the cases, and is taken
    // away entirely for the sceptic, who is not running the picture in either
    // direction.
    const pollFlow = reacting ? [1, 2, 0][Math.round(pickPos.value * 2)] ?? 0 : 0;

    return {
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      rungs: carry(cv, 1, n, RUNGS[p], RUNGS[n], tr),
      nothingOn: carry(cv, 2, n, NOTHING[p], NOTHING[n], tr),
      platesOn: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
      // Down is 1, up is 2, and the bar is drawn whenever either is asked for.
      down: carry(cv, 4, n, FLOW[p] === 1 ? 1 : 0, reacting ? (pollFlow === 1 ? 1 : 0) : (FLOW[n] === 1 ? 1 : 0), tr),
      up: carry(cv, 5, n, FLOW[p] === 2 ? 1 : 0, reacting ? (pollFlow === 2 ? 1 : 0) : (FLOW[n] === 2 ? 1 : 0), tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const nothingStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.nothingOn }));
  const platesStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.platesOn }));
  const downStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.down }));
  const upStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.up }));

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.cap} pointerEvents="none">EACH ONE CHECKED BY THE NEXT</Text>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {RULER_Y.map((ry, k) => <Rung key={ry} S={SCENE} top={ry} index={k} />)}
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, nothingStyle]} pointerEvents="none">
        <View style={[styles.link, { top: RULER_Y[2] + RULER_H, height: NOTHING_Y - RULER_Y[2] - RULER_H }]} />
        <View style={styles.nothing} />
        <Text style={styles.nothingText}>NOTHING UNDER IT</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, downStyle]} pointerEvents="none">
        <View style={styles.flowBar} />
        <View style={styles.headDown} />
        <Text style={styles.flowCap}>RULE FIRST</Text>
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, upStyle]} pointerEvents="none">
        <View style={styles.flowBar} />
        <View style={styles.headUp} />
        <Text style={styles.flowCap}>CASES FIRST</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, platesStyle]}>
        {PLATE_ID.map((id, k) => (
          <Target
            key={id}
            id={id}
            correct={k === CASES}
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

/** One ruler and the link that hangs the next one under it. */
function Rung({ S, top, index }: { S: SharedValue<any>; top: number; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.rungs * RULER_N - index) }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, st]} pointerEvents="none">
      <View style={[styles.ruler, { top }]} />
      {Array.from({ length: TICK_N }, (_, j) => (
        <View key={j} style={[styles.tick, { left: TICK_X0 + j * TICK_PITCH, top: top + 3 }]} />
      ))}
      {index < RULER_N - 1 ? (
        <>
          <View style={[styles.link, { top: top + RULER_H, height: RULER_Y[index + 1] - top - RULER_H }]} />
          <Text style={[styles.linkCap, { top: top + RULER_H + 8 }]}>CHECKED BY</Text>
        </>
      ) : null}
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
    position: 'absolute', left: 148, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  ruler: {
    position: 'absolute', left: RULER_X, width: RULER_W, height: RULER_H,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE,
  },
  tick: { position: 'absolute', width: 2, height: 7, backgroundColor: INK },
  link: { position: 'absolute', left: LINK_X, width: LINK_W, backgroundColor: INK },
  linkCap: {
    position: 'absolute', left: LINK_X + 10, width: 96,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },

  // A BOUNDARY WITH NOTHING INSIDE IT. Dashed and empty, because a filled box
  // here would be the very thing the regress cannot find.
  nothing: {
    position: 'absolute', left: RULER_X, top: NOTHING_Y, width: RULER_W, height: NOTHING_H,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed',
  },
  nothingText: {
    position: 'absolute', left: RULER_X, top: NOTHING_Y + 9, width: RULER_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },

  flowBar: { position: 'absolute', left: FLOW_X, top: FLOW_Y, width: 5, height: FLOW_H, backgroundColor: INK },
  headDown: {
    position: 'absolute', left: FLOW_X - 5, top: FLOW_Y + FLOW_H, width: 0, height: 0,
    borderLeftWidth: 7.5, borderRightWidth: 7.5, borderTopWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: INK,
  },
  headUp: {
    position: 'absolute', left: FLOW_X - 5, top: FLOW_Y - 12, width: 0, height: 0,
    borderLeftWidth: 7.5, borderRightWidth: 7.5, borderBottomWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: INK,
  },
  flowCap: {
    position: 'absolute', left: 24, top: FLOW_Y + FLOW_H / 2 - 5, width: 100, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

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

export function Epistemology25Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology25Scene} band={[240, 512]} camera={CAM} />;
}
