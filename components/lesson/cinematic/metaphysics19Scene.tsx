import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './metaphysics19Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// A STACK COMING OFF A POST, AND WHAT IS UNDER THE LAST CARD.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the PEG is a 6-wide post at x 154…160, y 254…356. It is drawn from the first
//   frame at 0.16 opacity and rises to 0.4 — never to full, because the whole
//   dispute is whether it is there, and a solid post would have settled it.
// · FIVE PROPERTY CARDS, 132×18, at x 100…232, tops 258 · 278 · 298 · 318 · 338 —
//   RED · ROUND · SWEET · 80 GRAMS · ON THIS TABLE. They sit ACROSS the peg, so
//   the post is visibly threaded through the stack rather than beside it.
// · the PILE is where the removed cards go: x 268…356, tops 300 · 310 · 320 ·
//   330 · 340, each 88×8 and slightly offset, so it reads as a discard heap and
//   not as a second stack.
// · the EMPTY AIR is the third target: the 132×102 box the cards vacated, at
//   x 100…232, y 254…356. It is never drawn — it is a hit area over paper, which
//   is exactly what it stands for.
// · the TWIN is a second peg-and-stack at x 268…356 on the last beats, 88 wide,
//   the same five cards at 60% width. It shares the discard column's x, and the
//   pile is gone by then, so the two never coexist.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the
//   lowest card ink is 356, so 41 units stay clear.
//
// Ink runs y 236 (the caption) … y 500. BAND 230…512 = 282, with the 103-unit
// figure at 37%.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const PEG_X = 154;
const PEG_Y = 254;
const PEG_H = 102;

const CARD_X = 100;
const CARD_W = 132;
const CARD_H = 18;
const CARD_TOP = [258, 278, 298, 318, 338];
const CARD_TEXT = ['RED', 'ROUND', 'SWEET', '80 GRAMS', 'ON THIS TABLE'];

const PILE_X = 268;
const PILE_W = 88;
const PILE_TOP = [300, 310, 320, 330, 340];

const TWIN_X = 268;

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const PROPS = BEATS.map((b) => b.props ?? 0);
const STRIP = BEATS.map((b) => b.strip ?? 0);
const PEG = BEATS.map((b) => b.peg ?? 0);
const TWIN = BEATS.map((b) => b.twin ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('metaphysics19'));

export default function Metaphysics19Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const heldFig = useHeld();
  const cv = useCarry(5);
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
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      props: carry(cv, 1, n, PROPS[p], PROPS[n], tr),
      strip: carry(cv, 2, n, STRIP[p], STRIP[n], tr),
      peg: carry(cv, 3, n, PEG[p], PEG[n], tr),
      twin: carry(cv, 4, n, TWIN[p], TWIN[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const pegStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.peg }));
  const twinStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.twin }));
  const cards = [0, 1, 2, 3, 4];

  return (
    <View style={styles.scene}>
      <Text style={styles.cap} pointerEvents="none">EVERYTHING TRUE OF ONE APPLE</Text>

      <Animated.View style={[styles.peg, pegStyle]} pointerEvents="none" />

      {cards.map((k) => <Prop key={k} S={SCENE} index={k} />)}

      {/* THE TWIN — the same stack again, and the reason bundles struggle. */}
      <Animated.View style={[StyleSheet.absoluteFill, twinStyle]} pointerEvents="none">
        <View style={styles.twinPeg} />
        {cards.map((k) => (
          <View key={`tw${k}`} style={[styles.twinCard, { top: CARD_TOP[k] }]}>
            <Text style={styles.twinText} numberOfLines={1}>{CARD_TEXT[k]}</Text>
          </View>
        ))}
      </Animated.View>

      {/* THE THREE ANSWERS, all of them already on the stage. */}
      <Target
        id="peg" correct picked={picked} onPick={onPick}
        disabled={!live || answered} style={styles.pegHit}
      >
        <View style={[styles.pegHitBox, answered && picked === 'peg' && styles.right]} pointerEvents="none" />
      </Target>
      <Target
        id="pile" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered} style={styles.pileHit}
      >
        <View style={[styles.pileHitBox, answered && picked === 'pile' && styles.wrong]} pointerEvents="none" />
      </Target>
      <Target
        id="air" correct={false} picked={picked} onPick={onPick}
        disabled={!live || answered} style={styles.airHit}
      >
        <View style={[styles.airHitBox, answered && picked === 'air' && styles.wrong]} pointerEvents="none" />
      </Target>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One property. It slides right into the discard column as `strip` passes it,
 * so the reader sees the cards go somewhere rather than simply stop existing —
 * which matters, because one of the three answers is that pile.
 */
function Prop({ S, index }: { S: { value: { props: number; strip: number } }; index: number }) {
  const top = CARD_TOP[index];
  const dx = PILE_X - CARD_X;
  const dy = PILE_TOP[index] - top;
  const st = useAnimatedStyle(() => {
    const u = clamp01(S.value.strip * 5 - (4 - index));
    return {
      opacity: clamp01(S.value.props * 5 - index) * (1 - u * 0.45),
      transform: [{ translateX: dx * u }, { translateY: dy * u }, { scaleY: 1 - u * 0.55 }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.card, { top }, st]}>
      <Text style={styles.cardText} numberOfLines={1} pointerEvents="none">{CARD_TEXT[index]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  cap: {
    position: 'absolute', left: 100, top: 236, width: 260,
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1.3, color: SOFT, includeFontPadding: false,
  },

  peg: { position: 'absolute', left: PEG_X, top: PEG_Y, width: 6, height: PEG_H, backgroundColor: INK, borderRadius: 2 },

  card: {
    position: 'absolute', left: CARD_X, width: CARD_W, height: CARD_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
    justifyContent: 'center', paddingLeft: 8,
  },
  cardText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  twinPeg: { position: 'absolute', left: TWIN_X + 24, top: PEG_Y, width: 6, height: PEG_H, backgroundColor: INK, borderRadius: 2 },
  twinCard: {
    position: 'absolute', left: TWIN_X, width: PILE_W, height: CARD_H,
    borderWidth: 1.5, borderColor: INK, borderRadius: 2, backgroundColor: PAPER,
    justifyContent: 'center', paddingLeft: 6,
  },
  twinText: {
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 0.7, color: INK, includeFontPadding: false,
  },

  pegHit: { position: 'absolute', left: PEG_X - 16, top: PEG_Y, width: 38, height: PEG_H },
  pegHitBox: { width: 38, height: PEG_H, borderRadius: 4 },
  pileHit: { position: 'absolute', left: PILE_X, top: 294, width: PILE_W, height: 60 },
  pileHitBox: { width: PILE_W, height: 60, borderRadius: 4 },
  airHit: { position: 'absolute', left: CARD_X + 26, top: PEG_Y, width: CARD_W - 26, height: PEG_H },
  airHitBox: { width: CARD_W - 26, height: PEG_H, borderRadius: 4 },

  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Metaphysics19Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Metaphysics19Scene} band={[230, 512]} camera={CAM} />;
}
