import { View, Text, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from '@/lib/supabase/auth';
import { ALL_BRANCHES } from '@/data';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';
const Crimson = '#A83232';

export default function ProfileScreen() {
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
            { label: 'Lessons', value: `0 / ${totalLessons}` },
            { label: 'Level', value: '1' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.sketchBox, styles.statBox]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress section */}
        <View style={styles.sectionRow}>
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
