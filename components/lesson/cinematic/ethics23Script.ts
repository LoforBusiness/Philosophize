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
    p: 164, x: 70,
    text: 'You pass a shallow pond and a small child is drowning in it. Wading in ruins an expensive pair of shoes.',
    dur: 3.5,
  },
  {
    p: 164, x: 70,
    text: 'Nobody thinks this is a hard question.',
    dur: 1.8,
  },
  {
    p: 41, x: 168, gauges: 1, near: 1,
    text: 'So the first gauge goes straight to the top, and it does not even feel like a moral decision. It feels like noticing.',
    cite: 'The child at your feet',
    dur: 4.2,
  },
  {
    p: 383, x: 124, gauges: 1, near: 1,
    text: 'Now the second child, dying of something preventable, eight thousand miles off. The same money, the same certainty, the same small cost to you.',
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
    text: 'Singer asks what could hold the second gauge down. Not the cost, which is the same.',
    cite: 'Nothing holds it down',
    dur: 2.2,
  },
  {
    p: 167, x: 168, gauges: 1, near: 1, far: 1,
    text: 'Not your power to help, which is the same. Only how far away it is — and distance is not a moral property.',
    dur: 3.2,
  },
  {
    p: 6, x: 124, gauges: 1, near: 1, far: 1, pick: 1,
    interact: {
      prompt: 'Between the two children, tap the only thing that actually differs.',
      explain: 'Distance, and nothing else — same cost, same certainty, same power to act. Singer\'s challenge is to name a reason distance should matter morally, and the honest answer is that nobody has one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, x: 124, gauges: 1, near: 1, far: 1,
    interact: {
      prompt: 'Draw how much of the duty stays yours as the crowd grows.',
      plot: {
        axis: 'HOW MUCH IS YOURS',
        cols: ['YOU ALONE', '10 OTHERS', '1000', 'A MILLION'],
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'flat', profile: [0.95, 0.93, 0.92, 0.9], reads: 'it stays yours, whoever else is standing there', correct: true },
          { id: 'fall', profile: [0.95, 0.5, 0.1, 0.02], reads: 'it thins out as the crowd grows' },
          { id: 'share', profile: [0.95, 0.6, 0.35, 0.2], reads: 'it halves, and then halves again' },
        ],
      },
      explain: 'Flat. The sloping answer has a name — diffusion of responsibility — and the pond is the test of it: you would not stroll past a drowning child because a crowd was also watching. Others being able to act has never once cancelled your being able to.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Distance Is Not A Reason',
      points: [
        'The pond shows we must help at small cost',
        'Singer argues distance is morally irrelevant',
        'Effective altruism asks: most good per pound',
        'Critics worry the demand swallows your life',
      ],
      closing: 'The uncomfortable part is not how clever the argument is. The uncomfortable part is that nobody has found the flaw.',
    },
    dur: 3.0,
  },
];
