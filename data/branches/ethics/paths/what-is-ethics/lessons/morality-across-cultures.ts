import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-4',
  slug: 'morality-across-cultures',
  title: 'Is Morality Universal or Relative?',
  description: 'One world, a thousand moral codes. Are some truths binding on everyone, or is right and wrong just whatever your culture says? This is metaethics: relativism versus objectivism.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Every culture writes its own rulebook. So who is right?',
      subtext: 'Is "right" a truth waiting to be found, or a habit your culture handed you?',
      emoji: '🌍',
    },
    {
      type: 'concept',
      title: 'Moral Relativism',
      body: 'Moral relativism says values are made, not discovered. Each culture writes its own code, and no higher truth stands above them to crown a winner. What one society blesses, another bans, and both are simply right-for-them. There is no view from nowhere, no neutral judge. Morality, on this view, is local all the way down.',
      visual: '🗺️',
      highlight: 'moral relativism',
    },
    {
      type: 'example',
      title: 'Ruth Benedict\'s Challenge',
      scenario: 'In Patterns of Culture (1934), anthropologist Ruth Benedict lined up societies that praised exactly what their neighbours condemned. Her argument: "morally good" is close to "customary." Judge another culture by your yardstick, she warned, and you smuggle in the assumption that your way is the one true way.',
      source: 'Ruth Benedict, Patterns of Culture (1934)',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'Moral Objectivism',
      body: 'Objectivism (or universalism) fires back: some moral truths bind everyone, everywhere, always. Torturing a child for fun is wrong in every language. Notice how nearly every culture forbids murder, theft, and betrayal of its own. That shared floor hints that morality tracks something real, rooted in what any creature that feels pain and lives together actually needs.',
      visual: '🌐',
      highlight: 'moral objectivism',
    },
    {
      type: 'question',
      prompt: 'What does moral relativism claim about our ethical values?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Beneath the surface, every culture obeys one universal moral law', isCorrect: false },
          { id: 'b', text: 'Each culture makes its own values, and there is no higher judge', isCorrect: true },
          { id: 'c', text: 'Only the ancient philosophers grasped real moral values', isCorrect: false },
          { id: 'd', text: 'Morality is hardwired by biology, not shaped by culture', isCorrect: false },
        ],
        explanation: 'For the relativist, each society authors its own values. There is no culture-independent truth to appeal to when two codes collide.',
      },
    },
    {
      type: 'example',
      title: 'The Surprising Overlap',
      scenario: 'Dig beneath the differences and anthropologists keep unearthing the same bedrock: do not kill your own without cause, do not steal from kin, protect the children. These rules surface again and again, as if any group that wants to survive together is forced to invent them. Convergence, not coincidence.',
      emoji: '🤝',
    },
    {
      type: 'question',
      prompt: 'According to moral objectivism, some ethical truths hold for all humans everywhere.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Objectivists insist that some values, like the wrongness of cruelty and murder, are not local tastes but truths binding on every human society.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'A live debate, not a solved one.',
      body: 'Few philosophers buy pure relativism: if right is just whatever a culture says, you lose the ground to call slavery or genocide wrong. But crude universalism that flattens real differences feels arrogant too. Most thinkers chase a middle path, truths broad enough to bind everyone, supple enough to honour context.',
      emoji: '🔭',
    },
    {
      type: 'summary',
      title: 'One Morality or Many?',
      keyPoints: [
        'Relativism: values are made by culture, no higher judge',
        'Objectivism: some moral truths bind everyone, always',
        'Cultures clash but share core prohibitions',
        'Pure relativism cannot condemn atrocities',
      ],
      closingThought: 'Understanding a culture is not surrendering judgment; it is judging with open eyes.',
    },
  ],
};

export default lesson;
