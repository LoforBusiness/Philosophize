import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  clamp01, ease01, emoteHold, emoteLive, lerp, mixStance, pose, type Bundle,
} from './rig';
import { BEATS } from './political31Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';

// A FIELD THAT DIES WHILE YOU WATCH — twenty-one blades falling together, the first
// mass animation in the app — with the arithmetic laid over it at the end. The answer
// targets are the two halves of that sum plus a plate under the herder, so the reader
// is choosing between an explanation and a culprit (E33).
//
// · the grass runs x 112…356: 21 blades 4 wide on a 12 pitch, growing UP off the
//   ground line at 500. Blade heights run 26–50, so the tallest ink the field can
//   ever reach is y 450.
// · four animals sit on it at x 136 / 196 / 256 / 316, bodies 40 × 20 at y 470…490
//   with legs down to the ground.
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
const BODY_W = 40;
const BODY_H = 20;
const BODY_T = 470;

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

export default function Political31Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
    const s = mixStance(emoteHold(G[p], t), emoteLive(G[n], t, bt.value), tr);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      grass: lerp(GRASS[p], GRASS[n], fall),
      // A living field: every blade leans on its own two frequencies, so the mass
      // never reads as one shape breathing (H67).
      sway: t,
      herd: lerp(HERD[p], HERD[n], grow),
      sums: lerp(SUMS[p], SUMS[n], grow),
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
      {BLADE.map((h, j) => (
        <Blade key={j} j={j} h={h} SCENE={SCENE} />
      ))}

      {HERD_X.map((x, k) => (
        <Beast key={x} k={k} left={x} SCENE={SCENE} />
      ))}

      {/* the sum each of them did */}
      <Animated.View style={[styles.gain, sumStyle]}>
        <Pressable
          style={styles.fill}
          disabled={!live || answered}
          onPress={() => onPick('gain', false)}
        >
          <View style={[styles.box, wrong('gain') && styles.pickWrong]}>
            <Text style={styles.boxKick} numberOfLines={1}>ALL YOURS</Text>
            <Text style={styles.boxBig} numberOfLines={1}>+1</Text>
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.cost, sumStyle]}>
        <Pressable
          style={styles.fill}
          disabled={!live || answered}
          onPress={() => onPick('cost', true)}
        >
          <View style={[styles.box, answered && styles.pickRight]}>
            <Text style={[styles.boxKick, answered && styles.onInkSoft]} numberOfLines={1}>
              SHARED FOUR WAYS
            </Text>
            {[0, 1, 2, 3].map((j) => (
              <Cell key={j} j={j} onInk={answered} SCENE={SCENE} />
            ))}
          </View>
        </Pressable>
      </Animated.View>

      {/* the culprit everybody reaches for first */}
      <Pressable
        style={styles.plate}
        disabled={!live || answered}
        onPress={() => onPick('greed', false)}
      >
        <View style={[styles.box, wrong('greed') && styles.pickWrong]}>
          <Text style={styles.plateText} numberOfLines={1}>THEIR GREED</Text>
        </View>
      </Pressable>

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
    <Animated.View style={[styles.beast, { left }, st]} pointerEvents="none">
      <View style={styles.body} />
      <View style={[styles.leg, { left: 7 }]} />
      <View style={[styles.leg, { left: BODY_W - 10 }]} />
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
  fill: { flex: 1 },

  blade: { position: 'absolute', width: GRASS_W, backgroundColor: INK, transformOrigin: '50% 100%' },

  beast: { position: 'absolute', top: BODY_T, width: BODY_W, height: GROUND - BODY_T },
  body: {
    position: 'absolute', left: 0, top: 0, width: BODY_W, height: BODY_H,
    borderWidth: 2, borderColor: INK, borderRadius: 7, backgroundColor: PAPER,
  },
  leg: { position: 'absolute', top: BODY_H - 1, width: 3, height: GROUND - BODY_T - BODY_H + 1, backgroundColor: INK },

  gain: { position: 'absolute', ...GAIN },
  cost: { position: 'absolute', ...COST },
  box: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  boxKick: {
    position: 'absolute', top: 5, left: 4, right: 4,
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 0.8, color: SOFT,
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
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  onInkSoft: { color: RULE },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the sum boxes (314) to the ground line (500). Band 308…512 = 204 (H59).
export function Political31Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political31Scene} band={[308, 512]} />;
}
