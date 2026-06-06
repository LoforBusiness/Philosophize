import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-3',
  slug: 'how-arguments-work',
  title: 'Valid vs Sound',
  description: 'Validity is about form. Soundness is form plus true premises. Logic\'s deepest distinction.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A perfect argument can still be totally wrong.',
      subtext: 'Flawless logic isn\'t enough. You also need true premises. Two tests, not one.',
      emoji: '🔒',
    },
    {
      type: 'concept',
      title: 'Validity vs Soundness',
      body: 'Two tests, never confuse them. An argument is VALID when its form guarantees the conclusion IF the premises are true. It is SOUND when it is valid AND the premises are actually true. Sound arguments lock the conclusion in tight.',
      visual: '⚙️',
      highlight: 'valid AND true',
    },
    {
      type: 'example',
      title: 'Valid but Absurd',
      scenario: 'Premise 1: All fish can fly.\nPremise 2: A salmon is a fish.\nConclusion: A salmon can fly.\n\nThe form is flawless — perfectly VALID. Yet the conclusion is false, because Premise 1 is false. Valid keeps the logic honest; SOUND demands the premises be true too.',
      source: 'Aristotle\'s syllogistic logic',
      emoji: '🐟',
    },
    {
      type: 'question',
      prompt: 'Arrange logic\'s most famous syllogism into its proper order.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'p1', text: 'All humans are mortal.' },
          { id: 'p2', text: 'Socrates is a human.' },
          { id: 'c', text: 'Therefore, Socrates is mortal.' },
        ],
        correctOrder: ['p1', 'p2', 'c'],
        explanation:
          'Premises first, conclusion last — the shape of every deductive argument. Aristotle named this form a syllogism, and the structure has held for over 2,000 years.',
      },
    },
    {
      type: 'question',
      prompt: 'An argument is VALID and its premises are actually TRUE. What is it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Sound — the conclusion is guaranteed', isCorrect: true },
          { id: 'b', text: 'Valid, but the conclusion could still be false', isCorrect: false },
          { id: 'c', text: 'Only probably right, like an inductive guess', isCorrect: false },
          { id: 'd', text: 'Still missing some evidence', isCorrect: false },
        ],
        explanation: 'Valid form plus true premises equals SOUND. A sound deductive argument doesn\'t make its conclusion likely — it makes it certain. That\'s logic at full power.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Validity tests the form. Soundness tests form and facts.',
      body: 'A valid argument can be wrong if a premise is false — flying salmon. A sound one can\'t be. To fight a sound argument, attack a premise, because the logic itself is bulletproof.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'Valid vs Sound',
      keyPoints: [
        'Valid: form guarantees the conclusion if premises hold',
        'Sound: valid plus premises that are actually true',
        'A valid argument can still reach a false conclusion',
        'Aristotle\'s syllogism still holds up today',
      ],
      closingThought: 'Spot the difference, and bad arguments stop fooling you.',
    },
  ],
};

export default lesson;
