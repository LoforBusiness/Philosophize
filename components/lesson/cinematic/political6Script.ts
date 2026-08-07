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
    p: 1, bars: 1,
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
    p: 0, bars: 1, prin: 1,
    quote: {
      id: 'lq-political-political-6-1',
      text: 'Justice is the first virtue of social institutions, as truth is of systems of thought.',
      author: 'John Rawls',
      work: 'A Theory of Justice',
      era: '1971',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.4,
  },
  {
    p: 13, bars: 1, prin: 1,
    text: 'A surgeon earns far more than a clerk. Unfair? Not necessarily. If the higher pay draws talent that makes even the worst-off better than under equal pay, the gap is just. The test is the bottom, not the top.',
    cite: 'The difference principle',
    dur: 5.2,
  },
  {
    p: 13, bars: 1, prin: 1, pick: 1,
    interact: {
      prompt: 'Rawls judges a society by its worst-off — the dark bar. Tap the one he would choose.',
      explain: 'Under the unequal rules the worst-off finish ABOVE the equality line, so that gap earns its keep. Rawls allows a difference only when it lifts the least advantaged — the yardstick is the bottom, never the top.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, bars: 1, prin: 1,
    mc: {
      prompt: 'Rawls protects the worst-off. So can his liberty principle be traded away to boost their wealth?',
      options: [
        { id: 'a', text: 'Yes, Rawls let basic freedoms be sacrificed for extra income', correct: false },
        { id: 'b', text: 'No — equal basic liberties come first and cannot be bought off', correct: true },
        { id: 'c', text: 'Yes, Rawls ranked wealth above all the liberties', correct: false },
        { id: 'd', text: 'No, because Rawls rejected liberty as a value entirely', correct: false },
      ],
      explain: 'The trap: helping the poor sounds like grounds to trade liberty for cash. But Rawls gives the basic liberties strict priority; only once they are secured does the difference principle apply.',
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
