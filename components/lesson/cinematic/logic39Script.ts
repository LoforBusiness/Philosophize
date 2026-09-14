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
    text: 'Most claims can be refuted only with outside evidence. A few can be refuted by applying them to themselves.',
    dur: 4.0,
  },
  {
    p: 47, x: 58, planks: 1,
    text: 'Consider three claims, each on its own plank. The test is whether each claim meets the standard it sets.',
    dur: 3.6,
  },
  {
    p: 165, x: 58, planks: 1, live: 1,
    interact: {
      prompt: 'Which of the three claims fails the standard it sets?',
      explain: 'The claim that nothing can be proved. Only this claim is about all claims, so only it falls within its own scope. “Every event has a cause” is about events. “Some claims are false” can include itself without contradiction.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 379, x: 58, planks: 1, saw: 1,
    text: 'The claim “nothing can be proved” is itself a claim, so it falls within its own scope. The claim must therefore meet its own demand for proof.',
    dur: 3.8,
  },
  {
    p: 384, x: 58, planks: 1, saw: 1, snap: 1,
    text: 'If the claim is proved, then something can be proved, so the claim is false. If it isn’t proved, it has no support.',
    dur: 4.0,
  },
  {
    p: 168, x: 106, planks: 1, saw: 1, snap: 1,
    text: 'Either way, the claim can’t be defended, and no outside evidence was needed. Such a claim is called self-refuting.',
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
      prompt: 'What follows when a claim fails the standard it sets for all claims?',
      poll: {
        options: [
          { id: 'false', reads: 'it refutes itself, with no outside evidence needed', holders: ['Plato', 'Aristotle'], correct: true },
          { id: 'rule', reads: 'it was a definition, not a claim', holders: ['A.J. Ayer'] },
          { id: 'exempt', reads: 'it holds, provided it excludes itself', holders: ['Bertrand Russell'] },
        ],
      },
      explain: 'The claim refutes itself, with no outside evidence needed. Its own standard is enough to defeat it. Exempting the claim avoids refutation, but only if the exemption can be justified rather than declared.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Self-Refuting Claims',
      points: [
        'A claim about all claims falls within its own scope',
        'Test such a claim by applying it to itself',
        'A self-refuting claim fails without outside evidence',
        'Exempting the claim needs a justification, not a declaration',
      ],
      closing: 'Self-refutation needs no shared premises, only the claim itself. Apply the test to any claim about all claims.',
    },
    dur: 3.2,
  },
];
