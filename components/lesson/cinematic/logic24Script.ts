import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-24, "The Three Ways to Reason"
// Theme: A ROW OF ENGINES, AND ONE THAT PUTS OUT A SHAPE IT WAS NOT GIVEN.
//
// Peirce's claim is about what each engine PRODUCES, so the scene draws the
// output and lets the shapes carry it. The same token goes into all three. Out of
// deduction comes the same token; out of induction comes a longer bar; out of
// abduction comes a disc, which is a shape nothing fed in.
//
// The three boxes are identical. Nothing about an engine's housing says how much
// its answer can be trusted, and a drawing that made abduction look flimsier would
// be arguing the lesson's point in the furniture rather than in the output.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — the engines themselves, and the reader taps the one
//     that named the burst pipe. On the stage because all three are in front of
//     them with their outputs showing.
//   · beat 8  a SORT — a run of sunrises dropped into the engine that handles it.
//     The reader's own chip lights the engine, so choosing IS pointing at one.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic24Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the three engines are on the bench, 0…1. */ bench?: number;
  /** 1 = the token going in is drawn above each engine. */ feed?: number;
  /** 1 = what each engine puts out is drawn below it. */ out?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic24Beat[] = [
  {
    p: 356, x: 28,
    text: 'Sherlock Holmes calls his method deduction. Most of his conclusions are in fact inferences to the best explanation.',
    dur: 4.0,
  },
  {
    p: 259, x: 28, bench: 0.34,
    text: 'Deduction moves from premises to a conclusion that must be true if the premises are true.',
    dur: 4.2,
  },
  {
    p: 438, x: 28, bench: 0.67, feed: 1,
    text: 'Induction moves from many observed cases to a general rule that’s probably true, but not certain.',
    dur: 4.2,
  },
  {
    p: 264, x: 28, bench: 1, feed: 1, out: 1,
    text: 'Abduction moves from an observation to the hypothesis that would best explain it.',
    dur: 4.8,
  },
  {
    p: 261, x: 28, bench: 1, feed: 1, out: 1, live: 1,
    interact: {
      prompt: 'Which form of reasoning concludes from a flooded kitchen that a pipe has burst?',
      explain: 'Abduction. The conclusion feels certain, but a blocked drain could flood the same floor, so the evidence doesn’t guarantee it. That rules out deduction. Abduction infers the likeliest explanation and stays open to a better one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 424, x: 88, bench: 1, feed: 1, out: 1,
    text: 'A deduction’s conclusion already sits inside the premises that feed it. The inference just states what they say.',
    dur: 4.4,
  },
  {
    p: 430, x: 88, bench: 1, feed: 1, out: 1,
    quote: {
      id: 'lq-logic-arguments-24-1',
      text: 'Abduction is the process of forming an explanatory hypothesis. It is the only logical operation which introduces any new idea.',
      author: 'Charles Sanders Peirce',
      philosopherId: 'charles-sanders-peirce',
      work: 'Collected Papers',
      era: 'c. 1903',
      branchSlugs: ['logic'],
    },
    dur: 5.0,
  },
  {
    p: 448, x: 88, bench: 1, feed: 1, out: 1,
    text: 'Deduction’s certainty has a cost. The conclusion adds no fact that the premises did not already give.',
    dur: 4.4,
  },
  {
    p: 168, x: 88, bench: 1, feed: 1, out: 1,
    interact: {
      prompt: 'Which form of reasoning concludes, from every sunrise so far, that the sun will rise tomorrow?',
      sort: {
        chip: 'every sunrise so far',
        bins: [
          { id: 'ded', label: 'deduction', reads: 'a conclusion guaranteed by the premises' },
          { id: 'ind', label: 'induction', reads: 'from many cases to a probable rule', correct: true },
          { id: 'abd', label: 'abduction', reads: 'the best account of what happened' },
        ],
      },
      explain: 'Induction. It moves from many cases to a general rule, and one contrary case could still overturn that rule. Deduction would need the rule as a premise from the start. Abduction looks for the best explanation of one event rather than a pattern.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, bench: 1, feed: 1, out: 1,
    summary: {
      title: 'Deduction, Induction, Abduction',
      points: [
        'Deduction is certain and adds nothing new',
        'Induction generalises from cases and may fail',
        'Abduction infers the best explanation',
        'Most detective reasoning is abductive',
      ],
      closing: 'Each form of reasoning yields something different: certainty, a probable rule, or the best available explanation.',
    },
    dur: 4.6,
  },
];
