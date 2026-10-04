import type { Lesson } from '@/data/types';

// The fifth lesson on this subject's road, a DIALOGUE lesson (LESSON_RULES group AP):
// it plays as components/lesson/cinematic/sci5Scene.tsx. These cards are the
// fallback the runner uses only if the CINEMATIC entry is ever removed.
const lesson: Lesson = {
  id: 'science-foundations-5',
  slug: 'could-it-be-wrong',
  title: 'Could It Be Wrong?',
  description: 'A misty loch at night, a monster that hides from cameras and sonar, and a scientist on the jetty.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'She hides when watched and never shows on sonar. Is that proof?',
      subtext: 'A scientific claim has to be able to fail.',
      emoji: '🔦',
    },
    {
      type: 'concept',
      title: 'Falsifiability',
      body: 'A claim that fits every possible result tells you nothing. A scientific claim must be able to fail a test, and a good test looks hardest for the result that would prove it wrong.',
      visual: '💡',
      highlight: 'fail a test',
    },
    {
      type: 'question',
      prompt: 'Which of her claims could a test prove wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'She’s ten metres long', isCorrect: true },
          { id: 'b', text: 'She’s invisible', isCorrect: false },
          { id: 'c', text: 'She hides when watched', isCorrect: false },
        ],
        explanation: 'That she’s ten metres long. Something that big would show up on sonar, so a test could catch the claim out.',
      },
    },
    {
      type: 'quote',
      id: 'lq-science-foundations-5-1',
      quote: 'The criterion of the scientific status of a theory is its falsifiability, or refutability, or testability.',
      author: 'Karl Popper',
      era: '1963',
      work: 'Conjectures and Refutations',
    },
    {
      type: 'summary',
      title: 'Could It Be Wrong?',
      keyPoints: [
        'A scientific claim must be able to fail a test',
        'A claim that fits every result tells you nothing',
        'Look hardest for the result that proves you wrong',
      ],
      closingThought: 'Next time someone says they can’t be proved wrong, ask what would change their mind.',
    },
  ],
};

export default lesson;
