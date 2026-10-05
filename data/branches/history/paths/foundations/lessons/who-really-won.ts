import type { Lesson } from '@/data/types';

// The sixth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/hist6Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'history-foundations-6',
  slug: 'who-really-won',
  title: 'Who Really Won?',
  description: 'A temple carving says Ramesses won the Battle of Kadesh alone. A clay tablet disagrees.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The carving says Ramesses won. The Hittite tablet says they did.',
      subtext: 'Every source was made by someone, for a reason.',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'Checking a Source',
      body: 'Every source was made by someone, for a reason. Check one side\'s account against the other\'s, and where independent sources agree, trust it more.',
      visual: '💡',
      highlight: 'for a reason',
    },
    {
      type: 'question',
      prompt: 'Which find would best test Ramesses\'s story of a great win?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A treaty found in both capitals', isCorrect: true },
          { id: 'b', text: 'Another carving of Ramesses', isCorrect: false },
          { id: 'c', text: 'A gift-shop postcard', isCorrect: false },
        ],
        explanation: 'The treaty. Copies were found in Egypt and in the Hittite capital, agreed by both sides.',
      },
    },
    {
      type: 'quote',
      id: 'lq-history-foundations-6-1',
      quote: 'Study the historian before you begin to study the facts.',
      author: 'E. H. Carr',
      era: '1961',
      work: 'What Is History?',
    },
    {
      type: 'summary',
      title: 'Who Really Won?',
      keyPoints: [
        'Every source was made by someone, for a reason',
        'Check one side’s account against the other’s',
        'Where independent sources agree, trust it more',
      ],
      closingThought: 'Next time you read a news story, ask who made it, and why.',
    },
  ],
};

export default lesson;
