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
// ── WHY THEY ARE PINNED TO THE STAGE, NOT PLACED IN IT ──────────────────────
//
// The obvious thing is to draw them in scene coordinates so they stand among the
// art. They cannot be: the stage is a 400×560 design space that every lesson
// CROPS to its own band and that `followMoves` pushes the camera around inside.
// A card placed in scene space is a card that 100 lessons each get to clip
// differently, and H60 exists because that is exactly what happens.
//
// So they are positioned against the stage's own lower edge instead — on the
// picture, over the art, in the same ink and paper, but outside the band crop
// and outside the camera transform. No per-lesson placement to get wrong, and
// nothing a push can cut in half.
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
}

/** How long the loser takes to crumple, and the winner to lift. */
const REACT = 460;

export default function ChoiceCards({ cards, picked, onPick }: Props) {
  return (
    <View style={styles.row} pointerEvents="box-none">
      {cards.map((c, i) => (
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
    // than merely hidden.
    return {
      opacity: 1 - 0.75 * t,
      transform: [{ translateY: 12 * t }, { scale: 1 - 0.18 * t }, { rotate: `${5 * t}deg` }],
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
      <Animated.View style={[styles.seal, sealStyle]} pointerEvents="none">
        <Text style={styles.sealMark}>✓</Text>
      </Animated.View>
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
    position: 'absolute',
    left: 0, right: 0, bottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
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
