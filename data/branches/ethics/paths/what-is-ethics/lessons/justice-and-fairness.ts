import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-9',
  slug: 'justice-and-fairness',
  title: 'Justice and Fairness',
  description: 'Design society without knowing who you will be. What rules would you pick?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Design the rules before you know who you are.',
      subtext: 'Rich or poor, strong or sick. You will not know. Now choose.',
      emoji: '🎭',
    },
    {
      type: 'concept',
      title: 'The Veil of Ignorance',
      body: 'John Rawls asked you to design society from an original position, blind to your future place in it. Stripped of self-interest, he argued, you would choose genuinely fair rules.',
      visual: '🕶️',
      highlight: 'the veil of ignorance',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-9-1',
      quote: 'Justice is the first virtue of social institutions, as truth is of systems of thought.',
      author: 'John Rawls',
      era: '1971',
      work: 'A Theory of Justice',
    },
    {
      type: 'example',
      title: 'Two Principles of Justice',
      scenario: 'Behind the veil, Rawls said, we would pick two rules. First, equal basic liberties for all. Second, inequalities are allowed only if they help the worst-off most. Fairness means protecting whoever ends up at the bottom.',
      source: 'John Rawls, A Theory of Justice (1971)',
      emoji: '📐',
    },
    {
      type: 'dilemma',
      scenario:
        'A policy would make most citizens wealthier but leave the poorest slightly worse off than today. Behind the veil of ignorance you might land anywhere, including the very bottom of this society.',
      prompt: 'Should the policy go ahead?',
      choices: [
        { id: 'yes', label: 'Yes, the overall total rises' },
        { id: 'no', label: 'No, the worst-off must not lose' },
      ],
      views: [
        {
          thinker: 'John Rawls',
          stance: 'rejects the policy',
          why: 'His difference principle permits inequality only when it helps the least advantaged. A policy that worsens their lot fails the test of fairness.',
        },
        {
          thinker: 'Robert Nozick',
          stance: 'asks how the wealth arose',
          why: 'For Nozick, justice is about how holdings are acquired, not the final pattern. If transfers were free and fair, the outcome is just.',
        },
        {
          thinker: 'A Utilitarian',
          stance: 'may accept the policy',
          why: 'If total welfare climbs, a utilitarian can approve, even at the expense of the few, which is exactly what Rawls feared.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'What is the point of choosing rules behind the veil of ignorance?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Not knowing your place, you pick rules fair to everyone', isCorrect: true },
          { id: 'b', text: 'It proves the rich always deserve their wealth', isCorrect: false },
          { id: 'c', text: 'It lets the majority outvote every minority', isCorrect: false },
          { id: 'd', text: 'It maximizes total happiness no matter who suffers', isCorrect: false },
        ],
        explanation: 'Blind to whether you will be rich or poor, self-interest cannot bias you, so the principles you would accept are genuinely fair to all.',
      },
    },
    {
      type: 'question',
      prompt: 'Rawls says a just society simply maximizes total happiness, even if the poorest lose out. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'That is utilitarianism, which Rawls opposed. His difference principle protects the worst-off, refusing to sacrifice them for a larger total.',
      },
    },
    {
      type: 'summary',
      title: 'What Makes Rules Fair',
      keyPoints: [
        'Rawls: choose blind to your own position',
        'Equal liberties, plus help for the worst-off',
        'Fairness is not the same as total welfare',
        'Nozick countered: justice is fair process',
      ],
      closingThought: 'Would you accept your society if you might be born its least lucky member?',
    },
  ],
};

export default lesson;
