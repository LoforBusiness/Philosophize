import { memo } from 'react';
import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Glyph, { type GlyphName } from './Glyph';
import { hexPath, hexPerimeter, HEX_R, HEX_INNER } from './badgeShapes';
import {
  INK, GHOST, FAINT, PAPER, LIGHT, FACE, RIM, LOCKED_FACE, SHADOW,
  METAL, TIER_METAL, metalFace, metalRim, type Stops,
} from './tone';

// ─────────────────────────────────────────────────────────────────────────────
// A RANK IS A STRUCK HEXAGONAL PIN.
//
// It was a hairline ring around a glyph — correct, restrained, and completely
// inert: at 54px twenty-five of them read as twenty-five small circles, and
// nothing about holding rank 24 looked like more than holding rank 2. Before
// that it was a wax-seal medallion whose ornament escalated by tier, which was
// the opposite failure — so busy at 54px that it fought the glyph it framed.
//
// A pin is the middle: ONE frame, repeated exactly, with the mark inside doing
// all the distinguishing. That is what makes a set feel collectible rather than
// decorative, and it is why the frame does NOT escalate by tier.
//
// ── WHAT IS NEW IS TONE, NOT COLOUR (§19) ───────────────────────────────────
//
// Every value comes from tone.ts: ink, grey, and the warm paper the app is
// already printed on. What a pin has now is a lit side and a shaded side, lit
// from the top left like everything else in the set — and that is the whole of
// why it reads as an object rather than an outline.
//
// LOCKED IS FLAT AND COOL, deliberately. No gradient, no shadow, a slate that
// sits off the warm ramp. "The same pin, dimmer" is indistinguishable from a
// rendering fault; unlit against lit is the reward for earning it.
//
// ── THE RING WAS THE PROGRESS TRACK, AND STILL IS ───────────────────────────
//
// The arc toward the next rank runs along the pin's own edge rather than on a
// second concentric ring, so the frame and the meter are one object. A regular
// hexagon's perimeter is exactly 6r (its side equals its radius), so the
// dasharray is exact — an approximation would leave the arc short of the corner
// it is meant to reach at 100%.
//
// Geometry lives in a 100×100 viewBox centred on (50,50).
// ─────────────────────────────────────────────────────────────────────────────

export type SealState = 'earned' | 'current' | 'locked';

interface Props {
  glyph: GlyphName;
  state: SealState;
  size?: number;
  progress?: number | null; // 0..1, draws the arc toward the next rank
  /**
   * WHICH METAL THE PIN IS STRUCK IN — 0 bronze, 1 silver, 2 gold.
   *
   * Twenty-five ranks in one material is twenty-five identical pins, which is
   * the complaint this component's own header opens with and only half solved:
   * the mark inside changed and nothing else did, so holding rank 24 still
   * looked exactly like holding rank 2. A band of metal every eight ranks is the
   * missing half — the frame does not escalate in ORNAMENT (that was tried and
   * rejected as too busy at 54px), it escalates in MATERIAL, which costs no
   * extra linework at any size.
   *
   * Omit it and the pin is struck in paper exactly as before, so every existing
   * call site is unchanged.
   */
  band?: number | null;
}

const PERIM = hexPerimeter(HEX_R);

const grad = (id: string, stops: Stops) => (
  <LinearGradient id={id} x1={LIGHT.x1} y1={LIGHT.y1} x2={LIGHT.x2} y2={LIGHT.y2}>
    {stops.map(([o, c, op], k) => (
      <Stop key={k} offset={o} stopColor={c} stopOpacity={op} />
    ))}
  </LinearGradient>
);

// MEMOISED. Every prop below is a primitive, so the comparison is exact and no
// call site can defeat it with a fresh object (the trap Thinkers records for
// ThinkerCard). A struck mark is an <Svg> with gradients — the most expensive
// leaf this app draws — and Profile renders ten of them, none of which change
// when the screen re-renders for an unrelated reason. Measured: see SketchIcon.
export default memo(function RankSeal({ glyph, state, size = 96, progress = null, band = null }: Props) {
  const locked = state === 'locked';
  const ink = locked ? GHOST : INK;
  // A locked pin is unstruck and takes no metal, whatever band it would be in —
  // the material IS the reward, so handing it out before it is earned spends the
  // only thing this pin has to give.
  const metal = !locked && band != null ? METAL[TIER_METAL[Math.max(0, Math.min(2, band))]] : null;
  const pct = progress == null ? null : Math.max(0, Math.min(1, progress));
  // With an arc over it the edge becomes a track and steps back; on its own it is
  // the frame and carries full weight.
  const trackOpacity = pct != null ? 0.22 : 1;

  // useId, because two pins on one screen with the same gradient id would have
  // the second silently adopt the first's fill.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const face = `f${uid}`, rim = `r${uid}`;

  const outer = hexPath(50, 50, HEX_R);
  const inner = hexPath(50, 50, HEX_R - HEX_INNER);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          {grad(face, locked ? LOCKED_FACE : metal ? metalFace(metal) : FACE)}
          {grad(rim, locked ? [['0%', GHOST, 1], ['100%', GHOST, 1]] : metal ? metalRim(metal) : RIM)}
        </Defs>

        {/* The pin sits ON the page, so it casts. Earned only: a locked pin is
            drawn flat, and a shadow under a flat shape reads as a mistake. */}
        {!locked && (
          <G transform={`translate(${SHADOW.dx} ${SHADOW.dy})`}>
            <Path d={outer} fill={INK} opacity={SHADOW.opacity} />
          </G>
        )}

        <Path d={outer} fill={`url(#${face})`} />

        {/* The inner rule: a hairline stepped in from the edge, which is what
            gives the rim its width and the pin its turned edge. */}
        {/* On metal the inner rule takes the metal's own lit tone — `FAINT` is a
            warm paper grey and vanishes on gold, which is the band that most
            needs the rule to show. */}
        <Path
          d={inner}
          fill="none"
          stroke={locked ? GHOST : metal ? metal.lit : FAINT}
          strokeWidth={1}
          opacity={locked ? 0.5 : 1}
        />

        {/* The edge itself — and the progress track when there is an arc. */}
        <Path
          d={outer}
          fill="none"
          stroke={`url(#${rim})`}
          strokeWidth={2.4}
          strokeLinejoin="round"
          opacity={trackOpacity}
        />

        {pct != null && pct > 0 && (
          // Starts at the top-left vertex and runs clockwise, so a nearly-full
          // band closes at the point it began rather than mid-edge.
          <Path
            d={outer}
            fill="none"
            stroke={ink}
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${(pct * PERIM).toFixed(2)} ${PERIM.toFixed(2)}`}
            transform="rotate(-60 50 50)"
          />
        )}
      </Svg>

      {/* The mark. Sized to the hexagon's INSCRIBED circle (r·√3/2), not its
          radius — the corners are 15% further out than the flat edges, so sizing
          to the radius would let a wide glyph touch the top and bottom rules.

          THE zIndex IS FOR WEB, and it is not cosmetic there. React Native paints
          siblings in DOM order, so on a device the mark has always sat correctly
          on top of the hexagon above it. CSS does not: a `position: absolute`
          element paints above static in-flow siblings whatever the order, so the
          filled hexagon covered the mark completely and every seal in the app
          rendered as an EMPTY hexagon in a browser — Profile and the Ranks sheet
          included. Harmless on native, and it restores the one channel this
          project can actually look at its own UI through (§21). */}
      <View style={{ zIndex: 1 }}>
        <Glyph name={glyph} size={size * 0.44} color={ink} />
      </View>
    </View>
  );
});
