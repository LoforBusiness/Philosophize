import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-34, "More People, Worse Lives?" — the DRAG mechanic
// (../DragScale) trading quality against quantity, which is the exact shape of
// Parfit's argument and the reason it is so hard to shake off.
//
// A block of figures fills the stage as the reader drags right, and each one gets
// SHORTER as they multiply. The total-good bar underneath rises the whole time.
// The reader is doing the trade with their thumb and watching the total approve of
// it, which is a great deal more uncomfortable than reading that it does.
//
// The graded answer is the far end, and the explanation is careful to say the
// conclusion is REPUGNANT rather than false — a lesson that pretended this was
// settled would be lying about the state of the field.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics34Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The trade, 0 (a few excellent lives) … 1 (a multitude of barely-good ones). */ pop?: number;
  /** 1 = the reader is driving the trade from the rail (Q1). */ live?: number;
  /** 1 = the average line is drawn across the crowd. */ avg?: number;
}

export const BEATS: Ethics34Beat[] = [
  {
    p: 462, x: 46, pop: 0,
    text: 'Consider a world of ten people, each with an excellent life. On the total view, how good a world is depends on the sum of wellbeing in it.',
    dur: 3.8,
  },
  {
    p: 47, x: 46, pop: 0.45,
    text: 'Now add more people, while making each life somewhat less good.',
    cite: 'More lives, each less good',
    dur: 2.9,
  },
  {
    p: 47, x: 46, pop: 0.45,
    text: 'The total still rises, because the added lives more than offset the lost quality.',
    dur: 1.8,
  },
  {
    p: 384, x: 46, pop: 1,
    text: 'Repeated often enough, the step yields a vast population whose lives are barely worth living. Its total good is greater than in any earlier world.',
    cite: 'Barely worth living',
    dur: 4.2,
  },
  {
    p: 380, x: 46, pop: 1,
    text: 'Derek Parfit named the result the Repugnant Conclusion in 1984. He rejected the conclusion, but didn’t succeed in finding a theory that avoids it.',
    cite: 'The Repugnant Conclusion',
    dur: 4.4,
  },
  {
    p: 128, x: 46, pop: 1,
    quote: {
      id: 'lq-ethics-ethics-34-1',
      text: 'For any possible population of at least ten billion people, all with a very high quality of life, there must be some much larger imaginable population whose existence would be better, even though its members have lives that are barely worth living.',
      author: 'Derek Parfit',
      philosopherId: 'derek-parfit',
      work: 'Reasons and Persons',
      era: '1984',
      branchSlugs: ['ethics'],
    },
    dur: 4.6,
  },
  {
    p: 467, x: 46, pop: 0, live: 1,
    interact: {
      prompt: 'Where along this trade does the total view’s verdict become repugnant?',
      drag: {
        lo: 'A FEW FLOURISHING',
        hi: 'MANY LIVES BARELY WORTH LIVING',
        start: 0,
        zones: [
          { id: 'fine', upto: 0.34, reads: 'more lives, still very good: plausibly better' },
          { id: 'uneasy', upto: 0.66, reads: 'more lives, less good: better only by the total' },
          { id: 'repugnant', upto: 1, reads: 'lives barely worth living, ranked best by the total', correct: true },
        ],
      },
      explain: 'Lives barely worth living, ranked best by the total. Each step raises total wellbeing, so the total view endorses every one. The endpoint is Parfit’s Repugnant Conclusion, even though no life in it is bad.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 402, x: 46, pop: 0.2, avg: 1,
    text: 'An obvious reply is to rank worlds by how good the average life is. This average view has problems of its own.',
    cite: 'The average view',
    dur: 4.4,
  },
  {
    p: 447, x: 46, pop: 0.2, avg: 1,
    interact: {
      prompt: 'Does ranking worlds by average wellbeing solve the problem?',
      cards: [
        { text: 'No: it yields other unacceptable verdicts', correct: true },
        { text: 'Yes: numbers can’t outweigh quality', correct: false },
      ],
      explain: 'The average view yields other unacceptable verdicts. It ranks one person with a slightly better life above billions with very good lives. It also implies that adding a happy life can make a world worse, if that life falls below the average.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Repugnant Conclusion',
      points: [
        'On the total view, numbers can outweigh quality of life',
        'Enough lives barely worth living outrank any excellent population',
        'The average view avoids this but yields other implausible verdicts',
        'Parfit rejected the conclusion but found it hard to avoid',
      ],
      closing: 'Any theory of population ethics must either accept this conclusion or explain which step in the argument fails.',
    },
    dur: 3.0,
  },
];
