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
    text: 'A ship kept in service for centuries. Whenever a plank rots, the dockyard takes it out and puts a new one in.',
    dur: 4.8,
  },
  {
    p: 2, x: 200, ships: 1, swap: 1,
    text: 'Do that long enough and no original plank is left. Same name, same berth, same crew, no old wood.',
    cite: 'The repaired ship',
    dur: 4.6,
  },
  {
    p: 45, x: 132, ships: 1, swap: 1, built: 1,
    text: 'Then a collector admits he kept every plank they threw away, and has built a second ship out of them.',
    dur: 4.6,
  },
  {
    p: 4, x: 132, ships: 1, swap: 1, built: 1, live: 1,
    interact: {
      prompt: 'Tap the ship made of the wood that first went to sea.',
      explain: 'The one on the right, built from the cast-offs. Notice how little that settles. The left hull kept the name, the berth and the crew, and none of those are wood, which is exactly the split the puzzle is prising open.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, ships: 1, swap: 1, built: 1,
    text: 'Two tests that normally agree. Unbroken use points left. Original wood points right. Nothing on the stage decides between the two.',
    cite: 'Two readings of same',
    dur: 4.4,
  },
  {
    p: 137, x: 268, ships: 1, swap: 1, built: 1,
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
    text: 'Under it sits a harder question. When do parts make one thing at all? A pile of planks is not a ship.',
    dur: 4.6,
  },
  {
    p: 41, x: 268, ships: 1, swap: 1, built: 1,
    interact: {
      prompt: 'Draw how the continuity view rates the repaired hull.',
      plot: {
        axis: 'STILL THE SHIP',
        cols: ['NONE OUT', 'A QUARTER', 'HALF', 'MOST', 'ALL OUT'],
        start: [0.5, 0.5, 0.5, 0.5, 0.5],
        shapes: [
          { id: 'stays', profile: [1, 0.95, 0.9, 0.86, 0.82], reads: 'it stays the ship throughout', correct: true },
          { id: 'slides', profile: [1, 0.75, 0.5, 0.25, 0.02], reads: 'it fades out as the wood goes' },
          { id: 'cliff', profile: [1, 0.98, 0.96, 0.92, 0.04], reads: 'one last plank ends it' },
        ],
      },
      explain: 'Nearly flat. Continuity says what makes it the ship is unbroken service and gradual repair. So no single plank matters, and the last one matters no more than the first. The cliff is what you draw if you think there is a hidden line somewhere.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Two Jobs For One Word',
      points: [
        'Persistence: surviving change over time',
        'Unbroken use and original matter can point different ways',
        'Composition: when parts add up to one thing',
        'Some puzzles have no hidden fact waiting to be found',
      ],
      closing: 'The same thing can quietly mean two things, and the wood is where they part.',
    },
    dur: 3.6,
  },
];
