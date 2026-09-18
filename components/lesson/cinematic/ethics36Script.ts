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
  /** 1 = a dashed ring outlines the whole ledger, for "now suppose you forgive". */ regard?: number;
  /** 1 = a "?" holds beside the ledger, for "what does forgiveness change". */ query?: number;
  /** 1 = a check marks the WHOSE FAULT row, for it standing rather than lapsing. */ affirm?: number;
  /** 1 = a dashed box outlines the YOURS TO GIVE label, for "a gift". */ own?: number;
  /** 1 = a struck "NOT A DUTY" plate holds in the clear corner. */ notDuty?: number;
}

export const BEATS: Ethics36Beat[] = [
  {
    p: 25, x: 56, book: 1,
    text: 'Suppose someone wrongs you. The wrong leaves three things behind: what happened, whose fault it was, and what you are owed.',
    dur: 4.2,
  },
  {
    p: 432, x: 56, book: 1, regard: 1,
    text: 'Now suppose you forgive the person who wronged you.',
    dur: 2.6,
  },
  {
    p: 404, x: 56, book: 1, query: 1,
    text: 'Forgiving leaves the past unchanged. So what does forgiveness change?',
    dur: 1.8,
  },
  {
    p: 165, x: 56, book: 1, live: 1,
    interact: {
      prompt: 'What does forgiving cancel: what happened, whose fault it was, or what you are owed?',
      explain: 'What you are owed. Cancelling what happened would be forgetting. Cancelling whose fault it was would be excusing, which denies there was anything to forgive. So forgiveness requires the judgement of fault to stand.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 56, book: 1, struck: 1, excuse: 1,
    text: 'Forgiving is often confused with excusing. To excuse someone is to judge the person not responsible for the wrong.',
    dur: 3.9,
  },
  {
    p: 176, x: 56, book: 1, struck: 1, excuse: 1, affirm: 1,
    text: 'Forgiving, by contrast, assumes that the person was responsible for the wrong.',
    dur: 1.8,
  },
  {
    p: 435, x: 56, book: 1, struck: 1,
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
    p: 459, x: 130, book: 1, struck: 1, gift: 1,
    text: 'On Jeffrie Murphy’s account, resentment is a fitting response to a wrong, and you’re entitled to it.',
    dur: 2.9,
  },
  {
    p: 459, x: 130, book: 1, struck: 1, gift: 1, own: 1,
    text: 'Forgiveness is therefore a gift, which only the wronged person may give or withhold.',
    dur: 1.8,
  },
  {
    p: 455, x: 130, book: 1, struck: 1, gift: 1,
    interact: {
      prompt: 'What is the strongest objection to a duty to forgive?',
      sort: {
        chip: 'a duty to forgive',
        bins: [
          { id: 'feel', label: 'feelings aren’t duties', reads: 'feelings can never be duties' },
          { id: 'time', label: 'it takes time', reads: 'forgiving takes time, and duties fall due at once' },
          { id: 'take', label: 'it becomes demandable', reads: 'the wrongdoer could then claim it by right', correct: true },
        ],
      },
      explain: 'The wrongdoer could then claim it by right. If the right apology obliged you to forgive, forgiveness would no longer be yours to give. Feelings can fall under duties, as when you’re obliged not to cultivate hatred.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 379, x: 130, book: 1, struck: 1, gift: 1, notDuty: 1,
    text: 'This account doesn’t make forgiveness easy, owed or always right. It explains why only the person wronged can choose to forgive.',
    dur: 4.4,
  },
  {
    summary: {
      title: 'What Forgiveness Gives Up',
      points: [
        'Forgiving is not excusing and not forgetting',
        'The wrong has to stand as a wrong',
        'Forgiving gives up a resentment you’re entitled to',
        'Forgiveness that is owed is not forgiveness',
      ],
      closing: 'Forgiving leaves the facts and the fault in place. It gives up only the resentment, which only the person wronged can give up.',
    },
    dur: 3.2,
  },
];
