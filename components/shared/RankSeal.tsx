import { memo } from 'react';
import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Glyph, { type GlyphName } from './Glyph';
import { hexPath, hexPerimeter, HEX_R, HEX_INNER } from './badgeShapes';
import {
  INK, GHOST, FAINT, PAPER, LIGHT, FACE, RIM, LOCKED_FACE, SHADOW, type Stops,
} from './tone';
import {
  ORDER, insigniaFace, insigniaRim, finishFor, type OrderName,
} from '@/constants/insignia';

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
   * WHICH OF THE EIGHT ORDERS THE PIN IS STRUCK IN — see constants/insignia.ts.
   *
   * This replaced `band`, which was 0/1/2 for bronze/silver/gold across
   * twenty-five ranks. Three materials over a long ladder means eight
   * consecutive promotions return the same one, so eight consecutive pins were
   * the same object with a different mark in it.
   *
   * Omit it and the pin is struck in paper exactly as before, which is what the
   * ranks sheet wants for a rank nobody has reached yet.
   */
  order?: OrderName | null;
  /**
   * HOW FINISHED THE STRIKING IS, 0–4 — the rank's position inside its order.
   *
   * The header above records that escalating ornament was tried once and
   * rejected as "so busy at 54px that it fought the glyph it framed", and that
   * verdict stands for the version it describes: ornament that escalated across
   * all twenty-five ranks, so the top pins carried twenty-five steps of it.
   *
   * This resets every five. No pin is ever more than four steps ornamented, and
   * the steps are studs ON THE HEXAGON'S OWN VERTICES rather than new shapes
   * added around it — so the silhouette never changes and the mark never has to
   * share its space. The fifth rank of an order is its capstone and is the only
   * one that gets rays.
   */
  degree?: number;
}

const PERIM = hexPerimeter(HEX_R);

// WHICH VERTICES GET A STUD FIRST, and it is not 0,1,2,3.
//
// Two studs have to sit OPPOSITE each other or the pin looks knocked askew, and
// four have to make a rectangle rather than a horseshoe. So the order is
// left/right, then top/bottom of those, then the remaining pair — every count is
// symmetric about both axes, which is the only way a partial set reads as
// deliberate.
const STUD_ORDER = [0, 3, 1, 4, 2, 5];

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
export default memo(function RankSeal({
  glyph, state, size = 96, progress = null, order = null, degree = 0,
}: Props) {
  const locked = state === 'locked';
  // A locked pin is unstruck and takes no material, whatever order it would be
  // in — the material IS the reward, so handing it out before it is earned
  // spends the only thing this pin has to give.
  const ins = !locked && order != null ? ORDER[order] : null;
  // THE MARK IS WHITE ON A STRUCK PIN, ink on an unstruck one. Every order's
  // face was fitted so white clears 3:1 on its lit corner (insignia.ts); ink on
  // a crimson or amethyst face would be the one that vanishes.
  const ink = locked ? GHOST : ins ? ins.on : INK;
  const fin = finishFor(degree);
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
          {grad(face, locked ? LOCKED_FACE : ins ? insigniaFace(ins) : FACE)}
          {grad(rim, locked ? [['0%', GHOST, 1], ['100%', GHOST, 1]] : ins ? insigniaRim(ins) : RIM)}
        </Defs>

        {/* The pin sits ON the page, so it casts. Earned only: a locked pin is
            drawn flat, and a shadow under a flat shape reads as a mistake. */}
        {!locked && (
          <G transform={`translate(${SHADOW.dx} ${SHADOW.dy})`}>
            <Path d={outer} fill={INK} opacity={SHADOW.opacity} />
          </G>
        )}

        <Path d={outer} fill={`url(#${face})`} />

        {/* THE INNER RULE — the first step of finish, and the reason a rank 2
            pin already looks different from a rank 1 in the same order.
            `FAINT` is a warm paper grey and disappears on a coloured face, so a
            struck pin uses its order's own `rule` tone: a warm line low on the
            ladder, a near-white one from jade up. That white line is what the
            reader meant by "green with white, red with white". */}
        {(fin.rule || locked) && (
          <Path
            d={inner}
            fill="none"
            stroke={locked ? GHOST : ins ? ins.rule : FAINT}
            strokeWidth={1}
            opacity={locked ? 0.5 : 1}
          />
        )}

        {/* The edge itself — and the progress track when there is an arc. */}
        <Path
          d={outer}
          fill="none"
          stroke={`url(#${rim})`}
          strokeWidth={2.4}
          strokeLinejoin="round"
          opacity={trackOpacity}
        />

        {/* THE STUDS — two, four, then all six of the hexagon's own vertices.
            On the vertices rather than anywhere new, so they read as part of the
            frame being finished rather than as decoration stuck to it, and so
            they can never drift into the mark's space however small the pin is
            drawn. */}
        {!locked && fin.studs > 0 && STUD_ORDER.slice(0, fin.studs).map((i) => {
          const a = (i * Math.PI) / 3;
          const cx = 50 + (HEX_R - HEX_INNER * 1.5) * Math.cos(a);
          const cy = 50 + (HEX_R - HEX_INNER * 1.5) * Math.sin(a);
          // A rivet, not a dot: the dark seat under it is what makes it sit IN
          // the face rather than float on it, and it is also what keeps a stud
          // legible on the pale orders, where the bright fill alone was
          // invisible against its own lit corner.
          return (
            <G key={i}>
              <Circle cx={cx} cy={cy} r={3.5} fill={ins ? ins.rim : INK} opacity={0.55} />
              <Circle cx={cx} cy={cy} r={2.5} fill={ins ? ins.rule : FAINT} />
            </G>
          );
        })}

        {/* THE CAPSTONE'S COLLAR. Only the fifth rank of an order has it, so it
            means "this is as far as this material goes" rather than merely
            "this is a high rank".
            
            This was six rays off the flat edges first, and on a contact sheet of
            all forty they read as whiskers — stray marks escaping the pin rather
            than an honour added to it, worst on clay and iron where a thin dark
            spoke on a drab face just looks like damage. A second rule OUTSIDE
            the edge is the same idea done as framing: it closes the pin instead
            of fraying it, and it costs one path. */}
        {!locked && fin.rays && (
          <Path
            d={hexPath(50, 50, HEX_R + 3.4)}
            fill="none"
            stroke={ins ? ins.rule : FAINT}
            strokeWidth={1.6}
            strokeLinejoin="round"
            opacity={0.9}
          />
        )}

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
