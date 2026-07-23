import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-3, "What Counts as Real?" — Plato's Cave & the Forms.
// A prisoner faces a wall of flickering shadows (Becoming). Overhead hangs a perfect,
// steady Form (Being) — and beside the figure a real apple wobbles and decays,
// a deficient copy. The figure shields its eyes from the light, then reaches up for
// the Form. Shadows on the wall, Form overhead, apple to the side — three clean bands.
//
// Graded questions are the two from data/.../what-counts-as-real.ts.
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
    text: 'Heraclitus said everything flows — a river you cannot step in twice. Plato wanted an object of real knowledge, so he split reality: stable Being you can know, restless Becoming you can only guess.',
    cite: 'Being vs Becoming',
    dur: 5.2,
  },
  {
    p: 34, shadow: 0.5, form: 0.7, apple: 1,
    text: 'Prisoners chained since birth take flickering shadows for reality. One breaks free, climbs into daylight, and sees real things. Our world is the wall; the truly real lies upstream, in eternal Forms.',
    cite: 'The Republic, Book VII',
    dur: 5.2,
  },
  {
    p: 4, shadow: 0.3, form: 0.9, apple: 1,
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
    text: 'Each physical thing is a deficient copy that "participates in" a perfect Form. Equal sticks always fall short of Equality itself. Because Forms never change, they can be known; changing things can only be believed.',
    cite: 'The theory of Forms',
    dur: 5.2,
  },
  {
    p: 6, shadow: 0.15, form: 1, apple: 1,
    mc: {
      prompt: 'According to Plato, which of these is MOST fully real?',
      options: [
        { id: 'a', text: 'A particular apple you can hold in your hand', correct: false },
        { id: 'b', text: 'The eternal, unchanging Form the apple imitates', correct: true },
        { id: 'c', text: 'The shade of red the apple happens to wear', correct: false },
        { id: 'd', text: 'A painting of the apple', correct: false },
      ],
      explain:
        'For Plato the Forms enjoy the fullest being because they never change. A real apple bruises and rots; the Form it imitates never flinches.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, shadow: 0.15, form: 1, apple: 1,
    mc: {
      prompt: 'You can see and touch an apple but never a Form. So which does Plato call more real?',
      options: [
        { id: 'a', text: 'The apple — what we sense directly must be most real', correct: false },
        { id: 'b', text: 'The apple, since Forms are just ideas in our heads', correct: false },
        { id: 'c', text: 'The Form — being knowable and unchanging beats being visible', correct: true },
        { id: 'd', text: 'Neither — Plato thought reality is unknowable', correct: false },
      ],
      explain:
        'It feels backwards: Plato ranks the invisible Form above the touchable apple. Sensible things change and decay, so for him they have less being than the eternal Forms.',
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
