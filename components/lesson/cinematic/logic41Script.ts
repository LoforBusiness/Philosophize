import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-41, "One Detail Too Many"
// Theme: A BOX INSIDE A BOX, AND THE INNER ONE STRAINING AT THE WALL.
//
// The conjunction rule is a fact about CONTAINMENT, so the scene draws the
// containment and nothing else. Every teller-and-activist is a teller, so the
// inner box lives inside the outer one — and the reader's drag can push it right
// up to the wall and no further, because there is nowhere further to go.
//
// That limit is the lesson and it is enforced by the geometry rather than stated.
// A control that let the inner box grow past the outer would be drawing something
// arithmetic forbids, which is A1 broken in the one place the lesson cannot afford
// it.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what makes the
//     longer description feel likelier. On the stage because the two boxes are
//     already sitting there disagreeing with the intuition.
//   · beat 8  a DRAG — the inner box itself, grown as far as the reader thinks it
//     goes. It stops at the wall on its own, which is the whole argument arriving
//     under their thumb.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic41Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the outer group of all bank tellers is drawn. */ outer?: number;
  /** 1 = the inner group and the legend under it are drawn. */ inner?: number;
  /** How much of the outer box the inner one fills, 0…1. */ fill?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Logic41Beat[] = [
  {
    p: 420, x: 28,
    text: 'Linda is thirty-one, outspoken, and studied philosophy at university.',
    dur: 4.0,
  },
  {
    p: 161, x: 28, outer: 1,
    text: 'Is she more likely to be a bank teller, or a bank teller who’s also an activist?',
    dur: 4.8,
  },
  {
    p: 386, x: 28, outer: 1, inner: 1, fill: 0.34,
    text: 'Most people pick the second. The extra detail fits Linda.',
    dur: 4.4,
  },
  {
    p: 263, x: 28, outer: 1, inner: 1, fill: 0.34,
    text: 'But every activist teller is a teller. The second group sits inside the first.',
    dur: 4.6,
  },
  {
    p: 260, x: 28, outer: 1, inner: 1, fill: 0.34, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what makes the longer description feel likelier.',
      explain: 'Resemblance. You were asked about probability and answered about fit, because fit is the easier question. Precision is real and beside the point — a narrower claim is less likely, not more. And the number of claims is the mechanism, not the reason.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 434, x: 88, outer: 1, inner: 1, fill: 0.34,
    text: 'Amos Tversky and Daniel Kahneman found this in nine of ten people, including statisticians.',
    dur: 5.0,
  },
  {
    p: 425, x: 88, outer: 1, inner: 1, fill: 0.34,
    quote: {
      id: 'lq-logic-arguments-41-1',
      text: 'A conjunction cannot be more probable than one of its constituents.',
      author: 'Amos Tversky and Daniel Kahneman',
      work: 'Extensional versus Intuitive Reasoning',
      era: '1983',
      branchSlugs: ['logic'],
    },
    dur: 4.2,
  },
  {
    p: 446, x: 88, outer: 1, inner: 1, fill: 0.34,
    text: 'Adding a detail narrows a claim. Narrower means fewer people fit it.',
    dur: 4.2,
  },
  {
    p: 257, x: 88, outer: 1, inner: 1,
    interact: {
      prompt: 'How large can the activist tellers be?',
      drag: {
        lo: 'A FEW',
        hi: 'ALL OF THEM',
        start: 0.95,
        zones: [
          { id: 'slice', upto: 0.45, reads: 'a slice of the tellers, and never more', correct: true },
          { id: 'most', upto: 0.8, reads: 'most tellers, which no description shows' },
          { id: 'all', upto: 1, reads: 'all of them — every teller an activist' },
        ],
      },
      explain: 'A slice. The inner box can touch the wall at most, when every teller is an activist, and it can’t break out. Nothing you learn about Linda moves that wall, because the description was never about how many tellers there are.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 320, x: 88, outer: 1, inner: 1, fill: 0.34,
    summary: {
      title: 'Inside the Box',
      points: [
        'A conjunction is a subset of each of its parts',
        'So it can never be the likelier of the two',
        'Detail buys resemblance and costs probability',
        'A vivid story is the strongest form of the trap',
      ],
      closing: 'A forecast with names, dates and a motive convinces where a bare one doesn’t. Every detail added is one more way for the forecast to be wrong.',
    },
    dur: 4.6,
  },
];
