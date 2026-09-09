import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-28',
  slug: 'reflective-equilibrium',
  title: 'When Your Rule Meets Your Gut',
  description: 'A principle says one thing, your conscience another. Rawls offers a way to settle it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Your principle says yes. Your gut screams no. Now what?',
      subtext: 'Throw out the principle? Ignore the feeling? Rawls suggests you adjust both until they fit.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Principles vs Intuitions',
      body: 'You hold general moral principles ("always maximize happiness") and particular intuitions about cases ("but framing an innocent man is monstrous"). Sometimes they collide. Reflective equilibrium is a method: go back and forth, revising principles and judgments alike, until they cohere into a stable, mutually supporting whole.',
      visual: '🔄',
      highlight: 'reflective equilibrium',
    },
    {
      type: 'example',
      title: 'Tuning Two Dials',
      scenario: 'Imagine two dials: your principles and your case-by-case judgments. A principle clashes with a strong intuition. You ask which to trust. Maybe the principle needs an exception. Maybe the intuition is mere prejudice and should yield. You adjust one, then the other, looping until they stop fighting — not a one-way deduction, but a balance struck between them.',
      emoji: '🎛️',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-28-1',
      quote: 'By going back and forth, sometimes altering the conditions of the contract, at others withdrawing our judgments, I assume that eventually we shall find a description that best fits our considered judgments.',
      author: 'John Rawls',
      era: '1971',
      work: 'A Theory of Justice',
      philosopherId: 'john-rawls',
    },
    {
      type: 'question',
      prompt: 'In reflective equilibrium, must a strong moral intuition always override a general principle?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False. The method is two-way, not intuition-first. A vivid feeling can be revised too — it might be bias, custom, or self-interest dressed up as conscience. Sometimes a well-supported principle should make you distrust the gut reaction. Equilibrium is reached by mutual adjustment, with neither side automatically winning.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you weighed whole theories against cases.',
      body: 'When utilitarianism seemed to permit framing an innocent person, you trusted the intuition over the principle. Reflective equilibrium names that move and disciplines it: revise the theory, but be ready to revise the intuition too. Coherence between the two is the goal.',
      emoji: '🔁',
    },
    {
      type: 'question',
      prompt: 'A principle you find compelling implies something your conscience recoils from. How does reflective equilibrium proceed?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Adjust both until they fit each other', isCorrect: true },
          { id: 'b', text: 'Trust the principle and accept the implication', isCorrect: false },
          { id: 'c', text: 'Trust the conscience and drop the principle', isCorrect: false },
          { id: 'd', text: 'Suspend judgement until a proof arrives', isCorrect: false },
        ],
        explanation: 'Adjust both. No fixed foundation gets the last word, so the principle is tested against considered judgments and the judgments against the principle. A method that always trusts one side is a foundation rather than an equilibrium.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Principles and intuitions sometimes conflict',
        'Reflective equilibrium adjusts both to cohere',
        'It is two-way; neither side always wins',
        'The goal is a stable, coherent moral web',
      ],
      closingThought: 'Good ethical thinking is less a one-way proof than a patient negotiation between your rules and your conscience.',
    },
  ],
};

export default lesson;
