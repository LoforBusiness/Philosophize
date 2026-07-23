import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-3, "What Makes an Action Good?" — the trolley problem.
// A runaway trolley rolls toward five; a lever would divert it onto one. A decider
// stands at the lever while three philosophers pass three different verdicts:
// Mill (pull — five outweigh one), Kant (never — dignity is not arithmetic),
// Aristotle (what would a person of character do?). The decider's body shifts with
// each verdict — grips the lever, then crosses the arms in refusal, then a hand to
// the heart — so one figure carries all three stances.
//
// Graded questions are the two from data/.../what-makes-an-action-good.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics3Beat extends BaseBeat {
  /** Decider gesture (emote code). */ d?: number;
  /** Trolley position along the track. */ tx?: number;
  /** Lever pulled / switch thrown to the branch (0/1). */ pull?: number;
}

export const BEATS: Ethics3Beat[] = [
  {
    d: 2, tx: 150, pull: 0,
    text: 'One choice. Three philosophers. Three verdicts. Same dilemma, same goal — yet they split. Why?',
    dur: 3.4,
  },
  {
    d: 13, tx: 182,
    text: 'A runaway trolley hurtles toward five people on the track. Your hand rests on a lever. Pull it, and the trolley swerves onto a side track — where one person stands instead.',
    cite: 'Philippa Foot, 1967',
    dur: 5.0,
  },
  {
    d: 27, tx: 214,
    text: 'Pull the lever, do nothing, or search for another way? Three great theories answer the same question — what makes an action good?',
    dur: 4.2,
  },
  {
    d: 13, tx: 214,
    text: 'John Stuart Mill would pull. The right act promotes the most happiness, counting each person equally. Five lives saved outweigh one lost.',
    cite: 'Consequentialism — the outcome',
    dur: 4.6,
  },
  {
    d: 10, tx: 214,
    text: 'Immanuel Kant would not. He refused to trade lives like sums — the one has a dignity no arithmetic outweighs. Duty binds, whatever follows.',
    cite: 'Deontology — the duty',
    dur: 4.8,
  },
  {
    d: 22, tx: 214,
    text: 'Aristotle asks a different question: not "what do I do?" but "who do I become?" What would a person of practical wisdom do here?',
    cite: 'Virtue ethics — the character',
    dur: 4.6,
  },
  {
    d: 0, tx: 214,
    quote: {
      id: 'lq-ethics-ethics-3-1',
      text: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
      author: 'Immanuel Kant',
      work: 'Groundwork of the Metaphysics of Morals',
      era: '1785',
      branchSlugs: ['ethics'],
    },
    dur: 3.2,
  },
  {
    d: 21, tx: 214,
    mc: {
      prompt: 'Which theory weighs an action purely by the consequences it brings?',
      options: [
        { id: 'a', text: 'Virtue ethics', correct: false },
        { id: 'b', text: 'Deontology', correct: false },
        { id: 'c', text: 'Consequentialism', correct: true },
        { id: 'd', text: 'Moral relativism', correct: false },
      ],
      explain:
        'Consequentialism, and its famous form utilitarianism, pins an action’s worth entirely on its results — above all the happiness produced.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    d: 4, tx: 214,
    mc: {
      prompt: 'Utilitarians and Kant both say "the end justifies the means." True?',
      options: [
        { id: 't', text: 'True', correct: false },
        { id: 'f', text: 'False', correct: true },
      ],
      explain:
        'A utilitarian may let good ends justify the means, but Kant flatly forbids it: never treat a person merely as a means, whatever follows.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Three Lenses on Moral Action',
      points: [
        'Consequentialism: judge by the outcome',
        'Deontology: duty binds whatever follows',
        'Virtue ethics: good acts, good character',
        'These three pillars form normative ethics',
      ],
      closing: 'Next hard choice, run all three — outcome, duty, character — and watch where they clash.',
    },
    dur: 2.8,
  },
];
