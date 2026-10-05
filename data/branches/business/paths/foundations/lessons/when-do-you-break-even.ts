import type { Lesson } from '@/data/types';

// The sixth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/biz6Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'business-foundations-6',
  slug: 'when-do-you-break-even',
  title: 'When Do You Break Even?',
  description: 'Opening night at a haunted castle attraction, and how many screams it takes to pay the rent.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A thousand pounds a night to run the castle. How many guests to pay for it?',
      subtext: 'Break-even is where sales just cover the costs.',
      emoji: '🏰',
    },
    {
      type: 'concept',
      title: 'Break-Even',
      body: 'Fixed costs stay the same however many you sell, and variable costs grow with every sale. Break-even is the point where sales just cover both.',
      visual: '💡',
      highlight: 'break-even',
    },
    {
      type: 'question',
      prompt: 'Each guest puts ten pounds towards the thousand. At which count does he break even?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: '100 guests', isCorrect: true },
          { id: 'b', text: '50 guests', isCorrect: false },
          { id: 'c', text: '1,000 guests', isCorrect: false },
        ],
        explanation: 'A hundred guests. A hundred lots of ten pounds covers the thousand in fixed costs.',
      },
    },
    {
      type: 'quote',
      id: 'lq-business-foundations-6-1',
      quote: 'Money is in some respects like fire; it is a very excellent servant but a terrible master.',
      author: 'P. T. Barnum',
      era: '1880',
      work: 'The Art of Money Getting',
    },
    {
      type: 'summary',
      title: 'When Do You Break Even?',
      keyPoints: [
        'Fixed costs stay the same however many you sell',
        'Variable costs grow with every sale',
        'Break-even is where sales just cover both',
      ],
      closingThought: 'Next time you see a new shop open, ask how many sales it needs a day.',
    },
  ],
};

export default lesson;
