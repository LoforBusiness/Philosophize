import type { Lesson } from '@/data/types';

// The fifth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/growth5Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'personal-growth-foundations-5',
  slug: 'practise-at-the-edge',
  title: 'Practise at the Edge',
  description: 'A circus big top, three tightropes at three heights, and a ringmaster with a whistle.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'He has crossed this rope ten thousand times. It is lying on the floor.',
      subtext: 'You grow at the edge of what you can do.',
      emoji: '🎪',
    },
    {
      type: 'concept',
      title: 'The Edge of What You Can Do',
      body: 'Easy practice keeps you where you are, and practice that is far too hard makes fear stop you learning. Skill grows at the edge, with fast feedback on one weak spot.',
      visual: '💡',
      highlight: 'the edge',
    },
    {
      type: 'question',
      prompt: 'Which rope should she practise on tomorrow?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The middle rope, over the net', isCorrect: true },
          { id: 'b', text: 'The rope on the floor', isCorrect: false },
          { id: 'c', text: 'The high wire', isCorrect: false },
        ],
        explanation: 'The middle rope, over the net. It’s hard enough to make her wobble and low enough that she can think.',
      },
    },
    {
      type: 'quote',
      id: 'lq-personal-growth-foundations-5-1',
      quote: 'The right sort of practice carried out over a sufficient period of time leads to improvement. Nothing else.',
      author: 'Anders Ericsson',
      era: '2016',
      work: 'Peak',
    },
    {
      type: 'summary',
      title: 'Practise at the Edge',
      keyPoints: [
        'Easy practice keeps you where you are',
        'Too hard, and fear stops you learning',
        'Grow at the edge, with fast feedback on one weak spot',
      ],
      closingThought: 'Next time you practise something, ask whether you wobbled at all.',
    },
  ],
};

export default lesson;
