import { emoteLive } from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// WHEN A HAND MOVES FAST ENOUGH TO BE HEARD.
//
// Same principle as ./footfalls: the sound is solved from the file that draws the
// motion, so the two cannot disagree. A gesture's accents in `emoteLive` are driven
// by the BEAT clock with decay envelopes — `Math.max(0, 1 - bt / 1.7)` and friends —
// so where a hand is fast is a property of the pose code and nothing else, and can
// be worked out once at module scope.
//
// ── WHAT COUNTS AS FAST, AND WHY IT IS MEASURED OVER A WINDOW ───────────────
//
// Not frame-to-frame speed. Several poses end their lift arc with
// `Math.sin(Math.min(bt, 1.5) / 1.5 * Math.PI)`, which freezes at bt 1.5 — the
// position stays continuous but the slope drops to zero, and a finite difference
// reports a spike there on almost every code. Chasing those would have put a
// whoosh on ten gestures that do not move.
//
// So the measure is TRAVEL: how far the hand actually gets inside a 120ms window.
// A sweep covers ground; a slope change covers none. Measured across the whole
// gesture table, that separates cleanly:
//
//     idle talking beat                      2.1 units / 120ms
//     a hand lifting to point                7.8 – 9.3
//     a stamp, a celebrate-bounce, a lever   11.6 – 17.6
//
// The threshold is 7.5 — three and a half times the talking floor, and low enough
// to catch a recoil. On a figure whose whole arm is 33 units, 7.5 in a tenth of a
// second is a quarter of an arm length: a gesture, not a fidget.
//
// ── WALKING BEATS ARE EXCLUDED, DELIBERATELY ────────────────────────────────
//
// While a figure walks, its arms are driven by `walk()`, not by `emoteLive`, and
// the beat's gesture is blended in only over the last 22%. Measuring the gesture
// in isolation would describe motion that is mostly not on screen yet — and the
// walk already has footfalls, so a whoosh over the top of them makes a busy noise
// out of an ordinary crossing. A beat either walks or gestures.
// ─────────────────────────────────────────────────────────────────────────────

/** Units a hand must cover inside WINDOW to be worth hearing. */
const THRESHOLD = 7.5;
const WINDOW = 0.12;
const HZ = 400;

/**
 * Seconds into the beat at which pose `code` sweeps a hand fast enough to hear.
 *
 * One entry per sweep, placed at the middle of the fast window — where a whoosh's
 * energy belongs, rather than at its leading edge. Empty for the many poses that
 * are a held position with a talking hand, which is most of them.
 */
export function swishTimes(code: number, dur: number): number[] {
  const n = Math.max(1, Math.round(dur * HZ));
  const w = Math.round(WINDOW * HZ);
  if (n <= w) return [];

  // A fixed idle clock. `emoteHold`'s drift is ~1.3 units and slow, an order below
  // the threshold, so which moment of the app's life this is sampled at cannot
  // change the answer.
  const hands: { x: number; y: number }[][] = [];
  for (let i = 0; i <= n; i++) {
    const bt = i / HZ;
    const s = emoteLive(code, 3 + bt, bt);
    hands.push([s.fistR, s.fistL]);
  }

  const travel: number[] = [];
  for (let i = w; i <= n; i++) {
    let best = 0;
    for (let h = 0; h < 2; h++) {
      const a = hands[i - w][h];
      const b = hands[i][h];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (d > best) best = d;
    }
    travel.push(best);
  }

  // Local maxima above the threshold, one per sweep.
  const out: number[] = [];
  let last = -1;
  for (let k = 1; k < travel.length - 1; k++) {
    if (travel[k] < THRESHOLD) continue;
    if (travel[k] < travel[k - 1] || travel[k] < travel[k + 1]) continue;
    // The window ENDS at k, so the motion it measured is centred half a window back.
    const at = (k + w) / HZ - WINDOW / 2;
    if (last >= 0 && at - last < 0.25) continue;   // one whoosh per sweep
    last = at;
    out.push(at);
  }
  return out;
}

/**
 * Every beat's whooshes, from a scene's pose-code track.
 *
 * `walked[i]` says whether the figure travels into beat i; those beats are skipped
 * for the reason in the header. Beat 0 is skipped too — the figure is placed there
 * holding its pose, it does not perform it.
 */
export function swishTrack(codes: number[], walked: boolean[], durs: number[]): number[][] {
  return codes.map((c, i) => (i === 0 || walked[i] ? [] : swishTimes(c, durs[i] ?? 4)));
}
