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
    text: 'Ethics has three major normative theories. The practical question is how to use all three when making a real decision.',
    dur: 5.0,
  },
  {
    p: 169, x: 24, card: 1, lenses: 0.34,
    text: 'Consequentialism judges an act by its outcomes. It asks which available act will bring about the best consequences.',
    dur: 5.0,
  },
  {
    p: 449, x: 24, card: 1, lenses: 0.67,
    text: 'Deontology judges an act by whether it respects duties and rights. The deontologist asks what moral rules apply and what each person is owed.',
    dur: 5.0,
  },
  {
    p: 262, x: 24, card: 1, lenses: 1,
    text: 'Virtue ethics focuses on character. It asks what a virtuous person would do, and which traits the act would build in you.',
    dur: 5.0,
  },
  {
    p: 163, x: 24, card: 1, lenses: 1, plates: 1, live: 1,
    interact: {
      prompt: 'How should you use three rival moral theories in practice?',
      explain: 'Ask all three. Each theory draws attention to features of a case that the others can overlook. A decision that survives all three questions is better tested than one that satisfies a single theory. Choosing whichever theory gives the answer you want is motivated reasoning.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 468, x: 80, card: 1, lenses: 1,
    text: 'Suppose you learn that a colleague is secretly defrauding customers. You must decide whether to speak or stay silent.',
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
    text: 'Often the three theories give the same verdict. When they conflict, no formula decides between them.',
    dur: 5.0,
  },
  {
    p: 165, x: 80, card: 1, lenses: 1, clash: 1,
    interact: {
      prompt: 'When the three theories conflict, how should you decide?',
      cards: [
        { text: 'Weigh them using practical judgement', correct: true },
        { text: 'Always follow the strictest rule', correct: false },
      ],
      explain: 'Weigh them using practical judgement. Aristotle called this skill practical wisdom. No rule can replace it, because rules are what conflict here. Always taking the strictest rule is a way to avoid judging, not a way to judge.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 303, x: 80, card: 1, lenses: 1,
    summary: {
      title: 'Using Three Moral Theories',
      points: [
        'Treat the theories as questions, not rival doctrines',
        'Ask about outcomes, about duties, about character',
        'Aristotle: virtue is a habit built by practice',
        'When the theories conflict, practical wisdom must weigh them',
      ],
      closing: 'No theory removes the need for judgement, but together they show what a judgement must consider.',
    },
    dur: 5.0,
  },
];
