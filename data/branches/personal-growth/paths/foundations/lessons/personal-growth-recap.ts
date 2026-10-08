import type { Lesson } from '@/data/types';

// The RECAP of this subject's road so far (LESSON_RULES AV), a DIALOGUE lesson (group AP):
// it plays as components/lesson/cinematic/growth7Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'personal-growth-foundations-7',
  slug: 'personal-growth-recap',
  title: 'Personal Growth Recap: The Mountain Hut',
  description: 'A mountain hut at dawn with a trail map, boots, a kettle and a logbook, then a switchback trail above the valleys.',
  estimatedMinutes: 6,
  xpReward: 25,
  recap: true,
  cards: [
    {
      type: 'hook',
      headline: 'A mountain hut, a trail map, and a climber in a hurry.',
      subtext: 'Growth comes from small steps, done well.',
      emoji: '⛰️',
    },
    {
      type: 'concept',
      title: 'The First Six Lessons',
      body: 'People change through small steps, repeated. A habit is a loop of cue, routine and reward, so swap the routine. A good goal is specific. A mistake tells you what to change. Practise at the edge of what you can do, and spread it over days so it lasts.',
      visual: '💡',
      highlight: 'small',
    },
    {
      type: 'question',
      prompt: 'Which goal could she check she had reached?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The lake hut by Saturday', isCorrect: true },
          { id: 'b', text: 'The summit, someday', isCorrect: false },
          { id: 'c', text: 'A proper mountain person', isCorrect: false },
        ],
        explanation: 'The lake hut by Saturday. She’ll know the moment she gets there. The other two are wishes, with no finish line.',
      },
    },
    {
      type: 'quote',
      id: 'lq-personal-growth-foundations-7-1',
      quote: 'A journey of a thousand miles begins with a single step.',
      author: 'Laozi',
      era: 'c. 400 BC',
      work: 'Tao Te Ching, chapter 64',
    },
    {
      type: 'summary',
      title: 'Personal Growth Recap: The Mountain Hut',
      keyPoints: [
        'Change comes from small steps, repeated',
        'Set specific goals, and swap a habit’s routine',
        'Practise at the edge, spread out over days',
      ],
      closingThought: 'Next time you start something new, pick a small first step and a day to take it.',
    },
  ],
};

export default lesson;
