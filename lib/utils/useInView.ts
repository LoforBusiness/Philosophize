import { useCallback, useEffect, useRef, useState } from 'react';
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
//
// ── AND IT FIRES WHEN THE SCROLL STOPS, NOT MID-FLICK ───────────────────────
//
// A reader reported the app "losing frames and getting very laggy" scrolling down
// Profile. Measured in a browser at 6x CPU throttle, stepping the whole page:
//
//   with this latch, as it was     worst frame 250-2050ms, a stall EVERY run
//   with the latch removed         worst frame 27-45ms, zero stalls, 3/3 runs
//
// The measure is not the cost — the `setState` is. Profile is one component of
// ~810 nodes and 44 SVGs, so ANY state change re-renders all of it in one
// blocking commit, and this one is timed to land in the middle of a flick, which
// is the worst possible moment for it. (Run-to-run variance on the magnitude is
// large; the PRESENCE of the stall was 100% consistent, which is the finding.)
//
// So the latch still closes the instant the element is seen — `done` is set in
// the measure callback exactly as before, so it can never fire twice or fire for
// something off screen — but the render it causes is held until the checks stop
// arriving, which is when the reader has stopped scrolling. The animation then
// plays to someone who has settled on it rather than to someone flicking past.
//
// IDLE_MS is a debounce, not a delay: it restarts on every `check`, so it costs
// nothing while scrolling and fires one frame's worth after the finger lifts.
// ─────────────────────────────────────────────────────────────────────────────

export interface InView {
  /** Attach to the element being watched. Must be a host view. */
  ref: React.RefObject<View | null>;
  /** True once enough of it has been on screen at one time. Never goes back. */
  inView: boolean;
  /** Call from the scroll view's `onScroll` and the element's `onLayout`. */
  check: () => void;
}

/** How long after the last `check` counts as "they have stopped scrolling". */
const IDLE_MS = 120;

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
  // Seen, but not yet announced — see the scroll-idle note in the header.
  const armed = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settle = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => {
      idle.current = null;
      if (armed.current) setInView(true);
    }, IDLE_MS);
  }, []);

  const check = useCallback(() => {
    // Already seen: the only thing left to do is notice that the scroll has
    // stopped, so the held render can go out.
    if (done.current) { if (armed.current && !inView) settle(); return; }
    if (busy.current || !ref.current) return;
    busy.current = true;
    ref.current.measureInWindow((_x, y, _w, h) => {
      busy.current = false;
      if (done.current || !h) return;
      const vh = Dimensions.get('window').height;
      const visible = Math.max(0, Math.min(y + h, vh) - Math.max(y, 0));
      if (visible >= Math.min(h * fraction, vh * 0.6)) {
        // LATCH IMMEDIATELY. `done` closing here rather than with the render is
        // what keeps this honest: it is decided by a measurement taken while the
        // element really was on screen, and no later scrolling can undo or
        // re-trigger it. Only the re-render waits.
        done.current = true;
        armed.current = true;
        settle();
      }
    });
  }, [fraction, inView, settle]);

  // A scroll that never ends still ends when the screen goes away.
  useEffect(() => () => { if (idle.current) clearTimeout(idle.current); }, []);

  return { ref, inView, check };
}
