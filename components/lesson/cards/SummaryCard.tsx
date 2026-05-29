import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { SummaryCard as SummaryCardType, AnswerResult } from '@/data/types';
import KineticNarration from '../KineticNarration';

interface Props {
  card: SummaryCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function SummaryCard({ card, onComplete }: Props) {
  const [finished, setFinished] = useState(false);

  const parts = [card.title, ...card.keyPoints];
  if (card.closingThought) parts.push(card.closingThought);
  const text = parts.join('. ');

  // Hand off to the reward screen (LessonRunner records completion + streak).
  function handleFinish() {
    onComplete();
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', paddingBottom: 28 }}>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          color: '#6B6B6B',
          textTransform: 'uppercase',
          letterSpacing: 2,
          textAlign: 'center',
          marginTop: 12,
        }}
      >
        Lesson Complete
      </Text>

      <View style={{ flex: 1 }}>
        <KineticNarration text={text} onDone={() => setFinished(true)} />
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        {finished && (
          <Pressable
            onPress={handleFinish}
            style={({ pressed }) => ({
              backgroundColor: '#1A1A1A',
              borderRadius: 14,
              paddingVertical: 18,
              alignItems: 'center',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FAFAF7' }}>
              Finish Lesson →
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
