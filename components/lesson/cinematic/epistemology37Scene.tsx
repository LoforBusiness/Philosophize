import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology37Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ONE HULL, FIVE CRACKS, AND THE CRACKS ARE THE ONLY THING THAT CHANGES.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the HULL is a 176×62 body at x 150, y 322…384, with a flat deck line and a
//   30-tall mast at x 236 rising to y 292. It never moves, never lists and never
//   sinks: the lesson is about the owner, and a sinking ship would make it about
//   the sea.
// · the five CRACKS are 2-thick strokes across the hull at x 166, 194, 222, 250
//   and 278, each 22 long and rotated 62°, so they read as splits rather than
//   planking. They are the doubts, and they go out one at a time.
// · the WATERLINE is a 2-thick rule from x 128 to x 388 at y 384, with a wake of
//   three short strokes trailing left of the hull once she sails.
// · the VERDICT CARD is 116×44 at x 258, y 408…452, and its text is fixed. It is
//   the one thing in the scene the reader should notice NOT changing when the
//   ship arrives safely.
// · the ARRIVED MARK is a 2-thick tick 18 long at x 214, y 400 — small, because
//   the whole point is that it changes nothing.
// · the figure stands at x 54 and walks to 126; crown ~397. The hull begins at
//   x 150, so he stands on the quay to its left.
//
// Ink runs y 292 (the masthead) … y 500 (ground). BAND 286…512 = 226 — TOO TIGHT
// for H58, so the caption at y 240 is part of the composition rather than a label
// hanging above it, and the band is 234…512 = 278 with the 103-unit figure at 37%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const HULL_X = 150;
const HULL_Y = 322;
const HULL_W = 176;
const HULL_H = 62;
const WATER_Y = 384;

const CRACK_X = [166, 194, 222, 250, 278];

const CARD_X = 258;
const CARD_Y = 408;

const CAP_T = 240;
const FIG_X = 54;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const HULL = BEATS.map((b) => (b.hull ? 1 : 0));
const QUIET = BEATS.map((b) => b.quiet ?? 0);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const SAILED = BEATS.map((b) => (b.sailed ? 1 : 0));
const VERDICT = BEATS.map((b) => (b.verdict ? 1 : 0));
const SAFE = BEATS.map((b) => (b.safe ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology37'));

export default function Epistemology37Scene({ clock, bt, bi, dragPos }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(6);
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

    // ONE VALUE, TWO SOURCES. On the drag beat the reader's bar quiets the doubts;
    // everywhere else the script's own track does. The cracks are the same cracks.
    const quiet = LIVE_D[n] === 1 ? clamp01(dragPos.value) : carry(cv, 0, n, QUIET[p], QUIET[n], tr);

    return {
      fig: pose(figS, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      t,
      hullOn: carry(cv, 2, n, HULL[p], HULL[n], tr),
      // A HIGHER BAR MEANS MORE DOUBT SURVIVES. The rail runs from "a feeling will
      // do" to "survey every plank", so sliding RIGHT should leave the cracks in —
      // which is why this is 1 - quiet on the drag beat and quiet everywhere else,
      // where the script means "how many he has talked away".
      cracks: LIVE_D[n] === 1 ? quiet : 1 - quiet,
      sailedOn: carry(cv, 3, n, SAILED[p], SAILED[n], tr),
      verdictOn: carry(cv, 4, n, VERDICT[p], VERDICT[n], tr),
      safeOn: carry(cv, 5, n, SAFE[p], SAFE[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const hullStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.hullOn }));
  const wakeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.sailedOn }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.verdictOn }));
  const safeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.safeOn }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>FIVE REASONS TO DOUBT HER</Text>

      <Animated.View style={[StyleSheet.absoluteFill, hullStyle]} pointerEvents="none">
        <View style={styles.water} />
        <View style={styles.hull} />
        <View style={styles.deck} />
        <View style={styles.mast} />
        {CRACK_X.map((cx, k) => <Crack key={cx} S={SCENE} left={cx} index={k} />)}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, wakeStyle]} pointerEvents="none">
        {[0, 14, 28].map((w) => (
          <View key={w} style={[styles.wake, { left: HULL_X - 18 - w }]} />
        ))}
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, safeStyle]} pointerEvents="none">
        <View style={styles.tick} />
        <View style={styles.tickTail} />
        <Text style={styles.tickLabel}>ARRIVED</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, cardStyle]} pointerEvents="none">
        <View style={styles.card} />
        <Text style={styles.cardText}>HAD NO RIGHT{'\n'}TO BELIEVE IT</Text>
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/** One doubt. Fades as it is talked away — the hull it is drawn on never alters. */
function Crack({ S, left, index }: { S: SharedValue<any>; left: number; index: number }) {
  const st = useAnimatedStyle(() => ({ opacity: clamp01(S.value.cracks * 5 - index) }));
  return <Animated.View style={[styles.crack, { left }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 150, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  water: { position: 'absolute', left: 128, top: WATER_Y, width: 260, height: 2, backgroundColor: INK },
  hull: {
    position: 'absolute', left: HULL_X, top: HULL_Y, width: HULL_W, height: HULL_H,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
  },
  deck: { position: 'absolute', left: HULL_X + 6, top: HULL_Y + 10, width: HULL_W - 12, height: 1.5, backgroundColor: SOFT },
  mast: { position: 'absolute', left: 236, top: 292, width: 3, height: 30, backgroundColor: INK },
  crack: {
    position: 'absolute', top: HULL_Y + 22, width: 2, height: 22,
    backgroundColor: INK, transform: [{ rotate: '62deg' }],
  },
  wake: { position: 'absolute', top: WATER_Y - 6, width: 10, height: 2, backgroundColor: SOFT },

  tick: { position: 'absolute', left: 214, top: 402, width: 3, height: 12, backgroundColor: INK, transform: [{ rotate: '-40deg' }] },
  tickTail: { position: 'absolute', left: 208, top: 406, width: 3, height: 7, backgroundColor: INK, transform: [{ rotate: '40deg' }] },
  tickLabel: {
    position: 'absolute', left: 178, top: 420, width: 68, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT, includeFontPadding: false,
  },

  card: {
    position: 'absolute', left: CARD_X, top: CARD_Y, width: 116, height: 44,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  cardText: {
    position: 'absolute', left: CARD_X, top: CARD_Y + 11, width: 116, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },
});

export function Epistemology37Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology37Scene} band={[234, 512]} camera={CAM} />;
}
