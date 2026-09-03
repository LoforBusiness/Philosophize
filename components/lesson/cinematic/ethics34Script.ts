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
    p: 25, x: 46, pop: 0,
    text: 'Ten people, and every one of them has a wonderful life. The bar underneath is how much good this world contains.',
    dur: 3.8,
  },
  {
    p: 47, x: 46, pop: 0.45,
    text: 'Now add more, and make each life a little less good to pay for them. Watch the bar.',
    cite: 'More people, smaller lives',
    dur: 2.9,
  },
  {
    p: 47, x: 46, pop: 0.45,
    text: 'It goes up, because there is more of it.',
    dur: 1.8,
  },
  {
    p: 19, x: 46, pop: 1,
    text: 'Keep going and you reach a multitude whose lives are only just worth living. The bar is higher than it has ever been.',
    cite: 'Barely worth living',
    dur: 4.2,
  },
  {
    p: 380, x: 46, pop: 1,
    text: 'Derek Parfit called the ending repugnant. He could not accept it, and spent the rest of his life failing to refute it.',
    cite: 'Parfit',
    dur: 4.4,
  },
  {
    p: 137, x: 46, pop: 1,
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
    p: 160, x: 46, pop: 0, live: 1,
    interact: {
      prompt: 'Drag the trade. Stop where the totalling gives an answer you cannot accept.',
      drag: {
        lo: 'A FEW FLOURISHING',
        hi: 'A MULTITUDE SCRAPING',
        start: 0,
        zones: [
          { id: 'fine', upto: 0.34, reads: 'a better world' },
          { id: 'uneasy', upto: 0.66, reads: 'a bigger number' },
          { id: 'repugnant', upto: 1, reads: 'and the bar says yes', correct: true },
        ],
      },
      explain: 'At the far end. Every step you dragged through was a small improvement by the total. The destination is one almost nobody will accept. That is the argument. Notice it never told you a barely-good life was bad. It only kept adding.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 402, x: 46, pop: 0.2, avg: 1,
    text: 'The obvious repair is to judge by the average life instead of the total. Try it and a new monster walks in.',
    cite: 'Judge by the average',
    dur: 4.4,
  },
  {
    p: 45, x: 46, pop: 0.2, avg: 1,
    interact: {
      prompt: 'Does judging by average wellbeing fix it?',
      cards: [
        { text: 'No, it breaks elsewhere', correct: true },
        { text: 'Yes, averages resist numbers', correct: false },
      ],
      explain: 'Averaging says one ecstatic person beats billions of very happy ones. It also says adding a happy person can be wrong for dragging the mean down. Forty years of proposals have each swapped this problem for a different one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Arithmetic Nobody Likes',
      points: [
        'Totalling lets numbers substitute for quality',
        'Enough barely-good lives out-sum any paradise',
        'Averaging swaps it for an equally strange result',
        'Parfit rejected it and could not refute it',
      ],
      closing: 'This one is genuinely open. Every theory of how good a world is has to answer here, and none of the answers is comfortable.',
    },
    dur: 3.0,
  },
];
