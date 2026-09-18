import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-33, "How Simple Should an Explanation Be?" — the DRAG
// mechanic (../DragScale) wired to the number of BENDS in a curve.
//
// Seven measured dots sit on a grid and never move. The reader drags complexity
// and watches the curve go from a straight line that misses most of them, through
// a shape that fits, to a whipping thing that threads every dot exactly — and the
// readout tells them what that costs on the next measurement. The graded answer is
// the middle, which is the only question in the app whose correct answer is
// literally "not at either end".
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic33Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many bends the curve has, 0 straight … 1 threading every dot. */ bend?: number;
  /** 1 = the eighth dot (the new measurement) is on the grid. */ nextDot?: number;
  /** 1 = the reader is driving the curve from the rail (Q1). */ live?: number;
  /** 1 = a ring confirms each of the seven measured dots — nothing is left unexplained. */ matched?: number;
  /** 1 = a dashed line marks the gap between the curve's end and the eighth measurement — the overfit named. */ gap?: number;
  /** 1 = the plain, zero-bend line appears beneath the curve — the extra parts added beyond it. */ base?: number;
}

export const BEATS: Logic33Beat[] = [
  {
    p: 172, x: 52, bend: 0,
    text: 'Consider seven measurements plotted on a graph, with a straight line drawn through them. The line is simple, but it misses most of the points.',
    dur: 3.8,
  },
  {
    p: 386, x: 52, bend: 0.5,
    text: 'A moderately curved line fits much better. It passes near every point and still describes a general pattern.',
    cite: 'A moderate curve',
    dur: 4.4,
  },
  {
    p: 19, x: 52, bend: 1,
    text: 'Add enough bends, and a curve can pass through every point. Its fit to the seven measurements is perfect.',
    cite: 'A perfect fit',
    dur: 2.7,
  },
  {
    p: 169, x: 52, bend: 1, matched: 1,
    text: 'No measurement is left unexplained, so this curve seems to be the best available account of the data.',
    dur: 1.8,
  },
  {
    p: 467, x: 52, bend: 1, nextDot: 1,
    text: 'However, an eighth measurement falls far from the perfect curve. A curve can fit past data and still fail to predict new data.',
    cite: 'The eighth measurement',
    dur: 3.3,
  },
  {
    p: 467, x: 52, bend: 1, nextDot: 1, gap: 1,
    text: 'The curve had fitted the errors in the seven measurements along with the pattern. This failure is called overfitting.',
    dur: 1.8,
  },
  {
    p: 456, x: 52, bend: 1, nextDot: 1,
    quote: {
      id: 'lq-logic-arguments-33-1',
      text: 'Everything should be made as simple as possible, but not simpler.',
      author: 'Albert Einstein',
      work: 'attributed',
      era: '1900s',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 461, x: 52, bend: 0, live: 1,
    interact: {
      prompt: 'How complex should the curve be to fit the pattern but not the errors?',
      drag: {
        lo: 'A STRAIGHT LINE',
        hi: 'THROUGH EVERY POINT',
        start: 0,
        zones: [
          { id: 'under', upto: 0.28, reads: 'underfits, and misses the real pattern' },
          { id: 'right', upto: 0.66, reads: 'fits the pattern, not the errors', correct: true },
          { id: 'over', upto: 1, reads: 'overfits, and fits the measurement errors' },
        ],
      },
      explain: 'Fits the pattern, not the errors. A straight line underfits, because it misses a pattern present in the data. A curve through every point overfits, because it treats measurement error as pattern.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 52, bend: 0.5, nextDot: 1,
    text: 'Occam’s razor is named after William of Ockham. It says to prefer the account with fewer parts when two fit the evidence equally well.',
    cite: 'Occam’s razor',
    dur: 3.4,
  },
  {
    p: 167, x: 52, bend: 0.5, nextDot: 1, base: 1,
    text: 'Every extra part is another assumption that could be false, and another way to fit measurement error.',
    dur: 1.8,
  },
  {
    p: 45, x: 52, bend: 0.5, nextDot: 1,
    interact: {
      prompt: 'Can an explanation be too simple?',
      cards: [
        { text: 'Yes, it can miss real structure', correct: true },
        { text: 'No, the simplest is always best', correct: false },
      ],
      explain: 'An explanation can be too simple when it misses real structure. The razor chooses only between accounts that fit the evidence equally well. A straight line through curved data doesn’t fit the evidence, so the razor gives it no support.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Occam’s Razor and Overfitting',
      points: [
        'A complex enough curve can pass through any set of points',
        'Extra parts fit measurement error as well as the pattern',
        'Occam’s razor chooses only between equally good fits',
        'An explanation that misses real structure is too simple',
      ],
      closing: 'Ask which parts of an explanation account for the evidence, and which were added to fit a single result.',
    },
    dur: 3.0,
  },
];
