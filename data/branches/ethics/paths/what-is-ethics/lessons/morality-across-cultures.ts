import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-4',
  slug: 'morality-across-cultures',
  title: 'Is Morality Universal or Relative?',
  description: 'One world, a thousand moral codes. Cultures clearly disagree, but does that mean no moral truth is culture-independent? This is metaethics: relativism versus objectivism.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Cultures disagree about right and wrong. So what follows?',
      subtext: 'That they differ is a fact. That no moral truth is culture-free is a further, contested claim.',
      emoji: '🌍',
    },
    {
      type: 'concept',
      title: 'Two Kinds of Relativism',
      body: 'First, the harmless fact: societies do hold deeply different moral codes. The bold philosophical claim goes further, that the truth of a moral judgment is relative to a group, with no culture-independent moral fact behind it. Sliding from the first to the second is itself a classic mistake.',
      visual: '🗺️',
      highlight: 'moral relativism',
    },
    {
      type: 'example',
      title: 'Ruth Benedict\'s Challenge',
      scenario: 'The anthropologist Ruth Benedict argued that what a society calls "morally good" tracks what it has come to approve. Her line: morality "is a convenient term for socially approved habits." Mankind, she said, prefers to say "It is morally good" rather than the plainer "It is habitual."',
      source: 'Ruth Benedict, "Anthropology and the Abnormal," Journal of General Psychology (1934)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Moral Objectivism',
      body: 'Objectivists fire back: some moral truths hold independently of any culture. Torturing a child for fun is wrong, full stop. Realists like Shafer-Landau (Moral Realism, 2003) argue such facts exist mind-independently. Careful, though: that some truths are objective is a different claim from saying one code fits everyone.',
      visual: '🌐',
      highlight: 'moral objectivism',
    },
    {
      type: 'question',
      prompt: 'What does the strong (metaethical) version of moral relativism claim?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Beneath the surface, every culture obeys one universal moral law', isCorrect: false },
          { id: 'b', text: 'Moral truth is relative to a group; there is no culture-independent fact', isCorrect: true },
          { id: 'c', text: 'Cultures happen to disagree, but a true morality still exists', isCorrect: false },
          { id: 'd', text: 'Morality is hardwired by biology, not shaped by culture', isCorrect: false },
        ],
        explanation: 'Metaethical relativism is more than the fact that cultures differ (option C). It claims the truth or justification of a judgment is relative to a group, with no culture-independent moral fact.',
      },
    },
    {
      type: 'example',
      title: 'The Surprising Overlap',
      scenario: 'In Human Universals (1991), anthropologist Donald Brown catalogued traits found in every documented society: notions of fairness, reciprocity, bans on murder and incest. A shared moral floor. But careful: relativists can read this as what any group needs to survive, so convergence constrains the debate without settling it.',
      source: 'Donald E. Brown, Human Universals (1991)',
      emoji: '🤝',
    },
    {
      type: 'question',
      prompt: 'According to moral objectivism, at least some moral truths hold independently of what any culture believes.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Objectivists hold that some claims, like the wrongness of gratuitous cruelty, are true regardless of local opinion. Widespread agreement is suggestive, but agreement alone does not prove it.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'A live debate, not a solved one.',
      body: 'The classic worry: if right is just whatever a culture says, you cannot call slavery wrong-period. And tolerance does not follow either, since "tolerance suits us" cannot yield "everyone must tolerate." Yet serious philosophers like David Wong defend refined, pluralistic versions, so this is no naive view.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'One Morality or Many?',
      keyPoints: [
        'Cultures differ (a fact) is not yet "no moral truth"',
        'Objectivism: some truths hold independent of culture',
        'Brown found a shared moral floor across societies',
        'Tolerance does not follow from relativism',
      ],
      closingThought: 'Understanding a culture is not surrendering judgment; it is judging with open eyes.',
    },
  ],
};

export default lesson;
