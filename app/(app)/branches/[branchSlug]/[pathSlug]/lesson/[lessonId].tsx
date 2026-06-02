import { useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById } from '@/data';
import LessonRunner from '@/components/lesson/LessonRunner';
import LessonLoader from '@/components/lesson/LessonLoader';
import ScreenTransition from '@/components/shared/ScreenTransition';

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

  return (
    <ScreenTransition bg={loading ? '#F1EEE7' : '#1A1A1A'}>
      {loading ? (
        <LessonLoader onDone={() => setLoading(false)} />
      ) : (
        <LessonRunner lesson={result.lesson} />
      )}
    </ScreenTransition>
  );
}
