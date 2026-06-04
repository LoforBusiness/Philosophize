import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-5',
  slug: 'mystery-of-existence',
  title: 'The Mystery of Existence',
  description: 'Why the simple fact that anything exists at all, including you, is worth thinking about.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You exist, and that simple fact is worth pausing on.',
      subtext: 'Heidegger thought wondering at this was where real philosophy starts.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Heidegger\'s Wonder at Being',
      body: 'Martin Heidegger called this the "fundamental question of metaphysics." Beyond asking why things exist, he focused on the plain surprise that anything is here at all. He called this feeling "wonder at Being." Most of us never notice it, he thought. Noticing it, and taking it seriously, is where philosophy really begins.',
      visual: '👁️',
      highlight: 'wonder at Being',
    },
    {
      type: 'example',
      title: 'The Light From a Star',
      scenario: 'When you look at a star, you see light that left it thousands of years ago. The star itself might not even exist anymore. Yet that ancient light reaches your eye right now. You happen to exist at this moment, on this planet, able to look up and ask why anything is here. That alone is remarkable.',
      emoji: '⭐',
    },
    {
      type: 'concept',
      title: 'Existence Asking About Itself',
      body: 'Heidegger noticed something unusual about us: we are the beings for whom our own existence is a question. A stone exists but never wonders. An animal lives but never asks why. We exist and we ask about it. He gave this kind of being a special name, "Dasein." Through us, the universe can reflect on itself.',
      visual: '🌍',
      highlight: 'Dasein',
    },
    {
      type: 'question',
      prompt: 'What did Heidegger call the mood of wonder at the sheer fact of existence?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Existential dread', isCorrect: false },
          { id: 'b', text: 'Wonder at Being', isCorrect: true },
          { id: 'c', text: 'The Leap of Faith', isCorrect: false },
          { id: 'd', text: 'The Absurd', isCorrect: false },
        ],
        explanation: 'For Heidegger, "wonder at Being" is the feeling of being struck by the simple fact that something exists rather than nothing. He saw it as the way into real philosophical thinking.',
      },
    },
    {
      type: 'question',
      prompt: 'What does Heidegger\'s term "Dasein" literally mean?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Death wish', isCorrect: false },
          { id: 'b', text: 'Being there', isCorrect: true },
          { id: 'c', text: 'The nothing', isCorrect: false },
          { id: 'd', text: 'Thinking existence', isCorrect: false },
        ],
        explanation: '"Dasein" is German for "being there." Heidegger used it for human existence: beings who are aware of their own existence and can ask questions about it.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve now covered the main ideas about being and non-being.',
      body: 'From Leibniz\'s question, through Parmenides\' paradox and Plato\'s Forms, to Heidegger\'s wonder, these ideas all return to one point: things exist, that existence is real, and we can think about it. The fact that something exists and can be aware of itself is genuinely striking.',
      emoji: '🌌',
    },
    {
      type: 'summary',
      title: 'Existence Is Worth Wondering About',
      keyPoints: [
        'Heidegger: wonder at Being starts real philosophy',
        'Humans can question their own existence',
        'Dasein names a being aware of its own being',
        'This sense of wonder is where metaphysics begins',
      ],
      closingThought: 'You\'re part of a universe that can ask why it exists, so it\'s worth asking.',
    },
  ],
};

export default lesson;
