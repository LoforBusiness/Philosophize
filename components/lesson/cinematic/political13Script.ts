import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-13, "Where Your Freedom Ends".
//
// THE PICTURE: a three-step argument for silencing a speaker, written out as three
// cards. It looks airtight, and Mill grants the first and the third. The lesson is
// spent finding the one in the middle that quietly swapped a word — and the cards
// themselves are the tap targets, so the reader marks the step rather than picking
// a letter.
//
// Q1 is answered on the argument; Q2 is A/B/C/D, because harm and offence have to
// be defined side by side to be told apart (E34).

export interface Pol13Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** How many steps of the argument are up: 0…3. */ steps?: number;
  /** 1 = the OFFENCE IS NOT HARM tag has appeared under the bad step. */ tag?: number;
  /** 1 = the three step cards are live targets (Q1). */ pick?: number;
}

export const BEATS: Pol13Beat[] = [
  {
    p: 25, x: 70,
    text: 'Mill gives exactly one reason for using power over someone against their will: to stop them harming another person. Not for their own good, and not because you dislike it.',
    dur: 5.2,
  },
  {
    p: 41, x: 168, steps: 1,
    text: 'A speaker says something most of the town finds repellent. Nobody is assaulted, nothing is stolen, no threat is made. The town wants them stopped, and here is the argument.',
    cite: 'The argument',
    dur: 5.2,
  },
  {
    p: 40, x: 168, steps: 3,
    text: 'Three steps. Read them in order and it feels like a proof. Each one seems to follow from the one before. And the conclusion is exactly what the town wanted.',
    cite: 'All three',
    dur: 4.8,
  },
  {
    p: 144, x: 124, steps: 3,
    quote: {
      id: 'lq-political-political-13-1',
      text: 'The only purpose for which power can be rightfully exercised over any member of a civilized community, against his will, is to prevent harm to others.',
      author: 'John Stuart Mill',
      work: 'On Liberty',
      era: '1859',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.2,
  },
  {
    p: 13, x: 124, steps: 3,
    text: 'Mill grants the first: they are certainly offended. He grants the third — it is his own principle. So the whole weight of the town\'s case is resting on the middle one.',
    cite: 'One of these is smuggled',
    dur: 5.0,
  },
  {
    p: 6, x: 124, steps: 3, pick: 1,
    interact: {
      prompt: 'Tap the step Mill would refuse to grant.',
      explain: 'Step two swaps offence for harm. Harm sets back real interests or rights; being upset is not one. If the number of offended people counted, a majority could silence anything it disliked.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 4, x: 124, steps: 3, tag: 1,
    interact: {
      prompt: 'On Mill\'s view, what makes something harm rather than mere offence?',
      cards: [
        { text: 'It sets back another\'s interests', correct: true },
        { text: 'It offends other people', correct: false },
      ],
      explain: 'The trap is B, because it feels democratic. But offence scales with how many people object, and harm does not — which is exactly why Mill will not let a headcount do the work of an injury.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What You Now Know',
      points: [
        'Power over the unwilling is justified only to prevent harm',
        'Your own good is never a sufficient reason',
        'Offence and disapproval are not harm',
        'The principle borders Berlin\'s protected area',
      ],
      closing: 'The dangerous step in an argument is rarely the conclusion. It is the one nobody stopped to read.',
    },
    dur: 3.0,
  },
];
