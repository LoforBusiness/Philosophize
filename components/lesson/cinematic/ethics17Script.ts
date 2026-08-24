import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-17, "Is It Ever Right to Lie?"
// Theme: ONE MAXIM HANDED TO EVERYBODY, AND THE STOCK IT QUIETLY SPENDS.
//
// The murderer at the door is the famous case and it is a trap for a lesson,
// because a reader who meets it first spends the rest of the time deciding
// whether Kant is a monster. The argument underneath is not about monstrousness
// at all: it is a test you run on a rule by giving it to everyone at once.
//
// So the stage is the test rather than the doorstep. A maxim is written on a
// card, copied to eight people, and the bar underneath — BEING BELIEVED — drains
// while the copies spread. The maxim eats the thing that made it work. Nothing
// is asserted; the reader watches a stock run out.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — three things are on the stage and the reader taps
//     the one the maxim needed. The decoys are the maxim itself and a copy of
//     it, so the wrong answers are "the rule" and "the people", which are the two
//     places anybody looks before they look at the stock (H66).
//   · beat 7  two CARDS — what Kant is actually claiming, against the caricature
//     that he does not mind the death.
// ─────────────────────────────────────────────────────────────────────────────

export interface Eth17Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The maxim card at the top, 0…1. */ maxim?: number;
  /** How far the copies have spread along the row, 0…1. */ copies?: number;
  /** How full the BEING BELIEVED bar is, 0…1. */ trust?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Eth17Beat[] = [
  {
    p: 25, x: 200, maxim: 1, trust: 1,
    text: 'A man at your door asks where your friend is hiding. He means to kill him. Kant says do not lie.',
    dur: 4.4,
  },
  {
    p: 45, x: 200, maxim: 1, trust: 1,
    text: 'That looks monstrous, and Kant knew it. His reason is not that lying is distasteful. It is that it cannot be made a rule.',
    dur: 4.8,
  },
  {
    p: 2, x: 132, maxim: 1, copies: 1, trust: 1,
    text: 'So run his test. Write down what you are about to do, and hand a copy to everybody.',
    cite: 'Universalise it',
    dur: 4.2,
  },
  {
    p: 13, x: 132, maxim: 1, copies: 1, trust: 0.06,
    text: 'Watch the bar. A lie only works on somebody expecting the truth, and now nobody is.',
    dur: 4.0,
  },
  {
    p: 137, x: 132, maxim: 1, copies: 1, trust: 0.06,
    quote: {
      id: 'lq-ethics-ethics-17-2',
      text: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
      author: 'Immanuel Kant',
      work: 'Groundwork of the Metaphysics of Morals',
      era: '1785',
      philosopherId: 'immanuel-kant',
      branchSlugs: ['ethics'],
    },
    dur: 3.6,
  },
  {
    p: 4, x: 132, maxim: 1, copies: 1, trust: 0.06, live: 1,
    interact: {
      prompt: 'Tap the thing the maxim needed, and used up.',
      explain: 'Being believed. A lie only works while most people tell the truth, so it lives off a stock it does not refill. Hand the maxim to everybody and the stock is gone. The rule destroys the thing that made it worth breaking.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 268, maxim: 1, copies: 1, trust: 0.06,
    text: 'Constant pushed back at once. Tell the truth and your friend dies, so surely the blood is on your hands.',
    cite: 'The obvious reply',
    dur: 4.6,
  },
  {
    p: 41, x: 268, maxim: 1, copies: 1, trust: 0.06,
    interact: {
      prompt: 'Kant will not lie to the murderer. What is he actually claiming?',
      cards: [
        { text: 'You answer for your own act', correct: true },
        { text: 'The death would not be bad', correct: false },
      ],
      explain: 'That you answer for your own act, and the murderer answers for his. Kant does not deny the death is terrible. He denies that it lands on your account. The other card is the caricature, and it is why people call him heartless.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Rule That Eats Itself',
      points: [
        'Universalising a maxim asks what happens if everyone adopts it',
        'Lying needs a stock of truth-telling it does not replace',
        'So the maxim cannot be willed as a law for everybody',
        'Kant holds you answerable for your act, not the murderer\'s',
      ],
      closing: 'Most people accept the test and refuse the verdict. Working out why is the rest of ethics.',
    },
    dur: 3.4,
  },
];
