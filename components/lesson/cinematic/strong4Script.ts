import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-4, "Strong vs Weak".
//
// The stage is an instrument panel. A CERTAINTY GAUGE with a needle and a 0–100%
// scale reads the argument: for a DEDUCTION the needle pins at 100%, a lock snaps
// shut and the banner stamps GUARANTEED; for an INDUCTION the needle falls back
// off certainty, dice roll out and the banner reads LIKELY. Underneath, two
// labelled RULER CARDS spell out the two yardsticks side by side —
//   DEDUCTIVE · guarantee · valid/invalid · sound
//   INDUCTIVE · likely    · strong/weak   · cogent
// — and the active one inks up as the presenter talks about it. That card pair is
// the lesson's whole point ("wrong ruler, wrong verdict") as a diagram.
//
// The first graded question is answered IN the scene: the cards clear and four
// verdict chips take their place. The second stays a deck question.
//
// Graded questions are the two from data/.../strong-vs-weak-arguments.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Strong4Beat extends BaseBeat {
  /** Presenter gesture (emote code). */ p?: number;
  /** Gauge needle 0..1. */ fill?: number;
  /** Lock snapped shut — guaranteed (0/1). */ lock?: number;
  /** Dice shown and wobbling — probable (0/1). */ dice?: number;
  /** Banner: 0 blank · 1 LIKELY · 2 GUARANTEED. */ verdict?: number;
  /** Which ruler card is inked: 0 neither · 1 deductive · 2 inductive. */ lens?: number;
}

export const BEATS: Strong4Beat[] = [
  {
    p: 2, fill: 0.55, lock: 0, dice: 0, verdict: 0, lens: 0,
    text: 'Some arguments prove their point. Others only make it a good bet.',
    dur: 1.8,
  },
  {
    p: 2, fill: 0.55, lock: 0, dice: 0, verdict: 0, lens: 0,
    text: 'Both are useful, and grading one by the other’s standard is where people go wrong.',
    dur: 2.1,
  },
  {
    p: 167, fill: 0.55, verdict: 0, lens: 0,
    text: 'A deductive argument promises its conclusion. Grade that one valid or sound.',
    cite: 'Two families of argument',
    dur: 1.8,
  },
  {
    p: 167, fill: 0.55, verdict: 0, lens: 0,
    text: 'An inductive argument only makes its conclusion likely, so grade it strong or weak. Use the wrong ruler and you get the wrong verdict.',
    dur: 3.5,
  },
  {
    p: 6, fill: 1, lock: 1, dice: 0, verdict: 2, lens: 1,
    text: '"All men are mortal; Socrates is a man; so he is mortal. Grant the first two and the third cannot be false.',
    cite: 'Deduction — guaranteed',
    dur: 3.4,
  },
  {
    p: 6, fill: 1, lock: 1, dice: 0, verdict: 2, lens: 1,
    text: 'The needle pins and the guarantee locks shut.',
    dur: 1.8,
  },
  {
    p: 8, fill: 0.78, lock: 0, dice: 1, verdict: 1, lens: 2,
    text: '"Most Greeks eat olives; Socrates is Greek; so he eats olives. Only probable — he might hate them.',
    cite: 'Induction — likely',
    dur: 3.1,
  },
  {
    p: 398, fill: 0.78, lock: 0, dice: 1, verdict: 1, lens: 2,
    text: 'The needle slips off certainty and the dice come out.',
    dur: 1.8,
  },
  {
    p: 147, fill: 0.78, dice: 1, verdict: 1, lens: 2,
    quote: {
      id: 'lq-logic-arguments-4',
      text: 'Custom, then, is the great guide of human life.',
      author: 'David Hume',
      philosopherId: 'david-hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      branchSlugs: ['logic'],
    },
    dur: 3.0,
  },
  {
    p: 21, fill: 0.78, dice: 1, verdict: 1, lens: 2,
    // Answered ON the panel: the ruler cards clear and four verdict chips take
    // their place, so the reader grades the argument instead of reading a list.
    interact: {
      prompt: 'These premises make the conclusion likely, not certain. Tap the verdict that fits.',
      explain:
        'Strong, not valid. Validity is the deductive ruler and it does not apply here. A strong argument that also has true premises has its own name: cogent.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, fill: 0.78, dice: 1, verdict: 1, lens: 2,
    interact: {
      prompt: 'What is the right verdict on a strong inductive argument?',
      sort: {
        chip: 'a strong inductive argument',
        bins: [
          { id: 'invalid', label: 'invalid', reads: 'invalid: it did not guarantee the conclusion' },
          { id: 'weak', label: 'weak', reads: 'weak: the evidence does not do very much' },
          { id: 'wrong', label: 'wrong test entirely', reads: 'neither, validity is the wrong test', correct: true },
        ],
      },
      explain: 'Wrong test entirely. Validity is a deductive word, and induction never set out to be valid. It promised likelihood and delivered likelihood. Calling that a failure is like calling a hammer a bad screwdriver.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Strong & Weak Unlocked',
      points: [
        'Deductive: premises meant to guarantee',
        'Inductive: premises meant to make likely',
        'Strong is to induction what valid is to deduction',
        'Strong plus true premises is cogent',
      ],
      closing: 'A strong inductive case can still be toppled by new evidence. A valid deduction cannot.',
    },
    dur: 2.8,
  },
];
