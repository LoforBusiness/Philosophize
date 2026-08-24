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
    p: 25, x: 200, props: 1, peg: 0.16,
    text: 'An apple, written out as everything true of it. Red, round, sweet, eighty grams, on this table.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, props: 1, peg: 0.16, strip: 0.4,
    text: 'Take the colour away. It is still an apple. Take the roundness, take the weight.',
    cite: 'Keep going',
    dur: 4.0,
  },
  {
    p: 45, x: 132, props: 1, peg: 0.16, strip: 1,
    text: 'That was the last one. Something is either standing there or it is not, and philosophers have never agreed which.',
    dur: 4.6,
  },
  {
    p: 13, x: 132, props: 1, peg: 0.4, strip: 1,
    text: 'Locke thought there had to be something underneath holding the properties together. He also admitted he could say nothing at all about it.',
    cite: 'Substance',
    dur: 4.8,
  },
  {
    p: 137, x: 132, props: 1, peg: 0.4, strip: 1,
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
    p: 4, x: 132, props: 1, peg: 0.4, strip: 1, live: 1,
    interact: {
      prompt: 'Tap what is left after every card has come off.',
      explain: 'The peg, if you are Locke, and it was never described because nothing can be said about a thing with no properties. Hume looked at the same picture and said the stack was all there was. The pile is the cards you removed, not the apple.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 268, props: 1, peg: 0.4, strip: 0, twin: 1,
    text: 'Here is the cost of saying there is no peg. A second apple, matching the first in every property there is.',
    cite: 'The twin',
    dur: 4.6,
  },
  {
    p: 41, x: 268, props: 1, peg: 0.4, twin: 1,
    interact: {
      prompt: 'Two things share every property. Are they one thing or two?',
      cards: [
        { text: 'Two, and bundles cannot say so', correct: true },
        { text: 'One, since nothing differs', correct: false },
      ],
      explain: 'Plainly two, and that is the bill bundle theory has to pay. If a thing just is its properties, two things with all the same properties are the same thing. Saying they are two means something beyond the properties is doing the distinguishing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Peg and the Pile',
      points: [
        'Bundle theory says a thing is its properties and nothing else',
        'Substance theory says something bare holds them together',
        'That something cannot be described, because describing is a property',
        'Two identical things are the hard case for the bundle view',
      ],
      closing: 'Take away everything true of the apple and you are looking at the whole dispute.',
    },
    dur: 3.4,
  },
];
