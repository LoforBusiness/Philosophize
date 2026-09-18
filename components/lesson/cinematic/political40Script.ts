import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-40, "What Money Should Not Buy"
// Theme: THREE REGISTERS OF GOODS, AND WHICH ONE A BOUGHT PLACE SITS ON.
//
// Walzer's claim is that goods live in SPHERES, so the scene draws the spheres as
// three registers stacked one above another and puts a single good on them. The
// argument is then a position rather than a verdict: the reader is not asked
// whether markets are good, they are asked which shelf one thing belongs on.
//
// The registers are drawn from one style and one tone. A shelf that looked
// disreputable would answer the question in the furniture, and the whole point is
// that the middle shelf — sellable, and spoiled by selling — is the one nobody
// notices until somebody names it.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what this
//     argument adds to the old one. On the stage because the middle register is
//     already sitting there, unexplained, while the question is asked.
//   · beat 8  a SORT — a bought place in a queue, dropped onto a register. The
//     reader's own chip carries the token from shelf to shelf, so taking the
//     position is putting the thing where they think it goes.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political40Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the three registers are drawn, 0…1. */ shelves?: number;
  /** 1 = the good under discussion is on the shelves. */ token?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = the middle register is shown to change what passes through it. */ spoiled?: number;
  /** 1 = the queue's own single criterion, written under the shelves. */ queue?: number;
}

export const BEATS: Political40Beat[] = [
  {
    p: 427, x: 32,
    text: 'Suppose two willing people agree a fair price for a vote. Neither is poor, and neither is deceived.',
    dur: 4.8,
  },
  {
    p: 174, x: 32, shelves: 0.34,
    text: 'The usual objection to a market is that it favours the rich over the poor. That worry doesn’t apply to this sale.',
    dur: 4.2,
  },
  {
    p: 438, x: 32, shelves: 1,
    text: 'A second objection concerns the good itself rather than the fairness of the exchange.',
    dur: 4.6,
  },
  {
    p: 258, x: 32, shelves: 1,
    spoiled: 1,
    text: 'Some things are changed by being priced. A purchased vote no longer expresses a citizen’s own judgement.',
    dur: 4.6,
  },
  {
    p: 260, x: 32, shelves: 1, plates: 1, live: 1,
    interact: {
      prompt: 'What does the second objection add to the charge that a sale is unfair?',
      explain: 'It spoils it. A sale can change the good itself. Redistributing wealth would answer unfairness, but a rich voter who sells a vote still sells a vote. Inefficiency isn’t the objection, since markets are defended as efficient.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 450, x: 92, shelves: 1,
    text: 'Michael Sandel describes firms that are paid to hold places in queues for congressional hearings. Everyone involved consents.',
    dur: 4.4,
  },
  {
    p: 425, x: 92, shelves: 1,
    quote: {
      id: 'lq-political-political-40-1',
      text: 'Every social good or set of goods constitutes, as it were, a distributive sphere within which only certain criteria and arrangements are appropriate.',
      author: 'Michael Walzer',
      work: 'Spheres of Justice',
      era: '1983',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.8,
  },
  {
    p: 381, x: 92, shelves: 1,
    queue: 1,
    text: 'A queue distributes places by a single criterion: who arrived first, and who was willing to wait.',
    dur: 4.4,
  },
  {
    p: 264, x: 92, shelves: 1, token: 1,
    interact: {
      prompt: 'Where does a purchased place at the front of a queue belong among these goods?',
      sort: {
        chip: 'a place in the queue',
        bins: [
          { id: 'free', label: 'sold freely', reads: 'queuing is only one way of rationing' },
          { id: 'changed', label: 'changed by sale', reads: 'sale turns the queue into an auction', correct: true },
          { id: 'blocked', label: 'not for sale', reads: 'never for sale, whatever the circumstances' },
        ],
      },
      explain: 'Changed by sale. Selling places turns a queue into an auction, so patience stops deciding who goes first. A flat ban goes further than the argument requires. The argument shows what a sale destroys.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 92, shelves: 1, token: 1,
    summary: {
      title: 'Spheres and the Limits of Markets',
      points: [
        'Unfairness is not the only case against a market',
        'Pricing a good can change what the good is',
        'Walzer: each good has its own distributive sphere',
        'Ask what a sale changes, not only who profits',
      ],
      closing: 'Walzer’s approach adds a second question to fairness: what selling a good does to the good itself.',
    },
    dur: 4.4,
  },
];
