import { useCallback, useRef, useState } from 'react';
import { Dimensions, type View } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// HAS THE READER ACTUALLY SEEN THIS YET?
//
// An intro animation is spent the moment it plays. Playing it to something that
// is not on screen does not delay it — it BURNS it, because everything in this
// app that introduces itself also records that it has done so and refuses to do
// it twice (`chartSeenXP`, `played`). So the reader scrolls down to a finished
// chart, every time, and never learns there was an animation at all.
//
// That is exactly what happened to the rank climb on Profile. It was already
// guarded — `active={focused}` — on the correct reasoning that every tab is
// built at startup and an intro played to an unwatched screen is wasted. The
// guard was just one level too coarse: being on the Profile TAB is not being at
// the part of Profile the chart lives in, and the chart sits about two-thirds of
// the way down a very long page. Focus fires on arrival; the chart is 900 points
// below the fold. Same bug, one scroll deeper.
//
// ── HOW ─────────────────────────────────────────────────────────────────────
//
// `measureInWindow` on every scroll event, and STOPS THE MOMENT IT IS TRUE. The
// cost is a handful of measures while the reader scrolls toward the thing and
// nothing at all afterwards, which is cheaper than the layout bookkeeping the
// alternative needs: `onLayout` reports a y relative to the immediate parent, so
// using it means threading offsets down through every wrapper between the
// scroll view and the target, and it breaks the moment someone adds a <View>.
// Window coordinates are true regardless of nesting.
//
// LATCHING, and that is the point rather than an optimisation: "seen" is a thing
// that happens once.
// ─────────────────────────────────────────────────────────────────────────────

export interface InView {
  /** Attach to the element being watched. Must be a host view. */
  ref: React.RefObject<View | null>;
  /** True once enough of it has been on screen at one time. Never goes back. */
  inView: boolean;
  /** Call from the scroll view's `onScroll` and the element's `onLayout`. */
  check: () => void;
}

/**
 * `fraction` is how much of the element must be within the window before it
 * counts as looked at. It errs EARLY on purpose: firing a little before the last
 * few points clear the tab bar costs nothing, and firing late costs the whole
 * animation, which is the failure being fixed.
 *
 * An element taller than the window can never satisfy a fraction of itself, so
 * the requirement is also capped at most of a screenful.
 */
export function useInView(fraction = 0.65): InView {
  const ref = useRef<View | null>(null);
  const [inView, setInView] = useState(false);
  // `measureInWindow` is asynchronous, and a fast scroll can queue a dozen before
  // the first answers. One in flight at a time is plenty.
  const busy = useRef(false);
  const done = useRef(false);

  const check = useCallback(() => {
    if (done.current || busy.current || !ref.current) return;
    busy.current = true;
    ref.current.measureInWindow((_x, y, _w, h) => {
      busy.current = false;
      if (done.current || !h) return;
      const vh = Dimensions.get('window').height;
      const visible = Math.max(0, Math.min(y + h, vh) - Math.max(y, 0));
      if (visible >= Math.min(h * fraction, vh * 0.6)) {
        done.current = true;
        setInView(true);
      }
    });
  }, [fraction]);

  return { ref, inView, check };
}
