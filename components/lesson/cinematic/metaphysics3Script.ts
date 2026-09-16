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
  /** Reality divided in two: the heavy rule draws across and BEING is captioned (0/1). */ divide?: number;
  /** The lower half is captioned BECOMING (0/1). */ becoming?: number;
  /** The cave is labelled THE SENSES, and the sun outside it rises (0/1). */ outside?: number;
  /** The divide is labelled: KNOWLEDGE above it, OPINION below (0/1). */ legend?: number;
}

export const BEATS: Meta3Beat[] = [
  {
    p: 384, shadow: 0.9, form: 0, apple: 1,
    text: 'Plato holds that an apple in your hand is only partly real. It lies between what fully is and what is not.',
    dur: 3.4,
  },
  {
    p: 167, shadow: 0.9, form: 0.15, apple: 1,
    text: 'Heraclitus held that all things flow, like a river you can’t step into twice. Plato accepted this of perceptible things.',
    cite: 'Being and Becoming',
    dur: 1.9,
  },
  {
    // 168 = COUNTING THE POINTS and 459 = EXPLAINING: the other bodies for 167 (N6),
    // since these two beats now change the chart and are no longer one run.
    p: 168, shadow: 0.9, form: 0.15, apple: 1, divide: 1,
    text: 'Knowledge needs an object that doesn’t change, so Plato divided reality in two. Being is unchanging, and it can be known.',
    dur: 3,
  },
  {
    p: 459, shadow: 0.9, form: 0.15, apple: 1, divide: 1, becoming: 1,
    text: 'Becoming is always changing, so it’s grasped only by opinion, through the senses.',
    dur: 1.8,
  },
  {
    p: 34, shadow: 0.5, form: 0.7, apple: 1, divide: 1, becoming: 1,
    text: 'In Plato’s allegory of the cave, prisoners chained since childhood take shadows for reality. One is freed and forced up into daylight, where he sees the things themselves.',
    cite: 'The Republic, Book VII',
    dur: 2.9,
  },
  {
    p: 418, shadow: 0.5, form: 0.7, apple: 1, divide: 1, becoming: 1, outside: 1,
    text: 'Plato holds that the cave is the world of the senses. The things outside it, lit by the sun, stand for the Forms.',
    dur: 2.3,
  },
  {
    p: 147, shadow: 0.3, form: 0.9, apple: 1, divide: 1, becoming: 1, outside: 1,
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
    p: 275, shadow: 0.15, form: 1, apple: 1, divide: 1, becoming: 1, outside: 1,
    text: 'Every physical thing is an imperfect copy of a Form. Equal sticks fall short of the Form of Equal, which is never unequal.',
    cite: 'The theory of Forms',
    dur: 2.9,
  },
  {
    p: 275, shadow: 0.15, form: 1, apple: 1, divide: 1, becoming: 1, outside: 1, legend: 1,
    text: 'So knowledge is possible only of the unchanging Forms. Of changing things, there can be only opinion.',
    dur: 2.3,
  },
  {
    p: 383, shadow: 0.15, form: 1, apple: 1, divide: 1, becoming: 1, outside: 1, legend: 1,
    interact: {
      prompt: 'On Plato’s view that reality requires permanence, which of these is most real?',
      explain:
        'The eternal Form. For Plato, the Forms have the fullest being because they never change. The apple itself seems most real, but it bruises and rots. Its shadow and its painting are images of a copy, and less real still.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, shadow: 0.15, form: 1, apple: 1, divide: 1, becoming: 1, outside: 1, legend: 1,
    interact: {
      prompt: 'What does the theory of Forms imply about the apple’s reality, compared with its Form?',
      split: {
        left: 'THE FORM', right: 'THE APPLE',
        start: 0.5,
        zones: [
          { id: 'apple', upto: 0.34, reads: 'the apple you can hold is fully real' },
          { id: 'even', upto: 0.62, reads: 'equally real, each in its own way' },
          { id: 'form', upto: 1, reads: 'the Form is fully real, the apple only partly', correct: true },
        ],
      },
      explain: 'The Form is fully real, the apple only partly. It seems natural to count the touchable apple as most real, but Plato reverses that ranking. The apple changes and decays, so it has less being than the unchanging Form it copies.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    divide: 1, becoming: 1, outside: 1, legend: 1,
    summary: {
      title: 'Plato’s Being and Becoming',
      points: [
        'Plato divides reality into Being and Becoming',
        'The Forms are eternal, unchanging and knowable',
        'Sensible things are imperfect copies of the Forms',
        'Materialists reply that only matter is real',
      ],
      closing: 'If Plato is right, the world you perceive is less real than the Forms, which only reason can grasp.',
    },
    dur: 2.8,
  },
];
