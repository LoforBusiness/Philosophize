import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SketchIcon from '@/components/shared/SketchIcon';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';
import SketchLineChart, { type ChartPoint } from '@/components/shared/SketchLineChart';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E8E8E3';

export default function StatsScreen() {
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);

  // Top 3 areas — weighted by lessons completed + quotes saved in the area.
  const areaPoints: ChartPoint[] = ALL_BRANCHES.map((b) => {
    const lessons = lessonsByBranch[b.slug] ?? 0;
    const quotes = savedQuotes.filter((q) => q.branchSlugs.includes(b.slug)).length;
    return { label: b.name.split(' ')[0], value: lessons * 3 + quotes * 2 };
  })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  // Top 3 thinkers — weighted by profile views + quotes saved + lessons in their areas.
  const philPoints: ChartPoint[] = ALL_PHILOSOPHERS.map((p) => {
    const views = philosopherViews[p.id] ?? 0;
    const quotes = savedQuotes.filter((q) => q.philosopherId === p.id).length;
    const learn = p.branchSlugs.reduce((acc, slug) => acc + (lessonsByBranch[slug] ?? 0), 0);
    const surname = p.name.split(' ').slice(-1)[0];
    return { label: surname, value: views * 2 + quotes * 4 + learn };
  })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const totalQuotes = savedQuotes.length;
  const totalLessons = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const hasData = areaPoints.length > 0 || philPoints.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Mind</Text>
          <SketchIcon name="settings" size={24} color={InkSoft} />
        </View>

        {!hasData ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📈</Text>
            <Text style={styles.emptyTitle}>Nothing to chart yet</Text>
            <Text style={styles.emptyText}>
              Finish a few lessons and save some quotes. Your top thinkers and areas
              will be charted here.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.totalsRow}>
              <View style={styles.totalBox}>
                <Text style={styles.totalValue}>{totalLessons}</Text>
                <Text style={styles.totalLabel}>Lessons done</Text>
              </View>
              <View style={styles.totalBox}>
                <Text style={styles.totalValue}>{totalQuotes}</Text>
                <Text style={styles.totalLabel}>Quotes saved</Text>
              </View>
            </View>

            {philPoints.length > 0 && (
              <SketchLineChart title="Top Thinkers" points={philPoints} />
            )}
            {areaPoints.length > 0 && (
              <SketchLineChart title="Top Areas" points={areaPoints} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: Ink },
  totalsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  totalBox: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 14,
  },
  totalValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Ink },
  totalLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: InkSoft, marginTop: 2 },
  emptyBox: {
    borderWidth: 2,
    borderColor: InkFaint,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: Ink, marginBottom: 8 },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: InkSoft,
    textAlign: 'center',
    lineHeight: 21,
  },
});
