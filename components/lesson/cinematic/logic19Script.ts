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
    p: 25, x: 200, rule: 1, cards: 1,
    text: 'A rule, and four cards. Each one has a letter on the face and a number on the back.',
    cite: 'The rule',
    dur: 4.2,
  },
  {
    p: 2, x: 200, rule: 1, cards: 1, reach: 1,
    text: 'Which two would you turn to test it? Almost everybody reaches for the vowel and the even number.',
    dur: 4.4,
  },
  {
    p: 45, x: 132, rule: 1, cards: 1, reach: 1,
    text: 'Turn the four and the rule survives whatever is on its back. A consonant is allowed an even number.',
    cite: 'The useless one',
    dur: 4.4,
  },
  {
    p: 4, x: 132, rule: 1, cards: 1, live: 1,
    interact: {
      prompt: 'Tap the card that could still break the rule.',
      explain: 'The seven. Turning it is the only move that can come back with bad news. A test that cannot fail is not a test. The four is safe whatever is behind it, which is exactly why people reach for it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, rule: 1, cards: 1, turned: 1,
    text: 'There it is. A vowel behind the seven and the rule is dead on the table.',
    cite: 'The one that matters',
    dur: 4.0,
  },
  {
    p: 13, x: 268, rule: 1, cards: 1, turned: 1,
    text: 'You went looking for the card that would say yes. The card that could say no is the one that tests anything.',
    dur: 4.6,
  },
  {
    p: 137, x: 268, rule: 1, cards: 1, turned: 1,
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
    p: 41, x: 268, rule: 1, cards: 1, turned: 1,
    interact: {
      prompt: 'Split your checking between the two kinds of case.',
      split: {
        left: 'COULD CONFIRM IT',
        right: 'COULD REFUTE IT',
        start: 0.82,
        zones: [
          { id: 'refute', upto: 0.4, reads: 'you are hunting for trouble', correct: true },
          { id: 'even', upto: 0.65, reads: 'an even-handed search' },
          { id: 'confirm', upto: 1, reads: 'you are collecting yeses' },
        ],
      },
      explain: 'Toward the cases that could go badly. A confirming case is cheap and there are always more of them. The only observation that changes anything is the one your belief forbids, so that is where the effort belongs.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Looking For The Yes',
      points: [
        'Confirmation bias is a bias in what you go and check',
        'A test that cannot come back badly tests nothing',
        'The informative card is the one your rule forbids',
        'Ask what would have to be true for you to be wrong',
      ],
      closing: 'Nobody turns the seven, and the seven is the only card with anything to say.',
    },
    dur: 3.4,
  },
];
