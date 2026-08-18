import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import PressableScale from '@/components/shared/PressableScale';
import SectionHead from '@/components/home/SectionHead';
import { useUIStore } from '@/stores/uiStore';
import { dayNumber, thinkerOfTheDay, factOfTheDay } from '@/lib/utils/thinkerOfDay';
import { FACE, RIM, LIGHT, SHADOW, INK, FAINT, MID } from '@/components/shared/tone';

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

// WHO it is lives in lib/utils/thinkerOfDay, because the Thinkers tab features a
// thinker of the day too and the two must agree. This file only draws it.

const SEAL = 58;

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
  // Memoised on the DAY, not on Date.now() — read raw it recomputes every render.
  const day = dayNumber();
  const who = useMemo(() => thinkerOfTheDay(day), [day]);
  const fact = useMemo(() => factOfTheDay(day), [day]);

  return (
    <View style={style}>
      <SectionHead>THINKER OF THE DAY</SectionHead>
      <PressableScale onPress={() => openPhilosopher(who.id)} style={styles.block}>
        <View style={styles.row}>
          <Seal letter={who.name.trim().charAt(0).toUpperCase()} />
          <View style={styles.body}>
            <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {who.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {who.lifespan}  ·  {who.era}
            </Text>
          </View>
        </View>
        <Text style={styles.fact} numberOfLines={3}>{fact}</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  seal: { width: SEAL, height: SEAL, alignItems: 'center', justifyContent: 'center' },
  sealLetter: {
    position: 'absolute',
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: INK,
    includeFontPadding: false,
  },

  body: { flex: 1 },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 23,
    color: INK,
    includeFontPadding: false,
  },
  meta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: MID,
    letterSpacing: 1.2,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  // ── SET IN INTER, NOT IN PLAYFAIR ITALIC ───────────────────────────────────
  //
  // The reflection directly above this is Playfair italic, and so was this. Two
  // blocks of the same italic book face, one under the other, read as one long
  // quotation broken in half — which is a large part of why the reflection and
  // the thinker looked like the same feature printed twice.
  //
  // They are not the same kind of writing. Up there is somebody's VOICE; this is
  // a note ABOUT somebody. The utility face says so without a word of labelling.
  fact: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    lineHeight: 21,
    color: MID,
    marginTop: 12,
  },
});
