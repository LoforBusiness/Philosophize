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
  WALK, WALK_SPEED, U,
} from './rig';
import { postureHold } from './moves';

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
}

const REST: WanderState = {
  dx: 0, look: 0, sit: 0, crouch: 0, face: 1, lean: 0, legFrom: 0, legTo: 0, legU: -1, legPrior: 0,
};

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
  plan: readonly number[], t: number, start: WanderState,
): WanderState {
  'worklet';
  if (plan.length < W_HEAD) return { ...start, legU: -1, legPrior: 0 };
  const lo = plan[0];
  const hi = plan[1];

  // THE CARRIED OFFSET IS CLAMPED TO THIS BEAT'S OWN ROOM. He may have been
  // standing somewhere the previous beat's art left clear and this one does not,
  // and the generator cannot know when a reader taps. Walking back in is a step
  // like any other; appearing back in would be a teleport.
  const held = start.dx < lo ? lo : start.dx > hi ? hi : start.dx;
  const finish = start.legU > 0 && start.legU < 1
    ? (start.legTo < lo ? lo : start.legTo > hi ? hi : start.legTo)
    : held;
  const rest = finish !== held;
  const fin = rest ? stepSeconds(finish - held) * (1 - start.legU) : 0;

  let dx = held;
  let legFrom = 0;
  let legTo = 0;
  let legU = -1;
  let legPrior = 0;
  if (rest && t < fin) {
    legFrom = held;
    legTo = finish;
    legU = ease01(t / Math.max(fin, 0.01));
    legPrior = Math.abs(start.dx - start.legFrom);
    dx = lerp(legFrom, legTo, legU);
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
  const face = trackAt(plan, W_TURN, t - fin, start.face)[0];
  return { dx, look, sit, crouch, face, lean, legFrom, legTo, legU, legPrior };
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
function sitStance(base: Stance, t: number, p: number): Stance {
  'worklet';
  const squat = postureHold(0, t);
  const seat = postureHold(3, t);
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
 * WHERE HE IS LOOKING — AND THE TILT MUST NOT CANCEL THE NECK.
 *
 * N12's rule is that attention goes on the spine as well as the neck, and the
 * FIRST DRAFT OF THIS FUNCTION obeyed it and moved the head 0.7 units. Measured
 * against the bare breath's 2.6, a deliberate look up was invisible — which is
 * N12's own defect, arrived at by following N12.
 *
 * The arithmetic says why, and it is worth stating because the next person will
 * write the same thing. The head centre is
 *
 *     x = sin(PI + tilt) * 33 + sin(PI + tilt + neck) * 16
 *
 * so it is driven by `tilt` and by `tilt + neck` — and sin(PI + e) is about −e,
 * which makes POSITIVE tilt lean back and NEGATIVE neck tip the head forward.
 * Leaning back to carry a look up therefore moves the chest one way and the head
 * the other, and at 0.11 against −0.30 the two come within a unit of cancelling.
 *
 * The corpus already had the answer in its own two looking poses, and in both the
 * body moves the head the SAME way as the neck: act 65 GAZING UP is `neck −0.30`
 * with `tilt −0.05`, and act 152 LOOK UNDER is `neck +0.34` with the body bent
 * 0.30 forward and dropped 4.5. The difference between up and down is the BOB, not
 * the tilt, and both read because nothing fights the neck.
 *
 * And on this figure no amount of either RAISES the head: y is at its most
 * negative when tilt and neck are both zero, so standing upright is the highest
 * his head ever gets. Anything that has to read as "up" says so with the body.
 */
function looked(s: Stance, look: number): Stance {
  'worklet';
  if (!look) return s;
  if (look > 0) {
    return {
      ...s,
      neck: s.neck - 0.30 * look,
      tilt: s.tilt - 0.05 * look,
      bob: s.bob + 0.5 * look,
      // The chest opens as he looks up — act 65's own "arms forgotten", kept out
      // of the trunk so a forearm still shows (rule 1b).
      fistL: { x: s.fistL.x - 2.5 * look, y: s.fistL.y + 2 * look },
      fistR: { x: s.fistR.x + 2.5 * look, y: s.fistR.y + 2 * look },
    };
  }
  const d = -look;
  return {
    ...s,
    neck: s.neck + 0.34 * d,
    tilt: s.tilt - 0.30 * d,
    bob: s.bob - 4.5 * d,
    footL: { x: s.footL.x, y: s.footL.y + 3.4 * d },
    footR: { x: s.footR.x, y: s.footR.y + 3.4 * d },
    fistL: { x: s.fistL.x - 5 * d, y: s.fistL.y + 5 * d },
    fistR: { x: s.fistR.x + 5 * d, y: s.fistR.y + 5 * d },
  };
}

/**
 * A weight shift, and it has to beat the breath to be worth having.
 *
 * `check:idle`'s calibration is the bar: `stand()` travels 2.6 units on its own,
 * and 20 of the 32 living holds once travelled no further than that — "not adding
 * a movement, adding a name for one". So the hips go over one foot, the shoulder
 * line drops and the hands answer, which measures about twice the breath.
 */
function leaned(s: Stance, p: number): Stance {
  'worklet';
  if (!p) return s;
  return {
    ...s,
    tilt: s.tilt + 0.09 * p,
    bob: s.bob - 2.2 * p,
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
  // rather than instead of it. They are not applied to a walk: a head craned back
  // while the feet are running is the one combination that reads as a fault.
  if (st.legU >= 0 && st.legU <= 1) return s;
  return leaned(looked(s, st.look), st.lean);
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
  const busy = Math.max(
    Math.abs(st.look),
    st.sit,
    st.crouch,
    st.legU >= 0 && st.legU <= 1 ? 1 : 0,
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
  return dir * st.face;
}

/** Feet-to-crown, for the checker: how tall he stands once the layer is applied. */
export const WANDER_STAND_H = U.standH;
