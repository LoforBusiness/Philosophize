// ─────────────────────────────────────────────────────────────────────────────
// THE CAMERA — where the reader is standing, beat by beat.
//
// ZERO IMPORTS, the same rule as rig.ts and tone.ts: with no React in the file
// the whole shot list can be run in plain Node and the question "does this shot
// show anything that is not there?" answered by arithmetic instead of by
// squinting at a screenshot. `checkShots` below is that answer.
//
// ── HOW IT COMPOSES WITH THE BAND ───────────────────────────────────────────
//
// A lesson already declares a BAND: the [top, bottom] slice of the 400×560
// design space its art occupies, which the player crops to and scales up. The
// camera sits INSIDE that — it moves the scene under a fixed crop, it does not
// move the crop.
//
// That has one consequence which is the whole safety story of this file:
//
//   ** A SHOT MAY NEVER SCALE BELOW 1. **
//
// s = 1 is the framing the band was measured for. Push in (s > 1) and you see
// less, which is always safe. Pull back (s < 1) and you see MORE than the band
// was measured against — the empty paper beyond the art, the cut-off bottom of a
// prop nobody finished drawing because it was never visible. Every "the camera
// pulls back to reveal everything" beat is therefore written as *starting* tight
// and RETURNING to 1, never as going wider than 1.
//
// ── THE TRANSFORM ───────────────────────────────────────────────────────────
//
// Applied with `transformOrigin: '0% 0%'`, so screen = translate + scale · point:
//
//     translateX = STAGE_W / 2 − cx · s
//     translateY = STAGE_H / 2 − cy · s
//
// which puts scene point (cx, cy) at the centre of the design space at any scale.
// The neutral shot is therefore (200, 280, 1) — dead centre, no magnification —
// and it is what a lesson with no shot list gets, for free, by not rendering the
// camera layer at all.
// ─────────────────────────────────────────────────────────────────────────────

export const STAGE_W = 400;
export const STAGE_H = 560;

export interface Shot {
  /** Scene x to centre on. */
  cx: number;
  /** Scene y to centre on. */
  cy: number;
  /** Magnification. NEVER below 1 — see the note above. */
  s: number;
  /**
   * Seconds to travel here from the previous shot.
   *
   * A move is not free: the reader is reading while it happens, so anything much
   * under half a second reads as a jump-cut and anything over about two seconds
   * reads as the app being slow. A beat that also walks the figure should match
   * the walk, or the camera arrives and then waits.
   */
  tr?: number;
}

/** Dead centre, no magnification — what a lesson without a camera already has. */
export const NEUTRAL: Shot = { cx: STAGE_W / 2, cy: STAGE_H / 2, s: 1 };

/** Smoothstep, so a move eases out of rest and back into it. */
export function ease(t: number): number {
  'worklet';
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  return u * u * (3 - 2 * u);
}

/**
 * Where the camera is `t` seconds into a beat, travelling from `from` to `to`.
 *
 * Scale is interpolated GEOMETRICALLY (in log space) rather than linearly. A
 * linear ramp from 2.4 to 1.0 spends most of its time near the wide end and then
 * rushes the last of the push, because what the eye reads as "speed of zoom" is
 * the ratio per second, not the difference. This is the same reason camera rigs
 * are geared in stops.
 */
export function shotAt(from: Shot, to: Shot, t: number): { cx: number; cy: number; s: number } {
  'worklet';
  const tr = to.tr ?? 0.8;
  const u = ease(tr <= 0 ? 1 : t / tr);
  return {
    cx: from.cx + (to.cx - from.cx) * u,
    cy: from.cy + (to.cy - from.cy) * u,
    s: from.s * Math.pow(to.s / from.s, u),
  };
}

/**
 * The rectangle of SCENE the reader can actually see in a given shot, given the
 * lesson's band. This is what makes a shot list checkable.
 */
export function visibleWindow(shot: Shot, band: [number, number]) {
  const tx = STAGE_W / 2 - shot.cx * shot.s;
  const ty = STAGE_H / 2 - shot.cy * shot.s;
  return {
    left: (0 - tx) / shot.s,
    right: (STAGE_W - tx) / shot.s,
    top: (band[0] - ty) / shot.s,
    bottom: (band[1] - ty) / shot.s,
  };
}

/**
 * Every way a shot list can show the reader something that is not there.
 *
 * Returns a list of complaints, empty when the list is sound. Run from a scene's
 * own header comment or a scratch script — the point is that the numbers below
 * are checked rather than asserted.
 *
 * @param ground the scene's ground line, if it has one. A shot whose window ends
 *   above the ground leaves the figure standing on nothing.
 */
export function checkShots(
  shots: Shot[], band: [number, number], ground?: number,
): string[] {
  const out: string[] = [];
  shots.forEach((sh, i) => {
    if (sh.s < 1) out.push(`shot ${i}: scale ${sh.s} is below 1 — it shows paper the band was never measured for`);
    const w = visibleWindow(sh, band);
    if (w.top < -1) out.push(`shot ${i}: window top ${w.top.toFixed(0)} is above the design space`);
    if (w.bottom > STAGE_H + 1) out.push(`shot ${i}: window bottom ${w.bottom.toFixed(0)} is below the design space (${STAGE_H})`);
    if (w.left < -1) out.push(`shot ${i}: window left ${w.left.toFixed(0)} is off the design space`);
    if (w.right > STAGE_W + 1) out.push(`shot ${i}: window right ${w.right.toFixed(0)} is off the design space`);
    if (ground != null && w.bottom < ground - 1 && sh.s > 1.02) {
      out.push(`shot ${i}: window ends at ${w.bottom.toFixed(0)}, above the ground line ${ground} — the figure would stand on nothing`);
    }
    const tr = sh.tr ?? 0.8;
    if (i > 0 && tr > 0 && tr < 0.35) out.push(`shot ${i}: a ${tr}s move reads as a jump-cut`);
    if (tr > 2.4) out.push(`shot ${i}: a ${tr}s move is longer than the beat can hold`);
  });
  return out;
}
