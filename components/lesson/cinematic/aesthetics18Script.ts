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
    p: 172, x: 200, curve: 1,
    text: 'Consider a piece of music that listeners call sad. Its melody is slow, low in pitch and falling.',
    dur: 4.2,
  },
  {
    p: 384, x: 200, curve: 1, body: 1,
    text: 'A person who has had bad news shows the same contour. Their posture is slow, low and falling.',
    cite: 'Resemblance',
    dur: 4.2,
  },
  {
    p: 447, x: 132, curve: 1, body: 1, match: 1,
    text: 'This is the resemblance theory. Music sounds sad because its contour is like the way sad people move.',
    dur: 4.4,
  },
  {
    p: 395, x: 132, curve: 1, body: 1, match: 1, empty: 1,
    text: 'The theory must admit a difficulty. A contour is not a mood, and no one in the notes feels sad.',
    cite: 'Who is sad?',
    dur: 4.8,
  },
  {
    p: 467, x: 132, curve: 1, body: 1, match: 1, empty: 1, live: 1,
    interact: {
      prompt: 'Which panel shows a property the music itself has?',
      explain: 'The music’s contour. A melody has a shape, a pace and a direction, and all of these are in the notes. No one in the score is having an experience, so the panel asking who is sad stays empty.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 128, x: 268, curve: 1, body: 1, match: 1, empty: 1,
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
    text: 'A second puzzle concerns the listener. Why do people choose music that makes them feel sad?',
    dur: 4.6,
  },
  {
    p: 383, x: 268, curve: 1, body: 1, empty: 1,
    interact: {
      prompt: 'Which of these is not in the notes?',
      odd: {
        axis: 'THREE ARE IN THE NOTES',
        tiles: [
          { id: 'fall', reads: 'A FALLING LINE' },
          { id: 'slow', reads: 'A SLOW PACE' },
          { id: 'minor', reads: 'A MINOR KEY' },
          { id: 'grief', reads: 'GRIEF', correct: true },
        ],
      },
      explain: 'Grief. The first three are written down and anyone can point to them; the sorrow isn\'t a fourth thing on the page. The music has the shape of grief, and the feeling belongs to the listener.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Shape of a Feeling',
      points: [
        'Music’s contour, pace and direction resemble human expressive behaviour',
        'Resemblance explains the recognition without giving the notes a mood',
        'The feeling occurs in the listener, not in the score',
        'Sad music brings no real loss, so people choose it',
      ],
      closing: 'Music can be expressive of sadness even though no one in it feels anything.',
    },
    dur: 3.4,
  },
];
