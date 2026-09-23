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
  /** 1 = a ring marks the row where P and Q are both true — the "day with both". */ bothRow?: number;
  /** 1 = a ring marks the two rows where P is false, both counted true. */ pFalse?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic23Beat[] = [
  {
    p: 2, x: 44,
    text: 'Propositional logic uses four basic connectives: and, or, not, and if. Each builds a compound claim from simpler ones.',
    dur: 4.2,
  },
  {
    p: 30, x: 44, rows: 1,
    text: 'Take two claims, P and Q, each either true or false. A truth table lists all four combinations, one per row.',
    dur: 4.4,
  },
  {
    p: 36, x: 44, rows: 1, orCol: 1,
    text: 'In everyday speech, the word “or” often means one but not both. In logic, the claim “P or Q” is true when at least one part is true.',
    dur: 5.0,
  },
  {
    p: 160, x: 44, rows: 1, orCol: 1, bothRow: 1,
    text: 'So the claim “it will rain or snow” is true on a day with both. This is called inclusive disjunction.',
    dur: 4.8,
  },
  {
    p: 161, x: 44, rows: 1, orCol: 1, live: 1,
    interact: {
      prompt: 'In which row of the table is “P or Q” false?',
      explain: 'The bottom row, where P and Q are both false. The claim “P or Q” needs at least one true part, so it’s false only when neither part is true.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 44, rows: 1, orCol: 1, ifCol: 1,
    text: 'The claim “if P, then Q” is called a conditional. It says that whenever P is true, Q is true as well.',
    dur: 4.4,
  },
  {
    p: 62, x: 100, rows: 1, ifCol: 1,
    text: 'A conditional is false in only one case: when P is true and Q is false.',
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
    p: 383, x: 100, rows: 1, ifCol: 1, pFalse: 1,
    text: 'When P is false, the conditional isn’t falsified. So the material conditional of classical logic counts it as true.',
    dur: 4.2,
  },
  {
    p: 21, x: 100, rows: 1, ifCol: 1,
    interact: {
      prompt: 'Which row makes “if P, then Q” false?',
      odd: {
        axis: 'THREE MAKE IT TRUE',
        tiles: [
          { id: 'tt', reads: 'P TRUE, Q TRUE' },
          { id: 'tf', reads: 'P TRUE, Q FALSE', correct: true },
          { id: 'ft', reads: 'P FALSE, Q TRUE' },
          { id: 'ff', reads: 'P FALSE, Q FALSE' },
        ],
      },
      explain: 'Only P true with Q false. A conditional claims that you never get the antecedent without the consequent, so the single row where that happens is the only one it rules out. The two rows with P false don\'t test it at all, which is why they count as true.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Truth Tables for Or and If',
      points: [
        '“And” needs both parts true, and “or” at least one',
        '“Not” reverses a truth value',
        'A conditional is false only when P is true and Q false',
        'A false P makes the whole conditional true',
      ],
      closing: 'A truth table settles the truth of a compound claim from the truth values of its parts.',
    },
    dur: 4.0,
  },
];
