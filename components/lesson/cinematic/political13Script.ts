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
    p: 164, x: 70,
    text: 'Mill gives exactly one reason for using power over a person against their will. To stop them harming somebody else.',
    dur: 3.3,
  },
  {
    p: 164, x: 70,
    text: 'Not for their own good, and not because you dislike the choice.',
    dur: 2,
  },
  {
    p: 41, x: 168, steps: 1,
    text: 'A speaker says something most of the town finds repellent. Nobody is assaulted, nothing is stolen, no threat is made.',
    cite: 'The argument',
    dur: 3.5,
  },
  {
    p: 41, x: 168, steps: 1,
    text: 'The town wants them stopped, and here is the argument.',
    dur: 1.8,
  },
  {
    p: 40, x: 168, steps: 3,
    text: 'Three steps. Read them in order and it feels like a proof.',
    cite: 'All three',
    dur: 1.9,
  },
  {
    p: 40, x: 168, steps: 3,
    text: 'Each one seems to follow from the one before. And the conclusion is exactly what the town wanted.',
    dur: 2.9,
  },
  {
    p: 144, x: 124, steps: 3,
    quote: {
      id: 'lq-political-political-13-1',
      text: 'The only purpose for which power can be rightfully exercised over any member of a civilized community, against his will, is to prevent harm to others.',
      author: 'John Stuart Mill',
      philosopherId: 'john-stuart-mill',
      work: 'On Liberty',
      era: '1859',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.2,
  },
  {
    p: 13, x: 124, steps: 3,
    text: 'Mill grants the first: they are certainly offended. He grants the third — it is his own principle.',
    cite: 'One of these is smuggled',
    dur: 2.8,
  },
  {
    p: 13, x: 124, steps: 3,
    text: 'So the whole weight of the town\'s case is resting on the middle one.',
    dur: 2.2,
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
      prompt: 'Place the token on something that is harm and not offence.',
      field: {
        xLo: 'NOBODY OBJECTS', xHi: 'A GREAT MANY OBJECT',
        yLo: 'NOBODY IS SET BACK', yHi: 'SOMEONE IS SET BACK',
        start: [0.76, 0.24],
        quads: [
          { id: 'harm', x: 0, y: 1, reads: 'nobody agreed to it, and somebody is really harmed', correct: true },
          { id: 'offence', x: 1, y: 0, reads: 'a great many object, and nobody is set back' },
          { id: 'both', x: 1, y: 1, reads: 'many object, and somebody is set back: harm, loudly' },
          { id: 'none', x: 0, y: 0, reads: 'nobody objects and nobody is hurt: nothing at all' },
        ],
      },
      explain: 'Top left, and the axes are the point. Offence scales with how many people mind; harm does not move when the count does. That is exactly why Mill will not let a headcount stand in for an injury.',
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
