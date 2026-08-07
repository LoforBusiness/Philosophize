import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import PressableScale from '@/components/shared/PressableScale';
import { ALL_BRANCHES, branchCountsFromUnits } from '@/data/index';
import { useUserDataStore } from '@/stores/userDataStore';
import { INK, MID, FAINT, PAPER } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// WHERE YOU ARE IN THE SIX BRANCHES — one glance, not a dashboard.
//
// The Stats tab already analyses this. What it cannot do is be visible from
// Home: the reader had no way to see the shape of the whole curriculum without
// leaving the page. Six columns filling from the ground is the smallest drawing
// that answers "how far in am I", and it is the drawing that shows the thing a
// number cannot — that someone is four branches deep in one and has never opened
// the other five.
//
// Columns rather than a row of horizontal bars purely for height: six labelled
// horizontal bars is 150dp, six columns is 56, and Home has 56 to spend.
// ─────────────────────────────────────────────────────────────────────────────

// Three letters, because six labels have to fit across a phone. Not shared with
// the profile's SHORT map, which spells the branches out in full for a screen
// that has the width for it — these are a different answer to a different
// constraint, and folding them together would make one of the two wrong.
const ABBR: Record<string, string> = {
  metaphysics: 'MET',
  epistemology: 'EPI',
  logic: 'LOG',
  ethics: 'ETH',
  aesthetics: 'AES',
  'political-philosophy': 'POL',
};

const TRACK = 30;

export default function BranchProgress({ style }: { style?: object }) {
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);

  const { cols, done, total } = useMemo(() => {
    const counts = branchCountsFromUnits(lessonsByUnit);
    let d = 0;
    let t = 0;
    const c = ALL_BRANCHES.map((b) => {
      const all = b.paths.reduce((n, p) => n + p.lessons.length, 0);
      const got = counts[b.slug] ?? 0;
      d += got;
      t += all;
      return { slug: b.slug, label: ABBR[b.slug] ?? b.name.slice(0, 3).toUpperCase(), frac: all ? got / all : 0 };
    });
    return { cols: c, done: d, total: t };
  }, [lessonsByUnit]);

  return (
    <PressableScale
      onPress={() => router.push('/(app)/branches')}
      containerStyle={style}
      style={styles.card}
    >
      <View style={styles.head}>
        <Text style={styles.kicker}>WHERE YOU ARE</Text>
        <Text style={styles.count}>{done} / {total}</Text>
      </View>

      <View style={styles.row}>
        {cols.map((c) => (
          <View key={c.slug} style={styles.col}>
            <View style={styles.track}>
              {/* Fills on arrival rather than appearing full, so finishing a
                  lesson and coming back actually shows the column grow. */}
              <MotiView
                from={{ height: 0 }}
                animate={{
                  // A floor of 2 on a branch with real progress, so one lesson in
                  // is a visible mark rather than a rounding error against 32.
                  height: c.frac > 0 ? Math.max(2, Math.round(c.frac * TRACK)) : 0,
                }}
                transition={{ type: 'timing', duration: 620, delay: 220 }}
                style={styles.fill}
              />
            </View>
            <Text style={styles.label} allowFontScaling={false}>{c.label}</Text>
          </View>
        ))}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
    backgroundColor: PAPER,
    paddingTop: 11,
    paddingBottom: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 9, color: MID, letterSpacing: 2 },
  count: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, color: INK, includeFontPadding: false },

  row: { flexDirection: 'row', gap: 9, marginTop: 11 },
  col: { flex: 1, alignItems: 'center' },
  // An OUTLINED track, not a solid grey one. At FAINT (#C9C5BA) the six empty
  // tracks were the heaviest ink in the card and the actual progress read as a
  // sliver at the bottom of a slab — figure and ground the wrong way round. A
  // hairline box with a near-paper fill puts the weight back on the ink that
  // means something, and it matches every other outlined box in the app.
  track: {
    width: '100%',
    height: TRACK,
    backgroundColor: '#F1EEE5',
    borderWidth: 1,
    borderColor: FAINT,
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: { width: '100%', backgroundColor: INK, borderRadius: 2 },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8.5,
    color: MID,
    letterSpacing: 0.9,
    marginTop: 5,
    includeFontPadding: false,
  },
});
