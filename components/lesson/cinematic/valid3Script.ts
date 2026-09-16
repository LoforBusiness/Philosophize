import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-3, "Valid vs Sound".
// An inspector reads an argument pinned up as a form: two premises, a ∴ rule, a
// conclusion, and a two-box CHECKLIST underneath — "FORM VALID?" and "PREMISES
// TRUE?" — which is the whole lesson as a diagram. A VALID stamp lands when the
// form holds; the words inside the boxes then swap from the abstract skeleton to
// the toaster argument WITHOUT the boxes moving, so the reader watches the form
// stay put while the content changes. A ✗ strikes the premises: valid, not sound.
//
// The first graded question is answered IN the scene (four verdict cards); the
// second stays a deck question, so the two never feel identical.
//
// Every tap of the opening puts on the board what its sentence names: the two
// tests are written up as they are defined (FORM VALID? with validity, PREMISES
// TRUE? with soundness, bracketed together as SOUND); the toaster premises fill in
// before the conclusion does; the VALID stamp comes down on the sentence that
// says "so the argument is valid"; and when the premises are shown false, the
// SOUND bracket is struck along with them.
//
// Graded questions are the two from data/.../valid-vs-sound.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Valid3Beat extends BaseBeat {
  /** Inspector gesture (emote code). */ p?: number;
  /** Conclusion + ∴ rule shown (0/1). */ link?: number;
  /** VALID stamp shown (0/1). */ stamp?: number;
  /** False-premise ✗ shown (0/1). */ flaw?: number;
  /** Which words fill the form: 0 the abstract skeleton · 1 the toasters in the premises · 2 the toasters throughout. */ form?: number;
  /** How much of the checklist is written up: 1 FORM VALID? · 2 + PREMISES TRUE? · 3 + the bracket naming the pair SOUND. */ tests?: number;
}

export const BEATS: Valid3Beat[] = [
  {
    p: 2, link: 0, stamp: 0, flaw: 0, form: 0, tests: 0,
    text: 'An argument can have a flawless logical form and still reach a false conclusion, if its premises are false.',
    dur: 3.6,
  },
  {
    // "two tests. An argument is valid when …" — the first test is written up.
    p: 459, link: 1, form: 0, tests: 1,
    text: 'Logic distinguishes two tests. An argument is valid when its form makes it impossible for true premises to yield a false conclusion.',
    cite: 'Validity vs Soundness',
    dur: 3.2,
  },
  {
    // "sound when it's valid and all its premises are true" — the second test, and
    // the bracket that makes the pair of them SOUND.
    p: 459, link: 1, form: 0, tests: 3,
    text: 'An argument is sound when it’s valid and all its premises are true.',
    dur: 1.8,
  },
  {
    // "whose premises are …" — the premises fill in; the conclusion waits.
    p: 276, link: 1, stamp: 0, form: 1, tests: 3,
    text: 'Consider an argument whose premises are that all toasters are gold and all gold things are time machines.',
    cite: 'Valid but absurd',
    dur: 2,
  },
  {
    // "Its conclusion is … so the argument is valid" — the conclusion fills in and
    // the stamp comes down.
    p: 276, link: 1, stamp: 1, form: 2, tests: 3,
    text: 'Its conclusion is that all toasters are time machines. If the premises were true, the conclusion would have to be true, so the argument is valid.',
    dur: 2.6,
  },
  {
    p: 38, link: 1, stamp: 1, flaw: 1, form: 2, tests: 3,
    text: 'Both premises are false, and so is the conclusion. Valid form, false premises: the argument is valid but not sound.',
    dur: 4.2,
  },
  {
    p: 139, link: 1, stamp: 1, flaw: 1, form: 2, tests: 3,
    quote: {
      id: 'lq-logic-arguments-3',
      text: 'Mathematics may be defined as the subject in which we never know what we are talking about, nor whether what we are saying is true.',
      author: 'Bertrand Russell',
      philosopherId: 'bertrand-russell',
      work: 'Mysticism and Logic',
      era: '1901',
      branchSlugs: ['logic'],
    },
    dur: 3.0,
  },
  {
    p: 21, link: 1, stamp: 1, form: 2, tests: 3,
    // Answered ON the board: the form clears and four verdict cards take its place.
    interact: {
      prompt: 'What do you call a valid argument whose premises are all true?',
      explain:
        'Sound. A valid argument with true premises is sound, so its conclusion must be true. “Valid only” fits an argument whose premises may be false, and “probable” describes inductive support.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 383, link: 1, stamp: 1, flaw: 1, form: 2, tests: 3,
    text: 'Validity concerns only the form, while soundness also concerns the truth of the premises. To reject the conclusion of a valid argument, you must reject a premise.',
    dur: 4.0,
  },
  {
    p: 4, link: 1, stamp: 0, flaw: 0, form: 0, tests: 3,
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
    dur: 1.0,
  },
  {
    tests: 3,
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
