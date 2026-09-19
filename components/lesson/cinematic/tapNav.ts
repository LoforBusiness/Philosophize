// ─────────────────────────────────────────────────────────────────────────────
// WHICH WAY A TAP ON THE LESSON GOES.
//
// The LEFT THIRD of the screen goes back one beat; the other two-thirds go forward.
// That is Imprint's split, measured in two recorded lessons at 33% from the left
// ("Tap right to move forward. Tap left to go back.") and the owner's choice over
// halves: forward is what a reader does twenty times a lesson and back is the
// occasional recovery, so the bigger target belongs to the common action and a
// reader tapping near the middle to continue does not fall backwards.
//
// ── A TAP WITH NO POSITION GOES FORWARD ───────────────────────────────────────
//
// Every browser harness in scripts/ advances a lesson with a synthetic `click()`,
// which carries no coordinates: its pageX is 0, the very left edge of the screen.
// Read literally, that is a tap in the back zone, and every harness would have
// started walking lessons BACKWARDS while reporting that it was measuring them. A
// finger cannot land at exactly x = 0, so "no position" and "x ≤ 0" are read as the
// same thing — forward, the only move a tap meant before the zones existed. A
// keyboard press on the web (Enter on the focused lesson) arrives the same way and
// also, correctly, goes forward.
//
// No imports on purpose, like rig.ts and tone.ts: scripts/check-guide.mjs loads
// this file in plain Node and feeds it the exact events that would break it.
// ─────────────────────────────────────────────────────────────────────────────

/** The share of the screen, from the left edge, that goes back. */
export const BACK_SHARE = 1 / 3;

export type TapSide = 'back' | 'forward';

/** The parts of a press event this reads — RN's on a device, the DOM's on the web. */
export interface TapPoint {
  pageX?: number | null;
  locationX?: number | null;
  clientX?: number | null;
}

/**
 * Where a press on the lesson body lands. `width` is the width the body spans,
 * which is the window's width: the body runs edge to edge.
 */
export function tapSide(ne: TapPoint | null | undefined, width: number): TapSide {
  if (!ne || !(width > 0)) return 'forward';
  const x = typeof ne.pageX === 'number' ? ne.pageX
    : typeof ne.clientX === 'number' ? ne.clientX
    : typeof ne.locationX === 'number' ? ne.locationX
    : NaN;
  // NaN, 0 and anything negative all fail this: a tap with no position goes forward.
  if (!(x > 0)) return 'forward';
  return x < width * BACK_SHARE ? 'back' : 'forward';
}
