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

  const wavyHeight = Math.max(branch.paths.length * 130, 160);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back arrow */}
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Ink} />
        </Pressable>

        {/* Branch heading */}
        <Text style={styles.branchTitle}>{branch.name}</Text>
        <Text style={styles.branchDesc}>{branch.description}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Section label */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Learning Paths</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* Paths */}
        {branch.paths.length === 0 ? (
          <View style={[styles.sketchBox, styles.comingSoon]}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
            <Text style={styles.comingSoonSub}>
              This branch is being built. Check back soon.
            </Text>
          </View>
        ) : (
          <View style={styles.pathsContainer}>
            {/* Wavy line on the left */}
            <WavyLine height={wavyHeight} color={Ink} amplitude={8} strokeWidth={1.5} />

            {/* Path cards on the right */}
            <View style={styles.pathCards}>
              {branch.paths.map((path) => (
                <Pressable
                  key={path.id}
                  onPress={() =>
                    router.push(`/(app)/branches/${branch.slug}/${path.slug}`)
                  }
                  style={({ pressed }) => [
                    styles.sketchBox,
                    styles.pathBox,
                    pressed && { backgroundColor: '#F0EFEA' },
                  ]}
                >
                  <View style={styles.pathRow}>
                    <View style={styles.pathInfo}>
                      <Text style={styles.pathName}>{path.name}</Text>
                      <Text style={styles.pathDesc}>{path.description}</Text>
                      <Text style={styles.pathMeta}>
                        {path.lessons.length} lesson{path.lessons.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <Text style={styles.pathArrow}>→</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
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
  backBtn: {
    marginTop: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  branchTitle: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 44,
    color: Ink,
    lineHeight: 50,
    marginBottom: 8,
  },
  branchDesc: {
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
  sketchBox: {
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    backgroundColor: Paper,
  },
  comingSoon: {
    padding: 28,
    alignItems: 'center',
  },
  comingSoonText: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 28,
    color: Ink,
    marginBottom: 8,
  },
  comingSoonSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    textAlign: 'center',
  },
  pathsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pathCards: {
    flex: 1,
    marginLeft: 12,
  },
  pathBox: {
    padding: 20,
    marginBottom: 12,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathInfo: {
    flex: 1,
  },
  pathName: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 24,
    color: Ink,
    marginBottom: 6,
  },
  pathDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    lineHeight: 20,
    marginBottom: 10,
  },
  pathMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: InkSoft,
  },
  pathArrow: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Ink,
    marginLeft: 12,
  },
});
