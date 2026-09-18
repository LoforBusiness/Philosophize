import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-23, "The Character Of A Good Thinker"
// Theme: A SIEVE WITH TWO SETTINGS, AND WHAT IS LEFT IN THE TRAY.
//
// Virtue epistemology is a list of adjectives unless you can see the two things
// trading off, and they are genuinely two: how much you let IN, and how hard you
// check. Open and careful are not the same axis, which is why a sieve with a
// mouth and a mesh is the right object — you can widen one without touching the
// other, and every failure mode is a setting.
//
//   narrow mouth, coarse mesh  → you hear little and believe it
//   wide mouth, coarse mesh    → the crank: everything in, everything kept
//   narrow mouth, fine mesh    → the dogmatist: nothing gets a hearing
//   wide mouth, fine mesh      → hear everything, keep almost none of it
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — three parts, tap the one that does the throwing
//     out. The mouth is the tempting answer because it is the one people mean
//     when they say "open-minded" (H66).
//   · beat 7  a POLL — four recognisable characters, one per corner of the pad
//     this question used to be. The ballot replaced the pad when the pad was
//     retired (its corners had to be rebuilt from two axis labels before the
//     reader could even read the question), and the four options below are still
//     those corners, in the same order. The SCENE reads them back: each option
//     has a mouth setting and a mesh setting in `epistemology23Scene`, so
//     choosing a character drives the machine to that character's settings and
//     the reader watches the mouth close as they move from "hears everything" to
//     "the dogmatist". That is what keeps `open` and `careful` visibly
//     independent now that there is no pad to show it.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi23Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The hopper, sieve and tray, 0…1. */ sieve?: number;
  /** How wide the mouth is, 0…1. */ mouth?: number;
  /** How fine the mesh is, 0…1. */ mesh?: number;
  /** How far the claims have fallen through, 0…1. */ fall?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = a brace in the margin joining THE MOUTH and THE MESH, both settings at once. */ bothBrace?: number;
}

export const BEATS: Epi23Beat[] = [
  {
    p: 462, x: 200, sieve: 1, mouth: 0.35, mesh: 0.3,
    text: 'Virtue epistemology studies the traits of a good thinker. Model a mind as a sieve: the claims that reach its tray are what you believe.',
    dur: 4.0,
  },
  {
    p: 384, x: 200, sieve: 1, mouth: 0.9, mesh: 0.3, fall: 1,
    text: 'Open-mindedness widens the mouth, so more claims get a hearing. Nothing about that decides how much you keep.',
    cite: 'Two separate settings',
    dur: 4.4,
  },
  {
    p: 447, x: 132, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1,
    text: 'Intellectual rigour tightens the mesh, so fewer claims survive scrutiny. The mouth stays as wide as before.',
    dur: 4.0,
  },
  {
    p: 457, x: 132, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1, live: 1,
    interact: {
      prompt: 'Which part decides how many of the claims given a hearing are rejected?',
      explain: 'The mesh. The mouth decides which claims get a hearing, and the mesh decides which of them are kept. The word “open-minded” is used for both, so a credulous person can mistake believing everything for an open mind.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 380, x: 132, sieve: 1, mouth: 0.14, mesh: 0.9, fall: 1,
    text: 'With the mouth closed, the mesh has no claims to test. Such a thinker admits no new errors, and no new truths either.',
    cite: 'Closed-mindedness',
    dur: 4.8,
  },
  {
    p: 144, x: 268, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1,
    quote: {
      id: 'lq-epistemology-knowledge-23-2',
      text: 'It is the mark of an educated mind to be able to entertain a thought without accepting it.',
      author: 'Aristotle',
      work: 'attributed',
      era: 'c. 350 BC',
      philosopherId: 'aristotle',
      branchSlugs: ['epistemology'],
    },
    dur: 3.8,
  },
  {
    p: 383, x: 268, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1, bothBrace: 1,
    text: 'So intellectual virtue needs both settings at once. Openness without rigour is credulity, and rigour without openness is dogmatism.',
    dur: 4.2,
  },
  {
    p: 41, x: 268, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1,
    interact: {
      prompt: 'Which policy toward claims and arguments makes a good thinker?',
      poll: {
        options: [
          { id: 'shut', reads: 'keep inherited beliefs, distrust new ones', holders: ['Edmund Burke'] },
          { id: 'crank', reads: 'risk believing error, rather than miss a truth', holders: ['William James'] },
          { id: 'dogma', reads: 'set aside arguments you know are misleading', holders: ['Jeremy Fantl'] },
          { id: 'good', reads: 'hear every side, and keep what survives criticism', holders: ['John Stuart Mill', 'Karl Popper'], correct: true },
        ],
      },
      explain: 'Hear every side, and keep what survives criticism. This policy joins openness to rigour. Risking error for truth loosens the mesh, so false claims survive with the true.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Openness and Rigour',
      points: [
        'Open-mindedness and rigour are separate intellectual virtues',
        'Openness without rigour becomes credulity',
        'Rigour without openness becomes dogmatism',
        'A good thinker exercises both at once',
      ],
      closing: 'A good thinker gives every claim a hearing and keeps only what survives scrutiny. Holding both settings is harder than holding either.',
    },
    dur: 3.4,
  },
];
