import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Line, Defs, Pattern } from 'react-native-svg';
import SketchPieChart, { type PiePoint } from '@/components/shared/SketchPieChart';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';

const SW = Dimensions.get('window').width;
const STAT_W = (SW - 40 - 30) / 4;

// Fixed display order + names for the area charts (matches the mockup).
const AREA_ORDER = ['ethics', 'metaphysics', 'epistemology', 'aesthetics', 'logic', 'political-philosophy'];
const AREA_NAME: Record<string, string> = {
  ethics: 'Ethics',
  metaphysics: 'Metaphysics',
  epistemology: 'Epistemology',
  aesthetics: 'Aesthetics',
  logic: 'Logic',
  'political-philosophy': 'Politics',
};

export default function StatsScreen() {
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);

  const lessonsDone = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const quotesSaved = savedQuotes.length;
  const philosophersViewed = Object.keys(philosopherViews).length;
  const streak = useUserDataStore((s) => s.streak);

  // Per-branch metrics.
  const branchMetrics = ALL_BRANCHES.map((b) => {
    const lessons = lessonsByBranch[b.slug] ?? 0;
    const quotes = savedQuotes.filter((q) => q.branchSlugs.includes(b.slug)).length;
    const views = ALL_PHILOSOPHERS.filter((p) => p.branchSlugs.includes(b.slug)).reduce(
      (a, p) => a + (philosopherViews[p.id] ?? 0),
      0
    );
    return {
      slug: b.slug,
      lessons,
      quotes,
      views,
      interactions: lessons + quotes + views,
      interest: lessons * 3 + quotes * 2 + views,
    };
  });
  const metricBySlug = Object.fromEntries(branchMetrics.map((m) => [m.slug, m]));

  // Top philosophers (by views, saved quotes, and lessons in their areas).
  const philScores = ALL_PHILOSOPHERS.map((p) => {
    const views = philosopherViews[p.id] ?? 0;
    const quotes = savedQuotes.filter((q) => q.philosopherId === p.id).length;
    const learn = p.branchSlugs.reduce((a, s) => a + (lessonsByBranch[s] ?? 0), 0);
    return { id: p.id, name: p.name, surname: p.name.split(' ').slice(-1)[0], score: views * 3 + quotes * 5 + learn };
  })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);

  const philPie: PiePoint[] = philScores.slice(0, 4).map((p) => ({ label: p.surname, value: p.score }));
  const othersScore = philScores.slice(4).reduce((a, p) => a + p.score, 0);
  if (othersScore > 0) philPie.push({ label: 'Others', value: othersScore });

  const areaPie: PiePoint[] = AREA_ORDER.map((slug) => ({
    label: AREA_NAME[slug],
    value: metricBySlug[slug]?.interest ?? 0,
  })).filter((d) => d.value > 0);

  const activity = AREA_ORDER.map((slug) => ({
    label: AREA_NAME[slug],
    value: metricBySlug[slug]?.interactions ?? 0,
  }));
  const hasActivity = activity.some((a) => a.value > 0);

  // "This Week" insight.
  const topArea = [...branchMetrics].sort((a, b) => b.interactions - a.interactions)[0];
  const topPhil = philScores[0];
  const insight =
    topArea && topArea.interactions > 0
      ? `You've spent most time in ${AREA_NAME[topArea.slug] ?? topArea.slug}${
          topPhil ? `, guided by ${topPhil.name}` : ''
        }. Their ideas appear in ${metricBySlug[topArea.slug]?.quotes ?? 0} of your saved quotes.`
      : 'Finish a lesson or save a quote, and your weekly story will appear here.';

  const hasAny = lessonsDone + quotesSaved + philosophersViewed > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Masthead */}
        <Text style={styles.kicker}>YOUR PROGRESS</Text>
        <Text style={styles.title}>Philosophy</Text>
        <Text style={styles.titleItalic}>Statistics</Text>
        <View style={styles.rule} />

        {/* Stat boxes */}
        <View style={styles.statRow}>
          <StatBox symbol="◼" value={lessonsDone} label="Lessons" />
          <StatBox symbol="“" value={quotesSaved} label="Quotes Saved" />
          <StatBox symbol="◈" value={philosophersViewed} label="Philosophers" />
          <StatBox symbol="◆" value={streak} label="Day Streak" />
        </View>

        {hasAny ? (
          <>
            {/* Pies */}
            {(philPie.length > 0 || areaPie.length > 0) && (
              <View style={styles.pieRow}>
                {philPie.length > 0 && (
                  <SketchPieChart
                    title="Top Philosophers"
                    subtitle="by lessons & research"
                    data={philPie}
                    valueMode="raw"
                  />
                )}
                {areaPie.length > 0 && (
                  <SketchPieChart
                    title="Areas of Interest"
                    subtitle="by quotes, lessons & views"
                    data={areaPie}
                    valueMode="percent"
                  />
                )}
              </View>
            )}

            {/* Activity breakdown */}
            {hasActivity && <ActivityBars points={activity} />}

            {/* This week */}
            <View style={styles.weekCard}>
              <View style={styles.weekHead}>
                <Text style={styles.weekDiamond}>◈</Text>
                <Text style={styles.weekTitle}>This Week</Text>
              </View>
              <Text style={styles.weekBody}>{insight}</Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Complete a few lessons and save some quotes — your charts will appear here.
            </Text>
          </View>
        )}

        <Text style={styles.footerQuote}>“The unexamined life is not worth living.” — Socrates</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ symbol, value, label }: { symbol: string; value: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statSymbol}>{symbol}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityBars({ points }: { points: { label: string; value: number }[] }) {
  const innerW = SW - 40 - 32; // page padding + card padding
  const H = 200;
  const padTop = 26;
  const padBottom = 30;
  const baseline = H - padBottom;
  const plotH = baseline - padTop;
  const max = Math.max(...points.map((p) => p.value), 1);
  const n = points.length;
  const slot = innerW / n;
  const barW = Math.min(46, slot * 0.5);

  return (
    <View style={styles.activityCard}>
      <Text style={styles.activityTitle}>Activity Breakdown</Text>
      <Text style={styles.activitySub}>total interactions per area</Text>

      <View style={{ width: innerW, height: H, marginTop: 8 }}>
        <Svg width={innerW} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <Pattern id="actHatch" patternUnits="userSpaceOnUse" width={6} height={6}>
              <Rect x={0} y={0} width={6} height={6} fill={Paper} />
              <Line x1={0} y1={6} x2={6} y2={0} stroke={Ink} strokeWidth={1.1} />
            </Pattern>
          </Defs>
          <Line x1={0} y1={baseline} x2={innerW} y2={baseline} stroke={Ink} strokeWidth={1.5} />
          {points.map((p, i) => {
            const barH = Math.max(2, (p.value / max) * plotH);
            const cx = slot * i + slot / 2;
            const x = cx - barW / 2;
            const y = baseline - barH;
            return (
              <Rect
                key={p.label}
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill="url(#actHatch)"
                stroke={Ink}
                strokeWidth={1.5}
              />
            );
          })}
        </Svg>

        {points.map((p, i) => {
          const barH = Math.max(2, (p.value / max) * plotH);
          const cx = slot * i + slot / 2;
          return (
            <Text key={`v${p.label}`} style={[styles.actValue, { left: cx - 24, top: baseline - barH - 18, width: 48 }]}>
              {p.value}
            </Text>
          );
        })}
        {points.map((p, i) => {
          const cx = slot * i + slot / 2;
          return (
            <Text
              key={`l${p.label}`}
              numberOfLines={1}
              style={[styles.actLabel, { left: cx - slot / 2, top: baseline + 8, width: slot }]}
            >
              {p.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft, letterSpacing: 3, marginTop: 8 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: Ink, marginTop: 6 },
  titleItalic: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 30, color: Ink, marginTop: -2 },
  rule: { height: 1.5, backgroundColor: Ink, marginTop: 14, marginBottom: 22 },

  statRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    width: STAT_W,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 3,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statSymbol: { fontSize: 15, color: Ink, marginBottom: 8 },
  statValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: Ink },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, color: InkSoft, marginTop: 3, textAlign: 'center' },

  pieRow: { flexDirection: 'row', gap: 14, marginTop: 28 },

  activityCard: { borderWidth: 2, borderColor: Ink, borderRadius: 4, padding: 16, marginTop: 22 },
  activityTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Ink },
  activitySub: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 11, color: InkSoft, marginTop: 2 },
  actValue: { position: 'absolute', textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 11, color: Ink },
  actLabel: { position: 'absolute', textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft },

  weekCard: { borderWidth: 2, borderColor: Ink, borderRadius: 4, padding: 18, marginTop: 22 },
  weekHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  weekDiamond: { fontSize: 14, color: Ink },
  weekTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: Ink },
  weekBody: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, color: InkSoft, lineHeight: 22 },

  emptyBox: { borderWidth: 2, borderColor: InkFaint, borderRadius: 4, padding: 24, marginTop: 28 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: InkSoft, textAlign: 'center', lineHeight: 21 },

  footerQuote: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 12,
    color: InkSoft,
    textAlign: 'center',
    marginTop: 34,
  },
});
