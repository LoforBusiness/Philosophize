import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import Glyph from '@/components/shared/Glyph';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { signOut } from '@/lib/supabase/auth';
import { ALL_BRANCHES } from '@/data';
import { rankForXP } from '@/data/ranks';
import { BADGES } from '@/data/badges';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';
const Gold = '#9C9A93';
const PaperMute = '#9C9A93';
const Track = '#E6E4DC';

const SW = Dimensions.get('window').width;
const BADGE_W = (SW - 40 - 30) / 4; // 20px page padding, three 10px gaps

const SHORT: Record<string, string> = {
  logic: 'LOGIC',
  ethics: 'ETHICS',
  epistemology: 'EPISTEMOLOGY',
  metaphysics: 'METAPHYSICS',
  aesthetics: 'AESTHETICS',
  'political-philosophy': 'POLITICS',
};
const BICON: Record<string, SketchIconName> = {
  logic: 'logic',
  ethics: 'scales',
  epistemology: 'eye',
  metaphysics: 'spiral',
  aesthetics: 'palette',
  'political-philosophy': 'building',
};
const TITLE: Record<string, string> = {
  logic: 'LOGICIAN',
  ethics: 'ETHICIST',
  epistemology: 'EPISTEMOLOGIST',
  metaphysics: 'METAPHYSICIAN',
  aesthetics: 'AESTHETE',
  'political-philosophy': 'THEORIST',
};

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Mon–Sun chips for the current week, marking which days are inside the streak.
function weekChips(streak: number, lastLessonDate: string | null) {
  const labels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);
  const todayKey = dayKey(today);

  let last = today;
  if (lastLessonDate) {
    const [y, m, d] = lastLessonDate.split('-').map(Number);
    if (y && m && d) {
      const ld = new Date(y, m - 1, d);
      ld.setHours(0, 0, 0, 0);
      if (!isNaN(ld.getTime())) last = ld;
    }
  }
  const active = new Set<string>();
  for (let k = 0; k < streak; k++) {
    const d = new Date(last);
    d.setDate(last.getDate() - k);
    active.add(dayKey(d));
  }

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dayKey(d);
    const state = active.has(key) ? 'filled' : key === todayKey ? 'today' : 'faint';
    return { label, state };
  });
}

function SectionLabel({ children }: { children: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionLabel}>{children}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const streak = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const joinedAt = useUserDataStore((s) => s.joinedAt);
  const ensureJoinDate = useUserDataStore((s) => s.ensureJoinDate);
  const displayName = useUserDataStore((s) => s.displayName);
  const earnedBadges = useUserDataStore((s) => s.earnedBadges);
  const openRanksBadges = useUIStore((s) => s.openRanksBadges);

  useEffect(() => {
    ensureJoinDate();
  }, [ensureJoinDate]);

  const lessonsDone = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const quotesSaved = savedQuotes.length;
  const distinctViewed = Object.keys(philosopherViews).length;
  const totalXP = lessonsDone * 25 + quotesSaved * 10 + distinctViewed * 5;

  const mastery = ALL_BRANCHES.map((b) => {
    const total = b.paths.reduce((acc, p) => acc + p.lessons.length, 0);
    const done = lessonsByBranch[b.slug] ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    return { slug: b.slug, name: SHORT[b.slug] ?? b.name.toUpperCase(), icon: BICON[b.slug] ?? 'frame', pct };
  }).sort((a, b) => b.pct - a.pct);

  const topBranch = (mastery[0]?.pct ?? 0) > 0 ? mastery[0].slug : null;
  const descriptor = topBranch ? TITLE[topBranch] ?? 'SEEKER' : 'SEEKER';

  const { current: cur, next } = rankForXP(totalXP);
  const nextThreshold = next?.xp ?? cur.xp;
  const rankPct = next ? Math.min(1, totalXP / next.xp) : 1;

  const join = joinedAt ? new Date(joinedAt) : new Date();
  const joinedLabel = `JOINED ${MONTHS[join.getMonth()]} ${join.getFullYear()}`;

  const chips = weekChips(streak, lastLessonDate);

  // First eight of the shared badge set, earned-state from the persisted store.
  const badges = BADGES.slice(0, 8).map((b) => ({
    id: b.id,
    name: b.name,
    glyph: b.glyph,
    earned: earnedBadges.includes(b.id),
  }));

  function handleSignOut() {
    Alert.alert('Account', 'Sign out of Philosophize?', [
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

  return (
    <ScreenTransition bg={Ink}>
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark header */}
        <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
          <Pressable style={styles.settingsBtn} hitSlop={10} onPress={() => router.push('/(app)/settings')}>
            <SketchIcon name="settings" size={22} color={Paper} />
          </Pressable>

          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
            <View style={styles.avatarBadge}>
              <SketchIcon name="hat" size={14} color={Ink} />
            </View>
          </View>

          <Text style={styles.name}>{displayName.toUpperCase()}</Text>
          <Text style={styles.subtitle}>
            {descriptor} · {joinedLabel}
          </Text>

          <Pressable
            style={({ pressed }) => [styles.rankChip, pressed && { opacity: 0.7 }]}
            onPress={() => openRanksBadges('ranks')}
          >
            <SketchIcon name="star" size={13} color={Paper} />
            <Text style={styles.rankChipText}>RANK: {cur.name.toUpperCase()}</Text>
          </Pressable>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <SectionLabel>AT A GLANCE</SectionLabel>
          <View style={styles.glanceRow}>
            <View style={styles.glanceBox}>
              <SketchIcon name="book" size={20} color={Ink} />
              <Text style={styles.glanceValue}>{lessonsDone}</Text>
              <Text style={styles.glanceLabel}>LESSONS DONE</Text>
            </View>
            <View style={styles.glanceBox}>
              <SketchIcon name="star" size={20} color={Ink} />
              <Text style={styles.glanceValue}>{totalXP.toLocaleString()}</Text>
              <Text style={styles.glanceLabel}>TOTAL XP</Text>
            </View>
          </View>

          <SectionLabel>DAILY STREAK</SectionLabel>
          <View style={styles.streakBox}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakWord}>DAY STREAK</Text>
            </View>
            <View style={styles.chipsRow}>
              {chips.map((c, i) => (
                <View
                  key={i}
                  style={[
                    styles.dayChip,
                    c.state === 'filled' && styles.dayChipFilled,
                    c.state === 'today' && styles.dayChipToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      c.state === 'filled' && { color: Paper },
                      c.state === 'faint' && { color: InkFaint },
                    ]}
                  >
                    {c.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <SectionLabel>PROGRESS TO NEXT RANK</SectionLabel>
          <View style={styles.rankBox}>
            <View style={styles.rankBoxTop}>
              <Text style={styles.rankName}>{cur.name}</Text>
              <Text style={styles.rankXp}>
                {totalXP.toLocaleString()} / {nextThreshold.toLocaleString()} XP
              </Text>
            </View>
            <View style={styles.bigTrack}>
              <View style={[styles.bigFill, { width: `${Math.round(rankPct * 100)}%` }]} />
            </View>
            <Text style={styles.rankUntil}>
              {next
                ? `${(nextThreshold - totalXP).toLocaleString()} XP UNTIL ${next.name.toUpperCase()}`
                : 'HIGHEST RANK ACHIEVED'}
            </Text>
          </View>

          <SectionLabel>BRANCH MASTERY</SectionLabel>
          <View style={styles.masteryBox}>
            {mastery.map((m) => (
              <View key={m.slug} style={styles.masteryRow}>
                <SketchIcon name={m.icon} size={18} color={Ink} />
                <Text style={styles.masteryName}>{m.name}</Text>
                <View style={styles.masteryTrack}>
                  <View style={[styles.masteryFill, { width: `${m.pct}%` }]} />
                </View>
                <Text style={styles.masteryPct}>{m.pct}%</Text>
              </View>
            ))}
          </View>

          <SectionLabel>BADGES EARNED</SectionLabel>
          <Pressable style={styles.badgeGrid} onPress={() => openRanksBadges('badges')}>
            {badges.map((b) => (
              <View
                key={b.id}
                style={[styles.badge, !b.earned && styles.badgeLocked]}
              >
                <Glyph name={b.glyph} size={22} color={b.earned ? Ink : InkFaint} />
                <Text
                  style={[styles.badgeLabel, !b.earned && { color: InkFaint }]}
                  numberOfLines={2}
                >
                  {b.name.toUpperCase()}
                </Text>
              </View>
            ))}
          </Pressable>

          <Pressable onPress={handleSignOut} style={styles.signOut} hitSlop={8}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Ink },
  scroll: { flex: 1, backgroundColor: Paper },

  header: {
    backgroundColor: Ink,
    alignItems: 'center',
    paddingBottom: 26,
    paddingHorizontal: 20,
  },
  settingsBtn: { position: 'absolute', right: 16, top: 0, padding: 8 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: Paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontFamily: 'Caveat_700Bold', fontSize: 44, color: Paper, lineHeight: 50 },
  avatarBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Paper,
    borderWidth: 1.5,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: Paper,
    letterSpacing: 2,
    marginTop: 14,
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: Gold,
    letterSpacing: 2,
    marginTop: 6,
  },
  rankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Paper,
    borderRadius: 3,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 14,
  },
  rankChipText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Paper, letterSpacing: 1 },

  body: { paddingHorizontal: 20, paddingTop: 20 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  sectionLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, letterSpacing: 3, marginRight: 12 },
  sectionLine: { flex: 1, height: 1, backgroundColor: InkFaint },

  glanceRow: { flexDirection: 'row', gap: 12 },
  glanceBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 3,
    paddingVertical: 18,
    alignItems: 'center',
  },
  glanceValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Ink, marginTop: 8 },
  glanceLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft, letterSpacing: 1.5, marginTop: 2 },

  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 3,
    padding: 14,
    gap: 12,
  },
  streakLeft: { alignItems: 'center', width: 60 },
  streakNum: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: Ink, lineHeight: 34 },
  streakWord: { fontFamily: 'Inter_500Medium', fontSize: 8, color: InkSoft, letterSpacing: 1 },
  chipsRow: { flexDirection: 'row', flex: 1, justifyContent: 'space-between' },
  dayChip: {
    width: 30,
    height: 30,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: InkFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipFilled: { backgroundColor: Ink, borderColor: Ink },
  dayChipToday: { borderColor: Ink },
  dayChipText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Ink },

  rankBox: { borderWidth: 1.5, borderColor: Ink, borderRadius: 3, padding: 16 },
  rankBoxTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  rankName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: Ink },
  rankXp: { fontFamily: 'Inter_400Regular', fontSize: 13, color: InkSoft },
  bigTrack: { height: 8, borderRadius: 4, backgroundColor: Track, overflow: 'hidden' },
  bigFill: { height: 8, borderRadius: 4, backgroundColor: Ink },
  rankUntil: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft, letterSpacing: 1, textAlign: 'right', marginTop: 10 },

  masteryBox: { gap: 16 },
  masteryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  masteryName: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Ink, letterSpacing: 0.5, width: 96 },
  masteryTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: Track, overflow: 'hidden' },
  masteryFill: { height: 6, borderRadius: 3, backgroundColor: Ink },
  masteryPct: { fontFamily: 'Inter_500Medium', fontSize: 12, color: InkSoft, width: 38, textAlign: 'right' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    width: BADGE_W,
    minHeight: 70,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  badgeLocked: { borderColor: InkFaint, opacity: 0.7 },
  badgeLabel: { fontFamily: 'Inter_700Bold', fontSize: 8, color: Ink, letterSpacing: 0.5, textAlign: 'center' },

  signOut: { alignSelf: 'center', marginTop: 30, padding: 10 },
  signOutText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: InkSoft },
});
