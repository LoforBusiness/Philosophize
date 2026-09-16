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
    p: 462, x: 56, shelf: 1,
    text: 'Consider a glass that stood on a shelf for ninety years. It was never knocked or dropped, and it never broke.',
    dur: 3.6,
  },
  {
    p: 419, x: 56, shelf: 1,
    text: 'Was the glass fragile? Almost everyone would say yes, but it’s hard to say what that claim is about.',
    dur: 4.0,
  },
  {
    p: 4, x: 56, shelf: 1, labels: 1, live: 1,
    interact: {
      prompt: 'Which label states what being fragile consists in?',
      explain: 'What it would do. Fragility isn’t what the glass did, since it did nothing. It isn’t the material, since fragility can rest on many materials. And it isn’t anyone’s expectation, since the glass was fragile unobserved.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 56, shelf: 1, hammer: 1, swing: 1,
    text: 'The simple conditional analysis defines fragility plainly: strike the object, and the object breaks.',
    dur: 3,
  },
  {
    p: 176, x: 56, shelf: 1, hammer: 1, swing: 1,
    text: 'Now suppose a hammer comes down on the glass.',
    dur: 1.8,
  },
  {
    p: 2, x: 56, shelf: 1, hammer: 1, swing: 1, ward: 1,
    text: 'But a sorcerer stands ready to toughen the glass the moment a blow begins. So the glass doesn’t break.',
    cite: 'A finkish disposition',
    dur: 3.2,
  },
  {
    p: 266, x: 56, shelf: 1, hammer: 1, swing: 1, ward: 1,
    text: 'Yet until the blow, the glass is as fragile as ever. So the simple conditional analysis fails.',
    dur: 1.8,
  },
  {
    p: 457, x: 56, shelf: 1, live_d: 1, live: 1,
    interact: {
      prompt: 'With the sorcerer gone and the glass untouched, how fragile is it now?',
      drag: {
        lo: 'NOT AT ALL',
        hi: 'COMPLETELY',
        start: 0,
        zones: [
          { id: 'none', upto: 0.28, reads: 'not fragile until it breaks' },
          { id: 'some', upto: 0.62, reads: 'fragile only as a way of speaking' },
          { id: 'full', upto: 1, reads: 'as fragile as it ever was', correct: true },
        ],
      },
      explain: 'As fragile as it ever was. Nothing about the glass changed when the sorcerer left, or in ninety years on the shelf. So the glass has its fragility now, without any event to show it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 433, x: 56, shelf: 1,
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
    p: 383, x: 128, shelf: 1,
    text: 'Dispositions are therefore unusual facts. The glass’s fragility is real now, yet it concerns a breaking that never occurs.',
    dur: 4.8,
  },
  {
    summary: {
      title: 'Fragility and Dispositions',
      points: [
        'A disposition says what would happen, not what does',
        'Finks show that simple conditional analyses fail',
        'The glass is fragile whether struck or not',
        'So some truths are about events that never occur',
      ],
      closing: 'Much of what is known about any object concerns what it would do. Most of it is never tested.',
    },
    dur: 3.2,
  },
];
