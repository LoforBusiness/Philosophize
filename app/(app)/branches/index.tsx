import { View, Text, ScrollView, StyleSheet, ImageBackground, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenTransition from '@/components/shared/ScreenTransition';
import LearnPlate from '@/components/learn/LearnPlate';
import Card from '@/components/ui/Card';
import StatSticker from '@/components/shared/StatSticker';
import { openIntro } from '@/components/professor/openIntro';
import { getBranchBySlug, branchCountsFromUnits } from '@/data';
import { useUserDataStore } from '@/stores/userDataStore';
import { BRANCH } from '@/constants/design';
import { lipOf, mix } from '@/components/shared/tone';
import {
  BRANCH_ART, SCRIM_TOP, SCRIM_MID, SCRIM_DEEP,
  ArtCream, ArtSoft, ArtFaint,
} from '@/constants/branchArt';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

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

const PAD = 20;

/**
 * THE LIBRARY, for the intro card. The same photograph Quick Start rotates through,
 * because a lecture belongs in one — and it is already in the bundle.
 */
const INTRO_ART = require('../../../assets/images/quickstart/03-library.jpg');
/** The display order, shared with the plate's shelf so the two cannot disagree. */
const SLUGS = PRES.map((p) => p.slug);

export default function LearnScreen() {
  const { width: winW } = useWindowDimensions();
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  // THE BRANCHES OPEN AFTER THE PROFESSOR'S INTRO (2026-09-25). Until it has been
  // watched this tab shows one card, the intro, and nothing plays until it is
  // pressed. Home's Quick Start is the other door to the same film.
  const introSeen = useUserDataStore((s) => s.seenProfessorIntro);
  const done = branchCountsFromUnits(lessonsByUnit);
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
        {/* The frontispiece. See components/learn/LearnPlate.tsx -- it was a
            flat black rectangle with three centred lines, and it was the one
            object on this screen with no light on it. */}
        <LearnPlate width={winW - PAD * 2} slugs={SLUGS} />

        {!introSeen ? (
          <Card
            tone="ink"
            pad={0}
            onPress={() => openIntro('learn')}
            style={styles.card}
            containerStyle={styles.cardBox}
            accessibilityLabel="Start the introduction"
          >
            <View nativeID="learn-intro">
              <ImageBackground source={INTRO_ART} style={styles.introBg} imageStyle={styles.cardImg} resizeMode="cover">
                <LinearGradient
                  colors={[SCRIM_TOP, SCRIM_MID, SCRIM_DEEP]}
                  locations={[0, 0.4, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.cardBody}>
                  <Text style={styles.branchKicker}>START HERE</Text>
                  <View style={styles.nameRow}>
                    <Text style={styles.branchName} numberOfLines={1}>Your first lecture</Text>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                  <Text style={styles.branchDesc} numberOfLines={3}>
                    A one-minute introduction from the professor. The six branches open after it.
                  </Text>
                  <View style={styles.introCta}>
                    <Text style={styles.introCtaText}>▶   START THE INTRO</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
          </Card>
        ) : null}

        {/* Branch cards — once the intro has been watched */}
        {introSeen && cards.map((c, i) => {
          if (!c.branch) return null;
          const unitNames = c.units.map((u) => u.name.toUpperCase()).join(' · ');
          return (
            // A PLATE ON A LEDGE OF ITS OWN BRANCH'S COLOUR (2026-09-16). The
            // photograph is the face and the branch hue, a fifth darker, is the
            // solid ledge it sinks onto — the one place on this screen the six
            // colours appear, and only as an edge.
            <Card
              key={c.slug}
              tone="ink"
              pad={0}
              ledge={lipOf(BRANCH[c.slug as keyof typeof BRANCH])}
              onPress={() => router.push(`/(app)/branches/${c.slug}`)}
              style={styles.card}
              containerStyle={styles.cardBox}
              accessibilityLabel={`Open ${c.branch.name}`}
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
                {/* HOW MUCH OF IT IS YOURS, as a count and never as "of 41":
                    a bar measured against the library retreats from a reader
                    every time lessons are added (CLAUDE.md §19). */}
                {done[c.slug] > 0 && (
                  <View style={styles.doneWrap}>
                    <View style={styles.doneLedge} />
                    <View style={styles.done}>
                      <StatSticker name="lessons" size={16} />
                      <Text style={styles.doneText}>
                        {done[c.slug]} DONE
                      </Text>
                    </View>
                  </View>
                )}
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
            </Card>
          );
        })}

        <Text style={styles.footer}>
          {introSeen ? 'Choose a branch to begin your inquiry' : 'Watch the introduction to begin'}
        </Text>
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

  scroll: { paddingHorizontal: PAD, paddingBottom: 40 },

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
  // Card paints the ink face (it shows for the frame before the image decodes),
  // the 2px edge and the ledge; the picture is clipped to the face's corners.
  card: { overflow: 'hidden' },
  cardBox: { marginTop: 14 },
  // width must be stated: an ImageBackground with no width takes the image's own
  // intrinsic width, so the narrow pictures left a bare strip of card down the
  // right-hand side and the wide ones overhung it.
  cardBg: { width: '100%', height: 152, justifyContent: 'flex-end' },
  cardImg: { borderRadius: 14 },
  cardBody: { paddingHorizontal: 16, paddingBottom: 14 },
  introBg: { width: '100%', height: 232, justifyContent: 'flex-end' },
  introCta: {
    alignSelf: 'flex-start', marginTop: 12, backgroundColor: ArtCream, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  introCtaText: { fontFamily: 'Inter_700Bold', fontSize: 12.5, color: Ink, letterSpacing: 1.4 },
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

  // The count in the top-right corner: a small cream pill on its own ledge.
  doneWrap: { position: 'absolute', top: 12, right: 12, paddingBottom: 2 },
  doneLedge: {
    position: 'absolute', left: 0, right: 0, top: 2, bottom: 0,
    borderRadius: 999, backgroundColor: mix(ArtCream, Ink, 0.34),
  },
  done: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: ArtCream, borderRadius: 999,
    paddingLeft: 7, paddingRight: 10, paddingVertical: 3,
  },
  doneText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Ink, letterSpacing: 1 },

  footer: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 14,
    color: InkSoft,
    textAlign: 'center',
    marginTop: 26,
  },
});
