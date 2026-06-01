import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import type { TrueFalseInteraction } from '@/data/types';
import { T } from '../theme';

interface Props {
  interaction: TrueFalseInteraction;
  xpValue: number;
  onComplete: (correct: boolean) => void;
}

export default function TrueFalse({ interaction, onComplete }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const isCorrect = answered && selected === interaction.answer;

  function handleSelect(value: boolean) {
    if (answered) return;
    setSelected(value);
    setAnswered(true);
  }

  return (
    <View style={{ marginTop: 18 }}>
      <View style={styles.row}>
        {([true, false] as const).map((val) => {
          const correct = answered && val === interaction.answer;
          const wrong = answered && val === selected && !correct;
          const dim = answered && !correct && !wrong;
          return (
            <Pressable
              key={String(val)}
              onPress={() => handleSelect(val)}
              disabled={answered}
              style={({ pressed }) => [
                styles.box,
                correct && styles.boxCorrect,
                wrong && styles.boxWrong,
                dim && { opacity: 0.4 },
                pressed && !answered && { backgroundColor: '#2C2A26' },
              ]}
            >
              <Text style={styles.boxText}>{val ? 'True' : 'False'}</Text>
            </Pressable>
          );
        })}
      </View>

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
        </MotiView>
      )}

      <Pressable
        onPress={() => answered && onComplete(isCorrect)}
        disabled={!answered}
        style={({ pressed }) => [styles.btn, !answered ? styles.btnDisabled : null, pressed && answered && { opacity: 0.85 }]}
      >
        <Text style={[styles.btnText, !answered && { color: T.dim }]}>CONTINUE →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  box: {
    flex: 1,
    height: 120,
    backgroundColor: T.panel,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxCorrect: { borderColor: T.green, backgroundColor: T.greenBg },
  boxWrong: { borderColor: T.red, backgroundColor: T.redBg },
  boxText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: T.cream },

  explain: { borderLeftWidth: 2, borderLeftColor: T.border, paddingLeft: 14, marginTop: 16, marginBottom: 16 },
  explainLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, marginBottom: 6 },
  explainText: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, color: T.creamSoft, lineHeight: 21 },

  btn: { backgroundColor: T.cream, borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  btnDisabled: { backgroundColor: T.panel, borderWidth: 1.5, borderColor: T.border },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: T.ink, letterSpacing: 1 },
});
