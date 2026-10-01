import type { Lesson } from '@/data/types';

// The second lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/growth2Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'personal-growth-foundations-2',
  slug: 'how-habits-work',
  title: 'How Habits Work',
  description: 'Three o’clock, a biscuit jar, and the loop every habit runs on.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every day at three, the biscuit jar opens. He isn’t even hungry.',
      subtext: 'A habit runs on a loop, and the loop can be changed.',
      emoji: '🍪',
    },
    {
      type: 'concept',
      title: 'Cue, Routine, Reward',
      body: 'Every habit is a loop. A cue starts it, the routine is what you do, and the reward makes you want to do it again. Keep the cue and the reward, and swap only the routine: it is easier than fighting the cue every day.',
      visual: '💡',
      highlight: 'loop',
    },
    {
      type: 'question',
      prompt: 'The clock strikes three and he reaches for a biscuit. Which part of the loop is the clock?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The cue', isCorrect: true },
          { id: 'b', text: 'The routine', isCorrect: false },
          { id: 'c', text: 'The reward', isCorrect: false },
        ],
        explanation: 'The cue. It starts the habit. The biscuit is the routine, and the break with a cup of tea is the reward he is really after.',
      },
    },
    {
      type: 'quote',
      id: 'lq-personal-growth-foundations-2-1',
      quote: 'All our life, so far as it has definite form, is but a mass of habits.',
      author: 'William James',
      era: '1899',
      work: 'Talks to Teachers on Psychology',
    },
    {
      type: 'summary',
      title: 'How Habits Work',
      keyPoints: [
        'A habit is a loop: cue, routine and reward',
        'Keep the cue and the reward, and swap the routine',
        'A swap is easier than fighting the cue',
      ],
      closingThought: 'Next time you catch yourself in a habit, look for the cue that started it.',
    },
  ],
};

export default lesson;
