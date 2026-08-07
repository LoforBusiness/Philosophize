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
import Target from './Target';

// A FIELD THAT DIES WHILE YOU WATCH — twenty-one blades falling together, the first
// mass animation in the app — with the arithmetic laid over it at the end. The answer
// targets are the two halves of that sum plus a plate under the herder, so the reader
// is choosing between an explanation and a culprit (E33).
//
// · the grass runs x 112…356: 21 blades 4 wide on a 12 pitch, growing UP off the
//   ground line at 500. Blade heights run 26–50, so the tallest ink the field can
//   ever reach is y 450.
// · four animals sit on it at x 136 / 196 / 256 / 316, each 50 wide on a 60 pitch
//   so they stand 10 apart; the barrel is 34 × 19 at y 470…489 with legs down to
//   the ground and a grazing head reaching y 492 and x +50. Everything they draw
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
 * The animals are 50 wide on a 60 pitch, of which the BARREL is 34.
 *
 * They used to be a 40 × 20 rounded box on two 3-wide legs, with no head and no
 * tail — which is to say they were drawn with the same recipe as the GAIN and
 * COST boxes twenty lines below, and read as exactly that: four empty crates
 * standing in the field. The legs were the giveaway. A blade of grass here is 4
 * wide, so the cattle were standing on legs THINNER than the grass they were
 * eating, and they disappeared into the comb.
 *
 * Now: four legs (6 near, 4.5 off-side — the depth cue critters.ts uses), a head
 * carried low over the grass, an ear and a tail. Still OUTLINED rather than
 * filled, and that part is not a style choice — see the note on the barrel.
 */
const BEAST_W = 50;
const BODY_W = 34;
const BODY_H = 19;
const BODY_T = 470;
const LEG_T = 15;

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
    // ORDER IS THE DRAWING. The legs and tail go down first so the barrel's paper
    // fill cuts them off cleanly where they enter the body, and the head goes last
    // so IT crosses the barrel's outline rather than the other way round — which is
    // the difference between an animal with a head and a box with a bubble on it.
    <Animated.View style={[styles.beast, { left }, st]} pointerEvents="none">
      <View style={[styles.leg, { left: 6 }]} />
      <View style={[styles.legFar, { left: 12.5 }]} />
      <View style={[styles.leg, { left: 23 }]} />
      <View style={[styles.legFar, { left: 29.5 }]} />
      <View style={styles.tail} />
      <View style={styles.body} />
      <View style={styles.ear} />
      <View style={styles.head} />
      <View style={styles.muzzle} />
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

  beast: { position: 'absolute', top: BODY_T, width: BEAST_W, height: GROUND - BODY_T },
  // THE BARREL STAYS PAPER-FILLED WITH AN INK OUTLINE, and that is load-bearing
  // rather than decorative. Every other animal in the app is solid ink (the dog in
  // ethics-1, the kestrel in aesthetics-5) and these were the odd ones — but they
  // are the only animals standing IN the hero. The field is 21 blades over x
  // 112…356 and the four of them cover about 70% of that width in the y 470…500
  // band, so filling them in blacks out the bottom of most of the grass. The short
  // blades (26 tall, topping out at y 474) would vanish entirely, and a field
  // dying is the one thing this scene has to show.
  body: {
    position: 'absolute', left: 3, top: 0, width: BODY_W, height: BODY_H,
    borderWidth: 2, borderColor: INK, borderRadius: 7, backgroundColor: PAPER,
  },
  // Carried LOW — cattle on a common are eating it, and a head at grazing height
  // also keeps the ear and the muzzle down among the blades where the outline has
  // something to read against.
  head: {
    position: 'absolute', left: 33, top: 9, width: 14, height: 13,
    borderWidth: 2, borderColor: INK, borderRadius: 5.5, backgroundColor: PAPER,
  },
  muzzle: { position: 'absolute', left: 45, top: 15, width: 5, height: 4.5, borderRadius: 2, backgroundColor: INK },
  ear: { position: 'absolute', left: 35.5, top: 5, width: 3.5, height: 7, borderRadius: 1.75, backgroundColor: INK },
  tail: { position: 'absolute', left: 0, top: 1, width: 3, height: 8, borderRadius: 1.5, backgroundColor: INK },
  // 6 for the near legs and 4.5 for the off-side pair, the same depth cue the dog
  // uses. Both must stay clear of the 4-wide grass blade, which is what the old
  // 3-wide leg failed at.
  leg: { position: 'absolute', top: LEG_T, width: 6, height: GROUND - BODY_T - LEG_T, backgroundColor: INK },
  legFar: { position: 'absolute', top: LEG_T, width: 4.5, height: GROUND - BODY_T - LEG_T, backgroundColor: INK },

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
