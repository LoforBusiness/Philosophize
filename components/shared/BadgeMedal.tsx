import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Path, Ellipse, ClipPath, Defs, G, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Glyph, { type GlyphName } from './Glyph';
import {
  SHAPE, LEN, GLYPH_SCALE, GLYPH_DY, INNER,
  ribbonPaths, laurelSprig, MEDAL_SCALE, MEDAL_DY,
} from './badgeShapes';
import {
  INK, GHOST, PAPER, PAPER_SHADE, FAINT, MID, LIGHT, FACE, RIM, LOCKED_FACE, SHADOW, type Stops,
} from './tone';
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
// THE SIX SHAPES ARE THE POINT AND THEY STAY. It was tempting to make all fifty
// heraldic shields — it is the more unified look — but a grid of fifty shields
// distinguished only by a small mark inside says nothing at a glance, and the
// whole reason the shapes exist is to be readable at a glance.
//
// ── TIER MOVED FROM THE EDGE TO THE FLOURISH ────────────────────────────────
//
// Tier used to be edge weight: I a hairline, II an inner rule, III a hatched band
// between them. It worked and it was legible, but the hatch is a lot of ink at
// 28px and it fights the tonal face below. So tier is now HERALDIC:
//
//   I    the medal alone
//   II   + a ribbon banner beneath
//   III  + a laurel wreath around it
//
// It was CROSSED SWORDS at III first, since that is what the heraldic reference
// uses, and a contact sheet killed them: the medal covers the crossing, so all
// that shows is two tips above and two hilts below — horns at 168px, mush at the
// 66px the grid actually draws. The laurel is a continuous curved mass, so being
// half-covered costs it nothing, and a wreath is what a philosopher is crowned
// with. `swordPaths` is kept in badgeShapes, so going back is one line.
//
// The inner rule survives at exactly its old inset, because that inset is what
// scripts/validate-badges.mjs measures the mark's clearance against — changing
// the look must not quietly change the geometry the checker is checking.
//
// ── EVERY MEDAL IS STRUCK AT THE SAME SIZE ──────────────────────────────────
//
// The flourish needs room, so the medal is drawn at MEDAL_SCALE inside the box —
// AT EVERY TIER, including tier I where the margin is simply empty. Scaling the
// medal down only when a flourish appears would make a tier-III badge smaller
// than a tier-I one, which is backwards; scaling it per tier would make the grid
// jump between rows.
//
// ── TONE, NOT COLOUR (§19) ──────────────────────────────────────────────────
//
// Everything comes from tone.ts: ink, grey, and the warm paper the app is
// printed on, lit from the top left like every other struck thing. Bronze /
// silver / gold is still not available and still would not be used — tier is in
// the flourish, where it can be read rather than compared.
//
// LOCKED IS FLAT AND COOL. No gradient, no shadow, no flourish: the ornament
// arrives when it is won, so a locked tier-III badge never carries more ink than
// a locked tier-I one.
//
// THE OUTLINE CAN DRAW ITSELF. Pass `draw` and the stroke runs on from nothing,
// which is what the lesson reward screen uses. `LEN` per family is the outline's
// length with ~6% slack: undershooting would leave part of the shape already
// visible on the first frame, which is the one error that reads as a bug.
// ─────────────────────────────────────────────────────────────────────────────

const APath = Animated.createAnimatedComponent(Path);
const AG = Animated.createAnimatedComponent(G);

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

const grad = (id: string, stops: Stops) => (
  <LinearGradient id={id} x1={LIGHT.x1} y1={LIGHT.y1} x2={LIGHT.x2} y2={LIGHT.y2}>
    {stops.map(([o, c, op], k) => (
      <Stop key={k} offset={o} stopColor={c} stopOpacity={op} />
    ))}
  </LinearGradient>
);

// The furniture, in the OUTER box — the medal is inset to leave room for it.
const RIBBON = ribbonPaths(84, 34, 13);
const LAUREL = [laurelSprig(-1), laurelSprig(1)];

export default function BadgeMedal({
  family, tier, glyph, earned, size = 72, draw = null, reveal = null,
}: Props) {
  const ink = earned ? INK : GHOST;
  const len = LEN[family];
  const outer = SHAPE[family](0);
  const inner = tier > 1 ? SHAPE[family](INNER[tier]) : null;
  // The ornament arrives when it is won — see the locked note above.
  const ribbon = tier >= 2 && earned;
  const wreath = tier === 3 && earned;

  // Per-instance, following the rule LoudnessChart wrote down: ClipPath and
  // gradient ids live in a global-ish namespace and two mounted at once must not
  // fight over the same `url(#…)`. Fifty medals in the badge case is exactly that
  // situation. useId embeds ':', which is not a legal id, so strip non-alphanumerics.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clipId = `bc${uid}`, face = `bf${uid}`, rim = `br${uid}`;

  const outlineProps = useAnimatedProps(() => ({
    strokeDashoffset: draw ? (1 - draw.value) * len : 0,
  }));
  // The inner rule and the flourish follow the outline rather than racing it:
  // they start once the outer is most of the way round, so the edge reads as one
  // gesture and the ornament lands on a finished medal.
  const innerProps = useAnimatedProps(() => ({
    opacity: draw ? Math.max(0, Math.min(1, (draw.value - 0.55) / 0.45)) : 1,
  }));
  // The nudge lives INSIDE the animated style on purpose: two `transform` keys in
  // one style array do not merge, the later one replaces the earlier, so a static
  // translateY beside an animated scale is silently dropped.
  //
  // Both terms carry the medal's inset: the mark rides the medal, so when the
  // medal moved up and shrank to make room for the ribbon, the mark had to as well.
  const dy = size * (GLYPH_DY[family] * MEDAL_SCALE + MEDAL_DY / 100);
  const markStyle = useAnimatedStyle(() => {
    const v = reveal ? reveal.value : 1;
    return { opacity: v, transform: [{ translateY: dy }, { scale: 0.86 + 0.14 * v }] };
  });

  const inset = `translate(${50 - 50 * MEDAL_SCALE} ${50 - 50 * MEDAL_SCALE + MEDAL_DY}) scale(${MEDAL_SCALE})`;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          <ClipPath id={clipId}><Path d={outer} /></ClipPath>
          {grad(face, earned ? FACE : LOCKED_FACE)}
          {grad(rim, earned ? RIM : [['0%', GHOST, 1], ['100%', GHOST, 1]])}
        </Defs>

        {/* THE LAUREL, behind everything — tier III.
            Crossed swords were drawn first, because that is what the heraldic
            reference uses, and they were rejected on the evidence: at 168px the
            medal covers the crossing so only the tips and hilts show, which reads
            as horns above and blobs below, and at the 66px of the badge grid it
            is mush. A laurel is a continuous curved mass, so being half-covered
            costs it nothing — and it is what a philosopher is crowned with.
            `swordPaths` is kept in badgeShapes so the choice is one line. */}
        {wreath && (
          <AG animatedProps={innerProps}>
            {LAUREL.map((sprig, s) => (
              <G key={s}>
                <Path d={sprig.stem} fill="none" stroke={ink} strokeWidth={2} strokeLinecap="round" />
                {sprig.leaf.map((l, k) => (
                  <Ellipse
                    key={k}
                    cx={l.cx} cy={l.cy} rx={l.rx} ry={l.ry}
                    transform={`rotate(${l.rot.toFixed(1)} ${l.cx.toFixed(2)} ${l.cy.toFixed(2)})`}
                    fill={PAPER}
                    stroke={ink}
                    strokeWidth={1.3}
                  />
                ))}
              </G>
            ))}
          </AG>
        )}

        {/* THE MEDAL. Inset at every tier — see the note above. */}
        <G transform={inset}>
          {/* It sits ON the page, so it casts. Earned only: a shadow under a flat
              locked shape reads as a mistake rather than as depth. */}
          {earned && (
            <G transform={`translate(${SHADOW.dx} ${SHADOW.dy})`}>
              <Path d={outer} fill={INK} opacity={SHADOW.opacity} />
            </G>
          )}

          <Path d={outer} fill={`url(#${face})`} />

          {inner && (
            <APath
              d={inner}
              stroke={earned ? FAINT : GHOST}
              strokeWidth={1.2}
              fill="none"
              opacity={earned ? 1 : 0.5}
              animatedProps={innerProps}
            />
          )}

          <APath
            d={outer}
            stroke={earned ? `url(#${rim})` : GHOST}
            strokeWidth={tier === 3 ? 2.6 : 2.2}
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={len}
            animatedProps={outlineProps}
          />
        </G>

        {/* THE RIBBON — tier II and III. Over the medal's foot and the swords'
            grips, which is what ties the three into one object rather than three
            stacked ones. Tabs first, so the band overlaps its own folds. */}
        {ribbon && (
          <G>
            <Path d={RIBBON.tabL} fill={PAPER_SHADE} stroke={ink} strokeWidth={1.3} strokeLinejoin="round" />
            <Path d={RIBBON.tabR} fill={PAPER_SHADE} stroke={ink} strokeWidth={1.3} strokeLinejoin="round" />
            <Path d={RIBBON.band} fill={`url(#${face})`} stroke={ink} strokeWidth={1.6} strokeLinejoin="round" />
          </G>
        )}
      </Svg>

      <Animated.View style={markStyle} pointerEvents="none">
        <Glyph name={glyph} size={size * GLYPH_SCALE[family] * MEDAL_SCALE} color={ink} />
      </Animated.View>
    </View>
  );
}
