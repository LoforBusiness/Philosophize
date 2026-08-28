// ─────────────────────────────────────────────────────────────────────────────
// WHICH WEDGE IS UNDER THE FINGER.
//
// ZERO IMPORTS, the same rule `rig.ts`, `tone.ts` and `inViewMath.ts` carry: this
// can be required by plain Node, so `npm run check:ui` can feed it the exact
// points that broke it rather than anyone reasoning about a screenshot.
//
// ── WHY THIS IS ITS OWN FILE AND NOT FOUR LINES IN THE COMPONENT ────────────
//
// It was four lines in the component, and they were wrong on web in a way that
// could not fail:
//
//   const dx = e.nativeEvent.locationX - cx;
//
// `locationX` IS A REACT NATIVE FIELD AND REACT-NATIVE-WEB DOES NOT SET IT. So
// on web `dx` is NaN — and every guard written against it passes, because every
// comparison with NaN is false. `NaN > 1` is false, so the "outside the disc"
// bounds check let it through; `Math.atan2(NaN, NaN)` is NaN, so no wedge
// matched and nothing was selected. A tap that is received, computed and
// discarded looks exactly like a tap that never arrived.
//
// Four different dispatches were tried against it — a native CDP mouse press, a
// CDP touch, and two synthetic sequences carrying real coordinates — and all
// four reported the same nothing, which is what sent the search to the maths
// rather than to the event. The old ring chart read `locationX` too, so its tap
// had been untestable in a browser for as long as it existed.
//
// The arithmetic lives here so the next person can put a point in and read a
// wedge out, without a phone and without a browser.
// ─────────────────────────────────────────────────────────────────────────────

export interface DiscGeom {
  cx: number;
  cy: number;
  /** The horizontal radius of the face. */
  rx: number;
  /**
   * The vertical one. EQUAL TO `rx` for the dial as it ships — it is drawn
   * straight on, because a tipped circle puts the wedges at different distances
   * and foreshortens the far ones, and a reader compares areas whether they mean
   * to or not. The two radii are kept apart anyway: the maths below is written in
   * the FACE'S OWN SPACE rather than the screen's, which is the only version that
   * stays correct if anything ever tips it again, and costs one divide.
   */
  ry: number;
  /**
   * How far OUTSIDE the face still counts as a press on it — the socket ring the
   * rosette is set into. A press on the ring belongs to the piece it hugs: the
   * ring is part of the object as far as a thumb is concerned, and refusing it
   * makes a 4px border of the target inert for no reason a reader could guess.
   */
  slop: number;
}

/** A wedge's angular range in degrees, measured clockwise from 3 o'clock. */
export interface WedgeSpan {
  key: string;
  a0: number;
  a1: number;
}

/**
 * The point of a press, in the component's own box.
 *
 * React Native fills `locationX`; react-native-web fills `offsetX`. Neither is
 * guaranteed, so the last resort subtracts the target's own origin from the page
 * point — which is what `locationX` means anyway.
 */
export function pressPoint(
  ne: {
    locationX?: number; locationY?: number;
    offsetX?: number; offsetY?: number;
    pageX?: number; pageY?: number;
  },
  originX = 0,
  originY = 0,
): { x: number; y: number } | null {
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const x = num(ne.locationX) ?? num(ne.offsetX) ?? (num(ne.pageX) !== null ? (ne.pageX as number) - originX : null);
  const y = num(ne.locationY) ?? num(ne.offsetY) ?? (num(ne.pageY) !== null ? (ne.pageY as number) - originY : null);
  // NOT a `?? 0` fallback. Zero is a real point — the top-left corner — and
  // defaulting to it would turn "no coordinates at all" into a press on whatever
  // wedge happens to reach the corner. A press with no point is not a press.
  return x === null || y === null ? null : { x, y };
}

/**
 * The wedge a press lands in, or null for anywhere that is not the disc.
 *
 * THE TEST IS DONE IN THE FACE'S OWN SPACE. Dividing each offset by its own
 * radius turns the face back into a unit circle, so an angle means what it means
 * whatever the two radii are; comparing screen angles against wedge angles would
 * pick the wrong wedge for every press above or below the middle of a tipped
 * face, and would look almost right doing it — which is the worst kind of wrong
 * for a control.
 *
 * The GROOVES between the pieces are not holes. They are two units wide and they
 * belong to whichever piece the angle lands in, because a reader aiming at a
 * wedge is aiming at the wedge, not at the space beside it.
 */
export function wedgeAt(
  px: number,
  py: number,
  g: DiscGeom,
  wedges: readonly WedgeSpan[],
): string | null {
  if (wedges.length === 0) return null;
  const dx = px - g.cx;
  const dy = py - g.cy;
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null;

  const slop = Number.isFinite(g.slop) ? g.slop : 0;
  const u = dx / (g.rx + slop);
  const v = dy / (g.ry + slop);
  if (u * u + v * v > 1) return null;

  const deg = (((Math.atan2(v, u) * 180) / Math.PI) + 360) % 360;
  for (const w of wedges) {
    const start = ((w.a0 % 360) + 360) % 360;
    const span = w.a1 - w.a0;
    const rel = ((deg - start) + 360) % 360;
    if (rel < span) return w.key;
  }
  return null;
}
