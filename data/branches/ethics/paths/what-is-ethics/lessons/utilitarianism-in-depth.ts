import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-11',
  slug: 'utilitarianism-in-depth',
  title: 'Utilitarianism Up Close',
  description: 'Bentham counted pleasure like coins. Mill insisted some pleasures rank higher.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Can you measure happiness like loose change?',
      subtext: 'One thinker tried to add it up. His student said no, count quality too.',
      emoji: '⚖️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met the outcome lens.',
      body: 'In the three-lenses lesson, consequentialism judged acts by results, not motive. Utilitarianism is its sharpest version: the right act is the one producing the most happiness overall. Now we zoom in on how to count that happiness.',
      emoji: '🔎',
    },
    {
      type: 'example',
      title: 'Bentham Counts the Pleasure',
      scenario: 'Jeremy Bentham wanted ethics to work like bookkeeping. His felicific calculus scored each pleasure by intensity, duration, certainty, and reach, then totalled the ledger. Push-pin, a simple bar game, ranks with poetry if it yields equal pleasure. Quantity is all that counts.',
      source: 'Jeremy Bentham, Principles of Morals and Legislation (1789)',
      emoji: '🧮',
    },
    {
      type: 'concept',
      title: 'Mill Adds a Twist: Quality',
      body: 'John Stuart Mill, Bentham\'s student, refused pure arithmetic. Some pleasures, he argued, are higher in kind, not just amount. Intellectual and moral joys outrank bodily ones. The test: people who have truly tasted both will prefer the higher, even at some cost.',
      visual: '🎼',
      highlight: 'higher and lower pleasures',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-11-1',
      quote: 'It is better to be a human being dissatisfied than a pig satisfied; better to be Socrates dissatisfied than a fool satisfied.',
      author: 'John Stuart Mill',
      era: '1863',
      work: 'Utilitarianism',
      philosopherId: 'john-stuart-mill',
    },
    {
      type: 'question',
      prompt: 'A roomful of cheap thrills sums to more raw pleasure than one symphony. Has it beaten the symphony for Mill?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, equally intense pleasures count equally, so the larger total wins', isCorrect: false },
          { id: 'b', text: 'No, Mill ranked higher pleasures above lower ones in kind, not just amount', isCorrect: true },
          { id: 'c', text: 'Yes, Mill rejected Bentham and counted only bodily pleasures', isCorrect: false },
          { id: 'd', text: 'No, because Mill thought pleasure plays no role in ethics at all', isCorrect: false },
        ],
        explanation: 'Option A is the tempting trap: it commits the quantity fallacy, treating Mill\'s view as pure Benthamite arithmetic. Mill broke with that. Higher pleasures differ in kind, and competent judges who have tasted both prefer them, so they are not simply outvoted by a bigger pile of lower ones.',
      },
    },
    {
      type: 'question',
      prompt: 'For Mill, a higher pleasure can outweigh a larger quantity of lower pleasure. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Yes. This is exactly where Mill departs from Bentham\'s ledger: quality can trump quantity, so the verdict of those who know both pleasures, not the raw total, decides.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Utilitarianism: judge acts by total happiness',
        'Bentham counted pleasure by quantity alone',
        'Mill ranked higher pleasures above lower in kind',
        'Competent judges, not raw sums, decide',
      ],
      closingThought: 'Next time someone says "just add up the happiness," ask Mill\'s question: whose pleasure, and of what kind?',
    },
  ],
};

export default lesson;
