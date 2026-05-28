import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { TrueFalseInteraction } from '@/data/types';
import { Colors } from '@/constants/Colors';
import CorrectFeedback from '../feedback/CorrectFeedback';
import IncorrectFeedback from '../feedback/IncorrectFeedback';

interface Props {
  interaction: TrueFalseInteraction;
  xpValue: number;
  onComplete: (correct: boolean) => void;
}

export default function TrueFalse({ interaction, xpValue, onComplete }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);

  const isCorrect = answered && selected === interaction.answer;

  function handleSelect(value: boolean) {
    if (answered) return;
    setSelected(value);
    setAnswered(true);
  }

  function buttonStyle(value: boolean) {
    if (!answered) return { backgroundColor: Colors.navy, borderColor: Colors.navyLight };
    if (value === interaction.answer) return { backgroundColor: Colors.sage + '33', borderColor: Colors.sage };
    if (value === selected) return { backgroundColor: Colors.crimson + '33', borderColor: Colors.crimson };
    return { backgroundColor: Colors.navy, borderColor: Colors.navyLight, opacity: 0.5 };
  }

  return (
    <View className="flex-1">
      <View className="flex-1 px-5 pt-4 flex-row gap-4">
        {[true, false].map((val) => (
          <Pressable
            key={String(val)}
            onPress={() => handleSelect(val)}
            className="flex-1 rounded-2xl border py-8 items-center active:opacity-80"
            style={buttonStyle(val)}
          >
            <Text className="text-4xl mb-3">{val ? '✅' : '❌'}</Text>
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-parchment text-lg">
              {val ? 'True' : 'False'}
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
