import type { Lesson } from '@/data/types';

// The first lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/growth1Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'personal-growth-foundations-1',
  slug: 'how-do-people-change',
  title: 'How Do People Change?',
  description: 'Two flowerpots, one watering can, and a month of water poured in one go.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A month of water in one go drowns the seed.',
      subtext: 'A cupful every morning grows it. People change the same way.',
      emoji: '🌱',
    },
    {
      type: 'concept',
      title: 'A Little, and Often',
      body: 'Personal growth is the study of how people change on purpose. Change comes from a small step repeated, never from one huge effort. People who manage it do not have more willpower; they make the right step the easy one.',
      visual: '🪴',
      highlight: 'repeated',
    },
    {
      type: 'question',
      prompt: 'One pot gets a month of water at once. One gets a cupful each morning. Which one grows?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The cupful each morning', isCorrect: true },
          { id: 'b', text: 'The month at once', isCorrect: false },
          { id: 'c', text: 'Neither of them', isCorrect: false },
        ],
        explanation: 'A small thing done again and again is what changes a plant or a person. One huge effort drowns the seed.',
      },
    },
    {
      type: 'quote',
      id: 'lq-personal-growth-foundations-1-1',
      quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
      author: 'Will Durant',
      era: '1926',
      work: 'The Story of Philosophy',
    },
    {
      type: 'summary',
      title: 'Where Change Begins',
      keyPoints: [
        'Small steps, repeated, change people',
        'Make the right step the easy one',
        'You become what you keep doing',
      ],
      closingThought: 'Pick one small thing, and put it by your door tonight.',
    },
  ],
};

export default lesson;
