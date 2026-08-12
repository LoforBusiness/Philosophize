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
// Graded questions are the two from data/.../valid-vs-sound.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface Valid3Beat extends BaseBeat {
  /** Inspector gesture (emote code). */ p?: number;
  /** Conclusion + ∴ rule shown (0/1). */ link?: number;
  /** VALID stamp shown (0/1). */ stamp?: number;
  /** False-premise ✗ shown (0/1). */ flaw?: number;
  /** Which words fill the form: 0 the abstract skeleton · 1 the toasters. */ form?: number;
}

export const BEATS: Valid3Beat[] = [
  {
    p: 2, link: 0, stamp: 0, flaw: 0, form: 0,
    text: 'A perfectly logical argument can still be dead wrong. Flawless structure is not enough — you also need true premises.',
    dur: 3.6,
  },
  {
    p: 1, link: 1, form: 0,
    text: 'Two tests, never confused. An argument is VALID when its form makes true premises with a false conclusion impossible. It is SOUND when it is valid AND the premises are actually true.',
    cite: 'Validity vs Soundness',
    dur: 5.0,
  },
  {
    p: 26, link: 1, stamp: 1, form: 1,
    text: 'All toasters are gold. All gold things are time machines. So all toasters are time machines. The form is flawless — perfectly VALID.',
    cite: 'Valid but absurd',
    dur: 4.6,
  },
  {
    p: 38, link: 1, stamp: 1, flaw: 1, form: 1,
    text: 'Yet the conclusion is false — because the premises are. Valid form, false premises: the argument is valid but not sound.',
    dur: 4.2,
  },
  {
    p: 139, link: 1, stamp: 1, flaw: 1, form: 1,
    quote: {
      id: 'lq-logic-arguments-3',
      text: 'Mathematics may be defined as the subject in which we never know what we are talking about, nor whether what we are saying is true.',
      author: 'Bertrand Russell',
      work: 'Mysticism and Logic',
      era: '1901',
      branchSlugs: ['logic'],
    },
    dur: 3.0,
  },
  {
    p: 21, link: 1, stamp: 1, form: 1,
    // Answered ON the board: the form clears and four verdict cards take its place.
    interact: {
      prompt: 'An argument is VALID and its premises are actually TRUE. What is it?',
      explain:
        'Valid form plus true premises equals SOUND, and a sound argument’s conclusion must be true.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 13, link: 1, stamp: 1, flaw: 1, form: 1,
    text: 'Validity tests the form; soundness tests form and facts. To resist a valid argument, you cannot attack the logic — you must reject a premise.',
    dur: 4.0,
  },
  {
    p: 4, link: 1, stamp: 0, flaw: 0, form: 0,
    interact: {
      prompt: 'An argument reaches a TRUE conclusion. Does that make the argument valid?',
      cards: [
        { text: 'No, the form is what counts', correct: true },
        { text: 'Yes, the conclusion is true', correct: false },
      ],
      explain: 'Validity is about the form, not the conclusion. "Grass is green, so the sky is blue" has a true conclusion but no valid link.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Valid vs Sound',
      points: [
        'Valid: form blocks true premises, false conclusion',
        'Sound: valid plus actually true premises',
        'A valid argument can reach a false conclusion',
        '"Valid" means structure, never "true"',
      ],
      closing: 'Spot the difference, and bad arguments stop fooling you.',
    },
    dur: 2.8,
  },
];
