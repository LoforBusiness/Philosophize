import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-4',
  slug: 'strong-vs-weak-arguments',
  title: 'Strong Arguments vs Weak Arguments',
  description: 'Learn what separates a convincing argument from a flimsy one — and how to tell the difference instantly.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Not all arguments are created equal. Most are terrible.',
      subtext: 'Learn to spot the difference between iron-clad reasoning and a house of cards.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'What Makes an Argument Strong?',
      body: 'A strong argument has relevant premises — reasons that actually connect to the conclusion — and no logical gaps between them. Each step is supported. Nothing is assumed without evidence. Pull any piece out and the whole thing should still hold.',
      visual: '🏋️',
      highlight: 'relevant premises',
    },
    {
      type: 'example',
      title: 'Strong vs. Weak Side by Side',
      scenario: 'Weak: "You should trust me because I\'ve been wrong before and learned from it." The premise doesn\'t support the conclusion.\n\nStrong: "You should trust my advice because I\'ve studied this topic for ten years and my previous predictions proved accurate." Relevant evidence, no gaps.',
      emoji: '🔬',
    },
    {
      type: 'question',
      prompt: 'Which feature most clearly makes an argument weak?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Premises that don\'t connect to the conclusion', isCorrect: true },
          { id: 'b', text: 'Having only two premises', isCorrect: false },
          { id: 'c', text: 'Using simple language', isCorrect: false },
          { id: 'd', text: 'Being short', isCorrect: false },
        ],
        explanation: 'Weak arguments fall apart when premises are irrelevant — they don\'t actually support the conclusion. Length, simplicity, and number of premises don\'t decide strength.',
      },
    },
    {
      type: 'summary',
      title: 'Argument Quality Unlocked',
      keyPoints: [
        'Strong arguments have relevant, connected premises',
        'Weak arguments have gaps or irrelevant reasons',
        'Spot irrelevant premises to expose weak arguments',
        'Strength is about connection, not length',
      ],
      closingThought: 'Once you can grade arguments, bad reasoning has nowhere left to hide.',
    },
  ],
};

export default lesson;
