import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './aesthetics24Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE PANEL, AND FOUR FAITHFUL COPIES OF IT GETTING SMALLER.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the PANEL is 100×88 at x 28…128, y 242…330: a 3-thick frame, a 1.2 mount
//   inset 7, and four 1.2 hatch rules inside it at y 268 · 280 · 292 · 304. The
//   hatching is the only "painting" on the stage and every copy carries it,
//   because the argument dies if the copies look worse (A1).
// · FOUR COPIES, bottom-aligned on y 330 at x 148 · 214 · 266 · 306, sized
//   66×56 · 52×44 · 40×34 · 30×26, at opacities 0.90 · 0.72 · 0.54 · 0.36. They
//   shrink and fade with DISTANCE FROM HERE, not with fidelity — the last one is
//   a phone in somebody's hand on another continent.
// · THREE PLATES, 112×38, at x 24 · 144 · 264, y 340…378. Two of them name
//   things a scan takes perfectly.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the plates at y 378, so 19 units stay clear.
//
// Ink runs y 242 (the frame) … y 500. BAND 236…512 = 276, with the 103-unit
// figure at 37.3%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PAN_X = 28;
const PAN_Y = 242;
const PAN_W = 100;
const PAN_H = 88;
const HATCH_Y = [268, 280, 292, 304];

const CP_X = [148, 214, 266, 306];
const CP_W = [66, 52, 40, 30];
const CP_H = [56, 44, 34, 26];
const CP_OP = [0.9, 0.72, 0.54, 0.36];
const CP_BASE = 330;

const PL_Y = 340;
const PL_H = 38;
const PL_W = 112;
const PL_X = [24, 144, 264];
const PL_TEXT = ['THE BRUSHSTROKES', 'THE COLOURS', 'THE HISTORY OF BEING HERE'];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const PANEL = BEATS.map((b) => b.panel ?? 0);
const COPIES = BEATS.map((b) => b.copies ?? 0);
const PLATES = BEATS.map((b) => b.plates ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('aesthetics24'));

export default function Aesthetics24Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(4);
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

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      panel: carry(cv, 1, n, PANEL[p], PANEL[n], tr),
      copies: carry(cv, 2, n, COPIES[p], COPIES[n], tr),
      plates: carry(cv, 3, n, PLATES[p], PLATES[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const panStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.panel }));
  const plStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.plates }));

  const cps = [0, 1, 2, 3];

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, panStyle]} pointerEvents="none">
        <View style={styles.frame} />
        <View style={styles.mount} />
        {HATCH_Y.map((y) => <View key={y} style={[styles.hatch, { top: y }]} />)}
      </Animated.View>

      {cps.map((k) => <Copy key={k} S={SCENE} k={k} />)}

      <Animated.View style={[StyleSheet.absoluteFill, plStyle]} pointerEvents="none">
        {PL_X.map((px, k) => (
          <View key={px}>
            <View style={[styles.plate, { left: px }]} />
            <Text style={[styles.plateText, { left: px }]} numberOfLines={2}>{PL_TEXT[k]}</Text>
          </View>
        ))}
      </Animated.View>

      {PL_X.map((px, k) => (
        <Target
          key={px}
          id={`c${k}`}
          correct={k === 2}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: px }]}
        >
          <View
            style={[
              styles.hitBox,
              k === 2 ? (answered && styles.right) : (answered && picked === `c${k}` && styles.wrong),
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * Copy k. It shrinks and fades with distance from the room, never with fidelity:
 * the hatching is still in it, because a copy that looked worse would be an
 * argument nobody needs to have (A1).
 */
function Copy({ S, k }: { S: { value: { copies: number } }; k: number }) {
  const st = useAnimatedStyle(() => ({ opacity: CP_OP[k] * S.value.copies }));
  const h = CP_H[k];
  const w = CP_W[k];
  const top = CP_BASE - h;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, st]}>
      <View style={[styles.copyFrame, { left: CP_X[k], top, width: w, height: h }]} />
      <View style={[styles.hatch, { left: CP_X[k] + 6, width: w - 12, top: top + h * 0.34 }]} />
      <View style={[styles.hatch, { left: CP_X[k] + 6, width: w - 12, top: top + h * 0.56 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  frame: {
    position: 'absolute', left: PAN_X, top: PAN_Y, width: PAN_W, height: PAN_H,
    borderWidth: 3, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  mount: {
    position: 'absolute', left: PAN_X + 7, top: PAN_Y + 7, width: PAN_W - 14, height: PAN_H - 14,
    borderWidth: 1.2, borderColor: SOFT,
  },
  hatch: {
    position: 'absolute', left: PAN_X + 16, width: PAN_W - 32, height: 1.2, backgroundColor: SOFT,
  },
  copyFrame: {
    position: 'absolute', borderWidth: 1.8, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },

  plate: {
    position: 'absolute', top: PL_Y, width: PL_W, height: PL_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', top: PL_Y + 10, width: PL_W, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PL_Y, width: PL_W, height: PL_H },
  hitBox: { width: PL_W, height: PL_H, borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Aesthetics24Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Aesthetics24Scene} band={[236, 512]} camera={CAM} />;
}
