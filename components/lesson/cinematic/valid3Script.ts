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
    p: 167, link: 1, form: 0,
    text: 'Two tests, and never confuse them. An argument is VALID when its shape will not let true premises lead to a false conclusion.',
    cite: 'Validity vs Soundness',
    dur: 3.2,
  },
  {
    p: 167, link: 1, form: 0,
    text: 'It is SOUND when it is valid and the premises are actually true.',
    dur: 1.8,
  },
  {
    p: 26, link: 1, stamp: 1, form: 1,
    text: 'All toasters are gold. All gold things are time machines.',
    cite: 'Valid but absurd',
    dur: 2,
  },
  {
    p: 26, link: 1, stamp: 1, form: 1,
    text: 'So all toasters are time machines. The form is flawless — perfectly VALID.',
    dur: 2.6,
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
      philosopherId: 'bertrand-russell',
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
    p: 383, link: 1, stamp: 1, flaw: 1, form: 1,
    text: 'Validity tests the form; soundness tests form and facts. To resist a valid argument, you cannot attack the logic — you must reject a premise.',
    dur: 4.0,
  },
  {
    p: 4, link: 1, stamp: 0, flaw: 0, form: 0,
    interact: {
      prompt: 'Place the token on grass is green, so the sky is blue.',
      field: {
        xLo: 'THE FORM IS BROKEN', xHi: 'THE FORM IS GOOD',
        yLo: 'THE CONCLUSION IS FALSE', yHi: 'THE CONCLUSION IS TRUE',
        start: [0.76, 0.24],
        quads: [
          { id: 'luck', x: 0, y: 1, reads: 'broken form, true conclusion', correct: true },
          { id: 'valid', x: 1, y: 1, reads: 'good form, true conclusion' },
          { id: 'premise', x: 1, y: 0, reads: 'good form, false conclusion' },
          { id: 'bad', x: 0, y: 0, reads: 'broken form, false conclusion' },
        ],
      },
      explain: 'Top left. Both halves of that sentence are true and neither has anything to do with the other, so the conclusion is true and the link is missing. The axis going up cannot decide validity: a true conclusion is something an argument can arrive at by accident.',
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
