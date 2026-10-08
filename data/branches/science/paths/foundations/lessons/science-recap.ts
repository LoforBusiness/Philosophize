import type { Lesson } from '@/data/types';

// The RECAP of this subject's road so far (LESSON_RULES AV), a DIALOGUE lesson (group AP):
// it plays as components/lesson/cinematic/sci7Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'science-foundations-7',
  slug: 'science-recap',
  title: 'Science Recap: Lab Night',
  description: 'An old laboratory after dark, bubbling flasks, two burners and a stopwatch, then an observatory dome with a brass telescope and Mars: the first six lessons, tested again.',
  estimatedMinutes: 6,
  xpReward: 25,
  recap: true,
  cards: [
    {
      type: 'hook',
      headline: 'Six experiments, one laboratory, and a friend who remembers them all wrong.',
      subtext: 'Science settles things with tests.',
      emoji: '🔬',
    },
    {
      type: 'concept',
      title: 'The First Six Lessons',
      body: 'Science tests its guesses against the world. A fair test changes one thing, is repeated and measured more than once. Rising together isn\'t causing, hope can fool a cure, and a good claim is one a test could prove wrong.',
      visual: '💡',
      highlight: 'test',
    },
    {
      type: 'question',
      prompt: 'Which of these could actually settle a science question?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A test anyone can run again', isCorrect: true },
          { id: 'b', text: 'What everybody already knows', isCorrect: false },
          { id: 'c', text: 'The loudest argument', isCorrect: false },
        ],
        explanation: 'A test. It lets the world decide, and anyone can run it again. What everybody knows can be wrong, and an argument can run all day and prove nothing.',
      },
    },
    {
      type: 'quote',
      id: 'lq-science-foundations-7-1',
      quote: 'Ignorance more frequently begets confidence than does knowledge.',
      author: 'Charles Darwin',
      era: '1871',
      work: 'The Descent of Man (1871), Introduction',
    },
    {
      type: 'summary',
      title: 'Science Recap: Lab Night',
      keyPoints: [
        'Science tests its guesses against the world',
        'Change one thing, and measure more than once',
        'A good claim could fail a test',
      ],
      closingThought: 'Next time you’re sure of something, ask how you’d test it, and what result would prove you wrong.',
    },
  ],
};

export default lesson;
