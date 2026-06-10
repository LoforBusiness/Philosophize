import { useEffect, useState } from 'react';
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
import { RANKS, rankForXP } from '@/data/ranks';
import { BADGES, type ProgressStats } from '@/data/badges';
import { ALL_BRANCHES } from '@/data';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore } from '@/stores/userDataStore';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#D9D7CE';
const Track = '#E6E4DC';
const Gold = '#1A1A1A';
const Lock = '#5B6B86';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export default function RanksBadgesSheet() {
  const tabReq = useUIStore((s) => s.ranksBadgesTab);
  const close = useUIStore((s) => s.closeRanksBadges);

  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const philosopherViews = useUserDataStore((s) => s.philosopherViews);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);
  const streak = useUserDataStore((s) => s.streak);
  const xp = useUserDataStore((s) => s.totalXP);

  const { height, width } = useWindowDimensions();
  const H = Math.round(height * 0.75);

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<'ranks' | 'badges'>('ranks');

  useEffect(() => {
    if (tabReq) {
      setTab(tabReq);
      setVisible(true);
    }
  }, [tabReq]);

  if (!visible) return null;

  // Progress snapshot (same XP formula as the profile).
  const lessons = Object.values(lessonsByBranch).reduce((a, b) => a + b, 0);
  const quotes = savedQuotes.length;
  const philosophers = Object.keys(philosopherViews).length;
  const totalXP = xp + quotes * 10 + philosophers * 5;
  const mastery: Record<string, number> = {};
  for (const b of ALL_BRANCHES) {
    const total = b.paths.reduce((acc, p) => acc + p.lessons.length, 0);
    const done = lessonsByBranch[b.slug] ?? 0;
    mastery[b.slug] = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  }
  const stats: ProgressStats = { totalXP, lessons, quotes, philosophers, streak, mastery };

  const { current, next, index } = rankForXP(totalXP);
  const rankPct = next ? clamp(totalXP / next.xp, 0, 1) : 1;
  const earnedCount = BADGES.filter((b) => b.earned(stats)).length;

  const rankCols = clamp(Math.floor((width - 32) / 112), 3, 6);
  const rankW = (width - 32 - (rankCols - 1) * 10) / rankCols;
  const badgeCols = clamp(Math.floor((width - 32) / 96), 4, 7);
  const badgeW = (width - 32 - (badgeCols - 1) * 8) / badgeCols;

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

              {/* Current rank banner */}
              <View style={styles.banner}>
                <Glyph name={current.glyph} size={30} color={Ink} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.bannerKicker}>CURRENT RANK</Text>
                  <Text style={styles.bannerName}>
                    {current.name} <Text style={styles.bannerRank}>· Rank {current.id}</Text>
                  </Text>
                  <View style={styles.bannerBarRow}>
                    <View style={styles.bannerTrack}>
                      <View style={[styles.bannerFill, { width: `${Math.round(rankPct * 100)}%` }]} />
                    </View>
                    <Text style={styles.bannerXp}>
                      {totalXP.toLocaleString()} / {(next?.xp ?? current.xp).toLocaleString()} XP
                    </Text>
                  </View>
                </View>
              </View>

              {/* Tabs */}
              <View style={styles.tabs}>
                <Pressable onPress={() => setTab('ranks')} style={[styles.tab, tab === 'ranks' && styles.tabOn]}>
                  <Text style={[styles.tabText, tab === 'ranks' && styles.tabTextOn]}>All Ranks ({RANKS.length})</Text>
                </Pressable>
                <Pressable onPress={() => setTab('badges')} style={[styles.tab, tab === 'badges' && styles.tabOn]}>
                  <Text style={[styles.tabText, tab === 'badges' && styles.tabTextOn]}>Badges ({BADGES.length})</Text>
                </Pressable>
              </View>

              {tab === 'badges' && (
                <Text style={styles.earnedLine}>
                  {earnedCount} of {BADGES.length} badges earned
                </Text>
              )}

              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                {tab === 'ranks'
                  ? RANKS.map((r, i) => {
                      const state = i === index ? 'current' : i < index ? 'done' : 'locked';
                      return (
                        <View
                          key={r.id}
                          style={[
                            styles.rankCard,
                            { width: rankW },
                            state === 'current' && styles.rankCurrent,
                            state === 'locked' && styles.rankLocked,
                          ]}
                        >
                          <Text style={[styles.num, state === 'current' && { color: Paper }]}>#{r.id}</Text>
                          <Glyph
                            name={r.glyph}
                            size={24}
                            color={state === 'current' ? Paper : state === 'locked' ? Lock : Ink}
                          />
                          <Text
                            style={[
                              styles.rankName,
                              state === 'current' && { color: Paper },
                              state === 'locked' && { color: Lock },
                            ]}
                            numberOfLines={1}
                          >
                            {r.name}
                          </Text>
                          <Text
                            style={[
                              styles.rankXp,
                              state === 'current' && { color: '#CFCABF' },
                              state === 'locked' && { color: Lock },
                            ]}
                          >
                            {r.xp.toLocaleString()} XP
                          </Text>
                          {state === 'done' && <Text style={styles.statusDone}>✓ ACHIEVED</Text>}
                          {state === 'current' && <Text style={styles.statusCurrent}>CURRENT</Text>}
                        </View>
                      );
                    })
                  : BADGES.map((b) => {
                      const earned = b.earned(stats);
                      return (
                        <View
                          key={b.id}
                          style={[styles.badgeCard, { width: badgeW }, !earned && styles.badgeLocked]}
                        >
                          {earned && <Text style={styles.check}>✓</Text>}
                          <Glyph name={b.glyph} size={22} color={earned ? Ink : InkFaint} />
                          <Text
                            style={[styles.badgeName, earned ? { color: Gold } : { color: InkFaint }]}
                            numberOfLines={2}
                          >
                            {b.name}
                          </Text>
                        </View>
                      );
                    })}
              </ScrollView>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
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

  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Ink, marginTop: 4, marginBottom: 14 },
  titleItalic: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic' },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Ink,
    borderRadius: 6,
    padding: 14,
  },
  bannerKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: InkSoft, letterSpacing: 2 },
  bannerName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18, color: Ink, marginTop: 2 },
  bannerRank: { fontFamily: 'Inter_400Regular', fontSize: 12, color: InkSoft },
  bannerBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  bannerTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: Track, overflow: 'hidden' },
  bannerFill: { height: 7, borderRadius: 4, backgroundColor: Ink },
  bannerXp: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft },

  tabs: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 14 },
  tab: { borderWidth: 1.5, borderColor: Ink, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 8 },
  tabOn: { backgroundColor: Ink },
  tabText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: Ink },
  tabTextOn: { color: Paper },
  earnedLine: { fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft, letterSpacing: 1, marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingBottom: 30 },

  rankCard: {
    minHeight: 104,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    backgroundColor: Paper,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 5,
  },
  rankCurrent: { backgroundColor: Ink, borderColor: Ink },
  rankLocked: { borderColor: InkFaint },
  num: { position: 'absolute', top: 6, right: 7, fontFamily: 'Inter_500Medium', fontSize: 9, color: InkFaint },
  rankName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 12.5, color: Ink, textAlign: 'center', marginTop: 2 },
  rankXp: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft },
  statusDone: { fontFamily: 'Inter_700Bold', fontSize: 8, color: Gold, letterSpacing: 0.5, marginTop: 2 },
  statusCurrent: { fontFamily: 'Inter_700Bold', fontSize: 8, color: '#D7B765', letterSpacing: 1, marginTop: 2 },

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
  check: { position: 'absolute', top: 5, right: 7, fontFamily: 'Inter_700Bold', fontSize: 10, color: Gold },
  badgeName: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 0.3, textAlign: 'center' },
});
