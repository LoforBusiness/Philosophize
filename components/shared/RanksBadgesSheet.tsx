import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import Glyph from './Glyph';
import RankSeal, { type SealState } from './RankSeal';
import { RANKS, awardedRank, type RankDef } from '@/data/ranks';
import { circleForRank, RANK_EPITHETS, toRoman } from '@/data/rankLore';
import { BADGES, type ProgressStats } from '@/data/badges';
import { ALL_BRANCHES } from '@/data';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore } from '@/stores/userDataStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#D9D7CE';
const Track = '#E6E4DC';
const Lock = '#8A93A0';
const RowTint = '#F1EFE7';

const ROW_H = 78;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

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
  const streak = useUserDataStore((s) => s.streak);
  const xp = useUserDataStore((s) => s.totalXP);
  const rankIndex = useUserDataStore((s) => s.rankIndex);

  const { height, width } = useWindowDimensions();
  const H = Math.round(height * 0.82);

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<'ranks' | 'badges'>('ranks');
  const [selected, setSelected] = useState<RankDef | null>(null);
  const spineRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (tabReq) {
      setTab(tabReq);
      setVisible(true);
      setSelected(null);
    }
  }, [tabReq]);

  if (!visible) return null;

  // Progress snapshot (same XP formula as the profile).
  const lessons = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const quotes = savedQuotes.length;
  const philosophers = Object.keys(philosopherViews).length;
  // Just the store's total: saving a quote and meeting a thinker grant real XP now,
  // so adding them again here paid for the same bookmark twice.
  const totalXP = xp;
  const mastery: Record<string, number> = {};
  for (const b of ALL_BRANCHES) {
    const total = b.paths.reduce((acc, p) => acc + p.lessons.length, 0);
    const done = lessonsByBranch[b.slug] ?? 0;
    mastery[b.slug] = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  }
  const stats: ProgressStats = { totalXP, lessons, quotes, philosophers, streak, mastery };

  const { current, next, index, pending } = awardedRank(rankIndex, totalXP);
  const prevXP = current.xp;
  const span = next ? next.xp - prevXP : 1;
  const rankPct = next ? clamp((totalXP - prevXP) / span, 0, 1) : 1;
  const toNext = next ? Math.max(0, next.xp - totalXP) : 0;
  const earnedCount = BADGES.filter((b) => b.earned(stats)).length;

  const badgeCols = clamp(Math.floor((width - 32) / 96), 4, 7);
  const badgeW = (width - 32 - (badgeCols - 1) * 8) / badgeCols;

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

                  <Text style={styles.spineHint}>YOUR ASCENT · TAP A SEAL</Text>

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
                  <Text style={styles.earnedLine}>{earnedCount} of {BADGES.length} badges earned</Text>
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                    {BADGES.map((b) => {
                      const earned = b.earned(stats);
                      return (
                        <View key={b.id} style={[styles.badgeCard, { width: badgeW }, !earned && styles.badgeLocked]}>
                          {earned && <Text style={styles.check}>✓</Text>}
                          <Glyph name={b.glyph} size={22} color={earned ? Ink : InkFaint} />
                          <Text style={[styles.badgeName, { color: earned ? Ink : InkFaint }]} numberOfLines={2}>
                            {b.name}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
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
    const prevXP = rank.xp;
    const span = nextRank ? nextRank.xp - prevXP : 1;
    progress = nextRank ? clamp((totalXP - prevXP) / span, 0, 1) : 1;
    statusLine = nextRank
      ? `${Math.max(0, nextRank.xp - totalXP).toLocaleString()} XP to ${nextRank.name}`
      : 'Highest rank attained';
  } else if (st === 'earned') {
    statusLine = 'Achieved';
  } else {
    statusLine = `${Math.max(0, rank.xp - totalXP).toLocaleString()} XP to unlock`;
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

  earnedLine: { fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft, letterSpacing: 1, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingBottom: 30 },
  badgeCard: {
    minHeight: 92,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    backgroundColor: Paper,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 8,
  },
  badgeLocked: { borderColor: InkFaint, opacity: 0.7 },
  check: { position: 'absolute', top: 5, right: 7, fontFamily: 'Inter_700Bold', fontSize: 10, color: Ink },
  badgeName: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.3, textAlign: 'center' },

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
