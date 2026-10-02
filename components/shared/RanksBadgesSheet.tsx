import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import BadgeMedal from './BadgeMedal';
import RankSeal, { type SealState } from './RankSeal';
import RankClimbChart from './RankClimbChart';
import RankHeader from '@/components/profile/RankHeader';
import { RANKS, awardedRank, rankProgress, rankRequirement, type RankDef, rankOrder, rankDegree } from '@/data/ranks';
import { CIRCLES, circleForRank, RANK_EPITHETS, toRoman } from '@/data/rankLore';
import {
  BADGES, FAMILY_LABEL, FAMILY_ORDER, badgeCriterion, badgeProgress, badgeProgressLabel,
  caseOf, isStruck, type BadgeDef, type BadgeFamily, type ProgressStats,
} from '@/data/badges';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore, progressStats } from '@/stores/userDataStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#D9D7CE';
const Track = '#E6E4DC';
const Lock = '#8A93A0';
const RowTint = '#F1EFE7';

const ROW_H = 78;
const BADGE_GAP = 10;
const MEDAL = 66;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// ─── The badge case ──────────────────────────────────────────────────────────

type BadgeRow =
  | { k: string; type: 'head'; family: BadgeFamily; done: number; total: number }
  | { k: string; type: 'row'; items: BadgeDef[] };

/**
 * Flatten the fifty into headers and three-across rows.
 *
 * Grouped by family rather than run together in one wall, because the families
 * are what the six silhouettes are FOR — a grid that mixes them shows the reader
 * six shapes with no key, and a grid that groups them is the key.
 *
 * Within a family the order is the authored one (easiest first), NOT
 * earned-first: the next one to go after should be visible right where you left
 * off, and a list that reshuffles itself as you earn things loses that.
 */
function buildBadgeRows(stats: ProgressStats, held: readonly string[]): BadgeRow[] {
  const out: BadgeRow[] = [];
  // The reader's own case: every live badge, and a retired one only if they hold it —
  // so a family the app has retired simply is not there for a reader who never won one.
  const shown = caseOf(held);
  for (const family of FAMILY_ORDER) {
    const list = shown.filter((b) => b.family === family);
    if (!list.length) continue;
    out.push({
      k: `h-${family}`,
      type: 'head',
      family,
      done: list.filter((b) => isStruck(b, stats, held)).length,
      total: list.length,
    });
    for (let i = 0; i < list.length; i += 3) {
      out.push({ k: `r-${family}-${i}`, type: 'row', items: list.slice(i, i + 3) });
    }
  }
  return out;
}

/** One medal in the case: the mark, its name, and — if locked — how far off. */
function BadgeCell({
  badge, stats, held, width, onPress,
}: {
  badge: BadgeDef;
  stats: ProgressStats;
  held: readonly string[];
  width: number;
  onPress: () => void;
}) {
  const earned = isStruck(badge, stats, held);
  const pct = badgeProgress(badge, stats);
  return (
    <Pressable onPress={onPress} style={[styles.cell, { width }]} hitSlop={4}>
      <BadgeMedal
        family={badge.family}
        tier={badge.tier}
        glyph={badge.glyph}
        id={badge.id}
        earned={earned}
        size={MEDAL}
      />
      <Text style={[styles.cellName, !earned && styles.cellNameLocked]} numberOfLines={2}>
        {badge.name}
      </Text>
      {/* Only the locked ones carry a bar. An earned badge showing "50 / 50" is
          noise, and it is the unearned ones that the reader is deciding about. */}
      {!earned && (
        <View style={styles.cellTrack}>
          <View style={[styles.cellFill, { width: `${Math.max(pct * 100, pct > 0 ? 6 : 0)}%` }]} />
        </View>
      )}
    </Pressable>
  );
}

/** A single badge, treated as a page — the same move the ranks tab makes. */
function BadgeDetail({
  badge, stats, held, onBack,
}: {
  badge: BadgeDef;
  stats: ProgressStats;
  held: readonly string[];
  onBack: () => void;
}) {
  const earned = isStruck(badge, stats, held);
  return (
    <View style={styles.detailInner}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.detailBack}>
        <Text style={styles.detailBackText}>← All badges</Text>
      </Pressable>

      <View style={styles.detailSealWrap}>
        <BadgeMedal
          family={badge.family}
          tier={badge.tier}
          glyph={badge.glyph}
          id={badge.id}
          earned={earned}
          size={168}
        />
      </View>

      <Text style={styles.detailKicker}>
        {FAMILY_LABEL[badge.family]} · TIER {toRoman(badge.tier)}
      </Text>
      <Text style={styles.detailName}>{badge.name}</Text>
      <Text style={styles.detailEpithet}>{badge.caption}</Text>

      <View style={styles.detailDivider} />

      <View style={styles.detailRowItem}>
        <Text style={styles.detailLabel}>CRITERION</Text>
        <Text style={styles.detailValue}>{badgeCriterion(badge)}</Text>
      </View>
      <View style={styles.detailRowItem}>
        <Text style={styles.detailLabel}>PROGRESS</Text>
        <Text style={[styles.detailValue, !earned && { color: Lock }]}>
          {earned ? '✓ Struck' : badgeProgressLabel(badge, stats)}
        </Text>
      </View>
    </View>
  );
}

// rank position i (0-based) vs the current rank index → its seal state
function stateFor(i: number, currentIndex: number): SealState {
  if (i === currentIndex) return 'current';
  if (i < currentIndex) return 'earned';
  return 'locked';
}

export default function RanksBadgesSheet() {
  const tabReq = useUIStore((s) => s.ranksBadgesTab);
  const close = useUIStore((s) => s.closeRanksBadges);

  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const quizScores = useUserDataStore((s) => s.quizScores);
  const streak = useUserDataStore((s) => s.streak);
  const xp = useUserDataStore((s) => s.totalXP);
  const rankIndex = useUserDataStore((s) => s.rankIndex);
  const activeDays = useUserDataStore((s) => s.activeDays);
  const subjectDays = useUserDataStore((s) => s.subjectDays);
  const earnedBadges = useUserDataStore((s) => s.earnedBadges);
  const xpEvents = useUserDataStore((s) => s.xpEvents);
  // The sheet only exists while it is open, so mounting IS coming into view —
  // no focus plumbing needed here, unlike the Profile tab which stays mounted.
  const chartSeenXP = useUserDataStore((s) => s.chartSeenXP);
  const markChartSeen = useUserDataStore((s) => s.markChartSeen);

  const { height, width } = useWindowDimensions();
  const H = Math.round(height * 0.82);

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<'ranks' | 'badges'>('ranks');
  const [selected, setSelected] = useState<RankDef | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDef | null>(null);
  // Which circle the ladder shows; null is the reader's own.
  const [circle, setCircle] = useState<number | null>(null);

  useEffect(() => {
    if (tabReq) {
      setTab(tabReq);
      setVisible(true);
      setSelected(null);
      setSelectedBadge(null);
      setCircle(null);
    }
  }, [tabReq]);

  // The one shared measurement. This screen used to build its own copy of the
  // badge stats, which is how it came to be measuring `totalXP` differently from
  // the store that awards them.
  const totalXP = xp;
  const stats: ProgressStats = useMemo(
    () => progressStats({
      lessonsByBranch, lessonsByUnit, savedQuotes, philosopherViews, quizScores, streak, totalXP,
      activeDays, rankIndex, subjectDays,
    }),
    [lessonsByBranch, lessonsByUnit, savedQuotes, philosopherViews, quizScores, streak, totalXP,
      activeDays, rankIndex, subjectDays],
  );

  // Rows for the badge grid: a header per family, then its medals three across.
  // A FlatList, not a ScrollView — fifty medals is a hundred SVG views, and this
  // app has already paid once for building every row before it would scroll.
  const badgeRows = useMemo(() => buildBadgeRows(stats, earnedBadges), [stats, earnedBadges]);
  const inCaseCount = useMemo(() => caseOf(earnedBadges).length, [earnedBadges]);

  if (!visible) return null;

  const { current, index } = awardedRank(rankIndex, totalXP);
  const curTier = Math.floor(index / 6);
  const shownTier = circle ?? curTier;
  const earnedCount = caseOf(earnedBadges).filter((b) => isStruck(b, stats, earnedBadges)).length;
  const badgeW = (width - 32 - 2 * BADGE_GAP) / 3;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <MotiView
        animate={{ opacity: tabReq ? 1 : 0 }}
        transition={{ type: 'timing', duration: 240 }}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </MotiView>

      <AnimatePresence onExitComplete={() => setVisible(false)}>
        {tabReq && (
          <MotiView
            key="sheet"
            from={{ translateY: H }}
            animate={{ translateY: 0 }}
            exit={{ translateY: H }}
            transition={{ type: 'timing', duration: 340 }}
            style={[styles.sheet, { height: H }]}
          >
            <View style={styles.handle} />

            <View style={styles.inner}>
              <Text style={styles.title}>
                Ranks & <Text style={styles.titleItalic}>Badges</Text>
              </Text>

              {/* Tabs */}
              <View style={styles.tabs}>
                <Pressable onPress={() => setTab('ranks')} style={[styles.tab, tab === 'ranks' && styles.tabOn]}>
                  <Text style={[styles.tabText, tab === 'ranks' && styles.tabTextOn]}>Ascent</Text>
                </Pressable>
                <Pressable onPress={() => setTab('badges')} style={[styles.tab, tab === 'badges' && styles.tabOn]}>
                  <Text style={[styles.tabText, tab === 'badges' && styles.tabTextOn]}>Badges ({inCaseCount})</Text>
                </Pressable>
              </View>

              {tab === 'ranks' ? (
                /* ONE SCROLL FOR THE WHOLE TAB.
                   The ladder used to be its own ScrollView nested under a fixed
                   hero and chart, so it inherited whatever height was left — about
                   150px on a normal phone, which is TWO of the twenty-five rungs.
                   Twenty-three ranks were technically reachable and practically
                   invisible. The hero and the chart scroll away with everything
                   else now, and the ladder gets the full sheet.
                   The auto-scroll-to-your-rank went with it: on one scroll it would
                   open the tab already past the hero and the climb chart. */
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={styles.ascent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* HERO — the rank you hold, the one you are climbing to, and the
                      climb between them. The same header Profile draws
                      (components/profile/RankHeader) on the same flat card, with
                      the chart under it: one object on both screens. The chart's
                      own legend is off because the header has already said it. */}
                  <View style={styles.heroCard}>
                    <RankHeader rankIndex={index} totalXP={totalXP} />
                  </View>

                  {/* THE EIGHT CIRCLES (2026-10-01). This was all forty-eight ranks in
                      one column, so after a rank-up the reader scrolled past every
                      rung below theirs to find themselves. The ladder is grouped the
                      way it is built — eight circles of six — and the sheet opens on
                      the circle they are IN. The row picks a circle; the card shows
                      its six ranks, with the reader's own marked. No scrolling to
                      find where you are. */}
                  <Text style={styles.spineHint}>THE EIGHT CIRCLES · TAP ONE</Text>
                  <View style={styles.circleRow}>
                    {CIRCLES.map((c, t) => {
                      const cap = t * 6 + 5;
                      const st: SealState = t < curTier ? 'earned' : t === curTier ? 'current' : 'locked';
                      const on = t === shownTier;
                      return (
                        <Pressable
                          key={c.name}
                          onPress={() => setCircle(t)}
                          accessibilityRole="button"
                          accessibilityLabel={`${c.name}${t === curTier ? ', your circle' : ''}`}
                          style={[styles.circleChip, on && styles.circleChipOn]}
                        >
                          <RankSeal glyph={RANKS[cap].glyph} state={st} size={34} order={rankOrder(cap)} degree={0} />
                          {t === curTier ? <View style={styles.circleDot} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.circleCard}>
                    <View style={styles.circleHead}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.circleKicker}>CIRCLE {toRoman(shownTier + 1)} · {CIRCLES[shownTier].subtitle.toUpperCase()}</Text>
                        <Text style={styles.circleName}>{CIRCLES[shownTier].name}</Text>
                      </View>
                      <Text style={styles.circleCount}>
                        {Math.max(0, Math.min(6, index + 1 - shownTier * 6))}
                        <Text style={styles.circleOf}> / 6</Text>
                      </Text>
                    </View>
                    <View style={styles.circleGrid}>
                      {RANKS.slice(shownTier * 6, shownTier * 6 + 6).map((r, k) => {
                        const i = shownTier * 6 + k;
                        const st = stateFor(i, index);
                        const isNext = i === index + 1;
                        return (
                          <Pressable
                            key={r.id}
                            onPress={() => setSelected(r)}
                            style={[styles.rankCell, st === 'current' && styles.rankCellHere]}
                          >
                            <RankSeal glyph={r.glyph} state={st} size={62} order={rankOrder(i)} degree={rankDegree(i)} />
                            <Text style={[styles.rankCellName, st === 'locked' && { color: Lock }]} numberOfLines={2}>{r.name}</Text>
                            <Text style={[styles.rankCellXp, st === 'locked' && { color: Lock }]}>{r.xp.toLocaleString()} XP</Text>
                            {st === 'current' ? <Text style={styles.tagHere}>YOU ARE HERE</Text> : null}
                            {st === 'earned' ? <Text style={styles.tagDoneSmall}>✓ ACHIEVED</Text> : null}
                            {isNext ? <Text style={styles.tagNextSmall}>NEXT</Text> : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* THE CLIMB, after the circles: the circles answer "where am I" and
                      come first; the chart is how the reader got there. */}
                  <Text style={styles.spineHint}>YOUR CLIMB</Text>
                  <View style={[styles.heroCard, { marginTop: 6 }]}>
                    <View style={styles.climbWrap}>
                      <RankClimbChart
                        rankIndex={index}
                        totalXP={totalXP}
                        events={xpEvents}
                        width={width - 68}
                        height={188}
                        seenXP={chartSeenXP}
                        onSeen={markChartSeen}
                        legend={false}
                      />
                    </View>
                  </View>
                </ScrollView>
              ) : (
                <>
                  {/* A struck count, and how much of the case is filled. */}
                  <View style={styles.caseHead}>
                    <Text style={styles.caseCount}>
                      {earnedCount}
                      <Text style={styles.caseOf}> / {inCaseCount}</Text>
                    </Text>
                    <View style={styles.caseBarWrap}>
                      <Text style={styles.caseLabel}>STRUCK</Text>
                      <View style={styles.caseTrack}>
                        <View style={[styles.caseFill, { width: `${(earnedCount / Math.max(1, inCaseCount)) * 100}%` }]} />
                      </View>
                    </View>
                  </View>

                  <FlatList
                    style={{ flex: 1 }}
                    data={badgeRows}
                    keyExtractor={(r) => r.k}
                    contentContainerStyle={styles.grid}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={7}
                    windowSize={7}
                    renderItem={({ item }) =>
                      item.type === 'head' ? (
                        <View style={styles.famHead}>
                          <Text style={styles.famTitle}>{FAMILY_LABEL[item.family]}</Text>
                          <View style={styles.famRule} />
                          <Text style={styles.famCount}>{item.done} / {item.total}</Text>
                        </View>
                      ) : (
                        <View style={styles.gridRow}>
                          {item.items.map((b) => (
                            <BadgeCell
                              key={b.id}
                              badge={b}
                              stats={stats}
                              held={earnedBadges}
                              width={badgeW}
                              onPress={() => setSelectedBadge(b)}
                            />
                          ))}
                          {/* Hold the last row's columns so two medals don't spread. */}
                          {item.items.length < 3 &&
                            Array.from({ length: 3 - item.items.length }, (_, i) => (
                              <View key={`pad${i}`} style={{ width: badgeW }} />
                            ))}
                        </View>
                      )
                    }
                  />
                </>
              )}
            </View>

            {/* DETAIL — a single rank treated as a moment */}
            <AnimatePresence>
              {selected && (
                <MotiView
                  key="detail"
                  from={{ opacity: 0, translateY: 24 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 24 }}
                  transition={{ type: 'timing', duration: 240 }}
                  style={styles.detail}
                >
                  <RankDetail rank={selected} currentIndex={index} totalXP={totalXP} onBack={() => setSelected(null)} />
                </MotiView>
              )}
              {selectedBadge && (
                <MotiView
                  key="badge-detail"
                  from={{ opacity: 0, translateY: 24 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  exit={{ opacity: 0, translateY: 24 }}
                  transition={{ type: 'timing', duration: 240 }}
                  style={styles.detail}
                >
                  <BadgeDetail badge={selectedBadge} stats={stats} held={earnedBadges} onBack={() => setSelectedBadge(null)} />
                </MotiView>
              )}
            </AnimatePresence>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
}

function RankDetail({
  rank,
  currentIndex,
  totalXP,
  onBack,
}: {
  rank: RankDef;
  currentIndex: number;
  totalXP: number;
  onBack: () => void;
}) {
  const i = rank.id - 1;
  const st = stateFor(i, currentIndex);
  const circle = circleForRank(rank.id);
  const nextRank = RANKS[i + 1] ?? null;

  let statusLine = '';
  if (st === 'current') {
    const p = rankProgress(currentIndex, totalXP);
    statusLine = !p.next
      ? 'Highest rank attained'
      : p.pending
        ? `Finish a lesson to reach ${p.next.name}`
        : `${p.toNext.toLocaleString()} XP to ${p.next.name}`;
  } else if (st === 'earned') {
    statusLine = 'Achieved';
  } else {
    // A LOCKED RANK COSTS XP *AND* LESSONS, and saying only the first contradicted
    // this sheet's own header: with a promotion pending it read "Finish a lesson to
    // reach Epistemologist" at the top and "0 XP to unlock" on Epistemologist's own
    // page. Both were true; together they were nonsense. `rankIndex` advances one
    // step per finished lesson, so a rank three tiers up needs three lessons however
    // much XP is banked.
    const { xpShort, lessonsShort } = rankRequirement(i, currentIndex, totalXP);
    const lessons = `${lessonsShort} lesson${lessonsShort === 1 ? '' : 's'}`;
    statusLine = xpShort > 0
      ? `${xpShort.toLocaleString()} XP and ${lessons} to unlock`
      : `${lessons} to unlock`;
  }

  return (
    <View style={styles.detailInner}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.detailBack}>
        <Text style={styles.detailBackText}>← All ranks</Text>
      </Pressable>

      <View style={styles.detailSealWrap}>
        <RankSeal glyph={rank.glyph} state={st} size={168}
          order={rankOrder(rank.id - 1)} degree={rankDegree(rank.id - 1)} />
      </View>

      <Text style={styles.detailKicker}>RANK {rank.id} · {toRoman(rank.id)} · {circle.name.toUpperCase()}</Text>
      <Text style={styles.detailName}>{rank.name}</Text>
      <Text style={styles.detailEpithet}>“{RANK_EPITHETS[rank.id]}”</Text>

      <View style={styles.detailDivider} />

      <View style={styles.detailRowItem}>
        <Text style={styles.detailLabel}>CRITERION</Text>
        <Text style={styles.detailValue}>Reach {rank.xp.toLocaleString()} XP</Text>
      </View>
      <View style={styles.detailRowItem}>
        <Text style={styles.detailLabel}>STATUS</Text>
        <Text style={[styles.detailValue, st === 'earned' && { color: Ink }, st === 'locked' && { color: Lock }]}>
          {st === 'earned' ? '✓ ' : ''}{statusLine}
        </Text>
      </View>
      <View style={styles.detailRowItem}>
        <Text style={styles.detailLabel}>CIRCLE</Text>
        <Text style={styles.detailValue}>{circle.subtitle} · Tier {circle.tier} of 5</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Paper,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2,
    borderColor: Ink,
    overflow: 'hidden',
  },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: InkFaint, alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  inner: { flex: 1, paddingHorizontal: 16, paddingBottom: 12 },

  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Ink, marginTop: 4, marginBottom: 12 },
  titleItalic: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic' },

  tabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tab: { borderWidth: 1.5, borderColor: Ink, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  tabOn: { backgroundColor: Ink },
  tabText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: Ink },
  tabTextOn: { color: Paper },


  // A flat white card on the kit's 2px edge, as Profile's rank section is.
  heroCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 2, borderColor: '#DFDFDC',
    padding: 16, marginTop: 4,
  },
  climbWrap: { marginTop: 16 },
  spineHint: { fontFamily: 'Inter_700Bold', fontSize: 9, color: InkSoft, letterSpacing: 2, marginTop: 18, marginBottom: 4 },

  // ── the eight circles (2026-10-01) ─────────────────────────────────────────
  circleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  circleChip: {
    width: 40, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12,
    borderWidth: 2, borderColor: 'transparent',
  },
  circleChipOn: { backgroundColor: '#FFFFFF', borderColor: InkFaint },
  circleDot: { position: 'absolute', bottom: 1, width: 6, height: 6, borderRadius: 3, backgroundColor: '#D35E36' },
  circleCard: {
    marginTop: 10, padding: 14, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: InkFaint,
  },
  circleHead: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 6 },
  circleKicker: { fontFamily: 'Inter_700Bold', fontSize: 9, color: InkSoft, letterSpacing: 1.6 },
  circleName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: Ink, marginTop: 2 },
  circleCount: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Ink },
  circleOf: { fontFamily: 'Inter_500Medium', fontSize: 12, color: InkSoft },
  circleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  rankCell: { width: '32%', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 2, borderRadius: 12 },
  rankCellHere: { backgroundColor: RowTint, borderWidth: 2, borderColor: Ink },
  rankCellName: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, lineHeight: 17, color: Ink, textAlign: 'center', marginTop: 4,
  },
  rankCellXp: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft, marginTop: 1 },
  tagHere: {
    marginTop: 4, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1, color: '#FFFFFF',
    backgroundColor: Ink, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden',
  },
  tagDoneSmall: { marginTop: 4, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1, color: '#3E8E5A' },
  tagNextSmall: { marginTop: 4, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1, color: '#D35E36' },

  // ── the ladder ──────────────────────────────────────────────────────────
  // THE RAIL RUNS DOWN THE LEFT AND TURNS OFF TO EACH RANK.
  //
  // It used to be a single rule at the gutter's centre with the seal drawn on top
  // of it, so the line went straight through all twenty-five marks. The gutter is
  // wider now (76 rather than 64) to make room for the rail, the branch and the
  // seal side by side rather than stacked:
  //
  //     rail 7..9  ·  branch 9..31  ·  seal box 26..76, its RING 30..72
  //
  // The branch runs to 31, not to the seal box's edge at 26. A RankSeal draws its
  // ring at r=42 in a 100 viewBox, so at size 50 the ring is inset 4 from the box
  // — stopping the branch at the box left a 3-unit gap between the turn-off and
  // the mark it turns off to. It now overlaps the ring by one.
  ascent: { paddingBottom: 40 },
  spine: { marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', height: ROW_H },
  gutter: { width: 76, height: ROW_H, justifyContent: 'center' },
  rail: { position: 'absolute', left: 7, width: 2 },
  railTop: { top: 0, height: ROW_H / 2 },
  railBot: { bottom: 0, height: ROW_H / 2 },
  branch: { position: 'absolute', left: 9, top: ROW_H / 2 - 1, width: 22, height: 2 },
  junction: { position: 'absolute', left: 5, top: ROW_H / 2 - 3, width: 6, height: 6, borderRadius: 3 },
  sealSlot: { position: 'absolute', left: 26, top: (ROW_H - 50) / 2, width: 50, height: 50 },
  rowText: { flex: 1, marginLeft: 6 },
  rowName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: Ink },
  rowXp: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, marginTop: 1 },
  tagCurrent: { fontFamily: 'Inter_700Bold', fontSize: 9, color: Paper, letterSpacing: 1, backgroundColor: Ink, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, overflow: 'hidden' },
  tagDone: { fontFamily: 'Inter_700Bold', fontSize: 8.5, color: InkSoft, letterSpacing: 0.5 },
  tagNext: { fontFamily: 'Inter_700Bold', fontSize: 9, color: Ink, letterSpacing: 1, borderWidth: 1.5, borderColor: Ink, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },

  // ── the badge case ──────────────────────────────────────────────────────
  caseHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  caseCount: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: Ink, includeFontPadding: false },
  caseOf: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 19, color: InkSoft },
  caseBarWrap: { flex: 1 },
  caseLabel: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 2.2, color: InkSoft, marginBottom: 5 },
  caseTrack: { height: 7, borderRadius: 4, backgroundColor: Track, overflow: 'hidden' },
  caseFill: { height: 7, borderRadius: 4, backgroundColor: Ink },

  grid: { paddingBottom: 34 },
  famHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 20, marginBottom: 8 },
  famTitle: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 2, color: Ink },
  famRule: { flex: 1, height: 1, backgroundColor: InkFaint },
  famCount: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: InkSoft, fontVariant: ['tabular-nums'] },

  gridRow: { flexDirection: 'row', gap: BADGE_GAP, marginBottom: 4 },
  // NO BOX AROUND THE MEDAL. The six silhouettes are the whole point, and a
  // border round each one puts a seventh shape on top of the six.
  cell: { alignItems: 'center', paddingTop: 6, paddingBottom: 10 },
  cellName: {
    fontFamily: 'Inter_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 0.2,
    color: Ink, textAlign: 'center', marginTop: 7,
  },
  cellNameLocked: { color: Lock, fontFamily: 'Inter_500Medium' },
  cellTrack: { width: 40, height: 3, borderRadius: 2, backgroundColor: Track, marginTop: 6, overflow: 'hidden' },
  cellFill: { height: 3, borderRadius: 2, backgroundColor: Lock },

  // detail overlay
  detail: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: Paper, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  detailInner: { flex: 1, paddingHorizontal: 22, paddingTop: 22 },
  detailBack: { alignSelf: 'flex-start', paddingVertical: 6 },
  detailBackText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: Ink, letterSpacing: 0.5 },
  detailSealWrap: { alignItems: 'center', marginTop: 8, marginBottom: 14 },
  detailKicker: { fontFamily: 'Inter_700Bold', fontSize: 9, color: InkSoft, letterSpacing: 1.6, textAlign: 'center' },
  detailName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, color: Ink, textAlign: 'center', marginTop: 4 },
  detailEpithet: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 15, color: InkSoft, textAlign: 'center', marginTop: 6 },
  detailDivider: { height: 1.5, backgroundColor: InkFaint, marginVertical: 22 },
  detailRowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#EFEDE4' },
  detailLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: InkSoft, letterSpacing: 1.4 },
  detailValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15, color: Ink },
});
