import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { INK, PAPER } from './cinematicKit';
import type { ChoiceCard } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// TWO CHOICES, STANDING ON THE PICTURE.
//
// This replaces the A/B/C/D list under the stage, which was the oldest and
// least-liked thing in the lesson format: four options, each a sentence, read in
// a deck below the drawing while the drawing waited. A reader's own words for it
// were "too much to read, boring, and not very fun".
//
// ── WHY TWO, AND WHY SHORT ──────────────────────────────────────────────────
//
// Four options is not four times the teaching, it is four times the reading, and
// three of them are wrong. §13 says a good wrong answer is tempting for a
// NAMEABLE reason and the explanation should name it — which means exactly one
// distractor is doing real work and the other two are filler. So a converted
// question keeps the correct answer and the one distractor the explanation
// already argues against, and cuts both to a few words. `validate-cinematic`
// fails a card over the limit, so "too much to read" is a number rather than a
// matter of taste.
//
// ── WHERE THEY SIT, AND THE TWO PLACES THAT DO NOT WORK ─────────────────────
//
// IN THE SCENE, in scene coordinates, is the obvious idea and it is wrong: the
// stage is a 400×560 space that every lesson CROPS to its own band and that
// `followMoves` pushes a camera around inside. A card placed there is a card
// that 100 lessons each get to clip differently, which is the whole reason H60
// exists.
//
// PINNED OVER THE STAGE'S LOWER EDGE was the second idea, and a browser killed
// it in one screenshot: the figure stands ON the ground line, which is the
// bottom of the band, so the cards landed squarely on top of him. Across 102
// lessons that covers the man — and sometimes covers the very thing the question
// is about, which is rule A1 with the answer hidden behind the answer.
//
// So they sit DIRECTLY UNDER the art and above the prompt: still the first thing
// under the picture, still ink on paper, still nothing to read but a few words —
// but they cover nothing and need no per-lesson placement.
//
// ── AND NOTHING HERE ANIMATES AN SVG PROPERTY ───────────────────────────────
//
// Cards are Views. The reaction is transforms and opacity on those Views, which
// is the §17 shape: the painted area is small, it is composited on the UI
// thread, and the inert art underneath is not repainted by any of it.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  cards: [ChoiceCard, ChoiceCard];
  /** 'c0' | 'c1' once answered; null while the question is open. */
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /**
   * WHICH SIDE THE TRUE CARD LANDS ON — required, so no call site can forget it.
   *
   * Every one of the 130 two-card questions in the app was authored with the
   * correct answer FIRST, and nothing had ever shuffled them: measured, the true
   * card was the left one 130 times out of 130. A reader who noticed could score
   * every question in the app without reading a word of it, which is the whole
   * lesson format defeated by a habit nobody chose.
   *
   * Any stable string. It must be stable, not random: re-rolling on every render
   * would swap the cards under a reader's thumb mid-question, and re-rolling on
   * revisit would make a remembered answer wrong. Beat identity is the natural key.
   */
  seed: string;
}

/**
 * Should this question's cards be shown swapped?
 *
 * A plain character hash, taken on the seed and read one bit deep. It only has to
 * split two ways and be stable; a better-distributed hash would buy nothing, and
 * being readable here is worth more than being uniform. `check-cards` measures the
 * real split across the app rather than trusting the arithmetic.
 */
export function swapFor(seed: string): boolean {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return (h & 1) === 1;
}

/** How long the loser takes to crumple, and the winner to lift. */
const REACT = 460;

export default function ChoiceCards({ cards, picked, onPick, seed }: Props) {
  // THE ORDER IS DECIDED HERE AND NOWHERE ELSE. Doing it in the 130 scripts would
  // be 130 chances to forget, and the ones already written all forgot the same way.
  //
  // The id keeps following DISPLAY position, and `correct` keeps travelling with
  // the card object, so everything downstream — the reveal, the seal, the player's
  // scoring — is unchanged. Nothing outside this file has ever read 'c0' as "the
  // one the script wrote first", which is what makes this safe.
  const shown = swapFor(seed) ? ([cards[1], cards[0]] as const) : cards;
  return (
    <View style={styles.row} pointerEvents="box-none">
      {shown.map((c, i) => (
        <Card
          key={i}
          card={c}
          id={`c${i}`}
          picked={picked}
          onPick={onPick}
        />
      ))}
    </View>
  );
}

function Card({ card, id, picked, onPick }: {
  card: ChoiceCard; id: string; picked: string | null;
  onPick: (id: string, correct: boolean) => void;
}) {
  const answered = picked !== null;
  const mine = picked === id;
  // Three outcomes, and the third is the one that matters most: the card nobody
  // picked, which was RIGHT. A wrong answer should show the answer, not just
  // take a point away — so that card lifts and holds rather than fading out with
  // the rest of the furniture.
  const chosen = answered && mine;
  const revealed = answered && !mine && card.correct;

  const a = useSharedValue(0);   // 0 open, 1 reacted
  useEffect(() => {
    if (!answered) { a.value = 0; return; }
    a.value = withDelay(60, withTiming(1, { duration: REACT, easing: Easing.out(Easing.cubic) }));
  }, [answered, a]);

  const style = useAnimatedStyle(() => {
    const t = a.value;
    if (!answered) return { opacity: 1, transform: [{ scale: 1 }, { rotate: '0deg' }, { translateY: 0 }] };
    if (chosen && card.correct) {
      // Taken: rises and settles, slightly larger. The seal lands on it.
      return { opacity: 1, transform: [{ translateY: -10 * t }, { scale: 1 + 0.06 * t }, { rotate: '0deg' }] };
    }
    if (revealed) {
      // The true one they did not take: lifts and holds, so the answer is shown.
      return { opacity: 1, transform: [{ translateY: -10 * t }, { scale: 1 + 0.06 * t }, { rotate: '0deg' }] };
    }
    // Crumples away — down, small, and off true, which reads as discarded rather
    // than merely hidden. It does NOT fall far: at 12 units it drifted onto the
    // prompt line underneath, which a screenshot caught. Six units and a deeper
    // fade say the same thing without landing on the question.
    return {
      opacity: 1 - 0.86 * t,
      transform: [{ translateY: 6 * t }, { scale: 1 - 0.16 * t }, { rotate: `${5 * t}deg` }],
    };
  });

  const seal = useSharedValue(0);
  useEffect(() => {
    if (!(chosen && card.correct)) { seal.value = 0; return; }
    // A thump: overshoots hard and settles, arriving after the card has begun to rise.
    seal.value = withDelay(180, withSequence(
      withTiming(1.35, { duration: 110, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 9, stiffness: 220 }),
    ));
  }, [chosen, card.correct, seal]);
  const sealStyle = useAnimatedStyle(() => ({
    opacity: seal.value > 0 ? 1 : 0,
    transform: [{ scale: seal.value }, { rotate: '-12deg' }],
  }));

  const body = (
    <Animated.View style={[styles.card, answered && card.correct && styles.cardTrue, style]}>
      <Text style={styles.text} numberOfLines={3}>{card.text}</Text>
      {/* MOUNTED ONLY WHEN IT IS EARNED, not hidden at opacity 0. A View that is
          merely transparent still contributes its text: measured in a browser,
          every card read "It did not rain ✓" from the moment it appeared, which
          a screen reader would say out loud on both of them. */}
      {chosen && card.correct ? (
        <Animated.View style={[styles.seal, sealStyle]} pointerEvents="none">
          <Text style={styles.sealMark}>✓</Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );

  // NOT a `Target`. That component exists to put a breathing ring on a piece of
  // SCENE ART so a reader can tell it is tappable — 15 of the existing 82 prompts
  // pointed at something with no affordance at all. A card with an ink border on
  // paper already says "press me", and Target also registers with the scene's
  // target context for counting and must-box reporting, which these are outside
  // of by design. Ringing a button is the affordance twice.
  //
  // `disabled` once answered, because the player latches `picked` but a reader
  // can still physically press a second time.
  return (
    <Pressable
      style={styles.slot}
      disabled={answered}
      accessibilityRole="button"
      accessibilityLabel={card.text}
      onPress={() => onPick(id, card.correct)}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  slot: { flex: 1, maxWidth: 190 },
  card: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: INK,
    borderRadius: 4,
    backgroundColor: PAPER,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The true card thickens rather than colouring — §19 has no second colour.
  cardTrue: { borderWidth: 3 },
  text: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    lineHeight: 18,
    color: INK,
    textAlign: 'center',
  },
  seal: {
    position: 'absolute',
    right: -8, top: -10,
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: INK,
    backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  sealMark: { fontFamily: 'Inter_700Bold', fontSize: 14, color: INK, marginTop: -1 },
});
