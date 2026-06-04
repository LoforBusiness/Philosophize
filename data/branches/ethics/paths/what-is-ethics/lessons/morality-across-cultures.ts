import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-4',
  slug: 'morality-across-cultures',
  title: 'Is Morality Universal or Relative?',
  description: 'Do all people share the same basic morality, or does right and wrong depend on the culture you grew up in? This lesson weighs both views.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every culture lives by different rules. So who is right?',
      subtext: 'Or is "right" just an opinion we pick up from the culture we grow up in?',
      emoji: '🌍',
    },
    {
      type: 'concept',
      title: 'Moral Relativism',
      body: 'Moral relativism is the view that values come from cultures, not from any fixed truth. What one society approves, another may forbid, and there is no higher standard to settle who is correct. The anthropologist Ruth Benedict argued for this: morality, she said, is basically whatever a given culture treats as normal.',
      visual: '🗺️',
      highlight: 'moral relativism',
    },
    {
      type: 'example',
      title: 'Ruth Benedict\'s Observation',
      scenario: 'In her 1934 book Patterns of Culture, Ruth Benedict compared societies with very different values, where one praised what another condemned. She concluded that morality is mostly what a culture treats as normal. Judging another culture by your own standards, she argued, assumes your way is the only correct one.',
      source: 'Ruth Benedict, Patterns of Culture (1934)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Moral Universalism',
      body: 'Moral universalism is the opposite view: some moral truths hold for all people, everywhere, in every age. Murder, torture, and betrayal are condemned by nearly every culture. That shared ground suggests morality is not just random. Basic human needs for safety, fairness, and care may support an ethics that holds across our differences.',
      visual: '🌐',
      highlight: 'moral universalism',
    },
    {
      type: 'question',
      prompt: 'What does moral relativism claim about our ethical values?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Beneath the surface, all cultures share one moral law', isCorrect: false },
          { id: 'b', text: 'Cultures make their own values, and these differ between them', isCorrect: true },
          { id: 'c', text: 'Only the ancients possessed genuine moral values', isCorrect: false },
          { id: 'd', text: 'Morality springs from biology, not from culture', isCorrect: false },
        ],
        explanation: 'For the relativist, each society makes its own values. There is no universal truth above particular cultures that we can appeal to.',
      },
    },
    {
      type: 'example',
      title: 'What Cultures Actually Share',
      scenario: 'Despite all their differences, anthropologists keep finding the same basic agreements in nearly every society: do not kill your own people without cause, do not steal from your neighbours, take care of children. This shared ground suggests some values may come from the basic conditions any group needs to live together.',
      emoji: '🤝',
    },
    {
      type: 'question',
      prompt: 'According to moral universalism, some ethical truths hold for all humans everywhere.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Universalists hold that at least some values, such as the wrongness of murder and torture, are not just local preferences but truths that apply to every human society.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Two views on where morality comes from.',
      body: 'The debate between relativism and universalism is not settled. Most thinkers today reject pure relativism, since it would leave us unable to condemn slavery or genocide, but they also reject a crude universalism that ignores real cultural differences. The goal is truths that apply widely while still respecting context.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'One Morality or Many?',
      keyPoints: [
        'Relativism: ethics depends on culture, no higher truth',
        'Universalism: some moral rules hold everywhere',
        'Cultures differ widely but share core prohibitions',
        'Pure relativism cannot condemn atrocities',
      ],
      closingThought: 'Understanding another culture does not mean dropping judgment; it means judging carefully.',
    },
  ],
};

export default lesson;
