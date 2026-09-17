import { memo } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { TabGlyph } from '@/components/shared/TabIcon';
import { INK, PAPER, PAPER_LIT, DEEP, TEAL, OLIVE, SAGE, EMBER, mix } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// A SMALL STICKER BESIDE A NUMBER (2026-09-16).
//
// The owner asked for the counts on Home and Profile to feel like a game's, and
// the reference they pointed at puts a small flat icon beside each figure
// rather than a box round it: "123 days" with a flame, "1200 XP" with a bolt.
// These are drawn in the tab bar's own construction — flat palette fills, one
// hard darker side, one ink outline, one small ember spark — and the book and
// the bust ARE the tab bar's (`TabGlyph`), so a reader who has learned what the
// book means at the bottom of the screen reads it the same way in a count.
//
// Never a box, never a gradient, never an emoji: an emoji is somebody else's
// drawing in full colour, which this app decided against for the thinker seals.
//
// `line` is the outline. On a dark panel it is cream: an ink outline on an ink
// ground is no outline, and the sticker loses the edge that makes it a sticker.
// ─────────────────────────────────────────────────────────────────────────────

export type StickerName = 'lessons' | 'thinkers' | 'quotes' | 'days' | 'xp';

const W = 2.2;
const SHADE_SAGE = mix(SAGE, OLIVE, 0.55);
const LIT_TEAL = mix(TEAL, PAPER, 0.5);

const BUBBLE = 'M5 7.5 H27 C28.1 7.5 29 8.4 29 9.5 V20.5 C29 21.6 28.1 22.5 27 22.5 H14.5 L8.5 27.5 V22.5 H5 C3.9 22.5 3 21.6 3 20.5 V9.5 C3 8.4 3.9 7.5 5 7.5 Z';
const PAGE = 'M7 7 H25 C26.1 7 27 7.9 27 9 V26 C27 27.1 26.1 28 25 28 H7 C5.9 28 5 27.1 5 26 V9 C5 7.9 5.9 7 7 7 Z';
const STAR = 'M16 9.2 L17.9 13.3 L22.4 13.8 L19 16.8 L20 21.2 L16 18.9 L12 21.2 L13 16.8 L9.6 13.8 L14.1 13.3 Z';

function StatSticker({ name, size = 22, line = INK }: { name: StickerName; size?: number; line?: string }) {
  if (name === 'lessons') return <TabGlyph name="learn" size={size} line={line} />;
  if (name === 'thinkers') return <TabGlyph name="thinkers" size={size} line={line} />;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {name === 'quotes' && (
        <>
          <Path d={BUBBLE} fill={SAGE} />
          <Path d="M23 7.5 H27 C28.1 7.5 29 8.4 29 9.5 V20.5 C29 21.6 28.1 22.5 27 22.5 H23 Z" fill={SHADE_SAGE} />
          <Path d={BUBBLE} fill="none" stroke={line} strokeWidth={W} strokeLinejoin="round" />
          {/* two struck quotation marks */}
          <Path
            d="M11 11.6 C12.9 11.6 14.2 13 14.2 14.8 C14.2 17.4 12.8 18.9 10.9 19.6 L10.4 18.5 C11.4 18 12 17.3 12.1 16.6 C10.7 16.5 9.7 15.6 9.7 14.3 C9.7 12.8 10.2 11.6 11 11.6 Z M18.6 11.6 C20.5 11.6 21.8 13 21.8 14.8 C21.8 17.4 20.4 18.9 18.5 19.6 L18 18.5 C19 18 19.6 17.3 19.7 16.6 C18.3 16.5 17.3 15.6 17.3 14.3 C17.3 12.8 17.8 11.6 18.6 11.6 Z"
            fill={DEEP}
          />
        </>
      )}
      {name === 'days' && (
        <>
          <Path d={PAGE} fill={PAPER_LIT} />
          <Path d="M5 9 C5 7.9 5.9 7 7 7 H25 C26.1 7 27 7.9 27 9 V13 H5 Z" fill={TEAL} />
          <Path d="M22 13 H27 V26 C27 27.1 26.1 28 25 28 H22 Z" fill={mix(SAGE, PAPER, 0.35)} />
          <Path d={PAGE} fill="none" stroke={line} strokeWidth={W} strokeLinejoin="round" />
          <Path d="M5 13 H27" stroke={INK} strokeWidth={1.6} />
          <Path d="M11 4.5 V9 M21 4.5 V9" stroke={line} strokeWidth={2.4} strokeLinecap="round" />
          {/* the day, ticked in the spark */}
          <Path d="M10.5 20.2 L14.2 23.6 L21.4 16.4" fill="none" stroke={EMBER} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {name === 'xp' && (
        <>
          <Circle cx={16} cy={16} r={12} fill={TEAL} />
          <Path d="M20.5 5 A12 12 0 0 1 20.5 27 A13.5 13.5 0 0 0 20.5 5 Z" fill={DEEP} />
          <Circle cx={16} cy={16} r={12} fill="none" stroke={line} strokeWidth={W} />
          <Path d="M9.2 11.4 C10.2 9.6 11.8 8.3 13.8 7.7" fill="none" stroke={LIT_TEAL} strokeWidth={1.5} strokeLinecap="round" />
          <Path d={STAR} fill={PAPER_LIT} stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
          <Circle cx={16} cy={16.2} r={1.5} fill={EMBER} />
        </>
      )}
    </Svg>
  );
}

export default memo(StatSticker);
