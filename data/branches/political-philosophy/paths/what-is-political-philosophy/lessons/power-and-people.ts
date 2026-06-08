import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-2',
  slug: 'power-and-people',
  title: 'Power and People',
  description: 'Why people obey, where legitimacy comes from, and how Weber\'s authority differs from raw force.',
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
      body: 'Weber split two ideas people blur. Power (Macht) is the ability to impose your will despite resistance — by threat or force. Authority (Herrschaft) is the chance that commands get obeyed because people accept them as valid. A mugger has power. A judge has authority. That gap is where political philosophy begins.',
      visual: '⚖️',
      highlight: 'authority',
    },
    {
      type: 'example',
      title: 'A Kingdom Without Justice',
      scenario: 'Augustine sharpened the gap. "Take away justice," he wrote, "and what are kingdoms but great robberies?" He tells of a pirate hauled before Alexander the Great: with one ship I am a robber, the pirate says, but you with a whole fleet are an emperor. A thief and a lawless state both take by threat — only legitimacy tells them apart.',
      source: 'Augustine, City of God, Book IV.4 (413–426 CE)',
      emoji: '🏰',
    },
    {
      type: 'concept',
      title: 'Weber\'s Three Types of Authority',
      body: 'Weber defined the state as the body claiming a monopoly on the legitimate use of force. He sorted that legitimacy into three sources: traditional authority leans on custom and bloodline; charismatic authority flows from devotion to one extraordinary person; rational-legal authority rests on rules, offices, and law. These are ideal types — every real regime blends all three.',
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
        explanation: 'A president commands through a constitutional office and a lawful vote — not inherited custom, not personal magnetism. That is Weber\'s rational-legal authority: legitimacy flowing from rules and office. Weber treats his three types neutrally — this one simply fits a modern bureaucratic state.',
      },
    },
    {
      type: 'example',
      title: 'When Charisma Burns Bright and Brief',
      scenario: 'Weber\'s charismatic leader is the prophet or the revolutionary war hero — followed because people impute extraordinary qualities to them, not because they hold any office. It blazes powerfully and breaks easily: when the leader dies, the authority must be "routinized" into tradition or rules to survive, since it lived in the person, not in a lasting institution.',
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
        explanation: 'Power (Macht) is the muscle to force action. Authority (Herrschaft) is power obeyed because people accept it as valid. A tyrant ruling by terror wields crushing power yet little legitimacy — Augustine\'s point that, without justice, a kingdom is just a large robber band.',
      },
    },
    {
      type: 'summary',
      title: 'Where Political Power Comes From',
      keyPoints: [
        'Power forces action; authority is power obeyed as legitimate',
        'Weber\'s three types: tradition, charisma, rational-legal rules',
        'They are ideal types — real regimes blend all three',
        'Charisma is unstable until "routinized" into custom or law',
      ],
      closingThought: 'Lasting rule rests on accepted legitimacy, not sheer force alone.',
    },
  ],
};

export default lesson;
