import { memo } from 'react';
import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Glyph, { type GlyphName } from './Glyph';
import {
  INK, GHOST, FAINT, LIGHT, FACE, RIM, LOCKED_FACE, SHADOW, type Stops,
} from './tone';
import { CORE, COLLAR, INNER, frameForDegree, frameGeom } from './rankShapes';
import {
  ORDER, insigniaFace, insigniaRim, finishFor, type OrderName,
} from '@/constants/insignia';

// -----------------------------------------------------------------------------
// A RANK IS A STRUCK PIN. ITS COLOUR IS THE LADDER; ITS SHAPE IS THE RUNG.
//
// -- TWO EARLIER RULES, BOTH HALF RIGHT --------------------------------------
//
// The first said "a pin is ONE frame, repeated exactly, with the mark inside
// doing all the distinguishing". That is a correct rule for a SET and the wrong
// one for a LADDER: a jade hexagon and a clay hexagon are one object in two
// paints, and paint is not an achievement.
//
// The second gave every ORDER its own frame and escalated them all the way up --
// disc, plate, hexagon, gem, shield, crested shield, winged, crowned. It fixed
// the first problem and bought two more, and the reader named both: "it only
// becomes actually complex when the user is really far along", and "the ranks
// that do get more complex ... look like horns and then look as if [they gain]
// wings. I don't want this design at all."
//
// One escalation stretched over forty-eight rungs leaves most readers standing
// in the dull middle of it, and it runs out of edge to work long before it runs
// out of rungs -- so it starts adding limbs. Both faults have one cause.
//
// -- SO: SIX FRAMES, KEYED ON THE DEGREE, RUN AGAIN IN EVERY ORDER -----------
//
// `degree` decides the SHAPE and `order` decides the MATERIAL. Inside a colour
// the pin is worked from a plain disc up to a collared rosette; at the next
// colour it starts plain again in a better metal. Nobody is ever more than three
// ranks from a grander shape, and nothing has to grow a limb in order to be the
// eighth step of anything. rankShapes.ts holds the geometry and the reasoning;
// scripts/sheet-ranks.mjs draws all forty-eight in plain Node so they can be
// LOOKED at (§21), which is where the wings died.
//
// The oldest warning here still stands and is what keeps this honest: ornament
// "so busy at 54px that it fought the glyph it framed". Nothing added is inside
// the mark's room -- `markScale` is flat at 0.37-0.40 across all six frames while
// the drawn area grows by half again.
//
// -- A LOCKED PIN KEEPS ITS SHAPE AND LOSES ITS MATERIAL ---------------------
//
// Both props are passed for locked ranks too, and the shape half matters more
// than it used to: the next pin up the ladder is a visibly different object, so
// a reader can see what the next promotion looks like before earning it. What
// locking takes away is the material -- flat, cool `GHOST`, no gradient, no
// shadow -- because the material is the reward, and "the same pin, dimmer" is
// indistinguishable from a rendering fault.
//
// -- THE RING WAS THE PROGRESS TRACK, AND STILL IS ---------------------------
//
// The arc toward the next rank runs along the pin's OWN edge rather than on a
// second concentric ring. That used to lean on a hexagon's perimeter being
// exactly 6r; a rosette's is not exactly anything, so `frameGeom` flattens each
// frame once and measures it, and hands back an outline that starts at top
// centre so the arc always opens at twelve o'clock.
//
// Geometry lives in a 100x100 viewBox centred on (50,50).
// -----------------------------------------------------------------------------

export type SealState = 'earned' | 'current' | 'locked';

interface Props {
  glyph: GlyphName;
  state: SealState;
  size?: number;
  progress?: number | null; // 0..1, draws the arc toward the next rank
  /**
   * WHICH OF THE EIGHT ORDERS THE PIN BELONGS TO — see constants/insignia.ts.
   *
   * It decides the MATERIAL, and only that. Pass null where there is no rank at
   * all, such as an unbought Scholar's Pass card; a locked rank still has an
   * order and simply has not been struck in it yet.
   */
  order?: OrderName | null;
  /**
   * HOW FAR THROUGH ITS ORDER THE RANK IS, 0–5 — and this is the SHAPE.
   *
   * Six frames, plainest first, run again in every order: disc, hexagon, plate,
   * scallop, gem, rosette. The finish rides the same number — the inner rule,
   * then two, four and six studs, then the capstone's collar — and every step of
   * it lands on the frame's own edge, never inside the mark.
   */
  degree?: number;
}

const grad = (id: string, stops: Stops) => (
  <LinearGradient id={id} x1={LIGHT.x1} y1={LIGHT.y1} x2={LIGHT.x2} y2={LIGHT.y2}>
    {stops.map(([o, c, op], k) => (
      <Stop key={k} offset={o} stopColor={c} stopOpacity={op} />
    ))}
  </LinearGradient>
);

const flat = (hex: string): Stops => [['0%', hex, 1], ['100%', hex, 1]];

// MEMOISED. Every prop below is a primitive, so the comparison is exact and no
// call site can defeat it with a fresh object (the trap Thinkers records for
// ThinkerCard). A struck mark is an <Svg> with gradients — the most expensive
// leaf this app draws — and Profile renders ten of them, none of which change
// when the screen re-renders for an unrelated reason. Measured: see SketchIcon.
export default memo(function RankSeal({
  glyph, state, size = 96, progress = null, order = null, degree = 0,
}: Props) {
  const locked = state === 'locked';
  // A locked pin is unstruck and takes no material, whatever order it is in —
  // the material IS the reward, so handing it out before it is earned spends the
  // only thing this pin has to give. The SHAPE is not the reward; it is the
  // signpost, and it is shown either way.
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

  // THE SHAPE COMES FROM THE DEGREE, NOT THE ORDER. That one line is the whole
  // redesign: complexity cycles inside a colour instead of climbing once across
  // all forty-eight ranks and having to sprout limbs to get there.
  const frame = frameForDegree(degree);
  const geom = frameGeom(frame);

  // useId, because two pins on one screen with the same gradient id would have
  // the second silently adopt the first's fill.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const face = `f${uid}`, rim = `r${uid}`;

  const outer = CORE[frame](0);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          {grad(face, locked ? LOCKED_FACE : ins ? insigniaFace(ins) : FACE)}
          {grad(rim, locked ? flat(GHOST) : ins ? insigniaRim(ins) : RIM)}
        </Defs>

        {/* The pin sits ON the page, so it casts. Earned only: a locked pin is
            drawn flat, and a shadow under a flat shape reads as a mistake. */}
        {!locked && (
          <G transform={`translate(${SHADOW.dx} ${SHADOW.dy})`} opacity={SHADOW.opacity}>
            <Path d={outer} fill={INK} />
          </G>
        )}

        {/* THE CAPSTONE'S COLLAR — a second rule OUTSIDE the edge, and only on
            the sixth rank of an order, so it means "this is as far as this
            material goes" rather than merely "this is a high rank".

            It was six rays off the flat edges first, and on a contact sheet of
            all forty they read as whiskers — stray marks escaping the pin rather
            than an honour added to it, worst on clay and iron where a thin dark
            spoke on a drab face just looks like damage. A rule outside the edge
            is the same idea done as framing: it closes the pin instead of
            fraying it, and it costs one path. */}
        {!locked && fin.collar && (
          <Path
            d={CORE[frame](COLLAR)}
            fill="none"
            // THE MATERIAL'S BODY, NOT ITS RULE — because this ring is the one
            // piece of the pin that is drawn on PAPER rather than on metal, and
            // `rule` is the order's near-white. AURUM's is #FFFFFF outright, so
            // the highest rank in the app wore a white ring on cream paper and
            // there was nothing to see. Jade, lapis, crimson and amethyst were
            // barely better. insignia.ts records the same trap catching a halo
            // before this; that is twice, in the same place, for the same reason.
            stroke={ins ? ins.base : FAINT}
            // 3, not 2, and the arithmetic is the whole argument: a Profile pin
            // is 56px on a 100-unit box, so two units of stroke is one pixel and
            // change. The one mark that says "this is the top of your colour"
            // cannot be the thinnest thing on the pin.
            strokeWidth={3}
            strokeLinejoin="round"
            opacity={0.92}
          />
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
            d={CORE[frame](INNER)}
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

        {/* THE STUDS — two, four, then all six. They used to sit on the
            hexagon's own vertices, which cannot survive a frame that is not a
            hexagon; `frameGeom` casts six rays out of the centre instead and
            stops short of whatever edge it finds, so the same six positions
            exist on a disc, a shield and a winged crest. Straight up and
            straight down are deliberately empty — that is where the progress
            arc opens and closes, and a stud on that seam reads as a fault in
            it. */}
        {!locked && fin.studs > 0 && geom.studs.slice(0, fin.studs).map(([sx, sy], i) => (
          // A rivet, not a dot: the dark seat under it is what makes it sit IN
          // the face rather than float on it, and it is also what keeps a stud
          // legible on the pale orders, where the bright fill alone was
          // invisible against its own lit corner.
          <G key={i}>
            <Circle cx={sx} cy={sy} r={3.5} fill={ins ? ins.rim : INK} opacity={0.55} />
            <Circle cx={sx} cy={sy} r={2.5} fill={ins ? ins.rule : FAINT} />
          </G>
        ))}

        {pct != null && pct > 0 && (
          // `geom.outline` is the frame flattened and rotated to begin at top
          // centre, so a nearly-full band closes at the point it began.
          <Path
            d={geom.outline}
            fill="none"
            stroke={ink}
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${(pct * geom.perimeter).toFixed(2)} ${geom.perimeter.toFixed(2)}`}
          />
        )}
      </Svg>

      {/* The mark, at the room its own frame leaves it — see `markScale` in
          rankShapes.ts, which is nearly flat across the six on purpose.

          THE zIndex IS FOR WEB, and it is not cosmetic there. React Native paints
          siblings in DOM order, so on a device the mark has always sat correctly
          on top of the hexagon above it. CSS does not: a `position: absolute`
          element paints above static in-flow siblings whatever the order, so the
          filled hexagon covered the mark completely and every seal in the app
          rendered as an EMPTY hexagon in a browser — Profile and the Ranks sheet
          included. Harmless on native, and it restores the one channel this
          project can actually look at its own UI through (§21). */}
      <View style={{ zIndex: 1, transform: [{ translateY: geom.markDy * size }] }}>
        <Glyph name={glyph} size={size * geom.markScale} color={ink} />
      </View>
    </View>
  );
});
