import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic metaphysics-being-23, "When Do Parts Make a Whole?"
// Theme: FIVE PLANKS THAT LEAVE ONE HULL AND ARRIVE IN ANOTHER.
//
// The Ship of Theseus is nearly always told as a riddle with a withheld answer,
// which is the one telling that teaches nothing. What it actually shows is that
// the word "same" has been doing two jobs at once, and the two jobs only come
// apart when somebody bothers to keep the old wood.
//
// So the picture conserves matter. Every plank that empties out of the left hull
// fills in on the right, driven by one number, because the reader has to be able
// to SEE that there is no third ship and nothing was created — the puzzle is
// entirely about how to describe a fixed pile of wood.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap the ship the same-matter view calls the
//     original. The repaired ship is the rival, because it has the name, the
//     berth and the crew, and none of those are matter (H66).
//   · beat 7  a PLOT — draw how the continuity view rates the ship as the planks
//     come out. A pick cannot express a curve, and this claim IS a curve.
// ─────────────────────────────────────────────────────────────────────────────

export interface Met23Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The two hulls, masts and labels, 0…1. */ ships?: number;
  /** How much of the old wood has moved across, 0…1. */ swap?: number;
  /** The second hull, being built out of the cast-offs, 0…1. */ built?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Met23Beat[] = [
  {
    p: 25, x: 200, ships: 1,
    text: 'Consider a ship kept in service for centuries. Whenever a plank rots, it’s removed and replaced with a new one.',
    dur: 4.8,
  },
  {
    p: 443, x: 200, ships: 1, swap: 1,
    text: 'Eventually no original plank remains. The ship keeps the same name, berth and crew, but none of the original wood.',
    cite: 'The repaired ship',
    dur: 4.6,
  },
  {
    p: 379, x: 132, ships: 1, swap: 1, built: 1,
    text: 'Thomas Hobbes extended the puzzle. Suppose someone kept every discarded plank and reassembled them into a second ship.',
    dur: 4.6,
  },
  {
    p: 457, x: 132, ships: 1, swap: 1, built: 1, live: 1,
    interact: {
      prompt: 'Which ship is made of the wood that first went to sea?',
      explain: 'The reassembled ship, built from the discarded planks. That fact alone doesn’t settle which ship is the original. The repaired ship kept the name, the berth and the crew, and none of those is wood.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 467, x: 132, ships: 1, swap: 1, built: 1,
    text: 'Two tests of sameness, which normally agree, come apart here. Continuous use favours the repaired ship.',
    cite: 'Two tests of sameness',
    dur: 1.9,
  },
  {
    p: 467, x: 132, ships: 1, swap: 1, built: 1,
    text: 'Sameness of material favours the reassembled ship. No further fact about the ships decides between the two tests.',
    dur: 2.5,
  },
  {
    p: 139, x: 268, ships: 1, swap: 1, built: 1,
    quote: {
      id: 'lq-metaphysics-being-23-2',
      text: 'One side held that the ship remained the same, and the other contended that it was not the same.',
      author: 'Plutarch',
      work: 'Life of Theseus',
      era: 'c. 75 CE',
      branchSlugs: ['metaphysics'],
    },
    dur: 4.0,
  },
  {
    p: 13, x: 268, ships: 1, swap: 1, built: 1,
    text: 'The puzzle rests on a deeper question, the special composition question. When do many parts compose one object?',
    dur: 2.9,
  },
  {
    p: 13, x: 268, ships: 1, swap: 1, built: 1,
    text: 'A pile of planks is not a ship, although it contains the same material.',
    dur: 1.8,
  },
  {
    p: 41, x: 268, ships: 1, swap: 1, built: 1,
    interact: {
      prompt: 'Which curve shows how the continuity view rates the repaired ship as planks are replaced?',
      plot: {
        axis: 'STILL THE SHIP',
        cols: ['NONE OUT', 'A QUARTER', 'HALF', 'MOST', 'ALL OUT'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'stays', profile: [1, 0.95, 0.9, 0.86, 0.82], reads: 'the same ship after every replacement', correct: true },
          { id: 'slides', profile: [1, 0.75, 0.5, 0.25, 0.02], reads: 'less the ship with each plank replaced' },
          { id: 'cliff', profile: [1, 0.98, 0.96, 0.92, 0.04], reads: 'the ship until the last plank is replaced' },
        ],
      },
      explain: 'The same ship after every replacement. On the continuity view, slow repair during use keeps the ship the same ship. So no single plank matters, and no last plank ends it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Criteria for Sameness',
      points: [
        'Persistence: how a thing survives change over time',
        'Continuity of use and original material can disagree',
        'Composition: when many parts make up one object',
        'Some identity puzzles may have no further fact to find',
      ],
      closing: 'The word “same” can express two different criteria. Usually they agree, and the Ship of Theseus is a case where they diverge.',
    },
    dur: 3.6,
  },
];
