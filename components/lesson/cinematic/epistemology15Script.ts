import type { BaseBeat } from './cinematicKit';

// Cinematic epistemology-knowledge-15, "What You Know Before You Look"
//
// THE PICTURE: a grid of four boxes. Down one side, whether a truth is known BEFORE
// you look or only after; across the other, whether it merely unpacks a definition
// or genuinely adds something. Three of the four fill up immediately. The fourth is
// the one everybody says cannot exist, and Kant puts a card in it (H64).
//
// Almost every telling of this loses the reader in the vocabulary, because four
// terms arrive in one paragraph and none of them is a picture. As a grid it is not
// vocabulary at all — it is an empty square, and the question is whether anything
// goes in it.
//
// STAGING: the Q1 targets are the four cells. The decoys are not wrong answers so
// much as the three positions the grid already explains, so tapping the wrong one
// is a readable mistake rather than a guess (H66).

export interface Epi15Beat extends BaseBeat {
  /** Figure gesture (emote code). */ g?: number;
  /** How many of the grid's cells are drawn, 0…4. */ cells?: number;
  /** How many example cards have been dealt into cells, 0…3. */ dealt?: number;
  /** The sum sitting in the fourth cell, 0…1. */ sum?: number;
  /** 1 = the four cells are live targets (Q1). */ pick?: number;
  /** 1 = a dashed bracket spans both column headings — the second axis, just
   *  named. */ colRing?: number;
  /** 1 = a dashed ring marks the chair cell — the example this beat names. */ chairRing?: number;
  /** 1 = a dashed ring marks the synthetic a priori cell, while it is still
   *  empty. */ emptyRing?: number;
  /** 1 = a dashed bracket spans the whole "only after you look" row — anything
   *  that adds belongs in it. */ afterRowRing?: number;
  /** 1 = a small check badge lands on the filled synthetic a priori cell. */ confirmMark?: number;
}

export const BEATS: Epi15Beat[] = [
  {
    g: 462, cells: 4,
    dur: 2.3,
    text: 'Two questions can be asked of anything you know. First, could you know it before looking, or only after?',
  },
  {
    g: 462, cells: 4, colRing: 1,
    dur: 2.3,
    text: 'Second, does it add something to what you know, or only unpack a definition?',
  },
  {
    g: 465, cells: 4, dealt: 3,
    dur: 2.1,
    text: 'You know that bachelors are unmarried before looking, by unpacking a word. Kant calls such a truth analytic and a priori.',
    cite: 'Two easy cases',
  },
  {
    g: 465, cells: 4, dealt: 3, chairRing: 1,
    dur: 2.9,
    text: 'You know that the chair is over there only after looking, and it adds something. Kant calls such a truth synthetic and a posteriori.',
  },
  {
    g: 13, cells: 4, dealt: 3, emptyRing: 1,
    dur: 3.1,
    text: 'An empiricist rule, traced to David Hume, holds that the synthetic a priori box is empty. If you did not have to look, you learned nothing new.',
    cite: 'The rule',
  },
  {
    g: 266, cells: 4, dealt: 3, afterRowRing: 1,
    dur: 1.8,
    text: 'Put the other way, anything that adds to your knowledge can be known only after looking.',
  },
  {
    g: 139, cells: 4, dealt: 3,
    dur: 3.8,
    quote: {
      id: 'lq-epistemology-knowledge-15-1',
      text: 'Though all our knowledge begins with experience, it does not follow that it all arises out of experience.',
      author: 'Immanuel Kant',
      work: 'Critique of Pure Reason',
      era: '1781',
      philosopherId: 'immanuel-kant',
      branchSlugs: ['epistemology'],
    },
  },
  {
    g: 176, cells: 4, dealt: 3, sum: 1,
    dur: 2.4,
    text: 'Kant argues that the synthetic a priori box isn’t empty. His example is the truth that seven plus five is twelve.',
    cite: 'Kant’s example',
  },
  {
    g: 176, cells: 4, dealt: 3, sum: 1, confirmMark: 1,
    dur: 2.4,
    text: 'You need no experiment to know it, so it’s a priori. Yet, Kant argues, the concept of twelve isn’t contained in seven, five and addition, so it’s synthetic.',
  },
  {
    g: 4, cells: 4, dealt: 3, sum: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Which box does the truth that seven plus five is twelve belong in?',
      explain: 'Known before you look, yet it adds something. This is the synthetic a priori, the box the empiricist rule declared empty. Kant placed mathematics here, along with the principle that every event has a cause.',
      xp: 5,
    },
  },
  {
    g: 383, cells: 4, dealt: 3, sum: 1,
    dur: 1.0,
    interact: {
      prompt: 'On Kant’s view, is twelve already contained in seven and five, or is it something new?',
      split: {
        left: 'CONTAINED IN SEVEN AND FIVE', right: 'SOMETHING GENUINELY NEW',
        start: 1,
        zones: [
          { id: 'new', upto: 0.32, reads: 'twelve isn’t contained in seven and five', correct: true },
          { id: 'half', upto: 0.66, reads: 'partly contained, partly added' },
          { id: 'inside', upto: 1, reads: 'twelve is contained in seven and five' },
        ],
      },
      explain: 'Twelve isn’t contained in seven and five, on Kant’s view. No analysis of seven, five and plus yields twelve, yet no experiment is needed. So the sum is synthetic a priori. Gottlob Frege later argued that arithmetic is analytic.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Before You Look',
      points: [
        'A priori truths are known independently of experience',
        'Analytic truths unpack a definition, synthetic ones add content',
        'Kant argues that some truths are synthetic a priori',
        'Kant’s examples include arithmetic and the causal principle',
      ],
      closing: 'For Kant, some knowledge about the world rests on the mind’s own structure rather than on experience.',
    },
    dur: 3.0,
  },
];
