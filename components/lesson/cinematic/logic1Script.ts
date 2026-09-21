import type { BaseBeat } from './cinematicKit';

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

// ─────────────────────────────────────────────────────────────────────────────
// THE BEAT EXTENDS THE SHARED `BaseBeat` NOW, AND THAT IS THE WHOLE POINT.
//
// This lesson and logic-arguments-2 predate `CinematicPlayer` and carried their
// own copies of it, so for their whole life they were the only two lessons in the
// app that no corpus-wide pass could reach: 9 of the validators discover lessons
// by globbing `*Scene.tsx`, and a bespoke `*Lesson.tsx` is invisible to every one
// of them. The palette repaint, the depth kit, the gamified controls, the gaze,
// the wander, the thoughts, the pen and the tappable names all went to 244
// lessons and skipped these two — which a reader spotted from the outside, on the
// FIRST lesson in Logic.
//
// `text`, `cite`, `say`, `quote`, `tap`, `mc`, `summary` and `dur` were already
// declared here under the same names and compatible shapes, so conforming to the
// base type deletes them rather than rewriting them. What stays below is only
// what is genuinely this lesson's: its acts and its four stage channels.
//
// NOT ONE WORD OF ANY BEAT MAY CHANGE (AH8), and here it is stricter than usual:
// 20 of the 25 beats are VOICED, keyed by beat index, and `assets/narration/
// renders.json` records the words each WAV was rendered from. A merged or
// reordered beat is a failed `check:narration` and a bill at the TTS ledger.
// ─────────────────────────────────────────────────────────────────────────────
export interface Beat extends BaseBeat {
  act: 1 | 2 | 3 | 4 | 5;
  /** Speech bubbles over the boxers. Narrower than the base `Say['who']`. */
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
}

export const BEATS: Beat[] = [
  // ── ACT 1 — THE FIGHT ──────────────────────────────────────────────────────
  {
    act: 1,
    vol: 3, reasons: 0,
    text: 'Consider two people who disagree and who treat their disagreement as a fight.',
    dur: 2.2,
  },
  {
    act: 1,
    vol: 6, reasons: 0,
    say: [{ who: 'red', text: "YOU'RE WRONG!" }],
    text: 'What could settle a disagreement is what each side claims and why. The volume of their voices settles nothing.',
    dur: 2.6,
  },
  {
    act: 1,
    vol: 8, reasons: 0,
    say: [{ who: 'blue', text: "NO — YOU'RE WRONG!" }],
    text: 'Shouting a denial back isn’t a counter-argument. It denies the claim without offering any reason against it.',
    dur: 2.6,
  },
  {
    act: 1,
    vol: 10, reasons: 0,
    say: [
      { who: 'red', text: 'IDIOT!' },
      { who: 'blue', text: 'MORON!' },
    ],
    text: 'After three exchanges, the two have traded insults. Neither has given a reason.',
    dur: 2.8,
  },

  // ── ACT 2 — THE NARRATOR ───────────────────────────────────────────────────
  {
    act: 2,
    narr: 0,                                       // open hand, back toward the fight
    vol: 10, reasons: 0,
    text: 'In everyday speech, the word “argument” often means a shouting match.',
    dur: 3.4,
  },
  {
    act: 2,
    narr: 1,                                       // emphatic — "no way to end"
    vol: 10, reasons: 0,
    text: 'Such an exchange is a quarrel. Because a quarrel contains no reasons, nothing in it can settle the disagreement.',
    dur: 3.0,
  },
  {
    act: 2,
    board: 'anatomy',
    narr: 2,                                       // present the board
    text: 'In philosophy, the word “argument” has a technical meaning. An argument is a set of claims with a definite structure.',
    dur: 4.2,
  },
  {
    act: 2,
    board: 'anatomy',
    narr: 3,                                       // count off the parts
    text: 'Some of the claims, called premises, are offered as reasons. The claim these reasons support is the conclusion.',
    dur: 3.0,
  },
  {
    act: 2,
    vol: 10, reasons: 0,
    tap: {
      prompt: 'Which of these statements offers a reason that could serve as a premise?',
      options: [
        { id: 'a', text: '"You clearly know nothing about this."', correct: false },
        { id: 'b', text: '"Rents rose 40% while wages stayed flat."', correct: true },
      ],
      explain:
        '“Rents rose 40% while wages stayed flat” offers a reason. A checkable fact about rents and wages bears on the dispute. A remark about the speaker’s ignorance attacks a person, not a claim.',
    },
    dur: 0.8,
  },

  // ── ACT 3 — THE THINKERS ───────────────────────────────────────────────────
  {
    act: 3,
    board: 'syllogism',
    narr: 2,                                       // present the board
    text: 'In the fourth century BCE, Aristotle gave the first account of deductive argument.',
    dur: 4.4,
  },
  {
    act: 3,
    board: 'syllogism',
    narr: 3,                                       // count off premises → conclusion
    text: 'In a syllogism, two premises fix the conclusion, so accepting them means accepting it too.',
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
        { id: 'd', text: 'A claim repeated until accepted', correct: false },
      ],
      explain:
        'Premises offered to support a conclusion. That’s what an argument is in philosophy. Heat, confidence and repetition add no support to a claim.',
      xp: 5,
    },
    dur: 0.8,
  },
  {
    act: 3,
    board: 'loudness',
    narr: 0,                                       // open hand — the plain point
    text: 'The loudness of a claim has no bearing on whether it’s true. Only reasons and evidence bear on that.',
    dur: 4.6,
  },
  {
    act: 3,
    vol: 10, reasons: 0,
    mc: {
      prompt: 'A friend repeats “Pineapple belongs on pizza!” more loudly each time. Is that an argument?',
      options: [
        { id: 'a', text: "No — it's a repeated claim with no reasons", correct: true },
        { id: 'b', text: 'Yes — they clearly disagree with someone', correct: false },
        { id: 'c', text: 'Yes — strong feelings make it an argument', correct: false },
        { id: 'd', text: 'Yes — saying it three times counts as proof', correct: false },
      ],
      explain:
        "No, it’s a repeated claim with no reasons. Repetition and volume give no support to a claim. Without premises, even a forceful claim remains a bare assertion.",
      xp: 5,
    },
    dur: 0.8,
  },
  {
    act: 3,
    board: 'tworoads',
    narr: 5,                                       // sweep across the fork
    text: 'Arthur Schopenhauer distinguished two aims a person can have in arguing.',
    dur: 4.4,
  },
  {
    act: 3,
    board: 'tworoads',
    narr: 2,                                       // present the board
    text: 'One aim is to establish the truth, and the other is to win. Schopenhauer listed thirty-eight stratagems for winning, whether or not you’re in the right.',
    cite: 'The Art of Being Right',
    dur: 3.2,
  },
  {
    act: 3,
    narr: 4,                                       // hand to chin — questioning
    stack: 2,
    text: 'Socrates argued to test claims rather than to win. At his trial in 399 BCE, he cross-examined his accuser Meletus with questions.',
    dur: 4.0,
  },
  {
    act: 3,
    narr: 1,                                       // emphatic — the contradiction lands
    stack: 3,
    text: 'Meletus said that every Athenian improves the young except Socrates. Socrates showed the claim was absurd by asking whether the same holds for horses.',
    cite: 'Plato, Apology',
    dur: 3.6,
  },

  // ── ACT 4 — THE REMATCH ────────────────────────────────────────────────────
  {
    act: 4,
    vol: 3, reasons: 0,
    text: 'Now suppose the same two people take up the same disagreement again, this time with reasons.',
    dur: 3.6,
  },
  {
    act: 4,
    vol: 3, reasons: 1,
    say: [{ who: 'red', text: 'Rents rose 40%. Wages did not.' }],
    text: 'The first speaker now offers a premise: rents have risen while wages haven’t. It’s a factual claim, so it can be checked.',
    dur: 3.0,
  },
  {
    act: 4,
    vol: 3, reasons: 2,
    say: [{ who: 'blue', text: 'Then why did rents fall where we built more?' }],
    text: 'The second speaker replies that rents fell where more housing was built. That reply challenges the reasoning, not the person.',
    dur: 3.2,
  },
  {
    act: 4,
    // AH1 — the third reason is on the table, so the meter that counts them moves.
    // Beat 20 left it at 2 and this beat held there, which made the tap change
    // nothing but the words: "let's compare the cities" is an offered test, and an
    // offered test is a reason. The count is cumulative, so it only ever grows.
    vol: 3, reasons: 3,
    say: [{ who: 'red', text: 'Fair. Let\'s compare the cities.' }],
    text: 'The people and the disagreement are unchanged. Because each side now gives reasons, the exchange can make progress.',
    dur: 3.4,
  },
  {
    act: 4,
    // Three reasons are on the table by now and the volume is what comes down,
    // which is this beat's own event.
    vol: 2, reasons: 3,
    text: 'John Stuart Mill argued further that you understand your own view only once you understand the opposing one.',
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
      philosopherId: 'aristotle',
      work: 'Politics',
      era: 'c. 350 BCE',
    },
    dur: 2.4,
  },
  {
    act: 5,
    summary: {
      title: 'What an Argument Is',
      points: [
        'An argument is premises supporting a conclusion',
        'A quarrel or a bare claim isn’t an argument',
        'Confidence and volume add no support to a claim',
        'Socrates argued to test beliefs, not to win',
      ],
      closing: 'A disagreement can make progress only when each side gives reasons the other can examine.',
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
