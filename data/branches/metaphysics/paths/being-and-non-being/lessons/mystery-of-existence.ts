import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-5',
  slug: 'mystery-of-existence',
  title: 'The Mystery of Existence',
  description: 'Why the bare fact that anything exists is metaphysics\' deepest puzzle.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'There is something rather than nothing. Why?',
      subtext: 'Leibniz framed it. Heidegger called it the first question.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Heidegger\'s First Question',
      body: 'Heidegger calls "Why are there beings at all instead of nothing?" the fundamental question of metaphysics. Not why this or that exists, but why anything does. The jolt of noticing it is wonder.',
      visual: '👁️',
      highlight: 'fundamental question',
    },
    {
      type: 'example',
      title: 'Leibniz\'s Great Question',
      scenario: 'In 1714 Leibniz pressed the sharpest question: why is there something rather than nothing? His Principle of Sufficient Reason says every fact needs a reason — so existence itself demands one.',
      emoji: '🌌',
      source: 'Leibniz, Principles of Nature and Grace (1714), §7',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-5-1',
      quote: 'Why are there beings at all instead of nothing? That is the question.',
      author: 'Martin Heidegger',
      era: '1935',
      work: 'Introduction to Metaphysics',
    },
    {
      type: 'concept',
      title: 'Existence Asking About Itself',
      body: 'In Being and Time (1927) Heidegger names what is strange about us: we are the beings whose own being is at issue. He calls this "Dasein." Through us, existence turns and questions itself.',
      visual: '🌍',
      highlight: 'Dasein',
    },
    {
      type: 'question',
      prompt: 'For Heidegger, which mood throws open the question of why anything exists at all?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Cartesian doubt', isCorrect: false },
          { id: 'b', text: 'Wonder at Being', isCorrect: true },
          { id: 'c', text: 'The leap of faith', isCorrect: false },
          { id: 'd', text: 'The absurd', isCorrect: false },
        ],
        explanation: 'Wonder — astonishment that anything is at all — opens the fundamental question. Doubt is Descartes\'s method, the leap is Kierkegaard\'s, and the absurd is Camus\'s — different moves for different questions.',
      },
    },
    {
      type: 'question',
      prompt: '"Dasein" is German. Which tempting translation is the one Heidegger actually means?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Daydream — the mind wandering toward Being', isCorrect: false },
          { id: 'b', text: 'Design — existence with a built-in purpose', isCorrect: false },
          { id: 'c', text: 'Being-there — the being whose own being is in question', isCorrect: true },
          { id: 'd', text: 'Decision — choosing one\'s own existence', isCorrect: false },
        ],
        explanation: '"Dasein" splits into Da (there) and Sein (being): "being-there." The look-alikes "daydream" and "design" are traps — it names human existence, the being for whom being is a question.',
      },
    },
    {
      type: 'summary',
      title: 'Existence Is Worth Wondering About',
      keyPoints: [
        'Leibniz: why something rather than nothing?',
        'Heidegger: the fundamental question',
        'Dasein: a being whose being is in question',
        'Wonder is where metaphysics catches fire',
      ],
      closingThought: 'You belong to a universe that can ask why it exists — so go ahead and ask.',
    },
  ],
};

export default lesson;
