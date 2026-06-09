import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-2',
  slug: 'power-and-people',
  title: 'Power and People',
  description: 'Why people obey, and how Weber\'s authority differs from raw force.',
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
      body: 'Weber split two ideas we blur. Power is imposing your will despite resistance, by threat or force. Authority is being obeyed because people accept your commands as valid. A mugger has power; a judge has authority.',
      visual: '⚖️',
      highlight: 'authority',
    },
    {
      type: 'example',
      title: 'A Kingdom Without Justice',
      scenario: 'Augustine sharpened the gap. A captured pirate told Alexander the Great: with one ship I am a robber, but you with a fleet are an emperor. A thief and a lawless state both take by threat. Only legitimacy tells them apart.',
      source: 'Augustine, City of God, Book IV.4 (413–426 CE)',
      emoji: '🏰',
    },
    {
      type: 'quote',
      id: 'lq-political-political-2-1',
      quote: 'A state is a human community that claims the monopoly of the legitimate use of physical force within a given territory.',
      author: 'Max Weber',
      era: '1919',
      work: 'Politics as a Vocation',
    },
    {
      type: 'concept',
      title: 'Weber\'s Three Types of Authority',
      body: 'Weber sorted legitimacy into three sources. Traditional authority leans on custom and bloodline. Charismatic authority flows from devotion to one person. Rational-legal authority rests on rules, offices, and law.',
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
        explanation: 'A president commands through a constitutional office and a lawful vote, not inherited custom or personal magnetism. That is Weber\'s rational-legal authority.',
      },
    },
    {
      type: 'question',
      prompt: 'A wildly popular, magnetic leader wins a landslide election. Which authority makes their commands legitimate?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Charismatic, since their personal magnetism is obvious', isCorrect: false },
          { id: 'b', text: 'Rational-legal, since legitimacy comes from the elected office, not the charm', isCorrect: true },
          { id: 'c', text: 'Traditional, since landslides become a custom', isCorrect: false },
          { id: 'd', text: 'Pure power, since popularity is just force in disguise', isCorrect: false },
        ],
        explanation: 'Charisma may win the vote, but the legitimacy of their commands flows from the lawful office they now hold. Real leaders blend types; the binding authority here is rational-legal.',
      },
    },
    {
      type: 'summary',
      title: 'Where Political Power Comes From',
      keyPoints: [
        'Power forces action; authority is obeyed as legitimate',
        'Weber\'s types: tradition, charisma, rational-legal',
        'They are ideal types; real regimes blend them',
        'Charisma is unstable until routinized into law',
      ],
      closingThought: 'Lasting rule rests on accepted legitimacy, not sheer force alone.',
    },
  ],
};

export default lesson;
