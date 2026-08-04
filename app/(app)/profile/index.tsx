import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import Glyph from '@/components/shared/Glyph';
import BadgeMedal from '@/components/shared/BadgeMedal';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { ProfileArtFill, ProfileAvatar, useProfileArt } from '@/components/shared/ProfileArt';
import { profileNameStyle, profileNameText } from '@/data/profileFonts';
import StreakBook from '@/components/gamification/StreakBook';
import StreakWeek from '@/components/gamification/StreakWeek';
import { signOut } from '@/lib/supabase/auth';
import { useAuthSession } from '@/lib/supabase/useSession';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { rankProgress } from '@/data/ranks';
import { BADGES } from '@/data/badges';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { generateUserBio } from '@/lib/utils/userBio';
import { effectiveStreak } from '@/lib/utils/streak';
import { restDaysHeld } from '@/constants/streak';
import { useTodayKey } from '@/lib/utils/useTodayKey';

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
  const restDaysEarned = useUserDataStore((s) => s.restDaysEarned);
  const restDaysUsed = useUserDataStore((s) => s.restDaysUsed);
  useTodayKey();
  const shownStreak = effectiveStreak(
    streak,
    lastLessonDate,
    restDaysHeld(restDaysEarned, restDaysUsed),
  );
  const joinedAt = useUserDataStore((s) => s.joinedAt);
  const ensureJoinDate = useUserDataStore((s) => s.ensureJoinDate);
  const displayName = useUserDataStore((s) => s.displayName);
  const xp = useUserDataStore((s) => s.totalXP);
  const rankIndex = useUserDataStore((s) => s.rankIndex);
  const nameFont = useUserDataStore((s) => s.nameFont);
  const { palette } = useProfileArt();
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
  // THE STORE'S TOTAL, NOT A RE-DERIVED ONE.
  //
  // This read `xp + quotesSaved * 10 + distinctViewed * 5`, which paid for the same
  // things twice: `userDataStore` already adds XP_PER_SAVED_QUOTE (3) and
  // XP_PER_PHILOSOPHER_MET (2) the moment a quote is saved or a thinker is opened,
  // so those were being counted again here — and at rates that match nothing in
  // constants/xp.ts.
  //
  // It is the reason Profile and the Ranks sheet disagreed about the same account.
  // With a real 8,905 XP, thirty saved quotes and nineteen thinkers, this line
  // showed 9,300 — over the Epistemologist threshold — so Profile said "FINISH A
  // LESSON TO REACH EPISTEMOLOGIST" while the sheet, reading the store, correctly
  // said 395 XP still to go. The sheet was right.
  const totalXP = xp;

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
      streak: shownStreak,
      quotesSaved,
      distinctViewed,
      topPhilosopher: topPhilosopher?.name ?? null,
      topInterestName: topInterest?.name ?? null,
      topInterestSlug: topInterest?.slug ?? null,
    },
    bioSeed
  );

  // One shared computation — see `rankProgress`. This screen used to divide
  // totalXP by the next threshold, which counts from zero rather than from the
  // start of the current band and read 96% where the Ranks sheet read 77%.
  const { current: cur, next, pending, pct: rankPct, toNext, inBand, bandSize } =
    rankProgress(rankIndex, totalXP);

  const join = joinedAt ? new Date(joinedAt) : new Date();
  const joinedLabel = `JOINED ${MONTHS[join.getMonth()]} ${join.getFullYear()}`;

  // A TROPHY SHELF, NOT THE FIRST EIGHT.
  //
  // This used to be `BADGES.slice(0, 8)` — the same eight for everybody, mostly
  // locked, and since the set is grouped by family now those eight would all be
  // one shape. What belongs on a profile is what the reader has actually won, so:
  // most recently struck first, then the next ones up.
  //
  // `earnedBadges` is appended to in earn order by `recomputeBadges` (it merges
  // the existing list ahead of the newly qualifying ones), so reversing it is a
  // good-enough "most recent". Falling back to canonical order if the store's
  // order is ever disturbed costs nothing, since either way these are all badges
  // they hold.
  const earnedFirst = earnedBadges
    .slice()
    .reverse()
    .map((id) => BADGES.find((b) => b.id === id))
    .filter((b): b is (typeof BADGES)[number] => !!b);
  const upNext = BADGES.filter((b) => !earnedBadges.includes(b.id));
  const badges = [...earnedFirst, ...upNext]
    .slice(0, 8)
    .map((b) => ({ ...b, earned: earnedBadges.includes(b.id) }));

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
    <ScreenTransition bg={palette.base}>
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        // Fifty-one badges plus the ranks strip make this the longest fixed page in
        // the app. It is not worth virtualising — the content is a handful of
        // distinct sections rather than one repeating cell — but detaching the parts
        // that are scrolled off keeps the fling cheap on Android.
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {/* The header wears the user's chosen artwork. Every colour in it comes
            from that art's tone palette, so a light engraving gets ink text and a
            dark one gets paper text — the words stay readable either way. */}
        <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
          <ProfileArtFill />

          <Pressable style={[styles.settingsBtn, { top: insets.top + 6 }]} hitSlop={10} onPress={() => router.push('/(app)/settings')}>
            <SketchIcon name="settings" size={22} color={palette.text} />
          </Pressable>

          <View>
            <ProfileAvatar size={76} letter={displayName.charAt(0)} />
            <View style={[styles.avatarBadge, { backgroundColor: palette.text, borderColor: palette.base }]}>
              <SketchIcon name="hat" size={14} color={palette.base} />
            </View>
          </View>

          <Text style={[styles.name, profileNameStyle(nameFont, 26), { color: palette.text }]}>
            {profileNameText(nameFont, displayName)}
          </Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>
            {descriptor} · {joinedLabel}
          </Text>

          <Pressable
            style={({ pressed }) => [styles.rankChip, { borderColor: palette.line }, pressed && { opacity: 0.7 }]}
            onPress={() => openRanksBadges('ranks')}
          >
            <SketchIcon name="star" size={13} color={palette.text} />
            <Text style={[styles.rankChipText, { color: palette.text }]}>RANK: {cur.name.toUpperCase()}</Text>
          </Pressable>

          {/* Featured "profile quote" — set from any quote (lesson / saved / thinker).
              Tapping it opens that thinker; empty state nudges the user to pick one. */}
          {profileQuote ? (
            <Pressable
              onPress={() => openPhilosopher(profileQuote.philosopherId)}
              style={({ pressed }) => [styles.profileQuote, pressed && { opacity: 0.7 }]}
              hitSlop={6}
            >
              <Text style={[styles.profileQuoteText, { color: palette.text }]} numberOfLines={4}>
                “{profileQuote.text}”
              </Text>
              <Text style={[styles.profileQuoteBy, { color: palette.muted }]}>
                — {profileQuote.author.toUpperCase()}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={openSavedQuotes}
              style={({ pressed }) => [styles.profileQuotePrompt, pressed && { opacity: 0.6 }]}
              hitSlop={6}
            >
              <SketchIcon name="star" size={12} color={palette.muted} />
              <Text style={[styles.profileQuotePromptText, { color: palette.muted }]}>
                Feature a favorite quote
              </Text>
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
              <StreakBook value={shownStreak} size={66} />
              <Text style={styles.streakWord}>DAY STREAK</Text>
            </View>
            <View style={styles.chipsRow}>
              <StreakWeek streak={shownStreak} lastLessonDate={lastLessonDate} size={30} />
            </View>
          </View>

          <SectionLabel>PROGRESS TO NEXT RANK</SectionLabel>
          <View style={styles.rankBox}>
            <View style={styles.rankBoxTop}>
              <Text style={styles.rankName}>{cur.name}</Text>
              <Text style={styles.rankXp}>
                {/* XP EARNED INSIDE THIS BAND, not total against the next threshold.
                    The old pair could read "10,605 / 9,300 XP" once a promotion was
                    pending — a fraction bigger than its own denominator. */}
                {next
                  ? `${inBand.toLocaleString()} / ${bandSize.toLocaleString()} XP`
                  : `${totalXP.toLocaleString()} XP`}
              </Text>
            </View>
            <View style={styles.bigTrack}>
              <View style={[styles.bigFill, { width: `${Math.round(rankPct * 100)}%` }]} />
            </View>
            <Text style={styles.rankUntil}>
              {pending
                ? `FINISH A LESSON TO REACH ${(next?.name ?? '').toUpperCase()}`
                : next
                  ? `${toNext.toLocaleString()} XP UNTIL ${next.name.toUpperCase()}`
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
              <View key={b.id} style={styles.badge}>
                <BadgeMedal
                  family={b.family}
                  tier={b.tier}
                  glyph={b.glyph}
                  earned={b.earned}
                  size={BADGE_W - 12}
                />
                <Text
                  style={[styles.badgeLabel, !b.earned && styles.badgeLabelLocked]}
                  numberOfLines={2}
                >
                  {b.name}
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
    // No background colour: ProfileArtFill paints it. `overflow: hidden` keeps
    // the art inside the header, and it must stay above the art in z-order,
    // which it is by being rendered after it.
    alignItems: 'center',
    paddingBottom: 26,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  settingsBtn: { position: 'absolute', right: 16, padding: 8, zIndex: 2 },
  avatarBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    // family / size / tracking come from the chosen face (profileNameStyle).
    marginTop: 14,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 6,
  },
  rankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 3,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 14,
  },
  rankChipText: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1 },

  profileQuote: { alignItems: 'center', marginTop: 18, paddingHorizontal: 10, maxWidth: 340 },
  profileQuoteText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  profileQuoteBy: { fontFamily: 'Inter_500Medium', fontSize: 9.5, letterSpacing: 1.5, marginTop: 8 },
  profileQuotePrompt: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 16 },
  profileQuotePromptText: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 0.5 },

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
  // No border: the medal already has an outline, and a box around it just puts a
  // seventh shape on top of the six that carry the meaning.
  badge: { width: BADGE_W, alignItems: 'center', paddingVertical: 4, gap: 5 },
  badgeLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 7.5, lineHeight: 10, color: Ink,
    letterSpacing: 0.2, textAlign: 'center',
  },
  // The same cool slate BadgeMedal draws a locked medal in, so the name and the
  // mark under it are unmistakably one greyed-out object.
  badgeLabelLocked: { color: '#AAB1BC', fontFamily: 'Inter_500Medium' },

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
