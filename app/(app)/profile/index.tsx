import { useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Alert, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import SketchIcon from '@/components/shared/SketchIcon';
import Glyph from '@/components/shared/Glyph';
import BadgeMedal from '@/components/shared/BadgeMedal';
import RankClimbChart from '@/components/shared/RankClimbChart';
import RankHeader from '@/components/profile/RankHeader';
import BecomingJournal from '@/components/profile/BecomingJournal';
import { DayBars } from '@/components/profile/InkCharts';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import ScreenTransition from '@/components/shared/ScreenTransition';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { C, TYPE, SPACE, BRANCH, RADIUS, LIP, type TypeKey, type BranchKey } from '@/constants/design';
import { GHOST, ramp, EMBER_INK, EMBER_LIT } from '@/components/shared/tone';
import { ShelfCount, CountStrip, ReadingRow } from '@/components/profile/Struck';
import RankSeal from '@/components/shared/RankSeal';
import { BRANCH_SHORT, BRANCH_ICON } from '@/components/shared/branchMarks';
import { ProfileArtFill, ProfileAvatar, useProfileArt } from '@/components/shared/ProfileArt';
import { profileNameStyle, profileNameText } from '@/data/profileFonts';
import StreakPanel from '@/components/gamification/StreakPanel';
import { signOut } from '@/lib/supabase/auth';
import { useAuthSession } from '@/lib/supabase/useSession';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { rankProgress, rankOrder, rankDegree } from '@/data/ranks';
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

  // ── WHERE THE READING GOES, WHICH IS NOT THE SAME AS HOW MUCH IS LEFT ────
  //
  // This was `mastery`: done, total and a percentage per branch, drawn as six
  // bars under a BRANCH MASTERY heading. The owner removed that section and kept
  // its furniture — "I don't want the branch of mastery. But a note, I like the
  // icons on the branch mastery for all the six branches of philosophy."
  //
  // The denominator is what actually had to go. §19 spends a section on it: a
  // target measured against the library MOVES AWAY from a reader who has done
  // nothing wrong every time content ships, and this app has gone 60 → 192 → 246
  // lessons. A share of the reader's own leading branch cannot do that, and it
  // answers the more interesting question anyway.
  const reading = useMemo(() => ALL_BRANCHES.map((b) => {
    return {
      slug: b.slug,
      name: SHORT[b.slug] ?? b.name.toUpperCase(),
      icon: BICON[b.slug] ?? 'frame',
      hue: BRANCH[b.slug as BranchKey] ?? C.ink,
      lessons: lessonsByBranch[b.slug] ?? 0,
    };
  }).sort((a, b) => b.lessons - a.lessons), [lessonsByBranch]);
  /** The reader's own strongest branch — both ends of every bar are theirs. */
  const readingLead = reading[0]?.lessons ?? 0;

  const topBranch = readingLead > 0 ? reading[0].slug : null;
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
  // THIRTY DAYS, NOT A FORTNIGHT, because this is the only activity reading left
  // in the app. The old fortnight was the right window when the statistics tab
  // drew the same thing at thirty beside it; with the tab gone, a month is what a
  // reader needs to see a habit rather than a week's weather.
  const xpDays = useMemo(() => dailyXP(xpEvents, 30, Date.now()), [xpEvents]);
  const daysActive = activeDays(xpDays);
  const monthXP = useMemo(() => xpDays.reduce((a, b) => a + b, 0), [xpDays]);

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

  const { current: cur } = rankProgress(rankIndex, totalXP);

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
        // throttled, so the chart may only become measurable part-way through the
        // flick that brings it in — and the cheapest insurance against a look that
        // goes unnoticed is to ask again at the moments the reader has definitely
        // stopped moving.
        onScrollEndDrag={climb.check}
        onMomentumScrollEnd={climb.check}
        // ── THE OVERSCROLL LAG WAS NEVER ON THIS PAGE: IT WAS THE GPU BUDGET ──
        //
        //   > "when you're already at the top ... when you try scroll up even
        //   > more, it's really lag[gy] ... and if you go all the way to the
        //   > bottom of that tab and try scroll even more, it is also leggy."
        //
        // Measured on an S24 Ultra at 120Hz: mid-page scrolling 1.1% janky, the
        // stretch at either end 65–68%, Home's identical gestures 0%. With
        // `animator_duration_scale` at 0 the stretch cannot play, and the jank
        // and the `Slow bitmap uploads` both go to zero — so the stretch is the
        // trigger. It is not the cost.
        //
        // HWUI gives the whole app ONE texture budget: 121.31MB on this phone
        // (`dumpsys gfxinfo`, "Max resource usage"). react-native-svg paints
        // every <Svg> into an ARGB bitmap the size of its box, and every built
        // tab stays attached for the session, so all six tabs' bitmaps sit in
        // that one cache whichever tab is showing. At rest Profile was at
        // 115.88MB, Streak 113.05MB, Home and Pass about 105MB. The stretch needs
        // one more screen-sized layer, 10.3MB: Pass lands at 115 and is fine,
        // Profile lands at 126 and is over. Over budget, Skia evicts textures it
        // still needs and uploads them again the next frame, for as long as the
        // stretch lasts — the trace shows every bitmap in the app re-uploaded on
        // each of 28 stretch frames, and GPU memory sawing from 161MB to 331MB.
        //
        // TWO WRONG ANSWERS SHIPPED FIRST, and neither is worth repeating.
        // `removeClippedSubviews` was blamed on a correlation — Profile and
        // Streak were the only screens carrying it and the only two that janked
        // — and removing it and publishing changed nothing. And the largest
        // textures in the trace were read as this effect's own capture buffer.
        // They were not this page's at all. The live view tree names them: Home's
        // full-screen ruled-paper <Svg> (1080×2340) and the Pass tab's two
        // certificate frames (945×2599, 945×2334) — 27MB of bitmap for a few
        // hairlines, held on every tab. They are Views and tiled strips now, and
        // that is the headroom. `overScrollMode="never"` stays rejected: it buys
        // the frame rate by deleting a gesture every other tab has.
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

          {/* A RAISED CHIP ON ITS LEDGE, CARRYING THE PIN (2026-09-16). It was an
              outline in the header's line colour with a star in it; it opens the
              rank ladder, so it stands up and sinks when pressed, and the star is
              the reader's actual rank pin. White on every header art, which is
              what lets it read on the dark engravings and the light ones alike. */}
          <Pressable
            onPress={() => openRanksBadges('ranks')}
            accessibilityRole="button"
            accessibilityLabel={`Rank: ${cur.name}. Open the rank ladder`}
            style={styles.rankChipBox}
          >
            {({ pressed }) => (
              <View style={styles.rankChipWrap}>
                <View style={styles.rankChipLedge} />
                <View style={[styles.rankChip, pressed && styles.rankChipDown]}>
                  <RankSeal glyph={cur.glyph} state="current" size={22} order={rankOrder(rankIndex)} degree={rankDegree(rankIndex)} />
                  <Text style={styles.rankChipText}>RANK: {cur.name.toUpperCase()}</Text>
                </View>
              </View>
            )}
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
        {/* THE CLIPPING USED TO HAPPEN HERE, and this was the half that could
            actually reach something — nineteen children, twelve below the fold
            at the top. It is gone with the root: see the measurements on the
            ScrollView. Detaching those twelve bought no memory back and put a
            UI-thread pass under every frame of the overscroll stretch. */}
        <View style={styles.body}>

          {showWidget ? <DailyQuoteWidget style={{ marginBottom: SPACE[4] }} /> : null}

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

          {/* progress — the whole of what the statistics tab used to draw */}
          {useMemo(() => (
            <>
          <SectionLabel>YOUR PROGRESS</SectionLabel>
          {/* ONE CARD WHERE A TAB USED TO BE.
              The statistics tab drew a four-tile ledger, a dark instrument panel
              carrying a rosette chart and a thirty-day line, a thinker league, a
              ranking of eras and a discovery card — about 1,400 points of screen.
              The owner asked for "a much more condensed version", and what
              survives is the part that is about the READER rather than about the
              library: how much they have done, where it went, and whether they
              have been coming back.

              WHAT WAS DROPPED AND WHY. The rosette needed a tap to read and said
              the same thing as the rows below it. The thinker league ranked 322
              people by a formula that counted lessons other people's names were
              attached to. The era ranking answered a question nobody asked. All
              three were interesting; none of them changed what a reader does
              next, which is the test a profile has to pass. */}
          <Card>
            <CountStrip
              items={[
                { label: 'LESSONS', value: lessonsDone, icon: 'lessons' },
                { label: 'THINKERS', value: distinctViewed, icon: 'thinkers' },
                { label: 'QUOTES', value: quotesSaved, icon: 'quotes' },
                { label: 'DAYS', value: daysActive, icon: 'days' },
              ]}
            />

            <View style={styles.statRule} />

            <Text style={styles.statLabel}>WHERE YOUR READING GOES</Text>
            <View style={styles.readList}>
              {reading.map((b) => (
                <ReadingRow
                  key={b.slug}
                  name={b.name}
                  hue={b.hue}
                  lessons={b.lessons}
                  lead={readingLead}
                  icon={<SketchIcon name={b.icon} size={15} color={ramp(b.hue).shade} />}
                />
              ))}
            </View>

            <View style={styles.statRule} />

            <View style={styles.statTop}>
              <Text style={styles.statLabel}>XP · LAST 30 DAYS</Text>
              <Text style={styles.statRight}>{monthXP.toLocaleString()} XP</Text>
            </View>
            {/* A bar a day, empty days drawn empty. A line would join the gaps and
                imply reading on days there was none — and the gaps are the habit. */}
            <View style={{ marginTop: SPACE[2] }}>
              <DayBars values={xpDays} c={CHART_INK} height={34} />
            </View>
          </Card>
            </>
          ), [lessonsDone, distinctViewed, quotesSaved, daysActive, reading, readingLead, monthXP, xpDays])}

          {/* becoming */}
          {useMemo(() => (
            <>
          <SectionLabel>WHO YOU'RE BECOMING</SectionLabel>
          {/* A journal entry: the notebook, the handwritten line, the ribbon and
              the pen (components/profile/BecomingJournal). */}
          <BecomingJournal bio={bio} />
            </>
          ), [bio])}

          <SectionLabel>PROGRESS TO NEXT RANK</SectionLabel>
          <Card>
            {/* THE RANK YOU HOLD AND THE ONE YOU ARE CLIMBING TO — the pin on its
                stand, the next one locked in its socket, and the bar in the rank's
                own metal. The same object heads the Ranks & Badges sheet
                (components/profile/RankHeader), so the two screens cannot drift
                apart again. */}
            <RankHeader rankIndex={rankIndex} totalXP={totalXP} />

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
                legend={false}
              />
            </View>
          </Card>


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
              {/* A saved quote's teaser is cut to one line on purpose. The empty
                  line is an instruction and is allowed two, so it is never cut. It
                  names thinkers, not lessons: since the hard paywall (2026-09-25) a
                  free reader saves quotes from a thinker's page. */}
              <Text style={styles.quotesTeaser} numberOfLines={quotesSaved > 0 ? 1 : 2}>
                {quotesSaved > 0
                  ? `“${savedQuotes[0].text}”`
                  : 'Save quotes from any thinker to keep them here'}
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
                {/* THREE LINES, NOT TWO, AND THE NARROW PHONE IS WHY.
                    At 320dp a badge column is 69pt, and "The Examined Life" sets
                    as three lines in it — clamped at two it overflowed its box by
                    a whole line, which §14 calls the distinction that matters:
                    declaring a clamp is deliberate, running OUT of lines inside
                    one is a word the reader does not get. It cost this grid 14pt
                    a row on the narrowest phone and nothing at 390. Found the
                    first time a harness ever measured this screen. */}
                <Text
                  style={[styles.badgeLabel, !b.earned && styles.badgeLabelLocked]}
                  numberOfLines={3}
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
  rankChipBox: { marginTop: SPACE[3] },
  rankChipWrap: { paddingBottom: LIP.card },
  rankChipLedge: {
    position: 'absolute', left: 0, right: 0, top: LIP.card, bottom: 0,
    borderRadius: RADIUS.button, backgroundColor: C.edge,
  },
  rankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE[1],
    backgroundColor: C.surface,
    borderWidth: 2,
    borderColor: C.edge,
    borderRadius: RADIUS.button,
    paddingLeft: SPACE[1],
    paddingRight: SPACE[3],
    paddingVertical: SPACE[0],
  },
  rankChipDown: { transform: [{ translateY: LIP.card }] },
  rankChipText: { ...role('micro'), fontFamily: 'Inter_700Bold', letterSpacing: 1, color: C.ink },

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

  // ── the one statistics card ──
  //
  // A RULE BETWEEN BLOCKS, NOT A BOX AROUND EACH. The AT A GLANCE section that
  // used to sit here drew two struck tiles side by side, and the statistics tab
  // drew four more plus three panels. Every one of those was a container, and
  // containers are what "too crowded" is made of. Three readings inside one card,
  // parted by hairlines, is the same information and one edge instead of nine.
  statRule: {
    height: 1, backgroundColor: C.hairline,
    marginTop: SPACE[3], marginBottom: SPACE[3],
  },
  statTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  statLabel: { ...role('micro'), color: C.inkSoft, letterSpacing: 1.5 },
  statRight: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.8, color: C.ink },
  readList: { gap: SPACE[2], marginTop: SPACE[2] },

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
