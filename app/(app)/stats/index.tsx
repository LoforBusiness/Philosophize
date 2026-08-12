import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions, Pressable, AccessibilityInfo,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Line } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle, useAnimatedProps, withSpring, withTiming, withDelay, Easing,
  type SharedValue,
} from 'react-native-reanimated';
import SketchPieChart, { type PiePoint, TINTS } from '@/components/shared/SketchPieChart';
import ACounter, { counterStyle } from '@/components/shared/ACounter';
import ScreenTransition from '@/components/shared/ScreenTransition';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { useUserDataStore } from '@/stores/userDataStore';
import { milestoneFor, statsFingerprint, type StatElement, type Milestone } from '@/lib/utils/statsMilestone';
import { cue } from '@/lib/feedback';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';

const SW = Dimensions.get('window').width;
// On a phone the two pies can't sit side-by-side without overflowing — stack them.
const STACK_PIES = SW < 600;

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

// Each branch gets a fixed grayscale tint by its position in AREA_ORDER, so the
// same colour stands for a branch in BOTH the Areas-of-Interest pie and the
// Activity Breakdown bars (Ethics = ink black → Politics = lightest gray).
const AREA_TINT: Record<string, string> = Object.fromEntries(
  AREA_ORDER.map((slug, i) => [slug, TINTS[i % TINTS.length]])
);

export default function StatsScreen() {
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const settings = useUserDataStore((s) => s.settings);
  const seenFingerprint = useUserDataStore((s) => s.statsSeenFingerprint);
  const markStatsSeen = useUserDataStore((s) => s.markStatsSeen);
  const showWidget = settings.widgetEnabled && settings.widgetPlacement === 'insights';

  const lessonsDone = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const quotesSaved = savedQuotes.length;
  const philosophersViewed = Object.keys(philosopherViews).length;

  // Per-branch metrics.
  const branchMetrics = ALL_BRANCHES.map((b) => {
    const lessons = lessonsByBranch[b.slug] ?? 0;
    const quotes = savedQuotes.filter((q) => q.branchSlugs.includes(b.slug)).length;
    const views = ALL_PHILOSOPHERS.filter((p) => p.branchSlugs.includes(b.slug)).reduce(
      (a, p) => a + (philosopherViews[p.id] ?? 0),
      0
    );
    // The first unit in this branch that is not finished — the nearest whole
    // thing a reader can complete, which is one of the three milestone targets.
    const totalLessons = b.paths.reduce((a, p) => a + p.lessons.length, 0);
    let unitRemaining: number | undefined;
    let unitLabel: string | undefined;
    for (const p of b.paths) {
      const done = lessonsByUnit[p.id] ?? 0;
      if (done < p.lessons.length) {
        unitRemaining = p.lessons.length - done;
        unitLabel = p.name;
        break;
      }
    }
    return {
      slug: b.slug,
      lessons,
      quotes,
      views,
      totalLessons,
      unitRemaining,
      unitLabel,
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

  // Only the leading philosophers — no catch-all "Others" slice. Percentages are
  // computed across just these top thinkers.
  //
  // A thinker's cheapest lever is a SAVED QUOTE (+5), so that is the action the
  // milestone counts in and the copy names. Reading them is worth 3 and finishing
  // a lesson in their area 1, but neither is a thing a reader does *to* a thinker.
  const philPie: PiePoint[] = philScores.slice(0, 5).map((p) => ({
    label: p.surname,
    value: p.score,
    element: { key: p.id, label: p.surname, value: p.score, perAction: 5, action: 'quote' },
  }));

  const areaPie: PiePoint[] = AREA_ORDER.map((slug) => {
    const m = metricBySlug[slug];
    const value = m?.interest ?? 0;
    return {
      label: AREA_NAME[slug],
      value,
      color: AREA_TINT[slug],
      element: m ? {
        key: slug,
        label: AREA_NAME[slug],
        value,
        perAction: 3,                                  // interest = lessons×3 + …
        action: 'lesson' as const,
        ceiling: m.totalLessons * 3 + m.quotes * 2 + m.views,
        unitRemaining: m.unitRemaining,
        unitLabel: m.unitLabel,
      } : undefined,
    };
  }).filter((d) => d.value > 0);

  const activity = AREA_ORDER.map((slug) => {
    const m = metricBySlug[slug];
    return {
      label: AREA_NAME[slug],
      value: m?.interactions ?? 0,
      color: AREA_TINT[slug],
      element: m ? {
        key: slug,
        label: AREA_NAME[slug],
        value: m.interactions,
        perAction: 1,                                  // interactions = lessons + …
        action: 'lesson' as const,
        ceiling: m.totalLessons + m.quotes + m.views,
        unitRemaining: m.unitRemaining,
        unitLabel: m.unitLabel,
      } : undefined,
    };
  });
  const hasActivity = activity.some((a) => a.value > 0);

  // ── HAS ANYTHING CHANGED SINCE THEY LAST LOOKED? ──────────────────────────
  //
  // The entrance plays only when it has. `playToken` is what the charts watch:
  // it moves when a fresh look is due and stays put otherwise, so re-focusing
  // the tab with nothing new draws everything finished and still.
  const fingerprint = useMemo(
    () => statsFingerprint({
      branches: branchMetrics.map((m) => ({ slug: m.slug, interest: m.interest, interactions: m.interactions })),
      philosophers: philScores.slice(0, 5).map((p) => ({ id: p.id, score: p.score })),
    }),
    [branchMetrics, philScores],
  );

  const [playToken, setPlayToken] = useState(0);
  const [animate, setAnimate] = useState(false);
  const armed = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (fingerprint === seenFingerprint) { setAnimate(false); return; }
      // Guard against the effect re-running for the same fingerprint while the
      // store write settles — otherwise the entrance restarts mid-flight.
      if (armed.current === fingerprint) return;
      armed.current = fingerprint;
      setAnimate(true);
      setPlayToken((n) => n + 1);
      markStatsSeen(fingerprint);
    }, [fingerprint, seenFingerprint, markStatsSeen]),
  );

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
    <ScreenTransition bg={Paper}>
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Masthead */}
        <Text style={styles.kicker}>YOUR PROGRESS</Text>
        <Text style={styles.title}>Philosophy</Text>
        <Text style={styles.titleItalic}>Statistics</Text>
        <View style={styles.rule} />

        {showWidget ? <DailyQuoteWidget style={{ marginBottom: 20 }} /> : null}

        {hasAny ? (
          <>
            {/* Pies */}
            {(philPie.length > 0 || areaPie.length > 0) && (
              <View style={[styles.pieRow, STACK_PIES && { flexDirection: 'column' }]}>
                {philPie.length > 0 && (
                  <SketchPieChart
                    title="Top Philosophers"
                    subtitle="by lessons & research"
                    data={philPie}
                    valueMode="raw"
                    playToken={playToken}
                    animate={animate}
                    stacked={STACK_PIES}
                  />
                )}
                {areaPie.length > 0 && (
                  <SketchPieChart
                    title="Areas of Interest"
                    subtitle="by quotes, lessons & views"
                    data={areaPie}
                    valueMode="percent"
                    playToken={playToken}
                    animate={animate}
                    delay={110}
                    stacked={STACK_PIES}
                  />
                )}
              </View>
            )}

            {/* Activity breakdown */}
            {hasActivity && <ActivityBars points={activity} playToken={playToken} animate={animate} />}

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
    </ScreenTransition>
  );
}

interface BarPoint { label: string; value: number; color: string; element?: StatElement }

// ─────────────────────────────────────────────────────────────────────────────
// THE BARS ARE VIEWS NOW, NOT SVG RECTS.
//
// They are rectangles. Drawing them in an <Svg> bought nothing and cost the one
// thing that matters here: an SVG rect cannot be given its own transform without
// animating an SVG property every frame, which is precisely the shape §17 warns
// about and `check-poll` was written after. As native Views each bar carries its
// own `scaleY`, anchored at the baseline, composited on the UI thread — cheaper
// than what this drew before AND independently animatable.
//
// The <Svg> that remains draws one line: the baseline. It never moves.
//
// Geometry is unchanged from the SVG version on purpose — same `slot`, same
// `barW`, same `baseline` — because the value and label text are positioned
// against those numbers and would drift off the bars if either drifted.
// ─────────────────────────────────────────────────────────────────────────────
const MIN_GHOST_BAR = 8 / 144;   // 8px in the plot below; see check-stats.mjs

function ActivityBars({ points, playToken, animate }: { points: BarPoint[]; playToken: number; animate: boolean }) {
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

  const [reduce, setReduce] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setReduce(v); });
    return () => { alive = false; };
  }, []);

  const grow = useSharedValue(animate ? 0 : 1);
  const ghost = useSharedValue(0);
  const shown = useSharedValue(0);

  useEffect(() => {
    if (!animate || reduce) { grow.value = 1; return; }
    grow.value = 0;
    grow.value = withDelay(220, withSpring(1, { damping: 12, stiffness: 150, mass: 0.9 }));
  }, [playToken, animate, reduce, grow]);

  const milestone: Milestone | null = useMemo(() => {
    if (sel == null) return null;
    const els = points.map((p) => p.element).filter(Boolean) as StatElement[];
    if (els.length !== points.length) return null;
    return milestoneFor(els, sel, { mode: 'bar', minGhost: MIN_GHOST_BAR });
  }, [sel, points]);

  const nowVal = sel != null ? points[sel].value : 0;
  const nextVal = milestone && milestone.kind !== 'complete' ? milestone.projected : nowVal;

  useEffect(() => {
    const live = sel != null && milestone != null && milestone.kind !== 'complete';
    if (!live) { ghost.value = withTiming(0, { duration: 140 }); return; }
    shown.value = nowVal;
    if (reduce) { ghost.value = 1; shown.value = nextVal; return; }
    ghost.value = 0;
    ghost.value = withSpring(1, { damping: 13, stiffness: 160 });
    shown.value = withTiming(nextVal, { duration: 620, easing: Easing.out(Easing.cubic) });
  }, [sel, milestone, nowVal, nextVal, reduce, ghost, shown]);

  const countProps = useAnimatedProps(() => ({ text: `${Math.round(shown.value)}` }) as never);
  const ghostStyle = useAnimatedStyle(() => ({
    opacity: ghost.value,
    transform: [{ scaleY: ghost.value }],
  }));

  const pick = (i: number) => {
    setSel((prev) => (prev === i ? null : i));
    cue('keep');   // see SketchPieChart.pick — `impact` is a 950ms struck boulder
  };

  // The ghost's own height, in the same pixels the bars are drawn in.
  const ghostH = milestone && milestone.kind !== 'complete'
    ? Math.max(2, ((milestone.projected - nowVal) / max) * plotH)
    : 0;

  return (
    <View style={styles.activityCard}>
      <Text style={styles.activityTitle}>Activity Breakdown</Text>
      <Text style={styles.activitySub}>total interactions per area</Text>

      <View style={{ width: innerW, height: H, marginTop: 8 }}>
        {/* The only thing left in SVG, and the only thing that never moves. */}
        <Svg width={innerW} height={H} style={StyleSheet.absoluteFill}>
          <Line x1={0} y1={baseline} x2={innerW} y2={baseline} stroke={Ink} strokeWidth={1.5} />
        </Svg>

        {points.map((p, i) => {
          const barH = Math.max(2, (p.value / max) * plotH);
          const cx = slot * i + slot / 2;
          return (
            <Bar
              key={`bar-${p.label}`}
              grow={grow}
              index={i}
              count={n}
              style={{
                left: cx - barW / 2,
                top: baseline - barH,
                width: barW,
                height: barH,
                backgroundColor: p.color,
                borderWidth: sel === i ? 2.6 : 1.5,
              }}
            />
          );
        })}

        {/* The ghost sits directly on top of the bar it belongs to, growing up
            out of it — same anchor, same width, dashed rather than filled. */}
        {sel != null && ghostH > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ghostBar,
              {
                left: slot * sel + slot / 2 - barW / 2,
                top: baseline - Math.max(2, (points[sel].value / max) * plotH) - ghostH,
                width: barW,
                height: ghostH,
              },
              ghostStyle,
            ]}
          />
        )}

        {/* Hit targets: a full-height column per bar, so a two-pixel bar is as
            tappable as a tall one. */}
        {points.map((p, i) => (
          <Pressable
            key={`hit-${p.label}`}
            onPress={p.element ? () => pick(i) : undefined}
            accessibilityRole={p.element ? 'button' : undefined}
            accessibilityLabel={p.element ? `${p.label}, ${p.value} interactions` : undefined}
            style={{ position: 'absolute', left: slot * i, top: padTop, width: slot, height: plotH }}
          />
        ))}

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

      {sel != null && milestone && (
        <View style={styles.detail}>
          <View style={styles.detailHead}>
            <Text style={styles.detailLabel} numberOfLines={1}>{points[sel].label.toUpperCase()}</Text>
            {milestone.kind === 'complete' ? null : (
              <>
                <Text style={styles.detailNow}>{nowVal}</Text>
                <Text style={styles.detailArrow}>→</Text>
                <ACounter
                  editable={false}
                  pointerEvents="none"
                  underlineColorAndroid="transparent"
                  defaultValue={`${nowVal}`}
                  style={[styles.detailNext, counterStyle]}
                  animatedProps={countProps}
                />
              </>
            )}
          </View>
          <Text style={styles.detailCopy}>{milestone.copy}</Text>
        </View>
      )}
    </View>
  );
}

/**
 * ONE BAR, AND IT IS ITS OWN COMPONENT FOR A REASON.
 *
 * Each bar needs its own `useAnimatedStyle` to carry its own stagger, and the
 * obvious way to write that — calling the hook inside the `.map()` — is a hook
 * in a loop. It would even work today, because this chart always draws exactly
 * six bars, so the count and order never vary. That is precisely the kind of
 * "fine until it isn't" that rule 1 in §17 is about: the day the chart filters
 * an empty branch, React counts a different number of hooks between renders and
 * throws. A component per bar makes the hook count structural rather than lucky.
 */
function Bar({ grow, index, count, style }: {
  grow: SharedValue<number>;
  index: number;
  count: number;
  style: ViewStyle;
}) {
  const aStyle = useAnimatedStyle(() => {
    // Each bar starts a little after the one to its left, and the whole run is
    // over well inside `grow`'s spring — a stagger, not a queue.
    const lead = (index / Math.max(1, count)) * 0.35;
    const t = Math.min(1, Math.max(0, (grow.value - lead) / (1 - lead)));
    return { transform: [{ scaleY: t }] };
  });
  return <Animated.View style={[styles.bar, style, aStyle]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft, letterSpacing: 3, marginTop: 8 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: Ink, marginTop: 6 },
  titleItalic: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 30, color: Ink, marginTop: -2 },
  rule: { height: 1.5, backgroundColor: Ink, marginTop: 14, marginBottom: 22 },

  pieRow: { flexDirection: 'row', gap: 14, marginTop: 28 },

  activityCard: { borderWidth: 2, borderColor: Ink, borderRadius: 4, padding: 16, marginTop: 22 },
  activityTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Ink },
  activitySub: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 11, color: InkSoft, marginTop: 2 },
  actValue: { position: 'absolute', textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 11, color: Ink },
  actLabel: { position: 'absolute', textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft },

  // A bar grows from its own base, so the transform origin has to be the bottom
  // edge — RN scales about the centre by default, which would grow it both ways
  // and push it through the baseline.
  bar: { position: 'absolute', borderColor: Ink, transformOrigin: 'bottom' },
  ghostBar: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Ink,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    transformOrigin: 'bottom',
  },

  detail: { borderTopWidth: 1, borderTopColor: InkFaint, paddingTop: 10, marginTop: 14 },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailLabel: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4, color: InkSoft },
  detailNow: { fontFamily: 'Inter_400Regular', fontSize: 12, color: InkSoft },
  detailArrow: { fontFamily: 'Inter_400Regular', fontSize: 12, color: InkSoft },
  detailNext: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Ink, minWidth: 30, textAlign: 'right' },
  detailCopy: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12.5,
    color: Ink, lineHeight: 19, marginTop: 5,
  },

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
