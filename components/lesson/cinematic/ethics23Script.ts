import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-23, "The Child In The Pond".
//
// THE PICTURE: two gauges of what you owe — one to the child at your feet, one to
// the child eight thousand miles away. The near gauge fills instantly and without
// argument. The lesson is spent asking what could justify the far one staying
// lower, finding nothing, and watching it come level.
//
// Q1 is answered on the gauges; Q2 is A/B/C/D, because the diffusion-of-
// responsibility reply has to be read to be recognised (E34).

export interface Ethics23Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** The two gauges are drawn, 0..1. */ gauges?: number;
  /** How full the NEAR obligation reads, 0..1. */ near?: number;
  /** How full the FAR obligation reads, 0..1. */ far?: number;
  /** 1 = the three answer cards are live (Q1). */ pick?: number;
}

export const BEATS: Ethics23Beat[] = [
  {
    p: 462, x: 70,
    text: 'Suppose you pass a shallow pond where a small child is drowning. Wading in to save the child would ruin an expensive pair of shoes.',
    dur: 3.5,
  },
  {
    p: 462, x: 70,
    text: 'Peter Singer holds that you ought to wade in. The ruined shoes are insignificant beside the death of a child.',
    dur: 1.8,
  },
  {
    p: 442, x: 168, gauges: 1, near: 1,
    text: 'Your obligation to the child at your feet is therefore at its fullest. The verdict seems to need no argument at all.',
    cite: 'The child at your feet',
    dur: 4.2,
  },
  {
    p: 383, x: 124, gauges: 1, near: 1,
    text: 'Now suppose a second child, eight thousand miles away, is dying of a preventable disease. You could save this child with the same certainty, at the same small cost.',
    cite: 'The child far away',
    dur: 4.6,
  },
  {
    p: 129, x: 124, gauges: 1, near: 1,
    quote: {
      id: 'lq-ethics-ethics-23-1',
      text: 'If it is in our power to prevent something bad from happening, without sacrificing anything of comparable moral importance, we ought, morally, to do it.',
      author: 'Peter Singer',
      philosopherId: 'peter-singer',
      work: 'Famine, Affluence, and Morality',
      era: '1972',
      branchSlugs: ['ethics'],
    },
    dur: 4.0,
  },
  {
    p: 167, x: 168, gauges: 1, near: 1, far: 1,
    text: 'Singer asks what could justify a weaker obligation to the distant child. It can’t be the cost, because the cost is the same.',
    cite: 'No morally relevant difference',
    dur: 2.2,
  },
  {
    p: 167, x: 168, gauges: 1, near: 1, far: 1,
    text: 'Nor can it be your ability to help, which is also equal. For Singer, the only difference left is distance, and distance is not a moral property.',
    dur: 3.2,
  },
  {
    p: 6, x: 124, gauges: 1, near: 1, far: 1, pick: 1,
    interact: {
      prompt: 'What is the only difference between the near child and the far child?',
      explain: 'Distance. The cost, the certainty and your power to act are the same in both cases. Singer challenges anyone to show why distance alone should make a moral difference.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 124, gauges: 1, near: 1, far: 1,
    interact: {
      prompt: 'Which curve shows how much of the duty stays yours as more others are able to help?',
      plot: {
        axis: 'HOW MUCH IS YOURS',
        cols: ['YOU ALONE', '10 OTHERS', '1000', 'A MILLION'],
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'flat', profile: [0.95, 0.93, 0.92, 0.9], reads: 'it stays yours, however many could help', correct: true },
          { id: 'fall', profile: [0.95, 0.5, 0.1, 0.02], reads: 'it falls to nearly nothing in a crowd' },
          { id: 'share', profile: [0.95, 0.6, 0.35, 0.2], reads: 'it shrinks steadily but never vanishes' },
        ],
      },
      explain: 'The duty stays yours, however many could help. The falling curves express diffusion of responsibility, the tendency to feel less obliged when others could act. Singer replies that you aren’t less obliged to save the child when others stand by doing nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Distance and the Duty to Help',
      points: [
        'The pond: you ought to rescue when the cost is small',
        'Singer argues distance is morally irrelevant',
        'Effective altruism asks how to do the most good',
        'Critics object that the principle is too demanding',
      ],
      closing: 'If Singer is right, giving to famine relief is a moral duty, not charity.',
    },
    dur: 3.0,
  },
];
