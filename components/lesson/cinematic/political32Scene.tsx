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
import { BEATS } from './political32Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// SEVENTY-SEVEN MARKS AND ONE OF THEM IS YOURS. The scale is the argument: the reader
// has to find their own tick in the row, and how small it looks is the lesson (H64).
//
// THE COUNT COMES IN behind a retreating PAPER cover rather than by scaling the row —
// a scaled row of ticks squashes, and 77 separately animated ticks would cost more
// than the whole scene is worth. One cover per pile, anchored at its right edge.
//
// · pile FOR is 41 ticks 2 wide on a 6 pitch from x 116 — x 116…358, y 342…362.
// · pile AGAINST is 36 of the same — x 116…328, y 392…412.
// · the overhang between them, x 328…358, IS the margin, and the bracket under it
//   runs x 326…362 at y 370 with a leader up to the chip.
// · THE RESULT is a plate at x 116…244, y 292…322. THE MARGIN is a tall target at
//   x 316…392, y 292…378 whose chip sits at the top and whose lower half is the tap
//   area over the overhang. NOTHING AT ALL is a plate at x 236…380, y 468…500,
//   resting on the ground line.
// · your own mark is a heavier tick at x 150, y 430…452, with a leader up into the
//   lower pile and its caption beneath at y 456…470.
// · the figure is at x 56 facing right; its widest ink is a fist at x 89, twenty-seven
//   clear of the piles, and its crown at y 397 sits in the gap between them.

const BAR_L = 116;
const PITCH = 6;
const TICK_W = 2;
const TICK_H = 20;

const A_N = 41;
const A_TOP = 342;
const B_N = 36;
const B_TOP = 392;

const A_END = BAR_L + (A_N - 1) * PITCH + TICK_W;      // 358
const B_END = BAR_L + (B_N - 1) * PITCH + TICK_W;      // 328

const RESULT = { left: 116, top: 292, width: 128, height: 30 };
const MARGIN = { left: 316, top: 292, width: 76, height: 86 };
const NOTHING = { left: 236, top: 468, width: 144, height: 32 };

const MARK_X = 150;
const FIG_X = 56;

const G = BEATS.map((b) => b.g ?? 0);
const FILL = BEATS.map((b) => b.fill ?? 0);
const RES = BEATS.map((b) => b.result ?? 0);
const MARK = BEATS.map((b) => b.mark ?? 0);
const LAB = BEATS.map((b) => b.labels ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political32'));

export default function Political32Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);      // nobody walks; this is a pose blend
    const t = clock.value;
    // The count takes 1.4s to come in — long enough to read as a count rather than
    // as a bar appearing (C17).
    const run = ease01(bt.value / 1.4);
    const grow = ease01(bt.value / 0.9);
    const s = mixStance(emoteHold(G[p], t), emoteLive(G[n], t, bt.value), tr);
    const fill = lerp(FILL[p], FILL[n], run);
    return {
      fig: pose(s, FIG_X, GROUND, K_FIG, 1, 1),
      fillA: fill,
      // The second pile lands a little behind the first, so the two rows read as two
      // counts rather than one shutter opening.
      fillB: clamp01(fill * 1.16 - 0.16),
      result: lerp(RES[p], RES[n], grow),
      mark: lerp(MARK[p], MARK[n], grow),
      labels: lerp(LAB[p], LAB[n], grow),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const coverA = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - SCENE.value.fillA }] }));
  const coverB = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 - SCENE.value.fillB }] }));
  const resultStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.result,
    transform: [{ translateY: (1 - SCENE.value.result) * -6 }],
  }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.mark,
    transform: [{ translateY: (1 - SCENE.value.mark) * 8 }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.labels,
    transform: [{ translateY: (1 - SCENE.value.labels) * -6 }],
  }));

  const answered = picked !== null;
  const live = (cur.pick ?? 0) > 0 && !!cur.interact;
  const wrong = (id: string) => answered && picked === id;

  return (
    <Animated.View style={styles.scene}>
      {/* the two piles */}
      <Text style={[styles.rowLabel, { top: 324 }]} numberOfLines={1}>FOR</Text>
      {Array.from({ length: A_N }, (_, j) => (
        <View key={`a${j}`} style={[styles.tick, { left: BAR_L + j * PITCH, top: A_TOP }]} pointerEvents="none" />
      ))}
      <Animated.View style={[styles.cover, { left: BAR_L, top: A_TOP - 4, width: A_END - BAR_L + 2 }, coverA]} pointerEvents="none" />

      <Text style={[styles.rowLabel, { top: 374 }]} numberOfLines={1}>AGAINST</Text>
      {Array.from({ length: B_N }, (_, j) => (
        <View key={`b${j}`} style={[styles.tick, { left: BAR_L + j * PITCH, top: B_TOP }]} pointerEvents="none" />
      ))}
      <Animated.View style={[styles.cover, { left: BAR_L, top: B_TOP - 4, width: B_END - BAR_L + 2 }, coverB]} pointerEvents="none" />

      {/* your one mark */}
      <Animated.View style={[styles.markWrap, markStyle]} pointerEvents="none">
        <View style={styles.markLead} />
        <View style={styles.mark} />
        <Text style={styles.markText} numberOfLines={1}>YOURS</Text>
      </Animated.View>

      {/* the bracket that measures the gap */}
      <Animated.View style={[styles.bracket, labelStyle]} pointerEvents="none" />
      <Animated.View style={[styles.bracketCap, labelStyle]} pointerEvents="none" />
      <Animated.View style={[styles.bracketLead, labelStyle]} pointerEvents="none" />

      {/* the three answers */}
      <Animated.View style={[styles.result, resultStyle]}>
        <Target id={'result'} correct={false} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
          <View style={[styles.box, wrong('result') && styles.pickWrong]}>
            <Text style={styles.boxText} numberOfLines={1}>THE RESULT</Text>
          </View>
        </Target>
      </Animated.View>

      <Animated.View style={[styles.margin, labelStyle]}>
        <Target id={'margin'} correct={true} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
          <View style={[styles.chip, answered && styles.pickRight]}>
            <Text style={[styles.boxText, answered && styles.onInk]} numberOfLines={1}>THE MARGIN</Text>
          </View>
        </Target>
      </Animated.View>

      <Animated.View style={[styles.nothing, labelStyle]}>
        <Target id={'nothing'} correct={false} picked={picked} onPick={onPick}
              style={styles.fill} disabled={!live || answered}>
          <View style={[styles.box, wrong('nothing') && styles.pickWrong]}>
            <Text style={styles.boxText} numberOfLines={1}>NOTHING AT ALL</Text>
          </View>
        </Target>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  fill: { flex: 1 },

  rowLabel: {
    position: 'absolute', left: BAR_L, width: 90,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  tick: { position: 'absolute', width: TICK_W, height: TICK_H, backgroundColor: INK },
  // Retreats to the right as the count comes in, so the ticks themselves never move.
  cover: { position: 'absolute', height: TICK_H + 8, backgroundColor: PAPER, transformOrigin: '100% 50%' },

  markWrap: { position: 'absolute', left: MARK_X - 28, top: 418, width: 56, alignItems: 'center' },
  markLead: { width: 1.5, height: 12, backgroundColor: SOFT },
  mark: { width: 3.5, height: 22, backgroundColor: INK },
  markText: {
    marginTop: 4,
    fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },

  bracket: { position: 'absolute', left: 326, top: 370, width: 36, height: 2, backgroundColor: INK },
  bracketCap: { position: 'absolute', left: 326, top: 370, width: 2, height: 7, backgroundColor: INK },
  bracketLead: { position: 'absolute', left: 360, top: 322, width: 2, height: 55, backgroundColor: INK },

  result: { position: 'absolute', ...RESULT },
  margin: { position: 'absolute', ...MARGIN },
  nothing: { position: 'absolute', ...NOTHING },
  box: {
    flex: 1, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  // The margin's target is TALL — its lower half is the empty tap area over the
  // overhang — so only the chip at the top carries the answer state.
  chip: {
    height: 30, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  boxText: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },

  onInk: { color: PAPER },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT, opacity: 0.45 },
});

// Ink runs from the result plate (292) to the ground line (500). Band 286…512 = 226 (H59).
export function Political32Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political32Scene} band={[286, 512]} camera={CAM} />;
}
