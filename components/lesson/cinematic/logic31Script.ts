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
}

export const BEATS: Logic31Beat[] = [
  {
    p: 0, flips: 0,
    dur: 3.8,
    text: 'A fair coin, an ordinary table, and nothing up anyone\'s sleeve. Watch the run build and watch what your gut starts telling you.',
  },
  {
    p: 1, flips: 3, scale: 1,
    dur: 4.2,
    text: 'Three heads. Mildly interesting. The needle underneath is the actual chance of heads on the next flip, and it has not moved.',
    cite: 'Three in a row',
  },
  {
    p: 2, flips: 7, scale: 1,
    dur: 4.6,
    text: 'Seven. Now the feeling is loud: tails is DUE. Every part of you is certain the coin owes you one. Look at the needle.',
    cite: 'Seven in a row',
  },
  {
    p: 3, flips: 7, scale: 1,
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
    p: 1, flips: 7, scale: 1,
    dur: 4.8,
    text: 'In 1913 a Monte Carlo wheel came up black twenty-six times running. Players lost fortunes betting on red, each one certain it was overdue. The wheel had no idea what it had been doing.',
    cite: 'Monte Carlo, 1913',
  },
  {
    p: 2, flips: 7, scale: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Seven heads are on the table. Tap the chance the next flip is heads.',
      explain: 'Even, exactly as it was before the run started. The coin has no memory and no debts — nothing about it records what it has already done, so nothing about it can owe you a tails.',
      xp: 5,
    },
  },
  {
    p: 3, flips: 7, scale: 1,
    dur: 1.0,
    mc: {
      prompt: 'What exactly does the gambler\'s fallacy get wrong?',
      options: [
        { id: 'a', text: 'It treats independent events as if they balanced each other out', correct: true },
        { id: 'b', text: 'It underestimates how rare long runs really are', correct: false },
        { id: 'c', text: 'It assumes coins are fair when most are slightly weighted', correct: false },
        { id: 'd', text: 'It confuses probability with certainty', correct: false },
      ],
      explain: 'The trap: the law of large numbers is real. Over millions of flips the ratio does settle near half — but it settles by SWAMPING the run, never by correcting it. The coin owes the average nothing.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Coin Has No Memory',
      points: [
        'Independent events do not correct each other',
        'A run changes nothing about the next trial',
        'Averages swamp runs, they never cancel them',
        'Monte Carlo, 1913: twenty-six blacks running',
      ],
      closing: 'The wheel is not keeping score. Only you are.',
    },
    dur: 3.0,
  },
];
