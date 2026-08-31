import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-21, "What Kind of Thing Is an Artwork?"
// Theme: DESTROY EVERY COPY AND SEE WHICH WORK IS ACTUALLY GONE.
//
// The type/token distinction is dry as a definition and immediate as a test, so
// the scene is the test: three works, and a destruction that runs through all of
// them. Six copies of the novel go and the novel does not. One canvas goes and
// the painting does.
//
// Nothing here is metaphorical. The reader is watching an inventory shrink to
// zero in three columns and reading off which column lost its work — which is
// exactly the difference Goodman gave the two categories their names for.
//
// GAMIFIED SHAPE:
//   · beat 5  SCENE TARGETS — three works, tap the one that is really gone. The
//     decoys are the novel and the symphony, and readers pick them when they
//     think of the copies as the work rather than as copies of it (H66).
//   · beat 7  two CARDS — the case that makes the neat rule uncomfortable, which
//     is a photograph, and the lesson does not pretend it is settled.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes21Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** The three works and their stock, 0…1. */ works?: number;
  /** How far the destruction has run, 0…1. */ burn?: number;
  /**
   * The verdict plates under each column, 0…1 — and they are the REVEAL, so the
   * scene holds them at 0 until the stage question has been answered however high
   * this goes. They used to be up two beats before that question, which printed
   * GONE under its own answer.
   */
  gone?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
}

export const BEATS: Aes21Beat[] = [
  {
    p: 25, x: 200, works: 1,
    text: 'Three works, and the stock of each. Six printings, four recordings, one canvas.',
    dur: 3.8,
  },
  {
    p: 45, x: 200, works: 1, burn: 0.5,
    text: 'Now start burning. Every copy of the novel, every recording of the symphony, and the painting on the wall.',
    cite: 'The test',
    dur: 4.4,
  },
  {
    p: 2, x: 132, works: 1, burn: 1,
    text: 'Two of those three works survived that. You could print the novel again tomorrow from the text.',
    dur: 4.2,
  },
  {
    p: 13, x: 132, works: 1, burn: 1,
    text: 'The painting cannot come back. There was never a text of it. The object was the work.',
    cite: 'One of a kind',
    dur: 4.2,
  },
  {
    p: 4, x: 132, works: 1, burn: 1, gone: 1, live: 1,
    interact: {
      prompt: 'Tap the work that is actually gone.',
      explain: 'The painting. A novel is a pattern that copies carry, so losing every copy loses the copies. A painting has no notation behind it: there is nothing to print from, and a perfect forgery would be a different object made later by somebody else.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 137, x: 268, works: 1, burn: 1, gone: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-21-2',
      text: 'A work of art is autographic if and only if the distinction between original and forgery of it is significant.',
      author: 'Nelson Goodman',
      work: 'Languages of Art',
      era: '1968',
      philosopherId: 'nelson-goodman',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.8,
  },
  {
    p: 21, x: 268, works: 1, burn: 1, gone: 1,
    text: 'Then photography walks in and makes a mess of it. Prints from one negative, and people still queue for the first one.',
    dur: 4.8,
  },
  {
    p: 41, x: 268, works: 1, burn: 1, gone: 1,
    interact: {
      prompt: 'Slide the seam to divide a photograph between the two kinds.',
      split: {
        left: 'LIKE A NOVEL', right: 'LIKE A PAINTING',
        start: 0.04,
        zones: [
          { id: 'paint', upto: 0.3, reads: 'like a painting, the print is the work' },
          { id: 'both', upto: 0.66, reads: 'both at once, and that is the trouble', correct: true },
          { id: 'novel', upto: 1, reads: 'like a novel, the negative is the work' },
        ],
      },
      explain: 'The middle, uncomfortably. The negative works like a text, so any print carries the image and burning one destroys nothing. And yet the market treats an early signed print as the object, which is how we treat paintings. The rule is real and photography sits across it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Copies and Originals',
      points: [
        'Some works are patterns that any correct copy carries',
        'Others are a particular object, and a copy is a different thing',
        'The test is whether destroying every copy destroys the work',
        'Photography and printmaking sit awkwardly across the line',
      ],
      closing: 'Burn the library and the novel survives. Burn the canvas and you have finished it.',
    },
    dur: 3.4,
  },
];
