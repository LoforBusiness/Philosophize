import { useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Alert, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import SketchIcon from '@/components/shared/SketchIcon';
import Glyph from '@/components/shared/Glyph';
import BadgeMedal from '@/components/shared/BadgeMedal';
import RankClimbChart from '@/components/shared/RankClimbChart';
import { ShareBars, StackBar, DayBars } from '@/components/profile/InkCharts';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import ScreenTransition from '@/components/shared/ScreenTransition';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { C, TYPE, SPACE, BRANCH, type TypeKey, type BranchKey } from '@/constants/design';
import { GHOST, METAL, ramp } from '@/components/shared/tone';
import { StruckBar, StruckTile, MetalPlate, MasteryRow, ShelfCount } from '@/components/profile/Struck';
import RankSeal from '@/components/shared/RankSeal';
import { BRANCH_SHORT, BRANCH_ICON } from '@/components/shared/branchMarks';
import Showcase from '@/components/profile/Showcase';
import { ProfileArtFill, ProfileAvatar, useProfileArt } from '@/components/shared/ProfileArt';
import { profileNameStyle, profileNameText } from '@/data/profileFonts';
import StreakPanel from '@/components/gamification/StreakPanel';
import { signOut } from '@/lib/supabase/auth';
import { useAuthSession } from '@/lib/supabase/useSession';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { rankProgress, rankOrder, rankDegree, rankInsignia, RANKS } from '@/data/ranks';
import { BADGES } from '@/data/badges';
import { useUserDataStore, progressStats } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { generateUserBio } from '@/lib/utils/userBio';
import { effectiveStreak, daysMissed } from '@/lib/utils/streak';
import { restDaysHeld, restCap } from '@/constants/streak';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useTodayKey } from '@/lib/utils/useTodayKey';
import { dailyXP, activeDays } from '@/lib/utils/xpSeries';
import { useInView } from '@/lib/utils/useInView';

const SW = Dimensions.get('window').width;
// The page gutter (SPACE[3], both sides) and three inter-badge gaps (SPACE[1]) across four columns.
const BADGE_W = (SW - SPACE[3] * 2 - SPACE[1] * 3) / 4;

// The short names and marks moved to components/shared/branchMarks.ts when the
// paywall started drawing mastery rows too — two private copies of the same six
// keys is how "POLITICS" becomes "Political Philosophy" on one screen only.
const SHORT = BRANCH_SHORT;
const BICON = BRANCH_ICON;
const TITLE: Record<string, string> = {
  logic: 'LOGICIAN',
  ethics: 'ETHICIST',
  epistemology: 'EPISTEMOLOGIST',
  metaphysics: 'METAPHYSICIAN',
  aesthetics: 'AESTHETE',
  'political-philosophy': 'THEORIST',
};

// FOUR CONSTANTS, BUILT ONCE. It sat inside the component, so every render made
// a new object and handed it to three charts as a prop — which is enough on its
// own to defeat any memo they might be given.
const CHART_INK = { ink: C.ink, soft: C.inkSoft, faint: C.hairline, paper: C.paper };

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
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const quizScores = useUserDataStore((s) => s.quizScores);
  // NOT `activeDays` — that name is already taken in this file by the FUNCTION
  // imported from lib/utils/xpSeries, and shadowing it here would have silently
  // handed `progressStats` a function where it wanted an array of dates.
  const practisedDays = useUserDataStore((s) => s.activeDays);
  const streak = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const restDaysEarned = useUserDataStore((s) => s.restDaysEarned);
  const restDaysUsed = useUserDataStore((s) => s.restDaysUsed);
  useTodayKey();
  // The cap is the reader's TIER, not a constant — free holds two rest days and
  // a Scholar's Pass five, so the panel's empty sockets have to be counted from
  // the subscription rather than hard-coded.
  const isPro = useSubscriptionStore((s) => s.isPro);
  const restHeld = restDaysHeld(restDaysEarned, restDaysUsed);
  const shownStreak = effectiveStreak(streak, lastLessonDate, restHeld);
  // Whether a rest day is currently carrying the streak. Derived here the same
  // way Home derives it, so the two panels never disagree about the same day.
  const restBridging = shownStreak > 0 && daysMissed(lastLessonDate) > 0;
  const joinedAt = useUserDataStore((s) => s.joinedAt);
  const ensureJoinDate = useUserDataStore((s) => s.ensureJoinDate);
  const displayName = useUserDataStore((s) => s.displayName);
  const xp = useUserDataStore((s) => s.totalXP);
  const rankIndex = useUserDataStore((s) => s.rankIndex);
  const xpEvents = useUserDataStore((s) => s.xpEvents);
  // NOT SUBSCRIBED HERE. `chartSeenXP` is read and written by the chart itself
  // now — see `selfSeen` in RankClimbChart. Subscribing to it from a screen this
  // large meant the chart finishing its own intro cost a full re-render.
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

  // IS THIS SCREEN ACTUALLY IN FRONT OF ANYONE?
  //
  // Every tab is built at startup so it can be switched to instantly, which means
  // mounting is not the same as being seen — the climb chart would otherwise play
  // its intro to a Profile tab the reader is nowhere near, spend the one animation
  // it had, and mark the XP as seen. So the chart is told when the tab is focused
  // and not before.
  // NEITHER OF THESE IS SCREEN STATE ANY MORE, AND THAT IS THE PERFORMANCE FIX.
  //
  // This component is ~890 nodes and 45 SVGs, so one `setState` here re-renders
  // all of it in a single blocking commit — measured at 976ms against 23ms with
  // the update suppressed and everything else identical. It had exactly two
  // pieces of state, "is the tab focused" and "is the chart on screen", and both
  // existed only to compute ONE boolean for ONE child. So the watcher keeps them
  // in refs and publishes them, and the chart subscribes; see lib/utils/useInView
  // for the numbers and the bisect. Profile now re-renders only when the reader's
  // own data changes.
  const climb = useInView();
  const climbSet = climb.setActive;
  const climbCheck = climb.check;
  useFocusEffect(
    useCallback(() => {
      climbSet(true);
      // COMING BACK IS A FRESH LOOK, AND IT HAS TO BE MEASURED LIKE ONE.
      //
      // react-navigation keeps this screen mounted and keeps the scroll position
      // where it was, so on the way back the chart is either already on screen or
      // nine hundred points away — and which of the two is not knowable without
      // measuring. Hence the re-arm on the way out, and a short BURST of checks on
      // the way in rather than a single one: react-native-screens detaches a
      // blurred tab from the window, and a detached view cannot be measured at all
      // (see `trustworthy`), so the first check after focus can legitimately
      // arrive before there is anything to read. Three tries inside two-thirds of
      // a second, and then it costs nothing for the rest of the visit.
      const tries = [60, 240, 620].map((ms) => setTimeout(climbCheck, ms));
      return () => {
        tries.forEach(clearTimeout);
        climbSet(false);
      };
    }, [climbCheck, climbSet]),
  );

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

  // `done` and `total` ride along now, because the percentage was hiding them.
  // "68%" of an unknown number is not something a reader can act on; "23 of 34"
  // is, and it is the same fact with the denominator left in.
  const mastery = useMemo(() => ALL_BRANCHES.map((b) => {
    const total = b.paths.reduce((acc, p) => acc + p.lessons.length, 0);
    const done = Math.min(total, lessonsByBranch[b.slug] ?? 0);
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    return {
      slug: b.slug,
      name: SHORT[b.slug] ?? b.name.toUpperCase(),
      icon: BICON[b.slug] ?? 'frame',
      hue: BRANCH[b.slug as BranchKey] ?? C.ink,
      done,
      total,
      pct,
    };
  }).sort((a, b) => b.pct - a.pct), [lessonsByBranch]);
  const branchesComplete = mastery.filter((m) => m.total > 0 && m.done >= m.total).length;

  const topBranch = (mastery[0]?.pct ?? 0) > 0 ? mastery[0].slug : null;
  const descriptor = topBranch ? TITLE[topBranch] ?? 'SEEKER' : 'SEEKER';

  // RETURNING TO SOMEONE MEANS YOU OPENED THEM.
  //
  // This used to score `views×3 + quotes×5 + lessons in their branches`, copied
  // from the Insights pie. That last term is shared by every thinker in a branch
  // and it is large, so it decided the ranking on its own: seeded with a real
  // reader's shape of data, this section listed Zeno of Citium, Boethius and Duns
  // Scotus as thinkers they "keep returning to" — none of whom they had ever
  // opened. The entire score was lessons other people's names were attached to.
  //
  // The two-line layout hid that, because a single name looks authoritative and
  // nothing was shown next to it. A ranked list with the behaviour beside each row
  // could not hide it, which is the argument for drawing data rather than stating
  // it: the picture failed loudly where the sentence failed silently.
  //
  // So this scores what its own heading promises — opening someone, and keeping
  // something they said. Insights keeps the branch-weighted formula, which is
  // right for the question IT asks ("which thinkers surround what I read"). They
  // are now two different questions rather than one answered inconsistently.
  const philScores = useMemo(() => ALL_PHILOSOPHERS.map((p) => {
    const views = philosopherViews[p.id] ?? 0;
    const quotes = savedQuotes.filter((q) => q.philosopherId === p.id).length;
    return { name: p.name, score: views * 3 + quotes * 5, opened: views, kept: quotes };
  })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score), [philosopherViews, savedQuotes]);
  const topPhilosopher = philScores[0] ?? null;

  const branchInterest = useMemo(() => ALL_BRANCHES.map((b) => {
    const lessons = lessonsByBranch[b.slug] ?? 0;
    const quotes = savedQuotes.filter((q) => q.branchSlugs.includes(b.slug)).length;
    const views = ALL_PHILOSOPHERS.filter((p) => p.branchSlugs.includes(b.slug)).reduce(
      (a, p) => a + (philosopherViews[p.id] ?? 0),
      0
    );
    return { slug: b.slug, name: b.name, interactions: lessons + quotes + views };
  }).sort((a, b) => b.interactions - a.interactions), [lessonsByBranch, savedQuotes, philosopherViews]);
  const topInterest = (branchInterest[0]?.interactions ?? 0) > 0 ? branchInterest[0] : null;

  // ── what the three sections DRAW ──────────────────────────────────────────
  //
  // All three used to state a single fact each — a name, a number, a paragraph —
  // and a single fact has no shape. These are the same facts with their
  // proportions left in, which is the whole difference between "Nietzsche" and
  // "Nietzsche, and by how much".
  const thinkerRows = useMemo(() => philScores.slice(0, 4).map((ph) => ({
    label: ph.name,
    value: ph.score,
    detail: ph.opened > 0 || ph.kept > 0
      ? [ph.opened > 0 ? ph.opened + ' opened' : null, ph.kept > 0 ? ph.kept + ' saved' : null]
          .filter(Boolean).join(' · ')
      : undefined,
  })), [philScores]);
  const branchParts = useMemo(() => branchInterest
    .filter((b) => b.interactions > 0)
    .map((b) => ({
      label: SHORT[b.slug] ?? b.name,
      value: b.interactions,
      color: BRANCH[b.slug as BranchKey],
    })), [branchInterest]);
  // A fortnight is long enough to show a habit and short enough that one good
  // Sunday does not flatten every other day into the baseline.
  const xpDays = useMemo(() => dailyXP(xpEvents, 14, Date.now()), [xpEvents]);
  const daysActive = activeDays(xpDays);

  // A fun, auto-written character sketch assembled from what the user actually
  // does — lessons taken, quotes saved, thinkers they keep opening.
  const bio = useMemo(() => generateUserBio(
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
  ), [lessonsDone, shownStreak, quotesSaved, distinctViewed, topPhilosopher, topInterest, bioSeed]);

  // One shared computation — see `rankProgress`. This screen used to divide
  // totalXP by the next threshold, which counts from zero rather than from the
  // start of the current band and read 96% where the Ranks sheet read 77%.
  // The same measurement the store awards from and the Ranks sheet displays —
  // three copies of one calculation is three chances for the cabinet to disagree
  // with the badge grid about whether a medal is held.
  const badgeStats = useMemo(
    () => progressStats({
      lessonsByBranch, lessonsByUnit, savedQuotes, philosopherViews, quizScores,
      streak: shownStreak, totalXP, activeDays: practisedDays, rankIndex,
    }),
    [lessonsByBranch, lessonsByUnit, savedQuotes, philosopherViews, quizScores,
      shownStreak, totalXP, practisedDays, rankIndex],
  );

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
  const badges = useMemo(() => {
  const earnedFirst = earnedBadges
    .slice()
    .reverse()
    .map((id) => BADGES.find((b) => b.id === id))
    .filter((b): b is (typeof BADGES)[number] => !!b);
  const upNext = BADGES.filter((b) => !earnedBadges.includes(b.id));
  return [...earnedFirst, ...upNext]
    .slice(0, 8)
    .map((b) => ({ ...b, earned: earnedBadges.includes(b.id) }));
  }, [earnedBadges]);

  function handleSignOut() {
    Alert.alert('Account', 'Sign out of Ashmere?', [
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

  // ── EVERY SECTION IS MEMOISED, AND THAT IS THE POINT OF THIS SHAPE ────────
  //
  // This screen is ~890 nodes and 45 SVGs in one component, so React reconciles
  // all of it on every render — and it re-renders whenever any of the fifteen
  // store fields it reads moves. Finishing a lesson moves six of them. Measured
  // before this: one write cost about 190ms to the next paint, on a screen the
  // reader may not even be looking at, because all five tabs are built at
  // startup and stay mounted for the session.
  //
  // Wrapping each section in `useMemo` hands React the SAME ELEMENT back when
  // that section's own inputs have not changed, and an unchanged element is a
  // subtree React skips entirely. A write now costs the sections it actually
  // touches: the badge shelf does not re-reconcile because the streak moved.
  //
  // TWO RULES, and this file will punish you for either:
  //
  //   · the dependency list must name everything the section reads. It is NOT
  //     type-checked, and the failure it produces is a section that quietly
  //     stops updating. What caught it during the split was an equivalence
  //     harness that records the whole page before and after a store mutation —
  //     a stale section is a row that did not change when it should have.
  //   · these are hooks, so they run unconditionally and in order every render
  //     (§17's rule 1). Never put one inside a condition or a `&&`.
  //
  // Nothing here changes what is drawn, and that was verified rather than
  // assumed: 753 rows of element geometry, colour, font and text at three
  // scroll positions, and the same again after a lesson was recorded.
  return (
    <ScreenTransition bg={palette.base}>
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: SPACE[5] }}
        showsVerticalScrollIndicator={false}
        // Only until the rank chart has been seen: `useInView` latches and then
        // stops measuring, so this costs nothing for the rest of the visit.
        onScroll={climb.check}
        scrollEventThrottle={64}
        // The two ends of a gesture as well as the middle of it. `onScroll` is
        // throttled and `removeClippedSubviews` below means the chart may only
        // become measurable at all part-way through the flick that brings it in —
        // so the cheapest insurance against a look that goes unnoticed is to ask
        // again at the moments the reader has definitely stopped moving.
        onScrollEndDrag={climb.check}
        onMomentumScrollEnd={climb.check}
        // ── THIS IS THE CLIPPING ROOT, AND ON ITS OWN IT CLIPS NOTHING ────────
        //
        // Fifty-one badges plus the ranks strip make this the longest fixed page
        // in the app — 2770 units against Home's 1316 — so detaching what is
        // scrolled off is worth having. It has never happened.
        //
        // `removeClippedSubviews` works per DIRECT CHILD, and measured in the
        // real page this ScrollView has exactly TWO: the header, and one body
        // View 2471 units tall. The body spans the viewport at every scroll
        // position, so neither child is ever fully off screen and the pass
        // detaches nothing, ever — at the top it could reach 0 of 716 nodes. The
        // note that used to sit here claimed it "keeps the fling cheap"; that
        // was never true of this content shape, and nothing measured it.
        //
        // It stays because it is the ROOT of the clipping pass: React Native only
        // recurses into nested clipping groups from a ScrollView that has the
        // flag itself. The View that can actually use it is `styles.body` below,
        // which has nineteen children — twelve of them, 525 of the page's 716
        // nodes, start below the fold.
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {/* The header wears the user's chosen artwork. Every colour in it comes
            from that art's tone palette, so a light engraving gets ink text and a
            dark one gets paper text — the words stay readable either way. */}
        {/* header */}
        {useMemo(() => (
          <>
        <View style={[styles.header, { paddingTop: insets.top + SPACE[3] }]}>
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
          </>
        ), [insets.top, palette, displayName, nameFont, descriptor, joinedLabel, cur, profileQuote, openRanksBadges, openSavedQuotes, openPhilosopher])}

        {/* Body */}
        {/* THE CLIPPING ACTUALLY HAPPENS HERE — see the note on the ScrollView.
            Nineteen children, twelve of them below the fold when the reader is at
            the top, which is 525 of the page's 716 nodes and 44 of its 50 SVGs.
            Layout-neutral by definition: the flag only detaches views that are
            already outside the visible rect. */}
        <View style={styles.body} removeClippedSubviews={Platform.OS === 'android'}>
          {/* THE CABINET, FIRST. The pin you hold and the three medals you chose
              to be seen holding — see components/profile/Showcase. It is above
              everything because it is the only part of this page that is a
              statement rather than a measurement. */}
          <Showcase stats={badgeStats} rankIndex={rankIndex} />

          {showWidget ? <DailyQuoteWidget style={{ marginBottom: SPACE[4] }} /> : null}

          {/* insights */}
          {useMemo(() => (
            <>
          <SectionLabel>FROM YOUR INSIGHTS</SectionLabel>
          <Card>
            {/* A NAME IS A FACT WITH NO SHAPE. This said "TOP PHILOSOPHER —
                Nietzsche", which cannot tell you whether that is a landslide or a
                one-quote lead, and left out second and third — the interesting
                part of anyone's reading. Same data, proportions left in. */}
            <Text style={styles.insightLabel}>THINKERS YOU KEEP RETURNING TO</Text>
            {topPhilosopher ? (
              <View style={{ marginTop: SPACE[2] }}>
                {/* Gold on the leader only — a placing rather than a longer bar. */}
                <ShareBars rows={thinkerRows} c={CHART_INK} accent={METAL.GOLD.base} />
              </View>
            ) : (
              <>
                <Text style={styles.insightValue}>Keep exploring</Text>
                <Text style={styles.insightHint}>
                  Open a few thinkers and they will rank themselves here.
                </Text>
              </>
            )}
          </Card>
            </>
          ), [topPhilosopher, thinkerRows])}

          {/* becoming */}
          {useMemo(() => (
            <>
          <SectionLabel>WHO YOU'RE BECOMING</SectionLabel>
          <Card pad={4} style={styles.bioCard}>
            <View style={styles.bioQuill}>
              <SketchIcon name="pencil" size={16} color={C.ink} />
            </View>
            <Text style={styles.bioText}>{bio}</Text>
            {/* THE SENTENCE, THEN ITS SHAPE. Six bars would be a chart; one bar
                cut six ways is a portrait, and it answers this section’s own
                question in a way the prose cannot — whether this reader is a
                specialist or a wanderer. */}
            {branchParts.length > 0 ? (
              <View style={styles.bioShape}>
                <Text style={styles.insightLabel}>WHERE YOUR READING GOES</Text>
                <View style={{ marginTop: SPACE[2] }}>
                  <StackBar parts={branchParts} c={CHART_INK} />
                </View>
              </View>
            ) : null}
          </Card>
            </>
          ), [bio, branchParts])}

          {/* glance */}
          {useMemo(() => (
            <>
          <SectionLabel>AT A GLANCE</SectionLabel>
          <View style={styles.glanceRow}>
            {/* `glanceCol` carries the flex that would otherwise land on Card's
                FACE, not on the box that has to share the row — the same fix
                settings.tsx's `planCol` made for its two plan panels. */}
            {/* EMBOSSED, not flat. These two are the headline numbers on the
                page and they were drawn on the same inert white face as every
                other box, so the biggest facts arrived with the least weight.
                A lit corner, a shaded one and a shadow is the badge treatment
                applied to a rectangle — which is the point, since a profile is a
                case of struck things. The top edge carries the metal of whatever
                the tile is about. */}
            <View style={styles.glanceCol}>
              <StruckTile accent={METAL.BRONZE.base} style={styles.glanceTile}>
                <View style={styles.glanceTop}>
                  <SketchIcon name="book" size={15} color={C.ink} />
                  <Text style={styles.glanceLabel}>LESSONS DONE</Text>
                </View>
                <Text style={styles.glanceValue}>{lessonsDone}</Text>
                {/* HOW MANY DAYS, not just how many lessons. Six on one Sunday and
                    one on each of six days are the same total and completely
                    different habits. */}
                <Text style={styles.glanceFoot}>
                  {daysActive > 0
                    ? daysActive + ' active ' + (daysActive === 1 ? 'day' : 'days') + ' in a fortnight'
                    : 'Quiet fortnight'}
                </Text>
              </StruckTile>
            </View>
            <View style={styles.glanceCol}>
              <StruckTile accent={METAL.GOLD.base} style={styles.glanceTile}>
                <View style={styles.glanceTop}>
                  <SketchIcon name="star" size={15} color={C.ink} />
                  <Text style={styles.glanceLabel}>TOTAL XP</Text>
                </View>
                <Text style={styles.glanceValue}>{totalXP.toLocaleString()}</Text>
                {/* A fortnight, one bar a day, empty days drawn empty. A line would
                    join the gaps and imply reading on days there was none — and the
                    gaps are the habit. */}
                <View style={{ marginTop: SPACE[1] }}>
                  <DayBars values={xpDays} c={CHART_INK} />
                </View>
              </StruckTile>
            </View>
          </View>
            </>
          ), [lessonsDone, daysActive, totalXP, xpDays])}

          {/* streak */}
          {useMemo(() => (
            <>
          <SectionLabel>DAILY STREAK</SectionLabel>
          {/* Tappable, and it was not before — the streak was the one number on this
              screen with nowhere to go. Both entry points (this and Home's habit
              card) land on the same screen rather than on two different summaries. */}
          <Pressable onPress={() => router.push('/(app)/streak')}>
            {/* THE SAME OBJECT HOME DRAWS, printed on paper instead of on ink.
                It was a book, a word, a week row and a chevron — three of the
                four facts Home showed, arranged differently, so every change to
                one screen had to be made twice and the two drifted apart.
                StreakPanel is the one object; this screen supplies the ground. */}
            <Card style={styles.streakBox}>
              <StreakPanel
                streak={shownStreak}
                lastLessonDate={lastLessonDate}
                restHeld={restHeld}
                restMax={restCap(isPro)}
                restBridging={restBridging}
                daySize={30}
              />
              <View style={styles.streakDoor}>
                <Text style={styles.streakDoorText}>SEE THE MONTH</Text>
                <View style={styles.streakChevron}>
                  <SketchIcon name="back" size={13} color={C.dim} />
                </View>
              </View>
            </Card>
          </Pressable>
            </>
          ), [shownStreak, lastLessonDate, restHeld, restBridging, isPro])}

          <SectionLabel>PROGRESS TO NEXT RANK</SectionLabel>
          <Card>
            {/* THE LADDER, WITH BOTH ENDS OF THE RUNG ON IT.
                This was a name, a fraction and an ink bar — which says how far
                along you are and nothing whatever about what you are climbing
                toward. Now the rank you hold is struck in its own band's metal on
                the left, the one you are climbing to sits LOCKED on the right,
                and the bar runs between them. That is the same three facts
                arranged as a journey instead of as a readout, and the locked pin
                is doing the work: it is the first time this screen has shown a
                reader the thing they have not got yet. */}
            {/* THE NAMES ARE IN THE MIDDLE, NOT UNDER THE PINS, and that is a
                measurement rather than a preference. Eleven of the twenty-five
                rank names do not fit a pin-width column at any size this screen
                is allowed to use — the type scale stops at 11px (`micro`) and
                check-ui enforces it — so captioned pins truncated half the ladder
                to "METAPH…", and wrapping them broke "EPISTEMOL / OGIST" across
                two lines mid-word. The middle column is the full width of the
                card and every name fits it. */}
            <View style={styles.rankLadder}>
              <View style={styles.rankPin}>
                <RankSeal glyph={cur.glyph} state="current" size={56} order={rankOrder(rankIndex)} degree={rankDegree(rankIndex)} />
              </View>

              <View style={styles.rankMid}>
                <Text style={styles.rankName} numberOfLines={1}>{cur.name}</Text>
                <Text style={styles.rankXp}>
                  {/* XP EARNED INSIDE THIS BAND, not total against the next threshold.
                      The old pair could read "10,605 / 9,300 XP" once a promotion was
                      pending — a fraction bigger than its own denominator. */}
                  {next
                    ? `${inBand.toLocaleString()} / ${bandSize.toLocaleString()} XP`
                    : `${totalXP.toLocaleString()} XP`}
                </Text>
                <StruckBar
                  pct={rankPct}
                  fill={ramp(rankInsignia(rankIndex).base)}
                  height={12}
                  style={{ marginTop: SPACE[1] }}
                />
                <Text style={styles.rankUntil}>
                  {pending
                    ? `FINISH A LESSON TO REACH ${(next?.name ?? '').toUpperCase()}`
                    : next
                      // NOT "…TO EPISTEMOLOGIST". The climb chart directly below
                      // is captioned "Metaphysician → Epistemologist" and then
                      // "395 XP TO EPISTEMOLOGIST", so naming it here printed the
                      // identical sentence twice inside one card.
                      ? `${toNext.toLocaleString()} XP TO GO`
                      : 'HIGHEST RANK ACHIEVED'}
                </Text>
              </View>

              {next ? (
                <View style={styles.rankPin}>
                  {/* Deliberately `locked` even when the promotion is PENDING. A
                      pending rank has been earned in XP but not conferred — the
                      ceremony happens on the reward screen (§7) — so lighting it
                      here would spend the one moment that promotion has. The
                      "XP TO <NAME>" line beside it is what names this pin, which
                      is why it needs no caption of its own.

                      The ORDER is passed anyway, because it decides the SHAPE as
                      well as the material now — and the shape is the half a
                      reader should be able to see coming. A locked pin that is
                      already a winged crest is an argument for carrying on;
                      thirty-six identical grey hexagons are not. */}
                  <RankSeal
                    glyph={next.glyph}
                    state="locked"
                    size={44}
                    order={rankOrder(rankIndex + 1)}
                    // AND THE DEGREE, which this was missing. The degree is the
                    // SHAPE now, so without it every locked next-rank pin on this
                    // screen was drawn as a plain disc — the reader could see the
                    // rank they were climbing to and not what it looks like,
                    // which is most of what a locked pin is for.
                    degree={rankDegree(rankIndex + 1)}
                  />
                </View>
              ) : (
                <View style={styles.rankPin}>
                  <MetalPlate metal={METAL.GOLD} label="TOP" />
                </View>
              )}
            </View>

            {/* How far up the ladder of forty-eight, which the band alone cannot say. */}
            <Text style={styles.rankRung}>
              RANK {cur.id} OF {RANKS.length}
            </Text>

            {/* THE SAME CLIMB, DRAWN. The bar above says how far along the band
                the reader is; the chart says how they got there and what each
                thing they did was worth.

                `active` IS NOT THE FOCUS FLAG. It was, on the correct reasoning
                that every tab is built at startup and an intro played to a screen
                nobody is on has been spent for nothing — but that guard stopped
                one level too high. This chart sits two-thirds of the way down the
                longest page in the app, so focus fires on arrival and the whole
                animation plays to a chart that is hundreds of points below the
                fold. It then marks itself seen (`onSeen` → `chartSeenXP`) and
                refuses to play again, so the reader scrolls down to a finished
                line and never finds out there was one. The same chart in the
                Ranks sheet sits near the top and animates perfectly, which is
                exactly how the bug was reported: "I see it there, not here."

                So it waits for the chart to actually be ON SCREEN.

                AND THE FIRST VERSION OF THAT DID NOT WORK, which is why the same
                report came back a second time in the same words. Two reasons,
                both written up where they belong: the guard believed a
                measurement taken on a view that was not attached to the window
                (`trustworthy`, lib/utils/inViewMath), so it latched at mount and
                spent the animation anyway; and it latched for the lifetime of a
                screen that is never unmounted, so one look used it up for the
                whole session (`rearm`, lib/utils/useInView). What `active` means
                now is "on screen, on this visit" — it goes false again on the way
                out, and the chart draws itself for whoever comes back. */}
            <View ref={climb.ref} onLayout={climb.check} style={styles.rankChartWrap}>
              <RankClimbChart
                rankIndex={rankIndex}
                totalXP={totalXP}
                events={xpEvents}
                width={SW - 64}
                height={188}
                view={climb}
                selfSeen
              />
            </View>
          </Card>

          {/* mastery */}
          {useMemo(() => (
            <>
          <SectionLabel>BRANCH MASTERY</SectionLabel>
          {/* SIX ROWS THAT ARE NO LONGER THE SAME ROW SIX TIMES.
              Each carries its branch's own hue — on the icon chip, on the fill,
              and at a tenth strength on the empty part of the track — so a row is
              identifiable before its name is read. The percentage moved aside for
              the count it was hiding, and a branch that is finished says so on a
              gold plate rather than by having a bar that is full to within a few
              pixels of one that is not. */}
          {branchesComplete > 0 ? (
            <Text style={styles.masteryLead}>
              {branchesComplete === 1 ? 'One branch finished' : `${branchesComplete} branches finished`}
              {branchesComplete < mastery.length ? ` · ${mastery.length - branchesComplete} to go` : ' · all six'}
            </Text>
          ) : null}
          <View style={styles.masteryBox}>
            {mastery.map((m) => (
              <MasteryRow
                key={m.slug}
                name={m.name}
                hue={m.hue}
                done={m.done}
                total={m.total}
                icon={<SketchIcon name={m.icon} size={17} color={ramp(m.hue).shade} />}
              />
            ))}
          </View>
            </>
          ), [mastery, branchesComplete])}

          {/* quotes */}
          {useMemo(() => (
            <>
          <SectionLabel>SAVED QUOTES</SectionLabel>
          <Card onPress={openSavedQuotes} style={styles.quotesCard}>
            <View style={styles.quotesIcon}>
              <SketchIcon name={quotesSaved > 0 ? 'bookmark-filled' : 'bookmark'} size={20} color={C.ink} />
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
              <SketchIcon name="back" size={14} color={C.inkSoft} />
            </View>
          </Card>
            </>
          ), [quotesSaved, savedQuotes, openSavedQuotes])}

          {/* badges */}
          {useMemo(() => (
            <>
          <SectionLabel>BADGES EARNED</SectionLabel>
          {/* THE ONE QUESTION A CASE OF FIFTY RAISES. The grid showed eight
              medals and no total, so "how much of this is mine" — the only thing
              a trophy shelf is for — was the fact not on the page. */}
          <ShelfCount earned={earnedBadges.length} total={BADGES.length} />
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
            </>
          ), [badges, earnedBadges, openRanksBadges])}

          {isSignedIn ? (
            <Button
              label="Sign Out"
              onPress={handleSignOut}
              variant="secondary"
              size="md"
              style={styles.signOut}
            />
          ) : (
            <Button
              label="Sign in or create an account"
              onPress={() => router.push('/sign-in')}
              variant="primary"
              size="md"
              icon="person"
              style={styles.signInCta}
            />
          )}
        </View>
      </ScrollView>
    </View>
    </ScreenTransition>
  );
}

const role = (k: TypeKey) => ({
  fontFamily: TYPE[k].family,
  fontSize: TYPE[k].fontSize,
  lineHeight: TYPE[k].lineHeight,
  letterSpacing: TYPE[k].letterSpacing ?? 0,
});
const PLAYFAIR_CAPTION = 'PlayfairDisplay_400Regular';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ink },
  scroll: { flex: 1, backgroundColor: C.paper },

  header: {
    // No background colour: ProfileArtFill paints it. `overflow: hidden` keeps
    // the art inside the header, and it must stay above the art in z-order,
    // which it is by being rendered after it.
    alignItems: 'center',
    paddingBottom: SPACE[4],
    paddingHorizontal: SPACE[3],
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
    marginTop: SPACE[3],
    textAlign: 'center',
  },
  subtitle: { ...role('micro'), letterSpacing: 2, marginTop: SPACE[1] },
  rankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE[1],
    borderWidth: 1.5,
    borderRadius: 3,
    paddingHorizontal: SPACE[3],
    paddingVertical: SPACE[1],
    marginTop: SPACE[3],
  },
  rankChipText: { ...role('micro'), fontFamily: 'Inter_700Bold', letterSpacing: 1 },

  profileQuote: { alignItems: 'center', marginTop: SPACE[3], paddingHorizontal: SPACE[2], maxWidth: 340 },
  profileQuoteText: {
    ...role('body'),
    fontFamily: PLAYFAIR_CAPTION,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  profileQuoteBy: { ...role('micro'), letterSpacing: 1.5, marginTop: SPACE[1] },
  profileQuotePrompt: { flexDirection: 'row', alignItems: 'center', gap: SPACE[1], marginTop: SPACE[3] },
  profileQuotePromptText: { ...role('micro'), letterSpacing: 0.5 },

  body: { paddingHorizontal: SPACE[3], paddingTop: SPACE[4] },

  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACE[4], marginBottom: SPACE[2] },
  sectionLabel: { ...role('micro'), color: C.inkSoft, letterSpacing: 3, marginRight: SPACE[2] },
  sectionLine: { flex: 1, height: 1, backgroundColor: C.hairline },

  glanceRow: { flexDirection: 'row', gap: SPACE[2] },
  glanceCol: { flex: 1 },
  // The tile relays the column's growth inwards, the same job Card's `flexGrow`
  // does — without it the shorter tile floats at content height inside a
  // stretched column and the row reads as two boxes of different sizes.
  glanceTile: { flexGrow: 1 },
  // LEFT-ALIGNED, not centred. A centred number over a centred caption is a
  // poster; these are two readings side by side, and readings line up on an edge
  // so the eye can compare them without hunting for each one's middle.
  glanceTop: { flexDirection: 'row', alignItems: 'center', gap: SPACE[1] },
  glanceValue: { ...role('display'), color: C.ink, marginTop: SPACE[1] },
  glanceLabel: { ...role('micro'), color: C.inkSoft, letterSpacing: 1.4 },
  glanceFoot: {
    ...role('micro'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic',
    color: C.inkSoft, marginTop: SPACE[2], lineHeight: 15,
  },

  bioCard: { alignItems: 'center' },
  bioQuill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE[2],
  },
  bioShape: { marginTop: SPACE[3], borderTopWidth: 1, borderTopColor: C.hairline, paddingTop: SPACE[3] },
  bioText: {
    ...role('body'),
    fontFamily: PLAYFAIR_CAPTION,
    fontStyle: 'italic',
    color: C.ink,
    textAlign: 'center',
  },

  insightLabel: { ...role('micro'), color: C.inkSoft, letterSpacing: 1.5 },
  insightHint: {
    ...role('label'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic',
    color: C.inkSoft, marginTop: SPACE[1], lineHeight: 19,
  },
  insightValue: { ...role('title'), color: C.ink, marginTop: SPACE[0] },

  streakBox: {},
  streakDoor: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: SPACE[0], marginTop: SPACE[3],
  },
  streakDoorText: { ...role('micro'), color: C.dim, letterSpacing: 2 },
  // Turned around, because the icon set has `back` and no forward twin — the same
  // trick StreakCalendar uses for its month arrows.
  streakChevron: { transform: [{ scaleX: -1 }] },

  rankChartWrap: { marginTop: SPACE[3] },
  // The rung, drawn: the pin you hold, the climb, the pin you are climbing to.
  rankLadder: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2] },
  rankPin: { alignItems: 'center' },
  rankMid: { flex: 1 },
  rankName: { ...role('title'), color: C.ink, marginBottom: SPACE[0] },
  rankRung: {
    ...role('micro'), color: C.inkSoft, letterSpacing: 2,
    textAlign: 'center', marginTop: SPACE[3],
  },
  rankXp: { ...role('label'), fontFamily: 'Inter_400Regular', color: C.inkSoft },
  // THE TRACKS THAT USED TO LIVE HERE ARE NOW `StruckBar`, and the measurement
  // that justified them survives the move.
  //
  // The lesson was: `HUE_SOFT` is the token whose comment says "progress tracks",
  // so the conversion reached for it, and the value it carried (#F0F7F6) put this
  // track at ΔL* 3.30 from the white Card face under it and the six Branch
  // Mastery bars at ΔL* 1.50 from `paper`. A progress bar communicates exactly
  // one thing — how much is LEFT — and at 1.04:1 there was no remainder to see:
  // six full-looking bars, whatever the reader had actually finished.
  //
  // The track is now the branch's own hue at a tenth strength (`ramp().track`),
  // which is a different colour per row and so could not be checked by eye at
  // all. It is checked by arithmetic instead: check-ui asserts every ramp's
  // track clears 1.2:1 on both paper and a card face, AND that the fill clears
  // 3:1 against its own track. Naming beat measuring once here; it does not get
  // to twice.
  rankUntil: { ...role('micro'), color: C.inkSoft, letterSpacing: 1, textAlign: 'right', marginTop: SPACE[1] },

  masteryBox: { gap: SPACE[2] },
  masteryLead: {
    ...role('label'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic',
    color: C.inkSoft, marginBottom: SPACE[2],
  },

  quotesCard: { flexDirection: 'row', alignItems: 'center', gap: SPACE[3] },
  quotesIcon: {
    width: 38,
    height: 38,
    borderWidth: 1.5,
    borderColor: C.ink,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quotesCount: { ...role('micro'), fontFamily: 'Inter_700Bold', color: C.ink, letterSpacing: 1.5 },
  quotesTeaser: { ...role('label'), fontFamily: PLAYFAIR_CAPTION, fontStyle: 'italic', color: C.inkSoft, marginTop: SPACE[0] },
  quotesChev: { transform: [{ scaleX: -1 }], opacity: 0.7 },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE[1] },
  // No border: the medal already has an outline, and a box around it just puts a
  // seventh shape on top of the six that carry the meaning.
  badge: { width: BADGE_W, alignItems: 'center', paddingVertical: SPACE[0], gap: SPACE[0] },
  badgeLabel: {
    ...role('micro'), fontFamily: 'Inter_700Bold', lineHeight: 14, color: C.ink,
    letterSpacing: 0.2, textAlign: 'center',
  },
  // The same cool slate BadgeMedal draws a locked medal in, so the name and the
  // mark under it are unmistakably one greyed-out object. `GHOST` is imported
  // straight from `components/shared/tone` — the single source that colour
  // already had — rather than a second, duplicated hex living here.
  badgeLabelLocked: { color: GHOST, fontFamily: 'Inter_500Medium' },

  signOut: { alignSelf: 'center', marginTop: SPACE[5] },
  signInCta: { alignSelf: 'center', marginTop: SPACE[5] },
});
