import { View, Text, Pressable } from 'react-native';
import type { HookCard as HookCardType, AnswerResult } from '@/data/types';

interface Props {
  card: HookCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function HookCard({ card, onComplete }: Props) {
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {card.emoji && (
          <Text style={{ fontSize: 72, textAlign: 'center', marginBottom: 24 }}>
            {card.emoji}
          </Text>
        )}
        <Text
          style={{
            fontFamily: 'Caveat_700Bold',
            fontSize: 38,
            color: '#1A1A1A',
            textAlign: 'center',
            lineHeight: 46,
          }}
        >
          {card.headline}
        </Text>
        {card.subtext && (
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 17,
              color: '#6B6B6B',
              textAlign: 'center',
              lineHeight: 26,
              marginTop: 16,
            }}
          >
            {card.subtext}
          </Text>
        )}
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
          Let's Explore →
        </Text>
      </Pressable>
    </View>
  );
}
