import type { Lesson } from '@/data/types';

// The RECAP of this subject's road so far (LESSON_RULES AV), a DIALOGUE lesson (group AP):
// it plays as components/lesson/cinematic/econ7Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'economics-foundations-7',
  slug: 'economics-recap',
  title: 'Economics Recap: Dawn at the Exchange',
  description: 'An old exchange at dawn, a slate price board, a ticker machine and free coffee, then a harbour market of crates, fish and notices: the first six lessons, looked at again.',
  estimatedMinutes: 6,
  xpReward: 25,
  recap: true,
  cards: [
    {
      type: 'hook',
      headline: 'One price board, one crate of tomatoes, and a friend one step behind.',
      subtext: 'Every price is telling you something.',
      emoji: '📈',
    },
    {
      type: 'concept',
      title: 'The First Six Lessons',
      body: 'Money, time and goods are scarce, so every choice costs the next best thing you gave up. Prices move with supply and demand, and rise everywhere when money grows faster than goods. Fair trades leave both sides better off, and rewards change what people do.',
      visual: '💡',
      highlight: 'choices',
    },
    {
      type: 'question',
      prompt: 'Rain all week, and no more umbrellas for sale. What happens to their price?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It goes up', isCorrect: true },
          { id: 'b', text: 'It goes down', isCorrect: false },
          { id: 'c', text: 'It stays the same', isCorrect: false },
        ],
        explanation: 'It goes up. More people want umbrellas and no more are for sale, so the price rises. It would only fall if more umbrellas came up for sale.',
      },
    },
    {
      type: 'quote',
      id: 'lq-economics-foundations-7-1',
      quote: 'It is not from the benevolence of the butcher, the brewer, or the baker, that we expect our dinner, but from their regard to their own interest.',
      author: 'Adam Smith',
      era: '1776',
      work: 'The Wealth of Nations, Book I, Chapter 2',
    },
    {
      type: 'summary',
      title: 'Economics Recap: Dawn at the Exchange',
      keyPoints: [
        'Prices move when supply or demand changes',
        'A choice costs the next best thing you gave up',
        'Fair trades help both sides, and rewards change what people do',
      ],
      closingThought: 'Next time you see a price, ask what it’s telling you, and what you gave up to pay it.',
    },
  ],
};

export default lesson;
