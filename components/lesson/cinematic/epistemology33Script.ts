import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-33, "Does 'Know' Move When the Stakes Do?" —
// the DRAG mechanic (../DragScale) used for the thing it was invented for.
//
// A column of evidence stands at a FIXED height. A bar hangs above it, and the bar
// is what the reader drags. Every other lesson about this asks you to compare two
// written-out cases; here you hold the standard in your thumb and watch the same
// evidence pass and then fail, without one brick moving. Rule A1 doing real work:
// the argument IS that nothing on the left changes.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology33Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Where the bar sits, 0 low stakes … 1 the house is on it. */ bar?: number;
  /** How many bricks of evidence are stacked, 0..1 of the full column. */ ev?: number;
  /** 1 = the reader is driving the bar from the rail (Q1). */ live?: number;
  /** 1 = a datum line marks the evidence column's height, and says it has not moved. */ datum?: number;
  /** 1 = the verdict that now seems wrong, beside the column it is about. */ seems?: number;
}

export const BEATS: Epistemology33Beat[] = [
  {
    p: 172, x: 56, ev: 0, bar: 0.2,
    text: 'Consider a case adapted from Keith DeRose. Asked whether the bank opens on Saturday, you recall being there last Saturday.',
    dur: 3.8,
  },
  {
    p: 435, x: 56, ev: 1, bar: 0.2,
    text: 'In ordinary conversation, that memory is enough. You say you know the bank will be open, and nobody objects.',
    cite: 'Low stakes',
    dur: 4.0,
  },
  {
    p: 415, x: 56, ev: 1, bar: 0.85,
    text: 'Now add high stakes. A cheque must be deposited by Monday, or you’ll lose your house.',
    cite: 'High stakes',
    dur: 4.0,
  },
  {
    p: 457, x: 56, ev: 1, bar: 0.85,
    datum: 1,
    text: 'Your evidence hasn’t changed. The column of evidence is the same height as before.',
    cite: 'The evidence did not move',
    dur: 3.5,
  },
  {
    p: 457, x: 56, ev: 1, bar: 0.85,
    seems: 1,
    text: 'Yet it now seems wrong to say that you know the bank will be open.',
    dur: 1.8,
  },
  {
    p: 456, x: 56, ev: 1, bar: 0.85,
    quote: {
      id: 'lq-epistemology-knowledge-33-1',
      text: 'Enough is enough: it does not mean everything.',
      author: 'J. L. Austin',
      work: 'Sense and Sensibilia',
      era: '1962',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    p: 467, x: 56, ev: 1, live: 1,
    interact: {
      prompt: 'Put these in order, from lowest stakes to highest.',
      order: {
        axis: 'LOWEST STAKES FIRST',
        items: [
          { id: 'know', reads: 'YOU KNOW IT' },
          { id: 'check', reads: 'YOU HAD BETTER CHECK' },
          { id: 'no', reads: 'YOU DO NOT KNOW IT' },
        ],
      },
      explain: 'The same evidence carries you further when less rides on it. Nothing about the bank changed between the low-stakes and the high-stakes version of the case, only what turns on being right, and yet what you\'re willing to call knowing moved.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, x: 56, ev: 1, bar: 0.85,
    text: 'So there is no single height that counts as knowing. On this view, the standard rises as the cost of error rises.',
    cite: 'No single height',
    dur: 4.6,
  },
  {
    p: 45, x: 56, ev: 1, bar: 0.85,
    interact: {
      prompt: 'Does raising the stakes make your belief less likely to be true?',
      cards: [
        { text: 'No, only harder to call knowledge', correct: true },
        { text: 'Yes, the evidence weakens', correct: false },
      ],
      explain: 'Only harder to call knowledge. Raising the stakes doesn’t change your evidence, or the chance that the bank opens. It changes how much evidence you need before claiming to know.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Stakes and Knowledge',
      points: [
        'The same evidence can pass one test and fail another',
        'Stakes move the standard, not the evidence',
        '“I should check” is not “I am probably wrong”',
        'On contextualism, “know” depends on context',
      ],
      closing: 'When you hesitate to claim knowledge, your evidence has often stayed the same. What has changed is the cost of being wrong.',
    },
    dur: 3.0,
  },
];
