import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import StreakBook from '@/components/gamification/StreakBook';
import ScreenTransition from '@/components/shared/ScreenTransition';
import PressableScale from '@/components/shared/PressableScale';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import AddWidgetSheet from '@/components/shared/AddWidgetSheet';
import StickmanStroll from '@/components/home/StickmanStroll';
import QuickStartCard from '@/components/home/QuickStartCard';
import { useWidgetPlaced } from '@/lib/widget/useWidgetPlaced';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { effectiveStreak } from '@/lib/utils/streak';
import { useTodayKey } from '@/lib/utils/useTodayKey';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

const Rule = '#ECEAE2';

const SW = Dimensions.get('window').width;
const SH = Dimensions.get('window').height;

// Keep the "PHILOSOPHIZE" wordmark on a single line at any width — scale the
// font + letter-spacing down on narrow phones so the trailing "E" never wraps.
const WORDMARK_SIZE = Math.min(42, Math.floor((SW - 56) / 8.6));
const WORDMARK_LS = SW < 400 ? 2 : 3;

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

function ActionCard({
  icon,
  label,
  sub,
  filled,
  onPress,
}: {
  icon: SketchIconName;
  label: string;
  sub: string;
  filled?: boolean;
  onPress: () => void;
}) {
  const fg = filled ? Paper : Ink;
  return (
    <PressableScale onPress={onPress} containerStyle={styles.actionWrap} style={[styles.action, filled && styles.actionFilled]}>
      <View style={[styles.actionIconBox, { borderColor: fg }]}>
        <SketchIcon name={icon} size={18} color={fg} />
      </View>
      <Text style={[styles.actionLabel, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.actionSub, { color: filled ? '#CBC9C2' : InkSoft }]} numberOfLines={1}>
        {sub}
      </Text>
    </PressableScale>
  );
}

export default function HomeScreen() {
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const streakRaw = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  useTodayKey();
  const streak = effectiveStreak(streakRaw, lastLessonDate);
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
        {/* Masthead */}
        <Text style={styles.kicker}>EST. ANTIQUITY  ·  VOL. I</Text>
        <Text
          style={[styles.wordmark, { fontSize: WORDMARK_SIZE, letterSpacing: WORDMARK_LS }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          PHILOSOPHIZE
        </Text>
        <View style={styles.rule} />
        <Text style={styles.tagline}>the art of thinking deeply</Text>
        <Text style={styles.diamonds}>◇   ◆   ◇</Text>

        {/* Daily reflection */}
        <View style={styles.reflectionWrap}>
          <View style={styles.reflectionCard}>
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
          </View>
          <View style={styles.reflectionTab}>
            <Text style={styles.reflectionTabText}>DAILY REFLECTION</Text>
          </View>
        </View>

        {/* The next lesson this learner can open, on a different branch each day.
            Sits between the reflection and the three small actions on purpose:
            the quote is what greets them, this is what they came to do, and
            Learn / Philosophers / Insights are where they go instead. */}
        <QuickStartCard style={styles.quickStart} />

        {/* Actions */}
        <View style={styles.actionsRow}>
          <ActionCard
            icon="flame"
            label="LEARN"
            sub="Guided paths"
            onPress={() => router.push('/(app)/branches')}
          />
          <ActionCard
            icon="person"
            label="PHILOSOPHERS"
            sub="Great thinkers"
            onPress={() => router.push('/(app)/philosophers')}
          />
          <ActionCard
            icon="spark"
            label="INSIGHTS"
            sub="Your interests"
            onPress={() => router.push('/(app)/stats')}
          />
        </View>

        <View style={styles.streakRow}>
          <StreakBook value={streak} size={52} />
          <Text style={styles.streakLabel}>{streak} DAY STREAK</Text>
        </View>

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

  kicker: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: InkSoft,
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 4,
  },
  wordmark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    color: Ink,
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 6,
  },
  rule: {
    alignSelf: 'center',
    width: '66%',
    height: 1.5,
    backgroundColor: Ink,
    marginTop: 6,
    marginBottom: 10,
  },
  tagline: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 15,
    color: InkSoft,
    textAlign: 'center',
  },
  diamonds: {
    fontSize: 13,
    color: Ink,
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 10,
  },

  reflectionWrap: { marginTop: 18, position: 'relative' },
  reflectionCard: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 3,
    backgroundColor: Paper,
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 18,
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
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  actionWrap: { flex: 1 },
  action: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 6,
    backgroundColor: Paper,
    paddingVertical: 18,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  actionFilled: { backgroundColor: Ink, borderColor: Ink },
  actionIconBox: {
    width: 38,
    height: 38,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10.5,
    letterSpacing: 0.5,
    marginTop: 12,
    textAlign: 'center',
  },
  actionSub: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },

  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 18,
  },
  streakLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: InkSoft,
    letterSpacing: 1.5,
    marginLeft: 10,
  },
});
