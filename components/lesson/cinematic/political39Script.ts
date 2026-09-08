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
    text: 'Sixty said yes and forty said no. You were one of the forty.',
    dur: 3.4,
  },
  {
    p: 2, x: 52, tally: 1, law: 1,
    text: 'And now it is the law, including for you. Something has to join a count to an obligation, and being outnumbered will not.',
    dur: 4.8,
  },
  {
    p: 36, x: 52, tally: 1, law: 1, reasons: 1,
    text: 'Four things get offered. Three of them are arguments.',
    dur: 3.0,
  },
  {
    p: 165, x: 52, tally: 1, law: 1, reasons: 1, live: 1,
    interact: {
      prompt: 'Tap the one that is not a reason at all.',
      explain: 'Having more people is a fact about force. It explains why you will comply and never why you should, which is the whole difference between power and authority. The other three at least offer you something you could accept alone in a room.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 52, tally: 1, law: 1, reasons: 1,
    text: 'Power makes you comply. Authority gives you a reason you would still hold with nobody watching.',
    dur: 4.0,
  },
  {
    p: 168, x: 98, tally: 1, law: 1, reasons: 1,
    text: 'John Locke put the case for the count itself. A body that needs unanimous consent to move never moves.',
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
      prompt: 'Draw the duty as the law gets worse.',
      plot: {
        cols: ['SLIGHTLY', 'CLEARLY', 'BADLY', 'GROSSLY'],
        axis: 'DUTY TO OBEY',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'flat', profile: [0.88, 0.88, 0.88, 0.88], reads: 'a vote is a vote, whatever it decides' },
          { id: 'cliff', profile: [0.9, 0.78, 0.5, 0.05], reads: 'it holds a long way, and then gives out', correct: true },
          { id: 'none', profile: [0.14, 0.12, 0.1, 0.05], reads: 'no duty at any point, so losing is optional' },
          { id: 'rise', profile: [0.2, 0.45, 0.72, 0.95], reads: 'more duty the worse the law, held by nobody' },
        ],
      },
      explain: 'It holds a long way and then gives out. A flat line makes every atrocity binding on the people it is done to. A floor of nothing makes losing an election optional. Where the cliff sits is the whole disagreement, and almost nobody puts it at either end.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Outvoted, and Still Bound',
      points: [
        'Power makes you comply, authority gives you a reason',
        'Consent, fairness and numbers are the three offers',
        'Being outnumbered is not one of them',
        'The duty holds a long way and then gives out',
      ],
      closing: 'The question is never whether there is a limit. The question is where you put the limit, and whether it holds when your own side is the sixty.',
    },
    dur: 3.6,
  },
];
