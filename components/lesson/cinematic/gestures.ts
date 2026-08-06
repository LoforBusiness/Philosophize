import { emoteLive } from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// WHEN A HAND MOVES FAST ENOUGH TO BE HEARD, AND WHICH SOUND IT MAKES.
//
// Same principle as ./footfalls: solved from the file that draws the motion, so
// the two cannot disagree. A gesture's accents in `emoteLive` are driven by the
// BEAT clock with decay envelopes, so where a hand is fast is a property of the
// pose code and can be worked out once at module scope.
//
// ── WHAT COUNTS AS FAST, AND WHY IT IS MEASURED OVER A WINDOW ───────────────
//
// Not frame-to-frame speed. Several poses end a lift arc on
// `sin(min(bt,1.5)/1.5·π)`, which freezes the slope while the position stays
// continuous, and a finite difference reports a spike on nearly every code.
// Chasing those would put a whoosh on ten gestures that do not move.
//
// The measure is TRAVEL: how far a hand actually gets inside 120ms.
//
//     idle talking beat                      2.1 units
//     a hand lifting to point                7.8 – 9.3
//     a stamp, a celebrate-bounce, a lever  11.6 – 17.6
//
// Threshold 7.5 — three and a half times the talking floor. On a figure whose
// whole arm is 33 units, 7.5 in a tenth of a second is a quarter of an arm
// length: a gesture, not a fidget.
//
// ── AND WHICH OF THE THREE ──────────────────────────────────────────────────
//
// There are three gesture sounds and the choice between them is MEASURED, not
// picked per lesson. A sleeve, a fast hand and a heavy swing differ in exactly
// the two things this can already see — how fast the hand goes, and how long it
// keeps going — so the sound follows the motion for free, in all 102 lessons,
// without anybody deciding anything per beat.
//
// ── WALKING BEATS ARE EXCLUDED, DELIBERATELY ────────────────────────────────
//
// While a figure walks its arms are driven by `walk()`, not `emoteLive`, and the
// beat's gesture blends in only over the last 22%. Measuring the gesture in
// isolation would describe motion that is mostly not on screen yet — and the walk
// already has footfalls, so a whoosh over the top of them is just noise.
// ─────────────────────────────────────────────────────────────────────────────

// 12, not 7.5. At 7.5 this fired on fourteen of the app's poses including a hand
// merely lifting to point, and a whoosh over a hand that is only rising reads as
// unmotivated — "I don't know why I'm hearing that". The instruction is now the
// threshold: ONLY when it is unmistakable that the hand moved quickly. Measured
// across the whole pose table that leaves three — the stamp at 17.6, the
// celebrate-bounce at 13.8 and the lever-yank at 13.9 — and nothing else.
const THRESHOLD = 12;
const WINDOW = 0.12;
const HZ = 400;

/** sleeve · fast hand · heavy swing — the index the sound layer's ladder wants. */
export const SLEEVE = 0;
export const FAST = 1;
export const HEAVY = 2;

export interface Swish {
  /** Seconds into the beat, at the middle of the fast window. */
  at: number;
  /** Which of the three gesture sounds this movement is. */
  kind: number;
}

/**
 * Every audible hand sweep in pose `code`, and which sound each one is.
 *
 * Empty for most poses, because most poses are a held position with a talking
 * hand. A whoosh over a hand that is not moving is the crash-sound mistake with
 * the picture and the sound the other way round.
 */
export function swishes(code: number, dur: number): Swish[] {
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

  const out: Swish[] = [];
  let last = -1;
  for (let k = 1; k < travel.length - 1; k++) {
    if (travel[k] < THRESHOLD) continue;
    if (travel[k] < travel[k - 1] || travel[k] < travel[k + 1]) continue;
    const at = (k + w) / HZ - WINDOW / 2;
    if (last >= 0 && at - last < 0.25) continue;   // one whoosh per sweep
    last = at;

    // HOW LONG THE HAND KEEPS MOVING, which is what separates a flick from a
    // swing. Both can peak at the same speed; only one sustains.
    let span = 0;
    for (let j = k; j < travel.length && travel[j] > travel[k] * 0.5; j++) span++;
    for (let j = k - 1; j >= 0 && travel[j] > travel[k] * 0.5; j--) span++;
    const secondsFast = span / HZ;

    const peak = travel[k];
    let kind = SLEEVE;
    if (secondsFast <= 0.20) kind = FAST;                 // a flick: quick and sharp
    else if (secondsFast >= 0.34) kind = HEAVY;           // a swing: big and sustained
    out.push({ at, kind });
  }
  return out;
}

/**
 * Every beat's gestures, worked out once at module scope from a scene's pose track.
 *
 * `walked[i]` says whether the figure travels into beat i; those beats are skipped
 * for the reason in the header. Beat 0 is skipped too — the figure is placed there
 * holding its pose, it does not perform it.
 */
export function swishTrack(codes: number[], walked: boolean[], durs: number[]): Swish[][] {
  return codes.map((c, i) => (i === 0 || walked[i] ? [] : swishes(c, durs[i] ?? 4)));
}
