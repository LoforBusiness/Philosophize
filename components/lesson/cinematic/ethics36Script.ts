import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-36, "What Forgiving Actually Does"
// Theme: A LEDGER WITH THREE LINES, AND ONLY ONE OF THEM CAN BE STRUCK OUT.
//
// The whole difficulty of forgiveness is what it does NOT touch, so the picture
// is three lines that stay on the page — what happened, whose fault it was, what
// is owed — and the reader watches exactly one of them be cancelled. The other
// two are never crossed, never faded, never quietly removed while attention is
// elsewhere. If they went, the lesson would be about forgetting.
//
// GAMIFIED SHAPE:
//   · beat 3  a SCENE TARGET — three ledger lines; tap the one forgiving strikes.
//     Two of the three are wrong for opposite reasons, which is what makes it a
//     question rather than a reading exercise.
//   · beat 7  two CARDS — why a duty to forgive would destroy it.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics36Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the ledger is drawn. */ book?: number;
  /** 1 = the owed line is struck out. */ struck?: number;
  /** 1 = the "excusing" panel is shown beside it, striking the wrong line. */ excuse?: number;
  /** 1 = the hand-over is drawn: whose gift it is. */ gift?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Ethics36Beat[] = [
  {
    p: 25, x: 56, book: 1,
    text: 'Somebody wronged you. Here is what that leaves on the page: what happened, whose fault it was, and what you are owed.',
    dur: 4.2,
  },
  {
    p: 13, x: 56, book: 1,
    text: 'Now you say you forgive them. Nothing about yesterday has changed.',
    dur: 2.6,
  },
  {
    p: 404, x: 56, book: 1,
    text: 'So what did the sentence do?',
    dur: 1.8,
  },
  {
    p: 4, x: 56, book: 1, live: 1,
    interact: {
      prompt: 'Tap the line forgiving strikes out.',
      explain: 'Only the third. Strike the first and you are forgetting. Strike the second and you are excusing — deciding they were not really responsible, which means there was never anything to forgive. Forgiveness needs the verdict to stand.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 56, book: 1, struck: 1, excuse: 1,
    text: 'That line runs between forgiving and excusing, and people slide across the line constantly. Excusing says the person could not help it.',
    dur: 3.9,
  },
  {
    p: 176, x: 56, book: 1, struck: 1, excuse: 1,
    text: 'Forgiving says the person could.',
    dur: 1.8,
  },
  {
    p: 47, x: 56, book: 1, struck: 1,
    quote: {
      id: 'lq-ethics-ethics-36-1',
      text: 'Forgiveness is the forswearing of resentment on moral grounds.',
      author: 'Jeffrie Murphy',
      work: 'Forgiveness and Mercy',
      era: '1988',
      branchSlugs: ['ethics'],
    },
    dur: 3.6,
  },
  {
    p: 167, x: 130, book: 1, struck: 1, gift: 1,
    text: 'Forgiveness is a gift, and a gift has an owner. The resentment was yours by right.',
    dur: 2.9,
  },
  {
    p: 167, x: 130, book: 1, struck: 1, gift: 1,
    text: 'Giving the resentment up is yours to do.',
    dur: 1.8,
  },
  {
    p: 160, x: 130, book: 1, struck: 1, gift: 1,
    interact: {
      prompt: 'What is the strongest objection to a duty to forgive?',
      sort: {
        chip: 'a duty to forgive',
        bins: [
          { id: 'feel', label: 'feelings are not duties', reads: 'feelings can never be duties' },
          { id: 'time', label: 'it takes time', reads: 'forgiving takes time, and duties fall due at once' },
          { id: 'take', label: 'he could demand it', reads: 'the wrongdoer could then take it for himself', correct: true },
        ],
      },
      explain: 'He could demand it. Plenty of duties reach feelings: you can be obliged to stop nursing a grudge. The trouble is ownership. If the right apology forced the outcome, the wrongdoer could help himself to it, and the person wronged would be left holding nothing of their own.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 379, x: 130, book: 1, struck: 1, gift: 1,
    text: 'None of that makes forgiveness easy, or owed, or always right. Forgiveness is simply one of the few things a wronged person still holds.',
    dur: 4.4,
  },
  {
    summary: {
      title: 'The Debt You Choose to Cancel',
      points: [
        'Forgiving is not excusing and not forgetting',
        'The wrong has to stand as a wrong',
        'It gives up resentment you are entitled to',
        'Forgiveness that is owed is not forgiveness',
      ],
      closing: 'Forgiving changes nothing about what happened. That is exactly why the choice belongs to the person wronged, and to nobody waiting on them.',
    },
    dur: 3.2,
  },
];
