// ─────────────────────────────────────────────────────────────────────────────
// Script for the cinematic version of logic-arguments-1, "Arguments Are Not
// Fights".
//
// The lesson plays as one continuous scene rather than a card pager. It advances
// on TAP: each beat animates for `dur` seconds, then waits. Nothing is ever on a
// timer the reader has to keep up with.
//
// Structure — five acts:
//   1  THE FIGHT     two boxers throw punches and land nothing, because neither
//                    has said anything. The camera is close and the ring is loud.
//   2  THE NARRATOR  camera pulls back, a third figure walks in and draws the
//                    actual anatomy of an argument.
//   3  THE THINKERS  Aristotle, a deadpan chart, Schopenhauer, Socrates, Mill.
//   4  THE REMATCH   the same two figures, the same disagreement, but with
//                    reasons — so it can finally go somewhere.
//   5  PAYOFF        the saveable Aristotle quote and what you now know.
//
// The two graded questions are lifted verbatim from the original lesson data so
// scoring stays identical to every other lesson in the app. The scene-native taps
// in between are for teaching and award nothing.
// ─────────────────────────────────────────────────────────────────────────────

export type BoardKey = 'anatomy' | 'syllogism' | 'loudness' | 'tworoads';
export type Who = 'red' | 'blue';

export interface Choice { id: string; text: string; correct: boolean }

export interface Beat {
  act: 1 | 2 | 3 | 4 | 5;
  /** Narration under the scene. */
  text?: string;
  /** Attribution shown small above the narration, e.g. a source. */
  cite?: string;
  /** Speech bubbles over the boxers. */
  say?: { who: Who; text: string }[];
  /** Which illustration is on the board this beat. */
  board?: BoardKey;
  /** Narrator gesture code for this beat (see rig `narrator`): 0 open · 1 emphatic
   *  · 2 board · 3 count · 4 chin · 5 sweep · 6 point-up. Matched to the line. */
  narr?: number;
  /**
   * THE SCOREBOARD, in tenths. Two meters at the top of the stage keep the running
   * count the lesson is actually about: how LOUD it has got, and how many REASONS
   * have been given. Act 1 drives volume to full with reasons stuck on zero; act 4
   * is the same quarrel with the numbers the other way round. Both undefined means
   * the scoreboard is not on stage this beat.
   */
  vol?: number;
  reasons?: number;
  /**
   * Rows of the Socratic exchange shown on stage (0–3): the question Socrates put
   * to Meletus, the answer, and the question that broke it. 3 also slams the
   * CONTRADICTION stamp across the exchange.
   */
  stack?: number;
  /** A saveable quote card. */
  quote?: { id: string; text: string; author: string; work: string; era: string };
  /** Teaching tap — no XP, immediate feedback. */
  tap?: { prompt: string; options: Choice[]; explain: string };
  /** Graded question — awards XP, exactly as the card runner does. */
  mc?: { prompt: string; options: Choice[]; explain: string; xp: number };
  /** Closing payoff. */
  summary?: { title: string; points: string[]; closing: string };
  /** Seconds of animation before the tap prompt appears. */
  dur: number;
}

export const BEATS: Beat[] = [
  // ── ACT 1 — THE FIGHT ──────────────────────────────────────────────────────
  {
    act: 1,
    vol: 3, reasons: 0,
    text: 'Two people. One disagreement.',
    dur: 2.2,
  },
  {
    act: 1,
    vol: 6, reasons: 0,
    say: [{ who: 'red', text: "YOU'RE WRONG!" }],
    text: 'Watch closely — not how loud they are. What they actually say.',
    dur: 2.6,
  },
  {
    act: 1,
    vol: 8, reasons: 0,
    say: [{ who: 'blue', text: "NO — YOU'RE WRONG!" }],
    text: 'That is not a counter-argument. It is the same noise, pointed back.',
    dur: 2.6,
  },
  {
    act: 1,
    vol: 10, reasons: 0,
    say: [
      { who: 'red', text: 'IDIOT!' },
      { who: 'blue', text: 'MORON!' },
    ],
    text: 'Three rounds in. Not one reason has been given by either of them.',
    dur: 2.8,
  },

  // ── ACT 2 — THE NARRATOR ───────────────────────────────────────────────────
  {
    act: 2,
    narr: 0,                                       // open hand, back toward the fight
    vol: 10, reasons: 0,
    text: 'This is what most people picture when they hear the word "argument".',
    dur: 3.4,
  },
  {
    act: 2,
    narr: 1,                                       // emphatic — "no way to end"
    vol: 10, reasons: 0,
    text: 'It is a quarrel. And a quarrel has no way to end — only a way to get louder.',
    dur: 3.0,
  },
  {
    act: 2,
    board: 'anatomy',
    narr: 2,                                       // present the board
    text: 'Philosophy means something completely different by the word. An argument is a machine with parts.',
    dur: 4.2,
  },
  {
    act: 2,
    board: 'anatomy',
    narr: 3,                                       // count off the parts
    text: 'Reasons — called premises — offered in support of a conclusion. That is the whole machine.',
    dur: 3.0,
  },
  {
    act: 2,
    vol: 10, reasons: 0,
    tap: {
      prompt: 'One of these gives a reason. Tap it.',
      options: [
        { id: 'a', text: '"You clearly know nothing about this."', correct: false },
        { id: 'b', text: '"Rents rose 40% while wages stayed flat."', correct: true },
      ],
      explain:
        'The first attacks a person. The second offers something that could be checked, argued with, or shown false — that is what makes it a premise.',
    },
    dur: 0.8,
  },

  // ── ACT 3 — THE THINKERS ───────────────────────────────────────────────────
  {
    act: 3,
    board: 'syllogism',
    narr: 2,                                       // present the board
    text: 'Aristotle was the first to write the machine down, around 350 BCE.',
    dur: 4.4,
  },
  {
    act: 3,
    board: 'syllogism',
    narr: 3,                                       // count off premises → conclusion
    text: 'Grant him the two premises and the conclusion follows whether you like it or not. No volume required.',
    cite: 'Aristotle, Prior Analytics',
    dur: 3.0,
  },
  {
    act: 3,
    // The scoreboard stays up while this is answered. It was the one beat in the
    // lesson with an empty stage — a lone figure on bare paper — and the running
    // count is the honest thing to leave on screen here: it states the quarrel's
    // tally (all volume, no reasons) without giving the answer away.
    vol: 10, reasons: 0,
    mc: {
      prompt: 'Which best describes a philosophical argument?',
      options: [
        { id: 'a', text: 'Premises offered to support a conclusion', correct: true },
        { id: 'b', text: 'A heated clash between two people', correct: false },
        { id: 'c', text: 'An opinion stated with great confidence', correct: false },
        { id: 'd', text: 'A long and confusing speech', correct: false },
      ],
      explain:
        'An argument is premises from which a conclusion follows. Volume and confidence have nothing to do with it.',
      xp: 5,
    },
    dur: 0.8,
  },
  {
    act: 3,
    board: 'loudness',
    narr: 0,                                       // open hand — the plain point
    text: 'Which is worth saying plainly, because almost everyone behaves as though the opposite were true.',
    dur: 4.6,
  },
  {
    act: 3,
    vol: 10, reasons: 0,
    mc: {
      prompt: 'Your friend shouts "Pineapple belongs on pizza!" louder each time. Is that an argument?',
      options: [
        { id: 'a', text: "No — it's a repeated claim with no reasons", correct: true },
        { id: 'b', text: 'Yes — they clearly disagree with someone', correct: false },
        { id: 'c', text: 'Yes — strong feelings make it an argument', correct: false },
        { id: 'd', text: 'Yes — saying it three times counts as proof', correct: false },
      ],
      explain:
        "Heat and repetition aren't reasons. Without premises supporting it, even a loud claim is just an assertion.",
      xp: 5,
    },
    dur: 0.8,
  },
  {
    act: 3,
    board: 'tworoads',
    narr: 5,                                       // sweep across the fork
    text: 'Schopenhauer noticed that people argue for two completely different reasons.',
    dur: 4.4,
  },
  {
    act: 3,
    board: 'tworoads',
    narr: 2,                                       // present the board
    text: 'To find out what is true — or simply to win. He was so struck by the second that he catalogued 38 tricks for winning when you are in the wrong.',
    cite: 'Schopenhauer, The Art of Being Right, 1831',
    dur: 3.2,
  },
  {
    act: 3,
    narr: 4,                                       // hand to chin — questioning
    stack: 2,
    text: 'Socrates went the other way. On trial for his life, he answered his accuser with nothing but questions.',
    dur: 4.0,
  },
  {
    act: 3,
    narr: 1,                                       // emphatic — the contradiction lands
    stack: 3,
    text: 'He asked Meletus who improves the young, and kept asking until Meletus contradicted himself in front of the whole court. Socrates never raised his voice — he did not need to.',
    cite: 'Plato, Apology, c. 399 BCE',
    dur: 3.6,
  },

  // ── ACT 4 — THE REMATCH ────────────────────────────────────────────────────
  {
    act: 4,
    vol: 3, reasons: 0,
    text: 'So let us give our two fighters the same disagreement — and reasons this time.',
    dur: 3.6,
  },
  {
    act: 4,
    vol: 3, reasons: 1,
    say: [{ who: 'red', text: 'Rents rose 40%. Wages did not.' }],
    text: 'A premise. Something that can be checked.',
    dur: 3.0,
  },
  {
    act: 4,
    vol: 3, reasons: 2,
    say: [{ who: 'blue', text: 'Then why did rents fall where we built more?' }],
    text: 'And a real counter — it engages the reason instead of the person.',
    dur: 3.2,
  },
  {
    act: 4,
    vol: 3, reasons: 2,
    text: 'Same two people. Same disagreement. Nobody threw a punch, and for the first time it can actually go somewhere.',
    dur: 3.4,
  },
  {
    act: 4,
    vol: 2, reasons: 2,
    text: 'Mill went further: you do not really understand your own position until you understand theirs.',
    cite: 'J.S. Mill, On Liberty, 1859',
    dur: 3.4,
  },

  // ── ACT 5 — PAYOFF ─────────────────────────────────────────────────────────
  {
    act: 5,
    quote: {
      id: 'lq-logic-arguments-1',
      text: 'The law is reason, free from passion.',
      author: 'Aristotle',
      work: 'Politics',
      era: 'c. 350 BCE',
    },
    dur: 2.4,
  },
  {
    act: 5,
    summary: {
      title: 'Argument Unlocked',
      points: [
        'An argument is premises supporting a conclusion',
        'Not a quarrel, and not a bare claim',
        'It gives reasons, not just confidence',
        'Socrates argued to test beliefs, not to win',
      ],
      closing: 'A clear set of reasons does more than a raised voice ever will.',
    },
    dur: 2.8,
  },
];

/** Beats that hold the reader until they answer, rather than until they tap. */
export function gates(b: Beat) {
  return Boolean(b.tap || b.mc);
}

/** Total XP on offer, so the reward screen can match the card runner's maths. */
export const TOTAL_MC = BEATS.filter((b) => b.mc).length;
