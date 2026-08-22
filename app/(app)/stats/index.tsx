import { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import ScreenTransition from '@/components/shared/ScreenTransition';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import {
  Ledger, RankedBars, ThinkerLeague,
  type LedgerItem, type BarRow, type LeagueRow,
} from '@/components/stats/InsightBoard';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS, ERA_GROUPS, eraGroupOf, eraGroupOfId } from '@/data/philosophers';
import { BRANCH, ERA, C, type BranchKey, type EraKey } from '@/constants/design';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { statsFingerprint } from '@/lib/utils/statsMilestone';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';

// Politics is the only branch whose real name will not sit on a bar row beside
// its count, and "Political Philosophy" wrapping to two lines in a ranked list
// breaks the rhythm of the other five.
const SHORT: Record<string, string> = { 'political-philosophy': 'Politics' };
const shortName = (slug: string, name: string) => SHORT[slug] ?? name;

const ERA_NAME: Record<EraKey, string> = {
  ANCIENT: 'Ancient',
  MEDIEVAL: 'Medieval',
  MODERN: 'Modern',
  CONTEMPORARY: 'Contemporary',
  EASTERN: 'Eastern',
};

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHTS.
//
// ── WHAT THIS TAB USED TO BE, AND WHY IT WAS DULL ───────────────────────────
//
// Two grey pies and a grey bar chart, all three drawn from the same numbers, and
// those numbers were composites: `interest = lessons×3 + quotes×2 + views`.
// Three shapes, one fact, no colour, and a unit nobody has ever earned.
//
// Three changes, and none of them invents any data:
//
// · COLOUR THAT MEANS SOMETHING. `BRANCH` and `ERA` in constants/design.ts are
//   two measured scales that exist precisely so a list of six or five readings
//   can be told apart at a glance. This tab was the last screen still drawing
//   six branches in six greys — the exact thing design.ts's own comment calls
//   "the 'dull' the redesign was asked to fix".
//
// · COUNTS, NOT SCORES. Every number drawn here is a thing the reader did:
//   lessons read, thinkers met, quotes kept, days practised. "Interest 47" is
//   gone.
//
// · FOUR DIFFERENT READINGS instead of one repeated three times — the ledger,
//   where the reading goes, who it was about, and which eras have been met.
//
// ── AND NO TARGET COMES FROM A TOTAL ────────────────────────────────────────
//
//   > "I dont want ... '4 more lessons to complete Logic' ... since I will be
//   > continuing adding lessons that doesnt make sense."
//
// Right, and the harm is bigger than the wording: a ceiling-based target moves
// AWAY from a reader whenever content ships. lib/utils/statsMilestone.ts is
// rebuilt around targets that cannot — pass the next thing along, or reach the
// next round number — and scripts/check-stats.mjs runs every profile against a
// 32-lesson and a 900-lesson curriculum and fails if a single milestone differs.
// ─────────────────────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const philosopherLessons = useUserDataStore((s) => s.philosopherLessons);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const practisedDays = useUserDataStore((s) => s.activeDays);
  const settings = useUserDataStore((s) => s.settings);
  const seenFingerprint = useUserDataStore((s) => s.statsSeenFingerprint);
  const markStatsSeen = useUserDataStore((s) => s.markStatsSeen);
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const showWidget = settings.widgetEnabled && settings.widgetPlacement === 'insights';

  const lessonsDone = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const quotesKept = savedQuotes.length;
  const thinkersMet = Object.keys(philosopherViews).length;
  const daysPractised = practisedDays.length;

  // ── where the reading goes ────────────────────────────────────────────────
  const areaRows: BarRow[] = useMemo(() => ALL_BRANCHES.map((b) => {
    const lessons = lessonsByBranch[b.slug] ?? 0;
    const quotes = savedQuotes.filter((q) => q.branchSlugs.includes(b.slug)).length;
    const met = ALL_PHILOSOPHERS.filter(
      (p) => p.branchSlugs.includes(b.slug) && (philosopherViews[p.id] ?? 0) > 0
    ).length;
    const bits = [
      `${quotes} quote${quotes === 1 ? '' : 's'} kept`,
      `${met} thinker${met === 1 ? '' : 's'} met`,
    ];
    return {
      key: b.slug,
      label: shortName(b.slug, b.name),
      value: lessons,
      hue: BRANCH[b.slug as BranchKey] ?? C.HUE,
      detail: bits.join('  ·  '),
      action: 'lesson' as const,
    };
  }).sort((a, b) => b.value - a.value), [lessonsByBranch, savedQuotes, philosopherViews]);

  // ── who it was about ──────────────────────────────────────────────────────
  //
  // The score is a COUNT of two things the reader did — lessons that were about
  // them, and quotes of theirs kept. Opening a page is the tie-break rather than
  // a term, because scrolling a profile is not reading someone.
  const league: LeagueRow[] = useMemo(() => ALL_PHILOSOPHERS
    .map((p) => {
      const lessons = philosopherLessons[p.id] ?? 0;
      const quotes = savedQuotes.filter((q) => q.philosopherId === p.id).length;
      const group = eraGroupOf(p) as EraKey;
      return {
        id: p.id,
        name: p.name,
        hue: ERA[group] ?? C.HUE,
        era: (ERA_NAME[group] ?? '').toUpperCase(),
        lessons,
        quotes,
        score: lessons + quotes,
        views: philosopherViews[p.id] ?? 0,
      };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => (b.score - a.score) || (b.views - a.views))
    .slice(0, 5), [philosopherLessons, savedQuotes, philosopherViews]);

  // ── which eras have been met ──────────────────────────────────────────────
  //
  // A reading no other screen has: 322 thinkers are sorted into five eras, and
  // "whose century do you actually read" is a question the app has always had
  // the answer to and never asked. Counts of thinkers MET — never out of a
  // total, for the same reason nothing else here is.
  const eraRows: BarRow[] = useMemo(() => {
    const met: Record<string, number> = {};
    const quoted: Record<string, number> = {};
    for (const id of Object.keys(philosopherViews)) {
      const g = eraGroupOfId(id);
      if (g) met[g] = (met[g] ?? 0) + 1;
    }
    for (const q of savedQuotes) {
      const g = eraGroupOfId(q.philosopherId);
      if (g) quoted[g] = (quoted[g] ?? 0) + 1;
    }
    return ERA_GROUPS.map((g) => {
      const n = quoted[g] ?? 0;
      return {
        key: g,
        label: ERA_NAME[g as EraKey],
        value: met[g] ?? 0,
        hue: ERA[g as EraKey],
        detail: `${n} quote${n === 1 ? '' : 's'} kept from this era`,
        action: 'lesson' as const,
      };
    }).sort((a, b) => b.value - a.value);
  }, [philosopherViews, savedQuotes]);

  // ── has anything changed since they last looked? ──────────────────────────
  //
  // The entrance plays only when it has, so movement on this tab MEANS something
  // happened rather than decorating every visit.
  const fingerprint = useMemo(
    () => statsFingerprint({
      branches: areaRows.map((r) => ({
        slug: r.key,
        lessons: r.value,
        quotes: savedQuotes.filter((q) => q.branchSlugs.includes(r.key)).length,
        thinkers: 0,
      })),
      philosophers: league.map((p) => ({ id: p.id, score: p.score })),
      eras: eraRows.map((r) => ({ key: r.key, value: r.value })),
    }),
    [areaRows, league, eraRows, savedQuotes],
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

  // ── the one piece of prose ────────────────────────────────────────────────
  //
  // It says WHY each thing leads, from whichever signal actually earned it, so
  // the reader learns what the chart is made of rather than being handed a
  // number they cannot place.
  const topArea = areaRows[0];
  const topPhil = league[0];
  const insight = (() => {
    if (!topArea || topArea.value === 0) {
      return 'Read a lesson or keep a quote, and your story will start here.';
    }
    const a = `${topArea.label} is where you spend your time — ${topArea.value} lesson${topArea.value === 1 ? '' : 's'} so far.`;
    if (!topPhil) return a;
    const why = topPhil.lessons >= topPhil.quotes
      ? `${topPhil.lessons} of your lessons were about them`
      : `you have kept ${topPhil.quotes} of their lines`;
    return `${a} ${topPhil.name} leads your thinkers: ${why}.`;
  })();

  const ledger: LedgerItem[] = [
    { label: 'LESSONS', value: lessonsDone, hue: BRANCH.ethics },
    { label: 'THINKERS', value: thinkersMet, hue: BRANCH.metaphysics },
    { label: 'QUOTES', value: quotesKept, hue: BRANCH.aesthetics },
    { label: 'DAYS', value: daysPractised, hue: BRANCH.epistemology },
  ];

  // NOTE there is no `hasAny` gate any more, and that is deliberate. An empty
  // Insights tab used to be a single grey box saying "your charts will appear
  // here", which is the most boring thing on the most boring screen — and it
  // hid the one thing a new reader most wants to see, which is the SHAPE of
  // what they are about to fill. Zeroed, the ledger and the two rails still draw
  // six branches and five eras in their own colours, with empty grooves waiting.
  // It is the same argument the saved-quotes rail makes for drawing locked eras.

  return (
    <ScreenTransition bg={Paper}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>YOUR PROGRESS</Text>
          <Text style={styles.title}>Philosophy</Text>
          <Text style={styles.titleItalic}>Statistics</Text>
          <View style={styles.rule} />

          {showWidget ? <DailyQuoteWidget style={{ marginBottom: 20 }} /> : null}

          <Ledger items={ledger} playToken={playToken} animate={animate} />

          <RankedBars
            title="Where Your Reading Goes"
            subtitle="lessons finished, by branch"
            rows={areaRows}
            playToken={playToken}
            animate={animate}
            hint
          />

          {league.length > 0 && (
            <ThinkerLeague
              rows={league}
              playToken={playToken}
              animate={animate}
              onOpen={openPhilosopher}
            />
          )}

          <RankedBars
            title="Thinkers by Era"
            subtitle="whose century you actually read"
            rows={eraRows}
            playToken={playToken}
            animate={animate}
          />

          <View style={styles.weekCard}>
            <View style={styles.weekHead}>
              <Text style={styles.weekDiamond}>◈</Text>
              <Text style={styles.weekTitle}>This Week</Text>
            </View>
            <Text style={styles.weekBody}>{insight}</Text>
          </View>

          <Text style={styles.footerQuote}>“The unexamined life is not worth living.” — Socrates</Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: C.inkSoft, letterSpacing: 3, marginTop: 8 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: Ink, marginTop: 6 },
  titleItalic: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 30, color: Ink, marginTop: -2 },
  rule: { height: 1.5, backgroundColor: Ink, marginTop: 14, marginBottom: 4 },

  weekCard: {
    borderLeftWidth: 4, borderLeftColor: Ink, borderRadius: 8,
    backgroundColor: C.surfaceSoft,
    paddingHorizontal: 14, paddingVertical: 14, marginTop: 30,
  },
  weekHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekDiamond: { fontSize: 12, color: Ink },
  weekTitle: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.8, color: Ink },
  weekBody: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 15, lineHeight: 23, color: Ink, marginTop: 8,
  },

  footerQuote: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 12, color: C.dim, textAlign: 'center', marginTop: 34,
  },
});
