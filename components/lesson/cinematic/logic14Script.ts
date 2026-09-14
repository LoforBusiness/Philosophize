import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-14, "When a Word Changes Costumes"
//
// THE PICTURE: the sandwich syllogism written out, with a rule under the premises
// like a sum. Both premises are true, the form is one you accept every day, and the
// answer is absurd — so the fault has to be inside a line rather than between them.
// After the reader finds it, each premise grows a second line saying what its
// shared word actually meant there, and the two do not match (H64).
//
// STAGING: the Q1 targets are three WORDS out of the argument, so the reader
// answers by pointing at the culprit rather than by naming a fallacy (E33). The
// deck question then rules out the misdiagnosis the picture just disproved: the
// form is fine, and that is exactly what makes this one work (H66).

export interface Log14Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many lines of the argument are up, 0…3. */ lines?: number;
  /** The shared word ringed in both premises, 0…1. */ mark?: number;
  /** The two meanings written underneath, 0…1. */ gloss?: number;
  /** 1 = the three word chips are live targets (Q1). */ pick?: number;
}

export const BEATS: Log14Beat[] = [
  {
    g: 164, lines: 2,
    dur: 2.7,
    text: 'Consider two premises: nothing is better than eternal happiness, and a ham sandwich is better than nothing.',
  },
  {
    g: 164, lines: 2,
    dur: 1.8,
    text: 'Each premise, read on its own, seems true.',
  },
  {
    g: 447, lines: 3,
    dur: 4.6,
    text: 'They appear to yield the conclusion that a ham sandwich is better than eternal happiness. The form looks valid, yet the conclusion is absurd.',
    cite: 'The conclusion',
  },
  {
    g: 407, lines: 3, mark: 1,
    dur: 4.8,
    text: 'The fault is easy to miss, because the form looks valid. So the error must lie in the words, not in the form.',
    cite: 'Inside the premises',
  },
  {
    g: 144, lines: 3, mark: 1,
    dur: 3.8,
    quote: {
      id: 'lq-logic-arguments-14',
      text: 'Contenting themselves with the same words other people use, as if their very sound necessarily carried with it the same meaning.',
      author: 'John Locke',
      work: 'An Essay Concerning Human Understanding',
      era: '1689',
      philosopherId: 'john-locke',
      branchSlugs: ['logic'],
    },
  },
  {
    g: 461, lines: 3, mark: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which word carries a different meaning in each premise?',
      explain: 'The word “nothing”. It seems to link the two premises, but it has a different sense in each. “Better” and “happiness” keep one meaning throughout.',
      xp: 5,
    },
  },
  {
    g: 176, lines: 3, mark: 1, gloss: 1,
    dur: 4.2,
    text: 'In the first premise, the word “nothing” means that no thing is better. In the second, it means having nothing at all.',
    cite: 'Two senses of one word',
  },
  {
    g: 176, lines: 3, mark: 1, gloss: 1,
    dur: 1.8,
    text: 'Because the word “nothing” shifts meaning, the premises share no common term. This fallacy is called equivocation.',
  },
  {
    g: 383, lines: 3, mark: 1, gloss: 1,
    dur: 1.0,
    interact: {
      prompt: 'How should the blame for the absurd conclusion divide between form and words?',
      split: {
        left: 'THE FORM', right: 'THE WORDS',
        start: 1,
        zones: [
          { id: 'words', upto: 0.3, reads: 'the words, since a key word shifts meaning', correct: true },
          { id: 'both', upto: 0.66, reads: 'the form and the words equally' },
          { id: 'form', upto: 1, reads: 'the form, which was invalid from the start' },
        ],
      },
      explain: 'The blame falls on the words: the word “nothing” shifts meaning. The form is valid, but an argument only has that form if its terms keep one meaning.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Equivocation',
      points: [
        'Equivocation uses one word in two senses in one argument',
        'The form still looks valid because the term looks shared',
        'Check first the term that links the two premises',
        'Validity guarantees nothing if a key term shifts',
      ],
      closing: 'Before accepting an argument, check that each repeated term keeps one meaning throughout.',
    },
    dur: 3.0,
  },
];
