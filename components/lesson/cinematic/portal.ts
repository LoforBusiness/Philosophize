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
//   1. the first set zooms INTO its object, the object drifting to the middle of the
//      band as it grows;
//   2. at the deepest point the two sets cross-dissolve, both close in on their own
//      object — a close-up of one piano becoming a close-up of the other;
//   3. the second set pulls back OUT from its object to scale 1.
//
// SLOWER, AND SMOOTH THROUGH THE SWITCH (owner, 2026-09-28: "it needs to not be as
// fast and it needs to have a smoother transition … transitions are so important so
// they must look very good"). The first version pushed in ACCELERATING for a second and
// pulled out decelerating for another, 2.35s all told, and hit the cut at full speed —
// the textbook match cut. Two things were wrong with it, and the second only showed on
// film:
//
//   - it was FAST: the push reached about 4 nats of log-scale a second;
//   - it REVERSED at full speed. Zooming in and then zooming out is a change of
//     direction, and doing it at peak velocity is a jolt however quickly it happens.
//     A draft that ran one eased curve through both halves (fastest AT the cut) filmed
//     worse still: at the moment of the dissolve the two sets were at different depths
//     and the moon doubled into a disc and a ghost ring beside it.
//
// That version eased into the object and dissolved the two sets while the camera was
// all but still. It was right that a reversal must not be SEEN, and it was replaced
// (below, THE SWAP HAPPENS INSIDE ONE FLAT COLOUR) by making the reversal happen where
// there is nothing to see. What stays from it: the whole change is 4.2s, each half
// eased in DEPTH rather than in scale (van Wijk & Nuij, "Smooth and
// efficient zooming and panning", 2003: the perceived speed of a zoom is the rate of
// change of log scale, so a 9x zoom has to be exponential in time to look even), and
// each half is given time in proportion to how deep it goes, so a seamless miniature
// (36x) spends longer going in than an ordinary 9x.

// STAND CLEAR, AND NEVER FADE HIM (owner, 2026-09-28: "I dont want to be able to see
// the stickman appear or disappear in any of the scenes"). He was faded out as the push
// began and back in on the pull-out, because a figure beside the object would otherwise
// fill the screen as a black shape at the deepest point — measured on film at 8x to 25x
// in four of the six lessons, two of them because the object was IN HIS HAND. The fade
// is gone; he is solid throughout, and the staging does the work instead: before the
// push he sets the object down or steps back from it, and after the pull-out he lands a
// few paces from it, so the camera carries him out of frame while he is still his own
// size and brings him back in from the edge. `delay` on portalAt is the time he needs.
//
// THE SWAP HAPPENS INSIDE ONE FLAT COLOUR (owner, 2026-09-28: "I want it to zoom in,
// and you can't see a change in this scene at all, because then when you zoom out,
// then it's a different scene. I don't want to be able to see a change when zoomed
// in."). Pushed nine times into an object, the frame still held the object's edge, its
// markings and whatever stood behind it — measured on ethics-4, 12–17% of the stage was
// not the ocean while the two sets crossed, so the reader SAW the picture change. So each
// set now goes in until the whole band lies inside one flat patch of its object — the
// ocean of a globe, the white of the porcelain, the inside of a moon — and the other set
// comes out of a patch of the SAME colour. At the deepest point there is nothing on
// screen but that colour, and a swap between two identical flat fields cannot be seen.
// `flatDepth` turns a patch's half-size into the depth that fills the band with it.
//
// AND IT DOES NOT STOP THERE. The first version eased into the deepest point and out of
// it, which held the camera nearly still at the one moment when the screen is a flat
// colour: ethics-4 showed a second of plain sky, a camera "in one place too long without
// showing any information". Inside a flat field a change of direction cannot be seen, so
// the push now ARRIVES at speed and the pull LEAVES at speed (a sine ease-in, then a sine
// ease-out), each half timed by its depth so the speed is the same on both sides of the
// cut, and the flat colour is on screen for a fifth of a second.
//
// WHAT THE CHANGE BEAT MUST DO: every change-beat line in the six lessons runs 6.3s or
// longer, so a landing at 4.6s leaves the new set at least 1.7s in view before the
// reader is invited to tap. Words show on neither set while it is zoomed, and the new
// set's words come on after it has landed.
//
// Zero imports, like rig.ts: a scene imports this, and a sheet can too, in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

/** How far a set zooms at its deepest when a scene does not say (see `flatDepth`). */
export const PORTAL_Z = 9;

/**
 * How much deeper than "just fills the band" each set goes, so the flat field holds for
 * a moment either side of the swap rather than for one frame.
 */
export const FLAT_MARGIN = 1.15;

/** The band every portal lesson uses, as it is seen: 400 wide, this tall. */
export const PORTAL_BAND_H = 226;

/**
 * The depth at which a flat patch of half-size (hw, hh), centred on the zoom's focus,
 * covers the whole band — times FLAT_MARGIN. Not a worklet: scenes compute it once.
 */
export function flatDepth(hw: number, hh: number): number {
  return FLAT_MARGIN * Math.max(200 / hw, PORTAL_BAND_H / 2 / hh);
}

/** When the change runs inside its beat, in seconds from the beat's start. */
export const PORTAL = {
  /** the first set starts to push in */
  inFrom: 0.4,
  /** the second set has landed */
  outTo: 4.6,
  /** how long the two sets take to cross over, centred on the deepest point — inside
   *  the flat field, where it cannot be seen */
  swapFor: 0.1,
};

function clamp01(v: number): number {
  'worklet';
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smooth(t: number): number {
  'worklet';
  return t * t * (3 - 2 * t);
}

/** Starts at rest and ARRIVES at speed. */
function easeInSine(t: number): number {
  'worklet';
  return 1 - Math.cos((t * Math.PI) / 2);
}

/** LEAVES at speed and comes to rest. */
function easeOutSine(t: number): number {
  'worklet';
  return Math.sin((t * Math.PI) / 2);
}

/**
 * The beat time at which a change from a set zoomed `zOut` deep into one zoomed `zIn`
 * deep reaches its deepest point — where the sets dissolve. Each half gets time in
 * proportion to its depth, so an ordinary change swaps in the middle.
 */
export function portalSwapAt(zOut?: number, zIn?: number, delay?: number): number {
  'worklet';
  const a = Math.log(zOut === undefined ? PORTAL_Z : zOut);
  const c = Math.log(zIn === undefined ? PORTAL_Z : zIn);
  return (delay === undefined ? 0 : delay) + PORTAL.inFrom + (a / (a + c)) * (PORTAL.outTo - PORTAL.inFrom);
}

/**
 * The tracks of a change, at `b` seconds into its beat: how deep the first set is
 * (`out`, 0..1), how far the second has taken over (`world`, 0..1), how deep the
 * second still is (`into`, 1..0), and `swapU`, 0..1 across the dissolve — the window
 * in which anything the reader must not see move (the figure changing place, turning
 * round) should move. Pass the two sets' depths when they are not PORTAL_Z.
 */
export function portalAt(
  b0: number, zOut?: number, zIn?: number, delay?: number,
): { out: number; world: number; into: number; swapU: number } {
  'worklet';
  // `delay` holds the camera still for that long first — for a scene whose figure has
  // to step clear of the thing being zoomed into (see STAND CLEAR, above)
  const b = b0 - (delay === undefined ? 0 : delay);
  const at = portalSwapAt(zOut, zIn);
  // (the eased halves below meet at the deepest point with the same speed in log-scale,
  // because each is given time in proportion to its depth)
  const u = clamp01((b - PORTAL.inFrom) / (at - PORTAL.inFrom));
  const v = clamp01((b - at) / (PORTAL.outTo - at));
  const w = clamp01((b - (at - PORTAL.swapFor / 2)) / PORTAL.swapFor);
  return {
    out: easeInSine(u),
    world: smooth(w),
    into: 1 - easeOutSine(v),
    swapU: w,
  };
}

/** How big a set is drawn `k` of the way into a zoom that goes `z` deep. */
export function portalScale(k: number, z?: number): number {
  'worklet';
  // NO DEFAULT PARAMETER. A worklet's closure is unpacked at the top of its BODY
  // (`const { PORTAL_Z } = this.__closure`), and a default is evaluated before the
  // body runs — so `z = PORTAL_Z` threw on the phone's UI thread on every frame and
  // greyed out all six lessons, while a browser (one thread, a real closure) was fine.
  return Math.pow(z === undefined ? PORTAL_Z : z, k);
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
export function portalXf(k: number, fx: number, fy: number, cx: number, cy: number, z?: number) {
  'worklet';
  const s = portalScale(k, z === undefined ? PORTAL_Z : z);
  return {
    transform: [
      { translateX: fx * (1 - s) + k * (cx - fx) },
      { translateY: fy * (1 - s) + k * (cy - fy) },
      { scale: s },
    ],
  };
}


/**
 * THE IRIS, for an object too small to go INTO. A flat patch of half-size h needs a depth
 * of about 230 / h, and an olive or a primer's letter A would need 100x and more — a dive
 * nobody can follow. So those go in as deep as reads comfortably, and over the last
 * quarter of the push the patch's own colour grows out from the focus until it covers the
 * band (`PortalIris.tsx`): the camera is rushing in, so it reads as arriving inside the
 * thing. `irisR` is its radius in the set's own units, `r0` (inside the patch, where
 * it cannot be seen) until IRIS_FROM, then out to the band's half-diagonal at the deepest
 * point, times FLAT_MARGIN.
 */
export const IRIS_FROM = 0.75;
/** …and it has covered the band by here, so the flat field holds for the last tenth of
 *  the push and the first tenth of the pull — the swap sits in the middle of it. */
export const IRIS_TO = 0.9;
const HALF_DIAG = Math.hypot(200, PORTAL_BAND_H / 2);

export function irisR(k: number, r0: number, z: number): number {
  'worklet';
  const r1 = (FLAT_MARGIN * HALF_DIAG) / Math.pow(z, IRIS_TO);
  if (r1 <= r0) return r0;
  const e = smooth(clamp01((k - IRIS_FROM) / (IRIS_TO - IRIS_FROM)));
  return r0 * Math.pow(r1 / r0, e);
}

/** How much of a set's WORDS show at a depth `k`: gone as soon as the zoom starts. */
export function wordsAt(k: number): number {
  'worklet';
  return clamp01(1 - k * 8);
}
