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
    p: 159, x: 90, carB: -70,
    text: 'Two drivers glance at their phone for exactly two seconds. One gets home, eats dinner, forgets it.',
    dur: 2.7,
  },
  {
    p: 159, x: 90, carB: -70,
    text: 'The other is in a courtroom by Friday. Same two seconds.',
    dur: 1.8,
  },
  {
    p: 2, x: 170, laneA: 1, carB: -70,
    text: 'Here is the first driver. Empty road, nothing ahead.',
    cite: 'Road A',
    dur: 1.8,
  },
  {
    p: 2, x: 170, laneA: 1, carB: -70,
    text: 'The driver looks down, looks up, and the road is exactly as she left it. She parks and never thinks about it again.',
    dur: 3.3,
  },
  {
    p: 6, x: 300, laneA: 1, laneB: 1, kid: 1, carB: 60,
    text: 'Here is the second driver. Same phone, same road, same two seconds.',
    cite: 'Road B',
    dur: 2,
  },
  {
    p: 6, x: 300, laneA: 1, laneB: 1, kid: 1, carB: 60,
    text: 'The only difference: on his stretch of road, a child is already stepping out.',
    dur: 2.4,
  },
  {
    p: 47, x: 300, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 150,
    text: 'Freeze both cars and compare the two seconds. Same phone, same speed, same shrug about the risk.',
    cite: 'The same two seconds',
    dur: 2.8,
  },
  {
    p: 47, x: 300, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 150,
    text: 'Nothing inside the drivers is different at all. Only the road is.',
    dur: 2,
  },
  {
    p: 21, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 150, pick: 1,
    interact: {
      prompt: 'Both drivers made the same two-second choice. Judging that choice alone, tap your verdict.',
      explain: 'Identical risk, identical carelessness. The child was already stepping out before either driver reached for a phone. So nothing either of them chose was different. Only the road they happened to be on.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 15, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'Now let luck in. On road B the child is there.',
    cite: 'What luck did',
    dur: 1.8,
  },
  {
    p: 15, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'That driver will stand trial for a death. The other drives home and never even learns she took a risk.',
    dur: 3,
  },
  {
    p: 4, x: 90, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    interact: {
      prompt: 'Place the token on what happened to the two drivers.',
      field: {
        xLo: 'THE CHOICES DIFFERED', xHi: 'THE CHOICES WERE IDENTICAL',
        yLo: 'THE SAME VERDICT', yHi: 'OPPOSITE VERDICTS',
        start: [0.24, 0.24],
        quads: [
          { id: 'luck', x: 1, y: 1, reads: 'identical choices, opposite verdicts: only luck differed', correct: true },
          { id: 'fair', x: 1, y: 0, reads: 'identical choices, one verdict: what we say we believe' },
          { id: 'plain', x: 0, y: 1, reads: 'different choices, different verdicts: nothing strange' },
          { id: 'odd', x: 0, y: 0, reads: 'different choices, one verdict: a different puzzle' },
        ],
      },
      explain: 'Top right, and that corner should be empty. It feels obvious that the second driver chose worse, because we read the choice backwards from the wreckage. Rewind the tape and the two match to the second. We say blame tracks what you control, then judge the crash.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 167, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'In 1976 Bernard Williams and Thomas Nagel named this clash: moral luck. Whether you end up a decent person or a criminal depends partly on which road you happened to drive down.',
    cite: 'Williams & Nagel · 1976',
    dur: 4.1,
  },
  {
    p: 167, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'Nagel stated the intuition we keep breaking.',
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
      title: 'When Luck Does the Judging',
      points: [
        'Blame is supposed to track what you control',
        'Two identical choices, two different roads',
        'We punish the outcome, not the choice',
        'Williams and Nagel called this moral luck',
      ],
      closing: 'Part of your clean record is luck — and that should unsettle you.',
    },
    dur: 3.0,
  },
];
