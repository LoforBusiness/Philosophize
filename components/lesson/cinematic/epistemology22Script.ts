import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-22, "Why Is Knowledge Better Than Luck?"
// Theme: TWO ROUTES TO THE SAME PLACE, AND ONLY ONE OF THEM WORKS ON TUESDAY.
//
// The value problem is easy to state and almost impossible to feel, because on
// the day in question the guesser and the knower are in exactly the same place.
// So the scene puts them there — both tokens arrive, at the same moment, at the
// same destination — and then asks about tomorrow.
//
// That is the whole of it. Knowledge is worth more than true belief because it
// is REPEATABLE, and repeatability is a shape over time rather than a fact about
// today. Which is why the second question is a curve and not a pick.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — two routes, both of which arrived. Tap the one you
//     would take again. There is no trick and the reader will get it right; what
//     they are learning is that the question distinguishes the two at all.
//   · beat 7  a PLOT — draw how the guesser does across five attempts. Drawing
//     "right every time" is a real position, and it is the one the question is
//     for: a reader who thinks luck repeats has not yet got the point.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi22Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Both routes and the destination, 0…1. */ routes?: number;
  /** How far the two tokens have travelled, 0…1. */ run?: number;
  /** The gaps under the lucky route, drawn, 0…1. */ gaps?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epi22Beat[] = [
  {
    p: 164, x: 200, routes: 1,
    text: 'Two people want the same address. One asks somebody who knows it.',
    dur: 3.4,
  },
  {
    p: 164, x: 200, routes: 1,
    text: 'One guesses.',
    dur: 1.8,
  },
  {
    p: 2, x: 200, routes: 1, run: 1,
    text: 'Both arrive. Both now believe something true, and today there is nothing to choose between them.',
    cite: 'Same destination',
    dur: 4.4,
  },
  {
    p: 159, x: 132, routes: 1, run: 1, gaps: 1,
    text: 'Look underneath. One route is a road.',
    dur: 1.8,
  },
  {
    p: 159, x: 132, routes: 1, run: 1, gaps: 1,
    text: 'The other is a line of stepping stones with nothing between them.',
    dur: 2.9,
  },
  {
    p: 4, x: 132, routes: 1, run: 1, gaps: 1, live: 1,
    interact: {
      prompt: 'Both arrived. Tap the route you would take again tomorrow.',
      explain: 'The road. Today the two are worth exactly the same, which is what makes the question hard — the difference is not in the belief you hold now, it is in whether the thing that produced it will produce another one.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, routes: 1, run: 1, gaps: 1,
    text: 'Plato asked the same about statues that run away unless you tie them down. A tethered opinion stays put.',
    cite: 'The Meno',
    dur: 4.8,
  },
  {
    p: 137, x: 268, routes: 1, run: 1, gaps: 1,
    quote: {
      id: 'lq-epistemology-knowledge-22-1',
      text: 'True opinions, as long as they remain, are a fine thing and do all sorts of good. But they refuse to stay long.',
      author: 'Plato (Socrates speaking)',
      work: 'Meno',
      era: 'c. 385 BC',
      philosopherId: 'plato',
      branchSlugs: ['epistemology'],
    },
    dur: 4.0,
  },
  {
    p: 13, x: 268, routes: 1, run: 1, gaps: 1,
    text: 'So the extra value is not in today at all. It is in every other day, and you can draw it.',
    dur: 4.2,
  },
  {
    p: 41, x: 268, routes: 1, run: 1, gaps: 1,
    interact: {
      prompt: 'Draw how often the guesser arrives, over five tries.',
      plot: {
        axis: 'ARRIVED',
        cols: ['TRY 1', 'TRY 2', 'TRY 3', 'TRY 4', 'TRY 5'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'always', profile: [0.92, 0.9, 0.9, 0.9, 0.9], reads: 'right again every time' },
          { id: 'luck', profile: [0.94, 0.14, 0.1, 0.16, 0.08], reads: 'right once, then anybody\'s guess', correct: true },
          { id: 'never', profile: [0.08, 0.08, 0.1, 0.08, 0.06], reads: 'never gets there at all' },
        ],
      },
      explain: 'One high mark and then the floor. A guess that happened to land tells you nothing about the next one, and that gap is the whole difference in value. Drawing it high across is the mistake worth making, because it is what treating luck as a method looks like.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What Luck Cannot Do',
      points: [
        'A lucky true belief and knowledge look identical on the day',
        'Knowledge came from something that will work again',
        'Plato called it tethering the opinion down',
        'The extra value shows up over repeats, not in the single case',
      ],
      closing: 'Both travellers arrived. Only one of them can find the road again.',
    },
    dur: 3.4,
  },
];
