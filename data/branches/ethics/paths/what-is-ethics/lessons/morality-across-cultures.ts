import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-4',
  slug: 'morality-across-cultures',
  title: 'Is Morality Universal or Relative?',
  description: 'Do all peoples share one deep moral code, or is right and wrong simply a matter of where you happen to be born?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every culture lives by different rules. So who is right?',
      subtext: 'Or is the very word "right" only an opinion we inherit from our tribe?',
      emoji: '🌍',
    },
    {
      type: 'concept',
      title: 'Moral Relativism',
      body: 'Moral relativism says that values are not woven into the universe but spun by cultures. What one society blesses, another may condemn — and no truth stands above them to settle the dispute. The anthropologist Ruth Benedict pressed the point hard: morality, she argued, is simply whatever a culture has come to call normal.',
      visual: '🗺️',
      highlight: 'moral relativism',
    },
    {
      type: 'example',
      title: 'Ruth Benedict\'s Observation',
      scenario: 'In her 1934 work Patterns of Culture, Ruth Benedict gathered societies whose values stood worlds apart — what one revered, another reviled. From this she drew a bold conclusion: morality is little more than what a people calls normal. To judge a foreign culture by your own measure, she warned, is to demand the whole world speak your tongue.',
      source: 'Ruth Benedict, Patterns of Culture (1934)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Moral Universalism',
      body: 'Moral universalism answers that some truths bind every human being, in every age and place. The horror of murder, of torture, of betrayal echoes through nearly all of history\'s cultures. Such common ground hints that morality is not arbitrary. Perhaps shared human needs — for safety, fairness, and care — root an ethics that runs beneath all our differences.',
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
        explanation: 'For the relativist, values are crafted by each society — there is no universal truth standing above or outside particular cultures to which we can appeal.',
      },
    },
    {
      type: 'example',
      title: 'What Cultures Actually Share',
      scenario: 'For all our dazzling variety, anthropologists keep stumbling on the same quiet agreements in every known society: do not murder your own without cause, do not steal from your neighbours, tend to the children. This recurring common ground suggests that certain values may grow from the very conditions that make shared human life possible at all.',
      emoji: '🤝',
    },
    {
      type: 'question',
      prompt: 'According to moral universalism, some ethical truths hold for all humans everywhere.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'The universalist holds that at least some values — the wrongness of murder, of torture — are no mere local preference but genuine truths binding across every human society.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have now weighed two rival accounts of where morality is born.',
      body: 'The quarrel between relativism and universalism remains unsettled. Most thinkers today refuse pure relativism — it would leave us mute before slavery and genocide — yet shun a clumsy universalism deaf to real cultural difference. The hope is for truths that are universal and still listen closely to context.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'One Morality or Many?',
      keyPoints: [
        'Relativism: ethics shifts with culture, no truth above it',
        'Universalism: some moral rules hold everywhere',
        'Cultures differ widely yet share core prohibitions',
        'Pure relativism leaves us unable to condemn atrocity',
      ],
      closingThought: 'To understand another culture is not to surrender judgment, but to learn to judge with care.',
    },
  ],
};

export default lesson;
