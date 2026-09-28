import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-4, "Strong Arguments vs Weak Arguments".
// Theme: A CHALKBOARD WITH A PADLOCK, AN OLIVE, AND A GREEK BANQUET BY THE SEA.
//
// In a lecture room a chalkboard splits into DEDUCTIVE and INDUCTIVE, each with its
// own standard. The Socrates syllogism goes up under a padlock that shuts on it, and
// its words turn into letters while the lock stays shut: the form does the work. He
// takes an olive from a bowl and holds it up; the camera goes into the olive and comes
// out of an olive on a plate at a banquet on a terrace over the sea. He walks the long
// table, where most plates have olives, and lifts the cover at Socrates' place: bread.
// The premises were true and the conclusion was not, so it was only ever probable.
//
// Redrawn 2026-09-27, the fourth lesson of the branch in reading order, with a scene
// change (portal.ts). Every line, citation, quotation and summary point is copied from
// the previous script by a generator, word for word and beat for beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Strong4Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 262 by the desk in the room · 280 at Socrates' place at the banquet. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'heads' | 'both' | 'valid' | 'strong' | 'syllogism' | 'form' | 'enter' | 'dish';
  /** The board is headed DEDUCTIVE and INDUCTIVE. */ heads?: boolean;
  /** VALID · SOUND is under DEDUCTIVE. */ valid?: boolean;
  /** STRONG · COGENT is under INDUCTIVE. */ strong?: boolean;
  /** The Socrates syllogism is on the board and the padlock is shut on it. */ syl?: boolean;
  /** Its words have become letters: the form alone. */ form?: boolean;
  /** He is at the banquet, not in the room (the scene change is the beat that sets it). */ feast?: boolean;
  /** The cover is off Socrates' dish: bread, not olives. PROBABLE. */ lifted?: boolean;
  /** Q1 on the stage: four clay voting shards on the ledge. */ q1?: boolean;
  /** This beat's camera tour, over the generated one (K10); [] holds the whole set, which the scene change needs. */ tour?: readonly (readonly number[])[];
}

export const BEATS: Strong4Beat[] = [
  {
    p: 158, x: 262, act: 'heads', heads: true,
    text: 'Some arguments aim to guarantee a conclusion. Others aim only to make the conclusion probable.',
    dur: 1.8,
  },
  {
    p: 167, x: 262, act: 'both', heads: true,
    text: 'Both kinds of argument are legitimate, and each has its own standard of assessment.',
    dur: 2.1,
  },
  {
    p: 158, x: 262, act: 'valid', heads: true, valid: true,
    text: 'A deductive argument aims to guarantee its conclusion. It’s judged valid or invalid, and a valid one with true premises is sound.',
    cite: 'Two families of argument',
    dur: 1.8,
  },
  {
    p: 158, x: 262, act: 'strong', heads: true, valid: true, strong: true,
    text: 'An inductive argument aims only to make its conclusion likely, so it’s judged strong or weak. A strong one with true premises is cogent.',
    dur: 3.5,
  },
  {
    p: 158, x: 262, act: 'syllogism', heads: true, valid: true, strong: true, syl: true,
    text: 'Consider the argument “all men are mortal, Socrates is a man, so Socrates is mortal”. If both premises are true, the conclusion can’t be false.',
    cite: 'Deduction — guaranteed',
    dur: 3.4,
  },
  {
    p: 158, x: 262, act: 'form', heads: true, valid: true, strong: true, syl: true, form: true,
    text: 'That certainty comes from the argument’s form, not from its subject matter.',
    dur: 1.8,
  },
  {
    p: 158, x: 280, act: 'enter', heads: true, valid: true, strong: true, syl: true, form: true, feast: true, tour: [],
    text: 'Now consider the argument “most Greeks eat olives, Socrates is Greek, so he eats olives”. The premises could be true and the conclusion false.',
    cite: 'Induction — likely',
    dur: 3.1,
  },
  {
    p: 158, x: 280, act: 'dish', heads: true, valid: true, strong: true, syl: true, form: true, feast: true, lifted: true,
    text: 'So the conclusion is only probable. Judging such an argument by the standard of validity is a mistake.',
    dur: 1.8,
  },
  {
    p: 263, x: 280, heads: true, valid: true, strong: true, syl: true, form: true, feast: true, lifted: true,
    quote: {
      id: 'lq-logic-arguments-4',
      text: 'Custom, then, is the great guide of human life.',
      author: 'David Hume',
      philosopherId: 'david-hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      branchSlugs: ['logic'],
    },
    dur: 3,
  },
  {
    p: 260, x: 280, heads: true, valid: true, strong: true, syl: true, form: true, feast: true, lifted: true, q1: true,
    interact: {
      prompt: 'If premises make a conclusion likely but not certain, which verdict fits the argument?',
      explain: 'Strong. Premises that make a conclusion likely give an inductive argument strength. Calling it invalid applies the deductive standard, which it never aimed to meet. With true premises, a strong inductive argument is cogent.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 260, x: 280, heads: true, valid: true, strong: true, syl: true, form: true, feast: true, lifted: true,
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
    dur: 1,
  },
  {
    heads: true, valid: true, strong: true, syl: true, form: true, feast: true, lifted: true,
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
