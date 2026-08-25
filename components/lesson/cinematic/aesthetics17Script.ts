import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-17, "Why We Pay To Be Horrified"
//
// THE PICTURE: a terror, a fear meter, and a line saying what happens next. A FRAME
// then slides in around the terror — and of those three things, exactly one changes
// (H64). The shape is the same shape. The meter does not drop by a pixel. The only
// casualty is the consequence.
//
// That is the paradox answered by showing rather than telling. Every explanation of
// tragedy people reach for first — "it's not really scary", "you know it's fake" —
// is a claim that the FEAR is different, and the meter is what refuses it.
//
// STAGING: the three things are the Q1 targets, so the reader has to have noticed
// which one moved. The two decoys are exactly the two wrong explanations (H66), and
// the consequence line rewrites itself once the answer is in.

export interface Aes17Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** The shape in the dark, 0…1. */ shape?: number;
  /** How high the fear meter stands, 0…1. */ fear?: number;
  /** The frame around the shape, 0…1. */ frame?: number;
  /** 1 = the three stage elements are live targets (Q1). */ pick?: number;
}

export const BEATS: Aes17Beat[] = [
  {
    g: 47, x: 74, shape: 1, fear: 0.86,
    dur: 4.4,
    text: 'A shape in the dark. Your heart goes, your skin goes cold, and every part of you wants to be somewhere else.',
  },
  {
    g: 25, x: 160, shape: 1, fear: 0.86, frame: 1,
    dur: 4.8,
    text: 'On Friday night you pay money for that. The same heart, the same cold skin, and you chose it off a menu.',
    cite: 'And yet you buy a ticket',
  },
  {
    g: 13, x: 160, shape: 1, fear: 0.86, frame: 1,
    dur: 4.6,
    text: 'Nothing has been turned down. The meter does not care that this sound arrived inside a frame.',
    cite: 'The fear is the same fear',
  },
  {
    g: 137, x: 160, shape: 1, fear: 0.86, frame: 1,
    dur: 3.8,
    quote: {
      id: 'lq-aesthetics-aesthetics-17-1',
      text: 'The whole impulse of those passions is converted into pleasure, and swells the delight which the eloquence raises in us.',
      author: 'David Hume',
      work: 'Of Tragedy',
      era: '1757',
      philosopherId: 'david-hume',
      branchSlugs: ['aesthetics'],
    },
  },
  {
    g: 5, x: 160, shape: 1, fear: 0.86, frame: 1,
    dur: 5.0,
    text: 'Three answers have been offered. The fear is worked through and released. The fear is converted by the telling. The fear is the fee you pay to find out.',
    cite: 'What people have said',
  },
  {
    g: 4, x: 160, shape: 1, fear: 0.86, frame: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'The frame left two of these exactly as they were. Tap the one it changed.',
      explain: 'What happens next. The shape is the same shape. The meter has not moved. So "it is not really frightening" was never available. The frame takes away the consequence. A terror with nothing following it turns out to be something people queue for.',
      xp: 5,
    },
  },
  {
    g: 41, x: 160, shape: 1, fear: 0.86, frame: 1,
    dur: 1.0,
    interact: {
      prompt: 'A friend says horror fans must be faking the fear. Are they?',
      cards: [
        { text: 'No — real fear, no consequences', correct: true },
        { text: 'Yes — nobody enjoys real fear', correct: false },
      ],
      explain: 'The other card offers two doors and insists you take one: either the fear is fake or the enjoyment is. There is a third. The fear is real and something else has been removed from it, which is what every serious answer here has in common.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Paradox of Tragedy',
      points: [
        'We seek out feelings in art that we flee in life',
        'The feeling itself is real, not pretended',
        'A frame removes the consequence, not the fear',
        'Purged, converted, or paid for — every answer keeps the fear',
      ],
      closing: 'Nothing followed the sound at all. Listening turns out to be worth the price of a ticket.',
    },
    dur: 3.0,
  },
];
