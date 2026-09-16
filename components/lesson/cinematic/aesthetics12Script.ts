import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-12, "Who Decides What Art Means?" — the
// intentional fallacy, staged as two candidate sources of meaning standing in the
// same square.
//
// THE PICTURE (H64): a poem pinned up on a public board, and a small SEALED BOX
// riding above the poet's head. Over the lesson the board fills with marks — every
// reader who stops lands on the same word — while the box never once opens, because
// "neither available nor desirable" is exactly what Wimsatt and Beardsley said about
// the thing inside it. The change is a wall filling with agreement beside a box that
// stays shut.
//
// Q1 is the nuanced one and lives in the deck (E34). Q2 is the one the picture can
// put directly — tap the thing that can settle the meaning — and is answered on the
// stage (H65).

export interface Aes12Beat extends BaseBeat {
  /** Poet gesture (emote code). He holds one mark all lesson and never walks. */ p?: number;
  /** Reader gesture (emote code). */ r?: number;
  /** Where the reader stands (stage x). 456 = off-stage right, 224 = his mark. */ rx?: number;
  /** Marks under the poem: how many readers have landed on the same word, 0..5. */ ticks?: number;
  /** 1 = the sealed box is up over the poet's head. */ box?: number;
  /** 1 = the two answer cards are live on the stage (Q2). */ pick?: number;
}

export const BEATS: Aes12Beat[] = [
  {
    p: 383, r: 0, rx: 456, ticks: 0, box: 0,
    text: 'Suppose a poem is posted in a public square for anyone to read. The poet claims that every reader has misread the poem.',
    dur: 4.2,
  },
  {
    p: 163, r: 1, rx: 224, ticks: 1, box: 0,
    text: 'A reader concludes the poem expresses grief. The image of a lamp left burning for someone, now gone out, supports the reading.',
    cite: 'The first reading',
    dur: 3.2,
  },
  {
    p: 163, r: 1, rx: 224, ticks: 1, box: 0,
    text: 'Nothing in the text of the poem suggests irony or a joke.',
    dur: 1.8,
  },
  {
    p: 170, r: 21, rx: 224, ticks: 3, box: 1,
    text: 'Every reader who studies the poem reaches the same reading. What the poet meant, however, is private and can’t be checked.',
    cite: 'Two sources of meaning',
    dur: 4.8,
  },
  {
    p: 129, r: 44, rx: 224, ticks: 3, box: 1,
    quote: {
      id: 'lq-aesthetics-aesthetics-12-1',
      text: 'The design or intention of the author is neither available nor desirable as a standard for judging the success of a work of literary art.',
      author: 'W. K. Wimsatt & Monroe Beardsley',
      work: 'The Intentional Fallacy',
      era: '1946',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.8,
  },
  {
    p: 276, r: 45, rx: 224, ticks: 5, box: 1,
    text: 'The poet now insists that the last line was meant as a joke. Yet two more readers examine the poem and reach the same reading.',
    cite: 'The author’s claim',
    dur: 3.5,
  },
  {
    p: 276, r: 45, rx: 224, ticks: 5, box: 1,
    text: 'Wimsatt and Beardsley called appeals like this the intentional fallacy. It treats the author’s intention as the standard of a poem’s meaning.',
    dur: 1.8,
  },
  {
    p: 384, r: 4, rx: 224, ticks: 5, box: 1,
    interact: {
      prompt: 'How far is a poem’s meaning fixed by the poem, and how far by the poet?',
      split: {
        left: 'IN THE POEM', right: 'IN THE POET',
        start: 0.04,
        zones: [
          { id: 'poet', upto: 0.3, reads: 'in the poet, whose intention decides' },
          { id: 'both', upto: 0.66, reads: 'shared between the poem and the poet' },
          { id: 'poem', upto: 1, reads: 'in the poem, which every reader can examine', correct: true },
        ],
      },
      explain: 'In the poem, which every reader can examine. Wimsatt and Beardsley argue that what a poet meant is private, so it can’t be a public test. Letting it decide meaning is the intentional fallacy. An equal share still gives half the say to something no one can check.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 169, r: 5, rx: 224, ticks: 5, box: 1, pick: 1,
    interact: {
      prompt: 'If the poet says the last line was a joke, what settles the poem’s meaning?',
      explain: 'The pinned poem. The poet’s intention seems authoritative because it’s the poem’s source. Yet no reader can inspect it, so it can’t settle a dispute. The text on the board is public, and any reading can be checked against it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 139, r: 33, rx: 224, ticks: 5, box: 1,
    summary: {
      title: 'The Intentional Fallacy',
      points: [
        'Intention is private and cannot be inspected',
        'The intentional fallacy lets intention decide meaning',
        'Meaning is found in the public text',
        'An author’s own reading has no special authority',
      ],
      closing: 'For Wimsatt and Beardsley, a poem belongs to the public once written, beyond its author’s control.',
    },
    dur: 3.2,
  },
];
