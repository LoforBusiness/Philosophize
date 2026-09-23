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
  /** 1 = a ring clasps the seam: the two now cohere, nothing fixed either side. */ link?: number;
};

export const BEATS: Ethics28Beat[] = [
  {
    p: 427, x: 24, rail: 1,
    text: 'A principle you accept can approve an act that your gut rejects. That gut reaction is an intuition, a judgement about a particular case.',
    dur: 4.4,
  },
  {
    p: 176, x: 24, rail: 1, blocks: 1, give: 0.5,
    text: 'A principle says “always maximise happiness”. A judgement about a case says “framing an innocent man is monstrous”.',
    dur: 5.0,
  },
  {
    p: 440, x: 24, rail: 1, blocks: 1, give: 0.06,
    text: 'When the two conflict, consistency requires revising at least one of them. The question is which.',
    dur: 4.8,
  },
  {
    p: 263, x: 24, rail: 1, blocks: 1, give: 0.94,
    text: 'John Rawls’s answer is reflective equilibrium. You adjust the principle and the judgement in turn until they fit.',
    dur: 5.0,
  },
  {
    p: 169, x: 24, rail: 1, blocks: 1, give: 0.5, plates: 1, live: 1,
    interact: {
      prompt: 'In reflective equilibrium, which of the two always takes priority?',
      explain: 'Neither of them. A strong intuition may be a bias, and a neat principle may miss details that matter. So either one may be revised until the two fit.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 456, x: 78, rail: 1, blocks: 1, give: 0.5,
    text: 'Many intuitions once thought obvious proved to be prejudice. Many elegant principles proved too simple for real cases.',
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
    p: 452, x: 78, rail: 1, blocks: 1, give: 0.5, link: 1,
    text: 'The goal is coherence between principles and judgements. No belief in the system is a fixed foundation beyond revision.',
    dur: 4.8,
  },
  {
    p: 173, x: 78, rail: 1, blocks: 1,
    interact: {
      prompt: 'In reflective equilibrium, which side gives way?',
      sort: {
        chip: 'WHAT IS REVISED',
        bins: [
          { id: 'intuit', label: 'THE INTUITION', reads: 'the intuition, never the principle' },
          { id: 'both', label: 'EITHER ONE', reads: 'either one, until the two agree', correct: true },
          { id: 'princ', label: 'THE PRINCIPLE', reads: 'the principle, never the intuition' },
        ],
      },
      explain: 'Either one. Neither side is fixed: a principle that condemns something you\'re certain about is suspect, and an intuition that survives nothing else you believe is suspect too. The method is to keep adjusting until they hold together.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 319, x: 78, rail: 1, blocks: 1, give: 0.5,
    summary: {
      title: 'Reflective Equilibrium',
      points: [
        'Principles and particular judgements sometimes collide',
        'Reflective equilibrium revises both until they cohere',
        'Neither principles nor intuitions automatically take priority',
        'The goal is coherence, not a single unrevisable axiom',
      ],
      closing: 'On this method, a moral view is justified by coherence, not by deduction from one first principle.',
    },
    dur: 5.0,
  },
];
