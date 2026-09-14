import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Script for the cinematic version of ethics-ethics-1, "Why Humans Care About
// Right and Wrong". Theme: THE CONSCIENCE THAT STEPS OUT.
//
// A figure acts; then a faint second self — his conscience — steps out of him,
// turns back, and weighs the deed on a balance. The ledger above him sets what an
// animal shares, the raw materials of morality (it cares, it plays fair), beside
// the one thing only a person does: step out of itself to ask "was that right?".
// That reflective step is the whole lesson.
//
// The two graded questions are lifted from data/.../why-humans-care-about-right-
// and-wrong.ts so scoring matches the card runner.
// ─────────────────────────────────────────────────────────────────────────────

export interface EthicsBeat extends BaseBeat {
  /** Human pose: 0 stand · 1 act (reach/take) · 2 present · 3 count · 4 reflect. */
  hpose?: number;
  /** The conscience self has stepped out (and the balance is present). */
  judge?: boolean;
  /**
   * The animal comparison opens: the ledger writes its two shared rows from the
   * first beat that sets this. No animal is drawn (one was, until 11 Sep 2026).
   */
  critter?: boolean;
  /** A sprout — Aristotle's flourishing. */
  plant?: boolean;
  /**
   * The three-source card: where conscience is said to come from. A pure scene cue
   * for the beat that names Darwin, Freud and Kant — their three answers are a
   * three-row table, so the stage draws one instead of repeating the beat before it.
   */
  origins?: boolean;
  /** This beat's answer drives the scene: q1 raises the conscience, q2 parts them. */
  weigh?: 'q1' | 'q2';
}

export const BEATS: EthicsBeat[] = [
  {
    hpose: 1,                                        // act — a deed is done
    text: 'Suppose you’ve just done something. Afterwards, without anyone asking, a question about the act comes to mind.',
    dur: 2.2,
  },
  {
    hpose: 1,                                        // act — a deed is done
    text: 'The question is whether the act was right. It’s a judgement about your own conduct.',
    dur: 1.8,
  },
  {
    hpose: 2,
    critter: true,
    text: 'Other social animals show sympathy and a sense of fairness. Darwin argued that human morality grew from such instincts.',
    dur: 4.2,
  },
  {
    hpose: 4,
    judge: true,
    text: 'Humans add a further capacity, reflection. A person can step back from a deed and ask whether it was right.',
    dur: 2.2,
  },
  {
    hpose: 4,
    judge: true,
    text: 'The answer is given in reasons, weighed for and against the act. No other animal is known to deliberate in this way.',
    dur: 1.8,
  },
  {
    hpose: 4,
    judge: true,
    origins: true,
    text: 'That inward weighing is your conscience. It judges your own acts even when no one else can see them.',
    cite: 'Darwin · Freud · Kant',
    dur: 2.3,
  },
  {
    hpose: 4,
    judge: true,
    origins: true,
    text: 'The origin of conscience is disputed. Darwin locates it in instinct, Freud in society turned inward, and Kant in reason itself.',
    dur: 2.3,
  },
  {
    hpose: 2,
    text: 'Aristotle asked a different question. He asked not which rules to follow, but what makes a human life go well.',
    cite: 'Aristotle, Nicomachean Ethics',
    dur: 1.8,
  },
  {
    hpose: 2,
    text: 'Aristotle held that reason is the capacity that distinguishes human beings from other living things.',
    dur: 2.1,
  },
  {
    hpose: 2,
    text: 'So, for Aristotle, living well means exercising reason well, and doing so over a complete life.',
    dur: 1.8,
  },
  {
    hpose: 0,
    quote: {
      id: 'lq-ethics-ethics-1-1',
      text: 'The unexamined life is not worth living.',
      author: 'Socrates',
      work: 'Plato, Apology 38a',
      era: 'c. 399 BCE',
      philosopherId: 'socrates',
      branchSlugs: ['ethics'],
    },
    dur: 2.6,
  },
  {
    hpose: 4,
    judge: true,
    weigh: 'q1',
    interact: {
      prompt: 'What sets a person apart from other social animals?',
      cards: [
        { text: 'Judging their own acts by reasons', correct: true },
        { text: 'Feeling empathy for others', correct: false },
      ],
      explain: 'Judging their own acts by reasons. Chimpanzees and capuchin monkeys also show empathy and a sense of fairness, so empathy isn’t the difference. A person can also step back from an act and ask whether it was right.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    judge: true,
    weigh: 'q2',
    interact: {
      prompt: 'How much of a human conscience do the great apes already share?',
      drag: {
        lo: 'NONE OF IT',
        hi: 'ALL OF IT',
        start: 1,
        zones: [
          { id: 'none', upto: 0.26, reads: 'no part of a conscience' },
          { id: 'parts', upto: 0.72, reads: 'the moral feelings, not reflective judgement', correct: true },
          { id: 'all', upto: 1, reads: 'all of it, reflective judgement included' },
        ],
      },
      explain: 'The moral emotions, but not reflective judgement. Great apes show empathy, fairness and distress at another’s suffering. They appear to lack the step of asking, in words, whether an act was right. Feeling those emotions isn’t the same as judging one’s own conduct.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    hpose: 2,
    plant: true,
    text: 'Aristotle calls the highest human good eudaimonia. It’s often translated as happiness, but it’s an activity, not a feeling.',
    dur: 2.2,
  },
  {
    hpose: 2,
    plant: true,
    text: 'Flourishing is a closer translation. It means living and acting well, from a virtuous character, over a complete life.',
    dur: 2.2,
  },
  {
    summary: {
      title: 'Conscience and the Good Life',
      points: [
        'Humans share moral emotions with other social animals',
        'Humans alone judge their own acts by reasons',
        'The origin of conscience remains disputed',
        'Aristotle asks what makes a life flourish, not which rules to follow',
      ],
      closing: 'Asking whether an act was right is where ethics begins.',
    },
    dur: 2.8,
  },
];
