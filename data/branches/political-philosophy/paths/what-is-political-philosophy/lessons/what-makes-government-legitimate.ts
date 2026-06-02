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
      headline: 'Can a government rightfully rule you without your consent?',
      subtext: 'Locke and Rousseau answered in strikingly different voices.',
      emoji: '📜',
    },
    {
      type: 'concept',
      title: 'Consent of the Governed',
      body: 'John Locke held that a government is legitimate only where the people consent to its rule. We are born free, bearing natural rights to life, liberty, and property. We yield a measure of freedom to government in exchange for the safeguarding of those rights. A government that tramples them forfeits its very right to rule.',
      visual: '✍️',
      highlight: 'consent of the governed',
    },
    {
      type: 'example',
      title: 'Locke Ignites a Revolution',
      scenario: 'The American Declaration of Independence (1776) reads almost as a page of Locke. The colonists charged that the British Crown had trampled their natural rights through taxation without representation and military occupation. The contract being broken, the people held not merely the right but the duty to cast off such rule. An idea had lit the fuse of revolution.',
      source: 'John Locke, Two Treatises of Government (1689)',
      emoji: '🗽',
    },
    {
      type: 'concept',
      title: 'Rousseau\'s General Will',
      body: 'Rousseau approached from another angle. Legitimate government must voice the "general will" — what the community as a whole genuinely needs, not the sum of private wants. A regime that serves only the mighty or the few forfeits its legitimacy. True political freedom, he taught, is to live beneath laws you yourself have helped to author.',
      visual: '🌐',
      highlight: 'general will',
    },
    {
      type: 'question',
      prompt: 'For Locke, what causes a government to forfeit its legitimacy?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'When it grows unpopular or stumbles into poor decisions', isCorrect: false },
          { id: 'b', text: 'When it tramples the natural rights of those it governs', isCorrect: true },
          { id: 'c', text: 'When it fails to secure a majority at the ballot box', isCorrect: false },
          { id: 'd', text: 'When a mightier foreign power conquers it in war', isCorrect: false },
        ],
        explanation: 'For Locke, the entire purpose of government is to guard our natural rights. The moment it turns to violating those rights rather than protecting them, it has shattered the contract and forfeited its claim to rule.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You saw earlier that authority leans on legitimacy.',
      body: 'Locke and Rousseau both build upon that insight — yet quarrel over its source. Locke roots legitimacy in individual rights and freely given consent. Rousseau roots it in the common good. Modern democracies strain to honour both at once: majority rule that still shelters the individual.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'Rousseau\'s "general will" is what a community truly needs, not mere private want.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Rousseau parted the "will of all" (whatever people happen to want) from the "general will" (what is genuinely good for the whole). Legitimate law, he insisted, must mirror the general will.',
      },
    },
    {
      type: 'summary',
      title: 'The Right to Rule',
      keyPoints: [
        'Locke: a government is legitimate only by consent',
        'Trample natural rights, and the contract breaks',
        'Rousseau: law must voice the community\'s common good',
        'Both ideas quietly underpin modern democracy',
      ],
      closingThought: 'Every election whispers that rulers serve at the people\'s pleasure.',
    },
  ],
};

export default lesson;
