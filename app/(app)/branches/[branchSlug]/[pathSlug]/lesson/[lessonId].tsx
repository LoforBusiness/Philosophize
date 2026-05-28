import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById } from '@/data';
import LessonRunner from '@/components/lesson/LessonRunner';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const result = getLessonById(lessonId);

  if (!result) {
    return (
      <SafeAreaView className="flex-1 bg-midnight items-center justify-center">
        <Text className="text-parchment text-lg">Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  return <LessonRunner lesson={result.lesson} />;
}
