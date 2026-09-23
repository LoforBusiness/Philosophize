import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, lerp, mixStance, pose, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology34Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import { followMoves, kindOf, seedOf } from './camera';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('epistemology');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

// TWO BARS, AND ONLY ONE OF THEM OBEYS THE READER.
//
// The left bar is the claim and tracks the knob exactly. The right bar is the hit
// rate and is deliberately CONCAVE — it keeps up early and gives up near the top,
// which is the shape of the overconfidence effect and the whole point of the
// picture. `holds()` is the curve, written once and used by both the bar and the
// gap bracket so they can never disagree.
//
// · both bars are 46 wide, growing up from the ground line: the claim at x 168…214
//   and the hit rate at x 240…286. Full height is 250, so a bar at 1 has its top
//   edge at y 250.
// · the gap bracket spans the two tops at x 214…240 and is drawn only when the
//   script asks for it; it is never taller than the claim bar.
// · the caption sits at y 344…358 above both bars.
// · the figure stands at x 54 facing right and reaches x 87, eighty-one clear of
//   the left bar.
//
// Ink runs from the caption (226) to the ground line (500). Band 220…512 = 292 (H59).

const BAR_W = 46;
const BAR_H = 250;
const CLAIM_L = 168;
const HOLD_L = 240;
const CAP_T = 226;
const FIG_X = 54;

/**
 * How often a claim at confidence `c` actually holds — the concave curve.
 *
 * Deliberately not a straight line and not a guess at real data either: it tracks
 * the shape the effect has (honest low down, opening up top) and bottoms out at
 * 0.5, because a claim you are making at all is at least a coin flip.
 */
function holds(c: number) {
  'worklet';
  return 0.5 + 0.5 * (c <= 0 ? 0 : Math.pow(c, 2.1)) * 0.62 + 0.5 * c * 0.38;
}

const CLAIM = BEATS.map((b) => b.claim ?? 0);
const GAP = BEATS.map((b) => b.gap ?? 0);
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? FIG_X);
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology34'));

// group AH — one event per still tap.
const HOLD_SLOT = BEATS.map((b) => ((b.holdSlot ?? 0) > 0 ? 1 : 0));
const NOTE = BEATS.map((b) => ((b.note ?? 0) > 0 ? 1 : 0));
const GAP_LBL = BEATS.map((b) => ((b.gapLbl ?? 0) > 0 ? 1 : 0));
const TARGET = BEATS.map((b) => ((b.target ?? 0) > 0 ? 1 : 0));
const EXAMPLE = BEATS.map((b) => ((b.example ?? 0) > 0 ? 1 : 0));

export default function Epistemology34Scene({ clock, bt, bi, i, dragPos, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(7);
  const live = (BEATS[i].live ?? 0) > 0;
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;
  // group AH — each flag fires only on the beat that CHANGES its own channel
  // (C20c), so a beat that merely holds a value re-draws nothing.
  const holdSlotFade = (cur.holdSlot ?? 0) !== (prev?.holdSlot ?? 0);
  const noteFade = (cur.note ?? 0) !== (prev?.note ?? 0);
  const gapLblFade = (cur.gapLbl ?? 0) !== (prev?.gapLbl ?? 0);
  const targetFade = (cur.target ?? 0) !== (prev?.target ?? 0);
  const exampleFade = (cur.example ?? 0) !== (prev?.example ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.7);
    const t = clock.value;
    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P[p], t)), emoteLive(P[n], t, bt.value), tr));
    const grow = ease01(bt.value / 1.0);
    const c = live ? pickPos.value : carry(cv, 0, n, CLAIM[p], CLAIM[n], grow);
    return {
      fig: lookPose(s, FIG_X, GROUND, K_FIG, 1, 1, gazeX.value, gazeY.value, gazeOn.value),
      claim: c,
      // Normalised so a coin flip sits at the bottom of the bar rather than
      // halfway up it — the reader is watching the GAP, not the absolute rate.
      hold: (holds(c) - 0.5) * 2,
      gap: carry(cv, 1, n, GAP[p], GAP[n], tr),
      // group AH — one event per still tap:
      //  · holdSlot  a dashed outline marks the still-empty right column (beat 1)
      //  · note      a small dot marks the still-small gap (beat 3)
      //  · gapLbl    the gap is named: overconfidence (beat 5)
      //  · target    a dashed line at claim's own height, where hold falls short (beat 6)
      //  · example   two matching mini-bars: a calibrated case (beat 7)
      holdSlotOn: carry(cv, 2, n, HOLD_SLOT[p], HOLD_SLOT[n], holdSlotFade ? grow : 1),
      noteOn: carry(cv, 3, n, NOTE[p], NOTE[n], noteFade ? grow : 1),
      gapLblOn: carry(cv, 4, n, GAP_LBL[p], GAP_LBL[n], gapLblFade ? grow : 1),
      targetOn: carry(cv, 5, n, TARGET[p], TARGET[n], targetFade ? grow : 1),
      exampleOn: carry(cv, 6, n, EXAMPLE[p], EXAMPLE[n], exampleFade ? grow : 1),
    };
  });

  const D = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const claimStyle = useAnimatedStyle(() => ({ height: BAR_H * SCENE.value.claim }));
  const holdStyle = useAnimatedStyle(() => ({ height: BAR_H * SCENE.value.hold }));
  const gapStyle = useAnimatedStyle(() => {
    const top = GROUND - BAR_H * SCENE.value.claim;
    const bot = GROUND - BAR_H * SCENE.value.hold;
    return { opacity: SCENE.value.gap, top, height: bot - top < 0 ? 0 : bot - top };
  });
  const holdSlotStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.holdSlotOn }));
  const noteStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.noteOn }));
  const gapLblStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.gapLblOn }));
  const targetStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.targetOn }));
  const exampleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.exampleOn }));

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Text style={styles.kicker} numberOfLines={2}>WHAT YOU SAY   ·   WHAT HOLDS</Text>

      <Animated.View style={[styles.claim, claimStyle]} pointerEvents="none" />
      <Animated.View style={[styles.hold, holdStyle]} pointerEvents="none" />
      <Animated.View style={[styles.gap, gapStyle]} pointerEvents="none" />

      {/* group AH — one event per still tap (see the SCENE comment above). */}
      <Animated.View style={[styles.holdSlot, holdSlotStyle]} pointerEvents="none" />
      <Animated.View style={[styles.note, noteStyle]} pointerEvents="none" />
      <Animated.Text style={[styles.gapLbl, gapLblStyle]} pointerEvents="none">OVERCONFIDENCE</Animated.Text>
      <Animated.View style={[styles.target, targetStyle]} pointerEvents="none" />
      <Animated.View style={[styles.exampleBar, styles.exampleBarA, exampleStyle]} pointerEvents="none" />
      <Animated.View style={[styles.exampleBar, styles.exampleBarB, exampleStyle]} pointerEvents="none" />

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={D} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  kicker: {
    position: 'absolute', left: 130, top: CAP_T, width: 200,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, color: SOFT,
    textAlign: 'center', includeFontPadding: false,
  },

  // Both grow UP from the ground line, so `bottom` is pinned and `height` animates.
  claim: { position: 'absolute', left: CLAIM_L, bottom: STAGE_H - GROUND, width: BAR_W, backgroundColor: INK },
  hold: {
    position: 'absolute', left: HOLD_L, bottom: STAGE_H - GROUND, width: BAR_W,
    borderWidth: 2, borderColor: INK, backgroundColor: STONE, boxShadow: LIP,
  },
  // The space between the two tops — a dashed bracket, never a second colour (§19).
  gap: {
    position: 'absolute', left: CLAIM_L + BAR_W, width: HOLD_L - CLAIM_L - BAR_W,
    borderTopWidth: 2, borderBottomWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },

  // ── group AH: one event per still tap ──────────────────────────────────────
  //
  // The dashed outline of the still-empty right column: this is where the hold
  // bar will grow. A boundary, never a fill (D31).
  holdSlot: {
    position: 'absolute', left: HOLD_L, top: GROUND - BAR_H, width: BAR_W, height: BAR_H,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed',
  },
  // A small dot marking the still-small gap between the two bar tops at claim 0.3.
  note: { position: 'absolute', left: 224, top: 439, width: 6, height: 6, borderRadius: 3, backgroundColor: SOFT },
  // The gap's own name, set beside the columns rather than over them — there is
  // no room above the bars without crossing the kicker (D34, D35).
  gapLbl: {
    position: 'absolute', left: 292, top: 258, width: 104, lineHeight: 11,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  // A dashed line at the claim bar's own height, run across the hold column: this
  // is how far the hold bar would need to reach to match it.
  target: {
    position: 'absolute', left: HOLD_L, top: GROUND - BAR_H * 0.95, width: BAR_W,
    height: 2, borderTopWidth: 2, borderColor: SOFT, borderStyle: 'dashed',
  },
  // Two small bars of equal height: a calibrated case, drawn beside the figure
  // rather than replacing the pair on stage (which stays at the certain claim).
  exampleBar: { position: 'absolute', bottom: STAGE_H - GROUND, width: 14, height: 36, backgroundColor: INK },
  exampleBarA: { left: 134 },
  exampleBarB: { left: 150 },
});

export function Epistemology34Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology34Scene} band={[220, 512]} camera={CAM} />;
}
