// ─────────────────────────────────────────────────────────────────────────────
// THE FIGURE AND WHAT IS OUTSIDE IT
//
// `rig.ts` solves one body. `moves.ts` is what that body can do on its own — how
// it travels, where it settles, what it acts out. Both stop at the figure's own
// skin. This file is the two things that need something else in the world:
//
//   handAt() / headAt()          — WHERE the figure's hand and head actually are
//   carryMode(mode, dist, hold)  — travelling WHILE HOLDING something
//   propAct(code, t, u)          — 8 one-shot actions performed ON an object
//   faceEachOther() / betweenThem()
//   handshake() / passObject() / converse()   — two figures, one action
//
// ── WHY `handAt` COMES FIRST ─────────────────────────────────────────────────
//
// `pose()` hands a scene a Bundle of transforms. It never exposes a joint, so a
// scene drawing a box in someone's hands has no way to ask where the hands ARE —
// it hard-codes a rectangle at a position that looked right, and the moment the
// figure breathes, walks, or plays a different beat, the object drifts out of the
// grip. Every prop in the app that a figure "holds" is really a prop the figure
// stands next to.
//
// `handAt` closes that, and it is the same trick `gazeAt`/`pointAt` already play
// in moves.ts, run in the other direction: those take a stage point and aim the
// body at it, this takes the body and returns a stage point. With both, a scene
// can put an object exactly in a hand, and a second figure can reach for that
// exact object. Everything else in this file is built on the pair.
//
// ── THE THREE CONSTRAINTS EVERY POSE HERE OBEYS ──────────────────────────────
//
// 1. REACH IS 33 (uarm 17 + farm 16) from a shoulder at local (±3, −26). A target
//    beyond that is clamped by the solver and the arm locks straight; a target
//    between about 18 and 30 is where an unintended elbow-bow cuts a hole against
//    the torso. Held objects therefore sit at 20–30 out and BELOW shoulder height,
//    where the arm reads as deliberately bent.
// 2. NOTHING GOES NEAR THE HEAD. The head is a 20-radius disc about (0, −49); a
//    hand within ~26 of that centre is swallowed whole, forearm included. Anything
//    carried high is carried FORWARD, never overhead.
// 3. TWO FIGURES CANNOT TOUCH FROM ANY DISTANCE. A hand reaches ~30 forward of the
//    figure's centre, so two of them meet only within about 60 stage units at
//    k = 1. `handshake` and `passObject` clamp to what the arms can actually do and
//    say so, rather than quietly stretching.
// ─────────────────────────────────────────────────────────────────────────────

import {
  U, clamp01, ease01, lerp, pulse, solve, stand,
  type P2, type Stance,
} from './rig';
import { gaitFor, moveStance, postureHold } from './moves';

/** Where a figure stands, in the terms `solve` and every scene already use. */
export interface Placed {
  x: number;
  groundY: number;
  k: number;
  /** +1 faces right, −1 faces left. */
  dir: number;
}

const ARM = U.uarm + U.farm;                     // 33
const SAFE = ARM - 2.5;                          // a target the solver will not clamp

// ── where the body actually is ───────────────────────────────────────────────

/**
 * Stage position of one hand — the inverse of `pointAt`, and the thing that lets
 * a scene draw an object IN a hand instead of beside it.
 *
 * Takes exactly the arguments the scene already passes to `pose()`, so a caller
 * never has to reconstruct anything.
 */
export function handAt(s: Stance, p: Placed, which: 1 | -1 = 1): P2 {
  'worklet';
  const j = solve({ x: p.x, groundY: p.groundY, k: p.k, dir: p.dir, ...s });
  return which > 0 ? j.wrR : j.wrL;
}

/** Stage position of the head's centre — what a second figure should look AT. */
export function headStage(s: Stance, p: Placed): P2 {
  'worklet';
  const j = solve({ x: p.x, groundY: p.groundY, k: p.k, dir: p.dir, ...s });
  return j.head;
}

/** A stage point in a figure's pelvis-local frame. */
function local(tx: number, ty: number, p: Placed, bob: number): P2 {
  'worklet';
  const pelY = p.groundY - (U.standH + bob) * p.k;
  return { x: (tx - p.x) / (p.k * p.dir), y: (ty - pelY) / p.k };
}

/**
 * Put ONE named hand on a stage point.
 *
 * `pointAt` in moves.ts always drives the right hand to full extension, because
 * pointing wants a straight arm. Holding does not: a hand ON an object at 24 units
 * should be at 24, not thrown out to 31. So this places the target where it asks,
 * and only pulls it in if it is beyond what the arm can do — which is the case the
 * solver would otherwise clamp silently.
 *
 * `w` fades it in against whatever the pose already had, for a hand that arrives
 * partway through a beat.
 */
export function reachHandTo(
  s: Stance, p: Placed, which: 1 | -1, tx: number, ty: number, w = 1
): Stance {
  'worklet';
  const t = local(tx, ty, p, s.bob);
  const shx = which > 0 ? 3 : -3, shy = -26;
  const dx = t.x - shx, dy = t.y - shy;
  const d = Math.hypot(dx, dy) || 1e-4;
  const r = d > SAFE ? SAFE : d;
  const tgt = { x: shx + (dx / d) * r, y: shy + (dy / d) * r };
  const cur = which > 0 ? s.fistR : s.fistL;
  const mixed = { x: lerp(cur.x, tgt.x, w), y: lerp(cur.y, tgt.y, w) };
  return which > 0 ? { ...s, fistR: mixed } : { ...s, fistL: mixed };
}

/** True when a stage point is inside the arm's reach — check before promising it. */
export function canReach(s: Stance, p: Placed, which: 1 | -1, tx: number, ty: number): boolean {
  'worklet';
  const t = local(tx, ty, p, s.bob);
  return Math.hypot(t.x - (which > 0 ? 3 : -3), t.y + 26) <= SAFE;
}

// ── carrying while travelling ────────────────────────────────────────────────
//
// The gap this closes: a figure could PICK SOMETHING UP (`actStance` 4) and then
// walked away swinging both arms as though its hands were empty. Nothing in the
// travel modes had any notion of a full hand.
//
// An arm holding something does not swing — that is most of the read — so these
// replace the fists outright rather than adding to them, and lean the torso to
// carry the weight. None of them touches a foot: `moveStance` owns the legs, and
// the foot-lock depends on the planted foot advancing by exactly the gait's `S`.

/**
 * Travel in `mode` while holding something.
 *
 * `hold`: 0 nothing · 1 a box in both hands · 2 a bag in the near hand ·
 * 3 a tray held level in both · 4 something cradled in one arm ·
 * 5 something long over the shoulder.
 */
export function carryMode(mode: number, dist: number, hold: number): Stance {
  'worklet';
  const w = moveStance(mode, dist);
  if (hold <= 0) return w;
  // A little residual sway, phase-locked to the stride, so the load is not welded
  // to the body — but far less than an empty arm's swing.
  const g = gaitFor(mode);
  const sway = Math.sin(dist * (2 * Math.PI * g.stance) / g.S) * 1.3;

  if (hold === 1) {                              // a box, both hands, in front and low
    return {
      ...w, tilt: w.tilt + 0.10, bob: w.bob - 1.5, neck: w.neck - 0.03,
      fistL: { x: 17 + sway, y: 1 }, fistR: { x: 22 + sway, y: -1 },
    };
  }
  if (hold === 2) {                              // a bag, one hand, hanging and swinging
    return {
      ...w, tilt: w.tilt - 0.04,
      fistL: { x: -3, y: 7 }, fistR: { x: 6 + sway * 2.2, y: 9 },
    };
  }
  if (hold === 3) {                              // a tray, both hands, held level
    return {
      ...w, tilt: w.tilt + 0.04, neck: w.neck - 0.05,
      fistL: { x: 19, y: -13 + sway * 0.4 }, fistR: { x: 25, y: -14 + sway * 0.4 },
    };
  }
  if (hold === 4) {                              // cradled in one arm, the other free
    return {
      ...w, tilt: w.tilt + 0.05,
      fistL: { x: 12, y: -8 }, fistR: { x: 21 + sway * 0.6, y: -6 },
    };
  }
  if (hold === 5) {                              // long, over the shoulder — hand HIGH and
    // FORWARD, never overhead: at |x| under about 14 the fist lands inside the head
    // disc and takes the forearm with it.
    return {
      ...w, tilt: w.tilt + 0.06, neck: w.neck + 0.02,
      fistL: { x: -4, y: 7 }, fistR: { x: 20, y: -34 + sway * 0.5 },
    };
  }
  return w;
}

// ── one-shot actions performed ON an object ──────────────────────────────────
//
// A fifth family beside `moveStance` / `postureHold` / `actStance`, numbered from
// 1 like the others.
//
// `actStance` already covers pick up, put down, throw, push, drag, give and take.
// These are the ones it does not: receiving, weight, precision, and holding.
//
// MOST begin and end at the neutral stand, so consecutive beats meet without a
// cross-fade. THREE cannot, and it would be a lie to pretend otherwise — an action
// whose whole point is that something is now in the hands has to end with it there:
//
//   2 LIFT HEAVY  starts neutral, ENDS holding at chest height
//   3 SET DOWN    STARTS holding at chest height, ends neutral
//   5 HOLD OUT    starts neutral, ENDS holding it out, and stays there at u = 1
//
// 2 and 3 are exact inverses, so a scene can lift, carry (`carryMode`), and set
// down with no seam anywhere.

/**
 * 1 catch · 2 lift something heavy · 3 set it down gently · 4 pull on it ·
 * 5 hold it out and KEEP holding · 6 place it high · 7 open a lid or door ·
 * 8 turn a crank.
 *
 * 5 is the only one that does not return to standing: it settles holding, and the
 * scene keeps it at u = 1 for as long as the offer stands.
 */
export function propAct(code: number, t: number, u: number): Stance {
  'worklet';
  const s = stand(t);
  const p = clamp01(u);

  if (code === 1) {                              // CATCH — hands up to meet it, absorb, lower
    // The absorb is the whole thing. Hands that stop dead where the object arrives
    // have caught nothing; they have to give with it and settle back.
    const up = ease01(clamp01(p / 0.34));
    const give = pulse(clamp01((p - 0.30) / 0.30));
    const down = ease01(clamp01((p - 0.62) / 0.38));
    const fx = lerp(lerp(-5, 24, up) - give * 7, -5, down);
    const fy = lerp(lerp(6, -22, up) + give * 6, 6, down);
    return {
      ...s,
      tilt: s.tilt + give * 0.10, neck: s.neck - up * 0.06 + give * 0.04,
      bob: s.bob - give * 2.5,
      fistL: { x: fx - 8, y: fy + 2 },
      fistR: { x: fx + 4, y: fy },
    };
  }
  if (code === 2) {                              // LIFT HEAVY — down, grip, drive up with the legs
    // TWO THINGS THIS GOT WRONG FIRST, both worth keeping written down.
    //
    // 1. THE BODY GOES DOWN TO THE OBJECT; THE ARMS DO NOT REACH DOWN TO IT. The
    //    grip was written as local y 16, forgetting that a fist target is
    //    PELVIS-relative and the pelvis has itself dropped 19 by then — so the
    //    hand was asked for a point under the floor, 43 from a 33-unit shoulder,
    //    and the solver quietly clamped it. `bob` is what carries the hands down.
    // 2. A LOW FORWARD GRIP IS TIGHTER THAN IT LOOKS. From a shoulder at local
    //    (3, −26) with 30.5 of usable reach, local y cannot exceed about 4.5 AT
    //    ALL, and at y 2 the hand can only get to x 15. Hence (12, 2) / (17, 3):
    //    measured to sit inside the arm rather than chosen to look right.
    const down = ease01(clamp01(p / 0.30));
    const rise = ease01(clamp01((p - 0.38) / 0.44));
    const strain = Math.sin(t * 6.7) * 0.7 + Math.sin(t * 4.3) * 0.4;
    const held = clamp01((p - 0.36) / 0.2);
    // Down to the grip, then up to a carry at chest height — and the x's LERP from
    // the standing rest, so u = 0 really is the neutral stand. Fixed x's meant this
    // began mid-pose, which is the one thing the family's contract forbids.
    const gx = (rest: number, grip: number, carry: number) => {
      'worklet';
      return lerp(lerp(rest, grip, down), carry, rise);
    };
    return {
      ...s,
      // The knees do the work and the back stays closer to upright than PICK UP's
      // does — this is a two-handed lift, not a stoop.
      bob: s.bob - down * 19 + rise * 19 - held * 2,
      tilt: s.tilt - down * 0.22 + rise * 0.10 + held * 0.08,
      neck: s.neck + down * 0.18 - rise * 0.16,
      footL: { x: -10, y: 0 }, footR: { x: 10, y: 0 },
      fistL: { x: gx(-5, 12, 14) + held * strain * 0.5, y: gx(6, 2, -8) },
      fistR: { x: gx(5, 17, 19) + held * strain * 0.5, y: gx(6, 3, -10) },
    };
  }
  if (code === 3) {                              // SET DOWN GENTLY — the opposite of a drop
    // Slow all the way to the floor, hold a beat at the bottom (letting go), then
    // withdraw. A `pick up` played backwards looks like a drop; the pause is what
    // makes it read as care.
    const down = ease01(clamp01(p / 0.46));
    const release = clamp01((p - 0.52) / 0.16);
    const up = ease01(clamp01((p - 0.66) / 0.34));
    return {
      ...s,
      bob: s.bob - down * 16 + up * 16,
      tilt: s.tilt - down * 0.30 + up * 0.30,
      neck: s.neck + down * 0.24 - up * 0.24,
      footL: { x: -7, y: 0 }, footR: { x: 8, y: 0 },
      // The inverse of LIFT HEAVY, and it inherits both of that one's corrections:
      // `bob` takes the hands to the floor, and the grip sits at a measured (12, 2)
      // rather than a written-down y that the arm cannot reach. Starts holding at
      // chest height and ends at the neutral stand.
      fistL: { x: lerp(lerp(14, 12, down) + release * 3, -5, up), y: lerp(lerp(-8, 2, down), 6, up) },
      fistR: { x: lerp(lerp(19, 17, down) + release * 4, 5, up), y: lerp(lerp(-10, 3, down), 6, up) },
    };
  }
  if (code === 4) {                              // PULL — anchor the feet, lean AWAY, haul in
    const set = ease01(clamp01(p / 0.24));
    const haul = pulse(clamp01((p - 0.22) / 0.56));
    return {
      ...s,
      tilt: s.tilt + set * 0.12 + haul * 0.22,     // weight going backwards
      bob: s.bob - set * 3 - haul * 3,
      neck: s.neck + haul * 0.05,
      footL: { x: -16 - set * 5, y: 0 }, footR: { x: 11 + set * 3, y: 0 },
      fistL: { x: lerp(-5, 26, set) - haul * 20, y: lerp(6, -12, set) + haul * 4 },
      fistR: { x: lerp(5, 31, set) - haul * 22, y: lerp(6, -15, set) + haul * 4 },
      adv: -haul * 4,
    };
  }
  if (code === 5) {                              // HOLD OUT — and go on holding
    // The one action here that does NOT return to standing. It arrives at the offer
    // and stays, with only the breath moving, so a scene can sit on u = 1 while the
    // other figure decides.
    const out = ease01(clamp01(p / 0.45));
    const settle = Math.sin(t * 1.3) * 0.5;
    return {
      ...s,
      tilt: s.tilt - out * 0.08, neck: s.neck - out * 0.03,
      fistL: { x: lerp(-5, 15, out), y: lerp(6, -10, out) + settle },
      fistR: { x: lerp(5, 27, out), y: lerp(6, -14, out) + settle },
    };
  }
  if (code === 6) {                              // PLACE HIGH — onto a shelf, forward not overhead
    // A figure cannot get a hand above its own crown: that needs ~35 of vertical
    // reach against 33, and anything aimed there lands inside the head disc. High
    // is therefore FORWARD-high, which is also how a real shelf is loaded.
    const up = ease01(clamp01(p / 0.42));
    const set = clamp01((p - 0.44) / 0.18);
    const back = ease01(clamp01((p - 0.64) / 0.36));
    return {
      ...s,
      bob: s.bob + up * 2.5 - back * 2.5,
      tilt: s.tilt - up * 0.06 + back * 0.06,
      neck: s.neck - up * 0.20 + back * 0.18,
      footL: { x: -6, y: 0 }, footR: { x: 6, y: -up * 2 },
      fistL: { x: lerp(-5, 18, up) + set * 2 - back * 20, y: lerp(6, -36, up) + back * 40 },
      fistR: { x: lerp(5, 25, up) + set * 3 - back * 24, y: lerp(6, -40, up) + back * 44 },
    };
  }
  if (code === 7) {                              // OPEN — grip, then swing it away on an arc
    const grip = ease01(clamp01(p / 0.26));
    const swing = ease01(clamp01((p - 0.26) / 0.54));
    const back = ease01(clamp01((p - 0.72) / 0.28));
    return {
      ...s,
      tilt: s.tilt - grip * 0.05 + swing * 0.14,
      bob: s.bob - swing * 1.5,
      footL: { x: -6, y: 0 }, footR: { x: 8 - swing * 9, y: 0 },
      fistL: { x: -5, y: 6 },
      // Out to the handle, then the hand travels back past the body as the door
      // comes with it — an arc, not a straight retreat.
      fistR: {
        x: lerp(5, 28, grip) - swing * 34 + back * 10,
        y: lerp(6, -16, grip) + swing * 6 + back * 10,
      },
      adv: -swing * 5,
    };
  }
  if (code === 8) {                              // CRANK — a hand going round and round
    const on = ease01(clamp01(p / 0.18));
    const off = ease01(clamp01((p - 0.84) / 0.16));
    const a = p * Math.PI * 2 * 2.5;             // two and a half turns
    const R = 9;
    return {
      ...s,
      tilt: s.tilt - on * 0.06 + off * 0.06,
      bob: s.bob + Math.sin(a) * 0.8,
      neck: s.neck + on * 0.06 - off * 0.06,
      fistL: { x: -5, y: 6 },
      fistR: {
        x: lerp(5, 24 + Math.cos(a) * R, on) - off * 19,
        y: lerp(6, -14 + Math.sin(a) * R, on) + off * 20,
      },
    };
  }
  return s;
}

// ── two figures, one action ──────────────────────────────────────────────────
//
// Nothing in the library coordinated two figures. A scene could pose each one and
// hope: a "handshake" was two figures both playing `give`, with their hands ending
// wherever their own bodies put them — usually not the same place, and never the
// same place once the two moved apart.
//
// The fix is that both figures aim at ONE STAGE POINT, the same way `gazeAt` aims
// at a prop. Everything below computes that point first and then poses both bodies
// from it, so the meeting is true by construction rather than by tuning.
//
// THE REACH LIMIT IS REAL. A hand gets about 30 units forward of the figure's own
// centre, so two figures meet only within roughly 60 (times k). Past that these
// clamp to what the arms can do and the hands genuinely do not touch — which is
// the honest picture, and better than stretching an arm to fake it. Use
// `canShakeHands` before staging one.

/** The facing each figure needs so the two look at one another. */
export function faceEachOther(xA: number, xB: number): { dirA: 1 | -1; dirB: 1 | -1 } {
  'worklet';
  const aLeft = xA <= xB;
  return { dirA: aLeft ? 1 : -1, dirB: aLeft ? -1 : 1 };
}

/**
 * The stage point midway between two figures, at a given height above the ground.
 * `h` is in rig units: 46 is about hand height for a handshake (the pelvis sits at
 * `U.standH` = 34, and a comfortably held hand is a dozen above that).
 */
export function betweenThem(pA: Placed, pB: Placed, h = 46): P2 {
  'worklet';
  return { x: (pA.x + pB.x) / 2, y: pA.groundY - h * pA.k };
}

/**
 * Whether two figures are close enough for their hands to actually meet.
 *
 * Derived rather than guessed, because the first version used a round fudge factor
 * and answered "no" at separations where the hands measurably DO touch.
 *
 * A point `h` above the ground is at local y = −(h − U.standH), the shoulder is at
 * local (3, −26), so the hand must climb |h − 60| on the way out. Only what is left
 * of the reach after that climb goes forward:
 *
 *     forward = sqrt(SAFE² − climb²) + 3        (the +3 is the shoulder's own offset)
 *
 * Two figures each contribute that. At the default handshake height it comes to
 * 30.1 each, so 60.2 at k = 1 — which matches measurement: at 60 apart the hands
 * meet exactly, at 64 they miss by 1.1, at 70 by 6.5.
 */
export function handSpan(p: Placed, h = 46): number {
  'worklet';
  const climb = Math.abs(h - 60);
  const flat = Math.sqrt(Math.max(0, SAFE * SAFE - climb * climb));
  return (flat + 3) * p.k;
}

export function canShakeHands(pA: Placed, pB: Placed, h = 46): boolean {
  'worklet';
  return Math.abs(pB.x - pA.x) <= handSpan(pA, h) + handSpan(pB, h);
}

/**
 * A handshake. Both hands travel to the same stage point, meet, shake, and return.
 *
 * Returns both stances, because the two bodies are one action: the shake is a
 * shared rhythm, and posing them independently gives two people pumping their own
 * arms near each other.
 */
export function handshake(
  t: number, u: number, pA: Placed, pB: Placed
): { a: Stance; b: Stance; met: P2 } {
  'worklet';
  const met = betweenThem(pA, pB, 46);
  const p = clamp01(u);
  const out = ease01(clamp01(p / 0.34));
  const shake = p > 0.34 && p < 0.74 ? Math.sin((p - 0.34) / 0.40 * Math.PI * 3) : 0;
  const back = ease01(clamp01((p - 0.74) / 0.26));
  const w = out * (1 - back);
  // The shake moves the MEETING POINT, so both hands ride it together and stay
  // joined. Moving each hand separately is what makes two figures look like they
  // are shaking at each other rather than with each other.
  const my = met.y + shake * 3.2 * pA.k;

  const base = (p0: Placed): Stance => {
    'worklet';
    const s = stand(t);
    return {
      ...s,
      tilt: s.tilt - 0.05 * w,
      neck: s.neck + 0.04 * w,
      footR: { x: s.footR.x + 4 * w, y: 0 },
    };
  };
  return {
    a: reachHandTo(base(pA), pA, 1, met.x, my, w),
    b: reachHandTo(base(pB), pB, 1, met.x, my, w),
    met: { x: met.x, y: my },
  };
}

/**
 * One figure hands an object to another, and the object's stage position comes
 * back with them — so the scene draws it and it is never out of a hand.
 *
 * `obj` is the giver's hand until the exchange, then the taker's. That midpoint is
 * the whole reason this returns three things instead of two: a scene that animates
 * the prop on its own timeline will always drift out of the grip on some device.
 */
export function passObject(
  t: number, u: number, giver: Placed, taker: Placed
): { a: Stance; b: Stance; obj: P2; handedOver: boolean } {
  'worklet';
  const met = betweenThem(giver, taker, 44);
  const p = clamp01(u);
  const offer = ease01(clamp01(p / 0.40));       // giver extends
  const reach = ease01(clamp01((p - 0.22) / 0.38)); // taker comes to meet it, later
  const done = clamp01((p - 0.60) / 0.40);       // both withdraw, object with the taker

  const g0 = stand(t);
  const gs: Stance = {
    ...g0,
    tilt: g0.tilt - 0.08 * offer * (1 - done),
    neck: g0.neck - 0.03 * offer,
  };
  const ts0 = stand(t);
  const ts: Stance = {
    ...ts0,
    tilt: ts0.tilt - 0.06 * reach,
    neck: ts0.neck - 0.02 * reach,
  };

  const a = reachHandTo(gs, giver, 1, met.x, met.y, offer * (1 - done));
  const b = reachHandTo(ts, taker, 1, met.x, met.y, reach * (1 - done * 0.55));
  // Before the hand-over the object is in the giver's hand; after, the taker's.
  // Reading it back off the solved hand — rather than tweening it separately —
  // is what guarantees it stays in the grip.
  const handedOver = p >= 0.60;
  return { a, b, obj: handedOver ? handAt(b, taker, 1) : handAt(a, giver, 1), handedOver };
}

/**
 * Two figures in conversation: each looks at the other's head, and whoever is
 * speaking carries the beat.
 *
 * `speaker` is 1 for A, −1 for B, 0 for neither. The listener does not go still —
 * a motionless listener reads as a prop — it keeps the small nod that says it is
 * receiving something.
 */
export function converse(
  sA: Stance, pA: Placed, sB: Stance, pB: Placed, speaker: number, t: number
): { a: Stance; b: Stance } {
  'worklet';
  const hA = headStage(sA, pA), hB = headStage(sB, pB);
  const aim = (s: Stance, p: Placed, target: P2): Stance => {
    'worklet';
    const l = local(target.x, target.y, p, s.bob);
    const el = Math.atan2(-(l.y + 49), Math.max(Math.abs(l.x), 12));
    const behind = l.x < 0 ? 0.45 : 1;
    let gz = -el * 0.5 * behind;
    gz = gz < -0.36 ? -0.36 : gz > 0.34 ? 0.34 : gz;
    return { ...s, neck: gz, tilt: s.tilt + gz * 0.10 };
  };
  const talk = Math.sin(t * 8.2) * 0.02;
  const listen = Math.sin(t * 1.7) * 0.012;
  const a0 = aim(sA, pA, hB), b0 = aim(sB, pB, hA);
  return {
    a: { ...a0, neck: a0.neck + (speaker > 0 ? talk : listen) },
    b: { ...b0, neck: b0.neck + (speaker < 0 ? talk : listen) },
  };
}

/**
 * Lean one figure toward another — agreement, conspiracy, pressure.
 *
 * The lean is applied as `tilt` only. It is tempting to also close the distance,
 * but figure-to-figure spacing is the scene's business: rig.ts's own note is that
 * two figures leaning toward each other are already noticeably closer at the head,
 * which is the read, and moving their feet as well overshoots into a collision.
 */
export function leanToward(s: Stance, p: Placed, other: Placed, amount = 1): Stance {
  'worklet';
  const toward = Math.sign(other.x - p.x) * p.dir;   // +1 if the other is in front
  const k = clamp01(amount) * 0.16 * toward;
  return { ...s, tilt: s.tilt - k, neck: s.neck + k * 0.4 };
}

/**
 * A settled two-figure arrangement, for beats that are about the relationship
 * rather than an action.
 *
 * 0 side by side, both facing out · 1 face to face, level · 2 one seated and one
 * standing over them · 3 back to back · 4 one leading, one following.
 */
export function pairPosture(code: number, t: number): { a: Stance; b: Stance } {
  'worklet';
  // The clocks are OFFSET. Two figures on the same `t` breathe and shift in
  // lockstep, and rig.ts's note is exact about what that looks like: one figure
  // and its mirror, rather than two people.
  const ta = t, tb = t + 4.3;
  if (code === 1) return { a: stand(ta), b: stand(tb) };
  if (code === 2) return { a: postureHold(4, ta), b: stand(tb) };
  if (code === 3) return { a: stand(ta), b: stand(tb) };
  if (code === 4) return { a: stand(ta), b: postureHold(6, tb) };
  return { a: stand(ta), b: stand(tb) };
}
