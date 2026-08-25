import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
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
// ~890 nodes and 45 SVGs, so ANY state change re-renders all of it in one
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
// ── AND THAT WAS NOT ENOUGH, BECAUSE THE COST WAS NEVER THE TIMING ──────────
//
// The same reader, later: "the app will begin to lag after completing a lesson
// and when I go to the profile and scroll, it lags a lot … this may not happen
// every time but it happens a good amount." Measured the same way, on a fresh
// visit to Profile, with a controlled bisect — the same remount, the same first
// paint, the same measure calls, and the ONLY variable being whether the state
// update fires at all:
//
//   with the setState        worst frame 976ms · 1148ms of script
//   with it suppressed       worst frame  23ms ·   88ms of script
//
// Deferring the render to scroll-idle moved the stall; it did not pay for it.
// The whole cost is that ONE BOOLEAN LIVED IN THE SCREEN. So it does not live
// there any more: this hook keeps its flags in refs, publishes them through a
// subscription, and the CHART holds the state. The screen never re-renders for
// it at all, and a screen of 890 nodes is no longer one `setState` away from a
// blocking second.
//
// It is the same shape as the fix `ACounter` is: the number was never the
// problem, the React render behind it was.
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
// looked at the chart once silently disqualified every look after it.
// `setActive(false)` reopens the latch when the reader leaves the screen: the
// next visit has to earn its own measurement, so nothing plays to an empty room
// and nothing is withheld from a reader who is sitting there watching it.
//
// The focus flag is folded in here rather than kept beside it, and that is not
// tidiness: it was Profile's OTHER `useState`, and it fired on every arrival and
// every departure — the same blocking commit, twice per visit, for a boolean
// that fed the same single prop.
// ─────────────────────────────────────────────────────────────────────────────

export interface InView {
  /** Attach to the element being watched. Must be a host view. */
  ref: React.RefObject<View | null>;
  /** Call from the scroll view's `onScroll` and the element's `onLayout`. */
  check: () => void;
  /**
   * The screen is the one the reader is looking at, or it is not. `false` also
   * forgets that the element was seen — a look is over when the reader leaves,
   * and the next visit measures again.
   */
  setActive: (on: boolean) => void;
  /** For `useSeen`. Nothing else should need these two. */
  subscribe: (cb: () => void) => () => void;
  get: () => boolean;
}

/**
 * A WATCHER THAT NEVER FIRES, for a caller that does not have one.
 *
 * `useSeen` is a hook and hooks cannot be conditional (§17's rule 1), so a
 * component whose watcher is optional still has to call it with something. This
 * is that something: stable, inert, and shared, so it costs one object for the
 * whole app rather than one per render.
 */
export const NO_VIEW: InView = {
  ref: { current: null },
  check: () => {},
  setActive: () => {},
  subscribe: () => () => {},
  get: () => false,
};

/** How long after the last `check` counts as "they have stopped scrolling". */
const IDLE_MS = 120;

/**
 * `fraction` is how much of the element must be within the window before it
 * counts as looked at. See `seenEnough`, which is where the arithmetic and the
 * reasoning about erring early both live.
 */
export function useInView(fraction = 0.65): InView {
  const ref = useRef<View | null>(null);
  // `measureInWindow` is asynchronous, and a fast scroll can queue a dozen before
  // the first answers. One in flight at a time is plenty.
  const busy = useRef(false);
  const done = useRef(false);
  // Seen, but not yet announced — see the scroll-idle note in the header.
  const armed = useRef(false);
  const shown = useRef(false);
  const active = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subs = useRef(new Set<() => void>()).current;

  const emit = useCallback(() => { subs.forEach((cb) => cb()); }, [subs]);

  const settle = useCallback(() => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => {
      idle.current = null;
      if (armed.current && !shown.current) { shown.current = true; emit(); }
    }, IDLE_MS);
  }, [emit]);

  const check = useCallback(() => {
    // Already seen: the only thing left to do is notice that the scroll has
    // stopped, so the held announcement can go out.
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
        // fire it twice. Only the announcement waits.
        done.current = true;
        armed.current = true;
        settle();
      }
    });
  }, [fraction, settle]);

  const setActive = useCallback((on: boolean) => {
    if (active.current === on) return;
    active.current = on;
    if (!on) {
      if (idle.current) { clearTimeout(idle.current); idle.current = null; }
      done.current = false;
      armed.current = false;
      shown.current = false;
    }
    emit();
  }, [emit]);

  const subscribe = useCallback((cb: () => void) => {
    subs.add(cb);
    return () => { subs.delete(cb); };
  }, [subs]);

  // The one value anybody reads: on this screen, on this visit, on screen.
  const get = useCallback(() => active.current && shown.current, []);

  // A scroll that never ends still ends when the screen goes away.
  useEffect(() => () => { if (idle.current) clearTimeout(idle.current); }, []);

  // STABLE FOREVER. Every field is a ref or a `useCallback` with no changing
  // dependency, so the object handed to `onScroll` and to a focus effect never
  // changes identity — which is what stops the focus effect tearing down and
  // rebuilding the visit, and what lets the screen hold this without ever
  // re-rendering for it.
  return useMemo(
    () => ({ ref, check, setActive, subscribe, get }),
    [check, setActive, subscribe, get],
  );
}

/**
 * THE FLAG, HELD BY WHOEVER ACTUALLY NEEDS IT.
 *
 * Call this in the component the animation belongs to, never in the screen. That
 * placement is the entire performance fix above: a re-render here is one chart,
 * a re-render in the screen is nine hundred nodes.
 */
export function useSeen(view: InView): boolean {
  return useSyncExternalStore(view.subscribe, view.get, view.get);
}
