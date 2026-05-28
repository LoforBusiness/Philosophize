import { View, Text, Pressable, ScrollView } from 'react-native';
import type { ConceptCard as ConceptCardType, AnswerResult } from '@/data/types';
import { Colors } from '@/constants/Colors';

interface Props {
  card: ConceptCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function ConceptCard({ card, onComplete }: Props) {
  return (
    <View className="flex-1 px-6 justify-between pb-8">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-6 mb-6">
          {card.visual && <Text className="text-6xl mb-4">{card.visual}</Text>}
          <Text
            style={{ fontFamily: 'Inter_500Medium' }}
            className="text-gold text-xs uppercase tracking-widest mb-3"
          >
            Concept
          </Text>
          <Text
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            className="text-parchment text-2xl text-center mb-6"
          >
            {card.title}
          </Text>
        </View>

        <View className="bg-navy rounded-2xl p-5 mb-6">
          <Text
            style={{ fontFamily: 'Inter_400Regular' }}
            className="text-parchment text-lg leading-8"
          >
            {card.body
              .split(card.highlight || '___NONE___')
              .flatMap((part, i, arr) =>
                i < arr.length - 1
                  ? [
                      <Text key={`p${i}`}>{part}</Text>,
                      <Text
                        key={`h${i}`}
                        style={{ fontFamily: 'Inter_700Bold' }}
                        className="text-gold"
                      >
                        {card.highlight}
                      </Text>,
                    ]
                  : [<Text key={`p${i}`}>{part}</Text>]
              )}
          </Text>
        </View>
      </ScrollView>

      <Pressable
        onPress={() => onComplete()}
        className="bg-gold rounded-2xl py-4 items-center active:opacity-80 mt-4"
      >
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-midnight text-lg">
          Got It →
        </Text>
      </Pressable>
    </View>
  );
}
