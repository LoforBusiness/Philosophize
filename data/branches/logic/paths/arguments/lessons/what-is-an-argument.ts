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
      headline: 'An argument once remade the world. No one raised their voice.',
      subtext: 'Philosophy lives on arguments — and they are stranger and gentler than you imagine.',
      emoji: '⚡',
    },
    {
      type: 'concept',
      title: 'Two Meanings of "Argument"',
      body: 'In daily life, an argument is a quarrel — raised voices, bruised feelings, someone storming off. In philosophy it is the opposite: a patient arrangement of reasons offered in support of a conclusion. One word, two worlds. We will live in the quieter one.',
      visual: '🔀',
      highlight: 'argument',
    },
    {
      type: 'example',
      title: 'Socrates in the Agora',
      scenario: 'Socrates never shouted down the crowds in the marketplace. He simply asked questions, offered his reasons, and followed the thread of logic wherever it ran — even into discomfort, even against himself. His arguments were gentle, exact, and quietly devastating. This is the philosophical kind.',
      source: 'Plato, Apology',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'Which best captures what a philosophical argument really is?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Reasons offered in support of a conclusion', isCorrect: true },
          { id: 'b', text: 'A heated clash of wills between two people', isCorrect: false },
          { id: 'c', text: 'An opinion delivered with great confidence', isCorrect: false },
          { id: 'd', text: 'A long and tangled speech', isCorrect: false },
        ],
        explanation: 'An argument, in philosophy, is reasoning with a shape — premises that bear the weight of a conclusion. Heat and volume have nothing to do with it.',
      },
    },
    {
      type: 'summary',
      title: 'Argument Unlocked',
      keyPoints: [
        'An argument is reasoning with a shape, not a fight',
        'Philosophers argue to reach the truth, not to win',
        'Reasons gathered together point toward a conclusion',
        'The quiet mind outlasts the loud one',
      ],
      closingThought: 'Nearly every idea that endured was won by an argument, not a shout.',
    },
  ],
};

export default lesson;
