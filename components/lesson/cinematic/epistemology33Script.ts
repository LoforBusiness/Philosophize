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
}

export const BEATS: Epistemology33Beat[] = [
  {
    p: 25, x: 56, ev: 0, bar: 0.2,
    text: 'A friend asks whether the bank opens on Saturday. You were there last Saturday and there was a queue out of the door.',
    dur: 3.8,
  },
  {
    p: 47, x: 56, ev: 1, bar: 0.2,
    text: 'That is your evidence, and it is ordinary. You say you know, nobody blinks, and the two of you carry on.',
    cite: 'One memory, and it is enough',
    dur: 4.0,
  },
  {
    p: 415, x: 56, ev: 1, bar: 0.85,
    text: 'Now the same afternoon with one thing added. A cheque has to clear by Monday or you lose the house.',
    cite: 'The stakes go up',
    dur: 4.0,
  },
  {
    p: 160, x: 56, ev: 1, bar: 0.85,
    text: 'And you get out of the car and check. Look at the column while you do it — not one brick has moved.',
    cite: 'The evidence did not move',
    dur: 3.5,
  },
  {
    p: 160, x: 56, ev: 1, bar: 0.85,
    text: 'You have exactly what you had a minute ago.',
    dur: 1.8,
  },
  {
    p: 137, x: 56, ev: 1, bar: 0.85,
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
    p: 4, x: 56, ev: 1, live: 1,
    interact: {
      prompt: 'The column never changes as you drag. Stop where what you have stops being enough.',
      drag: {
        lo: 'NOTHING RIDES ON IT',
        hi: 'THE HOUSE',
        start: 0,
        zones: [
          { id: 'know', upto: 0.36, reads: 'you know it' },
          { id: 'hedge', upto: 0.68, reads: 'you had better check' },
          { id: 'no', upto: 1, reads: 'you do not know it', correct: true },
        ],
      },
      explain: 'Watch what did not move: the evidence. The bar did. That is contextualism. The word "know" takes its standard from what is riding on the answer. One belief can pass in the morning and fail in the afternoon.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 35, x: 56, ev: 1, bar: 0.85,
    text: 'So there is no single height that counts as knowing. There is a height for this conversation, and it goes up when the answer starts to cost something.',
    cite: 'No single height',
    dur: 4.6,
  },
  {
    p: 45, x: 56, ev: 1, bar: 0.85,
    interact: {
      prompt: 'Does raising the stakes make your belief less likely to be true?',
      cards: [
        { text: 'No, just harder to claim', correct: true },
        { text: 'Yes, the evidence weakens', correct: false },
      ],
      explain: 'The tempting slide is from "I should not say I know" to "I am probably wrong". They are different. The bank will do whatever it was always going to do. What changed is how much you should stake on it without looking.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Enough For What?',
      points: [
        'The same evidence can pass one test and fail another',
        'Stakes move the standard, not the evidence',
        '"I should check" is not "I am probably wrong"',
        '"Know" carries its context with it',
      ],
      closing: 'Next time you hesitate to say you know, ask what changed. Usually not what you have — what it would cost to be wrong.',
    },
    dur: 3.0,
  },
];
