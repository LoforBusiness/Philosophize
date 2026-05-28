import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { SummaryCard as SummaryCardType, AnswerResult } from '@/data/types';
import { useLessonStore } from '@/stores/lessonStore';
import { Colors } from '@/constants/Colors';

interface Props {
  card: SummaryCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function SummaryCard({ card }: Props) {
  const { session, endSession } = useLessonStore();

  const xpEarned = session?.sessionXP ?? 0;
  const correctAnswers = session?.answers.filter((a) => a.correct).length ?? 0;
  const totalQuestions = session?.answers.length ?? 0;

  function handleFinish() {
    endSession();
    router.back();
  }

  return (
    <LinearGradient
      colors={[Colors.midnight, Colors.midnightSoft]}
      className="flex-1 px-6 justify-between pb-8"
    >
      <View className="flex-1 justify-center items-center">
        <Text className="text-7xl mb-6">🏅</Text>
        <Text
          style={{ fontFamily: 'Inter_500Medium' }}
          className="text-gold text-xs uppercase tracking-widest mb-3"
        >
          Lesson Complete
        </Text>
        <Text
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          className="text-parchment text-3xl text-center mb-8"
        >
          {card.title}
        </Text>

        {/* XP earned */}
        <View className="bg-navy rounded-2xl w-full p-5 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gray-300 text-sm">
              XP Earned
            </Text>
            <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-gold text-xl">
              +{xpEarned} ⚡
            </Text>
          </View>
          {totalQuestions > 0 && (
            <View className="flex-row justify-between items-center">
              <Text style={{ fontFamily: 'Inter_500Medium' }} className="text-gray-300 text-sm">
                Correct Answers
              </Text>
              <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-parchment text-base">
                {correctAnswers}/{totalQuestions}
              </Text>
            </View>
          )}
        </View>

        {/* Key points */}
        <View className="w-full mb-4">
          <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-parchment text-sm mb-3">
            What you learned:
          </Text>
          {card.keyPoints.map((point, i) => (
            <View key={i} className="flex-row items-start gap-3 mb-2">
              <Text className="text-gold mt-0.5">✓</Text>
              <Text
                style={{ fontFamily: 'Inter_400Regular' }}
                className="text-parchment text-sm leading-5 flex-1"
              >
                {point}
              </Text>
            </View>
          ))}
        </View>

        {card.closingThought && (
          <Text
            style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
            className="text-gray-300 text-base text-center italic"
          >
            "{card.closingThought}"
          </Text>
        )}
      </View>

      <Pressable
        onPress={handleFinish}
        className="bg-gold rounded-2xl py-4 items-center active:opacity-80"
      >
        <Text style={{ fontFamily: 'Inter_700Bold' }} className="text-midnight text-lg">
          Finish Lesson
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
