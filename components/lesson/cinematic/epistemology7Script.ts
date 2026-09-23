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
  /** 1 = a "JUSTIFIED?" tag lands stage left — Hume's own question about the chart. */ ask?: number;
  /** 1 = a "SCIENCE, TOO" tag lands under it — the claim reaches past everyday habit. */ also?: number;
  /** 1 = a "CIRCULAR" tag lands under that — naming the loop the argument makes. */ loop?: number;
  /** 1 = an X strikes the dashed TOMORROW column — the confident guess that was wrong. */ wrongX?: number;
}

export const BEATS: Epi7Beat[] = [
  {
    p: 274, days: 1, twist: 0,
    text: 'The sun has risen every morning in recorded history. What justifies the belief that it will rise tomorrow?',
    dur: 1.8,
  },
  {
    p: 274, days: 1, twist: 0, ask: 1,
    text: 'You feel confident that it will. David Hume asked what, if anything, justifies that confidence.',
    dur: 2.3,
  },
  {
    p: 167, days: 3, ask: 1,
    text: 'Induction is inference from observed cases to unobserved ones. For example, every swan seen so far was white, so all swans are white.',
    cite: 'Induction',
    dur: 4,
  },
  {
    p: 167, days: 3, ask: 1, also: 1,
    text: 'Everyday expectations and much of science depend on inferences of this kind.',
    dur: 1.8,
  },
  {
    p: 160, days: 4, circle: 1, ask: 1, also: 1,
    text: 'Induction assumes that the future will be like the past. The only evidence for this is past experience.',
    cite: 'The problem of induction',
    dur: 1.9,
  },
  {
    p: 396, days: 4, circle: 1, ask: 1, also: 1, loop: 1,
    text: 'But arguing from past experience assumes the very principle in question. Hume concludes that any such justification is circular.',
    dur: 3.1,
  },
  {
    p: 139, days: 4, circle: 1, ask: 1, also: 1, loop: 1,
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
    p: 13, days: 4, twist: 1, ask: 1, also: 1, loop: 1,
    text: 'Bertrand Russell gives an example. A chicken fed every day comes to expect food, until one day the farmer wrings its neck instead.',
    cite: 'Russell’s chicken, 1912',
    dur: 3.8,
  },
  {
    p: 266, days: 4, twist: 1, ask: 1, also: 1, loop: 1, wrongX: 1,
    text: 'No number of past confirmations can guarantee the next case. The chicken’s evidence was strong, and its conclusion was false.',
    dur: 1.8,
  },
  {
    p: 165, days: 4, twist: 1, ask: 1, also: 1, loop: 1, wrongX: 1,
    interact: {
      prompt: 'What does Hume’s problem show about inductive inference?',
      cards: [
        { text: 'It rests on an unproved assumption', correct: true },
        { text: 'Experience proves its reliability', correct: false },
      ],
      explain: 'Induction assumes nature stays the same. That assumption has never been proved. Proving it would require induction. And using induction to prove induction is circular.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 8, days: 4, twist: 1, ask: 1, also: 1, loop: 1, wrongX: 1,
    interact: {
      prompt: 'Reason cannot prove induction. What does Hume then do?',
      sort: {
        chip: 'HUME',
        bins: [
          { id: 'drop', label: 'ABANDONS IT', reads: 'abandons induction, since reason cannot back it' },
          { id: 'habit', label: 'RELIES ON IT', reads: 'relies on induction anyway out of custom', correct: true },
          { id: 'proved', label: 'CALLS IT PROVED', reads: 'relies on induction and calls it proved' },
        ],
      },
      explain: 'He relies on it anyway. Hume separates the question of what reason can justify from the question of what nobody can help believing, and induction fails the first while passing the second. Custom, not argument, is what carries a mind to tomorrow.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Problem of Induction',
      points: [
        'Induction infers unobserved cases from observed ones',
        'No logical proof shows the future will resemble the past',
        'Hume: custom, not reason, produces expectation',
        'Russell’s chicken shows confirmation can mislead',
      ],
      closing: 'Science still relies on induction. Hume’s point is that its reliability can’t be proved without arguing in a circle.',
    },
    dur: 2.8,
  },
];
