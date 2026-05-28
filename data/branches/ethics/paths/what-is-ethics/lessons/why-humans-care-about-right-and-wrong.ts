import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-1',
  slug: 'why-humans-care-about-right-and-wrong',
  title: 'Why Humans Care About Right and Wrong',
  description: 'Discover the uniquely human capacity for moral reasoning and why we can\'t stop asking "was that right?"',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You just did something — but was it right?',
      subtext: 'Rocks don\'t wonder. Animals don\'t hesitate. Only humans ask that question.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'The Moral Animal',
      body: 'Humans are unique: we reflect on our own actions and ask whether they were good or bad. This capacity — moral reasoning — separates us from every other species. We don\'t just act on instinct. We judge, feel guilt, feel pride, and ask how we should have behaved. That inner voice is the beginning of ethics.',
      visual: '🧠',
      highlight: 'moral reasoning',
    },
    {
      type: 'concept',
      title: 'What Is a Conscience?',
      body: 'Your conscience is the internal sense that certain actions feel wrong even when no one is watching. It\'s not just fear of punishment — it\'s a genuine moral awareness. Philosophers debate whether conscience is innate, learned from society, or built by reason. But everyone agrees: it matters enormously to human life.',
      visual: '💭',
      highlight: 'conscience',
    },
    {
      type: 'example',
      title: 'Aristotle\'s Question',
      scenario: 'Around 350 BCE, Aristotle asked a radical question: "What is the good life for a human being?" He argued that humans have a unique function — rational activity — and that living well means exercising that reason virtuously. Ethics, for Aristotle, wasn\'t about following rules. It was about becoming the best version of yourself.',
      source: 'Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'What most clearly separates human moral reasoning from animal behavior?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Humans reflect on whether their actions were right or wrong', isCorrect: true },
          { id: 'b', text: 'Humans act only on instinct without thinking', isCorrect: false },
          { id: 'c', text: 'Animals feel guilt but cannot express it', isCorrect: false },
          { id: 'd', text: 'Humans always choose the most beneficial action', isCorrect: false },
        ],
        explanation: 'Moral reasoning is the capacity to step back and evaluate our own actions as right or wrong — something unique to humans.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You just learned that humans are uniquely moral beings.',
      body: 'Aristotle called the goal of the moral life eudaimonia — often translated as "flourishing" or "happiness." It\'s not pleasure. It\'s living in full alignment with your highest human capacities. Ethics starts with the question: what does it mean to truly flourish as a human being?',
      emoji: '🌱',
    },
    {
      type: 'question',
      prompt: 'Aristotle believed ethics was primarily about what?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Aristotle focused on character and becoming virtuous — not on following a fixed set of rules. His ethics is about what kind of person you are, not just what you do.',
      },
    },
    {
      type: 'summary',
      title: 'Why Ethics Starts With You',
      keyPoints: [
        'Only humans reflect on whether their actions are right',
        'Conscience is your inner moral awareness at work',
        'Aristotle asked: what does it mean to live well?',
        'Ethics is about flourishing, not just following rules',
      ],
      closingThought: 'Every time you ask "was that the right thing to do?" — you\'re doing philosophy.',
    },
  ],
};

export default lesson;
