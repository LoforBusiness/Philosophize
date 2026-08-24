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
//   · beat 7  a FIELD — the reader places the good thinker on the two settings.
//     Four quadrants, four recognisable characters, and the pad is what makes
//     open and careful visibly independent.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi23Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The hopper, sieve and tray, 0…1. */ sieve?: number;
  /** How wide the mouth is, 0…1. */ mouth?: number;
  /** How fine the mesh is, 0…1. */ mesh?: number;
  /** How far the claims have fallen through, 0…1. */ fall?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Epi23Beat[] = [
  {
    p: 25, x: 200, sieve: 1, mouth: 0.35, mesh: 0.3,
    text: 'Claims arrive all day. What you end up believing is whatever is left in the tray.',
    dur: 4.0,
  },
  {
    p: 2, x: 200, sieve: 1, mouth: 0.9, mesh: 0.3, fall: 1,
    text: 'Open the mouth and more gets a hearing. Nothing about that decides how much you keep.',
    cite: 'Two settings, not one',
    dur: 4.4,
  },
  {
    p: 45, x: 132, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1,
    text: 'Tighten the mesh and most of it goes through the sides. The mouth has not moved.',
    dur: 4.0,
  },
  {
    p: 4, x: 132, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1, live: 1,
    interact: {
      prompt: 'Tap the part that decides how much gets thrown out.',
      explain: 'The mesh. The mouth decides what gets a hearing and the mesh decides what survives it, and people run the two together — "open-minded" is used for both, which is how somebody ends up proud of believing everything they were told.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, sieve: 1, mouth: 0.14, mesh: 0.9, fall: 1,
    text: 'Close the mouth and the mesh has nothing to do. That is a person who is never wrong and never learns anything.',
    cite: 'The other failure',
    dur: 4.8,
  },
  {
    p: 137, x: 268, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1,
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
    p: 13, x: 268, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1,
    text: 'So the virtue is a pair of settings held at once, and neither one on its own is worth having.',
    dur: 4.2,
  },
  {
    p: 41, x: 268, sieve: 1, mouth: 0.9, mesh: 0.9, fall: 1,
    interact: {
      prompt: 'Place the good thinker on the two settings.',
      field: {
        xLo: 'HEARS LITTLE', xHi: 'HEARS EVERYTHING',
        yLo: 'CHECKS LOOSELY', yHi: 'CHECKS HARD',
        start: [0.24, 0.24],
        quads: [
          { id: 'shut', x: 0, y: 0, reads: 'incurious, and easily sold' },
          { id: 'crank', x: 1, y: 0, reads: 'the crank: all in, all kept' },
          { id: 'dogma', x: 0, y: 1, reads: 'the dogmatist: nothing gets a hearing' },
          { id: 'good', x: 1, y: 1, reads: 'hears everything, keeps almost none of it', correct: true },
        ],
      },
      explain: 'Top right, and the two corners next to it are the interesting ones. Wide and loose is the crank, who has heard every theory and believes them all. Narrow and tight is the dogmatist, whose standards are impeccable and never get used on anything new.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Mouth And The Mesh',
      points: [
        'Openness and rigour are two settings, not one',
        'Open with no rigour believes whatever arrives',
        'Rigour with no openness never tests anything new',
        'The virtue is holding both at once, and it is uncomfortable',
      ],
      closing: 'Hear everything and keep almost none of it. That is harder than either half alone.',
    },
    dur: 3.4,
  },
];
