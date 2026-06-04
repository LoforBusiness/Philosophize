import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-3',
  slug: 'what-makes-government-legitimate',
  title: 'What Makes a Government Legitimate?',
  description: 'Learn what gives governments the right to rule, and what happens when they lose it.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Can a government rule you without your consent?',
      subtext: 'Locke and Rousseau gave very different answers.',
      emoji: '📜',
    },
    {
      type: 'concept',
      title: 'Consent of the Governed',
      body: 'John Locke argued that a government is legitimate only if the people consent to it. We are born free, with natural rights to life, liberty, and property. We give up some freedom to the government in exchange for protecting those rights. A government that violates them loses its right to rule.',
      visual: '✍️',
      highlight: 'consent of the governed',
    },
    {
      type: 'example',
      title: 'Locke and the American Revolution',
      scenario: 'The American Declaration of Independence (1776) closely echoes Locke. The colonists argued that the British Crown had violated their rights through taxation without representation and military occupation. Since the agreement was broken, they claimed the people had the right to reject that rule. Locke\'s idea helped justify the revolution.',
      source: 'John Locke, Two Treatises of Government (1689)',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Rousseau\'s General Will',
      body: 'Rousseau took a different approach. He said a legitimate government must follow the "general will," meaning what is good for the community as a whole, not just the sum of private wants. A government that serves only the powerful loses its legitimacy. Real political freedom, he argued, is living under laws you helped make.',
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
          { id: 'a', text: 'When it becomes unpopular or makes poor decisions', isCorrect: false },
          { id: 'b', text: 'When it violates the natural rights of the people', isCorrect: true },
          { id: 'c', text: 'When it fails to win a majority in an election', isCorrect: false },
          { id: 'd', text: 'When a stronger foreign power conquers it in war', isCorrect: false },
        ],
        explanation: 'For Locke, the whole purpose of government is to protect our natural rights. When it starts violating those rights instead, it breaks the contract and loses its right to rule.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You saw earlier that authority depends on legitimacy.',
      body: 'Locke and Rousseau both build on that idea but disagree on its source. Locke bases legitimacy on individual rights and consent. Rousseau bases it on the common good. Modern democracies try to honor both: majority rule that still protects the individual.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'Rousseau\'s "general will" means what a community truly needs, not just private wants.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Rousseau separated the "will of all" (whatever people happen to want) from the "general will" (what is genuinely good for the whole community). He argued that legitimate laws must reflect the general will.',
      },
    },
    {
      type: 'summary',
      title: 'The Right to Rule',
      keyPoints: [
        'Locke: a government is legitimate only with consent',
        'Violate natural rights, and the agreement breaks',
        'Rousseau: law must serve the community\'s common good',
        'Both ideas shape modern democracy',
      ],
      closingThought: 'Elections are a reminder that rulers answer to the people.',
    },
  ],
};

export default lesson;
