import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology36Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FOUR THINGS THAT ARE THE SAME THING, AND TWO LABELS THAT DISAGREE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the COUNTER is a 3-thick rule from x 128 to x 384 at y 372, with a 2-thick
//   apron dropping to y 392.
// · the four PAIRS stand on it: each 48 wide × 62 tall at y 306…368, at x 140,
//   200, 260 and 320. Every one is drawn from the SAME three numbers — outline,
//   two seam lines — because the experiment's design is that they are identical
//   and the picture has to be too (A1). There is no per-item variation in this
//   file to find.
// · the POSITION SCALE under the counter runs x 140…368 at y 400, with a mark
//   under each pair rising 4, 8, 12, 20 — the real cause, drawn small and low.
// · the GIVEN REASON card is 128×46 at x 236, y 240…286: it sits beside the
//   shopper's head, which is where a spoken reason belongs.
// · the REAL CAUSE card is 128×30 at x 236, y 412…442, under the counter, so the
//   two never touch and the reader can hold both at once.
// · the figure stands at x 56 and walks to 128; crown ~397, clear of the counter
//   which starts at x 128 — he stands beside it, not in it.
//
// Ink runs y 240 (the reason card) … y 500 (ground). BAND 234…512 = 278 (H59).
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const PAIR_X = [140, 200, 260, 320];
const PAIR_Y = 306;
const PAIR_W = 48;
const PAIR_H = 62;
const PAIR_ID = ['p1', 'p2', 'p3', 'p4'];

const COUNTER_Y = 372;
const SCALE_Y = 400;
const SCALE_RISE = [4, 8, 12, 20];

const CAP_T = 240;
const FIG_X = 56;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const SHELF = BEATS.map((b) => (b.shelf ? 1 : 0));
const GIVEN = BEATS.map((b) => (b.given ? 1 : 0));
const REAL = BEATS.map((b) => (b.real ? 1 : 0));
const CLASH = BEATS.map((b) => (b.clash ? 1 : 0));
const LIVE = BEATS.map((b) => (b.live ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology36'));

export default function Epistemology36Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const L = (a: number, b: number) => { 'worklet'; return lerp(a, b, tr); };
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, L(X[p], X[n]), GROUND, K_FIG, 1, 1),
      t,
      shelfOn: L(SHELF[p], SHELF[n]),
      givenOn: L(GIVEN[p], GIVEN[n]),
      realOn: L(REAL[p], REAL[n]),
      // The two cards do not blink at each other; the clash is that both are up.
      clashOn: L(CLASH[p], CLASH[n]),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const shelfStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.shelfOn }));
  const givenStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.givenOn }));
  const realStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.realOn }));
  const clashStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.clashOn }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, shelfStyle]}>
        <View style={styles.counter} pointerEvents="none" />
        <View style={styles.apron} pointerEvents="none" />

        {PAIR_X.map((px, k) => (
          <View key={px} style={[styles.pair, { left: px }]} pointerEvents="none">
            <View style={styles.pairBox} />
            <View style={[styles.seam, { top: 16 }]} />
            <View style={[styles.seam, { top: 34 }]} />
          </View>
        ))}

        {PAIR_X.map((px, k) => (
          <Target
            key={`t${px}`}
            id={PAIR_ID[k]}
            correct={k === 3}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: px }]}
          >
            <View
              style={[styles.hitBox, answered && picked === PAIR_ID[k] && k !== 3 && styles.hitWrong]}
              pointerEvents="none"
            />
          </Target>
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, realStyle]} pointerEvents="none">
        <View style={styles.scaleRule} />
        {PAIR_X.map((px, k) => (
          <View key={`s${px}`} style={[styles.scaleMark, { left: px + PAIR_W / 2 - 3, height: SCALE_RISE[k], top: SCALE_Y - SCALE_RISE[k] }]} />
        ))}
        <View style={styles.realCard} />
        <Text style={styles.realText}>WHAT MOVED THE HAND{'\n'}POSITION IN THE ROW</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, givenStyle]} pointerEvents="none">
        <View style={styles.givenCard} />
        <Text style={styles.givenText}>WHAT THEY SAID{'\n'}BETTER KNIT · FINER WEAVE{'\n'}NICER FEEL</Text>
      </Animated.View>

      <Animated.View style={[styles.clashMark, clashStyle]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  counter: { position: 'absolute', left: 128, top: COUNTER_Y, width: 256, height: 3, backgroundColor: INK },
  apron: { position: 'absolute', left: 128, top: COUNTER_Y + 3, width: 256, height: 2, backgroundColor: SOFT },

  pair: { position: 'absolute', top: PAIR_Y, width: PAIR_W, height: PAIR_H },
  pairBox: {
    position: 'absolute', left: 0, top: 0, width: PAIR_W, height: PAIR_H,
    borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PAPER,
  },
  seam: { position: 'absolute', left: 8, width: PAIR_W - 16, height: 1.5, backgroundColor: SOFT },

  scaleRule: { position: 'absolute', left: 140, top: SCALE_Y, width: 228, height: 1.5, backgroundColor: SOFT },
  scaleMark: { position: 'absolute', width: 6, backgroundColor: INK, borderRadius: 1 },

  realCard: {
    position: 'absolute', left: 236, top: 412, width: 128, height: 30,
    borderWidth: 1.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  realText: {
    position: 'absolute', left: 236, top: 417, width: 128, textAlign: 'center', lineHeight: 10,
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 0.8, color: INK, includeFontPadding: false,
  },

  givenCard: {
    position: 'absolute', left: 236, top: CAP_T, width: 128, height: 46,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 4, backgroundColor: PAPER,
  },
  givenText: {
    position: 'absolute', left: 236, top: CAP_T + 6, width: 128, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 7, letterSpacing: 0.8, color: SOFT, includeFontPadding: false,
  },

  // The one mark that says the two accounts do not meet: a stroke down the gap
  // between them, never a colour (§19).
  clashMark: { position: 'absolute', left: 298, top: 292, width: 2, height: 116, backgroundColor: SOFT },

  hit: { position: 'absolute', top: PAIR_Y, width: PAIR_W, height: PAIR_H },
  hitBox: { position: 'absolute', left: 0, top: 0, width: PAIR_W, height: PAIR_H, borderRadius: 6 },
  hitWrong: { borderWidth: 2, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Epistemology36Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology36Scene} band={[234, 512]} camera={CAM} />;
}
