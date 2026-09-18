import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-18, "How Much Should One Fact Change Your Mind?"
// Theme: ONE PUSH, TWO MARKERS, AND ONLY THE LOOSE ONE MOVES.
//
// Updating is a lesson about a RATIO, and a ratio needs two of something on the
// stage at once. So there are two rails: a claim held down by everything else
// you know, and a claim you are barely holding at all. The same evidence is
// pushed at both, and the reader watches the distances come out different.
//
// That is the whole of Bayes that a beginner needs, and it is the half that
// people get wrong in public: "the evidence is the same, so we should update the
// same amount". The picture makes the missing variable visible before it is
// named — the grip on each marker is drawn as the thickness of what is holding
// it, from the first beat.
//
// GAMIFIED SHAPE:
//   · beat 4  a DRAG — the reader pushes the evidence themselves, at both rails
//     at once, and the readout tells them what is happening rather than scoring
//     them. Doing it is the argument; watching it would be a diagram.
//   · beat 7  two CARDS — the practical case, where the right answer sounds
//     like stubbornness and is not (H66).
// ─────────────────────────────────────────────────────────────────────────────

export interface Epi18Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** Both rails and their markers are drawn, 0…1. */ rails?: number;
  /** The grip on each marker, drawn as what is holding it, 0…1. */ grip?: number;
  /** How hard the evidence is pushing, 0…1. */ ev?: number;
  /** 1 = the push is the reader's this beat. */ live_d?: number;
  /** 1 = ring the keys claim's own caption, naming which belief is meant. */ weakRing?: number;
  /** 1 = a brace across both tethers, showing one report meeting two different grips. */ gripBrace?: number;
}

export const BEATS: Epi18Beat[] = [
  {
    p: 25, x: 200, rails: 1, ev: 0,
    text: 'Consider two claims: the earth is round, and your keys are in the drawer. You believe the first far more firmly than the second.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, rails: 1, grip: 1, ev: 0,
    text: 'The claim that the earth is round is supported by almost everything else you know.',
    dur: 3.1,
  },
  {
    p: 266, x: 200, rails: 1, grip: 1, ev: 0, weakRing: 1,
    text: 'The claim about your keys rests on a single memory of putting them there.',
    dur: 1.9,
  },
  {
    p: 447, x: 132, rails: 1, grip: 1, ev: 0.3,
    text: 'Now suppose the same evidence arrives against both. Someone you trust tells you that each claim is false.',
    cite: 'One report, two claims',
    dur: 4.4,
  },
  {
    p: 383, x: 132, rails: 1, grip: 1, ev: 0.3, gripBrace: 1,
    text: 'The same report shouldn’t move both beliefs the same distance. How far a belief moves depends on more than the report.',
    dur: 3.8,
  },
  {
    p: 165, x: 132, rails: 1, grip: 1, ev: 0.3, live_d: 1,
    interact: {
      prompt: 'When a careful witness contradicts both beliefs, how far does each one move?',
      drag: {
        lo: 'A PASSING REMARK',
        hi: 'A CAREFUL WITNESS',
        start: 0.12,
        zones: [
          { id: 'weak', upto: 0.3, reads: 'the keys belief shifts a little' },
          { id: 'mid', upto: 0.65, reads: 'the keys belief moves, the round earth doesn’t' },
          { id: 'strong', upto: 1, reads: 'the keys belief flips, the round earth holds', correct: true },
        ],
      },
      explain: 'The keys belief flips, the round earth holds. The same report moves the two beliefs different distances, because one began far more probable than the other. Almost everything else you know supports the round earth.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 177, x: 132, rails: 1, grip: 1, ev: 1,
    text: 'Bayesian reasoning, named after Thomas Bayes, makes this exact. The same evidence barely moves a belief you’re nearly sure of, but it can overturn a weak one.',
    cite: 'Bayesian updating',
    dur: 4.6,
  },
  {
    p: 456, x: 268, rails: 1, grip: 1, ev: 1,
    quote: {
      id: 'lq-epistemology-knowledge-18-2',
      text: 'A wise man proportions his belief to the evidence.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      philosopherId: 'david-hume',
      branchSlugs: ['epistemology'],
    },
    dur: 3.4,
  },
  {
    p: 41, x: 268, rails: 1, grip: 1, ev: 1,
    interact: {
      prompt: 'If one study contradicts a well-established result, which should you doubt first?',
      cards: [
        { text: 'Doubt the new study first', correct: true },
        { text: 'Abandon the established result', correct: false },
      ],
      explain: 'Doubt the new study first. A result supported by many independent findings is more likely to be right than a single study. If the study is replicated, the balance of evidence changes, and so should your belief.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'How Far Evidence Should Move You',
      points: [
        'How much to update depends on how firmly you already believed',
        'The same evidence moves a loose belief further than a settled one',
        'Refusing to update at all isn’t caution but dogmatism',
        'Overturning a well-supported claim requires correspondingly strong evidence',
      ],
      closing: 'Before judging a piece of evidence, ask how much already supports the belief it challenges.',
    },
    dur: 3.4,
  },
];
