import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-7, "Why Should the Future Resemble the Past?".
// Hume's problem of induction, told through Russell's chicken: fed every morning, it
// grows sure the farmer is a friend — a row of ✓ days piling up — until the ? day.
// Questions A/B/C/D; the scene carries the dark little joke.

export interface Epi7Beat extends BaseBeat {
  /** Farmer gesture. */ p?: number;
  /** How many past "fed" days are shown (0..4). */ days?: number;
  /** The ? / twist day is revealed 0..1. */ twist?: number;
  /** The circular-reasoning loop drawn stage left 0..1. */ circle?: number;
}

export const BEATS: Epi7Beat[] = [
  {
    p: 6, days: 1, twist: 0,
    text: 'The sun rose today. Will it rise tomorrow? You feel sure — but Hume asks what gives you the right to be.',
    dur: 3.6,
  },
  {
    p: 1, days: 3,
    text: 'Induction reasons from cases you’ve seen to cases you haven’t. Every swan so far was white, so all swans are white. Science runs on this leap — from past patterns to future predictions.',
    cite: 'Induction',
    dur: 5.0,
  },
  {
    p: 4, days: 4, circle: 1,
    text: 'Why expect the future to match the past? Only because it always has. But that uses the past to justify trusting the past — circular. Induction cannot be proven by logic.',
    cite: 'Hume’s problem',
    dur: 5.0,
  },
  {
    p: 0, days: 4, circle: 1,
    quote: {
      id: 'lq-epistemology-knowledge-7-1',
      text: 'Custom, then, is the great guide of human life.',
      author: 'David Hume',
      work: 'An Enquiry Concerning Human Understanding',
      era: '1748',
      branchSlugs: ['epistemology'],
    },
    dur: 3.2,
  },
  {
    p: 13, days: 4, twist: 1,
    text: 'A chicken is fed every morning and grows sure the farmer is its friend. Each feeding confirms the rule — until the day the farmer wrings its neck. More of the same is no guarantee of the same.',
    cite: 'Russell’s chicken',
    dur: 5.2,
  },
  {
    p: 4, days: 4, twist: 1,
    mc: {
      prompt: 'What is Hume’s problem of induction?',
      options: [
        { id: 'a', text: 'We cannot logically prove the future will resemble the past', correct: true },
        { id: 'b', text: 'The past is unknowable, so the future must be too', correct: false },
        { id: 'c', text: 'Scientists make too many careless measurement errors', correct: false },
        { id: 'd', text: 'Patterns in nature are random and never repeat', correct: false },
      ],
      explain: 'Induction assumes nature stays uniform, but that assumption itself rests only on past experience — which is circular.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 8, days: 4, twist: 1,
    mc: {
      prompt: 'Hume showed induction is unprovable. So should we stop relying on it?',
      options: [
        { id: 'a', text: 'Yes — a rational person abandons all inductive reasoning', correct: false },
        { id: 'b', text: 'Yes — only deductive logic should ever guide belief', correct: false },
        { id: 'c', text: 'No — custom and habit make us expect the future to match; we can’t help it', correct: true },
        { id: 'd', text: 'No — because he secretly found a logical proof after all', correct: false },
      ],
      explain: 'Hume says induction has no logical proof, yet habit makes it unavoidable. We live by custom, not airtight reasoning.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Crack Beneath Science',
      points: [
        'Induction leaps from past cases to future ones',
        'No logic guarantees the future fits the past',
        'Hume: habit, not proof, drives expectation',
        'Russell’s chicken shows confirmation can mislead',
      ],
      closing: 'Science still works astonishingly well. Hume just reminds us its foundation is trust, not proof.',
    },
    dur: 2.8,
  },
];
