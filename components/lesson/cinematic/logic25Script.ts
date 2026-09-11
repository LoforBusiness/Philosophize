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
}

export const BEATS: Logic25Beat[] = [
  {
    p: 462, x: 70,
    text: 'A test that’s ninety-nine per cent accurate says you have a disease. Almost everyone reads that as “almost certainly ill”.',
    dur: 3.7,
  },
  {
    p: 462, x: 70,
    text: 'Almost everyone is wrong.',
    dur: 1.8,
  },
  {
    p: 437, x: 168, result: 1,
    text: 'The disease hits one person in ten thousand. So take ten thousand people and run the test on all of them, and just count what comes out.',
    cite: 'Ten thousand people',
    dur: 4.4,
  },
  {
    p: 383, x: 168, result: 1, real: 1,
    text: 'One person in the crowd is actually ill, and the test almost certainly catches them. There they are, a bar one unit wide.',
    cite: 'The one real case',
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
    text: 'But one per cent of everyone else tests positive too. One per cent of a big number is a big number: a hundred people get the same letter you did.',
    cite: 'The hundred false alarms',
    dur: 4.8,
  },
  {
    p: 6, x: 124, result: 1, real: 1, fake: 1, pick: 1,
    interact: {
      prompt: 'Of everyone this test calls positive, how many are actually ill?',
      explain: 'One in a hundred and one, which is under one per cent. The test really is ninety-nine per cent accurate. It’s the disease being rare that does this. A very good test against a very rare thing still produces mostly false alarms.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 124, result: 1, real: 1, fake: 1,
    interact: {
      prompt: 'How do the shy, tidy people divide between the two jobs?',
      split: {
        left: 'FARMERS', right: 'LIBRARIANS',
        start: 0.04,
        zones: [
          { id: 'lib', upto: 0.34, reads: 'mostly librarians, he fits the type' },
          { id: 'even', upto: 0.62, reads: 'about evenly split between the two' },
          { id: 'farm', upto: 1, reads: 'mostly farmers, there are far more', correct: true },
        ],
      },
      explain: 'Nearly all farmers, and the description doesn’t save you. Farmers outnumber librarians many times over. Even a small share of shy, tidy farmers outweighs every librarian alive. That’s the case Kahneman and Tversky made, and the seam is where the arithmetic lands.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Base-Rate Trap',
      points: [
        'Base rate: how common something is beforehand',
        'Start from the base rate, then adjust for evidence',
        'Rare events stay rare even after a strong signal',
        'The fallacy: vivid evidence drowns the background',
      ],
      closing: 'Before you ask how good the test is, ask how many people it’s being pointed at.',
    },
    dur: 3.0,
  },
];
