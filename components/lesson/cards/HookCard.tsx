import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { HookCard as HookCardType, AnswerResult } from '@/data/types';
import { Colors } from '@/constants/Colors';

interface Props {
  card: HookCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function HookCard({ card, onComplete }: Props) {
  return (
    <LinearGradient
      colors={[Colors.midnight, Colors.navy]}
      className="flex-1 px-6 justify-between pb-8"
    >
      <View className="flex-1 items-center justify-center">
        {card.emoji && (
          <Text className="text-7xl mb-8">{card.emoji}</Text>
        )}
        <Text
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          className="text-parchment text-3xl text-center leading-tight mb-4"
        >
          {card.headline}
        </Text>
        {card.subtext && (
          <Text
            style={{ fontFamily: 'Inter_400Regular' }}
            className="text-gray-300 text-lg text-center leading-7"
          >
            {card.subtext}
          </Text>
        )}
      </View>

      <Pressable
        onPress={() => onComplete()}
        className="bg-gold rounded-2xl py-4 items-center active:opacity-80"
      >
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-midnight text-lg">
          Let's Go →
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
