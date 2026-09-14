import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-6, "If, Then: The Conditional". Two full-width boxes wired
// by a bold arrow labelled THE LINK — [IF it rains] → [THEN the streets get wet]. Rain
// falls on the "if" and the "then" fills with water. Under them sits THE PROMISE TABLE:
// a plain-language truth table (rains? · streets wet? · promise kept or broken) whose
// single ink-stamped row is the only combination that breaks a conditional. That table
// is the visual answer to both graded questions.
// Q1 is a scene tap (tap the antecedent); Q2 is A/B/C/D.

export interface Logic6Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** The arrow linking the boxes is shown 0..1. */ link?: number;
  /** Rain demo — rain on the IF box, the THEN box fills 0..1. */ rain?: number;
  /** The promise table under the boxes 0..1. */ table?: number;
  /** The two boxes are tappable this beat (Q1). */ tapBoxes?: number;
}

export const BEATS: Logic6Beat[] = [
  {
    p: 443, link: 0, rain: 0,
    text: 'Many arguments depend on a sentence built with the words “if” and “then”. Logicians call such a sentence a conditional.',
    dur: 3.4,
  },
  {
    // The arrow and the promise table arrive together: the whole diagram assembles
    // on the beat that explains what a conditional actually claims.
    p: 167, link: 1, table: 1,
    text: 'A conditional is a sentence of the form “if P, then Q”. The condition P, introduced by the word “if”, is called the antecedent.',
    cite: 'Antecedent and consequent',
    dur: 2.2,
  },
  {
    // The arrow and the promise table arrive together: the whole diagram assembles
    // on the beat that explains what a conditional actually claims.
    p: 167, link: 1, table: 1,
    text: 'The result Q, introduced by the word “then”, is called the consequent. The conditional claims a link between the two, not that either is true.',
    dur: 2.8,
  },
  {
    p: 13, link: 1, rain: 1, table: 1,
    text: 'Consider the sentence “if it rains, the streets get wet”. The sentence asserts neither rain nor wet streets.',
    cite: 'A link, not a fact',
    dur: 2.2,
  },
  {
    p: 13, link: 1, rain: 1, table: 1,
    text: 'Like a promise, the conditional is broken only if it rains and the streets stay dry. On a day without rain, the promise is kept.',
    dur: 2.8,
  },
  {
    p: 128, link: 1, table: 1,
    quote: {
      id: 'lq-logic-arguments-6',
      text: 'If it was so, it might be; and if it were so, it would be; but as it isn’t, it ain’t. That’s logic.',
      author: 'Lewis Carroll',
      work: 'Through the Looking-Glass',
      era: '1871',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 383, link: 1, table: 1, tapBoxes: 1,
    interact: {
      prompt: 'Which clause of this conditional is the antecedent?',
      explain:
        '“It rains” is the antecedent, the condition introduced by “if”. “The streets get wet” is the consequent. Rules of inference such as modus ponens depend on telling the two apart.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, link: 1, table: 1,
    interact: {
      prompt: 'What does accepting a conditional commit you to?',
      split: {
        left: 'THE LINK ONLY', right: 'THE ANTECEDENT TOO',
        start: 0.04,
        zones: [
          { id: 'both', upto: 0.32, reads: 'the truth of both antecedent and consequent' },
          { id: 'half', upto: 0.66, reads: 'the link, and that the antecedent is likely' },
          { id: 'link', upto: 1, reads: 'the link, and nothing about the antecedent', correct: true },
        ],
      },
      explain: 'Accepting a conditional commits you to the link, and to nothing about the antecedent. You can accept “if it rains, the streets get wet” on a dry day, without believing rain is likely.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Structure of a Conditional',
      points: [
        '“If P, then Q” links a condition to a result',
        'P is the antecedent, Q the consequent',
        'A conditional asserts the link, not that P is true',
        'Many valid forms of deduction rely on conditionals',
      ],
      closing: 'Valid reasoning with conditionals depends on keeping the antecedent and the consequent distinct.',
    },
    dur: 2.8,
  },
];
