import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-1',
  slug: 'why-societies-need-rules',
  title: 'Why Societies Need Rules',
  description: 'Meet Hobbes\'s social contract: why we trade the right to all things for peace.',
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
      body: 'Thomas Hobbes ran a thought experiment: strip away every law, court, and ruler. What remains? He called it the "state of nature." With no common power to judge between us, competition, distrust, and pride collide, and life turns "solitary, poor, nasty, brutish, and short."',
      visual: '🌿',
      highlight: 'state of nature',
    },
    {
      type: 'example',
      title: 'The War of All Against All',
      scenario: 'In Leviathan (1651), Hobbes argues we are roughly equal: even the weakest can kill the strongest. Equal hope breeds rivalry; rivalry breeds fear, so each strikes first. The result is "a war of every man against every man." The fix: people covenant to authorize one sovereign, because "covenants, without the sword, are but words."',
      source: 'Thomas Hobbes, Leviathan (1651), Part I, Ch. XIII–XVII',
      emoji: '🏚️',
    },
    {
      type: 'concept',
      title: 'The Social Contract',
      body: 'Here is the big idea: the "social contract." Subjects mutually agree to lay down their right to all things and authorize one ruler to enforce peace. Hobbes, Locke, and Rousseau all use this device, but differ sharply: Hobbes\'s fear-driven deal yields an absolute, irrevocable sovereign.',
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
        explanation: 'For Hobbes the war comes from the situation, no common arbiter, not from people being wicked. Rational self-preservation and fear of death drive the covenant, since nearly any sovereign beats anarchy.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'The contract is a test of legitimacy, not a signed document.',
      body: 'No one literally signed it. For Hobbes the covenant runs among subjects, who then authorize the sovereign, so there is no right to revolt. Locke disagreed: if a ruler betrays the trust and tramples our natural rights, the people may rightfully resist.',
      emoji: '💡',
    },
    {
      type: 'question',
      prompt: 'True or false: Hobbes believed that without government, people live in peace.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Hobbes argued the reverse. With no common power to keep order, competition, distrust, and pride push people into war. That dread is exactly why he defended a strong, unified sovereign to enforce peace.',
      },
    },
    {
      type: 'summary',
      title: 'Rules Make Society Possible',
      keyPoints: [
        'The "state of nature": life with no common arbiter',
        'Hobbes: a war of every man against every man',
        'Social contract: authorize a sovereign for peace',
        'Without the sword, covenants are but words',
      ],
      closingThought: 'Political philosophy asks who should rule, and why we should obey.',
    },
  ],
};

export default lesson;
