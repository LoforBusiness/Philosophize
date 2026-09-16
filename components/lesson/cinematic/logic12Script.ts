import type { BaseBeat } from './cinematicKit';

// Cinematic logic-arguments-12, "The Trap Of Only Two Doors" — a CONVERSION of an
// existing card deck, taken in reading order as the frontier of the Logic branch (§5).
//
// THE PICTURE: a wall with four doors in it. Two are lit and offered; two have been
// there the whole time, unlit. The trick is not that the doors are fake — it is that
// the room was drawn with only two of them showing (H64).
//
// STAGING: the app's first DOOR — a frame with a leaf that swings open on its hinge —
// and the answer targets are the doors, so the reader answers by choosing a way out.

export interface Logic12Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** 1 = the two unoffered doors are lit as well. */ lit?: number;
  /** 1 = the doors are live targets (Q1). */ pick?: number;
}

export const BEATS: Logic12Beat[] = [
  {
    g: 5, lit: 0,
    dur: 4.0,
    text: 'Suppose someone says “you’re either with us or against us”. The sentence offers two options and asks you to choose one.',
  },
  {
    g: 457, lit: 0,
    dur: 4.4,
    text: 'Both options are genuine, since some people are with you and some are against you.',
    cite: 'Both options are real',
  },
  {
    g: 2, lit: 0,
    dur: 2.8,
    text: 'The fallacy lies in the unargued claim that no other option exists. This is called a false dilemma.',
    cite: 'An unargued premise',
  },
  {
    g: 266, lit: 0,
    dur: 1.8,
    text: 'A false dilemma presents the options on offer as if they were all the options.',
  },
  {
    g: 147, lit: 0,
    dur: 3.6,
    quote: {
      id: 'lq-logic-arguments-12-1',
      text: 'Mankind likes to think in terms of extreme opposites, in terms of Either-Or, between which it recognizes no intermediate possibilities.',
      author: 'John Dewey',
      philosopherId: 'john-dewey',
      work: 'Experience and Education',
      era: '1938',
      branchSlugs: ['logic'],
    },
  },
  {
    g: 45, lit: 1,
    dur: 4.6,
    text: 'Other options existed before the offer was made. Presenting only two hides the rest without eliminating them.',
    cite: 'The other options',
  },
  {
    g: 384, lit: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which option does the “with us or against us” claim have to hide?',
      explain: '“On this, not that.” The claim works only if you can’t agree on some points but not on others. Saying nothing refuses to answer, and takes no side.',
      xp: 5,
    },
  },
  {
    g: 11, lit: 1,
    dur: 1.0,
    interact: {
      prompt: 'When is an either-or claim legitimate rather than a false dilemma?',
      sort: {
        chip: 'an either-or',
        bins: [
          { id: 'exhaustive', label: 'none left out', reads: 'when the two options exhaust the possibilities', correct: true },
          { id: 'popular', label: 'most accept it', reads: 'when most people accept the two options' },
          { id: 'never', label: 'always fallacious', reads: 'never, since every either-or is a false dilemma' },
        ],
      },
      explain: 'An either-or is legitimate when its options leave none out. A light switch is on or off, so not every either-or is a fallacy. Most people accepting the two options doesn’t make them complete.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'False Dilemmas',
      points: [
        'A false dilemma offers two options and hides the rest',
        'The offered options are often real, but “only” is false',
        'A legitimate either-or leaves no option out',
        'Ask what the middle position would be, then look for it',
      ],
      closing: 'Faced with two options, first ask whether they’re the only possible ones.',
    },
    dur: 3.0,
  },
];
