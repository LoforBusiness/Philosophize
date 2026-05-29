import { View, Text, Pressable, ScrollView } from 'react-native';
import type { ExampleCard as ExampleCardType, AnswerResult } from '@/data/types';

interface Props {
  card: ExampleCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ExampleCard({ card, onComplete }: Props) {
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
          Example
        </Text>

        {/* Optional emoji */}
        {card.emoji && (
          <Text
            style={{
              fontSize: 48,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {card.emoji}
          </Text>
        )}

        {/* Title */}
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 24,
            color: '#1A1A1A',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          {card.title}
        </Text>

        {/* Scenario box — full ink border (sketch style) */}
        <View
          style={{
            borderWidth: 2,
            borderColor: '#1A1A1A',
            borderRadius: 14,
            padding: 20,
            marginBottom: 8,
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
            {card.scenario}
          </Text>
        </View>

        {/* Source */}
        {card.source && (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: '#6B6B6B',
              textAlign: 'right',
              marginTop: 8,
              fontStyle: 'italic',
            }}
          >
            — {card.source}
          </Text>
        )}
      </ScrollView>

      {/* Continue button */}
      <Pressable
        onPress={() => onComplete()}
        style={({ pressed }) => ({
          backgroundColor: '#1A1A1A',
          borderRadius: 14,
          paddingVertical: 18,
          alignItems: 'center',
          marginTop: 16,
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
          Continue →
        </Text>
      </Pressable>
    </View>
  );
}
