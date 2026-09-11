import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic ethics-ethics-28, "When Your Rule Meets Your Gut"
// Theme: TWO BLOCKS ON ONE RAIL, MEETING WHEREVER THE GROUND WAS GIVEN.
//
// Reflective equilibrium is a method rather than a verdict, so the stage draws
// the METHOD: two things that have to end up next to each other, and a fixed
// amount of travelling between them. They always meet. What the reader decides
// is who walked.
//
// The distance never changes, which is what stops the picture arguing for one
// side. A reader who lets the principle stand still has not saved it; they have
// simply made the intuition do all the moving.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps which of the two
//     always gets its way. On the stage because both are sitting there and the
//     honest answer is that neither has a standing claim.
//   · beat 8  a SPLIT — the seam is the principle's share of the ground given.
//     Both blocks slide as the seam moves, so a reader who refuses to bend a rule
//     watches their conscience travel the whole way instead.
// ─────────────────────────────────────────────────────────────────────────────

export interface Ethics28Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the rail under the two blocks is drawn. */ rail?: number;
  /** 1 = the two blocks stand on it. */ blocks?: number;
  /** The principle's share of the ground given, 0…1. */ give?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Ethics28Beat[] = [
  {
    p: 427, x: 24, rail: 1,
    text: 'Your principle says yes. Your gut says no, and says it loudly.',
    dur: 4.4,
  },
  {
    p: 176, x: 24, rail: 1, blocks: 1, give: 0.5,
    text: 'A principle says “always maximise happiness”. A judgement about a case says “framing an innocent man is monstrous”.',
    dur: 5.0,
  },
  {
    p: 440, x: 24, rail: 1, blocks: 1, give: 0.06,
    text: 'Sometimes the two collide. One of them has to move, and the argument is about which.',
    dur: 4.8,
  },
  {
    p: 263, x: 24, rail: 1, blocks: 1, give: 0.94,
    text: 'Rawls proposed going back and forth. You revise the rule, then the judgement, then the rule again.',
    dur: 5.0,
  },
  {
    p: 169, x: 24, rail: 1, blocks: 1, give: 0.5, plates: 1, live: 1,
    interact: {
      prompt: 'Tap which of the two always gets its way.',
      explain: 'Neither always wins. A vivid feeling can be bias in disguise, and a tidy principle can be too tidy for the world. Equilibrium comes from moving both until they fit.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 456, x: 78, rail: 1, blocks: 1, give: 0.5,
    text: 'Many obvious feelings turned out to be prejudice. Many elegant rules turned out to be too clean.',
    dur: 5.0,
  },
  {
    p: 435, x: 78, rail: 1, blocks: 1, give: 0.5,
    quote: {
      id: 'lq-ethics-ethics-28-1',
      text: 'By going back and forth, sometimes altering the conditions of the contract, at others withdrawing our judgments, I assume that eventually we shall find a description that best fits our considered judgments.',
      author: 'John Rawls',
      work: 'A Theory of Justice',
      era: '1971',
      philosopherId: 'john-rawls',
      branchSlugs: ['ethics'],
    },
    dur: 5.0,
  },
  {
    p: 452, x: 78, rail: 1, blocks: 1, give: 0.5,
    text: 'The aim is a web that holds together. Nothing in it is the unshakeable floor.',
    dur: 4.8,
  },
  {
    p: 173, x: 78, rail: 1, blocks: 1,
    interact: {
      prompt: 'Which side should give ground to reach equilibrium?',
      split: {
        left: 'THE PRINCIPLE',
        right: 'YOUR GUT',
        start: 0.06,
        zones: [
          { id: 'rule', upto: 0.3, reads: 'the feeling yields and the rule never bends' },
          { id: 'both', upto: 0.7, reads: 'both move, and they meet in between', correct: true },
          { id: 'gut', upto: 1, reads: 'the rule bends to whatever you feel' },
        ],
      },
      explain: 'Both move. Rawls called the method going back and forth. Test the principle against considered judgements, and the judgements against the principle. Letting one side never bend is a foundation rather than an equilibrium.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 319, x: 78, rail: 1, blocks: 1, give: 0.5,
    summary: {
      title: 'Rule Against Conscience',
      points: [
        'Principles and particular judgements sometimes collide',
        'Reflective equilibrium revises both until they cohere',
        'Neither side automatically wins the argument',
        'The goal is a stable web, not one unshakeable axiom',
      ],
      closing: 'Good ethical thinking is less a one-way proof than a patient negotiation between your rules and your conscience.',
    },
    dur: 5.0,
  },
];
