import type { Lesson } from '@/data/types';

// The first lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/sci1Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'science-foundations-1',
  slug: 'what-is-science',
  title: 'What Is Science?',
  description: 'A ladder, a heavy ball, a light ball, and an argument nobody needs to have.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Everybody knows the heavy ball lands first. Everybody is wrong.',
      subtext: 'One drop from a ladder settles what an hour of arguing can’t.',
      emoji: '🔬',
    },
    {
      type: 'concept',
      title: 'A Guess, and a Test',
      body: 'Science is a way of finding out. You make a guess about the world, then run a test the guess could fail. In science the test beats the argument. Ideas that survive their tests get built on, and that is technology.',
      visual: '🧪',
      highlight: 'test',
    },
    {
      type: 'question',
      prompt: 'A heavy ball and a light ball are dropped together. Which lands first?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'They land together', isCorrect: true },
          { id: 'b', text: 'The heavy one', isCorrect: false },
          { id: 'c', text: 'The light one', isCorrect: false },
        ],
        explanation: 'Weight does not set how fast a thing falls. Only the air slows some things more than others, and a drop shows it in a second.',
      },
    },
    {
      type: 'quote',
      id: 'lq-science-foundations-1-1',
      quote: 'If it disagrees with experiment it is wrong. In that simple statement is the key to science.',
      author: 'Richard Feynman',
      era: '1965',
      work: 'The Character of Physical Law',
    },
    {
      type: 'summary',
      title: 'Where Science Begins',
      keyPoints: [
        'Science tests guesses against the world',
        'A test beats an argument',
        'Technology is tested knowledge at work',
      ],
      closingThought: 'Next time someone says everybody knows, ask how it was tested.',
    },
  ],
};

export default lesson;
