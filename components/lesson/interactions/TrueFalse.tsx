import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { TrueFalseInteraction } from '@/data/types';
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

  function buttonStyle(value: boolean): object {
    if (!answered) {
      return {
        flex: 1,
        height: 140,
        borderWidth: 2,
        borderColor: '#E8E8E3',
        borderRadius: 14,
        backgroundColor: '#FAFAF7',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      };
    }
    if (value === interaction.answer) {
      return {
        flex: 1,
        height: 140,
        borderWidth: 2,
        borderColor: '#3D7A55',
        borderRadius: 14,
        backgroundColor: '#EAF3EE',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      };
    }
    if (value === selected) {
      return {
        flex: 1,
        height: 140,
        borderWidth: 2,
        borderColor: '#A83232',
        borderRadius: 14,
        backgroundColor: '#F7EAEA',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      };
    }
    // The other option — dimmed
    return {
      flex: 1,
      height: 140,
      borderWidth: 2,
      borderColor: '#E8E8E3',
      borderRadius: 14,
      backgroundColor: '#FAFAF7',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      opacity: 0.4,
    };
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        {([true, false] as const).map((val) => (
          <Pressable
            key={String(val)}
            onPress={() => handleSelect(val)}
            style={({ pressed }) => ({
              ...buttonStyle(val),
              opacity:
                pressed && !answered
                  ? 0.7
                  : (buttonStyle(val) as any).opacity ?? 1,
            })}
          >
            <Text
              style={{
                fontFamily: 'Caveat_700Bold',
                fontSize: 28,
                color: '#1A1A1A',
              }}
            >
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
