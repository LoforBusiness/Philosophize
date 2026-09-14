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
    p: 462, x: 200, works: 1,
    text: 'Consider three works of art. A novel exists in six printed copies, a symphony in four recordings, and a painting on one canvas.',
    dur: 3.8,
  },
  {
    p: 379, x: 200, works: 1, burn: 0.5,
    text: 'Now suppose the six printed copies, the four recordings and the canvas are burnt. Which of the works still exist?',
    cite: 'The destruction test',
    dur: 4.4,
  },
  {
    p: 384, x: 132, works: 1, burn: 1,
    text: 'The novel and the symphony survive. The novel can be printed again from its text, and the symphony played again from its score.',
    dur: 4.2,
  },
  {
    p: 13, x: 132, works: 1, burn: 1,
    text: 'The painting cannot come back. A painting has no notation, such as a text or a score, from which to make another.',
    cite: 'A single object',
    dur: 3,
  },
  {
    p: 13, x: 132, works: 1, burn: 1,
    text: 'The painting was the physical object itself. Nelson Goodman called such works autographic, and works like the novel allographic.',
    dur: 1.8,
  },
  {
    p: 4, x: 132, works: 1, burn: 1, gone: 1, live: 1,
    interact: {
      prompt: 'Which of the three works no longer exists?',
      explain: 'The painting. A novel or a symphony is a pattern that any correct copy carries. Destroying its copies destroys only copies. A painting has no notation to make it from, and even a perfect forgery would be a different object.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 139, x: 268, works: 1, burn: 1, gone: 1,
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
    p: 380, x: 268, works: 1, burn: 1, gone: 1,
    text: 'Photography complicates the distinction. One negative can make many prints, yet collectors pay more for an early print.',
    dur: 4.8,
  },
  {
    p: 41, x: 268, works: 1, burn: 1, gone: 1,
    interact: {
      prompt: 'How far is a photograph like a novel, and how far like a painting?',
      split: {
        left: 'LIKE A NOVEL', right: 'LIKE A PAINTING',
        start: 0.04,
        zones: [
          { id: 'paint', upto: 0.3, reads: 'like a painting: the print itself is the work' },
          { id: 'both', upto: 0.66, reads: 'both at once, so it fits neither category', correct: true },
          { id: 'novel', upto: 1, reads: 'like a novel: any print carries the work' },
        ],
      },
      explain: 'Both at once, so it fits neither category. Any print from the negative carries the image, as any copy carries a novel. Yet collectors treat an early signed print as an original, as they treat a painting.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'Copies and Originals',
      points: [
        'Some works are patterns that any correct copy carries',
        'Others are particular objects, and a copy is another object',
        'The test is whether destroying every copy destroys the work',
        'Photography and printmaking share features of both kinds',
      ],
      closing: 'A novel survives the loss of every copy, because its text can be printed again. A painting doesn’t survive the loss of its canvas.',
    },
    dur: 3.4,
  },
];
