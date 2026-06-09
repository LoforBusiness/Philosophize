import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-3',
  slug: 'what-makes-government-legitimate',
  title: 'What Makes a Government Legitimate?',
  description: 'Power can force you. Legitimacy gives the right to rule.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A gun makes you obey. What makes you owe obedience?',
      subtext: 'Power compels. Legitimacy commands. Philosophers fought over the gap.',
      emoji: '📜',
    },
    {
      type: 'concept',
      title: 'The Social Contract',
      body: 'Imagine no state at all: people free and unruled. Hobbes warned that with no common judge, this "state of nature" slides into war. So people covenant to set up a ruler who keeps the peace.',
      visual: '✍️',
      highlight: 'social contract',
    },
    {
      type: 'example',
      title: 'Locke Fires a Revolution',
      scenario: 'Locke said we set up government to guard our rights, holding power only in trust. Break that trust and it forfeits its rule. America\'s founders drew on these Lockean ideas in 1776.',
      source: 'John Locke, Two Treatises of Government (1689)',
      emoji: '🗽',
    },
    {
      type: 'quote',
      id: 'lq-political-political-3-1',
      quote: 'Men being by nature all free, equal and independent, no one can be subjected to the political power of another without his own consent.',
      author: 'John Locke',
      era: '1689',
      work: 'Two Treatises of Government',
    },
    {
      type: 'concept',
      title: 'Rousseau and the General Will',
      body: 'Rousseau pushed further. Legitimacy flows from the "general will": what truly serves the whole people, not the sum of private wants. Real freedom is living under rules you give yourself.',
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
        explanation: 'For Locke, power is held in trust to guard our lives, liberties, and estates. Turn against that trust and rulers forfeit the right to rule.',
      },
    },
    {
      type: 'question',
      prompt: 'Rousseau prized the general will, so a 51% majority vote must always equal the general will. Correct?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, the general will is simply whatever the majority votes for', isCorrect: false },
          { id: 'b', text: 'No, a majority can chase private interests and miss the common good', isCorrect: true },
          { id: 'c', text: 'Yes, Rousseau equated counting votes with finding the common good', isCorrect: false },
          { id: 'd', text: 'No, because Rousseau rejected voting entirely', isCorrect: false },
        ],
        explanation: 'The trap: Rousseau split the "will of all" (the sum of private wants) from the "general will" (what serves the whole). Even a majority can be wrong.',
      },
    },
    {
      type: 'summary',
      title: 'The Right to Rule',
      keyPoints: [
        'Hobbes: no common judge means war',
        'Locke: legitimacy rests on consent and trust',
        'Rousseau: law must serve the general will',
        'Democracy fuses rights and popular sovereignty',
      ],
      closingThought: 'Every election whispers it: rulers answer to the ruled.',
    },
  ],
};

export default lesson;
