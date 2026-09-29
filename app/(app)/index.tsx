import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { RatePromptHost } from '@/components/shared/RatePrompt';
import AddWidgetSheet from '@/components/shared/AddWidgetSheet';
import QuickStartCard from '@/components/home/QuickStartCard';
import HomeHeader from '@/components/home/HomeHeader';
import SubjectCarousel from '@/components/home/SubjectCarousel';
import Arrive from '@/components/home/Arrive';
import { useWidgetPlaced } from '@/lib/widget/useWidgetPlaced';
import { useUserDataStore } from '@/stores/userDataStore';
import { effectiveStreak } from '@/lib/utils/streak';
import { restDaysHeld } from '@/constants/streak';
import { useTodayKey } from '@/lib/utils/useTodayKey';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';

// The ruled-paper texture. `hairline` from constants/design.ts — Home used to
// carry its own #ECEAE2, four points off the token, which is exactly the "two
// greys that are one grey and a bug" the design file was written to stop.
const Rule = '#E7E3DA';

const SH = Dimensions.get('window').height;
/** The page's side margin, which the subject shelf runs past to the screen's edge. */
const PAD = 24;

// Faint ruled-paper texture behind the whole page (fixed, non-scrolling).
//
// VIEWS, NOT AN <Svg>. react-native-svg paints every <Svg> into a bitmap the size
// of its whole box, so this sheet of hairlines was a 1080×2340 texture — 9.6MB of
// GPU memory for sixty-odd one-pixel lines. A built tab stays attached for the
// session, so that texture was held on EVERY screen, and it was one of the two
// things keeping Profile and Streak within a few MB of Android's 121MB GPU cache
// budget. Past that budget each frame evicts and re-uploads every bitmap in the
// app: Profile's overscroll stretch needs one more screen-sized layer and tipped
// over, and Streak's walking mascot did it at rest. A View is a colour on a render
// node and holds no texture at all.
function RuledPaper() {
  const lines: number[] = [];
  for (let y = 70; y < SH; y += 34) lines.push(y);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines.map((y) => (
        <View key={y} style={[ruled.line, { top: y - 0.5 }]} />
      ))}
    </View>
  );
}

const ruled = StyleSheet.create({
  line: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Rule },
});

// ── HOME IS THREE THINGS NOW (2026-09-29) ────────────────────────────────────
//
// Ashmere went from philosophy to seven subjects, and the owner asked for a
// simpler Home to match: the masthead with the streak, the next lesson (Quick
// Start — the professor's intro until it has been watched), and the SUBJECTS
// as a sideways shelf, Brilliant's shape. The daily quotation and Thinker of the
// Day went with the Thinkers tab; the habit panel and the strolling stickman went
// for simplicity — the streak is one tap away on the masthead's count.
//
// If you are tempted to put shortcuts to other tabs back, check the tab bar first:
// they are sixty dp below.

export default function HomeScreen() {
  const streakRaw = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const restDaysEarned = useUserDataStore((s) => s.restDaysEarned);
  const restDaysUsed = useUserDataStore((s) => s.restDaysUsed);
  useTodayKey();
  // Rest days are passed in so a streak they are about to save still READS as
  // alive. Without them the reader who missed yesterday sees a 0 on Home, gives
  // up on the streak they actually still have, and the rest day never gets spent.
  const streak = effectiveStreak(streakRaw, lastLessonDate, restDaysHeld(restDaysEarned, restDaysUsed));
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  // Hide the CTA once the Quote widget is on the phone's home screen; it returns
  // if they remove it (re-checked whenever the app comes back to the foreground).
  const widgetPlaced = useWidgetPlaced();

  return (
    <ScreenTransition bg={Paper}>
    <SafeAreaView style={styles.safe}>
      <RuledPaper />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        {/* Masthead — the reader's own art, the wordmark, and today. Outside the
            stagger: it IS the page arriving, so it must already be there. */}
        <HomeHeader streak={streak} />

        {/* The next lesson this learner can open. FIRST, because lessons are the
            product: whatever sits directly under the masthead is what the app is
            claiming to be about. `quickStartLead` opens the gap that keeps two
            photographs from reading as one tall picture. */}
        <Arrive index={0}>
          <QuickStartCard style={styles.quickStartLead} />
        </Arrive>

        {/* Every subject, one swipe apart. */}
        <Arrive index={1}>
          <SubjectCarousel pad={PAD} style={styles.section} />
        </Arrive>

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
  page: { flexGrow: 1, paddingHorizontal: PAD, paddingTop: 6, paddingBottom: 24 },

  addWidgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 6,
    paddingVertical: 13,
    marginTop: 26,
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
  // a single tall picture with a wordmark buried in it.
  quickStartLead: { marginTop: 22 },
  section: { marginTop: 30 },
});
