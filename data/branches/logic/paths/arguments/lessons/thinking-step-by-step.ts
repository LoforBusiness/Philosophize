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
      headline: 'The hardest problems dissolve when you take one step at a time.',
      subtext: 'Step-by-step reasoning is how philosophers conquer the impossible.',
      emoji: '🪜',
    },
    {
      type: 'concept',
      title: 'Why Order Matters',
      body: 'In a well-built argument, each step earns the next one. You can\'t jump to step four before step two is solid. Skipping steps is how arguments secretly fall apart — the conclusion seems to appear from nowhere. Ordered reasoning leaves no hiding places for errors.',
      visual: '📐',
      highlight: 'each step earns the next',
    },
    {
      type: 'example',
      title: 'Descartes Builds from Zero',
      scenario: 'Descartes doubted everything — his senses, the world, even mathematics. But he couldn\'t doubt that he was doubting. Step 1: I am doubting. Step 2: Doubting is thinking. Step 3: Thinking requires a thinker. Conclusion: I exist. Each step is tiny. Together they\'re unshakeable.',
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
        explanation: 'Skipping steps creates hidden gaps where errors can hide. A strong argument shows every link in the chain so each one can be checked and verified.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve seen that strong arguments have no logical gaps.',
      body: 'Step-by-step thinking is how you eliminate gaps on purpose. Each step you make explicit is one less place a hidden flaw can lurk. Philosophers who think this way don\'t just find better answers — they find answers that last.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'Step-by-Step Thinking Mastered',
      keyPoints: [
        'Each step in an argument must earn the next',
        'Skipping steps hides errors and weakens reasoning',
        'Descartes built certainty one tiny step at a time',
        'Explicit steps leave no room for hidden flaws',
      ],
      closingThought: 'Take the next big problem in your life and break it into steps — that\'s philosophy in action.',
    },
  ],
};

export default lesson;
