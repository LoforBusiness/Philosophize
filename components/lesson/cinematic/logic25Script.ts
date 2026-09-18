import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-25, "The Base-Rate Trap".
//
// THE PICTURE: two bars drawn TO SCALE — the one person the test caught, and the
// hundred it frightened for nothing. The whole lesson is that the honest bar is a
// sliver you can barely see next to the one beside it, and no amount of "99%
// accurate" changes the width of either.
//
// Q1 is answered on the chart (the picture has already given the ratio away); Q2 is
// A/B/C/D, because Steve-the-librarian needs the options read side by side (E34).

export interface Logic25Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** The POSITIVE result card is up, 0..1. */ result?: number;
  /** The true-positive bar is drawn, 0..1. */ real?: number;
  /** The false-positive bar is drawn, 0..1. */ fake?: number;
  /** 1 = the three answer cards are live (Q1). */ pick?: number;
  /** 1 = what the quick inference leaves out, beside the result it reads. */ rare?: number;
}

export const BEATS: Logic25Beat[] = [
  {
    p: 462, x: 70,
    text: 'Suppose a test that’s ninety-nine per cent accurate gives you a positive result for a disease. It seems to follow that you’re almost certainly ill.',
    dur: 3.7,
  },
  {
    p: 462, x: 70,
    rare: 1,
    text: 'That inference can be badly wrong, because it ignores how rare the disease is.',
    dur: 1.8,
  },
  {
    p: 437, x: 168, result: 1,
    text: 'The disease affects one person in ten thousand, which is its base rate. Suppose ten thousand people are tested.',
    cite: 'Ten thousand people',
    dur: 4.4,
  },
  {
    p: 383, x: 168, result: 1, real: 1,
    text: 'One of the ten thousand is ill, and the test almost certainly detects that person. That gives one true positive.',
    cite: 'The one true positive',
    dur: 4.0,
  },
  {
    p: 144, x: 124, result: 1, real: 1,
    quote: {
      id: 'lq-logic-arguments-25-1',
      text: 'A wise man proportions his belief to the evidence.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 449, x: 168, result: 1, real: 1, fake: 1,
    text: 'However, the test also wrongly flags one per cent of the healthy people. That’s about a hundred false positives, or false alarms.',
    cite: 'The hundred false alarms',
    dur: 4.8,
  },
  {
    p: 6, x: 124, result: 1, real: 1, fake: 1, pick: 1,
    interact: {
      prompt: 'Of everyone who tests positive, what proportion is ill?',
      explain: 'One in a hundred and one, which is under one per cent. The test is still ninety-nine per cent accurate. But the disease is so rare that false positives outnumber true ones a hundred to one. Ninety-nine in a hundred confuses the test’s accuracy with this proportion.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 124, result: 1, real: 1, fake: 1,
    interact: {
      prompt: 'Among shy, tidy men who are farmers or librarians, how do the two jobs divide?',
      split: {
        left: 'FARMERS', right: 'LIBRARIANS',
        start: 0.04,
        zones: [
          { id: 'lib', upto: 0.34, reads: 'mostly librarians, since they fit the type' },
          { id: 'even', upto: 0.62, reads: 'about evenly split between the two' },
          { id: 'farm', upto: 1, reads: 'mostly farmers, since farmers are far more numerous', correct: true },
        ],
      },
      explain: 'Mostly farmers, since farmers are far more numerous. Kahneman and Tversky used this case to show that people judge by resemblance and neglect base rates. Farmers so outnumber librarians that even a small share of them can exceed all the shy, tidy librarians.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Base-Rate Fallacy',
      points: [
        'Base rate: how common something is beforehand',
        'Start from the base rate, then adjust for evidence',
        'A positive result for a rare condition is often false',
        'The fallacy is to ignore the base rate',
      ],
      closing: 'To interpret a test result, consider both the test’s accuracy and how common the condition is.',
    },
    dur: 3.0,
  },
];
