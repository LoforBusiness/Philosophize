import { View, Text, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTransition from '@/components/shared/ScreenTransition';
import PressableScale from '@/components/shared/PressableScale';
import { getBranchBySlug } from '@/data';
import {
  BRANCH_ART, SCRIM_TOP, SCRIM_MID, SCRIM_DEEP,
  ArtCream, ArtSoft, ArtFaint,
} from '@/constants/branchArt';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Rule = '#E4E1D9';
const Cream = '#F4F1EA';
const Gold = '#A8A49A';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

interface BranchPres {
  slug: string;
  desc: string;
}

// Display order + short italic descriptions from the Learn mockup. Counts,
// names, and unit lists are pulled from the real curriculum data. The glyph
// tiles that used to lead each card are gone — the branch's picture identifies
// it now, and a small ink icon on top of a photograph read as clutter.
const PRES: BranchPres[] = [
  { slug: 'metaphysics', desc: 'Reality, existence & the nature of being' },
  { slug: 'epistemology', desc: 'Knowledge, belief, truth & justification' },
  { slug: 'logic', desc: 'Reasoning, arguments & valid thinking' },
  { slug: 'ethics', desc: 'Morality, right action & how humans should live' },
  { slug: 'aesthetics', desc: 'Beauty, art, creativity & aesthetic experience' },
  { slug: 'political-philosophy', desc: 'Society, power, justice & political systems' },
];

export default function LearnScreen() {
  const cards = PRES.map((p) => {
    const branch = getBranchBySlug(p.slug);
    const units = branch?.paths ?? [];
    return { ...p, branch, units };
  });

  return (
    <ScreenTransition bg={Page}>
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.brand}>ASHMERE · LEARN</Text>
        <Text style={styles.dots}>◆ ◆ ◆</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Dark masthead */}
        <View style={styles.masthead}>
          <Text style={styles.mastKicker}>YOUR LEARNING PATH</Text>
          <Text style={styles.mastTitle}>LEARN</Text>
          <Text style={styles.mastSub}>The branches of philosophy · Start anywhere</Text>
        </View>

        {/* Branch cards */}
        {cards.map((c, i) => {
          if (!c.branch) return null;
          const unitNames = c.units.map((u) => u.name.toUpperCase()).join(' · ');
          return (
            <PressableScale
              key={c.slug}
              onPress={() => router.push(`/(app)/branches/${c.slug}`)}
              style={styles.card}
            >
              <ImageBackground
                source={BRANCH_ART[c.slug]}
                style={styles.cardBg}
                imageStyle={styles.cardImg}
                resizeMode="cover"
              >
                {/* Near-clear at the top so the picture reads, near-solid ink by
                    the bottom where every word sits. The words never take their
                    contrast from the art, so a pale picture can't wash them out. */}
                <LinearGradient
                  colors={[SCRIM_TOP, SCRIM_MID, SCRIM_DEEP]}
                  locations={[0, 0.48, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardBody}>
                  <Text style={styles.branchKicker}>BRANCH {ROMAN[i]}</Text>
                  <View style={styles.nameRow}>
                    <Text style={styles.branchName} numberOfLines={1}>
                      {c.branch.name}
                    </Text>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                  <Text style={styles.branchDesc} numberOfLines={2}>
                    {c.desc}
                  </Text>
                  <Text style={styles.unitLine} numberOfLines={1}>
                    {c.units.length} UNIT{c.units.length !== 1 ? 'S' : ''} · {unitNames}
                  </Text>
                </View>
              </ImageBackground>
            </PressableScale>
          );
        })}

        <Text style={styles.footer}>Choose a branch to begin your inquiry</Text>
      </ScrollView>
    </SafeAreaView>
    </ScreenTransition>
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

  // Branch card — the picture IS the card now. Tall enough that a real part of
  // each portrait shows rather than a thin band of sky.
  card: {
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 5,
    backgroundColor: Ink, // shows for the frame before the image decodes
    marginTop: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  // width must be stated: an ImageBackground with no width takes the image's own
  // intrinsic width, so the narrow pictures left a bare strip of card down the
  // right-hand side and the wide ones overhung it.
  cardBg: { width: '100%', height: 152, justifyContent: 'flex-end' },
  cardImg: { borderRadius: 3.5 },
  cardBody: { paddingHorizontal: 16, paddingBottom: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },

  branchKicker: { fontFamily: 'Inter_500Medium', fontSize: 9, color: ArtFaint, letterSpacing: 2 },
  branchName: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: ArtCream,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 7,
  },
  branchDesc: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 12.5,
    color: ArtSoft,
    marginTop: 3,
    lineHeight: 17,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 6,
  },
  arrow: { fontFamily: 'Inter_400Regular', fontSize: 20, color: ArtCream, marginLeft: 8 },

  unitLine: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: ArtFaint, letterSpacing: 1, marginTop: 10 },

  footer: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 14,
    color: InkSoft,
    textAlign: 'center',
    marginTop: 26,
  },
});
