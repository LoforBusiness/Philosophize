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
import { BEATS } from './metaphysics8Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A thirteen-domino run standing on a long rail, sweeping right to left: the far
// end is everything that happened before you were born, and domino 3 is labelled
// YOUR CHOICE. The figure walks ahead of the falling wave, stands under their own
// domino as it goes over, steps back to take in the whole line, and finally turns
// and pushes the NEXT one over themselves (gesture 29, push-out).
//
// COMPOSITION / OCCLUSION —
//   · the figure WALKS x = 300 → 232 → 140 → 200 → 140. With a body-plus-arms
//     span of about ±48, the walk band is x ≈ 92 … 348, y = 361 … 500.
//   · EVERY domino, the rail, all three captions and all three Q1 cards sit
//     entirely ABOVE y = 350 (domino tops y = 308, rail line y = 348, cards
//     y = 160 … 294), and a standing figure's crown is at y = 361. Nothing the
//     reader has to read is ever behind a body.
//   · the only props that reach BELOW y = 350 are the two rail legs, at x = 32
//     and x = 368 — both well outside the 92 … 348 walk band.
//   · the figure pushes across a deliberate gap: the rail sits above head height,
//     so the shove reads from the gesture plus the domino that goes over on the
//     same beat, exactly like the thread-between-heads in the ethics scenes.

const DOM_N = 13;
const DOM_X0 = 44;
const DOM_GAP = 26;
const DOM_W = 10;
const DOM_H = 40;
const RAIL_Y = 348;                 // the surface the dominoes stand on
const DOM_T = RAIL_Y - DOM_H;       // 308 — the top of a standing domino
const FALL_DEG = 46;                // resting lean once it has landed on its neighbour
const MARK_I = 3;                   // the domino labelled YOUR CHOICE
const MARK_X = DOM_X0 + MARK_I * DOM_GAP;   // 122

const CARD_L = 44;
const CARD_W = 312;
// SIZED FOR A FINGER. Band 420 units → fit 0.71, which turned a 42-unit card into
// 30dp on a 33dp pitch. The stack now runs 160 → 368, clear of the crown at 397.
const CARD_H = 52;
const CARD_T = 160;
const CARD_GAP = 78;
/** Half the gap — more would overlap the neighbour, and the topmost would win. */
const CARD_SLOP = (CARD_GAP - CARD_H) / 2;

const CARDS = [
  { id: 'broke', label: 'THE CHAIN BROKE', correct: false },
  { id: 'forced', label: 'SOMETHING FORCED YOUR HAND', correct: false },
  { id: 'wants', label: 'YOU ACTED FROM YOUR OWN WANTS', correct: true },
];

const DOMS = Array.from({ length: DOM_N }, (_, k) => ({ idx: k, x: DOM_X0 + k * DOM_GAP }));

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 140);
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics8'));
const DIR = dirsFrom(X, 1);
const CHAINV = BEATS.map((b) => b.chain ?? 0);
const FRONTV = BEATS.map((b) => b.front ?? DOM_N);
const TAGSV = BEATS.map((b) => b.tags ?? 0);
const MARKV = BEATS.map((b) => b.mark ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.field ? 1 : 0));

/**
 * One domino. It reads the shared topple FRONT and works out its own angle, so
 * thirteen props are driven by a single number computed once in the scene's
 * derived value — no per-domino worklet, no thirteen-way choreography.
 */
function Domino({
  idx, x, marked, wave,
}: { idx: number; x: number; marked: boolean; wave: SharedValue<number> }) {
  const st = useAnimatedStyle(() => {
    // 0 while standing, 1 once fully over: the front passes this domino as the
    // wave value falls from idx+1 down to idx.
    const u = clamp01(idx + 1 - wave.value);
    const g = u * u;                                  // gravity — a slow tip, then a fast fall
    return { transform: [{ rotate: `${-FALL_DEG * g}deg` }] };
  });
  return (
    <Animated.View
      style={[styles.dom, marked && styles.domMark, { left: x }, st]}
      pointerEvents="none"
    >
      <View style={[styles.domSplit, marked && styles.domSplitOn]} />
    </Animated.View>
  );
}

export default function Metaphysics8Scene({ clock, bt, bi, i, picked, onPick, dragPos, dragPos2 }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldS = useHeld();
  const cv = useCarry(5);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  // The chain only grows in on the beat that CHANGES it, so the whole run does not
  // re-animate every time the reader taps forward. The captions cross-fade on a
  // plain lerp instead, because they go both ways (they duck out while Q1 is up).
  const chainFade = (cur.chain ?? 0) !== (prev?.chain ?? 0);

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.55);

    // The canonical travel body: walks the gap when the beat moves them, blends
    // gesture-to-gesture when it doesn't. WALK is passed EXPLICITLY — a Gait left
    // to a default parameter is not captured into the worklet runtime.
    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));
    return {
      fig: pose(s, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, facing(DIR[p], DIR[n], bt.value), 1),
      // R7b — the pad IS the two questions. Across: the further right, the more of
      // the domino run is there, because that axis runs from the chain breaks to
      // every link holds.
      chain: carry(cv, 1, n, CHAINV[p], reacting ? dragPos.value : CHAINV[n], tr, chainFade ? grow : 1),
      // ONE number for the whole cascade: every domino at or right of it is down.
      wave: carry(cv, 2, n, FRONTV[p], FRONTV[n], tr),
      tags: carry(cv, 3, n, TAGSV[p], TAGSV[n], tr),
      // And up: the YOUR CHOICE tag over domino three lights as the token rises
      // toward people are free. The reader can put the tag on a chain that is
      // complete, which is the compatibilist corner and the whole lesson.
      mark: carry(cv, 4, n, MARKV[p], reacting ? dragPos2.value : MARKV[n], tr),
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const WAVE = useDerivedValue<number>(() => SCENE.value.wave);

  const chainStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.chain }));
  const tagsStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tags }));
  const markStyle = useAnimatedStyle(() => ({
    // A STEEP RAMP, NOT THE RAW VALUE (D35). `mark` is the pad's second axis on the
    // graded beat, so it RESTS wherever the token is — and the token starts at 0.24,
    // which put YOUR CHOICE on the stage at 1.7:1 and held it there until the reader
    // moved. A word is legible or absent; the rise is what carries the value, and it
    // still runs the whole range.
    opacity: clamp01(SCENE.value.mark * 3),
    transform: [{ translateY: (1 - SCENE.value.mark) * -8 }],
  }));

  const answered = picked !== null;
  const showPick = (cur.pick ?? 0) > 0 && !!cur.interact;

  return (
    <Animated.View style={styles.scene}>
      {/* ── the domino run on its rail, all of it above y = 350 ─────────────── */}
      <Animated.View style={[styles.layer, chainStyle]} pointerEvents="none">
        <View style={styles.rail} />
        <View style={styles.legL} />
        <View style={styles.legR} />
        {DOMS.map((d) => (
          <Domino key={d.idx} idx={d.idx} x={d.x} marked={d.idx === MARK_I} wave={WAVE} />
        ))}
      </Animated.View>

      {/* ── the two ends of the line, named ─────────────────────────────────── */}
      <Animated.View style={[styles.layer, tagsStyle]} pointerEvents="none">
        <Text style={styles.capPast}>BEFORE YOU WERE BORN</Text>
        <Text style={styles.capNext}>← WHAT YOU DO NEXT</Text>
      </Animated.View>

      {/* ── the one domino with your name on it ─────────────────────────────── */}
      <Animated.View style={[styles.layer, markStyle]} pointerEvents="none">
        <Text style={styles.markLabel}>YOUR CHOICE</Text>
        <View style={styles.markTick} />
      </Animated.View>

      {/* ── Q1: three big cards, high above the walk band ───────────────────── */}
      {showPick ? (
        <>
          <View style={styles.pickLabelWrap} pointerEvents="none">
            <Text style={styles.pickLabel}>TAP WHAT MAKES A CHOICE FREE</Text>
          </View>
          {CARDS.map((c, k) => {
            const chosen = picked === c.id;
            return (
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              key={c.id} style={[styles.pickCard, { top: CARD_T + k * CARD_GAP }]} hitSlop={{ top: CARD_SLOP, bottom: CARD_SLOP, left: CARD_SLOP, right: CARD_SLOP }} disabled={answered}>
                <View
                  style={[
                    styles.pickInner,
                    answered && c.correct && styles.pickRight,
                    answered && chosen && !c.correct && styles.pickWrong,
                  ]}
                >
                  <Text style={[styles.pickText, answered && c.correct && styles.pickTextOn]}>
                    {c.label}
                  </Text>
                </View>
              </Target>
            );
          })}
        </>
      ) : null}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // A full-stage carrier for a group of props that fade together. Explicitly
  // positioned so its children never depend on flex flow above them.
  layer: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H },
  ground: { position: 'absolute', left: 24, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  // ── the rail and its two legs ───────────────────────────────────────────────
  rail: { position: 'absolute', left: 26, top: RAIL_Y, width: 352, height: 2, backgroundColor: INK, borderRadius: 1 },
  legL: { position: 'absolute', left: 32, top: RAIL_Y + 2, width: 3, height: GROUND - RAIL_Y - 2, backgroundColor: SOFT },
  legR: { position: 'absolute', left: 368, top: RAIL_Y + 2, width: 3, height: GROUND - RAIL_Y - 2, backgroundColor: SOFT },

  // ── a domino: a thin tall card pivoting on its own bottom edge ──────────────
  dom: {
    position: 'absolute', top: DOM_T, width: DOM_W, height: DOM_H,
    borderWidth: 2, borderColor: INK, borderRadius: 2, backgroundColor: STONE,
    transformOrigin: '50% 100%',
  },
  domMark: { backgroundColor: INK },
  domSplit: { position: 'absolute', left: 1, top: DOM_H / 2 - 2.5, width: DOM_W - 6, height: 1.5, backgroundColor: SOFT },
  domSplitOn: { backgroundColor: PAPER },

  // ── the captions at the two ends of the line ────────────────────────────────
  capPast: {
    position: 'absolute', left: 226, top: 276, width: 160, textAlign: 'right',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },
  capNext: {
    position: 'absolute', left: 14, top: 252, width: 150, textAlign: 'left',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 1.6, color: SOFT,
    includeFontPadding: false,
  },

  // ── the YOUR CHOICE tag, tethered to domino 3 ───────────────────────────────
  markLabel: {
    position: 'absolute', left: MARK_X - 55, top: 276, width: 120, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 1.8, color: INK,
    includeFontPadding: false,
  },
  markTick: { position: 'absolute', left: MARK_X + 4, top: 291, width: 2, height: 15, backgroundColor: INK },

  // ── Q1 cards ────────────────────────────────────────────────────────────────
  pickLabelWrap: { position: 'absolute', left: 0, top: 134, width: STAGE_W },
  pickLabel: {
    textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 11.5, letterSpacing: 2, color: SOFT,
    includeFontPadding: false,
  },
  pickCard: { position: 'absolute', left: CARD_L, width: CARD_W },
  pickInner: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  pickRight: { backgroundColor: INK, borderColor: INK },
  pickWrong: { borderColor: SOFT },
  pickText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.4, color: INK,
    includeFontPadding: false,
  },
  pickTextOn: { color: PAPER },
});

export function Metaphysics8Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics8Scene} band={[96, 516]} camera={CAM} />;
}
