import type { Lesson } from '@/data/types';

// The fifth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/psych5Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'psychology-foundations-5',
  slug: 'when-the-saucer-doesnt-come',
  title: 'When the Saucer Doesn’t Come',
  description: 'A hilltop at midnight, a prophet, a lemon cake for the aliens, and a saucer that never lands.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A saucer is due at midnight. What happens when it doesn’t come?',
      subtext: 'People would rather change the story than the belief.',
      emoji: '🛸',
    },
    {
      type: 'concept',
      title: 'Cognitive Dissonance',
      body: 'Holding two clashing thoughts feels bad, and that discomfort is cognitive dissonance. People often ease it by changing the story rather than the belief, and the more a belief cost them, the harder it is to drop.',
      visual: '💡',
      highlight: 'change the story',
    },
    {
      type: 'question',
      prompt: 'Who will find it hardest to admit they were wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The one who sold a house and quit a job', isCorrect: true },
          { id: 'b', text: 'The one who gave up a weekend', isCorrect: false },
          { id: 'c', text: 'The one who sold a car', isCorrect: false },
        ],
        explanation: 'The one who sold a house and quit a job. The more it cost, the more it hurts to say it was all for nothing.',
      },
    },
    {
      type: 'quote',
      id: 'lq-psychology-foundations-5-1',
      quote: 'A man with a conviction is a hard man to change. Tell him you disagree and he turns away.',
      author: 'Leon Festinger',
      era: '1956',
      work: 'When Prophecy Fails',
    },
    {
      type: 'summary',
      title: 'When the Saucer Doesn’t Come',
      keyPoints: [
        'Clashing thoughts cause discomfort, called cognitive dissonance',
        'People often change the story to keep the belief',
        'The more a belief cost, the harder it is to drop',
      ],
      closingThought: 'Next time a plan fails, ask what you’d think if it had cost you nothing.',
    },
  ],
};

export default lesson;
