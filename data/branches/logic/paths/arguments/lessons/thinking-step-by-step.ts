import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-5',
  slug: 'thinking-step-by-step',
  title: 'Thinking Step by Step',
  description: 'How philosophers solve hard problems by working through clear, ordered steps — and how you can too.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Hard problems get easier when you take one step at a time.',
      subtext: 'Working step by step is how philosophers tackle tough questions.',
      emoji: '🪜',
    },
    {
      type: 'concept',
      title: 'Why Order Matters',
      body: 'In a good argument, each step is supported by the one before it. You can\'t jump to step four until step two is solid. Skipping steps is how bad reasoning sneaks in — the conclusion seems to come from nowhere. Working in order makes any weak step easy to catch.',
      visual: '📐',
      highlight: 'each step earns the next',
    },
    {
      type: 'example',
      title: 'Descartes Builds from Nothing',
      scenario: 'Descartes tried doubting everything — his senses, the world, even math. But he couldn\'t doubt that he was doubting. Step 1: I am doubting. Step 2: Doubting is a kind of thinking. Step 3: Thinking needs a thinker. Conclusion: I exist. Each step is small, but together they hold.',
      source: 'René Descartes, Meditations on First Philosophy',
      emoji: '🧠',
    },
    {
      type: 'question',
      prompt: 'True or false: skipping steps in an argument makes it stronger.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Each skipped step is a gap where an error can hide. A strong argument shows every link in the chain, so each one can be checked.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve seen that strong arguments leave no logical gaps.',
      body: 'Step-by-step thinking is how you close those gaps on purpose. Spelling out each step gives a flaw one less place to hide. Reasoning this way helps you reach answers you can actually defend.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'Step-by-Step Thinking Mastered',
      keyPoints: [
        'Each step must be supported by the one before it',
        'Skipping steps hides errors and weakens reasoning',
        'Descartes built certainty one small step at a time',
        'Spelling out each step leaves no room for hidden flaws',
      ],
      closingThought: 'Next time a problem feels too big, break it into steps and work through them.',
    },
  ],
};

export default lesson;
