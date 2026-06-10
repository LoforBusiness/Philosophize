import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-9',
  slug: 'democracy-and-its-critics',
  title: 'Democracy and Its Critics',
  description: 'Rule by the people sounds obvious. Its sharpest doubters disagreed.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'What if the majority votes to crush a minority?',
      subtext: 'Democracy means rule by the people. But which people, over whom?',
      emoji: '🗳️',
    },
    {
      type: 'concept',
      title: 'Plato\'s Doubt',
      body: 'Plato distrusted democracy. Steering a ship needs a skilled pilot, not a vote of passengers. Govern by popularity, he warned, and flattery beats wisdom, opening the door to a demagogue.',
      visual: '⛵',
      highlight: 'demagogue',
    },
    {
      type: 'quote',
      id: 'lq-political-political-9-1',
      quote: 'Society can and does execute its own mandates: and if it issues wrong mandates, it practises a social tyranny more formidable than many kinds of political oppression.',
      author: 'John Stuart Mill',
      era: '1859',
      work: 'On Liberty',
    },
    {
      type: 'concept',
      title: 'Tyranny of the Majority',
      body: 'Mill and Tocqueville named democracy\'s inner danger: the majority can oppress the few, by law or by sheer social pressure. So liberal democracies cage the vote with rights the majority cannot touch.',
      visual: '🔒',
      highlight: 'tyranny of the majority',
    },
    {
      type: 'example',
      title: 'Why Courts Can Overrule Votes',
      scenario: 'A legislature passes a law silencing an unpopular group. A court strikes it down as a rights violation. Frustrating to the majority, yet by design: rights set limits a vote alone cannot override.',
      emoji: '⚖️',
    },
    {
      type: 'question',
      prompt: 'What problem do Mill and Tocqueville mean by "tyranny of the majority"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A king seizing power against the people\'s wishes', isCorrect: false },
          { id: 'b', text: 'The majority using its weight to oppress a minority', isCorrect: true },
          { id: 'c', text: 'A tiny elite outvoting the broad public', isCorrect: false },
          { id: 'd', text: 'Foreign powers interfering in an election', isCorrect: false },
        ],
        explanation: 'The danger is internal: a majority, through law or social pressure, crushing the few. That is why rights are placed beyond the reach of any single vote.',
      },
    },
    {
      type: 'question',
      prompt: 'Mill loved liberty, so surely he thought a pure majority vote should decide every question. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, Mill trusted majority votes to settle everything', isCorrect: false },
          { id: 'b', text: 'No, he feared majorities and shielded the individual from them', isCorrect: true },
          { id: 'c', text: 'Yes, Mill made the majority the final word on all matters', isCorrect: false },
          { id: 'd', text: 'No, because Mill rejected voting and elections entirely', isCorrect: false },
        ],
        explanation: 'The trap: loving liberty sounds like trusting the crowd. But Mill warned a majority can be a tyrant, so he carved out a protected sphere of individual liberty no vote may invade.',
      },
    },
    {
      type: 'summary',
      title: 'Democracy, Caged Wisely',
      keyPoints: [
        'Plato: ruling by vote can crown a demagogue',
        'Mill and Tocqueville: majorities can oppress',
        'Rights limit what a vote may do',
        'Liberal democracy fuses voting with protections',
      ],
      closingThought: 'A vote decides who rules; rights decide what no ruler, or majority, may do.',
    },
  ],
};

export default lesson;
