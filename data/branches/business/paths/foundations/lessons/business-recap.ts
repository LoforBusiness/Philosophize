import type { Lesson } from '@/data/types';

// The RECAP of this subject's road so far (LESSON_RULES AV), a DIALOGUE lesson (group AP):
// it plays as components/lesson/cinematic/biz7Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'business-foundations-7',
  slug: 'business-recap',
  title: 'Business Recap: After Closing Time',
  description: 'An old general store after closing, a brass till, a ledger and an abacus, then a chestnut cart on a busy market street: the first six lessons, looked at again.',
  estimatedMinutes: 6,
  xpReward: 25,
  recap: true,
  cards: [
    {
      type: 'hook',
      headline: 'One shop after closing, and a friend who\'s sure he\'s a genius.',
      subtext: 'A business keeps what\'s left after the costs.',
      emoji: '🏪',
    },
    {
      type: 'concept',
      title: 'The First Six Lessons',
      body: 'A business sells what people want for more than it costs. Profit is revenue minus costs, and it isn\'t cash until the money arrives. A price sits between the cost and the value to the customer, and break-even is where sales just cover fixed and variable costs.',
      visual: '💡',
      highlight: 'profit',
    },
    {
      type: 'question',
      prompt: 'The shop took three hundred pounds and paid out two hundred and twenty. What did it keep?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Eighty pounds', isCorrect: true },
          { id: 'b', text: 'Three hundred pounds', isCorrect: false },
          { id: 'c', text: 'Two hundred and twenty pounds', isCorrect: false },
        ],
        explanation: 'Eighty pounds. Profit is the money in, less the costs paid out. Three hundred is the revenue, and two hundred and twenty is the costs.',
      },
    },
    {
      type: 'quote',
      id: 'lq-business-foundations-7-1',
      quote: 'There is only one valid definition of business purpose: to create a customer.',
      author: 'Peter Drucker',
      era: '1954',
      work: 'The Practice of Management (1954), Chapter 5',
    },
    {
      type: 'summary',
      title: 'Business Recap: After Closing Time',
      keyPoints: [
        'Profit is what’s left once the costs come out',
        'Profit on paper isn’t cash you can spend',
        'Price above the cost, and no higher than customers pay',
      ],
      closingThought: 'Next time you walk past a shop, ask what it keeps, and when the money arrives.',
    },
  ],
};

export default lesson;
