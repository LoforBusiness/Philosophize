import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-21, "Necessary vs Sufficient"
// Theme: TWO TESTS ON A BENCH, AND FOUR THINGS PUT THROUGH BOTH OF THEM.
//
// The pair is confused constantly and it is not a hard idea — it is two
// questions that people run together because they are usually asked at the same
// time. So the scene splits them into two literal tests with two lamps, and every
// condition goes through both.
//
//   TAKE IT AWAY  · does it still happen?   → necessary
//   THIS ALONE    · does it happen?         → sufficient
//
// Four conditions, one of each status, so the reader sees all four combinations
// exist before being asked to place anything.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap the condition you must have and which is still
//     not enough. Every chip is a real status, so the decoys are the other three
//     boxes of the table rather than filler (H66).
//   · beat 7  a FIELD — the reader places a match in petrol on a pad whose axes
//     are the two tests. The pad is the point: a list of four phrases hides that
//     these are two independent questions, and two axes cannot.
// ─────────────────────────────────────────────────────────────────────────────

export interface Log21Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The four condition chips along the top, 0…1. */ chips?: number;
  /** The bench and its two lamps, 0…1. */ bench?: number;
  /** Which chip is under test, 0…3. */ under?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Log21Beat[] = [
  {
    p: 25, x: 200, chips: 1,
    text: 'Consider four conditions that might bear on whether a fire starts. Each relates to the fire in a different way.',
    dur: 4.2,
  },
  {
    p: 443, x: 200, chips: 1, bench: 1, under: 0,
    text: 'Necessity and sufficiency are separate questions. A condition is necessary when removing it stops the fire from starting.',
    cite: 'Two separate tests',
    dur: 3,
  },
  {
    p: 400, x: 200, chips: 1, bench: 1, under: 0,
    text: 'A condition is sufficient when it starts the fire alone.',
    dur: 1.8,
  },
  {
    p: 447, x: 132, chips: 1, bench: 1, under: 1,
    text: 'A match in petrol starts a fire every time, so it’s sufficient. It isn’t necessary, because a spark could start the same fire.',
    dur: 4.8,
  },
  {
    p: 457, x: 132, chips: 1, bench: 1, under: 0, live: 1,
    interact: {
      prompt: 'Which condition is necessary for the fire but not sufficient?',
      explain: 'Oxygen. Without it nothing burns, so it’s necessary. But air full of oxygen doesn’t catch fire by itself, so it isn’t sufficient. A match in petrol is the reverse.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, chips: 1, bench: 1, under: 2,
    text: 'It being Tuesday is neither necessary nor sufficient. Fuel, heat and oxygen together are both necessary and sufficient.',
    cite: 'Neither, and both',
    dur: 4.0,
  },
  {
    p: 168, x: 268, chips: 1, bench: 1, under: 3,
    text: 'So there are four kinds of condition. A common mistake is to take a sufficient one for a necessary one, or the reverse.',
    dur: 4.6,
  },
  {
    p: 139, x: 268, chips: 1, bench: 1, under: 3,
    quote: {
      id: 'lq-logic-arguments-21-1',
      text: 'We have no other notion of cause and effect, but that of certain objects, which have been always conjoined together.',
      author: 'David Hume',
      work: 'A Treatise of Human Nature',
      era: '1739',
      philosopherId: 'david-hume',
      branchSlugs: ['logic'],
    },
    dur: 3.8,
  },
  {
    p: 41, x: 268, chips: 1, bench: 1, under: 1,
    interact: {
      prompt: 'Which claim about causes does a match in petrol confirm?',
      poll: {
        options: [
          { id: 'neither', reads: 'a cause need only make its effect more likely', holders: ['Patrick Suppes'] },
          { id: 'nec', reads: 'without its cause, an effect wouldn’t occur', holders: ['David Hume'] },
          { id: 'suf', reads: 'a cause can suffice without being necessary', correct: true, holders: ['John Stuart Mill'] },
          { id: 'both', reads: 'a cause is both necessary and sufficient', holders: ['Baruch Spinoza'] },
        ],
      },
      explain: 'A cause can suffice without being necessary. A match in petrol always starts a fire. Yet a spark would too, so the fire doesn’t depend on the match.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Questions, Not One',
      points: [
        'A necessary condition is one the effect can’t occur without',
        'A sufficient condition produces the effect on its own',
        'A condition can be either, both, or neither',
        'A common error is to mistake one kind for the other',
      ],
      closing: 'To classify a condition, ask whether the effect can occur without it, and whether it produces the effect alone.',
    },
    dur: 3.4,
  },
];
