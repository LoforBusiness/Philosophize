import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology18Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO RAILS, TWO MARKERS, ONE PUSH.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO RAILS, 280 wide at x 60…340, at y 274 and y 336. Each is a 2-thick rule
//   with a 16-wide marker riding on it, and each carries its claim as a caption
//   above it at y 254 and y 316.
// · the GRIP is drawn as a tether from the LEFT end of each rail to its marker:
//   9 thick on the top rail, 2 on the bottom. That difference is the lesson and
//   it is on the stage before anything is said about it.
// · the ENDS are labelled NO at x 40 and YES at x 344, once, between the rails at
//   y 302 — one pair of labels for both rails, because they share a scale and two
//   pairs would say they do not.
// · the EVIDENCE is a 96×26 chip at x 152…248, y 226…252, with an arrow down to
//   the junction at y 300 — a single source pushing at both, which is the only
//   way the comparison is fair.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, the lowest
//   rail ink is the marker at 344, so 53 units are clear.
//
// Ink runs y 226 (the evidence chip) … y 500. BAND 220…512 = 292, with the
// 103-unit figure at 35%.
//
// THE MARKERS ARE DERIVED, NOT TRACKED. Each one's position is its own starting
// belief moved by `ev / grip`, computed in the frame worklet — so there is
// exactly one number in the script for how hard the evidence pushes, and the
// two distances cannot drift apart from the ratio they are supposed to show.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const RAIL_X = 60;
const RAIL_W = 280;
const RAIL_Y = [274, 336];
const MARK_W = 16;

const CLAIMS = ['THE EARTH IS ROUND', 'MY KEYS ARE IN THE DRAWER'];
/** Where each marker starts, 0 = NO, 1 = YES. */
const START = [0.94, 0.52];
/** How firmly each is held. The evidence is divided by this. */
const GRIP = [9, 1.35];
/** The tether's drawn thickness, which is `GRIP` made visible. */
const TETHER = [9, 2];

const EV_X = 152;
const EV_Y = 226;
const EV_W = 96;
const EV_H = 26;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const RAILS = BEATS.map((b) => b.rails ?? 0);
const GRIPV = BEATS.map((b) => b.grip ?? 0);
const EV = BEATS.map((b) => b.ev ?? 0);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology18'));

export default function Epistemology18Scene({ clock, bt, bi, dragPos }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    const scripted = carry(cv, 1, n, EV[p], EV[n], tr);
    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      rails: carry(cv, 2, n, RAILS[p], RAILS[n], tr),
      grip: carry(cv, 3, n, GRIPV[p], GRIPV[n], tr),
      ev: LIVE_D[n] === 1 ? clamp01(dragPos.value) : scripted,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const railsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rails }));
  const evStyle = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.ev * 3) }));

  return (
    <View style={styles.scene}>
      {/* THE EVIDENCE — one chip, one stem, feeding both rails. */}
      <Animated.View style={[StyleSheet.absoluteFill, evStyle]} pointerEvents="none">
        <View style={styles.evBox} />
        <Text style={styles.evText}>SOMEONE YOU TRUST{'\n'}SAYS OTHERWISE</Text>
        <View style={styles.evStem} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, railsStyle]} pointerEvents="none">
        <Text style={[styles.end, { left: 26 }]}>NO</Text>
        <Text style={[styles.end, { left: 344 }]}>YES</Text>
        {[0, 1].map((k) => <Rail key={k} S={SCENE} index={k} />)}
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One claim on one rail. The marker sits at its own starting belief and is moved
 * toward NO by the evidence divided by the grip — so the top rail can take the
 * hardest push there is and shift about a fifth of what the bottom one does.
 */
function Rail({ S, index }: { S: { value: { ev: number; grip: number } }; index: number }) {
  const y = RAIL_Y[index];
  const travel = RAIL_W - MARK_W;
  const markStyle = useAnimatedStyle(() => {
    const at = clamp01(START[index] - S.value.ev / GRIP[index]);
    return { transform: [{ translateX: travel * at }] };
  });
  const tetherStyle = useAnimatedStyle(() => {
    const at = clamp01(START[index] - S.value.ev / GRIP[index]);
    return { width: travel * at + MARK_W / 2, height: TETHER[index] * S.value.grip };
  });
  return (
    <View pointerEvents="none">
      <Text style={[styles.claim, { top: y - 20 }]} numberOfLines={1} pointerEvents="none">{CLAIMS[index]}</Text>
      <View style={[styles.rail, { top: y }]} />
      <Animated.View style={[styles.tether, { top: y - 1 }, tetherStyle]} />
      <Animated.View style={[styles.mark, { top: y - 9 }, markStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  evBox: {
    position: 'absolute', left: EV_X, top: EV_Y, width: EV_W, height: EV_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
  },
  evText: {
    position: 'absolute', left: EV_X, top: EV_Y + 4, width: EV_W, textAlign: 'center', lineHeight: 9,
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  evStem: { position: 'absolute', left: EV_X + EV_W / 2 - 1, top: EV_Y + EV_H, width: 2, height: 22, backgroundColor: SOFT },

  claim: {
    position: 'absolute', left: RAIL_X, width: RAIL_W,
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.1, color: SOFT, includeFontPadding: false,
  },
  rail: { position: 'absolute', left: RAIL_X, width: RAIL_W, height: 2, backgroundColor: SOFT },
  tether: { position: 'absolute', left: RAIL_X, backgroundColor: INK, borderRadius: 1 },
  mark: {
    position: 'absolute', left: RAIL_X, width: MARK_W, height: 20, borderRadius: 3,
    borderWidth: 2, borderColor: INK, backgroundColor: PAPER,
  },
  end: {
    position: 'absolute', top: 302, width: 30,
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },
});

export function Epistemology18Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology18Scene} band={[220, 512]} camera={CAM} />;
}
