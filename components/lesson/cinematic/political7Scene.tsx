import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, lerp, moveTr, pose, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './political7Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry, pickAt, lookPose,
} from './cinematicKit';
import { stageTone } from './stageTones';
import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target, { useAnswerLiftValues } from './Target';

// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).
// Same three tones, same luminance to the third decimal — so every contrast
// measured against the old greys still holds and nothing on the stage moved.
const TONE = stageTone('political-philosophy');
const { RULE, STONE, SHADE } = TONE;
const LIP = lipOf(TONE);   // the ledge a raised plate stands on (./stageSkin)

// TWO SOURCES for the same right, facing each other across the stage:
//   · stage LEFT  — a STONE TABLET, half-buried, "SPEAK YOUR MIND" chiselled into it
//   · stage RIGHT — a PAPER CHARTER hung from a rail, same words, signed and sealed
// A law can tear the paper. It cannot move the stone — which is the whole lesson,
// so the tear (two clipped halves swinging apart) is the money shot on beat 6.
//
// ── COMPOSITION / OCCLUSION ─────────────────────────────────────────────────
// The figure only ever stands at x = 190 (beside the stone), 262 (mid) or 330
// (under the charter), and never walks left of 190. Its widest gesture reaches
// about ±48 stage units, so its body sweeps x 142…378 and y 361…500. Therefore:
//   · the STONE (x 6…128, y 350…502) is TALL — it lives in the figure's vertical
//     band — so it is kept entirely LEFT of x = 128, a 14-unit gap from the
//     figure's leftmost reach of 142. The dirt mounds at its base stop at x = 134.
//   · the CHARTER (x 240…388) hangs ENTIRELY ABOVE y = 350: its rail sits at
//     y = 154 and its lowest edge at y = 334, so even fully torn — the halves drop
//     5px and rotate ~7° — nothing descends past y ≈ 348, clear of the crown at 361.
//   · the Q1 caption sits at y = 104, above everything.
// The 1.5px ground rule is the floor itself and passes under the feet by design.

// ── the stone, stage left ────────────────────────────────────────────────────
const STONE_L = 6;
const STONE_W = 122;
const STONE_T = 350;
const STONE_H = 152;                    // runs 2px past the ground line, so it has no visible foot

// ── the charter, stage right ─────────────────────────────────────────────────
const CH_L = 240;
const CH_W = 148;
const CH_T = 178;
const CH_H = 156;
const CH_HALF = CH_W / 2;               // the tear runs straight down the middle
const RAIL_Y = 154;

const CLAIM = BEATS.map((b) => b.claim ?? 0);
const BEFORE = BEATS.map((b) => b.before ?? 0);
const PROTECT = BEATS.map((b) => b.protect ?? 0);
const WISH = BEATS.map((b) => b.wish ?? 0);
const LAW = BEATS.map((b) => b.law ?? 0);
const CHIP = BEATS.map((b) => b.chip ?? 0);
const STANDS = BEATS.map((b) => b.stands ?? 0);
const REASON = BEATS.map((b) => b.reason ?? 0);

// ── where the opening pair sits ──────────────────────────────────────────────
// Beats 1–2 are the only ones with a bare stage: the stone arrives on 3 and the
// charter on 5, so the middle of the picture is free and the pair is struck there.
// ONE CARD, TWO PLACES. The right is drawn once and travels, because the question
// those two beats ask is about the same right in two different stories — a second
// card would be a second right.
const CARD_W = 100;
const CARD_GRANTED_L = 150;      // under the GOVERNMENT plate
const CARD_BEFORE_L = 60;        // left of the rule marked THE VOTE at x 178
const CARD_T = 254;
const VOTE_X = 178;
const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 262);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('political7'));
const DIR = dirsFrom(X, 1);

// R7c — the stage follows the sort on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.sort ? 1 : 0));

// HOW FAR THE CHARTER COMES FORWARD, in the SORT'S OWN ORDER (never the shuffled
// bin order — see SceneApi.pickPos): nothing troubling · custom corrects it · no
// right violated. The first and last are claims about what LAW does to a right
// ("law settles every right", "no law could ever violate a right"), and the law
// on this stage is the charter a law has just torn, so it comes forward for both.
// The middle one's subject is custom, which nothing here draws, and it is also
// where the chip rests before the reader moves it — so it moves nothing. The
// stone never reacts: that it does not move is the whole lesson.
const CHARTER_AT = [1, 0, 1];
/** The charter's own centre, which it comes forward about. */
const CH_MID_X = CH_L + CH_W / 2;
const CH_MID_Y = CH_T + CH_H / 2;

export default function Political7Scene({ clock, bt, bi, i, picked, onPick, pickPos, gazeX, gazeY, gazeOn }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(10);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // A prop only fades in on the beat that CHANGES it; otherwise it stays solid, so
  // the stage doesn't re-animate every time the reader taps forward.
  const stoneOn = (cur.stone ?? 0) > 0;
  const stoneFade = (cur.stone ?? 0) !== (prev?.stone ?? 0);
  const charterOn = (cur.charter ?? 0) > 0;
  const charterFade = (cur.charter ?? 0) !== (prev?.charter ?? 0);
  const tearOn = (cur.tear ?? 0) > 0;
  const tearFade = (cur.tear ?? 0) !== (prev?.tear ?? 0);

  // `picked` is reused by the deck's A/B/C/D question later on, so the scene's
  // answered styling is scoped to the beat that actually owns the scene question.
  const qOn = (cur.pick ?? 0) > 0 && !!cur.interact;
  const answered = qOn && picked !== null;
  const stoneRight = answered;                       // the stone is the correct source
  const charterDim = answered && picked === 'paper';

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    // WALK is passed EXPLICITLY: a Gait left to a default parameter is not captured
    // into the worklet runtime and hard-crashes the screen.
    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: lookPose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1, gazeX.value, gazeY.value, gazeOn.value),
      stone: stoneOn ? (stoneFade ? grow : 1) : 0,
      charter: charterOn ? (charterFade ? grow : 1) : 0,
      tear: tearOn ? (tearFade ? grow : 1) : 0,
      // R7c — the charter comes forward while the chip sits on a conclusion about
      // what law does, and settles back everywhere else (CHARTER_AT).
      near: carry(cv, 1, n, 0, reacting ? pickAt(CHARTER_AT, pickPos.value) : 0, grow),
      // The eight tap events, carried, so each fades out as well as in (group L).
      claim: carry(cv, 2, n, CLAIM[p], CLAIM[n], grow),
      before: carry(cv, 3, n, BEFORE[p], BEFORE[n], grow),
      protect: carry(cv, 4, n, PROTECT[p], PROTECT[n], grow),
      wish: carry(cv, 5, n, WISH[p], WISH[n], grow),
      law: carry(cv, 6, n, LAW[p], LAW[n], grow),
      chip: carry(cv, 7, n, CHIP[p], CHIP[n], grow),
      stands: carry(cv, 8, n, STANDS[p], STANDS[n], grow),
      reason: carry(cv, 9, n, REASON[p], REASON[n], grow),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  // THE STONE IS THE ANSWER, SO THE STONE IS WHAT MOVES (E39).
  // Its Target is mounted only for the graded beat while the slab is drawn from
  // the first, so the art cannot live inside the Target — the lift is folded into
  // the transform this wrapper already carries instead. Answering used to move
  // nothing here at all: both targets were self-closing.
  const stoneLift = useAnswerLiftValues(picked, 'stone', true);
  const stoneStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.stone,
    transform: [
      { translateY: (1 - SCENE.value.stone) * 12 - 10 * stoneLift.lift.value },
      { scale: 1 + 0.06 * stoneLift.lift.value },
    ],
  }));
  const charterStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.charter,
    // Scaled about the charter's own centre (charterWrap's transformOrigin), so the
    // rail, the cords and both halves come forward together and nothing slides.
    // 4% keeps a fully torn corner above y ≈ 351, still clear of the crown at 361.
    transform: [{ translateY: (1 - SCENE.value.charter) * -12 }, { scale: 1 + 0.04 * SCENE.value.near }],
  }));
  // The two halves hinge apart. Kept small on purpose: at ±7° the lowest corner
  // still lands above y ≈ 348, so a torn charter can never cover the figure.
  // ── the eight tap events ───────────────────────────────────────────────────
  //
  // The plate and its arrow belong to the FIRST story only, so they leave as the
  // card travels: what the second beat says is that nothing handed it over.
  const grantStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.claim * (1 - SCENE.value.before),
  }));
  // One card, two places. It is present for either beat and its x is the story it
  // is in, so the reader watches the same right change hands rather than reappear.
  const cardStyle = useAnimatedStyle(() => {
    const on = Math.max(SCENE.value.claim, SCENE.value.before);
    return {
      opacity: on,
      left: CARD_GRANTED_L + (CARD_BEFORE_L - CARD_GRANTED_L) * SCENE.value.before,
      transform: [{ translateY: (1 - on) * -8 }],
    };
  });
  const voteStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.before }));

  // The bracket DRAWS DOWN over the stone's shoulders rather than fading: it is
  // being laid over something that was already there, which is the claim.
  const protectStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.protect,
    transform: [{ translateY: (1 - SCENE.value.protect) * -10 }],
  }));
  const wishStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.wish,
    transform: [{ scale: 0.94 + 0.06 * SCENE.value.wish }],
  }));
  // The law comes DOWN into the frame, the way an instrument is posted up, and its
  // stamp lands late and slightly large — struck onto the card, not printed with it.
  const lawStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.law,
    transform: [{ translateY: (1 - SCENE.value.law) * -14 }],
  }));
  const enactStyle = useAnimatedStyle(() => {
    const u = clamp01((SCENE.value.law - 0.55) / 0.45);
    return { opacity: u, transform: [{ rotate: '-6deg' }, { scale: 1.18 - 0.18 * u }] };
  });
  const chipStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chip }));
  // The rule under the caption draws out from the left, so the words are underwritten
  // rather than boxed.
  const standsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.stands }));
  const standsRuleStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.stands,
    transform: [{ scaleX: SCENE.value.stands }],
  }));
  const reasonStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.reason }));
  const reasonLeadStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.reason,
    transform: [{ scaleY: clamp01((SCENE.value.reason - 0.4) / 0.6) }],
  }));

  const halfLStyle = useAnimatedStyle(() => {
    const v = SCENE.value.tear;
    return { transform: [{ translateX: -13 * v }, { translateY: 5 * v }, { rotate: `${-6 * v}deg` }] };
  });
  const halfRStyle = useAnimatedStyle(() => {
    const v = SCENE.value.tear;
    return { transform: [{ translateX: 14 * v }, { translateY: 4 * v }, { rotate: `${7 * v}deg` }] };
  });

  return (
    <Animated.View style={styles.scene}>
      <View style={styles.ground} pointerEvents="none" />

      {/* ── the stone: chiselled, and sunk into the ground ───────────────────── */}
      <Animated.View style={[styles.stoneWrap, stoneStyle]} pointerEvents="none">
        <View style={[styles.slab, stoneRight && styles.slabOn]}>
          <Text style={[styles.stoneCap, stoneRight && styles.onText]}>NATURE</Text>
          <View style={[styles.capRule, stoneRight && styles.onLine]} />
          <Text style={[styles.carve, stoneRight && styles.onText]}>SPEAK</Text>
          <Text style={[styles.carve, stoneRight && styles.onText]}>YOUR MIND</Text>
          <View style={[styles.hatch, { width: 46 }, stoneRight && styles.onLine]} />
          <View style={[styles.hatch, { width: 34 }, stoneRight && styles.onLine]} />
          <View style={[styles.hatch, { width: 22 }, stoneRight && styles.onLine]} />
        </View>
        {/* earth piled against the base, so the slab reads as buried, not standing */}
        <View style={styles.moundL} />
        <View style={styles.moundR} />

        {/* A government can violate one: two wedges of the PAGE taken out of the
            slab's right edge. Inside this wrapper, so the chip cannot drift off the
            stone it was struck from. */}
        <Animated.View style={[styles.chipWrap, chipStyle]} pointerEvents="none">
          <View style={styles.chipA} />
          <View style={styles.chipB} />
        </Animated.View>
      </Animated.View>

      {/* ── the charter: hung from a rail, and tearable in two ───────────────── */}
      <Animated.View style={[styles.charterWrap, charterStyle]} pointerEvents="none">
        <View style={styles.rail} />
        <View style={styles.cordL} />
        <View style={styles.cordR} />

        <Animated.View style={[styles.halfL, halfLStyle]}>
          <View style={[styles.face, styles.faceL, charterDim && styles.faceDim]}>
            <CharterFace />
          </View>
          <TearEdge side="left" S={SCENE} />
        </Animated.View>

        <Animated.View style={[styles.halfR, halfRStyle]}>
          <View style={[styles.face, styles.faceR, charterDim && styles.faceDim]}>
            <CharterFace />
          </View>
          <TearEdge side="right" S={SCENE} />
        </Animated.View>
      </Animated.View>

      {/* Granted from above: a plate, an arrow, and the right handed down. */}
      <Animated.View style={[styles.grantWrap, grantStyle]} pointerEvents="none">
        <View style={styles.govPlate}>
          <Text style={styles.govText}>GOVERNMENT</Text>
        </View>
        <View style={styles.grantShaft} />
        <View style={styles.grantHead} />
      </Animated.View>

      {/* The vote, and the right standing on the far side of it. */}
      <Animated.View style={[styles.voteWrap, voteStyle]} pointerEvents="none">
        <View style={styles.voteRule} />
        <Text style={styles.voteText}>THE VOTE</Text>
      </Animated.View>
      <Animated.View style={[styles.rightCard, cardStyle]} pointerEvents="none">
        <Text style={styles.rightText}>YOUR RIGHT</Text>
      </Animated.View>

      {/* Protected, not granted: an open bracket laid over the stone's shoulders. */}
      <Animated.View style={[styles.protectWrap, protectStyle]} pointerEvents="none">
        <Text style={styles.protectText}>PROTECTED, NOT GRANTED</Text>
        <View style={styles.protectBracket} />
      </Animated.View>

      {/* The other view's verdict on the stone, written in a dashed hand. */}
      <Animated.View style={[styles.wishTag, wishStyle]} pointerEvents="none">
        <Text style={styles.wishText}>ONLY A WISH</Text>
      </Animated.View>

      {/* The law of the thought experiment, posted up and stamped. */}
      <Animated.View style={[styles.lawCard, lawStyle]} pointerEvents="none">
        <Text style={styles.lawText}>{'LAW: YOU MAY\nNOT SPEAK'}</Text>
      </Animated.View>
      <Animated.View style={[styles.enactStamp, enactStyle]} pointerEvents="none">
        <Text style={styles.enactText}>ENACTED</Text>
      </Animated.View>

      {/* What it never granted, it cannot take away. */}
      <Animated.View style={[styles.standsWrap, standsStyle]} pointerEvents="none">
        <Text style={styles.standsText}>CANNOT BE TAKEN AWAY</Text>
        <Animated.View style={[styles.standsRule, standsRuleStyle]} />
      </Animated.View>

      {/* Who the stone is for, on a leader down into it. */}
      <Animated.View style={[styles.reasonPlate, reasonStyle]} pointerEvents="none">
        <Text style={styles.reasonText}>WHOEVER REASONS</Text>
      </Animated.View>
      <Animated.View style={[styles.reasonLead, reasonLeadStyle]} pointerEvents="none" />

      {/* ── Q1: tap the source that survives the repeal ──────────────────────── */}
      {qOn && (
        <>
          <View style={styles.askWrap} pointerEvents="none">
            <Text style={styles.askLabel}>TAP THE SOURCE THAT SURVIVES</Text>
          </View>
          <Target id={'stone'} correct={true} picked={picked} onPick={onPick}
        style={styles.stoneHit}
            disabled={answered}
      />
          {/* LIFT-EXEMPT: paper — the charter is already dimmed by charterDim, and
              charterWrap is the full stage, so scaling it would slide the whole
              picture rather than the answer (E39). */}
          <Target id={'paper'} correct={false} picked={picked} onPick={onPick}
        style={styles.paperHit}
            disabled={answered}
      />
        </>
      )}

      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

// ── the charter's face, drawn twice ──────────────────────────────────────────
// Each half is a fixed-width window with `overflow: hidden` onto the SAME drawing,
// offset so the two windows reassemble into one sheet. Tearing is then just moving
// the windows apart — no second artwork, and the rip lands mid-sentence.
function CharterFace() {
  return (
    <>
      <Text style={styles.chCap}>OUR AGREEMENT</Text>
      <View style={styles.chRule} />
      <Text style={styles.chArticle}>ARTICLE I</Text>
      <Text style={styles.chBody}>{'You may speak\nyour mind.'}</Text>
      <View style={[styles.chLine, { width: 118 }]} />
      <View style={[styles.chLine, { width: 96, marginTop: 5 }]} />

      {/* signature, scribbled over its rule */}
      <View style={styles.sigWrap} pointerEvents="none">
        <View style={[styles.sigStroke, { left: 0, top: 4, width: 22, transform: [{ rotate: '-20deg' }] }]} />
        <View style={[styles.sigStroke, { left: 17, top: 9, width: 17, transform: [{ rotate: '24deg' }] }]} />
        <View style={[styles.sigStroke, { left: 31, top: 3, width: 21, transform: [{ rotate: '-14deg' }] }]} />
        <View style={styles.sigLine} />
        <Text style={styles.sigLabel}>SIGNED</Text>
      </View>

      {/* wax seal — lives right of the tear, so it stays with the right-hand piece */}
      <View style={styles.seal} pointerEvents="none">
        <View style={styles.sealDot} />
      </View>
    </>
  );
}

// ── the ragged edge, five CSS border-triangles per half ──────────────────────
function TearEdge({ side, S }: { side: 'left' | 'right'; S: SharedValue<any> }) {
  const tooth = side === 'left' ? styles.toothL : styles.toothR;
  const st = useAnimatedStyle(() => ({ opacity: S.value.tear }));
  return (
    <Animated.View style={[styles.tearWrap, st]} pointerEvents="none">
      {[8, 40, 70, 100, 128].map((top) => (
        <View key={top} style={[tooth, { top }]} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 8, right: 8, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── stone ──────────────────────────────────────────────────────────────────
  stoneWrap: { position: 'absolute', left: 0, top: STONE_T, width: 150, height: 160 },
  slab: {
    position: 'absolute', left: STONE_L, top: 0, width: STONE_W, height: STONE_H,
    borderWidth: 3, borderBottomWidth: 0, borderColor: INK,
    borderTopLeftRadius: 14, borderTopRightRadius: 5,
    backgroundColor: RULE, alignItems: 'center', paddingTop: 12,
  },
  slabOn: { backgroundColor: INK, borderColor: INK },
  stoneCap: { fontFamily: 'Inter_700Bold', fontSize: 12.5, letterSpacing: 2.4, color: INK,
    includeFontPadding: false,
  },
  capRule: { width: 46, height: 1.5, backgroundColor: SOFT, marginTop: 7 },
  carve: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1, lineHeight: 20, color: INK, marginTop: 6,
    includeFontPadding: false,
  },
  hatch: { height: 2.5, backgroundColor: SOFT, marginTop: 8, borderRadius: 1 },
  onText: { color: PAPER },
  onLine: { backgroundColor: RULE },
  moundL: {
    position: 'absolute', left: 0, top: 138, width: 0, height: 0,
    borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 12,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: SOFT,
  },
  moundR: {
    position: 'absolute', left: 106, top: 136, width: 0, height: 0,
    borderLeftWidth: 14, borderRightWidth: 14, borderBottomWidth: 14,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: SOFT,
  },

  // ── charter ────────────────────────────────────────────────────────────────
  charterWrap: {
    position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H,
    transformOrigin: `${CH_MID_X}px ${CH_MID_Y}px`,
  },
  rail: { position: 'absolute', left: 230, top: RAIL_Y, width: 166, height: 2.5, backgroundColor: INK, borderRadius: 2 },
  cordL: { position: 'absolute', left: 268, top: RAIL_Y + 2, width: 2, height: 24, backgroundColor: SOFT },
  cordR: { position: 'absolute', left: 358, top: RAIL_Y + 2, width: 2, height: 24, backgroundColor: SOFT },

  halfL: { position: 'absolute', left: CH_L, top: CH_T, width: CH_HALF, height: CH_H, overflow: 'hidden' },
  halfR: { position: 'absolute', left: CH_L + CH_HALF, top: CH_T, width: CH_HALF, height: CH_H, overflow: 'hidden' },
  face: {
    position: 'absolute', top: 0, width: CH_W, height: CH_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 8, backgroundColor: PAPER,
    alignItems: 'center', paddingTop: 9,
  },
  faceL: { left: 0 },
  faceR: { left: -CH_HALF },
  faceDim: { borderColor: SOFT, opacity: 0.45 },

  chCap: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  chRule: { width: 124, height: 1, backgroundColor: RULE, marginTop: 6 },
  chArticle: { fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 2, color: SOFT, marginTop: 8,
    includeFontPadding: false,
  },
  chBody: {
    fontFamily: 'Inter_700Bold', fontSize: 14.5, lineHeight: 19, color: INK,
    textAlign: 'center', marginTop: 5,
    includeFontPadding: false,
  },
  chLine: { height: 2.5, backgroundColor: RULE, marginTop: 9, borderRadius: 1 },

  sigWrap: { position: 'absolute', left: 10, bottom: 8, width: 62, height: 28 },
  sigStroke: { position: 'absolute', height: 1.5, backgroundColor: INK },
  sigLine: { position: 'absolute', left: 0, top: 17, width: 58, height: 1.5, backgroundColor: INK },
  sigLabel: {
    position: 'absolute', left: 0, top: 20, fontFamily: 'Inter_700Bold',
    fontSize: 11.5, letterSpacing: 1.2, color: SOFT,
    includeFontPadding: false,
  },
  seal: {
    position: 'absolute', right: 9, bottom: 6, width: 28, height: 28, borderRadius: 14,
    borderWidth: 2.5, borderColor: INK, backgroundColor: SOFT,
    alignItems: 'center', justifyContent: 'center',
  },
  sealDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: PAPER },

  tearWrap: { position: 'absolute', left: 0, top: 0, width: CH_HALF, height: CH_H },
  toothL: {
    position: 'absolute', left: CH_HALF - 8, width: 0, height: 0,
    borderLeftWidth: 8, borderTopWidth: 9, borderBottomWidth: 9,
    borderLeftColor: INK, borderTopColor: 'transparent', borderBottomColor: 'transparent',
  },
  toothR: {
    position: 'absolute', left: 0, width: 0, height: 0,
    borderRightWidth: 8, borderTopWidth: 9, borderBottomWidth: 9,
    borderRightColor: INK, borderTopColor: 'transparent', borderBottomColor: 'transparent',
  },

  // ── the eight tap events (group AH) ────────────────────────────────────────
  //
  // THE CHIP IS THE PAGE, NOT A DARKER GREY. By the beat it is struck the stone has
  // been answered and its slab is INK, so a wedge of PAPER is material gone rather
  // than a mark drawn on. It sits at local x 102…128 — right of "YOUR MIND", which
  // sets 78 units wide inside a 122-unit slab and so ends at x 106.
  chipWrap: { position: 'absolute', left: 0, top: 0, width: 150, height: 160 },
  chipA: {
    position: 'absolute', left: 102, top: 20, width: 26, height: 12,
    backgroundColor: PAPER, transform: [{ rotate: '24deg' }],
  },
  chipB: {
    position: 'absolute', left: 106, top: 40, width: 22, height: 9,
    backgroundColor: PAPER, transform: [{ rotate: '-18deg' }],
  },

  // The opening pair. Both live in the middle of the picture, which is the only
  // clear ground this scene has and only on beats 1–2.
  grantWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  govPlate: {
    position: 'absolute', left: CARD_GRANTED_L, top: 196, width: CARD_W, height: 26,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  govText: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  grantShaft: {
    position: 'absolute', left: CARD_GRANTED_L + CARD_W / 2 - 1, top: 228, width: 2, height: 14,
    backgroundColor: SOFT,
  },
  // A TRIANGLE IN A SIZED BOX: a border triangle has no box of its own, so anything
  // measured or transformed against it resolves against nothing (§13).
  grantHead: {
    position: 'absolute', left: CARD_GRANTED_L + CARD_W / 2 - 6, top: 242, width: 12, height: 9,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 9,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: SOFT,
    borderStyle: 'solid',
  },
  voteWrap: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
  voteRule: { position: 'absolute', left: VOTE_X, top: 236, width: 2, height: 64, backgroundColor: SOFT },
  voteText: {
    position: 'absolute', left: VOTE_X - 38, top: 304, width: 76, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 1, color: SOFT,
    includeFontPadding: false,
  },
  // `left` is animated, so it is not set here — cardStyle carries it.
  rightCard: {
    position: 'absolute', top: CARD_T, width: CARD_W, height: 34,
    borderWidth: 2, borderColor: INK, borderRadius: 6, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  rightText: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.6, color: INK,
    includeFontPadding: false,
  },

  // Open at the bottom, because the stone is not contained by it: the claim is that
  // something stands over what was already there.
  protectWrap: { position: 'absolute', left: 2, top: 312, width: 130 },
  protectText: {
    width: 130, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.7, color: SOFT,
    includeFontPadding: false,
  },
  protectBracket: {
    marginTop: 4, width: 130, height: 22,
    borderWidth: 1.5, borderBottomWidth: 0, borderColor: SOFT, borderStyle: 'dashed',
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
  },

  // DASHED, because it is the tag of the view that says this right is not secured.
  wishTag: {
    position: 'absolute', left: 12, top: 312, width: 110, height: 28,
    borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', borderRadius: 6,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center',
  },
  wishText: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.8, color: SOFT,
    includeFontPadding: false,
  },

  // Above the rail at y 154 and above the charter at 178, in the one band this
  // composition keeps clear — and gone by the beat the question's own caption
  // arrives at y 104.
  lawCard: {
    position: 'absolute', left: 120, top: 100, width: 180, height: 48,
    borderWidth: 2, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  lawText: {
    textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 13, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  enactStamp: {
    position: 'absolute', left: 240, top: 130, width: 68, height: 20,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PLATE_FACE,
    alignItems: 'center', justifyContent: 'center',
  },
  enactText: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },

  standsWrap: { position: 'absolute', left: 2, top: 312, width: 130 },
  standsText: {
    width: 130, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.7, color: INK,
    includeFontPadding: false,
  },
  standsRule: {
    marginTop: 4, width: 130, height: 2, backgroundColor: INK, borderRadius: 1,
    transformOrigin: '0% 50%',
  },

  // Right of the stone (which ends at x 128) and left of the charter (which starts
  // at 240), in the corridor between them.
  reasonPlate: {
    position: 'absolute', left: 134, top: 306, width: 102, height: 26,
    borderWidth: 1.5, borderColor: INK, borderRadius: 8, backgroundColor: PLATE_FACE,
    boxShadow: LIP, alignItems: 'center', justifyContent: 'center',
  },
  reasonText: {
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 0.8, color: INK,
    includeFontPadding: false,
  },
  reasonLead: {
    position: 'absolute', left: 138, top: 332, width: 1.5, height: 18,
    backgroundColor: SOFT, transformOrigin: '50% 0%',
  },

  // ── Q1 ─────────────────────────────────────────────────────────────────────
  askWrap: { position: 'absolute', left: 0, top: 104, width: STAGE_W },
  askLabel: {
    width: STAGE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 1.8, color: INK,
    includeFontPadding: false,
  },
  // Big targets, sitting directly over their own art: 126×158 and 156×168.
  stoneHit: { position: 'absolute', left: 4, top: 344, width: 126, height: 158 },
  paperHit: { position: 'absolute', left: CH_L - 4, top: CH_T - 6, width: CH_W + 8, height: CH_H + 12 },
});

export function Political7Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Political7Scene} band={[96, 516]} camera={CAM} />;
}
