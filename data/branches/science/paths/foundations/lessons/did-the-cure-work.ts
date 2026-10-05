import type { Lesson } from '@/data/types';

// The sixth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/sci6Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'science-foundations-6',
  slug: 'did-the-cure-work',
  title: 'Did the Cure Work?',
  description: 'A sailing ship in 1747, a crew with scurvy, and one of the first fair tests of a medicine.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Half the crew has scurvy, and the captain swears by seawater. How do you find out?',
      subtext: 'Compare groups, and hide who gets what.',
      emoji: '⛵',
    },
    {
      type: 'concept',
      title: 'Controlled Trials',
      body: 'To find out whether a treatment works, compare groups treated differently and keep everything else the same. Hide who gets what, so hope cannot change the result.',
      visual: '💡',
      highlight: 'compare',
    },
    {
      type: 'question',
      prompt: 'How could he stop hope changing the result?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Identical bottles with no labels', isCorrect: true },
          { id: 'b', text: 'Bottles labelled MIRACLE CURE', isCorrect: false },
          { id: 'c', text: 'Bottles labelled POISON', isCorrect: false },
        ],
        explanation: 'Identical bottles with no labels, so nobody knows who has which remedy.',
      },
    },
    {
      type: 'quote',
      id: 'lq-science-foundations-6-1',
      quote: 'The consequence was, that the most sudden and visible good effects were perceived from the use of the oranges and lemons.',
      author: 'James Lind',
      era: '1753',
      work: 'A Treatise of the Scurvy',
    },
    {
      type: 'summary',
      title: 'Did the Cure Work?',
      keyPoints: [
        'Compare groups that are treated differently',
        'Keep everything else the same',
        'Hide who gets what, so hope can’t change the result',
      ],
      closingThought: 'Next time you hear a cure works, ask what it was compared with.',
    },
  ],
};

export default lesson;
