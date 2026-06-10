import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-10',
  slug: 'property-and-distribution',
  title: 'Property and Distribution',
  description: 'Who should own what? The clash that capstones political philosophy.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You own your phone. Why is it yours, not ours?',
      subtext: 'Behind every economy sits a theory of who may own what.',
      emoji: '🏠',
    },
    {
      type: 'concept',
      title: 'Locke Mixes in Labor',
      body: 'Locke grounded property in work: mix your labor with the unowned, and it becomes yours. But he added a proviso, leave "enough, and as good" for others, a limit easy to forget.',
      visual: '🌾',
      highlight: 'mix your labor',
    },
    {
      type: 'quote',
      id: 'lq-political-political-10-1',
      quote: 'Taxation of earnings from labor is on a par with forced labor.',
      author: 'Robert Nozick',
      era: '1974',
      work: 'Anarchy, State, and Utopia',
    },
    {
      type: 'concept',
      title: 'Nozick vs. Rawls',
      body: 'Nozick says holdings are just if acquired and traded fairly, so redistribution wrongs the owner. Rawls replies that the whole distribution must be fair to the least advantaged. Two visions, one prize.',
      visual: '🤝',
      highlight: 'redistribution',
    },
    {
      type: 'example',
      title: 'The Talented Earner',
      scenario: 'A musician sells millions of tickets, willingly bought. For Nozick the fortune is hers; taxing it to redistribute is seizing her labor. For Rawls, justice still asks how the worst-off fare under that arrangement.',
      source: 'Robert Nozick, Anarchy, State, and Utopia (1974)',
      emoji: '🎸',
    },
    {
      type: 'question',
      prompt: 'On what basis does Nozick judge whether a distribution of wealth is just?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Whether the final pattern of wealth looks equal', isCorrect: false },
          { id: 'b', text: 'Whether holdings were acquired and transferred justly', isCorrect: true },
          { id: 'c', text: 'Whether it maximizes total national happiness', isCorrect: false },
          { id: 'd', text: 'Whether the poorest are made as well-off as possible', isCorrect: false },
        ],
        explanation: 'Nozick\'s entitlement theory judges the history, just acquisition and free transfer, not the resulting pattern. A fair process can yield very unequal, yet just, holdings.',
      },
    },
    {
      type: 'question',
      prompt: 'Locke defended private property, so surely he gave owners an unlimited right to grab all they could. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, Locke set no limit on acquiring property', isCorrect: false },
          { id: 'b', text: 'No, his proviso required leaving "enough, and as good" for others', isCorrect: true },
          { id: 'c', text: 'Yes, Locke said the strong may take whatever they reach', isCorrect: false },
          { id: 'd', text: 'No, because Locke rejected private property altogether', isCorrect: false },
        ],
        explanation: 'The trap: defending property sounds like endorsing limitless grabbing. But Locke\'s proviso demands you leave enough and as good for others, a built-in brake on acquisition.',
      },
    },
    {
      type: 'summary',
      title: 'Who Owns What, and Why',
      keyPoints: [
        'Locke: labor makes property, within limits',
        'Nozick: just process beats any fixed pattern',
        'Rawls: judge the distribution by the worst-off',
        'Property theory shapes every economy',
      ],
      closingThought: 'From Hobbes to Nozick, political philosophy keeps asking who may rule, and who may own.',
    },
  ],
};

export default lesson;
