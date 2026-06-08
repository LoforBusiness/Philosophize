import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-3',
  slug: 'how-arguments-work',
  title: 'Valid vs Sound',
  description: 'Validity is pure structure. Soundness is structure plus true premises. Logic\'s sharpest distinction.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A perfectly logical argument can still be dead wrong.',
      subtext: 'Flawless structure isn\'t enough. You also need true premises. Two separate tests.',
      emoji: '🔒',
    },
    {
      type: 'concept',
      title: 'Validity vs Soundness',
      body: 'Two tests, never confuse them. An argument is VALID when its form makes it impossible for the premises to be true and the conclusion false. It is SOUND when it is valid AND the premises are actually true.',
      visual: '⚙️',
      highlight: 'valid AND true',
    },
    {
      type: 'example',
      title: 'Valid but Absurd',
      scenario: 'Premise 1: All toasters are made of gold.\nPremise 2: All things made of gold are time-travel devices.\nConclusion: All toasters are time-travel devices.\n\nThe form is flawless — perfectly VALID. The conclusion is false only because the premises are. Validity tests the structure; SOUNDNESS demands the premises be true too.',
      source: 'Internet Encyclopedia of Philosophy, "Validity and Soundness"',
      emoji: '🍞',
    },
    {
      type: 'question',
      prompt: 'Arrange logic\'s most famous textbook syllogism into its proper order.',
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
          'Premises first, conclusion last. Aristotle invented this form — the syllogism, where the conclusion "follows of necessity." This exact wording, though, comes from J. S. Mill\'s A System of Logic (1843), not Aristotle himself.',
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
        explanation: 'Valid form plus true premises equals SOUND. A sound deductive argument doesn\'t merely make its conclusion likely — it makes it true. Validity alone guarantees nothing about the facts, only the connection.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Validity tests the form. Soundness tests form and facts.',
      body: 'A valid argument can reach a false conclusion if a premise is false — the golden toaster. A sound one cannot. To resist a valid argument you must reject a premise; you can\'t attack the logic.',
      emoji: '💡',
    },
    {
      type: 'summary',
      title: 'Valid vs Sound',
      keyPoints: [
        'Valid: form makes true premises plus false conclusion impossible',
        'Sound: valid plus premises that are actually true',
        'A valid argument can still reach a false conclusion',
        'In logic "valid" means structure, never "true" or "good"',
      ],
      closingThought: 'Spot the difference, and bad arguments stop fooling you.',
    },
  ],
};

export default lesson;
