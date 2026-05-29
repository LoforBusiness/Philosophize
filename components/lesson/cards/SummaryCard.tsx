import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import type { SummaryCard as SummaryCardType, AnswerResult } from '@/data/types';
import { useLessonStore } from '@/stores/lessonStore';

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
        {/* Lesson Complete label */}
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            color: '#6B6B6B',
            textTransform: 'uppercase',
            letterSpacing: 2,
            textAlign: 'center',
            marginTop: 32,
            marginBottom: 16,
          }}
        >
          Lesson Complete
        </Text>

        {/* Title */}
        <Text
          style={{
            fontFamily: 'Caveat_700Bold',
            fontSize: 36,
            color: '#1A1A1A',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {card.title}
        </Text>

        {/* Stats box */}
        <View
          style={{
            borderWidth: 2,
            borderColor: '#E8E8E3',
            borderRadius: 14,
            padding: 20,
            marginBottom: 20,
          }}
        >
          {/* XP row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: totalQuestions > 0 ? 12 : 0,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 15,
                color: '#6B6B6B',
              }}
            >
              XP Earned
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 22,
                color: '#1A1A1A',
              }}
            >
              +{xpEarned}
            </Text>
          </View>

          {/* Correct answers row */}
          {totalQuestions > 0 && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 15,
                  color: '#6B6B6B',
                }}
              >
                Correct
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 16,
                  color: '#1A1A1A',
                }}
              >
                {correctAnswers}/{totalQuestions}
              </Text>
            </View>
          )}
        </View>

        {/* What you learned */}
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 15,
            color: '#1A1A1A',
            marginBottom: 12,
          }}
        >
          What you learned:
        </Text>

        {card.keyPoints.map((point, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: 10,
              gap: 10,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_700Bold',
                color: '#1A1A1A',
                fontSize: 15,
                lineHeight: 24,
              }}
            >
              ✓
            </Text>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: '#1A1A1A',
                lineHeight: 24,
                flex: 1,
              }}
            >
              {point}
            </Text>
          </View>
        ))}

        {/* Closing thought */}
        {card.closingThought && (
          <Text
            style={{
              fontFamily: 'PlayfairDisplay_400Regular',
              fontSize: 17,
              color: '#6B6B6B',
              fontStyle: 'italic',
              textAlign: 'center',
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            "{card.closingThought}"
          </Text>
        )}
      </ScrollView>

      {/* Finish button */}
      <Pressable
        onPress={handleFinish}
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
          Finish Lesson →
        </Text>
      </Pressable>
    </View>
  );
}
