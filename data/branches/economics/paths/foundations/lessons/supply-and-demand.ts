import type { Lesson } from '@/data/types';

// The second lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/econ2Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'economics-foundations-2',
  slug: 'supply-and-demand',
  title: 'Supply and Demand',
  description: 'A rack of umbrellas, a sudden downpour, and a van that changes the price again.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Five pounds this morning. Twelve pounds in the rain. Same umbrella.',
      subtext: 'Two forces set every price on the street corner.',
      emoji: '☂️',
    },
    {
      type: 'concept',
      title: 'Two Forces, One Price',
      body: 'Demand is how much people want to buy at each price. Supply is how much sellers have to offer. When the rain starts, demand jumps and the price rises. When a van brings more umbrellas, supply grows and the price falls.',
      visual: '💡',
      highlight: 'price',
    },
    {
      type: 'question',
      prompt: 'A van brings a hundred more umbrellas to the corner, and the rain keeps falling. What happens to the price?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It falls', isCorrect: true },
          { id: 'b', text: 'It rises', isCorrect: false },
          { id: 'c', text: 'It stays the same', isCorrect: false },
        ],
        explanation: 'It falls. More supply, with the same demand, means sellers compete for the same buyers.',
      },
    },
    {
      type: 'quote',
      id: 'lq-economics-foundations-2-1',
      quote: 'We might as reasonably dispute whether it is the upper or the under blade of a pair of scissors that cuts a piece of paper, as whether value is governed by utility or cost of production.',
      author: 'Alfred Marshall',
      era: '1890',
      work: 'Principles of Economics',
    },
    {
      type: 'summary',
      title: 'Supply and Demand',
      keyPoints: [
        'Demand is how much people want to buy, at each price',
        'Supply is how much sellers have to offer',
        'The price moves when either one changes',
      ],
      closingThought: 'Next time a price jumps, ask what changed: how many people want it, or how much is for sale.',
    },
  ],
};

export default lesson;
