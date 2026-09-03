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
    g: 5, fill: 0.34, result: 0, mark: 0, labels: 0,
    dur: 3.8,
    text: 'The count is coming in. Two piles of marks, each one somebody who got up and went out on a wet Thursday.',
  },
  {
    g: 2, fill: 1, result: 1, mark: 0, labels: 0,
    dur: 4.2,
    text: 'And it is settled. The result would have been exactly the same if any one of these marks had never been made.',
    cite: 'Declared',
  },
  {
    g: 167, fill: 1, result: 1, mark: 1, labels: 0,
    dur: 3,
    text: 'Including yours. The odds of a single vote deciding a national election are worse than most lotteries.',
    cite: 'Yours',
  },
  {
    g: 167, fill: 1, result: 1, mark: 1, labels: 0,
    dur: 1.8,
    text: 'You knew that on the way to the hall.',
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
    text: 'But deciding the winner is not the only thing a mark can do. Look at the gap between the two piles — the bit of the top row that has nothing under it.',
    cite: 'The gap',
  },
  {
    g: 4, fill: 1, result: 1, mark: 1, labels: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the one thing your single mark reliably changes.',
      explain: 'The margin. Your vote will almost never decide who wins. It does move the gap by one, every time. And margins decide a great deal: how strong a mandate looks, where the money goes, which seats get fought next.',
      xp: 5,
    },
  },
  {
    g: 11, fill: 1, result: 1, mark: 1, labels: 1,
    dur: 1.0,
    interact: {
      prompt: 'Place the token on why voting is still rational.',
      field: {
        xLo: 'YOUR VOTE WILL NOT DECIDE IT', xHi: 'YOUR VOTE MIGHT DECIDE IT',
        yLo: 'A MARK DOES NOTHING ELSE', yHi: 'A MARK DOES OTHER THINGS',
        start: [0.76, 0.24],
        quads: [
          { id: 'yes', x: 0, y: 1, reads: 'never decides, still worth doing', correct: true },
          { id: 'no', x: 0, y: 0, reads: 'never decides, and worth nothing' },
          { id: 'lucky', x: 1, y: 1, reads: 'might decide, and worth doing anyway' },
          { id: 'thin', x: 1, y: 0, reads: 'might decide, and nothing more' },
        ],
      },
      explain: 'Top left. The classic slip is but what if nobody voted: what everyone else does is already fixed, so that was never the choice in front of you. Deciding the result is one thing a mark can do, and it was never the only one.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'One Mark, Reliably',
      points: [
        'Deciding an election is not what a vote is for',
        'A mark moves the margin by one, without fail',
        '"If nobody voted" is not a choice anyone faces',
        'Some acts are worth doing for what they express',
      ],
      closing: 'You are not one person deciding an election. You are one person deciding what the number says.',
    },
    dur: 3.0,
  },
];
