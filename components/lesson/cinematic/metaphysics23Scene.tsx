import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics23Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FIVE PLANKS, LEAVING ONE HULL AND ARRIVING IN THE OTHER.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO HULLS, 130×38, at x 40…170 and x 230…360, both with their keel on y 356.
//   Identical to the unit, because the puzzle dies the moment one of them looks
//   more like a ship than the other.
// · FIVE PLANK BARS per hull, 118×4.5, at y 324 · 330 · 336 · 342 · 348. Plank k
//   is old wood while `swap × 5` is below k and new wood above it, so the fill
//   crosses the stage one plank at a time and MATTER IS CONSERVED on screen —
//   whatever leaves the left hull is what arrives in the right. There is no
//   third ship and nothing is created, which is the whole of the puzzle drawn
//   rather than asserted.
// · TWO MASTS, 3 wide, x 102…105 and x 292…295, y 244…318, with 52×50 sails at
//   x 107 and x 240 — the sails face each other, so the pair reads as a
//   comparison rather than a fleet.
// · the LABELS sit at y 360, 8pt, centred on their own hull.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest ink is the labels at y 370, so 27 units stay clear. He stands in the
//   gap between the hulls at the opening, which is where the collector's pile
//   would be and is deliberately left empty (A1: there is no third thing).
//
// Ink runs y 244 (the mast tops) … y 500. BAND 238…512 = 274, with the 103-unit
// figure at 37.6%.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const HULL_Y = 318;
const HULL_H = 38;
const HULL_W = 130;
const L_HULL = 40;
const R_HULL = 230;

const PLANK_Y = [324, 330, 336, 342, 348];
const PLANK_W = HULL_W - 12;
const PLANK_H = 4.5;

const MAST_TOP = 244;
const L_MAST = 102;
const R_MAST = 292;
const SAIL_W = 52;
const SAIL_H = 50;
const SAIL_Y = 250;

const LABEL_Y = 360;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const SHIPS = BEATS.map((b) => b.ships ?? 0);
const SWAP = BEATS.map((b) => b.swap ?? 0);
const BUILT = BEATS.map((b) => b.built ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics23'));

export default function Metaphysics23Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
      ships: carry(cv, 1, n, SHIPS[p], SHIPS[n], tr),
      swap: carry(cv, 2, n, SWAP[p], SWAP[n], tr),
      built: carry(cv, 3, n, BUILT[p], BUILT[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const shipStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ships }));
  const builtStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.built }));

  const planks = [0, 1, 2, 3, 4];

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, shipStyle]} pointerEvents="none">
        <View style={[styles.mast, { left: L_MAST }]} />
        <View style={[styles.sail, { left: L_MAST + 5 }]} />
        <View style={[styles.hull, { left: L_HULL }]} />
        <Text style={[styles.label, { left: L_HULL }]}>REPAIRED</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, builtStyle]} pointerEvents="none">
        <View style={[styles.mast, { left: R_MAST }]} />
        <View style={[styles.sail, { left: R_MAST - SAIL_W - 5 }]} />
        <View style={[styles.hull, { left: R_HULL }]} />
        <Text style={[styles.label, { left: R_HULL }]}>REASSEMBLED</Text>
      </Animated.View>

      {/* One number, two hulls: what empties on the left fills on the right. */}
      {planks.map((k) => <Plank key={`l${k}`} S={SCENE} k={k} left={L_HULL + 6} old />)}
      {planks.map((k) => <Plank key={`r${k}`} S={SCENE} k={k} left={R_HULL + 6} old={false} />)}

      <Target
        id="repaired" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: L_HULL, width: HULL_W }]}
      >
        <View style={[styles.hitBox, { width: HULL_W }, answered && picked === 'repaired' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="gap" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: 176, width: 48 }]}
      >
        <View style={[styles.hitBox, { width: 48 }, answered && picked === 'gap' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="reassembled" correct picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: R_HULL, width: HULL_W }]}
      >
        <View style={[styles.hitBox, { width: HULL_W }, answered && styles.right]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * Plank k. `old` is the left hull, which holds it while the swap is below k;
 * the right hull holds it once the swap has passed. The two are complementary
 * by construction, so no plank can ever be in both places or in neither.
 */
function Plank({
  S, k, left, old,
}: { S: { value: { ships: number; swap: number; built: number } }; k: number; left: number; old: boolean }) {
  const st = useAnimatedStyle(() => {
    const moved = clamp01(S.value.swap * 5 - k);
    const on = old ? (1 - moved) * S.value.ships : moved * S.value.built;
    return { opacity: on };
  });
  return <Animated.View pointerEvents="none" style={[styles.plank, { top: PLANK_Y[k], left }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  hull: {
    position: 'absolute', top: HULL_Y, width: HULL_W, height: HULL_H,
    borderWidth: 2.5, borderColor: INK, borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    backgroundColor: PAPER,
  },
  plank: {
    position: 'absolute', width: PLANK_W, height: PLANK_H, backgroundColor: INK, borderRadius: 1.5,
  },
  mast: { position: 'absolute', top: MAST_TOP, width: 3, height: HULL_Y - MAST_TOP, backgroundColor: INK },
  sail: {
    position: 'absolute', top: SAIL_Y, width: SAIL_W, height: SAIL_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: PAPER,
  },
  label: {
    position: 'absolute', top: LABEL_Y, width: HULL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },

  hit: { position: 'absolute', top: HULL_Y, height: HULL_H },
  hitBox: { height: HULL_H, borderRadius: 6 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Metaphysics23Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics23Scene} band={[238, 512]} camera={CAM} />;
}
