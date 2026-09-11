import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-25, "Is Your Taste Really Yours?"
// Theme: TWO VIEWERS, ONE CANVAS, AND THE SHELF EACH ARRIVED CARRYING.
//
// Bourdieu's claim is about the VIEWER and not about the picture, so the scene
// draws the same canvas twice and lets everything else differ. Two frames, drawn
// from one set of styles so they cannot come out different by accident; under
// each, a stack of what a childhood handed over. One stack is six deep and one is
// a single slab.
//
// That is the whole argument in the composition: if the canvases are identical
// and the experience is not, the difference walked in through the door.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps the thing that is
//     not the same for both visitors. On the stage because the picture has
//     already shown two of the three answers to be identical.
//   · beat 9  a SORT — where loving difficult films belongs. The reader's own chip
//     draws the arrows into the viewer: one from the heart, one from the shelf,
//     or both at once, which is the answer the lesson argues for.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aesthetics25Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two frames and their visitor names stand. */ frames?: number;
  /** How much of each stack has been laid, 0…1. */ shelves?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
  /** 1 = the single viewer and the two feeds into him are drawn. */ feeds?: number;
}

export const BEATS: Aesthetics25Beat[] = [
  {
    p: 2, x: 40,
    text: 'Name the thing you find most beautiful. A sociologist will guess where you grew up.',
    dur: 4.2,
  },
  {
    p: 30, x: 40, frames: 1,
    text: 'Two visitors stand at the same canvas.',
    dur: 2.8,
  },
  {
    p: 36, x: 40, frames: 1,
    text: 'One reads it at once. The other doesn’t know where to start.',
    dur: 3.6,
  },
  {
    p: 160, x: 40, frames: 1, shelves: 1,
    text: 'Pierre Bourdieu asked what each of them walked in carrying.',
    dur: 3.4,
  },
  {
    p: 161, x: 40, frames: 1, shelves: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what is not the same for both visitors.',
      explain: 'What they brought. The canvas is one canvas, and the second visitor looked at it for just as long. The picture shows both. Only the stack under each one differs.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 40, frames: 1, shelves: 1,
    text: 'Bourdieu called it cultural capital. Books at home, gallery trips, the talk at the table.',
    dur: 4.4,
  },
  {
    p: 62, x: 96, frames: 1, shelves: 1,
    text: 'Cultural capital arrives so early it feels like your own eye.',
    dur: 3.4,
  },
  {
    p: 433, x: 96, frames: 1, shelves: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-25-1',
      text: 'Taste classifies, and it classifies the classifier.',
      author: 'Pierre Bourdieu',
      philosopherId: 'pierre-bourdieu',
      work: 'Distinction',
      era: '1979',
      branchSlugs: ['aesthetics'],
    },
    dur: 4.0,
  },
  {
    p: 383, x: 96, frames: 1, shelves: 1,
    text: 'Kant praised a pure pleasure in form. Bourdieu answered that only some people can afford one.',
    dur: 4.6,
  },
  {
    p: 21, x: 96, feeds: 1,
    interact: {
      prompt: 'You love difficult films. Where does that love belong?',
      sort: {
        chip: 'loving difficult films',
        bins: [
          { id: 'heart', label: 'sincere', reads: 'felt straight from the eye, and owing nothing to anyone' },
          { id: 'shelf', label: 'positioning', reads: 'a signal, sent to mark you out as cultured' },
          { id: 'both', label: 'both', reads: 'really felt, and shaped long before you felt it', correct: true },
        ],
      },
      explain: 'Both, and Bourdieu needs it to be both. The love is sincere because the training finished years ago. Calling it a pose would make it easy to deny, and that’s not the claim.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Where Taste Comes From',
      points: [
        'Preferences track class as well as temperament',
        'Cultural capital is handed over by upbringing',
        'A trained eye feels like an untrained one',
        'The disinterested gaze costs money to afford',
      ],
      closing: 'The next time something strikes you as beautiful, ask yourself who taught you to see it that way.',
    },
    dur: 3.6,
  },
];
