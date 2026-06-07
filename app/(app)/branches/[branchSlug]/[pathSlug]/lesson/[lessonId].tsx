import { useState, type ComponentType } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById } from '@/data';
import LessonRunner from '@/components/lesson/LessonRunner';
import LessonLoader from '@/components/lesson/LessonLoader';
import SnowWalkStory from '@/components/lesson/story/SnowWalkStory';
import ExistenceStory from '@/components/lesson/story/ExistenceStory';
import ScreenTransition from '@/components/shared/ScreenTransition';
import type { Lesson } from '@/data/types';

// Lessons that play as a fully bespoke story instead of the card runner.
// Each maps to its own component + the loader's background colour.
const STORY_LESSONS: Record<string, { Component: ComponentType<{ lesson: Lesson }>; bg: string }> = {
  'logic-arguments-1': { Component: SnowWalkStory, bg: '#D7DAE0' },
  'metaphysics-being-1': { Component: ExistenceStory, bg: '#000000' },
};

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

  const story = STORY_LESSONS[result.lesson.id];
  const Story = story?.Component;

  return (
    <ScreenTransition bg={loading ? '#F1EEE7' : story ? story.bg : '#1A1A1A'}>
      {loading ? (
        <LessonLoader onDone={() => setLoading(false)} />
      ) : Story ? (
        <Story lesson={result.lesson} />
      ) : (
        <LessonRunner lesson={result.lesson} />
      )}
    </ScreenTransition>
  );
}
