import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { MultipleChoiceInteraction } from '@/data/types';
import { Colors } from '@/constants/Colors';
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

  function getOptionStyle(optionId: string) {
    if (!answered) return { backgroundColor: Colors.navy, borderColor: Colors.navyLight };
    if (optionId === correctOption?.id) return { backgroundColor: Colors.sage + '33', borderColor: Colors.sage };
    if (optionId === selectedId) return { backgroundColor: Colors.crimson + '33', borderColor: Colors.crimson };
    return { backgroundColor: Colors.navy, borderColor: Colors.navyLight, opacity: 0.5 };
  }

  return (
    <View className="flex-1">
      <View className="flex-1 px-5 pt-4">
        {interaction.options.map((option) => (
          <Pressable
            key={option.id}
            onPress={() => handleSelect(option.id)}
            className="rounded-2xl border p-4 mb-3 active:opacity-80"
            style={getOptionStyle(option.id)}
          >
            <Text
              style={{ fontFamily: 'Inter_500Medium' }}
              className="text-parchment text-base"
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
