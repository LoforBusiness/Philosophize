// ─────────────────────────────────────────────────────────────────────────────
// PACING A BEAT ACROSS ITS VOICED LINE.
//
// The owner, after the first-lesson redesigns (2026-09-26): "instead of a very quick
// animation for one second, and then you have to wait 10 seconds before the words are
// done being read aloud … I just want more action." A beat's choreography is laid
// across the LINE the voice reads, in stages, rather than one ease at the start.
//
// A scene carries its lesson's line lengths as a constant copied from
// lib/narration/manifest.ts (`dur` per voiced beat). It cannot import the manifest:
// the offline checkers load scenes in plain Node, and the manifest `require`s audio.
// A beat with no voice (a question, a quote) paces over `FALLBACK_S`.
//
// Zero imports, like rig.ts: every function here is a worklet over plain numbers.
// ─────────────────────────────────────────────────────────────────────────────

/** Seconds a stage paces over when the beat has no voiced line. */
export const FALLBACK_S = 4;

/** The seconds a beat's action is paced over: its voiced line, or the fallback. */
export function lineOf(lines: readonly number[], n: number): number {
  'worklet';
  const s = lines[n];
  return s && s > 0 ? s : FALLBACK_S;
}

/**
 * How far through the stage [a, b] of its line a beat is, eased, 0 → 1. `a` and `b`
 * are FRACTIONS of the line, so a stage lands on the same words however long the
 * line is.
 */
export function stage(bt: number, line: number, a: number, b: number): number {
  'worklet';
  const u = (bt / line - a) / (b - a);
  const c = u < 0 ? 0 : u > 1 ? 1 : u;
  return c * c * (3 - 2 * c);
}

/** The same, without easing — for a motion that should hold one speed. */
export function stageLin(bt: number, line: number, a: number, b: number): number {
  'worklet';
  const u = (bt / line - a) / (b - a);
  return u < 0 ? 0 : u > 1 ? 1 : u;
}

/** Up over [a, m] and back down over [m, b]: a stage that happens and undoes itself. */
export function bump(bt: number, line: number, a: number, m: number, b: number): number {
  'worklet';
  return stage(bt, line, a, m) * (1 - stage(bt, line, m, b));
}
