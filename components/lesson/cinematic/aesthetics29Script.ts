import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-29, "Can a Novel Teach You Something True?"
// Theme: TWO EMPTY TRAYS, AND WHAT A NOVEL PUTS IN THEM.
//
// The whole quarrel turns on there being two different things a book can hand
// over, so the stage draws two trays and lets the reader fill them. Nobody has
// to be told that facts and understanding are different once the answer has put
// something in one tray and left the other empty.
//
// The book itself never changes. It is the same invented story at every setting,
// which is what makes the question about the READER rather than about the novel.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what a war novel
//     can hand over. On the stage because both trays are standing there and the
//     answer is a statement about which of them fills.
//   · beat 8  a DRAG — how much a novel delivers. The two trays fill at different
//     rates, so a reader who drags to the far end watches fiction turn into a
//     textbook and can see that the answer has gone wrong.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics29Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two trays and their names are drawn. */ trays?: number;
  /** 1 = the book below them is drawn. */ book?: number;
  /** How much the novel hands over, 0…1. */ gives?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Aesthetics29Beat[] = [
  {
    p: 431, x: 24, trays: 1, book: 1,
    text: 'It never happened. A war that was never fought, soldiers who never lived, and you learned something.',
    dur: 5.0,
  },
  {
    p: 173, x: 24, trays: 1, book: 1, gives: 0.45,
    text: 'Fiction is false on its face. So the puzzle is how anything true gets out of it.',
    dur: 4.8,
  },
  {
    p: 449, x: 24, trays: 1, book: 1, gives: 0.1,
    text: 'Plato wanted the poets exiled. Art copies a copy, he argued, and stirs feeling over reason.',
    dur: 5.0,
  },
  {
    p: 266, x: 24, trays: 1, book: 1, gives: 0.45,
    text: 'A textbook tells you that grief exists. A novel puts you inside it for four hundred pages.',
    dur: 5.0,
  },
  {
    p: 163, x: 24, trays: 1, book: 1, gives: 0.45, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what a war novel can hand a reader.',
      explain: 'A deeper grasp. The soldiers are invented, so no new fact changed hands. What changed is knowing courage and fear from inside, which a list of dates cannot deliver.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 460, x: 80, trays: 1, book: 1, gives: 0.45,
    text: 'A reader finishes a war novel and says she understands those soldiers now.',
    dur: 4.6,
  },
  {
    p: 443, x: 80, trays: 1, book: 1, gives: 0.45,
    quote: {
      id: 'lq-aesthetics-aesthetics-29-1',
      text: 'The poet... is far removed from the truth... he is the maker of an image.',
      author: 'Plato',
      work: 'Republic',
      era: 'c. 375 BCE',
      philosopherId: 'plato',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.8,
  },
  {
    p: 456, x: 80, trays: 1, book: 1, gives: 0.45,
    text: 'A sceptic answers that she learned nothing. The soldiers are invented, so the lesson was her own feeling.',
    dur: 5.0,
  },
  {
    p: 174, x: 80, trays: 1, book: 1,
    interact: {
      prompt: 'How much does a novel hand over?',
      drag: {
        lo: 'NOTHING',
        hi: 'PLAIN FACTS',
        start: 0.95,
        zones: [
          { id: 'lie', upto: 0.25, reads: 'a pleasant lie, and nothing more' },
          { id: 'grasp', upto: 0.7, reads: 'a deeper grasp rather than new facts', correct: true },
          { id: 'text', upto: 1, reads: 'a textbook with invented characters' },
        ],
      },
      explain: 'No new facts, but a deeper grasp. Plato called the poet a maker of images, twice removed from the truth. The reply is that a false story can still show a real thing clearly, which is understanding rather than information.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 310, x: 80, trays: 1, book: 1, gives: 0.45,
    summary: {
      title: 'Truth in Make-Believe',
      points: [
        'Fiction is literally false and still seems to teach',
        'Plato: art imitates, misleads and inflames feeling',
        'Aristotle: poetry shows the probable and the universal',
        'Fiction may give understanding rather than facts',
      ],
      closing: 'The best fiction lies about everything except the things that matter.',
    },
    dur: 5.0,
  },
];
