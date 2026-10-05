import type { Lesson } from '@/data/types';

// The sixth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/econ6Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'economics-foundations-6',
  slug: 'too-much-treasure',
  title: 'Too Much Treasure',
  description: 'Pirates share a chest of gold, and the island\'s coconuts suddenly cost twice as much.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A chest of gold for every pirate, and a coconut now costs four coins. Why?',
      subtext: 'More money chasing the same goods pushes prices up.',
      emoji: '🏝️',
    },
    {
      type: 'concept',
      title: 'Inflation',
      body: 'Inflation is prices rising across the board. When more money chases the same goods, each coin buys less, because money is only worth what it can buy.',
      visual: '💡',
      highlight: 'inflation',
    },
    {
      type: 'question',
      prompt: 'Which cargo would bring the island\'s prices back down?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Coconuts and fish', isCorrect: true },
          { id: 'b', text: 'More gold', isCorrect: false },
          { id: 'c', text: 'A bigger cannon', isCorrect: false },
        ],
        explanation: 'Coconuts and fish. More goods for the same gold means each coin buys more again.',
      },
    },
    {
      type: 'quote',
      id: 'lq-economics-foundations-6-1',
      quote: 'Inflation is always and everywhere a monetary phenomenon.',
      author: 'Milton Friedman',
      era: '1963',
      work: 'Inflation: Causes and Consequences',
    },
    {
      type: 'summary',
      title: 'Too Much Treasure',
      keyPoints: [
        'Inflation is prices rising across the board',
        'More money chasing the same goods pushes prices up',
        'Money is only worth what it can buy',
      ],
      closingThought: 'Next time prices go up, ask whether things got better or money got cheaper.',
    },
  ],
};

export default lesson;
