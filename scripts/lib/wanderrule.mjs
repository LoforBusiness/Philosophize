// ─────────────────────────────────────────────────────────────────────────────
// WHEN THE FIGURE MAY MOVE HIMSELF, AND HOW FAR (group AF).
//
// One rule with two readers, which is the discipline this repo applies to every
// generated table: `make-wander.mjs` writes the plans out of these functions and
// `check-wander.mjs` re-derives them, so a plan that has drifted from the boxes it
// was measured against is a build failure rather than a figure walking through a
// diagram.
// ─────────────────────────────────────────────────────────────────────────────

/** The plan's move kinds — the same numbers `wander.ts` reads. */
export const W = { STEP: 1, LOOK: 2, SIT: 3, CROUCH: 4, TURN: 5, LEAN: 6 };
export const KIND_NAME = { 1: 'step', 2: 'look', 3: 'sit', 4: 'crouch', 5: 'turn', 6: 'lean' };

export const STAGE_W = 400;
export const GROUND_Y = 500;
/** Stage units a standing figure is wide, and the gap he keeps off anything. */
export const FIG_W = 44;
export const GAP = 9;
/** How far the seated legs reach in front of him (`postureHold(3)`: feet at 31–35). */
export const SIT_REACH = 42;
/** The walk's own speed, in stage units a second (rig.WALK_SPEED). */
export const SPEED = 56;

/**
 * WHICH POSES LEAVE HIM FREE TO MOVE, AND WHICH DO NOT.
 *
 * The classification is the one `liveliness.mjs` already makes for its own tables,
 * read the other way round. A pose that WORKS AT A PROP or is on the FLOOR may not
 * be given a wander at all: a living hold already "puts the hand somewhere else,
 * and if the narration says he is writing on the board then his hand has to be on
 * the board — A1 outranks this entirely". Walking him away from the board is that
 * fault with the whole man rather than a hand.
 *
 * Nor may a pose that is ALREADY a whole-body movement — the dance shelf, the comic
 * shelf, pacing on the spot, stepping in place. Two movements at once is not twice
 * as alive, it is a figure fighting itself.
 */
const RIG_FREE = new Set([
  0,  // neutral stand
  1,  // explain
  3,  // count
  4,  // think
  5,  // sweep
  7,  // both wide
  8,  // shrug
  9,  // hand on hip
  10, // arms crossed
  11, // forehead
  12, // scratch head
  15, // recoil
  19, // adore
  21, // weigh
  22, // clutch chest
  25, // gaze up
  28, // power pose
  29, // push out
  33, // release open
  34, // shield eyes
  35, // proclaim
  39, // clasp forward
  44, // hands behind back
  45, // double take
  46, // slump
  47, // frame it up
]);

/** Acts whose hold leaves the man free: the two living shelves, minus the ones that
 *  are themselves travel or already have him on the floor. */
const ACT_FREE = new Set([
  59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 74, 76, 77, 78,
  158, 159, 160, 161, 163, 164, 165, 167, 168,
]);

/**
 * POSES THAT OWN THE WHOLE MAN, so the layer may add nothing at all.
 *
 * Three families, and each is a different reason:
 *
 *   · HIS HANDS ARE ON SOMETHING — pointing, presenting, offering, writing on a
 *     board, turning a page, carrying a load, gripping a lever. A1 outranks this
 *     entirely: if the narration says he is writing on the board, walking him away
 *     from the board is a lie about the picture.
 *   · HE IS ALREADY ON THE FLOOR — sitting, kneeling, crouched by something. The
 *     layer's own sit would be a second opinion about where his legs are.
 *   · HE IS ALREADY TRAVELLING — the dance shelf, pacing on the spot, stepping in
 *     place, up on the toes. Two movements at once is not twice as alive; it is a
 *     figure fighting itself.
 */
const RIG_BOUND = new Set([
  2, 6, 13, 14, 18, 20, 24, 26, 27, 30, 31, 36, 37, 38, 40, 41, 42, 43, 49,
]);
const ACT_BOUND = new Set([
  1, 2,                                                       // sit down · stand up
  ...Array.from({ length: 30 }, (_, i) => 29 + i),             // the dance and idle-travel shelf
  ...Array.from({ length: 24 }, (_, i) => 121 + i),            // the page · at the board
  ...Array.from({ length: 14 }, (_, i) => 169 + i),            // the working shelf
  72, 73, 157, 162, 166,                                       // stepping · toes · reading · pacing
]);

/**
 * WHAT THIS POSE ALLOWS: 'free', 'late' or 'bound'.
 *
 * `code` is what the beat declares: under 100 a rig gesture, 100–299 an act held,
 * 300+ an act played once as the beat opens.
 *
 * 'late' is the tier that matters for the count, and it exists because a PLAYED
 * action is over in `PLAY_SECONDS` — 1.5 of a line that usually runs four or five.
 * A shrug, a double take or a gag leaves him standing there for the rest of the
 * beat, and holding the whole man still because of the first second and a half is
 * how 958 beats came to be classed as busy. So those get the in-place moves, after
 * the action has finished rather than over the top of it.
 */
export function poseTier(code) {
  if (code === null || code === undefined) return 'bound';
  const act = code >= 300 ? code - 299 : code >= 100 ? code - 99 : null;
  if (act === null) {
    if (RIG_BOUND.has(code)) return 'bound';
    return RIG_FREE.has(code) ? 'free' : 'late';
  }
  if (ACT_BOUND.has(act)) return 'bound';
  if (ACT_FREE.has(act)) return 'free';
  return 'late';
}

/** Is this pose free to be walked around? */
export function freePose(code) {
  return poseTier(code) === 'free';
}

/** How long a played action takes before he is standing there again (moves.PLAY_SECONDS). */
export const PLAY_SECONDS = 1.5;

/**
 * The clear spans of floor on one beat, in stage units.
 *
 * Measured the way `make:visitor` measures it, and for the same reason — the boxes
 * are the only record of what a beat actually draws — with three differences that
 * matter:
 *
 *   · the LEAD's own box is the thing being moved, so it is removed rather than
 *     shrunk back to the bare figure;
 *   · the visitor's box BLOCKS him, where `make:visitor` had to ignore it to avoid
 *     placing the visitor inside himself;
 *   · a box only blocks if it comes down to the height he actually occupies, so a
 *     diagram in the top half of the stage is not an obstacle to walking under it.
 */
export function freeFloor(items, lead, extra = []) {
  const top = lead.y;
  const bottom = lead.y + lead.h;
  const mine = new Set(lead.items || []);
  const blocked = [];
  for (const it of [...(items || []), ...extra]) {
    if (it.bleed) continue;
    if (mine.has(it)) continue;
    const [x, y, w, h] = it.b;
    if (y + h < top || y > bottom) continue;
    blocked.push([x - GAP, x + w + GAP]);
  }
  blocked.sort((a, b) => a[0] - b[0]);
  let cursor = 2;
  const free = [];
  for (const [a, b] of blocked) {
    if (a - cursor >= FIG_W) free.push([cursor, a]);
    cursor = Math.max(cursor, b);
  }
  if (STAGE_W - 2 - cursor >= FIG_W) free.push([cursor, STAGE_W - 2]);
  return free;
}

/**
 * How far either side of where the scene puts him he may stand: `[lo, hi]`, or null
 * when there is no room to move at all.
 *
 * `spans` are the clear floors of every beat he could still be standing on this one
 * — his own and the next, because a plan that ends somewhere the next beat's art
 * fills would have him walk out of it the moment the reader taps.
 */
export function roomFor(lead, spans, windows) {
  let lo = -1e4;
  let hi = 1e4;
  for (const free of spans) {
    let best = null;
    for (const [a, b] of free) {
      if (lead.x + 1 < a || lead.x + lead.w - 1 > b) continue;      // not the span he is in
      best = [a - lead.x, b - (lead.x + lead.w)];
    }
    if (!best) return null;
    lo = Math.max(lo, best[0]);
    hi = Math.min(hi, best[1]);
  }
  // AND HE STAYS IN THE SHOT. The frames come from `tours.ts` exactly as
  // `make:thoughts` reads them; the camera itself is never touched, so a step that
  // would leave the picture is simply not offered.
  for (const win of windows) {
    lo = Math.max(lo, win.left + 2 - lead.x);
    hi = Math.min(hi, win.right - 2 - (lead.x + lead.w));
  }
  lo = Math.min(0, lo);
  hi = Math.max(0, hi);
  return [Math.round(lo * 10) / 10, Math.round(hi * 10) / 10];
}

/** How long a step of `span` units takes — `wander.stepSeconds`, stated once. */
export function stepSeconds(span) {
  return Math.max(0.42, Math.abs(span) / SPEED + 0.22);
}

/**
 * THE PAUSES IN A SPOKEN LINE, as seconds from its start.
 *
 * A move that starts on a word lands on top of the sentence; one that starts in the
 * gap between two clauses reads as the person taking a moment. The narration
 * manifest gives every word's start, so the gaps are already measured — this is the
 * same data `NarrationText` reveals the line on.
 */
export function pausesOf(line, dur) {
  const out = [];
  const words = line?.words ?? [];
  for (let j = 1; j < words.length; j += 1) {
    const gap = words[j] - words[j - 1];
    if (gap >= 0.26) out.push({ at: words[j - 1] + 0.12, gap });
  }
  // An unnarrated beat still has a beginning and a middle.
  if (!out.length) out.push({ at: Math.min(0.8, dur * 0.25), gap: 0.4 });
  return out;
}

/** A stable 0…1 from a string — the same finaliser the quip seeds use. */
export function hash01(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

/** Every move in a plan, as objects, for a checker or a report to read. */
export function movesOf(plan) {
  const out = [];
  for (let j = 2; j + 3 < plan.length; j += 4) {
    out.push({ kind: plan[j], at: plan[j + 1], dur: plan[j + 2], to: plan[j + 3] });
  }
  return out;
}

/** Where a plan leaves each track, for the next beat to start from. */
export function endState(plan) {
  const st = { dx: 0, look: 0, sit: 0, crouch: 0, face: 1, lean: 0 };
  const field = { 1: 'dx', 2: 'look', 3: 'sit', 4: 'crouch', 5: 'face', 6: 'lean' };
  for (const m of movesOf(plan)) st[field[m.kind]] = m.to;
  return st;
}
