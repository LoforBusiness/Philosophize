import { View, Text, Pressable, ScrollView } from 'react-native';
import type { ConceptCard as ConceptCardType, AnswerResult } from '@/data/types';

interface Props {
  card: ConceptCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ConceptCard({ card, onComplete }: Props) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FAFAF7',
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: 32,
      }}
    >
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Label */}
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            color: '#6B6B6B',
            textTransform: 'uppercase',
            letterSpacing: 2,
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          Concept
        </Text>

        {/* Title */}
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 26,
            color: '#1A1A1A',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          {card.title}
        </Text>

        {/* Optional visual emoji */}
        {card.visual && (
          <Text
            style={{
              fontSize: 48,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {card.visual}
          </Text>
        )}

        {/* Body text box */}
        <View
          style={{
            borderWidth: 2,
            borderColor: '#E8E8E3',
            borderRadius: 14,
            backgroundColor: '#F5F5F0',
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 17,
              color: '#1A1A1A',
              lineHeight: 28,
            }}
          >
            {card.body
              .split(card.highlight || '___NONE___')
              .flatMap((part, i, arr) =>
                i < arr.length - 1
                  ? [
                      <Text key={`p${i}`}>{part}</Text>,
                      <Text
                        key={`h${i}`}
                        style={{ fontFamily: 'Inter_700Bold', color: '#1A1A1A' }}
                      >
                        {card.highlight}
                      </Text>,
                    ]
                  : [<Text key={`p${i}`}>{part}</Text>]
              )}
          </Text>
        </View>
      </ScrollView>

      {/* Got It button */}
      <Pressable
        onPress={() => onComplete()}
        style={({ pressed }) => ({
          backgroundColor: '#1A1A1A',
          borderRadius: 14,
          paddingVertical: 18,
          alignItems: 'center',
          marginTop: 4,
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 18,
            color: '#FAFAF7',
          }}
        >
          Got It →
        </Text>
      </Pressable>
    </View>
  );
}
