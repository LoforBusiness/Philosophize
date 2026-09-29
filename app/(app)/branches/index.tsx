import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenTransition from '@/components/shared/ScreenTransition';
import SubjectTile from '@/components/subjects/SubjectTile';
import { PAGE_PAD, GRID_GAP, tileSize } from '@/components/subjects/tileLayout';
import { SUBJECTS, type Subject } from '@/data/subjects';
import { branchCountsFromUnits } from '@/data';
import { useUserDataStore } from '@/stores/userDataStore';
import { C } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// LEARN — EVERY SUBJECT, AS A GRID (2026-09-29).
//
// This tab listed philosophy's six branches until the owner took Ashmere to seven
// subjects. It is Brilliant's course page now: the subjects as tiles, two to a row,
// and a tap opens that subject's page — where philosophy's six branches, and the
// professor's intro before them, now live.
//
// PHILOSOPHY GETS THE FULL WIDTH because it is the one subject with courses today,
// which is also what makes seven tiles lay out: one across the top and six below.
//
// The route is still `branches`, on purpose. Every lesson link, the road, the unit
// reviews and the stack's `anchor: 'index'` are written against it, and renaming a
// tab's route to match its label would buy nothing a reader can see.
// ─────────────────────────────────────────────────────────────────────────────

/** How much of a subject is the reader's own: finished lessons across its courses. */
function doneIn(subject: Subject, done: Record<string, number>): number {
  return subject.courses.reduce((n, c) => n + (done[c] ?? 0), 0);
}

export default function LearnScreen() {
  const { width } = useWindowDimensions();
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const done = useMemo(() => branchCountsFromUnits(lessonsByUnit), [lessonsByUnit]);
  const tile = tileSize(width);
  const [lead, ...rest] = SUBJECTS;
  const open = (s: Subject) => router.push(`/(app)/branches/subject/${s.slug}` as never);

  return (
    <ScreenTransition bg={C.paper}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>ASHMERE · LEARN</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Subjects</Text>
          <Text style={styles.lede}>Pick one to open its courses.</Text>

          <View nativeID="learn-grid">
            <SubjectTile subject={lead} done={doneIn(lead, done)} size={width - 2 * PAGE_PAD} wide onPress={() => open(lead)} />
            {/* A wrapped row STRETCHES its children by default, and a Card's face
                does not stretch with its ledge — so the row sits flex-start and each
                tile keeps its own height (§14 found the same on the Pass tiles). */}
            <View style={styles.grid}>
              {rest.map((s) => (
                <SubjectTile key={s.slug} subject={s} done={doneIn(s, done)} size={tile} onPress={() => open(s)} />
              ))}
            </View>
          </View>

          <Text style={styles.footer}>More subjects are on the way.</Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  topBar: { paddingHorizontal: PAGE_PAD, paddingTop: 4, paddingBottom: 8 },
  brand: { fontFamily: 'Inter_500Medium', fontSize: 11, color: C.inkSoft, letterSpacing: 2 },
  scroll: { paddingHorizontal: PAGE_PAD, paddingBottom: 40 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, lineHeight: 34, color: C.ink },
  lede: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, lineHeight: 20,
    color: C.inkSoft, marginTop: 2, marginBottom: 16,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start',
    gap: GRID_GAP, marginTop: GRID_GAP + 4,
  },
  footer: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, color: C.inkSoft,
    textAlign: 'center', marginTop: 26,
  },
});
