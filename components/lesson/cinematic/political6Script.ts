import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-6, "Justice as Fairness". Rawls's two principles, told
// with bar charts: an inequality is just only if it LIFTS the worst-off. Q1 is a scene
// tap between two societies (bars); Q2 is A/B/C/D on liberty's priority.

export interface Pol6Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** The two bar-chart societies shown 0..1. */ bars?: number;
  /** 1 = the ranked ladder (1 LIBERTY → 2 DIFFERENCE) is up. */ prin?: number;
  /** Q1: the two societies are tappable this beat. */ pick?: number;
}

export const BEATS: Pol6Beat[] = [
  {
    p: 2, bars: 1,
    text: 'Would you accept this society if you turned out to be the poorest in it? Rawls turned that question into a test for justice itself.',
    dur: 3.6,
  },
  {
    p: 418, bars: 1,
    text: 'Back behind the veil of ignorance — choose the rules not knowing who you will be. From that fair start, Rawls says, two principles fall out, in strict order.',
    cite: 'The two principles',
    dur: 4.8,
  },
  {
    p: 3, bars: 1, prin: 1,
    text: 'First: each person gets the same basic liberties, and these come first. Second: inequalities are allowed only if they help the least advantaged and attach to jobs open to all.',
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
    text: 'A surgeon earns far more than a clerk. Not necessarily.',
    cite: 'The difference principle',
    dur: 1.8,
  },
  {
    p: 13, bars: 1, prin: 1,
    text: 'If the higher pay draws talent that makes even the worst-off better than under equal pay, the gap is just. The test is the bottom, not the top.',
    dur: 3.8,
  },
  {
    p: 383, bars: 1, prin: 1, pick: 1,
    interact: {
      prompt: 'Rawls judges a society by its worst-off — the dark bar. Tap the one he would choose.',
      explain: 'Under the unequal rules the worst-off finish ABOVE the equality line, so that gap earns its keep. Rawls allows a difference only when it lifts the least advantaged — the yardstick is the bottom, never the top.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, bars: 1, prin: 1,
    interact: {
      prompt: 'How does Rawls order the two?',
      split: {
        left: 'LIBERTIES SETTLED FIRST', right: 'TRADED FOR THE POOREST',
        start: 0.04,
        zones: [
          { id: 'cash', upto: 0.3, reads: 'trade the liberties away whenever the poorest gain' },
          { id: 'both', upto: 0.66, reads: 'weigh liberty against money case by case' },
          { id: 'first', upto: 1, reads: 'liberties settled first, and only then the money', correct: true },
        ],
      },
      explain: 'All the way over. Helping the poor sounds like grounds for a trade, and Rawls will not allow one: the basic liberties have strict priority. Only once they are secured for everybody does the difference principle get to speak about wealth.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Fairness Has a Structure',
      points: [
        'Equal basic liberties come first, always',
        'Inequalities must help the least advantaged',
        'The test is the bottom, not the top',
        'Justice judged from behind the veil',
      ],
      closing: 'A just society is one you would accept before knowing your place in it.',
    },
    dur: 2.8,
  },
];
