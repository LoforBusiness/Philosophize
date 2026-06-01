import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import type { SortItemsInteraction } from '@/data/types';
import CorrectFeedback from '../feedback/CorrectFeedback';
import IncorrectFeedback from '../feedback/IncorrectFeedback';
import { T } from '../theme';

interface Props {
  interaction: SortItemsInteraction;
  xpValue: number;
  onComplete: (correct: boolean) => void;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function SortItems({ interaction, xpValue, onComplete }: Props) {
  const [shuffled] = useState(() => [...interaction.items].sort((a, b) => hash(a.id) - hash(b.id)));
  const [placed, setPlaced] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);

  const byId = (id: string) => interaction.items.find((i) => i.id === id)!;
  const pool = shuffled.filter((i) => !placed.includes(i.id));
  const ready = placed.length === interaction.items.length;

  const isCorrect =
    answered &&
    placed.length === interaction.correctOrder.length &&
    placed.every((id, i) => id === interaction.correctOrder[i]);

  return (
    <View style={{ flex: 1, marginTop: 16 }}>
      <Text style={styles.hint}>Tap in order to build the argument.</Text>

      <View style={styles.buildArea}>
        {placed.length === 0 ? (
          <Text style={styles.placeholder}>Your argument will appear here…</Text>
        ) : (
          placed.map((id, i) => (
            <Pressable
              key={id}
              onPress={() => !answered && setPlaced((p) => p.filter((x) => x !== id))}
              style={styles.placedRow}
            >
              <Text style={styles.placedNum}>{i + 1}</Text>
              <Text style={styles.placedText}>{byId(id).text}</Text>
            </Pressable>
          ))
        )}
      </View>

      {!answered && pool.length > 0 && (
        <View style={styles.pool}>
          {pool.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setPlaced((p) => [...p, item.id])}
              style={({ pressed }) => [styles.chip, pressed && { backgroundColor: '#2C2A26' }]}
            >
              <Text style={styles.chipText}>{item.text}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {ready && !answered && (
        <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 200 }}>
          <Pressable
            onPress={() => setAnswered(true)}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.btnText}>CHECK →</Text>
          </Pressable>
        </MotiView>
      )}

      {answered && isCorrect && (
        <CorrectFeedback explanation={interaction.explanation} xpEarned={xpValue} onContinue={() => onComplete(true)} />
      )}
      {answered && !isCorrect && (
        <IncorrectFeedback explanation={interaction.explanation} onContinue={() => onComplete(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: T.creamSoft, marginBottom: 12 },
  buildArea: {
    borderWidth: 1.5,
    borderColor: T.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 12,
    minHeight: 70,
    marginBottom: 16,
  },
  placeholder: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 14, color: T.dim, fontStyle: 'italic', padding: 8 },
  placedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.panel,
    borderWidth: 1.5,
    borderColor: T.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    gap: 10,
  },
  placedNum: { fontFamily: 'Inter_700Bold', fontSize: 14, color: T.gold },
  placedText: { flex: 1, fontFamily: 'PlayfairDisplay_400Regular', fontSize: 15, color: T.cream, lineHeight: 21 },
  pool: { gap: 10, marginBottom: 8 },
  chip: { borderWidth: 1.5, borderColor: T.border, borderRadius: 8, paddingVertical: 14, paddingHorizontal: 14, backgroundColor: T.panel },
  chipText: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 15, color: T.cream, lineHeight: 21 },
  btn: { backgroundColor: T.cream, borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: T.ink, letterSpacing: 1 },
});
