import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import PressableScale from '@/components/shared/PressableScale';
import StreakBook from '@/components/gamification/StreakBook';
import StreakWeek from '@/components/gamification/StreakWeek';

// ─────────────────────────────────────────────────────────────────────────────
// THIS WEEK — and NOT how close you are to the end.
//
// What stood here was six columns filling toward each branch's total: "23 / 192".
// That number has an expiry date built into it. Lessons are still being written,
// so every batch added pushes the denominator up and makes the reader's bar
// SHORTER for doing nothing wrong. A progress bar against a moving target
// punishes the reader for the author's productivity, which is the opposite of
// what a home screen should do.
//
// So: no denominator anywhere on this card. A week of days either happened or
// did not — that is true no matter how much content exists — and the two totals
// underneath only ever go up.
//
// It also ABSORBS the bare streak row that used to sit below it. The streak book
// and the day count were already on Home twice over once this card existed, and
// folding them in gives back about 100dp — which is what the home stickman needs
// to have a band to walk in at all (see StickmanStroll: below a 37dp band his
// routine stretches from 19s to 39s).
//
// ── WHY IT IS PRINTED IN INK, AND IT IS THE ONLY THING DOWN HERE THAT IS ────
//
// Home used to run: dark masthead, dark Quick Start, then three pale bordered
// rectangles of near-identical size, and then it simply stopped. The page opened
// with weight and ended with a shrug — and the last of those three rectangles
// was the LARGEST and the least interesting thing on the screen, which is the
// wrong way round for the one number the app is trying to get somebody to come
// back for.
//
// The reflection and the thinker gave up their boxes to become printed page (see
// DailyReflection). This one goes the other way and becomes the only solid
// object below the fold, so the page reads dark → dark → air → air → dark and
// closes where it started, and so the streak is unmistakably the thing that
// matters most down here. Three cards the same size say nothing is more
// important than anything else, which was never true.
//
// The palette is unchanged: this is ink and paper, the two colours the app has
// always had, in the other order. `#C4C2BB` and `#B3AEA3` are `paperSoft` and
// `dim` from constants/design.ts — that file names them precisely because a dark
// ground needs its own secondary text and its own hairline, and measures both
// against ink (9.76:1 and 7.87:1).
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const CREAM = '#FAFAF7';
const ON_INK_SOFT = '#C4C2BB';    // paperSoft — secondary text on a dark ground
const ON_INK_DIM = '#B3AEA3';     // dim — marks and labels, never body text
// The unearned rings AND their weekday labels — one value, because the component
// spends it on both. It has to sit BETWEEN ink and `dim`: at full `dim` an
// unfinished day is brighter than the streak line above it, so the week reads as
// five loud empty circles and two quiet full ones, shouting about the days you
// missed. But it is still carrying six pieces of text, so it cannot recede as far
// as it wants to — measured at 4.23:1 on ink, just under the 4.5:1 body-text
// floor and well over the 3:1 a mark needs, against 16.64:1 for the filled days.
// (For scale: the paper version of this row labels its unearned days at 1.52:1,
// which is why they cannot be read on the profile screen at all.)
const ON_INK_FAINT = '#807D74';
// A divider inside a dark field, and nothing else. 1.51:1 — deliberately below
// every text and mark floor, because a rule separating two numbers should be
// felt rather than seen; the numbers either side are at 16.64:1.
const ON_INK_RULE = '#3A3936';

export default function HabitCard({
  streak,
  lastLessonDate,
  lessons,
  xp,
  restBridging,
  style,
}: {
  streak: number;
  lastLessonDate: string | null;
  lessons: number;
  xp: number;
  restBridging: boolean;
  style?: object;
}) {
  return (
    // The WHOLE panel opens the month, not just its head. The streak is the thing
    // readers come back to check, and making them find the one strip of it that
    // happened to be pressable is a puzzle nobody asked for.
    <PressableScale
      onPress={() => router.push('/(app)/streak')}
      containerStyle={style}
      style={styles.panel}
      scaleTo={0.985}
    >
      {/* The panel's own section head, so all three things below Quick Start are
          named the same way — and the half of it that says where the tap goes.
          The old card was pressable across its top strip with nothing at all to
          say so, which is a door with no handle: the streak screen it opens is
          the whole point of the streak, and readers were being asked to guess. */}
      <View style={styles.kickerRow}>
        <Text style={styles.kicker}>YOUR STREAK</Text>
        <Text style={styles.kicker}>SEE THE MONTH  →</Text>
      </View>

      <View style={styles.head}>
        {/* Inverted: the book is drawn in cream on the ink panel. It takes the
            pair as props precisely so it can be printed either way up. */}
        <StreakBook value={streak} size={44} color={CREAM} paper={INK} />
        <View style={styles.headText}>
          <Text style={styles.streak}>
            {streak} DAY{streak === 1 ? '' : 'S'} RUNNING
          </Text>
          {/* Only when a rest day is actually holding it up. It says the streak is
              safe WITHOUT saying it has been spent, because it has not: the
              deduction happens when they finish something today. */}
          <Text style={styles.sub} numberOfLines={2}>
            {restBridging
              ? 'A day of rest is holding it — finish anything today.'
              : 'Every day you turn up is a day here.'}
          </Text>
        </View>
      </View>

      <View style={styles.week}>
        <StreakWeek
          streak={streak}
          lastLessonDate={lastLessonDate}
          size={28}
          tint={CREAM}
          ground={INK}
          faint={ON_INK_FAINT}
          soft={ON_INK_SOFT}
        />
      </View>

      {/* Two odometers. No totals to be a fraction of — these only ever climb,
          and they are set at a size worth climbing to: a run of lessons read as
          "0 LESSONS · 1,240 XP" in 15pt, centred either side of a middot, which
          is a caption about your progress rather than a display of it. */}
      <View style={styles.foot}>
        <View style={styles.stat}>
          <Text style={styles.statNum} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {lessons.toLocaleString()}
          </Text>
          <Text style={styles.statWord}>{lessons === 1 ? 'LESSON' : 'LESSONS'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statNum} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {xp.toLocaleString()}
          </Text>
          <Text style={styles.statWord}>XP EARNED</Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: INK,
    borderRadius: 6,
    paddingTop: 16,
    paddingBottom: 4,
    paddingHorizontal: 16,
    // The same hard offset shadow Quick Start carries, so the two solid objects
    // on this page are made of the same stuff. No border: a dark field on cream
    // paper is already its own edge, and an ink outline round an ink panel is a
    // line nobody can see.
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 3,
  },

  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kicker: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: ON_INK_DIM,
    letterSpacing: 2.2,
    includeFontPadding: false,
  },

  head: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  headText: { flex: 1 },
  streak: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: CREAM,
    letterSpacing: 1.8,
    includeFontPadding: false,
  },
  sub: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 12.5,
    color: ON_INK_SOFT,
    marginTop: 4,
    lineHeight: 17,
  },

  week: { marginTop: 18 },

  foot: { flexDirection: 'row', alignItems: 'stretch', marginTop: 18 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statNum: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    color: CREAM,
    includeFontPadding: false,
  },
  statWord: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: ON_INK_DIM,
    letterSpacing: 1.8,
    marginTop: 6,
  },
  divider: { width: 1, backgroundColor: ON_INK_RULE, marginVertical: 4 },
});
