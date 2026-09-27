import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-3, "What Counts as Real?" — Plato's grades of being.
// Theme: A CELLAR STUDIO: AN APPLE, ITS SHADOW, ITS PAINTING, AND A DOOR TO THE DAY.
//
// He holds an apple in a cellar studio. An hourglass runs (all things flow); two
// plaques name BEING and BECOMING; the apple bruises. For the cave he sits on a stool
// watching the apple's shadow on the wall, then climbs the cellar stairs and opens
// the door onto daylight, where the Form of the apple stands in the sun. Two sticks
// that should be equal are set side by side, and one is a hair longer.
//
// Redrawn 2026-09-26, the third lesson of the branch in reading order. Every line,
// citation, quotation and summary point is copied from the previous script by a
// generator, word for word and beat for beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Meta3Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 196 at the table · 62 on the landing at the top of the stairs. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'apple' | 'flow' | 'being' | 'becoming' | 'cave' | 'sun' | 'sticks' | 'opinion';
  /** The plaques are lit: 1 BEING · 2 and BECOMING. */ plaques?: number;
  /** How far the apple has aged: 0 fresh · 1 bruised · 2 wrinkled. */ age?: number;
  /** The lantern throws the apple's shadow on the wall. */ shadow?: boolean;
  /** The cellar door at the top of the stairs is open onto the day. */ open?: boolean;
  /** The two sticks and the ruler are on the table. */ sticks?: boolean;
  /** Q1 on the stage: the four things, labelled. */ grades?: boolean;
}

export const BEATS: Meta3Beat[] = [
  {
    p: 158, x: 196, act: 'apple',
    text: 'Plato holds that an apple in your hand is only partly real. It lies between what fully is and what is not.',
    dur: 3.4,
  },
  {
    p: 158, x: 196, act: 'flow',
    text: 'Heraclitus held that all things flow, like a river you can’t step into twice. Plato accepted this of perceptible things.',
    cite: 'Being and Becoming',
    dur: 1.9,
  },
  {
    p: 167, x: 196, act: 'being', plaques: 1,
    text: 'Knowledge needs an object that doesn’t change, so Plato divided reality in two. Being is unchanging, and it can be known.',
    dur: 3,
  },
  {
    p: 158, x: 196, act: 'becoming', plaques: 2, age: 1,
    text: 'Becoming is always changing, so it’s grasped only by opinion, through the senses.',
    dur: 1.8,
  },
  {
    p: 158, x: 62, act: 'cave', plaques: 2, age: 1, shadow: true, open: true,
    text: 'In Plato’s allegory of the cave, prisoners chained since childhood take shadows for reality. One is freed and forced up into daylight, where he sees the things themselves.',
    cite: 'The Republic, Book VII',
    dur: 2.9,
  },
  {
    p: 158, x: 62, act: 'sun', plaques: 2, age: 1, shadow: true, open: true,
    text: 'Plato holds that the cave is the world of the senses. The things outside it, lit by the sun, stand for the Forms.',
    dur: 2.3,
  },
  {
    p: 263, x: 62, plaques: 2, age: 1, shadow: true, open: true,
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
    p: 158, x: 196, act: 'sticks', plaques: 2, age: 1, shadow: true, open: true, sticks: true,
    text: 'Every physical thing is an imperfect copy of a Form. Equal sticks fall short of the Form of Equal, which is never unequal.',
    cite: 'The theory of Forms',
    dur: 2.9,
  },
  {
    p: 158, x: 196, act: 'opinion', plaques: 2, age: 2, shadow: true, open: true, sticks: true,
    text: 'So knowledge is possible only of the unchanging Forms. Of changing things, there can be only opinion.',
    dur: 2.3,
  },
  {
    p: 260, x: 196, plaques: 2, age: 2, shadow: true, open: true, sticks: true, grades: true,
    interact: {
      prompt: 'On Plato’s view that reality requires permanence, which of these is most real?',
      explain: 'The eternal Form. For Plato, the Forms have the fullest being because they never change. The apple itself seems most real, but it bruises and rots. Its shadow and its painting are images of a copy, and less real still.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 196, plaques: 2, age: 2, shadow: true, open: true, sticks: true,
    interact: {
      prompt: 'Which of these is not a copy of something else?',
      odd: {
        axis: 'THREE ARE COPIES',
        tiles: [
          { id: 'apple', reads: 'THE APPLE' },
          { id: 'shadow', reads: 'ITS SHADOW' },
          { id: 'picture', reads: 'A PAINTING' },
          { id: 'form', reads: 'THE FORM ITSELF', correct: true },
        ],
      },
      explain: 'The Form itself. The apple, its shadow and the painting each depend on something further back, and the Form depends on nothing. That\'s what a grade of reality means here: not that the apple is an illusion, but that it borrows.',
      xp: 5,
    },
    dur: 1,
  },
  {
    plaques: 2, age: 2, shadow: true, open: true, sticks: true,
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
