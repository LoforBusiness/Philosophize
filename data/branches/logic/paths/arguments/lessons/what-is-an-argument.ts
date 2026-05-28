import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-1',
  slug: 'what-is-an-argument',
  title: 'What Is an Argument?',
  description: 'Discover that philosophical arguments aren\'t fights — they\'re tools for finding truth.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Arguments aren\'t fights. They\'re how we discover truth.',
      subtext: 'In philosophy, an argument is a powerful tool — not a quarrel.',
      emoji: '⚡',
    },
    {
      type: 'concept',
      title: 'What Is an Argument?',
      body: 'A philosophical argument is a set of statements where some (called premises) provide reasons to believe another statement (called the conclusion). Arguments are how philosophers convince each other — and themselves.',
      visual: '🏗️',
      highlight: 'argument',
    },
    {
      type: 'concept',
      title: 'Arguments Have Two Parts',
      body: 'Every argument has premises — the reasons or evidence — and a conclusion — the claim being supported. The premises are meant to justify why you should accept the conclusion.',
      visual: '🔢',
      highlight: 'premises and conclusion',
    },
    {
      type: 'example',
      title: 'A Classic Argument',
      scenario: 'Premise 1: All humans are mortal.\nPremise 2: Socrates is a human.\nConclusion: Therefore, Socrates is mortal.\n\nThis is one of the most famous arguments in history — simple, clear, and powerful.',
      source: 'Aristotle, Prior Analytics',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'Which part of an argument gives you the REASONS to believe the conclusion?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The premises', isCorrect: true },
          { id: 'b', text: 'The conclusion', isCorrect: false },
          { id: 'c', text: 'The examples', isCorrect: false },
          { id: 'd', text: 'The title', isCorrect: false },
        ],
        explanation: 'Premises are the statements that provide evidence or reasons. The conclusion is what you\'re trying to prove.',
      },
    },
    {
      type: 'summary',
      title: 'Argument Unlocked',
      keyPoints: [
        'An argument is premises + conclusion',
        'Premises provide reasons for the conclusion',
        'Arguments are tools for finding truth',
        'Socrates was mortal (sorry, Socrates)',
      ],
      closingThought: 'Every great philosophical discovery started with a simple argument.',
    },
  ],
};

export default lesson;
