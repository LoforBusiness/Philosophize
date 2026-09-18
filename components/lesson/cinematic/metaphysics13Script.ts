import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-13, "The Teleporter Problem".
//
// THE PICTURE: a single track carrying YOU, which forks into two branches drawn
// exactly alike. Over the lesson the reader watches the track split and then
// watches the label fail to go down either branch — there is nothing on the stage
// that could pick one, because Parfit's point is that there is nothing anywhere.
//
// Q1 is A/B/C/D (the "one of them must really be you" reflex needs its options
// laid out); Q2 is answered at the fork (E34, H65).

export interface Meta13Beat extends BaseBeat {
  /** Figure gesture (emote code). */ p?: number;
  /** Where the figure stands (stage x). */ x?: number;
  /** The stem of the track and the YOU token are drawn, 0..1. */ track?: number;
  /** The fork and its two branches are drawn, 0..1. */ fork?: number;
  /** 1 = both destinations are labelled and equally filled. */ both?: number;
  /** 1 = the label has been tried on the fork and stuck. */ stuck?: number;
  /** 1 = the three answer cards are live (Q2). */ pick?: number;
  /** 1 = a token runs once from the fork down the Mars-side branch to its foot — the replica walking out (group AH). */ arrive?: number;
  /** 1 = a break mark appears where the stem meets the fork — identity itself cannot pass this point (group AH). */ crack?: number;
}

export const BEATS: Meta13Beat[] = [
  {
    p: 379, x: 70,
    text: 'Suppose a scanner records every cell of your body, destroys the original, and builds an exact replica on Mars. Would you step in?',
    dur: 4.4,
  },
  {
    p: 401, x: 168, track: 1,
    text: 'Suppose it works. The replica is psychologically continuous with you, linked to your past by your memories and intentions.',
    cite: 'Psychological continuity',
    dur: 5.0,
  },
  {
    p: 13, x: 124, track: 1, fork: 1,
    text: 'Now suppose the scanner fails to destroy the original. You walk out of the machine on Earth.',
    cite: 'Parfit’s Branch-Line Case',
    dur: 2.4,
  },
  {
    p: 266, x: 124, track: 1, fork: 1, arrive: 1,
    text: 'The replica walks out on Mars with your memories and intentions. Both of you continue the mental life of the person who stepped in.',
    dur: 2.8,
  },
  {
    p: 141, x: 124, track: 1, fork: 1,
    quote: {
      id: 'lq-metaphysics-being-13-1',
      text: 'Personal identity is not what matters.',
      author: 'Derek Parfit',
      philosopherId: 'derek-parfit',
      work: 'Reasons and Persons',
      era: '1984',
      branchSlugs: ['metaphysics'],
    },
    dur: 3.2,
  },
  {
    p: 29, x: 168, track: 1, fork: 1, both: 1, stuck: 1,
    text: 'Psychologically, the two have an equal claim to be you. The one on Earth also keeps your original body.',
    cite: 'An equal claim',
    dur: 3.5,
  },
  {
    p: 258, x: 168, track: 1, fork: 1, both: 1, stuck: 1, crack: 1,
    text: 'Identity can’t branch, because one person can’t be identical to two different people. Psychological continuity, however, has branched.',
    dur: 2,
  },
  {
    p: 4, x: 124, track: 1, fork: 1, both: 1, stuck: 1,
    interact: {
      prompt: 'On a psychological account, how do the two people’s claims to be you compare?',
      split: {
        left: 'THE REPLICA ON MARS', right: 'THE ONE ON EARTH',
        start: 0.04,
        zones: [
          { id: 'earth', upto: 0.3, reads: 'all to the one on Earth' },
          { id: 'both', upto: 0.7, reads: 'equal claims, so no fact settles which is you', correct: true },
          { id: 'copy', upto: 1, reads: 'all to the replica on Mars' },
        ],
      },
      explain: 'Equal claims, so no fact settles which is you. Picking the one on Earth relies on the body, which this account sets aside. Your memories and aims survive twice while identity fails, so Parfit says identity isn’t what matters.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, track: 1, fork: 1, both: 1, stuck: 1, pick: 1,
    interact: {
      prompt: 'When psychological continuity branches into two people, what can no longer hold?',
      explain: 'Identity. If both people were you, they would be one person, and they’re two. The chain of continuity and the memories survive in both.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'When Continuity Branches',
      points: [
        'A replica has your memories but may not be you',
        'Psychological continuity can branch, but identity can’t',
        'Parfit holds that continuity, not identity, is what matters',
        'Parfit found his reductionist view anticipated by the Buddha',
      ],
      closing: 'Parfit argues that in cases of branching, “which one is me?” can be an empty question, with no answer.',
    },
    dur: 3.0,
  },
];
