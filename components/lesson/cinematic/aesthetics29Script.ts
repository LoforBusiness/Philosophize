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
    text: 'Suppose you read a novel about a war that was never fought, with soldiers who never lived. You may still feel you learned something.',
    dur: 5.0,
  },
  {
    p: 173, x: 24, trays: 1, book: 1, gives: 0.45,
    text: 'A work of fiction describes events that didn’t happen. How, then, could it teach anything true?',
    dur: 4.8,
  },
  {
    p: 449, x: 24, trays: 1, book: 1, gives: 0.1,
    text: 'Plato would banish poets from his ideal city. Poetry, he argued, imitates appearances and stirs feeling against reason.',
    dur: 5.0,
  },
  {
    p: 266, x: 24, trays: 1, book: 1, gives: 0.45,
    text: 'A psychology textbook can tell you that grief exists. A novel can show what grief is like from the inside.',
    dur: 5.0,
  },
  {
    p: 163, x: 24, trays: 1, book: 1, gives: 0.45, plates: 1, live: 1,
    interact: {
      prompt: 'What can a novel about an invented war give its reader?',
      explain: 'A deeper grasp. The soldiers are invented, so the novel supplies no new historical facts. It can, however, convey what courage and fear are like from the inside, which a list of dates can’t.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 460, x: 80, trays: 1, book: 1, gives: 0.45,
    text: 'Suppose a reader finishes a war novel and says she now understands what soldiers endure.',
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
    text: 'Jerome Stolnitz argued that fiction’s truths are trivial and unconfirmed. Its soldiers are invented, so nothing in the novel confirms what real soldiers feel.',
    dur: 5.0,
  },
  {
    p: 174, x: 80, trays: 1, book: 1,
    interact: {
      prompt: 'How much knowledge can a novel about invented events provide?',
      drag: {
        lo: 'NOTHING',
        hi: 'PLAIN FACTS',
        start: 0.95,
        zones: [
          { id: 'lie', upto: 0.25, reads: 'a pleasing falsehood that teaches nothing' },
          { id: 'grasp', upto: 0.7, reads: 'a deeper grasp rather than new facts', correct: true },
          { id: 'text', upto: 1, reads: 'factual knowledge, as a textbook gives' },
        ],
      },
      explain: 'A deeper grasp rather than new facts. An invented story gives no historical facts, yet it can show what people of a kind would do. Aristotle held that poetry expresses such universals.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 310, x: 80, trays: 1, book: 1, gives: 0.45,
    summary: {
      title: 'Fiction and Knowledge',
      points: [
        'Fiction is literally false and still seems to teach',
        'Plato: art imitates, misleads and inflames feeling',
        'Aristotle: poetry shows the probable and the universal',
        'Fiction may give understanding rather than facts',
      ],
      closing: 'Fiction’s events are invented, but its insight into human life may still be true.',
    },
    dur: 5.0,
  },
];
