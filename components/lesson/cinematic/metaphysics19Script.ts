import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-19, "What Is a Thing, Really?"
// Theme: FIVE PROPERTIES COMING OFF A PEG, AND AN ARGUMENT ABOUT THE PEG.
//
// Substance and bundle theory is a disagreement about what happens at the END of
// a subtraction, so the scene does the subtraction. Five property cards are
// stacked on a post; they come off one at a time; the reader is left looking at
// whatever is there when the last one goes.
//
// The peg is drawn FAINT from the first beat and never announced. That is the
// honest staging of the dispute: the substance theorist says it was always
// there and the cards were hiding it, the bundle theorist says the picture drew
// a post because a stack needs one. Both readings fit what the reader has
// actually seen, which is why the question can be asked at all.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — three things are on the stage when the cards are
//     off: the peg, the pile of removed cards, and the empty air where the apple
//     was. Every one of them is somebody's real answer (H66).
//   · beat 7  two CARDS — the objection that makes bundle theory hard, which is
//     that two identical things would have to be one thing.
// ─────────────────────────────────────────────────────────────────────────────

export interface Met19Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many property cards are on the peg, 0…1. */ props?: number;
  /** How far the stripping has gone, 0…1. */ strip?: number;
  /** How strongly the peg itself is drawn, 0…1. */ peg?: number;
  /** The second, identical apple beside the first, 0…1. */ twin?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Met19Beat[] = [
  {
    p: 172, x: 200, props: 1, peg: 0.16,
    text: 'Consider an apple and all of its properties. The apple is red, round and sweet, weighs eighty grams, and sits on this table.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, props: 1, peg: 0.16, strip: 0.4,
    text: 'Remove one property, its colour, and something is still there to have the rest.',
    cite: 'Removing properties',
    dur: 2.4,
  },
  {
    p: 266, x: 200, props: 1, peg: 0.16, strip: 0.4,
    text: 'Now remove the shape, the taste, the weight and the location as well.',
    dur: 1.8,
  },
  {
    p: 413, x: 132, props: 1, peg: 0.16, strip: 1,
    text: 'Once every property is gone, either something remains or nothing does. Substance theory and bundle theory give opposite answers.',
    dur: 4.6,
  },
  {
    p: 383, x: 132, props: 1, peg: 0.4, strip: 1,
    text: 'John Locke held that a substance underlies the properties and holds the properties together. Yet Locke admitted that such a substance is unknown.',
    cite: 'Substance',
    dur: 4.8,
  },
  {
    p: 465, x: 132, props: 1, peg: 0.4, strip: 1,
    quote: {
      id: 'lq-metaphysics-being-19-1',
      text: 'A supposed I know not what, to support those ideas we call accidents.',
      author: 'John Locke',
      work: 'An Essay Concerning Human Understanding',
      era: '1689',
      philosopherId: 'john-locke',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.4,
  },
  {
    p: 165, x: 132, props: 1, peg: 0.4, strip: 1, live: 1,
    interact: {
      prompt: 'On Locke’s view, what remains when every property is removed?',
      explain: 'The peg. For Locke, a substance remains, though he could describe it only as the support of the properties. Hume held that the idea of a substance is only a collection of qualities, so nothing remains. The pile holds only the removed properties.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 453, x: 268, props: 1, peg: 0.4, strip: 0, twin: 1,
    text: 'The bundle theory faces a hard case. Suppose a second apple has every property on the first apple’s list.',
    cite: 'Two identical apples',
    dur: 4.6,
  },
  {
    p: 442, x: 268, props: 1, peg: 0.4, twin: 1,
    interact: {
      prompt: 'If two apples share every property, how many things are there?',
      sort: {
        chip: 'the two apples',
        bins: [
          { id: 'one', label: 'one, counted twice', reads: 'one thing, since they share every property' },
          { id: 'two', label: 'two, identical', reads: 'two things, with nothing telling them apart', correct: true },
          { id: 'never', label: 'impossible', reads: 'two such things could never exist' },
        ],
      },
      explain: 'Two things, with nothing telling them apart. Max Black argued that two exactly similar spheres are possible. If a thing is only its properties, the twins would be one thing. So the bundle theory must deny that the case is possible.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Substance and Bundle Theories',
      points: [
        'Bundle theory says a thing is its properties and nothing else',
        'Substance theory posits a bearer that holds the properties together',
        'Locke admitted that this bearer is unknown',
        'Two identical things are the hard case for the bundle view',
      ],
      closing: 'Leibniz’s identity of indiscernibles holds that no two distinct things share every property.',
    },
    dur: 3.4,
  },
];
