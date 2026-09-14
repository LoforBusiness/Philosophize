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
    p: 172, x: 50, n: 0,
    text: 'Suppose a jar holds marbles, and you want to know what fraction of them are dark. The true fraction is fixed, but finding it would mean counting every marble.',
    dur: 4.2,
  },
  {
    p: 47, x: 50, n: 0.08,
    text: 'You draw a handful at random and estimate the fraction from that sample. The band around the estimate marks how far it might be from the true value.',
    cite: 'A small sample',
    dur: 3.6,
  },
  {
    p: 47, x: 50, n: 0.08,
    text: 'A sample this small can give an estimate far from the true fraction.',
    dur: 1.8,
  },
  {
    p: 418, x: 50, n: 0.45,
    text: 'As the sample grows, the band narrows quickly at first. Each marble drawn is evidence about the others left in the jar.',
    cite: 'The band narrows',
    dur: 4.2,
  },
  {
    p: 160, x: 50, n: 1,
    text: 'However, the gains soon diminish. It takes four times the sample to halve the width of the band.',
    cite: 'Four times, half the error',
    dur: 2.2,
  },
  {
    p: 160, x: 50, n: 1,
    text: 'Sampling error depends on the square root of the sample size, not on the size itself. So each gain in precision costs more than the last.',
    dur: 2.6,
  },
  {
    p: 465, x: 50, n: 1,
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
    p: 461, x: 50, n: 0, live: 1,
    interact: {
      prompt: 'At what sample size do further draws add little precision?',
      drag: {
        lo: 'A HANDFUL',
        hi: 'THOUSANDS',
        start: 0,
        zones: [
          { id: 'few', upto: 0.24, reads: 'too small to estimate reliably' },
          { id: 'enough', upto: 0.58, reads: 'precise enough for most purposes', correct: true },
          { id: 'waste', upto: 1, reads: 'more draws add little precision' },
        ],
      },
      explain: 'Precise enough for most purposes. Because error depends on the square root of the sample size, the band narrows mostly at the start. Later draws cost as much but add little. So national polls often sample about a thousand people, not a million.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 459, x: 50, n: 0.9, biased: 1,
    text: 'Now consider a large sample drawn only from people who answered the phone. The sample is biased if those people differ from everyone else.',
    cite: 'Precise, but biased',
    dur: 3.3,
  },
  {
    p: 459, x: 50, n: 0.9, biased: 1,
    text: 'The error band is narrow, but it’s centred on the wrong value. The estimate is precise without being accurate.',
    dur: 1.8,
  },
  {
    p: 379, x: 50, n: 0.9, biased: 1,
    interact: {
      prompt: 'Does a larger sample correct a biased sampling method?',
      cards: [
        { text: 'No, size does not reduce bias', correct: true },
        { text: 'Yes, a large sample cancels bias', correct: false },
      ],
      explain: 'Size does not reduce bias. A larger sample shrinks random error, but it can’t change who was sampled. In 1936 the Literary Digest collected over two million ballots and predicted that Alf Landon would defeat Franklin Roosevelt. Roosevelt won by a wide margin.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Sample Size, Precision and Bias',
      points: [
        'Sampling error depends on the square root of sample size',
        'Early draws add far more precision than later ones',
        'Diminishing returns arrive quickly',
        'A larger sample reduces random error, not bias',
      ],
      closing: 'Before asking how large a sample is, ask how it was chosen. No sample size corrects a biased method.',
    },
    dur: 3.0,
  },
];
