import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import type { SortItemsInteraction } from '@/data/types';
import CorrectFeedback from '../feedback/CorrectFeedback';
import IncorrectFeedback from '../feedback/IncorrectFeedback';

interface Props {
  interaction: SortItemsInteraction;
  xpValue: number;
  onComplete: (correct: boolean) => void;
}

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const Paper = '#FAFAF7';

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function SortItems({ interaction, xpValue, onComplete }: Props) {
  // Stable shuffle so the pool order doesn't change on every render.
  const [shuffled] = useState(() =>
    [...interaction.items].sort((a, b) => hash(a.id) - hash(b.id))
  );
  const [placed, setPlaced] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);

  const byId = (id: string) => interaction.items.find((i) => i.id === id)!;
  const pool = shuffled.filter((i) => !placed.includes(i.id));
  const ready = placed.length === interaction.items.length;

  const isCorrect =
    answered && placed.length === interaction.correctOrder.length &&
    placed.every((id, i) => id === interaction.correctOrder[i]);

  function check() {
    setAnswered(true);
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hint}>Tap in order to build the argument.</Text>

        {/* Build area — the sequence so far */}
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

        {/* Pool of remaining items */}
        {!answered && pool.length > 0 && (
          <View style={styles.pool}>
            {pool.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setPlaced((p) => [...p, item.id])}
                style={({ pressed }) => [styles.chip, pressed && { backgroundColor: '#F0EFEA' }]}
              >
                <Text style={styles.chipText}>{item.text}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Check button */}
        {ready && !answered && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <Pressable
              onPress={check}
              style={({ pressed }) => ({
                backgroundColor: Ink,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 8,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: Paper }}>
                Check
              </Text>
            </Pressable>
          </MotiView>
        )}
      </ScrollView>

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

const styles = StyleSheet.create({
  hint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: InkSoft,
    marginBottom: 12,
  },
  buildArea: {
    borderWidth: 2,
    borderColor: Ink,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 12,
    minHeight: 70,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  placeholder: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    fontStyle: 'italic',
    padding: 8,
  },
  placedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Paper,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    gap: 10,
  },
  placedNum: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: InkSoft,
  },
  placedText: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Ink,
    lineHeight: 21,
  },
  pool: {
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 2,
    borderColor: InkFaint,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: Paper,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Ink,
    lineHeight: 21,
  },
});
