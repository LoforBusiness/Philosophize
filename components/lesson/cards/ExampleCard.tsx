import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { ExampleCard as ExampleCardType, AnswerResult } from '@/data/types';
import KineticNarration from '../KineticNarration';

interface Props {
  card: ExampleCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ExampleCard({ card, onComplete }: Props) {
  const [finished, setFinished] = useState(false);
  const text = `${card.title}. ${card.scenario}`;

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', paddingBottom: 28 }}>
      {card.emoji ? (
        <Text style={{ fontSize: 40, textAlign: 'center', marginTop: 8 }}>{card.emoji}</Text>
      ) : null}

      <View style={{ flex: 1 }}>
        <KineticNarration text={text} onDone={() => setFinished(true)} />
      </View>

      <View style={{ minHeight: 64, justifyContent: 'flex-end', paddingHorizontal: 24 }}>
        {finished && card.source ? (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: '#6B6B6B',
              textAlign: 'center',
              fontStyle: 'italic',
              marginBottom: 12,
            }}
          >
            — {card.source}
          </Text>
        ) : null}
        {finished && (
          <Pressable
            onPress={() => onComplete()}
            style={({ pressed }) => ({
              backgroundColor: '#1A1A1A',
              borderRadius: 14,
              paddingVertical: 18,
              alignItems: 'center',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FAFAF7' }}>
              Continue →
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
