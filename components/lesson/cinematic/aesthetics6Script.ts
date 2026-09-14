import type { BaseBeat } from './cinematicKit';

// Cinematic aesthetics-aesthetics-6, "The Sublime and the Overwhelming".
// A lone figure stands tiny before a vast mountain, snow drifting — dwarfed, awed,
// half-afraid. A small flower nearby is the merely-beautiful foil. The scene carries
// the "delightful horror"; the questions are A/B/C/D (they're about a feeling).

export interface Aes6Beat extends BaseBeat {
  /** Figure gesture. */ p?: number;
  /** The vast mountain's presence 0..1. */ vast?: number;
  /** The little flower (beauty) shown 0..1. */ flower?: number;
  /** Rows of Burke's two-column table written up, 0..3. */ split?: number;
  /** Kant's card — reason holding the infinite — shown 0..1. */ mind?: number;
}

export const BEATS: Aes6Beat[] = [
  {
    p: 379, vast: 1, flower: 0, split: 0, mind: 0,
    text: 'A vast mountain or a storm at sea can frighten you. Why, then, do people seek out such sights for pleasure?',
    dur: 3.6,
  },
  {
    p: 34, vast: 1, flower: 1, split: 3,
    text: 'In 1757, Edmund Burke distinguished two aesthetic responses. The beautiful, like a flower, is small, smooth and pleasing.',
    cite: 'The beautiful and the sublime',
    dur: 2.2,
  },
  {
    p: 34, vast: 1, flower: 1, split: 3,
    text: 'The sublime, like a vast mountain, is rugged and overwhelming. It produces a delight mixed with terror.',
    dur: 2.8,
  },
  {
    p: 15, vast: 1, flower: 0, split: 3,
    text: 'Suppose you stand on a cliff in a gale. The drop could kill you, but you’re well back from the edge.',
    cite: 'Terror at a safe distance',
    dur: 2.4,
  },
  {
    p: 15, vast: 1, flower: 0, split: 3,
    text: 'Burke argued that danger seen from a safe distance is delightful. He distinguished this delight from the positive pleasure of beauty.',
    dur: 2.6,
  },
  {
    p: 128, vast: 1, split: 3,
    quote: {
      id: 'lq-aesthetics-aesthetics-6-1',
      text: 'Infinity has a tendency to fill the mind with that sort of delightful horror, which is the most genuine effect and truest test of the sublime.',
      author: 'Edmund Burke',
      philosopherId: 'edmund-burke',
      work: 'A Philosophical Enquiry',
      era: '1757',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 164, vast: 1, split: 3,
    interact: {
      prompt: 'Which feeling marks an experience as sublime rather than beautiful?',
      cards: [
        { text: 'Delight mixed with terror', correct: true },
        { text: 'A gentle, pleasing calm', correct: false },
      ],
      explain: 'Delight mixed with terror. For Burke, the sublime works through vastness and power, and its pleasure depends on terror held at a distance. A gentle, pleasing calm is how Burke describes the effect of beauty, which relaxes rather than overwhelms.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 457, vast: 1, split: 3, mind: 1,
    text: 'Immanuel Kant placed the sublime in the mind rather than in nature. A mountain overwhelms the imagination, which can’t take in its size.',
    cite: 'Critique of Judgement',
    dur: 1.8,
  },
  {
    p: 457, vast: 1, split: 3, mind: 1,
    text: 'Yet reason can think the infinite as a whole, where the imagination fails. The mountain is not the sublime thing.',
    dur: 3.2,
  },
  {
    p: 457, vast: 1, split: 3, mind: 1,
    text: 'Sublimity lies in your awareness that your reason is superior to nature.',
    dur: 1.8,
  },
  {
    p: 388, vast: 1, split: 3, mind: 1,
    interact: {
      prompt: 'Which of these experiences is the sublime?',
      poll: {
        options: [
          { id: 'sublime', reads: 'overwhelming and fearsome, viewed from safety', holders: ['Edmund Burke', 'Immanuel Kant'], correct: true },
          { id: 'beauty', reads: 'calm, pleasing and safe: the beautiful', holders: ['Edmund Burke', 'Immanuel Kant'] },
          { id: 'grand', reads: 'vast and astonishing, without terror: the great', holders: ['Joseph Addison'] },
          { id: 'uneasy', reads: 'familiar and frightening at once: the uncanny', holders: ['Sigmund Freud'] },
        ],
      },
      explain: 'Overwhelming and fearsome, but seen from safety. Burke made terror, felt at a distance, the mark of the sublime. Vastness without terror lacks that mark.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'The Beautiful and the Sublime',
      points: [
        'Burke: beauty soothes, the sublime overwhelms',
        'The sublime mixes terror with delight',
        'Kant: sublimity lies in the mind, not in nature',
      ],
      closing: 'For Burke, beauty relaxes and the sublime overwhelms. For Kant, the sublime reveals that reason is superior to nature.',
    },
    dur: 2.8,
  },
];
