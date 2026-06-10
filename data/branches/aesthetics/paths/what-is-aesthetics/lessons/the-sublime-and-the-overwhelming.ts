import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-6',
  slug: 'the-sublime-and-the-overwhelming',
  title: 'The Sublime and the Overwhelming',
  description: 'Some things are too vast to call pretty. We call them sublime.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A storm at sea is terrifying. Why watch it?',
      subtext: 'Some experiences thrill precisely because they dwarf us.',
      emoji: '🌊',
    },
    {
      type: 'concept',
      title: 'Beyond Beauty',
      body: 'Burke split our reactions in two. A flower is beautiful: small, smooth, pleasing. A storm or vast mountain is sublime: it overwhelms, mixing terror with a strange delight.',
      visual: '🏔️',
      highlight: 'the sublime',
    },
    {
      type: 'example',
      title: 'Terror at a Safe Distance',
      scenario: 'Stand on a cliff in a gale. The drop could kill you, yet you are safe. Burke noticed this mix: real danger removed leaves a delight tinged with terror, unlike any gentle pleasure.',
      source: 'Edmund Burke, A Philosophical Enquiry (1757)',
      emoji: '🪨',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-6-1',
      quote: 'Infinity has a tendency to fill the mind with that sort of delightful horror, which is the most genuine effect and truest test of the sublime.',
      author: 'Edmund Burke',
      era: '1757',
      work: 'A Philosophical Enquiry',
    },
    {
      type: 'question',
      prompt: 'For Burke, what feeling marks the sublime apart from the merely beautiful?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A delight mixed with terror at what overwhelms us', isCorrect: true },
          { id: 'b', text: 'Calm pleasure at smooth, pleasing forms', isCorrect: false },
          { id: 'c', text: 'Pride in our own skill and craft', isCorrect: false },
          { id: 'd', text: 'Indifference to whether others agree', isCorrect: false },
        ],
        explanation: 'The sublime grips us through vastness and power, stirring a delight laced with terror — not the gentle, pleasing calm Burke linked with beauty.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Kant moved the awe inward.',
      body: 'Kant agreed the sublime overwhelms the senses. But the true awe, he said, is reason discovering it can grasp infinity in thought — so the mind, not the mountain, is sublime.',
      emoji: '🧠',
    },
    {
      type: 'question',
      prompt: '"The sublime just means something extremely beautiful." Is this an accurate summary?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — it is simply beauty turned up to maximum', isCorrect: false },
          { id: 'b', text: 'No — it is a different response, mixing awe and terror, not heightened beauty', isCorrect: true },
          { id: 'c', text: 'No — the sublime is only ever found in painted art', isCorrect: false },
          { id: 'd', text: 'Yes — Burke used the two words as exact synonyms', isCorrect: false },
        ],
        explanation: 'The trap: "sublime sounds like a fancy word for very beautiful." Burke set them apart — the sublime overwhelms with awe and terror, while beauty pleases and soothes.',
      },
    },
    {
      type: 'summary',
      title: 'When Awe Overwhelms Us',
      keyPoints: [
        'Burke: beauty soothes, the sublime overwhelms',
        'Sublime mixes terror with delight',
        'Kant: the real awe is in the mind',
      ],
      closingThought: 'Beauty pleases the eye; the sublime stuns the whole self.',
    },
  ],
};

export default lesson;
