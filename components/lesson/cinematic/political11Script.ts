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
    p: 25, x: 56,
    text: 'Switch off every government tonight — no courts, no police, nobody in charge. By morning, what is left of us? Answer that and you have already decided what state you can justify.',
    dur: 4.0,
  },
  {
    p: 13, x: 56, dial: 1,
    text: 'Nobody thinks this really happened. It is an instrument: set it to a reading of human nature, and see what has to be built on top.',
    cite: 'The state of nature · a tool, not a history',
    dur: 4.2,
  },
  {
    p: 35, x: 120, dial: 1, set: 1, built: 1,
    text: 'Hobbes turns the dial to FEARFUL. Everyone is roughly equal, so everyone can kill everyone, so everyone strikes first. Only a power standing above the quarrel can stop it, and that power must be too tall to reach over.',
    cite: 'Hobbes · the war of all against all',
    dur: 5.0,
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
    p: 21, x: 120, dial: 1, set: 2, built: 2,
    text: 'Locke turns it to RATIONAL. We already owe each other things out here; what is missing is only a neutral judge. So he builds small, and the people stay outside it holding the rights they walked in with.',
    cite: 'Locke · a limited government',
    dur: 4.8,
  },
  {
    p: 33, x: 120, dial: 1, set: 3, built: 3,
    text: 'Rousseau turns it to INNOCENT. We were fine until property and rank taught us to compare ourselves. His answer has no one at the top at all. Everybody is bound to the common good. That is how he means to hand freedom back.',
    cite: 'Rousseau · the general will',
    dur: 5.0,
  },
  {
    p: 4, x: 120, dial: 1, set: 3, built: 3,
    interact: {
      prompt: 'A friend says the three disagree because each simply wanted a different government. What is the deeper truth?',
      cards: [
        { text: 'They read human nature differently', correct: true },
        { text: 'Each wanted a different government', correct: false },
      ],
      explain: 'The trap reverses cause and effect: it has each man choosing his conclusion first and reverse-engineering a premise to reach it. The argument runs the other way. Fix the reading of human nature and the state you are allowed to build is already decided.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, x: 120, dial: 1, set: 1, built: 3, plates: 1,
    interact: {
      prompt: 'The dial is back on FEARFUL. Tap the state that diagnosis demands.',
      explain: 'If nobody can be trusted, only a power above everyone can hold the peace — so Hobbes trades away nearly all freedom to buy it. The trap: the small limited house is the moderate, sensible-looking answer, and it is Locke’s, built on a diagnosis Hobbes has already rejected.',
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
