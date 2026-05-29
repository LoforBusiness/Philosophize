import { View, Text, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '@/lib/supabase/auth';
import { ALL_BRANCHES } from '@/data';
import { useUserDataStore } from '@/stores/userDataStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const Crimson = '#A83232';
const Blue = '#3B6FE8';

export default function ProfileScreen() {
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const removeQuote = useUserDataStore((s) => s.removeQuote);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const completedLessons = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {}
        },
      },
    ]);
  }

  const totalLessons = ALL_BRANCHES.reduce(
    (acc, b) => acc + b.paths.reduce((pa, p) => pa + p.lessons.length, 0),
    0
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={styles.pageTitle}>Profile</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Avatar card */}
        <View style={[styles.sketchBox, styles.avatarBox]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarSymbol}>∞</Text>
          </View>
          <Text style={styles.userName}>Philosopher</Text>
          <Text style={styles.userLevel}>Level 1 · 0 XP</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Streak', value: '0 days' },
            { label: 'Lessons', value: `${completedLessons} / ${totalLessons}` },
            { label: 'Saved', value: `${savedQuotes.length}` },
          ].map((stat) => (
            <View key={stat.label} style={[styles.sketchBox, styles.statBox]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Saved Quotes section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Saved Quotes</Text>
          <View style={styles.sectionLine} />
        </View>

        {savedQuotes.length === 0 ? (
          <View style={[styles.sketchBox, styles.emptyQuotesBox]}>
            <Text style={styles.emptyQuotesText}>
              No saved quotes yet. Open a thinker and tap the bookmark to keep
              their words here.
            </Text>
            <Pressable
              onPress={() => router.push('/(app)/philosophers')}
              style={({ pressed }) => [styles.browseBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.browseBtnText}>Browse Thinkers →</Text>
            </Pressable>
          </View>
        ) : (
          savedQuotes.map((q) => (
            <View key={q.id} style={[styles.sketchBox, styles.quoteBox]}>
              <View style={styles.quoteContent}>
                <Text style={styles.quoteText}>"{q.text}"</Text>
                <Pressable
                  onPress={() => router.push(`/(app)/philosophers/${q.philosopherId}`)}
                  hitSlop={6}
                >
                  <Text style={styles.quoteAuthor}>— {q.author}</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => removeQuote(q.id)}
                hitSlop={10}
                style={styles.removeBtn}
              >
                <Ionicons name="bookmark" size={20} color={Blue} />
              </Pressable>
            </View>
          ))
        )}

        {/* Progress section */}
        <View style={[styles.sectionRow, { marginTop: 24 }]}>
          <Text style={styles.sectionHeading}>Progress</Text>
          <View style={styles.sectionLine} />
        </View>

        {ALL_BRANCHES.map((branch) => (
          <View key={branch.id} style={[styles.sketchBox, styles.progressBox]}>
            <View style={styles.progressRow}>
              <Text style={styles.branchIcon}>{branch.icon}</Text>
              <View style={styles.progressInfo}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <Text style={styles.branchMeta}>
                  {branch.paths.length > 0
                    ? `${branch.paths.length} path${branch.paths.length !== 1 ? 's' : ''} available`
                    : 'Coming soon'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Sign out */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Paper,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 40,
    color: Ink,
    paddingTop: 16,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: InkFaint,
    marginBottom: 20,
  },
  sketchBox: {
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
    backgroundColor: Paper,
  },
  avatarBox: {
    alignItems: 'center',
    padding: 28,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: Paper,
  },
  avatarSymbol: {
    fontSize: 32,
    color: Ink,
    fontFamily: 'Caveat_700Bold',
  },
  userName: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 24,
    color: Ink,
    marginBottom: 4,
  },
  userLevel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
  },
  statValue: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 22,
    color: Ink,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: InkSoft,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  progressBox: {
    padding: 16,
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  progressInfo: {
    flex: 1,
  },
  branchName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Ink,
    marginBottom: 2,
  },
  branchMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: InkSoft,
  },
  emptyQuotesBox: {
    padding: 18,
    marginBottom: 4,
    borderColor: InkFaint,
  },
  emptyQuotesText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    lineHeight: 21,
    marginBottom: 14,
  },
  browseBtn: {
    backgroundColor: Ink,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  browseBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: Paper,
  },
  quoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  quoteContent: { flex: 1 },
  quoteText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    fontStyle: 'italic',
    color: Ink,
    lineHeight: 25,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Blue,
  },
  removeBtn: { padding: 2 },
  signOutBtn: {
    borderWidth: 2,
    borderColor: Crimson,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  signOutText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Crimson,
  },
});
