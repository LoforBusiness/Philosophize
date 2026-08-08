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
    text: 'Some arguments prove. Others only bet the odds. Deduction aims to guarantee its conclusion; induction only makes it probable.',
    dur: 3.8,
  },
  {
    p: 1, fill: 0.55, verdict: 0, lens: 0,
    text: 'A DEDUCTIVE argument claims its premises guarantee the conclusion — we grade it valid or sound. An INDUCTIVE one only makes the conclusion likely — so we grade it strong or weak. Wrong ruler, wrong verdict.',
    cite: 'Two families of argument',
    dur: 5.2,
  },
  {
    p: 6, fill: 1, lock: 1, dice: 0, verdict: 2, lens: 1,
    text: '"All men are mortal; Socrates is a man; so he is mortal." It cannot be false. The needle pins at 100% and the guarantee locks shut.',
    cite: 'Deduction — guaranteed',
    dur: 4.6,
  },
  {
    p: 8, fill: 0.78, lock: 0, dice: 1, verdict: 1, lens: 2,
    text: '"Most Greeks eat olives; Socrates is Greek; so he eats olives." Only probable — he might hate them. The needle slips off certainty and the dice come out.',
    cite: 'Induction — likely',
    dur: 4.8,
  },
  {
    p: 147, fill: 0.78, dice: 1, verdict: 1, lens: 2,
    quote: {
      id: 'lq-logic-arguments-4',
      text: 'Custom, then, is the great guide of human life.',
      author: 'David Hume',
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
      prompt: 'An inductive argument’s premises make its conclusion likely. What is it?',
      explain:
        'For induction the yardstick is strength, not validity. Strong premises make the conclusion likely; add true premises and it becomes cogent.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, fill: 0.78, dice: 1, verdict: 1, lens: 2,
    mc: {
      prompt: 'You call a strong inductive argument "invalid" because its conclusion isn’t guaranteed. Right?',
      options: [
        { id: 'a', text: 'No — "valid" is the wrong ruler for induction', correct: true },
        { id: 'b', text: 'Yes — no guarantee means invalid', correct: false },
        { id: 'c', text: 'Yes — only deductions can be valid, so it’s invalid', correct: false },
        { id: 'd', text: 'Yes — likely isn’t certain, so it fails', correct: false },
      ],
      explain:
        'Validity only grades deductions. Judging induction by it is a category mistake — use strong or weak instead.',
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
      closing: 'Inductive strength is defeasible — new evidence can topple it; deductive validity cannot.',
    },
    dur: 2.8,
  },
];
