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
      body: 'Imagine no state at all: just people, free and unruled. Hobbes called it the "state of nature" and warned that with no common judge to settle disputes, it slides into war. So people covenant together to set up a ruler who keeps the peace. That bargain is the social contract.',
      visual: '✍️',
      highlight: 'social contract',
    },
    {
      type: 'example',
      title: 'Locke Fires a Revolution',
      scenario: 'Locke said the state of nature is not war but a place ruled by a law of reason: harm no one in "life, health, liberty, or possessions." We set up government to guard those rights, holding power only in trust. Break that trust and it forfeits its rule. America\'s founders drew on these Lockean ideas in 1776.',
      source: 'John Locke, Two Treatises of Government (1689)',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Rousseau and the General Will',
      body: 'Rousseau pushed further. Legitimacy, he argued, flows from the "general will": what truly serves the whole people, not the sum of private wants. Obeying a law you helped author makes you a citizen, not a subject. Real freedom, he insisted, is living under rules you give yourself.',
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
          { id: 'b', text: 'When it tramples the natural rights it was trusted to protect', isCorrect: true },
          { id: 'c', text: 'When it loses a majority at the next election', isCorrect: false },
          { id: 'd', text: 'When a stronger foreign army conquers it', isCorrect: false },
        ],
        explanation: 'For Locke, power is held in trust to guard our lives, liberties, and estates. When rulers turn against that trust, they forfeit the right to rule, and the people may remove or alter the government.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Same question, two rival answers.',
      body: 'Locke roots legitimacy in consent and individual rights held in trust. Rousseau roots it in the common good, the general will. Modern democracies try to fuse both: popular sovereignty that still shields the lone individual. Hold that tension and you hold the whole debate.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'Rousseau\'s "general will" means what a community truly needs, not just private wants.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'In The Social Contract (1762), Rousseau split the "will of all" (the sum of private wants) from the "general will" (what genuinely serves the whole). Even a majority can be wrong; legitimate law must track the general will.',
      },
    },
    {
      type: 'summary',
      title: 'The Right to Rule',
      keyPoints: [
        'Hobbes: with no common judge, the state of nature is war',
        'Locke: legitimacy rests on consent and rights held in trust',
        'Rousseau: law must serve the general will',
        'Democracy fuses rights and popular sovereignty',
      ],
      closingThought: 'Every election whispers it: rulers answer to the ruled.',
    },
  ],
};

export default lesson;
