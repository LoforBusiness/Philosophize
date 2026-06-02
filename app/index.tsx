import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path, Circle, Ellipse, Rect, Defs, Pattern, G } from 'react-native-svg';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const FaceMid = '#E2E0D8';

// One isometric box; (cx,cy) is its top-face center. a = half-width, h = a/2.
function IsoBox({
  cx,
  cy,
  a,
  h,
  ch,
  top,
  left,
  right,
}: {
  cx: number;
  cy: number;
  a: number;
  h: number;
  ch: number;
  top: string;
  left: string;
  right: string;
}) {
  const topP = `M ${cx} ${cy - h} L ${cx + a} ${cy} L ${cx} ${cy + h} L ${cx - a} ${cy} Z`;
  const leftP = `M ${cx - a} ${cy} L ${cx} ${cy + h} L ${cx} ${cy + h + ch} L ${cx - a} ${cy + ch} Z`;
  const rightP = `M ${cx + a} ${cy} L ${cx} ${cy + h} L ${cx} ${cy + h + ch} L ${cx + a} ${cy + ch} Z`;
  return (
    <>
      <Path d={leftP} fill={left} stroke={Ink} strokeWidth={2} strokeLinejoin="round" />
      <Path d={rightP} fill={right} stroke={Ink} strokeWidth={2} strokeLinejoin="round" />
      <Path d={topP} fill={top} stroke={Ink} strokeWidth={2} strokeLinejoin="round" />
    </>
  );
}

// A small line-art laurel wreath; the right branch mirrors the left.
function Laurel() {
  const leaves = [
    { x: 38, y: 50, r: -42 },
    { x: 31, y: 41, r: -34 },
    { x: 25, y: 31, r: -26 },
    { x: 21, y: 22, r: -16 },
    { x: 19, y: 13, r: -6 },
  ];
  const Branch = () => (
    <>
      <Path d="M 41 58 C 27 51 18 36 19 13" stroke={Ink} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <Ellipse
          key={i}
          cx={l.x}
          cy={l.y}
          rx={6}
          ry={3}
          fill={FaceMid}
          stroke={Ink}
          strokeWidth={1}
          transform={`rotate(${l.r} ${l.x} ${l.y})`}
        />
      ))}
    </>
  );
  return (
    <Svg width={84} height={64}>
      <Branch />
      <G transform="translate(84,0) scale(-1,1)">
        <Branch />
      </G>
    </Svg>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function LandingScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        {/* Isometric hero — a stack of books with a knowledge block on top */}
        <View style={styles.hero}>
          <Svg width={240} height={200}>
            <Defs>
              <Pattern id="hd-dots" patternUnits="userSpaceOnUse" width={6} height={6}>
                <Rect x={0} y={0} width={6} height={6} fill={Paper} />
                <Circle cx={3} cy={3} r={1} fill={Ink} />
              </Pattern>
            </Defs>
            {/* books, largest at the bottom */}
            <IsoBox cx={120} cy={150} a={58} h={29} ch={16} top={Paper} left={FaceMid} right="url(#hd-dots)" />
            <IsoBox cx={120} cy={111} a={50} h={25} ch={14} top={Paper} left={FaceMid} right="url(#hd-dots)" />
            <IsoBox cx={120} cy={78} a={42} h={21} ch={12} top={Paper} left={FaceMid} right="url(#hd-dots)" />
            {/* the floating idea-block */}
            <IsoBox cx={120} cy={40} a={17} h={8} ch={18} top={Ink} left="#3A3A3A" right="#555555" />
          </Svg>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Think more clearly,{'\n'}one idea a day</Text>
        <Text style={styles.sub}>
          Bite-size philosophy that turns life's biggest questions into a daily habit.
        </Text>

        {/* Stats strip with a laurel-framed rating */}
        <View style={styles.statsRow}>
          <Stat value="30+" label="lessons" />
          <View style={styles.divider} />
          <View style={styles.laurelStat}>
            <Laurel />
            <Text style={styles.laurelValue}>4.9</Text>
          </View>
          <View style={styles.divider} />
          <Stat value="6" label="branches" />
        </View>

        <View style={{ flex: 1 }} />

        {/* Primary CTA + secondary link */}
        <Pressable
          onPress={() => router.replace('/(app)')}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaText}>Begin</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8} style={styles.signin}>
          <Text style={styles.signinText}>I already have an account</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Page },
  body: { flex: 1, paddingHorizontal: 28, paddingTop: 12, paddingBottom: 24, alignItems: 'center' },
  hero: { marginTop: 8, marginBottom: 8 },

  headline: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    lineHeight: 38,
    color: Ink,
    textAlign: 'center',
  },
  sub: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 21,
    color: InkSoft,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 6,
  },

  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26 },
  stat: { alignItems: 'center', paddingHorizontal: 18 },
  statValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: Ink },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft, marginTop: 2 },
  divider: { width: 1, height: 38, backgroundColor: '#CFCBC1' },
  laurelStat: { width: 84, height: 64, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  laurelValue: { position: 'absolute', fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: Ink },

  cta: {
    width: '100%',
    backgroundColor: Ink,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { fontFamily: 'Inter_700Bold', fontSize: 17, color: Page, letterSpacing: 0.5 },
  signin: { marginTop: 16 },
  signinText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft, textDecorationLine: 'underline' },
});
