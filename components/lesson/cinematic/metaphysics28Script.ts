import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-28, "Is Mind Everywhere?"
// Theme: FOUR THINGS ON ONE RAIL, AND A LIGHT INSIDE EVERY ONE.
//
// Panpsychism is a claim about a DIMMER rather than a switch, so the stage puts
// four things in order of how organised they are and gives each of them a lamp
// in its middle. Nothing on the rail ever goes fully dark, which is the whole
// disagreement drawn rather than stated.
//
// The bodies never change size or shape. What changes is how much light is in
// them, because the argument is not about what the things are — everyone agrees
// about the particle and the brain — but about what is going on inside.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what the
//     combination problem asks. On the stage because four separately lit things
//     are standing in a row, and the question is how they add up to one.
//   · beat 8  a PLOT — the light along the rail. The reader draws it, and every
//     lamp on the rail answers, so a curve that starts at nothing turns the
//     bottom of the ladder off and makes the drawing say emergentism instead.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics28Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the dark field behind the rail is drawn. */ field?: number;
  /** 1 = the rail and its four names are drawn. */ rail?: number;
  /** How much light is in the things on the rail, 0…1. */ glow?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Metaphysics28Beat[] = [
  {
    p: 424, x: 26, field: 1,
    text: 'Where does consciousness come from? The usual answer is that matter becomes conscious once it’s organised enough.',
    dur: 4.8,
  },
  {
    p: 171, x: 26, field: 1, rail: 1, glow: 0.15,
    text: 'Panpsychism disagrees. It holds that some simple form of experience exists at the most basic level of nature.',
    dur: 4.8,
  },
  {
    p: 437, x: 26, field: 1, rail: 1, glow: 0.5,
    text: 'Panpsychists don’t claim that rocks think. They claim that fundamental particles have the simplest form of experience.',
    dur: 5.0,
  },
  {
    p: 260, x: 26, field: 1, rail: 1, glow: 0.9,
    text: 'Physics describes what matter does, not what matter is in itself. Panpsychists propose that its intrinsic nature is experience.',
    dur: 5.0,
  },
  {
    p: 163, x: 26, field: 1, rail: 1, glow: 0.9, plates: 1, live: 1,
    interact: {
      prompt: 'What question does the combination problem raise for panpsychism?',
      explain: 'How many minds make one. Suppose every particle has experience. How do billions of tiny minds join to form one mind? William James raised this problem in 1890.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 453, x: 82, field: 1, rail: 1, glow: 0.9,
    text: 'Leibniz called the simplest substances monads. Each has its own perceptions and is closed to outside influence.',
    dur: 5.0,
  },
  {
    p: 432, x: 82, field: 1, rail: 1, glow: 0.9,
    quote: {
      id: 'lq-metaphysics-being-28-1',
      text: 'The monads have no windows through which anything could come in or go out.',
      author: 'Gottfried Leibniz',
      work: 'The Monadology',
      era: '1714',
      philosopherId: 'gottfried-leibniz',
      branchSlugs: ['metaphysics'],
    },
    dur: 4.8,
  },
  {
    p: 449, x: 82, field: 1, rail: 1, glow: 0.9,
    text: 'Emergentism answers instead that experience appears only once matter reaches a certain level of organisation.',
    dur: 4.8,
  },
  {
    p: 178, x: 82, field: 1, rail: 1,
    interact: {
      prompt: 'Which curve shows what panpsychism says about experience as organisation increases?',
      plot: {
        cols: ['PARTICLE', 'INSECT', 'MOUSE', 'BRAIN'],
        axis: 'HOW MUCH EXPERIENCE',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'dimmer', profile: [0.14, 0.36, 0.62, 0.94], reads: 'some experience at every level, rising', correct: true },
          { id: 'switch', profile: [0.04, 0.06, 0.5, 0.95], reads: 'none until a threshold, then a sharp rise' },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'the same amount at every level' },
          { id: 'dark', profile: [0.06, 0.06, 0.06, 0.06], reads: 'almost none at any level' },
        ],
      },
      explain: 'Some experience at every level, rising. On this view even a particle has a trace of experience, and brains have much more. A sudden jump from none would be emergentism.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 323, x: 82, field: 1, rail: 1, glow: 0.7,
    summary: {
      title: 'Mind at the Base of Nature',
      points: [
        'Panpsychism makes experience a basic feature of matter',
        'Its motive is the hard problem of consciousness',
        'On panpsychism, brains combine simple experiences into rich ones',
        'The combination problem is its main objection',
      ],
      closing: 'Experience arising from non-experiential matter and experience everywhere are both surprising claims. Panpsychists argue the second is less mysterious.',
    },
    dur: 5.0,
  },
];
