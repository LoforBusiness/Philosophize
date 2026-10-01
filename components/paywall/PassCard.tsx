import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle, interpolate, Extrapolation, type SharedValue,
} from 'react-native-reanimated';
import { DEEP, TEAL, EMBER, EMBER_INK, SAND, PAPER, PAPER_LIT, INK, MID, mix, FLAT_EDGE } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// THE SCHOLAR'S PASS AS AN OBJECT (2026-10-01).
//
// "The information is good on it, but it's visually not very good … gamify it,
// make it look visually really nice." What the tab lacked was the THING being sold:
// a chart of ticks describes a membership, and a card in your name is one. So the
// Pass is drawn as a member's card — a deep teal band carrying its name and the
// app's own seal, the holder's name on a white face, a strip of ember foil — and
// stamped with where the reader stands: the free days on offer, the days left on a
// trial, or ACTIVE.
//
// Every word on it comes from the caller, which reads the store: nothing here is a
// claim of its own. Views only, no SVG (§19's GPU budget: the tab is always built).
// ─────────────────────────────────────────────────────────────────────────────

export type StampTone = 'offer' | 'active' | 'trial' | 'closed';

const FACE = PAPER_LIT;
const BAND = DEEP;
const BAND_LIT = mix(DEEP, TEAL, 0.55);
const FOIL = EMBER;
const STAMP: Record<StampTone, string> = {
  offer: EMBER_INK,
  trial: EMBER_INK,
  active: TEAL,
  closed: MID,
};

export default function PassCard({ width, name, stamp, tone, play }: {
  width: number;
  name: string;
  stamp: string;
  tone: StampTone;
  /** The tab's arrival driver: the card rises into place and a glint crosses it. */
  play?: SharedValue<number>;
}) {
  const height = Math.round(width / 1.586);
  const k = width / 312;

  const rise = useAnimatedStyle(() => {
    const p = play ? interpolate(play.value, [0, 0.32], [0, 1], Extrapolation.CLAMP) : 1;
    const e = 1 - (1 - p) ** 3;
    return {
      opacity: 0.2 + 0.8 * e,
      transform: [{ translateY: (1 - e) * 26 }, { rotate: `${-2.5 - (1 - e) * 4}deg` }],
    };
  });
  const glint = useAnimatedStyle(() => {
    const p = play ? interpolate(play.value, [0.28, 0.62], [0, 1], Extrapolation.CLAMP) : 1;
    return {
      opacity: p > 0 && p < 1 ? 1 : 0,
      transform: [{ translateX: -width * 0.6 + p * width * 1.6 }, { rotate: '20deg' }],
    };
  });
  const press = useAnimatedStyle(() => {
    const p = play ? interpolate(play.value, [0.5, 0.62, 0.7], [0, 1.12, 1], Extrapolation.CLAMP) : 1;
    return { opacity: p > 0 ? 1 : 0, transform: [{ scale: p === 0 ? 1.4 : 2.12 - p * 1.12 }, { rotate: '-8deg' }] };
  });

  return (
    <Animated.View style={[{ width, height }, rise]} nativeID="pass-card">
      {/* The card's own shadow on the floor, then its lip, then the face. */}
      <View style={[st.lip, { borderRadius: 16 * k }]} />
      <View style={[st.card, { borderRadius: 16 * k }]}>
        <View style={[st.band, { height: height * 0.36, paddingHorizontal: 14 * k }]}>
          <View style={[st.bandLit, { height: height * 0.12 }]} />
          <View style={[st.seal, { width: 40 * k, height: 40 * k, borderRadius: 20 * k }]}>
            <Image source={require('@/assets/images/icon.png')} style={{ width: 34 * k, height: 34 * k, borderRadius: 17 * k }} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 * k }}>
            <Text style={[st.kicker, { fontSize: 8.5 * k }]} numberOfLines={1}>ASHMERE · MEMBER’S CARD</Text>
            <Text style={[st.title, { fontSize: 19 * k }]} numberOfLines={1}>Scholar’s Pass</Text>
          </View>
        </View>

        <View style={[st.body, { paddingHorizontal: 14 * k, paddingTop: 10 * k }]}>
          <Text style={[st.label, { fontSize: 8 * k }]}>HOLDER</Text>
          <Text style={[st.name, { fontSize: 22 * k }]} numberOfLines={1}>{name}</Text>
          <View style={st.rule} />
          <Text style={[st.opens, { fontSize: 8.5 * k }]} numberOfLines={1}>ALL LESSONS · ALL SUBJECTS</Text>
        </View>

        {/* A strip of ember foil down the right-hand edge. */}
        <View style={[st.foil, { right: 22 * k, width: 9 * k }]} />
        <View style={[st.foil, st.foilShade, { right: 22 * k, width: 3 * k }]} />

        <Animated.View style={[st.glint, { height: height * 2, top: -height * 0.5 }, glint]} pointerEvents="none" />
      </View>

      {/* The stamp, struck at an angle over the corner of the face. */}
      <Animated.View
        style={[st.stamp, { borderColor: STAMP[tone], right: 18 * k, bottom: 18 * k, paddingHorizontal: 9 * k }, press]}
        pointerEvents="none"
      >
        <Text style={[st.stampText, { color: STAMP[tone], fontSize: 11 * k }]} numberOfLines={1}>{stamp}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  lip: {
    position: 'absolute', left: 0, right: 0, top: 6, bottom: -6, backgroundColor: mix(DEEP, INK, 0.55),
  },
  card: {
    flex: 1, overflow: 'hidden', backgroundColor: FACE, borderWidth: 2, borderColor: FLAT_EDGE,
  },
  band: { flexDirection: 'row', alignItems: 'center', backgroundColor: BAND },
  bandLit: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: BAND_LIT, opacity: 0.45 },
  seal: {
    backgroundColor: PAPER, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: SAND,
  },
  kicker: { fontFamily: 'Inter_700Bold', letterSpacing: 1.6, color: mix(SAND, PAPER, 0.4) },
  title: { fontFamily: 'PlayfairDisplay_700Bold', color: PAPER, marginTop: 1 },
  body: { flex: 1 },
  label: { fontFamily: 'Inter_700Bold', letterSpacing: 1.8, color: MID },
  name: { fontFamily: 'PlayfairDisplay_700Bold', color: INK, marginTop: 1, marginRight: '30%' },
  rule: { height: 1.5, backgroundColor: FLAT_EDGE, marginTop: 6, marginBottom: 6, marginRight: '34%' },
  opens: { fontFamily: 'Inter_700Bold', letterSpacing: 1, color: mix(DEEP, MID, 0.3), marginRight: '34%' },
  foil: { position: 'absolute', top: 0, bottom: 0, backgroundColor: FOIL },
  foilShade: { backgroundColor: EMBER_INK, opacity: 0.6 },
  glint: { position: 'absolute', left: 0, width: 46, backgroundColor: 'rgba(255,255,255,0.35)' },
  stamp: {
    position: 'absolute', borderWidth: 2.5, borderRadius: 8, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.88)',
  },
  stampText: { fontFamily: 'Inter_700Bold', letterSpacing: 1.6 },
});
