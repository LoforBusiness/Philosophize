import { View, Text, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import { ease01, moveTr, pose, travelStance, WALK, type Bundle } from './rig';
import { emoteAny as emoteHold, emoteAnyLive as emoteLive } from './moves';
import { BEATS } from './logic17Script';
import {
  GROUND, K_FIG, STAGE_W, STAGE_H, INK, STONE, SOFT, RULE, PAPER,
  useHeld, carryFrom, keepHeld, useCarry, carry,
} from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';
import { followMoves, kindOf, seedOf } from './camera';

// ─────────────────────────────────────────────────────────────────────────────
// TWO CLAIMS ON TWO PLINTHS, AND ONLY ONE OF THEM IS FURNITURE.
//
// THE COMPOSITION, IN NUMBERS (H56).
//
// · TWO COLUMNS, 140 wide, at x 34…174 and x 226…366 — 52 units of clear paper
//   down the middle so the pair reads as two objects rather than one panel.
// · the CLAIM CARDS sit at y 238…294 (56 tall). On the lift beat both rise by 20
//   to y 218…274, which is the whole interaction: the gap that opens underneath
//   is the question.
// · the REASONS are two 3-thick rules under the LEFT card only, at y 300 and
//   y 310, insetleft 12 — they belong to the card and rise with it.
// · the PLINTHS are 140×46 at y 320…366, each captioned with the same speaker.
// · the SLUR is a 3-thick rule struck across BOTH plinths at y 342, drawn in one
//   stroke from x 34 to x 366 so it visibly lands on the pair equally.
// · the FIGURE walks x 200 → 132 → 268 on GROUND 500; crown ≈ 397, so there are
//   31 clear units under the plinths at every stop and he never crosses a card.
//
// Ink runs y 218 (a lifted card) … y 500. BAND 212…512 = 300, which is 14 past
// the free-scale line and puts the 103-unit figure at 34%. The extra rows buy the
// lift: a card that rises has to have somewhere to rise TO, or the gesture the
// lesson turns on happens off the top of the frame.
// ─────────────────────────────────────────────────────────────────────────────

/** Crossfade for a beat that does NOT walk. 0.85 is the base `footfalls` assumes. */
const BASE_TR = 0.85;

const COL_X = [34, 226];
const COL_W = 140;

const CARD_Y = 238;
const CARD_H = 56;
const LIFT_BY = 20;

const PLINTH_Y = 320;
const PLINTH_H = 46;
const SLUR_Y = 342;

const CLAIM_ID = ['reasons', 'saw'];
const CLAIM_TOP = ['THE BRIDGE WILL HOLD', 'THE BRIDGE WILL HOLD'];
const CLAIM_SUB = ['load tested to 40 tonnes', 'I saw them test it'];
const REASONS = ['steel rated 40t', 'load tested twice'];

const FIG_X = 200;

const X = BEATS.map((b) => b.x ?? FIG_X);
const P = BEATS.map((b) => b.p ?? 0);
const PAIR = BEATS.map((b) => b.pair ?? 0);
const MARKS = BEATS.map((b) => b.marks ?? 0);
const SLUR = BEATS.map((b) => b.slur ?? 0);
const LIFT = BEATS.map((b) => b.lift ?? 0);
const FALLS = BEATS.map((b) => b.falls ?? 0);
const LIVE = BEATS.map((b) => b.live ?? 0);

// R7b — the stage follows the control on its own graded beat, and only there.
// Derived from the beat rather than declared as a channel so it cannot fall out
// of step with the control it is about.
const REACT = BEATS.map((b) => (b.interact?.split ? 1 : 0));

const CAM = followMoves(X, BEATS.map(kindOf), seedOf('logic17'));

export default function Logic17Scene({ clock, bt, bi, i, picked, onPick, dragPos }: SceneApi) {
  const reacting = REACT[i] === 1;
  const heldFig = useHeld();
  const cv = useCarry(6);
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
      pair: carry(cv, 1, n, PAIR[p], PAIR[n], tr),
      marks: carry(cv, 2, n, MARKS[p], MARKS[n], tr),
      slur: carry(cv, 3, n, SLUR[p], SLUR[n], tr),
      // R7b — the seam lifts the claim off its speaker. Give the bar to THE REASONS
      // GIVEN and the claim floats free, standing on its own argument; give it to WHO
      // IS SPEAKING and it settles back onto the person, where bare testimony lives.
      lift: carry(cv, 4, n, LIFT[p], reacting ? 1 - dragPos.value : LIFT[n], tr),
      falls: carry(cv, 5, n, FALLS[p], FALLS[n], tr),
      t,
    };
  });

  const DF = useDerivedValue<Bundle>(() => SCENE.value.fig);
  const answered = picked !== null;
  const live = !!BEATS[i]?.interact && !BEATS[i]?.interact?.cards && LIVE[i] === 1;

  const pairStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.pair }));
  const slurStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.slur }));
  const marksStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.marks }));
  // Both cards rise together; only the unsupported one comes apart at the top of
  // the rise, which is why `falls` fades the card rather than the whole column.
  const leftCard = useAnimatedStyle(() => ({ transform: [{ translateY: -LIFT_BY * SCENE.value.lift }] }));
  const rightCard = useAnimatedStyle(() => ({
    transform: [{ translateY: -LIFT_BY * SCENE.value.lift }, { rotate: `${SCENE.value.falls * 7}deg` }],
    // 0.45, not 0.6. The card that FALLS is the one the lesson is about — bare
    // testimony with the speaker taken away — so its wording has to survive the
    // fall. At 0.4 the subtitle reached the reader at 1.7:1 (D35).
    opacity: 1 - SCENE.value.falls * 0.45,
  }));

  return (
    <View style={styles.scene}>
      <Animated.View style={[StyleSheet.absoluteFill, pairStyle]}>
        {/* THE PLINTHS AND THE MAN ON THEM — the part the insult can reach. */}
        {COL_X.map((cx) => (
          <View key={`pl${cx}`} pointerEvents="none">
            <View style={[styles.plinth, { left: cx }]} />
            <Text style={[styles.who, { left: cx }]}>SAID BY THE SAME MAN</Text>
          </View>
        ))}

        {/* THE REASONS, under the left card only, and they travel with it. */}
        <Animated.View style={[StyleSheet.absoluteFill, marksStyle]} pointerEvents="none">
          <Animated.View style={leftCard}>
            {REASONS.map((r, k) => (
              <Text key={r} style={[styles.reason, { left: COL_X[0] + 12, top: CARD_Y + CARD_H + 6 + k * 12 }]}>
                · {r}
              </Text>
            ))}
          </Animated.View>
        </Animated.View>

        {/* THE CLAIMS. Identical words, different footings. */}
        {COL_X.map((cx, k) => (
          <Target
            key={CLAIM_ID[k]}
            id={CLAIM_ID[k]}
            correct={CLAIM_ID[k] === 'reasons'}
            picked={picked}
            onPick={onPick}
            disabled={!live || answered}
            style={[styles.hit, { left: cx }]}
          >
            <Animated.View style={k === 0 ? leftCard : rightCard}>
              <View
                style={[
                  styles.card,
                  answered && CLAIM_ID[k] === 'reasons' && styles.cardRight,
                  answered && picked === CLAIM_ID[k] && CLAIM_ID[k] !== 'reasons' && styles.cardWrong,
                ]}
                pointerEvents="none"
              >
                <Text
                  style={[styles.cardTop, answered && CLAIM_ID[k] === 'reasons' && styles.onInk]}
                  numberOfLines={2}
                >
                  {CLAIM_TOP[k]}
                </Text>
                <Text
                  style={[styles.cardSub, answered && CLAIM_ID[k] === 'reasons' && styles.onInk]}
                  numberOfLines={1}
                >
                  {CLAIM_SUB[k]}
                </Text>
              </View>
            </Animated.View>
          </Target>
        ))}

        {/* THE INSULT, one stroke across both, so it is visibly indifferent to
            which column it crossed. */}
        <Animated.View style={[styles.slur, slurStyle]} pointerEvents="none" />
      </Animated.View>

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={DF} k={K_FIG} />
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 20, right: 14, top: GROUND, height: 1.5, backgroundColor: RULE },
  // THE FLOOR THE GROUND LINE SITS ON. A rule on its own leaves the
  // figure and everything it is looking at standing on bare page;
  // political7 and political8 both stand their subject on a filled mass.
  floor: { position: 'absolute', left: 0, right: 0, top: GROUND, bottom: 0, backgroundColor: RULE },

  plinth: {
    position: 'absolute', top: PLINTH_Y, width: COL_W, height: PLINTH_H,
    borderWidth: 1.5, borderColor: SOFT, borderRadius: 3, backgroundColor: STONE,
  },
  who: {
    position: 'absolute', top: PLINTH_Y + 17, width: COL_W, textAlign: 'center',
    fontFamily: 'Inter_700Bold', fontSize: 8.6, letterSpacing: 1, color: SOFT, includeFontPadding: false,
  },
  slur: {
    position: 'absolute', left: 34, top: SLUR_Y, width: 332, height: 3, backgroundColor: INK,
  },

  hit: { position: 'absolute', top: CARD_Y, width: COL_W, height: CARD_H },
  card: {
    width: COL_W, height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  cardRight: { backgroundColor: INK },
  cardWrong: { borderColor: SOFT, opacity: 0.45 },
  cardTop: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.8, color: INK,
    textAlign: 'center', includeFontPadding: false,
  },
  cardSub: {
    // INK: this sub rides a card that fades to 0.55 as it falls, and SOFT does
    // not survive dimming (D35). Size carries the hierarchy.
    fontFamily: 'Inter_400Regular', fontSize: 8.6, color: INK,
    textAlign: 'center', marginTop: 4, includeFontPadding: false,
  },
  onInk: { color: PAPER },

  reason: {
    position: 'absolute', width: COL_W - 12,
    fontFamily: 'Inter_400Regular', fontSize: 8.6, color: INK, includeFontPadding: false,
  },
});

export function Logic17Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} walk={X} gesture={P} Scene={Logic17Scene} band={[212, 512]} camera={CAM} />;
}
