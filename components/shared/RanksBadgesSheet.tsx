import { useEffect, useMemo, useRef, useState } from 'react';
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
import { RANKS, awardedRank, rankProgress, rankRequirement, type RankDef } from '@/data/ranks';
import { circleForRank, RANK_EPITHETS, toRoman } from '@/data/rankLore';
import {
  BADGES, FAMILY_LABEL, FAMILY_ORDER, badgeCriterion, badgeProgress, badgeProgressLabel,
  isEarned, type BadgeDef, type BadgeFamily, type ProgressStats,
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
function buildBadgeRows(stats: ProgressStats): BadgeRow[] {
  const out: BadgeRow[] = [];
  for (const family of FAMILY_ORDER) {
    const list = BADGES.filter((b) => b.family === family);
    if (!list.length) continue;
    out.push({
      k: `h-${family}`,
      type: 'head',
      family,
      done: list.filter((b) => isEarned(b, stats)).length,
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
  badge, stats, width, onPress,
}: {
  badge: BadgeDef;
  stats: ProgressStats;
  width: number;
  onPress: () => void;
}) {
  const earned = isEarned(badge, stats);
  const pct = badgeProgress(badge, stats);
  return (
    <Pressable onPress={onPress} style={[styles.cell, { width }]} hitSlop={4}>
      <BadgeMedal
        family={badge.family}
        tier={badge.tier}
        glyph={badge.glyph}
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
  badge, stats, onBack,
}: {
  badge: BadgeDef;
  stats: ProgressStats;
  onBack: () => void;
}) {
  const earned = isEarned(badge, stats);
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
  const xpByDay = useUserDataStore((s) => s.xpByDay);

  const { height, width } = useWindowDimensions();
  const H = Math.round(height * 0.82);

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<'ranks' | 'badges'>('ranks');
  const [selected, setSelected] = useState<RankDef | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDef | null>(null);
  const spineRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (tabReq) {
      setTab(tabReq);
      setVisible(true);
      setSelected(null);
      setSelectedBadge(null);
    }
  }, [tabReq]);

  // The one shared measurement. This screen used to build its own copy of the
  // badge stats, which is how it came to be measuring `totalXP` differently from
  // the store that awards them.
  const totalXP = xp;
  const stats: ProgressStats = useMemo(
    () => progressStats({
      lessonsByBranch, lessonsByUnit, savedQuotes, philosopherViews, quizScores, streak, totalXP,
    }),
    [lessonsByBranch, lessonsByUnit, savedQuotes, philosopherViews, quizScores, streak, totalXP],
  );

  // Rows for the badge grid: a header per family, then its medals three across.
  // A FlatList, not a ScrollView — fifty medals is a hundred SVG views, and this
  // app has already paid once for building every row before it would scroll.
  const badgeRows = useMemo(() => buildBadgeRows(stats), [stats]);

  if (!visible) return null;

  const { current, next, index, pending } = awardedRank(rankIndex, totalXP);
  const prevXP = current.xp;
  const span = next ? next.xp - prevXP : 1;
  const rankPct = next ? clamp((totalXP - prevXP) / span, 0, 1) : 1;
  const toNext = next ? Math.max(0, next.xp - totalXP) : 0;
  const earnedCount = BADGES.filter((b) => isEarned(b, stats)).length;
  const badgeW = (width - 32 - 2 * BADGE_GAP) / 3;

  // Centre the spine on the current rank shortly after opening.
  const onSpineLayout = () => {
    requestAnimationFrame(() => {
      spineRef.current?.scrollTo({ y: Math.max(0, index * ROW_H - 90), animated: false });
    });
  };

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
                  <Text style={[styles.tabText, tab === 'badges' && styles.tabTextOn]}>Badges ({BADGES.length})</Text>
                </Pressable>
              </View>

              {tab === 'ranks' ? (
                <>
                  {/* HERO — the current rank as a credential */}
                  <View style={styles.hero}>
                    <RankSeal glyph={current.glyph} state="current" size={104} progress={rankPct} />
                    <View style={styles.heroText}>
                      <Text style={styles.heroKicker}>RANK {current.id} · {toRoman(current.id)}</Text>
                      <Text style={styles.heroName}>{current.name}</Text>
                      <Text style={styles.heroCircle}>{circleForRank(current.id).name}</Text>
                      <View style={styles.heroBarRow}>
                        <View style={styles.heroTrack}>
                          <View style={[styles.heroFill, { width: `${Math.round(rankPct * 100)}%` }]} />
                        </View>
                      </View>
                      <Text style={styles.heroToNext}>
                        {pending
                          ? `Finish a lesson to reach ${next?.name ?? 'the next rank'}`
                          : next
                            ? `${toNext.toLocaleString()} XP to ${next.name}`
                            : 'Highest rank attained'}
                      </Text>
                    </View>
                  </View>

                  {/* THE CLIMB — this band only, day by day.
                      The full ladder is still below, because a chart of the
                      current band answers "how am I doing" and the ladder answers
                      "what is coming", and dropping one for the other would trade
                      a real question for another real question. */}
                  <View style={styles.climbWrap}>
                    <RankClimbChart
                      rankIndex={index}
                      totalXP={totalXP}
                      xpByDay={xpByDay}
                      width={width - 32}
                    />
                  </View>

                  <Text style={styles.spineHint}>THE WHOLE LADDER · TAP A SEAL</Text>

                  {/* SPINE — all 25 seals, connected, climbed below → locked above */}
                  <ScrollView
                    ref={spineRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.spine}
                    showsVerticalScrollIndicator={false}
                    onLayout={onSpineLayout}
                  >
                    {RANKS.map((r, i) => {
                      const st = stateFor(i, index);
                      const isNext = i === index + 1;
                      return (
                        <Pressable key={r.id} onPress={() => setSelected(r)} style={styles.row}>
                          {/* connector rule */}
                          <View style={styles.gutter}>
                            {i > 0 && (
                              <View style={[styles.connector, styles.connTop, { backgroundColor: i <= index ? Ink : InkFaint }]} />
                            )}
                            {i < RANKS.length - 1 && (
                              <View style={[styles.connector, styles.connBot, { backgroundColor: i < index ? Ink : InkFaint }]} />
                            )}
                            <RankSeal glyph={r.glyph} state={st} size={54} />
                          </View>

                          <View style={styles.rowText}>
                            <Text style={[styles.rowName, st === 'locked' && { color: Lock }]} numberOfLines={1}>
                              {r.name}
                            </Text>
                            <Text style={[styles.rowXp, st === 'locked' && { color: Lock }]}>
                              {r.xp.toLocaleString()} XP
                            </Text>
                          </View>

                          {st === 'current' && <Text style={styles.tagCurrent}>YOU ARE HERE</Text>}
                          {st === 'earned' && <Text style={styles.tagDone}>✓ ACHIEVED</Text>}
                          {isNext && <Text style={styles.tagNext}>NEXT</Text>}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </>
              ) : (
                <>
                  {/* A struck count, and how much of the case is filled. */}
                  <View style={styles.caseHead}>
                    <Text style={styles.caseCount}>
                      {earnedCount}
                      <Text style={styles.caseOf}> / {BADGES.length}</Text>
                    </Text>
                    <View style={styles.caseBarWrap}>
                      <Text style={styles.caseLabel}>STRUCK</Text>
                      <View style={styles.caseTrack}>
                        <View style={[styles.caseFill, { width: `${(earnedCount / BADGES.length) * 100}%` }]} />
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
                  <BadgeDetail badge={selectedBadge} stats={stats} onBack={() => setSelectedBadge(null)} />
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

  let progress: number | null = null;
  let statusLine = '';
  if (st === 'current') {
    const p = rankProgress(currentIndex, totalXP);
    progress = p.pct;
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
        <RankSeal glyph={rank.glyph} state={st} size={168} progress={progress} />
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

  // hero
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 8,
    padding: 14,
    backgroundColor: Paper,
  },
  heroText: { flex: 1, marginLeft: 14 },
  heroKicker: { fontFamily: 'Inter_700Bold', fontSize: 9, color: InkSoft, letterSpacing: 1.6 },
  heroName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: Ink, marginTop: 1 },
  heroCircle: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12, color: InkSoft, marginTop: 1 },
  heroBarRow: { marginTop: 9 },
  heroTrack: { height: 7, borderRadius: 4, backgroundColor: Track, overflow: 'hidden' },
  heroFill: { height: 7, borderRadius: 4, backgroundColor: Ink },
  heroToNext: { fontFamily: 'Inter_500Medium', fontSize: 10.5, color: InkSoft, marginTop: 6 },

  climbWrap: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 2 },
  spineHint: { fontFamily: 'Inter_700Bold', fontSize: 9, color: InkSoft, letterSpacing: 2, marginTop: 18, marginBottom: 4 },

  // spine
  spine: { paddingBottom: 36 },
  row: { flexDirection: 'row', alignItems: 'center', height: ROW_H },
  gutter: { width: 64, height: ROW_H, alignItems: 'center', justifyContent: 'center' },
  connector: { position: 'absolute', left: 31, width: 2 },
  connTop: { top: 0, height: ROW_H / 2 },
  connBot: { bottom: 0, height: ROW_H / 2 },
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
