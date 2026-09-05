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
    text: 'Nothing is better than eternal happiness. A ham sandwich is better than nothing.',
  },
  {
    g: 164, lines: 2,
    dur: 1.8,
    text: 'Both lines are ones you would nod at.',
  },
  {
    g: 45, lines: 3,
    dur: 4.6,
    text: 'So a ham sandwich beats eternal happiness. That is a valid shape applied to two true premises, and the answer is a joke.',
    cite: 'And therefore',
  },
  {
    g: 407, lines: 3, mark: 1,
    dur: 4.8,
    text: 'Something is smuggling false certainty through a form you trust every day. The form is not what went wrong.',
    cite: 'So look inside a line',
  },
  {
    g: 137, lines: 3, mark: 1,
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
    g: 4, lines: 3, mark: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'One word here means two different things. Tap it.',
      explain: 'Nothing. It is the only word in both premises, which is what lets the two lines join at all. And it carries a different sense in each. The other two chips mean the same thing every time, so neither could be the join that failed.',
      xp: 5,
    },
  },
  {
    g: 176, lines: 3, mark: 1, gloss: 1,
    dur: 4.2,
    text: 'In the first line it means no thing is better. In the second it means better than having nothing at all.',
    cite: 'Two words in one costume',
  },
  {
    g: 176, lines: 3, mark: 1, gloss: 1,
    dur: 1.8,
    text: 'The middle never joined.',
  },
  {
    g: 41, lines: 3, mark: 1, gloss: 1,
    dur: 1.0,
    interact: {
      prompt: 'How should the blame divide?',
      split: {
        left: 'THE FORM', right: 'THE WORDS',
        start: 1,
        zones: [
          { id: 'words', upto: 0.3, reads: 'the words moved, not the shape', correct: true },
          { id: 'both', upto: 0.66, reads: 'half the shape, half the words' },
          { id: 'form', upto: 1, reads: 'the shape was invalid from the start' },
        ],
      },
      explain: 'Almost all of it on the words. Run the same shape with a word that holds still and the argument works perfectly. That is what makes equivocation so dangerous. Validity is a promise about form, and the promise lapses once a word changes meaning halfway down.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'One Word, Two Jobs',
      points: [
        'Equivocation uses one word in two senses in one argument',
        'The form still looks valid because the term looks shared',
        'Check the word that appears in both premises first',
        'Validity guarantees nothing if a key term shifts',
      ],
      closing: 'Before you trust an argument, ask whether every word means the same thing twice.',
    },
    dur: 3.0,
  },
];
