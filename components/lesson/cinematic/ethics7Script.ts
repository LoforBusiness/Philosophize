import type { BaseBeat } from './cinematicKit';

// Cinematic ethics-ethics-7, "Moral Luck" — two drivers, one identical two-second
// glance at a phone, two completely different lives afterwards. The stage is TWO
// ROADS stacked overhead; the narrator walks the ground beneath them and looks up.
// Q1 is answered on the road itself (tap a verdict card); Q2 is A/B/C/D.
//
// ASK BEFORE YOU TELL: the reader delivers a verdict on the CHOICE (beat 4) before
// luck is ever let in (beat 5), and only after the second question is answered does
// the name "moral luck" arrive (beat 7). The term lands as a label for something
// they have already felt.

export interface Ethics7Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the figure stands (stage x). 90 left · 170 centre · 300 right. */ x?: number;
  /** 1 = road A (the empty one) is on stage. */ laneA?: number;
  /** 1 = road B (the one with someone on it) is on stage. */ laneB?: number;
  /** 1 = the small figure stepping into road B is visible. */ kid?: number;
  /** 1 = the impact mark is struck and the figure is knocked over. */ hit?: number;
  /** 1 = the phone-glance badge sits above BOTH cars. */ glance?: number;
  /** Car B's left edge in stage x — beat-driven, so it meets the child on cue. */ carB?: number;
  /** 1 = the three verdict cards are live on the stage (Q1). */ pick?: number;
}

export const BEATS: Ethics7Beat[] = [
  {
    p: 463, x: 90, carB: -70,
    text: 'Suppose two drivers each look at a phone for two seconds. One drives home safely and forgets the moment.',
    dur: 2.7,
  },
  {
    p: 463, x: 90, carB: -70,
    text: 'The other soon stands trial in court. Both made the same two-second choice.',
    dur: 1.8,
  },
  {
    p: 2, x: 170, laneA: 1, carB: -70,
    text: 'The first driver’s road is empty, with nothing in the way.',
    cite: 'Road A',
    dur: 1.8,
  },
  {
    p: 266, x: 170, laneA: 1, carB: -70,
    text: 'The first driver looks away and back, and the road is still clear. She never thinks about it again.',
    dur: 3.3,
  },
  {
    p: 274, x: 300, laneA: 1, laneB: 1, kid: 1, carB: 60,
    text: 'The second driver makes the same choice, on a similar road, for the same two seconds.',
    cite: 'Road B',
    dur: 2,
  },
  {
    p: 274, x: 300, laneA: 1, laneB: 1, kid: 1, carB: 60,
    text: 'The only difference lies outside the driver’s control: a child is already stepping into the road.',
    dur: 2.4,
  },
  {
    p: 47, x: 300, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 150,
    text: 'At the moment of choice, the two drivers are identical in speed, attention and disregard for risk.',
    cite: 'The same two seconds',
    dur: 2.8,
  },
  {
    p: 267, x: 300, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 150,
    text: 'Nothing inside the drivers is different at all. Only their circumstances on the road differ.',
    dur: 2,
  },
  {
    p: 453, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 150, pick: 1,
    interact: {
      prompt: 'If you judge only the choice, how do the two drivers compare?',
      explain: 'Both equally reckless. Each driver took the same risk with the same carelessness. Whether a child stepped out was beyond either driver’s control, so it formed no part of the choice.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 15, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'Now consider the outcomes, which luck decides. On road B, the car strikes the child.',
    cite: 'What luck did',
    dur: 1.8,
  },
  {
    p: 258, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'The second driver faces trial for causing a death. The first goes home, never learning what might have happened.',
    dur: 3,
  },
  {
    p: 165, x: 90, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    interact: {
      prompt: 'How does luck bear on the blame of the two drivers?',
      poll: {
        options: [
          { id: 'luck', reads: 'luck in the outcome changes their blame', holders: ['Bernard Williams', 'Thomas Nagel'], correct: true },
          { id: 'fair', reads: 'equal blame, since they chose identically', holders: ['Michael Zimmerman'] },
          { id: 'plain', reads: 'equal blame, with the outcome only as evidence', holders: ['Norvin Richards'] },
          { id: 'odd', reads: 'luck undermines responsibility for both', holders: ['Neil Levy'] },
        ],
      },
      explain: 'Luck in the outcome changes their blame, on the moral-luck view. People blame the second driver more, though the control principle ties blame to choices alone.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'In 1976 Bernard Williams and Thomas Nagel called this moral luck: judgement that depends on factors beyond one’s control.',
    cite: 'Williams and Nagel, 1976',
    dur: 4.1,
  },
  {
    p: 167, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'Nagel stated the principle of control that such judgements seem to violate.',
    dur: 1.8,
  },
  {
    p: 129, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    quote: {
      id: 'lq-ethics-ethics-7-1',
      text: 'Prior to reflection it is intuitively plausible that people cannot be morally assessed for what is not their fault, or for what is due to factors beyond their control.',
      author: 'Thomas Nagel',
      philosopherId: 'thomas-nagel',
      work: 'Moral Luck',
      era: '1979',
      branchSlugs: ['ethics'],
    },
    dur: 3.6,
  },
  {
    summary: {
      title: 'When Luck Affects Blame',
      points: [
        'The control principle: blame should track only what you control',
        'The two drivers made identical choices',
        'Ordinary judgement blames the outcome, not only the choice',
        'Williams and Nagel called this moral luck',
      ],
      closing: 'If Williams and Nagel are right, part of anyone’s clean moral record is due to luck.',
    },
    dur: 3.0,
  },
];
