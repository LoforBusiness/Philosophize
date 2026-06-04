import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-2',
  slug: 'power-and-people',
  title: 'Power and People',
  description: 'Learn where political power comes from and why people choose to obey.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Force can make you obey. Can it make you agree?',
      subtext: 'Power and authority are not the same thing.',
      emoji: '👑',
    },
    {
      type: 'concept',
      title: 'Power vs. Authority',
      body: 'Political philosophers separate power from authority. Power is the ability to make someone act, by force if needed. Authority is power that people accept as legitimate: the recognized right to give orders. A robber has power over you. A judge has authority. The difference matters a lot.',
      visual: '⚖️',
      highlight: 'authority',
    },
    {
      type: 'example',
      title: 'One Demand, Two Meanings',
      scenario: 'A police officer and an armed thief both tell you to hand over your money. The demand is the same, but you obey the officer because you accept their authority as legitimate. The thief has power, a raw threat, but no authority. So what makes the officer\'s command legitimate when the thief\'s is not?',
      emoji: '🚔',
    },
    {
      type: 'concept',
      title: 'Weber\'s Three Types of Authority',
      body: 'Max Weber said authority comes from three sources. Traditional authority rests on custom and history, like kings or elders. Charismatic authority comes from a leader\'s personal appeal. Rational-legal authority comes from rules and offices, which most modern democracies rely on. A president gives orders through the office, not as a person.',
      visual: '🏛️',
      highlight: 'rational-legal authority',
    },
    {
      type: 'question',
      prompt: 'Which type of authority best fits an elected president?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Traditional authority, based on long-standing custom', isCorrect: false },
          { id: 'b', text: 'Charismatic authority, based on personal appeal', isCorrect: false },
          { id: 'c', text: 'Rational-legal authority, based on rules and office', isCorrect: true },
          { id: 'd', text: 'None, since elected officials only hold power', isCorrect: false },
        ],
        explanation: 'A president\'s authority comes from the constitutional office and a lawful election, not from inherited custom or personal charm. That is exactly Weber\'s rational-legal type.',
      },
    },
    {
      type: 'example',
      title: 'How Charisma Rises and Fades',
      scenario: 'When Napoleon Bonaparte rose to power, he inherited no throne and at first held no traditional office. People followed him because of his military skill, energy, and ability to inspire loyalty. Weber called this charismatic authority. It can be strong, but it is fragile. When the leader loses appeal or dies, the authority usually fades too.',
      source: 'Max Weber, Economy and Society (1922)',
      emoji: '⚔️',
    },
    {
      type: 'question',
      prompt: 'True or false: having power always means having legitimate authority.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Power is the ability to force action. Authority is power that people accept as legitimate. A dictator who rules by fear may have plenty of power, but in the eyes of the people, little real authority.',
      },
    },
    {
      type: 'summary',
      title: 'Where Political Power Comes From',
      keyPoints: [
        'Power forces action; authority is power people accept',
        'Weber\'s three types: tradition, charisma, and legal rules',
        'Modern democracies rely mostly on rational-legal authority',
        'Power without legitimacy tends to break down',
      ],
      closingThought: 'The most stable governments rule by consent, not just by force.',
    },
  ],
};

export default lesson;
