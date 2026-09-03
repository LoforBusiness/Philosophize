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
    p: 25, x: 56, boxes: 1,
    text: 'A village with one barber and one rule. He shaves every man who does not shave himself, and nobody else.',
    dur: 4.0,
  },
  {
    p: 2, x: 56, boxes: 1, sorted: 1,
    text: 'It sorts the whole village without an argument. Shave yourself and he leaves you alone.',
    dur: 3,
  },
  {
    p: 2, x: 56, boxes: 1, sorted: 1,
    text: 'Do not, and he shaves you.',
    dur: 1.8,
  },
  {
    p: 4, x: 56, boxes: 1, sorted: 1, barber: 1, live: 1,
    interact: {
      prompt: 'Now put the barber in a box.',
      explain: 'Neither box takes him, and there is no third. Put him left and he shaves himself, so his rule forbids it. Put him right and he does not, so his rule requires it. The description is grammatical and there is no such man.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 56, boxes: 1, sorted: 1, barber: 1,
    text: 'That is the whole result, and the result bites harder than you would think. A sentence can be built perfectly and still describe nothing that could exist.',
    dur: 4.6,
  },
  {
    p: 13, x: 56, boxes: 1, sorted: 1, barber: 1, sets: 1,
    text: 'Russell found the real one in 1901. Take the collection of all collections that do not contain themselves.',
    dur: 3.8,
  },
  {
    p: 13, x: 56, boxes: 1, sorted: 1, barber: 1, sets: 1,
    text: 'Ask whether it contains itself.',
    dur: 1.8,
  },
  {
    p: 47, x: 56, boxes: 1, barber: 1, sets: 1,
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
      prompt: 'Set the lever to why nobody could shrug at the set.',
      lever: {
        start: 0,
        stops: [
          { id: 'hard', reads: 'sets are simply harder to think about than barbers' },
          { id: 'words', reads: 'just a trick of language' },
          { id: 'axioms', reads: 'the rules said this set must exist', correct: true },
        ],
      },
      explain: 'The far setting. With the barber you say there is no such man and walk away. The axioms of the day said any condition you can state determines a set, so this one was a legal object — and it was sitting inside the foundation of arithmetic.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 379, x: 128, boxes: 1, sets: 1,
    text: 'Frege had a volume at the printer. He added an appendix saying the ground had gone, and published it anyway.',
    dur: 4.4,
  },
  {
    summary: {
      title: 'When a Description Describes Nothing',
      points: [
        'The rule leaves the barber no box',
        'So no such barber can exist',
        'Well formed is not the same as possible',
        'The set version made that move legal, and cost a foundation',
      ],
      closing: 'Modern set theory is mostly machinery for stopping you writing that sentence. Every axiom is a door held shut against a barber.',
    },
    dur: 3.2,
  },
];
