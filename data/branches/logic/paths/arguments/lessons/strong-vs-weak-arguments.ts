import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-4',
  slug: 'strong-vs-weak-arguments',
  title: 'Strong Arguments vs Weak Arguments',
  description: 'What separates a convincing argument from a flimsy one, and how to tell them apart.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Not all arguments are equal. Some just don\'t hold up.',
      subtext: 'Here\'s how to tell solid reasoning from an argument with gaps.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'What Makes an Argument Strong?',
      body: 'A strong argument rests on relevant premises — reasons that actually support the conclusion — with no gaps in between. Each reason connects to the next, and nothing important is left unproven. So the conclusion really follows from the reasons given.',
      visual: '🏋️',
      highlight: 'relevant premises',
    },
    {
      type: 'example',
      title: 'Strong and Weak, Side by Side',
      scenario: 'Weak: "Trust me, because I\'ve been wrong before and learned from it." Past mistakes don\'t really support trusting you now — the reason doesn\'t fit the conclusion.\n\nStrong: "Trust my advice, because I\'ve studied this for ten years and my forecasts have held up." That reason is relevant, with no gap.',
      emoji: '🔬',
    },
    {
      type: 'question',
      prompt: 'Which trait most clearly marks an argument as weak?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Premises that don\'t actually support the conclusion', isCorrect: true },
          { id: 'b', text: 'Having only two premises', isCorrect: false },
          { id: 'c', text: 'Using plain, simple language', isCorrect: false },
          { id: 'd', text: 'Being short', isCorrect: false },
        ],
        explanation: 'An argument falls apart when its premises are irrelevant — they don\'t support the conclusion. Length, plain wording, and the number of premises don\'t decide it.',
      },
    },
    {
      type: 'summary',
      title: 'Argument Quality Unlocked',
      keyPoints: [
        'Strong arguments rest on relevant, connected premises',
        'Weak ones leave gaps or use irrelevant reasons',
        'Spot the irrelevant premise to expose a weak argument',
        'Strength comes from connection, not length',
      ],
      closingThought: 'Once you can judge arguments, weak reasoning is easy to spot.',
    },
  ],
};

export default lesson;
