import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-2',
  slug: 'power-and-people',
  title: 'Power and People',
  description: 'Why people obey, where legitimacy comes from, and how authority differs from raw force.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Force can make you obey. Can it make you agree?',
      subtext: 'Power bends bodies. Authority wins minds. Not the same thing.',
      emoji: '👑',
    },
    {
      type: 'concept',
      title: 'Power vs. Authority',
      body: 'Political philosophy splits two ideas people blur. Power is the brute ability to make you act — by threat or force. Authority is power people accept as legitimate: a recognized right to command. A mugger has power over you. A judge has authority. That gap is where political philosophy begins.',
      visual: '⚖️',
      highlight: 'authority',
    },
    {
      type: 'example',
      title: 'A Kingdom Without Justice',
      scenario: 'Augustine asked a sharp question: strip justice away, and what is a kingdom but a giant gang of robbers? A thief and a state both take your money by threat. The difference is legitimacy. Hobbes, Locke, and Rousseau all hunted for it — what turns naked power into a right to rule that you can owe obedience to?',
      source: 'Augustine, City of God (426 CE)',
      emoji: '🏰',
    },
    {
      type: 'concept',
      title: 'Weber\'s Three Types of Authority',
      body: 'Max Weber sorted legitimacy into three sources. Traditional authority leans on custom and bloodline — kings, elders, "we have always done this." Charismatic authority flows from a leader\'s sheer magnetism. Rational-legal authority rests on rules, offices, and law. Modern democracies run on the third: a president commands through the office, not the personality.',
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
          { id: 'a', text: 'Traditional authority, rooted in inherited custom', isCorrect: false },
          { id: 'b', text: 'Charismatic authority, rooted in personal magnetism', isCorrect: false },
          { id: 'c', text: 'Rational-legal authority, rooted in office and law', isCorrect: true },
          { id: 'd', text: 'None — elected officials hold only raw power', isCorrect: false },
        ],
        explanation: 'A president commands through a constitutional office and a lawful vote — not inherited custom, not personal charm. That is Weber\'s rational-legal authority exactly: legitimacy flowing from rules, not bloodlines or charisma.',
      },
    },
    {
      type: 'example',
      title: 'When Charisma Burns Bright and Brief',
      scenario: 'Napoleon inherited no crown and held no traditional office. People flocked to him for his daring, energy, and gift for inspiring fierce loyalty. Weber named this charismatic authority. It blazes powerfully — and breaks easily. The moment the spell snaps or the leader dies, the authority dies too, because it lived in the person, not in any lasting office.',
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
        explanation: 'Power is the muscle to force action. Authority is power that people accept as a right to rule. A tyrant ruling by terror wields crushing power yet little real legitimacy — which is exactly why such regimes lean so heavily on fear.',
      },
    },
    {
      type: 'summary',
      title: 'Where Political Power Comes From',
      keyPoints: [
        'Power forces action; authority is power accepted as legitimate',
        'Weber\'s three sources: tradition, charisma, rational-legal rules',
        'Modern democracies run on rational-legal authority',
        'Power without legitimacy tends to break down',
      ],
      closingThought: 'The sturdiest governments rule by consent, not by sheer force.',
    },
  ],
};

export default lesson;
