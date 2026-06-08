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
      subtext: 'Leibniz framed it. Heidegger called it the first of all questions.',
      emoji: '✨',
    },
    {
      type: 'concept',
      title: 'Heidegger’s First Question',
      body: 'In Introduction to Metaphysics, Heidegger calls "Why are there beings at all instead of nothing?" the fundamental question of metaphysics—the broadest and deepest. Not why this or that exists, but why anything does. The jolt of noticing it is wonder, the astonishment the Greeks called thaumazein. Stop and feel it.',
      visual: '👁️',
      highlight: 'fundamental question',
    },
    {
      type: 'example',
      title: 'Leibniz’s Great Question',
      scenario: 'In 1714 Gottfried Leibniz pressed the sharpest question in metaphysics: "Why is there something rather than nothing? For nothing is simpler and easier than something." His Principle of Sufficient Reason says every fact needs a reason, so existence itself demands one. His answer: the reason must lie outside the chain of contingent things—in a necessary being.',
      emoji: '🌌',
      source: 'Leibniz, Principles of Nature and Grace, Based on Reason (1714), §7',
    },
    {
      type: 'concept',
      title: 'Existence Asking About Itself',
      body: 'In Being and Time (1927) Heidegger names something strange about us: we are the beings whose own being is at issue—who exist and ask what that means. Rocks sit, animals live; neither wonders. He calls this kind of being "Dasein." Through us, in a sense, existence turns and questions itself.',
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
        explanation: 'Wonder—astonishment that anything is at all rather than nothing—is the mood that opens the fundamental question. (Anxiety, "Existential dread," is real Heidegger too, but it belongs to "the nothing" in his 1929 lecture What Is Metaphysics?)',
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
        explanation: '"Dasein" is German for "being there" (Da-sein). In Being and Time it names human existence—the being for whom its own being is a question.',
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
        'Heidegger: the fundamental question of metaphysics',
        'Dasein names a being whose being is in question',
        'Wonder is where metaphysics catches fire',
      ],
      closingThought: 'You belong to a universe that can ask why it exists—so go ahead and ask.',
    },
  ],
};

export default lesson;
