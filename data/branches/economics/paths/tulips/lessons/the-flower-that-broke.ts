import type { Lesson } from '@/data/types';

// The first lesson of this road's second unit, a true story told in costume (LESSON_RULES
// AW), a DIALOGUE lesson (group AP): it plays as components/lesson/cinematic/tulip1Scene.tsx.
// These cards are the fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'economics-tulips-1',
  slug: 'the-flower-that-broke',
  title: 'The Flower That Broke',
  description: 'Clusius\'s Leiden garden in 1593: crates of bulbs, a night theft over the wall, and a rare striped tulip.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why would anyone pay a fortune for one flower?',
      subtext: 'A botanist, a garden in Leiden, and a tulip that broke.',
      emoji: '🌷',
    },
    {
      type: 'concept',
      title: 'Scarcity',
      body: 'Striped "broken" tulips were rare. Nobody could make one on purpose, and their bulbs multiplied slowly. With few bulbs and many eager buyers, the price of the rarest tulips climbed far above the price of ordinary ones.',
      visual: '💡',
      highlight: 'scarcity',
    },
    {
      type: 'question',
      prompt: 'Three tulips wait at the garden gate. Which one do buyers pay the most for?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The striped broken tulip', isCorrect: true },
          { id: 'b', text: 'The plain red tulip', isCorrect: false },
          { id: 'c', text: 'The plain yellow tulip', isCorrect: false },
        ],
        explanation: 'The striped one. Few exist, nobody can make more on purpose, and its bulb multiplies slowly. The red and yellow grow easily, so there are plenty to go round.',
      },
    },
    {
      type: 'quote',
      id: 'lq-economics-tulips-1-1',
      quote: 'In 1634, the rage among the Dutch to possess them was so great that the ordinary industry of the country was neglected.',
      author: 'Charles Mackay',
      era: '1841',
      work: 'Memoirs of Extraordinary Popular Delusions (1841), "The Tulipomania"',
    },
    {
      type: 'summary',
      title: 'The Flower That Broke',
      keyPoints: [
        'Tulips came from the Ottoman Empire to Clusius’s Leiden garden',
        'Striped broken tulips were weak, and nobody could make one',
        'Few bulbs and many eager buyers pushed prices up',
      ],
      closingThought: 'By the 1630s, people weren’t only buying tulips. They were buying bulbs still under the ground.',
    },
  ],
};

export default lesson;
