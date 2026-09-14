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
    text: 'Most of epistemology asks what knowledge is and how beliefs are justified.',
    dur: 4.2,
  },
  {
    p: 171, x: 24, disc: 1, edge: 0.35,
    text: 'Virtue epistemology asks a further question: what makes someone a good knower?',
    dur: 4.8,
  },
  {
    p: 447, x: 24, disc: 1, edge: 0.6,
    text: 'A wise knower isn’t the one holding the most facts. Wisdom depends on good intellectual character.',
    dur: 5.0,
  },
  {
    p: 265, x: 24, disc: 1, edge: 0.6,
    text: 'Intellectual virtues include humility about your own errors, curiosity, intellectual courage, and fairness to the views of others.',
    dur: 5.0,
  },
  {
    p: 159, x: 24, disc: 1, edge: 0.6, plates: 1, live: 1,
    interact: {
      prompt: 'What does Socratic wisdom consist in?',
      explain: 'Knowing where you stop. Socrates claimed no store of answers and no immunity from error. He claimed only an accurate view of where his own knowledge ended.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 465, x: 80, disc: 1, edge: 0.75,
    text: 'The oracle at Delphi said that no one was wiser than Socrates. Socrates tried to refute it by questioning people reputed to be wise.',
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
    text: 'A wise knower holds a belief firmly enough to act on it, and loosely enough to revise it.',
    dur: 4.8,
  },
  {
    p: 168, x: 80, disc: 1,
    interact: {
      prompt: 'Which curve shows how many questions come into view as you learn?',
      plot: {
        cols: ['LESSON 1', 'LESSON 10', 'LESSON 20', 'LESSON 30'],
        axis: 'QUESTIONS IN VIEW',
        start: [0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'open', profile: [0.14, 0.4, 0.66, 0.94], reads: 'questions multiply as you learn', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5], reads: 'the same number of questions throughout' },
          { id: 'close', profile: [0.94, 0.66, 0.4, 0.14], reads: 'questions are answered and run out' },
          { id: 'spike', profile: [0.14, 0.92, 0.2, 0.16], reads: 'a surge of questions, then few' },
        ],
      },
      explain: 'Questions multiply as you learn. Each answer makes new questions possible, so the visible edge of your ignorance grows. A falling curve would mean that inquiry runs out of questions.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 331, x: 80, disc: 1, edge: 0.94,
    summary: {
      title: 'Becoming a Wise Knower',
      points: [
        'Knowing well depends on intellectual character',
        'Intellectual virtues include humility, curiosity, courage and fairness',
        'Socratic wisdom is knowing where your knowledge stops',
        'Beliefs should be firm enough to act on, and open to revision',
      ],
      closing: 'Epistemology asks what knowledge is. Virtue epistemology also asks what makes a good knower.',
    },
    dur: 5.0,
  },
];
