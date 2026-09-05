import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic21Script';
import {
  facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target, { AnswerLift } from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO LAMPS ON A BENCH, AND EVERY CONDITION PUT THROUGH BOTH.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · FOUR CHIPS along the top, 80 wide and 26 tall, at y 224…250, lefts 30 · 118 ·
//   206 · 294 — the row ends at x 374. OXYGEN · A MATCH IN PETROL · IT BEING
//   TUESDAY · FUEL, HEAT AND OXYGEN.
// · the BENCH is 300 wide at x 50…350, y 276…364, ruled down the middle at x 200
//   into two equal tests. Each half carries its question in caps at y 284 and a
//   32px lamp centred at y 316.
// · a LAMP is a ring that FILLS when its test comes back yes. Filled and hollow
//   rather than bright and dim: two states that differ only in strength read as
//   one state rendered badly, which is §19's argument for locked pins.
// · the POINTER is a 2-thick line from the chip under test down to the bench's
//   top edge at y 276, so which chip the lamps are about is never in doubt.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the bench
//   ends at y 364, so 33 units stay clear at every stop.
//
// Ink runs y 224 (the chips) … y 500. BAND 218…512 = 294, with the 103-unit
// figure at 35%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const CHIP_Y = 224;
const CHIP_W = 80;
const CHIP_H = 26;
const CHIP_X = [30, 118, 206, 294];
const CHIP_ID = ['oxygen', 'match', 'tuesday', 'all'];
const CHIP_TEXT = ['OXYGEN', 'A MATCH IN PETROL', 'IT BEING TUESDAY', 'FUEL, HEAT, OXYGEN'];
/** [necessary, sufficient] for each chip — what the two lamps read. */
const STATUS: readonly (readonly [number, number])[] = [[1, 0], [0, 1], [0, 0], [1, 1]];

const BENCH_X = 50;
const BENCH_Y = 276;
const BENCH_W = 300;
const BENCH_H = 88;
const LAMP_D = 32;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const CHIPS = BEATS.map((b) => b.chips ?? 0);
const BENCH = BEATS.map((b) => b.bench ?? 0);
const UNDER = BEATS.map((b) => b.under ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic21'));

export default function Logic21Scene({ clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn }: SceneApi) {
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
      fig: lookPose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      chips: carry(cv, 1, n, CHIPS[p], CHIPS[n], tr),
      bench: carry(cv, 2, n, BENCH[p], BENCH[n], tr),
      // The chip under test slides between whole numbers, so the pointer travels
      // and the lamps cross-fade rather than snapping between conditions.
      under: carry(cv, 3, n, UNDER[p], UNDER[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const chipStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chips }));
  const benchStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.bench }));
  const pointStyle = useAnimatedStyle(() => {
    const u = SCENE.value.under;
    const lo = Math.max(0, Math.min(3, Math.floor(u)));
    const hi = Math.max(0, Math.min(3, lo + 1));
    const f = u - lo;
    const cx = CHIP_X[lo] + (CHIP_X[hi] - CHIP_X[lo]) * f + CHIP_W / 2;
    return { opacity: SCENE.value.bench, transform: [{ translateX: cx - 1 }] };
  });

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, chipStyle]}>
        {/* EACH CHIP RIDES WITH ITS OWN TARGET (E39). The chips were one map and
            the hit-boxes another, so answering lifted an empty outline off the
            chip and the words on it. */}
        {CHIP_X.map((cx, k) => (
          <AnswerLift key={`c${k}`} id={CHIP_ID[k]} picked={picked} correct={CHIP_ID[k] === 'oxygen'}>
            <View style={[styles.chip, { left: cx }]} />
            <Text style={[styles.chipText, { left: cx }]} numberOfLines={2}>{CHIP_TEXT[k]}</Text>
          </AnswerLift>
        ))}

        {CHIP_X.map((cx, k) => (
          <Target
            key={`t${CHIP_ID[k]}`}
            id={CHIP_ID[k]}
            correct={CHIP_ID[k] === 'oxygen'}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: cx }]}
          >
            <View
              style={[
                styles.hitBox,
                answered && CHIP_ID[k] === 'oxygen' && styles.right,
                answered && picked === CHIP_ID[k] && CHIP_ID[k] !== 'oxygen' && styles.wrong,
              ]}
              pointerEvents="none"
            />
          </Target>
        ))}
      </Animated.View>

      <Animated.View style={[styles.pointer, pointStyle]} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFill, benchStyle]} pointerEvents="none">
        <View style={styles.bench} />
        <View style={styles.split} />
        <Text style={[styles.test, { left: BENCH_X }]}>TAKE IT AWAY{'\n'}DOES IT STILL BURN?</Text>
        <Text style={[styles.test, { left: BENCH_X + BENCH_W / 2 }]}>THIS ALONE{'\n'}DOES IT BURN?</Text>
        <Lamp S={SCENE} side={0} />
        <Lamp S={SCENE} side={1} />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One test's lamp. It fills when the chip under test passes that test, and the
 * fill cross-fades between conditions because `under` travels rather than jumps.
 */
function Lamp({ S, side }: { S: { value: { under: number } }; side: 0 | 1 }) {
  const cx = BENCH_X + BENCH_W / 4 + (BENCH_W / 2) * side - LAMP_D / 2;
  const st = useAnimatedStyle(() => {
    const u = S.value.under;
    const lo = Math.max(0, Math.min(3, Math.floor(u)));
    const hi = Math.max(0, Math.min(3, lo + 1));
    const f = u - lo;
    const v = STATUS[lo][side] * (1 - f) + STATUS[hi][side] * f;
    return { opacity: clamp01(v) };
  });
  return (
    <View pointerEvents="none">
      <View style={[styles.lamp, { left: cx }]} />
      <Animated.View style={[styles.lampFill, { left: cx + 5 }, st]} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  chip: {
    position: 'absolute', top: CHIP_Y, width: CHIP_W, height: CHIP_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 13, backgroundColor: STONE,
  },
  chipText: {
    position: 'absolute', top: CHIP_Y + 5, width: CHIP_W, textAlign: 'center', lineHeight: 9,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.5, color: INK, includeFontPadding: false,
  },

  pointer: {
    position: 'absolute', left: 0, top: CHIP_Y + CHIP_H, width: 2, height: BENCH_Y - CHIP_Y - CHIP_H,
    backgroundColor: SOFT,
  },

  bench: {
    position: 'absolute', left: BENCH_X, top: BENCH_Y, width: BENCH_W, height: BENCH_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
  },
  split: {
    position: 'absolute', left: BENCH_X + BENCH_W / 2, top: BENCH_Y, width: 1, height: BENCH_H,
    backgroundColor: RULE,
  },
  test: {
    position: 'absolute', top: BENCH_Y + 8, width: BENCH_W / 2, textAlign: 'center', lineHeight: 10.8,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: SOFT, includeFontPadding: false,
  },
  lamp: {
    position: 'absolute', top: BENCH_Y + 40, width: LAMP_D, height: LAMP_D, borderRadius: LAMP_D / 2,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
  },
  lampFill: {
    position: 'absolute', top: BENCH_Y + 45, width: LAMP_D - 10, height: LAMP_D - 10,
    borderRadius: (LAMP_D - 10) / 2, backgroundColor: INK,
  },

  hit: { position: 'absolute', top: CHIP_Y, width: CHIP_W, height: CHIP_H },
  hitBox: { width: CHIP_W, height: CHIP_H, borderRadius: 13 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Logic21Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic21Scene} band={[218, 512]} camera={CAM} />;
}
