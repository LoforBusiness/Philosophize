import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-4',
  slug: 'where-does-knowledge-come-from',
  title: 'Where Does Knowledge Come From?',
  description: 'Explore the great debate between empiricists and rationalists on the origins of human knowledge.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Is your mind born empty, or does it arrive pre-loaded?',
      subtext: 'Two sides of philosophy\'s biggest debate about where knowledge begins.',
      emoji: '🌱',
    },
    {
      type: 'concept',
      title: 'Empiricism: Knowledge From Experience',
      body: 'Empiricists argue that the mind starts as a blank slate — what Locke called a "tabula rasa." All knowledge enters through the senses: sight, sound, touch, taste, smell. There are no built-in ideas. Everything you know, you learned by experiencing the world. Without experience, you would know nothing at all.',
      visual: '👁️',
      highlight: 'tabula rasa',
    },
    {
      type: 'example',
      title: 'Locke\'s Blank Slate',
      scenario: 'John Locke asked: where do our ideas come from? He argued that a newborn has no innate knowledge whatsoever. A child learns "hot" only by touching something hot. They learn "red" only by seeing red things. Every complex idea — justice, beauty, God — is ultimately built from simple sensory experiences stacked together over time.',
      source: 'John Locke, An Essay Concerning Human Understanding (1689)',
      emoji: '📋',
    },
    {
      type: 'concept',
      title: 'Rationalism: Knowledge From Reason',
      body: 'Rationalists argue that some knowledge is innate — built into the mind before any experience. Descartes believed that concepts like mathematics, logic, and God\'s existence are not learned from the world; they are discovered through pure reason. The mind is not empty; it arrives pre-equipped with certain truths.',
      visual: '⚙️',
      highlight: 'innate knowledge',
    },
    {
      type: 'example',
      title: 'Descartes\' Wax Thought Experiment',
      scenario: 'Descartes held a piece of wax near a flame. Its color, smell, shape, and texture all changed. Yet he still knew it was the same wax. This knowledge could not come from the senses — they reported completely different data. It came from the intellect, from reason. For Descartes, the mind grasps what the senses cannot.',
      source: 'René Descartes, Meditations on First Philosophy (1641)',
      emoji: '🕯️',
    },
    {
      type: 'question',
      prompt: 'Which philosopher argued that the mind begins as a blank slate with no innate ideas?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'John Locke', isCorrect: true },
          { id: 'b', text: 'René Descartes', isCorrect: false },
          { id: 'c', text: 'Plato', isCorrect: false },
          { id: 'd', text: 'Aristotle', isCorrect: false },
        ],
        explanation: 'John Locke championed the empiricist view with the "tabula rasa" — the idea that the mind is a blank slate at birth and that all knowledge comes from sensory experience. Descartes, by contrast, believed in innate ideas discovered through reason.',
      },
    },
    {
      type: 'question',
      prompt: 'Rationalists believe some knowledge comes purely from reason, not experience.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Rationalists like Descartes argued that certain truths — especially in mathematics and logic — are known through reason alone, independent of any sensory experience. These are called "innate ideas" or "a priori" knowledge.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve now met both sides of the great debate.',
      body: 'Kant later tried to bridge the gap, arguing that experience gives us raw material but the mind\'s built-in structure shapes how we interpret it. The debate between rationalism and empiricism never fully ended — it\'s baked into every argument about AI, education, and how humans learn.',
      emoji: '🌉',
    },
    {
      type: 'summary',
      title: 'The Great Knowledge Debate',
      keyPoints: [
        'Empiricists say all knowledge comes from experience',
        'Locke\'s blank slate: no knowledge exists before experience',
        'Rationalists say reason reveals built-in truths',
        'Descartes believed innate ideas exist independent of senses',
      ],
      closingThought: 'Whether you\'re born knowing anything or learn it all — either way, the quest to understand how you know is philosophy at its most alive.',
    },
  ],
};

export default lesson;
