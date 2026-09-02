import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { INK, PAPER, RIGHT, RIGHT_BG, WRONG, WRONG_BG } from './cinematicKit';
import type { ChoiceCard } from './cinematicKit';
import { LIP } from '@/constants/design';
import { XP_PER_CORRECT_ANSWER } from '@/constants/xp';

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
/**
 * THE SEED IS THE QUESTION'S OWN WORDS, NOT WHERE IT SITS.
 *
 * It used to be `${lesson.id}#${beatIndex}`, and that is stable only while nobody
 * re-cuts the narration. J12's segmenting split inserted 492 beats, every later
 * index shifted, all 36 shuffles re-rolled at once, and the corpus landed at 67%
 * left — a reader could guess by position, for no reason anyone intended.
 *
 * A question's identity is what it ASKS. Seeding on the first card's text means
 * splitting a paragraph three beats earlier cannot move which side an answer
 * lands on, and two questions can only collide by being word-for-word identical.
 *
 * Exported so `check:answers` seeds exactly as the player does. It used to build
 * the string itself, in its own file, which is two copies of one rule.
 */
export function seedFor(lessonId: string, cards: readonly { text: string }[]): string {
  return `${lessonId}#${cards[0]?.text ?? ''}`;
}

export function swapFor(seed: string): boolean {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  // A FINALISER, BECAUSE THE LOW BIT OF h*31 + c IS NOT A COIN.
  //
  // The comment above used to say a better-distributed hash would buy nothing.
  // That was measured and it is false: seeds sharing most of their characters —
  // and every seed here starts with the same lesson id — leave the low bits
  // dominated by what they have in common, so the split came out 67/33 and a
  // reader could guess by position. This repo has diagnosed the identical fault
  // once before, in the reward cloud's quip picker, and for the identical reason.
  //
  // Murmur3's finaliser costs four operations and makes the low bit depend on
  // every byte of the seed. check:answers measures the real split rather than
  // trusting that claim.
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
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

  const a = useSharedValue(0);      // 0 open, 1 reacted
  const down = useSharedValue(0);   // 1 while a finger is on this card
  const wob = useSharedValue(0);    // the wrong-answer shake, +1 / -1 / 0

  useEffect(() => {
    if (!answered) { a.value = 0; return; }
    a.value = withDelay(60, withTiming(1, { duration: REACT, easing: Easing.out(Easing.cubic) }));
  }, [answered, a]);

  // THE SHAKE. Only the card that was actually taken and was wrong — a refusal,
  // aimed at the choice the reader made rather than played over the whole row.
  // Four crossings, decaying, which is a head-shake; two reads as a glitch and
  // six reads as a error dialog.
  const missed = answered && mine && !card.correct;
  useEffect(() => {
    if (!missed) { wob.value = 0; return; }
    wob.value = withSequence(
      withTiming(1, { duration: 55 }),
      withTiming(-1, { duration: 55 }),
      withTiming(0.55, { duration: 50 }),
      withTiming(-0.55, { duration: 50 }),
      withTiming(0, { duration: 45 }),
    );
  }, [missed, wob]);

  const style = useAnimatedStyle(() => {
    const t = a.value;
    // THE CHUNK. Unanswered, the card rides `LIP.button` above its own ledge and
    // drops onto it under a finger. Every branch below returns the same four
    // transforms in the same order — Reanimated will interpolate a transform
    // array positionally, and a branch that drops `translateX` shifts what every
    // later entry means.
    if (!answered) {
      return {
        opacity: 1,
        transform: [{ translateX: 0 }, { translateY: down.value * LIP.button }, { scale: 1 }, { rotate: '0deg' }],
      };
    }
    if (chosen && card.correct) {
      // Taken: rises and settles, slightly larger. The seal lands on it.
      return { opacity: 1, transform: [{ translateX: 0 }, { translateY: -10 * t }, { scale: 1 + 0.06 * t }, { rotate: '0deg' }] };
    }
    if (revealed) {
      // The true one they did not take: lifts and holds, so the answer is shown.
      return { opacity: 1, transform: [{ translateX: 0 }, { translateY: -10 * t }, { scale: 1 + 0.06 * t }, { rotate: '0deg' }] };
    }
    if (mine) {
      // TAKEN AND WRONG. It used to fall into the crumple branch below and fade
      // to 0.14 — so the reader's own answer quietly disappeared and the only
      // thing left on screen was the right one rising. That tells you what the
      // answer is and never tells you that you got it wrong. It stays, in red,
      // and shakes its head.
      return {
        opacity: 1,
        transform: [{ translateX: wob.value * 7 }, { translateY: 0 }, { scale: 1 - 0.04 * t }, { rotate: '0deg' }],
      };
    }
    // Crumples away — down, small, and off true, which reads as discarded rather
    // than merely hidden. It does NOT fall far: at 12 units it drifted onto the
    // prompt line underneath, which a screenshot caught. Six units and a deeper
    // fade say the same thing without landing on the question.
    return {
      opacity: 1 - 0.86 * t,
      transform: [{ translateX: 0 }, { translateY: 6 * t }, { scale: 1 - 0.16 * t }, { rotate: `${5 * t}deg` }],
    };
  });

  // THE PAYMENT, SHOWN WHERE IT WAS EARNED. The number was only ever on the
  // reward screen after the lesson; this is it leaving the card that won it.
  const xp = useSharedValue(0);
  useEffect(() => {
    if (!(chosen && card.correct)) { xp.value = 0; return; }
    xp.value = withDelay(240, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [chosen, card.correct, xp]);
  const xpStyle = useAnimatedStyle(() => ({
    opacity: xp.value === 0 ? 0 : Math.min(1, xp.value * 4) * (1 - Math.max(0, (xp.value - 0.6) / 0.4)),
    transform: [{ translateY: -26 * xp.value }],
  }));

  const seal = useSharedValue(0);
  useEffect(() => {
    if (!(chosen && card.correct) && !missed) { seal.value = 0; return; }
    // A thump: overshoots hard and settles, arriving after the card has begun to rise.
    seal.value = withDelay(180, withSequence(
      withTiming(1.35, { duration: 110, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 9, stiffness: 220 }),
    ));
  }, [chosen, card.correct, missed, seal]);
  const sealStyle = useAnimatedStyle(() => ({
    opacity: seal.value > 0 ? 1 : 0,
    transform: [{ scale: seal.value }, { rotate: '-12deg' }],
  }));

  const body = (
    <Animated.View
      style={[
        styles.card,
        answered && card.correct && styles.cardTrue,
        missed && styles.cardMiss,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          answered && card.correct && styles.textTrue,
          missed && styles.textMiss,
        ]}
        numberOfLines={3}
      >
        {card.text}
      </Text>
      {/* MOUNTED ONLY WHEN IT IS EARNED, not hidden at opacity 0. A View that is
          merely transparent still contributes its text: measured in a browser,
          every card read "It did not rain ✓" from the moment it appeared, which
          a screen reader would say out loud on both of them. */}
      {chosen && card.correct ? (
        <Animated.View style={[styles.seal, styles.sealTrue, sealStyle]} pointerEvents="none">
          <Text style={[styles.sealMark, styles.sealMarkOn]}>✓</Text>
        </Animated.View>
      ) : null}
      {missed ? (
        <Animated.View style={[styles.seal, styles.sealMiss, sealStyle]} pointerEvents="none">
          <Text style={[styles.sealMark, styles.sealMarkOn]}>✕</Text>
        </Animated.View>
      ) : null}
      {chosen && card.correct ? (
        <Animated.View style={[styles.xpFly, xpStyle]} pointerEvents="none">
          <Text style={styles.xpFlyText}>{`+${XP_PER_CORRECT_ANSWER} XP`}</Text>
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
      onPressIn={() => { down.value = 1; }}
      onPressOut={() => { down.value = 0; }}
    >
      {/* The ledge the card sits on. Fixed `paddingBottom`, never animated, so
          Yoga never re-measures and the prompt below cannot shift on a press —
          see components/ui/Button for the version of this that got it wrong. */}
      <View style={{ paddingBottom: answered ? 0 : LIP.button }}>
        {!answered ? <View pointerEvents="none" style={styles.cardLip} /> : null}
        {body}
      </View>
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
  // The ledge: a slab of ink sitting `LIP.button` lower than the face, so the
  // face covers all but the bottom sliver of it. Pressing drops the face onto it.
  cardLip: {
    position: 'absolute', left: 0, right: 0, top: LIP.button, bottom: 0,
    borderRadius: 4, backgroundColor: INK,
  },
  // THE ANSWER STATES. This used to be `borderWidth: 3` and nothing else, on the
  // grounds that the app has no second colour — but the CARD runner it replaces
  // has tinted its answered rows green and red since before this format existed
  // (components/lesson/theme.ts), and design.ts adopted the same two hexes app
  // wide. One pixel of extra border was the weakest feedback in either runner,
  // on the moment that most needs to land. See cinematicKit's token block.
  cardTrue: { borderWidth: 3, borderColor: RIGHT, backgroundColor: RIGHT_BG },
  cardMiss: { borderWidth: 3, borderColor: WRONG, backgroundColor: WRONG_BG },
  text: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    lineHeight: 18,
    color: INK,
    textAlign: 'center',
  },
  textTrue: { color: RIGHT },
  textMiss: { color: WRONG },
  seal: {
    position: 'absolute',
    right: -8, top: -10,
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: INK,
    backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  sealTrue: { borderColor: RIGHT, backgroundColor: RIGHT },
  sealMiss: { borderColor: WRONG, backgroundColor: WRONG },
  sealMark: { fontFamily: 'Inter_700Bold', fontSize: 14, color: INK, marginTop: -1 },
  sealMarkOn: { color: PAPER },
  // Rises off the card that won it and fades. Absolutely positioned and
  // pointer-inert, so it never touches the row's layout or its hit area.
  xpFly: { position: 'absolute', top: -6, alignSelf: 'center' },
  xpFlyText: { fontFamily: 'Inter_700Bold', fontSize: 13, letterSpacing: 0.4, color: RIGHT },
});
