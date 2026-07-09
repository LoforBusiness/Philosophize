import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import Glyph from '@/components/shared/Glyph';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import ScreenTransition from '@/components/shared/ScreenTransition';
import StreakBook from '@/components/gamification/StreakBook';
import StreakWeek from '@/components/gamification/StreakWeek';
import { signOut } from '@/lib/supabase/auth';
import { useAuthSession } from '@/lib/supabase/useSession';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { rankForXP } from '@/data/ranks';
import { BADGES } from '@/data/badges';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { generateUserBio } from '@/lib/utils/userBio';

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
  const xp = useUserDataStore((s) => s.totalXP);
  const earnedBadges = useUserDataStore((s) => s.earnedBadges);
  const bioSeed = useUserDataStore((s) => s.bioSeed);
  const settings = useUserDataStore((s) => s.settings);
  const showWidget = settings.widgetEnabled && settings.widgetPlacement === 'profile';
  const openRanksBadges = useUIStore((s) => s.openRanksBadges);
  const openSavedQuotes = useUIStore((s) => s.openSavedQuotes);
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const profileQuote = useUserDataStore((s) => s.profileQuote);
  const isSignedIn = !!useAuthSession();

  useEffect(() => {
    ensureJoinDate();
  }, [ensureJoinDate]);

  const lessonsDone = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const quotesSaved = savedQuotes.length;
  const distinctViewed = Object.keys(philosopherViews).length;
  const totalXP = xp + quotesSaved * 10 + distinctViewed * 5;

  const mastery = ALL_BRANCHES.map((b) => {
    const total = b.paths.reduce((acc, p) => acc + p.lessons.length, 0);
    const done = lessonsByBranch[b.slug] ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    return { slug: b.slug, name: SHORT[b.slug] ?? b.name.toUpperCase(), icon: BICON[b.slug] ?? 'frame', pct };
  }).sort((a, b) => b.pct - a.pct);

  const topBranch = (mastery[0]?.pct ?? 0) > 0 ? mastery[0].slug : null;
  const descriptor = topBranch ? TITLE[topBranch] ?? 'SEEKER' : 'SEEKER';

  // "From your insights" — the user's top philosopher and top area of interest,
  // scored the same way the Insights screen does.
  const philScores = ALL_PHILOSOPHERS.map((p) => {
    const views = philosopherViews[p.id] ?? 0;
    const quotes = savedQuotes.filter((q) => q.philosopherId === p.id).length;
    const learn = p.branchSlugs.reduce((a, s) => a + (lessonsByBranch[s] ?? 0), 0);
    return { name: p.name, score: views * 3 + quotes * 5 + learn };
  })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
  const topPhilosopher = philScores[0] ?? null;

  const branchInterest = ALL_BRANCHES.map((b) => {
    const lessons = lessonsByBranch[b.slug] ?? 0;
    const quotes = savedQuotes.filter((q) => q.branchSlugs.includes(b.slug)).length;
    const views = ALL_PHILOSOPHERS.filter((p) => p.branchSlugs.includes(b.slug)).reduce(
      (a, p) => a + (philosopherViews[p.id] ?? 0),
      0
    );
    return { slug: b.slug, name: b.name, interactions: lessons + quotes + views };
  }).sort((a, b) => b.interactions - a.interactions);
  const topInterest = (branchInterest[0]?.interactions ?? 0) > 0 ? branchInterest[0] : null;

  // A fun, auto-written character sketch assembled from what the user actually
  // does — lessons taken, quotes saved, thinkers they keep opening.
  const bio = generateUserBio(
    {
      lessonsDone,
      streak,
      quotesSaved,
      distinctViewed,
      topPhilosopher: topPhilosopher?.name ?? null,
      topInterestName: topInterest?.name ?? null,
      topInterestSlug: topInterest?.slug ?? null,
    },
    bioSeed
  );

  const { current: cur, next } = rankForXP(totalXP);
  const nextThreshold = next?.xp ?? cur.xp;
  const rankPct = next ? Math.min(1, totalXP / next.xp) : 1;

  const join = joinedAt ? new Date(joinedAt) : new Date();
  const joinedLabel = `JOINED ${MONTHS[join.getMonth()]} ${join.getFullYear()}`;

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
          <Pressable style={[styles.settingsBtn, { top: insets.top + 6 }]} hitSlop={10} onPress={() => router.push('/(app)/settings')}>
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

          {/* Featured "profile quote" — set from any quote (lesson / saved / thinker).
              Tapping it opens that thinker; empty state nudges the user to pick one. */}
          {profileQuote ? (
            <Pressable
              onPress={() => openPhilosopher(profileQuote.philosopherId)}
              style={({ pressed }) => [styles.profileQuote, pressed && { opacity: 0.7 }]}
              hitSlop={6}
            >
              <Text style={styles.profileQuoteText} numberOfLines={4}>
                “{profileQuote.text}”
              </Text>
              <Text style={styles.profileQuoteBy}>— {profileQuote.author.toUpperCase()}</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={openSavedQuotes}
              style={({ pressed }) => [styles.profileQuotePrompt, pressed && { opacity: 0.6 }]}
              hitSlop={6}
            >
              <SketchIcon name="star" size={12} color={Gold} />
              <Text style={styles.profileQuotePromptText}>Feature a favorite quote</Text>
            </Pressable>
          )}
        </View>

        {/* Body */}
        <View style={styles.body}>
          {showWidget ? <DailyQuoteWidget style={{ marginBottom: 22 }} /> : null}

          <SectionLabel>FROM YOUR INSIGHTS</SectionLabel>
          <View style={styles.insightsCard}>
            <View style={styles.insightRow}>
              <View style={styles.insightIcon}>
                <SketchIcon name="person" size={18} color={Ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightLabel}>TOP PHILOSOPHER</Text>
                <Text style={styles.insightValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  {topPhilosopher ? topPhilosopher.name : 'Keep exploring'}
                </Text>
              </View>
            </View>
            <View style={styles.insightDivider} />
            <View style={styles.insightRow}>
              <View style={styles.insightIcon}>
                <SketchIcon name={topInterest ? BICON[topInterest.slug] ?? 'spiral' : 'spiral'} size={18} color={Ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.insightLabel}>TOP AREA OF INTEREST</Text>
                <Text style={styles.insightValue} numberOfLines={1}>
                  {topInterest ? topInterest.name : 'Keep learning'}
                </Text>
              </View>
            </View>
          </View>

          <SectionLabel>WHO YOU'RE BECOMING</SectionLabel>
          <View style={styles.bioCard}>
            <View style={styles.bioQuill}>
              <SketchIcon name="pencil" size={16} color={Ink} />
            </View>
            <Text style={styles.bioText}>{bio}</Text>
          </View>

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
              <StreakBook value={streak} size={66} />
              <Text style={styles.streakWord}>DAY STREAK</Text>
            </View>
            <View style={styles.chipsRow}>
              <StreakWeek streak={streak} lastLessonDate={lastLessonDate} size={30} />
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

          <SectionLabel>SAVED QUOTES</SectionLabel>
          <Pressable
            style={({ pressed }) => [styles.quotesCard, pressed && { opacity: 0.7 }]}
            onPress={openSavedQuotes}
          >
            <View style={styles.quotesIcon}>
              <SketchIcon name={quotesSaved > 0 ? 'bookmark-filled' : 'bookmark'} size={20} color={Ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.quotesCount}>
                {quotesSaved > 0 ? `${quotesSaved} SAVED` : 'NONE YET'}
              </Text>
              <Text style={styles.quotesTeaser} numberOfLines={1}>
                {quotesSaved > 0
                  ? `“${savedQuotes[0].text}”`
                  : 'Save quotes from lessons to collect them here'}
              </Text>
            </View>
            {/* mirrored "back" chevron → forward chevron */}
            <View style={styles.quotesChev}>
              <SketchIcon name="back" size={14} color={InkSoft} />
            </View>
          </Pressable>

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

          {isSignedIn ? (
            <Pressable onPress={handleSignOut} style={styles.signOut} hitSlop={8}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/sign-in')}
              style={({ pressed }) => [styles.signInCta, pressed && { opacity: 0.85 }]}
              hitSlop={8}
            >
              <SketchIcon name="person" size={16} color={Ink} />
              <Text style={styles.signInCtaText}>Sign in or create an account</Text>
            </Pressable>
          )}
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
  settingsBtn: { position: 'absolute', right: 16, padding: 8 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: Paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 44,
    color: Paper,
    // Caveat's ink overhangs its glyph box on the right; Android clips text to
    // its tight advance-width box, cutting the right of the letter (e.g. the
    // "W"). Give the Text a width wider than the glyph so the ink renders fully;
    // textAlign centres it within that width.
    width: 72,
    lineHeight: 50,
    textAlign: 'center',
    includeFontPadding: false,
    transform: [{ translateX: -2.5 }],
  },
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

  profileQuote: { alignItems: 'center', marginTop: 18, paddingHorizontal: 10, maxWidth: 340 },
  profileQuoteText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 22,
    color: Paper,
    textAlign: 'center',
  },
  profileQuoteBy: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: Gold, letterSpacing: 1.5, marginTop: 8 },
  profileQuotePrompt: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 16 },
  profileQuotePromptText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: Gold, letterSpacing: 0.5 },

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

  bioCard: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 3,
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  bioQuill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  bioText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 25,
    color: Ink,
    textAlign: 'center',
  },

  insightsCard: { borderWidth: 1.5, borderColor: Ink, borderRadius: 3, padding: 16 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  insightIcon: {
    width: 38,
    height: 38,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightLabel: { fontFamily: 'Inter_500Medium', fontSize: 9, color: InkSoft, letterSpacing: 1.5 },
  insightValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Ink, marginTop: 3 },
  insightDivider: { height: 1, backgroundColor: InkFaint, marginVertical: 14 },

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
  chipsRow: { flex: 1, justifyContent: 'center' },
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

  quotesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 3,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  quotesIcon: {
    width: 38,
    height: 38,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quotesCount: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Ink, letterSpacing: 1.5 },
  quotesTeaser: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: InkSoft, marginTop: 3 },
  quotesChev: { transform: [{ scaleX: -1 }], opacity: 0.7 },

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
  signInCta: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 30,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  signInCtaText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Ink, letterSpacing: 0.2 },
});
