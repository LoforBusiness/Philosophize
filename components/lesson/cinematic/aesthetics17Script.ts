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
    g: 440, x: 74, shape: 1, fear: 0.86,
    dur: 4.4,
    text: 'Suppose you see a shape in the dark. Your heart races, your skin goes cold, and you want to flee.',
  },
  {
    g: 325, x: 160, shape: 1, fear: 0.86, frame: 1,
    dur: 4.8,
    text: 'Yet people pay to feel this fear at a horror film. They choose the racing heart and the cold skin.',
    cite: 'The paradox of horror',
  },
  {
    g: 383, x: 160, shape: 1, fear: 0.86, frame: 1,
    dur: 4.6,
    text: 'Framing the scene as fiction doesn’t reduce the fear. The physical response is as strong inside the frame as outside it.',
    cite: 'The same fear',
  },
  {
    g: 465, x: 160, shape: 1, fear: 0.86, frame: 1,
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
    dur: 2.1,
    text: 'Philosophers have offered three answers. For Aristotle, tragedy arouses pity and fear and brings about their catharsis, or purging.',
    cite: 'Three answers',
  },
  {
    g: 259, x: 160, shape: 1, fear: 0.86, frame: 1,
    dur: 2.9,
    text: 'For Hume, the eloquence of the telling converts the fear into pleasure. For Noël Carroll, fear is the price paid for the pleasure of discovery.',
  },
  {
    g: 165, x: 160, shape: 1, fear: 0.86, frame: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'What does framing the terror as fiction change?',
      explain: 'What happens next. The shape and the fear meter are unchanged, so the fiction doesn’t make the fear unreal. The frame removes only the consequence, since nothing will reach you.',
      xp: 5,
    },
  },
  {
    g: 41, x: 160, shape: 1, fear: 0.86, frame: 1,
    dur: 1.0,
    interact: {
      prompt: 'At a horror film, which account of the viewer’s fear is correct?',
      sort: {
        chip: 'a horror film',
        bins: [
          { id: 'nofear', label: 'fake fear', reads: 'the fear is only pretended' },
          { id: 'nofun', label: 'fake fun', reads: 'the enjoyment is only pretended' },
          { id: 'real', label: 'real fear', reads: 'the fear is real, with the consequences taken out', correct: true },
        ],
      },
      explain: 'Real fear, with the consequences taken out. The viewer’s racing heart is genuine, and so is the enjoyment. What the fiction removes is any real danger. Catharsis, conversion and curiosity all begin from this.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'The Paradox of Horror',
      points: [
        'People seek out feelings in art that they flee in life',
        'The feeling itself is real, not pretended',
        'A frame removes the consequence, not the fear',
        'Catharsis, conversion and curiosity each treat the fear as real',
      ],
      closing: 'Fear without consequences can be worth paying for, and the three answers explain why in different ways.',
    },
    dur: 3.0,
  },
];
