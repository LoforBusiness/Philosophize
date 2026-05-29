import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { ConceptCard as ConceptCardType, AnswerResult } from '@/data/types';
import KineticNarration from '../KineticNarration';

interface Props {
  card: ConceptCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ConceptCard({ card, onComplete }: Props) {
  const [finished, setFinished] = useState(false);
  const text = `${card.title}. ${card.body}`;

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', paddingBottom: 28 }}>
      {card.visual ? (
        <Text style={{ fontSize: 40, textAlign: 'center', marginTop: 8 }}>{card.visual}</Text>
      ) : null}

      <View style={{ flex: 1 }}>
        <KineticNarration text={text} onDone={() => setFinished(true)} />
      </View>

      <View style={{ minHeight: 64, justifyContent: 'flex-end', paddingHorizontal: 24 }}>
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
              Got It →
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
