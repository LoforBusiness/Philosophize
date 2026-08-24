import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { clamp01, ease01, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic19Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// FOUR CARDS, A RULE ABOVE THEM, AND ONE BACK SHOWING.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · the RULE is a 336×32 plate at x 32…368, y 226…258, 2-thick ink border. It is
//   the only bordered thing at the top of the stage, so it reads as the claim
//   under test rather than a caption.
// · FOUR CARDS, 72 wide and 92 tall, at y 272…364, lefts 32 · 118 · 204 · 290 —
//   the row ends at x 362. Faces E · K · 4 · 7 in 30pt Playfair, centred.
// · the REACH is a 3-thick ring drawn OUTSIDE cards 0 and 2 (the vowel and the
//   even number), inset −5 on every edge, so the ring never sits on a face.
// · the TURN is card 3 only: it rotates 180° about its own centre on `turned` and
//   its back — a large A — fades in as the front fades out. Both faces are drawn
//   at all times and cross-faded rather than swapped, so there is no frame where
//   the card is blank.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, and the cards
//   end at y 364, so 33 units stay clear at every stop.
//
// Ink runs y 226 (the plate) … y 500. BAND 220…512 = 292, with the 103-unit
// figure at 35%.
// ─────────────────────────────────────────────────────────────────────────────

const TR = 0.82;

const PLATE_X = 32;
const PLATE_Y = 226;
const PLATE_W = 336;
const PLATE_H = 32;

const CARD_Y = 272;
const CARD_W = 72;
const CARD_H = 92;
const CARD_X = [32, 118, 204, 290];
const FACES = ['E', 'K', '4', '7'];
const CARD_ID = ['vowel', 'cons', 'even', 'odd'];
/** Which two a reader reaches for first. */
const REACHED = [1, 0, 1, 0];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const RULEV = BEATS.map((b) => b.rule ?? 0);
const CARDS = BEATS.map((b) => b.cards ?? 0);
const REACH = BEATS.map((b) => b.reach ?? 0);
const TURNED = BEATS.map((b) => b.turned ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic19'));

export default function Logic19Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  // The beat the seven turns on. Its back is the REVEAL, so it is not mounted
  // before then — an opacity-0 <Text> is invisible and still readable, which is
  // exactly what check:spoiler exists to catch (group O).
  const TURN_BEAT = 4;
  const heldFig = useHeld();
  const cv = useCarry(5);
  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const tr = ease01(bt.value / TR);
    const t = clock.value;

    const figS = keepHeld(heldFig, travelStance(
      X[p], X[n],
      carryFrom(heldFig, n, emoteHold(P[p], t)), emoteHold(P[n], t), emoteLive(P[n], t, bt.value),
      tr, WALK,
    ));

    return {
      fig: pose(figS, carry(cv, 0, n, X[p], X[n], tr), GROUND, K_FIG, 1, 1),
      rule: carry(cv, 1, n, RULEV[p], RULEV[n], tr),
      cards: carry(cv, 2, n, CARDS[p], CARDS[n], tr),
      reach: carry(cv, 3, n, REACH[p], REACH[n], tr),
      turned: carry(cv, 4, n, TURNED[p], TURNED[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const ruleStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rule }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, ruleStyle]} pointerEvents="none">
        <View style={styles.plate} />
        <Text style={styles.plateText}>A VOWEL ON THE FRONT MEANS AN EVEN NUMBER ON THE BACK</Text>
      </Animated.View>

      {CARD_X.map((cx, k) => <Card key={CARD_ID[k]} S={SCENE} index={k} showBack={i >= TURN_BEAT} />)}

      {CARD_X.map((cx, k) => (
        <Target
          key={`t${CARD_ID[k]}`}
          id={CARD_ID[k]}
          correct={CARD_ID[k] === 'odd'}
          picked={picked}
          onPick={onPick}
          disabled={!live || answered}
          style={[styles.hit, { left: cx }]}
        >
          <View
            style={[
              styles.hitBox,
              answered && CARD_ID[k] === 'odd' && styles.right,
              answered && picked === CARD_ID[k] && CARD_ID[k] !== 'odd' && styles.wrong,
            ]}
            pointerEvents="none"
          />
        </Target>
      ))}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

/**
 * One card. The last one turns; both faces are drawn at all times and cross-faded
 * through the half-turn, so there is never a frame where the card is blank.
 */
function Card({
  S, index, showBack,
}: {
  S: { value: { cards: number; reach: number; turned: number } };
  index: number;
  showBack: boolean;
}) {
  const left = CARD_X[index];
  const last = index === 3;
  const cardStyle = useAnimatedStyle(() => ({
    opacity: clamp01(S.value.cards * 4 - index),
    transform: [{ rotateY: `${last ? S.value.turned * 180 : 0}deg` }],
  }));
  const frontStyle = useAnimatedStyle(() => ({ opacity: last ? 1 - S.value.turned : 1 }));
  const backStyle = useAnimatedStyle(() => ({ opacity: last ? S.value.turned : 0 }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: REACHED[index] ? S.value.reach : 0 }));
  return (
    <View pointerEvents="none">
      <Animated.View style={[styles.ring, { left: left - 5 }, ringStyle]} />
      <Animated.View style={[styles.card, { left }, cardStyle]}>
        <Animated.Text style={[styles.face, frontStyle]}>{FACES[index]}</Animated.Text>
        {last && showBack ? <Animated.Text style={[styles.back, backStyle]}>A</Animated.Text> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },

  plate: {
    position: 'absolute', left: PLATE_X, top: PLATE_Y, width: PLATE_W, height: PLATE_H,
    borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
  },
  plateText: {
    position: 'absolute', left: PLATE_X, top: PLATE_Y + 11, width: PLATE_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.9, color: INK, includeFontPadding: false,
  },

  card: {
    position: 'absolute', top: CARD_Y, width: CARD_W, height: CARD_H,
    borderWidth: 2, borderColor: INK, borderRadius: 5, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  face: {
    position: 'absolute',
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: INK, includeFontPadding: false,
  },
  back: {
    position: 'absolute',
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: INK, includeFontPadding: false,
    transform: [{ scaleX: -1 }],
  },
  ring: {
    position: 'absolute', top: CARD_Y - 5, width: CARD_W + 10, height: CARD_H + 10,
    borderWidth: 3, borderColor: SOFT, borderRadius: 8,
  },

  hit: { position: 'absolute', top: CARD_Y, width: CARD_W, height: CARD_H },
  hitBox: { width: CARD_W, height: CARD_H, borderRadius: 5 },
  right: { borderWidth: 3, borderColor: INK },
  wrong: { borderWidth: 1.5, borderColor: SOFT, borderStyle: 'dashed', opacity: 0.5 },
});

export function Logic19Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic19Scene} band={[220, 512]} camera={CAM} />;
}
