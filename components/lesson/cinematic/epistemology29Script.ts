import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic epistemology-knowledge-29, "Knowing That Versus Grasping Why"
// Theme: NINE TILES IN A HEAP, AND THE SAME NINE WIRED TOGETHER.
//
// The difference between knowing and understanding is not a difference in what
// is in somebody's head — it is a difference in how the contents are joined. So
// the stage draws one set of tiles and changes nothing about them but the wires.
//
// The tile count never moves. A reader who thinks the answer is more facts can
// look at the heap and see that another tile would not help.
//
// GAMIFIED SHAPE:
//   · beat 4  SCENE TARGETS — three plates, and the reader taps what a memorised
//     test score fails to show. On the stage because the heap is right there and
//     the missing thing is visibly not another tile.
//   · beat 8  a POLL — what the student is short of, and who said so. The wires
//     draw themselves as the answer moves, so a position becomes a picture.
// ─────────────────────────────────────────────────────────────────────────────

export interface Epistemology29Beat extends BaseBeat {
  /** Figure gesture code. */ p?: number;
  /** 1 = the nine tiles are on the board. */ tiles?: number;
  /** How many of the wires between them are drawn, 0…1. */ wired?: number;
  /** 1 = the new case waiting above the board is drawn. */ fresh?: number;
  /** How far the new case has been solved, 0…1. */ solved?: number;
  /** 1 = the three plates the reader chooses between are up. */ plates?: number;
  /** 1 = the reader is answering on the stage this beat. */ live?: number;
};

export const BEATS: Epistemology29Beat[] = [
  {
    p: 423, x: 26, tiles: 1,
    text: 'You can memorise every fact on the page and understand none of it.',
    dur: 4.4,
  },
  {
    p: 170, x: 26, tiles: 1,
    text: 'Two cooks know the recipe word for word. One panics when the sauce splits.',
    dur: 4.8,
  },
  {
    p: 446, x: 26, tiles: 1, wired: 0.9,
    text: 'The other rescues it in seconds. Same facts in both heads, and only one of them grasps the dish.',
    dur: 5.0,
  },
  {
    p: 266, x: 26, tiles: 1, wired: 0.9, fresh: 1,
    text: 'Understanding is knowing why. Seeing how the pieces hold each other up is what lets it travel.',
    dur: 5.0,
  },
  {
    p: 164, x: 26, tiles: 1, wired: 0.9, fresh: 1, plates: 1, live: 1,
    interact: {
      prompt: 'Tap what a memorised test score cannot show.',
      explain: 'Whether the pieces connect. A score measures what you can recall, and understanding shows up where recall runs out. More facts would be one more tile on a heap that was never short of tiles.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 460, x: 80, tiles: 1, wired: 0.9, fresh: 1,
    text: 'A student aces the physics test by memorising answers. A new problem defeats her completely.',
    dur: 5.0,
  },
  {
    p: 439, x: 80, tiles: 1, wired: 0.9, fresh: 1,
    quote: {
      id: 'lq-epistemology-knowledge-29-1',
      text: 'Wonder is the feeling of a philosopher, and philosophy begins in wonder.',
      author: 'Plato (Socrates speaking)',
      work: 'Theaetetus',
      era: 'c. 369 BCE',
      philosopherId: 'plato',
      branchSlugs: ['epistemology'],
    },
    dur: 4.6,
  },
  {
    p: 456, x: 80, tiles: 1, wired: 0.2, fresh: 1,
    text: 'Every fact she has is correct, and the facts sit there in a heap. Nothing carries them to a new case.',
    dur: 5.0,
  },
  {
    p: 172, x: 80, tiles: 1, fresh: 1,
    interact: {
      prompt: 'What is the student actually short of?',
      poll: {
        options: [
          { id: 'more', reads: 'more facts, and a longer list of them' },
          { id: 'links', reads: 'the links that hold the facts together', holders: ['Plato', 'Jonathan Kvanvig'], correct: true },
          { id: 'nothing', reads: 'nothing at all, since the score was high' },
        ],
      },
      explain: 'The links. Understanding is knowledge woven into a structure, which is why it reaches a case nobody rehearsed. A longer list would sit in the same heap, and a high score measured only the rehearsing.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 313, x: 80, tiles: 1, wired: 1, fresh: 1, solved: 1,
    summary: {
      title: 'Knowing and Grasping',
      points: [
        'Knowledge often arrives as isolated facts',
        'Understanding is grasping why they hold together',
        'A grasp transfers to cases you have never met',
        'A stack of facts just sits there',
      ],
      closing: 'Ask yourself whether you could explain it to somebody, and you’ll find out which of the two you have.',
    },
    dur: 5.0,
  },
];
