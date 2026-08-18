// ─────────────────────────────────────────────────────────────────────────────
// THE MOVEMENT LIBRARY
//
// `rig.ts` is the SOLVER — two-bone IK, the gait cycle, the pose → joints →
// transform-array pipeline — plus the original vocabulary: 48 standing gestures,
// one walk, the boxing moves and a ladder climb. Everything there poses a figure
// that is standing still and moving its arms.
//
// This file is what the character can actually DO. Four families, each addressed
// by a plain number so a lesson script stays data rather than code:
//
//   moveStance(mode, dist)      — HOW they travel        24 modes
//   postureHold/Live(code, t)   — WHERE the body is      21 postures
//   actStance(code, t, u)       — WHAT they do           96 actions, of which
//                                 32 are HOLDS that loop on `t` (29–40 and
//                                 59–78, motion for its own sake) and 64 are
//                                 one-shots played over `u`
//   gazeAt() / pointAt()        — WHAT they attend to    aimed at a stage point
//
// The aiming pair is the cheapest realism in the whole codebase and the least
// obvious. Every `neck` value in the gesture library is a hard-coded constant, so
// a figure standing beside a chart is not looking at the chart — it is holding a
// number that happened to look right when the gesture was authored. `gazeAt`
// makes the head actually track a point on the stage, and `pointAt` puts the
// finger on it. Use them together and a figure explaining a diagram reads as a
// person explaining a diagram.
//
// ── THE TWO RULES THAT GOVERN EVERY POSE HERE ────────────────────────────────
//
// 1. A HANGING HAND BELONGS AT ROUGHLY y +6, NOT AT THE HIP. The shoulder sits at
//    y ≈ −26 in the pelvis frame and the arm is 33 units long (uarm 17 + farm 16).
//    A "resting" hand parked at y −4 is only 22 units away, so the solver has to
//    fold the elbow, the bend bows it outward, and the arm encloses a triangle of
//    paper against the torso. Same ink either side and no outline, so it reads as
//    a hole punched through the body — not as an arm. This defect has been fixed
//    three times now in three different places. Any NEW pose whose hand is meant
//    to hang must put it near arm's length below the shoulder; anything closer
//    has to be a deliberately, visibly bent arm (a hand at the chin, arms folded,
//    a boxer's guard), never an accident.
//
// 2. FEET STAY NARROW AND NEAR-VERTICAL WHEN STANDING. A wide sliding stance made
//    the near-straight legs read as segmented bars with a gap between them. The
//    deep crouches and kneels below are exempt — bent legs read fine — but no
//    upright pose here slides a foot more than a couple of units.
//
// Reach check for any new fist target: distance from (3, −26) for the right hand,
// (−3, −26) for the left. Over ~33 the solver clamps it and the arm goes straight,
// which is safe; between about 18 and 30 is where an unintended hole appears.
//
// 3. A RAISED HAND MUST CLEAR THE HEAD CIRCLE. The head is a 20-unit-radius disc
//    centred near (0, −49), and a fist is another 6-unit disc. Any hand target
//    within about 24 units of that centre fuses into the head and the figure
//    loses both the hand and the shape of its skull — the same failure that once
//    made the boxing gloves and the head read as one mass. Hands overhead belong
//    out at |x| ≈ 26, not at |x| ≈ 14. The exceptions are poses where touching the
//    face IS the gesture: a facepalm, a hand at the chin, eyes being shielded.
//
// 4. THE PELVIS CANNOT OUTRUN THE LEGS. A leg reaches 37 units (thigh 19 + shin
//    18), so a planted foot needs `34 + bob − footLift ≤ 36`. Raise `bob` past
//    that without lifting the feet to match and the solver stretches the shin
//    instead of bending it. `solve` now clamps feet to leg's length so this
//    degrades gracefully, but author it correctly anyway: when the body goes up,
//    the feet come up with it.
// ─────────────────────────────────────────────────────────────────────────────

import {
  clamp01, ease01, easeOutCubic, emoteHold, emoteLive, gaitVary, holdEnv, life2, lerp, mixStance,
  phaseFor, seatBob, settleFrac, settleStep, stanceUsed, stand, U, walk, WALK,
  type Gait, type P2, type Stance,
} from './rig';

// ── locomotion modes ─────────────────────────────────────────────────────────
// The original `WALK` is one specific walk: an even, unhurried, neutral one. It
// is the right default and it stays untouched. But a character who only ever has
// that one gait cannot be in a hurry, cannot be tired, cannot be sneaking, and
// cannot be pacing while it thinks — and a viewer reads all of that from the legs
// long before they read it from the words.
//
// `stance` is the fraction of the cycle a foot spends planted. Below 0.5 both
// feet leave the ground at once, which is the actual difference between a walk
// and a run. `tilt` is NEGATIVE for a forward lean.

/** Unhurried. Short steps, feet barely leaving the floor, arms almost still. */
export const STROLL: Gait = {
  S: 26, lift: 8, stance: 0.66, bob: 2.2, bobSign: -1,
  tilt: 0.11, armBase: 0.09, armSwing: 0.30, standH: 34,
};
/** Somewhere to be. Long steps, real arm swing, leaning into it. */
export const HURRY: Gait = {
  S: 42, lift: 15, stance: 0.58, bob: 3.6, bobSign: -1,
  tilt: -0.06, armBase: 0.09, armSwing: 0.60, standH: 34,
};
/** A run: stance under 0.5, so there is a flight phase with both feet off the ground. */
export const RUN: Gait = {
  S: 56, lift: 26, stance: 0.40, bob: 5.5, bobSign: -1,
  tilt: -0.18, armBase: 0.09, armSwing: 0.85, standH: 34,
};
/** Heavy and reluctant. Short steps, a deep drop on each one, dead arms. */
export const TRUDGE: Gait = {
  S: 24, lift: 6, stance: 0.70, bob: 4.2, bobSign: -1,
  tilt: -0.02, armBase: 0.09, armSwing: 0.22, standH: 34,
};
/** Deliberate and even, knees high, upright. Ceremony, drill, insistence. */
export const MARCH: Gait = {
  S: 32, lift: 22, stance: 0.55, bob: 2.6, bobSign: -1,
  tilt: 0.04, armBase: 0.09, armSwing: 0.55, standH: 34,
};
/** Small careful steps, feet placed high and set down softly. */
export const SNEAK: Gait = {
  S: 20, lift: 12, stance: 0.62, bob: 1.4, bobSign: -1,
  tilt: -0.10, armBase: 0.09, armSwing: 0.16, standH: 34,
};
/** One leg short-steps and the body drops onto it — see mode 7 for the asymmetry. */
export const LIMP: Gait = {
  S: 22, lift: 9, stance: 0.66, bob: 3.4, bobSign: -1,
  tilt: -0.04, armBase: 0.09, armSwing: 0.24, standH: 34,
};
/** Light and airborne; mode 8 adds the hop on top. */
export const SKIP: Gait = {
  S: 38, lift: 20, stance: 0.50, bob: 5.0, bobSign: -1,
  tilt: 0.02, armBase: 0.09, armSwing: 0.55, standH: 34,
};
/** Up on the balls of the feet: tiny steps, high lift, body held tall. */
export const TIPTOE: Gait = {
  S: 18, lift: 14, stance: 0.58, bob: 1.2, bobSign: -1,
  tilt: -0.04, armBase: 0.09, armSwing: 0.10, standH: 34,
};
/** Thinking on the move: slow, short, almost no arm swing (mode 11 clasps them). */
export const PACE: Gait = {
  S: 22, lift: 7, stance: 0.68, bob: 1.8, bobSign: -1,
  tilt: 0.04, armBase: 0.09, armSwing: 0.05, standH: 34,
};

// ── the second shelf of gaits ────────────────────────────────────────────────
//
// THERE WAS ONLY ONE RUN. Mode 3 is a single fixed sprint, so every figure that
// ever ran, ran at exactly the same speed with exactly the same lean, and a
// viewer watching two lessons in a row saw the same clip twice. Three runs and
// three walks below, chosen so that each is different in the thing a viewer
// actually reads — how long the stride is, how long both feet are off the ground,
// and how far forward the chest is.
//
// `stance` is the tell and it is the only honest way to separate them: 0.46 is a
// jog you could hold a conversation through, 0.44 is a distance runner's lope,
// 0.32 is a sprint nobody sustains. Making them differ by speed alone produces
// the same animation played faster, which is exactly the sameness being fixed.
//
// Every one obeys the standH rule from the header: a planted foot needs
// `34 + bob − lift ≤ 36`, so the bob can never outrun the foot lift.

/** An easy run you could talk through — short flight, relaxed arms. */
export const JOG: Gait = {
  S: 44, lift: 18, stance: 0.46, bob: 4.0, bobSign: -1,
  tilt: -0.10, armBase: 0.09, armSwing: 0.62, standH: 34,
};
/** Flat out. The longest stride, the deepest lean, both feet off most of the cycle. */
export const SPRINT: Gait = {
  S: 68, lift: 32, stance: 0.32, bob: 6.5, bobSign: -1,
  tilt: -0.30, armBase: 0.05, armSwing: 1.05, standH: 34,
};
/** The distance runner: long, loose and economical, almost no vertical. */
export const LOPE: Gait = {
  S: 62, lift: 20, stance: 0.44, bob: 3.2, bobSign: -1,
  tilt: -0.12, armBase: 0.09, armSwing: 0.66, standH: 34,
};
/** Shoulders wide, weight rolling side to side. Mode 15 adds the roll. */
export const SWAGGER: Gait = {
  S: 30, lift: 10, stance: 0.64, bob: 3.0, bobSign: -1,
  tilt: 0.07, armBase: 0.16, armSwing: 0.45, standH: 34,
};
/** Feet barely leave the floor at all — worn out, or unwilling. */
export const SHUFFLE: Gait = {
  S: 16, lift: 3, stance: 0.74, bob: 1.6, bobSign: -1,
  tilt: 0.02, armBase: 0.09, armSwing: 0.12, standH: 34,
};
/** Big, light, airborne leaps. Delight, in the legs. */
export const BOUND: Gait = {
  S: 50, lift: 30, stance: 0.42, bob: 7.0, bobSign: 1,
  tilt: -0.04, armBase: 0.09, armSwing: 0.80, standH: 34,
};

// ── the third shelf: gaits that are not about speed ──────────────────────────
//
// Everything above answers "how fast, and how willingly". These answer a
// different question — what the GROUND is doing, and whether the body is in
// control of itself. A slope, a stumble and a stomp are all walks, and none of
// them is a walk played at a different rate.
//
// `standH` is the knob the first two shelves never touched. Lowering it is how a
// creep gets under something and how a climb leans into a hill: the pelvis rides
// closer to the floor for the whole cycle rather than dipping once per step.

/** Right down, under something, one slow foot at a time. */
export const CREEP: Gait = {
  S: 15, lift: 7, stance: 0.72, bob: 1.0, bobSign: -1,
  tilt: -0.16, armBase: 0.14, armSwing: 0.10, standH: 27,
};
/** Off balance. Mode 19 makes the recovery uneven — this is only the wobble. */
export const STAGGER: Gait = {
  S: 26, lift: 12, stance: 0.54, bob: 4.6, bobSign: -1,
  tilt: -0.02, armBase: 0.20, armSwing: 0.50, standH: 33,
};
/** Heavy, flat-footed, and loud. Each step arrives rather than rolls. */
export const STOMP: Gait = {
  S: 28, lift: 16, stance: 0.62, bob: 5.0, bobSign: -1,
  // armSwing 0.62, not 0.40: at 0.40 the hands moved about six units and on the
  // contact sheet this was indistinguishable from a plain walk. A stomp is loud,
  // and the only way a silent picture can say loud is with amplitude.
  tilt: 0.03, armBase: 0.12, armSwing: 0.62, standH: 34,
};
/** Almost no vertical at all — the head travels on a rail. */
export const GLIDE: Gait = {
  S: 34, lift: 5, stance: 0.60, bob: 0.6, bobSign: -1,
  tilt: -0.06, armBase: 0.09, armSwing: 0.26, standH: 34,
};
/** Up a slope: short steps, knees high, the whole body leaning into it. */
export const CLIMB: Gait = {
  S: 20, lift: 20, stance: 0.64, bob: 3.0, bobSign: -1,
  tilt: -0.26, armBase: 0.16, armSwing: 0.34, standH: 31,
};
/** Down a slope: long reaching steps, weight held BACK, braking each time. */
export const DESCEND: Gait = {
  S: 30, lift: 9, stance: 0.60, bob: 3.4, bobSign: -1,
  tilt: 0.16, armBase: 0.22, armSwing: 0.38, standH: 32,
};

// ── the road shelf: the same five gaits, at road scale ───────────────────────
//
// THE BRANCH ROAD IS THE ONE PLACE THAT PINS BOTH DISTANCE AND DURATION, and
// that is a contradiction rather than a setting. A span is 322 world units and
// it was walked in 7 seconds whatever the gait, so every gait travelled at
// 1.08 body-heights a second. Foot phase is driven by DISTANCE (which is what
// stops the feet skating), so cadence is not a free choice:
//
//     cadence = speed / stride
//
// Fix the speed and a short stride can only be paid for with more steps. The
// five gaits came out at, in steps per second:
//
//     trudge 6.18 · stroll 5.71 · walk 4.36 · hurry 3.53 · run 2.65
//
// against 1.7–2.1 for a real walk and 2.6–3.2 for a real run. So four of the
// five were churning, and the ORDER WAS INVERTED: the trudge — the slowest
// thing on the road — moved its legs 2.3× faster than the run. That is the
// whole of "its legs are moving really, really fast in a small distance", and
// no amount of retiming one gait can fix it while the duration is shared.
//
// Two things follow, and they have to be done together:
//
//   · THE STRIDES ARE ROUGHLY DOUBLE the lesson shelf's. A human's gait cycle
//     is about 0.8 of their own height; the lesson walk's is 0.49, which is
//     fine for crossing a stage in a second and is half a stride at road
//     distance. These run 0.84 → 1.09.
//   · EACH GAIT KEEPS ITS OWN SPEED, so the span takes as long as that gait
//     takes. See `spanSeconds` in worldPath — a trudge gets 9 seconds and a run
//     4.8, which is the only way the cadence ordering comes out the right way
//     round.
//
// They are a SEPARATE SHELF because 53 lesson scenes walk figures with `WALK`
// through `travelStance`, over a couple of hundred stage units in under a
// second. Those walks are not wrong and retuning the shared table to fix the
// road would have quietly restrided every one of them. Lessons already solve
// this properly — `travelStance` takes its duration FROM the distance — so the
// road is the only consumer that needed its own numbers.
//
// The upper body is not duplicated: `roadBase` maps each of these back to the
// lesson mode whose arms, head and lean it borrows.

// ── HOW BIG A ROAD SWING HAS TO BE, AND HOW THAT WAS SETTLED ────────────────
//
// "Make sure the arms are moving properly and not awkwardly or hardly at all."
// The previous round of this was judged on `fistL.x`, the number handed TO the
// arm — and that is the wrong end. What a reader sees is the WRIST the IK
// actually solves, minus the shoulder's own travel, against the figure's DRAWN
// height. Measured that way, across every span of a branch rather than one:
//
//     walk 0.115–0.221 · stroll 0.099–0.194 · hurry 0.145–0.277
//     run  0.285–0.292 · trudge 0.087–0.170
//
// A person walking swings a hand through 0.20–0.30 of their own height. So
// three of the five sat under it and the worst individual journeys — a trudge at
// 0.087, a stroll at 0.099 — are the dead arm being described. Walk and stroll
// alone are 54% of all spans.
//
// The old check passed all of this because it divided the REQUESTED fist target
// by a nominal 69 and asked for 0.15; the request is not the movement. It now
// measures the solved wrist, and its floor is 0.15 of real drawn height.
//
// The values below are set so the MEDIAN lands in 0.20–0.30 and, because
// `gaitVary` re-rolls the swing ×0.70–1.36 per journey, so the WORST draw still
// clears 0.15. Tuning the median alone leaves one span in ten looking broken.

/** Road walk. Nothing to prove; the default journey between two lessons. */
export const ROAD_WALK: Gait = {
  S: 63, lift: 11, stance: 0.62, bob: 3.0, bobSign: -1,
  tilt: 0.09, armBase: 0.09, armSwing: 0.62, standH: 34,
};
/** Road stroll. Loose and unhurried, but a hanging arm still swings: at 0.50 the
 *  quietest journey drew 0.099 of his height, which reads as an arm that is not
 *  attached to anything. */
export const ROAD_STROLL: Gait = {
  S: 60, lift: 8, stance: 0.66, bob: 2.2, bobSign: -1,
  tilt: 0.11, armBase: 0.09, armSwing: 0.80, standH: 34,
};
/** Road hurry. Longer step, more lean, arms already at full pump. */
export const ROAD_HURRY: Gait = {
  S: 68, lift: 15, stance: 0.58, bob: 3.6, bobSign: -1,
  tilt: -0.06, armBase: 0.09, armSwing: 0.74, standH: 34,
};
/** Road run. lift 19, not 26: at 26 the foot came up 0.46 of the figure's own
 *  height — knee past the waist on every step, which is a cartoon prance and
 *  was described exactly that way ("its feet were too high above the ground").
 *  The long stride is the part worth keeping. */
export const ROAD_RUN: Gait = {
  S: 75, lift: 16, stance: 0.40, bob: 5.5, bobSign: -1,
  tilt: -0.18, armBase: 0.09, armSwing: 0.98, standH: 34,
};
/** Road trudge. The deadness lives in the dropped head and the heavy bob, where
 *  it can be seen — NOT in the arms, because an arm that does not move is not a
 *  tired arm, it is a missing one. 1.18 looks large beside the others only
 *  because mode 4 multiplies it by 10 where a walk multiplies by 24; the hand
 *  still ends up moving less than every other gait here (0.196 of his height
 *  against the walk's 0.240), which is the point. */
export const ROAD_TRUDGE: Gait = {
  S: 58, lift: 6, stance: 0.70, bob: 4.2, bobSign: -1,
  tilt: -0.02, armBase: 0.09, armSwing: 1.18, standH: 34,
};

// ── two that are not about getting there ─────────────────────────────────────
//
// "Move its arms in a walking manner, or a funny manner in some of the walking
// animations." The five above are all answers to "how fast, and how willingly",
// so a reader who walks a whole branch sees five versions of the same errand.
// These two are the road doing something for its own sake.
//
// They cost no new upper body. `roadBase` is `mode − 24`, so 29 lands on lesson
// mode 5 and 32 on mode 8 — the march's straight high arms and the skip's extra
// hop per stride, already written and already checked. Only the legs are
// restrided for road distance.
//
// Both are RARE on purpose (8% each). A gag that turns up every third journey is
// not a gag, it is the walk.

/** Road march. Chin up, arms straight out and swinging hard. Absurd, on a path
 *  through a wood, which is exactly why it is worth 8% of the journeys. */
export const ROAD_MARCH: Gait = {
  S: 64, lift: 15, stance: 0.55, bob: 3.0, bobSign: -1,
  tilt: 0.04, armBase: 0.09, armSwing: 0.62, standH: 34,
};
/** Road skip. Mode 8 adds a hop per stride on top of this, so the tabled `lift`
 *  is deliberately LOW — 9, where the hurry has 15. The air comes from the hop;
 *  stacking a high lift under it puts the foot above his own waist and the whole
 *  thing turns into the cartoon prance the run was already pulled back from. */
export const ROAD_SKIP: Gait = {
  S: 70, lift: 9, stance: 0.50, bob: 4.0, bobSign: -1,
  tilt: 0.02, armBase: 0.09, armSwing: 0.60, standH: 34,
};

/** First road mode. `gaitForSpan` returns these; `worldPath.spanSeconds` times them. */
export const ROAD_MODE_0 = 24;

/**
 * The lesson mode a road mode borrows its UPPER BODY from.
 *
 * Declared here, above `strideMode`, because a worklet that calls a worklet
 * declared further down the file hits its temporal dead zone and throws at
 * import — see the rule book. Plain modes pass through untouched.
 */
export function roadBase(mode: number): number {
  'worklet';
  return mode >= ROAD_MODE_0 ? mode - ROAD_MODE_0 : mode;
}

/**
 * Gait for a travel mode. 0 walk · 1 stroll · 2 hurry · 3 run · 4 trudge ·
 * 5 march · 6 sneak · 7 limp · 8 skip · 9 tiptoe · 10 back away · 11 pace.
 * 24–28 are the road shelf: the same five at road scale. 29 and 32 are the two
 * character gaits, and their numbers are not free — `roadBase` is `mode − 24`,
 * so 29 must be the march (5) and 32 must be the skip (8) to borrow the right
 * upper body.
 */
export function gaitFor(mode: number): Gait {
  'worklet';
  if (mode === 24) return ROAD_WALK;
  if (mode === 25) return ROAD_STROLL;
  if (mode === 26) return ROAD_HURRY;
  if (mode === 27) return ROAD_RUN;
  if (mode === 28) return ROAD_TRUDGE;
  if (mode === 29) return ROAD_MARCH;
  if (mode === 32) return ROAD_SKIP;
  if (mode === 1) return STROLL;
  if (mode === 2) return HURRY;
  if (mode === 3) return RUN;
  if (mode === 4) return TRUDGE;
  if (mode === 5) return MARCH;
  if (mode === 6) return SNEAK;
  if (mode === 7) return LIMP;
  if (mode === 8) return SKIP;
  if (mode === 9) return TIPTOE;
  if (mode === 11) return PACE;
  if (mode === 12) return JOG;
  if (mode === 13) return SPRINT;
  if (mode === 14) return LOPE;
  if (mode === 15) return SWAGGER;
  if (mode === 16) return SHUFFLE;
  if (mode === 17) return BOUND;
  if (mode === 18) return CREEP;
  if (mode === 19) return STAGGER;
  if (mode === 20) return STOMP;
  if (mode === 21) return GLIDE;
  if (mode === 22) return CLIMB;
  if (mode === 23) return DESCEND;
  return WALK;                                   // 0, and 10 (backing away) reversed
}

/**
 * The body on top of a gait. The legs come from `walk`, which the gait already
 * shapes; this layers on everything a gait cannot express — where the arms are
 * carried, how the head is held, whether the body is crouched or slumped or
 * proud. That upper body is most of what tells a viewer WHY someone is walking.
 *
 * `g` is passed in rather than looked up so the caller can hand in a varied gait
 * (see `strideMode`) and still get the mode's character.
 */
function moveBody(mode: number, dist: number, g: Gait): Stance {
  'worklet';
  const d = mode === 10 ? -dist : dist;          // backing away runs the cycle in reverse
  const w = walk(d, g);
  const ph = phaseFor(d, g);
  const c = Math.cos(ph);
  const sw = g.armSwing;

  if (mode === 1) {                              // STROLL — chin up, hands low and lazy
    return {
      ...w, neck: -0.07, tilt: w.tilt + 0.02,
      fistL: { x: 1 + c * sw * 18, y: 8 }, fistR: { x: 1 - c * sw * 18, y: 8 },
    };
  }
  if (mode === 2) {                              // HURRY — bigger pump, eyes ahead
    return {
      ...w, neck: -0.08,
      fistL: { x: 5 + c * sw * 20, y: 2 }, fistR: { x: 5 - c * sw * 20, y: 2 },
    };
  }
  if (mode === 3) {                              // RUN — elbows bent and driving
    // ── `sw`, NOT A FIXED 16 ────────────────────────────────────────────────
    // This branch, and modes 5 and 8 below, typed their amplitude in and so
    // ignored `armSwing` completely. Three consequences, all invisible until
    // measured: the gait tables carried a number that did nothing (ROAD_RUN
    // still says 0.85 and had no way to spend it), `gaitVary` could re-roll the
    // swing per journey without any of these three arms changing — measured at
    // 0.285→0.292 of his height across forty spans, where a walk moves through
    // 0.115→0.221 — and the road shelf could not be tuned at all.
    //
    // 18.8 rather than a round number so the LESSON run is unchanged:
    // RUN.armSwing is 0.85 and 0.85 × 18.8 = 15.98, against the 16 that was
    // there. 53 scenes run through here and none of them should move.
    return {
      ...w, neck: -0.10, tilt: w.tilt - 0.04,
      fistL: { x: 8 + c * sw * 18.8, y: -14 - c * 6 },
      fistR: { x: 8 - c * sw * 18.8, y: -14 + c * 6 },
    };
  }
  if (mode === 4) {                              // TRUDGE — head down, arms dead
    return {
      ...w, tilt: -0.13, neck: 0.21,
      fistL: { x: 2 + c * sw * 10, y: 9 }, fistR: { x: 2 - c * sw * 10, y: 9 },
    };
  }
  if (mode === 5) {                              // MARCH — chin up, arms straight and high
    // 43.6 keeps the lesson march exactly where it was: MARCH.armSwing 0.55 ×
    // 43.6 = 23.98, against the 24 typed here before. See mode 3.
    return {
      ...w, tilt: 0.03, neck: -0.13,
      fistL: { x: 4 + c * sw * 43.6, y: 2 }, fistR: { x: 4 - c * sw * 43.6, y: 2 },
    };
  }
  if (mode === 6) {                              // SNEAK — crouched, hands out front
    return {
      ...w, bob: w.bob - 9, tilt: -0.17, neck: -0.02,
      fistL: { x: 15, y: -2 }, fistR: { x: 22, y: -6 },
    };
  }
  if (mode === 7) {                              // LIMP — the body drops onto the bad leg
    const bad = Math.max(0, c);
    return {
      ...w, bob: w.bob - bad * 3.6, tilt: w.tilt - bad * 0.05, neck: 0.07,
      // ONLY THE LIFT IS ASYMMETRIC — NEVER THE X. This scaled `footR.x` by 0.66
      // as well, and that skated the planted foot 7.3 units per stride: the whole
      // foot-lock rests on `phaseFor` advancing a planted foot by exactly `S`
      // while it is down, so shortening its travel while the body still covers
      // the full distance slides it along the floor. `y` is safe because it is
      // zero for the whole stance phase — scaling it only lowers the swing, which
      // IS the limp: the bad leg barely leaves the ground and the body drops onto
      // it. Same reason the two legs must keep one `S` and one `stance`.
      footR: { x: w.footR.x, y: w.footR.y * 0.45 },
      fistL: { x: 2 + c * sw * 14, y: 8 }, fistR: { x: 2 - c * sw * 14, y: 8 },
    };
  }
  if (mode === 8) {                              // SKIP — an extra hop per stride
    // The feet must leave the ground BY MORE than the pelvis rises. Lifting only
    // the pelvis pushes the planted foot past the leg's 37-unit reach, and the
    // shin stretches to meet it: the figure grows two long straight sticks for
    // legs at the top of every hop.
    const hop = Math.max(0, Math.sin(2 * ph));
    return {
      ...w, bob: w.bob + hop * 6, neck: -0.09,
      footL: { x: w.footL.x, y: w.footL.y - hop * 9 },
      footR: { x: w.footR.x, y: w.footR.y - hop * 9 },
      // 36.4 keeps the lesson skip where it was: SKIP.armSwing 0.55 × 36.4 =
      // 20.02, against the 20 typed here before. See mode 3.
      fistL: { x: 4 + c * sw * 36.4, y: -5 }, fistR: { x: 4 - c * sw * 36.4, y: -5 },
    };
  }
  if (mode === 9) {                              // TIPTOE — tall, arms out for balance
    return {
      ...w, bob: w.bob + 3, tilt: -0.06, neck: -0.02,
      footL: { x: w.footL.x, y: w.footL.y - 2 },
      footR: { x: w.footR.x, y: w.footR.y - 2 },
      fistL: { x: -22, y: -20 }, fistR: { x: 24, y: -22 },
    };
  }
  if (mode === 10) {                             // BACK AWAY — hands up, leaning off
    return {
      ...w, tilt: 0.12, neck: 0.02,
      fistL: { x: -4, y: -20 }, fistR: { x: 14, y: -30 },
    };
  }
  if (mode === 11) {                             // PACE — hands clasped behind, head down
    return {
      ...w, tilt: -0.04, neck: 0.15,
      fistL: { x: -13, y: 4 }, fistR: { x: -16, y: 6 },
    };
  }
  // ── the second shelf ───────────────────────────────────────────────────────
  // What separates one run from another is almost entirely above the waist. The
  // legs of a jog and a sprint differ by numbers a viewer cannot name; the ARMS
  // and the CHEST are what say which one they are looking at.
  if (mode === 12) {                             // JOG — light, elbows in, breathing easy
    return {
      ...w, neck: -0.05,
      // A jog carries its hands about chest height and barely crosses the body.
      fistL: { x: 6 + c * sw * 15, y: -9 - Math.abs(c) * 2 },
      fistR: { x: 6 - c * sw * 15, y: -9 - Math.abs(c) * 2 },
    };
  }
  if (mode === 13) {                             // SPRINT — hand to chin, hand past the hip
    // The sprinter's arm is the one real asymmetry in the set: it drives from the
    // cheek to behind the hip, not evenly either side of a rest. Kept out at
    // |x| ≥ 22 at the top so the fist never lands inside the head (the 26-unit
    // rule in the header) — a sprint with its hand deleted reads as a stump.
    const drive = c * sw;
    return {
      ...w, neck: -0.10, tilt: w.tilt - 0.04,
      fistL: { x: 22 + drive * 14, y: -18 - drive * 8 },
      fistR: { x: 22 - drive * 14, y: -18 + drive * 8 },
    };
  }
  if (mode === 14) {                             // LOPE — long and loose, low hands, quiet head
    return {
      ...w, neck: -0.03, tilt: w.tilt + 0.03,
      fistL: { x: 4 + c * sw * 20, y: -2 },
      fistR: { x: 4 - c * sw * 20, y: -2 },
    };
  }
  if (mode === 15) {                             // SWAGGER — the shoulders roll with the hips
    // The roll is a half-cycle behind the legs, which is what makes it read as
    // weight arriving rather than as the whole body wobbling in time.
    //
    // IT HAS TO BE BIG OR IT IS NOT THERE. The first pass rolled the torso 0.03
    // and moved the hands 3 units, and on the contact sheet it was
    // indistinguishable from SHUFFLE two rows below — both came out as an upright
    // figure with hanging arms. This is a side view, so "shoulders held wide" is
    // not available; everything a swagger has to say has to be said with the
    // amount of vertical drop per step, the torso roll, and arms that ARC rather
    // than slide.
    const roll = Math.cos(ph - Math.PI / 2);
    return {
      ...w,
      neck: -0.08,
      tilt: w.tilt + 0.04 + roll * 0.07,
      // Deeper drop onto each planted foot. lift is 10, so bob may reach 12.
      bob: w.bob - Math.abs(roll) * 1.6,
      // The vertical term is what turns a swing into an arc: the hand rises as it
      // comes forward and drops as it goes back, the way a loose arm actually
      // travels.
      fistL: { x: 10 + c * sw * 20, y: 7 - c * 4 },
      fistR: { x: 10 - c * sw * 20, y: 7 + c * 4 },
    };
  }
  if (mode === 16) {                             // SHUFFLE — arms dead, head down, going nowhere
    return {
      ...w, neck: 0.16, tilt: w.tilt + 0.05,
      fistL: { x: 1 + c * sw * 8, y: 9 }, fistR: { x: 1 - c * sw * 8, y: 9 },
    };
  }
  if (mode === 17) {                             // BOUND — arms rise WITH the flight, not against it
    // Tied to the bob rather than to the stride, so the arms lift as the body
    // leaves the ground. Opposing the flight is what makes a jump look like a
    // stumble.
    const air = clamp01(-w.bob / 7);
    return {
      ...w, neck: -0.09 - air * 0.05, tilt: w.tilt - air * 0.03,
      fistL: { x: 8 + c * sw * 16, y: 4 - air * 16 },
      fistR: { x: 8 - c * sw * 16, y: 4 - air * 16 },
    };
  }
  if (mode === 18) {                             // CREEP — low, hands ready, eyes up
    return {
      ...w, neck: -0.18, tilt: w.tilt - 0.04,
      fistL: { x: 13 + c * sw * 6, y: -6 }, fistR: { x: 18 - c * sw * 6, y: -8 },
    };
  }
  if (mode === 19) {                             // STAGGER — the correction is always late
    // A stumble is not a wobble: it is a body arriving somewhere it did not plan
    // and CATCHING itself a moment afterwards. The lag is the whole read, so the
    // torso runs a slower, offset wave than the legs rather than the same one.
    const late = Math.sin(ph * 0.5 + 1.1);
    return {
      ...w, tilt: w.tilt + late * 0.16, neck: 0.06 - late * 0.10,
      bob: w.bob - Math.abs(late) * 1.2,
      fistL: { x: -2 + late * 14, y: 2 - Math.abs(late) * 8 },
      fistR: { x: 12 - late * 12, y: 0 - Math.abs(late) * 6 },
    };
  }
  if (mode === 20) {                             // STOMP — arrives flat, and the body knows it
    // The jolt is tied to the FOOTFALL, not to the stride: it spikes when a foot
    // lands and decays, which is what separates a stomp from a heavy walk.
    const land = Math.max(0, -Math.cos(2 * ph)) ** 3;
    return {
      ...w,
      tilt: w.tilt + 0.05 - land * 0.05,
      neck: 0.05 + land * 0.09,                  // the head snaps down as it lands
      bob: w.bob + land * 3.2,                   // and the whole body drops onto it
      fistL: { x: 3 + c * sw * 22, y: 6 - Math.abs(c) * 3 },
      fistR: { x: 3 - c * sw * 22, y: 6 - Math.abs(c) * 3 },
    };
  }
  if (mode === 21) {                             // GLIDE — everything above the hips is still
    return {
      ...w, neck: -0.04, tilt: w.tilt,
      fistL: { x: -3 + c * sw * 10, y: 7 }, fistR: { x: 4 - c * sw * 10, y: 7 },
    };
  }
  if (mode === 22) {                             // CLIMB — hands help, chest over the toes
    return {
      ...w, neck: -0.22, tilt: w.tilt - 0.02,
      fistL: { x: 16 + c * sw * 10, y: -14 }, fistR: { x: 21 - c * sw * 10, y: -18 },
    };
  }
  if (mode === 23) {                             // DESCEND — weight back, arms out for balance
    return {
      ...w, neck: 0.14, tilt: w.tilt + 0.02,
      fistL: { x: -14 + c * sw * 10, y: -4 }, fistR: { x: -9 - c * sw * 10, y: -6 },
    };
  }
  return w;                                      // 0 — the plain walk
}

/**
 * How far the body travels between a `fromStand` departure and the swing foot
 * LANDING — one first step, in the distance units the cycle is driven by.
 *
 * This is the honest length for a departure blend, and it is a derivation rather
 * than a taste: a walk that is still part-standing when its raised foot comes
 * down has that foot skimming forward along the ground, which is a skate. The
 * blend has to be finished before the first footfall, so this is exactly how
 * long it gets.
 *
 * Uses `stanceUsed`, not the table's own figure, for the reason spelled out on
 * `strideMode`: the table says a run holds stance for 0.40 of its cycle and no
 * run in this app has ever been walked that way.
 */
export function firstStep(mode: number): number {
  'worklet';
  const g = gaitFor(mode);
  const st = stanceUsed(g);
  return (1 - st) * 0.5 * g.S / st;
}

/** One travel mode's stance at a given distance travelled. See `gaitFor` for codes. */
export function moveStance(mode: number, dist: number): Stance {
  'worklet';
  return moveBody(mode, dist, gaitFor(mode));
}

/**
 * `strideStance` for a travel mode — walk from x0 to x1 in the given manner and
 * ease into `settled` on arrival. Same contract as the rig's version, including
 * the per-journey gait variation and the push-off / landing weight shift, so the
 * two are interchangeable at a call site.
 *
 * Mode 10 (backing away) is the one that needs the scene's help: keep `dir`
 * pointing at whatever they are retreating FROM, rather than letting `dirsFrom`
 * flip them, or they will simply be walking normally in the other direction.
 *
 * `fromStand` says the journey begins from a genuine standstill, and it defaults
 * to false — which is what every one of the 102 lessons gets, unchanged.
 *
 * A cycle starts at phase 0 unless told otherwise, and phase 0 is the WORST place
 * to begin a walk from rest: it is mid-stance with the feet a full stride apart
 * and BOTH of them planted, so the departure has to drag two loaded feet apart
 * against the ground. `fromStand` starts it half a cycle past the end of stance
 * instead — the instant the feet cross, swing foot at the top of its arc directly
 * above the planted one, which is what the first step of a real gait initiation
 * looks like.
 *
 * COMPUTED IN HERE, off `g`, and that is the whole point. `gaitVary` has just
 * rewritten this journey's stride length and clamped its stance fraction into
 * [STANCE_MIN, STANCE_MAX]; a caller reading `gaitFor(mode).stance` is reading a
 * number that is about to be overwritten. Working it out from the table gave a
 * run its crossing point at phase 0.70 when the gait it actually walks crosses at
 * 0.775 — feet a third of a stride apart at the very moment they were supposed to
 * be together, and eight world units of stance-foot skate to close the gap.
 */
export function strideMode(
  x0: number, x1: number, settled: Stance, tr: number, mode: number, seed = 0, fromStand = false
): Stance {
  'worklet';
  // See `strideStance` in rig.ts: `seed` gives a companion on the same journey its
  // own gait habit and its own footfall, so a pair never marches in lockstep.
  const g = gaitVary(gaitFor(mode), x0 * 0.37 + x1 * 0.11 + seed * 3.7);
  const span = Math.abs(x1 - x0);
  // At phase u the swing foot sits at −S/2 + S·smoothstep((u−st)/(1−st)) and the
  // planted one at S/2 − S(u−½)/st. u = (1+st)/2 sends both to zero, whatever st
  // is — so this is exact for every gait rather than tuned for the default one.
  const lead = fromStand ? (1 + g.stance) * 0.5 * g.S / g.stance : 0;
  // NOT `span * ease01(tr)`. This file was written from the pre-fix version of
  // `strideStance` and kept the double-ease that rig.ts had already removed: the
  // scene puts the body at `lerp(x0, x1, tr)` having eased tr once, so easing it
  // again here drove the feet along `span·ease01(ease01(u))` while the body ran
  // on `span·ease01(u)`. Two curves meeting only at the ends, and a glide in
  // between — measured at 122 units of skate on a 220-unit walk, three and a half
  // strides. Every travel mode in this file went through it.
  // `roadBase` so a road mode borrows the lesson mode's arms, head and lean while
  // `g` above stays the ROAD gait — the legs get road strides, the upper body is
  // not written twice.
  const w = moveBody(roadBase(mode), span * tr + seed * 11 + lead, g);
  const far = clamp01(span / 40);
  const push = ease01(clamp01(1 - tr / 0.13)) * far;
  const land = Math.sin(Math.PI * clamp01((tr - 0.66) / 0.28)) * far;
  const moving: Stance = {
    ...w,
    tilt: w.tilt + push * 0.07,
    neck: w.neck - push * 0.05,
    bob: w.bob - push * 2.4 - land * 1.7,
  };
  // Same footfall-snapped settle as the rig's walk, from the same helpers, so the
  // twelve travel modes stop exactly as cleanly as the default one.
  const sf = settleFrac(span, g.S);
  const arrive = clamp01((tr - (1 - sf)) / sf);
  return settleStep(moving, settled, span * (1 - tr), arrive);
}

/** `travelStance` for a travel mode: walk there in `mode`, or blend poses in place. */
export function travelMode(
  x0: number, x1: number, holdPrev: Stance, holdNext: Stance, liveNext: Stance, tr: number,
  mode: number, seed = 0
): Stance {
  'worklet';
  if (Math.abs(x1 - x0) > 1) return strideMode(x0, x1, holdNext, tr, mode, seed);
  return mixStance(holdPrev, liveNext, tr);
}

// ── postures ─────────────────────────────────────────────────────────────────
// Settled configurations of the WHOLE body, the counterpart to the gesture
// library's 48 arm poses. There is no separate "sit" solver and there does not
// need to be: `bob` moves the pelvis, the feet are ground-relative, and the knee
// falls out of the existing leg IK. A low pelvis with the feet forward folds the
// leg on its own, which is all a sit is.
//
// Every posture is built on `stand(t)`, so breath and the slow weight drift come
// along for free and none of them ever freezes.

/** Set both fist targets on a base stance. */
function hands(base: Stance, lx: number, ly: number, rx: number, ry: number): Stance {
  'worklet';
  return { ...base, fistL: { x: lx, y: ly }, fistR: { x: rx, y: ry } };
}

/**
 * A settled whole-body posture.
 *
 * 0 crouch · 1 kneel on one knee · 2 kneel on both · 3 sit on the ground ·
 * 4 sit on an edge · 5 recline propped back · 6 lean back against something ·
 * 7 hands on knees, winded · 8 deep squat · 9 perch and think (chin in hand) ·
 * 10 sprawl · 11 up on toes reaching high · 12 wide braced stance ·
 * 13 crouch and inspect something on the ground · 14 kneel and write ·
 * 15 cross-legged on the ground · 16 balanced on one leg · 17 crouched small,
 * arms round the knees · 18 leaning on a surface at table height ·
 * 19 sitting on an edge, elbows on knees · 20 resting a hand on something at
 * shoulder height.
 *
 * Postures 3–5, 9–10 and 18–19 assume the scene has put something under the
 * figure, or
 * that the ground is the seat. Nothing here draws furniture.
 */
export function postureHold(code: number, t: number): Stance {
  'worklet';
  const s = stand(t);
  const g = life2(t, 1.25, 0.8, 0.6) * 1.1;      // the free hand never sits perfectly still

  // The feet in the deep poses are STAGGERED, never mirrored. Two 11-unit-thick
  // legs folded to the same angle overlap into a single black mass and the figure
  // loses its legs entirely; offsetting one forward keeps four readable segments.
  if (code === 0) {                              // crouch, balanced on the balls of the feet
    return {
      ...hands(s, 16, 4, 24 + g, -2), tilt: s.tilt - 0.10, neck: s.neck + 0.04,
      bob: s.bob - 12, footL: { x: -11, y: 0 }, footR: { x: 8, y: 0 },
    };
  }
  if (code === 1) {                              // one knee down, the other foot planted
    return {
      ...hands(s, -8, 8, 22 + g, -4), tilt: s.tilt - 0.10, neck: s.neck + 0.02,
      bob: s.bob - 17, footL: { x: -15, y: 0 }, footR: { x: 13, y: 0 },
    };
  }
  if (code === 2) {                              // both knees down, upright, hands on thighs
    return {
      ...hands(s, 8, 10, 14, 10), tilt: s.tilt, neck: s.neck,
      bob: s.bob - 19, footL: { x: -9, y: 0 }, footR: { x: -3, y: 0 },
    };
  }
  if (code === 3) {                              // on the ground, legs out, one arm propping
    return {
      ...hands(s, -16, 6, 20 + g, 4), tilt: 0.16, neck: -0.08,
      bob: seatBob(7) + s.bob, footL: { x: 31, y: 0 }, footR: { x: 35, y: 1 },
    };
  }
  if (code === 4) {                              // perched on an edge, feet down, hands beside
    return {
      ...hands(s, -6, 10, 2, 10), tilt: 0.04, neck: -0.02,
      bob: seatBob(21) + s.bob, footL: { x: 16, y: 0 }, footR: { x: 21, y: 0 },
    };
  }
  if (code === 5) {                              // reclined, weight back on one propping arm
    // A gentle lean, not a lie-down. At a torso angle near 1.15 the head swings so
    // far behind the pelvis that the figure leaves its own cell and reads as
    // roadkill; 0.62 is the angle that still says "settled back on the grass".
    return {
      ...hands(s, -32, 8, 6, 4), tilt: 0.62, neck: -0.45,
      bob: seatBob(8) + s.bob, footL: { x: 30, y: 0 }, footR: { x: 35, y: 1 },
    };
  }
  if (code === 6) {                              // leaning back on a wall the scene supplies
    return {
      ...hands(s, -4, 8, 5, 8), tilt: 0.18, neck: -0.02,
      bob: s.bob - 3, footL: { x: 12, y: 0 }, footR: { x: 17, y: 0 },
    };
  }
  if (code === 7) {                              // doubled over, hands on knees, out of breath
    return {
      ...hands(s, 6, 14, 14, 14), tilt: -0.44, neck: 0.26,
      bob: s.bob - 9, footL: { x: -9, y: 0 }, footR: { x: 9, y: 0 },
    };
  }
  if (code === 8) {                              // all the way down into a squat
    // THE BACK FOOT SITS AT −4, NOT −13. At −13 the pelvis is 13 above the ground
    // and the ankle 13 behind it, so the leg folds to 18 of its 37 units and the
    // solver bends the knee DOWN AND BACK — 4.9 units below the ground line, a
    // shin driven through the floor. A squat's knee goes up and forward.
    // Bringing the foot under the body fixes the fold without making the squat
    // shallower: the depth stays at −21 and the knee comes out 1.6 above the line.
    // The two knees still read apart — not by the 22 of stagger they had, but by
    // 12.7 units of HEIGHT (1.6 against 14.3), which separates them far better
    // than sideways distance ever did.
    return {
      ...hands(s, 18, 2, 25 + g, -2), tilt: s.tilt - 0.18, neck: s.neck + 0.02,
      bob: s.bob - 21, footL: { x: -4, y: 0 }, footR: { x: 9, y: 0 },
    };
  }
  if (code === 9) {                              // the thinker: elbow on knee, chin in hand
    return {
      ...hands(s, 17, 6, 11, -36), tilt: -0.26, neck: 0.14,
      bob: seatBob(20) + s.bob, footL: { x: 17, y: 0 }, footR: { x: 23, y: 0 },
    };
  }
  if (code === 10) {                             // sprawled, legs apart, leaning on one hand
    return {
      ...hands(s, -18, 8, 16, 6), tilt: 0.22, neck: -0.04,
      bob: seatBob(6) + s.bob, footL: { x: 22, y: 0 }, footR: { x: 34, y: 2 },
    };
  }
  if (code === 11) {                             // stretched up on the toes for something high
    // Hands OUT at |x| ≈ 26, not tucked in at 14 — at 14 they sit inside the head
    // disc and the reach turns into a lump on top of the skull.
    return {
      ...hands(s, -26, -50 + g, 26, -52 + g), tilt: s.tilt - 0.06, neck: -0.26,
      bob: s.bob + 3, footL: { x: -4, y: -2 }, footR: { x: 4, y: -2 },
    };
  }
  if (code === 12) {                             // planted wide, ready, arms out from the body
    return {
      ...hands(s, -26, -14, 26, -14), tilt: s.tilt - 0.06, neck: s.neck,
      bob: s.bob - 4, footL: { x: -13, y: 0 }, footR: { x: 13, y: 0 },
    };
  }
  if (code === 13) {                             // down on the haunches, peering at the floor
    return {
      ...hands(s, -8, 8, 26 + g, 4), tilt: -0.26, neck: 0.26,
      bob: s.bob - 12, footL: { x: -12, y: 0 }, footR: { x: 7, y: 0 },
    };
  }
  if (code === 14) {                             // kneeling to write on something low
    return {
      ...hands(s, -6, 8, 26 + g, -2), tilt: -0.14, neck: 0.12,
      bob: s.bob - 17, footL: { x: -15, y: 0 }, footR: { x: 13, y: 0 },
    };
  }
  // ── 15–20 ──────────────────────────────────────────────────────────────────
  // Six more settled configurations, chosen for what the existing fifteen could
  // not say: sitting on the floor to think, being off balance, being small,
  // working at a surface, listening from a bench, and being flat on your back.
  if (code === 15) {                             // cross-legged on the ground
    // The pelvis sits 6 above the floor and the feet come IN rather than out, so
    // the IK folds both legs into the crossed shape on its own. Staggered by four
    // units: two 11-thick legs folded identically overlap into one black mass.
    return {
      ...hands(s, -13, -4, 15 + g, -3), tilt: s.tilt + 0.04, neck: 0.10,
      bob: s.bob - 28, footL: { x: 20, y: 0 }, footR: { x: 15, y: 0 },
    };
  }
  if (code === 16) {                             // balanced on one leg, the other tucked
    // The lifted foot is the whole pose, and it has to be high enough to read as
    // deliberate — at 4 or 5 units it looks like a solver error. The arms go out
    // for balance, which also keeps them clear of the torso.
    const s2 = life2(t, 1.1, 0.71, 0.9) * 1.6;
    return {
      ...hands(s, -27 + s2, -22, 27 + s2, -25), tilt: s.tilt - 0.03, neck: -0.06,
      bob: s.bob - 1.0, footL: { x: -2, y: 0 }, footR: { x: 9, y: -15 },
    };
  }
  if (code === 17) {                             // crouched small, arms round the knees
    // Down as low as posture 8 and CLOSED, where the squat is open. The hands
    // reach past the shins rather than resting on the knees, which is what turns
    // a squat into somebody making themselves small.
    return {
      ...hands(s, 13, -6, 18 + g * 0.5, -4), tilt: -0.20, neck: 0.22,
      bob: s.bob - 22, footL: { x: 4, y: 0 }, footR: { x: 12, y: 0 },
    };
  }
  if (code === 18) {                             // leaning on a surface at table height
    // Both hands take weight at about y −18, which is roughly a table to a figure
    // this size; the scene draws the table. The feet go BACK, because a body
    // leaning on its hands has its weight in front of its ankles.
    return {
      ...hands(s, 26, -18, 30, -19), tilt: -0.30, neck: 0.20,
      bob: s.bob - 2.5, footL: { x: -14, y: 0 }, footR: { x: -6, y: 0 },
    };
  }
  if (code === 19) {                             // sitting on an edge, elbows on knees
    // Posture 4 sits upright with the hands beside the hips; this is the same
    // seat leaned forward with the forearms on the thighs — the listening pose,
    // and the one a person actually holds for a long conversation.
    return {
      ...hands(s, 20, -8, 25 + g * 0.6, -10), tilt: -0.34, neck: 0.24,
      bob: s.bob - 15, footL: { x: 10, y: 0 }, footR: { x: 17, y: 0 },
    };
  }
  if (code === 20) {                             // resting a hand on something shoulder-high
    // The pose that was going to be here was LYING DOWN, and it is not here
    // because a horizontal torso puts the head exactly where the hands have to
    // go. Lay the spine flat and the skull travels out to x ≈ −49 with the
    // shoulders at −26; every natural arm position — past the head, behind it, on
    // the chest, propped on the elbows — then measures 9 to 20 units from the head
    // centre against the 25 it needs, so the hand is DRAWN INSIDE THE SKULL and
    // both disappear. It is not a tuning problem: it is what profile drawing does
    // to a body whose head and hands are at the same height, and three separate
    // arrangements measured 9.4, 15.2 and 17.5. Naming it in FACE_OK would have
    // silenced the instrument rather than fixed the picture.
    //
    // So: an upright pose that adds something the other twenty cannot say —
    // weight parked against a surface the scene draws at shoulder height, one arm
    // taking it, the near leg loaded and the far one crossed over.
    return {
      ...hands(s, -7, 4, 30, -30), tilt: s.tilt - 0.02, neck: -0.04,
      bob: s.bob - 1.5, footL: { x: -3, y: 0 }, footR: { x: 6, y: 0 },
    };
  }
  return s;
}

/** A posture plus its living overlay: the settle as it is taken, and its own habit. */
export function postureLive(code: number, t: number, bt: number): Stance {
  'worklet';
  const s = postureHold(code, t);
  // Bodies arrive at a posture and sink into it; they do not simply be in it.
  const settle = Math.sin(Math.PI * clamp01(bt / 0.5));
  let db = -settle * 1.2, dn = 0, dx = 0, dxl = 0;
  if (code === 7) {                              // winded: heaving breath, head lifting for air
    db += Math.sin(bt * 3.4) * 1.7;
    dn = Math.sin(bt * 3.4 + 0.5) * -0.05;
  }
  if (code === 9) db = -settle * 0.3;            // the thinker barely moves; that is the point
  if (code === 13) dx = Math.sin(bt * 2.2) * Math.max(0, 1 - bt / 2.2) * 4;   // probing at it
  if (code === 14) {                             // writing strokes that trail off
    const w = Math.max(0, 1 - bt / 2.2);
    dx = Math.sin(bt * 11) * w * 5;
  }
  if (code === 11) dx = Math.sin(bt * 2.6) * Math.max(0, 1 - bt / 1.8) * 3;   // straining higher
  if (code === 12) { const p = Math.sin(bt * 1.9) * 1.6; dx = p; dxl = -p; }
  return {
    ...s,
    neck: s.neck + dn,
    bob: s.bob + db,
    fistL: { x: s.fistL.x + dxl, y: s.fistL.y },
    fistR: { x: s.fistR.x + dx, y: s.fistR.y },
  };
}

// ── actions ──────────────────────────────────────────────────────────────────
// One-shot things a body DOES, played over `u` from 0 to 1. Most begin and end at
// the neutral stand, exactly like the boxing moves begin and end at the guard, so
// consecutive actions meet cleanly and never need a cross-fade. The ones that end
// somewhere else (sitting down, falling) say so, and the scene holds the matching
// posture afterwards.
//
// `t` still drives the idle underneath, so even mid-action the figure is breathing.

/** Rise, hold, fall — but reaching its peak early, for a strike or a grab. */
function snap(u: number, peak: number) {
  'worklet';
  if (u <= peak) return easeOutCubic(u / peak);
  return 1 - ease01((u - peak) / (1 - peak));
}

/**
 * A one-shot action.
 *
 * 1 sit down · 2 stand up · 3 jump · 4 pick something up · 5 put something down ·
 * 6 throw · 7 push something heavy · 8 drag something heavy · 9 knock ·
 * 10 stumble and recover · 11 fall over backwards · 12 get up off the ground ·
 * 13 stretch · 14 duck under something · 15 step over something · 16 clap ·
 * 17 facepalm · 18 look around · 19 startle backwards · 20 lean in and inspect ·
 * 21 hand something over · 22 take something · 23 nod yes · 24 wave it away ·
 * 25 beckon someone in · 26 shiver · 27 wobble for balance · 28 dust off hands.
 *
 * 29–40 are the loose-arm and dance set and 41–58 the second wave of one-shots.
 * Two shelves were then added together:
 *
 *   59–78  THE LIVING HOLDS. They read `t`, ignore `u`, and run for ever:
 *          59 weight shift · 60 listening · 61 chin in hand · 62 arms folded ·
 *          63 hands behind the back · 64 hands on the hips · 65 gazing up ·
 *          66 fidgeting · 67 impatient · 68 talking with the hands ·
 *          69 counting the points · 70 hands clasped · 71 deep breathing ·
 *          72 stepping in place · 73 up on the toes · 74 slouched on one hip ·
 *          75 at attention · 76 warming the hands · 77 weighing it slowly ·
 *          78 leaning in, listening close.
 *
 *   79–96  ONE-SHOTS: 79 shrug · 80 the idea · 81 weigh it up · 82 hesitate ·
 *          83 change of mind · 84 make the point · 85 offer it · 86 split it in
 *          two · 87 show the size · 88 flinch · 89 cringe · 90 refuse ·
 *          91 celebrate · 92 kneel down · 93 rise from one knee · 94 turn on
 *          the spot · 95 check the time · 96 rub the neck.
 *
 * 1 ends seated on an edge (posture 4); 11 ends sprawled (posture 10); 12 starts
 * there; 92 ends kneeling (posture 1) and 93 starts there. Everything else
 * returns to standing — which is why a lesson reaches a one-shot through the
 * 300 band (played once as the beat opens) and not the 100 band (held).
 */
export function actStance(code: number, t: number, u: number): Stance {
  'worklet';
  const s = stand(t);
  const p = clamp01(u);

  if (code === 1) {                              // SIT DOWN — reach back, lower under control
    const e = ease01(p);
    const m = mixStance(s, postureHold(4, t), e);
    const r = Math.sin(Math.PI * e);
    return {
      ...m, tilt: m.tilt - r * 0.10,
      fistL: { x: m.fistL.x - r * 12, y: m.fistL.y + r * 4 },
    };
  }
  if (code === 2) {                              // STAND UP — lean over the feet, then push
    const e = ease01(p);
    const m = mixStance(postureHold(4, t), s, e);
    const r = Math.sin(Math.PI * e);
    return { ...m, tilt: m.tilt - r * 0.22, bob: m.bob - r * 1.5, neck: m.neck + r * 0.08 };
  }
  if (code === 3) {                              // JUMP — load, fly, absorb
    const air = clamp01((p - 0.24) / 0.52);
    const h = Math.sin(Math.PI * air);
    // THE CROUCH HAS TO UNLOAD, NOT VANISH. This read `p < 0.24 ? ease01(p/0.24) : 0`,
    // so at p = 0.24 the load went from a full 1 to 0 between one frame and the
    // next while `h` was still 0 — and since bob carries −load × 13, the pelvis
    // teleported 13 units upward at the exact moment of take-off. (A snap and a
    // teleport look alike at one frame rate; sampling 16× finer told them apart —
    // this held 13.9 → 13.0, where the startle beside it collapsed 12.3 → 0.2.)
    // Releasing it over the launch window is also what a jump physically is: the
    // legs extend out of the crouch, and that extension IS the push.
    const load = p < 0.24
      ? ease01(p / 0.24)
      : 1 - ease01(clamp01((p - 0.24) / 0.12));
    const absorb = p > 0.76 ? Math.sin(Math.PI * ease01((p - 0.76) / 0.24)) : 0;
    return {
      ...s,
      bob: s.bob - load * 13 - absorb * 11 + h * 17,
      tilt: s.tilt - load * 0.10 + h * 0.04 - absorb * 0.08,
      neck: s.neck - h * 0.10,
      // Feet lift further than the pelvis rises, so the knees tuck instead of the
      // shins stretching to reach a ground that has moved out of range.
      footL: { x: -5, y: -h * 22 }, footR: { x: 5, y: -h * 22 },
      // And the arms go up and OUT — thrown straight overhead they land inside the
      // head disc and the whole thing reads as one lump.
      fistL: { x: -10 - h * 17, y: 8 - load * 4 - h * 52 },
      fistR: { x: 10 + h * 17, y: 8 - load * 4 - h * 54 },
    };
  }
  if (code === 4 || code === 5) {                // PICK UP / PUT DOWN — the same move, mirrored
    const q = code === 4 ? p : 1 - p;
    const down = q < 0.40 ? ease01(q / 0.40) : q < 0.56 ? 1 : 1 - ease01((q - 0.56) / 0.44);
    const held = code === 4 ? clamp01((q - 0.50) / 0.30) : 1 - clamp01((q - 0.50) / 0.30);
    return {
      ...s,
      bob: s.bob - down * 15, tilt: s.tilt - down * 0.30, neck: s.neck + down * 0.26,
      footL: { x: -6, y: 0 }, footR: { x: 7, y: 0 },
      fistL: { x: -5, y: 6 },
      fistR: { x: 16 + down * 6, y: lerp(6, 18, down) - held * 9 },
    };
  }
  if (code === 6) {                              // THROW — wind back, whip through, follow on
    let arm: number;
    if (p < 0.34) arm = -ease01(p / 0.34);
    else if (p < 0.60) arm = lerp(-1, 1, easeOutCubic((p - 0.34) / 0.26));
    else arm = 1 - ease01((p - 0.60) / 0.40) * 0.75;
    const fx = arm < 0 ? lerp(-12, 14, arm + 1) : lerp(14, 33, arm);
    const fy = arm < 0 ? lerp(-36, -26, arm + 1) : lerp(-26, -20, arm);
    const fw = clamp01(arm);
    const wind = clamp01(-arm);
    return {
      ...s,
      tilt: s.tilt + wind * 0.16 - fw * 0.28, neck: s.neck - fw * 0.06,
      footL: { x: -12 - wind * 4, y: 0 }, footR: { x: 12 + fw * 6, y: 0 },
      fistR: { x: fx, y: fy },
      fistL: { x: lerp(-5, -14, fw), y: lerp(6, 2, fw) },
      adv: fw * 6,
    };
  }
  if (code === 7) {                              // PUSH — everything behind one direction
    const e = ease01(clamp01(p / 0.30));
    const strain = Math.sin(t * 7.3) * 0.6 + Math.sin(t * 4.1) * 0.4;
    return {
      ...s,
      tilt: s.tilt - e * 0.36, neck: s.neck + e * 0.06, bob: s.bob - e * 3,
      footL: { x: -20 - e * 6, y: 0 }, footR: { x: 10 + e * 4, y: 0 },
      fistL: { x: lerp(-5, 26, e) + strain * 0.8, y: lerp(6, -18, e) },
      fistR: { x: lerp(5, 31, e) + strain * 0.8, y: lerp(6, -22, e) },
      adv: e * 4,
    };
  }
  if (code === 8) {                              // DRAG — weight thrown backwards, hauling
    const e = ease01(clamp01(p / 0.30));
    const haul = Math.sin(p * Math.PI * 3) * Math.max(0, 1 - p) * 3;
    return {
      ...s,
      tilt: s.tilt + e * 0.30, neck: s.neck + e * 0.04, bob: s.bob - e * 4,
      footL: { x: -6 - e * 4, y: 0 }, footR: { x: 14 + e * 8, y: 0 },
      fistL: { x: lerp(-5, 22, e) + haul, y: lerp(6, -6, e) },
      fistR: { x: lerp(5, 28, e) + haul, y: lerp(6, -10, e) },
      adv: -e * 3,
    };
  }
  if (code === 9) {                              // KNOCK — up, three raps, down
    const up = ease01(clamp01(p / 0.22));
    const back = clamp01((p - 0.80) / 0.20);
    const raps = p > 0.22 && p < 0.80 ? Math.max(0, Math.sin((p - 0.22) / 0.58 * Math.PI * 3)) : 0;
    return {
      ...s, tilt: s.tilt - up * 0.05, neck: s.neck - up * 0.04,
      fistR: { x: lerp(5, 26, up) + raps * 5 - back * 10, y: lerp(6, -32, up) },
    };
  }
  if (code === 10) {                             // STUMBLE — a lurch, then a catch
    const lurch = Math.sin(Math.PI * clamp01(p / 0.34));
    const settle = Math.sin(Math.PI * ease01(clamp01((p - 0.34) / 0.5)));
    return {
      ...s,
      tilt: s.tilt - lurch * 0.34 + settle * 0.10, neck: s.neck + lurch * 0.16,
      bob: s.bob - lurch * 6,
      footL: { x: -6 - lurch * 2, y: -lurch * 8 },
      footR: { x: 6 + lurch * 22, y: -lurch * 3 },
      fistL: { x: -18 - lurch * 10, y: 6 - lurch * 26 },
      fistR: { x: 6 + lurch * 22, y: 6 - lurch * 30 },
    };
  }
  if (code === 11 || code === 12) {              // FALL OVER / GET UP — one move, either way
    const e = code === 11 ? ease01(p) : 1 - ease01(p);
    const m = mixStance(s, postureHold(10, t), e);
    const flail = Math.sin(Math.PI * clamp01((code === 11 ? p : 1 - p) / 0.55));
    return {
      ...m, tilt: m.tilt + flail * 0.20,
      fistL: { x: m.fistL.x - flail * 10, y: m.fistL.y - flail * 20 },
      fistR: { x: m.fistR.x + flail * 6, y: m.fistR.y - flail * 24 },
    };
  }
  if (code === 13) {                             // STRETCH — open the chest, rise on the toes
    const e = Math.sin(Math.PI * ease01(p));
    return {
      ...s,
      tilt: s.tilt + e * 0.14, neck: s.neck - e * 0.22, bob: s.bob + e * 2.5,
      footL: { x: -5, y: -e * 2 }, footR: { x: 5, y: -e * 2 },
      fistL: { x: -18 - e * 8, y: 6 - e * 52 },
      fistR: { x: 18 + e * 8, y: 6 - e * 54 },
    };
  }
  if (code === 14) {                             // DUCK — under something, hands up
    const e = holdEnv(p);
    return {
      ...s, bob: s.bob - e * 17, tilt: s.tilt - e * 0.22, neck: s.neck + e * 0.10,
      footL: { x: -8, y: 0 }, footR: { x: 9, y: 0 },
      fistL: { x: -10 - e * 12, y: 6 - e * 44 },
      fistR: { x: 10 + e * 12, y: 6 - e * 46 },
    };
  }
  if (code === 15) {                             // STEP OVER — one leg high and across
    const a = clamp01(p / 0.55);
    const lift = Math.sin(Math.PI * a);
    const fwd = ease01(a);
    const shift = clamp01((p - 0.5) / 0.5);
    return {
      ...s,
      bob: s.bob - lift * 1.5, tilt: s.tilt - lift * 0.06, neck: s.neck + lift * 0.06,
      footL: { x: -8 + shift * 14, y: 0 },
      footR: { x: -4 + fwd * 20, y: -lift * 20 },
      fistL: { x: -6 - lift * 8, y: 6 }, fistR: { x: 6 + lift * 10, y: 4 },
    };
  }
  if (code === 16) {                             // CLAP
    const up = ease01(clamp01(p / 0.18));
    const beat = Math.abs(Math.sin(p * Math.PI * 5));
    const open = 1 - beat;
    return {
      ...s, tilt: s.tilt - up * 0.04, bob: s.bob + up * 0.8 + beat * 0.6,
      fistL: { x: lerp(-5, 13 - open * 9, up), y: lerp(6, -22, up) },
      fistR: { x: lerp(5, 17 + open * 9, up), y: lerp(6, -22, up) },
    };
  }
  if (code === 17) {                             // FACEPALM — hand up, then the shoulders go
    const e = ease01(clamp01(p / 0.35));
    const sag = ease01(clamp01((p - 0.30) / 0.40));
    return {
      ...s, neck: s.neck + e * 0.10 + sag * 0.16, tilt: s.tilt + sag * 0.06,
      bob: s.bob - sag * 2.5,
      fistL: { x: -5, y: 6 },
      fistR: { x: lerp(5, 7, e), y: lerp(6, -50, e) },
    };
  }
  if (code === 18) {                             // LOOK AROUND — a hand up, eyes sweeping
    const up = ease01(clamp01(p / 0.22));
    const sweep = Math.sin(p * Math.PI * 2);
    return {
      ...s, neck: s.neck - 0.10 + sweep * 0.16, tilt: s.tilt + sweep * 0.05,
      footL: { x: -5 - sweep * 1.5, y: 0 }, footR: { x: 5 - sweep * 1.5, y: 0 },
      fistL: { x: -6, y: 6 },
      fistR: { x: lerp(5, 22, up), y: lerp(6, -46, up) },
    };
  }
  if (code === 19) {                             // STARTLE — a sharp recoil and a step back
    const hit = snap(p, 0.18);
    return {
      ...s,
      tilt: s.tilt + hit * 0.30, neck: s.neck + hit * 0.14, bob: s.bob - hit * 2,
      footL: { x: -6 - hit * 10, y: 0 }, footR: { x: 6 - hit * 4, y: -hit * 4 },
      fistL: { x: -20 - hit * 6, y: 6 - hit * 40 },
      fistR: { x: 12 + hit * 8, y: 6 - hit * 36 },
      adv: -hit * 7,
    };
  }
  if (code === 20) {                             // LEAN IN — a held, curious inspection
    const e = ease01(clamp01(p / 0.5));
    return {
      ...s, tilt: s.tilt - e * 0.26 + Math.sin(t * 1.1) * 0.02, neck: s.neck - e * 0.06,
      footL: { x: -8, y: 0 }, footR: { x: 10 + e * 5, y: 0 },
      fistL: { x: -12 - e * 4, y: 6 },
      fistR: { x: lerp(5, 22, e), y: lerp(6, -6, e) },
    };
  }
  if (code === 21) {                             // GIVE — out, offered, withdrawn
    const out = p < 0.55 ? ease01(p / 0.55) : 1 - ease01((p - 0.55) / 0.45) * 0.55;
    return {
      ...s, tilt: s.tilt - out * 0.10, neck: s.neck - out * 0.04,
      fistL: { x: -5, y: 6 },
      fistR: { x: lerp(5, 32, out), y: lerp(6, -18, out) },
    };
  }
  if (code === 22) {                             // TAKE — reach out, then draw it back in
    const e = ease01(clamp01(p / 0.40));
    const d = ease01(clamp01((p - 0.45) / 0.45));
    return {
      ...s, tilt: s.tilt - e * 0.06, neck: s.neck + d * 0.06,
      fistL: { x: lerp(-5, 22, e) - d * 12, y: lerp(6, -10, e) - d * 12 },
      fistR: { x: lerp(5, 28, e) - d * 12, y: lerp(6, -14, e) - d * 12 },
    };
  }
  if (code === 23) {                             // NOD — agreement, felt through the body
    const n = Math.sin(p * Math.PI * 4) * Math.max(0, 1 - p * 0.6);
    return {
      ...s, neck: s.neck + n * 0.16, bob: s.bob - Math.abs(n) * 0.8, tilt: s.tilt - n * 0.03,
    };
  }
  if (code === 24) {                             // WAVE IT AWAY — a profile head-shake reads
    const up = ease01(clamp01(p / 0.20));        // as nothing, so the hands say it instead
    const sw = Math.sin(p * Math.PI * 3) * Math.max(0, 1 - p * 0.5);
    return {
      ...s, tilt: s.tilt + up * 0.08, neck: s.neck + up * 0.04,
      fistL: { x: lerp(-5, 10 + sw * 16, up), y: lerp(6, -22, up) },
      fistR: { x: lerp(5, 20 - sw * 16, up), y: lerp(6, -26, up) },
    };
  }
  if (code === 25) {                             // BECKON — out, then curling in, twice
    const up = ease01(clamp01(p / 0.22));
    const curl = Math.max(0, Math.sin(p * Math.PI * 4));
    return {
      ...s, neck: s.neck - up * 0.04,
      fistL: { x: -5, y: 6 },
      fistR: { x: lerp(5, 30 - curl * 13, up), y: lerp(6, -22, up) },
    };
  }
  if (code === 26) {                             // SHIVER — arms wrapped in, everything tight
    const e = ease01(clamp01(p / 0.30));
    const tr = Math.sin(t * 23) * 1.0 + Math.sin(t * 31 + 1.1) * 0.6;
    return {
      ...s, tilt: s.tilt + e * 0.10, neck: s.neck + e * 0.12,
      bob: s.bob - e * 2 + tr * 0.25,
      footL: { x: -4, y: 0 }, footR: { x: 4, y: 0 },
      fistL: { x: lerp(-5, 6, e) + tr * 0.5, y: lerp(6, -18, e) },
      fistR: { x: lerp(5, 14, e) + tr * 0.5, y: lerp(6, -22, e) },
    };
  }
  if (code === 27) {                             // WOBBLE — arms out, the correction decaying
    const w = Math.sin(p * Math.PI * 4) * Math.max(0, 1 - p * 0.7);
    return {
      ...s, tilt: s.tilt + w * 0.12, bob: s.bob - 1,
      footL: { x: -3, y: 0 }, footR: { x: 3, y: -Math.max(0, w) * 5 },
      fistL: { x: -26 - w * 6, y: -18 }, fistR: { x: 26 - w * 6, y: -18 },
    };
  }
  if (code === 28) {                             // DUST OFF HANDS — job done
    const up = ease01(clamp01(p / 0.22));
    const rub = Math.sin(p * Math.PI * 6) * (1 - ease01(clamp01((p - 0.6) / 0.4)));
    return {
      ...s, tilt: s.tilt - up * 0.05, neck: s.neck + up * 0.06,
      fistL: { x: lerp(-5, 13 + rub * 5, up), y: lerp(6, -14, up) },
      fistR: { x: lerp(5, 18 - rub * 5, up), y: lerp(6, -16, up) },
    };
  }

  // ── 29–40: LOOSE ARMS, AND DANCING ─────────────────────────────────────────
  //
  // Everything above is a gesture with a message — a shrug, a point, a facepalm.
  // Nothing above is the figure simply MOVING because moving is pleasant, and
  // that absence is most of why watching him gets repetitive: every motion he
  // has means something, so he only ever moves when there is something to say.
  //
  // THE THREE THINGS THAT MAKE THESE READ AS NATURAL, all learned from the
  // gestures above going wrong:
  //
  // 1. THE ARMS ARE NEVER IN PHASE WITH EACH OTHER. Two limbs on one sine are a
  //    windscreen wiper. Each hand here runs its own frequency, and the pair are
  //    deliberately irrational multiples (1.0 / 1.37, 2.0 / 2.9) so the loop
  //    never visibly repeats however long anyone stares.
  // 2. THE HEAD IS LATE. A head that hits the beat with the hips reads as a
  //    puppet on one string. Everything here delays the neck by about a fifth of
  //    a cycle, which is the whole of what animators call follow-through.
  // 3. WEIGHT GOES SOMEWHERE. A dance with a still pelvis is arm-waving. Each of
  //    these shifts `bob` and `tilt` together, and the feet take the load — a
  //    step is a foot moving BECAUSE the weight left it, never the reverse.
  //
  // These run on `t` (the free clock) rather than on `u`, because unlike a shrug
  // they have no beginning or end — a scene holds them for as long as it likes.
  // `u` is still honoured as a fade-in, so one can start without snapping on.

  if (code === 29) {                             // ARMS LOOSE — hanging, swaying, alive
    // The quietest thing in the library and the one most often wanted: standing,
    // doing nothing, but not FROZEN. Hands stay near arm's length (B11b) and
    // drift a few units; nothing here is a gesture.
    const a = life2(t, 0.9, 1.37, 0.7) * 5;
    const b = life2(t, 1.05, 1.6, 2.2) * 5;
    return {
      ...s, tilt: s.tilt + a * 0.004, neck: s.neck + b * 0.006,
      fistL: { x: -4 + a, y: 7 + b * 0.4 },
      fistR: { x: 5 + b, y: 7 + a * 0.4 },
    };
  }
  if (code === 30) {                             // ARMS FLOWING — slow wide arcs, like water
    const a = Math.sin(t * 0.8), b = Math.sin(t * 1.17 + 1.1);
    return {
      ...s, tilt: s.tilt + a * 0.05, neck: s.neck - b * 0.06, bob: s.bob - Math.abs(a) * 1.2,
      // Out to 26 at the widest so the hands stay clear of the head disc.
      fistL: { x: -6 + a * 20, y: -6 + b * 14 },
      fistR: { x: 8 + b * 20, y: -4 - a * 14 },
    };
  }
  if (code === 31) {                             // SWAY — weight side to side, the root of dancing
    const sw = Math.sin(t * 2.0);
    return {
      ...s, tilt: s.tilt + sw * 0.06, neck: s.neck - Math.sin(t * 2.0 - 1.2) * 0.05,
      bob: s.bob - Math.abs(sw) * 1.4,
      // The feet stay planted and the WEIGHT moves — the pelvis leans over each
      // one in turn. Sliding the feet instead is the single most common way a
      // sway comes out looking like skating.
      footL: { x: s.footL.x - 1, y: 0 }, footR: { x: s.footR.x + 1, y: 0 },
      fistL: { x: -7 + sw * 9, y: 5 - Math.abs(sw) * 3 },
      fistR: { x: 8 + sw * 9, y: 5 - Math.abs(sw) * 3 },
    };
  }
  if (code === 32) {                             // TWO-STEP — a sway that steps, alternating feet
    const ph2 = t * 2.4;
    const sw = Math.sin(ph2);
    // Only the UNWEIGHTED foot lifts, and only while the weight is off it.
    const liftL = Math.max(0, -sw) ** 1.5 * 5;
    const liftR = Math.max(0, sw) ** 1.5 * 5;
    return {
      ...s, tilt: s.tilt + sw * 0.05, neck: s.neck - Math.sin(ph2 - 1.0) * 0.06,
      bob: s.bob - Math.abs(sw) * 1.8,
      footL: { x: -6 + sw * 3, y: -liftL },
      footR: { x: 7 + sw * 3, y: -liftR },
      fistL: { x: -9 + sw * 11, y: -2 - Math.abs(sw) * 5 },
      fistR: { x: 10 + sw * 11, y: -2 - Math.abs(sw) * 5 },
    };
  }
  if (code === 33) {                             // GROOVE — shoulders and knees on the beat
    const beat = Math.sin(t * 3.2);
    const drop = Math.max(0, -beat) * 2.6;       // knees give on the downbeat
    return {
      ...s, tilt: s.tilt - beat * 0.04, neck: s.neck - Math.sin(t * 3.2 - 0.9) * 0.07,
      bob: s.bob + drop,
      footL: { x: -7, y: 0 }, footR: { x: 8, y: 0 },
      fistL: { x: -12 - beat * 5, y: -8 + beat * 6 },
      fistR: { x: 13 - beat * 5, y: -8 - beat * 6 },
    };
  }
  if (code === 34) {                             // HANDS UP — the arms-overhead celebration dance
    // Overhead means OUT, not up: |x| ≈ 26, per the head-collision rule in the
    // header. Straight up puts both fists inside the skull and the figure loses
    // its hands and its head shape at once.
    // BOTH HANDS GO THE SAME WAY. The first version put one at x −27 and the
    // other at +28 to keep them clear of the head, and on the contact sheet that
    // is not two raised arms — it is one arm forward and one arm backwards at ear
    // height, which reads as antennae. THIS IS A SIDE VIEW: x is forward and back,
    // not left and right, so "overhead" can only be drawn as forward-and-up. The
    // two hands are offset from each other by a few units so the near arm reads in
    // front of the far one rather than the pair fusing into one limb.
    const a = Math.sin(t * 2.6), b = Math.sin(t * 2.6 + 1.9);
    return {
      ...s, tilt: s.tilt + a * 0.05, neck: s.neck - 0.16,
      bob: s.bob - Math.abs(a) * 1.6,
      fistL: { x: 21 + a * 5, y: -36 + b * 7 },
      fistR: { x: 29 + b * 5, y: -40 + a * 7 },
    };
  }
  if (code === 35) {                             // THE WAVE — a ripple travelling down one arm
    // The elbow leads and the hand follows a beat later. That lag IS the wave;
    // moving both together is just an arm going up and down.
    const ph2 = t * 2.2;
    return {
      ...s, tilt: s.tilt + Math.sin(ph2) * 0.03, neck: s.neck - 0.05,
      fistL: { x: -6, y: 7 },
      fistR: { x: 20 + Math.sin(ph2) * 8, y: -14 + Math.sin(ph2 - 0.9) * 13 },
    };
  }
  if (code === 36) {                             // SPIN — a turn on the spot, arms trailing out
    // A real turn cannot be drawn side-on, so this is the readable version: the
    // body compresses, the arms fly wide with the momentum and settle. Trailing
    // arms are what say "turning" without a third dimension.
    const e = ease01(p);
    const r = Math.sin(Math.PI * e);
    return {
      ...s, tilt: s.tilt + r * 0.12, neck: s.neck - r * 0.10, bob: s.bob - r * 2.0,
      footL: { x: -6 + r * 4, y: -r * 3 }, footR: { x: 7 - r * 4, y: 0 },
      fistL: { x: -10 - r * 16, y: 4 - r * 16 },
      fistR: { x: 9 + r * 18, y: 4 - r * 14 },
    };
  }
  if (code === 37) {                             // SHIMMY — fast small shoulder shakes
    const q = Math.sin(t * 7.0);
    return {
      ...s, tilt: s.tilt + q * 0.035, neck: s.neck + Math.sin(t * 7.0 - 0.7) * 0.03,
      footL: { x: -7, y: 0 }, footR: { x: 8, y: 0 },
      fistL: { x: -16 + q * 3, y: -6 },
      fistR: { x: 17 + q * 3, y: -6 },
    };
  }
  if (code === 38) {                             // HEAD NOD — listening to something with a pulse
    const beat = Math.sin(t * 2.8);
    return {
      ...s, neck: s.neck + 0.10 + beat * 0.10, tilt: s.tilt + beat * 0.02,
      bob: s.bob - Math.max(0, beat) * 0.8,
      fistL: { x: -5 + beat * 2, y: 7 }, fistR: { x: 6 - beat * 2, y: 7 },
    };
  }
  if (code === 39) {                             // STRETCH — a long slow reach, then release
    // One arc up and one back down over the whole of u. The bob rises WITH the
    // arms, because a stretch that does not lift the ribcage is a wave.
    const r = Math.sin(Math.PI * ease01(p));
    return {
      ...s, tilt: s.tilt - r * 0.06, neck: s.neck - r * 0.20, bob: s.bob - r * 2.2,
      footL: { x: -6, y: 0 }, footR: { x: 7, y: 0 },
      // Forward-and-up, both of them — same reason as act 34. One hand thrown
      // backwards is not a stretch, it is a figure hailing a bus.
      // 24 and 30 out, not 20 and 28: at 20 the near hand measured 24.4 from the
      // head's centre and was drawn inside it. See checkHead in check-moves.
      fistL: { x: lerp(-5, 24, r), y: lerp(7, -32, r) },
      fistR: { x: lerp(6, 30, r), y: lerp(7, -37, r) },
    };
  }
  // ── 41–48: more of the same kind — motion that is not an argument ──────────
  if (code === 41) {                             // BOB AND WEAVE — light on the feet, ducking
    const a = t * 2.1;
    const side = Math.sin(a), dip = Math.max(0, -Math.cos(a));
    return {
      ...s, tilt: s.tilt + side * 0.06, neck: s.neck + dip * 0.10,
      bob: s.bob - dip * 3.4,
      footL: { x: -8, y: 0 }, footR: { x: 9, y: 0 },
      fistL: { x: 12 + side * 4, y: -16 - dip * 3 },
      fistR: { x: 19 - side * 4, y: -18 - dip * 3 },
    };
  }
  if (code === 42) {                             // HEEL TAP — one foot keeping time, hands easy
    // The tapping foot NEVER carries weight, so the pelvis does not move with it.
    // A body that bobs in time with a tapping toe reads as the whole figure
    // hopping.
    const tap = Math.max(0, Math.sin(t * 4.4)) ** 2 * 4;
    return {
      ...s, neck: s.neck + Math.sin(t * 2.2) * 0.04,
      footL: { x: -6, y: 0 }, footR: { x: 9, y: -tap },
      fistL: { x: -5 + Math.sin(t * 1.3) * 2, y: 7 },
      fistR: { x: 6 + Math.sin(t * 1.7 + 1) * 2, y: 7 },
    };
  }
  if (code === 43) {                             // SLOW SPIRAL — one hand drawing a wide circle
    const a = t * 1.1;
    return {
      ...s, tilt: s.tilt + Math.cos(a) * 0.04, neck: s.neck - 0.06,
      fistL: { x: -6, y: 6 },
      fistR: { x: 20 + Math.cos(a) * 9, y: -14 + Math.sin(a) * 12 },
    };
  }
  if (code === 44) {                             // REACH AND SETTLE — a hand goes out and comes home
    const r = Math.sin(Math.PI * ease01(p));
    return {
      ...s, tilt: s.tilt - r * 0.05, neck: s.neck - r * 0.08,
      fistL: { x: -5, y: 6 },
      fistR: { x: lerp(6, 29, r), y: lerp(7, -16, r) },
    };
  }
  if (code === 45) {                             // ROCK ON HEELS — back on the heels, then forward
    const a = Math.sin(t * 1.5);
    return {
      ...s, tilt: s.tilt + a * 0.10, bob: s.bob - Math.abs(a) * 0.8,
      neck: s.neck - a * 0.05,
      footL: { x: -6, y: 0 }, footR: { x: 7, y: 0 },
      fistL: { x: -7 - a * 3, y: 7 }, fistR: { x: 8 - a * 3, y: 7 },
    };
  }
  if (code === 46) {                             // LOOSE SHAKE-OUT — shaking the arms loose
    // Fast, small, and DAMPED: the shake dies away over u, which is what makes it
    // a shake-out rather than a tremor.
    const die = 1 - ease01(p);
    return {
      ...s, neck: s.neck + Math.sin(t * 9) * 0.02 * die,
      fistL: { x: -6 + Math.sin(t * 11) * 5 * die, y: 8 + Math.sin(t * 13) * 3 * die },
      fistR: { x: 7 + Math.sin(t * 12 + 2) * 5 * die, y: 8 + Math.sin(t * 10 + 1) * 3 * die },
    };
  }
  if (code === 47) {                             // SIDE-STEP TOUCH — two steps out, two steps back
    const a = t * 1.6;
    const out = Math.sin(a);
    const lift = Math.max(0, Math.cos(a)) ** 2 * 4;
    return {
      ...s, tilt: s.tilt + out * 0.04, neck: s.neck - Math.sin(a - 0.8) * 0.05,
      bob: s.bob - Math.abs(out) * 1.2,
      footL: { x: -7 + out * 5, y: -lift * (out < 0 ? 1 : 0) },
      footR: { x: 8 + out * 5, y: -lift * (out > 0 ? 1 : 0) },
      fistL: { x: -10 + out * 8, y: 2 }, fistR: { x: 11 + out * 8, y: 2 },
    };
  }
  if (code === 48) {                             // BREATHE DEEP — one slow lift and release
    const r = Math.sin(Math.PI * ease01(p));
    return {
      ...s, tilt: s.tilt - r * 0.04, neck: s.neck - r * 0.12, bob: s.bob + r * 1.6,
      fistL: { x: -6 - r * 3, y: 7 - r * 3 }, fistR: { x: 7 + r * 3, y: 7 - r * 3 },
    };
  }
  // ── 49–58: the ordinary things a person does while nothing happens ─────────
  if (code === 49) {                             // SCRATCH THE HEAD — the thinking one
    // The hand IS meant to reach the head here, so this is a named exemption in
    // check-moves rather than a violation. It goes to the BACK of the skull, out
    // at 26, not through the face.
    const up = ease01(clamp01(p / 0.30));
    const rub = Math.sin(p * Math.PI * 7) * (1 - ease01(clamp01((p - 0.62) / 0.38)));
    const down = ease01(clamp01((p - 0.70) / 0.30));
    return {
      ...s, neck: s.neck + up * 0.10 - down * 0.06, tilt: s.tilt + up * 0.03,
      fistL: { x: -5, y: 6 },
      fistR: { x: lerp(5, -14 + rub * 3, up) + down * 18, y: lerp(6, -40, up) + down * 44 },
    };
  }
  if (code === 50) {                             // CHECK OVER THE SHOULDER — a quick look back
    const turn = Math.sin(Math.PI * ease01(p));
    return {
      ...s, neck: s.neck + turn * 0.30, tilt: s.tilt + turn * 0.10,
      footL: { x: -6, y: 0 }, footR: { x: 7 - turn * 3, y: 0 },
      fistL: { x: -6 - turn * 6, y: 7 }, fistR: { x: 6 - turn * 8, y: 7 },
    };
  }
  if (code === 51) {                             // YAWN — a long one, with the stretch in it
    const r = Math.sin(Math.PI * ease01(p));
    return {
      ...s, neck: s.neck - r * 0.24, tilt: s.tilt - r * 0.05, bob: s.bob + r * 1.4,
      fistL: { x: lerp(-5, 22, r), y: lerp(6, -30, r) },
      fistR: { x: lerp(6, 29, r), y: lerp(6, -34, r) },
    };
  }
  if (code === 52) {                             // CLAP — hands meet in front, three times
    const up = ease01(clamp01(p / 0.20));
    const away = ease01(clamp01((p - 0.82) / 0.18));
    // Zero at the start of each clap as well as the end — the lesson prop 11
    // taught: a pulse that begins at its peak is a cut, not a strike.
    const k = clamp01((p - 0.18) / 0.62) * 3;
    const kk = k % 1;
    const open = k > 0 && k < 3 ? (kk < 0.3 ? 1 - kk / 0.3 : (kk - 0.3) / 0.7) : 1;
    return {
      ...s, neck: s.neck - up * 0.06, tilt: s.tilt - up * 0.04,
      fistL: { x: lerp(-5, 15 - open * 7, up) - away * 10, y: lerp(6, -14, up) + away * 20 },
      fistR: { x: lerp(5, 18 + open * 7, up) - away * 12, y: lerp(6, -14, up) + away * 20 },
    };
  }
  if (code === 53) {                             // BOW — from the hips, hold, and rise
    const down = ease01(clamp01(p / 0.34));
    const hold = clamp01((p - 0.30) / 0.30);
    const up = ease01(clamp01((p - 0.60) / 0.40));
    const d = down * (1 - up);
    return {
      ...s, tilt: s.tilt - d * 0.52, neck: s.neck + d * 0.30,
      bob: s.bob - d * 2.0 - hold * 0,
      footL: { x: -6, y: 0 }, footR: { x: 7, y: 0 },
      fistL: { x: lerp(-5, 4, d), y: lerp(6, 20, d) },
      fistR: { x: lerp(6, 14, d), y: lerp(6, 22, d) },
    };
  }
  if (code === 54) {                             // SHIVER — cold: fast, small, arms wrapped in
    const q = Math.sin(t * 13) * 1.6;
    return {
      ...s, tilt: s.tilt + 0.06, neck: s.neck + 0.10 + Math.sin(t * 11) * 0.012,
      bob: s.bob - 0.8,
      footL: { x: -4, y: 0 }, footR: { x: 5, y: 0 },
      fistL: { x: 10 + q, y: -8 }, fistR: { x: 15 - q, y: -6 },
    };
  }
  if (code === 55) {                             // LAUGH — head back, shoulders going
    const h = Math.sin(t * 6.5);
    return {
      ...s, neck: s.neck - 0.26 - h * 0.05, tilt: s.tilt + 0.06 + h * 0.03,
      bob: s.bob - Math.abs(h) * 1.0,
      fistL: { x: 6 + h * 2, y: 2 }, fistR: { x: 13 - h * 2, y: 0 },
    };
  }
  if (code === 56) {                             // SIGH — one long fall, shoulders down
    // Rises a little first. A sigh that only descends is a slump; the intake is
    // what makes the release read as a sigh.
    const inh = Math.sin(Math.PI * clamp01(p / 0.34));
    const out = ease01(clamp01((p - 0.30) / 0.70));
    return {
      ...s, bob: s.bob + inh * 1.6 - out * 1.4,
      tilt: s.tilt - inh * 0.04 + out * 0.10,
      neck: s.neck - inh * 0.10 + out * 0.18,
      fistL: { x: -5 - inh * 2, y: 6 + out * 2 }, fistR: { x: 6 + inh * 2, y: 6 + out * 2 },
    };
  }
  if (code === 57) {                             // PEEK — up on the toes to see over something
    const r = Math.sin(Math.PI * ease01(p));
    return {
      ...s, neck: s.neck - 0.16 - r * 0.06, tilt: s.tilt - r * 0.04,
      // Up on the toes: the pelvis rises and the feet come with it.
      bob: s.bob + r * 4.5,
      footL: { x: -6, y: -r * 4 }, footR: { x: 7, y: -r * 4 },
      fistL: { x: -4 + r * 10, y: 7 - r * 4 }, fistR: { x: 5 + r * 12, y: 7 - r * 4 },
    };
  }
  if (code === 58) {                             // STUMBLE AND CATCH — one bad step, recovered
    const trip = Math.sin(Math.PI * clamp01(p / 0.30));
    const catch_ = Math.sin(Math.PI * clamp01((p - 0.26) / 0.44));
    return {
      ...s, tilt: s.tilt - trip * 0.34 + catch_ * 0.14,
      neck: s.neck + trip * 0.16 - catch_ * 0.06,
      bob: s.bob - trip * 3.2 + catch_ * 0.8,
      footL: { x: -6 - catch_ * 4, y: 0 }, footR: { x: 7 + trip * 13, y: -trip * 5 },
      fistL: { x: -4 + trip * 20, y: 6 - trip * 16 },
      fistR: { x: 6 + trip * 24, y: 6 - trip * 14 },
      adv: trip * 4,
    };
  }
  if (code === 40) {                             // ROLL SHOULDERS — a circle, one then the other
    // Two circles a half-cycle apart. The hand describes an ellipse rather than a
    // line, which is the difference between a shoulder rolling and an arm
    // twitching.
    const a = t * 1.8, b = a + Math.PI;
    return {
      ...s, neck: s.neck + 0.04, tilt: s.tilt + Math.cos(a) * 0.02,
      fistL: { x: -6 + Math.cos(a) * 5, y: 5 + Math.sin(a) * 6 },
      fistR: { x: 7 + Math.cos(b) * 5, y: 5 + Math.sin(b) * 6 },
    };
  }

  // ── THE LIVING HOLDS: 59–78 ────────────────────────────────────────────────
  //
  // These read `t` and ignore `u`, so holding one runs it forever. That is not a
  // stylistic choice, it is the only kind of motion a LESSON can currently show.
  //
  // A beat hands the scene one pose code and the scene holds it: `emoteAny(code,
  // t)` calls `actStance(code − 99, t, 1)`, pinning u to 1. Every one-shot above
  // ends at the neutral stand, so held at u = 1 it IS the neutral stand — which
  // is exactly why, counted across every script in the app, the only 100+ codes
  // any lesson uses are 128, 129, 130, 137, 139, 141, 144 and 147. All eight are
  // from the loose-arm and dance set. All eight loop. The other fifty one-shots
  // are unreachable from a script, and adding a fifty-ninth would have been too.
  //
  // (The other half of that problem — letting a beat PLAY a one-shot rather than
  // only hold one — is the 300+ band down at the bridge.)
  //
  // So this shelf is deliberately weighted toward the things a person does while
  // standing there being a person: waiting, listening, thinking, fidgeting. A
  // lesson beat lasts four to nine seconds and the figure is on screen for all of
  // it, which is long enough for a loop to be caught repeating — hence `life2`
  // everywhere rather than a bare sine, and hence the rare punctuating events
  // (the foot tap, the re-settle, the scratch) raised off a slow sine so they
  // land seconds apart and never on the same beat as each other.

  if (code === 59) {                             // WEIGHT SHIFT — the plainest human idle
    // Nobody stands evenly on two legs for long. `stand` already does a version
    // of this at under two units; this is the same idea made visible, with the
    // pelvis riding out over the loaded leg and sinking onto it.
    const w = life2(t, 0.26, 0.163, 0.9);
    const load = Math.abs(w);
    return {
      ...s,
      tilt: s.tilt + w * 0.025,
      neck: s.neck + w * 0.035,
      bob: s.bob - load * 1.6,
      footL: { x: -5 - w * 1.8, y: 0 }, footR: { x: 5 - w * 1.8, y: 0 },
      fistL: { x: -5 - w * 2.2, y: 6 + load * 0.6 },
      fistR: { x: 6 - w * 2.2, y: 6 + load * 0.6 },
    };
  }
  if (code === 60) {                             // LISTENING — inclined, with the odd small nod
    // The nod is a NARROW PULSE off a slow sine, not a steady beat: raised to the
    // 14th power it is flat for about six seconds and then fires. A metronomic
    // nod reads as a machine agreeing with you.
    const drift = life2(t, 0.42, 0.27, 1.4);
    const gate = Math.max(0, Math.sin(t * 0.52));
    const nod = Math.pow(gate, 14) * Math.sin(t * 6.4);
    return {
      ...s,
      neck: s.neck + 0.09 + drift * 0.035 + nod * 0.075,
      tilt: s.tilt + 0.015 + nod * 0.012,
      fistL: { x: -5 + drift * 1.4, y: 6 }, fistR: { x: 6 + drift * 1.2, y: 6 },
    };
  }
  if (code === 61) {                             // CHIN IN HAND — thinking, and barely moving
    // Deliberate face contact, so it is named in check-moves' FACE_OK. The
    // supporting arm is the point of the pose; the free one crosses under it to
    // carry the elbow, which is what a person actually does.
    const d = life2(t, 0.31, 0.2, 0.4);
    return {
      ...s,
      tilt: s.tilt + 0.02, neck: s.neck + 0.06 + d * 0.03,
      bob: s.bob - 0.6,
      footL: { x: -5, y: 0 }, footR: { x: 6, y: 0 },
      // BOTH forearms have to sit FORWARD of the torso or they do not exist: the
      // torso is 12 thick in the same ink, so a hand at x 4 lays its forearm along
      // the body and the arm disappears (rig's arms-crossed comment, B16b). The
      // supporting hand goes out to 13, where the forearm has paper behind it.
      fistL: { x: 13, y: -11 + d * 0.8 },         // carrying the other elbow
      fistR: { x: 11 + d * 0.7, y: -35 + d * 0.6 },// knuckles at the chin
    };
  }
  if (code === 62) {                             // ARMS FOLDED — settled, with a re-settle
    // The arms cross, which is one of the poses the "no folded triangle against
    // the torso" rule explicitly exempts: the bend is meant to be seen. Every ten
    // seconds or so the fold RE-SETTLES — the top arm shifts and the weight goes
    // over — because a folded figure that never adjusts reads as a statue.
    const w = life2(t, 0.22, 0.14, 1.9);
    const gate = Math.max(0, Math.sin(t * 0.31 + 0.8));
    const adj = Math.pow(gate, 20);
    return {
      ...s,
      tilt: s.tilt + 0.03 + w * 0.02,
      neck: s.neck + 0.03,
      bob: s.bob - Math.abs(w) * 1.1 - adj * 0.8,
      footL: { x: -6 - w * 1.4, y: 0 }, footR: { x: 6 - w * 1.4, y: 0 },
      // (18, −22) and (13, −17) are rig's own arms-crossed targets and they are
      // not a preference. At (8, −19) / (−7, −22) — which is where this pose was
      // first written, and where anyone would write it — the hands sit almost on
      // the spine, both forearms lie along a 12-thick torso in the same ink, and
      // the figure renders WITH NO ARMS. It passes every numeric check, because
      // nothing is out of range; only the contact sheet says so. Folded in front,
      // the two forearms are two horizontals against open paper, one a little
      // below the other, which is what folded arms look like in profile.
      fistL: { x: 18 - adj * 2, y: -22 - adj * 1.5 },
      fistR: { x: 13 + adj * 2, y: -17 + adj * 1.5 },
    };
  }
  if (code === 63) {                             // HANDS BEHIND THE BACK — rocking heel to toe
    // The rock is the whole motion, and it has to move the FEET as well as the
    // pelvis: rising onto the toes without the feet leaving the floor is the
    // solver stretching the shins (rule 4).
    const r = Math.sin(t * 0.85) * 0.6 + Math.sin(t * 0.53 + 1.1) * 0.4;
    const up = Math.max(0, r);
    return {
      ...s,
      tilt: s.tilt - r * 0.05,
      neck: s.neck - up * 0.05,
      bob: s.bob + up * 2.6,
      footL: { x: -5, y: -up * 2.4 }, footR: { x: 5, y: -up * 2.4 },
      fistL: { x: -12 - r * 1.4, y: 1 }, fistR: { x: -13 - r * 1.4, y: 3 },
    };
  }
  if (code === 64) {                             // HANDS ON THE HIPS — surveying, chest open
    // Hands sit at the BACK of the hips rather than the front. On the front the
    // folded forearm encloses a triangle of paper against the torso and the arm
    // reads as a hole punched through the body (rule 1); behind them the same
    // fold has nothing but background inside it.
    const w = life2(t, 0.24, 0.15, 2.6);
    return {
      ...s,
      tilt: s.tilt - 0.04 + w * 0.02,
      neck: s.neck - 0.05,
      bob: s.bob - Math.abs(w) * 0.9,
      footL: { x: -8 - w * 1.2, y: 0 }, footR: { x: 8 - w * 1.2, y: 0 },
      fistL: { x: -9 + w * 1.2, y: 1 }, fistR: { x: -8 + w * 1.2, y: -1 },
    };
  }
  if (code === 65) {                             // GAZING UP — head back, arms forgotten
    const d = life2(t, 0.23, 0.145, 0.3);
    return {
      ...s,
      tilt: s.tilt - 0.05, neck: -0.30 + d * 0.05,
      bob: s.bob + 0.5,
      fistL: { x: -5 + d * 1.6, y: 7 }, fistR: { x: 6 + d * 1.4, y: 7 },
    };
  }
  if (code === 66) {                             // FIDGETING — nothing is ever quite still
    // Three clocks that never realign: the hands, the weight, and a scratch that
    // fires about every eight seconds. The scratch reaches the upper arm, not the
    // head — a hand on the skull is a different gesture and needs the exemption.
    const a = life2(t, 1.7, 2.31, 0.2) * 3.2;
    const b = life2(t, 1.3, 1.91, 2.4) * 3.0;
    const w = life2(t, 0.35, 0.22, 1.2);
    const sc = Math.pow(Math.max(0, Math.sin(t * 0.4 + 2.1)), 16);
    return {
      ...s,
      tilt: s.tilt + w * 0.02, neck: s.neck + b * 0.008 - sc * 0.04,
      bob: s.bob - Math.abs(w) * 0.9,
      footL: { x: -5 - w * 1.5, y: 0 }, footR: { x: 6 - w * 1.5, y: 0 },
      fistL: { x: -4 + a, y: 6 + b * 0.5 },
      // Across to the far upper arm, not back onto the ribs: at x −4 the scratching
      // forearm lies on the torso and the whole gesture is invisible.
      fistR: { x: lerp(6 + b, 14, sc), y: lerp(6 + a * 0.5, -22, sc) },
    };
  }
  if (code === 67) {                             // IMPATIENT — folded, and the foot going
    // Same fold as 62 with the clock wound up: the tap is fast and regular
    // BECAUSE impatience is the one idle where a metronome is right.
    const tap = Math.max(0, Math.sin(t * 4.6));
    const w = life2(t, 0.5, 0.31, 0.4);
    return {
      ...s,
      tilt: s.tilt + 0.04, neck: s.neck + 0.02 + w * 0.05,
      bob: s.bob - 0.4,
      footL: { x: -6, y: 0 }, footR: { x: 7, y: -tap * 3.4 },
      fistL: { x: 18, y: -22 }, fistR: { x: 13, y: -17 },   // the fold, forward — see 62
    };
  }
  if (code === 68) {                             // TALKING WITH THE HANDS — the narration loop
    // The single most useful hold in the file: a lesson beat is somebody talking,
    // and this is what talking looks like from the neck down. Both hands turn
    // over in slow alternation, out in front where the forearm has background
    // behind it rather than torso.
    const a = t * 1.15, b = a + 2.1;
    const ha = Math.sin(a), hb = Math.sin(b);
    const sw = life2(t, 0.6, 0.37, 1.7);
    return {
      ...s,
      tilt: s.tilt - 0.03 + sw * 0.02,
      neck: s.neck - 0.02 + ha * 0.02,
      bob: s.bob - Math.abs(sw) * 0.7,
      footL: { x: -5, y: 0 }, footR: { x: 6, y: 0 },
      fistL: { x: 19 + ha * 7, y: -12 + hb * 6 },
      fistR: { x: 25 + hb * 7, y: -17 + ha * 6 },
    };
  }
  if (code === 69) {                             // COUNTING THE POINTS — one, and two, and three
    // A four-count that cycles, so a beat of any length lands mid-list rather
    // than at a tidy stop. The counting hand ticks DOWN a step on each beat and
    // the other holds the place.
    // A COUNTER IS A STAIRCASE AND A STAIRCASE IS A POP. The first version read
    // `Math.floor(ph * 4)` straight into the hand's height, so the wrist jumped
    // 9.6 units between two frames four times a cycle — and again by the whole
    // flight when the cycle wrapped. `f` walks each step over the first 30% of its
    // count (fast, so it still reads as ticking rather than sliding) and `back`
    // returns the hand over the last fifth, which closes the wrap.
    const cyc = (t * 0.5) % 1;
    const k = clamp01(cyc / 0.80) * 4;
    const step = Math.min(3, Math.floor(k));
    const f = ease01(clamp01((k - step) / 0.30));
    const level = (step + f) * (1 - ease01(clamp01((cyc - 0.82) / 0.18)));
    const tick = Math.pow(Math.max(0, Math.sin(k * Math.PI)), 3) * clamp01((0.95 - cyc) / 0.1);
    return {
      ...s,
      tilt: s.tilt - 0.02, neck: s.neck + 0.05,
      fistL: { x: 15, y: -20 },                   // the hand being counted on
      fistR: { x: 24 - tick * 3, y: -30 + level * 3.2 + tick * 4 },
    };
  }
  if (code === 70) {                             // HANDS CLASPED — held in front; nerves
    const th = Math.sin(t * 2.6) * 1.2 + Math.sin(t * 1.7) * 0.8;
    const w = life2(t, 0.33, 0.21, 2.9);
    return {
      ...s,
      tilt: s.tilt + 0.04, neck: s.neck + 0.07,
      bob: s.bob - Math.abs(w) * 1.2,
      footL: { x: -5 - w * 1.6, y: 0 }, footR: { x: 5 - w * 1.6, y: 0 },
      fistL: { x: 12 + th * 0.5, y: -3 }, fistR: { x: 13 - th * 0.5, y: -2 },
    };
  }
  if (code === 71) {                             // DEEP BREATHING — a big slow cycle
    // `stand`'s breath is 1.1 units at its widest. This is nine, with the chest
    // opening and the head lifting on the intake, and it is the calmest thing in
    // the library.
    const c = 0.5 - 0.5 * Math.cos(t * 0.72);
    return {
      ...s,
      tilt: s.tilt - c * 0.07, neck: s.neck - c * 0.10,
      bob: s.bob + c * 2.0,
      footL: { x: -5, y: -c * 1.4 }, footR: { x: 5, y: -c * 1.4 },
      fistL: { x: -6 - c * 3, y: 7 - c * 2 }, fistR: { x: 7 + c * 3, y: 7 - c * 2 },
    };
  }
  if (code === 72) {                             // STEPPING IN PLACE — restless, or cold
    // A gait's foot cycle with no travel. `stance` is irrelevant here because
    // nothing moves in x, so this is just two feet lifting out of phase — which
    // is precisely what marking time is.
    const ph = t * 2.1;
    const fl = Math.max(0, Math.sin(ph));
    const fr = Math.max(0, Math.sin(ph + Math.PI));
    return {
      ...s,
      tilt: s.tilt + 0.02,
      bob: s.bob - 0.8 + (fl + fr) * 0.5,
      footL: { x: -5, y: -fl * 5.5 }, footR: { x: 6, y: -fr * 5.5 },
      fistL: { x: -5 + fr * 2.5, y: 6 }, fistR: { x: 6 + fl * 2.5, y: 6 },
    };
  }
  if (code === 73) {                             // UP ON THE TOES — light, springy, ready
    const b = Math.abs(Math.sin(t * 1.55));
    return {
      ...s,
      tilt: s.tilt - 0.03, neck: s.neck - 0.03,
      bob: s.bob + b * 3.0,
      footL: { x: -5, y: -b * 3.2 }, footR: { x: 5, y: -b * 3.2 },
      fistL: { x: -6, y: 6 - b * 2 }, fistR: { x: 7, y: 6 - b * 2 },
    };
  }
  if (code === 74) {                             // SLOUCHED ON ONE HIP — bored
    // The weight is PARKED, not drifting: one hip carries it for the whole beat
    // and only the free arm moves. That asymmetry is the entire read.
    const d = life2(t, 0.4, 0.26, 1.1);
    return {
      ...s,
      tilt: s.tilt + 0.06, neck: s.neck + 0.10 + d * 0.02,
      bob: s.bob - 2.2,
      footL: { x: -9, y: 0 }, footR: { x: 3, y: 0 },
      // The crossing hand goes to 15, not 4: on the sternum the forearm is ink on
      // ink and the arm vanishes, which turns a slouch into a figure with one arm.
      fistL: { x: -8, y: 2 }, fistR: { x: 15 + d * 1.5, y: -12 },
    };
  }
  if (code === 75) {                             // AT ATTENTION — almost nothing, on purpose
    // A library of motion needs one entry that is stillness, or a scene has no
    // way to say formal, braced, or holding itself together. Everything is a
    // third of `stand`'s amplitude; the sway is there only so it does not freeze.
    const d = life2(t, 0.3, 0.19, 0.5);
    return {
      ...s,
      tilt: 0.02 + d * 0.006, neck: -0.04,
      bob: s.bob * 0.4,
      footL: { x: -4, y: 0 }, footR: { x: 4, y: 0 },
      fistL: { x: -6 + d * 0.5, y: 8 }, fistR: { x: 6 + d * 0.5, y: 8 },
    };
  }
  if (code === 76) {                             // WARMING THE HANDS — rubbing, shoulders in
    const r = Math.sin(t * 5.2);
    const sh = life2(t, 0.7, 0.44, 2.0);
    return {
      ...s,
      tilt: s.tilt + 0.05, neck: s.neck + 0.09,
      bob: s.bob - 1.4 + Math.abs(r) * 0.3,
      fistL: { x: 13 + r * 2.6, y: -8 }, fistR: { x: 14 - r * 2.6, y: -7 + sh * 0.6 },
    };
  }
  if (code === 77) {                             // WEIGHING IT, SLOWLY — one open palm, up and down
    // The gesture the whole app is about, as a hold rather than a one-shot: a
    // hand out at chest height that rises and falls while somebody decides.
    const w = Math.sin(t * 0.66) * 0.7 + Math.sin(t * 0.41 + 0.9) * 0.3;
    return {
      ...s,
      tilt: s.tilt - 0.02, neck: s.neck + 0.04 - w * 0.05,
      fistL: { x: -5, y: 6 },
      fistR: { x: 26 + w * 2, y: -14 - w * 9 },
    };
  }
  if (code === 78) {                             // LEANING IN, LISTENING CLOSE
    // The torso goes forward and the head inclines; the near hand comes up toward
    // the ear, which is face contact and is named in FACE_OK. The far foot slides
    // back to carry the lean, because a body that leans without moving a foot is
    // a body falling over.
    const d = life2(t, 0.5, 0.32, 1.6);
    const nod = Math.pow(Math.max(0, Math.sin(t * 0.6 + 1.4)), 12) * Math.sin(t * 6.8);
    return {
      ...s,
      tilt: s.tilt - 0.18, neck: s.neck + 0.14 + nod * 0.06,
      bob: s.bob - 1.6,
      footL: { x: -11, y: 0 }, footR: { x: 7, y: 0 },
      fistL: { x: -6, y: 4 },
      fistR: { x: 14 + d * 0.8, y: -38 },
      adv: 2,
    };
  }

  // ── ONE-SHOTS: 79–96 ───────────────────────────────────────────────────────
  //
  // Played over `u`, beginning and ending at the neutral stand so consecutive
  // actions meet cleanly — except 92 and 93, which name their destination.
  //
  // Reachable from a lesson through the 300+ band at the bridge, which plays one
  // over the opening seconds of a beat and then settles. Held at u = 1 through
  // the 100+ band they are the neutral stand, which is correct and is why the
  // shelf above exists.

  if (code === 79) {                             // SHRUG — the one gesture the library lacked
    // Shoulders up, head sinking into them, palms turning out. `bob` lifts the
    // pelvis, so the feet lift with it (rule 4) — a shrug that stretches the
    // shins is a shrug performed by a puppet.
    const r = Math.sin(Math.PI * ease01(p));
    return {
      ...s,
      tilt: s.tilt + r * 0.04,
      neck: s.neck + r * 0.17,
      bob: s.bob + r * 1.5,
      footL: { x: -6, y: -r * 1.1 }, footR: { x: 6, y: -r * 1.1 },
      fistL: { x: -5 - r * 13, y: 6 - r * 12 },
      fistR: { x: 6 + r * 15, y: 6 - r * 13 },
    };
  }
  if (code === 80) {                             // THE IDEA — it arrives, and the finger goes up
    // Three movements in order, which is what makes it read as a thought rather
    // than an arm: the head is DOWN first, then it comes up, and only then does
    // the hand follow. Reverse any two and it becomes a person hailing a bus.
    const up = ease01(clamp01((p - 0.30) / 0.28));
    const off = 1 - ease01(clamp01((p - 0.80) / 0.20));
    const r = up * off;
    const brood = (1 - up) * ease01(clamp01(p / 0.24));
    return {
      ...s,
      tilt: s.tilt + brood * 0.06 - r * 0.05,
      neck: s.neck + brood * 0.14 - r * 0.21,
      bob: s.bob - brood * 0.8 + r * 1.6,
      footL: { x: -5, y: -r * 1.3 }, footR: { x: 5, y: -r * 1.3 },
      fistL: { x: -5, y: 6 },
      // OUT FIRST, UP SECOND. Clearing the head at the top is not enough: on a
      // straight hip-to-target line the hand cuts the corner and passes 22.8 from
      // the head centre at r ≈ 0.9, which is inside the 25 the skull needs. The
      // fractional power throws x out ahead of y, so the wrist swings around the
      // head instead of through it — 29.7 at its closest — and it is the arc a
      // real arm describes anyway.
      fistR: { x: 6 + Math.pow(r, 0.7) * 26, y: 6 - r * 58 },
    };
  }
  if (code === 81) {                             // WEIGH IT UP — two palms, and a see-saw
    // The gesture this whole app is about. Both hands come up level, one dips as
    // the other rises, then they level and drop. `tip` completes exactly one
    // cycle inside the raised window, so it is 0 at both ends and the hands never
    // jump when the raise or the release takes over.
    const up = ease01(clamp01(p / 0.22));
    const down = 1 - ease01(clamp01((p - 0.80) / 0.20));
    const e = up * down;
    const tip = Math.sin(((p - 0.22) / 0.58) * Math.PI * 2) * e;
    return {
      ...s,
      tilt: s.tilt + tip * 0.03,
      neck: s.neck + e * 0.07 + tip * 0.07,
      fistL: { x: -5 + e * 25, y: 6 - e * 19 + tip * 7 },
      fistR: { x: 6 + e * 22, y: 6 - e * 25 - tip * 7 },
    };
  }
  if (code === 82) {                             // HESITATE — a reach begun, withdrawn, then made
    // The withdrawal is the gesture. A reach that goes straight out says
    // "taking"; a reach that starts, thinks better of it, and then commits says
    // the thing no amount of narration can.
    let reach: number;
    if (p < 0.28) reach = easeOutCubic(p / 0.28) * 0.52;
    else if (p < 0.54) reach = 0.52 - ease01((p - 0.28) / 0.26) * 0.44;
    else reach = lerp(0.08, 1, ease01((p - 0.54) / 0.46));
    return {
      ...s,
      tilt: s.tilt - reach * 0.12,
      neck: s.neck + reach * 0.05,
      footL: { x: -5, y: 0 }, footR: { x: 5 + reach * 5, y: 0 },
      fistL: { x: -5, y: 6 - reach * 2 },
      fistR: { x: 6 + reach * 24, y: 6 - reach * 24 },
      adv: reach * 2.5,
    };
  }
  if (code === 83) {                             // CHANGE OF MIND — committed, stopped, reversed
    // Goes one way with the whole body, halts dead, and goes the other. The halt
    // has to be a real pause with no motion in it — a smooth reversal is a sway,
    // and a sway means nothing.
    let g: number;
    if (p < 0.34) g = easeOutCubic(p / 0.34);
    else if (p < 0.48) g = 1;
    else g = lerp(1, -0.85, ease01((p - 0.48) / 0.42));
    const fw = Math.max(0, g), bk = Math.max(0, -g);
    return {
      ...s,
      tilt: s.tilt - fw * 0.16 + bk * 0.10,
      neck: s.neck + fw * 0.06 - bk * 0.08,
      bob: s.bob - Math.abs(g) * 1.2,
      footL: { x: -5 - bk * 9, y: 0 }, footR: { x: 5 + fw * 11, y: 0 },
      fistL: { x: -5 - bk * 6, y: 6 }, fistR: { x: 6 + fw * 14 - bk * 8, y: 6 - fw * 10 },
      adv: g * 4,
    };
  }
  if (code === 84) {                             // MAKE THE POINT — three chops on the beat
    const up = ease01(clamp01(p / 0.16));
    const off = 1 - ease01(clamp01((p - 0.84) / 0.16));
    const e = up * off;
    const chop = Math.sin(((p - 0.16) / 0.68) * Math.PI * 3) * e;
    return {
      ...s,
      tilt: s.tilt - 0.04 * e,
      neck: s.neck + 0.03 * e + chop * 0.03,
      fistL: { x: -5, y: 6 },
      fistR: { x: 6 + e * 18, y: 6 - e * 34 + chop * 9 },
    };
  }
  if (code === 85) {                             // OFFER IT — both palms out, and held there
    // Held open at the top for nearly half the action, because an offer that is
    // withdrawn as fast as it is made is not an offer.
    const up = ease01(clamp01(p / 0.26));
    const off = 1 - ease01(clamp01((p - 0.72) / 0.28));
    const e = up * off;
    return {
      ...s,
      tilt: s.tilt - e * 0.07,
      neck: s.neck + e * 0.04,
      footL: { x: -6, y: 0 }, footR: { x: 6, y: 0 },
      fistL: { x: -5 + e * 28, y: 6 - e * 16 },
      fistR: { x: 6 + e * 21, y: 6 - e * 22 },
      adv: e * 1.5,
    };
  }
  if (code === 86) {                             // SPLIT IT IN TWO — one thing, then two
    // Separated UP AND DOWN, never left and right. The figure is drawn in
    // profile, so two hands parting along x are one hand in front of the other:
    // the reader sees a single arm extending, not a distinction being made.
    const meet = ease01(clamp01(p / 0.26));
    const gap = ease01(clamp01((p - 0.30) / 0.38));
    const off = 1 - ease01(clamp01((p - 0.78) / 0.22));
    const e = Math.max(meet, gap) * off;
    return {
      ...s,
      tilt: s.tilt - e * 0.05,
      neck: s.neck + e * 0.06 - gap * off * 0.04,
      fistL: { x: -5 + e * 26, y: 6 - e * 15 + gap * off * 11 },
      fistR: { x: 6 + e * 21, y: 6 - e * 19 - gap * off * 15 },
    };
  }
  if (code === 87) {                             // SHOW THE SIZE — this big, then this big
    // Wide first and then narrow, which is the useful direction: nearly every
    // time a lesson needs this it is saying something is SMALLER than you think.
    const up = ease01(clamp01(p / 0.24));
    const close = ease01(clamp01((p - 0.40) / 0.36));
    const off = 1 - ease01(clamp01((p - 0.80) / 0.20));
    const e = up * off;
    const span = lerp(17, 4, close);
    return {
      ...s,
      tilt: s.tilt - e * 0.04,
      neck: s.neck + e * 0.08,
      fistL: { x: -5 + e * 27, y: 6 - e * 14 + e * span },
      fistR: { x: 6 + e * 20, y: 6 - e * 18 - e * span },
    };
  }
  if (code === 88) {                             // FLINCH — fast in, slow out, no step
    // The distinction from STARTLE (19) is the feet: a startle takes a step back,
    // a flinch is a body that could not get out of the way in time.
    const f = p < 0.11 ? easeOutCubic(p / 0.11) : 1 - ease01(clamp01((p - 0.11) / 0.55));
    return {
      ...s,
      tilt: s.tilt + f * 0.14,
      neck: s.neck + f * 0.20,
      bob: s.bob - f * 3.4,
      footL: { x: -5, y: 0 }, footR: { x: 5, y: 0 },
      fistL: { x: -4 + f * 14, y: 6 - f * 22 },
      fistR: { x: 6 + f * 13, y: 6 - f * 26 },
      adv: -f * 1.5,
    };
  }
  if (code === 89) {                             // CRINGE — shoulders up, head down, held
    const up = ease01(clamp01(p / 0.20));
    const off = 1 - ease01(clamp01((p - 0.62) / 0.38));
    const e = up * off;
    return {
      ...s,
      tilt: s.tilt + e * 0.10,
      neck: s.neck + e * 0.23,
      bob: s.bob + e * 1.4,
      footL: { x: -5, y: -e * 1.0 }, footR: { x: 5, y: -e * 1.0 },
      // Clear of the skull at 27.7 units; at the more natural-looking x 16 the
      // hands sit 24.8 from the head centre and vanish into it.
      fistL: { x: -5 + e * 23, y: 6 - e * 34 },
      fistR: { x: 6 + e * 12, y: 6 - e * 32 },
    };
  }
  if (code === 90) {                             // REFUSE — both palms out, pushed away twice
    const up = ease01(clamp01(p / 0.18));
    const off = 1 - ease01(clamp01((p - 0.78) / 0.22));
    const e = up * off;
    const push = Math.max(0, Math.sin(((p - 0.18) / 0.60) * Math.PI * 2)) * e;
    return {
      ...s,
      tilt: s.tilt + e * 0.06 - push * 0.05,
      neck: s.neck - e * 0.04,
      footL: { x: -6, y: 0 }, footR: { x: 5, y: 0 },
      fistL: { x: -5 + e * 30 + push * 4, y: 6 - e * 22 },
      fistR: { x: 6 + e * 25 + push * 4, y: 6 - e * 27 },
      adv: -e * 1.2,
    };
  }
  if (code === 91) {                             // CELEBRATE — a fist to the air, twice
    const up = ease01(clamp01(p / 0.16));
    const off = 1 - ease01(clamp01((p - 0.80) / 0.20));
    const e = up * off;
    const pump = Math.max(0, Math.sin(((p - 0.16) / 0.64) * Math.PI * 2));
    const r = e * (0.55 + 0.45 * pump);
    return {
      ...s,
      tilt: s.tilt - r * 0.06,
      neck: s.neck - r * 0.16,
      bob: s.bob + r * 2.2,
      footL: { x: -5, y: -r * 2.0 }, footR: { x: 5, y: -r * 2.0 },
      fistL: { x: -5 - e * 6, y: 6 - e * 6 },
      fistR: { x: 6 + Math.pow(r, 0.65) * 25, y: 6 - r * 57 },   // out first, up second — see 80
    };
  }
  if (code === 92 || code === 93) {              // KNEEL DOWN / RISE FROM ONE KNEE
    // One move, either direction — the same construction as SIT DOWN and STAND
    // UP above. 92 ENDS on posture 1 and 93 starts there, so the scene holds that
    // posture on the other side of the beat.
    const e = ease01(code === 92 ? p : 1 - p);
    const m = mixStance(s, postureHold(1, t), e);
    // A body lowering itself puts a hand out for the floor on the way down and
    // takes the weight on the front thigh; the arc peaks mid-descent.
    const r = Math.sin(Math.PI * e);
    return {
      ...m,
      tilt: m.tilt - r * 0.12,
      bob: m.bob - r * 1.2,
      fistR: { x: m.fistR.x + r * 9, y: m.fistR.y + r * 5 },
    };
  }
  if (code === 94) {                             // TURN ON THE SPOT — the weight of a pivot
    // The FACING is the scene's to change — `dirTurn` eases the sign through zero
    // so the figure turns through a profile instead of mirroring between frames
    // (§17, group L). This supplies what that helper cannot: the dip, the arms
    // swinging across the body, and the feet re-planting the other way round.
    const sw = Math.sin(Math.PI * ease01(p));
    const cross = Math.sin(Math.PI * 2 * ease01(p));
    return {
      ...s,
      tilt: s.tilt - sw * 0.05,
      neck: s.neck - sw * 0.04,
      bob: s.bob - sw * 2.6,
      footL: { x: -5 - sw * 4, y: -Math.max(0, cross) * 3.5 },
      footR: { x: 5 + sw * 4, y: -Math.max(0, -cross) * 3.5 },
      fistL: { x: -5 + sw * 13, y: 6 - sw * 8 },
      fistR: { x: 6 - sw * 12, y: 6 - sw * 6 },
    };
  }
  if (code === 95) {                             // CHECK THE TIME — and be unimpressed by it
    const up = ease01(clamp01(p / 0.22));
    const off = 1 - ease01(clamp01((p - 0.66) / 0.34));
    const e = up * off;
    return {
      ...s,
      tilt: s.tilt + e * 0.03,
      neck: s.neck + e * 0.15,
      fistL: { x: -5 + e * 20, y: 6 - e * 26 },   // the wrist being read
      fistR: { x: 6 + e * 11, y: 6 - e * 30 },    // the other hand steadying it
    };
  }
  if (code === 96) {                             // RUB THE NECK — awkwardness, in one gesture
    // The hand goes behind the neck, which is face-adjacent and named in
    // check-moves' FACE_OK; the elbow winging out is most of the read, and the
    // weight goes onto one leg because nobody does this standing square.
    const up = ease01(clamp01(p / 0.24));
    const off = 1 - ease01(clamp01((p - 0.72) / 0.28));
    const e = up * off;
    const rub = Math.sin(p * Math.PI * 5) * e;
    return {
      ...s,
      tilt: s.tilt + e * 0.05,
      neck: s.neck + e * 0.13,
      bob: s.bob - e * 1.0,
      footL: { x: -8 - e * 2, y: 0 }, footR: { x: 4, y: 0 },
      fistL: { x: -5 - e * 3, y: 6 },
      fistR: { x: -6 * e + 6 * (1 - e), y: 6 - e * 48 + rub * 2 },
    };
  }

  return s;
}

// ── the bridge: how a LESSON reaches any of this ─────────────────────────────
//
// None of it could, and that is the whole reason the figure looked repetitive.
//
// Counted across the 102 cinematic scenes: `emoteHold` — which lives in rig.ts
// and has 49 codes — is called 263 times, and `moves.ts` is called ZERO times.
// Every lesson in the app poses its figure from one set of 49, about five reuses
// each, while the 76 motions in this file were reachable only from the branch
// world. Adding to this file therefore did nothing for the lessons at all until
// something joined the two, which is what this is.
//
// WHY NOT JUST ADD THE POSES TO `emoteHold`? Because rig.ts has zero imports on
// purpose (§17) so it can run in plain Node, and because a second session is
// editing it. A scene swaps one import and gets the whole catalogue.
//
// The code space is deliberately sparse rather than continuous: 0–99 are rig's
// existing emotes and mean exactly what they always did, so a scene can switch to
// `emoteAny` without changing a single beat. Everything new is 100+.
//
//   0–99    rig's emoteHold, untouched
//   100+    one-shot actions from this file, HELD at full extension
//           (100 → act 1 … 195 → act 96; the loose-arm and dance set is 128–139,
//           and the living holds — the ones a beat can actually show — are
//           158–177)
//   200+    prop actions from interact.ts are NOT here — a prop action needs an
//           object, so it belongs to the scene that drew one.
//   300+    the same actions PLAYED ONCE as the beat opens, then settled
//           (300 → act 1 … 395 → act 96)
//
// ── WHY THE 300 BAND HAD TO EXIST ───────────────────────────────────────────
//
// Because holding a one-shot shows nothing. `emoteAny` pins u to 1, and every
// action here is authored to begin and end at the neutral stand so that
// consecutive actions meet cleanly — so a beat that asks for SHRUG gets the pose
// a shrug ENDS in, which is a person standing there.
//
// It is not a theory. Counted across every `*Script.ts` in the app, the only
// codes above 99 any lesson uses are 128, 129, 130, 137, 139, 141, 144 and 147 —
// eight codes, seventy-five beats, and every one of them from the handful of
// actions that loop on `t` and ignore `u` entirely. Ninety-odd one-shots and
// thirty prop actions were sitting behind a door with no handle.
//
// This is the handle, and it costs nothing at the call site: `emoteAnyLive` is
// already handed `bt`, the beat's own clock in seconds, and already uses it for
// exactly this shape — rig's speech accents decay over the first 1–2.6s of a beat
// and then settle into the held pose. A played action is that generalised.
//
// The HELD value of a 300 code is deliberately identical to its 100 twin, and
// that is what keeps it smooth: `carryFrom`/`keepHeld` blend the outgoing beat
// against `emoteAny(code, t)` while `emoteAnyLive` drives the incoming one, so
// the two agree the moment the action finishes (§17, group L). An action that
// ends somewhere other than the stand — 92 kneels down, 1 sits — therefore holds
// its destination, which is the correct thing for the next beat to inherit.

/** How long a played action takes. Matches the window rig's own accents decay over. */
export const PLAY_SECONDS = 1.5;

/** rig's emotes for 0–99, this file's actions for 100+. See the note above. */
export function emoteAny(code: number, t: number): Stance {
  'worklet';
  if (code < 100) return emoteHold(code, t);
  // u = 1: a one-shot held at its end. The living holds and the dance set read
  // `t` rather than `u`, so holding them runs them forever, which is the point.
  if (code >= 300) return actStance(code - 299, t, 1);
  return actStance(code - 99, t, 1);
}

/** The live variant, so a beat's opening still carries rig's speech beat. */
export function emoteAnyLive(code: number, t: number, bt: number): Stance {
  'worklet';
  if (code < 100) return emoteLive(code, t, bt);
  // PLAYED: u runs 0 → 1 over the first PLAY_SECONDS of the beat and then stays
  // there, so the action performs once and the figure settles into whatever it
  // ended in. `clamp01` rather than a modulo — a played action that restarted
  // every 1.5s would be a tic, not a gesture.
  if (code >= 300) return actStance(code - 299, t, clamp01(bt / PLAY_SECONDS));
  return actStance(code - 99, t, 1);
}

/** The played code for an action, and the held one. Use these rather than arithmetic. */
export function playCode(act: number): number {
  'worklet';
  return 299 + act;
}
export function holdCode(act: number): number {
  'worklet';
  return 99 + act;
}

// ── aiming: what the figure is attending to ──────────────────────────────────
// The single largest realism gap in the old vocabulary. Every gesture carries a
// hard-coded `neck`, so a figure beside a chart is not looking at the chart, it
// is holding a number that happened to look right when the gesture was written.
// Move the chart and the figure keeps staring at nothing.
//
// These take a STAGE point — the same coordinates the scene draws its props in —
// and convert it into the figure's local frame, so a scene can say "look at the
// answer card" and mean the actual card.

/** A stage point in the figure's pelvis-local frame. `dir` is the figure's facing. */
export function toLocal(
  tx: number, ty: number, figX: number, groundY: number, k: number, dir: number, bob: number
): P2 {
  'worklet';
  const pelY = groundY - (U.standH + bob) * k;
  return { x: (tx - figX) / (k * dir), y: (ty - pelY) / k };
}

/**
 * Turn the head to look at a stage point.
 *
 * `w` fades the effect in (0 = the pose's own neck, 1 = fully tracking), which is
 * what a scene wants when a figure notices something part-way through a beat.
 *
 * A profile figure cannot turn its head to look behind itself — that would take
 * the whole body — so a target behind the figure only pulls the head part of the
 * way. Scenes that need a real about-face should turn the body (`dirTurn`).
 */
export function gazeAt(
  s: Stance, figX: number, groundY: number, k: number, dir: number,
  tx: number, ty: number, w = 1
): Stance {
  'worklet';
  const p = toLocal(tx, ty, figX, groundY, k, dir, s.bob);
  // The head sits roughly 49 units above the pelvis: 33 of spine plus 16 of neck
  // and skull. Close enough to aim from; the eye is not modelled.
  const dx = p.x;
  const dy = p.y + 49;
  const el = Math.atan2(-dy, Math.max(Math.abs(dx), 12));     // + when the target is above
  const behind = dx < 0 ? 0.45 : 1;
  let gz = -el * 0.5 * behind;
  gz = gz < -0.36 ? -0.36 : gz > 0.34 ? 0.34 : gz;
  return {
    ...s,
    neck: lerp(s.neck, gz, w),
    tilt: s.tilt + gz * 0.10 * w,                // the chest follows the head a little
  };
}

/**
 * Put the leading hand on a stage point — an aimed point, not a fixed pose.
 *
 * The fist lands just inside arm's length along the line to the target, so the
 * arm goes straight and reads as pointing rather than as a bent elbow that
 * happens to face the right way. Pair it with `gazeAt` on the same target; a
 * point without a look reads as a person gesturing at something behind them.
 */
export function pointAt(
  s: Stance, figX: number, groundY: number, k: number, dir: number, tx: number, ty: number
): Stance {
  'worklet';
  const p = toLocal(tx, ty, figX, groundY, k, dir, s.bob);
  const shx = 3, shy = -26;                      // the right shoulder, in the pelvis frame
  const dx = p.x - shx, dy = p.y - shy;
  const d = Math.hypot(dx, dy) || 1e-4;
  const reach = 31;                              // inside the 33-unit arm, so it stays straight
  return { ...s, fistR: { x: shx + dx / d * reach, y: shy + dy / d * reach } };
}

// ── turning on the spot ──────────────────────────────────────────────────────
// `dir` mirrors the whole local frame, so flipping it between beats swaps the
// figure for a mirrored copy in a single frame. Nothing physical happens: there
// is no pivot, no weight change, no moment where the figure is edge-on. Sweeping
// `dir` through zero gives the paper-cutout turn that 2D animation has always
// used, and a dip on top of it supplies the weight.

/** Fractional facing that sweeps from d0 to d1 early in a beat's transition. */
export function dirTurn(d0: number, d1: number, tr: number): number {
  'worklet';
  if (d0 === d1) return d1;
  return lerp(d0, d1, ease01(clamp01((tr - 0.06) / 0.20)));
}

/** The weight that goes with `dirTurn`: a small dip and a foot re-plant on the pivot. */
export function turnDip(s: Stance, d0: number, d1: number, tr: number): Stance {
  'worklet';
  if (d0 === d1) return s;
  const p = Math.sin(Math.PI * clamp01((tr - 0.04) / 0.26));
  return {
    ...s,
    bob: s.bob - p * 2.2,
    tilt: s.tilt + p * 0.04,
    footL: { x: s.footL.x, y: s.footL.y - p * 3 },
  };
}
