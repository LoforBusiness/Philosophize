import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import RankSeal from './RankSeal';
import { INK, MID, PAPER, PAPER_SHADE, FAINT } from './tone';
import type { GlyphName } from './Glyph';

// ─────────────────────────────────────────────────────────────────────────────
// THE PASS.
//
// It is called a Scholar's PASS, so it is drawn as one — an engraved admission
// card with a ruled border, the holder's name and rank on it, and a seal struck
// with the same light the rank pins and badges are struck with (tone.ts, one
// light, top-left, never moved). Buying it should feel like being admitted to
// something rather than starting a subscription, and a ticked-row feature table
// cannot do that in an app whose whole identity is drawn.
//
// ONE COMPONENT, TWO STATES, and that is the point of it. The free tier is
// already a day pass — one admission, daily — so the limit screen shows the SAME
// card in the reader's name with a stamp struck across it, and the paywall shows
// it without one. A reader who has met both has learned the object, so the offer
// needs no explaining: it is visibly the thing they are already holding, minus
// the stamp.
//
// The border is drawn rather than styled. A double-ruled frame with cut corners
// is three or four nested Views with borders and a lot of arithmetic, and it
// still cannot notch a corner; as one path it is exact and scales with the card.
// ─────────────────────────────────────────────────────────────────────────────

export type PassVariant = 'scholar' | 'day';

interface Props {
  variant: PassVariant;
  /** The holder. Falls back to the app's default display name. */
  name: string;
  /** Rank name and glyph, so the card carries what they have actually earned. */
  rank: string;
  glyph: GlyphName;
  /** Lines printed on the card — the entitlements, or the terms of the day pass. */
  lines: string[];
  /** 'USED · 6 AUG' etc. Only the day pass carries one. */
  stamp?: string;
  width: number;
}

/** Corner notch, in points, on a card of this width. */
const NOTCH = 13;

export default function PassCard({ variant, name, rank, glyph, lines, stamp, width }: Props) {
  // 1.62:1 — near enough the golden ratio, and close to a real admission card.
  const height = Math.round(width / 1.34);
  const scholar = variant === 'scholar';

  // The frame: an outer rule with cut corners, and an inner hairline inset from
  // it. Both in one path so the engraving reads as a single struck line.
  const frame = useMemo(() => {
    const w = width, h = height, n = NOTCH;
    const outer =
      `M ${n} 0 L ${w - n} 0 L ${w} ${n} L ${w} ${h - n} L ${w - n} ${h} ` +
      `L ${n} ${h} L 0 ${h - n} L 0 ${n} Z`;
    const i = 7, ni = n - 2;
    const inner =
      `M ${i + ni} ${i} L ${w - i - ni} ${i} L ${w - i} ${i + ni} L ${w - i} ${h - i - ni} ` +
      `L ${w - i - ni} ${h - i} L ${i + ni} ${h - i} L ${i} ${h - i - ni} L ${i} ${i + ni} Z`;
    return { outer, inner };
  }, [width, height]);

  return (
    <View style={[styles.wrap, { width, height }]}>
      {/* The card face. A hair off pure paper so it lifts off the screen behind
          it without introducing a second colour — PAPER_SHADE is the same warm
          ramp the seals are struck from. */}
      <View
        style={[
          styles.face,
          { width, height, backgroundColor: scholar ? PAPER : '#F4F2EC' },
        ]}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={frame.outer} fill="none" stroke={INK} strokeWidth={scholar ? 1.6 : 1.2} />
        <Path d={frame.inner} fill="none" stroke={scholar ? MID : FAINT} strokeWidth={0.9} />
      </Svg>

      <View style={styles.inner}>
        <Text style={styles.kicker}>
          {scholar ? 'ADMIT THE BEARER' : 'ONE LESSON · DAILY'}
        </Text>
        <Text style={[styles.title, !scholar && styles.titleDay]} numberOfLines={1}>
          {scholar ? 'THE SCHOLAR’S PASS' : 'DAY PASS'}
        </Text>

        <View style={styles.rule} />

        <View style={styles.body}>
          <View style={styles.holder}>
            <Text style={styles.holderLabel}>ISSUED TO</Text>
            <Text style={styles.holderName} numberOfLines={1}>{name}</Text>
            <Text style={styles.holderRank} numberOfLines={1}>{rank}</Text>
          </View>
          {/* The seal, struck exactly as the rank pins are. `current` rather than
              `earned` so it carries the lit face — a locked seal is flat and cool
              by design (§19), which is the wrong note on a card being offered. */}
          {/* 0.26, not 0.20. At 68px on a 338 card the mark inside came out at
              30px of thin arcs and read as an EMPTY hexagon — the seal looked
              unstruck. The glyph is sized to 44% of the seal, so the seal has to
              carry it. */}
          <RankSeal glyph={glyph} state={scholar ? 'current' : 'locked'} size={Math.round(width * 0.24)} />
        </View>

        <View style={styles.lines}>
          {lines.map((l) => (
            <Text key={l} style={styles.line} numberOfLines={1}>
              {scholar ? '·  ' : '·  '}{l}
            </Text>
          ))}
        </View>
      </View>

      {/* THE STAMP. Struck across the card at an angle, in the same ink at low
          opacity — a real stamp sits ON the print, so it must not be a clean
          label in a clear space. */}
      {stamp ? (
        <View style={styles.stampWrap} pointerEvents="none">
          <View style={styles.stamp}>
            <Text style={styles.stampText} numberOfLines={1}>{stamp}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center' },
  face: {
    position: 'absolute',
    // A struck object carries one shadow, bottom-right, from the one light
    // top-left. Same direction as every pin and badge (tone.ts SHADOW).
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 9,
    shadowOffset: { width: 1.5, height: 2.5 },
    elevation: 3,
  },
  inner: { flex: 1, paddingHorizontal: 22, paddingTop: 17, paddingBottom: 14 },
  kicker: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8.5,
    letterSpacing: 2.4,
    color: MID,
    textAlign: 'center',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    lineHeight: 27,
    letterSpacing: 1.1,
    color: INK,
    textAlign: 'center',
    marginTop: 5,
    flexShrink: 0,
  },
  titleDay: { fontSize: 18, lineHeight: 25, letterSpacing: 3 },
  rule: { height: 1, backgroundColor: PAPER_SHADE, marginTop: 10, marginBottom: 11, flexShrink: 0 },
  body: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  holder: { flex: 1 },
  holderLabel: { fontFamily: 'Inter_700Bold', fontSize: 7.5, letterSpacing: 1.8, color: MID },
  holderName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, color: INK, marginTop: 2 },
  holderRank: { fontFamily: 'Inter_500Medium', fontSize: 11, color: MID, marginTop: 1 },
  lines: { marginTop: 'auto' },
  line: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: INK, lineHeight: 16.5 },

  stampWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    borderWidth: 2.5,
    borderColor: INK,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    transform: [{ rotate: '-11deg' }],
    opacity: 0.34,
  },
  stampText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: 3,
    color: INK,
  },
});
