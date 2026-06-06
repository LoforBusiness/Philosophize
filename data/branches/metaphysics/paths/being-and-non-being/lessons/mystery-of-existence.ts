import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-5',
  slug: 'mystery-of-existence',
  title: 'The Mystery of Existence',
  description: 'Why the bare fact that anything exists at all is metaphysics’ deepest puzzle.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'There is something rather than nothing. Why?',
      subtext: 'Leibniz asked it. Heidegger said wondering at it sparks all philosophy.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Heidegger’s Wonder at Being',
      body: 'Martin Heidegger called it the fundamental question of metaphysics: not why this or that exists, but why there is anything at all. The jolt you feel facing it he called wonder—astonishment at Being itself. We rush past it constantly. Stop, look, feel it: that, he said, is where real philosophy ignites.',
      visual: '👁️',
      highlight: 'wonder at Being',
    },
    {
      type: 'example',
      title: 'Leibniz’s Great Question',
      scenario: 'In 1714 Gottfried Leibniz pressed the sharpest question in metaphysics: "Why is there something rather than nothing?" Nothing would be simpler, tidier, easier. Yet a whole universe blazes instead. Leibniz thought every fact needs a reason—his Principle of Sufficient Reason—so existence itself demands one. Centuries on, the puzzle still bites.',
      emoji: '🌌',
    },
    {
      type: 'concept',
      title: 'Existence Asking About Itself',
      body: 'Heidegger spotted something strange about us: we are the beings whose own existence is a question. Rocks sit, animals live—neither ever wonders why. We exist and we ask. He coined a special name for this kind of being: "Dasein." Through us, the universe turns and stares back at itself.',
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
          { id: 'a', text: 'Existential dread', isCorrect: false },
          { id: 'b', text: 'Wonder at Being', isCorrect: true },
          { id: 'c', text: 'The leap of faith', isCorrect: false },
          { id: 'd', text: 'The absurd', isCorrect: false },
        ],
        explanation: 'Heidegger’s "wonder at Being" is the shock of noticing that anything exists rather than nothing. He saw that astonishment as the doorway into genuine metaphysics.',
      },
    },
    {
      type: 'question',
      prompt: 'What does Heidegger’s term "Dasein" literally mean?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Death wish', isCorrect: false },
          { id: 'b', text: 'Being there', isCorrect: true },
          { id: 'c', text: 'The nothing', isCorrect: false },
          { id: 'd', text: 'Thinking existence', isCorrect: false },
        ],
        explanation: '"Dasein" is German for "being there." Heidegger used it for human existence—beings who are aware that they are, and can question it.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You’ve mapped the heart of being and non-being.',
      body: 'From Leibniz’s "why something?" to Parmenides insisting being simply is, to Plato’s Forms behind appearances, to Heidegger’s wonder—one thread ties them: things exist, that existence is real, and minds like yours can turn around and probe it.',
      emoji: '🌌',
    },
    {
      type: 'summary',
      title: 'Existence Is Worth Wondering About',
      keyPoints: [
        'Leibniz: why something rather than nothing?',
        'Heidegger: wonder at Being sparks philosophy',
        'Dasein names a being aware of its own being',
        'Wonder is where metaphysics catches fire',
      ],
      closingThought: 'You belong to a universe that can ask why it exists—so go ahead and ask.',
    },
  ],
};

export default lesson;
