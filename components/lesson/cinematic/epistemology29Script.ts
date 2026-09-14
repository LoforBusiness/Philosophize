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
    text: 'Consider two cooks who both know a recipe word for word. When the sauce splits, one of them can’t save it.',
    dur: 4.8,
  },
  {
    p: 446, x: 26, tiles: 1, wired: 0.9,
    text: 'The other cook saves it at once. Both know the same facts, but only the second understands why the recipe works.',
    dur: 5.0,
  },
  {
    p: 266, x: 26, tiles: 1, wired: 0.9, fresh: 1,
    text: 'Understanding is knowing why. Grasping how facts explain one another lets understanding extend to new cases.',
    dur: 5.0,
  },
  {
    p: 164, x: 26, tiles: 1, wired: 0.9, fresh: 1, plates: 1, live: 1,
    interact: {
      prompt: 'What can a score earned by memorising fail to show?',
      explain: 'Whether the pieces connect. A memorised score measures recall, and understanding shows itself where recall runs out, in new cases. Adding facts wouldn’t connect the ones already held.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 460, x: 80, tiles: 1, wired: 0.9, fresh: 1,
    text: 'Suppose a student passes a physics test by memorising the answers. She can’t solve a problem she hasn’t seen.',
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
    text: 'Every fact she holds is true, but the facts are unconnected. Nothing in them lets her apply them to a new case.',
    dur: 5.0,
  },
  {
    p: 172, x: 80, tiles: 1, fresh: 1,
    interact: {
      prompt: 'What does understanding add to knowing the facts?',
      poll: {
        options: [
          { id: 'more', reads: 'knowledge of a correct explanation, nothing more', holders: ['Kareem Khalifa'] },
          { id: 'links', reads: 'a grasp of how the facts connect', holders: ['Plato', 'Jonathan Kvanvig'], correct: true },
          { id: 'nothing', reads: 'nothing objective, only a feeling of insight', holders: ['Carl Hempel'] },
        ],
      },
      explain: 'A grasp of how the facts connect. That grasp lets understanding extend to cases nobody rehearsed. A mere feeling of insight couldn’t do that, so understanding adds something objective.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 313, x: 80, tiles: 1, wired: 1, fresh: 1, solved: 1,
    summary: {
      title: 'Knowing and Understanding',
      points: [
        'Knowledge often arrives as isolated facts',
        'Understanding is grasping why they hold together',
        'A grasp transfers to cases you have never met',
        'Unconnected facts don’t extend to new cases',
      ],
      closing: 'Being able to explain a subject to someone else is a good test of understanding it.',
    },
    dur: 5.0,
  },
];
