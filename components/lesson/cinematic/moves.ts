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
//   moveStance(mode, dist)      — HOW they travel        18 modes
//   postureHold/Live(code, t)   — WHERE the body is      15 postures
//   actStance(code, t, u)       — WHAT they do           40 one-shot actions
//                                 (29–40 are loose arms and dancing: motion
//                                  for its own sake, held for as long as a
//                                  scene likes rather than played once)
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
  clamp01, ease01, easeOutCubic, gaitVary, holdEnv, life2, lerp, mixStance,
  phaseFor, seatBob, settleFrac, settleStep, stand, U, walk, WALK,
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

/**
 * Gait for a travel mode. 0 walk · 1 stroll · 2 hurry · 3 run · 4 trudge ·
 * 5 march · 6 sneak · 7 limp · 8 skip · 9 tiptoe · 10 back away · 11 pace.
 */
export function gaitFor(mode: number): Gait {
  'worklet';
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
    return {
      ...w, neck: -0.10, tilt: w.tilt - 0.04,
      fistL: { x: 8 + c * 16, y: -14 - c * 6 },
      fistR: { x: 8 - c * 16, y: -14 + c * 6 },
    };
  }
  if (mode === 4) {                              // TRUDGE — head down, arms dead
    return {
      ...w, tilt: -0.13, neck: 0.21,
      fistL: { x: 2 + c * sw * 10, y: 9 }, fistR: { x: 2 - c * sw * 10, y: 9 },
    };
  }
  if (mode === 5) {                              // MARCH — chin up, arms straight and high
    return {
      ...w, tilt: 0.03, neck: -0.13,
      fistL: { x: 4 + c * 24, y: 2 }, fistR: { x: 4 - c * 24, y: 2 },
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
      fistL: { x: 4 + c * 20, y: -5 }, fistR: { x: 4 - c * 20, y: -5 },
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
  return w;                                      // 0 — the plain walk
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
 */
export function strideMode(
  x0: number, x1: number, settled: Stance, tr: number, mode: number, seed = 0
): Stance {
  'worklet';
  // See `strideStance` in rig.ts: `seed` gives a companion on the same journey its
  // own gait habit and its own footfall, so a pair never marches in lockstep.
  const g = gaitVary(gaitFor(mode), x0 * 0.37 + x1 * 0.11 + seed * 3.7);
  const span = Math.abs(x1 - x0);
  // NOT `span * ease01(tr)`. This file was written from the pre-fix version of
  // `strideStance` and kept the double-ease that rig.ts had already removed: the
  // scene puts the body at `lerp(x0, x1, tr)` having eased tr once, so easing it
  // again here drove the feet along `span·ease01(ease01(u))` while the body ran
  // on `span·ease01(u)`. Two curves meeting only at the ends, and a glide in
  // between — measured at 122 units of skate on a 220-unit walk, three and a half
  // strides. Every travel mode in this file went through it.
  const w = moveBody(mode, span * tr + seed * 11, g);
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
  const sf = settleFrac(span);
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
 * 13 crouch and inspect something on the ground · 14 kneel and write.
 *
 * Postures 3–5 and 9–10 assume the scene has put something under the figure, or
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
 * 1 ends seated on an edge (posture 4); 11 ends sprawled (posture 10); 12 starts
 * there. Everything else returns to standing.
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
  return s;
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
