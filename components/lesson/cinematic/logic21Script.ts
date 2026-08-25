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
    text: 'Four things that have something to do with a fire starting. Only one of them is the fire.',
    dur: 4.2,
  },
  {
    p: 2, x: 200, chips: 1, bench: 1, under: 0,
    text: 'Two tests, and they ask different questions. Take the lamp away and see. Then switch that lamp on alone and see.',
    cite: 'The bench',
    dur: 4.8,
  },
  {
    p: 45, x: 132, chips: 1, bench: 1, under: 1,
    text: 'A match in petrol lights it every time, and a spark would have done just as well. Enough, but not required.',
    dur: 4.8,
  },
  {
    p: 4, x: 132, chips: 1, bench: 1, under: 0, live: 1,
    interact: {
      prompt: 'Tap the one you must have, which is still not enough.',
      explain: 'Oxygen. Take oxygen away and nothing burns, so oxygen is required. Fill a room with oxygen and nothing happens, so oxygen is not enough on its own. Those two facts are independent, and that is why the words are worth keeping apart.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, chips: 1, bench: 1, under: 2,
    text: 'It being Tuesday fails both tests. Fuel and heat and oxygen together pass both.',
    cite: 'The other two corners',
    dur: 4.0,
  },
  {
    p: 13, x: 268, chips: 1, bench: 1, under: 3,
    text: 'So there are four boxes, not two. Most arguments that go wrong here have put something in the wrong one.',
    dur: 4.6,
  },
  {
    p: 137, x: 268, chips: 1, bench: 1, under: 3,
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
      prompt: 'Place a match in petrol on the two tests.',
      field: {
        xLo: 'NOT REQUIRED', xHi: 'REQUIRED',
        yLo: 'NOT ENOUGH', yHi: 'ENOUGH ALONE',
        start: [0.72, 0.24],
        quads: [
          { id: 'neither', x: 0, y: 0, reads: 'beside the point' },
          { id: 'nec', x: 1, y: 0, reads: 'needed, and not enough' },
          { id: 'suf', x: 0, y: 1, reads: 'enough, and not the only way', correct: true },
          { id: 'both', x: 1, y: 1, reads: 'the whole story' },
        ],
      },
      explain: 'Top left. It is enough on its own, so it is sufficient. It is not required, because a spark or a hot surface would have started the same fire. Being sufficient says nothing at all about being necessary, and that is the confusion the two axes take apart.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Questions, Not One',
      points: [
        'Necessary means it cannot happen without this',
        'Sufficient means this on its own makes it happen',
        'A condition can be either, both, or neither',
        'Most confusions here have put something in the wrong box',
      ],
      closing: 'Take the thing away, then try the thing alone. Two tests, and the answers can disagree.',
    },
    dur: 3.4,
  },
];
