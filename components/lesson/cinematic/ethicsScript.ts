import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Script for the cinematic version of ethics-ethics-1, "Why Humans Care About
// Right and Wrong".
// Theme: A HALLWAY MIRROR AT NIGHT, AND A FOUND WALLET.
//
// He picks a found wallet up off the hall floor, and the reflection in the hall
// mirror — his conscience — stops copying him and weighs the deed on a balance. The
// diary on the hall table sets what animals share beside what only a person does;
// the bookcase holds three answers to where conscience comes from; a plant on the
// windowsill grows into Aristotle's flourishing.
//
// Redrawn 2026-09-25 after the logic debate studio. The narration is unchanged; the
// first question moved onto the stage, as three notes stuck to the mirror.
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
  /** The headline gains its second line: the judgement is about YOUR OWN CONDUCT. */
  own?: boolean;
  /** Reasons for and against drop into the balance's pans. */
  reasons?: boolean;
  /** The origin card's heading turns from a question to DISPUTED. */
  disputed?: boolean;
  /** The ledger's YOU column is lit: reason is what sets humans apart. */
  you?: boolean;
  /** A seedling, before the flourishing it grows into has a name. */
  seed?: boolean;
  /** A flower opens at the sprout's tip once flourishing is named — the life cycle completing, "over a complete life". */
  bloom?: boolean;
  /** Aristotle's question is written in the night window: WHAT MAKES A LIFE GO WELL? */
  good?: boolean;
  /** The question is asked ON THE STAGE: three notes stuck to the mirror. */
  pick?: boolean;
}

export const BEATS: EthicsBeat[] = [
  {
    hpose: 1,                                        // act — a deed is done
    text: 'Suppose you’ve just done something. Afterwards, without anyone asking, a question about the act comes to mind.',
    dur: 2.2,
  },
  {
    hpose: 257,                                      // thinking it over — the question has arrived (moves hold 158)
    own: true,
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
    reasons: true,
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
    disputed: true,
    hpose: 4,
    judge: true,
    origins: true,
    text: 'The origin of conscience is disputed. Darwin locates it in instinct, Freud in society turned inward, and Kant in reason itself.',
    dur: 2.3,
  },
  {
    good: true,
    hpose: 2,
    text: 'Aristotle asked a different question. He asked not which rules to follow, but what makes a human life go well.',
    cite: 'Aristotle, Nicomachean Ethics',
    dur: 1.8,
  },
  {
    good: true,
    you: true,
    hpose: 2,
    text: 'Aristotle held that reason is the capacity that distinguishes human beings from other living things.',
    dur: 2.1,
  },
  {
    good: true,
    hpose: 259,                                      // explaining, the hands never quite stop (moves hold 160)
    you: true,
    seed: true,
    text: 'So, for Aristotle, living well means exercising reason well, and doing so over a complete life.',
    dur: 1.8,
  },
  {
    good: true,
    seed: true,
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
    seed: true,
    hpose: 4,
    judge: true,
    weigh: 'q1',
    pick: true,
    interact: {
      prompt: 'What sets a person apart from other social animals?',
      explain: 'Judging their own acts. Chimpanzees and capuchin monkeys also show sympathy and a sense of fairness, so neither is the difference. A person can step back from an act and weigh reasons for and against it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    seed: true,
    judge: true,
    weigh: 'q2',
    interact: {
      prompt: 'Put these in order, from least to most of a conscience.',
      order: {
        axis: 'LEAST FIRST',
        items: [
          { id: 'none', reads: 'NO PART OF ONE' },
          { id: 'feel', reads: 'THE MORAL FEELINGS' },
          { id: 'judge', reads: 'JUDGING YOUR OWN CONDUCT' },
        ],
      },
      explain: 'The apes reach the middle. Sympathy, fairness and something like resentment are all observed; what hasn\'t been shown is the reflective step of weighing your own past conduct against a standard and finding it wanting.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    good: true,
    hpose: 2,
    plant: true,
    text: 'Aristotle calls the highest human good eudaimonia. It’s often translated as happiness, but it’s an activity, not a feeling.',
    dur: 2.2,
  },
  {
    good: true,
    hpose: 2,
    plant: true,
    bloom: true,
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
