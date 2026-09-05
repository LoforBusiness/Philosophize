import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import {
  useSharedValue, withTiming, withDelay, withSequence,
} from 'react-native-reanimated';
import ScreenTransition from '@/components/shared/ScreenTransition';
import DailyQuoteWidget from '@/components/shared/DailyQuoteWidget';
import {
  Ledger, RankedBars, ThinkerLeague, DiscoveryCard,
  type LedgerItem, type BarRow, type LeagueRow,
} from '@/components/stats/InsightBoard';
import { revealTo, EASE_REVEAL, EASE_SETTLE, D_WIPE } from '@/components/stats/reveal';
import Dial from '@/components/stats/Dial';
import {
  Instrument, PanelHead, PanelRule, Legend, SparkLine, MetricStrip, type Metric,
} from '@/components/stats/Instrument';
import { ALL_BRANCHES } from '@/data';
import { ALL_PHILOSOPHERS, ERA_GROUPS, eraGroupOf, eraGroupOfId } from '@/data/philosophers';
import { PHILOSOPHER_FACTS } from '@/data/philosopherFacts';
import { BRANCH, ERA, C, type BranchKey, type EraKey } from '@/constants/design';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { statsFingerprint, grownKeys } from '@/lib/utils/statsMilestone';
import { discoverIn, discoverFact, type Candidate } from '@/lib/utils/statsDiscovery';
import { dailyXP, dayLabels, activeDays as countActive } from '@/lib/utils/xpSeries';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';

/** How far back the line chart looks. Thirty is a month you can still resolve. */
const WINDOW = 30;

// Politics is the only branch whose real name will not sit on a legend row
// beside its count without wrapping.
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
// ── THE INSTRUMENT, AND WHY THE TAB WAS CHEAP BEFORE IT ─────────────────────
//
//   > "the whole tab looks too much childish, I need more premium feel and
//   > vibrent colors, not just a bunch of colors that make the app feel cheep."
//
// The two halves of that only look contradictory. What made it cheap was never
// the palette, it was the AREA: six saturated fills on white, all large, all at
// once — a 26px ring, twelve-pixel rounded pill bars, pastel tinted cards behind
// the prose. Six big colours competing on paper is a rainbow.
//
// So the readings that ARE a chart moved onto one dark instrument panel, where
// the same six hues appear as a thin arc and an 8px swatch and read as cut
// stones rather than poster paint, and where the type is cream and the rules are
// hairlines. See components/stats/Instrument.tsx and tone.ts's `glow()`.
//
// The panel also answers the other half of the brief — "a line graph below the
// pie chart" with real metrics — with thirty days of XP, its seven-day mean, the
// best day marked, and four figures under it. That is comprehensive in the way
// the reader asked for: more to read, not more to look at.
//
// ── WHAT STAYED ON PAPER, AND WHY ───────────────────────────────────────────
//
// The ledger, the thinker league and the era rail. They are lists rather than
// charts, they carry the reader's own achievements, and the app is printed
// matter — turning the entire tab dark would make it a dashboard belonging to
// some other product. One instrument on a page of paper is a plate in a book.
//
// ── AN ARRIVAL IS NOT A REACTION ────────────────────────────────────────────
//
// This screen decides which of the two every play is, and everything animated
// under it obeys. The distinction is not a guess: an ARRIVAL is a play that
// lands on FOCUS, a REACTION is one that lands while the reader is already
// looking at the tab. `settled` is the whole mechanism, and it needs TWO focus
// effects to work — the first has an empty dependency list so its cleanup only
// runs on a real blur, while the second's identity changes with the fingerprint
// and therefore re-runs in place. Merge them and the flag is cleared by every
// change, which is precisely the case it exists to detect.
//
// What it fixes: opening a thinker from this tab calls `recordPhilosopherView`,
// which moves the era counts, which moves the fingerprint — so the reader's own
// tap used to replay the entrance and blank the four totals at the top of the
// screen for about a second. See components/stats/InsightBoard.tsx.
//
// ── AND NO TARGET COMES FROM A TOTAL ────────────────────────────────────────
//
// lib/utils/statsMilestone.ts and statsDiscovery.ts hold that line: a tap names
// a thinker you have never opened, never a countdown to a ceiling the curriculum
// keeps moving. scripts/check-stats.mjs re-derives it against a 32-lesson and a
// 900-lesson curriculum.
// ─────────────────────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const philosopherLessons = useUserDataStore((s) => s.philosopherLessons);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const practisedDays = useUserDataStore((s) => s.activeDays);
  const xpEvents = useUserDataStore((s) => s.xpEvents);
  const streak = useUserDataStore((s) => s.streak);
  const settings = useUserDataStore((s) => s.settings);
  const seenFingerprint = useUserDataStore((s) => s.statsSeenFingerprint);
  const markStatsSeen = useUserDataStore((s) => s.markStatsSeen);
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const showWidget = settings.widgetEnabled && settings.widgetPlacement === 'insights';

  const { width } = useWindowDimensions();
  // page padding 20 each side, panel padding 16 each side.
  const panelW = Math.max(220, width - 40 - 32);

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
    return {
      key: b.slug,
      label: shortName(b.slug, b.name),
      value: lessons,
      hue: BRANCH[b.slug as BranchKey] ?? C.HUE,
      detail: `${quotes} quote${quotes === 1 ? '' : 's'} kept  ·  ${met} thinker${met === 1 ? '' : 's'} met`,
      action: 'lesson' as const,
    };
  }).sort((a, b) => b.value - a.value), [lessonsByBranch, savedQuotes, philosopherViews]);

  // ── who it was about ──────────────────────────────────────────────────────
  //
  // A COUNT of two things the reader did — lessons that were about them, and
  // quotes of theirs kept. Opening a page is the tie-break rather than a term,
  // because scrolling a profile is not reading someone.
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
        action: 'thinker' as const,
      };
    }).sort((a, b) => b.value - a.value);
  }, [philosopherViews, savedQuotes]);

  // ── the month ─────────────────────────────────────────────────────────────
  //
  // `dailyXP` buckets the cumulative XP log into per-day gains and keeps the
  // empty days, which is the whole reason the line means anything: a log only
  // records earning, so bucketing by index would draw four busy days in a row
  // where there were four busy days spread over a fortnight.
  const series = useMemo(() => dailyXP(xpEvents, WINDOW, Date.now()), [xpEvents]);
  // Built once beside the series, from the same window — see dayLabels' note on
  // why the caller must not work the dates out for itself.
  const spanDays = useMemo(() => dayLabels(WINDOW, Date.now()), []);
  const monthXP = series.reduce((a, b) => a + b, 0);
  const bestDay = series.reduce((a, b) => (b > a ? b : a), 0);
  const activeInWindow = countActive(series);
  const perActive = activeInWindow > 0 ? Math.round(monthXP / activeInWindow) : 0;

  const metrics: Metric[] = [
    { key: 'best', label: 'BEST DAY', value: bestDay },
    { key: 'per', label: 'PER ACTIVE DAY', value: perActive },
    { key: 'active', label: 'DAYS ACTIVE', value: activeInWindow, suffix: `/${WINDOW}` },
    { key: 'streak', label: 'STREAK', value: streak },
  ];

  // ── has anything changed since they last looked? ──────────────────────────
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
  // A fresh mount is an arrival by definition. See the note at the top.
  const [entrance, setEntrance] = useState(true);
  const settled = useRef(false);
  // WHICH rows the reader actually moved. Read out of the PREVIOUS fingerprint,
  // which is still in the store at the moment the effect runs — after
  // `markStatsSeen` it is gone, so the order inside the effect is load-bearing.
  const [grown, setGrown] = useState<Set<string>>(() => new Set());
  const armed = useRef<string | null>(null);

  // FIRST, AND WITH NO DEPENDENCIES ON PURPOSE. Its callback identity never
  // changes, so react-navigation runs it only on a real focus and tears it down
  // only on a real blur — which is the one clock in this screen that a
  // fingerprint change cannot touch.
  useFocusEffect(useCallback(() => { settled.current = false; }, []));

  useFocusEffect(
    useCallback(() => {
      // Read BEFORE the early returns: arriving with no news still counts as
      // having arrived, or the reader's first tap afterwards would be mistaken
      // for one. That case — land on Insights with nothing new, open a thinker
      // you have never met, come back — is exactly the reported bug.
      const arriving = !settled.current;
      settled.current = true;
      // NO `setAnimate(false)` HERE, and that is a fix rather than an omission.
      // `markStatsSeen` writes the fingerprint, which re-renders, which changes
      // this callback's identity, which makes useFocusEffect run it AGAIN — and
      // on that second pass the two fingerprints are equal. Clearing the flag
      // there set `animate` false while the springs were still travelling, and
      // every child effect keys on `animate`, so all of them snapped straight to
      // their end state. Measured in a browser: the ring and all seventeen bars
      // sat at exactly 1.000 through a growth event that should have bounced.
      //
      // The flag does not need clearing. Children re-run on `playToken`, which
      // only moves when there is news.
      if (fingerprint === seenFingerprint) return;
      // Guard against the effect re-running for the same fingerprint while the
      // store write settles — otherwise the entrance restarts mid-flight.
      if (armed.current === fingerprint) return;
      armed.current = fingerprint;
      setGrown(grownKeys(seenFingerprint, fingerprint));
      setEntrance(arriving);
      setAnimate(true);
      setPlayToken((n) => n + 1);
      markStatsSeen(fingerprint);
    }, [fingerprint, seenFingerprint, markStatsSeen]),
  );

  // THE DIAL IS SET, PIECE BY PIECE, ON AN ARRIVAL WITH NEWS.
  //
  // It used to squeeze the whole disc to 0.82 and spring it 39% past itself —
  // the loudest motion on the tab and the first thing the reader named. It is
  // six struck pieces in a socket, so it arrives the way it is built: each one
  // settles home from a little way out, clockwise from twelve. See Dial's Props.
  //
  // On a REACTION it moves only if the thing it draws moved, and then only the
  // piece that moved. The dial is lessons by branch, and meeting a thinker is
  // not a lesson, so the commonest reaction in the tab leaves it perfectly
  // still — which is the difference between feedback and a screen that twitches
  // whenever it is touched.
  const grewBranch = useMemo(
    () => areaRows.find((r) => grown.has(r.key))?.key ?? null,
    [areaRows, grown],
  );
  const dialEnter = useSharedValue(1);
  const dialNudge = useSharedValue(0);
  const dialPlayed = useRef<number | null>(null);
  useEffect(() => {
    const newPlay = dialPlayed.current !== playToken;
    dialPlayed.current = playToken;
    if (!animate || !newPlay) return;
    if (entrance) {
      dialEnter.value = 0;
      dialEnter.value = revealTo(1, 60, D_WIPE);
      return;
    }
    // A reaction never re-sets the disc — it is on screen and being read.
    dialEnter.value = 1;
    if (!grewBranch) { dialNudge.value = 0; return; }
    dialNudge.value = withSequence(
      withTiming(1, { duration: 260, easing: EASE_REVEAL }),
      withDelay(220, withTiming(0, { duration: 480, easing: EASE_SETTLE })),
    );
  }, [playToken, animate, entrance, grewBranch, dialEnter, dialNudge]);

  // ── the discovery pool ────────────────────────────────────────────────────
  const candidates: Candidate[] = useMemo(() => ALL_PHILOSOPHERS.map((p) => ({
    id: p.id,
    name: p.name,
    symbol: p.symbol,
    oneLiner: p.oneLiner,
    lifespan: p.lifespan,
    group: eraGroupOf(p),
    branchSlugs: p.branchSlugs,
    met: (philosopherViews[p.id] ?? 0) > 0,
    lessons: philosopherLessons[p.id] ?? 0,
  })), [philosopherViews, philosopherLessons]);

  const discoverBranch = useCallback((slug: string) => {
    const row = areaRows.find((r) => r.key === slug);
    return discoverIn(
      candidates.filter((c) => c.branchSlugs.includes(slug)),
      `${slug}:${row?.value ?? 0}`,
    );
  }, [candidates, areaRows]);

  const discoverEra = useCallback((key: string) => {
    const row = eraRows.find((r) => r.key === key);
    return discoverIn(
      candidates.filter((c) => c.group === key),
      `${key}:${row?.value ?? 0}`,
    );
  }, [candidates, eraRows]);

  const discoverThinker = useCallback((id: string) => {
    const c = candidates.find((x) => x.id === id);
    if (!c) return null;
    return discoverFact(
      c.name, c.id, PHILOSOPHER_FACTS[id] ?? [], `${id}:${c.lessons}`, c.symbol, c.lifespan,
    );
  }, [candidates]);

  // The dial and its legend share one selection, so they are one chart rather
  // than two views of the same numbers.
  const [dialSel, setDialSel] = useState<string | null>(null);
  const dialPick = (k: string) => setDialSel((p) => (p === k ? null : k));
  const dialRow = areaRows.find((r) => r.key === dialSel) ?? null;
  const dialFind = dialSel ? discoverBranch(dialSel) : null;

  const ledger: LedgerItem[] = [
    { key: '__lessons', label: 'LESSONS', value: lessonsDone, hue: BRANCH.ethics },
    { key: '__thinkers', label: 'THINKERS', value: thinkersMet, hue: BRANCH.metaphysics },
    { key: '__quotes', label: 'QUOTES', value: quotesKept, hue: BRANCH.aesthetics },
    { key: '__days', label: 'DAYS', value: daysPractised, hue: BRANCH.epistemology },
  ];

  // The ledger has no fingerprint keys of its own — a tile pops when any row it
  // totals grew, which is the honest reading of "this number moved because of
  // something you did".
  const ledgerGrown = useMemo(() => {
    const g = new Set<string>();
    if (grown.size === 0) return g;
    if (areaRows.some((r) => grown.has(r.key))) { g.add('__lessons'); g.add('__days'); }
    if (eraRows.some((r) => grown.has(r.key))) g.add('__thinkers');
    if (league.some((r) => grown.has(r.id))) g.add('__quotes');
    return g;
  }, [grown, areaRows, eraRows, league]);

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

  return (
    <ScreenTransition bg={Paper}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>YOUR PROGRESS</Text>
          <Text style={styles.title}>Philosophy</Text>
          <Text style={styles.titleItalic}>Statistics</Text>
          <View style={styles.rule} />

          {showWidget ? <DailyQuoteWidget style={{ marginBottom: 20 }} /> : null}

          <Ledger
            items={ledger}
            playToken={playToken}
            animate={animate}
            entrance={entrance}
            grown={ledgerGrown}
          />

          {/* ── the instrument ── */}
          <Instrument>
            <PanelHead kicker="WHERE YOUR READING GOES" right="BY BRANCH" />
            <View style={styles.dialRow}>
              <Dial
                segments={areaRows}
                total={lessonsDone}
                totalLabel="LESSONS"
                selected={dialSel}
                onSelect={dialPick}
                enter={dialEnter}
                nudge={dialNudge}
                nudgeKey={grewBranch}
              />
              <Legend
                rows={areaRows}
                total={lessonsDone}
                selected={dialSel}
                onSelect={dialPick}
                grown={grown}
                playToken={playToken}
                animate={animate}
                entrance={entrance}
              />
            </View>

            {dialFind && dialRow ? (
              <DiscoveryCard
                d={dialFind}
                hue={dialRow.hue}
                sub={dialRow.detail}
                onOpen={openPhilosopher}
                dark
              />
            ) : (
              <Text style={styles.panelHint}>Tap a branch to meet someone from it.</Text>
            )}

            <PanelRule />

            <PanelHead kicker={`LAST ${WINDOW} DAYS`} right={`${monthXP} XP`} />
            <View style={{ marginTop: 8 }}>
              <SparkLine
                series={series}
                labels={spanDays}
                spanLabel={`${WINDOW} DAYS AGO`}
                width={panelW}
                playToken={playToken}
                animate={animate}
                entrance={entrance}
              />
            </View>

            <PanelRule />

            <MetricStrip metrics={metrics} playToken={playToken} animate={animate} entrance={entrance} />
          </Instrument>

          {league.length > 0 && (
            <ThinkerLeague
              rows={league}
              playToken={playToken}
              animate={animate}
              entrance={entrance}
              grown={grown}
              discoverFor={discoverThinker}
              onOpen={openPhilosopher}
            />
          )}

          <RankedBars
            title="Thinkers by Era"
            subtitle="whose century you actually read"
            // INK, NOT AN ERA HUE. The five colours in this box are labels for
            // the five rows; a sixth one in the head would be a label for
            // nothing, and picking the leading era's would make the box change
            // colour as the reader reads.
            accent={Ink}
            rows={eraRows}
            playToken={playToken}
            animate={animate}
            entrance={entrance}
            grown={grown}
            discoverFor={discoverEra}
            onOpenThinker={openPhilosopher}
            hint
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

  dialRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12, marginBottom: 10 },
  panelHint: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 12, color: C.dim, marginTop: 2,
  },

  weekCard: {
    borderLeftWidth: 3, borderLeftColor: Ink,
    paddingLeft: 14, paddingVertical: 4, marginTop: 30,
  },
  weekHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekDiamond: { fontSize: 11, color: Ink },
  weekTitle: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.8, color: Ink },
  weekBody: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 15, lineHeight: 23, color: Ink, marginTop: 8,
  },

  footerQuote: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic',
    fontSize: 12, color: C.dim, textAlign: 'center', marginTop: 34,
  },
});
