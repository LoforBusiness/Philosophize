import {
  View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, lerp, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology37Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';
import ObjectArt from './ObjectArt';
import { ship } from './objects';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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
const HUSHED = BEATS.map((b) => b.hushed ?? 0);
const SAME = BEATS.map((b) => b.same ?? 0);
const WHOSE = BEATS.map((b) => b.whose ?? 0);
const BASE_TR = 0.85;

const HULL_X = 150;
const HULL_Y = 322;
const HULL_W = 176;
const HULL_H = 62;
// THE SHIP IS A DRAWING NOW (group AM). Its masthead was at 292 and its hull foot at
// HULL_Y + HULL_H; `objects.ship` puts those at 8% and 90% of its own box, which
// fixes the box without choosing anything.
const E37_MAST_TOP = 292;
const E37_SHIP_H = (HULL_Y + HULL_H - E37_MAST_TOP) / 0.82;
const E37_SHIP_CY = E37_MAST_TOP - 0.08 * E37_SHIP_H + E37_SHIP_H / 2;
const WATER_Y = 384;

const CRACK_X = [166, 194, 222, 250, 278];

const CARD_X = 258;
const CARD_Y = 408;

const CAP_T = 240;
const FIG_X = 54;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const HULL = BEATS.map((b) => (b.hull ? 1 : 0));
const QUIET = BEATS.map((b) => b.quiet ?? 0);
const LIVE_D = BEATS.map((b) => (b.live_d ? 1 : 0));
const SAILED = BEATS.map((b) => (b.sailed ? 1 : 0));
const VERDICT = BEATS.map((b) => (b.verdict ? 1 : 0));
const SAFE = BEATS.map((b) => (b.safe ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology37'));

export default function Epistemology37Scene({ clock, bt, bi, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(9);
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
      fig: lookPose(figS, carry(cv, 1, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      t,
      hullOn: carry(cv, 2, n, HULL[p], HULL[n], tr),
      // ── SHE FLOATS ────────────────────────────────────────────────────────
      //
      // The hull sat on a 260x2 line without moving, so between taps this was a
      // photograph of a boat rather than a boat. Two slow sines on the monotonic
      // clock — never on `bt`, which resets every beat and would restart the
      // rocking on every tap (L1) — and their periods are deliberately coprime
      // (7.4s and 10.1s) so the pair never repeats inside a lesson.
      bob: Math.sin(t * 0.85) * 2.4,
      roll: Math.sin(t * 0.62) * 0.9,
      // A HIGHER BAR MEANS MORE DOUBT SURVIVES. The rail runs from "a feeling will
      // do" to "survey every plank", so sliding RIGHT should leave the cracks in —
      // which is why this is 1 - quiet on the drag beat and quiet everywhere else,
      // where the script means "how many he has talked away".
      cracks: LIVE_D[n] === 1 ? quiet : 1 - quiet,
      sailedOn: carry(cv, 3, n, SAILED[p], SAILED[n], tr),
      verdictOn: carry(cv, 4, n, VERDICT[p], VERDICT[n], tr),
      safeOn: carry(cv, 5, n, SAFE[p], SAFE[n], tr),
      // The three tap events, carried, so each fades out as well as in (group L).
      hushed: carry(cv, 6, n, HUSHED[p], HUSHED[n], tr),
      same: carry(cv, 7, n, SAME[p], SAME[n], tr),
      whose: carry(cv, 8, n, WHOSE[p], WHOSE[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const hullStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.hullOn }));
  // THE ORIGIN HAS TO BE THE SHIP, NOT THE STAGE. This rides an absoluteFill, so
  // a bare rotate would swing the hull about the middle of the 400x560 design
  // space and throw it off the water.
  const shipStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: SCENE.value.bob }, { rotate: `${SCENE.value.roll}deg` }],
  }));
  const wakeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.sailedOn }));
  const cardStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.verdictOn }));
  const safeStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.safeOn }));

  // ── the three tap events ───────────────────────────────────────────────────
  //
  // ONE AT A TIME IS THE SENTENCE, so the five strikes go on in order across the
  // five cracks: five at once would be a man who dismissed his doubts, and what
  // he did was put them down one after another (AH5).
  const hushAt = (u: number, k: number) => {
    'worklet';
    return (u <= 0 ? 0 : clamp01((u - k * 0.15) / 0.26));
  };
  const hush0 = useAnimatedStyle(() => ({ opacity: hushAt(SCENE.value.hushed, 0) }));
  const hush1 = useAnimatedStyle(() => ({ opacity: hushAt(SCENE.value.hushed, 1) }));
  const hush2 = useAnimatedStyle(() => ({ opacity: hushAt(SCENE.value.hushed, 2) }));
  const hush3 = useAnimatedStyle(() => ({ opacity: hushAt(SCENE.value.hushed, 3) }));
  const hush4 = useAnimatedStyle(() => ({ opacity: hushAt(SCENE.value.hushed, 4) }));
  const hushStyles = [hush0, hush1, hush2, hush3, hush4];
  // After the crossing the hull is the hull it was, and the point is that nothing
  // about it moved — so the mark is a measurement, not a change.
  const sameStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.same,
    transform: [{ scaleX: SCENE.value.same }],
  }));
  const sameCapStyle = useAnimatedStyle(() => ({ opacity: clamp01((SCENE.value.same - 0.5) / 0.5) }));
  const whoseStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.whose,
    transform: [{ translateY: (1 - SCENE.value.whose) * 8 }],
  }));

  return (
    <View style={styles.scene}>
      <Text style={styles.cap}>FIVE REASONS TO DOUBT HER</Text>

      <Animated.View style={[StyleSheet.absoluteFill, hullStyle]} pointerEvents="none">
        <View style={styles.water} />
        <Animated.View style={[styles.ship, shipStyle]}>
          <ObjectArt parts={ship(HULL_X + HULL_W / 2, E37_SHIP_CY, HULL_W / 0.88, E37_SHIP_H)} tone={TONE} />
          <View style={styles.deck} />
          {CRACK_X.map((cx, k) => <Crack key={cx} S={SCENE} left={cx} index={k} />)}
        </Animated.View>
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

      {/* He put each doubt down, one after another. */}
      {CRACK_X.map((cx, k) => (
        <Animated.View key={`hu${k}`} style={[styles.hushMark, { left: cx - 7 }, hushStyles[k]]} pointerEvents="none" />
      ))}

      {/* And the hull that came back is the hull that went out. */}
      <Animated.View style={[styles.sameRule, sameStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.sameCap, sameCapStyle]} pointerEvents="none">THE SAME CRACKS</Animated.Text>

      {/* Whose risk it was. */}
      <Animated.View style={[styles.whosePlate, whoseStyle]} pointerEvents="none">
        <Text style={styles.whoseText} numberOfLines={1}>THEIR RISK, NOT HIS</Text>
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
  // ── the three tap events (group AH) ────────────────────────────────────────
  // A SMALL CROSS ON EACH CRACK, at the crack's own x: the doubts are the cracks,
  // and a doubt put down is one struck out rather than one removed.
  hushMark: {
    position: 'absolute', top: HULL_Y + HULL_H / 2 - 7, width: 14, height: 3,
    backgroundColor: INK, borderRadius: 1.5, transform: [{ rotate: '45deg' }],
  },
  // Across the hull's own width, above it, with the caption over the rule.
  sameRule: {
    position: 'absolute', left: HULL_X, top: HULL_Y - 14, width: HULL_W, height: 2,
    borderTopWidth: 2, borderColor: INK, borderStyle: 'dashed',
    transformOrigin: '0% 50%',
  },
  sameCap: {
    position: 'absolute', left: HULL_X, top: HULL_Y - 32, width: HULL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK,
    includeFontPadding: false,
  },
  // Below the water line, clear of the verdict card at CARD_X / CARD_Y.
  whosePlate: {
    position: 'absolute', left: 86, top: CARD_Y + 44, width: 160, height: 24,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  whoseText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: PAPER,
    includeFontPadding: false,
  },

  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 150, top: CAP_T, width: 240,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.5, color: SOFT, includeFontPadding: false,
  },

  water: { position: 'absolute', left: 128, top: WATER_Y, width: 260, height: 2, backgroundColor: INK },
  /** Everything that floats, pivoting about the waterline amidships. */
  ship: {
    position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H,
    transformOrigin: `${HULL_X + HULL_W / 2}px ${WATER_Y}px`,
  },
  deck: { position: 'absolute', left: HULL_X + 6, top: HULL_Y + 10, width: HULL_W - 12, height: 1.5, backgroundColor: SOFT },
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
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE, boxShadow: LIP,
  },
  cardText: {
    position: 'absolute', left: CARD_X, top: CARD_Y + 11, width: 116, textAlign: 'center', lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },
});

export function Epistemology37Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Epistemology37Scene} band={[234, 512]} camera={CAM} />;
}
