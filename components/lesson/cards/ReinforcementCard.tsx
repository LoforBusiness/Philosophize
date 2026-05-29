import { View, Text, Pressable } from 'react-native';
import type { ReinforcementCard as ReinforcementCardType, AnswerResult } from '@/data/types';

interface Props {
  card: ReinforcementCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ReinforcementCard({ card, onComplete }: Props) {
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
      {/* Center content */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {card.emoji && (
          <Text
            style={{
              fontSize: 56,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            {card.emoji}
          </Text>
        )}

        {/* Callout label */}
        {card.callout && (
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: '#3B6FE8',
              marginBottom: 8,
            }}
          >
            {card.callout}
          </Text>
        )}

        {/* Main box */}
        <View
          style={{
            borderWidth: 2,
            borderColor: '#1A1A1A',
            borderRadius: 14,
            padding: 20,
            backgroundColor: '#F8F7F2',
          }}
        >
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 19,
              color: '#1A1A1A',
              lineHeight: 30,
            }}
          >
            {card.body}
          </Text>
        </View>
      </View>

      {/* Continue button */}
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
