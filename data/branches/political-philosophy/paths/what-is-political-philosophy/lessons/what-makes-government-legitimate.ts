import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-3',
  slug: 'what-makes-government-legitimate',
  title: 'What Makes a Government Legitimate?',
  description: 'Power can force you. Legitimacy gives the right to rule. Where does that right come from?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A gun can make you obey. What makes you owe obedience?',
      subtext: 'Power compels. Legitimacy commands. Philosophers fought over the gap.',
      emoji: '📜',
    },
    {
      type: 'concept',
      title: 'The Social Contract',
      body: 'Imagine no state at all: just people, free and unruled. Hobbes called it the "state of nature," and warned life there would be brutal. So we strike a deal. We hand the state some freedom; it shields our rights. That bargain is the social contract, and consent is its engine.',
      visual: '✍️',
      highlight: 'social contract',
    },
    {
      type: 'example',
      title: 'Locke Fires a Revolution',
      scenario: 'John Locke said we are born free, owning natural rights to life, liberty, and property. Government exists to guard them, no more. Break that trust, and the people may dissolve it. In 1776, Jefferson echoed Locke almost word for word: the Declaration accuses the Crown of shattering the bargain. Philosophy lit the fuse.',
      source: 'John Locke, Two Treatises of Government (1689)',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Rousseau and the General Will',
      body: 'Rousseau pushed further. Legitimacy, he argued, flows from the "general will": what truly serves the whole people, not the loudest faction or the richest few. Obey laws you helped author, and you are not a subject but a citizen. Real freedom, he insisted, is living under rules you give yourself.',
      visual: '🌐',
      highlight: 'general will',
    },
    {
      type: 'question',
      prompt: 'According to Locke, what causes a government to lose its legitimacy?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'When it grows unpopular or makes clumsy decisions', isCorrect: false },
          { id: 'b', text: 'When it tramples the natural rights it was built to protect', isCorrect: true },
          { id: 'c', text: 'When it loses a majority at the next election', isCorrect: false },
          { id: 'd', text: 'When a stronger foreign army conquers it', isCorrect: false },
        ],
        explanation: 'For Locke, government has one job: guarding natural rights. The moment it starts violating them, it breaks the social contract and forfeits its right to rule.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Same question, two rival answers.',
      body: 'Locke roots legitimacy in individual rights and consent. Rousseau roots it in the common good, the general will. Modern democracies try to fuse both: majority rule that still shields the lone individual. Hold that tension and you hold the whole debate.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'Rousseau\'s "general will" means what a community truly needs, not just private wants.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Rousseau split the "will of all" (whatever people happen to want) from the "general will" (what genuinely serves the whole community). Legitimate laws, he argued, must track the general will.',
      },
    },
    {
      type: 'summary',
      title: 'The Right to Rule',
      keyPoints: [
        'Hobbes: a social contract trades freedom for safety',
        'Locke: legitimacy rests on consent and natural rights',
        'Rousseau: law must serve the general will',
        'Democracy fuses both into one bargain',
      ],
      closingThought: 'Every election whispers it: rulers answer to the ruled.',
    },
  ],
};

export default lesson;
