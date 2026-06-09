import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-1',
  slug: 'arguments-are-not-fights',
  title: 'Arguments Are Not Fights',
  description: 'An argument is reasons offered to support a conclusion.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You think an argument is a fight. It isn\'t.',
      subtext: 'In philosophy, it\'s reasons offered to support a conclusion.',
      emoji: '⚡',
    },
    {
      type: 'concept',
      title: 'Two Meanings of "Argument"',
      body: 'Everyday "argument" means a quarrel. Aristotle gave it a calmer sense: premises (reasons) from which a conclusion follows. Unlike a bare claim, an argument gives reasons.',
      visual: '🔀',
      highlight: 'argument',
    },
    {
      type: 'example',
      title: 'Socrates Cross-Examines Meletus',
      scenario: 'On trial in Athens, Socrates questioned his accuser until Meletus contradicted himself. Socrates didn\'t shout — he used reasons to test a belief. That is argument as a tool for truth.',
      source: 'Plato, Apology, c. 399–390 BCE',
      emoji: '🏛️',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-1',
      quote: 'The law is reason, free from passion.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      work: 'Politics',
    },
    {
      type: 'question',
      prompt: 'Which best describes a philosophical argument?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Premises offered to support a conclusion', isCorrect: true },
          { id: 'b', text: 'A heated clash between two people', isCorrect: false },
          { id: 'c', text: 'An opinion stated with great confidence', isCorrect: false },
          { id: 'd', text: 'A long and confusing speech', isCorrect: false },
        ],
        explanation: 'An argument is premises from which a conclusion follows. Volume and confidence have nothing to do with it.',
      },
    },
    {
      type: 'question',
      prompt: 'Your friend shouts "Pineapple belongs on pizza!" louder each time. Is that an argument?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — it\'s a repeated claim with no reasons', isCorrect: true },
          { id: 'b', text: 'Yes — they clearly disagree with someone', isCorrect: false },
          { id: 'c', text: 'Yes — strong feelings make it an argument', isCorrect: false },
          { id: 'd', text: 'Yes — saying it three times counts as proof', isCorrect: false },
        ],
        explanation: 'Heat and repetition aren\'t reasons. Without premises supporting it, even a loud claim is just an assertion.',
      },
    },
    {
      type: 'summary',
      title: 'Argument Unlocked',
      keyPoints: [
        'An argument is premises supporting a conclusion',
        'Not a quarrel and not a bare claim',
        'It gives reasons, not just confidence',
        'Socrates argued to test beliefs, not win',
      ],
      closingThought: 'A clear set of reasons does more than a raised voice ever will.',
    },
  ],
};

export default lesson;
