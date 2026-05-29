import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBranchBySlug } from '@/data';
import LessonPath, { type PathNode } from '@/components/shared/LessonPath';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

export default function BranchDetailScreen() {
  const { branchSlug } = useLocalSearchParams<{ branchSlug: string }>();
  const branch = getBranchBySlug(branchSlug);

  if (!branch) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Branch not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const nodes: PathNode[] = branch.paths.map((path) => ({
    id: path.id,
    label: path.name,
    meta: `${path.lessons.length} lesson${path.lessons.length !== 1 ? 's' : ''}`,
    onPress: () => router.push(`/(app)/branches/${branch.slug}/${path.slug}`),
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Ink} />
        </Pressable>

        <Text style={styles.title}>{branch.name}</Text>
        <Text style={styles.subtitle}>{branch.description}</Text>

        {branch.paths.length === 0 ? (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Coming soon</Text>
            <Text style={styles.comingSoonSub}>This branch is being written.</Text>
          </View>
        ) : (
          <LessonPath nodes={nodes} />
        )}
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
  backBtn: { marginTop: 8, marginBottom: 4, alignSelf: 'flex-start' },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    color: Ink,
    textAlign: 'center',
    lineHeight: 38,
    marginTop: 4,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  comingSoon: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  comingSoonText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: Ink },
  comingSoonSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    textAlign: 'center',
    marginTop: 6,
  },
});
