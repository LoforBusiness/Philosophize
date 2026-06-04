import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-4',
  slug: 'where-does-knowledge-come-from',
  title: 'Where Does Knowledge Come From?',
  description: 'Explore the long debate between empiricists and rationalists about where human knowledge comes from.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Is the mind empty at birth, or does it start with ideas?',
      subtext: 'Two famous answers to where our knowledge actually begins.',
      emoji: '🌱',
    },
    {
      type: 'concept',
      title: 'Empiricism: Knowledge From Experience',
      body: 'Empiricists say the mind starts as a blank slate. Locke called it a "tabula rasa." On this view, knowledge comes only through the senses: sight, sound, touch, taste, and smell. Nothing is in the mind ahead of time. Everything you understand, you learned from experience.',
      visual: '👁️',
      highlight: 'tabula rasa',
    },
    {
      type: 'example',
      title: 'Locke\'s Blank Slate',
      scenario: 'John Locke asked where our ideas come from. His answer: a newborn knows nothing at all. A child learns "hot" by getting burned and "red" by seeing red things. Even big ideas like justice and beauty are built up slowly, over years, from many small experiences through the senses.',
      source: 'John Locke, An Essay Concerning Human Understanding (1689)',
      emoji: '📋',
    },
    {
      type: 'concept',
      title: 'Rationalism: Knowledge From Reason',
      body: 'Rationalists say some knowledge is innate, meaning it is in the mind before any experience. Descartes argued that math, logic, and even some truths about God are not learned from the world but worked out by reason alone. On this view, the mind is not empty at birth.',
      visual: '⚙️',
      highlight: 'innate knowledge',
    },
    {
      type: 'example',
      title: 'Descartes\' Wax Thought Experiment',
      scenario: 'Descartes held a piece of wax near a flame. Its color, smell, shape, and texture all changed, yet he still knew it was the same wax. That knowledge could not come from the senses, since they only reported the changes. It came from his mind. For Descartes, reason grasps what the senses miss.',
      source: 'René Descartes, Meditations on First Philosophy (1641)',
      emoji: '🕯️',
    },
    {
      type: 'question',
      prompt: 'Which philosopher held that the mind begins as a blank slate, with no innate ideas?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'John Locke', isCorrect: true },
          { id: 'b', text: 'René Descartes', isCorrect: false },
          { id: 'c', text: 'Plato', isCorrect: false },
          { id: 'd', text: 'Aristotle', isCorrect: false },
        ],
        explanation: 'Locke is famous for the "tabula rasa," the idea that the mind is blank at birth and filled only by the senses. Descartes took the opposite view, trusting innate ideas reached by reason.',
      },
    },
    {
      type: 'question',
      prompt: 'Rationalists hold that some knowledge comes from reason alone, without any experience.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Rationalists like Descartes argued that some truths, especially in math and logic, are reached by reason alone and owe nothing to the senses. These are called "innate" or "a priori" truths.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have seen both sides of the debate.',
      body: 'Kant later tried to combine them. He said experience gives us the raw material, but the mind\'s own structure shapes how we make sense of it. The debate between reason and experience never fully ended. It still comes up today in discussions about AI and how children learn.',
      emoji: '🌉',
    },
    {
      type: 'summary',
      title: 'The Great Knowledge Debate',
      keyPoints: [
        'Empiricists trace all knowledge to experience',
        'Locke\'s blank slate: nothing comes before experience',
        'Rationalists say reason reveals some truths',
        'Descartes trusted innate ideas the senses never gave',
      ],
      closingThought: 'Born with some ideas, or learning it all from scratch? Either way, asking how you know is philosophy at work.',
    },
  ],
};

export default lesson;
