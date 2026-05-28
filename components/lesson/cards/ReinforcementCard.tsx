import { View, Text, Pressable } from 'react-native';
import type { ReinforcementCard as ReinforcementCardType, AnswerResult } from '@/data/types';
import { Colors } from '@/constants/Colors';

interface Props {
  card: ReinforcementCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ReinforcementCard({ card, onComplete }: Props) {
  return (
    <View className="flex-1 px-6 justify-between pb-8">
      <View className="flex-1 justify-center">
        {card.emoji && (
          <Text className="text-5xl text-center mb-6">{card.emoji}</Text>
        )}

        <View
          className="rounded-2xl p-5 mb-6 border"
          style={{ borderColor: Colors.gold, backgroundColor: Colors.gold + '15' }}
        >
          <Text
            style={{ fontFamily: 'Inter_500Medium' }}
            className="text-gold text-sm mb-3"
          >
            {card.callout}
          </Text>
          <Text
            style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
            className="text-parchment text-lg leading-8"
          >
            {card.body}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => onComplete()}
        className="bg-gold rounded-2xl py-4 items-center active:opacity-80"
      >
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-midnight text-lg">
          Continue →
        </Text>
      </Pressable>
    </View>
  );
}
