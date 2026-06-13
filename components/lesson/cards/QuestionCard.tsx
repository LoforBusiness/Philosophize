import { View, Text, StyleSheet } from 'react-native';
import type { QuestionCard as QuestionCardType, AnswerResult } from '@/data/types';
import MultipleChoice from '../interactions/MultipleChoice';
import TrueFalse from '../interactions/TrueFalse';
import SortItems from '../interactions/SortItems';
import { useSceneMeta } from '../sceneContext';
import { T } from '../theme';

interface Props {
  card: QuestionCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function QuestionCard({ card, onComplete }: Props) {
  // On the dark night scenes the loose ink text would disappear, so the whole
  // check floats on a translucent paper panel instead.
  const dark = useSceneMeta().mode === 'dark';

  // Selecting an answer reports the result up so the runner can record it and
  // unlock the forward swipe. No "Continue" button — navigation is by swipe.
  const complete = (correct: boolean) =>
    onComplete({ cardIndex: 0, correct, xpEarned: correct ? card.xpValue : 0 });

  // Plain View (no inner scroll) so the pager's horizontal swipe stays buttery —
  // matching the quote card. Content is short enough to fit without scrolling.
  return (
    <View style={styles.content}>
      <View style={dark ? styles.paperPanel : undefined}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 12 },
  paperPanel: {
    backgroundColor: 'rgba(246,245,240,0.96)',
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 18,
    marginHorizontal: -6,
  },
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
