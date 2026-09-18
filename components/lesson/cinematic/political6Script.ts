import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-6, "Justice as Fairness". Rawls's two principles, told
// with bar charts: an inequality is just only if it LIFTS the worst-off. Q1 is a scene
// tap between two societies (bars); Q2 is A/B/C/D on liberty's priority.

export interface Pol6Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** The two bar-chart societies shown 0..1. */ bars?: number;
  /** 1 = the ranked ladder (1 LIBERTY → 2 DIFFERENCE) is up. */ prin?: number;
  /** Q1: the two societies are tappable this beat. */ pick?: number;
  /** 1 = a "?" stands over each bar of the equal society in turn: any could be you. */ place?: number;
  /** 1 = the gap between the best and worst paid is measured and captioned. */ gap?: number;
  /** 1 = the worst-off bar is ticked and the best-off one goes quiet. */ judge?: number;
}

export const BEATS: Pol6Beat[] = [
  {
    p: 443, bars: 1,
    text: 'Would you accept this society if you turned out to be its poorest member? John Rawls made that question part of his test for a just society.',
    dur: 3.6,
  },
  {
    p: 418, bars: 1,
    place: 1,
    text: 'Behind the veil of ignorance, you choose principles without knowing your place in society. Rawls argues that this fair choice yields two principles, ranked in strict order.',
    cite: 'The two principles',
    dur: 4.8,
  },
  {
    p: 438, bars: 1, prin: 1,
    text: 'The first principle gives each person the same basic liberties. The second allows inequalities only if they help the worst off and attach to jobs open to all.',
    cite: 'Liberty first, then difference',
    dur: 5.0,
  },
  {
    p: 147, bars: 1, prin: 1,
    quote: {
      id: 'lq-political-political-6-1',
      text: 'Justice is the first virtue of social institutions, as truth is of systems of thought.',
      author: 'John Rawls',
      philosopherId: 'john-rawls',
      work: 'A Theory of Justice',
      era: '1971',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.4,
  },
  {
    p: 13, bars: 1, prin: 1,
    gap: 1,
    text: 'Suppose a surgeon earns far more than a clerk. Rawls’s difference principle asks whether that gap helps the worst off.',
    cite: 'The difference principle',
    dur: 1.8,
  },
  {
    p: 266, bars: 1, prin: 1,
    judge: 1,
    text: 'Higher pay is just if it draws talent that lifts the worst off above the equality line. Justice is judged by how the worst off fare, not the best off.',
    dur: 3.8,
  },
  {
    p: 383, bars: 1, prin: 1, pick: 1,
    interact: {
      prompt: 'Which of the two societies would Rawls choose, judging each by its worst off?',
      explain: 'The unequal society. There the worst off finish above the equality line, so the gap helps them. Rawls allows a gap only when it raises the worst off. The equal society may look fairer, but its worst off have less.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, bars: 1, prin: 1,
    interact: {
      prompt: 'How does Rawls rank the basic liberties against gains in wealth for the poorest?',
      split: {
        left: 'LIBERTIES SETTLED FIRST', right: 'TRADED FOR WEALTH',
        start: 0.04,
        zones: [
          { id: 'cash', upto: 0.3, reads: 'give up liberties whenever the poorest gain wealth' },
          { id: 'both', upto: 0.66, reads: 'weigh liberty against wealth case by case' },
          { id: 'first', upto: 1, reads: 'secure liberties first, then distribute wealth', correct: true },
        ],
      },
      explain: 'Liberties settled first. Rawls gives the basic liberties strict priority. They can’t be traded for wealth, even to help the poorest. Only once they’re secure for everyone does the difference principle apply to wealth.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Rawls’s Two Principles of Justice',
      points: [
        'Equal basic liberties have strict priority',
        'Inequalities must help the least advantaged',
        'An inequality is judged by how the worst off fare',
        'The principles are chosen behind a veil of ignorance',
      ],
      closing: 'A just society is one you’d accept before knowing your place in it.',
    },
    dur: 2.8,
  },
];
