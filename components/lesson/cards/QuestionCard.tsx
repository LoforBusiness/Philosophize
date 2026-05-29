import { View, Text } from 'react-native';
import type { QuestionCard as QuestionCardType, AnswerResult } from '@/data/types';
import MultipleChoice from '../interactions/MultipleChoice';
import TrueFalse from '../interactions/TrueFalse';

interface Props {
  card: QuestionCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function QuestionCard({ card, onComplete }: Props) {
  function handleInteractionComplete(correct: boolean) {
    onComplete({
      cardIndex: 0,
      correct,
      xpEarned: correct ? card.xpValue : 0,
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF7' }}>
      {/* Question header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 20, marginBottom: 8 }}>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            color: '#6B6B6B',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          Question
        </Text>
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 22,
            color: '#1A1A1A',
            lineHeight: 32,
          }}
        >
          {card.prompt}
        </Text>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: '#E8E8E3',
          marginTop: 16,
          marginBottom: 4,
        }}
      />

      {/* Interaction */}
      {card.interaction.type === 'multiple-choice' && (
        <MultipleChoice
          interaction={card.interaction}
          xpValue={card.xpValue}
          onComplete={handleInteractionComplete}
        />
      )}
      {card.interaction.type === 'true-false' && (
        <TrueFalse
          interaction={card.interaction}
          xpValue={card.xpValue}
          onComplete={handleInteractionComplete}
        />
      )}
    </View>
  );
}
