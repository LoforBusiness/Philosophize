import {
  WALK, clamp01, ease01, lerp, strideStance, stand, type Stance, type Gait,
} from '@/components/lesson/cinematic/rig';
import { VOICE_LINES } from './professorVoice';
import { X_MARK, X_OFF } from './lectureRoom';

// ─────────────────────────────────────────────────────────────────────────────
// THE PROFESSOR — what he does, and what the chalk does, as pure functions of time.
//
// components/welcome/seatedHost.ts is the pattern, and every reason it gives holds:
// every pose is a Stance for the lesson rig, so the walk, the foot lock and the arm
// IK are the same code that draws him in a lesson; and it is a function of `t` alone,
// so the film can jump its own clock (`?t=` on the web build) and stay continuous,
// and `check:professor` can step it at 60fps in plain Node.
//
//   T_ENTER → T_ARRIVE    walks in from off-stage right, facing the board
//   LINE_T[i] …           speaks line i, gesturing at the board as its chalk draws
//   T_END                 the last word has settled; the film hands over
//
// NOTHING MOVES HIS PELVIS ON A CLOCK (group AL). The walk is distance-driven, the
// idle is `stand`, and every gesture is a hand target and a lean.
// ─────────────────────────────────────────────────────────────────────────────

/** Stage units per rig unit: about 196 units from floor to crown. */
export const K_PROF = 1.9;

export const T_ENTER = 0.5;
const T_WALK = 2.2;
export const T_ARRIVE = T_ENTER + T_WALK;
/** When the first word lands: a breath after he stops. */
export const T_SPEAK0 = T_ARRIVE + 0.45;
/** The screen's own pause after each line, before the next begins. */
const GAP = 0.75;

export const LINE_T: number[] = (() => {
  const out: number[] = [];
  let t = T_SPEAK0;
  for (const l of VOICE_LINES) { out.push(t); t += l.dur + GAP; }
  return out;
})();
export const LINE_END: number[] = LINE_T.map((t, i) => t + VOICE_LINES[i].dur);
/** The film is over: the last line's words have stood for a moment. */
export const T_END = LINE_END[LINE_END.length - 1] + 1.3;

/** The line covering `t`, or −1 before the first. It keeps covering through its pause. */
export function lineAt(t: number): number {
  'worklet';
  let idx = -1;
  for (let i = 0; i < LINE_T.length; i++) if (t >= LINE_T[i]) idx = i;
  return idx;
}

// ── the chalk's clock ────────────────────────────────────────────────────────

/** When line i's chalk starts and finishes, on the film's clock. */
export function chalkWindow(i: number): [number, number] {
  'worklet';
  const a = LINE_T[i] + 0.35;
  return [a, Math.max(a + 1.6, LINE_T[i] + VOICE_LINES[i].dur * 0.92)];
}
/** How long the previous board takes to wipe once a new line begins. */
export const WIPE = 0.3;

/**
 * Where the chalk is: which board, how far through its drawing (0..1), and how
 * much of the board is still up (1, falling to 0 as the next line wipes it).
 */
export function chalkAt(t: number): { line: number; progress: number; shown: number } {
  'worklet';
  const li = lineAt(t);
  if (li < 0) return { line: -1, progress: 0, shown: 0 };
  const [a, b] = chalkWindow(li);
  const progress = clamp01((t - a) / (b - a));
  // A board is wiped only by the NEXT line starting; the last one stays up.
  const next = li + 1 < LINE_T.length ? LINE_T[li + 1] : Infinity;
  const shown = 1 - clamp01((t - next) / WIPE);
  return { line: li, progress, shown };
}

// ── the walk ─────────────────────────────────────────────────────────────────

/** The lesson walk with a shorter step: the stride seatedHost measured inside the leg. */
const STROLL: Gait = { ...WALK, S: 28, bob: 2.2 };
const toRig = (x: number) => {
  'worklet';
  return x / K_PROF;
};

// ── the gestures ─────────────────────────────────────────────────────────────
//
// One per line, for the near hand, in pelvis-relative rig units with +x toward the
// board. The shoulder is about (0, −26) and the head's centre about (0, −49) with a
// radius of 20, so a gesture is a hand held FORWARD, near shoulder height: a hand at
// (24, −48) — the first draft's "pointing up at the board" — sits beside his cheek
// and reads as a man scratching his head. Every target is within the arm's 33 and
// at least 26 clear of the head's centre.

interface Gesture { x: number; y: number; tilt: number; neck: number; beat: number }

const GESTURES: Gesture[] = [
  // "Welcome. Before your first lesson…" — an open hand, offered.
  { x: 28, y: -26, tilt: -0.03, neck: 0.03, beat: 0 },
  // "Philosophy has six branches…" — up at the board, where the six are going.
  { x: 29, y: -40, tilt: -0.02, neck: 0.1, beat: 0 },
  // "Logic… Ethics…" — straight at the board.
  { x: 31, y: -32, tilt: -0.05, neck: 0.06, beat: 0 },
  // "Epistemology asks how you know…" — the hand raised, a question put.
  { x: 26, y: -42, tilt: 0.0, neck: 0.05, beat: 0 },
  // "Short, narrated and animated…" — counting them off on the beat.
  { x: 28, y: -29, tilt: -0.04, neck: 0.02, beat: 1 },
  // "Every lesson comes with the Scholar's Pass…" — an open presentation.
  { x: 30, y: -22, tilt: -0.06, neck: 0.04, beat: 0 },
];

/** 0 → 1 → 0 across [a, b], rising over `rise` and falling over `fall`, smooth both ways. */
function env(t: number, a: number, b: number, rise: number, fall: number): number {
  'worklet';
  if (t <= a || t >= b) return 0;
  const up = ease01(clamp01((t - a) / rise));
  const down = 1 - ease01(clamp01((t - (b - fall)) / fall));
  return Math.min(up, down);
}

/** A small nod on each word, so the talking is in his head as well as the caption. */
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

export interface ProfFrame {
  stance: Stance;
  /** Stage x of the pelvis. */
  x: number;
  /** +1 faces right, −1 left. He faces the board, which is to his left. */
  dir: number;
}

export function professorAt(t: number): ProfFrame {
  'worklet';
  // ── the walk in ─────────────────────────────────────────────────────────────
  // Distance-locked, eased OUT at a power of 1.5 for seatedHost's measured reason:
  // a quadratic ease-out enters at twice the average pace and hurries the stride.
  if (t < T_ARRIVE) {
    const u = clamp01((t - T_ENTER) / T_WALK);
    const tr = 1 - Math.pow(1 - u, 1.5);
    const walked = strideStance(toRig(X_OFF), toRig(X_MARK), stand(t), tr, STROLL, 0);
    // Soft knees on the way in (seatedHost): a constant, let go as he arrives.
    const soft = 1.6 * (1 - ease01(clamp01((u - 0.82) / 0.18)));
    return { stance: { ...walked, bob: walked.bob - soft }, x: lerp(X_OFF, X_MARK, tr), dir: -1 };
  }

  // ── standing at the board, talking ─────────────────────────────────────────
  const base = stand(t);
  let fx = base.fistR.x;
  let fy = base.fistR.y;
  let tilt = base.tilt;
  let neck = base.neck;
  for (let i = 0; i < LINE_T.length; i++) {
    const a = LINE_T[i] - 0.2;
    const b = Math.min(LINE_END[i] + 0.5, (LINE_T[i + 1] ?? LINE_END[i] + 1.2) - 0.08);
    const e = env(t, a, b, 0.6, 0.5);
    if (e <= 0) continue;
    const g = GESTURES[i] ?? GESTURES[0];
    const drift = Math.sin((t - a) * 2.1) * 2;
    const chop = g.beat ? Math.max(0, Math.sin((t - a) * 7)) * -3 : 0;
    fx = lerp(fx, g.x + drift * 0.6, e);
    fy = lerp(fy, g.y + drift * 0.5 + chop, e);
    tilt = lerp(tilt, base.tilt + g.tilt, e);
    neck = lerp(neck, base.neck + g.neck, e);
  }
  neck += wordNod(t, lineAt(t)) * 0.035;
  // The last word is his; then a small bow of the head, and the film hands over.
  const bow = env(t, LINE_END[LINE_END.length - 1] + 0.1, T_END + 0.4, 0.4, 0.5);
  neck += 0.14 * bow;
  tilt -= 0.05 * bow;
  return { stance: { ...base, tilt, neck, fistR: { x: fx, y: fy } }, x: X_MARK, dir: -1 };
}
