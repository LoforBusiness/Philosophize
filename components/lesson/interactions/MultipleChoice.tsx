import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { MultipleChoiceInteraction } from '@/data/types';
import CorrectFeedback from '../feedback/CorrectFeedback';
import IncorrectFeedback from '../feedback/IncorrectFeedback';

interface Props {
  interaction: MultipleChoiceInteraction;
  xpValue: number;
  onComplete: (correct: boolean) => void;
}

export default function MultipleChoice({ interaction, xpValue, onComplete }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const correctOption = interaction.options.find((o) => o.isCorrect);
  const isCorrect = answered && selectedId === correctOption?.id;

  function handleSelect(id: string) {
    if (answered) return;
    setSelectedId(id);
    setAnswered(true);
  }

  function getOptionStyle(optionId: string): object {
    if (!answered) {
      return {
        borderWidth: 2,
        borderColor: '#E8E8E3',
        borderRadius: 14,
        backgroundColor: '#FAFAF7',
        padding: 18,
        marginBottom: 12,
      };
    }
    if (optionId === correctOption?.id) {
      return {
        borderWidth: 2,
        borderColor: '#3D7A55',
        borderRadius: 14,
        backgroundColor: '#EAF3EE',
        padding: 18,
        marginBottom: 12,
      };
    }
    if (optionId === selectedId) {
      return {
        borderWidth: 2,
        borderColor: '#A83232',
        borderRadius: 14,
        backgroundColor: '#F7EAEA',
        padding: 18,
        marginBottom: 12,
      };
    }
    // Other options after answer — dimmed
    return {
      borderWidth: 2,
      borderColor: '#E8E8E3',
      borderRadius: 14,
      backgroundColor: '#FAFAF7',
      padding: 18,
      marginBottom: 12,
      opacity: 0.4,
    };
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
        {interaction.options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => handleSelect(option.id)}
            style={({ pressed }) => ({
              ...getOptionStyle(option.id),
              opacity:
                pressed && !answered
                  ? 0.7
                  : (getOptionStyle(option.id) as any).opacity ?? 1,
            })}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 17,
                color: '#1A1A1A',
              }}
            >
              {option.text}
            </Text>
          </Pressable>
        ))}
      </View>

      {answered && isCorrect && (
        <CorrectFeedback
          explanation={interaction.explanation}
          xpEarned={xpValue}
          onContinue={() => onComplete(true)}
        />
      )}
      {answered && !isCorrect && (
        <IncorrectFeedback
          explanation={interaction.explanation}
          onContinue={() => onComplete(false)}
        />
      )}
    </View>
  );
}
