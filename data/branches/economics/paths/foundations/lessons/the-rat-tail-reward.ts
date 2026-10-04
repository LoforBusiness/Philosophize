import type { Lesson } from '@/data/types';

// The fifth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/econ5Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'economics-foundations-5',
  slug: 'the-rat-tail-reward',
  title: 'The Rat-Tail Reward',
  description: 'A mayor pays a silver coin for every rat tail, and the town fills up with rats.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A coin for every rat tail. So why are there more rats than ever?',
      subtext: 'People chase the reward, not what you meant.',
      emoji: '🐀',
    },
    {
      type: 'concept',
      title: 'Incentives',
      body: 'A reward that changes what people do is an incentive. People chase the reward rather than what you meant by it, so reward the result you want, not something easy to make more of.',
      visual: '💡',
      highlight: 'incentive',
    },
    {
      type: 'question',
      prompt: 'Which of the mayor’s decrees will get rid of the rats?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A coin per rat-free street', isCorrect: true },
          { id: 'b', text: 'Two coins a tail', isCorrect: false },
          { id: 'c', text: 'A coin per dead rat', isCorrect: false },
        ],
        explanation: 'A coin per rat-free street. It pays for fewer rats, which is what the town wants.',
      },
    },
    {
      type: 'quote',
      id: 'lq-economics-foundations-5-1',
      quote: 'Economics is, at root, the study of incentives: how people get what they want, or need, especially when other people want or need the same thing.',
      author: 'Steven Levitt and Stephen Dubner',
      era: '2005',
      work: 'Freakonomics',
    },
    {
      type: 'summary',
      title: 'The Rat-Tail Reward',
      keyPoints: [
        'An incentive is a reward that changes what people do',
        'People chase the reward, not what you meant',
        'Reward the result you want, not something easy to fake',
      ],
      closingThought: 'Next time you see a reward on offer, ask what it makes people do.',
    },
  ],
};

export default lesson;
