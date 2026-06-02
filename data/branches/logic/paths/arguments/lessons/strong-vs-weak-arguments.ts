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
      headline: 'Not all arguments are equal. Most are quietly hollow.',
      subtext: 'Learn to tell iron-clad reasoning from a house of cards waiting for a breeze.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'What Makes an Argument Strong?',
      body: 'A strong argument rests on relevant premises — reasons that truly bear on the conclusion — with no silent gaps between them. Every step is earned, nothing is smuggled in unproven. Each part carries real weight, and the whole stands firm under scrutiny.',
      visual: '🏋️',
      highlight: 'relevant premises',
    },
    {
      type: 'example',
      title: 'Strong and Weak, Side by Side',
      scenario: 'Weak: "Trust me, because I have been wrong before and learned from it." Past errors are no real ground for present confidence — the premise drifts away from the conclusion.\n\nStrong: "Trust my advice, because I have studied this for ten years and my forecasts have held true." Relevant evidence, and no gaps.',
      emoji: '🔬',
    },
    {
      type: 'question',
      prompt: 'Which trait most surely marks an argument as weak?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Premises that never quite reach the conclusion', isCorrect: true },
          { id: 'b', text: 'Resting on only two premises', isCorrect: false },
          { id: 'c', text: 'Speaking in plain, simple language', isCorrect: false },
          { id: 'd', text: 'Being brief', isCorrect: false },
        ],
        explanation: 'An argument collapses when its premises are irrelevant — they fail to support the conclusion. Length, plainness, and the mere count of premises decide nothing.',
      },
    },
    {
      type: 'summary',
      title: 'Argument Quality Unlocked',
      keyPoints: [
        'Strong arguments rest on relevant, connected premises',
        'Weak ones leave gaps or lean on irrelevant reasons',
        'Find the irrelevant premise to expose a weak argument',
        'Strength lies in connection, never in length',
      ],
      closingThought: 'Once you can weigh arguments, poor reasoning has nowhere left to hide.',
    },
  ],
};

export default lesson;
