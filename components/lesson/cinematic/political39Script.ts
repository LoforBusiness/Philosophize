import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-39, "Why the Loser Obeys"
// Theme: A VOTE YOU LOST, AND FOUR REASONS TO DO WHAT IT SAYS.
//
// One bar, split sixty to forty, with the reader's own forty on the short end.
// Underneath, the thing it produced: IT IS THE LAW. That pair is the question in
// two objects — a count, and an obligation, with nothing obvious joining them.
//
// The four reasons stand below as four plates, and one of them is not a reason at
// all. Telling authority from power is the whole lesson, and it is a distinction
// a reader can make for themselves once the four are side by side.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — four plates, and the reader taps the one that only
//     explains why they will comply. On the stage because the four have to be
//     compared, and three of them are genuinely good.
//   · beat 7  a PLOT — how the duty runs as the law gets worse. A curve rather
//     than a pick, because nobody's real view is a yes or a no: it is a line that
//     holds and then gives out, and where it gives is the disagreement.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political39Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the split tally bar is drawn. */ tally?: number;
  /** 1 = the law it produced stands under it. */ law?: number;
  /** 1 = the four reasons are on their plates. */ reasons?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Political39Beat[] = [
  {
    p: 25, x: 52, tally: 1,
    text: 'Suppose a law passes by sixty votes to forty, and you voted against it.',
    dur: 3.4,
  },
  {
    p: 2, x: 52, tally: 1, law: 1,
    text: 'The law now binds you too. A count of votes alone doesn’t explain the losers’ duty to obey.',
    dur: 4.8,
  },
  {
    p: 36, x: 52, tally: 1, law: 1, reasons: 1,
    text: 'Four reasons are offered for that duty, and three of them are genuine justifications.',
    dur: 3.0,
  },
  {
    p: 165, x: 52, tally: 1, law: 1, reasons: 1, live: 1,
    interact: {
      prompt: 'Which of these explains compliance but gives no reason to obey?',
      explain: 'They have more people. Numbers are a fact about force: they explain why you’ll comply, not why you should. The other three offer reasons you could accept even when nobody is watching.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 52, tally: 1, law: 1, reasons: 1,
    text: 'Power compels compliance. Authority, by contrast, gives a reason to obey even when no one is watching.',
    dur: 4.0,
  },
  {
    p: 168, x: 98, tally: 1, law: 1, reasons: 1,
    text: 'John Locke defends majority rule itself. A body requiring unanimous consent could never act.',
    dur: 4.4,
  },
  {
    p: 433, x: 98, tally: 1, law: 1, reasons: 1,
    quote: {
      id: 'lq-political-political-39-1',
      text: 'The body should move that way whither the greater force carries it, which is the consent of the majority.',
      author: 'John Locke',
      philosopherId: 'john-locke',
      work: 'Second Treatise of Government',
      era: '1689',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.6,
  },
  {
    p: 21, x: 98, tally: 1, law: 1, reasons: 1,
    interact: {
      prompt: 'Which curve shows how the duty to obey changes as a law grows more unjust?',
      plot: {
        cols: ['SLIGHTLY', 'CLEARLY', 'BADLY', 'GROSSLY'],
        axis: 'DUTY TO OBEY',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'flat', profile: [0.88, 0.88, 0.88, 0.88], reads: 'the same strong duty, however unjust' },
          { id: 'cliff', profile: [0.9, 0.78, 0.5, 0.05], reads: 'strong, until the injustice becomes grave', correct: true },
          { id: 'none', profile: [0.14, 0.12, 0.1, 0.05], reads: 'little or no duty at any point' },
          { id: 'rise', profile: [0.2, 0.45, 0.72, 0.95], reads: 'more duty the more unjust the law' },
        ],
      },
      explain: 'Strong, until the injustice becomes grave. A constant duty would bind people even to atrocities. No duty at all would make losing a vote optional. The dispute is over where the duty ends.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Outvoted, and Still Bound',
      points: [
        'Power makes you comply, authority gives you a reason',
        'Consent, fairness and accuracy are the three reasons',
        'Being outnumbered is not one of them',
        'The duty weakens only when injustice is grave',
      ],
      closing: 'The hard question is where the duty to obey ends, and whether that limit holds when your side wins.',
    },
    dur: 3.6,
  },
];
