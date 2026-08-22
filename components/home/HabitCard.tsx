import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import PressableScale from '@/components/shared/PressableScale';
import StreakPanel from '@/components/gamification/StreakPanel';

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
// ── THE STREAK ITSELF MOVED OUT INTO ITS OWN OBJECT ─────────────────────────
//
// A reader: "I like this but it needs to be more gamified and better UI for
// this, it is a little boring. I also want you to do the same for the daily
// streak box in the profile tab."
//
// The second half of that sentence is why the streak is not drawn here any more.
// This card and Profile's box were two hand-built arrangements of the same three
// facts, so "do the same for both" would have meant writing every improvement
// twice and watching them drift. `components/gamification/StreakPanel.tsx` is
// the one object, printed on ink here and on paper there, and it carries what
// the app already had and neither screen showed: the ember, the society, and the
// rest days. This card keeps what is genuinely its own — the two odometers, the
// ink ground, and the door to the month.
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
const ON_INK_DIM = '#B3AEA3';     // dim — marks and labels, never body text
// `ON_INK_SOFT` and `ON_INK_FAINT` moved into StreakPanel with the week row they
// were measured for. The note that came with them is worth keeping in one place
// rather than two, and it is now in that file's header.
// A divider inside a dark field, and nothing else. 1.51:1 — deliberately below
// every text and mark floor, because a rule separating two numbers should be
// felt rather than seen; the numbers either side are at 16.64:1.
const ON_INK_RULE = '#3A3936';

export default function HabitCard({
  streak,
  lastLessonDate,
  lessons,
  xp,
  restHeld,
  restMax,
  restBridging,
  style,
}: {
  streak: number;
  lastLessonDate: string | null;
  lessons: number;
  xp: number;
  restHeld: number;
  restMax: number;
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

      <StreakPanel
        onInk
        streak={streak}
        lastLessonDate={lastLessonDate}
        restHeld={restHeld}
        restMax={restMax}
        restBridging={restBridging}
      />

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
