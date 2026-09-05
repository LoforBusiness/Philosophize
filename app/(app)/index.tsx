import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { RatePromptHost } from '@/components/shared/RatePrompt';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import AddWidgetSheet from '@/components/shared/AddWidgetSheet';
import StickmanStroll from '@/components/home/StickmanStroll';
import QuickStartCard from '@/components/home/QuickStartCard';
import HomeHeader from '@/components/home/HomeHeader';
import DailyReflection from '@/components/home/DailyReflection';
import ThinkerOfTheDay from '@/components/home/ThinkerOfTheDay';
import HabitCard from '@/components/home/HabitCard';
import Arrive from '@/components/home/Arrive';
import { branchCountsFromUnits } from '@/data/index';
import { useWidgetPlaced } from '@/lib/widget/useWidgetPlaced';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { daysMissed, effectiveStreak } from '@/lib/utils/streak';
import { restDaysHeld, restCap } from '@/constants/streak';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useTodayKey } from '@/lib/utils/useTodayKey';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';

// The ruled-paper texture. `hairline` from constants/design.ts — Home used to
// carry its own #ECEAE2, four points off the token, which is exactly the "two
// greys that are one grey and a bug" the design file was written to stop.
const Rule = '#E7E3DA';

const SW = Dimensions.get('window').width;
const SH = Dimensions.get('window').height;

// Daily quote pool from the philosophers.
const QUOTE_POOL = ALL_PHILOSOPHERS.flatMap((p) =>
  p.quotes.map((q) => ({
    id: q.id,
    text: q.text,
    author: p.name,
    philosopherId: p.id,
    branchSlugs: p.branchSlugs,
  }))
);

// Faint ruled-paper texture behind the whole page (fixed, non-scrolling).
function RuledPaper() {
  const lines: number[] = [];
  for (let y = 70; y < SH; y += 34) lines.push(y);
  return (
    <Svg
      width={SW}
      height={SH}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {lines.map((y) => (
        <Line key={y} x1={0} y1={y} x2={SW} y2={y} stroke={Rule} strokeWidth={1} />
      ))}
    </Svg>
  );
}

// ── WHAT USED TO BE HERE ─────────────────────────────────────────────────────
//
// An `ActionCard` row of three: LEARN → /branches, PHILOSOPHERS → /philosophers,
// INSIGHTS → /stats. Those are tabs 2, 3 and 4, permanently on screen sixty dp
// below — so about 100dp of Home was spent duplicating navigation the reader
// already had, in the flattest boxes on the page. The space now carries a
// thinker and the shape of the reader's progress instead. If you are tempted to
// put shortcuts back, check the tab bar first.

export default function HomeScreen() {
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const streakRaw = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const restDaysEarned = useUserDataStore((s) => s.restDaysEarned);
  const restDaysUsed = useUserDataStore((s) => s.restDaysUsed);
  useTodayKey();
  // Rest days are passed in so a streak they are about to save still READS as
  // alive. Without them the reader who missed yesterday sees a 0 on Home, gives
  // up on the streak they actually still have, and the rest day never gets spent.
  const held = restDaysHeld(restDaysEarned, restDaysUsed);
  // The CAP as well as the count, because the habit panel draws both — an empty
  // socket beside a full one is what says a rest day is a thing you can run out
  // of, and the cap is the reader's tier rather than a constant.
  const isPro = useSubscriptionStore((s) => s.isPro);
  const streak = effectiveStreak(streakRaw, lastLessonDate, held);
  const restBridging = streak > 0 && daysMissed(lastLessonDate) > 0;
  const totalXP = useUserDataStore((s) => s.totalXP);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  // Via branchCountsFromUnits rather than summing the raw map: it clamps each
  // unit to its real length, so a stale count from a unit that later shrank
  // cannot inflate the tally.
  const lessonsDone = useMemo(
    () => Object.values(branchCountsFromUnits(lessonsByUnit)).reduce((a, b) => a + b, 0),
    [lessonsByUnit],
  );
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const settings = useUserDataStore((s) => s.settings);
  const showWidget = settings.widgetEnabled && settings.widgetPlacement === 'home';
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  // Hide the CTA once the Quote widget is on the phone's home screen; it returns
  // if they remove it (re-checked whenever the app comes back to the foreground).
  const widgetPlaced = useWidgetPlaced();

  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const quote = QUOTE_POOL[dayNumber % QUOTE_POOL.length];
  const quoteSaved = savedQuotes.some((q) => q.id === quote.id);

  return (
    <ScreenTransition bg="#FAFAF7">
    <SafeAreaView style={styles.safe}>
      <RuledPaper />
      {/* flexGrow (not flex) is the whole trick: on a tall phone the content
          container still stretches to fill, so the stickman's flexible band
          claims the leftover exactly as before and nothing moves. On a short one
          — or when the Add-Widget prompt is showing — it simply scrolls instead
          of pushing the streak row under the tab bar. The quick-start card added
          ~215dp, which was more than a 360x780 screen had spare. */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        {/* Masthead — the reader's own art, the wordmark, and today. Outside the
            stagger: it IS the page arriving, so it must already be there. */}
        <HomeHeader streak={streak} />

        {/* The next lesson this learner can open, on a different branch each day.
            FIRST, above the reflection, because lessons are the product: whatever
            sits directly under the masthead is what the app is claiming to be
            about, and for a while that was a quotation. A reader who opens Home
            and taps nothing should still have been shown the way in.

            It follows the masthead immediately, so this is the one place on the
            screen where two photographs meet. `quickStartLead` opens the gap that
            keeps them from reading as one tall picture — the masthead's own image
            is the reader's choice and the card's is not, and they are never the
            same crop. */}
        <Arrive index={0}>
          <QuickStartCard style={styles.quickStartLead} />
        </Arrive>

        {/* Daily reflection — printed on the page rather than parcelled into a
            box; see components/home/DailyReflection.tsx for why. */}
        <Arrive index={1}>
          <DailyReflection
            style={styles.section}
            quote={quote}
            saved={quoteSaved}
            onOpenAuthor={() => openPhilosopher(quote.philosopherId)}
            onToggleSave={() => toggleQuote({ ...quote, savedAt: Date.now() })}
          />
        </Arrive>

        {/* What the three tab-bar duplicates used to occupy: one thing to read
            that is new today, and one drawing of how far in the reader is. */}
        <Arrive index={2}>
          <ThinkerOfTheDay style={styles.section} />
        </Arrive>

        {/* The streak, the week and the two running totals — the one solid
            object below the fold, so the page closes in ink the way it opened
            rather than trailing off into a third pale rectangle. */}
        <Arrive index={3}>
          <HabitCard
            style={styles.panel}
            streak={streak}
            lastLessonDate={lastLessonDate}
            lessons={lessonsDone}
            xp={totalXP}
            restHeld={held}
            restMax={restCap(isPro)}
            restBridging={restBridging}
          />
        </Arrive>

        {/* Daily quote card (opt-in, Settings → Display) */}
        {showWidget ? <DailyQuoteWidget style={styles.panel} /> : null}

        {/* The leftover space, which also doubles as the stickman's stage: he
            strolls across it once per visit and hides himself when it's too
            short. Claims exactly the space the plain spacer used to. */}
        <StickmanStroll />

        {/* Android home-screen widget is the only OS widget we ship, so the
            prompt only appears there — and only until the widget is placed. */}
        {Platform.OS === 'android' && widgetPlaced === false ? (
          <Pressable
            onPress={() => setAddWidgetOpen(true)}
            style={({ pressed }) => [styles.addWidgetBtn, pressed && { opacity: 0.85 }]}
          >
            <SketchIcon name="home" size={16} color={Ink} />
            <Text style={styles.addWidgetText}>ADD HOME-SCREEN WIDGET</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <AddWidgetSheet visible={addWidgetOpen} onClose={() => setAddWidgetOpen(false)} />
      {/* The one rating ask, raised on the reader's first arrival here after
          onboarding and never again. It owns its own timing -- see the host in
          RatePrompt.tsx. Mounted HERE rather than at the root because Home is
          the only screen it may appear over, and the Add-Widget sheet above is
          user-triggered, so the two can never be up together. */}
      <RatePromptHost />
    </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  scroll: { flex: 1 },
  // flexGrow, NOT flex — `flex: 1` on a scroll content container pins it to the
  // viewport height and the view can never scroll.
  page: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 6, paddingBottom: 10 },

  addWidgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1.5,
    borderColor: Ink,
    // 6, matching Quick Start and the record panel. It was 12, which is the one
    // radius on the page that belonged to nothing else on it.
    borderRadius: 6,
    paddingVertical: 13,
    marginBottom: 6,
    backgroundColor: Paper,
  },
  addWidgetText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11.5,
    color: Ink,
    letterSpacing: 1.5,
  },

  // 22, not the 18 every other block uses. This one sits directly under the
  // masthead photograph and is itself a photograph; at 18 the two crops read as
  // a single tall picture with a wordmark buried in it. The extra 4dp is the
  // whole difference between two images and one.
  quickStartLead: { marginTop: 22 },

  // ── THE GAPS ARE NOT ALL THE SAME, AND THAT IS THE POINT ────────────────────
  //
  // Everything below Quick Start used to be 18 / 14 / 14 apart, which is four
  // near-identical intervals between four near-identical boxes: the reader is
  // given no signal about where one idea ends and the next begins, so the whole
  // lower half reads as one undifferentiated list.
  //
  // An unboxed section needs MORE air than a boxed one, because it has no border
  // doing the separating — 30dp is roughly the leading of the quote it sits
  // under, which is the interval the page is already built on. The ink panel
  // needs less, because its own edge is the separation.
  section: { marginTop: 30 },
  panel: { marginTop: 26 },
});
