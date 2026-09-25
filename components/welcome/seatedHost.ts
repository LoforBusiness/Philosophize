import {
  WALK, clamp01, ease01, lerp, mixStance, strideStance, stand, seatBob, life2,
  type Stance, type P2, type Gait,
} from '@/components/lesson/cinematic/rig';
import { VOICE_LINES } from './welcomeVoice';

// ─────────────────────────────────────────────────────────────────────────────
// THE SEATED HOST — what he does, as a pure function of time.
//
// The owner's brief for the first screen: the stickman in the top hat walks in,
// sits down in a chair, CROSSES HIS LEGS "so it looks real, and you can tell that
// it's crossing his legs", sits very distinguished, and then talks.
//
// Like ./hostFigure, this file solves nothing itself. Every pose is a Stance for
// the lesson rig, and `solve` + `bundle` draw it — so the walk, the foot-lock and
// the arm IK are the same code that draws him in a lesson. It is a pure function
// of `t`, which is what lets the screen jump its own clock (`?t=` on the web build)
// and still be continuous.
//
//   T_ENTER → T_ARRIVE     walks in from off-stage right, facing left
//   → T_TURNED             turns round to put his back to the chair
//   → T_SAT                lowers himself into it
//   → T_CROSSED            lifts the near leg and lays it over the far knee
//   → T_MONO_END           a touch to the monocle
//   LINE_T[0] → …          talks: seven lines, a gesture each
//   T_TIP0 → T_END         lifts his hat
//   T_END →                sits, and the end card arrives above him
//
// ── THE CROSSED LEG IS SOLVED, NOT GUESSED ─────────────────────────────────
//
// A figure drawn in one solid ink has no outline between two limbs, so a crossed
// leg only reads if the SHAPE says it: the far foot planted, the near knee riding
// ON TOP of the far knee, and the near foot hanging off the ground in front. With
// the seat at 20 (thighs level) and the near foot at (30.5, −15.5), the rig puts the
// near knee 10.8 units above the far one — a limb is 11 thick, so the top knee
// rests exactly on the bottom one, which is what a leg resting on a leg looks like.
// The paper edge that separates them is the screen's job (SeatedWelcome's
// LegEdge), because the rig draws both legs in the same ink.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stage units per rig unit. 1.55 puts the top of his hat ~167 units above the seat's
 * floor. At 2.0 the rig's lesson proportions — a 40-unit head on a 12-thick trunk —
 * stop reading as a figure and read as a blob, and he dwarfed the chair he sat in.
 */
export const K_SEAT = 1.55;
/** The floor line, in the 400 × 800 stage. */
export const GROUND = 610;
/** Where his pelvis sits once seated. The chair is drawn around this point. */
export const X_SEAT = 150;
/** The seat, in rig units: the pelvis height that levels the thighs. */
export const SEAT_H = 20;
/** How far forward of the seat he stands before he sits, in rig units. */
const SIT_BACK = 17;
/** The spot he walks to, right in front of the chair. */
export const X_MARK = X_SEAT + SIT_BACK * K_SEAT;
/** Off-stage right, clear by a figure's width. */
const X_OFF = 452;

/** When the room starts assembling — after the launch screen's ~1s outro. */
export const T_ROOM = 0.7;
/** He walks on once the room is built (T_ROOM + eight pieces in turn). */
export const T_ENTER = 1.75;
const T_WALK = 3.3;
export const T_ARRIVE = T_ENTER + T_WALK;
const T_TURN0 = T_ARRIVE + 0.2;
const T_TURN = 0.5;
export const T_TURNED = T_TURN0 + T_TURN;
const T_SIT = 1.1;
export const T_SAT = T_TURNED + 0.05 + T_SIT;
const T_CROSS0 = T_SAT + 0.2;
const T_CROSS = 0.9;
export const T_CROSSED = T_CROSS0 + T_CROSS;
const T_MONO0 = T_CROSSED + 0.2;
const T_MONO = 0.95;
export const T_MONO_END = T_MONO0 + T_MONO;

/** When his first word lands. */
export const T_SPEAK0 = T_MONO_END + 0.35;
/**
 * The silence AFTER each line before the next begins. These are the screen's pauses,
 * which is why each line was rendered on its own: a beat before "Whichever the case",
 * a longer one before Socrates, and the longest before the last line.
 */
const GAPS = [0.85, 0.8, 0.8, 1.0, 1.0, 1.15];
/** When each line starts, on the screen's clock. */
export const LINE_T: number[] = (() => {
  const out: number[] = [];
  let t = T_SPEAK0;
  VOICE_LINES.forEach((l, i) => {
    out.push(t);
    t += l.dur + (GAPS[i] ?? 1);
  });
  return out;
})();
const N_LINES = VOICE_LINES.length;
/** When each line ends. */
export const LINE_END: number[] = LINE_T.map((t, i) => t + VOICE_LINES[i].dur);
export const T_LAST_END = LINE_END[N_LINES - 1];

export const T_TIP0 = T_LAST_END + 0.2;
const T_TIP = 1.5;
/** The hat is back on his head and the end card arrives. */
export const T_END = T_TIP0 + T_TIP;

/**
 * HIS STROLL: the lesson walk with a shorter step and a lighter tread.
 *
 * Not taste alone. `strideStance` deals each journey its own stride from its
 * endpoints (`gaitVary`, 0.84–1.18 of WALK's 34), and this journey drew a long one:
 * at push-off the trailing foot was asked to be 37.2 units from the hip, past the
 * leg's 37, so the leg locked straight and the knee snapped forward ten stage units
 * in a single frame as it lifted. 28 keeps the longest stride it can be dealt inside
 * the leg, and a measured step is what a man in a top hat walks with anyway.
 */
const STROLL: Gait = { ...WALK, S: 28, bob: 2.2 };

const stageToRig = (x: number) => {
  'worklet';
  return x / K_SEAT;
};

/**
 * The line covering `t`, or −1 before the first. A line keeps "covering" until the
 * next begins, so the words stay up through the pause after them.
 */
export function lineAt(t: number): number {
  'worklet';
  let idx = -1;
  for (let i = 0; i < LINE_T.length; i++) if (t >= LINE_T[i]) idx = i;
  return idx;
}

// ── the poses ────────────────────────────────────────────────────────────────

/** A quadratic Bézier, for the path the lifted foot takes over the other knee. */
function quad(a: P2, c: P2, b: P2, u: number): P2 {
  'worklet';
  const v = 1 - u;
  return { x: v * v * a.x + 2 * v * u * c.x + u * u * b.x, y: v * v * a.y + 2 * v * u * c.y + u * u * b.y };
}

/** 0 → 1 → 0 across [a, b], smooth at both ends. */
function hump(t: number, a: number, b: number): number {
  'worklet';
  if (t <= a || t >= b) return 0;
  return Math.sin(Math.PI * ((t - a) / (b - a)));
}

/**
 * An envelope that rises over `rise` from `a`, holds, and falls over `fall` to `b`.
 * Smoothstep both ways, so a gesture leaves and arrives with no speed.
 */
function env(t: number, a: number, b: number, rise: number, fall: number): number {
  'worklet';
  if (t <= a || t >= b) return 0;
  const up = ease01(clamp01((t - a) / rise));
  const down = 1 - ease01(clamp01((t - (b - fall)) / fall));
  return Math.min(up, down);
}

/** Seated with both feet down, hands on the thighs — the pose the sit lands in. */
function seatedOpen(t: number): Stance {
  'worklet';
  const hd = life2(t, 0.47, 0.29, 1.4);
  return {
    tilt: 0.1,
    neck: -0.03 + hd * 0.03,
    bob: seatBob(SEAT_H),
    footL: { x: 17, y: 0 },
    footR: { x: 21, y: 0 },
    fistL: { x: 12, y: -3 },
    fistR: { x: 16, y: -4 },
    adv: 0,
  };
}

/** The far foot, planted. */
const FOOT_L: P2 = { x: 16, y: 0 };
/** The near foot at rest over the far knee, hanging clear of the floor. */
const FOOT_R: P2 = { x: 30.5, y: -15.5 };

/**
 * THE DISTINGUISHED SIT: legs crossed, both hands resting one over the other on the
 * top knee, leaning back into the chair. Everything that moves here is caused — the
 * head drifts as he looks about, and the hanging foot swings a little, which is the
 * one idle every person with crossed legs has. Nothing moves the pelvis (AL1).
 */
function crossedHold(t: number): Stance {
  'worklet';
  const hd = life2(t, 0.43, 0.27, 0.6);
  const ws = life2(t, 0.23, 0.14, 1.9);
  const swing = Math.sin(t * 1.9) * 0.6 + Math.sin(t * 1.13 + 0.8) * 0.4;
  return {
    tilt: 0.08 + ws * 0.012,
    neck: -0.05 + hd * 0.045,
    bob: seatBob(SEAT_H),
    footL: FOOT_L,
    footR: { x: FOOT_R.x + swing * 1.3, y: FOOT_R.y - Math.max(0, swing) * 1.4 },
    // The far hand rests on the arm of the chair and the near one on his own thigh,
    // short of the knee: two hands piled ON the knee cover the very place the legs
    // cross, and the first render of this pose was a lump there because of it.
    fistL: { x: 8 + ws * 0.4, y: -9 },
    fistR: { x: 10 + ws * 0.4, y: -12 },
    adv: 0,
  };
}

// ── the gestures while he talks ─────────────────────────────────────────────
//
// One per line, for the NEAR hand; the far hand stays on his knee, which is most of
// what keeps him seated-and-composed rather than seated-and-waving. Each gesture is a
// target for the hand plus a lean, held under an envelope that begins as the line
// begins and returns the hand to the knee in the pause after it — so every line
// hands over through the resting pose and nothing can jump between two lines.
//
// Targets are pelvis-relative rig units, checked against the rig's two limits: under
// 33 from the near shoulder (about (0, −26) seated), and more than 16 from the head
// centre (about (−6, −49)), or the hand vanishes into the head.

interface Gesture { x: number; y: number; tilt: number; neck: number; beat: number }

const GESTURES: Gesture[] = [
  // "So… you want to learn philosophy?" — an open hand, offered forward.
  { x: 29, y: -21, tilt: -0.04, neck: 0.02, beat: 0 },
  // "Or possibly… a well-distinguished individual" — the hand to his own chest.
  { x: 9, y: -30, tilt: 0.02, neck: -0.06, beat: 0 },
  // "Whichever the case, you're here to learn." — a small chop on the beat.
  { x: 27, y: -24, tilt: -0.05, neck: 0.03, beat: 1 },
  // "And I have the perfect program for you" — presented, wide and high.
  { x: 32, y: -30, tilt: -0.07, neck: -0.02, beat: 0 },
  // "mental effort, and curiosity" — a finger to the temple.
  { x: 13, y: -52, tilt: 0.0, neck: 0.04, beat: 0 },
  // "As Socrates once said" — the raised forefinger.
  { x: 21, y: -45, tilt: -0.02, neck: -0.05, beat: 0 },
  // "Thus begins your journey." — the hand sweeps out, toward the way on.
  { x: 33, y: -17, tilt: -0.06, neck: 0.05, beat: 0 },
];

/** A little nod on each word he stresses, so the talking is in his head as well. */
function wordNod(t: number, li: number): number {
  'worklet';
  if (li < 0) return 0;
  const w = VOICE_LINES[li].words;
  const t0 = LINE_T[li];
  let n = 0;
  for (let k = 0; k < w.length; k++) {
    const d = (t - (t0 + w[k] + 0.06)) / 0.11;
    if (d > -3 && d < 3) n += Math.exp(-d * d);
  }
  return Math.min(1, n);
}

function talking(t: number): Stance {
  'worklet';
  const base = crossedHold(t);
  let fx = base.fistR.x;
  let fy = base.fistR.y;
  let tilt = base.tilt;
  let neck = base.neck;
  for (let i = 0; i < LINE_T.length; i++) {
    const a = LINE_T[i] - 0.15;
    const b = Math.min(LINE_END[i] + 0.55, (LINE_T[i + 1] ?? LINE_END[i] + 1) - 0.1);
    const e = env(t, a, b, 0.42, 0.5);
    if (e <= 0) continue;
    const g = GESTURES[i] ?? GESTURES[0];
    // Speech life: the hand keeps turning a little while it is out.
    const drift = Math.sin((t - a) * 2.3) * 2.2;
    const chop = g.beat ? Math.max(0, Math.sin((t - a) * 7.5)) * -3 : 0;
    fx = lerp(fx, g.x + drift * 0.6, e);
    fy = lerp(fy, g.y + drift * 0.5 + chop, e);
    tilt = lerp(tilt, base.tilt + g.tilt, e);
    neck = lerp(neck, base.neck + g.neck, e);
  }
  neck += wordNod(t, lineAt(t)) * 0.035;
  return { ...base, tilt, neck, fistR: { x: fx, y: fy } };
}

// ── the frame ─────────────────────────────────────────────────────────────────

export interface SeatFrame {
  stance: Stance;
  /** Stage x of the pelvis. */
  x: number;
  /** +1 faces right, −1 left, eased through zero on the turn. */
  dir: number;
  /** 0 → 1 → 0: the hat lifted off his head during the tip. */
  hatLift: number;
  /** 0 → 1 as the seat takes his weight — the cushion answers it. */
  sat: number;
}

const WALK_T0 = 0;

export function seatedAt(t: number): SeatFrame {
  'worklet';
  // ── 1 · the walk in ───────────────────────────────────────────────────────
  // Distance-locked, like every walk in the app: the step phase comes from how far
  // he has travelled, so the planted foot holds still whatever the easing does.
  // Ease-OUT only — he is already walking when he crosses the edge, and he slows
  // into his mark. A power of 1.5 rather than 2: a quadratic ease-out enters at
  // TWICE the average pace, and replayed at 60fps his swing foot was travelling ten
  // units a frame as he came on — a stride hurried in from the wings. 1.5 enters at
  // one and a half, and still arrives with no speed at all.
  if (t < T_TURN0) {
    const u = clamp01((t - T_ENTER) / T_WALK);
    const tr = 1 - Math.pow(1 - u, 1.5);
    const walked = strideStance(stageToRig(X_OFF), stageToRig(X_MARK), stand(t), tr, STROLL, WALK_T0);
    // SOFT KNEES. At push-off the trailing leg was all but straight, and the knee
    // IK is singular at full extension — the first moment the foot lifted, the
    // knee swung forward ten stage units in one frame. Carrying the pelvis 1.6
    // lower keeps a little bend in both legs all the way in, and the offset is let
    // go over the last stretch so he arrives standing at his full height. It is a
    // constant, not a bob on a clock, so AL1 is not touched.
    const soft = 1.6 * (1 - ease01(clamp01((u - 0.82) / 0.18)));
    return { stance: { ...walked, bob: walked.bob - soft }, x: lerp(X_OFF, X_MARK, tr), dir: -1, hatLift: 0, sat: 0 };
  }

  // ── 2 · the turn, to put his back to the chair ────────────────────────────
  if (t < T_TURNED) {
    const u = ease01(clamp01((t - T_TURN0) / T_TURN));
    const arrived = strideStance(stageToRig(X_OFF), stageToRig(X_MARK), stand(t), 1, STROLL, WALK_T0);
    return { stance: mixStance(arrived, stand(t), u), x: X_MARK, dir: lerp(-1, 1, u), hatLift: 0, sat: 0 };
  }

  // ── 3 · the sit ───────────────────────────────────────────────────────────
  // The pelvis travels back onto the seat while the feet stay where they stood: the
  // seated feet are SIT_BACK forward of the pelvis, so moving the pelvis back by the
  // same amount leaves them planted. He leans forward as he lowers — nobody drops
  // into a chair bolt upright — and the hands go back to find the arms of the chair.
  const T_SIT0 = T_TURNED + 0.05;
  if (t < T_SAT) {
    const u = clamp01((t - T_SIT0) / T_SIT);
    const e = ease01(u);
    const s = mixStance(stand(t), seatedOpen(t), e);
    const reach = hump(u, 0, 1);
    return {
      stance: {
        ...s,
        tilt: s.tilt - 0.34 * reach,
        neck: s.neck + 0.12 * reach,
        fistL: { x: s.fistL.x - 9 * reach, y: s.fistL.y + 4 * reach },
        fistR: { x: s.fistR.x - 7 * reach, y: s.fistR.y + 4 * reach },
      },
      x: lerp(X_MARK, X_SEAT, e),
      dir: 1,
      hatLift: 0,
      sat: e,
    };
  }

  // ── 4 · the leg goes over ─────────────────────────────────────────────────
  // The near foot lifts HIGH first — knee up toward the chest — and then comes down
  // on the far side of the other knee. Lifting it straight across would drive the
  // shin through the other leg; going over the top is what a person actually does,
  // and it is the moment that tells a reader "that is a leg crossing".
  if (t < T_CROSSED) {
    const u = clamp01((t - T_CROSS0) / T_CROSS);
    const e = ease01(u);
    const open = seatedOpen(t);
    const held = crossedHold(t);
    const foot = quad(open.footR, { x: 24, y: -30 }, held.footR, e);
    const s = mixStance(open, held, e);
    return {
      stance: { ...s, footR: foot, tilt: s.tilt + 0.06 * hump(u, 0, 1) },
      x: X_SEAT,
      dir: 1,
      hatLift: 0,
      sat: 1,
    };
  }

  // ── 5 · a touch to the monocle ────────────────────────────────────────────
  if (t < T_SPEAK0 - 0.15) {
    const held = crossedHold(t);
    const e = env(t, T_MONO0, T_MONO_END, 0.4, 0.4);
    const twist = Math.sin((t - T_MONO0) * 11) * 0.8 * e;
    return {
      stance: {
        ...held,
        neck: held.neck + 0.05 * e,
        fistR: { x: lerp(held.fistR.x, 12 + twist, e), y: lerp(held.fistR.y, -45, e) },
      },
      x: X_SEAT,
      dir: 1,
      hatLift: 0,
      sat: 1,
    };
  }

  // ── 6 · the talk, and the hat ─────────────────────────────────────────────
  const s = talking(t);
  // The hand goes up to the front of the brim first; only once it is there does the
  // hat come off (hatLift), and it goes back on before the hand leaves. The fist
  // target is where the brim's front sits on a head bowed this far, so the grip
  // lands on the hat rather than beside it.
  const tip = env(t, T_TIP0, T_END, 0.4, 0.45);
  const lift = env(t, T_TIP0 + 0.38, T_END - 0.38, 0.3, 0.3);
  const bow = env(t, T_TIP0 + 0.2, T_END - 0.2, 0.4, 0.45);
  return {
    stance: {
      ...s,
      neck: s.neck + 0.16 * bow,
      tilt: s.tilt - 0.06 * bow,
      fistR: { x: lerp(s.fistR.x, 21 + 4 * lift, tip), y: lerp(s.fistR.y, -52 - 3 * lift, tip) },
    },
    x: X_SEAT,
    dir: 1,
    hatLift: lift,
    sat: 1,
  };
}

/** The figure's height above the floor while seated, for laying out the chair. */
export const SEAT_TOP = SEAT_H - 5.5;
