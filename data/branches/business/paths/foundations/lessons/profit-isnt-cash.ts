import type { Lesson } from '@/data/types';

// The fifth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/biz5Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'business-foundations-5',
  slug: 'profit-isnt-cash',
  title: 'Profit Isn’t Cash',
  description: 'A hot-air balloon company with its best month ever, and forty pounds in the tin.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Three thousand pounds of profit, and he can’t pay for the gas.',
      subtext: 'Profit is on paper. Cash is what you hold.',
      emoji: '🎈',
    },
    {
      type: 'concept',
      title: 'Cash Flow',
      body: 'Profit is money earned on paper; cash is money you hold today. When customers pay later than bills are due, a profitable business can run out of cash, so take payment early and keep a cushion.',
      visual: '💡',
      highlight: 'cash',
    },
    {
      type: 'question',
      prompt: 'The gas has to be paid for on Friday. Which booking helps him pay it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: '£200, paid today', isCorrect: true },
          { id: 'b', text: '£600, paid in two months', isCorrect: false },
          { id: 'c', text: '£900, paid next year', isCorrect: false },
        ],
        explanation: 'The £200 booking, paid today. It’s the smallest, but it’s the only one that puts cash in the tin before Friday.',
      },
    },
    {
      type: 'quote',
      id: 'lq-business-foundations-5-1',
      quote: 'Annual income twenty pounds, annual expenditure nineteen nineteen and six, result happiness. Annual income twenty pounds, annual expenditure twenty pounds ought and six, result misery.',
      author: 'Charles Dickens',
      era: '1850',
      work: 'David Copperfield',
    },
    {
      type: 'summary',
      title: 'Profit Isn’t Cash',
      keyPoints: [
        'Profit is earned on paper; cash is money you hold',
        'Money often comes in later than bills go out',
        'Take payment early, and keep a cash cushion',
      ],
      closingThought: 'Next time a busy shop closes down, ask whether it ran out of cash.',
    },
  ],
};

export default lesson;
