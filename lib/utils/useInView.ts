import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, type View } from 'react-native';
import { seenEnough, trustworthy } from './inViewMath';

// ─────────────────────────────────────────────────────────────────────────────
// HAS THE READER ACTUALLY SEEN THIS YET?
//
// An intro animation is spent the moment it plays. Playing it to something that
// is not on screen does not delay it — it BURNS it, because everything in this
// app that introduces itself also records that it has done so (`chartSeenXP`,
// `played`). So the reader scrolls down to a finished chart, every time, and
// never learns there was an animation at all.
//
// That is what happened to the rank climb on Profile. It was already guarded —
// `active={focused}` — on the correct reasoning that every tab is built at
// startup and an intro played to an unwatched screen is wasted. The guard was
// one level too coarse: being on the Profile TAB is not being at the part of
// Profile the chart lives in, and the chart sits about two-thirds of the way
// down a very long page. Focus fires on arrival; the chart is 900 points below
// the fold. Same bug, one scroll deeper.
//
// ── HOW ─────────────────────────────────────────────────────────────────────
//
// `measureInWindow` on every scroll event, and stops once it is true. The cost
// is a handful of measures while the reader scrolls toward the thing and nothing
// at all afterwards, which is cheaper than the layout bookkeeping the
// alternative needs: `onLayout` reports a y relative to the immediate parent, so
// using it means threading offsets down through every wrapper between the
// scroll view and the target, and it breaks the moment someone adds a <View>.
// Window coordinates are true regardless of nesting.
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
// the measure callback, so it can never close for something off screen — but the
// render it causes is held until the checks stop arriving, which is when the
// reader has stopped scrolling. The animation then plays to someone who has
// settled on it rather than to someone flicking past.
//
// IDLE_MS is a debounce, not a delay: it restarts on every `check`, so it costs
// nothing while scrolling and fires one frame's worth after the finger lifts.
//
// ── TWO THINGS THIS GOT WRONG, BOTH REPORTED AS "IT NEVER MOVES" ────────────
//
// FIRST: it believed an untrustworthy measurement. A view that is not attached to
// a window measures at the window ORIGIN with its real size, which reads as
// perfectly in view — see `trustworthy` in ./inViewMath, which is where that
// whole finding is written down. On Android the very first `onLayout` produces
// exactly that reading, so the latch closed at mount and the chart played to
// nobody. It could not be caught in a browser, because a browser measures a
// detached element correctly.
//
// SECOND: LATCHING FOREVER WAS TOO STRONG. "Seen" happens once per LOOK, not once
// per lifetime, and a tab screen stays mounted for the whole session — so having
// looked at the chart once silently disqualified every look after it. `rearm()`
// reopens the latch when the reader leaves the screen: the next visit has to earn
// its own measurement, so nothing plays to an empty room and nothing is withheld
// from a reader who is sitting there watching it.
// ─────────────────────────────────────────────────────────────────────────────

export interface InView {
  /** Attach to the element being watched. Must be a host view. */
  ref: React.RefObject<View | null>;
  /** True once enough of it has been on screen at one time. */
  inView: boolean;
  /** Call from the scroll view's `onScroll` and the element's `onLayout`. */
  check: () => void;
  /**
   * Forget that it was seen, so the next `check` decides again. Call it when the
   * screen goes away — a look is over when the reader leaves.
   */
  rearm: () => void;
}

/** How long after the last `check` counts as "they have stopped scrolling". */
const IDLE_MS = 120;

/**
 * `fraction` is how much of the element must be within the window before it
 * counts as looked at. See `seenEnough`, which is where the arithmetic and the
 * reasoning about erring early both live.
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
  // What `inView` currently is, readable without making `check` depend on it.
  // `check` is handed to a ScrollView's `onScroll` AND to a focus effect, and an
  // identity that changed with the state re-subscribed both — which, in a focus
  // effect, means tearing down and rebuilding the visit every time the flag it
  // sets moves. That is a loop, not a subscription.
  const shown = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const settle = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => {
      idle.current = null;
      if (armed.current) { shown.current = true; setInView(true); }
    }, IDLE_MS);
  }, []);

  const check = useCallback(() => {
    // Already seen: the only thing left to do is notice that the scroll has
    // stopped, so the held render can go out.
    if (done.current) { if (armed.current && !shown.current) settle(); return; }
    if (busy.current || !ref.current) return;
    busy.current = true;
    ref.current.measureInWindow((x, y, _w, h) => {
      busy.current = false;
      if (done.current) return;
      // NOT MERELY `if (!h)`. An unattached view answers (0, 0) at full size, and
      // believing that reading is what played this animation to an empty room.
      if (!trustworthy(x, y, h)) return;
      if (seenEnough(y, h, Dimensions.get('window').height, fraction)) {
        // LATCH IMMEDIATELY. `done` closing here rather than with the render is
        // what keeps this honest: it is decided by a measurement taken while the
        // element really was on screen, and no later scrolling can undo it or
        // fire it twice. Only the re-render waits.
        done.current = true;
        armed.current = true;
        settle();
      }
    });
  }, [fraction, settle]);

  const rearm = useCallback(() => {
    if (idle.current) { clearTimeout(idle.current); idle.current = null; }
    done.current = false;
    armed.current = false;
    // Only pay for a render if there is something to undo.
    if (shown.current) { shown.current = false; setInView(false); }
  }, []);

  // A scroll that never ends still ends when the screen goes away.
  useEffect(() => () => { if (idle.current) clearTimeout(idle.current); }, []);

  return useMemo(() => ({ ref, inView, check, rearm }), [inView, check, rearm]);
}
