import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import type { MultipleChoiceInteraction } from '@/data/types';
import { T } from '../theme';

interface Props {
  interaction: MultipleChoiceInteraction;
  xpValue: number;
  onComplete: (correct: boolean) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function MultipleChoice({ interaction, onComplete }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const correctOption = interaction.options.find((o) => o.isCorrect);
  const isCorrect = answered && selectedId === correctOption?.id;

  function handleSelect(id: string) {
    if (answered) return;
    setSelectedId(id);
    setAnswered(true);
    onComplete(id === correctOption?.id);
  }

  return (
    <View style={{ marginTop: 18 }}>
      {interaction.options.map((option, i) => {
        const correct = answered && option.id === correctOption?.id;
        const wrong = answered && option.id === selectedId && !correct;
        const dim = answered && !correct && !wrong;
        return (
          <Pressable
            key={option.id}
            onPress={() => handleSelect(option.id)}
            disabled={answered}
            style={({ pressed }) => [
              styles.row,
              correct && styles.rowCorrect,
              wrong && styles.rowWrong,
              dim && { opacity: 0.4 },
              pressed && !answered && { backgroundColor: T.press },
            ]}
          >
            <View style={[styles.letter, correct && styles.letterCorrect, wrong && styles.letterWrong]}>
              <Text style={[styles.letterText, (correct || wrong) && { color: T.ink }]}>{LETTERS[i]}</Text>
            </View>
            <Text style={styles.optText}>{option.text}</Text>
          </Pressable>
        );
      })}

      {answered && (
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 240 }}
          style={styles.explain}
        >
          <Text style={[styles.explainLabel, { color: isCorrect ? T.green : T.red }]}>
            {isCorrect ? '✓ CORRECT' : '✕ NOT QUITE'}
          </Text>
          <Text style={styles.explainText}>{interaction.explanation}</Text>
          <Text style={styles.swipeHint}>SWIPE TO CONTINUE →</Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: T.panel,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  rowCorrect: { borderColor: T.green, backgroundColor: T.greenBg },
  rowWrong: { borderColor: T.red, backgroundColor: T.redBg },
  letter: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterCorrect: { backgroundColor: T.green, borderColor: T.green },
  letterWrong: { backgroundColor: T.red, borderColor: T.red },
  letterText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: T.creamSoft },
  optText: { flex: 1, minWidth: 0, fontFamily: 'PlayfairDisplay_400Regular', fontSize: 16, color: T.cream, lineHeight: 22 },

  explain: { borderLeftWidth: 2, borderLeftColor: T.border, paddingLeft: 14, marginTop: 4, marginBottom: 8 },
  explainLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, marginBottom: 6 },
  explainText: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, color: T.creamSoft, lineHeight: 21 },
  swipeHint: { fontFamily: 'Inter_700Bold', fontSize: 10, color: T.inkSoft, letterSpacing: 2, marginTop: 14 },
});
