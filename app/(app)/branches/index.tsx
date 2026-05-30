import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line } from 'react-native-svg';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import { getBranchBySlug } from '@/data';

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Rule = '#ECEAE2';
const Tag = '#EAE7DF';

const SW = Dimensions.get('window').width;
const SH = Dimensions.get('window').height;
const CARD_W = (SW - 40 - 24) / 3; // 20px page padding each side, two 12px gaps

interface BranchCardInfo {
  slug: string;
  name: string;
  desc: string;
  tag: string;
  icon: SketchIconName;
}

// Presentation order + copy taken from the Learn mockup. Each maps to a real
// branch slug for navigation.
const BRANCHES: BranchCardInfo[] = [
  { slug: 'metaphysics', name: 'METAPHYSICS', desc: 'The nature of reality & existence', tag: 'REALITY', icon: 'spiral' },
  { slug: 'epistemology', name: 'EPISTEMOLOGY', desc: 'The study of knowledge & truth', tag: 'KNOWLEDGE', icon: 'eye' },
  { slug: 'ethics', name: 'ETHICS', desc: 'Morality, virtue & right action', tag: 'MORALITY', icon: 'scales' },
  { slug: 'logic', name: 'LOGIC', desc: 'Reason, argument & inference', tag: 'REASONING', icon: 'logic' },
  { slug: 'aesthetics', name: 'AESTHETICS', desc: 'Beauty, art & perception', tag: 'BEAUTY', icon: 'palette' },
  { slug: 'political-philosophy', name: 'POLITICS', desc: 'Power, justice & society', tag: 'SOCIETY', icon: 'building' },
];

// Faint ruled paper + corner brackets framing the page (fixed, non-scrolling).
function PageFrame() {
  const lines: number[] = [];
  for (let y = 70; y < SH; y += 34) lines.push(y);
  const inset = 9;
  const leg = 30;
  return (
    <Svg width={SW} height={SH} style={StyleSheet.absoluteFill} pointerEvents="none">
      {lines.map((y) => (
        <Line key={y} x1={0} y1={y} x2={SW} y2={y} stroke={Rule} strokeWidth={1} />
      ))}
      <Path d={`M ${inset} ${inset + leg} L ${inset} ${inset} L ${inset + leg} ${inset}`} {...frameStroke} />
      <Path d={`M ${SW - inset - leg} ${inset} L ${SW - inset} ${inset} L ${SW - inset} ${inset + leg}`} {...frameStroke} />
      <Path d={`M ${inset} ${SH - inset - leg} L ${inset} ${SH - inset} L ${inset + leg} ${SH - inset}`} {...frameStroke} />
      <Path
        d={`M ${SW - inset - leg} ${SH - inset} L ${SW - inset} ${SH - inset} L ${SW - inset} ${SH - inset - leg}`}
        {...frameStroke}
      />
    </Svg>
  );
}
const frameStroke = {
  stroke: Ink,
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
};

export default function LearnScreen() {
  function open(slug: string) {
    if (getBranchBySlug(slug)) router.push(`/(app)/branches/${slug}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <PageFrame />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Masthead */}
        <Text style={styles.kicker}>THE STUDY OF WISDOM</Text>
        <Text style={styles.title}>LEARN</Text>
        <View style={styles.underline} />

        <View style={styles.divider}>
          <View style={styles.divLine} />
          <Text style={styles.diamonds}>◇   ◦   ◇</Text>
          <View style={styles.divLine} />
        </View>

        {/* Branch grid */}
        <View style={styles.grid}>
          {BRANCHES.map((b) => (
            <Pressable
              key={b.slug}
              onPress={() => open(b.slug)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={styles.iconBox}>
                <SketchIcon name={b.icon} size={22} color={Ink} />
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {b.name}
              </Text>
              <Text style={styles.desc} numberOfLines={2}>
                {b.desc}
              </Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{b.tag}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footer}>Choose a branch to begin your inquiry</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Paper },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },

  kicker: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: InkSoft,
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 8,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 40,
    color: Ink,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 8,
  },
  underline: {
    alignSelf: 'center',
    width: 64,
    height: 2,
    backgroundColor: Ink,
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  divLine: { width: 56, height: 1, backgroundColor: InkSoft },
  diamonds: {
    fontSize: 12,
    color: Ink,
    letterSpacing: 3,
    marginHorizontal: 12,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  card: {
    width: CARD_W,
    minHeight: 162,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 2,
    backgroundColor: Paper,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  cardPressed: { backgroundColor: '#F0EFEA' },
  iconBox: {
    width: 46,
    height: 46,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    color: Ink,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  desc: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 11.5,
    color: InkSoft,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  tag: {
    marginTop: 'auto',
    backgroundColor: Tag,
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 8.5,
    color: InkSoft,
    letterSpacing: 1,
  },
  footer: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 14,
    color: InkSoft,
    textAlign: 'center',
    marginTop: 26,
  },
});
