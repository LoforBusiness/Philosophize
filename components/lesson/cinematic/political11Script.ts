import type { BaseBeat } from './cinematicKit';

// Cinematic political-political-11, "Why Leave the State of Nature?" — Hobbes, Locke
// and Rousseau run the same experiment and build three different states.
//
// THE PICTURE: a three-notch DIAL reading FEARFUL · RATIONAL · INNOCENT, wired to
// three empty plots of ground. Whichever way the dial is set, that plot builds — a
// tall tower with everything pressed under it, a small house with the people standing
// outside it still holding their own, a ring with nobody above anybody. Nothing about
// the experiment changes between them. Only the reading of human nature does, and the
// state that follows is whatever that reading needs. That is the lesson's thesis drawn
// rather than asserted: the diagnosis sets the cure.
//
// The plots ACCUMULATE rather than replacing each other, so by the question all three
// stand side by side and the reader has to remember which diagnosis built which.
//
// Q1 is A/B/C/D in the deck — the cause-and-effect trap needs its options read (E34).
// Q2 is answered ON the stage: the dial goes back to FEARFUL, tap the state it demands.

export interface Political11Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). 56 = downstage left, 120 = beside the plots. */ x?: number;
  /** 1 = the dial and its three empty plots are on stage. */ dial?: number;
  /** Where the dial points: 0 unset · 1 FEARFUL · 2 RATIONAL · 3 INNOCENT. */ set?: number;
  /** How many plots have been built: 0 none · 1 tower · 2 +house · 3 +ring. */ built?: number;
  /** 1 = the three plots are live answer targets (Q2). */ plates?: number;
}

export const BEATS: Political11Beat[] = [
  {
    p: 164, x: 56,
    text: 'Switch off every government tonight — no courts, no police, nobody in charge. By morning, what is left of us?',
    dur: 2.5,
  },
  {
    p: 164, x: 56,
    text: 'Answer that and you have already decided what state you can justify.',
    dur: 1.8,
  },
  {
    p: 383, x: 56, dial: 1,
    text: 'Nobody thinks this really happened. It is an instrument: set it to a reading of human nature, and see what has to be built on top.',
    cite: 'The state of nature · a tool, not a history',
    dur: 4.2,
  },
  {
    p: 167, x: 120, dial: 1, set: 1, built: 1,
    text: 'Hobbes turns the dial to FEARFUL. Everyone is roughly equal, so everyone can kill everyone, so everyone strikes first.',
    cite: 'Hobbes · the war of all against all',
    dur: 2.4,
  },
  {
    p: 167, x: 120, dial: 1, set: 1, built: 1,
    text: 'Only a power standing above the quarrel can stop it, and that power must be too tall to reach over.',
    dur: 2.6,
  },
  {
    p: 139, x: 120, dial: 1, set: 1, built: 1,
    quote: {
      id: 'lq-political-political-11',
      text: 'During the time men live without a common power to keep them all in awe, they are in that condition which is called war.',
      author: 'Thomas Hobbes',
      work: 'Leviathan',
      era: '1651',
      philosopherId: 'thomas-hobbes',
      branchSlugs: ['political-philosophy'],
    },
    dur: 3.6,
  },
  {
    p: 176, x: 120, dial: 1, set: 2, built: 2,
    text: 'Locke turns it to RATIONAL. We already owe each other things out here; what is missing is only a neutral judge.',
    cite: 'Locke · a limited government',
    dur: 2.7,
  },
  {
    p: 176, x: 120, dial: 1, set: 2, built: 2,
    text: 'So he builds small, and the people stay outside it holding the rights they walked in with.',
    dur: 2.1,
  },
  {
    p: 33, x: 120, dial: 1, set: 3, built: 3,
    text: 'Rousseau turns it to INNOCENT. We were fine until property and rank taught us to compare ourselves.',
    cite: 'Rousseau · the general will',
    dur: 2,
  },
  {
    p: 33, x: 120, dial: 1, set: 3, built: 3,
    text: 'Rousseau\'s answer has no one at the top at all. Everybody is bound to the common good.',
    dur: 2,
  },
  {
    p: 33, x: 120, dial: 1, set: 3, built: 3,
    text: 'That is how he means to hand freedom back.',
    dur: 1.8,
  },
  {
    p: 4, x: 120, dial: 1, set: 3, built: 3,
    interact: {
      prompt: 'Slide the seam to which one comes first.',
      split: {
        left: 'THE READING OF HUMAN NATURE', right: 'THE GOVERNMENT WANTED',
        start: 0.04,
        zones: [
          { id: 'gov', upto: 0.3, reads: 'each picked his politics and worked backwards' },
          { id: 'both', upto: 0.66, reads: 'the two shaped each other as they went' },
          { id: 'nature', upto: 1, reads: 'settle human nature, the state follows', correct: true },
        ],
      },
      explain: 'Nearly all of it on the reading. The other end reverses cause and effect: it has each man choosing his conclusion first and reverse-engineering a premise to reach it. Change what people are like in the state of nature and the government you are allowed changes with it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, x: 120, dial: 1, set: 1, built: 3, plates: 1,
    interact: {
      prompt: 'The dial is back on FEARFUL. Tap the state that diagnosis demands.',
      explain: 'If nobody can be trusted, only a power above everyone can hold the peace. So Hobbes trades away nearly all freedom to buy it. The trap: the small limited house is the moderate, sensible-looking answer. And it is Locke’s, built on a diagnosis Hobbes has already rejected.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 9, x: 120, dial: 1, set: 1, built: 3,
    summary: {
      title: 'The Diagnosis Sets the State',
      points: [
        'The state of nature is a tool, not a history',
        'Hobbes saw fear, Locke insecurity, Rousseau lost innocence',
        'Each reading demands a different contract',
        'Argue the premise before you argue the cure',
      ],
      closing: 'Every argument about government starts with a quiet claim about what we are like.',
    },
    dur: 3.0,
  },
];
