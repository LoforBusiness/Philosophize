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
}

export const BEATS: Logic33Beat[] = [
  {
    p: 25, x: 52, bend: 0,
    text: 'Seven measurements, and a straight line drawn through them. It misses most of the dots and nobody is pretending otherwise.',
    dur: 3.8,
  },
  {
    p: 47, x: 52, bend: 0.5,
    text: 'Give the line a couple of bends and the line starts to behave. Now the line runs near every dot, and still looks like a finding.',
    cite: 'A couple of bends',
    dur: 4.4,
  },
  {
    p: 19, x: 52, bend: 1,
    text: 'Keep going and you can thread every single dot exactly. Perfect fit. Nothing left over, and no measurement unexplained.',
    cite: 'A perfect fit',
    dur: 4.2,
  },
  {
    p: 4, x: 52, bend: 1, nextDot: 1,
    text: 'Then a new measurement comes in, and the perfect curve is nowhere near it. It was never learning the pattern. It was learning your seven dots, errors and all.',
    cite: 'The eighth measurement',
    dur: 4.8,
  },
  {
    p: 137, x: 52, bend: 1, nextDot: 1,
    quote: {
      id: 'lq-logic-arguments-33-1',
      text: 'Everything should be made as simple as possible, but not simpler.',
      author: 'Albert Einstein',
      work: 'attributed',
      era: 'attributed',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 4, x: 52, bend: 0, live: 1,
    interact: {
      prompt: 'Drag the bends in. Stop where the curve explains the dots without chasing them.',
      drag: {
        lo: 'A STRAIGHT LINE',
        hi: 'THROUGH EVERY DOT',
        start: 0,
        zones: [
          { id: 'under', upto: 0.28, reads: 'misses the pattern' },
          { id: 'right', upto: 0.66, reads: 'explains the pattern', correct: true },
          { id: 'over', upto: 1, reads: 'has learned your errors' },
        ],
      },
      explain: 'The middle, and both ends fail for opposite reasons. Too straight and it misses structure that is really there. Too bendy and it fits your measurement errors as carefully as your measurements.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 52, bend: 0.5, nextDot: 1,
    text: 'That is what the razor is really for. Between two accounts that fit the evidence equally, take the one with fewer parts. Every extra part is another thing that can be wrong.',
    cite: 'Occam’s razor',
    dur: 5.0,
  },
  {
    p: 45, x: 52, bend: 0.5, nextDot: 1,
    interact: {
      prompt: 'So can an explanation be too simple?',
      cards: [
        { text: 'Yes, it can miss real structure', correct: true },
        { text: 'No, simplest is always best', correct: false },
      ],
      explain: 'The razor only chooses between accounts that fit EQUALLY WELL. A straight line drawn through genuinely curved data is not admirably economical. It is false. That is exactly why the rule ends "but not simpler".',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'As Simple As Possible',
      points: [
        'Any dots can be threaded by a bendy enough curve',
        'Extra parts fit the noise as well as the signal',
        'The razor chooses between equally good fits',
        'Too simple is a failure too, not a virtue',
      ],
      closing: 'Ask of any explanation: how much of this is doing work, and how much is here to cover one awkward fact?',
    },
    dur: 3.0,
  },
];
