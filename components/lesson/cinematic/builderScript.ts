// ─────────────────────────────────────────────────────────────────────────────
// Script for the cinematic version of logic-arguments-2, "Premises and
// Conclusions". Theme: THE MASTER BUILDER.
//
// A different scene from lesson 1's fight — on purpose. Here an argument is a
// STRUCTURE: two premise-bricks form the base, and the conclusion is the keystone
// they hold up. A master builder lays it and a watching apprentice gets tested.
//
// The whole lesson rides one live brick structure (native Views — see
// BrickStructure.tsx). The two graded questions are dramatised INTO that
// structure rather than shown as flashcards:
//   · the true/false ("can a conclusion stand on its own?") pulls a premise and
//     the keystone actually CRASHES — the collapse is the answer;
//   · the multiple-choice ("which sentence is the conclusion?") floats two bricks
//     and the right one FLIES UP into the keystone slot.
//
// Both graded questions are lifted verbatim from data/branches/logic/.../
// premises-and-conclusions.ts so scoring stays identical to every other lesson.
//
// Structure — five acts:
//   1  THE BUILD    the master lays two bricks and sets a keystone; it stands.
//   2  NAME PARTS   he points out the premises (base) and the conclusion (top).
//   3  THE PROOF    the famous Socrates syllogism, as bricks and as formal proof.
//   4  THE TEST     pull a premise (it collapses); place the conclusion (it flies).
//   5  PAYOFF       the saveable Aristotle quote and what you now know.
// ─────────────────────────────────────────────────────────────────────────────

export type Who = 'master' | 'app';

export interface Choice { id: string; text: string; correct: boolean }

/**
 * How the brick structure looks this beat. A brick is PRESENT when its label is a
 * string (use '' for a blank, un-lettered brick); `null`/absent means it is not
 * there. `q` marks a beat whose graded answer drives an animation on the bricks.
 */
export interface BuildState {
  /** Base-left premise brick face. */
  p1?: string | null;
  /** Base-right premise brick face. */
  p2?: string | null;
  /** Keystone (conclusion) brick face. */
  key?: string | null;
  /** Draw an empty dashed keystone SLOT (used by the fly-up question). */
  slot?: boolean;
  /** Show the PREMISES / CONCLUSION role tags beside the structure. */
  tags?: boolean;
  /** This beat's graded answer drives the collapse or the fly-up. */
  q?: 'collapse' | 'flyup';
}

export interface Beat {
  act: 1 | 2 | 3 | 4 | 5;
  /** Narration under the scene. */
  text?: string;
  /** Small attribution above the narration. */
  cite?: string;
  /** Speech bubbles over a figure. */
  say?: { who: Who; text: string }[];
  /** The brick structure this beat. */
  build?: BuildState;
  /** Master gesture code (rig): 0 open · 1 emphatic · 2 present · 3 count · 4 chin
   *  · 5 sweep · 6 point-up · 7 LAY A BRICK. Matched to the line. */
  gest?: number;
  /** Saveable quote card. */
  quote?: { id: string; text: string; author: string; work: string; era: string };
  /** Teaching tap — no XP, immediate feedback. */
  tap?: { prompt: string; options: Choice[]; explain: string };
  /** Graded question — awards XP exactly as the card runner does. */
  mc?: { prompt: string; options: Choice[]; explain: string; xp: number };
  /** Closing payoff. */
  summary?: { title: string; points: string[]; closing: string };
  /** Seconds of animation before the tap prompt appears. */
  dur: number;
}

// Socrates' syllogism, on the bricks.
const S_P1 = 'All men are mortal';
const S_P2 = 'Socrates is a man';
const S_K = 'Socrates is mortal';

export const BEATS: Beat[] = [
  // ── ACT 1 — THE BUILD ────────────────────────────────────────────────────────
  {
    act: 1,
    build: { p1: '' },
    gest: 7,                                        // lay the first brick
    text: 'A master builder sets the first stone.',
    dur: 2.6,
  },
  {
    act: 1,
    build: { p1: '', p2: '' },
    gest: 7,                                        // lay the second brick
    text: 'Every argument hides the same skeleton. Learn to see it once, and you read minds forever.',
    dur: 3.2,
  },
  {
    act: 1,
    build: { p1: '', p2: '', key: '' },
    gest: 5,                                        // sweep the keystone into place
    say: [{ who: 'master', text: 'There. It stands.' }],
    text: 'Two stones below. One resting on top. That shape is every argument you will ever meet.',
    dur: 3.2,
  },

  // ── ACT 2 — NAME THE PARTS ───────────────────────────────────────────────────
  {
    act: 2,
    build: { p1: '', p2: '', key: '', tags: true },
    gest: 3,                                        // count off the base
    text: 'The two stones at the base are the premises — the reasons you lay down. Words like because and since point them out.',
    dur: 4.2,
  },
  {
    act: 2,
    build: { p1: '', p2: '', key: '', tags: true },
    gest: 6,                                        // point up at the keystone
    text: 'The stone they hold up is the conclusion — what Aristotle called the claim that "follows of necessity." Therefore, so and thus flag it.',
    cite: 'Aristotle, Prior Analytics',
    dur: 4.4,
  },
  {
    act: 2,
    build: { p1: '', p2: '', key: '', tags: true },
    tap: {
      prompt: 'One of these words flags a conclusion. Tap it.',
      options: [
        { id: 'a', text: '"because"', correct: false },
        { id: 'b', text: '"therefore"', correct: true },
      ],
      explain:
        '"Because" and "since" introduce a premise — the reason. "Therefore," "so" and "thus" point to the conclusion the reasons support.',
    },
    dur: 0.8,
  },

  // ── ACT 3 — THE FAMOUS STRUCTURE ─────────────────────────────────────────────
  {
    act: 3,
    build: { p1: S_P1, p2: S_P2, key: S_K },
    gest: 2,                                        // present the finished structure
    text: 'Here is logic’s oldest structure, first written down around 350 BCE.',
    dur: 4.0,
  },
  {
    act: 3,
    build: { p1: S_P1, p2: S_P2, key: S_K },
    gest: 1,                                        // emphatic — "forced into place"
    text: 'Grant the builder both premises and the top stone is forced into place — no matter how you feel about it. That is what "follows of necessity" means.',
    cite: 'Aristotle, Prior Analytics',
    dur: 4.4,
  },

  // ── ACT 4 — THE TEST ─────────────────────────────────────────────────────────
  {
    act: 4,
    build: { p1: S_P1, p2: S_P2, key: S_K, q: 'collapse' },
    gest: 4,                                        // hand near the base, about to pull
    say: [{ who: 'master', text: 'Pull a premise. Does it still stand?' }],
    mc: {
      prompt: 'True or false: a conclusion can stand on its own, with no premises behind it.',
      options: [
        { id: 'true', text: 'True', correct: false },
        { id: 'false', text: 'False', correct: true },
      ],
      explain:
        'A claim with nothing behind it is a bare assertion. Strip the premises and there is no inference, and no reason to believe it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 4,
    build: { p1: S_P1, p2: S_P2, key: S_K },
    gest: 0,                                        // open hand — the plain point
    text: 'Pull the reasons and nothing holds the claim up. Premises are not decoration — they are the load-bearing part.',
    dur: 3.8,
  },
  {
    act: 4,
    build: { p1: 'The deficit is growing', p2: 'Taxes should rise', key: null, slot: true, q: 'flyup' },
    gest: 6,                                        // gesture up at the empty slot
    say: [{ who: 'master', text: 'Which of these belongs on top?' }],
    mc: {
      prompt: '"Therefore, taxes should rise. After all, the deficit is growing." Which sentence is the conclusion?',
      options: [
        { id: 'a', text: '"Taxes should rise" — flagged by "therefore"', correct: true },
        { id: 'b', text: '"The deficit is growing" — after "after all"', correct: false },
        { id: 'c', text: 'Whichever sentence appears first', correct: false },
        { id: 'd', text: 'Both — they each conclude something', correct: false },
      ],
      explain:
        'A conclusion can come first. "Therefore" marks the claim being supported; "after all" introduces the premise backing it up. Read the role, not the position.',
      xp: 5,
    },
    dur: 1.0,
  },

  // ── ACT 5 — PAYOFF ───────────────────────────────────────────────────────────
  {
    act: 5,
    // The finished structure: the premise (deficit) alone at the base, centred, with
    // the conclusion (taxes) as the keystone — the exact shape the fly-up just built,
    // so it carries over seamlessly. No second base brick (that duplicated the
    // conclusion onto the base).
    build: { p1: 'The deficit is growing', key: 'Taxes should rise', tags: true },
    quote: {
      id: 'lq-logic-arguments-2',
      text: 'A deduction is a discourse in which, certain things being stated, something other than what is stated follows of necessity.',
      author: 'Aristotle',
      work: 'Prior Analytics',
      era: 'c. 350 BCE',
    },
    dur: 2.6,
  },
  {
    act: 5,
    summary: {
      title: 'The Skeleton Revealed',
      points: [
        'Premises are the reasons offered for a conclusion',
        '"Because" and "since" often flag a premise',
        '"Therefore" and "thus" often flag a conclusion',
        'Position can fool you; read the role',
      ],
      closing: 'Find the premises and the conclusion, and you can dissect any argument.',
    },
    dur: 2.8,
  },
];

/** Beats that hold the reader until they answer, rather than until they tap. */
export function gates(b: Beat) {
  return Boolean(b.tap || b.mc);
}

/** Total graded questions, so the reward screen can match the card runner. */
export const TOTAL_MC = BEATS.filter((b) => b.mc).length;
