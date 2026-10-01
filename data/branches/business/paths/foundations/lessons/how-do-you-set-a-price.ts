import type { Lesson } from '@/data/types';

// The third lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/biz3Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'business-foundations-3',
  slug: 'how-do-you-set-a-price',
  title: 'How Do You Set a Price?',
  description: 'Handmade candles at fifty pence, and a customer who would happily pay five pounds.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Fifty pence a candle. Each one costs him two pounds to make.',
      subtext: 'A price has to cover the cost, and match the value.',
      emoji: '🕯️',
    },
    {
      type: 'concept',
      title: 'Cost, Value and Price',
      body: 'A price must cover what it costs to make, or every sale loses money. Value is what it is worth to the customer. The right price sits between the two: above the cost, and no higher than people will pay.',
      visual: '💡',
      highlight: 'between',
    },
    {
      type: 'question',
      prompt: 'Each candle costs two pounds to make, and she would pay five. What price fits?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Four pounds', isCorrect: true },
          { id: 'b', text: 'Fifty pence', isCorrect: false },
          { id: 'c', text: 'Twenty pounds', isCorrect: false },
        ],
        explanation: 'Four pounds. It covers the cost with some left over, and she would pay more. Fifty pence loses money, and twenty pounds would empty the stall.',
      },
    },
    {
      type: 'quote',
      id: 'lq-business-foundations-3-1',
      quote: 'Price is what you pay; value is what you get.',
      author: 'Warren Buffett',
      era: '2008',
      work: 'Letter to Berkshire Hathaway shareholders',
    },
    {
      type: 'summary',
      title: 'How Do You Set a Price?',
      keyPoints: [
        'A price must cover what it costs to make',
        'Value is what it’s worth to the customer',
        'The right price sits between the two',
      ],
      closingThought: 'Next time you see a price, ask what it costs to make, and what it’s worth to you.',
    },
  ],
};

export default lesson;
