import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-31, "The Coin Has No Memory".
//
// THE PICTURE: a run of flips laid out across the top of the stage, and an odds
// needle underneath it. The run grows to seven heads and the needle does not twitch
// once. The argument is the needle refusing to move.
//
// STAGING, deliberately unlike its siblings: the figure is SEATED at a table for
// the whole lesson rather than walking a track, the run is a FULL-WIDTH band across
// the top rather than a column stage right, and the answer is a point on a scale
// rather than a stack of cards.

export interface Logic31Beat extends BaseBeat {
  /** Seated gesture: 0 watching · 1 leaning in · 2 sure of it · 3 sitting back. */ p?: number;
  /** How many flips are on the table, 0…7. */ flips?: number;
  /** 1 = the odds scale is showing. */ scale?: number;
  /** 1 = the five ticks are live targets (Q1). */ pick?: number;
  /** 1 = the EIGHTH flip is on the table, still to be thrown ("?"). */ next?: number;
  /** 1 = the unmoved needle is ringed, as the narration says the chance is still one half. */ stress?: number;
  /** 1 = the flips are ruled apart from each other: each one is independent. */ apart?: number;
}

export const BEATS: Logic31Beat[] = [
  {
    p: 0, flips: 0,
    dur: 3.8,
    text: 'Suppose a fair coin is flipped again and again. On every flip, heads and tails are equally likely.',
  },
  {
    p: 1, flips: 3, scale: 1,
    dur: 1.8,
    text: 'The coin lands heads three times in a row. The probability of three heads in three flips is one in eight.',
    cite: 'Three in a row',
  },
  {
    p: 1, flips: 3, scale: 1,
    dur: 3.4,
    text: 'The chance of heads on the next flip is still one half. The three earlier heads leave it unchanged.',
  },
  {
    p: 2, flips: 7, scale: 1,
    dur: 3.8,
    text: 'After seven heads, tails feels overdue. The gambler’s fallacy is the belief that a run makes the opposite outcome more likely.',
    cite: 'Seven in a row',
  },
  {
    p: 2, flips: 7, scale: 1, next: 1, stress: 1,
    dur: 1.8,
    text: 'Yet the chance of heads on the eighth flip is still one half.',
  },
  {
    p: 3, flips: 7, scale: 1, next: 1,
    dur: 3.8,
    quote: {
      id: 'lq-logic-arguments-31-1',
      text: 'The theory of probabilities is at bottom nothing but common sense reduced to calculus.',
      author: 'Pierre-Simon Laplace',
      work: 'A Philosophical Essay on Probabilities',
      era: '1814',
      branchSlugs: ['logic'],
    },
  },
  {
    p: 1, flips: 7, scale: 1, next: 1,
    dur: 3.4,
    text: 'In 1913, a roulette wheel at Monte Carlo landed on black twenty-six times in a row. Gamblers lost heavily by betting that red was overdue.',
    cite: 'Monte Carlo, 1913',
  },
  {
    p: 1, flips: 7, scale: 1, next: 1, apart: 1,
    dur: 1.8,
    text: 'Each spin was independent. The outcome of one spin doesn’t change the chance of any other.',
  },
  {
    p: 2, flips: 7, scale: 1, pick: 1, next: 1, apart: 1,
    dur: 1.0,
    interact: {
      prompt: 'After seven heads in a row, what is the chance that the next flip lands heads?',
      explain: 'Fifty per cent, the same as before the run began. Coin flips are independent events. Nothing in the coin records earlier results, so the run can’t make tails more likely. A lower figure is the gambler’s fallacy.',
      xp: 5,
    },
  },
  {
    p: 3, flips: 7, scale: 1, next: 1, apart: 1,
    dur: 1.0,
    interact: {
      prompt: 'As flips accumulate, which curve shows how far the proportion of heads sits from one half?',
      plot: {
        axis: 'HOW FAR FROM HALF',
        cols: ['10 FLIPS', '100', '10,000', 'A MILLION'],
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'swamp', profile: [0.85, 0.55, 0.2, 0.04], reads: 'the gap narrows gradually towards zero', correct: true },
          { id: 'snap', profile: [0.85, 0.05, 0.05, 0.05], reads: 'the run is corrected almost at once' },
          { id: 'stay', profile: [0.85, 0.85, 0.85, 0.85], reads: 'the gap never narrows at all' },
        ],
      },
      explain: 'The gap narrows gradually towards zero. By the law of large numbers, the proportion of heads approaches one half. It does so because later flips dilute the run, not because they correct it. A quick correction would require the coin to register the run.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Gambler’s Fallacy',
      points: [
        'Independent events do not correct each other',
        'A run doesn’t change the chance of the next outcome',
        'Over many trials, new results dilute a run rather than reverse it',
        'At Monte Carlo in 1913, black came up twenty-six times',
      ],
      closing: 'A run is a fact about the past. For independent events, it gives no reason to expect a particular outcome next.',
    },
    dur: 3.0,
  },
];
