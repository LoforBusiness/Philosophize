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
    g: 25, wall: 1,
    dur: 3.8,
    text: 'Mary knows every physical fact about colour. Wavelengths, cones, which neurons fire and in what order.',
  },
  {
    g: 25, wall: 1,
    dur: 1.8,
    text: 'The wall is complete.',
  },
  {
    g: 45, wall: 1,
    dur: 4.6,
    text: 'She has also never seen any. She has lived her whole life in a room with nothing in it but black, white and grey.',
    cite: 'And she has never seen it',
  },
  {
    g: 13, wall: 1, door: 1, card: 1,
    dur: 4.8,
    text: 'Today she opens the door and looks at a red rose. Something arrives that was not on the wall.',
    cite: 'She steps outside',
  },
  {
    g: 137, wall: 1, door: 1, card: 1,
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
    g: 5, wall: 1, door: 1, card: 1,
    dur: 5.0,
    text: 'How the brain sorts light is a hard question with an ordinary answer coming. Why any of it is felt at all is a different sort of question.',
    cite: 'The hard problem',
  },
  {
    g: 4, wall: 1, door: 1, card: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap what Mary gains by stepping outside.',
      explain: 'What red is like. The board offering a new physical fact is the serious reply. It has to say the wall was never finished. That is hard when the wall is every physical fact by definition. The other board has to tell Mary she imagined the moment.',
      xp: 5,
    },
  },
  {
    g: 41, wall: 1, door: 1, card: 1,
    dur: 1.0,
    interact: {
      prompt: 'Slide the seam to divide what there is to know about red.',
      split: {
        left: 'THE PHYSICAL FACTS', right: 'WHAT IT IS LIKE',
        start: 1,
        zones: [
          { id: 'mind', upto: 0.3, reads: 'physics barely touches it' },
          { id: 'most', upto: 0.74, reads: 'physics covers nearly all of it', correct: true },
          { id: 'all', upto: 1, reads: 'physics covers every last bit' },
        ],
      },
      explain: 'Nearly all of it, and the sliver on the right is the whole argument. The far end treats every physical fact and everything as the same list, which is exactly what is in question. She had the first list complete and she still learns something the day the door opens.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Explanatory Gap',
      points: [
        'Easy problems ask how the brain does its work',
        'The hard problem asks why any of it is felt',
        'Qualia are the felt qualities — the redness of red',
        'Mary has every physical fact and still gains something',
      ],
      closing: 'Nothing in the description of the machinery says why the lights are on inside it.',
    },
    dur: 3.0,
  },
];
