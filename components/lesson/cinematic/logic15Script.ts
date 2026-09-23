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
  /** 1 = a check mark confirms the two observations, beside the sample ring. */ verify?: number;
  /** 1 = the two sampled dots fill solid ink, marking them as vividly witnessed. */ vivid?: number;
  /** 1 = a dashed ring appears round the leap card, marking it as unsupported. */ weak?: number;
}

export const BEATS: Log15Beat[] = [
  {
    g: 462, crowd: 1, sample: 1,
    dur: 3.2,
    text: 'Suppose two tourists were rude to you last week, and both came from the same country.',
  },
  {
    g: 462, crowd: 1, sample: 1, verify: 1,
    dur: 1.8,
    text: 'In this case, both observations are true.',
  },
  {
    g: 447, crowd: 1, sample: 1, leap: 1, claim: 1, verify: 1,
    dur: 4.8,
    text: 'You conclude that people from the country are rude. This hasty generalisation draws a claim about a nation from two people.',
    cite: 'From two to all',
  },
  {
    g: 383, crowd: 1, sample: 1, leap: 1, claim: 1, verify: 1, vivid: 1,
    dur: 4.8,
    text: 'Firsthand evidence feels compelling because you witnessed it. Yet two cases, however vivid, don’t establish a pattern.',
    cite: 'Why it seems strong',
  },
  {
    g: 139, crowd: 1, sample: 1, leap: 1, claim: 1, verify: 1, vivid: 1,
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
    g: 412, crowd: 1, sample: 1, leap: 1, claim: 1, verify: 1, vivid: 1, weak: 1,
    dur: 4.8,
    text: 'A sample supports a general conclusion when it’s large enough and fairly chosen. A sample of two people met by chance is neither.',
    cite: 'A fair sample',
  },
  {
    g: 4, crowd: 1, sample: 1, leap: 1, claim: 1, verify: 1, vivid: 1, weak: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'The observations are true. Which part of the argument lacks support?',
      explain: 'The step from two people to all of them. The observations are accurate, and the conclusion might even be true. Nothing, however, justifies inferring it from so small a sample.',
      xp: 5,
    },
  },
  {
    g: 442, crowd: 1, sample: 1, leap: 1, claim: 1, verify: 1, vivid: 1, weak: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which of these would actually support the claim?',
      odd: {
        axis: 'THREE ARE TOO NARROW',
        tiles: [
          { id: 'two', reads: 'THE TWO YOU MET' },
          { id: 'more', reads: 'A FEW MORE, THE SAME WAY' },
          { id: 'street', reads: 'EVERYONE ON YOUR STREET' },
          { id: 'fair', reads: 'A LARGE, UNBIASED SAMPLE', correct: true },
        ],
      },
      explain: 'The large, unbiased sample. The other three all sample the same narrow corner, and meeting more people the same way multiplies the reach of the bias rather than correcting it. What a generalisation needs isn\'t more cases but less selection.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Hasty Generalisation',
      points: [
        'A hasty generalisation claims more than its sample supports',
        'The observations can all be true and the inference still fail',
        'Firsthand evidence feels strong but doesn’t enlarge the sample',
        'A good sample is large enough and chosen fairly',
      ],
      closing: 'Before generalising, ask how large the sample is and how it was chosen.',
    },
    dur: 3.0,
  },
];
