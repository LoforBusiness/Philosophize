// ─────────────────────────────────────────────────────────────────────────────
// HE MOVES AROUND NOW, AND NOT WITH HIS HANDS.
//
// A reader, after the living holds and the working shelf had shipped:
//
//   *"the stickman does not move a lot. I do not mean with its hands moving …
//    those aren't really that good. Instead, during the words that are being
//    spoken, if there's nothing happening on screen, the stickman will look up
//    and down a lot, move back and forth, maybe sit on the ground for a little
//    bit — him actually moving around in a really natural way. Right now the
//    stickman is too stationary."*
//
// Every idle this app has built so far moves a LIMB: the two living shelves are
// arms and a head, the working shelf keeps a hand on a prop, and `check:idle`
// measures all of them against `stand()`'s own breath. None of them moves the
// MAN. So a lesson where the picture holds still is a figure rooted to one x for
// eight beats, doing something slightly different with his arms each time.
//
// ── WHAT A PLAN IS ──────────────────────────────────────────────────────────
//
// A flat list of numbers, generated per beat by `npm run make:wander` and read on
// the UI thread. Numbers rather than objects because a plan crosses into a
// worklet, and §17 rule 6 is that nothing else crosses cleanly.
//
//   [ lo, hi, kind, at, dur, target, kind, at, dur, target, … ]
//
// `lo`/`hi` are how far he may stand either side of where the scene puts him —
// measured from `mustBoxes` against the art the beat actually draws, the visitor,
// the pen mark and the frames the camera shows. `at` and `dur` are seconds from
// the start of the beat, placed in the pauses of the line being spoken. That is
// Duolingo's own construction for their characters: the idle behaviour is
// triggered against the audio's timing rather than looped on its own clock, and
// it is cut short the moment the reader moves on.
//
// ── WHY IT IS A PURE FUNCTION OF TIME AND NOT A CHAIN OF withTiming CALLS ───
//
// `withTiming` would give continuity for free — it starts from whatever the value
// is now — and it cannot give a STRIDE. A walk's feet are driven by the distance
// covered (`strideStance`, and rig's own note: "the stride follows the body"), so
// the leg and the body have to be read out of one expression at one instant. Two
// clocks agreeing is the defect group AB records twice over: a shared value
// reaches the UI thread on the next frame and a JS timer does not.
//
// So the whole state is `wanderState(plan, t, start)`, evaluated every frame, and
// continuity across a tap comes from `start` — the values the last frame of the
// previous plan drew, kept in `WANDER_MEM` exactly as `carry` keeps its own.
// ─────────────────────────────────────────────────────────────────────────────
import {
  type Stance, clamp01, ease01, lerp, mixStance, strideStance, stanceUsed, gaitVary,
  stand, life2, WALK, WALK_SPEED, U,
} from './rig';
import { postureHold } from './moves';

/** The floor seat, relative to the pelvis (see `sitOut`). */
const SEAT_DROP = 30;
const SEAT_FOOT_X = 36;
const SEAT_HAND_X = -15;
const SEAT_HAND_Y = 27;

/** A move's kind. The generator writes these numbers; `check:wander` reads them. */
export const W_STEP = 1;
export const W_LOOK = 2;
export const W_SIT = 3;
export const W_CROUCH = 4;
export const W_TURN = 5;
export const W_LEAN = 6;

/** Numbers per move in the flat plan, and where the moves start. */
export const W_STRIDE = 4;
export const W_HEAD = 2;

/**
 * How long a step of `span` stage units takes, at the walk's own speed.
 *
 * The same rule as every other walk in the app (`rig.moveTr`, and §17's "the walk
 * was too fast in 54 scenes"): a fixed duration sprints a long step and strands
 * the feet. A floor, because a two-unit shuffle still has to be a step.
 */
export function stepSeconds(span: number): number {
  'worklet';
  return Math.max(0.42, Math.abs(span) / WALK_SPEED + 0.22);
}

/** The state of the layer at one instant. All of it is additive to the scene. */
export interface WanderState {
  /** Stage units left or right of where the scene stands him. */
  dx: number;
  /** +1 looking up, −1 looking down. */
  look: number;
  /** 0 standing … 1 sitting on the ground. */
  sit: number;
  /** 0 standing … 1 crouched on the balls of the feet. */
  crouch: number;
  /** A multiplier on the scene's facing: +1 as staged, −1 turned round. */
  face: number;
  /** 0 … 1 of a weight shift, for a line with no room to walk. */
  lean: number;
  /** The step he is in the middle of, in stage units, or `legU` < 0 for none. */
  legFrom: number;
  legTo: number;
  legU: number;
  /**
   * How far this step has ALREADY been walked before its own leg began — 0 for a
   * step out of a stand, and the interrupted distance for one a tap cut into. It
   * is what keeps the gait's phase continuous across a tap (`stepStance`).
   */
  legPrior: number;
  /**
   * THE LEG THE LAYER GENERATED FOR ITSELF, rather than one `make:wander` planned.
   *
   * A tap can leave him standing where this beat's art does not allow, and the
   * generator cannot know where. Walking him back in is a leg like any other — but
   * it is not in the plan, so its facing is not in the plan either, and a leg
   * walked against the facing is the moonwalk C18 is about. `homeDir` is the stage
   * direction that leg travels (+1 right, −1 left, 0 for no such leg) and `turnU`
   * is how much of the way round he has turned to face it, eased out before the
   * walk and back after it so `wanderDir` never flips between two frames.
   */
  homeDir: number;
  turnU: number;
}

const REST: WanderState = {
  dx: 0, look: 0, sit: 0, crouch: 0, face: 1, lean: 0, legFrom: 0, legTo: 0, legU: -1, legPrior: 0,
  homeDir: 0, turnU: 0,
};

/**
 * How long the figure takes to turn on the spot, and the window an unplanned turn
 * is given. `make:wander` writes 0.30–0.34 for the turns it schedules; this is the
 * same move, so it takes the same time.
 */
export const TURN_S = 0.32;

/**
 * THE FACING COMES HOME WHEN THE PLAN STOPS TALKING ABOUT IT.
 *
 * `face` carries across a beat, so a reader who taps in the middle of a stroll —
 * between the turn out and the turn back — used to hand the next beat a figure
 * that was mirrored, and a plan with no TURN move of its own held him that way for
 * the rest of the lesson. Measured across every beat boundary at every tenth of a
 * second, 2.3% of taps did it. A plan that says nothing about the facing means "as
 * the scene staged him", so the layer turns him back rather than holding a
 * mirrored mascot; eased, because a flip between two frames swaps the man for a
 * mirrored copy (group L, and `facing` in cinematicKit).
 */
function homeFace(face: number, t: number): number {
  'worklet';
  if (face > 0.999) return 1;
  return lerp(face, 1, ease01(clamp01(t / TURN_S)));
}

/** The layer at rest — what a beat with no plan draws, and what a lesson starts at. */
export function wanderRest(): WanderState {
  'worklet';
  return { ...REST };
}

/**
 * One track of a plan, read at `t`.
 *
 * Every move of a kind is a leg from wherever the track had got to toward its own
 * target, so a plan never states where a move starts — which is what lets the
 * first one start from a value a tap interrupted.
 */
function trackAt(plan: readonly number[], kind: number, t: number, from: number): number[] {
  'worklet';
  let cur = from;
  let legFrom = 0;
  let legTo = 0;
  let legU = -1;
  for (let j = W_HEAD; j + 3 < plan.length; j += W_STRIDE) {
    if (plan[j] !== kind) continue;
    const at = plan[j + 1];
    const dur = plan[j + 2] > 0.01 ? plan[j + 2] : 0.01;
    const target = plan[j + 3];
    if (t <= at) break;
    if (t >= at + dur) { cur = target; continue; }
    legFrom = cur;
    legTo = target;
    legU = ease01((t - at) / dur);
    cur = lerp(legFrom, legTo, legU);
    break;
  }
  return [cur, legFrom, legTo, legU];
}

/** Whether a plan schedules any move of a kind at all. */
function hasKind(plan: readonly number[], kind: number): boolean {
  'worklet';
  for (let j = W_HEAD; j + 3 < plan.length; j += W_STRIDE) if (plan[j] === kind) return true;
  return false;
}

/**
 * THE WHOLE LAYER AT ONE INSTANT.
 *
 * `t` is seconds since this plan started, `start` is what the previous plan last
 * drew. An empty plan returns the start values unchanged, so a beat that may not
 * move him holds whatever he was doing rather than snapping home.
 *
 * A TAP IN THE MIDDLE OF A STEP FINISHES THE STEP. `start.legU` between 0 and 1
 * means the reader tapped mid-stride; standing still from there would swap a
 * walking stance for a standing one between two frames, which is group L exactly.
 * So the remaining distance is walked out first, at the walk's own speed, before
 * the new plan's own moves are read — and because that leg is prepended rather
 * than scheduled, the frame before and the frame after the tap are the same
 * picture.
 */
export function wanderState(
  plan: readonly number[], t: number, start: WanderState, dir = 1,
): WanderState {
  'worklet';
  // A BEAT WITH NO PLAN OF ITS OWN IS A PLAN WITH NO MOVES AND NO WALLS, which is
  // not the same thing as a full stop. This used to return early with `legU: -1`,
  // under a docstring promising it "holds whatever he was doing" — and abandoning a
  // step in mid-stride is the one thing it cannot hold: a tap onto a planless beat
  // swapped a walking stance for a standing one and switched the gaze back on
  // between two frames, measured at 21.7 units. Given the whole stage as its room
  // it falls through the same machinery as any other plan, so the step he is in the
  // middle of is walked out and every track simply holds.
  const empty = plan.length < W_HEAD;
  const lo = empty ? -1e4 : plan[0];
  const hi = empty ? 1e4 : plan[1];

  // ── COMING BACK INTO THIS BEAT'S ROOM IS A WALK, AND IT USED TO BE A CLAMP ──
  //
  // He may have been standing somewhere the previous beat's art left clear and
  // this one does not, and the generator cannot know when a reader taps. This read
  // `held = clamp(start.dx, lo, hi)` and then walked only the REMAINDER of a step a
  // tap had cut into — so the clamp itself was a teleport, and it is the one the
  // paragraph it was written under promises cannot happen. A beat with no room at
  // all reports `[0, 0]` (`roomFor` returns null for 343 of them), so a tap during
  // the stroll before one snapped him home from wherever he had walked to:
  // measured at every beat boundary at every tenth of a second, 730 taps moved him
  // more than a unit sideways in a single frame and the worst moved him 44.
  //
  // So the walk in is a LEG, prepended to the plan exactly as the finish of an
  // interrupted step already was, and the two are now one expression: `was` is
  // where the previous frame drew him, and `finish` is wherever he is headed — the
  // step he was in the middle of, or the nearest point of this beat's own room.
  const was = start.dx;
  const mid = start.legU > 0 && start.legU < 1;
  // He finishes the step he is in the middle of FIRST, wherever this beat's room
  // is: a man mid-stride cannot turn on the spot, and making him do it swapped a
  // walking stance for a standing one between two frames (21.7 units, measured).
  // So the walk in is up to four phases, and each one is continuous with the last:
  //
  //   A  the rest of the interrupted step, at its own gait phase
  //   B  a turn, if the way home is not the way he is already facing
  //   C  the walk home, into the nearest point of this beat's room
  //   D  the turn back, so the beat hands on the facing it was given
  //
  // A tap can land inside any of them, and all four are pure functions of `t`, so
  // the next beat reads them the same way this one did.
  const stepEnd = mid ? start.legTo : was;
  const tA = mid && Math.abs(stepEnd - was) > 0.01
    ? stepSeconds(stepEnd - was) * (1 - start.legU)
    : 0;
  // AND HE WALKS BACK TO WHERE THE SCENE PUTS HIM, not merely to the nearest legal
  // spot. A plan's STEP targets are ABSOLUTE offsets authored for a figure standing
  // at 0 — and every plan ends at 0, so a carried offset only ever exists because a
  // reader tapped mid-stroll. Left standing at −31, a plan whose first step goes to
  // −27 walks him RIGHT while its own turn faces him LEFT: 70 taps moonwalked that
  // way, and the table rule cannot see it because the table is written for a figure
  // starting at 0. Putting him back is what makes the plan mean what it says.
  const finish = 0 < lo ? lo : 0 > hi ? hi : 0;
  const back = finish - stepEnd;
  const rest = back > 0.01 || back < -0.01;
  const homeDir = rest ? (back > 0 ? 1 : -1) : 0;
  // His facing at the instant of the tap. `make:wander` gives every step it
  // schedules its own turn (`check:wander` §3 holds that); this leg is generated
  // here, because the generator cannot know where a tap left him, so its turn is
  // derived instead — and skipped when he already faces that way.
  const faced = (dir < 0 ? -1 : 1) * (start.face < 0 ? -1 : 1);
  const tB = rest && homeDir !== faced ? TURN_S : 0;
  const tC = rest ? stepSeconds(back) : 0;
  const homeAt = tA + tB + tC;
  const fin = homeAt + tB;

  let dx = was;
  let legFrom = 0;
  let legTo = 0;
  let legU = -1;
  let legPrior = 0;
  let turnU = 0;
  if (t < fin) {
    if (t < tA) {
      // A — and `legPrior` is what keeps the gait's phase running through the tap
      // rather than restarting it (`stepStance`).
      legFrom = was;
      legTo = stepEnd;
      legU = ease01(t / Math.max(tA, 0.01));
      legPrior = Math.abs(start.dx - start.legFrom);
      dx = lerp(legFrom, legTo, legU);
    } else if (t < tA + tB) {
      // B — `turnU` is how far round toward `homeDir` he is, and it must be 0 on
      // the frames either side of the window or `wanderDir` flips him between two
      // of them (37 units, measured, before it was eased).
      dx = stepEnd;
      turnU = ease01((t - tA) / tB);
    } else if (t < tA + tB + tC) {
      legFrom = stepEnd;
      legTo = finish;
      legU = ease01((t - tA - tB) / Math.max(tC, 0.01));
      dx = lerp(legFrom, legTo, legU);
      turnU = tB > 0 ? 1 : 0;
    } else {
      // D
      dx = finish;
      turnU = tB > 0 ? 1 - ease01((t - tA - tB - tC) / tB) : 0;
    }
  } else {
    const walked = trackAt(plan, W_STEP, t - fin, finish);
    dx = walked[0] < lo ? lo : walked[0] > hi ? hi : walked[0];
    legFrom = walked[1];
    legTo = walked[2];
    legU = walked[3];
  }

  const look = trackAt(plan, W_LOOK, t - fin, start.look)[0];
  const sit = clamp01(trackAt(plan, W_SIT, t - fin, start.sit)[0]);
  const crouch = clamp01(trackAt(plan, W_CROUCH, t - fin, start.crouch)[0]);
  const lean = clamp01(trackAt(plan, W_LEAN, t - fin, start.lean)[0]);
  // A PLAN WITH NO TURN OF ITS OWN BRINGS HIM HOME rather than holding a mirrored
  // figure for the rest of the lesson — see `homeFace`. AND SO DOES THE WINDOW
  // BEFORE A PLAN THAT HAS ONE: the turn track is read from `t − fin`, so a walk
  // back in that outlasts the beat left the track before its first move and held
  // the carried facing for the whole of it. 94 taps did that; the plan picks up
  // from wherever the ease has got to by `fin`, which is the same value on both
  // sides of the boundary.
  // The turn track is READ FROM the value coming home, not from the carried one, so
  // the two cases are one expression: before the plan's first turn he is already
  // turning back, and from the first turn on the plan's own absolute targets govern.
  //
  // AND IT WAITS UNTIL HIS FEET HAVE STOPPED. Read off `t`, the ease ran while the
  // walk back in was still going — so a tap taken just after a stroll's turn, with
  // the return leg under way, turned him to face forward while he was still walking
  // left. That is C18 again, produced by the fix for it.
  //
  // It starts at PHASE D, the turn back, rather than at the end of the window: those
  // are the same 0.32s of turning, and a reader who taps exactly mid-turn carries a
  // `face` of 0 — a figure with no width at all — which held frozen for the whole
  // walk and then had to un-flatten afterwards. Eased across phase D it comes home
  // as the same turn `turnU` is already unwinding.
  const homed = homeFace(start.face, t - homeAt);
  const face = hasKind(plan, W_TURN)
    ? trackAt(plan, W_TURN, t - fin, homed)[0]
    : homed;
  return { dx, look, sit, crouch, face, lean, legFrom, legTo, legU, legPrior, homeDir, turnU };
}

/**
 * SITTING DOWN ON THE GROUND, THROUGH A SQUAT.
 *
 * `postureHold(3)` is the seat itself — on the ground, legs out, one arm propping
 * — and going straight there from standing slides both feet 35 units forward
 * along the floor while the pelvis drops, which is the skate `strideStance`'s
 * whole docstring is about. A body does it in two: the knees bend and the weight
 * comes down (`postureHold(0)`, the crouch), and only then do the legs go out.
 */
/**
 * THE SEAT HE ENDS IN: BACK UPRIGHT, LEGS OUT, HANDS PROPPED BEHIND (N20).
 *
 * It was `postureHold(3)` — legs out, but the torso leaning well back and the
 * propping arm lost inside the trunk at lesson size (rule 1b), so the whole thing
 * read as half lying down: *"the lying down animation is pretty bad, dont really
 * know what I am looking at"* (owner, 2026-09-25). Drawn in a grid against knees-up
 * and hands-on-thighs seats — both of which melt into one lump under a head this
 * size — the plain L is the one that cannot be read as anything else: the back
 * straight up, the legs flat along the floor, and both arms a clear diagonal to the
 * floor behind him. The feet land where the old seat's did (inside SIT_REACH).
 *
 * It breathes only in the hands — group AL: nothing moves his pelvis on a clock.
 */
function sitOut(t: number): Stance {
  'worklet';
  const s = stand(t);
  const g = life2(t, 0.9, 1.37, 0.6);
  return {
    ...s,
    bob: s.bob - SEAT_DROP,
    footL: { x: SEAT_FOOT_X - 4, y: 0 },
    footR: { x: SEAT_FOOT_X, y: 0 },
    fistL: { x: SEAT_HAND_X, y: SEAT_HAND_Y + g * 0.6 },
    fistR: { x: SEAT_HAND_X + 4, y: SEAT_HAND_Y + 1 - g * 0.6 },
  };
}

function sitStance(base: Stance, t: number, p: number): Stance {
  'worklet';
  const squat = postureHold(0, t);
  const seat = sitOut(t);
  if (p <= 0.52) return mixStance(base, squat, ease01(p / 0.52));
  const q = ease01((p - 0.52) / 0.48);
  const m = mixStance(squat, seat, q);
  // AND THE LEGS COME OFF THE FLOOR WHILE THEY TRAVEL. The seat puts the feet 31
  // and 35 units in front of him and the crouch has them under him, so blending
  // the two drags both heels 30-odd units along the ground — which is the skate
  // `strideStance` has a whole docstring about, in a pose rather than a walk.
  // Lifting them over the middle of the move is what a person does getting up: the
  // feet tuck back under before the push.
  const arc = Math.sin(Math.PI * q) * 5;
  return {
    ...m,
    footL: { x: m.footL.x, y: m.footL.y - arc },
    footR: { x: m.footR.x, y: m.footR.y - arc * 0.7 },
  };
}

/**
 * WHERE HE IS LOOKING — THE HEAD AND THE BODY GO THE SAME WAY.
 *
 * Measured on the rig, facing +x: negative `tilt` leans the body forward and
 * positive `neck` tips the head back; standing upright is the highest the head
 * ever gets. The first version of this function got the up look invisible (0.7
 * units of head, N12), and its replacement bent the body forward while tipping the
 * head BACK for a look down — the two cancelled, so the head held still while the
 * body sank under it: *"his head moves up but his body down"* (owner, 2026-09-25).
 */
function looked(s: Stance, look: number): Stance {
  'worklet';
  if (!look) return s;
  // THE HEAD CARRIES IT, AND IT HAS TO CLEAR THE SHOULDERS TO BE SEEN (N20).
  //
  // On a faceless disc the only cue the eye reads is where the head sits against
  // the shoulder line. A neck of 0.3 moved the head about six units — inside its
  // own radius, so nothing seemed to happen, and the body's lean was all anyone
  // saw. At 1.1–1.2 the head goes clean past the shoulders: thrown back behind
  // them for up, hanging in front of the chest for down. Drawn and chosen from a
  // grid (hands at the brow read as a wave; hands on the hips or thighs read as a
  // zig-zag, or vanished into the legs). The body leans a little the SAME way, so
  // nothing works against the head. It leaves the hands alone, so a look taken
  // from a seat keeps the seat's arms round the knees.
  if (look > 0) {
    return { ...s, tilt: s.tilt + 0.15 * look, neck: s.neck + 1.1 * look };
  }
  const d = -look;
  return { ...s, tilt: s.tilt - 0.2 * d, neck: s.neck - 1.2 * d };
}


/**
 * A weight shift, and it has to beat the breath to be worth having.
 *
 * `check:idle`'s calibration is the bar: `stand()` travels on its own, and 20 of
 * the 32 living holds once travelled no further than that — "not adding a
 * movement, adding a name for one". So the hips go over one foot, the shoulder
 * line leans and the hands answer.
 *
 * WHAT IT NO LONGER DOES IS SINK (AL1). It used to drop the pelvis 2.2 units as
 * the weight went across, which is the wobble a reader named — an ambient move on
 * 218 lessons, going up and down with nothing on the stage to explain it. The
 * shift is the lean, the feet and the hands; the height does not move.
 */
function leaned(s: Stance, p: number): Stance {
  'worklet';
  if (!p) return s;
  return {
    ...s,
    tilt: s.tilt + 0.09 * p,
    footL: { x: s.footL.x - 4 * p, y: s.footL.y },
    footR: { x: s.footR.x + 2.5 * p, y: s.footR.y },
    fistL: { x: s.fistL.x - 3 * p, y: s.fistL.y + 2 * p },
    fistR: { x: s.fistR.x + 3 * p, y: s.fistR.y + 2 * p },
  };
}

/**
 * THE STEP, WITH ITS CYCLE CONTINUED RATHER THAN RESTARTED.
 *
 * `strideStance` takes its phase from the distance covered in the leg it is given,
 * so a fresh leg starts at phase 0 — feet a full stride apart, both planted. Out
 * of a standing figure that is a 16.5-unit foot jump on the frame the step begins,
 * and out of a step a tap interrupted it is a 30-unit one. Both were measured
 * before they were fixed.
 *
 * They are one fix in two directions. `lead` (rig) offsets the phase without
 * moving the body, so a step out of a stand begins with the feet together; and a
 * step that CONTINUES gets an EXTENDED leg — start the journey `prior` units
 * further back and scale `tr` to match — which leaves the body exactly where it is
 * while handing the gait the distance it has already walked. Under both, the body
 * sits at `lerp(from, to, u)`, which is the invariant `strideStance`'s foot lock
 * depends on: "the stride follows the body".
 */
function stepStance(
  base: Stance, from: number, to: number, u: number, prior: number, k: number,
): Stance {
  'worklet';
  const kk = k > 0.01 ? k : 1;
  const a = from / kk;
  const b = to / kk;
  const span = Math.abs(b - a);
  const carried = Math.abs(prior) / kk;
  // ONE EXPRESSION FOR BOTH CASES, because a tap can land anywhere — including
  // inside the departure. The journey is EXTENDED backwards by whatever has
  // already been walked (`a0` is then the origin of the whole motion, and equals
  // `a` for a fresh step), so `walked` is the distance since he was last standing
  // still and everything below reads off it. Splitting the two cases was worth 10
  // units in a single frame: a tap 0.15s into a step left the departure blend
  // behind and jumped to the full walking pose.
  const d = b >= a ? 1 : -1;
  const a0 = a - d * carried;
  const total = carried + span;
  const walked = carried + span * u;
  const tr = total > 0.01 ? walked / total : 1;
  const g = gaitVary(WALK, a0 * 0.37 + b * 0.11);
  const st = stanceUsed(g);
  // THE CYCLE'S PHASE ORIGIN. At phase 0 the feet are a full stride apart and both
  // planted, which is a fine place to be if he was already walking and a teleport
  // if he was standing: measured, the frame a step began on moved a foot 16.5
  // units. `moves.strideMode` has had the answer since the branch road —
  // `(1 + stance)/2 · S / stance` is where both feet pass through zero.
  const lead = ((1 + st) * 0.5 * g.S) / st;
  const moving = strideStance(a0, b, base, tr, WALK, 0, lead);
  // …AND THE FIRST ELEVEN UNITS ARE STILL A DEPARTURE. At the lead phase the feet
  // share an x but one of them is at the top of its swing, 15 units off the floor,
  // so the walk still cannot simply switch on. This is `settleStep` read backwards:
  // the STANDING feet are pinned in the world — behind the body by however far it
  // has come — and the foot with further to go arcs over the gap, so both poses in
  // the blend agree about where the floor is and what happens is a first step.
  const pd = clamp01(walked / 11);
  if (pd >= 1) return moving;
  const tgtL = base.footL.x - walked;
  const tgtR = base.footR.x - walked;
  const gapL = Math.abs(tgtL - moving.footL.x);
  const gapR = Math.abs(tgtR - moving.footR.x);
  const arc = Math.sin(Math.PI * pd) * Math.min(U.standH * 0.3, Math.max(gapL, gapR) * 0.5) * 2;
  // Shared by gap rather than given to whichever foot is further, for the reason
  // `settleStep` now shares it: a comparison that flips mid-move moves the whole
  // arc from one foot to the other in a single frame.
  const tot = gapL + gapR + 1e-4;
  const standing: Stance = {
    ...base,
    footL: { x: tgtL, y: base.footL.y - arc * (gapL / tot) },
    footR: { x: tgtR, y: base.footR.y - arc * (gapR / tot) },
  };
  return mixStance(standing, moving, pd);
}

/**
 * The scene's stance with the layer applied — the one call `lookPose` makes.
 *
 * ORDER MATTERS AND IS NOT ARBITRARY. The walk wins over everything, because a
 * man walking is not also sitting and his arms are swinging rather than holding a
 * gesture; `strideStance` then settles back into the stance it was handed, so the
 * scene's own pose is what he arrives in. Sitting and crouching replace the legs,
 * so they come next. Looking and leaning are offsets and go last.
 *
 * `k` is the figure's scale: the plan is in STAGE units, because that is what the
 * boxes it was measured against are in, and the rig works in its own.
 */
export function stepBusy(st: WanderState): number {
  'worklet';
  if (!(st.legU >= 0 && st.legU <= 1)) return 0;
  if (Math.abs(st.legTo - st.legFrom) + st.legPrior <= 0.5) return 0;
  // A RAMP, NOT A SWITCH, AND THAT IS THE WHOLE POINT OF THE FUNCTION.
  //
  // This used to be read straight off `legU >= 0 && legU <= 1` at both call sites,
  // as a hard 1 or 0 — so on the frame a step began, the gaze (up to 0.6 of the
  // gaze angle, across the neck AND the spine) and any look or lean offset were
  // switched off between two frames while the body had moved no distance at all.
  // Measured through `lookPose`'s real composition, that is 17 units of head in one
  // frame, on 206 plans across 129 lessons — and it was invisible to `check:wander`,
  // which replays `wanderStance` and never calls `lookPose`.
  //
  // It reaches 1 in the first fifth of the step and leaves it in the last, so it is
  // 0 on the frames either side of the leg and the handover is continuous at both
  // ends. A fraction rather than a fixed time because the step's duration is not
  // in the state; measured after, the worst frame is well inside budget.
  //
  // AND THE FRACTION IS OF THE WHOLE JOURNEY, NOT OF THE LEG — the same arithmetic
  // `stepStance` uses, for the same reason. A tap re-parameterises the REMAINDER of
  // a step from zero, so reading the ramp off `legU` alone made a step that was
  // half walked read as one just beginning: the gaze came back on for one frame in
  // the middle of a stride, measured at 15.7 units. `legPrior` is the distance
  // already covered, so `walked / total` is continuous straight through the tap.
  const span = Math.abs(st.legTo - st.legFrom);
  const total = Math.abs(st.legPrior) + span;
  const u = total > 0.01 ? (Math.abs(st.legPrior) + span * st.legU) / total : 1;
  return clamp01(u / 0.2) * clamp01((1 - u) / 0.2);
}

export function wanderStance(base: Stance, st: WanderState, t: number, k: number): Stance {
  'worklet';
  let s = base;
  // THE DISTANCE ALREADY WALKED COUNTS TOWARD "IS HE WALKING". This read
  // `|legTo − legFrom| > 0.5`, which is true of a step and false of the LAST HALF
  // UNIT of one — so a tap 0.98 of the way through a step produced a leg the guard
  // threw away, and both feet went flat in a single frame while the body carried on
  // to its mark. Measured at 3.3 units, and invisible in the source: every part was
  // individually correct.
  if (st.legU >= 0 && st.legU <= 1 && Math.abs(st.legTo - st.legFrom) + st.legPrior > 0.5) {
    s = stepStance(base, st.legFrom, st.legTo, st.legU, st.legPrior, k);
  } else if (st.sit > 0.001) {
    s = sitStance(base, t, st.sit);
  } else if (st.crouch > 0.001) {
    s = mixStance(base, postureHold(0, t), ease01(st.crouch));
  }
  // Looking up while sitting is most of what sitting is FOR — he is on the floor
  // taking the thing in — so the head offsets are applied on top of the seat
  // rather than instead of it. They are FADED OUT of a walk rather than dropped
  // from one: a head craned back while the feet are running is the one combination
  // that reads as a fault, and taking it away in a single frame is the other one.
  const rest = 1 - stepBusy(st);
  if (rest <= 0) return s;
  return leaned(looked(s, st.look * rest), st.lean * rest);
}

/**
 * HOW MUCH OF THE GAZE TO KEEP WHILE HE IS BUSY.
 *
 * `lookPose` aims his head at what the beat draws (`make:gaze`). A deliberate
 * look up, a sit and a walk all have their own opinion about his head, and two
 * opinions on one neck is a fight nobody wins: the gaze would undo the look and
 * the look would undo the gaze. So the layer takes the neck while it is using it
 * and hands it back, eased by the same values, rather than either of them cutting.
 */
export function gazeKeep(st: WanderState): number {
  'worklet';
  const walking = stepBusy(st);
  const busy = Math.max(
    Math.abs(st.look) * (1 - walking),
    st.sit,
    st.crouch,
    walking,
  );
  return 1 - clamp01(busy);
}

/**
 * THE FACING, EASED THROUGH A PROFILE.
 *
 * `pose()` mirrors the whole local frame off the sign of `dir`, so flipping it
 * between two frames swaps the man for a mirrored copy — `facing()` exists in
 * `cinematicKit` for exactly that and this is the same rule one level out: the
 * plan's TURN moves ease `face` from +1 to −1, and multiplying keeps whatever the
 * scene was already doing with its own facing.
 */
export function wanderDir(dir: number, st: WanderState): number {
  'worklet';
  const d = dir * st.face;
  // AND A LEG THE LAYER GENERATED FOR ITSELF IS TURNED INTO the same way. `homeDir`
  // is a STAGE direction rather than a multiplier, so it needs no second opinion
  // about which way the scene stands him; `turnU` eases out and back inside the
  // window `wanderState` set aside for it, and is 0 on the frames either side.
  if (!st.homeDir || st.turnU <= 0) return d;
  return d + (st.homeDir - d) * st.turnU;
}

/** Feet-to-crown, for the checker: how tall he stands once the layer is applied. */
export const WANDER_STAND_H = U.standH;
