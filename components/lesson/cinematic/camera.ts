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
/**
 * K4b — HOW FAR OFF THE MIDDLE A SHOT MAY LEAVE THE THING IT WAS AIMED AT.
 *
 * A share of the frame's width; 0.18 is a hair past the rule-of-thirds line, where a
 * subject stops reading as *placed* and starts reading as a camera that missed.
 *
 * The same number lives in `scripts/lib/tourrule.mjs`, and both files are zero-import
 * on purpose (that is what lets the whole camera be replayed in plain Node), so the
 * duplication is the price. If one moves, move the other.
 */
export const MAX_OFF_CENTRE = 0.18;

/**
 * `fit`, except that it gives the push up rather than aim it badly.
 *
 * `fit` may not let the window leave the design space, so the centre is clamped to
 * [200/s, 400 − 200/s]. Aim at a figure standing near the edge of the stage and the
 * clamp wins: the camera travels, arrives, and pins him against the frame edge.
 * Measured across the app, **488 pushed shots sat a median 19.4% off centre, 251 of
 * them past the thirds line, the worst at 39.5%** — "the camera moves to anything and
 * it is mainly to the left or right side of the screen".
 *
 * There is no scale that rescues it, and tightening makes it worse rather than better
 * (a wider frame has its centre pinned nearer the stage centre). So the answer is not
 * to go: fall back to the whole stage, where the reader sees everything and the
 * subject being off to one side is the composition rather than the camera.
 */
function centredFit(
  at: [number, number], s: number, band: [number, number], ground?: number,
): Shot {
  const shot = fit(at, s, band, ground);
  if (shot.s <= 1.02) return shot;
  const w = visibleWindow(shot, band);
  const off = Math.abs(at[0] - (w.left + w.right) / 2) / (w.right - w.left);
  return off <= MAX_OFF_CENTRE ? shot : fit(at, 1, band, ground);
}

export function resolveMoves(
  moves: Move[], band: [number, number], ground?: number,
): Shot[] {
  const out: Shot[] = [];
  // WHERE THE CAMERA STARTS, and it has to be a LEGAL shot.
  //
  // This was `cy = (band[0] + band[1]) / 2` — the middle of the band, which is not
  // the middle of the design space and is not a shot the transform can hold: at s=1
  // the window runs off the bottom by however far the band's centre sits from 280.
  // It never showed, because the first verb was always a push or a pull and `fit`
  // recomputed the centre. Now that a plain beat deals `hold`, the first beat of a
  // lesson can inherit this directly — and 102 lessons came back with a window
  // bottom of 602 against a design space of 560.
  //
  // NEUTRAL is the identity transform and the shot a lesson with no camera already
  // has, which makes it the only honest answer to "where was it before beat 0".
  let prev: Shot = { ...NEUTRAL };
  for (const m of moves) {
    const d = VERB[m.k];
    const framing = m.framing ?? d.framing;
    const at: [number, number] = m.at ?? [prev.cx, prev.cy];
    // `hold` and `shake` do not travel: they keep the framing they were handed.
    const s = m.k === 'hold' || m.k === 'shake' ? prev.s : SCALE[framing];
    // A HOLD IS STILL PUT THROUGH `fit`. It keeps the previous centre and scale, but
    // the previous shot was legal against the PREVIOUS beat's constraints, and a
    // ground line can differ per lesson; running it through costs nothing and makes
    // "keep what you had" incapable of carrying an illegal frame forward.
    const target = m.k === 'hold' || m.k === 'shake'
      ? fit([prev.cx, prev.cy], s, band, ground)
      : centredFit(at, s, band, ground);
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
  // NO LONGER THE SOURCE OF A LESSON'S FRAMINGS, and that is the point.
  //
  // This used to deal a verb per beat from the figure's track plus a seeded
  // three-phase cycle — push, pull, hold — which gave every lesson in the app the
  // same rhythm and gave each beat a reason to move whether or not anything had
  // happened. A reader watching it said so exactly: *"it'll zoom in, then zoom out,
  // and then two clicks later, it'll be the exact same zoom in and zoom out… I don't
  // want these continual same camera movements."* A cycle cannot help but repeat;
  // that is what a cycle is.
  //
  // Framings now come from the lesson's own content, decided in order and with a
  // memory of where the camera is standing (`lessonTours` in scripts/lib/tourrule.mjs
  // — one move, only when the next thing to see is not already in front of you).
  // What is left here is the one framing the camera is not free to choose:
  //
  //   · a QUESTION beat pulls all the way back to scale 1, because an answer target
  //     is a Pressable and the identity transform is the only one a tap does not
  //     have to survive an offset to land through (K6);
  //   · the SUMMARY does the same, and the stage is hidden under it anyway;
  //   · everything else HOLDS — the player then keeps the shot it already had.
  //
  // `whip` went with the cycle, and with it the last overshooting move in the app.
  // "That same bouncy camera movement" was `easeBack`, which only `whip` ever dealt.
  //
  // `x`, `seed` and `ground` are kept in the signature because 112 scenes pass them
  // and the shape of a scene's call is not worth churning for a parameter that is now
  // unread; `kinds` is the whole input.
  void x; void seed; void ground;
  return kinds.map((kind) =>
    kind === 'question' || kind === 'summary' ? { k: 'pull' as const } : { k: 'hold' as const });
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
// WHAT IT ACTUALLY COSTS, once the guarantee is honest: 199 stations over 13% of
// beats, down from 447 over 30%. The difference is not a change of policy but the
// generator learning what a station can reach — the words it could not see, both
// ends of a follow, and the beat AFTER it, which inherits the push. See K12 in
// docs/LESSON_RULES.md. A framing that cannot hold a word whole is not worth
// holding, so the beat holds wide instead, and the wide shot is clean by
// construction.
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
  /**
   * WHERE THE SUBJECT HAS GOT TO BY THE END OF THE DWELL — a FOLLOW station (K9).
   *
   * Omitted, the station is static and the camera parks. Given, the camera tracks:
   * it arrives on `box`, then travels with the subject to `to` while the scene clock
   * runs, which is the difference between following a walk and watching one cross a
   * still frame.
   *
   * Both ends are framed at the SAME scale — the tighter of the two requirements —
   * so the tracking shot interpolates a centre at fixed magnification. That is what
   * keeps it legal for free: at a fixed scale the legal range of the centre is a
   * plain interval, so a point between two legal centres is legal, and no clamping
   * can bite halfway through the move.
   */
  to?: Box;
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
  return tour.map((st) => ({ ...stationShot(st.box, band, ground, cap), tr: st.tr }));
}

/**
 * The far end of a FOLLOW station (K9), at the same scale as the near end.
 *
 * Returns the arrival shot unchanged for a static station, so a caller can hold one
 * array and interpolate unconditionally.
 *
 * The shared scale is the tighter requirement of the two boxes, which is what stops
 * a walk that ends beside a wide prop from having to zoom out mid-track — the shot
 * is already wide enough for both when it sets off.
 */
export function tourEndShots(
  tour: Tour, band: [number, number], ground?: number, cap = STATION_CAP,
): Shot[] {
  return tour.map((st) => {
    const a = stationShot(st.box, band, ground, cap);
    if (!st.to) return a;
    const b = stationShot(st.to, band, ground, cap);
    const s = Math.min(a.s, b.s);
    // Re-frame BOTH ends at the shared scale, so the interpolation is a straight
    // slide and each end still contains its own box.
    const at: [number, number] = [st.to.x + st.to.w / 2, st.to.y + st.to.h / 2];
    return containShot(fit(at, s, band, ground), st.to, band);
  });
}

/**
 * The near end of every station, re-framed to match its follow partner's scale.
 *
 * ── EVERY STATION CARRIES ITS OWN `tr`, AND THE STATIC ONES DID NOT ─────────
 *
 * `shotAt` reads the travel time off the shot it is travelling TO, defaulting to
 * `tr ?? 0.8`. The follow branch below has always spread `tr` onto its result;
 * the static branch returned `stationShot`'s shot bare — so for 197 of the app's
 * 201 stations the generator's travel time was never read at all, and every push
 * in every lesson took a flat 0.8 seconds however far it went.
 *
 * That is the shape this file already records one line up: *"generated,
 * validated, written to the table, and dropped here."* `check:tour` enforces K8's
 * 0.35–1.2s window on a number the player could not see, and `make:tours` was
 * free to write anything into that column without changing what a reader watched.
 * It was found by measuring the push in a browser — 0.79s against a table saying
 * 1.2 — after a change to the generator made no difference to the render at all.
 */
export function tourStartShots(
  tour: Tour, band: [number, number], ground?: number, cap = STATION_CAP,
): Shot[] {
  return tour.map((st) => {
    const a = stationShot(st.box, band, ground, cap);
    if (!st.to) return { ...a, tr: st.tr };
    const b = stationShot(st.to, band, ground, cap);
    const s = Math.min(a.s, b.s);
    const at: [number, number] = [st.box.x + st.box.w / 2, st.box.y + st.box.h / 2];
    return { ...containShot(fit(at, s, band, ground), st.box, band), tr: st.tr };
  });
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
): { k: number; t: number; g: number; p: number } {
  'worklet';
  const n = trs.length;
  if (n === 0) return { k: 0, t: rt, g: rt, p: 0 };
  let start = 0;
  let served = 0;
  for (let j = 0; j < n; j++) {
    const arrive = start + trs[j];
    const last = j === n - 1;
    // Still on the way to j.
    if (rt < arrive) return { k: j, t: rt - start, g: served, p: 0 };
    // Parked at j. The last station holds for the rest of the beat, so its dwell is
    // not a bound — this is where the free-running tail comes from.
    const parked = rt - arrive;
    if (last || parked < dwells[j]) {
      // `p` is how far through THIS station's dwell we are, which is what a follow
      // station (K9) tracks along. `g` is the whole beat's scene clock and cannot
      // answer that, because it has every earlier dwell folded into it.
      return { k: j, t: trs[j], g: served + parked, p: parked };
    }
    served += dwells[j];
    start = arrive + dwells[j];
  }
  return { k: n - 1, t: trs[n - 1], g: served, p: dwells[n - 1] };
}

/** Slide between two shots taken at the same scale — a follow station's tracking. */
/**
 * How far ahead of a followed subject the camera looks, as a share of the span.
 *
 * ZERO. It was 0.07 — a operator's habit of looking a little into the move — and a
 * reader asked for the opposite in as many words: *"I want it to move WITH, for
 * example, the stickman walking… I want it to follow it the same moment it is
 * walking."* Leading is not lagging, but it is still the camera and the subject
 * disagreeing about where the subject is, and once the spring came out (which was
 * the actual lag) this was the only remaining disagreement. Kept as a named constant
 * rather than deleted because the arithmetic around it is the thing worth keeping.
 *
 * DECLARED ABOVE `trackAt`, AND THAT IS NOT A STYLE CHOICE — it is §17 rule 2,
 * which until now was only ever written about one worklet CALLING another. A
 * worklet closing over a plain `const` fails in exactly the same way and is
 * harder to see: the Reanimated babel plugin builds each worklet's closure
 * object at module scope immediately after the declaration, so a `const` living
 * further down the file is still in its temporal dead zone when that runs. This
 * sat ten lines below `trackAt` and threw `Cannot access 'LEAD' before
 * initialization` on IMPORT — taking down the whole route tree, not one
 * animation, because every cinematic lesson pulls this module in.
 *
 * `tsc` passed, all seventeen validators passed, and one browser load found it.
 */
const LEAD = 0;

export function trackAt(a: Shot, b: Shot, u: number): { cx: number; cy: number; s: number } {
  'worklet';
  const t = u < 0 ? 0 : u > 1 ? 1 : u;
  // LINEAR, NOT EASED, and this is the difference between a follow and a drift.
  //
  // A travel between two stations is eased because it is a camera MOVE — it should
  // start and stop gently. A follow is not a move: it is the camera holding station
  // on a subject that is itself walking at a constant rate. Easing it makes the
  // camera accelerate and decelerate underneath a subject that does neither, so the
  // figure slides forward in frame, then back, for the whole beat. That is the
  // "following objects isn't very smooth" a reader reported, and it is not a
  // smoothness problem at all — the camera was moving smoothly along the wrong
  // curve. Matching the subject's own rate is what makes a follow read as a follow.
  //
  // LEAD. A follow that centres its subject exactly reads as reactive, because the
  // subject is always walking into the frame edge it is about to reach. Looking a
  // little way ahead of them is what a camera operator does and what an audience
  // expects; 7% of the span is enough to feel intentional and far too small to make
  // the subject look off-centre. Clamped so the lead can never run past the station.
  const led = t + LEAD > 1 ? 1 : t + LEAD;
  return {
    cx: a.cx + (b.cx - a.cx) * led,
    cy: a.cy + (b.cy - a.cy) * led,
    // Scale does NOT lead — the subject is not getting nearer, and pre-empting a
    // zoom reads as the camera guessing.
    s: a.s + (b.s - a.s) * t,
  };
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
 * `wide` is the beat's full must-box, and what this checks against it is COVERAGE:
 * that between them the stations frame everything the beat is about. Not that the
 * last one does. See the K3 check at the bottom, and tourrule.mjs's header for why
 * the difference is the whole fix.
 */
export function checkTour(
  tour: Tour, band: [number, number], wide: Box | null, ground?: number,
): string[] {
  const out: string[] = [];
  if (!tour.length) return out;
  if (tour.length > 2) out.push(`${tour.length} stations — K8 allows 2, and the last one holds`);
  const shots = tourStartShots(tour, band, ground);
  const ends = tourEndShots(tour, band, ground);
  const holds = (sh: Shot, b: Box) => {
    const w = visibleWindow(sh, band);
    return !(b.x < w.left - 0.5 || b.x + b.w > w.right + 0.5 || b.y < w.top - 0.5 || b.y + b.h > w.bottom + 0.5);
  };
  shots.forEach((sh, i) => {
    if (sh.s < 1) out.push(`station ${i}: scale ${sh.s.toFixed(2)} is below 1`);
    if (sh.s > STATION_CAP + 0.001) out.push(`station ${i}: ${sh.s.toFixed(2)}× is past the ${STATION_CAP}× ceiling (K5)`);
    const b = tour[i].box;
    // K3/H60c per station: the box this station exists for must be inside its window.
    if (!holds(sh, b)) out.push(`station ${i}: its own box is not inside its shot — containment failed (K3)`);
    // A follow station has to hold its subject at BOTH ends, or the track loses it
    // partway. The two are framed at one shared scale, so checking the ends is
    // enough: a fixed scale makes the legal centre an interval, and a point between
    // two legal centres is legal.
    const to = tour[i].to;
    if (to) {
      if (!holds(ends[i], to)) out.push(`station ${i}: the follow loses its subject by the end (K9)`);
      if (Math.abs(ends[i].s - sh.s) > 0.001) out.push(`station ${i}: a follow must hold one scale, not ${sh.s.toFixed(2)}→${ends[i].s.toFixed(2)} (K9)`);
    }
    if (tour[i].tr > 0 && tour[i].tr < 0.35) out.push(`station ${i}: a ${tour[i].tr}s travel reads as a jump-cut (K8)`);
    if (tour[i].tr > 1.2) out.push(`station ${i}: a ${tour[i].tr}s travel is longer than K8 allows`);
    if (i < tour.length - 1 && tour[i].dwell < 0.7) {
      out.push(`station ${i}: a ${tour[i].dwell}s dwell is too short to read (K8)`);
    }
  });
  // K8's budget is about how long the READER IS KEPT WAITING, so it counts travel and
  // static dwell only. A follow station's dwell is not waiting — it is the walk the
  // beat already contained, now being tracked instead of watched from across the room
  // — and charging it to the budget would make exactly the shot this group exists to
  // enable the one thing it forbids.
  const waiting = tour.reduce(
    (a, s, i) => a + s.tr + (s.to || i === tour.length - 1 ? 0 : s.dwell), 0,
  );
  if (waiting > 5.5) out.push(`the tour keeps the reader waiting ${waiting.toFixed(1)}s — K8 caps it at 5.5s`);
  // K3 — NO LAP. EVERY STATION IS A FRAMING, NOT A RETURN TO THE WHOLE STAGE.
  //
  // This used to assert the exact opposite: that the LAST station be the beat's whole
  // must-box, so the reader always finished having seen everything. That single line
  // is what a reader described as "a loop of movement… it will move 3 different times
  // just to be sure it shows everything". The closing station revealed nothing,
  // because the shot it pulled back to was the shot the beat opened on.
  //
  // So the test is inverted. A station has to be at least MIN_GAIN tighter than the
  // beat's own wide shot, which is precisely what a lap is not — and because that
  // applies to the LAST station too, a tour can no longer end by undoing itself.
  // What guarantees the reader still sees what matters is no longer this check but
  // what the stations are chosen FROM: the things that appear during the beat
  // (tourrule.mjs). The camera frames the change and holds on it.
  // A LAP IS A RETURN, AND A RETURN NEEDS SOMEWHERE TO RETURN FROM.
  //
  // The first version of this scored every station against the beat's wide shot, so a
  // deliberate pull BACK to the whole stage failed it — and pulling back is a real
  // move now: when the next thing to see cannot be framed tightly AND centred, the
  // honest answer is to show the whole picture (K4b). What is forbidden is going
  // somewhere and then undoing it inside one beat, which is what the reader saw as
  // "it'll zoom in, then zoom out". One station cannot do that; two can.
  const bandH2 = band[1] - band[0];
  const sOf = (b: Box) =>
    Math.max(1, Math.min(STATION_CAP, Math.min(STAGE_W / Math.max(b.w, 1), bandH2 / Math.max(b.h, 1))));
  if (tour.length > 1) {
    const first = sOf(tour[0].to ?? tour[0].box);
    const last = sOf(tour[tour.length - 1].box);
    if (last < first - 0.001) {
      out.push(`the tour pushes to ${first.toFixed(2)}x and then pulls back to ${last.toFixed(2)}x in the same beat — that is a lap (K3)`);
    }
  }
  return out;
}
