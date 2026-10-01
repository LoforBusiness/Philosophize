import type { Lesson } from '@/data/types';

// The third lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/hist3Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'history-foundations-3',
  slug: 'why-did-it-happen',
  title: 'Why Did It Happen?',
  description: 'A hay cart, an old footbridge, and a plank that had been rotting for years.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A hay cart breaks the old footbridge. Whose fault is it?',
      subtext: 'An event nearly always has more than one cause.',
      emoji: '🌉',
    },
    {
      type: 'concept',
      title: 'Long-Term Causes and Triggers',
      body: 'An event usually has more than one cause. A long-term cause builds up over years, and a trigger sets it off on the day. Historians weigh which cause mattered most.',
      visual: '💡',
      highlight: 'trigger',
    },
    {
      type: 'question',
      prompt: 'Which cause was building up for years before the bridge broke?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The rotten plank', isCorrect: true },
          { id: 'b', text: 'The hay cart', isCorrect: false },
          { id: 'c', text: 'The stream', isCorrect: false },
        ],
        explanation: 'The rotten plank. The rot grew slowly until the wood was weak. The cart was only the trigger on the day.',
      },
    },
    {
      type: 'quote',
      id: 'lq-history-foundations-3-1',
      quote: 'The study of history is a study of causes.',
      author: 'E. H. Carr',
      era: '1961',
      work: 'What Is History?',
    },
    {
      type: 'summary',
      title: 'Why Did It Happen?',
      keyPoints: [
        'An event usually has more than one cause',
        'A long-term cause builds up over years',
        'A trigger sets it off on the day',
      ],
      closingThought: 'Next time you hear why something happened, ask what had been building up beforehand.',
    },
  ],
};

export default lesson;
