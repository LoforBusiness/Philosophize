import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic logic-arguments-29, "Who Has to Prove It?"
// Theme: ONE BEAM ON A PIVOT, AND THE WEIGHT NOBODY WANTS TO CARRY.
//
// A burden is a weight, so the stage draws one and lets the reader put it down
// somewhere. Whichever end takes it goes down, which is the whole rule made
// visible: the side carrying the burden is the side with work to do.
//
// The beam is empty at rest and level. A question nobody has argued yet is not a
// tie between two claims — it is a scale with nothing on it, and drawing it that
// way is what makes the null position a picture rather than a slogan.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what is wrong
//     with you cannot disprove it. On the stage because the trick is a move made
//     on the beam, and the beam is in front of them.
//   · beat 8  a SPLIT — the burden divided between the claimant and the doubter.
//     The weight slides and the beam tips, so a reader who splits it evenly
//     watches a scale that says an unsupported claim is halfway to true.
// ─────────────────────────────────────────────────────────────────────────────

export interface Logic29Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the pivot, the beam and the two names are drawn. */ beam?: number;
  /** 1 = the weight has been put on the beam. */ load?: number;
  /** The claimant's share of the burden, 0…1. */ side?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Logic29Beat[] = [
  {
    p: 428, x: 24, beam: 1,
    text: 'A china teapot orbits the sun, between Earth and Mars. Prove it doesn’t.',
    dur: 4.8,
  },
  {
    p: 178, x: 24, beam: 1,
    text: 'You cannot. Bertrand Russell picked the example because nobody could, and that settles nothing.',
    dur: 5.0,
  },
  {
    p: 447, x: 24, beam: 1, load: 1, side: 0.9,
    text: 'The burden of proof is the job of backing a claim up. It falls on whoever asserts.',
    dur: 5.0,
  },
  {
    p: 268, x: 24, beam: 1, load: 1, side: 0.5,
    text: 'Before anybody has argued, the beam is empty. Withholding belief is the resting state.',
    dur: 5.0,
  },
  {
    p: 165, x: 24, beam: 1, load: 1, side: 0.5, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what is wrong with you cannot disprove it.',
      explain: 'It hands the work to the wrong side. Failing to refute a claim is not evidence for the claim. A guess doesn’t become a fact by being hard to check. The move is a burden shift, and naming it out loud is the whole defence.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 461, x: 80, beam: 1, load: 1, side: 0.9,
    text: 'Somebody keeps an invisible dragon in the garage. Every test you propose is explained away.',
    dur: 5.0,
  },
  {
    p: 440, x: 80, beam: 1, load: 1, side: 0.9,
    quote: {
      id: 'lq-logic-arguments-29-1',
      text: 'If I were to assert that a china teapot revolves about the sun, nobody would be able to disprove my assertion.',
      author: 'Bertrand Russell',
      work: 'Is There a God?',
      era: '1952',
      philosopherId: 'bertrand-russell',
      branchSlugs: ['logic'],
    },
    dur: 5.0,
  },
  {
    p: 457, x: 80, beam: 1, load: 1, side: 0.9,
    text: 'Sagan argues that a dragon no test can reach is the same picture as an empty garage.',
    dur: 5.0,
  },
  {
    p: 175, x: 80, beam: 1, load: 1,
    interact: {
      prompt: 'Where does the burden of proof sit?',
      split: {
        left: 'THE CLAIMANT',
        right: 'THE DOUBTER',
        start: 0.1,
        zones: [
          { id: 'doubter', upto: 0.35, reads: 'the doubter has to disprove the dragon' },
          { id: 'shared', upto: 0.7, reads: 'both sides owe exactly the same' },
          { id: 'claimant', upto: 1, reads: 'whoever makes the claim brings the evidence', correct: true },
        ],
      },
      explain: 'Almost all of it on the claimant. An assertion is what creates the debt, and doubt takes on none of it. Splitting the burden evenly would make every unsupported claim halfway to true. That’s how the dragon gets into the garage.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 307, x: 80, beam: 1, load: 1, side: 0.9,
    summary: {
      title: 'Who Has to Prove It',
      points: [
        'The burden falls on whoever makes the claim',
        'The default is withholding belief, not assuming truth',
        'You cannot disprove it shifts the burden unfairly',
        'No evidence means unsupported, never proven',
      ],
      closing: 'Never let somebody make their guess your problem to refute. Ask them for the proof.',
    },
    dur: 5.0,
  },
];
