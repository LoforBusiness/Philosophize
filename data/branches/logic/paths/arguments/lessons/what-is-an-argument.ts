import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-1',
  slug: 'arguments-are-not-fights',
  title: 'Arguments Are Not Fights',
  description: 'Discover why philosophical arguments are tools for finding truth, not weapons for winning fights.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'An argument changed the world. It wasn\'t a shouting match.',
      subtext: 'Philosophy runs on arguments — and they\'re nothing like what you\'re thinking.',
      emoji: '⚡',
    },
    {
      type: 'concept',
      title: 'Two Meanings of "Argument"',
      body: 'In everyday life, an argument is a fight — raised voices, hurt feelings. In philosophy, an argument is something entirely different: a calm, structured set of reasons designed to support a conclusion. Same word. Opposite vibes.',
      visual: '🔀',
      highlight: 'argument',
    },
    {
      type: 'example',
      title: 'Socrates in the Agora',
      scenario: 'Socrates didn\'t shout at people in the marketplace. He asked questions. He offered reasons. He followed the logic wherever it led — even when it was uncomfortable. His arguments were gentle, precise, and devastating. That\'s the philosophical kind.',
      source: 'Plato, Apology',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'Which best describes a philosophical argument?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Reasons given to support a conclusion', isCorrect: true },
          { id: 'b', text: 'A heated disagreement between two people', isCorrect: false },
          { id: 'c', text: 'An opinion stated very confidently', isCorrect: false },
          { id: 'd', text: 'A long and complicated speech', isCorrect: false },
        ],
        explanation: 'A philosophical argument is structured reasoning — premises that support a conclusion. Emotions and volume have nothing to do with it.',
      },
    },
    {
      type: 'summary',
      title: 'Argument Unlocked',
      keyPoints: [
        'Arguments are structured reasoning, not fights',
        'Philosophers use arguments to find truth',
        'Reasons lead to a conclusion',
        'Calm beats loud every time',
      ],
      closingThought: 'Every great idea in history was won with an argument, not a shout.',
    },
  ],
};

export default lesson;
