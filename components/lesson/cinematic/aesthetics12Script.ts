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
    p: 35, r: 0, rx: 456, ticks: 0, box: 0,
    text: 'A poem hangs where anyone can read it. The poet stands across the square and says every reader has got the poem wrong.',
    dur: 4.2,
  },
  {
    p: 9, r: 1, rx: 224, ticks: 1, box: 0,
    text: 'A reader comes away from the board certain: this is grief. The lamp, the waiting, the going out. Nothing on the page hints at a joke.',
    cite: 'The first reading',
    dur: 4.6,
  },
  {
    p: 22, r: 21, rx: 224, ticks: 3, box: 1,
    text: 'Every reader who stops adds another mark, and every mark says the same word. Sealed inside the poet’s head is whatever he actually meant.',
    cite: 'Two places meaning could live',
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
    p: 26, r: 45, rx: 224, ticks: 5, box: 1,
    text: 'Now the poet insists the last line was a joke. Two more readers stop, read, and add the same mark. The box still will not open.',
    cite: 'The claim',
    dur: 4.6,
  },
  {
    p: 20, r: 4, rx: 224, ticks: 5, box: 1,
    interact: {
      prompt: 'Slide the seam to where the meaning lives.',
      split: {
        left: 'IN THE POEM', right: 'IN THE POET',
        start: 0.04,
        zones: [
          { id: 'poet', upto: 0.3, reads: 'in the poet; he says what he meant and that settles it' },
          { id: 'both', upto: 0.66, reads: 'half the poem, half the poet' },
          { id: 'poem', upto: 1, reads: 'in the poem, which every reader can examine', correct: true },
        ],
      },
      explain: 'Nearly all of it in the poem. Taking how a work was made for what the work means is the genetic fallacy. What the poet intended is private and cannot be checked, so it settles nothing in public — and the poem is the one thing everybody can point at.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 30, r: 5, rx: 224, ticks: 5, box: 1, pick: 1,
    interact: {
      prompt: 'The poet says the line was a joke. Tap what actually settles the poem’s meaning.',
      explain: 'The trap: the box feels like the source, so it feels authoritative. But nobody can open it, and an intention nobody can inspect settles nothing. The poem on the board is the one thing every reader can actually check.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 139, r: 33, rx: 224, ticks: 5, box: 1,
    summary: {
      title: 'Meaning Lives in the Work',
      points: [
        'Intention is private and cannot be inspected',
        'The intentional fallacy lets it decide meaning',
        'Meaning is read off the public text',
        'The maker gets a reading, not a verdict',
      ],
      closing: 'The author opens a door, then the work walks through without them.',
    },
    dur: 3.2,
  },
];
