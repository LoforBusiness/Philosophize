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
    text: 'Sherlock Holmes never deduced anything. He guessed, brilliantly.',
    dur: 4.0,
  },
  {
    p: 259, x: 28, bench: 0.34,
    text: 'Deduction runs from a rule to a conclusion that can’t be false.',
    dur: 4.2,
  },
  {
    p: 438, x: 28, bench: 0.67, feed: 1,
    text: 'Induction runs from many cases to a rule that’s probably right.',
    dur: 4.2,
  },
  {
    p: 264, x: 28, bench: 1, feed: 1, out: 1,
    text: 'Abduction runs from what you see to the likeliest reason you’re seeing it.',
    dur: 4.8,
  },
  {
    p: 261, x: 28, bench: 1, feed: 1, out: 1, live: 1,
    interact: {
      prompt: 'A burst pipe, a flooded kitchen. Tap the engine.',
      explain: 'Abduction. It feels like deduction because the answer is obvious, and obvious is not guaranteed. A blocked drain would flood the same floor. You’re picking the likeliest reason for what you can see, and staying open to a better one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 424, x: 88, bench: 1, feed: 1, out: 1,
    text: 'Look at what comes out. Deduction hands back the shape you fed it.',
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
    text: 'That certainty has a price. A guaranteed conclusion tells you nothing new.',
    dur: 4.4,
  },
  {
    p: 168, x: 88, bench: 1, feed: 1, out: 1,
    interact: {
      prompt: 'Every sunrise so far. Which engine takes it?',
      sort: {
        chip: 'a thousand sunrises',
        bins: [
          { id: 'ded', label: 'deduction', reads: 'the conclusion could not have been false' },
          { id: 'ind', label: 'induction', reads: 'many cases, so probably the rule', correct: true },
          { id: 'abd', label: 'abduction', reads: 'the likeliest reason for what you saw' },
        ],
      },
      explain: 'Induction. A pile of cases going to a rule is what induction is for, and one black swan still breaks it. Deduction would need a rule already in hand, and abduction hunts for a cause rather than a pattern.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, bench: 1, feed: 1, out: 1,
    summary: {
      title: 'Three Engines',
      points: [
        'Deduction is certain and adds nothing new',
        'Induction generalises from cases and may fail',
        'Abduction reaches for the best explanation',
        'Detective work is nearly all the third one',
      ],
      closing: 'Match the engine to the job. Certainty, a generalisation, or the best guess available at the time.',
    },
    dur: 4.6,
  },
];
