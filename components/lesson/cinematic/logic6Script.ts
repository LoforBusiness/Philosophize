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
    p: 2, link: 0, rain: 0,
    text: 'Two tiny words run almost every argument. Master "if" and "then" and you hold logic’s favourite tool.',
    dur: 3.4,
  },
  {
    // The arrow and the promise table arrive together: the whole diagram assembles
    // on the beat that explains what a conditional actually claims.
    p: 167, link: 1, table: 1,
    text: 'A conditional says "if P, then Q. P is the antecedent — the condition.',
    cite: 'Antecedent → consequent',
    dur: 2.2,
  },
  {
    // The arrow and the promise table arrive together: the whole diagram assembles
    // on the beat that explains what a conditional actually claims.
    p: 167, link: 1, table: 1,
    text: 'Q is the consequent — what follows. It promises nothing about P alone, only the link between them.',
    dur: 2.8,
  },
  {
    p: 13, link: 1, rain: 1, table: 1,
    text: '"If it rains, the streets get wet. The sentence does not say rain IS falling.',
    cite: 'A promise, not a fact',
    dur: 2.2,
  },
  {
    p: 13, link: 1, rain: 1, table: 1,
    text: 'The sentence claims only a link: if rain comes, wet streets follow. A sunny day leaves the promise unbroken.',
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
      prompt: 'One of these two boxes is the antecedent — the condition "if" introduces. Tap it.',
      explain:
        'The antecedent is the condition "if" introduces: here, "it rains". The consequent is what "then" delivers: wet streets. Name them the right way round and every later rule of inference falls into place.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, link: 1, table: 1,
    interact: {
      prompt: 'Slide the seam to divide what accepting a conditional commits you to.',
      split: {
        left: 'THE LINK ONLY', right: 'THE IF AS WELL',
        start: 0.04,
        zones: [
          { id: 'both', upto: 0.32, reads: 'accepting it means signing up for flying pigs' },
          { id: 'half', upto: 0.66, reads: 'the link, and belief in the if' },
          { id: 'link', upto: 1, reads: 'the link, and nothing whatever about the if', correct: true },
        ],
      },
      explain: 'All of it goes to the link. If pigs fly, the moon is cheese can be accepted as true while pigs stay firmly on the ground, because the sentence never claimed pigs fly. It claimed only that one would bring the other.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Conditional Unlocked',
      points: [
        '"If P, then Q" links a condition to a result',
        'P is the antecedent, Q the consequent',
        'It asserts the link, not that P is true',
        'Conditionals power deduction’s strongest moves',
      ],
      closing: 'Grasp the if-then and the next moves of logic snap into place.',
    },
    dur: 2.8,
  },
];
