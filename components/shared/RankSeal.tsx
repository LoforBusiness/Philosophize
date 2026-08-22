import { memo } from 'react';
import React, { useId } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Glyph, { type GlyphName } from './Glyph';
import {
  INK, GHOST, FAINT, LIGHT, FACE, RIM, LOCKED_FACE, SHADOW, type Stops,
} from './tone';
import {
  CORE, ORNAMENT, FRAMES, INNER, frameGeom, crownInset, wingsInset, type FrameName,
} from './rankShapes';
import {
  ORDER, ORDERS, insigniaFace, insigniaRim, insigniaWing, insigniaRay,
  finishFor, type OrderName,
} from '@/constants/insignia';

// ─────────────────────────────────────────────────────────────────────────────
// A RANK IS A STRUCK PIN, AND ITS SHAPE IS PART OF THE RANK.
//
// ── WHAT THIS HEADER USED TO SAY, AND WHY IT WAS HALF RIGHT ─────────────────
//
// "A pin is ONE frame, repeated exactly, with the mark inside doing all the
// distinguishing. That is what makes a set feel collectible rather than
// decorative, and it is why the frame does NOT escalate by tier."
//
// That is a correct rule for a SET — forty siblings you want to read as one
// collection — and the wrong rule for a LADDER. A reader, on the version that
// followed it: "the rank icons are better, but they don't improve in look. This
// is what I mean by the improvement in ranks — the icons get prettier, and more
// complex." Colour alone cannot answer that. A jade hexagon and a clay hexagon
// are one object in two paints, and paint is not an achievement.
//
// So there are eight frames now, one per order, and they escalate by accretion:
// disc → cut plate → hexagon → notched gem → shield → crested shield → winged →
// crowned. components/shared/rankShapes.ts holds the geometry and the reasoning,
// and scripts/sheet-ranks.mjs renders all forty-eight in plain Node so they can
// be LOOKED at (§21) — which is where two versions of the wing died.
//
// The old header's real warning still stands, though, and it is the discipline
// that makes this survive: ornament "so busy at 54px that it fought the glyph it
// framed". Nothing added here is inside the mark's room. `markScale` is flat
// (0.36–0.40) across all eight frames while the footprint grows 45%; a crown, a
// wing, a spike and a halo all live in margin the low frames leave empty.
//
// ── A LOCKED PIN KEEPS ITS SHAPE AND LOSES ITS MATERIAL ─────────────────────
//
// The `order` prop is now passed for locked ranks too, which it was not before,
// and the change is deliberate: a reader scrolling the ranks sheet should be
// able to SEE that rank 44 is a winged thing and rank 4 is a disc. An escalating
// ladder nobody can look up is just a surprise. What locking takes away is the
// material — flat, cool `GHOST`, no gradient, no shadow — because the material
// is the reward, and "the same pin, dimmer" is indistinguishable from a
// rendering fault.
//
// ── THE RING WAS THE PROGRESS TRACK, AND STILL IS ───────────────────────────
//
// The arc toward the next rank runs along the pin's OWN edge rather than on a
// second concentric ring. That used to lean on a hexagon's perimeter being
// exactly 6r; a shield's is not exactly anything, so `frameGeom` flattens each
// frame once and measures it, and hands back an outline that starts at top
// centre so the arc always opens at twelve o'clock.
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
   * WHICH OF THE EIGHT ORDERS THE PIN BELONGS TO — see constants/insignia.ts.
   *
   * It decides two separate things: the FRAME (always) and the MATERIAL (only
   * when the rank is not locked). Pass it even for a locked rank; pass null only
   * where there is no rank at all, such as the Scholar's Pass card.
   */
  order?: OrderName | null;
  /**
   * HOW FINISHED THE STRIKING IS, 0–5 — the rank's position inside its order.
   *
   * Six steps, resetting every order, and every one of them lands on the frame's
   * own edge: the inner rule, then two, four and six studs, then the capstone's
   * outer collar. No pin is ever more than five steps ornamented and none of the
   * five is ever inside the mark.
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

/** The frame an order is struck in — index for index with `ORDERS`. */
function frameFor(order: OrderName | null): FrameName {
  if (!order) return 'hex';
  const i = ORDERS.indexOf(order);
  return FRAMES[i < 0 ? 2 : Math.min(FRAMES.length - 1, i)];
}

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

  const frame = frameFor(order);
  const geom = frameGeom(frame);
  const orn = ORNAMENT[frame];

  // useId, because two pins on one screen with the same gradient id would have
  // the second silently adopt the first's fill.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const face = `f${uid}`, rim = `r${uid}`, plume = `w${uid}`, halo = `h${uid}`;

  const outer = CORE[frame](0);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Defs>
          {grad(face, locked ? LOCKED_FACE : ins ? insigniaFace(ins) : FACE)}
          {grad(rim, locked ? flat(GHOST) : ins ? insigniaRim(ins) : RIM)}
          {grad(plume, locked ? flat(GHOST) : ins ? insigniaWing(ins) : RIM)}
          {grad(halo, locked ? flat(GHOST) : ins ? insigniaRay(ins) : FACE)}
        </Defs>

        {/* The pin sits ON the page, so it casts. Earned only: a locked pin is
            drawn flat, and a shadow under a flat shape reads as a mistake.
            The wings and the crown cast too — they are part of the object, and a
            winged pin whose shadow is shield-shaped reads as a sticker. */}
        {!locked && (
          <G transform={`translate(${SHADOW.dx} ${SHADOW.dy})`} opacity={SHADOW.opacity}>
            {orn.wings && <Path d={orn.wings} fill={INK} />}
            {orn.crown && <Path d={orn.crown} fill={INK} />}
            <Path d={outer} fill={INK} />
          </G>
        )}

        {/* THE HALO, behind everything, and only on the last order. */}
        {orn.rays && <Path d={orn.rays} fill={`url(#${halo})`} opacity={locked ? 0.4 : 1} />}

        {/* THE WINGS, behind the face and darker than it, so they read as being
            behind rather than beside — and rimmed the same way the crown is,
            by laying a pulled-in copy over a full-size one. Without that edge a
            dark wing against a dark shield on pale paper is a single mass, which
            is what the first browser load of this showed: shoulder flaps. */}
        {orn.wings && (
          <G>
            <Path d={orn.wings} fill={locked ? GHOST : ins ? ins.rim : INK} />
            <Path d={wingsInset(1.3)} fill={`url(#${plume})`} />
          </G>
        )}

        {/* THE CROWN, rimmed by laying a smaller copy inside a larger one — a
            gold coronet on a gold pin in front of a gold halo is one continuous
            mass unless something turns its edge. */}
        {orn.crown && (
          // A <G>, not a fragment: react-native-svg walks its own children and a
          // bare fragment is not reliably a node it recognises.
          <G>
            <Path d={orn.crown} fill={locked ? GHOST : ins ? ins.rim : INK} />
            <Path d={crownInset(1.6)} fill={`url(#${face})`} />
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
            d={CORE[frame](-3.4)}
            fill="none"
            stroke={ins ? ins.rule : FAINT}
            strokeWidth={1.6}
            strokeLinejoin="round"
            opacity={0.9}
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
            straight down are deliberately empty — that is where a peak, a point
            and a crown already are. */}
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
          rankShapes.ts, which is nearly flat across the ladder on purpose.

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
