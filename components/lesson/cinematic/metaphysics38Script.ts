import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-38, "The Vase and the Clay"
// Theme: TWO LIVES RUNNING ON ONE PIECE OF CLAY, AND ONE OF THEM IS SHORTER.
//
// Three days on three plinths — a lump, a vase, a lump again — and under them
// two bars. THE CLAY runs the whole width. THE VASE runs one column. That pair of
// bars is the entire argument, and it is why this lesson is a picture rather than
// a paragraph: the reader can see two lengths under one object.
//
// The usual telling uses a statue, and a statue cannot be drawn here without
// building a person out of boxes, which the rule book has a budget for and a
// dislike of. A vase is the same argument and is a thing this stage can actually
// draw, so the lesson says so out loud rather than drawing a bad statue.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — the three days, and the reader taps the one where
//     clay and vase share every physical property. It makes them read the diagram,
//     which is the only way the second question can land.
//   · beat 7  a SORT — what the vase is. The two bars are the readout: call it the
//     same thing and its life stretches to match the clay's, call it no thing at
//     all and the bar disappears under the reader's own chip.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics38Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the three plinths and their day names stand. */ days?: number;
  /** 1 = the clay is on them — lump, vase, lump. */ objects?: number;
  /** 1 = the two lifelines are ruled underneath. */ lines?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Metaphysics38Beat[] = [
  {
    p: 164, x: 52, days: 1,
    text: 'Consider one piece of clay on a potter’s bench over three days.',
    dur: 3.6,
  },
  {
    p: 30, x: 52, days: 1, objects: 1,
    text: 'On Monday the clay is a lump, and on Tuesday it’s shaped into a vase. On Wednesday the potter squashes it back into a lump.',
    dur: 4.4,
  },
  {
    p: 47, x: 52, days: 1, objects: 1, lines: 1,
    text: 'So the clay existed for three days, but the vase existed for only one.',
    dur: 3.0,
  },
  {
    p: 160, x: 52, days: 1, objects: 1, lines: 1, live: 1,
    interact: {
      prompt: 'On which day do the clay and the vase share every physical property?',
      explain: 'Tuesday. On that day the clay and the vase have the same size, shape, weight and location. That coincidence creates the puzzle, because they still differ in how long they exist.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 52, days: 1, objects: 1, lines: 1,
    text: 'Yet they still differ in how long they last. Things that differ in any way can’t be one and the same.',
    dur: 4.0,
  },
  {
    p: 383, x: 98, days: 1, objects: 1, lines: 1,
    text: 'Saul Kripke argued that identity is necessary. If two names refer to one thing, they couldn’t have referred to two.',
    dur: 4.2,
  },
  {
    p: 433, x: 98, days: 1, objects: 1, lines: 1,
    quote: {
      id: 'lq-metaphysics-being-38-1',
      text: 'If x and y are the same thing, it could not have been that they were different.',
      author: 'Saul Kripke',
      philosopherId: 'saul-kripke',
      work: 'Naming and Necessity',
      era: '1980',
      branchSlugs: ['metaphysics'],
    },
    dur: 4.2,
  },
  {
    p: 177, x: 98, days: 1, objects: 1, lines: 1,
    interact: {
      prompt: 'Which of these does the vase not share with the clay?',
      odd: {
        axis: 'THREE ARE SHARED',
        tiles: [
          { id: 'weight', reads: 'ITS WEIGHT' },
          { id: 'clay', reads: 'ITS CLAY' },
          { id: 'shape', reads: 'ITS SHAPE' },
          { id: 'day', reads: 'THE DAY IT BEGAN', correct: true },
        ],
      },
      explain: 'The day it began. The clay was there on Monday and the vase wasn\'t, so one of them has a property the other lacks and they can\'t be one thing. The cost of saying so is two objects in one place at once.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Lives, One Lump',
      points: [
        'A thing can be made of stuff without being it',
        'The test is what survives what',
        'Identity cannot start and stop on a date',
        'So one place can hold two histories',
      ],
      closing: 'The same argument runs on a person and a body, a nation and a people, a river and its water. Once you see two lifelines, you see them everywhere.',
    },
    dur: 3.4,
  },
];
