// ─────────────────────────────────────────────────────────────────────────────
// THE LAWN-CHAIR ROUTINE — choreography as a pure function of time.
//
// The owner, 2026-09-25: *"grab a chair out of noware, like a lawn chair, set it up,
// and then sit down, mabye fidget his hand and arms just a little, maybe pull out
// some coffee or tea, crossing his legs sometimes, and then looking down sometimes
// when words are being read out, or looking up sometimes as well."*
//
// Three phases, one per kind of beat in a chair stretch (spec, Stage 4):
//
//   SETUP    reach behind the back → the folded chair comes out to his side → it is
//            flicked open → swung round behind him and set down with a small bounce
//            → he sits back into it.
//   SEATED   variations on sitting: legs crossed, the mug brought out from behind
//            the chair and sipped, a look up or down, fingers drumming the armrest.
//   PUTAWAY  the mug goes back, the legs uncross, he stands, takes the chair by its
//            back, swings it to his side, folds it and tucks it away behind him.
//
// He faces the same way throughout, so the routine never argues with the facing the
// scene staged. Everything is a function of the phase clock `t` (seconds into the
// beat), so the same numbers draw the sheet in plain Node and drive the app.
//
// Group AL holds here too: the pelvis moves only because he sits or stands — never
// on a clock. The drumming, the steam and the seat shift are hands, neck and lean.
// ─────────────────────────────────────────────────────────────────────────────
import { type Stance, clamp01, ease01, lerp, mixStance, stand, U } from './rig';

type P = { x: number; y: number };

/** What the drawing layer needs besides the stance. Chair coordinates are GROUND
 *  frame relative to the figure: x along his facing from the point under his pelvis,
 *  y down positive, the ground at 0 (lawnChair.ts's own frame). */
export interface ChairFrame {
  s: Stance;
  chair: { open: number; x: number; y: number; on: number; front: number };
  mug: { on: number; steam: number };
}

// Worklets, all of them: a plain helper called from a worklet is a RemoteFunction on
// the UI thread and throws in release (§17 rule 6) — invisible in a browser.
function seg(t: number, a: number, b: number): number {
  'worklet';
  return ease01(clamp01((t - a) / (b - a)));
}
function lerpP(a: P, b: P, u: number): P {
  'worklet';
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) };
}

/** The seated pelvis drop: from standH above the ground to the seat (lawnChair SEAT_PELVIS_Y −20). */
const SEAT_DROP = -(U.standH - 20);

/** Sitting in the chair, at rest: leaning into the back, feet flat, hands in the lap. */
export function seatedStance(t: number): Stance {
  'worklet';
  const s = stand(t);
  return {
    ...s, tilt: 0.1, neck: -0.02, bob: s.bob + SEAT_DROP,
    footL: { x: 13, y: 0 }, footR: { x: 17, y: 0 },
    fistL: { x: 6, y: -9 }, fistR: { x: 9, y: -9 },
  };
}

/** Where the hand holds the folded package, and the package's origin from the hand. */
const HOLD_HAND: P = { x: 19, y: -4 };
const HELD_OFF: P = { x: 15, y: 36 };           // chair origin = hand + this (ground frame)
const BEHIND_HAND: P = { x: -14, y: 4 };        // reaching behind his own back
const BACK_GRIP: P = { x: -12, y: -18 };        // the chair's back top, from the pelvis, set up
/** How far the hand rises while the chair opens: 52 open − 36 folded. */
const LIFT_OPEN = 16;
/** How far below the straight line the hand passes while it carries the chair round him. */
const ARM_DIP = 10;

/**
 * THE HAND GOES ROUND THE SHOULDER, NEVER THROUGH IT.
 *
 * Every carry in this routine crosses the body — behind the back, up to the lips,
 * round to the chair's top — and a straight line between two of those points can pass
 * a few units from the shoulder. There the arm folds flat, and two-bone IK swings the
 * elbow right round in a handful of frames: measured on the first replay, the elbow
 * travelled 25 units in 0.2s, which is the "really fast movement" the owner asked to
 * be rid of in the same note. Pushing the target out to a ring about the shoulder is
 * continuous, so the path simply slides round the ring instead.
 */
const SHOULDER_CLEAR = 16;
function roundShoulder(s: Stance): Stance {
  'worklet';
  const sx = 1 - Math.sin(s.tilt) * 26;
  const sy = -Math.cos(s.tilt) * 26;
  const dx = s.fistR.x - sx;
  const dy = s.fistR.y - sy;
  const d = Math.hypot(dx, dy);
  if (d >= SHOULDER_CLEAR || d < 0.001) return s;
  const k = SHOULDER_CLEAR / d;
  return { ...s, fistR: { x: sx + dx * k, y: sy + dy * k } };
}

/** Pelvis-frame hand → ground-frame point (the pelvis stands `standH` above the ground). */
function toGround(h: P): P {
  'worklet';
  return { x: h.x, y: h.y - U.standH };
}

// ── SETUP ────────────────────────────────────────────────────────────────────
export const SETUP_S = 3.7;
export function setupAt(t: number, life: number): ChairFrame {
  'worklet';
  const s0 = stand(life);
  const reach = seg(t, 0, 0.45);                 // hand goes behind the back
  const pull = seg(t, 0.45, 0.95);               // …and brings the package round to his side
  const flick = seg(t, 1.0, 1.45);               // flicked open
  const swing = seg(t, 1.5, 2.35);               // swung round behind him, set down
  const sit = seg(t, 2.6, 3.5);                  // he sits back into it

  // THE HAND: behind the back, then out at his side, then back to the chair's top.
  let hand = lerpP({ x: s0.fistR.x, y: s0.fistR.y }, BEHIND_HAND, reach);
  hand = lerpP(hand, HOLD_HAND, pull);
  // AND HE LIFTS IT AS IT OPENS. Open, the chair stands 52 tall where the package
  // was 36 below his grip, so a hand that stayed put sank its legs 14 units into
  // the floor — measured on the curves, invisible on the approved sheet's small
  // cells. Raising the hand by the difference keeps the feet on the ground line.
  hand = { x: hand.x, y: hand.y - LIFT_OPEN * flick };
  hand = lerpP(hand, BACK_GRIP, swing);
  // THE ARM SWINGS LOW AS IT CROSSES HIM, which is what a person carrying a chair
  // round their body does — and a straight carry at shoulder height folds the arm
  // flat and throws the elbow over the top in a handful of frames (check:chair §5).
  // The chair keeps the undipped path, so it does not sag with the elbow.
  const carried = hand;
  hand = { x: hand.x, y: hand.y + ARM_DIP * Math.sin(Math.PI * swing) };
  // Once it is down he lets go on the way into the seat.
  const stood: Stance = { ...s0, fistR: hand, neck: s0.neck + 0.12 * (pull - swing) };
  const s = sit > 0 ? mixStance(stood, seatedStance(life), sit) : stood;

  // THE CHAIR: hidden behind him until the pull brings it out, then where the hand is.
  const held = toGround(carried);
  const heldOrigin = { x: held.x + lerp(HELD_OFF.x, 22, flick), y: held.y + lerp(HELD_OFF.y, 52, flick) };
  // Swung down onto the ground behind him: an arc up and over, then a small bounce.
  const arc = -8 * Math.sin(Math.PI * swing);
  const land = t > 2.35 ? Math.sin(clamp01((t - 2.35) / 0.28) * Math.PI) * -2.2 : 0;
  const x = lerp(heldOrigin.x, 0, swing);
  // NEVER BELOW THE FLOOR: reached for behind his back, the package's foot hangs
  // lower than the ground line, so it rides along the ground instead.
  const y = Math.min(0, lerp(heldOrigin.y, 0, swing) + arc + land);
  const on = t < 0.45 ? 0 : clamp01((t - 0.45) / 0.08);
  return {
    s,
    chair: { open: flick, x, y, on, front: sit },
    mug: { on: 0, steam: 0 },
  };
}

// ── SEATED ───────────────────────────────────────────────────────────────────
/** What a seated beat does. The generator deals these so a stretch varies. */
export const SEAT_CROSS = 1;     // cross the legs, look up
export const SEAT_MUG = 2;       // bring the mug out and sip
export const SEAT_DRUM = 3;      // fingers on the armrest, a shift in the seat, look down
export const SEAT_SIP = 4;       // already holding the mug: sip, lower, look up
export const SEAT_REST = 5;      // a question beat: just sitting while the reader answers

const CROSSED = { footL: { x: 12, y: 0 }, footR: { x: 25, y: -18 } };
const MUG_CHEST: P = { x: 14, y: -14 };
const MUG_LIPS: P = { x: 20, y: -37 };
const MUG_BEHIND: P = { x: -10, y: 0 };

export function seatedAt(kind: number, t: number, crossedIn: number, mugIn: number, life: number): ChairFrame {
  'worklet';
  let s = seatedStance(life);
  let crossed = crossedIn;
  let mug = mugIn;
  let look = 0;

  if (kind === SEAT_CROSS) {
    crossed = Math.max(crossedIn, seg(t, 0.4, 1.0));
    look = seg(t, 1.8, 2.3) - seg(t, 3.6, 4.1);
  }
  if (kind === SEAT_DRUM) {
    look = -(seg(t, 2.2, 2.7) - seg(t, 3.8, 4.3));
  }
  // The legs, crossed as far as the beat has got.
  if (crossed > 0) {
    s = {
      ...s,
      footL: { x: lerp(s.footL.x, CROSSED.footL.x, crossed), y: s.footL.y },
      footR: { x: lerp(s.footR.x, CROSSED.footR.x, crossed), y: lerp(s.footR.y, CROSSED.footR.y, crossed) },
    };
  }

  // THE MUG: out from behind the chair, up to the chest, a sip, back to the chest.
  let hand: P = { x: s.fistR.x, y: s.fistR.y };
  if (kind === SEAT_MUG && mugIn < 1) {
    const back = seg(t, 0.3, 0.7);
    const out = seg(t, 0.75, 1.25);
    hand = lerpP(lerpP(hand, MUG_BEHIND, back), MUG_CHEST, out);
    mug = t >= 0.72 ? 1 : 0;
  } else if (mug > 0) {
    hand = MUG_CHEST;
  }
  if (mug > 0 && (kind === SEAT_MUG || kind === SEAT_SIP)) {
    const t0 = kind === SEAT_MUG ? 1.9 : 0.6;
    const up = seg(t, t0, t0 + 0.5) - seg(t, t0 + 1.4, t0 + 1.9);
    hand = lerpP(hand, MUG_LIPS, up);
    s = { ...s, neck: s.neck + 0.12 * up };
    if (kind === SEAT_SIP) look = seg(t, 2.6, 3.0) - seg(t, 3.6, 4.0);
  }
  s = { ...s, fistR: hand };

  // FIDGET: fingers drumming the armrest, and the weight shifting in the seat.
  // The FAR hand is behind his body, so a fidget there is invisible — the first
  // sheet proved it. With the mug in the near hand, the crossed foot jiggles instead;
  // without it, the near hand drums the near armrest where it can be seen.
  if (kind === SEAT_DRUM) {
    // EVERY PART STARTS AND ENDS ON THE SEATED REST, so a tap between two parts is
    // never a jump: the hand goes TO the armrest and comes back, the fidget swells in
    // and dies away, rather than any of it switching on at t 0.
    const busy = seg(t, 0, 0.35) * (1 - seg(t, 2.0, 2.4));
    const drum = Math.max(0, Math.sin(t * 13)) * 2.2 * busy;
    const jig = Math.sin(t * 7.5) * 3 * busy;
    s = mug > 0
      ? { ...s, footR: { x: s.footR.x + jig * 0.4 * crossed, y: s.footR.y - Math.abs(jig) * crossed } }
      : { ...s, fistR: lerpP(hand, { x: 11, y: -12 - drum }, busy) };
    s = { ...s, tilt: s.tilt + Math.sin(life * 0.9) * 0.05 * busy };
  }

  // A LOOK from the chair: the head carries it clear of the shoulders (N20).
  if (look) s = { ...s, neck: s.neck + (look > 0 ? 1.1 : -1.2) * Math.abs(look), tilt: s.tilt + 0.1 * look };

  return {
    s,
    chair: { open: 1, x: 0, y: 0, on: 1, front: 1 },
    mug: { on: mug, steam: mug },
  };
}

// ── PUTAWAY ──────────────────────────────────────────────────────────────────
export const PUTAWAY_S = 3.85;
export function putawayAt(t: number, crossedIn: number, mugIn: number, life: number): ChairFrame {
  'worklet';
  const away = seg(t, 0, 0.4);                   // mug hand goes behind the chair
  const uncross = seg(t, 0.3, 0.7);
  const rise = seg(t, 0.75, 1.55);               // he stands
  const grab = seg(t, 1.6, 2.0);                 // takes the chair by its back
  const lift = seg(t, 2.0, 2.75);                // swings it to his side…
  const fold = seg(t, 2.3, 3.0);                 // …folding it as it comes
  const tuck = seg(t, 3.05, 3.5);                // and tucks it away behind him

  let seated = seatedStance(life);
  const crossed = crossedIn * (1 - uncross);
  if (crossed > 0) {
    seated = {
      ...seated,
      footL: { x: lerp(seated.footL.x, CROSSED.footL.x, crossed), y: 0 },
      footR: { x: lerp(seated.footR.x, CROSSED.footR.x, crossed), y: lerp(0, CROSSED.footR.y, crossed) },
    };
  }
  let hand: P = mugIn > 0 ? lerpP(MUG_CHEST, MUG_BEHIND, away) : { x: seated.fistR.x, y: seated.fistR.y };
  seated = { ...seated, fistR: hand };
  const s0 = stand(life);
  let s = rise > 0 ? mixStance(seated, s0, rise) : seated;
  hand = lerpP({ x: s.fistR.x, y: s.fistR.y }, BACK_GRIP, grab);
  // Swung up to his side held high enough that the OPEN chair's feet clear the floor
  // (the setup's LIFT_OPEN, read backwards), lowered as it folds, then tucked away.
  hand = lerpP(hand, { x: HOLD_HAND.x, y: HOLD_HAND.y - LIFT_OPEN * (1 - fold) }, lift);
  hand = lerpP(hand, BEHIND_HAND, tuck);
  const grip = hand;
  hand = { x: hand.x, y: hand.y + ARM_DIP * Math.sin(Math.PI * lift) };
  hand = lerpP(hand, { x: s0.fistR.x, y: s0.fistR.y }, seg(t, 3.45, 3.8));
  s = { ...s, fistR: hand };

  // THE CHAIR FOLLOWS THE HAND once it is off the ground, so it can never part
  // company with the grip holding it.
  const hg = toGround(grip);
  const arc = -8 * Math.sin(Math.PI * lift);
  const cx = lerp(0, hg.x + lerp(22, HELD_OFF.x, fold), lift);
  const cy = Math.min(0, lerp(0, hg.y + lerp(52, HELD_OFF.y, fold), lift) + arc);
  return {
    s,
    chair: { open: 1 - fold, x: cx, y: cy, on: 1 - clamp01((t - 3.45) / 0.08), front: 1 - rise },
    mug: { on: mugIn > 0 && t < 0.38 ? 1 : 0, steam: 0 },
  };
}

// ── A SIP STANDING UP — the lighter set piece for the lessons with no chair ───
export const MUG_STAND_S = 4.5;
const STAND_CHEST: P = { x: 13, y: -22 };
export function mugStandAt(t: number, life: number): ChairFrame {
  'worklet';
  const s0 = stand(life);
  const back = seg(t, 0.25, 0.65);
  const out = seg(t, 0.72, 1.35);
  const up = seg(t, 1.6, 2.1) - seg(t, 2.9, 3.4);
  const away = seg(t, 3.5, 4.1);
  const home = seg(t, 4.1, 4.45);
  let hand: P = lerpP({ x: s0.fistR.x, y: s0.fistR.y }, BEHIND_HAND, back);
  hand = lerpP(hand, STAND_CHEST, out);
  hand = lerpP(hand, MUG_LIPS, up);
  hand = lerpP(hand, BEHIND_HAND, away);
  hand = lerpP(hand, { x: s0.fistR.x, y: s0.fistR.y }, home);
  const on = t >= 0.68 && t < 4.07 ? 1 : 0;
  return {
    s: { ...s0, fistR: hand, neck: s0.neck + 0.12 * up },
    chair: { open: 0, x: 0, y: 0, on: 0, front: 0 },
    mug: { on, steam: on },
  };
}

/** A beat's part in a set piece — what `data/lessonChair.ts` stores, per beat. */
export const CH_SETUP = 10;
export const CH_PUTAWAY = 11;
export const CH_MUG_STAND = 12;

/**
 * How long each part takes to play through. A seated part runs to the end of
 * whatever it does and then HOLDS there (every `seg` has saturated), so a line
 * longer than its part leaves him sitting, idling on the `life` clock.
 */
export function partLen(kind: number): number {
  'worklet';
  if (kind === CH_SETUP) return SETUP_S;
  if (kind === CH_PUTAWAY) return PUTAWAY_S;
  if (kind === CH_MUG_STAND) return MUG_STAND_S;
  if (kind === SEAT_CROSS) return 4.1;
  if (kind === SEAT_MUG) return 3.8;
  if (kind === SEAT_SIP) return 4.0;
  if (kind === SEAT_REST) return 0.5;
  return 4.3;
}

/**
 * THE ONE ENTRY POINT: the frame for a part of `kind`, `t` seconds into it.
 * `crossedIn` and `mugIn` are what the stretch has already done by this part (legs
 * crossed, mug in hand), which the generator works out and stores. `life` is the
 * scene's own clock, for the idle drift of a man standing or sitting — separate
 * from `t` so that the drift runs straight through a change of part rather than
 * restarting at every tap (group L).
 */
export function chairFrame(kind: number, t: number, crossedIn: number, mugIn: number, life: number): ChairFrame {
  'worklet';
  const f = kind === CH_SETUP ? setupAt(t, life)
    : kind === CH_PUTAWAY ? putawayAt(t, crossedIn, mugIn, life)
      : kind === CH_MUG_STAND ? mugStandAt(t, life)
        : seatedAt(kind, t, crossedIn, mugIn, life);
  return { ...f, s: roundShoulder(f.s) };
}
