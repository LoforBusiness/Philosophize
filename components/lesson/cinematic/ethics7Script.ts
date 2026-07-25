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
    p: 45, x: 90, carB: -70,
    text: 'Two drivers glance at their phone for exactly two seconds. One gets home, eats dinner, forgets it. The other is in a courtroom by Friday. Same two seconds.',
    dur: 4.4,
  },
  {
    p: 2, x: 170, laneA: 1, carB: -70,
    text: 'Here is the first driver. Empty road, nothing ahead. She looks down, looks up, and the road is exactly as she left it. She parks and never thinks about it again.',
    cite: 'Road A',
    dur: 4.6,
  },
  {
    p: 6, x: 300, laneA: 1, laneB: 1, kid: 1, carB: 60,
    text: 'Here is the second driver. Same phone, same road, same two seconds. The only difference: on his stretch of road, a child is already stepping out.',
    cite: 'Road B',
    dur: 4.4,
  },
  {
    p: 47, x: 300, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 150,
    text: 'Freeze both cars and compare the two seconds. Same phone, same speed, same shrug about the risk. Nothing inside the drivers is different at all. Only the road is.',
    cite: 'The same two seconds',
    dur: 4.8,
  },
  {
    p: 21, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 150, pick: 1,
    interact: {
      prompt: 'Both drivers made the same two-second choice. Judging that choice alone, tap your verdict.',
      explain: 'Identical risk, identical carelessness. The child was already stepping out before either driver reached for a phone — so nothing either of them chose was different. Only the road they happened to be on.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 15, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'Now let luck in. On road B the child is there. That driver will stand trial for a death. The other drives home and never even learns she took a risk.',
    cite: 'What luck did',
    dur: 4.6,
  },
  {
    p: 4, x: 90, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    mc: {
      prompt: 'Same choice, wildly different verdicts. Why does that unsettle philosophers?',
      options: [
        { id: 'a', text: 'We insist blame tracks control — yet only luck differed here', correct: true },
        { id: 'b', text: 'Driver B made the worse decision behind the wheel', correct: false },
        { id: 'c', text: 'Nobody can ever be blamed for anything they do', correct: false },
        { id: 'd', text: 'Consequences should always outweigh intentions', correct: false },
      ],
      explain: 'The trap: it feels obvious that driver B "chose worse", because we read the choice backwards from the wreckage. Rewind the tape and the two choices match to the second. We say blame should track what you control — then punish one of them for the one thing neither controlled.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 1, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    text: 'In 1976 Bernard Williams and Thomas Nagel named this clash: moral luck. Whether you end up a decent person or a criminal depends partly on which road you happened to drive down. Nagel stated the intuition we keep breaking.',
    cite: 'Williams & Nagel · 1976',
    dur: 5.0,
  },
  {
    p: 44, x: 170, laneA: 1, laneB: 1, kid: 1, glance: 1, carB: 246, hit: 1,
    quote: {
      id: 'lq-ethics-ethics-7-1',
      text: 'Prior to reflection it is intuitively plausible that people cannot be morally assessed for what is not their fault, or for what is due to factors beyond their control.',
      author: 'Thomas Nagel',
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
