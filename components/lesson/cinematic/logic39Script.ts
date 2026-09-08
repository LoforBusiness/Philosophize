import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-39, "The Rule That Breaks Itself"
// Theme: THREE PLANKS, AND ONE BLADE THAT THE SENTENCE ITSELF SET GOING.
//
// Three claims are laid across two posts, one to a plank, and they are drawn
// identically on purpose — the reader has to work out which one is standing on
// something it has already sawn through, and nothing in the picture gives it
// away before they choose (group O).
//
// Then the blade runs, and the blade is not an outside objection: it carries the
// claim's own demand, PROVE IT, so what destroys the plank is the standard the
// sentence set. The two halves come down; the other two planks do not move,
// because neither of them is about claims and so neither is in its own scope.
//
// GAMIFIED SHAPE:
//   · beat 2  SCENE TARGETS — three planks, and the reader picks the one that
//     cannot survive. On the stage rather than in the deck because the three
//     claims must be seen SIDE BY SIDE, which is the whole comparison.
//   · beat 7  a POLL — what follows once a claim has convicted itself, with the
//     thinkers who held each answer. The stage follows the ballot: the broken
//     plank mends where the reader says a claim may exempt itself, and lifts off
//     the posts where they say it was never a claim at all.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic39Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the posts and the three planks stand. */ planks?: number;
  /** How far the blade has run along the middle plank, 0…1. */ saw?: number;
  /** How far the sawn plank has come down, 0…1. */ snap?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic39Beat[] = [
  {
    p: 25, x: 58, planks: 1,
    text: 'Most claims need evidence before you can argue with them. A few need nothing but themselves.',
    dur: 4.0,
  },
  {
    p: 47, x: 58, planks: 1,
    text: 'Three claims, one to a plank. The test is to hold each one to the standard it sets.',
    dur: 3.6,
  },
  {
    p: 165, x: 58, planks: 1, live: 1,
    interact: {
      prompt: 'Tap the claim that cannot survive its own test.',
      explain: 'Only the middle plank is about claims, so only it lands inside its own scope. Every event has a cause is about events. Some claims are false is happily one of them. A claim has to cover itself before it can convict itself.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 379, x: 58, planks: 1, saw: 1,
    text: 'Nothing can be proved is itself a claim, so it invites the one question it forbids.',
    dur: 3.8,
  },
  {
    p: 384, x: 58, planks: 1, saw: 1, snap: 1,
    text: 'Prove it, and something can be proved. Do not, and you are asking to be believed on nothing.',
    dur: 4.0,
  },
  {
    p: 168, x: 106, planks: 1, saw: 1, snap: 1,
    text: 'No outside evidence went into the verdict. The sentence did the whole job.',
    dur: 3.2,
  },
  {
    p: 433, x: 106, planks: 1, saw: 1, snap: 1,
    quote: {
      id: 'lq-logic-arguments-39-1',
      text: 'Such a man, as such, is from the start no better than a vegetable.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Metaphysics IV',
      era: 'c. 350 BC',
      branchSlugs: ['logic'],
    },
    dur: 4.0,
  },
  {
    p: 176, x: 106, planks: 1, saw: 1, snap: 1,
    interact: {
      prompt: 'A claim has convicted itself. What follows?',
      poll: {
        options: [
          { id: 'false', reads: 'it is false, and nothing else is needed', holders: ['Plato', 'Aristotle'], correct: true },
          { id: 'rule', reads: 'it was a rule rather than a claim', holders: ['A. J. Ayer'] },
          { id: 'exempt', reads: 'it holds, if it exempts itself', holders: ['Bertrand Russell'] },
        ],
      },
      explain: 'It is false. No data and no shared premise were needed, only the sentence. Calling it a rule, or writing in an exception, are real replies. Both cost the same thing: a rule excused from its own standard is one nobody else need accept.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Turning It Round',
      points: [
        'A claim about all claims covers itself',
        'Apply it to itself and read the result',
        'Convicting itself makes it false, cheaply',
        'The escape is an exception, and it costs',
      ],
      closing: 'It is the shortest refutation there is, and it needs no ground you have to share first. Try it on the next sweeping claim you meet.',
    },
    dur: 3.2,
  },
];
