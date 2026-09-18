import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-12, "Kant's One Rule For All Rules" — the categorical
// imperative, taught at a copying press.
//
// THE PICTURE: one card reading "I PROMISE", and a press that stamps copies of it.
// Kant's test is "what if everyone did this?", so the lesson simply RUNS it — the
// board fills with identical cards, and as they multiply the word PROMISE goes pale
// on every one of them until nothing is left to read. Universalised, the maxim eats
// the practice it depends on. The change in the picture IS the argument.
//
// Q1 is A/B/C/D in the deck (telling Kant's test apart from outcome-counting, which
// needs the options read side by side — E34); Q2 is answered on the stage, by tapping
// the one maxim of three that survives being made a law (H65).

export interface Ethics12Beat extends BaseBeat {
  /** Figure gesture (emote code). 26 is the one that STRIKES the press handle. */ p?: number;
  /** Where the figure stands (stage x). 56 = downstage left, 124 = at the press. */ x?: number;
  /** How many maxim cards are on the board: 1 the original · 3 · 12 the full field. */ n?: number;
  /** How much of the word PROMISE has gone from every card. 0 legible … 1 blank. */ word?: number;
  /** 1 = the three candidate maxims replace the field, for Q2. */ pick?: number;
  /**
   * 1 = a dashed line brackets the field of copies, showing the maxim
   * adopted "at once" by everyone. One beat only.
   */
  suppose?: boolean;
  /**
   * 1 = a diagonal strike crosses the board of blank cards, showing the
   * practice of promising has been destroyed. Stays once it lands.
   */
  strike?: boolean;
}

export const BEATS: Ethics12Beat[] = [
  {
    p: 462, x: 56, n: 1, word: 0,
    text: 'Kant proposed a single test for whether an action is permissible. Could you consistently will that everyone act on the same rule?',
    dur: 3.8,
  },
  {
    p: 418, x: 124, n: 1, word: 0,
    text: 'Suppose you need money and promise to repay a loan, knowing you can’t. Kant calls the principle behind such an act its maxim.',
    cite: 'The maxim',
    dur: 4.8,
  },
  {
    p: 276, x: 124, n: 3, word: 0.55,
    text: 'Kant never asks what the act costs you. He asks whether your rule could be a law that everyone follows.',
    cite: 'The test',
    dur: 3.1,
  },
  {
    p: 276, x: 124, n: 3, word: 0.55, suppose: true,
    text: 'So suppose everyone adopted the maxim of false promising at once.',
    dur: 1.8,
  },
  {
    p: 141, x: 124, n: 3, word: 0.55,
    quote: {
      id: 'lq-ethics-ethics-12-1',
      text: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
      author: 'Immanuel Kant',
      work: 'Groundwork of the Metaphysics of Morals',
      era: '1785',
      philosopherId: 'immanuel-kant',
      branchSlugs: ['ethics'],
    },
    dur: 3.6,
  },
  {
    p: 465, x: 124, n: 12, word: 1,
    text: 'If everyone promised falsely when in need, no one would believe a promise. Promises would become empty words.',
    cite: 'The maxim universalised',
    dur: 4,
  },
  {
    p: 465, x: 124, n: 12, word: 1, strike: true,
    text: 'The maxim therefore contradicts itself. As a universal law, it would destroy the practice of promising it relies on.',
    dur: 1.8,
  },
  {
    p: 457, x: 124, n: 12, word: 1, strike: true,
    interact: {
      prompt: 'Which of these principles could permit breaking the promise?',
      sort: {
        chip: 'breaking a promise',
        bins: [
          { id: 'means', label: 'never a means', reads: 'never use another person merely as a means' },
          { id: 'law', label: 'a universal rule', reads: 'act only on a maxim you could universalise' },
          { id: 'happy', label: 'more people happy', reads: 'break it if that makes more people happy', correct: true },
        ],
      },
      explain: 'More people happy. Only a rule that looks at outcomes could allow the broken promise. Kant’s two tests both forbid it. The maxim can’t be a universal law, and it treats the lender merely as a means.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, x: 124, n: 12, word: 1, strike: true, pick: 1,
    interact: {
      prompt: 'Which of these three maxims could be willed as a universal law?',
      explain: 'Keep the promises you make. If everyone kept promises, promising would still work. But if everyone broke promises or lied when it suited them, no one would believe a promise or a statement. So those two maxims can’t be universal laws.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 124, n: 12, word: 1, strike: true, pick: 1,
    summary: {
      title: 'The Categorical Imperative',
      points: [
        'A maxim is the principle behind an action',
        'Ask whether it could hold as a universal law',
        'A maxim that contradicts itself when universalised is forbidden',
        'The test examines the maxim, not the consequences',
      ],
      closing: 'Kant also gives a second formulation: treat humanity never merely as a means, but always as an end.',
    },
    dur: 3.0,
  },
];
