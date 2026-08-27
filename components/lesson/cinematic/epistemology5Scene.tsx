import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, lerp, mixStance, pose, type Bundle } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './epistemology5Script';
import {
  K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, useCarry,
  carry, STONE,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// ARISTOTLE'S LADDER, drawn as a stepped bar chart and climbed by the eye.
//
//   the star   (y 212–280)   understanding, burning over the top rung
//   the ladder (y 286–464)   SENSATION → MEMORY → EXPERIENCE → SCIENCE → WISDOM,
//                            each rung indented further right, built bottom-up
//   Bacon      (y 344–500)   a line dropped off the WISDOM rung into one box:
//                            KNOWLEDGE → POWER. Same ladder, redirected.
//   the figure (x 44–129)    stands clear of the whole diagram, gazing up at it
//
// On the last question the ladder gives way to four name plates, so Q2 is answered
// by tapping the stage. Identity camera — these constants ARE final stage coords.
// ─────────────────────────────────────────────────────────────────────────────

const FIG_X = 76;
const STAR = { x: 303, y: 246 };   // lifted 30 to make room for taller rungs (D31b)

// ladder geometry: five rungs, each 150 wide, stepping 22 right and 36 up
const RUNG_W = 150;
// 34, not 28. A rung holds a title over a caption, and at the old line heights that
// is exactly 24 units — inside a 28-unit box whose 2-unit border leaves exactly 24.
// The clearance was ZERO by construction, top and bottom, on all five rungs: the
// words WERE the border.
//
// THE LADDER EXACTLY FILLED ITS SLOT, which is why this needed more than a bigger
// number. Five rungs at 28/30 span 148 units and there are only 150 between the
// star's underside and Bacon's box — so every extra unit of rung had to be bought
// from somewhere. 34/36 spans 178, so the star moved up 30 (and the band with it,
// to 308 units, still inside the 330 at which `fit` would fall below 0.90).
const RUNG_H = 34;
const RUNG_STEP = 22;
/** Must exceed RUNG_H or consecutive rungs overlap; 2 units of gutter, as before. */
const RUNG_PITCH = 36;
const RUNG_BASE_X = 140;
/** Chosen so the BOTTOM rung still ends at 464 and Bacon's box at 466 is untouched. */
const RUNG_BASE_Y = 430;
const RUNGS = [
  { label: 'SENSATION', sub: 'every animal has it' },
  { label: 'MEMORY', sub: 'a few animals' },
  { label: 'EXPERIENCE', sub: 'many memories' },
  { label: 'SCIENCE', sub: 'knowing the why' },
  { label: 'WISDOM', sub: 'wanted for itself' },
];
const rungX = (k: number) => RUNG_BASE_X + k * RUNG_STEP;
const rungY = (k: number) => RUNG_BASE_Y - k * RUNG_PITCH;

// Bacon's line runs down the clear right-hand margin (x 372 misses every rung but
// the top one, which it leaves from) into the box beneath the ladder.
const BACON_X = 371;
const BACON_T = 466;

const SKY = [
  { x: 54, y: 264 }, { x: 92, y: 248 }, { x: 128, y: 290 },
  { x: 166, y: 256 }, { x: 206, y: 298 }, { x: 246, y: 266 },
];

// ── the scene-answered question (Q2): four name plates, 232 × 42 each ──────
// 46 apart, so each plate has a 4-unit gutter and no two borders ever fuse.
const PLATE_X = 148;
const PLATE_W = 232;
const PLATES = [
  { id: 'ari', label: 'ARISTOTLE', y: 318, correct: false },
  { id: 'plato', label: 'PLATO', y: 364, correct: false },
  { id: 'bacon', label: 'FRANCIS BACON', y: 410, correct: true },
  { id: 'soc', label: 'SOCRATES', y: 456, correct: false },
];

const P_CODE = BEATS.map((b) => b.p ?? 0);
const STARB = BEATS.map((b) => b.star ?? 0);
const POWER = BEATS.map((b) => b.power ?? 0);
const RUNGN = BEATS.map((b) => b.rungs ?? 0);

// THE CAMERA (H60b). `followMoves` reads the x track and gives each beat its own
// shot: it FOLLOWS him when a beat moves him far enough to be worth following,
// pushes close on a quote, and PULLS BACK to the whole band on a question or a
// summary — the beats the reader has to read and act on. Beats that do not set
// `x` stand at FIG_X, so a still lesson gets the one-in-three push rather than a
// camera that never rests.
const X = BEATS.map((b) => b.x ?? FIG_X);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('epistemology5'));

export default function Epistemology5Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(3);
  const cur = BEATS[i];
  const answered = picked !== null;
  const asking = !!cur.interact;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / 0.85);
    const t = clock.value;

    const s = keepHeld(heldS, mixStance(carryFrom(heldS, n, emoteHold(P_CODE[p], t)), emoteLive(P_CODE[n], t, bt.value), tr));
    return {
      fig: pose(s, FIG_X, 500, K_FIG, 1, 1),
      // R7b — the seam brightens the star. Slide toward BORN WITH IT and the spark
      // Aristotle says everybody starts with burns harder; slide to TAUGHT IT and it
      // dims to whatever a schoolroom put there.
      star: carry(cv, 0, n, STARB[p], reacting ? dragPos.value : STARB[n], tr),
      power: carry(cv, 1, n, POWER[p], POWER[n], tr),
      rungs: carry(cv, 2, n, RUNGN[p], RUNGN[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const coreStyle = useAnimatedStyle(() => {
    const pulse = 0.82 + 0.18 * Math.sin(SCENE.value.t * 3.2);
    return { opacity: 0.25 + 0.75 * SCENE.value.star, transform: [{ scale: (0.7 + 0.3 * SCENE.value.star) * pulse }] };
  });
  const haloStyle = useAnimatedStyle(() => {
    const pulse = 0.7 + 0.3 * Math.sin(SCENE.value.t * 2.4);
    return { opacity: SCENE.value.star * 0.55 * pulse, transform: [{ scale: 1 + 0.18 * pulse }] };
  });
  const raysStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.star * 0.75,
    transform: [{ rotate: `${SCENE.value.t * 26}deg` }, { scale: 0.78 + 0.2 * SCENE.value.star }],
  }));
  const baconStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.power }));
  const runStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: clamp01(SCENE.value.power * 1.6) }],
  }));

  return (
    <Animated.View style={styles.scene}>
      {SKY.map((s, k) => <Twinkle key={`${s.x}-${s.y}`} S={SCENE} s={s} k={k} />)}

      {/* ── the star of understanding, over the top rung ──────────────────── */}
      <Animated.View style={[styles.rays, { left: STAR.x - 34, top: STAR.y - 34 }, raysStyle]} pointerEvents="none">
        {[0, 45, 90, 135].map((a) => <View key={a} style={[styles.ray, { transform: [{ rotate: `${a}deg` }] }]} />)}
      </Animated.View>
      <Animated.View style={[styles.halo, { left: STAR.x - 22, top: STAR.y - 22 }, haloStyle]} pointerEvents="none" />
      <Animated.View style={[styles.core, { left: STAR.x - 11, top: STAR.y - 11 }, coreStyle]} pointerEvents="none" />

      {/* ── Aristotle's ladder ────────────────────────────────────────────── */}
      {!asking && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {RUNGS.map((r, k) => <Rung key={r.label} S={SCENE} r={r} k={k} />)}
          <Text style={styles.ladderTag}>ARISTOTLE’S LADDER · METAPHYSICS I</Text>

          {/* Bacon drops a line off the top rung and lands it on a new goal */}
          <Animated.View style={[styles.baconRun, runStyle]} />
          <Animated.View style={[styles.baconBox, baconStyle]}>
            <Text style={styles.baconT}>KNOWLEDGE  →  POWER</Text>
            <Text style={styles.baconSub}>COMMAND OVER NATURE · BACON, 1597</Text>
          </Animated.View>
        </View>
      )}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />

      {/* ── Q2 answered in the scene: tap who said it ─────────────────────── */}
      {asking && (
        <>
          <Text style={styles.askLabel}>TAP WHO SAID IT</Text>
          {PLATES.map((pl) => (
            <Target id={pl.id} correct={pl.correct} picked={picked} onPick={onPick}
              key={pl.id} style={[styles.plateHit, { top: pl.y }]} disabled={answered}>
              <View
                style={[
                  styles.plate,
                  answered && pl.correct && styles.plateRight,
                  answered && picked === pl.id && !pl.correct && styles.plateWrong,
                ]}
              >
                <Text style={[styles.plateT, answered && pl.correct && styles.plateTOn]}>{pl.label}</Text>
              </View>
            </Target>
          ))}
        </>
      )}
    </Animated.View>
  );
}

/** One step of the ladder — drawn in only once the build reaches it. */
function Rung({ S, r, k }: { S: SharedValue<any>; r: { label: string; sub: string }; k: number }) {
  const st = useAnimatedStyle(() => {
    const on = clamp01(S.value.rungs - k);
    return { opacity: on, transform: [{ translateX: (1 - on) * -14 }] };
  });
  return (
    <Animated.View style={[styles.rung, { left: rungX(k), top: rungY(k) }, st]}>
      <View style={styles.rungNum}><Text style={styles.rungNumT}>{k + 1}</Text></View>
      <View style={styles.rungTextWrap}>
        <Text style={styles.rungT}>{r.label}</Text>
        <Text style={styles.rungSub}>{r.sub}</Text>
      </View>
    </Animated.View>
  );
}

function Twinkle({ S, s, k }: { S: SharedValue<any>; s: { x: number; y: number }; k: number }) {
  const st = useAnimatedStyle(() => {
    const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(S.value.t * (1.6 + k * 0.3) + k));
    return { opacity: (0.3 + 0.5 * S.value.star) * tw };
  });
  return <Animated.View style={[styles.smallStar, { left: s.x - 3, top: s.y - 3 }, st]} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 24, right: 16, top: 500, height: 1.5, backgroundColor: RULE },
  smallStar: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: INK },

  core: { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: INK },
  halo: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: INK },
  rays: { position: 'absolute', width: 68, height: 68, alignItems: 'center', justifyContent: 'center', transformOrigin: '50% 50%' },
  ray: { position: 'absolute', width: 68, height: 2, backgroundColor: INK, borderRadius: 2 },

  // TONE, NOT WHITE. This scene drew every prop as an outline on paper — two
  // values and no depth, which is the flat case `check:shade` exists to find.
  // The structural mass takes STONE, a secondary surface takes RULE, and what
  // carries the message stays PAPER, so the picture has things at different
  // values rather than everything a shade darker. See cinematicKit's ramp.
  rung: {
    position: 'absolute', width: RUNG_W, height: RUNG_H,
    borderWidth: 2, borderColor: INK, borderRadius: 3, backgroundColor: STONE,
    flexDirection: 'row', alignItems: 'center', paddingLeft: 6, gap: 7,
  },
  rungNum: {
    width: 16, height: 16, borderRadius: 8, backgroundColor: INK,
    alignItems: 'center', justifyContent: 'center',
  },
  rungNumT: { fontFamily: 'Inter_700Bold', fontSize: 9, color: PAPER, includeFontPadding: false },
  rungTextWrap: { flex: 1 },
  rungT: { fontFamily: 'Inter_700Bold', fontSize: 11.5, lineHeight: 13, letterSpacing: 0.6, color: INK, includeFontPadding: false },
  rungSub: { fontFamily: 'Inter_400Regular', fontSize: 8.6, lineHeight: 10.8, letterSpacing: 0.3, color: SOFT, includeFontPadding: false },
  // Parked in the empty wedge left of the staircase — clear of the rungs (x ≥ 140),
  // clear of Bacon's box, and well above the figure's crown at y ≈ 354.
  ladderTag: {
    position: 'absolute', left: 18, top: 300, width: 116,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.2, lineHeight: 12,
    color: SOFT, includeFontPadding: false,
  },

  baconRun: {
    position: 'absolute', left: BACON_X, top: 344, width: 2, height: BACON_T - 344,
    backgroundColor: INK, transformOrigin: '50% 0%',
  },
  baconBox: {
    position: 'absolute', left: 140, top: BACON_T, width: 238, height: 34,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center',
  },
  baconT: { fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 15, letterSpacing: 0.8, color: INK, includeFontPadding: false },
  baconSub: { fontFamily: 'Inter_700Bold', fontSize: 8.6, lineHeight: 10, letterSpacing: 1.1, color: SOFT, includeFontPadding: false },

  askLabel: {
    position: 'absolute', left: PLATE_X, top: 300, width: PLATE_W, textAlign: 'left',
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: SOFT,
    includeFontPadding: false,
  },
  plateHit: { position: 'absolute', left: PLATE_X, width: PLATE_W },
  plate: {
    height: 42, borderWidth: 2.5, borderColor: INK, borderRadius: 5, backgroundColor: RULE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  plateRight: { backgroundColor: INK, borderColor: INK },
  plateWrong: { borderColor: SOFT, opacity: 0.45 },
  plateT: { fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 0.4, color: INK, includeFontPadding: false },
  plateTOn: { color: PAPER },
});

// The band. Highest ink is the star's rays: a 68-unit box centred at y 276 whose
// bars, at their largest scale (0.98), reach 33 units out — y 243. The sky dots
// start at 245. Lowest is the ground rule at 500 plus the figure's ankle joints,
// which reach ≈ 507. The ladder (316–464), Bacon's line and box (344–500) and the
// four name plates (318–498) all live inside. Cropping to 280 units instead of 560
// puts the scene at the stage's WIDTH limit — about 2.3×, double the letterboxed fit.
export function Epistemology5Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Epistemology5Scene} band={[206, 514]} camera={CAM} />;
}
