import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-1',
  slug: 'arguments-are-not-fights',
  title: 'Arguments Are Not Fights',
  description: 'In philosophy, an argument is just reasons that support a conclusion — not a quarrel.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Most people think an argument is a fight. It isn\'t.',
      subtext: 'In philosophy, an argument is just reasons that support a conclusion.',
      emoji: '⚡',
    },
    {
      type: 'concept',
      title: 'Two Meanings of "Argument"',
      body: 'In everyday life, an argument means a quarrel: raised voices and hurt feelings. In philosophy it means something different and calmer: a set of reasons offered to support a conclusion. Same word, two meanings. This course uses the second one.',
      visual: '🔀',
      highlight: 'argument',
    },
    {
      type: 'example',
      title: 'Socrates in the Agora',
      scenario: 'In the Athenian marketplace, Socrates didn\'t shout people down. He asked questions, gave his reasons, and followed the logic wherever it led — even when it went against his own view. That is what a philosophical argument looks like: reasons, not shouting.',
      source: 'Plato, Apology',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'Which best describes what a philosophical argument is?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Reasons offered in support of a conclusion', isCorrect: true },
          { id: 'b', text: 'A heated clash between two people', isCorrect: false },
          { id: 'c', text: 'An opinion stated with great confidence', isCorrect: false },
          { id: 'd', text: 'A long and confusing speech', isCorrect: false },
        ],
        explanation: 'In philosophy, an argument is reasons that support a conclusion. How loud or confident someone is has nothing to do with it.',
      },
    },
    {
      type: 'summary',
      title: 'Argument Unlocked',
      keyPoints: [
        'An argument is reasons supporting a conclusion, not a fight',
        'Philosophers argue to find the truth, not to win',
        'Reasons work together to support a conclusion',
        'Good arguments win on reasons, not volume',
      ],
      closingThought: 'A clear set of reasons does more than a raised voice ever will.',
    },
  ],
};

export default lesson;
