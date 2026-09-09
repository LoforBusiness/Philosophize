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
    text: 'Your mind came from somewhere. The usual answer is that dead matter got organised enough.',
    dur: 4.8,
  },
  {
    p: 171, x: 26, field: 1, rail: 1, glow: 0.15,
    text: 'Panpsychism answers differently. Mind was there all along, faint, at the bottom of nature.',
    dur: 4.8,
  },
  {
    p: 437, x: 26, field: 1, rail: 1, glow: 0.5,
    text: 'Not that rocks ponder or electrons dream. The simplest bits of matter carry the smallest spark.',
    dur: 5.0,
  },
  {
    p: 260, x: 26, field: 1, rail: 1, glow: 0.9,
    text: 'Physics says what matter does, never what matter is in itself. Panpsychism fills the gap with experience.',
    dur: 5.0,
  },
  {
    p: 163, x: 26, field: 1, rail: 1, glow: 0.9, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what the combination problem asks.',
      explain: 'How many minds make one. Grant every particle a flicker and the question remains. Why do billions of them fuse into a single point of view? Panpsychism trades the hard problem for that one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 453, x: 82, field: 1, rail: 1, glow: 0.9,
    text: 'Leibniz called the simplest things monads, each one shut, each one with a view of its own.',
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
    text: 'An emergentist answers that mind appears only once matter is organised richly enough.',
    dur: 4.8,
  },
  {
    p: 178, x: 82, field: 1, rail: 1,
    interact: {
      prompt: 'Draw what panpsychism says about experience as matter gets organised.',
      plot: {
        cols: ['PARTICLE', 'INSECT', 'MOUSE', 'BRAIN'],
        axis: 'HOW BRIGHT',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'dimmer', profile: [0.14, 0.36, 0.62, 0.94], reads: 'a flicker that was never quite dark', correct: true },
          { id: 'switch', profile: [0.04, 0.06, 0.5, 0.95], reads: 'nothing, and then suddenly a mind' },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'the same faint glow all the way up' },
          { id: 'dark', profile: [0.06, 0.06, 0.06, 0.06], reads: 'no inner glow anywhere to explain' },
        ],
      },
      explain: 'Never quite dark. Panpsychism puts a trace of experience at the bottom, so a brain only turns the dimmer up. A switch would be emergentism, and a flat line would leave a mouse and a person equally awake.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 323, x: 82, field: 1, rail: 1, glow: 0.7,
    summary: {
      title: 'A Spark in Everything',
      points: [
        'Panpsychism makes experience a basic feature of matter',
        'The motive is the hard problem, not mysticism',
        'A brain gathers faint flickers into a rich mind',
        'The combination problem is the standing objection',
      ],
      closing: 'Mind from no-mind and mind everywhere are both strange, and one of the two may be true.',
    },
    dur: 5.0,
  },
];
