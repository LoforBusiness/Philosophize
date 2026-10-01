import type { Lesson } from '@/data/types';

// The second lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/psych2Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'psychology-foundations-2',
  slug: 'why-memory-gets-things-wrong',
  title: 'Why Memory Gets Things Wrong',
  description: 'Two trolleys, one bump, a broken jar of jam, and two memories that cannot both be right.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'One bump in the aisle. Two people remember two different bumps.',
      subtext: 'Neither of them is lying. Memory just doesn’t work like a camera.',
      emoji: '🛒',
    },
    {
      type: 'concept',
      title: 'Memory Is Rebuilt',
      body: 'A memory is not a recording. Each time you remember something, your brain builds it again and fills the gaps with what seems to fit. The words of a question can change it, and feeling sure is not the same as being right.',
      visual: '💡',
      highlight: 'rebuilt',
    },
    {
      type: 'question',
      prompt: 'They disagree about how fast he was going, and both are sure. What would you trust?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The shop’s camera recording', isCorrect: true },
          { id: 'b', text: 'Whoever sounds most certain', isCorrect: false },
          { id: 'c', text: 'The broken jar of jam', isCorrect: false },
        ],
        explanation: 'The camera. It recorded the moment once and does not rebuild it. Certainty grows with retelling, and the jam only proves there was a bump.',
      },
    },
    {
      type: 'quote',
      id: 'lq-psychology-foundations-2-1',
      quote: 'Memory works a little bit more like a Wikipedia page: You can go in there and change it, but so can other people.',
      author: 'Elizabeth Loftus',
      era: '2013',
      work: 'How Reliable Is Your Memory? (TED talk)',
    },
    {
      type: 'summary',
      title: 'Why Memory Gets Things Wrong',
      keyPoints: [
        'A memory is rebuilt each time you recall it',
        'A question’s words can change what is remembered',
        'Feeling sure is not the same as being right',
      ],
      closingThought: 'Next time you’re certain you remember something, ask what you could check it against.',
    },
  ],
};

export default lesson;
