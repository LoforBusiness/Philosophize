import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { QuestionCard as QuestionCardType, AnswerResult } from '@/data/types';
import MultipleChoice from '../interactions/MultipleChoice';
import TrueFalse from '../interactions/TrueFalse';
import SortItems from '../interactions/SortItems';
import LessonScene, { type SceneKey } from '../scenes/LessonScene';
import { T } from '../theme';

interface Props {
  card: QuestionCardType;
  onComplete: (result?: AnswerResult) => void;
  scene?: SceneKey;
}

export default function QuestionCard({ card, onComplete, scene }: Props) {
  // Questions are never read aloud — they are shown in full, in silence, so you
  // read and answer them yourself.
  const complete = (correct: boolean) =>
    onComplete({ cardIndex: 0, correct, xpEarned: correct ? card.xpValue : 0 });

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LessonScene scene={scene} compact />
      <Text style={styles.kicker}>KNOWLEDGE CHECK</Text>
      <Text style={styles.title}>Quick Check</Text>
      <Text style={styles.subtitle}>Let's see what stayed with you</Text>

      <View style={styles.qCard}>
        <Text style={styles.qLabel}>QUESTION</Text>
        <Text style={styles.qText}>{card.prompt}</Text>
      </View>

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
  content: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 28 },
  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: T.gold, letterSpacing: 3 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: T.cream, marginTop: 6 },
  subtitle: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: T.creamSoft, marginTop: 3 },
  qCard: { backgroundColor: T.cardCream, borderRadius: 8, padding: 18, marginTop: 18 },
  qLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, color: T.gold, letterSpacing: 2 },
  qText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: T.ink, lineHeight: 26, marginTop: 8 },
});
