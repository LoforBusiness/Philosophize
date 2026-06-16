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
  // The interactive check always floats on a translucent paper panel so the
  // prompt and answer rows stay crisp over any scene, light or dark.
  const dark = useSceneMeta().mode === 'dark';

  // Selecting an answer reports the result up so the runner can record it and
  // unlock the forward swipe. No "Continue" button — navigation is by swipe.
  const complete = (correct: boolean) =>
    onComplete({ cardIndex: 0, correct, xpEarned: correct ? card.xpValue : 0 });

  // Plain View (no inner scroll) so the pager's horizontal swipe stays buttery —
  // matching the quote card. Content is short enough to fit without scrolling.
  return (
    <View style={styles.content}>
      <View style={[styles.paperPanel, dark && styles.paperPanelDark]}>
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
    backgroundColor: 'rgba(250,250,247,0.94)',
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 18,
    marginHorizontal: -6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  paperPanelDark: {
    backgroundColor: 'rgba(246,245,240,0.97)',
    borderColor: 'rgba(0,0,0,0.04)',
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
