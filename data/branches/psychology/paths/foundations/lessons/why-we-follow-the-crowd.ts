import type { Lesson } from '@/data/types';

// The fourth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/psych4Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'psychology-foundations-4',
  slug: 'why-we-follow-the-crowd',
  title: 'Why We Follow the Crowd',
  description: 'A closed bus stop, two people waiting at it, and a notice neither of them read.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two people wait at a bus stop that closed a week ago.',
      subtext: 'When unsure, people copy what others do.',
      emoji: '🚏',
    },
    {
      type: 'concept',
      title: 'Social Proof',
      body: 'When people are unsure what to do, they copy what others are doing. It is often a sensible shortcut, but when everybody copies everybody, nobody checks, and a crowd can be wrong together.',
      visual: '💡',
      highlight: 'copy',
    },
    {
      type: 'question',
      prompt: 'What made him decide this was the right stop?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The woman waiting', isCorrect: true },
          { id: 'b', text: 'The yellow notice', isCorrect: false },
          { id: 'c', text: 'The timetable', isCorrect: false },
        ],
        explanation: 'The woman waiting. He saw somebody there and copied her. The notice says the stop is closed, and he never looked at the timetable.',
      },
    },
    {
      type: 'quote',
      id: 'lq-psychology-foundations-4-1',
      quote: 'We view a behavior as more correct in a given situation to the degree that we see others performing it.',
      author: 'Robert Cialdini',
      era: '1984',
      work: 'Influence',
    },
    {
      type: 'summary',
      title: 'Why We Follow the Crowd',
      keyPoints: [
        'When unsure, people copy what others do',
        'Copying is often a sensible shortcut',
        'A crowd can be wrong, so check for yourself',
      ],
      closingThought: 'Next time you follow a crowd, ask who in it checked first.',
    },
  ],
};

export default lesson;
