import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-3',
  slug: 'what-makes-government-legitimate',
  title: 'What Makes a Government Legitimate?',
  description: 'Investigate what gives governments the right to rule — and what happens when they lose it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Can a government rule without your permission?',
      subtext: 'Locke and Rousseau had very different answers.',
      emoji: '📜',
    },
    {
      type: 'concept',
      title: 'Consent of the Governed',
      body: 'John Locke argued that a government is legitimate only if the people consent to being ruled by it. We are born free, with natural rights to life, liberty, and property. We only surrender some freedom to a government in exchange for protection of those rights. A government that violates them loses its right to rule.',
      visual: '✍️',
      highlight: 'consent of the governed',
    },
    {
      type: 'example',
      title: 'Locke and the American Revolution',
      scenario: 'The American Declaration of Independence (1776) reads almost like a Locke essay. The colonists argued that the British Crown had violated their natural rights through taxation without representation and military occupation. Because the government had broken the social contract, the people had the right — even the duty — to overthrow it. Locke\'s ideas powered a revolution.',
      source: 'John Locke, Two Treatises of Government (1689)',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Rousseau\'s General Will',
      body: 'Rousseau took a different angle. Legitimate government must express the "general will" — what the community as a whole truly needs, not just what individuals want. A government that serves only the powerful or only private interests loses legitimacy. True political freedom means living under laws you have genuinely helped to create.',
      visual: '🌐',
      highlight: 'general will',
    },
    {
      type: 'question',
      prompt: 'According to Locke, what makes a government lose its legitimacy?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'When it becomes unpopular or makes bad decisions', isCorrect: false },
          { id: 'b', text: 'When it violates the natural rights of the people it governs', isCorrect: true },
          { id: 'c', text: 'When it fails to win a majority in elections', isCorrect: false },
          { id: 'd', text: 'When a stronger foreign power defeats it in war', isCorrect: false },
        ],
        explanation: 'For Locke, the whole point of government is to protect natural rights. Once it begins violating those rights instead of protecting them, it has broken the social contract and forfeited its legitimacy.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you learned that authority requires legitimacy.',
      body: 'Locke and Rousseau both build on that idea — but they disagree on the source. Locke grounds legitimacy in individual rights and explicit consent. Rousseau grounds it in the collective good. Modern democracies try to honour both: majority rule that still protects individual rights.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'Rousseau\'s "general will" represents what a community truly needs — not just individual desires.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Rousseau distinguished between the "will of all" (what people happen to want) and the "general will" (what is genuinely good for the community). Legitimate law must reflect the general will.',
      },
    },
    {
      type: 'summary',
      title: 'The Right to Rule',
      keyPoints: [
        'Locke: governments are legitimate only with the people\'s consent',
        'Violating natural rights breaks the social contract',
        'Rousseau: law must reflect the community\'s genuine common good',
        'Both ideas underpin modern democracy',
      ],
      closingThought: 'Every election is a reminder that rulers serve at the people\'s pleasure.',
    },
  ],
};

export default lesson;
