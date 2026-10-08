import type { Lesson } from '@/data/types';

// The RECAP of this subject's road so far (LESSON_RULES AV), a DIALOGUE lesson (group AP):
// it plays as components/lesson/cinematic/phil7Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'philosophy-foundations-7',
  slug: 'philosophy-recap',
  title: 'Philosophy Recap: Back to Athens',
  description: 'The agora at morning, a wax tablet, a purse on the fountain and an old ship with new planks: the first six questions, looked at again.',
  estimatedMinutes: 6,
  xpReward: 25,
  recap: true,
  cards: [
    {
      type: 'hook',
      headline: 'Six questions, one wax tablet, and a friend who remembers them all wrong.',
      subtext: 'Philosophy settles things with reasons.',
      emoji: '🏛️',
    },
    {
      type: 'concept',
      title: 'The First Six Questions',
      body: 'Philosophy asks what facts alone cannot settle, and answers with reasons anyone can test. A good argument needs true reasons and a conclusion that follows; knowing needs a true belief and a good reason.',
      visual: '💡',
      highlight: 'reasons',
    },
    {
      type: 'question',
      prompt: 'Which of these could actually settle a philosophy question?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A reason anyone can test', isCorrect: true },
          { id: 'b', text: 'A heap of votes', isCorrect: false },
          { id: 'c', text: 'A loud herald', isCorrect: false },
        ],
        explanation: 'A reason. Anyone can test a reason. A vote shows what’s popular, and a loud voice shows nothing at all.',
      },
    },
    {
      type: 'quote',
      id: 'lq-philosophy-foundations-7-1',
      quote: 'It is not possible to step twice into the same river.',
      author: 'Heraclitus',
      era: 'c. 500 BC',
      work: 'Fragment 91, as quoted by Plutarch',
    },
    {
      type: 'summary',
      title: 'Philosophy Recap: Back to Athens',
      keyPoints: [
        'Philosophy settles questions with reasons, not votes',
        'Good arguments need true reasons that lead somewhere',
        'Knowing needs a true belief and a good reason',
      ],
      closingThought: 'Next time you’re sure of something, ask what your reason is, and whether it would stand up in the agora.',
    },
  ],
};

export default lesson;
