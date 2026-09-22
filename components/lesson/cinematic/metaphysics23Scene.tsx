import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { dirsFrom, clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics23Script';
import { facing, GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, useCarry, carry, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerRise } from './Target';
import { followMoves, kindOf, seedOf } from './camera';
import ObjectArt from './ObjectArt';
import { ship } from './objects';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('metaphysics');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)

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

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const HULL_Y = 318;
const HULL_H = 38;
const HULL_W = 130;
const L_HULL = 40;
const R_HULL = 230;

const PLANK_H = 4.5;

const MAST_TOP = 244;

// THE SHIP IS A DRAWING NOW, not a box with a rule and a stamp on it (group AM).
// `objects.ship` is built to a boat plan's own construction — a shallow hull whose
// sides fall inward, a rig taller than the hull is long, two sails with the mast
// between them. What it replaced was a rounded rectangle, a 3-unit vertical line and
// a second rounded rectangle.
//
// The box below is derived from the constants above rather than picked, so the new
// drawing lands where the old one stood: the drawing's mast head is at 8% of its box
// and its hull foot at 90%, and the hull's widest course spans 6%…94%.
const SHIP_H = (HULL_Y + HULL_H - MAST_TOP) / 0.82;
const SHIP_W = HULL_W / 0.88;
const SHIP_CY = MAST_TOP - 0.08 * SHIP_H + SHIP_H / 2;
const shipAt = (hullLeft: number) => ship(hullLeft + HULL_W / 2, SHIP_CY, SHIP_W, SHIP_H);

// WHERE THE HULL ACTUALLY IS, read off the same drawing. `objects.ship` puts the
// hull's deck at 68% of its box and its foot at 90%, and the hull's courses run from
// 88% of the box's width at the deck to 58% at the keel.
const SHIP_TOP = SHIP_CY - SHIP_H / 2;
const HULL_TOP = SHIP_TOP + 0.68 * SHIP_H;
const HULL_FOOT = SHIP_TOP + 0.90 * SHIP_H;
const PLANK_N = 5;
/** Five courses of planking, evenly inside the hull rather than over its edges. */
const PLANK_Y = Array.from({ length: PLANK_N }, (_, k) => (
  HULL_TOP + 4 + ((HULL_FOOT - HULL_TOP - 8 - PLANK_H) * k) / (PLANK_N - 1)
));
/**
 * A PLANK IS AS WIDE AS THE HULL IS AT ITS OWN HEIGHT. The drawn hull's sides fall
 * inward — that taper is what separates a boat from a bucket — so one width for all
 * five put the lowest course out through the planking on both sides.
 */
const plankW = (k: number) => {
  const t = (PLANK_Y[k] + PLANK_H / 2 - HULL_TOP) / (HULL_FOOT - HULL_TOP);
  return (0.88 + (0.58 - 0.88) * t) * SHIP_W - 10;
};

const LABEL_Y = 360;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
// WHICH WAY HE IS POINTING, read off the same x track he walks along:
// +1 where it rises, -1 where it falls, and HOLD while he stands still, so a
// figure who walks left to something keeps facing it while he talks about it.
const DIR = dirsFrom(X, 1);
const P = BEATS.map((b) => b.p ?? 0);
const SHIPS = BEATS.map((b) => b.ships ?? 0);
const SWAP = BEATS.map((b) => b.swap ?? 0);
const BUILT = BEATS.map((b) => b.built ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);
const CRIT = BEATS.map((b) => b.crit ?? 0);
const DEEP = BEATS.map((b) => b.deep ?? 0);
const PILE = BEATS.map((b) => b.pile ?? 0);

// The empty gap between the hulls (170…230) is where the puzzle's abstract
// half is drawn — never a third ship, only a question and, once, a heap (A1).
const GAP_CX = (L_HULL + HULL_W + R_HULL) / 2;
const PILE_BARS = [
  { dx: -14, dy: -3, rot: '-16deg' },
  { dx: -3, dy: 5, rot: '9deg' },
  { dx: 10, dy: 0, rot: '-6deg' },
];

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics23'));

// R7c — LEFT STILL ON PURPOSE: the plot rates the repaired ship as planks are replaced, and
// the planks already moved (`swap`) are the plot's x axis, not its answer. The rating cannot
// be drawn on a hull: the puzzle dies the moment one hull looks more like a ship than the
// other, which is this scene's first rule.
export default function Metaphysics23Scene({ clock, bt, bi, i, picked, onPick, gazeX, gazeY, gazeOn }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(7);
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
      ships: carry(cv, 1, n, SHIPS[p], SHIPS[n], tr),
      swap: carry(cv, 2, n, SWAP[p], SWAP[n], tr),
      built: carry(cv, 3, n, BUILT[p], BUILT[n], tr),
      t,
      crit: carry(cv, 4, n, CRIT[p], CRIT[n], tr),
      deep: carry(cv, 5, n, DEEP[p], DEEP[n], tr),
      pile: carry(cv, 6, n, PILE[p], PILE[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const shipStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.ships }));
  const builtStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.built }));
  const critStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.crit }));
  const deepStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.deep }));
  const pileStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pile }));

  const planks = [0, 1, 2, 3, 4];

  // THE REASSEMBLED SHIP IS THE ANSWER, and this wrapper holds exactly it (E39).
  const builtRise = useAnswerRise(picked, 'reassembled', true);

  return (
    <View style={styles.scene}>
      <View style={styles.floor} pointerEvents="none" />
      <Animated.View style={[StyleSheet.absoluteFill, shipStyle]} pointerEvents="none">
        <ObjectArt parts={shipAt(L_HULL)} tone={TONE} />
        <Text style={[styles.label, { left: L_HULL }]}>REPAIRED</Text>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, builtStyle, builtRise]} pointerEvents="none">
        <ObjectArt parts={shipAt(R_HULL)} tone={TONE} />
        <Text style={[styles.label, { left: R_HULL }]}>REASSEMBLED</Text>
        {/* THE PLANKS RIDE WITH THE HULL THEY ARE IN (E39). They were drawn outside
            this wrapper, so answering lifted the hull off its own cargo — measured
            in the render as five things standing still while two rose. */}
        {planks.map((k) => <Plank key={`r${k}`} S={SCENE} k={k} left={R_HULL + 6} old={false} />)}
      </Animated.View>

      {/* One number, two hulls: what empties on the left fills on the right. */}
      {planks.map((k) => <Plank key={`l${k}`} S={SCENE} k={k} left={L_HULL + 6} old />)}

      {/* THE TWO TESTS, NAMED ON THE HULL EACH ONE FAVOURS (A1). */}
      <Animated.Text style={[styles.critTag, { left: L_HULL }, critStyle]} numberOfLines={1}>CONTINUITY</Animated.Text>
      <Animated.Text style={[styles.critTag, { left: R_HULL }, critStyle]} numberOfLines={1}>MATERIAL</Animated.Text>

      {/* THE DEEPER QUESTION, HANGING OVER THE EMPTY GAP — never a third ship. */}
      <Animated.Text style={[styles.deepTag, deepStyle]} numberOfLines={1}>A WHOLE?</Animated.Text>

      {/* A HEAP OF THE SAME BARS, LOOSE RATHER THAN SHAPED INTO A HULL (A1). */}
      <Animated.View style={[StyleSheet.absoluteFill, pileStyle]} pointerEvents="none">
        {PILE_BARS.map((b, k) => (
          <View key={k} style={[styles.pileBar, { left: GAP_CX + b.dx - 13, top: 378 + b.dy, transform: [{ rotate: b.rot }] }]} />
        ))}
      </Animated.View>

      <Target
        id="repaired" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: L_HULL, width: HULL_W }]}
      >
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: HULL_W }, answered && picked === 'repaired' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="gap" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: 176, width: 48 }]}
      >
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: 48 }, answered && picked === 'gap' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="reassembled" sealAt="tr" correct picked={picked} onPick={onPick}
        disabled={!live || answered}
        style={[styles.hit, { left: R_HULL, width: HULL_W }]}
      >
        <View style={[styles.hitBox, live && !answered && styles.hitLive, { width: HULL_W }, answered && styles.right]} pointerEvents="none" />
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
  const w = plankW(k);
  return <Animated.View pointerEvents="none" style={[styles.plank, { top: PLANK_Y[k], left: left + (HULL_W - w) / 2 - 6, width: w }, st]} />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: floorStyle(TONE, GROUND),

  plank: {
    position: 'absolute', height: PLANK_H, backgroundColor: INK, borderRadius: 1.5,
  },
  label: {
    position: 'absolute', top: LABEL_Y, width: HULL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },

  // The verdict each test hands to its own hull — under the hull's own label.
  critTag: {
    position: 'absolute', top: LABEL_Y + 11, width: HULL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.6, color: INK, includeFontPadding: false,
  },
  deepTag: {
    position: 'absolute', left: GAP_CX - 30, top: 254, width: 60, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
  pileBar: { position: 'absolute', width: 26, height: 3.5, backgroundColor: INK, borderRadius: 1.5 },

  hit: { position: 'absolute', top: HULL_Y, height: HULL_H },
  hitBox: { height: HULL_H, borderRadius: 6 },
  /** WHAT "TAP ONE OF THESE" LOOKS LIKE WHILE THE QUESTION IS OPEN.
   *
   * These hit boxes took a border only once the answer was IN, so up to that moment
   * the reader was choosing between regions with no edges — the complaint exactly:
   * "blank boxes that you cannot read so it is a guess for which one to press". The
   * outline says where the choices are; the picture under each one says what it is.
   */
  hitLive: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed' },
});

export function Metaphysics23Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics23Scene} band={[238, 512]} camera={CAM} />;
}
