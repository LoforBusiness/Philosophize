import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-27, "Why Art Keeps Breaking Its Own Rules"
// Theme: FOUR WORKS ON A WALL, AND HOW MUCH SHOCK IS LEFT IN EACH.
//
// The claim is about a quantity that FALLS OVER TIME, so the scene puts the works
// in date order and gives the shock a bar of its own. What the reader draws is
// the shape of that fall, and the bar reports back the average of it.
//
// The four frames are drawn identically and stay identical. The lesson is not
// that the works changed; it is that the audience did, and a wall where the older
// pieces looked tamer would be putting the change in the wrong place.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what the
//     rule-breaking is FOR. On the stage because four broken rules are hanging
//     there in a row, and the answer is what they have in common.
//   · beat 8  a PLOT — the shock across four generations. The bar above the wall
//     carries the average of the curve, so a shape that never falls leaves the
//     whole wall as startling as the day it opened.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics27Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many of the four works hang on the wall, 0…1. */ wall?: number;
  /** 1 = the gauge above the wall is drawn. */ meter?: number;
  /** The average shock across the four works, 0…1. */ shock?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aesthetics27Beat[] = [
  {
    p: 423, x: 28, wall: 0.3,
    text: 'Over the twentieth century, some composers replaced melody with noise. One piece asked a pianist to play no notes at all.',
    dur: 4.8,
  },
  {
    p: 172, x: 28, wall: 0.6,
    text: 'Such artists are called the avant-garde. The term is military and originally meant the advance guard of an army.',
    dur: 5.0,
  },
  {
    p: 435, x: 28, wall: 1,
    text: 'Cubism gave up single-point perspective, and atonal music gave up the key. Dada sound poetry gave up words that meant anything.',
    dur: 5.0,
  },
  {
    p: 257, x: 28, wall: 1, meter: 1, shock: 0.85,
    text: 'These artists held that habit dulls perception. You stop noticing what you see every day.',
    dur: 5.0,
  },
  {
    p: 161, x: 28, wall: 1, meter: 1, shock: 0.85, plates: 1, live: 1,
    interact: {
      prompt: 'What is the avant-garde’s purpose in breaking artistic conventions?',
      explain: 'To wake you up. Viktor Shklovsky called this defamiliarisation: making familiar things strange so that they’re perceived afresh. Shock is the method, not the aim. A market grew around such work later, but selling wasn’t the purpose.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 442, x: 88, wall: 1, meter: 1, shock: 0.85,
    text: 'At its premiere in 1952, John Cage’s piece had a pianist play no notes for four minutes and thirty-three seconds. The sounds in the hall became the music.',
    dur: 5.0,
  },
  {
    p: 430, x: 88, wall: 1, meter: 1, shock: 0.85,
    quote: {
      id: 'lq-aesthetics-aesthetics-27-1',
      text: 'Art exists that one may recover the sensation of life... to make the stone stony.',
      author: 'Viktor Shklovsky',
      work: 'Art as Technique',
      era: '1917',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.8,
  },
  {
    p: 445, x: 88, wall: 1, meter: 1, shock: 0.85,
    text: 'Critics in 1874 mocked Impressionist paintings as unfinished sketches. Today they’re among the most widely reproduced paintings.',
    dur: 5.0,
  },
  {
    p: 177, x: 88, wall: 1, meter: 1,
    interact: {
      prompt: 'Which curve shows what happens to the shock of a broken rule over time?',
      plot: {
        cols: ['1900', '1920', '1950', 'TODAY'],
        axis: 'SHOCK LEFT',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'decay', profile: [0.9, 0.62, 0.36, 0.12], reads: 'the shock fades and becomes convention', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'a broken rule stays startling for ever' },
          { id: 'rise', profile: [0.12, 0.36, 0.62, 0.9], reads: 'later audiences find it more shocking' },
          { id: 'spike', profile: [0.1, 0.92, 0.14, 0.1], reads: 'a single scandal, then indifference' },
        ],
      },
      explain: 'The shock fades and becomes convention. Once a broken rule is accepted, the next generation must break a new one. A flat line would mean Impressionism still shocked people. Yet its once-mocked paintings are now among the most widely reproduced.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 322, x: 88, wall: 1, meter: 1, shock: 0.2,
    summary: {
      title: 'The Advance Guard',
      points: [
        'The avant-garde breaks a convention on purpose',
        'The aim is to make a familiar thing visible again',
        'Cage asked where music stops and sound begins',
        'Each broken rule becomes a convention to break',
      ],
      closing: 'The avant-garde breaks conventions so that an audience dulled by habit perceives familiar things afresh.',
    },
    dur: 5.0,
  },
];
