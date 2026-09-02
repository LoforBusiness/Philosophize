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
}

export const BEATS: Meta13Beat[] = [
  {
    p: 25, x: 70,
    text: 'A scanner reads every atom of you, sends the data to Mars, builds a perfect copy there, and vaporises the original here. Step in?',
    dur: 4.4,
  },
  {
    p: 41, x: 168, track: 1,
    text: 'Say yes, and say it works. What travels is not a body — it is the chain: your memories, your intentions, your half-finished thought about lunch, all continuous.',
    cite: 'What travels',
    dur: 5.0,
  },
  {
    p: 13, x: 124, track: 1, fork: 1,
    text: 'Now the machine malfunctions and forgets to vaporise you. You walk out on Earth.',
    cite: 'The machine slips',
    dur: 2.4,
  },
  {
    p: 13, x: 124, track: 1, fork: 1,
    text: 'Someone with your whole chain walks out on Mars. Neither is a copy of the other.',
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
    text: 'Try to put the label on one of them. Nothing chooses — the two branches are the same in every respect there is.',
    cite: 'The label sticks',
    dur: 3.5,
  },
  {
    p: 29, x: 168, track: 1, fork: 1, both: 1, stuck: 1,
    text: 'Identity has to pick one thing, and continuity has just gone two ways.',
    dur: 2,
  },
  {
    p: 4, x: 124, track: 1, fork: 1, both: 1, stuck: 1,
    interact: {
      prompt: 'Slide the seam to divide you between the two of them.',
      split: {
        left: 'THE ONE WHO WOKE UP', right: 'THE ONE ON EARTH',
        start: 0.04,
        zones: [
          { id: 'earth', upto: 0.3, reads: 'the one on Earth is you' },
          { id: 'both', upto: 0.7, reads: 'both are you, and the question is empty', correct: true },
          { id: 'copy', upto: 1, reads: 'the new one is you' },
        ],
      },
      explain: 'The middle, and being unable to settle it is the answer. Identity feels all or nothing, so one of them ought to be the real one. Both branches carry exactly what you carried. Parfit\'s move is to stop asking which is you and notice that what mattered survived twice.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 6, x: 124, track: 1, fork: 1, both: 1, stuck: 1, pick: 1,
    interact: {
      prompt: 'Tap the thing the fork actually broke.',
      explain: 'Not continuity — that survived twice over, which is the whole problem. Identity is what cannot branch: a thing can only be identical to one thing, and here there are two equally good candidates.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'What You Now Know',
      points: [
        'Teleporter: a perfect copy may not be you',
        'Fission: continuity can branch, identity cannot',
        'Parfit — identity is not what matters, survival is',
        'Hume and the Buddha gain force from this',
      ],
      closing: 'If the question "which one is really me?" has no answer, perhaps it was never the question.',
    },
    dur: 3.0,
  },
];
