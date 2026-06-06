import { useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById } from '@/data';
import LessonRunner from '@/components/lesson/LessonRunner';
import LessonLoader from '@/components/lesson/LessonLoader';
import SnowWalkStory from '@/components/lesson/story/SnowWalkStory';
import ScreenTransition from '@/components/shared/ScreenTransition';

// Lessons that play as a fully bespoke story instead of the card runner.
const STORY_LESSONS = new Set(['logic-arguments-1']);

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const result = getLessonById(lessonId);
  const [loading, setLoading] = useState(true);

  if (!result) {
    return (
      <SafeAreaView className="flex-1 bg-midnight items-center justify-center">
        <Text className="text-parchment text-lg">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  const isStory = STORY_LESSONS.has(result.lesson.id);

  return (
    <ScreenTransition bg={loading ? '#F1EEE7' : isStory ? '#D7DAE0' : '#1A1A1A'}>
      {loading ? (
        <LessonLoader onDone={() => setLoading(false)} />
      ) : isStory ? (
        <SnowWalkStory lesson={result.lesson} />
      ) : (
        <LessonRunner lesson={result.lesson} />
      )}
    </ScreenTransition>
  );
}
