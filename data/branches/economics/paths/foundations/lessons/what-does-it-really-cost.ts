import type { Lesson } from '@/data/types';

// The third lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/econ3Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'economics-foundations-3',
  slug: 'what-does-it-really-cost',
  title: 'What Does It Really Cost?',
  description: 'A free football match, a concert, and one Saturday afternoon to spend.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The football is free. The concert costs twenty pounds. Which costs more?',
      subtext: 'Every choice costs what you give up for it.',
      emoji: '🎟️',
    },
    {
      type: 'concept',
      title: 'Opportunity Cost',
      body: 'Choosing one thing means giving up the next best thing. That is the opportunity cost. Even something free costs the time you could have spent on something else.',
      visual: '💡',
      highlight: 'give up',
    },
    {
      type: 'question',
      prompt: 'If he picks the free football, what is his opportunity cost?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The concert he misses', isCorrect: true },
          { id: 'b', text: 'Nothing, because it is free', isCorrect: false },
          { id: 'c', text: 'The price of the match', isCorrect: false },
        ],
        explanation: 'The concert he misses. It is the next best choice. Free costs no money, but it still costs what you give up.',
      },
    },
    {
      type: 'quote',
      id: 'lq-economics-foundations-3-1',
      quote: 'There’s no such thing as a free lunch.',
      author: 'Milton Friedman',
      era: '1975',
      work: 'There’s No Such Thing as a Free Lunch',
    },
    {
      type: 'summary',
      title: 'What Does It Really Cost?',
      keyPoints: [
        'Choosing one thing means giving up another',
        'What you give up is the opportunity cost',
        'Even something free costs your time',
      ],
      closingThought: 'Next time something is free, ask what you’d be giving up to have it.',
    },
  ],
};

export default lesson;
