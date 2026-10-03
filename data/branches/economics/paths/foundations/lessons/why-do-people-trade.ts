import type { Lesson } from '@/data/types';

// The fourth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/econ4Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'economics-foundations-4',
  slug: 'why-do-people-trade',
  title: 'Why Do People Trade?',
  description: 'Tomatoes on one side of the fence, hens on the other, and a swap that helps them both.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'She grows tomatoes. He keeps hens. Why not swap?',
      subtext: 'A fair trade leaves both sides better off.',
      emoji: '🍅',
    },
    {
      type: 'concept',
      title: 'Specialising and Trade',
      body: 'Specialising means doing one job well. People then trade what they make for what they need, and a fair trade leaves both sides better off than doing everything themselves.',
      visual: '💡',
      highlight: 'both sides',
    },
    {
      type: 'question',
      prompt: 'What should she use her garden for?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The tomato plants', isCorrect: true },
          { id: 'b', text: 'The hen house', isCorrect: false },
          { id: 'c', text: 'The fence', isCorrect: false },
        ],
        explanation: 'The tomato plants. She grows them well, and the hen kept eating them. Her neighbour already keeps hens, so she can get eggs by trading.',
      },
    },
    {
      type: 'quote',
      id: 'lq-economics-foundations-4-1',
      quote: 'The tailor does not attempt to make his own shoes, but buys them of the shoemaker.',
      author: 'Adam Smith',
      era: '1776',
      work: 'The Wealth of Nations',
    },
    {
      type: 'summary',
      title: 'Why Do People Trade?',
      keyPoints: [
        'Specialising means doing one job well',
        'Trading swaps what you make for what you need',
        'A fair trade leaves both sides better off',
      ],
      closingThought: 'Next time you buy a loaf, ask how long baking your own would take.',
    },
  ],
};

export default lesson;
