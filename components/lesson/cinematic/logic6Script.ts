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
    p: 1, link: 1, table: 1,
    text: 'A conditional says "if P, then Q." P is the antecedent — the condition. Q is the consequent — what follows. It promises nothing about P alone, only the link between them.',
    cite: 'Antecedent → consequent',
    dur: 5.0,
  },
  {
    p: 13, link: 1, rain: 1, table: 1,
    text: '"If it rains, the streets get wet." This does not say it IS raining. It claims only a link: should rain come, wet streets follow. A sunny day leaves the promise unbroken.',
    cite: 'A promise, not a fact',
    dur: 5.0,
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
    p: 13, link: 1, table: 1, tapBoxes: 1,
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
      prompt: 'A conditional is true. Does that mean its antecedent is actually true?',
      cards: [
        { text: 'No, only the link', correct: true },
        { text: 'Yes, the if is true', correct: false },
      ],
      explain: '"If pigs fly, the moon is cheese" can be accepted as true while pigs stay grounded — the conditional asserts only the connection.',
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
