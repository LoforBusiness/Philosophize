import { View, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import type { QuestionCard as QuestionCardType, AnswerResult } from '@/data/types';
import MultipleChoice from '../interactions/MultipleChoice';
import TrueFalse from '../interactions/TrueFalse';
import SortItems from '../interactions/SortItems';
import TapFlaw from '../interactions/TapFlaw';
import TwoCamps from '../interactions/TwoCamps';
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

  // A gesture-handler ScrollView (same as DilemmaCard) so a long prompt + four
  // options + the revealed explanation are always reachable — with no scroll,
  // tall questions clipped at BOTH ends (centered) and the explanation could be
  // cut off entirely. Short questions still sit centered via flexGrow. The
  // pager's horizontal pan (activeOffsetX ±8) coordinates cleanly with the
  // vertical scroll, so the swipe feel is unchanged.
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
        {card.interaction.type === 'tap-flaw' && (
          <TapFlaw interaction={card.interaction} xpValue={card.xpValue} onComplete={complete} />
        )}
        {card.interaction.type === 'two-camps' && (
          <TwoCamps interaction={card.interaction} xpValue={card.xpValue} onComplete={complete} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingTop: 8, paddingBottom: 28 },
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
