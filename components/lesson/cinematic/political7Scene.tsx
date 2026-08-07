import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, dirsFrom, ease01, emoteHold, emoteLive, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
import { BEATS } from './political7Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

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

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 262);
const DIR = dirsFrom(X, 1);

export default function Political7Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
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
    const s = travelStance(
      X[p], X[n],
      emoteHold(P[p], t), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    );
    return {
      fig: pose(s, lerp(X[p], X[n], tr), GROUND, K_FIG, DIR[n], 1),
      stone: stoneOn ? (stoneFade ? grow : 1) : 0,
      charter: charterOn ? (charterFade ? grow : 1) : 0,
      tear: tearOn ? (tearFade ? grow : 1) : 0,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);

  const stoneStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.stone,
    transform: [{ translateY: (1 - SCENE.value.stone) * 12 }],
  }));
  const charterStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.charter,
    transform: [{ translateY: (1 - SCENE.value.charter) * -12 }],
  }));
  // The two halves hinge apart. Kept small on purpose: at ±7° the lowest corner
  // still lands above y ≈ 348, so a torn charter can never cover the figure.
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
  charterWrap: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  rail: { position: 'absolute', left: 230, top: RAIL_Y, width: 166, height: 2.5, backgroundColor: INK, borderRadius: 2 },
  cordL: { position: 'absolute', left: 268, top: RAIL_Y + 2, width: 2, height: 24, backgroundColor: SOFT },
  cordR: { position: 'absolute', left: 358, top: RAIL_Y + 2, width: 2, height: 24, backgroundColor: SOFT },

  halfL: { position: 'absolute', left: CH_L, top: CH_T, width: CH_HALF, height: CH_H, overflow: 'hidden' },
  halfR: { position: 'absolute', left: CH_L + CH_HALF, top: CH_T, width: CH_HALF, height: CH_H, overflow: 'hidden' },
  face: {
    position: 'absolute', top: 0, width: CH_W, height: CH_H,
    borderWidth: 2.5, borderColor: INK, borderRadius: 3, backgroundColor: PAPER,
    alignItems: 'center', paddingTop: 9,
  },
  faceL: { left: 0 },
  faceR: { left: -CH_HALF },
  faceDim: { borderColor: SOFT, opacity: 0.45 },

  chCap: { fontFamily: 'Inter_700Bold', fontSize: 12, letterSpacing: 1, color: INK,
    includeFontPadding: false,
  },
  chRule: { width: 124, height: 1, backgroundColor: RULE, marginTop: 6 },
  chArticle: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2, color: SOFT, marginTop: 8,
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
    fontSize: 7.5, letterSpacing: 1.2, color: SOFT,
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
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political7Scene} band={[96, 516]} />;
}
