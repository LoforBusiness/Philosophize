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
  /**
   * A decaying knock at the START of the beat, in scene units, for a beat where
   * something lands. Rides on top of the travel rather than replacing it, so a
   * push can arrive through a shake.
   *
   * This is the one thing the camera could not do before. Every other move is a
   * journey between two framings; a shake is the camera being HIT, which is a
   * different verb and needs its own term.
   */
  shake?: number;
  /**
   * How the travel eases. 'smooth' is a smoothstep and is right for almost
   * everything. 'back' overshoots and settles, which is what makes a whip-pan
   * read as thrown rather than driven.
   */
  e?: 'smooth' | 'back';
}

// ── THE MOVE VOCABULARY ──────────────────────────────────────────────────────
//
// A Shot says WHERE THE CAMERA ENDS UP. That is the right primitive and the wrong
// thing to write by hand: authoring ethics-ethics-8's eleven shots meant choosing
// eleven centres and eleven scales against that lesson's band and ground line, and
// FOUR OF THE FIRST ELEVEN were illegal — two ran off the bottom of the design
// space, one off the right edge, and one framed a figure who had walked out of it.
// At 102 lessons that error rate is not a tuning problem, it is a wall.
//
// So a Move says WHAT THE CAMERA DOES, and `resolveMoves` works out the numbers —
// clamping every one of them into the legal window. The author picks a subject and
// a verb; the arithmetic that used to go wrong one time in three is done once here.

/** How tight. Named rather than numeric so a lesson reads as direction, not maths. */
export type Framing = 'wide' | 'mid' | 'close' | 'tight';
const SCALE: Record<Framing, number> = { wide: 1, mid: 1.18, close: 1.4, tight: 1.72 };

export type MoveKind =
  | 'hold'   // stay exactly where the last beat left off. The most underused move.
  | 'push'   // ease in on something. The workhorse: tension, attention, arrival.
  | 'pull'   // ease back out to the whole stage. A reveal.
  | 'to'     // travel to a new subject at the same sort of tightness. A pan.
  | 'snap'   // hard cut. No travel at all.
  | 'whip'   // thrown to a new subject, overshoots, settles.
  | 'shake'  // something landed. Stays where it is and gets hit.
  | 'drift'; // barely moves, for the whole beat. Life without distraction.

export interface Move {
  k: MoveKind;
  /** Scene point to look at. Omitted keeps the previous beat's centre. */
  at?: [number, number];
  /** Omitted picks a sensible default for the verb. */
  framing?: Framing;
  /** Override the travel time. Omitted picks a default for the verb. */
  tr?: number;
  /** Shake only: how hard, in scene units. ~6 is a knock, ~14 is a slam. */
  amp?: number;
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
/** Overshoots past the target and settles. What makes a whip read as thrown. */
export function easeBack(t: number): number {
  'worklet';
  const u = t < 0 ? 0 : t > 1 ? 1 : t;
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
}

export function shotAt(from: Shot, to: Shot, t: number): { cx: number; cy: number; s: number } {
  'worklet';
  const tr = to.tr ?? 0.8;
  const raw = tr <= 0 ? 1 : t / tr;
  const u = to.e === 'back' ? easeBack(raw) : ease(raw);
  // THE KNOCK, and it is deliberately NOT part of the travel.
  //
  // A decaying oscillation from the beat's start, added after the interpolation
  // rather than folded into it. Two reasons: a shake must be able to happen during
  // a move (something lands while the camera is still arriving), and it must decay
  // on its own clock rather than on the travel's, or a slow push would stretch the
  // impact out into a wobble. Two frequencies that do not divide, so the second
  // bounce never lands on the first.
  let kx = 0;
  let ky = 0;
  const amp = to.shake ?? 0;
  if (amp > 0 && t < 1.1) {
    const decay = Math.exp(-5.2 * t);
    kx = amp * decay * Math.sin(t * 46);
    ky = amp * 0.62 * decay * Math.sin(t * 37 + 1.1);
  }
  return {
    cx: from.cx + (to.cx - from.cx) * u + kx,
    cy: from.cy + (to.cy - from.cy) * u + ky,
    s: from.s * Math.pow(to.s / from.s, u),
  };
}

/**
 * The nearest LEGAL shot to the one asked for.
 *
 * A shot is legal when its window sits inside the design space and does not end
 * above the ground line. Rather than reject an out-of-range request, this slides
 * the centre back inside — and only if that is not enough, eases the scale down
 * until it fits. Sliding first is what keeps the subject as close to framed as the
 * geometry allows; dropping scale first would zoom out of a shot that only needed
 * nudging.
 *
 * This is what turns a 4-in-11 authoring error rate into zero: an illegal shot is
 * no longer something to catch, it is something that cannot be expressed.
 */
export function fit(
  at: [number, number], s: number, band: [number, number], ground?: number,
): Shot {
  const bandH = band[1] - band[0];
  let scale = Math.max(1, s);
  // The window is STAGE_W/scale wide and bandH/scale tall, so at scale 1 it is the
  // whole design space and there is nothing to slide.
  for (let pass = 0; pass < 24; pass++) {
    const halfW = STAGE_W / (2 * scale);
    const halfH = bandH / (2 * scale);
    const midBand = (band[0] + band[1]) / 2;
    // Centre must sit far enough from each edge that the window stays inside.
    const cx = Math.min(Math.max(at[0], halfW), STAGE_W - halfW);
    let cy = Math.min(Math.max(at[1], midBand - (bandH / 2 - halfH)), midBand + (bandH / 2 - halfH));
    // …and the bottom of the window must not rise above the ground, or the figure
    // is standing on nothing.
    if (ground != null && scale > 1.02) {
      const bottom = (band[1] - (STAGE_H / 2 - cy * scale)) / scale;
      if (bottom < ground) cy += ground - bottom;
      cy = Math.min(Math.max(cy, midBand - (bandH / 2 - halfH)), midBand + (bandH / 2 - halfH));
    }
    const test: Shot = { cx, cy, s: scale };
    if (checkShots([test], band, ground).length === 0) return test;
    if (scale <= 1.001) return { cx: STAGE_W / 2, cy: (band[0] + band[1]) / 2, s: 1 };
    scale = Math.max(1, scale * 0.94); // ease out, do not jump to wide
  }
  return { cx: STAGE_W / 2, cy: (band[0] + band[1]) / 2, s: 1 };
}

/** Default travel time and tightness per verb. */
const VERB: Record<MoveKind, { tr: number; framing: Framing; e?: 'smooth' | 'back' }> = {
  hold:  { tr: 0.8,  framing: 'wide' },
  push:  { tr: 1.3,  framing: 'close' },
  pull:  { tr: 1.1,  framing: 'wide' },
  to:    { tr: 1.0,  framing: 'mid' },
  snap:  { tr: 0,    framing: 'close' },
  whip:  { tr: 0.55, framing: 'mid', e: 'back' },
  shake: { tr: 0.5,  framing: 'mid' },
  drift: { tr: 2.2,  framing: 'mid' },
};

/**
 * A lesson's shot list, from its moves. Every shot comes back legal.
 *
 * `band` and `ground` are the lesson's own, which is the point: the same move
 * means a different number in a scene whose art sits high than in one whose art
 * runs to the floor, and neither author should have to work that out.
 */
export function resolveMoves(
  moves: Move[], band: [number, number], ground?: number,
): Shot[] {
  const out: Shot[] = [];
  let prev: Shot = { cx: STAGE_W / 2, cy: (band[0] + band[1]) / 2, s: 1 };
  for (const m of moves) {
    const d = VERB[m.k];
    const framing = m.framing ?? d.framing;
    const at: [number, number] = m.at ?? [prev.cx, prev.cy];
    // `hold` and `shake` do not travel: they keep the framing they were handed.
    const s = m.k === 'hold' || m.k === 'shake' ? prev.s : SCALE[framing];
    const target = m.k === 'hold' || m.k === 'shake' ? { cx: prev.cx, cy: prev.cy, s } : fit(at, s, band, ground);
    const shot: Shot = {
      cx: target.cx,
      cy: target.cy,
      s: target.s,
      tr: m.tr ?? d.tr,
      ...(d.e ? { e: d.e } : {}),
      ...(m.k === 'shake' ? { shake: m.amp ?? 8 } : {}),
    };
    out.push(shot);
    prev = shot;
  }
  return out;
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
