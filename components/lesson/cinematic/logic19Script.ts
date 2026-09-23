import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-19, "The Mind That Only Hears Yes"
// Theme: FOUR CARDS ON A TABLE, AND THE ONE NOBODY EVER TURNS OVER.
//
// Wason's selection task, played rather than described. It is the rare result
// that survives being explained — you can know the answer and still feel the pull
// of the wrong card — so the lesson lets the reader make the mistake first and
// only then names it.
//
// The four cards are drawn from the start and never change. What changes is which
// two the reader has been told about, which is the honest staging of a task whose
// whole content is what you chose to LOOK at.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — four cards, tap the one that could still break the
//     rule. Every decoy is a card a real person really does turn, and the four is
//     the one nearly everybody picks (H66).
//   · beat 7  a SPLIT — the reader divides their own searching between cases that
//     could confirm and cases that could refute, and watches the two numbers
//     trade off. A pick could not have asked that: the interesting part is the
//     proportion, and the proportion is what the bias distorts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Log19Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The rule on its plate above the table, 0…1. */ rule?: number;
  /** How many cards are dealt, 0…1. */ cards?: number;
  /** Which cards people reach for, ringed, 0…1. */ reach?: number;
  /** The seven turned over, 0…1. */ turned?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Log19Beat[] = [
  {
    p: 379, x: 200, rule: 1, cards: 1,
    text: 'Four cards each have a letter on the front and a number on the back. The rule says a vowel on the front means an even number on the back.',
    cite: 'The rule',
    dur: 4.2,
  },
  {
    p: 384, x: 200, rule: 1, cards: 1, reach: 1,
    text: 'Which cards must be turned over to test the rule? In Peter Wason’s selection task, the most common answer is the vowel and the even number.',
    dur: 4.4,
  },
  {
    p: 447, x: 132, rule: 1, cards: 1, reach: 1,
    text: 'Turning the four can’t refute the rule. A vowel on its front would satisfy the rule, and the rule says nothing about consonants.',
    cite: 'An uninformative card',
    dur: 4.4,
  },
  {
    p: 165, x: 132, rule: 1, cards: 1, live: 1,
    interact: {
      prompt: 'Besides the vowel, which card could reveal a vowel paired with an odd number?',
      explain: 'The seven. A vowel on its front would refute the rule, so the seven must be turned, along with the vowel. The four and the consonant can’t refute the rule, whatever their hidden sides show.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, rule: 1, cards: 1, turned: 1,
    text: 'The seven has a vowel on its front. One counterexample is enough to show that the rule is false.',
    cite: 'A counterexample',
    dur: 4.0,
  },
  {
    p: 383, x: 268, rule: 1, cards: 1, turned: 1,
    text: 'Wason explained the common answer by confirmation bias, the tendency to seek cases that confirm a belief. Only a card that could refute the rule can test it.',
    dur: 4.6,
  },
  {
    p: 128, x: 268, rule: 1, cards: 1, turned: 1,
    quote: {
      id: 'lq-logic-arguments-19-1',
      text: 'It is easy to obtain confirmations, or verifications, for nearly every theory — if we look for confirmations.',
      author: 'Karl Popper',
      work: 'Conjectures and Refutations',
      era: '1963',
      philosopherId: 'karl-popper',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    p: 442, x: 268, rule: 1, cards: 1, turned: 1,
    interact: {
      prompt: 'To test a belief, what should you go looking for?',
      sort: {
        chip: 'YOUR SEARCH',
        bins: [
          { id: 'refute', label: 'CASES AGAINST', reads: 'mostly cases that could show it false', correct: true },
          { id: 'even', label: 'HALF AND HALF', reads: 'confirming and refuting cases alike' },
          { id: 'confirm', label: 'CASES FOR', reads: 'mostly cases that would confirm it' },
        ],
      },
      explain: 'Cases that could show it false. A confirming case is consistent with the belief being wrong in some other part of its range, so it moves you very little; a refuting case settles the matter. Looking for agreement finds it whether or not the belief is true.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Confirmation Bias and the Selection Task',
      points: [
        'Confirmation bias is a bias in which evidence you seek',
        'A test that could not refute a claim tests nothing',
        'Only cards that could violate the rule are informative',
        'Ask what would have to be true for you to be wrong',
      ],
      closing: 'Few people choose the seven, yet only the seven and the vowel can show the rule is false.',
    },
    dur: 3.4,
  },
];
