import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBranchBySlug } from '@/data';
import WavyLine from '@/components/shared/WavyLine';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const Blue = '#3B6FE8';
const BlueFill = '#EEF2FD';

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
      router.push(
        `/(app)/branches/${branchSlug}/${pathSlug}/lesson/${lessonId}`
      );
    }, 200);
  }

  const wavyHeight = Math.max(path.lessons.length * 130, 160);

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
            <Ionicons name="arrow-back" size={24} color={Ink} />
          </Pressable>
          <Text style={styles.breadcrumb}>{branch.name}</Text>
        </View>

        {/* Path heading */}
        <Text style={styles.pathTitle}>{path.name}</Text>
        <Text style={styles.pathDesc}>{path.description}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Section label */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Lessons</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* Lessons with wavy line */}
        <View style={styles.lessonsContainer}>
          {/* Wavy line on the left */}
          <WavyLine height={wavyHeight} color={Ink} amplitude={8} strokeWidth={1.5} />

          {/* Lesson cards on the right */}
          <View style={styles.lessonCards}>
            {path.lessons.map((lesson, i) => {
              const isSelected = selectedLessonId === lesson.id;
              return (
                <Pressable
                  key={lesson.id}
                  onPress={() => handleLessonPress(lesson.id)}
                  style={[
                    styles.lessonBox,
                    isSelected && styles.lessonBoxSelected,
                  ]}
                >
                  <Text style={styles.lessonNumber}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDesc} numberOfLines={2}>
                    {lesson.description}
                  </Text>
                  <Text style={styles.lessonMeta}>
                    {lesson.estimatedMinutes} min · {lesson.xpReward} XP
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Paper,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Ink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    gap: 10,
  },
  breadcrumb: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: InkSoft,
  },
  pathTitle: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 40,
    color: Ink,
    lineHeight: 46,
    marginBottom: 8,
  },
  pathDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: InkSoft,
    lineHeight: 24,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: InkFaint,
    marginBottom: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Ink,
    marginRight: 12,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: InkFaint,
  },
  lessonsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lessonCards: {
    flex: 1,
    marginLeft: 12,
  },
  lessonBox: {
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    backgroundColor: Paper,
  },
  lessonBoxSelected: {
    borderColor: Blue,
    backgroundColor: BlueFill,
  },
  lessonNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: InkSoft,
    marginBottom: 4,
  },
  lessonTitle: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 22,
    color: Ink,
    marginBottom: 4,
    lineHeight: 27,
  },
  lessonDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: InkSoft,
    lineHeight: 19,
    marginBottom: 10,
  },
  lessonMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: InkSoft,
  },
});
