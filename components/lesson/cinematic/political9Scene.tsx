import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useDerivedValue, useAnimatedStyle } from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import Stickman from './Stickman';
import CinematicPlayer from './CinematicPlayer';
import {
  WALK, clamp01, ease01, emoteHold, emoteLive, lerp, moveTr, pose, travelStance, type Bundle,
} from './rig';
import { BEATS } from './political9Script';
import { GROUND, K_FIG, STAGE_W, STAGE_H, INK, SOFT, RULE, PAPER } from './cinematicKit';
import type { SceneApi } from './CinematicPlayer';
import Target from './Target';

// Four on the left, one on the right, and a line between them.
//
// COMPOSITION / OCCLUSION —
//   · every figure is drawn at 0.82 of the shared K_FIG — 84 units tall, crown at
//     y 415, head radius 16.4 — because five full-size figures do not fit on a
//     400-wide stage and a crowd is meant to read as a crowd anyway.
//   · THE FOUR stand at x 44 / 100 / 156 / 212 and advance to 60 / 116 / 172 / 228.
//     56 apart is deliberately CLOSER than the ~100 B9 asks for, and the reason is
//     the reason B9 exists: at 56 with a head radius of 16.4 there are still 23
//     units of paper between adjacent skulls, so they read as four people rather
//     than one blob — but they read as a GROUP, which is the whole point of them.
//     A5: this is a considered exception, not a missed check.
//   · THE ONE stands alone at x 330. At their closest the nearest of the four is at
//     228, so 102 between centres — past B9 proper, because that pair is the
//     confrontation and has to read as two.
//   · THE RIGHTS LINE is a vertical rule at x 282, y 330 … 500 — in the 24 units of
//     clear floor between the advanced crowd's edge (258) and the one (300).
//   · the TALLY board is x 120 … 280, y 210 … 262, well above every crown.
//   · the three cards sit x 30 … 250, y 300 … 391 — above the crowns at 415 and
//     left of the lone figure's column, which starts at x 300.
// Nothing is drawn above y 210 or below the ground line, hence band [200, 512].

const K = K_FIG * 0.82;
const CROWD_A = [44, 100, 156, 212];
const CROWD_B = [60, 116, 172, 228];
const ONE_X = 330;

const RIGHTS_X = 282;
const RIGHTS_T = 330;

const TALLY_L = 120;
const TALLY_W = 160;
const TALLY_T = 210;

const CARD_L = 30;
const CARD_W = 220;
// SIZED FOR A FINGER: 27 tall on a 32 pitch rendered as a 24dp card every 29dp,
// against a fingertip covering ~45dp — so a tap overlapped its neighbours and
// often scored the wrong one. The stack now runs from 205 down to 389, stopping
// 8 units clear of the figure's crown at 397, entirely inside the existing band.
const CARD_T = 205;
const CARD_H = 44;
const CARD_GAP = 70;
/** Half the gap — any more and neighbouring targets overlap, and the topmost wins. */
const CARD_SLOP = (CARD_GAP - CARD_H) / 2;

const CARDS = [
  { id: 'count', text: 'A more careful count', correct: false },
  { id: 'rights', text: 'A right the vote cannot touch', correct: true },
  { id: 'bigger', text: 'A bigger majority next time', correct: false },
];

const VOTE = BEATS.map((b) => b.vote ?? 0);
const ADV = BEATS.map((b) => (b.advance ? 1 : 0));
const ONE = BEATS.map((b) => b.one ?? 0);

export default function Political9Scene({ clock, bt, bi, i, picked, onPick }: SceneApi) {
  const cur = BEATS[i];
  const prev = i > 0 ? BEATS[i - 1] : undefined;

  const tallyOn = !!cur.tally;
  const tallyFade = tallyOn !== !!prev?.tally;
  const rightsOn = !!cur.rights;
  const rightsFade = rightsOn !== !!prev?.rights;
  const cardsOn = !!cur.cards;
  const cardsFade = cardsOn !== !!prev?.cards;
  const answered = picked !== null;

  const SCENE = useDerivedValue(() => {
    const n = bi.value;
    const p = n > 0 ? n - 1 : 0;
    const t = clock.value;
    const grow = ease01(bt.value / 0.6);

    // The crowd's walk takes the time its distance needs, like anyone else's.
    const from = ADV[p] ? CROWD_B : CROWD_A;
    const to = ADV[n] ? CROWD_B : CROWD_A;
    const tr = ease01(bt.value / moveTr(from[0], to[0], 0.85));

    // Every one of the four gets its own seed AND its own clock offset. The seed
    // varies the walk; the offset varies the standing — two figures idling from one
    // clock breathe and rock on identical frames and read as a single puppet, and
    // with four of them side by side that is unmissable (B14).
    const member = (k: number) => {
      'worklet';
      const off = t + k * 1.63;
      const g = VOTE[n] > 0 ? 20 : 0;
      const gp = VOTE[p] > 0 ? 20 : 0;
      const s = travelStance(
        from[k], to[k],
        emoteHold(gp, off), emoteHold(g, off), emoteLive(g, off, bt.value),
        tr, WALK, k + 1,
      );
      return pose(s, lerp(from[k], to[k], tr), GROUND, K, 1, 1);
    };

    const oneS = travelStance(
      ONE_X, ONE_X,
      emoteHold(ONE[p], t + 7.4), emoteHold(ONE[n], t + 7.4),
      emoteLive(ONE[n], t + 7.4, bt.value), tr, WALK, 9,
    );

    return {
      c0: member(0), c1: member(1), c2: member(2), c3: member(3),
      one: pose(oneS, ONE_X, GROUND, K, -1, 1),
      tally: (tallyOn ? 1 : 0) * (tallyFade ? grow : 1),
      // The line is DRAWN, downward, on the beat it arrives — it is the one thing on
      // this stage that answers the advance, so it gets to be the thing that moves.
      rights: rightsOn ? (rightsFade ? ease01(clamp01(bt.value / 0.7)) : 1) : 0,
      t,
    };
  });

  const C0 = useDerivedValue<Bundle>(() => SCENE.value.c0);
  const C1 = useDerivedValue<Bundle>(() => SCENE.value.c1);
  const C2 = useDerivedValue<Bundle>(() => SCENE.value.c2);
  const C3 = useDerivedValue<Bundle>(() => SCENE.value.c3);
  const OF = useDerivedValue<Bundle>(() => SCENE.value.one);

  const tallyStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.tally }));
  const railStyle = useAnimatedStyle(() => ({
    opacity: SCENE.value.rights > 0 ? 1 : 0,
    height: SCENE.value.rights * (GROUND - RIGHTS_T),
  }));
  const rightsCapStyle = useAnimatedStyle(() => ({ opacity: SCENE.value.rights }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardsOn ? (cardsFade ? ease01(bt.value / 0.6) : 1) : 0,
  }));

  return (
    <Animated.View style={styles.scene}>
      {/* ── the count ───────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.tally, tallyStyle]} pointerEvents="none">
        <Text style={styles.tallyTag}>THE VOTE</Text>
        <View style={styles.tallyRow}>
          <Text style={styles.tallyBig}>7</Text>
          <Text style={styles.tallyDash}>—</Text>
          <Text style={styles.tallyBig}>1</Text>
        </View>
      </Animated.View>

      {/* ── the line the count does not cross ───────────────────────────────── */}
      <Animated.View style={[styles.rail, railStyle]} pointerEvents="none" />
      <Animated.View style={[styles.rightsCap, rightsCapStyle]} pointerEvents="none">
        <Text style={styles.rightsText}>RIGHTS</Text>
      </Animated.View>

      {/* ── Q2: what is actually holding them? ──────────────────────────────── */}
      {cardsOn &&
        CARDS.map((c, k) => {
          const chosen = picked === c.id;
          return (
            <Animated.View key={c.id} style={[styles.cardSlot, { top: CARD_T + k * CARD_GAP }, cardStyle]}>
              <Target id={c.id} correct={c.correct} picked={picked} onPick={onPick}
              disabled={answered} hitSlop={{ top: CARD_SLOP, bottom: CARD_SLOP, left: CARD_SLOP, right: CARD_SLOP }}>
                <View
                  style={[
                    styles.card,
                    answered && c.correct && styles.cardRight,
                    answered && chosen && !c.correct && styles.cardWrong,
                  ]}
                >
                  <Text style={[styles.cardText, answered && c.correct && styles.cardTextOn]}>
                    {c.text}
                  </Text>
                </View>
              </Target>
            </Animated.View>
          );
        })}

      <View style={styles.ground} pointerEvents="none" />
      <Stickman D={C0} k={K} />
      <Stickman D={C1} k={K} />
      <Stickman D={C2} k={K} />
      <Stickman D={C3} k={K} />
      <Stickman D={OF} k={K} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scene: { position: 'absolute', left: 0, top: 0, width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' },
  ground: { position: 'absolute', left: 16, right: 16, top: GROUND, height: 1.5, backgroundColor: RULE },

  tally: {
    position: 'absolute', left: TALLY_L, top: TALLY_T, width: TALLY_W,
    borderWidth: 2.5, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', paddingVertical: 7,
  },
  tallyTag: {
    fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1.8, color: SOFT,
    includeFontPadding: false,
  },
  tallyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 },
  tallyBig: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: INK, includeFontPadding: false,
  },
  tallyDash: { fontFamily: 'Inter_400Regular', fontSize: 15, color: SOFT, includeFontPadding: false },

  // A single heavy vertical rule. It is the only vertical line on the stage, so it
  // reads as a boundary rather than as another prop.
  rail: { position: 'absolute', left: RIGHTS_X, top: RIGHTS_T, width: 3, backgroundColor: INK },
  rightsCap: { position: 'absolute', left: RIGHTS_X - 34, top: RIGHTS_T - 18, width: 72, alignItems: 'center' },
  rightsText: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 2, color: INK,
    includeFontPadding: false,
  },

  cardSlot: { position: 'absolute', left: CARD_L, width: CARD_W },
  card: {
    height: CARD_H, borderWidth: 2, borderColor: INK, borderRadius: 4, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  cardRight: { backgroundColor: INK, borderColor: INK },
  cardWrong: { borderColor: SOFT, opacity: 0.45 },
  cardText: {
    fontFamily: 'Inter_500Medium', fontSize: 11.5, color: INK, includeFontPadding: false,
  },
  cardTextOn: { color: PAPER, fontFamily: 'Inter_700Bold',
    includeFontPadding: false,
  },
});

// Art runs from the tally board (210) to the ground line (500). Five figures at
// 0.82 crown out at y 415, below every card and both boards.
export function Political9Lesson({ lesson }: { lesson: Lesson }) {
  return <CinematicPlayer lesson={lesson} beats={BEATS} Scene={Political9Scene} band={[200, 512]} />;
}
