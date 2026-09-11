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
    text: 'Three judges hear one case. A verdict of liable needs two findings: a contract existed, and it was broken.',
    dur: 4.2,
  },
  {
    p: 2, x: 52, grid: 1, votes: 1,
    text: 'Each of them votes on both, and each verdict follows from the two votes above it. Nobody is careless.',
    dur: 4.2,
  },
  {
    p: 36, x: 52, grid: 1, votes: 1, tally: 1,
    text: 'Now count each column.',
    dur: 2.4,
  },
  {
    p: 4, x: 52, grid: 1, votes: 1, tally: 1, live: 1,
    interact: {
      prompt: 'Tap the majority cell that contradicts the other two.',
      explain: 'The verdict. Two of three found a contract, and two of three found it broken. Together those mean liable, yet two of three voted not liable. Every row above holds together. Only the row made by counting does not.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 176, x: 52, grid: 1, votes: 1, tally: 1,
    text: 'The puzzle has a name: the doctrinal paradox. Each row can hold together while the row you get by counting does not.',
    dur: 5.0,
  },
  {
    p: 168, x: 98, grid: 1, votes: 1, tally: 1,
    text: 'So a court has to choose what it counts. It can count the verdict alone, or count the reasons and let the verdict follow.',
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
      prompt: 'How far should the reasons bind the verdict?',
      drag: {
        lo: 'count the verdict', hi: 'follow the reasons',
        start: 0.06,
        zones: [
          { id: 'count', upto: 0.25, reads: 'count the verdict, and the court contradicts itself' },
          { id: 'mix', upto: 0.55, reads: 'take whichever answer suits, case by case' },
          { id: 'reasons', upto: 1, reads: 'settle the reasons, and let the verdict follow', correct: true },
        ],
      },
      explain: 'Settle the reasons first. Watch the bottom cell turn over as you move. That’s the repair working, and also the bill. The court now rules liable when two of its three judges voted the other way. It has to say why that’s legitimate.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Bottom Row',
      points: [
        'A group verdict is built column by column',
        'Every member can be consistent and the total not',
        'Reasons and verdicts give different answers',
        'Which you count is a decision, not a detail',
      ],
      closing: 'Any committee you sit on is running one of the two procedures. Knowing which is worth the trouble, because the choice decides what a group can mean.',
    },
    dur: 3.4,
  },
];
