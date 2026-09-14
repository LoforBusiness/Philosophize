import type { BaseBeat } from './cinematicKit';

// Cinematic metaphysics-being-17, "Why Does Experience Feel Like Anything?"
//
// THE PICTURE: a wall carrying every physical fact about colour, a door, and one
// card on the other side of the door. The wall is complete before the lesson starts
// and stays complete; the card is not on it, and stepping through is the only way
// to get the card (H64).
//
// The knowledge argument is usually told as a story and then argued about, which
// loses the reader between Mary and qualia. As a wall with something outside it,
// the claim is spatial: here is everything physics can say, and here is a thing
// that is not among it. Whether that thing is really outside the wall is precisely
// what philosophers still disagree about, and the picture leaves that open.
//
// STAGING: the Q1 decoys are the two ways out physicalists actually take — that
// what she gains is one more physical fact she had not got to yet, or that she
// gains nothing and only feels as if she does (H66).

export interface Met17Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** The wall of physical facts, 0…1. */ wall?: number;
  /** The door, 0 shut · 1 open. */ door?: number;
  /** The card on the other side, 0…1. */ card?: number;
  /** 1 = the three boards are live targets (Q1). */ pick?: number;
}

export const BEATS: Met17Beat[] = [
  {
    g: 462, wall: 1,
    dur: 3.8,
    text: 'Frank Jackson imagines Mary, a scientist who knows every physical fact about colour vision, down to which neurons fire.',
  },
  {
    g: 462, wall: 1,
    dur: 1.8,
    text: 'By the terms of the case, her physical knowledge of colour is complete.',
  },
  {
    g: 379, wall: 1,
    dur: 4.6,
    text: 'However, Mary has never seen colour. She’s lived her whole life in a black and white room.',
    cite: 'A black and white room',
  },
  {
    g: 383, wall: 1, door: 1, card: 1,
    dur: 4.8,
    text: 'Suppose she leaves the room and sees a red rose. Jackson argues that she learns something she didn’t know before.',
    cite: 'She leaves the room',
  },
  {
    g: 465, wall: 1, door: 1, card: 1,
    dur: 3.8,
    quote: {
      id: 'lq-metaphysics-being-17-1',
      text: 'Why doesn\'t all this information-processing go on "in the dark", free of any inner feel?',
      author: 'David Chalmers',
      work: 'Facing Up to the Problem of Consciousness',
      era: '1995',
      philosopherId: 'david-chalmers',
      branchSlugs: ['metaphysics'],
    },
  },
  {
    g: 440, wall: 1, door: 1, card: 1,
    dur: 5.0,
    text: 'David Chalmers classes explaining how the brain processes light among the easy problems. Explaining why any of it is felt is the hard problem.',
    cite: 'The hard problem',
  },
  {
    g: 165, wall: 1, door: 1, card: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'On Jackson’s argument, what does Mary gain on leaving the room?',
      explain: 'What red is like. The reply offering a new physical fact must deny that her physical knowledge was complete, which the case stipulates. Daniel Dennett replies that she learns nothing she couldn’t have worked out.',
      xp: 5,
    },
  },
  {
    g: 41, wall: 1, door: 1, card: 1,
    dur: 1.0,
    interact: {
      prompt: 'If Jackson’s argument succeeds, how much of what can be known about red is physical?',
      split: {
        left: 'THE PHYSICAL FACTS', right: 'WHAT IT IS LIKE',
        start: 1,
        zones: [
          { id: 'mind', upto: 0.3, reads: 'little of it is physical' },
          { id: 'most', upto: 0.74, reads: 'everything except what seeing red is like', correct: true },
          { id: 'all', upto: 1, reads: 'every fact about red is physical' },
        ],
      },
      explain: 'Everything except what seeing red is like. Mary had every physical fact, yet on Jackson’s argument she still learns something on seeing red. So the physical facts can’t be all the facts.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Knowledge Argument',
      points: [
        'Easy problems ask how the brain does its work',
        'The hard problem asks why any of it is felt',
        'Qualia are the felt qualities of experience, such as redness',
        'Jackson’s Mary knows every physical fact yet learns something',
      ],
      closing: 'Frank Jackson later rejected his own argument and defended physicalism.',
    },
    dur: 3.0,
  },
];
