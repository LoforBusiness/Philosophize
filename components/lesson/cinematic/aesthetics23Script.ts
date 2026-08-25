import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-23, "Can Music Mean Anything?"
// Theme: A TUNE ON A STAVE, AND AN ARROW LOOKING FOR SOMETHING TO POINT AT.
//
// Expression and representation get run together constantly, and the reason is
// that both get called "meaning". Having a mood and being about a thing are
// different jobs. A painting of an apple points at apples. A sad adagio points
// at nothing whatever, and is still sad.
//
// So the picture gives the stave one arrow and three places to aim it, and moves
// the arrow rather than talking about aiming. The third plate is not a joke: for
// most instrumental music, pointing at nothing outside itself is the answer, and
// it is the answer that sounds like a failure until you notice the music is not
// trying.
//
// GAMIFIED SHAPE:
//   · beat 3  SCENE TARGETS — tap where a fugue with no title points. A MOOD is
//     the rival, and it is a good one: the fugue does have a mood, which is
//     precisely the thing that is not pointing (H66).
//   · beat 7  a LEVER — three settings for what most instrumental music does,
//     and the middle one is the distinction the whole lesson turns on.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes23Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The stave and its notes, 0…1. */ stave?: number;
  /** The three candidate plates and the caption, 0…1. */ plates?: number;
  /** The arrow, 0…1. */ point?: number;
  /** Which plate the arrow is over: 0, 1 or 2. */ aim?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aes23Beat[] = [
  {
    p: 25, x: 200, stave: 1,
    text: 'Seven notes, no words. It can move you to tears. Now try to say what it was about.',
    dur: 4.4,
  },
  {
    p: 2, x: 200, stave: 1, plates: 1, point: 1, aim: 0,
    text: 'A mood, easily. Slow drooping lines sound sorrowful, the way a slow drooping person does.',
    cite: 'Expression',
    dur: 4.4,
  },
  {
    p: 45, x: 132, stave: 1, plates: 1, point: 1, aim: 1,
    text: 'A bird, sometimes. Trilling violins can imitate birdsong, though the printed title is doing most of the pointing.',
    cite: 'Representation',
    dur: 4.8,
  },
  {
    p: 4, x: 132, stave: 1, plates: 1, point: 1, aim: 1, live: 1,
    interact: {
      prompt: 'Tap where a fugue with no title points.',
      explain: 'At nothing outside itself. A mood is the tempting answer and the fugue may well have one, but having a mood is not pointing at anything. Strip the title off the birdsong piece and you have lively trills.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 21, x: 132, stave: 1, plates: 1, point: 1, aim: 2,
    text: 'Most instrumental music works this way. The music is not about anything. The music is a shape made of tones.',
    cite: 'Absolute music',
    dur: 4.4,
  },
  {
    p: 137, x: 268, stave: 1, plates: 1, point: 1, aim: 2,
    quote: {
      id: 'lq-aesthetics-aesthetics-23-2',
      text: 'Music is by no means like the other arts the copy of the Ideas, but the copy of the will itself.',
      author: 'Arthur Schopenhauer',
      work: 'The World as Will and Representation',
      era: '1818',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.2,
  },
  {
    p: 13, x: 268, stave: 1, plates: 1, point: 1, aim: 2,
    text: 'That is the grand objection. Music points at nothing you can see because it copies the wanting underneath everything.',
    dur: 4.6,
  },
  {
    p: 41, x: 268, stave: 1, plates: 1, point: 1, aim: 2,
    interact: {
      prompt: 'Set the lever to what most instrumental music does.',
      lever: {
        start: 0,
        stops: [
          { id: 'nothing', reads: 'no mood, no object, only shape' },
          { id: 'mood', reads: 'has a mood, points at nothing', correct: true },
          { id: 'objects', reads: 'names things the way words do' },
        ],
      },
      explain: 'The middle setting, and it is two jobs rather than one. A slow line sounds sorrowful without being about anything. Naming an object takes a title, and once you notice that, the title is doing the pointing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Mood Without An Object',
      points: [
        'Expressing is having a mood',
        'Representing is being about something else',
        'Most instrumental music does the first and not the second',
        'Titles carry far more of the pointing than the notes do',
      ],
      closing: 'Music moves you and is about nothing. Take that as the interesting part, not as a shortfall.',
    },
    dur: 3.6,
  },
];
