import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, lerp, mixStance, pose, type Bundle,
} from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political31Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';
import { Shapes, Outlined, ell, bar, rect, type Part } from './Silhouette';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const { RULE, STONE } = stageTone('political-philosophy');

// A FIELD THAT DIES WHILE YOU WATCH — twenty-one blades falling together, the first
// mass animation in the app — with the arithmetic laid over it at the end. The answer
// targets are the two halves of that sum plus a plate under the herder, so the reader
// is choosing between an explanation and a culprit (E33).
//
// · the grass runs x 112…356: 21 blades 4 wide on a 12 pitch, growing UP off the
//   ground line at 500. Blade heights run 26–50, so the tallest ink the field can
//   ever reach is y 450.
// · four animals sit on it at x 136 / 196 / 256 / 316, each 50 wide on a 60 pitch
//   so they stand 10 apart; the barrel is 32 × 17 at y 471…488 with legs down to
//   the ground and a grazing head reaching y 492 and x +47. Everything they draw
//   is inside y 470…500, so the band is unaffected.
// · the sum sits above the field: the GAIN box x 118…190 and the COST box x 202…362,
//   both y 314…356. The cost box holds four cells at rel x 5 / 43 / 81 / 119, 35 wide
//   — the quartering is drawn, not described (A1).
// · the herder's plate is x 8…104, y 466…498, centred under a figure at x 56 whose
//   widest ink is a fist at x 89. The plate's right edge clears the first blade by 8.
// · the figure's highest possible hand is y 411 (pelvis 466 less the 55 of B11b), so
//   it never reaches the sum boxes at 356.

const GRASS_X0 = 112;
const GRASS_N = 21;
const GRASS_PITCH = 12;
const GRASS_W = 4;

/** Every blade its own height, so the field is a field and not a comb. */
const BLADE = Array.from(
  { length: GRASS_N },
  (_, j) => 38 + 8 * Math.sin(j * 1.73) + 4 * Math.sin(j * 0.61 + 2.2),
);

const HERD_X = [136, 196, 256, 316];
/**
 * The animals are 50 wide on a 60 pitch, grazing, facing right, in a 50 × 30 box.
 *
 * They used to be a 40 × 20 rounded box on two 3-wide legs, and then a rounded box
 * with a head on it — drawn with the same recipe as the GAIN and COST boxes below,
 * and reading as crates or a bench. The reference gives a grazing cow as: a deep
 * box barrel with a LEVEL back and the hip bones making CORNERS at the rear of the
 * top line; the neck running forward and DOWN so the broad muzzle rests on the grass
 * ahead of the forefeet; a dewlap under the neck; an udder between the hind legs;
 * short straight legs; horn stubs and an ear at the poll; and a tail that is a thin
 * cord ending in a switch. A long neck and slender legs read as a horse or a deer.
 *
 * The OFF-SIDE legs recede in SOFT, which is the depth cue that stops four legs
 * reading as one black slab. Still OUTLINED rather than filled, and that part is not
 * a style choice — see the note on the barrel.
 */
const BEAST_W = 50;
const BODY_T = 470;
const COW_LEGS: Part[] = [
  bar(14, 13, 14.5, 29.5, 3.6, SOFT), bar(36.5, 14, 37, 29.5, 3.6, SOFT),
  bar(7, 13, 7, 30, 4.8, INK), bar(29.5, 13, 29.5, 30, 4.8, INK),
  bar(2.5, 4, 1.2, 18, 1.4, INK), ell(1.2, 20.5, 3.4, 5.4, INK),
];
/**
 * THE BARREL STAYS TONED WITH AN INK OUTLINE, and that is load-bearing rather than
 * decorative. They are the only animals standing IN the hero: the field is 21 blades
 * over x 112…356 and the four of them cover about 70% of that width in the y 470…500
 * band, so filling them in blacks out the bottom of most of the grass. The short
 * blades (26 tall, topping out at y 474) would vanish entirely, and a field dying is
 * the one thing this scene has to show.
 */
const COW: Part[] = [
  rect(19, 9.5, 32, 13, STONE, 0, 4), ell(20, 13.5, 29, 9, STONE), rect(6, 3.2, 8, 5, STONE, 0, 1.5),
  ell(13, 17.5, 7, 4.5, STONE), bar(31, 7, 36.5, 13, 9.5, STONE), ell(34, 14.5, 6, 5, STONE),
  rect(40, 17.5, 9, 12, STONE, -28, 3.5),
];
const COW_MARKS: Part[] = [
  ell(42.8, 23, 8, 6.4, INK),                                              // the broad muzzle, in the grass
  bar(34.5, 9, 39.5, 8.5, 2.6, INK), bar(38.5, 9.5, 40.5, 5.8, 2, INK),    // ear and horn stub
];

// 64 wide left "ALL YOURS" only 7% of clear air inside its inset kicker (D30).
const GAIN = { left: 118, top: 314, width: 72, height: 42 };
const COST = { left: 202, top: 314, width: 160, height: 42 };
const CELL_W = 35;
const CELL_PITCH = 38;

const PLATE = { left: 8, top: 466, width: 96, height: 32 };
const FIG_X = 56;

const G = BEATS.map((b) => b.g ?? 0);
const GRASS = BEATS.map((b) => b.grass ?? 1);
const HERD = BEATS.map((b) => b.herd ?? 0);
const SUMS = BEATS.map((b) => b.sums ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political31'));

export default function Political31Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    // The field takes 1.3s to fall — slower than a pose change, because a whole
    // field going at the speed of a gesture reads as a glitch (C17).
    const fall = ease01(bt.value / 1.3);
    const grow = ease01(bt.value / 0.9);
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(G[p], t)), emoteLive(G[n], t, bt.value), tr));
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      // R7c — the field is the answer. A remedy that asks nicely leaves it bare; one
      // that changes what taking too much COSTS grows it back under the reader's thumb.
      grass: carry(cv, 0, n, GRASS[p], reacting ? 0.18 + 0.82 * pickPos.value : GRASS[n], fall),
      // A living field: every blade leans on its own two frequencies, so the mass
      // never reads as one shape breathing (H67).
      sway: t,
      herd: carry(cv, 1, n, HERD[p], HERD[n], grow),
      sums: carry(cv, 2, n, SUMS[p], SUMS[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const sumStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.sums,
    transform: [{ translateY: (1 - SCENE.value.sums) * -8 }],
  }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const wrong = (id: string) => answered && picked === id;

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      {BLADE.map((h, j) => (
        <Blade key={j} j={j} h={h} SCENE={SCENE} />
      ))}

      {HERD_X.map((x, k) => (
        <Beast key={x} k={k} left={x} SCENE={SCENE} />
      ))}

      {/* the sum each of them did */}
      <Animated.View style={[styles.gain, sumStyle]}>
        <Target id={'gain'} correct={false} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
          <View style={[styles.box, wrong('gain') && styles.pickWrong]}>
            <Text style={styles.boxKick} numberOfLines={1}>ALL YOURS</Text>
            <Text style={styles.boxBig} numberOfLines={1}>+1</Text>
          </View>
        </Target>
      </Animated.View>

      <Animated.View style={[styles.cost, sumStyle]}>
        <Target id={'cost'} correct={true} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
          <View style={[styles.box, answered && styles.pickRight]}>
            <Text style={[styles.boxKick, answered && styles.onInkSoft]} numberOfLines={1}>
              SHARED FOUR WAYS
            </Text>
            {[0, 1, 2, 3].map((j) => (
              <Cell key={j} j={j} onInk={answered} SCENE={SCENE} />
            ))}
          </View>
        </Target>
      </Animated.View>

      {/* the culprit everybody reaches for first */}
      <Target id={'greed'} correct={false} picked={picked} onPick={onPick}
              style={styles.plate} disabled={!live || answered}>
        <View style={[styles.box, wrong('greed') && styles.pickWrong]}>
          <Text style={styles.plateText} numberOfLines={1}>THEIR GREED</Text>
        </View>
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

/** One blade of grass. Height is the field's state; the lean is its life. */
function Blade({ j, h, SCENE }: { j: number; h: number; SCENE: { value: { grass: number; sway: number } } }) {
  const st = useAnimatedStyle(() => {
    const s = SCENE.value.sway;
    const lean = Math.sin(s * 0.9 + j * 0.5) * 0.035 + Math.sin(s * 0.53 + j * 0.21) * 0.022;
    return { transform: [{ scaleY: SCENE.value.grass }, { rotateZ: `${lean}rad` }] };
  });
  return (
    <Animated.View
      style={[styles.blade, { left: GRASS_X0 + j * GRASS_PITCH, top: GROUND - h, height: h }, st]}
      pointerEvents="none"
    />
  );
}

/** One animal on the common. */
function Beast({ k, left, SCENE }: { k: number; left: number; SCENE: { value: { herd: number } } }) {
  const st = useAnimatedStyle(() => {
    const a = clamp01(SCENE.value.herd - k);
    return { opacity: a, transform: [{ translateX: (1 - a) * 14 }] };
  });
  return (
    // ORDER IS THE DRAWING. The legs and tail go down first so the barrel's fill
    // cuts them off cleanly where they enter the body, and the barrel, neck and
    // head share ONE outline, so the head grows out of the body rather than being a
    // box with a bubble on it.
    <Animated.View style={[styles.beast, { left }, st]} pointerEvents="none">
      <Shapes parts={COW_LEGS} />
      <Outlined parts={COW} width={2} line={INK} />
      <Shapes parts={COW_MARKS} />
    </Animated.View>
  );
}

/** One quarter of the damage. */
function Cell({ j, onInk, SCENE }: { j: number; onInk: boolean; SCENE: { value: { sums: number } } }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(SCENE.value.sums * 4 - j) }));
  return (
    <Animated.View
      style={[styles.cell, { left: 5 + j * CELL_PITCH }, onInk && styles.cellOnInk, st]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },
  fill: { flex: 1 },

  blade: { position: 'absolute', width: GRASS_W, backgroundColor: INK, transformOrigin: '50% 100%' },

  beast: { position: 'absolute', top: BODY_T, width: BEAST_W, height: GROUND - BODY_T },

  gain: { position: 'absolute', ...GAIN },
  cost: { position: 'absolute', ...COST },
  box: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  boxKick: {
    position: 'absolute', top: 5, left: 4, right: 4,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.8, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  boxBig: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: INK, marginTop: 8,
    includeFontPadding: false,
  },
  cell: {
    position: 'absolute', top: 20, width: CELL_W, height: 16,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
  },
  cellOnInk: { borderColor: PAPER, backgroundColor: INK },

  plate: { position: 'absolute', ...PLATE },
  plateText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  onInkSoft: { color: RULE },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
});

// Ink runs from the sum boxes (314) to the ground line (500). Band 308…512 = 204 (H59).
export function Political31Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political31Scene} band={[308, 512]} camera={CAM} />;
}
