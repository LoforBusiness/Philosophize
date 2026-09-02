import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-37, "Is a Glass Fragile Before It Breaks?"
// Theme: A GLASS THAT NEVER BREAKS, AND A PROPERTY YOU CANNOT POINT AT.
//
// The lesson is about a fact that never shows itself, so the scene's central
// object never does anything: one glass on one shelf, unchanged from the first
// beat to the last. What moves is everything AROUND it — a hammer that swings and
// is stopped, a ward that snaps on, a row of labels being tested.
//
// That restraint is the argument. If the glass shattered even once the reader
// would have seen the fragility, and the whole question is what it means for the
// fragility to be there while nothing happens.
//
// GAMIFIED SHAPE, and both asks are on the stage:
//   · beat 3  a SCENE TARGET — four labels on the shelf; tap the one that says
//     what a disposition is. Two of the three wrong ones are the definitions that
//     philosophers actually tried and had to abandon.
//   · beat 6  a DRAG — how fragile is the glass, now, sitting there untouched?
//     The readout runs from "nothing until it breaks" to "exactly as fragile as
//     ever", and the reader has to commit before the summary agrees with them.
// ─────────────────────────────────────────────────────────────────────────────

export interface Metaphysics37Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the shelf and its glass are drawn. */ shelf?: number;
  /** 1 = the hammer hangs above, ready. */ hammer?: number;
  /** How far the hammer has swung, 0 (up) … 1 (at the glass). */ swing?: number;
  /** 1 = the ward snaps on and the blow is stopped. */ ward?: number;
  /** 1 = the four candidate labels stand on the shelf. */ labels?: number;
  /** 1 = the reader's thumb is on the fragility rail. */ live_d?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Metaphysics37Beat[] = [
  {
    p: 25, x: 56, shelf: 1,
    text: 'One glass, one shelf, ninety years. The glass was never knocked, never dropped, and never broke.',
    dur: 3.6,
  },
  {
    p: 13, x: 56, shelf: 1,
    text: 'Ask whether it was fragile and everyone says yes without pausing. Now say what that yes was about.',
    dur: 4.0,
  },
  {
    p: 4, x: 56, shelf: 1, labels: 1, live: 1,
    interact: {
      prompt: 'Tap the label that says what being fragile is.',
      explain: 'What it WOULD do. Not what it did, because it did nothing. Not what it is made of, because a thing can be fragile for many reasons. And not what we expect, because the glass was fragile before anyone looked at it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 56, shelf: 1, hammer: 1, swing: 1,
    text: 'So try the obvious definition. Fragile means: if it is struck, it breaks.',
    dur: 3,
  },
  {
    p: 21, x: 56, shelf: 1, hammer: 1, swing: 1,
    text: 'Watch the hammer come down.',
    dur: 1.8,
  },
  {
    p: 2, x: 56, shelf: 1, hammer: 1, swing: 1, ward: 1,
    text: 'And a sorcerer is watching, ready to toughen it the instant anyone swings. The glass does not break.',
    cite: 'Martin\'s fink, 1994',
    dur: 3.2,
  },
  {
    p: 2, x: 56, shelf: 1, hammer: 1, swing: 1, ward: 1,
    text: 'It is still exactly as fragile as it was.',
    dur: 1.8,
  },
  {
    p: 4, x: 56, shelf: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'The sorcerer is gone and nobody has touched it. How fragile is it right now?',
      drag: {
        lo: 'NOT AT ALL',
        hi: 'COMPLETELY',
        start: 0,
        zones: [
          { id: 'none', upto: 0.28, reads: 'nothing until it breaks' },
          { id: 'some', upto: 0.62, reads: 'only a way of speaking' },
          { id: 'full', upto: 1, reads: 'as fragile as it ever was', correct: true },
        ],
      },
      explain: 'Nothing about the glass changed when the sorcerer left, and nothing changed in ninety years on the shelf. Whatever fragility is, the glass has all of it right now, with no event to point at.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 47, x: 56, shelf: 1,
    quote: {
      id: 'lq-metaphysics-being-37-1',
      text: 'A disposition is a property whose instances are directed toward manifestations that may never occur.',
      author: 'C.B. Martin',
      work: 'Dispositions and Conditionals',
      era: '1994',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.6,
  },
  {
    p: 35, x: 128, shelf: 1,
    text: 'Which is a strange thing for a fact to be. Something true of the glass is true because of an event that never happened and now never will.',
    dur: 4.8,
  },
  {
    summary: {
      title: 'The Property That Points Elsewhere',
      points: [
        'A disposition says what would happen, not what does',
        'Simple conditionals fail — interference breaks them',
        'The glass is fragile whether struck or not',
        'So some truths are about events that never occur',
      ],
      closing: 'Half of what you know about any object is what it would do. Almost none of it will ever be tested.',
    },
    dur: 3.2,
  },
];
