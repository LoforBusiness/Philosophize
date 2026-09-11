import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-30, "Putting It All Together"
// Theme: THREE LENSES OVER ONE HARD CHOICE.
//
// The capstone's claim is that the three theories are QUESTIONS rather than
// camps, so the stage stops drawing them as rivals and draws them as instruments
// pointed at the same thing. One choice on the table, three lenses over it, and
// what a lens is for is looking rather than winning.
//
// The choice card never changes. Whatever a reader decides about the theories,
// the case in front of them is the same case, which is the point of putting all
// three lenses over one object.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what to do with
//     three rival theories. On the stage because all three lenses are hanging
//     there over the same card.
//   · beat 8  TWO CARDS — what to do when the lenses point different ways. Below
//     the figure on purpose: the answer is a way of PROCEEDING rather than a
//     quantity or a place, and a pick is the honest shape for it (R1).
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics30Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the choice on the table is drawn. */ card?: number;
  /** How many of the three lenses are over it, 0…1. */ lenses?: number;
  /** How far the three lenses have parted, 0…1. */ clash?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Ethics30Beat[] = [
  {
    p: 344, x: 24, card: 1,
    text: 'You’ve met the great theories. The question now is how to live with all three of them.',
    dur: 5.0,
  },
  {
    p: 169, x: 24, card: 1, lenses: 0.34,
    text: 'Consequentialism judges an act by what it brings about. Ask what the outcomes will be.',
    dur: 5.0,
  },
  {
    p: 449, x: 24, card: 1, lenses: 0.67,
    text: 'Deontology judges by duties and rights. Ask which rules are at stake and who’s owed what.',
    dur: 5.0,
  },
  {
    p: 262, x: 24, card: 1, lenses: 1,
    text: 'Virtue ethics asks about character. What would a good person do, and who are you becoming?',
    dur: 5.0,
  },
  {
    p: 163, x: 24, card: 1, lenses: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what to do with three rival theories.',
      explain: 'Ask all three questions. Each lens shows something the others miss. A decision that survives all three is far better tested than one that pleases a single formula. Picking whichever suits the moment is motivated reasoning with a reading list.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 468, x: 80, card: 1, lenses: 1,
    text: 'A colleague is secretly cheating customers. Weigh the harm of silence against the fallout of speaking.',
    dur: 5.0,
  },
  {
    p: 447, x: 80, card: 1, lenses: 1,
    quote: {
      id: 'lq-ethics-ethics-30-1',
      text: 'Moral excellence comes about as a result of habit. We become just by doing just acts, temperate by doing temperate acts, brave by doing brave acts.',
      author: 'Aristotle',
      work: 'Nicomachean Ethics',
      era: 'c. 340 BCE',
      philosopherId: 'aristotle',
      branchSlugs: ['ethics'],
    },
    dur: 5.0,
  },
  {
    p: 450, x: 80, card: 1, lenses: 1, clash: 1,
    text: 'Often the three lenses agree. Sometimes they point three different ways, and no formula breaks the tie.',
    dur: 5.0,
  },
  {
    p: 165, x: 80, card: 1, lenses: 1, clash: 1,
    interact: {
      prompt: 'The three lenses disagree. What now?',
      cards: [
        { text: 'Weigh them and own the judgement', correct: true },
        { text: 'Follow whichever rule is strictest', correct: false },
      ],
      explain: 'Weigh them, and own it. Aristotle called the skill practical wisdom. It can’t be reduced to a rule, because the rules are what have collided. Defaulting to the strictest one is a way of not deciding while looking as though you did.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 303, x: 80, card: 1, lenses: 1,
    summary: {
      title: 'Three Lenses, One Life',
      points: [
        'Treat the theories as questions, not rival tribes',
        'Ask about outcomes, about duties, about character',
        'Living well is a habit built by practice',
        'When the lenses clash, weigh them and own the call',
      ],
      closing: 'You came asking what’s right. You leave with the tools to keep asking well.',
    },
    dur: 5.0,
  },
];
