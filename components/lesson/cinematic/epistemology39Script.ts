import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-39, "What a Committee Knows"
// Theme: A TABLE OF VOTES WHERE EVERY JUDGE HOLDS TOGETHER AND THE COURT DOES NOT.
//
// The paradox is a table, so the scene is the table: three judges down the side,
// CONTRACT · BROKEN · LIABLE across the top, and a majority row underneath that
// fills in column by column while the reader watches. Read any single row and it
// is faultless. Read the bottom one and the court has said yes to both reasons
// and no to the thing they add up to.
//
// Nothing here needs a metaphor, which is the point: the drawing IS the argument,
// and a reader who can read three rows of YES and NO has the whole result.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — the three cells of the majority row, and the reader
//     taps the one that contradicts the rest. On the stage because the answer is a
//     position in a table, which no pair of cards can point at.
//   · beat 7  a DRAG — how far a group should be bound by its own reasons. The
//     bottom row is the readout: hand the dial to the reasons and the verdict cell
//     turns over under the reader's thumb, which is the whole cost of the repair.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology39Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the empty table stands, ruled and headed. */ grid?: number;
  /** How many of the three judges have voted, 0…1. */ votes?: number;
  /** How many of the three columns have been counted, 0…1. */ tally?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epistemology39Beat[] = [
  {
    p: 25, x: 52, grid: 1,
    text: 'Three judges hear one case. To find the defendant liable, they must agree a contract existed and was broken.',
    dur: 4.2,
  },
  {
    p: 2, x: 52, grid: 1, votes: 1,
    text: 'Each judge votes on both findings, and each judge’s verdict follows consistently from those two votes.',
    dur: 4.2,
  },
  {
    p: 36, x: 52, grid: 1, votes: 1, tally: 1,
    text: 'The court’s majority is found by counting each column separately.',
    dur: 2.4,
  },
  {
    p: 4, x: 52, grid: 1, votes: 1, tally: 1, live: 1,
    interact: {
      prompt: 'Which majority finding is inconsistent with the other two?',
      explain: 'The verdict. A majority found a contract, and a majority found it broken. Those two votes together mean the defendant is liable. Yet a majority voted not liable. Each judge is consistent, but the group is not.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 52, grid: 1, votes: 1, tally: 1,
    text: 'Lewis Kornhauser and Lawrence Sager named this puzzle the doctrinal paradox. Judges can each be consistent, while the court as a whole is not.',
    dur: 5.0,
  },
  {
    p: 168, x: 98, grid: 1, votes: 1, tally: 1,
    text: 'A court must therefore choose a procedure. It can take a majority on the verdict, or on each premise and let the verdict follow.',
    dur: 4.4,
  },
  {
    p: 433, x: 98, grid: 1, votes: 1, tally: 1,
    quote: {
      id: 'lq-epistemology-knowledge-39-1',
      text: 'The many, of whom each is but an ordinary person, when they meet together may very likely be better than the few.',
      author: 'Aristotle',
      philosopherId: 'aristotle',
      work: 'Politics III',
      era: 'c. 350 BC',
      branchSlugs: ['epistemology'],
    },
    dur: 4.6,
  },
  {
    p: 21, x: 98, grid: 1, votes: 1, tally: 1,
    interact: {
      prompt: 'Should the court vote on the verdict or on the reasons?',
      sort: {
        chip: 'WHAT THEY VOTE ON',
        bins: [
          { id: 'verdict', label: 'THE VERDICT', reads: 'the verdict, leaving the court contradicting itself' },
          { id: 'either', label: 'CASE BY CASE', reads: 'whichever suits the case in front of them' },
          { id: 'reasons', label: 'THE REASONS', reads: 'the reasons, and let the verdict follow', correct: true },
        ],
      },
      explain: 'The reasons, and let the verdict follow. A majority can back each premise while a majority rejects the conclusion they lead to. A court that votes on the verdict alone can hand down a ruling that no one\'s own view supports.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Doctrinal Paradox',
      points: [
        'A court’s majority is counted issue by issue',
        'Consistent judges can form an inconsistent majority',
        'Voting on premises and on the verdict can disagree',
        'Choosing what to count is a substantive decision',
      ],
      closing: 'Every group that votes on reasons and conclusions must use one of these procedures. The choice shapes what the group can be said to believe.',
    },
    dur: 3.4,
  },
];
