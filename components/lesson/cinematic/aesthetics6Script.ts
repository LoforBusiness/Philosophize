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
    p: 25, vast: 1, flower: 0, split: 0, mind: 0,
    text: 'A storm at sea is terrifying — so why do we stop to watch it? Some experiences thrill us precisely because they dwarf us.',
    dur: 3.6,
  },
  {
    p: 34, vast: 1, flower: 1, split: 3,
    text: 'Burke split our reactions in two. A flower is beautiful: small, smooth, pleasing.',
    cite: 'Beyond beauty',
    dur: 2.2,
  },
  {
    p: 34, vast: 1, flower: 1, split: 3,
    text: 'A storm, or a vast mountain, is sublime — it overwhelms, mixing terror with a strange delight.',
    dur: 2.8,
  },
  {
    p: 15, vast: 1, flower: 0, split: 3,
    text: 'Stand on a cliff in a gale. The drop could kill you, and you are perfectly safe.',
    cite: 'Terror at a safe distance',
    dur: 2.4,
  },
  {
    p: 15, vast: 1, flower: 0, split: 3,
    text: 'Real danger held at a distance is a pleasure of its own, and nothing gentle feels like it.',
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
      prompt: 'Tap the feeling that makes something sublime rather than just beautiful.',
      cards: [
        { text: 'Delight mixed with terror', correct: true },
        { text: 'A gentle, pleasing calm', correct: false },
      ],
      explain: 'The sublime grips us through vastness and power, stirring a delight laced with terror — not the gentle, pleasing calm Burke linked with beauty.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    p: 160, vast: 1, split: 3, mind: 1,
    text: 'Kant moved the awe inward. The mountain does overwhelm your senses.',
    cite: 'Kant — awe in the mind',
    dur: 1.8,
  },
  {
    p: 160, vast: 1, split: 3, mind: 1,
    text: 'But the real jolt, Kant says, is your mind finding that it can hold something that big. The mountain is not the sublime thing.',
    dur: 3.2,
  },
  {
    p: 160, vast: 1, split: 3, mind: 1,
    text: 'You are.',
    dur: 1.8,
  },
  {
    p: 388, vast: 1, split: 3, mind: 1,
    interact: {
      prompt: 'Place the token on the sublime.',
      field: {
        xLo: 'SOOTHING', xHi: 'OVERWHELMING',
        yLo: 'NOTHING TO FEAR', yHi: 'LACED WITH TERROR',
        start: [0.24, 0.24],
        quads: [
          { id: 'sublime', x: 1, y: 1, reads: 'overwhelming, and shot through with terror', correct: true },
          { id: 'beauty', x: 0, y: 0, reads: 'soothing, with nothing to fear: the beautiful' },
          { id: 'grand', x: 1, y: 0, reads: 'overwhelming and not frightening: merely grand' },
          { id: 'uneasy', x: 0, y: 1, reads: 'soothing and frightening at once: an odd corner' },
        ],
      },
      explain: 'Top right, and the beautiful sits diagonally opposite. Sublime sounds like a fancy word for very beautiful, and Burke set them apart on purpose. The sublime works through vastness and power and stirs a delight with terror in it.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    summary: {
      title: 'When Awe Overwhelms Us',
      points: [
        'Burke: beauty soothes, the sublime overwhelms',
        'The sublime mixes terror with delight',
        'Kant: the real awe is in the mind',
      ],
      closing: 'Beauty pleases the eye; the sublime stuns the whole self.',
    },
    dur: 2.8,
  },
];
