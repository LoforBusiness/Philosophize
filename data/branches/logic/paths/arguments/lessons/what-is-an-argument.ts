import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-1',
  slug: 'arguments-are-not-fights',
  title: 'Arguments Are Not Fights',
  description: 'In philosophy, an argument is a set of reasons offered to support a conclusion — not a quarrel.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Most people think an argument is a fight. It isn\'t.',
      subtext: 'In philosophy, an argument is reasons offered to support a conclusion.',
      emoji: '⚡',
    },
    {
      type: 'concept',
      title: 'Two Meanings of "Argument"',
      body: 'Everyday "argument" means a quarrel: raised voices, hurt feelings. Aristotle gave it a calmer sense — premises (reasons) from which a conclusion follows of necessity. It also differs from a bare claim: an argument doesn\'t just assert, it gives reasons.',
      visual: '🔀',
      highlight: 'argument',
    },
    {
      type: 'example',
      title: 'Socrates Cross-Examines Meletus',
      scenario: 'On trial in Athens, Socrates questioned his accuser Meletus point by point until Meletus contradicted himself — claiming Socrates believed in no gods, yet also in divine spirits. Socrates didn\'t shout; he used reasons to test a belief. That is argument as a tool for truth, not a fight to win.',
      source: 'Plato, Apology, c. 399–390 BCE',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'Which best describes what a philosophical argument is?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Premises (reasons) offered to support a conclusion', isCorrect: true },
          { id: 'b', text: 'A heated clash between two people', isCorrect: false },
          { id: 'c', text: 'An opinion stated with great confidence', isCorrect: false },
          { id: 'd', text: 'A long and confusing speech', isCorrect: false },
        ],
        explanation: 'Since Aristotle, an argument is a set of premises from which a conclusion follows. How loud or confident someone is has nothing to do with it.',
      },
    },
    {
      type: 'summary',
      title: 'Argument Unlocked',
      keyPoints: [
        'An argument is premises supporting a conclusion, not a quarrel',
        'Aristotle: the conclusion follows of necessity from the premises',
        'It gives reasons — not just a confident assertion',
        'Socrates argued to test beliefs, not to win',
      ],
      closingThought: 'A clear set of reasons does more than a raised voice ever will.',
    },
  ],
};

export default lesson;
