import type { Lesson } from '@/data/types';

// The first lesson of Economics & Finance, and the first DIALOGUE lesson
// (LESSON_RULES group AP): it plays as components/lesson/cinematic/econ1Scene.tsx.
// These cards are the fallback the runner uses only if the CINEMATIC entry is ever
// removed, which is what makes the scene safe to roll back.
const lesson: Lesson = {
  id: 'economics-foundations-1',
  slug: 'what-is-economics',
  title: 'What Is Economics?',
  description: 'One ten-pound note, a market stall, and the choice at the heart of the subject.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You want everything on the table. You have ten pounds.',
      subtext: 'That small, everyday squeeze is where economics begins.',
      emoji: '🧺',
    },
    {
      type: 'concept',
      title: 'Choosing Without Enough',
      body: 'Economics studies how people choose when they cannot have everything. Wants never run out; money, time and goods do. That gap between endless wants and limited means is called scarcity.',
      visual: '⚖️',
      highlight: 'scarcity',
    },
    {
      type: 'question',
      prompt: 'You pick a book over a pie. What did the book really cost you?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The pie you gave up', isCorrect: true },
          { id: 'b', text: 'Only the eight pounds', isCorrect: false },
          { id: 'c', text: 'Nothing, you wanted it', isCorrect: false },
        ],
        explanation: 'Its opportunity cost is the best thing you gave up to have it: the pie. The money is only part of the price.',
      },
    },
    {
      type: 'quote',
      id: 'lq-economics-foundations-1-1',
      quote: 'Economics is the science which studies human behaviour as a relationship between ends and scarce means which have alternative uses.',
      author: 'Lionel Robbins',
      era: '1932',
      work: 'An Essay on the Nature and Significance of Economic Science',
    },
    {
      type: 'summary',
      title: 'Where Economics Begins',
      keyPoints: [
        'Wants are endless; means are scarce',
        'Every choice costs the next-best thing',
        'Prices are signals of scarcity',
      ],
      closingThought: 'Next time you pay for anything, ask what you gave up.',
    },
  ],
};

export default lesson;
