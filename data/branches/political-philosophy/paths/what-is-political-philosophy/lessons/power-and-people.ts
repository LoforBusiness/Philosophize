import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-2',
  slug: 'power-and-people',
  title: 'Power and People',
  description: 'Explore where political power comes from and why people choose to obey.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A gun can make you obey. But can it make you loyal?',
      subtext: 'Power and authority are not the same thing.',
      emoji: '👑',
    },
    {
      type: 'concept',
      title: 'Power vs. Authority',
      body: 'Political philosophers draw a sharp line between power and authority. Power is the ability to force someone to do something — even through violence. Authority is legitimate power: the right to give commands, accepted as valid by those who obey. A robber has power over you. A judge has authority. The difference matters enormously.',
      visual: '⚖️',
      highlight: 'authority',
    },
    {
      type: 'example',
      title: 'The Same Action, Two Different Meanings',
      scenario: 'A police officer and an armed criminal both tell you to hand over your money. The action looks identical — but you obey the officer because you accept their authority as legitimate. The criminal has power (a threat) but no authority. Political philosophy asks: what makes the officer\'s command legitimate when the criminal\'s is not?',
      emoji: '🚔',
    },
    {
      type: 'concept',
      title: 'Weber\'s Three Sources of Authority',
      body: 'Sociologist Max Weber identified three ways authority becomes legitimate. Traditional authority rests on custom and history (kings, elders). Charismatic authority flows from the personal magnetism of a leader. Rational-legal authority comes from rules and offices — the kind most modern democracies rely on. The president has authority because of the office, not the person.',
      visual: '🏛️',
      highlight: 'rational-legal authority',
    },
    {
      type: 'question',
      prompt: 'Which of Weber\'s authority types best describes a democratically elected president?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Traditional authority — based on long custom', isCorrect: false },
          { id: 'b', text: 'Charismatic authority — based on personal appeal', isCorrect: false },
          { id: 'c', text: 'Rational-legal authority — based on rules and office', isCorrect: true },
          { id: 'd', text: 'None — elected officials have power, not authority', isCorrect: false },
        ],
        explanation: 'A president\'s authority comes from the constitutional office and the legal process of election — not from tradition or personal charisma. This is Weber\'s rational-legal type.',
      },
    },
    {
      type: 'example',
      title: 'Charismatic Authority in History',
      scenario: 'When Napoleon Bonaparte rose to power, he hadn\'t inherited a throne and held no traditional office at first. People followed him because of his extraordinary military genius, personal energy, and ability to inspire loyalty. Weber called this charismatic authority — it\'s powerful but fragile. When the charisma fades or the leader dies, the authority often collapses with it.',
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
        explanation: 'Power is the capacity to force compliance; authority is power that is accepted as legitimate. A dictator who rules by fear has power but may have no genuine authority in the eyes of those they rule.',
      },
    },
    {
      type: 'summary',
      title: 'Where Political Power Comes From',
      keyPoints: [
        'Power forces; authority is power accepted as legitimate',
        'Weber found three sources: tradition, charisma, rational-legal rules',
        'Modern democracies rely mainly on rational-legal authority',
        'Authority without legitimacy is just power waiting to collapse',
      ],
      closingThought: 'The most durable governments rule by consent, not just force.',
    },
  ],
};

export default lesson;
