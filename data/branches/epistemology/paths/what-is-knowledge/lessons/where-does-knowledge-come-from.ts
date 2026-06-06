import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-4',
  slug: 'where-does-knowledge-come-from',
  title: 'Where Does Knowledge Come From?',
  description: 'Empiricists versus rationalists: the centuries-long fight over whether the senses or pure reason is the true source of human knowledge.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Is the mind blank at birth, or already loaded with ideas?',
      subtext: 'Two camps. One question. Centuries of philosophical war.',
      emoji: '🌱',
    },
    {
      type: 'concept',
      title: 'Empiricism: Knowledge From Experience',
      body: 'Empiricists say the mind starts empty. Locke pictured it as "white paper," a blank slate later called the tabula rasa. Knowledge floods in one way only: through the senses. Locke, Berkeley, and Hume all agreed. Nothing is written in the mind before you live. Experience does the writing.',
      visual: '👁️',
      highlight: 'tabula rasa',
    },
    {
      type: 'example',
      title: 'Locke\'s Blank Slate',
      scenario: 'John Locke asked: where do ideas come from? His verdict: a newborn knows nothing. You learn "hot" by getting burned, "red" by seeing red. Even towering ideas like justice and beauty get built slowly, brick by brick, out of countless small sensations. No experience, no knowledge.',
      source: 'John Locke, An Essay Concerning Human Understanding (1689)',
      emoji: '📋',
    },
    {
      type: 'concept',
      title: 'Rationalism: Knowledge From Reason',
      body: 'Rationalists fire back: some knowledge is innate, baked in before any experience. Descartes and Leibniz argued that math and logic aren\'t learned from the world but proven by reason alone. These are a priori truths, known prior to the senses. The mind, they say, is never truly empty.',
      visual: '⚙️',
      highlight: 'innate knowledge',
    },
    {
      type: 'example',
      title: 'Descartes\' Wax',
      scenario: 'Descartes held wax near a flame. Color, smell, shape, texture, all melted away, yet he still knew it was the same wax. The senses only reported the changes, so they couldn\'t deliver that judgment. Reason did. For Descartes, the mind grasps the truth the senses fumble.',
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
        explanation: 'Locke owns the "tabula rasa": a mind blank at birth, filled only by the senses. Descartes argued the reverse, trusting innate ideas reached by reason. Plato went further still, claiming we are born already knowing eternal truths.',
      },
    },
    {
      type: 'question',
      prompt: 'Rationalists hold that some knowledge comes from reason alone, without any experience.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'True. Rationalists like Descartes and Leibniz insisted some truths, especially in math and logic, are reached by reason alone and owe nothing to the senses. Philosophers call these a priori, known prior to experience.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Then Kant brokered a truce.',
      body: 'Kant argued both camps were half right. Raw data pours in through the senses, but the mind\'s own structure, like space, time, and cause, shapes it into experience. "Thoughts without content are empty; intuitions without concepts are blind." Reason and the senses, he said, need each other.',
      emoji: '🌉',
    },
    {
      type: 'summary',
      title: 'Empiricists vs. Rationalists',
      keyPoints: [
        'Empiricists trace all knowledge to the senses',
        'Locke\'s tabula rasa: the mind starts blank',
        'Rationalists say reason yields a priori truths',
        'Kant fused experience and the mind\'s structure',
      ],
      closingThought: 'Born knowing, or learning from scratch? Either answer is epistemology, the study of how you know anything at all.',
    },
  ],
};

export default lesson;
