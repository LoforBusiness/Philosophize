import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-1',
  slug: 'why-societies-need-rules',
  title: 'Why Societies Need Rules',
  description: 'Hobbes\'s social contract: why we trade total freedom for peace.',
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
      body: 'Hobbes ran a thought experiment: strip away every law, court, and ruler. With no common power to judge between us, fear and rivalry collide, and life turns "nasty, brutish, and short."',
      visual: '🌿',
      highlight: 'state of nature',
    },
    {
      type: 'example',
      title: 'The War of All Against All',
      scenario: 'In Leviathan, Hobbes notes even the weakest can kill the strongest. So each strikes first from fear. The result: "a war of every man against every man." The fix: authorize one sovereign to keep the peace.',
      source: 'Thomas Hobbes, Leviathan (1651)',
      emoji: '🏚️',
    },
    {
      type: 'quote',
      id: 'lq-political-political-1-1',
      quote: 'Covenants, without the sword, are but words, and of no strength to secure a man at all.',
      author: 'Thomas Hobbes',
      era: '1651',
      work: 'Leviathan',
    },
    {
      type: 'question',
      prompt: 'According to Hobbes, why do people accept rules and government?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because rulers are wiser and more virtuous than ordinary people', isCorrect: false },
          { id: 'b', text: 'Because life with no sovereign would be a brutal war of all against all', isCorrect: true },
          { id: 'c', text: 'Because humans are naturally peaceful and crave order for its own sake', isCorrect: false },
          { id: 'd', text: 'Because kings rule by divine right, chosen directly by God', isCorrect: false },
        ],
        explanation: 'For Hobbes the war comes from the situation, no common arbiter, not from people being wicked. Fear of death drives the covenant, since nearly any sovereign beats anarchy.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'The contract is a test of legitimacy, not a signed document.',
      body: 'No one literally signed it. For Hobbes the covenant binds subjects, so there is no right to revolt. Locke disagreed: betray our rights, and the people may resist.',
      emoji: '💡',
    },
    {
      type: 'question',
      prompt: 'Hobbes\'s sovereign keeps the peace, so surely he wanted citizens free to overthrow a bad one. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, Hobbes built in a clear right to revolt against tyrants', isCorrect: false },
          { id: 'b', text: 'No, Hobbes feared chaos more than tyranny and denied a right to revolt', isCorrect: true },
          { id: 'c', text: 'Yes, Hobbes thought rebellion was a citizen\'s highest duty', isCorrect: false },
          { id: 'd', text: 'No, because Hobbes wanted no sovereign at all', isCorrect: false },
        ],
        explanation: 'Tempting, but it was Locke who defended resistance. Hobbes saw even a harsh sovereign as better than a return to the war of all against all.',
      },
    },
    {
      type: 'summary',
      title: 'Rules Make Society Possible',
      keyPoints: [
        'State of nature: life with no common arbiter',
        'Hobbes: a war of every man against every man',
        'Social contract authorizes a sovereign for peace',
        'Without the sword, covenants are but words',
      ],
      closingThought: 'Political philosophy asks who should rule, and why we should obey.',
    },
  ],
};

export default lesson;
