import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-1',
  slug: 'why-societies-need-rules',
  title: 'Why Societies Need Rules',
  description: 'Meet the social contract: why thinkers say we trade raw freedom for law.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why obey rules you never agreed to?',
      subtext: 'Every state claims authority over you. Where does that power come from?',
      emoji: '⚔️',
    },
    {
      type: 'concept',
      title: 'The State of Nature',
      body: 'Thomas Hobbes ran a thought experiment: strip away every law, court, and ruler. What remains? He called it the "state of nature." His verdict was bleak. With no power to keep order, people clash over scarce goods, and life turns "solitary, poor, nasty, brutish, and short."',
      visual: '🌿',
      highlight: 'state of nature',
    },
    {
      type: 'example',
      title: 'The War of All Against All',
      scenario: 'In Leviathan (1651), Hobbes pictures life without a state as a "war of all against all." No one can trust anyone. Every person grabs first, fearing they will be grabbed from. So rational people, he argues, hand their power to a sovereign. Whatever a ruler costs you, anarchy costs more.',
      source: 'Thomas Hobbes, Leviathan (1651)',
      emoji: '🏚️',
    },
    {
      type: 'concept',
      title: 'The Social Contract',
      body: 'Here is the big idea: the "social contract." Government is not just force, it is a bargain. We surrender some freedom, like the liberty to seize whatever we want, and gain security and cooperation. Hobbes, Locke, and Rousseau each spun this differently, but all ground authority in our consent.',
      visual: '🤝',
      highlight: 'social contract',
    },
    {
      type: 'question',
      prompt: 'According to Hobbes, why do people accept rules and government?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because rulers are wiser and more virtuous than ordinary people', isCorrect: false },
          { id: 'b', text: 'Because life with no sovereign at all would be a brutal war of all against all', isCorrect: true },
          { id: 'c', text: 'Because humans are naturally peaceful and crave order for its own sake', isCorrect: false },
          { id: 'd', text: 'Because kings rule by divine right, chosen directly by God', isCorrect: false },
        ],
        explanation: 'For Hobbes, self-interest does the work, not virtue. The state of nature is so dangerous that nearly any sovereign beats none, so rational people consent to be ruled.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'The contract is a story we tell to justify the state.',
      body: 'No one literally signed it. The social contract is a tool for testing legitimacy: would free, rational people agree to this? Locke added that if a ruler breaks the deal and tramples our natural rights, the people may rightfully revolt.',
      emoji: '💡',
    },
    {
      type: 'question',
      prompt: 'True or false: Hobbes believed that without government, people live in peace.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Hobbes argued the reverse. Stripped of a sovereign, people would prey on each other to survive. That dread is exactly why he defended a strong, unified ruler to enforce peace.',
      },
    },
    {
      type: 'summary',
      title: 'Rules Make Society Possible',
      keyPoints: [
        'The "state of nature": imagined life with no state',
        'Hobbes: a brutal war of all against all',
        'Social contract: trade some freedom for security',
        'Consent, not force, is what legitimizes power',
      ],
      closingThought: 'Political philosophy asks who should rule, and why we should obey.',
    },
  ],
};

export default lesson;
