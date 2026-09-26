import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import ThinkerSeal from './ThinkerSeal';
import {
  INK, PAPER_LIT, DEEP, OLIVE, SAGE, TEAL, EMBER, EMBER_LIT, mix,
} from '@/components/shared/tone';
import { LINE, WOOD, WOOD_LIT, WOOD_SHADE, Lit } from '@/components/shared/drawn';
import type { EraKey } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// A THINKER'S SHELF — the top of their profile, drawn as a place (2026-09-26).
//
// The profile opened on a black block with their initial as a giant watermark:
// type about a person, where everything else a reader meets them beside — the
// parlour's bust of Socrates, the lessons' drawn rooms — is a THING. So the
// masthead is a shelf in a study now, on the palette's DEEP teal wall: their bust
// in the middle (the same ThinkerSeal the Thinkers grid draws, large), books
// standing to one side with one leaning against the bust, a stack lying on the
// other with a candle on it. The owner asked for exactly this — "books lying
// against something", "more of the colour palette" — and for the two pale blues to
// be seen less, so the spines are olive, sage, teal and one ember spark, and
// nothing here is the pale cloth or sky blue.
//
// The books are chosen by the thinker's NAME, so each shelf is a little
// different, and all of it is Views (a profile sheet is opened a lot, and §19's
// GPU rule is about area, not about how often).
// ─────────────────────────────────────────────────────────────────────────────

const H = 132;
const SHELF_Y = 108;
const SPINES = [
  OLIVE,
  mix(SAGE, INK, 0.12),
  TEAL,
  mix(SAGE, OLIVE, 0.45),
  mix(OLIVE, INK, 0.3),
  mix(SAGE, PAPER_LIT, 0.2),
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** One upright book: a spine with two bands, standing on the shelf at x. */
function Book({ x, w, h, fill, lean = 0 }: { x: number; w: number; h: number; fill: string; lean?: number }) {
  const band = mix(fill, PAPER_LIT, 0.55);
  return (
    <View
      style={[
        styles.book,
        {
          left: x, top: SHELF_Y - h, width: w, height: h, backgroundColor: fill,
          // Pivoting on its bottom-right corner, so it leans over onto the bust.
          transform: lean ? [{ rotate: `${lean}deg` }] : [],
          transformOrigin: lean ? 'right bottom' : undefined,
        },
      ]}
    >
      <View style={[styles.band, { top: h * 0.14, backgroundColor: band }]} />
      <View style={[styles.band, { bottom: h * 0.14, backgroundColor: band }]} />
    </View>
  );
}

export default memo(function ThinkerShelf({
  name, era, tint, width,
}: { name: string; era: EraKey | null; tint: string; width: number }) {
  const seed = hash(name);
  const pick = (k: number) => SPINES[(seed >>> (k * 3)) % SPINES.length];
  const tall = (k: number) => 44 + ((seed >>> (k * 4 + 1)) % 5) * 5;

  const cx = width / 2;
  const BUST = 92;
  const bustL = cx - BUST / 2;

  // standing books to the left of the bust, the last one leaning on it
  const left = [
    { w: 13, h: tall(0), fill: pick(0) },
    { w: 11, h: tall(1), fill: pick(1) },
    { w: 15, h: tall(2), fill: pick(2) },
  ];
  let x = bustL - 12;
  const standing = left.map((b) => {
    x -= b.w + 2;
    return { ...b, x };
  });
  const leanH = 58;

  // a stack lying to the right, with a candle on it
  const stackX = cx + BUST / 2 + 10;
  const stack = [
    { w: 58, fill: pick(3) },
    { w: 50, fill: pick(4) },
    { w: 54, fill: EMBER },
  ];

  return (
    <View style={{ width, height: H }} pointerEvents="none">
      {standing.map((b, i) => <Book key={i} x={b.x} w={b.w} h={b.h} fill={b.fill} />)}
      {/* the one that fell against the bust */}
      <Book x={bustL - 11} w={12} h={leanH} fill={pick(5)} lean={14} />

      {stack.map((b, i) => (
        <View
          key={i}
          style={[
            styles.lying,
            { left: stackX + (i === 1 ? 5 : i === 2 ? 2 : 0), top: SHELF_Y - 11 * (i + 1), width: b.w, backgroundColor: b.fill },
          ]}
        >
          <View style={styles.pages} />
        </View>
      ))}
      {/* a candle on the stack, its flame the one warm light on the wall */}
      <View style={[styles.candle, { left: stackX + 20, top: SHELF_Y - 33 - 22 }]} />
      <View style={[styles.flameGlow, { left: stackX + 20 - 6, top: SHELF_Y - 33 - 38 }]} />
      <View style={[styles.flame, { left: stackX + 22, top: SHELF_Y - 33 - 33 }]} />

      <View style={{ position: 'absolute', left: bustL, top: SHELF_Y - BUST + 3 }}>
        <ThinkerSeal initial={name.charAt(0)} tint={tint} met size={BUST} era={era} name={name} />
      </View>

      {/* the shelf, and the bracket under each end */}
      <View style={[styles.shelf, { width: width + 8 }]}>
        <Lit w={width + 8} h={12} r={2} color={WOOD_LIT} />
      </View>
      <View style={[styles.bracket, { left: 24 }]} />
      <View style={[styles.bracket, { right: 24 }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  book: {
    position: 'absolute', borderRadius: 2.5, borderWidth: LINE * 0.85, borderColor: INK,
  },
  band: { position: 'absolute', left: 1, right: 1, height: 2.5 },
  lying: {
    position: 'absolute', height: 11, borderRadius: 2.5, borderWidth: LINE * 0.85, borderColor: INK,
  },
  pages: {
    position: 'absolute', right: 1.5, top: 1.5, bottom: 1.5, width: 8, borderRadius: 1.5,
    backgroundColor: PAPER_LIT,
  },
  candle: {
    position: 'absolute', width: 10, height: 22, borderRadius: 2,
    backgroundColor: PAPER_LIT, borderWidth: LINE * 0.8, borderColor: INK,
  },
  flameGlow: {
    position: 'absolute', width: 22, height: 22, borderRadius: 11,
    backgroundColor: EMBER_LIT, opacity: 0.25,
  },
  flame: {
    position: 'absolute', width: 6, height: 10, borderTopLeftRadius: 3, borderTopRightRadius: 3,
    borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: EMBER_LIT,
    borderWidth: 1.2, borderColor: mix(EMBER, INK, 0.3),
  },
  shelf: {
    position: 'absolute', left: -4, top: SHELF_Y, height: 12, borderRadius: 2,
    backgroundColor: WOOD, borderWidth: LINE, borderColor: INK,
    boxShadow: `0px 4px 0px ${mix(DEEP, INK, 0.45)}`,
  },
  bracket: {
    position: 'absolute', top: SHELF_Y + 12, width: 10, height: 14,
    backgroundColor: WOOD_SHADE, borderWidth: LINE * 0.8, borderTopWidth: 0, borderColor: INK,
    borderBottomLeftRadius: 5, borderBottomRightRadius: 5,
  },
});
