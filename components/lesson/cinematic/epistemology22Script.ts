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
    p: 462, x: 200, routes: 1,
    text: 'Suppose two people want to reach the same address. The first asks someone who knows the way.',
    dur: 3.4,
  },
  {
    p: 462, x: 200, routes: 1,
    text: 'The second person has no information and guesses the way.',
    dur: 1.8,
  },
  {
    p: 384, x: 200, routes: 1, run: 1,
    text: 'Both arrive, and both now hold a true belief. This raises the value problem: why is knowledge worth more?',
    cite: 'Same destination',
    dur: 4.4,
  },
  {
    p: 463, x: 132, routes: 1, run: 1, gaps: 1,
    text: 'Yet the two routes differ. The first person’s route is a road that can be travelled again.',
    dur: 1.8,
  },
  {
    p: 463, x: 132, routes: 1, run: 1, gaps: 1,
    text: 'The guesser’s route is a row of stepping stones with gaps between them.',
    dur: 2.9,
  },
  {
    p: 165, x: 132, routes: 1, run: 1, gaps: 1, live: 1,
    interact: {
      prompt: 'Both travellers arrived today. Which route would you rely on tomorrow?',
      explain: 'Asked somebody who knew. Today both beliefs are equally true, which is what makes the question hard. The difference lies in whether the method that produced the belief will produce a true one again.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, routes: 1, run: 1, gaps: 1,
    text: 'In the Meno, Plato compares true opinions to the statues of Daedalus, which run away unless tied down. Once tied down by reasoning, Plato says, they become knowledge.',
    cite: 'The Meno',
    dur: 4.8,
  },
  {
    p: 128, x: 268, routes: 1, run: 1, gaps: 1,
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
    p: 383, x: 268, routes: 1, run: 1, gaps: 1,
    text: 'So the extra value is not in today at all. It lies in stability over time, which a lucky guess lacks.',
    dur: 4.2,
  },
  {
    p: 442, x: 268, routes: 1, run: 1, gaps: 1,
    interact: {
      prompt: 'Which curve shows how often the guesser arrives over five tries?',
      plot: {
        axis: 'ARRIVED',
        cols: ['TRY 1', 'TRY 2', 'TRY 3', 'TRY 4', 'TRY 5'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'always', profile: [0.92, 0.9, 0.9, 0.9, 0.9], reads: 'arrives on every try' },
          { id: 'luck', profile: [0.94, 0.14, 0.1, 0.16, 0.08], reads: 'arrives once, then rarely again', correct: true },
          { id: 'never', profile: [0.08, 0.08, 0.1, 0.08, 0.06], reads: 'never arrives on any try' },
        ],
      },
      explain: 'Arrives once, then rarely again. A lucky guess says nothing about the next try. The curve that stays high mistakes luck for a reliable method.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Knowledge, Luck and Value',
      points: [
        'A lucky true belief and knowledge look identical on the day',
        'Knowledge comes from a method that will work again',
        'Plato compared knowledge to a true opinion tied down',
        'The extra value shows over repeated cases, not a single one',
      ],
      closing: 'Both travellers arrived, but only the one who knew the way could reliably arrive again.',
    },
    dur: 3.4,
  },
];
