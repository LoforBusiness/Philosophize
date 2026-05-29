import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ALL_BRANCHES } from '@/data';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';

const QUOTES = [
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'I think, therefore I am.', author: 'René Descartes' },
  { text: 'One cannot step into the same river twice.', author: 'Heraclitus' },
];

export default function DashboardScreen() {
  const quote = QUOTES[new Date().getDay() % 3];
  const firstLesson = ALL_BRANCHES[0]?.paths[0]?.lessons[0];
  const firstBranch = ALL_BRANCHES[0];
  const firstPath = firstBranch?.paths[0];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Pressable hitSlop={8}>
          <Ionicons name="settings-outline" size={24} color={InkSoft} />
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quote of the Day */}
        <View style={styles.sketchBox}>
          <Text style={styles.sectionLabel}>QUOTE OF THE DAY</Text>
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          <Text style={styles.quoteAttrib}>— {quote.author}</Text>
        </View>

        {/* Continue Learning */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Continue Learning</Text>
          <View style={styles.sectionHeadingLine} />
        </View>

        {firstLesson && firstBranch && firstPath ? (
          <View style={styles.sketchBox}>
            <View style={styles.lessonMeta}>
              <Text style={styles.xpBadge}>25 XP</Text>
            </View>
            <Text style={styles.lessonTitle}>{firstLesson.title}</Text>
            <Text style={styles.lessonDesc}>{firstLesson.description}</Text>
            <Pressable
              style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.8 }]}
              onPress={() =>
                router.push(
                  `/(app)/branches/${firstBranch.slug}/${firstPath.slug}/lesson/${firstLesson.id}`
                )
              }
            >
              <Text style={styles.startBtnText}>Start Lesson →</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.sketchBox, styles.emptyBox]}>
            <Text style={styles.emptyText}>No lessons yet — check back soon.</Text>
          </View>
        )}

        {/* Philosophy Branches */}
        <View style={[styles.sectionRow, { marginTop: 24 }]}>
          <Text style={styles.sectionHeading}>Philosophy Branches</Text>
          <View style={styles.sectionHeadingLine} />
        </View>

        <View style={styles.branchGrid}>
          {ALL_BRANCHES.map((branch) => (
            <Pressable
              key={branch.id}
              onPress={() => router.push(`/(app)/branches/${branch.slug}`)}
              style={({ pressed }) => [
                styles.branchBox,
                pressed && { backgroundColor: '#F0EFEA' },
              ]}
            >
              <Text style={styles.branchIcon}>{branch.icon}</Text>
              <Text style={styles.branchName} numberOfLines={1}>
                {branch.name}
              </Text>
              <Text style={styles.branchPaths}>
                {branch.paths.length} path{branch.paths.length !== 1 ? 's' : ''}
              </Text>
            </Pressable>
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 40,
    color: Ink,
    lineHeight: 46,
  },
  divider: {
    height: 1,
    backgroundColor: InkFaint,
    marginHorizontal: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  sketchBox: {
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    padding: 20,
    backgroundColor: Paper,
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: InkSoft,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  quoteText: {
    fontFamily: 'Caveat_400Regular',
    fontSize: 22,
    color: Ink,
    fontStyle: 'italic',
    lineHeight: 30,
    marginBottom: 10,
  },
  quoteAttrib: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: InkSoft,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHeading: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Ink,
    marginRight: 12,
  },
  sectionHeadingLine: {
    flex: 1,
    height: 1,
    backgroundColor: InkFaint,
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  xpBadge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: InkSoft,
  },
  lessonTitle: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 24,
    color: Ink,
    marginBottom: 6,
  },
  lessonDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    lineHeight: 21,
    marginBottom: 16,
  },
  startBtn: {
    backgroundColor: Ink,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
  },
  branchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  branchBox: {
    width: '47%',
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    padding: 16,
    backgroundColor: Paper,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  branchName: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 18,
    color: Ink,
    textAlign: 'center',
    marginBottom: 2,
  },
  branchPaths: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: InkSoft,
  },
});
