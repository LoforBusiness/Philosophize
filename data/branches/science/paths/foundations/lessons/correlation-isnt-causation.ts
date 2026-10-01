import type { Lesson } from '@/data/types';

// The third lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/sci3Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'science-foundations-3',
  slug: 'correlation-isnt-causation',
  title: 'Correlation Isn’t Causation',
  description: 'Ice cream sales and sunburn rise together. Does ice cream burn you?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Ice cream sales and sunburn rise together. Does ice cream burn you?',
      subtext: 'Two things moving together isn’t proof that one causes the other.',
      emoji: '🍦',
    },
    {
      type: 'concept',
      title: 'A Hidden Cause',
      body: 'Two things can rise together without one causing the other. Often a hidden cause pushes both. To show a real cause, change only that one thing and see whether the other follows.',
      visual: '💡',
      highlight: 'hidden cause',
    },
    {
      type: 'question',
      prompt: 'What makes ice cream sales and sunburn rise together?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Sunny weather', isCorrect: true },
          { id: 'b', text: 'Eating ice cream', isCorrect: false },
          { id: 'c', text: 'The chart', isCorrect: false },
        ],
        explanation: 'Sunny weather. It brings more people out to buy ice cream, and more people into the sun to get burnt.',
      },
    },
    {
      type: 'quote',
      id: 'lq-science-foundations-3-1',
      quote: 'The first principle is that you must not fool yourself, and you are the easiest person to fool.',
      author: 'Richard Feynman',
      era: '1974',
      work: 'Cargo Cult Science, a Caltech commencement address',
    },
    {
      type: 'summary',
      title: 'Correlation Isn’t Causation',
      keyPoints: [
        'Two things can rise together without one causing the other',
        'Look for a hidden cause behind them both',
        'To show a cause, change only that one thing',
      ],
      closingThought: 'Next time two things move together, ask what else might be moving them.',
    },
  ],
};

export default lesson;
