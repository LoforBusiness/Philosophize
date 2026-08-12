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
    text: 'Burke split our reactions in two. A flower is beautiful: small, smooth, pleasing. A storm, or a vast mountain, is sublime — it overwhelms, mixing terror with a strange delight.',
    cite: 'Beyond beauty',
    dur: 5.0,
  },
  {
    p: 15, vast: 1, flower: 0, split: 3,
    text: 'Stand on a cliff in a gale. The drop could kill you — yet you are safe. Real danger, held at a distance, leaves a delight tinged with terror, unlike any gentle pleasure.',
    cite: 'Terror at a safe distance',
    dur: 5.0,
  },
  {
    p: 128, vast: 1, split: 3,
    quote: {
      id: 'lq-aesthetics-aesthetics-6-1',
      text: 'Infinity has a tendency to fill the mind with that sort of delightful horror, which is the most genuine effect and truest test of the sublime.',
      author: 'Edmund Burke',
      work: 'A Philosophical Enquiry',
      era: '1757',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.6,
  },
  {
    p: 25, vast: 1, split: 3,
    interact: {
      prompt: 'For Burke, what feeling marks the sublime apart from the merely beautiful?',
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
    p: 4, vast: 1, split: 3, mind: 1,
    text: 'Kant moved the awe inward. The sublime overwhelms the senses, yes — but the true awe, he said, is reason discovering it can grasp infinity in thought. The mind, not the mountain, is sublime.',
    cite: 'Kant — awe in the mind',
    dur: 5.0,
  },
  {
    p: 15, vast: 1, split: 3, mind: 1,
    interact: {
      prompt: '"The sublime just means something extremely beautiful." Accurate?',
      cards: [
        { text: 'No, awe and terror', correct: true },
        { text: 'Yes, very beautiful', correct: false },
      ],
      explain: 'The trap: "sublime sounds like a fancy word for very beautiful." Burke set them apart — the sublime overwhelms with awe and terror; beauty pleases and soothes.',
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
