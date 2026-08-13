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
    text: 'Heraclitus said everything flows, like a river you cannot step in twice. That troubled Plato. You cannot know a thing that will not hold still, so he split the world in two. Being holds still and can be known. Becoming never does.',
    cite: 'Being vs Becoming',
    dur: 5.2,
  },
  {
    p: 34, shadow: 0.5, form: 0.7, apple: 1,
    text: 'Prisoners chained since birth take flickering shadows for the real world. One gets free, climbs into daylight, and sees the things themselves. Plato says the wall is where we live, and the Forms are what is casting the shadows.',
    cite: 'The Republic, Book VII',
    dur: 5.2,
  },
  {
    p: 147, shadow: 0.3, form: 0.9, apple: 1,
    quote: {
      id: 'lq-metaphysics-being-3-1',
      text: 'The soul is most like the divine, deathless, intelligible, uniform, indissoluble, always the same as itself.',
      author: 'Plato',
      work: 'Phaedo, 80a',
      era: 'c. 380 BCE',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 24, shadow: 0.15, form: 1, apple: 1,
    text: 'Everything you can touch is a rough copy of something perfect. Two sticks are never exactly equal; the idea of Equality always is. And you can know the thing that never changes, where the copy is only ever a good guess.',
    cite: 'The theory of Forms',
    dur: 5.2,
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
      prompt: 'You can see and touch an apple but never a Form. So which does Plato call more real?',
      cards: [
        { text: 'The Form, knowable and unchanging', correct: true },
        { text: 'The apple, we sense it', correct: false },
      ],
      explain: 'It feels backwards: Plato ranks the invisible Form above the touchable apple. Sensible things change and decay, so for him they have less being than the eternal Forms.',
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
