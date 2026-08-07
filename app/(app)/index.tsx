import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import AddWidgetSheet from '@/components/shared/AddWidgetSheet';
import StickmanStroll from '@/components/home/StickmanStroll';
import QuickStartCard from '@/components/home/QuickStartCard';
import HomeHeader from '@/components/home/HomeHeader';
import ThinkerOfTheDay from '@/components/home/ThinkerOfTheDay';
import HabitCard from '@/components/home/HabitCard';
import Arrive from '@/components/home/Arrive';
import { LIGHT } from '@/components/shared/tone';
import { branchCountsFromUnits } from '@/data/index';
import { useWidgetPlaced } from '@/lib/widget/useWidgetPlaced';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { daysMissed, effectiveStreak } from '@/lib/utils/streak';
import { restDaysHeld } from '@/constants/streak';
import { useTodayKey } from '@/lib/utils/useTodayKey';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

const Rule = '#ECEAE2';

const SW = Dimensions.get('window').width;
const SH = Dimensions.get('window').height;

// ── the one light, borrowed for a card face ──────────────────────────────────
//
// tone.ts states the light direction as SVG percentage strings; expo-linear-
// gradient wants 0–1. PARSED rather than retyped, so the reflection card can
// never end up lit from a different direction than every rank pin and badge.
const pt = (x: string, y: string) => ({ x: parseFloat(x) / 100, y: parseFloat(y) / 100 });
const FACE_START = pt(LIGHT.x1, LIGHT.y1);
const FACE_END = pt(LIGHT.x2, LIGHT.y2);

// tone.ts's own FACE runs to PAPER_SHADE (#C6C0B2), which is right for a 66px
// struck badge and far too strong across a card this size — at 300dp wide it
// stops reading as a lit surface and starts reading as a stain. This is the same
// ramp with the shaded end pulled back, which still clears the "a 7% tonal range
// is invisible" floor §19 records: #FFFFFF → #E9E4D8 is a 12% swing.
const CARD_FACE = ['#FFFFFF', Paper, '#E9E4D8'] as const;

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

        {/* Daily reflection */}
        <Arrive index={0}>
          <View style={styles.reflectionWrap}>
            <LinearGradient
              colors={CARD_FACE}
              locations={[0, 0.46, 1]}
              start={FACE_START}
              end={FACE_END}
              style={styles.reflectionCard}
            >
              <Text style={styles.qmark}>“</Text>
              <Pressable onPress={() => openPhilosopher(quote.philosopherId)}>
                <Text style={styles.reflectionText} numberOfLines={4}>{quote.text}</Text>
              </Pressable>
              <View style={styles.reflectionFooter}>
                <Pressable
                  hitSlop={10}
                  onPress={() => toggleQuote({ ...quote, savedAt: Date.now() })}
                >
                  <SketchIcon
                    name={quoteSaved ? 'bookmark-filled' : 'bookmark'}
                    size={18}
                    color={quoteSaved ? Ink : InkSoft}
                  />
                </Pressable>
                <Pressable style={{ flex: 1 }} onPress={() => openPhilosopher(quote.philosopherId)}>
                  <Text style={styles.reflectionAuthor}>— {quote.author.toUpperCase()}</Text>
                </Pressable>
              </View>
            </LinearGradient>
            <View style={styles.reflectionTab}>
              <Text style={styles.reflectionTabText}>DAILY REFLECTION</Text>
            </View>
          </View>
        </Arrive>

        {/* The next lesson this learner can open, on a different branch each day.
            Still the one big invitation, and still the only tall photograph — the
            masthead above it is half its height and wears a different picture. */}
        <Arrive index={1}>
          <QuickStartCard style={styles.quickStart} />
        </Arrive>

        {/* What the three tab-bar duplicates used to occupy: one thing to read
            that is new today, and one drawing of how far in the reader is. */}
        <Arrive index={2}>
          <ThinkerOfTheDay style={styles.block} />
        </Arrive>

        {/* One card for the streak, the week and the two running totals. It also
            replaced a six-column "23 / 192" bar: lessons are still being written,
            so that denominator grows and shortens the reader's bar for doing
            nothing wrong. Nothing on this card has a total to be a fraction of. */}
        <Arrive index={3}>
          <HabitCard
            style={styles.block}
            streak={streak}
            lastLessonDate={lastLessonDate}
            lessons={lessonsDone}
            xp={totalXP}
            restBridging={restBridging}
          />
        </Arrive>

        {/* Daily quote card (opt-in, Settings → Display) */}
        {showWidget ? <DailyQuoteWidget style={{ marginTop: 18 }} /> : null}

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
    borderRadius: 12,
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

  reflectionWrap: { marginTop: 18, position: 'relative' },
  // No backgroundColor — the LinearGradient IS the fill, lit from the one light
  // in tone.ts, which is what turns a rectangle drawn on the paper into a card
  // sitting on it. The shadow is the other half; a gradient with no shadow reads
  // as a smudge rather than as depth.
  reflectionCard: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 3,
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  qmark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 46,
    color: Ink,
    lineHeight: 40,
    height: 30,
  },
  reflectionText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 19,
    color: Ink,
    lineHeight: 29,
    marginTop: 6,
  },
  reflectionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 12,
  },
  reflectionAuthor: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: InkSoft,
    letterSpacing: 2,
    textAlign: 'right',
  },
  reflectionTab: {
    position: 'absolute',
    top: -11,
    right: 16,
    backgroundColor: Ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reflectionTabText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    color: Paper,
  },

  quickStart: { marginTop: 18 },
  block: { marginTop: 14 },

});
