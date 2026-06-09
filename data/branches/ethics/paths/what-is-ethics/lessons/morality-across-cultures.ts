import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-4',
  slug: 'morality-across-cultures',
  title: 'Is Morality Universal or Relative?',
  description: 'Cultures disagree, but does that mean no moral truth is culture-free?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Cultures disagree about right and wrong. So what?',
      subtext: 'That they differ is a fact. That no truth is culture-free is a further claim.',
      emoji: '🌍',
    },
    {
      type: 'concept',
      title: 'Two Kinds of Relativism',
      body: 'First, the harmless fact: societies hold deeply different moral codes. The bold claim goes further, that a judgment\'s truth is relative to a group, with no culture-independent fact behind it. Sliding from the first to the second is a classic mistake.',
      visual: '🗺️',
      highlight: 'moral relativism',
    },
    {
      type: 'example',
      title: "Ruth Benedict's Challenge",
      scenario: 'The anthropologist Ruth Benedict argued that what a society calls "morally good" simply tracks what it has come to approve. Morality, she held, is largely a name we give to socially approved habits.',
      source: 'Ruth Benedict, Patterns of Culture (1934)',
      emoji: '📖',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-4-1',
      quote: 'Morality differs in every society, and is a convenient term for socially approved habits.',
      author: 'Ruth Benedict',
      era: '1934',
      work: 'Patterns of Culture',
    },
    {
      type: 'concept',
      title: 'Moral Objectivism',
      body: 'Objectivists fire back: some moral truths hold independently of any culture. Torturing a child for fun is wrong, full stop. But careful: that some truths are objective differs from saying one code fits everyone.',
      visual: '🌐',
      highlight: 'moral objectivism',
    },
    {
      type: 'example',
      title: 'The Surprising Overlap',
      scenario: 'In Human Universals (1991), Donald Brown catalogued traits in every documented society: fairness, reciprocity, bans on murder and incest. A shared moral floor. Yet relativists read this as what any group needs to survive.',
      source: 'Donald E. Brown, Human Universals (1991)',
      emoji: '🤝',
    },
    {
      type: 'question',
      prompt: 'What does the strong (metaethical) version of moral relativism claim?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Beneath the surface, every culture obeys one universal law', isCorrect: false },
          { id: 'b', text: 'Moral truth is relative to a group; no culture-free fact', isCorrect: true },
          { id: 'c', text: 'Cultures happen to disagree, but a true morality still exists', isCorrect: false },
          { id: 'd', text: 'Morality is hardwired by biology, not shaped by culture', isCorrect: false },
        ],
        explanation: 'Metaethical relativism is more than the fact that cultures differ (option C). It claims a judgment\'s truth is relative to a group, with no culture-independent moral fact.',
      },
    },
    {
      type: 'question',
      prompt: 'If relativism is true, then everyone is obligated to tolerate every other culture. Does this follow?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'It sounds open-minded, but it backfires: if all values are merely local, "tolerance suits us" cannot become "everyone must tolerate." Relativism cannot ground a universal duty.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'A live debate, not a solved one.',
      body: 'If right is just whatever a culture says, you cannot call slavery wrong-period. Yet serious philosophers like David Wong defend refined, pluralistic versions, so this is no naive view.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'One Morality or Many?',
      keyPoints: [
        'Cultures differ is not yet "no moral truth"',
        'Objectivism: some truths hold beyond culture',
        'Brown found a shared moral floor',
        'Tolerance does not follow from relativism',
      ],
      closingThought: 'Understanding a culture is not surrendering judgment; it is judging with open eyes.',
    },
  ],
};

export default lesson;
