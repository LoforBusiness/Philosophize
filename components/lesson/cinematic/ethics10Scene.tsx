import {
  View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, dirsFrom, ease01, lerp, moveTr, pose, stand, travelStance, type Bundle, } from './rig';
// The whole movement library, not just rig's 49 emotes. Codes under 100 ARE
// rig's and mean exactly what they always did; 100+ reach moves.ts (emoteAny).
import { emoteAny as emoteHold, emoteAnyLive as emoteLive, gazeAt, pointAt } from './moves';
import { BEATS } from './ethics10Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER, useHeld, carryFrom, keepHeld, facing, useCarry, carry,
} from './cinematicKit';
import { followMoves, kindOf, seedOf } from './camera';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// A pond stage right with a child in it, and the same child again far off to the
// left — smaller, standing higher up the picture at the end of a dotted line, which
// is how a flat side-on stage says "further away".
//
// THE WATER IS RIPPLE LINES, NOT A FILL. A filled pond would have to be drawn over
// the figure's shins to read as water he is standing in, and a prop drawn over the
// figure is the defect D23 exists to stop. Three horizontal rules at y 474/484/494
// pass BEHIND him and say the same thing: he is in it, and nothing covers him.
//
// COMPOSITION / OCCLUSION —
//   · the narrator WALKS x = 88 → 168 → 268, monotonically rightward, so he never
//     flips facing. Widest body span x ≈ 52 … 304.
//   · the POND is x 232 … 376, y 470 … 500. He ends up standing in it at x 268.
//   · the NEAR child is fixed at x 336 at 0.55 scale — 57 units tall, crown y 443,
//     so he is a child beside an adult whose crown is 397, and the ripples cross
//     him at the chest. He is 68 from the narrator's mark, which is close for two
//     figures (B9) and deliberately so: they are in the same pond, and at 0.55 his
//     head is 11 units across, so the two heads cannot merge into one mass.
//   · the FAR child stands on a line at y 452 at 0.30 scale — 31 tall, crown 421.
//     Higher up the picture and smaller than the near one, which is the whole
//     grammar of distance here. The dotted line and its label run x 24 … 150.
//   · the three factor cards sit x 40 … 360, y 300 … 386 — above every crown.
// Nothing is drawn above y 300 or below the ground line, hence band [292, 512] —
// 220 tall, inside the width-limited crop, so this renders as large as the stage
// allows (H59).

const POND_L = 232;
const POND_R = 376;
const RIPPLES = [474, 484, 494];

const NEAR_X = 336;
const NEAR_K = K_FIG * 0.55;

const FAR_X = 52;
const FAR_G = 452;
const FAR_K = K_FIG * 0.3;

const CARD_L = 40;
const CARD_W = 320;
// SIZED FOR A FINGER. These were 27 tall on a 30 pitch, which at this lesson's
// fit of 0.90 is a 24dp card every 27dp — against a fingertip that covers about
// 45dp. A tap aimed at one card overlapped both its neighbours, so it either fell
// in the 2.7dp dead gap or scored the wrong answer.
//
// The room came from ABOVE: the declared band started at 292, so everything higher
// was empty paper. Lifting the stack to 205 costs nothing (the band grows to 312
// units, still under the 330 at which `fit` would start dropping below 0.90) and
// buys 95 units. Downward there is none — the figure's crown is at 397.
const CARD_T = 205;
const CARD_H = 46;
const CARD_GAP = 68;
// Half the 22-unit gap, so the space between two cards belongs to one of them and
// neither can steal from the other. More than half would overlap, and the topmost
// would silently win — which is the mis-tap this is here to remove.
const CARD_SLOP = (CARD_GAP - CARD_H) / 2;

const FACTORS = [
  { id: 'distance', text: 'How far away the child is', correct: true },
  { id: 'able', text: 'Whether you are actually able to help', correct: false },
  { id: 'cost', text: 'What helping would cost you', correct: false },
];

const P = BEATS.map((b) => b.p ?? 0);
const X = BEATS.map((b) => b.x ?? 88);
/** How far he is reaching for the near child on each beat (see the script). */
const REACH = BEATS.map((b) => b.reach ?? 0);
/**
 * WHERE HE REACHES: the near child's own body, not a point beside it.
 *
 * The child is 57 units tall with its crown at 443, so its middle is about 470.
 * `pointAt` lays the arm along the line to a target and stops just inside arm's
 * length, so a target 68 units away — which is twice what an arm can cover — comes
 * out as a straight arm aimed at the child rather than a stretched one touching
 * it. That is the honest picture: he has waded in and is reaching, and he does not
 * have hold of it yet.
 */
const CHILD_REACH_X = NEAR_X - 4;
const CHILD_REACH_Y = 470;
// The camera, from the staging: it follows the figure this track describes,
// pulls back to scale 1 on every graded beat so a tap lands where it is aimed,
// and leans in on the quote. See followMoves in ./camera.ts.
const CAM = followMoves(X, BEATS.map(kindOf), seedOf('ethics10'));
const DIR = dirsFrom(X, 1);

export default function Ethics10Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldS = useHeld();
  const cv = useCarry(2);
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const farOn = !!cur.far;
  const farFade = farOn !== !!prev?.far;
  const cardsOn = !!cur.factors;
  const cardsFade = cardsOn !== !!prev?.factors;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / moveTr(X[p], X[n], 0.85));
    const t = clock.value;
    const grow = ease01(bt.value / 0.6);

    const s = keepHeld(heldS, travelStance(
      X[p], X[n],
      carryFrom(heldS, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    // Both children idle on clocks offset from the narrator's and from each other,
    // so three figures on one stage never breathe on the same frame (B14). They use
    // the settled HOLD rather than a live pose: `emoteHold` already carries its own
    // drift, and a `lift` driven by anything other than a real beat clock would be
    // a raised arm that never comes down (C20).
    const nearS = emoteHold(24, t + 2.1);
    const farS = stand(t + 5.6);

    // ── HE REACHES FOR THE CHILD, AND LOOKS AT IT ─────────────────────────────
    //
    // Blended rather than switched: `reach` carries across the beat like every
    // other channel, so the arm goes out as he wades in and comes most of the way
    // back over the quote instead of snapping between two poses (L1).
    const fx = carry(cv, 0, n, X[p], X[n], tr);
    const dir = facing(DIR[p], DIR[n], bt.value);
    const rv = carry(cv, 1, n, REACH[p], REACH[n], tr);
    let sr = s;
    if (rv > 0.001) {
      const pt = pointAt(s, fx, GROUND, K_FIG, dir, CHILD_REACH_X, CHILD_REACH_Y);
      // A point without a look reads as a person gesturing at something behind
      // them — moves.ts says so in pointAt's own header, so the two go together.
      const g = gazeAt(s, fx, GROUND, K_FIG, dir, CHILD_REACH_X, CHILD_REACH_Y, rv);
      sr = {
        ...g,
        fistR: { x: lerp(s.fistR.x, pt.fistR.x, rv), y: lerp(s.fistR.y, pt.fistR.y, rv) },
      };
    }

    return {
      fig: pose(sr, fx, GROUND, K_FIG, dir, 1),
      near: pose(nearS, NEAR_X, GROUND, NEAR_K, -1, 1),
      far: pose(farS, FAR_X, FAR_G, FAR_K, 1, farOn ? (farFade ? grow : 1) : 0),
      farOn: farOn ? (farFade ? grow : 1) : 0,
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const NF = useDerivedValue<Bundle>(() => SCENE.value.near);
  const FF = useDerivedValue<Bundle>(() => SCENE.value.far);
  const farStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.farOn }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardsOn ? (cardsFade ? ease01(bt.value / 0.6) : 1) : 0,
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── how far away the second child is ────────────────────────────────── */}
      <Animated.View style={farStyle} pointerEvents="none">
        <View style={styles.farLine} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
          <View key={k} style={[styles.dash, { left: 88 + k * 22 }]} />
        ))}
        <Text style={styles.farLabel}>9,000 KM</Text>
      </Animated.View>

      {/* ── the pond: three rules, nothing filled ───────────────────────────── */}
      {RIPPLES.map((y, k) => (
        <View
          key={y}
          style={[styles.ripple, { top: y, left: POND_L + k * 9, width: POND_R - POND_L - k * 18 }]}
          pointerEvents="none"
        />
      ))}

      {/* ── Q1: which difference carries no moral weight? ───────────────────── */}
      {cardsOn &&
        FACTORS.map((f, k) => {
          const chosen = picked === f.id;
          return (
            <Animated.View key={f.id} style={[styles.cardSlot, { top: CARD_T + k * CARD_GAP }, cardStyle]}>
              <Target id={f.id} correct={f.correct} picked={picked} onPick={onPick}
              disabled={answered} hitSlop={{ top: CARD_SLOP, bottom: CARD_SLOP, left: CARD_SLOP, right: CARD_SLOP }}>
                <View
                  style={[
                    styles.card,
                    answered && f.correct && styles.cardRight,
                    answered && chosen && !f.correct && styles.cardWrong,
                  ]}
                >
                  <Text style={[styles.cardText, answered && f.correct && styles.cardTextOn]}>
                    {f.text}
                  </Text>
                </View>
              </Target>
            </Animated.View>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={FF} k={FAR_K} />
      <Stickman D={NF} k={NEAR_K} />
      <Stickman D={DF} k={K_FIG} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  // The ground rule stops short of the pond on the right — the bank is where the
  // solid line ends, so the water needs no outline of its own.
  ground: { position: 'absolute', left: 20, width: POND_L - 26, top: GROUND, height: 1.5, backgroundColor: RULE },

  ripple: { position: 'absolute', height: 1.5, backgroundColor: SOFT, opacity: 0.75, borderRadius: 1 },

  // The far bank: a short line the small figure stands on, higher up the picture.
  farLine: { position: 'absolute', left: 24, top: FAR_G, width: 62, height: 1.5, backgroundColor: RULE },
  dash: { position: 'absolute', top: FAR_G - 1, width: 10, height: 1.5, backgroundColor: RULE },
  farLabel: {
    position: 'absolute', left: 88, top: FAR_G + 8, width: 120,
    // INK, not SOFT: this caption rides a layer that fades, and SOFT does not
    // survive any dimming at all — 5.3:1 on paper becomes 2.0:1 half-faded (D35).
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.6, color: INK,
    includeFontPadding: false,
  },

  cardSlot: { position: 'absolute', left: CARD_L, width: CARD_W },
  card: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: STONE,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  cardRight: { backgroundColor: INK, borderColor: INK },
  cardWrong: { borderColor: SOFT },
  cardText: {
    fontFamily: 'Inter_500Medium', fontSize: 12, color: INK, includeFontPadding: false,
  },
  cardTextOn: { color: PAPER, fontFamily: 'Inter_700Bold',
    includeFontPadding: false,
  },
});

// Art runs from the factor cards (300) to the ground line (500). The pond, both
// children and the dotted distance all sit inside that, so the crop is as tight as
// it can be and the scene renders at the stage's full width-limited size.
export function Ethics10Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Ethics10Scene} band={[200, 512]} camera={CAM} />;
}
