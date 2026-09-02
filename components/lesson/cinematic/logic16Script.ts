import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-16, "After It Is Not Because Of It"
// Theme: SIX MORNINGS IN A ROW, AND THE ONE WHERE NOBODY CROWED.
//
// Post hoc is a fallacy about TIME, so the picture is a calendar. Five mornings
// are drawn in order and every one of them holds: crow, then sun. The pattern is
// allowed to be genuinely impressive before it is attacked, because a reader who
// has not felt the pull of the inference has not learned anything by rejecting it.
//
// The lesson turns on a case that is MISSING rather than a case that is wrong,
// which is the part people never reach on their own: you do not refute post hoc
// by finding a counter-example to the correlation, you refute it by arranging a
// morning where the supposed cause is absent. So the sixth panel is empty until
// the reader has chosen what to put in it.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — the strip becomes three candidate tomorrows and the
//     reader picks the observation that would actually settle it. The decoys are
//     the two things people really propose: more of the same, and a test of the
//     converse that nobody could arrange anyway (H66).
//   · beat 7  two CARDS — what five mornings in a row has and has not shown.
// ─────────────────────────────────────────────────────────────────────────────

export interface Log16Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How many mornings have played, 0…6. */ dawns?: number;
  /** The claimed CROW → SUN arrow above the strip, 0…1. */ arrow?: number;
  /** The strip gives way to three candidate tomorrows, 0…1. */ cands?: number;
  /** The sixth morning has no crow in it, 0…1. */ silent?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Log16Beat[] = [
  {
    p: 25, x: 60, dawns: 1,
    text: 'Every morning the cockerel crows. A few minutes later the sun comes up.',
    dur: 4.0,
  },
  {
    p: 2, x: 60, dawns: 5,
    text: 'Five mornings running. Five crows, five sunrises, and not once has the sun beaten him to it.',
    dur: 4.4,
  },
  {
    p: 45, x: 132, dawns: 5, arrow: 1,
    text: 'So the crow makes the sun rise. Nobody believes that.',
    cite: 'And therefore',
    dur: 2.6,
  },
  {
    p: 45, x: 132, dawns: 5, arrow: 1,
    text: 'Everybody makes the same move about something else.',
    dur: 2,
  },
  {
    p: 13, x: 132, dawns: 5, arrow: 1,
    text: 'Order in time is free. Every cause comes before its effect.',
    cite: 'Post hoc ergo propter hoc',
    dur: 3.1,
  },
  {
    p: 13, x: 132, dawns: 5, arrow: 1,
    text: 'So does every coincidence.',
    dur: 1.8,
  },
  {
    p: 4, x: 132, dawns: 5, arrow: 1, cands: 1, live: 1,
    interact: {
      prompt: 'Tap the card that would actually test it.',
      explain: 'The card with no crow on it. If the sun still comes up, the crow was never doing the work. Another crowing morning just repeats what you have. And nobody can arrange a morning without a sunrise, so it tests nothing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, dawns: 6, arrow: 1, silent: 1,
    text: 'The cockerel is ill and says nothing. The sun comes up at the usual minute.',
    cite: 'The sixth morning',
    dur: 4.4,
  },
  {
    p: 137, x: 250, dawns: 6, silent: 1,
    quote: {
      id: 'lq-logic-arguments-16-2',
      text: 'One event follows another; but we never can observe any tie between them. They seem conjoined, but never connected.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['logic'],
    },
    dur: 3.6,
  },
  {
    p: 41, x: 250, dawns: 6, silent: 1,
    interact: {
      prompt: 'Place the token on what five mornings have established.',
      field: {
        xLo: 'THEY MERELY PAIR UP', xHi: 'ONE MAKES THE OTHER HAPPEN',
        yLo: 'SEEN ONCE', yHi: 'SEEN FIVE TIMES',
        start: [0.76, 0.24],
        quads: [
          { id: 'pattern', x: 0, y: 1, reads: 'five times, and still only a pattern', correct: true },
          { id: 'once', x: 0, y: 0, reads: 'once, which is not even a pattern yet' },
          { id: 'cause5', x: 1, y: 1, reads: 'five times, so one of them causes the other' },
          { id: 'cause1', x: 1, y: 0, reads: 'once, and already calling it a cause' },
        ],
      },
      explain: 'Top left. Going up the pad is real progress: one morning is an anecdote, five is a pattern. Going right is a different claim altogether, and no amount of repetition carries you across. Here the dawn light wakes the bird, so the arrow points the other way.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'After Is Not Because',
      points: [
        'Post hoc reads order in time as cause',
        'Every cause precedes its effect, and so does every coincidence',
        'The test is a case where the supposed cause is absent',
        'One shared cause can produce both without either causing the other',
      ],
      closing: 'Nothing crowed on the sixth morning, and the sun came up anyway.',
    },
    dur: 3.2,
  },
];
