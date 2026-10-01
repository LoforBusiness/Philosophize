import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenTransition from '@/components/shared/ScreenTransition';
import SubjectTile from '@/components/subjects/SubjectTile';
import { PAGE_PAD, GRID_GAP, tileSize } from '@/components/subjects/tileLayout';
import { SUBJECTS, roadOf, type Subject } from '@/data/subjects';
import { branchCountsFromUnits } from '@/data';
import { useUserDataStore } from '@/stores/userDataStore';
import { C, LIP } from '@/constants/design';
import Card from '@/components/ui/Card';
import DoodleGround from '@/components/shared/DoodleGround';
import { WALL } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// LEARN — EVERY SUBJECT, AS A GRID (2026-09-29).
//
// This tab listed philosophy's six branches until the owner took Ashmere to seven
// subjects. It is Brilliant's course page now: the subjects as tiles, two to a row,
// and a tap opens that subject's ROAD — one road per subject since 2026-09-30.
//
// EVERY SUBJECT THE SAME SIZE (2026-09-30). Philosophy used to take the full width
// over six below, and the owner: "This makes philosophy seem more important, and I want
// … each of the subjects have their equal amount of room." Seven do not pair, so the
// eighth cell says what is true of the list — more subjects are coming — and the grid
// is four even rows.
//
// The route is still `branches`, on purpose. Every lesson link, the road, the unit
// reviews and the stack's `anchor: 'index'` are written against it, and renaming a
// tab's route to match its label would buy nothing a reader can see.
// ─────────────────────────────────────────────────────────────────────────────

/** How much of a subject is the reader's own: finished lessons across its courses. */
function doneIn(subject: Subject, done: Record<string, number>): number {
  return subject.courses.reduce((n, c) => n + (done[c] ?? 0), 0);
}

/** The grid's rows: two tiles each. */
function pairs<T>(xs: readonly T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += 2) out.push(xs.slice(i, i + 2));
  return out;
}

/** The grid's eighth cell: not a subject, so it stands on no ledge and opens nothing. */
function MoreTile({ size }: { size: number }) {
  return (
    <Card pad={0} style={styles.moreFace}
      containerStyle={{ width: size, alignSelf: 'stretch', marginBottom: LIP.card }}>
      <View style={styles.moreBody}>
        <Text style={styles.morePlus}>+</Text>
        <Text style={styles.moreText}>More subjects{'\n'}on the way</Text>
      </View>
    </Card>
  );
}

export default function LearnScreen() {
  const { width } = useWindowDimensions();
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const done = useMemo(() => branchCountsFromUnits(lessonsByUnit), [lessonsByUnit]);
  const tile = tileSize(width);
  // One road per subject (2026-09-30): a tile opens the road itself.
  const open = (s: Subject) => router.push(`/(app)/branches/${roadOf(s)}` as never);

  return (
    <ScreenTransition bg={WALL}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <DoodleGround />
        <View style={styles.topBar}>
          <Text style={styles.brand}>ASHMERE · LEARN</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Subjects</Text>
          <Text style={styles.lede}>Pick one to walk its road.</Text>

          <View nativeID="learn-grid">
            {/* ROWS OF TWO, EACH STRETCHED TO ITS TALLER TILE. On a 320dp phone
                "Personal Growth" takes two lines and "Psychology" one, and a wrapped
                grid left the pair at two heights. Card relays a stretch to its face,
                so an explicit row makes a level pair. */}
            {pairs<Subject | null>([...SUBJECTS, ...(SUBJECTS.length % 2 ? [null] : [])]).map((row, r) => (
              <View key={row[0]?.slug ?? 'more'} style={[styles.row, r === 0 && styles.firstRow]}>
                {row.map((s) => s
                  ? <SubjectTile key={s.slug} subject={s} done={doneIn(s, done)} size={tile} onPress={() => open(s)} />
                  : <MoreTile key="more" size={tile} />)}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WALL },
  topBar: { paddingHorizontal: PAGE_PAD, paddingTop: 4, paddingBottom: 8 },
  brand: { fontFamily: 'Inter_500Medium', fontSize: 11, color: C.inkSoft, letterSpacing: 2 },
  scroll: { paddingHorizontal: PAGE_PAD, paddingBottom: 40 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, lineHeight: 34, color: C.ink },
  lede: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, lineHeight: 20,
    color: C.inkSoft, marginTop: 2, marginBottom: 16,
  },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: GRID_GAP, marginTop: GRID_GAP + 4 },
  firstRow: { marginTop: 0 },
  // Dashed: a place kept, not a thing to press (a pressable card stands on a ledge).
  moreFace: { borderStyle: 'dashed', borderColor: C.inkSoft },
  moreBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 14, minHeight: 120 },
  morePlus: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 34, lineHeight: 38, color: C.inkSoft },
  moreText: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, lineHeight: 19,
    color: C.inkSoft, textAlign: 'center', marginTop: 2,
  },
});
