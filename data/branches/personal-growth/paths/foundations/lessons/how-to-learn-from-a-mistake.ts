import type { Lesson } from '@/data/types';

// The fourth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/growth4Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'personal-growth-foundations-4',
  slug: 'how-to-learn-from-a-mistake',
  title: 'How to Learn From a Mistake',
  description: 'A first pot on a potter’s wheel, far too much water, and a beginner who blames the wheel.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A first pot slumps on the wheel, and the potter blames the wheel.',
      subtext: 'A mistake is information, if you look at it.',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'Mistakes Are Information',
      body: 'A mistake tells you what to change. Look at what went wrong, change one thing, and try again. Skill grows with each try you learn from.',
      visual: '💡',
      highlight: 'change one thing',
    },
    {
      type: 'question',
      prompt: 'What made his first pot fall over?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The bucket of water', isCorrect: true },
          { id: 'b', text: 'The wheel', isCorrect: false },
          { id: 'c', text: 'The shelf of pots', isCorrect: false },
        ],
        explanation: 'The bucket of water. He soaked the clay, so its walls were too soft to stand. The wheel was turning fine, and the shelf only holds finished pots.',
      },
    },
    {
      type: 'quote',
      id: 'lq-personal-growth-foundations-4-1',
      quote: 'Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.',
      author: 'Samuel Beckett',
      era: '1983',
      work: 'Worstward Ho',
    },
    {
      type: 'summary',
      title: 'How to Learn From a Mistake',
      keyPoints: [
        'A mistake tells you what to change',
        'Change one thing, then try again',
        'Skill grows with each try you learn from',
      ],
      closingThought: 'Next time something goes wrong, ask what it’s trying to tell you.',
    },
  ],
};

export default lesson;
