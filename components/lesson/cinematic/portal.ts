// ─────────────────────────────────────────────────────────────────────────────
// THE SCENE CHANGE — the camera goes INTO something and comes out somewhere else.
//
// Owner, 2026-09-27: "if music is being talked about with a white board showing a
// piano, then the camera could zoom into the piano and then the scene changes to
// being at a music concert … when the camera then zooms out it is a stickman playing
// the piano and a large audience in a beautiful concert hall."
//
// A scene that uses it draws TWO sets, each in its own full-stage wrapper, and on the
// change beat:
//
//   1. the first set zooms INTO its object, accelerating, about ninefold, the object
//      drifting to the middle of the band as it grows;
//   2. at the deepest point the two sets cross-dissolve, both close in on their own
//      object — a close-up of one piano becoming a close-up of the other;
//   3. the second set pulls back OUT from its object, decelerating, to scale 1.
//
// That order is the design. Growing ACCELERATES because a push-in that starts slow and
// lands fast is what a lens does; the pull-back DECELERATES because it lands on a set
// the reader has to take in. A single linear zoom through both reads as a slide
// transition. The scale is exponential in its driver (Z to the power k) so each tenth
// of the move looks like the same amount of zoom — a linear scale spends almost the
// whole of the move on the last, fastest doubling.
//
// WHAT THE CHANGE BEAT MUST DO, because the harnesses read every beat from its settled
// frames (measure-must at ~0.9, 1.9, 3.1 and 5.9s; check-readable once the stage stops
// moving): finish by about 2.6s into the beat, show no words while zoomed, and bring
// the new set's words on only after it has landed. A word half way through a zoom is
// a word the size of the screen.
//
// Zero imports, like rig.ts: a scene imports this, and a sheet can too, in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

/** How far a set zooms at its deepest: the object fills the band. */
export const PORTAL_Z = 9;

/** When the change runs inside its beat, in seconds from the beat's start. */
export const PORTAL = {
  /** the first set starts to push in */
  inFrom: 0.25,
  /** …and is at its deepest */
  inTo: 1.3,
  /** the two sets cross over, both at their deepest */
  swapFrom: 1.2,
  swapTo: 1.45,
  /** the second set pulls back out from its deepest… */
  outFrom: 1.4,
  /** …and has landed */
  outTo: 2.6,
};

function clamp01(v: number): number {
  'worklet';
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * The three tracks of a change, at `b` seconds into its beat: how deep the first set
 * is (0..1, accelerating), how far the second has taken over (0..1), and how deep the
 * second still is (1..0, decelerating).
 */
export function portalAt(b: number): { out: number; world: number; into: number } {
  'worklet';
  const u = clamp01((b - PORTAL.inFrom) / (PORTAL.inTo - PORTAL.inFrom));
  const w = clamp01((b - PORTAL.swapFrom) / (PORTAL.swapTo - PORTAL.swapFrom));
  const v = clamp01((b - PORTAL.outFrom) / (PORTAL.outTo - PORTAL.outFrom));
  return {
    out: u * u,
    world: w * w * (3 - 2 * w),
    into: (1 - v) * (1 - v),
  };
}

/** How big a set is drawn `k` of the way into a zoom that goes `z` deep. */
export function portalScale(k: number, z: number = PORTAL_Z): number {
  'worklet';
  return Math.pow(z, k);
}

/**
 * The transform that takes a set `k` of the way into its object at (fx, fy): the
 * object grows about itself and slides to (cx, cy), the middle of the band. At k = 0
 * nothing moves; at k = 1 the object sits at the middle at `z` times its size.
 * For a wrapper laid over the whole stage with its transform origin at the top left.
 *
 * THE SEAMLESS CASE. When the first set's object is a true miniature of the second
 * set — a painting of the very place, drawn from the same parts at scale m — give the
 * first set z = PORTAL_Z / m. Both sets then reach the same picture at the same size
 * at their deepest, and the cross-dissolve between them cannot be seen: the push into
 * the painting simply becomes the place.
 */
export function portalXf(k: number, fx: number, fy: number, cx: number, cy: number, z: number = PORTAL_Z) {
  'worklet';
  const s = portalScale(k, z);
  return {
    transform: [
      { translateX: fx * (1 - s) + k * (cx - fx) },
      { translateY: fy * (1 - s) + k * (cy - fy) },
      { scale: s },
    ],
  };
}

/**
 * How much of the figure shows when his set is drawn at scale `s`: none of him past
 * 2.4 times, all of him from double down. A figure standing near the object would
 * otherwise fill the screen as a black shape at the deepest point. The fade is kept
 * short and early on purpose: a slow one left him half-transparent, a large grey ghost,
 * for most of the pull-back (seen twice, 2026-09-27). Large and solid reads as the
 * camera pulling back off a man; see-through reads as a fault.
 */
export function figureAt(s: number): number {
  'worklet';
  return clamp01((2.4 - s) / 0.4);
}

/** How much of a set's WORDS show at a depth `k`: gone as soon as the zoom starts. */
export function wordsAt(k: number): number {
  'worklet';
  return clamp01(1 - k * 8);
}
