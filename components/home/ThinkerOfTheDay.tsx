import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import PressableScale from '@/components/shared/PressableScale';
import { ALL_PHILOSOPHERS } from '@/data/philosophers';
import { PHILOSOPHER_FACTS } from '@/data/philosopherFacts';
import { useUIStore } from '@/stores/uiStore';
import { FACE, RIM, LIGHT, SHADOW, INK, FAINT, MID, PAPER } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// A DIFFERENT THINKER EVERY DAY — the one thing on Home that is new content
// rather than a restatement of the reader's own numbers.
//
// It stands where three buttons used to be that went to Learn, Thinkers and
// Stats: all three of which are tabs, permanently on screen sixty dp below. That
// row cost about 100dp to duplicate navigation the reader already had.
//
// ── WHY A STRUCK DISC AND NOT A FACE ────────────────────────────────────────
//
// There are no philosopher portraits. `components/shared/Portrait.tsx` is ONE
// generic stick face — its own comment records that the old set of 25 was
// removed — so drawing "a portrait" here would put the identical face beside
// Aristotle and Nietzsche, which is worse than drawing none. A medallion in the
// tone.ts system solves it for all 223 without needing 223 drawings: it is the
// app's existing vocabulary for a struck object, it is lit from the one light
// that never moves, and an initial is honestly generic in a way a wrong face is
// not.
// ─────────────────────────────────────────────────────────────────────────────

const N = ALL_PHILOSOPHERS.length;

/**
 * A stride that is coprime with the list, so consecutive days land far apart and
 * every thinker comes up exactly once before any repeats.
 *
 * Walking the array in order would give a week of philosophers whose names all
 * start with the same letter, because the list is grouped by era. Picking at
 * random would repeat within a fortnight (birthday problem) and would not be
 * stable across a reinstall. A coprime stride is the only one of the three that
 * is both stable and exhaustive — and it is CHOSEN rather than hardcoded because
 * the roster grows: a stride that happens to divide the new length would visit a
 * short cycle of the same few thinkers forever.
 */
const STRIDE = (() => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  for (const p of [97, 89, 83, 79, 73, 71, 67, 61, 59, 53, 47, 43, 41, 37, 31, 29, 23, 19, 13, 11, 7]) {
    if (p < N && gcd(p, N) === 1) return p;
  }
  return 1;
})();

const SEAL = 54;

/** A struck disc bearing one letter. */
function Seal({ letter }: { letter: string }) {
  return (
    <View style={styles.seal}>
      <Svg width={SEAL} height={SEAL} viewBox="0 0 100 100">
        <Defs>
          <SvgGradient id="tod-face" {...LIGHT}>
            {FACE.map(([o, c, a]) => <Stop key={o} offset={o} stopColor={c} stopOpacity={a} />)}
          </SvgGradient>
          <SvgGradient id="tod-rim" {...LIGHT}>
            {RIM.map(([o, c, a]) => <Stop key={o} offset={o} stopColor={c} stopOpacity={a} />)}
          </SvgGradient>
        </Defs>
        {/* Down and to the right, because the light is up and to the left. */}
        <Circle cx={50 + SHADOW.dx} cy={50 + SHADOW.dy} r={45} fill={INK} opacity={SHADOW.opacity} />
        <Circle cx={50} cy={50} r={45} fill="url(#tod-face)" stroke="url(#tod-rim)" strokeWidth={4} />
        <Circle cx={50} cy={50} r={37} fill="none" stroke={FAINT} strokeWidth={1.5} />
      </Svg>
      {/* The letter is a real <Text>, not <SvgText>: react-native-svg resolves a
          custom fontFamily inconsistently on Android and a silently-substituted
          system serif beside Playfair everywhere else is exactly the kind of
          near-miss nobody spots until it ships. */}
      <Text style={styles.sealLetter} allowFontScaling={false}>{letter}</Text>
    </View>
  );
}

export default function ThinkerOfTheDay({ style }: { style?: object }) {
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);
  const dayNumber = Math.floor(Date.now() / 86_400_000);

  const { who, fact } = useMemo(() => {
    const p = ALL_PHILOSOPHERS[(dayNumber * STRIDE) % N];
    const facts = PHILOSOPHER_FACTS[p.id] ?? [];
    // Only once the whole roster has been round does anyone show a second fact,
    // so the first ~223 days are all first impressions.
    const cycle = Math.floor((dayNumber * STRIDE) / N);
    return { who: p, fact: facts.length ? facts[cycle % facts.length] : p.oneLiner };
  }, [dayNumber]);

  return (
    <PressableScale onPress={() => openPhilosopher(who.id)} containerStyle={style} style={styles.card}>
      <Text style={styles.kicker}>THINKER OF THE DAY</Text>
      <View style={styles.row}>
        <Seal letter={who.name.trim().charAt(0).toUpperCase()} />
        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {who.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {who.lifespan}  ·  {who.era}
          </Text>
          <Text style={styles.fact} numberOfLines={3}>{fact}</Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
    backgroundColor: PAPER,
    paddingTop: 11,
    paddingBottom: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 0,
    shadowOffset: { width: 2, height: 3 },
    elevation: 2,
  },
  kicker: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    color: MID,
    letterSpacing: 2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, marginTop: 10 },

  seal: { width: SEAL, height: SEAL, alignItems: 'center', justifyContent: 'center' },
  sealLetter: {
    position: 'absolute',
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: INK,
    includeFontPadding: false,
  },

  body: { flex: 1 },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 19,
    color: INK,
    includeFontPadding: false,
  },
  meta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: MID,
    letterSpacing: 0.8,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  fact: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 19,
    color: INK,
    marginTop: 8,
  },
});
