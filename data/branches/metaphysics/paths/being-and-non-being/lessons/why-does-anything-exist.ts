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
      headline: 'The universe exists. But why does it exist at all?',
      subtext: 'This question stopped history\'s greatest minds cold.',
      emoji: '🌌',
    },
    {
      type: 'concept',
      title: 'Leibniz\'s Big Question',
      body: 'In 1714, Gottfried Leibniz asked: "Why is there something rather than nothing?" It sounds simple, but it\'s explosive. We take existence for granted — but why should anything exist at all? Nothing existing seems just as possible as something existing. The fact that there\'s a universe is genuinely strange.',
      visual: '🤔',
      highlight: 'why is there something rather than nothing',
    },
    {
      type: 'example',
      title: 'Imagine Absolute Nothingness',
      scenario: 'Picture erasing everything — not just objects, but space, time, energy, even the laws of physics. No darkness (darkness is something). No emptiness (emptiness is something). Pure, total nothing. Now ask: why didn\'t it stay that way? Why did anything pop into existence? This gut-punch of a question is where metaphysics begins.',
      emoji: '🕳️',
    },
    {
      type: 'concept',
      title: 'Why This Question Matters',
      body: 'Leibniz\'s question isn\'t just cosmic trivia. It forces us to examine what "existence" even means. Every scientific explanation assumes things already exist — it can\'t explain why anything exists in the first place. This is a question science hands off to philosophy. The answer (if there is one) would explain everything.',
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
        explanation: 'Leibniz posed this question in his 1714 essay "Principles of Nature and Grace." It became one of the most celebrated questions in all of philosophy.',
      },
    },
    {
      type: 'question',
      prompt: 'Why can\'t science fully answer why anything exists at all?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Science already answered it with the Big Bang', isCorrect: false },
          { id: 'b', text: 'Science assumes things exist — it can\'t explain existence itself', isCorrect: true },
          { id: 'c', text: 'Scientists are not smart enough yet', isCorrect: false },
          { id: 'd', text: 'The question is too short to be scientific', isCorrect: false },
        ],
        explanation: 'Every scientific explanation starts with something already existing (particles, energy, laws). Science explains how things work and change — not why there is anything at all.',
      },
    },
    {
      type: 'summary',
      title: 'Why Existence Is a Mystery',
      keyPoints: [
        'Leibniz asked: why something rather than nothing?',
        'Nothingness seems as possible as existence',
        'Science can\'t answer why anything exists at all',
        'This question is the starting point of metaphysics',
      ],
      closingThought: 'The fact that you exist and can wonder about existence is already astonishing.',
    },
  ],
};

export default lesson;
