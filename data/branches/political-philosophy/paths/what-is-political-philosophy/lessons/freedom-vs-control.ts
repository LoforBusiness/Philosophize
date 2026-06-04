import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-4',
  slug: 'freedom-vs-control',
  title: 'Freedom vs. Control',
  description: 'Learn how individual liberty and government authority pull against each other.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Free because no one stops you, or because you can act?',
      subtext: 'These two ideas of freedom lead to very different politics.',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Negative Liberty: Freedom From',
      body: 'John Stuart Mill defended negative liberty: freedom from interference by others, especially the government. You are free as long as no one stops you from doing what you want. The government can limit that freedom only to prevent harm to others. This is the "harm principle": your liberty ends where another person\'s begins.',
      visual: '🚫',
      highlight: 'negative liberty',
    },
    {
      type: 'example',
      title: 'Mill\'s Harm Principle in Action',
      scenario: 'Mill argued that if you eat poorly, take risks, or hold unpopular views, the government has no right to stop you, even "for your own good." Protecting people from themselves limits their liberty. But if your actions harm others, like poisoning their water, defrauding them, or hitting them, then the government can step in.',
      source: 'John Stuart Mill, On Liberty (1859)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Positive Liberty: Freedom To',
      body: 'Isaiah Berlin described a second idea: positive liberty, the actual power to act and reach your goals. You might be "free" from any government interference, yet too poor, uneducated, or sick to use that freedom. Positive liberty asks a harder question: should the government help people act, not just leave them alone?',
      visual: '💪',
      highlight: 'positive liberty',
    },
    {
      type: 'question',
      prompt: 'Which idea of liberty is about removing obstacles and interference?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Positive liberty, the power to reach your goals', isCorrect: false },
          { id: 'b', text: 'Negative liberty, freedom from interference by others', isCorrect: true },
          { id: 'c', text: 'Natural liberty, the freedom we are born with', isCorrect: false },
          { id: 'd', text: 'Civil liberty, the freedom a constitution guarantees', isCorrect: false },
        ],
        explanation: 'Negative liberty means the absence of outside interference: no one is in your way. Positive liberty asks a different question, whether you actually have the power to act.',
      },
    },
    {
      type: 'example',
      title: 'One Situation, Two Views',
      scenario: 'Imagine someone legally allowed to attend any university, with no law blocking them. Someone who values negative liberty would call them free. But if they cannot afford tuition and no help exists, someone who values positive liberty says they are not really free. This disagreement shapes debates over schools, healthcare, and welfare.',
      source: 'Isaiah Berlin, Two Concepts of Liberty (1958)',
      emoji: '🎓',
    },
    {
      type: 'question',
      prompt: 'True or false: Mill thought the government should protect people from their own bad choices.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Mill was firmly against this. His harm principle allows only one reason to limit a person\'s liberty: to prevent harm to others, never to protect the person from themselves.',
      },
    },
    {
      type: 'summary',
      title: 'Two Ways to Think About Freedom',
      keyPoints: [
        'Negative liberty: freedom from interference and force',
        'Mill\'s harm principle: limit liberty only to protect others',
        'Positive liberty: the real power to act, not just permission',
        'This tension shapes every debate about government',
      ],
      closingThought: 'How you define freedom shapes the kind of society you build.',
    },
  ],
};

export default lesson;
