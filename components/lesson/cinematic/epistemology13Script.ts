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
    p: 462, x: 70,
    text: 'Suppose a fair lottery has a million tickets and a single winner. You hold ticket forty thousand and one.',
    dur: 2.1,
  },
  {
    p: 462, x: 70,
    text: 'At odds of a million to one, believing that your ticket will lose seems rational.',
    dur: 2.3,
  },
  {
    p: 437, x: 168, grid: 1,
    text: 'Twenty tickets stand in for the million. The argument is the same for any number of tickets.',
    cite: 'The draw',
    dur: 4.0,
  },
  {
    p: 394, x: 168, grid: 1, off: 1,
    text: 'At a million to one, you believe the first ticket will lose. The belief is still not certain, yet it’s better supported than much ordinary knowledge.',
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
    text: 'The same reasoning applies to every ticket, so each belief that a ticket will lose is justified.',
    cite: 'All of them',
    dur: 2.4,
  },
  {
    p: 29, x: 168, grid: 1, off: 2, winner: 1,
    text: 'Together, the verdicts imply that no ticket wins, yet you know one ticket will. Henry Kyburg set out this lottery paradox in 1961.',
    dur: 2.6,
  },
  {
    p: 165, x: 124, grid: 1, off: 2, winner: 1,
    interact: {
      prompt: 'Which curve shows how reasonable the belief that a ticket loses becomes as tickets are added?',
      plot: {
        axis: 'HOW REASONABLE',
        cols: ['2 TICKETS', '10', '100', '1000', 'A MILLION'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'rise', profile: [0.1, 0.4, 0.72, 0.9, 0.98], reads: 'the more tickets, the safer each verdict', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5, 0.5], reads: 'the number of tickets makes no difference' },
          { id: 'fall', profile: [0.95, 0.7, 0.4, 0.2, 0.05], reads: 'the more tickets, the weaker each verdict' },
        ],
      },
      explain: 'The more tickets, the safer each verdict. Yet all the verdicts together are false, because one ticket must win. Henry Kyburg concluded that justified beliefs don’t always combine into a justified conjunction.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, x: 124, grid: 1, off: 2, winner: 1, pick: 1,
    interact: {
      prompt: 'You’re justified in believing each ticket loses. Which ticket, then, will win?',
      explain: 'No idea. You can’t name the winner, yet you know that one ticket wins. The paradox lies between what you believe of each ticket and what you believe of all.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Lottery Paradox',
      points: [
        'Each belief that a ticket loses is justified',
        'Together, those beliefs deny that the draw has a winner',
        'Justified beliefs may not combine into a justified conjunction',
        'Demanding certainty instead would rule out most knowledge',
      ],
      closing: 'If justified belief needs only high probability, the lottery paradox follows. If it needs certainty, little is left.',
    },
    dur: 3.0,
  },
];
