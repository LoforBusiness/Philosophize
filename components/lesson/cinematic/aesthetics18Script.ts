import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-18, "How Can Music Be Sad?"
// Theme: A FALLING SHAPE THE MUSIC MAKES, AND THE SAME FALL IN A SHOULDER.
//
// The resemblance theory is one of the few claims in aesthetics that a picture
// can just settle, so the scene settles it: the melodic contour and the posture
// contour are DRAWN FROM ONE ARRAY OF NUMBERS. Not two similar curves placed
// side by side — literally the same values, once as pitch over time and once as
// the line of a body. If they look alike it is because they are alike, and the
// file says so.
//
// Then the part the theory cannot do. A third panel asks who is sad, and stays
// empty for the rest of the lesson. Nothing dims it and nothing fills it later.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — three panels, tap what the music actually has.
//     The decoy is the empty panel, which is what everyone reaches for because
//     the music plainly does something to you (H66).
//   · beat 7  two CARDS — where the feeling is, if it is not in the notes.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes18Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** How much of the melodic contour is drawn, 0…1. */ curve?: number;
  /** The posture panel beside it, 0…1. */ body?: number;
  /** The tie-lines between the two contours, 0…1. */ match?: number;
  /** The third panel, which asks who is sad, 0…1. */ empty?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aes18Beat[] = [
  {
    p: 25, x: 200, curve: 1,
    text: 'A piece of music everyone calls sad. Here is its shape: slow, low, and going down.',
    dur: 4.2,
  },
  {
    p: 2, x: 200, curve: 1, body: 1,
    text: 'And here is a person who has had bad news. Same slope, drawn from the same numbers.',
    cite: 'Resemblance',
    dur: 4.2,
  },
  {
    p: 45, x: 132, curve: 1, body: 1, match: 1,
    text: 'That is the whole theory. We hear the music as sad because it moves the way sadness moves.',
    dur: 4.4,
  },
  {
    p: 395, x: 132, curve: 1, body: 1, match: 1, empty: 1,
    text: 'Now the awkward panel. A shape is not a mood, and there is nobody inside the notes to be having one.',
    cite: 'So who is sad?',
    dur: 4.8,
  },
  {
    p: 4, x: 132, curve: 1, body: 1, match: 1, empty: 1, live: 1,
    interact: {
      prompt: 'Tap the panel that holds what the music actually has.',
      explain: 'The contour. A tune has a shape, a speed and a direction, and every one of those is in the notes. Nothing in the score is having an experience. The empty panel is empty because there is no one in there for it to be about.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 268, curve: 1, body: 1, match: 1, empty: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-18-2',
      text: 'Music is not the cause or the cure of feelings, but their logical expression.',
      author: 'Susanne Langer',
      work: 'Philosophy in a New Key',
      era: '1942',
      philosopherId: 'susanne-langer',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 21, x: 268, curve: 1, body: 1, empty: 1,
    text: 'Which leaves a real puzzle. If nothing in there is sad, why do people pay to sit and be made miserable?',
    dur: 4.6,
  },
  {
    p: 41, x: 268, curve: 1, body: 1, empty: 1,
    interact: {
      prompt: 'Sad music moves you. Where is the sadness?',
      split: {
        left: 'IN THE LISTENER', right: 'IN THE NOTES',
        start: 0.5,
        zones: [
          { id: 'notes', upto: 0.34, reads: 'the sadness sits in the sound' },
          { id: 'both', upto: 0.66, reads: 'half in the sound, half in you' },
          { id: 'you', upto: 1, reads: 'the notes carry a shape, you do the feeling', correct: true },
        ],
      },
      explain: 'In the listener. The notes carry a shape, you recognise it, and the feeling happens in you. That is also why it is bearable: nothing has actually gone wrong in your life, so you get the shape of grief without the loss.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Shape of a Feeling',
      points: [
        'Music has contour, pace and direction, and these resemble how we behave',
        'Resemblance explains the recognition without giving the notes a mood',
        'The feeling occurs in the listener, not in the score',
        'That is why sad music is something people choose',
      ],
      closing: 'The third panel is still empty, and the music still works.',
    },
    dur: 3.4,
  },
];
