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
    text: 'First a melody, then a noise. Then four minutes of a pianist playing nothing.',
    dur: 4.8,
  },
  {
    p: 172, x: 28, wall: 0.6,
    text: 'Avant-garde is a military word. It named the guard sent first into open country.',
    dur: 5.0,
  },
  {
    p: 435, x: 28, wall: 1,
    text: 'Cubism broke perspective. Atonal music dropped the key, and poetry dropped the sentence.',
    dur: 5.0,
  },
  {
    p: 257, x: 28, wall: 1, meter: 1, shock: 0.85,
    text: 'The gamble is that habit dulls a person. You stop seeing what you have seen a thousand times.',
    dur: 5.0,
  },
  {
    p: 161, x: 28, wall: 1, meter: 1, shock: 0.85, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what the rule-breaking is for.',
      explain: 'To wake you up. Shklovsky called it making the stone stony — breaking a form so the thing inside it is noticed again. Shock is the method rather than the aim. A market grew round the work afterwards, which is not why anybody made it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 442, x: 88, wall: 1, meter: 1, shock: 0.85,
    text: 'John Cage sat at a piano in 1952 and played nothing for four minutes and thirty-three seconds.',
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
    text: 'Impressionism was mocked as unfinished smears. It now sells more postcards than anything.',
    dur: 5.0,
  },
  {
    p: 177, x: 88, wall: 1, meter: 1,
    interact: {
      prompt: 'Draw what happens to the shock over time.',
      plot: {
        cols: ['1900', '1920', '1950', 'TODAY'],
        axis: 'SHOCK LEFT',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'decay', profile: [0.9, 0.62, 0.36, 0.12], reads: 'the shock wears off and turns into taste', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'a broken rule stays startling for ever' },
          { id: 'rise', profile: [0.12, 0.36, 0.62, 0.9], reads: 'each generation is harder to startle' },
          { id: 'spike', profile: [0.1, 0.92, 0.14, 0.1], reads: 'one scandal, and then nothing at all' },
        ],
      },
      explain: 'It decays. Every broken rule is absorbed and becomes the convention the next generation breaks. That’s why the movement has to keep moving. A flat line would mean Impressionism still upset people, and it sells postcards.',
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
        'Every broken rule becomes the next one to break',
      ],
      closing: 'Art breaks its own rules so that a half-asleep audience might wake up and look at something properly.',
    },
    dur: 5.0,
  },
];
