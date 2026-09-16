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
    text: 'Suppose that every morning a cockerel crows, and a few minutes later the sun rises.',
    dur: 4.0,
  },
  {
    p: 312, x: 60, dawns: 5,
    text: 'Over five mornings the order never varies: first the crow, then the sunrise.',
    dur: 4.4,
  },
  {
    p: 159, x: 132, dawns: 5, arrow: 1,
    text: 'The inference would be that the crowing makes the sun rise. Here, no one accepts that conclusion.',
    cite: 'The inference',
    dur: 2.6,
  },
  {
    p: 159, x: 132, dawns: 5, arrow: 1,
    text: 'Yet the same form of inference is common where the conclusion seems plausible.',
    dur: 2,
  },
  {
    p: 13, x: 132, dawns: 5, arrow: 1,
    text: 'The fallacy is called post hoc ergo propter hoc. In Latin that means “after this, therefore because of this”.',
    cite: 'Post hoc ergo propter hoc',
    dur: 3.1,
  },
  {
    p: 266, x: 132, dawns: 5, arrow: 1,
    text: 'Every cause comes before its effect, but so does every coincidence.',
    dur: 1.8,
  },
  {
    p: 165, x: 132, dawns: 5, arrow: 1, cands: 1, live: 1,
    interact: {
      prompt: 'Which observation would test whether the crowing causes the sunrise?',
      explain: 'No crow: a morning when the bird stays quiet. If the sun still rises, the crowing isn’t needed for the sunrise. Another crowing morning only repeats the evidence already gathered, and a morning without sunrise can’t be arranged.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, dawns: 6, arrow: 1, silent: 1,
    text: 'On the sixth morning the cockerel is ill and silent. The sun rises at the usual time.',
    cite: 'The sixth morning',
    dur: 4.4,
  },
  {
    p: 456, x: 250, dawns: 6, silent: 1,
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
      prompt: 'Five crows came before five sunrises. Which principle shows this doesn’t make the crow a cause?',
      poll: {
        options: [
          { id: 'pattern', reads: 'night precedes day but doesn’t cause it', holders: ['Thomas Reid'], correct: true },
          { id: 'once', reads: 'we never observe a necessary connection', holders: ['David Hume'] },
          { id: 'cause5', reads: 'every event follows another by a rule', holders: ['Immanuel Kant'] },
          { id: 'cause1', reads: 'the course of nature is uniform', holders: ['John Stuart Mill'] },
        ],
      },
      explain: 'Night precedes day but doesn’t cause it. Regular succession, however long, doesn’t show that one event produces another.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'After Is Not Because',
      points: [
        'Post hoc reasoning mistakes order in time for causation',
        'Every cause precedes its effect, and so does every coincidence',
        'The test is a case where the supposed cause is absent',
        'One shared cause can produce both without either causing the other',
      ],
      closing: 'The sixth morning settles the question: the cockerel was silent, and the sun still rose.',
    },
    dur: 3.2,
  },
];
