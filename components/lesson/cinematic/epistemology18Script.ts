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
}

export const BEATS: Epi18Beat[] = [
  {
    p: 25, x: 200, rails: 1, ev: 0,
    text: 'Two claims, and you believe one of them far more than the other. That is the top rail and the bottom one.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, rails: 1, grip: 1, ev: 0,
    text: 'Look at what is holding each marker. The round earth is tied to almost everything else you know. The keys are tied to a memory of putting them down.',
    dur: 5.0,
  },
  {
    p: 45, x: 132, rails: 1, grip: 1, ev: 0.3,
    text: 'Now the same piece of evidence arrives at both. Somebody you trust tells you it is not so.',
    cite: 'One fact, two claims',
    dur: 4.4,
  },
  {
    p: 13, x: 132, rails: 1, grip: 1, ev: 0.3,
    text: 'It should not move them the same distance. Nothing about the evidence decides that.',
    dur: 3.8,
  },
  {
    p: 4, x: 132, rails: 1, grip: 1, ev: 0.3, live_d: 1,
    interact: {
      prompt: 'Push the same evidence at both claims. How far does each one move?',
      drag: {
        lo: 'A PASSING REMARK',
        hi: 'A CAREFUL WITNESS',
        start: 0.12,
        zones: [
          { id: 'weak', upto: 0.3, reads: 'the loose one twitches' },
          { id: 'mid', upto: 0.65, reads: 'one has moved, one has not' },
          { id: 'strong', upto: 1, reads: 'the loose one has swung right over', correct: true },
        ],
      },
      explain: 'Same push, two different distances. What decides how far a fact moves you is not the fact. It is how firmly you were already holding the claim. The round-earth marker barely shifts because almost everything else you know is holding it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, rails: 1, grip: 1, ev: 1,
    text: 'This is the rule Bayes wrote down. A new fact moves you in proportion to how loosely you were holding on.',
    cite: 'Updating',
    dur: 4.6,
  },
  {
    p: 137, x: 268, rails: 1, grip: 1, ev: 1,
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
      prompt: 'One study contradicts a very well established result. What now?',
      cards: [
        { text: 'Doubt the study first', correct: true },
        { text: 'Drop the old result', correct: false },
      ],
      explain: 'Doubt the study first, and that is not stubbornness. A result held up by a thousand others is likelier to survive than one paper is to be right. If the study replicates, the balance changes, and then so should you.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'How Far a Fact Moves You',
      points: [
        'How much to update depends on how firmly you already believed',
        'The same evidence moves a loose belief further than a settled one',
        'Refusing to move at all is not caution, it is closing the rail',
        'Strong claims need evidence in proportion to what holds them',
      ],
      closing: 'Ask what is holding the marker before you decide the push was too weak.',
    },
    dur: 3.4,
  },
];
