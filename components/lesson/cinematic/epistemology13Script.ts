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
    p: 25, x: 70,
    text: 'A fair lottery, a million tickets, one winner. You hold ticket 400,001. Will it win? No. You would say that flatly, and you would be right.',
    dur: 4.4,
  },
  {
    p: 41, x: 168, grid: 1,
    text: 'Here are twenty of them, to keep the drawing manageable. Nothing about the argument changes with the count.',
    cite: 'The draw',
    dur: 4.0,
  },
  {
    p: 40, x: 168, grid: 1, off: 1,
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
    text: 'The same reasoning covers every ticket, so strike them all. Read the grid now. You have just said this draw has no winner — and you know it does.',
    cite: 'All of them',
    dur: 5.0,
  },
  {
    p: 4, x: 124, grid: 1, off: 2, winner: 1,
    mc: {
      prompt: 'Every verdict is reasonable, yet together they are false. What gives?',
      options: [
        { id: 'a', text: 'Knowing each separately is not knowing them all at once', correct: true },
        { id: 'b', text: 'One of the individual verdicts must secretly be false', correct: false },
        { id: 'c', text: 'High probability is never enough for knowledge, ever', correct: false },
        { id: 'd', text: 'A million is simply too large a number to reason about', correct: false },
      ],
      explain: 'The trap: B and C both look decisive. B cannot say WHICH verdict fails. C throws out almost everything you know, since nearly all of it rests on probability rather than proof.',
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
      closing: 'Almost everything you know is a very good bet. This is the bill that comes with that.',
    },
    dur: 3.0,
  },
];
