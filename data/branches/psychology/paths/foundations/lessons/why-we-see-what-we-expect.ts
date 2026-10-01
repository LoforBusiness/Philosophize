import type { Lesson } from '@/data/types';

// The third lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/psych3Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'psychology-foundations-3',
  slug: 'why-we-see-what-we-expect',
  title: 'Why We See What We Expect',
  description: 'A tea mug on a museum plinth, a grand label, and a visitor who sees a royal treasure.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A chipped tea mug, a grand label, and a visitor in awe.',
      subtext: 'What you expect changes what you see.',
      emoji: '🏺',
    },
    {
      type: 'concept',
      title: 'Expectation Shapes Seeing',
      body: 'Your eyes take in shapes, and your brain decides what they are. A label, a price or a hint sets an expectation before you look. To see what is really there, look again without the hint, and check the thing itself.',
      visual: '💡',
      highlight: 'expect',
    },
    {
      type: 'question',
      prompt: 'How could the visitor find out what the cup really is?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Read the sticker underneath it', isCorrect: true },
          { id: 'b', text: 'Read the label on the plinth again', isCorrect: false },
          { id: 'c', text: 'Look at it through the glass case', isCorrect: false },
        ],
        explanation: 'The sticker underneath. It is evidence from the cup itself. The label is the hint that fooled him, and the glass only makes things look precious.',
      },
    },
    {
      type: 'quote',
      id: 'lq-psychology-foundations-3-1',
      quote: 'Whilst part of what we perceive comes through our senses from the object before us, another part (and it may be the larger part) always comes out of our own head.',
      author: 'William James',
      era: '1890',
      work: 'The Principles of Psychology',
    },
    {
      type: 'summary',
      title: 'Why We See What We Expect',
      keyPoints: [
        'Your brain decides what your eyes take in',
        'A label or a hint sets the expectation first',
        'Look again without the hint, and check the thing itself',
      ],
      closingThought: 'Next time something looks impressive, ask what you were told before you looked.',
    },
  ],
};

export default lesson;
