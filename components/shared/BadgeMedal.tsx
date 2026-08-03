import React from 'react';
import { View } from 'react-native';
import Svg, { Path, ClipPath, Defs, G, Line } from 'react-native-svg';
import Animated, { useAnimatedProps, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Glyph, { type GlyphName } from './Glyph';
import { SHAPE, LEN, GLYPH_SCALE, GLYPH_DY, INNER } from './badgeShapes';
import type { BadgeFamily, BadgeTier } from '@/data/badges';

// ─────────────────────────────────────────────────────────────────────────────
// A BADGE IS A STRUCK SHAPE, AND THE SHAPE SAYS WHAT IT WAS FOR.
//
// All fifty used to be the same bordered square with a 22px glyph in it, which
// meant the grid carried exactly one piece of information — how many are lit —
// and none at all about what kind of thing any of them was. Six families, six
// silhouettes, so a glance at the grid reads as "I'm strong on reading, thin on
// thinkers" rather than as fifty identical boxes.
//
//   stele      lessons finished     an arched standing stone
//   pennant    days running         a flag, swallow-tailed
//   roundel    thinkers met         a portrait medal
//   ex-libris  quotes kept          a book label, corners clipped
//   coin       the long road (XP)   a struck octagon
//   shield     mastery              a shield
//
// TIER IS IN THE EDGE, NOT IN COLOUR. The app is black and white, so bronze /
// silver / gold is not available and a second hue would break the identity
// (§19). Instead the border earns weight: I is a hairline, II adds an inner
// rule, III fills the band between them with hatching. Because the hatch is
// clipped to the badge's own outline it works on all six shapes without any
// per-shape artwork.
//
// GEOMETRY. Everything is authored in one 100×100 box and every shape is a
// FUNCTION of its inset, so the inner rule is the same outline stepped inward
// rather than a second hand-drawn path that could drift out of register.
//
// THE OUTLINE CAN DRAW ITSELF. Pass `draw` and the stroke runs on from nothing,
// which is what the lesson reward screen uses. `LEN` per family is the outline's
// length with ~6% slack: undershooting would leave part of the shape already
// visible on the first frame, which is the one error that reads as a bug.
// ─────────────────────────────────────────────────────────────────────────────

const INK = '#1A1A1A';
const GHOST = '#AAB1BC'; // locked linework — the same cool slate RankSeal uses
const PAPER = '#FAFAF7';

const APath = Animated.createAnimatedComponent(Path);

interface Props {
  family: BadgeFamily;
  tier: BadgeTier;
  glyph: GlyphName;
  earned: boolean;
  size?: number;
  /** 0..1 — how much of the outline has been drawn. Omit for a finished medal. */
  draw?: SharedValue<number> | null;
  /** 0..1 — the mark's own arrival, once the outline is there. */
  reveal?: SharedValue<number> | null;
}

export default function BadgeMedal({
  family, tier, glyph, earned, size = 72, draw = null, reveal = null,
}: Props) {
  const ink = earned ? INK : GHOST;
  const len = LEN[family];
  const outer = SHAPE[family](0);
  const inner = tier > 1 ? SHAPE[family](INNER[tier]) : null;
  // A hatched ghost is just mud, and it would also mean a locked tier-III badge
  // carried MORE ink than a locked tier-I one. The band arrives when it is won.
  const hatched = tier === 3 && earned;
  const clipId = `bm-${family}-${tier}`;

  const outlineProps = useAnimatedProps(() => ({
    strokeDashoffset: draw ? (1 - draw.value) * len : 0,
  }));
  // The inner rule follows the outline rather than racing it: it starts once the
  // outer is most of the way round, so the edge reads as one gesture.
  const innerProps = useAnimatedProps(() => ({
    opacity: draw ? Math.max(0, Math.min(1, (draw.value - 0.55) / 0.45)) : 1,
  }));
  // The nudge lives INSIDE the animated style on purpose: two `transform` keys in
  // one style array do not merge, the later one replaces the earlier, so a static
  // translateY beside an animated scale is silently dropped.
  const dy = size * GLYPH_DY[family];
  const markStyle = useAnimatedStyle(() => {
    const v = reveal ? reveal.value : 1;
    return { opacity: v, transform: [{ translateY: dy }, { scale: 0.86 + 0.14 * v }] };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          <ClipPath id={clipId}>
            <Path d={outer} />
          </ClipPath>
        </Defs>

        {/* The medal is an object on the page, not a transparent outline. */}
        <Path d={outer} fill={PAPER} />

        {hatched && (
          <>
            <G clipPath={`url(#${clipId})`}>
              {Array.from({ length: 26 }, (_, i) => (
                <Line
                  key={i}
                  x1={-40 + i * 6} y1={-6} x2={-40 + i * 6 + 62} y2={106}
                  stroke={ink} strokeWidth={1.1} opacity={0.5}
                />
              ))}
            </G>
            {/* Paper back over the middle, which is what leaves a hatched BAND. */}
            <Path d={inner!} fill={PAPER} />
          </>
        )}

        {inner && (
          <APath
            d={inner}
            stroke={ink}
            strokeWidth={tier === 3 ? 1.4 : 1.2}
            fill="none"
            animatedProps={innerProps}
          />
        )}

        <APath
          d={outer}
          stroke={ink}
          strokeWidth={tier === 3 ? 2.6 : 2.2}
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={len}
          animatedProps={outlineProps}
        />
      </Svg>

      <Animated.View style={markStyle} pointerEvents="none">
        <Glyph name={glyph} size={size * GLYPH_SCALE[family]} color={ink} />
      </Animated.View>
    </View>
  );
}
