import type { Lesson } from '@/data/types';

// The fourth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/biz4Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'business-foundations-4',
  slug: 'what-is-profit',
  title: 'What Is Profit?',
  description: 'A food truck takes three hundred pounds in a day. How much of it does the owner keep?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Three hundred pounds in the cash box. How much of it is profit?',
      subtext: 'Profit is what’s left once the costs are paid.',
      emoji: '🚚',
    },
    {
      type: 'concept',
      title: 'Revenue, Costs and Profit',
      body: 'Revenue is all the money that comes in. Costs are the money paid out to make the sales. Profit is what is left when the costs are taken away from the revenue.',
      visual: '💡',
      highlight: 'what is left',
    },
    {
      type: 'question',
      prompt: 'Which of these is a cost of running the van?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The fuel receipt', isCorrect: true },
          { id: 'b', text: 'The cash box', isCorrect: false },
          { id: 'c', text: 'The menu board', isCorrect: false },
        ],
        explanation: 'The fuel receipt. Fuel is money paid out to keep the van going. The cash box holds the money that came in, and the menu just lists what’s for sale.',
      },
    },
    {
      type: 'quote',
      id: 'lq-business-foundations-4-1',
      quote: 'Beware of little expenses; a small leak will sink a great ship.',
      author: 'Benjamin Franklin',
      era: '1758',
      work: 'The Way to Wealth',
    },
    {
      type: 'summary',
      title: 'What Is Profit?',
      keyPoints: [
        'Revenue is all the money that comes in',
        'Costs are the money paid out to make sales',
        'Profit is what’s left once costs are taken away',
      ],
      closingThought: 'Next time a shop looks busy, ask how much of the money it gets to keep.',
    },
  ],
};

export default lesson;
