import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-20, "Living Together While Disagreeing"
// Theme: TWO STACKS THAT SHARE NOTHING, AND ONE NARROW SHELF BOTH CAN REACH.
//
// Public reason is easy to state and easy to misread as "keep your beliefs to
// yourself", so the scene is built to refuse that reading. Both stacks stay on
// the stage, at full strength, for the whole lesson. Nobody is asked to give
// anything up. The only question is what can be put on the shelf in the middle,
// because that is the part that is going to be enforced on both of them.
//
// The shelf is deliberately drawn SMALL. A reader who ends up thinking public
// reason is generous has not understood the cost of it.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — three candidate reasons for the same law, tap the
//     one that can go on the shelf. Both decoys are sincere and one of them is
//     probably true; they fail on availability, not on merit (H66).
//   · beat 7  two CARDS — what toleration actually requires, against the version
//     that sounds nicer and says nothing.
// ─────────────────────────────────────────────────────────────────────────────

export interface Pol20Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The two private stacks, left and right, 0…1. */ stacks?: number;
  /** The three candidate reasons in the middle, 0…1. */ cands?: number;
  /** The shelf beneath them, 0…1. */ shelf?: number;
  /** The winning reason resting on the shelf, 0…1. */ landed?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Pol20Beat[] = [
  {
    p: 25, x: 200, stacks: 1,
    text: 'Two neighbours. Everything either of them believes about how to live is in one of those stacks.',
    dur: 4.2,
  },
  {
    p: 159, x: 200, stacks: 1,
    text: 'They overlap almost nowhere, and neither is going to talk the other round. This is not a failure.',
    cite: 'Reasonable pluralism',
    dur: 3.2,
  },
  {
    p: 416, x: 200, stacks: 1,
    text: 'Rawls thought it was the normal result of free thinking.',
    dur: 1.8,
  },
  {
    p: 2, x: 132, stacks: 1, shelf: 1, cands: 1,
    text: 'They still have to share a street, and a law about the street will land on both of them.',
    dur: 4.2,
  },
  {
    p: 383, x: 132, stacks: 1, shelf: 1, cands: 1,
    text: 'So the shelf. A reason for the law has to be one the other person could weigh without first joining you.',
    cite: 'Public reason',
    dur: 4.6,
  },
  {
    p: 4, x: 132, stacks: 1, shelf: 1, cands: 1, live: 1,
    interact: {
      prompt: 'Tap the reason that can go on the shelf.',
      explain: 'Safety. The other two might both be true, and one of them is somebody\'s deepest conviction, but neither can be checked by a person who does not already share it. The shelf is not for the best reasons. It is for the ones everybody can get at.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 268, stacks: 1, shelf: 1, cands: 1, landed: 1,
    quote: {
      id: 'lq-political-political-20-2',
      text: 'A plurality of reasonable yet incompatible comprehensive doctrines is the normal result of the exercise of human reason within free institutions.',
      author: 'John Rawls',
      work: 'Political Liberalism',
      era: '1993',
      philosopherId: 'john-rawls',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 21, x: 268, stacks: 1, shelf: 1, cands: 1, landed: 1,
    text: 'Look at the size of the shelf. Almost everything either side cares about stayed in its own stack.',
    dur: 4.2,
  },
  {
    p: 41, x: 268, stacks: 1, shelf: 1, cands: 1, landed: 1,
    interact: {
      prompt: 'What does tolerating a view actually require of you?',
      sort: {
        chip: 'a view you detest',
        bins: [
          { id: 'power', label: 'no law against it', reads: 'do not reach for the law against it', correct: true },
          { id: 'quiet', label: 'say nothing', reads: 'say nothing against it' },
          { id: 'agree', label: 'admit it might be right', reads: 'allow that the view might be right' },
        ],
      },
      explain: 'Not reaching for the law. Toleration is a restraint on force, not a change of mind, and it is only ever tested on views you think are wrong. The other card describes open-mindedness, which is a different virtue and costs nothing here.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Narrow Shelf',
      points: [
        'Deep disagreement is what free thinking produces, not a fault',
        'Coercive law needs reasons the coerced can weigh',
        'A sincere reason can still be unavailable to your neighbour',
        'Toleration restrains power; it does not require agreement',
      ],
      closing: 'Both stacks are still standing. That is the point, and it is why the shelf is so small.',
    },
    dur: 3.4,
  },
];
