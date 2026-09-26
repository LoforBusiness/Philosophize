import { useEffect, useState } from 'react';
import { wanderOff } from './tourFlag';

// ─────────────────────────────────────────────────────────────────────────────
// WHAT A SCENE MOUNTS: THIS BEAT'S THINGS, AND THE LAST BEAT'S ONLY WHILE THEY FADE.
//
// Learned on logic-arguments-1 (2026-09-25), and needed by every scene that brings a
// prop, a figure or a card on for some beats and not others:
//
//   · Unmounting a thing on the tap makes it VANISH — the owner saw the two speakers
//     pop out of existence as the narrator arrived.
//   · Leaving it mounted at opacity 0 is invisible to the reader and fully visible to
//     the must-box probe, which reads each element's OWN opacity and not its parents'
//     — so every beat's box would carry every prop, and the camera could never push in.
//
// So a thing from the previous beat stays mounted for `ms` after the tap, long enough
// for its fade, and then goes. Under the measuring harness (`wanderOff`) it goes at
// once, because a must-box records what the BEAT stages, and the probe's first read
// lands inside the fade.
//
// WHY THIS IS SAFE TO COMBINE WITH A FADE DRIVEN BY `bi`/`bt`: React's beat decides only
// whether a thing EXISTS; how visible it is must come from the shared beat index and
// clock, read together, never from React's `i` and `bt` mixed — on a device the clock's
// rewind reaches the UI thread a frame after React commits (see SpeechBox.tsx).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns `on(a)`: whether a thing whose per-beat flags are `a` should be mounted on
 * beat `i` — on this beat, or on the last one while it is still fading out.
 */
export function useLinger(i: number, ms = 600): (a: readonly (number | boolean)[]) => boolean {
  const [settledAt, setSettledAt] = useState(-1);
  useEffect(() => {
    const t = setTimeout(() => setSettledAt(i), ms);
    return () => clearTimeout(t);
  }, [i, ms]);
  const lingering = settledAt !== i && !wanderOff();
  return (a) => !!a[i] || (lingering && i > 0 && !!a[i - 1]);
}
