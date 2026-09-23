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
  /** 1 = an attempt jostles the beam — it springs back level, unmoved. */ test?: number;
  /** 1 = the weight on the beam turns from a solid block to a dashed outline — no different from carrying nothing. */ hollow?: number;
};

export const BEATS: Logic29Beat[] = [
  {
    p: 428, x: 24, beam: 1,
    text: 'Suppose someone claims that a china teapot orbits the sun between Earth and Mars, too small to be seen.',
    dur: 4.8,
  },
  {
    p: 178, x: 24, beam: 1, test: 1,
    text: 'No one could disprove the claim, and Bertrand Russell chose the example for that reason. Yet being impossible to disprove gives no reason to believe a claim.',
    dur: 5.0,
  },
  {
    p: 447, x: 24, beam: 1, load: 1, side: 0.9,
    text: 'The burden of proof is the obligation to support a claim with evidence. It falls on whoever asserts.',
    dur: 5.0,
  },
  {
    p: 268, x: 24, beam: 1, load: 1, side: 0.5,
    text: 'Before any evidence is offered, the default is to withhold belief. Withholding belief is neither acceptance nor denial.',
    dur: 5.0,
  },
  {
    p: 165, x: 24, beam: 1, load: 1, side: 0.5, plates: 1, live: 1,
    interact: {
      prompt: 'What is wrong with the reply “you can’t disprove it”?',
      explain: 'It hands over the work. The reply shifts the burden of proof from the claimant to the doubter. Failing to refute a claim isn’t evidence for it, and treating it as evidence is the appeal to ignorance.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 461, x: 80, beam: 1, load: 1, side: 0.9,
    text: 'Carl Sagan describes someone who says an invisible dragon lives in their garage. Each test for the dragon is explained away.',
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
    p: 457, x: 80, beam: 1, load: 1, side: 0.9, hollow: 1,
    text: 'Sagan argues that a dragon no test can detect is no different from no dragon at all.',
    dur: 5.0,
  },
  {
    p: 175, x: 80, beam: 1, load: 1,
    interact: {
      prompt: 'As a claim gets more extraordinary, which shape does the burden take?',
      plot: {
        cols: ['ORDINARY', 'SURPRISING', 'EXTRAORDINARY'],
        axis: 'EVIDENCE OWED',
        start: [0.3, 0.3, 0.3],
        shapes: [
          { id: 'rise', profile: [0.12, 0.3, 0.55, 0.8, 1], reads: 'it rises with the claim', correct: true },
          { id: 'flat', profile: [0.5, 0.5, 0.5, 0.5, 0.5], reads: 'the same either way' },
          { id: 'fall', profile: [1, 0.75, 0.5, 0.25, 0.08], reads: 'the bolder the claim, the less is owed' },
        ],
      },
      explain: 'It rises with the claim. The burden sits with whoever asserts something, and it grows with how much the claim asks you to give up. A dragon that leaves no trace asks a great deal and offers nothing, which is why the doubter owes no disproof.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 307, x: 80, beam: 1, load: 1, side: 0.9,
    summary: {
      title: 'The Burden of Proof',
      points: [
        'The burden falls on whoever makes the claim',
        'The default is withholding belief, not assuming truth',
        '“You can’t disprove it” shifts the burden',
        'Failure to disprove a claim isn’t evidence for it',
      ],
      closing: 'When a claim lacks evidence, ask the claimant for support rather than trying to refute it.',
    },
    dur: 5.0,
  },
];
