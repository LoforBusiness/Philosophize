import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-1',
  slug: 'why-does-anything-exist',
  title: 'Why Does Anything Exist?',
  description: 'Explore the most fundamental question in all of philosophy: why is there something rather than nothing?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A universe is here. Why is there anything at all?',
      subtext: 'The simplest question, and the one that has unsettled the greatest minds.',
      emoji: '🌌',
    },
    {
      type: 'concept',
      title: 'Leibniz\'s Question',
      body: 'In 1714, Gottfried Leibniz asked: "Why is there something rather than nothing?" It sounds almost childlike, yet it detonates on contact. We treat existence as a given, never asking why it bothered to happen. An empty universe seems no less possible than a full one. That ours is full at all is quietly astonishing.',
      visual: '🤔',
      highlight: 'why is there something rather than nothing',
    },
    {
      type: 'example',
      title: 'Imagine Absolute Nothingness',
      scenario: 'Erase everything — not only objects, but space, time, energy, even the laws that govern them. No darkness, for darkness is something. No emptiness, for emptiness is something. Only sheer, unbroken nothing. Now ask: why did it not simply remain so? Why did being stir at all? Sit with that question, and you have arrived at metaphysics.',
      emoji: '🕳️',
    },
    {
      type: 'concept',
      title: 'Why It Refuses to Go Away',
      body: 'This is no cosmic riddle for idle afternoons. It presses us to ask what we even mean by "existence." Every scientific account begins with things already in hand — particles, fields, laws — and so can never reach beneath them. Here science falls silent and hands the torch to philosophy. An answer, if one exists, would illuminate everything.',
      visual: '🔭',
      highlight: 'existence',
    },
    {
      type: 'question',
      prompt: 'Who first famously posed the question "Why is there something rather than nothing?"',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Gottfried Leibniz', isCorrect: true },
          { id: 'b', text: 'Socrates', isCorrect: false },
          { id: 'c', text: 'Immanuel Kant', isCorrect: false },
          { id: 'd', text: 'René Descartes', isCorrect: false },
        ],
        explanation: 'Leibniz raised it in his 1714 essay "Principles of Nature and Grace." Few questions in the whole history of thought have proven so haunting, or so durable.',
      },
    },
    {
      type: 'question',
      prompt: 'Why can\'t science fully answer why anything exists at all?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The Big Bang has already settled the matter', isCorrect: false },
          { id: 'b', text: 'Science presumes things exist; it cannot account for existence itself', isCorrect: true },
          { id: 'c', text: 'Scientists simply aren\'t clever enough yet', isCorrect: false },
          { id: 'd', text: 'The question is too brief to be scientific', isCorrect: false },
        ],
        explanation: 'Every scientific account opens with something already on the table — particles, energy, laws. Science can tell us how things behave and change, never why there is anything to begin with.',
      },
    },
    {
      type: 'summary',
      title: 'Why Existence Is a Mystery',
      keyPoints: [
        'Leibniz asked: why something rather than nothing?',
        'Nothing seems every bit as possible as being',
        'Science explains how, never why there is anything',
        'Here is where metaphysics first draws breath',
      ],
      closingThought: 'That you exist, and can pause to wonder at it, is already a small miracle.',
    },
  ],
};

export default lesson;
