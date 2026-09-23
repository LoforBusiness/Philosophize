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
  /**
   * 1..3 = a one-shot flash in the gap above the trust bar, naming what the
   * beat just said: 1 "NO EXCEPTIONS" (the duty holds even towards a
   * murderer) · 2 "AN ARGUMENT, NOT A FEELING" (consistency, not revulsion) ·
   * 3 "= THE MAXIM" (labelling the card already on stage).
   */ note?: number;
}

export const BEATS: Eth17Beat[] = [
  {
    p: 462, x: 200, maxim: 1, trust: 1,
    text: 'Suppose a murderer comes to your door and asks where your friend is hiding. May you lie to him?',
    dur: 3.4,
  },
  {
    p: 462, x: 200, maxim: 1, trust: 1, note: 1,
    text: 'Kant answers that you may not. The duty of truthfulness holds even towards a murderer.',
    dur: 1.8,
  },
  {
    p: 463, x: 200, maxim: 1, trust: 1, note: 2,
    text: 'The verdict seems monstrous. Kant defends it with an argument about consistency, not with revulsion at lying.',
    dur: 2.7,
  },
  {
    p: 463, x: 200, maxim: 1, trust: 1, note: 3,
    text: 'Kant calls the rule behind an action its maxim. You may act only on a maxim you could will to be a universal law.',
    dur: 2.1,
  },
  {
    p: 466, x: 132, maxim: 1, copies: 1, trust: 1,
    text: 'Kant’s test asks what would follow if everyone adopted your maxim at once. Here, it tests a maxim of lying whenever it suits you.',
    cite: 'The universalisability test',
    dur: 4.2,
  },
  {
    p: 383, x: 132, maxim: 1, copies: 1, trust: 0.06,
    text: 'A lie deceives only a listener who expects the truth. If everyone lied, no one would expect the truth, and no lie could deceive.',
    dur: 4.0,
  },
  {
    p: 465, x: 132, maxim: 1, copies: 1, trust: 0.06,
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
    p: 165, x: 132, maxim: 1, copies: 1, trust: 0.06, live: 1,
    interact: {
      prompt: 'Which condition does a universal lying maxim depend on and destroy?',
      explain: 'Being believed. A lie deceives only where people expect the truth. Adopted by everyone, the maxim removes that expectation. So it can’t be willed as a universal law. The card and its copies are the maxim itself, not what it relies on.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 453, x: 268, maxim: 1, copies: 1, trust: 0.06,
    text: 'Benjamin Constant objected that a murderer has no right to the truth. No one, he argued, has a right to a truth that harms others.',
    cite: 'Constant’s objection',
    dur: 4.6,
  },
  {
    p: 442, x: 268, maxim: 1, copies: 1, trust: 0.06,
    interact: {
      prompt: 'You told the truth and the murderer killed. Who is responsible?',
      sort: {
        chip: 'THE RESPONSIBILITY',
        bins: [
          { id: 'you', label: 'ON YOU', reads: 'on you, for saying where your friend was' },
          { id: 'both', label: 'SHARED', reads: 'shared between the two of you' },
          { id: 'him', label: 'ON THE MURDERER', reads: 'on the murderer, who alone does the killing', correct: true },
        ],
      },
      explain: 'On the murderer. Kant doesn\'t deny the death is terrible; he denies it\'s imputable to a truthful speaker. A lie would make the outcome yours, because you would have taken the course of events into your own hands.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Why the Lying Maxim Fails',
      points: [
        'Universalising a maxim asks what happens if everyone adopts it',
        'A lie depends on a general expectation of truth',
        'So a lying maxim can’t be willed as a universal law',
        'Kant holds you answerable for your act, not the murderer’s',
      ],
      closing: 'Accepting Kant’s test doesn’t commit you to his verdict. Whether the test forbids this lie remains disputed among Kantians.',
    },
    dur: 3.4,
  },
];
