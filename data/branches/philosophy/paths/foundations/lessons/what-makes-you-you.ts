import type { Lesson } from '@/data/types';

// The fifth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/phil5Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'philosophy-foundations-5',
  slug: 'what-makes-you-you',
  title: 'What Makes You You?',
  description: 'A teleporter on a space lab, a volunteer having second thoughts, and a pod that jams.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The pod builds you on the Moon, and breaks down the old you. Is it still you?',
      subtext: 'Are you your body, or your memories?',
      emoji: '🚀',
    },
    {
      type: 'concept',
      title: 'Body or Memories',
      body: 'On one view a person is their body; on another, their memories. A perfect duplicate shows memories alone cannot settle who is who, because one person cannot be two.',
      visual: '💡',
      highlight: 'memories',
    },
    {
      type: 'question',
      prompt: 'On the memory view, where will he be after the trip?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'On the Moon', isCorrect: true },
          { id: 'b', text: 'In the empty pod', isCorrect: false },
          { id: 'c', text: 'In the recycling hatch', isCorrect: false },
        ],
        explanation: 'On the Moon. The man who steps out there remembers everything he does, so on the memory view it’s him.',
      },
    },
    {
      type: 'quote',
      id: 'lq-philosophy-foundations-5-1',
      quote: 'As far as this consciousness can be extended backwards to any past action or thought, so far reaches the identity of that person.',
      author: 'John Locke',
      era: '1694',
      work: 'An Essay Concerning Human Understanding',
    },
    {
      type: 'summary',
      title: 'What Makes You You?',
      keyPoints: [
        'On one view, you are your body',
        'On another, you are your memories',
        'A duplicate shows memories alone can’t settle who you are',
      ],
      closingThought: 'Next time you see a photo of yourself as a child, ask what makes that child you.',
    },
  ],
};

export default lesson;
