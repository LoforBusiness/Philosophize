import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-15, "Two Cases Are Not a Pattern"
//
// THE PICTURE: a crowd, two of them ringed, and a conclusion drawn the width of
// the whole crowd. The sample and the claim are on screen at the same scale, so
// the leap between them is a thing with a size (H64).
//
// A hasty generalization is hard to feel as an error because every part of it is
// true — you did meet them, they were rude. Putting the two ringed dots underneath
// a bar three hundred units wide makes the missing evidence visible as a gap
// rather than describable as one.
//
// STAGING: the three Q1 targets are the sample, the leap and the conclusion. Two
// of them are innocent and the reader has to notice which (H66) — the sample is
// honest evidence and the conclusion might even turn out true. Only the step from
// one to the other was never earned.

export interface Log15Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** The crowd, 0…1. */ crowd?: number;
  /** The two you met, ringed, 0…1. */ sample?: number;
  /** The step from the two to all of them, 0…1. */ leap?: number;
  /** The conclusion drawn across the whole crowd, 0…1. */ claim?: number;
  /** 1 = the three parts are live targets (Q1). */ pick?: number;
}

export const BEATS: Log15Beat[] = [
  {
    g: 25, crowd: 1, sample: 1,
    dur: 4.4,
    text: 'Two tourists were rude to you last week. Both of them were from the same country. Both of those things are true.',
  },
  {
    g: 45, crowd: 1, sample: 1, leap: 1, claim: 1,
    dur: 4.8,
    text: 'And out of that comes a sentence about a whole nation. Look at how wide the claim is against how wide the evidence is.',
    cite: 'Two, and then everyone',
  },
  {
    g: 13, crowd: 1, sample: 1, leap: 1, claim: 1,
    dur: 4.8,
    text: 'Firsthand evidence feels like strong evidence. You were there, you saw it, and none of that makes two people into a pattern.',
    cite: 'Why it feels solid',
  },
  {
    g: 137, crowd: 1, sample: 1, leap: 1, claim: 1,
    dur: 3.8,
    quote: {
      id: 'lq-logic-arguments-15',
      text: 'The human understanding, from its peculiar nature, easily supposes a greater degree of order and equality in things than it really finds.',
      author: 'Francis Bacon',
      work: 'Novum Organum',
      era: '1620',
      philosopherId: 'francis-bacon',
      branchSlugs: ['logic'],
    },
  },
  {
    g: 5, crowd: 1, sample: 1, leap: 1, claim: 1,
    dur: 4.8,
    text: 'A sample can carry a conclusion when it is big enough and chosen fairly. Two people you happened to meet is neither.',
    cite: 'When the bet is good',
  },
  {
    g: 4, crowd: 1, sample: 1, leap: 1, claim: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Every part of this is true. Tap the part that has not been earned.',
      explain: 'The step. The two ringed dots are honest evidence and nobody disputes them, and the conclusion may even be true. You still would not know so. What has nothing underneath is the jump from the narrow width to the wide one.',
      xp: 5,
    },
  },
  {
    g: 41, crowd: 1, sample: 1, leap: 1, claim: 1,
    dur: 1.0,
    interact: {
      prompt: 'What would actually fix this argument?',
      cards: [
        { text: 'A bigger, fairer sample', correct: true },
        { text: 'Being sure you saw it right', correct: false },
      ],
      explain: 'The other card offers more confidence about the same two people, and confidence was never what was short. You could be perfectly, provably right about both tourists and still know nothing whatever about the country they came from.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Count Your Evidence',
      points: [
        'A hasty generalization outruns its own sample',
        'The observations can all be true and the leap still fail',
        'Firsthand feels strong; it does not fix sample size',
        'A good sample is large enough and chosen fairly',
      ],
      closing: 'A pattern needs more than two points. Count them before you generalise.',
    },
    dur: 3.0,
  },
];
