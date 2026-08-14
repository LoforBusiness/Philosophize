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
  // THE WINDOW IS LINEAR IN THE CENTRE, which makes this exact rather than
  // iterative. Substituting the transform into visibleWindow:
  //
  //     left   = cx − STAGE_W / 2s          right  = cx + STAGE_W / 2s
  //     top    = cy + (band0 − STAGE_H/2)/s bottom = cy + (band1 − STAGE_H/2)/s
  //
  // so each edge moves one-for-one with the centre and the legal range for cx and
  // cy is a plain interval. The first version of this clamped against the BAND's
  // own extent instead, which is a different rectangle — it looked right and put
  // an illegal shot in 35 of 44 lessons, every one of them hanging the window off
  // the bottom of the design space. Solve the constraint the checker actually
  // tests, not one that resembles it.
  let scale = Math.max(1, s);
  for (let pass = 0; pass < 30; pass++) {
    const halfW = STAGE_W / (2 * scale);
    const oTop = (band[0] - STAGE_H / 2) / scale;
    const oBot = (band[1] - STAGE_H / 2) / scale;
    const cxLo = halfW - 1;
    const cxHi = STAGE_W + 1 - halfW;
    let cyLo = -1 - oTop;
    let cyHi = STAGE_H + 1 - oBot;
    // The bottom of the frame must not rise above the ground, or the figure is
    // standing on nothing. A floor on cy, not a separate pass.
    if (ground != null && scale > 1.02) cyLo = Math.max(cyLo, ground - oBot);
    if (cxLo <= cxHi && cyLo <= cyHi) {
      const shot: Shot = {
        cx: Math.min(Math.max(at[0], cxLo), cxHi),
        cy: Math.min(Math.max(at[1], cyLo), cyHi),
        s: scale,
      };
      // Belt and braces: the closed form above should make this always true, and
      // if it ever is not, easing the scale is still the right answer.
      if (checkShots([shot], band, ground).length === 0) return shot;
    }
    if (scale <= 1.001) break;
    scale = Math.max(1, scale * 0.94); // ease out, never jump straight to wide
  }
  // Nothing at any scale fits — only possible for a band taller than the design
  // space. Neutral is always legal.
  return { cx: STAGE_W / 2, cy: STAGE_H / 2, s: 1 };
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

// ── THE CAMERA A LESSON GETS FOR FREE ────────────────────────────────────────
//
// 45 of the 100 scenes already build `const X = BEATS.map((b) => b.x ?? n)` — the
// figure's position, beat by beat, because travelStance needs it. That track is
// also, for nothing, the answer to "what should the camera be looking at", which
// is the expensive half of authoring a shot list.
//
// So `followMoves` reads the staging and writes the moves. It is not an automatic
// camera in the sense of guessing what a beat is ABOUT — it cannot know that. It
// knows where the figure is and whether they just walked, and that is enough to
// choose a verb honestly:
//
//   the figure moved a long way   → `to`, and go with them
//   the figure moved a little     → `drift`, so the frame breathes rather than snaps
//   the figure has not moved      → `hold` or a slow `push`, alternating
//   a graded question             → `pull`, all the way back to scale 1
//   the quote                     → `push` close; it is the one line worth leaning in for
//   the summary                   → `pull`; the stage is hidden under it anyway
//
// THE QUESTION BEATS ARE THE RULE THAT IS NOT NEGOTIABLE. Answer targets are
// Pressables, and scale 1 is the identity transform — a tap must not have to
// survive a camera offset to land on the thing the reader aimed at. ethics-8
// worked this out by hand for one lesson; here it is structural.
//
// `seed` is what stops 51 lessons moving identically: it shifts which of the
// equivalent verbs a still beat picks, so one lesson holds where the next drifts.

/** What a beat is, as far as the camera needs to care. */
export type BeatKind = 'plain' | 'question' | 'quote' | 'summary';

/**
 * A move per beat, from the figure's own track.
 *
 * @param x       the scene's per-beat figure x — the array it already builds
 * @param kinds   what each beat is
 * @param seed    per-lesson variation; any stable number (a name hash will do)
 * @param ground  the scene's ground line, default the kit's 500
 */
export function followMoves(
  x: number[], kinds: BeatKind[], seed = 0, ground = 500,
): Move[] {
  // Chest height: the figure stands ON the ground, so looking AT the ground line
  // frames their feet and cuts their head off. ~78 up is the middle of the body.
  const eye = ground - 78;
  const out: Move[] = [];
  for (let i = 0; i < x.length; i++) {
    const kind = kinds[i] ?? 'plain';
    if (kind === 'question' || kind === 'summary') {
      out.push({ k: 'pull' });
      continue;
    }
    if (kind === 'quote') {
      out.push({ k: 'push', at: [x[i], eye], framing: 'close' });
      continue;
    }
    const moved = i === 0 ? 0 : Math.abs(x[i] - x[i - 1]);
    if (i === 0) {
      out.push({ k: 'push', at: [x[i], eye], framing: 'mid', tr: 1.4 });
    } else if (moved > 140) {
      // Right across the stage. Thrown rather than driven — this is the one place
      // an overshoot is earned, because the camera is being dragged by something
      // that outran it.
      out.push({ k: 'whip', at: [x[i], eye], framing: 'mid' });
    } else if (moved > 60) {
      out.push({ k: 'to', at: [x[i], eye], framing: 'mid', tr: 1.2 });
    } else if (moved > 12) {
      out.push({ k: 'drift', at: [x[i], eye], framing: 'mid' });
    } else {
      // STANDING STILL, AND MOSTLY THE CAMERA SHOULD TOO.
      //
      // A three-beat cycle rather than a two-beat one, so only one still beat in
      // three pushes in and the other two hold or come back to the whole stage.
      // The first pass alternated push/hold and left 64% of every lesson magnified
      // — which is not a camera with ideas, it is a camera that never rests, and
      // the moves stop registering as moves. The rest is what makes the pushes
      // mean something.
      const phase = (i + seed) % 3;
      out.push(
        phase === 0 ? { k: 'push', at: [x[i], eye], framing: 'close', tr: 1.6 }
        : phase === 1 ? { k: 'pull' }
        : { k: 'hold' },
      );
    }
  }
  return out;
}

/**
 * What a beat is, from the beat itself.
 *
 * Structurally typed rather than importing BaseBeat, because this file has no
 * imports and that is what lets the whole camera be run and checked in Node.
 */
export function kindOf(
  b: { summary?: unknown; quote?: unknown; mc?: unknown; interact?: unknown },
): BeatKind {
  if (b.summary) return 'summary';
  if (b.mc || b.interact) return 'question';
  if (b.quote) return 'quote';
  return 'plain';
}

/** A stable small number from a lesson's name, so `seed` never has to be chosen. */
export function seedOf(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 7;
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
/** A rectangle in scene coordinates — what a beat is actually about. */
export interface Box { x: number; y: number; w: number; h: number }

/**
 * KEEP THE SUBJECT IN THE SHOT.
 *
 * A camera verb takes `at: [x, y]` — a POINT. That is the whole bug a reader hit:
 * the shot was centred near the question, and nothing in the maths knew how BIG
 * the question was, so its corners fell outside the window and part of a tappable
 * answer was cropped. A point cannot be cropped; a box can.
 *
 * This takes the box the beat is about and returns the same shot, pulled only as
 * far as it must be for the box to fit:
 *
 *   · the scale is REDUCED to fit, never raised — this is a floor on what must be
 *     visible, not a re-framing. A shot already wide enough comes back untouched,
 *     which is why every other beat's camera work survives.
 *   · then the centre slides the shortest distance that brings the box inside.
 *
 * The stage clamp is applied FIRST and containment second, so if the two ever
 * disagree the box wins: a sliver of blank paper at the edge of the frame is a
 * far cheaper fault than a button the reader cannot see or press.
 */
export function containShot(shot: Shot, box: Box | null, band: [number, number]): Shot {
  'worklet';
  if (!box || box.w <= 0 || box.h <= 0) return shot;
  const bandH = band[1] - band[0];
  const fitS = Math.min(STAGE_W / box.w, bandH / box.h);
  const s = Math.max(1, Math.min(shot.s, fitS));
  const halfW = STAGE_W / (2 * s);
  const topOff = (band[0] - STAGE_H / 2) / s;
  const botOff = (band[1] - STAGE_H / 2) / s;

  let cx = shot.cx;
  let cy = shot.cy;
  // stage first …
  cx = Math.max(halfW, Math.min(STAGE_W - halfW, cx));
  cy = Math.max(-topOff, Math.min(STAGE_H - botOff, cy));
  // … the subject second, so the subject wins.
  cx = Math.min(cx, box.x + halfW);
  cx = Math.max(cx, box.x + box.w - halfW);
  cy = Math.min(cy, box.y - topOff);
  cy = Math.max(cy, box.y + box.h - botOff);
  return { ...shot, cx, cy, s };
}

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

// ─────────────────────────────────────────────────────────────────────────────
// THE TOUR — group K. A beat is a sequence of framings, not one framing.
//
// WHY THIS EXISTS, in one paragraph. H60c says a shot may never crop anything the
// beat draws, and a beat draws everything it will ever draw, so one framing per
// beat has to be as wide as the widest thing in it. Measured: mean shot 1.124 →
// 1.017, 72% of beats at exactly 1.0. The camera was made safe by being made
// timid. Splitting the beat into STATIONS moves the containment guarantee from
// "per beat" to "per instant", because at any instant the only thing that has to
// fit is the thing being shown now — and the same 884 beats then support 1.671×.
//
// THE CLOCK IS THE OTHER HALF, and it is the half that makes it teach rather than
// merely swoop. Scene time does not advance while the camera is in transit (K1),
// so an animation cannot play to a frame that is pointed somewhere else. A scene
// obeys this by doing nothing at all: the player gates the `bt` it hands over, so
// all 102 scenes comply without one of them being edited.
// ─────────────────────────────────────────────────────────────────────────────

/** How close a station may ever go. `tight` — past this the frame is inside the figure (K5). */
export const STATION_CAP = SCALE.tight;

export interface Station {
  /** The rectangle this station exists to show. Contained whole, or the station is pointless. */
  box: Box;
  /** Seconds to travel here from the previous station (or, for the first, from the previous beat). */
  tr: number;
  /**
   * Seconds to sit here once arrived — the window of SCENE time this station owns.
   *
   * Ignored on the last station, which holds until the reader taps. That is not a
   * special case bolted on: K3 makes the last station the beat's full must-box, so
   * "hold on the last one" and "the beat rests on the shot it has today" are the
   * same statement.
   */
  dwell: number;
}

export type Tour = Station[];

/**
 * The legal shot that frames one station's box as tightly as K5 allows.
 *
 * Three steps, and the order is the point: pick the scale that just contains the
 * box, clamp the whole window inside the design space and above the ground with
 * `fit`, and then run `containShot` anyway. The third step looks redundant and is
 * not — `fit`'s clamp can slide a centre that `containShot` would then have to
 * slide back, and containment is the guarantee, so it goes last.
 */
export function stationShot(
  box: Box, band: [number, number], ground?: number, cap = STATION_CAP,
): Shot {
  const bandH = band[1] - band[0];
  const want = Math.min(STAGE_W / Math.max(box.w, 1), bandH / Math.max(box.h, 1));
  const s = Math.max(1, Math.min(cap, want));
  const at: [number, number] = [box.x + box.w / 2, box.y + box.h / 2];
  return containShot(fit(at, s, band, ground), box, band);
}

/** Every station of one beat, as legal shots. Precomputed — never per frame. */
export function tourShots(
  tour: Tour, band: [number, number], ground?: number, cap = STATION_CAP,
): Shot[] {
  return tour.map((st, i) => ({ ...stationShot(st.box, band, ground, cap), tr: i === 0 ? st.tr : st.tr }));
}

/**
 * WHERE THE TOUR IS, AND WHAT TIME THE SCENE THINKS IT IS.
 *
 * `rt` is the raw beat clock — real seconds since the beat began, which is what the
 * camera runs on. The returned `g` is the GATED clock, which is what the scene runs
 * on: it accumulates only while the camera is parked.
 *
 *   g(rt) = Σ (dwell already served by earlier stations) + (time parked at this one)
 *
 * so a scene that reveals its content over `bt` has that reveal chopped into the
 * same windows the camera is visiting, in the same order — which is exactly why K2
 * insists the station order be the measured reveal order and not reading order.
 *
 * A worklet, and it allocates one small object per frame, which Reanimated handles.
 * Written against flat number arrays rather than the Station[] so the whole thing
 * can cross into the UI thread without carrying a nested structure.
 */
export function tourAt(
  trs: readonly number[], dwells: readonly number[], rt: number,
): { k: number; t: number; g: number } {
  'worklet';
  const n = trs.length;
  if (n === 0) return { k: 0, t: rt, g: rt };
  let start = 0;
  let served = 0;
  for (let j = 0; j < n; j++) {
    const arrive = start + trs[j];
    const last = j === n - 1;
    // Still on the way to j.
    if (rt < arrive) return { k: j, t: rt - start, g: served };
    // Parked at j. The last station holds for the rest of the beat, so its dwell is
    // not a bound — this is where the free-running tail comes from.
    const parked = rt - arrive;
    if (last || parked < dwells[j]) {
      return { k: j, t: trs[j], g: served + parked };
    }
    served += dwells[j];
    start = arrive + dwells[j];
  }
  return { k: n - 1, t: trs[n - 1], g: served };
}

/** When the tour is over — the moment the camera reaches its last station. */
export function tourEnd(trs: readonly number[], dwells: readonly number[]): number {
  let t = 0;
  for (let j = 0; j < trs.length; j++) {
    t += trs[j];
    if (j < trs.length - 1) t += dwells[j];
  }
  return t;
}

/**
 * Every way a tour can fail group K. The offline half of `npm run check:tour`.
 *
 * `wide` is the beat's full must-box — K3's closing station — so this can check
 * that the tour actually ends on it rather than trusting the generator to have
 * added it.
 */
export function checkTour(
  tour: Tour, band: [number, number], wide: Box | null, ground?: number,
): string[] {
  const out: string[] = [];
  if (!tour.length) return out;
  if (tour.length > 4) out.push(`${tour.length} stations — K8 allows 4 including the closing wide`);
  const shots = tourShots(tour, band, ground);
  shots.forEach((sh, i) => {
    if (sh.s < 1) out.push(`station ${i}: scale ${sh.s.toFixed(2)} is below 1`);
    if (sh.s > STATION_CAP + 0.001) out.push(`station ${i}: ${sh.s.toFixed(2)}× is past the ${STATION_CAP}× ceiling (K5)`);
    const w = visibleWindow(sh, band);
    const b = tour[i].box;
    // K3/H60c per station: the box this station exists for must be inside its window.
    if (b.x < w.left - 0.5 || b.x + b.w > w.right + 0.5 || b.y < w.top - 0.5 || b.y + b.h > w.bottom + 0.5) {
      out.push(`station ${i}: its own box is not inside its shot — containment failed (K3)`);
    }
    if (tour[i].tr > 0 && tour[i].tr < 0.35) out.push(`station ${i}: a ${tour[i].tr}s travel reads as a jump-cut (K8)`);
    if (tour[i].tr > 1.2) out.push(`station ${i}: a ${tour[i].tr}s travel is longer than K8 allows`);
    if (i < tour.length - 1 && tour[i].dwell < 0.7) {
      out.push(`station ${i}: a ${tour[i].dwell}s dwell is too short to read (K8)`);
    }
  });
  const total = tourEnd(tour.map((s) => s.tr), tour.map((s) => s.dwell));
  if (total > 5.5) out.push(`the tour takes ${total.toFixed(1)}s to complete — K8 caps it at 5.5s`);
  // K3 — the last station is the whole beat.
  if (wide && tour.length > 1) {
    const l = tour[tour.length - 1].box;
    const holds = l.x <= wide.x + 0.5 && l.y <= wide.y + 0.5
      && l.x + l.w >= wide.x + wide.w - 0.5 && l.y + l.h >= wide.y + wide.h - 0.5;
    if (!holds) out.push('the last station is not the beat\'s full must-box — the reader never sees the whole picture (K3)');
  }
  return out;
}
