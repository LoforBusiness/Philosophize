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
// Above the track sits a three-column VERDICT BOARD — thinker · lens · ruling —
// and each column inks up as its philosopher speaks, so the three theories are a
// comparison you can read at a glance rather than three paragraphs in a row.
//
// The true/false question is answered IN the scene: the board clears and two big
// TRUE / FALSE plates take its place. The first graded question stays a deck
// question, so the two never feel identical.
//
// Graded questions are the two from data/.../what-makes-an-action-good.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics3Beat extends BaseBeat {
  /** Decider gesture (emote code). */ d?: number;
  /** Trolley position along the track. */ tx?: number;
  /** Lever thrown, switching the points to the branch (0/1). */ pull?: number;
  /** Which verdict column is inked: 0 none · 1 Mill · 2 Kant · 3 Aristotle. */ lens?: number;
}

export const BEATS: Ethics3Beat[] = [
  {
    d: 2, tx: 118, pull: 0, lens: 0,
    text: 'One choice. Three philosophers.',
    dur: 1.8,
  },
  {
    d: 2, tx: 118, pull: 0, lens: 0,
    text: 'Three verdicts. Same dilemma, same goal — yet they split.',
    dur: 2.4,
  },
  {
    d: 13, tx: 158, lens: 0,
    text: 'A runaway trolley hurtles toward five people on the track. Your hand rests on a lever.',
    cite: 'Philippa Foot, 1967',
    dur: 2.5,
  },
  {
    d: 13, tx: 158, lens: 0,
    text: 'Pull it, and the trolley swerves onto a side track — where one person stands instead.',
    dur: 2.5,
  },
  {
    d: 404, tx: 196, lens: 0,
    text: 'Pull the lever, do nothing, or search for another way? Three great theories answer the same question — what makes an action good?',
    dur: 4.2,
  },
  {
    d: 13, tx: 196, pull: 1, lens: 1,
    text: 'John Stuart Mill would pull. The right act promotes the most happiness, counting each person equally.',
    cite: 'Consequentialism — the outcome',
    dur: 2.3,
  },
  {
    d: 13, tx: 196, pull: 1, lens: 1,
    text: 'Five lives saved outweigh one lost. People who judge an act this way are called utilitarians.',
    dur: 2.3,
  },
  {
    d: 161, tx: 196, pull: 0, lens: 2,
    text: 'Immanuel Kant would not. He will not trade lives like sums, because the one person has a worth no arithmetic can outweigh.',
    cite: 'Deontology — the duty',
    dur: 3.8,
  },
  {
    d: 161, tx: 196, pull: 0, lens: 2,
    text: 'Duty binds whatever follows from it.',
    dur: 1.8,
  },
  {
    d: 22, tx: 196, lens: 3,
    text: 'Aristotle asks a different question: not "what do I do? but "who do I become?',
    cite: 'Virtue ethics — the character',
    dur: 2.9,
  },
  {
    d: 22, tx: 196, lens: 3,
    text: 'What would a person of practical wisdom do here?',
    dur: 1.8,
  },
  {
    d: 141, tx: 196, lens: 0,
    quote: {
      id: 'lq-ethics-ethics-3-1',
      text: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
      author: 'Immanuel Kant',
      philosopherId: 'immanuel-kant',
      work: 'Groundwork of the Metaphysics of Morals',
      era: '1785',
      branchSlugs: ['ethics'],
    },
    dur: 3.2,
  },
  {
    d: 21, tx: 196, lens: 0,
    interact: {
      prompt: 'Slide the seam to what a consequentialist actually weighs.',
      split: {
        left: 'WHAT HAPPENS NEXT', right: 'THE RULE YOU FOLLOWED',
        start: 0.04,
        zones: [
          { id: 'rule', upto: 0.3, reads: 'the rule counts, not the outcome' },
          { id: 'both', upto: 0.66, reads: 'the rule and the outcome, weighed against each other' },
          { id: 'out', upto: 1, reads: 'the outcome alone, and nothing else whatever', correct: true },
        ],
      },
      explain: 'All the way over. Consequentialism, and its famous form utilitarianism, weigh an act by what the act brings about, and above all by how much happiness comes of it. The other end of the bar is Kant, who does not look at the ending at all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    d: 4, tx: 196, lens: 0,
    // Answered ON the board: it clears and two big TRUE / FALSE plates take its place.
    interact: {
      prompt: 'Utilitarians and Kant both say "the end justifies the means." True?',
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
