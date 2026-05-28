import { View, Text, Pressable, ScrollView } from 'react-native';
import type { ExampleCard as ExampleCardType, AnswerResult } from '@/data/types';
import { Colors } from '@/constants/Colors';

interface Props {
  card: ExampleCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ExampleCard({ card, onComplete }: Props) {
  return (
    <View className="flex-1 px-6 justify-between pb-8">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-6 mb-4">
          {card.emoji && <Text className="text-5xl mb-3">{card.emoji}</Text>}
          <Text
            style={{ fontFamily: 'Inter_500Medium' }}
            className="text-gold text-xs uppercase tracking-widest mb-3"
          >
            Example
          </Text>
          <Text
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            className="text-parchment text-2xl text-center"
          >
            {card.title}
          </Text>
        </View>

        <View
          className="rounded-2xl p-5 mb-4"
          style={{ backgroundColor: Colors.navyLight }}
        >
          <Text
            style={{ fontFamily: 'Inter_400Regular' }}
            className="text-parchment text-base leading-7"
          >
            {card.scenario}
          </Text>
        </View>

        {card.source && (
          <Text
            style={{ fontFamily: 'Inter_400Regular' }}
            className="text-gray-500 text-sm text-right italic"
          >
            — {card.source}
          </Text>
        )}
      </ScrollView>

      <Pressable
        onPress={() => onComplete()}
        className="bg-gold rounded-2xl py-4 items-center active:opacity-80 mt-4"
      >
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-midnight text-lg">
          Continue →
        </Text>
      </Pressable>
    </View>
  );
}
