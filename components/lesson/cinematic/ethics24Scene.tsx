import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './ethics24Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A SLAB ON FOUR LEGS, AND THREE OF THEM TAKEN AWAY.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the SENTENCE is a 300×34 slab at x 50…350, y 240…274, 2.5 thick — the
//   heaviest line on the stage, because it is the thing everything else is
//   holding up.
// · FOUR PILLARS, 46 wide, from y 274 down to y 340, at lefts 62 · 142 · 222 ·
//   302 — the run ends at x 348, two inside the slab at either end so it visibly
//   rests ON them rather than beside them.
// · the NAMES sit under each pillar at y 344…358: STOP HIM · DETER OTHERS ·
//   REFORM HIM · DESERVED.
// · the TEST CASE shortens pillars 0, 1 and 2 to nothing over `gone` and tilts
//   the slab 3° about its right end, which is the one still supported. It is a
//   tilt and not a fall: the sentence is still standing, and noticing that it
//   still feels right is the entire lesson.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the names
//   end at y 358, so 39 units stay clear at every stop.
//
// Ink runs y 226 (the caption) … y 500. BAND 220…512 = 292, with the 103-unit
// figure at 35%.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const SLAB_X = 50;
const SLAB_Y = 240;
const SLAB_W = 300;
const SLAB_H = 34;

const PIL_TOP = SLAB_Y + SLAB_H;
const PIL_H = 66;
const PIL_W = 46;
const PIL_X = [62, 142, 222, 302];
const PIL_ID = ['protect', 'deter', 'reform', 'desert'];
const PIL_CAP = ['STOP HIM', 'DETER OTHERS', 'REFORM HIM', 'DESERVED'];
/** Which pillars the test case removes. */
const REMOVED = [1, 1, 1, 0];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const SLAB = BEATS.map((b) => b.slab ?? 0);
const NAMES = BEATS.map((b) => b.names ?? 0);
const GONE = BEATS.map((b) => b.gone ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics24'));

export default function Ethics24Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      slab: carry(cv, 1, n, SLAB[p], SLAB[n], tr),
      names: carry(cv, 2, n, NAMES[p], NAMES[n], tr),
      gone: carry(cv, 3, n, GONE[p], GONE[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const slabStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.slab,
    // About the RIGHT end — the one still supported — so the tilt reads as the
    // slab settling onto the last pillar rather than sliding off it.
    transform: [
      { translateX: SLAB_W / 2 },
      { rotate: `${SCENE.value.gone * 3}deg` },
      { translateX: -SLAB_W / 2 },
    ],
  }));
  const nameStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.names }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap} pointerEvents="none">WHAT IS IT FOR?</Text>

      <Animated.View style={[styles.slab, slabStyle]} pointerEvents="none">
        <Text style={styles.slabText}>FOUR YEARS</Text>
      </Animated.View>

      {PIL_X.map((px, k) => <Pillar key={PIL_ID[k]} S={SCENE} index={k} />)}

      <Animated.View style={[StyleSheet.absoluteFill, nameStyle]} pointerEvents="none">
        {PIL_X.map((px, k) => (
          <Text key={`n${k}`} style={[styles.pilCap, { left: px - 12 }]} numberOfLines={2}>
            {PIL_CAP[k]}
          </Text>
        ))}
      </Animated.View>

      {PIL_X.map((px, k) => (
        <Target
          key={`t${PIL_ID[k]}`}
          id={PIL_ID[k]}
          correct={PIL_ID[k] === 'desert'}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: px - 8 }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && PIL_ID[k] === 'desert' && styles.right,
              answered && picked === PIL_ID[k] && PIL_ID[k] !== 'desert' && styles.wrong,
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

/** One reason. The three the test case removes shrink to nothing from the top. */
function Pillar({ S, index }: { S: { value: { slab: number; gone: number } }; index: number }) {
  const left = PIL_X[index];
  const st = useAnimatedStyle(() => {
    const g = REMOVED[index] ? S.value.gone : 0;
    return {
      opacity: S.value.slab * (1 - g * 0.82),
      height: PIL_H * (1 - g),
      top: PIL_TOP + PIL_H * g,
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.pillar, { left }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: SLAB_X, top: 226, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.4, color: SOFT, includeFontPadding: false,
  },

  slab: {
    position: 'absolute', left: SLAB_X, top: SLAB_Y, width: SLAB_W, height: SLAB_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  slabText: {
    fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2, color: INK, includeFontPadding: false,
  },

  pillar: {
    position: 'absolute', width: PIL_W,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  pilCap: {
    position: 'absolute', top: 344, width: PIL_W + 24, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: PIL_TOP, width: PIL_W + 16, height: PIL_H + 20 },
  hitBox: { width: PIL_W + 16, height: PIL_H + 20, borderRadius: 4 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Ethics24Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics24Scene} band={[220, 512]} camera={CAM} />;
}
