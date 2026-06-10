import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-6',
  slug: 'justice-as-fairness',
  title: 'Justice as Fairness',
  description: 'Rawls\'s veil of ignorance, deepened: when are inequalities actually fair?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Would you accept this society if you were the poorest?',
      subtext: 'Rawls turned that question into a test for justice itself.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Back Behind the Veil',
      body: 'You met Rawls\'s veil of ignorance: choose the rules not knowing who you will be. From that fair start, Rawls says, two principles fall out, in strict order.',
      visual: '🎭',
      highlight: 'two principles',
    },
    {
      type: 'concept',
      title: 'The Two Principles',
      body: 'First: each person gets the same basic liberties, and these come first. Second: inequalities are allowed only if they help the least advantaged and attach to jobs open to all.',
      visual: '📐',
      highlight: 'the least advantaged',
    },
    {
      type: 'quote',
      id: 'lq-political-political-6-1',
      quote: 'Justice is the first virtue of social institutions, as truth is of systems of thought.',
      author: 'John Rawls',
      era: '1971',
      work: 'A Theory of Justice',
    },
    {
      type: 'example',
      title: 'The Difference Principle',
      scenario: 'A surgeon earns far more than a clerk. Unfair? Rawls says not necessarily. If higher pay draws talent that makes even the worst-off better than under equal pay, the gap is just. The test is the bottom, not the top.',
      source: 'John Rawls, A Theory of Justice (1971)',
      emoji: '🏥',
    },
    {
      type: 'question',
      prompt: 'When does Rawls\'s difference principle permit an inequality of wealth?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Whenever the rich worked harder than the poor', isCorrect: false },
          { id: 'b', text: 'Only when the inequality benefits the least advantaged', isCorrect: true },
          { id: 'c', text: 'Whenever a majority votes to allow it', isCorrect: false },
          { id: 'd', text: 'Never; Rawls demanded perfectly equal wealth', isCorrect: false },
        ],
        explanation: 'Rawls permits gaps only if they lift the worst-off above what equality would give them. The yardstick is the least advantaged, not effort or popularity.',
      },
    },
    {
      type: 'question',
      prompt: 'Rawls protects the worst-off, so surely his liberty principle can be traded away to boost their wealth. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, Rawls let basic freedoms be sacrificed for extra income', isCorrect: false },
          { id: 'b', text: 'No, equal basic liberties come first and cannot be bought off', isCorrect: true },
          { id: 'c', text: 'Yes, Rawls ranked wealth above all the liberties', isCorrect: false },
          { id: 'd', text: 'No, because Rawls rejected liberty as a value entirely', isCorrect: false },
        ],
        explanation: 'The trap: helping the poor sounds like grounds to trade liberty for cash. But Rawls gives the basic liberties strict priority; only after they are secured does the difference principle apply.',
      },
    },
    {
      type: 'summary',
      title: 'Fairness Has a Structure',
      keyPoints: [
        'Equal basic liberties come first, always',
        'Inequalities must help the least advantaged',
        'The test is the bottom, not the top',
        'Justice judged from behind the veil',
      ],
      closingThought: 'A just society is one you would accept before knowing your place in it.',
    },
  ],
};

export default lesson;
