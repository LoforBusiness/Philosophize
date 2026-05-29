import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import type { SummaryCard as SummaryCardType, AnswerResult } from '@/data/types';
import { useLessonStore } from '@/stores/lessonStore';
import { useUserDataStore } from '@/stores/userDataStore';
import { getLessonById } from '@/data';
import KineticNarration from '../KineticNarration';

interface Props {
  card: SummaryCardType;
  onComplete: (result?: AnswerResult) => void;
}

export default function SummaryCard({ card }: Props) {
  const { session, endSession } = useLessonStore();
  const recordLessonComplete = useUserDataStore((s) => s.recordLessonComplete);
  const [finished, setFinished] = useState(false);

  const xpEarned = session?.sessionXP ?? 0;
  const correctAnswers = session?.answers.filter((a) => a.correct).length ?? 0;
  const totalQuestions = session?.answers.length ?? 0;

  const parts = [card.title, ...card.keyPoints];
  if (card.closingThought) parts.push(card.closingThought);
  const text = parts.join('. ');

  function handleFinish() {
    const lessonId = session?.lesson.id;
    if (lessonId) {
      const found = getLessonById(lessonId);
      if (found) recordLessonComplete(found.branch.slug);
    }
    endSession();
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent', paddingBottom: 28 }}>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          color: '#6B6B6B',
          textTransform: 'uppercase',
          letterSpacing: 2,
          textAlign: 'center',
          marginTop: 12,
        }}
      >
        Lesson Complete
      </Text>

      <View style={{ flex: 1 }}>
        <KineticNarration text={text} onDone={() => setFinished(true)} />
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        {finished && (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 24,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A1A1A' }}>
                +{xpEarned} XP
              </Text>
              {totalQuestions > 0 && (
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1A1A1A' }}>
                  {correctAnswers}/{totalQuestions} correct
                </Text>
              )}
            </View>

            <Pressable
              onPress={handleFinish}
              style={({ pressed }) => ({
                backgroundColor: '#1A1A1A',
                borderRadius: 14,
                paddingVertical: 18,
                alignItems: 'center',
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#FAFAF7' }}>
                Finish Lesson →
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
