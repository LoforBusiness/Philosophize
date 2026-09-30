import type { Lesson } from '@/data/types';

// The first lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/phil1Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'philosophy-foundations-1',
  slug: 'what-is-philosophy',
  title: 'What Is Philosophy?',
  description: 'A bicycle, a box of new parts, and a question no spanner can settle.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every part of the bicycle is new. Is it the same bicycle?',
      subtext: 'Both sides agree on every fact, and still disagree. That is where philosophy begins.',
      emoji: '🚲',
    },
    {
      type: 'concept',
      title: 'Questions Facts Can’t Settle',
      body: 'Philosophy asks what we mean and what is true when looking harder will not settle it. Its answers are reasons, which anyone can test. You already live by answers to such questions: what is fair, what is real, what you owe.',
      visual: '🦉',
      highlight: 'reasons',
    },
    {
      type: 'question',
      prompt: 'Which of these is a philosophy question?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Is it still the same bicycle?', isCorrect: true },
          { id: 'b', text: 'How many of its parts are new?', isCorrect: false },
          { id: 'c', text: 'What did the new parts cost?', isCorrect: false },
        ],
        explanation: 'You can count the parts and add up the bill. Counting never tells you what makes a thing the same thing over time, so that question is settled by reasons.',
      },
    },
    {
      type: 'quote',
      id: 'lq-philosophy-foundations-1-1',
      quote: 'The unexamined life is not worth living.',
      author: 'Socrates',
      era: '399 BC',
      work: 'Plato, Apology',
    },
    {
      type: 'summary',
      title: 'Where Philosophy Begins',
      keyPoints: [
        'It asks what facts alone can’t settle',
        'Its answers are reasons anyone can test',
        'You already live by unexamined answers',
      ],
      closingThought: 'Next time you feel sure, ask what your reason is.',
    },
  ],
};

export default lesson;
