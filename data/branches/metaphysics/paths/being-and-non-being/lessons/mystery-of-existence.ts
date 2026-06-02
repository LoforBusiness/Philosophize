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
      headline: 'You exist — and that plain fact should stop you cold.',
      subtext: 'Heidegger believed no insight ran deeper than this one.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Heidegger\'s Awe at Being',
      body: 'Martin Heidegger named it the "fundamental question of metaphysics" — beyond Leibniz\'s why, the raw astonishment that anything is here at all. He called this mood "wonder at Being." Most of us, he thought, sleepwalk through our days, never struck by the miracle of being rather than not. To wake into that wonder is where philosophy truly begins.',
      visual: '👁️',
      highlight: 'wonder at Being',
    },
    {
      type: 'example',
      title: 'The Light From a Star',
      scenario: 'Look up at a star and you meet light that set out thousands of years ago. The star itself may already be gone. Yet for one instant a thread of its ancient fire finds your eye. You exist in this thin sliver of time, on this one planet, able to gaze up and ask why. Against impossible odds — here you are.',
      emoji: '⭐',
    },
    {
      type: 'concept',
      title: 'Existence Turns to Face Itself',
      body: 'Heidegger noticed something singular about us: we are the beings for whom existence is itself a question. A stone exists but never wonders. An animal lives but never asks why. We exist and are bewildered by it. This peculiar kind of being he called "Dasein" — literally "being there." In us, the universe begins to glimpse itself.',
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
        explanation: 'For Heidegger, "wonder at Being" is the mood of being struck dumb by the plain, astonishing fact that something exists rather than nothing. He saw it as the doorway into genuine philosophical thought.',
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
        explanation: '"Dasein" is German for "being there." Heidegger reserved it for human existence — for beings who are aware of their own being and can hold it in question.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve now traced the whole arc of being and non-being.',
      body: 'From Leibniz\'s opening why, through Parmenides\' paradox and Plato\'s Forms, to Heidegger\'s wonder, metaphysics circles back to one astonishing core: existence is here, it is real, and we can think about it. Being joined to awareness may be the single most remarkable fact the universe has to offer.',
      emoji: '🌌',
    },
    {
      type: 'summary',
      title: 'Existence Is Worth Wondering About',
      keyPoints: [
        'Heidegger: wonder at Being opens the door to philosophy',
        'Humans alone hold their own existence in question',
        'Dasein names a being aware of its own being',
        'Metaphysics begins and ends in this awe',
      ],
      closingThought: 'You are the universe asking itself why it is here — so keep asking.',
    },
  ],
};

export default lesson;
