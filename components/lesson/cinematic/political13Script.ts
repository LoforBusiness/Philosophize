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
  /** 1 = two struck-through cards — "your own good" and "others dislike it" — the reasons Mill refuses, before the town's real argument appears in their place. */ reject?: number;
  /** 1 = a short arrow drops from the first step into the empty space below it, showing the argument is heading toward a conclusion not yet written. */ goal?: number;
  /** 1 = an arrow connects each step to the one below it, tracing how the argument's steps are meant to follow from each other. */ chain?: number;
  /** 1 = a small check mark appears beside the first and third step — the two Mill accepts — leaving the middle one unmarked. */ accept?: number;
  /** 1 = a dashed frame appears around the middle step — the town's whole case depends on that step alone. */ crux?: number;
}

export const BEATS: Pol13Beat[] = [
  {
    p: 462, x: 70,
    text: 'John Stuart Mill accepts only one reason for coercing a person against their will. The reason is to prevent harm to others.',
    dur: 3.3,
  },
  {
    p: 462, x: 70, reject: 1,
    text: 'Mill rejects coercion for a person’s own good, and coercion merely because others dislike the choice.',
    dur: 2,
  },
  {
    p: 270, x: 168, steps: 1,
    text: 'Suppose a speaker says something most of the town finds repellent. No one is assaulted, robbed or threatened.',
    cite: 'The argument',
    dur: 3.5,
  },
  {
    p: 270, x: 168, steps: 1, goal: 1,
    text: 'The town argues that the speaker should be stopped.',
    dur: 1.8,
  },
  {
    p: 268, x: 168, steps: 3,
    text: 'The argument has three steps, and read in order it appears valid.',
    cite: 'Three steps',
    dur: 1.9,
  },
  {
    p: 268, x: 168, steps: 3, chain: 1,
    text: 'Each step seems to follow from the one before, and the conclusion is the one the town wanted.',
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
    p: 13, x: 124, steps: 3, accept: 1,
    text: 'Mill accepts the first step, because the townspeople are offended. He also accepts the third, because it restates his own principle.',
    cite: 'One step is unsupported',
    dur: 2.8,
  },
  {
    p: 266, x: 124, steps: 3, accept: 1, crux: 1,
    text: 'So the town’s whole case depends on the middle step.',
    dur: 2.2,
  },
  {
    p: 383, x: 124, steps: 3, accept: 1, pick: 1,
    interact: {
      prompt: 'Which step of the town’s argument would Mill reject?',
      explain: 'So it harms them. That step treats offence as harm. On Mill’s view, harm sets back a person’s interests, and being upset doesn’t. If offence counted, a majority could silence any speech it disliked.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 165, x: 124, steps: 3, accept: 1, tag: 1,
    interact: {
      prompt: 'Which principle implies that offence alone can never justify coercion?',
      poll: {
        options: [
          { id: 'harm', reads: 'only harm to others justifies coercion', holders: ['John Stuart Mill'], correct: true },
          { id: 'offence', reads: 'serious offence can justify coercion', holders: ['Joel Feinberg'] },
          { id: 'both', reads: 'a society may enforce its shared morality', holders: ['Patrick Devlin'] },
          { id: 'none', reads: 'coercion may protect people from themselves', holders: ['Sarah Conly'] },
        ],
      },
      explain: 'Only harm to others justifies coercion. On the harm principle, offence harms no one’s interests, so it gives no ground. An offence principle would count widespread disgust as a reason.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Mill’s Harm Principle',
      points: [
        'Power over the unwilling is justified only to prevent harm',
        'Your own good is never a sufficient reason',
        'Offence and disapproval are not harm',
        'The principle marks the edge of Berlin’s negative liberty',
      ],
      closing: 'An argument for restriction is only as strong as its weakest premise, here the claim that offence is harm.',
    },
    dur: 3.0,
  },
];
