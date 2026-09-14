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
    text: 'Consider one moral choice, judged by three philosophers.',
    dur: 1.8,
  },
  {
    d: 2, tx: 118, pull: 0, lens: 0,
    text: 'All three seek the right action, yet their verdicts differ.',
    dur: 2.4,
  },
  {
    d: 13, tx: 158, lens: 0,
    text: 'Suppose a runaway trolley is heading towards five people on the track. You stand beside a lever.',
    cite: 'Foot, 1967 · Thomson, 1976',
    dur: 2.5,
  },
  {
    d: 13, tx: 158, lens: 0,
    text: 'If you pull it, the trolley switches to a side track, where it will kill one person instead.',
    dur: 2.5,
  },
  {
    d: 168, tx: 196, lens: 0,
    text: 'Three major ethical theories address the case. Each asks the same question: what makes an action good?',
    dur: 4.2,
  },
  {
    d: 13, tx: 196, pull: 1, lens: 1,
    text: 'John Stuart Mill’s utilitarianism says to pull the lever. For Mill, the right act produces the most happiness, counting each person equally.',
    cite: 'Consequentialism — the outcome',
    dur: 2.3,
  },
  {
    d: 13, tx: 196, pull: 1, lens: 1,
    text: 'Five lives saved outweigh one lost. Judging acts by outcomes is consequentialism, and Mill’s version is utilitarianism.',
    dur: 2.3,
  },
  {
    d: 458, tx: 196, pull: 0, lens: 2,
    text: 'Immanuel Kant’s ethics rejects the trade. It holds that the one person has a worth no arithmetic can outweigh.',
    cite: 'Deontology — the duty',
    dur: 3.8,
  },
  {
    d: 458, tx: 196, pull: 0, lens: 2,
    text: 'This worth is what Kant calls dignity. In deontology, the ethics of duty, a duty binds whatever the consequences.',
    dur: 1.8,
  },
  {
    d: 22, tx: 196, lens: 3,
    text: 'Aristotle shifts the question from the act to the agent. Who does this choice make you?',
    cite: 'Virtue ethics — the character',
    dur: 2.9,
  },
  {
    d: 22, tx: 196, lens: 3,
    text: 'In virtue ethics, the guide is what a practically wise person would do. Aristotle calls this wisdom phronesis.',
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
    d: 380, tx: 196, lens: 0,
    interact: {
      prompt: 'What does a consequentialist weigh in judging whether an act is right?',
      split: {
        left: 'THE OUTCOME', right: 'THE RULE FOLLOWED',
        start: 0.04,
        zones: [
          { id: 'rule', upto: 0.3, reads: 'only the rule followed, not the outcome' },
          { id: 'both', upto: 0.66, reads: 'both the rule and the outcome' },
          { id: 'out', upto: 1, reads: 'the outcome alone', correct: true },
        ],
      },
      explain: 'The outcome alone. Consequentialism judges an act only by what it brings about, and utilitarianism measures that in happiness. A rule matters only through its effects. Kant’s view sits at the opposite end: an act is judged by the principle behind it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    d: 165, tx: 196, lens: 0,
    // Answered ON the board: it clears and two big TRUE / FALSE plates take its place.
    interact: {
      prompt: 'Is it true that utilitarians and Kant both hold that the end justifies the means?',
      explain:
        'False. A utilitarian may let a good end justify the means. Kant forbids it: a person must never be treated merely as a means, whatever the consequences.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Three Lenses on Moral Action',
      points: [
        'Consequentialism: judge by the outcome',
        'Deontology: duty binds whatever the consequences',
        'Virtue ethics: ask what a person of good character would do',
        'Together they are the main theories of normative ethics',
      ],
      closing: 'In a hard case, applying all three shows where outcome, duty and character conflict.',
    },
    dur: 2.8,
  },
];
