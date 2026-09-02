import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-3, "What Counts as Real?" — Plato's Cave & the Forms.
// Stage right stands Plato's ladder of reality drawn as a labelled three-tier chart,
// split by one heavy rule: BEING above (the Forms — steady, knowable), BECOMING below
// (the apple you can hold, which wobbles; the shadows on the wall, which flicker).
// Stage left is the literal cave wall the prisoner has been staring at. The figure
// keeps the middle, so nothing ever overlaps it.
//
// Q1 is answered IN THE SCENE — the tiers give way to four cards and the reader taps
// the most real thing. Graded questions are the two from data/.../what-counts-as-real.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Meta3Beat extends BaseBeat {
  /** Prisoner gesture. */ p?: number;
  /** Shadows on the wall 0..1. */ shadow?: number;
  /** The Form's brightness overhead 0..1. */ form?: number;
  /** The wobbling apple present 0..1. */ apple?: number;
}

export const BEATS: Meta3Beat[] = [
  {
    p: 20, shadow: 0.9, form: 0, apple: 1,
    text: 'Plato said the apple in your hand is only half-real. Not unreal — stuck between being and not-being.',
    dur: 3.4,
  },
  {
    p: 1, shadow: 0.9, form: 0.15, apple: 1,
    text: 'Heraclitus said everything flows, like a river you cannot step in twice. That troubled Plato.',
    cite: 'Being vs Becoming',
    dur: 1.9,
  },
  {
    p: 1, shadow: 0.9, form: 0.15, apple: 1,
    text: 'You cannot know a thing that will not hold still, so he split the world in two. Being holds still and can be known.',
    dur: 3,
  },
  {
    p: 1, shadow: 0.9, form: 0.15, apple: 1,
    text: 'Becoming never does.',
    dur: 1.8,
  },
  {
    p: 34, shadow: 0.5, form: 0.7, apple: 1,
    text: 'Prisoners chained since birth take flickering shadows for the real world. One gets free, climbs into daylight, and sees the things themselves.',
    cite: 'The Republic, Book VII',
    dur: 2.9,
  },
  {
    p: 34, shadow: 0.5, form: 0.7, apple: 1,
    text: 'Plato says the wall is where we live, and the Forms are what is casting the shadows.',
    dur: 2.3,
  },
  {
    p: 147, shadow: 0.3, form: 0.9, apple: 1,
    quote: {
      id: 'lq-metaphysics-being-3-1',
      text: 'The soul is most like the divine, deathless, intelligible, uniform, indissoluble, always the same as itself.',
      author: 'Plato',
      philosopherId: 'plato',
      work: 'Phaedo, 80a',
      era: 'c. 380 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 24, shadow: 0.15, form: 1, apple: 1,
    text: 'Everything you can touch is a rough copy of something perfect. Two sticks are never exactly equal. The idea of Equality always is.',
    cite: 'The theory of Forms',
    dur: 2.9,
  },
  {
    p: 24, shadow: 0.15, form: 1, apple: 1,
    text: 'And you can know the thing that never changes, where the copy is only ever a good guess.',
    dur: 2.3,
  },
  {
    p: 6, shadow: 0.15, form: 1, apple: 1,
    interact: {
      prompt: 'Plato ranks these against each other. Tap whichever one he calls most real.',
      explain:
        'For Plato the Forms enjoy the fullest being because they never change. The apple bruises and rots; its shadow and its portrait are fainter still — images of a copy.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, shadow: 0.15, form: 1, apple: 1,
    interact: {
      prompt: 'Slide the seam to where Plato puts the reality.',
      split: {
        left: 'THE FORM', right: 'THE APPLE',
        start: 0.5,
        zones: [
          { id: 'apple', upto: 0.34, reads: 'the thing you can hold is the real one' },
          { id: 'even', upto: 0.62, reads: 'equally real, each in its own way' },
          { id: 'form', upto: 1, reads: 'the Form is real, the apple borrows', correct: true },
        ],
      },
      explain: 'Nearly all of it goes to the Form, and that is what feels backwards. Plato ranks the invisible above the touchable. Apples bruise and rot and stop being apples, so for him they hold less being than the one thing that never changes.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Reality May Go Deeper Than It Looks',
      points: [
        'Plato split reality: Being and Becoming',
        'Forms are eternal, unchanging, knowable',
        'Physical things are deficient copies',
        'Materialism counters: only matter is real',
      ],
      closing: 'If the most real things are the ones you can never touch, what does that make the world you see?',
    },
    dur: 2.8,
  },
];
