import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-1',
  slug: 'why-societies-need-rules',
  title: 'Why Societies Need Rules',
  description: 'Discover why humans live under rules and governments rather than in isolation.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Strip away the rules, and a war of all against all remains.',
      subtext: 'Thomas Hobbes dared to imagine it — and the vision haunted him.',
      emoji: '⚔️',
    },
    {
      type: 'concept',
      title: 'The State of Nature',
      body: 'Thomas Hobbes posed a haunting question: imagine us with no government at all. He called this the "state of nature." His verdict was bleak. Stripped of rules, we would scramble against one another for survival, and life would be "solitary, poor, nasty, brutish, and short." Rules exist to hold that darkness back.',
      visual: '🌿',
      highlight: 'state of nature',
    },
    {
      type: 'example',
      title: 'Hobbes\' Nightmare Made Vivid',
      scenario: 'Picture waking tomorrow to find every law, every officer, every government simply gone. Nothing now restrains your neighbour from seizing your food, your home, your life — and nothing restrains you from doing the same. Hobbes believed it is precisely this shared dread that drives reasonable people to surrender power to a ruler. Whatever a ruler costs us, the alternative costs more.',
      source: 'Thomas Hobbes, Leviathan (1651)',
      emoji: '🏚️',
    },
    {
      type: 'concept',
      title: 'The Social Contract',
      body: 'The "social contract" suggests government is not simply forced upon us — quietly, we consent to it. We relinquish certain freedoms (we may not seize whatever we please) and receive in return security, cooperation, the very fabric of civilisation. Rules let strangers trust one another enough to trade, to build, and to share a common life.',
      visual: '🤝',
      highlight: 'social contract',
    },
    {
      type: 'question',
      prompt: 'In Hobbes\' eyes, why do people consent to rules and government?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because rulers are morally finer than those they rule', isCorrect: false },
          { id: 'b', text: 'Because a life without government would be perilous and brief', isCorrect: true },
          { id: 'c', text: 'Because we are gentle by nature and crave order', isCorrect: false },
          { id: 'd', text: 'Because the heavens command obedience to earthly kings', isCorrect: false },
        ],
        explanation: 'For Hobbes, it is cold self-interest, not virtue, that leads us to embrace government. The lawless "state of nature" is so menacing that almost any steady ruler is preferable to none at all.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve just seen how rules dissolve the problem of distrust.',
      body: 'The social contract is no document you ever signed — it is an idea, a way of seeing why government answers to reason. Each time we pause at a red light, we join a vast web of cooperation that holds only because the rest of us hold to it too.',
      emoji: '💡',
    },
    {
      type: 'question',
      prompt: 'True or false: Hobbes held that, left ungoverned, humans live in peace.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'Hobbes thought the reverse. Ungoverned, we turn on one another in a violent scramble to survive. That very fear is why he insisted on a powerful ruler to keep the peace.',
      },
    },
    {
      type: 'summary',
      title: 'Rules Make Civilisation Possible',
      keyPoints: [
        'The "state of nature" is life stripped of all government',
        'Hobbes warned such a life would be brutal and brief',
        'The social contract: we trade some freedom for safety',
        'Rules let strangers cooperate on a vast scale',
      ],
      closingThought: 'Every law you keep is a quiet vote for civilisation over chaos.',
    },
  ],
};

export default lesson;
