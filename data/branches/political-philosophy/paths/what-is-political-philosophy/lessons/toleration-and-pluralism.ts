import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-20',
  slug: 'toleration-and-pluralism',
  title: 'Living Together While Disagreeing',
  description: 'A just society holds people who deeply disagree. The capstone: how is that even possible?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Free people will never agree on the good life.',
      subtext: 'So how can one society hold them together without anyone surrendering?',
      emoji: '🕊️',
    },
    {
      type: 'concept',
      title: 'Berlin: Goods Genuinely Clash',
      body: 'Isaiah Berlin called this value pluralism: liberty and equality, mercy and justice are all real goods, yet they can truly conflict. No single way of life can hold every good at once. So no one blueprint is right for everyone.',
      visual: '⚖️',
      highlight: 'value pluralism',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw these tensions up close.',
      body: 'Mill prized liberty and the harm principle; Marx and Sen pressed for equality and real capability. Each grasped a genuine good. Pluralism says they were not simply wrong about each other, they were tugging at goods that resist being maximized together.',
      emoji: '🧵',
    },
    {
      type: 'quote',
      id: 'lq-political-political-20-1',
      quote: 'A plurality of conflicting reasonable comprehensive doctrines is the normal result of the exercise of human reason within free institutions.',
      author: 'John Rawls',
      era: '1993',
      work: 'Political Liberalism',
      philosopherId: 'john-rawls',
    },
    {
      type: 'concept',
      title: 'Rawls: An Overlapping Consensus',
      body: 'Rawls accepts permanent disagreement, then asks for less. Not that we share a worldview, but that rival worldviews can each endorse the same fair public principles for their own reasons. That shared core is an overlapping consensus, and toleration is the art of sustaining it.',
      visual: '🤝',
      highlight: 'overlapping consensus',
    },
    {
      type: 'example',
      title: 'Why Reasonable People Differ',
      scenario: 'A devout believer and a secular humanist disagree about the meaning of life. Yet both can affirm free speech and equal protection, one from scripture, one from reason. They share the public rules without sharing the private faith. That overlap, not agreement, is what holds the society.',
      source: 'John Rawls, Political Liberalism (1993)',
      emoji: '🏛️',
    },
    {
      type: 'question',
      prompt: 'Sort Rawls’s path from deep disagreement to a stable, just society.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'p2', text: 'Notice the burdens of judgment: honest reasoners weighing hard questions reach different answers.' },
          { id: 'p1', text: 'Accept reasonable pluralism: free people will therefore permanently disagree about the good.' },
          { id: 'p3', text: 'Seek fair political principles that lean on no single worldview.' },
          { id: 'p4', text: 'Reach an overlapping consensus: rival doctrines each endorse those principles for their own reasons.' },
        ],
        correctOrder: ['p2', 'p1', 'p3', 'p4'],
        explanation: 'The burdens of judgment come first: they show disagreement is reasonable, not error — which is why pluralism is permanent. The tempting shortcut, "just enforce my values," skips the whole ladder. You must earn principles no doctrine owns, then build consensus on them.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Berlin: real goods can genuinely conflict',
        'Disagreement among free people is permanent',
        'Rawls: share fair principles, not worldviews',
        'Toleration is the political art of coexistence',
      ],
      closingThought: 'A just society does not end disagreement, it makes peaceful, principled disagreement possible.',
    },
  ],
};

export default lesson;
