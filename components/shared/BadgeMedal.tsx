import { memo, useId } from 'react';
import React from 'react';
import { View } from 'react-native';
import Svg, { G } from 'react-native-svg';
import Animated, { useAnimatedProps, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { type GlyphName } from './Glyph';
import { InsigniaNodes, StruckMark } from './InsigniaParts';
import { LOCKED, badgeArt, tonesOf, type BadgeArt } from './insigniaArt';
import { TIER_ORDER, ORDER } from '@/constants/insignia';
import type { BadgeFamily, BadgeTier } from '@/data/badges';

// ─────────────────────────────────────────────────────────────────────────────
// A BADGE IS A STRUCK CREST, AND ITS SHAPE SAYS WHAT IT WAS FOR.
//
//   stele      lessons finished     an arched standing stone
//   pennant    the habit            a flag, swallow-tailed
//   roundel    thinkers met         a portrait medal
//   ex-libris  quotes kept          a book label, corners clipped
//   coin       the long road (XP)   a struck octagon
//   shield     mastery              a shield
//
// THE SIX SHAPES ARE THE POINT AND THEY STAY. A grid of fifty identical shields
// says nothing at a glance, and the research names "every badge the same circle
// with a different glyph" as the most generic look in the genre.
//
// FIVE TIERS, FIVE OBJECTS, struck in the rank ladder's own materials (iron,
// bronze, jade, crimson, aurum) so one colour means one thing in both cabinets:
//
//   I    the medal alone
//   II   + a ribbon banner across its foot
//   III  + a laurel, open
//   IV   + the laurel grown, and three stars over the crown
//   V    + a fanned glory of light behind everything, and two glints
//
// EVERY ADDITION IS OUTSIDE THE MEDAL. Crossed swords were tried first and died
// because the medal covered the crossing ("horns at 168px, mush at 66"); a
// wreath closed over the crown died for the same reason years later — eight of
// its leaves were behind a medal, so tier IV wore the SMALLER wreath. The part of
// a flourish behind the medal is not subtle, it is absent.
// scripts/validate-badges.mjs measures that on every run.
//
// ── WHY IT LOOKS THE WAY IT DOES NOW ─────────────────────────────────────────
//
// "really flat, really boring … you can just tell it's all AI drawn … not
// gamified." The owner chose the GAME CREST from three researched directions:
// a thick outline, a lip for thickness, a bright rim, a recessed face, glare, a
// heavy mark, metal leaves with an edge rather than ink outlines on paper. All
// of it is built in insigniaArt.ts, which scripts/sheet-badges.mjs draws in
// plain Node — it is the same code, so the sheet cannot flatter the phone.
//
// LOCKED IS FLAT AND COOL, with no furniture: the ornament arrives when it is
// won, so a locked tier-III badge never carries more than a locked tier-I one.
//
// THE MEDAL CAN STRIKE ITSELF. Pass `draw` and it lands the way a die does —
// in from slightly large, the furniture arriving once it is down — which is
// what the lesson reward screen uses. `reveal` brings the mark in after it.
// ─────────────────────────────────────────────────────────────────────────────

const AG = Animated.createAnimatedComponent(G);

interface Props {
  family: BadgeFamily;
  tier: BadgeTier;
  glyph: GlyphName;
  earned: boolean;
  size?: number;
  /** 0..1 — the medal landing. Omit for a finished medal. */
  draw?: SharedValue<number> | null;
  /** 0..1 — the mark's own arrival, once the medal is down. */
  reveal?: SharedValue<number> | null;
}

// Pure geometry, built once per variant: sixty-odd medals can be on screen at
// once and none of them ever changes.
const ART = new Map<string, BadgeArt>();
function artFor(family: BadgeFamily, tier: BadgeTier, earned: boolean): BadgeArt {
  const k = `${family}:${tier}:${earned ? 1 : 0}`;
  let a = ART.get(k);
  if (!a) {
    const t = Math.max(1, Math.min(TIER_ORDER.length, tier));
    a = badgeArt(family, t, earned ? tonesOf(ORDER[TIER_ORDER[t - 1]]) : LOCKED);
    ART.set(k, a);
  }
  return a;
}

const clamp = (v: number) => {
  'worklet';
  return Math.max(0, Math.min(1, v));
};

// MEMOISED. Every prop below is a primitive (the two shared values are stable
// refs), so the comparison is exact.
export default memo(function BadgeMedal({
  family, tier, glyph, earned, size = 72, draw = null, reveal = null,
}: Props) {
  const art = artFor(family, tier, earned);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  // The strike: in from 1.14× and transparent, down onto the page over the
  // first half of the draw. Scale lives on the wrapper so the mark rides it.
  const strike = useAnimatedStyle(() => {
    if (!draw) return { opacity: 1, transform: [{ scale: 1 }] };
    const v = clamp(draw.value / 0.55);
    const eased = 1 - (1 - v) * (1 - v);
    return { opacity: clamp(draw.value / 0.3), transform: [{ scale: 1.14 - 0.14 * eased }] };
  });
  // The furniture follows the medal rather than racing it.
  const furnish = useAnimatedProps(() => ({
    opacity: draw ? clamp((draw.value - 0.55) / 0.45) : 1,
  }));
  const markStyle = useAnimatedStyle(() => {
    const v = reveal ? reveal.value : 1;
    return { opacity: v, transform: [{ scale: 0.86 + 0.14 * v }] };
  });

  return (
    <Animated.View style={[{ width: size, height: size }, strike]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        {art.back.length > 0 && (
          <AG animatedProps={furnish}>
            <InsigniaNodes nodes={art.back} id={`${uid}b`} />
          </AG>
        )}
        <InsigniaNodes nodes={art.medal} id={`${uid}m`} />
        {art.front.length > 0 && (
          <AG animatedProps={furnish}>
            <InsigniaNodes nodes={art.front} id={`${uid}f`} />
          </AG>
        )}
      </Svg>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size, zIndex: 1 }, markStyle]} pointerEvents="none">
        <StruckMark glyph={glyph} mark={art.mark} size={size} />
      </Animated.View>
    </Animated.View>
  );
});
