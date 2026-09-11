import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-23, "And, Or, Not, If"
// Theme: FOUR ROWS OF TWO LAMPS, AND WHAT EACH CONNECTIVE DOES WITH THEM.
//
// A truth table IS the picture, so the scene draws one rather than illustrating
// one. Two lamps a row, lit for true and hollow for false, and a result lamp that
// the connective decides. Nothing here is a metaphor: this is the object the
// lesson is about, at the size a reader can count.
//
// The two questions take the two connectives that surprise people, and they take
// them from opposite directions. OR is surprising because it is looser than
// speech — only one row can kill it. IF is surprising because it is far more
// forgiving than a promise sounds — three of the four rows keep it.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — the four rows themselves, and the reader taps the
//     only one where "P or Q" comes out false. On the stage because the answer is
//     read off the picture rather than remembered.
//   · beat 9  a SPLIT — how much of the same table "if P then Q" keeps. The seam
//     recolours the rows under the reader's thumb, so the answer is the picture
//     being sorted rather than a number being guessed (R7b: the seam is the LEFT
//     side's share, and the left side is KEPT).
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic23Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many rows of the table have been drawn, 0…1. */ rows?: number;
  /** 1 = the OR column and its heading are shown. */ orCol?: number;
  /** 1 = the IF column and its heading are shown. */ ifCol?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic23Beat[] = [
  {
    p: 2, x: 44,
    text: 'Four small words carry every argument you’ll ever check. Start with two.',
    dur: 4.2,
  },
  {
    p: 30, x: 44, rows: 1,
    text: 'P and Q are either true or false. Four rows cover every way that can go.',
    dur: 4.4,
  },
  {
    p: 36, x: 44, rows: 1, orCol: 1,
    text: 'Take the word “or”. In speech it often means one or the other, but in logic it means at least one.',
    dur: 5.0,
  },
  {
    p: 160, x: 44, rows: 1, orCol: 1,
    text: 'So taking both cake and pie isn’t cheating. It’s the plainest way to keep the promise.',
    dur: 4.8,
  },
  {
    p: 161, x: 44, rows: 1, orCol: 1, live: 1,
    interact: {
      prompt: 'Tap the only row where P or Q comes out false.',
      explain: 'The bottom row, where both lamps are out. OR asks for at least one, so the only way to fail it is to bring nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 44, rows: 1, orCol: 1, ifCol: 1,
    text: 'Now the awkward one. The sentence “if P, then Q” is a promise about what follows P.',
    dur: 4.4,
  },
  {
    p: 62, x: 100, rows: 1, ifCol: 1,
    text: 'It breaks in one place only: P happens and Q does not.',
    dur: 3.6,
  },
  {
    p: 433, x: 100, rows: 1, ifCol: 1,
    quote: {
      id: 'lq-logic-arguments-23-1',
      text: 'A proposition is a truth-function of elementary propositions.',
      author: 'Ludwig Wittgenstein',
      philosopherId: 'ludwig-wittgenstein',
      work: 'Tractatus Logico-Philosophicus',
      era: '1921',
      branchSlugs: ['logic'],
    },
    dur: 4.2,
  },
  {
    p: 383, x: 100, rows: 1, ifCol: 1,
    text: 'When P never happens, the promise was never called on. Nothing was broken.',
    dur: 4.2,
  },
  {
    p: 21, x: 100, rows: 1, ifCol: 1,
    interact: {
      prompt: 'How much of this table does IF P THEN Q keep?',
      split: {
        left: 'KEEPS IT',
        right: 'BREAKS IT',
        start: 0.5,
        zones: [
          { id: 'half', upto: 0.38, reads: 'half kept, half broken' },
          { id: 'most', upto: 0.62, reads: 'a bit more kept than broken' },
          { id: 'three', upto: 1, reads: 'three rows kept, and one broken', correct: true },
        ],
      },
      explain: 'Three of the four. Only the row with P true and Q false breaks it. That’s why “if pigs fly, I’m the Pope” counts as true. The pigs never flew, so the promise was never tested.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Four Rows, Two Surprises',
      points: [
        'AND needs both; OR needs at least one',
        'NOT flips a value and nothing else',
        'IF breaks only when P holds and Q fails',
        'A false P leaves the whole IF standing',
      ],
      closing: 'A truth table is a lie detector. Feed it the parts and read the whole off the bottom.',
    },
    dur: 4.0,
  },
];
