import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-24, "When Does a Heap Stop Being a Heap?"
//
// THE PICTURE: a pile of grains and a verdict lamp reading HEAP. Grains come off
// one at a time and the lamp never once goes out — until the pile is a single grain
// and the lamp is still lit, which is absurd. Nothing in the lesson turns the lamp
// off, because there is no grain whose removal does it.
//
// Q1 is A/B/C/D (the false-precision dodge needs its rivals on the page); Q2 is
// answered on the pile (E34, H65).

export interface Meta24Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** How many grains are left, 0…18. */ grains?: number;
  /** 1 = the HEAP verdict lamp is showing. */ lamp?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Meta24Beat[] = [
  {
    p: 164, x: 70,
    text: 'Consider a heap of sand, and remove a single grain.',
    dur: 1.8,
  },
  {
    p: 402, x: 70,
    text: 'What remains is still a heap, which seems obvious. A single grain seems too small to make a difference.',
    dur: 3,
  },
  {
    p: 41, x: 168, grains: 18, lamp: 1,
    text: 'The case supports a general premise: removing one grain from a heap always leaves a heap. Each later step applies only this premise.',
    cite: 'The premise',
    dur: 4.8,
  },
  {
    p: 383, x: 168, grains: 9, lamp: 1,
    text: 'Apply the premise repeatedly. After half the grains are gone, the pile still counts as a heap, because no single removal changed the verdict.',
    cite: 'Halfway',
    dur: 4.2,
  },
  {
    p: 129, x: 124, grains: 9, lamp: 1,
    quote: {
      id: 'lq-metaphysics-being-24-1',
      text: 'Everything is vague to a degree you do not realize till you have tried to make it precise.',
      author: 'Bertrand Russell',
      philosopherId: 'bertrand-russell',
      work: 'The Philosophy of Logical Atomism',
      era: '1918',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.8,
  },
  {
    p: 29, x: 168, grains: 1, lamp: 1,
    text: 'Applied down to the last grain, the premise says a single grain is a heap. Every step seems valid and the premise seems true, yet the conclusion is false.',
    cite: 'One grain left',
    dur: 3,
  },
  {
    p: 258, x: 168, grains: 1, lamp: 1,
    text: 'This is the sorites paradox, named after the Greek word for heap. One of the assumptions must be given up, and philosophers disagree about which.',
    dur: 2.2,
  },
  {
    p: 165, x: 124, grains: 1, lamp: 1,
    interact: {
      prompt: 'In ordinary use, which curve shows how far a pile counts as a heap?',
      plot: {
        axis: 'HOW MUCH A HEAP',
        cols: ['1 GRAIN', '10', '100', '1000', '10000'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'slope', profile: [0.02, 0.2, 0.55, 0.85, 0.98], reads: 'more of a heap as grains are added', correct: true },
          { id: 'step', profile: [0, 0, 1, 1, 1], reads: 'a heap from exactly one hundred grains' },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5, 0.5], reads: 'no settled verdict at any size' },
        ],
      },
      explain: 'More of a heap as grains are added: ordinary use draws no sharp boundary. Defining a heap as a hundred grains replaces the vague word with a precise one. That changes the subject rather than solving the paradox.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, grains: 1, lamp: 1, pick: 1,
    interact: {
      prompt: 'Which grain’s removal turned the heap into a non-heap?',
      explain: 'None that can be identified. Each removal is harmless on its own, yet together the removals reach a conclusion no one accepts. Epistemicists hold that a sharp boundary exists but can’t be known.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Sorites Paradox',
      points: [
        'Individually harmless steps lead to a false conclusion',
        'Vague words like heap, bald and tall lack sharp boundaries',
        'Epistemicism: a sharp boundary exists but cannot be known',
        'Rival views posit truth-value gaps or degrees of truth',
      ],
      closing: 'Most everyday words are vague in this way. Yet people still use them successfully, and any theory of vagueness must explain how.',
    },
    dur: 3.0,
  },
];
