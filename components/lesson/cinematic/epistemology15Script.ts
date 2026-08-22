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
}

export const BEATS: Epi15Beat[] = [
  {
    g: 25, cells: 4,
    dur: 4.6,
    text: 'Two questions about anything you know. Did you need to look? And does it tell you something, or only unpack a word?',
  },
  {
    g: 45, cells: 4, dealt: 3,
    dur: 5.0,
    text: 'Three of the boxes fill straight away. Bachelors are unmarried. The chair is over there. And the fourth box is supposed to be empty.',
    cite: 'Three easy ones',
  },
  {
    g: 13, cells: 4, dealt: 3,
    dur: 4.8,
    text: 'Empty because of an old rule. If you did not have to look, you learned nothing new. If you learned something new, you had to look.',
    cite: 'The rule',
  },
  {
    g: 137, cells: 4, dealt: 3,
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
    g: 21, cells: 4, dealt: 3, sum: 1,
    dur: 4.8,
    text: 'Kant drops one card into the empty box. Seven plus five is twelve. You ran no experiment, and twelve was not sitting inside seven and five.',
    cite: 'Into the fourth box',
  },
  {
    g: 4, cells: 4, dealt: 3, sum: 1, pick: 1,
    dur: 1.0,
    interact: {
      prompt: 'Tap the box where 7 + 5 = 12 belongs.',
      explain: 'Known before you look, and it still adds something. That is the corner the old rule said was empty, and Kant thought mathematics lives in it — along with the claim that every event has a cause. Nothing you learn by unpacking the words gets you to twelve.',
      xp: 5,
    },
  },
  {
    g: 41, cells: 4, dealt: 3, sum: 1,
    dur: 1.0,
    interact: {
      prompt: 'A friend says knowing 7 + 5 = 12 without checking makes it an empty definition. Why not?',
      cards: [
        { text: 'Twelve is not inside them', correct: true },
        { text: 'Because you checked once, long ago', correct: false },
      ],
      explain: 'The other card moves the sum into the box below and makes it something you learned by looking. Nobody counts to twelve on their fingers and calls it an experiment. Twelve is not contained in seven, five and plus. That is what makes the sum informative.',
      xp: 5,
    },
  },
  {
    summary: {
      title: 'Before You Look',
      points: [
        'A priori is known without checking; a posteriori needs experience',
        'Analytic truths unpack a definition; synthetic ones add content',
        'Kant claims a fourth box: synthetic and a priori',
        'Maths and causation are his examples of it',
      ],
      closing: 'Mind and world meet halfway. Neither pure reason nor raw experience knows alone.',
    },
    dur: 3.0,
  },
];
