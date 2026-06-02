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
      headline: 'Is the mind born empty, or does it arrive already furnished?',
      subtext: 'Two answers to philosophy\'s oldest quarrel about where knowledge begins.',
      emoji: '🌱',
    },
    {
      type: 'concept',
      title: 'Empiricism: Knowledge From Experience',
      body: 'Empiricists hold that the mind begins as a blank slate — Locke\'s famous "tabula rasa." Knowledge arrives only through the senses: sight, sound, touch, taste, smell. Nothing is written there beforehand. All you understand, the world first taught you. Strip away experience, and the mind falls utterly silent.',
      visual: '👁️',
      highlight: 'tabula rasa',
    },
    {
      type: 'example',
      title: 'Locke\'s Blank Slate',
      scenario: 'John Locke pressed a simple question: where do our ideas truly come from? A newborn, he answered, arrives knowing nothing at all. A child learns "hot" only by being burned, "red" only by seeing red things. Even our grandest ideas — justice, beauty, God — are quietly assembled, over years, from humble scraps of sense.',
      source: 'John Locke, An Essay Concerning Human Understanding (1689)',
      emoji: '📋',
    },
    {
      type: 'concept',
      title: 'Rationalism: Knowledge From Reason',
      body: 'Rationalists answer that some knowledge is innate — woven into the mind before any experience touches it. Descartes held that mathematics, logic, and even God\'s existence are not gathered from the world but uncovered by pure reason. The mind is no empty vessel; it arrives already carrying certain truths.',
      visual: '⚙️',
      highlight: 'innate knowledge',
    },
    {
      type: 'example',
      title: 'Descartes\' Wax Thought Experiment',
      scenario: 'Descartes set a piece of wax near a flame. Its color, scent, shape, and texture all dissolved into something new — yet he knew it was the same wax still. Such knowledge could not come from the senses, which reported only difference. It came from the intellect. For Descartes, the mind grasps what the eye cannot.',
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
        explanation: 'Locke gave empiricism its emblem: the "tabula rasa," a mind blank at birth, written on only by the senses. Descartes stood opposite, trusting innate ideas that reason alone uncovers.',
      },
    },
    {
      type: 'question',
      prompt: 'Rationalists hold that some knowledge springs from reason alone, untouched by experience.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Rationalists like Descartes argued that certain truths — above all in mathematics and logic — are grasped by reason alone, owing nothing to the senses. Such truths are called "innate" or "a priori."',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have now stood on both shores of the great debate.',
      body: 'Kant later sought a bridge: experience supplies the raw material, he said, but the mind\'s own structure shapes how we read it. The quarrel between reason and experience never truly closed — it still hums beneath every argument about AI, learning, and the growing mind.',
      emoji: '🌉',
    },
    {
      type: 'summary',
      title: 'The Great Knowledge Debate',
      keyPoints: [
        'Empiricists trace all knowledge back to experience',
        'Locke\'s blank slate: nothing precedes experience',
        'Rationalists say reason reveals truths born within',
        'Descartes trusted innate ideas the senses never gave',
      ],
      closingThought: 'Born knowing something, or learning it all from scratch — either way, asking how you know is philosophy at its most alive.',
    },
  ],
};

export default lesson;
