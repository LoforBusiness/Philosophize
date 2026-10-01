import type { Lesson } from '@/data/types';

// The third lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/growth3Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'personal-growth-foundations-3',
  slug: 'how-to-set-a-goal-that-works',
  title: 'How to Set a Goal That Works',
  description: 'A running track, a stopwatch, and the same New Year goal as last year.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Get fit, she says. Same goal as last year.',
      subtext: 'A wish becomes a goal when you can tell it’s done.',
      emoji: '⏱️',
    },
    {
      type: 'concept',
      title: 'Specific, Small, Written Down',
      body: 'A goal works when it is specific, so you can tell when it is done. The first step is small enough to start today. Then you write down when and where, and put it where you will see it.',
      visual: '💡',
      highlight: 'specific',
    },
    {
      type: 'question',
      prompt: 'Which of these goals could she check she had done?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Run one lap of the track', isCorrect: true },
          { id: 'b', text: 'Get fit', isCorrect: false },
          { id: 'c', text: 'Be healthier', isCorrect: false },
        ],
        explanation: 'Run one lap. You can watch it happen and time it. The others are good wishes, but nobody can tell when they are finished.',
      },
    },
    {
      type: 'quote',
      id: 'lq-personal-growth-foundations-3-1',
      quote: 'If a man does not know to which port he is sailing, no wind is favourable.',
      author: 'Seneca',
      era: 'c. 65',
      work: 'Moral Letters to Lucilius, Letter 71',
    },
    {
      type: 'summary',
      title: 'How to Set a Goal That Works',
      keyPoints: [
        'Make it specific, so you can tell it’s done',
        'Start with a step small enough for today',
        'Write down when and where, and keep it in sight',
      ],
      closingThought: 'Next time you make a goal, ask how you’d know it was done.',
    },
  ],
};

export default lesson;
