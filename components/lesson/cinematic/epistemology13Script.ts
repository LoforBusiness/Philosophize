import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-13, "The Ticket You Know Will Lose" — the
// lottery paradox.
//
// THE PICTURE: a grid of tickets. Every one of them gets struck through, one
// reasonable verdict at a time, until the whole grid is struck — and the line
// underneath still says a winner exists. The contradiction is not narrated; it is
// simply the state the picture ends in.
//
// Q1 is A/B/C/D (where the reasoning breaks needs weighing); Q2 is answered on the
// grid, because "point at the winner" is exactly what a picture can ask (H65).

export interface Epi13Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 70 = downstage left, 168 = at the grid. */ x?: number;
  /** The ticket grid is up, 0..1. */ grid?: number;
  /** How many tickets are struck through: 0 none · 1 the first · 2 all of them. */ off?: number;
  /** 1 = the "this draw has a winner" line is showing. */ winner?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
}

export const BEATS: Epi13Beat[] = [
  {
    p: 164, x: 70,
    text: 'A fair lottery, a million tickets, one winner. You hold ticket 400,001.',
    dur: 2.1,
  },
  {
    p: 164, x: 70,
    text: 'Will it win? You would say that flatly, and you would be right.',
    dur: 2.3,
  },
  {
    p: 41, x: 168, grid: 1,
    text: 'Here are twenty of them, to keep the drawing manageable. Nothing about the argument changes with the count.',
    cite: 'The draw',
    dur: 4.0,
  },
  {
    p: 394, x: 168, grid: 1, off: 1,
    text: 'Strike the first one out. You are 99.9999% sure — better odds than most things you happily claim to know, including who your neighbours are.',
    cite: 'One verdict',
    dur: 4.8,
  },
  {
    p: 139, x: 124, grid: 1, off: 1,
    quote: {
      id: 'lq-epistemology-knowledge-13-1',
      text: 'A wise man proportions his belief to the evidence.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    p: 29, x: 168, grid: 1, off: 2, winner: 1,
    text: 'The same reasoning covers every ticket, so strike them all. Read the grid now.',
    cite: 'All of them',
    dur: 2.4,
  },
  {
    p: 29, x: 168, grid: 1, off: 2, winner: 1,
    text: 'You have just said this draw has no winner — and you know it does.',
    dur: 2.6,
  },
  {
    p: 4, x: 124, grid: 1, off: 2, winner: 1,
    interact: {
      prompt: 'Draw how reasonable "this ticket loses" gets as more tickets are added.',
      plot: {
        axis: 'HOW REASONABLE',
        cols: ['2 TICKETS', '10', '100', '1000', 'A MILLION'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'rise', profile: [0.1, 0.4, 0.72, 0.9, 0.98], reads: 'the more tickets, the safer each verdict', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5, 0.5], reads: 'the count makes no difference at all' },
          { id: 'fall', profile: [0.95, 0.7, 0.4, 0.2, 0.05], reads: 'the more tickets, the weaker each verdict' },
        ],
      },
      explain: 'It climbs, and that is the sting. Every verdict gets MORE reasonable as tickets are added, and the whole set gets more certainly false, because one ticket wins. Believing each is not believing all. And nothing says which belief is wrong.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, grid: 1, off: 2, winner: 1, pick: 1,
    interact: {
      prompt: 'You are sure of every verdict up there. Tap the ticket that wins.',
      explain: 'You cannot name one, and you cannot deny there is one. That gap — between what you can say about each ticket and what you can say about all of them — is the whole paradox.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Reasonable Steps, Absurd Total',
      points: [
        'Each ticket verdict is individually justified',
        'Together they deny the draw has a winner',
        'Knowledge may not survive being added up',
        'Demanding certainty would erase most of it',
      ],
      closing: 'Almost everything you know is a very good bet. The rows on stage are the bill that comes with betting.',
    },
    dur: 3.0,
  },
];
