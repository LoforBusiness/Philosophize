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
  /** 1 = a dashed rule draws between the two ruler cards — each family gets its own separate standard. */ divide?: number;
  /** 1 = a check mark lands on the inductive card's COGENT line. */ tick?: number;
  /** 1 = a token travels once from the lock down to the deductive card's VALID/INVALID line, tying the guarantee to the argument's form. */ link?: number;
  /** 1 = a stroke crosses out the deductive card's VALID/INVALID line — the wrong standard for judging this argument. */ strike?: number;
}

export const BEATS: Strong4Beat[] = [
  {
    p: 2, fill: 0.55, lock: 0, dice: 0, verdict: 0, lens: 0,
    text: 'Some arguments aim to guarantee a conclusion. Others aim only to make the conclusion probable.',
    dur: 1.8,
  },
  {
    p: 266, fill: 0.55, lock: 0, dice: 0, verdict: 0, lens: 0, divide: 1,
    text: 'Both kinds of argument are legitimate, and each has its own standard of assessment.',
    dur: 2.1,
  },
  {
    p: 459, fill: 0.55, verdict: 0, lens: 0, divide: 1,
    text: 'A deductive argument aims to guarantee its conclusion. It’s judged valid or invalid, and a valid one with true premises is sound.',
    cite: 'Two families of argument',
    dur: 1.8,
  },
  {
    p: 459, fill: 0.55, verdict: 0, lens: 0, divide: 1, tick: 1,
    text: 'An inductive argument aims only to make its conclusion likely, so it’s judged strong or weak. A strong one with true premises is cogent.',
    dur: 3.5,
  },
  {
    p: 274, fill: 1, lock: 1, dice: 0, verdict: 2, lens: 1, divide: 1, tick: 1,
    text: 'Consider the argument “all men are mortal, Socrates is a man, so Socrates is mortal”. If both premises are true, the conclusion can’t be false.',
    cite: 'Deduction — guaranteed',
    dur: 3.4,
  },
  {
    p: 274, fill: 1, lock: 1, dice: 0, verdict: 2, lens: 1, divide: 1, tick: 1, link: 1,
    text: 'That certainty comes from the argument’s form, not from its subject matter.',
    dur: 1.8,
  },
  {
    p: 173, fill: 0.78, lock: 0, dice: 1, verdict: 1, lens: 2, divide: 1, tick: 1,
    text: 'Now consider the argument “most Greeks eat olives, Socrates is Greek, so he eats olives”. The premises could be true and the conclusion false.',
    cite: 'Induction — likely',
    dur: 3.1,
  },
  {
    p: 398, fill: 0.78, lock: 0, dice: 1, verdict: 1, lens: 2, divide: 1, tick: 1, strike: 1,
    text: 'So the conclusion is only probable. Judging such an argument by the standard of validity is a mistake.',
    dur: 1.8,
  },
  {
    p: 147, fill: 0.78, dice: 1, verdict: 1, lens: 2, divide: 1, tick: 1, strike: 1,
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
    p: 380, fill: 0.78, dice: 1, verdict: 1, lens: 2,
    // Answered ON the panel: the ruler cards clear and four verdict chips take
    // their place, so the reader grades the argument instead of reading a list.
    interact: {
      prompt: 'If premises make a conclusion likely but not certain, which verdict fits the argument?',
      explain:
        'Strong. Premises that make a conclusion likely give an inductive argument strength. Calling it invalid applies the deductive standard, which it never aimed to meet. With true premises, a strong inductive argument is cogent.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, fill: 0.78, dice: 1, verdict: 1, lens: 2,
    interact: {
      prompt: 'How does the standard of validity bear on a strong inductive argument?',
      sort: {
        chip: 'a strong inductive argument',
        bins: [
          { id: 'invalid', label: 'invalid, so flawed', reads: 'flawed, since it doesn’t guarantee its conclusion' },
          { id: 'weak', label: 'weak', reads: 'weak, since its conclusion could still be false' },
          { id: 'wrong', label: 'the wrong standard', reads: 'validity is the wrong standard for assessing it', correct: true },
        ],
      },
      explain: 'Validity is the wrong standard for assessing it. An inductive argument aims only at likelihood, so failing to guarantee its conclusion isn’t a flaw. Nor is it weak, since its premises make the conclusion likely.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Deductive and Inductive Standards',
      points: [
        'A deductive argument aims to guarantee its conclusion',
        'An inductive argument aims to make its conclusion likely',
        'Strong is to induction what valid is to deduction',
        'A strong argument with true premises is cogent',
      ],
      closing: 'New evidence can weaken a strong inductive argument. Adding premises can never make a valid deduction invalid.',
    },
    dur: 2.8,
  },
];
