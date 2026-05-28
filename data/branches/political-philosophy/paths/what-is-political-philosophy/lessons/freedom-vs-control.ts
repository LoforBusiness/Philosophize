import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-4',
  slug: 'freedom-vs-control',
  title: 'Freedom vs. Control',
  description: 'Unpack the tension between individual liberty and government authority.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Are you free because no one stops you — or because you can actually act?',
      subtext: 'Two concepts of liberty that lead to very different politics.',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Negative Liberty: Freedom From',
      body: 'John Stuart Mill championed negative liberty — freedom from interference by others, especially government. You are free to the extent that no one prevents you from doing what you want. The state should only restrict your freedom to stop you harming others. This is the famous "harm principle": your liberty ends where another\'s begins.',
      visual: '🚫',
      highlight: 'negative liberty',
    },
    {
      type: 'example',
      title: 'Mill\'s Harm Principle in Action',
      scenario: 'Mill argued that if you choose to eat an unhealthy diet, take risks, or hold unpopular opinions, the government has no right to stop you — even "for your own good." Paternalism (protecting people from themselves) violates liberty. But if your choices harm others — polluting their water, defrauding them, assaulting them — the state is justified in stepping in.',
      source: 'John Stuart Mill, On Liberty (1859)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Positive Liberty: Freedom To',
      body: 'Isaiah Berlin identified a second concept: positive liberty — the actual capacity to act and achieve your goals. You might be "free" from government interference, yet too poor, uneducated, or ill to exercise that freedom meaningfully. Positive liberty asks: does the state have a duty to empower people, not just step aside?',
      visual: '💪',
      highlight: 'positive liberty',
    },
    {
      type: 'question',
      prompt: 'Which concept of liberty focuses on removing obstacles and interference?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Positive liberty — the capacity to achieve your goals', isCorrect: false },
          { id: 'b', text: 'Negative liberty — freedom from interference by others', isCorrect: true },
          { id: 'c', text: 'Natural liberty — freedom given at birth', isCorrect: false },
          { id: 'd', text: 'Civil liberty — freedom guaranteed by the constitution', isCorrect: false },
        ],
        explanation: 'Negative liberty is defined by the absence of external constraints — no one is stopping you. Positive liberty, by contrast, is about having the real capacity to act freely.',
      },
    },
    {
      type: 'example',
      title: 'The Same Freedom, Two Views',
      scenario: 'Consider someone who is legally free to study at any university — no law bars them. A negative-liberty thinker says they are free. But if that person cannot afford tuition and no support exists, a positive-liberty thinker argues they are not genuinely free. This disagreement drives real policy debates about education funding, healthcare, and welfare every day.',
      source: 'Isaiah Berlin, Two Concepts of Liberty (1958)',
      emoji: '🎓',
    },
    {
      type: 'question',
      prompt: 'True or false: Mill believed governments should restrict freedom to protect people from their own bad choices.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Mill explicitly opposed paternalism. His harm principle holds that the only legitimate reason to restrict someone\'s liberty is to prevent harm to others — not to protect the person from themselves.',
      },
    },
    {
      type: 'summary',
      title: 'Two Ways to Think About Freedom',
      keyPoints: [
        'Negative liberty: freedom from interference and coercion',
        'Mill\'s harm principle: restrict liberty only to prevent harm to others',
        'Positive liberty: real capacity to act, not just absence of barriers',
        'The tension between them shapes every debate on government',
      ],
      closingThought: 'How you define freedom determines the kind of society you want to build.',
    },
  ],
};

export default lesson;
