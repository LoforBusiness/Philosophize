import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic political-political-25, "The Personal Is Political"
// Theme: A FRONT DOOR, AND HOW FAR THE REACH OF JUSTICE STOPS SHORT OF IT.
//
// The slogan is about a BOUNDARY, so the scene draws the boundary and then lets
// the reader move a bar across it. Two rooms of equal size, a door between them,
// and a reach that runs from the left. Where the reach stops is the argument, and
// it is one number the reader can put anywhere.
//
// Drawing the two rooms the same size is deliberate. The old picture treated one
// of them as a place where power did not apply, and the fastest way to say that
// is wrong is to give it exactly as much of the stage as the other.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps where classical
//     political philosophy stopped looking. On the stage because the door it
//     stopped at is drawn above them.
//   · beat 9  a DRAG — how far justice reaches. The bar across the rooms IS the
//     reader's thumb, so the answer is the picture rather than a slider beside it.
// ─────────────────────────────────────────────────────────────────────────────

export interface Political25Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the two rooms and the door between them stand. */ rooms?: number;
  /** How far the old reach ran, 0…1 across both rooms. */ reach?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Political25Beat[] = [
  {
    p: 2, x: 44,
    text: 'Who does the dishes turns out to be a question about justice.',
    dur: 3.8,
  },
  {
    p: 30, x: 44, rooms: 1,
    text: 'Political philosophy used to draw a line at the front door.',
    dur: 3.6,
  },
  {
    p: 36, x: 44, rooms: 1, reach: 0.46,
    text: 'Law, work and citizenship were public, and open to argument.',
    dur: 4.0,
  },
  {
    p: 160, x: 44, rooms: 1, reach: 0.46,
    text: 'What happened at home was private, and treated as nature rather than power.',
    dur: 4.6,
  },
  {
    p: 161, x: 44, rooms: 1, reach: 0.46, plates: 1, live: 1,
    interact: {
      prompt: 'Tap where the old picture stopped looking.',
      explain: 'At the front door. The statute and the factory were both public, and both were argued over for centuries. The house was the room the argument was told to stay out of.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 159, x: 44, rooms: 1, reach: 0.46,
    text: 'Feminist thinkers turned the line around. What is private is held there by public rules.',
    dur: 5.0,
  },
  {
    p: 62, x: 100, rooms: 1, reach: 0.46,
    text: 'A mother leaves work when leave favours her and childcare costs more than she earns.',
    dur: 5.0,
  },
  {
    p: 433, x: 100, rooms: 1, reach: 0.46,
    quote: {
      id: 'lq-political-political-25-1',
      text: 'One is not born, but rather becomes, a woman.',
      author: 'Simone de Beauvoir',
      philosopherId: 'simone-de-beauvoir',
      work: 'The Second Sex',
      era: '1949',
      branchSlugs: ['political-philosophy'],
    },
    dur: 4.0,
  },
  {
    p: 383, x: 100, rooms: 1, reach: 0.46,
    text: 'Susan Okin put the point to Rawls. Behind the veil you cannot know your gender either.',
    dur: 5.0,
  },
  {
    p: 21, x: 100, rooms: 1,
    interact: {
      prompt: 'How far should the reach of justice run?',
      drag: {
        lo: 'THE STATUTE BOOK',
        hi: 'THE KITCHEN TABLE',
        start: 0.2,
        zones: [
          { id: 'law', upto: 0.32, reads: 'equal rights on paper, and the door left shut' },
          { id: 'work', upto: 0.64, reads: 'into the workplace, and no further' },
          { id: 'home', upto: 1, reads: 'through the door, to who does what at home', correct: true },
        ],
      },
      explain: 'All the way through. Equal rights on paper leave the care, the money and the deciding exactly where they were — and those are what decide who can use a right outside.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Past The Front Door',
      points: [
        'The old line put law in public and family in private',
        'Private arrangements are held in place by public rules',
        'Okin turned the veil of ignorance on the household',
        'Equal rights leave unequal care untouched',
      ],
      closing: 'The next time something is called just private, ask whose interest that label is protecting.',
    },
    dur: 4.2,
  },
];
