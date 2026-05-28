import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-5',
  slug: 'mystery-of-existence',
  title: 'The Mystery of Existence',
  description: 'Why the sheer fact that anything exists at all — including you — is cause for wonder.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You exist. And that fact should astonish you completely.',
      subtext: 'Heidegger thought it was the most important insight possible.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Heidegger\'s Awe at Being',
      body: 'Martin Heidegger called it the "fundamental question of metaphysics" — not just Leibniz\'s question of why something exists, but the raw wonder that anything is here at all. Heidegger called this mood "wonder at Being." He believed most people sleepwalk through existence, never noticing the miracle that they exist rather than not. Waking up to that wonder is the start of philosophy.',
      visual: '👁️',
      highlight: 'wonder at Being',
    },
    {
      type: 'example',
      title: 'The Light From a Star',
      scenario: 'When you look at a star, you\'re seeing light that left it thousands of years ago. That star may no longer exist. Yet for one moment, a tiny fraction of its ancient energy reached your eye. You exist in this sliver of time, on this specific planet, with the ability to look up and wonder why. The odds of you existing at all are almost impossibly small — yet here you are.',
      emoji: '⭐',
    },
    {
      type: 'concept',
      title: 'Existence Understands Itself',
      body: 'Heidegger pointed out something unique about human beings: we are the creatures for whom existence is a question. Rocks exist but don\'t wonder about it. Animals exist but don\'t ask why. Humans exist and are baffled by it. Heidegger called this special kind of being "Dasein" — literally "being there." We are the universe becoming aware of itself.',
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
        explanation: 'Heidegger described "wonder at Being" as the philosophical mood of being struck by the simple, astonishing fact that something exists rather than nothing. He saw it as the gateway to genuine philosophical thinking.',
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
        explanation: '"Dasein" is German for "being there." Heidegger used it to describe human existence specifically — beings who are aware of their own being and can question it.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve now traced the full arc of being and non-being.',
      body: 'From Leibniz\'s opening question, through Parmenides\' paradoxes and Plato\'s Forms, to Heidegger\'s wonder — metaphysics keeps returning to the same astonishing core: existence is here, it\'s real, and we can think about it. That combination — existence plus awareness — is perhaps the most remarkable fact in the universe.',
      emoji: '🌌',
    },
    {
      type: 'summary',
      title: 'Existence Is Worth Wondering About',
      keyPoints: [
        'Heidegger: wonder at Being opens philosophical thinking',
        'Humans uniquely question their own existence',
        'Dasein means we are beings aware of being',
        'Metaphysics begins and ends with this awe',
      ],
      closingThought: 'You are the universe asking itself why it exists — keep asking.',
    },
  ],
};

export default lesson;
