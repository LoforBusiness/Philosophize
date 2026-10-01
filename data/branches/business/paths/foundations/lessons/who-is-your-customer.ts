import type { Lesson } from '@/data/types';

// The second lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/biz2Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'business-foundations-2',
  slug: 'who-is-your-customer',
  title: 'Who Is Your Customer?',
  description: 'A bakery full of pink macarons, and a builder who would really like some breakfast.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'She baked macarons for the building site. The builders want breakfast.',
      subtext: 'A business starts with the customer who actually walks in.',
      emoji: '🥐',
    },
    {
      type: 'concept',
      title: 'The Person Whose Problem You Solve',
      body: 'Your customer is the person whose problem you solve. You find them by who actually walks in, not by who you imagined. Then you watch what sells, and you ask the people buying it.',
      visual: '💡',
      highlight: 'problem',
    },
    {
      type: 'question',
      prompt: 'A builder walks in at seven in the morning before a long shift. What should she offer him?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A hot sausage roll', isCorrect: true },
          { id: 'b', text: 'A lavender macaron', isCorrect: false },
          { id: 'c', text: 'A slice of wedding cake', isCorrect: false },
        ],
        explanation: 'The sausage roll. It solves his problem: something warm and filling on the way to work. The others are lovely, but they are for someone else.',
      },
    },
    {
      type: 'quote',
      id: 'lq-business-foundations-2-1',
      quote: 'You’ve got to start with the customer experience and work backwards to the technology.',
      author: 'Steve Jobs',
      era: '1997',
      work: 'Apple Worldwide Developers Conference',
    },
    {
      type: 'summary',
      title: 'Who Is Your Customer?',
      keyPoints: [
        'Your customer is the person whose problem you solve',
        'Serve who actually walks in, not who you imagined',
        'Watch what sells, and ask the people buying',
      ],
      closingThought: 'Before you make something for a customer, ask the customer what they need.',
    },
  ],
};

export default lesson;
