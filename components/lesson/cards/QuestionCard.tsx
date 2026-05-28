import { View, Text } from 'react-native';
import type { QuestionCard as QuestionCardType, AnswerResult } from '@/data/types';
import { XP_PER_CORRECT_ANSWER } from '@/constants/xp';
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
    <View className="flex-1 bg-midnight">
      {/* Prompt */}
      <View className="px-6 pt-4 pb-4">
        <Text
          style={{ fontFamily: 'Inter_500Medium' }}
          className="text-gold text-xs uppercase tracking-widest mb-3"
        >
          Question
        </Text>
        <Text
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          className="text-parchment text-xl leading-8"
        >
          {card.prompt}
        </Text>
      </View>

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
