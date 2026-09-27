import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-3, "Valid vs Sound".
// Theme: AN ARGUMENT MACHINE, TWO HOPPERS AND A CRANK, AND A TOASTER THAT IS NOT GOLD.
//
// A machine in a workshop takes premises in at two hoppers and turns out a
// conclusion when the crank is turned. Its two lamps are the two tests: VALID, for a
// form that cannot turn true premises into a false conclusion, and SOUND, for that
// and true premises too. He feeds it "all toasters are gold" and "all gold things are
// time machines", turns the crank, and out comes "all toasters are time machines":
// VALID lights. Then he picks up a real toaster, which is not gold, and every line is
// stamped FALSE; SOUND stays dark. To reject the conclusion, he pulls a premise out.
//
// Redrawn 2026-09-26, the third lesson of the branch in reading order. Every line,
// citation, quotation and summary point is copied from the previous script by a
// generator, word for word and beat for beat.
// ─────────────────────────────────────────────────────────────────────────────

export interface Valid3Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 132 clear of the machine's left end · 290 clear of its right end, at the crank · 316 by the toaster. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'run' | 'valid' | 'sound' | 'load' | 'crank' | 'toaster' | 'reject';
  /** The lamps are labelled VALID and SOUND. */ lamps?: boolean;
  /** How many premise cards are in: 0 · 1 · 2. */ fed?: number;
  /** The conclusion has come out of the chute. */ out?: boolean;
  /** The VALID lamp is lit. */ valid?: boolean;
  /** Every line on the board is stamped FALSE. */ falsified?: boolean;
  /** He is holding the toaster. */ toaster?: boolean;
  /** The first premise has been pulled back out. */ pulled?: boolean;
  /** Q1 on the stage: three rubber stamps on the wall. */ stamps?: boolean;
}

export const BEATS: Valid3Beat[] = [
  {
    p: 158, x: 290, act: 'run',
    text: 'An argument can have a flawless logical form and still reach a false conclusion, if its premises are false.',
    dur: 3.6,
  },
  {
    p: 167, x: 132, act: 'valid', lamps: true,
    text: 'Logic distinguishes two tests. An argument is valid when its form makes it impossible for true premises to yield a false conclusion.',
    cite: 'Validity vs Soundness',
    dur: 3.2,
  },
  {
    p: 158, x: 132, act: 'sound', lamps: true,
    text: 'An argument is sound when it’s valid and all its premises are true.',
    dur: 1.8,
  },
  {
    p: 158, x: 290, act: 'load', lamps: true, fed: 2,
    text: 'Consider an argument whose premises are that all toasters are gold and all gold things are time machines.',
    cite: 'Valid but absurd',
    dur: 2,
  },
  {
    p: 158, x: 290, act: 'crank', lamps: true, fed: 2, out: true, valid: true,
    text: 'Its conclusion is that all toasters are time machines. If the premises were true, the conclusion would have to be true, so the argument is valid.',
    dur: 2.6,
  },
  {
    p: 158, x: 316, act: 'toaster', lamps: true, fed: 2, out: true, valid: true, falsified: true, toaster: true,
    text: 'Both premises are false, and so is the conclusion. Valid form, false premises: the argument is valid but not sound.',
    dur: 4.2,
  },
  {
    p: 263, x: 316, lamps: true, fed: 2, out: true, valid: true, falsified: true, toaster: true,
    quote: {
      id: 'lq-logic-arguments-3',
      text: 'Mathematics may be defined as the subject in which we never know what we are talking about, nor whether what we are saying is true.',
      author: 'Bertrand Russell',
      philosopherId: 'bertrand-russell',
      work: 'Mysticism and Logic',
      era: '1901',
      branchSlugs: ['logic'],
    },
    dur: 3,
  },
  {
    p: 260, x: 316, lamps: true, fed: 2, out: true, valid: true, falsified: true, toaster: true, stamps: true,
    interact: {
      prompt: 'What do you call a valid argument whose premises are all true?',
      explain: 'Sound. A valid argument with true premises is sound, so its conclusion must be true. “Valid only” fits an argument whose premises may be false, and “probable” describes inductive support.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 158, x: 132, act: 'reject', lamps: true, fed: 2, out: true, valid: true, falsified: true, pulled: true,
    text: 'Validity concerns only the form, while soundness also concerns the truth of the premises. To reject the conclusion of a valid argument, you must reject a premise.',
    dur: 4,
  },
  {
    p: 260, x: 132, lamps: true, fed: 2, out: true, valid: true, falsified: true, pulled: true,
    interact: {
      prompt: 'How should the argument “Grass is green, so the sky is blue” be classified?',
      sort: {
        chip: 'the grass and sky argument',
        bins: [
          { id: 'luck', label: 'invalid', reads: 'broken form, true premise', correct: true },
          { id: 'valid', label: 'sound', reads: 'good form, true premise' },
          { id: 'premise', label: 'valid, unsound', reads: 'good form, false premise' },
          { id: 'bad', label: 'both faults', reads: 'broken form, false premise' },
        ],
      },
      explain: 'Invalid. Both claims are true, but the colour of grass does nothing to make the sky blue. The form guarantees nothing, so the true conclusion is luck.',
      xp: 5,
    },
    dur: 1,
  },
  {
    lamps: true, fed: 2, out: true, valid: true, falsified: true, pulled: true,
    summary: {
      title: 'Validity and Soundness',
      points: [
        'Valid: true premises can’t yield a false conclusion',
        'Sound: valid, with all premises true',
        'A valid argument can reach a false conclusion',
        '“Valid” describes form, not truth',
      ],
      closing: 'Asking the two questions separately shows where an argument fails.',
    },
    dur: 2.8,
  },
];
