import { useState } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import type { QuestionCard as QuestionCardType, AnswerResult } from '@/data/types';
import MultipleChoice from '../interactions/MultipleChoice';
import TrueFalse from '../interactions/TrueFalse';
import KineticNarration from '../KineticNarration';

interface Props {
  card: QuestionCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function QuestionCard({ card, onComplete }: Props) {
  const [promptDone, setPromptDone] = useState(false);

  function handleInteractionComplete(correct: boolean) {
    onComplete({
      cardIndex: 0,
      correct,
      xpEarned: correct ? card.xpValue : 0,
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* Spoken, kinetic prompt */}
      <View style={{ height: 190 }}>
        <KineticNarration
          text={card.prompt}
          variant="prompt"
          onDone={() => setPromptDone(true)}
        />
      </View>

      {/* Answer choices — never narrated, appear once the prompt has been read */}
      {promptDone && (
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 240 }}
          style={{ flex: 1 }}
        >
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
        </MotiView>
      )}
    </View>
  );
}
