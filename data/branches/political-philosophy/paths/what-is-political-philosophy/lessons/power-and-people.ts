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
      headline: 'A gun can force your obedience. But can it earn your loyalty?',
      subtext: 'Power and authority are quietly, profoundly different things.',
      emoji: '👑',
    },
    {
      type: 'concept',
      title: 'Power vs. Authority',
      body: 'Political philosophers draw a careful line between power and authority. Power is the bare ability to make someone act — if need be, through force. Authority is power made legitimate: the recognised right to command, granted by those who obey. A robber holds power over you. A judge holds authority. That gap shapes everything.',
      visual: '⚖️',
      highlight: 'authority',
    },
    {
      type: 'example',
      title: 'One Demand, Two Meanings',
      scenario: 'A police officer and an armed thief each tell you to hand over your money. The demand is identical — yet you yield to the officer because you accept their authority as rightful. The thief wields power, a raw threat, but no authority at all. Political philosophy presses the question: what makes the officer\'s command legitimate when the thief\'s is not?',
      emoji: '🚔',
    },
    {
      type: 'concept',
      title: 'Weber\'s Three Springs of Authority',
      body: 'Max Weber traced authority to three sources of legitimacy. Traditional authority rests on the weight of custom and history — kings, elders. Charismatic authority radiates from a leader\'s personal magnetism. Rational-legal authority flows from rules and offices, the bedrock of most modern democracies. A president commands not as a person, but through the office itself.',
      visual: '🏛️',
      highlight: 'rational-legal authority',
    },
    {
      type: 'question',
      prompt: 'Which of Weber\'s kinds of authority best fits an elected president?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Traditional authority — rooted in the weight of custom', isCorrect: false },
          { id: 'b', text: 'Charismatic authority — drawn from personal magnetism', isCorrect: false },
          { id: 'c', text: 'Rational-legal authority — grounded in rules and office', isCorrect: true },
          { id: 'd', text: 'None — elected officials hold power, never authority', isCorrect: false },
        ],
        explanation: 'A president\'s authority springs from the constitutional office and the lawful ritual of election — not from inherited custom or personal charm. This is exactly Weber\'s rational-legal type.',
      },
    },
    {
      type: 'example',
      title: 'Charisma\'s Rise and Fall',
      scenario: 'When Napoleon Bonaparte rose, he had inherited no throne and, at first, held no traditional office. Men followed him for his dazzling military genius, his restless energy, his gift for kindling devotion. Weber named this charismatic authority — mighty, yet brittle. Let the spell dim or the leader die, and the authority tends to crumble away with him.',
      source: 'Max Weber, Economy and Society (1922)',
      emoji: '⚔️',
    },
    {
      type: 'question',
      prompt: 'True or false: to hold power is always to hold legitimate authority.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Power is the capacity to compel; authority is power that the ruled accept as rightful. A tyrant who governs by fear may possess abundant power yet, in the eyes of his people, no true authority at all.',
      },
    },
    {
      type: 'summary',
      title: 'Where Political Power Comes From',
      keyPoints: [
        'Power compels; authority is power accepted as rightful',
        'Weber\'s three springs: tradition, charisma, rational-legal rules',
        'Modern democracies lean mostly on rational-legal authority',
        'Power without legitimacy is merely collapse postponed',
      ],
      closingThought: 'The sturdiest governments rule by consent, not merely by force.',
    },
  ],
};

export default lesson;
