import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Glyph, { type GlyphName } from '@/components/shared/Glyph';
import { ALL_BRANCHES, getBranchBySlug } from '@/data';
import { useUserDataStore } from '@/stores/userDataStore';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Faint = '#9A968C';
const Rule = '#E4E1D9';
const Cream = '#F4F1EA';
const Gold = '#C6A24C';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

interface BranchPres {
  slug: string;
  desc: string;
  glyph: GlyphName;
}

// Display order + short italic descriptions from the Learn mockup. Counts,
// names, and unit lists are pulled from the real curriculum data.
const PRES: BranchPres[] = [
  { slug: 'metaphysics', desc: 'Reality, existence & the nature of being', glyph: 'infinity' },
  { slug: 'epistemology', desc: 'Knowledge, belief, truth & justification', glyph: 'eye' },
  { slug: 'logic', desc: 'Reasoning, arguments & valid thinking', glyph: 'dottarget' },
  { slug: 'ethics', desc: 'Morality, right action & how humans should live', glyph: 'scales' },
  { slug: 'aesthetics', desc: 'Beauty, art, creativity & aesthetic experience', glyph: 'gem' },
  { slug: 'political-philosophy', desc: 'Society, power, justice & political systems', glyph: 'flag' },
];

export default function LearnScreen() {
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);

  const cards = PRES.map((p) => {
    const branch = getBranchBySlug(p.slug);
    const units = branch?.paths ?? [];
    const totalLessons = units.reduce((a, u) => a + u.lessons.length, 0);
    const done = Math.min(lessonsByBranch[p.slug] ?? 0, totalLessons);
    return { ...p, branch, units, totalLessons, done };
  });

  const totBranches = cards.length;
  const totUnits = cards.reduce((a, c) => a + c.units.length, 0);
  const totLessons = cards.reduce((a, c) => a + c.totalLessons, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.brand}>PHILOSOPHIZE · LEARN</Text>
        <Text style={styles.dots}>◆ ◆ ◆</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Dark masthead */}
        <View style={styles.masthead}>
          <Text style={styles.mastKicker}>YOUR LEARNING PATH</Text>
          <Text style={styles.mastTitle}>LEARN</Text>
          <Text style={styles.mastSub}>Six branches of philosophy · Start anywhere</Text>
          <View style={styles.statRow}>
            <Stat value={totBranches} label="BRANCHES" />
            <Stat value={totUnits} label="UNITS" />
            <Stat value={totLessons} label="LESSONS" />
          </View>
        </View>

        {/* Open curriculum note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteDiamond}>◆</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>OPEN CURRICULUM</Text>
            <Text style={styles.noteBody}>Begin any branch. Each unit unlocks in sequence within a branch.</Text>
          </View>
        </View>

        {/* Branch cards */}
        {cards.map((c, i) => {
          if (!c.branch) return null;
          const unitNames = c.units.map((u) => u.name.toUpperCase()).join(' · ');
          const pct = c.totalLessons > 0 ? c.done / c.totalLessons : 0;
          return (
            <Pressable
              key={c.slug}
              onPress={() => router.push(`/(app)/branches/${c.slug}`)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Glyph name={c.glyph} size={26} color={Ink} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.branchKicker}>BRANCH {ROMAN[i]}</Text>
                  <Text style={styles.branchName}>{c.branch.name}</Text>
                  <Text style={styles.branchDesc}>{c.desc}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </View>

              <Text style={styles.unitLine} numberOfLines={1}>
                {c.units.length} UNIT{c.units.length !== 1 ? 'S' : ''} · {unitNames}
              </Text>
              <View style={styles.progRow}>
                <View style={styles.progTrack}>
                  <View style={[styles.progFill, { width: `${Math.round(pct * 100)}%` }]} />
                </View>
                <Text style={styles.progText}>
                  {c.done} / {c.totalLessons}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <Text style={styles.footer}>Choose a branch to begin your inquiry</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Page },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  brand: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, letterSpacing: 2 },
  dots: { fontSize: 9, color: '#C9C5BB', letterSpacing: 2 },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // Masthead
  masthead: {
    backgroundColor: Ink,
    borderRadius: 6,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  mastKicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: Gold, letterSpacing: 4 },
  mastTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 44, color: Cream, letterSpacing: 1, marginTop: 8 },
  mastSub: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: '#A8A49A', marginTop: 8 },
  statRow: { flexDirection: 'row', marginTop: 22, gap: 30 },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: Cream },
  statLabel: { fontFamily: 'Inter_500Medium', fontSize: 9, color: Faint, letterSpacing: 2, marginTop: 3 },

  // Open-curriculum note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 5,
    backgroundColor: Paper,
    padding: 16,
    marginTop: 16,
  },
  noteDiamond: { fontSize: 13, color: Ink, marginTop: 1 },
  noteTitle: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Ink, letterSpacing: 2 },
  noteBody: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: InkSoft, marginTop: 5, lineHeight: 19 },

  // Branch card
  card: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 5,
    backgroundColor: Paper,
    padding: 16,
    marginTop: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  cardPressed: { backgroundColor: '#F4F2EC' },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 48,
    height: 48,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: Faint, letterSpacing: 2 },
  branchName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 21, color: Ink, marginTop: 2 },
  branchDesc: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12.5, color: InkSoft, marginTop: 3, lineHeight: 17 },
  arrow: { fontFamily: 'Inter_400Regular', fontSize: 20, color: Ink, marginLeft: 8 },

  unitLine: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: Faint, letterSpacing: 1, marginTop: 16 },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 9 },
  progTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: Rule, overflow: 'hidden' },
  progFill: { height: 5, borderRadius: 3, backgroundColor: Ink },
  progText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft },

  footer: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 14,
    color: InkSoft,
    textAlign: 'center',
    marginTop: 26,
  },
});
