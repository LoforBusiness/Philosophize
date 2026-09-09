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
}

export const BEATS: Political40Beat[] = [
  {
    p: 427, x: 32,
    text: 'Two willing people agree a fair price for a vote. Nobody is poor, and nobody is fooled.',
    dur: 4.8,
  },
  {
    p: 174, x: 32, shelves: 0.34,
    text: 'The usual complaint about markets is unfairness. That one does not fit here.',
    dur: 4.2,
  },
  {
    p: 438, x: 32, shelves: 1,
    text: 'So there is a second complaint underneath it, and it is about the goods themselves.',
    dur: 4.6,
  },
  {
    p: 258, x: 32, shelves: 1,
    text: 'Some things are changed by being priced. What the buyer gets is not what they wanted.',
    dur: 4.6,
  },
  {
    p: 260, x: 32, shelves: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what this argument adds to the old one.',
      explain: 'That a sale can spoil the thing. Unfairness was the old objection, and you answer it by making people richer — which does nothing here, since a rich voter selling a vote is still selling a vote. Waste is an argument for markets, not against them.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 450, x: 92, shelves: 1,
    text: 'Firms will hold your place in a queue for a hearing. Everybody involved agrees.',
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
    text: 'A queue was a place where turning up early was the only thing that counted.',
    dur: 4.4,
  },
  {
    p: 264, x: 92, shelves: 1, token: 1,
    interact: {
      prompt: 'Where does a bought place at the front belong?',
      sort: {
        chip: 'a place in the queue',
        bins: [
          { id: 'free', label: 'sold freely', reads: 'a queue is just one way of rationing' },
          { id: 'changed', label: 'changed by sale', reads: 'sold, and then no longer a queue', correct: true },
          { id: 'blocked', label: 'not for sale', reads: 'never, whatever the circumstances' },
        ],
      },
      explain: 'The middle shelf. Calling a queue mere rationing throws away the thing that made it a queue — time was the only currency in it. And a flat ban is more than the argument needs: this is a case for naming what you lose, not for a rule.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 92, shelves: 1, token: 1,
    summary: {
      title: 'Spheres',
      points: [
        'Unfairness is not the only case against a market',
        'Pricing a good can change what the good is',
        'Walzer kept each good inside its own sphere',
        'Ask what survives the sale, not who profits',
      ],
      closing: 'No particular case is settled here. Walzer hands you a second question to ask, once the question about who could afford the good has been answered.',
    },
    dur: 4.4,
  },
];
