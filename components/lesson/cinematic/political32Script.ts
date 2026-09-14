import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-32, "Why Vote At All?"
//
// THE PICTURE: two tallies counting in, and one mark in the middle of them that is
// yours. The scale is the argument — the reader has to look for their own tick among
// seventy-odd identical ones, and the smallness of it is the thing the lesson is
// about (H64).
//
// STAGING: the count COMES IN — a paper cover retreating left to right over a fixed
// row of ticks, so nothing squashes — and the answer targets are the result, the
// margin between the two piles, and a plate that says nothing changes at all (E33).

export interface Pol32Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How much of the count is in, 0…1. */ fill?: number;
  /** 1 = the result has been declared. */ result?: number;
  /** 1 = your own mark is picked out. */ mark?: number;
  /** 1 = the margin and the third option are labelled. */ labels?: number;
  /** 1 = the three answers are live targets (Q1). */ pick?: number;
}

export const BEATS: Pol32Beat[] = [
  {
    g: 440, fill: 0.34, result: 0, mark: 0, labels: 0,
    dur: 3.8,
    text: 'Consider an election count. Each mark is one citizen’s vote, cast at some cost in time and effort.',
  },
  {
    g: 466, fill: 1, result: 1, mark: 0, labels: 0,
    dur: 4.2,
    text: 'The result is declared. Removing any single mark from either pile wouldn’t have changed it.',
    cite: 'Declared',
  },
  {
    g: 459, fill: 1, result: 1, mark: 1, labels: 0,
    dur: 3,
    text: 'Your mark is no exception. In a large national election, one vote’s chance of deciding the result is tiny.',
    cite: 'Yours',
  },
  {
    g: 459, fill: 1, result: 1, mark: 1, labels: 0,
    dur: 1.8,
    text: 'Anthony Downs argued in 1957 that voting seems irrational. A vote’s tiny chance of deciding rarely repays its cost.',
  },
  {
    g: 139, fill: 1, result: 1, mark: 1, labels: 0,
    dur: 3.6,
    quote: {
      id: 'lq-political-political-32-1',
      text: 'The punishment which the wise suffer who refuse to take part in government, is to live under the government of worse men.',
      author: 'Plato',
      philosopherId: 'plato',
      work: 'Republic',
      era: 'c. 375 BC',
      branchSlugs: ['political-philosophy'],
    },
  },
  {
    g: 383, fill: 1, result: 1, mark: 1, labels: 1,
    dur: 4.8,
    text: 'But deciding the winner is not the only thing a mark can do. Each mark also shifts the margin.',
    cite: 'The margin',
  },
  {
    g: 461, fill: 1, result: 1, mark: 1, labels: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'What does a single vote reliably change, whatever the result?',
      explain: 'The margin. A single vote almost never decides who wins, but it always changes the margin by one. Margins matter: they affect how strong a winner’s mandate appears.',
      xp: 5,
    },
  },
  {
    g: 165, fill: 1, result: 1, mark: 1, labels: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which account gives a vote value whatever the result?',
      poll: {
        options: [
          { id: 'yes', reads: 'what the vote expresses, whoever wins', holders: ['Geoffrey Brennan', 'Loren Lomasky'], correct: true },
          { id: 'no', reads: 'a slim chance of deciding, rarely worth it', holders: ['Anthony Downs'] },
          { id: 'lucky', reads: 'a tiny chance of deciding, times vast stakes', holders: ['Derek Parfit', 'Aaron Edlin'] },
          { id: 'thin', reads: 'being among the votes that cause the result', holders: ['Richard Tuck', 'Alvin Goldman'] },
        ],
      },
      explain: 'What the vote expresses, whoever wins. Like cheering at a match, expressing support has value whatever the result. The expected-value account still rests on the chance of deciding.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'What a Single Vote Does',
      points: [
        'One vote almost never decides a large election',
        'Every vote changes the margin by one',
        'Downs: the chance of deciding rarely repays the cost',
        'Some acts are worth doing for what they express',
      ],
      closing: 'A single vote rarely settles who wins. It always changes the margin, and it expresses where the voter stands.',
    },
    dur: 3.0,
  },
];
