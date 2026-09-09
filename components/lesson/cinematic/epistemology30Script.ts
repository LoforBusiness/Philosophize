import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-30, "Becoming A Wise Knower"
// Theme: A LIT DISC, AND THE DARK EDGE THAT GROWS AROUND IT.
//
// Socratic wisdom is a claim about a RATIO rather than about a quantity, so the
// stage draws both terms: what somebody knows, and how much of what they do not
// know has come into view. The disc barely changes. The edge is the lesson.
//
// The ring is drawn as an open outline rather than a filled band, because it is
// a boundary the reader can see and not a stock of anything.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what Socratic
//     wisdom actually is. On the stage because the disc and its edge are both
//     drawn, and the answer is about the relation between them.
//   · beat 8  a PLOT — how many questions come into view across a whole path.
//     The ring widens as the curve rises, so a falling line shrinks the world
//     back to the size it looked before anybody started.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology30Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the field and the lit disc are drawn. */ disc?: number;
  /** How far the edge of the known unknown has opened, 0…1. */ edge?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Epistemology30Beat[] = [
  {
    p: 342, x: 24, disc: 1, edge: 0.1,
    text: 'Thirty lessons in, the question quietly changed on you.',
    dur: 4.2,
  },
  {
    p: 171, x: 24, disc: 1, edge: 0.35,
    text: 'You stopped asking what knowledge is. You started asking how to know well.',
    dur: 4.8,
  },
  {
    p: 447, x: 24, disc: 1, edge: 0.6,
    text: 'A wise knower is not the one holding the most facts. Good intellectual character is the skill.',
    dur: 5.0,
  },
  {
    p: 265, x: 24, disc: 1, edge: 0.6,
    text: 'Humble about being wrong, curious enough to keep looking, fair enough to credit other people.',
    dur: 5.0,
  },
  {
    p: 159, x: 24, disc: 1, edge: 0.6, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what Socratic wisdom actually is.',
      explain: 'Knowing what you do not know. Socrates claimed no store of answers and no immunity from error, only an accurate view of where his own knowledge stopped. That is a working posture rather than modesty or despair.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 465, x: 80, disc: 1, edge: 0.75,
    text: 'The oracle called Socrates the wisest man in Athens, and he spent years trying to prove it wrong.',
    dur: 5.0,
  },
  {
    p: 445, x: 80, disc: 1, edge: 0.75,
    quote: {
      id: 'lq-epistemology-knowledge-30-1',
      text: 'I am wiser than this man; it is likely that neither of us knows anything worthwhile, but he thinks he knows when he does not, whereas I do not think I know.',
      author: 'Plato (Socrates speaking)',
      work: 'Apology',
      era: 'c. 399 BCE',
      philosopherId: 'plato',
      branchSlugs: ['epistemology'],
    },
    dur: 5.0,
  },
  {
    p: 460, x: 80, disc: 1, edge: 0.75,
    text: 'Hold a belief firmly enough to act on it, and loosely enough to give it up.',
    dur: 4.8,
  },
  {
    p: 168, x: 80, disc: 1,
    interact: {
      prompt: 'Draw what happens to the questions you can see.',
      plot: {
        cols: ['LESSON 1', 'LESSON 10', 'LESSON 20', 'LESSON 30'],
        axis: 'QUESTIONS IN VIEW',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'open', profile: [0.14, 0.4, 0.66, 0.94], reads: 'the edge keeps opening as you learn', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'the same view from start to finish' },
          { id: 'close', profile: [0.94, 0.66, 0.4, 0.14], reads: 'the puzzles get used up one by one' },
          { id: 'spike', profile: [0.14, 0.92, 0.2, 0.16], reads: 'one confusing week and then clarity' },
        ],
      },
      explain: 'It keeps opening. Every answer brings a question the reader could not have asked before, which is why the edge of what somebody knows they do not know grows faster than the middle. A shrinking line would mean philosophy runs out.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 331, x: 80, disc: 1, edge: 0.94,
    summary: {
      title: 'A Better Way to Think',
      points: [
        'Good knowing is a skill and a character',
        'Wisdom is humility, curiosity, courage and fairness',
        'Socratic wisdom is knowing where your knowledge stops',
        'Hold beliefs firmly enough to act, loosely enough to learn',
      ],
      closing: 'You set out to define knowledge. You leave with something rarer, which is a better way to think.',
    },
    dur: 5.0,
  },
];
