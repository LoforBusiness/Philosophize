import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-5',
  slug: 'thinking-step-by-step',
  title: 'Thinking Step by Step',
  description: 'See how philosophers crack hard problems by moving through clear, ordered steps — and how you can do the same.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The hardest problems soften when you take a single step at a time.',
      subtext: 'Step by patient step is how philosophers walk into the seemingly impossible.',
      emoji: '🪜',
    },
    {
      type: 'concept',
      title: 'Why Order Matters',
      body: 'In a well-made argument, each step earns the one that follows. You cannot leap to the fourth before the second stands firm. Skipping is how arguments quietly betray us — the conclusion seems to rise out of nowhere. Ordered reasoning leaves error no shadow to hide in.',
      visual: '📐',
      highlight: 'each step earns the next',
    },
    {
      type: 'example',
      title: 'Descartes Builds from Nothing',
      scenario: 'Descartes doubted all of it — his senses, the world, even mathematics. Yet he could not doubt that he was doubting. Step 1: I am doubting. Step 2: To doubt is to think. Step 3: Thinking needs a thinker. Conclusion: I exist. Each step is small; together they cannot be shaken.',
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
        explanation: 'Each step you skip becomes a hollow where error can settle unseen. A strong argument shows every link in the chain, so each one may be examined and tested.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have seen that strong arguments leave no logical gaps.',
      body: 'Step-by-step thinking is how you close those gaps on purpose. Every step made explicit is one fewer corner where a flaw can lurk unseen. Philosophers who reason this way do not merely find better answers — they find answers that endure.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'Step-by-Step Thinking Mastered',
      keyPoints: [
        'Each step in an argument must earn the next',
        'Skipping steps hides error and weakens reasoning',
        'Descartes built certainty one small step at a time',
        'Steps made explicit leave no room for hidden flaws',
      ],
      closingThought: 'Take the next great problem in your life and break it into steps — that is philosophy at work.',
    },
  ],
};

export default lesson;
