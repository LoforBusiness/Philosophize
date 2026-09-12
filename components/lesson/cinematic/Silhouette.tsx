// ─────────────────────────────────────────────────────────────────────────────
// A DRAWING MADE FROM A LIST OF SHAPES — what the animals are built from.
//
// A reader asked for every animal in the lessons to look like the animal: *"one of
// the lessons has a bird and does not like a bird at all … it needs to be referenced
// online or to have an actual real looking figure to it."* The birds, the hen, the
// zebra, the cattle and the cats were rectangles and CSS triangles with a caption
// doing the work (Z1). Each one is now a silhouette built from its reference field
// marks, out of four shapes and one technique.
//
// ── VIEWS, NOT AN <Svg> ─────────────────────────────────────────────────────
//
// A path would draw a smoother animal, and nothing could SEE it: the must-box probe
// records a drawn thing only when it is a painted leaf `div`, so an <Svg> bird is
// invisible to the camera that has to keep it in frame and to the thought bubble
// that has to keep off it. Teaching the probe about SVG changes the probe, and the
// probe is in every lesson's stamp (muststamp). Views are measured today.
//
// ── THE FOUR SHAPES ─────────────────────────────────────────────────────────
//
//   ell   an ellipse. A CIRCLE SCALED, never a rounded box with a large radius:
//         Android clamps a radius to half the short side, so a wide oval drawn that
//         way comes out a capsule on the phone while it looks right in a browser.
//   rect  a rounded rectangle, rotated about its centre.
//   bar   a capsule from one point to another — a leg, a neck, a horn. Its caps
//         overlap the next bar's, so a chain of them bends without a notch.
//   tri   a CSS triangle inside a SIZED wrapper that carries the rotation. A border
//         triangle has a zero-size box, and a percentage origin on it resolves
//         against nothing (Z4).
//
// ── AND ONE OUTLINE ROUND THE WHOLE ANIMAL ──────────────────────────────────
//
// `Outlined` draws every part in the line colour grown by the line width, then every
// part again in its own fill. The result is one clean outline round the UNION, with
// no seam where the neck meets the body — which drawing each part with its own
// border cannot do, because every overlap shows its edge.
//
// This file is in `muststamp`'s SHARED list: a change here resizes the animals in
// every scene that imports it, and those scenes' must-boxes go stale with it.
// ─────────────────────────────────────────────────────────────────────────────
import { View, type ViewStyle } from 'react-native';

export type Part =
  | { k: 'ell'; x: number; y: number; w: number; h: number; rot: number; fill: string }
  | { k: 'rect'; x: number; y: number; w: number; h: number; rot: number; rad: number; fill: string }
  | { k: 'bar'; x1: number; y1: number; x2: number; y2: number; t: number; fill: string }
  | { k: 'tri'; x: number; y: number; w: number; h: number; dir: 'up' | 'down' | 'left' | 'right'; rot: number; fill: string };

/** An ellipse centred on (x, y). */
export const ell = (x: number, y: number, w: number, h: number, fill: string, rot = 0): Part => ({ k: 'ell', x, y, w, h, rot, fill });
/** A rounded rectangle centred on (x, y). */
export const rect = (x: number, y: number, w: number, h: number, fill: string, rot = 0, rad = 0): Part => ({ k: 'rect', x, y, w, h, rot, rad, fill });
/** A capsule of thickness `t` from (x1, y1) to (x2, y2). */
export const bar = (x1: number, y1: number, x2: number, y2: number, t: number, fill: string): Part => ({ k: 'bar', x1, y1, x2, y2, t, fill });
/** A triangle filling a w×h box centred on (x, y), pointing `dir`, then rotated. */
export const tri = (x: number, y: number, w: number, h: number, dir: 'up' | 'down' | 'left' | 'right', fill: string, rot = 0): Part => ({ k: 'tri', x, y, w, h, dir, rot, fill });

function boxStyle(x: number, y: number, w: number, h: number, rot: number): ViewStyle {
  return { position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: [{ rotate: `${rot}deg` }] };
}

function Piece({ p, grow, color }: { p: Part; grow: number; color?: string }) {
  const fill = color ?? p.fill;
  if (p.k === 'ell') {
    const w = p.w + 2 * grow;
    const h = p.h + 2 * grow;
    const d = Math.max(w, h);
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', left: p.x - d / 2, top: p.y - d / 2, width: d, height: d, borderRadius: d / 2,
          backgroundColor: fill, transform: [{ rotate: `${p.rot}deg` }, { scaleX: w / d }, { scaleY: h / d }],
        }}
      />
    );
  }
  if (p.k === 'rect') {
    return <View pointerEvents="none" style={[boxStyle(p.x, p.y, p.w + 2 * grow, p.h + 2 * grow, p.rot), { borderRadius: Math.max(0, p.rad + grow), backgroundColor: fill }]} />;
  }
  if (p.k === 'bar') {
    const len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1);
    const t = p.t + 2 * grow;
    const rot = (Math.atan2(p.y2 - p.y1, p.x2 - p.x1) * 180) / Math.PI;
    return <View pointerEvents="none" style={[boxStyle((p.x1 + p.x2) / 2, (p.y1 + p.y2) / 2, len + t, t, rot), { borderRadius: t / 2, backgroundColor: fill }]} />;
  }
  const w = p.w + 3 * grow;
  const h = p.h + 3 * grow;
  const T = 'transparent';
  const edge: ViewStyle = p.dir === 'up'
    ? { borderLeftWidth: w / 2, borderRightWidth: w / 2, borderBottomWidth: h, borderLeftColor: T, borderRightColor: T, borderBottomColor: fill }
    : p.dir === 'down'
      ? { borderLeftWidth: w / 2, borderRightWidth: w / 2, borderTopWidth: h, borderLeftColor: T, borderRightColor: T, borderTopColor: fill }
      : p.dir === 'left'
        ? { borderTopWidth: h / 2, borderBottomWidth: h / 2, borderRightWidth: w, borderTopColor: T, borderBottomColor: T, borderRightColor: fill }
        : { borderTopWidth: h / 2, borderBottomWidth: h / 2, borderLeftWidth: w, borderTopColor: T, borderBottomColor: T, borderLeftColor: fill };
  return (
    <View pointerEvents="none" style={boxStyle(p.x, p.y, w, h, p.rot)}>
      <View style={[{ position: 'absolute', left: 0, top: 0, width: 0, height: 0 }, edge]} />
    </View>
  );
}

/** Every part, in its own fill — or all of them in `color`, grown by `grow`. */
export function Shapes({ parts, grow = 0, color }: { parts: readonly Part[]; grow?: number; color?: string }) {
  return <>{parts.map((p, i) => <Piece key={i} p={p} grow={grow} color={color} />)}</>;
}

/**
 * The union of `parts` with one outline round it: `pass` 'line' draws the outline
 * layer only and 'fill' the fill layer only, so two groups that overlap (a head that
 * turns on a neck, over a body) can share one outline by drawing both lines first.
 */
export function Outlined({ parts, width, line, pass }: { parts: readonly Part[]; width: number; line: string; pass?: 'line' | 'fill' }) {
  return (
    <>
      {pass !== 'fill' ? <Shapes parts={parts} grow={width} color={line} /> : null}
      {pass !== 'line' ? <Shapes parts={parts} /> : null}
    </>
  );
}
