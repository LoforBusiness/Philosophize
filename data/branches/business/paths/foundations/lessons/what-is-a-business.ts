import type { Lesson } from '@/data/types';

// The first lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/biz1Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'business-foundations-1',
  slug: 'what-is-a-business',
  title: 'What Is a Business?',
  description: 'A lemonade stand with a queue down the street and nothing in the cash tin.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The queue is long. The cash tin is empty.',
      subtext: 'Being busy is not the same as being a business.',
      emoji: '🍋',
    },
    {
      type: 'concept',
      title: 'More Than It Cost',
      body: 'A business makes something people want and sells it for more than it cost to make. What is left over is profit, and profit is what lets it open again tomorrow. Leading one means giving every job a single owner.',
      visual: '🧾',
      highlight: 'profit',
    },
    {
      type: 'question',
      prompt: 'A cup sells for one pound. The lemons and sugar cost fifty pence. What is the profit?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Fifty pence', isCorrect: true },
          { id: 'b', text: 'One pound', isCorrect: false },
          { id: 'c', text: 'Nothing at all', isCorrect: false },
        ],
        explanation: 'Profit is the money that comes in, minus what it cost to make. One pound in, fifty pence out, leaves fifty pence.',
      },
    },
    {
      type: 'quote',
      id: 'lq-business-foundations-1-1',
      quote: 'There is only one valid definition of business purpose: to create a customer.',
      author: 'Peter Drucker',
      era: '1954',
      work: 'The Practice of Management',
    },
    {
      type: 'summary',
      title: 'Where Business Begins',
      keyPoints: [
        'A business sells what people want',
        'Profit is money in, minus the cost',
        'A leader gives every job one owner',
      ],
      closingThought: 'Next time you buy anything, guess what it cost to make.',
    },
  ],
};

export default lesson;
