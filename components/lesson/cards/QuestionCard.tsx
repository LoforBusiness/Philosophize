import { Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import type { QuestionCard as QuestionCardType, AnswerResult } from '@/data/types';
import MultipleChoice from '../interactions/MultipleChoice';
import TrueFalse from '../interactions/TrueFalse';
import SortItems from '../interactions/SortItems';
import { T } from '../theme';

interface Props {
  card: QuestionCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function QuestionCard({ card, onComplete }: Props) {
  // Selecting an answer reports the result up so the runner can record it and
  // unlock the forward swipe. No "Continue" button — navigation is by swipe.
  const complete = (correct: boolean) =>
    onComplete({ cardIndex: 0, correct, xpEarned: correct ? card.xpValue : 0 });

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>KNOWLEDGE CHECK</Text>
      <Text style={styles.title}>Quick Check</Text>

      <Text style={styles.qText}>{card.prompt}</Text>

      {card.interaction.type === 'multiple-choice' && (
        <MultipleChoice interaction={card.interaction} xpValue={card.xpValue} onComplete={complete} />
      )}
      {card.interaction.type === 'true-false' && (
        <TrueFalse interaction={card.interaction} xpValue={card.xpValue} onComplete={complete} />
      )}
      {card.interaction.type === 'sort' && (
        <SortItems interaction={card.interaction} xpValue={card.xpValue} onComplete={complete} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 28 },
  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: T.gold, letterSpacing: 3 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: T.ink, marginTop: 6 },
  qText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: T.ink,
    lineHeight: 29,
    marginTop: 16,
  },
});
