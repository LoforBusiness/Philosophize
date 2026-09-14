import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-37, "The Barber Who Cannot Exist"
// Theme: TWO BOXES, EVERY MAN IN THE VILLAGE SORTED, AND ONE LEFT OVER.
//
// The village is drawn as a sorting. SHAVES HIMSELF on the left, SHAVED BY THE
// BARBER on the right, and eight men drop into one box or the other. The rule
// works perfectly for all eight, which is what makes the ninth so bad.
//
// Then the barber's own token is put on the stage and it will not settle. It is
// animated as a token that moves toward one box, is pushed back, moves toward the
// other, is pushed back — forever, on the wall clock, so it is still oscillating
// while the reader reads about it. Nothing resolves because nothing can.
//
// GAMIFIED SHAPE:
//   · beat 3  a SCENE TARGET — the reader is asked to put the barber in a box.
//     BOTH boxes are tappable and NEITHER is correct; the explanation is the
//     point. It is the only question in the eighteen new lessons with no right
//     answer, and it is the one place where that is the honest design.
//   · beat 7  two CARDS — why the set version was so much worse.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic37Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two boxes are drawn. */ boxes?: number;
  /** How many of the eight villagers have been sorted, 0…1. */ sorted?: number;
  /** 1 = the barber's own token is on the stage, refusing to settle. */ barber?: number;
  /** 1 = the set version is drawn beneath. */ sets?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic37Beat[] = [
  {
    p: 462, x: 56, boxes: 1,
    text: 'Suppose a village has one barber, who follows one rule. He shaves all and only the men of the village who don’t shave themselves.',
    dur: 4.0,
  },
  {
    p: 2, x: 56, boxes: 1, sorted: 1,
    text: 'For every other man, the rule gives a clear verdict. A man who shaves himself isn’t shaved by the barber.',
    dur: 3,
  },
  {
    p: 2, x: 56, boxes: 1, sorted: 1,
    text: 'A man who doesn’t shave himself is shaved by the barber.',
    dur: 1.8,
  },
  {
    p: 4, x: 56, boxes: 1, sorted: 1, barber: 1, live: 1,
    interact: {
      prompt: 'Which box does the barber belong in?',
      explain: 'Neither box can hold the barber. If he shaves himself, his rule says he must not. If he doesn’t, his rule says he must. So the description is grammatical, but no such barber can exist.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 56, boxes: 1, sorted: 1, barber: 1,
    text: 'The barber shaves himself if and only if he doesn’t, which is a contradiction. A description can be well formed and still describe nothing that could exist.',
    dur: 4.6,
  },
  {
    p: 13, x: 56, boxes: 1, sorted: 1, barber: 1, sets: 1,
    text: 'In 1901, Bertrand Russell found a contradiction of the same form in the theory of sets. Consider the set of all sets that do not contain themselves.',
    dur: 3.8,
  },
  {
    p: 13, x: 56, boxes: 1, sorted: 1, barber: 1, sets: 1,
    text: 'If the set contains itself, it violates its own condition for membership. If the set doesn’t contain itself, it meets the condition and must be included.',
    dur: 1.8,
  },
  {
    p: 433, x: 56, boxes: 1, barber: 1, sets: 1,
    quote: {
      id: 'lq-logic-arguments-37-1',
      text: 'Arithmetic totters.',
      author: 'Gottlob Frege',
      philosopherId: 'gottlob-frege',
      work: 'letter to Russell',
      era: '1902',
      branchSlugs: ['logic'],
    },
    dur: 3.4,
  },
  {
    p: 35, x: 128, boxes: 1, barber: 1, sets: 1,
    interact: {
      prompt: 'Why was Russell’s paradox more damaging than the barber paradox?',
      sort: {
        chip: 'Russell’s paradox',
        bins: [
          { id: 'hard', label: 'harder to picture', reads: 'sets are harder to think about than barbers' },
          { id: 'words', label: 'merely verbal', reads: 'a confusion in language, not in logic' },
          { id: 'axioms', label: 'axioms guaranteed it', reads: 'Frege’s axioms guaranteed that this set exists', correct: true },
        ],
      },
      explain: 'Axioms guaranteed it. The barber case shows only that no such barber exists. But Frege’s axioms said that any condition you can state defines a set. So his axioms required a set that can’t exist, at the base of arithmetic.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 379, x: 128, boxes: 1, sets: 1,
    text: 'In 1902, the second volume of Frege’s Basic Laws of Arithmetic was in press. Frege added an appendix acknowledging the contradiction, and the volume appeared in 1903.',
    dur: 4.4,
  },
  {
    summary: {
      title: 'When a Description Describes Nothing',
      points: [
        'Applied to himself, the barber’s rule contradicts itself',
        'So no such barber can exist',
        'A well-formed description may describe something impossible',
        'Russell’s paradox followed from the axioms of Frege’s system',
      ],
      closing: 'Modern set theories limit which conditions define a set, so Russell’s set can’t exist.',
    },
    dur: 3.2,
  },
];
