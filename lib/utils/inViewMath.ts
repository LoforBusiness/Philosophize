// ─────────────────────────────────────────────────────────────────────────────
// THE TWO JUDGEMENTS BEHIND "HAS THE READER ACTUALLY SEEN THIS YET"
//
// `useInView` is the hook; this is the part of it that can be WRONG, so it lives
// where plain Node can run it — the same rule, for the same reason, as rig.ts,
// tone.ts and rankShapes.ts. Zero imports. `npm run check:ui` exercises both
// functions against the exact readings that produced the defect below.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * IS THIS MEASUREMENT WORTH BELIEVING?
 *
 * `measureInWindow` answers for a view that is not attached to a window by
 * handing back the WINDOW ORIGIN — Android's `getLocationInWindow` short-circuits
 * to (0, 0) the moment `mAttachInfo` is null — and it keeps the view's real width
 * and height while doing it. So something nowhere near the screen measures as a
 * full-sized element in the top-left corner, which is the most convincingly
 * "in view" answer there is.
 *
 * THREE ORDINARY THINGS PRODUCE IT, and all three happen on the one screen this
 * hook is used on:
 *
 *   · the FIRST layout pass, which runs before the tree is attached — and
 *     `onLayout` is one of the two things that calls `check`;
 *   · `removeClippedSubviews`, which Profile turns on for Android fling
 *     performance: it DETACHES every direct child of the scroll content that is
 *     outside the viewport, and the rank chart sits about nine hundred points
 *     down, so it is detached for exactly as long as it matters;
 *   · react-native-screens detaching a tab the reader has switched away from.
 *
 * What that cost: the guard latched at mount, the rank chart played its one
 * intro to a reader looking at the top of the page, called `onSeen`, and then
 * refused ever to play again — which is precisely the bug the guard was written
 * to fix, wearing the guard as a disguise. It survived being verified because
 * VERIFICATION HAPPENS IN A BROWSER (§21), and a browser's
 * `getBoundingClientRect` is right whether or not anything is attached. There is
 * no reading a web harness could have taken that would have shown this.
 *
 * The price of the guard is that this hook cannot watch something genuinely at
 * the window origin. Nothing it watches is: a watched element is inside a card,
 * below a header, on a page with margins.
 */
export function trustworthy(x: number, y: number, h: number): boolean {
  return h > 0 && !(x === 0 && y === 0);
}

/** How much of an `h`-tall element at window `y` falls inside a `vh`-tall window. */
export function visibleHeight(y: number, h: number, vh: number): number {
  return Math.max(0, Math.min(y + h, vh) - Math.max(y, 0));
}

/**
 * Is enough of it on screen to count as looked at?
 *
 * `fraction` errs EARLY on purpose: firing a little before the last few points
 * clear the tab bar costs nothing, and firing late costs the whole animation,
 * which is the failure this exists to prevent. An element taller than the window
 * can never satisfy a fraction of itself, so the requirement is also capped at
 * most of a screenful.
 */
export function seenEnough(y: number, h: number, vh: number, fraction: number): boolean {
  return visibleHeight(y, h, vh) >= Math.min(h * fraction, vh * 0.6);
}
