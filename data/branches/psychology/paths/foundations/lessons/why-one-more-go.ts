import type { Lesson } from '@/data/types';

// The sixth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/psych6Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'psychology-foundations-6',
  slug: 'why-one-more-go',
  title: 'Why One More Go?',
  description: 'A claw machine on a seaside pier, a purple bear, and a player who cannot stop.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'She has lost twenty coins to the claw machine. Why can\'t she stop?',
      subtext: 'A reward you can\'t predict is the hardest to quit.',
      emoji: '🧸',
    },
    {
      type: 'concept',
      title: 'Reinforcement',
      body: 'A reward makes a behaviour more likely, and that is reinforcement. Rewards that come unpredictably keep people going longest, and phones and games use the same trick.',
      visual: '💡',
      highlight: 'unpredictably',
    },
    {
      type: 'question',
      prompt: 'Which machine would keep her playing longest?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Prize now and then', isCorrect: true },
          { id: 'b', text: 'Prize every go', isCorrect: false },
          { id: 'c', text: 'Prize every tenth go', isCorrect: false },
        ],
        explanation: 'The one that pays out now and then. She can\'t tell when the next win is coming, so every go might be the one.',
      },
    },
    {
      type: 'quote',
      id: 'lq-psychology-foundations-6-1',
      quote: 'Men act upon the world, and change it, and are changed in turn by the consequences of their action.',
      author: 'B. F. Skinner',
      era: '1957',
      work: 'Verbal Behavior',
    },
    {
      type: 'summary',
      title: 'Why One More Go?',
      keyPoints: [
        'A reward makes a behaviour more likely, called reinforcement',
        'Unpredictable rewards keep people going longest',
        'Phones and games use the same trick',
      ],
      closingThought: 'Next time you can’t stop, ask what reward might be waiting.',
    },
  ],
};

export default lesson;
