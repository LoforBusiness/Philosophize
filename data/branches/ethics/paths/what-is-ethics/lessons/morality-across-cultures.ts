import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-4',
  slug: 'morality-across-cultures',
  title: 'Is Morality Universal or Relative?',
  description: 'Do all cultures share the same moral code, or is ethics just a matter of local custom?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Different cultures have wildly different rules. So who\'s right?',
      subtext: 'Or is "right" itself just a cultural opinion?',
      emoji: '🌍',
    },
    {
      type: 'concept',
      title: 'Moral Relativism',
      body: 'Moral relativism holds that ethical values are not universal — they\'re created by cultures, and what\'s "right" in one society may be "wrong" in another. There is no objective moral truth that stands above cultures. Anthropologist Ruth Benedict argued that morality is just cultural normality — "normal" and "moral" are the same thing.',
      visual: '🗺️',
      highlight: 'moral relativism',
    },
    {
      type: 'example',
      title: 'Ruth Benedict\'s Observation',
      scenario: 'In her 1934 book Patterns of Culture, Ruth Benedict documented societies with radically different values: some cultures honored behaviors others condemned. She concluded that morality is simply what a given culture calls normal. Judging another culture\'s ethics by your own standards, she argued, is like insisting everyone else speak your language.',
      source: 'Ruth Benedict, Patterns of Culture (1934)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Moral Universalism',
      body: 'Moral universalism argues that some ethical truths apply to all humans, everywhere. Prohibitions on murder, torture, and betrayal appear across virtually every culture in history. These shared values suggest morality isn\'t arbitrary. Universal human needs — safety, fairness, care — might ground a morality that transcends cultural difference.',
      visual: '🌐',
      highlight: 'moral universalism',
    },
    {
      type: 'question',
      prompt: 'What does moral relativism claim about ethical values?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'All cultures secretly agree on the same moral rules', isCorrect: false },
          { id: 'b', text: 'Moral values are created by cultures and vary between them', isCorrect: true },
          { id: 'c', text: 'Only ancient cultures had genuine moral values', isCorrect: false },
          { id: 'd', text: 'Morality is determined by biology, not culture', isCorrect: false },
        ],
        explanation: 'Moral relativism holds that ethical values are culturally constructed — there are no universal moral truths that stand above or outside particular societies.',
      },
    },
    {
      type: 'example',
      title: 'What Cultures Actually Share',
      scenario: 'Despite enormous cultural diversity, anthropologists have found near-universal moral rules across all known societies: prohibitions on unprovoked murder within the group, rules against stealing from community members, norms of care for children. This moral common ground suggests that some values may be rooted in the universal requirements of human social life.',
      emoji: '🤝',
    },
    {
      type: 'question',
      prompt: 'According to moral universalism, some ethical truths apply to all humans everywhere.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Moral universalism holds that at least some moral values — like prohibitions on murder or torture — are not merely cultural preferences but genuine truths that apply across all human societies.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve seen two opposing views on where morality comes from.',
      body: 'The debate between relativism and universalism isn\'t settled. Most contemporary philosophers reject pure relativism — it makes it impossible to criticise slavery or genocide — but also avoid crude universalism that ignores genuine cultural difference. The search is for moral truths that are universal yet sensitive to context.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'One Morality or Many?',
      keyPoints: [
        'Moral relativism: ethics varies by culture, no universal truth',
        'Moral universalism: some moral rules apply everywhere',
        'Cultures differ widely but share some core prohibitions',
        'Pure relativism makes condemning atrocities impossible',
      ],
      closingThought: 'Understanding other cultures doesn\'t require abandoning moral judgment — it requires making that judgment carefully.',
    },
  ],
};

export default lesson;
