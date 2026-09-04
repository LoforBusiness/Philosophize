import {
  WALK, clamp01, ease01, lerp, mixStance, strideStance,
  type Stance,
} from '@/components/lesson/cinematic/rig';
import { emoteAny, emoteAnyLive } from '@/components/lesson/cinematic/moves';
import {
  T_MARCH, T_STOP, T_TURN, SPEAK_T0, T_FADE, T_EXIT, T_BEAT, T_WINDUP, T_BOLT, T_GONE,
  BEATS,
  CX,
} from './rig';

// ─────────────────────────────────────────────────────────────────────────────
// THE HOST, DRIVEN BY THE LESSON RIG.
//
// A reader on the first-run intro: "the walking onto the screen is kinda bad.
// It's not very smooth. It's a little janky … it's like when the stickman walks
// on the screen, he has to reposition himself. The actual stickman in lessons
// looks really good, and I want it to look like that."
//
// They were describing a fork. `components/welcome/host.ts` was a SECOND figure
// solver — its own gait, its own foot-lock, its own settle, its own IK — written
// before the lesson rig learned what it now knows, and never given any of it.
// Everything §17 lists as hard-won lives in components/lesson/cinematic/rig.ts
// and none of it reached here:
//
//   · `strideStance(..., fromStand)`, which exists because a walk that begins at
//     cycle phase 0 starts mid-stance with both feet planted a full stride apart
//     and blends out of standing by reintroducing the body's motion — measured at
//     13 world units of slide per departure. That slide IS "he has to reposition
//     himself".
//   · SETTLE_UNITS as a fifth of a STRIDE rather than an absolute, so the arrival
//     has the same distance to absorb whatever the gait.
//   · "planted" as a BRANCH of `footTarget` returning y exactly 0, rather than a
//     distance threshold that cannot tell a foot that is down from one still
//     coming down.
//   · `gaitVary`, so he is not pacing one identical repeating cycle.
//
// So this file does not re-implement any of it. It is a TIMELINE — where he is
// and what he is doing at time t — and every pose comes out of the lesson rig
// and the lesson move library, which is the whole of why he now walks the way he
// walks in a lesson.
//
// ── THE SHAPE OF THE PERFORMANCE ────────────────────────────────────────────
//
//   0 → T_MARCH            walks on from off-stage right
//   → +T_STOP              the weight arrives and settles
//   → +T_TURN              turns out of profile to face the audience
//   SPEAK_T0 → T_FADE      talks, one gesture per beat
//   T_EXIT → T_GONE        turns, winds up, and leaves
//
// Kept identical to the old timeline on purpose: the words, the board cues and
// the bubble are all cut against these constants, and this change is about how
// he MOVES, not about when.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HOW BIG HE IS, and it lives here because the STRIDE DEPENDS ON IT.
 *
 * The bespoke rig drew him at 3.0 and a reader said he was "a little bit big";
 * 2.05 is a third down, which on a 400x800 stage puts his crown about 212 units
 * above the ground instead of 315 and leaves real paper between his head and the
 * speech bubble.
 *
 * ── THE UNIT BUG THIS CONSTANT EXISTS TO PREVENT ───────────────────────────
 *
 * `strideStance` counter-translates a planted foot in RIG units: over one stance
 * the foot's local x travels −S while the body advances +S, and the two cancel
 * exactly. But `solve` multiplies the foot offset by `k` on its way to the
 * stage, so the body has to advance S·k STAGE units for the cancellation to
 * hold.
 *
 * Every cinematic lesson runs at K_FIG = 1.0, where rig units and stage units
 * are the same number and the distinction cannot show. Here k is 2.05, and
 * handing `strideStance` the stage-space endpoints told it to lay out a stride
 * 2.55× longer than the one the body was walking. Measured at 60fps: the
 * planted foot slid 3.99 units EVERY FRAME through the march — the whole of
 * "he has to reposition himself", reproduced faithfully in a new place.
 *
 * So the journey is converted to rig units for the stride and left in stage
 * units for the body. `stageToRig` is the only place that conversion happens.
 */
export const K_HOST = 2.05;

/**
 * THE LINE HE STANDS ON, and it is NOT the stage's ground.
 *
 * `BUB.bottom` is pinned at 374 because the board's top edge is 386 — the speech
 * bubble grows upward from a fixed root so it can never collide with the chart
 * beside it. That pin means the layout needs his HEAD at roughly y 430–490: the
 * tail is drawn from the bubble to his crown, so a head much below that turns it
 * from a speech tail into a needle reaching down the screen.
 *
 * Which is exactly what shrinking him did. At the old k = 3.0 on the stage's own
 * ground of 760 his crown sat at ~451 and the tail was ~17 units. At k = 2.05 the
 * crown drops to 548 and the tail stretches to 133 — the figure got better and
 * the composition got worse, and only a screenshot showed it.
 *
 * So he stands on his own line, 70 units above the stage's, which puts the crown
 * back at ~479 and the tail at ~64 — near the 60 the tail path is drawn at.
 * Nothing else uses the stage ground here: there is no ground line drawn on this
 * screen, he simply stands on paper.
 */
export const FIG_GROUND = 690;
const stageToRig = (x: number) => {
  'worklet';
  return x / K_HOST;
};

/**
 * WHERE HE STANDS, in STAGE units, and it is not a free choice.
 *
 * `CX` is 316 — right of centre, because the board occupies x 14…246 on the LEFT
 * and the layout note in ./rig reserves x 256…376 for him with nothing allowed to
 * cross 248. Standing him anywhere else puts a man on top of a chart: at 150 he
 * was drawn through the lesson card and the speech tail became a spike reaching
 * across half the screen to find his head.
 */
export const X_OFF = 520;
/** The mark he talks from — the column the layout keeps clear for him. */
export const X_MARK = CX;
/**
 * Off-stage right again. He leaves the way he came, because the other way is
 * through the board.
 *
 * 470, NOT 560, AND THE OLD NUMBER IS MOST OF WHY THE EXIT READ AS A BLUR.
 * The stage is 400 wide. He is invisible somewhere past x 430, so of the 244
 * units the old exit travelled, **more than half happened where nobody could see
 * it** — and the whole distance still had to fit inside T_BOLT, which is what
 * forced the speed to 530 stage units a second against the march's 89. Six times
 * faster leaving than arriving, and the ankle moved 23 units between frames at
 * 60fps: not a sprint, a smear.
 *
 * Clearing the stage is the entire requirement. 470 puts his pelvis 70 units past
 * the edge, which is a whole figure-width of margin, and hands the time back to
 * the part of the run a reader can actually watch.
 */
export const X_AWAY = 470;

/**
 * THE GESTURE FOR EACH BEAT, as codes into the lesson move library.
 *
 * Held actions are `99 + n` (see `emoteAny`), so:
 *   167  talking with the hands — the narration loop, and the default
 *   168  counting the points
 *   178  shrug
 *   183  make the point (three chops on the beat)
 *   172  present / offer — an open hand toward the audience
 *
 * The old intro drove hand TARGETS directly from four named gestures. Codes are
 * better for the same reason the lessons use them: a gesture is a whole-body
 * attitude, not two hand positions, and the library already carries ninety of
 * them with the arm arc, the weight shift and the head all agreeing.
 */
const GESTURE: Record<string, number> = {
  point: 183,
  shrug: 178,
  open: 172,
  emphasize: 168,
};
/** What he does while a line has no gesture of its own. */
const TALK = 167;

/**
 * The beat covering `t`, AND the one before it.
 *
 * Both, because a gesture change is a discontinuity unless something blends
 * across it. §17 group L is the general form: "anything driven by `bt` is
 * discontinuous at a beat change, because `bt` is." Measured here before it was
 * fixed — a single frame in which a wrist moved 85 units, at exactly the instant
 * one line handed over to the next.
 *
 * The lessons solve this with `useHeld`/`carryFrom` in cinematicKit, which holds
 * the last rendered pose in a shared value. That cannot work here and should not:
 * `hostAtRig` is a pure function of `t`, which is what lets the intro jump its
 * own clock to catch up after a slow boot. So continuity is by CONSTRUCTION —
 * the previous beat's gesture keeps running, and the new one fades over it.
 */
function beatAt(t: number): { code: number; t0: number; prev: number; prevT0: number } {
  'worklet';
  let code = TALK;
  let t0 = SPEAK_T0;
  let prev = TALK;
  let prevT0 = SPEAK_T0;
  for (let i = 0; i < BEATS.length; i++) {
    const b = BEATS[i];
    if (t >= b.t) {
      prev = code;
      prevT0 = t0;
      t0 = b.t;
      code = b.gesture ? (GESTURE[b.gesture] ?? TALK) : TALK;
    }
  }
  return { code, t0, prev, prevT0 };
}

/** How long one gesture takes to give way to the next. */
const BLEND = 0.38;

/**
 * HE WAS TOO STILL WHILE TALKING, AND THE REASON IS IN THE CODES.
 *
 * Six of the ten lines carry no gesture of their own, so they all run TALK — and
 * every code at 100+ is an ACTION, which `emoteAnyLive` plays once over
 * PLAY_SECONDS (1.5s) and then HOLDS. A line lasts about three seconds. So he
 * gestured for the first half of each line and then stood still for the rest of
 * it, ten times over.
 *
 * Act 68 does keep a slow hand turnover going underneath, but at ±7 units it is
 * a breath rather than speech.
 *
 * THIS DOES NOT TOUCH THE ACTION. Act 68 is the narration hold for a hundred and
 * fifty cinematic lessons, and widening it there would restage every one of them
 * — the same trap the road gaits hit when a shared stride table was retuned for
 * one caller. The overlay is the HOST's alone, applied after the blend.
 *
 * Two sine pairs at incommensurable rates (1.15 and 0.83, offset by 2.1 and 1.4)
 * so the hands never fall into lockstep and the cycle does not visibly repeat
 * across half a minute. It stays a pure function of `t`, which is what lets the
 * intro jump its own clock after a slow boot and still be continuous.
 */
function withSpeechLife(s: Stance, t: number): Stance {
  'worklet';
  const a = t * 1.15, b = t * 0.83 + 2.1, c = t * 0.61 + 1.4;
  const la = Math.sin(a), lb = Math.sin(b), lc = Math.sin(c);
  // Moderate on purpose: the fists are IK targets, and a hand thrown past the
  // arm's reach is clamped by the solver, which reads as a stiff arm rather than
  // a big gesture. ±10 across and ±7 up roughly triples the travel act 68 has on
  // its own while staying inside the reach.
  return {
    ...s,
    neck: s.neck + la * 0.018,
    tilt: s.tilt + lb * 0.012,
    fistL: { x: s.fistL.x + la * 10, y: s.fistL.y + lc * 7 },
    fistR: { x: s.fistR.x + lb * 10, y: s.fistR.y + la * 7 },
  };
}

/** The talking pose at `t`, continuous across every beat boundary. */
function talkStance(t: number): Stance {
  'worklet';
  const b = beatAt(t);
  const from = emoteAnyLive(b.prev, t, t - b.prevT0);
  const to = emoteAnyLive(b.code, t, t - b.t0);
  return withSpeechLife(mixStance(from, to, ease01(clamp01((t - b.t0) / BLEND))), t);
}

export interface HostFrame {
  stance: Stance;
  /** Stage x of the pelvis. */
  x: number;
  /** +1 faces right, −1 faces left. Eased through zero, never flipped (group L). */
  dir: number;
  /** 0 while he is off stage entirely. */
  vis: number;
}

const T_STOOD = T_MARCH + T_STOP;
const T_FACING = T_STOOD + T_TURN;
const T_WIND_END = T_EXIT + T_BEAT + T_WINDUP;
/** How far through the shared exit journey the legs have "run" by the end of the
 *  wind-up. The bolt picks the cycle up here, so the feet never restart. */
const WIND_TR = 0.35;

/**
 * WHERE THE EXIT JOURNEY NOTIONALLY STARTS, and it is not where he is standing.
 *
 * `strideStance`'s own docstring states the contract in one line — *"the stride
 * follows the body"* — and it is exact: over one stance the foot's local x
 * travels −S while the body advances +S, so a planted foot holds still ONLY if
 * the body is at `lerp(x0, x1, tr)` for the same `tr` the stride was handed.
 *
 * The bolt broke that. It passed `carried` (0.35 → 1) to a journey
 * X_MARK → X_AWAY while putting the body at `lerp(X_MARK, X_AWAY, tr)` for a
 * `tr` running 0 → 1 — two different fractions of the same journey. Measured at
 * 60fps, a foot the pose called PLANTED slid **10.9 stage units in a single
 * frame**, which is the skate the rig's docstring promises cannot happen.
 *
 * The fix is to pick the journey so that the two agree. Solving
 * `lerp(X_LAUNCH, X_AWAY, WIND_TR) === X_MARK` for the start point means the
 * wind-up's 0.35 is spent exactly where he is standing, and the bolt's remaining
 * 0.65 covers the real distance to the wing. Derived rather than typed, so
 * moving the mark or the exit cannot put the slide back.
 */
const X_LAUNCH = (X_MARK - WIND_TR * X_AWAY) / (1 - WIND_TR);

/**
 * THE LAUNCH CURVE, and its first coefficient is not a taste.
 *
 * The bolt used to advance `carried` linearly, so the legs left the wind-up at
 * one rate and the body went from a dead stop to full speed between two frames:
 * 19,096 stage units per second squared, which is a teleport with a run cycle
 * playing over it.
 *
 * Easing both together keeps the contract above (they share one `carried`, so
 * there is still no slide) and gives him a real acceleration — but an ease that
 * starts at zero would STALL the legs at the handover, because the wind-up's
 * cycle is already turning at `WIND_TR / T_WINDUP` journey-fractions a second.
 *
 * So the curve starts at exactly that rate and accelerates from there:
 *
 *     f(u) = c·u + (1 − c)·u²      f(0)=0, f(1)=1, f′(0)=c, f′ rising
 *
 * with `c` solved so `f′(0)` reproduces the wind-up's rate. The legs never
 * change speed at the seam; the body gathers pace under them.
 */
const LAUNCH_C = ((WIND_TR / T_WINDUP) * T_BOLT) / (1 - WIND_TR);

export function hostAtRig(t: number): HostFrame {
  'worklet';
  // ── 1 · the march on ──────────────────────────────────────────────────────
  //
  // `strideStance` with the journey's real endpoints, so the step phase is
  // locked to DISTANCE TRAVELLED rather than to elapsed time. That is what makes
  // the feet stay on the ground: a foot planted at 40% of the span is planted at
  // 40% of the span no matter how the easing distributes it over the seconds.
  if (t < T_STOOD) {
    // Decelerating into the mark. `ease01` is smoothstep — it arrives with the
    // speed already gone, which is what the old version faked with a separate
    // "the weight arrives" phase after the walk had stopped.
    const tr = ease01(clamp01(t / T_MARCH));
    const stood = emoteAny(0, t);
    const walked = strideStance(stageToRig(X_OFF), stageToRig(X_MARK), stood, tr, WALK);
    // ── AND THEN HE STOPPED DEAD, WHICH NOTHING ALIVE DOES ──────────────────
    //
    // `tr` is clamped, so for the whole of T_STOP it sits at 1 and
    // `strideStance` returns one fixed arrival pose. Replayed at 60fps that is
    // **0.00 units of movement per frame for twenty-two frames** — the only
    // completely still stretch in the intro, landing between the walk and the
    // turn, which is exactly where a reader reports it feeling stiff.
    //
    // The walk is a pure function of distance and the distance has run out, so
    // there is nothing left in it to move him. The breath has to come from
    // somewhere else: `withSpeechLife` is the overlay the talking phase already
    // uses, at a third strength here because he is standing rather than
    // speaking. It costs no new machinery and keeps him the same person.
    if (t <= T_MARCH) return { stance: walked, x: lerp(X_OFF, X_MARK, tr), dir: -1, vis: 1 };
    const settled = clamp01((t - T_MARCH) / T_STOP);
    return {
      stance: mixStance(walked, withSpeechLife(walked, t), 0.34 * ease01(settled)),
      x: X_MARK,
      dir: -1,
      vis: 1,
    };
  }

  // ── 2 · the settle ────────────────────────────────────────────────────────
  //
  // HE DOES NOT TURN TO FACE YOU, and that is a consequence of using the lesson
  // rig rather than an oversight. That rig draws a PROFILE figure — `dir` is
  // which way he faces along x, and there is no front-on pose in it. The old
  // bespoke solver had a `face` parameter that blended hip and shoulder widths to
  // fake one, which is a third of why it existed at all.
  //
  // Facing left is the better staging anyway: the board he is presenting is on
  // his left, so he is turned toward the thing he is talking about instead of
  // away from it, and a hundred lessons have taught the reader to read this
  // figure in profile.
  if (t < T_FACING) {
    const u = ease01(clamp01((t - T_STOOD) / T_TURN));
    return {
      // …into the pose the talking phase holds on its first frame, not into a
      // fresh gesture at bt 0 — the two are not the same pose.
      stance: mixStance(emoteAny(0, t), talkStance(T_FACING), u),
      x: X_MARK,
      dir: -1,
      vis: 1,
    };
  }

  // ── 3 · the talking ───────────────────────────────────────────────────────
  if (t < T_EXIT) {
    return { stance: talkStance(t), x: X_MARK, dir: -1, vis: 1 };
  }

  // ── 4 · the beat before he goes, and the wind-up ──────────────────────────
  //
  // He stands in the last line, turns, spins the legs going nowhere, and bolts.
  //
  // The wind-up asks `strideStance` for a long journey and then does not move
  // `x`: the step cycle is driven by DISTANCE, so feeding it distance while the
  // pelvis stays put is precisely legs-going-nowhere, and it costs no special
  // case in the rig. (`travelStance` would only forward to the same call.)
  if (t < T_WIND_END) {
    const u = clamp01((t - T_EXIT) / T_BEAT);
    const spin = clamp01((t - (T_EXIT + T_BEAT)) / T_WINDUP);
    // FROM THE POSE THAT IS ACTUALLY ON SCREEN. This read
    // `emoteAnyLive(TALK, t, t - T_EXIT)` — a fresh talking loop at bt 0 — while
    // the frame before it was holding the last line's own gesture partway
    // through. One frame, 86 units of wrist. `talkStance` keeps running.
    const turning = mixStance(talkStance(t), emoteAny(0, t), u);
    // ONE JOURNEY, NOT TWO. The wind-up and the bolt ask `strideStance` for the
    // SAME endpoints, and only the body's position differs — the wind-up holds
    // `x` at the mark while the cycle runs, the bolt lets it go.
    //
    // They used to name different journeys (mark→mark-400, then mark→away), and
    // `gaitVary` deals a habit from the endpoints: different endpoints, different
    // stride length, different bob, different arm swing. Handing over between
    // them moved a joint 50 units in one frame. Same journey, same habit, and the
    // handover is a continuation rather than a cut.
    const spun = strideStance(stageToRig(X_LAUNCH), stageToRig(X_AWAY), emoteAny(0, t), spin * WIND_TR, WALK);
    return {
      // And the cycle FADES IN over the first third of the wind-up rather than
      // switching on: `strideStance` at tr 0 is a loaded push-off pose, not a
      // stand, so cutting to it from a stand was a 41-unit jump of its own.
      stance: mixStance(turning, spun, ease01(clamp01(spin / 0.34))),
      x: X_MARK,
      dir: lerp(-1, 1, u),
      vis: 1,
    };
  }

  // ── 5 · and gone ──────────────────────────────────────────────────────────
  //
  // The bolt picks the cycle up WHERE THE WIND-UP LEFT IT rather than starting a
  // new one at phase 0: the spin ended at 0.35 of its notional journey, so this
  // one starts there and runs on. Beginning at 0 would put both feet back on the
  // ground a stride apart in a single frame, which is the departure skate
  // `strideStance`'s own `fromStand` note describes.
  const tr = clamp01((t - T_WIND_END) / T_BOLT);
  // f(u) = c·u + (1 − c)·u² — see LAUNCH_C. One value drives BOTH the stride and
  // the body, which is the whole of why the planted foot no longer slides.
  const carried = WIND_TR + (1 - WIND_TR) * (LAUNCH_C * tr + (1 - LAUNCH_C) * tr * tr);
  return {
    stance: strideStance(stageToRig(X_LAUNCH), stageToRig(X_AWAY), emoteAny(0, t), carried, WALK),
    x: lerp(X_LAUNCH, X_AWAY, carried),
    dir: 1,
    vis: t >= T_GONE ? 0 : 1,
  };
}
