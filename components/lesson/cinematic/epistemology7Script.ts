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
    text: 'Induction goes from the cases you have seen to the ones you have not. Every swan so far was white, so all swans are white. Science runs on that leap constantly.',
    cite: 'Induction',
    dur: 5.0,
  },
  {
    p: 4, days: 4, circle: 1,
    text: 'Why expect the future to match the past? Only because it always has. But that uses the past to vouch for the past. The circle closes, and logic never gets a grip on it.',
    cite: 'Hume’s problem',
    dur: 5.0,
  },
  {
    p: 139, days: 4, circle: 1,
    quote: {
      id: 'lq-epistemology-knowledge-7-1',
      text: 'Custom, then, is the great guide of human life.',
      author: 'David Hume',
      philosopherId: 'david-hume',
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
    interact: {
      prompt: 'So what exactly is the problem Hume has found here?',
      cards: [
        { text: 'No proof the future matches', correct: true },
        { text: 'Nature has been proven uniform', correct: false },
      ],
      explain: 'Induction assumes nature keeps behaving the same way. But the only reason to assume so is that nature has done so before, which is a circle.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 8, days: 4, twist: 1,
    interact: {
      prompt: 'Drag to what Hume says we should do about induction.',
      drag: {
        lo: 'STOP USING IT',
        hi: 'CALL IT PROVED',
        start: 0,
        zones: [
          { id: 'stop', upto: 0.28, reads: 'drop it; with no proof behind it, it is worthless' },
          { id: 'habit', upto: 0.74, reads: 'keep using it, because habit leaves you no choice', correct: true },
          { id: 'proved', upto: 1, reads: 'keep it, and say it has been proved after all' },
        ],
      },
      explain: 'The middle, and it is the odd part of Hume. He shows there is no logical proof and then says we will go on anyway, because custom is stronger than argument. Neither end is his: he does not drop it and he does not rescue it.',
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
