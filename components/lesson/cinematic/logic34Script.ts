import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-34, "How Many Do You Need to Check?" — the DRAG
// mechanic (../DragScale) on sample size, and the one lesson in the set where the
// picture makes an argument the prose genuinely cannot.
//
// An error band brackets an estimate. Dragging the sample up narrows it, and the
// narrowing is visibly, annoyingly slow: the reader spends the last two thirds of
// the rail buying almost nothing. Nobody has to be told about the square root. It
// is under their thumb and it is frustrating, which is the point.
//
// The second question then takes the whole thing away: a band that has narrowed
// beautifully around the WRONG number. Size never touched that.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic34Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How large the sample is, 0 (a handful) … 1 (thousands). */ n?: number;
  /** 1 = the estimate is centred on the wrong value — a biased sample. */ biased?: number;
  /** 1 = the reader is driving the sample from the rail (Q1). */ live?: number;
}

export const BEATS: Logic34Beat[] = [
  {
    p: 25, x: 50, n: 0,
    text: 'A jar of marbles, and you want to know what fraction are dark. The dashed line is the true answer, and you are not allowed to look at it.',
    dur: 4.2,
  },
  {
    p: 47, x: 50, n: 0.08,
    text: 'So you pull a handful. Your estimate is the solid line and the bracket around it is how wrong you might be.',
    cite: 'A handful',
    dur: 3.6,
  },
  {
    p: 47, x: 50, n: 0.08,
    text: 'With a handful, very wrong.',
    dur: 1.8,
  },
  {
    p: 19, x: 50, n: 0.45,
    text: 'Pull more and the bracket closes fast. This part feels like progress, and it is the part everybody remembers about sample size.',
    cite: 'The bracket closes',
    dur: 4.2,
  },
  {
    p: 4, x: 50, n: 1,
    text: 'Then it stops paying. Four times the marbles only halves the bracket.',
    cite: 'Four times, half the error',
    dur: 2.2,
  },
  {
    p: 4, x: 50, n: 1,
    text: 'Error falls with the square root of the count, not in step with it.',
    dur: 2.6,
  },
  {
    p: 137, x: 50, n: 1,
    quote: {
      id: 'lq-logic-arguments-34-1',
      text: 'The more observations have been made, the less danger there is of wandering from one\'s goal.',
      author: 'Jacob Bernoulli',
      work: 'Ars Conjectandi',
      era: '1713',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    p: 4, x: 50, n: 0, live: 1,
    interact: {
      prompt: 'Drag the sample up. Stop where pulling more marbles stops being worth it.',
      drag: {
        lo: 'A HANDFUL',
        hi: 'THOUSANDS',
        start: 0,
        zones: [
          { id: 'few', upto: 0.24, reads: 'still a wild guess' },
          { id: 'enough', upto: 0.58, reads: 'good enough to use', correct: true },
          { id: 'waste', upto: 1, reads: 'paying for almost nothing' },
        ],
      },
      explain: 'Sooner than it feels. The bracket does most of its closing early and then crawls. The last stretch of that rail costs enormously and buys a sliver. It is why a national poll asks about a thousand people rather than a million.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 50, n: 0.9, biased: 1,
    text: 'Now the awkward one. Here is a huge sample, drawn only from people who answered the phone.',
    cite: 'Tight, and wrong',
    dur: 3.3,
  },
  {
    p: 35, x: 50, n: 0.9, biased: 1,
    text: 'The bracket is tight around the wrong number.',
    dur: 1.8,
  },
  {
    p: 45, x: 50, n: 0.9, biased: 1,
    interact: {
      prompt: 'The sample is enormous. Does that fix it?',
      cards: [
        { text: 'No, bias does not shrink', correct: true },
        { text: 'Yes, size washes it out', correct: false },
      ],
      explain: 'In 1936 a magazine asked over two million people and called the election for the wrong man. Asking more of the wrong room measures the wrong room more precisely. Size cures noise and never touches who you asked.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Enough Is Sooner Than You Think',
      points: [
        'Error falls with the square root of the count',
        'Early checks are worth far more than late ones',
        'Diminishing returns arrive quickly',
        'Size shrinks noise and never touches bias',
      ],
      closing: 'Before asking how many, ask who. No amount of the second question answers the first.',
    },
    dur: 3.0,
  },
];
