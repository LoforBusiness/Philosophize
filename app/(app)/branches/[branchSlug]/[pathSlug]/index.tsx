import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBranchBySlug } from '@/data';
import LessonPath, { type PathNode } from '@/components/shared/LessonPath';
import SketchIcon from '@/components/shared/SketchIcon';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

export default function PathDetailScreen() {
  const { branchSlug, pathSlug } = useLocalSearchParams<{
    branchSlug: string;
    pathSlug: string;
  }>();
  const branch = getBranchBySlug(branchSlug);
  const path = branch?.paths.find((p) => p.slug === pathSlug);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  if (!branch || !path) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Path not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleLessonPress(lessonId: string) {
    setSelectedLessonId(lessonId);
    setTimeout(() => {
      router.push(`/(app)/branches/${branchSlug}/${pathSlug}/lesson/${lessonId}`);
    }, 220);
  }

  const nodes: PathNode[] = path.lessons.map((lesson) => ({
    id: lesson.id,
    label: lesson.title,
    onPress: () => handleLessonPress(lesson.id),
    active: selectedLessonId === lesson.id,
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back + breadcrumb */}
        <View style={styles.backRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <SketchIcon name="back" size={24} color={Ink} />
          </Pressable>
          <Text style={styles.breadcrumb}>{branch.name}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{path.name}</Text>

        {/* Winding lesson path */}
        <LessonPath nodes={nodes} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Ink },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    gap: 10,
  },
  breadcrumb: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    color: Ink,
    textAlign: 'center',
    lineHeight: 38,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
});
